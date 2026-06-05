/**
 * CareerOS Student Profile Generator - Profile Types
 *
 * Phase B.3: Profile Generation Layer
 *
 * Type definitions for profile synthesis, interpretation, and insights.
 *
 * @module profile-types
 * @version 1.0.0
 */

import type { DimensionScoreMap, AssessmentConfidence } from '../assessment/assessment-types';

/**
 * Input to profile generation from assessment results.
 */
export interface AssessmentResult {
  /** Dimension scores from assessment */
  dimensionScores: DimensionScoreMap;

  /** Assessment confidence metrics */
  confidence: AssessmentConfidence;

  /** Assessment timestamp */
  assessedAt: Date;
}

/**
 * Synthesized profile interpretation.
 */
export interface ProfileInterpretation {
  /** Cognitive style summary */
  cognitiveStyle: string;

  /** Motivational driver summary */
  motivationalProfile: string;

  /** Work preference summary */
  workStyle: string;

  /** Risk tolerance summary */
  riskProfile: string;

  /** Values alignment summary */
  valuesSummary: string;
}

/**
 * Identified strength with supporting evidence.
 */
export interface IdentifiedStrength {
  /** Strength name */
  name: string;

  /** Primary dimension driving this strength */
  dimension: string;

  /** Score for this dimension (0-100) */
  score: number;

  /** Evidence from assessment */
  evidence: string[];

  /** How this strength manifests */
  manifestation: string;

  /** Confidence in this identification */
  confidence: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

/**
 * Identified weakness or development area.
 */
export interface IdentifiedWeakness {
  /** Weakness/development area name */
  name: string;

  /** Primary dimension */
  dimension: string;

  /** Score for this dimension (0-100) */
  score: number;

  /** Risk or implication */
  risk: string;

  /** Suggested development focus */
  developmentFocus: string;

  /** Impact on career */
  careerImpact: string;

  /** Confidence in this identification */
  confidence: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

/**
 * Student archetype classification.
 */
export interface StudentArchetype {
  /** Archetype identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Brief description */
  description: string;

  /** Key characteristics */
  characteristics: string[];

  /** Typical strengths */
  typicalStrengths: string[];

  /** Potential challenges */
  potentialChallenges: string[];

  /** Match score for this profile */
  matchScore: number;

  /** Confidence in archetype assignment */
  confidence: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

/**
 * Profile insights for career guidance.
 */
export interface ProfileInsights {
  /** Key advantages in career contexts */
  keyAdvantages: Array<{
    advantage: string;
    explanation: string;
    applicableContexts: string[];
    confidence: number;
  }>;

  /** Growth areas to develop */
  growthAreas: Array<{
    area: string;
    importance: 'LOW' | 'MEDIUM' | 'HIGH';
    developmentPath: string;
    timeframe: string;
    confidence: number;
  }>;

  /** Ideal work conditions */
  idealWorkConditions: {
    environment: string;
    pace: string;
    structure: string;
    socialDynamic: string;
    autonomy: string;
    confidence: number;
  };

  /** Career risk factors */
  careerRiskFactors: Array<{
    risk: string;
    likelihood: 'LOW' | 'MEDIUM' | 'HIGH';
    mitigation: string;
    confidence: number;
  }>;

  /** Decision making style */
  decisionMakingStyle: {
    approach: string;
    speed: string;
    informationPreference: string;
    riskTolerance: string;
    confidence: number;
  };

  /** Learning style */
  learningStyle: {
    primary: string;
    secondary: string;
    optimalEnvironment: string;
    pace: string;
    confidence: number;
  };
}

/**
 * Complete generated profile with all components.
 */
export interface GeneratedProfile {
  /** Assessment source data */
  source: AssessmentResult;

  /** Profile interpretation narratives */
  interpretation: ProfileInterpretation;

  /** Identified strengths */
  strengths: {
    primary: IdentifiedStrength[];
    secondary: IdentifiedStrength[];
  };

  /** Identified weaknesses/development areas */
  weaknesses: IdentifiedWeakness[];

  /** Archetype classification */
  archetype: StudentArchetype;

  /** Career guidance insights */
  insights: ProfileInsights;

  /** Generation metadata */
  metadata: {
    generatedAt: Date;
    profileVersion: string;
    generationConfidence: number;
    evidenceCount: number;
  };
}

/**
 * Archetype definition for matching.
 */
export interface ArchetypeDefinition {
  /** Archetype ID */
  id: string;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Required dimension patterns */
  dimensionPatterns: Array<{
    dimension: string;
    minScore: number;
    maxScore: number;
    weight: number;
  }>;

  /** Characteristics */
  characteristics: string[];

  /** Typical strengths */
  typicalStrengths: string[];

  /** Potential challenges */
  potentialChallenges: string[];
}

/**
 * Profile generation configuration.
 */
export interface ProfileGenerationConfig {
  /** Minimum confidence for strength identification */
  minStrengthConfidence: number;

  /** Minimum confidence for weakness identification */
  minWeaknessConfidence: number;

  /** Number of primary strengths to identify */
  primaryStrengthCount: number;

  /** Number of secondary strengths to identify */
  secondaryStrengthCount: number;

  /** Number of growth areas to identify */
  growthAreaCount: number;

  /** Confidence threshold for insights */
  insightConfidenceThreshold: number;
}

/**
 * Default profile generation configuration.
 */
export const DEFAULT_PROFILE_CONFIG: ProfileGenerationConfig = {
  minStrengthConfidence: 60,
  minWeaknessConfidence: 50,
  primaryStrengthCount: 3,
  secondaryStrengthCount: 3,
  growthAreaCount: 3,
  insightConfidenceThreshold: 50,
};

/**
 * Confidence level for any profile component.
 */
export interface ComponentConfidence {
  /** Numeric score 0-100 */
  score: number;

  /** Categorical level */
  level: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Evidence count */
  evidenceCount: number;

  /** Explanation of confidence calculation */
  explanation: string;
}
