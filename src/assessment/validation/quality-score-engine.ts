/**
 * CareerOS Assessment Reliability & Validation System - Quality Score Engine
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Calculates comprehensive quality scores for assessments.
 *
 * @module quality-score-engine
 * @version 1.0.0
 */

import type {
  AssessmentResponse,
  AssessmentSignal,
  QualityMetrics,
  ResponseTiming,
  ValidationConfig,
} from './validation-types';
import { DEFAULT_VALIDATION_CONFIG } from './validation-types';

/**
 * Calculates comprehensive quality scores for assessments.
 *
 * Combines multiple quality factors into overall assessment quality.
 */
export class QualityScoreEngine {
  private config: ValidationConfig;

  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  }

  /**
   * Calculate complete quality metrics.
   */
  calculateQuality(
    responses: AssessmentResponse[],
    signals: AssessmentSignal[],
    expectedCount: number,
    timings?: ResponseTiming[]
  ): QualityMetrics {
    const completionRate = this.calculateCompletionRate(responses, expectedCount);
    const consistency = this.calculateConsistency(signals);
    const coverage = this.calculateCoverage(signals);
    const signalStrength = this.calculateSignalStrength(signals);
    const responseQuality = this.calculateResponseQuality(responses, timings);

    // Calculate overall quality score
    const overallScore = Math.round(
      completionRate * 0.2 +
        consistency * 0.25 +
        coverage * 0.2 +
        signalStrength * 0.2 +
        responseQuality * 0.15
    );

    return {
      overallScore,
      completionRate,
      consistency,
      coverage,
      signalStrength,
      responseQuality,
    };
  }

  /**
   * Calculate completion rate.
   */
  private calculateCompletionRate(
    responses: AssessmentResponse[],
    expectedCount: number
  ): number {
    if (expectedCount === 0) return 0;

    const rate = (responses.length / expectedCount) * 100;
    return Math.round(Math.min(100, rate));
  }

  /**
   * Calculate consistency score.
   */
  private calculateConsistency(signals: AssessmentSignal[]): number {
    if (signals.length < 2) return 50;

    // Group by dimension
    const dimensionScores = new Map<string, number[]>();

    for (const signal of signals) {
      const existing = dimensionScores.get(signal.dimension) ?? [];
      existing.push(signal.strength);
      dimensionScores.set(signal.dimension, existing);
    }

    // Calculate average consistency across dimensions
    let totalConsistency = 0;
    let dimensionCount = 0;

    for (const [, scores] of dimensionScores) {
      if (scores.length < 2) continue;

      const variance = this.calculateVariance(scores);
      // Lower variance = higher consistency
      const consistency = Math.max(0, 100 - variance / 10);

      totalConsistency += consistency;
      dimensionCount++;
    }

    return dimensionCount > 0
      ? Math.round(totalConsistency / dimensionCount)
      : 50;
  }

  /**
   * Calculate coverage score.
   */
  private calculateCoverage(signals: AssessmentSignal[]): number {
    if (signals.length === 0) return 0;

    const dimensions = new Set(signals.map((s) => s.dimension));
    const categories = new Set(signals.map((s) => s.category));

    // Dimension coverage (0-50 points)
    const dimensionCoverage = Math.min(50, dimensions.size * 5);

    // Category coverage (0-30 points)
    const categoryCoverage = Math.min(30, categories.size * 4);

    // Depth coverage (0-20 points)
    const dimensionCounts = new Map<string, number>();
    for (const signal of signals) {
      const count = dimensionCounts.get(signal.dimension) ?? 0;
      dimensionCounts.set(signal.dimension, count + 1);
    }

    let depthScore = 0;
    for (const count of dimensionCounts.values()) {
      if (count >= 3) depthScore += 4;
      else if (count >= 2) depthScore += 2;
      else depthScore += 1;
    }
    const depthCoverage = Math.min(20, depthScore);

    return dimensionCoverage + categoryCoverage + depthCoverage;
  }

  /**
   * Calculate signal strength score.
   */
  private calculateSignalStrength(signals: AssessmentSignal[]): number {
    if (signals.length === 0) return 0;

    // Average signal strength weighted by confidence
    let totalWeight = 0;
    let weightedSum = 0;

    for (const signal of signals) {
      const weight = signal.confidence / 100;
      weightedSum += signal.strength * weight;
      totalWeight += weight;
    }

    const averageStrength = totalWeight > 0 ? weightedSum / totalWeight : 50;

    // Adjust based on signal variance (high variance reduces score)
    const strengths = signals.map((s) => s.strength);
    const variance = this.calculateVariance(strengths);
    const variancePenalty = Math.min(20, variance / 50);

    return Math.round(Math.max(0, averageStrength - variancePenalty));
  }

  /**
   * Calculate response quality score.
   */
  private calculateResponseQuality(
    responses: AssessmentResponse[],
    timings?: ResponseTiming[]
  ): number {
    let score = 100;

    // Check for minimal engagement (very fast responses)
    if (timings && timings.length > 0) {
      const avgTime =
        timings.reduce((sum, t) => sum + t.durationSeconds, 0) / timings.length;

      if (avgTime < 3) {
        score -= 30;
      } else if (avgTime < 5) {
        score -= 15;
      }
    }

    // Check response distribution
    const numericResponses: number[] = [];
    for (const response of responses) {
      if (response.type === 'likert' || response.type === 'scale') {
        numericResponses.push(response.value);
      }
    }

    if (numericResponses.length > 0) {
      const variance = this.calculateVariance(numericResponses);

      // Very low variance suggests straight-lining
      if (variance < 0.5) {
        score -= 25;
      } else if (variance < 1) {
        score -= 10;
      }

      // Check for extreme responding
      const extremes = numericResponses.filter((v) => v === 1 || v === 5);
      const extremePercentage = (extremes.length / numericResponses.length) * 100;

      if (extremePercentage > 80) {
        score -= 15;
      }

      // Check for midpoint responding
      const midpoints = numericResponses.filter((v) => v === 3);
      const midpointPercentage = (midpoints.length / numericResponses.length) * 100;

      if (midpointPercentage > 60) {
        score -= 15;
      }
    }

    return Math.max(0, score);
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
   * Get quality level from score.
   */
  getQualityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= this.config.minQualityThreshold + 20) return 'HIGH';
    if (score >= this.config.minQualityThreshold) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Check if quality meets threshold.
   */
  meetsThreshold(score: number): boolean {
    return score >= this.config.minQualityThreshold;
  }

  /**
   * Get quality description.
   */
  getQualityDescription(score: number): string {
    const level = this.getQualityLevel(score);

    switch (level) {
      case 'HIGH':
        return 'Assessment quality is high. Results are reliable and valid.';
      case 'MEDIUM':
        return 'Assessment quality is acceptable. Some caution advised in interpretation.';
      case 'LOW':
        return 'Assessment quality is low. Results should be interpreted with caution or reassessment recommended.';
    }
  }

  /**
   * Identify quality issues.
   */
  identifyQualityIssues(metrics: QualityMetrics): string[] {
    const issues: string[] = [];

    if (metrics.completionRate < this.config.minCompletionRate) {
      issues.push(`Low completion rate: ${metrics.completionRate}%`);
    }

    if (metrics.consistency < 60) {
      issues.push(`Low consistency: ${metrics.consistency}%`);
    }

    if (metrics.coverage < this.config.minDimensionCoverage) {
      issues.push(`Insufficient coverage: ${metrics.coverage}%`);
    }

    if (metrics.signalStrength < 50) {
      issues.push(`Weak signals: ${metrics.signalStrength}%`);
    }

    if (metrics.responseQuality < 70) {
      issues.push(`Low response quality: ${metrics.responseQuality}%`);
    }

    return issues;
  }
}

/**
 * Factory function for QualityScoreEngine.
 */
export function createQualityScoreEngine(
  config?: Partial<ValidationConfig>
): QualityScoreEngine {
  return new QualityScoreEngine(config);
}
