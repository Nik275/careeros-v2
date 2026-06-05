/**
 * Stability Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 4
 *
 * Measures recommendation stability:
 * - Primary recommendation retention rate
 * - Top-3 retention rate
 * - Rank change frequency
 * - Average rank change
 * - Maximum rank change
 *
 * Generates stability bands and forecasts.
 *
 * @module stability-engine
 * @version 1.0.0
 */

import {
  RecommendationSet,
} from '../../recommendation/recommendation-types';
import {
  ConsensusResult,
  StabilityResult,
  StabilityMetrics,
  StabilityBand,
  StabilityForecast,
  PerturbationId,
} from './recommendation-stability-types';

/**
 * Stability Engine implementation
 */
export class StabilityEngine {
  /**
   * Measure recommendation stability
   */
  measureStability(
    consensus: ConsensusResult,
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    primaryCareerId: string
  ): StabilityResult {
    const metrics = this.calculateStabilityMetrics(
      perturbedRecommendations,
      primaryCareerId
    );

    const stabilityBand = this.classifyStabilityBand(metrics.stabilityScore);
    const forecast = this.generateStabilityForecast(metrics, consensus);
    const percentileRank = this.calculatePercentileRank(metrics);

    return {
      stabilityScore: Math.round(metrics.stabilityScore),
      stabilityBand,
      metrics,
      explanation: this.generateExplanation(stabilityBand, metrics, primaryCareerId),
      forecast,
      percentileRank,
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate comprehensive stability metrics
   */
  private calculateStabilityMetrics(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    primaryCareerId: string
  ): StabilityMetrics {
    const simulations = Array.from(perturbedRecommendations.entries());
    const totalSimulations = simulations.length;

    if (totalSimulations === 0) {
      return {
        stabilityScore: 0,
        primaryRetentionRate: 0,
        top3RetentionRate: 0,
        averageRankChange: 0,
        maxRankChange: 0,
        rankChangeFrequency: 0,
      };
    }

    // Track primary career position across all simulations
    let primaryCount = 0;
    let top3Count = 0;
    let totalRankChange = 0;
    let maxRankChange = 0;
    let rankChangeCount = 0;
    const primaryRanks: number[] = [];

    for (const [, recommendationSet] of simulations) {
      const allRecommendations = [
        ...recommendationSet.topRecommendations,
        ...recommendationSet.alternativeRecommendations,
      ];

      // Find position of primary career
      const primaryIndex = allRecommendations.findIndex(
        r => r.careerId === primaryCareerId
      );

      if (primaryIndex !== -1) {
        const rank = primaryIndex + 1;
        primaryRanks.push(rank);

        if (rank === 1) {
          primaryCount++;
        }

        if (rank <= 3) {
          top3Count++;
        }

        const rankChange = Math.abs(rank - 1);
        totalRankChange += rankChange;

        if (rankChange > 0) {
          rankChangeCount++;
        }

        maxRankChange = Math.max(maxRankChange, rankChange);
      }
    }

    const primaryRetentionRate = primaryCount / totalSimulations;
    const top3RetentionRate = top3Count / totalSimulations;
    const averageRankChange = totalRankChange / totalSimulations;
    const rankChangeFrequency = rankChangeCount / totalSimulations;

    // Calculate composite stability score
    const stabilityScore = this.calculateCompositeStabilityScore({
      primaryRetentionRate,
      top3RetentionRate,
      averageRankChange,
      maxRankChange,
      rankChangeFrequency,
    });

    return {
      stabilityScore,
      primaryRetentionRate,
      top3RetentionRate,
      averageRankChange,
      maxRankChange,
      rankChangeFrequency,
    };
  }

  /**
   * Calculate composite stability score
   */
  private calculateCompositeStabilityScore(metrics: {
    primaryRetentionRate: number;
    top3RetentionRate: number;
    averageRankChange: number;
    maxRankChange: number;
    rankChangeFrequency: number;
  }): number {
    // Weights for different components
    const weights = {
      primaryRetention: 0.35,
      top3Retention: 0.25,
      rankStability: 0.20,
      maxChangePenalty: 0.15,
      changeFrequency: 0.05,
    };

    // Normalize components to 0-100 scale
    const primaryScore = metrics.primaryRetentionRate * 100;
    const top3Score = metrics.top3RetentionRate * 100;
    const rankStabilityScore = Math.max(0, 100 - metrics.averageRankChange * 20);
    const maxChangeScore = Math.max(0, 100 - metrics.maxRankChange * 10);
    const frequencyScore = (1 - metrics.rankChangeFrequency) * 100;

    // Weighted combination
    return Math.round(
      primaryScore * weights.primaryRetention +
      top3Score * weights.top3Retention +
      rankStabilityScore * weights.rankStability +
      maxChangeScore * weights.maxChangePenalty +
      frequencyScore * weights.changeFrequency
    );
  }

  /**
   * Classify stability band
   */
  private classifyStabilityBand(stabilityScore: number): StabilityBand {
    if (stabilityScore >= 95) return 'ROCK_SOLID';
    if (stabilityScore >= 85) return 'HIGHLY_STABLE';
    if (stabilityScore >= 70) return 'STABLE';
    if (stabilityScore >= 50) return 'MODERATELY_STABLE';
    if (stabilityScore >= 30) return 'UNSTABLE';
    return 'HIGHLY_UNSTABLE';
  }

  /**
   * Generate stability forecast
   */
  private generateStabilityForecast(
    metrics: StabilityMetrics,
    consensus: ConsensusResult
  ): StabilityForecast {
    const likelihoodOfStability = metrics.primaryRetentionRate;

    // Identify potential triggers based on stability characteristics
    const potentialTriggers: string[] = [];
    
    if (metrics.rankChangeFrequency > 0.3) {
      potentialTriggers.push('Small changes in key dimension scores');
    }
    
    if (consensus.runnerUpRecommendation && 
        consensus.runnerUpRecommendation.consensusPercentage > 0.2) {
      potentialTriggers.push('Discovery of new interests or skills');
      potentialTriggers.push('Alternative career exploration');
    }

    if (metrics.averageRankChange > 1) {
      potentialTriggers.push('Major reassessment of priorities');
    }

    // Determine stable timeframe
    let stableFor: string;
    if (metrics.stabilityScore >= 90) {
      stableFor = 'This recommendation is expected to remain stable over time';
    } else if (metrics.stabilityScore >= 70) {
      stableFor = 'This recommendation should remain stable with minor variations';
    } else if (metrics.stabilityScore >= 50) {
      stableFor = 'This recommendation may evolve as you learn more about yourself';
    } else {
      stableFor = 'This recommendation is likely to change with additional exploration';
    }

    // Stability boosters
    const stabilityBoosters: string[] = [];
    if (metrics.primaryRetentionRate < 0.9) {
      stabilityBoosters.push('Completing more assessment questions');
    }
    if (consensus.normalizedEntropy > 0.3) {
      stabilityBoosters.push('Exploring top recommendations in more depth');
    }
    stabilityBoosters.push('Gaining more clarity on priorities and values');

    // Stability risks
    const stabilityRisks: string[] = [];
    if (metrics.rankChangeFrequency > 0.2) {
      stabilityRisks.push('Overthinking or second-guessing assessment answers');
    }
    if (consensus.runnerUpRecommendation &&
        consensus.runnerUpRecommendation.gapToPrimary < 0.1) {
      stabilityRisks.push('Strong alternative options that could compete');
    }
    if (metrics.top3RetentionRate < 0.7) {
      stabilityRisks.push('Broad exploration without focus');
    }

    return {
      likelihoodOfStability,
      potentialTriggers: potentialTriggers.length > 0 ? potentialTriggers : ['No major triggers identified'],
      stableFor,
      stabilityBoosters,
      stabilityRisks: stabilityRisks.length > 0 ? stabilityRisks : ['No significant risks identified'],
    };
  }

  /**
   * Calculate percentile rank compared to typical profiles
   */
  private calculatePercentileRank(metrics: StabilityMetrics): number {
    // This would ideally compare against a database of historical stability scores
    // For now, use a heuristic based on the composite score
    const score = metrics.stabilityScore;
    
    // Approximate percentile mapping
    if (score >= 95) return 95;
    if (score >= 90) return 90;
    if (score >= 85) return 80;
    if (score >= 80) return 70;
    if (score >= 70) return 60;
    if (score >= 60) return 50;
    if (score >= 50) return 40;
    if (score >= 40) return 30;
    if (score >= 30) return 20;
    return 10;
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    band: StabilityBand,
    metrics: StabilityMetrics,
    primaryCareerId: string
  ): string {
    const retentionPercent = Math.round(metrics.primaryRetentionRate * 100);
    
    const bandExplanations: Record<StabilityBand, string> = {
      ROCK_SOLID: 
        `${primaryCareerId} remained the top recommendation in ${retentionPercent}% of simulations. ` +
        `This indicates exceptional stability - your profile strongly aligns with this career.`,
      HIGHLY_STABLE:
        `${primaryCareerId} was the top recommendation in ${retentionPercent}% of simulations. ` +
        `This shows strong stability with minor variations expected.`,
      STABLE:
        `${primaryCareerId} appeared as the top recommendation in ${retentionPercent}% of simulations. ` +
        `This indicates good stability, though some exploration of alternatives may be valuable.`,
      MODERATELY_STABLE:
        `${primaryCareerId} was the top recommendation in ${retentionPercent}% of simulations. ` +
        `This suggests moderate stability - the recommendation is solid but may evolve.`,
      UNSTABLE:
        `${primaryCareerId} was the top recommendation in only ${retentionPercent}% of simulations. ` +
        `This indicates instability - several careers are competing for top position.`,
      HIGHLY_UNSTABLE:
        `${primaryCareerId} was the top recommendation in only ${retentionPercent}% of simulations. ` +
        `This shows high instability - your profile suggests multiple strong possibilities.`,
    };

    let explanation = bandExplanations[band];

    // Add additional context based on metrics
    if (metrics.top3RetentionRate >= 0.9) {
      explanation += ' The top 3 recommendations remained consistent, indicating a focused direction.';
    } else if (metrics.top3RetentionRate < 0.5) {
      explanation += ' The top 3 recommendations varied significantly, suggesting broad exploration is needed.';
    }

    if (metrics.averageRankChange < 0.5) {
      explanation += ' Rank positions were very stable across simulations.';
    } else if (metrics.averageRankChange > 2) {
      explanation += ' Rank positions varied notably across simulations.';
    }

    return explanation;
  }

  /**
   * Compare stability across different time periods or conditions
   */
  compareStability(
    current: StabilityResult,
    previous: StabilityResult
  ): {
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    changePercent: number;
    significantChange: boolean;
  } {
    const scoreChange = current.stabilityScore - previous.stabilityScore;
    const changePercent = (scoreChange / previous.stabilityScore) * 100;
    
    const trend = scoreChange > 5 
      ? 'IMPROVING' 
      : scoreChange < -5 
        ? 'DECLINING' 
        : 'STABLE';
    
    const significantChange = Math.abs(changePercent) > 10;

    return {
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
      significantChange,
    };
  }

  /**
   * Determine if stability is sufficient for confident recommendation
   */
  isStabilitySufficient(
    stability: StabilityResult,
    minBand: StabilityBand = 'MODERATELY_STABLE'
  ): boolean {
    const bandOrder: StabilityBand[] = [
      'HIGHLY_UNSTABLE',
      'UNSTABLE',
      'MODERATELY_STABLE',
      'STABLE',
      'HIGHLY_STABLE',
      'ROCK_SOLID',
    ];
    
    const stabilityLevel = bandOrder.indexOf(stability.stabilityBand);
    const minLevel = bandOrder.indexOf(minBand);
    
    return stabilityLevel >= minLevel;
  }

  /**
   * Calculate stability trend from historical data
   */
  calculateStabilityTrend(
    historicalStability: StabilityResult[]
  ): {
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    volatility: number;
    averageStability: number;
  } {
    if (historicalStability.length < 2) {
      return {
        trend: 'STABLE',
        volatility: 0,
        averageStability: historicalStability[0]?.stabilityScore ?? 0,
      };
    }

    const scores = historicalStability.map(s => s.stabilityScore);
    const averageStability = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate trend using linear regression slope
    const n = scores.length;
    const indices = scores.map((_, i) => i);
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * scores[i], 0);
    const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    const trend = slope > 1 
      ? 'IMPROVING' 
      : slope < -1 
        ? 'DECLINING' 
        : 'STABLE';
    
    // Calculate volatility (standard deviation)
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - averageStability, 2), 0) / n;
    const volatility = Math.sqrt(variance);

    return {
      trend,
      volatility: Math.round(volatility * 10) / 10,
      averageStability: Math.round(averageStability),
    };
  }
}

/**
 * Factory function for creating stability engine
 */
export function createStabilityEngine(): StabilityEngine {
  return new StabilityEngine();
}

/**
 * Quick stability measurement with default settings
 */
export function measureQuickStability(
  consensus: ConsensusResult,
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
  primaryCareerId: string
): StabilityResult {
  const engine = new StabilityEngine();
  return engine.measureStability(consensus, perturbedRecommendations, primaryCareerId);
}

/**
 * Calculate stability metrics without full analysis
 */
export function calculateStabilityMetrics(
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
  primaryCareerId: string
): StabilityMetrics {
  const engine = new StabilityEngine();
  const result = engine.measureStability(
    {} as ConsensusResult,
    perturbedRecommendations,
    primaryCareerId
  );
  return result.metrics;
}
