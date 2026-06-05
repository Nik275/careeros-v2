/**
 * CareerOS Market Intelligence - Scenario Generator
 *
 * Generates optimistic, baseline, and pessimistic scenarios.
 *
 * Purpose:
 * - Avoid false certainty in forecasts
 * - Enable scenario planning
 * - Express multiple possible futures
 *
 * Principle: Never present predictions as certainty.
 * Always present scenarios with probabilities.
 */

import type { ForecastScenario, ScenarioType } from './models/ForecastScenario';
import { createForecastScenario, createScenarioSet } from './models/ForecastScenario';
import type { ForecastRange } from './models/ForecastRange';

/**
 * Scenario generator configuration.
 */
export interface ScenarioGeneratorConfig {
  /** Default variance between scenarios */
  defaultVariance: number;

  /** Optimistic bias factor */
  optimisticBias: number;

  /** Pessimistic bias factor */
  pessimisticBias: number;

  /** Minimum scenario probability */
  minProbability: number;

  /** Maximum scenario probability */
  maxProbability: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_SCENARIO_CONFIG: ScenarioGeneratorConfig = {
  defaultVariance: 15,
  optimisticBias: 1.2,
  pessimisticBias: 0.8,
  minProbability: 0.15,
  maxProbability: 0.6,
};

/**
 * Scenario generation context.
 */
export interface ScenarioContext {
  /** Base demand level */
  baseDemand: number;

  /** Base salary level */
  baseSalary: number;

  /** Base growth rate */
  baseGrowth: number;

  /** Base opportunity score */
  baseOpportunity: number;

  /** Trend direction: positive, negative, neutral */
  trendDirection: 'positive' | 'negative' | 'neutral';

  /** Trend strength (0-100) */
  trendStrength: number;

  /** Market volatility (0-100) */
  volatility: number;

  /** Upside factors */
  upsideFactors: string[];

  /** Downside factors */
  downsideFactors: string[];

  /** Key assumptions */
  assumptions: string[];

  /** Supporting evidence */
  evidence: string[];
}

/**
 * Scenario generator.
 */
export class ScenarioGenerator {
  private config: ScenarioGeneratorConfig;

  constructor(config?: Partial<ScenarioGeneratorConfig>) {
    this.config = { ...DEFAULT_SCENARIO_CONFIG, ...config };
  }

  /**
   * Generate complete scenario set from context.
   */
  generateScenarios(context: ScenarioContext): {
    optimistic: ForecastScenario;
    baseline: ForecastScenario;
    pessimistic: ForecastScenario;
  } {
    // Generate baseline first
    const baseline = this.generateBaseline(context);

    // Generate optimistic from baseline
    const optimistic = this.generateOptimistic(context, baseline);

    // Generate pessimistic from baseline
    const pessimistic = this.generatePessimistic(context, baseline);

    return { optimistic, baseline, pessimistic };
  }

  /**
   * Generate baseline scenario.
   */
  generateBaseline(context: ScenarioContext): ForecastScenario {
    const getBaseValue = (base: number) =>
      Math.round(base + (context.trendDirection === 'positive' ? context.trendStrength * 0.3 : 0));

    const demand = getBaseValue(context.baseDemand);
    const growth = getBaseValue(context.baseGrowth);

    return createForecastScenario('baseline', {
      probability: 'likely',
      probabilityScore: 0.5,
      demandProjection: Math.min(100, demand),
      salaryProjection: context.baseSalary,
      growthProjection: Math.min(100, growth),
      opportunityProjection: Math.round((demand + growth) / 2),
      narrative: [
        `Current trajectory continues with ${context.trendDirection} momentum`,
        `Market conditions remain stable`,
        ...context.assumptions,
      ],
      assumptions: context.assumptions,
      criticalFactors: [
        'Economic conditions remain stable',
        'Industry trends continue as observed',
        'No major disruptions',
      ],
      evidence: context.evidence,
      riskFactors: [
        'Economic uncertainty',
        'Unexpected technological shifts',
        'Regulatory changes',
      ],
    });
  }

  /**
   * Generate optimistic scenario.
   */
  generateOptimistic(
    context: ScenarioContext,
    baseline: ForecastScenario
  ): ForecastScenario {
    const variance = Math.min(25, this.config.defaultVariance * this.config.optimisticBias);
    const getValue = (v: number | ForecastRange) => (typeof v === 'number' ? v : v.expected);

    // Apply upside
    const demand = Math.min(100, getValue(baseline.demandProjection) + variance);
    const salary = Math.min(100, getValue(baseline.salaryProjection) + variance * 0.8);
    const growth = Math.min(100, getValue(baseline.growthProjection) + variance * 1.2);
    const opportunity = Math.round((demand + growth) / 2);

    return createForecastScenario('optimistic', {
      probability: 'possible',
      probabilityScore: Math.max(
        this.config.minProbability,
        0.5 - context.volatility / 200
      ),
      demandProjection: demand,
      salaryProjection: salary,
      growthProjection: growth,
      opportunityProjection: opportunity,
      narrative: [
        'Favorable market conditions materialize',
        'Growth accelerates beyond baseline projections',
        ...context.upsideFactors.map((f) => `${f} drives positive outcomes`),
      ],
      assumptions: [
        ...baseline.assumptions,
        'Economic growth exceeds expectations',
        'Technology adoption accelerates',
        'Talent shortage increases value',
      ],
      criticalFactors: context.upsideFactors,
      evidence: baseline.evidence,
      riskFactors: ['Market conditions may not improve as projected'],
    });
  }

  /**
   * Generate pessimistic scenario.
   */
  generatePessimistic(
    context: ScenarioContext,
    baseline: ForecastScenario
  ): ForecastScenario {
    const variance = Math.min(25, this.config.defaultVariance * this.config.pessimisticBias);
    const getValue = (v: number | ForecastRange) => (typeof v === 'number' ? v : v.expected);

    // Apply downside
    const demand = Math.max(0, getValue(baseline.demandProjection) - variance);
    const salary = Math.max(0, getValue(baseline.salaryProjection) - variance * 0.8);
    const growth = Math.max(0, getValue(baseline.growthProjection) - variance * 1.2);
    const opportunity = Math.round((demand + growth) / 2);

    return createForecastScenario('pessimistic', {
      probability: 'possible',
      probabilityScore: Math.max(
        this.config.minProbability,
        0.5 - context.volatility / 200
      ),
      demandProjection: demand,
      salaryProjection: salary,
      growthProjection: growth,
      opportunityProjection: opportunity,
      narrative: [
        'Challenging market conditions emerge',
        'Growth slows relative to baseline projections',
        ...context.downsideFactors.map((f) => `${f} creates headwinds`),
      ],
      assumptions: [
        ...baseline.assumptions,
        'Economic headwinds persist',
        'Increased automation impact',
        'Competition intensifies',
      ],
      criticalFactors: context.downsideFactors,
      evidence: baseline.evidence,
      riskFactors: ['Market conditions may improve unexpectedly'],
    });
  }

  /**
   * Generate single scenario by type.
   */
  generateSingle(
    type: ScenarioType,
    context: ScenarioContext
  ): ForecastScenario {
    const { optimistic, baseline, pessimistic } = this.generateScenarios(context);

    switch (type) {
      case 'optimistic':
        return optimistic;
      case 'baseline':
        return baseline;
      case 'pessimistic':
        return pessimistic;
    }
  }

  /**
   * Adjust scenario probabilities based on evidence.
   */
  adjustProbabilities(
    scenarios: {
      optimistic: ForecastScenario;
      baseline: ForecastScenario;
      pessimistic: ForecastScenario;
    },
    evidence: { direction: 'positive' | 'negative' | 'neutral'; strength: number }[]
  ): { optimistic: number; baseline: number; pessimistic: number } {
    // Start with equal probabilities adjusted by volatility
    const baseProb = 1 / 3;
    let optProb = baseProb;
    let baseProb_val = baseProb;
    let pesProb = baseProb;

    // Adjust based on evidence
    for (const e of evidence) {
      const adjustment = e.strength / 1000; // Small adjustment per evidence

      if (e.direction === 'positive') {
        optProb += adjustment;
        pesProb -= adjustment / 2;
        baseProb_val -= adjustment / 2;
      } else if (e.direction === 'negative') {
        pesProb += adjustment;
        optProb -= adjustment / 2;
        baseProb_val -= adjustment / 2;
      }
    }

    // Normalize to sum to 1.0
    const total = optProb + baseProb_val + pesProb;

    return {
      optimistic: Math.max(this.config.minProbability, optProb / total),
      baseline: Math.max(this.config.minProbability, baseProb_val / total),
      pessimistic: Math.max(this.config.minProbability, pesProb / total),
    };
  }

  /**
   * Generate variance ranges for scenario values.
   */
  generateRanges(
    baseValue: number,
    volatility: number
  ): { optimistic: number; baseline: number; pessimistic: number } {
    const variance = Math.min(30, volatility * 0.5);

    return {
      optimistic: Math.min(100, baseValue + variance * this.config.optimisticBias),
      baseline: baseValue,
      pessimistic: Math.max(0, baseValue - variance * this.config.pessimisticBias),
    };
  }

  /**
   * Create context from market data.
   */
  createContext(params: {
    historicalDemand: number[];
    historicalGrowth: number[];
    signals: Array<{ type: string; strength: number; direction: 'positive' | 'negative' }>;
    volatility: number;
  }): ScenarioContext {
    // Calculate base values from historical data
    const avgDemand =
      params.historicalDemand.length > 0
        ? params.historicalDemand.reduce((sum, d) => sum + d, 0) /
          params.historicalDemand.length
        : 50;

    const avgGrowth =
      params.historicalGrowth.length > 0
        ? params.historicalGrowth.reduce((sum, g) => sum + g, 0) /
          params.historicalGrowth.length
        : 50;

    // Determine trend direction
    const recentSignals = params.signals.slice(-5);
    const positiveCount = recentSignals.filter((s) => s.direction === 'positive').length;
    const negativeCount = recentSignals.filter((s) => s.direction === 'negative').length;

    const trendDirection =
      positiveCount > negativeCount + 1
        ? 'positive'
        : negativeCount > positiveCount + 1
        ? 'negative'
        : 'neutral';

    const trendStrength = Math.abs(positiveCount - negativeCount) * 20;

    // Identify factors
    const upsideFactors = params.signals
      .filter((s) => s.direction === 'positive' && s.strength > 70)
      .map((s) => s.type);

    const downsideFactors = params.signals
      .filter((s) => s.direction === 'negative' && s.strength > 70)
      .map((s) => s.type);

    return {
      baseDemand: Math.round(avgDemand),
      baseSalary: 50, // Neutral baseline
      baseGrowth: Math.round(avgGrowth),
      baseOpportunity: Math.round((avgDemand + avgGrowth) / 2),
      trendDirection,
      trendStrength,
      volatility: params.volatility,
      upsideFactors: [...new Set(upsideFactors)],
      downsideFactors: [...new Set(downsideFactors)],
      assumptions: ['Current trends continue', 'No major market disruptions'],
      evidence: params.signals.map((s) => `${s.type} (${s.direction}, ${s.strength})`),
    };
  }
}

/**
 * Factory function for ScenarioGenerator.
 */
export function createScenarioGenerator(
  config?: Partial<ScenarioGeneratorConfig>
): ScenarioGenerator {
  return new ScenarioGenerator(config);
}
