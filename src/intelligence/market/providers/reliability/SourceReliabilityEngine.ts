/**
 * CareerOS Market Intelligence - Source Reliability Engine
 *
 * Assigns and manages reliability scores for all data sources.
 *
 * Reliability affects confidence throughout the intelligence system.
 */

import type { DataSourceMetadata, DataSourceCategory } from '../types';
import type { MarketSignalType, MarketSignalSource } from '../../models/MarketSignal';

// ============================================================================
// RELIABILITY SCORES
// ============================================================================

/**
 * Base reliability scores by source category.
 */
export const CATEGORY_BASE_RELIABILITY: Record<DataSourceCategory, number> = {
  government: 95,
  industry: 88,
  job_market: 80,
  global: 85,
  academic: 82,
};

/**
 * Default reliability for known sources.
 */
export const SOURCE_RELIABILITY_MAP: Record<string, number> = {
  // Government - India
  'ncs-india': 95,
  'nsdc': 95,
  'aicte': 92,
  'ugc': 90,
  'ministry-labor': 95,

  // Job Market
  'naukri': 80,
  'foundit': 78,
  'indeed': 78,
  'linkedin': 82,
  'shine': 75,
  'timesjobs': 75,

  // Industry
  'nasscom': 88,
  'startup-india': 85,
  'cii': 85,
  'ficci': 85,

  // Global
  'wef': 88,
  'ilo': 90,
  'oecd': 88,
  'world-bank': 90,

  // Default
  'unknown': 30,
};

/**
 * Signal type reliability adjustments by source category.
 */
export const SIGNAL_TYPE_RELIABILITY: Record<
  DataSourceCategory,
  Partial<Record<MarketSignalType, number>>
> = {
  government: {
    job_postings: 0.95,
    salary_growth: 0.90,
    skill_growth: 0.88,
    layoffs: 0.92,
    government_push: 1.0,
    startup_activity: 0.85,
    investment_flow: 0.82,
  },
  job_market: {
    job_postings: 0.95,
    salary_growth: 0.85,
    skill_growth: 0.88,
    layoffs: 0.75,
    startup_activity: 0.70,
    investment_flow: 0.60,
  },
  industry: {
    job_postings: 0.85,
    salary_growth: 0.90,
    skill_growth: 0.92,
    layoffs: 0.80,
    startup_activity: 0.88,
    investment_flow: 0.90,
  },
  global: {
    job_postings: 0.80,
    salary_growth: 0.82,
    skill_growth: 0.88,
    layoffs: 0.78,
    government_push: 0.75,
    startup_activity: 0.80,
    investment_flow: 0.85,
  },
  academic: {
    job_postings: 0.75,
    salary_growth: 0.78,
    skill_growth: 0.85,
    layoffs: 0.70,
    startup_activity: 0.75,
    investment_flow: 0.72,
  },
};

// ============================================================================
// RELIABILITY METRICS
// ============================================================================

/**
 * Performance metrics affecting reliability.
 */
export interface ReliabilityMetrics {
  /** Success rate (0-100) */
  successRate: number;

  /** Average latency in milliseconds */
  averageLatencyMs: number;

  /** Data freshness in hours */
  dataFreshnessHours: number;

  /** Consistency score (0-100) */
  consistencyScore: number;

  /** Number of consecutive failures */
  consecutiveFailures: number;

  /** Total fetches in last 30 days */
  totalFetches30d: number;
}

/**
 * Historical reliability record.
 */
export interface ReliabilityHistory {
  sourceId: string;
  timestamp: Date;
  reliabilityScore: number;
  metrics: ReliabilityMetrics;
  reason?: string;
}

/**
 * Reliability adjustment factors.
 */
interface AdjustmentFactors {
  successRateFactor: number;
  latencyFactor: number;
  freshnessFactor: number;
  consistencyFactor: number;
  failurePenalty: number;
}

// ============================================================================
// SOURCE RELIABILITY ENGINE
// ============================================================================

/**
 * Manages reliability scores for all data sources.
 *
 * Reliability scores affect confidence calculations throughout
 * the market intelligence system.
 */
export class SourceReliabilityEngine {
  private currentScores: Map<string, number> = new Map();
  private scoreHistory: Map<string, ReliabilityHistory[]> = new Map();
  private readonly maxHistoryLength = 100;

  /**
   * Get base reliability score for a source.
   */
  getReliability(sourceId: string): number {
    // Check for dynamic score first
    if (this.currentScores.has(sourceId)) {
      return this.currentScores.get(sourceId)!;
    }

    // Fall back to static mapping
    return SOURCE_RELIABILITY_MAP[sourceId] ?? SOURCE_RELIABILITY_MAP['unknown'];
  }

  /**
   * Get reliability for a specific signal type from a source.
   */
  getSignalTypeReliability(sourceId: string, signalType: MarketSignalType): number {
    const baseReliability = this.getReliability(sourceId);

    // Get source category
    const category = this.getSourceCategory(sourceId);

    // Get signal type multiplier
    const multiplier = SIGNAL_TYPE_RELIABILITY[category]?.[signalType] ?? 1.0;

    return Math.round(baseReliability * multiplier);
  }

  /**
   * Update reliability score based on performance metrics.
   */
  updateReliability(sourceId: string, metrics: ReliabilityMetrics, reason?: string): number {
    const baseScore = this.getBaseReliability(sourceId);
    const adjustments = this.calculateAdjustments(metrics);

    // Calculate adjusted score
    let adjustedScore =
      baseScore *
      adjustments.successRateFactor *
      adjustments.latencyFactor *
      adjustments.freshnessFactor *
      adjustments.consistencyFactor;

    // Apply failure penalty
    adjustedScore -= adjustments.failurePenalty;

    // Clamp to valid range
    const finalScore = Math.max(0, Math.min(100, Math.round(adjustedScore)));

    // Store current score
    this.currentScores.set(sourceId, finalScore);

    // Record history
    this.recordHistory(sourceId, finalScore, metrics, reason);

    return finalScore;
  }

  /**
   * Adjust reliability manually (e.g., for verified issues).
   */
  adjustReliability(sourceId: string, adjustment: number, reason: string): number {
    const currentScore = this.getReliability(sourceId);
    const newScore = Math.max(0, Math.min(100, currentScore + adjustment));

    this.currentScores.set(sourceId, newScore);

    // Record the adjustment
    this.recordHistory(sourceId, newScore, this.getDefaultMetrics(), reason);

    return newScore;
  }

  /**
   * Reset reliability to base score.
   */
  resetReliability(sourceId: string): number {
    const baseScore = this.getBaseReliability(sourceId);
    this.currentScores.delete(sourceId);

    this.recordHistory(
      sourceId,
      baseScore,
      this.getDefaultMetrics(),
      'Reset to base reliability'
    );

    return baseScore;
  }

  /**
   * Get reliability history for a source.
   */
  getReliabilityHistory(sourceId: string, limit?: number): ReliabilityHistory[] {
    const history = this.scoreHistory.get(sourceId) ?? [];

    if (limit) {
      return history.slice(-limit);
    }

    return [...history];
  }

  /**
   * Get reliability trend for a source.
   */
  getReliabilityTrend(sourceId: string, days: number = 30): 'improving' | 'stable' | 'declining' {
    const history = this.getReliabilityHistory(sourceId);

    if (history.length < 2) {
      return 'stable';
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recent = history.filter((h) => h.timestamp >= cutoff);

    if (recent.length < 2) {
      return 'stable';
    }

    const first = recent[0].reliabilityScore;
    const last = recent[recent.length - 1].reliabilityScore;
    const change = last - first;

    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  /**
   * Get all source reliability scores.
   */
  getAllReliabilityScores(): Map<string, number> {
    const scores = new Map<string, number>();

    // Include all known sources
    for (const sourceId of Object.keys(SOURCE_RELIABILITY_MAP)) {
      scores.set(sourceId, this.getReliability(sourceId));
    }

    // Include dynamically scored sources
    for (const [sourceId, score] of this.currentScores) {
      scores.set(sourceId, score);
    }

    return scores;
  }

  /**
   * Get sources by minimum reliability.
   */
  getSourcesByMinReliability(minReliability: number): string[] {
    const scores = this.getAllReliabilityScores();
    const sources: string[] = [];

    for (const [sourceId, score] of scores) {
      if (score >= minReliability) {
        sources.push(sourceId);
      }
    }

    return sources;
  }

  /**
   * Get reliability report.
   */
  getReliabilityReport(sourceId: string): {
    currentScore: number;
    baseScore: number;
    trend: 'improving' | 'stable' | 'declining';
    historyCount: number;
    lastUpdated: Date | null;
  } {
    const history = this.getReliabilityHistory(sourceId);

    return {
      currentScore: this.getReliability(sourceId),
      baseScore: this.getBaseReliability(sourceId),
      trend: this.getReliabilityTrend(sourceId),
      historyCount: history.length,
      lastUpdated: history.length > 0 ? history[history.length - 1].timestamp : null,
    };
  }

  /**
   * Get category reliability.
   */
  getCategoryReliability(category: DataSourceCategory): number {
    return CATEGORY_BASE_RELIABILITY[category];
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get base reliability (static score).
   */
  private getBaseReliability(sourceId: string): number {
    return SOURCE_RELIABILITY_MAP[sourceId] ?? SOURCE_RELIABILITY_MAP['unknown'];
  }

  /**
   * Determine source category from source ID.
   */
  private getSourceCategory(sourceId: string): DataSourceCategory {
    const governmentSources = ['ncs-india', 'nsdc', 'aicte', 'ugc', 'ministry-labor'];
    const jobMarketSources = ['naukri', 'foundit', 'indeed', 'linkedin', 'shine', 'timesjobs'];
    const industrySources = ['nasscom', 'startup-india', 'cii', 'ficci'];
    const globalSources = ['wef', 'ilo', 'oecd', 'world-bank'];

    if (governmentSources.includes(sourceId)) return 'government';
    if (jobMarketSources.includes(sourceId)) return 'job_market';
    if (industrySources.includes(sourceId)) return 'industry';
    if (globalSources.includes(sourceId)) return 'global';

    return 'academic';
  }

  /**
   * Calculate adjustment factors from metrics.
   */
  private calculateAdjustments(metrics: ReliabilityMetrics): AdjustmentFactors {
    // Success rate factor (0.5 to 1.0)
    const successRateFactor = 0.5 + (metrics.successRate / 100) * 0.5;

    // Latency factor (1.0 for <1000ms, decreasing for higher latency)
    const latencyFactor = Math.max(0.7, 1 - metrics.averageLatencyMs / 10000);

    // Freshness factor (1.0 for fresh data, decreasing with age)
    const freshnessFactor = Math.max(0.7, 1 - metrics.dataFreshnessHours / 168); // 1 week

    // Consistency factor (direct multiplier)
    const consistencyFactor = metrics.consistencyScore / 100;

    // Failure penalty (5 points per consecutive failure)
    const failurePenalty = metrics.consecutiveFailures * 5;

    return {
      successRateFactor,
      latencyFactor,
      freshnessFactor,
      consistencyFactor,
      failurePenalty,
    };
  }

  /**
   * Record reliability history.
   */
  private recordHistory(
    sourceId: string,
    score: number,
    metrics: ReliabilityMetrics,
    reason?: string
  ): void {
    if (!this.scoreHistory.has(sourceId)) {
      this.scoreHistory.set(sourceId, []);
    }

    const history = this.scoreHistory.get(sourceId)!;

    history.push({
      sourceId,
      timestamp: new Date(),
      reliabilityScore: score,
      metrics,
      reason,
    });

    // Trim history if too long
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }
  }

  /**
   * Get default metrics.
   */
  private getDefaultMetrics(): ReliabilityMetrics {
    return {
      successRate: 100,
      averageLatencyMs: 1000,
      dataFreshnessHours: 24,
      consistencyScore: 100,
      consecutiveFailures: 0,
      totalFetches30d: 0,
    };
  }
}

/**
 * Factory function for SourceReliabilityEngine.
 */
export function createSourceReliabilityEngine(): SourceReliabilityEngine {
  return new SourceReliabilityEngine();
}
