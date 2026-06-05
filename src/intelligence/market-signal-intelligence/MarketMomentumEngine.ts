/**
 * Market Momentum Engine
 *
 * Measures:
 *   - Rate of change
 *   - Acceleration
 *   - Direction
 *   - Persistence
 *   - Volatility
 *
 * ## Momentum Metrics
 *
 * | Metric | Description |
 * |--------|-------------|
 * | Rate of Change | Speed of value change |
 * | Acceleration | Change in rate (speeding up/slowing down) |
 * | Direction | Up, down, or flat |
 * | Persistence | How long trend has maintained |
 * | Volatility | Standard deviation of changes |
 */

import type {
  MarketMomentum,
  TimeSeriesPoint,
  MomentumConfig,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import { DEFAULT_MOMENTUM_CONFIG } from './types.js';

// ============================================================================
// MARKET MOMENTUM ENGINE
// ============================================================================

export class MarketMomentumEngine {
  private config: MomentumConfig;

  constructor(config: Partial<MomentumConfig> = {}) {
    this.config = { ...DEFAULT_MOMENTUM_CONFIG, ...config };
  }

  /**
   * Calculate momentum for an entity.
   */
  calculateMomentum(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    dataPoints: TimeSeriesPoint[]
  ): MarketMomentum | null {
    if (dataPoints.length < this.config.shortTermWindow) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate metrics
    const rateOfChange = this.calculateRateOfChange(sorted);
    const acceleration = this.calculateAcceleration(sorted);
    const direction = this.determineDirection(sorted);
    const persistence = this.calculatePersistence(sorted, direction);
    const volatility = this.calculateVolatility(sorted);

    // Calculate confidence
    const confidence = this.calculateConfidence(sorted);

    return {
      id: `momentum_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      rateOfChange,
      acceleration,
      direction,
      persistence,
      volatility,
      confidence,
      calculatedAt: Date.now(),
      timeWindow: {
        start: sorted[0].timestamp,
        end: sorted[sorted.length - 1].timestamp,
      },
    };
  }

  /**
   * Calculate momentum for multiple metrics.
   */
  calculateMultiMetricMomentum(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    metrics: Record<string, TimeSeriesPoint[]>
  ): Map<string, MarketMomentum> {
    const results = new Map<string, MarketMomentum>();

    for (const [metricName, dataPoints] of Object.entries(metrics)) {
      const momentum = this.calculateMomentum(entityId, entityType, dataPoints);
      if (momentum) {
        results.set(metricName, momentum);
      }
    }

    return results;
  }

  /**
   * Calculate rate of change.
   */
  private calculateRateOfChange(dataPoints: TimeSeriesPoint[]): number {
    const n = dataPoints.length;
    if (n < 2) return 0;

    // Use long-term window if available
    const windowSize = Math.min(this.config.longTermWindow, n);
    const recent = dataPoints.slice(-windowSize);

    const first = recent[0].value;
    const last = recent[recent.length - 1].value;

    // Calculate time span in days
    const timeSpanDays = (recent[recent.length - 1].timestamp - recent[0].timestamp) / (24 * 60 * 60 * 1000);

    if (timeSpanDays === 0) return 0;

    // Rate of change per day
    return (last - first) / timeSpanDays;
  }

  /**
   * Calculate acceleration (change in rate of change).
   */
  private calculateAcceleration(dataPoints: TimeSeriesPoint[]): number {
    const n = dataPoints.length;
    if (n < 4) return 0;

    // Split into two halves
    const mid = Math.floor(n / 2);
    const firstHalf = dataPoints.slice(0, mid);
    const secondHalf = dataPoints.slice(mid);

    // Calculate rate for each half
    const firstRate = this.calculateRateForWindow(firstHalf);
    const secondRate = this.calculateRateForWindow(secondHalf);

    // Acceleration is the difference in rates
    return secondRate - firstRate;
  }

  /**
   * Calculate rate for a specific window.
   */
  private calculateRateForWindow(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 2) return 0;

    const first = dataPoints[0].value;
    const last = dataPoints[dataPoints.length - 1].value;
    const timeSpanDays = (dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp) / (24 * 60 * 60 * 1000);

    return timeSpanDays > 0 ? (last - first) / timeSpanDays : 0;
  }

  /**
   * Determine direction of trend.
   */
  private determineDirection(dataPoints: TimeSeriesPoint[]): 'up' | 'down' | 'flat' {
    const n = dataPoints.length;
    if (n < 2) return 'flat';

    // Calculate slope using linear regression
    const x = dataPoints.map((_, i) => i);
    const y = dataPoints.map(p => p.value);

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;

    // Threshold for "flat"
    const threshold = 0.01;

    if (slope > threshold) return 'up';
    if (slope < -threshold) return 'down';
    return 'flat';
  }

  /**
   * Calculate persistence of trend.
   */
  private calculatePersistence(
    dataPoints: TimeSeriesPoint[],
    overallDirection: 'up' | 'down' | 'flat'
): number {
    if (dataPoints.length < 3) return 0.5;

    // Count consecutive moves in the same direction
    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < dataPoints.length; i++) {
      const diff = dataPoints[i].value - dataPoints[i - 1].value;
      const direction: 'up' | 'down' | 'flat' = diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'flat';

      if (direction === overallDirection && direction !== 'flat') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    // Persistence as ratio of streak to total points
    return Math.min(1, maxStreak / dataPoints.length);
  }

  /**
   * Calculate volatility (standard deviation of changes).
   */
  private calculateVolatility(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 2) return 0;

    // Calculate changes between consecutive points
    const changes: number[] = [];
    for (let i = 1; i < dataPoints.length; i++) {
      changes.push(dataPoints[i].value - dataPoints[i - 1].value);
    }

    // Calculate standard deviation
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((sum, c) => sum + (c - mean) ** 2, 0) / changes.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate confidence in momentum calculation.
   */
  private calculateConfidence(dataPoints: TimeSeriesPoint[]): number {
    // Based on data point confidence and quantity
    const avgConfidence = dataPoints.reduce((sum, p) => sum + p.confidence, 0) / dataPoints.length;
    const quantityFactor = Math.min(1, dataPoints.length / this.config.longTermWindow);

    return avgConfidence * 0.7 + quantityFactor * 0.3;
  }

  /**
   * Get momentum interpretation.
   */
  getMomentumInterpretation(momentum: MarketMomentum): string {
    const parts: string[] = [];

    // Direction
    parts.push(`Trending ${momentum.direction}`);

    // Speed
    if (Math.abs(momentum.rateOfChange) > 0.1) {
      parts.push(momentum.rateOfChange > 0 ? 'rapidly' : 'sharply');
    } else if (Math.abs(momentum.rateOfChange) > 0.01) {
      parts.push('moderately');
    } else {
      parts.push('slowly');
    }

    // Acceleration
    if (Math.abs(momentum.acceleration) > this.config.accelerationThreshold) {
      if (momentum.acceleration > 0 && momentum.direction === 'up') {
        parts.push('and accelerating');
      } else if (momentum.acceleration < 0 && momentum.direction === 'down') {
        parts.push('and decelerating');
      } else if (momentum.acceleration > 0 && momentum.direction === 'down') {
        parts.push('but slowing decline');
      } else {
        parts.push('but slowing growth');
      }
    }

    // Persistence
    if (momentum.persistence > this.config.persistenceThreshold) {
      parts.push('with high persistence');
    }

    return parts.join(' ');
  }

  /**
   * Check if momentum is strong.
   */
  isStrongMomentum(momentum: MarketMomentum): boolean {
    const strongRate = Math.abs(momentum.rateOfChange) > 0.05;
    const consistent = momentum.persistence > this.config.persistenceThreshold;
    const lowVolatility = momentum.volatility < 0.1;

    return strongRate && consistent && lowVolatility;
  }

  /**
   * Compare momentums.
   */
  compareMomentums(
    base: MarketMomentum,
    compare: MarketMomentum
  ): {
    rateDiff: number;
    directionChanged: boolean;
    persistenceDiff: number;
    strongerMomentum: 'base' | 'compare' | 'equal';
  } {
    const rateDiff = compare.rateOfChange - base.rateOfChange;
    const directionChanged = base.direction !== compare.direction;
    const persistenceDiff = compare.persistence - base.persistence;

    // Determine which has stronger momentum
    const baseStrength = Math.abs(base.rateOfChange) * base.persistence;
    const compareStrength = Math.abs(compare.rateOfChange) * compare.persistence;

    let strongerMomentum: 'base' | 'compare' | 'equal';
    if (Math.abs(baseStrength - compareStrength) < 0.01) {
      strongerMomentum = 'equal';
    } else if (baseStrength > compareStrength) {
      strongerMomentum = 'base';
    } else {
      strongerMomentum = 'compare';
    }

    return { rateDiff, directionChanged, persistenceDiff, strongerMomentum };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketMomentumEngine(
  config?: Partial<MomentumConfig>
): MarketMomentumEngine {
  return new MarketMomentumEngine(config);
}

export function quickCalculateMomentum(
  dataPoints: TimeSeriesPoint[]
): {
  rateOfChange: number;
  direction: 'up' | 'down' | 'flat';
  persistence: number;
} {
  const engine = new MarketMomentumEngine();
  const result = engine.calculateMomentum('quick', 'career', dataPoints);

  if (!result) {
    return { rateOfChange: 0, direction: 'flat', persistence: 0 };
  }

  return {
    rateOfChange: result.rateOfChange,
    direction: result.direction,
    persistence: result.persistence,
  };
}
