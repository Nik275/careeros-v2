/**
 * Market Opportunity Boost
 *
 * Increases recommendation confidence when strong fit aligns with strong market.
 *
 * ## Philosophy
 *
 * "Strong fit + strong market = increased confidence"
 *
 * ## Boost Criteria
 *
 * | Fit Score | Market Score | Boost Amount |
 * |-----------|--------------|--------------|
 * | 80+ | 75+ | +10 to +15 |
 * | 70-79 | 70+ | +5 to +10 |
 * | 60-69 | 75+ | +2 to +5 |
 * | < 60 | Any | 0 (protected) |
 *
 * ## Opportunity Factors
 *
 * - High demand (+3 to +5)
 * - Strong salary growth (+2 to +4)
 * - Low competition (+2 to +3)
 * - Low automation risk (+1 to +3)
 * - Positive industry outlook (+2 to +3)
 *
 * Maximum boost: +15 points
 */

import type {
  MarketOpportunityBoost,
  DecisionIntelligenceResult,
  MarketIntelligenceReport,
  RecommendationId,
} from './types.js';

// ============================================================================
// MARKET OPPORTUNITY BOOST
// ============================================================================

export class MarketOpportunityBoostEngine {
  /** Maximum allowed boost */
  private readonly MAX_BOOST = 15;

  /** Minimum fit score to qualify for boost */
  private readonly MIN_FIT_FOR_BOOST = 60;

  /** High fit threshold for maximum boost */
  private readonly HIGH_FIT_THRESHOLD = 80;

  /**
   * Calculate opportunity boost for a recommendation.
   */
  calculateBoost(
    recommendationId: RecommendationId,
    decision: DecisionIntelligenceResult,
    marketIntelligence: MarketIntelligenceReport
  ): MarketOpportunityBoost {
    // Check if qualifies for boost
    if (!this.qualifiesForBoost(decision)) {
      return {
        recommendationId,
        wasBoosted: false,
        originalConfidence: marketIntelligence.confidence,
        boostedConfidence: marketIntelligence.confidence,
        confidenceBoost: 0,
        opportunityFactors: [],
        withinLimits: true,
        explanation: [
          `Fit score (${decision.fit.overall}) below minimum threshold (${this.MIN_FIT_FOR_BOOST}) for market boost`,
          'Boost blocked to prevent trend chasing',
        ],
      };
    }

    const originalConfidence = marketIntelligence.confidence;

    // Calculate boost components
    const opportunityFactors = this.identifyOpportunityFactors(marketIntelligence);

    // Calculate total boost
    let totalBoost = opportunityFactors.reduce((sum, f) => sum + f.contribution, 0);

    // Apply fit-based scaling
    totalBoost = this.scaleBoostByFit(decision.fit.overall, totalBoost);

    // Apply limits
    const withinLimits = totalBoost <= this.MAX_BOOST;
    totalBoost = Math.min(this.MAX_BOOST, Math.max(0, totalBoost));

    const boostedConfidence = Math.min(1, originalConfidence + totalBoost / 100);

    // Generate explanation
    const explanation = this.generateExplanation(
      opportunityFactors,
      totalBoost,
      decision.fit.overall,
      withinLimits
    );

    return {
      recommendationId,
      wasBoosted: totalBoost > 0,
      originalConfidence: Math.round(originalConfidence * 100) / 100,
      boostedConfidence: Math.round(boostedConfidence * 100) / 100,
      confidenceBoost: Math.round(totalBoost * 10) / 10,
      opportunityFactors,
      withinLimits,
      explanation,
    };
  }

  /**
   * Check if recommendation qualifies for market boost.
   */
  private qualifiesForBoost(decision: DecisionIntelligenceResult): boolean {
    // Must have minimum fit
    if (decision.fit.overall < this.MIN_FIT_FOR_BOOST) {
      return false;
    }

    // Must have reasonable utility alignment
    if (decision.utility.aligned < 50) {
      return false;
    }

    // Must not have high regret risk
    if (decision.regretRisk > 70) {
      return false;
    }

    return true;
  }

  /**
   * Identify opportunity factors from market intelligence.
   */
  private identifyOpportunityFactors(
    marketIntelligence: MarketIntelligenceReport
  ): MarketOpportunityBoost['opportunityFactors'] {
    const factors: MarketOpportunityBoost['opportunityFactors'] = [];
    const components = marketIntelligence.opportunity.scoreComponents;

    // High demand
    if (components.demand >= 75) {
      const contribution = Math.min(5, (components.demand - 70) / 5);
      factors.push({
        factor: 'High market demand',
        score: components.demand,
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    // Strong salary growth
    if (components.salaryGrowth >= 70) {
      const contribution = Math.min(4, (components.salaryGrowth - 65) / 5);
      factors.push({
        factor: 'Strong salary growth',
        score: components.salaryGrowth,
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    // Low competition (inverted score - higher is better)
    if (components.competition >= 70) {
      const contribution = Math.min(3, (components.competition - 65) / 5);
      factors.push({
        factor: 'Favorable competition level',
        score: components.competition,
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    // Low automation risk (inverted score)
    if (components.automationRisk >= 70) {
      const contribution = Math.min(3, (components.automationRisk - 65) / 5);
      factors.push({
        factor: 'Low automation risk',
        score: components.automationRisk,
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    // Positive future outlook
    if (components.futureOutlook >= 70) {
      const contribution = Math.min(3, (components.futureOutlook - 65) / 5);
      factors.push({
        factor: 'Positive industry outlook',
        score: components.futureOutlook,
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    // Emerging trend bonus
    if (marketIntelligence.trend.trendType === 'emerging') {
      const contribution = Math.min(3, marketIntelligence.trend.strength * 3);
      factors.push({
        factor: 'Emerging market trend',
        score: Math.round(marketIntelligence.trend.strength * 100),
        contribution: Math.round(contribution * 10) / 10,
      });
    }

    return factors;
  }

  /**
   * Scale boost amount based on fit score.
   */
  private scaleBoostByFit(fitScore: number, baseBoost: number): number {
    if (fitScore >= this.HIGH_FIT_THRESHOLD) {
      // Full boost for high fit
      return baseBoost;
    } else if (fitScore >= 70) {
      // 80% boost for good fit
      return baseBoost * 0.8;
    } else if (fitScore >= this.MIN_FIT_FOR_BOOST) {
      // 50% boost for acceptable fit
      return baseBoost * 0.5;
    }
    return 0;
  }

  /**
   * Generate boost explanation.
   */
  private generateExplanation(
    factors: MarketOpportunityBoost['opportunityFactors'],
    totalBoost: number,
    fitScore: number,
    withinLimits: boolean
  ): string[] {
    const explanation: string[] = [];

    if (totalBoost === 0) {
      explanation.push('No market opportunity boost applied.');
      return explanation;
    }

    // Primary reason
    explanation.push(`Strong personal fit (${fitScore}) aligned with favorable market conditions`);

    // List factors
    if (factors.length > 0) {
      explanation.push('Opportunity factors:');
      for (const factor of factors) {
        explanation.push(`  • ${factor.factor}: +${factor.contribution.toFixed(1)}`);
      }
    }

    // Total
    explanation.push(`Total market boost: +${totalBoost.toFixed(1)} points`);

    // Limit note
    if (!withinLimits) {
      explanation.push('Boost capped at maximum allowed limit');
    }

    // Philosophy reminder
    explanation.push('Market conditions enhance confidence but are not the primary reason for recommendation');

    return explanation;
  }

  /**
   * Batch process opportunity boosts.
   */
  calculateBatch(
    items: Array<{
      recommendationId: RecommendationId;
      decision: DecisionIntelligenceResult;
      marketIntelligence: MarketIntelligenceReport;
    }>
  ): MarketOpportunityBoost[] {
    return items.map(item =>
      this.calculateBoost(
        item.recommendationId,
        item.decision,
        item.marketIntelligence
      )
    );
  }

  /**
   * Get boost summary statistics.
   */
  getBoostSummary(
    boosts: MarketOpportunityBoost[]
  ): {
    totalBoosted: number;
    averageBoost: number;
    maxBoost: number;
    limitedCount: number;
  } {
    const boosted = boosts.filter(b => b.wasBoosted);

    if (boosted.length === 0) {
      return {
        totalBoosted: 0,
        averageBoost: 0,
        maxBoost: 0,
        limitedCount: 0,
      };
    }

    const boostValues = boosted.map(b => b.confidenceBoost);

    return {
      totalBoosted: boosted.length,
      averageBoost: boostValues.reduce((a, b) => a + b, 0) / boosted.length,
      maxBoost: Math.max(...boostValues),
      limitedCount: boosted.filter(b => !b.withinLimits).length,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketOpportunityBoostEngine(): MarketOpportunityBoostEngine {
  return new MarketOpportunityBoostEngine();
}

export function quickCalculateBoost(
  decision: DecisionIntelligenceResult,
  marketIntelligence: MarketIntelligenceReport
): MarketOpportunityBoost {
  const engine = new MarketOpportunityBoostEngine();
  return engine.calculateBoost('quick', decision, marketIntelligence);
}
