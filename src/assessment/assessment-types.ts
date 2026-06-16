/**
 * CareerOS Assessment Signal Engine - Assessment Types
 *
 * Phase B.1: Assessment Processing Layer
 *
 * Defines the type system for assessment questions, responses, signals,
 * and processing results used by the Assessment Signal Engine.
 *
 * @module assessment-types
 * @version 1.0.0
 */

/**
 * Base interface for all assessment question types.
 */
export interface BaseQuestion {
  /** Unique identifier for the question */
  id: string;

  /** Category of assessment (e.g., "cognitive", "motivation", "values") */
  category: string;

  /** Specific dimension being measured (e.g., "analyticalThinking", "creativity") */
  dimension: string;

  /** Weight of this question in dimension calculation (0-100) */
  weight: number;

  /** Question text presented to the user */
  prompt: string;
}

/**
 * Likert scale question (1-5 or 1-7 agreement scale).
 */
export interface LikertQuestion extends BaseQuestion {
  type: 'likert';

  /** Minimum scale value */
  minScale: number;

  /** Maximum scale value */
  maxScale: number;

  /** Labels for scale endpoints */
  labels: {
    min: string;
    max: string;
  };
}

/**
 * Multiple choice question with single or multiple selection.
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multipleChoice';

  /** Available options */
  options: Array<{
    id: string;
    text: string;
    score: number;
  }>;

  /** Whether multiple options can be selected */
  allowMultiple: boolean;
}

/**
 * Ranking question where items are ordered by preference.
 */
export interface RankingQuestion extends BaseQuestion {
  type: 'ranking';

  /** Items to be ranked */
  items: Array<{
    id: string;
    text: string;
  }>;
}

/**
 * Forced choice question between two options.
 */
export interface ForcedChoiceQuestion extends BaseQuestion {
  type: 'forcedChoice';

  /** First option */
  optionA: {
    id: string;
    text: string;
    dimension: string;
  };

  /** Second option */
  optionB: {
    id: string;
    text: string;
    dimension: string;
  };
}

/**
 * Scale question with continuous or discrete numeric input.
 */
export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Step increment */
  step: number;

  /** Unit label */
  unit?: string;
}

/**
 * Union type for all question types.
 */
export type AssessmentQuestion =
  | LikertQuestion
  | MultipleChoiceQuestion
  | RankingQuestion
  | ForcedChoiceQuestion
  | ScaleQuestion;

/**
 * Response to a Likert question.
 */
export interface LikertResponse {
  questionId: string;
  type: 'likert';
  value: number;
}

/**
 * Response to a Multiple Choice question.
 */
export interface MultipleChoiceResponse {
  questionId: string;
  type: 'multipleChoice';
  selectedOptionIds: string[];
}

/**
 * Response to a Ranking question.
 */
export interface RankingResponse {
  questionId: string;
  type: 'ranking';
  rankedItemIds: string[];
}

/**
 * Response to a Forced Choice question.
 */
export interface ForcedChoiceResponse {
  questionId: string;
  type: 'forcedChoice';
  selectedOptionId: string;
}

/**
 * Response to a Scale question.
 */
export interface ScaleResponse {
  questionId: string;
  type: 'scale';
  value: number;
}

/**
 * Union type for all response types.
 */
export type AssessmentResponse =
  | LikertResponse
  | MultipleChoiceResponse
  | RankingResponse
  | ForcedChoiceResponse
  | ScaleResponse;

/**
 * Extracted signal from a response.
 */
export interface AssessmentSignal {
  /** Source question ID */
  questionId: string;

  /** Dimension being measured */
  dimension: string;

  /** Normalized signal strength (0-100) */
  strength: number;

  /** Confidence in this signal (0-100) */
  confidence: number;

  /** Category of assessment */
  category: string;

  /** Weight of the source question */
  weight: number;
}

/**
 * Calculated score for a dimension.
 */
export interface DimensionScore {
  /** Dimension name */
  dimension: string;

  /** Normalized score (0-100) */
  score: number;

  /** Confidence in score (0-100) */
  confidence: number;

  /** Number of signals contributing to score */
  signalCount: number;
}

/**
 * Assessment configuration.
 */
export interface AssessmentConfig {
  /** Minimum questions per dimension for HIGH confidence */
  minQuestionsPerDimension: number;

  /** Minimum total questions for valid assessment */
  minTotalQuestions: number;

  /** Variance threshold for consistency check */
  maxAcceptableVariance: number;
}

export type AssessmentConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Default assessment configuration.
 */
export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfig = {
  minQuestionsPerDimension: 3,
  minTotalQuestions: 15,
  maxAcceptableVariance: 400,
};

/**
 * Complete confidence calculation result.
 * @deprecated Use Confidence type from @/intelligence/confidence
 */
export interface AssessmentConfidence {
  /** Numeric confidence score (0-100) */
  score: number;

  /** Constitutional confidence (0.0-1.0) - replaces level enum */
  confidence?: number;

  /** Legacy confidence tier retained for deprecated threshold helpers */
  level: AssessmentConfidenceLevel;

  /** Response consistency score (0-100) */
  consistencyScore: number;

  /** Question count score (0-100) */
  questionCountScore: number;

  /** Answer variance score (0-100) */
  varianceScore: number;

  /** Coverage completeness score (0-100) */
  coverageScore: number;
}

/**
 * Mapping of dimensions to their scores.
 */
export type DimensionScoreMap = Map<string, DimensionScore>;

/**
 * Supported assessment dimensions.
 */
export const SUPPORTED_DIMENSIONS = [
  'analyticalThinking',
  'creativity',
  'socialOrientation',
  'independence',
  'leadership',
  'riskTolerance',
  'achievementDrive',
  'stabilityPreference',
] as const;

/**
 * Type for supported dimension names.
 */
export type SupportedDimension = (typeof SUPPORTED_DIMENSIONS)[number];
