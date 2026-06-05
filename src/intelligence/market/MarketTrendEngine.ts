/**
 * CareerOS Market Intelligence - Market Trend Engine
 *
 * Analyzes market movement through time.
 * Converts signal history into understandable trends.
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from './models/MarketSignal';
import type {
  MarketTrend,
  MarketTrendDirection,
  MarketTrendMomentum,
  MarketTrendType,
  CareerTrendAnalysis,
  TrendChangeDetection,
  TrendThresholds,
  DEFAULT_TREND_THRESHOLDS,
} from './models/MarketTrend';
import type { MarketRepository } from './repositories/MarketRepository';
import { TREND_CALCULATION_WEIGHTS, TREND_TIME_WINDOW_WEIGHTS } from './constants/MarketWeights';

/**
 * Configuration for MarketTrendEngine.
 */
export interface MarketTrendEngineConfig {
  /** Minimum data points for trend analysis */
  minDataPoints: number;

  /** Maximum data age (days) */
  maxDataAgeDays: number;

  /** Analysis window (days) */
  analysisWindowDays: number;

  /** Enable projections */
  enableProjections: boolean;

  /** Projection horizon (months) */
  projectionMonths: number;

  /** Trend thresholds */
  thresholds: TrendThresholds;
}

/**
 * Default configuration.
 */
export const DEFAULT_MARKET_TREND_ENGINE_CONFIG: MarketTrendEngineConfig = {
  minDataPoints: 3,
  maxDataAgeDays: 180,
  analysisWindowDays: 90,
  enableProjections: true,
  projectionMonths: 6,
  thresholds: DEFAULT_TREND_THRESHOLDS,
};

/**
 * Linear regression result.
 */
interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

/**
 * Analyzes market trends from signal history.
 */
export class MarketTrendEngine {
  private config: MarketTrendEngineConfig;
  private repository: MarketRepository;

  constructor(repository: MarketRepository, config?: Partial<MarketTrendEngineConfig>) {
    this.repository = repository;
    this.config = { ...DEFAULT_MARKET_TREND_ENGINE_CONFIG, ...config };
  }

  /**
   * Analyze trend for a career and trend type.
   */
  async analyzeTrend(
    careerId: string,
    trendType: MarketTrendType,
    signals?: NormalizedMarketSignal[]
  ): Promise<MarketTrend | null> {
    // Get signals if not provided
    const trendSignals =
      signals ??
      (await this.repository.getNormalizedSignalsByCareer(careerId, {
        startDate: new Date(Date.now() - this.config.maxDataAgeDays * 24 * 60 * 60 * 1000),
      }));

    // Filter signals by type
    const typeSignals = trendSignals.filter((s) => this.mapSignalToTrendType(s.signalType) === trendType);

    if (typeSignals.length < this.config.minDataPoints) {
      return null;
    }

    // Calculate trend components
    const direction = this.calculateDirection(typeSignals);
    const momentum = this.calculateMomentum(typeSignals);
    const strength = this.calculateStrength(typeSignals);
    const rateOfChange = this.calculateRateOfChange(typeSignals);
    const confidence = this.calculateConfidence(typeSignals);

    // Calculate projection
    const projection = this.config.enableProjections
      ? this.calculateProjection(typeSignals, direction, rateOfChange)
      : undefined;

    // Build evidence
    const evidence = {
      signalIds: typeSignals.map((s) => s.id),
      keyEvents: this.extractKeyEvents(typeSignals),
    };

    return {
      id: `trend-${careerId}-${trendType}-${Date.now()}`,
      careerId,
      trendType,
      direction,
      momentum,
      strength,
      rateOfChange,
      confidence,
      dataPoints: typeSignals.length,
      analysisPeriod: {
        start: new Date(Math.min(...typeSignals.map((s) => s.timestamp.getTime()))),
        end: new Date(Math.max(...typeSignals.map((s) => s.timestamp.getTime()))),
      },
      calculatedAt: new Date(),
      projection,
      evidence,
    };
  }

  /**
   * Analyze all trends for a career.
   */
  async analyzeCareerTrends(careerId: string): Promise<CareerTrendAnalysis | null> {
    const signals = await this.repository.getNormalizedSignalsByCareer(careerId, {
      startDate: new Date(Date.now() - this.config.maxDataAgeDays * 24 * 60 * 60 * 1000),
    });

    if (signals.length < this.config.minDataPoints) {
      return null;
    }

    // Analyze each trend type
    const trendTypes: MarketTrendType[] = [
      'demand',
      'salary',
      'growth',
      'competition',
      'automation_risk',
      'skill_demand',
      'hiring_rate',
    ];

    const trends: Record<string, MarketTrend> = {};

    for (const trendType of trendTypes) {
      const trend = await this.analyzeTrend(careerId, trendType, signals);
      if (trend) {
        trends[trendType] = trend;
      }
    }

    // Calculate overall trend
    const overallTrend = this.calculateOverallTrend(Object.values(trends));

    // Calculate trend coherence
    const trendCoherence = this.calculateTrendCoherence(Object.values(trends));

    // Calculate risk assessment
    const riskAssessment = this.calculateRiskAssessment(Object.values(trends));

    return {
      careerId,
      overallTrend,
      trends,
      trendCoherence,
      riskAssessment,
      lastUpdated: new Date(),
    };
  }

  /**
   * Detect significant trend changes.
   */
  async detectTrendChanges(
    careerId: string,
    trendType: MarketTrendType,
    currentTrend: MarketTrend
  ): Promise<TrendChangeDetection> {
    // Get historical trend data
    const history = await this.repository.getHistoricalTrends(careerId, trendType, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    });

    if (history.length < 2) {
      return {
        careerId,
        hasSignificantChange: false,
        alertLevel: 'none',
        detectedAt: new Date(),
      };
    }

    // Calculate change
    const previousValue = history[history.length - 2].value;
    const currentValue = history[history.length - 1].value;
    const changeMagnitude = Math.abs(currentValue - previousValue);

    // Determine if significant
    const hasSignificantChange = changeMagnitude > 15;

    // Determine change type
    let changeType: TrendChangeDetection['changeType'] | undefined;
    if (hasSignificantChange) {
      if (previousValue < currentValue) {
        changeType = 'acceleration';
      } else {
        changeType = 'deceleration';
      }
    }

    // Determine alert level
    let alertLevel: TrendChangeDetection['alertLevel'] = 'none';
    if (changeMagnitude > 30) alertLevel = 'critical';
    else if (changeMagnitude > 20) alertLevel = 'high';
    else if (changeMagnitude > 10) alertLevel = 'medium';
    else if (changeMagnitude > 5) alertLevel = 'low';

    return {
      careerId,
      hasSignificantChange,
      changeType,
      changeMagnitude,
      previousTrend: this.classifyDirection(previousValue),
      currentTrend: this.classifyDirection(currentValue),
      alertLevel,
      detectedAt: new Date(),
    };
  }

  /**
   * Map signal type to trend type.
   */
  private mapSignalToTrendType(signalType: string): MarketTrendType {
    const mapping: Record<string, MarketTrendType> = {
      job_postings: 'demand',
      salary_growth: 'salary',
      skill_growth: 'skill_demand',
      layoffs: 'demand',
      government_push: 'growth',
      startup_activity: 'growth',
      investment_flow: 'growth',
    };

    return mapping[signalType] ?? 'demand';
  }

  /**
   * Calculate trend direction using linear regression.
   */
  private calculateDirection(signals: NormalizedMarketSignal[]): MarketTrendDirection {
    const regression = this.calculateLinearRegression(signals);

    const monthlyChange = regression.slope * 30; // Convert daily to monthly

    const { thresholds } = this.config;

    if (monthlyChange >= thresholds.rapidGrowthThreshold) return MarketTrendDirection.RAPID_GROWTH;
    if (monthlyChange >= thresholds.growthThreshold) return MarketTrendDirection.GROWTH;
    if (monthlyChange <= thresholds.rapidDeclineThreshold) return MarketTrendDirection.RAPID_DECLINE;
    if (monthlyChange <= thresholds.declineThreshold) return MarketTrendDirection.DECLINING;
    return MarketTrendDirection.STABLE;
  }

  /**
   * Calculate trend momentum.
   */
  private calculateMomentum(signals: NormalizedMarketSignal[]): MarketTrendMomentum {
    if (signals.length < 5) return MarketTrendMomentum.STEADY;

    // Split into two halves
    const mid = Math.floor(signals.length / 2);
    const firstHalf = signals.slice(0, mid);
    const secondHalf = signals.slice(mid);

    // Calculate growth rates
    const firstGrowth = this.calculateGrowthRate(firstHalf);
    const secondGrowth = this.calculateGrowthRate(secondHalf);

    // Compare
    if (secondGrowth > firstGrowth * 1.2) return MarketTrendMomentum.ACCELERATING;
    if (secondGrowth < firstGrowth * 0.8) return MarketTrendMomentum.DECELERATING;
    if (Math.sign(secondGrowth) !== Math.sign(firstGrowth)) return MarketTrendMomentum.REVERSING;
    return MarketTrendMomentum.STEADY;
  }

  /**
   * Calculate trend strength.
   */
  private calculateStrength(signals: NormalizedMarketSignal[]): number {
    const regression = this.calculateLinearRegression(signals);

    // R² indicates how well the trend fits (strength)
    const r2Strength = regression.r2 * 100;

    // Magnitude of change
    const maxValue = Math.max(...signals.map((s) => s.normalizedStrength));
    const minValue = Math.min(...signals.map((s) => s.normalizedStrength));
    const magnitudeStrength = ((maxValue - minValue) / 100) * 100;

    // Combine
    return Math.round(r2Strength * 0.6 + magnitudeStrength * 0.4);
  }

  /**
   * Calculate rate of change (% per month).
   */
  private calculateRateOfChange(signals: NormalizedMarketSignal[]): number {
    const regression = this.calculateLinearRegression(signals);
    return Math.round(regression.slope * 30 * 100) / 100; // Monthly rate
  }

  /**
   * Calculate trend confidence.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    const regression = this.calculateLinearRegression(signals);

    // More data points = higher confidence
    const dataPointConfidence = Math.min(100, signals.length * 10);

    // Higher R² = higher confidence
    const fitConfidence = regression.r2 * 100;

    // Average signal confidence
    const signalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;

    // Combine
    return Math.round(dataPointConfidence * 0.3 + fitConfidence * 0.4 + signalConfidence * 0.3);
  }

  /**
   * Calculate linear regression.
   */
  private calculateLinearRegression(signals: NormalizedMarketSignal[]): LinearRegressionResult {
    const n = signals.length;
    const points = signals.map((s) => ({
      x: s.timestamp.getTime(),
      y: s.normalizedStrength,
    }));

    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const ssResidual = points.reduce(
      (sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2),
      0
    );
    const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

    return { slope, intercept, r2 };
  }

  /**
   * Calculate growth rate.
   */
  private calculateGrowthRate(signals: NormalizedMarketSignal[]): number {
    if (signals.length < 2) return 0;

    const first = signals[0].normalizedStrength;
    const last = signals[signals.length - 1].normalizedStrength;

    if (first === 0) return last > 0 ? 100 : 0;

    return ((last - first) / first) * 100;
  }

  /**
   * Calculate trend projection.
   */
  private calculateProjection(
    signals: NormalizedMarketSignal[],
    direction: MarketTrendDirection,
    rateOfChange: number
  ): MarketTrend['projection'] {
    const currentStrength = signals[signals.length - 1].normalizedStrength;

    // Project 6 months
    const projectedStrength6M = Math.max(0, Math.min(100, currentStrength + rateOfChange * 6));

    // Project 12 months
    const projectedStrength12M = Math.max(0, Math.min(100, currentStrength + rateOfChange * 12));

    // Determine projected direction
    const projectedDirection =
      rateOfChange > 1
        ? MarketTrendDirection.GROWTH
        : rateOfChange < -1
          ? MarketTrendDirection.DECLINING
          : MarketTrendDirection.STABLE;

    return {
      projectedDirection,
      projectedStrength6M: Math.round(projectedStrength6M),
      projectedStrength12M: Math.round(projectedStrength12M),
      projectionConfidence: Math.round(70 - Math.abs(rateOfChange) * 2), // Lower confidence for distant projections
    };
  }

  /**
   * Calculate overall career trend.
   */
  private calculateOverallTrend(trends: MarketTrend[]): CareerTrendAnalysis['overallTrend'] {
    if (trends.length === 0) {
      return { direction: MarketTrendDirection.STABLE, strength: 0, confidence: 0 };
    }

    // Weight by importance
    const weights: Record<MarketTrendType, number> = {
      demand: 0.3,
      salary: 0.25,
      growth: 0.2,
      competition: 0.1,
      automation_risk: 0.1,
      skill_demand: 0.05,
      hiring_rate: 0.0, // Included in demand
    };

    let totalWeight = 0;
    let weightedStrength = 0;
    let weightedConfidence = 0;

    // Track direction counts
    const directionCounts: Record<MarketTrendDirection, number> = {
      [MarketTrendDirection.RAPID_GROWTH]: 0,
      [MarketTrendDirection.GROWTH]: 0,
      [MarketTrendDirection.STABLE]: 0,
      [MarketTrendDirection.DECLINING]: 0,
      [MarketTrendDirection.RAPID_DECLINE]: 0,
    };

    for (const trend of trends) {
      const weight = weights[trend.trendType] ?? 0.1;
      totalWeight += weight;
      weightedStrength += trend.strength * weight;
      weightedConfidence += trend.confidence * weight;
      directionCounts[trend.direction] += weight;
    }

    // Determine overall direction
    let direction = MarketTrendDirection.STABLE;
    let maxWeight = directionCounts[MarketTrendDirection.STABLE];

    for (const [dir, count] of Object.entries(directionCounts)) {
      if (count > maxWeight) {
        maxWeight = count;
        direction = dir as MarketTrendDirection;
      }
    }

    return {
      direction,
      strength: Math.round(weightedStrength / totalWeight),
      confidence: Math.round(weightedConfidence / totalWeight),
    };
  }

  /**
   * Calculate trend coherence.
   */
  private calculateTrendCoherence(trends: MarketTrend[]): number {
    if (trends.length < 2) return 100;

    // Count aligned trends
    let aligned = 0;
    const overallDirection = trends[0].direction;

    for (const trend of trends) {
      if (this.areDirectionsAligned(trend.direction, overallDirection)) {
        aligned++;
      }
    }

    return Math.round((aligned / trends.length) * 100);
  }

  /**
   * Calculate risk assessment.
   */
  private calculateRiskAssessment(
    trends: MarketTrend[]
  ): CareerTrendAnalysis['riskAssessment'] {
    const automationTrend = trends.find((t) => t.trendType === 'automation_risk');
    const demandTrend = trends.find((t) => t.trendType === 'demand');

    return {
      trendReversalRisk: Math.round(100 - this.calculateTrendCoherence(trends)),
      volatilityRisk: automationTrend ? Math.round(automationTrend.strength) : 50,
      dataQualityRisk: Math.round(
        100 -
          (trends.reduce((sum, t) => sum + t.confidence, 0) / Math.max(trends.length, 1))
      ),
    };
  }

  /**
   * Extract key events from signals.
   */
  private extractKeyEvents(
    signals: NormalizedMarketSignal[]
  ): Array<{ date: Date; description: string; impact: number }> {
    // Sort by strength (descending)
    const sorted = [...signals].sort((a, b) => b.normalizedStrength - a.normalizedStrength);

    // Take top 3 and bottom 3 as key events
    const topEvents = sorted.slice(0, 3).map((s) => ({
      date: s.timestamp,
      description: `${s.signalType} signal from ${s.source}`,
      impact: s.normalizedStrength,
    }));

    const bottomEvents = sorted.slice(-3).map((s) => ({
      date: s.timestamp,
      description: `${s.signalType} signal from ${s.source}`,
      impact: -s.normalizedStrength,
    }));

    return [...topEvents, ...bottomEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Check if two directions are aligned.
   */
  private areDirectionsAligned(a: MarketTrendDirection, b: MarketTrendDirection): boolean {
    const positive = [MarketTrendDirection.RAPID_GROWTH, MarketTrendDirection.GROWTH];
    const negative = [MarketTrendDirection.RAPID_DECLINE, MarketTrendDirection.DECLINING];

    if (positive.includes(a) && positive.includes(b)) return true;
    if (negative.includes(a) && negative.includes(b)) return true;
    if (a === MarketTrendDirection.STABLE && b === MarketTrendDirection.STABLE) return true;

    return false;
  }

  /**
   * Classify direction from value.
   */
  private classifyDirection(value: number): MarketTrendDirection {
    if (value >= 80) return MarketTrendDirection.RAPID_GROWTH;
    if (value >= 60) return MarketTrendDirection.GROWTH;
    if (value >= 40) return MarketTrendDirection.STABLE;
    if (value >= 20) return MarketTrendDirection.DECLINING;
    return MarketTrendDirection.RAPID_DECLINE;
  }
}

/**
 * Factory function for MarketTrendEngine.
 */
export function createMarketTrendEngine(
  repository: MarketRepository,
  config?: Partial<MarketTrendEngineConfig>
): MarketTrendEngine {
  return new MarketTrendEngine(repository, config);
}
