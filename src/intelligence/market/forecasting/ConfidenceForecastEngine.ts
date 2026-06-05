/**
 * CareerOS Market Intelligence - Confidence Forecast Engine
 *
 * Estimates confidence in forecasts.
 *
 * Purpose:
 * - Quantify forecast uncertainty
 * - Enable risk-weighted decisions
 * - Track calibration over time
 *
 * Factors:
 * - Historical consistency
 * - Signal quality
 * - Trend persistence
 * - Evidence strength
 * - Model fit
 */

import type { ForecastConfidence, ConfidenceFactors } from './models/ForecastConfidence';
import { calculateConfidence, adjustConfidenceForHorizon } from './models/ForecastConfidence';
import type { ForecastEvidence } from './models/ForecastEvidence';
import { scoreEvidenceQuality } from './models/ForecastEvidence';

/**
 * Confidence engine configuration.
 */
export interface ConfidenceEngineConfig {
  /** Minimum data points for high confidence */
  minDataPoints: number;

  /** Minimum time range for high confidence (days) */
  minTimeRangeDays: number;

  /** Weight for historical consistency */
  historicalWeight: number;

  /** Weight for signal quality */
  signalWeight: number;

  /** Weight for trend persistence */
  persistenceWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceEngineConfig = {
  minDataPoints: 10,
  minTimeRangeDays: 90,
  historicalWeight: 0.3,
  signalWeight: 0.3,
  persistenceWeight: 0.4,
};

/**
 * Historical data point.
 */
export interface HistoricalDataPoint {
  /** Timestamp */
  timestamp: Date;

  /** Value */
  value: number;

  /** Data quality score */
  quality: number;
}

/**
 * Trend analysis result.
 */
export interface TrendAnalysis {
  /** Trend direction */
  direction: 'increasing' | 'decreasing' | 'stable';

  /** Trend strength (0-100) */
  strength: number;

  /** Trend consistency (0-100) */
  consistency: number;

  /** Volatility (0-100) */
  volatility: number;

  /** Acceleration */
  acceleration: number;
}

/**
 * Confidence calculation context.
 */
export interface ConfidenceContext {
  /** Historical data points */
  historicalData: HistoricalDataPoint[];

  /** Evidence used */
  evidence: ForecastEvidence[];

  /** Signal history */
  signals: Array<{
    timestamp: Date;
    strength: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;

  /** Model fit score (0-100) */
  modelFit: number;

  /** Forecast horizon in years */
  horizonYears: number;
}

/**
 * Confidence Forecast Engine.
 */
export class ConfidenceForecastEngine {
  private config: ConfidenceEngineConfig;

  constructor(config?: Partial<ConfidenceEngineConfig>) {
    this.config = { ...DEFAULT_CONFIDENCE_CONFIG, ...config };
  }

  /**
   * Calculate forecast confidence from context.
   */
  calculateConfidence(context: ConfidenceContext): ForecastConfidence {
    const factors = this.calculateFactors(context);
    const baseConfidence = calculateConfidence(factors);

    // Adjust for horizon
    const adjustedOverall = adjustConfidenceForHorizon(
      baseConfidence.overall,
      context.horizonYears
    );

    return {
      ...baseConfidence,
      overall: adjustedOverall,
    };
  }

  /**
   * Calculate individual confidence factors.
   */
  calculateFactors(context: ConfidenceContext): ConfidenceFactors {
    return {
      dataQuality: this.assessDataQuality(context.historicalData),
      historicalConsistency: this.assessHistoricalConsistency(context.historicalData),
      trendPersistence: this.assessTrendPersistence(context.signals),
      signalStrength: this.assessSignalStrength(context.signals),
      modelFit: context.modelFit,
    };
  }

  /**
   * Assess data quality.
   */
  assessDataQuality(data: HistoricalDataPoint[]): number {
    if (data.length === 0) return 0;

    // Check data volume
    const volumeScore = Math.min(100, (data.length / this.config.minDataPoints) * 100);

    // Check time range
    if (data.length >= 2) {
      const timestamps = data.map((d) => d.timestamp.getTime());
      const timeRange = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);
      const timeScore = Math.min(100, (timeRange / this.config.minTimeRangeDays) * 100);

      // Average quality
      const qualityScore =
        data.reduce((sum, d) => sum + d.quality, 0) / data.length;

      // Combined score
      return Math.round((volumeScore * 0.3 + timeScore * 0.3 + qualityScore * 0.4));
    }

    return Math.round(volumeScore * 0.5);
  }

  /**
   * Assess historical consistency.
   */
  assessHistoricalConsistency(data: HistoricalDataPoint[]): number {
    if (data.length < 3) return 30; // Low confidence with limited data

    const values = data.map((d) => d.value);

    // Calculate coefficient of variation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;

    // Lower CV = higher consistency
    // CV of 0 = 100 consistency, CV of 0.5 = 0 consistency
    const consistency = Math.max(0, Math.min(100, 100 - cv * 200));

    return Math.round(consistency);
  }

  /**
   * Assess trend persistence.
   */
  assessTrendPersistence(
    signals: Array<{
      timestamp: Date;
      strength: number;
      direction: 'positive' | 'negative' | 'neutral';
    }>
  ): number {
    if (signals.length < 3) return 40;

    // Check for consistent direction
    const directions = signals.map((s) => s.direction);
    const positiveCount = directions.filter((d) => d === 'positive').length;
    const negativeCount = directions.filter((d) => d === 'negative').length;
    const neutralCount = directions.filter((d) => d === 'neutral').length;

    const dominant = Math.max(positiveCount, negativeCount, neutralCount);
    const directionConsistency = (dominant / directions.length) * 100;

    // Check for consistent strength
    const strengths = signals.map((s) => s.strength);
    const avgStrength = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
    const strengthVariance =
      strengths.reduce((sum, s) => sum + Math.pow(s - avgStrength, 2), 0) /
      strengths.length;
    const strengthConsistency = Math.max(0, 100 - strengthVariance / 10);

    // Combined persistence score
    return Math.round(directionConsistency * 0.6 + strengthConsistency * 0.4);
  }

  /**
   * Assess signal strength.
   */
  assessSignalStrength(
    signals: Array<{
      timestamp: Date;
      strength: number;
      direction: 'positive' | 'negative' | 'neutral';
    }>
  ): number {
    if (signals.length === 0) return 0;

    // Average signal strength
    const avgStrength =
      signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

    // Recent signals weighted more heavily
    const now = Date.now();
    const weightedStrength = signals.reduce((sum, s) => {
      const age = (now - s.timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
      const weight = Math.max(0.5, 1 - age / 365); // Decay over 1 year
      return sum + s.strength * weight;
    }, 0);

    const weightedAvg = weightedStrength / signals.length;

    // Signal count bonus (diminishing returns)
    const countBonus = Math.min(20, signals.length * 2);

    return Math.round((avgStrength * 0.4 + weightedAvg * 0.4 + countBonus));
  }

  /**
   * Analyze trend characteristics.
   */
  analyzeTrend(data: HistoricalDataPoint[]): TrendAnalysis {
    if (data.length < 2) {
      return {
        direction: 'stable',
        strength: 0,
        consistency: 0,
        volatility: 50,
        acceleration: 0,
      };
    }

    // Sort by timestamp
    const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const values = sorted.map((d) => d.value);

    // Calculate trend direction
    const first = values[0]!;
    const last = values[values.length - 1]!;
    const change = last - first;

    let direction: TrendAnalysis['direction'];
    if (Math.abs(change) < 5) direction = 'stable';
    else if (change > 0) direction = 'increasing';
    else direction = 'decreasing';

    // Calculate trend strength
    const maxPossibleChange = 100;
    const strength = Math.min(100, Math.abs(change) / maxPossibleChange * 100);

    // Calculate consistency
    const consistency = this.assessHistoricalConsistency(data);

    // Calculate volatility
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const volatility = Math.min(100, Math.sqrt(variance) * 2);

    // Calculate acceleration (change in rate)
    let acceleration = 0;
    if (values.length >= 3) {
      const mid = Math.floor(values.length / 2);
      const firstHalfChange = values[mid]! - values[0]!;
      const secondHalfChange = values[values.length - 1]! - values[mid]!;
      acceleration = secondHalfChange - firstHalfChange;
    }

    return {
      direction,
      strength: Math.round(strength),
      consistency,
      volatility: Math.round(volatility),
      acceleration: Math.round(acceleration * 10) / 10,
    };
  }

  /**
   * Calculate confidence from evidence alone.
   */
  calculateEvidenceConfidence(evidence: ForecastEvidence[]): ForecastConfidence {
    const evidenceScore = scoreEvidenceQuality(evidence);

    // Map evidence score to confidence factors
    const factors: ConfidenceFactors = {
      dataQuality: evidenceScore,
      historicalConsistency: evidenceScore * 0.8, // Slightly lower without time series
      trendPersistence: 50, // Neutral without signal data
      signalStrength: evidenceScore * 0.9,
      modelFit: 60, // Moderate default
    };

    return calculateConfidence(factors);
  }

  /**
   * Estimate confidence decay over time.
   */
  estimateConfidenceDecay(
    initialConfidence: number,
    horizonYears: number
  ): number {
    // Confidence decays exponentially with time
    // Half-life of approximately 2 years
    const halfLife = 2;
    const decayFactor = Math.pow(0.5, horizonYears / halfLife);

    return Math.round(initialConfidence * decayFactor);
  }

  /**
   * Compare confidence levels.
   */
  compareConfidence(a: ForecastConfidence, b: ForecastConfidence): {
    higher: 'a' | 'b' | 'similar';
    difference: number;
    primaryFactor: keyof ConfidenceFactors;
  } {
    const difference = a.overall - b.overall;

    let higher: 'a' | 'b' | 'similar';
    if (difference > 10) higher = 'a';
    else if (difference < -10) higher = 'b';
    else higher = 'similar';

    // Find largest factor difference
    const factorDiffs: Array<{ key: keyof ConfidenceFactors; diff: number }> = [
      { key: 'dataQuality', diff: a.factors.dataQuality - b.factors.dataQuality },
      { key: 'historicalConsistency', diff: a.factors.historicalConsistency - b.factors.historicalConsistency },
      { key: 'trendPersistence', diff: a.factors.trendPersistence - b.factors.trendPersistence },
      { key: 'signalStrength', diff: a.factors.signalStrength - b.factors.signalStrength },
      { key: 'modelFit', diff: a.factors.modelFit - b.factors.modelFit },
    ];

    const primaryFactor = factorDiffs.reduce((max, current) =>
      Math.abs(current.diff) > Math.abs(max.diff) ? current : max
    );

    return {
      higher,
      difference: Math.abs(Math.round(difference)),
      primaryFactor: primaryFactor.key,
    };
  }
}

/**
 * Factory function for ConfidenceForecastEngine.
 */
export function createConfidenceForecastEngine(
  config?: Partial<ConfidenceEngineConfig>
): ConfidenceForecastEngine {
  return new ConfidenceForecastEngine(config);
}
