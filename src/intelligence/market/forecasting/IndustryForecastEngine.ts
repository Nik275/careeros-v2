/**
 * CareerOS Market Intelligence - Industry Forecast Engine
 *
 * Generates forecasts for industries.
 *
 * Forecasts:
 * - Industry expansion
 * - Hiring demand
 * - Investment activity
 *
 * Purpose: Help users understand which industries will grow.
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
 * Industry forecast inputs.
 */
export interface IndustryForecastInputs {
  /** Industry ID */
  industryId: string;

  /** Industry name */
  name: string;

  /** Industry category */
  category: string;

  /** Historical growth data */
  historicalGrowth: Array<{ timestamp: Date; value: number }>;

  /** Hiring data */
  hiringData: Array<{ timestamp: Date; count: number; growth: number }>;

  /** Investment data */
  investmentData: Array<{ timestamp: Date; amount: number; deals: number }>;

  /** Market signals */
  signals: Array<{
    timestamp: Date;
    type: string;
    strength: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;

  /** Supporting evidence */
  evidence: ForecastEvidence[];

  /** Key companies */
  keyCompanies: string[];

  /** Geographic concentration */
  geographicConcentration: number;

  /** Regulatory environment (0-100, higher = more favorable) */
  regulatoryScore: number;

  /** Technology disruption risk (0-100) */
  disruptionRisk: number;
}

/**
 * Industry forecast result.
 */
export interface IndustryForecastResult {
  /** The generated forecast */
  forecast: Forecast;

  /** Expansion assessment */
  expansionAssessment: {
    expansionLikelihood: number;
    expansionMagnitude: 'major' | 'moderate' | 'minor' | 'contraction';
  };

  /** Investment outlook */
  investmentOutlook: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

  /** Key drivers */
  keyDrivers: string[];

  /** Risk assessment */
  riskAssessment: {
    disruptionRisk: number;
    regulatoryRisk: number;
    marketRisk: number;
  };
}

/**
 * Industry forecast configuration.
 */
export interface IndustryForecastConfig {
  /** Base variance for scenarios */
  scenarioVariance: number;

  /** Investment weight in forecast */
  investmentWeight: number;

  /** Minimum data points required */
  minDataPoints: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_INDUSTRY_FORECAST_CONFIG: IndustryForecastConfig = {
  scenarioVariance: 18,
  investmentWeight: 0.25,
  minDataPoints: 6,
};

/**
 * Industry Forecast Engine.
 */
export class IndustryForecastEngine {
  private config: IndustryForecastConfig;
  private scenarioGenerator: ScenarioGenerator;
  private confidenceEngine: ConfidenceForecastEngine;

  // Forecast cache
  private forecasts: Map<string, Map<ForecastHorizon, Forecast>> = new Map();

  constructor(config?: Partial<IndustryForecastConfig>) {
    this.config = { ...DEFAULT_INDUSTRY_FORECAST_CONFIG, ...config };
    this.scenarioGenerator = createScenarioGenerator();
    this.confidenceEngine = createConfidenceForecastEngine();
  }

  /**
   * Generate forecast for an industry.
   */
  generateForecast(
    inputs: IndustryForecastInputs,
    horizon: ForecastHorizon
  ): IndustryForecastResult {
    // Validate inputs
    if (inputs.historicalGrowth.length < this.config.minDataPoints) {
      return this.generateLowConfidenceForecast(inputs, horizon);
    }

    // Extract latest values
    const latestGrowth = this.getLatestValue(inputs.historicalGrowth);
    const latestHiring = inputs.hiringData.length > 0
      ? inputs.hiringData[inputs.hiringData.length - 1]!.growth
      : 50;
    const latestInvestment = inputs.investmentData.length > 0
      ? this.calculateInvestmentScore(inputs.investmentData)
      : 50;

    // Analyze trends
    const growthTrend = this.analyzeTrend(inputs.historicalGrowth);

    // Calculate base projections
    const horizonYears = this.getHorizonYears(horizon);
    const baseGrowth = this.projectValue(latestGrowth, growthTrend, horizonYears);

    // Adjust for regulatory and disruption factors
    const adjustedGrowth = this.adjustForExternalFactors(
      baseGrowth,
      inputs.regulatoryScore,
      inputs.disruptionRisk,
      horizonYears
    );

    // Generate scenarios
    const context = this.scenarioGenerator.createContext({
      historicalDemand: inputs.historicalGrowth.map((g) => g.value),
      historicalGrowth: inputs.hiringData.map((h) => h.growth),
      signals: inputs.signals,
      volatility: this.calculateVolatility(inputs.historicalGrowth),
    });

    const scenarios = this.scenarioGenerator.generateScenarios({
      ...context,
      baseDemand: adjustedGrowth,
      baseSalary: 50,
      baseGrowth: adjustedGrowth,
      baseOpportunity: Math.round((adjustedGrowth + latestHiring) / 2),
    });

    // Calculate confidence
    const confidence = this.confidenceEngine.calculateConfidence({
      historicalData: inputs.historicalGrowth.map((g) => ({
        timestamp: g.timestamp,
        value: g.value,
        quality: 80,
      })),
      evidence: inputs.evidence,
      signals: inputs.signals,
      modelFit: this.calculateModelFit(inputs),
      horizonYears,
    });

    // Calculate scenario probabilities
    const probabilities = this.scenarioGenerator.adjustProbabilities(scenarios, inputs.signals);

    // Determine expansion magnitude
    const baselineGrowth =
      typeof scenarios.baseline.growthProjection === 'number'
        ? scenarios.baseline.growthProjection
        : scenarios.baseline.growthProjection.expected;

    const expansionMagnitude = this.determineExpansionMagnitude(baselineGrowth);

    // Create forecast
    const forecast = createForecast({
      entityId: inputs.industryId,
      entityType: 'industry',
      entityName: inputs.name,
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
        dataPoints: inputs.historicalGrowth.length,
        timeRange: {
          start: inputs.historicalGrowth[0]?.timestamp ?? new Date(),
          end: inputs.historicalGrowth[inputs.historicalGrowth.length - 1]?.timestamp ?? new Date(),
        },
        sources: [...new Set(inputs.evidence.map((e) => e.source))],
      },
      insights: this.generateInsights(inputs, scenarios, confidence),
      riskFactors: this.identifyRiskFactors(inputs),
      methodology: [
        'Multi-factor industry growth analysis',
        'Investment and hiring signal integration',
        'Regulatory and disruption risk adjustment',
      ],
    });

    // Cache forecast
    this.cacheForecast(inputs.industryId, horizon, forecast);

    return {
      forecast,
      expansionAssessment: {
        expansionLikelihood: Math.round(baselineGrowth),
        expansionMagnitude,
      },
      investmentOutlook: this.determineInvestmentOutlook(
        latestInvestment,
        growthTrend,
        inputs.regulatoryScore
      ),
      keyDrivers: this.identifyKeyDrivers(inputs),
      riskAssessment: {
        disruptionRisk: inputs.disruptionRisk,
        regulatoryRisk: 100 - inputs.regulatoryScore,
        marketRisk: this.calculateMarketRisk(inputs),
      },
    };
  }

  /**
   * Compare industry forecasts.
   */
  compareIndustries(
    industries: Array<{ industryId: string; forecast: Forecast }>
  ): Array<{
    industryId: string;
    rank: number;
    growthScore: number;
    opportunityScore: number;
    attractiveness: number;
  }> {
    const scored = industries.map((i) => {
      const growth =
        typeof i.forecast.baselineScenario.growthProjection === 'number'
          ? i.forecast.baselineScenario.growthProjection
          : i.forecast.baselineScenario.growthProjection.expected;

      const opportunity =
        typeof i.forecast.baselineScenario.opportunityProjection === 'number'
          ? i.forecast.baselineScenario.opportunityProjection
          : i.forecast.baselineScenario.opportunityProjection.expected;

      // Attractiveness = growth * confidence
      const attractiveness = Math.round(growth * (i.forecast.confidence.overall / 100));

      return {
        industryId: i.industryId,
        growthScore: growth,
        opportunityScore: opportunity,
        attractiveness,
      };
    });

    // Sort by attractiveness
    scored.sort((a, b) => b.attractiveness - a.attractiveness);

    // Add ranks
    return scored.map((i, idx) => ({ ...i, rank: idx + 1 }));
  }

  /**
   * Identify industry cycles.
   */
  identifyCycles(industries: IndustryForecastInputs[]): {
    expansion: string[];
    plateau: string[];
    contraction: string[];
    volatile: string[];
  } {
    const expansion: string[] = [];
    const plateau: string[] = [];
    const contraction: string[] = [];
    const volatile: string[] = [];

    for (const industry of industries) {
      const growthTrend = this.analyzeTrend(industry.historicalGrowth);
      const volatility = this.calculateVolatility(industry.historicalGrowth);

      if (volatility > 35) {
        volatile.push(industry.name);
      } else if (growthTrend.direction === 'increasing' && growthTrend.strength > 50) {
        expansion.push(industry.name);
      } else if (growthTrend.direction === 'decreasing' && growthTrend.strength > 30) {
        contraction.push(industry.name);
      } else {
        plateau.push(industry.name);
      }
    }

    return { expansion, plateau, contraction, volatile };
  }

  // Private methods

  private generateLowConfidenceForecast(
    inputs: IndustryForecastInputs,
    horizon: ForecastHorizon
  ): IndustryForecastResult {
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
      entityId: inputs.industryId,
      entityType: 'industry',
      entityName: inputs.name,
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
      expansionAssessment: {
        expansionLikelihood: 50,
        expansionMagnitude: 'minor',
      },
      investmentOutlook: 'neutral',
      keyDrivers: [],
      riskAssessment: {
        disruptionRisk: inputs.disruptionRisk,
        regulatoryRisk: 100 - inputs.regulatoryScore,
        marketRisk: 50,
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

  private calculateInvestmentScore(data: Array<{ timestamp: Date; amount: number; deals: number }>): number {
    if (data.length === 0) return 50;

    const latest = data[data.length - 1]!;
    const previous = data.length > 1 ? data[data.length - 2]! : { amount: latest.amount * 0.9, deals: latest.deals * 0.9 };

    // Investment growth
    const amountGrowth = ((latest.amount - previous.amount) / Math.max(1, previous.amount)) * 100;
    const dealsGrowth = ((latest.deals - previous.deals) / Math.max(1, previous.deals)) * 100;

    // Normalize to 0-100
    return Math.max(0, Math.min(100, 50 + (amountGrowth + dealsGrowth) / 2));
  }

  private adjustForExternalFactors(
    baseGrowth: number,
    regulatoryScore: number,
    disruptionRisk: number,
    years: number
  ): number {
    const regulatoryImpact = (regulatoryScore - 50) * 0.1;
    const disruptionImpact = disruptionRisk * 0.05 * years;

    return Math.max(0, Math.min(100, baseGrowth + regulatoryImpact - disruptionImpact));
  }

  private determineExpansionMagnitude(growth: number): IndustryForecastResult['expansionAssessment']['expansionMagnitude'] {
    if (growth > 80) return 'major';
    if (growth > 60) return 'moderate';
    if (growth > 40) return 'minor';
    return 'contraction';
  }

  private determineInvestmentOutlook(
    investmentScore: number,
    growthTrend: { direction: string; strength: number },
    regulatoryScore: number
  ): IndustryForecastResult['investmentOutlook'] {
    const score = investmentScore * 0.4 + (growthTrend.direction === 'increasing' ? growthTrend.strength : 0) * 0.4 + regulatoryScore * 0.2;

    if (score > 80) return 'very_positive';
    if (score > 65) return 'positive';
    if (score > 45) return 'neutral';
    if (score > 30) return 'negative';
    return 'very_negative';
  }

  private calculateVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 30;

    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateModelFit(inputs: IndustryForecastInputs): number {
    const dataPoints = inputs.historicalGrowth.length;
    const signalQuality = inputs.signals.length > 0
      ? inputs.signals.reduce((sum, s) => sum + s.strength, 0) / inputs.signals.length
      : 50;

    return Math.round((Math.min(100, dataPoints * 6) + signalQuality) / 2);
  }

  private calculateMarketRisk(inputs: IndustryForecastInputs): number {
    // Higher concentration = higher risk
    const concentrationRisk = inputs.geographicConcentration;

    // Fewer key companies = higher risk
    const companyRisk = inputs.keyCompanies.length < 5 ? 70 : 30;

    return Math.round((concentrationRisk + companyRisk) / 2);
  }

  private calculateExpiry(horizon: ForecastHorizon): Date {
    const expiry = new Date();
    const months: Record<ForecastHorizon, number> = {
      '1_year': 2,
      '3_year': 4,
      '5_year': 6,
      '10_year': 12,
    };
    expiry.setMonth(expiry.getMonth() + months[horizon]);
    return expiry;
  }

  private generateInsights(
    inputs: IndustryForecastInputs,
    scenarios: { optimistic: ForecastScenario; baseline: ForecastScenario; pessimistic: ForecastScenario },
    confidence: ForecastConfidence
  ): string[] {
    const insights: string[] = [];

    const growthTrend = this.analyzeTrend(inputs.historicalGrowth);

    if (growthTrend.direction === 'increasing') {
      insights.push(`Growth trajectory shows ${growthTrend.strength > 70 ? 'strong' : 'moderate'} positive momentum`);
    } else if (growthTrend.direction === 'decreasing') {
      insights.push(`Industry facing headwinds with ${growthTrend.strength > 50 ? 'significant' : 'moderate'} decline`);
    }

    if (inputs.regulatoryScore > 70) {
      insights.push('Favorable regulatory environment supports expansion');
    } else if (inputs.regulatoryScore < 40) {
      insights.push('Regulatory challenges may constrain growth');
    }

    if (inputs.disruptionRisk > 60) {
      insights.push('Technology disruption risk requires monitoring');
    }

    if (inputs.keyCompanies.length > 10) {
      insights.push('Industry has diverse ecosystem of established players');
    }

    insights.push(`${confidence.level.replace('_', ' ')} confidence in forecast`);

    return insights;
  }

  private identifyRiskFactors(inputs: IndustryForecastInputs): string[] {
    const risks: string[] = [];

    if (inputs.disruptionRisk > 60) {
      risks.push(`Technology disruption risk: ${inputs.disruptionRisk}/100`);
    }

    if (inputs.regulatoryScore < 40) {
      risks.push('Unfavorable regulatory environment');
    }

    if (inputs.geographicConcentration > 70) {
      risks.push('High geographic concentration increases vulnerability');
    }

    if (inputs.keyCompanies.length < 5) {
      risks.push('Industry dominated by few players - concentration risk');
    }

    return risks;
  }

  private identifyKeyDrivers(inputs: IndustryForecastInputs): string[] {
    const drivers: string[] = [];

    if (inputs.investmentData.length > 0) {
      const recent = inputs.investmentData[inputs.investmentData.length - 1]!;
      if (recent.deals > 10) {
        drivers.push('Strong investment activity');
      }
    }

    if (inputs.hiringData.length > 0) {
      const recent = inputs.hiringData[inputs.hiringData.length - 1]!;
      if (recent.growth > 20) {
        drivers.push('Accelerating hiring');
      }
    }

    if (inputs.regulatoryScore > 70) {
      drivers.push('Supportive regulatory changes');
    }

    if (inputs.signals.some((s) => s.type === 'technology_shift' && s.strength > 70)) {
      drivers.push('Technology innovation driving growth');
    }

    return drivers;
  }

  private cacheForecast(industryId: string, horizon: ForecastHorizon, forecast: Forecast): void {
    if (!this.forecasts.has(industryId)) {
      this.forecasts.set(industryId, new Map());
    }
    this.forecasts.get(industryId)!.set(horizon, forecast);
  }
}

/**
 * Factory function for IndustryForecastEngine.
 */
export function createIndustryForecastEngine(
  config?: Partial<IndustryForecastConfig>
): IndustryForecastEngine {
  return new IndustryForecastEngine(config);
}
