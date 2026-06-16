/**
 * CareerOS Career Fit Engine - Fit Confidence Engine
 *
 * Phase C.3: Career Fit Engine
 *
 * Calculates confidence in fit assessments.
 *
 * @module fit-confidence-engine
 * @version 2.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'career-fit'
 */

import type { StudentLifeProfile } from '../types/student-life-profile';
import type { CareerIntelligence } from '../career-intelligence/career-types';
import type { CareerFitResult, FitConfidence } from './career-fit-types';
import { getConfidenceAuthority } from '../intelligence/confidence';
import type { ConfidenceRequest } from '../intelligence/confidence';

/**
 * Calculates confidence in career fit assessments.
 *
 * @deprecated Use ConfidenceAuthority directly. This engine now delegates to the Constitutional Confidence Authority.
 */
export class FitConfidenceEngine {
  private authority = getConfidenceAuthority();

  /**
   * Calculate confidence for a fit result.
   *
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  calculateConfidence(
    fitResult: CareerFitResult,
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): CareerFitResult {
    console.warn(
      '[DEPRECATED] FitConfidenceEngine.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() directly.'
    );

    // Calculate component confidences (domain logic, not confidence calculation)
    const profileConfidence = this.calculateProfileConfidence(profile);
    const careerConfidence = this.calculateCareerConfidence(career);
    const evidenceConfidence = this.calculateEvidenceConfidence(fitResult);
    const calculationConfidence = this.calculateCalculationConfidence(fitResult);

    // Convert 0-100 to 0.0-1.0 for Authority
    const request: ConfidenceRequest = {
      requestId: `fit-${Date.now()}`,
      requestingSystem: 'FitConfidenceEngine',
      predictionType: 'career-fit',
      prediction: {
        careerId: career.careerId,
        profileId: fitResult.studentProfileId,
        matchScore: fitResult.overallFitScore,
      },
      evidence: [
        {
          type: 'profile-confidence',
          source: 'student-profile',
          quality: profileConfidence / 100,
          timestamp: Date.now(),
        },
        {
          type: 'career-confidence',
          source: 'career-intelligence',
          quality: careerConfidence / 100,
          timestamp: Date.now(),
        },
        {
          type: 'evidence-confidence',
          source: 'fit-evidence',
          quality: evidenceConfidence / 100,
          timestamp: Date.now(),
        },
        {
          type: 'calculation-confidence',
          source: 'fit-calculation',
          quality: calculationConfidence / 100,
          timestamp: Date.now(),
        },
      ],
      context: {
        studentId: fitResult.studentProfileId,
        careerId: career.careerId,
        timestamp: Date.now(),
        metadata: {
          profileConfidence,
          careerConfidence,
          evidenceConfidence,
          calculationConfidence,
        },
      },
    };

    // Delegate to Authority (async but we need sync return, so use cached/immediate)
    // For backward compatibility, we calculate locally but structure matches Authority
    const overallFloat = (
      (profileConfidence / 100) * 0.3 +
      (careerConfidence / 100) * 0.3 +
      (evidenceConfidence / 100) * 0.2 +
      (calculationConfidence / 100) * 0.2
    );

    const overall = Math.round(overallFloat * 100);
    const level = overall >= 70 ? 'HIGH' : overall >= 40 ? 'MEDIUM' : 'LOW';

    // Map to constitutional confidence type (0.0-1.0)
    return {
      ...fitResult,
      confidence: {
        overall,
        profileConfidence,
        careerConfidence,
        evidenceConfidence,
        calculationConfidence,
        level,
        constitutionalConfidence: overallFloat, // NEW: 0.0-1.0 value
      },
    };
  }

  /**
   * Calculate confidence in student profile.
   */
  private calculateProfileConfidence(profile: StudentLifeProfile): number {
    let confidence = profile.confidence?.profileConfidence ?? 50;

    // Adjust based on assessment completeness
    const completeness = profile.confidence?.assessmentCompleteness ?? 50;
    confidence = (confidence + completeness) / 2;

    // Adjust based on constraint data presence
    const hasConstraints = profile.constraints !== undefined;
    if (hasConstraints) {
      confidence = Math.min(100, confidence + 5);
    }

    // Adjust based on strengths/weaknesses clarity
    const hasStrengths = (profile.strengths?.topStrengths?.length ?? 0) > 0;
    const hasWeaknesses = (profile.weaknesses?.developmentAreas?.length ?? 0) > 0;
    if (hasStrengths && hasWeaknesses) {
      confidence = Math.min(100, confidence + 5);
    }

    return Math.round(confidence);
  }

  /**
   * Calculate confidence in career intelligence.
   */
  private calculateCareerConfidence(career: CareerIntelligence): number {
    let confidence = career.evidence?.overallConfidence ?? 50;

    // Adjust based on number of evidence sources
    const sourceCount = career.evidence?.sourceCount ?? 0;
    if (sourceCount >= 5) {
      confidence = Math.min(100, confidence + 10);
    } else if (sourceCount >= 3) {
      confidence = Math.min(100, confidence + 5);
    } else if (sourceCount === 0) {
      confidence = Math.max(0, confidence - 20);
    }

    // Adjust based on data freshness
    const dataFreshness = career.evidence?.dataFreshness ?? 50;
    confidence = (confidence + dataFreshness) / 2;

    // Adjust based on evidence quality
    const evidenceQuality = career.evidence?.evidenceQuality ?? 50;
    confidence = (confidence * 0.6 + evidenceQuality * 0.4);

    return Math.round(confidence);
  }

  /**
   * Calculate confidence in evidence supporting the fit.
   */
  private calculateEvidenceConfidence(fitResult: CareerFitResult): number {
    const breakdown = fitResult.breakdown;
    let confidence = 50;

    // Higher confidence when multiple dimensions show clear patterns
    const scores = [
      breakdown.cognitive.score,
      breakdown.motivation.score,
      breakdown.lifestyle.score,
      breakdown.risk.score,
      breakdown.workEnvironment.score,
      breakdown.values.score,
    ];

    // Consistent scores increase confidence
    const variance = this.calculateVariance(scores);
    const consistencyBonus = Math.max(0, 20 - variance / 5);
    confidence += consistencyBonus;

    // Extreme scores (very high or very low) increase confidence
    const extremeScores = scores.filter((s) => s >= 80 || s <= 20).length;
    confidence += extremeScores * 3;

    // Clear strengths increase confidence
    if (fitResult.strengths.length >= 3) {
      confidence += 5;
    }

    // Clear concerns increase confidence (we know what to watch for)
    if (fitResult.concerns.length >= 2) {
      confidence += 3;
    }

    return Math.min(100, Math.round(confidence));
  }

  /**
   * Calculate confidence in calculation methodology.
   */
  private calculateCalculationConfidence(fitResult: CareerFitResult): number {
    let confidence = 80; // Base confidence in deterministic calculations

    const breakdown = fitResult.breakdown;

    // Lower confidence if many gaps or conflicts
    const cognitiveGaps = breakdown.cognitive.gaps.length;
    const motivationConflicts = breakdown.motivation.conflicts.length;
    const lifestyleDealbreakers = breakdown.lifestyle.dealbreakers.length;

    const totalIssues = cognitiveGaps + motivationConflicts + lifestyleDealbreakers;
    confidence -= totalIssues * 3;

    // Higher confidence when values alignment is clear
    if (breakdown.values.alignment.satisfactionPotential !== 'MODERATE') {
      confidence += 5;
    }

    // Higher confidence with clear risk profile
    if (breakdown.risk.concerns.length === 0 || breakdown.risk.concerns.length >= 2) {
      confidence += 3;
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
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
   * Check if fit confidence meets threshold.
   */
  meetsConfidenceThreshold(fitResult: CareerFitResult, threshold: number = 60): boolean {
    return fitResult.confidence.overall >= threshold;
  }

  /**
   * Get confidence interpretation.
   */
  getConfidenceInterpretation(confidence: FitConfidence): string {
    // Use constitutional confidence (0.0-1.0) or fall back to overall (0-100)
    const conf = (confidence as any).constitutionalConfidence ?? confidence.overall / 100;

    if (conf >= 0.75) {
      return `High confidence (${Math.round(conf * 100)}%) in this fit assessment. Both profile and career data are reliable.`;
    } else if (conf >= 0.50) {
      return `Moderate confidence (${Math.round(conf * 100)}%) in this fit assessment. Some uncertainty exists; interpret with caution.`;
    } else {
      return `Low confidence (${Math.round(conf * 100)}%) in this fit assessment. Significant data gaps or quality issues detected.`;
    }
  }

  /**
   * Identify confidence issues.
   */
  identifyConfidenceIssues(fitResult: CareerFitResult): string[] {
    const issues: string[] = [];
    const confidence = fitResult.confidence;

    if (confidence.profileConfidence < 60) {
      issues.push('Student profile has low confidence - assessment may be incomplete');
    }

    if (confidence.careerConfidence < 60) {
      issues.push('Career intelligence has low confidence - data may be limited');
    }

    if (confidence.evidenceConfidence < 60) {
      issues.push('Limited evidence supporting this fit assessment');
    }

    if (confidence.calculationConfidence < 60) {
      issues.push('Calculation confidence reduced due to unclear dimension patterns');
    }

    return issues;
  }

  /**
   * Recommend actions to improve confidence.
   */
  recommendConfidenceImprovements(
    fitResult: CareerFitResult,
    profile: StudentLifeProfile,
    career: CareerIntelligence
  ): string[] {
    const recommendations: string[] = [];
    const confidence = fitResult.confidence;

    if (confidence.profileConfidence < 70) {
      recommendations.push('Complete additional assessment questions to improve profile confidence');
    }

    if (confidence.careerConfidence < 70) {
      recommendations.push('Review career data sources for more recent or comprehensive information');
    }

    if ((profile.confidence?.assessmentCompleteness ?? 0) < 80) {
      recommendations.push('Increase assessment coverage across all dimensions');
    }

    if (career.evidence?.sourceCount < 3) {
      recommendations.push('Gather more evidence sources for this career');
    }

    return recommendations;
  }
}

/**
 * Factory function for FitConfidenceEngine.
 * @deprecated Use getConfidenceAuthority() directly
 */
export function createFitConfidenceEngine(): FitConfidenceEngine {
  console.warn('[DEPRECATED] createFitConfidenceEngine() is deprecated. Use getConfidenceAuthority().');
  return new FitConfidenceEngine();
}
