/**
 * CareerOS Meta-Decision Intelligence Engine - Types
 *
 * Type definitions for evaluating the quality of decisions themselves.
 */

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for meta-decision analyses.
 */
export type MetaDecisionId = string;

/**
 * Decision state enumeration.
 */
export enum DecisionState {
  NOT_READY = 'NOT_READY',
  EXPLORING = 'EXPLORING',
  PARTIALLY_READY = 'PARTIALLY_READY',
  READY = 'READY',
  HIGH_CONFIDENCE_READY = 'HIGH_CONFIDENCE_READY',
}

/**
 * Decision timing recommendation.
 */
export type DecisionTiming =
  | 'decide_now'
  | 'delay'
  | 'explore'
  | 'experiment'
  | 'gather_evidence';

/**
 * Decision quality level.
 */
export type DecisionQualityLevel =
  | 'very_low'
  | 'low'
  | 'moderate'
  | 'good'
  | 'excellent';

/**
 * Uncertainty level.
 */
export type UncertaintyLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'extreme';

// ============================================================================
// DECISION READINESS ANALYSIS
// ============================================================================

/**
 * Analysis of decision readiness.
 */
export interface DecisionReadinessAnalysis {
  /** Overall readiness score (0-100) */
  readinessScore: number;

  /** Decision state */
  state: DecisionState;

  /** Confidence in readiness assessment (0-100) */
  confidence: number;

  /** Decision quality score (0-100) */
  decisionQuality: number;

  /** Uncertainty level (0-100) */
  uncertaintyLevel: number;

  /** Recommendation */
  recommendation: DecisionTiming;

  /** Human-readable explanation */
  explanation: string[];

  /** Component scores */
  components: {
    studentUnderstanding: number;
    identityStability: number;
    valueStability: number;
    utilityConfidence: number;
    informationCompleteness: number;
    marketConfidence: number;
    futureSimulationConfidence: number;
  };
}

// ============================================================================
// DECISION QUALITY
// ============================================================================

/**
 * Analysis of decision quality.
 */
export interface DecisionQualityAnalysis {
  /** Overall quality score (0-100) */
  overallQuality: number;

  /** Quality level */
  qualityLevel: DecisionQualityLevel;

  /** Component scores */
  components: {
    /** Quality of information used (0-100) */
    informationQuality: number;

    /** Quality of reasoning (0-100) */
    reasoningQuality: number;

    /** Quality of evidence (0-100) */
    evidenceQuality: number;

    /** Bias influence (0-100, lower is better) */
    biasInfluence: number;

    /** Uncertainty level (0-100, lower is better) */
    uncertainty: number;
  };

  /** Information quality breakdown */
  informationQuality: {
    relevance: number;
    completeness: number;
    accuracy: number;
    timeliness: number;
  };

  /** Reasoning quality breakdown */
  reasoningQuality: {
    logicalConsistency: number;
    evidenceAlignment: number;
    alternativesConsidered: number;
    tradeoffsEvaluated: number;
  };

  /** Evidence quality breakdown */
  evidenceQuality: {
    sourceReliability: number;
    sampleSize: number;
    recency: number;
    diversity: number;
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// DECISION TIMING
// ============================================================================

/**
 * Analysis of optimal decision timing.
 */
export interface DecisionTimingAnalysis {
  /** Recommended timing */
  recommendation: DecisionTiming;

  /** Confidence in recommendation (0-100) */
  confidence: number;

  /** Urgency level (0-100) */
  urgency: number;

  /** Cost of delaying */
  delayCost: {
    financial: number;
    opportunity: number;
    psychological: number;
  };

  /** Cost of deciding now */
  decideNowCost: {
    regretRisk: number;
    informationGap: number;
    reversalDifficulty: number;
  };

  /** Factors supporting each option */
  supportingFactors: {
    decideNow: string[];
    delay: string[];
    explore: string[];
    experiment: string[];
    gatherEvidence: string[];
  };

  /** Timeline recommendation */
  timeline: {
    minimumDelay: number; // days
    optimalDelay: number; // days
    maximumDelay: number; // days
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// COMMITMENT READINESS
// ============================================================================

/**
 * Analysis of commitment readiness.
 */
export interface CommitmentReadinessAnalysis {
  /** Whether commitment is appropriate */
  isAppropriate: boolean;

  /** Readiness score (0-100) */
  readinessScore: number;

  /** Confidence level (0-100) */
  confidence: number;

  /** Factors supporting commitment */
  supportingFactors: string[];

  /** Factors opposing commitment */
  opposingFactors: string[];

  /** Risk assessment */
  risks: {
    reversalCost: number;
    regretProbability: number;
    opportunityCost: number;
  };

  /** Prerequisites for commitment */
  prerequisites: Array<{
    requirement: string;
    satisfied: boolean;
    importance: 'critical' | 'important' | 'helpful';
  }>;

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// DECISION FRAGILITY
// ============================================================================

/**
 * Analysis of decision fragility.
 */
export interface DecisionFragilityAnalysis {
  /** Fragility score (0-100, higher = more fragile) */
  fragilityScore: number;

  /** Fragility level */
  fragilityLevel: 'robust' | 'stable' | 'sensitive' | 'fragile' | 'volatile';

  /** Sensitivity to new information */
  informationSensitivity: {
    score: number;
    highImpactAreas: string[];
  };

  /** Sensitivity to value changes */
  valueSensitivity: {
    score: number;
    unstableValues: string[];
  };

  /** Sensitivity to market changes */
  marketSensitivity: {
    score: number;
    vulnerableAreas: string[];
  };

  /** Key uncertainties */
  keyUncertainties: Array<{
    factor: string;
    impact: number;
    reducible: boolean;
  }>;

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// DECISION ROBUSTNESS
// ============================================================================

/**
 * Analysis of decision robustness.
 */
export interface DecisionRobustnessAnalysis {
  /** Robustness score (0-100) */
  robustnessScore: number;

  /** Robustness level */
  robustnessLevel: 'weak' | 'moderate' | 'strong' | 'very_strong';

  /** Scenario analysis results */
  scenarioResults: Array<{
    scenario: string;
    recommendationHolds: boolean;
    confidence: number;
  }>;

  /** Cross-scenario stability */
  crossScenarioStability: {
    consistency: number;
    bestCaseOutcome: number;
    worstCaseOutcome: number;
    expectedOutcome: number;
  };

  /** Stress test results */
  stressTests: Array<{
    condition: string;
    passes: boolean;
    impact: number;
  }>;

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// META-DECISION ANALYSIS
// ============================================================================

/**
 * Complete meta-decision analysis.
 */
export interface MetaDecisionAnalysis {
  /** Unique identifier */
  id: MetaDecisionId;

  /** Timestamp */
  timestamp: number;

  /** Student ID */
  studentId: string;

  /** Decision being analyzed */
  decisionId: string;

  /** Decision context */
  context: {
    careerOptions: string[];
    decisionType: 'initial' | 'transition' | 'specialization' | 'commitment';
    timePressure: 'none' | 'low' | 'moderate' | 'high';
  };

  /** Decision readiness analysis */
  readiness: DecisionReadinessAnalysis;

  /** Decision quality analysis */
  quality: DecisionQualityAnalysis;

  /** Decision timing analysis */
  timing: DecisionTimingAnalysis;

  /** Commitment readiness analysis */
  commitment: CommitmentReadinessAnalysis;

  /** Decision fragility analysis */
  fragility: DecisionFragilityAnalysis;

  /** Decision robustness analysis */
  robustness: DecisionRobustnessAnalysis;

  /** Recommended next action */
  recommendedAction: {
    action: DecisionTiming;
    priority: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string[];
    steps: string[];
  };

  /** Narrative explanation */
  narrative: {
    summary: string;
    qualityExplanation: string[];
    readinessExplanation: string[];
    recommendationExplanation: string[];
  };

  /** Confidence in overall analysis */
  overallConfidence: number;
}

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Input for meta-decision analysis.
 */
export interface MetaDecisionInput {
  /** Student ID */
  studentId: string;

  /** Decision ID */
  decisionId: string;

  /** Student beliefs */
  studentBeliefs: {
    identityStability: number;
    valueStability: number;
    understandingLevel: number;
  };

  /** Utility analysis results */
  utilityConfidence: {
    overall: number;
    byCareer: Record<string, number>;
  };

  /** Uncertainty profile */
  uncertainty: {
    overall: number;
    informationGaps: string[];
    unknownFactors: string[];
  };

  /** Bias analysis */
  biasProfile: {
    overallBias: number;
    dominantBiases: string[];
  };

  /** Information completeness */
  informationCompleteness: {
    careerData: number;
    personalFit: number;
    marketData: number;
    outcomeData: number;
  };

  /** Decision intelligence results */
  decisionIntelligence: {
    recommendation: string;
    confidence: number;
    alternatives: string[];
  };

  /** Configuration */
  config?: Partial<MetaDecisionConfig>;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Meta-Decision Engine.
 */
export interface MetaDecisionConfig {
  /** Thresholds for readiness states */
  readinessThresholds: {
    notReady: number;
    exploring: number;
    partiallyReady: number;
    ready: number;
    highConfidenceReady: number;
  };

  /** Weights for readiness components */
  readinessWeights: {
    studentUnderstanding: number;
    identityStability: number;
    valueStability: number;
    utilityConfidence: number;
    informationCompleteness: number;
    marketConfidence: number;
    futureSimulationConfidence: number;
  };

  /** Weights for quality components */
  qualityWeights: {
    informationQuality: number;
    reasoningQuality: number;
    evidenceQuality: number;
    biasInfluence: number;
    uncertainty: number;
  };

  /** Fragility thresholds */
  fragilityThresholds: {
    robust: number;
    stable: number;
    sensitive: number;
    fragile: number;
  };

  /** Minimum confidence for commitment */
  minCommitmentConfidence: number;

  /** Maximum acceptable bias */
  maxAcceptableBias: number;

  /** Minimum information completeness */
  minInformationCompleteness: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_META_DECISION_CONFIG: MetaDecisionConfig = {
  readinessThresholds: {
    notReady: 30,
    exploring: 45,
    partiallyReady: 60,
    ready: 75,
    highConfidenceReady: 90,
  },
  readinessWeights: {
    studentUnderstanding: 0.15,
    identityStability: 0.15,
    valueStability: 0.15,
    utilityConfidence: 0.15,
    informationCompleteness: 0.15,
    marketConfidence: 0.15,
    futureSimulationConfidence: 0.1,
  },
  qualityWeights: {
    informationQuality: 0.25,
    reasoningQuality: 0.25,
    evidenceQuality: 0.2,
    biasInfluence: 0.15,
    uncertainty: 0.15,
  },
  fragilityThresholds: {
    robust: 20,
    stable: 40,
    sensitive: 60,
    fragile: 80,
  },
  minCommitmentConfidence: 70,
  maxAcceptableBias: 50,
  minInformationCompleteness: 60,
};
