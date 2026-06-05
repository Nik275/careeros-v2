/**
 * CareerOS Outcome Tracking Engine V1
 *
 * Tracks the complete lifecycle of a student's decision from assessment through outcome.
 * Privacy-aware, scalable to millions of records, with comprehensive analytics.
 *
 * @module intelligence/outcome-tracking-engine
 * @version 1.0.0
 */

export {
  OutcomeTrackingEngineV1,
  createOutcomeTrackingEngine,
  createOutcomeRecord,
  createOutcomeSnapshot,
  recordAction,
  aggregateOutcomes,
  DEFAULT_OUTCOME_TRACKING_CONFIG,
} from './OutcomeTrackingEngineV1.js';

export type {
  OutcomeRecordId,
  StudentId,
  RecommendationId,
  PathId,
  SnapshotId,
  OutcomeTimepoint,
  EducationProgress,
  SkillGrowth,
  IncomeGrowth,
  SatisfactionMetrics,
  StressMetrics,
  RegretMetrics,
  ConfidenceMetrics,
  OutcomeSnapshot,
  ActionTaken,
  OutcomeRecord,
  OutcomeQuery,
  OutcomeAggregation,
  OutcomeRepository,
  OutcomeTrackingConfig,
} from './OutcomeTrackingEngineV1.js';
