/**
 * CareerOS Career Recommendation Engine - Recommendation Confidence Engine
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Calculates confidence in career recommendations.
 *
 * @module recommendation-confidence-engine
 * @version 2.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'career-recommendation'
 */

import type { CareerRecommendation, RecommendationConfidence } from './recommendation-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';
import type { StudentLifeProfile } from '../types/student-life-profile';
import { getConfidenceAuthority } from '../intelligence/confidence';
import type { ConfidenceRequest } from '../intelligence/confidence';

/**
 * Calculates confidence in career recommendations.
 *
 * Evaluates recommendation reliability, evidence quality, and
 * data confidence across all components.
 *
 * @deprecated Use ConfidenceAuthority directly
 */
export class RecommendationConfidenceEngine {
  /** Constitutional Confidence Authority */
  private authority = getConfidenceAuthority();
  /**
   * Calculate confidence for a recommendation.
   * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'career-recommendation'
   */
  calculateConfidence(
    recommendation: CareerRecommendation,
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): CareerRecommendation {
    console.warn(
      '[DEPRECATED] RecommendationConfidenceEngine.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "career-recommendation"'
    );

    const recommendationConfidence = this.calculateRecommendationConfidence(recommendation);
    const evidenceConfidence = this.calculateEvidenceConfidence(recommendation, career);
    const profileConfidence = this.calculateProfileConfidence(profile);
    const careerConfidence = this.calculateCareerConfidence(career);

    const overall = Math.round(
      recommendationConfidence * 0.3 +
      evidenceConfidence * 0.25 +
      profileConfidence * 0.25 +
      careerConfidence * 0.2
    );

    // Calculate constitutional confidence (0.0-1.0)
    const constitutionalConfidence = overall / 100;

    return {
      ...recommendation,
      confidence: {
        overall,
        recommendationConfidence,
        evidenceConfidence,
        profileConfidence,
        careerConfidence,
        constitutionalConfidence,
        // level removed - no longer using enum
      } as RecommendationConfidence,
    };
  }

  /**
   * Calculate confidence in the recommendation itself.
   */
  private calculateRecommendationConfidence(recommendation: CareerRecommendation): number {
    let confidence = 70; // Base confidence

    // Higher confidence for clear recommendation types
    if (recommendation.recommendationType === 'STRONG_MATCH') {
      confidence += 10;
    } else if (recommendation.recommendationType === 'STRETCH_MATCH') {
      confidence -= 10;
    }

    // Score clarity affects confidence
    if (recommendation.score >= 80 || recommendation.score <= 40) {
      confidence += 5; // Clear signal
    }

    // Fit score clarity
    if (recommendation.fitScore >= 75 || recommendation.fitScore <= 45) {
      confidence += 5;
    }

    // Component score consistency
    const componentScores = [
      recommendation.fitScore,
      recommendation.futureRelevanceScore,
      recommendation.careerMobilityScore,
      recommendation.lifestyleAlignmentScore,
      recommendation.riskAlignmentScore,
      recommendation.marketOpportunityScore,
    ];

    const variance = this.calculateVariance(componentScores);
    const consistencyBonus = Math.max(0, 10 - variance / 20);
    confidence += consistencyBonus;

    // Strength and concern balance
    const majorStrengths = recommendation.fitResult.strengths.filter((s) => s.impact === 'MAJOR').length;
    const majorConcerns = recommendation.fitResult.concerns.filter((c) => c.severity === 'HIGH').length;

    if (majorStrengths > majorConcerns) {
      confidence += 5;
    } else if (majorConcerns > majorStrengths) {
      confidence -= 5;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Calculate evidence confidence.
   */
  private calculateEvidenceConfidence(
    recommendation: CareerRecommendation,
    career: CareerIntelligence
  ): number {
    let confidence = 60; // Base evidence confidence

    // Career evidence quality
    if (career.evidence) {
      confidence += (career.evidence.overallConfidence - 50) * 0.2;
      confidence += (career.evidence.evidenceQuality - 50) * 0.1;

      // Source count
      if (career.evidence.sourceCount >= 5) {
        confidence += 10;
      } else if (career.evidence.sourceCount >= 3) {
        confidence += 5;
      }

      // Data freshness
      confidence += (career.evidence.dataFreshness - 50) * 0.1;
    }

    // Fit result evidence
    const fitEvidence = recommendation.fitResult.confidence;
    confidence += (fitEvidence.evidenceConfidence - 50) * 0.2;

    // Explanation completeness
    const explanation = recommendation.explanation;
    if (explanation.whyRecommended.length >= 3) {
      confidence += 5;
    }
    if (explanation.majorAdvantages.length >= 2) {
      confidence += 3;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Calculate profile confidence.
   */
  private calculateProfileConfidence(profile: StudentLifeProfile): number {
    let confidence = profile.confidence?.profileConfidence ?? 50;

    // Assessment completeness
    const completeness = profile.confidence?.assessmentCompleteness ?? 50;
    confidence = (confidence + completeness) / 2;

    // Profile richness
    const hasCognitive = profile.cognitive !== undefined;
    const hasMotivation = profile.motivation !== undefined;
    const hasLifestyle = profile.lifestyle !== undefined;
    const hasValues = profile.values !== undefined;

    const sectionCount = [hasCognitive, hasMotivation, hasLifestyle, hasValues].filter(Boolean).length;
    confidence += sectionCount * 3;

    // Strength/weakness clarity
    const hasStrengths = profile.strengths?.topStrengths && profile.strengths.topStrengths.length > 0;
    const hasWeaknesses = profile.weaknesses?.developmentAreas && profile.weaknesses.developmentAreas.length > 0;

    if (hasStrengths && hasWeaknesses) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }

  /**
   * Calculate career confidence.
   */
  private calculateCareerConfidence(career: CareerIntelligence): number {
    let confidence = career.evidence?.overallConfidence ?? 50;

    // Evidence coverage
    const dimensions = [
      career.cognitiveDemands,
      career.motivationalDemands,
      career.lifestyleCharacteristics,
      career.workEnvironment,
      career.careerRisks,
      career.careerAdvantages,
    ];

    let dimensionsWithEvidence = 0;
    for (const dimension of dimensions) {
      const hasEvidence = Object.values(dimension).some(
        (d) => typeof d === 'object' && d !== null && 'evidence' in d && d.evidence.length > 0
      );
      if (hasEvidence) dimensionsWithEvidence++;
    }

    confidence += dimensionsWithEvidence * 3;

    // Metadata completeness
    if (career.metadata) {
      confidence += 5;
    }

    // Insights availability
    if (career.insights) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }

  /**
   * Calculate variance of scores.
   */
  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 0;

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squaredDiffs = scores.map((s) => Math.pow(s - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
  }

  /**
   * Check if confidence meets threshold.
   */
  meetsConfidenceThreshold(recommendation: CareerRecommendation, threshold: number = 60): boolean {
    return recommendation.confidence.overall >= threshold;
  }

  /**
   * Get confidence interpretation.
   */
  getConfidenceInterpretation(confidence: RecommendationConfidence): string {
    const parts: string[] = [];

    parts.push(`Overall confidence: ${confidence.overall}% (${confidence.level})`);

    if (confidence.recommendationConfidence >= 70) {
      parts.push('Strong recommendation confidence');
    } else if (confidence.recommendationConfidence <= 50) {
      parts.push('Recommendation confidence could be improved');
    }

    if (confidence.evidenceConfidence >= 70) {
      parts.push('Evidence base is solid');
    }

    if (confidence.profileConfidence >= 70) {
      parts.push('Student profile is well-established');
    }

    if (confidence.careerConfidence >= 70) {
      parts.push('Career intelligence is reliable');
    }

    return parts.join('. ');
  }

  /**
   * Identify confidence issues.
   */
  identifyConfidenceIssues(recommendation: CareerRecommendation): string[] {
    const issues: string[] = [];
    const confidence = recommendation.confidence;

    if (confidence.profileConfidence < 60) {
      issues.push('Student profile has low confidence');
    }

    if (confidence.careerConfidence < 60) {
      issues.push('Career intelligence has low confidence');
    }

    if (confidence.evidenceConfidence < 60) {
      issues.push('Limited evidence supports this recommendation');
    }

    if (confidence.recommendationConfidence < 60) {
      issues.push('Recommendation confidence is below threshold');
    }

    return issues;
  }

  /**
   * Recommend improvements to confidence.
   */
  recommendConfidenceImprovements(
    recommendation: CareerRecommendation,
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): string[] {
    const improvements: string[] = [];
    const confidence = recommendation.confidence;

    if (confidence.profileConfidence < 70) {
      improvements.push('Complete additional assessment questions to strengthen profile');
    }

    if (confidence.careerConfidence < 70) {
      improvements.push('Review and update career intelligence data');
    }

    if (confidence.evidenceConfidence < 70) {
      improvements.push('Gather additional evidence for career characteristics');
    }

    if (profile.confidence?.assessmentCompleteness && profile.confidence.assessmentCompleteness < 80) {
      improvements.push('Increase assessment coverage across all dimensions');
    }

    return improvements;
  }

  /**
   * Get average confidence across recommendations.
   */
  getAverageConfidence(recommendations: CareerRecommendation[]): number {
    if (recommendations.length === 0) return 0;

    const sum = recommendations.reduce((acc, rec) => acc + rec.confidence.overall, 0);
    return Math.round(sum / recommendations.length);
  }

  /**
   * Filter recommendations by confidence.
   */
  filterByConfidence(
    recommendations: CareerRecommendation[],
    minConfidence: number = 60
  ): CareerRecommendation[] {
    return recommendations.filter((rec) => rec.confidence.overall >= minConfidence);
  }
}

/**
 * Factory function for RecommendationConfidenceEngine.
 */
export function createRecommendationConfidenceEngine(): RecommendationConfidenceEngine {
  return new RecommendationConfidenceEngine();
}
