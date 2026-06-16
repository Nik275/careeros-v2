/**
 * CareerOS Decision Intelligence Engine - Confidence Engine
 *
 * Phase D.1: Decision Intelligence Engine
 *
 * Calculates decision confidence based on profile certainty,
 * career certainty, evidence certainty, and recommendation certainty.
 *
 * @module decision-confidence-engine
 * @version 2.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'decision'
 */

import type {
  DecisionConfidence,
  ConfidenceCalculationResult,
  CertaintyComponent,
  CertaintyFactor,
  DecisionIntelligenceConfig,
  ScoredDimension,
} from './decision-types';
import type { CareerFitResult, FitConfidence } from '@/career-fit/career-fit-types';
import type { GeneratedProfile, ComponentConfidence } from '@/profile/profile-types';
import type { CareerIntelligence, CareerEvidence } from '@/career-intelligence/career-types';
import { getConfidenceAuthority } from '@/intelligence/confidence';
import type { ConfidenceRequest } from '@/intelligence/confidence';

/**
 * Engine for calculating decision confidence.
 * @deprecated Use ConfidenceAuthority directly
 */
export class DecisionConfidenceEngine {
  /** Engine configuration */
  private config: DecisionIntelligenceConfig;

  /** Constitutional Confidence Authority */
  private authority = getConfidenceAuthority();

  /**
   * Creates a new DecisionConfidenceEngine.
   *
   * @param config - Configuration for the engine
   */
  constructor(config: DecisionIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Calculates comprehensive decision confidence.
   *
   * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'decision'
   */
  calculateDecisionConfidence(
    profile: GeneratedProfile,
    career: CareerIntelligence,
    fitResult: CareerFitResult,
    decisionDimensions: ScoredDimension[]
  ): ConfidenceCalculationResult {
    console.warn(
      '[DEPRECATED] DecisionConfidenceEngine.calculateDecisionConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "decision"'
    );

    const profileCertainty = this.calculateProfileCertainty(profile);
    const careerCertainty = this.calculateCareerCertainty(career);
    const evidenceCertainty = this.calculateEvidenceCertainty(
      fitResult.confidence,
      career.evidence
    );
    const recommendationCertainty = this.calculateRecommendationCertainty(
      fitResult,
      decisionDimensions
    );

    const overall = this.computeOverallConfidence(
      profileCertainty.score,
      careerCertainty.score,
      evidenceCertainty.score,
      recommendationCertainty.score
    );

    // Calculate constitutional confidence (0.0-1.0)
    const constitutionalConfidence = overall / 100;

    return {
      profileCertainty,
      careerCertainty,
      evidenceCertainty,
      recommendationCertainty,
      overall,
      constitutionalConfidence,
      calculatedAt: new Date(),
    } as ConfidenceCalculationResult;
  }

  /**
   * Calculates profile certainty based on assessment completeness.
   *
   * @param profile - Student profile
   * @returns Profile certainty component
   */
  private calculateProfileCertainty(profile: GeneratedProfile): CertaintyComponent {
    const factors: CertaintyFactor[] = [];

    // Assessment data completeness
    const assessmentCompleteness = this.calculateAssessmentCompleteness(profile.source);
    factors.push({
      name: 'Assessment Completeness',
      weight: 0.25,
      score: assessmentCompleteness,
      impact: assessmentCompleteness * 0.25,
    });

    // Confidence in archetype assignment
    const archetypeConfidence = profile.archetype.confidence.score;
    factors.push({
      name: 'Archetype Confidence',
      weight: 0.2,
      score: archetypeConfidence,
      impact: archetypeConfidence * 0.2,
    });

    // Strength identification confidence
    const strengthConfidence = this.calculateAggregateConfidence(
      profile.strengths.primary.map((s) => s.confidence.score)
    );
    factors.push({
      name: 'Strength Identification',
      weight: 0.2,
      score: strengthConfidence,
      impact: strengthConfidence * 0.2,
    });

    // Weakness identification confidence
    const weaknessConfidence = this.calculateAggregateConfidence(
      profile.weaknesses.map((w) => w.confidence.score)
    );
    factors.push({
      name: 'Weakness Identification',
      weight: 0.15,
      score: weaknessConfidence,
      impact: weaknessConfidence * 0.15,
    });

    // Insight confidence
    const insightConfidence = profile.insights.keyAdvantages.length > 0
      ? this.calculateAggregateConfidence(
          profile.insights.keyAdvantages.map((a) => a.confidence)
        )
      : 50;
    factors.push({
      name: 'Insight Confidence',
      weight: 0.2,
      score: insightConfidence,
      impact: insightConfidence * 0.2,
    });

    const score = this.computeWeightedScore(factors);

    return {
      score: Math.round(score),
      factors,
      confidence: this.scoreToConfidenceLevel(score),
    };
  }

  /**
   * Calculates career certainty based on intelligence quality.
   *
   * @param career - Career intelligence
   * @returns Career certainty component
   */
  private calculateCareerCertainty(career: CareerIntelligence): CertaintyComponent {
    const factors: CertaintyFactor[] = [];

    // Evidence confidence
    const evidenceConfidence = career.evidence.overallConfidence;
    factors.push({
      name: 'Evidence Confidence',
      weight: 0.3,
      score: evidenceConfidence,
      impact: evidenceConfidence * 0.3,
    });

    // Source count factor
    const sourceScore = Math.min(career.evidence.sourceCount * 10, 100);
    factors.push({
      name: 'Evidence Source Count',
      weight: 0.15,
      score: sourceScore,
      impact: sourceScore * 0.15,
    });

    // Evidence quality
    const qualityScore = career.evidence.evidenceQuality;
    factors.push({
      name: 'Evidence Quality',
      weight: 0.25,
      score: qualityScore,
      impact: qualityScore * 0.25,
    });

    // Data freshness
    const freshnessScore = career.evidence.dataFreshness;
    factors.push({
      name: 'Data Freshness',
      weight: 0.15,
      score: freshnessScore,
      impact: freshnessScore * 0.15,
    });

    // Dimension coverage (how many dimensions have scores)
    const dimensionCoverage = this.calculateDimensionCoverage(career);
    factors.push({
      name: 'Dimension Coverage',
      weight: 0.15,
      score: dimensionCoverage,
      impact: dimensionCoverage * 0.15,
    });

    const score = this.computeWeightedScore(factors);

    return {
      score: Math.round(score),
      factors,
      confidence: this.scoreToConfidenceLevel(score),
    };
  }

  /**
   * Calculates evidence certainty based on fit and career evidence.
   *
   * @param fitConfidence - Confidence from fit calculation
   * @param careerEvidence - Career evidence data
   * @returns Evidence certainty component
   */
  private calculateEvidenceCertainty(
    fitConfidence: FitConfidence,
    careerEvidence: CareerEvidence
  ): CertaintyComponent {
    const factors: CertaintyFactor[] = [];

    // Fit calculation confidence
    const calculationConfidence = fitConfidence.calculationConfidence;
    factors.push({
      name: 'Fit Calculation Confidence',
      weight: 0.3,
      score: calculationConfidence,
      impact: calculationConfidence * 0.3,
    });

    // Profile confidence component
    const profileConfidence = fitConfidence.profileConfidence;
    factors.push({
      name: 'Profile Data Confidence',
      weight: 0.25,
      score: profileConfidence,
      impact: profileConfidence * 0.25,
    });

    // Career confidence component
    const careerConfidence = fitConfidence.careerConfidence;
    factors.push({
      name: 'Career Data Confidence',
      weight: 0.25,
      score: careerConfidence,
      impact: careerConfidence * 0.25,
    });

    // Evidence quality from career
    const evidenceQuality = careerEvidence.evidenceQuality;
    factors.push({
      name: 'Underlying Evidence Quality',
      weight: 0.2,
      score: evidenceQuality,
      impact: evidenceQuality * 0.2,
    });

    const score = this.computeWeightedScore(factors);

    return {
      score: Math.round(score),
      factors,
      confidence: this.scoreToConfidenceLevel(score),
    };
  }

  /**
   * Calculates recommendation certainty.
   *
   * @param fitResult - Career fit result
   * @param decisionDimensions - Decision quality dimensions
   * @returns Recommendation certainty component
   */
  private calculateRecommendationCertainty(
    fitResult: CareerFitResult,
    decisionDimensions: ScoredDimension[]
  ): CertaintyComponent {
    const factors: CertaintyFactor[] = [];

    // Overall fit confidence
    const fitConfidence = fitResult.confidence.overall;
    factors.push({
      name: 'Overall Fit Confidence',
      weight: 0.35,
      score: fitConfidence,
      impact: fitConfidence * 0.35,
    });

    // Dimension confidence consistency
    const dimensionConfidences = decisionDimensions.map((d) => d.confidence);
    const consistencyScore = this.calculateConfidenceConsistency(dimensionConfidences);
    factors.push({
      name: 'Dimension Confidence Consistency',
      weight: 0.25,
      score: consistencyScore,
      impact: consistencyScore * 0.25,
    });

    // Average dimension confidence
    const avgDimensionConfidence =
      dimensionConfidences.length > 0
        ? dimensionConfidences.reduce((sum, c) => sum + c, 0) / dimensionConfidences.length
        : 50;
    factors.push({
      name: 'Average Dimension Confidence',
      weight: 0.25,
      score: avgDimensionConfidence,
      impact: avgDimensionConfidence * 0.25,
    });

    // Fit level certainty (clearer fits = higher confidence)
    const fitLevelScore = this.fitLevelToScore(fitResult.fitLevel);
    factors.push({
      name: 'Fit Level Certainty',
      weight: 0.15,
      score: fitLevelScore,
      impact: fitLevelScore * 0.15,
    });

    const score = this.computeWeightedScore(factors);

    return {
      score: Math.round(score),
      factors,
      confidence: this.scoreToConfidenceLevel(score),
    };
  }

  /**
   * Converts a confidence score to a confidence level.
   *
   * @param score - Score 0-100
   * @returns Confidence level 0-100
   */
  private scoreToConfidenceLevel(score: number): number {
    // Higher scores get slightly higher confidence levels
    // This reflects certainty in our certainty calculation
    if (score >= 80) return Math.min(score + 5, 100);
    if (score >= 60) return score;
    if (score >= 40) return Math.max(score - 5, 0);
    return Math.max(score - 10, 0);
  }

  /**
   * Calculates assessment completeness.
   *
   * @param source - Assessment source data
   * @returns Completeness score 0-100
   */
  private calculateAssessmentCompleteness(source: GeneratedProfile['source']): number {
    const expectedDimensions = 12; // Based on typical assessment dimensions
    const actualDimensions = source.dimensionScores instanceof Map
      ? source.dimensionScores.size
      : Object.keys(source.dimensionScores).length;
    const coverageScore = Math.min((actualDimensions / expectedDimensions) * 100, 100);

    // Weight coverage with overall confidence
    return Math.round((coverageScore * 0.6) + (source.confidence.score * 0.4));
  }

  /**
   * Calculates aggregate confidence from multiple scores.
   *
   * @param scores - Array of confidence scores
   * @returns Aggregate confidence 0-100
   */
  private calculateAggregateConfidence(scores: number[]): number {
    if (scores.length === 0) return 50;

    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const min = Math.min(...scores);

    // Weight average toward minimum to be conservative
    return Math.round(avg * 0.7 + min * 0.3);
  }

  /**
   * Calculates dimension coverage for a career.
   *
   * @param career - Career intelligence
   * @returns Coverage score 0-100
   */
  private calculateDimensionCoverage(career: CareerIntelligence): number {
    const cognitiveCount = Object.keys(career.cognitiveDemands).length;
    const motivationalCount = Object.keys(career.motivationalDemands).length;
    const lifestyleCount = Object.keys(career.lifestyleCharacteristics).length;
    const environmentCount = Object.keys(career.workEnvironment).length;
    const riskCount = Object.keys(career.careerRisks).length;
    const advantageCount = Object.keys(career.careerAdvantages).length;

    const totalDimensions = 6; // Expected number of dimension groups
    const totalFields =
      cognitiveCount +
      motivationalCount +
      lifestyleCount +
      environmentCount +
      riskCount +
      advantageCount;

    const expectedFields = 24; // Rough estimate of expected scored fields
    return Math.min((totalFields / expectedFields) * 100, 100);
  }

  /**
   * Calculates confidence consistency across dimensions.
   *
   * @param confidences - Array of confidence values
   * @returns Consistency score 0-100
   */
  private calculateConfidenceConsistency(confidences: number[]): number {
    if (confidences.length < 2) return 100;

    const mean = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const variance =
      confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // Max reasonable stdDev is ~25, so normalize
    return Math.max(100 - stdDev * 4, 0);
  }

  /**
   * Converts fit level to a certainty score.
   *
   * @param fitLevel - Fit level category
   * @returns Certainty score 0-100
   */
  private fitLevelToScore(fitLevel: string): number {
    const scores: Record<string, number> = {
      EXCELLENT: 90,
      GOOD: 85,
      MODERATE: 70,
      POOR: 60,
      MISFIT: 50,
    };
    return scores[fitLevel] ?? 50;
  }

  /**
   * Computes overall confidence from components.
   *
   * @param profileCertainty - Profile certainty score
   * @param careerCertainty - Career certainty score
   * @param evidenceCertainty - Evidence certainty score
   * @param recommendationCertainty - Recommendation certainty score
   * @returns Overall confidence 0-100
   */
  private computeOverallConfidence(
    profileCertainty: number,
    careerCertainty: number,
    evidenceCertainty: number,
    recommendationCertainty: number
  ): number {
    // Weight the components
    const weights = {
      profile: 0.25,
      career: 0.25,
      evidence: 0.25,
      recommendation: 0.25,
    };

    const weightedSum =
      profileCertainty * weights.profile +
      careerCertainty * weights.career +
      evidenceCertainty * weights.evidence +
      recommendationCertainty * weights.recommendation;

    return Math.round(weightedSum);
  }

  /**
   * Computes weighted score from factors.
   *
   * @param factors - Certainty factors
   * @returns Weighted score 0-100
   */
  private computeWeightedScore(factors: CertaintyFactor[]): number {
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight === 0) return 50;

    const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
    return weightedSum / totalWeight;
  }

  /**
   * Creates a simplified DecisionConfidence object.
   *
   * @param result - Full confidence calculation result
   * @returns Simplified decision confidence
   */
  static toDecisionConfidence(result: ConfidenceCalculationResult): DecisionConfidence {
    return {
      profileCertainty: result.profileCertainty.score,
      careerCertainty: result.careerCertainty.score,
      evidenceCertainty: result.evidenceCertainty.score,
      recommendationCertainty: result.recommendationCertainty.score,
      overall: result.overall,
    };
  }
}

/**
 * Creates a default decision confidence engine.
 *
 * @param config - Partial configuration
 * @returns Configured DecisionConfidenceEngine
 */
export function createDecisionConfidenceEngine(
  config?: Partial<DecisionIntelligenceConfig>
): DecisionConfidenceEngine {
  const fullConfig: DecisionIntelligenceConfig = {
    minConfidenceThreshold: 50,
    defaultTimeHorizon: 5,
    enableTradeoffAnalysis: true,
    enableRiskAnalysis: true,
    enableOpportunityAnalysis: true,
    fitQualityWeight: 0.25,
    lifestyleQualityWeight: 0.2,
    valueAlignmentWeight: 0.2,
    futurePotentialWeight: 0.2,
    flexibilityWeight: 0.15,
    ...config,
  };

  return new DecisionConfidenceEngine(fullConfig);
}
