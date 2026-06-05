/**
 * CareerOS Market Intelligence - LinkedIn Provider
 *
 * LinkedIn - Professional network with India presence.
 * https://www.linkedin.com
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

export const LINKEDIN_METADATA: DataSourceMetadata = {
  sourceId: 'linkedin',
  sourceName: 'LinkedIn',
  category: 'job_market',
  reliabilityScore: 82,
  updateFrequency: 'daily',
  geographicCoverage: 'india',
  signalTypes: [
    'job_postings',
    'skill_growth',
    'salary_growth',
  ],
  signalTypeReliability: {
    job_postings: 85,
    skill_growth: 82,
    salary_growth: 75,
  },
  description: 'Professional network providing job market data with focus on white-collar and professional roles. Strong coverage of corporate and tech positions.',
  providerUrl: 'https://www.linkedin.com',
  apiEndpoint: 'https://api.linkedin.com/v2', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 1500,
  typicalLatencyMs: 1800,
  dataRetentionDays: 730,
  limitations: [
    'Professional/white-collar bias',
    'Premium API required for full data',
    'Limited salary transparency',
  ],
};

export const DEFAULT_LINKEDIN_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 15000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 60,
  },
};

export class LinkedInProvider implements DataProvider {
  readonly metadata = LINKEDIN_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_LINKEDIN_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: LINKEDIN_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.config.requiresAuth && !this.config.credentials?.oauthConfig) {
      throw new Error('LinkedIn provider requires OAuth credentials');
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
    const fetchId = `linkedin-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          titles: options?.careerIds ?? [],
          facets: options?.signalTypes ?? this.metadata.signalTypes,
          location: options?.geography ?? 'india',
          timePosted: 'past_week',
          experienceLevels: ['entry', 'associate', 'mid-senior'],
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
          code: 'LINKEDIN_FETCH_ERROR',
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

    const titles = payload.titles as string[] ?? [];
    const facets = payload.facets as MarketSignalType[] ?? [];

    for (const title of titles) {
      for (const facet of facets) {
        signals.push({
          careerIdentifier: title,
          careerTitle: title,
          signalType: facet,
          strength: 0,
          unit: facet === 'job_postings' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'linkedin',
            title,
            facet,
            timePosted: payload.timePosted,
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
      maxHistoricalDays: 730,
      supportedGeographies: ['india', 'global'],
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

export function createLinkedInProvider(config?: Partial<DataProviderConfig>): LinkedInProvider {
  return new LinkedInProvider(config);
}
