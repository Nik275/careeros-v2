/**
 * CareerOS Intelligence Calibration Engine
 *
 * Ensures confidence scores reflect actual reliability through
 * continuous learning from real-world outcomes.
 *
 * @module intelligence/calibration
 */

export {
  ReliabilityBand,
  CalibrationStatus,
  TimeHorizon,
  TrustLevel,
  CalibrationEventType,
  DEFAULT_CALIBRATION_CONFIG,
} from './calibration-types';

export type {
  // Core types
  ConfidenceLevel,
  ReliabilityScore,
  CalibrationError,
  Timestamp,

  // Observation types
  CalibrationObservation,
  CalibrationContext,

  // Profile types
  CalibrationProfile,
  BinCalibration,
  CalibrationTrend,
  RecommendationCalibrationProfile,
  RecommendationSuccessMetrics,
  DecisionCalibrationProfile,
  DecisionQualityMetrics,
  RegretCalibrationProfile,
  RegretPredictionMetrics,
  CriticalityCalibrationProfile,
  ImpactMetrics,

  // Reliability types
  ReliabilityAssessment,
  ReliabilityFactor,
  ConfidenceTrustworthiness,

  // Report types
  CalibrationReport,
  CalibrationSummary,
  SystemCalibration,
  DriftAnalysis,
  LearningProgress,
  CalibrationRecommendation,

  // Configuration
  CalibrationEngineConfig,

  // Event types
  CalibrationEvent,

  // Utility types
  ConfidenceAdjustment,
  CalibrationMetrics,
  ReliabilityDiagramPoint,
  CalibrationHistory,
} from './calibration-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  ConfidenceCalibrationEngine,
} from './confidence-calibration-engine';

export type {
  ConfidenceCalibrationEngineOptions,
} from './confidence-calibration-engine';

export {
  RecommendationCalibrationEngine,
  DEFAULT_RECOMMENDATION_CONFIG,
} from './recommendation-calibration-engine';

export type {
  RecommendationOutcome,
  RecommendationCalibrationConfig,
} from './recommendation-calibration-engine';

export {
  DecisionCalibrationEngine,
} from './decision-calibration-engine';

export type {
  DecisionOutcome,
  DecisionQualityAssessment,
} from './decision-calibration-engine';

export {
  RegretCalibrationEngine,
} from './regret-calibration-engine';

export type {
  RegretSignal,
  RegretPrediction,
} from './regret-calibration-engine';

export {
  CriticalityCalibrationEngine,
} from './criticality-calibration-engine';

export type {
  ImpactObservation,
  CriticalityPrediction,
} from './criticality-calibration-engine';

export {
  ReliabilityEngine,
  DEFAULT_RELIABILITY_CONFIG,
} from './reliability-engine';

export type {
  ReliabilityEngineConfig,
} from './reliability-engine';

export {
  CalibrationReportEngine,
  DEFAULT_REPORT_CONFIG,
} from './calibration-report-engine';

export type {
  ReportEngineConfig,
  SystemProfile,
} from './calibration-report-engine';

export {
  CalibrationEngine,
} from './calibration-engine';

export type {
  CalibrationEngineOptions,
  UnifiedCalibrationProfile,
  MentorGuidance,
} from './calibration-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { CalibrationEngine as default } from './calibration-engine';
