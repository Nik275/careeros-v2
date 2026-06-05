/**
 * CareerOS Market Intelligence - ILO Provider
 *
 * International Labour Organization.
 * https://www.ilo.org
 *
 * Signals:
 * - labor market changes
 * - automation impact
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

export const ILO_METADATA: DataSourceMetadata = {
  sourceId: 'ilo',
  sourceName: 'International Labour Organization',
  category: 'global',
  reliabilityScore: 90,
  updateFrequency: 'yearly',
  geographicCoverage: 'global',
  signalTypes: [
    'automation_risk',
    'job_postings',
    'layoffs',
  ],
  signalTypeReliability: {
    automation_risk: 92,
    job_postings: 85,
    layoffs: 88,
  },
  description: 'UN agency for labor standards. Provides global labor market data, employment trends, and automation impact research.',
  providerUrl: 'https://www.ilo.org',
  apiEndpoint: 'https://ilostat.ilo.org/data', // Placeholder
  requiresAuth: false,
  rateLimitPerHour: 300,
  typicalLatencyMs: 3000,
  dataRetentionDays: 3650, // 10 years
  limitations: [
    'Annual updates typical',
    'Aggregate country-level data',
    'Limited real-time signals',
  ],
};

export const DEFAULT_ILO_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 20000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 3000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 20160, // 2 weeks
  },
};

export class ILOProvider implements DataProvider {
  readonly metadata = ILO_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_ILO_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: ILO_METADATA.reliabilityScore,
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
    const fetchId = `ilo-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          occupations: options?.careerIds ?? [],
          indicators: options?.signalTypes ?? this.metadata.signalTypes,
          country: options?.geography ?? 'india',
          year: new Date().getFullYear() - 1, // Previous year typically
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
          code: 'ILO_FETCH_ERROR',
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

    const occupations = payload.occupations as string[] ?? [];
    const indicators = payload.indicators as MarketSignalType[] ?? [];

    for (const occupation of occupations) {
      for (const indicator of indicators) {
        signals.push({
          careerIdentifier: occupation,
          careerTitle: occupation,
          signalType: indicator,
          strength: 0,
          unit: 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'ilo',
            occupation,
            indicator,
            country: payload.country,
            year: payload.year,
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
      maxHistoricalDays: 3650,
      supportedGeographies: ['global', 'india'],
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

export function createILOProvider(config?: Partial<DataProviderConfig>): ILOProvider {
  return new ILOProvider(config);
}
