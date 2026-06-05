/**
 * CareerOS Market Intelligence - NASSCOM Provider
 *
 * National Association of Software and Service Companies.
 * https://www.nasscom.in
 *
 * Signals:
 * - technology demand
 * - AI demand
 * - software trends
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

export const NASSCOM_METADATA: DataSourceMetadata = {
  sourceId: 'nasscom',
  sourceName: 'NASSCOM',
  category: 'industry',
  reliabilityScore: 88,
  updateFrequency: 'quarterly',
  geographicCoverage: 'india',
  signalTypes: [
    'skill_growth',
    'job_postings',
    'investment_flow',
    'startup_activity',
  ],
  signalTypeReliability: {
    skill_growth: 92,
    job_postings: 85,
    investment_flow: 88,
    startup_activity: 86,
  },
  description: 'Industry association for Indian IT and BPM sectors. Provides authoritative data on technology trends, AI adoption, and IT services demand.',
  providerUrl: 'https://www.nasscom.in',
  apiEndpoint: 'https://api.nasscom.in/v1', // Placeholder
  requiresAuth: true,
  rateLimitPerHour: 300,
  typicalLatencyMs: 2500,
  dataRetentionDays: 1460, // 4 years
  limitations: [
    'IT sector focus only',
    'Quarterly updates',
    'Member-only detailed reports',
  ],
};

export const DEFAULT_NASSCOM_CONFIG: DataProviderConfig = {
  enabled: true,
  timeoutMs: 15000,
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 2000,
    backoffMultiplier: 2,
  },
  cacheConfig: {
    enabled: true,
    ttlMinutes: 2880, // 2 days
  },
};

export class NasscomProvider implements DataProvider {
  readonly metadata = NASSCOM_METADATA;
  config: DataProviderConfig;
  health: ProviderHealth;

  private initialized = false;

  constructor(config?: Partial<DataProviderConfig>) {
    this.config = { ...DEFAULT_NASSCOM_CONFIG, ...config };
    this.health = {
      status: 'inactive',
      lastSuccessfulFetch: null,
      lastFailedFetch: null,
      consecutiveFailures: 0,
      totalFetches: 0,
      successfulFetches: 0,
      averageLatencyMs: 0,
      currentReliabilityScore: NASSCOM_METADATA.reliabilityScore,
      issues: [],
    };
  }

  async initialize(): Promise<void> {
    if (this.config.requiresAuth && !this.config.credentials?.apiKey) {
      throw new Error('NASSCOM provider requires API key');
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
    const fetchId = `nasscom-${Date.now()}`;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const mockRawData: RawMarketData = {
        sourceId: this.metadata.sourceId,
        payload: {
          techRoles: options?.careerIds ?? [],
          metrics: options?.signalTypes ?? this.metadata.signalTypes,
          sector: 'it-bpm',
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
          code: 'NASSCOM_FETCH_ERROR',
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

    const techRoles = payload.techRoles as string[] ?? [];
    const metrics = payload.metrics as MarketSignalType[] ?? [];

    for (const role of techRoles) {
      for (const metric of metrics) {
        signals.push({
          careerIdentifier: role,
          careerTitle: role,
          signalType: metric,
          strength: 0,
          unit: metric === 'job_postings' ? 'count' : 'index',
          geography: rawData.geography,
          periodStart: rawData.dataTimestamp,
          periodEnd: rawData.dataTimestamp,
          context: {
            source: 'nasscom',
            role,
            metric,
            sector: payload.sector,
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
      maxHistoricalDays: 1460,
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
    return `Q${quarter}-FY${year}`;
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

export function createNasscomProvider(config?: Partial<DataProviderConfig>): NasscomProvider {
  return new NasscomProvider(config);
}
