/**
 * Continuous Market Learning Layer - Types
 *
 * Core type definitions for keeping CareerOS market intelligence
 * continuously updated through trend tracking and change detection.
 *
 * ## Purpose
 *
 * Track career trends, skill trends, industry trends, regional trends,
 * exam trends, and salary trends over time.
 *
 * ## Philosophy
 *
 * "Market intelligence that doesn't update becomes market misinformation."
 *
 * ## Tracked Entities
 *
 * - Career Trends
 * - Skill Trends
 * - Industry Trends
 * - Regional Trends
 * - Exam Trends
 * - Salary Trends
 */

import type {
  MarketTrend,
  MarketOpportunity,
  MarketRisk,
  NormalizedEntityType,
  EntityId,
  Timestamp,
  ConfidenceScore,
} from '@/intelligence/market-signal-intelligence/types.js';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

export type TrendId = string;
export type SnapshotId = string;
export type ChangeId = string;

// ============================================================================
// TREND HISTORY
// ============================================================================

/**
 * Historical snapshot of market data for an entity.
 */
export interface MarketSnapshot {
  id: SnapshotId;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  timestamp: Timestamp;

  /** Market metrics at this point in time */
  metrics: {
    demand: number; // 0-1
    salary: number; // 0-1
    competition: number; // 0-1
    growth: number; // 0-1
    automationRisk: number; // 0-1
    opportunity: number; // 0-100
  };

  /** Confidence in snapshot data */
  confidence: ConfidenceScore;

  /** Number of data sources contributing */
  sourceCount: number;

  /** Time range covered by this snapshot */
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
}

/**
 * Trend history for a specific entity.
 */
export interface TrendHistory {
  id: TrendId;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  entityName: string;

  /** Chronological snapshots */
  snapshots: MarketSnapshot[];

  /** Computed trend direction */
  trendDirection: 'accelerating' | 'growing' | 'stable' | 'declining' | 'decelerating';

  /** Trend strength (0-1) */
  trendStrength: number;

  /** When tracking started */
  firstTrackedAt: Timestamp;

  /** Last update */
  lastUpdatedAt: Timestamp;

  /** Number of data points */
  dataPoints: number;
}

// ============================================================================
// MARKET CHANGES
// ============================================================================

/**
 * Type of market change detected.
 */
export type ChangeType =
  | 'emerging-opportunity'
  | 'emerging-risk'
  | 'acceleration'
  | 'deceleration'
  | 'reversal-positive'
  | 'reversal-negative'
  | 'stabilization'
  | 'volatility-increase'
  | 'volatility-decrease';

/**
 * Market change detection result.
 */
export interface MarketChange {
  id: ChangeId;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  entityName: string;

  /** Type of change detected */
  changeType: ChangeType;

  /** Severity of change (0-100) */
  severity: number;

  /** Description of what changed */
  description: string;

  /** Previous state summary */
  previousState: {
    timestamp: Timestamp;
    demand: number;
    opportunity: number;
    trendDirection: string;
  };

  /** Current state summary */
  currentState: {
    timestamp: Timestamp;
    demand: number;
    opportunity: number;
    trendDirection: string;
  };

  /** Magnitude of change */
  magnitude: {
    demandChange: number;
    opportunityChange: number;
    confidenceChange: number;
  };

  /** Confidence in detection */
  confidence: ConfidenceScore;

  /** When detected */
  detectedAt: Timestamp;

  /** Whether this change has been acknowledged/processed */
  isProcessed: boolean;
}

// ============================================================================
// PROFILE UPDATES
// ============================================================================

/**
 * Career profile market attributes update.
 */
export interface CareerProfileUpdate {
  entityId: EntityId;
  timestamp: Timestamp;

  /** Future demand projection (0-1) */
  futureDemand: number;

  /** Opportunity score (0-100) */
  opportunityScore: number;

  /** Market confidence (0-1) */
  marketConfidence: ConfidenceScore;

  /** Demand trend */
  demandTrend: 'rising' | 'stable' | 'falling';

  /** Salary trend */
  salaryTrend: 'rising' | 'stable' | 'falling';

  /** Competition level */
  competitionLevel: 'low' | 'moderate' | 'high';

  /** Automation risk level */
  automationRiskLevel: 'low' | 'moderate' | 'high';

  /** Last significant update */
  lastSignificantChange?: Timestamp;

  /** Change history */
  changes: Array<{
    timestamp: Timestamp;
    field: string;
    oldValue: number | string;
    newValue: number | string;
    reason: string;
  }>;
}

/**
 * Skill profile market attributes update.
 */
export interface SkillProfileUpdate {
  entityId: EntityId;
  timestamp: Timestamp;

  /** Current demand level (0-1) */
  demandLevel: number;

  /** Future relevance score (0-100) */
  futureRelevance: number;

  /** AI resistance score (0-100, higher = more resistant) */
  aiResistance: number;

  /** Demand trend */
  demandTrend: 'rising' | 'stable' | 'falling';

  /** Growth rate (annual) */
  growthRate: number;

  /** Market confidence */
  marketConfidence: ConfidenceScore;

  /** Related career impacts */
  careerImpacts: Array<{
    careerId: string;
    impactScore: number; // How much this skill matters for this career
  }>;
}

/**
 * Industry profile market attributes update.
 */
export interface IndustryProfileUpdate {
  entityId: EntityId;
  timestamp: Timestamp;

  /** Growth rate (annual) */
  growthRate: number;

  /** Hiring demand level (0-1) */
  hiringDemand: number;

  /** Investment activity level (0-1) */
  investmentActivity: number;

  /** Growth trend */
  growthTrend: 'accelerating' | 'growing' | 'stable' | 'slowing' | 'contracting';

  /** Market sentiment */
  sentiment: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';

  /** Market confidence */
  marketConfidence: ConfidenceScore;

  /** Key indicators */
  indicators: {
    jobPostingsChange: number; // Percentage
    fundingChange: number; // Percentage
    startupActivity: number; // 0-1
  };
}

// ============================================================================
// FORECAST PREPARATION
// ============================================================================

/**
 * Prepared data for future forecasting systems.
 */
export interface ForecastReadyData {
  entityId: EntityId;
  entityType: NormalizedEntityType;
  entityName: string;

  /** Historical time series (ready for forecasting models) */
  timeSeries: Array<{
    timestamp: Timestamp;
    demand: number;
    salary: number;
    competition: number;
    growth: number;
    opportunity: number;
  }>;

  /** Feature vectors for ML models */
  features: {
    trendSlope: number;
    volatility: number;
    seasonality: number;
    momentum: number;
    acceleration: number;
  };

  /** Metadata for forecasting */
  metadata: {
    dataPoints: number;
    timeSpanDays: number;
    lastUpdated: Timestamp;
    confidence: ConfidenceScore;
    dataQuality: 'high' | 'medium' | 'low';
  };
}

// ============================================================================
// FRESHNESS TRACKING
// ============================================================================

/**
 * Freshness status for market data.
 */
export interface MarketFreshnessStatus {
  entityId: EntityId;
  entityType: NormalizedEntityType;

  /** Last time data was updated */
  lastUpdated: Timestamp;

  /** Age of data in milliseconds */
  ageMs: number;

  /** Freshness score (0-1, 1 = fresh) */
  freshnessScore: number;

  /** Status classification */
  status: 'fresh' | 'stale' | 'expired';

  /** Confidence decay factor (0-1) */
  confidenceDecay: number;

  /** Recommended refresh date */
  recommendedRefreshAt: Timestamp;

  /** Urgency of refresh */
  refreshUrgency: 'none' | 'low' | 'medium' | 'high' | 'critical';

  /** Factors contributing to staleness */
  stalenessFactors: string[];
}

/**
 * Freshness thresholds configuration.
 */
export interface FreshnessThresholds {
  /** Stale threshold in days */
  staleDays: number;

  /** Expired threshold in days */
  expiredDays: number;

  /** Confidence decay rate per day */
  decayRatePerDay: number;

  /** Recommended refresh interval in days */
  recommendedRefreshDays: number;
}

// ============================================================================
// EVOLUTION REPORTS
// ============================================================================

/**
 * Direction indicator for evolution reports.
 */
export type DirectionIndicator = '↑' | '↓' | '→' | '↗' | '↘';

/**
 * Market evolution report for an entity.
 */
export interface MarketEvolutionReport {
  id: string;
  entityId: EntityId;
  entityType: NormalizedEntityType;
  entityName: string;

  /** Report period */
  period: {
    start: Timestamp;
    end: Timestamp;
    label: string; // e.g., "Last 30 days"
  };

  /** Key metric changes */
  metrics: {
    demand: {
      value: number;
      change: number;
      direction: DirectionIndicator;
    };
    competition: {
      value: number;
      change: number;
      direction: DirectionIndicator;
    };
    opportunity: {
      value: number;
      change: number;
      direction: DirectionIndicator;
    };
    salary: {
      value: number;
      change: number;
      direction: DirectionIndicator;
    };
  };

  /** Overall assessment */
  assessment: {
    trend: 'improving' | 'stable' | 'declining';
    confidence: ConfidenceScore;
    summary: string;
  };

  /** Significant changes detected */
  significantChanges: Array<{
    type: string;
    description: string;
    impact: 'positive' | 'neutral' | 'negative';
  }>;

  /** Generated at */
  generatedAt: Timestamp;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/**
 * Trend history repository configuration.
 */
export interface TrendHistoryRepositoryConfig {
  /** Maximum snapshots to retain per entity */
  maxSnapshotsPerEntity: number;

  /** Retention period in days */
  retentionDays: number;

  /** Aggregation window for snapshots */
  aggregationWindowDays: number;
}

/**
 * Market change detector configuration.
 */
export interface MarketChangeDetectorConfig {
  /** Minimum change to trigger detection */
  minChangeThreshold: number;

  /** Significant change threshold */
  significantChangeThreshold: number;

  /** Time window for change detection (days) */
  detectionWindowDays: number;

  /** Minimum confidence for detection */
  minConfidence: number;
}

/**
 * Profile updater configuration.
 */
export interface ProfileUpdaterConfig {
  /** Minimum data points for update */
  minDataPoints: number;

  /** Update threshold (score change) */
  updateThreshold: number;

  /** Batch size for processing */
  batchSize: number;
}

/**
 * Market freshness engine configuration.
 */
export interface MarketFreshnessEngineConfig {
  thresholds: FreshnessThresholds;

  /** Check interval in milliseconds */
  checkIntervalMs: number;

  /** Whether to auto-mark expired */
  autoMarkExpired: boolean;
}

/**
 * Complete market learning engine configuration.
 */
export interface MarketLearningEngineConfig {
  trendHistory: TrendHistoryRepositoryConfig;
  changeDetector: MarketChangeDetectorConfig;
  profileUpdater: ProfileUpdaterConfig;
  freshness: MarketFreshnessEngineConfig;

  /** Whether to enable debug logging */
  debug: boolean;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_TREND_HISTORY_CONFIG: TrendHistoryRepositoryConfig = {
  maxSnapshotsPerEntity: 100,
  retentionDays: 365,
  aggregationWindowDays: 7,
};

export const DEFAULT_CHANGE_DETECTOR_CONFIG: MarketChangeDetectorConfig = {
  minChangeThreshold: 0.05,
  significantChangeThreshold: 0.15,
  detectionWindowDays: 30,
  minConfidence: 0.6,
};

export const DEFAULT_PROFILE_UPDATER_CONFIG: ProfileUpdaterConfig = {
  minDataPoints: 3,
  updateThreshold: 5,
  batchSize: 100,
};

export const DEFAULT_FRESHNESS_THRESHOLDS: FreshnessThresholds = {
  staleDays: 30,
  expiredDays: 90,
  decayRatePerDay: 0.01,
  recommendedRefreshDays: 14,
};

export const DEFAULT_FRESHNESS_ENGINE_CONFIG: MarketFreshnessEngineConfig = {
  thresholds: DEFAULT_FRESHNESS_THRESHOLDS,
  checkIntervalMs: 24 * 60 * 60 * 1000, // Daily
  autoMarkExpired: true,
};

export const DEFAULT_MARKET_LEARNING_ENGINE_CONFIG: MarketLearningEngineConfig = {
  trendHistory: DEFAULT_TREND_HISTORY_CONFIG,
  changeDetector: DEFAULT_CHANGE_DETECTOR_CONFIG,
  profileUpdater: DEFAULT_PROFILE_UPDATER_CONFIG,
  freshness: DEFAULT_FRESHNESS_ENGINE_CONFIG,
  debug: false,
};
