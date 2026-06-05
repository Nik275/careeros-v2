/**
 * CareerOS Outcome Learning Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * CareerOS continuously improves recommendation quality from real-world outcomes.
 *
 * Core philosophy: "Recommendations are hypotheses. Outcomes are feedback."
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core Identifiers
  LearningSignalId,
  FeedbackBatchId,
  LearningSessionId,
  CalibrationModelId,

  // Learning Signals
  SignalType,
  SignalPriority,
  SignalSource,
  OutcomeLearningSignal,

  // Feedback
  FeedbackType,
  FeedbackSentiment,
  RawFeedback,
  ProcessedFeedback,
  FeedbackInsight,

  // Recommendation Learning
  RecommendationLearningEntry,
  RecommendationLearningReport,

  // Decision Learning
  DecisionLearningEntry,
  DecisionLearningReport,
  DecisionQuality,
  RegretSignal,
  OpportunitySignal,

  // Confidence Calibration
  ConfidenceCalibrationEntry,
  CalibrationMetrics,
  ConfidenceReliability,

  // Outcome Weights
  OutcomeFactor,
  FactorWeight,
  FactorImportance,
  OutcomeWeightModel,

  // Learning Reports
  LearningReport,
  PredictorPerformance,
  LearningInsight,

  // Analytics
  LearningAnalytics,

  // Configuration
  OutcomeLearningConfig,
} from './learning-types.js';

export {
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

// ============================================================================
// FEEDBACK INGESTION
// ============================================================================

export {
  FeedbackIngestionEngine,
  FeedbackValidator,
  SignalExtractor,
  InsightExtractor,
  createFeedbackIngestionEngine,
  createRawFeedback,
  outcomeEventToFeedback,
} from './feedback-ingestion-engine.js';

// ============================================================================
// RECOMMENDATION LEARNING
// ============================================================================

export {
  RecommendationLearningEngine,
  AccuracyCalculator,
  UtilityCalculator,
  StabilityCalculator,
  ImpactCalculator,
  InsightGenerator,
  createRecommendationLearningEngine,
  createRecommendationLearningEntry,
} from './recommendation-learning-engine.js';

// ============================================================================
// DECISION LEARNING
// ============================================================================

export {
  DecisionLearningEngine,
  DecisionQualityAssessor,
  RegretAnalyzer,
  OpportunityAnalyzer,
  PatternAnalyzer,
  createDecisionLearningEngine,
  createDecisionLearningEntry,
} from './decision-learning-engine.js';

// ============================================================================
// CONFIDENCE CALIBRATION
// ============================================================================

export {
  ConfidenceCalibrationEngine,
  CalibrationBins,
  ECECalculator,
  BiasDetector,
  TrendAnalyzer,
  createConfidenceCalibrationEngine,
  createCalibrationEntry,
} from './confidence-calibration-engine.js';

// ============================================================================
// OUTCOME WEIGHTS
// ============================================================================

export {
  OutcomeWeightEngine,
  CorrelationCalculator,
  WeightUpdater,
  PredictivePowerCalculator,
  StabilityCalculator as WeightStabilityCalculator,
  createOutcomeWeightEngine,
} from './outcome-weight-engine.js';

// ============================================================================
// LEARNING SIGNALS
// ============================================================================

export {
  LearningSignalEngine,
  SignalProcessor,
  SignalGenerator,
  LearningApplier,
  createLearningSignalEngine,
} from './learning-signal-engine.js';

// ============================================================================
// LEARNING REPORTS
// ============================================================================

export {
  LearningReportEngine,
  LearningVelocityCalculator,
  KnowledgeGrowthCalculator,
  AccuracyImprovementCalculator,
  PredictorPerformanceTracker,
  InsightGenerator as ReportInsightGenerator,
  createLearningReportEngine,
} from './learning-report-engine.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  OutcomeLearningEngine,
  createOutcomeLearningEngine,
} from './outcome-learning-engine.js';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { createOutcomeLearningEngine as default } from './outcome-learning-engine.js';
