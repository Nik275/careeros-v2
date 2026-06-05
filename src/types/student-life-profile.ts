/**
 * CareerOS - Student Life Profile Foundation
 *
 * Phase A.1: Core Domain Model for Student Intelligence
 *
 * This module defines the foundational type system for representing a student's
 * psychological, motivational, and practical profile. All numeric values are
 * normalized to a 0-100 scale unless otherwise specified.
 *
 * @module student-life-profile
 * @version 1.0.0
 */

/**
 * Root profile aggregating all dimensions of student intelligence.
 *
 * The StudentLifeProfile serves as the central intelligence model for CareerOS,
 * powering career recommendations, fit analysis, decision intelligence, and
 * future forecasting. Each sub-profile captures a distinct dimension relevant
 * to career matching and life planning.
 *
 * @example
 * const profile: StudentLifeProfile = {
 *   cognitive: { analytical: 85, creative: 72, ... },
 *   motivation: { achievement: 90, mastery: 78, ... },
 *   lifestyle: { workLifeBalance: 80, incomePriority: 65, ... },
 *   // ... other profiles
 * };
 */
export interface StudentLifeProfile {
  /** Cognitive capabilities and thinking preferences */
  cognitive: CognitiveProfile;

  /** Motivational drivers and career energizers */
  motivation: MotivationProfile;

  /** Lifestyle preferences and work-life priorities */
  lifestyle: LifestyleProfile;

  /** Risk tolerance and uncertainty comfort */
  risk: RiskProfile;

  /** Preferred work environment characteristics */
  workEnvironment: WorkEnvironmentProfile;

  /** Core values and priorities */
  values: ValuesProfile;

  /** Identified strengths and competencies */
  strengths: StrengthProfile;

  /** Development areas and challenges */
  weaknesses: WeaknessProfile;

  /** External constraints and limitations */
  constraints: ConstraintsProfile;

  /** Confidence and completeness metrics */
  confidence: ConfidenceProfile;
}

/**
 * Cognitive capabilities and thinking style preferences.
 *
 * Captures the student's natural cognitive strengths across multiple
 * dimensions. These traits influence which career domains will feel
 * natural versus effortful.
 *
 * All scores normalized to 0-100 scale:
 * - 0-30: Development area
 * - 31-50: Moderate capability
 * - 51-70: Strength
 * - 71-90: Strong strength
 * - 91-100: Exceptional capability
 */
export interface CognitiveProfile {
  /** Ability to break down complex problems logically (0-100) */
  analytical: number;

  /** Capacity for original ideation and innovation (0-100) */
  creative: number;

  /** Preference for structured, methodical approaches (0-100) */
  systematic: number;

  /** Ability to conceptualize abstract concepts and theories (0-100) */
  abstractThinking: number;

  /** Proficiency with language, communication, and verbal logic (0-100) */
  verbalReasoning: number;

  /** Ability to visualize and manipulate spatial relationships (0-100) */
  spatialReasoning: number;

  /** Aptitude for mathematical and numerical reasoning (0-100) */
  quantitativeReasoning: number;
}

/**
 * Motivational drivers and intrinsic career energizers.
 *
 * Identifies what fundamentally motivates the student in their work.
 * Understanding motivation prevents career mismatch where someone is
 * capable but unmotivated.
 *
 * High scores indicate strong importance of that motivator.
 */
export interface MotivationProfile {
  /** Drive to accomplish challenging goals and achieve success (0-100) */
  achievement: number;

  /** Desire to develop expertise and deep competence (0-100) */
  mastery: number;

  /** Need for independence and self-direction in work (0-100) */
  autonomy: number;

  /** Motivation to make meaningful difference in the world (0-100) */
  impact: number;

  /** Desire for external validation and status (0-100) */
  recognition: number;

  /** Priority on stability, predictability, and safety (0-100) */
  security: number;
}

/**
 * Lifestyle preferences and work-life integration priorities.
 *
 * Defines the student's desired lifestyle and how work fits into it.
 * Critical for preventing burnout and ensuring long-term career satisfaction.
 */
export interface LifestyleProfile {
  /** Importance of maintaining clear boundaries between work and life (0-100) */
  workLifeBalance: number;

  /** Priority placed on earning potential and financial rewards (0-100) */
  incomePriority: number;

  /** Desire for geographic flexibility and remote work options (0-100) */
  locationFreedom: number;

  /** Enjoyment of travel and work-related mobility (0-100) */
  travelPreference: number;

  /** Preference for stable, predictable routines versus variety (0-100) */
  stabilityPreference: number;
}

/**
 * Risk tolerance across career and financial dimensions.
 *
 * Determines comfort level with uncertainty, volatility, and potential
 * downside scenarios. Essential for matching to stable versus volatile
 * career paths.
 */
export interface RiskProfile {
  /** Comfort with career uncertainty and non-traditional paths (0-100) */
  careerRiskTolerance: number;

  /** Tolerance for financial instability and variable income (0-100) */
  financialRiskTolerance: number;

  /** General comfort with ambiguity and unknown outcomes (0-100) */
  uncertaintyComfort: number;
}

/**
 * Preferred work environment characteristics and interaction styles.
 *
 * Describes the ideal work context where the student will thrive.
 * Includes preferences for social interaction, independence, and
 * type of work activities.
 */
export interface WorkEnvironmentProfile {
  /** Preference for people-facing, collaborative work (0-100) */
  peopleOriented: number;

  /** Preference for solitary, independent work (0-100) */
  independentWork: number;

  /** Desire for leadership roles and managing others (0-100) */
  leadershipPreference: number;

  /** Enjoyment of research, analysis, and discovery (0-100) */
  researchPreference: number;

  /** Preference for implementation, delivery, and tangible outcomes (0-100) */
  executionPreference: number;
}

/**
 * Core values and life priorities.
 *
 * Defines what matters most to the student at a fundamental level.
 * Values alignment is critical for long-term career satisfaction
 * and preventing existential career crises.
 */
export interface ValuesProfile {
  /** Importance of financial wealth and material success (0-100) */
  money: number;

  /** Value placed on status, reputation, and social standing (0-100) */
  prestige: number;

  /** Priority on family time and personal relationships (0-100) */
  familyTime: number;

  /** Value placed on autonomy and independence (0-100) */
  freedom: number;

  /** Desire to create positive change in society (0-100) */
  impact: number;

  /** Priority on continuous growth and knowledge acquisition (0-100) */
  learning: number;
}

/**
 * Identified strengths and competitive advantages.
 *
 * Catalogs the student's key strengths that can be leveraged
 * in career selection and development.
 */
export interface StrengthProfile {
  /** Top 3-5 signature strengths - highest leverage capabilities */
  topStrengths: string[];

  /** Additional supporting strengths - valuable but secondary */
  supportingStrengths: string[];
}

/**
 * Development areas and potential risk factors.
 *
 * Captures areas for growth and potential challenges that may
 * impact career success or satisfaction.
 */
export interface WeaknessProfile {
  /** Areas identified for skill development and improvement */
  developmentAreas: string[];

  /** Potential risk factors that may need mitigation strategies */
  riskFactors: string[];
}

/**
 * External constraints and limiting factors.
 *
 * Documents practical constraints that may limit career options.
 * These are external realities, not preferences.
 *
 * All scores normalized to 0-100 scale:
 * - 0-30: Minimal constraint
 * - 31-50: Moderate constraint
 * - 51-70: Significant constraint
 * - 71-90: Major constraint
 * - 91-100: Severe limiting factor
 */
export interface ConstraintsProfile {
  /** Financial limitations affecting education or career choices (0-100) */
  financialConstraint: number;

  /** Geographic restrictions on relocation or opportunity access (0-100) */
  geographicConstraint: number;

  /** Educational prerequisites or gaps limiting options (0-100) */
  educationConstraint: number;

  /** Family obligations limiting flexibility or time availability (0-100) */
  familyResponsibilityConstraint: number;
}

/**
 * Confidence and data completeness metrics.
 *
 * Tracks the reliability of the profile data and completeness
 * of the assessment. Used to determine recommendation confidence.
 *
 * All scores normalized to 0-100 scale.
 */
export interface ConfidenceProfile {
  /** Overall confidence in the accuracy of this profile (0-100) */
  profileConfidence: number;

  /** Percentage of assessment instruments completed (0-100) */
  assessmentCompleteness: number;
}
