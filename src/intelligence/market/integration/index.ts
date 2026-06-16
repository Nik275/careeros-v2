/**
 * CareerOS Market Intelligence - Market Integration Module
 *
 * Phase 1.7: Market Intelligence Integration Layer
 *
 * Connects Market Intelligence with CareerOS Decision Architecture.
 *
 * Principle: Market intelligence is a modifier, not a primary decision-maker.
 *
 * Priority Order:
 * 1. Psychological Fit
 * 2. Values Alignment
 * 3. Utility
 * 4. Optionality
 * 5. Future Resilience
 * 6. Market Intelligence (modifier)
 *
 * @module market-integration
 */

// Models
export {
  DEFAULT_SCORE_WEIGHTS,
  DEFAULT_ANALYSIS_CONFIG,
  createMarketAwareAnalysis,
  compareAnalyses,
  validateConfig,
} from './models/MarketAwareCareerAnalysis';

export type {
  MarketAwareCareerAnalysis,
  MarketAwareCareerAnalysisInput,
  ScoreWeights,
  AnalysisConfig,
} from './models/MarketAwareCareerAnalysis';

// Adjustment Engine
export {
  MarketAdjustmentEngine,
  createMarketAdjustmentEngine,
  type CareerAdjustmentFactors,
  type AdjustmentResult,
  type AdjustmentConfig,
  DEFAULT_ADJUSTMENT_CONFIG,
} from './MarketAdjustmentEngine';

// Opportunity Boost
export {
  MarketOpportunityBoost,
  createMarketOpportunityBoost,
  type BoostConfig,
  type BoostResult,
  DEFAULT_BOOST_CONFIG,
} from './MarketOpportunityBoost';

// Risk Adjustment
export {
  MarketRiskAdjustment,
  createMarketRiskAdjustment,
  type RiskAdjustmentConfig,
  type RiskAssessment,
  DEFAULT_RISK_CONFIG,
} from './MarketRiskAdjustment';

// Narrative Engine
export {
  MarketNarrativeEngine,
  createMarketNarrativeEngine,
  type NarrativeConfig,
  type MarketNarrative,
  DEFAULT_NARRATIVE_CONFIG,
} from './MarketNarrativeEngine';

// Recommendation Audit
export {
  MarketRecommendationAudit,
  createMarketRecommendationAudit,
  type AuditResult,
  type AuditIssue,
  type AuditConfig,
  type BatchAuditResult,
  DEFAULT_AUDIT_CONFIG,
} from './MarketRecommendationAudit';
