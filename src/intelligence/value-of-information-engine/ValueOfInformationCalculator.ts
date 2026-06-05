/**
 * CareerOS Value of Information Engine - Value of Information Calculator
 *
 * Estimates decision quality improvement from additional information:
 * - Decision quality improvement
 * - Confidence improvement
 * - Utility improvement
 */

import type {
  InformationGap,
  ValueOfInformationCalculation,
  ValueOfInformationEngineConfig,
} from './types';

import type {
  UncertaintyProfile,
} from '../uncertainty-engine';

import type {
  OptimalDecisionSet,
} from '../decision-optimization-engine';

/**
 * Calculates the value of information for decision improvement.
 */
export class ValueOfInformationCalculator {
  private config: ValueOfInformationEngineConfig;

  constructor(config: ValueOfInformationEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate VoI for all gaps.
   */
  calculate(
    gaps: InformationGap[],
    uncertaintyProfile: UncertaintyProfile,
    decisionResults: OptimalDecisionSet
  ): ValueOfInformationCalculation[] {
    const calculations: ValueOfInformationCalculation[] = [];

    for (const gap of gaps) {
      const calculation = this.calculateForGap(gap, uncertaintyProfile, decisionResults);
      calculations.push(calculation);
    }

    return calculations;
  }

  /**
   * Calculate VoI for a specific information gap.
   */
  calculateForGap(
    gap: InformationGap,
    uncertaintyProfile: UncertaintyProfile,
    decisionResults: OptimalDecisionSet
  ): ValueOfInformationCalculation {
    // Current decision state
    const currentConfidence = decisionResults.confidence?.overall || 0.5;
    const currentUtility = decisionResults.bestOverall?.expectedUtility?.score || 50;

    // Expected confidence with information
    const confidenceImprovement = this.calculateConfidenceImprovement(gap, uncertaintyProfile);
    const expectedConfidence = Math.min(currentConfidence + confidenceImprovement, 1);

    // Expected utility improvement
    const utilityImprovement = this.calculateUtilityImprovement(gap, decisionResults);
    const expectedUtility = currentUtility + utilityImprovement * 100;

    // Decision quality improvement
    const decisionImprovement = this.calculateDecisionImprovement(
      gap,
      currentConfidence,
      expectedConfidence,
      currentUtility,
      expectedUtility
    );

    // Probability of changing decision
    const probabilityOfChange = this.calculateProbabilityOfChange(gap, uncertaintyProfile);

    // Value of perfect information (upper bound)
    const valueOfPerfectInformation = this.calculateVOPI(gap, decisionResults);

    // Value of sample information (expected)
    const valueOfSampleInformation = this.calculateVOSI(
      gap,
      valueOfPerfectInformation,
      probabilityOfChange
    );

    // Expected value of information
    const evi = valueOfSampleInformation * probabilityOfChange;

    // Net value (EVI minus cost)
    const cost = this.estimateInformationCost(gap);
    const netValue = evi - cost;

    return {
      gapId: gap.id,
      currentConfidence,
      expectedConfidence,
      confidenceImprovement,
      currentUtility,
      expectedUtility,
      utilityImprovement,
      decisionImprovement,
      probabilityOfChange,
      valueOfPerfectInformation,
      valueOfSampleInformation,
      evi,
      netValue,
    };
  }

  /**
   * Calculate expected confidence improvement.
   */
  private calculateConfidenceImprovement(
    gap: InformationGap,
    uncertaintyProfile: UncertaintyProfile
  ): number {
    // Base confidence improvement from gap's potential reduction
    const baseImprovement = gap.potentialReduction;

    // Scale by current uncertainty
    const currentUncertainty = gap.currentUncertainty;

    // Scale by evidence quality factor
    const evidenceQuality = uncertaintyProfile.evidenceQuality / 100;

    // Calculate expected improvement
    const improvement = baseImprovement * currentUncertainty * (0.5 + 0.5 * evidenceQuality);

    // Cap at reasonable maximum
    return Math.min(improvement, 0.4);
  }

  /**
   * Calculate expected utility improvement.
   */
  private calculateUtilityImprovement(
    gap: InformationGap,
    decisionResults: OptimalDecisionSet
  ): number {
    // Get current best and runner-up
    const bestOption = decisionResults.bestOverall;
    const runnerUp = decisionResults.rankedOptions?.[1];

    if (!bestOption || !runnerUp) {
      return 0;
    }

    const bestUtility = bestOption.expectedUtility?.score || 0;
    const runnerUpUtility = runnerUp.expectedUtility?.score || 0;

    // If there's a clear winner, less utility to gain
    const utilityGap = bestUtility - runnerUpUtility;
    const isClearWinner = utilityGap > 10;

    // Information is more valuable when decisions are close
    const decisionClosenessFactor = isClearWinner ? 0.2 : 1.0;

    // Utility improvement potential
    const utilityImprovement = gap.decisionImpact * gap.potentialReduction * decisionClosenessFactor;

    return utilityImprovement;
  }

  /**
   * Calculate decision quality improvement.
   */
  private calculateDecisionImprovement(
    gap: InformationGap,
    currentConfidence: number,
    expectedConfidence: number,
    currentUtility: number,
    expectedUtility: number
  ): number {
    // Decision quality is a combination of confidence and utility
    const confidenceContribution = (expectedConfidence - currentConfidence) * 0.4;
    const utilityContribution = ((expectedUtility - currentUtility) / 100) * 0.6;

    // Scale by gap's decision impact
    const decisionImprovement = (confidenceContribution + utilityContribution) * gap.decisionImpact;

    return Math.max(0, decisionImprovement);
  }

  /**
   * Calculate probability that information would change the decision.
   */
  private calculateProbabilityOfChange(
    gap: InformationGap,
    uncertaintyProfile: UncertaintyProfile
  ): number {
    // Base probability from uncertainty
    const baseProbability = gap.currentUncertainty;

    // Scale by decision impact (high impact = more likely to change decision)
    const impactFactor = gap.decisionImpact;

    // Scale by information value
    const informationFactor = gap.informationValue;

    // Calculate probability
    const probability = baseProbability * impactFactor * (0.5 + 0.5 * informationFactor);

    // Cap at reasonable maximum
    return Math.min(probability, 0.8);
  }

  /**
   * Calculate Value of Perfect Information (VOPI).
   *
   * VOPI = Expected utility with perfect information - Expected utility with current information
   */
  private calculateVOPI(
    gap: InformationGap,
    decisionResults: OptimalDecisionSet
  ): number {
    // Get current expected utility
    const currentExpectedUtility = decisionResults.bestOverall?.expectedUtility?.score || 50;

    // Estimate utility with perfect information
    // This is bounded by the gap's potential to improve decisions
    const maxUtilityGain = gap.decisionImpact * gap.potentialReduction * 100;

    // VOPI is bounded
    const vopi = Math.min(maxUtilityGain, 30);

    return vopi;
  }

  /**
   * Calculate Value of Sample Information (VOSI).
   *
   * VOSI = VOPI × Reliability of information source
   */
  private calculateVOSI(
    gap: InformationGap,
    vopi: number,
    probabilityOfChange: number
  ): number {
    // Sample information is less valuable than perfect information
    // Scale by probability of actually changing the decision
    const reliabilityFactor = 0.7; // Typical reliability of assessments/experiments
    const vosI = vopi * reliabilityFactor * probabilityOfChange;

    return vosI;
  }

  /**
   * Estimate the cost of acquiring information.
   */
  private estimateInformationCost(gap: InformationGap): number {
    // Cost is in utility units (0-100 scale)
    // Different categories have different typical costs

    const categoryCosts: Record<string, number> = {
      interest: 5,
      aptitude: 10,
      values: 8,
      skills: 15,
      market: 12,
      identity: 10,
      constraints: 8,
      outcomes: 15,
    };

    const baseCost = categoryCosts[gap.category] || 10;

    // Scale by potential reduction (more reduction = more effort = more cost)
    const effortFactor = gap.potentialReduction;

    return baseCost * effortFactor;
  }

  /**
   * Calculate expected value of information for an opportunity.
   */
  calculateOpportunityEVI(
    addressesGaps: InformationGap[],
    uncertaintyProfile: UncertaintyProfile,
    decisionResults: OptimalDecisionSet
  ): {
    informationValue: number;
    confidenceGain: number;
    utilityImprovement: number;
    decisionImprovement: number;
  } {
    if (addressesGaps.length === 0) {
      return {
        informationValue: 0,
        confidenceGain: 0,
        utilityImprovement: 0,
        decisionImprovement: 0,
      };
    }

    // Calculate aggregate metrics across all addressed gaps
    const calculations = addressesGaps.map((gap) =>
      this.calculateForGap(gap, uncertaintyProfile, decisionResults)
    );

    // Average confidence gain
    const avgConfidenceGain =
      calculations.reduce((sum, c) => sum + c.confidenceImprovement, 0) /
      calculations.length;

    // Average utility improvement
    const avgUtilityImprovement =
      calculations.reduce((sum, c) => sum + c.utilityImprovement, 0) /
      calculations.length;

    // Average decision improvement
    const avgDecisionImprovement =
      calculations.reduce((sum, c) => sum + c.decisionImprovement, 0) /
      calculations.length;

    // Combined information value
    const informationValue =
      avgConfidenceGain * 0.3 +
      avgUtilityImprovement * 0.4 +
      avgDecisionImprovement * 0.3;

    return {
      informationValue,
      confidenceGain: avgConfidenceGain,
      utilityImprovement: avgUtilityImprovement,
      decisionImprovement: avgDecisionImprovement,
    };
  }

  /**
   * Calculate the cumulative value of a sequence of information activities.
   */
  calculateSequenceValue(
    activities: Array<{ gaps: InformationGap[]; cost: number }>,
    uncertaintyProfile: UncertaintyProfile,
    decisionResults: OptimalDecisionSet
  ): Array<{
    step: number;
    cumulativeConfidence: number;
    cumulativeUtility: number;
    netValue: number;
  }> {
    const results: Array<{
      step: number;
      cumulativeConfidence: number;
      cumulativeUtility: number;
      netValue: number;
    }> = [];

    let cumulativeConfidence = decisionResults.confidence?.overall || 0.5;
    let cumulativeUtility = decisionResults.bestOverall?.expectedUtility?.score || 50;
    let totalCost = 0;

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      totalCost += activity.cost;

      const evi = this.calculateOpportunityEVI(
        activity.gaps,
        uncertaintyProfile,
        decisionResults
      );

      cumulativeConfidence = Math.min(
        cumulativeConfidence + evi.confidenceGain,
        this.config.targetConfidence
      );
      cumulativeUtility += evi.utilityImprovement * 100;

      const netValue = evi.informationValue * 100 - totalCost;

      results.push({
        step: i + 1,
        cumulativeConfidence,
        cumulativeUtility,
        netValue,
      });
    }

    return results;
  }
}

/**
 * Factory function for ValueOfInformationCalculator.
 */
export function createValueOfInformationCalculator(
  config: ValueOfInformationEngineConfig
): ValueOfInformationCalculator {
  return new ValueOfInformationCalculator(config);
}
