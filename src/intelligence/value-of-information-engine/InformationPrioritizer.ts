/**
 * CareerOS Value of Information Engine - Information Prioritizer
 *
 * Ranks information opportunities by their value.
 */

import type {
  InformationGap,
  InformationOpportunity,
  InformationMethod,
  PrioritizationResult,
  ValueOfInformationEngineConfig,
} from './types';

import type {
  ValueOfInformationCalculation,
} from './types';

/**
 * Prioritizes information opportunities by their value.
 */
export class InformationPrioritizer {
  private config: ValueOfInformationEngineConfig;

  constructor(config: ValueOfInformationEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: prioritize all opportunities.
   */
  prioritize(
    gaps: InformationGap[],
    calculations: ValueOfInformationCalculation[]
  ): PrioritizationResult {
    // Generate opportunities for each gap
    const opportunities = this.generateOpportunities(gaps, calculations);

    // Calculate scores
    const scoredOpportunities = opportunities.map((opp) => ({
      ...opp,
      score: this.calculateOpportunityScore(opp),
    }));

    // Sort by score (descending)
    scoredOpportunities.sort((a, b) => b.score - a.score);

    // Update ranks
    const rankedOpportunities = scoredOpportunities.map((opp, index) => ({
      ...opp,
      rank: index + 1,
    }));

    // Identify quick wins (high value, low cost)
    const quickWins = this.identifyQuickWins(rankedOpportunities);

    // Identify high impact opportunities
    const highImpact = this.identifyHighImpact(rankedOpportunities);

    // Build minimum viable set
    const minimumViableSet = this.buildMinimumViableSet(rankedOpportunities);

    // Calculate confidence progression
    const confidenceProgression = this.calculateConfidenceProgression(minimumViableSet);

    return {
      rankedOpportunities,
      quickWins,
      highImpact,
      minimumViableSet,
      confidenceProgression,
    };
  }

  /**
   * Generate information opportunities for gaps.
   */
  private generateOpportunities(
    gaps: InformationGap[],
    calculations: ValueOfInformationCalculation[]
  ): InformationOpportunity[] {
    const opportunities: InformationOpportunity[] = [];

    for (const gap of gaps) {
      const calculation = calculations.find((c) => c.gapId === gap.id);
      if (!calculation) continue;

      // Generate opportunities based on gap category
      const categoryOpportunities = this.generateCategoryOpportunities(gap, calculation);
      opportunities.push(...categoryOpportunities);
    }

    // Remove duplicates
    const uniqueOpportunities = this.deduplicateOpportunities(opportunities);

    return uniqueOpportunities;
  }

  /**
   * Generate opportunities for a specific gap category.
   */
  private generateCategoryOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    const opportunities: InformationOpportunity[] = [];

    switch (gap.category) {
      case 'interest':
        opportunities.push(...this.generateInterestOpportunities(gap, calculation));
        break;
      case 'aptitude':
        opportunities.push(...this.generateAptitudeOpportunities(gap, calculation));
        break;
      case 'values':
        opportunities.push(...this.generateValuesOpportunities(gap, calculation));
        break;
      case 'skills':
        opportunities.push(...this.generateSkillsOpportunities(gap, calculation));
        break;
      case 'market':
        opportunities.push(...this.generateMarketOpportunities(gap, calculation));
        break;
      case 'identity':
        opportunities.push(...this.generateIdentityOpportunities(gap, calculation));
        break;
      case 'constraints':
        opportunities.push(...this.generateConstraintsOpportunities(gap, calculation));
        break;
      case 'outcomes':
        opportunities.push(...this.generateOutcomesOpportunities(gap, calculation));
        break;
    }

    return opportunities;
  }

  /**
   * Generate interest exploration opportunities.
   */
  private generateInterestOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-interest-assessment-${gap.id}`,
        activity: 'Comprehensive Interest Assessment',
        method: 'assessment',
        informationCategory: 'interest',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '45-60 minutes',
          effort: 'low',
        },
        prerequisites: ['None'],
        risks: ['May surface unexpected interests', 'Could challenge current direction'],
        alternatives: ['Informal interest journaling', 'Career conversation'],
        recommendationReason: [
          `Directly addresses ${gap.aspect}`,
          'Standardized assessment with proven validity',
          'Low cost, high information value',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
      {
        id: `opp-interest-shadowing-${gap.id}`,
        activity: 'Career Shadowing Experience',
        method: 'shadowing',
        informationCategory: 'interest',
        informationValue: calculation.evi * 0.9,
        confidenceGain: calculation.confidenceImprovement * 0.8,
        utilityImprovement: calculation.utilityImprovement * 0.9,
        decisionImprovement: calculation.decisionImprovement * 0.9,
        acquisitionCost: {
          time: '1-3 days',
          effort: 'medium',
        },
        prerequisites: ['Identify target careers', 'Arrange shadowing opportunity'],
        risks: ['Limited availability', 'Single experience may not be representative'],
        alternatives: ['Informational interviews', 'Virtual job shadowing'],
        recommendationReason: [
          'Real-world exposure to career realities',
          'Direct observation of daily work',
          'More experiential than assessments',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate aptitude assessment opportunities.
   */
  private generateAptitudeOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-aptitude-testing-${gap.id}`,
        activity: 'Aptitude Testing Battery',
        method: 'assessment',
        informationCategory: 'aptitude',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '2-3 hours',
          effort: 'medium',
        },
        prerequisites: ['None'],
        risks: ['Test anxiety may affect results', 'Single assessment may not capture full picture'],
        alternatives: ['Skill self-assessment', 'Project-based assessment'],
        recommendationReason: [
          `Validates ${gap.aspect}`,
          'Objective measurement of abilities',
          'Predictive of career success',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
      {
        id: `opp-aptitude-project-${gap.id}`,
        activity: 'Skills Demonstration Project',
        method: 'project',
        informationCategory: 'aptitude',
        informationValue: calculation.evi * 0.85,
        confidenceGain: calculation.confidenceImprovement * 0.7,
        utilityImprovement: calculation.utilityImprovement * 0.9,
        decisionImprovement: calculation.decisionImprovement * 0.85,
        acquisitionCost: {
          time: '1-2 weeks',
          effort: 'high',
        },
        prerequisites: ['Identify skill to assess', 'Project scope definition'],
        risks: ['Time investment', 'May require resources'],
        alternatives: ['Aptitude testing', 'Portfolio review'],
        recommendationReason: [
          'Practical demonstration of ability',
          'Produces tangible evidence',
          'Also builds skills',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate values clarification opportunities.
   */
  private generateValuesOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-values-reflection-${gap.id}`,
        activity: 'Values Clarification Exercise',
        method: 'reflection',
        informationCategory: 'values',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '2-3 hours',
          effort: 'medium',
        },
        prerequisites: ['Willingness to self-reflect'],
        risks: ['May surface value conflicts', 'Requires honesty with self'],
        alternatives: ['Values card sort', 'Guided discussion'],
        recommendationReason: [
          `Directly addresses ${gap.aspect}`,
          'Structured reflection on priorities',
          'Identifies non-negotiable values',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
      {
        id: `opp-values-conversation-${gap.id}`,
        activity: 'Values Conversation with Mentor',
        method: 'conversation',
        informationCategory: 'values',
        informationValue: calculation.evi * 0.8,
        confidenceGain: calculation.confidenceImprovement * 0.75,
        utilityImprovement: calculation.utilityImprovement * 0.85,
        decisionImprovement: calculation.decisionImprovement * 0.8,
        acquisitionCost: {
          time: '60-90 minutes',
          effort: 'low',
        },
        prerequisites: ['Identify conversation partner', 'Prepare discussion topics'],
        risks: ['Partner may project their values', 'External validation bias'],
        alternatives: ['Journaling', 'Values workshop'],
        recommendationReason: [
          'External perspective on values',
          'Dialogue surfaces implicit priorities',
          'Validates self-assessment',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate skills assessment opportunities.
   */
  private generateSkillsOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-skills-course-${gap.id}`,
        activity: 'Targeted Skills Course',
        method: 'course',
        informationCategory: 'skills',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '4-8 weeks',
          money: 'Variable',
          effort: 'high',
        },
        prerequisites: ['Identify target skill', 'Access to learning resources'],
        risks: ['Time and cost investment', 'May discover lack of aptitude'],
        alternatives: ['Self-directed learning', 'Project-based learning'],
        recommendationReason: [
          `Builds ${gap.aspect}`,
          'Direct skill development',
          'Produces portfolio evidence',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate market research opportunities.
   */
  private generateMarketOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-market-research-${gap.id}`,
        activity: 'Career Market Research',
        method: 'research',
        informationCategory: 'market',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '4-6 hours',
          effort: 'low',
        },
        prerequisites: ['Identify target careers'],
        risks: ['Information overload', 'Market data may be outdated'],
        alternatives: ['Informational interviews', 'Industry events'],
        recommendationReason: [
          `Addresses ${gap.aspect}`,
          'Objective market data',
          'Trend identification',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate identity exploration opportunities.
   */
  private generateIdentityOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-identity-internship-${gap.id}`,
        activity: 'Identity Exploration Internship',
        method: 'internship',
        informationCategory: 'identity',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '2-3 months',
          effort: 'high',
        },
        prerequisites: ['Application process', 'Availability for commitment'],
        risks: ['Significant time investment', 'May confirm wrong fit'],
        alternatives: ['Part-time role', 'Volunteer position'],
        recommendationReason: [
          `Deep exploration of ${gap.aspect}`,
          'Extended professional experience',
          'Builds professional network',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate constraints clarification opportunities.
   */
  private generateConstraintsOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-constraints-interview-${gap.id}`,
        activity: 'Family Reality Interview',
        method: 'interview',
        informationCategory: 'constraints',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '60-90 minutes',
          effort: 'medium',
        },
        prerequisites: ['Family willingness to participate'],
        risks: ['Sensitive family dynamics', 'May surface conflicts'],
        alternatives: ['Self-reflection', 'Conversation with advisor'],
        recommendationReason: [
          `Clarifies ${gap.aspect}`,
          'Direct family input',
          'Real constraint identification',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Generate outcomes exploration opportunities.
   */
  private generateOutcomesOpportunities(
    gap: InformationGap,
    calculation: ValueOfInformationCalculation
  ): InformationOpportunity[] {
    return [
      {
        id: `opp-outcomes-research-${gap.id}`,
        activity: 'Outcome Data Research',
        method: 'research',
        informationCategory: 'outcomes',
        informationValue: calculation.evi,
        confidenceGain: calculation.confidenceImprovement,
        utilityImprovement: calculation.utilityImprovement,
        decisionImprovement: calculation.decisionImprovement,
        acquisitionCost: {
          time: '3-4 hours',
          effort: 'low',
        },
        prerequisites: ['Access to outcome databases'],
        risks: ['Data quality varies', 'Past outcomes may not predict future'],
        alternatives: ['Alumni interviews', 'Career services consultation'],
        recommendationReason: [
          `Informs ${gap.aspect}`,
          'Evidence-based decision making',
          'Risk assessment support',
        ],
        addressesGaps: [gap.id],
        rank: 0,
      },
    ];
  }

  /**
   * Calculate opportunity score for ranking.
   */
  private calculateOpportunityScore(opp: InformationOpportunity): number {
    const confidenceComponent = opp.confidenceGain * this.config.confidenceWeight;
    const utilityComponent = opp.utilityImprovement * this.config.utilityWeight;

    // Cost penalty (lower cost = higher score)
    const effortToNumeric: Record<string, number> = {
      low: 1,
      medium: 0.7,
      high: 0.4,
    };
    const costComponent = effortToNumeric[opp.acquisitionCost.effort] * this.config.costWeight;

    // Quick win bonus
    const quickWinBonus =
      opp.confidenceGain > 0.3 && opp.acquisitionCost.effort === 'low' && this.config.prioritizeQuickWins
        ? 0.1
        : 0;

    return confidenceComponent + utilityComponent + costComponent + quickWinBonus;
  }

  /**
   * Remove duplicate opportunities.
   */
  private deduplicateOpportunities(opportunities: InformationOpportunity[]): InformationOpportunity[] {
    const seen = new Set<string>();
    return opportunities.filter((opp) => {
      const key = `${opp.activity}-${opp.method}-${opp.informationCategory}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Identify quick win opportunities.
   */
  private identifyQuickWins(opportunities: InformationOpportunity[]): InformationOpportunity[] {
    return opportunities.filter(
      (opp) => opp.confidenceGain > 0.25 && opp.acquisitionCost.effort === 'low'
    );
  }

  /**
   * Identify high impact opportunities.
   */
  private identifyHighImpact(opportunities: InformationOpportunity[]): InformationOpportunity[] {
    return opportunities
      .filter((opp) => opp.informationValue > 0.6 || opp.decisionImprovement > 0.3)
      .slice(0, 5);
  }

  /**
   * Build minimum viable set of opportunities to reach target confidence.
   */
  private buildMinimumViableSet(
    opportunities: InformationOpportunity[]
  ): InformationOpportunity[] {
    const set: InformationOpportunity[] = [];
    let cumulativeConfidence = 0;

    for (const opp of opportunities) {
      if (cumulativeConfidence >= this.config.targetConfidence) break;
      set.push(opp);
      cumulativeConfidence += opp.confidenceGain;
    }

    return set;
  }

  /**
   * Calculate confidence progression for minimum viable set.
   */
  private calculateConfidenceProgression(
    minimumViableSet: InformationOpportunity[]
  ): Array<{ step: number; activity: string; cumulativeConfidence: number }> {
    let cumulativeConfidence = 0.5; // Starting confidence

    return minimumViableSet.map((opp, index) => {
      cumulativeConfidence = Math.min(
        cumulativeConfidence + opp.confidenceGain,
        this.config.targetConfidence
      );

      return {
        step: index + 1,
        activity: opp.activity,
        cumulativeConfidence,
      };
    });
  }
}

/**
 * Factory function for InformationPrioritizer.
 */
export function createInformationPrioritizer(
  config: ValueOfInformationEngineConfig
): InformationPrioritizer {
  return new InformationPrioritizer(config);
}
