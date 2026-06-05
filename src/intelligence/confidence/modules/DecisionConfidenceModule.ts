/**
 * CareerOS Decision Confidence Module
 * 
 * Domain-specific confidence module for recommendation/decision calculations.
 * Delegates ALL calculations to ConfidenceAuthority.
 * 
 * @module confidence/modules/decision
 * @version 1.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() directly
 */

import type {
  Confidence,
  ConfidenceValue,
} from '../ConfidenceTypes';
import { ConfidenceAuthority, getConfidenceAuthority } from '../ConfidenceAuthority';

// ============================================================================
// MODULE INTERFACE
// ============================================================================

export interface DecisionConfidenceInput {
  /** Decision context */
  readonly decision: {
    readonly type: 'recommendation' | 'choice' | 'comparison';
    readonly options: string[];
    readonly selectedOption?: string;
    readonly context: Record<string, unknown>;
  };
  
  /** Supporting data */
  readonly data: {
    readonly profileConfidence: Confidence;
    readonly careerConfidence: Confidence;
    readonly recommendationConfidence: Confidence;
    readonly evidenceConfidence: Confidence;
  };
  
  /** Evidence items */
  readonly evidence?: Array<{
    readonly type: string;
    readonly source: string;
    readonly quality: Confidence;
    readonly timestamp: number;
  }>;
}

export interface DecisionConfidenceResult {
  readonly confidence: ConfidenceValue;
  readonly decisionConfidence: number;
  readonly certaintyFactors: {
    readonly profileCertainty: number;
    readonly careerCertainty: number;
    readonly recommendationCertainty: number;
    readonly evidenceCertainty: number;
  };
}

// ============================================================================
// DECISION CONFIDENCE MODULE
// ============================================================================

/**
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'decision' or 'career-recommendation'
 * 
 * This module exists for backward compatibility only.
 * All calculations are delegated to ConfidenceAuthority.
 */
export class DecisionConfidenceModule {
  private authority: ConfidenceAuthority;

  constructor(authority?: ConfidenceAuthority) {
    this.authority = authority ?? getConfidenceAuthority();
  }

  /**
   * Calculate confidence for a decision/recommendation.
   * 
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  async calculateConfidence(
    input: DecisionConfidenceInput
  ): Promise<DecisionConfidenceResult> {
    console.warn(
      '[DEPRECATED] DecisionConfidenceModule.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "decision" or "career-recommendation"'
    );

    const predictionType = input.decision.type === 'recommendation'
      ? 'career-recommendation'
      : 'decision';

    // Call Confidence Authority
    const confidenceResult = await this.authority.calculateConfidence({
      requestId: `decision-${Date.now()}`,
      requestingSystem: 'DecisionConfidenceModule',
      predictionType,
      prediction: {
        decisionType: input.decision.type,
        options: input.decision.options,
        selectedOption: input.decision.selectedOption,
      },
      evidence: (input.evidence ?? []).map(e => ({
        type: e.type,
        source: e.source,
        quality: e.quality,
        timestamp: e.timestamp,
      })),
      context: {
        timestamp: Date.now(),
        metadata: {
          profileConfidence: input.data.profileConfidence,
          careerConfidence: input.data.careerConfidence,
          recommendationConfidence: input.data.recommendationConfidence,
          evidenceConfidence: input.data.evidenceConfidence,
        },
      },
    });

    // Calculate decision confidence (domain metric)
    const decisionConfidence = this.calculateDecisionConfidence(input.data);

    return {
      confidence: confidenceResult,
      decisionConfidence,
      certaintyFactors: {
        profileCertainty: input.data.profileConfidence,
        careerCertainty: input.data.careerConfidence,
        recommendationCertainty: input.data.recommendationConfidence,
        evidenceCertainty: input.data.evidenceConfidence,
      },
    };
  }

  /**
   * Calculate decision confidence from data certainties.
   * 
   * NOTE: This is domain logic combining input confidences.
   */
  private calculateDecisionConfidence(
    data: DecisionConfidenceInput['data']
  ): number {
    // Weighted combination of input confidences
    const weights = {
      profile: 0.30,
      career: 0.25,
      recommendation: 0.25,
      evidence: 0.20,
    };

    return (
      data.profileConfidence * weights.profile +
      data.careerConfidence * weights.career +
      data.recommendationConfidence * weights.recommendation +
      data.evidenceConfidence * weights.evidence
    );
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalModule: DecisionConfidenceModule | null = null;

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export function getDecisionConfidenceModule(): DecisionConfidenceModule {
  console.warn(
    '[DEPRECATED] getDecisionConfidenceModule() is deprecated. ' +
    'Use getConfidenceAuthority()'
  );
  
  if (!globalModule) {
    globalModule = new DecisionConfidenceModule();
  }
  return globalModule;
}

export function resetDecisionConfidenceModule(): void {
  globalModule = null;
}
