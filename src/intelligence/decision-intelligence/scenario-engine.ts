/**
 * Scenario Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 8
 *
 * Simulates multiple futures for each decision option.
 * Generates Path A, Path B, Path C with projections across dimensions.
 *
 * @module scenario-engine
 * @version 1.0.0
 */

import {
  ScenarioForecast,
  ScenarioComparison,
  ScenarioProjections,
  DecisionInput,
  DecisionOption,
  ScenarioEngineConfig,
} from './decision-types';
import { calculateAggregateProjectionScore } from './decision-model';

/**
 * Scenario Engine implementation
 */
export class ScenarioEngine {
  private config: ScenarioEngineConfig;

  constructor(config?: Partial<ScenarioEngineConfig>) {
    this.config = {
      numScenarios: 3,
      timeframe: 10,
      confidenceIntervals: true,
      includeOutliers: false,
      sensitivityAnalysis: true,
      ...config,
    };
  }

  /**
   * Generate scenario forecasts for a decision option
   */
  generateScenarios(
    input: DecisionInput,
    option: DecisionOption
  ): ScenarioComparison {
    const scenarios: ScenarioForecast[] = [];

    // Generate optimistic scenario
    scenarios.push(this.generateOptimisticScenario(input, option));

    // Generate realistic scenario
    scenarios.push(this.generateRealisticScenario(input, option));

    // Generate pessimistic scenario
    scenarios.push(this.generatePessimisticScenario(input, option));

    // Identify best, worst, and most likely
    const sortedByFit = [...scenarios].sort(
      (a, b) => b.projections.studentFit - a.projections.studentFit
    );

    const bestCase = sortedByFit[0];
    const worstCase = sortedByFit[sortedByFit.length - 1];

    // Most likely is typically the realistic scenario (middle)
    const mostLikely =
      scenarios.find((s) => s.name === 'Realistic') || scenarios[1];

    // Build comparison table
    const comparisonTable = this.buildComparisonTable(scenarios);

    return {
      scenarios,
      bestCase,
      worstCase,
      mostLikely,
      comparisonTable,
    };
  }

  /**
   * Generate optimistic scenario
   */
  private generateOptimisticScenario(
    input: DecisionInput,
    option: DecisionOption
  ): ScenarioForecast {
    const projections: ScenarioProjections = {
      incomePotential: this.adjustProjection(75, 1.3),
      fulfillmentPotential: this.adjustProjection(80, 1.2),
      futureRelevance: this.adjustProjection(70, 1.25),
      optionality: this.adjustProjection(65, 1.3),
      lifestyleCompatibility: this.adjustProjection(75, 1.2),
      growthPotential: this.adjustProjection(80, 1.3),
      regretRisk: this.adjustProjection(30, 0.6),
      burnoutRisk: this.adjustProjection(25, 0.6),
      studentFit: this.adjustProjection(75, 1.25),
    };

    return {
      id: `scenario-optimistic-${option.id}`,
      name: 'Optimistic',
      optionId: option.id,
      description: `An optimistic future where things go better than expected. ${option.label} exceeds projections.`,
      timeframe: this.config.timeframe,
      projections,
      likelihood: 20,
      keyAssumptions: [
        'Market conditions remain favorable',
        'Personal performance exceeds expectations',
        'No major external disruptions',
      ],
      criticalVariables: ['Market demand', 'Personal health', 'Economic climate'],
      warningSignals: [
        'Overconfidence leading to poor decisions',
        'Neglecting risk management',
      ],
    };
  }

  /**
   * Generate realistic scenario
   */
  private generateRealisticScenario(
    input: DecisionInput,
    option: DecisionOption
  ): ScenarioForecast {
    const projections: ScenarioProjections = {
      incomePotential: this.calculateIncomeProjection(option, input),
      fulfillmentPotential: this.calculateFulfillmentProjection(option, input),
      futureRelevance: this.calculateRelevanceProjection(option),
      optionality: this.calculateOptionalityProjection(option),
      lifestyleCompatibility: this.calculateLifestyleProjection(option, input),
      growthPotential: this.calculateGrowthProjection(option),
      regretRisk: this.calculateRegretProjection(option, input),
      burnoutRisk: this.calculateBurnoutProjection(option, input),
      studentFit: this.calculateFitProjection(option, input),
    };

    return {
      id: `scenario-realistic-${option.id}`,
      name: 'Realistic',
      optionId: option.id,
      description: `The most likely outcome based on current information. ${option.label} performs as expected.`,
      timeframe: this.config.timeframe,
      projections,
      likelihood: 60,
      keyAssumptions: [
        'Average market conditions',
        'Normal personal performance',
        'Typical career progression',
      ],
      criticalVariables: [
        'Skill development',
        'Network building',
        'Market timing',
      ],
      warningSignals: [
        'Deviation from expected milestones',
        'Changing personal priorities',
      ],
    };
  }

  /**
   * Generate pessimistic scenario
   */
  private generatePessimisticScenario(
    input: DecisionInput,
    option: DecisionOption
  ): ScenarioForecast {
    const projections: ScenarioProjections = {
      incomePotential: this.adjustProjection(60, 0.7),
      fulfillmentPotential: this.adjustProjection(65, 0.75),
      futureRelevance: this.adjustProjection(60, 0.7),
      optionality: this.adjustProjection(55, 0.7),
      lifestyleCompatibility: this.adjustProjection(60, 0.75),
      growthPotential: this.adjustProjection(60, 0.7),
      regretRisk: this.adjustProjection(40, 1.5),
      burnoutRisk: this.adjustProjection(35, 1.4),
      studentFit: this.adjustProjection(60, 0.75),
    };

    return {
      id: `scenario-pessimistic-${option.id}`,
      name: 'Pessimistic',
      optionId: option.id,
      description: `A challenging future where things are harder than expected. ${option.label} faces headwinds.`,
      timeframe: this.config.timeframe,
      projections,
      likelihood: 20,
      keyAssumptions: [
        'Market downturn or disruption',
        'Personal challenges or setbacks',
        'Increased competition',
      ],
      criticalVariables: [
        'Economic resilience',
        'Adaptability',
        'Support systems',
      ],
      warningSignals: [
        'Early signs of market decline',
        'Decreasing engagement',
        'Health or wellbeing issues',
      ],
    };
  }

  /**
   * Calculate income projection
   */
  private calculateIncomeProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    const baseIncome = option.financialImplications.expectedIncome;
    const maxIncome = baseIncome * 3; // Assume 3x growth potential

    // Normalize to 0-100
    const normalizedIncome = Math.min(100, (baseIncome / 200000) * 50 + 30);

    // Adjust for field prospects
    if (option.tags.includes('high-growth')) {
      return Math.min(100, normalizedIncome + 15);
    }
    if (option.tags.includes('stable')) {
      return Math.min(100, normalizedIncome + 5);
    }

    return Math.round(normalizedIncome);
  }

  /**
   * Calculate fulfillment projection
   */
  private calculateFulfillmentProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let score = 65;

    // Check value alignment
    const context = [...input.context.values, ...input.context.aspirationalGoals]
      .join(' ')
      .toLowerCase();

    for (const value of input.context.values) {
      if (option.description.toLowerCase().includes(value.toLowerCase())) {
        score += 8;
      }
    }

    // Interest match
    if (context.includes('interest') || context.includes('passion')) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate future relevance projection
   */
  private calculateRelevanceProjection(option: DecisionOption): number {
    let score = 65;

    if (option.tags.includes('future-proof')) {
      score += 20;
    }
    if (option.tags.includes('tech-driven')) {
      score += 10;
    }
    if (option.tags.includes('declining')) {
      score -= 20;
    }
    if (option.tags.includes('automation-risk')) {
      score -= 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate optionality projection
   */
  private calculateOptionalityProjection(option: DecisionOption): number {
    let score = option.reversibility.score;

    // Specialized paths have lower optionality
    if (option.educationPath?.specialization) {
      score -= 15;
    }

    // Diverse skill building increases optionality
    if (option.tags.includes('transferable-skills')) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate lifestyle projection
   */
  private calculateLifestyleProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let score = 65;

    // Flexibility factors
    if (option.timeCommitment.flexibility === 'HIGHLY_FLEXIBLE') {
      score += 15;
    } else if (option.timeCommitment.flexibility === 'RIGID') {
      score -= 10;
    }

    // Intensity factors
    if (option.timeCommitment.intensity === 'PART_TIME') {
      score += 10;
    } else if (option.timeCommitment.intensity === 'INTENSIVE') {
      score -= 15;
    }

    // Location preferences
    const stabilityPref = input.dimensionScores.get('stabilityPreference')?.score ?? 50;
    if (option.location && stabilityPref > 60) {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate growth potential projection
   */
  private calculateGrowthProjection(option: DecisionOption): number {
    let score = 65;

    if (option.tags.includes('high-growth')) {
      score += 20;
    }
    if (option.tags.includes('steep-learning-curve')) {
      score += 15;
    }
    if (option.educationPath) {
      score += 10;
    }
    if (option.tags.includes('limited-growth')) {
      score -= 15;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate regret risk projection
   */
  private calculateRegretProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let score = 35;

    // Check for contradiction indicators
    if (input.contradictions && input.contradictions.length > 0) {
      score += input.contradictions.length * 5;
    }

    // External pressure increases regret risk
    if (input.context.familyExpectations.length > 0) {
      score += 10;
    }

    // Low reversibility increases regret risk
    if (option.reversibility.score < 40) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate burnout risk projection
   */
  private calculateBurnoutProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let score = 30;

    // Intensity factors
    if (option.timeCommitment.intensity === 'INTENSIVE') {
      score += 20;
    }

    // Duration factors
    if (option.timeCommitment.duration > 48) {
      score += 10;
    }

    // Flexibility factors
    if (option.timeCommitment.flexibility === 'RIGID') {
      score += 10;
    }

    // Resilience buffer
    const resilience = input.dimensionScores.get('resilience')?.score ?? 50;
    score -= (resilience - 50) * 0.3;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate student fit projection
   */
  private calculateFitProjection(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let score = 65;

    // Dimension alignment
    for (const [dimension, score_data] of input.dimensionScores) {
      if (option.description.toLowerCase().includes(dimension.toLowerCase())) {
        score += score_data.score * 0.1;
      }
    }

    // Risk alignment
    const riskTolerance = input.dimensionScores.get('riskTolerance')?.score ?? 50;
    const optionRisk =
      option.riskLevel === 'LOW'
        ? 30
        : option.riskLevel === 'MODERATE'
        ? 50
        : option.riskLevel === 'HIGH'
        ? 70
        : 85;

    const riskAlignment = 100 - Math.abs(riskTolerance - optionRisk);
    score += riskAlignment * 0.1;

    return Math.min(100, score);
  }

  /**
   * Adjust projection with multiplier
   */
  private adjustProjection(base: number, multiplier: number): number {
    return Math.round(Math.min(100, Math.max(0, base * multiplier)));
  }

  /**
   * Build comparison table
   */
  private buildComparisonTable(
    scenarios: ScenarioForecast[]
  ): Map<string, number[]> {
    const table = new Map<string, number[]>();

    const metrics: (keyof ScenarioProjections)[] = [
      'incomePotential',
      'fulfillmentPotential',
      'futureRelevance',
      'optionality',
      'lifestyleCompatibility',
      'growthPotential',
      'regretRisk',
      'burnoutRisk',
      'studentFit',
    ];

    for (const metric of metrics) {
      const values = scenarios.map((s) => s.projections[metric]);
      table.set(metric, values);
    }

    return table;
  }

  /**
   * Compare scenarios across options
   */
  compareScenariosAcrossOptions(
    input: DecisionInput,
    options: DecisionOption[]
  ): Array<{
    option: DecisionOption;
    comparison: ScenarioComparison;
    aggregateScore: number;
  }> {
    return options.map((option) => {
      const comparison = this.generateScenarios(input, option);

      // Calculate aggregate score across scenarios
      const aggregateScore =
        comparison.scenarios.reduce(
          (sum, s) => sum + calculateAggregateProjectionScore(s.projections),
          0
        ) / comparison.scenarios.length;

      return { option, comparison, aggregateScore };
    });
  }

  /**
   * Get best scenario option
   */
  getBestScenarioOption(
    input: DecisionInput,
    options: DecisionOption[]
  ): { option: DecisionOption; comparison: ScenarioComparison } | null {
    if (options.length === 0) return null;

    const comparisons = this.compareScenariosAcrossOptions(input, options);

    const best = comparisons.reduce((max, current) =>
      current.aggregateScore > max.aggregateScore ? current : max
    );

    return { option: best.option, comparison: best.comparison };
  }

  /**
   * Generate scenario narrative
   */
  generateScenarioNarrative(scenario: ScenarioForecast): string {
    const { projections } = scenario;

    let narrative = `In this ${scenario.name.toLowerCase()} scenario over ${scenario.timeframe} years: `;

    if (projections.studentFit > 75) {
      narrative += `This path proves to be an excellent fit for you. `;
    } else if (projections.studentFit > 50) {
      narrative += `This path aligns reasonably well with who you are. `;
    } else {
      narrative += `This path may not fully align with your strengths and values. `;
    }

    if (projections.incomePotential > 70) {
      narrative += `Financial rewards exceed expectations. `;
    }

    if (projections.fulfillmentPotential > 75) {
      narrative += `You find deep meaning in your work. `;
    }

    if (projections.regretRisk < 30) {
      narrative += `You look back with satisfaction at your choice.`;
    } else if (projections.regretRisk > 50) {
      narrative += `You occasionally wonder about paths not taken.`;
    }

    return narrative;
  }

  /**
   * Get current configuration
   */
  getConfig(): ScenarioEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating scenario engine
 */
export function createScenarioEngine(
  config?: Partial<ScenarioEngineConfig>
): ScenarioEngine {
  return new ScenarioEngine(config);
}

/**
 * Quick scenario check
 */
export function generateQuickScenario(
  optionLabel: string,
  riskLevel: string
): {
  optimistic: string;
  realistic: string;
  pessimistic: string;
} {
  return {
    optimistic: `${optionLabel} exceeds expectations. You find unexpected opportunities and growth.`,
    realistic: `${optionLabel} delivers as expected. Steady progress with normal ups and downs.`,
    pessimistic: `${optionLabel} faces challenges. You encounter obstacles requiring adaptation.`,
  };
}
