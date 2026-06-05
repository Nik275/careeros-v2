/**
 * CareerOS Uncertainty Intelligence Foundation V1
 *
 * Explicitly models uncertainty in all CareerOS outputs.
 * Transforms deterministic scores into confidence-bounded predictions.
 *
 * @module intelligence/uncertainty-engine
 * @version 1.0.0
 */

export {
  UncertaintyEngineV1,
  createUncertaintyEngine,
  confidenceToLevel,
  getConfidenceDescription,
  calculateStudentProfileConfidence,
  calculateCareerDataConfidence,
  calculateGraphQualityConfidence,
  calculateSimulationConfidence,
  generateUncertaintyProfile,
  DEFAULT_UNCERTAINTY_CONFIG,
} from './UncertaintyEngineV1.js';

export type {
  ConfidenceLevel,
  UncertaintyProfile,
  ComponentConfidence,
  StudentProfileConfidence,
  CareerDataConfidence,
  GraphQualityConfidence,
  SimulationConfidence,
  UncertaintyEngineConfig,
} from './UncertaintyEngineV1.js';
