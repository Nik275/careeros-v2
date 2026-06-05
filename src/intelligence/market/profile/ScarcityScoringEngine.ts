/**
 * CareerOS Market Intelligence - Scarcity Scoring Engine
 *
 * Calculates talent shortage score (0-100).
 *
 * Questions:
 * - Are employers struggling to hire?
 * - Are skills difficult to find?
 *
 * Output: Scarcity Score (0-100)
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { ScarcityScoreBreakdown } from './models/MarketScoreBreakdown';

/**
 * Configuration for scarcity scoring.
 */
export interface ScarcityScoringConfig {
  /** Weight for talent availability */
  availabilityWeight: number;

  /** Weight for skill gap */
  skillGapWeight: number;

  /** Weight for education pipeline */
  pipelineWeight: number;

  /** Weight for hiring difficulty */
  difficultyWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_SCARCITY_SCORING_CONFIG: ScarcityScoringConfig = {
  availabilityWeight: 0.3,
  skillGapWeight: 0.25,
  pipelineWeight: 0.2,
  difficultyWeight: 0.25,
};

/**
 * Scarcity metrics calculated from signals.
 */
export interface ScarcityMetrics {
  /** Qualified candidates per job posting */
  candidatesPerJob: number;

  /** Average time to hire (days) */
  timeToHire: number;

  /** Fill rate (%) */
  fillRate: number;

  /** Required skills that are scarce */
  scarceSkills: string[];

  /** Skill availability score */
  skillAvailability: number;

  /** Gap severity (0-100) */
  gapSeverity: number;

  /** Graduates per year (estimated) */
  graduatesPerYear: number;

  /** Market demand (job openings) */
  marketDemand: number;

  /** Balance ratio (supply/demand) */
  balanceRatio: number;

  /** Hiring difficulty score */
  hiringDifficulty: number;
}

/**
 * Calculates talent scarcity score for careers.
 */
export class ScarcityScoringEngine {
  private config: ScarcityScoringConfig;

  constructor(config?: Partial<ScarcityScoringConfig>) {
    this.config = { ...DEFAULT_SCARCITY_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate scarcity score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: ScarcityScoreBreakdown;
  } {
    // Filter to scarcity-relevant signals
    const scarcitySignals = signals.filter(
      (s) =>
        s.signalType === 'skill_growth' ||
        s.signalType === 'job_postings' ||
        s.signalType === 'hiring_rate'
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(scarcitySignals, aggregateSignals);

    // Calculate component scores
    const availabilityScore = this.scoreAvailability(metrics);
    const skillGapScore = this.scoreSkillGap(metrics);
    const pipelineScore = this.scorePipeline(metrics);
    const difficultyScore = this.scoreDifficulty(metrics);

    // Weighted combination (higher = more scarce)
    const baseScore =
      availabilityScore * this.config.availabilityWeight +
      skillGapScore * this.config.skillGapWeight +
      pipelineScore * this.config.pipelineWeight +
      difficultyScore * this.config.difficultyWeight;

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build breakdown
    const breakdown: ScarcityScoreBreakdown = {
      scoreType: 'scarcity',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'talentAvailability',
          weight: this.config.availabilityWeight,
          value: availabilityScore,
          contribution: availabilityScore * this.config.availabilityWeight,
          explanation: `Candidates per job: ${metrics.candidatesPerJob.toFixed(1)}`,
        },
        {
          factor: 'skillGap',
          weight: this.config.skillGapWeight,
          value: skillGapScore,
          contribution: skillGapScore * this.config.skillGapWeight,
          explanation: `Gap severity: ${metrics.gapSeverity.toFixed(0)}/100`,
        },
        {
          factor: 'educationPipeline',
          weight: this.config.pipelineWeight,
          value: pipelineScore,
          contribution: pipelineScore * this.config.pipelineWeight,
          explanation: `Supply/demand ratio: ${metrics.balanceRatio.toFixed(2)}`,
        },
        {
          factor: 'hiringDifficulty',
          weight: this.config.difficultyWeight,
          value: difficultyScore,
          contribution: difficultyScore * this.config.difficultyWeight,
          explanation: `Hiring difficulty: ${metrics.hiringDifficulty.toFixed(0)}/100`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of availability, skill gap, pipeline, and difficulty',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(scarcitySignals),
      evidence: scarcitySignals.slice(0, 5).map((s) => ({
        source: s.source,
        value: s.normalizedStrength,
        timestamp: s.timestamp,
        impact: s.confidence / 100,
      })),
      talentAvailability: {
        qualifiedCandidates: metrics.candidatesPerJob,
        timeToHire: metrics.timeToHire,
        fillRate: metrics.fillRate,
      },
      skillGap: {
        requiredSkills: metrics.scarceSkills,
        availabilityScore: metrics.skillAvailability,
        gapSeverity: metrics.gapSeverity,
      },
      educationPipeline: {
        graduatesPerYear: metrics.graduatesPerYear,
        marketDemand: metrics.marketDemand,
        balanceRatio: metrics.balanceRatio,
      },
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate scarcity metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): ScarcityMetrics {
    // Job signals
    const jobSignals = signals.filter((s) => s.signalType === 'job_postings');
    const marketDemand = jobSignals.length;

    // Candidates per job (inverse of normalized strength for demonstration)
    const avgJobStrength =
      jobSignals.length > 0
        ? jobSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / jobSignals.length
        : 50;
    const candidatesPerJob = 100 - avgJobStrength;

    // Time to hire (derived from signal metadata or defaults)
    const timeToHire =
      jobSignals.length > 0
        ? 45 - (avgJobStrength / 100) * 30 // 15-45 days
        : 30;

    // Fill rate
    const fillRate = Math.min(100, candidatesPerJob * 5);

    // Skill gap from skill signals
    const skillSignals = signals.filter((s) => s.signalType === 'skill_growth');
    const scarceSkills = [...new Set(skillSignals.map((s) => s.careerIdentifier))];
    const skillAvailability =
      skillSignals.length > 0
        ? skillSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / skillSignals.length
        : 50;
    const gapSeverity = 100 - skillAvailability;

    // Education pipeline estimation
    const graduateSignals = aggregateSignals.filter((s) => s.signalType === 'skill_growth');
    const graduatesPerYear = graduateSignals.length > 0 ? graduateSignals.length * 100 : marketDemand * 0.8;

    // Balance ratio
    const balanceRatio = marketDemand > 0 ? graduatesPerYear / marketDemand : 1;

    // Hiring difficulty
    const hiringDifficulty = Math.min(100, (timeToHire / 30) * 50 + (100 - fillRate) * 0.5);

    return {
      candidatesPerJob,
      timeToHire,
      fillRate,
      scarceSkills,
      skillAvailability,
      gapSeverity,
      graduatesPerYear,
      marketDemand,
      balanceRatio,
      hiringDifficulty,
    };
  }

  /**
   * Score talent availability component.
   */
  private scoreAvailability(metrics: ScarcityMetrics): number {
    // Fewer candidates = higher scarcity
    // 50+ candidates = 0 scarcity, 0 candidates = 100 scarcity
    const scarcityFromCandidates = Math.max(0, 100 - metrics.candidatesPerJob * 2);

    // Longer time to hire = higher scarcity
    // 60 days = 100 scarcity, 7 days = 0 scarcity
    const scarcityFromTime = Math.max(0, (metrics.timeToHire - 7) * 1.7);

    return (scarcityFromCandidates + scarcityFromTime) / 2;
  }

  /**
   * Score skill gap component.
   */
  private scoreSkillGap(metrics: ScarcityMetrics): number {
    // Direct gap severity
    return metrics.gapSeverity;
  }

  /**
   * Score education pipeline component.
   */
  private scorePipeline(metrics: ScarcityMetrics): number {
    // Balance ratio > 1 = surplus (low scarcity)
    // Balance ratio < 1 = shortage (high scarcity)
    // Ratio of 1 = 50 scarcity, Ratio of 0.5 = 100 scarcity, Ratio of 2 = 0 scarcity
    if (metrics.balanceRatio >= 1) {
      return Math.max(0, 50 - (metrics.balanceRatio - 1) * 25);
    } else {
      return Math.min(100, 50 + (1 - metrics.balanceRatio) * 50);
    }
  }

  /**
   * Score hiring difficulty component.
   */
  private scoreDifficulty(metrics: ScarcityMetrics): number {
    return metrics.hiringDifficulty;
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: ScarcityMetrics
  ): { score: number; adjustments: ScarcityScoreBreakdown['adjustments'] } {
    const adjustments: ScarcityScoreBreakdown['adjustments'] = [];
    let score = baseScore;

    // Bonus for severe skill gaps
    if (metrics.gapSeverity >= 70) {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Severe skill gap identified',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in scarcity score.
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
 * Factory function for ScarcityScoringEngine.
 */
export function createScarcityScoringEngine(
  config?: Partial<ScarcityScoringConfig>
): ScarcityScoringEngine {
  return new ScarcityScoringEngine(config);
}
