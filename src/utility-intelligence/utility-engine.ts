/**
 * CareerOS Utility Intelligence Engine
 *
 * Phase D.2: Utility Intelligence Engine
 *
 * Main orchestrator for evaluating expected life utility
 * of career decisions across six dimensions.
 *
 * @module utility-engine
 * @version 1.0.0
 */

import type {
  UtilityAnalysis,
  UtilityAnalysisInput,
  UtilityIntelligenceConfig,
  UtilityIntelligenceResult,
  UtilityCalculationResult,
  UtilityBreakdown,
} from './utility-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence, CareerId } from '@/career-intelligence/career-types';
import type { GeneratedProfile } from '@/profile/profile-types';

import { UtilityCalculator, createUtilityCalculator } from './utility-calculator';
import {
  UtilityBreakdownEngine,
  createUtilityBreakdownEngine,
} from './utility-breakdown-engine';
import {
  UtilityExplanationEngine,
  createUtilityExplanationEngine,
} from './utility-explanation-engine';

/**
 * Career data provider interface.
 */
interface CareerDataProvider {
  getCareerIntelligence(careerId: CareerId): Promise<CareerIntelligence | null>;
  getCareerFit(profileId: string, careerId: CareerId): Promise<CareerFitResult | null>;
}

/**
 * Profile data provider interface.
 */
interface ProfileDataProvider {
  getGeneratedProfile(profileId: string): Promise<GeneratedProfile | null>;
}

/**
 * Main Utility Intelligence Engine.
 *
 * Orchestrates utility calculation, breakdown analysis, and explanation generation.
 */
export class UtilityIntelligenceEngine {
  /** Engine configuration */
  private config: UtilityIntelligenceConfig;

  /** Utility calculator */
  private calculator: UtilityCalculator;

  /** Breakdown engine */
  private breakdownEngine: UtilityBreakdownEngine;

  /** Explanation engine */
  private explanationEngine: UtilityExplanationEngine;

  /** Career data provider */
  private careerProvider: CareerDataProvider;

  /** Profile data provider */
  private profileProvider: ProfileDataProvider;

  /**
   * Creates a new UtilityIntelligenceEngine.
   *
   * @param config - Engine configuration
   * @param careerProvider - Provider for career data
   * @param profileProvider - Provider for profile data
   */
  constructor(
    config: UtilityIntelligenceConfig,
    careerProvider: CareerDataProvider,
    profileProvider: ProfileDataProvider
  ) {
    this.config = config;
    this.calculator = createUtilityCalculator(config);
    this.breakdownEngine = createUtilityBreakdownEngine(config);
    this.explanationEngine = createUtilityExplanationEngine(config);
    this.careerProvider = careerProvider;
    this.profileProvider = profileProvider;
  }

  /**
   * Performs complete utility analysis for a career.
   *
   * @param input - Analysis input
   * @returns Utility analysis result
   */
  async analyzeUtility(
    input: UtilityAnalysisInput
  ): Promise<UtilityIntelligenceResult<UtilityAnalysis>> {
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
      const profile = await this.profileProvider.getGeneratedProfile(input.profileId);
      if (!profile) {
        return {
          success: false,
          error: 'PROFILE_NOT_FOUND',
          errorMessage: `Profile not found: ${input.profileId}`,
          timestamp: new Date(),
        };
      }

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

      // Calculate utility breakdown
      const breakdown = this.calculator.calculateUtilityBreakdown(
        profile,
        career,
        fitResult,
        input.context
      );

      // Calculate overall utility
      const calculationResult = this.calculator.calculateOverallUtility(breakdown);

      // Check confidence threshold
      if (calculationResult.confidence < this.config.minConfidenceThreshold) {
        return {
          success: false,
          error: 'CONFIDENCE_TOO_LOW',
          errorMessage: `Analysis confidence (${calculationResult.confidence}) below threshold (${this.config.minConfidenceThreshold})`,
          timestamp: new Date(),
        };
      }

      // Generate advantages
      const advantages = this.breakdownEngine.generateAdvantages(breakdown, career);

      // Generate risks
      const risks = this.breakdownEngine.generateRisks(breakdown, career, fitResult);

      // Generate explanation
      const explanation = this.explanationEngine.generateExplanation(
        calculationResult.overall,
        breakdown,
        advantages,
        risks,
        career
      );

      // Build complete utility analysis
      const utilityAnalysis: UtilityAnalysis = {
        id: input.analysisId,
        profileId: input.profileId,
        careerId: input.careerId,
        overallUtility: calculationResult.overall,
        confidence: calculationResult.confidence,
        utilityBreakdown: breakdown,
        advantages,
        risks,
        explanation,
        analyzedAt: new Date(),
      };

      return {
        success: true,
        data: utilityAnalysis,
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
   * Calculates utility for multiple careers for comparison.
   *
   * @param profileId - Profile identifier
   * @param careerIds - Array of career identifiers
   * @returns Map of utility analyses by career ID
   */
  async analyzeMultipleUtilities(
    profileId: string,
    careerIds: CareerId[]
  ): Promise<Map<CareerId, UtilityIntelligenceResult<UtilityAnalysis>>> {
    const results = new Map<CareerId, UtilityIntelligenceResult<UtilityAnalysis>>();

    for (const careerId of careerIds) {
      const input: UtilityAnalysisInput = {
        analysisId: `utility-${profileId}-${careerId}`,
        profileId,
        careerId,
      };

      const result = await this.analyzeUtility(input);
      results.set(careerId, result);
    }

    return results;
  }

  /**
   * Gets dimension breakdown for a specific analysis.
   *
   * @param profileId - Profile identifier
   * @param careerId - Career identifier
   * @returns Utility breakdown result
   */
  async getDimensionBreakdown(
    profileId: string,
    careerId: CareerId
  ): Promise<UtilityIntelligenceResult<UtilityBreakdown>> {
    try {
      const profile = await this.profileProvider.getGeneratedProfile(profileId);
      if (!profile) {
        return {
          success: false,
          error: 'PROFILE_NOT_FOUND',
          errorMessage: `Profile not found: ${profileId}`,
          timestamp: new Date(),
        };
      }

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

      const breakdown = this.calculator.calculateUtilityBreakdown(
        profile,
        career,
        fitResult
      );

      return {
        success: true,
        data: breakdown,
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
   * Gets component analysis for a breakdown.
   *
   * @param breakdown - Utility breakdown
   * @returns Component analysis
   */
  analyzeComponents(
    breakdown: UtilityBreakdown
  ): ReturnType<UtilityBreakdownEngine['analyzeComponents']> {
    return this.breakdownEngine.analyzeComponents(breakdown);
  }

  /**
   * Identifies strongest dimension.
   *
   * @param breakdown - Utility breakdown
   * @returns Strongest dimension info
   */
  identifyStrongestDimension(
    breakdown: UtilityBreakdown
  ): ReturnType<UtilityBreakdownEngine['identifyStrongestDimension']> {
    return this.breakdownEngine.identifyStrongestDimension(breakdown);
  }

  /**
   * Identifies weakest dimension.
   *
   * @param breakdown - Utility breakdown
   * @returns Weakest dimension info
   */
  identifyWeakestDimension(
    breakdown: UtilityBreakdown
  ): ReturnType<UtilityBreakdownEngine['identifyWeakestDimension']> {
    return this.breakdownEngine.identifyWeakestDimension(breakdown);
  }

  /**
   * Gets the engine configuration.
   *
   * @returns Current configuration
   */
  getConfig(): UtilityIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<UtilityIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculator = createUtilityCalculator(this.config);
    this.breakdownEngine = createUtilityBreakdownEngine(this.config);
    this.explanationEngine = createUtilityExplanationEngine(this.config);
  }
}

/**
 * Creates a default utility intelligence engine.
 *
 * @param careerProvider - Provider for career data
 * @param profileProvider - Provider for profile data
 * @param config - Optional partial configuration
 * @returns Configured UtilityIntelligenceEngine
 */
export function createUtilityIntelligenceEngine(
  careerProvider: CareerDataProvider,
  profileProvider: ProfileDataProvider,
  config?: Partial<UtilityIntelligenceConfig>
): UtilityIntelligenceEngine {
  const fullConfig: UtilityIntelligenceConfig = {
    minConfidenceThreshold: 50,
    defaultTimeHorizon: 10,
    enableDetailedFindings: true,
    enableRecommendations: true,
    dimensionWeights: {
      FULFILLMENT: 0.2,
      LIFESTYLE: 0.15,
      FINANCIAL: 0.15,
      GROWTH: 0.2,
      FREEDOM: 0.15,
      MEANING: 0.15,
    },
    ...config,
  };

  return new UtilityIntelligenceEngine(fullConfig, careerProvider, profileProvider);
}

/**
 * Default export for the utility intelligence engine module.
 */
export { UtilityCalculator, createUtilityCalculator } from './utility-calculator';
export {
  UtilityBreakdownEngine,
  createUtilityBreakdownEngine,
} from './utility-breakdown-engine';
export {
  UtilityExplanationEngine,
  createUtilityExplanationEngine,
} from './utility-explanation-engine';
export * from './utility-types';
