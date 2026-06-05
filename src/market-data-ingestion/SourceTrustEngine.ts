/**
 * Source Trust Engine
 *
 * Tracks source reliability, historical accuracy, and signal consistency.
 *
 * Purpose:
 *   - Maintain trust scores for data sources
 *   - Track historical accuracy over time
 *   - Detect consistency patterns
 *   - Enable quality-based signal weighting
 *
 * Design Principles:
 *   - Time-decay for old accuracy data
 *   - Confidence intervals for accuracy
 *   - Detect and flag anomalous sources
 */

import type {
  MarketDataSource,
  SourceTrustMetrics,
  SourceAccuracyRecord,
  NormalizedMarketSignal,
  AggregatedMarketSignal,
  Timestamp,
} from './types.js';

// ============================================================================
// SOURCE TRUST ENGINE
// ============================================================================

/**
 * Engine for managing source trust and accuracy.
 */
export class SourceTrustEngine {
  private trustMetrics: Map<string, SourceTrustMetrics> = new Map();
  private accuracyHistory: Map<string, SourceAccuracyRecord[]> = new Map();
  private signalHistory: Map<string, NormalizedMarketSignal[]> = new Map();

  // Configuration
  private accuracyDecayDays: number;
  private minSignalsForAccuracy: number;

  constructor(options: {
    accuracyDecayDays?: number;
    minSignalsForAccuracy?: number;
  } = {}) {
    this.accuracyDecayDays = options.accuracyDecayDays ?? 90;
    this.minSignalsForAccuracy = options.minSignalsForAccuracy ?? 10;
  }

  // ========================================================================
  // TRUST METRICS
  // ========================================================================

  /**
   * Initialize trust metrics for a source.
   */
  initializeSource(source: MarketDataSource): SourceTrustMetrics {
    const metrics: SourceTrustMetrics = {
      sourceId: source.id,
      trustScore: source.reliabilityScore,
      historicalAccuracy: source.reliabilityScore,
      consistency: 0.5,
      freshness: 0.5,
      completeness: 0.5,
      updateReliability: 0.5,
      trustHistory: [{
        timestamp: Date.now(),
        trustScore: source.reliabilityScore,
        reason: 'Source initialized',
      }],
      updatedAt: Date.now(),
    };

    this.trustMetrics.set(source.id, metrics);
    return metrics;
  }

  /**
   * Get trust metrics for a source.
   */
  getTrustMetrics(sourceId: string): SourceTrustMetrics | undefined {
    return this.trustMetrics.get(sourceId);
  }

  /**
   * Update trust score for a source.
   */
  updateTrustScore(
    sourceId: string,
    newScore: number,
    reason: string
  ): SourceTrustMetrics | undefined {
    const metrics = this.trustMetrics.get(sourceId);
    if (!metrics) return undefined;

    const oldScore = metrics.trustScore;

    // Apply time-decay weighted update
    const decayFactor = 0.7; // New score has 70% weight
    metrics.trustScore = (newScore * decayFactor) + (oldScore * (1 - decayFactor));

    // Record history
    metrics.trustHistory.push({
      timestamp: Date.now(),
      trustScore: metrics.trustScore,
      reason,
    });

    // Trim history (keep last 100)
    if (metrics.trustHistory.length > 100) {
      metrics.trustHistory = metrics.trustHistory.slice(-100);
    }

    metrics.updatedAt = Date.now();

    return metrics;
  }

  /**
   * Get all trust metrics.
   */
  getAllTrustMetrics(): SourceTrustMetrics[] {
    return Array.from(this.trustMetrics.values());
  }

  // ========================================================================
  // ACCURACY TRACKING
  // ========================================================================

  /**
   * Record accuracy for a source.
   */
  recordAccuracy(
    sourceId: string,
    period: { start: Timestamp; end: Timestamp },
    accuracyData: {
      signalCount: number;
      accurateCount: number;
      accuracyByType: Record<string, number>;
    }
  ): SourceAccuracyRecord {
    const record: SourceAccuracyRecord = {
      sourceId,
      period,
      signalCount: accuracyData.signalCount,
      accurateCount: accuracyData.accurateCount,
      accuracyScore: accuracyData.accurateCount / accuracyData.signalCount,
      accuracyByType: accuracyData.accuracyByType,
    };

    // Store in history
    const history = this.accuracyHistory.get(sourceId) || [];
    history.push(record);
    this.accuracyHistory.set(sourceId, history);

    // Update source trust metrics
    this.updateAccuracyMetrics(sourceId, record);

    return record;
  }

  /**
   * Calculate current accuracy for a source.
   */
  calculateCurrentAccuracy(sourceId: string): number {
    const history = this.accuracyHistory.get(sourceId) || [];

    if (history.length === 0) {
      const metrics = this.trustMetrics.get(sourceId);
      return metrics?.historicalAccuracy ?? 0.5;
    }

    // Weight recent records more heavily
    const now = Date.now();
    const decayMs = this.accuracyDecayDays * 24 * 60 * 60 * 1000;

    let weightedSum = 0;
    let weightSum = 0;

    for (const record of history) {
      const age = now - record.period.end;
      const weight = Math.exp(-age / decayMs);

      weightedSum += record.accuracyScore * weight;
      weightSum += weight;
    }

    return weightSum > 0 ? weightedSum / weightSum : 0.5;
  }

  /**
   * Get accuracy history for a source.
   */
  getAccuracyHistory(sourceId: string): SourceAccuracyRecord[] {
    return this.accuracyHistory.get(sourceId) || [];
  }

  // ========================================================================
  // CONSISTENCY TRACKING
  // ========================================================================

  /**
   * Track a signal for consistency analysis.
   */
  trackSignal(signal: NormalizedMarketSignal): void {
    const history = this.signalHistory.get(signal.source.id) || [];
    history.push(signal);

    // Keep last 1000 signals per source
    if (history.length > 1000) {
      history.shift();
    }

    this.signalHistory.set(signal.source.id, history);
  }

  /**
   * Calculate consistency score for a source.
   */
  calculateConsistency(sourceId: string): number {
    const history = this.signalHistory.get(sourceId) || [];

    if (history.length < this.minSignalsForAccuracy) {
      return 0.5; // Neutral if not enough data
    }

    // Group by entity + signal type
    const grouped = new Map<string, number[]>();

    for (const signal of history) {
      const key = `${signal.entityId}:${signal.signalType}`;
      const values = grouped.get(key) || [];
      values.push(signal.normalizedValue);
      grouped.set(key, values);
    }

    // Calculate coefficient of variation for each group
    let totalCV = 0;
    let groupCount = 0;

    for (const values of grouped.values()) {
      if (values.length < 3) continue;

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      if (mean === 0) continue;

      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean; // Coefficient of variation

      totalCV += cv;
      groupCount++;
    }

    if (groupCount === 0) return 0.5;

    // Lower CV = higher consistency
    const avgCV = totalCV / groupCount;
    return Math.max(0, Math.min(1, 1 - avgCV));
  }

  /**
   * Detect if source has anomalous signals.
   */
  detectAnomalies(sourceId: string, aggregatedSignal: AggregatedMarketSignal): boolean {
    const history = this.signalHistory.get(sourceId) || [];

    if (history.length < 10) return false; // Not enough data

    // Find this source's contribution
    const contribution = aggregatedSignal.contributingSignals.find(
      c => c.sourceId === sourceId
    );

    if (!contribution) return false;

    // Calculate z-score of this value compared to aggregated value
    const sourceValue = contribution.value;
    const aggregatedValue = aggregatedSignal.aggregatedValue;
    const stdDev = aggregatedSignal.standardDeviation;

    if (stdDev === 0) return false;

    const zScore = Math.abs(sourceValue - aggregatedValue) / stdDev;

    // Flag if more than 3 standard deviations
    return zScore > 3;
  }

  // ========================================================================
  // UPDATE RELIABILITY
  // ========================================================================

  /**
   * Update update reliability for a source.
   */
  updateUpdateReliability(
    sourceId: string,
    expectedFrequencyMs: number,
    lastUpdateTime: Timestamp
  ): void {
    const metrics = this.trustMetrics.get(sourceId);
    if (!metrics) return;

    const now = Date.now();
    const timeSinceUpdate = now - lastUpdateTime;
    const expectedUpdates = timeSinceUpdate / expectedFrequencyMs;

    // Calculate reliability based on how close to expected updates
    if (expectedUpdates <= 1.5) {
      metrics.updateReliability = Math.min(1, metrics.updateReliability + 0.1);
    } else if (expectedUpdates > 3) {
      metrics.updateReliability = Math.max(0, metrics.updateReliability - 0.2);
    }

    metrics.updatedAt = now;
  }

  // ========================================================================
  // SOURCE RANKING
  // ========================================================================

  /**
   * Rank sources by trust score.
   */
  rankSources(): Array<{ sourceId: string; trustScore: number; rank: number }> {
    const sources = Array.from(this.trustMetrics.entries())
      .map(([id, metrics]) => ({ sourceId: id, trustScore: metrics.trustScore }))
      .sort((a, b) => b.trustScore - a.trustScore);

    return sources.map((s, i) => ({ ...s, rank: i + 1 }));
  }

  /**
   * Get top sources.
   */
  getTopSources(limit: number = 10): SourceTrustMetrics[] {
    return this.rankSources()
      .slice(0, limit)
      .map(r => this.trustMetrics.get(r.sourceId)!)
      .filter(Boolean);
  }

  /**
   * Get untrusted sources (below threshold).
   */
  getUntrustedSources(threshold: number = 0.5): SourceTrustMetrics[] {
    return this.getAllTrustMetrics().filter(m => m.trustScore < threshold);
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Update accuracy-related metrics.
   */
  private updateAccuracyMetrics(sourceId: string, record: SourceAccuracyRecord): void {
    const metrics = this.trustMetrics.get(sourceId);
    if (!metrics) return;

    // Update historical accuracy with decay
    const decayFactor = 0.3;
    metrics.historicalAccuracy = (record.accuracyScore * decayFactor) +
      (metrics.historicalAccuracy * (1 - decayFactor));

    // Update overall trust score
    metrics.trustScore = (
      metrics.historicalAccuracy * 0.4 +
      metrics.consistency * 0.2 +
      metrics.freshness * 0.2 +
      metrics.completeness * 0.1 +
      metrics.updateReliability * 0.1
    );

    metrics.updatedAt = Date.now();
  }

  /**
   * Get engine statistics.
   */
  getStats(): {
    sourcesTracked: number;
    totalAccuracyRecords: number;
    totalSignalsTracked: number;
  } {
    let totalAccuracy = 0;
    for (const records of this.accuracyHistory.values()) {
      totalAccuracy += records.length;
    }

    let totalSignals = 0;
    for (const signals of this.signalHistory.values()) {
      totalSignals += signals.length;
    }

    return {
      sourcesTracked: this.trustMetrics.size,
      totalAccuracyRecords: totalAccuracy,
      totalSignalsTracked: totalSignals,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new SourceTrustEngine.
 */
export function createSourceTrustEngine(options?: {
  accuracyDecayDays?: number;
  minSignalsForAccuracy?: number;
}): SourceTrustEngine {
  return new SourceTrustEngine(options);
}

/**
 * Calculate quick trust score from limited data.
 */
export function calculateQuickTrustScore(
  source: MarketDataSource,
  recentSignals: NormalizedMarketSignal[]
): number {
  const engine = new SourceTrustEngine();
  engine.initializeSource(source);

  for (const signal of recentSignals) {
    engine.trackSignal(signal);
  }

  const consistency = engine.calculateConsistency(source.id);
  const baseScore = source.reliabilityScore;

  return (baseScore * 0.6) + (consistency * 0.4);
}
