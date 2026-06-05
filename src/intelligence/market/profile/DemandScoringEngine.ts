/**
 * CareerOS Market Intelligence - Demand Scoring Engine
 *
 * Calculates labor market demand score (0-100).
 *
 * Inputs:
 * - job postings
 * - hiring velocity
 * - employer demand
 * - geographic demand
 *
 * Output: Demand Score (0-100)
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { DemandScoreBreakdown } from './models/MarketScoreBreakdown';
import type { ProfileEvidence } from './models/CareerMarketProfile';

/**
 * Configuration for demand scoring.
 */
export interface DemandScoringConfig {
  /** Weight for job posting volume */
  jobPostingWeight: number;

  /** Weight for hiring velocity */
  hiringVelocityWeight: number;

  /** Weight for employer competition */
  competitionWeight: number;

  /** Weight for geographic spread */
  geographicWeight: number;

  /** Minimum signals required */
  minSignals: number;

  /** Maximum age of signals (days) */
  maxSignalAgeDays: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_DEMAND_SCORING_CONFIG: DemandScoringConfig = {
  jobPostingWeight: 0.35,
  hiringVelocityWeight: 0.25,
  competitionWeight: 0.2,
  geographicWeight: 0.2,
  minSignals: 3,
  maxSignalAgeDays: 90,
};

/**
 * Demand metrics calculated from signals.
 */
export interface DemandMetrics {
  /** Number of job postings */
  jobPostingCount: number;

  /** Posting growth rate (%) */
  postingGrowth: number;

  /** Time to fill positions (days) */
  timeToFill: number;

  /** Hiring velocity (postings per day) */
  hiringVelocity: number;

  /** Competition ratio (applications per posting) */
  competitionRatio: number;

  /** Number of active employers */
  employerCount: number;

  /** Geographic regions with demand */
  geographicRegions: string[];

  /** Geographic concentration score */
  geographicConcentration: number;
}

/**
 * Calculates labor demand score for careers.
 */
export class DemandScoringEngine {
  private config: DemandScoringConfig;

  constructor(config?: Partial<DemandScoringConfig>) {
    this.config = { ...DEFAULT_DEMAND_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate demand score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: DemandScoreBreakdown;
  } {
    // Filter to demand-relevant signals
    const demandSignals = signals.filter(
      (s) => s.signalType === 'job_postings' || s.signalType === 'hiring_rate'
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(demandSignals, aggregateSignals);

    // Calculate component scores
    const jobPostingScore = this.scoreJobPostings(metrics);
    const velocityScore = this.scoreHiringVelocity(metrics);
    const competitionScore = this.scoreCompetition(metrics);
    const geographicScore = this.scoreGeographicSpread(metrics);

    // Weighted combination
    const baseScore =
      jobPostingScore * this.config.jobPostingWeight +
      velocityScore * this.config.hiringVelocityWeight +
      competitionScore * this.config.competitionWeight +
      geographicScore * this.config.geographicWeight;

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build evidence
    const evidence = this.buildEvidence(demandSignals);

    // Build breakdown
    const breakdown: DemandScoreBreakdown = {
      scoreType: 'demand',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'jobPostings',
          weight: this.config.jobPostingWeight,
          value: jobPostingScore,
          contribution: jobPostingScore * this.config.jobPostingWeight,
          explanation: `Based on ${metrics.jobPostingCount} job postings with ${metrics.postingGrowth.toFixed(1)}% growth`,
        },
        {
          factor: 'hiringVelocity',
          weight: this.config.hiringVelocityWeight,
          value: velocityScore,
          contribution: velocityScore * this.config.hiringVelocityWeight,
          explanation: `Hiring velocity: ${metrics.hiringVelocity.toFixed(2)} postings/day`,
        },
        {
          factor: 'competition',
          weight: this.config.competitionWeight,
          value: competitionScore,
          contribution: competitionScore * this.config.competitionWeight,
          explanation: `Competition ratio: ${metrics.competitionRatio.toFixed(1)}:1`,
        },
        {
          factor: 'geographicSpread',
          weight: this.config.geographicWeight,
          value: geographicScore,
          contribution: geographicScore * this.config.geographicWeight,
          explanation: `Active in ${metrics.geographicRegions.length} regions`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of job postings, velocity, competition, and geographic spread',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(demandSignals),
      evidence: evidence.map((e) => ({
        source: e.source,
        value: typeof e.metadata === 'object' && e.metadata && 'strength' in e.metadata 
          ? Number(e.metadata.strength) 
          : 0,
        timestamp: e.timestamp,
        impact: e.confidence / 100,
      })),
      jobPostings: {
        count: metrics.jobPostingCount,
        growth: metrics.postingGrowth,
        velocity: metrics.hiringVelocity,
      },
      hiring: {
        rate: velocityScore,
        timeToFill: metrics.timeToFill,
        competitionRatio: metrics.competitionRatio,
      },
      geographicDemand: metrics.geographicRegions.map((region) => ({
        region,
        score: 50, // Placeholder
        postingCount: Math.floor(metrics.jobPostingCount / metrics.geographicRegions.length),
      })),
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate demand metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): DemandMetrics {
    // Job posting signals
    const jobPostingSignals = signals.filter((s) => s.signalType === 'job_postings');
    const jobPostingCount = jobPostingSignals.length;

    // Calculate growth
    const sortedByTime = [...jobPostingSignals].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const firstHalf = sortedByTime.slice(0, Math.floor(sortedByTime.length / 2));
    const secondHalf = sortedByTime.slice(Math.floor(sortedByTime.length / 2));
    const postingGrowth =
      firstHalf.length > 0
        ? ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100
        : 0;

    // Hiring velocity (postings per day over last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPostings = jobPostingSignals.filter(
      (s) => s.timestamp.getTime() > thirtyDaysAgo
    ).length;
    const hiringVelocity = recentPostings / 30;

    // Time to fill (placeholder - would come from specific signals)
    const timeToFill = 30;

    // Competition ratio (placeholder - would come from application data)
    const competitionRatio = 15;

    // Employer count (from unique sources)
    const employerCount = new Set(jobPostingSignals.map((s) => s.source)).size;

    // Geographic regions
    const geographicRegions = [...new Set(jobPostingSignals.map((s) => s.geography))];

    // Geographic concentration (Gini-like measure)
    const geographyCounts = new Map<string, number>();
    for (const signal of jobPostingSignals) {
      geographyCounts.set(signal.geography, (geographyCounts.get(signal.geography) ?? 0) + 1);
    }
    const geographicConcentration = this.calculateConcentration([...geographyCounts.values()]);

    return {
      jobPostingCount,
      postingGrowth,
      timeToFill,
      hiringVelocity,
      competitionRatio,
      employerCount,
      geographicRegions,
      geographicConcentration,
    };
  }

  /**
   * Score job posting component.
   */
  private scoreJobPostings(metrics: DemandMetrics): number {
    // Normalize posting count (log scale)
    const postingScore = Math.min(100, Math.log10(metrics.jobPostingCount + 1) * 20);

    // Growth contribution
    const growthScore = Math.min(100, Math.max(0, metrics.postingGrowth + 50));

    // Combine
    return postingScore * 0.6 + growthScore * 0.4;
  }

  /**
   * Score hiring velocity component.
   */
  private scoreHiringVelocity(metrics: DemandMetrics): number {
    // Velocity score (higher velocity = higher demand)
    const velocityScore = Math.min(100, metrics.hiringVelocity * 10);

    // Time to fill (shorter = higher demand)
    const timeToFillScore = Math.max(0, 100 - metrics.timeToFill * 2);

    return velocityScore * 0.6 + timeToFillScore * 0.4;
  }

  /**
   * Score competition component.
   */
  private scoreCompetition(metrics: DemandMetrics): number {
    // High competition ratio means lower demand (many applicants per job)
    // Ideal ratio is around 5-10:1
    const optimalRatio = 7.5;
    const ratioDiff = Math.abs(metrics.competitionRatio - optimalRatio);
    return Math.max(0, 100 - ratioDiff * 5);
  }

  /**
   * Score geographic spread component.
   */
  private scoreGeographicSpread(metrics: DemandMetrics): number {
    // More regions = higher geographic spread
    const regionScore = Math.min(100, metrics.geographicRegions.length * 10);

    // Lower concentration = better distribution
    const distributionScore = (1 - metrics.geographicConcentration) * 100;

    return regionScore * 0.6 + distributionScore * 0.4;
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: DemandMetrics
  ): { score: number; adjustments: DemandScoreBreakdown['adjustments'] } {
    const adjustments: DemandScoreBreakdown['adjustments'] = [];
    let score = baseScore;

    // Bonus for high employer diversity
    if (metrics.employerCount >= 10) {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: `High employer diversity (${metrics.employerCount} employers)`,
      });
    }

    // Penalty for very high concentration
    if (metrics.geographicConcentration > 0.8) {
      const penalty = -5;
      score += penalty;
      adjustments.push({
        type: 'penalty',
        amount: penalty,
        reason: 'Geographic concentration risk',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in demand score.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) return 0;

    // More signals = higher confidence
    const signalConfidence = Math.min(100, signals.length * 10);

    // Average signal confidence
    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    // Source diversity
    const sources = new Set(signals.map((s) => s.source));
    const sourceConfidence = Math.min(100, sources.size * 25);

    return Math.round((signalConfidence + avgSignalConfidence + sourceConfidence) / 3);
  }

  /**
   * Calculate concentration (Gini coefficient approximation).
   */
  private calculateConcentration(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return 1;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;

    if (mean === 0) return 0;

    const gini =
      sorted.reduce((sum, val, i) => sum + (2 * (i + 1) - n - 1) * val, 0) /
      (n * n * mean);

    return Math.abs(gini);
  }

  /**
   * Build evidence trail.
   */
  private buildEvidence(signals: NormalizedMarketSignal[]): ProfileEvidence[] {
    return signals.slice(0, 10).map((signal) => ({
      source: signal.source,
      signalType: signal.signalType,
      timestamp: signal.timestamp,
      strength: signal.normalizedStrength,
      confidence: signal.confidence,
      metadata: {
        geography: signal.geography,
        unit: signal.unit,
      },
    }));
  }
}

/**
 * Factory function for DemandScoringEngine.
 */
export function createDemandScoringEngine(
  config?: Partial<DemandScoringConfig>
): DemandScoringEngine {
  return new DemandScoringEngine(config);
}
