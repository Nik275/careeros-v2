/**
 * CareerOS Meta-Decision Intelligence Engine - Meta Decision Narrative Engine
 *
 * Generates human-readable explanations for meta-decision analysis.
 */

import type {
  MetaDecisionAnalysis,
  DecisionTiming,
  DecisionState,
  DecisionQualityLevel,
} from './types';

/**
 * Generates narratives for meta-decision analysis.
 */
export class MetaDecisionNarrativeEngine {
  /**
   * Generate complete narrative for meta-decision analysis.
   */
  generateNarrative(analysis: MetaDecisionAnalysis): MetaDecisionAnalysis['narrative'] {
    const summary = this.generateSummary(analysis);
    const qualityExplanation = this.generateQualityExplanation(analysis);
    const readinessExplanation = this.generateReadinessExplanation(analysis);
    const recommendationExplanation = this.generateRecommendationExplanation(analysis);

    return {
      summary,
      qualityExplanation,
      readinessExplanation,
      recommendationExplanation,
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(analysis: MetaDecisionAnalysis): string {
    const { readiness, quality, timing } = analysis;

    const stateText = readiness.state.replace(/_/g, ' ').toLowerCase();
    const qualityText = quality.qualityLevel.replace('_', ' ');
    const actionText = timing.recommendation.replace(/_/g, ' ');

    return `Decision is ${stateText} with ${qualityText} quality. CareerOS recommends: ${actionText}.`;
  }

  /**
   * Generate quality explanation.
   */
  private generateQualityExplanation(analysis: MetaDecisionAnalysis): string[] {
    const { quality } = analysis;
    const explanations: string[] = [];

    // Overall quality
    explanations.push(`Decision quality is ${quality.qualityLevel.replace('_', ' ')} (${quality.overallQuality}%).`);

    // Component breakdown
    const components: { name: string; score: number; threshold: number }[] = [
      { name: 'Information quality', score: quality.components.informationQuality, threshold: 70 },
      { name: 'Reasoning quality', score: quality.components.reasoningQuality, threshold: 70 },
      { name: 'Evidence quality', score: quality.components.evidenceQuality, threshold: 70 },
    ];

    for (const component of components) {
      if (component.score < component.threshold) {
        explanations.push(`${component.name} is ${component.score}% - below optimal threshold.`);
      } else {
        explanations.push(`${component.name} is strong at ${component.score}%.`);
      }
    }

    // Concerns
    if (quality.components.biasInfluence >= 50) {
      explanations.push(`Significant bias influence (${quality.components.biasInfluence}%) detected.`);
    }

    if (quality.components.uncertainty >= 50) {
      explanations.push(`High uncertainty (${quality.components.uncertainty}%) affects decision quality.`);
    }

    return explanations;
  }

  /**
   * Generate readiness explanation.
   */
  private generateReadinessExplanation(analysis: MetaDecisionAnalysis): string[] {
    const { readiness } = analysis;
    const explanations: string[] = [];

    // State
    explanations.push(`Decision readiness: ${readiness.readinessScore}% (${readiness.state.replace(/_/g, ' ').toLowerCase()}).`);

    // Strong areas
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    const componentMap: Record<string, number> = {
      'Student understanding': readiness.components.studentUnderstanding,
      'Identity stability': readiness.components.identityStability,
      'Value stability': readiness.components.valueStability,
      'Utility confidence': readiness.components.utilityConfidence,
      'Information completeness': readiness.components.informationCompleteness,
      'Market confidence': readiness.components.marketConfidence,
      'Future simulation confidence': readiness.components.futureSimulationConfidence,
    };

    for (const [name, score] of Object.entries(componentMap)) {
      if (score >= 70) {
        strongAreas.push(name.toLowerCase());
      } else if (score < 50) {
        weakAreas.push(name.toLowerCase());
      }
    }

    if (strongAreas.length > 0) {
      explanations.push(`Strong areas: ${strongAreas.join(', ')}.`);
    }

    if (weakAreas.length > 0) {
      explanations.push(`Areas needing development: ${weakAreas.join(', ')}.`);
    }

    // Uncertainty
    if (readiness.uncertaintyLevel >= 50) {
      explanations.push(`Uncertainty level is ${readiness.uncertaintyLevel}% - gathering more information may help.`);
    }

    return explanations;
  }

  /**
   * Generate recommendation explanation.
   */
  private generateRecommendationExplanation(analysis: MetaDecisionAnalysis): string[] {
    const { timing, fragility, robustness, commitment, recommendedAction } = analysis;
    const explanations: string[] = [];

    // Primary recommendation
    explanations.push(`CareerOS recommends: ${timing.recommendation.replace(/_/g, ' ')}.`);

    // Why this recommendation
    const reasonTexts: Record<DecisionTiming, string> = {
      decide_now: 'Current readiness and quality levels support making a decision.',
      delay: 'Additional time will allow for better information gathering.',
      explore: 'More exploration of options is needed before commitment.',
      experiment: 'Testing preferences through experiments will validate the decision.',
      gather_evidence: 'Collecting more evidence will reduce uncertainty.',
    };

    explanations.push(reasonTexts[timing.recommendation]);

    // Timeline
    if (timing.timeline.optimalDelay > 0) {
      explanations.push(`Suggested timeline: ${timing.timeline.minimumDelay}-${timing.timeline.maximumDelay} days.`);
    }

    // Fragility context
    if (fragility.fragilityScore >= 60) {
      explanations.push(`Note: Decision is ${fragility.fragilityLevel} - new information may change the recommendation.`);
    }

    // Robustness context
    if (robustness.robustnessScore >= 70) {
      explanations.push(`Recommendation is ${robustness.robustnessLevel.replace('_', ' ')} across scenarios.`);
    }

    // Commitment context
    if (commitment.isAppropriate) {
      explanations.push('Commitment is appropriate based on current assessment.');
    } else {
      explanations.push('Commitment is not yet recommended - address areas of concern first.');
    }

    // Steps
    if (recommendedAction.steps.length > 0) {
      explanations.push(`Next steps: ${recommendedAction.steps.slice(0, 3).join('; ')}.`);
    }

    return explanations;
  }

  /**
   * Generate state-specific narrative.
   */
  generateStateNarrative(state: DecisionState, readinessScore: number): string {
    const narratives: Record<DecisionState, string> = {
      [DecisionState.NOT_READY]:
        'Decision is not yet ready. Significant exploration and information gathering needed.',
      [DecisionState.EXPLORING]:
        'Currently in exploration phase. Continue investigating options while building self-awareness.',
      [DecisionState.PARTIALLY_READY]:
        'Decision is partially ready. Some areas are strong but others need attention.',
      [DecisionState.READY]:
        'Decision is ready. Current information supports making a choice.',
      [DecisionState.HIGH_CONFIDENCE_READY]:
        'Decision is ready with high confidence. Strong foundation across all dimensions.',
    };

    return narratives[state] || 'Decision state unclear - additional assessment needed.';
  }

  /**
   * Generate quality-specific narrative.
   */
  generateQualityNarrative(qualityLevel: DecisionQualityLevel): string {
    const narratives: Record<DecisionQualityLevel, string> = {
      very_low:
        'Decision quality is very low. Significant improvements needed before proceeding.',
      low: 'Decision quality is low. Review information and reasoning before deciding.',
      moderate:
        'Decision quality is moderate. Adequate for preliminary decisions but could be strengthened.',
      good: 'Decision quality is good. Well-supported by available information.',
      excellent:
        'Decision quality is excellent. Strong foundation across all dimensions.',
    };

    return narratives[qualityLevel];
  }

  /**
   * Generate timing-specific narrative.
   */
  generateTimingNarrative(timing: DecisionTiming): string {
    const narratives: Record<DecisionTiming, string> = {
      decide_now: 'Proceed with decision based on current information.',
      delay: 'Take additional time before committing to a path.',
      explore: 'Actively explore more career options.',
      experiment: 'Run career experiments to validate preferences.',
      gather_evidence: 'Focus on collecting relevant information.',
    };

    return narratives[timing];
  }
}

/**
 * Factory function for MetaDecisionNarrativeEngine.
 */
export function createMetaDecisionNarrativeEngine(): MetaDecisionNarrativeEngine {
  return new MetaDecisionNarrativeEngine();
}
