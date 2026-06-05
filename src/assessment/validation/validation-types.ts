/**
 * CareerOS Assessment Reliability & Validation System - Validation Types
 *
 * Phase B.4: Assessment Validation Layer
 *
 * Type definitions for assessment validation, reliability measurement,
 * and quality assessment.
 *
 * @module validation-types
 * @version 1.0.0
 */

import type { AssessmentResponse, AssessmentSignal } from '../assessment-types';

/**
 * Complete validation report for an assessment.
 */
export interface ValidationReport {
  /** Overall validity of assessment */
  isValid: boolean;

  /** Overall reliability score (0-100) */
  reliabilityScore: number;

  /** Quality level */
  qualityLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Reliability components */
  reliability: ReliabilityMetrics;

  /** Consistency analysis */
  consistency: ConsistencyAnalysis;

  /** Response pattern analysis */
  patterns: ResponsePatternAnalysis;

  /** Quality metrics */
  quality: QualityMetrics;

  /** Identified issues */
  issues: ValidationIssue[];

  /** Recommendations */
  recommendations: ValidationRecommendation[];

  /** Retest recommendation */
  retestRecommendation: RetestRecommendation;

  /** Validation timestamp */
  validatedAt: Date;
}

/**
 * Reliability metrics for assessment.
 */
export interface ReliabilityMetrics {
  /** Overall reliability score (0-100) */
  overallScore: number;

  /** Internal consistency score */
  internalConsistency: number;

  /** Dimension confidence scores */
  dimensionConfidence: Map<string, number>;

  /** Assessment stability estimate */
  stabilityScore: number;

  /** Coverage confidence */
  coverageConfidence: number;

  /** Profile confidence */
  profileConfidence: number;
}

/**
 * Consistency analysis results.
 */
export interface ConsistencyAnalysis {
  /** Overall consistency score (0-100) */
  consistencyScore: number;

  /** Detected contradictions */
  contradictions: Contradiction[];

  /** Consistent dimensions */
  consistentDimensions: string[];

  /** Inconsistent dimensions */
  inconsistentDimensions: string[];
}

/**
 * Detected contradiction in responses.
 */
export interface Contradiction {
  /** Unique identifier for this contradiction */
  id: string;

  /** Type of contradiction */
  type: ContradictionType;

  /** Severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Description of the contradiction */
  description: string;

  /** Dimensions involved */
  dimensions: string[];

  /** Scores that contradict */
  scores: Array<{
    dimension: string;
    score: number;
  }>;

  /** Impact on reliability */
  reliabilityImpact: number;

  /** Suggested resolution */
  suggestion: string;
}

/**
 * Types of contradictions.
 */
export type ContradictionType =
  | 'LEADERSHIP_RESPONSIBILITY'
  | 'RISK_CERTAINTY'
  | 'SOCIAL_INDEPENDENCE'
  | 'AUTONOMY_STRUCTURE'
  | 'ACHIEVEMENT_SECURITY'
  | 'CREATIVITY_SYSTEMATIC'
  | 'FLEXIBILITY_STABILITY'
  | 'RECOGNITION_AUTONOMY';

/**
 * Response pattern analysis.
 */
export interface ResponsePatternAnalysis {
  /** Overall pattern score (0-100, higher is more concerning) */
  patternScore: number;

  /** Detected patterns */
  detectedPatterns: DetectedPattern[];

  /** Response distribution analysis */
  distribution: ResponseDistribution;

  /** Engagement estimate */
  engagementScore: number;
}

/**
 * Detected response pattern.
 */
export interface DetectedPattern {
  /** Pattern type */
  type: ResponsePatternType;

  /** Severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Description of pattern */
  description: string;

  /** Evidence for pattern */
  evidence: string[];

  /** Questions affected */
  affectedQuestionIds: string[];

  /** Impact on validity */
  validityImpact: number;
}

/**
 * Types of response patterns.
 */
export type ResponsePatternType =
  | 'STRAIGHT_LINING'
  | 'RANDOM_RESPONDING'
  | 'SPEEDING'
  | 'LOW_ENGAGEMENT'
  | 'ANSWER_FATIGUE'
  | 'PATTERN_REPETITION'
  | 'EXTREME_RESPONDING'
  | 'MIDPOINT_RESPONDING';

/**
 * Response distribution analysis.
 */
export interface ResponseDistribution {
  /** Distribution across scale */
  scaleDistribution: Map<number, number>;

  /** Variance in responses */
  variance: number;

  /** Standard deviation */
  standardDeviation: number;

  /** Range of responses */
  range: number;

  /** Whether distribution is suspicious */
  isSuspicious: boolean;
}

/**
 * Quality metrics for assessment.
 */
export interface QualityMetrics {
  /** Overall quality score (0-100) */
  overallScore: number;

  /** Completion rate (0-100) */
  completionRate: number;

  /** Consistency score */
  consistency: number;

  /** Coverage score */
  coverage: number;

  /** Signal strength score */
  signalStrength: number;

  /** Response quality score */
  responseQuality: number;
}

/**
 * Validation issue.
 */
export interface ValidationIssue {
  /** Issue type */
  type: ValidationIssueType;

  /** Severity */
  severity: 'INFO' | 'WARNING' | 'ERROR';

  /** Description */
  description: string;

  /** Affected areas */
  affectedAreas: string[];

  /** Suggested fix */
  suggestion: string;
}

/**
 * Types of validation issues.
 */
export type ValidationIssueType =
  | 'LOW_COMPLETION'
  | 'INCONSISTENT_RESPONSES'
  | 'CONTRADICTORY_SIGNALS'
  | 'INSUFFICIENT_COVERAGE'
  | 'SUSPICIOUS_PATTERNS'
  | 'LOW_CONFIDENCE'
  | 'DIMENSION_UNCERTAINTY';

/**
 * Validation recommendation.
 */
export interface ValidationRecommendation {
  /** Recommendation type */
  type: RecommendationType;

  /** Priority */
  priority: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Description */
  description: string;

  /** Rationale */
  rationale: string;

  /** Expected impact */
  expectedImpact: string;
}

/**
 * Types of recommendations.
 */
export type RecommendationType =
  | 'RETEST_FULL'
  | 'RETEST_PARTIAL'
  | 'ADDITIONAL_QUESTIONS'
  | 'REVIEW_CONTRADICTIONS'
  | 'NO_ACTION';

/**
 * Retest recommendation.
 */
export interface RetestRecommendation {
  /** Whether retest is recommended */
  shouldRetest: boolean;

  /** Type of retest */
  retestType: 'FULL' | 'PARTIAL' | 'NONE';

  /** Reason for recommendation */
  reason: string;

  /** Dimensions to retest (if partial) */
  dimensionsToRetest: string[];

  /** Confidence in recommendation */
  confidence: number;
}

/**
 * Configuration for validation.
 */
export interface ValidationConfig {
  /** Minimum reliability threshold */
  minReliabilityThreshold: number;

  /** Minimum quality threshold */
  minQualityThreshold: number;

  /** Minimum completion rate */
  minCompletionRate: number;

  /** Maximum acceptable contradictions */
  maxContradictions: number;

  /** Threshold for pattern detection */
  patternThreshold: number;

  /** Minimum dimension coverage */
  minDimensionCoverage: number;
}

/**
 * Default validation configuration.
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  minReliabilityThreshold: 60,
  minQualityThreshold: 60,
  minCompletionRate: 80,
  maxContradictions: 3,
  patternThreshold: 70,
  minDimensionCoverage: 70,
};

/**
 * Pattern detection thresholds.
 */
export interface PatternThresholds {
  /** Threshold for straight-lining detection (%) */
  straightLineThreshold: number;

  /** Minimum variance for non-random responses */
  minVariance: number;

  /** Threshold for extreme responding (%) */
  extremeResponseThreshold: number;

  /** Threshold for midpoint responding (%) */
  midpointThreshold: number;

  /** Minimum time per question (seconds) */
  minTimePerQuestion: number;
}

/**
 * Default pattern thresholds.
 */
export const DEFAULT_PATTERN_THRESHOLDS: PatternThresholds = {
  straightLineThreshold: 70,
  minVariance: 100,
  extremeResponseThreshold: 80,
  midpointThreshold: 70,
  minTimePerQuestion: 5,
};

/**
 * Time-based response data.
 */
export interface ResponseTiming {
  questionId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
}

/**
 * Validation context with all assessment data.
 */
export interface ValidationContext {
  responses: AssessmentResponse[];
  signals: AssessmentSignal[];
  timings?: ResponseTiming[];
  expectedQuestionCount: number;
  config?: Partial<ValidationConfig>;
}
