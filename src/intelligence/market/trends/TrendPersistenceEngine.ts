/**
 * CareerOS Market Intelligence - Trend Persistence Engine
 *
 * Determines whether trend is temporary or durable.
 *
 * Example:
 * - One-month spike → Low persistence
 * - Three-year growth → High persistence
 *
 * Output: Persistence score (0-100)
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import { TrendClassification } from './models/TrendClassification';

/**
 * Configuration for persistence calculation.
 */
export interface PersistenceConfig {
  /** Minimum duration for durability (days) */
  minDurableDuration: number;

  /** Analysis period (days) */
  analysisPeriod: number;

  /** Consistency threshold for high persistence */
  consistencyThreshold: number;

  /** Minimum data points required */
  minDataPoints: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  minDurableDuration: 90, // 3 months
  analysisPeriod: 180, // 6 months
  consistencyThreshold: 70,
  minDataPoints: 10,
};

/**
 * Persistence calculation result.
 */
export interface PersistenceResult {
  /** Entity identifier */
  entityId: string;

  /** Metric type */
  metricType: string;

  /** Persistence score (0-100) */
  score: number;

  /** Persistence level */
  level: 'temporary' | 'short_term' | 'medium_term' | 'durable' | 'structural';

  /** Duration of trend (days) */
  duration: number;

  /** Trend consistency (0-100) */
  consistency: number;

  /** Whether trend is likely to continue */
  likelyToContinue: boolean;

  /** Confidence in persistence assessment */
  confidence: number;

  /** Factors supporting durability */
  supportingFactors: string[];

  /** Factors undermining durability */
  underminingFactors: string[];

  /** Timestamp of calculation */
  calculatedAt: Date;
}

/**
 * Calculates trend persistence.
 */
export class TrendPersistenceEngine {
  private config: PersistenceConfig;

  constructor(config?: Partial<PersistenceConfig>) {
    this.config = { ...DEFAULT_PERSISTENCE_CONFIG, ...config };
  }

  /**
   * Calculate persistence from snapshots.
   */
  calculatePersistence(snapshots: TrendSnapshot[]): PersistenceResult | null {
    if (snapshots.length < this.config.minDataPoints) {
      return this.createTemporaryResult(snapshots);
    }

    // Sort by timestamp
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate duration
    const duration =
      (sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime()) /
      (1000 * 60 * 60 * 24);

    // Calculate consistency
    const consistency = this.calculateConsistency(sorted);

    // Analyze supporting factors
    const supportingFactors = this.identifySupportingFactors(sorted, duration, consistency);

    // Analyze undermining factors
    const underminingFactors = this.identifyUnderminingFactors(sorted, duration);

    // Calculate base persistence score
    let score = this.calculateBaseScore(duration, consistency);

    // Apply factor adjustments
    score += supportingFactors.length * 5;
    score -= underminingFactors.length * 5;

    score = Math.min(100, Math.max(0, score));

    // Determine level
    const level = this.determineLevel(score, duration);

    // Determine likelihood of continuation
    const likelyToContinue = score >= 60 && consistency >= this.config.consistencyThreshold;

    // Calculate confidence
    const confidence = this.calculateConfidence(sorted, duration);

    return {
      entityId: sorted[0].entityId,
      metricType: sorted[0].metricType,
      score: Math.round(score),
      level,
      duration: Math.round(duration),
      consistency,
      likelyToContinue,
      confidence: Math.round(confidence),
      supportingFactors,
      underminingFactors,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate persistence for specific entity.
   */
  calculateEntityPersistence(
    snapshots: TrendSnapshot[],
    entityId: string,
    metricType: string
  ): PersistenceResult | null {
    const filtered = snapshots.filter(
      (s) => s.entityId === entityId && s.metricType === metricType
    );

    return this.calculatePersistence(filtered);
  }

  /**
   * Create result for temporary/insufficient data.
   */
  private createTemporaryResult(snapshots: TrendSnapshot[]): PersistenceResult | null {
    if (snapshots.length === 0) return null;

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const duration =
      snapshots.length > 1
        ? (sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime()) /
          (1000 * 60 * 60 * 24)
        : 0;

    return {
      entityId: sorted[0].entityId,
      metricType: sorted[0].metricType,
      score: 20,
      level: 'temporary',
      duration: Math.round(duration),
      consistency: 50,
      likelyToContinue: false,
      confidence: 30,
      supportingFactors: [],
      underminingFactors: ['Insufficient historical data'],
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate trend consistency.
   */
  private calculateConsistency(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 3) return 50;

    const values = snapshots.map((s) => s.value);

    // Calculate coefficient of variation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? (stdDev / mean) * 100 : 0;

    // Invert: lower CV = higher consistency
    const consistency = Math.max(0, 100 - cv);

    return Math.round(consistency);
  }

  /**
   * Calculate base persistence score.
   */
  private calculateBaseScore(duration: number, consistency: number): number {
    // Duration component (0-60 points)
    const durationScore = Math.min(60, (duration / this.config.minDurableDuration) * 60);

    // Consistency component (0-40 points)
    const consistencyScore = (consistency / 100) * 40;

    return durationScore + consistencyScore;
  }

  /**
   * Identify factors supporting durability.
   */
  private identifySupportingFactors(
    snapshots: TrendSnapshot[],
    duration: number,
    consistency: number
  ): string[] {
    const factors: string[] = [];

    if (duration >= this.config.minDurableDuration) {
      factors.push('Sustained over ' + Math.round(duration / 30) + ' months');
    }

    if (consistency >= this.config.consistencyThreshold) {
      factors.push('High consistency in trend direction');
    }

    // Check for accelerating trend
    const firstHalf = snapshots.slice(0, Math.floor(snapshots.length / 2));
    const secondHalf = snapshots.slice(Math.floor(snapshots.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.value, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) {
      factors.push('Accelerating trend indicates durability');
    }

    // Check signal diversity
    const sources = new Set(snapshots.flatMap((s) => s.sources)).size;
    if (sources >= 3) {
      factors.push('Multiple data sources confirm trend');
    }

    return factors;
  }

  /**
   * Identify factors undermining durability.
   */
  private identifyUnderminingFactors(
    snapshots: TrendSnapshot[],
    duration: number
  ): string[] {
    const factors: string[] = [];

    if (duration < 30) {
      factors.push('Very short observation period');
    } else if (duration < this.config.minDurableDuration) {
      factors.push('Duration below durability threshold');
    }

    // Check for volatility
    const values = snapshots.map((s) => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = mean !== 0 ? (Math.sqrt(variance) / mean) * 100 : 0;

    if (cv > 25) {
      factors.push('High volatility suggests instability');
    }

    // Check for recent reversal
    if (snapshots.length >= 5) {
      const recent = snapshots.slice(-5);
      const earlier = snapshots.slice(0, -5);

      const recentTrend = recent[recent.length - 1].value - recent[0].value;
      const earlierTrend = earlier[earlier.length - 1].value - earlier[0].value;

      if (recentTrend * earlierTrend < 0) {
        factors.push('Recent trend reversal detected');
      }
    }

    // Check for single-source data
    const sources = new Set(snapshots.flatMap((s) => s.sources)).size;
    if (sources === 1) {
      factors.push('Single data source limits confidence');
    }

    return factors;
  }

  /**
   * Determine persistence level.
   */
  private determineLevel(score: number, duration: number): PersistenceResult['level'] {
    if (score >= 80 && duration >= 180) return 'structural';
    if (score >= 60) return 'durable';
    if (score >= 40) return 'medium_term';
    if (score >= 20) return 'short_term';
    return 'temporary';
  }

  /**
   * Calculate confidence.
   */
  private calculateConfidence(snapshots: TrendSnapshot[], duration: number): number {
    // Data quantity
    const dataConfidence = Math.min(100, snapshots.length * 5);

    // Duration confidence
    const durationConfidence = Math.min(100, (duration / 90) * 100);

    // Signal quality
    const avgSignalConfidence =
      snapshots.reduce((sum, s) => sum + s.confidence, 0) / snapshots.length;

    return Math.round((dataConfidence + durationConfidence + avgSignalConfidence) / 3);
  }

  /**
   * Compare persistence between entities.
   */
  comparePersistence(
    snapshots: TrendSnapshot[],
    entityA: string,
    entityB: string,
    metricType: string
  ): {
    entityA: PersistenceResult | null;
    entityB: PersistenceResult | null;
    morePersistent: 'a' | 'b' | 'similar';
    difference: number;
  } | null {
    const persA = this.calculateEntityPersistence(snapshots, entityA, metricType);
    const persB = this.calculateEntityPersistence(snapshots, entityB, metricType);

    if (!persA || !persB) return null;

    const difference = persA.score - persB.score;
    const morePersistent = Math.abs(difference) < 15 ? 'similar' : difference > 0 ? 'a' : 'b';

    return {
      entityA: persA,
      entityB: persB,
      morePersistent,
      difference: Math.round(difference),
    };
  }

  /**
   * Assess trend durability over time.
   */
  assessDurabilityOverTime(
    snapshots: TrendSnapshot[],
    windowSize: number = 30
  ): Array<{
    timestamp: Date;
    persistence: number;
    level: PersistenceResult['level'];
    likelyToContinue: boolean;
  }> {
    const assessments: Array<{
      timestamp: Date;
      persistence: number;
      level: PersistenceResult['level'];
      likelyToContinue: boolean;
    }> = [];

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (let i = windowSize; i < sorted.length; i += windowSize / 2) {
      const window = sorted.slice(Math.max(0, i - windowSize), i);
      const result = this.calculatePersistence(window);

      if (result) {
        assessments.push({
          timestamp: sorted[i].timestamp,
          persistence: result.score,
          level: result.level,
          likelyToContinue: result.likelyToContinue,
        });
      }
    }

    return assessments;
  }

  /**
   * Predict trend stability.
   */
  predictStability(result: PersistenceResult): {
    stability: 'unstable' | 'moderately_stable' | 'stable' | 'highly_stable';
    confidence: number;
    reasoning: string;
  } {
    let stability: 'unstable' | 'moderately_stable' | 'stable' | 'highly_stable';
    let reasoning: string;

    if (result.score >= 80) {
      stability = 'highly_stable';
      reasoning = 'Long duration and high consistency indicate structural change';
    } else if (result.score >= 60) {
      stability = 'stable';
      reasoning = 'Well-established trend with good durability';
    } else if (result.score >= 40) {
      stability = 'moderately_stable';
      reasoning = 'Moderate persistence, monitor for changes';
    } else {
      stability = 'unstable';
      reasoning = 'Short duration or inconsistent trend suggests volatility';
    }

    return {
      stability,
      confidence: result.confidence,
      reasoning,
    };
  }

  /**
   * Interpret persistence result.
   */
  interpretPersistence(result: PersistenceResult): string {
    const parts: string[] = [];

    parts.push(result.level.toUpperCase().replace(/_/g, ' '));
    parts.push(`(${result.score}/100)`);

    if (result.likelyToContinue) {
      parts.push('- Likely to continue');
    } else {
      parts.push('- May be temporary');
    }

    parts.push(`(${result.duration} days observed)`);

    return parts.join(' ');
  }
}

/**
 * Factory function for TrendPersistenceEngine.
 */
export function createTrendPersistenceEngine(
  config?: Partial<PersistenceConfig>
): TrendPersistenceEngine {
  return new TrendPersistenceEngine(config);
}
