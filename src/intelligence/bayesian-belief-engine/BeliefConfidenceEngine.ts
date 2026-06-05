/**
 * CareerOS Bayesian Belief Updating Engine - Belief Confidence Engine
 *
 * Tracks confidence growth, decay, and belief stability.
 */

import type {
  BeliefNode,
  BeliefConfidence,
  BeliefHistory,
  BayesianBeliefConfig,
  ConfidenceLevel,
  StabilityLevel,
} from './types';

/**
 * Manages belief confidence over time.
 */
export class BeliefConfidenceEngine {
  private config: BayesianBeliefConfig;

  constructor(config: BayesianBeliefConfig) {
    this.config = config;
  }

  /**
   * Calculate current confidence metrics for a belief.
   */
  calculateConfidence(
    belief: BeliefNode,
    history: BeliefHistory
  ): BeliefConfidence {
    const currentConfidence = belief.confidence;

    // Calculate confidence level
    const confidenceLevel = this.getConfidenceLevel(currentConfidence);

    // Build history
    const confidenceHistory = history.updates.map((update) => ({
      timestamp: update.timestamp,
      confidence: update.posteriorBelief.confidence,
      event: update.evidence.type,
    }));

    // Calculate growth rate
    const growthRate = this.calculateGrowthRate(confidenceHistory);

    // Calculate decay rate
    const decayRate = this.calculateDecayRate(
      belief,
      confidenceHistory,
      this.config.confidenceDecayRate
    );

    // Calculate stability
    const stability = this.calculateStability(
      belief,
      history,
      confidenceHistory
    );

    // Time since last update
    const timeSinceLastUpdate = Date.now() - belief.lastUpdated;

    return {
      beliefId: belief.beliefId,
      currentConfidence,
      confidenceLevel,
      history: confidenceHistory,
      growthRate,
      decayRate,
      stability,
      timeSinceLastUpdate,
    };
  }

  /**
   * Calculate confidence for multiple beliefs.
   */
  calculateConfidences(
    beliefs: BeliefNode[],
    histories: Record<string, BeliefHistory>
  ): Record<string, BeliefConfidence> {
    const confidences: Record<string, BeliefConfidence> = {};

    for (const belief of beliefs) {
      const history = histories[belief.beliefId];
      if (history) {
        confidences[belief.beliefId] = this.calculateConfidence(
          belief,
          history
        );
      }
    }

    return confidences;
  }

  /**
   * Apply confidence decay based on time since last update.
   */
  applyDecay(belief: BeliefNode): BeliefNode {
    const daysSinceUpdate =
      (Date.now() - belief.lastUpdated) / (1000 * 60 * 60 * 24);

    // Calculate decay amount
    const decayAmount = daysSinceUpdate * this.config.confidenceDecayRate;

    // Apply decay
    const newConfidence = Math.max(
      this.config.minConfidence,
      belief.confidence - decayAmount
    );

    return {
      ...belief,
      confidence: newConfidence,
    };
  }

  /**
   * Calculate confidence growth rate.
   */
  private calculateGrowthRate(
    history: Array<{ timestamp: number; confidence: number }>
  ): number {
    if (history.length < 2) return 0;

    // Calculate average change per update
    let totalChange = 0;
    for (let i = 1; i < history.length; i++) {
      totalChange += history[i].confidence - history[i - 1].confidence;
    }

    return totalChange / (history.length - 1);
  }

  /**
   * Calculate confidence decay rate.
   */
  private calculateDecayRate(
    belief: BeliefNode,
    history: Array<{ timestamp: number; confidence: number }>,
    baseDecayRate: number
  ): number {
    // More evidence = slower decay
    const evidenceFactor = Math.min(belief.evidenceCount / 5, 1);
    const adjustedDecayRate = baseDecayRate * (1 - evidenceFactor * 0.5);

    return adjustedDecayRate;
  }

  /**
   * Calculate belief stability.
   */
  private calculateStability(
    belief: BeliefNode,
    history: BeliefHistory,
    confidenceHistory: Array<{ timestamp: number; confidence: number }>
  ): BeliefConfidence['stability'] {
    // Calculate volatility (standard deviation of confidence changes)
    let volatility = 0;
    if (confidenceHistory.length >= 2) {
      const changes: number[] = [];
      for (let i = 1; i < confidenceHistory.length; i++) {
        changes.push(
          confidenceHistory[i].confidence - confidenceHistory[i - 1].confidence
        );
      }

      const mean = changes.reduce((sum, c) => sum + c, 0) / changes.length;
      const squaredDiffs = changes.map((c) => Math.pow(c - mean, 2));
      volatility = Math.sqrt(
        squaredDiffs.reduce((sum, d) => sum + d, 0) / changes.length
      );
    }

    // Determine stability level
    const score = Math.max(0, 100 - volatility * 200);
    let level: StabilityLevel = 'stable';

    if (score > 80) {
      level = 'entrenched';
    } else if (score > 60) {
      level = 'stable';
    } else if (score > 40) {
      level = 'evolving';
    } else {
      level = 'volatile';
    }

    return {
      level,
      score,
      volatility,
    };
  }

  /**
   * Get confidence level category.
   */
  private getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= 0.8) return 'veryHigh';
    if (confidence >= 0.6) return 'high';
    if (confidence >= 0.4) return 'moderate';
    return 'low';
  }

  /**
   * Predict future confidence.
   */
  predictConfidence(
    belief: BeliefNode,
    days: number,
    expectedEvidence: number
  ): {
    projectedConfidence: number;
    confidenceRange: { low: number; high: number };
    explanation: string;
  } {
    // Start with current confidence
    let projectedConfidence = belief.confidence;

    // Apply decay
    const decayAmount = days * this.config.confidenceDecayRate;
    projectedConfidence -= decayAmount;

    // Apply growth from expected evidence
    const growthAmount =
      expectedEvidence * this.config.confidenceGrowthRate * 0.5;
    projectedConfidence += growthAmount;

    // Clamp
    projectedConfidence = Math.max(
      this.config.minConfidence,
      Math.min(this.config.maxConfidence, projectedConfidence)
    );

    // Calculate range
    const uncertainty = 0.1 * (1 - belief.confidence);
    const confidenceRange = {
      low: Math.max(0, projectedConfidence - uncertainty),
      high: Math.min(1, projectedConfidence + uncertainty),
    };

    // Generate explanation
    let explanation = '';
    if (expectedEvidence > 0) {
      explanation = `Confidence projected to ${Math.round(
        projectedConfidence * 100
      )}% with ${expectedEvidence} expected evidence items.`;
    } else {
      explanation = `Confidence may decay to ${Math.round(
        projectedConfidence * 100
      )}% without new evidence.`;
    }

    return {
      projectedConfidence,
      confidenceRange,
      explanation,
    };
  }

  /**
   * Identify beliefs needing attention.
   */
  identifyAttentionNeeded(
    beliefs: BeliefNode[],
    confidences: Record<string, BeliefConfidence>
  ): Array<{
    belief: BeliefNode;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const attention: Array<{
      belief: BeliefNode;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    for (const belief of beliefs) {
      const confidence = confidences[belief.beliefId];
      if (!confidence) continue;

      // Low confidence
      if (confidence.currentConfidence < 0.3) {
        attention.push({
          belief,
          reason: 'Low confidence - more evidence needed',
          priority: 'high',
        });
      }

      // Decaying confidence
      if (confidence.timeSinceLastUpdate > 30 * 24 * 60 * 60 * 1000) {
        // 30 days
        attention.push({
          belief,
          reason: 'Confidence decaying - no recent updates',
          priority: 'medium',
        });
      }

      // Volatile belief
      if (confidence.stability.level === 'volatile') {
        attention.push({
          belief,
          reason: 'Unstable belief - inconsistent evidence',
          priority: 'medium',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    attention.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return attention;
  }

  /**
   * Generate confidence insight.
   */
  generateInsight(confidence: BeliefConfidence): string {
    const parts: string[] = [];

    parts.push(
      `${confidence.beliefId}: ${Math.round(
        confidence.currentConfidence * 100
      )}% confidence (${confidence.confidenceLevel})`
    );

    if (confidence.stability.level === 'volatile') {
      parts.push('Belief is volatile - evidence is inconsistent.');
    } else if (confidence.stability.level === 'entrenched') {
      parts.push('Belief is well-established and stable.');
    }

    if (confidence.growthRate > 0.05) {
      parts.push('Confidence growing rapidly.');
    } else if (confidence.growthRate < -0.02) {
      parts.push('Confidence declining.');
    }

    if (confidence.timeSinceLastUpdate > 60 * 24 * 60 * 60 * 1000) {
      // 60 days
      parts.push('Consider gathering fresh evidence.');
    }

    return parts.join(' ');
  }
}

/**
 * Factory function for BeliefConfidenceEngine.
 */
export function createBeliefConfidenceEngine(
  config: BayesianBeliefConfig
): BeliefConfidenceEngine {
  return new BeliefConfidenceEngine(config);
}
