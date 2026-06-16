/**
 * CareerOS Market Intelligence - Skill Forecast Engine
 *
 * Generates forecasts for skills.
 *
 * Forecasts:
 * - Future skill demand
 * - Future skill scarcity
 * - Future skill relevance
 *
 * Purpose: Help users understand which skills will be valuable.
 */

import type { Forecast, ForecastHorizon, ForecastSignal } from './models/Forecast';
import { createForecast, calculateExpectedValues } from './models/Forecast';
import type { ForecastScenario } from './models/ForecastScenario';
import type { ForecastConfidence } from './models/ForecastConfidence';
import type { ForecastEvidence } from './models/ForecastEvidence';
import { ScenarioGenerator, createScenarioGenerator } from './ScenarioGenerator';
import { ConfidenceForecastEngine, createConfidenceForecastEngine } from './ConfidenceForecastEngine';

/**
 * Skill forecast inputs.
 */
export interface SkillForecastInputs {
  /** Skill ID */
  skillId: string;

  /** Skill name */
  name: string;

  /** Skill category */
  category: string;

  /** Historical demand data */
  historicalDemand: Array<{ timestamp: Date; value: number }>;

  /** Adoption trend */
  adoptionTrend: Array<{ timestamp: Date; value: number }>;

  /** Job posting mentions */
  jobMentions: Array<{ timestamp: Date; count: number }>;

  /** Market signals */
  signals: ForecastSignal[];

  /** Supporting evidence */
  evidence: ForecastEvidence[];

  /** Related skills */
  relatedSkills: string[];

  /** Career paths using this skill */
  careerPaths: string[];

  /** Skill complexity (0-100) */
  complexity: number;

  /** Learning curve duration (days) */
  learningCurve: number;

  /** Obsolescence risk (0-100) */
  obsolescenceRisk: number;
}

/**
 * Skill forecast result.
 */
export interface SkillForecastResult {
  /** The generated forecast */
  forecast: Forecast;

  /** Scarcity assessment */
  scarcityAssessment: {
    currentScarcity: number;
    projectedScarcity: number;
    supplyConstraint: boolean;
  };

  /** Demand trajectory */
  demandTrajectory: 'accelerating' | 'growing' | 'stable' | 'declining';

  /** Investment recommendation */
  recommendation: 'high_priority' | 'valuable' | 'optional' | 'low_priority';

  /** Timeline to relevance decline */
  relevanceHorizon?: number;
}

/**
 * Skill forecast configuration.
 */
export interface SkillForecastConfig {
  /** Base variance for scenarios */
  scenarioVariance: number;

  /** Adoption acceleration threshold */
  accelerationThreshold: number;

  /** Minimum data points required */
  minDataPoints: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_SKILL_FORECAST_CONFIG: SkillForecastConfig = {
  scenarioVariance: 15,
  accelerationThreshold: 15,
  minDataPoints: 4,
};

/**
 * Skill Forecast Engine.
 */
export class SkillForecastEngine {
  private config: SkillForecastConfig;
  private scenarioGenerator: ScenarioGenerator;
  private confidenceEngine: ConfidenceForecastEngine;

  // Forecast cache
  private forecasts: Map<string, Map<ForecastHorizon, Forecast>> = new Map();

  constructor(config?: Partial<SkillForecastConfig>) {
    this.config = { ...DEFAULT_SKILL_FORECAST_CONFIG, ...config };
    this.scenarioGenerator = createScenarioGenerator();
    this.confidenceEngine = createConfidenceForecastEngine();
  }

  /**
   * Generate forecast for a skill.
   */
  generateForecast(
    inputs: SkillForecastInputs,
    horizon: ForecastHorizon
  ): SkillForecastResult {
    // Validate inputs
    if (inputs.historicalDemand.length < this.config.minDataPoints) {
      return this.generateLowConfidenceForecast(inputs, horizon);
    }

    // Extract latest values
    const latestDemand = this.getLatestValue(inputs.historicalDemand);
    const latestAdoption = this.getLatestValue(inputs.adoptionTrend);

    // Analyze trends
    const demandTrend = this.analyzeTrend(inputs.historicalDemand);
    const adoptionTrend = this.analyzeTrend(inputs.adoptionTrend);

    // Calculate scarcity
    const currentScarcity = this.calculateScarcity(inputs);

    // Calculate base projections
    const horizonYears = this.getHorizonYears(horizon);
    const baseDemand = this.projectValue(latestDemand, demandTrend, horizonYears);

    // Adjust for obsolescence
    const adjustedDemand = this.adjustForObsolescence(
      baseDemand,
      inputs.obsolescenceRisk,
      horizonYears
    );

    // Determine trajectory
    const trajectory = this.determineTrajectory(demandTrend, adoptionTrend);

    // Generate scenarios
    const context = this.scenarioGenerator.createContext({
      historicalDemand: inputs.historicalDemand.map((d) => d.value),
      historicalGrowth: inputs.adoptionTrend.map((a) => a.value),
      signals: inputs.signals,
      volatility: this.calculateVolatility(inputs.historicalDemand),
    });

    const scenarios = this.scenarioGenerator.generateScenarios({
      ...context,
      baseDemand: adjustedDemand,
      baseSalary: 50,
      baseGrowth: this.projectValue(latestAdoption, adoptionTrend, horizonYears),
      baseOpportunity: Math.round(adjustedDemand),
    });

    // Calculate confidence
    const confidence = this.confidenceEngine.calculateConfidence({
      historicalData: inputs.historicalDemand.map((d) => ({
        timestamp: d.timestamp,
        value: d.value,
        quality: 80,
      })),
      evidence: inputs.evidence,
      signals: inputs.signals,
      modelFit: this.calculateModelFit(inputs),
      horizonYears,
    });

    // Calculate scenario probabilities
    const probabilities = this.scenarioGenerator.adjustProbabilities(scenarios, inputs.signals);

    // Calculate projected scarcity
    const projectedScarcity = this.projectScarcity(
      currentScarcity,
      trajectory,
      horizonYears
    );

    // Create forecast
    const forecast = createForecast({
      entityId: inputs.skillId,
      entityType: 'skill',
      entityName: inputs.name,
      horizon,
      optimisticScenario: scenarios.optimistic,
      baselineScenario: scenarios.baseline,
      pessimisticScenario: scenarios.pessimistic,
      confidence,
      scenarioProbabilities: probabilities,
      expectedValue: calculateExpectedValues(scenarios, probabilities),
      status: 'ready',
      inputs: {
        dataPoints: inputs.historicalDemand.length,
        timeRange: {
          start: inputs.historicalDemand[0]?.timestamp ?? new Date(),
          end: inputs.historicalDemand[inputs.historicalDemand.length - 1]?.timestamp ?? new Date(),
        },
        sources: [...new Set(inputs.evidence.map((e) => e.source))],
      },
      insights: this.generateInsights(inputs, scenarios, confidence, trajectory),
      riskFactors: this.identifyRiskFactors(inputs),
      methodology: [
        'Adoption curve analysis',
        'Demand projection with obsolescence adjustment',
        'Scarcity modeling based on supply-demand dynamics',
      ],
    });

    // Cache forecast
    this.cacheForecast(inputs.skillId, horizon, forecast);

    return {
      forecast,
      scarcityAssessment: {
        currentScarcity,
        projectedScarcity,
        supplyConstraint: projectedScarcity > 70,
      },
      demandTrajectory: trajectory,
      recommendation: this.generateRecommendation(
        adjustedDemand,
        projectedScarcity,
        inputs.obsolescenceRisk,
        trajectory
      ),
      relevanceHorizon: inputs.obsolescenceRisk > 50 ? this.estimateRelevanceHorizon(inputs) : undefined,
    };
  }

  /**
   * Compare skill forecasts.
   */
  compareSkills(
    skills: Array<{ skillId: string; forecast: Forecast }>
  ): Array<{
    skillId: string;
    rank: number;
    demandScore: number;
    scarcityScore: number;
    investmentValue: number;
  }> {
    const scored = skills.map((s) => {
      const demand =
        typeof s.forecast.baselineScenario.demandProjection === 'number'
          ? s.forecast.baselineScenario.demandProjection
          : s.forecast.baselineScenario.demandProjection.expected;

      const growth =
        typeof s.forecast.baselineScenario.growthProjection === 'number'
          ? s.forecast.baselineScenario.growthProjection
          : s.forecast.baselineScenario.growthProjection.expected;

      // Investment value = demand * growth / complexity penalty
      const investmentValue = Math.round((demand * growth) / 100);

      return {
        skillId: s.skillId,
        demandScore: demand,
        scarcityScore: growth,
        investmentValue,
      };
    });

    // Sort by investment value
    scored.sort((a, b) => b.investmentValue - a.investmentValue);

    // Add ranks
    return scored.map((s, i) => ({ ...s, rank: i + 1 }));
  }

  /**
   * Identify skill clusters.
   */
  identifyClusters(skills: SkillForecastInputs[]): {
    rising: string[];
    plateauing: string[];
    declining: string[];
    emerging: string[];
  } {
    const rising: string[] = [];
    const plateauing: string[] = [];
    const declining: string[] = [];
    const emerging: string[] = [];

    for (const skill of skills) {
      const demandTrend = this.analyzeTrend(skill.historicalDemand);
      const adoptionTrend = this.analyzeTrend(skill.adoptionTrend);

      if (demandTrend.direction === 'increasing' && demandTrend.strength > 60) {
        if (adoptionTrend.direction === 'increasing') {
          rising.push(skill.name);
        } else {
          plateauing.push(skill.name);
        }
      } else if (demandTrend.direction === 'decreasing') {
        declining.push(skill.name);
      } else if (demandTrend.direction === 'increasing' && demandTrend.strength < 40) {
        emerging.push(skill.name);
      }
    }

    return { rising, plateauing, declining, emerging };
  }

  // Private methods

  private generateLowConfidenceForecast(
    inputs: SkillForecastInputs,
    horizon: ForecastHorizon
  ): SkillForecastResult {
    const horizonYears = this.getHorizonYears(horizon);

    const scenarios = this.scenarioGenerator.generateScenarios({
      baseDemand: 50,
      baseSalary: 50,
      baseGrowth: 50,
      baseOpportunity: 50,
      trendDirection: 'neutral',
      trendStrength: 0,
      volatility: 50,
      upsideFactors: [],
      downsideFactors: [],
      assumptions: ['Insufficient data for confident forecast'],
      evidence: [],
    });

    const confidence = this.confidenceEngine.calculateConfidence({
      historicalData: [],
      evidence: inputs.evidence,
      signals: inputs.signals,
      modelFit: 30,
      horizonYears,
    });

    const forecast = createForecast({
      entityId: inputs.skillId,
      entityType: 'skill',
      entityName: inputs.name,
      horizon,
      optimisticScenario: scenarios.optimistic,
      baselineScenario: scenarios.baseline,
      pessimisticScenario: scenarios.pessimistic,
      confidence,
      scenarioProbabilities: { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 },
      expectedValue: calculateExpectedValues(scenarios, { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 }),
      status: 'ready',
      inputs: {
        dataPoints: 0,
        timeRange: { start: new Date(), end: new Date() },
        sources: [],
      },
      insights: ['Insufficient historical data for high-confidence forecast'],
      riskFactors: ['Unknown due to limited data'],
      methodology: ['Low-data fallback with wide uncertainty ranges'],
    });

    return {
      forecast,
      scarcityAssessment: {
        currentScarcity: 50,
        projectedScarcity: 50,
        supplyConstraint: false,
      },
      demandTrajectory: 'stable',
      recommendation: 'optional',
    };
  }

  private getLatestValue(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length === 0) return 50;
    return data[data.length - 1]!.value;
  }

  private analyzeTrend(data: Array<{ timestamp: Date; value: number }>): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    acceleration: number;
  } {
    if (data.length < 2) {
      return { direction: 'stable', strength: 0, acceleration: 0 };
    }

    const values = data.map((d) => d.value);
    const first = values[0]!;
    const last = values[values.length - 1]!;
    const change = last - first;

    const direction =
      Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing';

    const strength = Math.min(100, Math.abs(change) * 2);

    // Calculate acceleration
    let acceleration = 0;
    if (values.length >= 4) {
      const mid = Math.floor(values.length / 2);
      const firstHalfChange = values[mid]! - values[0]!;
      const secondHalfChange = values[values.length - 1]! - values[mid]!;
      acceleration = secondHalfChange - firstHalfChange;
    }

    return { direction, strength, acceleration };
  }

  private getHorizonYears(horizon: ForecastHorizon): number {
    const mapping: Record<ForecastHorizon, number> = {
      '1_year': 1,
      '3_year': 3,
      '5_year': 5,
      '10_year': 10,
    };
    return mapping[horizon];
  }

  private projectValue(
    current: number,
    trend: { direction: string; strength: number },
    years: number
  ): number {
    const trendMultiplier = trend.direction === 'increasing' ? 1 : trend.direction === 'decreasing' ? -1 : 0;
    const projectedChange = trend.strength * 0.1 * years * trendMultiplier;
    return Math.max(0, Math.min(100, current + projectedChange));
  }

  private calculateScarcity(inputs: SkillForecastInputs): number {
    // Simple scarcity = demand / supply proxy
    // High demand + low mentions = scarce
    const latestDemand = this.getLatestValue(inputs.historicalDemand);
    const latestMentions = inputs.jobMentions.length > 0
      ? inputs.jobMentions[inputs.jobMentions.length - 1]!.count
      : 50;

    // Normalize mentions to 0-100
    const normalizedMentions = Math.min(100, latestMentions / 10);

    // Scarcity = demand relative to supply
    return Math.max(0, Math.min(100, latestDemand - normalizedMentions + 50));
  }

  private projectScarcity(
    current: number,
    trajectory: SkillForecastResult['demandTrajectory'],
    years: number
  ): number {
    const trajectoryMultiplier: Record<typeof trajectory, number> = {
      accelerating: 1.5,
      growing: 1.0,
      stable: 0,
      declining: -1.0,
    };

    const change = trajectoryMultiplier[trajectory] * 5 * years;
    return Math.max(0, Math.min(100, current + change));
  }

  private adjustForObsolescence(
    baseDemand: number,
    obsolescenceRisk: number,
    years: number
  ): number {
    const obsolescenceImpact = obsolescenceRisk * 0.02 * years;
    return Math.max(0, baseDemand - obsolescenceImpact);
  }

  private determineTrajectory(
    demandTrend: ReturnType<SkillForecastEngine['analyzeTrend']>,
    adoptionTrend: ReturnType<SkillForecastEngine['analyzeTrend']>
  ): SkillForecastResult['demandTrajectory'] {
    // Both trends increasing strongly = accelerating
    if (demandTrend.direction === 'increasing' && adoptionTrend.direction === 'increasing') {
      if (demandTrend.strength > 70 || adoptionTrend.acceleration > this.config.accelerationThreshold) {
        return 'accelerating';
      }
      return 'growing';
    }

    // Demand increasing but adoption plateauing = growing
    if (demandTrend.direction === 'increasing') {
      return 'growing';
    }

    // Demand decreasing = declining
    if (demandTrend.direction === 'decreasing') {
      return 'declining';
    }

    return 'stable';
  }

  private calculateVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 30;

    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateModelFit(inputs: SkillForecastInputs): number {
    const dataPoints = inputs.historicalDemand.length;
    const signalQuality = inputs.signals.length > 0
      ? inputs.signals.reduce((sum, s) => sum + s.strength, 0) / inputs.signals.length
      : 50;

    return Math.round((Math.min(100, dataPoints * 8) + signalQuality) / 2);
  }

  private calculateExpiry(horizon: ForecastHorizon): Date {
    const expiry = new Date();
    const months: Record<ForecastHorizon, number> = {
      '1_year': 1,
      '3_year': 2,
      '5_year': 4,
      '10_year': 6,
    };
    expiry.setMonth(expiry.getMonth() + months[horizon]);
    return expiry;
  }

  private generateInsights(
    inputs: SkillForecastInputs,
    scenarios: { optimistic: ForecastScenario; baseline: ForecastScenario; pessimistic: ForecastScenario },
    confidence: ForecastConfidence,
    trajectory: SkillForecastResult['demandTrajectory']
  ): string[] {
    const insights: string[] = [];

    // Trajectory insight
    const trajectoryDesc: Record<typeof trajectory, string> = {
      accelerating: 'Demand accelerating rapidly',
      growing: 'Steady growth in demand',
      stable: 'Demand remaining stable',
      declining: 'Demand declining',
    };
    insights.push(trajectoryDesc[trajectory]);

    // Scarcity insight
    const scarcity = this.calculateScarcity(inputs);
    if (scarcity > 70) {
      insights.push('High scarcity suggests strong market value');
    } else if (scarcity < 30) {
      insights.push('Low scarcity - skill widely available');
    }

    // Obsolescence insight
    if (inputs.obsolescenceRisk > 60) {
      insights.push('High obsolescence risk - consider skill lifecycle');
    }

    // Learning curve insight
    if (inputs.learningCurve > 180) {
      insights.push('Extended learning curve - significant time investment required');
    } else if (inputs.learningCurve < 30) {
      insights.push('Quick to learn - accessible skill');
    }

    // Confidence insight
    insights.push(`${confidence.level.replace('_', ' ')} confidence in forecast`);

    return insights;
  }

  private identifyRiskFactors(inputs: SkillForecastInputs): string[] {
    const risks: string[] = [];

    if (inputs.obsolescenceRisk > 60) {
      risks.push(`Obsolescence risk: ${inputs.obsolescenceRisk}/100`);
    }

    if (inputs.complexity > 80) {
      risks.push('High complexity may limit adoption');
    }

    if (inputs.careerPaths.length < 3) {
      risks.push('Limited career paths using this skill');
    }

    return risks;
  }

  private generateRecommendation(
    demand: number,
    scarcity: number,
    obsolescenceRisk: number,
    trajectory: SkillForecastResult['demandTrajectory']
  ): SkillForecastResult['recommendation'] {
    // High priority: high demand, high scarcity, low obsolescence
    if (demand > 75 && scarcity > 60 && obsolescenceRisk < 40) {
      return 'high_priority';
    }

    // Low priority: declining or high obsolescence
    if (trajectory === 'declining' || obsolescenceRisk > 70) {
      return 'low_priority';
    }

    // Valuable: good demand, manageable obsolescence
    if (demand > 60 && obsolescenceRisk < 60) {
      return 'valuable';
    }

    return 'optional';
  }

  private estimateRelevanceHorizon(inputs: SkillForecastInputs): number {
    // Estimate years until skill becomes obsolete
    // Based on obsolescence risk and current trajectory
    const baseHorizon = inputs.obsolescenceRisk > 70 ? 2 : inputs.obsolescenceRisk > 50 ? 5 : 10;

    const demandTrend = this.analyzeTrend(inputs.historicalDemand);
    if (demandTrend.direction === 'decreasing') {
      return Math.max(1, baseHorizon - 2);
    }

    return baseHorizon;
  }

  private cacheForecast(skillId: string, horizon: ForecastHorizon, forecast: Forecast): void {
    if (!this.forecasts.has(skillId)) {
      this.forecasts.set(skillId, new Map());
    }
    this.forecasts.get(skillId)!.set(horizon, forecast);
  }
}

/**
 * Factory function for SkillForecastEngine.
 */
export function createSkillForecastEngine(
  config?: Partial<SkillForecastConfig>
): SkillForecastEngine {
  return new SkillForecastEngine(config);
}
