/**
 * CareerOS Regret Intelligence Engine
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Main orchestrator for estimating future regret risk
 * in career decisions.
 *
 * @module regret-engine
 * @version 1.0.0
 */

import type {
  RegretAnalysis,
  RegretAnalysisInput,
  RegretIntelligenceConfig,
  RegretIntelligenceResult,
  RegretBreakdown,
  RegretFactor,
  MitigationStrategy,
  RegretSeverity,
} from './regret-types';
import type { CareerIntelligence, CareerId } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { StudentLifeProfile } from '@/types/student-life-profile';
import type { OptionalityAnalysis } from '@/optionality-intelligence/optionality-types';

import { RegretCalculator, createRegretCalculator } from './regret-calculator';
import { RegretScenarioEngine, createRegretScenarioEngine } from './regret-scenario-engine';
import { RegretFactorEngine, createRegretFactorEngine } from './regret-factor-engine';
import { RegretExplanationEngine, createRegretExplanationEngine } from './regret-explanation-engine';
import { calculateRegretSeverity, DEFAULT_REGRET_INTELLIGENCE_CONFIG } from './regret-types';

/**
 * Data provider interface for regret analysis.
 */
interface RegretDataProvider {
  getStudentProfile(profileId: string): Promise<StudentLifeProfile | null>;
  getCareerIntelligence(careerId: CareerId): Promise<CareerIntelligence | null>;
  getCareerFit(profileId: string, careerId: CareerId): Promise<CareerFitResult | null>;
  getOptionalityAnalysis?(profileId: string, careerId: CareerId): Promise<OptionalityAnalysis | null>;
}

/**
 * Main Regret Intelligence Engine.
 *
 * Orchestrates regret calculation, factor identification, scenario generation,
 * mitigation strategy creation, and explanation generation.
 */
export class RegretIntelligenceEngine {
  /** Engine configuration */
  private config: RegretIntelligenceConfig;

  /** Regret calculator */
  private calculator: RegretCalculator;

  /** Scenario engine */
  private scenarioEngine: RegretScenarioEngine;

  /** Factor engine */
  private factorEngine: RegretFactorEngine;

  /** Explanation engine */
  private explanationEngine: RegretExplanationEngine;

  /** Data provider */
  private dataProvider: RegretDataProvider;

  /**
   * Creates a new RegretIntelligenceEngine.
   *
   * @param config - Engine configuration
   * @param dataProvider - Provider for required data
   */
  constructor(
    config: RegretIntelligenceConfig,
    dataProvider: RegretDataProvider
  ) {
    this.config = config;
    this.calculator = createRegretCalculator(config);
    this.scenarioEngine = createRegretScenarioEngine(config);
    this.factorEngine = createRegretFactorEngine(config);
    this.explanationEngine = createRegretExplanationEngine(config);
    this.dataProvider = dataProvider;
  }

  /**
   * Performs complete regret analysis for a career.
   *
   * @param input - Analysis input
   * @returns Regret analysis result
   */
  async analyzeRegret(
    input: RegretAnalysisInput
  ): Promise<RegretIntelligenceResult<RegretAnalysis>> {
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
      const profile = await this.dataProvider.getStudentProfile(input.profileId);
      if (!profile) {
        return {
          success: false,
          error: 'PROFILE_NOT_FOUND',
          errorMessage: `Profile not found: ${input.profileId}`,
          timestamp: new Date(),
        };
      }

      const career = await this.dataProvider.getCareerIntelligence(input.careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${input.careerId}`,
          timestamp: new Date(),
        };
      }

      const fitResult = await this.dataProvider.getCareerFit(
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

      // Get optionality analysis if available
      let optionalityAnalysis: OptionalityAnalysis | undefined;
      if (this.dataProvider.getOptionalityAnalysis) {
        const optResult = await this.dataProvider.getOptionalityAnalysis(
          input.profileId,
          input.careerId
        );
        if (optResult) {
          optionalityAnalysis = optResult;
        }
      }

      // Use provided optionality analysis if no data provider available
      if (!optionalityAnalysis && input.optionalityAnalysis) {
        optionalityAnalysis = input.optionalityAnalysis;
      }

      // Calculate regret breakdown
      const breakdown = this.calculator.calculateRegretBreakdown(
        profile,
        career,
        fitResult,
        optionalityAnalysis
      );

      // Calculate overall regret risk
      const { overallRegretRisk, confidence } = this.calculator.calculateOverallRegretRisk(breakdown);

      // Check confidence threshold
      if (confidence < this.config.minConfidenceThreshold) {
        return {
          success: false,
          error: 'CONFIDENCE_TOO_LOW',
          errorMessage: `Analysis confidence (${confidence}) below threshold (${this.config.minConfidenceThreshold})`,
          timestamp: new Date(),
        };
      }

      // Calculate severity
      const severity = calculateRegretSeverity(overallRegretRisk, this.config.severityThresholds);

      // Identify regret factors
      const majorRegretFactors = this.factorEngine.identifyRegretFactors(
        breakdown,
        career,
        fitResult
      );

      // Generate scenarios
      const scenarios = this.scenarioEngine.generateScenarios(
        overallRegretRisk,
        breakdown,
        career,
        fitResult
      );

      // Generate mitigation strategies
      const mitigationStrategies = this.generateMitigationStrategies(
        breakdown,
        majorRegretFactors,
        career
      );

      // Generate explanation
      const explanation = this.explanationEngine.generateExplanation(
        overallRegretRisk,
        severity,
        breakdown,
        majorRegretFactors,
        scenarios,
        career
      );

      // Build complete analysis
      const regretAnalysis: RegretAnalysis = {
        id: input.analysisId,
        profileId: input.profileId,
        careerId: input.careerId,
        overallRegretRisk,
        confidence,
        severity,
        regretBreakdown: breakdown,
        majorRegretFactors,
        scenarios,
        mitigationStrategies,
        explanation,
        analyzedAt: new Date(),
      };

      return {
        success: true,
        data: regretAnalysis,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'CALCULATION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generates mitigation strategies.
   *
   * @param breakdown - Regret breakdown
   * @param factors - Regret factors
   * @param career - Career intelligence
   * @returns Mitigation strategies
   */
  private generateMitigationStrategies(
    breakdown: RegretBreakdown,
    factors: RegretFactor[],
    career: CareerIntelligence
  ): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];

    // Identity regret mitigation
    if (breakdown.identity.score >= 50) {
      strategies.push({
        id: 'mitigation-identity-1',
        name: 'Strengthen Identity Fit',
        description: 'Find ways to express your authentic self within the career context',
        targetDimension: 'IDENTITY',
        effectiveness: 70,
        difficulty: 60,
        timeframe: 'MEDIUM_TERM',
        actions: [
          'Identify aspects of the career that align with your identity',
          'Seek roles or projects that leverage your strengths',
          'Build a personal brand that reflects your values',
        ],
      });
    }

    // Lifestyle regret mitigation
    if (breakdown.lifestyle.score >= 50) {
      const topGap = breakdown.lifestyle.factors.sort((a, b) => b.gap - a.gap)[0];
      strategies.push({
        id: 'mitigation-lifestyle-1',
        name: `Address ${topGap?.name.replace(/_/g, ' ') ?? 'Lifestyle'} Gap`,
        description: `Improve ${topGap?.name.replace(/_/g, ' ').toLowerCase() ?? 'lifestyle factors'} through negotiation and boundary setting`,
        targetDimension: 'LIFESTYLE',
        effectiveness: 65,
        difficulty: 50,
        timeframe: 'SHORT_TERM',
        actions: [
          'Negotiate flexible arrangements with employers',
          'Set clear boundaries between work and personal life',
          'Explore alternative work arrangements within the field',
        ],
      });
    }

    // Financial regret mitigation
    if (breakdown.financial.score >= 50) {
      strategies.push({
        id: 'mitigation-financial-1',
        name: 'Improve Financial Trajectory',
        description: 'Take steps to enhance earning potential and financial security',
        targetDimension: 'FINANCIAL',
        effectiveness: 75,
        difficulty: 70,
        timeframe: 'LONG_TERM',
        actions: [
          'Develop high-value specialized skills',
          'Build diverse income streams',
          'Strategically negotiate compensation',
        ],
      });
    }

    // Opportunity regret mitigation
    if (breakdown.opportunity.score >= 50) {
      strategies.push({
        id: 'mitigation-opportunity-1',
        name: 'Preserve Optionality',
        description: 'Maintain flexibility and keep future paths open',
        targetDimension: 'OPPORTUNITY',
        effectiveness: 80,
        difficulty: 55,
        timeframe: 'MEDIUM_TERM',
        actions: [
          'Build transferable skills applicable across industries',
          'Maintain relationships across multiple professional networks',
          'Document achievements that demonstrate broad capabilities',
        ],
      });
    }

    // Growth regret mitigation
    if (breakdown.growth.score >= 50) {
      strategies.push({
        id: 'mitigation-growth-1',
        name: 'Accelerate Professional Growth',
        description: 'Create opportunities for continuous learning and challenge',
        targetDimension: 'GROWTH',
        effectiveness: 85,
        difficulty: 50,
        timeframe: 'SHORT_TERM',
        actions: [
          'Seek stretch assignments beyond current role',
          'Pursue additional training or certifications',
          'Take on side projects that develop new capabilities',
        ],
      });
    }

    // Values regret mitigation
    if (breakdown.values.score >= 50) {
      strategies.push({
        id: 'mitigation-values-1',
        name: 'Align Work with Values',
        description: 'Find or create alignment between work and core values',
        targetDimension: 'VALUES',
        effectiveness: 70,
        difficulty: 65,
        timeframe: 'MEDIUM_TERM',
        actions: [
          'Identify specific aspects of work that align with values',
          'Seek roles in organizations with compatible values',
          'Create impact through volunteer or side projects',
        ],
      });
    }

    // Add factor-specific strategies
    factors
      .filter((f) => f.priority === 'PRIMARY')
      .slice(0, 2)
      .forEach((factor, index) => {
        strategies.push({
          id: `mitigation-factor-${index}`,
          name: `Address ${factor.name}`,
          description: this.explanationEngine.generateMitigationExplanation(factor),
          targetDimension: factor.category,
          effectiveness: Math.round(factor.importance * 0.8),
          difficulty: 60,
          timeframe: 'MEDIUM_TERM',
          actions: [
            `Monitor ${factor.name.toLowerCase()} as a key risk indicator`,
            'Develop specific plan to address this factor',
            'Seek support or resources to mitigate impact',
          ],
        });
      });

    return strategies.slice(0, this.config.maxMitigationStrategies);
  }

  /**
   * Gets primary regret factors for a career.
   *
   * @param input - Analysis input
   * @returns Primary factors result
   */
  async getPrimaryRegretFactors(
    input: RegretAnalysisInput
  ): Promise<RegretIntelligenceResult<RegretFactor[]>> {
    const result = await this.analyzeRegret(input);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error,
        errorMessage: result.errorMessage,
        timestamp: result.timestamp,
      };
    }

    const primaryFactors = this.factorEngine.getPrimaryFactors(
      result.data.majorRegretFactors
    );

    return {
      success: true,
      data: primaryFactors,
      timestamp: new Date(),
    };
  }

  /**
   * Compares regret risks across multiple careers.
   *
   * @param profileId - Profile identifier
   * @param careerIds - Array of career identifiers
   * @returns Comparison result
   */
  async compareRegretRisks(
    profileId: string,
    careerIds: CareerId[]
  ): Promise<RegretIntelligenceResult<Array<{ careerId: CareerId; regretRisk: number; severity: RegretSeverity }>>> {
    try {
      if (careerIds.length < 2) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'At least two careers are required for comparison',
          timestamp: new Date(),
        };
      }

      const comparisons: Array<{ careerId: CareerId; regretRisk: number; severity: RegretSeverity }> = [];

      for (const careerId of careerIds) {
        const input: RegretAnalysisInput = {
          analysisId: `compare-${profileId}-${careerId}`,
          profileId,
          careerId,
        };

        const result = await this.analyzeRegret(input);

        if (result.success && result.data) {
          comparisons.push({
            careerId,
            regretRisk: result.data.overallRegretRisk,
            severity: result.data.severity,
          });
        }
      }

      if (comparisons.length < 2) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: 'Could not analyze enough careers for comparison',
          timestamp: new Date(),
        };
      }

      // Sort by regret risk (ascending - lowest regret first)
      comparisons.sort((a, b) => a.regretRisk - b.regretRisk);

      return {
        success: true,
        data: comparisons,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'CALCULATION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during comparison',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets the engine configuration.
   *
   * @returns Current configuration
   */
  getConfig(): RegretIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<RegretIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };
    this.calculator = createRegretCalculator(this.config);
    this.scenarioEngine = createRegretScenarioEngine(this.config);
    this.factorEngine = createRegretFactorEngine(this.config);
    this.explanationEngine = createRegretExplanationEngine(this.config);
  }
}

/**
 * Creates a default regret intelligence engine.
 *
 * @param dataProvider - Provider for required data
 * @param config - Optional partial configuration
 * @returns Configured RegretIntelligenceEngine
 */
export function createRegretIntelligenceEngine(
  dataProvider: RegretDataProvider,
  config?: Partial<RegretIntelligenceConfig>
): RegretIntelligenceEngine {
  const fullConfig: RegretIntelligenceConfig = {
    ...DEFAULT_REGRET_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new RegretIntelligenceEngine(fullConfig, dataProvider);
}

/**
 * Default export for the regret intelligence engine module.
 */
export { RegretCalculator, createRegretCalculator } from './regret-calculator';
export { RegretScenarioEngine, createRegretScenarioEngine } from './regret-scenario-engine';
export { RegretFactorEngine, createRegretFactorEngine } from './regret-factor-engine';
export { RegretExplanationEngine, createRegretExplanationEngine } from './regret-explanation-engine';
export * from './regret-types';
