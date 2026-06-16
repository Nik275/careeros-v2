/**
 * CareerOS Learning Loop System
 *
 * Transforms CareerOS into a continuously learning intelligence system
 * that learns from outcomes and feeds lessons back into future recommendations.
 *
 * @module intelligence/learning-loop
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  DEFAULT_LEARNING_CONFIG,
  LearningEventType,
} from './learning-loop-types';

export type {
  // Core types
  RecommendationId,
  StudentId,
  OutcomeId,
  Timestamp,
  ConfidenceScore,
  SatisfactionScore,
  RegretScore,
  SuccessLevel,
  
  // Outcome types
  OutcomeTimeline,
  OutcomeMetrics,
  OutcomeFeedback,
  ConfidenceImpact,
  RecommendationImpact,
  ContextualFactors,
  
  // Learning profile types
  RecommendationLearningProfile,
  RecommendationPerformanceMetrics,
  ProfileEffectiveness,
  RegretPattern,
  ConfidenceGrowthPattern,
  LearningHistoryEntry,
  
  // Confidence adjustment types
  ConfidenceAdjustmentRule,
  AdjustmentCondition,
  AdjustmentAction,
  ConfidenceAdjustmentResult,
  AdjustmentEvidence,
  
  // Population learning types
  PopulationInsights,
  SuccessPath,
  FailurePath,
  UnexpectedOutcome,
  HiddenOpportunity,
  ProfileSpecificPattern,
  AggregateMetrics,
  
  // Learning loop types
  LearningLoopConfig,
  LearningLoopReport,
  RecommendationAdjustment,
  ConfidenceShift,
  ExtractedLesson,
  FutureImpact,
  SystemLearningMetrics,
  
  // Student profile types
  StudentProfile,
  ProfileCharacteristic,
  StudentHistory,
  OutcomeSummary,
  StudentState,
  
  // Event types
  LearningEvent,
  
  // Utility types
  TimeWindow,
  TrendAnalysis,
  ComparisonResult,
} from './learning-loop-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  OutcomeFeedbackEngine,
  DEFAULT_OUTCOME_OPTIONS,
} from './outcome-feedback-engine';

export type {
  OutcomeRecord,
  OutcomeFeedbackEngineOptions,
} from './outcome-feedback-engine';

export {
  RecommendationLearningEngine,
  DEFAULT_LEARNING_OPTIONS,
} from './recommendation-learning-engine';

export type {
  RecommendationInstance,
  LearningEngineOptions,
} from './recommendation-learning-engine';

export {
  ConfidenceAdjustmentEngine,
  DEFAULT_ADJUSTMENT_OPTIONS,
} from './confidence-adjustment-engine';

export type {
  AdjustmentContext,
  ConfidenceAdjustmentEngineOptions,
} from './confidence-adjustment-engine';

export {
  PopulationLearningEngine,
  DEFAULT_POPULATION_OPTIONS,
} from './population-learning-engine';

export type {
  PopulationDataPoint,
  PopulationLearningEngineOptions,
} from './population-learning-engine';

export {
  LearningLoopEngine,
} from './learning-loop-engine';

export type {
  LearningLoopEngineOptions,
  RecommendationSet,
} from './learning-loop-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { LearningLoopEngine as default } from './learning-loop-engine';
