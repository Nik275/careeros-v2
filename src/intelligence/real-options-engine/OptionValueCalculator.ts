/**
 * CareerOS Real Options Theory Engine - Option Value Calculator
 *
 * Measures:
 * - Number of reachable futures
 * - Quality of reachable futures
 * - Future utility potential
 * - Future market opportunities
 */

import type {
  CareerId,
  OptionValueCalculation,
  RealOptionsEngineConfig,
} from './types';

import type {
  CareerTransitionEdge,
} from '../career-graph-v2';

import type {
  FutureContext,
} from '../future-explorer';

/**
 * Calculates the option value of a career.
 */
export class OptionValueCalculator {
  private config: RealOptionsEngineConfig;

  constructor(config: RealOptionsEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate option value.
   */
  calculate(
    careerId: CareerId,
    transitionEdges: CareerTransitionEdge[],
    futureContexts: FutureContext[]
  ): OptionValueCalculation {
    // Calculate reachable futures
    const reachableFutures = this.calculateReachableFutures(
      careerId,
      transitionEdges
    );

    // Calculate quality of reachable futures
    const futureQuality = this.calculateFutureQuality(
      reachableFutures,
      futureContexts
    );

    // Calculate future utility potential
    const utilityPotential = this.calculateUtilityPotential(
      reachableFutures,
      futureContexts
    );

    // Calculate market opportunities
    const marketOpportunities = this.calculateMarketOpportunities(
      reachableFutures,
      futureContexts
    );

    // Calculate total option value
    const totalValue = this.calculateTotalValue(
      reachableFutures,
      futureQuality,
      utilityPotential,
      marketOpportunities
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      reachableFutures,
      futureQuality,
      utilityPotential,
      marketOpportunities
    );

    return {
      careerId,
      totalValue,
      reachableFutures,
      futureQuality,
      utilityPotential,
      marketOpportunities,
      explanation,
    };
  }

  /**
   * Calculate reachable futures from a career.
   */
  private calculateReachableFutures(
    careerId: CareerId,
    transitionEdges: CareerTransitionEdge[]
  ): OptionValueCalculation['reachableFutures'] {
    // Find all directly reachable careers
    const reachableEdges = transitionEdges.filter(
      (e) => e.sourceCareerId === careerId
    );

    const careers = reachableEdges.map((edge) => ({
      careerId: edge.targetCareerId,
      name: edge.targetCareerId,
      transitionDifficulty: edge.transitionDifficulty,
      utilityPotential: this.estimateUtilityPotential(edge),
    }));

    // Calculate diversity score based on career variety
    const uniqueIndustries = new Set(
      careers.map((c) => this.inferIndustry(c.careerId))
    );
    const diversityScore = Math.min(
      (uniqueIndustries.size / Math.max(careers.length, 1)) * 100,
      100
    );

    return {
      count: careers.length,
      careers,
      diversityScore,
    };
  }

  /**
   * Calculate quality of reachable futures.
   */
  private calculateFutureQuality(
    reachableFutures: OptionValueCalculation['reachableFutures'],
    futureContexts: FutureContext[]
  ): OptionValueCalculation['futureQuality'] {
    if (reachableFutures.careers.length === 0) {
      return {
        averageUtility: 0,
        bestCaseUtility: 0,
        worstCaseUtility: 0,
        variance: 0,
      };
    }

    // Get utilities from future contexts if available
    const utilities: number[] = [];

    for (const career of reachableFutures.careers) {
      const context = futureContexts.find(
        (fc) => fc.path?.nodes.at(-1)?.id === career.careerId
      );

      if (context) {
        utilities.push(context.attractivenessScore);
      } else {
        // Estimate based on transition difficulty
        const estimatedUtility = Math.max(0, 100 - career.transitionDifficulty);
        utilities.push(estimatedUtility);
      }
    }

    const averageUtility =
      utilities.reduce((sum, u) => sum + u, 0) / utilities.length;
    const bestCaseUtility = Math.max(...utilities);
    const worstCaseUtility = Math.min(...utilities);

    // Calculate variance
    const squaredDiffs = utilities.map((u) => Math.pow(u - averageUtility, 2));
    const variance =
      squaredDiffs.reduce((sum, d) => sum + d, 0) / utilities.length;

    return {
      averageUtility,
      bestCaseUtility,
      worstCaseUtility,
      variance,
    };
  }

  /**
   * Calculate future utility potential.
   */
  private calculateUtilityPotential(
    reachableFutures: OptionValueCalculation['reachableFutures'],
    futureContexts: FutureContext[]
  ): OptionValueCalculation['utilityPotential'] {
    // Calculate short-term utility (0-3 years)
    const shortTermCareers = reachableFutures.careers.filter(
      (c) => c.transitionDifficulty < 40
    );
    const shortTerm =
      shortTermCareers.length > 0
        ? shortTermCareers.reduce((sum, c) => sum + c.utilityPotential, 0) /
          shortTermCareers.length
        : 50;

    // Calculate medium-term utility (3-7 years)
    const mediumTermCareers = reachableFutures.careers.filter(
      (c) => c.transitionDifficulty >= 40 && c.transitionDifficulty < 70
    );
    const mediumTerm =
      mediumTermCareers.length > 0
        ? mediumTermCareers.reduce((sum, c) => sum + c.utilityPotential, 0) /
          mediumTermCareers.length
        : 55;

    // Calculate long-term utility (7+ years)
    const longTerm = Math.min(
      shortTerm * 1.2,
      95
    );

    // Determine growth trajectory
    let growthTrajectory: OptionValueCalculation['utilityPotential']['growthTrajectory'] =
      'stable';
    if (longTerm > mediumTerm * 1.15) {
      growthTrajectory = 'accelerating';
    } else if (longTerm > mediumTerm) {
      growthTrajectory = 'growing';
    } else if (longTerm < shortTerm * 0.9) {
      growthTrajectory = 'declining';
    }

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      growthTrajectory,
    };
  }

  /**
   * Calculate market opportunities.
   */
  private calculateMarketOpportunities(
    reachableFutures: OptionValueCalculation['reachableFutures'],
    futureContexts: FutureContext[]
  ): OptionValueCalculation['marketOpportunities'] {
    // Count current opportunities
    const currentOpportunities = reachableFutures.count;

    // Estimate projected growth based on future contexts
    let projectedGrowth = 0;
    if (futureContexts.length > 0) {
      const growthScores = futureContexts.map((fc) => {
        const growthChar = fc.characteristics?.find(
          (c) => c.type === 'growth'
        );
        return growthChar?.score || 50;
      });
      projectedGrowth =
        growthScores.reduce((sum, s) => sum + s, 0) / growthScores.length;
    } else {
      projectedGrowth = 50; // Default
    }

    // Identify emerging fields
    const emergingFields = this.identifyEmergingFields(
      reachableFutures.careers
    );

    return {
      currentOpportunities,
      projectedGrowth,
      emergingFields,
    };
  }

  /**
   * Calculate total option value.
   */
  private calculateTotalValue(
    reachableFutures: OptionValueCalculation['reachableFutures'],
    futureQuality: OptionValueCalculation['futureQuality'],
    utilityPotential: OptionValueCalculation['utilityPotential'],
    marketOpportunities: OptionValueCalculation['marketOpportunities']
  ): number {
    // Normalize components to 0-100
    const reachableFuturesScore = Math.min(reachableFutures.count * 10, 100);
    const diversityScore = reachableFutures.diversityScore;

    const qualityScore = futureQuality.averageUtility;

    const potentialScore =
      (utilityPotential.shortTerm +
        utilityPotential.mediumTerm +
        utilityPotential.longTerm) /
      3;

    const marketScore =
      (marketOpportunities.currentOpportunities * 5 +
        marketOpportunities.projectedGrowth) /
      2;

    // Weighted total
    const total =
      reachableFuturesScore * this.config.reachableFuturesWeight +
      qualityScore * this.config.futureQualityWeight +
      potentialScore * this.config.utilityPotentialWeight +
      marketScore * this.config.marketOpportunitiesWeight;

    return Math.min(100, Math.max(0, total));
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    reachableFutures: OptionValueCalculation['reachableFutures'],
    futureQuality: OptionValueCalculation['futureQuality'],
    utilityPotential: OptionValueCalculation['utilityPotential'],
    marketOpportunities: OptionValueCalculation['marketOpportunities']
  ): string[] {
    const explanation: string[] = [];

    explanation.push(
      `Provides access to ${reachableFutures.count} future career paths`
    );

    if (reachableFutures.diversityScore > 70) {
      explanation.push(
        'High diversity of reachable careers across different industries'
      );
    }

    explanation.push(
      `Average utility of future options: ${Math.round(
        futureQuality.averageUtility
      )}%`
    );

    explanation.push(
      `Future utility trajectory is ${utilityPotential.growthTrajectory}`
    );

    if (marketOpportunities.emergingFields.length > 0) {
      explanation.push(
        `Aligned with emerging fields: ${marketOpportunities.emergingFields.join(
          ', '
        )}`
      );
    }

    return explanation;
  }

  /**
   * Estimate utility potential from edge.
   */
  private estimateUtilityPotential(edge: CareerTransitionEdge): number {
    // Higher transition probability and lower difficulty = higher utility
    const probability = edge.transitionProbability || 0.5;
    const difficulty = edge.transitionDifficulty;

    return Math.round(
      (probability * 100 + (100 - difficulty)) / 2
    );
  }

  /**
   * Infer industry from career ID.
   */
  private inferIndustry(careerId: string): string {
    // Simple heuristic based on career ID keywords
    if (careerId.includes('software') || careerId.includes('engineer')) {
      return 'technology';
    }
    if (careerId.includes('medicine') || careerId.includes('doctor')) {
      return 'healthcare';
    }
    if (careerId.includes('finance') || careerId.includes('banking')) {
      return 'finance';
    }
    if (careerId.includes('design') || careerId.includes('creative')) {
      return 'creative';
    }
    return 'general';
  }

  /**
   * Identify emerging fields from careers.
   */
  private identifyEmergingFields(
    careers: Array<{ careerId: string; name: string }>
  ): string[] {
    const emergingFields: string[] = [];
    const careerIds = careers.map((c) => c.careerId.toLowerCase());

    // Check for technology fields
    if (
      careerIds.some((id) =>
        ['ai', 'machine-learning', 'data-science', 'blockchain'].some((tech) =>
          id.includes(tech)
        )
      )
    ) {
      emergingFields.push('AI/ML');
    }

    // Check for sustainability
    if (
      careerIds.some((id) =>
        ['sustainability', 'renewable', 'climate', 'green'].some((term) =>
          id.includes(term)
        )
      )
    ) {
      emergingFields.push('Sustainability');
    }

    // Check for healthcare innovation
    if (
      careerIds.some((id) =>
        ['biotech', 'digital-health', 'telemedicine'].some((term) =>
          id.includes(term)
        )
      )
    ) {
      emergingFields.push('Digital Health');
    }

    return emergingFields;
  }
}

/**
 * Factory function for OptionValueCalculator.
 */
export function createOptionValueCalculator(
  config: RealOptionsEngineConfig
): OptionValueCalculator {
  return new OptionValueCalculator(config);
}
