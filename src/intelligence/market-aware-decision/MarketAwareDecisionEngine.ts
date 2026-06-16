/**
 * Market-Aware Decision Engine
 *
 * Main orchestrator that integrates market intelligence into recommendations
 * while preserving decision quality principles.
 *
 * ## Philosophy
 *
 * "Market intelligence should REFINE decisions, not DOMINATE them."
 *
 * Primary Factors (NEVER overridden):
 *   - Psychological Fit
 *   - Utility Alignment
 *   - Identity Congruence
 *   - Satisfaction Potential
 *   - Optionality
 *
 * Market Factors (adjusting influence only):
 *   - Market Opportunity
 *   - Trend Momentum
 *   - Risk Exposure
 *
 * ## Workflow
 *
 * ```
 * 1. Receive Decision Intelligence Results
 * 2. Calculate Market Adjustments
 * 3. Apply Override Protection
 * 4. Apply Risk Adjustments
 * 5. Apply Opportunity Boosts
 * 6. Check Stability
 * 7. Generate Narratives
 * 8. Output Market-Aware Recommendations
 * ```
 *
 * ## Example
 *
 * Input: Software Engineer recommendation with 75 fit score
 *        Market: Strong demand, good growth
 *
 * Output: Same recommendation with 82 adjusted score
 *         Protected from trend chasing
 *         Narrative emphasizes fit, mentions market support
 */

import type {
  MarketAwareDecisionResult,
  MarketAwareRecommendation,
  MarketIntelligenceReport,
  DecisionIntelligenceResult,
  OutcomeLearningSignal,
  MarketAwareDecisionEngineConfig,
  DecisionId,
} from './types.js';

import { DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG } from './types.js';

import { MarketAdjustmentCalculator } from './MarketAdjustmentCalculator.js';
import { MarketOverrideProtection } from './MarketOverrideProtection.js';
import { MarketRiskAdjustmentEngine } from './MarketRiskAdjustment.js';
import { MarketOpportunityBoostEngine } from './MarketOpportunityBoost.js';
import { RecommendationStabilityEngine } from './RecommendationStabilityEngine.js';
import { DecisionNarrativeGenerator } from './DecisionNarrativeGenerator.js';

// ============================================================================
// MARKET-AWARE DECISION ENGINE
// ============================================================================

export class MarketAwareDecisionEngine {
  private config: MarketAwareDecisionEngineConfig;

  // Sub-engines
  private adjustmentCalculator: MarketAdjustmentCalculator;
  private overrideProtection: MarketOverrideProtection;
  private riskAdjustmentEngine: MarketRiskAdjustmentEngine;
  private opportunityBoostEngine: MarketOpportunityBoostEngine;
  private stabilityEngine: RecommendationStabilityEngine;
  private narrativeGenerator: DecisionNarrativeGenerator;

  constructor(config: Partial<MarketAwareDecisionEngineConfig> = {}) {
    this.config = { ...DEFAULT_MARKET_AWARE_DECISION_ENGINE_CONFIG, ...config };

    // Initialize sub-engines
    this.adjustmentCalculator = new MarketAdjustmentCalculator(
      this.config.adjustmentCalculator
    );
    this.overrideProtection = new MarketOverrideProtection(
      this.config.overrideProtection
    );
    this.riskAdjustmentEngine = new MarketRiskAdjustmentEngine();
    this.opportunityBoostEngine = new MarketOpportunityBoostEngine();
    this.stabilityEngine = new RecommendationStabilityEngine(
      this.config.stability
    );
    this.narrativeGenerator = new DecisionNarrativeGenerator(
      this.config.narrative
    );
  }

  // ========================================================================
  // MAIN API
  // ========================================================================

  /**
   * Process recommendations with market awareness.
   */
  processRecommendations(
    decisionId: DecisionId,
    inputs: {
      decisions: DecisionIntelligenceResult[];
      marketIntelligence: Map<string, MarketIntelligenceReport>;
      outcomeSignals?: Map<string, OutcomeLearningSignal>;
    }
  ): MarketAwareDecisionResult {
    const recommendations: MarketAwareRecommendation[] = [];

    // Process each recommendation
    for (const decision of inputs.decisions) {
      const recommendation = this.processSingleRecommendation(
        decisionId,
        decision,
        inputs.marketIntelligence.get(decision.recommendationId),
        inputs.outcomeSignals?.get(decision.recommendationId)
      );

      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by final score
    recommendations.sort((a, b) => b.scores.final - a.scores.final);

    // Update rankings
    recommendations.forEach((rec, index) => {
      rec.rank = index + 1;
      rec.isTopRecommendation = index < 3;
    });

    // Get top recommendations
    const topRecommendations = recommendations.slice(0, 5);

    // Calculate market influence summary
    const marketInfluence = this.calculateMarketInfluence(recommendations);

    // Check decision quality preservation
    const decisionQualityPreserved = this.validateDecisionQualityPreservation(
      recommendations
    );

    return {
      id: `result_${decisionId}_${Date.now()}`,
      decisionId,
      recommendations,
      topRecommendations,
      marketInfluence,
      decisionQualityPreserved,
      generatedAt: Date.now(),
    };
  }

  /**
   * Process a single recommendation.
   */
  private processSingleRecommendation(
    decisionId: DecisionId,
    decision: DecisionIntelligenceResult,
    marketIntelligence?: MarketIntelligenceReport,
    outcomeSignal?: OutcomeLearningSignal
  ): MarketAwareRecommendation | null {
    // Skip if no market intelligence
    if (!marketIntelligence) {
      if (this.config.debug) {
        console.warn('No market intelligence available for a decision.');
      }
      return null;
    }

    const recommendationId = decision.recommendationId;

    // Step 1: Calculate market adjustment
    const marketAdjustment = this.adjustmentCalculator.calculateAdjustment(
      recommendationId,
      decision.originalScore,
      marketIntelligence
    );

    // Step 2: Evaluate override protection
    const overrideProtection = this.overrideProtection.evaluateProtection(
      decision,
      marketIntelligence,
      marketAdjustment.marketAdjustment
    );

    // Step 3: Detect trend chasing
    const trendDetection = this.overrideProtection.detectTrendChasing(
      decision,
      marketIntelligence
    );

    // Block if trend chasing detected
    if (trendDetection.recommendation === 'block') {
      if (this.config.debug) {
        console.log('Blocking a recommendation due to trend chasing detection.');
      }
      return null;
    }

    // Step 4: Calculate risk adjustment
    const riskAdjustment = this.riskAdjustmentEngine.calculateRiskAdjustment(
      recommendationId,
      decision,
      marketIntelligence
    );

    // Step 5: Calculate opportunity boost (if qualifies)
    const opportunityBoost = this.opportunityBoostEngine.calculateBoost(
      recommendationId,
      decision,
      marketIntelligence
    );

    // Step 6: Apply outcome learning signal if available
    let adjustedConfidence = this.applyOutcomeSignal(
      marketIntelligence.confidence,
      outcomeSignal
    );

    // Apply risk adjustment
    adjustedConfidence = riskAdjustment.adjustedConfidence;

    // Apply opportunity boost (only if no override protection)
    if (!overrideProtection.isProtected && opportunityBoost.wasBoosted) {
      adjustedConfidence = opportunityBoost.boostedConfidence;
    }

    // Step 7: Calculate final score
    let finalScore = marketAdjustment.adjustedScore;

    // Check stability
    const stabilityAssessment = this.stabilityEngine.assessStability(
      recommendationId,
      decisionId,
      finalScore,
      'Market-aware score update'
    );

    // Record stability
    const stability = this.stabilityEngine.recordUpdate(
      recommendationId,
      decisionId,
      finalScore,
      stabilityAssessment.reason
    );

    // Step 8: Generate narrative
    const tempRec: Partial<MarketAwareRecommendation> = {
      entityId: decision.recommendationId,
      entityType: 'career',
      entityName: 'Unknown',
      originalDecision: decision,
      marketIntelligence,
      marketAdjustment,
      overrideProtection,
      riskAdjustment: riskAdjustment.wasAdjusted ? riskAdjustment : undefined,
      opportunityBoost: opportunityBoost.wasBoosted ? opportunityBoost : undefined,
      stability,
      scores: {
        original: decision.originalScore,
        marketAdjusted: marketAdjustment.adjustedScore,
        final: finalScore,
      },
      confidence: adjustedConfidence,
    };

    const narrative = this.narrativeGenerator.generateNarrative(
      decisionId,
      recommendationId,
      tempRec as MarketAwareRecommendation
    );

    // Build final recommendation
    const recommendation: MarketAwareRecommendation = {
      id: `rec_${recommendationId}_${Date.now()}`,
      decisionId,
      recommendationId,
      entityId: decision.recommendationId,
      entityType: 'career',
      entityName: marketIntelligence.entityName,
      originalDecision: decision,
      marketIntelligence,
      marketAdjustment,
      overrideProtection,
      riskAdjustment: riskAdjustment.wasAdjusted ? riskAdjustment : undefined,
      opportunityBoost: opportunityBoost.wasBoosted ? opportunityBoost : undefined,
      stability,
      scores: {
        original: decision.originalScore,
        marketAdjusted: marketAdjustment.adjustedScore,
        final: Math.round(finalScore * 10) / 10,
      },
      confidence: Math.round(adjustedConfidence * 100) / 100,
      rank: 0, // Will be set after sorting
      isTopRecommendation: false, // Will be set after sorting
      narrative,
      generatedAt: Date.now(),
    };

    return recommendation;
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Apply outcome learning signal to confidence.
   */
  private applyOutcomeSignal(
    baseConfidence: number,
    outcomeSignal?: OutcomeLearningSignal
  ): number {
    if (!outcomeSignal || outcomeSignal.sampleSize < 10) {
      return baseConfidence;
    }

    // Weight outcome signal by sample size
    const weight = Math.min(0.3, outcomeSignal.sampleSize / 100);
    const outcomeScore = outcomeSignal.successRate * outcomeSignal.confidence;

    return baseConfidence * (1 - weight) + outcomeScore * weight;
  }

  /**
   * Calculate market influence summary.
   */
  private calculateMarketInfluence(
    recommendations: MarketAwareRecommendation[]
  ): MarketAwareDecisionResult['marketInfluence'] {
    const boostsApplied = recommendations.filter(
      r => r.opportunityBoost?.wasBoosted
    ).length;

    const penaltiesApplied = recommendations.filter(
      r => r.riskAdjustment?.wasAdjusted
    ).length;

    const protectionsTriggered = recommendations.filter(
      r => r.overrideProtection.isProtected
    ).length;

    const averageAdjustment = recommendations.reduce(
      (sum, r) => sum + r.marketAdjustment.marketAdjustment,
      0
    ) / recommendations.length;

    return {
      averageAdjustment: Math.round(averageAdjustment * 10) / 10,
      boostsApplied,
      penaltiesApplied,
      protectionsTriggered,
    };
  }

  /**
   * Validate that decision quality was preserved.
   */
  private validateDecisionQualityPreservation(
    recommendations: MarketAwareRecommendation[]
  ): boolean {
    for (const rec of recommendations) {
      const decision = rec.originalDecision;

      // Check 1: Low fit should not result in high final score
      if (decision.fit.overall < 50 && rec.scores.final > 70) {
        if (this.config.debug) {
          console.warn('Decision quality violation: low fit with high final score.');
        }
        return false;
      }

      // Check 2: High regret risk should be reflected
      if (decision.regretRisk > 70 && rec.scores.final > 75) {
        if (this.config.debug) {
          console.warn('Decision quality violation: high regret risk with high final score.');
        }
        return false;
      }

      // Check 3: Identity mismatch should limit score
      if (decision.identityCongruence < 40 && rec.scores.final > 65) {
        if (this.config.debug) {
          console.warn('Decision quality violation: low identity congruence with high final score.');
        }
        return false;
      }
    }

    return true;
  }

  // ========================================================================
  // PUBLIC UTILITY METHODS
  // ========================================================================

  /**
   * Get sub-engines for advanced usage.
   */
  getEngines(): {
    adjustmentCalculator: MarketAdjustmentCalculator;
    overrideProtection: MarketOverrideProtection;
    riskAdjustment: MarketRiskAdjustmentEngine;
    opportunityBoost: MarketOpportunityBoostEngine;
    stability: RecommendationStabilityEngine;
    narrative: DecisionNarrativeGenerator;
  } {
    return {
      adjustmentCalculator: this.adjustmentCalculator,
      overrideProtection: this.overrideProtection,
      riskAdjustment: this.riskAdjustmentEngine,
      opportunityBoost: this.opportunityBoostEngine,
      stability: this.stabilityEngine,
      narrative: this.narrativeGenerator,
    };
  }

  /**
   * Get configuration.
   */
  getConfig(): MarketAwareDecisionEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<MarketAwareDecisionEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize engines with new config
    this.adjustmentCalculator = new MarketAdjustmentCalculator(
      this.config.adjustmentCalculator
    );
    this.overrideProtection = new MarketOverrideProtection(
      this.config.overrideProtection
    );
    this.stabilityEngine = new RecommendationStabilityEngine(
      this.config.stability
    );
    this.narrativeGenerator = new DecisionNarrativeGenerator(
      this.config.narrative
    );
  }

  /**
   * Get stability engine for direct access.
   */
  getStabilityEngine(): RecommendationStabilityEngine {
    return this.stabilityEngine;
  }

  /**
   * Clear all cached data.
   */
  clearCache(): void {
    this.stabilityEngine.clear();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new MarketAwareDecisionEngine.
 */
export function createMarketAwareDecisionEngine(
  config?: Partial<MarketAwareDecisionEngineConfig>
): MarketAwareDecisionEngine {
  return new MarketAwareDecisionEngine(config);
}

/**
 * Quick process recommendations.
 */
export function quickProcess(
  decisionId: DecisionId,
  decisions: DecisionIntelligenceResult[],
  marketIntelligence: Map<string, MarketIntelligenceReport>
): MarketAwareDecisionResult {
  const engine = new MarketAwareDecisionEngine();
  return engine.processRecommendations(decisionId, {
    decisions,
    marketIntelligence,
  });
}
