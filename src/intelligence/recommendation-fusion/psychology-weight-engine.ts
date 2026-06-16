/**
 * Psychology Weight Engine
 *
 * Calculates influence from psychological factors:
 * - interests
 * - strengths
 * - motivation
 * - values
 * - personality
 * - emotional profile
 */

import {
  PsychologyWeight,
  FusionTimestamp,
  Weight,
  FusionConfig,
  DEFAULT_FUSION_CONFIG,
} from './fusion-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface PsychologyWeightConfig {
  // Component importance
  interestWeight: Weight;
  strengthWeight: Weight;
  motivationWeight: Weight;
  valueWeight: Weight;
  personalityWeight: Weight;
  emotionalWeight: Weight;

  // Quality thresholds
  minDataCompleteness: Weight;
  minRecency: Weight;

  // Boost factors
  strongInterestBoost: number;
  strengthAlignmentBoost: number;
  valueConflictPenalty: number;
}

export const DEFAULT_PSYCHOLOGY_CONFIG: PsychologyWeightConfig = {
  interestWeight: 0.25,
  strengthWeight: 0.20,
  motivationWeight: 0.20,
  valueWeight: 0.20,
  personalityWeight: 0.10,
  emotionalWeight: 0.05,

  minDataCompleteness: 0.6,
  minRecency: 0.5,

  strongInterestBoost: 1.2,
  strengthAlignmentBoost: 1.15,
  valueConflictPenalty: 0.8,
};

// ============================================================================
// INPUTS
// ============================================================================

export interface PsychologyProfile {
  interests: string[];
  strengths: string[];
  motivation: Record<string, number>;
  values: string[];
  personality: Record<string, number>;
  emotionalProfile: Record<string, number>;
  assessedAt?: Date;
}

export interface CareerPsychologyFit {
  careerId: string;
  careerName: string;
  interestAlignment: Weight;
  strengthAlignment: Weight;
  motivationAlignment: Weight;
  valueAlignment: Weight;
  personalityAlignment: Weight;
  emotionalFit: Weight;
}

// ============================================================================
// ENGINE
// ============================================================================

export class PsychologyWeightEngine {
  private config: PsychologyWeightConfig;

  constructor(config: Partial<PsychologyWeightConfig> = {}) {
    this.config = { ...DEFAULT_PSYCHOLOGY_CONFIG, ...config };
  }

  /**
   * Calculate psychology weight for a specific career recommendation
   */
  calculateWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit,
    options: {
      dataQuality?: Weight;
      recency?: Weight;
    } = {}
  ): PsychologyWeight {
    const timestamp = Date.now();

    // Calculate component scores
    const interests = this.calculateInterestWeight(profile, fit);
    const strengths = this.calculateStrengthWeight(profile, fit);
    const motivation = this.calculateMotivationWeight(profile, fit);
    const values = this.calculateValueWeight(profile, fit);
    const personality = this.calculatePersonalityWeight(profile, fit);
    const emotionalProfile = this.calculateEmotionalWeight(profile, fit);

    // Calculate quality metrics
    const dataQuality = options.dataQuality ?? this.assessDataQuality(profile);
    const recency = options.recency ?? this.assessRecency(profile);
    const completeness = this.assessCompleteness(profile);

    // Calculate total weight
    let totalWeight =
      interests * this.config.interestWeight +
      strengths * this.config.strengthWeight +
      motivation * this.config.motivationWeight +
      values * this.config.valueWeight +
      personality * this.config.personalityWeight +
      emotionalProfile * this.config.emotionalWeight;

    // Apply quality adjustments
    totalWeight *= dataQuality * recency * completeness;

    // Generate reasoning
    const reasoning = this.generateReasoning(profile, fit, {
      interests,
      strengths,
      motivation,
      values,
      personality,
      emotionalProfile,
    });

    return {
      engineId: 'psychology',
      timestamp,
      interests,
      strengths,
      motivation,
      values,
      personality,
      emotionalProfile,
      totalWeight: Math.min(1, Math.max(0, totalWeight)),
      dataQuality,
      recency,
      completeness,
      reasoning,
    };
  }

  /**
   * Calculate batch weights for multiple careers
   */
  calculateBatchWeights(
    profile: PsychologyProfile,
    fits: CareerPsychologyFit[],
    options?: { dataQuality?: Weight; recency?: Weight }
  ): Map<string, PsychologyWeight> {
    const weights = new Map<string, PsychologyWeight>();

    for (const fit of fits) {
      const weight = this.calculateWeight(profile, fit, options);
      weights.set(fit.careerId, weight);
    }

    return weights;
  }

  /**
   * Compare psychology fit across multiple careers
   */
  compareCareers(
    profile: PsychologyProfile,
    fits: CareerPsychologyFit[]
  ): Array<{
    careerId: string;
    careerName: string;
    overallFit: Weight;
    bestFactor: string;
    worstFactor: string;
  }> {
    const comparisons = fits.map(fit => {
      const weight = this.calculateWeight(profile, fit);

      const factors = [
        { name: 'interests', score: weight.interests },
        { name: 'strengths', score: weight.strengths },
        { name: 'motivation', score: weight.motivation },
        { name: 'values', score: weight.values },
        { name: 'personality', score: weight.personality },
        { name: 'emotional', score: weight.emotionalProfile },
      ];

      const bestFactor = factors.reduce((a, b) => (a.score > b.score ? a : b));
      const worstFactor = factors.reduce((a, b) => (a.score < b.score ? a : b));

      return {
        careerId: fit.careerId,
        careerName: fit.careerName,
        overallFit: weight.totalWeight,
        bestFactor: `${bestFactor.name} (${Math.round(bestFactor.score * 100)}%)`,
        worstFactor: `${worstFactor.name} (${Math.round(worstFactor.score * 100)}%)`,
      };
    });

    return comparisons.sort((a, b) => b.overallFit - a.overallFit);
  }

  // ============================================================================
  // PRIVATE CALCULATIONS
  // ============================================================================

  private calculateInterestWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    let weight = fit.interestAlignment;

    // Boost for strong interest alignment
    if (fit.interestAlignment > 0.8) {
      weight *= this.config.strongInterestBoost;
    }

    // Penalty if career doesn't match top interests
    if (profile.interests.length > 0 && fit.interestAlignment < 0.3) {
      weight *= 0.7;
    }

    return Math.min(1, weight);
  }

  private calculateStrengthWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    let weight = fit.strengthAlignment;

    // Boost for strength alignment
    if (fit.strengthAlignment > 0.8) {
      weight *= this.config.strengthAlignmentBoost;
    }

    return Math.min(1, weight);
  }

  private calculateMotivationWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    const weight = fit.motivationAlignment;

    // Check for motivation conflicts
    const motivations = Object.entries(profile.motivation);
    const hasStrongMotivation = motivations.some(([_, score]) => score > 0.8);

    if (hasStrongMotivation && weight < 0.4) {
      return weight * 0.8;
    }

    return weight;
  }

  private calculateValueWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    let weight = fit.valueAlignment;

    // Check for value conflicts
    const hasValueConflict = this.detectValueConflict(profile, fit);
    if (hasValueConflict) {
      weight *= this.config.valueConflictPenalty;
    }

    return Math.min(1, weight);
  }

  private calculatePersonalityWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    return fit.personalityAlignment;
  }

  private calculateEmotionalWeight(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): Weight {
    return fit.emotionalFit;
  }

  // ============================================================================
  // QUALITY ASSESSMENT
  // ============================================================================

  private assessDataQuality(profile: PsychologyProfile): Weight {
    const checks = [
      profile.interests.length > 0,
      profile.strengths.length > 0,
      Object.keys(profile.motivation).length > 0,
      profile.values.length > 0,
      Object.keys(profile.personality).length > 0,
      Object.keys(profile.emotionalProfile).length > 0,
    ];

    const passedChecks = checks.filter(Boolean).length;
    return passedChecks / checks.length;
  }

  private assessRecency(profile: PsychologyProfile): Weight {
    if (!profile.assessedAt) return 0.5;

    const age = Date.now() - profile.assessedAt.getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if (age < oneYear) return 1.0;
    if (age < 2 * oneYear) return 0.8;
    if (age < 3 * oneYear) return 0.6;
    return 0.4;
  }

  private assessCompleteness(profile: PsychologyProfile): Weight {
    const components = [
      { data: profile.interests, minItems: 3 },
      { data: profile.strengths, minItems: 3 },
      { data: Object.keys(profile.motivation), minItems: 3 },
      { data: profile.values, minItems: 3 },
      { data: Object.keys(profile.personality), minItems: 3 },
      { data: Object.keys(profile.emotionalProfile), minItems: 2 },
    ];

    const completenessScores: number[] = components.map(component => {
      if (component.data.length >= component.minItems) return 1.0;
      if (component.data.length >= component.minItems / 2) return 0.7;
      if (component.data.length > 0) return 0.4;
      return 0.0;
    });

    return (
      completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length
    );
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  private detectValueConflict(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit
  ): boolean {
    // Simple conflict detection based on low value alignment
    // In production, this would use a value conflict matrix
    return fit.valueAlignment < 0.3 && profile.values.length > 0;
  }

  // ============================================================================
  // REASONING GENERATION
  // ============================================================================

  private generateReasoning(
    profile: PsychologyProfile,
    fit: CareerPsychologyFit,
    scores: {
      interests: Weight;
      strengths: Weight;
      motivation: Weight;
      values: Weight;
      personality: Weight;
      emotionalProfile: Weight;
    }
  ): string[] {
    const reasoning: string[] = [];

    // Interest reasoning
    if (scores.interests > 0.8) {
      reasoning.push(
        `Strong interest alignment: This career matches your core interests.`
      );
    } else if (scores.interests < 0.4) {
      reasoning.push(
        `Interest mismatch: This career doesn't align well with your stated interests.`
      );
    }

    // Strength reasoning
    if (scores.strengths > 0.8) {
      reasoning.push(
        `Strength match: Your abilities align well with this career's requirements.`
      );
    }

    // Value reasoning
    if (scores.values > 0.8) {
      reasoning.push(
        `Value alignment: This career supports your core values.`
      );
    } else if (scores.values < 0.4) {
      reasoning.push(
        `Value conflict: This career may conflict with your values.`
      );
    }

    // Motivation reasoning
    if (scores.motivation > 0.8) {
      reasoning.push(
        `High motivation fit: This career aligns with what motivates you.`
      );
    }

    return reasoning;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getConfig(): PsychologyWeightConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<PsychologyWeightConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default PsychologyWeightEngine;
