/**
 * CareerOS Archetype Explanation Engine - Types
 *
 * Phase 1.4: Archetype Explanation Engine
 *
 * Type definitions for explaining archetype results to students.
 *
 * @module archetype-explanation-types
 * @version 1.0.0
 */

import type { ArchetypeType } from '@/types/archetype-profile';
import type { ArchetypeConfidenceDetails } from './confidence-types';

/**
 * Complete archetype explanation.
 *
 * Human-readable explanation of archetype results.
 *
 * @interface ArchetypeExplanation
 */
export interface ArchetypeExplanation {
  /**
   * Unique identifier for the explanation.
   */
  readonly explanationId: string;

  /**
   * Primary archetype explanation.
   */
  readonly primaryExplanation: SingleArchetypeExplanation;

  /**
   * Secondary archetype explanation (if applicable).
   */
  readonly secondaryExplanation?: SingleArchetypeExplanation;

  /**
   * Mixed archetype explanation (if both present).
   */
  readonly mixedExplanation?: MixedArchetypeExplanation;

  /**
   * Summary narrative.
   */
  readonly summary: string;

  /**
   * Strengths analysis.
   */
  readonly strengths: StrengthsAnalysis;

  /**
   * Risks analysis.
   */
  readonly risks: RisksAnalysis;

  /**
   * Work environment analysis.
   */
  readonly workEnvironment: WorkEnvironmentAnalysis;

  /**
   * Career implications.
   */
  readonly careerImplications: CareerImplications;

  /**
   * Confidence explanation.
   */
  readonly confidenceExplanation: ConfidenceExplanation;

  /**
   * Actionable insights.
   */
  readonly actionableInsights: string[];

  /**
   * Timestamp.
   */
  readonly generatedAt: Date;
}

/**
 * Explanation for a single archetype.
 *
 * @interface SingleArchetypeExplanation
 */
export interface SingleArchetypeExplanation {
  /**
   * The archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Archetype score.
   */
  readonly score: number;

  /**
   * Core motivation narrative.
   */
  readonly motivationNarrative: string;

  /**
   * Behavioral description.
   */
  readonly behavioralDescription: string;

  /**
   * Decision-making style.
   */
  readonly decisionStyle: string;

  /**
   * Learning style.
   */
  readonly learningStyle: string;
}

/**
 * Mixed archetype explanation.
 *
 * Explains the combination of two archetypes.
 *
 * @interface MixedArchetypeExplanation
 */
export interface MixedArchetypeExplanation {
  /**
   * Primary archetype.
   */
  readonly primary: ArchetypeType;

  /**
   * Secondary archetype.
   */
  readonly secondary: ArchetypeType;

  /**
   * Combined narrative.
   */
  readonly combinedNarrative: string;

  /**
   * How archetypes complement each other.
   */
  readonly complementaryAspects: string[];

  /**
   * Potential tensions between archetypes.
   */
  readonly potentialTensions: string[];

  /**
   * Integrated description.
   */
  readonly integratedDescription: string;
}

/**
 * Strengths analysis.
 *
 * @interface StrengthsAnalysis
 */
export interface StrengthsAnalysis {
  /**
   * Natural advantages.
   */
  readonly naturalAdvantages: string[];

  /**
   * Behavioral strengths.
   */
  readonly behavioralStrengths: string[];

  /**
   * Learning strengths.
   */
  readonly learningStrengths: string[];

  /**
   * Decision-making strengths.
   */
  readonly decisionStrengths: string[];

  /**
   * Career-relevant strengths.
   */
  readonly careerStrengths: string[];
}

/**
 * Risks analysis.
 *
 * @interface RisksAnalysis
 */
export interface RisksAnalysis {
  /**
   * Common weaknesses.
   */
  readonly commonWeaknesses: string[];

  /**
   * Blind spots.
   */
  readonly blindSpots: string[];

  /**
   * Failure modes.
   */
  readonly failureModes: string[];

  /**
   * Career risks.
   */
  readonly careerRisks: string[];
}

/**
 * Work environment analysis.
 *
 * @interface WorkEnvironmentAnalysis
 */
export interface WorkEnvironmentAnalysis {
  /**
   * Environments where archetype thrives.
   */
  readonly thrivesIn: EnvironmentFactor[];

  /**
   * Environments where archetype struggles.
   */
  readonly strugglesIn: EnvironmentFactor[];

  /**
   * Ideal team composition.
   */
  readonly idealTeam: string;

  /**
   * Challenging team dynamics.
   */
  readonly challengingTeam: string;
}

/**
 * Environment factor.
 *
 * @interface EnvironmentFactor
 */
export interface EnvironmentFactor {
  /**
   * Factor name.
   */
  readonly factor: string;

  /**
   * Why this matters.
   */
  readonly whyItMatters: string;
}

/**
 * Career implications.
 *
 * @interface CareerImplications
 */
export interface CareerImplications {
  /**
   * Career strengths.
   */
  readonly careerStrengths: string[];

  /**
   * Career risks.
   */
  readonly careerRisks: string[];

  /**
   * Career opportunities.
   */
  readonly opportunities: string[];

  /**
   * Career cautions.
   */
  readonly cautions: string[];

  /**
   * Recommended career paths.
   */
  readonly recommendedPaths: string[];

  /**
   * Paths to approach with caution.
   */
  readonly cautionPaths: string[];
}

/**
 * Confidence explanation.
 *
 * @interface ConfidenceExplanation
 */
export interface ConfidenceExplanation {
  /**
   * Overall confidence summary.
   */
  readonly summary: string;

  /**
   * Why confidence is high (if applicable).
   */
  readonly highConfidenceReasons?: string[];

  /**
   * Why confidence is low (if applicable).
   */
  readonly lowConfidenceReasons?: string[];

  /**
   * Evidence summary.
   */
  readonly evidenceSummary: string;

  /**
   * Recommendations for improving confidence.
   */
  readonly improvementRecommendations?: string[];
}

/**
 * Narrative template.
 *
 * Template for generating archetype narratives.
 *
 * @interface NarrativeTemplate
 */
export interface NarrativeTemplate {
  /**
   * Archetype this template is for.
   */
  readonly archetype: ArchetypeType;

  /**
   * Core motivation statement.
   */
  readonly coreMotivation: string;

  /**
   * Behavioral pattern description.
   */
  readonly behavioralPattern: string;

  /**
   * Decision-making description.
   */
  readonly decisionMaking: string;

  /**
   * Learning approach description.
   */
  readonly learningApproach: string;

  /**
   * Work style description.
   */
  readonly workStyle: string;

  /**
   * Stress response description.
   */
  readonly stressResponse: string;
}

/**
 * Strength template.
 *
 * @interface StrengthTemplate
 */
export interface StrengthTemplate {
  /**
   * Archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Natural advantages.
   */
  readonly naturalAdvantages: string[];

  /**
   * Behavioral strengths.
   */
  readonly behavioralStrengths: string[];

  /**
   * Learning strengths.
   */
  readonly learningStrengths: string[];

  /**
   * Decision strengths.
   */
  readonly decisionStrengths: string[];

  /**
   * Career strengths.
   */
  readonly careerStrengths: string[];
}

/**
 * Risk template.
 *
 * @interface RiskTemplate
 */
export interface RiskTemplate {
  /**
   * Archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Common weaknesses.
   */
  readonly commonWeaknesses: string[];

  /**
   * Blind spots.
   */
  readonly blindSpots: string[];

  /**
   * Failure modes.
   */
  readonly failureModes: string[];

  /**
   * Career risks.
   */
  readonly careerRisks: string[];
}

/**
 * Environment template.
 *
 * @interface EnvironmentTemplate
 */
export interface EnvironmentTemplate {
  /**
   * Archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Thriving environments.
   */
  readonly thrivesIn: Array<{ factor: string; why: string }>;

  /**
   * Challenging environments.
   */
  readonly strugglesIn: Array<{ factor: string; why: string }>;

  /**
   * Ideal team description.
   */
  readonly idealTeam: string;

  /**
   * Challenging team description.
   */
  readonly challengingTeam: string;
}

/**
 * Career template.
 *
 * @interface CareerTemplate
 */
export interface CareerTemplate {
  /**
   * Archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Career strengths.
   */
  readonly careerStrengths: string[];

  /**
   * Career risks.
   */
  readonly careerRisks: string[];

  /**
   * Opportunities.
   */
  readonly opportunities: string[];

  /**
   * Cautions.
   */
  readonly cautions: string[];

  /**
   * Recommended paths.
   */
  readonly recommendedPaths: string[];

  /**
   * Caution paths.
   */
  readonly cautionPaths: string[];
}

/**
 * Archetype combination explanation.
 *
 * @interface ArchetypeCombination
 */
export interface ArchetypeCombination {
  /**
   * Primary archetype.
   */
  readonly primary: ArchetypeType;

  /**
   * Secondary archetype.
   */
  readonly secondary: ArchetypeType;

  /**
   * Combined narrative.
   */
  readonly combinedNarrative: string;

  /**
   * Complementary aspects.
   */
  readonly complementaryAspects: string[];

  /**
   * Tensions.
   */
  readonly tensions: string[];
}

/**
 * Explanation generation options.
 *
 * @interface ExplanationOptions
 */
export interface ExplanationOptions {
  /**
   * Include detailed analysis.
   */
  readonly detailed?: boolean;

  /**
   * Tone of explanation.
   */
  readonly tone?: 'PROFESSIONAL' | 'FRIENDLY' | 'DIRECT';

  /**
   * Focus areas.
   */
  readonly focusAreas?: Array<
    'STRENGTHS' | 'RISKS' | 'ENVIRONMENT' | 'CAREER' | 'CONFIDENCE'
  >;

  /**
   * Maximum length.
   */
  readonly maxLength?: number;
}

/**
 * Explanation result.
 *
 * @interface ExplanationResult
 */
export interface ExplanationResult {
  /**
   * Whether generation succeeded.
   */
  readonly success: boolean;

  /**
   * Explanation (if successful).
   */
  readonly explanation?: ArchetypeExplanation;

  /**
   * Error message (if failed).
   */
  readonly error?: string;
}
