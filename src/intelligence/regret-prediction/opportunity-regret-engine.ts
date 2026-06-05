/**
 * Opportunity Regret Engine
 *
 * Phase 8.7: CareerOS Regret Prediction Engine - Part 4
 *
 * Detects opportunities abandoned or foregone.
 * Identifies when students leave significant value on the table.
 *
 * Core philosophy: Humans often regret opportunities abandoned
 * more than opportunities pursued and failed.
 *
 * @module opportunity-regret-engine
 * @version 1.0.0
 */

import {
  OpportunityRegretAnalysis,
  OpportunityCost,
  RegretDecisionOption,
  RegretStudentProfile,
  RegretDecisionContext,
  RegretSeverity,
} from './regret-types';

// ============================================================================
// OPPORTUNITY PATTERNS
// ============================================================================

/**
 * Common opportunity types and their characteristics
 */
const OPPORTUNITY_PATTERNS: Record<string, {
  description: string;
  typicalValue: number;
  timeWindow: string;
  recoverability: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE';
  indicators: string[];
}> = {
  'STUDY_ABROAD': {
    description: 'International education experience',
    typicalValue: 0.8,
    timeWindow: 'Ages 18-25',
    recoverability: 'DIFFICULT',
    indicators: ['international interest', 'language learning', 'cultural curiosity', 'travel desire'],
  },
  'GAP_YEAR_EXPERIENCE': {
    description: 'Structured gap year for exploration',
    typicalValue: 0.7,
    timeWindow: 'Ages 18-22',
    recoverability: 'MODERATE',
    indicators: ['uncertainty about path', 'multiple interests', 'burnout', 'need for clarity'],
  },
  'ENTREPRENEURSHIP_ATTEMPT': {
    description: 'Starting a business or venture',
    typicalValue: 0.9,
    timeWindow: 'Any age, lowest risk when young',
    recoverability: 'EASY',
    indicators: ['business interest', 'innovation ideas', 'risk tolerance', 'independence desire'],
  },
  'CREATIVE_PORTFOLIO': {
    description: 'Building creative work portfolio',
    typicalValue: 0.6,
    timeWindow: 'Ages 18-30',
    recoverability: 'MODERATE',
    indicators: ['creative interests', 'artistic expression', 'design curiosity', 'content creation'],
  },
  'RESEARCH_EXPERIENCE': {
    description: 'Research or academic exploration',
    typicalValue: 0.7,
    timeWindow: 'Undergraduate/early career',
    recoverability: 'MODERATE',
    indicators: ['academic interest', 'curiosity', 'deep learning', 'discovery passion'],
  },
  'NETWORK_BUILDING': {
    description: 'Strategic relationship development',
    typicalValue: 0.6,
    timeWindow: 'Continuous, most valuable early',
    recoverability: 'EASY',
    indicators: ['social skills', 'connector personality', 'community interest'],
  },
  'SKILL_ACQUISITION': {
    description: 'Learning high-value skills',
    typicalValue: 0.8,
    timeWindow: 'Any age, easier when young',
    recoverability: 'EASY',
    indicators: ['growth mindset', 'curiosity', 'technical interest', 'self-improvement'],
  },
  'MENTORSHIP_ACCESS': {
    description: 'Finding and learning from mentors',
    typicalValue: 0.7,
    timeWindow: 'Continuous',
    recoverability: 'EASY',
    indicators: ['seeking guidance', 'learning orientation', 'respect for experience'],
  },
};

// ============================================================================
// OPPORTUNITY REGRET ENGINE
// ============================================================================

/**
 * Engine for detecting opportunity regret risks
 */
export class OpportunityRegretEngine {
  /**
   * Analyze opportunity regret for a decision
   */
  analyzeOpportunityRegret(
    selectedOption: RegretDecisionOption,
    alternativeOptions: RegretDecisionOption[],
    studentProfile: RegretStudentProfile,
    context: RegretDecisionContext
  ): OpportunityRegretAnalysis {
    const opportunitiesForegone = this.identifyOpportunitiesForegone(
      selectedOption,
      alternativeOptions,
      studentProfile
    );
    const opportunityCostScore = this.calculateOpportunityCostScore(opportunitiesForegone, selectedOption);
    const severity = this.determineSeverity(opportunitiesForegone, opportunityCostScore);

    return {
      hasOpportunityRisk: opportunitiesForegone.length > 0 || opportunityCostScore > 0.4,
      opportunitiesForegone,
      opportunityCostScore,
      severity,
      evidence: this.generateEvidence(opportunitiesForegone, opportunityCostScore),
      explanation: this.generateExplanation(opportunitiesForegone, opportunityCostScore, severity),
      preventionPossible: true,
      alternativePaths: this.generateAlternativePaths(opportunitiesForegone),
    };
  }

  /**
   * Identify opportunities being foregone
   */
  private identifyOpportunitiesForegone(
    selectedOption: RegretDecisionOption,
    alternativeOptions: RegretDecisionOption[],
    studentProfile: RegretStudentProfile
  ): OpportunityCost[] {
    const foregone: OpportunityCost[] = [];

    // Check alternative options
    for (const alternative of alternativeOptions) {
      if (alternative.id === selectedOption.id) continue;

      const value = this.calculateAlternativeValue(alternative, studentProfile);
      
      if (value > 0.5) {
        foregone.push({
          opportunityName: alternative.name,
          opportunityType: this.classifyOpportunityType(alternative),
          value,
          recoverability: this.assessRecoverability(alternative),
          timeWindow: this.determineTimeWindow(alternative),
        });
      }
    }

    // Check for missed opportunity patterns based on interests
    for (const [opportunityType, pattern] of Object.entries(OPPORTUNITY_PATTERNS)) {
      if (this.matchesInterestPattern(studentProfile.interests, pattern.indicators)) {
        // Check if this opportunity is addressed by selected option
        if (!this.opportunityAddressed(selectedOption, opportunityType)) {
          foregone.push({
            opportunityName: pattern.description,
            opportunityType,
            value: pattern.typicalValue * this.calculateInterestAlignment(studentProfile.interests, pattern.indicators),
            recoverability: pattern.recoverability,
            timeWindow: pattern.timeWindow,
          });
        }
      }
    }

    // Sort by value (descending)
    return foregone.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  /**
   * Calculate value of an alternative option
   */
  private calculateAlternativeValue(
    alternative: RegretDecisionOption,
    studentProfile: RegretStudentProfile
  ): number {
    let value = 0;

    // Alignment factors
    value += alternative.alignmentWithInterests * 0.3;
    value += alternative.alignmentWithValues * 0.25;
    value += alternative.alignmentWithStrengths * 0.25;
    value += alternative.explorationValue * 0.1;
    value += alternative.identityExpression * 0.1;

    return Math.min(1, value);
  }

  /**
   * Classify opportunity type
   */
  private classifyOpportunityType(option: RegretDecisionOption): string {
    const nameLower = option.name.toLowerCase();

    if (nameLower.includes('abroad') || nameLower.includes('international')) return 'STUDY_ABROAD';
    if (nameLower.includes('gap') || nameLower.includes('break')) return 'GAP_YEAR_EXPERIENCE';
    if (nameLower.includes('startup') || nameLower.includes('business')) return 'ENTREPRENEURSHIP_ATTEMPT';
    if (nameLower.includes('research') || nameLower.includes('phd')) return 'RESEARCH_EXPERIENCE';
    if (nameLower.includes('art') || nameLower.includes('design') || nameLower.includes('portfolio')) return 'CREATIVE_PORTFOLIO';
    
    return 'GENERAL';
  }

  /**
   * Assess recoverability of an opportunity
   */
  private assessRecoverability(option: RegretDecisionOption): 'EASY' | 'MODERATE' | 'DIFFICULT' | 'IMPOSSIBLE' {
    const type = this.classifyOpportunityType(option);
    const pattern = OPPORTUNITY_PATTERNS[type];
    
    return pattern?.recoverability || 'MODERATE';
  }

  /**
   * Determine time window for an opportunity
   */
  private determineTimeWindow(option: RegretDecisionOption): string {
    const type = this.classifyOpportunityType(option);
    const pattern = OPPORTUNITY_PATTERNS[type];
    
    return pattern?.timeWindow || 'Time-sensitive';
  }

  /**
   * Check if student interests match opportunity indicators
   */
  private matchesInterestPattern(interests: string[], indicators: string[]): boolean {
    for (const interest of interests) {
      const interestLower = interest.toLowerCase();
      for (const indicator of indicators) {
        if (interestLower.includes(indicator.toLowerCase()) || indicator.toLowerCase().includes(interestLower)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if an opportunity is addressed by selected option
   */
  private opportunityAddressed(selectedOption: RegretDecisionOption, opportunityType: string): boolean {
    const optionText = (selectedOption.name + ' ' + selectedOption.description).toLowerCase();
    
    const opportunityKeywords: Record<string, string[]> = {
      'STUDY_ABROAD': ['abroad', 'international', 'foreign', 'overseas'],
      'GAP_YEAR_EXPERIENCE': ['gap', 'break', 'explore', 'travel'],
      'ENTREPRENEURSHIP_ATTEMPT': ['startup', 'business', 'founder', 'entrepreneur'],
      'RESEARCH_EXPERIENCE': ['research', 'academia', 'phd', 'study'],
      'CREATIVE_PORTFOLIO': ['design', 'art', 'portfolio', 'creative'],
    };

    const keywords = opportunityKeywords[opportunityType] || [];
    return keywords.some(kw => optionText.includes(kw));
  }

  /**
   * Calculate interest alignment
   */
  private calculateInterestAlignment(interests: string[], indicators: string[]): number {
    let matches = 0;
    for (const interest of interests) {
      const interestLower = interest.toLowerCase();
      for (const indicator of indicators) {
        if (interestLower.includes(indicator.toLowerCase())) {
          matches++;
          break;
        }
      }
    }
    return interests.length > 0 ? matches / interests.length : 0;
  }

  /**
   * Calculate opportunity cost score
   */
  private calculateOpportunityCostScore(
    opportunitiesForegone: OpportunityCost[],
    selectedOption: RegretDecisionOption
  ): number {
    if (opportunitiesForegone.length === 0) return 0;

    // Sum up values of foregone opportunities
    const totalValue = opportunitiesForegone.reduce((sum, opp) => sum + opp.value, 0);
    
    // Factor in recoverability (harder to recover = higher cost)
    const recoverabilityMultiplier = opportunitiesForegone.reduce((sum, opp) => {
      const multiplier = opp.recoverability === 'IMPOSSIBLE' ? 1.5 :
                        opp.recoverability === 'DIFFICULT' ? 1.3 :
                        opp.recoverability === 'MODERATE' ? 1.1 : 1;
      return sum + multiplier;
    }, 0) / opportunitiesForegone.length;

    const score = (totalValue / opportunitiesForegone.length) * recoverabilityMultiplier;
    return Math.min(1, score);
  }

  /**
   * Determine regret severity
   */
  private determineSeverity(
    opportunitiesForegone: OpportunityCost[],
    opportunityCostScore: number
  ): RegretSeverity {
    let score = opportunityCostScore;

    // Increase severity for high-value, irrecoverable opportunities
    const irrecoverableCount = opportunitiesForegone.filter(
      o => o.recoverability === 'IMPOSSIBLE' || o.recoverability === 'DIFFICULT'
    ).length;
    
    score += irrecoverableCount * 0.1;

    if (score < 0.3) return 'MILD';
    if (score < 0.5) return 'MODERATE';
    if (score < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Generate evidence for analysis
   */
  private generateEvidence(
    opportunitiesForegone: OpportunityCost[],
    opportunityCostScore: number
  ): string[] {
    const evidence: string[] = [];

    if (opportunitiesForegone.length > 0) {
      evidence.push(`Identified ${opportunitiesForegone.length} significant opportunities foregone`);
      
      const topOpportunity = opportunitiesForegone[0];
      evidence.push(`Highest value opportunity: ${topOpportunity.opportunityName} (${Math.round(topOpportunity.value * 100)}% value)`);
      
      const irrecoverable = opportunitiesForegone.filter(
        o => o.recoverability === 'IMPOSSIBLE' || o.recoverability === 'DIFFICULT'
      );
      if (irrecoverable.length > 0) {
        evidence.push(`${irrecoverable.length} opportunities are difficult or impossible to recover`);
      }
    }

    evidence.push(`Opportunity cost score: ${Math.round(opportunityCostScore * 100)}%`);

    return evidence;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    opportunitiesForegone: OpportunityCost[],
    opportunityCostScore: number,
    severity: RegretSeverity
  ): string {
    if (opportunitiesForegone.length === 0) {
      return 'No significant opportunities appear to be foregone in this decision.';
    }

    let explanation = '';

    explanation += `By choosing this path, you may be leaving behind ${opportunitiesForegone.length} significant opportunit${opportunitiesForegone.length === 1 ? 'y' : 'ies'}. `;
    
    const topOpportunity = opportunitiesForegone[0];
    explanation += `The most significant is ${topOpportunity.opportunityName.toLowerCase()}, which aligns with your interests but isn't addressed by your current choice. `;

    const irrecoverable = opportunitiesForegone.filter(
      o => o.recoverability === 'IMPOSSIBLE' || o.recoverability === 'DIFFICULT'
    );
    
    if (irrecoverable.length > 0) {
      explanation += `Some of these opportunities may be difficult to pursue later. `;
    }

    const severityDescriptions: Record<RegretSeverity, string> = {
      'MILD': 'This represents a mild opportunity cost.',
      'MODERATE': 'This represents a moderate opportunity cost worth considering.',
      'SIGNIFICANT': 'This represents a significant opportunity cost that could lead to future regret.',
      'SEVERE': 'This represents a severe opportunity cost with high potential for lasting regret.',
      'PROFOUND': 'This represents a profound opportunity cost that may significantly limit your future options.',
    };

    explanation += severityDescriptions[severity];

    return explanation;
  }

  /**
   * Generate alternative paths
   */
  private generateAlternativePaths(opportunitiesForegone: OpportunityCost[]): string[] {
    const paths: string[] = [];

    for (const opportunity of opportunitiesForegone.slice(0, 3)) {
      if (opportunity.recoverability === 'EASY' || opportunity.recoverability === 'MODERATE') {
        paths.push(`Consider pursuing "${opportunity.opportunityName}" as a parallel track or later transition`);
      } else {
        paths.push(`Explore whether "${opportunity.opportunityName}" could be integrated into your current path`);
      }
    }

    paths.push('Identify elements from foregone opportunities that can be incorporated into your chosen path');
    paths.push('Stay open to pivoting if your current path proves unsatisfying');

    return paths;
  }

  /**
   * Quick opportunity check
   */
  quickOpportunityCheck(
    selectedPath: string,
    alternativePaths: string[],
    interests: string[]
  ): {
    hasOpportunityRisk: boolean;
    foregoneCount: number;
    topForegone: string | null;
    severity: RegretSeverity;
    advice: string;
  } {
    const selectedOption: RegretDecisionOption = {
      id: 'selected',
      name: selectedPath,
      description: selectedPath,
      type: 'OTHER',
      motivations: ['INTRINSIC'],
      alignmentWithInterests: 0.5,
      alignmentWithValues: 0.5,
      alignmentWithStrengths: 0.5,
      explorationValue: 0.5,
      identityExpression: 0.5,
      opportunityCost: 0.5,
    };

    const alternativeOptions: RegretDecisionOption[] = alternativePaths.map((path, index) => ({
      id: `alt-${index}`,
      name: path,
      description: path,
      type: 'OTHER',
      motivations: ['INTRINSIC'],
      alignmentWithInterests: 0.6,
      alignmentWithValues: 0.6,
      alignmentWithStrengths: 0.6,
      explorationValue: 0.6,
      identityExpression: 0.6,
      opportunityCost: 0.4,
    }));

    const mockProfile: RegretStudentProfile = {
      currentEducation: 'Unknown',
      interests,
      strengths: [],
      values: [],
      previousChoices: [],
    };

    const mockContext: RegretDecisionContext = {
      urgency: 'MEDIUM',
      reversibility: 'MODERATE',
      timePressure: false,
      informationLevel: 'ADEQUATE',
      externalPressures: [],
    };

    const result = this.analyzeOpportunityRegret(selectedOption, alternativeOptions, mockProfile, mockContext);

    return {
      hasOpportunityRisk: result.hasOpportunityRisk,
      foregoneCount: result.opportunitiesForegone.length,
      topForegone: result.opportunitiesForegone[0]?.opportunityName || null,
      severity: result.severity,
      advice: result.alternativePaths[0] || 'Evaluate your options carefully',
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an opportunity regret engine
 */
export function createOpportunityRegretEngine(): OpportunityRegretEngine {
  return new OpportunityRegretEngine();
}

/**
 * Analyze opportunity regret directly
 */
export function analyzeOpportunityRegret(
  selectedOption: RegretDecisionOption,
  alternativeOptions: RegretDecisionOption[],
  studentProfile: RegretStudentProfile,
  context: RegretDecisionContext
): OpportunityRegretAnalysis {
  const engine = createOpportunityRegretEngine();
  return engine.analyzeOpportunityRegret(selectedOption, alternativeOptions, studentProfile, context);
}
