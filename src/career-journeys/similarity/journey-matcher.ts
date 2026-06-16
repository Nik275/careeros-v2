/**
 * Journey Matcher
 * 
 * Matching engine that finds and ranks relevant career journeys.
 * Handles filtering, ranking, and quality assessment of matches.
 * 
 * @module JourneyMatcher
 */

import {
  CareerJourney,
  JourneyId,
} from '../career-journey-types';

import {
  SimilarityQuery,
  SimilarityFilters,
  JourneySimilarityResult,
  SimilarityResultId,
  SimilarityScore,
  SimilarityLevel,
  RelevanceLevel,
  MatchCandidate,
  MatchRanking,
  MatchQuality,
  SimilarityEngineConfig,
  SimilarityFactor,
  Difference,
  OutcomeImplication,
  SimilarityDimension,
  DEFAULT_SIMILARITY_CONFIG,
} from './journey-similarity-types';

import { SimilarityCalculator } from './similarity-calculator';

/**
 * Journey Matcher
 * 
 * Finds, filters, and ranks career journeys based on similarity to a student profile.
 */
export class JourneyMatcher {
  private calculator: SimilarityCalculator;
  private config: SimilarityEngineConfig;

  constructor(
    calculator: SimilarityCalculator,
    config: Partial<SimilarityEngineConfig> = {}
  ) {
    this.calculator = calculator;
    this.config = { ...DEFAULT_SIMILARITY_CONFIG, ...config };
  }

  /**
   * Find matching journeys for a student profile
   */
  async findMatches(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository
  ): Promise<JourneySimilarityResult[]> {
    // Get candidate journeys
    const candidates = await this.getCandidates(query, journeyRepository);
    
    // Filter candidates
    const filtered = this.filterCandidates(candidates, query.filters);
    
    // Calculate similarity for each candidate
    const results = await this.calculateSimilarities(filtered, query);
    
    // Rank results
    const ranked = this.rankResults(results);
    
    // Apply limit
    const maxResults = query.maxResults || this.config.calculation.maxResults;
    return ranked.slice(0, maxResults);
  }

  /**
   * Find best single match
   */
  async findBestMatch(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository
  ): Promise<JourneySimilarityResult | null> {
    const matches = await this.findMatches(query, journeyRepository);
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Find matches with minimum similarity threshold
   */
  async findMatchesAboveThreshold(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository,
    threshold: SimilarityScore
  ): Promise<JourneySimilarityResult[]> {
    const matches = await this.findMatches(query, journeyRepository);
    return matches.filter(m => m.similarityScore >= threshold);
  }

  /**
   * Find diverse matches (different archetypes, industries, etc.)
   */
  async findDiverseMatches(
    query: SimilarityQuery,
    journeyRepository: JourneyRepository,
    diversityOptions: DiversityOptions
  ): Promise<JourneySimilarityResult[]> {
    const allMatches = await this.findMatches(
      { ...query, maxResults: query.maxResults ? query.maxResults * 3 : 30 },
      journeyRepository
    );

    return this.diversifyResults(allMatches, diversityOptions);
  }

  /**
   * Assess quality of match results
   */
  assessMatchQuality(results: JourneySimilarityResult[]): MatchQuality {
    if (results.length === 0) {
      return {
        overallQuality: 'POOR',
        coverageScore: 0,
        diversityScore: 0,
        confidenceScore: 0,
        improvementSuggestions: ['Expand journey database', 'Reduce similarity threshold'],
      };
    }

    // Coverage score - how well do results cover different dimensions
    const coverageScore = this.calculateCoverageScore(results);

    // Diversity score - how different are the journeys
    const diversityScore = this.calculateDiversityScore(results);

    // Confidence score - average confidence of results
    const confidenceScore = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    // Overall quality
    let overallQuality: MatchQuality['overallQuality'];
    const avgScore = (coverageScore + diversityScore + confidenceScore) / 3;
    if (avgScore >= 0.8) overallQuality = 'EXCELLENT';
    else if (avgScore >= 0.6) overallQuality = 'GOOD';
    else if (avgScore >= 0.4) overallQuality = 'FAIR';
    else overallQuality = 'POOR';

    // Improvement suggestions
    const suggestions: string[] = [];
    if (coverageScore < 0.6) suggestions.push('Add more journeys with different characteristics');
    if (diversityScore < 0.5) suggestions.push('Results are too similar - increase diversity weight');
    if (confidenceScore < 0.6) suggestions.push('Improve data quality for better confidence');

    return {
      overallQuality,
      coverageScore,
      diversityScore,
      confidenceScore,
      improvementSuggestions: suggestions,
    };
  }

  /**
   * Re-rank results based on additional criteria
   */
  reRankResults(
    results: JourneySimilarityResult[],
    criteria: 'SIMILARITY' | 'RELEVANCE' | 'CONFIDENCE' | 'OUTCOME_QUALITY'
  ): JourneySimilarityResult[] {
    const sorted = [...results];

    switch (criteria) {
      case 'SIMILARITY':
        sorted.sort((a, b) => b.similarityScore - a.similarityScore);
        break;
      case 'RELEVANCE':
        sorted.sort((a, b) => this.relevanceRank(a) - this.relevanceRank(b));
        break;
      case 'CONFIDENCE':
        sorted.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'OUTCOME_QUALITY':
        sorted.sort((a, b) => this.outcomeQuality(b) - this.outcomeQuality(a));
        break;
    }

    return sorted;
  }

  /**
   * Filter out redundant matches
   */
  removeRedundantMatches(
    results: JourneySimilarityResult[],
    redundancyThreshold: number = 0.9
  ): JourneySimilarityResult[] {
    const unique: JourneySimilarityResult[] = [];

    for (const result of results) {
      let isRedundant = false;
      
      for (const existing of unique) {
        const similarity = this.calculateResultSimilarity(result, existing);
        if (similarity >= redundancyThreshold) {
          isRedundant = true;
          break;
        }
      }

      if (!isRedundant) {
        unique.push(result);
      }
    }

    return unique;
  }

  /**
   * Get matching statistics
   */
  getMatchStatistics(results: JourneySimilarityResult[]): {
    totalMatches: number;
    averageSimilarity: number;
    similarityDistribution: Record<SimilarityLevel, number>;
    relevanceDistribution: Record<RelevanceLevel, number>;
    averageConfidence: number;
    topDimensions: string[];
  } {
    const totalMatches = results.length;
    
    const averageSimilarity = totalMatches > 0
      ? results.reduce((sum, r) => sum + r.similarityScore, 0) / totalMatches
      : 0;

    const similarityDistribution: Record<SimilarityLevel, number> = {
      'VERY_HIGH': 0,
      'HIGH': 0,
      'MODERATE': 0,
      'LOW': 0,
      'VERY_LOW': 0,
    };

    const relevanceDistribution: Record<RelevanceLevel, number> = {
      'HIGHLY_RELEVANT': 0,
      'RELEVANT': 0,
      'SOMEWHAT_RELEVANT': 0,
      'MINIMALLY_RELEVANT': 0,
      'NOT_RELEVANT': 0,
    };

    for (const result of results) {
      similarityDistribution[result.similarityLevel]++;
      relevanceDistribution[result.relevanceLevel]++;
    }

    const averageConfidence = totalMatches > 0
      ? results.reduce((sum, r) => sum + r.confidence, 0) / totalMatches
      : 0;

    // Find top dimensions across all results
    const dimensionScores: Record<string, number> = {};
    for (const result of results) {
      for (const dim of result.dimensionScores) {
        dimensionScores[dim.dimension] = (dimensionScores[dim.dimension] || 0) + dim.weightedScore;
      }
    }

    const topDimensions = Object.entries(dimensionScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dim]) => dim);

    return {
      totalMatches,
      averageSimilarity,
      similarityDistribution,
      relevanceDistribution,
      averageConfidence,
      topDimensions,
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async getCandidates(
    query: SimilarityQuery,
    repository: JourneyRepository
  ): Promise<MatchCandidate[]> {
    // Get all journeys from repository
    const journeys = await repository.getAll();

    // Create preliminary candidates
    return journeys.map(journey => ({
      journey,
      preliminaryScore: this.calculatePreliminaryScore(query, journey),
      disqualifyingFactors: this.identifyDisqualifyingFactors(query, journey),
      qualifyingFactors: this.identifyQualifyingFactors(query, journey),
    }));
  }

  private filterCandidates(
    candidates: MatchCandidate[],
    filters?: SimilarityFilters
  ): MatchCandidate[] {
    return candidates.filter(candidate => {
      // Check disqualifying factors
      if (candidate.disqualifyingFactors.length > 0) {
        return false;
      }

      // Apply filters
      if (filters) {
        // Minimum journey completeness
        if (filters.minJourneyCompleteness !== undefined) {
          const completeness = this.calculateJourneyCompleteness(candidate.journey);
          if (completeness < filters.minJourneyCompleteness) {
            return false;
          }
        }

        // Require successful outcome
        if (filters.requireSuccessfulOutcome) {
          const hasSuccess = candidate.journey.successes.length > 0;
          if (!hasSuccess) {
            return false;
          }
        }

        // Max age
        if (filters.maxAgeInYears !== undefined) {
          const journeyAge = this.calculateJourneyAge(candidate.journey);
          if (journeyAge > filters.maxAgeInYears) {
            return false;
          }
        }

        // Industry filters
        if (filters.industries && filters.industries.length > 0) {
          const journeyIndustries = candidate.journey.careerHistory.map(p => p.industry);
          const hasMatch = filters.industries.some(ind => 
            journeyIndustries.some(ji => ji.toLowerCase().includes(ind.toLowerCase()))
          );
          if (!hasMatch) return false;
        }

        if (filters.excludeIndustries && filters.excludeIndustries.length > 0) {
          const journeyIndustries = candidate.journey.careerHistory.map(p => p.industry);
          const hasExcluded = filters.excludeIndustries.some(ind => 
            journeyIndustries.some(ji => ji.toLowerCase().includes(ind.toLowerCase()))
          );
          if (hasExcluded) return false;
        }
      }

      return true;
    });
  }

  private async calculateSimilarities(
    candidates: MatchCandidate[],
    query: SimilarityQuery
  ): Promise<JourneySimilarityResult[]> {
    const results: JourneySimilarityResult[] = [];

    for (const candidate of candidates) {
      // Calculate dimension scores
      const dimensionScores = this.calculator.calculateAllDimensions(
        query.studentProfile,
        candidate.journey,
        query.archetypeProfile,
        query.motivationProfile,
        query.constraintProfile,
        query.decisionContext
      );

      // Calculate overall score
      const similarityScore = this.calculator.calculateOverallScore(dimensionScores);

      // Determine similarity level
      const similarityLevel = this.scoreToLevel(similarityScore);

      // Determine relevance
      const relevanceLevel = this.scoreToRelevance(similarityScore);

      // Calculate confidence
      const confidence = this.calculateConfidence(dimensionScores, candidate.journey);

      // Generate result ID
      const id = this.generateResultId();

      // Identify similarity factors
      const similarityFactors = this.identifySimilarityFactors(dimensionScores);

      // Identify differences
      const differences = this.identifyDifferences(dimensionScores);

      // Calculate outcome implications
      const outcomeImplications = this.calculateOutcomeImplications(differences);

      results.push({
        id,
        journeyId: candidate.journey.id,
        journey: candidate.journey,
        similarityScore,
        similarityLevel,
        relevanceLevel,
        dimensionScores,
        similarityFactors,
        differences,
        outcomeImplications,
        confidence,
        confidenceFactors: this.identifyConfidenceFactors(dimensionScores, candidate.journey),
        calculatedAt: new Date(),
        calculationVersion: '1.0',
      });
    }

    return results;
  }

  private rankResults(results: JourneySimilarityResult[]): JourneySimilarityResult[] {
    // Sort by weighted combination of similarity and confidence
    return results.sort((a, b) => {
      const scoreA = a.similarityScore * 0.7 + a.confidence * 0.3;
      const scoreB = b.similarityScore * 0.7 + b.confidence * 0.3;
      return scoreB - scoreA;
    });
  }

  private diversifyResults(
    results: JourneySimilarityResult[],
    options: DiversityOptions
  ): JourneySimilarityResult[] {
    const diverse: JourneySimilarityResult[] = [];
    const usedArchetypes = new Set<string>();
    const usedIndustries = new Set<string>();

    // First pass: ensure diversity by archetype
    if (options.diversifyByArchetype) {
      for (const result of results) {
        const archetype = this.inferArchetype(result.journey);
        if (!usedArchetypes.has(archetype)) {
          diverse.push(result);
          usedArchetypes.add(archetype);
        }
      }
    }

    // Second pass: ensure diversity by industry
    if (options.diversifyByIndustry) {
      for (const result of results) {
        const industries = result.journey.careerHistory.map(p => p.industry);
        const hasNewIndustry = industries.some(i => !usedIndustries.has(i));
        
        if (hasNewIndustry && !diverse.includes(result)) {
          diverse.push(result);
          industries.forEach(i => usedIndustries.add(i));
        }
      }
    }

    // Fill remaining slots with highest similarity
    for (const result of results) {
      if (!diverse.includes(result) && diverse.length < (options.maxResults || 10)) {
        diverse.push(result);
      }
    }

    return diverse.slice(0, options.maxResults || 10);
  }

  private calculatePreliminaryScore(query: SimilarityQuery, journey: CareerJourney): number {
    // Quick heuristic-based preliminary score
    let score = 0.5;

    // Location match bonus
    if (query.studentProfile.location.cityTier === journey.startingPoint.location.tier) {
      score += 0.2;
    }

    // Education field match
    const studentField = query.studentProfile.education.fieldOfStudy.toLowerCase();
    const journeyFields = journey.educationHistory.map(e => e.fieldOfStudy.toLowerCase());
    if (journeyFields.some(f => f.includes(studentField) || studentField.includes(f))) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private identifyDisqualifyingFactors(query: SimilarityQuery, journey: CareerJourney): string[] {
    const factors: string[] = [];

    // Check minimum data requirements
    if (journey.careerHistory.length === 0) {
      factors.push('No career history');
    }

    // Check if journey is too incomplete
    const completeness = this.calculateJourneyCompleteness(journey);
    if (completeness < 0.3) {
      factors.push('Journey too incomplete');
    }

    return factors;
  }

  private identifyQualifyingFactors(query: SimilarityQuery, journey: CareerJourney): string[] {
    const factors: string[] = [];

    if (query.studentProfile.location.cityTier === journey.startingPoint.location.tier) {
      factors.push('Same location tier');
    }

    if (journey.successes.length >= 2) {
      factors.push('Multiple documented successes');
    }

    return factors;
  }

  private calculateJourneyCompleteness(journey: CareerJourney): number {
    const checks = [
      journey.educationHistory.length > 0,
      journey.careerHistory.length > 0,
      journey.majorDecisions.length > 0,
      journey.turningPoints.length > 0,
      journey.lessons.length > 0,
      journey.startingPoint.location.tier !== undefined,
    ];

    return checks.filter(Boolean).length / checks.length;
  }

  private calculateJourneyAge(journey: CareerJourney): number {
    const now = new Date();
    const firstEducationYear = journey.educationHistory[0]?.startYear;
    const firstEducationDate = firstEducationYear !== undefined
      ? new Date(firstEducationYear, 0, 1)
      : undefined;
    const firstEvent = firstEducationDate ?? journey.careerHistory[0]?.startDate ?? now;
    
    return (now.getTime() - firstEvent.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  private scoreToLevel(score: SimilarityScore): SimilarityLevel {
    if (score >= this.config.thresholds.veryHigh) return 'VERY_HIGH';
    if (score >= this.config.thresholds.high) return 'HIGH';
    if (score >= this.config.thresholds.moderate) return 'MODERATE';
    if (score >= this.config.thresholds.low) return 'LOW';
    return 'VERY_LOW';
  }

  private scoreToRelevance(score: SimilarityScore): RelevanceLevel {
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
    // Base confidence from dimension confidences
    const dimensionConfidence = dimensionScores.length > 0
      ? dimensionScores.reduce((sum, d) => sum + d.confidence, 0) / dimensionScores.length
      : 0.5;

    // Adjust based on journey completeness
    const completeness = this.calculateJourneyCompleteness(journey);
    const completenessFactor = completeness < this.config.confidence.minJourneyCompleteness 
      ? completeness 
      : 1;

    return dimensionConfidence * completenessFactor;
  }

  private identifyConfidenceFactors(
    dimensionScores: Array<{ confidence: number; dimension: string }>,
    journey: CareerJourney
  ): Array<{ factor: string; impact: 'INCREASES' | 'DECREASES'; magnitude: 'HIGH' | 'MEDIUM' | 'LOW'; description: string }> {
    const factors: Array<{ factor: string; impact: 'INCREASES' | 'DECREASES'; magnitude: 'HIGH' | 'MEDIUM' | 'LOW'; description: string }> = [];

    // Completeness factor
    const completeness = this.calculateJourneyCompleteness(journey);
    if (completeness >= 0.8) {
      factors.push({
        factor: 'Journey Completeness',
        impact: 'INCREASES',
        magnitude: 'HIGH',
        description: 'Journey has comprehensive data',
      });
    } else if (completeness < 0.5) {
      factors.push({
        factor: 'Journey Completeness',
        impact: 'DECREASES',
        magnitude: 'HIGH',
        description: 'Journey data is incomplete',
      });
    }

    // Dimension coverage
    const lowConfidenceDimensions = dimensionScores.filter(d => d.confidence < 0.5);
    if (lowConfidenceDimensions.length > 0) {
      factors.push({
        factor: 'Dimension Coverage',
        impact: 'DECREASES',
        magnitude: 'MEDIUM',
        description: `${lowConfidenceDimensions.length} dimensions have low confidence`,
      });
    }

    return factors;
  }

  private identifySimilarityFactors(
    dimensionScores: Array<{ dimension: string; score: number; details: string }>
  ): SimilarityFactor[] {
    return dimensionScores
      .filter(d => d.score > 0.6)
      .map(d => ({
        factor: `${d.dimension} alignment`,
        dimension: d.dimension as SimilarityDimension,
        impact: d.score > 0.85 ? 'STRONGLY_POSITIVE' : 'POSITIVE',
        description: d.details,
      }));
  }

  private identifyDifferences(
    dimensionScores: Array<{ dimension: string; score: number }>
  ): Difference[] {
    return dimensionScores
      .filter(d => d.score < 0.5)
      .map(d => ({
        aspect: d.dimension,
        dimension: d.dimension as SimilarityDimension,
        studentValue: 'Current profile',
        journeyValue: 'Journey profile',
        impact: d.score < 0.3 ? 'MAJOR' : 'MODERATE',
        outcomeImplication: 'May affect path feasibility',
      }));
  }

  private calculateOutcomeImplications(
    differences: Difference[]
  ): OutcomeImplication[] {
    return differences.map(d => ({
      difference: d.aspect,
      likelyImpact: d.impact === 'MAJOR' ? 'NEGATIVE' : 'UNCERTAIN',
      explanation: `Difference in ${d.aspect} may impact outcomes`,
      mitigation: d.impact === 'MAJOR' ? 'Consider addressing this gap' : undefined,
    }));
  }

  private calculateResultSimilarity(a: JourneySimilarityResult, b: JourneySimilarityResult): number {
    // Compare two results to check for redundancy
    const scoreDiff = Math.abs(a.similarityScore - b.similarityScore);
    const journeyOverlap = this.calculateJourneyOverlap(a.journey, b.journey);
    
    return 1 - (scoreDiff * 0.5 + (1 - journeyOverlap) * 0.5);
  }

  private calculateJourneyOverlap(a: CareerJourney, b: CareerJourney): number {
    const aIndustries = new Set(a.careerHistory.map(p => p.industry));
    const bIndustries = new Set(b.careerHistory.map(p => p.industry));
    
    const intersection = new Set([...aIndustries].filter(x => bIndustries.has(x)));
    const union = new Set([...aIndustries, ...bIndustries]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateCoverageScore(results: JourneySimilarityResult[]): number {
    if (results.length === 0) return 0;
    
    const dimensions = new Set(results.flatMap(r => r.dimensionScores.map(d => d.dimension)));
    const totalDimensions = 10; // Total possible dimensions
    
    return dimensions.size / totalDimensions;
  }

  private calculateDiversityScore(results: JourneySimilarityResult[]): number {
    if (results.length <= 1) return 1;
    
    const archetypes = new Set(results.map(r => this.inferArchetype(r.journey)));
    const industries = new Set(results.flatMap(r => r.journey.careerHistory.map(p => p.industry)));
    
    const archetypeDiversity = archetypes.size / results.length;
    const industryDiversity = Math.min(industries.size / results.length, 1);
    
    return (archetypeDiversity + industryDiversity) / 2;
  }

  private relevanceRank(result: JourneySimilarityResult): number {
    const relevanceMap: Record<RelevanceLevel, number> = {
      'HIGHLY_RELEVANT': 5,
      'RELEVANT': 4,
      'SOMEWHAT_RELEVANT': 3,
      'MINIMALLY_RELEVANT': 2,
      'NOT_RELEVANT': 1,
    };
    return relevanceMap[result.relevanceLevel];
  }

  private outcomeQuality(result: JourneySimilarityResult): number {
    const successCount = result.journey.successes.length;
    const failureCount = result.journey.failures.length;
    
    if (successCount + failureCount === 0) return 0.5;
    return successCount / (successCount + failureCount);
  }

  private inferArchetype(journey: CareerJourney): string {
    // Simple archetype inference
    if (journey.careerHistory.some(p => p.companyStage.startsWith('STARTUP_'))) return 'FOUNDER';
    if (journey.careerHistory.length >= 4) return 'PROFESSIONAL';
    return 'GENERAL';
  }

  private generateResultId(): SimilarityResultId {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SimilarityResultId;
  }
}

/**
 * Journey repository interface
 */
export interface JourneyRepository {
  getAll(): Promise<CareerJourney[]>;
  getById(id: JourneyId): Promise<CareerJourney | null>;
  findByCriteria(criteria: Record<string, unknown>): Promise<CareerJourney[]>;
}

/**
 * Options for diversifying results
 */
export interface DiversityOptions {
  maxResults: number;
  diversifyByArchetype: boolean;
  diversifyByIndustry: boolean;
  diversifyByOutcome: boolean;
  minSimilarityThreshold: number;
}
