/**
 * CareerOS Market Intelligence - UGC Provider
 *
 * University Grants Commission data source.
 * https://www.ugc.gov.in
 *
 * Signals:
 * - higher education trends
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

export const UGC_METADATA: DataSourceMetadata = {
  sourceId: 'ugc',
  sourceName: 'University Grants Commission (UGC)',
  category: 'government',
  reliabilityScore: 90,
  updateFrequency: 'yearly',
  geographicCoverage: 'india',
  signalTypes: [
    'skill_growth',
    'job_postings',
  ],
  signalTypeReliability: {
    skill_growth: 92,
    job_postings: 82,
  },
  description: 'UGC oversees higher education in India. Provides data on university enrollments, emerging academic fields, and research trends.',
  providerUrl: 'https://www.ugc.gov.in',
  requiresAuth: false,
  rateLimitPerHour: 100,
  typicalLatencyMs: 3000,
  dataRetentionDays: 1825,
  limitations: [
    'Annual updates',
    'Academic focus, limited labor market data',
    'Research-oriented metrics',
  ],
};

export const DEFAULT_UGC_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 20000,
  retryConfig: {
    maxRetries: 2,
    retryDelayMs: 3000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 10080,
  },
};

export class UGCProvider implements DataProvider {
  readonly metadata = UGC_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_UGC_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: UGC_METADATA.reliabilityScore,
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
    const fetchId = `ugc-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          fields: options?.careerIds ?? [],
          academicYear: new Date().getFullYear(),
          geography: options?.geography ?? 'india',
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
          code: 'UGC_FETCH_ERROR',
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

    const fields = payload.fields as string[] ?? [];

    for (const field of fields) {
      signals.push({
        careerIdentifier: field,
        careerTitle: field,
        signalType: 'skill_growth',
        strength: 0,
        unit: 'enrollment_count',
        geography: rawData.geography,
        periodStart: rawData.dataTimestamp,
        periodEnd: rawData.dataTimestamp,
        context: {
          source: 'ugc',
          field,
          academicYear: payload.academicYear,
        },
      });
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
      maxHistoricalDays: 1825,
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

export function createUGCProvider(config?: Partial<DataProviderConfig>): UGCProvider {
  return new UGCProvider(config);
}
