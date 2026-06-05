/**
 * CareerOS Real Options Theory Engine - Future Opportunity Calculator
 *
 * Evaluates:
 * - Future pathways
 * - Emerging opportunities
 * - Market adaptability
 */

import type {
  CareerId,
  FutureOpportunityCalculation,
  RealOptionsEngineConfig,
} from './types';

import type {
  FutureContext,
} from '../future-explorer';

import type {
  CareerTransitionEdge,
} from '../career-graph-v2';

/**
 * Calculates future opportunities for a career.
 */
export class FutureOpportunityCalculator {
  private config: RealOptionsEngineConfig;

  constructor(config: RealOptionsEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate future opportunities.
   */
  calculate(
    careerId: CareerId,
    futureContexts: FutureContext[],
    transitionEdges: CareerTransitionEdge[]
  ): FutureOpportunityCalculation {
    // Calculate future pathways
    const futurePathways = this.calculateFuturePathways(
      careerId,
      transitionEdges
    );

    // Calculate emerging opportunities
    const emergingOpportunities = this.calculateEmergingOpportunities(
      futureContexts
    );

    // Calculate market adaptability
    const marketAdaptability = this.calculateMarketAdaptability(
      futureContexts,
      transitionEdges
    );

    // Calculate technology exposure
    const technologyExposure = this.calculateTechnologyExposure(
      futureContexts
    );

    // Calculate total opportunity score
    const opportunityScore = this.calculateTotalOpportunity(
      futurePathways,
      emergingOpportunities,
      marketAdaptability
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      futurePathways,
      emergingOpportunities,
      marketAdaptability,
      technologyExposure
    );

    return {
      careerId,
      opportunityScore,
      futurePathways,
      emergingOpportunities,
      marketAdaptability,
      technologyExposure,
      explanation,
    };
  }

  /**
   * Calculate future pathways.
   */
  private calculateFuturePathways(
    careerId: CareerId,
    transitionEdges: CareerTransitionEdge[]
  ): FutureOpportunityCalculation['futurePathways'] {
    // Find all possible transitions
    const outgoingEdges = transitionEdges.filter(
      (e) => e.sourceCareerId === careerId || e.sourceId === careerId
    );

    // Create pathway objects
    const pathways = outgoingEdges.slice(0, 10).map((edge) => ({
      name: edge.targetCareerId || edge.targetId || 'Unknown Path',
      probability: (edge.transitionProbability || 0.5) * 100,
      utility: Math.max(0, 100 - edge.transitionDifficulty),
      timeToReach: (edge.transitionTimeMonths || 12) / 12,
    }));

    // Calculate diversification
    const uniqueDestinations = new Set(
      pathways.map((p) => p.name)
    ).size;
    const diversification = Math.min(
      (uniqueDestinations / Math.max(pathways.length, 1)) * 100,
      100
    );

    return {
      count: pathways.length,
      pathways,
      diversification,
    };
  }

  /**
   * Calculate emerging opportunities.
   */
  private calculateEmergingOpportunities(
    futureContexts: FutureContext[]
  ): FutureOpportunityCalculation['emergingOpportunities'] {
    // Extract opportunities from future characteristics
    const opportunities: FutureOpportunityCalculation['emergingOpportunities']['opportunities'] =
      [];

    for (const context of futureContexts) {
      // Check for growth characteristics
      const growthChar = context.characteristics?.find(
        (c) => c.type === 'growth'
      );

      if (growthChar && growthChar.score > 60) {
        opportunities.push({
          field: context.name,
          growthRate: growthChar.score,
          relevance: context.attractivenessScore,
        });
      }

      // Check for innovation/impact characteristics
      const impactChar = context.characteristics?.find(
        (c) => c.type === 'impact'
      );

      if (impactChar && impactChar.score > 60) {
        opportunities.push({
          field: `${context.name} - Innovation`,
          growthRate: impactChar.score,
          relevance: context.attractivenessScore,
        });
      }
    }

    // Sort by relevance
    opportunities.sort((a, b) => b.relevance - a.relevance);

    // Calculate score
    const score =
      opportunities.length > 0
        ? opportunities.reduce((sum, o) => sum + o.relevance, 0) /
          opportunities.length
        : 50;

    // Calculate trend alignment
    const trendAlignment = score;

    return {
      score,
      opportunities: opportunities.slice(0, 5),
      trendAlignment,
    };
  }

  /**
   * Calculate market adaptability.
   */
  private calculateMarketAdaptability(
    futureContexts: FutureContext[],
    transitionEdges: CareerTransitionEdge[]
  ): FutureOpportunityCalculation['marketAdaptability'] {
    // Factors affecting adaptability
    const factors: string[] = [];

    // Check transition diversity
    const edgeTypes = new Set(transitionEdges.map((e) => e.relationshipType));
    if (edgeTypes.size > 2) {
      factors.push('Diverse transition types available');
    }

    // Check future context flexibility
    const flexibilityChars = futureContexts.filter((fc) =>
      fc.characteristics?.some((c) => c.type === 'flexibility' && c.score > 60)
    );
    if (flexibilityChars.length > 0) {
      factors.push('Future contexts show high flexibility');
    }

    // Calculate resilience scores
    const resilienceToAutomation = this.estimateAutomationResilience(
      futureContexts
    );
    const resilienceToOutsourcing = this.estimateOutsourcingResilience(
      futureContexts
    );
    const crossIndustryPortability = this.calculateCrossIndustryPortability(
      transitionEdges
    );

    // Overall score
    const score = Math.round(
      (resilienceToAutomation +
        resilienceToOutsourcing +
        crossIndustryPortability) /
        3
    );

    return {
      score,
      factors,
      resilienceToAutomation,
      resilienceToOutsourcing,
      crossIndustryPortability,
    };
  }

  /**
   * Calculate technology exposure.
   */
  private calculateTechnologyExposure(
    futureContexts: FutureContext[]
  ): FutureOpportunityCalculation['technologyExposure'] {
    // Estimate current tech exposure
    const current = futureContexts.length > 0
      ? futureContexts.reduce(
          (sum, fc) =>
            sum +
            (fc.characteristics?.find((c) => c.type === 'growth')?.score || 50),
          0
        ) / futureContexts.length
      : 50;

    // Project future exposure (assume growth)
    const projected = Math.min(current * 1.2, 95);

    // Identify emerging tech
    const emergingTech: string[] = [];

    if (current > 60) {
      emergingTech.push('AI/ML Integration');
    }
    if (current > 70) {
      emergingTech.push('Automation Tools');
    }
    if (current > 80) {
      emergingTech.push('Advanced Analytics');
    }

    return {
      current: Math.round(current),
      projected: Math.round(projected),
      emergingTech,
    };
  }

  /**
   * Calculate total opportunity score.
   */
  private calculateTotalOpportunity(
    futurePathways: FutureOpportunityCalculation['futurePathways'],
    emergingOpportunities: FutureOpportunityCalculation['emergingOpportunities'],
    marketAdaptability: FutureOpportunityCalculation['marketAdaptability']
  ): number {
    // Normalize components
    const pathwaysScore = Math.min(futurePathways.count * 10, 100);
    const diversificationScore = futurePathways.diversification;

    const opportunitiesScore = emergingOpportunities.score;
    const trendScore = emergingOpportunities.trendAlignment;

    const adaptabilityScore = marketAdaptability.score;

    // Weighted total
    return Math.round(
      pathwaysScore * this.config.futurePathwaysWeight * 0.5 +
        diversificationScore * this.config.futurePathwaysWeight * 0.5 +
        opportunitiesScore * this.config.emergingOpportunitiesWeight * 0.5 +
        trendScore * this.config.emergingOpportunitiesWeight * 0.5 +
        adaptabilityScore * this.config.marketAdaptabilityWeight
    );
  }

  /**
   * Estimate resilience to automation.
   */
  private estimateAutomationResilience(
    futureContexts: FutureContext[]
  ): number {
    // Higher growth and impact = more resilient
    const avgGrowth =
      futureContexts.reduce(
        (sum, fc) =>
          sum +
          (fc.characteristics?.find((c) => c.type === 'growth')?.score || 50),
        0
      ) / Math.max(futureContexts.length, 1);

    const avgImpact =
      futureContexts.reduce(
        (sum, fc) =>
          sum +
          (fc.characteristics?.find((c) => c.type === 'impact')?.score || 50),
        0
      ) / Math.max(futureContexts.length, 1);

    return Math.round((avgGrowth + avgImpact) / 2);
  }

  /**
   * Estimate resilience to outsourcing.
   */
  private estimateOutsourcingResilience(
    futureContexts: FutureContext[]
  ): number {
    // Stability indicates resilience
    const avgStability =
      futureContexts.reduce(
        (sum, fc) =>
          sum +
          (fc.characteristics?.find((c) => c.type === 'stability')?.score ||
            50),
        0
      ) / Math.max(futureContexts.length, 1);

    return Math.round(avgStability);
  }

  /**
   * Calculate cross-industry portability.
   */
  private calculateCrossIndustryPortability(
    transitionEdges: CareerTransitionEdge[]
  ): number {
    // More diverse edge types = more portable
    const relationshipTypes = new Set(
      transitionEdges.map((e) => e.relationshipType)
    );

    return Math.min(relationshipTypes.size * 20, 100);
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    futurePathways: FutureOpportunityCalculation['futurePathways'],
    emergingOpportunities: FutureOpportunityCalculation['emergingOpportunities'],
    marketAdaptability: FutureOpportunityCalculation['marketAdaptability'],
    technologyExposure: FutureOpportunityCalculation['technologyExposure']
  ): string[] {
    const explanation: string[] = [];

    explanation.push(
      `${futurePathways.count} future career pathways available`
    );

    explanation.push(
      `Pathway diversification: ${Math.round(futurePathways.diversification)}%`
    );

    if (emergingOpportunities.opportunities.length > 0) {
      explanation.push(
        `Aligned with ${emergingOpportunities.opportunities.length} emerging opportunity areas`
      );
    }

    explanation.push(
      `Market adaptability score: ${marketAdaptability.score}%`
    );

    if (marketAdaptability.factors.length > 0) {
      explanation.push(marketAdaptability.factors[0]);
    }

    if (technologyExposure.emergingTech.length > 0) {
      explanation.push(
        `Technology exposure: ${technologyExposure.emergingTech.join(', ')}`
      );
    }

    return explanation;
  }
}

/**
 * Factory function for FutureOpportunityCalculator.
 */
export function createFutureOpportunityCalculator(
  config: RealOptionsEngineConfig
): FutureOpportunityCalculator {
  return new FutureOpportunityCalculator(config);
}
