/**
 * Option Closure Engine
 *
 * Phase 8.6: Career Criticality Engine - Part 2
 *
 * Estimates future opportunities lost and gained by a decision.
 * Calculates doors opened, doors closed, and pivot difficulty.
 *
 * @module option-closure-engine
 * @version 1.0.0
 */

import {
  OptionClosureAnalysis,
  LostOpportunity,
  GainedOpportunity,
  CriticalityInput,
  CriticalityOption,
  CriticalityDecisionType,
} from './criticality-types';

// ============================================================================
// OPPORTUNITY DATABASE
// ============================================================================

/**
 * Opportunities available in different career domains
 */
const DOMAIN_OPPORTUNITIES: Record<string, {
  opportunities: string[];
  transferableTo: string[];
  closedBy: string[];
}> = {
  'Computer Science': {
    opportunities: [
      'Software Engineering', 'Data Science', 'AI/ML Engineer', 'Product Manager',
      'DevOps Engineer', 'Cybersecurity', 'Technical Architect', 'Engineering Manager',
      'CTO', 'Tech Entrepreneur', 'Technical Writer', 'Developer Advocate'
    ],
    transferableTo: ['Data Science', 'Product', 'Consulting', 'Entrepreneurship'],
    closedBy: ['Medicine', 'Law', 'Core Engineering'],
  },
  'Medicine': {
    opportunities: [
      'General Practice', 'Specialist Doctor', 'Surgeon', 'Medical Researcher',
      'Public Health Expert', 'Hospital Administrator', 'Medical Educator',
      'Healthcare Consultant', 'Medical Writer', 'Health Tech Founder'
    ],
    transferableTo: ['Healthcare Administration', 'Research', 'Public Health', 'Health Tech'],
    closedBy: ['Engineering', 'Design', 'Arts'],
  },
  'Design': {
    opportunities: [
      'UX Designer', 'Product Designer', 'Visual Designer', 'Art Director',
      'Brand Strategist', 'Design Researcher', 'Creative Director',
      'Design Educator', 'Freelance Designer', 'Design Entrepreneur'
    ],
    transferableTo: ['Product Management', 'Strategy', 'Consulting', 'Entrepreneurship'],
    closedBy: ['Medicine', 'Engineering', 'Finance'],
  },
  'Business': {
    opportunities: [
      'Management Consultant', 'Investment Banker', 'Marketing Manager',
      'Operations Manager', 'HR Director', 'Strategy Analyst',
      'Business Development', 'Entrepreneur', 'Corporate Executive'
    ],
    transferableTo: ['Most Industries', 'Consulting', 'Entrepreneurship'],
    closedBy: ['Medicine', 'Engineering (Technical)'],
  },
  'Engineering': {
    opportunities: [
      'Core Engineer', 'Project Manager', 'Technical Consultant',
      'Operations Manager', 'Quality Manager', 'Supply Chain Manager',
      'Engineering Manager', 'Plant Manager', 'Technical Sales'
    ],
    transferableTo: ['Operations', 'Consulting', 'Management', 'Sales'],
    closedBy: ['Medicine', 'Design', 'Creative Fields'],
  },
  'Civil Services': {
    opportunities: [
      'IAS Officer', 'IPS Officer', 'IFS Officer', 'Public Policy Expert',
      'Government Administrator', 'Diplomat', 'Policy Advisor',
      'International Organizations', 'Academia', 'Politics'
    ],
    transferableTo: ['Policy', 'Consulting', 'Academia', 'Politics'],
    closedBy: ['Private Sector Technical', 'Entrepreneurship'],
  },
  'Startup': {
    opportunities: [
      'Founder/CEO', 'Early Employee', 'Product Manager', 'Growth Manager',
      'Startup Consultant', 'VC/PE Professional', 'Corporate Innovation',
      'Serial Entrepreneur', 'Angel Investor', 'Startup Advisor'
    ],
    transferableTo: ['Product', 'Consulting', 'VC/PE', 'Corporate'],
    closedBy: ['Traditional Corporate', 'Government'],
  },
};

/**
 * Decision-specific opportunity impacts
 */
const DECISION_OPPORTUNITY_IMPACT: Record<CriticalityDecisionType, {
  doorsOpenedBase: number;
  doorsClosedBase: number;
  pivotDifficultyBase: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
}> = {
  'MAJOR_SELECTION': { doorsOpenedBase: 8, doorsClosedBase: 12, pivotDifficultyBase: 'MODERATE' },
  'DEGREE_SELECTION': { doorsOpenedBase: 10, doorsClosedBase: 15, pivotDifficultyBase: 'MODERATE' },
  'COLLEGE_SELECTION': { doorsOpenedBase: 6, doorsClosedBase: 4, pivotDifficultyBase: 'EASY' },
  'CAREER_SELECTION': { doorsOpenedBase: 8, doorsClosedBase: 12, pivotDifficultyBase: 'HARD' },
  'DROP_YEAR_DECISION': { doorsOpenedBase: 3, doorsClosedBase: 8, pivotDifficultyBase: 'MODERATE' },
  'STUDY_ABROAD_DECISION': { doorsOpenedBase: 12, doorsClosedBase: 6, pivotDifficultyBase: 'MODERATE' },
  'ENTREPRENEURSHIP_DECISION': { doorsOpenedBase: 10, doorsClosedBase: 8, pivotDifficultyBase: 'HARD' },
  'JOB_ACCEPTANCE': { doorsOpenedBase: 5, doorsClosedBase: 7, pivotDifficultyBase: 'MODERATE' },
  'CAREER_SWITCHING': { doorsOpenedBase: 6, doorsClosedBase: 10, pivotDifficultyBase: 'VERY_HARD' },
  'GRADUATE_EDUCATION': { doorsOpenedBase: 8, doorsClosedBase: 6, pivotDifficultyBase: 'MODERATE' },
  'SPECIALIZATION_CHOICE': { doorsOpenedBase: 5, doorsClosedBase: 8, pivotDifficultyBase: 'HARD' },
  'LOCATION_DECISION': { doorsOpenedBase: 6, doorsClosedBase: 4, pivotDifficultyBase: 'EASY' },
};

// ============================================================================
// OPTION CLOSURE ENGINE
// ============================================================================

/**
 * Engine for analyzing option closure
 */
export class OptionClosureEngine {
  /**
   * Analyze option closure for a decision option
   */
  analyzeOptionClosure(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): OptionClosureAnalysis {
    // Calculate doors opened and closed
    const { doorsOpened, doorsClosed } = this.calculateDoors(option, decisionType);
    
    // Calculate pivot difficulty
    const pivotDifficulty = this.calculatePivotDifficulty(option, decisionType, context);
    
    // Calculate future restriction
    const futureRestriction = this.calculateFutureRestriction(doorsOpened, doorsClosed);
    
    // Identify specific opportunities
    const opportunitiesLost = this.identifyLostOpportunities(option, decisionType);
    const opportunitiesGained = this.identifyGainedOpportunities(option, decisionType);
    
    // Estimate recovery time
    const recoveryTimeEstimate = this.estimateRecoveryTime(option, decisionType, pivotDifficulty);

    return {
      doorsOpened,
      doorsClosed,
      pivotDifficulty,
      futureRestriction,
      opportunitiesLost,
      opportunitiesGained,
      recoveryTimeEstimate,
    };
  }

  /**
   * Calculate doors opened and closed
   */
  private calculateDoors(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): { doorsOpened: number; doorsClosed: number } {
    const base = DECISION_OPPORTUNITY_IMPACT[decisionType] ?? { doorsOpenedBase: 5, doorsClosedBase: 5 };
    
    // Adjust based on option characteristics
    const specializationFactor = this.getSpecializationFactor(option.specializationLevel);
    const typeFactor = this.getTypeFactor(option.type);
    
    const doorsOpened = Math.round(base.doorsOpenedBase * typeFactor);
    const doorsClosed = Math.round(base.doorsClosedBase * specializationFactor);

    return { doorsOpened, doorsClosed };
  }

  /**
   * Get factor based on specialization
   */
  private getSpecializationFactor(level?: string): number {
    switch (level) {
      case 'GENERAL': return 0.7;
      case 'MODERATE': return 1.0;
      case 'SPECIALIZED': return 1.3;
      case 'HIGHLY_SPECIALIZED': return 1.6;
      default: return 1.0;
    }
  }

  /**
   * Get factor based on option type
   */
  private getTypeFactor(type: string): number {
    switch (type) {
      case 'EDUCATION': return 1.2;
      case 'CAREER': return 1.0;
      case 'LOCATION': return 0.8;
      case 'LIFESTYLE': return 0.7;
      default: return 1.0;
    }
  }

  /**
   * Calculate pivot difficulty
   */
  private calculatePivotDifficulty(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD' {
    const base = DECISION_OPPORTUNITY_IMPACT[decisionType]?.pivotDifficultyBase ?? 'MODERATE';
    
    // Adjust based on duration
    let difficulty = base;
    if (option.duration && option.duration > 36) {
      difficulty = this.increaseDifficulty(difficulty);
    }
    
    // Adjust based on specialization
    if (option.specializationLevel === 'HIGHLY_SPECIALIZED') {
      difficulty = this.increaseDifficulty(difficulty);
    }
    
    // Adjust based on prior decisions
    if (context.priorDecisions.length > 2) {
      difficulty = this.increaseDifficulty(difficulty);
    }
    
    return difficulty;
  }

  /**
   * Increase difficulty level
   */
  private increaseDifficulty(current: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD'): 
    'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD' {
    const levels: Array<'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD'> = ['EASY', 'MODERATE', 'HARD', 'VERY_HARD'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(levels.length - 1, currentIndex + 1)];
  }

  /**
   * Calculate future restriction level
   */
  private calculateFutureRestriction(
    doorsOpened: number,
    doorsClosed: number
  ): 'MINIMAL' | 'SOME' | 'SIGNIFICANT' | 'SEVERE' {
    const ratio = doorsClosed / (doorsOpened + doorsClosed);
    
    if (ratio < 0.3) return 'MINIMAL';
    if (ratio < 0.5) return 'SOME';
    if (ratio < 0.7) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Identify specific lost opportunities
   */
  private identifyLostOpportunities(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): LostOpportunity[] {
    const lost: LostOpportunity[] = [];
    
    // Find domain matches
    for (const [domain, data] of Object.entries(DOMAIN_OPPORTUNITIES)) {
      if (data.closedBy.some(closer => option.name.toLowerCase().includes(closer.toLowerCase()))) {
        continue;
      }
      
      // Add some opportunities from this domain as lost
      data.opportunities.slice(0, 3).forEach(opp => {
        lost.push({
          name: opp,
          category: 'CAREER',
          reason: `Requires ${domain} background`,
          reversibility: this.getReversibility(decisionType, option),
        });
      });
    }
    
    // Add time-based opportunities lost
    if (decisionType === 'DROP_YEAR_DECISION') {
      lost.push({
        name: 'Early Career Progression',
        category: 'TIMING',
        reason: 'One year delay in career entry',
        reversibility: 'PARTIALLY_REVERSIBLE',
      });
    }
    
    return lost.slice(0, 8);
  }

  /**
   * Identify specific gained opportunities
   */
  private identifyGainedOpportunities(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): GainedOpportunity[] {
    const gained: GainedOpportunity[] = [];
    
    // Find matching domain
    for (const [domain, data] of Object.entries(DOMAIN_OPPORTUNITIES)) {
      if (option.name.toLowerCase().includes(domain.toLowerCase()) ||
          domain.toLowerCase().includes(option.name.toLowerCase())) {
        data.opportunities.slice(0, 4).forEach(opp => {
          gained.push({
            name: opp,
            category: 'CAREER',
            value: 'HIGH',
          });
        });
      }
    }
    
    // Add default opportunities
    if (gained.length === 0) {
      gained.push(
        { name: 'Specialized Career Path', category: 'CAREER', value: 'HIGH' },
        { name: 'Industry Network Access', category: 'NETWORK', value: 'MEDIUM' },
        { name: 'Domain Expertise', category: 'EDUCATION', value: 'HIGH' }
      );
    }
    
    return gained.slice(0, 6);
  }

  /**
   * Get reversibility for an opportunity
   */
  private getReversibility(decisionType: CriticalityDecisionType, option: CriticalityOption): 
    'REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE' {
    const reversible: CriticalityDecisionType[] = ['COLLEGE_SELECTION', 'LOCATION_DECISION', 'JOB_ACCEPTANCE'];
    const irreversible: CriticalityDecisionType[] = ['CAREER_SWITCHING'];
    
    if (reversible.includes(decisionType)) return 'REVERSIBLE';
    if (this.isMedicalPracticeOption(option)) return 'IRREVERSIBLE';
    if (irreversible.includes(decisionType)) return 'IRREVERSIBLE';
    return 'PARTIALLY_REVERSIBLE';
  }

  private isMedicalPracticeOption(option: CriticalityOption): boolean {
    const normalizedName = option.name.toLowerCase();
    const normalizedDescription = option.description.toLowerCase();
    const medicalTerms = ['medical practice', 'medicine', 'mbbs', 'doctor', 'surgeon', 'clinical'];

    return medicalTerms.some(term =>
      normalizedName.includes(term) || normalizedDescription.includes(term)
    );
  }

  /**
   * Estimate time to recover closed options
   */
  private estimateRecoveryTime(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    pivotDifficulty: 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD'
  ): number {
    const difficultyMultipliers: Record<string, number> = {
      'EASY': 1,
      'MODERATE': 2,
      'HARD': 3,
      'VERY_HARD': 5,
    };
    
    const baseTime = (option.duration ?? 24) / 12;
    const multiplier = difficultyMultipliers[pivotDifficulty] ?? 2;
    
    return Math.round(baseTime * multiplier);
  }

  /**
   * Compare option closure across multiple options
   */
  compareOptionClosure(
    options: CriticalityOption[],
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): Array<{ optionId: string; netOpportunity: number; pivotDifficulty: string }> {
    return options.map(option => {
      const analysis = this.analyzeOptionClosure(option, decisionType, context);
      return {
        optionId: option.id,
        netOpportunity: analysis.doorsOpened - analysis.doorsClosed,
        pivotDifficulty: analysis.pivotDifficulty,
      };
    }).sort((a, b) => b.netOpportunity - a.netOpportunity);
  }

  /**
   * Quick check for option closure
   */
  quickOptionClosureCheck(optionName: string, decisionType: CriticalityDecisionType): {
    doorsOpened: number;
    doorsClosed: number;
    netImpact: number;
    summary: string;
  } {
    const mockOption: CriticalityOption = {
      id: 'quick-check',
      name: optionName,
      description: '',
      type: 'OTHER',
    };

    const analysis = this.analyzeOptionClosure(mockOption, decisionType, {
      urgency: 'MEDIUM',
      resources: 'MODERATE',
      constraints: [],
      priorDecisions: [],
      riskTolerance: 'MODERATE',
    });

    const netImpact = analysis.doorsOpened - analysis.doorsClosed;

    return {
      doorsOpened: analysis.doorsOpened,
      doorsClosed: analysis.doorsClosed,
      netImpact,
      summary: netImpact > 0
        ? `This option opens ${analysis.doorsOpened} paths while closing ${analysis.doorsClosed}. Net positive.`
        : `This option closes ${analysis.doorsClosed} paths while opening ${analysis.doorsOpened}. Consider alternatives.`,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create an option closure engine
 */
export function createOptionClosureEngine(): OptionClosureEngine {
  return new OptionClosureEngine();
}

/**
 * Analyze option closure for a quick check
 */
export function analyzeOptionClosure(
  option: CriticalityOption,
  decisionType: CriticalityDecisionType
): OptionClosureAnalysis {
  const engine = createOptionClosureEngine();
  return engine.analyzeOptionClosure(option, decisionType, {
    urgency: 'MEDIUM',
    resources: 'MODERATE',
    constraints: [],
    priorDecisions: [],
    riskTolerance: 'MODERATE',
  });
}
