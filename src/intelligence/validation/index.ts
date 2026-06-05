/**
 * Intelligence Validation Module
 *
 * Production-grade validation layer for CareerOS intelligence stack.
 * Ensures recommendations are accurate, stable, explainable, calibrated, and trustworthy.
 *
 * @module intelligence/validation
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core types
  ValidationId,
  ValidationTimestamp,
  CalibrationBin,
  CalibrationStats,
  AssessmentPath,
  DriftScore,
  PathComparison,
  EvidenceGap,
  UncertaintySource,
  SystemResponse,
  ConfidenceBounds,
  OverallUncertainty,
  CounterfactualScenario,
  SensitivityRanking,
  Robustness,
  DecisionBoundary,
  EvidenceSource,
  EngineAudit,
  ConfidenceBasis,
  OpportunityCost,
  UncertaintyAudit,
  AuditFinding,
  AuditVerdict,
  ValidationStatus,
  ValidationConfig,

  // Report types
  CalibrationReport,
  StabilityReport,
  ConsistencyReport,
  UncertaintyAssessment,
  CounterfactualReport,
  RecommendationAuditReport,
  ValidationReport,
  ValidationSummary,
} from './validation-types';

export {
  DEFAULT_VALIDATION_CONFIG,
} from './validation-types';

// ============================================================================
// ENGINES
// ============================================================================

export { ConfidenceCalibrationEngine } from './confidence-calibration-engine';
export type {
  CalibrationConfig,
  PredictionRecord,
} from './confidence-calibration-engine';

export { RecommendationStabilityEngine } from './recommendation-stability-engine';
export type {
  StabilityConfig,
  RecommendationSnapshot,
  PerturbationInput,
} from './recommendation-stability-engine';

export { RecommendationConsistencyEngine } from './recommendation-consistency-engine';
export type {
  ConsistencyConfig,
  PathwayResult,
  ComponentDefinition,
} from './recommendation-consistency-engine';

export { UncertaintyEngine } from './uncertainty-engine';
export type {
  UncertaintyConfig,
  UncertaintyInput,
} from './uncertainty-engine';

export { CounterfactualEngine } from './counterfactual-engine';
export type {
  CounterfactualConfig,
  CounterfactualInput,
} from './counterfactual-engine';

export { RecommendationAuditEngine } from './recommendation-audit-engine';
export type {
  AuditConfig,
  AuditInput,
} from './recommendation-audit-engine';

export { IntelligenceValidationEngine } from './intelligence-validation-engine';
export type {
  IntelligenceValidationConfig,
  ValidationRunInput,
  ValidationRunOptions,
} from './intelligence-validation-engine';

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export { default } from './intelligence-validation-engine';
