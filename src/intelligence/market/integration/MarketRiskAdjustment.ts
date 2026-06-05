/**
 * CareerOS Market Intelligence - Market Risk Adjustment
 *
 * Reduces confidence and explains risks when fit is strong but market is weak.
 *
 * Principle: Strong fit justifies recommendation even in weak markets,
 * but confidence should reflect market headwinds.
 *
 * Never suppress strong-fit careers solely because of market conditions.
 */

import type { MarketAwareCareerAnalysis } from './models/MarketAwareCareerAnalysis';

/**
 * Risk adjustment configuration.
 */
export interface RiskAdjustmentConfig {
  /** Fit threshold for strong fit */
  strongFitThreshold: number;

  /** Market threshold for weak market */
  weakMarketThreshold: number;

  /** Maximum confidence penalty */
  maxPenalty: number;

  /** Minimum penalty to apply */
  minPenalty: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_RISK_CONFIG: RiskAdjustmentConfig = {
  strongFitThreshold: 75,
  weakMarketThreshold: 50,
  maxPenalty: 12,
  minPenalty: 3,
};

/**
 * Risk assessment result.
 */
export interface RiskAssessment {
  /** Whether risk adjustment applies */
  applies: boolean;

  /** Confidence penalty applied */
  penalty: number;

  /** New confidence score */
  adjustedConfidence: number;

  /** Risk level */
  riskLevel: 'low' | 'moderate' | 'significant' | 'high';

  /** Risk factors */
  riskFactors: string[];

  /** Explanation of risks */
  explanation: string;

  /** Recommendation guidance */
  guidance: string;
}

/**
 * Market Risk Adjustment Engine.
 */
export class MarketRiskAdjustment {
  private config: RiskAdjustmentConfig;

  constructor(config?: Partial<RiskAdjustmentConfig>) {
    this.config = { ...DEFAULT_RISK_CONFIG, ...config };
  }

  /**
   * Assess and apply risk adjustment.
   */
  assessRisk(analysis: MarketAwareCareerAnalysis): RiskAssessment {
    // Check if conditions apply
    const hasStrongFit = analysis.fitScore >= this.config.strongFitThreshold;
    const hasWeakMarket = analysis.marketScore <= this.config.weakMarketThreshold;

    if (!hasStrongFit || !hasWeakMarket) {
      return {
        applies: false,
        penalty: 0,
        adjustedConfidence: analysis.confidence,
        riskLevel: 'low',
        riskFactors: [],
        explanation: hasStrongFit
          ? 'Market conditions are favorable, no risk adjustment needed.'
          : 'Fit not strong enough to trigger market risk assessment.',
        guidance: 'Proceed with standard recommendation.',
      };
    }

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(
      analysis.marketScore,
      analysis.fitScore - this.config.strongFitThreshold
    );

    // Calculate penalty
    const marketSeverity = (this.config.weakMarketThreshold - analysis.marketScore) / this.config.weakMarketThreshold;
    const penalty = Math.max(
      this.config.minPenalty,
      Math.min(this.config.maxPenalty, Math.round(marketSeverity * this.config.maxPenalty))
    );

    const adjustedConfidence = Math.max(0, analysis.confidence - penalty);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(analysis);

    // Generate explanation
    const explanation = this.generateExplanation(
      analysis,
      riskLevel,
      penalty,
      riskFactors
    );

    // Generate guidance
    const guidance = this.generateGuidance(riskLevel, riskFactors);

    return {
      applies: true,
      penalty,
      adjustedConfidence,
      riskLevel,
      riskFactors,
      explanation,
      guidance,
    };
  }

  /**
   * Apply risk adjustment to analysis.
   */
  applyAdjustment(
    analysis: MarketAwareCareerAnalysis
  ): MarketAwareCareerAnalysis {
    const assessment = this.assessRisk(analysis);

    if (!assessment.applies) {
      return analysis;
    }

    return {
      ...analysis,
      confidence: assessment.adjustedConfidence,
      riskFlags: [...analysis.riskFlags, 'strong-fit-weak-market', ...assessment.riskFactors],
      explanation: [...analysis.explanation, assessment.explanation, assessment.guidance],
    };
  }

  /**
   * Batch assess risks.
   */
  assessBatchRisks(
    analyses: MarketAwareCareerAnalysis[]
  ): Array<{ analysis: MarketAwareCareerAnalysis; assessment: RiskAssessment }> {
    return analyses.map((analysis) => ({
      analysis,
      assessment: this.assessRisk(analysis),
    }));
  }

  /**
   * Find careers with strong fit but market risks.
   */
  findAtRiskOpportunities(
    analyses: MarketAwareCareerAnalysis[],
    limit: number = 10
  ): Array<{
    analysis: MarketAwareCareerAnalysis;
    assessment: RiskAssessment;
  }> {
    return analyses
      .map((a) => ({ analysis: a, assessment: this.assessRisk(a) }))
      .filter((r) => r.assessment.applies)
      .sort((a, b) => b.assessment.penalty - a.assessment.penalty)
      .slice(0, limit);
  }

  /**
   * Get risk statistics.
   */
  getRiskStatistics(
    results: Array<{ analysis: MarketAwareCareerAnalysis; assessment: RiskAssessment }>
  ): {
    totalAnalyzed: number;
    atRiskCount: number;
    averagePenalty: number;
    riskDistribution: Record<RiskAssessment['riskLevel'], number>;
  } {
    const atRisk = results.filter((r) => r.assessment.applies);
    const totalPenalty = atRisk.reduce((sum, r) => sum + r.assessment.penalty, 0);

    const distribution: Record<RiskAssessment['riskLevel'], number> = {
      low: 0,
      moderate: 0,
      significant: 0,
      high: 0,
    };

    for (const r of atRisk) {
      distribution[r.assessment.riskLevel]++;
    }

    return {
      totalAnalyzed: results.length,
      atRiskCount: atRisk.length,
      averagePenalty: atRisk.length > 0 ? Math.round((totalPenalty / atRisk.length) * 10) / 10 : 0,
      riskDistribution: distribution,
    };
  }

  /**
   * Generate risk mitigation strategies.
   */
  generateMitigationStrategies(
    assessment: RiskAssessment
  ): string[] {
    const strategies: string[] = [];

    if (assessment.riskFactors.includes('market-decline')) {
      strategies.push('Monitor market closely for recovery signals');
      strategies.push('Consider adjacent markets with stronger demand');
    }

    if (assessment.riskFactors.includes('low-demand')) {
      strategies.push('Develop complementary skills for broader opportunities');
      strategies.push('Build network in target industry before transition');
    }

    if (assessment.riskFactors.includes('high-competition')) {
      strategies.push('Differentiate through specialized expertise');
      strategies.push('Consider geographic relocation to higher-demand markets');
    }

    if (assessment.riskFactors.includes('automation-risk')) {
      strategies.push('Focus on automation-resistant aspects of role');
      strategies.push('Develop adjacent skills less susceptible to automation');
    }

    if (assessment.riskFactors.includes('regulatory-risk')) {
      strategies.push('Stay informed about regulatory developments');
      strategies.push('Develop expertise in compliance requirements');
    }

    if (strategies.length === 0) {
      strategies.push('Maintain strong fit-based positioning');
      strategies.push('Develop contingency plans for market shifts');
    }

    return strategies;
  }

  // Private methods

  private calculateRiskLevel(
    marketScore: number,
    fitExcess: number
  ): RiskAssessment['riskLevel'] {
    // Lower market score = higher risk
    // More fit excess = better ability to withstand risk

    const baseRisk = 100 - marketScore;
    const fitBuffer = fitExcess * 2; // Each point of fit excess reduces risk

    const netRisk = Math.max(0, baseRisk - fitBuffer);

    if (netRisk < 20) return 'low';
    if (netRisk < 40) return 'moderate';
    if (netRisk < 60) return 'significant';
    return 'high';
  }

  private identifyRiskFactors(analysis: MarketAwareCareerAnalysis): string[] {
    const factors: string[] = [];

    if (analysis.marketScore < 40) {
      factors.push('market-decline');
    }

    if (analysis.marketScore < 30) {
      factors.push('low-demand');
    }

    // These would come from market data in real implementation
    factors.push('market-uncertainty');

    return factors;
  }

  private generateExplanation(
    analysis: MarketAwareCareerAnalysis,
    riskLevel: RiskAssessment['riskLevel'],
    penalty: number,
    riskFactors: string[]
  ): string {
    const riskDescriptions: Record<typeof riskLevel, string> = {
      low: 'Minor market headwinds',
      moderate: 'Moderate market challenges',
      significant: 'Significant market obstacles',
      high: 'Substantial market difficulties',
    };

    let explanation = `${riskDescriptions[riskLevel]} present despite strong fit (${analysis.fitScore}/100). `;
    explanation += `Market conditions (${analysis.marketScore}/100) reduce confidence by ${penalty} points. `;

    if (riskFactors.length > 0) {
      explanation += `Risk factors: ${riskFactors.join(', ')}.`;
    }

    return explanation;
  }

  private generateGuidance(
    riskLevel: RiskAssessment['riskLevel'],
    riskFactors: string[]
  ): string {
    const guidanceByLevel: Record<typeof riskLevel, string> = {
      low: 'Recommendation remains viable with standard precautions.',
      moderate: 'Proceed with awareness of market challenges and contingency planning.',
      significant: 'Strong fit justifies path, but prepare for extended job search or additional skill development.',
      high: 'Strong fit supports recommendation, but expect significant obstacles and consider parallel exploration.',
    };

    return guidanceByLevel[riskLevel];
  }
}

/**
 * Factory function.
 */
export function createMarketRiskAdjustment(
  config?: Partial<RiskAdjustmentConfig>
): MarketRiskAdjustment {
  return new MarketRiskAdjustment(config);
}
