/**
 * CareerOS Information Value Engine V1
 *
 * Identifies missing information that would improve decision quality.
 * Estimates value of gathering information and recommends specific actions.
 *
 * @module intelligence/information-value-engine
 * @version 1.0.0
 */

export {
  InformationValueEngineV1,
  createInformationValueEngine,
  analyzeInformationValue,
  identifyUncertaintyFactors,
  identifyMissingEvidence,
  identifyWeakAssumptions,
  generateRecommendedActions,
  generateStrategy,
  generateExplanation,
  DEFAULT_INFORMATION_VALUE_CONFIG,
} from './InformationValueEngineV1.js';

export type {
  InformationType,
  InformationMethod,
  UncertaintyFactor,
  MissingEvidence,
  WeakAssumption,
  RecommendedAction,
  AssessmentRecommendation,
  ExperimentRecommendation,
  ExplorationActivity,
  InformationValueAnalysis,
  InformationValueConfig,
} from './InformationValueEngineV1.js';
