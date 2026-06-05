/**
 * CareerOS Market Intelligence - WEF Provider
 *
 * World Economic Forum - Future of Work reports.
 * https://www.weforum.org
 *
 * Signals:
 * - future skills
 * - industry transformations
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

export const WEF_METADATA: DataSourceMetadata = {
  sourceId: 'wef',
  sourceName: 'World Economic Forum',
  category: 'global',
  reliabilityScore: 88,
  updateFrequency: 'yearly',
  geographicCoverage: 'global',
  signalTypes: [
    'skill_growth',
    'automation_risk',
    'government_push',
  ],
  signalTypeReliability: {
    skill_growth: 90,
    automation_risk: 88,
    government_push: 82,
  },
  description: 'Global think tank providing authoritative Future of Jobs reports, skill forecasts, and industry transformation analysis.',
  providerUrl: 'https://www.weforum.org',
  apiEndpoint: 'https://api.weforum.org/v1', // Placeholder
  requiresAuth: false,
  rateLimitPerHour: 200,
  typicalLatencyMs: 3000,
  dataRetentionDays: 2555, // 7 years
  limitations: [
    'Global/regional focus only',
    'Annual publication cycle',
    'Survey-based methodology',
  ],
};

export const DEFAULT_WEF_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 20000,
  retryConfig: {
    maxRetries: 2,
    retryDelayMs: 3000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 20160, // 2 weeks
  },
};

export class WEFProvider implements DataProvider {
  readonly metadata = WEF_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_WEF_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: WEF_METADATA.reliabilityScore,
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
    const fetchId = `wef-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          roles: options?.careerIds ?? [],
          metrics: options?.signalTypes ?? this.metadata.signalTypes,
          reportYear: new Date().getFullYear(),
          region: options?.geography ?? 'global',
        },
        fetchedAt: new Date(),
        dataTimestamp: new Date(),
        geography: options?.geography ?? 'global',
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
          code: 'WEF_FETCH_ERROR',
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

    const roles = payload.roles as string[] ?? [];
    const metrics = payload.metrics as MarketSignalType[] ?? [];

    for (const role of roles) {
      for (const metric of metrics) {
        signals.push({
          careerIdentifier: role,
          careerTitle: role,
          signalType: metric,
          strength: 0,
          unit: 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'wef',
            role,
            metric,
            reportYear: payload.reportYear,
            region: payload.region,
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
      maxHistoricalDays: 2555,
      supportedGeographies: ['global', 'india', 'asia'],
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

export function createWEFProvider(config?: Partial<DataProviderConfig>): WEFProvider {
  return new WEFProvider(config);
}
