/**
 * Market Signal Intelligence Engine - Types
 *
 * Core type definitions for transforming raw market signals into
 * actionable market intelligence.
 *
 * ## Purpose
 *
 * Detect trends, opportunities, risks, and market shifts from
 * processed market signals and profiles.
 */

import type {
  AggregatedMarketSignal,
  NormalizedEntityType,
  NormalizedSignalType,
} from '@/market-data-ingestion/types.js';

export type { AggregatedMarketSignal, NormalizedEntityType, NormalizedSignalType };

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

export type EntityId = string;
export type Timestamp = number;
export type ConfidenceScore = number; // 0-1
export type TrendStrength = number; // 0-1
export type OpportunityScore = number; // 0-100
export type RiskScore = number; // 0-100

// ============================================================================
// TREND TYPES
// ============================================================================

/**
 * Trend direction classifications.
 */
export type TrendType = 'growing' | 'stable' | 'declining' | 'volatile' | 'emerging';

/**
 * Trend type labels for display.
 */
export const TREND_TYPE_LABELS: Record<TrendType, string> = {
  growing: 'Growing',
  stable: 'Stable',
  declining: 'Declining',
  volatile: 'Volatile',
  emerging: 'Emerging',
};

/**
 * Trend detection methods.
 */
export type TrendDetectionMethod =
  | 'linear-regression'
  | 'moving-average'
  | 'exponential-smoothing'
  | 'change-point-detection'
  | 'momentum-based';

// ============================================================================
// RISK TYPES
// ============================================================================

/**
 * Risk type classifications.
 */
export type RiskType =
  | 'oversaturation'
  | 'declining-demand'
  | 'high-competition'
  | 'automation-exposure'
  | 'industry-weakness'
  | 'salary-stagnation'
  | 'skill-obsolescence'
  | 'regional-decline';

/**
 * Risk level classifications.
 */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

/**
 * Risk type labels.
 */
export const RISK_TYPE_LABELS: Record<RiskType, string> = {
  'oversaturation': 'Oversaturation',
  'declining-demand': 'Declining Demand',
  'high-competition': 'High Competition',
  'automation-exposure': 'Automation Exposure',
  'industry-weakness': 'Industry Weakness',
  'salary-stagnation': 'Salary Stagnation',
  'skill-obsolescence': 'Skill Obsolescence',
  'regional-decline': 'Regional Decline',
};

/**
 * Risk level labels.
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  minimal: 'Minimal',
};

// ============================================================================
// INPUT PROFILES
// ============================================================================

/**
 * Career market profile with historical signals.
 */
export interface CareerMarketProfile {
  id: EntityId;
  careerId: string;
  name: string;
  signals: AggregatedMarketSignal[];
  history: CareerSignalHistory;
  lastUpdated: Timestamp;
}

/**
 * Career signal history.
 */
export interface CareerSignalHistory {
  demand: TimeSeriesPoint[];
  salary: TimeSeriesPoint[];
  competition: TimeSeriesPoint[];
  growth: TimeSeriesPoint[];
  automationRisk: TimeSeriesPoint[];
}

/**
 * Skill market profile.
 */
export interface SkillMarketProfile {
  id: EntityId;
  skillId: string;
  name: string;
  signals: AggregatedMarketSignal[];
  history: SkillSignalHistory;
  lastUpdated: Timestamp;
}

/**
 * Skill signal history.
 */
export interface SkillSignalHistory {
  demand: TimeSeriesPoint[];
  growth: TimeSeriesPoint[];
  scarcity: TimeSeriesPoint[];
}

/**
 * Industry market profile.
 */
export interface IndustryMarketProfile {
  id: EntityId;
  industryId: string;
  name: string;
  signals: AggregatedMarketSignal[];
  history: IndustrySignalHistory;
  lastUpdated: Timestamp;
}

/**
 * Industry signal history.
 */
export interface IndustrySignalHistory {
  growth: TimeSeriesPoint[];
  investment: TimeSeriesPoint[];
  hiringRate: TimeSeriesPoint[];
}

/**
 * Region market profile.
 */
export interface RegionMarketProfile {
  id: EntityId;
  regionId: string;
  name: string;
  signals: AggregatedMarketSignal[];
  history: RegionSignalHistory;
  lastUpdated: Timestamp;
}

/**
 * Region signal history.
 */
export interface RegionSignalHistory {
  opportunity: TimeSeriesPoint[];
  jobAvailability: TimeSeriesPoint[];
  salary: TimeSeriesPoint[];
}

/**
 * Time series data point.
 */
export interface TimeSeriesPoint {
  timestamp: Timestamp;
  value: number;
  confidence: ConfidenceScore;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

/**
 * Market trend detection result.
 */
export interface MarketTrend {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  trendType: TrendType;
  strength: TrendStrength; // 0-1
  confidence: ConfidenceScore; // 0-1
  explanation: string[];
  detectedAt: Timestamp;
  detectionMethod: TrendDetectionMethod;
  timeWindow: {
    start: Timestamp;
    end: Timestamp;
  };
  supportingData: {
    dataPoints: number;
    slope: number;
    r2Score: number;
  };
}

/**
 * Market opportunity assessment.
 */
export interface MarketOpportunity {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  opportunityScore: OpportunityScore; // 0-100
  confidence: ConfidenceScore; // 0-1
  drivers: string[];
  risks: string[];
  assessedAt: Timestamp;
  scoreComponents: {
    demand: number;
    competition: number;
    salaryGrowth: number;
    futureOutlook: number;
    automationRisk: number;
  };
}

/**
 * Market risk assessment.
 */
export interface MarketRisk {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  riskType: RiskType;
  riskLevel: RiskLevel;
  riskScore: RiskScore; // 0-100
  confidence: ConfidenceScore; // 0-1
  indicators: string[];
  detectedAt: Timestamp;
  contributingFactors: {
    factor: string;
    impact: number;
  }[];
}

/**
 * Market momentum metrics.
 */
export interface MarketMomentum {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  rateOfChange: number; // Per time period
  acceleration: number; // Change in rate
  direction: 'up' | 'down' | 'flat';
  persistence: number; // 0-1, how long trend has persisted
  volatility: number; // Standard deviation
  confidence: ConfidenceScore;
  calculatedAt: Timestamp;
  timeWindow: {
    start: Timestamp;
    end: Timestamp;
  };
}

/**
 * Emerging career/entity detection.
 */
export interface EmergingCareer {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  emergenceScore: number; // 0-100
  growthRate: number; // Annual growth
  confidence: ConfidenceScore;
  indicators: string[];
  detectedAt: Timestamp;
  projectedTrajectory: 'accelerating' | 'steady' | 'maturing' | 'uncertain';
}

/**
 * Market narrative/explanation.
 */
export interface MarketNarrative {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  summary: string;
  keyPoints: string[];
  supportingEvidence: {
    metric: string;
    value: number;
    trend: TrendType;
  }[];
  recommendations: string[];
  generatedAt: Timestamp;
  confidence: ConfidenceScore;
}

// ============================================================================
// INTELLIGENCE REPORT
// ============================================================================

/**
 * Comprehensive market intelligence report.
 */
export interface MarketIntelligenceReport {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  entityName: string;
  generatedAt: Timestamp;

  // Core assessments
  trend: MarketTrend;
  opportunity: MarketOpportunity;
  risks: MarketRisk[];
  momentum?: MarketMomentum;
  emergingStatus?: EmergingCareer;
  narrative: MarketNarrative;

  // Overall assessment
  overallScore: number; // -100 to +100
  overallAssessment: 'highly-favorable' | 'favorable' | 'neutral' | 'unfavorable' | 'highly-unfavorable';
  confidence: ConfidenceScore;

  // Metadata
  dataQuality: {
    dataPoints: number;
    timeSpan: number; // Days
    sources: number;
  };
}

// ============================================================================
// ENGINE CONFIGURATIONS
// ============================================================================

/**
 * Trend detection configuration.
 */
export interface TrendDetectionConfig {
  minDataPoints: number;
  timeWindowMs: number;
  significanceThreshold: number;
  volatilityThreshold: number;
  growthThreshold: number;
  declineThreshold: number;
}

/**
 * Opportunity scoring configuration.
 */
export interface OpportunityScoringConfig {
  weights: {
    demand: number;
    competition: number;
    salaryGrowth: number;
    futureOutlook: number;
    automationRisk: number;
  };
  thresholds: {
    highOpportunity: number;
    mediumOpportunity: number;
  };
}

/**
 * Risk engine configuration.
 */
export interface RiskEngineConfig {
  thresholds: {
    oversaturation: number;
    decliningDemand: number;
    highCompetition: number;
    automationRisk: number;
    industryWeakness: number;
  };
  weights: {
    recency: number;
    confidence: number;
    severity: number;
  };
}

/**
 * Momentum engine configuration.
 */
export interface MomentumConfig {
  shortTermWindow: number; // Data points
  longTermWindow: number; // Data points
  accelerationThreshold: number;
  persistenceThreshold: number;
}

/**
 * Emerging career detector configuration.
 */
export interface EmergingCareerConfig {
  minGrowthRate: number;
  minDataPoints: number;
  timeWindowMs: number;
  accelerationThreshold: number;
  maturityThreshold: number;
}

/**
 * Narrative engine configuration.
 */
export interface NarrativeConfig {
  maxKeyPoints: number;
  maxRecommendations: number;
  minConfidenceThreshold: number;
  includeSupportingEvidence: boolean;
}

/**
 * Intelligence engine configuration.
 */
export interface IntelligenceEngineConfig {
  trendDetection: TrendDetectionConfig;
  opportunityScoring: OpportunityScoringConfig;
  riskEngine: RiskEngineConfig;
  momentum: MomentumConfig;
  emergingCareer: EmergingCareerConfig;
  narrative: NarrativeConfig;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_TREND_DETECTION_CONFIG: TrendDetectionConfig = {
  minDataPoints: 3,
  timeWindowMs: 180 * 24 * 60 * 60 * 1000, // 180 days
  significanceThreshold: 0.05,
  volatilityThreshold: 0.3,
  growthThreshold: 0.1,
  declineThreshold: -0.1,
};

export const DEFAULT_OPPORTUNITY_SCORING_CONFIG: OpportunityScoringConfig = {
  weights: {
    demand: 0.25,
    competition: 0.2,
    salaryGrowth: 0.2,
    futureOutlook: 0.2,
    automationRisk: 0.15,
  },
  thresholds: {
    highOpportunity: 70,
    mediumOpportunity: 40,
  },
};

export const DEFAULT_RISK_ENGINE_CONFIG: RiskEngineConfig = {
  thresholds: {
    oversaturation: 0.8,
    decliningDemand: -0.2,
    highCompetition: 0.7,
    automationRisk: 0.6,
    industryWeakness: 0.6,
  },
  weights: {
    recency: 0.3,
    confidence: 0.3,
    severity: 0.4,
  },
};

export const DEFAULT_MOMENTUM_CONFIG: MomentumConfig = {
  shortTermWindow: 3,
  longTermWindow: 12,
  accelerationThreshold: 0.05,
  persistenceThreshold: 0.7,
};

export const DEFAULT_EMERGING_CAREER_CONFIG: EmergingCareerConfig = {
  minGrowthRate: 0.2, // 20% annual growth
  minDataPoints: 4,
  timeWindowMs: 365 * 24 * 60 * 60 * 1000, // 1 year
  accelerationThreshold: 0.1,
  maturityThreshold: 0.8,
};

export const DEFAULT_NARRATIVE_CONFIG: NarrativeConfig = {
  maxKeyPoints: 5,
  maxRecommendations: 3,
  minConfidenceThreshold: 0.6,
  includeSupportingEvidence: true,
};

export const DEFAULT_INTELLIGENCE_ENGINE_CONFIG: IntelligenceEngineConfig = {
  trendDetection: DEFAULT_TREND_DETECTION_CONFIG,
  opportunityScoring: DEFAULT_OPPORTUNITY_SCORING_CONFIG,
  riskEngine: DEFAULT_RISK_ENGINE_CONFIG,
  momentum: DEFAULT_MOMENTUM_CONFIG,
  emergingCareer: DEFAULT_EMERGING_CAREER_CONFIG,
  narrative: DEFAULT_NARRATIVE_CONFIG,
};
