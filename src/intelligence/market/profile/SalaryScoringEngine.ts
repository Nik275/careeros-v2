/**
 * CareerOS Market Intelligence - Salary Scoring Engine
 *
 * Calculates economic attractiveness score (0-100).
 *
 * Inputs:
 * - salary growth
 * - median salary
 * - regional salary variation
 *
 * Output: Salary Score (0-100)
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { SalaryScoreBreakdown } from './models/MarketScoreBreakdown';

/**
 * Configuration for salary scoring.
 */
export interface SalaryScoringConfig {
  /** Weight for salary growth */
  growthWeight: number;

  /** Weight for absolute salary level */
  levelWeight: number;

  /** Weight for regional variation */
  regionalWeight: number;

  /** Weight for progression potential */
  progressionWeight: number;

  /** Reference salary for India (entry-level, LPA) */
  referenceEntrySalary: number;

  /** Reference salary for India (senior, LPA) */
  referenceSeniorSalary: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_SALARY_SCORING_CONFIG: SalaryScoringConfig = {
  growthWeight: 0.3,
  levelWeight: 0.35,
  regionalWeight: 0.2,
  progressionWeight: 0.15,
  referenceEntrySalary: 3, // 3 LPA
  referenceSeniorSalary: 20, // 20 LPA
};

/**
 * Salary metrics calculated from signals.
 */
export interface SalaryMetrics {
  /** Entry level median (LPA) */
  entryMedian: number;

  /** Mid level median (LPA) */
  midMedian: number;

  /** Senior level median (LPA) */
  seniorMedian: number;

  /** Year-over-year growth (%) */
  growthRate: number;

  /** Regional medians */
  regionalMedians: Array<{
    region: string;
    median: number;
  }>;

  /** Highest paying region */
  highestRegion: string;

  /** Lowest paying region */
  lowestRegion: string;

  /** Regional variation coefficient */
  regionalVariation: number;
}

/**
 * Calculates salary attractiveness score for careers.
 */
export class SalaryScoringEngine {
  private config: SalaryScoringConfig;

  constructor(config?: Partial<SalaryScoringConfig>) {
    this.config = { ...DEFAULT_SALARY_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate salary score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: SalaryScoreBreakdown;
  } {
    // Filter to salary-relevant signals
    const salarySignals = signals.filter((s) => s.signalType === 'salary_growth');

    // Calculate metrics
    const metrics = this.calculateMetrics(salarySignals, aggregateSignals);

    // Calculate component scores
    const growthScore = this.scoreGrowth(metrics);
    const levelScore = this.scoreLevel(metrics);
    const regionalScore = this.scoreRegionalVariation(metrics);
    const progressionScore = this.scoreProgression(metrics);

    // Weighted combination
    const baseScore =
      growthScore * this.config.growthWeight +
      levelScore * this.config.levelWeight +
      regionalScore * this.config.regionalWeight +
      progressionScore * this.config.progressionWeight;

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build breakdown
    const breakdown: SalaryScoreBreakdown = {
      scoreType: 'salary',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'growth',
          weight: this.config.growthWeight,
          value: growthScore,
          contribution: growthScore * this.config.growthWeight,
          explanation: `Year-over-year salary growth: ${metrics.growthRate.toFixed(1)}%`,
        },
        {
          factor: 'absoluteLevel',
          weight: this.config.levelWeight,
          value: levelScore,
          contribution: levelScore * this.config.levelWeight,
          explanation: `Median salary: ₹${metrics.midMedian.toFixed(1)} LPA`,
        },
        {
          factor: 'regionalVariation',
          weight: this.config.regionalWeight,
          value: regionalScore,
          contribution: regionalScore * this.config.regionalWeight,
          explanation: `Regional variation: ${metrics.regionalVariation.toFixed(2)}`,
        },
        {
          factor: 'progression',
          weight: this.config.progressionWeight,
          value: progressionScore,
          contribution: progressionScore * this.config.progressionWeight,
          explanation: `Salary progression ratio: ${(metrics.seniorMedian / metrics.entryMedian).toFixed(1)}x`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of growth, level, regional variation, and progression',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(salarySignals),
      evidence: salarySignals.slice(0, 5).map((s) => ({
        source: s.source,
        value: s.normalizedStrength,
        timestamp: s.timestamp,
        impact: s.confidence / 100,
      })),
      entryLevel: {
        median: metrics.entryMedian,
        growth: metrics.growthRate,
      },
      midLevel: {
        median: metrics.midMedian,
        growth: metrics.growthRate,
      },
      seniorLevel: {
        median: metrics.seniorMedian,
        growth: metrics.growthRate,
      },
      regionalVariation: metrics.regionalMedians.map((r) => ({
        region: r.region,
        medianSalary: r.median,
        costOfLivingAdjusted: r.median, // Placeholder
      })),
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate salary metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    _aggregateSignals: AggregateMarketSignal[]
  ): SalaryMetrics {
    // Extract salary values from signals (placeholder implementation)
    // In reality, signals would contain actual salary data

    const salaryValues = signals.map((s) => s.normalizedStrength);

    // Calculate medians for different levels
    const sorted = [...salaryValues].sort((a, b) => a - b);
    const entryMedian = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.25)] : this.config.referenceEntrySalary;
    const midMedian = sorted.length > 0 
      ? sorted[Math.floor(sorted.length * 0.5)] 
      : (this.config.referenceEntrySalary + this.config.referenceSeniorSalary) / 2;
    const seniorMedian = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.75)] : this.config.referenceSeniorSalary;

    // Calculate growth rate
    const recentSignals = signals.filter(
      (s) => s.timestamp.getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
    );
    const olderSignals = signals.filter(
      (s) =>
        s.timestamp.getTime() <= Date.now() - 90 * 24 * 60 * 60 * 1000 &&
        s.timestamp.getTime() > Date.now() - 180 * 24 * 60 * 60 * 1000
    );

    const recentAvg = recentSignals.length > 0
      ? recentSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / recentSignals.length
      : 50;
    const olderAvg = olderSignals.length > 0
      ? olderSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / olderSignals.length
      : 50;

    const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    // Regional medians
    const byRegion = new Map<string, number[]>();
    for (const signal of signals) {
      const existing = byRegion.get(signal.geography) ?? [];
      existing.push(signal.normalizedStrength);
      byRegion.set(signal.geography, existing);
    }

    const regionalMedians = [...byRegion.entries()].map(([region, values]) => ({
      region,
      median: values.length > 0
        ? values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
        : midMedian,
    }));

    // Find highest and lowest regions
    const sortedByMedian = [...regionalMedians].sort((a, b) => b.median - a.median);
    const highestRegion = sortedByMedian[0]?.region ?? 'unknown';
    const lowestRegion = sortedByMedian[sortedByMedian.length - 1]?.region ?? 'unknown';

    // Calculate regional variation
    const regionalVariation = this.calculateVariation(regionalMedians.map((r) => r.median));

    return {
      entryMedian,
      midMedian,
      seniorMedian,
      growthRate,
      regionalMedians,
      highestRegion,
      lowestRegion,
      regionalVariation,
    };
  }

  /**
   * Score salary growth component.
   */
  private scoreGrowth(metrics: SalaryMetrics): number {
    // Score based on growth rate
    // 0% growth = 50, 20% growth = 100, -20% growth = 0
    const normalizedGrowth = (metrics.growthRate + 20) / 40;
    return Math.max(0, Math.min(100, normalizedGrowth * 100));
  }

  /**
   * Score absolute salary level.
   */
  private scoreLevel(metrics: SalaryMetrics): number {
    // Score based on mid-level median
    const ratio = metrics.midMedian / ((this.config.referenceEntrySalary + this.config.referenceSeniorSalary) / 2);
    return Math.min(100, ratio * 50);
  }

  /**
   * Score regional variation.
   */
  private scoreRegionalVariation(metrics: SalaryMetrics): number {
    // Some variation is good (opportunity), too much is bad (instability)
    // Optimal variation around 0.3
    const optimalVariation = 0.3;
    const diff = Math.abs(metrics.regionalVariation - optimalVariation);
    return Math.max(0, 100 - diff * 100);
  }

  /**
   * Score progression potential.
   */
  private scoreProgression(metrics: SalaryMetrics): number {
    // Score based on senior/entry ratio
    // 1x = 0, 5x = 100
    if (metrics.entryMedian === 0) return 50;
    const ratio = metrics.seniorMedian / metrics.entryMedian;
    return Math.min(100, ((ratio - 1) / 4) * 100);
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: SalaryMetrics
  ): { score: number; adjustments: SalaryScoreBreakdown['adjustments'] } {
    const adjustments: SalaryScoreBreakdown['adjustments'] = [];
    let score = baseScore;

    // Bonus for strong progression
    if (metrics.seniorMedian / metrics.entryMedian > 4) {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Strong salary progression potential',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in salary score.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) return 0;

    const signalConfidence = Math.min(100, signals.length * 15);
    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const sources = new Set(signals.map((s) => s.source)).size;
    const sourceConfidence = Math.min(100, sources * 25);

    return Math.round((signalConfidence + avgSignalConfidence + sourceConfidence) / 3);
  }

  /**
   * Calculate coefficient of variation.
   */
  private calculateVariation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  }
}

/**
 * Factory function for SalaryScoringEngine.
 */
export function createSalaryScoringEngine(
  config?: Partial<SalaryScoringConfig>
): SalaryScoringEngine {
  return new SalaryScoringEngine(config);
}
