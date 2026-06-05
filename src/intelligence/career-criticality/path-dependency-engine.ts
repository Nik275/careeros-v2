/**
 * Path Dependency Engine
 *
 * Phase 8.6: Career Criticality Engine - Part 1
 *
 * Determines how much a decision constrains future options.
 * Analyzes the degree to which current choices limit future paths.
 *
 * @module path-dependency-engine
 * @version 1.0.0
 */

import {
  PathDependencyAnalysis,
  PathDependencyEvidence,
  CriticalityInput,
  CriticalityOption,
  CriticalityDecisionType,
} from './criticality-types';

// ============================================================================
// PATH DEPENDENCY DATA
// ============================================================================

/**
 * Path dependency profiles for common career paths
 */
const PATH_DEPENDENCY_PROFILES: Record<string, {
  dependencyScore: number;
  constraintLevel: 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE';
  reversibility: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT' | 'NEARLY_IMPOSSIBLE';
  constraintDuration: number;
  evidence: PathDependencyEvidence[];
  alternativePaths: string[];
}> = {
  // Engineering
  'B.Tech_ComputerScience': {
    dependencyScore: 0.45,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 3,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'Technical roles often require CS degree', impact: 'MEDIUM' },
      { type: 'SKILL_SPECIALIZATION', description: 'Programming skills are transferable', impact: 'LOW' },
    ],
    alternativePaths: ['Product Management', 'Data Science', 'Technical Consulting', 'Entrepreneurship'],
  },
  'B.Tech_Mechanical': {
    dependencyScore: 0.55,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 4,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'Core engineering roles require specific degree', impact: 'MEDIUM' },
      { type: 'SKILL_SPECIALIZATION', description: 'CAD/Design skills have limited transfer', impact: 'MEDIUM' },
    ],
    alternativePaths: ['Operations', 'Supply Chain', 'Technical Sales', 'MBA'],
  },

  // Medicine
  'MBBS': {
    dependencyScore: 0.85,
    constraintLevel: 'SEVERE',
    reversibility: 'VERY_DIFFICULT',
    constraintDuration: 10,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'Medical practice requires MBBS + licensing', impact: 'HIGH' },
      { type: 'TIME_INVESTMENT', description: '5.5+ years invested, difficult to pivot', impact: 'HIGH' },
      { type: 'CERTIFICATION_NEEDED', description: 'Medical council registration required', impact: 'HIGH' },
    ],
    alternativePaths: ['Healthcare Administration', 'Medical Research', 'Public Health', 'Medical Writing'],
  },
  'Medical_Practice': {
    dependencyScore: 0.92,
    constraintLevel: 'SEVERE',
    reversibility: 'NEARLY_IMPOSSIBLE',
    constraintDuration: 15,
    evidence: [
      { type: 'TIME_INVESTMENT', description: '10+ years of specialized training', impact: 'HIGH' },
      { type: 'SKILL_SPECIALIZATION', description: 'Highly specialized clinical skills', impact: 'HIGH' },
      { type: 'NETWORK_EFFECTS', description: 'Professional network built in healthcare', impact: 'MEDIUM' },
    ],
    alternativePaths: ['Hospital Administration', 'Health Tech', 'Medical Education'],
  },

  // Design
  'B.Des_Graphic': {
    dependencyScore: 0.35,
    constraintLevel: 'MINIMAL',
    reversibility: 'EASY',
    constraintDuration: 2,
    evidence: [
      { type: 'SKILL_SPECIALIZATION', description: 'Visual design skills are transferable', impact: 'LOW' },
    ],
    alternativePaths: ['UX Design', 'Art Direction', 'Brand Strategy', 'Illustration', 'Motion Design', 'Freelancing'],
  },
  'B.Des_Industrial': {
    dependencyScore: 0.50,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 3,
    evidence: [
      { type: 'SKILL_SPECIALIZATION', description: 'Product design specialization', impact: 'MEDIUM' },
      { type: 'DEGREE_REQUIREMENT', description: 'Portfolio matters more than degree', impact: 'LOW' },
    ],
    alternativePaths: ['UX Design', 'Design Research', 'Strategy', 'Entrepreneurship'],
  },

  // Business
  'MBA': {
    dependencyScore: 0.40,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 3,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'Many corporate roles prefer MBA', impact: 'MEDIUM' },
      { type: 'NETWORK_EFFECTS', description: 'Strong alumni network effects', impact: 'MEDIUM' },
    ],
    alternativePaths: ['Consulting', 'Finance', 'Marketing', 'Operations', 'Entrepreneurship'],
  },
  'B.Com': {
    dependencyScore: 0.30,
    constraintLevel: 'MINIMAL',
    reversibility: 'EASY',
    constraintDuration: 2,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'General business foundation', impact: 'LOW' },
    ],
    alternativePaths: ['Accounting', 'Finance', 'Marketing', 'HR', 'Banking', 'Civil Services'],
  },

  // Gap Year
  'Drop_Year_NEET': {
    dependencyScore: 0.70,
    constraintLevel: 'SIGNIFICANT',
    reversibility: 'DIFFICULT',
    constraintDuration: 5,
    evidence: [
      { type: 'TIME_INVESTMENT', description: 'Year lost in preparation', impact: 'HIGH' },
      { type: 'DEGREE_REQUIREMENT', description: 'Commitment to medical entrance', impact: 'MEDIUM' },
    ],
    alternativePaths: ['Allied Health', 'Biotechnology', 'Pharmacy', 'Nursing'],
  },
  'Drop_Year_JEE': {
    dependencyScore: 0.55,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 3,
    evidence: [
      { type: 'TIME_INVESTMENT', description: 'Year invested in preparation', impact: 'MEDIUM' },
    ],
    alternativePaths: ['State Colleges', 'Private Engineering', 'B.Sc Programs', 'Diploma'],
  },

  // Government
  'UPSC_CivilServices': {
    dependencyScore: 0.75,
    constraintLevel: 'SIGNIFICANT',
    reversibility: 'DIFFICULT',
    constraintDuration: 7,
    evidence: [
      { type: 'TIME_INVESTMENT', description: 'Years of preparation, multiple attempts', impact: 'HIGH' },
      { type: 'SKILL_SPECIALIZATION', description: 'Administrative skill set', impact: 'MEDIUM' },
      { type: 'NETWORK_EFFECTS', description: 'Government network', impact: 'MEDIUM' },
    ],
    alternativePaths: ['State PSC', 'Banking', 'Corporate Administration', 'Policy Consulting'],
  },

  // Entrepreneurship
  'Startup_Founder': {
    dependencyScore: 0.60,
    constraintLevel: 'MODERATE',
    reversibility: 'MODERATE',
    constraintDuration: 4,
    evidence: [
      { type: 'TIME_INVESTMENT', description: 'Intense commitment required', impact: 'MEDIUM' },
      { type: 'NETWORK_EFFECTS', description: 'Startup ecosystem network', impact: 'MEDIUM' },
    ],
    alternativePaths: ['Product Management', 'VC/PE', 'Consulting', 'Corporate Innovation'],
  },

  // Study Abroad
  'MS_USA': {
    dependencyScore: 0.65,
    constraintLevel: 'SIGNIFICANT',
    reversibility: 'DIFFICULT',
    constraintDuration: 5,
    evidence: [
      { type: 'DEGREE_REQUIREMENT', description: 'Specialized graduate degree', impact: 'MEDIUM' },
      { type: 'TIME_INVESTMENT', description: '2+ years plus visa commitments', impact: 'MEDIUM' },
      { type: 'NETWORK_EFFECTS', description: 'International network', impact: 'MEDIUM' },
    ],
    alternativePaths: ['US Tech Jobs', 'Research', 'PhD', 'Return to India'],
  },
};

/**
 * Decision type base dependency scores
 */
const DECISION_TYPE_DEPENDENCY: Record<CriticalityDecisionType, number> = {
  'MAJOR_SELECTION': 0.45,
  'DEGREE_SELECTION': 0.55,
  'COLLEGE_SELECTION': 0.35,
  'CAREER_SELECTION': 0.65,
  'DROP_YEAR_DECISION': 0.60,
  'STUDY_ABROAD_DECISION': 0.55,
  'ENTREPRENEURSHIP_DECISION': 0.60,
  'JOB_ACCEPTANCE': 0.50,
  'CAREER_SWITCHING': 0.70,
  'GRADUATE_EDUCATION': 0.65,
  'SPECIALIZATION_CHOICE': 0.50,
  'LOCATION_DECISION': 0.40,
};

// ============================================================================
// PATH DEPENDENCY ENGINE
// ============================================================================

/**
 * Engine for analyzing path dependencies
 */
export class PathDependencyEngine {
  /**
   * Analyze path dependency for a decision option
   */
  analyzePathDependency(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): PathDependencyAnalysis {
    // Try to find exact profile match
    const profile = this.findProfile(option.name);

    if (profile) {
      return {
        dependencyScore: profile.dependencyScore,
        futureConstraintLevel: profile.constraintLevel,
        reversibility: profile.reversibility,
        evidence: profile.evidence,
        constraintDuration: profile.constraintDuration,
        alternativePaths: profile.alternativePaths,
      };
    }

    // Calculate based on decision type and option characteristics
    return this.calculatePathDependency(option, decisionType, context);
  }

  /**
   * Find matching profile for an option
   */
  private findProfile(optionName: string): typeof PATH_DEPENDENCY_PROFILES[string] | undefined {
    const normalizedName = optionName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    // Direct match
    if (PATH_DEPENDENCY_PROFILES[normalizedName]) {
      return PATH_DEPENDENCY_PROFILES[normalizedName];
    }

    // Partial match
    for (const [key, profile] of Object.entries(PATH_DEPENDENCY_PROFILES)) {
      const keyParts = key.toLowerCase().split('_');
      const nameLower = optionName.toLowerCase();
      
      // Check if key parts are in the option name
      const matchCount = keyParts.filter(part => nameLower.includes(part)).length;
      if (matchCount >= 2 || (matchCount === 1 && keyParts.length === 1)) {
        return profile;
      }
    }

    return undefined;
  }

  /**
   * Calculate path dependency based on option characteristics
   */
  private calculatePathDependency(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType,
    context: CriticalityInput['context']
  ): PathDependencyAnalysis {
    const baseScore = DECISION_TYPE_DEPENDENCY[decisionType] ?? 0.50;
    
    // Adjust based on specialization level
    const specializationMultiplier = this.getSpecializationMultiplier(option.specializationLevel);
    
    // Adjust based on duration
    const durationMultiplier = this.getDurationMultiplier(option.duration);
    
    // Calculate final score
    const dependencyScore = Math.min(0.95, baseScore * specializationMultiplier * durationMultiplier);

    return {
      dependencyScore,
      futureConstraintLevel: this.scoreToConstraintLevel(dependencyScore),
      reversibility: this.scoreToReversibility(dependencyScore, context.riskTolerance),
      evidence: this.generateEvidence(option, decisionType),
      constraintDuration: this.estimateConstraintDuration(option, decisionType),
      alternativePaths: this.suggestAlternativePaths(option, decisionType),
    };
  }

  /**
   * Get multiplier based on specialization level
   */
  private getSpecializationMultiplier(level?: string): number {
    switch (level) {
      case 'GENERAL': return 0.85;
      case 'MODERATE': return 1.0;
      case 'SPECIALIZED': return 1.15;
      case 'HIGHLY_SPECIALIZED': return 1.30;
      default: return 1.0;
    }
  }

  /**
   * Get multiplier based on duration
   */
  private getDurationMultiplier(duration?: number): number {
    if (!duration) return 1.0;
    if (duration <= 12) return 0.9;
    if (duration <= 24) return 1.0;
    if (duration <= 36) return 1.1;
    if (duration <= 48) return 1.2;
    return 1.3;
  }

  /**
   * Convert score to constraint level
   */
  private scoreToConstraintLevel(score: number): 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE' {
    if (score < 0.35) return 'MINIMAL';
    if (score < 0.55) return 'MODERATE';
    if (score < 0.75) return 'SIGNIFICANT';
    return 'SEVERE';
  }

  /**
   * Convert score to reversibility rating
   */
  private scoreToReversibility(
    score: number,
    riskTolerance: 'LOW' | 'MODERATE' | 'HIGH'
  ): 'EASY' | 'MODERATE' | 'DIFFICULT' | 'VERY_DIFFICULT' | 'NEARLY_IMPOSSIBLE' {
    const toleranceAdjustment = riskTolerance === 'HIGH' ? 0.1 : riskTolerance === 'LOW' ? -0.1 : 0;
    const adjustedScore = score + toleranceAdjustment;

    if (adjustedScore < 0.35) return 'EASY';
    if (adjustedScore < 0.50) return 'MODERATE';
    if (adjustedScore < 0.70) return 'DIFFICULT';
    if (adjustedScore < 0.85) return 'VERY_DIFFICULT';
    return 'NEARLY_IMPOSSIBLE';
  }

  /**
   * Generate evidence for path dependency
   */
  private generateEvidence(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): PathDependencyEvidence[] {
    const evidence: PathDependencyEvidence[] = [];

    if (option.type === 'EDUCATION' && option.duration && option.duration > 24) {
      evidence.push({
        type: 'TIME_INVESTMENT',
        description: `${option.duration} months of education creates time investment`,
        impact: 'MEDIUM',
      });
    }

    if (option.specializationLevel === 'HIGHLY_SPECIALIZED') {
      evidence.push({
        type: 'SKILL_SPECIALIZATION',
        description: 'Highly specialized skills limit transferability',
        impact: 'HIGH',
      });
    }

    if (['MBBS', 'Engineering', 'Law'].some(k => option.name.includes(k))) {
      evidence.push({
        type: 'DEGREE_REQUIREMENT',
        description: 'Professional practice requires specific degree',
        impact: 'HIGH',
      });
    }

    return evidence;
  }

  /**
   * Estimate how long constraints last
   */
  private estimateConstraintDuration(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): number {
    const baseDuration = (option.duration ?? 24) / 12;
    const decisionMultiplier = decisionType === 'CAREER_SWITCHING' ? 2 : 1;
    return Math.round(baseDuration * decisionMultiplier);
  }

  /**
   * Suggest alternative paths
   */
  private suggestAlternativePaths(
    option: CriticalityOption,
    decisionType: CriticalityDecisionType
  ): string[] {
    const defaults = ['Consulting', 'Teaching', 'Entrepreneurship', 'Freelancing'];
    
    if (option.type === 'EDUCATION') {
      return ['Related Industry Roles', 'Academia', 'Research', 'Entrepreneurship', ...defaults];
    }
    
    if (option.type === 'CAREER') {
      return ['Adjacent Industries', 'Freelancing', 'Consulting', 'Teaching', ...defaults];
    }

    return defaults;
  }

  /**
   * Quick check for path dependency
   */
  quickPathDependencyCheck(optionName: string, decisionType: CriticalityDecisionType): {
    hasHighDependency: boolean;
    dependencyScore: number;
    warning: string;
  } {
    const mockOption: CriticalityOption = {
      id: 'quick-check',
      name: optionName,
      description: '',
      type: 'OTHER',
    };

    const analysis = this.analyzePathDependency(mockOption, decisionType, {
      urgency: 'MEDIUM',
      resources: 'MODERATE',
      constraints: [],
      priorDecisions: [],
      riskTolerance: 'MODERATE',
    });

    return {
      hasHighDependency: analysis.dependencyScore > 0.65,
      dependencyScore: analysis.dependencyScore,
      warning: analysis.dependencyScore > 0.65
        ? `High path dependency detected. Future options will be significantly constrained.`
        : `Moderate path dependency. Some flexibility remains.`,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a path dependency engine
 */
export function createPathDependencyEngine(): PathDependencyEngine {
  return new PathDependencyEngine();
}

/**
 * Analyze path dependency for a quick check
 */
export function analyzePathDependency(
  option: CriticalityOption,
  decisionType: CriticalityDecisionType
): PathDependencyAnalysis {
  const engine = createPathDependencyEngine();
  return engine.analyzePathDependency(option, decisionType, {
    urgency: 'MEDIUM',
    resources: 'MODERATE',
    constraints: [],
    priorDecisions: [],
    riskTolerance: 'MODERATE',
  });
}
