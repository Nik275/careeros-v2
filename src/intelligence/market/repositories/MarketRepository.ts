/**
 * CareerOS Market Intelligence - Market Repository Interface
 *
 * Abstraction for market data persistence.
 * All market data storage implementations must conform to this interface.
 */

import type {
  MarketSignal,
  MarketSignalId,
  NormalizedMarketSignal,
  AggregateMarketSignal,
} from '../models/MarketSignal';
import type { MarketSnapshot, MarketSnapshotCollection, MarketHistory } from '../models/MarketSnapshot';

/**
 * Repository interface for market data storage.
 * 
 * Implementations may use in-memory, file-system, or database storage.
 * This interface ensures the market intelligence layer remains decoupled
 * from specific storage technologies.
 */
export interface MarketRepository {
  // ============================================================================
  // MARKET SIGNALS
  // ============================================================================

  /**
   * Store a raw market signal.
   */
  saveSignal(signal: MarketSignal): Promise<void>;

  /**
   * Store multiple market signals.
   */
  saveSignals(signals: MarketSignal[]): Promise<void>;

  /**
   * Retrieve a signal by ID.
   */
  getSignal(id: MarketSignalId): Promise<MarketSignal | null>;

  /**
   * Get all signals for a career.
   */
  getSignalsByCareer(careerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    signalTypes?: string[];
    sources?: string[];
    limit?: number;
  }): Promise<MarketSignal[]>;

  /**
   * Get signals by type.
   */
  getSignalsByType(signalType: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<MarketSignal[]>;

  /**
   * Get signals by source.
   */
  getSignalsBySource(source: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<MarketSignal[]>;

  /**
   * Delete old signals (data retention).
   */
  deleteOldSignals(beforeDate: Date): Promise<number>;

  // ============================================================================
  // NORMALIZED SIGNALS
  // ============================================================================

  /**
   * Store a normalized signal.
   */
  saveNormalizedSignal(signal: NormalizedMarketSignal): Promise<void>;

  /**
   * Get normalized signals for a career.
   */
  getNormalizedSignalsByCareer(careerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<NormalizedMarketSignal[]>;

  // ============================================================================
  // AGGREGATE SIGNALS
  // ============================================================================

  /**
   * Store an aggregate signal.
   */
  saveAggregateSignal(signal: AggregateMarketSignal): Promise<void>;

  /**
   * Get aggregate signals for a career.
   */
  getAggregateSignalsByCareer(careerId: string): Promise<AggregateMarketSignal[]>;

  /**
   * Get latest aggregate signal for a career and type.
   */
  getLatestAggregateSignal(
    careerId: string,
    signalType: string
  ): Promise<AggregateMarketSignal | null>;

  // ============================================================================
  // MARKET SNAPSHOTS
  // ============================================================================

  /**
   * Store a market snapshot.
   */
  saveSnapshot(snapshot: MarketSnapshot): Promise<void>;

  /**
   * Get snapshot by ID.
   */
  getSnapshot(id: string): Promise<MarketSnapshot | null>;

  /**
   * Get latest snapshot for a career.
   */
  getLatestSnapshot(careerId: string): Promise<MarketSnapshot | null>;

  /**
   * Get snapshots for a career within time range.
   */
  getSnapshotsByCareer(careerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<MarketSnapshot[]>;

  /**
   * Get all snapshots at a specific time.
   */
  getSnapshotsAtTime(timestamp: Date): Promise<MarketSnapshot[]>;

  /**
   * Save a snapshot collection.
   */
  saveSnapshotCollection(collection: MarketSnapshotCollection): Promise<void>;

  /**
   * Get latest snapshot collection.
   */
  getLatestSnapshotCollection(): Promise<MarketSnapshotCollection | null>;

  // ============================================================================
  // MARKET HISTORY
  // ============================================================================

  /**
   * Build market history for a career.
   */
  buildMarketHistory(careerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<MarketHistory>;

  /**
   * Get historical trends for analysis.
   */
  getHistoricalTrends(careerId: string, metric: string, options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{ date: Date; value: number }>>;

  // ============================================================================
  // QUERIES
  // ============================================================================

  /**
   * Get signal count by criteria.
   */
  getSignalCount(criteria?: {
    careerId?: string;
    signalType?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number>;

  /**
   * Get available date range for a career.
   */
  getAvailableDateRange(careerId: string): Promise<{
    earliest: Date | null;
    latest: Date | null;
  }>;

  /**
   * Get careers with available data.
   */
  getCareersWithData(): Promise<string[]>;

  // ============================================================================
  // MAINTENANCE
  // ============================================================================

  /**
   * Compact old data (aggregation, archiving).
   */
  compactData(options?: {
    olderThan?: Date;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<void>;

  /**
   * Health check for repository.
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, unknown>;
  }>;
}

/**
 * Repository configuration options.
 */
export interface MarketRepositoryConfig {
  /** Data retention period (days) */
  retentionDays: number;

  /** Snapshot frequency (hours) */
  snapshotFrequencyHours: number;

  /** Aggregation window (hours) */
  aggregationWindowHours: number;

  /** Enable data compaction */
  enableCompaction: boolean;

  /** Compaction threshold (days) */
  compactionThresholdDays: number;
}

/**
 * Default repository configuration.
 */
export const DEFAULT_MARKET_REPOSITORY_CONFIG: MarketRepositoryConfig = {
  retentionDays: 365,
  snapshotFrequencyHours: 24,
  aggregationWindowHours: 24,
  enableCompaction: true,
  compactionThresholdDays: 90,
};
