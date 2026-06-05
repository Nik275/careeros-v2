/**
 * CareerOS Bayesian Belief Updating Engine - Belief Narrative Engine
 *
 * Generates narrative explanations for belief updates.
 */

import type {
  BeliefNode,
  BeliefUpdate,
  BeliefConfidence,
  Contradiction,
  BeliefHistory,
  BeliefNarrative,
  UpdatedStudentBelief,
} from './types';

/**
 * Generates narrative explanations for belief updates.
 */
export class BeliefNarrativeEngine {
  /**
   * Generate narrative for belief update result.
   */
  generateNarrative(result: UpdatedStudentBelief): BeliefNarrative {
    const summary = this.generateSummary(result);
    const keyChanges = this.generateKeyChanges(result);
    const confidenceInsights = this.generateConfidenceInsights(result);
    const contradictionWarnings = this.generateContradictionWarnings(result);
    const recommendations = this.generateRecommendations(result);

    return {
      summary,
      keyChanges,
      confidenceInsights,
      contradictionWarnings,
      recommendations,
    };
  }

  /**
   * Generate one-line summary.
   */
  private generateSummary(result: UpdatedStudentBelief): string {
    const { totalBeliefs, updatedBeliefs, newBeliefs, contradictionsFound } = result.summary;

    let summary = '';

    if (updatedBeliefs > 0) {
      summary = `Updated ${updatedBeliefs} belief${updatedBeliefs > 1 ? 's' : ''}`;
      if (newBeliefs > 0) {
        summary += ` and discovered ${newBeliefs} new belief${newBeliefs > 1 ? 's' : ''}`;
      }
    } else if (newBeliefs > 0) {
      summary = `Discovered ${newBeliefs} new belief${newBeliefs > 1 ? 's' : ''}`;
    } else {
      summary = 'No belief updates performed';
    }

    if (contradictionsFound > 0) {
      summary += `. Found ${contradictionsFound} potential contradiction${contradictionsFound > 1 ? 's' : ''}.`;
    } else {
      summary += '.';
    }

    return summary;
  }

  /**
   * Generate key changes explanation.
   */
  private generateKeyChanges(result: UpdatedStudentBelief): string[] {
    const changes: string[] = [];

    // Sort updates by magnitude of change
    const sortedUpdates = [...result.updates].sort(
      (a, b) => Math.abs(b.change.probabilityDelta) - Math.abs(a.change.probabilityDelta)
    );

    // Top 3 most significant changes
    const topUpdates = sortedUpdates.slice(0, 3);

    for (const update of topUpdates) {
      const direction = update.change.probabilityDelta > 0 ? 'increased' : 'decreased';
      const magnitude = Math.abs(update.change.probabilityDelta);

      if (magnitude > 0.1) {
        changes.push(
          `CareerOS confidence in your ${update.beliefId} ${direction} from ${Math.round(
            update.priorBelief.probability * 100
          )}% to ${Math.round(update.posteriorBelief.probability * 100)}% after ${update.evidence.type}.`
        );
      }
    }

    // If no significant changes, note that
    if (changes.length === 0) {
      changes.push('No major belief changes detected. Current evidence reinforces existing beliefs.');
    }

    return changes;
  }

  /**
   * Generate confidence insights.
   */
  private generateConfidenceInsights(result: UpdatedStudentBelief): string[] {
    const insights: string[] = [];

    // High confidence beliefs
    const highConfidence = Object.values(result.confidence).filter(
      (c) => c.confidenceLevel === 'high' || c.confidenceLevel === 'veryHigh'
    );

    if (highConfidence.length > 0) {
      const beliefNames = highConfidence
        .slice(0, 3)
        .map((c) => c.beliefId)
        .join(', ');
      insights.push(
        `${highConfidence.length} belief${highConfidence.length > 1 ? 's' : ''} now have high confidence${
          highConfidence.length <= 3 ? `: ${beliefNames}` : ''
        }.`
      );
    }

    // Growing confidence
    const growingConfidence = Object.values(result.confidence).filter(
      (c) => c.growthRate > 0.05
    );

    if (growingConfidence.length > 0) {
      insights.push(
        `Confidence is growing rapidly for ${growingConfidence.length} belief${
          growingConfidence.length > 1 ? 's' : ''
        } based on consistent evidence.`
      );
    }

    // Stable beliefs
    const stableBeliefs = Object.values(result.confidence).filter(
      (c) => c.stability.level === 'stable' || c.stability.level === 'entrenched'
    );

    if (stableBeliefs.length > 0) {
      insights.push(
        `${stableBeliefs.length} belief${stableBeliefs.length > 1 ? 's' : ''} have stabilized and are unlikely to change significantly.`
      );
    }

    // Volatile beliefs
    const volatileBeliefs = Object.values(result.confidence).filter(
      (c) => c.stability.level === 'volatile'
    );

    if (volatileBeliefs.length > 0) {
      insights.push(
        `${volatileBeliefs.length} belief${volatileBeliefs.length > 1 ? 's' : ''} ${
          volatileBeliefs.length > 1 ? 'show' : 'shows'
        } volatility - more consistent evidence may be needed.`
      );
    }

    return insights;
  }

  /**
   * Generate contradiction warnings.
   */
  private generateContradictionWarnings(result: UpdatedStudentBelief): string[] {
    const warnings: string[] = [];

    for (const contradiction of result.contradictions) {
      switch (contradiction.type) {
        case 'actionInconsistency':
          warnings.push(
            `You claim strong ${contradiction.beliefId} but no supporting actions have been observed. Consider opportunities to demonstrate this interest.`
          );
          break;
        case 'statementInconsistency':
          warnings.push(
            `Your stated ${contradiction.beliefId} has changed significantly. This may reflect natural evolution or exploration.`
          );
          break;
        case 'temporalInconsistency':
          warnings.push(
            `${contradiction.beliefId} shows rapid fluctuations. Consider whether external factors are influencing your responses.`
          );
          break;
        case 'behavioralInconsistency':
          warnings.push(
            `Your behavior patterns for ${contradiction.beliefId} differ from your stated preferences. Actions may reveal true preferences.`
          );
          break;
      }
    }

    return warnings;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(result: UpdatedStudentBelief): string[] {
    const recommendations: string[] = [];

    // Recommendations based on contradictions
    if (result.contradictions.length > 0) {
      recommendations.push('Consider exploring the identified contradictions through reflection or discussion.');
    }

    // Recommendations based on low confidence beliefs
    const lowConfidenceBeliefs = result.beliefs.filter((b) => b.confidence < 0.4);
    if (lowConfidenceBeliefs.length > 0) {
      recommendations.push(
        `Gather more evidence for ${lowConfidenceBeliefs.length} low-confidence belief${
          lowConfidenceBeliefs.length > 1 ? 's' : ''
        } to improve model accuracy.`
      );
    }

    // Recommendations based on evidence gaps
    const beliefsNeedingEvidence = result.beliefs.filter(
      (b) => b.evidenceCount < 3
    );
    if (beliefsNeedingEvidence.length > 0) {
      recommendations.push(
        `Consider career experiments or projects to validate ${beliefsNeedingEvidence.length} belief${
          beliefsNeedingEvidence.length > 1 ? 's' : ''
        } with limited evidence.`
      );
    }

    // Stable belief recommendations
    const stableBeliefs = Object.values(result.confidence).filter(
      (c) => c.stability.level === 'entrenched' && c.currentConfidence > 0.7
    );
    if (stableBeliefs.length > 0) {
      const beliefNames = stableBeliefs
        .slice(0, 2)
        .map((c) => c.beliefId)
        .join(', ');
      recommendations.push(
        `Your ${beliefNames} ${stableBeliefs.length > 1 ? 'are' : 'is'} well-established - these can serve as anchors for career decisions.`
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed narrative for a specific belief.
   */
  generateBeliefNarrative(
    belief: BeliefNode,
    history: BeliefHistory,
    confidence: BeliefConfidence
  ): string {
    const parts: string[] = [];

    // Overview
    parts.push(
      `${belief.name}: ${Math.round(belief.currentProbability * 100)}% probability with ${Math.round(
        belief.confidence * 100
      )}% confidence`
    );

    // Based on evidence
    parts.push(`Based on ${belief.evidenceCount} evidence items.`);

    // History
    if (history.updates.length > 0) {
      parts.push('\nEvolution:');
      const recentUpdates = history.updates.slice(-3);
      for (const update of recentUpdates) {
        parts.push(
          `  - ${update.evidence.type}: ${Math.round(
            update.priorBelief.probability * 100
          )}% → ${Math.round(update.posteriorBelief.probability * 100)}%`
        );
      }
    }

    // Confidence insight
    if (confidence.stability.level === 'entrenched') {
      parts.push('\nThis belief is well-established and stable.');
    } else if (confidence.stability.level === 'volatile') {
      parts.push('\nThis belief shows volatility - more evidence may be needed.');
    }

    return parts.join('\n');
  }

  /**
   * Generate comparison narrative.
   */
  generateComparisonNarrative(
    previousState: UpdatedStudentBelief,
    currentState: UpdatedStudentBelief
  ): string {
    const parts: string[] = [];

    parts.push('Belief Evolution Summary:');
    parts.push('');

    // Compare beliefs
    for (const currentBelief of currentState.beliefs) {
      const previousBelief = previousState.beliefs.find(
        (b) => b.beliefId === currentBelief.beliefId
      );

      if (previousBelief) {
        const change = currentBelief.currentProbability - previousBelief.currentProbability;
        if (Math.abs(change) > 0.05) {
          const direction = change > 0 ? 'increased' : 'decreased';
          parts.push(
            `- ${currentBelief.name} ${direction} from ${Math.round(
              previousBelief.currentProbability * 100
            )}% to ${Math.round(currentBelief.currentProbability * 100)}%`
          );
        }
      } else {
        parts.push(
          `- New belief discovered: ${currentBelief.name} at ${Math.round(
            currentBelief.currentProbability * 100
          )}%`
        );
      }
    }

    return parts.join('\n');
  }
}

/**
 * Factory function for BeliefNarrativeEngine.
 */
export function createBeliefNarrativeEngine(): BeliefNarrativeEngine {
  return new BeliefNarrativeEngine();
}
