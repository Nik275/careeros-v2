/**
 * CareerOS Real Options Theory Engine - Main Engine
 *
 * Evaluates career decisions based on the value of preserving future opportunities.
 * Measures not only current utility but future option value.
 */

import {
  OptionValueCalculator,
} from './OptionValueCalculator';

import {
  FlexibilityCalculator,
} from './FlexibilityCalculator';

import {
  ReversibilityCalculator,
} from './ReversibilityCalculator';

import {
  FutureOpportunityCalculator,
} from './FutureOpportunityCalculator';

import {
  CommitmentCostEngine,
} from './CommitmentCostEngine';

import {
  OptionNarrativeEngine,
} from './OptionNarrativeEngine';

import type {
  RealOptionsId,
  CareerId,
  RealOptionsInput,
  RealOptionsAnalysis,
  RealOptionsComparison,
  RealOptionsComparisonInput,
  RealOptionsEngineConfig,
  CareerOption,
  DEFAULT_REAL_OPTIONS_CONFIG,
} from './types';

/**
 * Real Options Engine - Evaluates career decisions based on option value.
 */
export class RealOptionsEngine {
  private config: RealOptionsEngineConfig;
  private optionValueCalculator: OptionValueCalculator;
  private flexibilityCalculator: FlexibilityCalculator;
  private reversibilityCalculator: ReversibilityCalculator;
  private futureOpportunityCalculator: FutureOpportunityCalculator;
  private commitmentCostEngine: CommitmentCostEngine;
  private narrativeEngine: OptionNarrativeEngine;

  constructor(config: Partial<RealOptionsEngineConfig> = {}) {
    this.config = { ...DEFAULT_REAL_OPTIONS_CONFIG, ...config };

    this.optionValueCalculator = new OptionValueCalculator(this.config);
    this.flexibilityCalculator = new FlexibilityCalculator(this.config);
    this.reversibilityCalculator = new ReversibilityCalculator(this.config);
    this.futureOpportunityCalculator = new FutureOpportunityCalculator(this.config);
    this.commitmentCostEngine = new CommitmentCostEngine(this.config);
    this.narrativeEngine = new OptionNarrativeEngine();
  }

  /**
   * Main entry point: analyze a career's real options.
   */
  analyze(input: RealOptionsInput): RealOptionsAnalysis {
    const {
      studentId,
      careerId,
      careerName,
      optionalityAnalysis,
      criticalityAnalysis,
      transitionEdges,
      futureContexts,
    } = input;

    // Calculate option value
    const optionValueCalculation = this.optionValueCalculator.calculate(
      careerId,
      transitionEdges,
      futureContexts
    );

    // Calculate flexibility
    const flexibilityCalculation = this.flexibilityCalculator.calculate(
      careerId,
      optionalityAnalysis,
      transitionEdges
    );

    // Calculate reversibility
    const reversibilityCalculation = this.reversibilityCalculator.calculate(
      careerId,
      criticalityAnalysis,
      transitionEdges
    );

    // Calculate future opportunities
    const futureOpportunityCalculation = this.futureOpportunityCalculator.calculate(
      careerId,
      futureContexts,
      transitionEdges
    );

    // Calculate commitment cost
    const commitmentCostCalculation = this.commitmentCostEngine.calculate(
      careerId,
      criticalityAnalysis,
      optionalityAnalysis
    );

    // Calculate component scores
    const components = this.calculateComponents(
      optionValueCalculation,
      flexibilityCalculation,
      reversibilityCalculation,
      futureOpportunityCalculation,
      commitmentCostCalculation
    );

    // Calculate overall scores
    const optionValue = optionValueCalculation.totalValue;
    const commitmentCost = commitmentCostCalculation.totalCost;
    const futureFlexibility = flexibilityCalculation.flexibilityScore;
    const reversibility = reversibilityCalculation.reversibilityScore;

    // Calculate net option value
    const commitmentPenalty = commitmentCost * 0.3; // Commitment reduces option value
    const netOptionValue = Math.max(0, optionValue - commitmentPenalty);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      optionValue,
      commitmentCost,
      futureFlexibility,
      reversibility,
      netOptionValue
    );

    // Generate narrative
    const partialAnalysis: Omit<RealOptionsAnalysis, 'id' | 'timestamp' | 'narrative'> = {
      studentId,
      careerId,
      careerName,
      optionValue,
      commitmentCost,
      netOptionValue,
      futureFlexibility,
      reversibility,
      calculations: {
        optionValue: optionValueCalculation,
        flexibility: flexibilityCalculation,
        reversibility: reversibilityCalculation,
        futureOpportunities: futureOpportunityCalculation,
        commitmentCost: commitmentCostCalculation,
      },
      components,
      recommendations,
      confidence: this.calculateConfidence(input),
    };

    const narrative = this.narrativeEngine.generate(partialAnalysis as RealOptionsAnalysis);

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      ...partialAnalysis,
      narrative,
    };
  }

  /**
   * Analyze multiple careers and compare.
   */
  compare(input: RealOptionsComparisonInput): RealOptionsComparison {
    const { studentId, analyses, weights = { optionValue: 0.4, commitmentCost: 0.3, futureFlexibility: 0.3 } } = input;

    // Rank by different criteria
    const byOptionValue = [...analyses].sort((a, b) => b.optionValue - a.optionValue);
    const byCommitmentCost = [...analyses].sort((a, b) => a.commitmentCost - b.commitmentCost);
    const byNetValue = [...analyses].sort((a, b) => b.netOptionValue - a.netOptionValue);
    const byFlexibility = [...analyses].sort((a, b) => b.futureFlexibility - a.futureFlexibility);

    // Best by category
    const bestByCategory = {
      highestOptionValue: byOptionValue[0] || null,
      lowestCommitmentCost: byCommitmentCost[0] || null,
      highestNetValue: byNetValue[0] || null,
      highestFlexibility: byFlexibility[0] || null,
      highestReversibility: [...analyses].sort((a, b) => b.reversibility - a.reversibility)[0] || null,
    };

    // Trade-off analysis
    const tradeOffs = this.analyzeTradeOffs(analyses);

    // Overall recommendation
    const overallRecommendation = this.generateOverallRecommendation(
      bestByCategory,
      analyses,
      weights
    );

    // Generate explanation
    const explanation = this.generateComparisonExplanation(
      analyses,
      bestByCategory,
      overallRecommendation
    );

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      studentId,
      analyses,
      rankings: {
        byOptionValue,
        byCommitmentCost,
        byNetValue,
        byFlexibility,
      },
      bestByCategory,
      tradeOffs,
      overallRecommendation,
      explanation,
    };
  }

  /**
   * Calculate CareerOption summary.
   */
  calculateCareerOption(analysis: RealOptionsAnalysis): CareerOption {
    const { careerId, careerName, optionValue, commitmentCost, netOptionValue } = analysis;

    const rating = this.getOptionValueRating(netOptionValue);

    return {
      careerId,
      careerName,
      optionValue,
      optionValueRating: rating,
      flexibilityValue: analysis.futureFlexibility,
      reversibilityValue: analysis.reversibility,
      futureOpportunityValue: analysis.calculations.futureOpportunities.opportunityScore,
      commitmentCost,
      netOptionValue,
      explanation: analysis.narrative.optionValueExplanation.slice(0, 3),
      breakdown: {
        reachableFutures: analysis.calculations.optionValue.reachableFutures.count,
        averageFutureQuality: analysis.calculations.optionValue.futureQuality.averageUtility,
        futureUtilityPotential: (analysis.calculations.optionValue.utilityPotential.shortTerm +
          analysis.calculations.optionValue.utilityPotential.mediumTerm +
          analysis.calculations.optionValue.utilityPotential.longTerm) / 3,
        pivotingEase: analysis.calculations.flexibility.pivotingEase.score,
        transferableSkillsScore: analysis.calculations.flexibility.transferableSkills.score,
        careerMobilityScore: analysis.calculations.flexibility.careerMobility.score,
        timeCost: analysis.calculations.commitmentCost.yearsInvested.total,
        educationLockIn: analysis.calculations.reversibility.educationLockIn.score,
        credentialLockIn: analysis.calculations.reversibility.credentialLockIn.score,
        sunkCostExposure: analysis.calculations.reversibility.sunkCost.financial,
        futurePathways: analysis.calculations.futureOpportunities.futurePathways.count,
        emergingOpportunitiesScore: analysis.calculations.futureOpportunities.emergingOpportunities.score,
        marketAdaptabilityScore: analysis.calculations.futureOpportunities.marketAdaptability.score,
      },
    };
  }

  /**
   * Calculate component scores.
   */
  private calculateComponents(
    optionValue: RealOptionsAnalysis['calculations']['optionValue'],
    flexibility: RealOptionsAnalysis['calculations']['flexibility'],
    reversibility: RealOptionsAnalysis['calculations']['reversibility'],
    futureOpportunities: RealOptionsAnalysis['calculations']['futureOpportunities'],
    commitmentCost: RealOptionsAnalysis['calculations']['commitmentCost']
  ): RealOptionsAnalysis['components'] {
    return {
      reachableFutures: optionValue.reachableFutures.count,
      futureQuality: optionValue.futureQuality.averageUtility,
      pivotingEase: flexibility.pivotingEase.score,
      transferableSkills: flexibility.transferableSkills.score,
      careerMobility: flexibility.careerMobility.score,
      timeReversibility: 100 - reversibility.timeCost.yearsInvested * 10,
      educationLockIn: reversibility.educationLockIn.score,
      credentialLockIn: reversibility.credentialLockIn.score,
      futurePathways: futureOpportunities.futurePathways.count,
      emergingOpportunities: futureOpportunities.emergingOpportunities.score,
      marketAdaptability: futureOpportunities.marketAdaptability.score,
      specializationIntensity: commitmentCost.specializationIntensity.score,
      switchingDifficulty: commitmentCost.switchingDifficulty.overall,
    };
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(
    optionValue: number,
    commitmentCost: number,
    futureFlexibility: number,
    reversibility: number,
    netOptionValue: number
  ): RealOptionsAnalysis['recommendations'] {
    const preserveOptionality = netOptionValue > 50 && futureFlexibility > 60;

    // Determine strategy
    let strategy: RealOptionsAnalysis['recommendations']['strategy'] = 'selective-focus';
    if (optionValue > 70 && commitmentCost < 50) {
      strategy = 'maximize-options';
    } else if (optionValue > 70 && commitmentCost > 50) {
      strategy = 'strategic-commitment';
    } else if (optionValue < 50 && commitmentCost > 70) {
      strategy = 'selective-focus';
    } else if (optionValue > 80) {
      strategy = 'deep-specialization';
    }

    // Generate reasoning
    const reasoning: string[] = [];
    if (preserveOptionality) {
      reasoning.push('High net option value suggests preserving future flexibility.');
    }
    if (futureFlexibility > 70) {
      reasoning.push('Strong future flexibility supports optionality-preserving approach.');
    }
    if (commitmentCost > 70) {
      reasoning.push('High commitment cost requires careful consideration before proceeding.');
    }
    if (reversibility < 40) {
      reasoning.push('Low reversibility means this decision has lasting consequences.');
    }

    // Generate actions
    const actions: string[] = [];
    if (strategy === 'maximize-options') {
      actions.push('Delay specialization decisions');
      actions.push('Build transferable skills');
      actions.push('Explore multiple career paths before committing');
    } else if (strategy === 'strategic-commitment') {
      actions.push('Commit to high-value path while maintaining some flexibility');
      actions.push('Develop complementary skills for adjacent careers');
      actions.push('Create periodic review points for pivot decisions');
    } else if (strategy === 'selective-focus') {
      actions.push('Focus on highest-potential specializations');
      actions.push('Minimize unnecessary commitment costs');
      actions.push('Build exit strategies for key decision points');
    } else if (strategy === 'deep-specialization') {
      actions.push('Pursue deep expertise in chosen domain');
      actions.push('Accept commitment as strategic investment');
      actions.push('Build domain authority and thought leadership');
    }

    return {
      preserveOptionality,
      strategy,
      reasoning,
      actions,
    };
  }

  /**
   * Calculate confidence in analysis.
   */
  private calculateConfidence(input: RealOptionsInput): number {
    let confidence = 0.5;

    // Boost confidence based on data availability
    if (input.transitionEdges.length > 5) confidence += 0.15;
    if (input.futureContexts.length > 0) confidence += 0.15;
    if (input.optionalityAnalysis.adjacentCareers?.length) confidence += 0.1;
    if (input.criticalityAnalysis.metrics) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  /**
   * Analyze trade-offs between careers.
   */
  private analyzeTradeOffs(analyses: RealOptionsAnalysis[]): RealOptionsComparison['tradeOffs'] {
    const tradeOffs: RealOptionsComparison['tradeOffs'] = [];

    for (let i = 0; i < analyses.length; i++) {
      for (let j = i + 1; j < analyses.length; j++) {
        const a = analyses[i];
        const b = analyses[j];

        const optionValueTradeOff = b.optionValue - a.optionValue;
        const commitmentCostTradeOff = b.commitmentCost - a.commitmentCost;

        let recommendation: string;
        if (optionValueTradeOff > 10 && commitmentCostTradeOff < 10) {
          recommendation = `Prefer ${b.careerName} for higher option value with similar commitment.`;
        } else if (optionValueTradeOff < -10 && commitmentCostTradeOff > 10) {
          recommendation = `Prefer ${a.careerName} for better option value to commitment ratio.`;
        } else if (Math.abs(optionValueTradeOff) < 10 && Math.abs(commitmentCostTradeOff) < 10) {
          recommendation = 'Similar real options profile - consider other factors.';
        } else {
          recommendation = 'Trade-off depends on risk tolerance and career goals.';
        }

        tradeOffs.push({
          careerA: a.careerId,
          careerB: b.careerId,
          optionValueTradeOff,
          commitmentCostTradeOff,
          recommendation,
        });
      }
    }

    return tradeOffs;
  }

  /**
   * Generate overall recommendation.
   */
  private generateOverallRecommendation(
    bestByCategory: RealOptionsComparison['bestByCategory'],
    analyses: RealOptionsAnalysis[],
    weights: RealOptionsComparisonInput['weights']
  ): RealOptionsComparison['overallRecommendation'] {
    // Score each analysis by weighted criteria
    const scored = analyses.map((analysis) => ({
      analysis,
      score:
        analysis.optionValue * (weights?.optionValue || 0.4) -
        analysis.commitmentCost * (weights?.commitmentCost || 0.3) +
        analysis.futureFlexibility * (weights?.futureFlexibility || 0.3),
    }));

    scored.sort((a, b) => b.score - a.score);
    const topChoice = scored[0]?.analysis || null;

    const reasoning: string[] = [];
    if (topChoice) {
      reasoning.push(`${topChoice.careerName} offers the best balance of option value and commitment cost.`);
      
      if (topChoice.netOptionValue > 60) {
        reasoning.push('Strong net option value supports this choice.');
      }
      if (topChoice.futureFlexibility > 70) {
        reasoning.push('Excellent future flexibility preserves career options.');
      }
    }

    let strategy = 'balanced';
    if (bestByCategory.highestNetValue?.netOptionValue && bestByCategory.highestNetValue.netOptionValue > 70) {
      strategy = 'optionality-focused';
    } else if (bestByCategory.lowestCommitmentCost?.commitmentCost && bestByCategory.lowestCommitmentCost.commitmentCost < 30) {
      strategy = 'flexibility-first';
    }

    return {
      topChoice,
      reasoning,
      strategy,
    };
  }

  /**
   * Generate comparison explanation.
   */
  private generateComparisonExplanation(
    analyses: RealOptionsAnalysis[],
    bestByCategory: RealOptionsComparison['bestByCategory'],
    recommendation: RealOptionsComparison['overallRecommendation']
  ): RealOptionsComparison['explanation'] {
    const summary = `Compared ${analyses.length} careers based on real options theory. ${recommendation.topChoice?.careerName || 'Analysis'} emerges as the top choice.`;

    const comparisons: string[] = [];
    
    if (bestByCategory.highestOptionValue) {
      comparisons.push(`Highest option value: ${bestByCategory.highestOptionValue.careerName} (${Math.round(bestByCategory.highestOptionValue.optionValue)}%)`);
    }
    if (bestByCategory.lowestCommitmentCost) {
      comparisons.push(`Lowest commitment cost: ${bestByCategory.lowestCommitmentCost.careerName} (${Math.round(bestByCategory.lowestCommitmentCost.commitmentCost)}%)`);
    }
    if (bestByCategory.highestNetValue) {
      comparisons.push(`Highest net option value: ${bestByCategory.highestNetValue.careerName} (${Math.round(bestByCategory.highestNetValue.netOptionValue)}%)`);
    }

    const insights: string[] = [];
    if (analyses.length >= 2) {
      const range = Math.max(...analyses.map((a) => a.optionValue)) - Math.min(...analyses.map((a) => a.optionValue));
      if (range > 30) {
        insights.push('Significant variation in option value across careers.');
      } else {
        insights.push('Similar option value profiles - other factors may be decisive.');
      }
    }

    return {
      summary,
      comparisons,
      insights,
    };
  }

  /**
   * Get option value rating.
   */
  private getOptionValueRating(score: number): CareerOption['optionValueRating'] {
    if (score >= 80) return 'exceptional';
    if (score >= 65) return 'high';
    if (score >= 45) return 'moderate';
    if (score >= 25) return 'low';
    return 'minimal';
  }

  /**
   * Generate unique ID.
   */
  private generateId(): RealOptionsId {
    return `realopt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for RealOptionsEngine.
 */
export function createRealOptionsEngine(
  config?: Partial<RealOptionsEngineConfig>
): RealOptionsEngine {
  return new RealOptionsEngine(config);
}

/**
 * Convenience function to analyze a single career.
 */
export function analyzeCareerOptions(
  input: RealOptionsInput,
  config?: Partial<RealOptionsEngineConfig>
): RealOptionsAnalysis {
  const engine = new RealOptionsEngine(config);
  return engine.analyze(input);
}

/**
 * Convenience function to compare multiple careers.
 */
export function compareCareerOptions(
  input: RealOptionsComparisonInput,
  config?: Partial<RealOptionsEngineConfig>
): RealOptionsComparison {
  const engine = new RealOptionsEngine(config);
  return engine.compare(input);
}
