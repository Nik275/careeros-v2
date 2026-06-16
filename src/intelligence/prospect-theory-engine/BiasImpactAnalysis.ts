/**
 * CareerOS Prospect Theory & Cognitive Bias Engine - Bias Impact Analysis
 *
 * Determines how much each bias influences the decision.
 */

import type {
  BiasSignal,
  BiasImpact,
  BiasType,
  BiasSeverity,
  DecisionDistortion,
  DistortionScore,
  ProspectTheoryConfig,
  BiasDetectionInput,
} from './types';

/**
 * Analyzes the impact of biases on decisions.
 */
export class BiasImpactAnalysis {
  private config: ProspectTheoryConfig;

  constructor(config: ProspectTheoryConfig) {
    this.config = config;
  }

  /**
   * Calculate impact of all detected biases.
   */
  calculateImpacts(
    signals: BiasSignal[],
    context?: BiasDetectionInput
  ): BiasImpact[] {
    const impacts: BiasImpact[] = [];

    // Group signals by bias type
    const signalsByType = this.groupSignalsByType(signals);

    // Calculate impact for each bias type
    for (const [biasType, typeSignals] of signalsByType) {
      const impact = this.calculateBiasImpact(
        biasType as BiasType,
        typeSignals,
        context
      );
      impacts.push(impact);
    }

    // Sort by impact
    impacts.sort((a, b) => b.impact - a.impact);

    return impacts;
  }

  /**
   * Calculate decision distortion.
   */
  calculateDistortion(
    impacts: BiasImpact[],
    rationalChoice: string,
    actualChoice: string
  ): DecisionDistortion {
    // Calculate overall distortion score
    const overallScore = this.calculateOverallDistortion(impacts);

    // Determine level
    const level = this.getDistortionLevel(overallScore);

    // Rank biases by impact
    const rankedBiases = [...impacts].sort((a, b) => b.impact - a.impact);

    // Calculate deviation
    const deviation = this.calculateDeviation(rationalChoice, actualChoice, impacts);

    return {
      decisionId: `decision-${Date.now()}`,
      overallScore,
      level,
      contributingBiases: impacts.filter((i) => i.impact > 30),
      rankedBiases,
      rationalComparison: {
        rationalChoice,
        actualChoice,
        deviation,
      },
    };
  }

  /**
   * Get distortion score for a specific bias.
   */
  getBiasDistortion(biasType: BiasType, signals: BiasSignal[]): DistortionScore {
    const relevantSignals = signals.filter((s) => s.biasType === biasType);

    if (relevantSignals.length === 0) return 0;

    const avgStrength =
      relevantSignals.reduce((sum, s) => sum + s.strength, 0) /
      relevantSignals.length;

    // Scale to 0-100
    return Math.round(avgStrength * 100);
  }

  /**
   * Group signals by bias type.
   */
  private groupSignalsByType(signals: BiasSignal[]): Map<string, BiasSignal[]> {
    const grouped = new Map<string, BiasSignal[]>();

    for (const signal of signals) {
      const existing = grouped.get(signal.biasType) || [];
      existing.push(signal);
      grouped.set(signal.biasType, existing);
    }

    return grouped;
  }

  /**
   * Calculate impact for a specific bias.
   */
  private calculateBiasImpact(
    biasType: BiasType,
    signals: BiasSignal[],
    context?: BiasDetectionInput
  ): BiasImpact {
    // Calculate base impact from signal strength
    const avgStrength =
      signals.reduce((sum, s) => sum + s.strength, 0) / signals.length;

    // Count signals
    const signalCount = signals.length;

    // More signals = higher impact (diminishing returns)
    const countFactor = Math.min(1 + signalCount * 0.1, 1.5);
    // Calculate final impact
    const impact = Math.round(avgStrength * countFactor * 100);

    // Determine manifestation
    const manifestation = this.describeManifestation(biasType, signals);

    // Determine affected aspects
    const affectedAspects = this.identifyAffectedAspects(biasType, signals);

    // Determine direction
    const direction = this.determineDirection(biasType, signals);

    // Determine severity
    const severity = this.getSeverity(impact);

    return {
      biasType,
      impact,
      manifestation,
      affectedAspects,
      direction,
      severity,
    };
  }

  /**
   * Describe how a bias manifests.
   */
  private describeManifestation(biasType: BiasType, signals: BiasSignal[]): string {
    const descriptions: Record<BiasType, string> = {
      lossAversion: 'Tendency to avoid options with perceived downside risk',
      statusSeeking: 'Preference for careers with high prestige or social standing',
      socialConformity: 'Influence of peer preferences on career choices',
      authorityInfluence: 'Strong alignment with parent or authority figure expectations',
      riskPerceptionBias: 'Gap between actual and perceived risk levels',
      optimismBias: 'Overestimation of positive outcomes and career success',
      sunkCostSensitivity: 'Consideration of past investments in future decisions',
      availabilityBias: 'Overweighting of readily available information',
      anchoringBias: 'Over-reliance on initial information received',
      confirmationBias: 'Seeking information that confirms existing beliefs',
    };

    return descriptions[biasType] || 'Unknown bias manifestation';
  }

  /**
   * Identify affected aspects of decision.
   */
  private identifyAffectedAspects(biasType: BiasType, signals: BiasSignal[]): string[] {
    const aspects: string[] = [];

    // Analyze signal contexts
    for (const signal of signals) {
      if (signal.context.careerId) {
        aspects.push(`career_preference_${signal.context.careerId}`);
      }
      if (signal.context.decisionId) {
        aspects.push(`decision_${signal.context.decisionId}`);
      }
      if (signal.context.situation) {
        aspects.push(signal.context.situation);
      }
    }

    // Add bias-specific aspects
    const biasAspects: Record<BiasType, string[]> = {
      lossAversion: ['risk_assessment', 'career_selection'],
      statusSeeking: ['career_ranking', 'prestige_evaluation'],
      socialConformity: ['peer_influence', 'social_validation'],
      authorityInfluence: ['family_expectations', 'parent_alignment'],
      riskPerceptionBias: ['risk_evaluation', 'uncertainty_assessment'],
      optimismBias: ['outcome_expectations', 'success_probability'],
      sunkCostSensitivity: ['commitment_decisions', 'path_dependency'],
      availabilityBias: ['information_recall', 'example_weighting'],
      anchoringBias: ['initial_impressions', 'reference_points'],
      confirmationBias: ['evidence_seeking', 'belief_reinforcement'],
    };

    const specificAspects = biasAspects[biasType] || [];
    aspects.push(...specificAspects);

    // Remove duplicates
    return [...new Set(aspects)];
  }

  /**
   * Determine direction of bias influence.
   */
  private determineDirection(
    biasType: BiasType,
    signals: BiasSignal[]
  ): BiasImpact['direction'] {
    // Analyze signals to determine direction
    const supportCount = signals.filter((s) => s.evidence.description.includes('prefer') || s.strength > 0.5).length;
    const opposeCount = signals.length - supportCount;

    if (supportCount > opposeCount) {
      return 'increases_attractiveness';
    } else if (opposeCount > supportCount) {
      return 'decreases_attractiveness';
    }

    // Default based on bias type
    const defaultDirections: Record<BiasType, BiasImpact['direction']> = {
      lossAversion: 'decreases_attractiveness',
      statusSeeking: 'increases_attractiveness',
      socialConformity: 'distorts_perception',
      authorityInfluence: 'distorts_perception',
      riskPerceptionBias: 'distorts_perception',
      optimismBias: 'increases_attractiveness',
      sunkCostSensitivity: 'increases_attractiveness',
      availabilityBias: 'distorts_perception',
      anchoringBias: 'distorts_perception',
      confirmationBias: 'distorts_perception',
    };

    return defaultDirections[biasType] || 'distorts_perception';
  }

  /**
   * Get severity level from impact.
   */
  private getSeverity(impact: number): BiasSeverity {
    if (impact >= 80) return 'extreme';
    if (impact >= 60) return 'strong';
    if (impact >= 40) return 'moderate';
    if (impact >= 20) return 'mild';
    return 'minimal';
  }

  /**
   * Calculate overall distortion score.
   */
  private calculateOverallDistortion(impacts: BiasImpact[]): DistortionScore {
    if (impacts.length === 0) return 0;

    // Weight by severity
    const weights: Record<BiasSeverity, number> = {
      minimal: 0.2,
      mild: 0.4,
      moderate: 0.6,
      strong: 0.8,
      extreme: 1.0,
    };

    const weightedSum = impacts.reduce((sum, i) => sum + i.impact * weights[i.severity], 0);
    const totalWeight = impacts.reduce((sum, i) => sum + weights[i.severity], 0);

    return Math.round(weightedSum / Math.max(totalWeight, 1));
  }

  /**
   * Get distortion level from score.
   */
  private getDistortionLevel(score: DistortionScore): DecisionDistortion['level'] {
    if (score >= 80) return 'extreme';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  /**
   * Calculate deviation from rational choice.
   */
  private calculateDeviation(
    rationalChoice: string,
    actualChoice: string,
    impacts: BiasImpact[]
  ): number {
    if (rationalChoice === actualChoice) return 0;

    // Calculate based on impact of distorting biases
    const distortingImpacts = impacts.filter(
      (i) => i.impact > 30
    );

    const avgImpact =
      distortingImpacts.reduce((sum, i) => sum + i.impact, 0) /
      Math.max(distortingImpacts.length, 1);

    return Math.round(avgImpact);
  }

  /**
   * Generate impact summary.
   */
  generateSummary(impacts: BiasImpact[]): string {
    if (impacts.length === 0) {
      return 'No significant bias impacts detected.';
    }

    const topImpact = impacts[0];
    const otherSignificant = impacts.filter((i) => i.impact > 30).slice(1, 3);

    let summary = `Primary bias influence: ${topImpact.biasType} (${topImpact.impact}%)`;

    if (otherSignificant.length > 0) {
      summary += `. Also influenced by: ${otherSignificant.map((i) => i.biasType).join(', ')}`;
    }

    return summary;
  }
}

/**
 * Factory function for BiasImpactAnalysis.
 */
export function createBiasImpactAnalysis(
  config: ProspectTheoryConfig
): BiasImpactAnalysis {
  return new BiasImpactAnalysis(config);
}
