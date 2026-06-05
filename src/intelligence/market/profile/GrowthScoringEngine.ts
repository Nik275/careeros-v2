/**
 * CareerOS Market Intelligence - Growth Scoring Engine
 *
 * Calculates career expansion score (0-100).
 *
 * Inputs:
 * - hiring growth
 * - industry growth
 * - investment growth
 *
 * Output: Growth Score (0-100)
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { GrowthScoreBreakdown } from './models/MarketScoreBreakdown';

/**
 * Configuration for growth scoring.
 */
export interface GrowthScoringConfig {
  /** Weight for hiring growth */
  hiringGrowthWeight: number;

  /** Weight for industry growth */
  industryGrowthWeight: number;

  /** Weight for investment indicators */
  investmentWeight: number;

  /** Weight for startup activity */
  startupWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_GROWTH_SCORING_CONFIG: GrowthScoringConfig = {
  hiringGrowthWeight: 0.35,
  industryGrowthWeight: 0.3,
  investmentWeight: 0.2,
  startupWeight: 0.15,
};

/**
 * Growth metrics calculated from signals.
 */
export interface GrowthMetrics {
  /** 1-year hiring growth (%) */
  oneYearHiringGrowth: number;

  /** 3-year hiring growth (%) */
  threeYearHiringGrowth: number;

  /** Growth trend */
  trend: 'accelerating' | 'steady' | 'decelerating';

  /** Industry sector growth (%) */
  industryGrowth: number;

  /** Market expansion rate (%) */
  marketExpansion: number;

  /** Investment flow growth (%) */
  investmentGrowth: number;

  /** Number of new companies */
  newCompanies: number;

  /** Startup activity level */
  startupActivity: number;
}

/**
 * Calculates growth score for careers.
 */
export class GrowthScoringEngine {
  private config: GrowthScoringConfig;

  constructor(config?: Partial<GrowthScoringConfig>) {
    this.config = { ...DEFAULT_GROWTH_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate growth score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: GrowthScoreBreakdown;
  } {
    // Filter to growth-relevant signals
    const growthSignals = signals.filter(
      (s) =>
        s.signalType === 'job_postings' ||
        s.signalType === 'investment_flow' ||
        s.signalType === 'startup_activity' ||
        s.signalType === 'government_push'
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(growthSignals, aggregateSignals);

    // Calculate component scores
    const hiringGrowthScore = this.scoreHiringGrowth(metrics);
    const industryScore = this.scoreIndustryGrowth(metrics);
    const investmentScore = this.scoreInvestment(metrics);
    const startupScore = this.scoreStartupActivity(metrics);

    // Weighted combination
    const baseScore =
      hiringGrowthScore * this.config.hiringGrowthWeight +
      industryScore * this.config.industryGrowthWeight +
      investmentScore * this.config.investmentWeight +
      startupScore * this.config.startupWeight;

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build breakdown
    const breakdown: GrowthScoreBreakdown = {
      scoreType: 'growth',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'hiringGrowth',
          weight: this.config.hiringGrowthWeight,
          value: hiringGrowthScore,
          contribution: hiringGrowthScore * this.config.hiringGrowthWeight,
          explanation: `Hiring growth: ${metrics.oneYearHiringGrowth.toFixed(1)}% (1yr), ${metrics.threeYearHiringGrowth.toFixed(1)}% (3yr)`,
        },
        {
          factor: 'industryGrowth',
          weight: this.config.industryGrowthWeight,
          value: industryScore,
          contribution: industryScore * this.config.industryGrowthWeight,
          explanation: `Industry growth: ${metrics.industryGrowth.toFixed(1)}%`,
        },
        {
          factor: 'investmentFlow',
          weight: this.config.investmentWeight,
          value: investmentScore,
          contribution: investmentScore * this.config.investmentWeight,
          explanation: `Investment growth: ${metrics.investmentGrowth.toFixed(1)}%`,
        },
        {
          factor: 'startupActivity',
          weight: this.config.startupWeight,
          value: startupScore,
          contribution: startupScore * this.config.startupWeight,
          explanation: `Startup activity: ${metrics.startupActivity.toFixed(1)}/100`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of hiring, industry, investment, and startup indicators',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(growthSignals),
      evidence: growthSignals.slice(0, 5).map((s) => ({
        source: s.source,
        value: s.normalizedStrength,
        timestamp: s.timestamp,
        impact: s.confidence / 100,
      })),
      hiringGrowth: {
        oneYear: metrics.oneYearHiringGrowth,
        threeYear: metrics.threeYearHiringGrowth,
        trend: metrics.trend,
      },
      industryGrowth: {
        sectorGrowth: metrics.industryGrowth,
        marketExpansion: metrics.marketExpansion,
      },
      investment: {
        fundingGrowth: metrics.investmentGrowth,
        newCompanies: metrics.newCompanies,
      },
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate growth metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): GrowthMetrics {
    // Hiring growth from job posting signals
    const jobSignals = signals.filter((s) => s.signalType === 'job_postings');

    // Calculate 1-year growth
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const recentJobs = jobSignals.filter((s) => s.timestamp.getTime() > oneYearAgo);
    const olderJobs = jobSignals.filter(
      (s) => s.timestamp.getTime() <= oneYearAgo && s.timestamp.getTime() > oneYearAgo - 365 * 24 * 60 * 60 * 1000
    );
    const oneYearHiringGrowth = olderJobs.length > 0
      ? ((recentJobs.length - olderJobs.length) / olderJobs.length) * 100
      : 0;

    // Calculate 3-year growth (using aggregate signals if available)
    const threeYearAggregate = aggregateSignals.filter(
      (s) => s.signalType === 'job_postings' && s.timeRange.start.getTime() < oneYearAgo - 730 * 24 * 60 * 60 * 1000
    );
    const threeYearHiringGrowth = threeYearAggregate.length > 0
      ? ((recentJobs.length - threeYearAggregate.length) / Math.max(1, threeYearAggregate.length)) * 100
      : oneYearHiringGrowth * 3;

    // Determine trend
    let trend: GrowthMetrics['trend'] = 'steady';
    if (oneYearHiringGrowth > threeYearHiringGrowth / 3 + 10) {
      trend = 'accelerating';
    } else if (oneYearHiringGrowth < threeYearHiringGrowth / 3 - 10) {
      trend = 'decelerating';
    }

    // Industry growth from aggregate signals
    const industrySignals = aggregateSignals.filter((s) => s.signalType === 'job_postings');
    const industryGrowth = industrySignals.length > 0
      ? industrySignals.reduce((sum, s) => sum + s.aggregatedStrength, 0) / industrySignals.length
      : 50;

    // Market expansion
    const marketExpansion = Math.min(100, oneYearHiringGrowth + 20);

    // Investment growth
    const investmentSignals = signals.filter((s) => s.signalType === 'investment_flow');
    const investmentGrowth = investmentSignals.length > 0
      ? investmentSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / investmentSignals.length
      : 50;

    // New companies from startup signals
    const startupSignals = signals.filter((s) => s.signalType === 'startup_activity');
    const newCompanies = startupSignals.length;
    const startupActivity = startupSignals.length > 0
      ? startupSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / startupSignals.length
      : 50;

    return {
      oneYearHiringGrowth,
      threeYearHiringGrowth,
      trend,
      industryGrowth,
      marketExpansion,
      investmentGrowth,
      newCompanies,
      startupActivity,
    };
  }

  /**
   * Score hiring growth component.
   */
  private scoreHiringGrowth(metrics: GrowthMetrics): number {
    // Score based on 1-year growth
    // -20% = 0, 0% = 50, 30% = 100
    const normalized1Yr = ((metrics.oneYearHiringGrowth + 20) / 50) * 100;
    const score1Yr = Math.max(0, Math.min(100, normalized1Yr));

    // Bonus for sustained 3-year growth
    const normalized3Yr = ((metrics.threeYearHiringGrowth + 40) / 100) * 100;
    const score3Yr = Math.max(0, Math.min(100, normalized3Yr));

    // Weight 1-year more heavily
    return score1Yr * 0.6 + score3Yr * 0.4;
  }

  /**
   * Score industry growth component.
   */
  private scoreIndustryGrowth(metrics: GrowthMetrics): number {
    return Math.min(100, Math.max(0, metrics.industryGrowth));
  }

  /**
   * Score investment component.
   */
  private scoreInvestment(metrics: GrowthMetrics): number {
    // Investment growth score
    const investmentScore = Math.min(100, Math.max(0, metrics.investmentGrowth));

    // New companies bonus
    const companyScore = Math.min(100, metrics.newCompanies * 5);

    return investmentScore * 0.7 + companyScore * 0.3;
  }

  /**
   * Score startup activity component.
   */
  private scoreStartupActivity(metrics: GrowthMetrics): number {
    return Math.min(100, metrics.startupActivity * 1.2);
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: GrowthMetrics
  ): { score: number; adjustments: GrowthScoreBreakdown['adjustments'] } {
    const adjustments: GrowthScoreBreakdown['adjustments'] = [];
    let score = baseScore;

    // Bonus for accelerating trend
    if (metrics.trend === 'accelerating') {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Growth is accelerating',
      });
    }

    // Penalty for decelerating trend
    if (metrics.trend === 'decelerating') {
      const penalty = -5;
      score += penalty;
      adjustments.push({
        type: 'penalty',
        amount: penalty,
        reason: 'Growth is decelerating',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in growth score.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) return 0;

    const signalConfidence = Math.min(100, signals.length * 10);
    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const sources = new Set(signals.map((s) => s.source)).size;
    const sourceConfidence = Math.min(100, sources * 25);

    return Math.round((signalConfidence + avgSignalConfidence + sourceConfidence) / 3);
  }
}

/**
 * Factory function for GrowthScoringEngine.
 */
export function createGrowthScoringEngine(
  config?: Partial<GrowthScoringConfig>
): GrowthScoringEngine {
  return new GrowthScoringEngine(config);
}
