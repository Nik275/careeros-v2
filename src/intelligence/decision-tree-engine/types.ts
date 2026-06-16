/**
 * CareerOS Decision Tree Engine - Types
 *
 * Type definitions for modeling career decisions as sequential decision trees.
 */

import type {
  ExploredCareerPath,
  PathMetrics,
  PathScores,
} from '../path-explorer';

import type {
  FutureScenario,
  ScenarioMetrics,
} from '../future-scenario';

import type {
  OptimalDecision,
  ExpectedUtility,
} from '../decision-optimization-engine';

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for decision tree analyses.
 */
export type DecisionTreeId = string;

/**
 * Type of node in the decision tree.
 */
export type DecisionTreeNodeType = 'decision' | 'chance' | 'outcome';

/**
 * Type of decision being modeled.
 */
export type DecisionType =
  | 'education-choice'
  | 'career-entry'
  | 'specialization'
  | 'transition'
  | 'geographic'
  | 'risk-tolerance'
  | 'timing'
  | 'commitment-level';

/**
 * Risk level classification.
 */
export type RiskLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'severe';

/**
 * Upside potential classification.
 */
export type UpsideLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'exceptional';

/**
 * Optionality level classification.
 */
export type OptionalityLevel = 'constrained' | 'limited' | 'moderate' | 'flexible' | 'expansive';

/**
 * Metrics that may be attached to decision-tree nodes.
 *
 * Decision nodes carry explored path metrics. Outcome nodes may carry future
 * scenario metrics. Keep this local surface explicit so neither upstream
 * contract absorbs fields it does not own.
 */
export type DecisionTreeNodeMetrics = Partial<PathMetrics> & Partial<ScenarioMetrics>;

// ============================================================================
// DECISION TREE NODE
// ============================================================================

/**
 * A node in the decision tree.
 */
export interface DecisionTreeNode {
  /** Unique identifier */
  id: string;

  /** Type of node */
  nodeType: DecisionTreeNodeType;

  /** Human-readable label */
  label: string;

  /** Detailed description */
  description: string;

  /** Node-specific data */
  data?: {
    /** For decision nodes: type of decision */
    decisionType?: DecisionType;

    /** For chance nodes: event description */
    eventDescription?: string;

    /** For outcome nodes: final state */
    outcomeState?: string;

    /** Career path associated with this node */
    careerPathId?: string;

    /** Future scenario associated with this node */
    scenarioId?: string;

    /** Metrics at this node */
    metrics?: DecisionTreeNodeMetrics;

    /** Scores at this node */
    scores?: Partial<PathScores>;
  };

  /** Depth in the tree (0 = root) */
  depth: number;

  /** Parent node ID (null for root) */
  parentId: string | null;

  /** Whether this is a terminal node */
  isTerminal: boolean;

  /** Estimated value at this node (for pruning) */
  estimatedValue?: number;
}

// ============================================================================
// DECISION TREE EDGE
// ============================================================================

/**
 * An edge connecting nodes in the decision tree.
 */
export interface DecisionTreeEdge {
  /** Source node ID */
  sourceId: string;

  /** Target node ID */
  targetId: string;

  /** Probability for chance edges (0-1) */
  probability?: number;

  /** Human-readable explanation */
  explanation: string;

  /** Edge type */
  edgeType: 'choice' | 'probability' | 'deterministic';

  /** Action taken on this edge */
  action?: {
    name: string;
    description: string;
    cost?: number;
    time?: string;
  };

  /** Conditions for this edge */
  conditions?: string[];

  /** Requirements to take this path */
  requirements?: string[];
}

// ============================================================================
// DECISION TREE
// ============================================================================

/**
 * Complete decision tree structure.
 */
export interface DecisionTree {
  /** Unique identifier */
  id: DecisionTreeId;

  /** Root node ID */
  rootId: string;

  /** All nodes in the tree */
  nodes: Map<string, DecisionTreeNode>;

  /** All edges in the tree */
  edges: DecisionTreeEdge[];

  /** Starting career/student state */
  startingState: {
    careerId: string;
    careerName: string;
    studentContext: string;
  };

  /** Tree metadata */
  metadata: {
    createdAt: number;
    maxDepth: number;
    nodeCount: number;
    branchCount: number;
    terminalNodeCount: number;
  };
}

// ============================================================================
// PATH EVALUATION
// ============================================================================

/**
 * Evaluation of a single path through the decision tree.
 */
export interface DecisionPathEvaluation {
  /** Path ID */
  pathId: string;

  /** Node IDs in order from root to terminal */
  nodeIds: string[];

  /** Edge IDs in order */
  edgeIds: string[];

  /** Path type */
  pathType: 'optimal' | 'alternative' | 'risky' | 'conservative' | 'exploratory';

  /** Utility evaluation */
  utility: {
    total: number;
    discounted: number;
    byStage: number[];
    confidence: number;
  };

  /** Regret evaluation */
  regret: {
    expectedRegret: number;
    maxRegret: number;
    regretRisk: number;
  };

  /** Optionality evaluation */
  optionality: {
    initial: number;
    final: number;
    preservation: number;
    futureOptions: number;
  };

  /** Risk evaluation */
  risk: {
    overall: RiskLevel;
    probability: number;
    variance: number;
    worstCase: number;
    bestCase: number;
  };

  /** Market outlook */
  market: {
    outlook: 'negative' | 'neutral' | 'positive' | 'strong';
    demandTrend: 'declining' | 'stable' | 'growing' | 'booming';
    competitionLevel: 'low' | 'moderate' | 'high' | 'intense';
  };

  /** Composite score */
  compositeScore: number;

  /** Rank among all paths */
  rank: number;
}

// ============================================================================
// BRANCH ANALYSIS
// ============================================================================

/**
 * Analysis of a branch in the decision tree.
 */
export interface DecisionBranchAnalysis {
  /** Branch ID (identified by first edge) */
  branchId: string;

  /** Source node */
  sourceNodeId: string;

  /** Target nodes reachable from this branch */
  targetNodeIds: string[];

  /** Branch characteristics */
  characteristics: {
    risk: RiskLevel;
    upside: UpsideLevel;
    optionality: OptionalityLevel;
  };

  /** Risk analysis */
  riskAnalysis: {
    level: RiskLevel;
    probability: number;
    potentialLoss: number;
    riskFactors: string[];
    mitigationOptions: string[];
  };

  /** Upside analysis */
  upsideAnalysis: {
    level: UpsideLevel;
    probability: number;
    potentialGain: number;
    upsideFactors: string[];
    catalysts: string[];
  };

  /** Optionality analysis */
  optionalityAnalysis: {
    level: OptionalityLevel;
    preservedOptions: number;
    closedOptions: number;
    futureFlexibility: number;
    reversibility: number;
  };

  /** Recommendation */
  recommendation: {
    isRecommended: boolean;
    confidence: number;
    reasoning: string[];
  };
}

// ============================================================================
// CRITICAL DECISION POINT
// ============================================================================

/**
 * Critical point where decisions significantly impact outcomes.
 */
export interface CriticalDecisionPoint {
  /** Node ID */
  nodeId: string;

  /** Description of the decision */
  description: string;

  /** Decision type */
  decisionType: DecisionType;

  /** Available choices */
  choices: Array<{
    edgeId: string;
    label: string;
    consequences: string[];
    metrics: {
      expectedUtility: number;
      risk: RiskLevel;
      optionality: OptionalityLevel;
    };
  }>;

  /** Impact assessment */
  impact: {
    magnitude: 'low' | 'moderate' | 'high' | 'critical';
    irreversibility: number; // 0-1
    longTermEffect: string;
  };

  /** Timing */
  timing: {
    isTimeSensitive: boolean;
    deadline?: string;
    urgency: 'low' | 'medium' | 'high';
  };

  /** Recommendation */
  recommendedChoice: string;
  recommendationReason: string[];
}

// ============================================================================
// BRANCHING OPPORTUNITY
// ============================================================================

/**
 * Opportunity to branch into alternative paths.
 */
export interface BranchingOpportunity {
  /** Node ID where branching occurs */
  nodeId: string;

  /** Description of the opportunity */
  description: string;

  /** Available branches */
  branches: Array<{
    branchId: string;
    label: string;
    destinationCareerId: string;
    requirements: string[];
    metrics: {
      expectedUtility: number;
      transitionDifficulty: number;
      successProbability: number;
    };
  }>;

  /** Value of maintaining optionality */
  optionalityValue: number;

  /** Recommendation */
  recommendation: {
    shouldBranch: boolean;
    preferredBranch: string | null;
    reasoning: string[];
  };
}

// ============================================================================
// DECISION TREE ANALYSIS
// ============================================================================

/**
 * Complete analysis of the decision tree.
 */
export interface DecisionTreeAnalysis {
  /** Unique identifier */
  id: DecisionTreeId;

  /** Timestamp */
  timestamp: number;

  /** Student reference */
  studentId: string;

  /** The decision tree */
  tree: DecisionTree;

  /** Best path */
  bestPath: DecisionPathEvaluation;

  /** Alternative paths */
  alternativePaths: DecisionPathEvaluation[];

  /** Critical decision points */
  criticalPoints: CriticalDecisionPoint[];

  /** Branching opportunities */
  branchingOpportunities: BranchingOpportunity[];

  /** Branch analyses */
  branchAnalyses: DecisionBranchAnalysis[];

  /** Path comparisons */
  pathComparisons: Array<{
    pathA: string;
    pathB: string;
    winner: string | 'tie';
    margin: number;
    keyDifferences: string[];
  }>;

  /** Explanation */
  explanation: {
    summary: string;
    recommendedPath: string;
    keyInsights: string[];
    warnings: string[];
  };

  /** Statistics */
  statistics: {
    totalPaths: number;
    terminalNodes: number;
    criticalPointsCount: number;
    branchingOpportunitiesCount: number;
    averagePathUtility: number;
    utilityVariance: number;
  };
}

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Input for decision tree generation.
 */
export interface DecisionTreeInput {
  /** Student ID */
  studentId: string;

  /** Starting career */
  startingCareerId: string;

  /** Optional human-readable starting career name for tree display */
  startingCareerName?: string;

  /** Available career paths */
  careerPaths: ExploredCareerPath[];

  /** Future simulation scenarios */
  futureScenarios: FutureScenario[];

  /** Optimal decision for reference */
  optimalDecision: OptimalDecision;

  /** Utility profile */
  utilityProfile: {
    weights: Record<string, number>;
  };

  /** Tree configuration */
  config?: Partial<DecisionTreeEngineConfig>;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Decision Tree Engine.
 */
export interface DecisionTreeEngineConfig {
  /** Maximum tree depth */
  maxDepth: number;

  /** Maximum branches per node */
  maxBranches: number;

  /** Minimum probability to include chance branch */
  minProbability: number;

  /** Utility weight in composite score */
  utilityWeight: number;

  /** Regret weight in composite score */
  regretWeight: number;

  /** Optionality weight in composite score */
  optionalityWeight: number;

  /** Risk weight in composite score (negative) */
  riskWeight: number;

  /** Discount rate for future utility */
  discountRate: number;

  /** Enable detailed explanations */
  enableExplanations: boolean;

  /** Threshold for critical decision point */
  criticalPointThreshold: number;

  /** Number of alternative paths to include */
  alternativePathCount: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DECISION_TREE_CONFIG: DecisionTreeEngineConfig = {
  maxDepth: 5,
  maxBranches: 4,
  minProbability: 0.1,
  utilityWeight: 0.35,
  regretWeight: 0.20,
  optionalityWeight: 0.25,
  riskWeight: -0.20,
  discountRate: 0.05,
  enableExplanations: true,
  criticalPointThreshold: 0.7,
  alternativePathCount: 3,
};

// ============================================================================
// EXPLANATION
// ============================================================================

/**
 * Explanation for a decision tree recommendation.
 */
export interface DecisionTreeExplanation {
  /** One-line summary */
  summary: string;

  /** Detailed explanation */
  detailedExplanation: string;

  /** Why this path is recommended */
  recommendationReasoning: string[];

  /** Path comparisons */
  comparisons: Array<{
    pathName: string;
    vsPathName: string;
    reasoning: string;
  }>;

  /** Critical points explanation */
  criticalPointsExplanation: Array<{
    point: string;
    recommendation: string;
    reasoning: string;
  }>;

  /** Branch explanations */
  branchExplanations: Array<{
    branch: string;
    attractiveness: string;
    risks: string;
  }>;

  /** Confidence in recommendation */
  confidence: number;
}

// ============================================================================
// GENERATOR RESULTS
// ============================================================================

/**
 * Result from tree generation.
 */
export interface TreeGenerationResult {
  /** Generated tree */
  tree: DecisionTree;

  /** Root node */
  rootNode: DecisionTreeNode;

  /** All terminal nodes */
  terminalNodes: DecisionTreeNode[];

  /** All paths from root to terminal */
  paths: Array<{
    nodeIds: string[];
    edgeIds: string[];
    probability: number;
  }>;
}
