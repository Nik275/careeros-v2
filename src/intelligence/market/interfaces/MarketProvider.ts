/**
 * CareerOS Market Intelligence - Market Provider Interface
 *
 * Interface for external market data sources.
 * Implementations will integrate with NCS India, NSDC, NASSCOM, job boards, etc.
 */

import type { MarketSignal, MarketSignalSource, MarketSignalType } from '../models/MarketSignal';

/**
 * Configuration for a market data provider.
 */
export interface MarketProviderConfig {
  /** Provider identifier */
  readonly id: string;

  /** Provider name */
  readonly name: string;

  /** Provider type */
  readonly sourceType: MarketSignalSource;

  /** Base reliability score (0-100) */
  readonly baseReliability: number;

  /** Update frequency */
  readonly updateFrequency: {
    /** Frequency type */
    type: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly';

    /** Interval in milliseconds */
    intervalMs: number;
  };

  /** Geographic coverage */
  readonly coverage: {
    /** Primary geography */
    primary: string;

    /** Additional regions */
    regions: string[];
  };

  /** Supported signal types */
  readonly supportedSignalTypes: MarketSignalType[];

  /** Authentication configuration */
  readonly auth?: {
    type: 'api_key' | 'oauth' | 'basic' | 'none';
    credentials: Record<string, string>;
  };

  /** Rate limiting */
  readonly rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };

  /** Timeout configuration */
  readonly timeout?: {
    connectionMs: number;
    requestMs: number;
  };
}

/**
 * Raw data from a market provider.
 */
export interface MarketProviderData {
  /** Career identifier (provider-specific) */
  readonly careerIdentifier: string;

  /** Career title */
  readonly careerTitle: string;

  /** Signal type */
  readonly signalType: MarketSignalType;

  /** Signal strength (raw value) */
  readonly strength: number;

  /** Signal unit */
  readonly unit: string;

  /** Timestamp of data */
  readonly timestamp: Date;

  /** Time period covered */
  readonly timePeriod: {
    start: Date;
    end: Date;
  };

  /** Geographic scope */
  readonly geography: string;

  /** Additional metadata */
  readonly metadata: Record<string, unknown>;

  /** Raw payload */
  readonly rawPayload: unknown;
}

/**
 * Fetch result from a provider.
 */
export interface MarketProviderFetchResult {
  /** Whether fetch was successful */
  readonly success: boolean;

  /** Fetched data (if successful) */
  readonly data?: MarketProviderData[];

  /** Error details (if failed) */
  readonly error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  /** Metadata about the fetch */
  readonly metadata: {
    /** Fetch timestamp */
    timestamp: Date;

    /** Duration in milliseconds */
    durationMs: number;

    /** Number of records fetched */
    recordCount: number;

    /** Provider reliability at time of fetch */
    reliabilityScore: number;
  };
}

/**
 * Interface for market data providers.
 * 
 * Implementations will integrate with external data sources like:
 * - NCS India (National Career Service)
 * - NSDC (National Skill Development Corporation)
 * - NASSCOM (IT industry data)
 * - Naukri (job board)
 * - Foundit (job board)
 * - LinkedIn (professional network)
 * - Indeed (job board)
 * - WEF (World Economic Forum reports)
 * - ILO (International Labour Organization)
 */
export interface MarketProvider {
  /** Provider configuration */
  readonly config: MarketProviderConfig;

  /** Provider status */
  readonly status: {
    /** Is provider enabled */
    isEnabled: boolean;

    /** Is provider healthy */
    isHealthy: boolean;

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
  };

  /**
   * Initialize the provider.
   */
  initialize(): Promise<void>;

  /**
   * Fetch data from the provider.
   */
  fetch(options?: {
    /** Career IDs to fetch (if empty, fetch all) */
    careerIds?: string[];

    /** Signal types to fetch */
    signalTypes?: MarketSignalType[];

    /** Time range */
    timeRange?: { start: Date; end: Date };

    /** Geographic filter */
    geography?: string;
  }): Promise<MarketProviderFetchResult>;

  /**
   * Fetch data for a specific career.
   */
  fetchForCareer(careerId: string, options?: {
    signalTypes?: MarketSignalType[];
    timeRange?: { start: Date; end: Date };
  }): Promise<MarketProviderFetchResult>;

  /**
   * Transform provider data to market signals.
   */
  transformToSignals(data: MarketProviderData[]): Promise<MarketSignal[]>;

  /**
   * Validate provider configuration.
   */
  validateConfig(): { isValid: boolean; issues: string[] };

  /**
   * Health check.
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs: number;
    details: Record<string, unknown>;
  }>;

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
}

/**
 * Registry of market providers.
 */
export interface MarketProviderRegistry {
  /** Registered providers */
  readonly providers: Map<string, MarketProvider>;

  /**
   * Register a provider.
   */
  register(provider: MarketProvider): void;

  /**
   * Unregister a provider.
   */
  unregister(providerId: string): void;

  /**
   * Get a provider by ID.
   */
  get(providerId: string): MarketProvider | undefined;

  /**
   * Get all providers.
   */
  getAll(): MarketProvider[];

  /**
   * Get providers by type.
   */
  getByType(sourceType: MarketSignalSource): MarketProvider[];

  /**
   * Get healthy providers.
   */
  getHealthy(): MarketProvider[];

  /**
   * Get providers supporting a signal type.
   */
  getSupportingSignalType(signalType: MarketSignalType): MarketProvider[];
}

/**
 * Provider fetch scheduler.
 */
export interface MarketProviderScheduler {
  /**
   * Schedule fetches for all providers.
   */
  scheduleAll(): void;

  /**
   * Schedule fetch for a specific provider.
   */
  schedule(providerId: string): void;

  /**
   * Cancel all scheduled fetches.
   */
  cancelAll(): void;

  /**
   * Cancel scheduled fetch for a provider.
   */
  cancel(providerId: string): void;

  /**
   * Get next scheduled fetch time.
   */
  getNextFetchTime(providerId: string): Date | null;

  /**
   * Get fetch statistics.
   */
  getStatistics(): {
    totalScheduled: number;
    completed: number;
    failed: number;
    averageLatencyMs: number;
  };
}

/**
 * Provider reliability tracker.
 */
export interface ProviderReliabilityTracker {
  /**
   * Record a successful fetch.
   */
  recordSuccess(providerId: string, latencyMs: number): void;

  /**
   * Record a failed fetch.
   */
  recordFailure(providerId: string, error: Error): void;

  /**
   * Get reliability score for a provider.
   */
  getReliabilityScore(providerId: string): number;

  /**
   * Get reliability report.
   */
  getReliabilityReport(providerId: string): {
    score: number;
    successRate: number;
    averageLatencyMs: number;
    consecutiveFailures: number;
    totalFetches: number;
  };

  /**
   * Get all reliability reports.
   */
  getAllReports(): Map<string, ReturnType<ProviderReliabilityTracker['getReliabilityReport']>>;
}
