/**
 * Future Flexibility Engine
 *
 * Phase 8.6: Career Criticality Engine - Part 3
 *
 * Estimates remaining adaptability after a decision.
 * Analyzes career pivot capacity, exploration capacity, and cross-domain mobility.
 *
 * @module future-flexibility-engine
 * @version 1.0.0
 */

import {
  FutureFlexibilityAnalysis,
  CriticalityInput,
  CriticalityOption,
  CriticalityDecisionType,
} from './criticality-types';

// ============================================================================
// FLEXIBILITY PROFILES
// ============================================================================

/**
 * Flexibility profiles for common paths
 */
const FLEXIBILITY_PROFILES: Record<string, {
  flexibilityScore: number;
  pivotCapacity: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  explorationCapacity: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  crossDomainMobility: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  nextDecisionWindow: number;
  preservationStrategies: string[];
}> = {
  // Technical - High flexibility
  'Computer Science': {
    flexibilityScore: 75,
    pivotCapacity: 'HIGH',
    explorationCapacity: 'HIGH',
    crossDomainMobility: 'HIGH',
    nextDecisionWindow: 2,
    preservationStrategies: [
      'Build transferable skills (product, management)',
      'Maintain side projects in adjacent areas',
      'Stay connected to startup ecosystem',
    ],
  },
  'Data Science': {
    flexibilityScore: 70,
    pivotCapacity: 'HIGH',
    explorationCapacity: 'MODERATE',
    crossDomainMobility: 'HIGH',
    nextDecisionWindow: 2,
    preservationStrategies: [
      'Develop domain expertise in multiple industries',
      'Build consulting capabilities',
      'Maintain research connections',
    ],
  },

  // Medical - Low flexibility
  'MBBS': {
    flexibilityScore: 25,
    pivotCapacity: 'LOW',
    explorationCapacity: 'LOW',
    crossDomainMobility: 'LOW',
    nextDecisionWindow: 7,
    preservationStrategies: [
      'Build administrative/leadership skills',
      'Develop research capabilities',
      'Create industry connections outside clinical practice',
    ],
  },
  'Specialized_Medicine': {
    flexibilityScore: 15,
    pivotCapacity: 'VERY_LOW',
    explorationCapacity: 'VERY_LOW',
    crossDomainMobility: 'VERY_LOW',
    nextDecisionWindow: 10,
    preservationStrategies: [
      'Focus on healthcare adjacent roles',
      'Build healthcare business knowledge',
      'Develop teaching/education skills',
    ],
  },

  // Creative - High flexibility
  'Design': {
    flexibilityScore: 80,
    pivotCapacity: 'HIGH',
    explorationCapacity: 'HIGH',
    crossDomainMobility: 'HIGH',
    nextDecisionWindow: 1,
    preservationStrategies: [
      'Build diverse portfolio across domains',
      'Maintain freelance practice',
      'Develop complementary skills (code, strategy)',
    ],
  },
  'Liberal Arts': {
    flexibilityScore: 85,
    pivotCapacity: 'HIGH',
    explorationCapacity: 'HIGH',
    crossDomainMobility: 'HIGH',
    nextDecisionWindow: 1,
    preservationStrategies: [
      'Develop concrete technical skills',
      'Build industry-specific knowledge',
      'Create portfolio of applied work',
    ],
  },

  // Business - Moderate flexibility
  'MBA': {
    flexibilityScore: 60,
    pivotCapacity: 'MODERATE',
    explorationCapacity: 'MODERATE',
    crossDomainMobility: 'MODERATE',
    nextDecisionWindow: 3,
    preservationStrategies: [
      'Maintain cross-functional experience',
      'Build startup/growth company exposure',
      'Develop specialized expertise',
    ],
  },
  'Consulting': {
    flexibilityScore: 65,
    pivotCapacity: 'HIGH',
    explorationCapacity: 'MODERATE',
    crossDomainMobility: 'HIGH',
    nextDecisionWindow: 2,
    preservationStrategies: [
      'Exit to industry before too specialized',
      'Build operational experience',
      'Maintain startup network',
    ],
  },

  // High commitment paths
  'Civil_Services': {
    flexibilityScore: 30,
    pivotCapacity: 'LOW',
    explorationCapacity: 'LOW',
    crossDomainMobility: 'LOW',
    nextDecisionWindow: 8,
    preservationStrategies: [
      'Build policy expertise transferable to private sector',
      'Develop international exposure',
      'Create academic/research connections',
    ],
  },
  'PhD': {
    flexibilityScore: 35,
    pivotCapacity: 'LOW',
    explorationCapacity: 'LOW',
    crossDomainMobility: 'MODERATE',
    nextDecisionWindow: 5,
    preservationStrategies: [
      'Build industry connections during PhD',
      'Develop teaching skills',
      'Maintain broad research interests',
    ],
  },

  // Startup
  'Startup_Founder': {
    flexibilityScore: 55,
    pivotCapacity: 'MODERATE',
    explorationCapacity: 'HIGH',
    crossDomainMobility: 'MODERATE',
    nextDecisionWindow: 3,
    preservationStrategies: [
      'Build diverse skill set beyond one company',
      'Maintain network across industries',
      'Develop financial safety net',
    ],
  },
};

/**
 * Decision type impact on flexibility
 */
const DECISION_FLEXIBILITY_IMPACT: Record<CriticalityDecisionType, number> = {
  'MAJOR_SELECTION': -10,
  'DEGREE_SELECTION': -15,
  'COLLEGE_SELECTION': -5,
  'CAREER_SELECTION': -20,
  'DROP_YEAR_DECISION': -10,
  'STUDY_ABROAD_DECISION': -5,
  'ENTREPRENEURSHIP_DECISION': -10,
  'JOB_ACCEPTANCE': -10,
  'CAREER_SWITCHING': -15,
  'GRADUATE_EDUCATION': -15,
  'SPECIALIZATION_CHOICE': -20,
  'LOCATION_DECISION': -5,
};

// ============================================================================
// FUTURE FLEXIBILITY ENGINE
// ============================================================================

/**
 * Engine for analyzing future flexibility
 */
export class FutureFlexibilityEngine {
  /**
   * Analyze future flexibility for a decision option
   */
  analyzeFutureFlexibility(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): FutureFlexibilityAnalysis {
    // Try to find exact profile match
    const profile = this.findProfile(option.name);

    if (profile) {
      // Adjust profile based on decision type and context
      return this.adjustProfile(profile, decisionType, context, option);
    }

    // Calculate based on characteristics
    return this.calculateFlexibility(option, decisionType, context);
  }

  /**
   * Find matching flexibility profile
   */
  private findProfile(optionName: string): typeof FLEXIBILITY_PROFILES[string] | undefined {
    const normalizedName = optionName.toLowerCase().replace(/\s+/g, '_');

    // Direct match
    for (const [key, profile] of Object.entries(FLEXIBILITY_PROFILES)) {
      if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
        return profile;
      }
    }

    // Keyword matching
    const keywords: Record<string, string> = {
      'cs': 'Computer Science',
      'computer': 'Computer Science',
      'software': 'Computer Science',
      'medicine': 'MBBS',
      'medical': 'MBBS',
      'doctor': 'MBBS',
      'design': 'Design',
      'ux': 'Design',
      'ui': 'Design',
      'mba': 'MBA',
      'business': 'MBA',
      'consulting': 'Consulting',
      'civil': 'Civil_Services',
      'upsc': 'Civil_Services',
      'phd': 'PhD',
      'startup': 'Startup_Founder',
      'founder': 'Startup_Founder',
    };

    for (const [keyword, profileKey] of Object.entries(keywords)) {
      if (normalizedName.includes(keyword)) {
        return FLEXIBILITY_PROFILES[profileKey];
      }
    }

    return undefined;
  }

  /**
   * Adjust profile based on decision context
   */
  private adjustProfile(
    profile: typeof FLEXIBILITY_PROFILES[string],
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context'],
    option: CriticalityOption
  ): FutureFlexibilityAnalysis {
    const decisionImpact = DECISION_FLEXIBILITY_IMPACT[decisionType] ?? -10;
    const adjustedScore = Math.max(0, Math.min(100, profile.flexibilityScore + decisionImpact));

    return {
      futureFlexibilityScore: adjustedScore,
      careerPivotCapacity: this.adjustCapacity(profile.pivotCapacity, decisionImpact),
      explorationCapacity: profile.explorationCapacity,
      crossDomainMobility: this.adjustCapacity(profile.crossDomainMobility, decisionImpact / 2),
      nextDecisionWindow: this.adjustDecisionWindow(profile.nextDecisionWindow, option, context),
      preservationStrategies: this.enhanceStrategies(profile.preservationStrategies, decisionType),
    };
  }

  /**
   * Adjust capacity level
   */
  private adjustCapacity(
    current: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW',
    impact: number
  ): 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW' {
    const levels: Array<'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW'> = ['HIGH', 'MODERATE', 'LOW', 'VERY_LOW'];
    const currentIndex = levels.indexOf(current);
    const adjustment = impact < -15 ? 2 : impact < -5 ? 1 : 0;
    return levels[Math.min(levels.length - 1, currentIndex + adjustment)];
  }

  /**
   * Adjust decision window
   */
  private adjustDecisionWindow(
    baseWindow: number,
    option: CriticalityOption,
    context: CriticalityInput['context']
  ): number {
    let window = baseWindow;

    // Duration affects window
    if (option.duration) {
      window = Math.max(window, option.duration / 12);
    }

    // Resources affect flexibility
    if (context.resources === 'LIMITED') {
      window += 1;
    }

    // Prior decisions compound
    window += context.priorDecisions.length * 0.5;

    return Math.round(window);
  }

  /**
   * Enhance preservation strategies
   */
  private enhanceStrategies(
    baseStrategies: string[],
    decisionType: CriticalityDecisionType
  ): string[] {
    const additionalStrategies: Record<CriticalityDecisionType, string[]> = {
      'MAJOR_SELECTION': ['Keep transfer options open', 'Explore interdisciplinary paths'],
      'DEGREE_SELECTION': ['Consider dual degree options', 'Plan for graduate flexibility'],
      'COLLEGE_SELECTION': ['Use college resources broadly', 'Network across departments'],
      'CAREER_SELECTION': ['Build portable skills', 'Maintain industry connections'],
      'DROP_YEAR_DECISION': ['Document learnings from gap year', 'Stay academically connected'],
      'STUDY_ABROAD_DECISION': ['Build international network', 'Plan return strategy'],
      'ENTREPRENEURSHIP_DECISION': ['Create financial buffer', 'Maintain skill currency'],
      'JOB_ACCEPTANCE': ['Negotiate growth clauses', 'Keep learning external skills'],
      'CAREER_SWITCHING': ['Leverage transferable skills', 'Bridge skill gaps proactively'],
      'GRADUATE_EDUCATION': ['Connect with industry', 'Build diverse research skills'],
      'SPECIALIZATION_CHOICE': ['Maintain generalist skills', 'Cross-train in adjacent areas'],
      'LOCATION_DECISION': ['Build remote work capabilities', 'Maintain network in other cities'],
    };

    return [...baseStrategies, ...(additionalStrategies[decisionType] || [])];
  }

  /**
   * Calculate flexibility from scratch
   */
  private calculateFlexibility(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): FutureFlexibilityAnalysis {
    // Base scores
    let flexibilityScore = 70;

    // Adjust for specialization
    flexibilityScore -= this.getSpecializationPenalty(option.specializationLevel);

    // Adjust for duration
    if (option.duration && option.duration > 24) {
      flexibilityScore -= Math.min(20, (option.duration - 24) / 6);
    }

    // Adjust for decision type
    flexibilityScore += DECISION_FLEXIBILITY_IMPACT[decisionType] ?? -10;

    // Adjust for context
    if (context.riskTolerance === 'HIGH') {
      flexibilityScore += 5;
    }

    // Ensure bounds
    flexibilityScore = Math.max(10, Math.min(95, flexibilityScore));

    return {
      futureFlexibilityScore: Math.round(flexibilityScore),
      careerPivotCapacity: this.scoreToCapacity(flexibilityScore),
      explorationCapacity: this.scoreToCapacity(flexibilityScore + 5),
      crossDomainMobility: this.scoreToCapacity(flexibilityScore - 5),
      nextDecisionWindow: this.calculateNextDecisionWindow(option, context),
      preservationStrategies: this.generateDefaultStrategies(decisionType),
    };
  }

  /**
   * Get penalty for specialization level
   */
  private getSpecializationPenalty(level?: string): number {
    switch (level) {
      case 'GENERAL': return 0;
      case 'MODERATE': return 5;
      case 'SPECIALIZED': return 15;
      case 'HIGHLY_SPECIALIZED': return 25;
      default: return 5;
    }
  }

  /**
   * Convert score to capacity level
   */
  private scoreToCapacity(score: number): 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW' {
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MODERATE';
    if (score >= 30) return 'LOW';
    return 'VERY_LOW';
  }

  /**
   * Calculate next decision window
   */
  private calculateNextDecisionWindow(
    option: CriticalityOption,
    context: CriticalityInput['context']
  ): number {
    const baseWindow = (option.duration ?? 24) / 12;
    const priorPenalty = context.priorDecisions.length * 0.5;
    return Math.round(Math.max(1, baseWindow + priorPenalty));
  }

  /**
   * Generate default preservation strategies
   */
  private generateDefaultStrategies(decisionType: CriticalityDecisionType): string[] {
    return [
      'Build skills adjacent to your primary path',
      'Maintain connections across industries',
      'Document learnings and transferable skills',
      'Stay informed about alternative paths',
    ];
  }

  /**
   * Quick flexibility check
   */
  quickFlexibilityCheck(optionName: string): {
    flexibilityScore: number;
    pivotCapacity: string;
    summary: string;
  } {
    const mockOption: CriticalityOption = {
      id: 'quick-check',
      name: optionName,
      description: '',
      type: 'OTHER',
    };

    const analysis = this.analyzeFutureFlexibility(mockOption, 'CAREER_SELECTION', {
      urgency: 'MEDIUM',
      resources: 'MODERATE',
      constraints: [],
      priorDecisions: [],
      riskTolerance: 'MODERATE',
    });

    return {
      flexibilityScore: analysis.futureFlexibilityScore,
      pivotCapacity: analysis.careerPivotCapacity,
      summary: analysis.futureFlexibilityScore > 60
        ? `This path maintains good flexibility with ${analysis.futureFlexibilityScore}% adaptability.`
        : `This path limits future flexibility to ${analysis.futureFlexibilityScore}%. Consider your options carefully.`,
    };
  }

  /**
   * Calculate flexibility comparison across options
   */
  compareFlexibility(
    options: CriticalityOption[],
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): Array<{ optionId: string; flexibilityScore: number; recommendation: string }> {
    return options.map(option => {
      const analysis = this.analyzeFutureFlexibility(option, decisionType, context);
      return {
        optionId: option.id,
        flexibilityScore: analysis.futureFlexibilityScore,
        recommendation: analysis.futureFlexibilityScore > 60
          ? 'Good flexibility maintained'
          : 'Consider strategies to preserve flexibility',
      };
    }).sort((a, b) => b.flexibilityScore - a.flexibilityScore);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a future flexibility engine
 */
export function createFutureFlexibilityEngine(): FutureFlexibilityEngine {
  return new FutureFlexibilityEngine();
}

/**
 * Analyze future flexibility for a quick check
 */
export function analyzeFutureFlexibility(
  option: CriticalityOption,
  decisionType: CriticalityDecisionType
): FutureFlexibilityAnalysis {
  const engine = createFutureFlexibilityEngine();
  return engine.analyzeFutureFlexibility(option, decisionType, {
    urgency: 'MEDIUM',
    resources: 'MODERATE',
    constraints: [],
    priorDecisions: [],
    riskTolerance: 'MODERATE',
  });
}
