/**
 * CareerOS Archetype Confidence Engine - Types
 *
 * Phase 1.3: Archetype Confidence Engine
 *
 * Type definitions for measuring archetype prediction trustworthiness.
 *
 * @module confidence-types
 * @version 1.0.0
 */

import type { ArchetypeType, ArchetypeScore } from '@/types/archetype-profile';
import type { ArchetypeSignal, SignalSource } from './archetype-types';

import type { Confidence } from '@/intelligence/confidence';

/**
 * Constitutional confidence type for archetype predictions.
 * All confidence values are 0.0-1.0 floats.
 */

/**
 * Detailed archetype confidence metrics.
 *
 * Extended confidence information beyond the base ArchetypeConfidence.
 *
 * @interface ArchetypeConfidenceDetails
 */
export interface ArchetypeConfidenceDetails {
  /**
   * Overall confidence score (0-100).
   */
  readonly confidenceScore: number;

  /**
   * Constitutional confidence (0.0-1.0).
   * @deprecated Use confidence field with constitutional Confidence type
   */
  readonly confidenceLevel?: never; // BANNED - Use confidence field instead

  /**
   * Constitutional confidence (0.0-1.0) from ConfidenceAuthority.
   */
  readonly confidence: Confidence;

  /**
   * Stability score (0-100).
   *
   * How likely the archetype assignment is to remain stable
   * with small input variations.
   */
  readonly stabilityScore: number;

  /**
   * Evidence score (0-100).
   *
   * Quality and quantity of evidence supporting the assignment.
   */
  readonly evidenceScore: number;

  /**
   * Signal coverage score (0-100).
   *
   * Percentage of archetypes that had signals.
   */
  readonly coverageScore: number;

  /**
   * Consistency score (0-100).
   *
   * How consistent signals are across sources.
   */
  readonly consistencyScore: number;

  /**
   * Archetype separation score (0-100).
   *
   * How distinct the primary archetype is from others.
   */
  readonly separationScore: number;

  /**
   * Assessment completeness score (0-100).
   */
  readonly completenessScore: number;
}

/**
 * Evidence quality tier.
 *
 * Classification of evidence quality.
 *
 * @enum {string}
 */
export type EvidenceQuality = 'STRONG' | 'MODERATE' | 'WEAK' | 'ANECDOTAL';

/**
 * Individual evidence item.
 *
 * @interface EvidenceItem
 */
export interface EvidenceItem {
  /**
   * Unique evidence identifier.
   */
  readonly evidenceId: string;

  /**
   * Archetype this evidence supports.
   */
  readonly archetype: ArchetypeType;

  /**
   * Evidence source.
   */
  readonly source: SignalSource;

  /**
   * Evidence quality tier.
   */
  readonly quality: EvidenceQuality;

  /**
   * Evidence strength (0-100).
   */
  readonly strength: number;

  /**
   * Description of the evidence.
   */
  readonly description: string;

  /**
   * Timestamp when evidence was collected.
   */
  readonly collectedAt: Date;
}

/**
 * Evidence collection for an archetype.
 *
 * @interface EvidenceCollection
 */
export interface EvidenceCollection {
  /**
   * The archetype.
   */
  readonly archetype: ArchetypeType;

  /**
   * All evidence items.
   */
  readonly items: EvidenceItem[];

  /**
   * Evidence count by quality.
   */
  readonly countByQuality: Record<EvidenceQuality, number>;

  /**
   * Evidence count by source.
   */
  readonly countBySource: Record<SignalSource, number>;

  /**
   * Total evidence strength.
   */
  readonly totalStrength: number;

  /**
   * Weighted evidence score.
   */
  readonly weightedScore: number;
}

/**
 * Stability analysis for archetype assignment.
 *
 * @interface StabilityAnalysis
 */
export interface StabilityAnalysis {
  /**
   * Overall stability score (0-100).
   *
   * Higher means more stable.
   */
  readonly stabilityScore: number;

  /**
   * Sensitivity score (0-100).
   *
   * How sensitive results are to small input changes.
   * Lower is better (less sensitive).
   */
  readonly sensitivityScore: number;

  /**
   * Robustness indicators.
   *
   * Factors that contribute to stability.
   */
  readonly robustnessIndicators: RobustnessIndicator[];

  /**
   * Vulnerability factors.
   *
   * Factors that could destabilize the assignment.
   */
  readonly vulnerabilityFactors: VulnerabilityFactor[];

  /**
   * Estimated confidence interval for primary archetype score.
   */
  readonly confidenceInterval: {
    readonly lowerBound: number;
    readonly upperBound: number;
  };

  /**
   * Scenarios that could change the assignment.
   */
  readonly changeScenarios: ChangeScenario[];
}

/**
 * Robustness indicator.
 *
 * @interface RobustnessIndicator
 */
export interface RobustnessIndicator {
  /**
   * Indicator name.
   */
  readonly name: string;

  /**
   * Description.
   */
  readonly description: string;

  /**
   * Contribution to stability (0-100).
   */
  readonly contribution: number;
}

/**
 * Vulnerability factor.
 *
 * @interface VulnerabilityFactor
 */
export interface VulnerabilityFactor {
  /**
   * Factor name.
   */
  readonly name: string;

  /**
   * Description of the vulnerability.
   */
  readonly description: string;

  /**
   * Impact on stability if triggered (0-100).
   */
  readonly impact: number;

  /**
   * Likelihood of occurring (0-100).
   */
  readonly likelihood: number;
}

/**
 * Change scenario.
 *
 * Describes a situation that could alter archetype assignment.
 *
 * @interface ChangeScenario
 */
export interface ChangeScenario {
  /**
   * Scenario description.
   */
  readonly scenario: string;

  /**
   * What would need to change.
   */
  readonly requiredChange: string;

  /**
   * Probability of this scenario (0-100).
   */
  readonly probability: number;

  /**
   * Potential new primary archetype.
   */
  readonly potentialNewArchetype?: ArchetypeType;
}

/**
 * Archetype separation analysis.
 *
 * Measures how distinct the primary archetype is from others.
 *
 * @interface SeparationAnalysis
 */
export interface SeparationAnalysis {
  /**
   * Overall separation score (0-100).
   *
   * Higher means primary is more distinct.
   */
  readonly separationScore: number;

  /**
   * Gap between primary and secondary (0-100).
   */
  readonly primarySecondaryGap: number;

  /**
   * Gap between primary and tertiary (0-100).
   */
  readonly primaryTertiaryGap: number;

  /**
   * Distribution evenness (0-100).
   *
   * Lower means more concentrated (better separation).
   */
  readonly distributionEvenness: number;

  /**
   * Clear winner flag.
   *
   * True if primary is clearly dominant.
   */
  readonly hasClearWinner: boolean;
}

/**
 * Signal consistency analysis.
 *
 * @interface ConsistencyAnalysis
 */
export interface ConsistencyAnalysis {
  /**
   * Overall consistency score (0-100).
   */
  readonly consistencyScore: number;

  /**
   * Agreement across sources (0-100).
   */
  readonly crossSourceAgreement: number;

  /**
   * Internal consistency (0-100).
   *
   * Signals for same archetype from same source.
   */
  readonly internalConsistency: number;

  /**
   * Conflicting signals detected.
   */
  readonly conflictingSignals: ConflictingSignal[];
}

/**
 * Conflicting signal pair.
 *
 * @interface ConflictingSignal
 */
export interface ConflictingSignal {
  /**
   * First archetype.
   */
  readonly archetype1: ArchetypeType;

  /**
   * Second archetype.
   */
  readonly archetype2: ArchetypeType;

  /**
   * Description of conflict.
   */
  readonly conflict: string;

  /**
   * Severity (0-100).
   */
  readonly severity: number;
}

/**
 * Coverage analysis.
 *
 * @interface CoverageAnalysis
 */
export interface CoverageAnalysis {
  /**
   * Overall coverage score (0-100).
   */
  readonly coverageScore: number;

  /**
   * Number of archetypes with signals.
   */
  readonly archetypesWithSignals: number;

  /**
   * Total archetypes possible.
   */
  readonly totalArchetypes: number;

  /**
   * Sources with data.
   */
  readonly sourcesWithData: SignalSource[];

  /**
   * Missing sources.
   */
  readonly missingSources: SignalSource[];

  /**
   * Coverage gaps.
   */
  readonly gaps: CoverageGap[];
}

/**
 * Coverage gap.
 *
 * @interface CoverageGap
 */
export interface CoverageGap {
  /**
   * What is missing.
   */
  readonly missing: string;

  /**
   * Impact on confidence (0-100).
   */
  readonly impact: number;

  /**
   * Recommendation to fill gap.
   */
  readonly recommendation: string;
}

/**
 * Assessment completeness.
 *
 * @interface CompletenessAnalysis
 */
export interface CompletenessAnalysis {
  /**
   * Overall completeness score (0-100).
   */
  readonly completenessScore: number;

  /**
   * Assessments completed.
   */
  readonly completedAssessments: string[];

  /**
   * Assessments missing.
   */
  readonly missingAssessments: string[];

  /**
   * Profile sections complete.
   */
  readonly profileSectionsComplete: number;

  /**
   * Profile sections total.
   */
  readonly profileSectionsTotal: number;
}

/**
 * Confidence calculation input.
 *
 * @interface ConfidenceCalculationInput
 */
export interface ConfidenceCalculationInput {
  /**
   * Archetype scores.
   */
  readonly archetypeScores: ArchetypeScore[];

  /**
   * Signals used.
   */
  readonly signals: ArchetypeSignal[];

  /**
   * Profile reliability score (0-100).
   */
  readonly profileReliability: number;

  /**
   * Assessment reliability scores.
   */
  readonly assessmentReliability: Record<string, number>;

  /**
   * Primary archetype.
   */
  readonly primaryArchetype: ArchetypeType;

  /**
   * Secondary archetype (optional).
   */
  readonly secondaryArchetype?: ArchetypeType;
}

/**
 * Confidence calculation result.
 *
 * @interface ConfidenceCalculationResult
 */
export interface ConfidenceCalculationResult {
  /**
   * Whether calculation succeeded.
   */
  readonly success: boolean;

  /**
   * Confidence details (if successful).
   */
  readonly confidence?: ArchetypeConfidenceDetails;

  /**
   * Error message (if failed).
   */
  readonly error?: string;
}

/**
 * Quality weights for evidence.
 */
export const EVIDENCE_QUALITY_WEIGHTS: Record<EvidenceQuality, number> = {
  STRONG: 1.0,
  MODERATE: 0.7,
  WEAK: 0.4,
  ANECDOTAL: 0.2,
};

/**
 * Confidence level thresholds.
 */
export const CONFIDENCE_THRESHOLDS: Record<ConfidenceLevel, number> = {
  VERY_HIGH: 85,
  HIGH: 70,
  MEDIUM: 50,
  LOW: 30,
  VERY_LOW: 0,
};

/**
 * Minimum gaps for clear winner.
 */
export const SEPARATION_THRESHOLDS = {
  primarySecondary: 15,
  primaryTertiary: 25,
};

/**
 * Determines confidence level from score.
 *
 * @param score - Confidence score (0-100)
 * @returns Confidence level
 */
export function determineConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'VERY_HIGH';
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
  if (score >= CONFIDENCE_THRESHOLDS.LOW) return 'LOW';
  return 'VERY_LOW';
}

/**
 * Calculates evidence quality from signal.
 *
 * @param signal - Archetype signal
 * @returns Evidence quality
 */
export function calculateEvidenceQuality(
  signal: ArchetypeSignal
): EvidenceQuality {
  if (signal.strength >= 75 && signal.weight >= 0.9) return 'STRONG';
  if (signal.strength >= 60 && signal.weight >= 0.7) return 'MODERATE';
  if (signal.strength >= 40) return 'WEAK';
  return 'ANECDOTAL';
}

/**
 * All signal sources.
 */
export const ALL_SIGNAL_SOURCES: SignalSource[] = [
  'COGNITIVE_ASSESSMENT',
  'INTEREST_ASSESSMENT',
  'VALUE_ASSESSMENT',
  'BEHAVIORAL_ASSESSMENT',
  'STRENGTH_ASSESSMENT',
  'PREFERENCE_ASSESSMENT',
  'PROFILE_INSIGHT',
  'DEMOGRAPHIC',
];

/**
 * Minimum evidence count for each quality tier.
 */
export const MIN_EVIDENCE_COUNTS = {
  STRONG: 2,
  MODERATE: 3,
  WEAK: 5,
  ANY: 3,
};
