/**
 * CareerOS Market Intelligence Module
 *
 * A dedicated intelligence layer that continuously monitors labor market evolution
 * and updates career intelligence automatically.
 *
 * Core principles:
 * - COMPLETELY SEPARATE from matching, recommendation, decision-making, student modeling
 * - Consumed by other modules but never generates market intelligence itself
 * - Deterministic and explainable
 * - Confidence propagation throughout all outputs
 * - Historical preservation with immutable snapshots
 */

// ============================================================================
// MODELS
// ============================================================================

export type {
  MarketSignal,
  MarketSignalId,
  MarketSignalType,
  MarketSignalSource,
  MarketSignalDirection,
  MarketSignalMetadata,
  NormalizedMarketSignal,
  AggregateMarketSignal,
} from './models/MarketSignal';

export {
  MarketTrendDirection,
  MarketTrendMomentum,
  DEFAULT_TREND_THRESHOLDS,
} from './models/MarketTrend';

export type {
  MarketTrendType,
  MarketTrend,
  CareerTrendAnalysis,
  TrendChangeDetection,
  TrendThresholds,
} from './models/MarketTrend';

export type {
  CareerMarketProfile,
  CareerMarketProfileId,
  CareerMarketProfileSnapshot,
  CareerMarketProfileComparison,
  CareerMarketProfileUpdate,
  CareerMarketProfileComponents,
} from './models/CareerMarketProfile';

export {
  MarketOutlook,
} from './models/CareerMarketProfile';

export type {
  EmergingCareer,
  EmergingCareerStage,
  EmergingCareerEvidence,
} from './models/EmergingCareer';

export type {
  MarketSnapshot,
  MarketSnapshotCollection,
  MarketHistory,
} from './models/MarketSnapshot';

// ============================================================================
// REPOSITORIES
// ============================================================================

export type {
  MarketRepository,
  MarketRepositoryConfig,
} from './repositories/MarketRepository';

export {
  DEFAULT_MARKET_REPOSITORY_CONFIG,
} from './repositories/MarketRepository';

export type {
  CareerMarketRepository,
  CareerMarketRepositoryConfig,
} from './repositories/CareerMarketRepository';

export {
  DEFAULT_CAREER_MARKET_REPOSITORY_CONFIG,
} from './repositories/CareerMarketRepository';

// ============================================================================
// INTERFACES
// ============================================================================

export type {
  MarketProvider,
  MarketProviderConfig,
  MarketProviderData,
  MarketProviderFetchResult,
  MarketProviderRegistry,
  MarketProviderScheduler,
  ProviderReliabilityTracker,
} from './interfaces/MarketProvider';

export type {
  MarketIntelligenceProvider,
  MarketIntelligenceQuery,
  MarketIntelligenceResult,
  ComparativeMarketIntelligence,
  MarketOutlookSummary,
  MarketIntelligenceProviderConfig,
} from './interfaces/MarketIntelligenceProvider';

export {
  DEFAULT_MARKET_INTELLIGENCE_PROVIDER_CONFIG,
} from './interfaces/MarketIntelligenceProvider';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  SIGNAL_TYPE_WEIGHTS,
  SOURCE_RELIABILITY_WEIGHTS,
  SIGNAL_FRESHNESS_WEIGHTS,
  TREND_CALCULATION_WEIGHTS,
  TREND_TIME_WINDOW_WEIGHTS,
  TREND_MOMENTUM_WEIGHTS,
  PROFILE_COMPONENT_WEIGHTS,
  DEMAND_SUBCOMPONENT_WEIGHTS,
  SALARY_SUBCOMPONENT_WEIGHTS,
  GROWTH_SUBCOMPONENT_WEIGHTS,
  SCARCITY_SUBCOMPONENT_WEIGHTS,
  AUTOMATION_RISK_SUBCOMPONENT_WEIGHTS,
  RESILIENCE_SUBCOMPONENT_WEIGHTS,
  CONFIDENCE_FACTOR_WEIGHTS,
  CONFIDENCE_THRESHOLDS,
  EMERGING_CAREER_CONFIDENCE_WEIGHTS,
  GROWTH_RATE_THRESHOLDS,
  EMERGING_CAREER_EVIDENCE_WEIGHTS,
  SIGNAL_AGGREGATION_WEIGHTS,
  MULTI_SOURCE_AGGREGATION_WEIGHTS,
  SNAPSHOT_TREND_WEIGHTS,
  SNAPSHOT_SIGNAL_SUMMARY_WEIGHTS,
  OUTLOOK_CALCULATION_WEIGHTS,
  OUTLOOK_SCORE_THRESHOLDS,
  calculateWeightedScore,
  getSignalFreshnessWeight,
  getSourceReliabilityWeight,
  getConfidenceLevelLabel,
  normalizeScore,
} from './constants/MarketWeights';

// ============================================================================
// ENGINES
// ============================================================================

export {
  MarketSignalEngine,
  DEFAULT_MARKET_SIGNAL_ENGINE_CONFIG,
  createMarketSignalEngine,
} from './MarketSignalEngine';

export type {
  MarketSignalEngineConfig,
  SignalValidationResult,
  SignalProcessingResult,
} from './MarketSignalEngine';

export {
  MarketConfidenceEngine,
  DEFAULT_CONFIDENCE_REQUIREMENTS,
  createMarketConfidenceEngine,
} from './MarketConfidenceEngine';

export type {
  ConfidenceContext,
  ConfidenceBreakdown,
  ConfidenceRequirements,
} from './MarketConfidenceEngine';

export {
  MarketTrendEngine,
  DEFAULT_MARKET_TREND_ENGINE_CONFIG,
  createMarketTrendEngine,
} from './MarketTrendEngine';

export type {
  MarketTrendEngineConfig,
} from './MarketTrendEngine';

export {
  CareerMarketProfileEngine,
  DEFAULT_CAREER_MARKET_PROFILE_ENGINE_CONFIG,
  createCareerMarketProfileEngine,
} from './CareerMarketProfileEngine';

export type {
  CareerMarketProfileEngineConfig,
  ProfileGenerationInput,
} from './CareerMarketProfileEngine';

export {
  EmergingCareerEngine,
  DEFAULT_EMERGING_CAREER_ENGINE_CONFIG,
  createEmergingCareerEngine,
} from './EmergingCareerEngine';

export type {
  EmergingCareerEngineConfig,
} from './EmergingCareerEngine';

export {
  MarketIntelligenceEngine,
  DEFAULT_MARKET_INTELLIGENCE_ENGINE_CONFIG,
  createMarketIntelligenceEngine,
} from './MarketIntelligenceEngine';

export type {
  MarketIntelligenceEngineConfig,
  EngineInitOptions,
} from './MarketIntelligenceEngine';
