/**
 * CareerOS Market Intelligence - Acceleration Engine
 *
 * Measures change in momentum.
 *
 * Questions:
 * - Is growth accelerating?
 * - Is growth slowing?
 * - Is decline accelerating?
 *
 * Output: Acceleration score
 */

import type { TrendSnapshot } from './models/TrendSnapshot';

/**
 * Configuration for acceleration calculation.
 */
export interface AccelerationConfig {
  /** Short-term window (days) */
  shortWindow: number;

  /** Long-term window (days) */
  longWindow: number;

  /** Minimum data points per window */
  minDataPoints: number;

  /** Threshold for significant acceleration */
  significanceThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_ACCELERATION_CONFIG: AccelerationConfig = {
  shortWindow: 7,
  longWindow: 30,
  minDataPoints: 3,
  significanceThreshold: 10,
};

/**
 * Acceleration calculation result.
 */
export interface AccelerationResult {
  /** Entity identifier */
  entityId: string;

  /** Metric type */
  metricType: string;

  /** Acceleration score (-100 to +100) */
  score: number;

  /** Acceleration level */
  level: 'strong_deceleration' | 'deceleration' | 'stable' | 'acceleration' | 'strong_acceleration';

  /** Short-term momentum */
  shortTermMomentum: number;

  /** Long-term momentum */
  longTermMomentum: number;

  /** Difference between short and long term */
  momentumDelta: number;

  /** Direction of change */
  direction: 'accelerating' | 'decelerating' | 'stable';

  /** Confidence in acceleration measurement */
  confidence: number;

  /** Timestamp of calculation */
  calculatedAt: Date;
}

/**
 * Calculates trend acceleration.
 */
export class AccelerationEngine {
  private config: AccelerationConfig;

  constructor(config?: Partial<AccelerationConfig>) {
    this.config = { ...DEFAULT_ACCELERATION_CONFIG, ...config };
  }

  /**
   * Calculate acceleration from snapshots.
   */
  calculateAcceleration(snapshots: TrendSnapshot[]): AccelerationResult | null {
    if (snapshots.length < this.config.minDataPoints * 2) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate windows
    const now = Date.now();
    const shortCutoff = now - this.config.shortWindow * 24 * 60 * 60 * 1000;
    const longCutoff = now - this.config.longWindow * 24 * 60 * 60 * 1000;

    const shortTerm = sorted.filter((s) => s.timestamp.getTime() >= shortCutoff);
    const longTerm = sorted.filter((s) => s.timestamp.getTime() >= longCutoff);

    if (shortTerm.length < this.config.minDataPoints || longTerm.length < this.config.minDataPoints) {
      return null;
    }

    // Calculate momentums
    const shortMomentum = this.calculateWindowMomentum(shortTerm);
    const longMomentum = this.calculateWindowMomentum(longTerm);

    // Calculate acceleration
    const momentumDelta = shortMomentum - longMomentum;
    const score = this.normalizeAcceleration(momentumDelta);

    // Determine level
    const level = this.determineLevel(score);

    // Determine direction
    const direction = this.determineDirection(score);

    // Calculate confidence
    const confidence = this.calculateConfidence(shortTerm, longTerm);

    return {
      entityId: sorted[0].entityId,
      metricType: sorted[0].metricType,
      score: Math.round(score),
      level,
      shortTermMomentum: Math.round(shortMomentum),
      longTermMomentum: Math.round(longMomentum),
      momentumDelta: Math.round(momentumDelta * 10) / 10,
      direction,
      confidence: Math.round(confidence),
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate acceleration for specific entity.
   */
  calculateEntityAcceleration(
    snapshots: TrendSnapshot[],
    entityId: string,
    metricType: string
  ): AccelerationResult | null {
    const filtered = snapshots.filter(
      (s) => s.entityId === entityId && s.metricType === metricType
    );

    return this.calculateAcceleration(filtered);
  }

  /**
   * Calculate window momentum.
   */
  private calculateWindowMomentum(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const start = sorted[0].value;
    const end = sorted[sorted.length - 1].value;
    const change = end - start;

    // Normalize to 0-100
    return Math.min(100, Math.max(-100, change * 2));
  }

  /**
   * Normalize acceleration to -100 to +100 scale.
   */
  private normalizeAcceleration(momentumDelta: number): number {
    // Scale: ±50 momentum difference = ±100 acceleration
    const normalized = (momentumDelta / 50) * 100;
    return Math.min(100, Math.max(-100, normalized));
  }

  /**
   * Determine acceleration level.
   */
  private determineLevel(score: number): AccelerationResult['level'] {
    if (score >= 60) return 'strong_acceleration';
    if (score >= 20) return 'acceleration';
    if (score <= -60) return 'strong_deceleration';
    if (score <= -20) return 'deceleration';
    return 'stable';
  }

  /**
   * Determine direction.
   */
  private determineDirection(score: number): AccelerationResult['direction'] {
    if (score > 10) return 'accelerating';
    if (score < -10) return 'decelerating';
    return 'stable';
  }

  /**
   * Calculate confidence.
   */
  private calculateConfidence(
    shortTerm: TrendSnapshot[],
    longTerm: TrendSnapshot[]
  ): number {
    // Data quantity confidence
    const shortConfidence = Math.min(100, shortTerm.length * 20);
    const longConfidence = Math.min(100, longTerm.length * 10);

    // Signal quality confidence
    const avgShortConfidence =
      shortTerm.reduce((sum, s) => sum + s.confidence, 0) / shortTerm.length;
    const avgLongConfidence =
      longTerm.reduce((sum, s) => sum + s.confidence, 0) / longTerm.length;

    return (shortConfidence + longConfidence + avgShortConfidence + avgLongConfidence) / 4;
  }

  /**
   * Detect acceleration changes.
   */
  detectAccelerationChanges(
    snapshots: TrendSnapshot[],
    windowSize: number = 7
  ): Array<{
    timestamp: Date;
    previousLevel: AccelerationResult['level'];
    newLevel: AccelerationResult['level'];
    significance: 'minor' | 'major' | 'critical';
  }> {
    const changes: Array<{
      timestamp: Date;
      previousLevel: AccelerationResult['level'];
      newLevel: AccelerationResult['level'];
      significance: 'minor' | 'major' | 'critical';
    }> = [];

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    let previousResult: AccelerationResult | null = null;

    for (let i = this.config.longWindow; i < sorted.length; i++) {
      const window = sorted.slice(i - this.config.longWindow, i);
      const result = this.calculateAcceleration(window);

      if (result && previousResult) {
        if (result.level !== previousResult.level) {
          const significance = this.classifySignificance(
            previousResult.level,
            result.level
          );

          changes.push({
            timestamp: sorted[i].timestamp,
            previousLevel: previousResult.level,
            newLevel: result.level,
            significance,
          });
        }
      }

      previousResult = result;
    }

    return changes;
  }

  /**
   * Classify significance of acceleration change.
   */
  private classifySignificance(
    from: AccelerationResult['level'],
    to: AccelerationResult['level']
  ): 'minor' | 'major' | 'critical' {
    // Crossing zero is critical
    const fromPositive = ['acceleration', 'strong_acceleration'].includes(from);
    const toPositive = ['acceleration', 'strong_acceleration'].includes(to);
    const fromNegative = ['deceleration', 'strong_deceleration'].includes(from);
    const toNegative = ['deceleration', 'strong_deceleration'].includes(to);

    if ((fromPositive && toNegative) || (fromNegative && toPositive)) {
      return 'critical';
    }

    // Reaching strong levels is major
    if (
      (to === 'strong_acceleration' && from !== 'strong_acceleration') ||
      (to === 'strong_deceleration' && from !== 'strong_deceleration')
    ) {
      return 'major';
    }

    return 'minor';
  }

  /**
   * Compare acceleration between entities.
   */
  compareAcceleration(
    snapshots: TrendSnapshot[],
    entityA: string,
    entityB: string,
    metricType: string
  ): {
    entityA: AccelerationResult | null;
    entityB: AccelerationResult | null;
    difference: number;
    faster: 'a' | 'b' | 'similar';
  } | null {
    const accelA = this.calculateEntityAcceleration(snapshots, entityA, metricType);
    const accelB = this.calculateEntityAcceleration(snapshots, entityB, metricType);

    if (!accelA || !accelB) return null;

    const difference = accelA.score - accelB.score;
    const faster = Math.abs(difference) < 15 ? 'similar' : difference > 0 ? 'a' : 'b';

    return {
      entityA: accelA,
      entityB: accelB,
      difference: Math.round(difference),
      faster,
    };
  }

  /**
   * Interpret acceleration result.
   */
  interpretAcceleration(result: AccelerationResult): string {
    const parts: string[] = [];

    // Level
    parts.push(result.level.replace(/_/g, ' ').toUpperCase());

    // Direction
    if (result.direction !== 'stable') {
      parts.push(result.direction);
    }

    // Score
    parts.push(`(${result.score > 0 ? '+' : ''}${result.score})`);

    // Context
    if (result.shortTermMomentum > result.longTermMomentum) {
      parts.push('- Growth speeding up');
    } else if (result.shortTermMomentum < result.longTermMomentum) {
      parts.push('- Growth slowing down');
    }

    return parts.join(' ');
  }

  /**
   * Check if acceleration is significant.
   */
  isSignificant(result: AccelerationResult): boolean {
    return Math.abs(result.score) >= this.config.significanceThreshold;
  }

  /**
   * Predict future momentum based on acceleration.
   */
  projectMomentum(
    currentMomentum: number,
    acceleration: number,
    periods: number
  ): number {
    // Simple linear projection
    const projected = currentMomentum + acceleration * periods;
    return Math.min(100, Math.max(-100, projected));
  }
}

/**
 * Factory function for AccelerationEngine.
 */
export function createAccelerationEngine(
  config?: Partial<AccelerationConfig>
): AccelerationEngine {
  return new AccelerationEngine(config);
}
