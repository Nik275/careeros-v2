/**
 * CareerOS Market Intelligence - Market Opportunity Boost
 *
 * Increases recommendation confidence when both fit and market are strong.
 *
 * Principle: Strong fit + strong market = increased confidence.
 * Never recommend solely because of market demand.
 */

import type { MarketAwareCareerAnalysis } from './models/MarketAwareCareerAnalysis';

/**
 * Boost configuration.
 */
export interface BoostConfig {
  /** Fit threshold for strong fit */
  strongFitThreshold: number;

  /** Market threshold for strong market */
  strongMarketThreshold: number;

  /** Maximum confidence boost */
  maxBoost: number;

  /** Minimum confidence to apply boost */
  minBaseConfidence: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_BOOST_CONFIG: BoostConfig = {
  strongFitThreshold: 75,
  strongMarketThreshold: 75,
  maxBoost: 8,
  minBaseConfidence: 70,
};

/**
 * Boost result.
 */
export interface BoostResult {
  /** Whether boost was applied */
  applied: boolean;

  /** Boost amount */
  boostAmount: number;

  /** New confidence score */
  newConfidence: number;

  /** Explanation */
  explanation: string;

  /** Trigger factors */
  triggers: {
    strongFit: boolean;
    strongMarket: boolean;
    goodBaseConfidence: boolean;
  };
}

/**
 * Market Opportunity Boost Engine.
 */
export class MarketOpportunityBoost {
  private config: BoostConfig;

  constructor(config?: Partial<BoostConfig>) {
    this.config = { ...DEFAULT_BOOST_CONFIG, ...config };
  }

  /**
   * Evaluate and apply boost to analysis.
   */
  applyBoost(analysis: MarketAwareCareerAnalysis): BoostResult {
    const triggers = {
      strongFit: analysis.fitScore >= this.config.strongFitThreshold,
      strongMarket: analysis.marketScore >= this.config.strongMarketThreshold,
      goodBaseConfidence: analysis.confidence >= this.config.minBaseConfidence,
    };

    // Check if all conditions are met
    const allConditionsMet = triggers.strongFit && triggers.strongMarket && triggers.goodBaseConfidence;

    if (!allConditionsMet) {
      return {
        applied: false,
        boostAmount: 0,
        newConfidence: analysis.confidence,
        explanation: this.generateNoBoostExplanation(triggers),
        triggers,
      };
    }

    // Calculate boost
    const fitExcess = analysis.fitScore - this.config.strongFitThreshold;
    const marketExcess = analysis.marketScore - this.config.strongMarketThreshold;

    // Boost scales with how much scores exceed thresholds
    const boostBase = Math.min(fitExcess, marketExcess) / 5; // 1 point per 5 excess
    const boostAmount = Math.min(this.config.maxBoost, Math.round(boostBase));

    const newConfidence = Math.min(100, analysis.confidence + boostAmount);

    return {
      applied: true,
      boostAmount,
      newConfidence,
      explanation: `Strong fit (${analysis.fitScore}) and favorable market conditions (${analysis.marketScore}) increase recommendation confidence by ${boostAmount} points.`,
      triggers,
    };
  }

  /**
   * Evaluate boost without applying.
   */
  evaluateBoost(analysis: MarketAwareCareerAnalysis): BoostResult {
    return this.applyBoost(analysis);
  }

  /**
   * Batch apply boosts.
   */
  applyBatchBoosts(
    analyses: MarketAwareCareerAnalysis[]
  ): Array<{ analysis: MarketAwareCareerAnalysis; boost: BoostResult }> {
    return analyses.map((analysis) => ({
      analysis,
      boost: this.applyBoost(analysis),
    }));
  }

  /**
   * Get boost statistics.
   */
  getBoostStatistics(
    results: Array<{ analysis: MarketAwareCareerAnalysis; boost: BoostResult }>
  ): {
    totalAnalyzed: number;
    boostedCount: number;
    averageBoost: number;
    strongFitCount: number;
    strongMarketCount: number;
    alignmentCount: number;
  } {
    const boosted = results.filter((r) => r.boost.applied);
    const strongFit = results.filter((r) => r.boost.triggers.strongFit);
    const strongMarket = results.filter((r) => r.boost.triggers.strongMarket);
    const alignment = results.filter((r) => r.boost.triggers.strongFit && r.boost.triggers.strongMarket);

    const totalBoost = boosted.reduce((sum, r) => sum + r.boost.boostAmount, 0);

    return {
      totalAnalyzed: results.length,
      boostedCount: boosted.length,
      averageBoost: boosted.length > 0 ? Math.round((totalBoost / boosted.length) * 10) / 10 : 0,
      strongFitCount: strongFit.length,
      strongMarketCount: strongMarket.length,
      alignmentCount: alignment.length,
    };
  }

  /**
   * Find best alignment opportunities.
   */
  findAlignmentOpportunities(
    analyses: MarketAwareCareerAnalysis[],
    limit: number = 10
  ): MarketAwareCareerAnalysis[] {
    return analyses
      .filter(
        (a) =>
          a.fitScore >= this.config.strongFitThreshold &&
          a.marketScore >= this.config.strongMarketThreshold
      )
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
  }

  // Private methods

  private generateNoBoostExplanation(triggers: BoostResult['triggers']): string {
    const reasons: string[] = [];

    if (!triggers.strongFit) {
      reasons.push('fit below threshold');
    }

    if (!triggers.strongMarket) {
      reasons.push('market below threshold');
    }

    if (!triggers.goodBaseConfidence) {
      reasons.push('base confidence too low');
    }

    return `No confidence boost: ${reasons.join(', ')}.`;
  }
}

/**
 * Factory function.
 */
export function createMarketOpportunityBoost(
  config?: Partial<BoostConfig>
): MarketOpportunityBoost {
  return new MarketOpportunityBoost(config);
}
