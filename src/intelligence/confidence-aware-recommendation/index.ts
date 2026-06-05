/**
 * CareerOS Confidence-Aware Recommendation Layer V1
 *
 * Attaches confidence and uncertainty to all recommendations.
 * Every recommendation includes: expected utility, confidence, bounds, risk, and explanations.
 *
 * @module intelligence/confidence-aware-recommendation
 * @version 1.0.0
 */

export {
  ConfidenceAwareRecommendationEngineV1,
  createConfidenceAwareRecommendationEngine,
  calculateUtilityBounds,
  classifyRecommendationStrength,
  calculateDecisionRisk,
  generateRecommendationExplanation,
  buildConfidenceAwareRecommendation,
  buildRecommendationSet,
  DEFAULT_CONFIDENCE_AWARE_CONFIG,
} from './ConfidenceAwareRecommendationEngineV1.js';

export type {
  RecommendationId,
  RecommendationStrength,
  DecisionRiskLevel,
  UtilityBounds,
  ConfidenceAwareRecommendation,
  ConfidenceAwareRecommendationSet,
  ConfidenceAwareRecommendationConfig,
} from './ConfidenceAwareRecommendationEngineV1.js';
