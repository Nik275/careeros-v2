/**
 * CareerOS Regret Functional V2
 *
 * CareerOS - Career Intelligence System
 *
 * Purpose: Estimate future regret risk for career paths using deterministic,
 * explainable calculations derived from existing intelligence layers.
 *
 * Architecture Principles:
 *   - Intelligence-Derived: All regret calculations from existing engine outputs
 *   - Multi-Dimensional: 6 distinct regret types modeled
 *   - Deterministic: Same inputs always produce same outputs
 *   - Explainable: Clear reasoning for every regret factor
 *   - Path-Aware: Evaluates CareerPathExplorer results
 *   - Coalition-Aware: Considers stakeholder dynamics
 *   - Graph-Aware: Uses Career Transition Graph structure
 *
 * Regret Types:
 *   1. Regret of Action - Risk of choosing the wrong path
 *   2. Regret of Inaction - Risk of missing the right path
 *   3. Optionality Loss Regret - Risk of losing future options
 *   4. Identity Regret - Risk of misalignment with self
 *   5. Economic Regret - Risk of financial suboptimality
 *   6. Coalition Regret - Risk of stakeholder disappointment
 *
 * Example Output:
 *   "High identity regret risk (78/100) due to 45-point gap between 
 *    student values and path characteristics. Economic regret is 
 *    moderate (42/100) with stable income trajectory."
 */

import type { StudentBeliefV3 } from '../student-model';
import type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathScores,
  PathMetrics,
} from '../path-explorer';
import type { DecisionCoalitionAnalysis, PathCoalitionAnalysis } from '../decision-coalition-v3';
import type { CriticalityAnalysis } from '../criticality-engine';
import type { OptionalityAnalysis } from '../optionality-engine';
import type { CareerTransitionGraphV1, CareerNode } from '../career-transition-graph';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for regret analyses.
 */
export type RegretAnalysisId = string;

/**
 * The 6 types of regret modeled.
 */
export type RegretType =
  | 'action'
  | 'inaction'
  | 'optionality-loss'
  | 'identity'
  | 'economic'
  | 'coalition';

/**
 * Individual regret factor with detailed breakdown.
 */
export interface RegretFactor {
  /** Type of regret */
  type: RegretType;

  /** Regret score (0-100, higher = more regret risk) */
  score: number;

  /** Confidence in this assessment (0-1) */
  confidence: number;

  /** Contributing components to this regret */
  components: RegretComponent[];

  /** Primary drivers of this regret */
  drivers: string[];

  /** Mitigating factors */
  mitigations: string[];

  /** Whether this is the strongest regret factor */
  isStrongest: boolean;

  /** Risk level */
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
}

/**
 * Component contributing to a regret factor.
 */
export interface RegretComponent {
  /** Component name */
  name: string;

  /** Component description */
  description: string;

  /** Weight of this component (0-1) */
  weight: number;

  /** Raw score contribution (0-100) */
  contribution: number;

  /** Weighted contribution to final score */
  weightedContribution: number;

  /** Source intelligence layer */
  source: string;
}

/**
 * Complete regret analysis for a career path.
 */
export interface PathRegretAnalysis {
  /** Path being analyzed */
  pathId: string;
  pathName: string;

  /** Individual regret factors */
  factors: Map<RegretType, RegretFactor>;

  /** Aggregate scores */
  aggregate: {
    /** Overall regret score (0-100) */
    overallRegretScore: number;

    /** Weighted average of all regret factors */
    weightedRegretScore: number;

    /** Maximum regret across all types */
    maxRegretScore: number;

    /** Confidence in overall assessment (0-1) */
    overallConfidence: number;
  };

  /** Strongest regret risk */
  strongestRisk: {
    type: RegretType;
    score: number;
    description: string;
  };

  /** Risk distribution */
  riskDistribution: {
    minimal: number;
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };

  /** Explainability output */
  explanation: RegretExplanation;
}

/**
 * Explainability output for regret analysis.
 */
export interface RegretExplanation {
  /** One-line summary */
  summary: string;

  /** Detailed explanation */
  details: string;

  /** Why this regret profile exists */
  reasoning: string;

  /** Primary regret concerns */
  primaryConcerns: string[];

  /** Regret mitigation strategies */
  mitigationStrategies: string[];

  /** Comparison to alternative paths */
  comparativeContext: string;

  /** Long-term outlook */
  longTermOutlook: string;
}

/**
 * Complete Regret Functional analysis result.
 */
export interface RegretAnalysis {
  /** Unique identifier */
  id: RegretAnalysisId;

  /** Student belief used for analysis */
  studentBelief: StudentBeliefV3;

  /** Path explorer results analyzed */
  pathExplorerResult: CareerPathExplorerResult;

  /** Decision coalition analysis used */
  coalitionAnalysis?: DecisionCoalitionAnalysis;

  /** Analysis for each path */
  pathAnalyses: Map<string, PathRegretAnalysis>;

  /** Ranking of paths by regret (lowest first) */
  rankedPaths: PathRegretAnalysis[];

  /** Cross-path regret comparison */
  pathComparison: RegretPathComparison | null;

  /** Overall regret profile */
  overallProfile: {
    /** Average regret across all paths */
    averageRegret: number;

    /** Regret variance between paths */
    regretVariance: number;

    /** Most concerning regret type across all paths */
    dominantRegretType: RegretType | null;

    /** Overall risk assessment */
    overallRisk: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
  };

  /** Timestamp */
  generatedAt: number;
}

/**
 * Comparison between paths from regret perspective.
 */
export interface RegretPathComparison {
  /** Lowest regret path */
  lowestRegretPath: PathRegretAnalysis;

  /** Highest regret path */
  highestRegretPath: PathRegretAnalysis;

  /** Regret difference */
  regretDifference: number;

  /** Regret comparison by type */
  regretByType: Map<RegretType, { lowest: number; highest: number; difference: number }>;

  /** Human-readable comparison */
  comparisonText: string;

  /** Key tradeoffs */
  tradeoffs: string[];
}

/**
 * Options for regret analysis.
 */
export interface RegretAnalysisOptions {
  /** Weights for regret types (default: derived from context) */
  regretWeights?: Partial<Record<RegretType, number>>;

  /** Whether to include coalition analysis */
  includeCoalitionAnalysis?: boolean;

  /** Time horizon for regret assessment (years) */
  timeHorizon?: number;

  /** Analysis depth */
  depth?: 'surface' | 'moderate' | 'deep';
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_REGRET_WEIGHTS: Record<RegretType, number> = {
  'action': 0.20,
  'inaction': 0.15,
  'optionality-loss': 0.15,
  'identity': 0.20,
  'economic': 0.20,
  'coalition': 0.10,
};

// ============================================================================
// REGRET FUNCTIONAL V2
// ============================================================================

export class RegretFunctionalV2 {
  private studentBelief: StudentBeliefV3;
  private pathExplorerResult: CareerPathExplorerResult;
  private coalitionAnalysis?: DecisionCoalitionAnalysis;
  private graph: CareerTransitionGraphV1;

  constructor(
    studentBelief: StudentBeliefV3,
    pathExplorerResult: CareerPathExplorerResult,
    graph: CareerTransitionGraphV1,
    coalitionAnalysis?: DecisionCoalitionAnalysis
  ) {
    this.studentBelief = studentBelief;
    this.pathExplorerResult = pathExplorerResult;
    this.coalitionAnalysis = coalitionAnalysis;
    this.graph = graph;
  }

  /**
   * Analyze regret for all paths.
   */
  analyze(options: RegretAnalysisOptions = {}): RegretAnalysis {
    const regretWeights = { ...DEFAULT_REGRET_WEIGHTS, ...options.regretWeights };
    const timeHorizon = options.timeHorizon ?? 10;

    // Analyze each path
    const pathAnalyses = new Map<string, PathRegretAnalysis>();

    for (const path of this.pathExplorerResult.paths) {
      // Get coalition analysis for this path if available
      const pathCoalitionAnalysis = this.coalitionAnalysis?.pathAnalyses.get(path.id);

      const analysis = this.analyzePathRegret(
        path,
        pathCoalitionAnalysis,
        regretWeights,
        timeHorizon
      );
      pathAnalyses.set(path.id, analysis);
    }

    // Rank paths by regret (lowest first = best)
    const rankedPaths = Array.from(pathAnalyses.values()).sort(
      (a, b) => a.aggregate.overallRegretScore - b.aggregate.overallRegretScore
    );

    // Calculate overall profile
    const overallProfile = this.calculateOverallProfile(pathAnalyses);

    // Compare paths
    const pathComparison =
      rankedPaths.length >= 2
        ? this.comparePaths(rankedPaths[0], rankedPaths[rankedPaths.length - 1])
        : null;

    return {
      id: `regret-${this.studentBelief.studentId}-${Date.now()}`,
      studentBelief: this.studentBelief,
      pathExplorerResult: this.pathExplorerResult,
      coalitionAnalysis: this.coalitionAnalysis,
      pathAnalyses,
      rankedPaths,
      pathComparison,
      overallProfile,
      generatedAt: Date.now(),
    };
  }

  /**
   * Analyze regret for a single path.
   */
  private analyzePathRegret(
    path: ExploredCareerPath,
    pathCoalitionAnalysis: PathCoalitionAnalysis | undefined,
    regretWeights: Record<RegretType, number>,
    timeHorizon: number
  ): PathRegretAnalysis {
    // Calculate each regret factor
    const factors = new Map<RegretType, RegretFactor>();

    factors.set('action', this.calculateActionRegret(path, timeHorizon));
    factors.set('inaction', this.calculateInactionRegret(path, timeHorizon));
    factors.set('optionality-loss', this.calculateOptionalityLossRegret(path));
    factors.set('identity', this.calculateIdentityRegret(path));
    factors.set('economic', this.calculateEconomicRegret(path, timeHorizon));
    factors.set('coalition', this.calculateCoalitionRegret(path, pathCoalitionAnalysis));

    // Calculate aggregate scores
    const aggregate = this.calculateAggregateScores(factors, regretWeights);

    // Find strongest risk and mark it
    const strongestRisk = this.findStrongestRisk(factors);

    // Mark the strongest factor
    factors.forEach(factor => {
      factor.isStrongest = factor.type === strongestRisk.type;
    });

    // Calculate risk distribution
    const riskDistribution = this.calculateRiskDistribution(factors);

    // Generate explanation
    const explanation = this.generateExplanation(path, factors, strongestRisk, aggregate);

    return {
      pathId: path.id,
      pathName: path.name,
      factors,
      aggregate,
      strongestRisk,
      riskDistribution,
      explanation,
    };
  }

  // ============================================================================
  // REGRET CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate Regret of Action.
   * Risk of choosing this path and it being wrong.
   */
  private calculateActionRegret(path: ExploredCareerPath, timeHorizon: number): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // Component 1: Path success probability
    // Lower success probability = higher regret risk
    const successProb = path.metrics.cumulativeSuccessProbability;
    const successRisk = (1 - successProb) * 100;
    components.push({
      name: 'Success Probability Risk',
      description: 'Risk of failing to complete path successfully',
      weight: 0.30,
      contribution: successRisk,
      weightedContribution: successRisk * 0.30,
      source: 'PathExplorer.metrics.cumulativeSuccessProbability',
    });

    if (successProb < 0.5) {
      drivers.push(`Low success probability (${Math.round(successProb * 100)}%)`);
    } else {
      mitigations.push(`Strong success probability (${Math.round(successProb * 100)}%)`);
    }

    // Component 2: Path criticality
    // Higher criticality = higher regret if wrong
    const criticalityScore = path.scores.criticalityScore;
    const criticalityRisk = criticalityScore;
    components.push({
      name: 'Path Criticality',
      description: 'How constraining this path is if chosen',
      weight: 0.25,
      contribution: criticalityRisk,
      weightedContribution: criticalityRisk * 0.25,
      source: 'CriticalityEngine.criticalityScore',
    });

    if (criticalityScore > 60) {
      drivers.push(`High path criticality (${criticalityScore}/100)`);
    } else if (criticalityScore < 40) {
      mitigations.push(`Low path criticality allows pivots`);
    }

    // Component 3: Time investment
    // Longer paths = more sunk cost if wrong
    const timeInvestment = Math.min(100, (path.metrics.totalYears / timeHorizon) * 100);
    const timeRisk = timeInvestment;
    components.push({
      name: 'Time Investment Risk',
      description: 'Years invested that could be lost',
      weight: 0.25,
      contribution: timeRisk,
      weightedContribution: timeRisk * 0.25,
      source: 'PathExplorer.metrics.totalYears',
    });

    if (path.metrics.totalYears > 8) {
      drivers.push(`Long time commitment (${path.metrics.totalYears} years)`);
    } else if (path.metrics.totalYears < 4) {
      mitigations.push(`Short time commitment reduces sunk cost`);
    }

    // Component 4: Reversibility
    // Lower reversibility = higher regret if wrong
    const reversibilityRisk = (1 - path.metrics.minReversibility) * 100;
    components.push({
      name: 'Irreversibility Risk',
      description: 'Difficulty of reversing course',
      weight: 0.20,
      contribution: reversibilityRisk,
      weightedContribution: reversibilityRisk * 0.20,
      source: 'PathExplorer.metrics.minReversibility',
    });

    if (path.metrics.minReversibility < 0.3) {
      drivers.push('Low reversibility makes exit difficult');
    } else if (path.metrics.minReversibility > 0.6) {
      mitigations.push('High reversibility allows course correction');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'action',
      score,
      confidence: 0.80,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  /**
   * Calculate Regret of Inaction.
   * Risk of missing better alternative paths.
   */
  private calculateInactionRegret(path: ExploredCareerPath, timeHorizon: number): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // Component 1: Alternative opportunity cost
    // Compare to other paths in explorer
    const otherPaths = this.pathExplorerResult.paths.filter(p => p.id !== path.id);

    let maxAlternativeScore = 0;
    if (otherPaths.length > 0) {
      maxAlternativeScore = Math.max(...otherPaths.map(p => p.scores.compositeScore));
    }

    const opportunityGap = Math.max(0, maxAlternativeScore - path.scores.compositeScore);
    const opportunityRisk = Math.min(100, opportunityGap * 2);

    components.push({
      name: 'Alternative Opportunity Gap',
      description: 'How much better other paths might be',
      weight: 0.35,
      contribution: opportunityRisk,
      weightedContribution: opportunityRisk * 0.35,
      source: 'PathExplorer.scores.compositeScore comparison',
    });

    if (opportunityGap > 20) {
      drivers.push(`Better alternatives available (${Math.round(opportunityGap)} point gap)`);
    } else if (opportunityGap < 10) {
      mitigations.push('This path is competitive with alternatives');
    }

    // Component 2: Student-path fit gap
    // Lower fit = higher regret of not finding better fit
    const studentInterests = this.studentBelief.interests?.coreInterests || [];
    const pathMatch = this.calculatePathInterestMatch(path, studentInterests);
    const fitRisk = (1 - pathMatch) * 100;

    components.push({
      name: 'Interest Fit Gap',
      description: 'Mismatch between student interests and path',
      weight: 0.30,
      contribution: fitRisk,
      weightedContribution: fitRisk * 0.30,
      source: 'StudentBelief.interests vs path characteristics',
    });

    if (pathMatch < 0.4) {
      drivers.push('Poor alignment with student interests');
    } else if (pathMatch > 0.7) {
      mitigations.push('Strong alignment with student interests');
    }

    // Component 3: Time sensitivity
    // Some opportunities are time-bound
    const age = this.studentBelief.profile?.age || 20;
    const timeSensitiveRisk = age > 28 ? Math.min(100, (age - 28) * 5) : 0;

    components.push({
      name: 'Time Sensitivity',
      description: 'Age-based opportunity window constraints',
      weight: 0.20,
      contribution: timeSensitiveRisk,
      weightedContribution: timeSensitiveRisk * 0.20,
      source: 'StudentBelief.profile.age',
    });

    if (age > 30) {
      drivers.push('Age reduces window for certain transitions');
    } else if (age < 25) {
      mitigations.push('Young age provides time to pivot if needed');
    }

    // Component 4: Optionality preservation
    // Lower optionality = higher regret of not keeping options open
    const optionalityRisk = (100 - path.scores.optionalityScore) * 0.5;

    components.push({
      name: 'Optionality Cost',
      description: 'Future options foregone by this choice',
      weight: 0.15,
      contribution: optionalityRisk,
      weightedContribution: optionalityRisk * 0.15,
      source: 'OptionalityEngine.optionalityScore',
    });

    if (path.scores.optionalityScore < 40) {
      drivers.push('Low optionality limits future pivots');
    } else if (path.scores.optionalityScore > 70) {
      mitigations.push('High optionality preserves future choices');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'inaction',
      score,
      confidence: 0.75,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  /**
   * Calculate Optionality Loss Regret.
   * Risk of losing future career options.
   */
  private calculateOptionalityLossRegret(path: ExploredCareerPath): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // Component 1: Criticality-based optionality loss
    // Direct from criticality score
    const criticalityBasedLoss = path.scores.criticalityScore;

    components.push({
      name: 'Criticality-Based Optionality Loss',
      description: 'Future options constrained by path criticality',
      weight: 0.40,
      contribution: criticalityBasedLoss,
      weightedContribution: criticalityBasedLoss * 0.40,
      source: 'CriticalityEngine.criticalityScore',
    });

    if (path.scores.criticalityScore > 60) {
      drivers.push(`High criticality (${path.scores.criticalityScore}/100) constrains future`);
    } else if (path.scores.criticalityScore < 40) {
      mitigations.push(`Low criticality (${path.scores.criticalityScore}/100) preserves options`);
    }

    // Component 2: Terminal position risk
    // Terminal nodes have fewer exits
    const lastNode = path.nodes[path.nodes.length - 1];
    const terminalRisk = lastNode?.isTerminal ? 70 : 20;

    components.push({
      name: 'Terminal Position Risk',
      description: 'Limited exits from terminal career positions',
      weight: 0.25,
      contribution: terminalRisk,
      weightedContribution: terminalRisk * 0.25,
      source: 'CareerNode.isTerminal',
    });

    if (lastNode?.isTerminal) {
      drivers.push('Terminal position limits future transitions');
    } else {
      mitigations.push('Non-terminal position allows continued growth');
    }

    // Component 3: Reachable career count
    // How many careers can still be reached from this path (safely handle missing nodes)
    let reachableCareers: { node: { id: string } }[] = [];
    try {
      reachableCareers = this.graph.getReachableCareers(lastNode?.id || '', { maxDepth: 3 });
    } catch {
      // Node not in graph, treat as zero reachability
      reachableCareers = [];
    }
    const totalCareers = this.graph.getAllNodes().length;
    const reachabilityRatio = totalCareers > 0 ? reachableCareers.length / totalCareers : 0.5;
    const reachabilityRisk = (1 - reachabilityRatio) * 100;

    components.push({
      name: 'Future Reachability',
      description: 'Percentage of careers still accessible',
      weight: 0.20,
      contribution: reachabilityRisk,
      weightedContribution: reachabilityRisk * 0.20,
      source: 'CareerTransitionGraph.getReachableCareers',
    });

    if (reachableCareers.length < 10) {
      drivers.push(`Limited future reachability (${reachableCareers.length} careers)`);
    } else if (reachableCareers.length > 30) {
      mitigations.push(`Broad future reachability (${reachableCareers.length} careers)`);
    }

    // Component 4: Flexibility score
    const flexibilityRisk = (100 - path.scores.flexibilityScore) * 0.6;

    components.push({
      name: 'Path Flexibility',
      description: 'Ease of future pivots',
      weight: 0.15,
      contribution: flexibilityRisk,
      weightedContribution: flexibilityRisk * 0.15,
      source: 'PathExplorer.scores.flexibilityScore',
    });

    if (path.scores.flexibilityScore < 50) {
      drivers.push('Low flexibility makes pivots difficult');
    } else if (path.scores.flexibilityScore > 75) {
      mitigations.push('High flexibility enables easy pivots');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'optionality-loss',
      score,
      confidence: 0.85,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  /**
   * Calculate Identity Regret.
   * Risk of not being true to oneself.
   */
  private calculateIdentityRegret(path: ExploredCareerPath): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // Component 1: Values alignment gap
    const studentValues = this.studentBelief.values?.coreValues || [];
    const valueAlignment = this.calculatePathValueAlignment(path, studentValues);
    const valueGap = (1 - valueAlignment) * 100;

    components.push({
      name: 'Values Alignment Gap',
      description: 'Mismatch between student values and path',
      weight: 0.35,
      contribution: valueGap,
      weightedContribution: valueGap * 0.35,
      source: 'StudentBelief.values vs path characteristics',
    });

    if (valueAlignment < 0.4) {
      drivers.push('Poor alignment with core values');
    } else if (valueAlignment > 0.75) {
      mitigations.push('Strong alignment with core values');
    }

    // Component 2: Interest alignment gap
    const studentInterests = this.studentBelief.interests?.coreInterests || [];
    const interestAlignment = this.calculatePathInterestMatch(path, studentInterests);
    const interestGap = (1 - interestAlignment) * 100;

    components.push({
      name: 'Interest Alignment Gap',
      description: 'Mismatch between student interests and path',
      weight: 0.30,
      contribution: interestGap,
      weightedContribution: interestGap * 0.30,
      source: 'StudentBelief.interests vs path characteristics',
    });

    if (interestAlignment < 0.4) {
      drivers.push('Poor alignment with core interests');
    } else if (interestAlignment > 0.75) {
      mitigations.push('Strong alignment with core interests');
    }

    // Component 3: Psychological profile fit
    const profileFit = this.calculateProfileFit(path);
    const profileGap = (1 - profileFit) * 100;

    components.push({
      name: 'Psychological Profile Fit',
      description: 'Mismatch between personality and path requirements',
      weight: 0.20,
      contribution: profileGap,
      weightedContribution: profileGap * 0.20,
      source: 'StudentBelief.profile vs CareerNode.requiredProfile',
    });

    if (profileFit < 0.5) {
      drivers.push('Personality mismatch with path demands');
    } else if (profileFit > 0.75) {
      mitigations.push('Strong personality-path fit');
    }

    // Component 4: Authenticity risk
    // High growth but low fit = authenticity sacrifice
    const authenticityRisk = path.scores.growthScore > 70 && interestAlignment < 0.5 ? 60 : 20;

    components.push({
      name: 'Authenticity Sacrifice Risk',
      description: 'Risk of sacrificing identity for growth',
      weight: 0.15,
      contribution: authenticityRisk,
      weightedContribution: authenticityRisk * 0.15,
      source: 'PathExplorer.scores.growthScore vs interest alignment',
    });

    if (path.scores.growthScore > 70 && interestAlignment < 0.5) {
      drivers.push('High growth potential but poor interest fit risks authenticity');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'identity',
      score,
      confidence: 0.70,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  /**
   * Calculate Economic Regret.
   * Risk of financial suboptimality.
   */
  private calculateEconomicRegret(path: ExploredCareerPath, timeHorizon: number): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // Component 1: Income opportunity cost
    const otherPaths = this.pathExplorerResult.paths.filter(p => p.id !== path.id);
    let maxIncome = path.metrics.incomeRange.senior;

    if (otherPaths.length > 0) {
      maxIncome = Math.max(...otherPaths.map(p => p.metrics.incomeRange.senior));
    }

    const incomeGap = Math.max(0, maxIncome - path.metrics.incomeRange.senior);
    const incomeRisk = Math.min(100, (incomeGap / 2000000) * 100);

    components.push({
      name: 'Income Opportunity Cost',
      description: 'Potential income foregone vs best alternative',
      weight: 0.30,
      contribution: incomeRisk,
      weightedContribution: incomeRisk * 0.30,
      source: 'PathExplorer.metrics.incomeRange comparison',
    });

    if (incomeGap > 1000000) {
      drivers.push(`Large income gap (₹${Math.round(incomeGap / 100000)}L) vs alternatives`);
    } else if (incomeGap < 300000) {
      mitigations.push('Income competitive with alternatives');
    }

    // Component 2: Time to income
    const timeToIncome = path.metrics.totalYears;
    const timeToIncomeRisk = Math.min(100, (timeToIncome / 8) * 50);

    components.push({
      name: 'Time to Earning',
      description: 'Years before meaningful income',
      weight: 0.25,
      contribution: timeToIncomeRisk,
      weightedContribution: timeToIncomeRisk * 0.25,
      source: 'PathExplorer.metrics.totalYears',
    });

    if (timeToIncome > 6) {
      drivers.push(`Extended time to income (${timeToIncome} years)`);
    } else if (timeToIncome < 3) {
      mitigations.push('Quick path to earning');
    }

    // Component 3: Income growth rate
    const growthRate = path.metrics.incomeRange.growthRate;
    const growthRisk = growthRate < 50 ? 60 : growthRate < 100 ? 30 : 10;

    components.push({
      name: 'Income Growth Trajectory',
      description: 'Long-term income growth potential',
      weight: 0.25,
      contribution: growthRisk,
      weightedContribution: growthRisk * 0.25,
      source: 'PathExplorer.metrics.incomeRange.growthRate',
    });

    if (growthRate < 50) {
      drivers.push('Poor income growth trajectory');
    } else if (growthRate > 150) {
      mitigations.push('Strong income growth potential');
    }

    // Component 4: Financial risk (failure cost)
    const failureCost = (1 - path.metrics.cumulativeSuccessProbability) * path.metrics.totalYears * 10;
    const failureRisk = Math.min(100, failureCost);

    components.push({
      name: 'Failure Cost Risk',
      description: 'Financial cost of path failure',
      weight: 0.20,
      contribution: failureRisk,
      weightedContribution: failureRisk * 0.20,
      source: 'PathExplorer.metrics.cumulativeSuccessProbability',
    });

    if (path.metrics.cumulativeSuccessProbability < 0.5) {
      drivers.push('High risk of failure with significant sunk cost');
    } else if (path.metrics.cumulativeSuccessProbability > 0.8) {
      mitigations.push('High success probability protects investment');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'economic',
      score,
      confidence: 0.80,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  /**
   * Calculate Coalition Regret.
   * Risk of disappointing stakeholders.
   */
  private calculateCoalitionRegret(
    path: ExploredCareerPath,
    pathCoalitionAnalysis: PathCoalitionAnalysis | undefined
  ): RegretFactor {
    const components: RegretComponent[] = [];
    const drivers: string[] = [];
    const mitigations: string[] = [];

    // If we have coalition analysis, use it directly
    if (pathCoalitionAnalysis) {
      // Component 1: Coalition opposition
      const oppositionCount = pathCoalitionAnalysis.dynamics.opposition.length;
      const oppositionRisk = Math.min(100, oppositionCount * 20);

      components.push({
        name: 'Coalition Opposition',
        description: 'Stakeholders actively opposed to this path',
        weight: 0.40,
        contribution: oppositionRisk,
        weightedContribution: oppositionRisk * 0.40,
        source: 'DecisionCoalitionAnalysis.dynamics.opposition',
      });

      if (oppositionCount > 0) {
        drivers.push(`${oppositionCount} coalition member(s) opposed to path`);
      } else {
        mitigations.push('No coalition opposition');
      }

      // Component 2: Coalition stability
      const stabilityRisk = (100 - pathCoalitionAnalysis.aggregate.stabilityScore) * 0.6;

      components.push({
        name: 'Coalition Instability',
        description: 'Risk of coalition breakdown over path choice',
        weight: 0.35,
        contribution: stabilityRisk,
        weightedContribution: stabilityRisk * 0.35,
        source: 'DecisionCoalitionAnalysis.aggregate.stabilityScore',
      });

      if (pathCoalitionAnalysis.aggregate.stabilityScore < 50) {
        drivers.push('Low coalition stability risks relationship strain');
      } else if (pathCoalitionAnalysis.aggregate.stabilityScore > 75) {
        mitigations.push('Strong coalition support for path');
      }

      // Component 3: Conflict severity
      const hasSevereConflicts = pathCoalitionAnalysis.dynamics.memberConflicts.some(
        c => c.severity > 60
      );
      const conflictRisk = hasSevereConflicts ? 70 : 20;

      components.push({
        name: 'Severe Coalition Conflicts',
        description: 'High-severity conflicts between stakeholders',
        weight: 0.25,
        contribution: conflictRisk,
        weightedContribution: conflictRisk * 0.25,
        source: 'DecisionCoalitionAnalysis.dynamics.memberConflicts',
      });

      if (hasSevereConflicts) {
        drivers.push('Severe conflicts between coalition members');
      } else {
        mitigations.push('Manageable coalition conflicts');
      }
    } else {
      // Fallback if no coalition analysis available
      components.push({
        name: 'Coalition Analysis Unavailable',
        description: 'No coalition data to assess stakeholder impact',
        weight: 1.0,
        contribution: 50,
        weightedContribution: 50,
        source: 'Fallback - no coalition analysis provided',
      });

      drivers.push('Coalition analysis unavailable - stakeholder impact unclear');
    }

    // Calculate final score
    const score = Math.round(
      components.reduce((sum, c) => sum + c.weightedContribution, 0)
    );

    return {
      type: 'coalition',
      score,
      confidence: pathCoalitionAnalysis ? 0.75 : 0.40,
      components,
      drivers,
      mitigations,
      isStrongest: false,
      riskLevel: this.scoreToRiskLevel(score),
    };
  }

  // ============================================================================
  // UTILITY CALCULATIONS
  // ============================================================================

  /**
   * Calculate path interest match.
   */
  private calculatePathInterestMatch(path: ExploredCareerPath, interests: string[]): number {
    if (interests.length === 0) return 0.5;

    const pathKeywords = path.nodes.map(n => [n.name.toLowerCase(), n.category.toLowerCase()]).flat();

    const matches = interests.filter(interest =>
      pathKeywords.some(keyword => keyword.includes(interest.toLowerCase()))
    ).length;

    return Math.min(1, matches / Math.max(1, interests.length * 0.5));
  }

  /**
   * Calculate path value alignment.
   */
  private calculatePathValueAlignment(path: ExploredCareerPath, values: string[]): number {
    if (values.length === 0) return 0.5;

    let alignment = 0.5;

    // Check value-path fit
    if (values.includes('stability') && path.scores.stabilityScore > 70) {
      alignment += 0.2;
    }
    if (values.includes('growth') && path.scores.growthScore > 70) {
      alignment += 0.2;
    }
    if (values.includes('flexibility') && path.scores.flexibilityScore > 70) {
      alignment += 0.2;
    }
    if (values.includes('impact') && path.nodes.some(n => n.metadata?.growthOutlook || 0 > 0.7)) {
      alignment += 0.15;
    }

    return Math.min(1, alignment);
  }

  /**
   * Calculate psychological profile fit.
   */
  private calculateProfileFit(path: ExploredCareerPath): number {
    const studentProfile = this.studentBelief.profile;
    if (!studentProfile || path.nodes.length === 0) return 0.5;

    const lastNode = path.nodes[path.nodes.length - 1];
    const requiredProfile = lastNode.requiredProfile;

    if (!requiredProfile) return 0.5;

    // Calculate fit across key dimensions
    const dimensions: Array<keyof typeof studentProfile> = [
      'analyticalThinking',
      'creativity',
      'socialOrientation',
      'leadership',
      'detailOrientation',
      'riskTolerance',
    ];

    const fits = dimensions.map(dim => {
      const studentVal = studentProfile[dim] || 0.5;
      const requiredVal = requiredProfile[dim] || 0.5;
      return 1 - Math.abs(studentVal - requiredVal);
    });

    return fits.reduce((sum, f) => sum + f, 0) / fits.length;
  }

  /**
   * Convert score to risk level.
   */
  private scoreToRiskLevel(score: number): RegretFactor['riskLevel'] {
    if (score < 20) return 'minimal';
    if (score < 40) return 'low';
    if (score < 60) return 'moderate';
    if (score < 80) return 'high';
    return 'severe';
  }

  /**
   * Calculate aggregate scores.
   */
  private calculateAggregateScores(
    factors: Map<RegretType, RegretFactor>,
    weights: Record<RegretType, number>
  ): PathRegretAnalysis['aggregate'] {
    const factorArray = Array.from(factors.values());

    // Overall regret (weighted average)
    const weightedSum = factorArray.reduce(
      (sum, f) => sum + f.score * weights[f.type],
      0
    );
    const weightSum = factorArray.reduce((sum, f) => sum + weights[f.type], 0);
    const weightedRegretScore = Math.round(weightedSum / weightSum);

    // Simple average
    const overallRegretScore = Math.round(
      factorArray.reduce((sum, f) => sum + f.score, 0) / factorArray.length
    );

    // Maximum regret
    const maxRegretScore = Math.max(...factorArray.map(f => f.score));

    // Confidence (average of component confidences)
    const overallConfidence = Math.round(
      factorArray.reduce((sum, f) => sum + f.confidence, 0) / factorArray.length * 100
    ) / 100;

    return {
      overallRegretScore,
      weightedRegretScore,
      maxRegretScore,
      overallConfidence,
    };
  }

  /**
   * Find the strongest regret risk.
   */
  private findStrongestRisk(factors: Map<RegretType, RegretFactor>): PathRegretAnalysis['strongestRisk'] {
    const factorArray = Array.from(factors.values());
    const strongest = factorArray.reduce((max, current) =>
      current.score > max.score ? current : max
    );

    return {
      type: strongest.type,
      score: strongest.score,
      description: this.getStrongestRiskDescription(strongest),
    };
  }

  /**
   * Get description for strongest risk.
   */
  private getStrongestRiskDescription(factor: RegretFactor): string {
    const typeDescriptions: Record<RegretType, string> = {
      'action': `High risk that choosing this path will be the wrong decision (${factor.score}/100)`,
      'inaction': `High risk of missing better alternatives (${factor.score}/100)`,
      'optionality-loss': `High risk of losing future career options (${factor.score}/100)`,
      'identity': `High risk of misalignment with your true self (${factor.score}/100)`,
      'economic': `High risk of financial suboptimality (${factor.score}/100)`,
      'coalition': `High risk of stakeholder disappointment (${factor.score}/100)`,
    };

    return typeDescriptions[factor.type];
  }

  /**
   * Calculate risk distribution.
   */
  private calculateRiskDistribution(factors: Map<RegretType, RegretFactor>): PathRegretAnalysis['riskDistribution'] {
    const distribution: PathRegretAnalysis['riskDistribution'] = {
      minimal: 0,
      low: 0,
      moderate: 0,
      high: 0,
      severe: 0,
    };

    factors.forEach(factor => {
      distribution[factor.riskLevel]++;
    });

    return distribution;
  }

  // ============================================================================
  // EXPLANATION GENERATION
  // ============================================================================

  /**
   * Generate regret explanation.
   */
  private generateExplanation(
    path: ExploredCareerPath,
    factors: Map<RegretType, RegretFactor>,
    strongestRisk: PathRegretAnalysis['strongestRisk'],
    aggregate: PathRegretAnalysis['aggregate']
  ): RegretExplanation {
    const summary = this.generateSummary(path, strongestRisk, aggregate);
    const details = this.generateDetails(path, factors);
    const reasoning = this.generateReasoning(factors, aggregate);
    const primaryConcerns = this.generatePrimaryConcerns(factors);
    const mitigationStrategies = this.generateMitigationStrategies(factors);
    const comparativeContext = this.generateComparativeContext(path, aggregate);
    const longTermOutlook = this.generateLongTermOutlook(strongestRisk, aggregate);

    return {
      summary,
      details,
      reasoning,
      primaryConcerns,
      mitigationStrategies,
      comparativeContext,
      longTermOutlook,
    };
  }

  /**
   * Generate summary.
   */
  private generateSummary(
    path: ExploredCareerPath,
    strongestRisk: PathRegretAnalysis['strongestRisk'],
    aggregate: PathRegretAnalysis['aggregate']
  ): string {
    return `${path.name} has overall regret risk of ${aggregate.overallRegretScore}/100. ` +
      `Strongest concern: ${strongestRisk.description}. ` +
      `Confidence in assessment: ${Math.round(aggregate.overallConfidence * 100)}%.`;
  }

  /**
   * Generate details.
   */
  private generateDetails(path: ExploredCareerPath, factors: Map<RegretType, RegretFactor>): string {
    const parts: string[] = [];
    parts.push(`Regret Analysis for ${path.name}:`);
    parts.push('');

    factors.forEach((factor, type) => {
      parts.push(`${type.toUpperCase()} REGRET: ${factor.score}/100 (${factor.riskLevel})`);
      parts.push(`  Drivers: ${factor.drivers.slice(0, 2).join(', ') || 'None'}`);
      parts.push(`  Mitigations: ${factor.mitigations.slice(0, 2).join(', ') || 'None'}`);
      parts.push('');
    });

    return parts.join('\n');
  }

  /**
   * Generate reasoning.
   */
  private generateReasoning(factors: Map<RegretType, RegretFactor>, aggregate: PathRegretAnalysis['aggregate']): string {
    const parts: string[] = [];
    parts.push(`Overall regret score of ${aggregate.overallRegretScore} reflects:`);

    factors.forEach((factor, type) => {
      parts.push(`- ${type}: ${factor.score}/100 (${factor.riskLevel} risk)`);
    });

    parts.push('');
    parts.push(`Assessment confidence: ${Math.round(aggregate.overallConfidence * 100)}%`);

    return parts.join('\n');
  }

  /**
   * Generate primary concerns.
   */
  private generatePrimaryConcerns(factors: Map<RegretType, RegretFactor>): string[] {
    const concerns: string[] = [];

    factors.forEach(factor => {
      if (factor.score > 50) {
        concerns.push(`${factor.type} regret: ${factor.drivers[0] || 'Elevated risk'}`);
      }
    });

    if (concerns.length === 0) {
      concerns.push('No major regret risks identified');
    }

    return concerns.slice(0, 3);
  }

  /**
   * Generate mitigation strategies.
   */
  private generateMitigationStrategies(factors: Map<RegretType, RegretFactor>): string[] {
    const strategies: string[] = [];

    factors.forEach(factor => {
      if (factor.mitigations.length > 0) {
        strategies.push(`${factor.type}: ${factor.mitigations[0]}`);
      }
    });

    if (strategies.length === 0) {
      strategies.push('Regular self-assessment to catch regret early');
    }

    return strategies.slice(0, 4);
  }

  /**
   * Generate comparative context.
   */
  private generateComparativeContext(path: ExploredCareerPath, aggregate: PathRegretAnalysis['aggregate']): string {
    const otherPaths = this.pathExplorerResult.paths.filter(p => p.id !== path.id);

    if (otherPaths.length === 0) {
      return 'No alternative paths available for comparison';
    }

    const avgOtherScore = otherPaths.reduce((sum, p) => sum + p.scores.compositeScore, 0) / otherPaths.length;
    const pathScore = path.scores.compositeScore;

    if (pathScore > avgOtherScore + 10) {
      return `This path scores ${Math.round(pathScore - avgOtherScore)} points higher than alternatives`;
    } else if (pathScore < avgOtherScore - 10) {
      return `This path scores ${Math.round(avgOtherScore - pathScore)} points lower than alternatives`;
    } else {
      return 'This path is competitive with alternatives';
    }
  }

  /**
   * Generate long-term outlook.
   */
  private generateLongTermOutlook(
    strongestRisk: PathRegretAnalysis['strongestRisk'],
    aggregate: PathRegretAnalysis['aggregate']
  ): string {
    if (aggregate.overallRegretScore < 30) {
      return 'Long-term outlook favorable - minimal regret risk';
    } else if (aggregate.overallRegretScore < 50) {
      return 'Manageable regret risk with proper attention';
    } else if (aggregate.overallRegretScore < 70) {
      return `Elevated regret risk - monitor ${strongestRisk.type} regret closely`;
    } else {
      return `High regret risk - reconsider ${strongestRisk.type} factors before proceeding`;
    }
  }

  // ============================================================================
  // OVERALL ANALYSIS
  // ============================================================================

  /**
   * Calculate overall profile.
   */
  private calculateOverallProfile(
    pathAnalyses: Map<string, PathRegretAnalysis>
  ): RegretAnalysis['overallProfile'] {
    const analyses = Array.from(pathAnalyses.values());

    if (analyses.length === 0) {
      return {
        averageRegret: 0,
        regretVariance: 0,
        dominantRegretType: null,
        overallRisk: 'minimal',
      };
    }

    // Average regret
    const averageRegret = analyses.reduce((sum, a) => sum + a.aggregate.overallRegretScore, 0) / analyses.length;

    // Variance
    const variance = analyses.reduce((sum, a) => {
      const diff = a.aggregate.overallRegretScore - averageRegret;
      return sum + diff * diff;
    }, 0) / analyses.length;

    // Dominant regret type
    const typeScores: Record<RegretType, number> = {
      'action': 0, 'inaction': 0, 'optionality-loss': 0,
      'identity': 0, 'economic': 0, 'coalition': 0,
    };

    analyses.forEach(a => {
      a.factors.forEach((factor, type) => {
        typeScores[type] += factor.score;
      });
    });

    const dominantRegretType = Object.entries(typeScores).reduce((max, [type, score]) =>
      score > max.score ? { type: type as RegretType, score } : max,
      { type: 'action' as RegretType, score: 0 }
    ).type;

    // Overall risk
    const overallRisk = this.scoreToRiskLevel(averageRegret);

    return {
      averageRegret: Math.round(averageRegret),
      regretVariance: Math.round(variance),
      dominantRegretType,
      overallRisk,
    };
  }

  /**
   * Compare paths.
   */
  private comparePaths(
    lowestRegret: PathRegretAnalysis,
    highestRegret: PathRegretAnalysis
  ): RegretPathComparison {
    const regretByType = new Map<RegretType, { lowest: number; highest: number; difference: number }>();

    lowestRegret.factors.forEach((factor, type) => {
      const highestFactor = highestRegret.factors.get(type);
      if (highestFactor) {
        regretByType.set(type, {
          lowest: factor.score,
          highest: highestFactor.score,
          difference: highestFactor.score - factor.score,
        });
      }
    });

    return {
      lowestRegretPath: lowestRegret,
      highestRegretPath: highestRegret,
      regretDifference: highestRegret.aggregate.overallRegretScore - lowestRegret.aggregate.overallRegretScore,
      regretByType,
      comparisonText: this.generateRegretComparisonText(lowestRegret, highestRegret),
      tradeoffs: this.generateRegretTradeoffs(lowestRegret, highestRegret),
    };
  }

  /**
   * Generate regret comparison text.
   */
  private generateRegretComparisonText(lowest: PathRegretAnalysis, highest: PathRegretAnalysis): string {
    const diff = highest.aggregate.overallRegretScore - lowest.aggregate.overallRegretScore;

    return `${lowest.pathName} has ${diff} points lower regret risk than ${highest.pathName}. ` +
      `${lowest.pathName} regret: ${lowest.aggregate.overallRegretScore}/100. ` +
      `${highest.pathName} regret: ${highest.aggregate.overallRegretScore}/100.`;
  }

  /**
   * Generate regret tradeoffs.
   */
  private generateRegretTradeoffs(lowest: PathRegretAnalysis, highest: PathRegretAnalysis): string[] {
    const tradeoffs: string[] = [];

    lowest.factors.forEach((lowFactor, type) => {
      const highFactor = highest.factors.get(type);
      if (!highFactor) return;

      const diff = Math.abs(lowFactor.score - highFactor.score);
      if (diff > 15) {
        const betterPath = lowFactor.score < highFactor.score ? lowest.pathName : highest.pathName;
        tradeoffs.push(`${type} regret favors ${betterPath} (${diff} point difference)`);
      }
    });

    return tradeoffs.slice(0, 4);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Analyze regret for career paths.
 */
export function analyzeRegret(
  studentBelief: StudentBeliefV3,
  pathExplorerResult: CareerPathExplorerResult,
  graph: CareerTransitionGraphV1,
  coalitionAnalysis?: DecisionCoalitionAnalysis,
  options?: RegretAnalysisOptions
): RegretAnalysis {
  const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph, coalitionAnalysis);
  return engine.analyze(options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  RegretAnalysis,
  PathRegretAnalysis,
  RegretFactor,
  RegretComponent,
  RegretExplanation,
  RegretPathComparison,
  RegretAnalysisOptions,
  RegretAnalysisId,
  RegretType,
};
