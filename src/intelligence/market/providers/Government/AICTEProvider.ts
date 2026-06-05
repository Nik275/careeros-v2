/**
 * CareerOS Market Intelligence - AICTE Provider
 *
 * All India Council for Technical Education data source.
 * https://www.aicte-india.org
 *
 * Signals:
 * - engineering trends
 * - enrollment trends
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

export const AICTE_METADATA: DataSourceMetadata = {
  sourceId: 'aicte',
  sourceName: 'All India Council for Technical Education (AICTE)',
  category: 'government',
  reliabilityScore: 92,
  updateFrequency: 'yearly',
  geographicCoverage: 'india',
  signalTypes: [
    'skill_growth',
    'job_postings',
  ],
  signalTypeReliability: {
    skill_growth: 94,
    job_postings: 85,
  },
  description: 'AICTE regulates technical education in India. Provides enrollment data, institution statistics, and emerging engineering/technical field trends.',
  providerUrl: 'https://www.aicte-india.org',
  requiresAuth: false,
  rateLimitPerHour: 100,
  typicalLatencyMs: 3000,
  dataRetentionDays: 1825, // 5 years
  limitations: [
    'Annual updates only',
    'Focus on technical education only',
    'Limited real-time labor market data',
  ],
};

export const DEFAULT_AICTE_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 20000,
  retryConfig: {
    maxRetries: 2,
    retryDelayMs: 3000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 10080, // 1 week
  },
};

export class AICTEProvider implements DataProvider {
  readonly metadata = AICTE_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_AICTE_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: AICTE_METADATA.reliabilityScore,
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
    const fetchId = `aicte-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          disciplines: options?.careerIds ?? [],
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
          code: 'AICTE_FETCH_ERROR',
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

    // AICTE specializes in technical education enrollment
    const disciplines = payload.disciplines as string[] ?? [];

    for (const discipline of disciplines) {
      // Enrollment trend signals
      signals.push({
        careerIdentifier: discipline,
        careerTitle: discipline,
        signalType: 'skill_growth',
        strength: 0,
        unit: 'enrollment_count',
        geography: rawData.geography,
        periodStart: rawData.dataTimestamp,
        periodEnd: rawData.dataTimestamp,
        context: {
          source: 'aicte',
          discipline,
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

export function createAICTEProvider(config?: Partial<DataProviderConfig>): AICTEProvider {
  return new AICTEProvider(config);
}
