/**
 * CareerOS Meta-Decision Intelligence Engine - Decision Readiness Engine
 *
 * Evaluates decision readiness across multiple dimensions.
 */

import type {
  DecisionReadinessAnalysis,
  DecisionTiming,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';
import { DecisionState } from './types';

/**
 * Evaluates decision readiness.
 */
export class DecisionReadinessEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze decision readiness.
   */
  analyze(input: MetaDecisionInput): DecisionReadinessAnalysis {
    // Calculate component scores
    const components = {
      studentUnderstanding: this.evaluateStudentUnderstanding(input),
      identityStability: this.evaluateIdentityStability(input),
      valueStability: this.evaluateValueStability(input),
      utilityConfidence: this.evaluateUtilityConfidence(input),
      informationCompleteness: this.evaluateInformationCompleteness(input),
      marketConfidence: this.evaluateMarketConfidence(input),
      futureSimulationConfidence: this.evaluateFutureSimulationConfidence(input),
    };

    // Calculate overall readiness score
    const readinessScore = this.calculateReadinessScore(components);

    // Determine decision state
    const state = this.determineDecisionState(readinessScore);

    // Calculate overall confidence
    const confidence = this.calculateConfidence(components);

    // Calculate decision quality
    const decisionQuality = this.calculateDecisionQuality(input, components);

    // Calculate uncertainty level
    const uncertaintyLevel = input.uncertainty.overall;

    // Determine recommendation
    const recommendation = this.determineRecommendation(
      state,
      readinessScore,
      uncertaintyLevel,
      input
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      components,
      readinessScore,
      state,
      recommendation
    );

    return {
      readinessScore,
      state,
      confidence,
      decisionQuality,
      uncertaintyLevel,
      recommendation,
      explanation,
      components,
    };
  }

  /**
   * Evaluate student understanding.
   */
  private evaluateStudentUnderstanding(input: MetaDecisionInput): number {
    // Based on student beliefs understanding level
    let score = input.studentBeliefs.understandingLevel;

    // Adjust based on information completeness
    const infoBonus = input.informationCompleteness.personalFit * 0.1;
    score += infoBonus;

    return Math.min(100, score);
  }

  /**
   * Evaluate identity stability.
   */
  private evaluateIdentityStability(input: MetaDecisionInput): number {
    return input.studentBeliefs.identityStability;
  }

  /**
   * Evaluate value stability.
   */
  private evaluateValueStability(input: MetaDecisionInput): number {
    return input.studentBeliefs.valueStability;
  }

  /**
   * Evaluate utility confidence.
   */
  private evaluateUtilityConfidence(input: MetaDecisionInput): number {
    return input.utilityConfidence.overall;
  }

  /**
   * Evaluate information completeness.
   */
  private evaluateInformationCompleteness(input: MetaDecisionInput): number {
    const { careerData, personalFit, marketData, outcomeData } =
      input.informationCompleteness;

    // Weighted average
    return Math.round(
      careerData * 0.25 +
        personalFit * 0.3 +
        marketData * 0.25 +
        outcomeData * 0.2
    );
  }

  /**
   * Evaluate market confidence.
   */
  private evaluateMarketConfidence(input: MetaDecisionInput): number {
    return input.informationCompleteness.marketData;
  }

  /**
   * Evaluate future simulation confidence.
   */
  private evaluateFutureSimulationConfidence(input: MetaDecisionInput): number {
    // Based on uncertainty - lower uncertainty = higher confidence
    return Math.max(0, 100 - input.uncertainty.overall);
  }

  /**
   * Calculate overall readiness score.
   */
  private calculateReadinessScore(
    components: DecisionReadinessAnalysis['components']
  ): number {
    const weights = this.config.readinessWeights;

    return Math.round(
      components.studentUnderstanding * weights.studentUnderstanding +
        components.identityStability * weights.identityStability +
        components.valueStability * weights.valueStability +
        components.utilityConfidence * weights.utilityConfidence +
        components.informationCompleteness * weights.informationCompleteness +
        components.marketConfidence * weights.marketConfidence +
        components.futureSimulationConfidence * weights.futureSimulationConfidence
    );
  }

  /**
   * Determine decision state from readiness score.
   */
  private determineDecisionState(score: number): DecisionState {
    const thresholds = this.config.readinessThresholds;

    if (score >= thresholds.highConfidenceReady) {
      return DecisionState.HIGH_CONFIDENCE_READY;
    }
    if (score >= thresholds.ready) {
      return DecisionState.READY;
    }
    if (score >= thresholds.partiallyReady) {
      return DecisionState.PARTIALLY_READY;
    }
    if (score >= thresholds.exploring) {
      return DecisionState.EXPLORING;
    }
    return DecisionState.NOT_READY;
  }

  /**
   * Calculate confidence in readiness assessment.
   */
  private calculateConfidence(
    components: DecisionReadinessAnalysis['components']
  ): number {
    // Higher when components are consistent
    const values = Object.values(components);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

    // Lower variance = higher confidence
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

    return Math.round(Math.max(0, 100 - variance / 10));
  }

  /**
   * Calculate decision quality.
   */
  private calculateDecisionQuality(
    input: MetaDecisionInput,
    components: DecisionReadinessAnalysis['components']
  ): number {
    // Quality is reduced by high bias and high uncertainty
    const baseQuality =
      (components.studentUnderstanding +
        components.informationCompleteness +
        components.utilityConfidence) /
      3;

    const biasPenalty = input.biasProfile.overallBias * 0.3;
    const uncertaintyPenalty = input.uncertainty.overall * 0.2;

    return Math.max(0, Math.round(baseQuality - biasPenalty - uncertaintyPenalty));
  }

  /**
   * Determine recommendation based on state and inputs.
   */
  private determineRecommendation(
    state: DecisionState,
    readinessScore: number,
    uncertaintyLevel: number,
    input: MetaDecisionInput
  ): DecisionTiming {
    // High uncertainty suggests gathering evidence
    if (uncertaintyLevel > 60) {
      return 'gather_evidence';
    }

    // Low information completeness suggests exploring
    if (input.informationCompleteness.careerData < 50) {
      return 'explore';
    }

    // High bias suggests experimenting
    if (input.biasProfile.overallBias > 60) {
      return 'experiment';
    }

    // Based on state
    switch (state) {
      case DecisionState.HIGH_CONFIDENCE_READY:
      case DecisionState.READY:
        return 'decide_now';
      case DecisionState.PARTIALLY_READY:
        return uncertaintyLevel > 40 ? 'gather_evidence' : 'decide_now';
      case DecisionState.EXPLORING:
        return 'explore';
      case DecisionState.NOT_READY:
      default:
        return input.informationCompleteness.careerData < 40 ? 'explore' : 'gather_evidence';
    }
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    components: DecisionReadinessAnalysis['components'],
    readinessScore: number,
    state: DecisionState,
    recommendation: DecisionTiming
  ): string[] {
    const explanation: string[] = [];

    // Overall readiness
    explanation.push(`Decision readiness: ${readinessScore}% (${state.replace(/_/g, ' ').toLowerCase()})`);

    // Strong components
    const strongComponents = Object.entries(components)
      .filter(([, score]) => score >= 70)
      .map(([name]) => name);

    if (strongComponents.length > 0) {
      explanation.push(`Strengths: ${strongComponents.join(', ').replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }

    // Weak components
    const weakComponents = Object.entries(components)
      .filter(([, score]) => score < 50)
      .map(([name]) => name);

    if (weakComponents.length > 0) {
      explanation.push(`Areas for improvement: ${weakComponents.join(', ').replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }

    // Recommendation explanation
    const recommendationText: Record<DecisionTiming, string> = {
      decide_now: 'Ready to make a decision with confidence.',
      delay: 'Consider delaying until more information is available.',
      explore: 'Explore more career options before deciding.',
      experiment: 'Run career experiments to validate preferences.',
      gather_evidence: 'Gather more evidence to reduce uncertainty.',
    };

    explanation.push(recommendationText[recommendation]);

    return explanation;
  }
}

/**
 * Factory function for DecisionReadinessEngine.
 */
export function createDecisionReadinessEngine(
  config: MetaDecisionConfig
): DecisionReadinessEngine {
  return new DecisionReadinessEngine(config);
}
