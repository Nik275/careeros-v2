/**
 * CareerOS Archetype Confidence Engine
 *
 * Phase 1.3: Archetype Confidence Engine
 *
 * Main orchestrator for measuring archetype prediction trustworthiness.
 *
 * @module archetype-confidence-engine
 * @version 2.0.0
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'archetype'
 */

import type {
  ArchetypeProfile,
  ArchetypeType,
  ArchetypeScore,
} from '@/types/archetype-profile';
import type { ArchetypeSignal } from './archetype-types';
import type {
  ArchetypeConfidenceDetails,
  ConfidenceCalculationInput,
  StabilityAnalysis,
  EvidenceCollection,
  SeparationAnalysis,
  ConsistencyAnalysis,
  CoverageAnalysis,
  CompletenessAnalysis,
} from './confidence-types';

import { createConfidenceCalculator } from './confidence-calculator';
import { createStabilityEngine } from './stability-engine';
import { createEvidenceEngine } from './evidence-engine';
import { getConfidenceAuthority } from '../intelligence/confidence';
import type { ConfidenceRequest } from '../intelligence/confidence';

/**
 * Main Archetype Confidence Engine.
 *
 * Orchestrates confidence measurement for archetype predictions.
 *
 * @deprecated Use ConfidenceAuthority directly. This engine now delegates to the Constitutional Confidence Authority.
 */
export class ArchetypeConfidenceEngine {
  /** Confidence calculator */
  private calculator = createConfidenceCalculator();

  /** Stability engine */
  private stabilityEngine = createStabilityEngine();

  /** Evidence engine */
  private evidenceEngine = createEvidenceEngine();

  /** Constitutional Confidence Authority */
  private authority = getConfidenceAuthority();

  /**
   * Calculates comprehensive confidence for an archetype profile.
   *
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  calculateConfidence(
    profile: ArchetypeProfile,
    signals: ArchetypeSignal[],
    assessmentReliability: Record<string, number> = {}
  ): ArchetypeConfidenceDetails {
    console.warn(
      '[DEPRECATED] ArchetypeConfidenceEngine.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "archetype"'
    );

    const input: ConfidenceCalculationInput = {
      archetypeScores: profile.archetypeScores,
      signals,
      profileReliability: profile.confidence.confidenceScore,
      assessmentReliability,
      primaryArchetype: profile.primaryArchetype,
      secondaryArchetype: profile.secondaryArchetype,
    };

    const result = this.calculator.calculate(input);

    if (!result.success || !result.confidence) {
      // Return fallback confidence
      return this.createFallbackConfidence(profile);
    }

    // Add constitutional confidence (0.0-1.0)
    const constitutionalConfidence = result.confidence.confidenceScore / 100;

    return {
      ...result.confidence,
      constitutionalConfidence,
      // confidenceLevel removed - no longer using enum
    } as ArchetypeConfidenceDetails;
  }

  /**
   * Creates fallback confidence for error cases.
   */
  private createFallbackConfidence(
    profile: ArchetypeProfile
  ): ArchetypeConfidenceDetails {
    const confidenceScore = profile.confidence.confidenceScore;

    return {
      confidenceScore,
      constitutionalConfidence: confidenceScore / 100,
      // confidenceLevel removed - use constitutionalConfidence
      stabilityScore: 50,
      evidenceScore: 50,
      coverageScore: 50,
      consistencyScore: 50,
      separationScore: 50,
      completenessScore: 50,
    } as ArchetypeConfidenceDetails;
  }

  /**
   * Analyzes stability of archetype assignment.
   */
  analyzeStability(
    profile: ArchetypeProfile,
    signals: ArchetypeSignal[]
  ): StabilityAnalysis {
    return this.stabilityEngine.analyzeStability(
      profile.primaryArchetype,
      profile.secondaryArchetype,
      profile.archetypeScores,
      signals
    );
  }

  /**
   * Tracks evidence for archetype assignment.
   */
  trackEvidence(signals: ArchetypeSignal[]): EvidenceCollection[] {
    const evidence = this.evidenceEngine.signalsToEvidence(signals);
    return this.evidenceEngine.createCollections(evidence);
  }

  /**
   * Analyzes archetype separation.
   */
  analyzeSeparation(profile: ArchetypeProfile): SeparationAnalysis {
    return this.stabilityEngine.analyzeSeparation(profile.archetypeScores);
  }

  /**
   * Analyzes signal consistency.
   */
  analyzeConsistency(signals: ArchetypeSignal[]): ConsistencyAnalysis {
    return this.stabilityEngine.analyzeConsistency(signals);
  }

  /**
   * Analyzes coverage.
   */
  analyzeCoverage(signals: ArchetypeSignal[]): CoverageAnalysis {
    return this.calculator.analyzeCoverage(signals);
  }

  /**
   * Analyzes completeness.
   */
  analyzeCompleteness(
    assessmentReliability: Record<string, number>
  ): CompletenessAnalysis {
    return this.calculator.analyzeCompleteness(assessmentReliability);
  }

  /**
   * Validates confidence sufficiency.
   */
  validateConfidence(confidence: ArchetypeConfidenceDetails): {
    valid: boolean;
    concerns: string[];
  } {
    const concerns: string[] = [];

    // Use constitutional confidence (0.0-1.0) or fall back to 0-100 score
    const conf = (confidence as any).constitutionalConfidence ?? confidence.confidenceScore / 100;

    if (conf < 0.50) {
      concerns.push(`Low overall confidence: ${Math.round(conf * 100)}%`);
    }

    if (confidence.stabilityScore < 50) {
      concerns.push(
        `Low stability: ${confidence.stabilityScore} - assignment may change`
      );
    }

    if (confidence.evidenceScore < 50) {
      concerns.push(
        `Weak evidence: ${confidence.evidenceScore} - more data needed`
      );
    }

    if (confidence.separationScore < 40) {
      concerns.push(
        `Poor archetype separation: ${confidence.separationScore} - archetypes are close`
      );
    }

    if (confidence.coverageScore < 50) {
      concerns.push(
        `Low coverage: ${confidence.coverageScore} - limited archetype exploration`
      );
    }

    return {
      valid: concerns.length === 0,
      concerns,
    };
  }

  /**
   * Generates recommendations for improving confidence.
   */
  generateRecommendations(
    confidence: ArchetypeConfidenceDetails
  ): string[] {
    const recommendations: string[] = [];

    if (confidence.evidenceScore < 60) {
      recommendations.push(
        'Complete additional assessments to strengthen evidence'
      );
    }

    if (confidence.coverageScore < 60) {
      recommendations.push(
        'Explore more career archetypes to improve coverage'
      );
    }

    if (confidence.separationScore < 50) {
      recommendations.push(
        'Primary archetype is not clearly distinct - consider your preferences more carefully'
      );
    }

    if (confidence.stabilityScore < 60) {
      recommendations.push(
        'Results may change with additional data - revisit after completing more assessments'
      );
    }

    if (confidence.consistencyScore < 60) {
      recommendations.push(
        'Some responses appear inconsistent - review your answers'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Confidence is strong - results are reliable for decision-making'
      );
    }

    return recommendations;
  }

  /**
   * Compares confidence between two profiles.
   */
  compareConfidence(
    confidence1: ArchetypeConfidenceDetails,
    confidence2: ArchetypeConfidenceDetails
  ): {
    moreConfident: 'FIRST' | 'SECOND' | 'TIE';
    difference: number;
    factors: string[];
  } {
    // Use constitutional confidence (0.0-1.0) when available
    const c1 = (confidence1 as any).constitutionalConfidence ?? confidence1.confidenceScore / 100;
    const c2 = (confidence2 as any).constitutionalConfidence ?? confidence2.confidenceScore / 100;

    const diff = c1 - c2;
    const moreConfident =
      diff > 0.05 ? 'FIRST' : diff < -0.05 ? 'SECOND' : 'TIE';

    const factors: string[] = [];

    if (confidence1.evidenceScore > confidence2.evidenceScore + 10) {
      factors.push('First profile has stronger evidence');
    } else if (confidence2.evidenceScore > confidence1.evidenceScore + 10) {
      factors.push('Second profile has stronger evidence');
    }

    if (confidence1.stabilityScore > confidence2.stabilityScore + 10) {
      factors.push('First profile is more stable');
    } else if (confidence2.stabilityScore > confidence1.stabilityScore + 10) {
      factors.push('Second profile is more stable');
    }

    if (confidence1.separationScore > confidence2.separationScore + 10) {
      factors.push('First profile has clearer archetype separation');
    } else if (
      confidence2.separationScore >
      confidence1.separationScore + 10
    ) {
      factors.push('Second profile has clearer archetype separation');
    }

    return {
      moreConfident,
      difference: Math.abs(diff),
      factors,
    };
  }

  /**
   * Gets confidence for specific archetype.
   */
  getArchetypeConfidence(
    profile: ArchetypeProfile,
    archetype: ArchetypeType
  ): ArchetypeScore | undefined {
    return profile.archetypeScores.find((s) => s.archetype === archetype);
  }

  /**
   * Checks if confidence meets threshold.
   */
  meetsThreshold(
    confidence: ArchetypeConfidenceDetails,
    threshold: number
  ): boolean {
    // Accept both 0-100 and 0.0-1.0 thresholds
    const normalizedThreshold = threshold > 1 ? threshold / 100 : threshold;
    const conf = (confidence as any).constitutionalConfidence ?? confidence.confidenceScore / 100;
    return conf >= normalizedThreshold;
  }

  /**
   * Estimates confidence improvement from additional data.
   */
  estimateImprovement(
    currentConfidence: ArchetypeConfidenceDetails,
    additionalAssessments: number
  ): number {
    const baseImprovement = additionalAssessments * 8;
    const diminishingReturns = Math.max(0, currentConfidence.confidenceScore - 60) * 0.3;
    const estimatedImprovement = Math.max(0, baseImprovement - diminishingReturns);

    return Math.min(100, currentConfidence.confidenceScore + estimatedImprovement);
  }
}

/**
 * Creates default archetype confidence engine.
 * @deprecated Use getConfidenceAuthority() directly
 */
export function createArchetypeConfidenceEngine(): ArchetypeConfidenceEngine {
  console.warn('[DEPRECATED] createArchetypeConfidenceEngine() is deprecated. Use getConfidenceAuthority().');
  return new ArchetypeConfidenceEngine();
}

/**
 * Quick confidence check.
 * @deprecated Use ConfidenceAuthority.calculateConfidence()
 */
export function quickConfidenceCheck(
  profile: ArchetypeProfile,
  signals: ArchetypeSignal[]
): number {
  console.warn('[DEPRECATED] quickConfidenceCheck() is deprecated.');
  const engine = createArchetypeConfidenceEngine();
  const confidence = engine.calculateConfidence(profile, signals);
  return confidence.confidenceScore;
}

/**
 * Default exports for the confidence module.
 * @deprecated Import from @/intelligence/confidence instead
 */
export { ConfidenceCalculator, createConfidenceCalculator } from './confidence-calculator';
export { StabilityEngine, createStabilityEngine } from './stability-engine';
export { EvidenceEngine, createEvidenceEngine } from './evidence-engine';
export * from './confidence-types';
