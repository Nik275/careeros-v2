/**
 * Market Risk Adjustment
 *
 * Adjusts recommendation confidence based on market risks
 * WITHOUT changing the recommendation's identity.
 *
 * ## Philosophy
 *
 * "Strong fit + declining market = adjusted confidence, NOT eliminated."
 *
 * ## Risk Response Patterns
 *
 * | Risk Type | Response | Impact |
 * |-----------|----------|--------|
 * | Declining demand | Reduce confidence | -10 to -20% |
 * | High automation | Reduce confidence | -15 to -25% |
 * | Industry weakness | Reduce confidence | -10 to -15% |
 * | Oversaturation | Reduce confidence | -5 to -15% |
 * | Multiple risks | Cumulative | Max -30% |
 *
 * ## Identity Preservation
 *
 * The recommendation stays in consideration.
 * Only the confidence in the recommendation changes.
 */

import type {
  MarketRiskAdjustment,
  DecisionIntelligenceResult,
  MarketIntelligenceReport,
  MarketRisk,
  RecommendationId,
} from './types.js';

// ============================================================================
// MARKET RISK ADJUSTMENT
// ============================================================================

export class MarketRiskAdjustmentEngine {
  /**
   * Calculate risk adjustment for a recommendation.
   */
  calculateRiskAdjustment(
    recommendationId: RecommendationId,
    decision: DecisionIntelligenceResult,
    marketIntelligence: MarketIntelligenceReport
  ): MarketRiskAdjustment {
    const risks = marketIntelligence.risks;

    if (risks.length === 0) {
      return {
        recommendationId,
        wasAdjusted: false,
        originalConfidence: marketIntelligence.confidence,
        adjustedConfidence: marketIntelligence.confidence,
        confidenceAdjustment: 0,
        triggeringRisks: [],
        identityPreserved: true,
        explanation: ['No significant market risks detected.'],
      };
    }

    // Calculate confidence adjustment
    const { adjustment, triggeringRisks } = this.calculateAdjustment(risks);

    // Apply high-fit protection
    const protectedAdjustment = this.applyHighFitProtection(
      decision,
      adjustment,
      triggeringRisks
    );

    const originalConfidence = marketIntelligence.confidence;
    const adjustedConfidence = Math.max(0.3, originalConfidence + protectedAdjustment.adjustment);

    // Generate explanation
    const explanation = this.generateExplanation(
      triggeringRisks,
      protectedAdjustment.adjustment,
      protectedAdjustment.wasProtected
    );

    return {
      recommendationId,
      wasAdjusted: protectedAdjustment.adjustment < 0,
      originalConfidence: Math.round(originalConfidence * 100) / 100,
      adjustedConfidence: Math.round(adjustedConfidence * 100) / 100,
      confidenceAdjustment: Math.round(protectedAdjustment.adjustment * 100) / 100,
      triggeringRisks: triggeringRisks.map(r => ({
        riskType: r.riskType,
        level: r.riskLevel,
        impact: r.riskScore,
      })),
      identityPreserved: true, // Always preserved in this engine
      explanation,
    };
  }

  /**
   * Calculate confidence adjustment from risks.
   */
  private calculateAdjustment(risks: MarketRisk[]): {
    adjustment: number;
    triggeringRisks: MarketRisk[];
  } {
    let totalAdjustment = 0;
    const triggeringRisks: MarketRisk[] = [];

    for (const risk of risks) {
      const riskAdjustment = this.getRiskAdjustmentAmount(risk);

      if (riskAdjustment < 0) {
        totalAdjustment += riskAdjustment;
        triggeringRisks.push(risk);
      }
    }

    // Cap maximum adjustment
    const maxAdjustment = -0.3; // Max -30% confidence reduction
    totalAdjustment = Math.max(maxAdjustment, totalAdjustment);

    return { adjustment: totalAdjustment, triggeringRisks };
  }

  /**
   * Get adjustment amount for a specific risk.
   */
  private getRiskAdjustmentAmount(risk: MarketRisk): number {
    const baseAdjustments: Record<MarketRisk['riskType'], number> = {
      'declining-demand': -0.15,
      'automation-exposure': -0.20,
      'industry-weakness': -0.12,
      'oversaturation': -0.10,
      'high-competition': -0.08,
      'salary-stagnation': -0.08,
      'skill-obsolescence': -0.12,
      'regional-decline': -0.10,
    };

    const baseAdjustment = baseAdjustments[risk.riskType] || -0.05;

    // Scale by risk level
    const levelMultipliers: Record<MarketRisk['riskLevel'], number> = {
      critical: 1.5,
      high: 1.2,
      medium: 1.0,
      low: 0.7,
      minimal: 0.4,
    };

    return baseAdjustment * levelMultipliers[risk.riskLevel];
  }

  /**
   * Apply protection for high-fit recommendations.
   *
   * Strong fit careers get protected from market risk penalties.
   */
  private applyHighFitProtection(
    decision: DecisionIntelligenceResult,
    adjustment: number,
    risks: MarketRisk[]
  ): { adjustment: number; wasProtected: boolean; protectionReason?: string } {
    // If no negative adjustment, no protection needed
    if (adjustment >= 0) {
      return { adjustment, wasProtected: false };
    }

    // High fit threshold
    const highFitThreshold = 80;
    const veryHighFitThreshold = 90;

    // Very high fit - significant protection
    if (decision.fit.overall >= veryHighFitThreshold) {
      const protectedAdjustment = adjustment * 0.3; // Reduce penalty by 70%
      return {
        adjustment: protectedAdjustment,
        wasProtected: true,
        protectionReason: `Very high fit (${decision.fit.overall}) reduces market risk impact`,
      };
    }

    // High fit - moderate protection
    if (decision.fit.overall >= highFitThreshold) {
      const protectedAdjustment = adjustment * 0.6; // Reduce penalty by 40%
      return {
        adjustment: protectedAdjustment,
        wasProtected: true,
        protectionReason: `High fit (${decision.fit.overall}) provides some market risk resilience`,
      };
    }

    // Check for strong utility alignment as secondary protection
    if (decision.utility.aligned >= 85) {
      const protectedAdjustment = adjustment * 0.8; // Reduce penalty by 20%
      return {
        adjustment: protectedAdjustment,
        wasProtected: true,
        protectionReason: `Strong utility alignment (${decision.utility.aligned}) provides modest protection`,
      };
    }

    return { adjustment, wasProtected: false };
  }

  /**
   * Generate explanation for risk adjustment.
   */
  private generateExplanation(
    risks: MarketRisk[],
    adjustment: number,
    wasProtected: boolean
  ): string[] {
    const explanation: string[] = [];

    if (risks.length === 0) {
      explanation.push('No significant market risks identified.');
      return explanation;
    }

    // List primary risks
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    const highRisks = risks.filter(r => r.riskLevel === 'high');

    if (criticalRisks.length > 0) {
      explanation.push(`${criticalRisks.length} critical risk(s) identified: ${criticalRisks.map(r => r.riskType).join(', ')}`);
    }

    if (highRisks.length > 0) {
      explanation.push(`${highRisks.length} high risk(s) identified: ${highRisks.map(r => r.riskType).join(', ')}`);
    }

    if (risks.length > criticalRisks.length + highRisks.length) {
      const otherCount = risks.length - criticalRisks.length - highRisks.length;
      explanation.push(`${otherCount} additional moderate/low risk(s) present`);
    }

    // Explain adjustment
    explanation.push(`Confidence adjusted by ${(adjustment * 100).toFixed(1)} percentage points due to market risks`);

    // Explain protection if applied
    if (wasProtected) {
      explanation.push('High fit score reduced the impact of market risks on confidence');
    }

    // Reassurance about identity preservation
    explanation.push('Recommendation remains valid - only confidence level adjusted');

    return explanation;
  }

  /**
   * Batch process risk adjustments.
   */
  calculateBatch(
    items: Array<{
      recommendationId: RecommendationId;
      decision: DecisionIntelligenceResult;
      marketIntelligence: MarketIntelligenceReport;
    }>
  ): MarketRiskAdjustment[] {
    return items.map(item =>
      this.calculateRiskAdjustment(
        item.recommendationId,
        item.decision,
        item.marketIntelligence
      )
    );
  }

  /**
   * Get risk summary statistics.
   */
  getRiskSummary(
    adjustments: MarketRiskAdjustment[]
  ): {
    totalAdjusted: number;
    averageAdjustment: number;
    protectedCount: number;
    criticalRisksFound: number;
  } {
    const adjusted = adjustments.filter(a => a.wasAdjusted);
    const protectedCount = adjustments.filter(a =>
      a.explanation.some(e => e.includes('fit'))
    );

    const criticalRisks = adjustments.reduce(
      (sum, a) => sum + a.triggeringRisks.filter(r => r.level === 'critical').length,
      0
    );

    return {
      totalAdjusted: adjusted.length,
      averageAdjustment: adjusted.length > 0
        ? adjusted.reduce((sum, a) => sum + a.confidenceAdjustment, 0) / adjusted.length
        : 0,
      protectedCount: protectedCount.length,
      criticalRisksFound: criticalRisks,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketRiskAdjustmentEngine(): MarketRiskAdjustmentEngine {
  return new MarketRiskAdjustmentEngine();
}

export function quickCalculateRiskAdjustment(
  decision: DecisionIntelligenceResult,
  marketIntelligence: MarketIntelligenceReport
): MarketRiskAdjustment {
  const engine = new MarketRiskAdjustmentEngine();
  return engine.calculateRiskAdjustment('quick', decision, marketIntelligence);
}
