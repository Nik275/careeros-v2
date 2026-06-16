/**
 * CareerOS Archetype Detection Engine - Calculator
 *
 * Phase 1.2: Archetype Detection Engine
 *
 * Calculates archetype scores based on collected signals.
 *
 * @module archetype-calculator
 * @version 1.0.0
 */

import type {
  ArchetypeType,
  ArchetypeScore,
  ArchetypeConfidence,
  ArchetypeReliability,
} from '@/types/archetype-profile';
import type {
  ArchetypeSignal,
  ArchetypeSignalCollection,
  ArchetypeScoringConfig,
} from './archetype-types';
import { DEFAULT_ARCHETYPE_SCORING_CONFIG } from './archetype-types';

/**
 * Calculator for archetype scores.
 */
export class ArchetypeCalculator {
  /** Scoring configuration */
  private config: ArchetypeScoringConfig;

  /**
   * Creates a new ArchetypeCalculator.
   *
   * @param config - Scoring configuration
   */
  constructor(config: ArchetypeScoringConfig) {
    this.config = config;
  }

  /**
   * Calculates archetype scores from signal collections.
   *
   * @param collections - Signal collections for all archetypes
   * @returns Array of archetype scores
   */
  calculateScores(
    collections: ArchetypeSignalCollection[]
  ): ArchetypeScore[] {
    return collections.map((collection) =>
      this.calculateSingleScore(collection)
    );
  }

  /**
   * Calculates score for a single archetype.
   *
   * @param collection - Signal collection for the archetype
   * @returns Archetype score
   */
  private calculateSingleScore(
    collection: ArchetypeSignalCollection
  ): ArchetypeScore {
    // Calculate weighted average
    const weightedAverage =
      collection.totalWeight > 0
        ? collection.weightedSum / collection.totalWeight
        : 0;

    // Calculate confidence based on signal count and diversity
    const confidence = this.calculateConfidence(collection);

    // Normalize to 0-100
    const normalizedScore = Math.round(
      Math.max(0, Math.min(100, weightedAverage))
    );

    return {
      archetype: collection.archetype,
      score: normalizedScore,
      confidence: Math.round(confidence),
    };
  }

  /**
   * Calculates confidence for a signal collection.
   *
   * @param collection - Signal collection
   * @returns Confidence score (0-100)
   */
  private calculateConfidence(
    collection: ArchetypeSignalCollection
  ): number {
    const signalCount = collection.signals.length;

    // Base confidence from signal count
    let confidence = Math.min(100, signalCount * 15);

    // Boost for signal diversity across sources
    const sourceCount = Object.values(collection.signalCountBySource).filter(
      (count) => count > 0
    ).length;
    confidence += sourceCount * 5;

    // Penalize if signals are weak
    const avgStrength =
      collection.signals.reduce((sum, s) => sum + s.strength, 0) /
      Math.max(1, signalCount);
    confidence *= avgStrength / 100;

    return Math.min(100, confidence);
  }

  /**
   * Determines primary and secondary archetypes from scores.
   *
   * @param scores - All archetype scores
   * @returns Primary and secondary archetypes (if applicable)
   */
  determinePrimarySecondary(
    scores: ArchetypeScore[]
  ): {
    primary: ArchetypeType;
    secondary?: ArchetypeType;
  } {
    // Sort by score descending
    const sorted = [...scores].sort((a, b) => b.score - a.score);

    const primary = sorted[0];
    const secondary = sorted[1];

    // Check if secondary meets threshold
    if (
      this.config.allowMixedArchetypes &&
      secondary &&
      secondary.score >= this.config.secondaryThreshold &&
      primary.score - secondary.score <= this.config.primarySecondaryGap
    ) {
      return {
        primary: primary.archetype,
        secondary: secondary.archetype,
      };
    }

    return {
      primary: primary.archetype,
    };
  }

  /**
   * Calculates overall confidence for the archetype profile.
   *
   * @param scores - All archetype scores
   * @returns Archetype confidence
   */
  calculateOverallConfidence(
    scores: ArchetypeScore[]
  ): ArchetypeConfidence {
    const evidenceCount = scores.length;

    // Average confidence across scores
    const avgConfidence =
      scores.reduce((sum, s) => sum + s.confidence, 0) /
      Math.max(1, scores.length);

    // Boost if primary is clear
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const primarySecondaryGap = sorted[0].score - (sorted[1]?.score ?? 0);
    const clarityBoost = Math.min(20, primarySecondaryGap / 2);

    const confidenceScore = Math.min(100, avgConfidence + clarityBoost);

    // Determine reliability
    const reliability = this.determineReliability(confidenceScore, evidenceCount);

    return {
      confidenceScore: Math.round(confidenceScore),
      evidenceCount,
      reliability,
    };
  }

  /**
   * Determines reliability level.
   *
   * @param confidenceScore - Confidence score
   * @param evidenceCount - Evidence count
   * @returns Reliability classification
   */
  private determineReliability(
    confidenceScore: number,
    evidenceCount: number
  ): ArchetypeReliability {
    if (confidenceScore >= 75 && evidenceCount >= 8) {
      return 'HIGH';
    }
    if (confidenceScore >= 50 && evidenceCount >= 5) {
      return 'MODERATE';
    }
    if (confidenceScore >= 30 && evidenceCount >= 3) {
      return 'LOW';
    }
    return 'INSUFFICIENT_DATA';
  }

  /**
   * Validates that scores meet minimum requirements.
   *
   * @param scores - Archetype scores
   * @returns Validation result
   */
  validateScores(
    scores: ArchetypeScore[]
  ): { valid: boolean; reason?: string } {
    if (scores.length < this.config.minSignalsRequired) {
      return {
        valid: false,
        reason: `Insufficient archetype scores: ${scores.length} (minimum ${this.config.minSignalsRequired})`,
      };
    }

    const primary = scores.reduce((max, s) => (s.score > max.score ? s : max));

    if (primary.confidence < this.config.minPrimaryConfidence) {
      return {
        valid: false,
        reason: `Primary archetype confidence too low: ${primary.confidence} (minimum ${this.config.minPrimaryConfidence})`,
      };
    }

    return { valid: true };
  }

  /**
   * Gets the scoring configuration.
   *
   * @returns Current configuration
   */
  getConfig(): ArchetypeScoringConfig {
    return { ...this.config };
  }
}

/**
 * Creates signal collection for an archetype.
 *
 * @param archetype - The archetype
 * @param signals - Signals for this archetype
 * @returns Signal collection
 */
export function createSignalCollection(
  archetype: ArchetypeType,
  signals: ArchetypeSignal[]
): ArchetypeSignalCollection {
  const weightedSum = signals.reduce(
    (sum, signal) => sum + signal.strength * signal.weight,
    0
  );

  const totalWeight = signals.reduce(
    (sum, signal) => sum + signal.weight,
    0
  );

  const signalCountBySource = signals.reduce((acc, signal) => {
    acc[signal.source] = (acc[signal.source] ?? 0) + 1;
    return acc;
  }, {} as Record<import('./archetype-types').SignalSource, number>);

  return {
    archetype,
    signals,
    weightedSum,
    totalWeight,
    signalCountBySource,
  };
}

/**
 * Merges signal collections (for multiple data sources).
 *
 * @param collections - Collections to merge
 * @returns Merged collection
 */
export function mergeSignalCollections(
  collections: ArchetypeSignalCollection[]
): ArchetypeSignalCollection {
  if (collections.length === 0) {
    throw new Error('Cannot merge empty collections');
  }

  const archetype = collections[0].archetype;

  // Verify all collections are for same archetype
  if (!collections.every((c) => c.archetype === archetype)) {
    throw new Error('Cannot merge collections for different archetypes');
  }

  const signals = collections.flatMap((c) => c.signals);

  return createSignalCollection(archetype, signals);
}

/**
 * Filters signals by source.
 *
 * @param collection - Signal collection
 * @param sources - Sources to include
 * @returns Filtered collection
 */
export function filterSignalsBySource(
  collection: ArchetypeSignalCollection,
  sources: import('./archetype-types').SignalSource[]
): ArchetypeSignalCollection {
  const filtered = collection.signals.filter((signal) =>
    sources.includes(signal.source)
  );

  return createSignalCollection(collection.archetype, filtered);
}

/**
 * Creates default archetype calculator.
 *
 * @param config - Optional custom configuration
 * @returns Configured calculator
 */
export function createArchetypeCalculator(
  config?: Partial<ArchetypeScoringConfig>
): ArchetypeCalculator {
  const fullConfig: import('./archetype-types').ArchetypeScoringConfig = {
    ...DEFAULT_ARCHETYPE_SCORING_CONFIG,
    ...config,
  };

  return new ArchetypeCalculator(fullConfig);
}
