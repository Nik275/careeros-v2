/**
 * CareerOS Future Simulation Engine - Scenario Generator
 *
 * Phase D.5: Future Simulation Engine
 *
 * Generates optimistic, expected, and pessimistic scenarios.
 *
 * @module scenario-generator
 * @version 1.0.0
 */

import type {
  CareerScenario,
  ScenarioSet,
  ScenarioDimensions,
  DimensionEstimate,
  ScenarioComparison,
  ScenarioType,
  TimeHorizon,
  LikelihoodEstimate,
  FutureSimulationConfig,
} from './future-simulation-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerTrajectory } from './future-simulation-types';
import type { ScenarioOutcomes } from './future-simulation-types';

/**
 * Engine for generating scenarios.
 */
export class ScenarioGenerator {
  /** Configuration */
  private config: FutureSimulationConfig;

  /**
   * Creates a new ScenarioGenerator.
   *
   * @param config - Configuration
   */
  constructor(config: FutureSimulationConfig) {
    this.config = config;
  }

  /**
   * Generates scenario set for a time horizon.
   *
   * @param career - Career intelligence
   * @param trajectory - Career trajectory
   * @param outcomes - Scenario outcomes
   * @param timeHorizon - Time horizon
   * @returns Scenario set
   */
  generateScenarioSet(
    career: CareerIntelligence,
    trajectory: CareerTrajectory,
    outcomes: ScenarioOutcomes,
    timeHorizon: TimeHorizon
  ): ScenarioSet {
    return {
      timeHorizon,
      optimistic: this.generateScenario(
        'OPTIMISTIC',
        career,
        trajectory,
        outcomes,
        timeHorizon
      ),
      expected: this.generateScenario(
        'EXPECTED',
        career,
        trajectory,
        outcomes,
        timeHorizon
      ),
      pessimistic: this.generateScenario(
        'PESSIMISTIC',
        career,
        trajectory,
        outcomes,
        timeHorizon
      ),
      comparison: this.generateComparison(timeHorizon),
    };
  }

  /**
   * Generates a single scenario.
   *
   * @param type - Scenario type
   * @param career - Career intelligence
   * @param trajectory - Career trajectory
   * @param outcomes - Scenario outcomes
   * @param timeHorizon - Time horizon
   * @returns Career scenario
   */
  private generateScenario(
    type: ScenarioType,
    career: CareerIntelligence,
    trajectory: CareerTrajectory,
    outcomes: ScenarioOutcomes,
    timeHorizon: TimeHorizon
  ): CareerScenario {
    return {
      type,
      description: this.generateScenarioDescription(type, career, timeHorizon),
      timeHorizon,
      dimensions: this.generateDimensions(type, career, timeHorizon),
      trajectory,
      outcomes,
      assumptions: this.generateAssumptions(type, career),
      likelihood: this.calculateScenarioLikelihood(type),
    };
  }

  /**
   * Generates scenario description.
   *
   * @param type - Scenario type
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @returns Scenario description
   */
  private generateScenarioDescription(
    type: ScenarioType,
    career: CareerIntelligence,
    timeHorizon: TimeHorizon
  ): string {
    const title = career.careerTitle;

    switch (type) {
      case 'OPTIMISTIC':
        return `In the optimistic scenario for ${title}, favorable conditions align over the ${timeHorizon}-year horizon. You progress faster than average, encounter unexpected opportunities, and achieve outcomes above typical expectations. This scenario assumes positive market conditions, strong organizational fit, and your continued high performance.`;

      case 'EXPECTED':
        return `In the expected scenario for ${title}, career progression follows typical patterns over the ${timeHorizon}-year horizon. You advance at a standard pace, face normal challenges and opportunities, and achieve outcomes consistent with career averages. This scenario represents the most likely outcome based on current trajectory.`;

      case 'PESSIMISTIC':
        return `In the pessimistic scenario for ${title}, various challenges emerge over the ${timeHorizon}-year horizon. Progress is slower than hoped, obstacles appear, and outcomes fall below initial expectations. This scenario assumes difficult market conditions, organizational challenges, or personal setbacks.`;

      default:
        return `Scenario for ${title} over ${timeHorizon} years.`;
    }
  }

  /**
   * Generates scenario dimensions.
   *
   * @param type - Scenario type
   * @param career - Career intelligence
   * @param timeHorizon - Time horizon
   * @returns Scenario dimensions
   */
  private generateDimensions(
    type: ScenarioType,
    career: CareerIntelligence,
    timeHorizon: TimeHorizon
  ): ScenarioDimensions {
    // Base values from career intelligence
    const baseCareerGrowth = career.careerAdvantages.careerMobility?.score ?? 50;
    const baseIncomeGrowth = career.careerAdvantages.salaryGrowth?.score ?? 50;
    const baseSkillDevelopment = career.careerAdvantages.skillDevelopment?.score ?? 50;
    const baseCareerMobility = career.careerAdvantages.optionality?.score ?? 50;
    const baseWorkLife = career.careerAdvantages.workLifeIntegration?.score ?? 50;
    const baseRecognition = career.careerAdvantages.recognitionPotential?.score ?? 50;

    // Calculate time decay (less certainty further out)
    const timeDecay = 1 - (timeHorizon / 40);

    // Apply scenario adjustments
    const adjustment = type === 'OPTIMISTIC' ? 20 : type === 'PESSIMISTIC' ? -15 : 0;

    return {
      careerGrowth: this.createDimensionEstimate(
        baseCareerGrowth + adjustment,
        timeDecay,
        ['Performance', 'Visibility', 'Organizational growth', 'Market conditions']
      ),
      incomeGrowth: this.createDimensionEstimate(
        baseIncomeGrowth + adjustment,
        timeDecay,
        ['Performance', 'Promotions', 'Market rates', 'Negotiation']
      ),
      lifestyleEvolution: this.createDimensionEstimate(
        baseWorkLife + (type === 'OPTIMISTIC' ? 10 : type === 'PESSIMISTIC' ? -10 : 0),
        timeDecay,
        ['Role seniority', 'Organization culture', 'Personal boundaries', 'Industry norms']
      ),
      skillDevelopment: this.createDimensionEstimate(
        baseSkillDevelopment + (type === 'OPTIMISTIC' ? 15 : type === 'PESSIMISTIC' ? -10 : 5),
        timeDecay,
        ['Learning opportunities', 'Challenging projects', 'Training access', 'Mentorship']
      ),
      careerMobility: this.createDimensionEstimate(
        baseCareerMobility + adjustment * 0.8,
        timeDecay,
        ['Skill transferability', 'Network strength', 'Market demand', 'Geographic flexibility']
      ),
      leadershipPotential: this.createDimensionEstimate(
        baseRecognition + adjustment * 0.7,
        timeDecay,
        ['Leadership opportunities', 'Team growth', 'Organizational trust', 'Communication skills']
      ),
      entrepreneurshipPotential: this.createDimensionEstimate(
        (baseCareerMobility + baseSkillDevelopment) / 2 + adjustment * 0.6,
        timeDecay,
        ['Industry expertise', 'Network', 'Financial cushion', 'Risk tolerance']
      ),
      workLifeBalance: this.createDimensionEstimate(
        baseWorkLife + (type === 'OPTIMISTIC' ? 10 : type === 'PESSIMISTIC' ? -15 : 0),
        timeDecay,
        ['Role demands', 'Organizational culture', 'Personal priorities', 'Efficiency']
      ),
    };
  }

  /**
   * Creates dimension estimate.
   *
   * @param baseValue - Base value
   * @param confidenceDecay - Confidence decay factor
   * @param factors - Key factors
   * @returns Dimension estimate
   */
  private createDimensionEstimate(
    baseValue: number,
    confidenceDecay: number,
    factors: string[]
  ): DimensionEstimate {
    const value = Math.max(0, Math.min(100, Math.round(baseValue)));
    const confidence = Math.round(70 * confidenceDecay);

    return {
      value,
      confidence,
      range: {
        min: Math.max(0, value - 20),
        max: Math.min(100, value + 20),
        likely: value,
      },
      factors,
    };
  }

  /**
   * Generates scenario assumptions.
   *
   * @param type - Scenario type
   * @param career - Career intelligence
   * @returns Scenario assumptions
   */
  private generateAssumptions(
    type: ScenarioType,
    career: CareerIntelligence
  ): string[] {
    const assumptions: string[] = [];

    switch (type) {
      case 'OPTIMISTIC':
        assumptions.push('Performance consistently exceeds expectations');
        assumptions.push('Favorable market and economic conditions');
        assumptions.push('Strong organizational fit and support');
        assumptions.push('Key mentors and sponsors are available');
        assumptions.push('Health and personal circumstances remain stable');
        break;

      case 'EXPECTED':
        assumptions.push('Performance meets expectations');
        assumptions.push('Normal market fluctuations');
        assumptions.push('Adequate organizational support');
        assumptions.push('Some mentorship available');
        assumptions.push('Typical life events and transitions');
        break;

      case 'PESSIMISTIC':
        assumptions.push('Performance faces unexpected challenges');
        assumptions.push('Difficult market or economic conditions');
        assumptions.push('Organizational changes or instability');
        assumptions.push('Limited mentorship or support');
        assumptions.push('Personal setbacks or health issues');
        break;
    }

    // Add career-specific assumptions
    const category = career.metadata.category.toUpperCase();
    if (category === 'TECHNOLOGY' || category === 'ENGINEERING') {
      assumptions.push(type === 'OPTIMISTIC'
        ? 'Technology skills remain in high demand'
        : type === 'PESSIMISTIC'
          ? 'Some skill obsolescence occurs'
          : 'Technology landscape evolves as expected');
    }

    return assumptions.slice(0, 5);
  }

  /**
   * Calculates scenario likelihood.
   *
   * @param type - Scenario type
   * @returns Likelihood estimate
   */
  private calculateScenarioLikelihood(type: ScenarioType): LikelihoodEstimate {
    switch (type) {
      case 'OPTIMISTIC':
        return 'POSSIBLE';
      case 'EXPECTED':
        return 'LIKELY';
      case 'PESSIMISTIC':
        return 'UNLIKELY';
      default:
        return 'POSSIBLE';
    }
  }

  /**
   * Generates scenario comparison.
   *
   * @param timeHorizon - Time horizon
   * @returns Scenario comparison
   */
  private generateComparison(timeHorizon: TimeHorizon): ScenarioComparison {
    return {
      keyDifferences: [
        `Career progression speed varies significantly across scenarios`,
        `Income growth trajectories diverge over ${timeHorizon} years`,
        `Skill development opportunities differ in availability`,
        `Leadership emergence follows different timelines`,
      ],
      changingFactors: [
        'Market conditions and economic cycles',
        'Organizational health and support',
        'Personal performance and circumstances',
        'Industry evolution and demand',
        'Network strength and mentorship quality',
      ],
      consistentFactors: [
        'Fundamental career structure and progression paths',
        'Core skill requirements for the field',
        'Industry-specific challenges and opportunities',
        'Basic lifestyle trade-offs of the career',
      ],
      sensitiveAssumptions: [
        'Continued relevance of current skills',
        'Organizational stability and growth',
        'Personal health and family circumstances',
        'Geographic and mobility preferences',
      ],
    };
  }

  /**
   * Generates uncertainty-adjusted scenarios.
   *
   * @param baseScenarios - Base scenarios
   * @param uncertaintyLevel - Uncertainty level (0-100)
   * @returns Adjusted scenarios
   */
  adjustForUncertainty(
    baseScenarios: ScenarioSet,
    uncertaintyLevel: number
  ): ScenarioSet {
    const adjustment = uncertaintyLevel / 100;

    return {
      timeHorizon: baseScenarios.timeHorizon,
      optimistic: this.widenRanges(baseScenarios.optimistic, adjustment),
      expected: this.widenRanges(baseScenarios.expected, adjustment),
      pessimistic: this.widenRanges(baseScenarios.pessimistic, adjustment),
      comparison: {
        ...baseScenarios.comparison,
        sensitiveAssumptions: [
          ...baseScenarios.comparison.sensitiveAssumptions,
          `High uncertainty (${uncertaintyLevel}%) widens all outcome ranges`,
        ],
      },
    };
  }

  /**
   * Widens ranges in scenario for uncertainty.
   *
   * @param scenario - Career scenario
   * @param adjustment - Uncertainty adjustment (0-1)
   * @returns Adjusted scenario
   */
  private widenRanges(scenario: CareerScenario, adjustment: number): CareerScenario {
    const widenRange = (range: { min: number; max: number; likely: number }) => ({
      min: Math.max(0, range.min - 15 * adjustment),
      max: Math.min(100, range.max + 15 * adjustment),
      likely: range.likely,
    });

    return {
      ...scenario,
      dimensions: {
        careerGrowth: {
          ...scenario.dimensions.careerGrowth,
          confidence: Math.round(scenario.dimensions.careerGrowth.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.careerGrowth.range),
        },
        incomeGrowth: {
          ...scenario.dimensions.incomeGrowth,
          confidence: Math.round(scenario.dimensions.incomeGrowth.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.incomeGrowth.range),
        },
        lifestyleEvolution: {
          ...scenario.dimensions.lifestyleEvolution,
          confidence: Math.round(scenario.dimensions.lifestyleEvolution.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.lifestyleEvolution.range),
        },
        skillDevelopment: {
          ...scenario.dimensions.skillDevelopment,
          confidence: Math.round(scenario.dimensions.skillDevelopment.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.skillDevelopment.range),
        },
        careerMobility: {
          ...scenario.dimensions.careerMobility,
          confidence: Math.round(scenario.dimensions.careerMobility.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.careerMobility.range),
        },
        leadershipPotential: {
          ...scenario.dimensions.leadershipPotential,
          confidence: Math.round(scenario.dimensions.leadershipPotential.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.leadershipPotential.range),
        },
        entrepreneurshipPotential: {
          ...scenario.dimensions.entrepreneurshipPotential,
          confidence: Math.round(scenario.dimensions.entrepreneurshipPotential.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.entrepreneurshipPotential.range),
        },
        workLifeBalance: {
          ...scenario.dimensions.workLifeBalance,
          confidence: Math.round(scenario.dimensions.workLifeBalance.confidence * (1 - adjustment * 0.3)),
          range: widenRange(scenario.dimensions.workLifeBalance.range),
        },
      },
    };
  }
}

/**
 * Creates a default scenario generator.
 *
 * @param config - Optional partial configuration
 * @returns Configured ScenarioGenerator
 */
export function createScenarioGenerator(
  config?: Partial<FutureSimulationConfig>
): ScenarioGenerator {
  const fullConfig: FutureSimulationConfig = {
    ...import('./future-simulation-types').DEFAULT_FUTURE_SIMULATION_CONFIG,
    ...config,
  };

  return new ScenarioGenerator(fullConfig);
}
