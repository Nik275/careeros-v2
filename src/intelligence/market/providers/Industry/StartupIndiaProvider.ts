/**
 * CareerOS Market Intelligence - Startup India Provider
 *
 * Startup India - Government initiative tracking startup ecosystem.
 * https://www.startupindia.gov.in
 *
 * Signals:
 * - startup growth
 * - emerging industries
 * - funding activity
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

export const STARTUP_INDIA_METADATA: DataSourceMetadata = {
  sourceId: 'startup-india',
  sourceName: 'Startup India',
  category: 'industry',
  reliabilityScore: 85,
  updateFrequency: 'monthly',
  geographicCoverage: 'india',
  signalTypes: [
    'startup_activity',
    'investment_flow',
    'skill_growth',
    'job_postings',
  ],
  signalTypeReliability: {
    startup_activity: 88,
    investment_flow: 82,
    skill_growth: 78,
    job_postings: 75,
  },
  description: 'Government initiative tracking India\'s startup ecosystem. Provides data on new startups, funding rounds, and emerging sectors.',
  providerUrl: 'https://www.startupindia.gov.in',
  apiEndpoint: 'https://api.startupindia.gov.in/v1', // Placeholder
  requiresAuth: false,
  rateLimitPerHour: 500,
  typicalLatencyMs: 2000,
  dataRetentionDays: 1095,
  limitations: [
    'Recognized startups only',
    'Self-reported data',
    'Delayed funding information',
  ],
};

export const DEFAULT_STARTUP_INDIA_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 12000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 1500,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 1440, // 24 hours
  },
};

export class StartupIndiaProvider implements DataProvider {
  readonly metadata = STARTUP_INDIA_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_STARTUP_INDIA_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: STARTUP_INDIA_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
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
    const fetchId = `startup-india-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          sectors: options?.careerIds ?? [],
          metrics: options?.signalTypes ?? this.metadata.signalTypes,
          stage: 'all',
          recognizedOnly: true,
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
          code: 'STARTUP_INDIA_FETCH_ERROR',
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

    const sectors = payload.sectors as string[] ?? [];
    const metrics = payload.metrics as MarketSignalType[] ?? [];

    for (const sector of sectors) {
      for (const metric of metrics) {
        signals.push({
          careerIdentifier: sector,
          careerTitle: sector,
          signalType: metric,
          strength: 0,
          unit: metric === 'job_postings' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'startup-india',
            sector,
            metric,
            stage: payload.stage,
            recognizedOnly: payload.recognizedOnly,
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

export function createStartupIndiaProvider(config?: Partial<DataProviderConfig>): StartupIndiaProvider {
  return new StartupIndiaProvider(config);
}
