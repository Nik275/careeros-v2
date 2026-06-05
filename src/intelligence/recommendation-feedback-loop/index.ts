/**
 * Recommendation Feedback Loop
 *
 * Infrastructure for comparing recommendations against actual outcomes.
 *
 * ## Purpose
 *
 * Track recommendation accuracy, measure prediction quality,
 * and generate learning signals for recommendation improvement.
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   RecommendationFeedbackEngine,
 *   createRecommendationFeedbackEngine,
 * } from '@/intelligence/recommendation-feedback-loop';
 *
 * // Create engine
 * const engine = createRecommendationFeedbackEngine();
 *
 * // Analyze recommendations against outcomes
 * const result = engine.analyze({
 *   recommendations: recommendationHistory,
 *   outcomes: outcomeRecords,
 *   options: {
 *     generateSignals: true,
 *   },
 * });
 *
 * // View metrics
 * console.log(`Follow rate: ${result.aggregateMetrics.followRate}`);
 * console.log(`Overall accuracy: ${result.aggregateMetrics.overallAccuracy}`);
 *
 * // View learning signals
 * for (const signal of result.learningSignals) {
 *   console.log(`[${signal.priority}] ${signal.description}`);
 *   console.log(`  Action: ${signal.suggestedAction}`);
 * }
 * ```
 *
 * ## Tracked Metrics
 *
 * - **Path Choice Accuracy**: Did student choose recommended path?
 * - **Satisfaction Prediction**: How close was predicted vs actual satisfaction?
 * - **Utility Prediction**: How accurate was utility estimation?
 * - **Regret Prediction**: Did we correctly predict regret likelihood?
 * - **Confidence Calibration**: Are confidence scores well-calibrated?
 *
 * ## Learning Signals
 *
 * Generated signals include:
 * - Systematic bias detection
 * - Confidence calibration issues
 * - Segment performance problems
 * - Path misalignment detection
 * - Utility/Regret prediction errors
 *
 * ## Design Principles
 *
 * - **No Machine Learning**: Only transparent, rule-based measurement
 * - **Explainable**: All calculations have clear reasoning
 * - **Conservative**: Confidence estimates err on the side of caution
 * - **Auditable**: Clear trail from recommendation to outcome
 *
 * @module recommendation-feedback-loop
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  FeedbackAnalysisId,
  RecommendationOutcomePair,
  AccuracyMeasurement,
  RecommendationAccuracyAnalysis,
  ConfidenceCalibration,
  AggregateAccuracyMetrics,
  TypeAccuracyMetrics,
  PathAccuracyMetrics,
  SegmentAccuracyMetrics,
  CalibrationMetrics,
  LearningSignal,
  RecommendationImprovementSignal,
  FeedbackLoopInput,
  FeedbackLoopOutput,
  RecommendationFeedbackConfig,
} from './types.js';

// ============================================================================
// ENUMS
// ============================================================================

export {
  AccuracyType,
  ComparisonResult,
  LearningSignalType,
  ImprovementArea,
} from './types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export { DEFAULT_FEEDBACK_CONFIG } from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  RecommendationFeedbackEngine,
  createRecommendationFeedbackEngine,
  quickAnalyze,
  calculateSimpleAccuracy,
} from './RecommendationFeedbackEngine.js';

// ============================================================================
// MEASUREMENT FUNCTIONS
// ============================================================================

export {
  measurePathChoiceAccuracy,
  measureSatisfactionAccuracy,
  measureUtilityAccuracy,
  measureRegretAccuracy,
  measureConfidenceCalibration,
  calculateCalibrationMetrics,
  calculateTypeAccuracyMetrics,
  calculatePathAccuracyMetrics,
  calculateOverallAccuracy,
} from './measurements.js';

// ============================================================================
// SIGNAL GENERATION
// ============================================================================

export {
  generateLearningSignals,
  generateImprovementSignals,
} from './signals.js';
