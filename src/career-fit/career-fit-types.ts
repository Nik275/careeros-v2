/**
 * CareerOS Career Fit Engine - Type Definitions
 *
 * Phase C.3: Career Fit Engine
 *
 * Types for evaluating fit between StudentLifeProfile and CareerIntelligence.
 *
 * @module career-fit-types
 * @version 1.0.0
 */

import type { CareerId } from '../career-intelligence/career-types';

/**
 * Unique identifier for a fit result.
 */
export type FitResultId = string;

/**
 * Complete career fit evaluation result.
 */
export interface CareerFitResult {
  /** Unique result identifier */
  id: FitResultId;

  /** Student profile identifier */
  studentProfileId: string;

  /** Career being evaluated */
  careerId: CareerId;

  /** Overall fit score (0-100) */
  overallFitScore: number;

  /** Fit level category */
  fitLevel: FitLevel;

  /** Detailed breakdown by dimension */
  breakdown: FitBreakdown;

  /** Strengths in this fit */
  strengths: FitStrength[];

  /** Concerns in this fit */
  concerns: FitConcern[];

  /** Explanations for the fit */
  explanations: FitExplanations;

  /** Confidence in this fit assessment */
  confidence: FitConfidence;

  /** Evaluation timestamp */
  evaluatedAt: Date;

  /** Fit metadata */
  metadata: FitMetadata;
}

/**
 * Fit level categories.
 */
export type FitLevel = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'MISFIT';

/**
 * Detailed fit breakdown by dimension.
 */
export interface FitBreakdown {
  /** Cognitive dimension fit */
  cognitive: CognitiveFit;

  /** Motivation dimension fit */
  motivation: MotivationFit;

  /** Lifestyle dimension fit */
  lifestyle: LifestyleFit;

  /** Risk dimension fit */
  risk: RiskFit;

  /** Work environment fit */
  workEnvironment: WorkEnvironmentFit;

  /** Values dimension fit */
  values: ValuesFit;
}

/**
 * Cognitive fit assessment.
 */
export interface CognitiveFit {
  /** Overall cognitive fit score (0-100) */
  score: number;

  /** Analytical thinking fit */
  analyticalFit: DimensionFit;

  /** Creative thinking fit */
  creativeFit: DimensionFit;

  /** Systematic processing fit */
  systematicFit: DimensionFit;

  /** Verbal reasoning fit */
  verbalFit: DimensionFit;

  /** Spatial reasoning fit */
  spatialFit: DimensionFit;

  /** Quantitative reasoning fit */
  quantitativeFit: DimensionFit;

  /** Dominant cognitive match */
  dominantMatch: string;

  /** Cognitive gaps identified */
  gaps: CognitiveGap[];
}

/**
 * Single dimension fit assessment.
 */
export interface DimensionFit {
  /** Fit score for this dimension (0-100) */
  score: number;

  /** Student score (0-100) */
  studentScore: number;

  /** Career demand (0-100) */
  careerDemand: number;

  /** Gap between student and career */
  gap: number;

  /** Whether this is a match */
  isMatch: boolean;

  /** Whether student exceeds demand */
  exceedsDemand: boolean;
}

/**
 * Cognitive gap description.
 */
export interface CognitiveGap {
  /** Cognitive dimension with gap */
  dimension: string;

  /** Gap magnitude */
  gap: number;

  /** Impact on career success */
  impact: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Whether gap can be developed */
  isDevelopable: boolean;
}

/**
 * Motivation fit assessment.
 */
export interface MotivationFit {
  /** Overall motivation fit score (0-100) */
  score: number;

  /** Achievement drive fit */
  achievementFit: DimensionFit;

  /** Mastery/learning fit */
  masteryFit: DimensionFit;

  /** Autonomy fit */
  autonomyFit: DimensionFit;

  /** Impact/meaning fit */
  impactFit: DimensionFit;

  /** Recognition fit */
  recognitionFit: DimensionFit;

  /** Security fit */
  securityFit: DimensionFit;

  /** Primary motivation match */
  primaryMatch: string;

  /** Motivation conflicts */
  conflicts: MotivationConflict[];
}

/**
 * Motivation conflict description.
 */
export interface MotivationConflict {
  /** Motivation dimension in conflict */
  dimension: string;

  /** Student score */
  studentScore: number;

  /** Career demand */
  careerDemand: number;

  /** Conflict severity */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Description of conflict */
  description: string;
}

/**
 * Lifestyle fit assessment.
 */
export interface LifestyleFit {
  /** Overall lifestyle fit score (0-100) */
  score: number;

  /** Income aspiration fit */
  incomeFit: DimensionFit;

  /** Work-life balance fit */
  workLifeBalanceFit: DimensionFit;

  /** Location flexibility fit */
  locationFit: DimensionFit;

  /** Travel preference fit */
  travelFit: DimensionFit;

  /** Stability preference fit */
  stabilityFit: DimensionFit;

  /** Lifestyle dealbreakers */
  dealbreakers: LifestyleDealbreaker[];
}

/**
 * Lifestyle dealbreaker description.
 */
export interface LifestyleDealbreaker {
  /** Lifestyle dimension */
  dimension: string;

  /** Student preference */
  studentPreference: string;

  /** Career reality */
  careerReality: string;

  /** Severity of mismatch */
  severity: 'WARNING' | 'CRITICAL';
}

/**
 * Risk fit assessment.
 */
export interface RiskFit {
  /** Overall risk fit score (0-100) */
  score: number;

  /** Automation risk alignment */
  automationRiskFit: DimensionFit;

  /** Competition risk alignment */
  competitionRiskFit: DimensionFit;

  /** Burnout risk alignment */
  burnoutRiskFit: DimensionFit;

  /** Education barrier alignment */
  educationBarrierFit: DimensionFit;

  /** Risk tolerance match */
  riskToleranceMatch: number;

  /** Risk concerns */
  concerns: RiskConcern[];
}

/**
 * Risk concern description.
 */
export interface RiskConcern {
  /** Risk type */
  riskType: string;

  /** Student tolerance */
  studentTolerance: number;

  /** Career risk level */
  careerRiskLevel: number;

  /** Concern level */
  level: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Description */
  description: string;
}

/**
 * Work environment fit assessment.
 */
export interface WorkEnvironmentFit {
  /** Overall work environment fit score (0-100) */
  score: number;

  /** People intensity fit */
  peopleFit: DimensionFit;

  /** Independence fit */
  independenceFit: DimensionFit;

  /** Leadership opportunity fit */
  leadershipFit: DimensionFit;

  /** Research intensity fit */
  researchFit: DimensionFit;

  /** Execution intensity fit */
  executionFit: DimensionFit;

  /** Environment type match */
  environmentMatch: string;
}

/**
 * Values fit assessment.
 */
export interface ValuesFit {
  /** Overall values fit score (0-100) */
  score: number;

  /** Money/income values fit */
  moneyFit: DimensionFit;

  /** Prestige values fit */
  prestigeFit: DimensionFit;

  /** Family time values fit */
  familyTimeFit: DimensionFit;

  /** Freedom/autonomy values fit */
  freedomFit: DimensionFit;

  /** Impact values fit */
  impactFit: DimensionFit;

  /** Learning values fit */
  learningFit: DimensionFit;

  /** Values alignment summary */
  alignment: ValuesAlignment;
}

/**
 * Values alignment summary.
 */
export interface ValuesAlignment {
  /** Highly aligned values */
  highlyAligned: string[];

  /** Moderately aligned values */
  moderatelyAligned: string[];

  /** Misaligned values */
  misaligned: string[];

  /** Values satisfaction potential */
  satisfactionPotential: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Fit strength description.
 */
export interface FitStrength {
  /** Strength category */
  category: 'COGNITIVE' | 'MOTIVATION' | 'LIFESTYLE' | 'RISK' | 'ENVIRONMENT' | 'VALUES';

  /** Specific dimension */
  dimension: string;

  /** Strength description */
  description: string;

  /** Strength score (0-100) */
  score: number;

  /** Impact on overall fit */
  impact: 'MAJOR' | 'MODERATE' | 'MINOR';
}

/**
 * Fit concern description.
 */
export interface FitConcern {
  /** Concern category */
  category: 'COGNITIVE' | 'MOTIVATION' | 'LIFESTYLE' | 'RISK' | 'ENVIRONMENT' | 'VALUES';

  /** Specific dimension */
  dimension: string;

  /** Concern description */
  description: string;

  /** Severity of concern */
  severity: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Whether concern is addressable */
  isAddressable: boolean;

  /** Suggestion for addressing */
  suggestion?: string;
}

/**
 * Fit explanations.
 */
export interface FitExplanations {
  /** Why fit is strong */
  strongFitReasons: string[];

  /** Why fit is weak */
  weakFitReasons: string[];

  /** What aligns */
  alignments: string[];

  /** What conflicts */
  conflicts: string[];

  /** Summary explanation */
  summary: string;
}

/**
 * Fit confidence assessment.
 */
export interface FitConfidence {
  /** Overall confidence (0-100) */
  overall: number;

  /** Profile confidence component */
  profileConfidence: number;

  /** Career confidence component */
  careerConfidence: number;

  /** Evidence confidence component */
  evidenceConfidence: number;

  /** Calculation confidence component */
  calculationConfidence: number;

  /** Confidence level */
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Fit metadata.
 */
export interface FitMetadata {
  /** Calculation method used */
  calculationMethod: string;

  /** Version of fit engine */
  version: string;

  /** Profile data timestamp */
  profileTimestamp: Date;

  /** Career data timestamp */
  careerTimestamp: Date;
}

/**
 * Fit calculation configuration.
 */
export interface FitCalculationConfig {
  /** Weights for each dimension in overall score */
  dimensionWeights: DimensionWeights;

  /** Threshold for excellent fit */
  excellentFitThreshold: number;

  /** Threshold for good fit */
  goodFitThreshold: number;

  /** Threshold for moderate fit */
  moderateFitThreshold: number;

  /** Threshold for poor fit */
  poorFitThreshold: number;

  /** Gap tolerance (how much gap is acceptable) */
  gapTolerance: number;

  /** Minimum confidence threshold */
  minConfidenceThreshold: number;
}

/**
 * Dimension weights for fit calculation.
 */
export interface DimensionWeights {
  cognitive: number;
  motivation: number;
  lifestyle: number;
  risk: number;
  workEnvironment: number;
  values: number;
}

/**
 * Default fit calculation configuration.
 */
export const DEFAULT_FIT_CONFIG: FitCalculationConfig = {
  dimensionWeights: {
    cognitive: 0.2,
    motivation: 0.2,
    lifestyle: 0.2,
    risk: 0.15,
    workEnvironment: 0.15,
    values: 0.1,
  },
  excellentFitThreshold: 85,
  goodFitThreshold: 70,
  moderateFitThreshold: 50,
  poorFitThreshold: 35,
  gapTolerance: 20,
  minConfidenceThreshold: 60,
};

/**
 * Fit query parameters.
 */
export interface FitQuery {
  /** Minimum fit score */
  minFitScore?: number;

  /** Required fit level */
  fitLevel?: FitLevel;

  /** Minimum confidence */
  minConfidence?: number;

  /** Dimensions to prioritize */
  prioritizedDimensions?: Array<keyof FitBreakdown>;
}

/**
 * Fit comparison result.
 */
export interface FitComparison {
  /** Careers being compared */
  careerIds: CareerId[];

  /** Fit results for each career */
  fits: CareerFitResult[];

  /** Dimension-by-dimension comparison */
  dimensionComparison: DimensionComparison[];

  /** Best fitting career */
  bestFit: CareerId;

  /** Comparison timestamp */
  comparedAt: Date;
}

/**
 * Dimension comparison between careers.
 */
export interface DimensionComparison {
  /** Dimension name */
  dimension: string;

  /** Scores by career */
  scores: Record<CareerId, number>;

  /** Best career for this dimension */
  best: CareerId;

  /** Score range */
  range: number;
}
