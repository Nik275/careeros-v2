/**
 * CareerOS Career Fit Engine - Main Orchestrator
 *
 * Phase C.3: Career Fit Engine
 *
 * Orchestrates fit calculation, breakdown analysis, confidence assessment,
 * and explanation generation.
 *
 * @module career-fit-engine
 * @version 1.0.0
 */

import type { StudentLifeProfile } from '../types/student-life-profile';
import type { CareerIntelligence, CareerId } from '../career-intelligence/career-types';
import type {
  CareerFitResult,
  FitCalculationConfig,
  DEFAULT_FIT_CONFIG,
  FitQuery,
  FitComparison,
} from './career-fit-types';

import { FitCalculator } from './fit-calculator';
import { FitBreakdownEngine } from './fit-breakdown-engine';
import { FitConfidenceEngine } from './fit-confidence-engine';
import { FitExplanationEngine } from './fit-explanation-engine';

/**
 * Main orchestrator for Career Fit Engine.
 *
 * Coordinates fit calculation, analysis, and explanation generation
 * into comprehensive CareerFitResults.
 */
export class CareerFitEngine {
  private calculator: FitCalculator;
  private breakdownEngine: FitBreakdownEngine;
  private confidenceEngine: FitConfidenceEngine;
  private explanationEngine: FitExplanationEngine;
  private config: FitCalculationConfig;
  private fitCache: Map<string, CareerFitResult> = new Map();

  constructor(config?: Partial<FitCalculationConfig>) {
    this.config = { ...DEFAULT_FIT_CONFIG, ...config };
    this.calculator = new FitCalculator(this.config);
    this.breakdownEngine = new FitBreakdownEngine();
    this.confidenceEngine = new FitConfidenceEngine();
    this.explanationEngine = new FitExplanationEngine();
  }

  /**
   * Calculate complete fit between a student profile and a career.
   */
  calculateFit(
    profile: StudentLifeProfile,
    career: CareerIntelligence,
    profileId: string
  ): CareerFitResult {
    // Check cache
    const cacheKey = `${profileId}-${career.careerId}`;
    const cached = this.fitCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Step 1: Calculate base fit
    let fitResult = this.calculator.calculateFit(profile, career, profileId);

    // Step 2: Analyze breakdown and identify strengths/concerns
    fitResult = this.breakdownEngine.analyzeFitResult(fitResult);

    // Step 3: Calculate confidence
    fitResult = this.confidenceEngine.calculateConfidence(fitResult, profile, career);

    // Step 4: Generate explanations
    fitResult = this.explanationEngine.generateExplanations(fitResult);

    // Cache result
    this.fitCache.set(cacheKey, fitResult);

    return fitResult;
  }

  /**
   * Calculate fit for multiple careers.
   */
  calculateFits(
    profile: StudentLifeProfile,
    careers: CareerIntelligence[],
    profileId: string
  ): CareerFitResult[] {
    return careers.map((career) => this.calculateFit(profile, career, profileId));
  }

  /**
   * Compare fit across multiple careers.
   */
  compareFits(fitResults: CareerFitResult[]): FitComparison {
    if (fitResults.length === 0) {
      throw new Error('At least one fit result required for comparison');
    }

    const careerIds = fitResults.map((f) => f.careerId);

    // Dimension comparison
    const dimensionComparison = [
      { name: 'Cognitive', getScore: (f: CareerFitResult) => f.breakdown.cognitive.score },
      { name: 'Motivation', getScore: (f: CareerFitResult) => f.breakdown.motivation.score },
      { name: 'Lifestyle', getScore: (f: CareerFitResult) => f.breakdown.lifestyle.score },
      { name: 'Risk', getScore: (f: CareerFitResult) => f.breakdown.risk.score },
      { name: 'Work Environment', getScore: (f: CareerFitResult) => f.breakdown.workEnvironment.score },
      { name: 'Values', getScore: (f: CareerFitResult) => f.breakdown.values.score },
    ].map((dim) => {
      const scores: Record<CareerId, number> = {};
      fitResults.forEach((f) => {
        scores[f.careerId] = dim.getScore(f);
      });

      const values = Object.values(scores);
      const maxScore = Math.max(...values);
      const minScore = Math.min(...values);
      const best = Object.entries(scores).find(([, score]) => score === maxScore)?.[0]!;

      return {
        dimension: dim.name,
        scores,
        best,
        range: maxScore - minScore,
      };
    });

    // Best fit
    const bestFit = fitResults.reduce((best, current) =>
      current.overallFitScore > best.overallFitScore ? current : best
    ).careerId;

    return {
      careerIds,
      fits: fitResults,
      dimensionComparison,
      bestFit,
      comparedAt: new Date(),
    };
  }

  /**
   * Query fits by criteria.
   */
  queryFits(fitResults: CareerFitResult[], query: FitQuery): CareerFitResult[] {
    let results = [...fitResults];

    if (query.minFitScore !== undefined) {
      results = results.filter((f) => f.overallFitScore >= query.minFitScore!);
    }

    if (query.fitLevel !== undefined) {
      results = results.filter((f) => f.fitLevel === query.fitLevel);
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((f) => f.confidence.overall >= query.minConfidence!);
    }

    if (query.prioritizedDimensions && query.prioritizedDimensions.length > 0) {
      results = results.filter((f) => {
        return query.prioritizedDimensions!.some((dim) => {
          const score = f.breakdown[dim]?.score ?? 0;
          return score >= 70;
        });
      });
    }

    return results;
  }

  /**
   * Get best fitting careers.
   */
  getBestFits(fitResults: CareerFitResult[], limit: number = 5): CareerFitResult[] {
    return fitResults
      .filter((f) => f.confidence.level !== 'LOW')
      .sort((a, b) => b.overallFitScore - a.overallFitScore)
      .slice(0, limit);
  }

  /**
   * Get careers with concerning fits.
   */
  getConcerningFits(fitResults: CareerFitResult[]): CareerFitResult[] {
    return fitResults.filter(
      (f) =>
        f.fitLevel === 'POOR' ||
        f.fitLevel === 'MISFIT' ||
        f.concerns.filter((c) => c.severity === 'HIGH').length > 2
    );
  }

  /**
   * Get dimension scores for a career.
   */
  getDimensionScores(fitResult: CareerFitResult): Array<{
    dimension: string;
    score: number;
    weight: number;
  }> {
    const weights = this.config.dimensionWeights;

    return [
      { dimension: 'Cognitive', score: fitResult.breakdown.cognitive.score, weight: weights.cognitive },
      { dimension: 'Motivation', score: fitResult.breakdown.motivation.score, weight: weights.motivation },
      { dimension: 'Lifestyle', score: fitResult.breakdown.lifestyle.score, weight: weights.lifestyle },
      { dimension: 'Risk', score: fitResult.breakdown.risk.score, weight: weights.risk },
      { dimension: 'Work Environment', score: fitResult.breakdown.workEnvironment.score, weight: weights.workEnvironment },
      { dimension: 'Values', score: fitResult.breakdown.values.score, weight: weights.values },
    ];
  }

  /**
   * Check if fit meets criteria.
   */
  meetsCriteria(fitResult: CareerFitResult, criteria: {
    minFitScore?: number;
    minConfidence?: number;
    maxConcerns?: number;
  }): boolean {
    if (criteria.minFitScore !== undefined && fitResult.overallFitScore < criteria.minFitScore) {
      return false;
    }

    if (criteria.minConfidence !== undefined && fitResult.confidence.overall < criteria.minConfidence) {
      return false;
    }

    if (criteria.maxConcerns !== undefined) {
      const highConcerns = fitResult.concerns.filter((c) => c.severity === 'HIGH').length;
      if (highConcerns > criteria.maxConcerns) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get fit summary.
   */
  getSummary(fitResult: CareerFitResult): string {
    return this.explanationEngine.generateBriefDescription(fitResult);
  }

  /**
   * Get fit recommendations.
   */
  getRecommendations(fitResult: CareerFitResult): string[] {
    return this.explanationEngine.generateRecommendations(fitResult);
  }

  /**
   * Clear fit cache.
   */
  clearCache(): void {
    this.fitCache.clear();
  }

  /**
   * Get cache size.
   */
  getCacheSize(): number {
    return this.fitCache.size;
  }

  /**
   * Update configuration.
   */
  setConfig(config: Partial<FitCalculationConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculator.setConfig(this.config);
    this.clearCache();
  }

  /**
   * Get current configuration.
   */
  getConfig(): FitCalculationConfig {
    return { ...this.config };
  }

  /**
   * Get fit statistics.
   */
  getStatistics(fitResults: CareerFitResult[]): {
    averageFitScore: number;
    highestFit: CareerFitResult | null;
    lowestFit: CareerFitResult | null;
    averageConfidence: number;
    fitLevelDistribution: Record<string, number>;
  } {
    if (fitResults.length === 0) {
      return {
        averageFitScore: 0,
        highestFit: null,
        lowestFit: null,
        averageConfidence: 0,
        fitLevelDistribution: {},
      };
    }

    const scores = fitResults.map((f) => f.overallFitScore);
    const confidences = fitResults.map((f) => f.confidence.overall);

    const highestFit = fitResults.reduce((best, current) =>
      current.overallFitScore > best.overallFitScore ? current : best
    );

    const lowestFit = fitResults.reduce((worst, current) =>
      current.overallFitScore < worst.overallFitScore ? current : worst
    );

    const fitLevelDistribution: Record<string, number> = {};
    for (const fit of fitResults) {
      fitLevelDistribution[fit.fitLevel] = (fitLevelDistribution[fit.fitLevel] ?? 0) + 1;
    }

    return {
      averageFitScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestFit,
      lowestFit,
      averageConfidence: Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length),
      fitLevelDistribution,
    };
  }
}

/**
 * Factory function for CareerFitEngine.
 */
export function createCareerFitEngine(
  config?: Partial<FitCalculationConfig>
): CareerFitEngine {
  return new CareerFitEngine(config);
}

// Re-export all engines and types
export * from './career-fit-types';
export { FitCalculator, createFitCalculator } from './fit-calculator';
export { FitBreakdownEngine, createFitBreakdownEngine } from './fit-breakdown-engine';
export { FitConfidenceEngine, createFitConfidenceEngine } from './fit-confidence-engine';
export { FitExplanationEngine, createFitExplanationEngine } from './fit-explanation-engine';
