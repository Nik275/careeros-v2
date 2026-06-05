/**
 * CareerOS Intelligence Calibration Engine
 *
 * Ensures confidence scores reflect actual reliability through
 * continuous learning from real-world outcomes.
 *
 * @module intelligence/calibration
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  // Core types
  ConfidenceLevel,
  ReliabilityScore,
  CalibrationError,
  Timestamp,
  
  // Enums
  ReliabilityBand,
  CalibrationStatus,
  TimeHorizon,
  TrustLevel,
  CalibrationEventType,
  
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
  DEFAULT_CALIBRATION_CONFIG,
  
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
  ConfidenceCalibrationEngineOptions,
} from './confidence-calibration-engine';

export {
  RecommendationCalibrationEngine,
  RecommendationOutcome,
  RecommendationCalibrationConfig,
  DEFAULT_RECOMMENDATION_CONFIG,
} from './recommendation-calibration-engine';

export {
  DecisionCalibrationEngine,
  DecisionOutcome,
  DecisionQualityAssessment,
} from './decision-calibration-engine';

export {
  RegretCalibrationEngine,
  RegretSignal,
  RegretPrediction,
} from './regret-calibration-engine';

export {
  CriticalityCalibrationEngine,
  ImpactObservation,
  CriticalityPrediction,
} from './criticality-calibration-engine';

export {
  ReliabilityEngine,
  ReliabilityEngineConfig,
  DEFAULT_RELIABILITY_CONFIG,
} from './reliability-engine';

export {
  CalibrationReportEngine,
  ReportEngineConfig,
  DEFAULT_REPORT_CONFIG,
  SystemProfile,
} from './calibration-report-engine';

export {
  CalibrationEngine,
  CalibrationEngineOptions,
  UnifiedCalibrationProfile,
  MentorGuidance,
} from './calibration-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { CalibrationEngine as default } from './calibration-engine';
