/**
 * CareerOS Value of Information Engine - VoI Explanation Engine
 *
 * Generates explanations for Value of Information recommendations.
 */

import type {
  InformationGap,
  InformationOpportunity,
  ExperimentRecommendation,
  VoIExplanation,
  ValueOfInformationEngineConfig,
} from './types';

import type {
  OptimalDecisionSet,
} from '../decision-optimization-engine';

/**
 * Generates explanations for VoI recommendations.
 */
export class VoIExplanationEngine {
  private config: ValueOfInformationEngineConfig;

  constructor(config: ValueOfInformationEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: generate complete explanation.
   */
  explain(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null,
    decisionResults: OptimalDecisionSet
  ): VoIExplanation {
    const summary = this.generateSummary(gaps, opportunities, topExperiment);
    const detailedExplanation = this.generateDetailedExplanation(
      gaps,
      opportunities,
      topExperiment
    );
    const valueJustification = this.generateValueJustification(gaps, opportunities);
    const comparisonToAlternatives = this.generateComparisons(opportunities, topExperiment);
    const expectedImpact = this.generateExpectedImpact(
      gaps,
      opportunities,
      decisionResults
    );

    return {
      summary,
      detailedExplanation,
      valueJustification,
      comparisonToAlternatives,
      expectedImpact,
      confidence: this.calculateExplanationConfidence(gaps, opportunities),
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null
  ): string {
    const topOpportunity = opportunities[0];
    const criticalGaps = gaps.filter((g) => g.priority === 'critical');

    if (criticalGaps.length > 0) {
      const criticalGap = criticalGaps[0];
      if (topExperiment) {
        return `A ${topExperiment.name.toLowerCase()} would address your critical ${criticalGap.category} gap (${criticalGap.aspect}) and significantly improve decision confidence.`;
      }
      return `Critical information gaps in ${criticalGap.category} require immediate attention - consider ${topOpportunity?.activity || 'targeted information gathering'}.`;
    }

    if (topExperiment) {
      return `${topExperiment.name} is recommended because it provides more decision value than traditional assessments given your concentrated uncertainty in ${this.identifyTopGapCategory(gaps)}.`;
    }

    if (topOpportunity) {
      return `Focus on ${topOpportunity.activity.toLowerCase()} to address uncertainty in ${this.identifyTopGapCategory(gaps)}.`;
    }

    return 'Your information profile is sufficiently complete for confident decision-making.';
  }

  /**
   * Generate detailed explanation.
   */
  private generateDetailedExplanation(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null
  ): string {
    const parts: string[] = [];

    // Decision context
    parts.push(this.explainDecisionContext(gaps));

    // Information gap analysis
    parts.push(this.explainGapAnalysis(gaps));

    // Recommended approach
    if (opportunities.length > 0) {
      parts.push(this.explainRecommendedApproach(opportunities, topExperiment));
    }

    // Alternative considerations
    parts.push(this.explainAlternativeConsiderations(opportunities, topExperiment));

    return parts.join(' ');
  }

  /**
   * Explain the decision context.
   */
  private explainDecisionContext(gaps: InformationGap[]): string {
    const avgUncertainty =
      gaps.reduce((sum, g) => sum + g.currentUncertainty, 0) / Math.max(gaps.length, 1);
    const criticalCount = gaps.filter((g) => g.priority === 'critical').length;

    if (criticalCount > 0) {
      return `Your career decision currently has ${criticalCount} critical information gaps that significantly impact decision quality. These gaps create uncertainty about which path is truly optimal for you.`;
    }

    if (avgUncertainty > 0.6) {
      return `Your career decision has substantial uncertainty (${Math.round(avgUncertainty * 100)}% average gap uncertainty). Additional information could meaningfully improve decision quality.`;
    }

    return `Your career decision has moderate uncertainty. While you have good baseline information, targeted additional data could refine your decision.`;
  }

  /**
   * Explain gap analysis.
   */
  private explainGapAnalysis(gaps: InformationGap[]): string {
    const sortedGaps = [...gaps].sort(
      (a, b) => b.informationValue - a.informationValue
    );
    const topGaps = sortedGaps.slice(0, 3);

    if (topGaps.length === 0) {
      return '';
    }

    const gapDescriptions = topGaps.map((gap) => {
      const categoryLabel = this.capitalizeFirst(gap.category);
      return `${categoryLabel}: ${gap.aspect} (${Math.round(gap.informationValue * 100)}% value score)`;
    });

    return `The most valuable information to gather relates to: ${gapDescriptions.join('; ')}.`;
  }

  /**
   * Explain recommended approach.
   */
  private explainRecommendedApproach(
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null
  ): string {
    const parts: string[] = [];

    if (topExperiment) {
      parts.push(
        `The ${topExperiment.name.toLowerCase()} is prioritized because it ${this.explainExperimentAdvantage(topExperiment)}.`
      );
    }

    const topOpportunity = opportunities[0];
    if (topOpportunity && !topExperiment) {
      parts.push(
        `Start with ${topOpportunity.activity.toLowerCase()} to address your highest-priority gap.`
      );
    }

    if (opportunities.length > 1) {
      const quickWins = opportunities.filter(
        (o) => o.confidenceGain > 0.25 && o.acquisitionCost.effort === 'low'
      );
      if (quickWins.length > 0) {
        parts.push(
          `Quick wins include ${quickWins[0].activity.toLowerCase()} which offers significant confidence gain with minimal effort.`
        );
      }
    }

    return parts.join(' ');
  }

  /**
   * Explain experiment advantage.
   */
  private explainExperimentAdvantage(experiment: ExperimentRecommendation): string {
    const advantages: string[] = [];

    if (experiment.valueOfInformation > 0.75) {
      advantages.push('provides very high information value');
    } else if (experiment.valueOfInformation > 0.6) {
      advantages.push('provides substantial information value');
    }

    if (experiment.expectedOutcomes.confidenceGain > 0.4) {
      advantages.push('significantly improves decision confidence');
    }

    if (experiment.assesses.length > 4) {
      advantages.push(`assesses ${experiment.assesses.length} key capabilities`);
    }

    return advantages.join(' and ');
  }

  /**
   * Explain alternative considerations.
   */
  private explainAlternativeConsiderations(
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null
  ): string {
    if (opportunities.length < 2) {
      return '';
    }

    const alternatives = opportunities.slice(1, 3);

    if (alternatives.length === 0) {
      return '';
    }

    const alternativeText = alternatives
      .map((a) => `${a.activity.toLowerCase()} (${Math.round(a.informationValue * 100)}% value)`)
      .join(' or ');

    if (topExperiment) {
      return `If the ${topExperiment.name.toLowerCase()} is not feasible, consider ${alternativeText} as alternatives.`;
    }

    return `Alternative approaches include ${alternativeText}.`;
  }

  /**
   * Generate value justification.
   */
  private generateValueJustification(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[]
  ): string[] {
    const justifications: string[] = [];

    // Justify based on gap impact
    const topGap = gaps.sort((a, b) => b.informationValue - a.informationValue)[0];
    if (topGap) {
      justifications.push(
        `${this.capitalizeFirst(topGap.category)} uncertainty (${Math.round(
          topGap.currentUncertainty * 100
        )}%) directly affects decision quality.`
      );
    }

    // Justify based on opportunity efficiency
    const bestOpportunity = opportunities[0];
    if (bestOpportunity) {
      justifications.push(
        `${bestOpportunity.activity} offers ${Math.round(
          bestOpportunity.informationValue * 100
        )}% information value relative to acquisition cost.`
      );
    }

    // Justify based on decision stakes
    justifications.push(
      'Career decisions have long-term impact; information investment is justified by decision stakes.'
    );

    // Justify based on current confidence
    const avgUncertainty =
      gaps.reduce((sum, g) => sum + g.currentUncertainty, 0) / Math.max(gaps.length, 1);
    if (avgUncertainty > 0.5) {
      justifications.push(
        `Current uncertainty level (${Math.round(avgUncertainty * 100)}%) creates meaningful risk of suboptimal decision.`
      );
    }

    return justifications;
  }

  /**
   * Generate comparisons to alternatives.
   */
  private generateComparisons(
    opportunities: InformationOpportunity[],
    topExperiment: ExperimentRecommendation | null
  ): Array<{ activity: string; alternative: string; reasoning: string }> {
    const comparisons: Array<{ activity: string; alternative: string; reasoning: string }> = [];

    if (opportunities.length < 2) {
      return comparisons;
    }

    const topOpportunity = opportunities[0];

    // Compare top opportunity to next best
    if (opportunities.length >= 2) {
      const alternative = opportunities[1];
      comparisons.push({
        activity: topOpportunity.activity,
        alternative: alternative.activity,
        reasoning: this.generateComparisonReasoning(topOpportunity, alternative),
      });
    }

    // Compare to standard assessment if experiment is recommended
    if (topExperiment) {
      const assessmentOpportunity = opportunities.find((o) => o.method === 'assessment');
      if (assessmentOpportunity) {
        comparisons.push({
          activity: topExperiment.name,
          alternative: assessmentOpportunity.activity,
          reasoning:
            topExperiment.comparisonToAlternatives.vsAssessment ||
            'Provides real-world evidence rather than theoretical assessment',
        });
      }
    }

    return comparisons;
  }

  /**
   * Generate reasoning for why one opportunity is better than another.
   */
  private generateComparisonReasoning(
    better: InformationOpportunity,
    worse: InformationOpportunity
  ): string {
    const reasons: string[] = [];

    if (better.informationValue > worse.informationValue * 1.2) {
      reasons.push(`higher information value (${Math.round(better.informationValue * 100)}% vs ${Math.round(worse.informationValue * 100)}%)`);
    }

    if (better.acquisitionCost.effort === 'low' && worse.acquisitionCost.effort !== 'low') {
      reasons.push('lower acquisition effort');
    }

    if (better.confidenceGain > worse.confidenceGain * 1.2) {
      reasons.push(`higher confidence gain (${Math.round(better.confidenceGain * 100)}% vs ${Math.round(worse.confidenceGain * 100)}%)`);
    }

    if (reasons.length === 0) {
      return 'better alignment with specific information gaps';
    }

    return reasons.join(' and ');
  }

  /**
   * Generate expected impact description.
   */
  private generateExpectedImpact(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[],
    decisionResults: OptimalDecisionSet
  ): { confidence: string; utility: string; decision: string } {
    const topOpportunity = opportunities[0];
    const currentConfidence = decisionResults.confidence?.overall || 50;

    // Confidence impact
    const expectedConfidenceGain = topOpportunity
      ? topOpportunity.confidenceGain
      : gaps[0]?.potentialReduction || 0;
    const newConfidence = Math.min(currentConfidence + expectedConfidenceGain * 100, 95);

    const confidence = topOpportunity
      ? `${topOpportunity.activity} is expected to increase decision confidence from ${Math.round(
          currentConfidence
        )}% to ${Math.round(newConfidence)}%.`
      : `Targeted information gathering could increase confidence from ${Math.round(
          currentConfidence
        )}% to approximately ${Math.round(newConfidence)}%.`;

    // Utility impact
    const avgUtilityImprovement = topOpportunity
      ? topOpportunity.utilityImprovement
      : opportunities.reduce((sum, o) => sum + o.utilityImprovement, 0) /
        Math.max(opportunities.length, 1);

    const utility = avgUtilityImprovement > 0.1
      ? `Expected utility improvement of ${Math.round(avgUtilityImprovement * 100)}% from better-informed career matching.`
      : 'Modest utility improvement expected from marginal information gains.';

    // Decision impact
    const criticalGaps = gaps.filter((g) => g.priority === 'critical').length;
    let decision: string;

    if (criticalGaps > 0) {
      decision = `Resolving ${criticalGaps} critical gap${criticalGaps > 1 ? 's' : ''} will significantly improve decision quality and reduce risk of regret.`;
    } else if (avgUtilityImprovement > 0.1) {
      decision = 'Information will enable more precise career-path matching to your profile.';
    } else {
      decision = 'Additional information will confirm and refine your current direction.';
    }

    return { confidence, utility, decision };
  }

  /**
   * Calculate confidence in the explanation.
   */
  private calculateExplanationConfidence(
    gaps: InformationGap[],
    opportunities: InformationOpportunity[]
  ): number {
    if (gaps.length === 0 || opportunities.length === 0) {
      return 0.5;
    }

    // Base confidence on data quality
    const avgEvidence =
      gaps.reduce((sum, g) => sum + g.currentEvidence.length, 0) / gaps.length;
    const evidenceFactor = Math.min(avgEvidence / 5, 1);

    // Confidence in recommendations
    const recommendationClarity =
      opportunities[0].informationValue - (opportunities[1]?.informationValue || 0);
    const clarityFactor = Math.min(recommendationClarity * 2, 1);

    // Combined confidence
    return evidenceFactor * 0.4 + clarityFactor * 0.6;
  }

  /**
   * Identify top gap category by information value.
   */
  private identifyTopGapCategory(gaps: InformationGap[]): string {
    if (gaps.length === 0) return 'multiple areas';

    const categoryValues: Record<string, number> = {};
    for (const gap of gaps) {
      categoryValues[gap.category] =
        (categoryValues[gap.category] || 0) + gap.informationValue;
    }

    const topCategory = Object.entries(categoryValues).sort((a, b) => b[1] - a[1])[0]?.[0];

    return topCategory || 'multiple areas';
  }

  /**
   * Capitalize first letter.
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Factory function for VoIExplanationEngine.
 */
export function createVoIExplanationEngine(
  config: ValueOfInformationEngineConfig
): VoIExplanationEngine {
  return new VoIExplanationEngine(config);
}
