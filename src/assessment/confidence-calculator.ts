/**
 * CareerOS Assessment Signal Engine - Confidence Calculator
 *
 * Phase B.1: Assessment Processing Layer
 *
 * Calculates assessment confidence based on response quality and coverage.
 *
 * @module confidence-calculator
 * @version 2.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'assessment'
 */

import type {
  AssessmentConfig,
  AssessmentConfidence,
  AssessmentConfidenceLevel,
  AssessmentResponse,
  AssessmentSignal,
  SupportedDimension,
} from './assessment-types';
import { DEFAULT_ASSESSMENT_CONFIG, SUPPORTED_DIMENSIONS } from './assessment-types';
import { getConfidenceAuthority } from '../intelligence/confidence';
import type { ConfidenceRequest } from '../intelligence/confidence';

/**
 * Calculates assessment confidence metrics.
 *
 * The ConfidenceCalculator evaluates response consistency, question coverage,
 * answer variance, and dimension completeness to produce overall confidence.
 *
 * @deprecated Use ConfidenceAuthority directly
 */
export class ConfidenceCalculator {
  private config: AssessmentConfig;

  /** Constitutional Confidence Authority */
  private authority = getConfidenceAuthority();

  constructor(config?: Partial<AssessmentConfig>) {
    this.config = { ...DEFAULT_ASSESSMENT_CONFIG, ...config };
  }

  /**
   * Calculate comprehensive assessment confidence.
   *
   * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'assessment'
   */
  calculateConfidence(
    signals: AssessmentSignal[],
    responses: AssessmentResponse[]
  ): AssessmentConfidence {
    console.warn(
      '[DEPRECATED] ConfidenceCalculator.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "assessment"'
    );

    const consistencyScore = this.calculateConsistencyScore(signals);
    const questionCountScore = this.calculateQuestionCountScore(responses.length);
    const varianceScore = this.calculateVarianceScore(signals);
    const coverageScore = this.calculateCoverageScore(signals);

    const overallScore = Math.round(
      consistencyScore * 0.3 +
        questionCountScore * 0.25 +
        varianceScore * 0.25 +
        coverageScore * 0.2
    );

    // Calculate constitutional confidence (0.0-1.0)
    const constitutionalConfidence = overallScore / 100;

    return {
      score: overallScore,
      confidence: constitutionalConfidence,
      constitutionalConfidence,
      level: this.determineConfidenceLevel(overallScore),
      consistencyScore: Math.round(consistencyScore),
      questionCountScore: Math.round(questionCountScore),
      varianceScore: Math.round(varianceScore),
      coverageScore: Math.round(coverageScore),
    } as AssessmentConfidence;
  }

  /**
   * Calculate response consistency score.
   *
   * Measures how consistent signals are across similar dimensions.
   */
  private calculateConsistencyScore(signals: AssessmentSignal[]): number {
    if (signals.length < 3) return 30;

    const categoryGroups = this.groupByCategory(signals);
    let totalConsistency = 0;
    let categoryCount = 0;

    for (const [, categorySignals] of categoryGroups) {
      if (categorySignals.length < 2) continue;

      const strengths = categorySignals.map((s) => s.strength);
      const mean = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;

      const variance =
        strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
        strengths.length;

      const categoryConsistency = Math.max(0, 100 - variance / 10);
      totalConsistency += categoryConsistency;
      categoryCount++;
    }

    if (categoryCount === 0) return 50;

    return totalConsistency / categoryCount;
  }

  /**
   * Calculate question count score.
   *
   * Rewards sufficient question volume.
   */
  private calculateQuestionCountScore(responseCount: number): number {
    const { minTotalQuestions } = this.config;

    if (responseCount < minTotalQuestions * 0.5) {
      return Math.round((responseCount / (minTotalQuestions * 0.5)) * 40);
    }

    if (responseCount < minTotalQuestions) {
      return Math.round(40 + ((responseCount - minTotalQuestions * 0.5) / (minTotalQuestions * 0.5)) * 30);
    }

    return Math.min(100, 70 + (responseCount - minTotalQuestions) * 2);
  }

  /**
   * Calculate answer variance score.
   *
   * Penalizes extreme variance (suggesting random responses).
   */
  private calculateVarianceScore(signals: AssessmentSignal[]): number {
    if (signals.length < 2) return 50;

    const strengths = signals.map((s) => s.strength);
    const mean = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;

    const variance =
      strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
      strengths.length;

    const { maxAcceptableVariance } = this.config;

    if (variance <= maxAcceptableVariance * 0.5) {
      return 100;
    }

    if (variance <= maxAcceptableVariance) {
      return Math.round(100 - ((variance - maxAcceptableVariance * 0.5) / (maxAcceptableVariance * 0.5)) * 30);
    }

    return Math.max(20, 70 - ((variance - maxAcceptableVariance) / maxAcceptableVariance) * 30);
  }

  /**
   * Calculate dimension coverage score.
   *
   * Rewards comprehensive dimension coverage.
   */
  private calculateCoverageScore(signals: AssessmentSignal[]): number {
    const dimensionCounts = new Map<string, number>();

    for (const signal of signals) {
      const count = dimensionCounts.get(signal.dimension) ?? 0;
      dimensionCounts.set(signal.dimension, count + 1);
    }

    let coveredDimensions = 0;
    let wellCoveredDimensions = 0;

    for (const dimension of SUPPORTED_DIMENSIONS) {
      const count = dimensionCounts.get(dimension) ?? 0;
      if (count > 0) coveredDimensions++;
      if (count >= this.config.minQuestionsPerDimension) wellCoveredDimensions++;
    }

    const coverageRatio = coveredDimensions / SUPPORTED_DIMENSIONS.length;
    const depthRatio = wellCoveredDimensions / SUPPORTED_DIMENSIONS.length;

    return Math.round(coverageRatio * 50 + depthRatio * 50);
  }

  /**
   * Group signals by category.
   */
  private groupByCategory(
    signals: AssessmentSignal[]
  ): Map<string, AssessmentSignal[]> {
    const groups = new Map<string, AssessmentSignal[]>();

    for (const signal of signals) {
      const existing = groups.get(signal.category) ?? [];
      existing.push(signal);
      groups.set(signal.category, existing);
    }

    return groups;
  }

  /**
   * Determine confidence level from score.
   */
  private determineConfidenceLevel(score: number): AssessmentConfidenceLevel {
    if (score >= 75) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Check if confidence meets minimum threshold.
   */
  meetsThreshold(
    confidence: AssessmentConfidence,
    minLevel: AssessmentConfidenceLevel
  ): boolean {
    const levels: Record<AssessmentConfidenceLevel, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
    };

    return levels[confidence.level] >= levels[minLevel];
  }
}

/**
 * Factory function for ConfidenceCalculator.
 */
export function createConfidenceCalculator(
  config?: Partial<AssessmentConfig>
): ConfidenceCalculator {
  return new ConfidenceCalculator(config);
}
