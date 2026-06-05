/**
 * CareerOS Career Path Explorer V1
 *
 * CareerOS - Career Intelligence System
 *
 * Purpose: Generate realistic future career trajectories using the Career Transition Graph.
 *
 * Architecture Principles:
 *   - Graph-driven: Uses Career Transition Graph for path generation
 *   - Multi-engine: Integrates OptionalityEngine and CriticalityEngine
 *   - Deterministic: Same input always produces same output
 *   - Explainable: Every path includes reasoning
 *   - Scalable: Supports 150+ careers efficiently
 *
 * Path Types:
 *   1. Primary Path: Most common trajectory based on probability
 *   2. High Growth Path: Highest long-term upside (income, status)
 *   3. High Optionality Path: Preserves maximum future flexibility
 *   4. Low Risk Path: Most stable trajectory (high success probability)
 *
 * Example Output:
 *   "This path preserves optionality because it keeps access to Product,
 *    Startup, Leadership and Consulting transitions."
 */

import type {
  CareerTransitionGraphV1,
  CareerNode,
  CareerEdge,
  CareerTransitionPath,
  GraphTraversalOptions,
  ReachableCareer,
} from '../career-transition-graph';
import type {
  CriticalityEngineV1,
  CriticalityAnalysis,
} from '../criticality-engine';
import type {
  OptionalityEngineV1,
  OptionalityAnalysis,
} from '../optionality-engine';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for path explorer results.
 */
export type PathExplorerId = string;

/**
 * Types of career paths generated.
 */
export type PathType =
  | 'primary'
  | 'high-growth'
  | 'high-optionality'
  | 'low-risk'
  | 'balanced';

/**
 * A career path with full analysis.
 */
export interface ExploredCareerPath {
  /** Unique identifier */
  id: string;

  /** Path type */
  type: PathType;

  /** Path name/description */
  name: string;

  /** Ordered sequence of career nodes */
  nodes: CareerNode[];

  /** Edges connecting the nodes */
  edges: CareerEdge[];

  /** Node IDs for quick reference */
  nodeIds: string[];

  /** Path metrics */
  metrics: PathMetrics;

  /** Scores from different engines */
  scores: PathScores;

  /** Risk assessment */
  risk: RiskAssessment;

  /** Explainability output */
  explanation: PathExplanation;

  /** Recommended actions */
  recommendations: string[];
}

/**
 * Comprehensive path metrics.
 */
export interface PathMetrics {
  /** Total years for this path */
  totalYears: number;

  /** Number of transitions */
  transitionCount: number;

  /** Estimated income range */
  incomeRange: {
    entry: number;
    mid: number;
    senior: number;
    growthRate: number; // Annual growth rate
  };

  /** Total difficulty accumulated */
  totalDifficulty: number;

  /** Average transition time */
  avgTransitionTime: number;

  /** Cumulative probability of success */
  cumulativeSuccessProbability: number;

  /** Minimum reversibility along path */
  minReversibility: number;

  /** Average skill overlap */
  avgSkillOverlap: number;
}

/**
 * Scores from analysis engines.
 */
export interface PathScores {
  /** Optionality score (0-100) */
  optionalityScore: number;

  /** Criticality score (0-100) */
  criticalityScore: number;

  /** Flexibility score (0-100) */
  flexibilityScore: number;

  /** Growth potential (0-100) */
  growthScore: number;

  /** Stability score (0-100) */
  stabilityScore: number;

  /** Overall composite score */
  compositeScore: number;
}

/**
 * Risk assessment for a path.
 */
export interface RiskAssessment {
  /** Overall risk level */
  level: 'low' | 'medium' | 'high' | 'extreme';

  /** Risk score (0-100, higher = riskier) */
  score: number;

  /** Risk factors */
  factors: RiskFactor[];

  /** Mitigation strategies */
  mitigations: string[];
}

/**
 * Individual risk factor.
 */
export interface RiskFactor {
  /** Type of risk */
  type: 'transition' | 'market' | 'skill' | 'time' | 'financial';

  /** Description */
  description: string;

  /** Severity (0-1) */
  severity: number;

  /** Whether this is a deal-breaker */
  isCritical: boolean;
}

/**
 * Explainability output for a path.
 */
export interface PathExplanation {
  /** One-line summary */
  summary: string;

  /** Detailed explanation */
  details: string;

  /** Why this path was selected */
  selectionReason: string;

  /** Key strengths */
  strengths: string[];

  /** Key tradeoffs */
  tradeoffs: string[];

  /** Future options preserved */
  preservedOptions: string[];

  /** Future options closed */
  closedOptions: string[];
}

/**
 * Career Path Explorer result.
 */
export interface CareerPathExplorerResult {
  /** Unique identifier */
  id: PathExplorerId;

  /** Starting career */
  startingCareer: CareerNode;

  /** Starting career ID */
  startingCareerId: string;

  /** Generated paths */
  paths: ExploredCareerPath[];

  /** Paths by type for easy access */
  pathsByType: Map<PathType, ExploredCareerPath>;

  /** Comparison between paths */
  comparison: PathComparison;

  /** Overall recommendations */
  recommendations: PathRecommendation[];

  /** Timestamp */
  generatedAt: number;
}

/**
 * Comparison between paths.
 */
export interface PathComparison {
  /** Best path for growth */
  bestForGrowth: PathType;

  /** Best path for optionality */
  bestForOptionality: PathType;

  /** Best path for stability */
  bestForStability: PathType;

  /** Safest path */
  safestPath: PathType;

  /** Highest risk path */
  riskiestPath: PathType;

  /** Comparison text */
  comparisonText: string;

  /** Key differences */
  keyDifferences: PathDifference[];
}

/**
 * Difference between two paths.
 */
export interface PathDifference {
  /** Path types being compared */
  pathA: PathType;
  pathB: PathType;

  /** Dimension of difference */
  dimension: string;

  /** Description of difference */
  description: string;

  /** Magnitude of difference */
  magnitude: 'small' | 'medium' | 'large';
}

/**
 * Path recommendation.
 */
export interface PathRecommendation {
  /** Recommended path type */
  pathType: PathType;

  /** Confidence in recommendation (0-1) */
  confidence: number;

  /** Reason for recommendation */
  reason: string;

  /** Target profile this suits */
  suitsProfile: string;

  /** When to choose this path */
  whenToChoose: string;
}

/**
 * Options for path exploration.
 */
export interface PathExplorerOptions {
  /** Maximum path length in years */
  maxYears?: number;

  /** Maximum number of transitions */
  maxTransitions?: number;

  /** Minimum probability threshold */
  minProbability?: number;

  /** Time horizon for analysis */
  timeHorizon?: number;

  /** Risk tolerance */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';

  /** Whether to include indirect paths */
  includeIndirectPaths?: boolean;

  /** Custom path filters */
  filters?: PathFilters;

  /** Number of paths to generate per type */
  pathsPerType?: number;
}

/**
 * Filters for path generation.
 */
export interface PathFilters {
  /** Minimum income threshold */
  minIncome?: number;

  /** Maximum difficulty threshold */
  maxDifficulty?: number;

  /** Required categories to include */
  requiredCategories?: string[];

  /** Categories to exclude */
  excludedCategories?: string[];

  /** Maximum risk level */
  maxRiskLevel?: 'low' | 'medium' | 'high';
}

/**
 * Path generation strategy.
 */
export type PathStrategy =
  | 'highest-probability'
  | 'highest-income'
  | 'highest-optionality'
  | 'lowest-risk'
  | 'balanced';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_OPTIONS: Required<PathExplorerOptions> = {
  maxYears: 15,
  maxTransitions: 5,
  minProbability: 0.2,
  timeHorizon: 10,
  riskTolerance: 'moderate',
  includeIndirectPaths: true,
  filters: {},
  pathsPerType: 1,
};

// ============================================================================
// CAREER PATH EXPLORER V1
// ============================================================================

export class CareerPathExplorerV1 {
  private graph: CareerTransitionGraphV1;
  private optionalityEngine: OptionalityEngineV1;
  private criticalityEngine: CriticalityEngineV1;

  constructor(
    graph: CareerTransitionGraphV1,
    optionalityEngine: OptionalityEngineV1,
    criticalityEngine: CriticalityEngineV1
  ) {
    this.graph = graph;
    this.optionalityEngine = optionalityEngine;
    this.criticalityEngine = criticalityEngine;
  }

  /**
   * Explore career paths from a starting position.
   */
  explorePaths(
    startingCareerId: string,
    options: PathExplorerOptions = {}
  ): CareerPathExplorerResult {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const startingNode = this.graph.getNode(startingCareerId);
    if (!startingNode) {
      throw new Error(`Starting career ${startingCareerId} does not exist in graph`);
    }

    // Generate paths of each type
    const paths: ExploredCareerPath[] = [];

    // Primary path (highest probability)
    const primaryPath = this.generatePrimaryPath(startingNode, opts);
    if (primaryPath) paths.push(primaryPath);

    // High growth path (highest income/upside)
    const highGrowthPath = this.generateHighGrowthPath(startingNode, opts);
    if (highGrowthPath) paths.push(highGrowthPath);

    // High optionality path (preserves flexibility)
    const highOptionalityPath = this.generateHighOptionalityPath(startingNode, opts);
    if (highOptionalityPath) paths.push(highOptionalityPath);

    // Low risk path (most stable)
    const lowRiskPath = this.generateLowRiskPath(startingNode, opts);
    if (lowRiskPath) paths.push(lowRiskPath);

    // Build result
    const pathsByType = new Map<PathType, ExploredCareerPath>();
    paths.forEach(p => pathsByType.set(p.type, p));

    return {
      id: `explorer-${startingCareerId}-${Date.now()}`,
      startingCareer: startingNode,
      startingCareerId,
      paths,
      pathsByType,
      comparison: this.generateComparison(paths),
      recommendations: this.generateRecommendations(paths),
      generatedAt: Date.now(),
    };
  }

  /**
   * Generate single path exploration.
   */
  exploreSinglePath(
    startingCareerId: string,
    strategy: PathStrategy,
    options: PathExplorerOptions = {}
  ): ExploredCareerPath | null {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const startingNode = this.graph.getNode(startingCareerId);
    if (!startingNode) return null;

    switch (strategy) {
      case 'highest-probability':
        return this.generatePrimaryPath(startingNode, opts);
      case 'highest-income':
        return this.generateHighGrowthPath(startingNode, opts);
      case 'highest-optionality':
        return this.generateHighOptionalityPath(startingNode, opts);
      case 'lowest-risk':
        return this.generateLowRiskPath(startingNode, opts);
      case 'balanced':
        return this.generateBalancedPath(startingNode, opts);
      default:
        return this.generatePrimaryPath(startingNode, opts);
    }
  }

  /**
   * Compare multiple path options.
   */
  comparePaths(pathIds: string[]): PathComparison {
    // This would be implemented to compare specific paths
    // For now, return a placeholder
    return {
      bestForGrowth: 'high-growth',
      bestForOptionality: 'high-optionality',
      bestForStability: 'low-risk',
      safestPath: 'low-risk',
      riskiestPath: 'high-growth',
      comparisonText: 'Comparison based on generated paths',
      keyDifferences: [],
    };
  }

  // ============================================================================
  // PATH GENERATION METHODS
  // ============================================================================

  /**
   * Generate primary path (highest probability transitions).
   */
  private generatePrimaryPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>
  ): ExploredCareerPath | null {
    const path = this.buildPath(startingNode, options, (edges) => {
      // Select highest probability edge
      return edges.reduce((best, current) =>
        current.probabilityOfSuccess > best.probabilityOfSuccess ? current : best
      );
    });

    if (!path) return null;

    return this.enrichPath(path, 'primary', 'Most Common Trajectory');
  }

  /**
   * Generate high growth path (highest income potential).
   */
  private generateHighGrowthPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>
  ): ExploredCareerPath | null {
    const path = this.buildPath(startingNode, options, (edges) => {
      // Select edge leading to highest income node
      return edges.reduce((best, current) => {
        const bestTarget = this.graph.getNode(best.toNodeId);
        const currentTarget = this.graph.getNode(current.toNodeId);
        if (!bestTarget || !currentTarget) return best;
        return currentTarget.incomeLevel > bestTarget.incomeLevel ? current : best;
      });
    });

    if (!path) return null;

    return this.enrichPath(path, 'high-growth', 'Highest Growth Potential');
  }

  /**
   * Generate high optionality path (preserves flexibility).
   */
  private generateHighOptionalityPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>
  ): ExploredCareerPath | null {
    const path = this.buildPath(startingNode, options, (edges) => {
      // Select edge with best optionality preservation
      return edges.reduce((best, current) => {
        const bestTarget = this.graph.getNode(best.toNodeId);
        const currentTarget = this.graph.getNode(current.toNodeId);
        if (!bestTarget || !currentTarget) return best;

        // Prefer nodes with more outgoing edges (more future options)
        const bestReachable = this.graph.getReachableCareers(best.toNodeId, { maxDepth: 2 }).length;
        const currentReachable = this.graph.getReachableCareers(current.toNodeId, { maxDepth: 2 }).length;

        return currentReachable > bestReachable ? current : best;
      });
    });

    if (!path) return null;

    return this.enrichPath(path, 'high-optionality', 'Maximum Future Flexibility');
  }

  /**
   * Generate low risk path (most stable).
   */
  private generateLowRiskPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>
  ): ExploredCareerPath | null {
    const path = this.buildPath(startingNode, options, (edges) => {
      // Select edge with lowest difficulty and highest reversibility
      return edges.reduce((best, current) => {
        const bestScore = best.probabilityOfSuccess * best.reversibility - best.transitionDifficulty / 200;
        const currentScore = current.probabilityOfSuccess * current.reversibility - current.transitionDifficulty / 200;
        return currentScore > bestScore ? current : best;
      });
    });

    if (!path) return null;

    return this.enrichPath(path, 'low-risk', 'Most Stable Trajectory');
  }

  /**
   * Generate balanced path (considers multiple factors).
   */
  private generateBalancedPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>
  ): ExploredCareerPath | null {
    const path = this.buildPath(startingNode, options, (edges) => {
      // Balanced scoring
      return edges.reduce((best, current) => {
        const bestTarget = this.graph.getNode(best.toNodeId);
        const currentTarget = this.graph.getNode(current.toNodeId);
        if (!bestTarget || !currentTarget) return best;

        const bestScore =
          best.probabilityOfSuccess * 0.3 +
          best.reversibility * 0.2 +
          bestTarget.incomeLevel * 0.2 -
          best.transitionDifficulty / 100 * 0.15 +
          (bestTarget.isTerminal ? 0 : 0.15);

        const currentScore =
          current.probabilityOfSuccess * 0.3 +
          current.reversibility * 0.2 +
          currentTarget.incomeLevel * 0.2 -
          current.transitionDifficulty / 100 * 0.15 +
          (currentTarget.isTerminal ? 0 : 0.15);

        return currentScore > bestScore ? current : best;
      });
    });

    if (!path) return null;

    return this.enrichPath(path, 'balanced', 'Balanced Approach');
  }

  /**
   * Build a path using a selection strategy.
   */
  private buildPath(
    startingNode: CareerNode,
    options: Required<PathExplorerOptions>,
    selectEdge: (edges: CareerEdge[]) => CareerEdge
  ): { nodes: CareerNode[]; edges: CareerEdge[] } | null {
    const nodes: CareerNode[] = [startingNode];
    const edges: CareerEdge[] = [];

    let currentNode = startingNode;
    let totalYears = 0;

    for (let i = 0; i < options.maxTransitions; i++) {
      const outgoingEdges = this.graph.getEdgesFrom(currentNode.id).filter(e =>
        this.meetsFilters(e, options.filters)
      );

      if (outgoingEdges.length === 0) break;

      // Filter by probability threshold
      const validEdges = outgoingEdges.filter(
        e => e.probabilityOfSuccess >= options.minProbability
      );

      if (validEdges.length === 0) break;

      const selectedEdge = selectEdge(validEdges);
      const nextNode = this.graph.getNode(selectedEdge.toNodeId);

      if (!nextNode) break;

      // Check time constraint
      totalYears += selectedEdge.transitionTimeYears;
      if (totalYears > options.maxYears) break;

      // Check for cycles
      if (nodes.some(n => n.id === nextNode.id)) break;

      edges.push(selectedEdge);
      nodes.push(nextNode);
      currentNode = nextNode;

      // Stop at terminal nodes
      if (currentNode.isTerminal) break;
    }

    if (nodes.length < 1) return null;

    return { nodes, edges };
  }

  // ============================================================================
  // PATH ENRICHMENT
  // ============================================================================

  /**
   * Enrich a path with full analysis.
   */
  private enrichPath(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    type: PathType,
    name: string
  ): ExploredCareerPath {
    const id = `${path.nodes[0].id}-${type}-${Date.now()}`;

    const metrics = this.calculatePathMetrics(path);
    const scores = this.calculatePathScores(path);
    const risk = this.assessRisk(path, metrics);
    const explanation = this.generateExplanation(path, type, metrics, scores);
    const recommendations = this.generatePathRecommendations(path, type, risk);

    return {
      id,
      type,
      name,
      nodes: path.nodes,
      edges: path.edges,
      nodeIds: path.nodes.map(n => n.id),
      metrics,
      scores,
      risk,
      explanation,
      recommendations,
    };
  }

  /**
   * Calculate comprehensive path metrics.
   */
  private calculatePathMetrics(path: { nodes: CareerNode[]; edges: CareerEdge[] }): PathMetrics {
    const totalYears = path.edges.reduce((sum, e) => sum + e.transitionTimeYears, 0);
    const totalDifficulty = path.edges.reduce((sum, e) => sum + e.transitionDifficulty, 0);
    const avgTransitionTime = path.edges.length > 0 ? totalYears / path.edges.length : 0;

    // Calculate cumulative success probability
    const cumulativeSuccessProbability = path.edges.reduce(
      (prob, e) => prob * e.probabilityOfSuccess,
      1
    );

    // Minimum reversibility
    const minReversibility =
      path.edges.length > 0
        ? Math.min(...path.edges.map(e => e.reversibility))
        : 1;

    // Average skill overlap
    const avgSkillOverlap =
      path.edges.length > 0
        ? path.edges.reduce((sum, e) => sum + e.skillOverlap, 0) / path.edges.length
        : 1;

    // Income range estimation
    const lastNode = path.nodes[path.nodes.length - 1];
    const incomeRange = {
      entry: path.nodes[0]?.incomeLevel * 500000 || 500000,
      mid: path.nodes[Math.floor(path.nodes.length / 2)]?.incomeLevel * 800000 || 800000,
      senior: lastNode?.incomeLevel * 1500000 || 1500000,
      growthRate: lastNode?.incomeLevel > path.nodes[0]?.incomeLevel
        ? (lastNode.incomeLevel - path.nodes[0].incomeLevel) / path.nodes[0].incomeLevel * 100
        : 0,
    };

    return {
      totalYears,
      transitionCount: path.edges.length,
      incomeRange,
      totalDifficulty,
      avgTransitionTime,
      cumulativeSuccessProbability,
      minReversibility,
      avgSkillOverlap,
    };
  }

  /**
   * Calculate path scores using engines.
   */
  private calculatePathScores(path: { nodes: CareerNode[]; edges: CareerEdge[] }): PathScores {
    // Calculate optionality score (average of final node optionality)
    const lastNode = path.nodes[path.nodes.length - 1];
    let optionalityScore = 50;
    try {
      const optionalityAnalysis = this.optionalityEngine.calculateOptionality(lastNode.id);
      optionalityScore = optionalityAnalysis.overallScore;
    } catch {
      // Use fallback
      optionalityScore = lastNode?.isTerminal ? 30 : 70;
    }

    // Calculate criticality score
    let criticalityScore = 50;
    try {
      const criticalityAnalysis = this.criticalityEngine.calculateCriticality(lastNode.id);
      criticalityScore = criticalityAnalysis.criticalityScore;
    } catch {
      // Use fallback
      criticalityScore = lastNode?.isTerminal ? 70 : 40;
    }

    // Flexibility score (inverse of average difficulty)
    const avgDifficulty =
      path.edges.length > 0
        ? path.edges.reduce((sum, e) => sum + e.transitionDifficulty, 0) / path.edges.length
        : 50;
    const flexibilityScore = Math.max(0, 100 - avgDifficulty);

    // Growth score (based on income improvement)
    const firstNode = path.nodes[0];
    const growthScore = lastNode && firstNode
      ? Math.min(100, (lastNode.incomeLevel - firstNode.incomeLevel) * 100 + 50)
      : 50;

    // Stability score (based on probability and reversibility)
    const avgProbability =
      path.edges.length > 0
        ? path.edges.reduce((sum, e) => sum + e.probabilityOfSuccess, 0) / path.edges.length
        : 0.5;
    const avgReversibility =
      path.edges.length > 0
        ? path.edges.reduce((sum, e) => sum + e.reversibility, 0) / path.edges.length
        : 0.5;
    const stabilityScore = (avgProbability + avgReversibility) * 50;

    // Composite score
    const compositeScore = Math.round(
      optionalityScore * 0.2 +
      (100 - criticalityScore) * 0.2 +
      flexibilityScore * 0.2 +
      growthScore * 0.2 +
      stabilityScore * 0.2
    );

    return {
      optionalityScore,
      criticalityScore,
      flexibilityScore,
      growthScore,
      stabilityScore,
      compositeScore,
    };
  }

  /**
   * Assess risk for a path.
   */
  private assessRisk(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    metrics: PathMetrics
  ): RiskAssessment {
    const factors: RiskFactor[] = [];

    // Transition risk
    if (metrics.cumulativeSuccessProbability < 0.5) {
      factors.push({
        type: 'transition',
        description: 'Low cumulative probability of successful transitions',
        severity: 1 - metrics.cumulativeSuccessProbability,
        isCritical: metrics.cumulativeSuccessProbability < 0.3,
      });
    }

    // Time risk
    if (metrics.totalYears > 10) {
      factors.push({
        type: 'time',
        description: 'Long time commitment required',
        severity: (metrics.totalYears - 10) / 10,
        isCritical: metrics.totalYears > 15,
      });
    }

    // Irreversibility risk
    if (metrics.minReversibility < 0.3) {
      factors.push({
        type: 'transition',
        description: 'Some transitions are difficult to reverse',
        severity: 1 - metrics.minReversibility,
        isCritical: metrics.minReversibility < 0.2,
      });
    }

    // Calculate overall risk score
    const riskScore = Math.min(100, factors.reduce((sum, f) => sum + f.severity * 25, 0));

    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'extreme';
    if (riskScore < 25) level = 'low';
    else if (riskScore < 50) level = 'medium';
    else if (riskScore < 75) level = 'high';
    else level = 'extreme';

    // Mitigation strategies
    const mitigations = this.generateMitigations(factors);

    return {
      level,
      score: Math.round(riskScore),
      factors,
      mitigations,
    };
  }

  /**
   * Generate risk mitigations.
   */
  private generateMitigations(factors: RiskFactor[]): string[] {
    const mitigations: string[] = [];

    if (factors.some(f => f.type === 'transition' && f.severity > 0.5)) {
      mitigations.push('Build transferable skills alongside specialized knowledge');
      mitigations.push('Maintain professional network across multiple domains');
    }

    if (factors.some(f => f.type === 'time' && f.severity > 0.5)) {
      mitigations.push('Set milestone checkpoints to reassess path');
      mitigations.push('Consider parallel skill development');
    }

    if (mitigations.length === 0) {
      mitigations.push('Continue monitoring market trends');
      mitigations.push('Regular career health check recommended');
    }

    return mitigations;
  }

  /**
   * Generate path explanation.
   */
  private generateExplanation(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    type: PathType,
    metrics: PathMetrics,
    scores: PathScores
  ): PathExplanation {
    const nodeNames = path.nodes.map(n => n.name);
    const lastNode = path.nodes[path.nodes.length - 1];

    // Summary
    const summary = `Path to ${lastNode.name} over ${Math.round(metrics.totalYears)} years with ${scores.compositeScore}/100 composite score`;

    // Details
    const details = this.generatePathDetails(path, metrics, scores);

    // Selection reason
    const selectionReason = this.generateSelectionReason(type, path, metrics);

    // Strengths
    const strengths = this.identifyPathStrengths(path, metrics, scores);

    // Tradeoffs
    const tradeoffs = this.identifyPathTradeoffs(path, metrics, scores);

    // Future options
    const { preservedOptions, closedOptions } = this.analyzeFutureOptions(path);

    return {
      summary,
      details,
      selectionReason,
      strengths,
      tradeoffs,
      preservedOptions,
      closedOptions,
    };
  }

  /**
   * Generate detailed path description.
   */
  private generatePathDetails(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    metrics: PathMetrics,
    scores: PathScores
  ): string {
    const parts: string[] = [];

    parts.push('Path Trajectory:');
    path.nodes.forEach((node, i) => {
      const prefix = i === 0 ? 'Start' : `${i}. Transition to`;
      parts.push(`  ${prefix}: ${node.name}`);
    });

    parts.push('');
    parts.push(`Total Duration: ${Math.round(metrics.totalYears)} years`);
    parts.push(`Transitions: ${metrics.transitionCount}`);
    parts.push(`Success Probability: ${Math.round(metrics.cumulativeSuccessProbability * 100)}%`);
    parts.push('');
    parts.push('Scores:');
    parts.push(`  Optionality: ${scores.optionalityScore}/100`);
    parts.push(`  Criticality: ${scores.criticalityScore}/100`);
    parts.push(`  Flexibility: ${scores.flexibilityScore}/100`);
    parts.push(`  Growth: ${scores.growthScore}/100`);
    parts.push(`  Stability: ${scores.stabilityScore}/100`);

    return parts.join('\n');
  }

  /**
   * Generate selection reason.
   */
  private generateSelectionReason(
    type: PathType,
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    metrics: PathMetrics
  ): string {
    const reasons: Record<PathType, string> = {
      primary: `Selected as the primary path because it follows the highest probability transitions (${Math.round(metrics.cumulativeSuccessProbability * 100)}% success rate).`,
      'high-growth': `Selected for high growth potential with estimated ${Math.round(metrics.incomeRange.growthRate)}% income growth over the trajectory.`,
      'high-optionality': `Selected for maximum future flexibility, preserving access to multiple career domains and transition options.`,
      'low-risk': `Selected as the lowest risk path with stable transitions and high reversibility for all major decision points.`,
      balanced: `Selected as a balanced approach considering growth, stability, and flexibility equally.`,
    };

    return reasons[type];
  }

  /**
   * Identify path strengths.
   */
  private identifyPathStrengths(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    metrics: PathMetrics,
    scores: PathScores
  ): string[] {
    const strengths: string[] = [];

    if (scores.optionalityScore > 70) {
      strengths.push('Preserves high optionality for future pivots');
    }

    if (scores.growthScore > 70) {
      strengths.push('Strong income growth trajectory');
    }

    if (scores.stabilityScore > 70) {
      strengths.push('Stable path with high success probability');
    }

    if (scores.flexibilityScore > 70) {
      strengths.push('Easy to pivot at each transition point');
    }

    if (metrics.avgSkillOverlap > 0.6) {
      strengths.push('Strong skill continuity between transitions');
    }

    if (strengths.length === 0) {
      strengths.push('Viable career progression with moderate risk');
    }

    return strengths;
  }

  /**
   * Identify path tradeoffs.
   */
  private identifyPathTradeoffs(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    metrics: PathMetrics,
    scores: PathScores
  ): string[] {
    const tradeoffs: string[] = [];

    if (scores.criticalityScore > 60) {
      tradeoffs.push('High commitment - difficult to change direction once started');
    }

    if (metrics.totalYears > 8) {
      tradeoffs.push('Long time investment required before reaching target position');
    }

    if (metrics.cumulativeSuccessProbability < 0.5) {
      tradeoffs.push('Lower probability of successfully completing all transitions');
    }

    if (scores.optionalityScore < 40) {
      tradeoffs.push('Limited future options after completing this path');
    }

    if (tradeoffs.length === 0) {
      tradeoffs.push('Moderate tradeoffs between speed and security');
    }

    return tradeoffs;
  }

  /**
   * Analyze future options.
   */
  private analyzeFutureOptions(
    path: { nodes: CareerNode[]; edges: CareerEdge[] }
  ): { preservedOptions: string[]; closedOptions: string[] } {
    const lastNode = path.nodes[path.nodes.length - 1];
    const reachable = this.graph.getReachableCareers(lastNode.id, { maxDepth: 2 });

    const preservedOptions = reachable
      .slice(0, 5)
      .map(r => r.node.name);

    // Closed options are careers not reachable from this path
    const allNodes = this.graph.getAllNodes();
    const reachableIds = new Set(reachable.map(r => r.node.id));
    const closedOptions = allNodes
      .filter(n => n.id !== lastNode.id && !reachableIds.has(n.id))
      .slice(0, 5)
      .map(n => n.name);

    return { preservedOptions, closedOptions };
  }

  /**
   * Generate path recommendations.
   */
  private generatePathRecommendations(
    path: { nodes: CareerNode[]; edges: CareerEdge[] },
    type: PathType,
    risk: RiskAssessment
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Consider this path if you prioritize ${type.replace('-', ' ')}`);

    if (risk.level === 'high' || risk.level === 'extreme') {
      recommendations.push('Build contingency plans given risk level');
      recommendations.push('Develop transferable skills alongside specialization');
    }

    if (type === 'high-optionality') {
      recommendations.push('This path suits those who value future flexibility');
    }

    if (type === 'high-growth') {
      recommendations.push('Best for those willing to take calculated risks for upside');
    }

    return recommendations;
  }

  // ============================================================================
  // COMPARISON & RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate comparison between paths.
   */
  private generateComparison(paths: ExploredCareerPath[]): PathComparison {
    if (paths.length === 0) {
      return {
        bestForGrowth: 'high-growth',
        bestForOptionality: 'high-optionality',
        bestForStability: 'low-risk',
        safestPath: 'low-risk',
        riskiestPath: 'high-growth',
        comparisonText: 'No paths available for comparison',
        keyDifferences: [],
      };
    }

    // Find best for each dimension
    const bestForGrowth = paths.reduce((best, current) =>
      current.scores.growthScore > best.scores.growthScore ? current : best
    );

    const bestForOptionality = paths.reduce((best, current) =>
      current.scores.optionalityScore > best.scores.optionalityScore ? current : best
    );

    const bestForStability = paths.reduce((best, current) =>
      current.scores.stabilityScore > best.scores.stabilityScore ? current : best
    );

    const safestPath = paths.reduce((best, current) =>
      current.risk.score < best.risk.score ? current : best
    );

    const riskiestPath = paths.reduce((riskiest, current) =>
      current.risk.score > riskiest.risk.score ? current : riskiest
    );

    // Generate comparison text
    const comparisonText = this.generateComparisonText(
      bestForGrowth,
      bestForOptionality,
      safestPath
    );

    // Identify key differences
    const keyDifferences = this.identifyKeyDifferences(paths);

    return {
      bestForGrowth: bestForGrowth.type,
      bestForOptionality: bestForOptionality.type,
      bestForStability: bestForStability.type,
      safestPath: safestPath.type,
      riskiestPath: riskiestPath.type,
      comparisonText,
      keyDifferences,
    };
  }

  /**
   * Generate comparison text.
   */
  private generateComparisonText(
    bestGrowth: ExploredCareerPath,
    bestOptionality: ExploredCareerPath,
    safest: ExploredCareerPath
  ): string {
    const parts: string[] = [];

    parts.push(`The ${bestGrowth.name} offers the highest growth potential (${bestGrowth.scores.growthScore}/100).`);
    parts.push(`The ${bestOptionality.name} preserves maximum flexibility (${bestOptionality.scores.optionalityScore}/100 optionality).`);
    parts.push(`The ${safest.name} provides the most stability with ${safest.risk.level} risk.`);

    return parts.join(' ');
  }

  /**
   * Identify key differences between paths.
   */
  private identifyKeyDifferences(paths: ExploredCareerPath[]): PathDifference[] {
    const differences: PathDifference[] = [];

    if (paths.length < 2) return differences;

    // Compare each pair
    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const pathA = paths[i];
        const pathB = paths[j];

        // Income difference
        if (Math.abs(pathA.metrics.incomeRange.senior - pathB.metrics.incomeRange.senior) > 300000) {
          differences.push({
            pathA: pathA.type,
            pathB: pathB.type,
            dimension: 'income',
            description: `${pathA.name} leads to different income potential than ${pathB.name}`,
            magnitude: 'large',
          });
        }

        // Time difference
        if (Math.abs(pathA.metrics.totalYears - pathB.metrics.totalYears) > 3) {
          differences.push({
            pathA: pathA.type,
            pathB: pathB.type,
            dimension: 'time',
            description: `${pathA.name} takes ${Math.abs(pathA.metrics.totalYears - pathB.metrics.totalYears).toFixed(1)} years longer`,
            magnitude: 'medium',
          });
        }

        // Risk difference
        if (Math.abs(pathA.risk.score - pathB.risk.score) > 25) {
          differences.push({
            pathA: pathA.type,
            pathB: pathB.type,
            dimension: 'risk',
            description: `Significant risk difference between paths`,
            magnitude: 'large',
          });
        }
      }
    }

    return differences.slice(0, 5);
  }

  /**
   * Generate overall recommendations.
   */
  private generateRecommendations(paths: ExploredCareerPath[]): PathRecommendation[] {
    const recommendations: PathRecommendation[] = [];

    paths.forEach(path => {
      let suitsProfile = '';
      let whenToChoose = '';

      switch (path.type) {
        case 'primary':
          suitsProfile = 'Risk-averse individuals seeking proven paths';
          whenToChoose = 'When you want the highest probability of success';
          break;
        case 'high-growth':
          suitsProfile = 'Ambitious individuals willing to take calculated risks';
          whenToChoose = 'When maximizing long-term upside is priority';
          break;
        case 'high-optionality':
          suitsProfile = 'Explorers who value future flexibility';
          whenToChoose = 'When keeping options open is important';
          break;
        case 'low-risk':
          suitsProfile = 'Conservative planners prioritizing stability';
          whenToChoose = 'When minimizing downside is critical';
          break;
        case 'balanced':
          suitsProfile = 'Pragmatic individuals seeking equilibrium';
          whenToChoose = 'When multiple factors matter equally';
          break;
      }

      recommendations.push({
        pathType: path.type,
        confidence: path.scores.compositeScore / 100,
        reason: path.explanation.selectionReason,
        suitsProfile,
        whenToChoose,
      });
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if edge meets filter criteria.
   */
  private meetsFilters(edge: CareerEdge, filters: PathFilters): boolean {
    if (filters.maxDifficulty !== undefined && edge.transitionDifficulty > filters.maxDifficulty) {
      return false;
    }

    return true;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Explore career paths from a starting position.
 */
export function exploreCareerPaths(
  startingCareerId: string,
  graph: CareerTransitionGraphV1,
  optionalityEngine: OptionalityEngineV1,
  criticalityEngine: CriticalityEngineV1,
  options?: PathExplorerOptions
): CareerPathExplorerResult {
  const explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
  return explorer.explorePaths(startingCareerId, options);
}

/**
 * Explore a single path with specific strategy.
 */
export function exploreSinglePath(
  startingCareerId: string,
  strategy: PathStrategy,
  graph: CareerTransitionGraphV1,
  optionalityEngine: OptionalityEngineV1,
  criticalityEngine: CriticalityEngineV1,
  options?: PathExplorerOptions
): ExploredCareerPath | null {
  const explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
  return explorer.exploreSinglePath(startingCareerId, strategy, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathMetrics,
  PathScores,
  PathExplanation,
  PathComparison,
  PathRecommendation,
  PathExplorerOptions,
  PathFilters,
  RiskAssessment,
  RiskFactor,
  PathType,
  PathStrategy,
  PathDifference,
  PathExplorerId,
};
