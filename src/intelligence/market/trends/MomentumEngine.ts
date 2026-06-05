/**
 * CareerOS Market Intelligence - Momentum Engine
 *
 * Measures speed of change in market trends.
 *
 * Example:
 * AI Engineer - Demand rising rapidly → Momentum = High
 * Cybersecurity - Demand rising slowly → Momentum = Moderate
 *
 * Output: 0-100 momentum score
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { MarketMomentum, MomentumTrend } from './models/MarketMomentum';
import { calculateMomentum, calculateMomentumTrend } from './models/MarketMomentum';

/**
 * Configuration for momentum calculation.
 */
export interface MomentumConfig {
  /** Analysis period (days) */
  periodDays: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Weight for recent changes */
  recencyWeight: number;

  /** Threshold for static momentum */
  staticThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_MOMENTUM_CONFIG: MomentumConfig = {
  periodDays: 30,
  minDataPoints: 3,
  recencyWeight: 0.6,
  staticThreshold: 10,
};

/**
 * Momentum calculation with additional metrics.
 */
export interface EnhancedMomentum extends MarketMomentum {
  /** Trend consistency (0-100) */
  consistency: number;

  /** Recent momentum (last 7 days) */
  recentMomentum: number;

  /** Sustained momentum (overall) */
  sustainedMomentum: number;

  /** Momentum trajectory */
  trajectory: 'accelerating' | 'decelerating' | 'stable';

  /** Peak momentum in period */
  peakMomentum: number;

  /** Momentum rank (percentile) */
  rank?: number;
}

/**
 * Calculates market momentum.
 */
export class MomentumEngine {
  private config: MomentumConfig;

  constructor(config?: Partial<MomentumConfig>) {
    this.config = { ...DEFAULT_MOMENTUM_CONFIG, ...config };
  }

  /**
   * Calculate momentum from snapshots.
   */
  calculateMomentum(snapshots: TrendSnapshot[]): EnhancedMomentum | null {
    if (snapshots.length < this.config.minDataPoints) {
      return null;
    }

    // Sort by timestamp
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Filter to period
    const cutoff = Date.now() - this.config.periodDays * 24 * 60 * 60 * 1000;
    const recent = sorted.filter((s) => s.timestamp.getTime() >= cutoff);

    if (recent.length < this.config.minDataPoints) {
      return this.calculateFromAvailable(sorted);
    }

    // Calculate base momentum
    const baseMomentum = calculateMomentum(recent, this.config.periodDays);
    if (!baseMomentum) return null;

    // Calculate enhanced metrics
    const consistency = this.calculateConsistency(recent);
    const recentMomentum = this.calculateRecentMomentum(recent);
    const sustainedMomentum = this.calculateSustainedMomentum(recent);
    const trajectory = this.determineTrajectory(recent);
    const peakMomentum = this.findPeakMomentum(recent);

    return {
      ...baseMomentum,
      consistency,
      recentMomentum,
      sustainedMomentum,
      trajectory,
      peakMomentum,
    };
  }

  /**
   * Calculate momentum from whatever data is available.
   */
  private calculateFromAvailable(snapshots: TrendSnapshot[]): EnhancedMomentum | null {
    const baseMomentum = calculateMomentum(snapshots);
    if (!baseMomentum) return null;

    return {
      ...baseMomentum,
      consistency: 50,
      recentMomentum: baseMomentum.score,
      sustainedMomentum: baseMomentum.score,
      trajectory: 'stable',
      peakMomentum: baseMomentum.score,
    };
  }

  /**
   * Calculate momentum for specific entity.
   */
  calculateEntityMomentum(
    snapshots: TrendSnapshot[],
    entityId: string,
    metricType: string
  ): EnhancedMomentum | null {
    const filtered = snapshots.filter(
      (s) => s.entityId === entityId && s.metricType === metricType
    );

    return this.calculateMomentum(filtered);
  }

  /**
   * Calculate momentum trend over time.
   */
  calculateMomentumTrend(
    snapshots: TrendSnapshot[],
    windowSize: number = 7
  ): MomentumTrend | null {
    return calculateMomentumTrend(snapshots, windowSize);
  }

  /**
   * Compare momentum between entities.
   */
  compareMomentum(
    snapshots: TrendSnapshot[],
    entityA: string,
    entityB: string,
    metricType: string
  ): {
    entityA: EnhancedMomentum | null;
    entityB: EnhancedMomentum | null;
    difference: number;
    winner: 'a' | 'b' | 'tie';
  } | null {
    const momentumA = this.calculateEntityMomentum(snapshots, entityA, metricType);
    const momentumB = this.calculateEntityMomentum(snapshots, entityB, metricType);

    if (!momentumA || !momentumB) return null;

    const difference = momentumA.score - momentumB.score;
    const winner = Math.abs(difference) < 10 ? 'tie' : difference > 0 ? 'a' : 'b';

    return {
      entityA: momentumA,
      entityB: momentumB,
      difference: Math.round(difference),
      winner,
    };
  }

  /**
   * Rank entities by momentum.
   */
  rankByMomentum(
    snapshots: TrendSnapshot[],
    entityIds: string[],
    metricType: string
): Array<{
    entityId: string;
    momentum: EnhancedMomentum;
    rank: number;
    percentile: number;
  }> {
    const results: Array<{
      entityId: string;
      momentum: EnhancedMomentum;
      score: number;
    }> = [];

    for (const entityId of entityIds) {
      const momentum = this.calculateEntityMomentum(snapshots, entityId, metricType);
      if (momentum) {
        results.push({
          entityId,
          momentum,
          score: momentum.score,
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Assign ranks and percentiles
    const total = results.length;
    return results.map((r, index) => ({
      entityId: r.entityId,
      momentum: {
        ...r.momentum,
        rank: index + 1,
      },
      rank: index + 1,
      percentile: Math.round(((total - index) / total) * 100),
    }));
  }

  /**
   * Calculate trend consistency.
   */
  private calculateConsistency(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 3) return 50;

    // Calculate direction changes
    let directionChanges = 0;
    let previousDirection: 'up' | 'down' | 'flat' | null = null;

    for (let i = 1; i < snapshots.length; i++) {
      const diff = snapshots[i].value - snapshots[i - 1].value;
      const threshold = 1;

      let direction: 'up' | 'down' | 'flat';
      if (diff > threshold) direction = 'up';
      else if (diff < -threshold) direction = 'down';
      else direction = 'flat';

      if (previousDirection && direction !== previousDirection && direction !== 'flat') {
        directionChanges++;
      }

      previousDirection = direction;
    }

    // Consistency = 100 - (direction changes / total possible changes * 100)
    const maxChanges = snapshots.length - 2;
    const consistency = maxChanges > 0
      ? 100 - (directionChanges / maxChanges) * 100
      : 100;

    return Math.round(consistency);
  }

  /**
   * Calculate recent momentum (last 7 days).
   */
  private calculateRecentMomentum(snapshots: TrendSnapshot[]): number {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = snapshots.filter((s) => s.timestamp.getTime() >= cutoff);

    if (recent.length < 2) {
      // Fall back to overall momentum
      const overall = calculateMomentum(snapshots);
      return overall?.score ?? 0;
    }

    const momentum = calculateMomentum(recent, 7);
    return momentum?.score ?? 0;
  }

  /**
   * Calculate sustained momentum.
   */
  private calculateSustainedMomentum(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    // Weight earlier points less
    const weightedSum = snapshots.reduce((sum, s, index) => {
      const weight = Math.pow(this.config.recencyWeight, snapshots.length - 1 - index);
      return sum + s.value * weight;
    }, 0);

    const totalWeight = snapshots.reduce((sum, _, index) => {
      return sum + Math.pow(this.config.recencyWeight, snapshots.length - 1 - index);
    }, 0);

    const weightedAvg = weightedSum / totalWeight;

    // Convert to momentum score
    const first = snapshots[0].value;
    const change = weightedAvg - first;
    const rate = change / snapshots.length;

    // Normalize to 0-100
    return Math.min(100, Math.max(0, Math.abs(rate) * 20));
  }

  /**
   * Determine momentum trajectory.
   */
  private determineTrajectory(snapshots: TrendSnapshot[]): EnhancedMomentum['trajectory'] {
    if (snapshots.length < 4) return 'stable';

    const half = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, half);
    const secondHalf = snapshots.slice(half);

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.value, 0) / secondHalf.length;

    const firstMomentum = Math.abs(secondAvg - firstAvg) / half;

    // Calculate momentum change
    const quarter = Math.floor(snapshots.length / 4);
    const firstQuarter = snapshots.slice(0, quarter);
    const secondQuarter = snapshots.slice(quarter, 2 * quarter);
    const thirdQuarter = snapshots.slice(2 * quarter, 3 * quarter);
    const fourthQuarter = snapshots.slice(3 * quarter);

    const q1Avg = firstQuarter.reduce((sum, s) => sum + s.value, 0) / firstQuarter.length;
    const q2Avg = secondQuarter.reduce((sum, s) => sum + s.value, 0) / secondQuarter.length;
    const q3Avg = thirdQuarter.reduce((sum, s) => sum + s.value, 0) / thirdQuarter.length;
    const q4Avg = fourthQuarter.reduce((sum, s) => sum + s.value, 0) / fourthQuarter.length;

    const earlyMomentum = Math.abs(q2Avg - q1Avg);
    const lateMomentum = Math.abs(q4Avg - q3Avg);

    if (lateMomentum > earlyMomentum * 1.2) return 'accelerating';
    if (lateMomentum < earlyMomentum * 0.8) return 'decelerating';
    return 'stable';
  }

  /**
   * Find peak momentum in period.
   */
  private findPeakMomentum(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    let maxChange = 0;

    for (let i = 1; i < snapshots.length; i++) {
      const change = Math.abs(snapshots[i].value - snapshots[i - 1].value);
      maxChange = Math.max(maxChange, change);
    }

    // Normalize to 0-100
    return Math.min(100, maxChange * 10);
  }

  /**
   * Detect momentum inflection points.
   */
  detectInflectionPoints(
    snapshots: TrendSnapshot[],
    windowSize: number = 5
  ): Array<{
    timestamp: Date;
    type: 'peak' | 'trough';
    value: number;
    significance: number;
  }> {
    const points: Array<{
      timestamp: Date;
      type: 'peak' | 'trough';
      value: number;
      significance: number;
    }> = [];

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    for (let i = windowSize; i < sorted.length - windowSize; i++) {
      const current = sorted[i];
      const before = sorted.slice(i - windowSize, i);
      const after = sorted.slice(i + 1, i + windowSize + 1);

      const beforeAvg = before.reduce((sum, s) => sum + s.value, 0) / before.length;
      const afterAvg = after.reduce((sum, s) => sum + s.value, 0) / after.length;

      const beforeTrend = beforeAvg - before[0].value;
      const afterTrend = after[after.length - 1].value - afterAvg;

      // Peak: rising before, falling after
      if (beforeTrend > 0 && afterTrend < 0 && current.value > beforeAvg && current.value > afterAvg) {
        const significance = Math.abs(beforeTrend) + Math.abs(afterTrend);
        points.push({
          timestamp: current.timestamp,
          type: 'peak',
          value: current.value,
          significance: Math.round(significance),
        });
      }

      // Trough: falling before, rising after
      if (beforeTrend < 0 && afterTrend > 0 && current.value < beforeAvg && current.value < afterAvg) {
        const significance = Math.abs(beforeTrend) + Math.abs(afterTrend);
        points.push({
          timestamp: current.timestamp,
          type: 'trough',
          value: current.value,
          significance: Math.round(significance),
        });
      }
    }

    return points;
  }

  /**
   * Check if momentum is significant.
   */
  isSignificant(momentum: EnhancedMomentum): boolean {
    return momentum.score >= 40 && momentum.consistency >= 50;
  }

  /**
   * Get momentum interpretation.
   */
  interpretMomentum(momentum: EnhancedMomentum): string {
    const parts: string[] = [];

    // Level
    parts.push(`${momentum.level.toUpperCase()}`);

    // Direction
    if (momentum.direction !== 'neutral') {
      parts.push(momentum.direction);
    }

    // Trajectory
    if (momentum.trajectory !== 'stable') {
      parts.push(`and ${momentum.trajectory}`);
    }

    // Score
    parts.push(`(${momentum.score}/100)`);

    return parts.join(' ');
  }
}

/**
 * Factory function for MomentumEngine.
 */
export function createMomentumEngine(
  config?: Partial<MomentumConfig>
): MomentumEngine {
  return new MomentumEngine(config);
}
