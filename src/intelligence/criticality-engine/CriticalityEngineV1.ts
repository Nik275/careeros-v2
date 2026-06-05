/**
 * CareerOS Criticality Engine V1
 *
 * CareerOS - Career Intelligence System
 *
 * Purpose: Measure how much a career decision constrains a student's future opportunities.
 *
 * Architecture Principles:
 *   - Graph-driven: Uses Career Transition Graph for analysis
 *   - Deterministic: Same input always produces same output
 *   - Explainable: Every metric includes reasoning
 *   - Scalable: Supports 150+ careers efficiently
 *   - Type-safe: Full TypeScript coverage
 *
 * Criticality Score (0-100):
 *   0 = Highly Flexible (many future paths, easy to pivot)
 *   100 = Highly Constraining (limited paths, difficult to change)
 *
 * Key Insight:
 *   Early career decisions create path dependencies. Choosing a highly
 *   specialized career (e.g., Neurosurgeon) closes many doors but opens
 *   specific high-value ones. Choosing a generalist career (e.g., Software
 *   Engineer) preserves optionality but may delay specialization.
 */

import type {
  CareerTransitionGraphV1,
  CareerNode,
  CareerEdge,
  CareerTransitionPath,
  GraphTraversalOptions,
  AdjacentCareer,
  ReachableCareer,
} from '../career-transition-graph';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for criticality analyses.
 */
export type CriticalityId = string;

/**
 * Individual metric with score and explanation.
 */
export interface CriticalityMetric {
  /** Metric value (normalized 0-1 or raw count) */
  value: number;

  /** Human-readable explanation */
  explanation: string;

  /** Impact on criticality: positive = increases criticality, negative = decreases */
  impact: 'high' | 'medium' | 'low';

  /** Whether higher values are better for flexibility */
  isPositive: boolean;
}

/**
 * Comprehensive criticality analysis for a career.
 */
export interface CriticalityAnalysis {
  /** Unique identifier */
  id: CriticalityId;

  /** Career being analyzed */
  careerId: string;

  /** Career name */
  careerName: string;

  /** Overall criticality score (0-100, where 0 = flexible, 100 = constraining) */
  criticalityScore: number;

  /** Criticality category */
  category: 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';

  /** Human-readable summary */
  summary: string;

  /** Detailed explanation */
  explanation: string;

  /** Individual metrics */
  metrics: {
    /** Number of careers reachable from this position */
    reachableCareerCount: CriticalityMetric;

    /** Average number of future options (branching factor) */
    branchingFactor: CriticalityMetric;

    /** How easy to pivot away (0-1, higher = more reversible) */
    reversibility: CriticalityMetric;

    /** How transferable are skills (0-1) */
    transferability: CriticalityMetric;

    /** Years before meaningful flexibility */
    timeToFlexibility: CriticalityMetric;

    /** How many future possibilities remain (0-1) */
    optionalityPreservation: CriticalityMetric;

    /** How many paths become inaccessible (0-1) */
    futureConstraint: CriticalityMetric;
  };

  /** Reachable career details */
  reachableCareers: {
    /** Total number reachable */
    total: number;

    /** By category */
    byCategory: Map<string, number>;

    /** Top reachable careers */
    topPaths: CareerTransitionPath[];
  };

  /** Constraint details */
  constraints: {
    /** Careers that become inaccessible */
    inaccessibleCareers: string[];

    /** Minimum commitment required */
    minimumCommitmentYears: number;

    /** Financial commitment */
    financialCommitment: number;

    /** Educational requirements */
    educationRequirements: string[];
  };

  /** Comparison to average */
  comparison: {
    /** Percentile (0-100) */
    percentile: number;

    /** Compared to similar careers */
    vsCategoryAverage: number;

    /** Career count in same category */
    categorySize: number;
  };

  /** Timestamp */
  calculatedAt: number;
}

/**
 * Options for criticality calculation.
 */
export interface CriticalityCalculationOptions {
  /** Maximum depth for graph traversal (default: 5) */
  maxDepth?: number;

  /** Minimum probability threshold for paths (default: 0.1) */
  minProbability?: number;

  /** Time horizon in years (default: 20) */
  timeHorizon?: number;

  /** Whether to include indirect paths (default: true) */
  includeIndirectPaths?: boolean;

  /** Custom weights for metrics */
  weights?: Partial<CriticalityWeights>;
}

/**
 * Weights for combining metrics into criticality score.
 */
export interface CriticalityWeights {
  /** Weight for reachable career count */
  reachableCareers: number;

  /** Weight for branching factor */
  branchingFactor: number;

  /** Weight for reversibility */
  reversibility: number;

  /** Weight for transferability */
  transferability: number;

  /** Weight for time to flexibility */
  timeToFlexibility: number;

  /** Weight for optionality preservation */
  optionalityPreservation: number;

  /** Weight for future constraint */
  futureConstraint: number;
}

/**
 * Comparison between two careers' criticality.
 */
export interface CriticalityComparison {
  /** First career analysis */
  career1: CriticalityAnalysis;

  /** Second career analysis */
  career2: CriticalityAnalysis;

  /** Which is more critical (constraining) */
  moreCritical: 'career1' | 'career2' | 'equal';

  /** Which is more flexible */
  moreFlexible: 'career1' | 'career2' | 'equal';

  /** Score difference */
  scoreDifference: number;

  /** Human-readable comparison */
  comparison: string;

  /** Key differences */
  keyDifferences: string[];
}

/**
 * Batch analysis result.
 */
export interface BatchCriticalityResult {
  /** All analyses */
  analyses: Map<string, CriticalityAnalysis>;

  /** Rankings from least to most critical */
  rankings: CriticalityAnalysis[];

  /** Statistics */
  statistics: {
    averageScore: number;
    medianScore: number;
    minScore: number;
    maxScore: number;
    stdDev: number;
  };
}

// ============================================================================
// DEFAULT WEIGHTS
// ============================================================================

const DEFAULT_WEIGHTS: CriticalityWeights = {
  reachableCareers: 0.20,
  branchingFactor: 0.15,
  reversibility: 0.20,
  transferability: 0.15,
  timeToFlexibility: 0.15,
  optionalityPreservation: 0.10,
  futureConstraint: 0.05,
};

// ============================================================================
// CRITICALITY ENGINE V1
// ============================================================================

export class CriticalityEngineV1 {
  private graph: CareerTransitionGraphV1;

  constructor(graph: CareerTransitionGraphV1) {
    this.graph = graph;
  }

  /**
   * Calculate criticality for a single career.
   */
  calculateCriticality(
    careerId: string,
    options: CriticalityCalculationOptions = {}
  ): CriticalityAnalysis {
    const node = this.graph.getNode(careerId);
    if (!node) {
      throw new Error(`Career node ${careerId} does not exist in graph`);
    }

    const weights = { ...DEFAULT_WEIGHTS, ...options.weights };
    const maxDepth = options.maxDepth ?? 5;
    const minProbability = options.minProbability ?? 0.1;

    // Calculate individual metrics
    const reachableCareerCount = this.calculateReachableCareerCount(node, maxDepth, minProbability);
    const branchingFactor = this.calculateBranchingFactor(node);
    const reversibility = this.calculateReversibility(node);
    const transferability = this.calculateTransferability(node);
    const timeToFlexibility = this.calculateTimeToFlexibility(node);
    const optionalityPreservation = this.calculateOptionalityPreservation(node, reachableCareerCount.value);
    const futureConstraint = this.calculateFutureConstraint(node, reachableCareerCount.value);

    // Calculate weighted criticality score
    const criticalityScore = this.computeCriticalityScore(
      {
        reachableCareerCount,
        branchingFactor,
        reversibility,
        transferability,
        timeToFlexibility,
        optionalityPreservation,
        futureConstraint,
      },
      weights
    );

    // Get reachable career details
    const reachableCareers = this.getReachableCareerDetails(node, maxDepth, minProbability);

    // Get constraint details
    const constraints = this.getConstraintDetails(node);

    // Calculate comparison stats
    const comparison = this.calculateComparisonStats(node, criticalityScore);

    return {
      id: `criticality-${careerId}-${Date.now()}`,
      careerId: node.id,
      careerName: node.name,
      criticalityScore,
      category: this.categorizeCriticality(criticalityScore),
      summary: this.generateSummary(node, criticalityScore),
      explanation: this.generateExplanation(
        node,
        criticalityScore,
        {
          reachableCareerCount,
          branchingFactor,
          reversibility,
          transferability,
          timeToFlexibility,
          optionalityPreservation,
          futureConstraint,
        }
      ),
      metrics: {
        reachableCareerCount,
        branchingFactor,
        reversibility,
        transferability,
        timeToFlexibility,
        optionalityPreservation,
        futureConstraint,
      },
      reachableCareers,
      constraints,
      comparison,
      calculatedAt: Date.now(),
    };
  }

  /**
   * Calculate criticality for multiple careers.
   */
  calculateBatch(careerIds: string[], options: CriticalityCalculationOptions = {}): BatchCriticalityResult {
    const analyses = new Map<string, CriticalityAnalysis>();

    for (const careerId of careerIds) {
      try {
        const analysis = this.calculateCriticality(careerId, options);
        analyses.set(careerId, analysis);
      } catch (error) {
        // Skip careers not in graph
        console.warn(`Skipping ${careerId}: ${error}`);
      }
    }

    // Sort by criticality score (ascending = least critical first)
    const rankings = Array.from(analyses.values()).sort(
      (a, b) => a.criticalityScore - b.criticalityScore
    );

    // Calculate statistics
    const scores = rankings.map(a => a.criticalityScore);
    const statistics = {
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      medianScore: this.calculateMedian(scores),
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      stdDev: this.calculateStdDev(scores),
    };

    return {
      analyses,
      rankings,
      statistics,
    };
  }

  /**
   * Compare criticality between two careers.
   */
  compareCriticality(
    careerId1: string,
    careerId2: string,
    options: CriticalityCalculationOptions = {}
  ): CriticalityComparison {
    const career1 = this.calculateCriticality(careerId1, options);
    const career2 = this.calculateCriticality(careerId2, options);

    const scoreDiff = Math.abs(career1.criticalityScore - career2.criticalityScore);

    let moreCritical: 'career1' | 'career2' | 'equal';
    let moreFlexible: 'career1' | 'career2' | 'equal';

    if (career1.criticalityScore > career2.criticalityScore + 5) {
      moreCritical = 'career1';
      moreFlexible = 'career2';
    } else if (career2.criticalityScore > career1.criticalityScore + 5) {
      moreCritical = 'career2';
      moreFlexible = 'career1';
    } else {
      moreCritical = 'equal';
      moreFlexible = 'equal';
    }

    return {
      career1,
      career2,
      moreCritical,
      moreFlexible,
      scoreDifference: scoreDiff,
      comparison: this.generateComparisonText(career1, career2, moreCritical),
      keyDifferences: this.identifyKeyDifferences(career1, career2),
    };
  }

  /**
   * Get flexibility ranking for all careers.
   */
  getFlexibilityRanking(limit?: number): CriticalityAnalysis[] {
    const allCareers = this.graph.getAllNodes();
    const result = this.calculateBatch(
      allCareers.map(n => n.id),
      { maxDepth: 3 } // Use limited depth for performance
    );

    // Return sorted by criticality (ascending = most flexible first)
    const rankings = result.rankings;
    return limit ? rankings.slice(0, limit) : rankings;
  }

  /**
   * Find careers with similar criticality profiles.
   */
  findSimilarCriticality(careerId: string, tolerance: number = 10): CriticalityAnalysis[] {
    const target = this.calculateCriticality(careerId);
    const allCareers = this.graph.getAllNodes();

    const similar: CriticalityAnalysis[] = [];

    for (const node of allCareers) {
      if (node.id === careerId) continue;

      const analysis = this.calculateCriticality(node.id);
      if (Math.abs(analysis.criticalityScore - target.criticalityScore) <= tolerance) {
        similar.push(analysis);
      }
    }

    return similar.sort(
      (a, b) =>
        Math.abs(a.criticalityScore - target.criticalityScore) -
        Math.abs(b.criticalityScore - target.criticalityScore)
    );
  }

  // ============================================================================
  // METRIC CALCULATIONS
  // ============================================================================

  /**
   * Calculate reachable career count metric.
   */
  private calculateReachableCareerCount(
    node: CareerNode,
    maxDepth: number,
    minProbability: number
  ): CriticalityMetric {
    const traversalOptions: GraphTraversalOptions = {
      maxDepth,
      minProbability,
    };

    const reachable = this.graph.getReachableCareers(node.id, traversalOptions);
    const totalCareers = this.graph.getAllNodes().length;

    // Normalize: more reachable = lower criticality
    const normalizedValue = reachable.length / Math.max(1, totalCareers - 1);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    if (reachable.length >= 20) {
      explanation = `Exceptional reachability: ${reachable.length} career paths accessible`;
      impact = 'high';
    } else if (reachable.length >= 10) {
      explanation = `Good reachability: ${reachable.length} career paths accessible`;
      impact = 'medium';
    } else if (reachable.length >= 5) {
      explanation = `Moderate reachability: ${reachable.length} career paths accessible`;
      impact = 'medium';
    } else {
      explanation = `Limited reachability: only ${reachable.length} career paths accessible`;
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true, // More reachable is better
    };
  }

  /**
   * Calculate branching factor metric.
   */
  private calculateBranchingFactor(node: CareerNode): CriticalityMetric {
    const adjacent = this.graph.getAdjacentCareers(node.id);

    // Calculate average outgoing transitions
    const outgoingEdges = adjacent.filter(a => a.direction === 'to');
    const avgBranching = outgoingEdges.length;

    // Also calculate for reachable nodes (2nd order branching)
    let totalBranching = avgBranching;
    let levelCount = 1;

    for (const adj of outgoingEdges.slice(0, 5)) { // Sample first 5
      const nextAdjacent = this.graph.getAdjacentCareers(adj.node.id);
      const nextOutgoing = nextAdjacent.filter(a => a.direction === 'to');
      totalBranching += nextOutgoing.length;
      levelCount++;
    }

    const avgBranchingFactor = levelCount > 0 ? totalBranching / levelCount : 0;
    const normalizedValue = Math.min(1, avgBranchingFactor / 5); // Normalize to 5+ being max

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    if (avgBranchingFactor >= 4) {
      explanation = `High branching: ${avgBranching.toFixed(1)} immediate options on average`;
      impact = 'high';
    } else if (avgBranchingFactor >= 2) {
      explanation = `Moderate branching: ${avgBranching.toFixed(1)} immediate options`;
      impact = 'medium';
    } else {
      explanation = `Low branching: only ${avgBranching.toFixed(1)} immediate options`;
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true,
    };
  }

  /**
   * Calculate reversibility metric.
   */
  private calculateReversibility(node: CareerNode): CriticalityMetric {
    const edges = this.graph.getEdgesFrom(node.id);

    if (edges.length === 0) {
      return {
        value: 0.5,
        explanation: 'No transition data available - assuming moderate reversibility',
        impact: 'medium',
        isPositive: true,
      };
    }

    // Average reversibility of outgoing edges
    const avgReversibility =
      edges.reduce((sum, e) => sum + e.reversibility, 0) / edges.length;

    // Also check incoming edges (can you come back?)
    const incomingEdges = this.graph.getEdgesTo(node.id);
    const returnPaths = incomingEdges.filter(e => e.reversibility > 0.5).length;

    const combinedReversibility = (avgReversibility + (returnPaths > 0 ? 0.3 : 0)) / 1.3;
    const normalizedValue = Math.min(1, combinedReversibility);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    if (normalizedValue >= 0.7) {
      explanation = 'Highly reversible: easy to pivot to other paths';
      impact = 'high';
    } else if (normalizedValue >= 0.4) {
      explanation = 'Moderately reversible: some flexibility to change direction';
      impact = 'medium';
    } else {
      explanation = 'Low reversibility: difficult to pivot once committed';
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true,
    };
  }

  /**
   * Calculate transferability metric.
   */
  private calculateTransferability(node: CareerNode): CriticalityMetric {
    const edges = this.graph.getEdgesFrom(node.id);

    if (edges.length === 0) {
      // Use skill categories as proxy
      const skillDiversity = node.skillCategories.length;
      const normalizedValue = Math.min(1, skillDiversity / 3);

      return {
        value: normalizedValue,
        explanation: `Based on ${skillDiversity} skill categories - limited transition data`,
        impact: 'medium',
        isPositive: true,
      };
    }

    // Average skill overlap with adjacent careers
    const avgSkillOverlap =
      edges.reduce((sum, e) => sum + e.skillOverlap, 0) / edges.length;

    // Factor in number of skill categories
    const skillDiversityBonus = Math.min(0.3, node.skillCategories.length * 0.1);

    const normalizedValue = Math.min(1, avgSkillOverlap + skillDiversityBonus);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    if (normalizedValue >= 0.7) {
      explanation = 'Highly transferable skills applicable to many careers';
      impact = 'high';
    } else if (normalizedValue >= 0.4) {
      explanation = 'Moderately transferable skills with some limitations';
      impact = 'medium';
    } else {
      explanation = 'Specialized skills with limited transferability';
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true,
    };
  }

  /**
   * Calculate time to flexibility metric.
   */
  private calculateTimeToFlexibility(node: CareerNode): CriticalityMetric {
    const edges = this.graph.getEdgesFrom(node.id);

    // Minimum time to reach any adjacent career
    const minTransitionTime =
      edges.length > 0
        ? Math.min(...edges.map(e => e.transitionTimeYears))
        : node.typicalExperienceYears;

    // Time to reach a different category (meaningful pivot)
    const differentCategoryEdges = edges.filter(
      e => this.graph.getNode(e.toNodeId)?.category !== node.category
    );

    const timeToDifferentCategory =
      differentCategoryEdges.length > 0
        ? Math.min(...differentCategoryEdges.map(e => e.transitionTimeYears))
        : minTransitionTime * 2;

    const effectiveTime = Math.min(minTransitionTime, timeToDifferentCategory);

    // Normalize: less time = better (lower criticality)
    // 0 years = 1.0, 10+ years = 0.0
    const normalizedValue = Math.max(0, 1 - effectiveTime / 10);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    if (effectiveTime <= 1) {
      explanation = `Immediate flexibility: can pivot in ${effectiveTime.toFixed(1)} years`;
      impact = 'high';
    } else if (effectiveTime <= 3) {
      explanation = `Short-term flexibility: can pivot in ${effectiveTime.toFixed(1)} years`;
      impact = 'medium';
    } else if (effectiveTime <= 5) {
      explanation = `Medium-term commitment: ${effectiveTime.toFixed(1)} years before flexibility`;
      impact = 'medium';
    } else {
      explanation = `Long-term commitment: ${effectiveTime.toFixed(1)} years before meaningful flexibility`;
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true,
    };
  }

  /**
   * Calculate optionality preservation metric.
   */
  private calculateOptionalityPreservation(
    node: CareerNode,
    reachableCount: number
  ): CriticalityMetric {
    const totalCareers = this.graph.getAllNodes().length;

    // Calculate what percentage of total careers remain reachable
    const preservationRatio = reachableCount / Math.max(1, totalCareers - 1);

    // Factor in career level (entry level preserves more optionality)
    const levelBonus = node.isEntryLevel ? 0.2 : 0;

    const normalizedValue = Math.min(1, preservationRatio + levelBonus);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    const percentage = Math.round(normalizedValue * 100);

    if (normalizedValue >= 0.7) {
      explanation = `Preserves ${percentage}% of future options - highly flexible starting point`;
      impact = 'high';
    } else if (normalizedValue >= 0.4) {
      explanation = `Preserves ${percentage}% of future options - moderate flexibility`;
      impact = 'medium';
    } else {
      explanation = `Preserves only ${percentage}% of future options - significant path constraint`;
      impact = 'high';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: true,
    };
  }

  /**
   * Calculate future constraint metric.
   */
  private calculateFutureConstraint(
    node: CareerNode,
    reachableCount: number
  ): CriticalityMetric {
    const totalCareers = this.graph.getAllNodes().length;

    // Calculate inaccessible careers
    const inaccessibleCount = Math.max(0, totalCareers - 1 - reachableCount);
    const constraintRatio = inaccessibleCount / Math.max(1, totalCareers - 1);

    // Factor in terminal nature
    const terminalBonus = node.isTerminal ? 0.2 : 0;

    const normalizedValue = Math.min(1, constraintRatio + terminalBonus);

    let explanation: string;
    let impact: 'high' | 'medium' | 'low';

    const percentage = Math.round(normalizedValue * 100);

    if (normalizedValue >= 0.6) {
      explanation = `High constraint: ${percentage}% of career paths become inaccessible`;
      impact = 'high';
    } else if (normalizedValue >= 0.3) {
      explanation = `Moderate constraint: ${percentage}% of career paths become inaccessible`;
      impact = 'medium';
    } else {
      explanation = `Low constraint: only ${percentage}% of paths inaccessible`;
      impact = 'low';
    }

    return {
      value: normalizedValue,
      explanation,
      impact,
      isPositive: false, // Higher constraint = worse
    };
  }

  // ============================================================================
  // SCORE COMPUTATION
  // ============================================================================

  /**
   * Compute overall criticality score from metrics.
   */
  private computeCriticalityScore(
    metrics: {
      reachableCareerCount: CriticalityMetric;
      branchingFactor: CriticalityMetric;
      reversibility: CriticalityMetric;
      transferability: CriticalityMetric;
      timeToFlexibility: CriticalityMetric;
      optionalityPreservation: CriticalityMetric;
      futureConstraint: CriticalityMetric;
    },
    weights: CriticalityWeights
  ): number {
    // For positive metrics: (1 - value) * weight * 100
    // For negative metrics: value * weight * 100

    const positiveScore =
      (1 - metrics.reachableCareerCount.value) * weights.reachableCareers +
      (1 - metrics.branchingFactor.value) * weights.branchingFactor +
      (1 - metrics.reversibility.value) * weights.reversibility +
      (1 - metrics.transferability.value) * weights.transferability +
      (1 - metrics.timeToFlexibility.value) * weights.timeToFlexibility +
      (1 - metrics.optionalityPreservation.value) * weights.optionalityPreservation;

    const negativeScore = metrics.futureConstraint.value * weights.futureConstraint;

    const totalScore = (positiveScore + negativeScore) * 100;

    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }

  /**
   * Categorize criticality score.
   */
  private categorizeCriticality(score: number): 'minimal' | 'low' | 'moderate' | 'high' | 'extreme' {
    if (score <= 20) return 'minimal';
    if (score <= 40) return 'low';
    if (score <= 60) return 'moderate';
    if (score <= 80) return 'high';
    return 'extreme';
  }

  // ============================================================================
  // SUMMARY & EXPLANATION GENERATION
  // ============================================================================

  /**
   * Generate human-readable summary.
   */
  private generateSummary(node: CareerNode, score: number): string {
    const category = this.categorizeCriticality(score);

    const summaries: Record<string, string> = {
      minimal: `${node.name} offers exceptional flexibility with numerous future paths and easy pivot options.`,
      low: `${node.name} provides good flexibility with multiple career paths accessible.`,
      moderate: `${node.name} offers moderate flexibility - some paths open, some constraints apply.`,
      high: `${node.name} is a constraining choice that significantly limits future options.`,
      extreme: `${node.name} is highly specialized with limited ability to pivot to other careers.`,
    };

    return summaries[category];
  }

  /**
   * Generate detailed explanation.
   */
  private generateExplanation(
    node: CareerNode,
    score: number,
    metrics: {
      reachableCareerCount: CriticalityMetric;
      branchingFactor: CriticalityMetric;
      reversibility: CriticalityMetric;
      transferability: CriticalityMetric;
      timeToFlexibility: CriticalityMetric;
      optionalityPreservation: CriticalityMetric;
      futureConstraint: CriticalityMetric;
    }
  ): string {
    const parts: string[] = [];

    parts.push(`Criticality Score: ${score}/100 (${this.categorizeCriticality(score)})`);
    parts.push('');

    // Key factors
    parts.push('Key Factors:');

    if (metrics.reachableCareerCount.value < 0.3) {
      parts.push(`- Limited reachability: Few career paths are accessible from ${node.name}`);
    } else if (metrics.reachableCareerCount.value > 0.6) {
      parts.push(`- Excellent reachability: Many career paths remain accessible`);
    }

    if (metrics.reversibility.value < 0.4) {
      parts.push(`- Low reversibility: Once committed, pivoting is difficult`);
    }

    if (metrics.timeToFlexibility.value < 0.5) {
      parts.push(`- Long time commitment required before flexibility emerges`);
    }

    if (metrics.transferability.value > 0.6) {
      parts.push(`- Transferable skills enable movement between roles`);
    }

    if (metrics.futureConstraint.value > 0.5) {
      parts.push(`- Significant constraint: Many career paths become inaccessible`);
    }

    parts.push('');
    parts.push('Implications:');

    if (score <= 40) {
      parts.push('This career preserves your optionality. You can explore and change direction with relative ease.');
    } else if (score <= 70) {
      parts.push('This career involves moderate commitment. Some paths close, but reasonable flexibility remains.');
    } else {
      parts.push('This is a high-commitment path. Ensure alignment with your long-term goals before proceeding.');
    }

    return parts.join('\n');
  }

  // ============================================================================
  // DETAIL METHODS
  // ============================================================================

  /**
   * Get reachable career details.
   */
  private getReachableCareerDetails(
    node: CareerNode,
    maxDepth: number,
    minProbability: number
  ): CriticalityAnalysis['reachableCareers'] {
    const traversalOptions: GraphTraversalOptions = {
      maxDepth,
      minProbability,
      limit: 10,
    };

    const reachable = this.graph.getReachableCareers(node.id, traversalOptions);

    const byCategory = new Map<string, number>();
    for (const r of reachable) {
      const count = byCategory.get(r.node.category) || 0;
      byCategory.set(r.node.category, count + 1);
    }

    const topPaths = reachable
      .slice(0, 5)
      .map(r => r.shortestPath);

    return {
      total: reachable.length,
      byCategory,
      topPaths,
    };
  }

  /**
   * Get constraint details.
   */
  private getConstraintDetails(node: CareerNode): CriticalityAnalysis['constraints'] {
    const allCareers = this.graph.getAllNodes();
    const reachableIds = new Set(
      this.graph.getReachableCareers(node.id, { maxDepth: 3 }).map(r => r.node.id)
    );

    const inaccessibleCareers = allCareers
      .filter(c => c.id !== node.id && !reachableIds.has(c.id))
      .map(c => c.name);

    // Calculate minimum commitment
    const edges = this.graph.getEdgesFrom(node.id);
    const minCommitment =
      edges.length > 0
        ? Math.min(...edges.map(e => e.transitionTimeYears))
        : node.typicalExperienceYears;

    // Calculate financial commitment
    const avgFinancialCost =
      edges.length > 0
        ? edges.reduce((sum, e) => sum + e.financialCost.typical, 0) / edges.length
        : 0;

    // Extract education requirements
    const educationRequirements: string[] = [];
    for (const edge of edges) {
      const prereqs = edge.prerequisites.filter(p => p.type === 'education');
      educationRequirements.push(...prereqs.map(p => p.description));
    }

    return {
      inaccessibleCareers: inaccessibleCareers.slice(0, 10),
      minimumCommitmentYears: minCommitment,
      financialCommitment: avgFinancialCost,
      educationRequirements: [...new Set(educationRequirements)].slice(0, 5),
    };
  }

  /**
   * Calculate comparison statistics.
   */
  private calculateComparisonStats(
    node: CareerNode,
    score: number
  ): CriticalityAnalysis['comparison'] {
    const categoryNodes = this.graph.getNodesByCategory(node.category);
    const categorySize = categoryNodes.length;

    // Calculate percentile (approximation based on score)
    const percentile = score;

    // Compare to category average (would need batch calculation in production)
    const vsCategoryAverage = 0; // Placeholder

    return {
      percentile,
      vsCategoryAverage,
      categorySize,
    };
  }

  // ============================================================================
  // COMPARISON METHODS
  // ============================================================================

  /**
   * Generate comparison text.
   */
  private generateComparisonText(
    career1: CriticalityAnalysis,
    career2: CriticalityAnalysis,
    moreCritical: 'career1' | 'career2' | 'equal'
  ): string {
    if (moreCritical === 'equal') {
      return `${career1.careerName} and ${career2.careerName} have similar criticality levels (${career1.criticalityScore} vs ${career2.criticalityScore}).`;
    }

    const critical = moreCritical === 'career1' ? career1 : career2;
    const flexible = moreCritical === 'career1' ? career2 : career1;

    return `${critical.careerName} is more constraining (${critical.criticalityScore}) than ${flexible.careerName} (${flexible.criticalityScore}). ${flexible.careerName} offers more flexibility.`;
  }

  /**
   * Identify key differences between careers.
   */
  private identifyKeyDifferences(career1: CriticalityAnalysis, career2: CriticalityAnalysis): string[] {
    const differences: string[] = [];

    const m1 = career1.metrics;
    const m2 = career2.metrics;

    if (Math.abs(m1.reachableCareerCount.value - m2.reachableCareerCount.value) > 0.2) {
      const more = m1.reachableCareerCount.value > m2.reachableCareerCount.value ? career1 : career2;
      differences.push(`${more.careerName} has access to more career paths`);
    }

    if (Math.abs(m1.reversibility.value - m2.reversibility.value) > 0.2) {
      const more = m1.reversibility.value > m2.reversibility.value ? career1 : career2;
      differences.push(`${more.careerName} is easier to pivot away from`);
    }

    if (Math.abs(m1.transferability.value - m2.transferability.value) > 0.2) {
      const more = m1.transferability.value > m2.transferability.value ? career1 : career2;
      differences.push(`${more.careerName} has more transferable skills`);
    }

    if (Math.abs(m1.timeToFlexibility.value - m2.timeToFlexibility.value) > 0.3) {
      const faster = m1.timeToFlexibility.value > m2.timeToFlexibility.value ? career1 : career2;
      differences.push(`${faster.careerName} reaches flexibility faster`);
    }

    return differences.length > 0 ? differences : ['No significant differences in key metrics'];
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Calculate median of array.
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate standard deviation.
   */
  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Calculate criticality for a single career.
 */
export function calculateCriticality(
  careerId: string,
  graph: CareerTransitionGraphV1,
  options?: CriticalityCalculationOptions
): CriticalityAnalysis {
  const engine = new CriticalityEngineV1(graph);
  return engine.calculateCriticality(careerId, options);
}

/**
 * Compare criticality between two careers.
 */
export function compareCriticality(
  careerId1: string,
  careerId2: string,
  graph: CareerTransitionGraphV1,
  options?: CriticalityCalculationOptions
): CriticalityComparison {
  const engine = new CriticalityEngineV1(graph);
  return engine.compareCriticality(careerId1, careerId2, options);
}

/**
 * Calculate batch criticality for multiple careers.
 */
export function calculateBatchCriticality(
  careerIds: string[],
  graph: CareerTransitionGraphV1,
  options?: CriticalityCalculationOptions
): BatchCriticalityResult {
  const engine = new CriticalityEngineV1(graph);
  return engine.calculateBatch(careerIds, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  CriticalityAnalysis,
  CriticalityMetric,
  CriticalityCalculationOptions,
  CriticalityWeights,
  CriticalityComparison,
  BatchCriticalityResult,
  CriticalityId,
};
