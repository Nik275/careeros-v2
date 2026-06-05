/**
 * CareerOS Market Intelligence - Market Intelligence Provider Interface
 *
 * High-level interface for consuming market intelligence from other CareerOS modules.
 * This is the interface that matching, recommendation, and decision engines use.
 */

import type { CareerMarketProfile, MarketOutlook } from '../models/CareerMarketProfile';
import type { MarketTrend, MarketTrendDirection, CareerTrendAnalysis } from '../models/MarketTrend';
import type { MarketSnapshot } from '../models/MarketSnapshot';
import type { EmergingCareer } from '../models/EmergingCareer';

/**
 * Market intelligence query options.
 */
export interface MarketIntelligenceQuery {
  /** Career ID */
  careerId: string;

  /** Data freshness requirement (hours) */
  maxAgeHours?: number;

  /** Minimum confidence required */
  minConfidence?: number;
}

/**
 * Market intelligence result.
 */
export interface MarketIntelligenceResult {
  /** Career ID */
  readonly careerId: string;

  /** Whether intelligence is available */
  readonly isAvailable: boolean;

  /** Market profile (if available) */
  readonly profile?: CareerMarketProfile;

  /** Current trend (if available) */
  readonly trend?: MarketTrend;

  /** Latest snapshot (if available) */
  readonly snapshot?: MarketSnapshot;

  /** Result confidence */
  readonly confidence: number;

  /** Data freshness (hours since last update) */
  readonly dataFreshness: number;

  /** Warning flags */
  readonly warnings: string[];
}

/**
 * Comparative market intelligence.
 */
export interface ComparativeMarketIntelligence {
  /** Base career */
  readonly baseCareerId: string;

  /** Comparison careers */
  readonly comparisonCareerIds: string[];

  /** Base profile */
  readonly baseProfile: CareerMarketProfile;

  /** Comparison profiles */
  readonly comparisonProfiles: CareerMarketProfile[];

  /** Rankings by different metrics */
  readonly rankings: {
    byDemand: string[];
    bySalary: string[];
    byGrowth: string[];
    byFutureResilience: string[];
    overall: string[];
  };

  /** Comparative advantages */
  readonly advantages: Record<string, string[]>;

  /** Risk comparison */
  readonly riskComparison: {
    lowestAutomationRisk: string;
    highestAutomationRisk: string;
    mostStable: string;
    mostVolatile: string;
  };
}

/**
 * Market outlook summary.
 */
export interface MarketOutlookSummary {
  /** Overall market direction */
  readonly overallDirection: 'expanding' | 'stable' | 'contracting';

  /** Summary by outlook category */
  readonly byOutlook: Record<MarketOutlook, number>;

  /** Top performing careers */
  readonly topPerformers: Array<{
    careerId: string;
    score: number;
    trend: MarketTrendDirection;
  }>;

  /** Careers requiring attention */
  readonly requiringAttention: Array<{
    careerId: string;
    concern: string;
    severity: 'high' | 'medium' | 'low';
  }>;

  /** Emerging trends */
  readonly emergingTrends: string[];

  /** Market confidence */
  readonly marketConfidence: number;

  /** Last updated */
  readonly lastUpdated: Date;
}

/**
 * High-level interface for consuming market intelligence.
 * 
 * This interface is consumed by:
 * - Career matching engines
 * - Recommendation engines
 * - Decision intelligence engines
 * - Future simulation engines
 * 
 * It provides a simplified, read-only view of market intelligence.
 */
export interface MarketIntelligenceProvider {
  /**
   * Get market intelligence for a career.
   */
  getIntelligence(query: MarketIntelligenceQuery): Promise<MarketIntelligenceResult>;

  /**
   * Get market profiles for multiple careers.
   */
  getIntelligenceForCareers(
    careerIds: string[],
    options?: { minConfidence?: number }
  ): Promise<Map<string, MarketIntelligenceResult>>;

  /**
   * Get the authoritative market profile for a career.
   * 
   * This is the primary API for consuming market intelligence.
   */
  getMarketProfile(careerId: string): Promise<CareerMarketProfile | null>;

  /**
   * Get current market trend for a career.
   */
  getMarketTrend(
    careerId: string,
    trendType?: string
  ): Promise<MarketTrend | null>;

  /**
   * Get comprehensive trend analysis for a career.
   */
  getTrendAnalysis(careerId: string): Promise<CareerTrendAnalysis | null>;

  /**
   * Get latest market snapshot for a career.
   */
  getMarketSnapshot(careerId: string): Promise<MarketSnapshot | null>;

  /**
   * Get comparative intelligence for multiple careers.
   */
  getComparativeIntelligence(
    baseCareerId: string,
    comparisonCareerIds: string[]
  ): Promise<ComparativeMarketIntelligence>;

  /**
   * Get market outlook summary.
   */
  getMarketOutlookSummary(): Promise<MarketOutlookSummary>;

  /**
   * Get emerging careers.
   */
  getEmergingCareers(options?: {
    minConfidence?: number;
    minGrowthRate?: number;
    limit?: number;
  }): Promise<EmergingCareer[]>;

  /**
   * Get top careers by market metric.
   */
  getTopCareersByMetric(
    metric: keyof CareerMarketProfile,
    limit: number
  ): Promise<Array<{ careerId: string; score: number }>>;

  /**
   * Get careers with positive outlook.
   */
  getPositiveOutlookCareers(options?: {
    minOutlook?: MarketOutlook;
    limit?: number;
  }): Promise<CareerMarketProfile[]>;

  /**
   * Get careers requiring attention (declining, high risk, etc.).
   */
  getCareersRequiringAttention(): Promise<
    Array<{
      careerId: string;
      profile: CareerMarketProfile;
      concerns: string[];
    }>
  >;

  /**
   * Check if market intelligence is available for a career.
   */
  isIntelligenceAvailable(careerId: string): Promise<boolean>;

  /**
   * Get confidence level for career intelligence.
   */
  getConfidenceLevel(careerId: string): Promise<number>;

  /**
   * Get data freshness for career intelligence.
   */
  getDataFreshness(careerId: string): Promise<number>; // hours

  /**
   * Subscribe to intelligence updates for a career.
   */
  subscribeToUpdates(
    careerId: string,
    callback: (update: MarketIntelligenceResult) => void
  ): () => void;

  /**
   * Get provider health status.
   */
  getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providerCount: number;
    healthyProviders: number;
    lastUpdate: Date | null;
    issues: string[];
  }>;

  /**
   * Get intelligence coverage statistics.
   */
  getCoverageStatistics(): Promise<{
    totalCareers: number;
    withIntelligence: number;
    withHighConfidence: number;
    averageConfidence: number;
    averageDataFreshness: number;
  }>;
}

/**
 * Configuration for market intelligence provider.
 */
export interface MarketIntelligenceProviderConfig {
  /** Default minimum confidence */
  defaultMinConfidence: number;

  /** Default maximum data age (hours) */
  defaultMaxAgeHours: number;

  /** Enable caching */
  enableCaching: boolean;

  /** Cache TTL (minutes) */
  cacheTtlMinutes: number;

  /** Enable real-time updates */
  enableRealTimeUpdates: boolean;

  /** Update check interval (minutes) */
  updateCheckIntervalMinutes: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_MARKET_INTELLIGENCE_PROVIDER_CONFIG: MarketIntelligenceProviderConfig = {
  defaultMinConfidence: 50,
  defaultMaxAgeHours: 48,
  enableCaching: true,
  cacheTtlMinutes: 30,
  enableRealTimeUpdates: false,
  updateCheckIntervalMinutes: 60,
};
