/**
 * Market-Aware Decision Engine - Types
 *
 * Core type definitions for integrating market intelligence into
 * career recommendations while preserving decision quality principles.
 *
 * ## CareerOS Philosophy
 *
 * Market intelligence should REFINE decisions, not DOMINATE them.
 *
 * Primary Factors (Never Overridden):
 *   - Psychological Fit
 *   - Utility Alignment
 *   - Identity Congruence
 *   - Satisfaction Potential
 *   - Optionality Preservation
 *
 * Market Factors (Adjusting Influence):
 *   - Market Opportunity
 *   - Trend Momentum
 *   - Risk Exposure
 *
 * ## Design Principle
 *
 * A high-demand career with low fit must NEVER become a top recommendation.
 * A strong-fit career with declining market should have adjusted confidence,
 * not eliminated from consideration.
 */

import type {
  MarketIntelligenceReport,
  MarketTrend,
  MarketOpportunity,
  MarketRisk,
  ConfidenceScore,
} from '@/intelligence/market-signal-intelligence/types.js';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

export type DecisionId = string;
export type RecommendationId = string;
export type Timestamp = number;

// ============================================================================
// IMPORTANCE LEVELS
// ============================================================================

/**
 * Importance levels for decision factors.
 */
export type ImportanceLevel = 'highest' | 'high' | 'moderate' | 'low' | 'minimal';

/**
 * Factor importance weights (internal calculation).
 */
export const IMPORTANCE_WEIGHTS: Record<ImportanceLevel, number> = {
  highest: 1.0,
  high: 0.8,
  moderate: 0.5,
  low: 0.3,
  minimal: 0.1,
};

// ============================================================================
// MARKET INFLUENCE POLICY
// ============================================================================

/**
 * Policy for how market factors influence decisions.
 *
 * Defines the relative importance of decision quality factors
 * versus market intelligence factors.
 */
export interface MarketInfluencePolicy {
  /** Policy version identifier */
  version: string;

  /** When the policy was created */
  createdAt: Timestamp;

  /** Primary decision quality factors - NEVER overridden by market */
  primaryFactors: {
    psychologicalFit: ImportanceLevel;
    utilityAlignment: ImportanceLevel;
    optionality: ImportanceLevel;
    regretRisk: ImportanceLevel;
    satisfactionPotential: ImportanceLevel;
    identityCongruence: ImportanceLevel;
  };

  /** Market factors - adjusting influence only */
  marketFactors: {
    marketOpportunity: ImportanceLevel;
    trendMomentum: ImportanceLevel;
    riskExposure: ImportanceLevel;
    futureOutlook: ImportanceLevel;
  };

  /** Protection thresholds */
  protection: {
    /** Minimum fit score required regardless of market (0-100) */
    minimumFitThreshold: number;

    /** Maximum market boost allowed (percentage) */
    maxMarketBoost: number;

    /** Maximum market penalty allowed (percentage) */
    maxMarketPenalty: number;

    /** Whether to override recommendations based solely on market trends */
    allowTrendChasing: boolean;

    /** Stability window - minimum time between recommendation changes (ms) */
    stabilityWindowMs: number;
  };
}

/**
 * Default CareerOS market influence policy.
 *
 * Prioritizes fit and utility over market conditions.
 */
export const DEFAULT_MARKET_INFLUENCE_POLICY: MarketInfluencePolicy = {
  version: '1.0.0',
  createdAt: Date.now(),
  primaryFactors: {
    psychologicalFit: 'highest',
    utilityAlignment: 'highest',
    optionality: 'high',
    regretRisk: 'high',
    satisfactionPotential: 'high',
    identityCongruence: 'high',
  },
  marketFactors: {
    marketOpportunity: 'moderate',
    trendMomentum: 'moderate',
    riskExposure: 'high',
    futureOutlook: 'moderate',
  },
  protection: {
    minimumFitThreshold: 60,
    maxMarketBoost: 15, // Max 15% boost from market
    maxMarketPenalty: 25, // Max 25% penalty from market
    allowTrendChasing: false,
    stabilityWindowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// ============================================================================
// INPUTS
// ============================================================================

/**
 * Decision intelligence result (from Decision Intelligence Engine).
 */
export interface DecisionIntelligenceResult {
  decisionId: DecisionId;
  recommendationId: RecommendationId;

  /** Fit assessment (0-100) */
  fit: {
    psychological: number;
    skills: number;
    values: number;
    overall: number;
  };

  /** Utility analysis (0-100) */
  utility: {
    shortTerm: number;
    longTerm: number;
    aligned: number;
  };

  /** Optionality score (0-100) */
  optionality: number;

  /** Regret risk (0-100, lower is better) */
  regretRisk: number;

  /** Satisfaction potential (0-100) */
  satisfactionPotential: number;

  /** Identity congruence (0-100) */
  identityCongruence: number;

  /** Original recommendation score (0-100) */
  originalScore: number;

  /** Whether this is on the Pareto frontier */
  isParetoOptimal: boolean;
}

/**
 * Outcome learning signal (from Outcome Learning Architecture).
 */
export interface OutcomeLearningSignal {
  entityId: string;
  entityType: 'career' | 'path' | 'decision';

  /** Historical success rate (0-1) */
  successRate: number;

  /** Historical satisfaction rate (0-1) */
  satisfactionRate: number;

  /** Number of observations */
  sampleSize: number;

  /** Confidence in the signal (0-1) */
  confidence: ConfidenceScore;

  /** Last updated */
  lastUpdated: Timestamp;
}

// ============================================================================
// MARKET ADJUSTMENT
// ============================================================================

/**
 * Market adjustment analysis for a recommendation.
 */
export interface MarketAdjustmentAnalysis {
  /** Unique identifier */
  id: string;

  /** Recommendation being analyzed */
  recommendationId: RecommendationId;

  /** Original recommendation score (0-100) */
  originalScore: number;

  /** Market adjustment amount (-25 to +15) */
  marketAdjustment: number;

  /** Final adjusted score (0-100) */
  adjustedScore: number;

  /** Detailed reasoning for the adjustment */
  adjustmentReasoning: string[];

  /** Confidence in the adjustment (0-1) */
  confidence: ConfidenceScore;

  /** Breakdown of adjustment components */
  components: {
    demandAdjustment: number;
    salaryAdjustment: number;
    competitionAdjustment: number;
    automationAdjustment: number;
    outlookAdjustment: number;
    regionalAdjustment: number;
  };

  /** When the analysis was performed */
  analyzedAt: Timestamp;
}

/**
 * Market adjustment factors.
 */
export interface MarketAdjustmentFactors {
  /** Current demand level (0-1) */
  demand: number;

  /** Salary growth rate (annual) */
  salaryGrowth: number;

  /** Competition level (0-1, lower is better) */
  competition: number;

  /** Automation risk (0-1, lower is better) */
  automationRisk: number;

  /** Industry outlook (0-1) */
  industryOutlook: number;

  /** Regional opportunity (0-1) */
  regionalOpportunity: number;
}

// ============================================================================
// OVERRIDE PROTECTION
// ============================================================================

/**
 * Override protection decision.
 */
export interface OverrideProtectionDecision {
  /** Whether the recommendation is protected from market override */
  isProtected: boolean;

  /** Reason for protection decision */
  reason: string;

  /** Protected factors that would be violated */
  protectedFactors: Array<{
    factor: string;
    score: number;
    threshold: number;
    violation: string;
  }>;

  /** What the market boost would have been if not protected */
  wouldBeBoost: number;

  /** Confidence in protection decision */
  confidence: ConfidenceScore;
}

/**
 * Trend chasing detection result.
 */
export interface TrendChasingDetection {
  /** Whether trend chasing is detected */
  isTrendChasing: boolean;

  /** Trend chasing risk score (0-100) */
  riskScore: number;

  /** Indicators of trend chasing */
  indicators: string[];

  /** Recommended action */
  recommendation: 'allow' | 'warn' | 'block';
}

// ============================================================================
// RISK ADJUSTMENT
// ============================================================================

/**
 * Market risk adjustment for a recommendation.
 */
export interface MarketRiskAdjustment {
  /** Recommendation being adjusted */
  recommendationId: RecommendationId;

  /** Whether risk adjustment was applied */
  wasAdjusted: boolean;

  /** Original confidence (0-1) */
  originalConfidence: number;

  /** Adjusted confidence (0-1) */
  adjustedConfidence: number;

  /** Confidence adjustment amount */
  confidenceAdjustment: number;

  /** Risks that triggered adjustment */
  triggeringRisks: Array<{
    riskType: string;
    level: string;
    impact: number;
  }>;

  /** Whether recommendation identity was preserved */
  identityPreserved: boolean;

  /** Explanation of the adjustment */
  explanation: string[];
}

// ============================================================================
// OPPORTUNITY BOOST
// ============================================================================

/**
 * Market opportunity boost for a recommendation.
 */
export interface MarketOpportunityBoost {
  /** Recommendation being boosted */
  recommendationId: RecommendationId;

  /** Whether boost was applied */
  wasBoosted: boolean;

  /** Original confidence (0-1) */
  originalConfidence: number;

  /** Boosted confidence (0-1) */
  boostedConfidence: number;

  /** Confidence boost amount */
  confidenceBoost: number;

  /** Opportunity factors that triggered boost */
  opportunityFactors: Array<{
    factor: string;
    score: number;
    contribution: number;
  }>;

  /** Whether boost violated any protection rules */
  withinLimits: boolean;

  /** Explanation of the boost */
  explanation: string[];
}

// ============================================================================
// STABILITY
// ============================================================================

/**
 * Recommendation stability record.
 */
export interface StabilityRecord {
  /** Recommendation identifier */
  recommendationId: RecommendationId;

  /** Decision identifier */
  decisionId: DecisionId;

  /** When the recommendation was first made */
  firstRecommendedAt: Timestamp;

  /** When the recommendation was last updated */
  lastUpdatedAt: Timestamp;

  /** Number of times the recommendation has changed */
  changeCount: number;

  /** History of scores */
  scoreHistory: Array<{
    timestamp: Timestamp;
    score: number;
    reason: string;
  }>;

  /** Whether the recommendation is currently stable */
  isStable: boolean;

  /** Volatility score (0-100, lower is more stable) */
  volatilityScore: number;
}

/**
 * Stability assessment result.
 */
export interface StabilityAssessment {
  /** Recommendation identifier */
  recommendationId: RecommendationId;

  /** Whether the recommendation should be updated */
  shouldUpdate: boolean;

  /** Reason for stability decision */
  reason: string;

  /** Minimum time before next update allowed */
  nextUpdateAllowedAt: Timestamp;

  /** Stability metrics */
  metrics: {
    daysSinceLastChange: number;
    scoreVariance: number;
    trendDirection: 'improving' | 'declining' | 'stable';
  };
}

// ============================================================================
// DECISION NARRATIVE
// ============================================================================

/**
 * Market-aware decision narrative.
 */
export interface MarketAwareDecisionNarrative {
  /** Unique identifier */
  id: string;

  /** Decision identifier */
  decisionId: DecisionId;

  /** Recommendation identifier */
  recommendationId: RecommendationId;

  /** One-line summary */
  summary: string;

  /** Primary reasoning (fit, utility, etc.) */
  primaryReasoning: string[];

  /** Market context (supporting role) */
  marketContext: string[];

  /** Confidence statement */
  confidenceStatement: string;

  /** Caveats or warnings */
  caveats: string[];

  /** Generated at */
  generatedAt: Timestamp;
}

// ============================================================================
// OUTPUTS
// ============================================================================

/**
 * Market-aware recommendation.
 */
export interface MarketAwareRecommendation {
  /** Unique identifier */
  id: string;

  /** Decision identifier */
  decisionId: DecisionId;

  /** Recommendation identifier */
  recommendationId: RecommendationId;

  /** Entity being recommended */
  entityId: string;
  entityType: 'career' | 'skill' | 'path' | 'education';
  entityName: string;

  /** Original decision intelligence result */
  originalDecision: DecisionIntelligenceResult;

  /** Market intelligence report */
  marketIntelligence: MarketIntelligenceReport;

  /** Market adjustment analysis */
  marketAdjustment: MarketAdjustmentAnalysis;

  /** Override protection decision */
  overrideProtection: OverrideProtectionDecision;

  /** Risk adjustment (if applied) */
  riskAdjustment?: MarketRiskAdjustment;

  /** Opportunity boost (if applied) */
  opportunityBoost?: MarketOpportunityBoost;

  /** Stability record */
  stability: StabilityRecord;

  /** Final scores */
  scores: {
    original: number;
    marketAdjusted: number;
    final: number;
  };

  /** Final confidence */
  confidence: ConfidenceScore;

  /** Ranking position */
  rank: number;

  /** Whether this is a top recommendation */
  isTopRecommendation: boolean;

  /** Narrative explanation */
  narrative: MarketAwareDecisionNarrative;

  /** Generated at */
  generatedAt: Timestamp;
}

/**
 * Market-aware decision result.
 */
export interface MarketAwareDecisionResult {
  /** Unique identifier */
  id: string;

  /** Decision identifier */
  decisionId: DecisionId;

  /** All recommendations with market awareness */
  recommendations: MarketAwareRecommendation[];

  /** Top recommendations (filtered and ranked) */
  topRecommendations: MarketAwareRecommendation[];

  /** Market influence summary */
  marketInfluence: {
    averageAdjustment: number;
    boostsApplied: number;
    penaltiesApplied: number;
    protectionsTriggered: number;
  };

  /** Decision quality preserved */
  decisionQualityPreserved: boolean;

  /** Generated at */
  generatedAt: Timestamp;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Market adjustment calculator configuration.
 */
export interface MarketAdjustmentCalculatorConfig {
  /** Weight for demand factor */
  demandWeight: number;

  /** Weight for salary growth factor */
  salaryWeight: number;

  /** Weight for competition factor */
  competitionWeight: number;

  /** Weight for automation risk factor */
  automationWeight: number;

  /** Weight for industry outlook factor */
  outlookWeight: number;

  /** Weight for regional opportunity factor */
  regionalWeight: number;

  /** Minimum market data points required */
  minDataPoints: number;

  /** Maximum adjustment magnitude */
  maxAdjustment: number;
}

/**
 * Override protection configuration.
 */
export interface OverrideProtectionConfig {
  /** Minimum fit score required */
  minimumFitScore: number;

  /** Minimum utility alignment required */
  minimumUtilityScore: number;

  /** Maximum market influence allowed (0-1) */
  maxMarketInfluence: number;

  /** Whether to block high-fit/low-market recommendations from being demoted */
  protectHighFitRecommendations: boolean;

  /** Fit threshold for high-fit protection */
  highFitThreshold: number;
}

/**
 * Stability engine configuration.
 */
export interface StabilityEngineConfig {
  /** Minimum stability window (ms) */
  stabilityWindowMs: number;

  /** Score change threshold to trigger update */
  scoreChangeThreshold: number;

  /** Maximum allowed volatility score */
  maxVolatilityScore: number;

  /** Whether to allow emergency updates */
  allowEmergencyUpdates: boolean;

  /** Emergency update threshold (market crash, etc.) */
  emergencyThreshold: number;
}

/**
 * Decision narrative configuration.
 */
export interface NarrativeGeneratorConfig {
  /** Maximum length of primary reasoning */
  maxPrimaryPoints: number;

  /** Maximum length of market context */
  maxMarketPoints: number;

  /** Whether to include confidence metrics */
  includeConfidenceMetrics: boolean;

  /** Tone of narrative */
  tone: 'professional' | 'supportive' | 'direct';
}

/**
 * Complete market-aware decision engine configuration.
 */
export interface MarketAwareDecisionEngineConfig {
  /** Market influence policy */
  policy: MarketInfluencePolicy;

  /** Adjustment calculator config */
  adjustmentCalculator: MarketAdjustmentCalculatorConfig;

  /** Override protection config */
  overrideProtection: OverrideProtectionConfig;

  /** Stability engine config */
  stability: StabilityEngineConfig;

  /** Narrative generator config */
  narrative: NarrativeGeneratorConfig;

  /** Whether to enable debug logging */
  debug: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG: MarketAdjustmentCalculatorConfig = {
  demandWeight: 0.25,
  salaryWeight: 0.2,
  competitionWeight: 0.2,
  automationWeight: 0.15,
  outlookWeight: 0.1,
  regionalWeight: 0.1,
  minDataPoints: 3,
  maxAdjustment: 15,
};

export const DEFAULT_OVERRIDE_PROTECTION_CONFIG: OverrideProtectionConfig = {
  minimumFitScore: 60,
  minimumUtilityScore: 60,
  maxMarketInfluence: 0.3,
  protectHighFitRecommendations: true,
  highFitThreshold: 80,
};

export const DEFAULT_STABILITY_ENGINE_CONFIG: StabilityEngineConfig = {
  stabilityWindowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  scoreChangeThreshold: 10,
  maxVolatilityScore: 30,
  allowEmergencyUpdates: true,
  emergencyThreshold: 0.3, // 30% market crash
};

export const DEFAULT_NARRATIVE_GENERATOR_CONFIG: NarrativeGeneratorConfig = {
  maxPrimaryPoints: 4,
  maxMarketPoints: 2,
  includeConfidenceMetrics: true,
  tone: 'supportive',
};

export const DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG: MarketAwareDecisionEngineConfig = {
  policy: DEFAULT_MARKET_INFLUENCE_POLICY,
  adjustmentCalculator: DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG,
  overrideProtection: DEFAULT_OVERRIDE_PROTECTION_CONFIG,
  stability: DEFAULT_STABILITY_ENGINE_CONFIG,
  narrative: DEFAULT_NARRATIVE_GENERATOR_CONFIG,
  debug: false,
};
