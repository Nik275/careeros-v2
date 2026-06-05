/**
 * CareerOS Optionality Intelligence Engine
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Main orchestrator for evaluating future choice preservation
 * in career decisions.
 *
 * @module optionality-engine
 * @version 1.0.0
 */

import type {
  OptionalityAnalysis,
  OptionalityAnalysisInput,
  OptionalityIntelligenceConfig,
  OptionalityIntelligenceResult,
  OptionalityCalculationResult,
  OptionalityComparison,
  FutureOptions,
  CareerFlexibility,
  PivotPotential,
} from './optionality-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence, CareerId } from '@/career-intelligence/career-types';

import { OptionalityCalculator, createOptionalityCalculator } from './optionality-calculator';
import { PathFlexibilityEngine, createPathFlexibilityEngine } from './path-flexibility-engine';
import { FutureOptionsEngine, createFutureOptionsEngine } from './future-options-engine';
import { OptionalityExplanationEngine, createOptionalityExplanationEngine } from './optionality-explanation-engine';

/**
 * Career data provider interface.
 */
interface CareerDataProvider {
  getCareerIntelligence(careerId: CareerId): Promise<CareerIntelligence | null>;
  getCareerFit(profileId: string, careerId: CareerId): Promise<CareerFitResult | null>;
}

/**
 * Main Optionality Intelligence Engine.
 *
 * Orchestrates optionality calculation, path analysis, and explanation generation.
 */
export class OptionalityIntelligenceEngine {
  /** Engine configuration */
  private config: OptionalityIntelligenceConfig;

  /** Optionality calculator */
  private calculator: OptionalityCalculator;

  /** Path flexibility engine */
  private pathEngine: PathFlexibilityEngine;

  /** Future options engine */
  private optionsEngine: FutureOptionsEngine;

  /** Explanation engine */
  private explanationEngine: OptionalityExplanationEngine;

  /** Career data provider */
  private careerProvider: CareerDataProvider;

  /**
   * Creates a new OptionalityIntelligenceEngine.
   *
   * @param config - Engine configuration
   * @param careerProvider - Provider for career data
   */
  constructor(
    config: OptionalityIntelligenceConfig,
    careerProvider: CareerDataProvider
  ) {
    this.config = config;
    this.calculator = createOptionalityCalculator(config);
    this.pathEngine = createPathFlexibilityEngine(config);
    this.optionsEngine = createFutureOptionsEngine(config);
    this.explanationEngine = createOptionalityExplanationEngine(config);
    this.careerProvider = careerProvider;
  }

  /**
   * Performs complete optionality analysis for a career.
   *
   * @param input - Analysis input
   * @returns Optionality analysis result
   */
  async analyzeOptionality(
    input: OptionalityAnalysisInput
  ): Promise<OptionalityIntelligenceResult<OptionalityAnalysis>> {
    try {
      // Validate input
      if (!input.careerId || !input.profileId) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'Career ID and Profile ID are required',
          timestamp: new Date(),
        };
      }

      // Fetch required data
      const career = await this.careerProvider.getCareerIntelligence(input.careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${input.careerId}`,
          timestamp: new Date(),
        };
      }

      const fitResult = await this.careerProvider.getCareerFit(
        input.profileId,
        input.careerId
      );
      if (!fitResult) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: `No fit analysis available for profile ${input.profileId} and career ${input.careerId}`,
          timestamp: new Date(),
        };
      }

      // Calculate optionality breakdown
      const breakdown = this.calculator.calculateOptionalityBreakdown(
        career,
        fitResult
      );

      // Calculate overall optionality
      const calculationResult = this.calculator.calculateOverallOptionality(breakdown);

      // Check confidence threshold
      if (calculationResult.confidence < this.config.minConfidenceThreshold) {
        return {
          success: false,
          error: 'CONFIDENCE_TOO_LOW',
          errorMessage: `Analysis confidence (${calculationResult.confidence}) below threshold (${this.config.minConfidenceThreshold})`,
          timestamp: new Date(),
        };
      }

      // Calculate path flexibility
      const careerFlexibility = this.pathEngine.calculateCareerFlexibility(
        career,
        fitResult
      );

      // Calculate pivot potential
      const pivotPotential = this.pathEngine.calculatePivotPotential(
        career,
        fitResult
      );

      // Generate future options
      const futureOptions = this.optionsEngine.generateFutureOptions(career);

      // Generate explanation
      const explanation = this.explanationEngine.generateExplanation(
        calculationResult.overallOptionality,
        breakdown,
        futureOptions,
        careerFlexibility,
        pivotPotential,
        career
      );

      // Build complete optionality analysis
      const optionalityAnalysis: OptionalityAnalysis = {
        id: input.analysisId,
        profileId: input.profileId,
        careerId: input.careerId,
        overallOptionality: calculationResult.overallOptionality,
        confidence: calculationResult.confidence,
        futureOptions,
        careerFlexibility,
        pivotPotential,
        breakdown,
        explanation,
        analyzedAt: new Date(),
      };

      return {
        success: true,
        data: optionalityAnalysis,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Analyzes optionality for multiple careers for comparison.
   *
   * @param comparisonId - Unique comparison identifier
   * @param profileId - Profile identifier
   * @param careerIds - Array of career identifiers
   * @returns Optionality comparison result
   */
  async compareOptionalities(
    comparisonId: string,
    profileId: string,
    careerIds: CareerId[]
  ): Promise<OptionalityIntelligenceResult<OptionalityComparison>> {
    try {
      if (careerIds.length < 2) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'At least two careers are required for comparison',
          timestamp: new Date(),
        };
      }

      // Analyze each career
      const analyses: Record<CareerId, OptionalityAnalysis> = {};
      const failedCareers: CareerId[] = [];

      for (const careerId of careerIds) {
        const input: OptionalityAnalysisInput = {
          analysisId: `${comparisonId}-${careerId}`,
          profileId,
          careerId,
        };

        const result = await this.analyzeOptionality(input);

        if (result.success && result.data) {
          analyses[careerId] = result.data;
        } else {
          failedCareers.push(careerId);
        }
      }

      // Check if we have enough analyses
      if (Object.keys(analyses).length < 2) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: `Insufficient analyses for comparison. Failed careers: ${failedCareers.join(', ')}`,
          timestamp: new Date(),
        };
      }

      // Generate rankings
      const rankings = this.generateRankings(analyses);

      // Generate dimension comparison
      const dimensionComparison = this.compareDimensions(analyses);

      // Identify best by dimension
      const bestByDimension = this.identifyBestByDimension(dimensionComparison);

      const comparison: OptionalityComparison = {
        comparisonId,
        careerIds: Object.keys(analyses) as CareerId[],
        analyses,
        rankings,
        dimensionComparison,
        bestByDimension,
        comparedAt: new Date(),
      };

      return {
        success: true,
        data: comparison,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during comparison',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generates rankings for optionality comparison.
   *
   * @param analyses - Optionality analyses by career
   * @returns Rankings
   */
  private generateRankings(
    analyses: Record<CareerId, OptionalityAnalysis>
  ): import('./optionality-types').OptionalityRanking[] {
    const careerEntries = Object.entries(analyses);

    // Sort by overall optionality
    const sorted = careerEntries.sort(
      (a, b) => b[1].overallOptionality - a[1].overallOptionality
    );

    return sorted.map(([careerId, analysis], index) => {
      const relativeStrengths: string[] = [];
      const relativeWeaknesses: string[] = [];

      // Compare with others to identify strengths/weaknesses
      const others = sorted.filter(([, a]) => a !== analysis);

      if (analysis.futureOptions.totalPathCount > Math.max(...others.map(([, a]) => a.futureOptions.totalPathCount))) {
        relativeStrengths.push('Most future paths available');
      }

      if (analysis.careerFlexibility.score > Math.max(...others.map(([, a]) => a.careerFlexibility.score))) {
        relativeStrengths.push('Highest career flexibility');
      }

      if (analysis.pivotPotential.score > Math.max(...others.map(([, a]) => a.pivotPotential.score))) {
        relativeStrengths.push('Easiest pivot potential');
      }

      return {
        rank: index + 1,
        careerId,
        optionalityScore: analysis.overallOptionality,
        relativeStrengths,
        relativeWeaknesses,
      };
    });
  }

  /**
   * Compares dimensions across careers.
   *
   * @param analyses - Optionality analyses
   * @returns Dimension comparisons
   */
  private compareDimensions(
    analyses: Record<CareerId, OptionalityAnalysis>
  ): import('./optionality-types').DimensionComparison[] {
    const dimensions = [
      'careerFlexibility',
      'pivotPotential',
      'transferableSkills',
      'industryMobility',
      'geographicMobility',
      'entrepreneurialPotential',
    ] as const;

    return dimensions.map((dimension) => {
      const scores: Record<CareerId, number> = {};

      for (const [careerId, analysis] of Object.entries(analyses)) {
        scores[careerId as CareerId] = analysis.breakdown[dimension].score;
      }

      // Find best
      const entries = Object.entries(scores);
      const bestCareer = entries.reduce((best, current) =>
        current[1] > best[1] ? current : best
      )[0] as CareerId;

      // Calculate variance
      const values = Object.values(scores);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

      return {
        dimension,
        scores,
        bestCareer,
        variance: Math.round(variance),
      };
    });
  }

  /**
   * Identifies best career for each dimension.
   *
   * @param comparisons - Dimension comparisons
   * @returns Best career by dimension
   */
  private identifyBestByDimension(
    comparisons: import('./optionality-types').DimensionComparison[]
  ): Record<string, CareerId> {
    const result: Record<string, CareerId> = {};

    for (const comparison of comparisons) {
      result[comparison.dimension] = comparison.bestCareer;
    }

    return result;
  }

  /**
   * Gets future options for a career.
   *
   * @param careerId - Career identifier
   * @returns Future options result
   */
  async getFutureOptions(
    careerId: CareerId
  ): Promise<OptionalityIntelligenceResult<FutureOptions>> {
    try {
      const career = await this.careerProvider.getCareerIntelligence(careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${careerId}`,
          timestamp: new Date(),
        };
      }

      const futureOptions = this.optionsEngine.generateFutureOptions(career);

      return {
        success: true,
        data: futureOptions,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets path flexibility analysis.
   *
   * @param profileId - Profile identifier
   * @param careerId - Career identifier
   * @returns Career flexibility and pivot potential
   */
  async getPathFlexibility(
    profileId: string,
    careerId: CareerId
  ): Promise<OptionalityIntelligenceResult<{ flexibility: CareerFlexibility; pivot: PivotPotential }>> {
    try {
      const career = await this.careerProvider.getCareerIntelligence(careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${careerId}`,
          timestamp: new Date(),
        };
      }

      const fitResult = await this.careerProvider.getCareerFit(profileId, careerId);
      if (!fitResult) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: `No fit analysis available`,
          timestamp: new Date(),
        };
      }

      const flexibility = this.pathEngine.calculateCareerFlexibility(career, fitResult);
      const pivot = this.pathEngine.calculatePivotPotential(career, fitResult);

      return {
        success: true,
        data: { flexibility, pivot },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets the engine configuration.
   *
   * @returns Current configuration
   */
  getConfig(): OptionalityIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<OptionalityIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculator = createOptionalityCalculator(this.config);
    this.pathEngine = createPathFlexibilityEngine(this.config);
    this.optionsEngine = createFutureOptionsEngine(this.config);
    this.explanationEngine = createOptionalityExplanationEngine(this.config);
  }
}

/**
 * Creates a default optionality intelligence engine.
 *
 * @param careerProvider - Provider for career data
 * @param config - Optional partial configuration
 * @returns Configured OptionalityIntelligenceEngine
 */
export function createOptionalityIntelligenceEngine(
  careerProvider: CareerDataProvider,
  config?: Partial<OptionalityIntelligenceConfig>
): OptionalityIntelligenceEngine {
  const fullConfig: OptionalityIntelligenceConfig = {
    minConfidenceThreshold: 50,
    defaultTimeHorizon: 10,
    dimensionWeights: {
      careerFlexibility: 0.25,
      pivotPotential: 0.2,
      transferableSkills: 0.2,
      industryMobility: 0.15,
      geographicMobility: 0.1,
      entrepreneurialPotential: 0.1,
    },
    enablePathAnalysis: true,
    maxPathsPerCategory: 5,
    ...config,
  };

  return new OptionalityIntelligenceEngine(fullConfig, careerProvider);
}

/**
 * Default export for the optionality intelligence engine module.
 */
export { OptionalityCalculator, createOptionalityCalculator } from './optionality-calculator';
export { PathFlexibilityEngine, createPathFlexibilityEngine } from './path-flexibility-engine';
export { FutureOptionsEngine, createFutureOptionsEngine } from './future-options-engine';
export { OptionalityExplanationEngine, createOptionalityExplanationEngine } from './optionality-explanation-engine';
export * from './optionality-types';
