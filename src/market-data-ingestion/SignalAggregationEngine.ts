/**
 * Signal Aggregation Engine
 *
 * Combines multiple normalized signals into aggregated market signals.
 *
 * Example:
 *   AI Engineer demand
 *   Source A = 85 (confidence: 0.9)
 *   Source B = 79 (confidence: 0.8)
 *   Source C = 88 (confidence: 0.95)
 *
 *   Generates:
 *     aggregatedValue: 0.84
 *     confidence: 0.88
 *     variance: 0.0015
 *     sourceCount: 3
 *
 * Design Principles:
 *   - Weighted aggregation by source trust
 *   - Statistical variance calculation
 *   - Confidence propagation
 *   - Time-window based aggregation
 */

import type {
  NormalizedMarketSignal,
  AggregatedMarketSignal,
  NormalizedEntityType,
  NormalizedSignalType,
  Timestamp,
} from './types.js';

// ============================================================================
// AGGREGATION METHODS
// ============================================================================

/**
 * Aggregation method types.
 */
export type AggregationMethod =
  | 'weighted-mean'
  | 'median'
  | 'trimmed-mean'
  | 'bayesian'
  | 'confidence-weighted';

/**
 * Aggregation options.
 */
export interface AggregationOptions {
  /** Aggregation method */
  method?: AggregationMethod;

  /** Time window for signals (ms) */
  timeWindowMs?: number;

  /** Minimum number of sources required */
  minSources?: number;

  /** Maximum number of sources to include */
  maxSources?: number;

  /** Outlier threshold (standard deviations) */
  outlierThreshold?: number;

  /** Whether to remove outliers */
  removeOutliers?: boolean;
}

// ============================================================================
// SIGNAL AGGREGATION ENGINE
// ============================================================================

/**
 * Engine for aggregating normalized market signals.
 */
export class SignalAggregationEngine {
  private options: Required<AggregationOptions>;

  constructor(options: AggregationOptions = {}) {
    this.options = {
      method: options.method ?? 'confidence-weighted',
      timeWindowMs: options.timeWindowMs ?? 30 * 24 * 60 * 60 * 1000, // 30 days
      minSources: options.minSources ?? 1,
      maxSources: options.maxSources ?? 10,
      outlierThreshold: options.outlierThreshold ?? 2.5,
      removeOutliers: options.removeOutliers ?? true,
    };
  }

  /**
   * Aggregate signals for a specific entity and signal type.
   */
  aggregate(
    signals: NormalizedMarketSignal[],
    entityType: NormalizedEntityType,
    entityId: string,
    signalType: NormalizedSignalType
  ): AggregatedMarketSignal | null {
    // Filter signals
    const filteredSignals = this.filterSignals(signals, entityType, entityId, signalType);

    if (filteredSignals.length < this.options.minSources) {
      return null;
    }

    // Remove outliers if enabled
    const cleanSignals = this.options.removeOutliers
      ? this.removeOutliers(filteredSignals)
      : filteredSignals;

    if (cleanSignals.length < this.options.minSources) {
      return null;
    }

    // Calculate aggregation
    const aggregatedValue = this.calculateAggregation(cleanSignals);
    const variance = this.calculateVariance(cleanSignals, aggregatedValue);
    const standardDeviation = Math.sqrt(variance);
    const confidence = this.calculateAggregateConfidence(cleanSignals);

    // Build contributing signals list
    const contributingSignals = cleanSignals.map(s => ({
      signalId: s.id,
      sourceId: s.source.id,
      sourceName: s.source.name,
      value: s.normalizedValue,
      weight: this.calculateWeight(s),
    }));

    // Determine time range
    const timestamps = cleanSignals.map(s => s.timestamp);
    const aggregationPeriod = {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps),
    };

    return {
      id: `aggregated_${entityType}_${entityId}_${signalType}_${Date.now()}`,
      entityType,
      entityId,
      signalType,
      aggregatedValue,
      confidence,
      variance,
      standardDeviation,
      sourceCount: cleanSignals.length,
      contributingSignals,
      aggregatedAt: Date.now(),
      aggregationPeriod,
      aggregationMethod: this.options.method,
    };
  }

  /**
   * Aggregate multiple signal types at once.
   */
  aggregateMultiple(
    signals: NormalizedMarketSignal[],
    entityType: NormalizedEntityType,
    entityId: string,
    signalTypes: NormalizedSignalType[]
  ): Map<NormalizedSignalType, AggregatedMarketSignal> {
    const results = new Map<NormalizedSignalType, AggregatedMarketSignal>();

    for (const signalType of signalTypes) {
      const aggregated = this.aggregate(signals, entityType, entityId, signalType);
      if (aggregated) {
        results.set(signalType, aggregated);
      }
    }

    return results;
  }

  /**
   * Aggregate all signal types for an entity.
   */
  aggregateAll(
    signals: NormalizedMarketSignal[],
    entityType: NormalizedEntityType,
    entityId: string
  ): Map<NormalizedSignalType, AggregatedMarketSignal> {
    // Get unique signal types
    const signalTypes = [...new Set(signals.map(s => s.signalType))];
    return this.aggregateMultiple(signals, entityType, entityId, signalTypes);
  }

  /**
   * Batch aggregate multiple entities.
   */
  aggregateBatch(
    signals: NormalizedMarketSignal[]
  ): Map<string, AggregatedMarketSignal> {
    const results = new Map<string, AggregatedMarketSignal>();

    // Group by entity + signal type
    const grouped = this.groupByEntityAndType(signals);

    for (const [key, groupSignals] of grouped) {
      const [entityType, entityId, signalType] = key.split(':');
      const aggregated = this.aggregate(
        groupSignals,
        entityType as NormalizedEntityType,
        entityId,
        signalType as NormalizedSignalType
      );
      if (aggregated) {
        results.set(key, aggregated);
      }
    }

    return results;
  }

  // ========================================================================
  // FILTERING
  // ========================================================================

  /**
   * Filter signals by criteria.
   */
  private filterSignals(
    signals: NormalizedMarketSignal[],
    entityType: NormalizedEntityType,
    entityId: string,
    signalType: NormalizedSignalType
  ): NormalizedMarketSignal[] {
    const now = Date.now();

    return signals
      .filter(s =>
        s.entityType === entityType &&
        s.entityId === entityId &&
        s.signalType === signalType &&
        (now - s.timestamp) <= this.options.timeWindowMs
      )
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, this.options.maxSources);
  }

  /**
   * Group signals by entity and type.
   */
  private groupByEntityAndType(
    signals: NormalizedMarketSignal[]
  ): Map<string, NormalizedMarketSignal[]> {
    const grouped = new Map<string, NormalizedMarketSignal[]>();

    for (const signal of signals) {
      const key = `${signal.entityType}:${signal.entityId}:${signal.signalType}`;
      const group = grouped.get(key) || [];
      group.push(signal);
      grouped.set(key, group);
    }

    return grouped;
  }

  // ========================================================================
  // OUTLIER HANDLING
  // ========================================================================

  /**
   * Remove outlier signals using z-score.
   */
  private removeOutliers(signals: NormalizedMarketSignal[]): NormalizedMarketSignal[] {
    if (signals.length < 3) return signals;

    const values = signals.map(s => s.normalizedValue);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return signals;

    return signals.filter(s => {
      const zScore = Math.abs(s.normalizedValue - mean) / stdDev;
      return zScore <= this.options.outlierThreshold;
    });
  }

  // ========================================================================
  // AGGREGATION CALCULATIONS
  // ========================================================================

  /**
   * Calculate aggregated value using selected method.
   */
  private calculateAggregation(signals: NormalizedMarketSignal[]): number {
    switch (this.options.method) {
      case 'weighted-mean':
        return this.weightedMean(signals);
      case 'median':
        return this.median(signals);
      case 'trimmed-mean':
        return this.trimmedMean(signals);
      case 'bayesian':
        return this.bayesianAggregation(signals);
      case 'confidence-weighted':
        return this.confidenceWeightedMean(signals);
      default:
        return this.confidenceWeightedMean(signals);
    }
  }

  /**
   * Weighted mean aggregation.
   */
  private weightedMean(signals: NormalizedMarketSignal[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of signals) {
      const weight = this.calculateWeight(signal);
      weightedSum += signal.normalizedValue * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Confidence-weighted mean.
   */
  private confidenceWeightedMean(signals: NormalizedMarketSignal[]): number {
    let totalConfidence = 0;
    let weightedSum = 0;

    for (const signal of signals) {
      const confidence = signal.confidence * signal.source.reliabilityScore;
      weightedSum += signal.normalizedValue * confidence;
      totalConfidence += confidence;
    }

    return totalConfidence > 0 ? weightedSum / totalConfidence : 0.5;
  }

  /**
   * Median aggregation.
   */
  private median(signals: NormalizedMarketSignal[]): number {
    const values = signals.map(s => s.normalizedValue).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    }
    return values[mid];
  }

  /**
   * Trimmed mean (remove top/bottom 10%).
   */
  private trimmedMean(signals: NormalizedMarketSignal[]): number {
    if (signals.length < 5) return this.weightedMean(signals);

    const sorted = [...signals].sort((a, b) => a.normalizedValue - b.normalizedValue);
    const trimCount = Math.floor(signals.length * 0.1);
    const trimmed = sorted.slice(trimCount, -trimCount || undefined);

    return this.weightedMean(trimmed);
  }

  /**
   * Bayesian aggregation (simplified).
   */
  private bayesianAggregation(signals: NormalizedMarketSignal[]): number {
    // Prior: uniform distribution centered at 0.5
    const priorMean = 0.5;
    const priorPrecision = 1; // Inverse variance

    // Update with each signal
    let posteriorMean = priorMean;
    let posteriorPrecision = priorPrecision;

    for (const signal of signals) {
      const likelihoodPrecision = signal.confidence * signal.source.reliabilityScore * 10;
      posteriorPrecision += likelihoodPrecision;
      posteriorMean = (posteriorMean * posteriorPrecision + signal.normalizedValue * likelihoodPrecision) /
        (posteriorPrecision + likelihoodPrecision);
    }

    return posteriorMean;
  }

  /**
   * Calculate weight for a signal.
   */
  private calculateWeight(signal: NormalizedMarketSignal): number {
    // Weight based on:
    // - Signal confidence
    // - Source reliability
    // - Recency (time decay)
    const ageDays = (Date.now() - signal.timestamp) / (24 * 60 * 60 * 1000);
    const recencyWeight = Math.exp(-ageDays / 30); // Decay over 30 days

    return signal.confidence * signal.source.reliabilityScore * recencyWeight;
  }

  // ========================================================================
  // STATISTICAL CALCULATIONS
  // ========================================================================

  /**
   * Calculate variance.
   */
  private calculateVariance(signals: NormalizedMarketSignal[], mean: number): number {
    if (signals.length < 2) return 0;

    const squaredDiffs = signals.map(s => Math.pow(s.normalizedValue - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / signals.length;
  }

  /**
   * Calculate aggregate confidence.
   */
  private calculateAggregateConfidence(signals: NormalizedMarketSignal[]): number {
    // Aggregate confidence based on:
    // - Number of sources
    // - Individual confidences
    // - Agreement between sources

    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const avgReliability = signals.reduce((sum, s) => sum + s.source.reliabilityScore, 0) / signals.length;

    // Source count factor (diminishing returns after 5)
    const countFactor = Math.min(signals.length / 5, 1);

    // Agreement factor (lower variance = higher confidence)
    const values = signals.map(s => s.normalizedValue);
    const variance = this.calculateVariance(signals, values.reduce((a, b) => a + b, 0) / values.length);
    const agreementFactor = Math.exp(-variance * 10); // Higher variance = lower agreement

    return Math.min(1, avgConfidence * avgReliability * (0.6 + 0.2 * countFactor + 0.2 * agreementFactor));
  }

  // ========================================================================
  // STATISTICS
  // ========================================================================

  /**
   * Get aggregation statistics.
   */
  getStats(): {
    method: AggregationMethod;
    timeWindowMs: number;
    minSources: number;
    maxSources: number;
    outlierThreshold: number;
    removeOutliers: boolean;
  } {
    return { ...this.options };
  }

  /**
   * Update options.
   */
  updateOptions(options: Partial<AggregationOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new SignalAggregationEngine.
 */
export function createSignalAggregationEngine(
  options?: AggregationOptions
): SignalAggregationEngine {
  return new SignalAggregationEngine(options);
}

/**
 * Quick aggregate signals.
 */
export function quickAggregate(
  signals: NormalizedMarketSignal[],
  entityType: NormalizedEntityType,
  entityId: string,
  signalType: NormalizedSignalType,
  options?: AggregationOptions
): AggregatedMarketSignal | null {
  const engine = new SignalAggregationEngine(options);
  return engine.aggregate(signals, entityType, entityId, signalType);
}

/**
 * Aggregate with simple weighted mean.
 */
export function weightedMean(
  signals: NormalizedMarketSignal[]
): { value: number; confidence: number; variance: number } {
  const engine = new SignalAggregationEngine({ method: 'weighted-mean' });
  const result = engine.aggregate(
    signals,
    signals[0]?.entityType ?? 'career',
    signals[0]?.entityId ?? '',
    signals[0]?.signalType ?? 'demand'
  );

  if (!result) {
    return { value: 0.5, confidence: 0, variance: 0 };
  }

  return {
    value: result.aggregatedValue,
    confidence: result.confidence,
    variance: result.variance,
  };
}
