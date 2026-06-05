/**
 * CareerOS Bayesian Belief Updating Engine - Posterior Calculator
 *
 * Updates beliefs using Bayes' theorem:
 * P(H|E) = P(E|H) * P(H) / P(E)
 */

import type {
  BeliefNode,
  EvidenceEvent,
  BeliefUpdate,
  BayesianBeliefConfig,
  EvidenceWeight,
} from './types';

/**
 * Calculates posterior beliefs using Bayesian updating.
 */
export class PosteriorCalculator {
  private config: BayesianBeliefConfig;

  constructor(config: BayesianBeliefConfig) {
    this.config = config;
  }

  /**
   * Calculate posterior belief given prior and evidence.
   */
  calculatePosterior(
    prior: BeliefNode,
    evidence: EvidenceEvent,
    weight: EvidenceWeight
  ): BeliefUpdate {
    // Extract prior probability
    const priorProbability = prior.currentProbability;
    const priorConfidence = prior.confidence;

    // Calculate likelihood P(E|H)
    const likelihood = this.calculateLikelihood(evidence, weight);

    // Calculate P(E) - total probability of evidence
    const pEvidence = this.calculateEvidenceProbability(
      priorProbability,
      likelihood,
      evidence
    );

    // Apply Bayes' theorem
    const posteriorProbability =
      (likelihood * priorProbability) / pEvidence;

    // Clamp to valid range
    const clampedPosterior = Math.max(0.01, Math.min(0.99, posteriorProbability));

    // Update confidence
    const posteriorConfidence = this.updateConfidence(
      priorConfidence,
      weight,
      evidence
    );

    // Calculate change
    const probabilityDelta = clampedPosterior - priorProbability;
    const confidenceDelta = posteriorConfidence - priorConfidence;

    // Calculate Bayes factor
    const bayesFactor = likelihood / (1 - likelihood + 0.001);

    // Generate explanation
    const explanation = this.generateExplanation(
      prior,
      evidence,
      priorProbability,
      clampedPosterior,
      probabilityDelta,
      weight
    );

    return {
      id: this.generateUpdateId(),
      timestamp: Date.now(),
      studentId: prior.id.split('-')[0] || 'unknown',
      beliefId: prior.beliefId,
      priorBelief: {
        probability: priorProbability,
        confidence: priorConfidence,
      },
      evidence,
      posteriorBelief: {
        probability: clampedPosterior,
        confidence: posteriorConfidence,
      },
      change: {
        probabilityDelta,
        confidenceDelta,
      },
      explanation,
      calculation: {
        prior: priorProbability,
        likelihood,
        posterior: clampedPosterior,
        bayesFactor,
      },
    };
  }

  /**
   * Calculate likelihood P(E|H).
   * Probability of observing evidence given hypothesis is true.
   */
  private calculateLikelihood(
    evidence: EvidenceEvent,
    weight: EvidenceWeight
  ): number {
    // Base likelihood from evidence strength
    const baseLikelihood = evidence.supportsBelief
      ? evidence.strength
      : 1 - evidence.strength;

    // Adjust by evidence weight
    const adjustedLikelihood =
      baseLikelihood * weight.finalWeight +
      0.5 * (1 - weight.finalWeight);

    return Math.max(0.01, Math.min(0.99, adjustedLikelihood));
  }

  /**
   * Calculate P(E) - total probability of evidence.
   * P(E) = P(E|H) * P(H) + P(E|~H) * P(~H)
   */
  private calculateEvidenceProbability(
    prior: number,
    likelihood: number,
    evidence: EvidenceEvent
  ): number {
    // P(E|H) * P(H)
    const term1 = likelihood * prior;

    // P(E|~H) * P(~H)
    // If evidence supports belief, P(E|~H) is lower
    const pEvidenceGivenNotH = evidence.supportsBelief
      ? 0.3 // False positive rate
      : 0.7; // False negative rate
    const term2 = pEvidenceGivenNotH * (1 - prior);

    return term1 + term2;
  }

  /**
   * Update confidence based on evidence.
   */
  private updateConfidence(
    currentConfidence: number,
    weight: EvidenceWeight,
    evidence: EvidenceEvent
  ): number {
    // Confidence grows with evidence weight
    const growth = weight.finalWeight * this.config.confidenceGrowthRate;

    // More evidence = higher confidence cap
    const confidenceCap = Math.min(
      this.config.maxConfidence,
      0.5 + evidence.strength * 0.5
    );

    // Apply growth
    let newConfidence = currentConfidence + growth;

    // Apply cap
    newConfidence = Math.min(newConfidence, confidenceCap);

    return Math.min(this.config.maxConfidence, newConfidence);
  }

  /**
   * Calculate posterior for new belief (no prior).
   */
  calculateInitialBelief(
    beliefId: string,
    beliefType: BeliefNode['beliefType'],
    name: string,
    evidence: EvidenceEvent,
    weight: EvidenceWeight
  ): BeliefNode {
    // Start with default prior
    const prior = this.config.defaultPrior;

    // Calculate likelihood
    const likelihood = evidence.supportsBelief
      ? evidence.strength
      : 1 - evidence.strength;

    // Calculate posterior
    const posterior =
      (likelihood * prior) /
      (likelihood * prior + 0.5 * (1 - prior));

    // Initial confidence based on evidence
    const confidence = Math.min(
      this.config.maxConfidence * 0.7,
      weight.finalWeight * this.config.defaultConfidence * 2
    );

    return {
      id: this.generateBeliefId(beliefId),
      beliefType,
      beliefId,
      name,
      currentProbability: Math.max(0.01, Math.min(0.99, posterior)),
      confidence,
      evidenceCount: 1,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };
  }

  /**
   * Batch update multiple beliefs.
   */
  batchUpdate(
    beliefs: BeliefNode[],
    evidence: EvidenceEvent[],
    weights: EvidenceWeight[]
  ): BeliefUpdate[] {
    const updates: BeliefUpdate[] = [];

    for (const ev of evidence) {
      const belief = beliefs.find((b) => b.beliefId === ev.targetBeliefId);
      const weight = weights.find((w) => w.evidenceType === ev.type);

      if (belief && weight) {
        const update = this.calculatePosterior(belief, ev, weight);
        updates.push(update);
      }
    }

    return updates;
  }

  /**
   * Apply update to belief node.
   */
  applyUpdate(
    belief: BeliefNode,
    update: BeliefUpdate
  ): BeliefNode {
    return {
      ...belief,
      currentProbability: update.posteriorBelief.probability,
      confidence: update.posteriorBelief.confidence,
      evidenceCount: belief.evidenceCount + 1,
      lastUpdated: update.timestamp,
    };
  }

  /**
   * Generate update explanation.
   */
  private generateExplanation(
    prior: BeliefNode,
    evidence: EvidenceEvent,
    priorProbability: number,
    posterior: number,
    delta: number,
    weight: EvidenceWeight
  ): string {
    const parts: string[] = [];

    // Direction
    if (delta > 0.05) {
      parts.push(
        `Increased confidence in ${prior.name} from ${Math.round(
          priorProbability * 100
        )}% to ${Math.round(posterior * 100)}%`
      );
    } else if (delta < -0.05) {
      parts.push(
        `Decreased confidence in ${prior.name} from ${Math.round(
          priorProbability * 100
        )}% to ${Math.round(posterior * 100)}%`
      );
    } else {
      parts.push(
        `Maintained confidence in ${prior.name} at ${Math.round(
          posterior * 100
        )}%`
      );
    }

    // Evidence
    parts.push(`based on ${evidence.type}`);

    // Strength
    if (weight.finalWeight > 0.7) {
      parts.push('(strong evidence)');
    } else if (weight.finalWeight < 0.4) {
      parts.push('(weak evidence)');
    }

    return parts.join(' ');
  }

  /**
   * Generate unique update ID.
   */
  private generateUpdateId(): string {
    return `upd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique belief ID.
   */
  private generateBeliefId(beliefId: string): string {
    return `belief-${beliefId}-${Date.now()}`;
  }
}

/**
 * Factory function for PosteriorCalculator.
 */
export function createPosteriorCalculator(
  config: BayesianBeliefConfig
): PosteriorCalculator {
  return new PosteriorCalculator(config);
}
