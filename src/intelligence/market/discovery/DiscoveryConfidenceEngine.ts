/**
 * CareerOS Market Intelligence - Discovery Confidence Engine
 *
 * Calculates confidence scores for all discoveries.
 *
 * Confidence Factors:
 * - Source count
 * - Source quality
 * - Signal consistency
 * - Trend persistence
 * - Evidence diversity
 *
 * Output: 0-100 confidence score with factor breakdown
 */

import type { DiscoverySignal, SourceQuality } from './models/DiscoverySignal';
import type { ConfidenceFactors } from './models/DiscoveryAnalysis';

/**
 * Configuration for confidence calculation.
 */
export interface ConfidenceConfig {
  /** Minimum sources for high confidence */
  minSourcesForHighConfidence: number;

  /** Minimum signals for high confidence */
  minSignalsForHighConfidence: number;

  /** Required source quality threshold */
  qualityThreshold: SourceQuality;

  /** Maximum signal age (days) */
  maxSignalAgeDays: number;

  /** Weights for confidence factors */
  factorWeights: {
    sourceCount: number;
    sourceQuality: number;
    signalConsistency: number;
    trendPersistence: number;
    evidenceDiversity: number;
  };
}

/**
 * Default configuration.
 */
export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  minSourcesForHighConfidence: 5,
  minSignalsForHighConfidence: 8,
  qualityThreshold: 'medium',
  maxSignalAgeDays: 90,
  factorWeights: {
    sourceCount: 0.15,
    sourceQuality: 0.25,
    signalConsistency: 0.25,
    trendPersistence: 0.2,
    evidenceDiversity: 0.15,
  },
};

/**
 * Quality scores for source tiers.
 */
const QUALITY_SCORES: Record<SourceQuality, number> = {
  high: 100,
  medium: 70,
  low: 40,
  unverified: 10,
};

/**
 * Calculates confidence for discoveries.
 */
export class DiscoveryConfidenceEngine {
  private config: ConfidenceConfig;

  constructor(config?: Partial<ConfidenceConfig>) {
    this.config = { ...DEFAULT_CONFIDENCE_CONFIG, ...config };
  }

  /**
   * Calculate confidence factors from signals.
   */
  calculateConfidenceFactors(signals: DiscoverySignal[]): ConfidenceFactors {
    return {
      sourceCount: this.calculateSourceCountFactor(signals),
      sourceQuality: this.calculateSourceQualityFactor(signals),
      signalConsistency: this.calculateSignalConsistencyFactor(signals),
      trendPersistence: this.calculateTrendPersistenceFactor(signals),
      evidenceDiversity: this.calculateEvidenceDiversityFactor(signals),
    };
  }

  /**
   * Calculate overall confidence score.
   */
  calculateConfidence(signals: DiscoverySignal[]): {
    overall: number;
    factors: ConfidenceFactors;
    breakdown: Record<string, { score: number; weight: number; contribution: number }>;
  } {
    const factors = this.calculateConfidenceFactors(signals);

    const breakdown: Record<string, { score: number; weight: number; contribution: number }> = {
      sourceCount: {
        score: factors.sourceCount,
        weight: this.config.factorWeights.sourceCount,
        contribution: factors.sourceCount * this.config.factorWeights.sourceCount,
      },
      sourceQuality: {
        score: factors.sourceQuality,
        weight: this.config.factorWeights.sourceQuality,
        contribution: factors.sourceQuality * this.config.factorWeights.sourceQuality,
      },
      signalConsistency: {
        score: factors.signalConsistency,
        weight: this.config.factorWeights.signalConsistency,
        contribution: factors.signalConsistency * this.config.factorWeights.signalConsistency,
      },
      trendPersistence: {
        score: factors.trendPersistence,
        weight: this.config.factorWeights.trendPersistence,
        contribution: factors.trendPersistence * this.config.factorWeights.trendPersistence,
      },
      evidenceDiversity: {
        score: factors.evidenceDiversity,
        weight: this.config.factorWeights.evidenceDiversity,
        contribution: factors.evidenceDiversity * this.config.factorWeights.evidenceDiversity,
      },
    };

    const overall = Math.round(
      Object.values(breakdown).reduce((sum, item) => sum + item.contribution, 0)
    );

    return {
      overall: Math.min(100, Math.max(0, overall)),
      factors,
      breakdown,
    };
  }

  /**
   * Calculate source count factor.
   */
  private calculateSourceCountFactor(signals: DiscoverySignal[]): number {
    const uniqueSources = new Set(signals.map((s) => s.source)).size;

    if (uniqueSources >= this.config.minSourcesForHighConfidence) {
      return 100;
    }

    if (uniqueSources >= 3) {
      return 70 + (uniqueSources - 3) * 7;
    }

    if (uniqueSources === 2) {
      return 50;
    }

    return 30;
  }

  /**
   * Calculate source quality factor.
   */
  private calculateSourceQualityFactor(signals: DiscoverySignal[]): number {
    if (signals.length === 0) return 0;

    const qualityScores = signals.map((s) => QUALITY_SCORES[s.sourceQuality] ?? 25);
    const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

    // Bonus for having high-quality sources
    const highQualityCount = signals.filter((s) => s.sourceQuality === 'high').length;
    const highQualityBonus = Math.min(20, highQualityCount * 5);

    return Math.min(100, avgQuality + highQualityBonus);
  }

  /**
   * Calculate signal consistency factor.
   */
  private calculateSignalConsistencyFactor(signals: DiscoverySignal[]): number {
    if (signals.length < 3) return 50;

    // Calculate variance in signal strength
    const strengths = signals.map((s) => s.strength);
    const mean = strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
    const variance = strengths.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / strengths.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance = higher consistency
    const consistency = Math.max(0, 100 - stdDev * 2);

    // Bonus for consistent direction
    const directions = signals.map((s) => (s.strength > 50 ? 'up' : 'down'));
    const dominantDirection = directions.filter((d) => d === directions[0]).length;
    const directionBonus = (dominantDirection / directions.length) * 20;

    return Math.min(100, consistency + directionBonus);
  }

  /**
   * Calculate trend persistence factor.
   */
  private calculateTrendPersistenceFactor(signals: DiscoverySignal[]): number {
    if (signals.length < 2) return 40;

    // Sort by timestamp
    const sorted = [...signals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate duration
    const duration =
      (sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime()) /
      (1000 * 60 * 60 * 24);

    // Longer duration = higher persistence
    const durationScore = Math.min(100, (duration / 90) * 100);

    // Check for sustained trend
    const recentSignals = sorted.slice(-5);
    const recentAvg =
      recentSignals.reduce((sum, s) => sum + s.strength, 0) / recentSignals.length;

    const sustainedBonus = recentAvg > 60 ? 15 : 0;

    return Math.min(100, durationScore + sustainedBonus);
  }

  /**
   * Calculate evidence diversity factor.
   */
  private calculateEvidenceDiversityFactor(signals: DiscoverySignal[]): number {
    const evidenceTypes = new Set(signals.flatMap((s) => s.evidence.map((e) => e.type))).size;

    const signalTypes = new Set(signals.map((s) => s.signalType)).size;

    const diversity = Math.min(100, evidenceTypes * 15 + signalTypes * 10);

    return diversity;
  }

  /**
   * Assess confidence level.
   */
  assessConfidenceLevel(confidence: number): {
    level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
    description: string;
  } {
    if (confidence >= 90) {
      return {
        level: 'very_high',
        description: 'Highly reliable discovery with strong evidence',
      };
    }

    if (confidence >= 75) {
      return {
        level: 'high',
        description: 'Reliable discovery with good evidence',
      };
    }

    if (confidence >= 50) {
      return {
        level: 'moderate',
        description: 'Promising discovery with sufficient evidence',
      };
    }

    if (confidence >= 30) {
      return {
        level: 'low',
        description: 'Tentative discovery requiring more evidence',
      };
    }

    return {
      level: 'very_low',
      description: 'Insufficient evidence for reliable discovery',
    };
  }

  /**
   * Compare confidence between two signal sets.
   */
  compareConfidence(
    signalsA: DiscoverySignal[],
    signalsB: DiscoverySignal[]
  ): {
    confidenceA: number;
    confidenceB: number;
    higherConfidence: 'a' | 'b' | 'tie';
    reason: string;
  } {
    const resultA = this.calculateConfidence(signalsA);
    const resultB = this.calculateConfidence(signalsB);

    const higherConfidence =
      resultA.overall > resultB.overall + 10
        ? 'a'
        : resultB.overall > resultA.overall + 10
        ? 'b'
        : 'tie';

    const reason = this.generateComparisonReason(
      resultA.factors,
      resultB.factors,
      higherConfidence
    );

    return {
      confidenceA: resultA.overall,
      confidenceB: resultB.overall,
      higherConfidence,
      reason,
    };
  }

  /**
   * Generate comparison reason.
   */
  private generateComparisonReason(
    factorsA: ConfidenceFactors,
    factorsB: ConfidenceFactors,
    winner: 'a' | 'b' | 'tie'
  ): string {
    if (winner === 'tie') {
      return 'Similar confidence levels across all factors';
    }

    const winningFactors: string[] = [];

    if (winner === 'a') {
      if (factorsA.sourceQuality > factorsB.sourceQuality + 10) {
        winningFactors.push('higher source quality');
      }
      if (factorsA.signalConsistency > factorsB.signalConsistency + 10) {
        winningFactors.push('more consistent signals');
      }
      if (factorsA.trendPersistence > factorsB.trendPersistence + 10) {
        winningFactors.push('more persistent trend');
      }
    } else {
      if (factorsB.sourceQuality > factorsA.sourceQuality + 10) {
        winningFactors.push('higher source quality');
      }
      if (factorsB.signalConsistency > factorsA.signalConsistency + 10) {
        winningFactors.push('more consistent signals');
      }
      if (factorsB.trendPersistence > factorsA.trendPersistence + 10) {
        winningFactors.push('more persistent trend');
      }
    }

    if (winningFactors.length === 0) {
      return winner === 'a' ? 'Marginally higher overall confidence' : 'Marginally lower overall confidence';
    }

    return winningFactors.join(', ');
  }

  /**
   * Identify confidence gaps.
   */
  identifyConfidenceGaps(
    signals: DiscoverySignal[]
  ): Array<{ factor: string; currentScore: number; recommendation: string }> {
    const factors = this.calculateConfidenceFactors(signals);
    const gaps: Array<{ factor: string; currentScore: number; recommendation: string }> = [];

    if (factors.sourceCount < 60) {
      gaps.push({
        factor: 'sourceCount',
        currentScore: factors.sourceCount,
        recommendation: 'Seek additional independent sources',
      });
    }

    if (factors.sourceQuality < 60) {
      gaps.push({
        factor: 'sourceQuality',
        currentScore: factors.sourceQuality,
        recommendation: 'Prioritize high-quality sources',
      });
    }

    if (factors.signalConsistency < 60) {
      gaps.push({
        factor: 'signalConsistency',
        currentScore: factors.signalConsistency,
        recommendation: 'Monitor for consistent patterns',
      });
    }

    if (factors.trendPersistence < 60) {
      gaps.push({
        factor: 'trendPersistence',
        currentScore: factors.trendPersistence,
        recommendation: 'Gather longer-term data',
      });
    }

    if (factors.evidenceDiversity < 60) {
      gaps.push({
        factor: 'evidenceDiversity',
        currentScore: factors.evidenceDiversity,
        recommendation: 'Collect diverse evidence types',
      });
    }

    return gaps;
  }

  /**
   * Validate if confidence meets threshold.
   */
  meetsThreshold(
    signals: DiscoverySignal[],
    threshold: number = 60
  ): {
    meets: boolean;
    confidence: number;
    gap: number;
  } {
    const { overall } = this.calculateConfidence(signals);

    return {
      meets: overall >= threshold,
      confidence: overall,
      gap: Math.max(0, threshold - overall),
    };
  }
}

/**
 * Factory function for DiscoveryConfidenceEngine.
 */
export function createDiscoveryConfidenceEngine(
  config?: Partial<ConfidenceConfig>
): DiscoveryConfidenceEngine {
  return new DiscoveryConfidenceEngine(config);
}
