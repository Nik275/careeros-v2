/**
 * Context Scoring Engine
 * 
 * Calculates confidence scores for detected contexts using Bayesian-inspired
 * evidence combination. Handles evidence weighting, uncertainty quantification,
 * and conflict detection.
 * 
 * @module intelligence/decision-context/scoring
 */

import {
  DecisionContextType,
  ContextCategory,
  ContextEvidence,
  EvidenceType,
  EvidenceWeights,
  ContextUncertainty,
  UncertaintySource,
  DetectedContext,
  ContextPriority,
  ContextConflict,
  ContextEngineConfig,
  CONTEXT_TYPE_CATEGORIES,
} from '../types';

/**
 * Configuration for scoring algorithms.
 */
export interface ScoringConfig {
  /** Base confidence when no evidence exists */
  baseConfidence: number;
  
  /** Maximum confidence achievable */
  maxConfidence: number;
  
  /** How much each evidence piece contributes (diminishing returns) */
  evidenceDiminishingFactor: number;
  
  /** Minimum evidence strength to count */
  minEvidenceStrength: number;
  
  /** Weights for different evidence types */
  evidenceWeights: EvidenceWeights;
  
  /** Threshold for high-confidence detection */
  highConfidenceThreshold: number;
  
  /** Threshold for considering evidence strong */
  strongEvidenceThreshold: number;
}

/**
 * Default scoring configuration.
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  baseConfidence: 0.1,
  maxConfidence: 0.95,
  evidenceDiminishingFactor: 0.8,
  minEvidenceStrength: 0.2,
  highConfidenceThreshold: 0.7,
  strongEvidenceThreshold: 0.6,
  evidenceWeights: {
    [EvidenceType.EXPLICIT_ANSWER]: 1.0,
    [EvidenceType.USER_DECLARED]: 0.95,
    [EvidenceType.EDUCATION_DATA]: 0.85,
    [EvidenceType.EXPERIENCE_DATA]: 0.8,
    [EvidenceType.GOAL_STATEMENT]: 0.85,
    [EvidenceType.IMPLICIT_SIGNAL]: 0.6,
    [EvidenceType.PATTERN_MATCH]: 0.5,
    [EvidenceType.TEMPORAL_INFERENCE]: 0.45,
    [EvidenceType.COMBINATORIAL_INFERENCE]: 0.4,
    [EvidenceType.BROWSING_PATTERN]: 0.35,
    [EvidenceType.INTERACTION_HISTORY]: 0.3,
  },
};

/**
 * Result of confidence calculation.
 */
export interface ConfidenceResult {
  confidence: number;
  uncertainty: ContextUncertainty;
  weightedEvidenceScore: number;
  rawEvidenceCount: number;
  strongEvidenceCount: number;
}

/**
 * Context Scoring Engine
 * 
 * Implements sophisticated scoring algorithms:
 * 1. Weighted evidence combination with diminishing returns
 * 2. Uncertainty quantification based on evidence gaps
 * 3. Conflict detection between incompatible contexts
 * 4. Priority assignment based on confidence and relevance
 */
export class ContextScoringEngine {
  private config: ScoringConfig;
  
  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = { ...DEFAULT_SCORING_CONFIG, ...config };
  }
  
  /**
   * Calculate confidence score for a context based on evidence.
   * 
   * Uses a weighted evidence combination with diminishing returns:
   * - Strong early evidence provides significant confidence
   * - Additional evidence provides diminishing returns
   * - Evidence types are weighted by reliability
   * - Minimum thresholds prevent weak detections
   * 
   * @param context - The context type being evaluated
   * @param evidence - Array of evidence supporting this context
   * @returns Confidence calculation result
   */
  calculateConfidence(
    context: DecisionContextType,
    evidence: ContextEvidence[]
  ): ConfidenceResult {
    // Filter out weak evidence
    const validEvidence = evidence.filter(
      e => e.strength >= this.config.minEvidenceStrength
    );
    
    if (validEvidence.length === 0) {
      return {
        confidence: this.config.baseConfidence,
        uncertainty: this.createMaxUncertainty(['No valid evidence found']),
        weightedEvidenceScore: 0,
        rawEvidenceCount: 0,
        strongEvidenceCount: 0,
      };
    }
    
    // Calculate weighted evidence scores
    const weightedScores = validEvidence.map(e => {
      const typeWeight = this.config.evidenceWeights[e.type] || 0.5;
      return e.strength * typeWeight;
    });
    
    // Sort by strength (strongest first for diminishing returns)
    weightedScores.sort((a, b) => b - a);
    
    // Apply diminishing returns formula
    let combinedScore = 0;
    let remainingWeight = 1;
    
    for (const score of weightedScores) {
      combinedScore += score * remainingWeight;
      remainingWeight *= this.config.evidenceDiminishingFactor;
    }
    
    // Normalize to 0-1 range with max confidence cap
    const normalizedScore = Math.min(
      combinedScore / (1 + combinedScore * 0.5),
      this.config.maxConfidence
    );
    
    // Count strong evidence pieces
    const strongEvidenceCount = validEvidence.filter(
      e => e.strength >= this.config.strongEvidenceThreshold
    ).length;
    
    // Boost confidence slightly for multiple strong evidence
    const multiEvidenceBoost = Math.min(
      strongEvidenceCount * 0.05,
      0.15
    );
    
    const finalConfidence = Math.min(
      normalizedScore + multiEvidenceBoost,
      this.config.maxConfidence
    );
    
    // Calculate uncertainty
    const uncertainty = this.calculateUncertainty(
      context,
      validEvidence,
      finalConfidence
    );
    
    return {
      confidence: finalConfidence,
      uncertainty,
      weightedEvidenceScore: combinedScore,
      rawEvidenceCount: evidence.length,
      strongEvidenceCount,
    };
  }
  
  /**
   * Calculate uncertainty for a context detection.
   * 
   * Uncertainty sources:
   * - Insufficient data (few evidence pieces)
   * - Conflicting signals (evidence pointing elsewhere)
   * - Ambiguous profile (neutral indicators)
   * - Temporal uncertainty (recent changes)
   * 
   * @param context - Context being evaluated
   * @param evidence - Supporting evidence
   * @param confidence - Calculated confidence score
   * @returns Uncertainty analysis
   */
  private calculateUncertainty(
    context: DecisionContextType,
    evidence: ContextEvidence[],
    confidence: number
  ): ContextUncertainty {
    const sources: UncertaintySource[] = [];
    const dataNeeds: string[] = [];
    
    // Check for insufficient data
    if (evidence.length < 2) {
      sources.push(UncertaintySource.INSUFFICIENT_DATA);
      dataNeeds.push('Additional assessment responses');
      dataNeeds.push('Profile completion');
    }
    
    // Check for explicit answer presence
    const hasExplicitAnswer = evidence.some(
      e => e.type === EvidenceType.EXPLICIT_ANSWER || 
           e.type === EvidenceType.USER_DECLARED
    );
    if (!hasExplicitAnswer) {
      sources.push(UncertaintySource.AMBIGUOUS_PROFILE);
      dataNeeds.push('Explicit goal statements');
    }
    
    // Check evidence diversity
    const evidenceTypes = new Set(evidence.map(e => e.type));
    if (evidenceTypes.size < 2) {
      sources.push(UncertaintySource.INCOMPLETE_ASSESSMENT);
      dataNeeds.push('Multiple assessment dimensions');
    }
    
    // Calculate potential improvement
    const potentialImprovement = this.calculatePotentialImprovement(
      evidence,
      sources
    );
    
    // Generate explanation
    const explanation = this.generateUncertaintyExplanation(
      sources,
      evidence.length,
      confidence
    );
    
    // Calculate uncertainty score (inverse of confidence with adjustments)
    const baseUncertainty = 1 - confidence;
    const sourcePenalty = sources.length * 0.05;
    const uncertaintyScore = Math.min(baseUncertainty + sourcePenalty, 0.9);
    
    return {
      score: uncertaintyScore,
      sources,
      explanation,
      potentialImprovement,
      dataNeeds: [...new Set(dataNeeds)],
    };
  }
  
  /**
   * Calculate how much confidence could improve with more data.
   */
  private calculatePotentialImprovement(
    evidence: ContextEvidence[],
    sources: UncertaintySource[]
  ): number {
    let potential = 0;
    
    // Can improve significantly with few evidence pieces
    if (evidence.length < 3) {
      potential += 0.3;
    }
    
    // Can improve by resolving uncertainty sources
    potential += sources.length * 0.1;
    
    return Math.min(potential, 0.5);
  }
  
  /**
   * Generate human-readable uncertainty explanation.
   */
  private generateUncertaintyExplanation(
    sources: UncertaintySource[],
    evidenceCount: number,
    confidence: number
  ): string {
    if (sources.length === 0) {
      return 'High confidence detection with strong supporting evidence.';
    }
    
    const parts: string[] = [];
    
    if (sources.includes(UncertaintySource.INSUFFICIENT_DATA)) {
      parts.push(`limited evidence (${evidenceCount} pieces)`);
    }
    
    if (sources.includes(UncertaintySource.AMBIGUOUS_PROFILE)) {
      parts.push('no explicit confirmation');
    }
    
    if (sources.includes(UncertaintySource.CONFLICTING_SIGNALS)) {
      parts.push('conflicting indicators');
    }
    
    if (sources.includes(UncertaintySource.INCOMPLETE_ASSESSMENT)) {
      parts.push('incomplete assessment coverage');
    }
    
    return `Moderate uncertainty due to ${parts.join(', ')}. Confidence could improve with additional data.`;
  }
  
  /**
   * Create maximum uncertainty state.
   */
  private createMaxUncertainty(dataNeeds: string[]): ContextUncertainty {
    return {
      score: 0.9,
      sources: [UncertaintySource.INSUFFICIENT_DATA],
      explanation: 'High uncertainty due to lack of supporting evidence.',
      potentialImprovement: 0.6,
      dataNeeds,
    };
  }
  
  /**
   * Prioritize detected contexts and assign priority levels.
   * 
   * Priority assignment logic:
   * - Primary: Highest confidence, meets minimum thresholds
   * - Secondary: Significant confidence but lower than primary
   * - Tertiary: Present but not dominant
   * - Incidental: Low confidence, may be noise
   * 
   * @param contexts - Detected contexts to prioritize
   * @returns Prioritized contexts sorted by importance
   */
  prioritize(contexts: DetectedContext[]): DetectedContext[] {
    if (contexts.length === 0) {
      return [];
    }
    
    // Sort by confidence (descending)
    const sorted = [...contexts].sort((a, b) => b.confidence - a.confidence);
    
    // Assign priorities
    const prioritized: DetectedContext[] = [];
    let hasPrimary = false;
    
    for (let i = 0; i < sorted.length; i++) {
      const context = sorted[i];
      let priority: ContextPriority;
      
      if (!hasPrimary && 
          context.confidence >= this.config.highConfidenceThreshold &&
          context.evidence.length >= 2) {
        priority = ContextPriority.PRIMARY;
        hasPrimary = true;
      } else if (context.confidence >= 0.5) {
        priority = ContextPriority.SECONDARY;
      } else if (context.confidence >= 0.3) {
        priority = ContextPriority.TERTIARY;
      } else {
        priority = ContextPriority.INCIDENTAL;
      }
      
      prioritized.push({
        ...context,
        priority,
      });
    }
    
    return prioritized;
  }
  
  /**
   * Detect conflicts between contexts.
   * 
   * Conflicts occur when:
   * - Contexts are mutually exclusive (e.g., JEE + NEET simultaneously)
   * - Contexts compete for resources (time, money)
   * - Priorities are unclear between similar confidence contexts
   * 
   * @param contexts - All detected contexts
   * @returns Array of detected conflicts
   */
  detectConflicts(contexts: DetectedContext[]): ContextConflict[] {
    const conflicts: ContextConflict[] = [];
    
    // Define mutually exclusive context pairs
    const mutuallyExclusive: [DecisionContextType, DecisionContextType][] = [
      [DecisionContextType.JEE_PREPARATION, DecisionContextType.NEET_PREPARATION],
      [DecisionContextType.JEE_PREPARATION, DecisionContextType.UPSC_PREPARATION],
      [DecisionContextType.NEET_PREPARATION, DecisionContextType.UPSC_PREPARATION],
      [DecisionContextType.EARLY_CAREER, DecisionContextType.JEE_PREPARATION],
      [DecisionContextType.MID_CAREER, DecisionContextType.JEE_PREPARATION],
      [DecisionContextType.CAREER_SWITCH, DecisionContextType.EARLY_CAREER],
    ];
    
    // Check for mutual exclusivity
    for (const [typeA, typeB] of mutuallyExclusive) {
      const contextA = contexts.find(c => c.context === typeA);
      const contextB = contexts.find(c => c.context === typeB);
      
      if (contextA && contextB && 
          contextA.confidence > 0.3 && 
          contextB.confidence > 0.3) {
        conflicts.push({
          contextIds: [typeA, typeB],
          type: 'mutually_exclusive',
          description: `${typeA} and ${typeB} are typically mutually exclusive situations`,
          resolution: `Clarify which context represents the current primary focus`,
          confidence: Math.min(contextA.confidence, contextB.confidence),
        });
      }
    }
    
    // Check for resource competition (time-intensive contexts)
    const timeIntensiveCategories = [
      ContextCategory.ENTRANCE_EXAM,
      ContextCategory.PROFESSIONAL_QUALIFICATION,
    ];
    
    const timeIntensiveContexts = contexts.filter(
      c => timeIntensiveCategories.includes(c.category) && c.confidence > 0.4
    );
    
    if (timeIntensiveContexts.length > 1) {
      const sorted = timeIntensiveContexts.sort((a, b) => b.confidence - a.confidence);
      const topTwo = sorted.slice(0, 2);
      
      conflicts.push({
        contextIds: topTwo.map(c => c.context),
        type: 'resource_competition',
        description: `Multiple time-intensive contexts detected: ${topTwo.map(c => c.context).join(', ')}`,
        resolution: `Assess whether the student is genuinely pursuing multiple paths or if one is exploratory`,
        confidence: (topTwo[0].confidence + topTwo[1].confidence) / 2,
      });
    }
    
    // Check for priority disputes (similar confidence)
    const sortedByConfidence = [...contexts].sort((a, b) => b.confidence - a.confidence);
    if (sortedByConfidence.length >= 2) {
      const topTwo = sortedByConfidence.slice(0, 2);
      const confidenceDiff = topTwo[0].confidence - topTwo[1].confidence;
      
      if (confidenceDiff < 0.15 && topTwo[1].confidence > 0.5) {
        conflicts.push({
          contextIds: topTwo.map(c => c.context),
          type: 'priority_dispute',
          description: `Similar confidence levels for ${topTwo[0].context} (${(topTwo[0].confidence * 100).toFixed(0)}%) and ${topTwo[1].context} (${(topTwo[1].confidence * 100).toFixed(0)}%)`,
          resolution: `Gather more specific evidence to distinguish primary focus`,
          confidence: 1 - confidenceDiff,
        });
      }
    }
    
    return conflicts;
  }
  
  /**
   * Calculate overall confidence across all context detections.
   */
  calculateOverallConfidence(contexts: DetectedContext[]): number {
    if (contexts.length === 0) {
      return 0;
    }
    
    // Weight by priority
    const weights: Record<ContextPriority, number> = {
      [ContextPriority.PRIMARY]: 1.0,
      [ContextPriority.SECONDARY]: 0.6,
      [ContextPriority.TERTIARY]: 0.3,
      [ContextPriority.INCIDENTAL]: 0.1,
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const context of contexts) {
      const weight = weights[context.priority];
      weightedSum += context.confidence * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
  
  /**
   * Update scoring configuration.
   */
  updateConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current scoring configuration.
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating scoring engine.
 */
export function createContextScoringEngine(
  config?: Partial<ScoringConfig>
): ContextScoringEngine {
  return new ContextScoringEngine(config);
}
