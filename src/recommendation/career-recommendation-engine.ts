/**
 * CareerOS Career Recommendation Engine - Main Orchestrator
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Generates personalized career recommendations based on fit,
 * future outlook, optionality, and market opportunity.
 *
 * @module career-recommendation-engine
 * @version 1.0.0
 */

import type { StudentLifeProfile } from '../types/student-life-profile';
import type { CareerIntelligence, CareerId } from '../career-intelligence/career-types';
import type { CareerFitResult } from '../career-fit/career-fit-types';
import type {
  CareerRecommendation,
  RecommendationSet,
  RecommendationConfig,
  RankingCriteria,
  RecommendationFilter,
  CareerOption,
} from './recommendation-types';
import { DEFAULT_RECOMMENDATION_CONFIG } from './recommendation-types';

import { RecommendationRanker } from './recommendation-ranker';
import { RecommendationExplainer } from './recommendation-explainer';
import { RecommendationConfidenceEngine } from './recommendation-confidence-engine';

/**
 * Main orchestrator for Career Recommendation Engine.
 *
 * Generates comprehensive career recommendations including top picks,
 * alternatives, and stretch options with full explanations.
 */
export class CareerRecommendationEngine {
  private ranker: RecommendationRanker;
  private explainer: RecommendationExplainer;
  private confidenceEngine: RecommendationConfidenceEngine;
  private config: RecommendationConfig;
  private careerIntelligence: Map<CareerId, CareerIntelligence> = new Map();

  constructor(config?: Partial<RecommendationConfig>) {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };
    this.ranker = new RecommendationRanker(this.config.weights);
    this.explainer = new RecommendationExplainer();
    this.confidenceEngine = new RecommendationConfidenceEngine();
  }

  /**
   * Register career intelligence for recommendations.
   */
  registerCareer(career: CareerIntelligence): void {
    this.careerIntelligence.set(career.careerId, career);
  }

  /**
   * Register multiple careers.
   */
  registerCareers(careers: CareerIntelligence[]): void {
    for (const career of careers) {
      this.careerIntelligence.set(career.careerId, career);
    }
  }

  /**
   * Generate complete recommendation set for a student.
   */
  generateRecommendations(
    profile: StudentLifeProfile,
    fitResults: CareerFitResult[],
    profileId: string,
    criteria?: RankingCriteria
  ): RecommendationSet {
    // Filter out low-confidence and low-fit results
    const validFits = this.filterValidFits(fitResults);

    // Step 1: Rank careers
    let recommendations = this.ranker.rankCareers(validFits, this.careerIntelligence, profileId);

    // Step 2: Apply ranking criteria if provided
    if (criteria) {
      recommendations = this.ranker.applyCriteria(recommendations, criteria);
    }

    // Step 3: Generate explanations and calculate confidence
    recommendations = this.enrichRecommendations(recommendations, profile);

    // Step 4: Filter by minimum confidence
    recommendations = recommendations.filter(
      (rec) => rec.confidence.overall >= this.config.minConfidenceThreshold
    );

    // Step 5: Build recommendation sets
    const topRecommendations = this.ranker.getTopRecommendations(
      recommendations,
      this.config.topRecommendationCount
    );

    const alternativeRecommendations = this.ranker.getAlternativeRecommendations(
      recommendations,
      this.config.alternativeRecommendationCount
    );

    const stretchRecommendations = this.ranker.getStretchRecommendations(
      recommendations,
      this.config.stretchRecommendationCount
    );

    // Step 6: Add alternatives and related careers
    const enrichedRecommendations = this.addAlternativesAndRelated(recommendations);

    return {
      studentProfileId: profileId,
      topRecommendations,
      alternativeRecommendations,
      stretchRecommendations,
      allRecommendations: enrichedRecommendations,
      metadata: {
        totalEvaluated: fitResults.length,
        totalRecommended: enrichedRecommendations.length,
        generatedAt: new Date(),
        averageScore: this.calculateAverageScore(enrichedRecommendations),
        averageConfidence: this.confidenceEngine.getAverageConfidence(enrichedRecommendations),
      },
    };
  }

  /**
   * Filter valid fits based on configuration.
   */
  private filterValidFits(fitResults: CareerFitResult[]): CareerFitResult[] {
    return fitResults.filter((fit) => {
      // Minimum fit score threshold
      if (fit.overallFitScore < this.config.minFitScoreThreshold) {
        return false;
      }

      // Minimum confidence threshold
      if (fit.confidence.overall < this.config.minConfidenceThreshold) {
        return false;
      }

      // Must have valid career data
      if (!this.careerIntelligence.has(fit.careerId)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Enrich recommendations with explanations and confidence.
   */
  private enrichRecommendations(
    recommendations: CareerRecommendation[],
    profile: StudentLifeProfile
  ): CareerRecommendation[] {
    return recommendations.map((rec) => {
      const career = this.careerIntelligence.get(rec.careerId)!;

      // Generate explanations
      let enriched = this.explainer.explainRecommendation(rec, recommendations, career);

      // Calculate confidence
      enriched = this.confidenceEngine.calculateConfidence(enriched, profile, career);

      return enriched;
    });
  }

  /**
   * Add alternatives and related careers to recommendations.
   */
  private addAlternativesAndRelated(
    recommendations: CareerRecommendation[]
  ): CareerRecommendation[] {
    return recommendations.map((rec) => {
      const alternatives = this.findAlternatives(rec, recommendations);
      const relatedCareers = this.findRelatedCareers(rec);

      return {
        ...rec,
        alternatives,
        relatedCareers,
      };
    });
  }

  /**
   * Find alternative recommendations for a career.
   */
  private findAlternatives(
    recommendation: CareerRecommendation,
    allRecommendations: CareerRecommendation[]
  ) {
    const career = this.careerIntelligence.get(recommendation.careerId)!;
    const alternatives: CareerRecommendation['alternatives'] = [];

    // Find similar careers in the recommendation set
    const similarFits = allRecommendations.filter(
      (r) =>
        r.careerId !== recommendation.careerId &&
        Math.abs(r.score - recommendation.score) <= 15
    );

    for (const similar of similarFits.slice(0, 3)) {
      const similarCareer = this.careerIntelligence.get(similar.careerId)!;

      alternatives.push({
        careerId: similar.careerId,
        careerTitle: similar.careerTitle,
        reason: this.generateAlternativeReason(recommendation, similar),
        similarityScore: similar.fitResult.overallFitScore,
        keyDifferences: this.identifyKeyDifferences(career, similarCareer),
        whenToConsider: this.generateWhenToConsider(similar),
      });
    }

    return alternatives;
  }

  /**
   * Find related careers.
   */
  private findRelatedCareers(recommendation: CareerRecommendation) {
    const related: CareerRecommendation['relatedCareers'] = [];
    const career = this.careerIntelligence.get(recommendation.careerId)!;

    // Add based on category similarity
    for (const [id, otherCareer] of this.careerIntelligence) {
      if (id === recommendation.careerId) continue;

      if (otherCareer.metadata.category === career.metadata.category && related.length < 3) {
        related.push({
          careerId: id,
          relationship: 'SIMILAR',
          strength: 70,
          reason: 'Same career category',
        });
      }
    }

    return related;
  }

  /**
   * Generate reason for alternative.
   */
  private generateAlternativeReason(
    primary: CareerRecommendation,
    alternative: CareerRecommendation
  ): string {
    if (alternative.fitScore > primary.fitScore) {
      return 'Better fit score than primary recommendation';
    }
    if (alternative.futureRelevanceScore > primary.futureRelevanceScore + 10) {
      return 'Better future outlook';
    }
    if (alternative.lifestyleAlignmentScore > primary.lifestyleAlignmentScore + 10) {
      return 'Better lifestyle alignment';
    }
    return 'Similar overall profile with different tradeoffs';
  }

  /**
   * Identify key differences between careers.
   */
  private identifyKeyDifferences(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): string[] {
    const differences: string[] = [];

    const incomeDiff = Math.abs(
      careerA.lifestyleCharacteristics.incomePotential.score -
      careerB.lifestyleCharacteristics.incomePotential.score
    );
    if (incomeDiff > 15) {
      differences.push('Income potential');
    }

    const balanceDiff = Math.abs(
      careerA.lifestyleCharacteristics.workLifeBalance.score -
      careerB.lifestyleCharacteristics.workLifeBalance.score
    );
    if (balanceDiff > 15) {
      differences.push('Work-life balance');
    }

    const riskDiff = Math.abs(
      careerA.careerRisks.automationRisk.score - careerB.careerRisks.automationRisk.score
    );
    if (riskDiff > 15) {
      differences.push('Automation risk');
    }

    return differences;
  }

  /**
   * Generate when to consider text.
   */
  private generateWhenToConsider(alternative: CareerRecommendation): string {
    switch (alternative.recommendationType) {
      case 'STRONG_MATCH':
        return 'When you want the best overall fit';
      case 'GOOD_MATCH':
        return 'When you want a solid option with fewer tradeoffs';
      case 'POTENTIAL_MATCH':
        return 'When you are open to developing specific areas';
      case 'STRETCH_MATCH':
        return 'When you are willing to take on additional challenges';
      default:
        return 'Consider if primary recommendation does not appeal';
    }
  }

  /**
   * Get recommendations by type.
   */
  getRecommendationsByType(
    recommendations: CareerRecommendation[],
    type: CareerRecommendation['recommendationType']
  ): CareerRecommendation[] {
    return recommendations.filter((rec) => rec.recommendationType === type);
  }

  /**
   * Filter recommendations.
   */
  filterRecommendations(
    recommendations: CareerRecommendation[],
    filter: RecommendationFilter
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
      if (filter.maxConcerns !== undefined) {
        const highConcerns = rec.fitResult.concerns.filter((c) => c.severity === 'HIGH').length;
        if (highConcerns > filter.maxConcerns) {
          return false;
        }
      }
      if (filter.requireFitLevel !== undefined && rec.fitResult.fitLevel !== filter.requireFitLevel) {
        return false;
      }
      return true;
    });
  }

  /**
   * Convert recommendations to career options.
   */
  toCareerOptions(recommendationSet: RecommendationSet): CareerOption[] {
    const options: CareerOption[] = [];

    // Primary options (top recommendations)
    for (const rec of recommendationSet.topRecommendations.slice(0, 3)) {
      options.push({
        careerId: rec.careerId,
        optionType: 'PRIMARY',
        score: rec.score,
        rationale: rec.explanation.fitSummary,
        tradeoffs: rec.explanation.majorConcerns,
        nextSteps: ['Research career path', 'Conduct informational interviews', 'Explore educational requirements'],
      });
    }

    // Alternative options
    for (const rec of recommendationSet.alternativeRecommendations.slice(0, 2)) {
      options.push({
        careerId: rec.careerId,
        optionType: 'ALTERNATIVE',
        score: rec.score,
        rationale: rec.explanation.whyRecommended[0] ?? 'Alternative path',
        tradeoffs: rec.explanation.majorConcerns,
        nextSteps: ['Compare with primary recommendations', 'Evaluate tradeoffs'],
      });
    }

    // Backup options
    for (const rec of recommendationSet.alternativeRecommendations.slice(2, 3)) {
      options.push({
        careerId: rec.careerId,
        optionType: 'BACKUP',
        score: rec.score,
        rationale: 'Backup option if primary choices do not work out',
        tradeoffs: rec.explanation.majorConcerns,
        nextSteps: ['Keep as alternative', 'Monitor for fit changes'],
      });
    }

    // Stretch options
    for (const rec of recommendationSet.stretchRecommendations.slice(0, 2)) {
      options.push({
        careerId: rec.careerId,
        optionType: 'STRETCH',
        score: rec.score,
        rationale: 'Stretch goal requiring additional development',
        tradeoffs: rec.explanation.majorConcerns,
        nextSteps: ['Identify skill gaps', 'Create development plan', 'Set long-term goal'],
      });
    }

    return options;
  }

  /**
   * Get recommendation statistics.
   */
  getStatistics(recommendations: CareerRecommendation[]) {
    if (recommendations.length === 0) {
      return {
        total: 0,
        typeDistribution: {},
        averageScore: 0,
        averageConfidence: 0,
      };
    }

    const typeDistribution: Record<string, number> = {};
    for (const rec of recommendations) {
      typeDistribution[rec.recommendationType] = (typeDistribution[rec.recommendationType] ?? 0) + 1;
    }

    return {
      total: recommendations.length,
      typeDistribution,
      averageScore: Math.round(
        recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length
      ),
      averageConfidence: this.confidenceEngine.getAverageConfidence(recommendations),
    };
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<RecommendationConfig>): void {
    this.config = { ...this.config, ...config };
    this.ranker.setWeights(this.config.weights);
  }

  /**
   * Get current configuration.
   */
  getConfig(): RecommendationConfig {
    return { ...this.config };
  }

  /**
   * Calculate average score.
   */
  private calculateAverageScore(recommendations: CareerRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    return Math.round(
      recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length
    );
  }
}

/**
 * Factory function for CareerRecommendationEngine.
 */
export function createCareerRecommendationEngine(
  config?: Partial<RecommendationConfig>
): CareerRecommendationEngine {
  return new CareerRecommendationEngine(config);
}

// Re-export all engines and types
export * from './recommendation-types';
export { RecommendationRanker, createRecommendationRanker } from './recommendation-ranker';
export { RecommendationExplainer, createRecommendationExplainer } from './recommendation-explainer';
export { RecommendationConfidenceEngine, createRecommendationConfidenceEngine } from './recommendation-confidence-engine';
