/**
 * CareerOS Meta-Decision Intelligence Engine - Commitment Readiness Engine
 *
 * Measures whether commitment is appropriate.
 */

import type {
  CommitmentReadinessAnalysis,
  DecisionState,
  MetaDecisionInput,
  MetaDecisionConfig,
} from './types';

/**
 * Measures commitment readiness.
 */
export class CommitmentReadinessEngine {
  private config: MetaDecisionConfig;

  constructor(config: MetaDecisionConfig) {
    this.config = config;
  }

  /**
   * Main entry point: analyze commitment readiness.
   */
  analyze(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): CommitmentReadinessAnalysis {
    // Calculate readiness score
    const readinessScore = this.calculateReadinessScore(input, readinessState, quality);

    // Determine if commitment is appropriate
    const isAppropriate = this.isCommitmentAppropriate(
      readinessScore,
      quality,
      input
    );

    // Calculate confidence
    const confidence = this.calculateConfidence(input);

    // Get supporting factors
    const supportingFactors = this.getSupportingFactors(input, readinessState, quality);

    // Get opposing factors
    const opposingFactors = this.getOpposingFactors(input, readinessState, quality);

    // Assess risks
    const risks = this.assessRisks(input);

    // Get prerequisites
    const prerequisites = this.getPrerequisites(input, readinessState);

    // Generate explanation
    const explanation = this.generateExplanation(
      isAppropriate,
      readinessScore,
      supportingFactors,
      opposingFactors,
      risks
    );

    return {
      isAppropriate,
      readinessScore,
      confidence,
      supportingFactors,
      opposingFactors,
      risks,
      prerequisites,
      explanation,
    };
  }

  /**
   * Calculate commitment readiness score.
   */
  private calculateReadinessScore(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): number {
    let score = 0;

    // Base from readiness state
    const stateMultipliers: Record<DecisionState, number> = {
      NOT_READY: 0.1,
      EXPLORING: 0.3,
      PARTIALLY_READY: 0.6,
      READY: 0.85,
      HIGH_CONFIDENCE_READY: 1.0,
    };
    score += stateMultipliers[readinessState] * 50;

    // Quality contribution
    score += quality * 0.3;

    // Information completeness
    score += input.informationCompleteness.careerData * 0.1;

    // Stability factors
    score += input.studentBeliefs.identityStability * 0.05;
    score += input.studentBeliefs.valueStability * 0.05;

    return Math.min(100, Math.round(score));
  }

  /**
   * Determine if commitment is appropriate.
   */
  private isCommitmentAppropriate(
    readinessScore: number,
    quality: number,
    input: MetaDecisionInput
  ): boolean {
    // Must meet minimum thresholds
    if (readinessScore < this.config.minCommitmentConfidence) {
      return false;
    }

    if (quality < 50) {
      return false;
    }

    if (input.biasProfile.overallBias > this.config.maxAcceptableBias) {
      return false;
    }

    if (input.uncertainty.overall > 60) {
      return false;
    }

    return true;
  }

  /**
   * Calculate confidence in assessment.
   */
  private calculateConfidence(input: MetaDecisionInput): number {
    let confidence = 50;

    // Higher with complete information
    confidence += input.informationCompleteness.careerData * 0.3;

    // Higher with low uncertainty
    confidence += (100 - input.uncertainty.overall) * 0.2;

    // Higher with stable beliefs
    confidence += input.studentBeliefs.identityStability * 0.15;
    confidence += input.studentBeliefs.valueStability * 0.15;

    return Math.min(95, Math.round(confidence));
  }

  /**
   * Get supporting factors for commitment.
   */
  private getSupportingFactors(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): string[] {
    const factors: string[] = [];

    if (readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY') {
      factors.push('High decision readiness');
    }

    if (quality >= 70) {
      factors.push('Good decision quality');
    }

    if (input.informationCompleteness.careerData >= 70) {
      factors.push('Complete career information');
    }

    if (input.utilityConfidence.overall >= 70) {
      factors.push('High utility confidence');
    }

    if (input.studentBeliefs.identityStability >= 60) {
      factors.push('Stable identity');
    }

    if (input.studentBeliefs.valueStability >= 60) {
      factors.push('Stable values');
    }

    if (input.uncertainty.overall <= 40) {
      factors.push('Low uncertainty');
    }

    if (input.biasProfile.overallBias <= 40) {
      factors.push('Low bias influence');
    }

    return factors;
  }

  /**
   * Get opposing factors for commitment.
   */
  private getOpposingFactors(
    input: MetaDecisionInput,
    readinessState: DecisionState,
    quality: number
  ): string[] {
    const factors: string[] = [];

    if (readinessState === 'NOT_READY' || readinessState === 'EXPLORING') {
      factors.push('Decision not yet ready');
    }

    if (quality < 50) {
      factors.push('Low decision quality');
    }

    if (input.uncertainty.overall >= 60) {
      factors.push('High uncertainty');
    }

    if (input.biasProfile.overallBias >= 60) {
      factors.push('Significant bias influence');
    }

    if (input.studentBeliefs.identityStability < 50) {
      factors.push('Identity still developing');
    }

    if (input.studentBeliefs.valueStability < 50) {
      factors.push('Values not yet stable');
    }

    if (input.informationCompleteness.careerData < 60) {
      factors.push('Incomplete career information');
    }

    return factors;
  }

  /**
   * Assess risks of commitment.
   */
  private assessRisks(input: MetaDecisionInput): CommitmentReadinessAnalysis['risks'] {
    return {
      reversalCost: Math.round(100 - input.informationCompleteness.careerData),
      regretProbability: Math.round(
        input.uncertainty.overall * 0.4 + input.biasProfile.overallBias * 0.3
      ),
      opportunityCost: Math.round(
        input.uncertainty.unknownFactors.length * 10
      ),
    };
  }

  /**
   * Get prerequisites for commitment.
   */
  private getPrerequisites(
    input: MetaDecisionInput,
    readinessState: DecisionState
  ): CommitmentReadinessAnalysis['prerequisites'] {
    return [
      {
        requirement: 'Decision readiness',
        satisfied:
          readinessState === 'READY' || readinessState === 'HIGH_CONFIDENCE_READY',
        importance: 'critical',
      },
      {
        requirement: 'Adequate information',
        satisfied: input.informationCompleteness.careerData >= 60,
        importance: 'critical',
      },
      {
        requirement: 'Stable identity',
        satisfied: input.studentBeliefs.identityStability >= 50,
        importance: 'important',
      },
      {
        requirement: 'Stable values',
        satisfied: input.studentBeliefs.valueStability >= 50,
        importance: 'important',
      },
      {
        requirement: 'Low uncertainty',
        satisfied: input.uncertainty.overall <= 50,
        importance: 'important',
      },
      {
        requirement: 'Minimal bias',
        satisfied: input.biasProfile.overallBias <= 50,
        importance: 'helpful',
      },
    ];
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    isAppropriate: boolean,
    readinessScore: number,
    supportingFactors: string[],
    opposingFactors: string[],
    risks: CommitmentReadinessAnalysis['risks']
  ): string[] {
    const explanation: string[] = [];

    if (isAppropriate) {
      explanation.push(`Commitment is appropriate (${readinessScore}% readiness).`);
    } else {
      explanation.push(`Commitment is not yet appropriate (${readinessScore}% readiness).`);
    }

    // Supporting factors
    if (supportingFactors.length > 0) {
      explanation.push(`Supporting factors: ${supportingFactors.slice(0, 3).join(', ')}.`);
    }

    // Opposing factors
    if (!isAppropriate && opposingFactors.length > 0) {
      explanation.push(`Areas of concern: ${opposingFactors.slice(0, 3).join(', ')}.`);
    }

    // Risk summary
    if (risks.regretProbability >= 50) {
      explanation.push(`High regret risk (${risks.regretProbability}%) - consider gathering more evidence.`);
    }

    return explanation;
  }
}

/**
 * Factory function for CommitmentReadinessEngine.
 */
export function createCommitmentReadinessEngine(
  config: MetaDecisionConfig
): CommitmentReadinessEngine {
  return new CommitmentReadinessEngine(config);
}
