/**
 * CareerOS Market Intelligence - Ministry of Labour Provider
 *
 * Ministry of Labour and Employment, Government of India.
 * https://labour.gov.in
 *
 * Signals:
 * - labor force statistics
 * - employment shifts
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

export const MINISTRY_LABOR_METADATA: DataSourceMetadata = {
  sourceId: 'ministry-labor',
  sourceName: 'Ministry of Labour and Employment (India)',
  category: 'government',
  reliabilityScore: 95,
  updateFrequency: 'quarterly',
  geographicCoverage: 'india',
  signalTypes: [
    'job_postings',
    'layoffs',
    'government_push',
  ],
  signalTypeReliability: {
    job_postings: 94,
    layoffs: 96,
    government_push: 98,
  },
  description: 'Official labor statistics from the Government of India. Provides employment data, labor force participation rates, and policy impact analysis.',
  providerUrl: 'https://labour.gov.in',
  requiresAuth: false,
  rateLimitPerHour: 200,
  typicalLatencyMs: 2500,
  dataRetentionDays: 2190, // 6 years
  limitations: [
    'Quarterly updates',
    'Aggregate data only',
    'Formal sector focus',
  ],
};

export const DEFAULT_MINISTRY_LABOR_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 15000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 4320, // 3 days
  },
};

export class MinistryLaborProvider implements DataProvider {
  readonly metadata = MINISTRY_LABOR_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_MINISTRY_LABOR_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: MINISTRY_LABOR_METADATA.reliabilityScore,
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
    const fetchId = `ministry-labor-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          industries: options?.careerIds ?? [],
          laborMetrics: options?.signalTypes ?? this.metadata.signalTypes,
          geography: options?.geography ?? 'india',
          quarter: this.getCurrentQuarter(),
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
          code: 'MINISTRY_LABOR_FETCH_ERROR',
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

    const industries = payload.industries as string[] ?? [];
    const laborMetrics = payload.laborMetrics as MarketSignalType[] ?? [];

    for (const industry of industries) {
      for (const metric of laborMetrics) {
        signals.push({
          careerIdentifier: industry,
          careerTitle: industry,
          signalType: metric,
          strength: 0,
          unit: metric === 'layoffs' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'ministry-labor',
            industry,
            metric,
            quarter: payload.quarter,
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
      maxHistoricalDays: 2190,
      supportedGeographies: ['india'],
      supportedSignalTypes: this.metadata.signalTypes,
    };
  }

  async dispose(): Promise<void> {
    this.initialized = false;
    this.health.status = 'inactive';
  }

  private getCurrentQuarter(): string {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter}-${year}`;
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

export function createMinistryLaborProvider(config?: Partial<DataProviderConfig>): MinistryLaborProvider {
  return new MinistryLaborProvider(config);
}
