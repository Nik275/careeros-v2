/**
 * CareerOS Bayesian Belief Updating Engine - Contradiction Detector
 *
 * Detects inconsistencies between beliefs and evidence.
 */

import type {
  BeliefNode,
  EvidenceEvent,
  Contradiction,
  BeliefHistory,
  BayesianBeliefConfig,
} from './types';

/**
 * Detects contradictions between beliefs and evidence.
 */
export class ContradictionDetector {
  private config: BayesianBeliefConfig;

  constructor(config: BayesianBeliefConfig) {
    this.config = config;
  }

  /**
   * Detect contradictions for a belief.
   */
  detectContradictions(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];

    // Check action inconsistency
    const actionContradiction = this.checkActionInconsistency(
      belief,
      evidence,
      history
    );
    if (actionContradiction) {
      contradictions.push(actionContradiction);
    }

    // Check statement inconsistency
    const statementContradiction = this.checkStatementInconsistency(
      belief,
      evidence,
      history
    );
    if (statementContradiction) {
      contradictions.push(statementContradiction);
    }

    // Check temporal inconsistency
    const temporalContradiction = this.checkTemporalInconsistency(
      belief,
      evidence,
      history
    );
    if (temporalContradiction) {
      contradictions.push(temporalContradiction);
    }

    // Check behavioral inconsistency
    const behavioralContradiction = this.checkBehavioralInconsistency(
      belief,
      evidence,
      history
    );
    if (behavioralContradiction) {
      contradictions.push(behavioralContradiction);
    }

    return contradictions;
  }

  /**
   * Check for action inconsistency.
   * Example: Claims love of entrepreneurship, but no entrepreneurial activity.
   */
  private checkActionInconsistency(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ): Contradiction | null {
    // High belief probability but no supporting actions
    if (belief.currentProbability < 0.6) return null;

    // Look for relevant actions in evidence
    const relevantActions = evidence.filter(
      (e) =>
        e.targetBeliefId === belief.beliefId &&
        (e.type === 'project' ||
          e.type === 'internship' ||
          e.type === 'competition' ||
          e.type === 'careerExperiment')
    );

    // Check if belief claims high interest but no actions
    const supportingActions = relevantActions.filter((e) => e.supportsBelief);

    if (belief.currentProbability > 0.7 && supportingActions.length === 0) {
      // Find most recent claim (assessment or reflection)
      const claimEvidence = evidence.find(
        (e) =>
          e.targetBeliefId === belief.beliefId &&
          (e.type === 'assessment' || e.type === 'reflection')
      );

      if (claimEvidence) {
        return {
          id: this.generateContradictionId(),
          beliefId: belief.beliefId,
          beliefType: belief.beliefType,
          claimedValue: belief.currentProbability,
          conflictingEvidence: claimEvidence,
          severity: 0.6,
          type: 'actionInconsistency',
          description: `Claims strong ${belief.name} (${Math.round(
            belief.currentProbability * 100
          )}%) but no supporting actions observed`,
          suggestions: [
            `Look for opportunities to demonstrate ${belief.name}`,
            `Consider whether the belief reflects aspiration rather than current interest`,
            `Explore low-commitment ways to test this interest`,
          ],
        };
      }
    }

    return null;
  }

  /**
   * Check for statement inconsistency.
   * Example: Previously said X, now says Y about the same belief.
   */
  private checkStatementInconsistency(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ): Contradiction | null {
    // Look for self-report evidence
    const selfReports = evidence.filter(
      (e) =>
        e.targetBeliefId === belief.beliefId &&
        (e.type === 'assessment' || e.type === 'reflection')
    );

    if (selfReports.length < 2) return null;

    // Sort by timestamp
    selfReports.sort((a, b) => a.timestamp - b.timestamp);

    // Check for significant change
    const firstReport = selfReports[0];
    const lastReport = selfReports[selfReports.length - 1];

    const change = Math.abs(lastReport.strength - firstReport.strength);

    if (change > this.config.contradictionThreshold) {
      return {
        id: this.generateContradictionId(),
        beliefId: belief.beliefId,
        beliefType: belief.beliefType,
        claimedValue: lastReport.strength,
        conflictingEvidence: firstReport,
        severity: change,
        type: 'statementInconsistency',
        description: `Belief in ${belief.name} changed from ${Math.round(
          firstReport.strength * 100
        )}% to ${Math.round(lastReport.strength * 100)}%`,
        suggestions: [
          'Beliefs naturally evolve over time',
          'Consider what experiences drove this change',
          'Track whether the change is stable or fluctuating',
        ],
      };
    }

    return null;
  }

  /**
   * Check for temporal inconsistency.
   * Example: Belief changes too rapidly (unstable).
   */
  private checkTemporalInconsistency(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ): Contradiction | null {
    // Check for rapid changes in belief history
    if (history.updates.length < 3) return null;

    // Calculate volatility
    const changes: number[] = [];
    for (let i = 1; i < history.updates.length; i++) {
      changes.push(
        Math.abs(
          history.updates[i].posteriorBelief.probability -
            history.updates[i - 1].posteriorBelief.probability
        )
      );
    }

    const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

    // High volatility indicates temporal inconsistency
    if (avgChange > 0.15) {
      // Find the most volatile period
      let maxChange = 0;
      let maxChangeIndex = 0;
      for (let i = 0; i < changes.length; i++) {
        if (changes[i] > maxChange) {
          maxChange = changes[i];
          maxChangeIndex = i;
        }
      }

      const conflictingEvidence =
        history.updates[maxChangeIndex + 1]?.evidence || evidence[0];

      return {
        id: this.generateContradictionId(),
        beliefId: belief.beliefId,
        beliefType: belief.beliefType,
        claimedValue: belief.currentProbability,
        conflictingEvidence,
        severity: Math.min(avgChange * 3, 1.0),
        type: 'temporalInconsistency',
        description: `${belief.name} shows high volatility (avg ${Math.round(
          avgChange * 100
        )}% change per update)`,
        suggestions: [
          'Belief may be unstable or influenced by temporary factors',
          'Consider gathering more consistent evidence',
          'Explore underlying reasons for rapid changes',
        ],
      };
    }

    return null;
  }

  /**
   * Check for behavioral inconsistency.
   * Example: Says X is important, but behavior shows Y.
   */
  private checkBehavioralInconsistency(
    belief: BeliefNode,
    evidence: EvidenceEvent[],
    history: BeliefHistory
  ): Contradiction | null {
    // Look for behavioral evidence
    const behavioralEvidence = evidence.filter(
      (e) =>
        e.targetBeliefId === belief.beliefId &&
        (e.type === 'behavior' || e.type === 'project' || e.type === 'careerExperiment')
    );

    if (behavioralEvidence.length < 2) return null;

    // Calculate consistency of behavior
    const supportingCount = behavioralEvidence.filter((e) => e.supportsBelief).length;
    const consistency = supportingCount / behavioralEvidence.length;

    // Low consistency indicates behavioral inconsistency
    if (consistency < 0.4 && belief.currentProbability > 0.5) {
      const conflictingEvidence = behavioralEvidence.find((e) => !e.supportsBelief);
      if (!conflictingEvidence) return null;

      return {
        id: this.generateContradictionId(),
        beliefId: belief.beliefId,
        beliefType: belief.beliefType,
        claimedValue: belief.currentProbability,
        conflictingEvidence,
        severity: 0.7,
        type: 'behavioralInconsistency',
        description: `Behavior is inconsistent with stated ${belief.name} (${Math.round(
          consistency * 100
        )}% behavioral alignment)`,
        suggestions: [
          'Actions may reveal different preferences than statements',
          'Consider what the behavior pattern actually shows',
          'Explore potential barriers to acting on stated beliefs',
        ],
      };
    }

    return null;
  }

  /**
   * Calculate overall contradiction score for a belief.
   */
  calculateContradictionScore(
    belief: BeliefNode,
    contradictions: Contradiction[]
  ): number {
    if (contradictions.length === 0) return 0;

    const avgSeverity =
      contradictions.reduce((sum, c) => sum + c.severity, 0) /
      contradictions.length;

    // More contradictions = higher score
    const countFactor = Math.min(contradictions.length / 3, 1);

    return avgSeverity * 0.7 + countFactor * 0.3;
  }

  /**
   * Generate contradiction summary.
   */
  generateSummary(contradictions: Contradiction[]): string {
    if (contradictions.length === 0) {
      return 'No contradictions detected. Beliefs appear consistent with evidence.';
    }

    const parts: string[] = [];
    parts.push(`Found ${contradictions.length} contradiction(s):`);

    contradictions.forEach((c) => {
      parts.push(`- ${c.type}: ${c.description}`);
    });

    return parts.join('\n');
  }

  /**
   * Generate unique contradiction ID.
   */
  private generateContradictionId(): string {
    return `contradiction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function for ContradictionDetector.
 */
export function createContradictionDetector(
  config: BayesianBeliefConfig
): ContradictionDetector {
  return new ContradictionDetector(config);
}
