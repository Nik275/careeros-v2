/**
 * CareerOS Future Simulation Engine - Simulation Explainer
 *
 * Phase D.5: Future Simulation Engine
 *
 * Generates explanations of scenario differences and key factors.
 *
 * @module simulation-explainer
 * @version 1.0.0
 */

import type {
  SimulationExplanation,
  FutureSimulation,
  ScenarioSet,
  ScenarioType,
  KeyDriver,
  UncertaintyModel,
  FutureSimulationConfig,
} from './future-simulation-types';

/**
 * Engine for explaining simulations.
 */
export class SimulationExplainer {
  /** Configuration */
  private config: FutureSimulationConfig;

  /**
   * Creates a new SimulationExplainer.
   *
   * @param config - Configuration
   */
  constructor(config: FutureSimulationConfig) {
    this.config = config;
  }

  /**
   * Generates complete simulation explanation.
   *
   * @param simulation - Future simulation
   * @returns Simulation explanation
   */
  generateExplanation(simulation: FutureSimulation): SimulationExplanation {
    const scenarios = simulation.scenarios[5] ?? Object.values(simulation.scenarios)[0];

    return {
      summary: this.generateSummary(simulation),
      whyScenariosDiffer: this.explainScenarioDifferences(scenarios),
      changingAssumptions: this.identifyChangingAssumptions(scenarios),
      keyFactorsMatterMost: this.identifyKeyFactors(simulation.keyDrivers),
      monitoringGuidance: this.generateMonitoringGuidance(simulation),
    };
  }

  /**
   * Generates simulation summary.
   *
   * @param simulation - Future simulation
   * @returns Summary
   */
  private generateSummary(simulation: FutureSimulation): string {
    const horizonCount = simulation.timeHorizons.length;
    const firstHorizon = Math.min(...simulation.timeHorizons);
    const lastHorizon = Math.max(...simulation.timeHorizons);

    return `This simulation models ${horizonCount} time horizons from ${firstHorizon} to ${lastHorizon} years, presenting optimistic, expected, and pessimistic scenarios. The simulation has an overall confidence of ${simulation.confidence}/100 and is based on ${simulation.keyDrivers.length} key drivers with ${simulation.uncertainties.knownUnknowns.length} identified uncertainties.`;
  }

  /**
   * Explains why scenarios differ.
   *
   * @param scenarios - Scenario set
   * @returns Explanation of differences
   */
  private explainScenarioDifferences(scenarios: ScenarioSet): string[] {
    const differences: string[] = [];

    // Compare dimensions across scenarios
    const optimistic = scenarios.optimistic.dimensions;
    const expected = scenarios.expected.dimensions;
    const pessimistic = scenarios.pessimistic.dimensions;

    // Career growth difference
    const careerGrowthDiff = optimistic.careerGrowth.value - pessimistic.careerGrowth.value;
    if (careerGrowthDiff > 20) {
      differences.push(`Career growth shows significant variation (${careerGrowthDiff} points), driven by promotion speed and opportunity availability`);
    }

    // Income growth difference
    const incomeDiff = optimistic.incomeGrowth.value - pessimistic.incomeGrowth.value;
    if (incomeDiff > 20) {
      differences.push(`Income trajectory varies substantially (${incomeDiff} points) based on performance, promotions, and market conditions`);
    }

    // Skill development difference
    const skillDiff = optimistic.skillDevelopment.value - pessimistic.skillDevelopment.value;
    if (skillDiff > 15) {
      differences.push(`Skill development opportunities differ (${skillDiff} points) depending on project assignments and learning culture`);
    }

    // Work-life balance difference
    const balanceDiff = optimistic.workLifeBalance.value - pessimistic.workLifeBalance.value;
    if (balanceDiff > 15) {
      differences.push(`Work-life balance outcomes vary (${balanceDiff} points) based on role demands and personal boundaries`);
    }

    // Trajectory differences
    differences.push('Alternative career paths branch at different points in each scenario');
    differences.push('Leadership emergence follows different timelines across scenarios');

    return differences;
  }

  /**
   * Identifies changing assumptions across scenarios.
   *
   * @param scenarios - Scenario set
   * @returns Changing assumptions
   */
  private identifyChangingAssumptions(scenarios: ScenarioSet): string[] {
    const assumptions: string[] = [];

    // Compare assumptions
    const optimistic = scenarios.optimistic.assumptions;
    const expected = scenarios.expected.assumptions;
    const pessimistic = scenarios.pessimistic.assumptions;

    // Find unique assumptions
    optimistic.forEach((assumption) => {
      if (!expected.includes(assumption) && !assumption.includes('consistently')) {
        assumptions.push(`Optimistic: ${assumption}`);
      }
    });

    pessimistic.forEach((assumption) => {
      if (!expected.includes(assumption) && !assumption.includes('consistently')) {
        assumptions.push(`Pessimistic: ${assumption}`);
      }
    });

    // Add general changing factors
    assumptions.push('Market conditions: favorable vs. normal vs. challenging');
    assumptions.push('Organizational support: strong vs. adequate vs. limited');
    assumptions.push('Personal performance: exceeds vs. meets vs. faces challenges');
    assumptions.push('Network strength: robust vs. typical vs. constrained');

    return assumptions.slice(0, 6);
  }

  /**
   * Identifies key factors that matter most.
   *
   * @param drivers - Key drivers
   * @returns Key factors
   */
  private identifyKeyFactors(drivers: KeyDriver[]): string[] {
    const factors: string[] = [];

    // Sort by importance
    const sortedDrivers = [...drivers].sort((a, b) => b.importance - a.importance);

    // Top controllable factors
    const controllable = sortedDrivers.filter((d) => d.controllability === 'CONTROLLABLE');
    if (controllable.length > 0) {
      factors.push(`Your ${controllable[0].name.toLowerCase()} is the most important factor you control (${controllable[0].importance}/100 importance)`);
    }

    // Top external factors
    const external = sortedDrivers.filter((d) => d.controllability === 'EXTERNAL');
    if (external.length > 0) {
      factors.push(`${external[0].name} is the most significant external factor (${external[0].importance}/100 importance)`);
    }

    // Skill factors
    const skillDrivers = sortedDrivers.filter((d) => d.category === 'SKILL');
    skillDrivers.slice(0, 2).forEach((driver) => {
      factors.push(`${driver.name} (${driver.importance}/100): ${driver.influence}`);
    });

    // Personal factors
    const personalDrivers = sortedDrivers.filter((d) => d.category === 'PERSONAL');
    personalDrivers.slice(0, 2).forEach((driver) => {
      factors.push(`${driver.name} (${driver.importance}/100): ${driver.influence}`);
    });

    return factors.slice(0, 5);
  }

  /**
   * Generates monitoring guidance.
   *
   * @param simulation - Future simulation
   * @returns Monitoring guidance
   */
  private generateMonitoringGuidance(simulation: FutureSimulation): string[] {
    const guidance: string[] = [];

    guidance.push('Track your actual career progression against the expected scenario timeline');
    guidance.push('Monitor market conditions and industry trends affecting your field');

    // Add guidance based on uncertainties
    simulation.uncertainties.knownUnknowns.slice(0, 2).forEach((unknown) => {
      guidance.push(`Watch for: ${unknown.description}`);
    });

    // Add guidance based on key drivers
    const controllableDrivers = simulation.keyDrivers.filter(
      (d) => d.controllability === 'CONTROLLABLE'
    );
    if (controllableDrivers.length > 0) {
      guidance.push(`Invest in developing: ${controllableDrivers[0].name}`);
    }

    guidance.push('Reassess trajectory annually and adjust plans based on actual outcomes');
    guidance.push('Build flexibility to adapt if pessimistic scenario factors emerge');

    return guidance.slice(0, 5);
  }

  /**
   * Explains a specific scenario.
   *
   * @param scenarioType - Scenario type
   * @param scenarios - Scenario set
   * @returns Scenario explanation
   */
  explainScenario(scenarioType: ScenarioType, scenarios: ScenarioSet): string {
    const scenario = scenarioType === 'OPTIMISTIC'
      ? scenarios.optimistic
      : scenarioType === 'PESSIMISTIC'
        ? scenarios.pessimistic
        : scenarios.expected;

    const parts: string[] = [];

    parts.push(`${scenarioType} SCENARIO (${scenario.timeHorizon} years)`);
    parts.push('');
    parts.push(scenario.description);
    parts.push('');
    parts.push('Key Assumptions:');
    scenario.assumptions.forEach((assumption) => {
      parts.push(`  • ${assumption}`);
    });
    parts.push('');
    parts.push('Dimension Estimates:');
    parts.push(`  Career Growth: ${scenario.dimensions.careerGrowth.value}/100`);
    parts.push(`  Income Growth: ${scenario.dimensions.incomeGrowth.value}/100`);
    parts.push(`  Skill Development: ${scenario.dimensions.skillDevelopment.value}/100`);
    parts.push(`  Work-Life Balance: ${scenario.dimensions.workLifeBalance.value}/100`);

    return parts.join('\n');
  }

  /**
   * Explains uncertainty model.
   *
   * @param uncertainty - Uncertainty model
   * @returns Uncertainty explanation
   */
  explainUncertainty(uncertainty: UncertaintyModel): string[] {
    const explanations: string[] = [];

    explanations.push('UNCERTAINTY MODEL');
    explanations.push('');

    if (uncertainty.knownUnknowns.length > 0) {
      explanations.push('Known Unknowns (what we know we do not know):');
      uncertainty.knownUnknowns.forEach((unknown) => {
        explanations.push(`  • ${unknown.description}`);
        explanations.push(`    Impact: ${unknown.impact}`);
      });
      explanations.push('');
    }

    if (uncertainty.assumptions.length > 0) {
      explanations.push('Key Assumptions:');
      uncertainty.assumptions.forEach((assumption) => {
        explanations.push(`  • ${assumption.statement}`);
        explanations.push(`    Basis: ${assumption.basis}`);
      });
      explanations.push('');
    }

    explanations.push(`Overall Confidence: ${uncertainty.confidenceLimits.overall}/100`);

    return explanations;
  }

  /**
   * Generates comparative analysis between careers.
   *
   * @param simulations - Multiple simulations
   * @returns Comparative analysis
   */
  generateComparativeAnalysis(simulations: FutureSimulation[]): string {
    if (simulations.length < 2) {
      return 'Need at least two simulations for comparison.';
    }

    const parts: string[] = [];
    parts.push('COMPARATIVE CAREER ANALYSIS');
    parts.push('');

    // Compare expected scenarios
    simulations.forEach((sim) => {
      const expected = sim.scenarios[5]?.expected ?? Object.values(sim.scenarios)[0]?.expected;
      if (expected) {
        parts.push(`${sim.careerId}:`);
        parts.push(`  Expected Career Growth: ${expected.dimensions.careerGrowth.value}/100`);
        parts.push(`  Expected Income Growth: ${expected.dimensions.incomeGrowth.value}/100`);
        parts.push(`  Confidence: ${sim.confidence}/100`);
        parts.push('');
      }
    });

    // Find best/worst
    const ranked = simulations
      .map((sim) => ({
        careerId: sim.careerId,
        careerGrowth: sim.scenarios[5]?.expected.dimensions.careerGrowth.value ?? 50,
        incomeGrowth: sim.scenarios[5]?.expected.dimensions.incomeGrowth.value ?? 50,
        balance: sim.scenarios[5]?.expected.dimensions.workLifeBalance.value ?? 50,
      }))
      .sort((a, b) => (b.careerGrowth + b.incomeGrowth) - (a.careerGrowth + a.incomeGrowth));

    parts.push(`Highest Combined Potential: ${ranked[0].careerId}`);
    parts.push(`Best Work-Life Balance: ${ranked.sort((a, b) => b.balance - a.balance)[0].careerId}`);

    return parts.join('\n');
  }
}

/**
 * Creates a default simulation explainer.
 *
 * @param config - Optional partial configuration
 * @returns Configured SimulationExplainer
 */
export function createSimulationExplainer(
  config?: Partial<FutureSimulationConfig>
): SimulationExplainer {
  const fullConfig: FutureSimulationConfig = {
    ...import('./future-simulation-types').DEFAULT_FUTURE_SIMULATION_CONFIG,
    ...config,
  };

  return new SimulationExplainer(fullConfig);
}
