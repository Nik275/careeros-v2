/**
 * CareerOS Market Intelligence - Market Intelligence Engine
 *
 * Main orchestrator for the market intelligence layer.
 * Coordinates all market engines and exposes the intelligence interface.
 */

import type { MarketSignal } from './models/MarketSignal';
import type { MarketTrend, CareerTrendAnalysis, MarketTrendType } from './models/MarketTrend';
import { MarketTrendDirection } from './models/MarketTrend';
import type { CareerMarketProfile } from './models/CareerMarketProfile';
import { MarketOutlook } from './models/CareerMarketProfile';
import type { MarketSnapshot } from './models/MarketSnapshot';
import type { EmergingCareer } from './models/EmergingCareer';
import type { MarketRepository } from './repositories/MarketRepository';
import type { CareerMarketRepository } from './repositories/CareerMarketRepository';
import type {
  MarketIntelligenceProvider,
  MarketIntelligenceQuery,
  MarketIntelligenceResult,
  ComparativeMarketIntelligence,
  MarketOutlookSummary,
} from './interfaces/MarketIntelligenceProvider';
import type { MarketProvider } from './interfaces/MarketProvider';
import { MarketSignalEngine } from './MarketSignalEngine';
import { MarketTrendEngine } from './MarketTrendEngine';
import { MarketConfidenceEngine } from './MarketConfidenceEngine';
import { CareerMarketProfileEngine } from './CareerMarketProfileEngine';
import { EmergingCareerEngine } from './EmergingCareerEngine';
import {
  PROFILE_COMPONENT_WEIGHTS,
  OUTLOOK_SCORE_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
} from './constants/MarketWeights';

/**
 * Configuration for MarketIntelligenceEngine.
 */
export interface MarketIntelligenceEngineConfig {
  /** Enable automatic updates */
  enableAutoUpdate: boolean;

  /** Update interval (minutes) */
  updateIntervalMinutes: number;

  /** Default minimum confidence */
  defaultMinConfidence: number;

  /** Default maximum data age (hours) */
  defaultMaxAgeHours: number;

  /** Enable trend detection */
  enableTrendDetection: boolean;

  /** Enable emerging career detection */
  enableEmergingDetection: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_MARKET_INTELLIGENCE_ENGINE_CONFIG: MarketIntelligenceEngineConfig = {
  enableAutoUpdate: false,
  updateIntervalMinutes: 60,
  defaultMinConfidence: 50,
  defaultMaxAgeHours: 48,
  enableTrendDetection: true,
  enableEmergingDetection: true,
};

const MARKET_TREND_TYPES: readonly MarketTrendType[] = [
  'demand',
  'salary',
  'growth',
  'competition',
  'automation_risk',
  'skill_demand',
  'hiring_rate',
];

function isMarketTrendType(value: string): value is MarketTrendType {
  return MARKET_TREND_TYPES.includes(value as MarketTrendType);
}

const MARKET_OUTLOOK_ORDER: readonly CareerMarketProfile['outlook'][] = [
  MarketOutlook.EXCELLENT,
  MarketOutlook.GOOD,
  MarketOutlook.NEUTRAL,
  MarketOutlook.CAUTION,
  MarketOutlook.POOR,
];

/**
 * Engine initialization options.
 */
export interface EngineInitOptions {
  signalEngine?: Partial<ConstructorParameters<typeof MarketSignalEngine>[1]>;
  trendEngine?: Partial<ConstructorParameters<typeof MarketTrendEngine>[1]>;
  confidenceEngine?: Partial<ConstructorParameters<typeof MarketConfidenceEngine>[0]>;
  profileEngine?: Partial<ConstructorParameters<typeof CareerMarketProfileEngine>[2]>;
  emergingEngine?: Partial<ConstructorParameters<typeof EmergingCareerEngine>[2]>;
}

/**
 * Main orchestrator for market intelligence.
 *
 * Implements MarketIntelligenceProvider interface for consumption by other modules.
 * Coordinates signal processing, trend analysis, and profile generation.
 */
export class MarketIntelligenceEngine implements MarketIntelligenceProvider {
  private config: MarketIntelligenceEngineConfig;
  private marketRepository: MarketRepository;
  private careerRepository: CareerMarketRepository;

  // Sub-engines
  signalEngine: MarketSignalEngine;
  trendEngine: MarketTrendEngine;
  confidenceEngine: MarketConfidenceEngine;
  profileEngine: CareerMarketProfileEngine;
  emergingEngine: EmergingCareerEngine;

  // Provider registry
  private providers: Map<string, MarketProvider> = new Map();

  // Update subscription callbacks
  private subscribers: Map<string, Set<(update: MarketIntelligenceResult) => void>> = new Map();

  constructor(
    marketRepository: MarketRepository,
    careerRepository: CareerMarketRepository,
    config?: Partial<MarketIntelligenceEngineConfig>,
    options?: EngineInitOptions
  ) {
    this.marketRepository = marketRepository;
    this.careerRepository = careerRepository;
    this.config = { ...DEFAULT_MARKET_INTELLIGENCE_ENGINE_CONFIG, ...config };

    // Initialize sub-engines
    this.confidenceEngine = new MarketConfidenceEngine(options?.confidenceEngine);
    this.signalEngine = new MarketSignalEngine(marketRepository, options?.signalEngine);
    this.trendEngine = new MarketTrendEngine(marketRepository, options?.trendEngine);
    this.profileEngine = new CareerMarketProfileEngine(
      careerRepository,
      this.confidenceEngine,
      options?.profileEngine
    );
    this.emergingEngine = new EmergingCareerEngine(
      marketRepository,
      this.confidenceEngine,
      options?.emergingEngine
    );
  }

  // ============================================================================
  // MARKET INTELLIGENCE PROVIDER INTERFACE
  // ============================================================================

  async getIntelligence(query: MarketIntelligenceQuery): Promise<MarketIntelligenceResult> {
    const { careerId, maxAgeHours = this.config.defaultMaxAgeHours, minConfidence = this.config.defaultMinConfidence } = query;

    const profile = await this.getMarketProfile(careerId);
    const trend = await this.getMarketTrend(careerId);
    const snapshot = await this.getMarketSnapshot(careerId);

    const isAvailable = profile !== null && profile.confidence >= minConfidence;
    const dataFreshness = profile
      ? (Date.now() - profile.lastUpdated.getTime()) / (1000 * 60 * 60)
      : Infinity;

    const warnings: string[] = [];

    if (dataFreshness > maxAgeHours) {
      warnings.push(`Data is ${Math.round(dataFreshness)} hours old`);
    }

    if (profile && profile.confidence < minConfidence) {
      warnings.push(`Confidence ${profile.confidence}% below threshold ${minConfidence}%`);
    }

    return {
      careerId,
      isAvailable,
      profile: profile ?? undefined,
      trend: trend ?? undefined,
      snapshot: snapshot ?? undefined,
      confidence: profile?.confidence ?? 0,
      dataFreshness,
      warnings,
    };
  }

  async getIntelligenceForCareers(
    careerIds: string[],
    options?: { minConfidence?: number }
  ): Promise<Map<string, MarketIntelligenceResult>> {
    const results = new Map<string, MarketIntelligenceResult>();

    for (const careerId of careerIds) {
      const intelligence = await this.getIntelligence({
        careerId,
        minConfidence: options?.minConfidence,
      });
      results.set(careerId, intelligence);
    }

    return results;
  }

  async getMarketProfile(careerId: string): Promise<CareerMarketProfile | null> {
    return this.careerRepository.getProfileByCareerId(careerId);
  }

  async getMarketTrend(careerId: string, trendType?: string): Promise<MarketTrend | null> {
    const trends = await this.trendEngine.analyzeCareerTrends(careerId);

    if (!trends) return null;

    if (trendType) {
      return isMarketTrendType(trendType) ? trends.trends[trendType] ?? null : null;
    }

    // Return overall trend as generic trend
    return Object.values(trends.trends)[0] ?? null;
  }

  async getTrendAnalysis(careerId: string): Promise<CareerTrendAnalysis | null> {
    return this.trendEngine.analyzeCareerTrends(careerId);
  }

  async getMarketSnapshot(careerId: string): Promise<MarketSnapshot | null> {
    return this.marketRepository.getLatestSnapshot(careerId);
  }

  async getComparativeIntelligence(
    baseCareerId: string,
    comparisonCareerIds: string[]
  ): Promise<ComparativeMarketIntelligence> {
    const baseProfile = await this.getMarketProfile(baseCareerId);

    if (!baseProfile) {
      throw new Error(`No profile found for career ${baseCareerId}`);
    }

    const allIds = [baseCareerId, ...comparisonCareerIds];
    const profiles = await this.careerRepository.getProfilesByCareerIds(allIds);
    const profileMap = new Map(profiles.map((p) => [p.careerId, p]));

    const comparisonProfiles = comparisonCareerIds
      .map((id) => profileMap.get(id))
      .filter((p): p is CareerMarketProfile => p !== undefined);

    const rankings = this.calculateRankings([baseProfile, ...comparisonProfiles]);

    const advantages: Record<string, string[]> = {};
    for (const profile of comparisonProfiles) {
      advantages[profile.careerId] = this.identifyAdvantages(baseProfile, profile);
    }

    const riskComparison = this.compareRisks([baseProfile, ...comparisonProfiles]);

    return {
      baseCareerId,
      comparisonCareerIds,
      baseProfile,
      comparisonProfiles,
      rankings,
      advantages,
      riskComparison,
    };
  }

  async getMarketOutlookSummary(): Promise<MarketOutlookSummary> {
    const allProfiles = await this.careerRepository.getAllProfiles();

    const byOutlook: Record<CareerMarketProfile['outlook'], number> = {
      [MarketOutlook.EXCELLENT]: 0,
      [MarketOutlook.GOOD]: 0,
      [MarketOutlook.NEUTRAL]: 0,
      [MarketOutlook.CAUTION]: 0,
      [MarketOutlook.POOR]: 0,
    };

    for (const profile of allProfiles) {
      byOutlook[profile.outlook]++;
    }

    // Calculate overall direction
    const positiveCount = byOutlook[MarketOutlook.EXCELLENT] + byOutlook[MarketOutlook.GOOD];
    const negativeCount = byOutlook[MarketOutlook.CAUTION] + byOutlook[MarketOutlook.POOR];
    const overallDirection: MarketOutlookSummary['overallDirection'] =
      positiveCount > negativeCount * 1.5
        ? 'expanding'
        : negativeCount > positiveCount * 1.5
          ? 'contracting'
          : 'stable';

    // Get top performers
    const topPerformers = allProfiles
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 5)
      .map((p) => ({
        careerId: p.careerId,
        score: p.demandScore,
        trend:
          p.growthScore > 60
            ? MarketTrendDirection.GROWTH
            : p.growthScore < 40
              ? MarketTrendDirection.DECLINING
              : MarketTrendDirection.STABLE,
      }));

    // Get careers requiring attention
    const requiringAttention = allProfiles
      .filter(
        (p) =>
          p.outlook === MarketOutlook.POOR ||
          p.outlook === MarketOutlook.CAUTION ||
          p.automationRiskScore > 70
      )
      .map((p) => ({
        careerId: p.careerId,
        concern: p.automationRiskScore > 70 ? 'High automation risk' : 'Poor market outlook',
        severity: p.outlook === MarketOutlook.POOR ? 'high' as const : 'medium' as const,
      }));

    const marketConfidence = allProfiles.length > 0
      ? allProfiles.reduce((sum, p) => sum + p.confidence, 0) / allProfiles.length
      : 0;

    return {
      overallDirection,
      byOutlook,
      topPerformers,
      requiringAttention,
      emergingTrends: [], // Would be populated by emerging career engine
      marketConfidence: Math.round(marketConfidence),
      lastUpdated: new Date(),
    };
  }

  async getEmergingCareers(options?: {
    minConfidence?: number;
    minGrowthRate?: number;
    limit?: number;
  }): Promise<EmergingCareer[]> {
    if (!this.config.enableEmergingDetection) return [];

    const emerging = await this.emergingEngine.detectEmergingCareers({
      minGrowthRate: options?.minGrowthRate,
    });

    let filtered = emerging;

    if (options?.minConfidence) {
      filtered = filtered.filter((e) => e.confidence >= options.minConfidence!);
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getTopCareersByMetric(
    metric: keyof CareerMarketProfile,
    limit: number
  ): Promise<Array<{ careerId: string; score: number }>> {
    const allProfiles = await this.careerRepository.getAllProfiles();

    const validProfiles = allProfiles.filter((p) => typeof p[metric] === 'number');

    return validProfiles
      .sort((a, b) => (b[metric] as number) - (a[metric] as number))
      .slice(0, limit)
      .map((p) => ({
        careerId: p.careerId,
        score: p[metric] as number,
      }));
  }

  async getPositiveOutlookCareers(options?: {
    minOutlook?: CareerMarketProfile['outlook'];
    limit?: number;
  }): Promise<CareerMarketProfile[]> {
    const minOutlook = options?.minOutlook ?? MarketOutlook.GOOD;
    const allProfiles = await this.careerRepository.getAllProfiles();

    const minIndex = MARKET_OUTLOOK_ORDER.indexOf(minOutlook);

    const filtered = allProfiles.filter((p) => {
      const index = MARKET_OUTLOOK_ORDER.indexOf(p.outlook);
      return index <= minIndex;
    });

    if (options?.limit) {
      return filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getCareersRequiringAttention(): Promise<
    Array<{ careerId: string; profile: CareerMarketProfile; concerns: string[] }>
  > {
    const allProfiles = await this.careerRepository.getAllProfiles();

    const result: Array<{ careerId: string; profile: CareerMarketProfile; concerns: string[] }> = [];

    for (const profile of allProfiles) {
      const concerns: string[] = [];

      if (profile.outlook === MarketOutlook.POOR) concerns.push('Poor market outlook');
      if (profile.outlook === MarketOutlook.CAUTION) concerns.push('Cautious outlook');
      if (profile.automationRiskScore > 70) concerns.push('High automation risk');
      if (profile.demandScore < 30) concerns.push('Low demand');
      if (profile.growthScore < 30) concerns.push('Declining growth');
      if (profile.confidence < 50) concerns.push('Low data confidence');

      if (concerns.length > 0) {
        result.push({ careerId: profile.careerId, profile, concerns });
      }
    }

    return result;
  }

  async isIntelligenceAvailable(careerId: string): Promise<boolean> {
    const profile = await this.getMarketProfile(careerId);
    return profile !== null && profile.confidence >= this.config.defaultMinConfidence;
  }

  async getConfidenceLevel(careerId: string): Promise<number> {
    const profile = await this.getMarketProfile(careerId);
    return profile?.confidence ?? 0;
  }

  async getDataFreshness(careerId: string): Promise<number> {
    const profile = await this.getMarketProfile(careerId);
    if (!profile) return Infinity;
    return (Date.now() - profile.lastUpdated.getTime()) / (1000 * 60 * 60);
  }

  subscribeToUpdates(
    careerId: string,
    callback: (update: MarketIntelligenceResult) => void
  ): () => void {
    if (!this.subscribers.has(careerId)) {
      this.subscribers.set(careerId, new Set());
    }

    this.subscribers.get(careerId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(careerId)?.delete(callback);
    };
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providerCount: number;
    healthyProviders: number;
    lastUpdate: Date | null;
    issues: string[];
  }> {
    const issues: string[] = [];
    let healthyProviders = 0;

    for (const provider of this.providers.values()) {
      const health = await provider.healthCheck();
      if (health.status === 'healthy') {
        healthyProviders++;
      } else if (health.status === 'degraded') {
        issues.push(`Provider ${provider.config.id} is degraded`);
      } else {
        issues.push(`Provider ${provider.config.id} is unhealthy`);
      }
    }

    const status: 'healthy' | 'degraded' | 'unhealthy' =
      issues.length === 0 ? 'healthy' : issues.length < 3 ? 'degraded' : 'unhealthy';

    // Get last update from repository
    const collection = await this.marketRepository.getLatestSnapshotCollection();

    return {
      status,
      providerCount: this.providers.size,
      healthyProviders,
      lastUpdate: collection?.timestamp ?? null,
      issues,
    };
  }

  async getCoverageStatistics(): Promise<{
    totalCareers: number;
    withIntelligence: number;
    withHighConfidence: number;
    averageConfidence: number;
    averageDataFreshness: number;
  }> {
    const allProfiles = await this.careerRepository.getAllProfiles();

    const withIntelligence = allProfiles.length;
    const withHighConfidence = allProfiles.filter((p) => p.confidence >= 70).length;
    const averageConfidence =
      allProfiles.length > 0
        ? allProfiles.reduce((sum, p) => sum + p.confidence, 0) / allProfiles.length
        : 0;

    const now = Date.now();
    const averageDataFreshness =
      allProfiles.length > 0
        ? allProfiles.reduce((sum, p) => sum + (now - p.lastUpdated.getTime()) / (1000 * 60 * 60), 0) /
          allProfiles.length
        : 0;

    return {
      totalCareers: withIntelligence, // In real implementation, would get from career taxonomy
      withIntelligence,
      withHighConfidence,
      averageConfidence: Math.round(averageConfidence),
      averageDataFreshness: Math.round(averageDataFreshness),
    };
  }

  // ============================================================================
  // PROVIDER MANAGEMENT
  // ============================================================================

  registerProvider(provider: MarketProvider): void {
    this.providers.set(provider.config.id, provider);
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  getProvider(providerId: string): MarketProvider | undefined {
    return this.providers.get(providerId);
  }

  getAllProviders(): MarketProvider[] {
    return Array.from(this.providers.values());
  }

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  async processSignals(signals: MarketSignal[]): Promise<void> {
    await this.signalEngine.processSignals(signals);
  }

  async updateCareerProfile(careerId: string): Promise<CareerMarketProfile | null> {
    const trends = await this.trendEngine.analyzeCareerTrends(careerId);
    const signals = await this.marketRepository.getAggregateSignalsByCareer(careerId);
    const snapshots = await this.marketRepository.getSnapshotsByCareer(careerId);

    if (!trends) return null;

    const profile = await this.profileEngine.generateProfile({
      careerId,
      trends: Object.values(trends.trends),
      signals,
      snapshots,
    });

    if (profile) {
      this.notifySubscribers(careerId);
    }

    return profile;
  }

  async updateAllProfiles(): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    const careerIds = await this.marketRepository.getCareersWithData();

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const careerId of careerIds) {
      try {
        const profile = await this.updateCareerProfile(careerId);
        if (profile) {
          updated++;
        }
      } catch (error) {
        failed++;
        errors.push(`Failed to update ${careerId}: ${error}`);
      }
    }

    return { updated, failed, errors };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private calculateRankings(profiles: CareerMarketProfile[]): ComparativeMarketIntelligence['rankings'] {
    const byDemand = [...profiles].sort((a, b) => b.demandScore - a.demandScore).map((p) => p.careerId);
    const bySalary = [...profiles].sort((a, b) => b.salaryScore - a.salaryScore).map((p) => p.careerId);
    const byGrowth = [...profiles].sort((a, b) => b.growthScore - a.growthScore).map((p) => p.careerId);
    const byFutureResilience = [...profiles]
      .sort((a, b) => b.futureResilienceScore - a.futureResilienceScore)
      .map((p) => p.careerId);

    // Overall ranking (weighted average)
    const overall = [...profiles]
      .sort((a, b) => {
        const aScore =
          a.demandScore * PROFILE_COMPONENT_WEIGHTS.demandScore +
          a.salaryScore * PROFILE_COMPONENT_WEIGHTS.salaryScore +
          a.growthScore * PROFILE_COMPONENT_WEIGHTS.growthScore +
          a.futureResilienceScore * PROFILE_COMPONENT_WEIGHTS.futureResilienceScore;
        const bScore =
          b.demandScore * PROFILE_COMPONENT_WEIGHTS.demandScore +
          b.salaryScore * PROFILE_COMPONENT_WEIGHTS.salaryScore +
          b.growthScore * PROFILE_COMPONENT_WEIGHTS.growthScore +
          b.futureResilienceScore * PROFILE_COMPONENT_WEIGHTS.futureResilienceScore;
        return bScore - aScore;
      })
      .map((p) => p.careerId);

    return { byDemand, bySalary, byGrowth, byFutureResilience, overall };
  }

  private identifyAdvantages(base: CareerMarketProfile, comparison: CareerMarketProfile): string[] {
    const advantages: string[] = [];
    const threshold = 10;

    if (comparison.demandScore > base.demandScore + threshold) advantages.push('Higher demand');
    if (comparison.salaryScore > base.salaryScore + threshold) advantages.push('Better salary prospects');
    if (comparison.growthScore > base.growthScore + threshold) advantages.push('Stronger growth trajectory');
    if (comparison.scarcityScore > base.scarcityScore + threshold) advantages.push('Greater skill scarcity');
    if (comparison.automationRiskScore < base.automationRiskScore - threshold)
      advantages.push('Lower automation risk');
    if (comparison.futureResilienceScore > base.futureResilienceScore + threshold)
      advantages.push('Better future resilience');

    return advantages;
  }

  private compareRisks(profiles: CareerMarketProfile[]): ComparativeMarketIntelligence['riskComparison'] {
    const sortedByAutomation = [...profiles].sort(
      (a, b) => a.automationRiskScore - b.automationRiskScore
    );
    const sortedByOutlook = [...profiles].sort((a, b) => {
      return MARKET_OUTLOOK_ORDER.indexOf(a.outlook) - MARKET_OUTLOOK_ORDER.indexOf(b.outlook);
    });

    return {
      lowestAutomationRisk: sortedByAutomation[0]?.careerId ?? '',
      highestAutomationRisk: sortedByAutomation[sortedByAutomation.length - 1]?.careerId ?? '',
      mostStable: sortedByOutlook[0]?.careerId ?? '',
      mostVolatile: sortedByOutlook[sortedByOutlook.length - 1]?.careerId ?? '',
    };
  }

  private notifySubscribers(careerId: string): void {
    const callbacks = this.subscribers.get(careerId);
    if (!callbacks) return;

    this.getIntelligence({ careerId }).then((intelligence) => {
      for (const callback of callbacks) {
        callback(intelligence);
      }
    });
  }
}

/**
 * Factory function for MarketIntelligenceEngine.
 */
export function createMarketIntelligenceEngine(
  marketRepository: MarketRepository,
  careerRepository: CareerMarketRepository,
  config?: Partial<MarketIntelligenceEngineConfig>,
  options?: EngineInitOptions
): MarketIntelligenceEngine {
  return new MarketIntelligenceEngine(marketRepository, careerRepository, config, options);
}
