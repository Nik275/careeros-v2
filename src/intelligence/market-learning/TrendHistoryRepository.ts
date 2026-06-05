/**
 * Trend History Repository
 *
 * Stores and manages historical market snapshots for trend analysis.
 *
 * ## Purpose
 *
 * Maintain chronological records of market conditions for:
 *   - Trend detection
 *   - Change analysis
 *   - Historical comparison
 *   - Forecast preparation
 *
 * ## Storage Model
 *
 * - Time-series snapshots per entity
 * - Automatic aggregation by time window
 * - Configurable retention policies
 * - Efficient querying by date range
 */

import type {
  MarketSnapshot,
  TrendHistory,
  TrendHistoryRepositoryConfig,
  EntityId,
  NormalizedEntityType,
  Timestamp,
} from './types.js';

import { DEFAULT_TREND_HISTORY_CONFIG } from './types.js';

// ============================================================================
// TREND HISTORY REPOSITORY
// ============================================================================

export class TrendHistoryRepository {
  private config: TrendHistoryRepositoryConfig;
  private histories: Map<string, TrendHistory> = new Map();
  private snapshots: Map<string, MarketSnapshot[]> = new Map();

  constructor(config: Partial<TrendHistoryRepositoryConfig> = {}) {
    this.config = { ...DEFAULT_TREND_HISTORY_CONFIG, ...config };
  }

  /**
   * Store a new market snapshot.
   */
  storeSnapshot(snapshot: MarketSnapshot): void {
    const key = this.getKey(snapshot.entityType, snapshot.entityId);

    // Get existing snapshots
    let entitySnapshots = this.snapshots.get(key) || [];

    // Add new snapshot
    entitySnapshots.push(snapshot);

    // Sort by timestamp
    entitySnapshots.sort((a, b) => a.timestamp - b.timestamp);

    // Apply retention policy
    entitySnapshots = this.applyRetention(entitySnapshots);

    // Store updated list
    this.snapshots.set(key, entitySnapshots);

    // Update trend history
    this.updateTrendHistory(snapshot.entityType, snapshot.entityId, entitySnapshots);
  }

  /**
   * Store multiple snapshots in batch.
   */
  storeSnapshots(snapshots: MarketSnapshot[]): void {
    for (const snapshot of snapshots) {
      this.storeSnapshot(snapshot);
    }
  }

  /**
   * Get trend history for an entity.
   */
  getTrendHistory(
    entityType: NormalizedEntityType,
    entityId: EntityId
  ): TrendHistory | undefined {
    return this.histories.get(this.getKey(entityType, entityId));
  }

  /**
   * Get snapshots for an entity within a time range.
   */
  getSnapshots(
    entityType: NormalizedEntityType,
    entityId: EntityId,
    startTime?: Timestamp,
    endTime?: Timestamp
  ): MarketSnapshot[] {
    const key = this.getKey(entityType, entityId);
    let snapshots = this.snapshots.get(key) || [];

    // Filter by time range
    if (startTime !== undefined) {
      snapshots = snapshots.filter(s => s.timestamp >= startTime);
    }
    if (endTime !== undefined) {
      snapshots = snapshots.filter(s => s.timestamp <= endTime);
    }

    return snapshots;
  }

  /**
   * Get latest snapshot for an entity.
   */
  getLatestSnapshot(
    entityType: NormalizedEntityType,
    entityId: EntityId
  ): MarketSnapshot | undefined {
    const snapshots = this.snapshots.get(this.getKey(entityType, entityId));
    if (!snapshots || snapshots.length === 0) return undefined;
    return snapshots[snapshots.length - 1];
  }

  /**
   * Get all tracked entities.
   */
  getTrackedEntities(): Array<{
    entityType: NormalizedEntityType;
    entityId: EntityId;
    snapshotCount: number;
    firstTracked: Timestamp;
    lastUpdated: Timestamp;
  }> {
    const entities: Array<{
      entityType: NormalizedEntityType;
      entityId: EntityId;
      snapshotCount: number;
      firstTracked: Timestamp;
      lastUpdated: Timestamp;
    }> = [];

    for (const [key, history] of this.histories) {
      entities.push({
        entityType: history.entityType,
        entityId: history.entityId,
        snapshotCount: history.snapshots.length,
        firstTracked: history.firstTrackedAt,
        lastUpdated: history.lastUpdatedAt,
      });
    }

    return entities;
  }

  /**
   * Get entities by type.
   */
  getEntitiesByType(entityType: NormalizedEntityType): TrendHistory[] {
    const results: TrendHistory[] = [];

    for (const history of this.histories.values()) {
      if (history.entityType === entityType) {
        results.push(history);
      }
    }

    return results;
  }

  /**
   * Clear history for an entity.
   */
  clearEntity(entityType: NormalizedEntityType, entityId: EntityId): void {
    const key = this.getKey(entityType, entityId);
    this.histories.delete(key);
    this.snapshots.delete(key);
  }

  /**
   * Clear all data.
   */
  clear(): void {
    this.histories.clear();
    this.snapshots.clear();
  }

  /**
   * Get repository statistics.
   */
  getStats(): {
    totalEntities: number;
    totalSnapshots: number;
    averageSnapshotsPerEntity: number;
    oldestSnapshot: Timestamp | null;
    newestSnapshot: Timestamp | null;
  } {
    let totalSnapshots = 0;
    let oldestSnapshot: Timestamp | null = null;
    let newestSnapshot: Timestamp | null = null;

    for (const snapshots of this.snapshots.values()) {
      totalSnapshots += snapshots.length;

      for (const snapshot of snapshots) {
        if (oldestSnapshot === null || snapshot.timestamp < oldestSnapshot) {
          oldestSnapshot = snapshot.timestamp;
        }
        if (newestSnapshot === null || snapshot.timestamp > newestSnapshot) {
          newestSnapshot = snapshot.timestamp;
        }
      }
    }

    const totalEntities = this.histories.size;

    return {
      totalEntities,
      totalSnapshots,
      averageSnapshotsPerEntity: totalEntities > 0 ? totalSnapshots / totalEntities : 0,
      oldestSnapshot,
      newestSnapshot,
    };
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Get storage key for entity.
   */
  private getKey(entityType: NormalizedEntityType, entityId: EntityId): string {
    return `${entityType}:${entityId}`;
  }

  /**
   * Apply retention policy to snapshots.
   */
  private applyRetention(snapshots: MarketSnapshot[]): MarketSnapshot[] {
    // Sort by timestamp (newest first)
    const sorted = [...snapshots].sort((a, b) => b.timestamp - a.timestamp);

    // Keep only maxSnapshotsPerEntity
    const trimmed = sorted.slice(0, this.config.maxSnapshotsPerEntity);

    // Apply time-based retention
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const retained = trimmed.filter(s => s.timestamp >= cutoff);

    // Sort back to chronological order
    return retained.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Update trend history from snapshots.
   */
  private updateTrendHistory(
    entityType: NormalizedEntityType,
    entityId: EntityId,
    snapshots: MarketSnapshot[]
  ): void {
    const key = this.getKey(entityType, entityId);

    if (snapshots.length === 0) {
      this.histories.delete(key);
      return;
    }

    // Compute trend direction
    const trendDirection = this.computeTrendDirection(snapshots);
    const trendStrength = this.computeTrendStrength(snapshots);

    const history: TrendHistory = {
      id: `trend_${key}`,
      entityId,
      entityType,
      entityName: snapshots[0].entityId, // Use ID as name if no name available
      snapshots,
      trendDirection,
      trendStrength,
      firstTrackedAt: snapshots[0].timestamp,
      lastUpdatedAt: snapshots[snapshots.length - 1].timestamp,
      dataPoints: snapshots.length,
    };

    this.histories.set(key, history);
  }

  /**
   * Compute trend direction from snapshots.
   */
  private computeTrendDirection(
    snapshots: MarketSnapshot[]
  ): TrendHistory['trendDirection'] {
    if (snapshots.length < 3) return 'stable';

    // Compare first half to second half
    const mid = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, mid);
    const secondHalf = snapshots.slice(mid);

    const firstAvg = this.calculateAverageOpportunity(firstHalf);
    const secondAvg = this.calculateAverageOpportunity(secondHalf);

    const change = secondAvg - firstAvg;
    const changePercent = firstAvg > 0 ? change / firstAvg : 0;

    // Check acceleration
    const firstQuarter = snapshots.slice(0, Math.floor(snapshots.length / 4));
    const lastQuarter = snapshots.slice(-Math.floor(snapshots.length / 4));
    const firstQuarterAvg = this.calculateAverageOpportunity(firstQuarter);
    const lastQuarterAvg = this.calculateAverageOpportunity(lastQuarter);

    const acceleration = lastQuarterAvg - firstQuarterAvg;

    if (changePercent > 0.2) {
      return acceleration > change ? 'accelerating' : 'growing';
    } else if (changePercent < -0.2) {
      return acceleration < change ? 'decelerating' : 'declining';
    }

    return 'stable';
  }

  /**
   * Compute trend strength from snapshots.
   */
  private computeTrendStrength(snapshots: MarketSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const values = snapshots.map(s => s.metrics.opportunity);
    const first = values[0];
    const last = values[values.length - 1];

    // Calculate rate of change
    const change = Math.abs(last - first) / 100; // Normalize to 0-1

    // Calculate consistency
    let consistentMoves = 0;
    const direction = last > first ? 1 : -1;

    for (let i = 1; i < values.length; i++) {
      const move = values[i] - values[i - 1];
      if (direction > 0 && move > 0) consistentMoves++;
      if (direction < 0 && move < 0) consistentMoves++;
    }

    const consistency = values.length > 1 ? consistentMoves / (values.length - 1) : 0;

    // Combine change magnitude and consistency
    return Math.min(1, change * 0.6 + consistency * 0.4);
  }

  /**
   * Calculate average opportunity from snapshots.
   */
  private calculateAverageOpportunity(snapshots: MarketSnapshot[]): number {
    if (snapshots.length === 0) return 0;
    return snapshots.reduce((sum, s) => sum + s.metrics.opportunity, 0) / snapshots.length;
  }

  /**
   * Aggregate snapshots by time window.
   */
  aggregateSnapshots(
    entityType: NormalizedEntityType,
    entityId: EntityId,
    windowDays: number = this.config.aggregationWindowDays
  ): MarketSnapshot[] {
    const snapshots = this.snapshots.get(this.getKey(entityType, entityId)) || [];
    if (snapshots.length === 0) return [];

    const aggregated: MarketSnapshot[] = [];
    const windowMs = windowDays * 24 * 60 * 60 * 1000;

    let currentWindow: MarketSnapshot[] = [];
    let windowStart = snapshots[0].timestamp;

    for (const snapshot of snapshots) {
      if (snapshot.timestamp - windowStart <= windowMs) {
        currentWindow.push(snapshot);
      } else {
        // Aggregate current window
        if (currentWindow.length > 0) {
          aggregated.push(this.createAggregatedSnapshot(currentWindow));
        }
        // Start new window
        currentWindow = [snapshot];
        windowStart = snapshot.timestamp;
      }
    }

    // Don't forget last window
    if (currentWindow.length > 0) {
      aggregated.push(this.createAggregatedSnapshot(currentWindow));
    }

    return aggregated;
  }

  /**
   * Create aggregated snapshot from window.
   */
  private createAggregatedSnapshot(snapshots: MarketSnapshot[]): MarketSnapshot {
    const first = snapshots[0];

    // Average metrics
    const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

    return {
      id: `agg_${first.id}`,
      entityId: first.entityId,
      entityType: first.entityType,
      timestamp: snapshots[Math.floor(snapshots.length / 2)].timestamp, // Middle timestamp
      metrics: {
        demand: avg(snapshots.map(s => s.metrics.demand)),
        salary: avg(snapshots.map(s => s.metrics.salary)),
        competition: avg(snapshots.map(s => s.metrics.competition)),
        growth: avg(snapshots.map(s => s.metrics.growth)),
        automationRisk: avg(snapshots.map(s => s.metrics.automationRisk)),
        opportunity: avg(snapshots.map(s => s.metrics.opportunity)),
      },
      confidence: avg(snapshots.map(s => s.confidence)),
      sourceCount: Math.max(...snapshots.map(s => s.sourceCount)),
      timeRange: {
        start: first.timestamp,
        end: snapshots[snapshots.length - 1].timestamp,
      },
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createTrendHistoryRepository(
  config?: Partial<TrendHistoryRepositoryConfig>
): TrendHistoryRepository {
  return new TrendHistoryRepository(config);
}
