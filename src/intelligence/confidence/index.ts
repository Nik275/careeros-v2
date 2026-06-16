/**
 * CareerOS Confidence Authority
 * 
 * Single source of truth for all uncertainty quantification.
 * 
 * @module confidence
 * @version 1.0.0
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type {
  Confidence,
  ValidatedConfidence,
  Uncertainty,
  Reliability,
  ConfidenceValue,
  ConfidenceFactor,
  ConfidenceEvidence,
  CalibrationStatus,
  ConfidenceRequest,
  PredictionType,
  Evidence,
  ConfidenceContext,
  UncertaintyProfile,
  ReliabilityAssessment,
  CalibrationObservation,
  CalibrationProfile,
  AggregationMethod,
  ConfidenceExplanation,
  ConfidenceHistory as ConfidenceHistorySnapshot,
  CalibrationStatusType,
  ReliabilityBand,
} from './ConfidenceTypes';

export {
  validateConfidence,
  migrateLegacyConfidence,
  getReliabilityBand,
  createDefaultBounds,
  ConfidenceError,
  ConfidenceValidationError,
  ConfidenceCalculationError,
  CalibrationError,
} from './ConfidenceTypes';

// ============================================================================
// AUTHORITY INTERFACE
// ============================================================================

export type { IConfidenceAuthority } from './IConfidenceAuthority';

// ============================================================================
// AUTHORITY
// ============================================================================

export {
  ConfidenceAuthority,
  getConfidenceAuthority,
  resetConfidenceAuthority,
  type ConfidenceAuthorityConfig,
  DEFAULT_AUTHORITY_CONFIG,
} from './ConfidenceAuthority';

export { default } from './ConfidenceAuthority';

// ============================================================================
// CALCULATOR
// ============================================================================

export {
  ConfidenceCalculator,
  getConfidenceCalculator,
  resetConfidenceCalculator,
  type CalculatorConfig,
  DEFAULT_CALCULATOR_CONFIG,
} from './ConfidenceCalculator';

// ============================================================================
// AGGREGATOR
// ============================================================================

export {
  ConfidenceAggregator,
  getConfidenceAggregator,
  resetConfidenceAggregator,
  type AggregationInput,
} from './ConfidenceAggregator';

// ============================================================================
// CALIBRATION
// ============================================================================

export {
  ConfidenceCalibration,
  getConfidenceCalibration,
  resetConfidenceCalibration,
  type CalibrationConfig,
  DEFAULT_CALIBRATION_CONFIG,
} from './ConfidenceCalibration';

// ============================================================================
// HISTORY
// ============================================================================

export {
  ConfidenceHistory,
  getConfidenceHistory,
  resetConfidenceHistory,
  type HistoryConfig,
  DEFAULT_HISTORY_CONFIG,
} from './ConfidenceHistory';

// ============================================================================
// MONITORING
// ============================================================================

export {
  ConfidenceMonitor,
  getConfidenceMonitor,
  resetConfidenceMonitor,
  type MonitoringConfig,
  DEFAULT_MONITORING_CONFIG,
  type ConfidenceMetrics,
  type SystemHealth,
  type DriftDetectionResult,
} from './ConfidenceMonitoring';

// ============================================================================
// EVENTS
// ============================================================================

export {
  ConfidenceEventEmitter,
  createCalculatedEvent,
  createDriftDetectedEvent,
  createSourceTrustUpdatedEvent,
  type ConfidenceEvent,
  type ConfidenceEventType,
  type IConfidenceEventEmitter,
} from './ConfidenceEvents';

// ============================================================================
// DOMAIN MODULES (DEPRECATED)
// ============================================================================

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export {
  CareerConfidenceModule,
  getCareerConfidenceModule,
  resetCareerConfidenceModule,
  type CareerConfidenceInput,
  type CareerConfidenceResult,
} from './modules/CareerConfidenceModule';

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export {
  ArchetypeConfidenceModule,
  getArchetypeConfidenceModule,
  resetArchetypeConfidenceModule,
  type ArchetypeConfidenceInput,
  type ArchetypeConfidenceResult,
} from './modules/ArchetypeConfidenceModule';

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export {
  DecisionConfidenceModule,
  getDecisionConfidenceModule,
  resetDecisionConfidenceModule,
  type DecisionConfidenceInput,
  type DecisionConfidenceResult,
} from './modules/DecisionConfidenceModule';

/**
 * @deprecated Use ConfidenceAuthority directly
 */
export {
  MarketConfidenceModule,
  getMarketConfidenceModule,
  resetMarketConfidenceModule,
  type MarketConfidenceInput,
  type MarketConfidenceResult,
} from './modules/MarketConfidenceModule';
