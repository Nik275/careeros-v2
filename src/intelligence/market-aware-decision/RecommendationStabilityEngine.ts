/**
 * Recommendation Stability Engine
 *
 * Prevents recommendation volatility from short-term market changes.
 *
 * ## Philosophy
 *
 * "A good recommendation should not change weekly due to market noise."
 *
 * ## Stability Mechanisms
 *
 * | Mechanism | Purpose |
 * |-----------|---------|
 * | Time Window | Minimum 7 days between changes |
 * | Score Threshold | Must change by >10 points to update |
 * | Volatility Tracking | Penalize flip-flopping |
 * | Emergency Override | Allow updates for market crashes |
 *
 * ## Stability Score
 *
 * 0-100 scale:
 * - 80-100: Very stable
 * - 60-79: Stable
 * - 40-59: Moderate volatility
 * - 20-39: High volatility
 * - 0-19: Unstable (user sees inconsistent advice)
 */

import type {
  StabilityRecord,
  StabilityAssessment,
  RecommendationId,
  DecisionId,
  StabilityEngineConfig,
} from './types.js';

import { DEFAULT_STABILITY_ENGINE_CONFIG } from './types.js';

// ============================================================================
// RECOMMENDATION STABILITY ENGINE
// ============================================================================

export class RecommendationStabilityEngine {
  private config: StabilityEngineConfig;
  private records: Map<string, StabilityRecord> = new Map();

  constructor(config: Partial<StabilityEngineConfig> = {}) {
    this.config = { ...DEFAULT_STABILITY_ENGINE_CONFIG, ...config };
  }

  /**
   * Assess whether a recommendation update should be allowed.
   */
  assessStability(
    recommendationId: RecommendationId,
    decisionId: DecisionId,
    proposedScore: number,
    reason: string
  ): StabilityAssessment {
    const recordKey = `${decisionId}:${recommendationId}`;
    const existingRecord = this.records.get(recordKey);

    const now = Date.now();

    // No existing record - allow initial creation
    if (!existingRecord) {
      return {
        recommendationId,
        shouldUpdate: true,
        reason: 'Initial recommendation creation',
        nextUpdateAllowedAt: now + this.config.stabilityWindowMs,
        metrics: {
          daysSinceLastChange: 0,
          scoreVariance: 0,
          trendDirection: 'stable',
        },
      };
    }

    // Check time window
    const timeSinceLastUpdate = now - existingRecord.lastUpdatedAt;
    const daysSinceLastChange = Math.floor(timeSinceLastUpdate / (24 * 60 * 60 * 1000));

    if (timeSinceLastUpdate < this.config.stabilityWindowMs) {
      // Within stability window - check if change is significant enough
      const lastScore = existingRecord.scoreHistory[existingRecord.scoreHistory.length - 1]?.score ?? proposedScore;
      const scoreChange = Math.abs(proposedScore - lastScore);

      if (scoreChange < this.config.scoreChangeThreshold) {
        return {
          recommendationId,
          shouldUpdate: false,
          reason: `Change of ${scoreChange.toFixed(1)} points is below threshold (${this.config.scoreChangeThreshold}) within stability window`,
          nextUpdateAllowedAt: existingRecord.lastUpdatedAt + this.config.stabilityWindowMs,
          metrics: {
            daysSinceLastChange,
            scoreVariance: this.calculateVariance(existingRecord),
            trendDirection: this.detectTrend(existingRecord),
          },
        };
      }

      // Check for emergency update
      if (this.config.allowEmergencyUpdates && this.isEmergencyChange(lastScore, proposedScore)) {
        return {
          recommendationId,
          shouldUpdate: true,
          reason: 'Emergency update triggered due to significant market shift',
          nextUpdateAllowedAt: now + this.config.stabilityWindowMs,
          metrics: {
            daysSinceLastChange,
            scoreVariance: this.calculateVariance(existingRecord),
            trendDirection: this.detectTrend(existingRecord),
          },
        };
      }
    }

    // Outside stability window or significant change - allow update
    const variance = this.calculateVariance(existingRecord);
    const trend = this.detectTrend(existingRecord);

    // Check volatility
    if (variance > this.config.maxVolatilityScore && existingRecord.changeCount > 2) {
      return {
        recommendationId,
        shouldUpdate: true,
        reason: `High volatility detected (${variance.toFixed(1)}). Update allowed but recommendation may need review.`,
        nextUpdateAllowedAt: now + this.config.stabilityWindowMs,
        metrics: {
          daysSinceLastChange,
          scoreVariance: variance,
          trendDirection: trend,
        },
      };
    }

    return {
      recommendationId,
      shouldUpdate: true,
      reason: daysSinceLastChange >= 7
        ? 'Stability window elapsed'
        : 'Significant score change detected',
      nextUpdateAllowedAt: now + this.config.stabilityWindowMs,
      metrics: {
        daysSinceLastChange,
        scoreVariance: variance,
        trendDirection: trend,
      },
    };
  }

  /**
   * Record a recommendation update.
   */
  recordUpdate(
    recommendationId: RecommendationId,
    decisionId: DecisionId,
    score: number,
    reason: string
  ): StabilityRecord {
    const recordKey = `${decisionId}:${recommendationId}`;
    const now = Date.now();

    const existingRecord = this.records.get(recordKey);

    if (existingRecord) {
      // Update existing record
      existingRecord.lastUpdatedAt = now;
      existingRecord.changeCount++;
      existingRecord.scoreHistory.push({
        timestamp: now,
        score,
        reason,
      });

      // Keep only last 20 entries
      if (existingRecord.scoreHistory.length > 20) {
        existingRecord.scoreHistory = existingRecord.scoreHistory.slice(-20);
      }

      // Update stability
      existingRecord.isStable = this.calculateStability(existingRecord);
      existingRecord.volatilityScore = this.calculateVariance(existingRecord);

      this.records.set(recordKey, existingRecord);
      return existingRecord;
    } else {
      // Create new record
      const newRecord: StabilityRecord = {
        recommendationId,
        decisionId,
        firstRecommendedAt: now,
        lastUpdatedAt: now,
        changeCount: 0,
        scoreHistory: [{
          timestamp: now,
          score,
          reason: 'Initial recommendation',
        }],
        isStable: true,
        volatilityScore: 0,
      };

      this.records.set(recordKey, newRecord);
      return newRecord;
    }
  }

  /**
   * Get stability record for a recommendation.
   */
  getStabilityRecord(
    recommendationId: RecommendationId,
    decisionId: DecisionId
  ): StabilityRecord | undefined {
    return this.records.get(`${decisionId}:${recommendationId}`);
  }

  /**
   * Check if change is significant enough to be an emergency.
   */
  private isEmergencyChange(lastScore: number, proposedScore: number): boolean {
    const change = Math.abs(proposedScore - lastScore);
    const changePercent = change / lastScore;

    return changePercent > this.config.emergencyThreshold;
  }

  /**
   * Calculate variance of score history.
   */
  private calculateVariance(record: StabilityRecord): number {
    if (record.scoreHistory.length < 2) return 0;

    const scores = record.scoreHistory.map(h => h.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

    return Math.sqrt(variance);
  }

  /**
   * Detect trend direction in score history.
   */
  private detectTrend(record: StabilityRecord): 'improving' | 'declining' | 'stable' {
    if (record.scoreHistory.length < 3) return 'stable';

    const recent = record.scoreHistory.slice(-3);
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;

    const change = last - first;
    const threshold = 5;

    if (change > threshold) return 'improving';
    if (change < -threshold) return 'declining';
    return 'stable';
  }

  /**
   * Calculate overall stability score.
   */
  private calculateStability(record: StabilityRecord): boolean {
    const variance = this.calculateVariance(record);
    return variance < this.config.maxVolatilityScore;
  }

  /**
   * Get all stability records for a decision.
   */
  getDecisionStability(decisionId: DecisionId): StabilityRecord[] {
    const records: StabilityRecord[] = [];

    for (const [key, record] of this.records) {
      if (key.startsWith(`${decisionId}:`)) {
        records.push(record);
      }
    }

    return records;
  }

  /**
   * Get stability statistics.
   */
  getStatistics(): {
    totalRecords: number;
    stableCount: number;
    unstableCount: number;
    averageVolatility: number;
    averageChanges: number;
  } {
    const records = Array.from(this.records.values());

    if (records.length === 0) {
      return {
        totalRecords: 0,
        stableCount: 0,
        unstableCount: 0,
        averageVolatility: 0,
        averageChanges: 0,
      };
    }

    const stableCount = records.filter(r => r.isStable).length;

    return {
      totalRecords: records.length,
      stableCount,
      unstableCount: records.length - stableCount,
      averageVolatility: records.reduce((sum, r) => sum + r.volatilityScore, 0) / records.length,
      averageChanges: records.reduce((sum, r) => sum + r.changeCount, 0) / records.length,
    };
  }

  /**
   * Clear all records.
   */
  clear(): void {
    this.records.clear();
  }

  /**
   * Clear records for a specific decision.
   */
  clearDecision(decisionId: DecisionId): void {
    for (const key of this.records.keys()) {
      if (key.startsWith(`${decisionId}:`)) {
        this.records.delete(key);
      }
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createRecommendationStabilityEngine(
  config?: Partial<StabilityEngineConfig>
): RecommendationStabilityEngine {
  return new RecommendationStabilityEngine(config);
}
