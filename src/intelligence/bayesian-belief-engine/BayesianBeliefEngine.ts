/**
 * CareerOS Bayesian Belief Updating Engine - Main Engine
 *
 * Continuously updates student beliefs as new evidence is collected.
 * Moves from static assessments to evidence-driven student modeling.
 */

import { EvidenceWeightEngine } from './EvidenceWeightEngine';
import { PosteriorCalculator } from './PosteriorCalculator';
import { BeliefConfidenceEngine } from './BeliefConfidenceEngine';
import { ContradictionDetector } from './ContradictionDetector';
import { BeliefNarrativeEngine } from './BeliefNarrativeEngine';
import { DEFAULT_BAYESIAN_CONFIG } from './types';

import type {
  BeliefUpdateId,
  BeliefNode,
  EvidenceEvent,
  BeliefUpdate,
  BeliefHistory,
  Contradiction,
  UpdatedStudentBelief,
  BeliefUpdateInput,
  ProcessEvidenceInput,
  BayesianBeliefConfig,
} from './types';

/**
 * Main Bayesian Belief Engine.
 */
export class BayesianBeliefEngine {
  private config: BayesianBeliefConfig;
  private weightEngine: EvidenceWeightEngine;
  private posteriorCalculator: PosteriorCalculator;
  private confidenceEngine: BeliefConfidenceEngine;
  private contradictionDetector: ContradictionDetector;
  private narrativeEngine: BeliefNarrativeEngine;

  constructor(config: Partial<BayesianBeliefConfig> = {}) {
    this.config = { ...DEFAULT_BAYESIAN_CONFIG, ...config };

    this.weightEngine = new EvidenceWeightEngine(this.config);
    this.posteriorCalculator = new PosteriorCalculator(this.config);
    this.confidenceEngine = new BeliefConfidenceEngine(this.config);
    this.contradictionDetector = new ContradictionDetector(this.config);
    this.narrativeEngine = new BeliefNarrativeEngine();
  }

  /**
   * Main entry point: update beliefs with new evidence.
   */
  updateBeliefs(input: BeliefUpdateInput): UpdatedStudentBelief {
    const {
      studentId,
      currentBeliefs,
      newEvidence,
      histories = {},
      config,
    } = input;

    // Apply custom config if provided
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Calculate evidence weights
    const evidenceWeights = this.weightEngine.calculateWeights(newEvidence);

    // Process each evidence item
    const updates: BeliefUpdate[] = [];
    const updatedBeliefs: BeliefNode[] = [...currentBeliefs];
    const updatedHistories: Record<string, BeliefHistory> = { ...histories };
    const allContradictions: Contradiction[] = [];

    for (let i = 0; i < newEvidence.length; i++) {
      const evidence = newEvidence[i];
      const weight = evidenceWeights[i];

      // Find existing belief or create new one
      let beliefIndex = updatedBeliefs.findIndex(
        (b) => b.beliefId === evidence.targetBeliefId
      );

      if (beliefIndex === -1) {
        // Create new belief
        const newBelief = this.posteriorCalculator.calculateInitialBelief(
          evidence.targetBeliefId,
          evidence.targetBeliefType,
          this.formatBeliefName(evidence.targetBeliefId),
          evidence,
          weight
        );
        updatedBeliefs.push(newBelief);
        beliefIndex = updatedBeliefs.length - 1;

        // Initialize history
        updatedHistories[newBelief.beliefId] = {
          beliefId: newBelief.beliefId,
          metadata: {
            type: newBelief.beliefType,
            name: newBelief.name,
            createdAt: Date.now(),
          },
          updates: [],
          confidenceTrajectory: [],
          probabilityTrajectory: [],
          evidence: [],
          contradictions: [],
          statistics: {
            totalUpdates: 0,
            totalEvidence: 0,
            averageChange: 0,
            maxProbability: newBelief.currentProbability,
            minProbability: newBelief.currentProbability,
          },
        };
      }

      // Get current belief
      let belief = updatedBeliefs[beliefIndex];
      let history = updatedHistories[belief.beliefId];

      // Apply confidence decay
      belief = this.confidenceEngine.applyDecay(belief);

      // Calculate posterior
      const update = this.posteriorCalculator.calculatePosterior(
        belief,
        evidence,
        weight
      );

      // Apply update
      belief = this.posteriorCalculator.applyUpdate(belief, update);

      // Update history
      history.updates.push(update);
      history.evidence.push(evidence);
      history.confidenceTrajectory.push({
        timestamp: update.timestamp,
        confidence: update.posteriorBelief.confidence,
      });
      history.probabilityTrajectory.push({
        timestamp: update.timestamp,
        probability: update.posteriorBelief.probability,
      });
      history.statistics.totalUpdates++;
      history.statistics.totalEvidence++;

      // Detect contradictions
      const contradictions = this.contradictionDetector.detectContradictions(
        belief,
        history.evidence,
        history
      );

      for (const contradiction of contradictions) {
        if (!history.contradictions.find((c) => c.id === contradiction.id)) {
          history.contradictions.push(contradiction);
          allContradictions.push(contradiction);
        }
      }

      // Save updates
      updatedBeliefs[beliefIndex] = belief;
      updatedHistories[belief.beliefId] = history;
      updates.push(update);
    }

    // Calculate confidence metrics
    const confidences = this.confidenceEngine.calculateConfidences(
      updatedBeliefs,
      updatedHistories
    );

    // Calculate summary statistics
    const updatedBeliefCount = updates.length;
    const newBeliefCount = newEvidence.filter((e) => {
      return !currentBeliefs.find((b) => b.beliefId === e.targetBeliefId);
    }).length;

    const averageConfidence =
      updatedBeliefs.reduce((sum, b) => sum + b.confidence, 0) /
      updatedBeliefs.length;

    // Build result
    const result: UpdatedStudentBelief = {
      studentId,
      timestamp: Date.now(),
      beliefs: updatedBeliefs,
      updates,
      confidence: confidences,
      histories: updatedHistories,
      contradictions: allContradictions,
      summary: {
        totalBeliefs: updatedBeliefs.length,
        updatedBeliefs: updatedBeliefCount,
        newBeliefs: newBeliefCount,
        contradictionsFound: allContradictions.length,
        averageConfidence,
      },
      narrative: {
        summary: '',
        keyChanges: [],
        confidenceInsights: [],
        recommendations: [],
      },
    };

    // Generate narrative
    const narrative = this.narrativeEngine.generateNarrative(result);
    result.narrative = narrative;

    return result;
  }

  /**
   * Process a single evidence event.
   */
  processEvidence(input: ProcessEvidenceInput): BeliefUpdate {
    const { evidence, currentBelief } = input;

    // Calculate weight
    const weight = this.weightEngine.calculateWeight(evidence);

    // Calculate posterior
    if (currentBelief) {
      return this.posteriorCalculator.calculatePosterior(
        currentBelief,
        evidence,
        weight
      );
    }

    // Create initial belief if none exists
    const initialBelief = this.posteriorCalculator.calculateInitialBelief(
      evidence.targetBeliefId,
      evidence.targetBeliefType,
      this.formatBeliefName(evidence.targetBeliefId),
      evidence,
      weight
    );

    return {
      id: this.generateUpdateId(),
      timestamp: Date.now(),
      studentId: evidence.studentId,
      beliefId: evidence.targetBeliefId,
      priorBelief: {
        probability: this.config.defaultPrior,
        confidence: this.config.defaultConfidence,
      },
      evidence,
      posteriorBelief: {
        probability: initialBelief.currentProbability,
        confidence: initialBelief.confidence,
      },
      change: {
        probabilityDelta: initialBelief.currentProbability - this.config.defaultPrior,
        confidenceDelta: initialBelief.confidence - this.config.defaultConfidence,
      },
      explanation: `Created new belief ${initialBelief.name} based on ${evidence.type}`,
      calculation: {
        prior: this.config.defaultPrior,
        likelihood: evidence.supportsBelief ? evidence.strength : 1 - evidence.strength,
        posterior: initialBelief.currentProbability,
        bayesFactor: 1,
      },
    };
  }

  /**
   * Get belief history.
   */
  getBeliefHistory(
    beliefId: string,
    histories: Record<string, BeliefHistory>
  ): BeliefHistory | null {
    return histories[beliefId] || null;
  }

  /**
   * Get confidence metrics.
   */
  getConfidence(
    belief: BeliefNode,
    history: BeliefHistory
  ) {
    return this.confidenceEngine.calculateConfidence(belief, history);
  }

  /**
   * Check for contradictions.
   */
  checkContradictions(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ) {
    return this.contradictionDetector.detectContradictions(
      belief,
      evidence,
      history
    );
  }

  /**
   * Generate narrative for belief.
   */
  generateNarrative(result: UpdatedStudentBelief) {
    return this.narrativeEngine.generateNarrative(result);
  }

  /**
   * Get beliefs needing attention.
   */
  getAttentionNeeded(
    beliefs: BeliefNode[],
    histories: Record<string, BeliefHistory>
  ) {
    const confidences = this.confidenceEngine.calculateConfidences(
      beliefs,
      histories
    );
    return this.confidenceEngine.identifyAttentionNeeded(beliefs, confidences);
  }

  /**
   * Format belief name from ID.
   */
  private formatBeliefName(beliefId: string): string {
    return beliefId
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate unique update ID.
   */
  private generateUpdateId(): BeliefUpdateId {
    return `upd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for BayesianBeliefEngine.
 */
export function createBayesianBeliefEngine(
  config?: Partial<BayesianBeliefConfig>
): BayesianBeliefEngine {
  return new BayesianBeliefEngine(config);
}

/**
 * Convenience function to update beliefs.
 */
export function updateStudentBeliefs(
  input: BeliefUpdateInput,
  config?: Partial<BayesianBeliefConfig>
): UpdatedStudentBelief {
  const engine = new BayesianBeliefEngine(config);
  return engine.updateBeliefs(input);
}

/**
 * Convenience function to process single evidence.
 */
export function processEvidenceEvent(
  input: ProcessEvidenceInput,
  config?: Partial<BayesianBeliefConfig>
): BeliefUpdate {
  const engine = new BayesianBeliefEngine(config);
  return engine.processEvidence(input);
}
