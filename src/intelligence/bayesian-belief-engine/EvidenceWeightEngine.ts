/**
 * CareerOS Bayesian Belief Updating Engine - Evidence Weight Engine
 *
 * Assigns different weights to evidence based on source and type.
 */

import type {
  EvidenceEvent,
  EvidenceWeight,
  BayesianBeliefConfig,
} from './types';

/**
 * Calculates weights for evidence events.
 */
export class EvidenceWeightEngine {
  private config: BayesianBeliefConfig;

  constructor(config: BayesianBeliefConfig) {
    this.config = config;
  }

  /**
   * Calculate weight for a single evidence event.
   */
  calculateWeight(evidence: EvidenceEvent): EvidenceWeight {
    const baseWeight = this.getBaseWeight(evidence.type);
    const reliability = this.getSourceReliability(evidence.source.type);
    
    // Calculate multipliers
    const durationMultiplier = this.calculateDurationMultiplier(evidence);
    const consistencyMultiplier = this.calculateConsistencyMultiplier(evidence);
    const validationMultiplier = this.calculateValidationMultiplier(evidence);

    // Calculate final weight
    const finalWeight = this.computeFinalWeight(
      baseWeight,
      reliability,
      durationMultiplier,
      consistencyMultiplier,
      validationMultiplier
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      evidence,
      baseWeight,
      reliability,
      finalWeight
    );

    return {
      evidenceType: evidence.type,
      sourceType: evidence.source.type,
      baseWeight,
      multipliers: {
        duration: durationMultiplier,
        consistency: consistencyMultiplier,
        externalValidation: validationMultiplier,
      },
      finalWeight,
      explanation,
    };
  }

  /**
   * Calculate weights for multiple evidence events.
   */
  calculateWeights(evidence: EvidenceEvent[]): EvidenceWeight[] {
    return evidence.map((e) => this.calculateWeight(e));
  }

  /**
   * Get base weight for evidence type.
   */
  private getBaseWeight(type: EvidenceEvent['type']): number {
    return this.config.evidenceWeights[type] || 0.5;
  }

  /**
   * Get source reliability multiplier.
   */
  private getSourceReliability(
    sourceType: EvidenceEvent['source']['type']
  ): number {
    return this.config.sourceReliability[sourceType] || 0.5;
  }

  /**
   * Calculate duration multiplier.
   * Longer duration = higher weight.
   */
  private calculateDurationMultiplier(evidence: EvidenceEvent): number {
    const metadata = evidence.data.metadata;
    
    // Check for duration in metadata
    if (metadata?.duration) {
      const duration = metadata.duration as number; // in days
      
      if (duration > 180) return 1.3; // 6+ months
      if (duration > 90) return 1.2; // 3+ months
      if (duration > 30) return 1.1; // 1+ month
      if (duration > 7) return 1.0; // 1+ week
      return 0.9; // Short duration
    }

    // Default based on evidence type
    switch (evidence.type) {
      case 'internship':
        return 1.2;
      case 'project':
        return 1.1;
      case 'careerExperiment':
        return 1.2;
      case 'behavior':
        return 1.0;
      default:
        return 1.0;
    }
  }

  /**
   * Calculate consistency multiplier.
   * Consistent patterns = higher weight.
   */
  private calculateConsistencyMultiplier(evidence: EvidenceEvent): number {
    const metadata = evidence.data.metadata;
    
    if (metadata?.consistency) {
      return metadata.consistency as number;
    }

    // Check for repeated behavior
    if (metadata?.frequency) {
      const frequency = metadata.frequency as number;
      
      if (frequency > 10) return 1.3;
      if (frequency > 5) return 1.2;
      if (frequency > 2) return 1.1;
      return 1.0;
    }

    return 1.0;
  }

  /**
   * Calculate external validation multiplier.
   * External validation = higher weight.
   */
  private calculateValidationMultiplier(evidence: EvidenceEvent): number {
    const metadata = evidence.data.metadata;
    
    if (metadata?.externalValidation) {
      return 1.2;
    }

    if (metadata?.certified) {
      return 1.15;
    }

    if (metadata?.verified) {
      return 1.1;
    }

    // Evidence type based
    switch (evidence.type) {
      case 'certification':
        return 1.2;
      case 'competition':
        return 1.15;
      case 'internship':
        return 1.1;
      case 'academicPerformance':
        return 1.1;
      default:
        return 1.0;
    }
  }

  /**
   * Compute final weight.
   */
  private computeFinalWeight(
    baseWeight: number,
    reliability: number,
    duration: number,
    consistency: number,
    validation: number
  ): number {
    // Combine all factors
    let weight = baseWeight * reliability;
    weight *= duration;
    weight *= consistency;
    weight *= validation;

    // Cap at 1.0
    return Math.min(1.0, weight);
  }

  /**
   * Generate weight explanation.
   */
  private generateExplanation(
    evidence: EvidenceEvent,
    baseWeight: number,
    reliability: number,
    finalWeight: number
  ): string {
    const parts: string[] = [];

    // Base weight description
    if (baseWeight >= 0.7) {
      parts.push(`High base weight (${Math.round(baseWeight * 100)}%) for ${evidence.type}`);
    } else if (baseWeight >= 0.4) {
      parts.push(`Moderate base weight (${Math.round(baseWeight * 100)}%) for ${evidence.type}`);
    } else {
      parts.push(`Lower base weight (${Math.round(baseWeight * 100)}%) for ${evidence.type}`);
    }

    // Source reliability
    if (reliability >= 0.8) {
      parts.push('observed/verified source');
    } else if (reliability <= 0.5) {
      parts.push('self-reported source (lower reliability)');
    }

    // Final assessment
    if (finalWeight >= 0.7) {
      parts.push('→ High confidence evidence');
    } else if (finalWeight >= 0.4) {
      parts.push('→ Moderate confidence evidence');
    } else {
      parts.push('→ Lower confidence evidence');
    }

    return parts.join(', ');
  }

  /**
   * Compare weights of two evidence events.
   */
  compareWeights(
    evidence1: EvidenceEvent,
    evidence2: EvidenceEvent
  ): {
    stronger: EvidenceEvent;
    weaker: EvidenceEvent;
    difference: number;
    reason: string;
  } {
    const weight1 = this.calculateWeight(evidence1);
    const weight2 = this.calculateWeight(evidence2);

    const stronger = weight1.finalWeight > weight2.finalWeight ? evidence1 : evidence2;
    const weaker = weight1.finalWeight > weight2.finalWeight ? evidence2 : evidence1;
    const difference = Math.abs(weight1.finalWeight - weight2.finalWeight);

    const reason =
      weight1.finalWeight > weight2.finalWeight
        ? weight1.explanation
        : weight2.explanation;

    return {
      stronger,
      weaker,
      difference,
      reason,
    };
  }

  /**
   * Get weight category.
   */
  getWeightCategory(weight: number): 'veryLow' | 'low' | 'moderate' | 'high' | 'veryHigh' {
    if (weight < 0.2) return 'veryLow';
    if (weight < 0.4) return 'low';
    if (weight < 0.6) return 'moderate';
    if (weight < 0.8) return 'high';
    return 'veryHigh';
  }
}

/**
 * Factory function for EvidenceWeightEngine.
 */
export function createEvidenceWeightEngine(
  config: BayesianBeliefConfig
): EvidenceWeightEngine {
  return new EvidenceWeightEngine(config);
}
