/**
 * CareerOS Market Intelligence - Market Signal Engine
 *
 * Processes raw market signals:
 * - Normalizes signals
 * - Removes noise
 * - Validates signals
 * - Converts evidence into standardized scores
 */

import type {
  MarketSignal,
  NormalizedMarketSignal,
  AggregateMarketSignal,
  MarketSignalType,
  MarketSignalSource,
} from './models/MarketSignal';
import type { MarketRepository } from './repositories/MarketRepository';
import {
  SIGNAL_TYPE_WEIGHTS,
  SOURCE_RELIABILITY_WEIGHTS,
  getSignalFreshnessWeight,
  getSourceReliabilityWeight,
} from './constants/MarketWeights';

/**
 * Configuration for MarketSignalEngine.
 */
export interface MarketSignalEngineConfig {
  /** Minimum signal strength to process */
  minSignalStrength: number;

  /** Maximum signal age (days) */
  maxSignalAgeDays: number;

  /** Outlier threshold (standard deviations) */
  outlierThreshold: number;

  /** Minimum confidence for valid signal */
  minConfidence: number;

  /** Enable outlier detection */
  enableOutlierDetection: boolean;

  /** Enable source validation */
  enableSourceValidation: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_MARKET_SIGNAL_ENGINE_CONFIG: MarketSignalEngineConfig = {
  minSignalStrength: 5,
  maxSignalAgeDays: 365,
  outlierThreshold: 3,
  minConfidence: 20,
  enableOutlierDetection: true,
  enableSourceValidation: true,
};

/**
 * Signal validation result.
 */
export interface SignalValidationResult {
  isValid: boolean;
  issues: string[];
  normalizedStrength: number;
  weight: number;
}

/**
 * Signal processing result.
 */
export interface SignalProcessingResult {
  processed: number;
  normalized: NormalizedMarketSignal[];
  rejected: Array<{ signal: MarketSignal; reason: string }>;
  aggregated: AggregateMarketSignal[];
}

/**
 * Processes raw market signals into normalized intelligence.
 */
export class MarketSignalEngine {
  private config: MarketSignalEngineConfig;
  private repository: MarketRepository;

  constructor(repository: MarketRepository, config?: Partial<MarketSignalEngineConfig>) {
    this.repository = repository;
    this.config = { ...DEFAULT_MARKET_SIGNAL_ENGINE_CONFIG, ...config };
  }

  /**
   * Process a batch of raw signals.
   */
  async processSignals(signals: MarketSignal[]): Promise<SignalProcessingResult> {
    const rejected: Array<{ signal: MarketSignal; reason: string }> = [];
    const normalized: NormalizedMarketSignal[] = [];

    for (const signal of signals) {
      // Validate signal
      const validation = this.validateSignal(signal);

      if (!validation.isValid) {
        rejected.push({
          signal,
          reason: validation.issues.join('; '),
        });
        continue;
      }

      // Normalize signal
      const normalizedSignal = this.normalizeSignal(signal, validation);
      normalized.push(normalizedSignal);

      // Save normalized signal
      await this.repository.saveNormalizedSignal(normalizedSignal);
    }

    // Aggregate signals by career and type
    const aggregated = await this.aggregateSignals(normalized);

    return {
      processed: signals.length,
      normalized,
      rejected,
      aggregated,
    };
  }

  /**
   * Process a single signal.
   */
  async processSignal(signal: MarketSignal): Promise<NormalizedMarketSignal | null> {
    const validation = this.validateSignal(signal);

    if (!validation.isValid) {
      return null;
    }

    const normalized = this.normalizeSignal(signal, validation);
    await this.repository.saveNormalizedSignal(normalized);

    return normalized;
  }

  /**
   * Validate a signal.
   */
  validateSignal(signal: MarketSignal): SignalValidationResult {
    const issues: string[] = [];

    // Check signal age
    const ageDays = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > this.config.maxSignalAgeDays) {
      issues.push(`Signal too old (${Math.round(ageDays)} days)`);
    }

    // Check minimum confidence
    if (signal.confidence < this.config.minConfidence) {
      issues.push(`Confidence too low (${signal.confidence})`);
    }

    // Check minimum strength
    if (Math.abs(signal.strength) < this.config.minSignalStrength) {
      issues.push(`Strength too low (${signal.strength})`);
    }

    // Validate source
    if (this.config.enableSourceValidation) {
      if (!SOURCE_RELIABILITY_WEIGHTS[signal.source]) {
        issues.push(`Unknown source: ${signal.source}`);
      }
    }

    // Calculate normalized strength
    const normalizedStrength = this.calculateNormalizedStrength(signal);

    // Calculate weight
    const weight = this.calculateSignalWeight(signal);

    return {
      isValid: issues.length === 0,
      issues,
      normalizedStrength,
      weight,
    };
  }

  /**
   * Normalize a signal.
   */
  normalizeSignal(
    signal: MarketSignal,
    validation: SignalValidationResult
  ): NormalizedMarketSignal {
    const direction: NormalizedMarketSignal['direction'] =
      signal.strength > 0 ? 'positive' : signal.strength < 0 ? 'negative' : 'neutral';

    return {
      ...signal,
      normalizedStrength: validation.normalizedStrength,
      direction,
      weight: validation.weight,
      processedAt: new Date(),
      validation: {
        isValid: validation.isValid,
        issues: validation.issues,
      },
    };
  }

  /**
   * Calculate normalized signal strength (0-100).
   */
  private calculateNormalizedStrength(signal: MarketSignal): number {
    // Get signal type weight
    const typeWeight = SIGNAL_TYPE_WEIGHTS[signal.signalType] ?? 1.0;

    // Get source reliability
    const sourceReliability = getSourceReliabilityWeight(signal.source);

    // Get freshness weight
    const ageDays = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessWeight = getSignalFreshnessWeight(ageDays);

    // Calculate composite weight
    const compositeWeight = typeWeight * sourceReliability * freshnessWeight;

    // Normalize strength to 0-100 (absolute value)
    const absoluteStrength = Math.abs(signal.strength);

    // Apply weight
    return Math.min(100, absoluteStrength * compositeWeight);
  }

  /**
   * Calculate signal weight for aggregation.
   */
  private calculateSignalWeight(signal: MarketSignal): number {
    const sourceReliability = getSourceReliabilityWeight(signal.source);
    const ageDays = (Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessWeight = getSignalFreshnessWeight(ageDays);

    return signal.confidence * sourceReliability * freshnessWeight;
  }

  /**
   * Aggregate signals by career and type.
   */
  async aggregateSignals(
    signals: NormalizedMarketSignal[]
  ): Promise<AggregateMarketSignal[]> {
    // Group by career and type
    const grouped = new Map<string, NormalizedMarketSignal[]>();

    for (const signal of signals) {
      const key = `${signal.careerId}:${signal.signalType}`;
      const existing = grouped.get(key) ?? [];
      existing.push(signal);
      grouped.set(key, existing);
    }

    const aggregated: AggregateMarketSignal[] = [];

    for (const [key, groupSignals] of grouped) {
      const [careerId, signalType] = key.split(':') as [string, MarketSignalType];

      // Calculate weighted average
      let totalWeight = 0;
      let weightedSum = 0;

      for (const signal of groupSignals) {
        totalWeight += signal.weight;
        weightedSum += signal.normalizedStrength * signal.weight;
      }

      const aggregatedStrength = totalWeight > 0 ? weightedSum / totalWeight : 0;

      // Calculate confidence based on signal count and quality
      const avgConfidence =
        groupSignals.reduce((sum, s) => sum + s.confidence, 0) / groupSignals.length;
      const confidence = Math.min(100, avgConfidence * Math.min(1, groupSignals.length / 3));

      // Get time range
      const timestamps = groupSignals.map((s) => s.timestamp.getTime());
      const start = new Date(Math.min(...timestamps));
      const end = new Date(Math.max(...timestamps));

      const aggregate: AggregateMarketSignal = {
        careerId,
        signalType,
        aggregatedStrength: Math.round(aggregatedStrength),
        confidence: Math.round(confidence),
        signalCount: groupSignals.length,
        sources: [...new Set(groupSignals.map((s) => s.source))],
        timeRange: { start, end },
        lastUpdated: new Date(),
      };

      aggregated.push(aggregate);
      await this.repository.saveAggregateSignal(aggregate);
    }

    return aggregated;
  }

  /**
   * Detect and filter outliers.
   */
  detectOutliers(signals: MarketSignal[]): {
    valid: MarketSignal[];
    outliers: MarketSignal[];
  } {
    if (!this.config.enableOutlierDetection || signals.length < 5) {
      return { valid: signals, outliers: [] };
    }

    // Group by career and type
    const grouped = new Map<string, MarketSignal[]>();
    for (const signal of signals) {
      const key = `${signal.careerId}:${signal.signalType}`;
      const existing = grouped.get(key) ?? [];
      existing.push(signal);
      grouped.set(key, existing);
    }

    const valid: MarketSignal[] = [];
    const outliers: MarketSignal[] = [];

    for (const groupSignals of grouped.values()) {
      if (groupSignals.length < 5) {
        valid.push(...groupSignals);
        continue;
      }

      // Calculate mean and standard deviation
      const strengths = groupSignals.map((s) => s.strength);
      const mean = strengths.reduce((a, b) => a + b, 0) / strengths.length;
      const variance =
        strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / strengths.length;
      const stdDev = Math.sqrt(variance);

      // Filter outliers
      for (const signal of groupSignals) {
        const zScore = Math.abs((signal.strength - mean) / stdDev);
        if (zScore > this.config.outlierThreshold) {
          outliers.push(signal);
        } else {
          valid.push(signal);
        }
      }
    }

    return { valid, outliers };
  }

  /**
   * Get signals requiring processing.
   */
  async getPendingSignals(): Promise<MarketSignal[]> {
    // Get recent signals that haven't been normalized
    const allSignals = await this.repository.getSignalsByType('job_postings', {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    // Filter to unprocessed (in real implementation, would check normalization status)
    return allSignals;
  }

  /**
   * Clean old signals.
   */
  async cleanOldSignals(): Promise<number> {
    const cutoffDate = new Date(Date.now() - this.config.maxSignalAgeDays * 24 * 60 * 60 * 1000);
    return this.repository.deleteOldSignals(cutoffDate);
  }
}

/**
 * Factory function for MarketSignalEngine.
 */
export function createMarketSignalEngine(
  repository: MarketRepository,
  config?: Partial<MarketSignalEngineConfig>
): MarketSignalEngine {
  return new MarketSignalEngine(repository, config);
}
