/**
 * CareerOS Market Intelligence - Region Forecast Engine
 *
 * Generates forecasts for geographic regions.
 *
 * Forecasts:
 * - City growth
 * - Regional opportunity
 * - Remote opportunity growth
 *
 * Purpose: Help users understand where opportunities will emerge.
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
 * Region forecast inputs.
 */
export interface RegionForecastInputs {
  /** Region ID */
  regionId: string;

  /** Region name */
  name: string;

  /** Region type */
  type: 'city' | 'metro' | 'state' | 'country' | 'remote';

  /** Historical employment data */
  historicalEmployment: Array<{ timestamp: Date; value: number }>;

  /** Job growth data */
  jobGrowth: Array<{ timestamp: Date; value: number }>;

  /** Cost of living index (100 = national average) */
  costOfLiving: number;

  /** Remote work adoption rate */
  remoteWorkRate: number;

  /** Market signals */
  signals: Array<{
    timestamp: Date;
    type: string;
    strength: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;

  /** Supporting evidence */
  evidence: ForecastEvidence[];

  /** Key industries in region */
  keyIndustries: string[];

  /** Infrastructure score (0-100) */
  infrastructureScore: number;

  /** Quality of life score (0-100) */
  qualityOfLife: number;

  /** Migration trends (positive = in-migration) */
  migrationTrend: number;
}

/**
 * Region forecast result.
 */
export interface RegionForecastResult {
  /** The generated forecast */
  forecast: Forecast;

  /** Growth outlook */
  growthOutlook: 'rapid' | 'strong' | 'moderate' | 'slow' | 'declining';

  /** Opportunity assessment */
  opportunityAssessment: {
    opportunityLevel: number;
    competitiveness: 'high' | 'moderate' | 'low';
    remoteFriendly: boolean;
  };

  /** Cost-benefit analysis */
  costBenefit: {
    costAdjustedOpportunity: number;
    valueProposition: 'excellent' | 'good' | 'fair' | 'poor';
  };

  /** Key factors */
  keyFactors: {
    positive: string[];
    negative: string[];
  };
}

/**
 * Region forecast configuration.
 */
export interface RegionForecastConfig {
  /** Base variance for scenarios */
  scenarioVariance: number;

  /** Remote work weight in forecast */
  remoteWorkWeight: number;

  /** Cost of living adjustment factor */
  colAdjustmentFactor: number;

  /** Minimum data points required */
  minDataPoints: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_REGION_FORECAST_CONFIG: RegionForecastConfig = {
  scenarioVariance: 15,
  remoteWorkWeight: 0.2,
  colAdjustmentFactor: 0.3,
  minDataPoints: 6,
};

/**
 * Region Forecast Engine.
 */
export class RegionForecastEngine {
  private config: RegionForecastConfig;
  private scenarioGenerator: ScenarioGenerator;
  private confidenceEngine: ConfidenceForecastEngine;

  // Forecast cache
  private forecasts: Map<string, Map<ForecastHorizon, Forecast>> = new Map();

  constructor(config?: Partial<RegionForecastConfig>) {
    this.config = { ...DEFAULT_REGION_FORECAST_CONFIG, ...config };
    this.scenarioGenerator = createScenarioGenerator();
    this.confidenceEngine = createConfidenceForecastEngine();
  }

  /**
   * Generate forecast for a region.
   */
  generateForecast(
    inputs: RegionForecastInputs,
    horizon: ForecastHorizon
  ): RegionForecastResult {
    // Validate inputs
    if (inputs.historicalEmployment.length < this.config.minDataPoints) {
      return this.generateLowConfidenceForecast(inputs, horizon);
    }

    // Extract latest values
    const latestEmployment = this.getLatestValue(inputs.historicalEmployment);
    const latestGrowth = this.getLatestValue(inputs.jobGrowth);

    // Analyze trends
    const employmentTrend = this.analyzeTrend(inputs.historicalEmployment);
    const growthTrend = this.analyzeTrend(inputs.jobGrowth);

    // Calculate base projections
    const horizonYears = this.getHorizonYears(horizon);
    const baseEmployment = this.projectValue(latestEmployment, employmentTrend, horizonYears);
    const baseGrowth = this.projectValue(latestGrowth, growthTrend, horizonYears);

    // Adjust for cost of living and remote work
    const adjustedOpportunity = this.adjustForExternalFactors(
      baseEmployment,
      inputs.costOfLiving,
      inputs.remoteWorkRate,
      horizonYears
    );

    // Generate scenarios
    const context = this.scenarioGenerator.createContext({
      historicalDemand: inputs.historicalEmployment.map((e) => e.value),
      historicalGrowth: inputs.jobGrowth.map((g) => g.value),
      signals: inputs.signals,
      volatility: this.calculateVolatility(inputs.historicalEmployment),
    });

    const scenarios = this.scenarioGenerator.generateScenarios({
      ...context,
      baseDemand: adjustedOpportunity,
      baseSalary: Math.round(100 - (inputs.costOfLiving - 100) * 0.5),
      baseGrowth: baseGrowth,
      baseOpportunity: adjustedOpportunity,
    });

    // Calculate confidence
    const confidence = this.confidenceEngine.calculateConfidence({
      historicalData: inputs.historicalEmployment.map((e) => ({
        timestamp: e.timestamp,
        value: e.value,
        quality: 80,
      })),
      evidence: inputs.evidence,
      signals: inputs.signals,
      modelFit: this.calculateModelFit(inputs),
      horizonYears,
    });

    // Calculate scenario probabilities
    const probabilities = this.scenarioGenerator.adjustProbabilities(scenarios, inputs.signals);

    // Determine growth outlook
    const baselineGrowth =
      typeof scenarios.baseline.growthProjection === 'number'
        ? scenarios.baseline.growthProjection
        : scenarios.baseline.growthProjection.expected;

    const growthOutlook = this.determineGrowthOutlook(baselineGrowth, inputs.migrationTrend);

    // Calculate cost-benefit
    const costBenefit = this.calculateCostBenefit(adjustedOpportunity, inputs.costOfLiving);

    // Create forecast
    const forecast = createForecast({
      entityId: inputs.regionId,
      entityType: 'region',
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
        dataPoints: inputs.historicalEmployment.length,
        timeRange: {
          start: inputs.historicalEmployment[0]?.timestamp ?? new Date(),
          end: inputs.historicalEmployment[inputs.historicalEmployment.length - 1]?.timestamp ?? new Date(),
        },
        sources: [...new Set(inputs.evidence.map((e) => e.source))],
      },
      insights: this.generateInsights(inputs, scenarios, confidence),
      riskFactors: this.identifyRiskFactors(inputs),
      methodology: [
        'Regional employment trend analysis',
        'Cost of living and remote work adjustment',
        'Migration and infrastructure factor integration',
      ],
    });

    // Cache forecast
    this.cacheForecast(inputs.regionId, horizon, forecast);

    return {
      forecast,
      growthOutlook,
      opportunityAssessment: {
        opportunityLevel: Math.round(adjustedOpportunity),
        competitiveness: this.assessCompetitiveness(inputs),
        remoteFriendly: inputs.remoteWorkRate > 50,
      },
      costBenefit,
      keyFactors: this.identifyKeyFactors(inputs),
    };
  }

  /**
   * Compare region forecasts.
   */
  compareRegions(
    regions: Array<{ regionId: string; forecast: Forecast; costOfLiving: number }>
  ): Array<{
    regionId: string;
    rank: number;
    opportunityScore: number;
    costAdjustedScore: number;
    attractiveness: number;
  }> {
    const scored = regions.map((r) => {
      const opportunity =
        typeof r.forecast.baselineScenario.opportunityProjection === 'number'
          ? r.forecast.baselineScenario.opportunityProjection
          : r.forecast.baselineScenario.opportunityProjection.expected;

      // Cost-adjusted opportunity
      const costAdjusted = Math.round(opportunity * (100 / Math.max(50, r.costOfLiving)));

      // Attractiveness = opportunity * confidence / cost
      const attractiveness = Math.round(
        (opportunity * (r.forecast.confidence.overall / 100) * 100) / Math.max(50, r.costOfLiving)
      );

      return {
        regionId: r.regionId,
        opportunityScore: opportunity,
        costAdjustedScore: costAdjusted,
        attractiveness,
      };
    });

    // Sort by attractiveness
    scored.sort((a, b) => b.attractiveness - a.attractiveness);

    // Add ranks
    return scored.map((r, i) => ({ ...r, rank: i + 1 }));
  }

  /**
   * Identify remote-friendly regions.
   */
  identifyRemoteFriendly(regions: RegionForecastInputs[]): {
    highlyRemote: string[];
    moderatelyRemote: string[];
    traditional: string[];
  } {
    const highlyRemote: string[] = [];
    const moderatelyRemote: string[] = [];
    const traditional: string[] = [];

    for (const region of regions) {
      if (region.remoteWorkRate > 70) {
        highlyRemote.push(region.name);
      } else if (region.remoteWorkRate > 40) {
        moderatelyRemote.push(region.name);
      } else {
        traditional.push(region.name);
      }
    }

    return { highlyRemote, moderatelyRemote, traditional };
  }

  // Private methods

  private generateLowConfidenceForecast(
    inputs: RegionForecastInputs,
    horizon: ForecastHorizon
  ): RegionForecastResult {
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
      entityId: inputs.regionId,
      entityType: 'region',
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
      growthOutlook: 'moderate',
      opportunityAssessment: {
        opportunityLevel: 50,
        competitiveness: 'moderate',
        remoteFriendly: inputs.remoteWorkRate > 50,
      },
      costBenefit: {
        costAdjustedOpportunity: 50,
        valueProposition: 'fair',
      },
      keyFactors: {
        positive: [],
        negative: [],
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

  private adjustForExternalFactors(
    baseOpportunity: number,
    costOfLiving: number,
    remoteWorkRate: number,
    years: number
  ): number {
    // Cost of living adjustment (lower is better)
    const colAdjustment = (100 - costOfLiving) * this.config.colAdjustmentFactor;

    // Remote work bonus (increases opportunities)
    const remoteBonus = remoteWorkRate * this.config.remoteWorkWeight * (years / 5);

    return Math.max(0, Math.min(100, baseOpportunity + colAdjustment + remoteBonus));
  }

  private determineGrowthOutlook(
    growth: number,
    migrationTrend: number
  ): RegionForecastResult['growthOutlook'] {
    const combinedScore = growth * 0.6 + Math.max(0, migrationTrend) * 0.4;

    if (combinedScore > 80) return 'rapid';
    if (combinedScore > 65) return 'strong';
    if (combinedScore > 45) return 'moderate';
    if (combinedScore > 30) return 'slow';
    return 'declining';
  }

  private calculateCostBenefit(
    opportunity: number,
    costOfLiving: number
  ): RegionForecastResult['costBenefit'] {
    const costAdjusted = Math.round(opportunity * (100 / Math.max(50, costOfLiving)));

    let valueProposition: RegionForecastResult['costBenefit']['valueProposition'];
    if (costAdjusted > 80) valueProposition = 'excellent';
    else if (costAdjusted > 65) valueProposition = 'good';
    else if (costAdjusted > 45) valueProposition = 'fair';
    else valueProposition = 'poor';

    return {
      costAdjustedOpportunity: costAdjusted,
      valueProposition,
    };
  }

  private assessCompetitiveness(inputs: RegionForecastInputs): RegionForecastResult['opportunityAssessment']['competitiveness'] {
    // Higher migration + high quality of life = high competitiveness
    const competitivenessScore =
      Math.max(0, inputs.migrationTrend) * 0.4 + inputs.qualityOfLife * 0.3 + inputs.infrastructureScore * 0.3;

    if (competitivenessScore > 70) return 'high';
    if (competitivenessScore > 45) return 'moderate';
    return 'low';
  }

  private calculateVolatility(data: Array<{ timestamp: Date; value: number }>): number {
    if (data.length < 2) return 30;

    const values = data.map((d) => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }

  private calculateModelFit(inputs: RegionForecastInputs): number {
    const dataPoints = inputs.historicalEmployment.length;
    const signalQuality = inputs.signals.length > 0
      ? inputs.signals.reduce((sum, s) => sum + s.strength, 0) / inputs.signals.length
      : 50;

    return Math.round((Math.min(100, dataPoints * 6) + signalQuality) / 2);
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
    inputs: RegionForecastInputs,
    scenarios: { optimistic: ForecastScenario; baseline: ForecastScenario; pessimistic: ForecastScenario },
    confidence: ForecastConfidence
  ): string[] {
    const insights: string[] = [];

    const growthTrend = this.analyzeTrend(inputs.jobGrowth);

    if (growthTrend.direction === 'increasing') {
      insights.push(`Job market expanding with ${growthTrend.strength > 70 ? 'strong' : 'steady'} growth`);
    } else if (growthTrend.direction === 'decreasing') {
      insights.push(`Job market contracting - exercise caution`);
    }

    if (inputs.migrationTrend > 20) {
      insights.push('Strong in-migration indicates regional attractiveness');
    } else if (inputs.migrationTrend < -10) {
      insights.push('Out-migration trend may signal challenges');
    }

    if (inputs.remoteWorkRate > 60) {
      insights.push('High remote work adoption creates location flexibility');
    }

    if (inputs.costOfLiving < 90) {
      insights.push('Favorable cost of living enhances value proposition');
    } else if (inputs.costOfLiving > 130) {
      insights.push('High cost of living requires salary premium');
    }

    if (inputs.qualityOfLife > 75) {
      insights.push('Strong quality of life supports talent retention');
    }

    insights.push(`${confidence.level.replace('_', ' ')} confidence in forecast`);

    return insights;
  }

  private identifyRiskFactors(inputs: RegionForecastInputs): string[] {
    const risks: string[] = [];

    if (inputs.costOfLiving > 140) {
      risks.push(`High cost of living (${inputs.costOfLiving} vs 100 national average)`);
    }

    if (inputs.migrationTrend < -15) {
      risks.push('Significant out-migration trend');
    }

    if (inputs.infrastructureScore < 50) {
      risks.push('Infrastructure limitations may constrain growth');
    }

    if (inputs.keyIndustries.length < 3) {
      risks.push('Economic concentration in few industries');
    }

    return risks;
  }

  private identifyKeyFactors(inputs: RegionForecastInputs): RegionForecastResult['keyFactors'] {
    const positive: string[] = [];
    const negative: string[] = [];

    // Positive factors
    if (inputs.migrationTrend > 10) positive.push('Net in-migration');
    if (inputs.remoteWorkRate > 50) positive.push('Remote work friendly');
    if (inputs.qualityOfLife > 70) positive.push('High quality of life');
    if (inputs.infrastructureScore > 70) positive.push('Strong infrastructure');
    if (inputs.costOfLiving < 100) positive.push('Affordable cost of living');

    // Negative factors
    if (inputs.migrationTrend < -10) negative.push('Net out-migration');
    if (inputs.costOfLiving > 130) negative.push('High cost of living');
    if (inputs.infrastructureScore < 50) negative.push('Infrastructure gaps');
    if (inputs.qualityOfLife < 50) negative.push('Quality of life challenges');

    return { positive, negative };
  }

  private cacheForecast(regionId: string, horizon: ForecastHorizon, forecast: Forecast): void {
    if (!this.forecasts.has(regionId)) {
      this.forecasts.set(regionId, new Map());
    }
    this.forecasts.get(regionId)!.set(horizon, forecast);
  }
}

/**
 * Factory function for RegionForecastEngine.
 */
export function createRegionForecastEngine(
  config?: Partial<RegionForecastConfig>
): RegionForecastEngine {
  return new RegionForecastEngine(config);
}
