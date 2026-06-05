/**
 * Journey Similarity Engine
 * 
 * Main orchestration engine for Phase 8.2 Journey Similarity.
 * Coordinates similarity calculation, matching, and explanation generation.
 * 
 * Answers: "Who started in a situation similar to mine?"
 * 
 * @module JourneySimilarityEngine
 */

import {
  CareerJourney,
  JourneyId,
} from '../career-journey-types';

import {
  SimilarityQuery,
  SimilarityWeights,
  SimilarityEngineConfig,
  JourneySimilarityResult,
  SimilarityAnalysis,
  SimilarityExplanation,
  SimilarityLevel,
  RelevanceLevel,
  SimilarityResultId,
  StudentProfileSnapshot,
  ArchetypeProfileSnapshot,
  MotivationProfileSnapshot,
  ConstraintProfileSnapshot,
  DecisionContextSnapshot,
  CalculateSimilarityInput,
  CalculateSimilarityOutput,
  BatchSimilarityInput,
  BatchSimilarityOutput,
  SimilaritySummary,
  ScoreDistribution,
  DEFAULT_SIMILARITY_WEIGHTS,
  DEFAULT_SIMILARITY_CONFIG,
} from './journey-similarity-types';

import { SimilarityCalculator } from './similarity-calculator';
import { JourneyMatcher, JourneyRepository, DiversityOptions } from './journey-matcher';
import { SimilarityExplanationEngine } from './similarity-explanation-engine';

/**
 * Configuration options for Journey Similarity Engine
 */
export interface JourneySimilarityEngineConfig {
  weights: SimilarityWeights;
  engineConfig: SimilarityEngineConfig;
  enableExplanations: boolean;
  enableDiversity: boolean;
  cacheResults: boolean;
  maxCacheSize: number;
}

/**
 * Default configuration
 */
export const DEFAULT_ENGINE_CONFIG: JourneySimilarityEngineConfig = {
  weights: DEFAULT_SIMILARITY_WEIGHTS,
  engineConfig: DEFAULT_SIMILARITY_CONFIG,
  enableExplanations: true,
  enableDiversity: true,
  cacheResults: true,
  maxCacheSize: 1000,
};

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Journey Similarity Engine
 * 
 * The main entry point for finding similar career journeys.
 * Determines which career journeys are most relevant to a student.
 */
export class JourneySimilarityEngine {
  private calculator: SimilarityCalculator;
  private matcher: JourneyMatcher;
  private explanationEngine: SimilarityExplanationEngine;
  private config: JourneySimilarityEngineConfig;
  private resultCache: Map<string, JourneySimilarityResult[]>;

  constructor(
    config: Partial<JourneySimilarityEngineConfig> = {}
  ) {
    this.config = { ...DEFAULT_ENGINE_CONFIG, ...config };
    this.calculator = new SimilarityCalculator(this.config.weights);
    this.matcher = new JourneyMatcher(this.calculator, this.config.engineConfig);
    this.explanationEngine = new SimilarityExplanationEngine();
    this.resultCache = new Map();
  }

  // ============================================================================
  // CORE API
  // ============================================================================

  /**
   * Find similar journeys for a student profile
   * 
   * Primary entry point. Given a student's profile, finds the most
   * relevant career journeys from the repository.
   * 
   * @param query - Student profile and matching criteria
   * @param journeyRepository - Repository of career journeys
   * @returns Ranked list of similar journeys with scores
   */
  async findSimilarJourneys(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository
  ): Promise<JourneySimilarityResult[]> {
    // Check cache
    const cacheKey = this.generateCacheKey(query);
    if (this.config.cacheResults && this.resultCache.has(cacheKey)) {
      return this.resultCache.get(cacheKey)!;
    }

    // Validate query
    const validation = this.validateQuery(query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }

    // Find matches
    const results = await this.matcher.findMatches(query, journeyRepository);

    // Apply diversity if enabled
    let finalResults = results;
    if (this.config.enableDiversity && query.maxResults && query.maxResults > 3) {
      finalResults = await this.matcher.findDiverseMatches(
        query,
        journeyRepository,
        {
          maxResults: query.maxResults,
          diversifyByArchetype: true,
          diversifyByIndustry: true,
          diversifyByOutcome: true,
          minSimilarityThreshold: query.minScore || 0.3,
        }
      );
    }

    // Cache results
    if (this.config.cacheResults) {
      this.cacheResults(cacheKey, finalResults);
    }

    return finalResults;
  }

  /**
   * Find the single most similar journey
   */
  async findMostSimilarJourney(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository
  ): Promise<JourneySimilarityResult | null> {
    const results = await this.findSimilarJourneys(
      { ...query, maxResults: 1 },
      journeyRepository
    );
    return results[0] || null;
  }

  /**
   * Calculate similarity for a specific journey
   * 
   * Use when you want to know how similar a particular journey is
   * to a student's profile.
   */
  calculateSimilarity(
    input: CalculateSimilarityInput
  ): CalculateSimilarityOutput {
    const startTime = Date.now();

    // Calculate dimension scores
    const dimensionScores = this.calculator.calculateAllDimensions(
      input.studentProfile,
      input.journey,
      undefined, // archetype - could be passed
      undefined, // motivation - could be passed
      undefined, // constraints - could be passed
      undefined  // decision context - could be passed
    );

    // Calculate overall score
    const similarityScore = this.calculator.calculateOverallScore(dimensionScores);

    // Determine levels
    const similarityLevel = this.scoreToSimilarityLevel(similarityScore);
    const relevanceLevel = this.scoreToRelevanceLevel(similarityScore);

    // Calculate confidence
    const confidence = this.calculateConfidence(dimensionScores, input.journey);

    // Generate result
    const result: JourneySimilarityResult = {
      id: this.generateResultId(),
      journeyId: input.journey.id,
      journey: input.journey,
      similarityScore,
      similarityLevel,
      relevanceLevel,
      dimensionScores,
      similarityFactors: this.identifySimilarityFactors(dimensionScores),
      differences: this.identifyDifferences(dimensionScores),
      outcomeImplications: [], // Calculated if needed
      confidence,
      confidenceFactors: [], // Calculated if needed
      calculatedAt: new Date(),
      calculationVersion: '1.0.0',
    };

    const calculationTime = Date.now() - startTime;

    return {
      result,
      calculationTime,
      method: 'multi-dimensional-similarity',
    };
  }

  /**
   * Batch calculate similarities
   */
  calculateSimilarities(
    input: BatchSimilarityInput
  ): BatchSimilarityOutput {
    const startTime = Date.now();
    const results: JourneySimilarityResult[] = [];

    for (const journey of input.journeys) {
      const output = this.calculateSimilarity({
        studentProfile: input.studentProfile,
        journey,
        weights: input.config?.weights,
        config: input.config,
      });
      results.push(output.result);
    }

    // Sort by similarity
    results.sort((a, b) => b.similarityScore - a.similarityScore);

    // Generate analysis
    const analysis = this.generateAnalysis(results, input.studentProfile);

    return {
      results,
      analysis,
      totalTime: Date.now() - startTime,
      journeysProcessed: input.journeys.length,
    };
  }

  /**
   * Generate explanations for similarity results
   */
  explainSimilarity(
    result: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot
  ): SimilarityExplanation {
    if (!this.config.enableExplanations) {
      throw new Error('Explanations are disabled in configuration');
    }

    return this.explanationEngine.generateExplanation(result, studentProfile);
  }

  /**
   * Generate explanations for multiple results
   */
  explainSimilarities(
    results: JourneySimilarityResult[],
    studentProfile: StudentProfileSnapshot
  ): SimilarityExplanation[] {
    return this.explanationEngine.generateExplanations(results, studentProfile);
  }

  /**
   * Compare two journeys for a student
   */
  compareJourneys(
    resultA: JourneySimilarityResult,
    resultB: JourneySimilarityResult,
    studentProfile: StudentProfileSnapshot
  ): {
    comparison: string;
    whichIsBetter: 'A' | 'B' | 'DEPENDS';
    reasoning: string;
    recommendation: string;
  } {
    return this.explanationEngine.generateComparisonExplanation(
      resultA,
      resultB,
      studentProfile
    );
  }

  /**
   * Generate comprehensive analysis of all results
   */
  generateAnalysis(
    results: JourneySimilarityResult[],
    studentProfile: StudentProfileSnapshot
  ): SimilarityAnalysis {
    // Calculate distributions
    const scoreDistribution = this.calculateScoreDistribution(results);

    // Calculate dimension averages
    const dimensionAverages = this.calculateDimensionAverages(results);

    // Find common factors
    const commonFactors = this.findCommonFactors(results);

    // Find common differences
    const commonDifferences = this.findCommonDifferences(results);

    // Generate summary
    const summary = this.generateSummary(results, dimensionAverages);

    return {
      queryId: this.generateQueryId(),
      query: {
        studentProfile,
      } as SimilarityQuery,
      results,
      totalJourneysAnalyzed: results.length,
      scoreDistribution,
      dimensionAverages,
      topMatches: results.slice(0, 5),
      highlyRelevantCount: results.filter(r => r.relevanceLevel === 'HIGHLY_RELEVANT').length,
      relevantCount: results.filter(r => 
        r.relevanceLevel === 'RELEVANT' || r.relevanceLevel === 'HIGHLY_RELEVANT'
      ).length,
      commonFactors,
      commonDifferences,
      summary,
    };
  }

  /**
   * Generate summary across multiple results
   */
  generateSummaryReport(
    results: JourneySimilarityResult[],
    studentProfile: StudentProfileSnapshot
  ): {
    overview: string;
    keyFindings: string[];
    commonPatterns: string[];
    recommendations: string[];
    nextSteps: string[];
  } {
    return this.explanationEngine.generateSummary(results, studentProfile);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Update similarity weights
   */
  updateWeights(weights: Partial<SimilarityWeights>): void {
    this.calculator.updateWeights(weights);
    this.config.weights = { ...this.config.weights, ...weights };
    // Clear cache since weights changed
    this.resultCache.clear();
  }

  /**
   * Validate a query
   */
  validateQuery(query: SimilarityQuery): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!query.studentProfile) {
      errors.push('Student profile is required');
    } else {
      // Validate student profile
      if (!query.studentProfile.location?.cityTier) {
        errors.push('City tier is required in student profile');
      }

      if (!query.studentProfile.education?.fieldOfStudy) {
        warnings.push('Field of study not provided - education similarity may be limited');
      }

      if (query.studentProfile.careerGoals?.length === 0) {
        warnings.push('No career goals specified - goal similarity will be neutral');
      }
    }

    // Validate maxResults
    if (query.maxResults !== undefined && (query.maxResults < 1 || query.maxResults > 100)) {
      errors.push('maxResults must be between 1 and 100');
    }

    // Validate minScore
    if (query.minScore !== undefined && (query.minScore < 0 || query.minScore > 1)) {
      errors.push('minScore must be between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Clear the result cache
   */
  clearCache(): void {
    this.resultCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.resultCache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0, // Would track actual hits in production
    };
  }

  /**
   * Assess match quality
   */
  assessMatchQuality(results: JourneySimilarityResult[]): {
    overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    coverageScore: number;
    diversityScore: number;
    confidenceScore: number;
    improvementSuggestions: string[];
  } {
    return this.matcher.assessMatchQuality(results);
  }

  /**
   * Get similarity statistics
   */
  getStatistics(results: JourneySimilarityResult[]): {
    totalMatches: number;
    averageSimilarity: number;
    similarityDistribution: Record<SimilarityLevel, number>;
    relevanceDistribution: Record<RelevanceLevel, number>;
    averageConfidence: number;
    topDimensions: string[];
  } {
    return this.matcher.getMatchStatistics(results);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateCacheKey(query: SimilarityQuery): string {
    // Create a deterministic key from query
    const profileHash = JSON.stringify({
      location: query.studentProfile.location,
      education: query.studentProfile.education,
      goals: query.studentProfile.careerGoals,
    });

    return `similarity_${this.hashString(profileHash)}_${query.maxResults || 10}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private cacheResults(key: string, results: JourneySimilarityResult[]): void {
    // Evict oldest if at capacity
    if (this.resultCache.size >= this.config.maxCacheSize) {
      const firstKey = this.resultCache.keys().next().value;
      this.resultCache.delete(firstKey);
    }

    this.resultCache.set(key, results);
  }

  private scoreToSimilarityLevel(score: number): SimilarityLevel {
    const { thresholds } = this.config.engineConfig;
    if (score >= thresholds.veryHigh) return 'VERY_HIGH';
    if (score >= thresholds.high) return 'HIGH';
    if (score >= thresholds.moderate) return 'MODERATE';
    if (score >= thresholds.low) return 'LOW';
    return 'VERY_LOW';
  }

  private scoreToRelevanceLevel(score: number): RelevanceLevel {
    if (score >= 0.85) return 'HIGHLY_RELEVANT';
    if (score >= 0.70) return 'RELEVANT';
    if (score >= 0.50) return 'SOMEWHAT_RELEVANT';
    if (score >= 0.30) return 'MINIMALLY_RELEVANT';
    return 'NOT_RELEVANT';
  }

  private calculateConfidence(
    dimensionScores: Array<{ confidence: number; dimension: string }>,
    journey: CareerJourney
  ): number {
    const dimensionConfidence = dimensionScores.length > 0
      ? dimensionScores.reduce((sum, d) => sum + d.confidence, 0) / dimensionScores.length
      : 0.5;

    // Factor in journey completeness
    const completeness = this.calculateJourneyCompleteness(journey);
    return dimensionConfidence * completeness;
  }

  private calculateJourneyCompleteness(journey: CareerJourney): number {
    const checks = [
      journey.educationHistory.length > 0,
      journey.careerHistory.length > 0,
      journey.majorDecisions.length > 0,
      journey.turningPoints.length > 0,
      journey.lessons.length > 0,
    ];

    return checks.filter(Boolean).length / checks.length;
  }

  private identifySimilarityFactors(
    dimensionScores: Array<{ dimension: string; score: number; details: string }>
  ): Array<{ factor: string; dimension: string; impact: 'STRONGLY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'STRONGLY_NEGATIVE'; description: string }> {
    return dimensionScores
      .filter(d => d.score > 0.6)
      .map(d => ({
        factor: `${d.dimension} alignment`,
        dimension: d.dimension,
        impact: d.score > 0.85 ? 'STRONGLY_POSITIVE' : 'POSITIVE',
        description: d.details,
      }));
  }

  private identifyDifferences(
    dimensionScores: Array<{ dimension: string; score: number }>
  ): Array<{ aspect: string; dimension: string; studentValue: string; journeyValue: string; impact: 'MAJOR' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE'; outcomeImplication: string }> {
    return dimensionScores
      .filter(d => d.score < 0.5)
      .map(d => ({
        aspect: d.dimension,
        dimension: d.dimension,
        studentValue: 'Current profile',
        journeyValue: 'Journey profile',
        impact: d.score < 0.3 ? 'MAJOR' : 'MODERATE',
        outcomeImplication: 'May affect applicability',
      }));
  }

  private calculateScoreDistribution(
    results: JourneySimilarityResult[]
  ): ScoreDistribution {
    const distribution: ScoreDistribution = {
      veryHigh: 0,
      high: 0,
      moderate: 0,
      low: 0,
      veryLow: 0,
    };

    for (const result of results) {
      distribution[result.similarityLevel]++;
    }

    return distribution;
  }

  private calculateDimensionAverages(
    results: JourneySimilarityResult[]
  ): Record<string, number> {
    const dimensionTotals: Record<string, { sum: number; count: number }> = {};

    for (const result of results) {
      for (const dim of result.dimensionScores) {
        if (!dimensionTotals[dim.dimension]) {
          dimensionTotals[dim.dimension] = { sum: 0, count: 0 };
        }
        dimensionTotals[dim.dimension].sum += dim.score;
        dimensionTotals[dim.dimension].count++;
      }
    }

    const averages: Record<string, number> = {};
    for (const [dimension, data] of Object.entries(dimensionTotals)) {
      averages[dimension] = data.count > 0 ? data.sum / data.count : 0;
    }

    return averages;
  }

  private findCommonFactors(results: JourneySimilarityResult[]): string[] {
    const factorCounts: Record<string, number> = {};

    for (const result of results) {
      for (const factor of result.similarityFactors) {
        factorCounts[factor.factor] = (factorCounts[factor.factor] || 0) + 1;
      }
    }

    return Object.entries(factorCounts)
      .filter(([_, count]) => count >= results.length * 0.3)
      .map(([factor]) => factor);
  }

  private findCommonDifferences(results: JourneySimilarityResult[]): string[] {
    const differenceCounts: Record<string, number> = {};

    for (const result of results) {
      for (const diff of result.differences) {
        differenceCounts[diff.aspect] = (differenceCounts[diff.aspect] || 0) + 1;
      }
    }

    return Object.entries(differenceCounts)
      .filter(([_, count]) => count >= results.length * 0.3)
      .map(([diff]) => diff);
  }

  private generateSummary(
    results: JourneySimilarityResult[],
    dimensionAverages: Record<string, number>
  ): SimilaritySummary {
    // Find strongest and weakest dimensions
    const sortedDimensions = Object.entries(dimensionAverages)
      .sort((a, b) => b[1] - a[1]);

    const strongestDimension = sortedDimensions[0]?.[0] as any || 'LOCATION';
    const weakestDimension = sortedDimensions[sortedDimensions.length - 1]?.[0] as any || 'PERSONALITY_TRAITS';

    // Calculate overall metrics
    const avgScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.similarityScore, 0) / results.length
      : 0;

    // Generate assessment
    let overallAssessment: string;
    if (avgScore >= 0.7) {
      overallAssessment = `Strong overall similarity (${Math.round(avgScore * 100)}%). Multiple highly relevant journeys identified.`;
    } else if (avgScore >= 0.5) {
      overallAssessment = `Moderate overall similarity (${Math.round(avgScore * 100)}%). Several relevant journeys found with some differences.`;
    } else {
      overallAssessment = `Limited overall similarity (${Math.round(avgScore * 100)}%). Few strong matches available.`;
    }

    // Generate key insight
    const highMatches = results.filter(r => r.similarityScore >= 0.7).length;
    const keyInsight = highMatches > 0
      ? `${highMatches} journeys show strong similarity, indicating good reference material for your situation.`
      : 'Consider expanding your profile or searching criteria for better matches.';

    // Generate recommendation
    const recommendation = highMatches > 3
      ? 'Focus on the top 3-5 most similar journeys for actionable insights.'
      : highMatches > 0
      ? 'Study all available similar journeys and extract common patterns.'
      : 'Consider broadening your search criteria or waiting for more journey data.';

    return {
      overallAssessment,
      strongestDimension,
      weakestDimension,
      keyInsight,
      recommendation,
    };
  }

  private generateResultId(): SimilarityResultId {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SimilarityResultId;
  }

  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create a configured engine
 */
export function createJourneySimilarityEngine(
  config?: Partial<JourneySimilarityEngineConfig>
): JourneySimilarityEngine {
  return new JourneySimilarityEngine(config);
}
