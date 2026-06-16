/**
 * CareerOS Market Intelligence - National Career Service (NCS) Provider
 *
 * Official Government of India labor market data source.
 * https://www.ncs.gov.in
 *
 * Signals:
 * - hiring demand
 * - occupation growth
 * - location demand
 */

import type {
  DataProvider,
  DataSourceMetadata,
  DataProviderConfig,
  ProviderHealth,
  DataFetchResult,
  RawMarketData,
  ExtractedSignal,
} from '../types';
import type { MarketSignalType } from '../../models/MarketSignal';

/**
 * NCS Provider metadata.
 */
export const NCS_METADATA: DataSourceMetadata = {
  sourceId: 'ncs-india',
  sourceName: 'National Career Service (India)',
  category: 'government',
  reliabilityScore: 95,
  updateFrequency: 'weekly',
  geographicCoverage: 'india',
  regions: [
    'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
    'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil-nadu',
    'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand', 'west-bengal',
    'andaman-nicobar', 'chandigarh', 'dadra-nagar-haveli', 'daman-diu',
    'delhi', 'jammu-kashmir', 'ladakh', 'lakshadweep', 'puducherry'
  ],
  signalTypes: [
    'job_postings',
    'skill_growth',
    'salary_growth',
    'government_push',
  ],
  signalTypeReliability: {
    job_postings: 96,
    skill_growth: 92,
    salary_growth: 88,
    government_push: 98,
  },
  description: 'Official Government of India portal for employment services, job matching, and career counseling. Provides comprehensive labor market data across all states and union territories.',
  providerUrl: 'https://www.ncs.gov.in',
  apiEndpoint: 'https://api.ncs.gov.in/v1', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 1000,
  typicalLatencyMs: 1500,
  dataRetentionDays: 730,
  contactInfo: {
    name: 'NCS Data Team',
    email: 'data@ncs.gov.in',
  },
  limitations: [
    'Data may have 1-2 week lag',
    'Salary data often self-reported',
    'Not all occupations equally covered',
  ],
};

/**
 * Default configuration for NCS provider.
 */
export const DEFAULT_NCS_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 10000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 60,
  },
};

/**
 * National Career Service data provider.
 *
 * Government of India's official employment portal.
 */
export class NCSProvider implements DataProvider {
  readonly metadata = NCS_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_NCS_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: NCS_METADATA.reliabilityScore,
      issues: [],
    };
  }

  /**
   * Initialize the provider.
   */
  async initialize(): Promise<void> {
    // Validate configuration
    if (this.config.requiresAuth && !this.config.credentials?.apiKey) {
      throw new Error('NCS provider requires API key');
    }

    this.initialized = true;
    this.health.status = 'active';
  }

  /**
   * Fetch data from NCS.
   */
  async fetch(options?: {
    careerIds?: string[];
    signalTypes?: MarketSignalType[];
    timeRange?: { start: Date; end: Date };
    geography?: string;
  }): Promise<DataFetchResult> {
    const startTime = Date.now();
    const fetchId = `ncs-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // PLACEHOLDER: Actual implementation would call NCS API
      // For now, return mock data structure

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          // Mock NCS response structure
          occupations: options?.careerIds ?? [],
          signalTypes: options?.signalTypes ?? this.metadata.signalTypes,
          geography: options?.geography ?? 'india',
          timestamp: new Date().toISOString(),
        },
        fetchedAt: new Date(),
        dataTimestamp: new Date(),
        geography: options?.geography ?? 'india',
        fetchMethod: 'api',
        fetchDurationMs: 0,
        status: 200,
      };

      // Update health on success
      this.updateHealthOnSuccess(Date.now() - startTime);

      return {
        success: true,
        data: mockRawData,
        metadata: {
          fetchId,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          dataPoints: 0,
        },
      };
    } catch (error) {
      // Update health on failure
      this.updateHealthOnFailure();

      return {
        success: false,
        error: {
          code: 'NCS_FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
        },
        metadata: {
          fetchId,
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          dataPoints: 0,
        },
      };
    }
  }

  /**
   * Extract signals from NCS raw data.
   */
  extractSignals(rawData: RawMarketData): ExtractedSignal[] {
    // PLACEHOLDER: Actual implementation would parse NCS response
    // This demonstrates the expected structure

    const signals: ExtractedSignal[] = [];
    const payload = rawData.payload as Record<string, unknown>;

    // Example extraction logic
    const occupations = payload.occupations as string[] ?? [];
    const signalTypes = payload.signalTypes as MarketSignalType[] ?? [];

    for (const occupation of occupations) {
      for (const signalType of signalTypes) {
        signals.push({
          careerIdentifier: occupation,
          careerTitle: occupation,
          signalType,
          strength: 0, // Would come from actual data
          unit: 'count',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'ncs',
            rawPayload: payload,
          },
        });
      }
    }

    return signals;
  }

  /**
   * Check provider health.
   */
  async checkHealth(): Promise<ProviderHealth> {
    // PLACEHOLDER: Actual implementation would ping NCS API
    return this.health;
  }

  /**
   * Get provider capabilities.
   */
  getCapabilities(): {
    supportsRealtime: boolean;
    supportsHistorical: boolean;
    maxHistoricalDays: number;
    supportedGeographies: string[];
    supportedSignalTypes: MarketSignalType[];
  } {
    return {
      supportsRealtime: false,
      supportsHistorical: true,
      maxHistoricalDays: 730,
      supportedGeographies: this.metadata.regions ?? ['india'],
      supportedSignalTypes: this.metadata.signalTypes,
    };
  }

  /**
   * Dispose of provider resources.
   */
  async dispose(): Promise<void> {
    this.initialized = false;
    this.health.status = 'inactive';
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private updateHealthOnSuccess(latencyMs: number): void {
    this.health.lastSuccessfulFetch = new Date();
    this.health.consecutiveFailures = 0;
    this.health.totalFetches++;
    this.health.successfulFetches++;

    // Update average latency
    const totalLatency = this.health.averageLatencyMs * (this.health.totalFetches - 1) + latencyMs;
    this.health.averageLatencyMs = Math.round(totalLatency / this.health.totalFetches);

    this.health.status = 'active';
    this.health.issues = [];
  }

  private updateHealthOnFailure(): void {
    this.health.lastFailedFetch = new Date();
    this.health.consecutiveFailures++;
    this.health.totalFetches++;

    if (this.health.consecutiveFailures >= 5) {
      this.health.status = 'error';
      this.health.issues = [`${this.health.consecutiveFailures} consecutive failures`];
    } else if (this.health.consecutiveFailures >= 3) {
      this.health.status = 'degraded';
    }
  }
}

/**
 * Factory function for NCSProvider.
 */
export function createNCSProvider(config?: Partial<DataProviderConfig>): NCSProvider {
  return new NCSProvider(config);
}
