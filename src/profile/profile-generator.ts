/**
 * CareerOS Student Profile Generator - Profile Generator
 *
 * Phase B.3: Profile Generation Layer
 *
 * Orchestrates the transformation of assessment results into
 * complete StudentLifeProfile with insights and archetypes.
 *
 * @module profile-generator
 * @version 1.0.0
 */

import type {
  StudentLifeProfile,
  CognitiveProfile,
  MotivationProfile,
  LifestyleProfile,
  RiskProfile,
  WorkEnvironmentProfile,
  ValuesProfile,
  StrengthProfile,
  WeaknessProfile,
  ConstraintsProfile,
  ConfidenceProfile,
} from '../types/student-life-profile';

import type {
  AssessmentResult,
  GeneratedProfile,
  ProfileGenerationConfig,
} from './profile-types';
import { DEFAULT_PROFILE_CONFIG } from './profile-types';

import { ProfileSynthesizer } from './profile-synthesizer';
import { ProfileInterpreter } from './profile-interpreter';
import { ProfileInsightsEngine } from './profile-insights-engine';

/**
 * Orchestrates profile generation from assessment results.
 *
 * The ProfileGenerator coordinates synthesis, interpretation,
 * and insight generation to produce complete profiles.
 */
export class ProfileGenerator {
  private synthesizer: ProfileSynthesizer;
  private interpreter: ProfileInterpreter;
  private insightsEngine: ProfileInsightsEngine;
  private config: ProfileGenerationConfig;

  constructor(config?: Partial<ProfileGenerationConfig>) {
    this.config = { ...DEFAULT_PROFILE_CONFIG, ...config };
    this.synthesizer = new ProfileSynthesizer();
    this.interpreter = new ProfileInterpreter();
    this.insightsEngine = new ProfileInsightsEngine();
  }

  /**
   * Generate complete StudentLifeProfile from assessment results.
   *
   * @param result - Assessment results with dimension scores
   * @returns Complete StudentLifeProfile
   */
  generateProfile(result: AssessmentResult): StudentLifeProfile {
    // Synthesize dimension scores into profile components
    const cognitive = this.synthesizer.synthesizeCognitiveProfile(result);
    const motivation = this.synthesizer.synthesizeMotivationProfile(result);
    const lifestyle = this.synthesizer.synthesizeLifestyleProfile(result);
    const risk = this.synthesizer.synthesizeRiskProfile(result);
    const workEnvironment = this.synthesizer.synthesizeWorkEnvironmentProfile(result);
    const values = this.synthesizer.synthesizeValuesProfile(result);

    // Identify strengths and weaknesses
    const strengths = this.synthesizer.identifyStrengths(result, this.config);
    const weaknesses = this.synthesizer.identifyWeaknesses(result, this.config);

    // Build constraints (may be partially from assessment, partially defaults)
    const constraints = this.synthesizer.synthesizeConstraints(result);

    // Build confidence profile
    const confidence = this.buildConfidenceProfile(result);

    return {
      cognitive,
      motivation,
      lifestyle,
      risk,
      workEnvironment,
      values,
      strengths,
      weaknesses,
      constraints,
      confidence,
    };
  }

  /**
   * Generate complete profile with insights and archetypes.
   *
   * @param result - Assessment results
   * @returns Generated profile with all components
   */
  generateCompleteProfile(result: AssessmentResult): GeneratedProfile {
    const profile = this.generateProfile(result);

    // Generate interpretations
    const interpretation = this.interpreter.generateInterpretation(profile);

    // Identify strengths with full details
    const identifiedStrengths = this.interpreter.identifyDetailedStrengths(
      result,
      this.config
    );

    // Identify weaknesses with full details
    const identifiedWeaknesses = this.interpreter.identifyDetailedWeaknesses(
      result,
      this.config
    );

    // Determine archetype
    const archetype = this.interpreter.determineArchetype(result);

    // Generate insights
    const insights = this.insightsEngine.generateInsights(profile, result);

    return {
      source: result,
      interpretation,
      strengths: {
        primary: identifiedStrengths.slice(0, this.config.primaryStrengthCount),
        secondary: identifiedStrengths.slice(
          this.config.primaryStrengthCount,
          this.config.primaryStrengthCount + this.config.secondaryStrengthCount
        ),
      },
      weaknesses: identifiedWeaknesses.slice(0, this.config.growthAreaCount),
      archetype,
      insights,
      metadata: {
        generatedAt: new Date(),
        profileVersion: '1.0.0',
        generationConfidence: result.confidence.score,
        evidenceCount: result.dimensionScores.size,
      },
    };
  }

  /**
   * Build confidence profile from assessment.
   */
  private buildConfidenceProfile(result: AssessmentResult): ConfidenceProfile {
    return {
      profileConfidence: result.confidence.score,
      assessmentCompleteness: result.confidence.coverageScore ?? 50,
    };
  }

  /**
   * Get dimension score with fallback.
   */
  getDimensionScore(result: AssessmentResult, dimension: string): number {
    return result.dimensionScores.get(dimension)?.score ?? 50;
  }

  /**
   * Get dimension confidence.
   */
  getDimensionConfidence(result: AssessmentResult, dimension: string): number {
    return result.dimensionScores.get(dimension)?.confidence ?? 0;
  }
}

/**
 * Factory function for ProfileGenerator.
 */
export function createProfileGenerator(
  config?: Partial<ProfileGenerationConfig>
): ProfileGenerator {
  return new ProfileGenerator(config);
}
