/**
 * CareerOS Career Confidence Module
 * 
 * Domain-specific confidence module for career fit calculations.
 * Delegates ALL calculations to ConfidenceAuthority.
 * 
 * @module confidence/modules/career
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

export interface CareerConfidenceInput {
  /** Student profile data */
  readonly profile: {
    readonly id: string;
    readonly interests: string[];
    readonly skills: string[];
    readonly values: string[];
    readonly preferences: Record<string, unknown>;
    readonly confidence: Confidence;
  };
  
  /** Career data */
  readonly career: {
    readonly id: string;
    readonly title: string;
    readonly requirements: string[];
    readonly skills: string[];
    readonly confidence: Confidence;
  };
  
  /** Evidence items */
  readonly evidence?: Array<{
    readonly type: string;
    readonly source: string;
    readonly quality: Confidence;
    readonly timestamp: number;
  }>;
}

export interface CareerConfidenceResult {
  readonly confidence: ConfidenceValue;
  readonly matchScore: number;
  readonly factorBreakdown: {
    readonly interestAlignment: number;
    readonly skillMatch: number;
    readonly valueFit: number;
    readonly dataConfidence: number;
  };
}

// ============================================================================
// CAREER CONFIDENCE MODULE
// ============================================================================

/**
 * @deprecated Use ConfidenceAuthority.calculateConfidence() with predictionType 'career-fit'
 * 
 * This module exists for backward compatibility only.
 * All calculations are delegated to ConfidenceAuthority.
 */
export class CareerConfidenceModule {
  private authority: ConfidenceAuthority;

  constructor(authority?: ConfidenceAuthority) {
    this.authority = authority ?? getConfidenceAuthority();
  }

  /**
   * Calculate confidence for career fit.
   * 
   * @deprecated Use ConfidenceAuthority.calculateConfidence()
   */
  async calculateConfidence(input: CareerConfidenceInput): Promise<CareerConfidenceResult> {
    console.warn(
      '[DEPRECATED] CareerConfidenceModule.calculateConfidence() is deprecated. ' +
      'Use ConfidenceAuthority.calculateConfidence() with predictionType "career-fit"'
    );

    // Calculate match components
    const interestAlignment = this.calculateInterestAlignment(
      input.profile.interests,
      input.career.requirements
    );

    const skillMatch = this.calculateSkillMatch(
      input.profile.skills,
      input.career.skills
    );

    const valueFit = this.calculateValueFit(
      input.profile.values,
      input.career
    );

    // Build evidence
    const evidence = input.evidence ?? [];

    // Call Confidence Authority
    const confidenceResult = await this.authority.calculateConfidence({
      requestId: `career-fit-${Date.now()}`,
      requestingSystem: 'CareerConfidenceModule',
      predictionType: 'career-fit',
      prediction: {
        profileId: input.profile.id,
        careerId: input.career.id,
        interestAlignment,
        skillMatch,
        valueFit,
      },
      evidence: evidence.map(e => ({
        type: e.type,
        source: e.source,
        quality: e.quality,
        timestamp: e.timestamp,
      })),
      context: {
        studentId: input.profile.id,
        careerId: input.career.id,
        timestamp: Date.now(),
        metadata: {
          interestAlignment,
          skillMatch,
          valueFit,
        },
      },
    });

    // Calculate match score
    const matchScore = this.calculateMatchScore(
      interestAlignment,
      skillMatch,
      valueFit,
      confidenceResult.value
    );

    return {
      confidence: confidenceResult,
      matchScore,
      factorBreakdown: {
        interestAlignment,
        skillMatch,
        valueFit,
        dataConfidence: confidenceResult.value,
      },
    };
  }

  /**
   * Calculate interest alignment.
   * 
   * NOTE: This is domain logic, NOT confidence calculation.
   * Confidence calculation is delegated to ConfidenceAuthority.
   */
  private calculateInterestAlignment(
    interests: string[],
    requirements: string[]
  ): number {
    if (interests.length === 0 || requirements.length === 0) {
      return 0.5;
    }

    const matches = interests.filter(i =>
      requirements.some(r => r.toLowerCase().includes(i.toLowerCase()))
    );

    return matches.length / Math.max(interests.length, requirements.length);
  }

  /**
   * Calculate skill match.
   * 
   * NOTE: This is domain logic, NOT confidence calculation.
   */
  private calculateSkillMatch(
    profileSkills: string[],
    careerSkills: string[]
  ): number {
    if (profileSkills.length === 0 || careerSkills.length === 0) {
      return 0.5;
    }

    const matches = profileSkills.filter(ps =>
      careerSkills.some(cs => cs.toLowerCase().includes(ps.toLowerCase()))
    );

    return matches.length / Math.max(profileSkills.length, careerSkills.length);
  }

  /**
   * Calculate value fit.
   * 
   * NOTE: This is domain logic, NOT confidence calculation.
   */
  private calculateValueFit(
    values: string[],
    career: { title: string; requirements: string[] }
  ): number {
    if (values.length === 0) {
      return 0.5;
    }

    // Simple heuristic: check if career aligns with values
    const alignment = values.filter(v =>
      career.title.toLowerCase().includes(v.toLowerCase()) ||
      career.requirements.some(r => r.toLowerCase().includes(v.toLowerCase()))
    );

    return Math.min(1, alignment.length / Math.max(1, values.length * 0.5));
  }

  /**
   * Calculate overall match score.
   * 
   * NOTE: This combines domain scores with confidence.
   */
  private calculateMatchScore(
    interestAlignment: number,
    skillMatch: number,
    valueFit: number,
    confidence: Confidence
  ): number {
    const domainScore = (interestAlignment + skillMatch + valueFit) / 3;
    // Weight by confidence
    return domainScore * (0.5 + 0.5 * confidence);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalModule: CareerConfidenceModule | null = null;

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export function getCareerConfidenceModule(): CareerConfidenceModule {
  console.warn(
    '[DEPRECATED] getCareerConfidenceModule() is deprecated. ' +
    'Use getConfidenceAuthority()'
  );
  
  if (!globalModule) {
    globalModule = new CareerConfidenceModule();
  }
  return globalModule;
}

export function resetCareerConfidenceModule(): void {
  globalModule = null;
}
