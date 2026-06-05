/**
 * CareerOS Outcome Tracking System
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Tracks student outcomes, compares predictions to reality,
 * and generates learning signals for continuous improvement.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core Identifiers
  OutcomeRecordId,
  StudentId,
  RecommendationId,
  PathId,
  OutcomeEventId,
  TimelineEntryId,
  GrowthSnapshotId,
  PredictionId,

  // Time and Timeline
  OutcomeTimepoint,
  TimelineEventType,
  TimelineEntry,

  // Outcome Categories
  CareerDecisionOutcome,
  EducationOutcome,
  CollegeOutcome,
  SkillOutcome,
  InternshipOutcome,
  JobOutcome,
  ExplorationOutcome,

  // Psychological Outcomes
  ConfidenceOutcome,
  ClarityOutcome,
  WellbeingOutcome,

  // Student Growth
  GrowthDimension,
  GrowthMeasurement,
  StudentGrowthProfile,
  GrowthSnapshot,

  // Predictions and Comparisons
  Prediction,
  PredictionComparison,
  AccuracyMetrics,
  RecommendationAccuracy,

  // Quality
  OutcomeQuality,
  OutcomeClassification,
  OutcomeQualityAssessment,

  // Learning Signals
  LearningSignal,
  WeightAdjustmentSignal,
  CalibrationUpdate,

  // Analytics
  OutcomeAnalytics,
  OutcomeAggregationQuery,
  OutcomeAggregation,

  // Events
  OutcomeEventType,
  OutcomeEvent,
  OutcomeEventHandler,

  // Configuration
  OutcomeTrackingConfig,

  // Main Record
  StudentOutcomeRecord,

  // Interfaces
  IOutcomeEventEngine,
  IOutcomeStore,
  IOutcomeTracker,
  ITimelineEngine,
  IComparisonEngine,
  IQualityEngine,
  IGrowthEngine,
  ILearningSignalEngine,
  IAnalyticsEngine,
} from './outcome-types.js';

export {
  DEFAULT_OUTCOME_TRACKING_CONFIG,
} from './outcome-types.js';

// ============================================================================
// EVENT ENGINE
// ============================================================================

export {
  OutcomeEventEngine,
  BatchedEventEmitter,
  EventReplay,
  createOutcomeEventEngine,
  createBatchedEmitter,
  createEventReplay,
  createOutcomeRecordedEvent,
  createGrowthMeasuredEvent,
  createPredictionMadeEvent,
  createPredictionValidatedEvent,
  createComparisonGeneratedEvent,
  createQualityAssessedEvent,
  createSignalGeneratedEvent,
  createTimelineUpdatedEvent,
} from './outcome-event-engine.js';

// ============================================================================
// STORE
// ============================================================================

export {
  InMemoryOutcomeStore,
  LocalStorageOutcomeStore,
  CachedOutcomeStore,
  ValidatedOutcomeStore,
  EncryptedOutcomeStore,
  createInMemoryStore,
  createLocalStorageStore,
  createCachedStore,
  createValidatedStore,
  createEncryptedStore,
  createDefaultStore,
  migrateStore,
  exportStore,
  importStore,
} from './outcome-store.js';

// ============================================================================
// TRACKER
// ============================================================================

export {
  OutcomeTracker,
  createOutcomeTracker,
} from './outcome-tracker.js';

// ============================================================================
// TIMELINE ENGINE
// ============================================================================

export {
  TimelineEngine,
  createTimelineEngine,
  buildTimeline,
  generateTimelineSummary,
  generateMentorNarrative,
} from './outcome-timeline-engine.js';

export type {
  TimelineSegment,
  TimelineMilestone,
  TimelineViewConfig,
  TimelineSummary,
  TimelineComparison,
} from './outcome-timeline-engine.js';

// ============================================================================
// COMPARISON ENGINE
// ============================================================================

export {
  ComparisonEngine,
  createComparisonEngine,
  comparePrediction,
  calculateAccuracy,
  assessRecommendation,
} from './outcome-comparison-engine.js';

export type {
  PredictionErrorAnalysis,
  BiasAnalysis,
  CalibrationAnalysis,
  RecommendationOutcomeComparison,
  TimeSeriesComparison,
} from './outcome-comparison-engine.js';

// ============================================================================
// QUALITY ENGINE
// ============================================================================

export {
  QualityEngine,
  createQualityEngine,
  assessQuality,
  classify,
} from './outcome-quality-engine.js';

export type {
  QualityFactors,
  OutcomePattern,
  LongTermProjection,
  HolisticAssessment,
} from './outcome-quality-engine.js';

// ============================================================================
// STUDENT GROWTH ENGINE
// ============================================================================

export {
  StudentGrowthEngine,
  createStudentGrowthEngine,
  createInitialGrowthProfile,
  generateGrowthReport,
} from './student-growth-engine.js';

export type {
  GrowthTrajectory,
  GrowthPattern,
  ComparativeGrowth,
  GrowthRecommendation,
  GrowthMilestone,
  GrowthReport,
} from './student-growth-engine.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  OutcomeTrackingEngine,
  createOutcomeTrackingEngine,
} from './outcome-tracking-engine.js';

export type {
  TimelineSummary as MainTimelineSummary,
  TimelineViewConfig as MainTimelineViewConfig,
  AccuracyMetrics as MainAccuracyMetrics,
  BiasAnalysis as MainBiasAnalysis,
  CalibrationAnalysis as MainCalibrationAnalysis,
  QualityFactors as MainQualityFactors,
  OutcomePattern as MainOutcomePattern,
  LongTermProjection as MainLongTermProjection,
  HolisticAssessment as MainHolisticAssessment,
  GrowthReport as MainGrowthReport,
  GrowthTrajectory as MainGrowthTrajectory,
  GrowthRecommendation as MainGrowthRecommendation,
} from './outcome-tracking-engine.js';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { createOutcomeTrackingEngine as default } from './outcome-tracking-engine.js';
