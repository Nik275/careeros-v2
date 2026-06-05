/**
 * CareerOS Decision Intelligence Engine
 *
 * Phase D.1: Decision Intelligence Engine
 *
 * Main orchestrator for decision evaluation, tradeoff analysis,
 * and comparison of career options.
 *
 * @module decision-intelligence-engine
 * @version 1.0.0
 */

import type {
  DecisionAnalysis,
  DecisionComparison,
  DecisionAnalysisInput,
  DecisionComparisonInput,
  DecisionIntelligenceConfig,
  DecisionIntelligenceResult,
  ComparisonCriteria,
  DecisionContext,
  ConfidenceCalculationResult,
} from './decision-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { GeneratedProfile } from '@/profile/profile-types';

import { DecisionAnalyzer, createDecisionAnalyzer } from './decision-analyzer';
import {
  DecisionConfidenceEngine,
  createDecisionConfidenceEngine,
} from './decision-confidence-engine';
import {
  DecisionComparisonEngine,
  createDecisionComparisonEngine,
} from './decision-comparison-engine';

/**
 * Career data provider interface for the decision engine.
 */
interface CareerDataProvider {
  getCareerIntelligence(careerId: string): Promise<CareerIntelligence | null>;
  getCareerFit(profileId: string, careerId: string): Promise<CareerFitResult | null>;
}

/**
 * Profile data provider interface for the decision engine.
 */
interface ProfileDataProvider {
  getGeneratedProfile(profileId: string): Promise<GeneratedProfile | null>;
}

/**
 * Main Decision Intelligence Engine.
 *
 * Orchestrates decision analysis, confidence calculation, and comparison.
 */
export class DecisionIntelligenceEngine {
  /** Engine configuration */
  private config: DecisionIntelligenceConfig;

  /** Decision analyzer */
  private analyzer: DecisionAnalyzer;

  /** Confidence engine */
  private confidenceEngine: DecisionConfidenceEngine;

  /** Comparison engine */
  private comparisonEngine: DecisionComparisonEngine;

  /** Career data provider */
  private careerProvider: CareerDataProvider;

  /** Profile data provider */
  private profileProvider: ProfileDataProvider;

  /**
   * Creates a new DecisionIntelligenceEngine.
   *
   * @param config - Engine configuration
   * @param careerProvider - Provider for career data
   * @param profileProvider - Provider for profile data
   */
  constructor(
    config: DecisionIntelligenceConfig,
    careerProvider: CareerDataProvider,
    profileProvider: ProfileDataProvider
  ) {
    this.config = config;
    this.analyzer = createDecisionAnalyzer(config);
    this.confidenceEngine = createDecisionConfidenceEngine(config);
    this.comparisonEngine = createDecisionComparisonEngine(config);
    this.careerProvider = careerProvider;
    this.profileProvider = profileProvider;
  }

  /**
   * Analyzes a single career decision option.
   *
   * @param input - Decision analysis input
   * @returns Decision analysis result
   */
  async analyzeDecision(
    input: DecisionAnalysisInput
  ): Promise<DecisionIntelligenceResult<DecisionAnalysis>> {
    try {
      // Validate input
      if (!input.option || !input.option.careerId) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'Decision option and career ID are required',
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

      const career = await this.careerProvider.getCareerIntelligence(input.option.careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${input.option.careerId}`,
          timestamp: new Date(),
        };
      }

      const fitResult = await this.careerProvider.getCareerFit(
        input.profileId,
        input.option.careerId
      );
      if (!fitResult) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: `No fit analysis available for profile ${input.profileId} and career ${input.option.careerId}`,
          timestamp: new Date(),
        };
      }

      // Perform decision analysis
      const analysisResult = this.analyzer.analyzeDecision(
        input.option,
        fitResult,
        career,
        profile,
        input.context
      );

      // Calculate confidence
      const decisionDimensions = [
        analysisResult.decisionQuality.fitQuality,
        analysisResult.decisionQuality.lifestyleQuality,
        analysisResult.decisionQuality.valueAlignment,
        analysisResult.decisionQuality.futurePotential,
        analysisResult.decisionQuality.flexibility,
      ];

      const confidenceResult = this.confidenceEngine.calculateDecisionConfidence(
        profile,
        career,
        fitResult,
        decisionDimensions
      );

      // Check confidence threshold
      if (confidenceResult.overall < this.config.minConfidenceThreshold) {
        return {
          success: false,
          error: 'CONFIDENCE_TOO_LOW',
          errorMessage: `Analysis confidence (${confidenceResult.overall}) below threshold (${this.config.minConfidenceThreshold})`,
          timestamp: new Date(),
        };
      }

      // Build complete decision analysis
      const decisionAnalysis: DecisionAnalysis = {
        decisionId: input.decisionId,
        option: analysisResult.option,
        decisionQuality: analysisResult.decisionQuality,
        confidence: DecisionConfidenceEngine.toDecisionConfidence(confidenceResult),
        advantages: analysisResult.advantages,
        disadvantages: analysisResult.disadvantages,
        risks: analysisResult.risks,
        opportunities: analysisResult.opportunities,
        tradeoffs: analysisResult.tradeoffs,
        explanation: analysisResult.explanation,
        analyzedAt: new Date(),
      };

      return {
        success: true,
        data: decisionAnalysis,
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
   * Compares multiple career decision options.
   *
   * @param input - Comparison input
   * @returns Decision comparison result
   */
  async compareDecisions(
    input: DecisionComparisonInput
  ): Promise<DecisionIntelligenceResult<DecisionComparison>> {
    try {
      // Validate input
      if (!input.options || input.options.length < 2) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'At least two options are required for comparison',
          timestamp: new Date(),
        };
      }

      // Analyze each option
      const analyses: Record<string, DecisionAnalysis> = {};
      const failedOptions: string[] = [];

      for (const option of input.options) {
        const analysisInput: DecisionAnalysisInput = {
          decisionId: `${input.comparisonId}-${option.id}`,
          profileId: input.profileId,
          option,
          context: input.context,
        };

        const result = await this.analyzeDecision(analysisInput);

        if (result.success && result.data) {
          analyses[option.id] = result.data;
        } else {
          failedOptions.push(option.id);
        }
      }

      // Check if we have enough analyses
      if (Object.keys(analyses).length < 2) {
        return {
          success: false,
          error: 'COMPARISON_FAILED',
          errorMessage: `Insufficient analyses for comparison. Failed options: ${failedOptions.join(', ')}`,
          timestamp: new Date(),
        };
      }

      // Build criteria
      const criteria: ComparisonCriteria = input.criteria ?? {
        minConfidence: this.config.minConfidenceThreshold,
        dimensions: [
          'FIT_QUALITY',
          'LIFESTYLE_QUALITY',
          'VALUE_ALIGNMENT',
          'FUTURE_POTENTIAL',
          'FLEXIBILITY',
          'RISK_LEVEL',
          'OVERALL_QUALITY',
        ],
        requireAllDimensions: false,
      };

      // Filter to only analyzed options
      const analyzedOptions = input.options.filter((opt) => analyses[opt.id]);

      // Perform comparison
      const comparison = this.comparisonEngine.compareDecisions(
        input.comparisonId,
        analyzedOptions,
        analyses,
        criteria
      );

      return {
        success: true,
        data: comparison,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'COMPARISON_FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during comparison',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Analyzes confidence for a decision without full analysis.
   *
   * @param profileId - Profile identifier
   * @param careerId - Career identifier
   * @returns Confidence calculation result
   */
  async analyzeConfidence(
    profileId: string,
    careerId: string
  ): Promise<DecisionIntelligenceResult<ConfidenceCalculationResult>> {
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

      // Create placeholder dimensions
      const dimensions = [
        { score: fitResult.overallFitScore, confidence: fitResult.confidence.overall },
        { score: fitResult.breakdown.lifestyle.score, confidence: fitResult.confidence.overall },
        { score: fitResult.breakdown.values.score, confidence: fitResult.confidence.overall },
      ];

      const confidenceResult = this.confidenceEngine.calculateDecisionConfidence(
        profile,
        career,
        fitResult,
        dimensions
      );

      return {
        success: true,
        data: confidenceResult,
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
  getConfig(): DecisionIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<DecisionIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
    this.analyzer = createDecisionAnalyzer(this.config);
    this.confidenceEngine = createDecisionConfidenceEngine(this.config);
    this.comparisonEngine = createDecisionComparisonEngine(this.config);
  }
}

/**
 * Creates a default decision intelligence engine.
 *
 * @param careerProvider - Provider for career data
 * @param profileProvider - Provider for profile data
 * @param config - Optional partial configuration
 * @returns Configured DecisionIntelligenceEngine
 */
export function createDecisionIntelligenceEngine(
  careerProvider: CareerDataProvider,
  profileProvider: ProfileDataProvider,
  config?: Partial<DecisionIntelligenceConfig>
): DecisionIntelligenceEngine {
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

  return new DecisionIntelligenceEngine(fullConfig, careerProvider, profileProvider);
}

/**
 * Default export for the decision intelligence engine module.
 */
export { DecisionAnalyzer, createDecisionAnalyzer } from './decision-analyzer';
export { DecisionConfidenceEngine, createDecisionConfidenceEngine } from './decision-confidence-engine';
export { DecisionComparisonEngine, createDecisionComparisonEngine } from './decision-comparison-engine';
export * from './decision-types';
