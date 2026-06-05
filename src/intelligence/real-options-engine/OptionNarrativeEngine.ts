/**
 * CareerOS Real Options Theory Engine - Option Narrative Engine
 *
 * Generates narrative explanations for real options analysis.
 */

import type {
  RealOptionsAnalysis,
  RealOptionsScore,
  OptionValueRating,
} from './types';

/**
 * Generates narrative explanations for real options analysis.
 */
export class OptionNarrativeEngine {
  /**
   * Main entry point: generate narrative.
   */
  generate(analysis: RealOptionsAnalysis): RealOptionsAnalysis['narrative'] {
    const summary = this.generateSummary(analysis);
    const optionValueExplanation = this.generateOptionValueExplanation(analysis);
    const commitmentCostExplanation = this.generateCommitmentCostExplanation(analysis);
    const tradeOffExplanation = this.generateTradeOffExplanation(analysis);
    const recommendationExplanation = this.generateRecommendationExplanation(analysis);

    return {
      summary,
      optionValueExplanation,
      commitmentCostExplanation,
      tradeOffExplanation,
      recommendationExplanation,
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(analysis: RealOptionsAnalysis): string {
    const { careerName, optionValue, commitmentCost, netOptionValue } = analysis;

    const rating = this.getOptionValueRating(netOptionValue);

    if (rating === 'exceptional' || rating === 'high') {
      return `${careerName} offers ${rating} real option value with strong future flexibility and manageable commitment costs.`;
    }

    if (rating === 'moderate') {
      return `${careerName} provides moderate real option value - reasonable flexibility balanced with moderate commitment requirements.`;
    }

    return `${careerName} has ${rating} real option value due to limited future flexibility or high commitment costs.`;
  }

  /**
   * Generate option value explanation.
   */
  private generateOptionValueExplanation(
    analysis: RealOptionsAnalysis
  ): string[] {
    const explanation: string[] = [];
    const { optionValue, calculations, components } = analysis;

    // Overall assessment
    const rating = this.getOptionValueRating(optionValue);
    explanation.push(`Option value rating: ${rating} (${Math.round(optionValue)}/100)`);

    // Reachable futures
    if (components.reachableFutures > 8) {
      explanation.push(`Exceptional pathway access with ${Math.round(components.reachableFutures)} reachable future careers.`);
    } else if (components.reachableFutures > 5) {
      explanation.push(`Strong pathway access with ${Math.round(components.reachableFutures)} reachable future careers.`);
    } else if (components.reachableFutures > 2) {
      explanation.push(`Moderate pathway access with ${Math.round(components.reachableFutures)} reachable future careers.`);
    } else {
      explanation.push(`Limited pathway access with only ${Math.round(components.reachableFutures)} documented future transitions.`);
    }

    // Future quality
    if (components.futureQuality > 70) {
      explanation.push('High-quality future options with strong expected utility.');
    } else if (components.futureQuality > 50) {
      explanation.push('Moderate-quality future options with reasonable expected utility.');
    } else {
      explanation.push('Lower-quality future options may limit long-term satisfaction.');
    }

    // Flexibility
    if (components.pivotingEase > 70) {
      explanation.push('Easy pivoting to alternative careers due to low transition barriers.');
    } else if (components.pivotingEase > 40) {
      explanation.push('Moderate pivoting difficulty requires planning for transitions.');
    } else {
      explanation.push('Difficult pivoting requires significant investment to change paths.');
    }

    // Transferable skills
    if (components.transferableSkills > 70) {
      explanation.push('Highly transferable skills provide cross-industry mobility.');
    } else if (components.transferableSkills > 40) {
      explanation.push('Moderately transferable skills support limited cross-industry moves.');
    } else {
      explanation.push('Specialized skills limit mobility to specific industries.');
    }

    // Future opportunities
    if (components.futurePathways > 6) {
      explanation.push(`Rich ecosystem with ${Math.round(components.futurePathways)} distinct future pathways.`);
    } else if (components.emergingOpportunities > 60) {
      explanation.push('Well-positioned for emerging opportunities in growing fields.');
    }

    return explanation;
  }

  /**
   * Generate commitment cost explanation.
   */
  private generateCommitmentCostExplanation(
    analysis: RealOptionsAnalysis
  ): string[] {
    const explanation: string[] = [];
    const { commitmentCost, calculations, components } = analysis;

    // Overall assessment
    const level = this.getCommitmentLevel(commitmentCost);
    explanation.push(`Commitment level: ${level} (${Math.round(commitmentCost)}/100)`);

    // Time investment
    const years = calculations.commitmentCost.yearsInvested.total;
    if (years < 5) {
      explanation.push(`Relatively quick entry with ${years} years to career flexibility.`);
    } else if (years < 8) {
      explanation.push(`Moderate time investment of ${years} years to achieve flexibility.`);
    } else {
      explanation.push(`Significant time investment of ${years} years required before flexibility is achieved.`);
    }

    // Money investment
    const money = calculations.commitmentCost.moneyInvested.total;
    if (money < 50) {
      explanation.push(`Lower financial barrier with ~$${money}k estimated investment.`);
    } else if (money < 100) {
      explanation.push(`Moderate financial investment of ~$${money}k required.`);
    } else {
      explanation.push(`Substantial financial investment of ~$${money}k creates commitment pressure.`);
    }

    // Specialization
    const depth = calculations.commitmentCost.specializationIntensity.depth;
    if (depth === 'generalist' || depth === 'broad') {
      explanation.push('Generalist profile maintains broad applicability and lower lock-in.');
    } else if (depth === 'focused') {
      explanation.push('Focused specialization provides depth while maintaining some flexibility.');
    } else if (depth === 'deep') {
      explanation.push('Deep specialization creates expertise but limits alternative paths.');
    } else {
      explanation.push('Expert-level specialization provides authority but significantly constrains options.');
    }

    // Lock-in effects
    const lockInCount = calculations.commitmentCost.lockInEffects.length;
    if (lockInCount === 0) {
      explanation.push('No significant lock-in effects - easy to pivot if needed.');
    } else if (lockInCount <= 2) {
      explanation.push(`Moderate lock-in with ${lockInCount} constraint factors.`);
    } else {
      explanation.push(`Significant lock-in with ${lockInCount} constraint factors including ${calculations.commitmentCost.lockInEffects.map(e => e.type).join(', ')}.`);
    }

    // Switching difficulty
    if (components.switchingDifficulty > 70) {
      explanation.push('High switching difficulty makes career changes costly and time-consuming.');
    } else if (components.switchingDifficulty > 40) {
      explanation.push('Moderate switching difficulty requires planning for transitions.');
    } else {
      explanation.push('Lower switching difficulty enables easier career pivots.');
    }

    return explanation;
  }

  /**
   * Generate trade-off explanation.
   */
  private generateTradeOffExplanation(
    analysis: RealOptionsAnalysis
  ): string[] {
    const explanation: string[] = [];
    const { optionValue, commitmentCost, netOptionValue, futureFlexibility, reversibility } = analysis;

    explanation.push('Key Trade-offs:');

    // Option value vs commitment
    if (optionValue > 70 && commitmentCost < 50) {
      explanation.push('Favorable trade-off: High option value with manageable commitment cost.');
    } else if (optionValue > 70 && commitmentCost > 70) {
      explanation.push('Strategic investment: High option value justifies significant commitment cost.');
    } else if (optionValue < 50 && commitmentCost > 70) {
      explanation.push('Unfavorable trade-off: High commitment cost with limited option value.');
    } else if (optionValue < 50 && commitmentCost < 50) {
      explanation.push('Low-stakes option: Limited upside but easy to exit.');
    } else {
      explanation.push('Balanced trade-off: Moderate option value commensurate with commitment cost.');
    }

    // Flexibility vs reversibility
    if (futureFlexibility > 70 && reversibility > 70) {
      explanation.push('Excellent flexibility profile: High future options with easy reversibility.');
    } else if (futureFlexibility > 70 && reversibility < 50) {
      explanation.push('Forward-looking flexibility: Many future paths but hard to reverse course.');
    } else if (futureFlexibility < 50 && reversibility > 70) {
      explanation.push('Conservative flexibility: Limited future paths but easy to change direction.');
    }

    // Net value assessment
    if (netOptionValue > 60) {
      explanation.push(`Strong net option value (${Math.round(netOptionValue)}%) makes this an attractive choice.`);
    } else if (netOptionValue > 40) {
      explanation.push(`Moderate net option value (${Math.round(netOptionValue)}%) requires careful consideration.`);
    } else {
      explanation.push(`Low net option value (${Math.round(netOptionValue)}%) suggests exploring alternatives.`);
    }

    return explanation;
  }

  /**
   * Generate recommendation explanation.
   */
  private generateRecommendationExplanation(
    analysis: RealOptionsAnalysis
  ): string[] {
    const explanation: string[] = [];
    const { recommendations, netOptionValue } = analysis;

    explanation.push('Recommendation:');

    // Strategy explanation
    switch (recommendations.strategy) {
      case 'maximize-options':
        explanation.push('Strategy: Maximize Options - Prioritize maintaining maximum future flexibility.');
        break;
      case 'strategic-commitment':
        explanation.push('Strategy: Strategic Commitment - Accept moderate commitment for strong option value.');
        break;
      case 'selective-focus':
        explanation.push('Strategy: Selective Focus - Concentrate on highest-value paths while preserving some flexibility.');
        break;
      case 'deep-specialization':
        explanation.push('Strategy: Deep Specialization - Accept high commitment for exceptional option value in specific domain.');
        break;
    }

    // Preserve optionality
    if (recommendations.preserveOptionality) {
      explanation.push('Priority: Preserve future optionality - avoid early specialization.');
    } else {
      explanation.push('Priority: Strategic commitment is warranted given strong option value.');
    }

    // Action items
    if (recommendations.actions.length > 0) {
      explanation.push('');
      explanation.push('Recommended Actions:');
      recommendations.actions.forEach((action) => {
        explanation.push(`• ${action}`);
      });
    }

    // Confidence statement
    explanation.push('');
    if (analysis.confidence > 0.7) {
      explanation.push('High confidence in this analysis based on comprehensive data.');
    } else if (analysis.confidence > 0.4) {
      explanation.push('Moderate confidence - additional information could refine recommendations.');
    } else {
      explanation.push('Lower confidence - significant uncertainty in option value estimates.');
    }

    return explanation;
  }

  /**
   * Get option value rating.
   */
  private getOptionValueRating(score: RealOptionsScore): OptionValueRating {
    if (score >= 80) return 'exceptional';
    if (score >= 65) return 'high';
    if (score >= 45) return 'moderate';
    if (score >= 25) return 'low';
    return 'minimal';
  }

  /**
   * Get commitment level.
   */
  private getCommitmentLevel(score: RealOptionsScore): string {
    if (score < 30) return 'low';
    if (score < 55) return 'moderate';
    if (score < 80) return 'high';
    return 'extreme';
  }
}

/**
 * Factory function for OptionNarrativeEngine.
 */
export function createOptionNarrativeEngine(): OptionNarrativeEngine {
  return new OptionNarrativeEngine();
}
