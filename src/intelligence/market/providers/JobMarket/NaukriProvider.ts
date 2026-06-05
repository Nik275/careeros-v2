/**
 * CareerOS Market Intelligence - Naukri Provider
 *
 * Naukri.com - India's largest job portal.
 * https://www.naukri.com
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

export const NAUKRI_METADATA: DataSourceMetadata = {
  sourceId: 'naukri',
  sourceName: 'Naukri.com',
  category: 'job_market',
  reliabilityScore: 80,
  updateFrequency: 'daily',
  geographicCoverage: 'india',
  signalTypes: [
    'job_postings',
    'skill_growth',
    'salary_growth',
  ],
  signalTypeReliability: {
    job_postings: 85,
    skill_growth: 78,
    salary_growth: 72,
  },
  description: 'India\'s largest job portal with millions of active job postings. Provides real-time demand data across industries, locations, and experience levels.',
  providerUrl: 'https://www.naukri.com',
  apiEndpoint: 'https://api.naukri.com/v1', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 2000,
  typicalLatencyMs: 1000,
  dataRetentionDays: 365,
  limitations: [
    'Premium jobs may skew data',
    'Self-reported salary ranges',
    'Duplicate postings possible',
  ],
};

export const DEFAULT_NAUKRI_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 8000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 30,
  },
};

export class NaukriProvider implements DataProvider {
  readonly metadata = NAUKRI_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_NAUKRI_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: NAUKRI_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.config.requiresAuth && !this.config.credentials?.apiKey) {
      throw new Error('Naukri provider requires API key');
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
    const fetchId = `naukri-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          jobCategories: options?.careerIds ?? [],
          metrics: options?.signalTypes ?? this.metadata.signalTypes,
          locations: options?.geography ? [options.geography] : ['all'],
          postedInLast: '24h',
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
          code: 'NAUKRI_FETCH_ERROR',
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

    const jobCategories = payload.jobCategories as string[] ?? [];
    const metrics = payload.metrics as MarketSignalType[] ?? [];

    for (const category of jobCategories) {
      for (const metric of metrics) {
        signals.push({
          careerIdentifier: category,
          careerTitle: category,
          signalType: metric,
          strength: 0,
          unit: metric === 'job_postings' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'naukri',
            category,
            metric,
            postedInLast: payload.postedInLast,
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

export function createNaukriProvider(config?: Partial<DataProviderConfig>): NaukriProvider {
  return new NaukriProvider(config);
}
