/**
 * CareerOS Market Intelligence - Career Forecast Engine
 *
 * Generates forecasts for careers.
 *
 * Forecasts:
 * - Career demand
 * - Career growth
 * - Career opportunity
 * - Career resilience
 *
 * Examples:
 * - Software Engineer
 * - Cybersecurity Engineer
 * - Doctor
 * - Chartered Accountant
 */

import type { Forecast } from './models/Forecast';
import { createForecast, calculateExpectedValues } from './models/Forecast';
import type { ForecastScenario } from './models/ForecastScenario';
import type { ForecastConfidence } from './models/ForecastConfidence';
import type { ForecastEvidence } from './models/ForecastEvidence';
import type { ForecastHorizon } from './models/Forecast';
import { ScenarioGenerator, createScenarioGenerator } from './ScenarioGenerator';
import { ConfidenceForecastEngine, createConfidenceForecastEngine } from './ConfidenceForecastEngine';

/**
 * Career forecast inputs.
 */
export interface CareerForecastInputs {
  /** Career ID */
  careerId: string;

  /** Career title */
  title: string;

  /** Historical demand data */
  historicalDemand: Array<{ timestamp: Date; value: number }>;

  /** Historical salary data */
  historicalSalary: Array<{ timestamp: Date; value: number }>;

  /** Growth trend */
  growthTrend: Array<{ timestamp: Date; value: number }>;

  /** Market signals */
  signals: Array<{
    timestamp: Date;
    type: string;
    strength: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;

  /** Supporting evidence */
  evidence: ForecastEvidence[];

  /** Related skills */
  relatedSkills: string[];

  /** Industry alignment */
  industryAlignment: string[];

  /** Automation risk score (0-100) */
  automationRisk: number;

  /** Career resilience indicators */
  resilienceIndicators: {
    skillTransferability: number;
    educationBarrier: number;
    geographicFlexibility: number;
  };
}

/**
 * Career forecast result.
 */
export interface CareerForecastResult {
  /** The generated forecast */
  forecast: Forecast;

  /** Key insights */
  insights: string[];

  /** Risk assessment */
  riskAssessment: {
    automationRisk: number;
    marketSaturationRisk: number;
    geographicConstraint: number;
  };

  /** Comparison to similar careers */
  peerComparison?: {
    percentile: number;
    strongerThan: string[];
    weakerThan: string[];
  };
}

/**
 * Career forecast configuration.
 */
export interface CareerForecastConfig {
  /** Base variance for scenarios */
  scenarioVariance: number;

  /** Automation impact weight */
  automationWeight: number;

  /** Minimum data points required */
  minDataPoints: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_CAREER_FORECAST_CONFIG: CareerForecastConfig = {
  scenarioVariance: 12,
  automationWeight: 0.3,
  minDataPoints: 6,
};

/**
 * Career Forecast Engine.
 */
export class CareerForecastEngine {
  private config: CareerForecastConfig;
  private scenarioGenerator: ScenarioGenerator;
  private confidenceEngine: ConfidenceForecastEngine;

  // Forecast cache
  private forecasts: Map<string, Map<ForecastHorizon, Forecast>> = new Map();

  constructor(config?: Partial<CareerForecastConfig>) {
    this.config = { ...DEFAULT_CAREER_FORECAST_CONFIG, ...config };
    this.scenarioGenerator = createScenarioGenerator();
    this.confidenceEngine = createConfidenceForecastEngine();
  }

  /**
   * Generate forecast for a career.
   */
  generateForecast(
    inputs: CareerForecastInputs,
    horizon: ForecastHorizon
  ): CareerForecastResult {
    // Validate inputs
    if (inputs.historicalDemand.length < this.config.minDataPoints) {
      return this.generateLowConfidenceForecast(inputs, horizon);
    }

    // Extract latest values
    const latestDemand = this.getLatestValue(inputs.historicalDemand);
    const latestGrowth = this.getLatestValue(inputs.growthTrend);

    // Analyze trends
    const demandTrend = this.analyzeTrend(inputs.historicalDemand);
    const growthTrend = this.analyzeTrend(inputs.growthTrend);

    // Calculate base projections
    const horizonYears = this.getHorizonYears(horizon);
    const baseDemand = this.projectValue(latestDemand, demandTrend, horizonYears);
    const baseGrowth = this.projectValue(latestGrowth, growthTrend, horizonYears);

    // Adjust for automation risk
    const adjustedDemand = this.adjustForAutomation(
      baseDemand,
      inputs.automationRisk,
      horizonYears
    );

    // Generate scenarios
    const context = this.scenarioGenerator.createContext({
      historicalDemand: inputs.historicalDemand.map((d) => d.value),
      historicalGrowth: inputs.growthTrend.map((g) => g.value),
      signals: inputs.signals,
      volatility: this.calculateVolatility(inputs.historicalDemand),
    });

    const scenarios = this.scenarioGenerator.generateScenarios({
      ...context,
      baseDemand: adjustedDemand,
      baseSalary: 50, // Neutral baseline
      baseGrowth: baseGrowth,
      baseOpportunity: Math.round((adjustedDemand + baseGrowth) / 2),
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

    // Create forecast
    const forecast = createForecast({
      entityId: inputs.careerId,
      entityType: 'career',
      entityName: inputs.title,
      horizon,
      optimisticScenario: scenarios.optimistic,
      baselineScenario: scenarios.baseline,
      pessimisticScenario: scenarios.pessimistic,
      confidence,
      scenarioProbabilities: probabilities,
      expectedValue: calculateExpectedValues(scenarios, probabilities),
      status: 'ready',
      generatedAt: new Date(),
      expiresAt: this.calculateExpiry(horizon),
      version: 1,
      inputs: {
        dataPoints: inputs.historicalDemand.length,
        timeRange: {
          start: inputs.historicalDemand[0]?.timestamp ?? new Date(),
          end: inputs.historicalDemand[inputs.historicalDemand.length - 1]?.timestamp ?? new Date(),
        },
        sources: [...new Set(inputs.evidence.map((e) => e.source))],
      },
      insights: this.generateInsights(inputs, scenarios, confidence),
      riskFactors: this.identifyRiskFactors(inputs),
      methodology: [
        'Trend-based projection',
        'Scenario analysis with automation adjustment',
        'Confidence-weighted aggregation',
      ],
    });

    // Cache forecast
    this.cacheForecast(inputs.careerId, horizon, forecast);

    return {
      forecast,
      insights: forecast.insights,
      riskAssessment: {
        automationRisk: inputs.automationRisk,
        marketSaturationRisk: this.assessMarketSaturation(inputs),
        geographicConstraint: 100 - inputs.resilienceIndicators.geographicFlexibility,
      },
    };
  }

  /**
   * Get cached forecast.
   */
  getForecast(careerId: string, horizon: ForecastHorizon): Forecast | null {
    return this.forecasts.get(careerId)?.get(horizon) ?? null;
  }

  /**
   * Compare career forecasts.
   */
  compareCareers(
    careers: Array<{ careerId: string; forecast: Forecast }>
  ): Array<{
    careerId: string;
    rank: number;
    demandScore: number;
    growthScore: number;
    overallScore: number;
  }> {
    const scored = careers.map((c) => {
      const demand =
        typeof c.forecast.baselineScenario.demandProjection === 'number'
          ? c.forecast.baselineScenario.demandProjection
          : c.forecast.baselineScenario.demandProjection.expected;

      const growth =
        typeof c.forecast.baselineScenario.growthProjection === 'number'
          ? c.forecast.baselineScenario.growthProjection
          : c.forecast.baselineScenario.growthProjection.expected;

      return {
        careerId: c.careerId,
        demandScore: demand,
        growthScore: growth,
        overallScore: Math.round((demand + growth) / 2),
      };
    });

    // Sort by overall score
    scored.sort((a, b) => b.overallScore - a.overallScore);

    // Add ranks
    return scored.map((c, i) => ({ ...c, rank: i + 1 }));
  }

  /**
   * Identify emerging career patterns.
   */
  identifyPatterns(careers: CareerForecastInputs[]): {
    rising: string[];
    stable: string[];
    declining: string[];
    highVolatility: string[];
  } {
    const rising: string[] = [];
    const stable: string[] = [];
    const declining: string[] = [];
    const highVolatility: string[] = [];

    for (const career of careers) {
      const trend = this.analyzeTrend(career.historicalDemand);
      const volatility = this.calculateVolatility(career.historicalDemand);

      if (trend.direction === 'increasing' && trend.strength > 60) {
        rising.push(career.title);
      } else if (trend.direction === 'decreasing' && trend.strength > 40) {
        declining.push(career.title);
      } else {
        stable.push(career.title);
      }

      if (volatility > 30) {
        highVolatility.push(career.title);
      }
    }

    return { rising, stable, declining, highVolatility };
  }

  // Private methods

  private generateLowConfidenceForecast(
    inputs: CareerForecastInputs,
    horizon: ForecastHorizon
  ): CareerForecastResult {
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
      entityId: inputs.careerId,
      entityType: 'career',
      entityName: inputs.title,
      horizon,
      optimisticScenario: scenarios.optimistic,
      baselineScenario: scenarios.baseline,
      pessimisticScenario: scenarios.pessimistic,
      confidence,
      scenarioProbabilities: { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 },
      expectedValue: calculateExpectedValues(scenarios, { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 }),
      status: 'ready',
      generatedAt: new Date(),
      expiresAt: this.calculateExpiry(horizon),
      version: 1,
      inputs: {
        dataPoints: inputs.historicalDemand.length,
        timeRange: { start: new Date(), end: new Date() },
        sources: [],
      },
      insights: ['Insufficient historical data for high-confidence forecast'],
      riskFactors: ['Unknown due to limited data'],
      methodology: ['Low-data fallback with wide uncertainty ranges'],
    });

    return {
      forecast,
      insights: forecast.insights,
      riskAssessment: {
        automationRisk: inputs.automationRisk,
        marketSaturationRisk: 50,
        geographicConstraint: 50,
      },
    };
  }

  private getLatestValue(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length === 0) return 50;
    return data[data.length - 1]!.value;
  }

  private analyzeTrend(data: Array<{ timestamp: Date; value: number }>): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
  } {
    if (data.length < 2) return { direction: 'stable', strength: 0 };

    const values = data.map((d) => d.value);
    const first = values[0]!;
    const last = values[values.length - 1]!;
    const change = last - first;

    const direction =
      Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing';

    const strength = Math.min(100, Math.abs(change) * 2);

    return { direction, strength };
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

  private adjustForAutomation(
    baseDemand: number,
    automationRisk: number,
    years: number
  ): number {
    const automationImpact = automationRisk * this.config.automationWeight * (years / 5);
    return Math.max(0, baseDemand - automationImpact);
  }

  private calculateVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 30;

    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateModelFit(inputs: CareerForecastInputs): number {
    // Simple model fit based on data quality
    const dataPoints = inputs.historicalDemand.length;
    const signalQuality = inputs.signals.length > 0
      ? inputs.signals.reduce((sum, s) => sum + s.strength, 0) / inputs.signals.length
      : 50;

    return Math.round((Math.min(100, dataPoints * 5) + signalQuality) / 2);
  }

  private calculateExpiry(horizon: ForecastHorizon): Date {
    const expiry = new Date();
    const months: Record<ForecastHorizon, number> = {
      '1_year': 1,
      '3_year': 3,
      '5_year': 6,
      '10_year': 12,
    };
    expiry.setMonth(expiry.getMonth() + months[horizon]);
    return expiry;
  }

  private generateInsights(
    inputs: CareerForecastInputs,
    scenarios: { optimistic: ForecastScenario; baseline: ForecastScenario; pessimistic: ForecastScenario },
    confidence: ForecastConfidence
  ): string[] {
    const insights: string[] = [];

    // Trend insight
    const trend = this.analyzeTrend(inputs.historicalDemand);
    if (trend.direction === 'increasing') {
      insights.push(`Demand showing ${trend.strength > 70 ? 'strong' : 'moderate'} upward momentum`);
    } else if (trend.direction === 'decreasing') {
      insights.push(`Demand declining at ${trend.strength > 50 ? 'concerning' : 'moderate'} rate`);
    }

    // Automation insight
    if (inputs.automationRisk > 70) {
      insights.push('High automation risk may impact long-term demand');
    } else if (inputs.automationRisk < 30) {
      insights.push('Low automation risk supports career stability');
    }

    // Confidence insight
    insights.push(`${confidence.level.replace('_', ' ')} confidence in forecast`);

    // Scenario spread
    const optDemand = typeof scenarios.optimistic.demandProjection === 'number'
      ? scenarios.optimistic.demandProjection
      : scenarios.optimistic.demandProjection.expected;
    const pesDemand = typeof scenarios.pessimistic.demandProjection === 'number'
      ? scenarios.pessimistic.demandProjection
      : scenarios.pessimistic.demandProjection.expected;
    const spread = optDemand - pesDemand;

    if (spread > 30) {
      insights.push('Wide scenario range indicates significant uncertainty');
    }

    return insights;
  }

  private identifyRiskFactors(inputs: CareerForecastInputs): string[] {
    const risks: string[] = [];

    if (inputs.automationRisk > 60) {
      risks.push(`Automation risk: ${inputs.automationRisk}/100`);
    }

    if (inputs.resilienceIndicators.skillTransferability < 50) {
      risks.push('Limited skill transferability');
    }

    if (inputs.resilienceIndicators.educationBarrier > 70) {
      risks.push('High education barriers may constrain supply');
    }

    return risks;
  }

  private assessMarketSaturation(inputs: CareerForecastInputs): number {
    // Simple heuristic: if growth is flat or declining with low volatility, market may be saturated
    const trend = this.analyzeTrend(inputs.growthTrend);
    const volatility = this.calculateVolatility(inputs.growthTrend);

    if (trend.direction === 'stable' && volatility < 20) {
      return 70; // Likely saturated
    }

    return 40; // Uncertain
  }

  private cacheForecast(careerId: string, horizon: ForecastHorizon, forecast: Forecast): void {
    if (!this.forecasts.has(careerId)) {
      this.forecasts.set(careerId, new Map());
    }
    this.forecasts.get(careerId)!.set(horizon, forecast);
  }
}

/**
 * Factory function for CareerForecastEngine.
 */
export function createCareerForecastEngine(
  config?: Partial<CareerForecastConfig>
): CareerForecastEngine {
  return new CareerForecastEngine(config);
}
