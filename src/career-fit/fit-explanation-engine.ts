/**
 * CareerOS Career Fit Engine - Fit Explanation Engine
 *
 * Phase C.3: Career Fit Engine
 *
 * Generates human-readable explanations of career fit.
 *
 * @module fit-explanation-engine
 * @version 1.0.0
 */

import type { CareerFitResult, FitExplanations, FitBreakdown } from './career-fit-types';

/**
 * Generates human-readable explanations for career fit assessments.
 *
 * Explains why a fit is strong, why it's weak, what aligns, and what conflicts.
 */
export class FitExplanationEngine {
  /**
   * Generate complete explanations for a fit result.
   */
  generateExplanations(fitResult: CareerFitResult): CareerFitResult {
    const explanations: FitExplanations = {
      strongFitReasons: this.generateStrongFitReasons(fitResult),
      weakFitReasons: this.generateWeakFitReasons(fitResult),
      alignments: this.generateAlignments(fitResult.breakdown),
      conflicts: this.generateConflicts(fitResult.breakdown),
      summary: this.generateSummary(fitResult),
    };

    return {
      ...fitResult,
      explanations,
    };
  }

  /**
   * Generate reasons why the fit is strong.
   */
  private generateStrongFitReasons(fitResult: CareerFitResult): string[] {
    const reasons: string[] = [];
    const breakdown = fitResult.breakdown;
    const strengths = fitResult.strengths;

    // Overall score reasons
    if (fitResult.overallFitScore >= 80) {
      reasons.push('Overall fit score indicates excellent compatibility');
    } else if (fitResult.overallFitScore >= 65) {
      reasons.push('Overall fit score indicates good compatibility');
    }

    // Dimension-specific reasons
    if (breakdown.cognitive.score >= 75) {
      reasons.push('Cognitive abilities strongly match career demands');
    }

    if (breakdown.motivation.score >= 75) {
      reasons.push('Motivational profile aligns well with what the career rewards');
    }

    if (breakdown.lifestyle.score >= 75) {
      reasons.push('Lifestyle preferences and career characteristics are well-matched');
    }

    if (breakdown.workEnvironment.score >= 75) {
      reasons.push('Work environment preferences align with career reality');
    }

    if (breakdown.values.score >= 75) {
      reasons.push('Personal values align with what this career provides');
    }

    if (breakdown.risk.score >= 75) {
      reasons.push('Risk tolerance aligns well with career risk profile');
    }

    // Strength-based reasons
    for (const strength of strengths.slice(0, 3)) {
      if (strength.impact === 'MAJOR') {
        reasons.push(`${strength.description} (${strength.score}% match)`);
      }
    }

    // Values alignment reason
    if (breakdown.values.alignment.satisfactionPotential === 'HIGH') {
      reasons.push('Multiple core values are likely to be satisfied in this career');
    }

    // Low concern count
    const highSeverityConcerns = fitResult.concerns.filter((c) => c.severity === 'HIGH').length;
    if (highSeverityConcerns === 0) {
      reasons.push('No major concerns identified in the fit assessment');
    }

    return reasons;
  }

  /**
   * Generate reasons why the fit is weak.
   */
  private generateWeakFitReasons(fitResult: CareerFitResult): string[] {
    const reasons: string[] = [];
    const breakdown = fitResult.breakdown;

    // Overall score reasons
    if (fitResult.overallFitScore < 35) {
      reasons.push('Overall fit score indicates significant mismatch');
    } else if (fitResult.overallFitScore < 50) {
      reasons.push('Overall fit score indicates poor compatibility');
    }

    // Dimension-specific reasons
    if (breakdown.cognitive.score < 45) {
      reasons.push('Cognitive demands exceed current capabilities');
    }

    if (breakdown.motivation.score < 45) {
      reasons.push('Motivational profile poorly aligned with career rewards');
    }

    if (breakdown.lifestyle.score < 45) {
      reasons.push('Lifestyle preferences conflict with career requirements');
    }

    if (breakdown.workEnvironment.score < 45) {
      reasons.push('Work environment characteristics misaligned with preferences');
    }

    if (breakdown.values.score < 45) {
      reasons.push('Personal values may not be satisfied in this career');
    }

    if (breakdown.risk.score < 45) {
      reasons.push('Career risk profile exceeds risk tolerance');
    }

    // Conflict-based reasons
    if (breakdown.motivation.conflicts.length > 0) {
      const highSeverityConflicts = breakdown.motivation.conflicts.filter(
        (c) => c.severity === 'HIGH'
      );
      if (highSeverityConflicts.length > 0) {
        reasons.push('Significant motivation conflicts detected');
      }
    }

    // Dealbreaker reasons
    if (breakdown.lifestyle.dealbreakers.length > 0) {
      const criticalDealbreakers = breakdown.lifestyle.dealbreakers.filter(
        (d) => d.severity === 'CRITICAL'
      );
      if (criticalDealbreakers.length > 0) {
        reasons.push('Critical lifestyle dealbreakers identified');
      }
    }

    // Risk concerns
    const highRiskConcerns = breakdown.risk.concerns.filter((c) => c.level === 'HIGH');
    if (highRiskConcerns.length > 0) {
      reasons.push('High-severity risk factors present');
    }

    // Values misalignment
    if (breakdown.values.alignment.misaligned.length >= 3) {
      reasons.push('Multiple core values may not align with this career');
    }

    return reasons;
  }

  /**
   * Generate alignment descriptions.
   */
  private generateAlignments(breakdown: FitBreakdown): string[] {
    const alignments: string[] = [];

    // Cognitive alignments
    if (breakdown.cognitive.analyticalFit.isMatch) {
      alignments.push(`Analytical thinking: Student (${breakdown.cognitive.analyticalFit.studentScore}%) matches Career demand (${breakdown.cognitive.analyticalFit.careerDemand}%)`);
    }
    if (breakdown.cognitive.creativeFit.isMatch) {
      alignments.push(`Creative thinking: Student (${breakdown.cognitive.creativeFit.studentScore}%) matches Career demand (${breakdown.cognitive.creativeFit.careerDemand}%)`);
    }
    if (breakdown.cognitive.systematicFit.isMatch) {
      alignments.push(`Systematic processing: Student (${breakdown.cognitive.systematicFit.studentScore}%) matches Career demand (${breakdown.cognitive.systematicFit.careerDemand}%)`);
    }

    // Motivation alignments
    if (breakdown.motivation.achievementFit.isMatch) {
      alignments.push(`Achievement drive: Student (${breakdown.motivation.achievementFit.studentScore}%) aligns with Career demand (${breakdown.motivation.achievementFit.careerDemand}%)`);
    }
    if (breakdown.motivation.impactFit.isMatch) {
      alignments.push(`Impact orientation: Student (${breakdown.motivation.impactFit.studentScore}%) aligns with Career demand (${breakdown.motivation.impactFit.careerDemand}%)`);
    }
    if (breakdown.motivation.autonomyFit.isMatch) {
      alignments.push(`Autonomy needs: Student (${breakdown.motivation.autonomyFit.studentScore}%) aligns with Career demand (${breakdown.motivation.autonomyFit.careerDemand}%)`);
    }

    // Lifestyle alignments
    if (breakdown.lifestyle.incomeFit.isMatch) {
      alignments.push(`Income aspirations: Student (${breakdown.lifestyle.incomeFit.studentScore}%) aligns with Career potential (${breakdown.lifestyle.incomeFit.careerDemand}%)`);
    }
    if (breakdown.lifestyle.workLifeBalanceFit.isMatch) {
      alignments.push(`Work-life balance: Student preference (${breakdown.lifestyle.workLifeBalanceFit.studentScore}%) aligns with Career reality (${breakdown.lifestyle.workLifeBalanceFit.careerDemand}%)`);
    }

    // Environment alignments
    if (breakdown.workEnvironment.peopleFit.isMatch) {
      alignments.push(`Social interaction: Student preference (${breakdown.workEnvironment.peopleFit.studentScore}%) aligns with Career environment (${breakdown.workEnvironment.peopleFit.careerDemand}%)`);
    }
    if (breakdown.workEnvironment.independenceFit.isMatch) {
      alignments.push(`Independence level: Student preference (${breakdown.workEnvironment.independenceFit.studentScore}%) aligns with Career autonomy (${breakdown.workEnvironment.independenceFit.careerDemand}%)`);
    }

    // Values alignments
    if (breakdown.values.impactFit.isMatch) {
      alignments.push(`Impact values: Student priority (${breakdown.values.impactFit.studentScore}%) aligns with Career opportunities (${breakdown.values.impactFit.careerDemand}%)`);
    }
    if (breakdown.values.learningFit.isMatch) {
      alignments.push(`Learning values: Student priority (${breakdown.values.learningFit.studentScore}%) aligns with Career development (${breakdown.values.learningFit.careerDemand}%)`);
    }

    return alignments;
  }

  /**
   * Generate conflict descriptions.
   */
  private generateConflicts(breakdown: FitBreakdown): string[] {
    const conflicts: string[] = [];

    // Cognitive conflicts
    if (!breakdown.cognitive.analyticalFit.isMatch && breakdown.cognitive.analyticalFit.gap > 25) {
      conflicts.push(`Analytical thinking: Student (${breakdown.cognitive.analyticalFit.studentScore}%) vs Career demand (${breakdown.cognitive.analyticalFit.careerDemand}%) - Gap: ${breakdown.cognitive.analyticalFit.gap}%`);
    }
    if (!breakdown.cognitive.creativeFit.isMatch && breakdown.cognitive.creativeFit.gap > 25) {
      conflicts.push(`Creative thinking: Student (${breakdown.cognitive.creativeFit.studentScore}%) vs Career demand (${breakdown.cognitive.creativeFit.careerDemand}%) - Gap: ${breakdown.cognitive.creativeFit.gap}%`);
    }

    // Motivation conflicts
    for (const conflict of breakdown.motivation.conflicts) {
      conflicts.push(`${conflict.dimension}: ${conflict.description}`);
    }

    // Lifestyle conflicts
    for (const dealbreaker of breakdown.lifestyle.dealbreakers) {
      conflicts.push(`${dealbreaker.dimension}: ${dealbreaker.studentPreference} vs ${dealbreaker.careerReality}`);
    }

    // Risk conflicts
    for (const concern of breakdown.risk.concerns) {
      conflicts.push(`Risk - ${concern.riskType}: ${concern.description}`);
    }

    // Environment conflicts
    if (!breakdown.workEnvironment.peopleFit.isMatch && breakdown.workEnvironment.peopleFit.gap > 25) {
      conflicts.push(`Social environment: Student preference (${breakdown.workEnvironment.peopleFit.studentScore}%) vs Career reality (${breakdown.workEnvironment.peopleFit.careerDemand}%)`);
    }

    // Values conflicts
    for (const misaligned of breakdown.values.alignment.misaligned) {
      conflicts.push(`Values - ${misaligned}: Student priority not well-supported by this career`);
    }

    return conflicts;
  }

  /**
   * Generate summary explanation.
   */
  private generateSummary(fitResult: CareerFitResult): string {
    const parts: string[] = [];
    const breakdown = fitResult.breakdown;

    // Fit level summary
    switch (fitResult.fitLevel) {
      case 'EXCELLENT':
        parts.push('This career represents an excellent fit.');
        break;
      case 'GOOD':
        parts.push('This career represents a good fit.');
        break;
      case 'MODERATE':
        parts.push('This career represents a moderate fit with some areas of alignment and some concerns.');
        break;
      case 'POOR':
        parts.push('This career represents a poor fit with significant misalignments.');
        break;
      case 'MISFIT':
        parts.push('This career represents a significant misfit.');
        break;
    }

    // Key strength summary
    const majorStrengths = fitResult.strengths.filter((s) => s.impact === 'MAJOR');
    if (majorStrengths.length > 0) {
      const strengthAreas = majorStrengths.slice(0, 2).map((s) => s.category.toLowerCase());
      parts.push(`Primary strengths in: ${strengthAreas.join(' and ')}.`);
    }

    // Key concern summary
    const highConcerns = fitResult.concerns.filter((c) => c.severity === 'HIGH');
    if (highConcerns.length > 0) {
      parts.push(`Notable concerns in ${highConcerns.length} area(s) require attention.`);
    }

    // Dimension highlights
    const dimensions = [
      { name: 'cognitive', score: breakdown.cognitive.score },
      { name: 'motivational', score: breakdown.motivation.score },
      { name: 'lifestyle', score: breakdown.lifestyle.score },
    ];

    const bestDimension = dimensions.reduce((best, current) =>
      current.score > best.score ? current : best
    );
    const worstDimension = dimensions.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    );

    if (bestDimension.score >= 70) {
      parts.push(`Strongest alignment in ${bestDimension.name} dimensions.`);
    }

    if (worstDimension.score < 50) {
      parts.push(`Weakest alignment in ${worstDimension.name} dimensions.`);
    }

    // Confidence note
    if (fitResult.confidence.level === 'LOW') {
      parts.push('Interpret with caution due to low confidence in assessment.');
    }

    return parts.join(' ');
  }

  /**
   * Generate a brief fit description.
   */
  generateBriefDescription(fitResult: CareerFitResult): string {
    const score = fitResult.overallFitScore;
    const level = fitResult.fitLevel;
    const strengthCount = fitResult.strengths.filter((s) => s.impact === 'MAJOR').length;
    const concernCount = fitResult.concerns.filter((c) => c.severity === 'HIGH').length;

    let description = `${level} fit (${score}%)`;

    if (strengthCount > 0) {
      description += ` with ${strengthCount} major strength${strengthCount > 1 ? 's' : ''}`;
    }

    if (concernCount > 0) {
      description += strengthCount > 0 ? ` and ${concernCount} major concern${concernCount > 1 ? 's' : ''}` : ` with ${concernCount} major concern${concernCount > 1 ? 's' : ''}`;
    }

    description += `. Confidence: ${fitResult.confidence.level.toLowerCase()}.`;

    return description;
  }

  /**
   * Generate recommendations based on fit.
   */
  generateRecommendations(fitResult: CareerFitResult): string[] {
    const recommendations: string[] = [];

    if (fitResult.fitLevel === 'EXCELLENT' || fitResult.fitLevel === 'GOOD') {
      recommendations.push('Explore this career path further through informational interviews and job shadowing');
    }

    if (fitResult.fitLevel === 'MODERATE') {
      recommendations.push('Investigate areas of concern more thoroughly before making decisions');
    }

    if (fitResult.fitLevel === 'POOR' || fitResult.fitLevel === 'MISFIT') {
      recommendations.push('Consider alternative careers with stronger alignment to your profile');
    }

    // Strength-based recommendations
    for (const strength of fitResult.strengths.slice(0, 2)) {
      recommendations.push(`Leverage your strength in ${strength.dimension}: ${strength.description}`);
    }

    // Concern-based recommendations
    for (const concern of fitResult.concerns.filter((c) => c.isAddressable).slice(0, 2)) {
      if (concern.suggestion) {
        recommendations.push(`Address ${concern.dimension} concern: ${concern.suggestion}`);
      }
    }

    return recommendations;
  }
}

/**
 * Factory function for FitExplanationEngine.
 */
export function createFitExplanationEngine(): FitExplanationEngine {
  return new FitExplanationEngine();
}
