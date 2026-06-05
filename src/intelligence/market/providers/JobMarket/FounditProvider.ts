/**
 * CareerOS Market Intelligence - Foundit Provider
 *
 * Foundit (formerly Monster India) - Major Indian job portal.
 * https://www.foundit.in
 *
 * Signals:
 * - job postings
 * - required skills
 * - demand velocity
 * - location demand
 * - experience demand
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

export const FOUNDIT_METADATA: DataSourceMetadata = {
  sourceId: 'foundit',
  sourceName: 'Foundit (formerly Monster India)',
  category: 'job_market',
  reliabilityScore: 78,
  updateFrequency: 'daily',
  geographicCoverage: 'india',
  signalTypes: [
    'job_postings',
    'skill_growth',
    'salary_growth',
  ],
  signalTypeReliability: {
    job_postings: 82,
    skill_growth: 76,
    salary_growth: 70,
  },
  description: 'Major Indian job portal formerly known as Monster India. Provides job market data across sectors with focus on mid-to-senior level positions.',
  providerUrl: 'https://www.foundit.in',
  apiEndpoint: 'https://api.foundit.in/v1', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 1500,
  typicalLatencyMs: 1200,
  dataRetentionDays: 365,
  limitations: [
    'Mid-senior role bias',
    'Lower volume than Naukri',
    'Metro city focus',
  ],
};

export const DEFAULT_FOUNDIT_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 10000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1500,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 45,
  },
};

export class FounditProvider implements DataProvider {
  readonly metadata = FOUNDIT_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_FOUNDIT_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: FOUNDIT_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.config.requiresAuth && !this.config.credentials?.apiKey) {
      throw new Error('Foundit provider requires API key');
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
    const fetchId = `foundit-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          jobFunctions: options?.careerIds ?? [],
          metrics: options?.signalTypes ?? this.metadata.signalTypes,
          locations: options?.geography ? [options.geography] : ['all'],
          experienceLevels: ['mid', 'senior'],
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
          code: 'FOUNDIT_FETCH_ERROR',
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

    const jobFunctions = payload.jobFunctions as string[] ?? [];
    const metrics = payload.metrics as MarketSignalType[] ?? [];

    for (const jobFunction of jobFunctions) {
      for (const metric of metrics) {
        signals.push({
          careerIdentifier: jobFunction,
          careerTitle: jobFunction,
          signalType: metric,
          strength: 0,
          unit: metric === 'job_postings' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'foundit',
            jobFunction,
            metric,
            experienceLevels: payload.experienceLevels,
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
      supportsRealtime: true,
      supportsHistorical: true,
      maxHistoricalDays: 365,
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

export function createFounditProvider(config?: Partial<DataProviderConfig>): FounditProvider {
  return new FounditProvider(config);
}
