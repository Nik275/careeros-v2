/**
 * CareerOS Market Intelligence - Forecasting Models
 *
 * Core data models for market forecasting.
 */

export {
  createForecast,
  calculateExpectedValues,
  generateForecastSummary,
  validateForecast,
  isForecastStale,
  getMostLikelyScenario,
  compareForecasts,
  type ForecastEntityType,
  type ForecastHorizon,
  type ForecastStatus,
  type ForecastSignalDirection,
} from './Forecast';

export type {
  Forecast,
  ForecastInput,
  ForecastSignal,
} from './Forecast';

export {
  createForecastScenario,
  createScenarioSet,
  compareScenarios,
  generateScenarioSummary,
  validateScenario,
  type ScenarioType,
  type ScenarioProbability,
} from './ForecastScenario';

export type {
  ForecastScenario,
} from './ForecastScenario';

export {
  createForecastRange,
  createAsymmetricRange,
  calculateVariance,
  adjustRangeForHorizon,
  mergeRanges,
  isWithinRange,
  getRangeWidth,
  assessUncertainty,
} from './ForecastRange';

export type {
  ForecastRange,
} from './ForecastRange';

export {
  calculateConfidence,
  assessConfidenceLevel,
  adjustConfidenceForHorizon,
  compareConfidence,
  mergeConfidence,
} from './ForecastConfidence';

export type {
  ForecastConfidence,
  ConfidenceFactors,
} from './ForecastConfidence';

export {
  createForecastEvidence,
  buildEvidenceCollection,
  scoreEvidenceQuality,
  filterEvidence,
  mergeEvidence,
  generateEvidenceSummary,
  type EvidenceType,
  type EvidenceQuality,
} from './ForecastEvidence';

export type {
  ForecastEvidence,
  EvidenceCollection,
} from './ForecastEvidence';
