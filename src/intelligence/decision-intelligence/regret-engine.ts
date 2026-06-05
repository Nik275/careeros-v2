/**
 * Regret Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 4
 *
 * Predicts future regret risk across multiple time horizons.
 * Helps students understand which regrets may be hardest to live with.
 *
 * Regret Categories:
 * - Exploration Regret: Never having tried alternatives
 * - Identity Regret: Not being true to oneself
 * - Financial Regret: Money-related decisions
 * - Relationship Regret: Sacrificing connections
 * - Purpose Regret: Lack of meaning
 * - Missed Opportunity Regret: Paths not taken
 *
 * @module regret-engine
 * @version 1.0.0
 */

import {
  RegretProfile,
  RegretRisk,
  RegretCategory,
  TimeHorizon,
  DecisionInput,
  DecisionOption,
  RegretEngineConfig,
} from './decision-types';
import { REGRET_PREDICTORS } from './decision-model';

/**
 * Regret Engine implementation
 */
export class RegretEngine {
  private config: RegretEngineConfig;

  constructor(config?: Partial<RegretEngineConfig>) {
    this.config = {
      timeHorizons: [5, 10, 20, 40],
      categoryWeights: new Map([
        ['IDENTITY', 1.0],
        ['PURPOSE', 0.95],
        ['EXPLORATION', 0.85],
        ['RELATIONSHIP', 0.8],
        ['FINANCIAL', 0.75],
        ['MISSED_OPPORTUNITY', 0.7],
        ['TIMING', 0.6],
        ['COMPROMISE', 0.65],
      ]),
      patternSensitivity: 0.8,
      contradictionPenalty: 0.2,
      ...config,
    };
  }

  /**
   * Calculate regret profile for a decision
   */
  calculateRegretProfile(
    input: DecisionInput,
    selectedOption?: DecisionOption
  ): RegretProfile {
    const risks = new Map<TimeHorizon, RegretRisk>();

    // Calculate risk for each time horizon
    for (const horizon of this.config.timeHorizons) {
      const risk = this.calculateRegretRisk(input, horizon, selectedOption);
      risks.set(horizon, risk);
    }

    // Calculate overall weighted risk
    const overallRisk = this.calculateOverallRegretRisk(risks);

    // Identify strongest regret category
    const strongestCategory = this.identifyStrongestCategory(risks);

    // Generate category explanations
    const categoryExplanations = this.generateCategoryExplanations(
      risks,
      input,
      strongestCategory
    );

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(
      strongestCategory,
      input
    );

    return {
      risks,
      overallRisk,
      strongestCategory,
      categoryExplanations,
      mitigationStrategies,
      explanation: this.generateExplanation(risks, strongestCategory, input),
    };
  }

  /**
   * Calculate regret risk at a specific time horizon
   */
  private calculateRegretRisk(
    input: DecisionInput,
    horizon: TimeHorizon,
    selectedOption?: DecisionOption
  ): RegretRisk {
    const categoryRisks = new Map<RegretCategory, number>();

    // Calculate risk for each category
    for (const category of this.config.categoryWeights.keys()) {
      const risk = this.calculateCategoryRisk(
        category,
        input,
        horizon,
        selectedOption
      );
      categoryRisks.set(category, risk);
    }

    // Find strongest category
    let strongestCategory: RegretCategory = 'EXPLORATION';
    let maxRisk = 0;

    for (const [category, risk] of categoryRisks) {
      if (risk > maxRisk) {
        maxRisk = risk;
        strongestCategory = category;
      }
    }

    // Calculate overall risk (weighted average)
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [category, risk] of categoryRisks) {
      const weight = this.config.categoryWeights.get(category) ?? 0.5;
      weightedSum += risk * weight;
      totalWeight += weight;
    }

    const overallRisk = totalWeight > 0 ? weightedSum / totalWeight : 0;

    return {
      horizon,
      overallRisk: Math.round(overallRisk),
      categoryRisks,
      strongestCategory,
      explanation: this.generateHorizonExplanation(
        horizon,
        strongestCategory,
        overallRisk
      ),
    };
  }

  /**
   * Calculate risk for a specific regret category
   */
  private calculateCategoryRisk(
    category: RegretCategory,
    input: DecisionInput,
    horizon: TimeHorizon,
    selectedOption?: DecisionOption
  ): number {
    const predictor = REGRET_PREDICTORS.find((p) => p.category === category);
    if (!predictor) return 30; // Default moderate risk

    // Check if this horizon is relevant for this category
    if (!predictor.timeHorizons.includes(horizon)) {
      // Interpolate or use closest horizon
      const closest = predictor.timeHorizons.reduce((prev, curr) =>
        Math.abs(curr - horizon) < Math.abs(prev - horizon) ? curr : prev
      );
      if (Math.abs(closest - horizon) > 10) {
        return Math.max(10, 50 - Math.abs(closest - horizon));
      }
    }

    let riskScore = predictor.baseProbability * 100;

    // Analyze input for indicators
    const context = [
      ...input.context.values,
      ...input.context.aspirationalGoals,
      input.description,
    ].join(' ').toLowerCase();

    // Count matching indicators
    let indicatorMatches = 0;
    for (const indicator of predictor.indicators) {
      if (context.includes(indicator.toLowerCase())) {
        indicatorMatches++;
      }
    }

    // Adjust risk based on indicators
    riskScore += indicatorMatches * 10 * this.config.patternSensitivity;

    // Adjust based on contradictions
    if (input.contradictions) {
      const relevantContradictions = input.contradictions.filter((c) =>
        predictor.intensityFactors.some((f) =>
          c.description.toLowerCase().includes(f.toLowerCase())
        )
      );
      riskScore += relevantContradictions.length * 15 * this.config.contradictionPenalty;
    }

    // Adjust based on optionality (lower optionality = higher exploration regret)
    if (category === 'EXPLORATION' && selectedOption) {
      const reversibility = selectedOption.reversibility.score;
      riskScore += (100 - reversibility) * 0.3;
    }

    // Time horizon adjustments
    if (horizon === 5) {
      // Short term: financial and timing regrets more relevant
      if (category === 'FINANCIAL' || category === 'TIMING') {
        riskScore *= 1.2;
      }
    } else if (horizon >= 20) {
      // Long term: identity and purpose regrets more relevant
      if (category === 'IDENTITY' || category === 'PURPOSE') {
        riskScore *= 1.3;
      }
    }

    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Calculate overall regret risk across all horizons
   */
  private calculateOverallRegretRisk(
    risks: Map<TimeHorizon, RegretRisk>
  ): number {
    // Weight later horizons more heavily (regret accumulates)
    const weights = new Map<TimeHorizon, number>([
      [5, 0.1],
      [10, 0.2],
      [20, 0.3],
      [40, 0.4],
    ]);

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [horizon, risk] of risks) {
      const weight = weights.get(horizon) ?? 0.25;
      weightedSum += risk.overallRisk * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Identify the strongest regret category across all horizons
   */
  private identifyStrongestCategory(
    risks: Map<TimeHorizon, RegretRisk>
  ): RegretCategory {
    const categoryScores = new Map<RegretCategory, number>();

    // Sum up risks for each category across all horizons
    for (const risk of risks.values()) {
      for (const [category, score] of risk.categoryRisks) {
        const current = categoryScores.get(category) ?? 0;
        categoryScores.set(category, current + score);
      }
    }

    // Find category with highest total
    let strongest: RegretCategory = 'EXPLORATION';
    let maxScore = 0;

    for (const [category, score] of categoryScores) {
      if (score > maxScore) {
        maxScore = score;
        strongest = category;
      }
    }

    return strongest;
  }

  /**
   * Generate explanations for each category
   */
  private generateCategoryExplanations(
    risks: Map<TimeHorizon, RegretRisk>,
    input: DecisionInput,
    strongestCategory: RegretCategory
  ): Map<RegretCategory, string> {
    const explanations = new Map<RegretCategory, string>();

    const categoryExplanations: Record<RegretCategory, string> = {
      IDENTITY: `You may look back and wish you had been more true to yourself rather than following external expectations.`,
      PURPOSE: `You might regret not choosing work that feels meaningful and aligned with your values.`,
      EXPLORATION: `You could regret not exploring alternative paths while you had the chance.`,
      RELATIONSHIP: `Sacrificing important relationships for career advancement may lead to lasting regret.`,
      FINANCIAL: `Financial stress from your chosen path could become a source of regret.`,
      MISSED_OPPORTUNITY: `Doors that close now may be difficult to reopen later.`,
      TIMING: `The timing of this decision may affect how you feel about it in retrospect.`,
      COMPROMISE: `Repeated compromises may accumulate into significant regret over time.`,
    };

    for (const category of this.config.categoryWeights.keys()) {
      const isStrongest = category === strongestCategory;
      const baseExplanation = categoryExplanations[category];

      if (isStrongest) {
        explanations.set(
          category,
          `${baseExplanation} This appears to be your strongest potential regret.`
        );
      } else {
        explanations.set(category, baseExplanation);
      }
    }

    return explanations;
  }

  /**
   * Generate mitigation strategies
   */
  private generateMitigationStrategies(
    strongestCategory: RegretCategory,
    input: DecisionInput
  ): string[] {
    const strategies: Record<RegretCategory, string[]> = {
      IDENTITY: [
        'Regularly check in with yourself about alignment',
        'Create space for authentic expression',
        'Build a support system that accepts the real you',
      ],
      PURPOSE: [
        'Find meaning within your current context',
        'Build purpose-driven side projects',
        'Connect daily work to larger values',
      ],
      EXPLORATION: [
        'Run small experiments before committing',
        'Keep optionality where possible',
        'Document your decision-making for future reference',
      ],
      RELATIONSHIP: [
        'Prioritize relationships alongside career',
        'Set boundaries to protect personal time',
        'Stay connected with important people',
      ],
      FINANCIAL: [
        'Build emergency savings',
        'Diversify income sources',
        'Plan for financial milestones',
      ],
      MISSED_OPPORTUNITY: [
        'Stay informed about alternative paths',
        'Build transferable skills',
        'Maintain professional networks',
      ],
      TIMING: [
        'Consider if waiting would help',
        'Understand the cost of delay',
        'Set clear decision deadlines',
      ],
      COMPROMISE: [
        'Track which compromises feel acceptable',
        'Set limits on what you will compromise',
        'Revisit decisions when circumstances change',
      ],
    };

    return strategies[strongestCategory] || ['Reflect regularly on your choices'];
  }

  /**
   * Generate overall explanation
   */
  private generateExplanation(
    risks: Map<TimeHorizon, RegretRisk>,
    strongestCategory: RegretCategory,
    input: DecisionInput
  ): string {
    const categoryNames: Record<RegretCategory, string> = {
      IDENTITY: 'Identity Regret',
      PURPOSE: 'Purpose Regret',
      EXPLORATION: 'Exploration Regret',
      RELATIONSHIP: 'Relationship Regret',
      FINANCIAL: 'Financial Regret',
      MISSED_OPPORTUNITY: 'Missed Opportunity Regret',
      TIMING: 'Timing Regret',
      COMPROMISE: 'Compromise Regret',
    };

    const explanations: Record<RegretCategory, string> = {
      IDENTITY: `I'm noticing some patterns that suggest you might look back years from now and wish you had been more true to yourself. The tension between who you are and what others expect could become harder to ignore over time.`,
      PURPOSE: `There's a risk that you may eventually feel your work lacks meaning, even if it provides other benefits. Purpose tends to become more important as we age.`,
      EXPLORATION: `You might regret not exploring alternatives while you had the flexibility to do so. The paths not taken often haunt us more than the paths we tried and moved on from.`,
      RELATIONSHIP: `If you sacrifice important relationships for career advancement, that may become a source of deep regret. Connections often matter more than achievements in retrospect.`,
      FINANCIAL: `Financial stress from this path could lead to regret, especially if it limits your options later. Security provides freedom to make aligned choices.`,
      MISSED_OPPORTUNITY: `The doors that close with this decision may be difficult to reopen. Consider what you might wish you had tried.`,
      TIMING: `The timing of this decision matters. Acting too soon or waiting too long can both lead to regret.`,
      COMPROMISE: `Repeated compromises can accumulate into significant regret over time. Pay attention to which compromises feel sustainable.`,
    };

    let explanation = explanations[strongestCategory];

    // Add horizon-specific context
    const risk20Year = risks.get(20);
    if (risk20Year && risk20Year.overallRisk > 60) {
      explanation += ` Looking 20 years ahead, I see a ${risk20Year.overallRisk}% chance of significant regret.`;
    }

    return explanation;
  }

  /**
   * Generate explanation for a specific horizon
   */
  private generateHorizonExplanation(
    horizon: TimeHorizon,
    strongestCategory: RegretCategory,
    overallRisk: number
  ): string {
    const timeframeText =
      horizon === 5
        ? 'In 5 years'
        : horizon === 10
        ? 'In 10 years'
        : horizon === 20
        ? 'In 20 years'
        : 'Looking back at age 60';

    return `${timeframeText}, your highest regret risk is ${strongestCategory.toLowerCase().replace('_', ' ')} at ${Math.round(overallRisk)}%.`;
  }

  /**
   * Compare regret profiles for different options
   */
  compareOptions(
    input: DecisionInput,
    options: DecisionOption[]
  ): Array<{ option: DecisionOption; profile: RegretProfile; comparison: string }> {
    return options.map((option) => {
      const profile = this.calculateRegretProfile(input, option);

      const comparison = `${option.label} shows ${profile.overallRisk}% overall regret risk, with highest concern for ${profile.strongestCategory.toLowerCase().replace('_', ' ')}.`;

      return { option, profile, comparison };
    });
  }

  /**
   * Get lowest regret option
   */
  getLowestRegretOption(
    input: DecisionInput,
    options: DecisionOption[]
  ): { option: DecisionOption; profile: RegretProfile } | null {
    if (options.length === 0) return null;

    const comparisons = this.compareOptions(input, options);

    let lowest = comparisons[0];
    for (const comp of comparisons) {
      if (comp.profile.overallRisk < lowest.profile.overallRisk) {
        lowest = comp;
      }
    }

    return { option: lowest.option, profile: lowest.profile };
  }

  /**
   * Quick regret check
   */
  quickRegretCheck(values: string[]): {
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    primaryConcern: RegretCategory | null;
  } {
    // Simple heuristic based on value indicators
    const context = values.join(' ').toLowerCase();

    let identityRisk = 0;
    let explorationRisk = 0;
    let financialRisk = 0;

    // Identity indicators
    if (context.includes('parents') || context.includes('family')) identityRisk += 20;
    if (context.includes('expectations')) identityRisk += 15;
    if (context.includes('myself') || context.includes('authentic')) identityRisk += 10;

    // Exploration indicators
    if (context.includes('what if')) explorationRisk += 20;
    if (context.includes('curious')) explorationRisk += 15;
    if (context.includes('try')) explorationRisk += 10;

    // Financial indicators
    if (context.includes('money') || context.includes('salary')) financialRisk += 15;
    if (context.includes('debt')) financialRisk += 20;

    const maxRisk = Math.max(identityRisk, explorationRisk, financialRisk, 30);

    let primaryConcern: RegretCategory | null = null;
    if (identityRisk >= explorationRisk && identityRisk >= financialRisk) {
      primaryConcern = 'IDENTITY';
    } else if (explorationRisk >= financialRisk) {
      primaryConcern = 'EXPLORATION';
    } else {
      primaryConcern = 'FINANCIAL';
    }

    const riskLevel: 'LOW' | 'MODERATE' | 'HIGH' =
      maxRisk < 30 ? 'LOW' : maxRisk < 60 ? 'MODERATE' : 'HIGH';

    return { riskLevel, primaryConcern };
  }

  /**
   * Get current configuration
   */
  getConfig(): RegretEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating regret engine
 */
export function createRegretEngine(config?: Partial<RegretEngineConfig>): RegretEngine {
  return new RegretEngine(config);
}

/**
 * Quick regret analysis
 */
export function analyzeQuickRegret(values: string[]): {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  primaryConcern: RegretCategory | null;
  explanation: string;
} {
  const engine = createRegretEngine();
  const result = engine.quickRegretCheck(values);

  const explanations: Record<string, string> = {
    LOW: 'Your values suggest relatively low regret risk. Your path appears aligned with your priorities.',
    MODERATE: 'There are some potential regret factors to consider. Reflect on what matters most long-term.',
    HIGH: 'Several indicators suggest potential for significant regret. Consider exploring alternatives before committing.',
  };

  return {
    ...result,
    explanation: explanations[result.riskLevel],
  };
}

/**
 * Calculate regret risk for a specific category
 */
export function calculateCategoryRegretRisk(
  category: RegretCategory,
  context: string
): number {
  const predictor = REGRET_PREDICTORS.find((p) => p.category === category);
  if (!predictor) return 30;

  const contextLower = context.toLowerCase();
  let matches = 0;

  for (const indicator of predictor.indicators) {
    if (contextLower.includes(indicator.toLowerCase())) {
      matches++;
    }
  }

  return Math.min(100, predictor.baseProbability * 100 + matches * 10);
}
