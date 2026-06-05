/**
 * Learning Weight Engine
 *
 * Calculates influence from learning loop data:
 * - population outcomes
 * - historical success
 * - failure patterns
 * - recommendation effectiveness
 */

import {
  LearningWeight,
  FusionTimestamp,
  Weight,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface LearningWeightConfig {
  // Component weights
  populationOutcomesWeight: Weight;
  historicalSuccessWeight: Weight;
  failurePatternsWeight: Weight;
  recommendationEffectivenessWeight: Weight;

  // Quality thresholds
  minSampleSize: number;
  minStatisticalSignificance: Weight;

  // Boost factors
  largeSampleBoost: number;
  highSuccessRateBoost: number;
  recentOutcomeBoost: number;
}

export const DEFAULT_LEARNING_CONFIG: LearningWeightConfig = {
  populationOutcomesWeight: 0.30,
  historicalSuccessWeight: 0.25,
  failurePatternsWeight: 0.20,
  recommendationEffectivenessWeight: 0.25,

  minSampleSize: 30,
  minStatisticalSignificance: 0.8,

  largeSampleBoost: 1.15,
  highSuccessRateBoost: 1.2,
  recentOutcomeBoost: 1.1,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface PopulationOutcome {
  careerId: string;
  successRate: Weight;
  sampleSize: number;
  avgSatisfaction: Weight;
  avgIncomePercentile: number;
  outcomeDate: Date;
}

export interface HistoricalSuccess {
  pattern: string;
  careerId: string;
  successRate: Weight;
  sampleSize: number;
  timeRange: string;
}

export interface FailurePattern {
  pattern: string;
  careerId: string;
  failureRate: Weight;
  commonCauses: string[];
  warningSigns: string[];
  preventable: boolean;
}

export interface LearningLoopReport {
  populationOutcomes: PopulationOutcome[];
  historicalSuccess: HistoricalSuccess[];
  failurePatterns: FailurePattern[];
  recommendationEffectiveness: Weight;
  totalRecommendationsTracked: number;
  dataLastUpdated: FusionTimestamp;
}

export interface CareerLearningFit {
  careerId: string;
  careerName: string;

  // Outcome matches
  populationOutcome?: PopulationOutcome;

  // Success pattern matches
  matchingSuccessPatterns: Array<{
    pattern: string;
    relevance: Weight;
  }>;

  // Failure pattern warnings
  matchingFailurePatterns: Array<{
    pattern: string;
    relevance: Weight;
    warning: string;
  }>;

  // Effectiveness for similar profiles
  similarProfileEffectiveness: Weight;
}

// ============================================================================
// ENGINE
// ============================================================================

export class LearningWeightEngine {
  private config: LearningWeightConfig;

  constructor(config: Partial<LearningWeightConfig> = {}) {
    this.config = { ...DEFAULT_LEARNING_CONFIG, ...config };
  }

  /**
   * Calculate learning weight for a specific career
   */
  calculateWeight(
    report: LearningLoopReport,
    fit: CareerLearningFit,
    options: {
      sampleSize?: number;
      statisticalSignificance?: Weight;
    } = {}
  ): LearningWeight {
    const timestamp = Date.now();

    // Calculate component scores
    const populationOutcomes = this.calculatePopulationWeight(report, fit);
    const historicalSuccess = this.calculateSuccessWeight(report, fit);
    const failurePatterns = this.calculateFailureWeight(report, fit);
    const recommendationEffectiveness = this.calculateEffectivenessWeight(report, fit);

    // Calculate quality metrics
    const sampleSize = options.sampleSize ?? this.assessSampleSize(report, fit);
    const outcomeRecency = this.assessOutcomeRecency(report);
    const statisticalSignificance =
      options.statisticalSignificance ?? this.assessSignificance(report, fit);

    // Calculate total weight
    let totalWeight =
      populationOutcomes * this.config.populationOutcomesWeight +
      historicalSuccess * this.config.historicalSuccessWeight +
      failurePatterns * this.config.failurePatternsWeight +
      recommendationEffectiveness * this.config.recommendationEffectivenessWeight;

    // Apply quality adjustments
    const sampleFactor = Math.min(1, sampleSize / this.config.minSampleSize);
    totalWeight *= sampleFactor * outcomeRecency * statisticalSignificance;

    // Generate reasoning
    const reasoning = this.generateReasoning(report, fit, {
      populationOutcomes,
      historicalSuccess,
      failurePatterns,
      recommendationEffectiveness,
    });

    return {
      engineId: 'learning',
      timestamp,
      populationOutcomes,
      historicalSuccess,
      failurePatterns,
      recommendationEffectiveness,
      totalWeight: Math.min(1, Math.max(0, totalWeight)),
      sampleSize,
      outcomeRecency,
      statisticalSignificance,
      reasoning,
    };
  }

  /**
   * Calculate batch weights for multiple careers
   */
  calculateBatchWeights(
    report: LearningLoopReport,
    fits: CareerLearningFit[],
    options?: { sampleSize?: number; statisticalSignificance?: Weight }
  ): Map<string, LearningWeight> {
    const weights = new Map<string, LearningWeight>();

    for (const fit of fits) {
      const weight = this.calculateWeight(report, fit, options);
      weights.set(fit.careerId, weight);
    }

    return weights;
  }

  /**
   * Get evidence-based insights for a career
   */
  getEvidenceInsights(
    report: LearningLoopReport,
    fit: CareerLearningFit
  ): {
    successEvidence: string[];
    failureWarnings: string[];
    statistics: {
      sampleSize: number;
      successRate: Weight;
      confidence: Weight;
    };
  } {
    const successEvidence: string[] = [];
    const failureWarnings: string[] = [];

    // Population outcome evidence
    if (fit.populationOutcome) {
      const outcome = fit.populationOutcome;
      successEvidence.push(
        `Population data: ${Math.round(outcome.successRate * 100)}% success rate from ${outcome.sampleSize} tracked outcomes.`
      );
      if (outcome.avgSatisfaction > 0.7) {
        successEvidence.push(
          `High satisfaction: Average satisfaction score of ${Math.round(outcome.avgSatisfaction * 100)}%.`
        );
      }
    }

    // Success pattern evidence
    for (const pattern of fit.matchingSuccessPatterns) {
      if (pattern.relevance > 0.6) {
        successEvidence.push(`Success pattern: ${pattern.pattern}`);
      }
    }

    // Failure warnings
    for (const pattern of fit.matchingFailurePatterns) {
      if (pattern.relevance > 0.5) {
        failureWarnings.push(pattern.warning);
      }
    }

    // Statistics
    const sampleSize = fit.populationOutcome?.sampleSize ?? 0;
    const successRate = fit.populationOutcome?.successRate ?? 0;
    const confidence = this.calculateConfidenceFromSample(sampleSize);

    return {
      successEvidence,
      failureWarnings,
      statistics: {
        sampleSize,
        successRate,
        confidence,
      },
    };
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculatePopulationWeight(report: LearningLoopReport, fit: CareerLearningFit): Weight {
    if (!fit.populationOutcome) return 0.5;

    const outcome = fit.populationOutcome;
    let score = outcome.successRate;

    // Boost for large sample sizes
    if (outcome.sampleSize >= this.config.minSampleSize * 2) {
      score *= this.config.largeSampleBoost;
    }

    // Boost for high success rates
    if (outcome.successRate > 0.8) {
      score *= this.config.highSuccessRateBoost;
    }

    // Consider satisfaction
    score = score * 0.7 + outcome.avgSatisfaction * 0.3;

    return Math.min(1, score);
  }

  private calculateSuccessWeight(report: LearningLoopReport, fit: CareerLearningFit): Weight {
    if (fit.matchingSuccessPatterns.length === 0) return 0.5;

    let totalScore = 0;
    let totalWeight = 0;

    for (const match of fit.matchingSuccessPatterns) {
      const pattern = report.historicalSuccess.find(
        p => p.pattern === match.pattern && p.careerId === fit.careerId
      );
      if (pattern) {
        const weight = pattern.successRate * Math.log(pattern.sampleSize + 1);
        totalScore += match.relevance * pattern.successRate * weight;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) return 0.5;

    return Math.min(1, totalScore / totalWeight);
  }

  private calculateFailureWeight(report: LearningLoopReport, fit: CareerLearningFit): Weight {
    if (fit.matchingFailurePatterns.length === 0) return 0.7; // Slightly positive if no failures

    let penalty = 0;
    let preventablePenalties = 0;

    for (const match of fit.matchingFailurePatterns) {
      const pattern = report.failurePatterns.find(
        p => p.pattern === match.pattern && p.careerId === fit.careerId
      );
      if (pattern) {
        const impact = match.relevance * pattern.failureRate;
        penalty += impact;

        if (pattern.preventable) {
          preventablePenalties += impact;
        }
      }
    }

    // Base score reduced by penalties
    // Preventable penalties hurt less (since we can warn about them)
    const baseScore = 1.0;
    const unpreventablePenalty = penalty - preventablePenalties * 0.5;
    let score = baseScore - unpreventablePenalty;

    return Math.max(0.2, Math.min(1, score));
  }

  private calculateEffectivenessWeight(report: LearningLoopReport, fit: CareerLearningFit): Weight {
    // Start with overall effectiveness
    let score = report.recommendationEffectiveness;

    // Adjust for similar profile effectiveness
    score = score * 0.6 + fit.similarProfileEffectiveness * 0.4;

    // Boost if we have good data for this career
    if (fit.populationOutcome && fit.populationOutcome.sampleSize >= this.config.minSampleSize) {
      score *= 1.1;
    }

    return Math.min(1, score);
  }

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  private assessSampleSize(report: LearningLoopReport, fit: CareerLearningFit): number {
    const outcome = fit.populationOutcome;
    if (!outcome) return 0;

    // Cap at 2x minimum for full credit
    return Math.min(outcome.sampleSize, this.config.minSampleSize * 2);
  }

  private assessOutcomeRecency(report: LearningLoopReport): Weight {
    const age = Date.now() - report.dataLastUpdated;
    const sixMonths = 180 * 24 * 60 * 60 * 1000;
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if (age < sixMonths) return 1.0;
    if (age < oneYear) return 0.9;
    if (age < 2 * oneYear) return 0.75;
    return 0.5;
  }

  private assessSignificance(report: LearningLoopReport, fit: CareerLearningFit): Weight {
    const outcome = fit.populationOutcome;
    if (!outcome) return 0.5;

    // Simple significance based on sample size and success rate variance
    // In production, would use proper statistical tests
    const sampleSignificance = Math.min(1, outcome.sampleSize / this.config.minSampleSize);

    // Higher success rates with large samples = more significant
    const rateSignificance = outcome.successRate > 0.7 || outcome.successRate < 0.3 ? 1.0 : 0.8;

    return sampleSignificance * rateSignificance;
  }

  private calculateConfidenceFromSample(sampleSize: number): Weight {
    if (sampleSize === 0) return 0;
    // Simplified confidence calculation
    // 95% confidence roughly at n=30, approaches 1 as n grows
    return Math.min(1, Math.sqrt(sampleSize) / Math.sqrt(100));
  }

  // ============================================================================
  // REASONING GENERATION
  // ============================================================================

  private generateReasoning(
    report: LearningLoopReport,
    fit: CareerLearningFit,
    scores: {
      populationOutcomes: Weight;
      historicalSuccess: Weight;
      failurePatterns: Weight;
      recommendationEffectiveness: Weight;
    }
  ): string[] {
    const reasoning: string[] = [];

    // Population outcome reasoning
    if (fit.populationOutcome) {
      const outcome = fit.populationOutcome;
      reasoning.push(
        `Population data: ${Math.round(outcome.successRate * 100)}% success rate from ${outcome.sampleSize} tracked students.`
      );
    }

    // Success pattern reasoning
    if (fit.matchingSuccessPatterns.length > 0) {
      const topPattern = fit.matchingSuccessPatterns[0];
      reasoning.push(
        `Success pattern: ${topPattern.pattern} (relevance: ${Math.round(topPattern.relevance * 100)}%)`
      );
    }

    // Failure warning reasoning
    if (fit.matchingFailurePatterns.length > 0) {
      const preventableCount = fit.matchingFailurePatterns.filter(p => {
        const pattern = report.failurePatterns.find(
          fp => fp.pattern === p.pattern && fp.careerId === fit.careerId
        );
        return pattern?.preventable;
      }).length;

      if (preventableCount > 0) {
        reasoning.push(
          `Risk awareness: ${preventableCount} preventable failure patterns identified.`
        );
      }
    }

    // Data quality reasoning
    if (fit.populationOutcome && fit.populationOutcome.sampleSize >= this.config.minSampleSize) {
      reasoning.push(
        `Statistically significant: Based on sufficient sample size (${fit.populationOutcome.sampleSize}).`
      );
    } else if (fit.populationOutcome) {
      reasoning.push(
        `Limited data: Sample size (${fit.populationOutcome.sampleSize}) below optimal threshold.`
      );
    }

    return reasoning;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getConfig(): LearningWeightConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<LearningWeightConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default LearningWeightEngine;
