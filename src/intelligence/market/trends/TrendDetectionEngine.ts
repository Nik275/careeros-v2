/**
 * CareerOS Market Intelligence - Trend Detection Engine
 *
 * Detects trend direction and classification.
 *
 * Questions:
 * - Is demand increasing?
 * - Is salary increasing?
 * - Is skill demand increasing?
 * - Is industry growth increasing?
 *
 * Output: TrendClassification
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import {
  TrendClassification,
  classifyChange,
  getClassificationMetadata,
} from './models/TrendClassification';
import type { TrendAnalysis } from './models/TrendAnalysis';

/**
 * Configuration for trend detection.
 */
export interface TrendDetectionConfig {
  /** Minimum data points required */
  minDataPoints: number;

  /** Analysis period (days) */
  analysisPeriodDays: number;

  /** Volatility threshold for classification */
  volatilityThreshold: number;

  /** Minimum confidence required */
  minConfidence: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_TREND_DETECTION_CONFIG: TrendDetectionConfig = {
  minDataPoints: 5,
  analysisPeriodDays: 90,
  volatilityThreshold: 25,
  minConfidence: 40,
};

/**
 * Trend detection result.
 */
export interface TrendDetectionResult {
  /** Classification */
  classification: TrendClassification;

  /** Direction */
  direction: 'up' | 'down' | 'flat';

  /** Strength of trend (0-100) */
  strength: number;

  /** Percentage change over period */
  percentageChange: number;

  /** Absolute change */
  absoluteChange: number;

  /** Volatility measure */
  volatility: number;

  /** Start value */
  startValue: number;

  /** End value */
  endValue: number;

  /** Confidence in detection */
  confidence: number;

  /** Human-readable label */
  label: string;

  /** Explanation */
  explanation: string;
}

/**
 * Detects market trends from historical snapshots.
 */
export class TrendDetectionEngine {
  private config: TrendDetectionConfig;

  constructor(config?: Partial<TrendDetectionConfig>) {
    this.config = { ...DEFAULT_TREND_DETECTION_CONFIG, ...config };
  }

  /**
   * Detect trend from snapshots.
   */
  detectTrend(snapshots: TrendSnapshot[]): TrendDetectionResult | null {
    if (snapshots.length < this.config.minDataPoints) {
      return this.createEmergingResult(snapshots);
    }

    // Sort by timestamp
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Filter to analysis period
    const cutoff = Date.now() - this.config.analysisPeriodDays * 24 * 60 * 60 * 1000;
    const recent = sorted.filter((s) => s.timestamp.getTime() >= cutoff);

    if (recent.length < this.config.minDataPoints) {
      return this.createEmergingResult(sorted);
    }

    // Calculate change
    const start = recent[0];
    const end = recent[recent.length - 1];

    const absoluteChange = end.value - start.value;
    const percentageChange = start.value !== 0
      ? (absoluteChange / start.value) * 100
      : 0;

    // Calculate volatility
    const volatility = this.calculateVolatility(recent);

    // Classify
    const classification = classifyChange(percentageChange, volatility);

    // Calculate strength
    const strength = this.calculateStrength(percentageChange, volatility);

    // Determine direction
    const direction = this.determineDirection(classification, percentageChange);

    // Calculate confidence
    const confidence = this.calculateConfidence(recent);

    // Get metadata
    const metadata = getClassificationMetadata(classification);

    return {
      classification,
      direction,
      strength,
      percentageChange: Math.round(percentageChange * 10) / 10,
      absoluteChange: Math.round(absoluteChange * 10) / 10,
      volatility: Math.round(volatility * 10) / 10,
      startValue: start.value,
      endValue: end.value,
      confidence,
      label: metadata.label,
      explanation: this.generateExplanation(classification, percentageChange, volatility),
    };
  }

  /**
   * Detect trend for specific entity and metric.
   */
  detectEntityTrend(
    snapshots: TrendSnapshot[],
    entityId: string,
    metricType: string
  ): TrendDetectionResult | null {
    const filtered = snapshots.filter(
      (s) => s.entityId === entityId && s.metricType === metricType
    );

    return this.detectTrend(filtered);
  }

  /**
   * Batch detect trends for multiple entities.
   */
  detectTrends(
    snapshots: TrendSnapshot[],
    entityIds: string[],
    metricType: string
  ): Map<string, TrendDetectionResult | null> {
    const results = new Map<string, TrendDetectionResult | null>();

    for (const entityId of entityIds) {
      const result = this.detectEntityTrend(snapshots, entityId, metricType);
      results.set(entityId, result);
    }

    return results;
  }

  /**
   * Create result for emerging trend (insufficient data).
   */
  private createEmergingResult(snapshots: TrendSnapshot[]): TrendDetectionResult | null {
    if (snapshots.length === 0) return null;

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    return {
      classification: TrendClassification.EMERGING,
      direction: 'flat',
      strength: 0,
      percentageChange: 0,
      absoluteChange: 0,
      volatility: 0,
      startValue: start.value,
      endValue: end.value,
      confidence: 30,
      label: 'Emerging',
      explanation: 'Insufficient historical data to determine trend',
    };
  }

  /**
   * Calculate volatility from snapshots.
   */
  private calculateVolatility(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const values = snapshots.map((s) => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation
    return mean !== 0 ? (stdDev / mean) * 100 : 0;
  }

  /**
   * Calculate trend strength.
   */
  private calculateStrength(percentageChange: number, volatility: number): number {
    // Base strength on magnitude of change
    let strength = Math.min(100, Math.abs(percentageChange) * 2);

    // Reduce strength if high volatility
    if (volatility > this.config.volatilityThreshold) {
      strength *= 0.7;
    }

    return Math.round(strength);
  }

  /**
   * Determine trend direction.
   */
  private determineDirection(
    classification: TrendClassification,
    percentageChange: number
  ): 'up' | 'down' | 'flat' {
    switch (classification) {
      case TrendClassification.RAPID_GROWTH:
      case TrendClassification.GROWTH:
        return 'up';
      case TrendClassification.RAPID_DECLINE:
      case TrendClassification.DECLINING:
        return 'down';
      case TrendClassification.STABLE:
        return 'flat';
      case TrendClassification.VOLATILE:
        return percentageChange > 0 ? 'up' : 'down';
      case TrendClassification.EMERGING:
        return 'flat';
      default:
        return 'flat';
    }
  }

  /**
   * Calculate confidence in detection.
   */
  private calculateConfidence(snapshots: TrendSnapshot[]): number {
    if (snapshots.length === 0) return 0;

    // More data points = higher confidence
    const dataPointsConfidence = Math.min(100, snapshots.length * 10);

    // Average signal confidence
    const avgConfidence =
      snapshots.reduce((sum, s) => sum + s.confidence, 0) / snapshots.length;

    // Source diversity
    const sources = new Set(snapshots.flatMap((s) => s.sources)).size;
    const sourceConfidence = Math.min(100, sources * 20);

    return Math.round((dataPointsConfidence + avgConfidence + sourceConfidence) / 3);
  }

  /**
   * Generate human-readable explanation.
   */
  private generateExplanation(
    classification: TrendClassification,
    percentageChange: number,
    volatility: number
  ): string {
    const parts: string[] = [];

    const metadata = getClassificationMetadata(classification);
    parts.push(metadata.description);

    if (classification !== TrendClassification.EMERGING) {
      parts.push(`Change: ${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`);

      if (volatility > this.config.volatilityThreshold) {
        parts.push('High volatility observed.');
      }
    }

    return parts.join(' ');
  }

  /**
   * Detect trend changes over time.
   */
  detectTrendChanges(
    snapshots: TrendSnapshot[],
    windowSize: number = 7
  ): Array<{
    timestamp: Date;
    previousClassification: TrendClassification;
    newClassification: TrendClassification;
    significance: 'minor' | 'major' | 'critical';
  }> {
    const changes: Array<{
      timestamp: Date;
      previousClassification: TrendClassification;
      newClassification: TrendClassification;
      significance: 'minor' | 'major' | 'critical';
    }> = [];

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    let previousResult: TrendDetectionResult | null = null;

    for (let i = windowSize; i < sorted.length; i++) {
      const window = sorted.slice(i - windowSize, i);
      const result = this.detectTrend(window);

      if (result && previousResult) {
        if (result.classification !== previousResult.classification) {
          const significance = this.classifySignificance(
            previousResult.classification,
            result.classification
          );

          changes.push({
            timestamp: sorted[i].timestamp,
            previousClassification: previousResult.classification,
            newClassification: result.classification,
            significance,
          });
        }
      }

      previousResult = result;
    }

    return changes;
  }

  /**
   * Classify significance of trend change.
   */
  private classifySignificance(
    from: TrendClassification,
    to: TrendClassification
  ): 'minor' | 'major' | 'critical' {
    // Positive to negative or vice versa is critical
    const positive = ['RAPID_GROWTH', 'GROWTH'];
    const negative = ['RAPID_DECLINE', 'DECLINING'];

    const fromPositive = positive.includes(from);
    const toPositive = positive.includes(to);
    const fromNegative = negative.includes(from);
    const toNegative = negative.includes(to);

    if ((fromPositive && toNegative) || (fromNegative && toPositive)) {
      return 'critical';
    }

    // Growth to stable or stable to decline is major
    if (
      (from === 'GROWTH' && to === 'STABLE') ||
      (from === 'STABLE' && to === 'DECLINING')
    ) {
      return 'major';
    }

    return 'minor';
  }

  /**
   * Compare current trend to historical baseline.
   */
  compareToBaseline(
    current: TrendSnapshot[],
    baseline: TrendSnapshot[]
  ): {
    currentClassification: TrendClassification;
    baselineClassification: TrendClassification;
    comparison: 'improved' | 'worsened' | 'unchanged';
    delta: number;
  } | null {
    const currentResult = this.detectTrend(current);
    const baselineResult = this.detectTrend(baseline);

    if (!currentResult || !baselineResult) return null;

    // Compare percentage changes
    const delta = currentResult.percentageChange - baselineResult.percentageChange;

    let comparison: 'improved' | 'worsened' | 'unchanged';
    if (Math.abs(delta) < 5) {
      comparison = 'unchanged';
    } else if (delta > 0) {
      comparison = 'improved';
    } else {
      comparison = 'worsened';
    }

    return {
      currentClassification: currentResult.classification,
      baselineClassification: baselineResult.classification,
      comparison,
      delta: Math.round(delta * 10) / 10,
    };
  }
}

/**
 * Factory function for TrendDetectionEngine.
 */
export function createTrendDetectionEngine(
  config?: Partial<TrendDetectionConfig>
): TrendDetectionEngine {
  return new TrendDetectionEngine(config);
}
