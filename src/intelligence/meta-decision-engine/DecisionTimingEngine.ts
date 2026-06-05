/**
 * CareerOS Meta-Decision Intelligence Engine - Decision Timing Engine
 *
 * Determines optimal decision timing.
 */

import type {
  DecisionTimingAnalysis,
  DecisionTiming,
  DecisionState,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';

/**
 * Determines optimal decision timing.
 */
export class DecisionTimingEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze decision timing.
   */
  analyze(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): DecisionTimingAnalysis {
    // Calculate urgency
    const urgency = this.calculateUrgency(input);

    // Calculate costs
    const delayCost = this.calculateDelayCost(input, readinessState);
    const decideNowCost = this.calculateDecideNowCost(input, quality);

    // Determine recommendation
    const recommendation = this.determineRecommendation(
      readinessState,
      quality,
      urgency,
      input,
      delayCost,
      decideNowCost
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(input, readinessState);

    // Get supporting factors
    const supportingFactors = this.getSupportingFactors(
      input,
      readinessState,
      quality,
      urgency
    );

    // Calculate timeline
    const timeline = this.calculateTimeline(input, readinessState, recommendation);

    // Generate explanation
    const explanation = this.generateExplanation(
      recommendation,
      readinessState,
      urgency,
      timeline
    );

    return {
      recommendation,
      confidence,
      urgency,
      delayCost,
      decideNowCost,
      supportingFactors,
      timeline,
      explanation,
    };
  }

  /**
   * Calculate urgency level.
   */
  private calculateUrgency(input: MetaDecisionInput): number {
    let urgency = 30; // Base urgency

    // Adjust based on time pressure
    const timePressureMap: Record<string, number> = {
      none: 0,
      low: 20,
      moderate: 40,
      high: 70,
    };
    urgency += timePressureMap[input.context?.timePressure || 'none'] || 0;

    // Higher urgency if information is complete
    if (input.informationCompleteness.careerData > 80) {
      urgency += 10;
    }

    // Lower urgency if high uncertainty
    if (input.uncertainty.overall > 60) {
      urgency -= 20;
    }

    return Math.max(0, Math.min(100, urgency));
  }

  /**
   * Calculate cost of delaying.
   */
  private calculateDelayCost(
    input: MetaDecisionInput,
    readinessState: DecisionState
  ): DecisionTimingAnalysis['delayCost'] {
    const baseCost =
      readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY'
        ? 30
        : 10;

    return {
      financial: Math.round(baseCost * 0.8),
      opportunity: Math.round(baseCost * 1.2),
      psychological: Math.round(baseCost * 0.5),
    };
  }

  /**
   * Calculate cost of deciding now.
   */
  private calculateDecideNowCost(
    input: MetaDecisionInput,
    quality: number
  ): DecisionTimingAnalysis['decideNowCost'] {
    return {
      regretRisk: Math.round(100 - quality),
      informationGap: input.uncertainty.overall,
      reversalDifficulty: Math.round((100 - input.informationCompleteness.careerData) * 0.7),
    };
  }

  /**
   * Determine recommendation.
   */
  private determineRecommendation(
    readinessState: DecisionState,
    quality: number,
    urgency: number,
    input: MetaDecisionInput,
    delayCost: DecisionTimingAnalysis['delayCost'],
    decideNowCost: DecisionTimingAnalysis['decideNowCost']
  ): DecisionTiming {
    // If high quality and ready, decide now
    if (quality >= 70 && (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY')) {
      return 'decide_now';
    }

    // If high urgency and decent quality, decide now despite lower readiness
    if (urgency >= 70 && quality >= 50) {
      return 'decide_now';
    }

    // If low information, explore
    if (input.informationCompleteness.careerData < 50) {
      return 'explore';
    }

    // If high bias, experiment
    if (input.biasProfile.overallBias > 60) {
      return 'experiment';
    }

    // If high uncertainty, gather evidence
    if (input.uncertainty.overall > 50) {
      return 'gather_evidence';
    }

    // If moderate readiness, gather more evidence
    if (readinessState === 'PARTIALLY_READY') {
      return 'gather_evidence';
    }

    // If still exploring
    if (readinessState === 'EXPLORING') {
      return 'explore';
    }

    // Default: delay if not ready
    if (readinessState === 'NOT_READY') {
      return 'delay';
    }

    return 'gather_evidence';
  }

  /**
   * Calculate confidence in timing recommendation.
   */
  private calculateConfidence(
    input: MetaDecisionInput,
    readinessState: DecisionState
  ): number {
    let confidence = 50;

    // Higher confidence with complete information
    confidence += input.informationCompleteness.careerData * 0.3;

    // Higher confidence with low uncertainty
    confidence += (100 - input.uncertainty.overall) * 0.2;

    // Clear state increases confidence
    if (
      readinessState === 'READY' ||
      readinessState === 'HIGH_CONFIDENCE_READY' ||
      readinessState === 'NOT_READY'
    ) {
      confidence += 15;
    }

    return Math.min(95, Math.round(confidence));
  }

  /**
   * Get supporting factors for each option.
   */
  private getSupportingFactors(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number,
    urgency: number
  ): DecisionTimingAnalysis['supportingFactors'] {
    const factors: DecisionTimingAnalysis['supportingFactors'] = {
      decideNow: [],
      delay: [],
      explore: [],
      experiment: [],
      gatherEvidence: [],
    };

    // Decide now factors
    if (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY') {
      factors.decideNow.push('Decision readiness is high');
    }
    if (quality >= 70) {
      factors.decideNow.push('Decision quality is good');
    }
    if (urgency >= 60) {
      factors.decideNow.push('Time pressure requires decision');
    }
    if (input.informationCompleteness.careerData >= 80) {
      factors.decideNow.push('Information is complete');
    }

    // Delay factors
    if (input.uncertainty.overall >= 60) {
      factors.delay.push('High uncertainty suggests more time needed');
    }
    if (quality < 50) {
      factors.delay.push('Decision quality is low');
    }

    // Explore factors
    if (input.informationCompleteness.careerData < 60) {
      factors.explore.push('Career options not fully explored');
    }
    if (input.decisionIntelligence.alternatives.length < 3) {
      factors.explore.push('Few alternatives considered');
    }

    // Experiment factors
    if (input.biasProfile.overallBias >= 50) {
      factors.experiment.push('High bias levels need validation');
    }
    if (input.studentBeliefs.identityStability < 50) {
      factors.experiment.push('Identity still developing');
    }

    // Gather evidence factors
    if (input.uncertainty.unknownFactors.length > 3) {
      factors.gatherEvidence.push('Many unknown factors remain');
    }
    if (input.informationCompleteness.marketData < 50) {
      factors.gatherEvidence.push('Market information incomplete');
    }
    if (input.informationCompleteness.outcomeData < 50) {
      factors.gatherEvidence.push('Outcome data incomplete');
    }

    return factors;
  }

  /**
   * Calculate timeline recommendation.
   */
  private calculateTimeline(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    recommendation: DecisionTiming
  ): DecisionTimingAnalysis['timeline'] {
    const baseDays =
      {
        NOT_READY: 60,
        EXPLORING: 45,
        PARTIALLY_READY: 30,
        READY: 7,
        HIGH_CONFIDENCE_READY: 0,
      }[readinessState] || 30;

    const minDelay = Math.max(0, baseDays - 14);
    const optimalDelay = baseDays;
    const maxDelay = baseDays + 30;

    // Adjust based on recommendation
    if (recommendation === 'decide_now') {
      return { minimumDelay: 0, optimalDelay: 0, maximumDelay: 7 };
    }
    if (recommendation === 'explore') {
      return { minimumDelay: 30, optimalDelay: 60, maximumDelay: 90 };
    }
    if (recommendation === 'experiment') {
      return { minimumDelay: 14, optimalDelay: 30, maximumDelay: 60 };
    }

    return { minimumDelay: minDelay, optimalDelay, maximumDelay };
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    recommendation: DecisionTiming,
    readinessState: DecisionState,
    urgency: number,
    timeline: DecisionTimingAnalysis['timeline']
  ): string[] {
    const explanation: string[] = [];

    // Recommendation explanation
    const recommendationText: Record<DecisionTiming, string> = {
      decide_now: 'CareerOS recommends deciding now based on current readiness and quality.',
      delay: 'CareerOS recommends delaying the decision to gather more information.',
      explore: 'CareerOS recommends exploring more career options before committing.',
      experiment: 'CareerOS recommends running career experiments to validate preferences.',
      gather_evidence: 'CareerOS recommends gathering additional evidence to reduce uncertainty.',
    };

    explanation.push(recommendationText[recommendation]);

    // Urgency context
    if (urgency >= 60) {
      explanation.push(`Urgency level is ${urgency}% - time pressure influences this recommendation.`);
    }

    // Timeline
    if (timeline.optimalDelay > 0) {
      explanation.push(`Recommended timeline: ${timeline.minimumDelay}-${timeline.maximumDelay} days.`);
    }

    // Readiness context
    explanation.push(`Current readiness state: ${readinessState.replace(/_/g, ' ').toLowerCase()}.`);

    return explanation;
  }
}

/**
 * Factory function for DecisionTimingEngine.
 */
export function createDecisionTimingEngine(
  config: MetaDecisionConfig
): DecisionTimingEngine {
  return new DecisionTimingEngine(config);
}
