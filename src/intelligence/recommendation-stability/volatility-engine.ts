/**
 * Volatility Engine
 *
 * Phase 8.4: Recommendation Stability Engine - Part 5
 *
 * Measures recommendation volatility:
 * - Recommendation drift
 * - Ranking instability
 * - Score instability
 * - Career competition intensity
 *
 * Identifies unstable recommendation clusters.
 *
 * @module volatility-engine
 * @version 1.0.0
 */

import {
  RecommendationSet,
} from '../../recommendation/recommendation-types';
import {
  ConsensusResult,
  VolatilityResult,
  VolatilityMetrics,
  UnstableCluster,
  StabilityBand,
  PerturbationId,
  RecommendationFrequency,
} from './recommendation-stability-types';

/**
 * Career tracking for volatility analysis
 */
interface CareerVolatilityData {
  careerId: string;
  careerTitle: string;
  ranks: number[];
  scores: number[];
  appearances: number;
}

/**
 * Volatility Engine implementation
 */
export class VolatilityEngine {
  /**
   * Measure recommendation volatility
   */
  measureVolatility(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
    consensus: ConsensusResult
  ): VolatilityResult {
    const careerData = this.aggregateCareerData(perturbedRecommendations);
    const metrics = this.calculateVolatilityMetrics(careerData, perturbedRecommendations.size);
    const unstableClusters = this.identifyUnstableClusters(careerData, consensus);
    const mostVolatileCareers = this.identifyMostVolatileCareers(careerData);

    // Volatility band is inverse of stability
    const volatilityBand = this.volatilityToStabilityBand(metrics.volatilityScore);

    return {
      volatilityScore: Math.round(metrics.volatilityScore),
      volatilityBand,
      metrics,
      explanation: this.generateExplanation(metrics, unstableClusters),
      unstableClusters,
      mostVolatileCareers,
      generatedAt: new Date(),
    };
  }

  /**
   * Aggregate career data across all simulations
   */
  private aggregateCareerData(
    perturbedRecommendations: Map<PerturbationId, RecommendationSet>
  ): Map<string, CareerVolatilityData> {
    const careerData = new Map<string, CareerVolatilityData>();

    for (const [, recommendationSet] of perturbedRecommendations) {
      const allRecommendations = [
        ...recommendationSet.topRecommendations,
        ...recommendationSet.alternativeRecommendations,
      ];

      for (let rank = 0; rank < allRecommendations.length; rank++) {
        const rec = allRecommendations[rank];
        const careerId = rec.careerId;

        if (!careerData.has(careerId)) {
          careerData.set(careerId, {
            careerId,
            careerTitle: rec.careerTitle,
            ranks: [],
            scores: [],
            appearances: 0,
          });
        }

        const data = careerData.get(careerId)!;
        data.ranks.push(rank + 1);
        data.scores.push(rec.score);
        data.appearances++;
      }
    }

    return careerData;
  }

  /**
   * Calculate comprehensive volatility metrics
   */
  private calculateVolatilityMetrics(
    careerData: Map<string, CareerVolatilityData>,
    totalSimulations: number
  ): VolatilityMetrics {
    // Calculate rank volatility
    const rankVolatility = this.calculateRankVolatility(careerData, totalSimulations);
    
    // Calculate score volatility
    const scoreVolatility = this.calculateScoreVolatility(careerData);
    
    // Calculate career volatility
    const careerVolatility = this.calculateCareerVolatility(careerData, totalSimulations);
    
    // Calculate recommendation drift
    const recommendationDrift = this.calculateRecommendationDrift(careerData, totalSimulations);

    // Calculate composite volatility score
    const volatilityScore = this.calculateCompositeVolatility({
      rankVolatility,
      scoreVolatility,
      careerVolatility,
      recommendationDrift,
    });

    return {
      volatilityScore,
      rankVolatility,
      scoreVolatility,
      careerVolatility,
      recommendationDrift,
    };
  }

  /**
   * Calculate rank volatility (0-100, higher = more volatile)
   */
  private calculateRankVolatility(
    careerData: Map<string, CareerVolatilityData>,
    totalSimulations: number
  ): number {
    let totalRankVariance = 0;
    let careerCount = 0;

    for (const [, data] of careerData) {
      if (data.ranks.length < 2) continue;

      const mean = data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length;
      const squaredDiffs = data.ranks.map(r => Math.pow(r - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.ranks.length;
      
      // Normalize by total simulations to account for careers that don't appear in all
      const normalizedVariance = variance * (totalSimulations / data.appearances);
      
      totalRankVariance += normalizedVariance;
      careerCount++;
    }

    if (careerCount === 0) return 0;

    const averageVariance = totalRankVariance / careerCount;
    // Scale to 0-100 (higher variance = higher volatility)
    return Math.min(100, averageVariance * 5);
  }

  /**
   * Calculate score volatility (0-100, higher = more volatile)
   */
  private calculateScoreVolatility(
    careerData: Map<string, CareerVolatilityData>
  ): number {
    let totalScoreVariance = 0;
    let careerCount = 0;

    for (const [, data] of careerData) {
      if (data.scores.length < 2) continue;

      const mean = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const squaredDiffs = data.scores.map(s => Math.pow(s - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.scores.length;
      
      totalScoreVariance += variance;
      careerCount++;
    }

    if (careerCount === 0) return 0;

    const averageVariance = totalScoreVariance / careerCount;
    // Scale to 0-100 (higher variance = higher volatility)
    return Math.min(100, averageVariance * 2);
  }

  /**
   * Calculate career competition volatility (0-100)
   */
  private calculateCareerVolatility(
    careerData: Map<string, CareerVolatilityData>,
    totalSimulations: number
  ): number {
    // Count how many different careers appeared in top positions
    const topCareers = new Set<string>();
    
    for (const [, data] of careerData) {
      // Check if this career ever appeared in top 3
      const minRank = Math.min(...data.ranks);
      if (minRank <= 3) {
        topCareers.add(data.careerId);
      }
    }

    // More competing careers = higher volatility
    const competitionRatio = topCareers.size / Math.min(careerData.size, 10);
    return Math.round(competitionRatio * 100);
  }

  /**
   * Calculate recommendation drift (0-100)
   */
  private calculateRecommendationDrift(
    careerData: Map<string, CareerVolatilityData>,
    totalSimulations: number
  ): number {
    // Measure how much the set of top recommendations changes
    let totalDrift = 0;
    let comparisonCount = 0;

    const careers = Array.from(careerData.values());

    // Compare each pair of careers
    for (let i = 0; i < careers.length; i++) {
      for (let j = i + 1; j < careers.length; j++) {
        const careerA = careers[i];
        const careerB = careers[j];

        // Calculate rank difference between these careers
        const rankDiffs: number[] = [];
        
        // Find simulations where both appear
        for (let sim = 0; sim < totalSimulations; sim++) {
          const rankA = careerA.ranks[sim];
          const rankB = careerB.ranks[sim];
          
          if (rankA !== undefined && rankB !== undefined) {
            rankDiffs.push(Math.abs(rankA - rankB));
          }
        }

        if (rankDiffs.length > 1) {
          const meanDiff = rankDiffs.reduce((a, b) => a + b, 0) / rankDiffs.length;
          const variance = rankDiffs.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / rankDiffs.length;
          totalDrift += variance;
          comparisonCount++;
        }
      }
    }

    if (comparisonCount === 0) return 0;

    const averageDrift = totalDrift / comparisonCount;
    return Math.min(100, averageDrift * 10);
  }

  /**
   * Calculate composite volatility score
   */
  private calculateCompositeVolatility(metrics: {
    rankVolatility: number;
    scoreVolatility: number;
    careerVolatility: number;
    recommendationDrift: number;
  }): number {
    const weights = {
      rankVolatility: 0.30,
      scoreVolatility: 0.25,
      careerVolatility: 0.25,
      recommendationDrift: 0.20,
    };

    return Math.round(
      metrics.rankVolatility * weights.rankVolatility +
      metrics.scoreVolatility * weights.scoreVolatility +
      metrics.careerVolatility * weights.careerVolatility +
      metrics.recommendationDrift * weights.recommendationDrift
    );
  }

  /**
   * Identify unstable clusters of careers
   */
  private identifyUnstableClusters(
    careerData: Map<string, CareerVolatilityData>,
    consensus: ConsensusResult
  ): UnstableCluster[] {
    const clusters: UnstableCluster[] = [];
    const processedCareers = new Set<string>();

    // Look for careers with similar frequencies (indicating competition)
    const frequencies = consensus.recommendationDistribution;
    
    for (let i = 0; i < frequencies.length; i++) {
      const freqA = frequencies[i];
      
      if (processedCareers.has(freqA.careerId)) continue;

      const cluster: string[] = [freqA.careerId];
      let totalSwapFrequency = 0;

      for (let j = i + 1; j < frequencies.length; j++) {
        const freqB = frequencies[j];
        
        // Check if frequencies are close (competing for position)
        const freqDiff = Math.abs(freqA.percentage - freqB.percentage);
        
        if (freqDiff < 0.15 && !processedCareers.has(freqB.careerId)) {
          cluster.push(freqB.careerId);
          
          // Calculate swap frequency
          const dataA = careerData.get(freqA.careerId);
          const dataB = careerData.get(freqB.careerId);
          
          if (dataA && dataB) {
            const swaps = this.countSwaps(dataA.ranks, dataB.ranks);
            totalSwapFrequency += swaps / dataA.ranks.length;
          }
        }
      }

      if (cluster.length >= 2) {
        // Calculate cluster volatility
        const clusterVolatility = this.calculateClusterVolatility(
          cluster,
          careerData
        );

        clusters.push({
          careers: cluster,
          clusterVolatility,
          swapFrequency: totalSwapFrequency / (cluster.length - 1),
          reason: this.generateClusterReason(cluster, frequencies),
          distinguishingFactors: this.identifyDistinguishingFactors(
            cluster,
            careerData
          ),
        });

        cluster.forEach(c => processedCareers.add(c));
      }
    }

    return clusters.sort((a, b) => b.clusterVolatility - a.clusterVolatility);
  }

  /**
   * Count how often two careers swap positions
   */
  private countSwaps(ranksA: number[], ranksB: number[]): number {
    let swaps = 0;
    const minLength = Math.min(ranksA.length, ranksB.length);

    for (let i = 1; i < minLength; i++) {
      const prevA = ranksA[i - 1];
      const prevB = ranksB[i - 1];
      const currA = ranksA[i];
      const currB = ranksB[i];

      // Check if relative order changed
      if ((prevA < prevB && currA > currB) || (prevA > prevB && currA < currB)) {
        swaps++;
      }
    }

    return swaps;
  }

  /**
   * Calculate volatility within a cluster
   */
  private calculateClusterVolatility(
    cluster: string[],
    careerData: Map<string, CareerVolatilityData>
  ): number {
    let totalVariance = 0;
    let count = 0;

    for (const careerId of cluster) {
      const data = careerData.get(careerId);
      if (data && data.ranks.length > 1) {
        const mean = data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length;
        const variance = data.ranks.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / data.ranks.length;
        totalVariance += variance;
        count++;
      }
    }

    return count > 0 ? Math.min(100, (totalVariance / count) * 10) : 0;
  }

  /**
   * Generate reason for cluster instability
   */
  private generateClusterReason(
    cluster: string[],
    frequencies: RecommendationFrequency[]
  ): string {
    const clusterFreqs = frequencies.filter(f => cluster.includes(f.careerId));
    const avgPercentage = clusterFreqs.reduce((sum, f) => sum + f.percentage, 0) / clusterFreqs.length;
    
    if (avgPercentage > 0.3) {
      return 'Multiple strong candidates with similar profile fit';
    } else if (cluster.length > 3) {
      return 'Broad competition with many viable alternatives';
    } else {
      return 'Close competition between similar career paths';
    }
  }

  /**
   * Identify factors that distinguish careers in a cluster
   */
  private identifyDistinguishingFactors(
    cluster: string[],
    careerData: Map<string, CareerVolatilityData>
  ): string[] {
    // This would typically analyze career attributes
    // For now, return generic factors based on cluster size
    const factors: string[] = [];
    
    if (cluster.length <= 2) {
      factors.push('Subtle differences in skill emphasis');
    } else if (cluster.length <= 4) {
      factors.push('Multiple viable specializations');
      factors.push('Overlapping skill requirements');
    } else {
      factors.push('Broad career exploration phase');
      factors.push('Multiple unrelated interests');
    }

    return factors;
  }

  /**
   * Identify most volatile careers
   */
  private identifyMostVolatileCareers(
    careerData: Map<string, CareerVolatilityData>
  ): Array<{
    careerId: string;
    careerTitle: string;
    volatilityScore: number;
    rankRange: { min: number; max: number };
  }> {
    const volatileCareers: Array<{
      careerId: string;
      careerTitle: string;
      volatilityScore: number;
      rankRange: { min: number; max: number };
    }> = [];

    for (const [, data] of careerData) {
      if (data.ranks.length < 2) continue;

      const minRank = Math.min(...data.ranks);
      const maxRank = Math.max(...data.ranks);
      const range = maxRank - minRank;
      
      // Calculate variance
      const mean = data.ranks.reduce((a, b) => a + b, 0) / data.ranks.length;
      const variance = data.ranks.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / data.ranks.length;
      
      // Volatility score combines range and variance
      const volatilityScore = Math.min(100, (range * 5) + (variance * 2));

      // Only include careers with significant volatility
      if (volatilityScore > 20) {
        volatileCareers.push({
          careerId: data.careerId,
          careerTitle: data.careerTitle,
          volatilityScore: Math.round(volatilityScore),
          rankRange: { min: minRank, max: maxRank },
        });
      }
    }

    return volatileCareers
      .sort((a, b) => b.volatilityScore - a.volatilityScore)
      .slice(0, 5);
  }

  /**
   * Convert volatility score to stability band
   */
  private volatilityToStabilityBand(volatilityScore: number): StabilityBand {
    // Inverse mapping - high volatility = low stability
    if (volatilityScore >= 70) return 'HIGHLY_UNSTABLE';
    if (volatilityScore >= 50) return 'UNSTABLE';
    if (volatilityScore >= 30) return 'MODERATELY_STABLE';
    if (volatilityScore >= 15) return 'STABLE';
    if (volatilityScore >= 5) return 'HIGHLY_STABLE';
    return 'ROCK_SOLID';
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    metrics: VolatilityMetrics,
    unstableClusters: UnstableCluster[]
  ): string {
    const parts: string[] = [];

    // Overall volatility assessment
    if (metrics.volatilityScore >= 70) {
      parts.push('This profile shows high volatility with significant changes in recommendations across simulations.');
    } else if (metrics.volatilityScore >= 40) {
      parts.push('This profile shows moderate volatility with some variation in recommendations.');
    } else {
      parts.push('This profile shows low volatility with consistent recommendations.');
    }

    // Rank volatility detail
    if (metrics.rankVolatility >= 60) {
      parts.push('Career rankings changed significantly across different profile variations.');
    } else if (metrics.rankVolatility >= 30) {
      parts.push('Career rankings showed moderate variation.');
    }

    // Career competition
    if (metrics.careerVolatility >= 60) {
      parts.push('Multiple careers are competing strongly for the top position.');
    }

    // Cluster information
    if (unstableClusters.length > 0) {
      const topCluster = unstableClusters[0];
      parts.push(`The ${topCluster.careers.length} most competitive careers form an unstable cluster with frequent position swaps.`);
    }

    return parts.join(' ');
  }

  /**
   * Calculate volatility trend
   */
  calculateVolatilityTrend(
    current: VolatilityResult,
    previous: VolatilityResult
  ): {
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    changePercent: number;
  } {
    const change = current.volatilityScore - previous.volatilityScore;
    const changePercent = (change / previous.volatilityScore) * 100;

    const trend = change > 5 
      ? 'INCREASING' 
      : change < -5 
        ? 'DECREASING' 
        : 'STABLE';

    return {
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
    };
  }
}

/**
 * Factory function for creating volatility engine
 */
export function createVolatilityEngine(): VolatilityEngine {
  return new VolatilityEngine();
}

/**
 * Quick volatility measurement
 */
export function measureQuickVolatility(
  perturbedRecommendations: Map<PerturbationId, RecommendationSet>,
  consensus: ConsensusResult
): VolatilityResult {
  const engine = new VolatilityEngine();
  return engine.measureVolatility(perturbedRecommendations, consensus);
}

/**
 * Check if volatility is within acceptable range
 */
export function isVolatilityAcceptable(
  volatility: VolatilityResult,
  maxThreshold: number = 60
): boolean {
  return volatility.volatilityScore <= maxThreshold;
}
