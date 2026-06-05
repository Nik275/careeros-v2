/**
 * CareerOS Assessment Reliability & Validation System - Reliability Engine
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Calculates reliability metrics for assessment results.
 *
 * @module reliability-engine
 * @version 1.0.0
 */

import type {
  AssessmentSignal,
  AssessmentResponse,
  DimensionScoreMap,
  ReliabilityMetrics,
} from './validation-types';

/**
 * Calculates comprehensive reliability metrics for assessments.
 *
 * Computes internal consistency, dimension confidence, stability,
 * and overall reliability scores.
 */
export class ReliabilityEngine {
  /**
   * Calculate complete reliability metrics.
   */
  calculateReliability(
    signals: AssessmentSignal[],
    responses: AssessmentResponse[],
    dimensionScores: DimensionScoreMap
  ): ReliabilityMetrics {
    const internalConsistency = this.calculateInternalConsistency(signals);
    const dimensionConfidence = this.calculateDimensionConfidence(dimensionScores);
    const stabilityScore = this.estimateStability(dimensionScores);
    const coverageConfidence = this.calculateCoverageConfidence(signals);
    const profileConfidence = this.calculateProfileConfidence(
      internalConsistency,
      dimensionConfidence,
      coverageConfidence
    );

    // Calculate overall reliability
    const overallScore = Math.round(
      internalConsistency * 0.25 +
        this.averageDimensionConfidence(dimensionConfidence) * 0.25 +
        stabilityScore * 0.2 +
        coverageConfidence * 0.15 +
        profileConfidence * 0.15
    );

    return {
      overallScore,
      internalConsistency,
      dimensionConfidence,
      stabilityScore,
      coverageConfidence,
      profileConfidence,
    };
  }

  /**
   * Calculate internal consistency (Cronbach-like).
   */
  private calculateInternalConsistency(signals: AssessmentSignal[]): number {
    if (signals.length < 2) return 0;

    // Group signals by dimension
    const dimensionSignals = new Map<string, number[]>();

    for (const signal of signals) {
      const existing = dimensionSignals.get(signal.dimension) ?? [];
      existing.push(signal.strength);
      dimensionSignals.set(signal.dimension, existing);
    }

    // Calculate average inter-item correlation per dimension
    let totalAlpha = 0;
    let dimensionCount = 0;

    for (const [, values] of dimensionSignals) {
      if (values.length < 2) continue;

      const variance = this.calculateVariance(values);
      const itemVariances = values.map(() => variance * 0.8); // Estimate

      const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);

      // Simplified Cronbach's alpha formula
      const k = values.length;
      const alpha = (k / (k - 1)) * (1 - sumItemVariances / (variance * k + 0.001));

      totalAlpha += Math.max(0, Math.min(1, alpha));
      dimensionCount++;
    }

    return dimensionCount > 0
      ? Math.round((totalAlpha / dimensionCount) * 100)
      : 50;
  }

  /**
   * Calculate confidence for each dimension.
   */
  private calculateDimensionConfidence(
    dimensionScores: DimensionScoreMap
  ): Map<string, number> {
    const confidence = new Map<string, number>();

    for (const [dimension, score] of dimensionScores) {
      // Confidence based on signal count and variance
      let dimensionConfidence = score.confidence;

      // Boost for multiple signals
      if (score.signalCount >= 3) {
        dimensionConfidence = Math.min(100, dimensionConfidence + 10);
      }

      // Penalty for very few signals
      if (score.signalCount === 1) {
        dimensionConfidence = Math.round(dimensionConfidence * 0.7);
      }

      confidence.set(dimension, Math.round(dimensionConfidence));
    }

    return confidence;
  }

  /**
   * Estimate test-retest stability.
   */
  private estimateStability(dimensionScores: DimensionScoreMap): number {
    if (dimensionScores.size === 0) return 0;

    // Stability estimate based on:
    // 1. Score extremity (extreme scores more stable)
    // 2. Number of signals (more signals = more stable)
    // 3. Confidence level

    let stabilitySum = 0;

    for (const [, score] of dimensionScores) {
      let dimensionStability = score.confidence;

      // Extreme scores (high or low) tend to be more stable
      const extremity = Math.abs(score.score - 50);
      const extremityBonus = extremity * 0.2;

      // Signal count stability
      const signalBonus = Math.min(10, score.signalCount * 2);

      dimensionStability = Math.min(100, dimensionStability + extremityBonus + signalBonus);
      stabilitySum += dimensionStability;
    }

    return Math.round(stabilitySum / dimensionScores.size);
  }

  /**
   * Calculate coverage confidence.
   */
  private calculateCoverageConfidence(signals: AssessmentSignal[]): number {
    if (signals.length === 0) return 0;

    const dimensions = new Set(signals.map((s) => s.dimension));
    const categories = new Set(signals.map((s) => s.category));

    // Count questions per dimension
    const dimensionCounts = new Map<string, number>();
    for (const signal of signals) {
      const count = dimensionCounts.get(signal.dimension) ?? 0;
      dimensionCounts.set(signal.dimension, count + 1);
    }

    // Calculate coverage score
    let coverageScore = 0;

    // Dimension diversity (max 40 points)
    const dimensionDiversity = Math.min(dimensions.size * 5, 40);
    coverageScore += dimensionDiversity;

    // Category diversity (max 30 points)
    const categoryDiversity = Math.min(categories.size * 4, 30);
    coverageScore += categoryDiversity;

    // Depth per dimension (max 30 points)
    let depthScore = 0;
    for (const count of dimensionCounts.values()) {
      if (count >= 3) depthScore += 5;
      else if (count >= 2) depthScore += 3;
      else depthScore += 1;
    }
    coverageScore += Math.min(30, depthScore);

    return Math.round(coverageScore);
  }

  /**
   * Calculate overall profile confidence.
   */
  private calculateProfileConfidence(
    internalConsistency: number,
    dimensionConfidence: Map<string, number>,
    coverageConfidence: number
  ): number {
    const avgDimensionConfidence = this.averageDimensionConfidence(dimensionConfidence);

    // Weighted combination
    const confidence = Math.round(
      internalConsistency * 0.3 +
        avgDimensionConfidence * 0.4 +
        coverageConfidence * 0.3
    );

    return confidence;
  }

  /**
   * Calculate average dimension confidence.
   */
  private averageDimensionConfidence(
    dimensionConfidence: Map<string, number>
  ): number {
    if (dimensionConfidence.size === 0) return 0;

    const sum = Array.from(dimensionConfidence.values()).reduce((a, b) => a + b, 0);
    return Math.round(sum / dimensionConfidence.size);
  }

  /**
   * Calculate variance of values.
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get reliability level from score.
   */
  getReliabilityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Check if reliability meets threshold.
   */
  meetsThreshold(score: number, threshold: number): boolean {
    return score >= threshold;
  }

  /**
   * Identify weak dimensions.
   */
  identifyWeakDimensions(
    dimensionConfidence: Map<string, number>,
    threshold: number
  ): string[] {
    const weak: string[] = [];

    for (const [dimension, confidence] of dimensionConfidence) {
      if (confidence < threshold) {
        weak.push(dimension);
      }
    }

    return weak;
  }

  /**
   * Calculate confidence interval for dimension.
   */
  calculateConfidenceInterval(
    score: number,
    confidence: number,
    confidenceLevel: 90 | 95 = 95
  ): { lower: number; upper: number } {
    // Simplified confidence interval calculation
    const zScore = confidenceLevel === 95 ? 1.96 : 1.645;
    const standardError = (100 - confidence) / 10;
    const margin = zScore * standardError;

    return {
      lower: Math.max(0, score - margin),
      upper: Math.min(100, score + margin),
    };
  }
}

/**
 * Factory function for ReliabilityEngine.
 */
export function createReliabilityEngine(): ReliabilityEngine {
  return new ReliabilityEngine();
}
