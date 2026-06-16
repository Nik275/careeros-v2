/**
 * CareerOS Career Recommendation Engine - Recommendation Explainer
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Generates explanations for career recommendations.
 *
 * @module recommendation-explainer
 * @version 1.0.0
 */

import type { CareerRecommendation, RecommendationExplanation } from './recommendation-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';
import type { CareerFitResult } from '../career-fit/career-fit-types';

/**
 * Generates explanations for career recommendations.
 *
 * Explains why careers are recommended, their advantages, concerns,
 * and relative positioning in the recommendation set.
 */
export class RecommendationExplainer {
  /**
   * Generate complete explanation for a recommendation.
   */
  explainRecommendation(
    recommendation: CareerRecommendation,
    allRecommendations: CareerRecommendation[],
    career: CareerIntelligence
  ): CareerRecommendation {
    const explanation: RecommendationExplanation = {
      whyRecommended: this.generateWhyRecommended(recommendation, career),
      whyNotHigher: this.generateWhyNotHigher(recommendation, allRecommendations),
      whyNotLower: this.generateWhyNotLower(recommendation, allRecommendations),
      majorAdvantages: this.generateMajorAdvantages(recommendation, career),
      majorConcerns: this.generateMajorConcerns(recommendation),
      uniqueSellingPoints: this.generateUniqueSellingPoints(recommendation, career),
      fitSummary: this.generateFitSummary(recommendation),
      outlookSummary: this.generateOutlookSummary(recommendation, career),
    };

    return {
      ...recommendation,
      explanation,
    };
  }

  /**
   * Generate reasons why this career is recommended.
   */
  private generateWhyRecommended(
    recommendation: CareerRecommendation,
    career: CareerIntelligence
  ): string[] {
    const reasons: string[] = [];

    // Fit-based reasons
    if (recommendation.fitScore >= 75) {
      reasons.push(`Strong overall fit (${recommendation.fitScore}%) with your profile`);
    } else if (recommendation.fitScore >= 60) {
      reasons.push(`Good overall fit (${recommendation.fitScore}%) with your profile`);
    }

    // Dimension-specific reasons
    if (recommendation.fitResult.breakdown.cognitive.score >= 75) {
      reasons.push('Your cognitive abilities align well with career demands');
    }

    if (recommendation.fitResult.breakdown.motivation.score >= 75) {
      reasons.push('Your motivations match what this career rewards');
    }

    if (recommendation.lifestyleAlignmentScore >= 75) {
      reasons.push('Lifestyle preferences align with career characteristics');
    }

    // Future outlook reasons
    if (recommendation.futureRelevanceScore >= 75) {
      reasons.push('Strong future relevance and growth prospects');
    }

    if (recommendation.careerMobilityScore >= 75) {
      reasons.push('Excellent career mobility and optionality');
    }

    // Risk and market reasons
    if (recommendation.riskAlignmentScore >= 75) {
      reasons.push('Risk profile aligns with your tolerance');
    }

    if (recommendation.marketOpportunityScore >= 70) {
      reasons.push('Favorable market opportunities');
    }

    // Career-specific advantages
    if (career.careerAdvantages.futureRelevance.score >= 75) {
      reasons.push('Career is positioned for future growth');
    }

    if (career.careerAdvantages.transferability.score >= 75) {
      reasons.push('Skills are highly transferable to other fields');
    }

    // Values alignment
    if (recommendation.fitResult.breakdown.values.score >= 75) {
      reasons.push('Strong alignment with your core values');
    }

    return reasons;
  }

  /**
   * Generate reasons why not ranked higher.
   */
  private generateWhyNotHigher(
    recommendation: CareerRecommendation,
    allRecommendations: CareerRecommendation[]
  ): string[] {
    const reasons: string[] = [];

    if (recommendation.rank === 1) {
      return ['This is the top recommendation'];
    }

    // Compare to higher-ranked recommendations
    const higherRanked = allRecommendations.filter((r) => r.rank < recommendation.rank);

    if (higherRanked.length === 0) {
      return reasons;
    }

    const topAlternative = higherRanked[0];

    // Score-based reasons
    if (topAlternative.fitScore > recommendation.fitScore + 10) {
      reasons.push(`Lower fit score than ${topAlternative.careerTitle} (${recommendation.fitScore}% vs ${topAlternative.fitScore}%)`);
    }

    if (topAlternative.futureRelevanceScore > recommendation.futureRelevanceScore + 10) {
      reasons.push('Lower future relevance compared to higher-ranked options');
    }

    if (topAlternative.careerMobilityScore > recommendation.careerMobilityScore + 10) {
      reasons.push('Less career mobility than higher-ranked alternatives');
    }

    // Fit concern reasons
    const highConcerns = recommendation.fitResult.concerns.filter((c) => c.severity === 'HIGH');
    if (highConcerns.length > 0) {
      reasons.push(`${highConcerns.length} major concern(s) affect this recommendation`);
    }

    // Specific weaknesses
    const weakestDimension = this.getWeakestDimension(recommendation.fitResult);
    if (weakestDimension.score < 50) {
      reasons.push(`Weaker alignment in ${weakestDimension.name.toLowerCase()} dimensions`);
    }

    return reasons;
  }

  /**
   * Generate reasons why not ranked lower.
   */
  private generateWhyNotLower(
    recommendation: CareerRecommendation,
    allRecommendations: CareerRecommendation[]
  ): string[] {
    const reasons: string[] = [];

    const lowerRanked = allRecommendations.filter((r) => r.rank > recommendation.rank);

    if (lowerRanked.length === 0) {
      return ['This is the lowest-ranked recommendation'];
    }

    const nextLower = lowerRanked[0];

    // Score-based reasons
    if (recommendation.fitScore > nextLower.fitScore + 10) {
      reasons.push(`Better fit than ${nextLower.careerTitle} (${recommendation.fitScore}% vs ${nextLower.fitScore}%)`);
    }

    if (recommendation.futureRelevanceScore > nextLower.futureRelevanceScore + 10) {
      reasons.push('Better future outlook than lower-ranked options');
    }

    if (recommendation.careerMobilityScore > nextLower.careerMobilityScore + 10) {
      reasons.push('Better career mobility than lower-ranked alternatives');
    }

    // Strength-based reasons
    const majorStrengths = recommendation.fitResult.strengths.filter((s) => s.impact === 'MAJOR');
    if (majorStrengths.length >= 2) {
      reasons.push(`${majorStrengths.length} major strengths support this recommendation`);
    }

    // Values alignment
    if (recommendation.fitResult.breakdown.values.score >= 70) {
      reasons.push('Stronger values alignment than lower-ranked careers');
    }

    return reasons;
  }

  /**
   * Generate major advantages.
   */
  private generateMajorAdvantages(
    recommendation: CareerRecommendation,
    career: CareerIntelligence
  ): string[] {
    const advantages: string[] = [];

    // Fit-based advantages
    for (const strength of recommendation.fitResult.strengths.filter((s) => s.impact === 'MAJOR')) {
      advantages.push(strength.description);
    }

    // Career-specific advantages
    if (career.careerAdvantages.futureRelevance.score >= 75) {
      advantages.push('Positioned for long-term relevance in evolving job market');
    }

    if (career.careerAdvantages.optionality.score >= 75) {
      advantages.push('Multiple career paths and options available');
    }

    if (career.careerAdvantages.careerMobility.score >= 75) {
      advantages.push('Strong upward and lateral mobility opportunities');
    }

    if (career.careerAdvantages.transferability.score >= 75) {
      advantages.push('Skills transfer well to adjacent fields and industries');
    }

    // Lifestyle advantages
    if (career.lifestyleCharacteristics.workLifeBalance.score >= 70) {
      advantages.push('Good work-life balance relative to career level');
    }

    if (career.lifestyleCharacteristics.incomePotential.score >= 75) {
      advantages.push('Strong income potential and earning growth');
    }

    if (career.lifestyleCharacteristics.locationFlexibility.score >= 75) {
      advantages.push('High location flexibility and remote work options');
    }

    // Risk advantages
    if (career.careerRisks.automationRisk.score <= 30) {
      advantages.push('Low risk of automation displacement');
    }

    if (career.careerRisks.burnoutRisk.score <= 40) {
      advantages.push('Lower than average burnout risk');
    }

    return advantages.slice(0, 6);
  }

  /**
   * Generate major concerns.
   */
  private generateMajorConcerns(recommendation: CareerRecommendation): string[] {
    const concerns: string[] = [];

    // Fit-based concerns
    for (const concern of recommendation.fitResult.concerns.filter((c) => c.severity === 'HIGH')) {
      concerns.push(concern.description);
    }

    // Recommendation-specific concerns
    if (recommendation.recommendationType === 'STRETCH_MATCH') {
      concerns.push('This represents a stretch opportunity with additional challenges');
    }

    if (recommendation.fitScore < 55) {
      concerns.push('Moderate fit score suggests careful evaluation needed');
    }

    // Risk alignment concerns
    if (recommendation.riskAlignmentScore < 50) {
      concerns.push('Career risk profile may exceed your risk tolerance');
    }

    // Lifestyle alignment concerns
    if (recommendation.lifestyleAlignmentScore < 50) {
      concerns.push('Lifestyle preferences may not align with career demands');
    }

    return concerns.slice(0, 4);
  }

  /**
   * Generate unique selling points.
   */
  private generateUniqueSellingPoints(
    recommendation: CareerRecommendation,
    career: CareerIntelligence
  ): string[] {
    const usps: string[] = [];

    // Compare scores to identify standout features
    const scores = [
      { name: 'Fit', score: recommendation.fitScore },
      { name: 'Future Relevance', score: recommendation.futureRelevanceScore },
      { name: 'Career Mobility', score: recommendation.careerMobilityScore },
      { name: 'Lifestyle', score: recommendation.lifestyleAlignmentScore },
      { name: 'Risk', score: recommendation.riskAlignmentScore },
    ];

    const highest = scores.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    if (highest.score >= 80) {
      usps.push(`Exceptional ${highest.name.toLowerCase()} (${highest.score}%)`);
    }

    // Career-specific USPs
    if (career.careerAdvantages.futureRelevance.score >= 80) {
      usps.push('Future-proof career with strong growth trajectory');
    }

    if (career.careerAdvantages.optionality.score >= 80 && career.careerAdvantages.transferability.score >= 70) {
      usps.push('Maximum career flexibility and optionality');
    }

    if (career.lifestyleCharacteristics.incomePotential.score >= 80 && career.lifestyleCharacteristics.workLifeBalance.score >= 60) {
      usps.push('Rare combination of high income and reasonable balance');
    }

    // Fit-specific USPs
    const valuesFit = recommendation.fitResult.breakdown.values;
    if (valuesFit.score >= 80 && valuesFit.alignment.highlyAligned.length >= 3) {
      usps.push('Strong values alignment across multiple dimensions');
    }

    return usps;
  }

  /**
   * Generate fit summary.
   */
  private generateFitSummary(recommendation: CareerRecommendation): string {
    const parts: string[] = [];

    parts.push(`${recommendation.recommendationType.replace('_', ' ')}`);

    const strengths = recommendation.fitResult.strengths.filter((s) => s.impact === 'MAJOR');
    if (strengths.length > 0) {
      const strengthAreas = strengths.slice(0, 2).map((s) => s.dimension);
      parts.push(`with major strengths in ${strengthAreas.join(' and ')}`);
    }

    const concerns = recommendation.fitResult.concerns.filter((c) => c.severity === 'HIGH');
    if (concerns.length > 0) {
      parts.push(`and ${concerns.length} area(s) requiring attention`);
    }

    return parts.join(' ') + '.';
  }

  /**
   * Generate outlook summary.
   */
  private generateOutlookSummary(
    recommendation: CareerRecommendation,
    career: CareerIntelligence
  ): string {
    const parts: string[] = [];

    if (recommendation.futureRelevanceScore >= 75) {
      parts.push('Strong future outlook');
    } else if (recommendation.futureRelevanceScore >= 60) {
      parts.push('Positive future outlook');
    } else {
      parts.push('Moderate future outlook');
    }

    if (career.careerAdvantages.careerMobility.score >= 70) {
      parts.push('with excellent advancement opportunities');
    }

    if (career.careerRisks.automationRisk.score <= 40) {
      parts.push('and low automation risk');
    }

    return parts.join(' ') + '.';
  }

  /**
   * Get weakest dimension.
   */
  private getWeakestDimension(fitResult: CareerFitResult): { name: string; score: number } {
    const dimensions = [
      { name: 'Cognitive', score: fitResult.breakdown.cognitive.score },
      { name: 'Motivation', score: fitResult.breakdown.motivation.score },
      { name: 'Lifestyle', score: fitResult.breakdown.lifestyle.score },
      { name: 'Risk', score: fitResult.breakdown.risk.score },
      { name: 'Work Environment', score: fitResult.breakdown.workEnvironment.score },
      { name: 'Values', score: fitResult.breakdown.values.score },
    ];

    return dimensions.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    );
  }

  /**
   * Generate brief recommendation summary.
   */
  generateBriefSummary(recommendation: CareerRecommendation): string {
    return `${recommendation.careerTitle}: ${recommendation.recommendationType.replace('_', ' ')} (${recommendation.score}%) - ${recommendation.explanation.fitSummary}`;
  }
}

/**
 * Factory function for RecommendationExplainer.
 */
export function createRecommendationExplainer(): RecommendationExplainer {
  return new RecommendationExplainer();
}
