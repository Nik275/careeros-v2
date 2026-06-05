/**
 * CareerOS Assessment Signal Engine - Dimension Scorer
 *
 * Phase B.1: Assessment Processing Layer
 *
 * Calculates normalized dimension scores from extracted signals.
 *
 * @module dimension-scorer
 * @version 1.0.0
 */

import type {
  AssessmentSignal,
  DimensionScore,
  DimensionScoreMap,
  SupportedDimension,
  SUPPORTED_DIMENSIONS,
} from './assessment-types';

/**
 * Calculates dimension scores from assessment signals.
 *
 * The DimensionScorer aggregates signals by dimension and computes
 * weighted average scores with confidence metrics.
 */
export class DimensionScorer {
  /**
   * Calculate scores for all supported dimensions.
   *
   * @param signals - Extracted assessment signals
   * @returns Map of dimension names to scores
   */
  calculateDimensionScores(signals: AssessmentSignal[]): DimensionScoreMap {
    const dimensionGroups = this.groupSignalsByDimension(signals);
    const scores: DimensionScoreMap = new Map();

    for (const dimension of SUPPORTED_DIMENSIONS) {
      const dimensionSignals = dimensionGroups.get(dimension) ?? [];
      const score = this.calculateSingleDimension(dimension, dimensionSignals);
      scores.set(dimension, score);
    }

    return scores;
  }

  /**
   * Calculate score for a single dimension.
   *
   * @param dimension - Dimension name
   * @param signals - Signals for this dimension
   * @returns Calculated dimension score
   */
  calculateSingleDimension(
    dimension: string,
    signals: AssessmentSignal[]
  ): DimensionScore {
    if (signals.length === 0) {
      return {
        dimension,
        score: 50,
        confidence: 0,
        signalCount: 0,
      };
    }

    const weightedScore = this.calculateWeightedAverage(signals);
    const confidence = this.calculateDimensionConfidence(signals);

    return {
      dimension,
      score: Math.round(weightedScore),
      confidence: Math.round(confidence),
      signalCount: signals.length,
    };
  }

  /**
   * Group signals by dimension.
   */
  private groupSignalsByDimension(
    signals: AssessmentSignal[]
  ): Map<string, AssessmentSignal[]> {
    const groups = new Map<string, AssessmentSignal[]>();

    for (const signal of signals) {
      const existing = groups.get(signal.dimension) ?? [];
      existing.push(signal);
      groups.set(signal.dimension, existing);
    }

    return groups;
  }

  /**
   * Calculate weighted average of signal strengths.
   */
  private calculateWeightedAverage(signals: AssessmentSignal[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of signals) {
      const adjustedWeight = signal.weight * (signal.confidence / 100);
      weightedSum += signal.strength * adjustedWeight;
      totalWeight += adjustedWeight;
    }

    if (totalWeight === 0) return 50;

    return weightedSum / totalWeight;
  }

  /**
   * Calculate confidence for a dimension based on signal quality.
   */
  private calculateDimensionConfidence(signals: AssessmentSignal[]): number {
    if (signals.length === 0) return 0;
    if (signals.length === 1) return signals[0].confidence * 0.5;

    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    const signalCountBonus = Math.min(signals.length * 5, 20);

    const consistencyScore = this.calculateConsistency(signals);

    return Math.min(100, avgSignalConfidence + signalCountBonus + consistencyScore * 0.1);
  }

  /**
   * Calculate consistency score for signals.
   */
  private calculateConsistency(signals: AssessmentSignal[]): number {
    if (signals.length < 2) return 100;

    const strengths = signals.map((s) => s.strength);
    const mean = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;

    const variance =
      strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
      strengths.length;

    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - stdDev * 2);
  }

  /**
   * Get dimension score or default.
   */
  getDimensionScore(
    scores: DimensionScoreMap,
    dimension: SupportedDimension
  ): DimensionScore {
    return (
      scores.get(dimension) ?? {
        dimension,
        score: 50,
        confidence: 0,
        signalCount: 0,
      }
    );
  }
}

/**
 * Factory function for DimensionScorer.
 */
export function createDimensionScorer(): DimensionScorer {
  return new DimensionScorer();
}
