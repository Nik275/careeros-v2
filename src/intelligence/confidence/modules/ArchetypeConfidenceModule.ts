/**
 * CareerOS Archetype Confidence Module
 * 
 * Domain-specific confidence module for archetype calculations.
 * Delegates ALL calculations to ConfidenceAuthority.
 * 
 * @module confidence/modules/archetype
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

export interface ArchetypeConfidenceInput {
  /** Archetype analysis data */
  readonly archetypeData: {
    readonly archetypeId: string;
    readonly patternStrengths: Record<string, number>;
    readonly evidenceItems: Array<{
      readonly type: string;
      readonly source: string;
      readonly relevance: number;
    }>;
    readonly stabilityMetrics: {
      readonly consistencyScore: number;
      readonly temporalStability: number;
      readonly crossValidationScore: number;
    };
  };
  
  /** Analysis confidence factors */
  readonly analysisFactors: {
    readonly evidenceScore: number;
    readonly stabilityScore: number;
    readonly coverageScore: number;
    readonly consistencyScore: number;
    readonly separationScore: number;
  };
}

export interface ArchetypeConfidenceResult {
  readonly confidence: ConfidenceValue;
  readonly archetypeConfidence: number;
  readonly archetypeId: string;
}

// ============================================================================
// ARCHETYPE CONFIDENCE MODULE
// ============================================================================

/**
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'archetype'
 * 
 * This module exists for backward compatibility only.
 * All calculations are delegated to ConfidenceAuthority.
 */
export class ArchetypeConfidenceModule {
  private authority: ConfidenceAuthority;

  constructor(authority?: ConfidenceAuthority) {
    this.authority = authority ?? getConfidenceAuthority();
  }

  /**
   * Calculate confidence for archetype assignment.
   * 
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  async calculateConfidence(
    input: ArchetypeConfidenceInput
  ): Promise<ArchetypeConfidenceResult> {
    console.warn(
      '[DEPRECATED] ArchetypeConfidenceModule.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "archetype"'
    );

    const { analysisFactors, archetypeData } = input;

    // Call Confidence Authority
    const confidenceResult = await this.authority.calculateConfidence({
      requestId: `archetype-${Date.now()}`,
      requestingSystem: 'ArchetypeConfidenceModule',
      predictionType: 'archetype',
      prediction: {
        archetypeId: archetypeData.archetypeId,
        patternStrengths: archetypeData.patternStrengths,
      },
      evidence: archetypeData.evidenceItems.map(e => ({
        type: e.type,
        source: e.source,
        quality: Math.max(0, Math.min(1, e.relevance)),
        timestamp: Date.now(),
      })),
      context: {
        timestamp: Date.now(),
        metadata: {
          stabilityMetrics: archetypeData.stabilityMetrics,
          analysisFactors,
        },
      },
    });

    // Calculate archetype confidence (separate from system confidence)
    const archetypeConfidence = this.calculateArchetypeConfidence(
      archetypeData,
      analysisFactors
    );

    return {
      confidence: confidenceResult,
      archetypeConfidence,
      archetypeId: archetypeData.archetypeId,
    };
  }

  /**
   * Calculate archetype confidence score.
   * 
   * NOTE: This is domain logic, NOT system confidence.
   */
  private calculateArchetypeConfidence(
    archetypeData: ArchetypeConfidenceInput['archetypeData'],
    factors: ArchetypeConfidenceInput['analysisFactors']
  ): number {
    const weights = {
      evidence: 0.25,
      stability: 0.20,
      coverage: 0.20,
      consistency: 0.20,
      separation: 0.15,
    };

    const weightedScore =
      factors.evidenceScore * weights.evidence +
      factors.stabilityScore * weights.stability +
      factors.coverageScore * weights.coverage +
      factors.consistencyScore * weights.consistency +
      factors.separationScore * weights.separation;

    // Adjust by pattern strengths
    const patternStrengths = Object.values(archetypeData.patternStrengths);
    const avgPatternStrength = patternStrengths.length > 0
      ? patternStrengths.reduce((sum, s) => sum + s, 0) / patternStrengths.length
      : 0.5;

    return weightedScore * (0.7 + 0.3 * avgPatternStrength);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalModule: ArchetypeConfidenceModule | null = null;

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export function getArchetypeConfidenceModule(): ArchetypeConfidenceModule {
  console.warn(
    '[DEPRECATED] getArchetypeConfidenceModule() is deprecated. ' +
    'Use getConfidenceAuthority()'
  );
  
  if (!globalModule) {
    globalModule = new ArchetypeConfidenceModule();
  }
  return globalModule;
}

export function resetArchetypeConfidenceModule(): void {
  globalModule = null;
}
