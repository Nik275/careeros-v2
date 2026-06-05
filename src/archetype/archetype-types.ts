/**
 * CareerOS Archetype Detection Engine - Types
 *
 * Phase 1.2: Archetype Detection Engine
 *
 * Type definitions for detecting and scoring student archetypes.
 *
 * @module archetype-types
 * @version 1.0.0
 */

import type {
  ArchetypeType,
  ArchetypeScore,
  ArchetypeProfile,
  ArchetypeConfidence,
} from '@/types/archetype-profile';

/**
 * Signal source types.
 *
 * Where the archetype signal originates from.
 *
 * @enum {string}
 */
export type SignalSource =
  | 'COGNITIVE_ASSESSMENT'
  | 'INTEREST_ASSESSMENT'
  | 'VALUE_ASSESSMENT'
  | 'BEHAVIORAL_ASSESSMENT'
  | 'STRENGTH_ASSESSMENT'
  | 'PREFERENCE_ASSESSMENT'
  | 'PROFILE_INSIGHT'
  | 'DEMOGRAPHIC';

/**
 * Individual archetype signal.
 *
 * A single piece of evidence pointing toward an archetype.
 *
 * @interface ArchetypeSignal
 */
export interface ArchetypeSignal {
  /**
   * The archetype this signal supports.
   */
  readonly archetype: ArchetypeType;

  /**
   * Signal strength (0-100).
   *
   * How strongly this evidence points to the archetype.
   */
  readonly strength: number;

  /**
   * Source of the signal.
   */
  readonly source: SignalSource;

  /**
   * Description of what generated this signal.
   */
  readonly description: string;

  /**
   * Weight factor (0-1).
   *
   * Relative importance of this signal type.
   * Default: 1.0
   */
  readonly weight: number;
}

/**
 * Signal collection for an archetype.
 *
 * All signals pointing to a specific archetype.
 *
 * @interface ArchetypeSignalCollection
 */
export interface ArchetypeSignalCollection {
  /**
   * The archetype being evaluated.
   */
  readonly archetype: ArchetypeType;

  /**
   * All signals for this archetype.
   */
  readonly signals: ArchetypeSignal[];

  /**
   * Weighted signal sum.
   *
   * Sum of (strength * weight) for all signals.
   */
  readonly weightedSum: number;

  /**
   * Total weight.
   *
   * Sum of all signal weights.
   */
  readonly totalWeight: number;

  /**
   * Signal count by source.
   */
  readonly signalCountBySource: Record<SignalSource, number>;
}

/**
 * Archetype scoring configuration.
 *
 * Configuration for how archetype scores are calculated.
 *
 * @interface ArchetypeScoringConfig
 */
export interface ArchetypeScoringConfig {
  /**
   * Minimum signals required for valid score.
   */
  readonly minSignalsRequired: number;

  /**
   * Minimum confidence threshold for primary archetype.
   */
  readonly minPrimaryConfidence: number;

  /**
   * Gap required between primary and secondary (0-100).
   */
  readonly primarySecondaryGap: number;

  /**
   * Source weights.
   *
   * Relative importance of each signal source.
   */
  readonly sourceWeights: Record<SignalSource, number>;

  /**
   * Whether to allow mixed archetypes (primary + secondary).
   */
  readonly allowMixedArchetypes: boolean;

  /**
   * Threshold for secondary archetype inclusion.
   *
   * Minimum score for secondary archetype.
   */
  readonly secondaryThreshold: number;
}

/**
 * Archetype detection input.
 *
 * Data sources for archetype detection.
 *
 * @interface ArchetypeDetectionInput
 */
export interface ArchetypeDetectionInput {
  /**
   * Profile identifier.
   */
  readonly profileId: string;

  /**
   * Student life profile data.
   */
  readonly studentProfile: import('@/types/student-profile').StudentLifeProfile;

  /**
   * Assessment results.
   */
  readonly assessments?: {
    readonly cognitive?: import('@/assessment-intelligence/assessment-types').CognitiveAssessmentResult;
    readonly interest?: import('@/assessment-intelligence/assessment-types').InterestAssessmentResult;
    readonly values?: import('@/assessment-intelligence/assessment-types').ValuesAssessmentResult;
    readonly behavioral?: import('@/assessment-intelligence/assessment-types').BehavioralAssessmentResult;
  };

  /**
   * Profile insights.
   */
  readonly profileInsights?: import('@/profile-generator/profile-types').ProfileInsights;

  /**
   * Explicit preferences stated by student.
   */
  readonly explicitPreferences?: {
    readonly preferredArchetypes?: ArchetypeType[];
    readonly rejectedArchetypes?: ArchetypeType[];
  };
}

/**
 * Archetype detection result.
 *
 * @interface ArchetypeDetectionResult
 */
export interface ArchetypeDetectionResult {
  /**
   * Whether detection succeeded.
   */
  readonly success: boolean;

  /**
   * Archetype profile (if successful).
   */
  readonly profile?: ArchetypeProfile;

  /**
   * Signal collections used (if successful).
   */
  readonly signalCollections?: ArchetypeSignalCollection[];

  /**
   * Error code (if failed).
   */
  readonly error?: ArchetypeDetectionError;

  /**
   * Error message (if failed).
   */
  readonly errorMessage?: string;
}

/**
 * Archetype detection error codes.
 *
 * @enum {string}
 */
export type ArchetypeDetectionError =
  | 'INSUFFICIENT_DATA'
  | 'LOW_CONFIDENCE'
  | 'CONFLICTING_SIGNALS'
  | 'CALCULATION_ERROR';

/**
 * Archetype mapping rule.
 *
 * Maps profile data to archetype signals.
 *
 * @interface ArchetypeMappingRule
 */
export interface ArchetypeMappingRule {
  /**
   * Rule identifier.
   */
  readonly id: string;

  /**
   * Target archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * Condition that triggers this rule.
   */
  readonly condition: (input: ArchetypeDetectionInput) => boolean;

  /**
   * Signal strength when condition is met (0-100).
   */
  readonly signalStrength: number;

  /**
   * Source type for this rule.
   */
  readonly source: SignalSource;

  /**
   * Human-readable description.
   */
  readonly description: string;

  /**
   * Weight for this rule (0-1).
   */
  readonly weight: number;
}

/**
 * Signal strength modifier.
 *
 * Adjusts signal strength based on additional context.
 *
 * @interface SignalModifier
 */
export interface SignalModifier {
  /**
   * Modifier identifier.
   */
  readonly id: string;

  /**
   * Archetypes this modifier applies to.
   */
  readonly archetypes: ArchetypeType[];

  /**
   * Condition for applying modifier.
   */
  readonly condition: (input: ArchetypeDetectionInput) => boolean;

  /**
   * Multiplier to apply (e.g., 1.2 for 20% boost).
   */
  readonly multiplier: number;

  /**
   * Description of modifier.
   */
  readonly description: string;
}

/**
 * Detection analysis metadata.
 *
 * Additional information about the detection process.
 *
 * @interface DetectionAnalysis
 */
export interface DetectionAnalysis {
  /**
   * Total signals collected.
   */
  readonly totalSignals: number;

  /**
   * Signals by source.
   */
  readonly signalsBySource: Record<SignalSource, number>;

  /**
   * Signal consistency (0-100).
   *
   * How aligned signals are (high = consistent, low = conflicting).
   */
  readonly signalConsistency: number;

  /**
   * Coverage score (0-100).
   *
   * How many archetypes had signals.
   */
  readonly coverageScore: number;

  /**
   * Evidence strength (0-100).
   *
   * Overall strength of collected evidence.
   */
  readonly evidenceStrength: number;

  /**
   * Rules triggered during detection.
   */
  readonly triggeredRules: string[];
}

/**
 * Default archetype scoring configuration.
 */
export const DEFAULT_ARCHETYPE_SCORING_CONFIG: ArchetypeScoringConfig = {
  minSignalsRequired: 3,
  minPrimaryConfidence: 60,
  primarySecondaryGap: 10,
  sourceWeights: {
    COGNITIVE_ASSESSMENT: 1.0,
    INTEREST_ASSESSMENT: 0.9,
    VALUE_ASSESSMENT: 0.9,
    BEHAVIORAL_ASSESSMENT: 0.85,
    STRENGTH_ASSESSMENT: 0.85,
    PREFERENCE_ASSESSMENT: 0.8,
    PROFILE_INSIGHT: 0.75,
    DEMOGRAPHIC: 0.5,
  },
  allowMixedArchetypes: true,
  secondaryThreshold: 50,
};

/**
 * Archetype trait indicators.
 *
 * Maps traits to archetypes they indicate.
 */
export const ARCHETYPE_TRAIT_INDICATORS: Record<ArchetypeType, string[]> = {
  BUILDER: [
    'systematic',
    'analytical',
    'mastery',
    'technical',
    'structured',
    'product focused',
    'implementation',
  ],
  RESEARCHER: [
    'analytical',
    'deep thinking',
    'curiosity',
    'systematic',
    'investigation',
    'evidence based',
    'intellectual',
  ],
  CREATOR: [
    'creative',
    'original',
    'artistic',
    'expression',
    'innovative',
    'design oriented',
    'aesthetic',
  ],
  OPERATOR: [
    'reliable',
    'structured',
    'execution',
    'process oriented',
    'detail focused',
    'consistent',
    'organized',
  ],
  LEADER: [
    'influential',
    'people oriented',
    'direction setting',
    'charismatic',
    'team focused',
    'decisive',
    'visionary',
  ],
  EXPLORER: [
    'curious',
    'adaptable',
    'novelty seeking',
    'risk tolerant',
    'change oriented',
    'discovery',
    'flexible',
  ],
  TEACHER: [
    'explanatory',
    'mentoring',
    'knowledge sharing',
    'patient',
    'educational',
    'supportive',
    'guiding',
  ],
  PROTECTOR: [
    'responsible',
    'security focused',
    'caregiving',
    'risk averse',
    'service oriented',
    'stable',
    'protective',
  ],
  STRATEGIST: [
    'planning',
    'systems thinking',
    'analytical',
    'optimization',
    'long term',
    'pattern recognition',
    'structured',
  ],
  FOUNDER: [
    'autonomy',
    'risk tolerant',
    'opportunity seeking',
    'entrepreneurial',
    'independent',
    'ambitious',
    'driven',
  ],
  CRAFTSMAN: [
    'mastery',
    'quality focused',
    'skill oriented',
    'detail oriented',
    'excellence',
    'dedicated',
    'perfectionist',
  ],
};

/**
 * Checks if detection has sufficient data.
 *
 * @param input - Detection input
 * @returns Whether sufficient data exists
 */
export function hasSufficientData(
  input: ArchetypeDetectionInput
): boolean {
  let signalCount = 0;

  // Count available assessment data
  if (input.assessments?.cognitive) signalCount += 3;
  if (input.assessments?.interest) signalCount += 3;
  if (input.assessments?.values) signalCount += 3;
  if (input.assessments?.behavioral) signalCount += 3;
  if (input.profileInsights) signalCount += 2;
  if (input.explicitPreferences?.preferredArchetypes) signalCount += 1;

  return signalCount >= DEFAULT_ARCHETYPE_SCORING_CONFIG.minSignalsRequired;
}
