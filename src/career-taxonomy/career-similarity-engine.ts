/**
 * CareerOS Career Taxonomy & Relationship System - Similarity Engine
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Calculates similarity between careers across multiple dimensions.
 *
 * @module career-similarity-engine
 * @version 1.0.0
 */

import type {
  CareerNodeId,
  CareerSimilarity,
  SimilarityDimensions,
  SimilarityWeights,
  DEFAULT_SIMILARITY_WEIGHTS,
} from './career-taxonomy-types';
import type { CareerIntelligence } from '../career-intelligence/career-types';

/**
 * Calculates similarity between careers using multiple dimensions.
 *
 * Provides skill, cognitive, lifestyle, motivation, and work environment
 * similarity calculations with weighted aggregation.
 */
export class CareerSimilarityEngine {
  private weights: SimilarityWeights;

  constructor(weights?: Partial<SimilarityWeights>) {
    this.weights = { ...DEFAULT_SIMILARITY_WEIGHTS, ...weights };
  }

  /**
   * Calculate comprehensive similarity between two careers.
   */
  calculateSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): CareerSimilarity {
    const dimensions = this.calculateSimilarityDimensions(careerA, careerB);

    // Calculate weighted overall score
    const overallScore = Math.round(
      dimensions.skillSimilarity * this.weights.skill +
        dimensions.cognitiveSimilarity * this.weights.cognitive +
        dimensions.lifestyleSimilarity * this.weights.lifestyle +
        dimensions.motivationSimilarity * this.weights.motivation +
        dimensions.workEnvironmentSimilarity * this.weights.workEnvironment
    );

    // Identify matching and differentiating factors
    const matchingFactors = this.identifyMatchingFactors(careerA, careerB);
    const differentiatingFactors = this.identifyDifferentiatingFactors(careerA, careerB);

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(careerA, careerB);

    return {
      careerA: careerA.careerId,
      careerB: careerB.careerId,
      overallScore: Math.min(100, overallScore),
      dimensions,
      matchingFactors,
      differentiatingFactors,
      confidence,
    };
  }

  /**
   * Calculate similarity across all dimensions.
   */
  private calculateSimilarityDimensions(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): SimilarityDimensions {
    return {
      skillSimilarity: this.calculateSkillSimilarity(careerA, careerB),
      cognitiveSimilarity: this.calculateCognitiveSimilarity(careerA, careerB),
      lifestyleSimilarity: this.calculateLifestyleSimilarity(careerA, careerB),
      motivationSimilarity: this.calculateMotivationSimilarity(careerA, careerB),
      workEnvironmentSimilarity: this.calculateWorkEnvironmentSimilarity(careerA, careerB),
    };
  }

  /**
   * Calculate skill-based similarity.
   */
  private calculateSkillSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): number {
    // Compare cognitive demands as proxy for skills
    const aCognitive = careerA.cognitiveDemands;
    const bCognitive = careerB.cognitiveDemands;

    const similarities = [
      this.scoreSimilarity(aCognitive.analyticalDemand.score, bCognitive.analyticalDemand.score),
      this.scoreSimilarity(aCognitive.creativeDemand.score, bCognitive.creativeDemand.score),
      this.scoreSimilarity(aCognitive.systematicDemand.score, bCognitive.systematicDemand.score),
      this.scoreSimilarity(aCognitive.verbalDemand.score, bCognitive.verbalDemand.score),
      this.scoreSimilarity(aCognitive.spatialDemand.score, bCognitive.spatialDemand.score),
      this.scoreSimilarity(aCognitive.quantitativeDemand.score, bCognitive.quantitativeDemand.score),
    ];

    return Math.round(similarities.reduce((a, b) => a + b, 0) / similarities.length);
  }

  /**
   * Calculate cognitive demand similarity.
   */
  private calculateCognitiveSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): number {
    return this.calculateSkillSimilarity(careerA, careerB);
  }

  /**
   * Calculate lifestyle similarity.
   */
  private calculateLifestyleSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): number {
    const aLifestyle = careerA.lifestyleCharacteristics;
    const bLifestyle = careerB.lifestyleCharacteristics;

    const similarities = [
      this.scoreSimilarity(aLifestyle.incomePotential.score, bLifestyle.incomePotential.score),
      this.scoreSimilarity(aLifestyle.workLifeBalance.score, bLifestyle.workLifeBalance.score),
      this.scoreSimilarity(aLifestyle.locationFlexibility.score, bLifestyle.locationFlexibility.score),
      this.scoreSimilarity(aLifestyle.travelRequirement.score, bLifestyle.travelRequirement.score),
      this.scoreSimilarity(aLifestyle.stabilityLevel.score, bLifestyle.stabilityLevel.score),
    ];

    return Math.round(similarities.reduce((a, b) => a + b, 0) / similarities.length);
  }

  /**
   * Calculate motivation similarity.
   */
  private calculateMotivationSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): number {
    const aMotivation = careerA.motivationalDemands;
    const bMotivation = careerB.motivationalDemands;

    const similarities = [
      this.scoreSimilarity(aMotivation.achievementDemand.score, bMotivation.achievementDemand.score),
      this.scoreSimilarity(aMotivation.masteryDemand.score, bMotivation.masteryDemand.score),
      this.scoreSimilarity(aMotivation.autonomyDemand.score, bMotivation.autonomyDemand.score),
      this.scoreSimilarity(aMotivation.impactDemand.score, bMotivation.impactDemand.score),
      this.scoreSimilarity(aMotivation.recognitionDemand.score, bMotivation.recognitionDemand.score),
      this.scoreSimilarity(aMotivation.securityDemand.score, bMotivation.securityDemand.score),
    ];

    return Math.round(similarities.reduce((a, b) => a + b, 0) / similarities.length);
  }

  /**
   * Calculate work environment similarity.
   */
  private calculateWorkEnvironmentSimilarity(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): number {
    const aWorkEnv = careerA.workEnvironment;
    const bWorkEnv = careerB.workEnvironment;

    const similarities = [
      this.scoreSimilarity(aWorkEnv.peopleIntensity.score, bWorkEnv.peopleIntensity.score),
      this.scoreSimilarity(aWorkEnv.independenceLevel.score, bWorkEnv.independenceLevel.score),
      this.scoreSimilarity(aWorkEnv.leadershipOpportunity.score, bWorkEnv.leadershipOpportunity.score),
      this.scoreSimilarity(aWorkEnv.researchIntensity.score, bWorkEnv.researchIntensity.score),
      this.scoreSimilarity(aWorkEnv.executionIntensity.score, bWorkEnv.executionIntensity.score),
    ];

    return Math.round(similarities.reduce((a, b) => a + b, 0) / similarities.length);
  }

  /**
   * Calculate similarity between two scores (0-100).
   */
  private scoreSimilarity(scoreA: number, scoreB: number): number {
    const difference = Math.abs(scoreA - scoreB);
    return Math.max(0, 100 - difference);
  }

  /**
   * Identify matching factors between careers.
   */
  private identifyMatchingFactors(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): string[] {
    const factors: string[] = [];

    // Check cognitive matches
    if (this.scoresMatch(careerA.cognitiveDemands.analyticalDemand.score, careerB.cognitiveDemands.analyticalDemand.score)) {
      factors.push('analytical thinking requirements');
    }
    if (this.scoresMatch(careerA.cognitiveDemands.creativeDemand.score, careerB.cognitiveDemands.creativeDemand.score)) {
      factors.push('creative problem-solving demands');
    }

    // Check motivation matches
    if (this.scoresMatch(careerA.motivationalDemands.achievementDemand.score, careerB.motivationalDemands.achievementDemand.score)) {
      factors.push('achievement drive requirements');
    }
    if (this.scoresMatch(careerA.motivationalDemands.impactDemand.score, careerB.motivationalDemands.impactDemand.score)) {
      factors.push('impact orientation');
    }

    // Check lifestyle matches
    if (this.scoresMatch(careerA.lifestyleCharacteristics.incomePotential.score, careerB.lifestyleCharacteristics.incomePotential.score)) {
      factors.push('income potential');
    }
    if (this.scoresMatch(careerA.lifestyleCharacteristics.workLifeBalance.score, careerB.lifestyleCharacteristics.workLifeBalance.score)) {
      factors.push('work-life balance profile');
    }

    // Check work environment matches
    if (this.scoresMatch(careerA.workEnvironment.peopleIntensity.score, careerB.workEnvironment.peopleIntensity.score)) {
      factors.push('people interaction levels');
    }
    if (this.scoresMatch(careerA.workEnvironment.independenceLevel.score, careerB.workEnvironment.independenceLevel.score)) {
      factors.push('independence requirements');
    }

    return factors;
  }

  /**
   * Identify differentiating factors between careers.
   */
  private identifyDifferentiatingFactors(
    careerA: CareerIntelligence,
    careerB: CareerIntelligence
  ): string[] {
    const factors: string[] = [];

    // Check cognitive differences
    if (this.scoresDiffer(careerA.cognitiveDemands.analyticalDemand.score, careerB.cognitiveDemands.analyticalDemand.score)) {
      factors.push('analytical demands differ');
    }
    if (this.scoresDiffer(careerA.cognitiveDemands.creativeDemand.score, careerB.cognitiveDemands.creativeDemand.score)) {
      factors.push('creative demands differ');
    }

    // Check risk differences
    if (this.scoresDiffer(careerA.careerRisks.automationRisk.score, careerB.careerRisks.automationRisk.score)) {
      factors.push('automation risk levels differ');
    }

    // Check advantage differences
    if (this.scoresDiffer(careerA.careerAdvantages.futureRelevance.score, careerB.careerAdvantages.futureRelevance.score)) {
      factors.push('future relevance differs');
    }

    return factors;
  }

  /**
   * Check if scores match (within threshold).
   */
  private scoresMatch(scoreA: number, scoreB: number, threshold: number = 15): boolean {
    return Math.abs(scoreA - scoreB) <= threshold;
  }

  /**
   * Check if scores differ (beyond threshold).
   */
  private scoresDiffer(scoreA: number, scoreB: number, threshold: number = 25): boolean {
    return Math.abs(scoreA - scoreB) >= threshold;
  }

  /**
   * Calculate confidence in similarity assessment.
   */
  private calculateConfidence(careerA: CareerIntelligence, careerB: CareerIntelligence): number {
    const avgConfidenceA = this.averageDimensionConfidence(careerA);
    const avgConfidenceB = this.averageDimensionConfidence(careerB);
    return Math.round((avgConfidenceA + avgConfidenceB) / 2);
  }

  /**
   * Calculate average confidence across all dimensions.
   */
  private averageDimensionConfidence(career: CareerIntelligence): number {
    const dimensions = [
      ...Object.values(career.cognitiveDemands),
      ...Object.values(career.motivationalDemands),
      ...Object.values(career.lifestyleCharacteristics),
      ...Object.values(career.workEnvironment),
    ];

    const sum = dimensions.reduce((acc, dim) => acc + dim.confidence, 0);
    return dimensions.length > 0 ? Math.round(sum / dimensions.length) : 50;
  }

  /**
   * Find similar careers from a list.
   */
  findSimilarCareers(
    targetCareer: CareerIntelligence,
    candidates: CareerIntelligence[],
    threshold: number = 60
  ): Array<{ career: CareerIntelligence; similarity: CareerSimilarity }> {
    const results: Array<{ career: CareerIntelligence; similarity: CareerSimilarity }> = [];

    for (const candidate of candidates) {
      if (candidate.careerId === targetCareer.careerId) continue;

      const similarity = this.calculateSimilarity(targetCareer, candidate);
      if (similarity.overallScore >= threshold) {
        results.push({ career: candidate, similarity });
      }
    }

    return results.sort((a, b) => b.similarity.overallScore - a.similarity.overallScore);
  }

  /**
   * Update similarity weights.
   */
  setWeights(weights: Partial<SimilarityWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Get current weights.
   */
  getWeights(): SimilarityWeights {
    return { ...this.weights };
  }
}

/**
 * Factory function for CareerSimilarityEngine.
 */
export function createCareerSimilarityEngine(
  weights?: Partial<SimilarityWeights>
): CareerSimilarityEngine {
  return new CareerSimilarityEngine(weights);
}
