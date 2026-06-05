/**
 * CareerOS Career Recommendation Engine
 *
 * Phase C.4: Career Recommendation Engine
 *
 * Generates personalized career recommendations with explanations,
 * alternatives, and confidence assessments.
 *
 * @module recommendation
 * @version 1.0.0
 */

// Main Engine
export {
  CareerRecommendationEngine,
  createCareerRecommendationEngine,
} from './career-recommendation-engine';

// Component Engines
export {
  RecommendationRanker,
  createRecommendationRanker,
} from './recommendation-ranker';

export {
  RecommendationExplainer,
  createRecommendationExplainer,
} from './recommendation-explainer';

export {
  RecommendationConfidenceEngine,
  createRecommendationConfidenceEngine,
} from './recommendation-confidence-engine';

// Types
export type {
  RecommendationId,
  CareerRecommendation,
  RecommendationType,
  RecommendationExplanation,
  AlternativeRecommendation,
  RelatedCareer,
  RecommendationConfidence,
  RecommendationMetadata,
  RecommendationSet,
  RecommendationSetMetadata,
  RecommendationDimensions,
  RecommendationConfig,
  RankingCriteria,
  RecommendationFilter,
  RecommendationComparison,
  RecommendationAnalytics,
  CareerOption,
} from './recommendation-types';

// Constants
export {
  DEFAULT_RECOMMENDATION_CONFIG,
  DEFAULT_RECOMMENDATION_WEIGHTS,
} from './recommendation-types';
