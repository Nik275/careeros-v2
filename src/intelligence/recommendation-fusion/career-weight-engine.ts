/**
 * Career Weight Engine
 *
 * Calculates influence from career factors:
 * - opportunity score
 * - optionality score
 * - irreversibility score
 * - future demand
 * - career graph analysis
 */

import {
  CareerWeight,
  FusionTimestamp,
  Weight,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface CareerWeightConfig {
  // Component weights
  opportunityWeight: Weight;
  optionalityWeight: Weight;
  irreversibilityWeight: Weight;
  futureDemandWeight: Weight;
  graphAnalysisWeight: Weight;

  // Quality thresholds
  minMarketRecency: Weight;
  minGraphCompleteness: Weight;

  // Adjustment factors
  highOptionalityBoost: number;
  lowIrreversibilityBoost: number;
  highDemandBoost: number;
}

export const DEFAULT_CAREER_CONFIG: CareerWeightConfig = {
  opportunityWeight: 0.25,
  optionalityWeight: 0.25,
  irreversibilityWeight: 0.15,
  futureDemandWeight: 0.20,
  graphAnalysisWeight: 0.15,

  minMarketRecency: 0.6,
  minGraphCompleteness: 0.7,

  highOptionalityBoost: 1.15,
  lowIrreversibilityBoost: 1.1,
  highDemandBoost: 1.2,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface CareerFactors {
  careerId: string;
  careerName: string;

  // Opportunity metrics
  opportunityScore: number; // 0-100
  opportunityDetails: {
    nearTerm: number;
    mediumTerm: number;
    longTerm: number;
  };

  // Optionality metrics
  optionalityScore: number; // 0-100
  futureOptions: number;
  pivotPossibilities: string[];

  // Irreversibility metrics (lower is better for reversibility)
  irreversibilityScore: number; // 0-100
  reversibleWithin: {
    oneYear: Weight;
    threeYears: Weight;
    fiveYears: Weight;
  };

  // Future demand
  futureDemand: number; // 0-100
  demandTrend: 'growing' | 'stable' | 'declining';
  demandGrowthRate: number; // Percentage

  // Graph analysis
  graphRank: number;
  pathQuality: Weight;
  riskLevel: 'low' | 'medium' | 'high';

  // Market data
  marketDataRecency: Date;
}

// ============================================================================
// ENGINE
// ============================================================================

export class CareerWeightEngine {
  private config: CareerWeightConfig;

  constructor(config: Partial<CareerWeightConfig> = {}) {
    this.config = { ...DEFAULT_CAREER_CONFIG, ...config };
  }

  /**
   * Calculate career weight for a specific career
   */
  calculateWeight(
    factors: CareerFactors,
    options: {
      dataQuality?: Weight;
      graphCompleteness?: Weight;
    } = {}
  ): CareerWeight {
    const timestamp = Date.now();

    // Calculate component scores (normalize to 0-1)
    const opportunityScore = this.calculateOpportunityWeight(factors);
    const optionalityScore = this.calculateOptionalityWeight(factors);
    const irreversibilityScore = this.calculateIrreversibilityWeight(factors);
    const futureDemand = this.calculateDemandWeight(factors);
    const graphAnalysis = this.calculateGraphWeight(factors);

    // Calculate quality metrics
    const dataQuality = options.dataQuality ?? this.assessDataQuality(factors);
    const marketRecency = this.assessMarketRecency(factors);
    const graphCompleteness = options.graphCompleteness ?? 0.8;

    // Calculate total weight
    let totalWeight =
      opportunityScore * this.config.opportunityWeight +
      optionalityScore * this.config.optionalityWeight +
      irreversibilityScore * this.config.irreversibilityWeight +
      futureDemand * this.config.futureDemandWeight +
      graphAnalysis * this.config.graphAnalysisWeight;

    // Apply quality adjustments
    totalWeight *= dataQuality * marketRecency * graphCompleteness;

    // Generate reasoning
    const reasoning = this.generateReasoning(factors, {
      opportunityScore,
      optionalityScore,
      irreversibilityScore,
      futureDemand,
      graphAnalysis,
    });

    return {
      engineId: 'career',
      timestamp,
      opportunityScore,
      optionalityScore,
      irreversibilityScore,
      futureDemand,
      graphAnalysis,
      totalWeight: Math.min(1, Math.max(0, totalWeight)),
      dataQuality,
      marketRecency,
      graphCompleteness,
      reasoning,
    };
  }

  /**
   * Calculate batch weights for multiple careers
   */
  calculateBatchWeights(
    factorsList: CareerFactors[],
    options?: { dataQuality?: Weight; graphCompleteness?: Weight }
  ): Map<string, CareerWeight> {
    const weights = new Map<string, CareerWeight>();

    for (const factors of factorsList) {
      const weight = this.calculateWeight(factors, options);
      weights.set(factors.careerId, weight);
    }

    return weights;
  }

  /**
   * Compare career attractiveness across multiple options
   */
  compareCareers(
    factorsList: CareerFactors[]
  ): Array<{
    careerId: string;
    careerName: string;
    overallScore: number;
    bestFactor: string;
    riskLevel: string;
    reversibility: string;
  }> {
    const comparisons = factorsList.map(factors => {
      const weight = this.calculateWeight(factors);

      const factorScores = [
        { name: 'opportunity', score: weight.opportunityScore },
        { name: 'optionality', score: weight.optionalityScore },
        { name: 'reversibility', score: weight.irreversibilityScore },
        { name: 'demand', score: weight.futureDemand },
        { name: 'graph', score: weight.graphAnalysis },
      ];

      const bestFactor = factorScores.reduce((a, b) =>
        a.score > b.score ? a : b
      );

      return {
        careerId: factors.careerId,
        careerName: factors.careerName,
        overallScore: weight.totalWeight * 100,
        bestFactor: `${bestFactor.name} (${Math.round(bestFactor.score * 100)}%)`,
        riskLevel: factors.riskLevel,
        reversibility: this.getReversibilityLabel(weight.irreversibilityScore),
      };
    });

    return comparisons.sort((a, b) => b.overallScore - a.overallScore);
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculateOpportunityWeight(factors: CareerFactors): Weight {
    let weight = factors.opportunityScore / 100;

    // Boost for strong near-term opportunities
    if (factors.opportunityDetails.nearTerm > 80) {
      weight *= 1.1;
    }

    // Boost for balanced opportunities across timeframes
    const balance = this.calculateBalance(Object.values(factors.opportunityDetails));
    weight *= (0.9 + balance * 0.2);

    return Math.min(1, weight);
  }

  private calculateOptionalityWeight(factors: CareerFactors): Weight {
    let weight = factors.optionalityScore / 100;

    // Boost for high optionality
    if (factors.optionalityScore > 80) {
      weight *= this.config.highOptionalityBoost;
    }

    // Consider number of pivot possibilities
    if (factors.pivotPossibilities.length > 5) {
      weight *= 1.05;
    }

    return Math.min(1, weight);
  }

  private calculateIrreversibilityWeight(factors: CareerFactors): Weight {
    // Invert irreversibility (lower irreversibility = higher weight)
    let weight = 1 - factors.irreversibilityScore / 100;

    // Boost for easily reversible choices
    if (factors.irreversibilityScore < 40) {
      weight *= this.config.lowIrreversibilityBoost;
    }

    // Consider reversible-within probabilities
    const avgReversibility =
      (factors.reversibleWithin.oneYear +
        factors.reversibleWithin.threeYears +
        factors.reversibleWithin.fiveYears) /
      3;
    weight *= (0.8 + avgReversibility * 0.4);

    return Math.min(1, weight);
  }

  private calculateDemandWeight(factors: CareerFactors): Weight {
    let weight = factors.futureDemand / 100;

    // Boost for growing demand
    if (factors.demandTrend === 'growing') {
      weight *= this.config.highDemandBoost;
    }

    // Consider growth rate
    if (factors.demandGrowthRate > 10) {
      weight *= 1.1;
    } else if (factors.demandGrowthRate < 0) {
      weight *= 0.7;
    }

    // Penalty for declining demand
    if (factors.demandTrend === 'declining') {
      weight *= 0.6;
    }

    return Math.min(1, weight);
  }

  private calculateGraphWeight(factors: CareerFactors): Weight {
    // Higher rank (lower number) = better
    let weight = Math.max(0, 1 - (factors.graphRank - 1) * 0.1);

    // Consider path quality
    weight *= factors.pathQuality;

    // Risk adjustment
    const riskMultiplier =
      factors.riskLevel === 'low' ? 1.0 :
      factors.riskLevel === 'medium' ? 0.85 :
      0.7;
    weight *= riskMultiplier;

    return Math.min(1, weight);
  }

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  private assessDataQuality(factors: CareerFactors): Weight {
    const checks = [
      factors.opportunityScore > 0,
      factors.optionalityScore > 0,
      factors.irreversibilityScore >= 0,
      factors.futureDemand > 0,
      factors.graphRank > 0,
      factors.pivotPossibilities.length >= 0,
    ];

    const passedChecks = checks.filter(Boolean).length;
    return passedChecks / checks.length;
  }

  private assessMarketRecency(factors: CareerFactors): Weight {
    const age = Date.now() - factors.marketDataRecency.getTime();
    const sixMonths = 180 * 24 * 60 * 60 * 1000;
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if (age < sixMonths) return 1.0;
    if (age < oneYear) return 0.85;
    if (age < 2 * oneYear) return 0.7;
    return 0.5;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateBalance(values: number[]): Weight {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, 1 - stdDev / 50);
  }

  private getReversibilityLabel(score: number): string {
    if (score > 0.8) return 'highly-reversible';
    if (score > 0.6) return 'moderately-reversible';
    if (score > 0.4) return 'somewhat-reversible';
    return 'difficult-to-reverse';
  }

  private generateReasoning(
    factors: CareerFactors,
    scores: {
      opportunityScore: Weight;
      optionalityScore: Weight;
      irreversibilityScore: Weight;
      futureDemand: Weight;
      graphAnalysis: Weight;
    }
  ): string[] {
    const reasoning: string[] = [];

    // Opportunity reasoning
    if (scores.opportunityScore > 0.8) {
      reasoning.push(
        `Excellent opportunities: Strong near, medium, and long-term prospects.`
      );
    } else if (scores.opportunityScore > 0.6) {
      reasoning.push(`Good opportunities: Solid career prospects.`);
    }

    // Optionality reasoning
    if (scores.optionalityScore > 0.8) {
      reasoning.push(
        `High optionality: Keeps many future doors open with ${factors.pivotPossibilities.length} pivot possibilities.`
      );
    }

    // Reversibility reasoning
    if (scores.irreversibilityScore > 0.7) {
      reasoning.push(
        `Easy to pivot: Can reverse course with minimal cost if needed.`
      );
    } else if (scores.irreversibilityScore < 0.4) {
      reasoning.push(
        `High commitment: Difficult to reverse once started.`
      );
    }

    // Demand reasoning
    if (scores.futureDemand > 0.8) {
      reasoning.push(
        `Growing demand: Job market trending upward at ${factors.demandGrowthRate}% growth.`
      );
    } else if (factors.demandTrend === 'declining') {
      reasoning.push(
        `Declining demand: Job market showing negative trends.`
      );
    }

    // Risk reasoning
    if (factors.riskLevel === 'low') {
      reasoning.push(`Low risk: Stable, predictable career path.`);
    } else if (factors.riskLevel === 'high') {
      reasoning.push(`Higher risk: Path has significant uncertainties.`);
    }

    return reasoning;
  }

  // ============================================================================
  // CONFIGURATION METHODS
  // ============================================================================

  getConfig(): CareerWeightConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<CareerWeightConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default CareerWeightEngine;
