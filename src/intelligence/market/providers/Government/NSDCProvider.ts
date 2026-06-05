/**
 * CareerOS Market Intelligence - NSDC Provider
 *
 * National Skill Development Corporation data source.
 * https://www.nsdcindia.org
 *
 * Signals:
 * - skill demand
 * - vocational demand
 * - certification demand
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
 * NSDC Provider metadata.
 */
export const NSDC_METADATA: DataSourceMetadata = {
  sourceId: 'nsdc',
  sourceName: 'National Skill Development Corporation (NSDC)',
  category: 'government',
  reliabilityScore: 95,
  updateFrequency: 'monthly',
  geographicCoverage: 'india',
  signalTypes: [
    'skill_growth',
    'job_postings',
    'government_push',
  ],
  signalTypeReliability: {
    skill_growth: 96,
    job_postings: 88,
    government_push: 95,
  },
  description: 'NSDC focuses on skill development across India. Provides data on skill demand, vocational training trends, and certification requirements across sectors.',
  providerUrl: 'https://www.nsdcindia.org',
  apiEndpoint: 'https://api.nsdcindia.org/v1', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 500,
  typicalLatencyMs: 2000,
  dataRetentionDays: 1095, // 3 years
  contactInfo: {
    name: 'NSDC Data Division',
    email: 'data@nsdcindia.org',
  },
  limitations: [
    'Monthly updates only',
    'Sector-level aggregation',
    'Skill taxonomy may differ from CareerOS',
  ],
};

/**
 * Default configuration for NSDC provider.
 */
export const DEFAULT_NSDC_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 15000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 1440, // 24 hours
  },
};

/**
 * NSDC data provider.
 *
 * National Skill Development Corporation.
 */
export class NSDCProvider implements DataProvider {
  readonly metadata = NSDC_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_NSDC_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: NSDC_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.config.requiresAuth && !this.config.credentials?.apiKey) {
      throw new Error('NSDC provider requires API key');
    }

    this.initialized = true;
    this.health.status = 'active';
  }

  async fetch(options?: {
    careerIds?: string[];
    signalTypes?: MarketSignalType[];
    timeRange?: { start: Date; end: Date };
    geography?: string;
  }): Promise<DataFetchResult> {
    const startTime = Date.now();
    const fetchId = `nsdc-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // PLACEHOLDER: Actual NSDC API call
      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          sectors: options?.careerIds ?? [],
          skillTypes: options?.signalTypes ?? this.metadata.signalTypes,
          geography: options?.geography ?? 'india',
          period: options?.timeRange ?? {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date(),
          },
        },
        fetchedAt: new Date(),
        dataTimestamp: new Date(),
        geography: options?.geography ?? 'india',
        fetchMethod: 'api',
        fetchDurationMs: 0,
        status: 200,
      };

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
      this.updateHealthOnFailure();

      return {
        success: false,
        error: {
          code: 'NSDC_FETCH_ERROR',
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

  extractSignals(rawData: RawMarketData): ExtractedSignal[] {
    const signals: ExtractedSignal[] = [];
    const payload = rawData.payload as Record<string, unknown>;

    // NSDC specializes in skill-related signals
    const sectors = payload.sectors as string[] ?? [];
    const skillTypes = payload.skillTypes as MarketSignalType[] ?? [];

    for (const sector of sectors) {
      for (const skillType of skillTypes) {
        signals.push({
          careerIdentifier: sector,
          careerTitle: sector,
          signalType: skillType,
          strength: 0,
          unit: 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'nsdc',
            sector,
            skillType,
          },
        });
      }
    }

    return signals;
  }

  async checkHealth(): Promise<ProviderHealth> {
    return this.health;
  }

  getCapabilities() {
    return {
      supportsRealtime: false,
      supportsHistorical: true,
      maxHistoricalDays: 1095,
      supportedGeographies: ['india'],
      supportedSignalTypes: this.metadata.signalTypes,
    };
  }

  async dispose(): Promise<void> {
    this.initialized = false;
    this.health.status = 'inactive';
  }

  private updateHealthOnSuccess(latencyMs: number): void {
    this.health.lastSuccessfulFetch = new Date();
    this.health.consecutiveFailures = 0;
    this.health.totalFetches++;
    this.health.successfulFetches++;

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

export function createNSDCProvider(config?: Partial<DataProviderConfig>): NSDCProvider {
  return new NSDCProvider(config);
}
