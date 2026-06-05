/**
 * CareerOS Market Data Ingestion Architecture V1
 *
 * Infrastructure for ingesting labor market intelligence from multiple sources.
 *
 * Purpose:
 *   - Accept data from Government, Industry Reports, Job Boards, Salary Reports,
 *     Education Reports, Skill Trend Providers
 *   - 5-stage pipeline: Ingestion → Validation → Normalization → Aggregation → Storage
 *   - Handle millions of signals
 *   - Support continuous updates
 *   - Enable future real-world integrations without architecture changes
 *
 * Design Principles:
 *   - Strong TypeScript typing
 *   - No external APIs (yet)
 *   - No scraping (yet)
 *   - No UI (infrastructure only)
 *   - Scalable for millions of signals
 *   - Extensible source types
 *
 * @module market-data-ingestion
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/** Entity ID type */
export type EntityId = string;

/** Timestamp type (Unix milliseconds) */
export type Timestamp = number;

/** Signal value type (normalized 0-1) */
export type SignalValue = number;

/** Confidence score (0-1) */
export type ConfidenceScore = number;

// ============================================================================
// DATA SOURCE TYPES
// ============================================================================

/**
 * Types of market data sources.
 */
export const DATA_SOURCE_TYPES = [
  'government',
  'jobBoard',
  'industryReport',
  'salaryReport',
  'educationReport',
  'skillTrendProvider',
] as const;

export type DataSourceType = (typeof DATA_SOURCE_TYPES)[number];

/**
 * Human-readable labels for data source types.
 */
export const DATA_SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  government: 'Government Source',
  jobBoard: 'Job Board',
  industryReport: 'Industry Report',
  salaryReport: 'Salary Report',
  educationReport: 'Education Report',
  skillTrendProvider: 'Skill Trend Provider',
};

/**
 * Market data source definition.
 *
 * Represents a provider of market intelligence data.
 */
export interface MarketDataSource {
  /** Unique identifier for this source */
  id: string;

  /** Human-readable name */
  name: string;

  /** Type of data source */
  sourceType: DataSourceType;

  /** Reliability score (0.0 - 1.0) based on historical accuracy */
  reliabilityScore: number;

  /** Expected update frequency (ISO 8601 duration format) */
  updateFrequency: string;

  /** When this source was registered */
  registeredAt: Timestamp;

  /** Last successful data retrieval */
  lastSuccessfulFetch?: Timestamp;

  /** Last failed data retrieval */
  lastFailedFetch?: Timestamp;

  /** Total successful fetches */
  successfulFetchCount: number;

  /** Total failed fetches */
  failedFetchCount: number;

  /** Source configuration */
  config?: DataSourceConfig;

  /** Whether source is currently active */
  isActive: boolean;
}

/**
 * Configuration for a data source.
 */
export interface DataSourceConfig {
  /** Base URL for API (when implemented) */
  baseUrl?: string;

  /** Rate limit (requests per minute) */
  rateLimitPerMinute?: number;

  /** Authentication type (when implemented) */
  authType?: 'none' | 'apiKey' | 'oauth' | 'bearer';

  /** Custom headers required */
  customHeaders?: Record<string, string>;

  /** Request timeout (ms) */
  timeoutMs?: number;

  /** Retry configuration */
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

// ============================================================================
// RAW MARKET SIGNAL
// ============================================================================

/**
 * Unprocessed incoming market data.
 *
 * Represents data as received from external sources before any transformation.
 */
export interface RawMarketSignal {
  /** Unique identifier for this raw signal */
  id: string;

  /** Source that provided this signal */
  source: MarketDataSource;

  /** When this signal was received */
  timestamp: Timestamp;

  /** Entity this signal describes */
  entity: {
    /** Entity type */
    type: string;

    /** Entity identifier (as provided by source) */
    id: string;

    /** Entity name */
    name: string;
  };

  /** Metric being measured */
  metric: {
    /** Metric name/type */
    type: string;

    /** Raw value (unstandardized) */
    rawValue: number | string;

    /** Unit of measurement */
    unit?: string;
  };

  /** Additional metadata from source */
  metadata: RawSignalMetadata;

  /** Processing status */
  status: RawSignalStatus;

  /** Pipeline stage history */
  pipelineHistory: PipelineStageRecord[];
}

/**
 * Metadata for raw signals.
 */
export interface RawSignalMetadata {
  /** Original data format */
  originalFormat: 'json' | 'xml' | 'csv' | 'html' | 'pdf' | 'manual';

  /** Original field names */
  originalFieldNames?: Record<string, string>;

  /** Source-specific identifiers */
  sourceIds?: Record<string, string>;

  /** Collection method */
  collectionMethod: 'api' | 'scrape' | 'upload' | 'manual' | 'partner-feed';

  /** Geographic scope */
  geographicScope?: string;

  /** Time period covered */
  timePeriod?: {
    start: Timestamp;
    end: Timestamp;
  };

  /** Sample size (if applicable) */
  sampleSize?: number;

  /** Any additional source-specific data */
  [key: string]: unknown;
}

/**
 * Processing status for raw signals.
 */
export const RAW_SIGNAL_STATUSES = [
  'received',
  'validating',
  'validated',
  'validation-failed',
  'normalizing',
  'normalized',
  'normalization-failed',
  'aggregating',
  'aggregated',
  'aggregation-failed',
  'stored',
  'storage-failed',
  'rejected',
] as const;

export type RawSignalStatus = (typeof RAW_SIGNAL_STATUSES)[number];

// ============================================================================
// NORMALIZED MARKET SIGNAL
// ============================================================================

/**
 * Standardized market signal.
 *
 * Represents data after validation and normalization, ready for aggregation.
 */
export interface NormalizedMarketSignal {
  /** Unique identifier for this normalized signal */
  id: string;

  /** Reference to original raw signal */
  rawSignalId: string;

  /** Entity type (standardized) */
  entityType: NormalizedEntityType;

  /** Entity identifier (standardized) */
  entityId: EntityId;

  /** Signal type (standardized) */
  signalType: NormalizedSignalType;

  /** Normalized value (0.0 - 1.0 scale) */
  normalizedValue: SignalValue;

  /** Original value (for reference) */
  originalValue: number;

  /** Original unit */
  originalUnit?: string;

  /** Confidence in this signal */
  confidence: ConfidenceScore;

  /** When this signal was created */
  timestamp: Timestamp;

  /** Source that provided the original data */
  source: {
    id: string;
    name: string;
    type: DataSourceType;
    reliabilityScore: number;
  };

  /** Quality metrics */
  quality: SignalQualityMetrics;

  /** Processing metadata */
  processing: SignalProcessingMetadata;
}

/**
 * Standardized entity types.
 */
export const NORMALIZED_ENTITY_TYPES = [
  'career',
  'skill',
  'industry',
  'region',
  'exam',
  'education-path',
  'company',
  'role',
] as const;

export type NormalizedEntityType = (typeof NORMALIZED_ENTITY_TYPES)[number];

/**
 * Standardized signal types.
 */
export const NORMALIZED_SIGNAL_TYPES = [
  'demand',
  'salary',
  'salary-growth',
  'competition',
  'growth',
  'automation-risk',
  'skill-demand',
  'skill-growth',
  'skill-scarcity',
  'exam-difficulty',
  'exam-competition',
  'regional-opportunity',
  'job-availability',
  'hiring-rate',
  'investment',
] as const;

export type NormalizedSignalType = (typeof NORMALIZED_SIGNAL_TYPES)[number];

/**
 * Signal quality metrics.
 */
export interface SignalQualityMetrics {
  /** Completeness score (0-1) */
  completeness: number;

  /** Accuracy score (0-1) */
  accuracy: number;

  /** Timeliness score (0-1) */
  timeliness: number;

  /** Consistency with other sources (0-1) */
  consistency: number;

  /** Overall quality score */
  overallScore: number;
}

/**
 * Signal processing metadata.
 */
export interface SignalProcessingMetadata {
  /** When signal was normalized */
  normalizedAt: Timestamp;

  /** Normalization method used */
  normalizationMethod: string;

  /** Validation results */
  validationResult: ValidationResult;

  /** Transformations applied */
  transformations: string[];

  /** Processing duration (ms) */
  processingDurationMs: number;
}

// ============================================================================
// AGGREGATED MARKET SIGNAL
// ============================================================================

/**
 * Aggregated signal from multiple sources.
 */
export interface AggregatedMarketSignal {
  /** Unique identifier */
  id: string;

  /** Entity type */
  entityType: NormalizedEntityType;

  /** Entity identifier */
  entityId: EntityId;

  /** Signal type */
  signalType: NormalizedSignalType;

  /** Aggregated value */
  aggregatedValue: SignalValue;

  /** Aggregation confidence */
  confidence: ConfidenceScore;

  /** Statistical variance across sources */
  variance: number;

  /** Standard deviation */
  standardDeviation: number;

  /** Number of sources aggregated */
  sourceCount: number;

  /** Contributing signals */
  contributingSignals: Array<{
    signalId: string;
    sourceId: string;
    sourceName: string;
    value: number;
    weight: number;
  }>;

  /** When aggregation was performed */
  aggregatedAt: Timestamp;

  /** Aggregation period */
  aggregationPeriod: {
    start: Timestamp;
    end: Timestamp;
  };

  /** Aggregation method used */
  aggregationMethod: string;
}

// ============================================================================
// PIPELINE TYPES
// ============================================================================

/**
 * Pipeline stage record.
 */
export interface PipelineStageRecord {
  /** Stage name */
  stage: PipelineStage;

  /** When stage started */
  startedAt: Timestamp;

  /** When stage completed (if applicable) */
  completedAt?: Timestamp;

  /** Stage status */
  status: 'in-progress' | 'completed' | 'failed';

  /** Error information (if failed) */
  error?: PipelineError;

  /** Stage output summary */
  output?: Record<string, unknown>;
}

/**
 * Pipeline stages.
 */
export const PIPELINE_STAGES = [
  'ingestion',
  'validation',
  'normalization',
  'aggregation',
  'storage',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/**
 * Pipeline error.
 */
export interface PipelineError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Error details */
  details?: Record<string, unknown>;

  /** Whether error is recoverable */
  recoverable: boolean;
}

/**
 * Pipeline result.
 */
export interface PipelineResult {
  /** Success status */
  success: boolean;

  /** Raw signal ID */
  rawSignalId: string;

  /** Normalized signal (if successful) */
  normalizedSignal?: NormalizedMarketSignal;

  /** Aggregated signal (if successful) */
  aggregatedSignal?: AggregatedMarketSignal;

  /** Error information (if failed) */
  error?: PipelineError;

  /** Processing duration (ms) */
  durationMs: number;

  /** Stages completed */
  stagesCompleted: PipelineStage[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether signal passed validation */
  isValid: boolean;

  /** Validation score (0-1) */
  score: number;

  /** Issues found */
  issues: ValidationIssue[];

  /** Warnings (non-blocking) */
  warnings: ValidationWarning[];
}

/**
 * Validation issue.
 */
export interface ValidationIssue {
  /** Issue type */
  type: ValidationIssueType;

  /** Issue severity */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /** Issue description */
  description: string;

  /** Field affected */
  field: string;

  /** Suggested fix */
  suggestedFix?: string;
}

/**
 * Validation issue types.
 */
export const VALIDATION_ISSUE_TYPES = [
  'missing-value',
  'invalid-value',
  'out-of-range',
  'duplicate-signal',
  'outdated-signal',
  'invalid-entity',
  'invalid-metric',
  'source-unreliable',
  'format-error',
] as const;

export type ValidationIssueType = (typeof VALIDATION_ISSUE_TYPES)[number];

/**
 * Validation warning.
 */
export interface ValidationWarning {
  /** Warning type */
  type: string;

  /** Warning description */
  description: string;

  /** Field affected */
  field: string;
}

// ============================================================================
// SOURCE TRUST TYPES
// ============================================================================

/**
 * Source trust metrics.
 */
export interface SourceTrustMetrics {
  /** Source identifier */
  sourceId: string;

  /** Overall trust score (0-1) */
  trustScore: number;

  /** Historical accuracy score */
  historicalAccuracy: number;

  /** Signal consistency score */
  consistency: number;

  /** Data freshness score */
  freshness: number;

  /** Completeness score */
  completeness: number;

  /** Update reliability score */
  updateReliability: number;

  /** Trust history over time */
  trustHistory: Array<{
    timestamp: Timestamp;
    trustScore: number;
    reason: string;
  }>;

  /** Last updated */
  updatedAt: Timestamp;
}

/**
 * Source accuracy record.
 */
export interface SourceAccuracyRecord {
  /** Source identifier */
  sourceId: string;

  /** Time period */
  period: {
    start: Timestamp;
    end: Timestamp;
  };

  /** Number of signals */
  signalCount: number;

  /** Number of accurate signals */
  accurateCount: number;

  /** Accuracy score */
  accuracyScore: number;

  /** Accuracy by signal type */
  accuracyByType: Record<string, number>;
}

// ============================================================================
// FRESHNESS TYPES
// ============================================================================

/**
 * Signal freshness status.
 */
export interface SignalFreshnessStatus {
  /** Signal identifier */
  signalId: string;

  /** Current age (ms) */
  ageMs: number;

  /** Maximum acceptable age (ms) */
  maxAgeMs: number;

  /** Freshness score (0-1) */
  freshnessScore: number;

  /** Status */
  status: 'fresh' | 'stale' | 'expired';

  /** Expiration timestamp */
  expiresAt: Timestamp;

  /** Recommended refresh date */
  recommendedRefreshAt: Timestamp;
}

/**
 * Freshness policy.
 */
export interface FreshnessPolicy {
  /** Signal type */
  signalType: NormalizedSignalType;

  /** Maximum age before considered stale (ms) */
  staleThresholdMs: number;

  /** Maximum age before considered expired (ms) */
  expireThresholdMs: number;

  /** Recommended refresh interval (ms) */
  recommendedRefreshMs: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Ingestion pipeline configuration.
 */
export interface IngestionPipelineConfig {
  /** Batch size for processing */
  batchSize: number;

  /** Maximum concurrent processing jobs */
  maxConcurrency: number;

  /** Retry configuration */
  retryConfig: {
    maxRetries: number;
    backoffMultiplier: number;
    initialBackoffMs: number;
  };

  /** Validation configuration */
  validationConfig: {
    strictMode: boolean;
    minConfidenceThreshold: number;
    maxAgeDays: number;
  };

  /** Normalization configuration */
  normalizationConfig: {
    outlierDetectionEnabled: boolean;
    outlierThreshold: number;
  };

  /** Aggregation configuration */
  aggregationConfig: {
    minSourcesRequired: number;
    maxSourcesToAggregate: number;
    timeWindowMs: number;
  };

  /** Freshness policies */
  freshnessPolicies: FreshnessPolicy[];
}

/** Default configuration */
export const DEFAULT_INGESTION_CONFIG: IngestionPipelineConfig = {
  batchSize: 100,
  maxConcurrency: 10,
  retryConfig: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialBackoffMs: 1000,
  },
  validationConfig: {
    strictMode: false,
    minConfidenceThreshold: 0.5,
    maxAgeDays: 365,
  },
  normalizationConfig: {
    outlierDetectionEnabled: true,
    outlierThreshold: 3, // Standard deviations
  },
  aggregationConfig: {
    minSourcesRequired: 1,
    maxSourcesToAggregate: 10,
    timeWindowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  freshnessPolicies: [
    { signalType: 'demand', staleThresholdMs: 30 * 24 * 60 * 60 * 1000, expireThresholdMs: 90 * 24 * 60 * 60 * 1000, recommendedRefreshMs: 14 * 24 * 60 * 60 * 1000 },
    { signalType: 'salary', staleThresholdMs: 60 * 24 * 60 * 60 * 1000, expireThresholdMs: 180 * 24 * 60 * 60 * 1000, recommendedRefreshMs: 30 * 24 * 60 * 60 * 1000 },
    { signalType: 'competition', staleThresholdMs: 30 * 24 * 60 * 60 * 1000, expireThresholdMs: 90 * 24 * 60 * 60 * 1000, recommendedRefreshMs: 14 * 24 * 60 * 60 * 1000 },
    { signalType: 'skill-demand', staleThresholdMs: 14 * 24 * 60 * 60 * 1000, expireThresholdMs: 60 * 24 * 60 * 60 * 1000, recommendedRefreshMs: 7 * 24 * 60 * 60 * 1000 },
  ],
};

// ============================================================================
// PROCESSING STATS
// ============================================================================

/**
 * Pipeline processing statistics.
 */
export interface PipelineStats {
  /** Total signals received */
  totalReceived: number;

  /** Signals by status */
  byStatus: Record<RawSignalStatus, number>;

  /** Signals by source type */
  bySourceType: Record<DataSourceType, number>;

  /** Average processing time (ms) */
  avgProcessingTimeMs: number;

  /** Success rate (0-1) */
  successRate: number;

  /** Errors by type */
  errorsByType: Record<string, number>;

  /** Processing time range */
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
}
