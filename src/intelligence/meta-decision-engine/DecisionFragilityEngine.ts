/**
 * CareerOS Meta-Decision Intelligence Engine - Decision Fragility Engine
 *
 * Detects how sensitive recommendations are to new information.
 */

import type {
  DecisionFragilityAnalysis,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';

/**
 * Detects decision fragility.
 */
export class DecisionFragilityEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze decision fragility.
   */
  analyze(
    input: MetaDecisionInput,
    recommendation: string
  ): DecisionFragilityAnalysis {
    // Calculate sensitivity scores
    const informationSensitivity = this.calculateInformationSensitivity(input);
    const valueSensitivity = this.calculateValueSensitivity(input);
    const marketSensitivity = this.calculateMarketSensitivity(input);

    // Calculate overall fragility
    const fragilityScore = this.calculateFragilityScore(
      informationSensitivity,
      valueSensitivity,
      marketSensitivity
    );

    // Determine fragility level
    const fragilityLevel = this.determineFragilityLevel(fragilityScore);

    // Identify key uncertainties
    const keyUncertainties = this.identifyKeyUncertainties(input);

    // Generate explanation
    const explanation = this.generateExplanation(
      fragilityScore,
      fragilityLevel,
      keyUncertainties
    );

    return {
      fragilityScore,
      fragilityLevel,
      informationSensitivity,
      valueSensitivity,
      marketSensitivity,
      keyUncertainties,
      explanation,
    };
  }

  /**
   * Calculate sensitivity to new information.
   */
  private calculateInformationSensitivity(
    input: MetaDecisionInput
  ): DecisionFragilityAnalysis['informationSensitivity'] {
    // Higher sensitivity when information is incomplete
    const incompleteness =
      100 -
      (input.informationCompleteness.careerData +
        input.informationCompleteness.personalFit +
        input.informationCompleteness.marketData +
        input.informationCompleteness.outcomeData) /
        4;

    // Identify high impact areas
    const highImpactAreas: string[] = [];

    if (input.informationCompleteness.careerData < 50) {
      highImpactAreas.push('career details');
    }
    if (input.informationCompleteness.personalFit < 50) {
      highImpactAreas.push('personal fit data');
    }
    if (input.informationCompleteness.marketData < 50) {
      highImpactAreas.push('market information');
    }
    if (input.informationCompleteness.outcomeData < 50) {
      highImpactAreas.push('outcome data');
    }

    return {
      score: Math.round(incompleteness),
      highImpactAreas,
    };
  }

  /**
   * Calculate sensitivity to value changes.
   */
  private calculateValueSensitivity(
    input: MetaDecisionInput
  ): DecisionFragilityAnalysis['valueSensitivity'] {
    // Higher sensitivity when values are unstable
    const instability =
      100 - (input.studentBeliefs.valueStability + input.studentBeliefs.identityStability) / 2;

    // Identify unstable values
    const unstableValues: string[] = [];

    if (input.studentBeliefs.valueStability < 60) {
      unstableValues.push('core values');
    }
    if (input.studentBeliefs.identityStability < 60) {
      unstableValues.push('identity');
    }
    if (input.studentBeliefs.understandingLevel < 60) {
      unstableValues.push('self-understanding');
    }

    return {
      score: Math.round(instability),
      unstableValues,
    };
  }

  /**
   * Calculate sensitivity to market changes.
   */
  private calculateMarketSensitivity(
    input: MetaDecisionInput
  ): DecisionFragilityAnalysis['marketSensitivity'] {
    // Higher sensitivity when market info is uncertain
    const score = Math.round(100 - input.informationCompleteness.marketData);

    // Identify vulnerable areas
    const vulnerableAreas: string[] = [];

    if (input.informationCompleteness.marketData < 60) {
      vulnerableAreas.push('market demand');
    }
    if (input.uncertainty.unknownFactors.some((f) =>
      f.toLowerCase().includes('market') || f.toLowerCase().includes('job')
    )) {
      vulnerableAreas.push('employment prospects');
    }

    return {
      score,
      vulnerableAreas,
    };
  }

  /**
   * Calculate overall fragility score.
   */
  private calculateFragilityScore(
    informationSensitivity: DecisionFragilityAnalysis['informationSensitivity'],
    valueSensitivity: DecisionFragilityAnalysis['valueSensitivity'],
    marketSensitivity: DecisionFragilityAnalysis['marketSensitivity']
  ): number {
    // Weighted average
    return Math.round(
      informationSensitivity.score * 0.4 +
        valueSensitivity.score * 0.35 +
        marketSensitivity.score * 0.25
    );
  }

  /**
   * Determine fragility level.
   */
  private determineFragilityLevel(
    fragilityScore: number
  ): DecisionFragilityAnalysis['fragilityLevel'] {
    const thresholds = this.config.fragilityThresholds;

    if (fragilityScore >= thresholds.fragile) return 'volatile';
    if (fragilityScore >= thresholds.sensitive) return 'fragile';
    if (fragilityScore >= thresholds.stable) return 'sensitive';
    if (fragilityScore >= thresholds.robust) return 'stable';
    return 'robust';
  }

  /**
   * Identify key uncertainties.
   */
  private identifyKeyUncertainties(
    input: MetaDecisionInput
  ): DecisionFragilityAnalysis['keyUncertainties'] {
    const uncertainties: DecisionFragilityAnalysis['keyUncertainties'] = [];

    // Information gaps
    for (const gap of input.uncertainty.informationGaps.slice(0, 3)) {
      uncertainties.push({
        factor: gap,
        impact: 70,
        reducible: true,
      });
    }

    // Unknown factors
    for (const factor of input.uncertainty.unknownFactors.slice(0, 3)) {
      uncertainties.push({
        factor,
        impact: 60,
        reducible: factor.toLowerCase().includes('market') || factor.toLowerCase().includes('data'),
      });
    }

    // Bias factors
    for (const bias of input.biasProfile.dominantBiases.slice(0, 2)) {
      uncertainties.push({
        factor: `${bias} bias`,
        impact: 50,
        reducible: true,
      });
    }

    return uncertainties;
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    fragilityScore: number,
    fragilityLevel: DecisionFragilityAnalysis['fragilityLevel'],
    keyUncertainties: DecisionFragilityAnalysis['keyUncertainties']
  ): string[] {
    const explanation: string[] = [];

    // Overall fragility
    explanation.push(`Decision fragility: ${fragilityScore}% (${fragilityLevel})`);

    // Level-specific explanation
    const levelExplanations: Record<typeof fragilityLevel, string> = {
      robust:
        'Decision is robust - recommendation likely to remain stable despite new information.',
      stable:
        'Decision is relatively stable with minor sensitivity to changes.',
      sensitive:
        'Decision is sensitive to new information - monitor key factors closely.',
      fragile:
        'Decision is fragile - significant changes in key factors could alter recommendation.',
      volatile:
        'Decision is volatile - recommendation may change substantially with new information.',
    };
    explanation.push(levelExplanations[fragilityLevel]);

    // Key uncertainties
    if (keyUncertainties.length > 0) {
      const topFactors = keyUncertainties
        .slice(0, 3)
        .map((u) => u.factor)
        .join(', ');
      explanation.push(`Key uncertainties: ${topFactors}`);
    }

    // Reducible uncertainties
    const reducible = keyUncertainties.filter((u) => u.reducible);
    if (reducible.length > 0) {
      explanation.push(
        `${reducible.length} uncertainties are reducible through further research.`
      );
    }

    return explanation;
  }
}

/**
 * Factory function for DecisionFragilityEngine.
 */
export function createDecisionFragilityEngine(
  config: MetaDecisionConfig
): DecisionFragilityEngine {
  return new DecisionFragilityEngine(config);
}
