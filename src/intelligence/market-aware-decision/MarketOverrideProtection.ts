/**
 * Market Override Protection
 *
 * Prevents market trends from overriding core decision quality factors.
 *
 * ## Protected Factors (Never Overridden)
 *
 * | Factor | Threshold | Protection Trigger |
 * |--------|-----------|-------------------|
 * | Psychological Fit | < 60 | Block market boost |
 * | Utility Alignment | < 60 | Block market boost |
 * | Identity Congruence | < 50 | Block market boost |
 * | Optionality | < 40 | Limit market influence |
 *
 * ## Trend Chasing Prevention
 *
 * High demand + Low fit = BLOCKED
 * Hot market + Poor utility = BLOCKED
 * Popular career + Identity mismatch = BLOCKED
 *
 * ## Philosophy
 *
 * "A high-demand career with low fit must NEVER become
the top recommendation."
 */

import type {
  OverrideProtectionDecision,
  TrendChasingDetection,
  DecisionIntelligenceResult,
  MarketIntelligenceReport,
  OverrideProtectionConfig,
} from './types.js';

import { DEFAULT_OVERRIDE_PROTECTION_CONFIG } from './types.js';

// ============================================================================
// MARKET OVERRIDE PROTECTION
// ============================================================================

export class MarketOverrideProtection {
  private config: OverrideProtectionConfig;

  constructor(config: Partial<OverrideProtectionConfig> = {}) {
    this.config = { ...DEFAULT_OVERRIDE_PROTECTION_CONFIG, ...config };
  }

  /**
   * Evaluate whether market override should be protected against.
   */
  evaluateProtection(
    decision: DecisionIntelligenceResult,
    marketIntelligence: MarketIntelligenceReport,
    proposedMarketBoost: number
  ): OverrideProtectionDecision {
    const protectedFactors: OverrideProtectionDecision['protectedFactors'] = [];

    // Check psychological fit
    if (decision.fit.psychological < this.config.minimumFitScore) {
      protectedFactors.push({
        factor: 'Psychological Fit',
        score: decision.fit.psychological,
        threshold: this.config.minimumFitScore,
        violation: `Psychological fit (${decision.fit.psychological}) below minimum threshold (${this.config.minimumFitScore})`,
      });
    }

    // Check overall fit
    if (decision.fit.overall < this.config.minimumFitScore) {
      protectedFactors.push({
        factor: 'Overall Fit',
        score: decision.fit.overall,
        threshold: this.config.minimumFitScore,
        violation: `Overall fit (${decision.fit.overall}) below minimum threshold (${this.config.minimumFitScore})`,
      });
    }

    // Check utility alignment
    if (decision.utility.aligned < this.config.minimumUtilityScore) {
      protectedFactors.push({
        factor: 'Utility Alignment',
        score: decision.utility.aligned,
        threshold: this.config.minimumUtilityScore,
        violation: `Utility alignment (${decision.utility.aligned}) below minimum threshold (${this.config.minimumUtilityScore})`,
      });
    }

    // Check identity congruence
    if (decision.identityCongruence < 50) {
      protectedFactors.push({
        factor: 'Identity Congruence',
        score: decision.identityCongruence,
        threshold: 50,
        violation: `Identity congruence (${decision.identityCongruence}) indicates potential misalignment`,
      });
    }

    // Check if high-fit recommendation would be demoted
    if (this.config.protectHighFitRecommendations && decision.fit.overall >= this.config.highFitThreshold) {
      // High fit recommendations get protected from market penalties
      // This is handled separately in risk adjustment
    }

    // Determine if protection is needed
    const isProtected = protectedFactors.length > 0 && proposedMarketBoost > 0;

    // Generate reason
    let reason: string;
    if (isProtected) {
      reason = `Market boost of +${proposedMarketBoost.toFixed(1)} blocked to preserve decision quality. ${protectedFactors.length} factor(s) below minimum thresholds.`;
    } else if (protectedFactors.length > 0) {
      reason = `Factors below thresholds detected but no market boost proposed. Protection not triggered.`;
    } else {
      reason = 'All quality factors above minimum thresholds. Market adjustment allowed.';
    }

    // Calculate confidence
    const confidence = this.calculateProtectionConfidence(decision, protectedFactors);

    return {
      isProtected,
      reason,
      protectedFactors,
      wouldBeBoost: proposedMarketBoost,
      confidence,
    };
  }

  /**
   * Detect trend chasing behavior.
   */
  detectTrendChasing(
    decision: DecisionIntelligenceResult,
    marketIntelligence: MarketIntelligenceReport
  ): TrendChasingDetection {
    const indicators: string[] = [];
    let riskScore = 0;

    // Indicator 1: Low fit but high market opportunity
    if (decision.fit.overall < 60 && marketIntelligence.opportunity.opportunityScore > 75) {
      indicators.push('Low fit score with high market opportunity score');
      riskScore += 30;
    }

    // Indicator 2: Poor utility but strong trend
    if (decision.utility.aligned < 60 &&
        (marketIntelligence.trend.trendType === 'growing' || marketIntelligence.trend.trendType === 'emerging')) {
      indicators.push('Poor utility alignment with strong market trend');
      riskScore += 25;
    }

    // Indicator 3: High regret risk but hot market
    if (decision.regretRisk > 60 && marketIntelligence.opportunity.opportunityScore > 70) {
      indicators.push('High regret risk in hot market conditions');
      riskScore += 20;
    }

    // Indicator 4: Low identity congruence with popular career
    if (decision.identityCongruence < 50 && marketIntelligence.trend.strength > 0.7) {
      indicators.push('Identity mismatch with trending career path');
      riskScore += 25;
    }

    // Indicator 5: Low optionality but high demand
    if (decision.optionality < 40 && marketIntelligence.opportunity.scoreComponents.demand > 80) {
      indicators.push('Limited optionality in high-demand field');
      riskScore += 15;
    }

    // Determine recommendation
    let recommendation: TrendChasingDetection['recommendation'];
    if (riskScore >= 60) {
      recommendation = 'block';
    } else if (riskScore >= 40) {
      recommendation = 'warn';
    } else {
      recommendation = 'allow';
    }

    return {
      isTrendChasing: riskScore >= 40,
      riskScore: Math.min(100, riskScore),
      indicators,
      recommendation,
    };
  }

  /**
   * Check if market influence exceeds maximum allowed.
   */
  checkMarketInfluenceLimit(
    originalScore: number,
    marketAdjustedScore: number
  ): { exceedsLimit: boolean; allowedAdjustment: number; reason: string } {
    const adjustment = marketAdjustedScore - originalScore;
    const adjustmentPercent = Math.abs(adjustment) / originalScore;

    if (adjustmentPercent > this.config.maxMarketInfluence) {
      const maxAdjustment = originalScore * this.config.maxMarketInfluence;
      const allowedAdjustment = adjustment > 0 ? maxAdjustment : -maxAdjustment;

      return {
        exceedsLimit: true,
        allowedAdjustment: Math.round(allowedAdjustment * 10) / 10,
        reason: `Market influence (${(adjustmentPercent * 100).toFixed(1)}%) exceeds maximum allowed (${(this.config.maxMarketInfluence * 100).toFixed(1)}%). Adjustment limited.`,
      };
    }

    return {
      exceedsLimit: false,
      allowedAdjustment: adjustment,
      reason: 'Market influence within acceptable limits.',
    };
  }

  /**
   * Validate that recommendation preserves decision quality.
   */
  validateDecisionQuality(
    decision: DecisionIntelligenceResult,
    finalScore: number,
    marketIntelligence: MarketIntelligenceReport
  ): { isValid: boolean; violations: string[]; confidence: number } {
    const violations: string[] = [];

    // Check 1: Final score should not exceed what fit+utility would suggest
    const qualityBasedScore = (decision.fit.overall + decision.utility.aligned) / 2;
    if (finalScore > qualityBasedScore + 20) {
      violations.push(`Final score (${finalScore}) significantly exceeds quality-based score (${qualityBasedScore.toFixed(1)})`);
    }

    // Check 2: Low fit should prevent top-tier ranking
    if (decision.fit.overall < 50 && finalScore > 70) {
      violations.push(`Low fit score (${decision.fit.overall}) resulted in high final score (${finalScore})`);
    }

    // Check 3: High regret risk should be reflected in score
    if (decision.regretRisk > 70 && finalScore > 75) {
      violations.push(`High regret risk (${decision.regretRisk}) not adequately reflected in final score (${finalScore})`);
    }

    // Check 4: Trend should not override identity
    if (decision.identityCongruence < 40 && marketIntelligence.trend.strength > 0.8) {
      violations.push(`Strong market trend may be overriding identity mismatch`);
    }

    const isValid = violations.length === 0;
    const confidence = isValid ? 0.9 : 0.6;

    return { isValid, violations, confidence };
  }

  /**
   * Calculate protection confidence.
   */
  private calculateProtectionConfidence(
    decision: DecisionIntelligenceResult,
    protectedFactors: OverrideProtectionDecision['protectedFactors']
  ): number {
    // Higher confidence when factors are clearly below threshold
    if (protectedFactors.length === 0) {
      return 0.95; // High confidence that no protection needed
    }

    // Calculate average gap from threshold
    const avgGap = protectedFactors.reduce(
      (sum, f) => sum + (f.threshold - f.score),
      0
    ) / protectedFactors.length;

    // Higher gap = higher confidence protection is needed
    return Math.min(0.95, 0.7 + avgGap / 100);
  }

  /**
   * Get protection summary.
   */
  getProtectionSummary(
    decisions: Array<{
      decision: DecisionIntelligenceResult;
      protection: OverrideProtectionDecision;
      trendDetection: TrendChasingDetection;
    }>
  ): {
    total: number;
    protected: number;
    trendChasingBlocked: number;
    trendChasingWarned: number;
    averageConfidence: number;
  } {
    const protected = decisions.filter(d => d.protection.isProtected).length;
    const blocked = decisions.filter(d => d.trendDetection.recommendation === 'block').length;
    const warned = decisions.filter(d => d.trendDetection.recommendation === 'warn').length;

    const avgConfidence = decisions.reduce(
      (sum, d) => sum + d.protection.confidence,
      0
    ) / decisions.length;

    return {
      total: decisions.length,
      protected,
      trendChasingBlocked: blocked,
      trendChasingWarned: warned,
      averageConfidence: avgConfidence,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketOverrideProtection(
  config?: Partial<OverrideProtectionConfig>
): MarketOverrideProtection {
  return new MarketOverrideProtection(config);
}

export function quickEvaluateProtection(
  decision: DecisionIntelligenceResult,
  marketIntelligence: MarketIntelligenceReport,
  proposedMarketBoost: number
): OverrideProtectionDecision {
  const protection = new MarketOverrideProtection();
  return protection.evaluateProtection(decision, marketIntelligence, proposedMarketBoost);
}

export function quickDetectTrendChasing(
  decision: DecisionIntelligenceResult,
  marketIntelligence: MarketIntelligenceReport
): TrendChasingDetection {
  const protection = new MarketOverrideProtection();
  return protection.detectTrendChasing(decision, marketIntelligence);
}
