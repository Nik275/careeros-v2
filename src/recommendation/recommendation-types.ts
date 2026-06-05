/**
 * CareerOS Career Recommendation Engine - Type Definitions
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Types for generating and explaining career recommendations.
 *
 * @module recommendation-types
 * @version 1.0.0
 */

import type { CareerId } from '../career-intelligence/career-types';
import type { CareerFitResult, FitLevel } from '../career-fit/career-fit-types';

/**
 * Unique identifier for a recommendation.
 */
export type RecommendationId = string;

/**
 * Complete career recommendation.
 */
export interface CareerRecommendation {
  /** Unique recommendation identifier */
  id: RecommendationId;

  /** Student profile identifier */
  studentProfileId: string;

  /** Recommended career */
  careerId: CareerId;

  /** Career title */
  careerTitle: string;

  /** Recommendation type */
  recommendationType: RecommendationType;

  /** Recommendation rank (1 = highest) */
  rank: number;

  /** Overall recommendation score (0-100) */
  score: number;

  /** Fit score component */
  fitScore: number;

  /** Future relevance score */
  futureRelevanceScore: number;

  /** Career mobility score */
  careerMobilityScore: number;

  /** Lifestyle alignment score */
  lifestyleAlignmentScore: number;

  /** Risk alignment score */
  riskAlignmentScore: number;

  /** Market opportunity score */
  marketOpportunityScore: number;

  /** Fit result reference */
  fitResult: CareerFitResult;

  /** Recommendation explanation */
  explanation: RecommendationExplanation;

  /** Alternative options */
  alternatives: AlternativeRecommendation[];

  /** Related careers */
  relatedCareers: RelatedCareer[];

  /** Confidence in this recommendation */
  confidence: RecommendationConfidence;

  /** Recommendation metadata */
  metadata: RecommendationMetadata;

  /** Generated timestamp */
  generatedAt: Date;
}

/**
 * Types of career recommendations.
 */
export type RecommendationType =
  | 'STRONG_MATCH'
  | 'GOOD_MATCH'
  | 'POTENTIAL_MATCH'
  | 'STRETCH_MATCH';

/**
 * Recommendation explanation.
 */
export interface RecommendationExplanation {
  /** Why this career is recommended */
  whyRecommended: string[];

  /** Why not ranked higher */
  whyNotHigher: string[];

  /** Why not ranked lower */
  whyNotLower: string[];

  /** Major advantages */
  majorAdvantages: string[];

  /** Major concerns */
  majorConcerns: string[];

  /** Unique selling points */
  uniqueSellingPoints: string[];

  /** Fit summary */
  fitSummary: string;

  /** Future outlook summary */
  outlookSummary: string;
}

/**
 * Alternative recommendation option.
 */
export interface AlternativeRecommendation {
  /** Alternative career */
  careerId: CareerId;

  /** Alternative career title */
  careerTitle: string;

  /** Why this is an alternative */
  reason: string;

  /** Similarity to primary recommendation */
  similarityScore: number;

  /** Key differences */
  keyDifferences: string[];

  /** When to consider this alternative */
  whenToConsider: string;
}

/**
 * Related career information.
 */
export interface RelatedCareer {
  /** Related career */
  careerId: CareerId;

  /** Relationship type */
  relationship: 'SIMILAR' | 'ADJACENT' | 'PATHWAY' | 'ALTERNATIVE';

  /** Relationship strength */
  strength: number;

  /** Why related */
  reason: string;
}

/**
 * Confidence in recommendation.
 */
export interface RecommendationConfidence {
  /** Overall confidence (0-100) */
  overall: number;

  /** Recommendation confidence component */
  recommendationConfidence: number;

  /** Evidence confidence component */
  evidenceConfidence: number;

  /** Profile confidence component */
  profileConfidence: number;

  /** Career confidence component */
  careerConfidence: number;

  /** Confidence level */
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Recommendation metadata.
 */
export interface RecommendationMetadata {
  /** Ranking method used */
  rankingMethod: string;

  /** Engine version */
  version: string;

  /** Number of careers evaluated */
  careersEvaluated: number;

  /** Generation timestamp */
  generatedAt: Date;
}

/**
 * Recommendation set for a student.
 */
export interface RecommendationSet {
  /** Student profile identifier */
  studentProfileId: string;

  /** Top recommendations */
  topRecommendations: CareerRecommendation[];

  /** Alternative recommendations */
  alternativeRecommendations: CareerRecommendation[];

  /** Stretch recommendations */
  stretchRecommendations: CareerRecommendation[];

  /** Complete ranked list */
  allRecommendations: CareerRecommendation[];

  /** Set metadata */
  metadata: RecommendationSetMetadata;
}

/**
 * Recommendation set metadata.
 */
export interface RecommendationSetMetadata {
  /** Total careers evaluated */
  totalEvaluated: number;

  /** Total recommendations generated */
  totalRecommended: number;

  /** Generation timestamp */
  generatedAt: Date;

  /** Average recommendation score */
  averageScore: number;

  /** Average confidence */
  averageConfidence: number;
}

/**
 * Recommendation scoring dimensions.
 */
export interface RecommendationDimensions {
  /** Fit weight */
  fitWeight: number;

  /** Future relevance weight */
  futureRelevanceWeight: number;

  /** Career mobility weight */
  careerMobilityWeight: number;

  /** Lifestyle alignment weight */
  lifestyleAlignmentWeight: number;

  /** Risk alignment weight */
  riskAlignmentWeight: number;

  /** Market opportunity weight */
  marketOpportunityWeight: number;
}

/**
 * Default recommendation dimension weights.
 */
export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationDimensions = {
  fitWeight: 0.35,
  futureRelevanceWeight: 0.15,
  careerMobilityWeight: 0.15,
  lifestyleAlignmentWeight: 0.15,
  riskAlignmentWeight: 0.1,
  marketOpportunityWeight: 0.1,
};

/**
 * Recommendation configuration.
 */
export interface RecommendationConfig {
  /** Dimension weights */
  weights: RecommendationDimensions;

  /** Threshold for strong match */
  strongMatchThreshold: number;

  /** Threshold for good match */
  goodMatchThreshold: number;

  /** Threshold for potential match */
  potentialMatchThreshold: number;

  /** Number of top recommendations */
  topRecommendationCount: number;

  /** Number of alternative recommendations */
  alternativeRecommendationCount: number;

  /** Number of stretch recommendations */
  stretchRecommendationCount: number;

  /** Minimum confidence threshold */
  minConfidenceThreshold: number;

  /** Minimum fit score threshold */
  minFitScoreThreshold: number;
}

/**
 * Default recommendation configuration.
 */
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  weights: DEFAULT_RECOMMENDATION_WEIGHTS,
  strongMatchThreshold: 80,
  goodMatchThreshold: 65,
  potentialMatchThreshold: 50,
  topRecommendationCount: 5,
  alternativeRecommendationCount: 3,
  stretchRecommendationCount: 3,
  minConfidenceThreshold: 50,
  minFitScoreThreshold: 40,
};

/**
 * Ranking criteria for recommendations.
 */
export interface RankingCriteria {
  /** Prioritize fit */
  prioritizeFit?: boolean;

  /** Prioritize future outlook */
  prioritizeFuture?: boolean;

  /** Prioritize safety */
  prioritizeSafety?: boolean;

  /** Prioritize optionality */
  prioritizeOptionality?: boolean;

  /** Prioritize lifestyle */
  prioritizeLifestyle?: boolean;
}

/**
 * Recommendation filter parameters.
 */
export interface RecommendationFilter {
  /** Minimum score */
  minScore?: number;

  /** Recommendation types to include */
  types?: RecommendationType[];

  /** Minimum confidence */
  minConfidence?: number;

  /** Maximum concerns */
  maxConcerns?: number;

  /** Require specific fit level */
  requireFitLevel?: FitLevel;
}

/**
 * Comparison between two recommendations.
 */
export interface RecommendationComparison {
  /** Recommendations being compared */
  recommendationA: CareerRecommendation;
  recommendationB: CareerRecommendation;

  /** Score difference */
  scoreDifference: number;

  /** Fit difference */
  fitDifference: number;

  /** Why A is better (if it is) */
  whyABetter?: string[];

  /** Why B is better (if it is) */
  whyBBetter?: string[];

  /** Key differentiators */
  keyDifferentiators: string[];
}

/**
 * Recommendation analytics.
 */
export interface RecommendationAnalytics {
  /** Total recommendations generated */
  totalRecommendations: number;

  /** Distribution by type */
  typeDistribution: Record<RecommendationType, number>;

  /** Average scores by dimension */
  averageScores: Record<string, number>;

  /** Confidence distribution */
  confidenceDistribution: Record<string, number>;

  /** Most common strengths */
  commonStrengths: Array<{ strength: string; count: number }>;

  /** Most common concerns */
  commonConcerns: Array<{ concern: string; count: number }>;
}

/**
 * Career option for decision making.
 */
export interface CareerOption {
  /** Career identifier */
  careerId: CareerId;

  /** Option type */
  optionType: 'PRIMARY' | 'ALTERNATIVE' | 'BACKUP' | 'STRETCH';

  /** Recommendation score */
  score: number;

  /** Rationale */
  rationale: string;

  /** Key tradeoffs */
  tradeoffs: string[];

  /** Next steps */
  nextSteps: string[];
}
