/**
 * Opportunity Scoring Engine
 *
 * Calculates opportunity scores (0-100) based on:
 *   - Demand
 *   - Competition
 *   - Salary Growth
 *   - Future Outlook
 *   - Automation Risk
 *
 * ## Scoring Logic
 *
 * Higher scores indicate better opportunities.
 *
 * | Factor | Weight | High Value |
 * |--------|--------|------------|
 * | Demand | 25% | High demand |
 * | Competition | 20% | Low competition |
 * | Salary Growth | 20% | Strong growth |
 * | Future Outlook | 20% | Positive |
 * | Automation Risk | 15% | Low risk |
 *
 * ## Score Ranges
 *   - 80-100: Excellent opportunity
 *   - 60-79: Good opportunity
 *   - 40-59: Moderate opportunity
 *   - 20-39: Challenging opportunity
 *   - 0-19: Poor opportunity
 */

import type {
  MarketOpportunity,
  OpportunityScoringConfig,
  TimeSeriesPoint,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import { DEFAULT_OPPORTUNITY_SCORING_CONFIG } from './types.js';

// ============================================================================
// OPPORTUNITY SCORING ENGINE
// ============================================================================

export class OpportunityScoringEngine {
  private config: OpportunityScoringConfig;

  constructor(config: Partial<OpportunityScoringConfig> = {}) {
    this.config = { ...DEFAULT_OPPORTUNITY_SCORING_CONFIG, ...config };
  }

  /**
   * Calculate opportunity score for an entity.
   */
  calculateOpportunity(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    inputs: {
      demand: TimeSeriesPoint[];
      competition: TimeSeriesPoint[];
      salaryGrowth: TimeSeriesPoint[];
      futureOutlook: TimeSeriesPoint[];
      automationRisk: TimeSeriesPoint[];
    }
  ): MarketOpportunity {
    // Calculate component scores
    const demandScore = this.calculateDemandScore(inputs.demand);
    const competitionScore = this.calculateCompetitionScore(inputs.competition);
    const salaryGrowthScore = this.calculateSalaryGrowthScore(inputs.salaryGrowth);
    const futureOutlookScore = this.calculateFutureOutlookScore(inputs.futureOutlook);
    const automationRiskScore = this.calculateAutomationRiskScore(inputs.automationRisk);

    // Calculate weighted total
    const opportunityScore = Math.round(
      demandScore * this.config.weights.demand +
      competitionScore * this.config.weights.competition +
      salaryGrowthScore * this.config.weights.salaryGrowth +
      futureOutlookScore * this.config.weights.futureOutlook +
      automationRiskScore * this.config.weights.automationRisk
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(inputs);

    // Generate drivers
    const drivers = this.generateDrivers(
      demandScore,
      competitionScore,
      salaryGrowthScore,
      futureOutlookScore,
      automationRiskScore
    );

    // Generate risks
    const risks = this.generateRisks(
      demandScore,
      competitionScore,
      salaryGrowthScore,
      futureOutlookScore,
      automationRiskScore
    );

    return {
      id: `opportunity_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      opportunityScore: Math.max(0, Math.min(100, opportunityScore)),
      confidence,
      drivers,
      risks,
      assessedAt: Date.now(),
      scoreComponents: {
        demand: Math.round(demandScore),
        competition: Math.round(competitionScore),
        salaryGrowth: Math.round(salaryGrowthScore),
        futureOutlook: Math.round(futureOutlookScore),
        automationRisk: Math.round(automationRiskScore),
      },
    };
  }

  /**
   * Calculate demand score (higher demand = higher score).
   */
  private calculateDemandScore(demandData: TimeSeriesPoint[]): number {
    if (demandData.length === 0) return 50;

    const latest = demandData[demandData.length - 1].value;

    // Normalize to 0-100 scale
    // Assuming demand is normalized 0-1
    return latest * 100;
  }

  /**
   * Calculate competition score (lower competition = higher score).
   */
  private calculateCompetitionScore(competitionData: TimeSeriesPoint[]): number {
    if (competitionData.length === 0) return 50;

    const latest = competitionData[competitionData.length - 1].value;

    // Invert: lower competition = higher score
    return (1 - latest) * 100;
  }

  /**
   * Calculate salary growth score.
   */
  private calculateSalaryGrowthScore(salaryData: TimeSeriesPoint[]): number {
    if (salaryData.length < 2) return 50;

    const first = salaryData[0].value;
    const latest = salaryData[salaryData.length - 1].value;
    const growth = (latest - first) / first;

    // Convert growth rate to score
    // 20% growth = 80 score, 0% = 50 score, -20% = 20 score
    return Math.max(0, Math.min(100, 50 + growth * 150));
  }

  /**
   * Calculate future outlook score.
   */
  private calculateFutureOutlookScore(outlookData: TimeSeriesPoint[]): number {
    if (outlookData.length === 0) return 50;

    const latest = outlookData[outlookData.length - 1].value;

    // Normalize to 0-100
    return latest * 100;
  }

  /**
   * Calculate automation risk score (lower risk = higher score).
   */
  private calculateAutomationRiskScore(riskData: TimeSeriesPoint[]): number {
    if (riskData.length === 0) return 70; // Default to relatively safe

    const latest = riskData[riskData.length - 1].value;

    // Invert: lower risk = higher score
    return (1 - latest) * 100;
  }

  /**
   * Calculate overall confidence.
   */
  private calculateConfidence(inputs: {
    demand: TimeSeriesPoint[];
    competition: TimeSeriesPoint[];
    salaryGrowth: TimeSeriesPoint[];
    futureOutlook: TimeSeriesPoint[];
    automationRisk: TimeSeriesPoint[];
  }): number {
    const allData = [
      ...inputs.demand,
      ...inputs.competition,
      ...inputs.salaryGrowth,
      ...inputs.futureOutlook,
      ...inputs.automationRisk,
    ];

    if (allData.length === 0) return 0.3;

    // Average confidence of all data points
    const avgConfidence = allData.reduce((sum, p) => sum + p.confidence, 0) / allData.length;

    // Data completeness factor
    const metricsWithData = [
      inputs.demand.length > 0,
      inputs.competition.length > 0,
      inputs.salaryGrowth.length > 0,
      inputs.futureOutlook.length > 0,
      inputs.automationRisk.length > 0,
    ].filter(Boolean).length;

    const completenessFactor = metricsWithData / 5;

    return avgConfidence * 0.7 + completenessFactor * 0.3;
  }

  /**
   * Generate opportunity drivers.
   */
  private generateDrivers(
    demand: number,
    competition: number,
    salaryGrowth: number,
    futureOutlook: number,
    automationRisk: number
  ): string[] {
    const drivers: string[] = [];

    if (demand > 70) {
      drivers.push('Strong market demand');
    }
    if (competition > 70) {
      drivers.push('Low competition');
    }
    if (salaryGrowth > 70) {
      drivers.push('Strong salary growth trajectory');
    }
    if (futureOutlook > 70) {
      drivers.push('Positive future outlook');
    }
    if (automationRisk > 70) {
      drivers.push('Resistant to automation');
    }

    return drivers;
  }

  /**
   * Generate risk factors.
   */
  private generateRisks(
    demand: number,
    competition: number,
    salaryGrowth: number,
    futureOutlook: number,
    automationRisk: number
  ): string[] {
    const risks: string[] = [];

    if (demand < 30) {
      risks.push('Weak market demand');
    }
    if (competition < 30) {
      risks.push('High competition');
    }
    if (salaryGrowth < 30) {
      risks.push('Stagnant salary growth');
    }
    if (futureOutlook < 30) {
      risks.push('Uncertain future outlook');
    }
    if (automationRisk < 30) {
      risks.push('High automation exposure');
    }

    return risks;
  }

  /**
   * Get score interpretation.
   */
  getScoreInterpretation(score: number): string {
    if (score >= 80) return 'Excellent opportunity';
    if (score >= 60) return 'Good opportunity';
    if (score >= 40) return 'Moderate opportunity';
    if (score >= 20) return 'Challenging opportunity';
    return 'Poor opportunity';
  }

  /**
   * Compare opportunities.
   */
  compareOpportunities(
    opportunities: MarketOpportunity[]
  ): Array<{ opportunity: MarketOpportunity; rank: number; comparison: string }> {
    const sorted = [...opportunities].sort(
      (a, b) => b.opportunityScore - a.opportunityScore
    );

    return sorted.map((opp, index) => {
      const rank = index + 1;
      let comparison = '';

      if (rank === 1) {
        comparison = 'Best opportunity';
      } else {
        const diff = opp.opportunityScore - sorted[0].opportunityScore;
        comparison = `${diff < 0 ? '' : '+'}${diff.toFixed(0)} points from best`;
      }

      return { opportunity: opp, rank, comparison };
    });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createOpportunityScoringEngine(
  config?: Partial<OpportunityScoringConfig>
): OpportunityScoringEngine {
  return new OpportunityScoringEngine(config);
}

export function quickCalculateOpportunity(
  inputs: {
    demand: number;
    competition: number;
    salaryGrowth: number;
    futureOutlook: number;
    automationRisk: number;
  }
): number {
  const weights = DEFAULT_OPPORTUNITY_SCORING_CONFIG.weights;

  // Invert competition and automation risk
  const competitionScore = (1 - inputs.competition) * 100;
  const automationScore = (1 - inputs.automationRisk) * 100;

  return Math.round(
    inputs.demand * 100 * weights.demand +
    competitionScore * weights.competition +
    inputs.salaryGrowth * 100 * weights.salaryGrowth +
    inputs.futureOutlook * 100 * weights.futureOutlook +
    automationScore * weights.automationRisk
  );
}
