/**
 * Recommendation Consensus Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 2
 *
 * Analyzes recommendation patterns across all perturbations to determine:
 * - Primary recommendation consensus
 * - Runner-up recommendations
 * - Recommendation distribution
 * - Consensus entropy and strength
 *
 * @module recommendation-consensus-engine
 * @version 1.0.0
 */

import {
  CareerRecommendation,
  RecommendationSet,
} from '../../recommendation/recommendation-types';
import {
  ConsensusConfig,
  ConsensusResult,
  ConsensusId,
  ConsensusStrength,
  RecommendationFrequency,
  RankDistribution,
  PerturbationId,
  DEFAULT_CONSENSUS_CONFIG,
} from './recommendation-stability-types';

/**
 * Internal tracking for career statistics
 */
interface CareerStats {
  careerId: string;
  careerTitle: string;
  count: number;
  totalScore: number;
  totalRank: number;
  scores: number[];
  ranks: number[];
  bestRank: number;
  worstRank: number;
}

/**
 * Recommendation Consensus Engine implementation
 */
export class RecommendationConsensusEngine {
  private config: ConsensusConfig;

  constructor(config: Partial<ConsensusConfig> = {}) {
    this.config = { ...DEFAULT_CONSENSUS_CONFIG, ...config };
  }

  /**
   * Calculate consensus across all perturbed recommendations
   */
  calculateConsensus(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    config?: Partial<ConsensusConfig>
  ): ConsensusResult {
    // Apply any config overrides
    const effectiveConfig = config ? { ...this.config, ...config } : this.config;
    
    const careerStats = this.aggregateCareerStats(perturbedRecommendations, effectiveConfig);
    const totalSimulations = perturbedRecommendations.size;
    
    // Calculate recommendation frequencies
    const recommendationDistribution = this.calculateFrequencies(careerStats, totalSimulations);
    
    // Identify primary and runner-up
    const sortedByFrequency = [...recommendationDistribution].sort(
      (a, b) => b.percentage - a.percentage
    );
    
    const primary = sortedByFrequency[0] ?? {
      careerId: 'unknown',
      careerTitle: 'Unknown',
      percentage: 0,
      averageRank: 0,
      averageScore: 0,
    };
    const runnerUp = sortedByFrequency[1];
    
    // Calculate rank distributions
    const rankDistributions = this.calculateRankDistributions(careerStats, totalSimulations);
    
    // Calculate entropy and related metrics
    const recommendationEntropy = this.calculateEntropy(recommendationDistribution);
    const normalizedEntropy = this.normalizeEntropy(recommendationEntropy, Math.max(1, recommendationDistribution.length));
    const giniCoefficient = this.calculateGini(recommendationDistribution);
    
    // Determine consensus strength
    const consensusStrength = this.classifyConsensusStrength(primary.percentage);
    
    // Build top recommendations by rank
    const topRecommendationsByRank = this.buildTopRecommendationsByRank(
      careerStats,
      totalSimulations,
      effectiveConfig.topRecommendationsCount
    );

    return {
      id: this.generateConsensusId(),
      primaryRecommendation: {
        careerId: primary.careerId,
        careerTitle: primary.careerTitle,
        consensusPercentage: primary.percentage,
        averageRank: primary.averageRank,
        averageScore: primary.averageScore,
      },
      runnerUpRecommendation: runnerUp
        ? {
            careerId: runnerUp.careerId,
            careerTitle: runnerUp.careerTitle,
            consensusPercentage: runnerUp.percentage,
            gapToPrimary: primary.percentage - runnerUp.percentage,
          }
        : undefined,
      recommendationDistribution,
      topRecommendationsByRank,
      rankDistributions,
      recommendationEntropy,
      normalizedEntropy,
      giniCoefficient,
      consensusStrength,
      simulationsAnalyzed: totalSimulations,
      config: effectiveConfig,
      generatedAt: new Date(),
    };
  }

  /**
   * Aggregate statistics for each career across all simulations
   */
  private aggregateCareerStats(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    config: ConsensusConfig
  ): Map<string, CareerStats> {
    const stats = new Map<string, CareerStats>();

    for (const [, recommendationSet] of perturbedRecommendations) {
      // Process top recommendations
      const allRecommendations = [
        ...recommendationSet.topRecommendations,
        ...recommendationSet.alternativeRecommendations,
      ];

      for (let rank = 0; rank < allRecommendations.length; rank++) {
        const rec = allRecommendations[rank];
        const careerId = rec.careerId;
        const currentRank = rank + 1;

        if (!stats.has(careerId)) {
          stats.set(careerId, {
            careerId,
            careerTitle: rec.careerTitle,
            count: 0,
            totalScore: 0,
            totalRank: 0,
            scores: [],
            ranks: [],
            bestRank: Infinity,
            worstRank: 0,
          });
        }

        const careerStats = stats.get(careerId)!;
        const weight = config.weightByScore ? rec.score / 100 : 1;
        
        careerStats.count += weight;
        careerStats.totalScore += rec.score * weight;
        careerStats.totalRank += currentRank * weight;
        careerStats.scores.push(rec.score);
        careerStats.ranks.push(currentRank);
        careerStats.bestRank = Math.min(careerStats.bestRank, currentRank);
        careerStats.worstRank = Math.max(careerStats.worstRank, currentRank);
      }
    }

    return stats;
  }

  /**
   * Calculate recommendation frequencies from career stats
   */
  private calculateFrequencies(
    careerStats: Map<string, CareerStats>,
    totalSimulations: number
  ): RecommendationFrequency[] {
    const frequencies: RecommendationFrequency[] = [];

    for (const [, stats] of careerStats) {
      const percentage = stats.count / totalSimulations;
      const averageScore = stats.totalScore / stats.count;
      const averageRank = stats.totalRank / stats.count;
      
      // Calculate score variance
      const scoreVariance = this.calculateVariance(stats.scores);

      frequencies.push({
        careerId: stats.careerId,
        careerTitle: stats.careerTitle,
        count: Math.round(stats.count),
        percentage,
        averageRank,
        averageScore,
        scoreVariance,
        bestRank: stats.bestRank === Infinity ? 0 : stats.bestRank,
        worstRank: stats.worstRank,
      });
    }

    return frequencies.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Calculate rank distributions for each career
   */
  private calculateRankDistributions(
    careerStats: Map<string, CareerStats>,
    totalSimulations: number
  ): RankDistribution[] {
    const distributions: RankDistribution[] = [];

    for (const [careerId, stats] of careerStats) {
      // Count occurrences at each rank
      const rankCounts = new Map<number, number>();
      for (const rank of stats.ranks) {
        rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
      }

      // Convert to percentages
      const distribution = new Map<number, number>();
      let modeRank = 1;
      let modeCount = 0;

      for (const [rank, count] of rankCounts) {
        const percentage = count / totalSimulations;
        distribution.set(rank, percentage);
        
        if (count > modeCount) {
          modeCount = count;
          modeRank = rank;
        }
      }

      // Calculate rank entropy
      const rankEntropy = this.calculateRankEntropy(distribution);

      distributions.push({
        careerId,
        distribution,
        modeRank,
        rankEntropy,
      });
    }

    return distributions;
  }

  /**
   * Build map of top recommendations by rank position
   */
  private buildTopRecommendationsByRank(
    careerStats: Map<string, CareerStats>,
    totalSimulations: number,
    topCount: number
  ): Map<number, RecommendationFrequency> {
    const topByRank = new Map<number, RecommendationFrequency>();

    for (let rank = 1; rank <= topCount; rank++) {
      let bestCareer: CareerStats | null = null;
      let bestPercentage = 0;

      for (const [, stats] of careerStats) {
        // Count how many times this career appeared at this rank
        const countAtRank = stats.ranks.filter(r => r === rank).length;
        const percentage = countAtRank / totalSimulations;

        if (percentage > bestPercentage) {
          bestPercentage = percentage;
          bestCareer = stats;
        }
      }

      if (bestCareer && bestPercentage > 0) {
        const frequency: RecommendationFrequency = {
          careerId: bestCareer.careerId,
          careerTitle: bestCareer.careerTitle,
          count: Math.round(bestCareer.count),
          percentage: bestPercentage,
          averageRank: bestCareer.totalRank / bestCareer.count,
          averageScore: bestCareer.totalScore / bestCareer.count,
          scoreVariance: this.calculateVariance(bestCareer.scores),
          bestRank: bestCareer.bestRank === Infinity ? 0 : bestCareer.bestRank,
          worstRank: bestCareer.worstRank,
        };
        topByRank.set(rank, frequency);
      }
    }

    return topByRank;
  }

  /**
   * Calculate entropy of recommendation distribution
   */
  private calculateEntropy(frequencies: RecommendationFrequency[]): number {
    let entropy = 0;

    for (const freq of frequencies) {
      if (freq.percentage > 0) {
        entropy -= freq.percentage * Math.log2(freq.percentage);
      }
    }

    return entropy;
  }

  /**
   * Calculate rank entropy
   */
  private calculateRankEntropy(distribution: Map<number, number>): number {
    let entropy = 0;

    for (const percentage of distribution.values()) {
      if (percentage > 0) {
        entropy -= percentage * Math.log2(percentage);
      }
    }

    return entropy;
  }

  /**
   * Normalize entropy to 0-1 range
   */
  private normalizeEntropy(entropy: number, numCareers: number): number {
    if (numCareers <= 1) return 0;
    const maxEntropy = Math.log2(numCareers);
    return entropy / maxEntropy;
  }

  /**
   * Calculate Gini coefficient for distribution inequality
   */
  private calculateGini(frequencies: RecommendationFrequency[]): number {
    if (frequencies.length < 2) return 0;

    const sorted = [...frequencies].sort((a, b) => a.percentage - b.percentage);
    const n = sorted.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      sum += sorted[i].percentage * (2 * (i + 1) - n - 1);
    }

    return sum / (n * frequencies.reduce((a, b) => a + b.percentage, 0));
  }

  /**
   * Classify consensus strength based on primary percentage
   */
  private classifyConsensusStrength(primaryPercentage: number): ConsensusStrength {
    if (primaryPercentage >= 0.95) return 'UNANIMOUS';
    if (primaryPercentage >= 0.75) return 'STRONG';
    if (primaryPercentage >= 0.50) return 'MODERATE';
    if (primaryPercentage >= 0.30) return 'WEAK';
    return 'FRAGMENTED';
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Generate unique consensus ID
   */
  private generateConsensusId(): ConsensusId {
    return `consensus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as ConsensusId;
  }

  /**
   * Get consensus quality score (0-100)
   */
  calculateConsensusQuality(consensus: ConsensusResult): number {
    const { primaryConsensusPercentage, normalizedEntropy, giniCoefficient } = consensus;
    
    // Handle edge cases
    const safePercentage = Number.isFinite(primaryConsensusPercentage) ? primaryConsensusPercentage : 0;
    const safeEntropy = Number.isFinite(normalizedEntropy) ? normalizedEntropy : 1;
    const safeGini = Number.isFinite(giniCoefficient) ? giniCoefficient : 0;
    
    // Higher percentage is better
    const percentageScore = safePercentage * 100;
    
    // Lower entropy is better (more concentrated)
    const entropyScore = (1 - safeEntropy) * 100;
    
    // Higher Gini is better (more unequal = more consensus)
    const giniScore = safeGini * 100;
    
    // Weighted combination
    return Math.round(
      percentageScore * 0.5 + entropyScore * 0.3 + giniScore * 0.2
    );
  }

  /**
   * Check if consensus is actionable (strong enough to rely on)
   */
  isActionableConsensus(consensus: ConsensusResult): boolean {
    return (
      consensus.consensusStrength === 'STRONG' ||
      consensus.consensusStrength === 'UNANIMOUS' ||
      (consensus.consensusStrength === 'MODERATE' &&
        consensus.runnerUpRecommendation &&
        consensus.primaryRecommendation.consensusPercentage -
          consensus.runnerUpRecommendation.consensusPercentage >
          0.15)
    );
  }

  /**
   * Get confidence interval for primary recommendation percentage
   */
  getConsensusConfidenceInterval(
    consensus: ConsensusResult,
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    const p = consensus.primaryRecommendation.consensusPercentage;
    const n = consensus.simulationsAnalyzed;
    
    // Wilson score interval
    const z = this.getZScore(confidenceLevel);
    const denominator = 1 + (z * z) / n;
    const centre = (p + (z * z) / (2 * n)) / denominator;
    const width = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n) / denominator;
    
    return {
      lower: Math.max(0, centre - width),
      upper: Math.min(1, centre + width),
    };
  }

  /**
   * Get Z-score for confidence level
   */
  private getZScore(confidenceLevel: number): number {
    // Common Z-scores
    const zScores: Record<number, number> = {
      0.90: 1.645,
      0.95: 1.96,
      0.99: 2.576,
    };
    return zScores[confidenceLevel] ?? 1.96;
  }
}

/**
 * Factory function for creating consensus engine
 */
export function createConsensusEngine(
  config?: Partial<ConsensusConfig>
): RecommendationConsensusEngine {
  return new RecommendationConsensusEngine(config);
}

/**
 * Quick consensus calculation with default settings
 */
export function calculateQuickConsensus(
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>
): ConsensusResult {
  const engine = new RecommendationConsensusEngine();
  return engine.calculateConsensus(perturbedRecommendations);
}

/**
 * Analyze consensus stability across different perturbation intensities
 */
export function analyzeConsensusStability(
  consensusByIntensity: Map<string, ConsensusResult>
): {
  stable: boolean;
  variance: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
} {
  const percentages: number[] = [];
  
  for (const [, consensus] of consensusByIntensity) {
    percentages.push(consensus.primaryRecommendation.consensusPercentage);
  }

  if (percentages.length < 2) {
    return { stable: true, variance: 0, trend: 'STABLE' };
  }

  const mean = percentages.reduce((a, b) => a + b, 0) / percentages.length;
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
  
  // Determine trend
  const first = percentages[0];
  const last = percentages[percentages.length - 1];
  const trend = last > first + 0.05 ? 'IMPROVING' : last < first - 0.05 ? 'DECLINING' : 'STABLE';
  
  // Consensus is stable if variance is low
  const stable = variance < 0.02;

  return { stable, variance, trend };
}
