/**
 * India Intelligence - Explanation Engine
 *
 * Generates context-aware explanations for Indian students:
 * - Incorporates regional constraints into career advice
 * - Explains economic realities and tradeoffs
 * - Addresses family pressure and cultural context
 * - Provides reality-based guidance
 *
 * @module intelligence/india-intelligence
 */

import {
  IndiaIntelligenceInput,
  IndiaExplanation,
  IndiaIntelligenceAnalysis,
  IndiaCareerMotivation,
  EconomicStratum,
  RegionalTier,
  FamilyBusinessInvolvement,
  getEconomicStratumLabel,
  getRegionalTierLabel,
} from './types';

/**
 * Explanation Engine Configuration
 */
export interface IndiaExplanationEngineConfig {
  /** Include constraint warnings */
  includeConstraintWarnings: boolean;
  /** Include family context */
  includeFamilyContext: boolean;
  /** Verbosity level */
  verbosity: 'minimal' | 'standard' | 'detailed';
}

/**
 * Default Explanation Engine configuration
 */
export const DEFAULT_EXPLANATION_CONFIG: IndiaExplanationEngineConfig = {
  includeConstraintWarnings: true,
  includeFamilyContext: true,
  verbosity: 'detailed',
};

/**
 * India Explanation Engine
 *
 * Generates human-readable explanations
 */
export class IndiaExplanationEngine {
  private config: IndiaExplanationEngineConfig;

  constructor(config: Partial<IndiaExplanationEngineConfig> = {}) {
    this.config = { ...DEFAULT_EXPLANATION_CONFIG, ...config };
  }

  /**
   * Generate complete explanation
   */
  generate(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): IndiaExplanation {
    return {
      summary: this.generateSummary(input, analysis),
      contextParagraph: this.generateContextParagraph(input, analysis),
      constraintImpact: this.generateConstraintImpact(input, analysis),
      familyContext: this.generateFamilyContext(input, analysis),
      economicReality: this.generateEconomicReality(input, analysis),
      regionalConsiderations: this.generateRegionalConsiderations(input, analysis),
      motivationAlignment: this.generateMotivationAlignment(analysis),
      practicalAdvice: this.generatePracticalAdvice(input, analysis),
    };
  }

  /**
   * Generate one-sentence summary
   */
  private generateSummary(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    const primaryPath = analysis.integratedRecommendations[0]?.path || 'further exploration';
    const constraints = analysis.economic.constraints.length + analysis.regional.constraintFactors.length;

    let summary = '';

    if (constraints > 3) {
      summary = `Given your ${getEconomicStratumLabel(input.profile.familyIncome).toLowerCase()} background from ${getRegionalTierLabel(input.profile.currentLocation).toLowerCase()}, `;
      summary += `your optimal path is ${primaryPath}, though you'll need to navigate significant constraints.`;
    } else {
      summary = `Based on your profile from ${input.profile.homeState}, `;
      summary += `${primaryPath} represents your strongest opportunity given your motivations and constraints.`;
    }

    return summary;
  }

  /**
   * Generate context paragraph
   */
  private generateContextParagraph(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let paragraph = '';

    // Open with background
    paragraph += `You are coming from a ${getEconomicStratumLabel(input.profile.familyIncome).toLowerCase()} background `;
    paragraph += `in ${getRegionalTierLabel(input.profile.currentLocation).toLowerCase()} ${input.profile.homeState}. `;

    // Academic context
    if (input.profile.academicPerformance.class10Percentage >= 85) {
      paragraph += `Your strong academic performance (Class 10: ${input.profile.academicPerformance.class10Percentage}%) `;
      paragraph += `opens doors to competitive institutions. `;
    }

    // Motivation context
    const primaryMotivation = analysis.motivations.primaryMotivation;
    paragraph += `Your primary driver appears to be ${this.getMotivationLabel(primaryMotivation).toLowerCase()}. `;

    // Constraint acknowledgment
    const criticalConstraints = [
      ...analysis.economic.constraints.filter(c => c.severity === 'BLOCKING'),
      ...analysis.regional.constraintFactors.filter(c => c.impact === 'CRITICAL'),
    ];

    if (criticalConstraints.length > 0) {
      paragraph += `However, ${criticalConstraints[0].description.toLowerCase()}, which shapes your options significantly.`;
    }

    return paragraph;
  }

  /**
   * Generate constraint impact explanation
   */
  private generateConstraintImpact(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let explanation = '';

    // Economic constraints
    if (analysis.economic.constraints.length > 0) {
      explanation += 'Economic constraints affect your choices: ';

      for (const constraint of analysis.economic.constraints.slice(0, 2)) {
        explanation += `${constraint.description}. `;
        explanation += `This means ${constraint.alternatives[0]}. `;
      }
    }

    // Regional constraints
    if (analysis.regional.constraintFactors.length > 0) {
      if (explanation) explanation += 'Additionally, ';
      explanation += 'geographic limitations shape your options: ';

      for (const factor of analysis.regional.constraintFactors.slice(0, 2)) {
        explanation += `${factor.description}. `;
      }
    }

    if (!explanation) {
      explanation = 'Your economic and geographic situation provides flexibility in choosing your path. ';
      explanation += 'Focus on aligning choices with your long-term goals rather than immediate constraints.';
    }

    return explanation;
  }

  /**
   * Generate family context explanation
   */
  private generateFamilyContext(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let context = '';

    if (!this.config.includeFamilyContext) return context;

    // Family business context
    if (input.profile.familyBusinessInvolvement !== FamilyBusinessInvolvement.NO_BUSINESS) {
      context += `Your family's ${input.profile.familyBusinessInvolvement.toLowerCase().replace(/_/g, ' ')} `;
      context += `represents both opportunity and consideration. `;

      if (analysis.familyBusiness) {
        context += `The optimal approach is ${analysis.familyBusiness.recommendations.optimalPath.toLowerCase().replace(/_/g, ' ')}. `;
      }
    }

    // Family pressure
    if (input.profile.pressureIntensity !== 'NONE' && input.profile.pressureIntensity !== 'LOW') {
      context += `You face ${input.profile.pressureIntensity.toLowerCase()} family pressure, `;
      context += `particularly around ${input.profile.familyExpectations[0] || 'career choices'}. `;
      context += `While respecting family input is important, ensure your decision aligns with your capabilities and interests.`;
    }

    // Family dependents
    if (input.profile.familyDependents > 0) {
      context += ` With ${input.profile.familyDependents} dependent family members, `;
      context += `your timeline to earning has additional urgency.`;
    }

    if (!context) {
      context = 'Your family situation provides supportive flexibility for your career exploration.';
    }

    return context;
  }

  /**
   * Generate economic reality explanation
   */
  private generateEconomicReality(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let reality = '';

    const stratum = input.profile.familyIncome;
    const totalBudget = analysis.economic.affordability.maxEducationBudget +
                       analysis.economic.affordability.loanCapacity;

    // Opening
    reality += `As a ${getEconomicStratumLabel(stratum).toLowerCase()} family, `;
    reality += `your combined education budget is approximately ₹${(totalBudget / 100000).toFixed(1)} lakhs `;
    reality += `(family contribution + loan capacity). `;

    // ROI focus
    if (stratum <= EconomicStratum.LOWER_MIDDLE) {
      reality += 'Given financial constraints, prioritize paths with fastest positive ROI. ';
      reality += 'Government jobs and skill-based careers offer reliable income streams.';
    } else if (stratum <= EconomicStratum.MIDDLE_CLASS) {
      reality += 'You have moderate flexibility but should avoid high-risk paths. ';
      reality += 'Balance aspiration with financial prudence.';
    } else {
      reality += 'Your financial capacity allows broader exploration, ';
      reality += 'including premium education options if aligned with goals.';
    }

    // Critical earning points
    if (analysis.economic.timeline.criticalEarningPoints.length > 0) {
      const firstPoint = analysis.economic.timeline.criticalEarningPoints[0];
      reality += ` By age ${firstPoint.age}, you'll need to contribute ₹${(firstPoint.amount / 1000).toFixed(0)}K monthly.`;
    }

    return reality;
  }

  /**
   * Generate regional considerations
   */
  private generateRegionalConsiderations(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let considerations = '';

    const tier = input.profile.currentLocation;

    // Location context
    considerations += `Your location in ${getRegionalTierLabel(tier).toLowerCase()} ${input.profile.homeState} `;

    // Opportunities
    if (tier === RegionalTier.TIER_1_METRO) {
      considerations += 'provides access to diverse opportunities across sectors. ';
      considerations += 'Leverage local networking and proximity to institutions.';
    } else if (tier === RegionalTier.TIER_2_CITY) {
      considerations += 'offers growing opportunities, particularly in IT and manufacturing. ';
      considerations += 'Consider whether to build locally or relocate to metros for specific paths.';
    } else {
      considerations += 'has limited formal career opportunities. ';
      considerations += 'Relocation or remote work capability becomes essential for most professional paths.';
    }

    // Mobility recommendation
    if (analysis.regional.recommendations.mobilityStrategy) {
      considerations += ` ${analysis.regional.recommendations.mobilityStrategy}`;
    }

    return considerations;
  }

  /**
   * Generate motivation alignment explanation
   */
  private generateMotivationAlignment(analysis: IndiaIntelligenceAnalysis): string {
    let alignment = '';

    const primaryMotivation = analysis.motivations.primaryMotivation;
    const topAlignment = analysis.motivations.alignmentWithPathways[0];

    alignment += `Your primary motivation for ${this.getMotivationLabel(primaryMotivation).toLowerCase()} `;

    if (topAlignment.alignmentScore > 0.7) {
      alignment += `aligns well with ${topAlignment.pathway}. `;
      alignment += `This path satisfies your ${topAlignment.satisfyingMotivations.map(m => this.getMotivationLabel(m).toLowerCase()).join(', ')}. `;
    } else {
      alignment += `may need balancing with practical constraints. `;
      alignment += `No single path fully satisfies all your motivations - consider tradeoffs carefully.`;
    }

    // Conflicts
    if (analysis.motivations.conflicts.length > 0) {
      const conflict = analysis.motivations.conflicts[0];
      alignment += ` Note the tension between ${this.getMotivationLabel(conflict.motivation1).toLowerCase()} `;
      alignment += `and ${this.getMotivationLabel(conflict.motivation2).toLowerCase()}: `;
      alignment += `${conflict.resolution}`;
    }

    return alignment;
  }

  /**
   * Generate practical advice
   */
  private generatePracticalAdvice(
    input: IndiaIntelligenceInput,
    analysis: IndiaIntelligenceAnalysis
  ): string {
    let advice = '';

    // Immediate next steps
    const topRec = analysis.integratedRecommendations[0];
    if (topRec) {
      advice += `Focus on ${topRec.path}. `;
      advice += `Next steps: ${topRec.nextSteps.slice(0, 2).join(', ')}. `;
    }

    // Constraint workarounds
    if (analysis.regional.recommendations.constraintWorkarounds.length > 0) {
      advice += `To overcome constraints: ${analysis.regional.recommendations.constraintWorkarounds[0]}. `;
    }

    // Financial guidance
    if (analysis.economic.recommendations.scholarshipTargets.length > 0) {
      advice += `Pursue ${analysis.economic.recommendations.scholarshipTargets[0]} to reduce financial burden. `;
    }

    // Reality check
    if (analysis.realityCheck.dreamCareerFeasibility === 'LOW' ||
        analysis.realityCheck.dreamCareerFeasibility === 'VERY_LOW') {
      advice += `Your dream career has significant feasibility challenges given your constraints. `;
      advice += `Consider ${analysis.realityCheck.optimalPathGivenConstraints} as a more achievable path.`;
    }

    // Family business advice
    if (input.profile.familyBusinessInvolvement !== FamilyBusinessInvolvement.NO_BUSINESS &&
        analysis.familyBusiness) {
      advice += ` Regarding family business: ${analysis.familyBusiness.recommendations.rationale[0]}`;
    }

    return advice;
  }

  /**
   * Get human-readable motivation label
   */
  private getMotivationLabel(motivation: IndiaCareerMotivation): string {
    const labels: Record<IndiaCareerMotivation, string> = {
      [IndiaCareerMotivation.STABILITY_SEEKING]: 'Stability Seeking',
      [IndiaCareerMotivation.PRESTIGE_SEEKING]: 'Prestige Seeking',
      [IndiaCareerMotivation.FAMILY_RESPONSIBILITY]: 'Family Responsibility',
      [IndiaCareerMotivation.SOCIAL_MOBILITY]: 'Social Mobility',
      [IndiaCareerMotivation.PUBLIC_SERVICE]: 'Public Service',
      [IndiaCareerMotivation.WEALTH_CREATION]: 'Wealth Creation',
      [IndiaCareerMotivation.ENTREPRENEURSHIP]: 'Entrepreneurship',
      [IndiaCareerMotivation.FAMILY_LEGACY]: 'Family Legacy',
      [IndiaCareerMotivation.GEOGRAPHICAL_MOBILITY]: 'Geographical Mobility',
      [IndiaCareerMotivation.STUDY_ABROAD]: 'Study Abroad',
      [IndiaCareerMotivation.GIVE_BACK_SOCIETY]: 'Giving Back to Society',
      [IndiaCareerMotivation.PROVE_ABILITY]: 'Proving Ability',
    };

    return labels[motivation] || motivation;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IndiaExplanationEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Factory function for India Explanation Engine
 */
export function createIndiaExplanationEngine(
  config?: Partial<IndiaExplanationEngineConfig>
): IndiaExplanationEngine {
  return new IndiaExplanationEngine(config);
}
