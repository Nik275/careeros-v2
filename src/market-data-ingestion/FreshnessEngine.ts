/**
 * Freshness Engine
 *
 * Tracks signal age, staleness, and expiration.
 *
 * Purpose:
 *   - Determine when signals need refresh
 *   - Calculate freshness scores
 *   - Manage expiration policies
 *   - Prioritize refresh queues
 *
 * Design Principles:
 *   - Time-decay scoring
 *   - Configurable policies by signal type
 *   - Batch expiration handling
 *   - Predictive refresh scheduling
 */

import type {
  NormalizedMarketSignal,
  AggregatedMarketSignal,
  NormalizedSignalType,
  SignalFreshnessStatus,
  FreshnessPolicy,
  Timestamp,
} from './types.js';

import {
  DEFAULT_INGESTION_CONFIG,
} from './types.js';

// ============================================================================
// FRESHNESS ENGINE
// ============================================================================

/**
 * Engine for managing signal freshness.
 */
export class FreshnessEngine {
  private policies: Map<string, FreshnessPolicy> = new Map();
  private freshnessCache: Map<string, SignalFreshnessStatus> = new Map();

  /**
   * Create freshness engine with default policies.
   */
  constructor(policies?: FreshnessPolicy[]) {
    // Initialize with default policies
    const defaultPolicies = policies || DEFAULT_INGESTION_CONFIG.freshnessPolicies;
    for (const policy of defaultPolicies) {
      this.policies.set(policy.signalType, policy);
    }
  }

  // ========================================================================
  // FRESHNESS CALCULATION
  // ========================================================================

  /**
   * Calculate freshness status for a signal.
   */
  calculateFreshness(
    signal: NormalizedMarketSignal | AggregatedMarketSignal
  ): SignalFreshnessStatus {
    const now = Date.now();
    const policy = this.getPolicy(signal.signalType);
    const signalTimestamp = this.getSignalTimestamp(signal);

    const ageMs = now - signalTimestamp;
    const freshnessScore = this.calculateFreshnessScore(ageMs, policy);
    const status = this.determineStatus(ageMs, policy);

    const statusResult: SignalFreshnessStatus = {
      signalId: signal.id,
      ageMs,
      maxAgeMs: policy.expireThresholdMs,
      freshnessScore,
      status,
      expiresAt: signalTimestamp + policy.expireThresholdMs,
      recommendedRefreshAt: signalTimestamp + policy.recommendedRefreshMs,
    };

    // Cache result
    this.freshnessCache.set(signal.id, statusResult);

    return statusResult;
  }

  /**
   * Calculate freshness for multiple signals.
   */
  calculateFreshnessBatch(
    signals: (NormalizedMarketSignal | AggregatedMarketSignal)[]
  ): Map<string, SignalFreshnessStatus> {
    const results = new Map<string, SignalFreshnessStatus>();

    for (const signal of signals) {
      const status = this.calculateFreshness(signal);
      results.set(signal.id, status);
    }

    return results;
  }

  /**
   * Calculate freshness score (0-1).
   *
   * Uses exponential decay based on age.
   */
  private calculateFreshnessScore(ageMs: number, policy: FreshnessPolicy): number {
    // Exponential decay: freshness = e^(-age/stale_threshold)
    const decayRate = ageMs / policy.staleThresholdMs;
    return Math.max(0, Math.min(1, Math.exp(-decayRate)));
  }

  /**
   * Determine freshness status.
   */
  private determineStatus(ageMs: number, policy: FreshnessPolicy): 'fresh' | 'stale' | 'expired' {
    if (ageMs > policy.expireThresholdMs) {
      return 'expired';
    }
    if (ageMs > policy.staleThresholdMs) {
      return 'stale';
    }
    return 'fresh';
  }

  // ========================================================================
  // POLICY MANAGEMENT
  // ========================================================================

  /**
   * Get freshness policy for a signal type.
   */
  getPolicy(signalType: string): FreshnessPolicy {
    return this.policies.get(signalType) || this.getDefaultPolicy();
  }

  /**
   * Set freshness policy.
   */
  setPolicy(policy: FreshnessPolicy): void {
    this.policies.set(policy.signalType, policy);
  }

  /**
   * Get default policy.
   */
  private getDefaultPolicy(): FreshnessPolicy {
    return {
      signalType: 'demand',
      staleThresholdMs: 30 * 24 * 60 * 60 * 1000, // 30 days
      expireThresholdMs: 90 * 24 * 60 * 60 * 1000, // 90 days
      recommendedRefreshMs: 14 * 24 * 60 * 60 * 1000, // 14 days
    };
  }

  private getSignalTimestamp(signal: NormalizedMarketSignal | AggregatedMarketSignal): Timestamp {
    return 'timestamp' in signal ? signal.timestamp : signal.aggregatedAt;
  }

  /**
   * Get all policies.
   */
  getAllPolicies(): FreshnessPolicy[] {
    return Array.from(this.policies.values());
  }

  // ========================================================================
  // EXPIRATION MANAGEMENT
  // ========================================================================

  /**
   * Check if a signal is expired.
   */
  isExpired(signalId: string): boolean {
    const cached = this.freshnessCache.get(signalId);
    if (cached) {
      return cached.status === 'expired';
    }
    return false;
  }

  /**
   * Check if a signal is stale.
   */
  isStale(signalId: string): boolean {
    const cached = this.freshnessCache.get(signalId);
    if (cached) {
      return cached.status === 'stale' || cached.status === 'expired';
    }
    return false;
  }

  /**
   * Get expired signals from a list.
   */
  getExpiredSignals(signalIds: string[]): string[] {
    return signalIds.filter(id => this.isExpired(id));
  }

  /**
   * Get stale signals from a list.
   */
  getStaleSignals(signalIds: string[]): string[] {
    return signalIds.filter(id => this.isStale(id));
  }

  /**
   * Get signals needing refresh.
   */
  getSignalsNeedingRefresh(
    signals: (NormalizedMarketSignal | AggregatedMarketSignal)[]
  ): Array<{ signal: NormalizedMarketSignal | AggregatedMarketSignal; priority: 'high' | 'medium' | 'low' }> {
    const needingRefresh: Array<{ signal: NormalizedMarketSignal | AggregatedMarketSignal; priority: 'high' | 'medium' | 'low' }> = [];

    for (const signal of signals) {
      const status = this.calculateFreshness(signal);

      if (status.status === 'expired') {
        needingRefresh.push({ signal, priority: 'high' });
      } else if (status.status === 'stale') {
        needingRefresh.push({ signal, priority: 'medium' });
      } else if (Date.now() > status.recommendedRefreshAt) {
        needingRefresh.push({ signal, priority: 'low' });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    needingRefresh.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return needingRefresh;
  }

  // ========================================================================
  // REFRESH SCHEDULING
  // ========================================================================

  /**
   * Schedule next refresh for a signal.
   */
  scheduleRefresh(signalId: string): Timestamp {
    const cached = this.freshnessCache.get(signalId);
    if (!cached) {
      return Date.now() + 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    return cached.recommendedRefreshAt;
  }

  /**
   * Get refresh schedule for multiple signals.
   */
  getRefreshSchedule(
    signalIds: string[]
  ): Array<{ signalId: string; refreshAt: Timestamp; urgency: 'critical' | 'high' | 'medium' | 'low' }> {
    const now = Date.now();
    const schedule: Array<{ signalId: string; refreshAt: Timestamp; urgency: 'critical' | 'high' | 'medium' | 'low' }> = [];

    for (const signalId of signalIds) {
      const cached = this.freshnessCache.get(signalId);
      if (!cached) continue;

      let urgency: 'critical' | 'high' | 'medium' | 'low';
      if (cached.status === 'expired') {
        urgency = 'critical';
      } else if (cached.status === 'stale') {
        urgency = 'high';
      } else if (now > cached.recommendedRefreshAt) {
        urgency = 'medium';
      } else {
        urgency = 'low';
      }

      schedule.push({
        signalId,
        refreshAt: cached.recommendedRefreshAt,
        urgency,
      });
    }

    // Sort by urgency and refresh time
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    schedule.sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return a.refreshAt - b.refreshAt;
    });

    return schedule;
  }

  // ========================================================================
  // BATCH OPERATIONS
  // ========================================================================

  /**
   * Get freshness statistics.
   */
  getStatistics(
    signals: (NormalizedMarketSignal | AggregatedMarketSignal)[]
  ): {
    total: number;
    fresh: number;
    stale: number;
    expired: number;
    averageFreshnessScore: number;
    signalsNeedingRefresh: number;
  } {
    let fresh = 0;
    let stale = 0;
    let expired = 0;
    let totalFreshness = 0;
    let needingRefresh = 0;

    for (const signal of signals) {
      const status = this.calculateFreshness(signal);
      totalFreshness += status.freshnessScore;

      switch (status.status) {
        case 'fresh':
          fresh++;
          if (Date.now() > status.recommendedRefreshAt) {
            needingRefresh++;
          }
          break;
        case 'stale':
          stale++;
          needingRefresh++;
          break;
        case 'expired':
          expired++;
          needingRefresh++;
          break;
      }
    }

    return {
      total: signals.length,
      fresh,
      stale,
      expired,
      averageFreshnessScore: signals.length > 0 ? totalFreshness / signals.length : 0,
      signalsNeedingRefresh: needingRefresh,
    };
  }

  /**
   * Clear expired signals from cache.
   */
  clearExpiredCache(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [id, status] of this.freshnessCache) {
      if (status.expiresAt < now) {
        this.freshnessCache.delete(id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear all cache.
   */
  clearCache(): void {
    this.freshnessCache.clear();
  }

  /**
   * Get cache size.
   */
  getCacheSize(): number {
    return this.freshnessCache.size;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new FreshnessEngine.
 */
export function createFreshnessEngine(policies?: FreshnessPolicy[]): FreshnessEngine {
  return new FreshnessEngine(policies);
}

/**
 * Quick freshness check.
 */
export function quickFreshnessCheck(
  signal: NormalizedMarketSignal | AggregatedMarketSignal,
  policy?: FreshnessPolicy
): SignalFreshnessStatus {
  const engine = new FreshnessEngine(policy ? [policy] : undefined);
  return engine.calculateFreshness(signal);
}

/**
 * Create freshness policy.
 */
export function createFreshnessPolicy(
  signalType: NormalizedSignalType,
  staleDays: number,
  expireDays: number,
  recommendedRefreshDays: number
): FreshnessPolicy {
  return {
    signalType,
    staleThresholdMs: staleDays * 24 * 60 * 60 * 1000,
    expireThresholdMs: expireDays * 24 * 60 * 60 * 1000,
    recommendedRefreshMs: recommendedRefreshDays * 24 * 60 * 60 * 1000,
  };
}
