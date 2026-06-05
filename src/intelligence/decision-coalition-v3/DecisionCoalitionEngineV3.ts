/**
 * CareerOS Decision Coalition Engine V3
 *
 * CareerOS - Career Intelligence System
 *
 * Purpose: Model career decisions as negotiations between multiple stakeholders and constraints.
 *
 * Architecture Principles:
 *   - Multi-stakeholder: Models 7 distinct coalition members
 *   - Path-aware: Evaluates CareerPathExplorer results
 *   - Graph-aware: Considers Career Transition Graph structure
 *   - Deterministic: Same inputs always produce same outputs
 *   - Explainable: Clear reasoning for all coalition dynamics
 *
 * Coalition Members:
 *   1. Student Interests - What the student wants (preferences, passions)
 *   2. Student Values - What the student believes (priorities, principles)
 *   3. Family Expectations - What family wants (cultural, social, prestige)
 *   4. Economic Reality - Financial constraints (income needs, cost, ROI)
 *   5. Educational Reality - Feasibility (access, admissions, prerequisites)
 *   6. Geographic Reality - Location constraints (mobility, regional markets)
 *   7. Future Opportunity Preservation - Optionality maintenance
 *
 * Example Output:
 *   "Student strongly prefers Design. Family prefers Engineering.
 *    Design path has higher fit but higher risk.
 *    Engineering path has lower fit but stronger coalition stability."
 */

import type { StudentBeliefV3 } from '../student-model';
import type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathType,
} from '../path-explorer';
import type { OptionalityAnalysis } from '../optionality-engine';
import type { CriticalityAnalysis } from '../criticality-engine';
import type { CareerNode } from '../career-transition-graph';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for coalition analyses.
 */
export type CoalitionAnalysisId = string;

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
  confidence: number;
}

/**
 * Complete coalition analysis for a career path.
 */
export interface PathCoalitionAnalysis {
  /** Path being analyzed */
  pathId: string;
  pathType: PathType;
  pathName: string;

  /** Evaluations from all coalition members */
  memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>;

  /** Aggregate scores */
  aggregate: {
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
  };

  /** Coalition dynamics */
  dynamics: {
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
  };

  /** Explainability output */
  explanation: CoalitionExplanation;
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
 * Explainability output for coalition analysis.
 */
export interface CoalitionExplanation {
  /** One-line summary */
  summary: string;

  /** Detailed explanation */
  details: string;

  /** Why this coalition dynamic exists */
  reasoning: string;

  /** Key strengths of coalition alignment */
  coalitionStrengths: string[];

  /** Key conflicts in coalition */
  coalitionConflicts: string[];

  /** Recommended negotiations */
  recommendedNegotiations: string[];

  /** Alternative paths to consider */
  alternativeConsiderations: string[];
}

/**
 * Comparison between paths from coalition perspective.
 */
export interface CoalitionPathComparison {
  /** First path analysis */
  pathA: PathCoalitionAnalysis;

  /** Second path analysis */
  pathB: PathCoalitionAnalysis;

  /** Which path has stronger coalition support */
  strongerSupport: 'pathA' | 'pathB' | 'equal';

  /** Which path has lower coalition conflict */
  lowerConflict: 'pathA' | 'pathB' | 'equal';

  /** Which path has higher coalition stability */
  higherStability: 'pathA' | 'pathB' | 'equal';

  /** Support difference by member */
  supportByMember: Map<CoalitionMember, { pathA: number; pathB: number; difference: number }>;

  /** Human-readable comparison */
  comparisonText: string;

  /** Key tradeoffs */
  tradeoffs: string[];
}

/**
 * Complete Decision Coalition analysis result.
 */
export interface DecisionCoalitionAnalysis {
  /** Unique identifier */
  id: CoalitionAnalysisId;

  /** Student belief used for analysis */
  studentBelief: StudentBeliefV3;

  /** Path explorer results analyzed */
  pathExplorerResult: CareerPathExplorerResult;

  /** Analysis for each path */
  pathAnalyses: Map<string, PathCoalitionAnalysis>;

  /** Ranking of paths by coalition stability */
  rankedPaths: PathCoalitionAnalysis[];

  /** Overall coalition health */
  coalitionHealth: {
    /** Overall cohesion (0-100) */
    cohesion: number;

    /** Level of conflict (0-100) */
    conflictLevel: number;

    /** Decision clarity (0-100) */
    clarity: number;

    /** Recommendation confidence (0-1) */
    confidence: number;
  };

  /** Cross-path comparison */
  pathComparison: CoalitionPathComparison | null;

  /** Overall recommendation */
  recommendation: CoalitionRecommendation;

  /** Timestamp */
  generatedAt: number;
}

/**
 * Coalition recommendation.
 */
export interface CoalitionRecommendation {
  /** Recommended path ID */
  recommendedPathId: string;

  /** Recommended path type */
  recommendedPathType: PathType;

  /** Confidence in recommendation (0-1) */
  confidence: number;

  /** Primary reasoning */
  reasoning: string;

  /** Supporting coalition members */
  supportingMembers: CoalitionMember[];

  /** Opposing coalition members */
  opposingMembers: CoalitionMember[];

  /** Conditions for success */
  successConditions: string[];

  /** Risk mitigation strategies */
  riskMitigation: string[];
}

/**
 * Options for coalition analysis.
 */
export interface CoalitionAnalysisOptions {
  /** Weights for coalition members (default: equal) */
  memberWeights?: Partial<Record<CoalitionMember, number>>;

  /** Minimum support threshold for consideration */
  minSupportThreshold?: number;

  /** Maximum acceptable conflict */
  maxConflictThreshold?: number;

  /** Whether to include resolution strategies */
  includeResolutionStrategies?: boolean;

  /** Analysis depth */
  depth?: 'surface' | 'moderate' | 'deep';
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_MEMBER_WEIGHTS: Record<CoalitionMember, number> = {
  'student-interests': 0.25,
  'student-values': 0.20,
  'family-expectations': 0.15,
  'economic-reality': 0.15,
  'educational-reality': 0.10,
  'geographic-reality': 0.10,
  'future-opportunity-preservation': 0.05,
};

// ============================================================================
// DECISION COALITION ENGINE V3
// ============================================================================

export class DecisionCoalitionEngineV3 {
  private studentBelief: StudentBeliefV3;
  private pathExplorerResult: CareerPathExplorerResult;
  private optionalityResults: Map<string, OptionalityAnalysis>;
  private criticalityResults: Map<string, CriticalityAnalysis>;

  constructor(
    studentBelief: StudentBeliefV3,
    pathExplorerResult: CareerPathExplorerResult,
    optionalityResults: Map<string, OptionalityAnalysis> = new Map(),
    criticalityResults: Map<string, CriticalityAnalysis> = new Map()
  ) {
    this.studentBelief = studentBelief;
    this.pathExplorerResult = pathExplorerResult;
    this.optionalityResults = optionalityResults;
    this.criticalityResults = criticalityResults;
  }

  /**
   * Analyze decision coalition for all paths.
   */
  analyze(options: CoalitionAnalysisOptions = {}): DecisionCoalitionAnalysis {
    const memberWeights = { ...DEFAULT_MEMBER_WEIGHTS, ...options.memberWeights };
    const depth = options.depth ?? 'moderate';

    // Analyze each path
    const pathAnalyses = new Map<string, PathCoalitionAnalysis>();

    for (const path of this.pathExplorerResult.paths) {
      const analysis = this.analyzePath(path, memberWeights, depth);
      pathAnalyses.set(path.id, analysis);
    }

    // Rank paths by coalition stability
    const rankedPaths = Array.from(pathAnalyses.values()).sort(
      (a, b) => b.aggregate.stabilityScore - a.aggregate.stabilityScore
    );

    // Calculate overall coalition health
    const coalitionHealth = this.calculateCoalitionHealth(pathAnalyses);

    // Compare top paths
    const pathComparison =
      rankedPaths.length >= 2
        ? this.comparePaths(rankedPaths[0], rankedPaths[1])
        : null;

    // Generate recommendation
    const recommendation = this.generateRecommendation(rankedPaths, coalitionHealth);

    return {
      id: `coalition-${this.studentBelief.studentId}-${Date.now()}`,
      studentBelief: this.studentBelief,
      pathExplorerResult: this.pathExplorerResult,
      pathAnalyses,
      rankedPaths,
      coalitionHealth,
      pathComparison,
      recommendation,
      generatedAt: Date.now(),
    };
  }

  /**
   * Analyze coalition for a single path.
   */
  private analyzePath(
    path: ExploredCareerPath,
    memberWeights: Record<CoalitionMember, number>,
    depth: 'surface' | 'moderate' | 'deep'
  ): PathCoalitionAnalysis {
    // Evaluate each coalition member
    const memberEvaluations = new Map<CoalitionMember, CoalitionMemberEvaluation>();

    memberEvaluations.set(
      'student-interests',
      this.evaluateStudentInterests(path, memberWeights['student-interests'])
    );

    memberEvaluations.set(
      'student-values',
      this.evaluateStudentValues(path, memberWeights['student-values'])
    );

    memberEvaluations.set(
      'family-expectations',
      this.evaluateFamilyExpectations(path, memberWeights['family-expectations'])
    );

    memberEvaluations.set(
      'economic-reality',
      this.evaluateEconomicReality(path, memberWeights['economic-reality'])
    );

    memberEvaluations.set(
      'educational-reality',
      this.evaluateEducationalReality(path, memberWeights['educational-reality'])
    );

    memberEvaluations.set(
      'geographic-reality',
      this.evaluateGeographicReality(path, memberWeights['geographic-reality'])
    );

    memberEvaluations.set(
      'future-opportunity-preservation',
      this.evaluateFutureOpportunity(path, memberWeights['future-opportunity-preservation'])
    );

    // Calculate aggregate scores
    const aggregate = this.calculateAggregateScores(memberEvaluations);

    // Analyze dynamics
    const dynamics = this.analyzeDynamics(memberEvaluations);

    // Generate explanation
    const explanation = this.generateExplanation(path, memberEvaluations, dynamics, aggregate);

    return {
      pathId: path.id,
      pathType: path.type,
      pathName: path.name,
      memberEvaluations,
      aggregate,
      dynamics,
      explanation,
    };
  }

  // ============================================================================
  // COALITION MEMBER EVALUATIONS
  // ============================================================================

  /**
   * Evaluate Student Interests coalition member.
   */
  private evaluateStudentInterests(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    // Check alignment with student interests from belief
    const interests = this.studentBelief.interests?.coreInterests || [];
    const pathKeywords = path.name.toLowerCase();

    let alignmentScore = 50; // Default neutral

    // Check if path aligns with interests
    const interestMatch = interests.some(i =>
      pathKeywords.includes(i.toLowerCase())
    );

    if (interestMatch) {
      alignmentScore += 30;
      endorsements.push('Path aligns with stated interests');
    } else if (interests.length > 0) {
      alignmentScore -= 20;
      concerns.push('Path may not align with core interests');
    }

    // Consider growth score from path
    if (path.scores.growthScore > 70) {
      alignmentScore += 10;
      endorsements.push('Strong growth potential matches ambition');
    }

    // Calculate support and conflict
    const supportScore = Math.max(0, Math.min(100, alignmentScore));
    const conflictScore = supportScore < 50 ? 50 - supportScore : 0;

    return {
      member: 'student-interests',
      supportScore,
      conflictScore,
      alignmentScore: supportScore,
      concerns,
      endorsements,
      weight,
      confidence: 0.8,
    };
  }

  /**
   * Evaluate Student Values coalition member.
   */
  private evaluateStudentValues(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    // Check alignment with student values
    const values = this.studentBelief.values?.coreValues || [];
    let alignmentScore = 50;

    // Value-based scoring
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

    // Risk tolerance check
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
      weight,
      confidence: 0.75,
    };
  }

  /**
   * Evaluate Family Expectations coalition member.
   */
  private evaluateFamilyExpectations(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    // Family typically values prestige and stability
    if (path.scores.stabilityScore > 70) {
      alignmentScore += 20;
      endorsements.push('Stable path aligns with family security concerns');
    }

    // Terminal positions often viewed positively
    if (path.nodes[path.nodes.length - 1]?.isTerminal) {
      alignmentScore += 10;
      endorsements.push('Clear career destination appeals to family');
    }

    // High income potential pleases family
    if (path.metrics.incomeRange.senior > 1500000) {
      alignmentScore += 15;
      endorsements.push('Strong income potential meets family expectations');
    }

    // Traditional vs non-traditional paths
    const traditionalCategories = ['engineering', 'medicine', 'finance', 'law'];
    const pathCategory = path.nodes[path.nodes.length - 1]?.category.toLowerCase() || '';

    if (traditionalCategories.includes(pathCategory)) {
      alignmentScore += 15;
      endorsements.push('Traditional career path meets cultural expectations');
    } else if (pathCategory === 'entrepreneurship') {
      alignmentScore -= 10;
      concerns.push('Entrepreneurial path may concern risk-averse family members');
    }

    // Long paths may concern family (time investment)
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
      weight,
      confidence: 0.7,
    };
  }

  /**
   * Evaluate Economic Reality coalition member.
   */
  private evaluateEconomicReality(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    // Income analysis
    const entryIncome = path.metrics.incomeRange.entry;
    const seniorIncome = path.metrics.incomeRange.senior;

    if (entryIncome > 800000) {
      alignmentScore += 20;
      endorsements.push('Strong entry-level income supports economic needs');
    } else if (entryIncome < 400000) {
      alignmentScore -= 20;
      concerns.push('Low entry income may create financial pressure');
    }

    // Growth rate
    if (path.metrics.incomeRange.growthRate > 100) {
      alignmentScore += 15;
      endorsements.push('High growth rate improves long-term economic position');
    }

    // Time to meaningful income
    if (path.metrics.totalYears <= 5) {
      alignmentScore += 10;
      endorsements.push('Quick path to earning reduces financial strain');
    } else if (path.metrics.totalYears > 8) {
      alignmentScore -= 15;
      concerns.push('Extended education/training period creates economic pressure');
    }

    // Success probability
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
      weight,
      confidence: 0.85,
    };
  }

  /**
   * Evaluate Educational Reality coalition member.
   */
  private evaluateEducationalReality(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    // Educational accessibility
    const studentConstraints = this.studentBelief.constraints || {};

    // Check if path requires extensive education beyond current standing
    if (path.metrics.totalYears > 6) {
      alignmentScore -= 10;
      concerns.push('Extended education timeline may be challenging');
    }

    // Feasibility based on current academic standing
    if (studentConstraints.academicFeasibility === 'high') {
      alignmentScore += 10;
      endorsements.push('Path is academically feasible');
    }

    // Prerequisite requirements
    const highDifficultyTransitions = path.edges.filter(e => e.transitionDifficulty > 70).length;
    if (highDifficultyTransitions > 1) {
      alignmentScore -= 15;
      concerns.push('Multiple high-difficulty transitions required');
    } else if (highDifficultyTransitions === 0) {
      alignmentScore += 10;
      endorsements.push('Path has manageable educational requirements');
    }

    // Skill continuity helps educational transition
    if (path.metrics.avgSkillOverlap > 0.6) {
      alignmentScore += 10;
      endorsements.push('Good skill continuity supports educational transitions');
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
      weight,
      confidence: 0.75,
    };
  }

  /**
   * Evaluate Geographic Reality coalition member.
   */
  private evaluateGeographicReality(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    // Geographic constraints from student belief
    const geoConstraints = this.studentBelief.constraints?.geographic || {};

    // Check if path requires relocation
    const finalNode = path.nodes[path.nodes.length - 1];
    const requiresRelocation = geoConstraints.willingToRelocate === false &&
      (finalNode?.metadata?.demandLevel || 0) < 0.5;

    if (requiresRelocation) {
      alignmentScore -= 25;
      concerns.push('Path may require relocation against preferences');
    } else if (geoConstraints.willingToRelocate) {
      alignmentScore += 10;
      endorsements.push('Geographic flexibility supports this path');
    }

    // Urban vs rural considerations
    if (geoConstraints.preferredLocation === 'urban') {
      // Most tech/finance paths work well in urban
      if (['technology', 'finance', 'business'].includes(finalNode?.category)) {
        alignmentScore += 10;
        endorsements.push('Path aligns with urban location preference');
      }
    }

    // Remote work capability
    const remoteCompatible = path.nodes.some(n =>
      n.requiredProfile?.socialOrientation || 0 < 0.5
    );

    if (remoteCompatible && geoConstraints.openToRemote) {
      alignmentScore += 5;
      endorsements.push('Remote work compatibility provides geographic flexibility');
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
      weight,
      confidence: 0.7,
    };
  }

  /**
   * Evaluate Future Opportunity Preservation coalition member.
   */
  private evaluateFutureOpportunity(
    path: ExploredCareerPath,
    weight: number
  ): CoalitionMemberEvaluation {
    const concerns: string[] = [];
    const endorsements: string[] = [];

    let alignmentScore = 50;

    // Use optionality score from path
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

    // Use criticality score
    const criticalityScore = path.scores.criticalityScore;

    if (criticalityScore < 40) {
      alignmentScore += 15;
      endorsements.push('Low path criticality preserves flexibility');
    } else if (criticalityScore > 70) {
      alignmentScore -= 20;
      concerns.push('High path criticality constrains future options');
    }

    // Flexibility score
    if (path.scores.flexibilityScore > 70) {
      alignmentScore += 10;
      endorsements.push('High flexibility enables future pivots');
    }

    // Reversibility
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
      weight,
      confidence: 0.8,
    };
  }

  // ============================================================================
  // AGGREGATE CALCULATIONS
  // ============================================================================

  /**
   * Calculate aggregate scores from member evaluations.
   */
  private calculateAggregateScores(
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): PathCoalitionAnalysis['aggregate'] {
    const evaluations = Array.from(memberEvaluations.values());

    // Weighted coalition support
    const weightedSupport = evaluations.reduce(
      (sum, e) => sum + e.supportScore * e.weight,
      0
    ) / evaluations.reduce((sum, e) => sum + e.weight, 0);

    // Weighted coalition conflict
    const weightedConflict = evaluations.reduce(
      (sum, e) => sum + e.conflictScore * e.weight,
      0
    ) / evaluations.reduce((sum, e) => sum + e.weight, 0);

    // Alignment score (average)
    const alignmentScore = evaluations.reduce(
      (sum, e) => sum + e.alignmentScore,
      0
    ) / evaluations.length;

    // Tension score - variance in support scores
    const avgSupport = evaluations.reduce((sum, e) => sum + e.supportScore, 0) / evaluations.length;
    const variance = evaluations.reduce(
      (sum, e) => sum + Math.pow(e.supportScore - avgSupport, 2),
      0
    ) / evaluations.length;
    const tensionScore = Math.min(100, variance / 10); // Scale variance to 0-100

    // Stability score - combination of support and inverse of conflict/tension
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

  /**
   * Analyze coalition dynamics.
   */
  private analyzeDynamics(
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): PathCoalitionAnalysis['dynamics'] {
    const evaluations = Array.from(memberEvaluations.values());

    // Categorize members by support level
    const strongSupport = evaluations
      .filter(e => e.supportScore >= 70)
      .map(e => e.member);

    const reservations = evaluations
      .filter(e => e.supportScore >= 40 && e.supportScore < 70)
      .map(e => e.member);

    const opposition = evaluations
      .filter(e => e.supportScore < 40)
      .map(e => e.member);

    // Identify member conflicts
    const memberConflicts = this.identifyMemberConflicts(memberEvaluations);

    // Determine consensus level
    let consensusLevel: PathCoalitionAnalysis['dynamics']['consensusLevel'];
    const supportRatio = strongSupport.length / evaluations.length;

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
  private identifyMemberConflicts(
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): MemberConflict[] {
    const conflicts: MemberConflict[] = [];
    const evaluations = Array.from(memberEvaluations.entries());

    // Check pairs for conflicts
    for (let i = 0; i < evaluations.length; i++) {
      for (let j = i + 1; j < evaluations.length; j++) {
        const [memberA, evalA] = evaluations[i];
        const [memberB, evalB] = evaluations[j];

        // Significant difference in support indicates conflict
        const supportDiff = Math.abs(evalA.supportScore - evalB.supportScore);

        if (supportDiff > 40) {
          const severity = Math.min(100, supportDiff);

          let conflictType: MemberConflict['conflictType'];
          let description: string;

          if (memberA === 'student-interests' && memberB === 'family-expectations') {
            conflictType = 'expectations';
            description = `${memberA.replace('-', ' ')} conflicts with ${memberB.replace('-', ' ')}`;
          } else if (memberA.includes('values') && memberB === 'economic-reality') {
            conflictType = 'priorities';
            description = 'Values priorities conflict with economic constraints';
          } else if (memberA === 'student-interests' && memberB === 'future-opportunity-preservation') {
            conflictType = 'values';
            description = 'Interest alignment vs long-term optionality';
          } else {
            conflictType = 'constraints';
            description = `Different priorities between ${memberA.replace('-', ' ')} and ${memberB.replace('-', ' ')}`;
          }

          conflicts.push({
            memberA,
            memberB,
            conflictType,
            description,
            severity,
            isResolvable: severity < 70,
            resolutionStrategies: this.suggestResolutionStrategies(memberA, memberB, severity),
          });
        }
      }
    }

    return conflicts.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Suggest resolution strategies for member conflicts.
   */
  private suggestResolutionStrategies(
    memberA: CoalitionMember,
    memberB: CoalitionMember,
    severity: number
  ): string[] {
    const strategies: string[] = [];

    if (memberA === 'student-interests' && memberB === 'family-expectations') {
      strategies.push('Find compromise path that partially satisfies both');
      strategies.push('Have structured conversation about priorities');
      strategies.push('Consider phased approach (stable start, pivot later)');
    } else if (memberA === 'economic-reality' || memberB === 'economic-reality') {
      strategies.push('Explore financial aid or scholarship options');
      strategies.push('Consider part-time or flexible education paths');
      strategies.push('Build financial runway before committing');
    } else if (memberA === 'future-opportunity-preservation' || memberB === 'future-opportunity-preservation') {
      strategies.push('Choose path with higher optionality score');
      strategies.push('Plan for skill development that preserves flexibility');
    } else {
      strategies.push('Prioritize based on long-term impact');
      strategies.push('Seek mentorship from those who faced similar choices');
    }

    return strategies;
  }

  // ============================================================================
  // EXPLANATION GENERATION
  // ============================================================================

  /**
   * Generate coalition explanation.
   */
  private generateExplanation(
    path: ExploredCareerPath,
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    dynamics: PathCoalitionAnalysis['dynamics'],
    aggregate: PathCoalitionAnalysis['aggregate']
  ): CoalitionExplanation {
    // Summary
    const summary = this.generateSummary(path, dynamics, aggregate);

    // Details
    const details = this.generateDetails(path, memberEvaluations, dynamics);

    // Reasoning
    const reasoning = this.generateReasoning(path, memberEvaluations, aggregate);

    // Strengths
    const coalitionStrengths = dynamics.strongSupport.map(
      member => `${member.replace('-', ' ')} strongly supports this path`
    );

    // Conflicts
    const coalitionConflicts = dynamics.memberConflicts.map(
      c => `${c.memberA.replace('-', ' ')} vs ${c.memberB.replace('-', ' ')}: ${c.description}`
    );

    // Recommendations
    const recommendedNegotiations = this.generateNegotiations(dynamics);

    // Alternatives
    const alternativeConsiderations = this.generateAlternativeConsiderations(path, memberEvaluations);

    return {
      summary,
      details,
      reasoning,
      coalitionStrengths,
      coalitionConflicts,
      recommendedNegotiations,
      alternativeConsiderations,
    };
  }

  /**
   * Generate summary.
   */
  private generateSummary(
    path: ExploredCareerPath,
    dynamics: PathCoalitionAnalysis['dynamics'],
    aggregate: PathCoalitionAnalysis['aggregate']
  ): string {
    const parts: string[] = [];

    parts.push(`${path.name} has ${aggregate.stabilityScore}/100 coalition stability.`);

    if (dynamics.consensusLevel === 'unanimous' || dynamics.consensusLevel === 'strong') {
      parts.push('Strong coalition alignment with minimal conflict.');
    } else if (dynamics.consensusLevel === 'fractured') {
      parts.push('Significant coalition conflicts require resolution.');
    } else {
      parts.push(`Moderate coalition consensus (${dynamics.consensusLevel}).`);
    }

    if (dynamics.opposition.length > 0) {
      parts.push(`${dynamics.opposition.length} coalition member(s) have reservations.`);
    }

    return parts.join(' ');
  }

  /**
   * Generate details.
   */
  private generateDetails(
    path: ExploredCareerPath,
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    dynamics: PathCoalitionAnalysis['dynamics']
  ): string {
    const parts: string[] = [];

    parts.push('Coalition Member Evaluations:');
    memberEvaluations.forEach((eval_, member) => {
      parts.push(`  ${member.replace('-', ' ')}: ${eval_.supportScore}/100 support`);
      if (eval_.concerns.length > 0) {
        parts.push(`    Concerns: ${eval_.concerns[0]}`);
      }
      if (eval_.endorsements.length > 0) {
        parts.push(`    Endorsements: ${eval_.endorsements[0]}`);
      }
    });

    parts.push('');
    parts.push(`Consensus Level: ${dynamics.consensusLevel}`);
    parts.push(`Strong Support: ${dynamics.strongSupport.length} members`);
    parts.push(`Reservations: ${dynamics.reservations.length} members`);
    parts.push(`Opposition: ${dynamics.opposition.length} members`);

    return parts.join('\n');
  }

  /**
   * Generate reasoning.
   */
  private generateReasoning(
    path: ExploredCareerPath,
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>,
    aggregate: PathCoalitionAnalysis['aggregate']
  ): string {
    const parts: string[] = [];

    parts.push(`Coalition stability score of ${aggregate.stabilityScore} reflects:`);

    if (aggregate.coalitionSupport > 70) {
      parts.push('- Strong overall support from coalition members');
    }

    if (aggregate.coalitionConflict < 30) {
      parts.push('- Low internal conflict within the coalition');
    }

    if (aggregate.tensionScore < 30) {
      parts.push('- Low tension between member priorities');
    }

    // Find highest and lowest supporting members
    const evals = Array.from(memberEvaluations.entries());
    const highest = evals.reduce((max, curr) => curr[1].supportScore > max[1].supportScore ? curr : max);
    const lowest = evals.reduce((min, curr) => curr[1].supportScore < min[1].supportScore ? curr : min);

    parts.push(`- Strongest support from ${highest[0].replace('-', ' ')} (${highest[1].supportScore}/100)`);
    parts.push(`- Most reservations from ${lowest[0].replace('-', ' ')} (${lowest[1].supportScore}/100)`);

    return parts.join('\n');
  }

  /**
   * Generate negotiation recommendations.
   */
  private generateNegotiations(
    dynamics: PathCoalitionAnalysis['dynamics']
  ): string[] {
    const recommendations: string[] = [];

    if (dynamics.opposition.length > 0) {
      recommendations.push(`Address concerns from ${dynamics.opposition.join(', ')}`);
    }

    if (dynamics.memberConflicts.length > 0) {
      recommendations.push('Facilitate discussion between conflicting coalition members');
    }

    if (dynamics.consensusLevel === 'fractured' || dynamics.consensusLevel === 'weak') {
      recommendations.push('Consider compromise paths that better balance priorities');
      recommendations.push('Explore phased approach to reduce immediate conflict');
    }

    if (recommendations.length === 0) {
      recommendations.push('Coalition is well-aligned; proceed with confidence');
    }

    return recommendations;
  }

  /**
   * Generate alternative considerations.
   */
  private generateAlternativeConsiderations(
    path: ExploredCareerPath,
    memberEvaluations: Map<CoalitionMember, CoalitionMemberEvaluation>
  ): string[] {
    const alternatives: string[] = [];

    // Find members with low support
    const lowSupport = Array.from(memberEvaluations.entries())
      .filter(([_, eval_]) => eval_.supportScore < 50);

    if (lowSupport.length > 0) {
      alternatives.push(`Consider paths with stronger ${lowSupport[0][0].replace('-', ' ')} alignment`);
    }

    if (path.scores.criticalityScore > 60) {
      alternatives.push('Explore paths with lower criticality for more flexibility');
    }

    if (path.risk.level === 'high' || path.risk.level === 'extreme') {
      alternatives.push('Consider lower-risk alternatives for coalition stability');
    }

    return alternatives;
  }

  // ============================================================================
  // OVERALL ANALYSIS
  // ============================================================================

  /**
   * Calculate overall coalition health.
   */
  private calculateCoalitionHealth(
    pathAnalyses: Map<string, PathCoalitionAnalysis>
  ): DecisionCoalitionAnalysis['coalitionHealth'] {
    const analyses = Array.from(pathAnalyses.values());

    if (analyses.length === 0) {
      return {
        cohesion: 0,
        conflictLevel: 0,
        clarity: 0,
        confidence: 0,
      };
    }

    // Cohesion - average stability across paths
    const cohesion = analyses.reduce((sum, a) => sum + a.aggregate.stabilityScore, 0) / analyses.length;

    // Conflict level - average conflict
    const conflictLevel = analyses.reduce((sum, a) => sum + a.aggregate.coalitionConflict, 0) / analyses.length;

    // Clarity - how clear is the best path
    const stabilityScores = analyses.map(a => a.aggregate.stabilityScore).sort((a, b) => b - a);
    const topDiff = stabilityScores.length > 1 ? stabilityScores[0] - stabilityScores[1] : 0;
    const clarity = Math.min(100, topDiff * 2 + 50);

    // Confidence based on data quality
    const confidence = 0.75;

    return {
      cohesion: Math.round(cohesion),
      conflictLevel: Math.round(conflictLevel),
      clarity: Math.round(clarity),
      confidence,
    };
  }

  /**
   * Compare two paths.
   */
  private comparePaths(
    pathA: PathCoalitionAnalysis,
    pathB: PathCoalitionAnalysis
  ): CoalitionPathComparison {
    const supportByMember = new Map<
      CoalitionMember,
      { pathA: number; pathB: number; difference: number }
    >();

    pathA.memberEvaluations.forEach((evalA, member) => {
      const evalB = pathB.memberEvaluations.get(member);
      if (evalB) {
        supportByMember.set(member, {
          pathA: evalA.supportScore,
          pathB: evalB.supportScore,
          difference: evalA.supportScore - evalB.supportScore,
        });
      }
    });

    return {
      pathA,
      pathB,
      strongerSupport: pathA.aggregate.coalitionSupport > pathB.aggregate.coalitionSupport ? 'pathA' : 'pathB',
      lowerConflict: pathA.aggregate.coalitionConflict < pathB.aggregate.coalitionConflict ? 'pathA' : 'pathB',
      higherStability: pathA.aggregate.stabilityScore > pathB.aggregate.stabilityScore ? 'pathA' : 'pathB',
      supportByMember,
      comparisonText: this.generatePathComparisonText(pathA, pathB),
      tradeoffs: this.identifyPathTradeoffs(pathA, pathB),
    };
  }

  /**
   * Generate path comparison text.
   */
  private generatePathComparisonText(pathA: PathCoalitionAnalysis, pathB: PathCoalitionAnalysis): string {
    const parts: string[] = [];

    if (pathA.aggregate.stabilityScore > pathB.aggregate.stabilityScore) {
      parts.push(`${pathA.pathName} has stronger coalition stability (${pathA.aggregate.stabilityScore} vs ${pathB.aggregate.stabilityScore}).`);
    } else {
      parts.push(`${pathB.pathName} has stronger coalition stability (${pathB.aggregate.stabilityScore} vs ${pathA.aggregate.stabilityScore}).`);
    }

    const aSupport = pathA.dynamics.strongSupport.length;
    const bSupport = pathB.dynamics.strongSupport.length;

    if (aSupport > bSupport) {
      parts.push(`${pathA.pathName} has more coalition members in strong support.`);
    } else if (bSupport > aSupport) {
      parts.push(`${pathB.pathName} has more coalition members in strong support.`);
    }

    return parts.join(' ');
  }

  /**
   * Identify tradeoffs between paths.
   */
  private identifyPathTradeoffs(pathA: PathCoalitionAnalysis, pathB: PathCoalitionAnalysis): string[] {
    const tradeoffs: string[] = [];

    pathA.memberEvaluations.forEach((evalA, member) => {
      const evalB = pathB.memberEvaluations.get(member);
      if (!evalB) return;

      const diff = Math.abs(evalA.supportScore - evalB.supportScore);
      if (diff > 30) {
        const favored = evalA.supportScore > evalB.supportScore ? pathA.pathName : pathB.pathName;
        tradeoffs.push(`${member.replace('-', ' ')} favors ${favored} (${diff} point difference)`);
      }
    });

    return tradeoffs.slice(0, 5);
  }

  /**
   * Generate overall recommendation.
   */
  private generateRecommendation(
    rankedPaths: PathCoalitionAnalysis[],
    coalitionHealth: DecisionCoalitionAnalysis['coalitionHealth']
  ): CoalitionRecommendation {
    if (rankedPaths.length === 0) {
      return {
        recommendedPathId: '',
        recommendedPathType: 'primary',
        confidence: 0,
        reasoning: 'No paths available for analysis',
        supportingMembers: [],
        opposingMembers: [],
        successConditions: [],
        riskMitigation: [],
      };
    }

    const topPath = rankedPaths[0];
    const supportingMembers = topPath.dynamics.strongSupport;
    const opposingMembers = topPath.dynamics.opposition;

    let reasoning: string;
    if (topPath.aggregate.stabilityScore >= 80) {
      reasoning = 'Strong coalition alignment makes this the clear recommendation';
    } else if (topPath.aggregate.stabilityScore >= 60) {
      reasoning = 'Moderate coalition support with manageable conflicts';
    } else {
      reasoning = 'Best available option despite coalition challenges';
    }

    return {
      recommendedPathId: topPath.pathId,
      recommendedPathType: topPath.pathType,
      confidence: coalitionHealth.confidence * (topPath.aggregate.stabilityScore / 100),
      reasoning,
      supportingMembers,
      opposingMembers,
      successConditions: this.generateSuccessConditions(topPath),
      riskMitigation: this.generateRiskMitigation(topPath),
    };
  }

  /**
   * Generate success conditions.
   */
  private generateSuccessConditions(path: PathCoalitionAnalysis): string[] {
    const conditions: string[] = [];

    if (path.dynamics.opposition.length > 0) {
      conditions.push(`Address concerns from ${path.dynamics.opposition.join(', ')}`);
    }

    if (path.aggregate.coalitionConflict > 30) {
      conditions.push('Resolve key coalition conflicts before proceeding');
    }

    conditions.push('Regular check-ins with all coalition stakeholders');

    return conditions;
  }

  /**
   * Generate risk mitigation strategies.
   */
  private generateRiskMitigation(path: PathCoalitionAnalysis): string[] {
    const strategies: string[] = [];

    if (path.dynamics.memberConflicts.length > 0) {
      strategies.push('Mediate between conflicting coalition members');
    }

    if (path.dynamics.opposition.includes('economic-reality')) {
      strategies.push('Build financial buffer to address economic concerns');
    }

    if (path.dynamics.opposition.includes('family-expectations')) {
      strategies.push('Regular family communication about progress and outcomes');
    }

    if (strategies.length === 0) {
      strategies.push('Maintain coalition alignment through ongoing communication');
    }

    return strategies;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Analyze decision coalition for career paths.
 */
export function analyzeDecisionCoalition(
  studentBelief: StudentBeliefV3,
  pathExplorerResult: CareerPathExplorerResult,
  optionalityResults?: Map<string, OptionalityAnalysis>,
  criticalityResults?: Map<string, CriticalityAnalysis>,
  options?: CoalitionAnalysisOptions
): DecisionCoalitionAnalysis {
  const engine = new DecisionCoalitionEngineV3(
    studentBelief,
    pathExplorerResult,
    optionalityResults,
    criticalityResults
  );
  return engine.analyze(options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  DecisionCoalitionAnalysis,
  PathCoalitionAnalysis,
  CoalitionMemberEvaluation,
  CoalitionMember,
  MemberConflict,
  CoalitionExplanation,
  CoalitionPathComparison,
  CoalitionRecommendation,
  CoalitionAnalysisOptions,
  CoalitionAnalysisId,
};
