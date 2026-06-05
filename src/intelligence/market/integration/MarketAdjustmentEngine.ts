/**
 * CareerOS Market Intelligence - Market Adjustment Engine
 *
 * Adjusts confidence, opportunity estimates, and future resilience estimates
 * based on market conditions.
 *
 * Principle: Market intelligence is a modifier, not a primary decision-maker.
 *
 * Priority Order:
 * 1. Psychological Fit
 * 2. Values Alignment
 * 3. Utility
 * 4. Optionality
 * 5. Future Resilience
 * 6. Market Intelligence (modifier)
 */

import type { Forecast } from '../forecasting/models/Forecast';
import type { MarketAwareCareerAnalysis } from './models/MarketAwareCareerAnalysis';

/**
 * Adjustment factors for a career.
 */
export interface CareerAdjustmentFactors {
  /** Base confidence (0-100) */
  baseConfidence: number;

  /** Base opportunity estimate (0-100) */
  baseOpportunity: number;

  /** Base future resilience (0-100) */
  baseResilience: number;

  /** Market conditions score (0-100) */
  marketScore: number;

  /** Market volatility (0-100) */
  marketVolatility: number;

  /** Trend direction */
  trendDirection: 'improving' | 'stable' | 'declining';

  /** Trend strength (0-100) */
  trendStrength: number;
}

/**
 * Adjustment result.
 */
export interface AdjustmentResult {
  /** Adjusted confidence */
  adjustedConfidence: number;

  /** Adjusted opportunity */
  adjustedOpportunity: number;

  /** Adjusted resilience */
  adjustedResilience: number;

  /** Confidence delta */
  confidenceDelta: number;

  /** Opportunity delta */
  opportunityDelta: number;

  /** Resilience delta */
  resilienceDelta: number;

  /** Explanation of adjustments */
  explanation: string[];

  /** Adjustment factors applied */
  factors: {
    marketBoost: number;
    trendAdjustment: number;
    volatilityAdjustment: number;
  };
}

/**
 * Adjustment engine configuration.
 */
export interface AdjustmentConfig {
  /** Maximum confidence adjustment (+/-) */
  maxConfidenceAdjustment: number;

  /** Maximum opportunity adjustment (+/-) */
  maxOpportunityAdjustment: number;

  /** Maximum resilience adjustment (+/-) */
  maxResilienceAdjustment: number;

  /** Market score threshold for positive adjustment */
  positiveThreshold: number;

  /** Market score threshold for negative adjustment */
  negativeThreshold: number;

  /** Volatility penalty factor */
  volatilityPenalty: number;

  /** Trend strength multiplier */
  trendMultiplier: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_ADJUSTMENT_CONFIG: AdjustmentConfig = {
  maxConfidenceAdjustment: 10,
  maxOpportunityAdjustment: 15,
  maxResilienceAdjustment: 10,
  positiveThreshold: 70,
  negativeThreshold: 50,
  volatilityPenalty: 0.3,
  trendMultiplier: 0.5,
};

/**
 * Market Adjustment Engine.
 */
export class MarketAdjustmentEngine {
  private config: AdjustmentConfig;

  constructor(config?: Partial<AdjustmentConfig>) {
    this.config = { ...DEFAULT_ADJUSTMENT_CONFIG, ...config };
  }

  /**
   * Calculate adjustments for a career.
   */
  calculateAdjustments(factors: CareerAdjustmentFactors): AdjustmentResult {
    const explanation: string[] = [];

    // Calculate market boost/penalty
    let marketBoost = 0;
    if (factors.marketScore >= this.config.positiveThreshold) {
      marketBoost = ((factors.marketScore - this.config.positiveThreshold) / (100 - this.config.positiveThreshold)) * 10;
      explanation.push(`Favorable market conditions provide +${Math.round(marketBoost)} point boost.`);
    } else if (factors.marketScore <= this.config.negativeThreshold) {
      marketBoost = -((this.config.negativeThreshold - factors.marketScore) / this.config.negativeThreshold) * 10;
      explanation.push(`Challenging market conditions reduce score by ${Math.round(Math.abs(marketBoost))} points.`);
    }

    // Calculate trend adjustment
    const trendAdjustment = this.calculateTrendAdjustment(
      factors.trendDirection,
      factors.trendStrength
    );

    if (trendAdjustment !== 0) {
      explanation.push(
        `${factors.trendDirection} trend (${factors.trendStrength}/100 strength) contributes ${trendAdjustment > 0 ? '+' : ''}${Math.round(trendAdjustment)} points.`
      );
    }

    // Calculate volatility adjustment
    const volatilityAdjustment = this.calculateVolatilityAdjustment(factors.marketVolatility);

    if (volatilityAdjustment < 0) {
      explanation.push(`High market volatility (${factors.marketVolatility}/100) introduces uncertainty, reducing confidence by ${Math.round(Math.abs(volatilityAdjustment))} points.`);
    }

    // Apply adjustments with caps
    const confidenceDelta = Math.max(
      -this.config.maxConfidenceAdjustment,
      Math.min(this.config.maxConfidenceAdjustment, marketBoost + volatilityAdjustment)
    );

    const opportunityDelta = Math.max(
      -this.config.maxOpportunityAdjustment,
      Math.min(this.config.maxOpportunityAdjustment, marketBoost + trendAdjustment)
    );

    const resilienceDelta = Math.max(
      -this.config.maxResilienceAdjustment,
      Math.min(this.config.maxResilienceAdjustment, trendAdjustment + volatilityAdjustment * 0.5)
    );

    // Calculate adjusted values
    const adjustedConfidence = Math.max(0, Math.min(100, Math.round(factors.baseConfidence + confidenceDelta)));
    const adjustedOpportunity = Math.max(0, Math.min(100, Math.round(factors.baseOpportunity + opportunityDelta)));
    const adjustedResilience = Math.max(0, Math.min(100, Math.round(factors.baseResilience + resilienceDelta)));

    return {
      adjustedConfidence,
      adjustedOpportunity,
      adjustedResilience,
      confidenceDelta: Math.round(confidenceDelta * 10) / 10,
      opportunityDelta: Math.round(opportunityDelta * 10) / 10,
      resilienceDelta: Math.round(resilienceDelta * 10) / 10,
      explanation,
      factors: {
        marketBoost: Math.round(marketBoost * 10) / 10,
        trendAdjustment: Math.round(trendAdjustment * 10) / 10,
        volatilityAdjustment: Math.round(volatilityAdjustment * 10) / 10,
      },
    };
  }

  /**
   * Apply adjustments to an existing analysis.
   */
  applyToAnalysis(
    analysis: MarketAwareCareerAnalysis,
    marketForecast: Forecast
  ): MarketAwareCareerAnalysis {
    // Extract market factors from forecast
    const factors: CareerAdjustmentFactors = {
      baseConfidence: analysis.confidence,
      baseOpportunity: analysis.utilityScore,
      baseResilience: analysis.resilienceScore,
      marketScore: analysis.marketScore,
      marketVolatility: this.extractVolatility(marketForecast),
      trendDirection: this.extractTrendDirection(marketForecast),
      trendStrength: this.extractTrendStrength(marketForecast),
    };

    const adjustments = this.calculateAdjustments(factors);

    // Update analysis
    return {
      ...analysis,
      confidence: adjustments.adjustedConfidence,
      resilienceScore: adjustments.adjustedResilience,
      marketAdjustment: adjustments.opportunityDelta,
      explanation: [...analysis.explanation, ...adjustments.explanation],
      riskFlags: this.updateRiskFlags(analysis.riskFlags, adjustments),
    };
  }

  /**
   * Calculate adjustment for multiple careers.
   */
  calculateBatchAdjustments(
    careers: Array<{
      careerId: string;
      factors: CareerAdjustmentFactors;
    }>
  ): Map<string, AdjustmentResult> {
    const results = new Map<string, AdjustmentResult>();

    for (const career of careers) {
      results.set(career.careerId, this.calculateAdjustments(career.factors));
    }

    return results;
  }

  /**
   * Get adjustment summary for a set of careers.
   */
  getAdjustmentSummary(
    adjustments: Map<string, AdjustmentResult>
  ): {
    averageConfidenceDelta: number;
    averageOpportunityDelta: number;
    positiveAdjustments: number;
    negativeAdjustments: number;
    neutralAdjustments: number;
  } {
    const values = Array.from(adjustments.values());

    if (values.length === 0) {
      return {
        averageConfidenceDelta: 0,
        averageOpportunityDelta: 0,
        positiveAdjustments: 0,
        negativeAdjustments: 0,
        neutralAdjustments: 0,
      };
    }

    const avgConfidence = values.reduce((sum, a) => sum + a.confidenceDelta, 0) / values.length;
    const avgOpportunity = values.reduce((sum, a) => sum + a.opportunityDelta, 0) / values.length;

    const positive = values.filter((a) => a.confidenceDelta > 2).length;
    const negative = values.filter((a) => a.confidenceDelta < -2).length;
    const neutral = values.length - positive - negative;

    return {
      averageConfidenceDelta: Math.round(avgConfidence * 10) / 10,
      averageOpportunityDelta: Math.round(avgOpportunity * 10) / 10,
      positiveAdjustments: positive,
      negativeAdjustments: negative,
      neutralAdjustments: neutral,
    };
  }

  // Private methods

  private calculateTrendAdjustment(
    direction: CareerAdjustmentFactors['trendDirection'],
    strength: number
  ): number {
    const directionMultiplier: Record<typeof direction, number> = {
      improving: 1,
      stable: 0,
      declining: -1,
    };

    return directionMultiplier[direction] * strength * this.config.trendMultiplier;
  }

  private calculateVolatilityAdjustment(volatility: number): number {
    // High volatility reduces confidence
    if (volatility > 50) {
      return -(volatility - 50) * this.config.volatilityPenalty;
    }
    return 0;
  }

  private extractVolatility(forecast: Forecast): number {
    // Calculate from scenario spread
    const optDemand = typeof forecast.optimisticScenario.demandProjection === 'number'
      ? forecast.optimisticScenario.demandProjection
      : forecast.optimisticScenario.demandProjection.expected;

    const pesDemand = typeof forecast.pessimisticScenario.demandProjection === 'number'
      ? forecast.pessimisticScenario.demandProjection
      : forecast.pessimisticScenario.demandProjection.expected;

    return Math.min(100, optDemand - pesDemand);
  }

  private extractTrendDirection(forecast: Forecast): CareerAdjustmentFactors['trendDirection'] {
    const baselineGrowth = typeof forecast.baselineScenario.growthProjection === 'number'
      ? forecast.baselineScenario.growthProjection
      : forecast.baselineScenario.growthProjection.expected;

    if (baselineGrowth > 65) return 'improving';
    if (baselineGrowth < 45) return 'declining';
    return 'stable';
  }

  private extractTrendStrength(forecast: Forecast): number {
    const baselineGrowth = typeof forecast.baselineScenario.growthProjection === 'number'
      ? forecast.baselineScenario.growthProjection
      : forecast.baselineScenario.growthProjection.expected;

    return Math.round(Math.abs(baselineGrowth - 50) * 2);
  }

  private updateRiskFlags(
    existing: string[],
    adjustments: AdjustmentResult
  ): string[] {
    const flags = [...existing];

    if (adjustments.confidenceDelta < -5) {
      flags.push('market-confidence-reduction');
    }

    if (adjustments.factors.volatilityAdjustment < -3) {
      flags.push('high-market-volatility');
    }

    return [...new Set(flags)];
  }
}

/**
 * Factory function for MarketAdjustmentEngine.
 */
export function createMarketAdjustmentEngine(
  config?: Partial<AdjustmentConfig>
): MarketAdjustmentEngine {
  return new MarketAdjustmentEngine(config);
}
