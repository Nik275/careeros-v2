/**
 * CareerOS Future Simulation Engine
 *
 * Phase D.5: Future Simulation Engine
 *
 * Main orchestrator for simulating plausible future career outcomes.
 *
 * @module future-simulation-engine
 * @version 1.0.0
 */

import type {
  FutureSimulation,
  FutureSimulationInput,
  FutureSimulationResult,
  ScenarioSet,
  TimeHorizon,
  KeyDriver,
  UncertaintyModel,
  KnownUnknown,
  SimulationAssumption,
  ConfidenceLimits,
  SensitivityAnalysis,
  SimulationExplanation,
  FutureSimulationConfig,
} from './future-simulation-types';
import type { CareerIntelligence, CareerId } from '@/career-intelligence/career-types';

import { TrajectoryEngine, createTrajectoryEngine } from './trajectory-engine';
import { OutcomeEngine, createOutcomeEngine } from './outcome-engine';
import { ScenarioGenerator, createScenarioGenerator } from './scenario-generator';
import { SimulationExplainer, createSimulationExplainer } from './simulation-explainer';
import { DEFAULT_FUTURE_SIMULATION_CONFIG } from './future-simulation-types';

/**
 * Data provider interface for future simulation.
 */
interface SimulationDataProvider {
  getCareerIntelligence(careerId: CareerId): Promise<CareerIntelligence | null>;
}

/**
 * Main Future Simulation Engine.
 *
 * Orchestrates trajectory generation, outcome estimation, scenario creation,
 * uncertainty modeling, and explanation generation.
 */
export class FutureSimulationEngine {
  /** Engine configuration */
  private config: FutureSimulationConfig;

  /** Trajectory engine */
  private trajectoryEngine: TrajectoryEngine;

  /** Outcome engine */
  private outcomeEngine: OutcomeEngine;

  /** Scenario generator */
  private scenarioGenerator: ScenarioGenerator;

  /** Simulation explainer */
  private simulationExplainer: SimulationExplainer;

  /** Data provider */
  private dataProvider: SimulationDataProvider;

  /**
   * Creates a new FutureSimulationEngine.
   *
   * @param config - Engine configuration
   * @param dataProvider - Provider for career data
   */
  constructor(
    config: FutureSimulationConfig,
    dataProvider: SimulationDataProvider
  ) {
    this.config = config;
    this.trajectoryEngine = createTrajectoryEngine(config);
    this.outcomeEngine = createOutcomeEngine(config);
    this.scenarioGenerator = createScenarioGenerator(config);
    this.simulationExplainer = createSimulationExplainer(config);
    this.dataProvider = dataProvider;
  }

  /**
   * Performs complete future simulation for a career.
   *
   * @param input - Simulation input
   * @returns Future simulation result
   */
  async simulateFuture(
    input: FutureSimulationInput
  ): Promise<FutureSimulationResult<FutureSimulation>> {
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

      // Fetch career data
      const career = await this.dataProvider.getCareerIntelligence(input.careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${input.careerId}`,
          timestamp: new Date(),
        };
      }

      // Determine time horizons
      const timeHorizons = input.timeHorizons ?? this.config.defaultTimeHorizons;

      // Generate scenarios for each time horizon
      const scenarios: Record<TimeHorizon, ScenarioSet> = {} as Record<TimeHorizon, ScenarioSet>;

      for (const horizon of timeHorizons) {
        // Generate trajectory for expected scenario (primary)
        const trajectory = this.trajectoryEngine.generateTrajectory(
          career,
          horizon,
          'EXPECTED'
        );

        // Generate outcomes for expected scenario
        const outcomes = this.outcomeEngine.generateOutcomes(
          career,
          horizon,
          'EXPECTED'
        );

        // Generate scenario set
        scenarios[horizon] = this.scenarioGenerator.generateScenarioSet(
          career,
          trajectory,
          outcomes,
          horizon
        );
      }

      // Identify key drivers
      const keyDrivers = this.outcomeEngine.identifyKeyDrivers(career);

      // Generate uncertainty model
      const uncertainties = this.generateUncertaintyModel(career, keyDrivers);

      // Calculate overall confidence
      const confidence = this.calculateOverallConfidence(career, uncertainties);

      // Check confidence threshold
      if (confidence < this.config.minConfidenceThreshold) {
        return {
          success: false,
          error: 'CONFIDENCE_TOO_LOW',
          errorMessage: `Simulation confidence (${confidence}) below threshold (${this.config.minConfidenceThreshold})`,
          timestamp: new Date(),
        };
      }

      // Build simulation
      const simulation: FutureSimulation = {
        id: input.simulationId,
        profileId: input.profileId,
        careerId: input.careerId,
        confidence,
        timeHorizons,
        scenarios,
        keyDrivers,
        uncertainties,
        simulatedAt: new Date(),
      };

      return {
        success: true,
        data: simulation,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'SIMULATION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generates uncertainty model.
   *
   * @param career - Career intelligence
   * @param drivers - Key drivers
   * @returns Uncertainty model
   */
  private generateUncertaintyModel(
    career: CareerIntelligence,
    drivers: KeyDriver[]
  ): UncertaintyModel {
    const knownUnknowns: KnownUnknown[] = [];
    const assumptions: SimulationAssumption[] = [];

    // Known unknowns
    knownUnknowns.push({
      id: 'unknown-market',
      description: 'Future market conditions and economic cycles',
      impact: 'Affects job availability, compensation, and career stability',
      confidence: 30,
    });

    knownUnknowns.push({
      id: 'unknown-technology',
      description: 'Rate and direction of technological change in the field',
      impact: 'May create new opportunities or obsolete existing skills',
      confidence: 40,
    });

    knownUnknowns.push({
      id: 'unknown-personal',
      description: 'Future personal circumstances and priorities',
      impact: 'May change what you want from a career',
      confidence: 25,
    });

    knownUnknowns.push({
      id: 'unknown-organizations',
      description: 'Future employer landscape and opportunities',
      impact: 'Affects available positions and career paths',
      confidence: 35,
    });

    // Key assumptions
    assumptions.push({
      id: 'assumption-performance',
      statement: 'Performance will be at least at expected levels',
      basis: 'Based on student profile and career fit analysis',
      riskIfWrong: 'Career progression may be slower than simulated',
    });

    assumptions.push({
      id: 'assumption-health',
      statement: 'Health and personal circumstances remain stable',
      basis: 'Assumption for planning purposes',
      riskIfWrong: 'Career interruptions or changes may occur',
    });

    assumptions.push({
      id: 'assumption-industry',
      statement: 'Industry continues to exist and employ people in similar roles',
      basis: 'Current industry trajectory and market analysis',
      riskIfWrong: 'May need to transition to different field',
    });

    assumptions.push({
      id: 'assumption-skills',
      statement: 'Core skills remain relevant and valuable',
      basis: 'Analysis of skill durability and transferability',
      riskIfWrong: 'Additional skill development may be needed',
    });

    // Confidence limits
    const confidenceLimits: ConfidenceLimits = {
      overall: career.evidence.overallConfidence,
      byHorizon: {
        1: Math.round(career.evidence.overallConfidence * 0.9),
        3: Math.round(career.evidence.overallConfidence * 0.8),
        5: Math.round(career.evidence.overallConfidence * 0.7),
        10: Math.round(career.evidence.overallConfidence * 0.55),
        20: Math.round(career.evidence.overallConfidence * 0.4),
      },
      byDimension: {
        careerGrowth: career.careerAdvantages.careerMobility?.score ?? 50,
        incomeGrowth: career.careerAdvantages.salaryGrowth?.score ?? 50,
        skillDevelopment: career.careerAdvantages.skillDevelopment?.score ?? 50,
        workLifeBalance: career.careerAdvantages.workLifeIntegration?.score ?? 50,
      },
    };

    // Sensitivity analysis
    const sensitivity: SensitivityAnalysis = {
      highImpactFactors: drivers
        .filter((d) => d.importance >= 75)
        .map((d) => d.name),
      moderateImpactFactors: drivers
        .filter((d) => d.importance >= 60 && d.importance < 75)
        .map((d) => d.name),
      lowImpactFactors: drivers
        .filter((d) => d.importance < 60)
        .map((d) => d.name),
      scenarioBoundaries: {
        optimisticConditions: [
          'Consistently high performance',
          'Favorable market conditions',
          'Strong organizational support',
          'Personal circumstances remain positive',
        ],
        expectedConditions: [
          'Performance meets expectations',
          'Normal market fluctuations',
          'Adequate organizational support',
          'Typical life events',
        ],
        pessimisticConditions: [
          'Performance faces challenges',
          'Difficult market conditions',
          'Limited organizational support',
          'Personal setbacks occur',
        ],
      },
    };

    return {
      knownUnknowns: knownUnknowns.slice(0, this.config.maxUncertainties),
      assumptions,
      confidenceLimits,
      sensitivity,
    };
  }

  /**
   * Calculates overall simulation confidence.
   *
   * @param career - Career intelligence
   * @param uncertainties - Uncertainty model
   * @returns Overall confidence (0-100)
   */
  private calculateOverallConfidence(
    career: CareerIntelligence,
    uncertainties: UncertaintyModel
  ): number {
    // Base confidence from career evidence
    let confidence = career.evidence.overallConfidence;

    // Adjust for uncertainty
    const uncertaintyLevel = uncertainties.knownUnknowns.reduce(
      (sum, u) => sum + (100 - u.confidence),
      0
    ) / Math.max(1, uncertainties.knownUnknowns.length);

    // Reduce confidence based on uncertainty (but keep minimum)
    confidence = Math.round(confidence * (1 - uncertaintyLevel / 200));

    return Math.max(30, Math.min(100, confidence));
  }

  /**
   * Generates explanation for a simulation.
   *
   * @param simulation - Future simulation
   * @returns Simulation explanation
   */
  generateExplanation(simulation: FutureSimulation): SimulationExplanation {
    return this.simulationExplainer.generateExplanation(simulation);
  }

  /**
   * Compares multiple career simulations.
   *
   * @param profileId - Profile identifier
   * @param careerIds - Array of career identifiers
   * @returns Comparison result
   */
  async compareSimulations(
    profileId: string,
    careerIds: CareerId[]
  ): Promise<FutureSimulationResult<FutureSimulation[]>> {
    try {
      if (careerIds.length < 2) {
        return {
          success: false,
          error: 'INVALID_INPUT',
          errorMessage: 'At least two careers are required for comparison',
          timestamp: new Date(),
        };
      }

      const simulations: FutureSimulation[] = [];

      for (const careerId of careerIds) {
        const input: FutureSimulationInput = {
          simulationId: `compare-${profileId}-${careerId}`,
          profileId,
          careerId,
        };

        const result = await this.simulateFuture(input);

        if (result.success && result.data) {
          simulations.push(result.data);
        }
      }

      if (simulations.length < 2) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          errorMessage: 'Could not simulate enough careers for comparison',
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: simulations,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'SIMULATION_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error during comparison',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets trajectory analysis for a career.
   *
   * @param careerId - Career identifier
   * @param timeHorizon - Time horizon
   * @returns Trajectory analysis result
   */
  async getTrajectoryAnalysis(
    careerId: CareerId,
    timeHorizon: TimeHorizon
  ): Promise<FutureSimulationResult<import('./future-simulation-types').TrajectoryAnalysis>> {
    try {
      const career = await this.dataProvider.getCareerIntelligence(careerId);
      if (!career) {
        return {
          success: false,
          error: 'CAREER_NOT_FOUND',
          errorMessage: `Career not found: ${careerId}`,
          timestamp: new Date(),
        };
      }

      const analysis = this.trajectoryEngine.generateTrajectoryAnalysis(
        career,
        timeHorizon
      );

      return {
        success: true,
        data: analysis,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'SIMULATION_ERROR',
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
  getConfig(): FutureSimulationConfig {
    return { ...this.config };
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<FutureSimulationConfig>): void {
    this.config = { ...this.config, ...config };
    this.trajectoryEngine = createTrajectoryEngine(this.config);
    this.outcomeEngine = createOutcomeEngine(this.config);
    this.scenarioGenerator = createScenarioGenerator(this.config);
    this.simulationExplainer = createSimulationExplainer(this.config);
  }
}

/**
 * Creates a default future simulation engine.
 *
 * @param dataProvider - Provider for career data
 * @param config - Optional partial configuration
 * @returns Configured FutureSimulationEngine
 */
export function createFutureSimulationEngine(
  dataProvider: SimulationDataProvider,
  config?: Partial<FutureSimulationConfig>
): FutureSimulationEngine {
  const fullConfig: FutureSimulationConfig = {
    ...DEFAULT_FUTURE_SIMULATION_CONFIG,
    ...config,
  };

  return new FutureSimulationEngine(fullConfig, dataProvider);
}

/**
 * Default export for the future simulation engine module.
 */
export { TrajectoryEngine, createTrajectoryEngine } from './trajectory-engine';
export { OutcomeEngine, createOutcomeEngine } from './outcome-engine';
export { ScenarioGenerator, createScenarioGenerator } from './scenario-generator';
export { SimulationExplainer, createSimulationExplainer } from './simulation-explainer';
export * from './future-simulation-types';
