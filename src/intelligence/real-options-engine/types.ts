/**
 * CareerOS Real Options Theory Engine - Types
 *
 * Type definitions for evaluating career decisions based on
 * the value of preserving future opportunities.
 */

import type {
  OptionalityAnalysis,
} from '../optionality-engine';

import type {
  CriticalityAnalysis,
} from '../criticality-engine';

import type {
  CareerTransitionEdge,
} from '../career-graph-v2';

import type {
  FutureContext,
} from '../future-explorer';

// ============================================================================
// CORE PRIMITIVE TYPES
// ============================================================================

/**
 * Unique identifier for real options analyses.
 */
export type RealOptionsId = string;

/**
 * Career identifier.
 */
export type CareerId = string;

/**
 * Real options score (0-100).
 */
export type RealOptionsScore = number;

/**
 * Commitment level classification.
 */
export type CommitmentLevel = 'low' | 'moderate' | 'high' | 'extreme';

/**
 * Lock-in type classification.
 */
export type LockInType = 'education' | 'credential' | 'specialization' | 'financial' | 'geographic' | 'time';

/**
 * Option value rating.
 */
export type OptionValueRating = 'exceptional' | 'high' | 'moderate' | 'low' | 'minimal';

// ============================================================================
// CAREER OPTION
// ============================================================================

/**
 * Represents a career option with its real options value components.
 */
export interface CareerOption {
  /** Career identifier */
  careerId: CareerId;

  /** Career name */
  careerName: string;

  /** Overall option value (0-100) */
  optionValue: RealOptionsScore;

  /** Rating of option value */
  optionValueRating: OptionValueRating;

  /** Flexibility value (0-100) */
  flexibilityValue: RealOptionsScore;

  /** Reversibility value (0-100) */
  reversibilityValue: RealOptionsScore;

  /** Future opportunity value (0-100) */
  futureOpportunityValue: RealOptionsScore;

  /** Commitment cost (0-100, higher = more costly) */
  commitmentCost: RealOptionsScore;

  /** Net option value (optionValue - commitmentCost penalty) */
  netOptionValue: RealOptionsScore;

  /** Human-readable explanation */
  explanation: string[];

  /** Detailed breakdown */
  breakdown: {
    /** Number of reachable futures */
    reachableFutures: number;

    /** Average quality of reachable futures */
    averageFutureQuality: number;

    /** Future utility potential */
    futureUtilityPotential: number;

    /** Ease of pivoting (0-100) */
    pivotingEase: number;

    /** Transferable skills score */
    transferableSkillsScore: number;

    /** Career mobility score */
    careerMobilityScore: number;

    /** Time cost of commitment (years) */
    timeCost: number;

    /** Education lock-in score */
    educationLockIn: number;

    /** Credential lock-in score */
    credentialLockIn: number;

    /** Sunk cost exposure */
    sunkCostExposure: number;

    /** Future pathways count */
    futurePathways: number;

    /** Emerging opportunities score */
    emergingOpportunitiesScore: number;

    /** Market adaptability score */
    marketAdaptabilityScore: number;
  };
}

// ============================================================================
// OPTION VALUE CALCULATION
// ============================================================================

/**
 * Result of option value calculation.
 */
export interface OptionValueCalculation {
  /** Career identifier */
  careerId: CareerId;

  /** Total option value */
  totalValue: RealOptionsScore;

  /** Reachable futures analysis */
  reachableFutures: {
    count: number;
    careers: Array<{
      careerId: string;
      name: string;
      transitionDifficulty: number;
      utilityPotential: number;
    }>;
    diversityScore: number;
  };

  /** Quality of reachable futures */
  futureQuality: {
    averageUtility: number;
    bestCaseUtility: number;
    worstCaseUtility: number;
    variance: number;
  };

  /** Future utility potential */
  utilityPotential: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
    growthTrajectory: 'declining' | 'stable' | 'growing' | 'accelerating';
  };

  /** Market opportunities */
  marketOpportunities: {
    currentOpportunities: number;
    projectedGrowth: number;
    emergingFields: string[];
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// FLEXIBILITY CALCULATION
// ============================================================================

/**
 * Result of flexibility calculation.
 */
export interface FlexibilityCalculation {
  /** Career identifier */
  careerId: CareerId;

  /** Overall flexibility score */
  flexibilityScore: RealOptionsScore;

  /** Ease of pivoting */
  pivotingEase: {
    score: number;
    factors: string[];
    barriers: string[];
  };

  /** Transferable skills */
  transferableSkills: {
    score: number;
    skillCategories: Array<{
      category: string;
      skills: string[];
      transferability: number;
    }>;
    crossIndustryApplicability: number;
  };

  /** Career mobility */
  careerMobility: {
    score: number;
    lateralMoves: number;
    upwardMobility: number;
    crossDomainMoves: number;
  };

  /** Time to flexibility */
  timeToFlexibility: {
    months: number;
    years: number;
    phase: 'immediate' | 'early-career' | 'mid-career' | 'late-career';
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// REVERSIBILITY CALCULATION
// ============================================================================

/**
 * Result of reversibility calculation.
 */
export interface ReversibilityCalculation {
  /** Career identifier */
  careerId: CareerId;

  /** Overall reversibility score */
  reversibilityScore: RealOptionsScore;

  /** Time cost analysis */
  timeCost: {
    yearsInvested: number;
    recoveryTime: number;
    opportunityCost: number;
  };

  /** Education lock-in */
  educationLockIn: {
    score: number;
    yearsRequired: number;
    specializationLevel: 'none' | 'minor' | 'moderate' | 'high' | 'extreme';
    alternativePaths: string[];
  };

  /** Credential lock-in */
  credentialLockIn: {
    score: number;
    requiredCredentials: string[];
    transferability: number;
    maintenanceRequirements: string[];
  };

  /** Sunk cost analysis */
  sunkCost: {
    financial: number;
    time: number;
    effort: number;
    recoverable: number;
  };

  /** Switching difficulty */
  switchingDifficulty: {
    overall: number;
    financialBarrier: number;
    timeBarrier: number;
    skillBarrier: number;
    networkBarrier: number;
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// FUTURE OPPORTUNITY CALCULATION
// ============================================================================

/**
 * Result of future opportunity calculation.
 */
export interface FutureOpportunityCalculation {
  /** Career identifier */
  careerId: CareerId;

  /** Overall future opportunity score */
  opportunityScore: RealOptionsScore;

  /** Future pathways */
  futurePathways: {
    count: number;
    pathways: Array<{
      name: string;
      probability: number;
      utility: number;
      timeToReach: number;
    }>;
    diversification: number;
  };

  /** Emerging opportunities */
  emergingOpportunities: {
    score: number;
    opportunities: Array<{
      field: string;
      growthRate: number;
      relevance: number;
    }>;
    trendAlignment: number;
  };

  /** Market adaptability */
  marketAdaptability: {
    score: number;
    factors: string[];
    resilienceToAutomation: number;
    resilienceToOutsourcing: number;
    crossIndustryPortability: number;
  };

  /** Technology exposure */
  technologyExposure: {
    current: number;
    projected: number;
    emergingTech: string[];
  };

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// COMMITMENT COST
// ============================================================================

/**
 * Result of commitment cost calculation.
 */
export interface CommitmentCostCalculation {
  /** Career identifier */
  careerId: CareerId;

  /** Overall commitment cost */
  totalCost: RealOptionsScore;

  /** Commitment level */
  commitmentLevel: CommitmentLevel;

  /** Years invested */
  yearsInvested: {
    education: number;
    training: number;
    experience: number;
    total: number;
  };

  /** Money invested */
  moneyInvested: {
    education: number;
    training: number;
    credentials: number;
    total: number;
  };

  /** Specialization intensity */
  specializationIntensity: {
    score: number;
    depth: 'generalist' | 'broad' | 'focused' | 'deep' | 'expert';
    breadth: number;
    transferability: number;
  };

  /** Switching difficulty components */
  switchingDifficulty: {
    overall: RealOptionsScore;
    financial: RealOptionsScore;
    temporal: RealOptionsScore;
    psychological: RealOptionsScore;
    social: RealOptionsScore;
  };

  /** Lock-in effects */
  lockInEffects: Array<{
    type: LockInType;
    severity: 'low' | 'moderate' | 'high' | 'severe';
    description: string;
  }>;

  /** Explanation */
  explanation: string[];
}

// ============================================================================
// REAL OPTIONS ANALYSIS
// ============================================================================

/**
 * Complete real options analysis for a career.
 */
export interface RealOptionsAnalysis {
  /** Unique identifier */
  id: RealOptionsId;

  /** Timestamp */
  timestamp: number;

  /** Student reference */
  studentId: string;

  /** Career analyzed */
  careerId: CareerId;

  /** Career name */
  careerName: string;

  /** Option value */
  optionValue: RealOptionsScore;

  /** Commitment cost */
  commitmentCost: RealOptionsScore;

  /** Net option value */
  netOptionValue: RealOptionsScore;

  /** Future flexibility */
  futureFlexibility: RealOptionsScore;

  /** Reversibility */
  reversibility: RealOptionsScore;

  /** Detailed calculations */
  calculations: {
    optionValue: OptionValueCalculation;
    flexibility: FlexibilityCalculation;
    reversibility: ReversibilityCalculation;
    futureOpportunities: FutureOpportunityCalculation;
    commitmentCost: CommitmentCostCalculation;
  };

  /** Component scores */
  components: {
    reachableFutures: number;
    futureQuality: number;
    pivotingEase: number;
    transferableSkills: number;
    careerMobility: number;
    timeReversibility: number;
    educationLockIn: number;
    credentialLockIn: number;
    futurePathways: number;
    emergingOpportunities: number;
    marketAdaptability: number;
    specializationIntensity: number;
    switchingDifficulty: number;
  };

  /** Comparisons to other careers */
  comparisons?: Array<{
    careerId: CareerId;
    careerName: string;
    optionValueDiff: number;
    commitmentCostDiff: number;
    netAdvantage: number;
  }>;

  /** Recommendations */
  recommendations: {
    preserveOptionality: boolean;
    strategy: 'maximize-options' | 'strategic-commitment' | 'selective-focus' | 'deep-specialization';
    reasoning: string[];
    actions: string[];
  };

  /** Narrative explanation */
  narrative: {
    summary: string;
    optionValueExplanation: string[];
    commitmentCostExplanation: string[];
    tradeOffExplanation: string[];
    recommendationExplanation: string[];
  };

  /** Confidence in analysis */
  confidence: number;
}

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Input for real options analysis.
 */
export interface RealOptionsInput {
  /** Student ID */
  studentId: string;

  /** Career to analyze */
  careerId: CareerId;

  /** Career name */
  careerName: string;

  /** Optionality analysis (from Optionality Engine) */
  optionalityAnalysis: OptionalityAnalysis;

  /** Criticality analysis (from Criticality Engine) */
  criticalityAnalysis: CriticalityAnalysis;

  /** Career transition edges */
  transitionEdges: CareerTransitionEdge[];

  /** Future contexts */
  futureContexts: FutureContext[];

  /** Student utility profile */
  utilityProfile?: {
    weights: Record<string, number>;
  };

  /** Analysis configuration */
  config?: Partial<RealOptionsEngineConfig>;
}

/**
 * Input for comparing multiple careers.
 */
export interface RealOptionsComparisonInput {
  /** Student ID */
  studentId: string;

  /** Career analyses to compare */
  analyses: RealOptionsAnalysis[];

  /** Comparison weights */
  weights?: {
    optionValue: number;
    commitmentCost: number;
    futureFlexibility: number;
  };
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Configuration for Real Options Engine.
 */
export interface RealOptionsEngineConfig {
  /** Weight for reachable futures in option value */
  reachableFuturesWeight: number;

  /** Weight for future quality in option value */
  futureQualityWeight: number;

  /** Weight for utility potential in option value */
  utilityPotentialWeight: number;

  /** Weight for market opportunities in option value */
  marketOpportunitiesWeight: number;

  /** Weight for pivoting ease in flexibility */
  pivotingEaseWeight: number;

  /** Weight for transferable skills in flexibility */
  transferableSkillsWeight: number;

  /** Weight for career mobility in flexibility */
  careerMobilityWeight: number;

  /** Weight for time cost in reversibility */
  timeCostWeight: number;

  /** Weight for education lock-in in reversibility */
  educationLockInWeight: number;

  /** Weight for credential lock-in in reversibility */
  credentialLockInWeight: number;

  /** Weight for sunk cost in reversibility */
  sunkCostWeight: number;

  /** Weight for future pathways in opportunities */
  futurePathwaysWeight: number;

  /** Weight for emerging opportunities in opportunities */
  emergingOpportunitiesWeight: number;

  /** Weight for market adaptability in opportunities */
  marketAdaptabilityWeight: number;

  /** Weight for years invested in commitment cost */
  yearsWeight: number;

  /** Weight for money invested in commitment cost */
  moneyWeight: number;

  /** Weight for specialization in commitment cost */
  specializationWeight: number;

  /** Weight for switching difficulty in commitment cost */
  switchingDifficultyWeight: number;

  /** Time horizon for future calculations (years) */
  timeHorizon: number;

  /** Minimum utility threshold for future careers */
  minUtilityThreshold: number;

  /** Enable detailed explanations */
  enableExplanations: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_REAL_OPTIONS_CONFIG: RealOptionsEngineConfig = {
  // Option value weights
  reachableFuturesWeight: 0.30,
  futureQualityWeight: 0.25,
  utilityPotentialWeight: 0.25,
  marketOpportunitiesWeight: 0.20,

  // Flexibility weights
  pivotingEaseWeight: 0.35,
  transferableSkillsWeight: 0.35,
  careerMobilityWeight: 0.30,

  // Reversibility weights
  timeCostWeight: 0.25,
  educationLockInWeight: 0.30,
  credentialLockInWeight: 0.25,
  sunkCostWeight: 0.20,

  // Future opportunities weights
  futurePathwaysWeight: 0.35,
  emergingOpportunitiesWeight: 0.35,
  marketAdaptabilityWeight: 0.30,

  // Commitment cost weights
  yearsWeight: 0.25,
  moneyWeight: 0.25,
  specializationWeight: 0.25,
  switchingDifficultyWeight: 0.25,

  // General settings
  timeHorizon: 15,
  minUtilityThreshold: 40,
  enableExplanations: true,
};

// ============================================================================
// COMPARISON RESULTS
// ============================================================================

/**
 * Result of comparing multiple careers.
 */
export interface RealOptionsComparison {
  /** Comparison ID */
  id: RealOptionsId;

  /** Timestamp */
  timestamp: number;

  /** Student ID */
  studentId: string;

  /** Analyses compared */
  analyses: RealOptionsAnalysis[];

  /** Rankings */
  rankings: {
    byOptionValue: RealOptionsAnalysis[];
    byCommitmentCost: RealOptionsAnalysis[];
    byNetValue: RealOptionsAnalysis[];
    byFlexibility: RealOptionsAnalysis[];
  };

  /** Best by category */
  bestByCategory: {
    highestOptionValue: RealOptionsAnalysis | null;
    lowestCommitmentCost: RealOptionsAnalysis | null;
    highestNetValue: RealOptionsAnalysis | null;
    highestFlexibility: RealOptionsAnalysis | null;
    highestReversibility: RealOptionsAnalysis | null;
  };

  /** Trade-off analysis */
  tradeOffs: Array<{
    careerA: CareerId;
    careerB: CareerId;
    optionValueTradeOff: number;
    commitmentCostTradeOff: number;
    recommendation: string;
  }>;

  /** Overall recommendation */
  overallRecommendation: {
    topChoice: RealOptionsAnalysis | null;
    reasoning: string[];
    strategy: string;
  };

  /** Explanation */
  explanation: {
    summary: string;
    comparisons: string[];
    insights: string[];
  };
}
