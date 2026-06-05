/**
 * Coalition Module - Domain Authority Specialization
 *
 * Part of the Constitutional Decision Authority
 * Handles coalition-specific domain logic while delegating generic decision-making
 * to the parent Decision Authority.
 *
 * @module intelligence/decision/coalition
 */

import type { Confidence } from '../ConfidenceTypes';

// ============================================================================
// COALITION TYPES
// ============================================================================

/**
 * The 7 coalition members representing decision stakeholders.
 */
export type CoalitionMember =
  | 'student-interests'
  | 'student-values'
  | 'family-expectations'
  | 'economic-reality'
  | 'educational-reality'
  | 'geographic-reality'
  | 'future-opportunity-preservation';

/**
 * All coalition members in order of default weight.
 */
export const ALL_COALITION_MEMBERS: CoalitionMember[] = [
  'student-interests',
  'student-values',
  'family-expectations',
  'economic-reality',
  'educational-reality',
  'geographic-reality',
  'future-opportunity-preservation',
];

/**
 * Default weights for coalition members.
 */
export const DEFAULT_MEMBER_WEIGHTS: Record<CoalitionMember, number> = {
  'student-interests': 0.25,
  'student-values': 0.20,
  'family-expectations': 0.15,
  'economic-reality': 0.15,
  'educational-reality': 0.10,
  'geographic-reality': 0.10,
  'future-opportunity-preservation': 0.05,
};

/**
 * Individual coalition member's evaluation of a path.
 */
export interface CoalitionMemberEvaluation {
  /** Coalition member identifier */
  member: CoalitionMember;

  /** Support level for this path (0-100, higher = more supportive) */
  supportScore: number;

  /** How much this member conflicts with the path (-100 to 100) */
  conflictScore: number;

  /** Alignment between member priorities and path characteristics */
  alignmentScore: number;

  /** Specific concerns from this member */
  concerns: string[];

  /** Specific endorsements from this member */
  endorsements: string[];

  /** Weight of this member in the coalition (0-1) */
  weight: number;

  /** Confidence in this evaluation (0-1) */
  confidence: Confidence;
}

/**
 * Conflict between two coalition members.
 */
export interface MemberConflict {
  /** First member */
  memberA: CoalitionMember;

  /** Second member */
  memberB: CoalitionMember;

  /** Nature of conflict */
  conflictType: 'values' | 'priorities' | 'constraints' | 'expectations';

  /** Description of conflict */
  description: string;

  /** Severity (0-100) */
  severity: number;

  /** Whether this conflict can be resolved */
  isResolvable: boolean;

  /** Potential resolution strategies */
  resolutionStrategies: string[];
}

/**
 * Coalition dynamics analysis.
 */
export interface CoalitionDynamics {
  /** Members in strong support */
  strongSupport: CoalitionMember[];

  /** Members with reservations */
  reservations: CoalitionMember[];

  /** Members in opposition */
  opposition: CoalitionMember[];

  /** Key conflicts between members */
  memberConflicts: MemberConflict[];

  /** Coalition consensus level */
  consensusLevel: 'unanimous' | 'strong' | 'moderate' | 'weak' | 'fractured';
}

/**
 * Coalition aggregate scores.
 */
export interface CoalitionAggregateScores {
  /** Overall coalition support (0-100) */
  coalitionSupport: number;

  /** Overall coalition conflict (-100 to 100) */
  coalitionConflict: number;

  /** Alignment between path and coalition priorities (0-100) */
  alignmentScore: number;

  /** Internal tension within coalition (0-100) */
  tensionScore: number;

  /** Coalition stability score (0-100, higher = more stable) */
  stabilityScore: number;
}

/**
 * Coalition configuration options.
 */
export interface CoalitionConfig {
  /** Weights for coalition members (default: equal) */
  memberWeights?: Partial<Record<CoalitionMember, number>>;

  /** Minimum support threshold for consideration */
  minSupportThreshold?: number;

  /** Maximum acceptable conflict */
  maxConflictThreshold?: number;

  /** Whether to include resolution strategies */
  includeResolutionStrategies?: boolean;

  /** Conflict detection threshold */
  conflictThreshold?: number;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Student interests data.
 */
export interface StudentInterestsInput {
  coreInterests: string[];
  growthPreference: 'high' | 'moderate' | 'stable';
}

/**
 * Student values data.
 */
export interface StudentValuesInput {
  coreValues: string[];
  riskTolerance: 'high' | 'moderate' | 'low';
}

/**
 * Student constraints data.
 */
export interface StudentConstraintsInput {
  geographic?: {
    willingToRelocate: boolean;
    preferredLocation?: 'urban' | 'suburban' | 'rural';
    openToRemote?: boolean;
  };
  academicFeasibility?: 'high' | 'moderate' | 'low';
}

/**
 * Path metrics for coalition evaluation.
 */
export interface PathMetricsInput {
  totalYears: number;
  incomeRange: {
    entry: number;
    mid: number;
    senior: number;
    growthRate: number;
  };
  cumulativeSuccessProbability: number;
  minReversibility: number;
}

/**
 * Path scores for coalition evaluation.
 */
export interface PathScoresInput {
  growthScore: number;
  stabilityScore: number;
  flexibilityScore: number;
  optionalityScore: number;
  criticalityScore: number;
}

/**
 * Path node data.
 */
export interface PathNodeInput {
  id: string;
  name: string;
  category: string;
  isTerminal: boolean;
  skillCategories: string[];
  requiredProfile?: Record<string, number>;
  metadata?: {
    demandLevel?: number;
  };
}

/**
 * Complete path data.
 */
export interface PathInput {
  id: string;
  name: string;
  type: 'primary' | 'alternative' | 'exploratory';
  nodes: PathNodeInput[];
  metrics: PathMetricsInput;
  scores: PathScoresInput;
  risk: {
    level: 'low' | 'moderate' | 'high' | 'extreme';
  };
}

/**
 * Input for coalition member evaluation.
 */
export interface CoalitionEvaluationInput {
  path: PathInput;
  memberWeights: Record<CoalitionMember, number>;
  studentInterests: StudentInterestsInput;
  studentValues: StudentValuesInput;
  studentConstraints: StudentConstraintsInput;
}

// ============================================================================
// COALITION MODULE INTERFACE
// ============================================================================

/**
 * Interface for the Coalition Module.
 *
 * The Coalition Module is a domain-specific specialization within the Decision Authority
 * that handles coalition member evaluation and coalition-specific analysis.
 *
 * It does NOT perform generic decision operations (ranking, comparison, selection).
 * Those remain the sole responsibility of the Decision Authority.
 */
export interface ICoalitionModule {
  /**
   * Evaluate all coalition members for a given path.
   *
   * @param input - Evaluation input data
   * @returns Map of member evaluations
   */
  evaluateMembers(input: CoalitionEvaluationInput): Map<CoalitionMember, CoalitionMemberEvaluation>;

  /**
   * Evaluate a specific coalition member.
   *
   * @param member - The coalition member to evaluate
   * @param input - Evaluation input data
   * @returns Member evaluation
   */
  evaluateMember(
    member: CoalitionMember,
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation;

  /**
   * Calculate aggregate scores from member evaluations.
   *
   * @param evaluations - Map of member evaluations
   * @returns Aggregate scores
   */
  calculateAggregateScores(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionAggregateScores;

  /**
   * Analyze coalition dynamics.
   *
   * @param evaluations - Map of member evaluations
   * @returns Coalition dynamics
   */
  analyzeDynamics(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionDynamics;

  /**
   * Identify conflicts between coalition members.
   *
   * @param evaluations - Map of member evaluations
   * @param threshold - Conflict detection threshold (default: 40)
   * @returns Array of member conflicts
   */
  identifyConflicts(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    threshold?: number
  ): MemberConflict[];

  /**
   * Suggest resolution strategies for a conflict.
   *
   * @param conflict - The member conflict
   * @returns Array of resolution strategies
   */
  suggestResolutionStrategies(conflict: MemberConflict): string[];

  /**
   * Get default member weights.
   *
   * @returns Default weights record
   */
  getDefaultWeights(): Record<CoalitionMember, number>;

  /**
   * Validate member weights.
   *
   * @param weights - Weights to validate
   * @returns Validated weights (normalized to sum to 1)
   */
  validateWeights(weights: Partial<Record<CoalitionMember, number>>): Record<CoalitionMember, number>;
}

// ============================================================================
// COALITION MODULE IMPLEMENTATION
// ============================================================================

/**
 * Implementation of the Coalition Module.
 *
 * This module encapsulates all coalition-specific domain logic including:
 * - Member evaluation algorithms
 * - Coalition dynamics analysis
 * - Conflict identification
 * - Aggregate score calculation
 *
 * Generic decision operations (ranking, comparison, selection) are delegated
 * to the parent Decision Authority.
 */
export class CoalitionModule implements ICoalitionModule {
  private config: CoalitionConfig;

  constructor(config: CoalitionConfig = {}) {
    this.config = {
      conflictThreshold: 40,
      includeResolutionStrategies: true,
      ...config,
    };
  }

  /**
   * Evaluate all coalition members for a path.
   */
  evaluateMembers(
    input: CoalitionEvaluationInput
  ): Map<CoalitionMember, CoalitionMemberEvaluation> {
    const evaluations = new Map<CoalitionMember, CoalitionMemberEvaluation>();

    for (const member of ALL_COALITION_MEMBERS) {
      const evaluation = this.evaluateMember(member, input);
      evaluations.set(member, evaluation);
    }

    return evaluations;
  }

  /**
   * Evaluate a specific coalition member.
   */
  evaluateMember(
    member: CoalitionMember,
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    switch (member) {
      case 'student-interests':
        return this.evaluateStudentInterests(input);
      case 'student-values':
        return this.evaluateStudentValues(input);
      case 'family-expectations':
        return this.evaluateFamilyExpectations(input);
      case 'economic-reality':
        return this.evaluateEconomicReality(input);
      case 'educational-reality':
        return this.evaluateEducationalReality(input);
      case 'geographic-reality':
        return this.evaluateGeographicReality(input);
      case 'future-opportunity-preservation':
        return this.evaluateFutureOpportunity(input);
      default:
        throw new Error(`Unknown coalition member: ${member}`);
    }
  }

  // ============================================================================
  // MEMBER EVALUATORS (Domain-Specific Logic)
  // ============================================================================

  /**
   * Evaluate Student Interests coalition member.
   */
  private evaluateStudentInterests(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, studentInterests, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    const interests = studentInterests.coreInterests || [];
    const pathKeywords = path.name.toLowerCase();

    let alignmentScore = 50;

    const interestMatch = interests.some(i => pathKeywords.includes(i.toLowerCase()));

    if (interestMatch) {
      alignmentScore += 30;
      endorsements.push('Path aligns with stated interests');
    } else if (interests.length > 0) {
      alignmentScore -= 20;
      concerns.push('Path may not align with core interests');
    }

    if (path.scores.growthScore > 70) {
      alignmentScore += 10;
      endorsements.push('Strong growth potential matches ambition');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'student-interests',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['student-interests'],
      confidence: 0.8,
    };
  }

  /**
   * Evaluate Student Values coalition member.
   */
  private evaluateStudentValues(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, studentValues, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    const values = studentValues.coreValues || [];
    let alignmentScore = 50;

    if (values.includes('impact') && path.scores.growthScore > 60) {
      alignmentScore += 15;
      endorsements.push('Path enables meaningful impact');
    }

    if (values.includes('stability') && path.scores.stabilityScore > 70) {
      alignmentScore += 20;
      endorsements.push('Path provides desired stability');
    }

    if (values.includes('flexibility') && path.scores.flexibilityScore > 70) {
      alignmentScore += 20;
      endorsements.push('Path preserves career flexibility');
    }

    if (values.includes('creativity') && path.nodes.some(n =>
      n.skillCategories.includes('creative')
    )) {
      alignmentScore += 15;
      endorsements.push('Path allows creative expression');
    }

    if (values.includes('risk-averse') && path.risk.level === 'high') {
      alignmentScore -= 25;
      concerns.push('Path risk level conflicts with risk-averse values');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'student-values',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['student-values'],
      confidence: 0.75,
    };
  }

  /**
   * Evaluate Family Expectations coalition member.
   */
  private evaluateFamilyExpectations(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    if (path.scores.stabilityScore > 70) {
      alignmentScore += 20;
      endorsements.push('Stable path aligns with family security concerns');
    }

    const terminalNode = path.nodes[path.nodes.length - 1];
    if (terminalNode?.isTerminal) {
      alignmentScore += 10;
      endorsements.push('Clear career destination appeals to family');
    }

    if (path.metrics.incomeRange.senior > 1500000) {
      alignmentScore += 15;
      endorsements.push('Strong income potential meets family expectations');
    }

    const traditionalCategories = ['engineering', 'medicine', 'finance', 'law'];
    const pathCategory = terminalNode?.category.toLowerCase() || '';

    if (traditionalCategories.includes(pathCategory)) {
      alignmentScore += 15;
      endorsements.push('Traditional career path meets cultural expectations');
    } else if (pathCategory === 'entrepreneurship') {
      alignmentScore -= 10;
      concerns.push('Entrepreneurial path may concern risk-averse family members');
    }

    if (path.metrics.totalYears > 10) {
      alignmentScore -= 10;
      concerns.push('Extended timeline may concern family');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'family-expectations',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['family-expectations'],
      confidence: 0.7,
    };
  }

  /**
   * Evaluate Economic Reality coalition member.
   */
  private evaluateEconomicReality(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    const entryIncome = path.metrics.incomeRange.entry;
    const seniorIncome = path.metrics.incomeRange.senior;

    if (entryIncome > 800000) {
      alignmentScore += 20;
      endorsements.push('Strong entry-level income supports economic needs');
    } else if (entryIncome < 400000) {
      alignmentScore -= 20;
      concerns.push('Low entry income may create financial pressure');
    }

    if (path.metrics.incomeRange.growthRate > 100) {
      alignmentScore += 15;
      endorsements.push('High growth rate improves long-term economic position');
    }

    if (path.metrics.totalYears <= 5) {
      alignmentScore += 10;
      endorsements.push('Quick path to earning reduces financial strain');
    } else if (path.metrics.totalYears > 8) {
      alignmentScore -= 15;
      concerns.push('Extended education/training period creates economic pressure');
    }

    if (path.metrics.cumulativeSuccessProbability < 0.4) {
      alignmentScore -= 20;
      concerns.push('Low success probability represents economic risk');
    } else if (path.metrics.cumulativeSuccessProbability > 0.7) {
      alignmentScore += 10;
      endorsements.push('High success probability provides economic security');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'economic-reality',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['economic-reality'],
      confidence: 0.85,
    };
  }

  /**
   * Evaluate Educational Reality coalition member.
   */
  private evaluateEducationalReality(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, studentConstraints, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    if (path.metrics.totalYears > 6) {
      alignmentScore -= 10;
      concerns.push('Extended education timeline may be challenging');
    }

    if (studentConstraints.academicFeasibility === 'high') {
      alignmentScore += 10;
      endorsements.push('Path is academically feasible');
    }

    const highDifficultyNodes = path.nodes.filter(n => {
      const profile = n.requiredProfile || {};
      const avgSkill = Object.values(profile).reduce((a, b) => a + b, 0) / Object.keys(profile).length;
      return avgSkill > 0.7;
    }).length;

    if (highDifficultyNodes > 2) {
      alignmentScore -= 15;
      concerns.push('Multiple high-difficulty educational requirements');
    } else if (highDifficultyNodes === 0) {
      alignmentScore += 10;
      endorsements.push('Path has manageable educational requirements');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'educational-reality',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['educational-reality'],
      confidence: 0.75,
    };
  }

  /**
   * Evaluate Geographic Reality coalition member.
   */
  private evaluateGeographicReality(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, studentConstraints, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    const geoConstraints = studentConstraints.geographic || { willingToRelocate: true };
    const terminalNode = path.nodes[path.nodes.length - 1];

    const requiresRelocation = !geoConstraints.willingToRelocate &&
      (terminalNode?.metadata?.demandLevel || 0) < 0.5;

    if (requiresRelocation) {
      alignmentScore -= 25;
      concerns.push('Path may require relocation against preferences');
    } else if (geoConstraints.willingToRelocate) {
      alignmentScore += 10;
      endorsements.push('Geographic flexibility supports this path');
    }

    if (geoConstraints.preferredLocation === 'urban') {
      if (['technology', 'finance', 'business'].includes(terminalNode?.category)) {
        alignmentScore += 10;
        endorsements.push('Path aligns with urban location preference');
      }
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'geographic-reality',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['geographic-reality'],
      confidence: 0.7,
    };
  }

  /**
   * Evaluate Future Opportunity Preservation coalition member.
   */
  private evaluateFutureOpportunity(
    input: CoalitionEvaluationInput
  ): CoalitionMemberEvaluation {
    const { path, memberWeights } = input;
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    const optionalityScore = path.scores.optionalityScore;

    if (optionalityScore > 75) {
      alignmentScore += 30;
      endorsements.push('Excellent future optionality preserved');
    } else if (optionalityScore > 50) {
      alignmentScore += 15;
      endorsements.push('Good future optionality maintained');
    } else if (optionalityScore < 30) {
      alignmentScore -= 25;
      concerns.push('Limited future options after this path');
    }

    const criticalityScore = path.scores.criticalityScore;

    if (criticalityScore < 40) {
      alignmentScore += 15;
      endorsements.push('Low path criticality preserves flexibility');
    } else if (criticalityScore > 70) {
      alignmentScore -= 20;
      concerns.push('High path criticality constrains future options');
    }

    if (path.scores.flexibilityScore > 70) {
      alignmentScore += 10;
      endorsements.push('High flexibility enables future pivots');
    }

    if (path.metrics.minReversibility < 0.3) {
      alignmentScore -= 10;
      concerns.push('Some transitions are difficult to reverse');
    }

    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'future-opportunity-preservation',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight: memberWeights['future-opportunity-preservation'],
      confidence: 0.8,
    };
  }

  // ============================================================================
  // AGGREGATION METHODS
  // ============================================================================

  /**
   * Calculate aggregate scores from member evaluations.
   */
  calculateAggregateScores(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionAggregateScores {
    const evalArray = Array.from(evaluations.values());

    const weightedSupport = evalArray.reduce(
      (sum, e) => sum + e.supportScore * e.weight,
      0
    ) / evalArray.reduce((sum, e) => sum + e.weight, 0);

    const weightedConflict = evalArray.reduce(
      (sum, e) => sum + e.conflictScore * e.weight,
      0
    ) / evalArray.reduce((sum, e) => sum + e.weight, 0);

    const alignmentScore = evalArray.reduce(
      (sum, e) => sum + e.alignmentScore,
      0
    ) / evalArray.length;

    const avgSupport = evalArray.reduce((sum, e) => sum + e.supportScore, 0) / evalArray.length;
    const variance = evalArray.reduce(
      (sum, e) => sum + Math.pow(e.supportScore - avgSupport, 2),
      0
    ) / evalArray.length;
    const tensionScore = Math.min(100, variance / 10);

    const stabilityScore = Math.max(0, Math.min(100,
      weightedSupport * 0.6 +
      (100 - weightedConflict) * 0.2 +
      (100 - tensionScore) * 0.2
    ));

    return {
      coalitionSupport: Math.round(weightedSupport),
      coalitionConflict: Math.round(weightedConflict),
      alignmentScore: Math.round(alignmentScore),
      tensionScore: Math.round(tensionScore),
      stabilityScore: Math.round(stabilityScore),
    };
  }

  // ============================================================================
  // DYNAMICS ANALYSIS
  // ============================================================================

  /**
   * Analyze coalition dynamics.
   */
  analyzeDynamics(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): CoalitionDynamics {
    const evalArray = Array.from(evaluations.values());

    const strongSupport = evalArray
      .filter(e => e.supportScore >= 70)
      .map(e => e.member);

    const reservations = evalArray
      .filter(e => e.supportScore >= 40 && e.supportScore < 70)
      .map(e => e.member);

    const opposition = evalArray
      .filter(e => e.supportScore < 40)
      .map(e => e.member);

    const memberConflicts = this.identifyConflicts(evaluations);

    const supportRatio = strongSupport.length / evalArray.length;
    let consensusLevel: CoalitionDynamics['consensusLevel'];

    if (supportRatio >= 0.85) consensusLevel = 'unanimous';
    else if (supportRatio >= 0.65) consensusLevel = 'strong';
    else if (supportRatio >= 0.45) consensusLevel = 'moderate';
    else if (supportRatio >= 0.25) consensusLevel = 'weak';
    else consensusLevel = 'fractured';

    return {
      strongSupport,
      reservations,
      opposition,
      memberConflicts,
      consensusLevel,
    };
  }

  /**
   * Identify conflicts between coalition members.
   */
  identifyConflicts(
    evaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    threshold: number = 40
  ): MemberConflict[] {
    const conflicts: MemberConflict[] = [];
    const evalEntries = Array.from(evaluations.entries());

    for (let i = 0; i < evalEntries.length; i++) {
      for (let j = i + 1; j < evalEntries.length; j++) {
        const [memberA, evalA] = evalEntries[i];
        const [memberB, evalB] = evalEntries[j];

        const supportDiff = Math.abs(evalA.supportScore - evalB.supportScore);

        if (supportDiff > threshold) {
          const severity = Math.min(100, supportDiff);
          const { conflictType, description } = this.classifyConflict(memberA, memberB);

          conflicts.push({
            memberA,
            memberB,
            conflictType,
            description,
            severity,
            isResolvable: severity < 70,
            resolutionStrategies: this.suggestResolutionStrategies({
              memberA,
              memberB,
              conflictType,
              description,
              severity,
              isResolvable: severity < 70,
              resolutionStrategies: [],
            }),
          });
        }
      }
    }

    return conflicts.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Classify conflict between two members.
   */
  private classifyConflict(
    memberA: CoalitionMember,
    memberB: CoalitionMember
  ): { conflictType: MemberConflict['conflictType']; description: string } {
    if (
      (memberA === 'student-interests' && memberB === 'family-expectations') ||
      (memberA === 'family-expectations' && memberB === 'student-interests')
    ) {
      return {
        conflictType: 'expectations',
        description: `${memberA.replace('-', ' ')} conflicts with ${memberB.replace('-', ' ')}`,
      };
    }

    if (
      memberA === 'student-values' && memberB === 'economic-reality' ||
      memberA === 'economic-reality' && memberB === 'student-values'
    ) {
      return {
        conflictType: 'priorities',
        description: 'Values priorities conflict with economic constraints',
      };
    }

    if (
      memberA === 'student-interests' && memberB === 'future-opportunity-preservation' ||
      memberA === 'future-opportunity-preservation' && memberB === 'student-interests'
    ) {
      return {
        conflictType: 'values',
        description: 'Interest alignment vs long-term optionality',
      };
    }

    return {
      conflictType: 'constraints',
      description: `Different priorities between ${memberA.replace('-', ' ')} and ${memberB.replace('-', ' ')}`,
    };
  }

  /**
   * Suggest resolution strategies for a conflict.
   */
  suggestResolutionStrategies(conflict: MemberConflict): string[] {
    const strategies: string[] = [];
    const { memberA, memberB } = conflict;

    if (
      (memberA === 'student-interests' && memberB === 'family-expectations') ||
      (memberA === 'family-expectations' && memberB === 'student-interests')
    ) {
      strategies.push('Find compromise path that partially satisfies both');
      strategies.push('Have structured conversation about priorities');
      strategies.push('Consider phased approach (stable start, pivot later)');
    } else if (memberA === 'economic-reality' || memberB === 'economic-reality') {
      strategies.push('Explore financial aid or scholarship options');
      strategies.push('Consider part-time or flexible education paths');
      strategies.push('Build financial runway before committing');
    } else if (
      memberA === 'future-opportunity-preservation' ||
      memberB === 'future-opportunity-preservation'
    ) {
      strategies.push('Choose path with higher optionality score');
      strategies.push('Plan for skill development that preserves flexibility');
    } else {
      strategies.push('Prioritize based on long-term impact');
      strategies.push('Seek mentorship from those who faced similar choices');
    }

    return strategies;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get default member weights.
   */
  getDefaultWeights(): Record<CoalitionMember, number> {
    return { ...DEFAULT_MEMBER_WEIGHTS };
  }

  /**
   * Validate and normalize member weights.
   */
  validateWeights(
    weights: Partial<Record<CoalitionMember, number>>
  ): Record<CoalitionMember, number> {
    const validated: Partial<Record<CoalitionMember, number>> = {};

    for (const member of ALL_COALITION_MEMBERS) {
      const weight = weights[member] ?? DEFAULT_MEMBER_WEIGHTS[member];
      validated[member] = Math.max(0, Math.min(1, weight));
    }

    // Normalize to sum to 1
    const sum = Object.values(validated).reduce((a, b) => a + b, 0);
    const normalized: Record<CoalitionMember, number> = { ...DEFAULT_MEMBER_WEIGHTS };

    for (const member of ALL_COALITION_MEMBERS) {
      normalized[member] = (validated[member] || DEFAULT_MEMBER_WEIGHTS[member]) / sum;
    }

    return normalized;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a Coalition Module instance.
 */
export function createCoalitionModule(config?: CoalitionConfig): ICoalitionModule {
  return new CoalitionModule(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CoalitionMember,
  CoalitionMemberEvaluation,
  MemberConflict,
  CoalitionDynamics,
  CoalitionAggregateScores,
  CoalitionConfig,
  CoalitionEvaluationInput,
  StudentInterestsInput,
  StudentValuesInput,
  StudentConstraintsInput,
  PathMetricsInput,
  PathScoresInput,
  PathNodeInput,
  PathInput,
};
