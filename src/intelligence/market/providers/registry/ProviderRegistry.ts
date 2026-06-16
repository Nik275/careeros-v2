/**
 * CareerOS Market Intelligence - Provider Registry
 *
 * Central registry for all data providers.
 *
 * Responsibilities:
 * - Provider discovery
 * - Provider health monitoring
 * - Enable/disable providers
 * - Source prioritization
 */

import type {
  DataProvider,
  DataSourceMetadata,
  DataSourceCategory,
  DataSourceStatus,
  ProviderQuery,
  ProviderRegistration,
  RegistryStatistics,
  DataFetchResult,
} from '../types';
import type { MarketSignal, MarketSignalType } from '../../models/MarketSignal';
import type { SourceReliabilityEngine } from '../reliability/SourceReliabilityEngine';
import { SignalAdapter } from '../adapters/SignalAdapter';

/**
 * Provider registration options.
 */
export interface ProviderRegistrationOptions {
  /** Priority (higher = more important) */
  priority?: number;

  /** Tags for filtering */
  tags?: string[];

  /** Auto-enable on registration */
  autoEnable?: boolean;
}

/**
 * Health check result.
 */
export interface HealthCheckResult {
  sourceId: string;
  status: DataSourceStatus;
  lastCheck: Date;
  issues: string[];
  recommendation?: string;
}

/**
 * Fetch operation result.
 */
export interface RegistryFetchResult {
  sourceId: string;
  success: boolean;
  signals: MarketSignal[];
  error?: string;
  durationMs: number;
}

/**
 * Central registry for data providers.
 *
 * This is the single point of discovery and management for all
 * external data sources feeding into the market intelligence system.
 */
export class ProviderRegistry {
  private providers: Map<string, ProviderRegistration> = new Map();
  private enabledProviders: Set<string> = new Set();
  private healthChecks: Map<string, HealthCheckResult> = new Map();
  private fetchHistory: Map<string, DataFetchResult[]> = new Map();
  private reliabilityEngine: SourceReliabilityEngine;
  private signalAdapter: SignalAdapter;

  constructor(reliabilityEngine: SourceReliabilityEngine, signalAdapter: SignalAdapter) {
    this.reliabilityEngine = reliabilityEngine;
    this.signalAdapter = signalAdapter;
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  /**
   * Register a data provider.
   */
  register(
    provider: DataProvider,
    options: ProviderRegistrationOptions = {}
  ): void {
    const sourceId = provider.metadata.sourceId;

    if (this.providers.has(sourceId)) {
      throw new Error(`Provider ${sourceId} is already registered`);
    }

    const registration: ProviderRegistration = {
      provider,
      registeredAt: new Date(),
      priority: options.priority ?? 50,
      tags: options.tags ?? [],
    };

    this.providers.set(sourceId, registration);

    if (options.autoEnable !== false) {
      this.enabledProviders.add(sourceId);
    }

    // Initialize fetch history
    this.fetchHistory.set(sourceId, []);
  }

  /**
   * Unregister a provider.
   */
  unregister(sourceId: string): void {
    this.providers.delete(sourceId);
    this.enabledProviders.delete(sourceId);
    this.healthChecks.delete(sourceId);
    this.fetchHistory.delete(sourceId);
  }

  /**
   * Check if a provider is registered.
   */
  isRegistered(sourceId: string): boolean {
    return this.providers.has(sourceId);
  }

  /**
   * Get a registered provider.
   */
  getProvider(sourceId: string): DataProvider | undefined {
    return this.providers.get(sourceId)?.provider;
  }

  /**
   * Get all registered providers.
   */
  getAllProviders(): DataProvider[] {
    return Array.from(this.providers.values()).map((r) => r.provider);
  }

  // ============================================================================
  // DISCOVERY & QUERY
  // ============================================================================

  /**
   * Query providers by criteria.
   */
  queryProviders(query: ProviderQuery = {}): DataProvider[] {
    let results = Array.from(this.providers.values());

    // Filter by category
    if (query.category) {
      results = results.filter((r) => r.provider.metadata.category === query.category);
    }

    // Filter by geography
    if (query.geography) {
      const geography = query.geography;
      results = results.filter(
        (r) =>
          r.provider.metadata.geographicCoverage === geography ||
          r.provider.metadata.regions?.includes(geography)
      );
    }

    // Filter by signal type
    if (query.signalType) {
      const signalType = query.signalType;
      results = results.filter((r) =>
        r.provider.metadata.signalTypes.includes(signalType)
      );
    }

    // Filter by status
    if (query.status) {
      results = results.filter((r) => r.provider.health.status === query.status);
    }

    // Filter by minimum reliability
    if (query.minReliability) {
      const minReliability = query.minReliability;
      results = results.filter(
        (r) => r.provider.metadata.reliabilityScore >= minReliability
      );
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((r) =>
        query.tags!.some((tag) => r.tags.includes(tag))
      );
    }

    // Sort by priority (descending)
    return results.sort((a, b) => b.priority - a.priority).map((r) => r.provider);
  }

  /**
   * Get providers by category.
   */
  getProvidersByCategory(category: DataSourceCategory): DataProvider[] {
    return this.queryProviders({ category });
  }

  /**
   * Get providers by signal type.
   */
  getProvidersBySignalType(signalType: MarketSignalType): DataProvider[] {
    return this.queryProviders({ signalType });
  }

  /**
   * Get enabled providers.
   */
  getEnabledProviders(): DataProvider[] {
    return Array.from(this.enabledProviders)
      .map((id) => this.providers.get(id)?.provider)
      .filter((p): p is DataProvider => p !== undefined);
  }

  /**
   * Get healthy providers.
   */
  getHealthyProviders(): DataProvider[] {
    return this.getEnabledProviders().filter(
      (p) => p.health.status === 'active' || p.health.status === 'degraded'
    );
  }

  // ============================================================================
  // ENABLE/DISABLE
  // ============================================================================

  /**
   * Enable a provider.
   */
  enableProvider(sourceId: string): void {
    if (!this.providers.has(sourceId)) {
      throw new Error(`Provider ${sourceId} not registered`);
    }

    this.enabledProviders.add(sourceId);
  }

  /**
   * Disable a provider.
   */
  disableProvider(sourceId: string): void {
    this.enabledProviders.delete(sourceId);
  }

  /**
   * Check if provider is enabled.
   */
  isEnabled(sourceId: string): boolean {
    return this.enabledProviders.has(sourceId);
  }

  /**
   * Toggle provider enabled state.
   */
  toggleProvider(sourceId: string): boolean {
    if (this.isEnabled(sourceId)) {
      this.disableProvider(sourceId);
      return false;
    } else {
      this.enableProvider(sourceId);
      return true;
    }
  }

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  /**
   * Check health of all providers.
   */
  async checkAllHealth(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const [sourceId, registration] of this.providers) {
      const result = await this.checkProviderHealth(sourceId);
      results.push(result);
    }

    return results;
  }

  /**
   * Check health of a specific provider.
   */
  async checkProviderHealth(sourceId: string): Promise<HealthCheckResult> {
    const registration = this.providers.get(sourceId);

    if (!registration) {
      throw new Error(`Provider ${sourceId} not registered`);
    }

    const health = await registration.provider.checkHealth();
    const issues: string[] = [];
    let recommendation: string | undefined;

    // Analyze health
    if (health.consecutiveFailures > 3) {
      issues.push(`${health.consecutiveFailures} consecutive failures`);
      recommendation = 'Consider disabling provider or investigating connectivity';
    }

    if (health.averageLatencyMs > 10000) {
      issues.push(`High latency (${health.averageLatencyMs}ms)`);
    }

    const successRate =
      health.totalFetches > 0
        ? Math.round((health.successfulFetches / health.totalFetches) * 100)
        : 100;

    if (successRate < 80) {
      issues.push(`Low success rate (${successRate}%)`);
    }

    const result: HealthCheckResult = {
      sourceId,
      status: health.status,
      lastCheck: new Date(),
      issues,
      recommendation,
    };

    this.healthChecks.set(sourceId, result);
    return result;
  }

  /**
   * Get last health check result.
   */
  getLastHealthCheck(sourceId: string): HealthCheckResult | undefined {
    return this.healthChecks.get(sourceId);
  }

  /**
   * Get all health check results.
   */
  getAllHealthChecks(): HealthCheckResult[] {
    return Array.from(this.healthChecks.values());
  }

  // ============================================================================
  // FETCH OPERATIONS
  // ============================================================================

  /**
   * Fetch from all enabled providers.
   */
  async fetchAll(options?: {
    careerIds?: string[];
    signalTypes?: MarketSignalType[];
    timeRange?: { start: Date; end: Date };
  }): Promise<RegistryFetchResult[]> {
    const providers = this.getEnabledProviders();
    const results: RegistryFetchResult[] = [];

    for (const provider of providers) {
      try {
        const result = await this.fetchFromProvider(provider.metadata.sourceId, options);
        results.push(result);
      } catch (error) {
        results.push({
          sourceId: provider.metadata.sourceId,
          success: false,
          signals: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          durationMs: 0,
        });
      }
    }

    return results;
  }

  /**
   * Fetch from a specific provider.
   */
  async fetchFromProvider(
    sourceId: string,
    options?: {
      careerIds?: string[];
      signalTypes?: MarketSignalType[];
      timeRange?: { start: Date; end: Date };
    }
  ): Promise<RegistryFetchResult> {
    const registration = this.providers.get(sourceId);

    if (!registration) {
      throw new Error(`Provider ${sourceId} not registered`);
    }

    if (!this.isEnabled(sourceId)) {
      throw new Error(`Provider ${sourceId} is disabled`);
    }

    const startTime = Date.now();

    try {
      // Fetch raw data
      const fetchResult = await registration.provider.fetch(options);

      // Record fetch history
      this.recordFetch(sourceId, fetchResult);

      if (!fetchResult.success || !fetchResult.data) {
        return {
          sourceId,
          success: false,
          signals: [],
          error: fetchResult.error?.message ?? 'Fetch failed',
          durationMs: Date.now() - startTime,
        };
      }

      // Extract signals
      const extracted = registration.provider.extractSignals(fetchResult.data);

      // Adapt to MarketSignals
      const adaptationResult = this.signalAdapter.adapt(
        extracted,
        sourceId,
        fetchResult.data
      );

      return {
        sourceId,
        success: true,
        signals: adaptationResult.signals,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        sourceId,
        success: false,
        signals: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Get fetch history for a provider.
   */
  getFetchHistory(sourceId: string, limit?: number): DataFetchResult[] {
    const history = this.fetchHistory.get(sourceId) ?? [];

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get registry statistics.
   */
  getStatistics(): RegistryStatistics {
    const allProviders = this.getAllProviders();
    const enabledProviders = this.getEnabledProviders();

    // By category
    const byCategory: Record<DataSourceCategory, number> = {
      government: 0,
      job_market: 0,
      industry: 0,
      global: 0,
      academic: 0,
    };

    for (const provider of allProviders) {
      byCategory[provider.metadata.category]++;
    }

    // By geography
    const byGeography: Record<string, number> = {};
    for (const provider of allProviders) {
      const geo = provider.metadata.geographicCoverage;
      byGeography[geo] = (byGeography[geo] ?? 0) + 1;
    }

    // Average reliability
    const totalReliability = allProviders.reduce(
      (sum, p) => sum + p.metadata.reliabilityScore,
      0
    );
    const averageReliability =
      allProviders.length > 0 ? Math.round(totalReliability / allProviders.length) : 0;

    // Signals in last 24h (placeholder)
    const signalsLast24h = 0;

    return {
      totalProviders: allProviders.length,
      activeProviders: enabledProviders.filter((p) => p.health.status === 'active').length,
      byCategory,
      byGeography,
      averageReliability,
      signalsLast24h,
    };
  }

  /**
   * Get source prioritization for a signal type.
   *
   * Returns providers sorted by priority (reliability × importance).
   */
  getPrioritizedSources(signalType: MarketSignalType): Array<{
    sourceId: string;
    priority: number;
    reliability: number;
  }> {
    const providers = this.getProvidersBySignalType(signalType);

    return providers
      .map((provider) => {
        const registration = this.providers.get(provider.metadata.sourceId)!;
        const reliability = this.reliabilityEngine.getReliability(provider.metadata.sourceId);

        return {
          sourceId: provider.metadata.sourceId,
          priority: registration.priority,
          reliability,
        };
      })
      .sort((a, b) => b.reliability * b.priority - a.reliability * a.priority);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Record a fetch in history.
   */
  private recordFetch(sourceId: string, result: DataFetchResult): void {
    const history = this.fetchHistory.get(sourceId) ?? [];
    history.push(result);

    // Keep only last 100 fetches
    if (history.length > 100) {
      history.shift();
    }

    this.fetchHistory.set(sourceId, history);
  }
}

/**
 * Factory function for ProviderRegistry.
 */
export function createProviderRegistry(
  reliabilityEngine: SourceReliabilityEngine,
  signalAdapter: SignalAdapter
): ProviderRegistry {
  return new ProviderRegistry(reliabilityEngine, signalAdapter);
}
