/**
 * CareerOS Career Recommendation Engine - Recommendation Ranker
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Ranks and categorizes career recommendations.
 *
 * @module recommendation-ranker
 * @version 1.0.0
 */

import type {
  CareerRecommendation,
  RecommendationType,
  RecommendationDimensions,
  DEFAULT_RECOMMENDATION_WEIGHTS,
  RankingCriteria,
} from './recommendation-types';
import type { CareerFitResult } from '../career-fit/career-fit-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';

/**
 * Ranks careers and assigns recommendation types.
 *
 * Calculates recommendation scores and categorizes careers into
 * strong matches, good matches, potential matches, and stretch matches.
 */
export class RecommendationRanker {
  private weights: RecommendationDimensions;

  constructor(weights?: Partial<RecommendationDimensions>) {
    this.weights = { ...DEFAULT_RECOMMENDATION_WEIGHTS, ...weights };
  }

  /**
   * Rank career fits and generate recommendations.
   */
  rankCareers(
    fitResults: CareerFitResult[],
    careerIntelligence: Map<string, CareerIntelligence>,
    profileId: string
  ): CareerRecommendation[] {
    const recommendations: CareerRecommendation[] = [];

    for (const fitResult of fitResults) {
      const career = careerIntelligence.get(fitResult.careerId);
      if (!career) continue;

      const recommendation = this.createRecommendation(fitResult, career, profileId);
      recommendations.push(recommendation);
    }

    // Sort by score (descending)
    const ranked = recommendations.sort((a, b) => b.score - a.score);

    // Assign ranks and adjust types based on ranking
    return this.assignRanksAndTypes(ranked);
  }

  /**
   * Create a recommendation from fit result and career intelligence.
   */
  private createRecommendation(
    fitResult: CareerFitResult,
    career: CareerIntelligence,
    profileId: string
  ): CareerRecommendation {
    // Calculate component scores
    const fitScore = fitResult.overallFitScore;
    const futureRelevanceScore = career.careerAdvantages.futureRelevance.score;
    const careerMobilityScore = career.careerAdvantages.careerMobility.score;
    const lifestyleAlignmentScore = fitResult.breakdown.lifestyle.score;
    const riskAlignmentScore = fitResult.breakdown.risk.score;
    const marketOpportunityScore = this.calculateMarketOpportunityScore(career);

    // Calculate weighted recommendation score
    const score = Math.round(
      fitScore * this.weights.fitWeight +
      futureRelevanceScore * this.weights.futureRelevanceWeight +
      careerMobilityScore * this.weights.careerMobilityWeight +
      lifestyleAlignmentScore * this.weights.lifestyleAlignmentWeight +
      riskAlignmentScore * this.weights.riskAlignmentWeight +
      marketOpportunityScore * this.weights.marketOpportunityWeight
    );

    // Determine recommendation type
    const recommendationType = this.determineRecommendationType(score, fitScore);

    return {
      id: `${profileId}-${career.careerId}-${Date.now()}`,
      studentProfileId: profileId,
      careerId: career.careerId,
      careerTitle: career.careerTitle,
      recommendationType,
      rank: 0, // Assigned later
      score,
      fitScore,
      futureRelevanceScore,
      careerMobilityScore,
      lifestyleAlignmentScore,
      riskAlignmentScore,
      marketOpportunityScore,
      fitResult,
      explanation: {
        whyRecommended: [],
        whyNotHigher: [],
        whyNotLower: [],
        majorAdvantages: [],
        majorConcerns: [],
        uniqueSellingPoints: [],
        fitSummary: '',
        outlookSummary: '',
      },
      alternatives: [],
      relatedCareers: [],
      confidence: {
        overall: 0,
        recommendationConfidence: 0,
        evidenceConfidence: 0,
        profileConfidence: fitResult.confidence.profileConfidence,
        careerConfidence: career.evidence?.overallConfidence ?? 50,
        level: 'MEDIUM',
      },
      metadata: {
        rankingMethod: 'weighted-multi-dimensional',
        version: '1.0.0',
        careersEvaluated: 0,
        generatedAt: new Date(),
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate market opportunity score.
   */
  private calculateMarketOpportunityScore(career: CareerIntelligence): number {
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;

    // Market opportunity based on:
    // - Future relevance (higher is better)
    // - Competition risk (lower is better)
    // - Transferability (higher is better)

    const score = Math.round(
      advantages.futureRelevance.score * 0.4 +
      (100 - risks.competitionRisk.score) * 0.35 +
      advantages.transferability.score * 0.25
    );

    return score;
  }

  /**
   * Determine recommendation type from scores.
   */
  private determineRecommendationType(recommendationScore: number, fitScore: number): RecommendationType {
    if (recommendationScore >= 80 && fitScore >= 75) return 'STRONG_MATCH';
    if (recommendationScore >= 65 && fitScore >= 60) return 'GOOD_MATCH';
    if (recommendationScore >= 50 && fitScore >= 45) return 'POTENTIAL_MATCH';
    return 'STRETCH_MATCH';
  }

  /**
   * Assign ranks and refine types based on relative ranking.
   */
  private assignRanksAndTypes(recommendations: CareerRecommendation[]): CareerRecommendation[] {
    return recommendations.map((rec, index) => {
      const rank = index + 1;

      // Adjust type based on rank if needed
      let type = rec.recommendationType;

      // Top 3 are at least GOOD_MATCH
      if (rank <= 3 && type === 'POTENTIAL_MATCH') {
        type = 'GOOD_MATCH';
      }

      // Top recommendation is STRONG_MATCH if score is high enough
      if (rank === 1 && rec.score >= 75 && type !== 'STRONG_MATCH') {
        type = 'STRONG_MATCH';
      }

      return {
        ...rec,
        rank,
        recommendationType: type,
      };
    });
  }

  /**
   * Apply ranking criteria adjustments.
   */
  applyCriteria(
    recommendations: CareerRecommendation[],
    criteria: RankingCriteria
  ): CareerRecommendation[] {
    let adjustedWeights = { ...this.weights };

    if (criteria.prioritizeFit) {
      adjustedWeights.fitWeight = Math.min(0.5, adjustedWeights.fitWeight + 0.1);
    }

    if (criteria.prioritizeFuture) {
      adjustedWeights.futureRelevanceWeight = Math.min(0.25, adjustedWeights.futureRelevanceWeight + 0.05);
    }

    if (criteria.prioritizeSafety) {
      adjustedWeights.riskAlignmentWeight = Math.min(0.2, adjustedWeights.riskAlignmentWeight + 0.05);
    }

    if (criteria.prioritizeOptionality) {
      adjustedWeights.careerMobilityWeight = Math.min(0.25, adjustedWeights.careerMobilityWeight + 0.05);
    }

    if (criteria.prioritizeLifestyle) {
      adjustedWeights.lifestyleAlignmentWeight = Math.min(0.25, adjustedWeights.lifestyleAlignmentWeight + 0.05);
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
    adjustedWeights = {
      fitWeight: adjustedWeights.fitWeight / totalWeight,
      futureRelevanceWeight: adjustedWeights.futureRelevanceWeight / totalWeight,
      careerMobilityWeight: adjustedWeights.careerMobilityWeight / totalWeight,
      lifestyleAlignmentWeight: adjustedWeights.lifestyleAlignmentWeight / totalWeight,
      riskAlignmentWeight: adjustedWeights.riskAlignmentWeight / totalWeight,
      marketOpportunityWeight: adjustedWeights.marketOpportunityWeight / totalWeight,
    };

    // Recalculate scores
    return recommendations.map((rec) => {
      const newScore = Math.round(
        rec.fitScore * adjustedWeights.fitWeight +
        rec.futureRelevanceScore * adjustedWeights.futureRelevanceWeight +
        rec.careerMobilityScore * adjustedWeights.careerMobilityWeight +
        rec.lifestyleAlignmentScore * adjustedWeights.lifestyleAlignmentWeight +
        rec.riskAlignmentScore * adjustedWeights.riskAlignmentWeight +
        rec.marketOpportunityScore * adjustedWeights.marketOpportunityWeight
      );

      return {
        ...rec,
        score: newScore,
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Get top N recommendations.
   */
  getTopRecommendations(
    recommendations: CareerRecommendation[],
    count: number = 5
  ): CareerRecommendation[] {
    return recommendations
      .filter((r) => r.recommendationType !== 'STRETCH_MATCH')
      .slice(0, count);
  }

  /**
   * Get alternative recommendations.
   */
  getAlternativeRecommendations(
    recommendations: CareerRecommendation[],
    count: number = 3
  ): CareerRecommendation[] {
    // Get recommendations ranked 4-6 or GOOD_MATCH/POTENTIAL_MATCH types
    return recommendations
      .filter((r) => r.rank > 3 && r.recommendationType !== 'STRETCH_MATCH')
      .slice(0, count);
  }

  /**
   * Get stretch recommendations.
   */
  getStretchRecommendations(
    recommendations: CareerRecommendation[],
    count: number = 3
  ): CareerRecommendation[] {
    return recommendations
      .filter((r) => r.recommendationType === 'STRETCH_MATCH' || r.fitScore >= 40)
      .slice(0, count);
  }

  /**
   * Filter recommendations by criteria.
   */
  filterRecommendations(
    recommendations: CareerRecommendation[],
    filter: {
      minScore?: number;
      types?: RecommendationType[];
      minConfidence?: number;
    }
  ): CareerRecommendation[] {
    return recommendations.filter((rec) => {
      if (filter.minScore !== undefined && rec.score < filter.minScore) {
        return false;
      }
      if (filter.types !== undefined && !filter.types.includes(rec.recommendationType)) {
        return false;
      }
      if (filter.minConfidence !== undefined && rec.confidence.overall < filter.minConfidence) {
        return false;
      }
      return true;
    });
  }

  /**
   * Compare two recommendations.
   */
  compareRecommendations(
    recA: CareerRecommendation,
    recB: CareerRecommendation
  ) {
    const scoreDiff = recA.score - recB.score;
    const fitDiff = recA.fitScore - recB.fitScore;

    const whyABetter: string[] = [];
    const whyBBetter: string[] = [];

    if (recA.fitScore > recB.fitScore + 5) {
      whyABetter.push(`Better fit (${recA.fitScore}% vs ${recB.fitScore}%)`);
    } else if (recB.fitScore > recA.fitScore + 5) {
      whyBBetter.push(`Better fit (${recB.fitScore}% vs ${recA.fitScore}%)`);
    }

    if (recA.futureRelevanceScore > recB.futureRelevanceScore + 10) {
      whyABetter.push('More future-relevant');
    } else if (recB.futureRelevanceScore > recA.futureRelevanceScore + 10) {
      whyBBetter.push('More future-relevant');
    }

    if (recA.careerMobilityScore > recB.careerMobilityScore + 10) {
      whyABetter.push('Better career mobility');
    } else if (recB.careerMobilityScore > recA.careerMobilityScore + 10) {
      whyBBetter.push('Better career mobility');
    }

    if (recA.lifestyleAlignmentScore > recB.lifestyleAlignmentScore + 10) {
      whyABetter.push('Better lifestyle alignment');
    } else if (recB.lifestyleAlignmentScore > recA.lifestyleAlignmentScore + 10) {
      whyBBetter.push('Better lifestyle alignment');
    }

    return {
      scoreDifference: scoreDiff,
      fitDifference: fitDiff,
      whyABetter,
      whyBBetter,
    };
  }

  /**
   * Update weights.
   */
  setWeights(weights: Partial<RecommendationDimensions>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Get current weights.
   */
  getWeights(): RecommendationDimensions {
    return { ...this.weights };
  }
}

/**
 * Factory function for RecommendationRanker.
 */
export function createRecommendationRanker(
  weights?: Partial<RecommendationDimensions>
): RecommendationRanker {
  return new RecommendationRanker(weights);
}
