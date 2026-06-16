/**
 * Market Adjustment Calculator
 *
 * Adjusts recommendation scores based on market factors:
 *   - Demand
 *   - Salary Growth
 *   - Competition
 *   - Automation Risk
 *   - Industry Outlook
 *   - Regional Opportunity
 *
 * ## Adjustment Philosophy
 *
 * Market adjustments are SUPPORTIVE, not DETERMINATIVE.
 *
 * | Market Condition | Adjustment | Rationale |
 * |------------------|------------|-----------|
 * | Strong demand | +5 to +15 | Boost confidence |
 * | High salary growth | +2 to +8 | Positive signal |
 * | Low competition | +3 to +10 | Better odds |
 * | Low automation risk | +2 to +5 | Future-proof |
 * | Weak demand | -5 to -25 | Risk warning |
 * | High automation | -10 to -20 | Future concern |
 *
 * Maximum boost: +15 points
 * Maximum penalty: -25 points
 */

import type {
  MarketAdjustmentAnalysis,
  MarketAdjustmentFactors,
  MarketIntelligenceReport,
  MarketAdjustmentCalculatorConfig,
  RecommendationId,
} from './types.js';

import { DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG } from './types.js';

type SalaryAdjustmentCapable = {
  calculateSalaryAdjustment?: (salaryGrowth: number) => number;
};

type DemandSignalTrend = MarketIntelligenceReport['trend'] & {
  signalType?: string;
};

// ============================================================================
// MARKET ADJUSTMENT CALCULATOR
// ============================================================================

export class MarketAdjustmentCalculator {
  private config: MarketAdjustmentCalculatorConfig;

  constructor(config: Partial<MarketAdjustmentCalculatorConfig> = {}) {
    this.config = { ...DEFAULT_MARKET_ADJUSTMENT_CALCULATOR_CONFIG, ...config };
  }

  /**
   * Calculate market adjustment for a recommendation.
   */
  calculateAdjustment(
    recommendationId: RecommendationId,
    originalScore: number,
    marketIntelligence: MarketIntelligenceReport
  ): MarketAdjustmentAnalysis {
    // Extract market factors
    const factors = this.extractFactors(marketIntelligence);

    // Calculate component adjustments
    const demandAdjustment = this.calculateDemandAdjustment(factors.demand);
    const salaryAdjustment =
      (this as unknown as SalaryAdjustmentCapable).calculateSalaryAdjustment?.(factors.salaryGrowth) ?? 0;
    const competitionAdjustment = this.calculateCompetitionAdjustment(factors.competition);
    const automationAdjustment = this.calculateAutomationAdjustment(factors.automationRisk);
    const outlookAdjustment = this.calculateOutlookAdjustment(factors.industryOutlook);
    const regionalAdjustment = this.calculateRegionalAdjustment(factors.regionalOpportunity);

    // Calculate weighted total adjustment
    let totalAdjustment =
      demandAdjustment * this.config.demandWeight +
      salaryAdjustment * this.config.salaryWeight +
      competitionAdjustment * this.config.competitionWeight +
      automationAdjustment * this.config.automationWeight +
      outlookAdjustment * this.config.outlookWeight +
      regionalAdjustment * this.config.regionalWeight;

    // Apply limits
    totalAdjustment = Math.max(
      -this.config.maxAdjustment,
      Math.min(this.config.maxAdjustment, totalAdjustment)
    );

    // Calculate final adjusted score
    const adjustedScore = Math.max(0, Math.min(100, originalScore + totalAdjustment));

    // Generate reasoning
    const adjustmentReasoning = this.generateReasoning(
      factors,
      demandAdjustment,
      salaryAdjustment,
      competitionAdjustment,
      automationAdjustment,
      outlookAdjustment,
      regionalAdjustment,
      totalAdjustment
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(marketIntelligence);

    return {
      id: `adjustment_${recommendationId}_${Date.now()}`,
      recommendationId,
      originalScore,
      marketAdjustment: Math.round(totalAdjustment * 10) / 10,
      adjustedScore: Math.round(adjustedScore * 10) / 10,
      adjustmentReasoning,
      confidence,
      components: {
        demandAdjustment: Math.round(demandAdjustment * 10) / 10,
        salaryAdjustment: Math.round(salaryAdjustment * 10) / 10,
        competitionAdjustment: Math.round(competitionAdjustment * 10) / 10,
        automationAdjustment: Math.round(automationAdjustment * 10) / 10,
        outlookAdjustment: Math.round(outlookAdjustment * 10) / 10,
        regionalAdjustment: Math.round(regionalAdjustment * 10) / 10,
      },
      analyzedAt: Date.now(),
    };
  }

  /**
   * Extract market adjustment factors from intelligence report.
   */
  private extractFactors(report: MarketIntelligenceReport): MarketAdjustmentFactors {
    return {
      demand: this.extractDemandFactor(report),
      salaryGrowth: this.extractSalaryGrowthFactor(report),
      competition: this.extractCompetitionFactor(report),
      automationRisk: this.extractAutomationRiskFactor(report),
      industryOutlook: this.extractIndustryOutlookFactor(report),
      regionalOpportunity: this.extractRegionalOpportunityFactor(report),
    };
  }

  /**
   * Extract demand factor (0-1).
   */
  private extractDemandFactor(report: MarketIntelligenceReport): number {
    // From opportunity score component or trend
    const opportunityDemand = report.opportunity.scoreComponents.demand / 100;

    if ((report.trend as DemandSignalTrend).signalType === 'demand') {
      return (opportunityDemand + report.trend.strength) / 2;
    }

    return opportunityDemand;
  }

  /**
   * Extract salary growth factor (annual rate).
   */
  private extractSalaryGrowthFactor(report: MarketIntelligenceReport): number {
    // From opportunity score component
    const salaryScore = report.opportunity.scoreComponents.salaryGrowth;

    // Convert score to estimated growth rate
    // Score 50 = 0% growth, Score 100 = 30% growth
    return (salaryScore - 50) / 50 * 0.3;
  }

  /**
   * Extract competition factor (0-1, lower is better).
   */
  private extractCompetitionFactor(report: MarketIntelligenceReport): number {
    // Invert competition score (higher score = lower competition)
    const competitionScore = report.opportunity.scoreComponents.competition;
    return 1 - (competitionScore / 100);
  }

  /**
   * Extract automation risk factor (0-1).
   */
  private extractAutomationRiskFactor(report: MarketIntelligenceReport): number {
    // Invert automation risk score (higher score = lower risk)
    const automationScore = report.opportunity.scoreComponents.automationRisk;
    return 1 - (automationScore / 100);
  }

  /**
   * Extract industry outlook factor (0-1).
   */
  private extractIndustryOutlookFactor(report: MarketIntelligenceReport): number {
    // From future outlook component
    return report.opportunity.scoreComponents.futureOutlook / 100;
  }

  /**
   * Extract regional opportunity factor (0-1).
   */
  private extractRegionalOpportunityFactor(report: MarketIntelligenceReport): number {
    // Use overall opportunity as proxy if no specific regional data
    return report.opportunity.opportunityScore / 100;
  }

  /**
   * Calculate demand adjustment.
   */
  private calculateDemandAdjustment(demand: number): number {
    // Demand: 0-1 scale
    // Strong demand (>0.7): +5 to +15
    // Weak demand (<0.3): -5 to -15
    // Neutral: 0

    if (demand > 0.7) {
      return 5 + (demand - 0.7) / 0.3 * 10; // +5 to +15
    } else if (demand < 0.3) {
      return -5 - (0.3 - demand) / 0.3 * 10; // -5 to -15
    }
    return 0;
  }

  /**
   * Calculate salary growth adjustment.
   */
  private calculateSalaryGrowthAdjustment(growthRate: number): number {
    // Growth rate: typically -0.2 to +0.5
    // Strong growth (>15%): +2 to +8
    // Declining (<0%): -3 to -8

    if (growthRate > 0.15) {
      return 2 + (growthRate - 0.15) / 0.35 * 6; // +2 to +8
    } else if (growthRate < 0) {
      return -3 + growthRate / 0.2 * 5; // -3 to -8
    }
    return growthRate * 20; // Linear for small changes
  }

  /**
   * Calculate competition adjustment.
   */
  private calculateCompetitionAdjustment(competition: number): number {
    // Competition: 0-1 scale (higher = more competition = worse)
    // Low competition (<0.3): +3 to +10
    // High competition (>0.7): -3 to -10

    if (competition < 0.3) {
      return 3 + (0.3 - competition) / 0.3 * 7; // +3 to +10
    } else if (competition > 0.7) {
      return -3 - (competition - 0.7) / 0.3 * 7; // -3 to -10
    }
    return 0;
  }

  /**
   * Calculate automation risk adjustment.
   */
  private calculateAutomationAdjustment(automationRisk: number): number {
    // Automation risk: 0-1 scale (higher = more risk = worse)
    // Low risk (<0.3): +2 to +5
    // High risk (>0.6): -10 to -20

    if (automationRisk < 0.3) {
      return 2 + (0.3 - automationRisk) / 0.3 * 3; // +2 to +5
    } else if (automationRisk > 0.6) {
      return -10 - (automationRisk - 0.6) / 0.4 * 10; // -10 to -20
    }
    return 0;
  }

  /**
   * Calculate industry outlook adjustment.
   */
  private calculateOutlookAdjustment(outlook: number): number {
    // Outlook: 0-1 scale
    // Positive (>0.7): +2 to +5
    // Negative (<0.3): -3 to -8

    if (outlook > 0.7) {
      return 2 + (outlook - 0.7) / 0.3 * 3; // +2 to +5
    } else if (outlook < 0.3) {
      return -3 - (0.3 - outlook) / 0.3 * 5; // -3 to -8
    }
    return 0;
  }

  /**
   * Calculate regional opportunity adjustment.
   */
  private calculateRegionalAdjustment(opportunity: number): number {
    // Regional opportunity: 0-1 scale
    // Strong (>0.7): +2 to +5
    // Weak (<0.3): -2 to -5

    if (opportunity > 0.7) {
      return 2 + (opportunity - 0.7) / 0.3 * 3;
    } else if (opportunity < 0.3) {
      return -2 - (0.3 - opportunity) / 0.3 * 3;
    }
    return 0;
  }

  /**
   * Generate adjustment reasoning.
   */
  private generateReasoning(
    factors: MarketAdjustmentFactors,
    demandAdj: number,
    salaryAdj: number,
    competitionAdj: number,
    automationAdj: number,
    outlookAdj: number,
    regionalAdj: number,
    totalAdjustment: number
  ): string[] {
    const reasoning: string[] = [];

    // Demand
    if (Math.abs(demandAdj) > 2) {
      const direction = demandAdj > 0 ? 'strong' : 'weak';
      reasoning.push(`Market demand is ${direction} (${Math.abs(demandAdj) > 0 ? '+' : ''}${demandAdj.toFixed(1)})`);
    }

    // Salary
    if (Math.abs(salaryAdj) > 1) {
      const direction = salaryAdj > 0 ? 'growing' : 'stagnant';
      reasoning.push(`Salary growth is ${direction} (${salaryAdj > 0 ? '+' : ''}${salaryAdj.toFixed(1)})`);
    }

    // Competition
    if (Math.abs(competitionAdj) > 1) {
      const direction = competitionAdj > 0 ? 'low' : 'high';
      reasoning.push(`Competition is ${direction} (${competitionAdj > 0 ? '+' : ''}${competitionAdj.toFixed(1)})`);
    }

    // Automation
    if (Math.abs(automationAdj) > 2) {
      const direction = automationAdj > 0 ? 'resistant' : 'exposed';
      reasoning.push(`Automation risk is ${direction} (${automationAdj > 0 ? '+' : ''}${automationAdj.toFixed(1)})`);
    }

    // Outlook
    if (Math.abs(outlookAdj) > 1) {
      const direction = outlookAdj > 0 ? 'positive' : 'concerning';
      reasoning.push(`Industry outlook is ${direction} (${outlookAdj > 0 ? '+' : ''}${outlookAdj.toFixed(1)})`);
    }

    // Regional
    if (Math.abs(regionalAdj) > 1) {
      const direction = regionalAdj > 0 ? 'strong' : 'limited';
      reasoning.push(`Regional opportunity is ${direction} (${regionalAdj > 0 ? '+' : ''}${regionalAdj.toFixed(1)})`);
    }

    // Summary
    const direction = totalAdjustment > 0 ? 'boost' : totalAdjustment < 0 ? 'penalty' : 'neutral';
    reasoning.push(`Total market ${direction}: ${totalAdjustment > 0 ? '+' : ''}${totalAdjustment.toFixed(1)} points`);

    return reasoning;
  }

  /**
   * Calculate confidence in adjustment.
   */
  private calculateConfidence(report: MarketIntelligenceReport): number {
    // Based on market intelligence confidence
    const baseConfidence = report.confidence;

    // Data quality factor
    const dataQualityFactor = Math.min(1, report.dataQuality.dataPoints / 10);

    // Time span factor (more time = more confidence)
    const timeSpanFactor = Math.min(1, report.dataQuality.timeSpan / 90);

    return baseConfidence * 0.5 + dataQualityFactor * 0.25 + timeSpanFactor * 0.25;
  }

  /**
   * Batch calculate adjustments.
   */
  calculateBatch(
    items: Array<{
      recommendationId: RecommendationId;
      originalScore: number;
      marketIntelligence: MarketIntelligenceReport;
    }>
  ): MarketAdjustmentAnalysis[] {
    return items.map(item =>
      this.calculateAdjustment(
        item.recommendationId,
        item.originalScore,
        item.marketIntelligence
      )
    );
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketAdjustmentCalculator(
  config?: Partial<MarketAdjustmentCalculatorConfig>
): MarketAdjustmentCalculator {
  return new MarketAdjustmentCalculator(config);
}

export function quickCalculateAdjustment(
  originalScore: number,
  marketIntelligence: MarketIntelligenceReport
): MarketAdjustmentAnalysis {
  const calculator = new MarketAdjustmentCalculator();
  return calculator.calculateAdjustment('quick', originalScore, marketIntelligence);
}
