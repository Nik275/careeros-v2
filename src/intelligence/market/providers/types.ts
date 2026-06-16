/**
 * CareerOS Market Intelligence - Data Source Types
 *
 * Core type definitions for the Data Source Layer.
 * All external market data providers implement these contracts.
 */

import type { MarketSignal, MarketSignalType, MarketSignalSource } from '../models/MarketSignal';

// ============================================================================
// DATA SOURCE METADATA
// ============================================================================

/**
 * Update frequency for data sources.
 */
export type UpdateFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'continuous';

/**
 * Geographic coverage scope.
 */
export type GeographicCoverage = 'india' | 'global' | 'regional';

/**
 * Data source category.
 */
export type DataSourceCategory = 'government' | 'job_market' | 'industry' | 'global' | 'academic';

/**
 * Data source operational status.
 */
export type DataSourceStatus = 'active' | 'inactive' | 'degraded' | 'error';

/**
 * Metadata describing a data source.
 */
export interface DataSourceMetadata {
  /** Unique source identifier */
  readonly sourceId: string;

  /** Human-readable source name */
  readonly sourceName: string;

  /** Source category */
  readonly category: DataSourceCategory;

  /** Base reliability score (0-100) */
  readonly reliabilityScore: number;

  /** Update frequency */
  readonly updateFrequency: UpdateFrequency;

  /** Geographic coverage */
  readonly geographicCoverage: GeographicCoverage;

  /** Specific regions covered (if regional) */
  readonly regions?: string[];

  /** Signal types this source provides */
  readonly signalTypes: MarketSignalType[];

  /** Signal type reliability overrides */
  readonly signalTypeReliability?: Partial<Record<MarketSignalType, number>>;

  /** Source description */
  readonly description: string;

  /** Data provider URL */
  readonly providerUrl?: string;

  /** API endpoint (if applicable) */
  readonly apiEndpoint?: string;

  /** Authentication required */
  readonly requiresAuth: boolean;

  /** Rate limits (requests per hour) */
  readonly rateLimitPerHour: number;

  /** Typical latency in milliseconds */
  readonly typicalLatencyMs: number;

  /** Data retention policy (days) */
  readonly dataRetentionDays: number;

  /** Contact information for source */
  readonly contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  /** Last verified date */
  readonly lastVerified?: Date;

  /** Known limitations */
  readonly limitations?: string[];
}

// ============================================================================
// RAW DATA TYPES
// ============================================================================

/**
 * Raw data from any external source before standardization.
 */
export interface RawMarketData {
  /** Source identifier */
  readonly sourceId: string;

  /** Raw payload from source */
  readonly payload: unknown;

  /** Timestamp when data was fetched */
  readonly fetchedAt: Date;

  /** Data timestamp (when the data represents) */
  readonly dataTimestamp: Date;

  /** Geography this data applies to */
  readonly geography: string;

  /** Fetch method used */
  readonly fetchMethod: 'api' | 'scrape' | 'file' | 'manual' | 'webhook';

  /** Fetch duration in milliseconds */
  readonly fetchDurationMs: number;

  /** HTTP status or operation status */
  readonly status: number | string;

  /** Any errors during fetch */
  readonly errors?: string[];

  /** Raw metadata from source */
  readonly rawMetadata?: Record<string, unknown>;
}

/**
 * Extracted signal data from raw source data.
 */
export interface ExtractedSignal {
  /** Career identifier (source-specific) */
  readonly careerIdentifier: string;

  /** Career title */
  readonly careerTitle: string;

  /** Signal type */
  readonly signalType: MarketSignalType;

  /** Signal strength/value */
  readonly strength: number;

  /** Unit of measurement */
  readonly unit: string;

  /** Geographic scope */
  readonly geography: string;

  /** Time period start */
  readonly periodStart: Date;

  /** Time period end */
  readonly periodEnd: Date;

  /** Additional context */
  readonly context?: Record<string, unknown>;
}

// ============================================================================
// PROVIDER INTERFACE
// ============================================================================

/**
 * Configuration for a data provider.
 */
export interface DataProviderConfig {
  /** Whether provider is enabled */
  enabled: boolean;

  /** Whether provider requires authentication */
  requiresAuth?: boolean;

  /** Custom reliability override */
  reliabilityOverride?: number;

  /** Custom update frequency override */
  updateFrequencyOverride?: UpdateFrequency;

  /** Authentication credentials */
  credentials?: {
    apiKey?: string;
    username?: string;
    password?: string;
    token?: string;
    oauthConfig?: {
      clientId: string;
      clientSecret: string;
      tokenUrl: string;
    };
  };

  /** Request timeout in milliseconds */
  timeoutMs: number;

  /** Retry configuration */
  retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  };

  /** Cache configuration */
  cacheConfig: {
    enabled: boolean;
    ttlMinutes: number;
  };
}

/**
 * Result of a data fetch operation.
 */
export interface DataFetchResult {
  /** Whether fetch was successful */
  readonly success: boolean;

  /** Fetched raw data (if successful) */
  readonly data?: RawMarketData;

  /** Error information (if failed) */
  readonly error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable: boolean;
  };

  /** Metadata about the fetch */
  readonly metadata: {
    fetchId: string;
    startedAt: Date;
    completedAt: Date;
    durationMs: number;
    dataPoints: number;
  };
}

/**
 * Health status of a data provider.
 */
export interface ProviderHealth {
  /** Current status */
  status: DataSourceStatus;

  /** Last successful fetch */
  lastSuccessfulFetch: Date | null;

  /** Last failed fetch */
  lastFailedFetch: Date | null;

  /** Consecutive failures */
  consecutiveFailures: number;

  /** Total fetches */
  totalFetches: number;

  /** Successful fetches */
  successfulFetches: number;

  /** Average latency (ms) */
  averageLatencyMs: number;

  /** Current reliability score (may be adjusted based on recent performance) */
  currentReliabilityScore: number;

  /** Any issues detected */
  issues: string[];
}

/**
 * Interface all data providers must implement.
 */
export interface DataProvider {
  /** Provider metadata */
  readonly metadata: DataSourceMetadata;

  /** Provider configuration */
  readonly config: DataProviderConfig;

  /** Current health status */
  readonly health: ProviderHealth;

  /**
   * Initialize the provider.
   */
  initialize(): Promise<void>;

  /**
   * Fetch data from the source.
   */
  fetch(options?: {
    /** Career IDs to fetch (empty = all) */
    careerIds?: string[];

    /** Signal types to fetch */
    signalTypes?: MarketSignalType[];

    /** Time range */
    timeRange?: { start: Date; end: Date };

    /** Geographic filter */
    geography?: string;
  }): Promise<DataFetchResult>;

  /**
   * Extract signals from raw data.
   */
  extractSignals(rawData: RawMarketData): ExtractedSignal[];

  /**
   * Health check.
   */
  checkHealth(): Promise<ProviderHealth>;

  /**
   * Get provider capabilities.
   */
  getCapabilities(): {
    supportsRealtime: boolean;
    supportsHistorical: boolean;
    maxHistoricalDays: number;
    supportedGeographies: string[];
    supportedSignalTypes: MarketSignalType[];
  };

  /**
   * Dispose of provider resources.
   */
  dispose(): Promise<void>;
}

// ============================================================================
// ADAPTER TYPES
// ============================================================================

/**
 * Configuration for signal adaptation.
 */
export interface SignalAdapterConfig {
  /** Minimum confidence for adapted signals */
  minConfidence: number;

  /** Maximum signal age to process (days) */
  maxSignalAgeDays: number;

  /** Validate signal strength ranges */
  validateRanges: boolean;

  /** Normalize geography names */
  normalizeGeography: boolean;

  /** Career taxonomy mapping function */
  careerMapping: 'exact' | 'fuzzy' | 'taxonomy';
}

/**
 * Result of signal adaptation.
 */
export interface SignalAdaptationResult {
  /** Successfully adapted signals */
  readonly signals: MarketSignal[];

  /** Failed adaptations */
  readonly failures: Array<{
    extracted: ExtractedSignal;
    reason: string;
  }>;

  /** Adaptation metadata */
  readonly metadata: {
    sourceId: string;
    processedAt: Date;
    inputCount: number;
    outputCount: number;
    durationMs: number;
  };
}

// ============================================================================
// REGISTRY TYPES
// ============================================================================

/**
 * Provider registration entry.
 */
export interface ProviderRegistration {
  /** Provider instance */
  readonly provider: DataProvider;

  /** Registration timestamp */
  readonly registeredAt: Date;

  /** Priority (higher = more important) */
  readonly priority: number;

  /** Tags for filtering */
  readonly tags: string[];
}

/**
 * Query for provider discovery.
 */
export interface ProviderQuery {
  /** Filter by category */
  category?: DataSourceCategory;

  /** Filter by geography */
  geography?: string;

  /** Filter by signal type */
  signalType?: MarketSignalType;

  /** Filter by status */
  status?: DataSourceStatus;

  /** Minimum reliability */
  minReliability?: number;

  /** Tags to match */
  tags?: string[];
}

/**
 * Statistics for the provider registry.
 */
export interface RegistryStatistics {
  /** Total registered providers */
  readonly totalProviders: number;

  /** Active providers */
  readonly activeProviders: number;

  /** Providers by category */
  readonly byCategory: Record<DataSourceCategory, number>;

  /** Providers by geography */
  readonly byGeography: Record<string, number>;

  /** Average reliability across all providers */
  readonly averageReliability: number;

  /** Total signals generated (last 24h) */
  readonly signalsLast24h: number;
}
