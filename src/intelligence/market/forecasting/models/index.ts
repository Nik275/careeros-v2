/**
 * CareerOS Market Intelligence - Forecasting Models
 *
 * Core data models for market forecasting.
 */

export {
  Forecast,
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
} from './Forecast';

export {
  ForecastScenario,
  createForecastScenario,
  createScenarioSet,
  compareScenarios,
  generateScenarioSummary,
  validateScenario,
  type ScenarioType,
  type ScenarioProbability,
} from './ForecastScenario';

export {
  ForecastRange,
  createForecastRange,
  createAsymmetricRange,
  calculateVariance,
  adjustRangeForHorizon,
  mergeRanges,
  isWithinRange,
  getRangeWidth,
  assessUncertainty,
} from './ForecastRange';

export {
  ForecastConfidence,
  ConfidenceFactors,
  calculateConfidence,
  assessConfidenceLevel,
  adjustConfidenceForHorizon,
  compareConfidence,
  mergeConfidence,
} from './ForecastConfidence';

export {
  ForecastEvidence,
  EvidenceCollection,
  createForecastEvidence,
  buildEvidenceCollection,
  scoreEvidenceQuality,
  filterEvidence,
  mergeEvidence,
  generateEvidenceSummary,
  type EvidenceType,
  type EvidenceQuality,
} from './ForecastEvidence';
