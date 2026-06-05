/**
 * Reversibility Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 6
 *
 * Classifies decisions by reversibility.
 * Type 1: Hard to reverse | Type 2: Easy to reverse
 *
 * @module reversibility-engine
 * @version 1.0.0
 */

import {
  DecisionReversibility,
  ReversibilityType,
  ReversibilityCategory,
  SwitchingCost,
  DecisionInput,
  DecisionOption,
} from './decision-types';

/**
 * Reversibility Engine implementation
 */
export class ReversibilityEngine {
  /**
   * Assess reversibility of a decision option
   */
  assessReversibility(
    input: DecisionInput,
    option: DecisionOption
  ): DecisionReversibility {
    const switchingCost = this.calculateSwitchingCost(option, input);
    const timeToReverse = this.estimateTimeToReverse(option);
    const score = this.calculateReversibilityScore(option, switchingCost, timeToReverse);
    const type = this.classifyReversibilityType(score);
    const category = this.classifyReversibilityCategory(score);

    return {
      score: Math.round(score),
      type,
      category,
      switchingCost,
      timeToReverse,
      explanation: this.generateExplanation(score, type, category, switchingCost),
      comparableDecisions: this.getComparableDecisions(category),
    };
  }

  /**
   * Calculate switching cost
   */
  private calculateSwitchingCost(
    option: DecisionOption,
    input: DecisionInput
  ): SwitchingCost {
    const financial = this.calculateFinancialCost(option);
    const time = this.calculateTimeCost(option);
    const social = this.calculateSocialCost(option);
    const identity = this.calculateIdentityCost(option, input);
    const opportunity = this.calculateOpportunityCost(option);

    const total = financial + time * 1000 + social * 500 + identity * 1000 + opportunity;

    return {
      financial: Math.round(financial),
      time: Math.round(time),
      social: Math.round(social),
      identity: Math.round(identity),
      opportunity: Math.round(opportunity),
      total: Math.round(total),
    };
  }

  /**
   * Calculate financial switching cost
   */
  private calculateFinancialCost(option: DecisionOption): number {
    let cost = 0;

    // Sunk costs
    cost += option.financialImplications.initialCost * 0.7;

    // Lost income during transition
    cost += option.financialImplications.opportunityCost * 0.3;

    // Retraining costs (estimate)
    if (option.educationPath) {
      cost += option.educationPath.cost * 0.5;
    }

    return cost;
  }

  /**
   * Calculate time cost (in months)
   */
  private calculateTimeCost(option: DecisionOption): number {
    let months = 0;

    // Time already invested (sunk)
    months += option.timeCommitment.duration * 0.5;

    // Time to transition to new path
    months += 6; // Base transition time

    // Additional time for specialized paths
    if (option.educationPath?.specialization) {
      months += 12;
    }

    return months;
  }

  /**
   * Calculate social cost
   */
  private calculateSocialCost(option: DecisionOption): number {
    let cost = 0;

    // Professional network loss
    cost += 30;

    // Social status impact (if high prestige)
    if (option.tags.includes('prestigious')) {
      cost += 25;
    }

    // Relationship strain during transition
    cost += 20;

    return Math.min(100, cost);
  }

  /**
   * Calculate identity cost
   */
  private calculateIdentityCost(
    option: DecisionOption,
    input: DecisionInput
  ): number {
    let cost = 0;

    // How much has this become part of identity?
    const timeInvestment = option.timeCommitment.duration;
    if (timeInvestment > 24) {
      cost += 30;
    }

    // Check if aligns with core values
    const alignment = this.checkValueAlignment(option, input);
    if (alignment > 70) {
      cost += 25; // Harder to leave something deeply aligned
    }

    // Specialization level
    if (option.educationPath?.specialization) {
      cost += 20;
    }

    return Math.min(100, cost);
  }

  /**
   * Calculate opportunity cost
   */
  private calculateOpportunityCost(option: DecisionOption): number {
    // Value of alternatives foregone
    return option.financialImplications.opportunityCost * 0.5;
  }

  /**
   * Check value alignment
   */
  private checkValueAlignment(option: DecisionOption, input: DecisionInput): number {
    // Simple heuristic based on context
    const alignmentIndicators = [
      ...input.context.values,
      ...input.context.aspirationalGoals,
    ];

    let score = 50;

    for (const indicator of alignmentIndicators) {
      if (option.description.toLowerCase().includes(indicator.toLowerCase())) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Estimate time to reverse (months)
   */
  private estimateTimeToReverse(option: DecisionOption): number {
    let months = 6; // Base estimate

    // Add time based on commitment length
    months += option.timeCommitment.duration * 0.3;

    // Add time for specialized paths
    if (option.educationPath?.specialization) {
      months += 12;
    }

    // Add time for high-risk paths
    if (option.riskLevel === 'HIGH' || option.riskLevel === 'VERY_HIGH') {
      months += 3;
    }

    return Math.round(months);
  }

  /**
   * Calculate reversibility score (0-100, higher = more reversible)
   */
  private calculateReversibilityScore(
    option: DecisionOption,
    switchingCost: SwitchingCost,
    timeToReverse: number
  ): number {
    // Normalize costs to 0-100 scale
    const financialScore = Math.max(0, 100 - switchingCost.financial / 10000);
    const timeScore = Math.max(0, 100 - switchingCost.time * 2);
    const socialScore = Math.max(0, 100 - switchingCost.social);
    const identityScore = Math.max(0, 100 - switchingCost.identity);
    const opportunityScore = Math.max(0, 100 - switchingCost.opportunity / 5000);

    // Time to reverse factor
    const timeToReverseScore = Math.max(0, 100 - timeToReverse * 2);

    // Weighted combination
    const score =
      financialScore * 0.25 +
      timeScore * 0.2 +
      socialScore * 0.15 +
      identityScore * 0.15 +
      opportunityScore * 0.15 +
      timeToReverseScore * 0.1;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Classify reversibility type
   */
  private classifyReversibilityType(score: number): ReversibilityType {
    if (score >= 70) return 'TYPE_3'; // Easy to reverse
    if (score >= 40) return 'TYPE_2'; // Moderate
    return 'TYPE_1'; // Hard to reverse
  }

  /**
   * Classify reversibility category
   */
  private classifyReversibilityCategory(score: number): ReversibilityCategory {
    if (score >= 80) return 'HIGHLY_REVERSIBLE';
    if (score >= 65) return 'MOSTLY_REVERSIBLE';
    if (score >= 45) return 'PARTIALLY_REVERSIBLE';
    if (score >= 25) return 'MOSTLY_IRREVERSIBLE';
    return 'IRREVERSIBLE';
  }

  /**
   * Generate explanation
   */
  private generateExplanation(
    score: number,
    type: ReversibilityType,
    category: ReversibilityCategory,
    switchingCost: SwitchingCost
  ): string {
    const typeExplanations: Record<ReversibilityType, string> = {
      TYPE_1: 'This is a Type 1 decision—difficult to reverse once made. Proceed with careful consideration.',
      TYPE_2: 'This is a Type 2 decision—reversible with moderate effort. You have some flexibility.',
      TYPE_3: 'This is a Type 3 decision—easily reversible if needed. Low commitment risk.',
    };

    let explanation = typeExplanations[type];

    // Add cost details
    if (switchingCost.total > 100000) {
      explanation += ` Switching would cost approximately ₹${Math.round(switchingCost.total / 1000)}k.`;
    }

    if (switchingCost.time > 12) {
      explanation += ` Expect ${Math.round(switchingCost.time / 12)} years to fully transition.`;
    }

    return explanation;
  }

  /**
   * Get comparable decisions for context
   */
  private getComparableDecisions(category: ReversibilityCategory): string[] {
    const comparables: Record<ReversibilityCategory, string[]> = {
      HIGHLY_REVERSIBLE: ['Taking a single course', 'Trying an internship', 'Attending a workshop'],
      MOSTLY_REVERSIBLE: ['Choosing a college elective', 'Joining a club', 'Taking a gap semester'],
      PARTIALLY_REVERSIBLE: ['Changing majors', 'Switching jobs', 'Moving cities'],
      MOSTLY_IRREVERSIBLE: ['Dropping out', 'Major career change at mid-level', 'Immigration decisions'],
      IRREVERSIBLE: ['Permanent relocation', 'Irreversible medical procedures', 'Major financial commitments'],
    };

    return comparables[category];
  }

  /**
   * Compare reversibility across options
   */
  compareReversibility(
    input: DecisionInput,
    options: DecisionOption[]
  ): Array<{ option: DecisionOption; reversibility: DecisionReversibility }> {
    return options.map((option) => ({
      option,
      reversibility: this.assessReversibility(input, option),
    }));
  }

  /**
   * Get most reversible option
   */
  getMostReversibleOption(
    input: DecisionInput,
    options: DecisionOption[]
  ): { option: DecisionOption; reversibility: DecisionReversibility } | null {
    if (options.length === 0) return null;

    const comparisons = this.compareReversibility(input, options);

    return comparisons.reduce((best, current) =>
      current.reversibility.score > best.reversibility.score ? current : best
    );
  }

  /**
   * Quick reversibility check
   */
  quickReversibilityCheck(
    timeCommitment: number,
    financialCost: number,
    specialization: boolean
  ): { score: number; type: ReversibilityType; category: ReversibilityCategory } {
    // Simplified scoring
    let score = 100;

    // Penalize long commitments
    score -= timeCommitment * 0.5;

    // Penalize high financial cost
    score -= financialCost / 5000;

    // Penalize specialization
    if (specialization) score -= 20;

    score = Math.max(0, Math.min(100, score));

    const type = this.classifyReversibilityType(score);
    const category = this.classifyReversibilityCategory(score);

    return { score: Math.round(score), type, category };
  }
}

/**
 * Factory function for creating reversibility engine
 */
export function createReversibilityEngine(): ReversibilityEngine {
  return new ReversibilityEngine();
}

/**
 * Quick reversibility analysis
 */
export function analyzeQuickReversibility(
  timeCommitment: number,
  financialCost: number,
  specialization: boolean
): {
  score: number;
  type: ReversibilityType;
  category: ReversibilityCategory;
  explanation: string;
} {
  const engine = createReversibilityEngine();
  const result = engine.quickReversibilityCheck(timeCommitment, financialCost, specialization);

  const explanations: Record<ReversibilityType, string> = {
    TYPE_1: 'Hard to reverse. Commit carefully.',
    TYPE_2: 'Moderately reversible. Some flexibility available.',
    TYPE_3: 'Easily reversible. Low commitment risk.',
  };

  return {
    ...result,
    explanation: explanations[result.type],
  };
}

/**
 * Calculate switching cost estimate
 */
export function estimateSwitchingCost(
  currentInvestment: number,
  timeInvested: number,
  specialization: boolean
): number {
  let cost = currentInvestment * 0.5; // Sunk cost factor
  cost += timeInvested * 1000; // Time value
  if (specialization) cost += 50000;
  return cost;
}
