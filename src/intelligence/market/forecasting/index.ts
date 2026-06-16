/**
 * CareerOS Market Intelligence - Market Forecasting Module
 *
 * Phase 1.6: Market Forecasting & Scenario Intelligence
 *
 * Estimates future market conditions using historical intelligence.
 * Generates scenarios, not deterministic predictions.
 *
 * Core Principle: Never output "The future will be X."
 * Always output "Given current evidence, the most likely futures are..."
 *
 * @module market-forecasting
 */

// Main Engine
export {
  ForecastEngine,
  createForecastEngine,
  type ForecastEngineConfig,
  type BatchForecastResult,
  type ForecastComparison,
} from './ForecastEngine';

// Domain Engines
export {
  CareerForecastEngine,
  createCareerForecastEngine,
  type CareerForecastConfig,
  type CareerForecastInputs,
  type CareerForecastResult,
} from './CareerForecastEngine';

export {
  SkillForecastEngine,
  createSkillForecastEngine,
  type SkillForecastConfig,
  type SkillForecastInputs,
  type SkillForecastResult,
} from './SkillForecastEngine';

export {
  IndustryForecastEngine,
  createIndustryForecastEngine,
  type IndustryForecastConfig,
  type IndustryForecastInputs,
  type IndustryForecastResult,
} from './IndustryForecastEngine';

export {
  RegionForecastEngine,
  createRegionForecastEngine,
  type RegionForecastConfig,
  type RegionForecastInputs,
  type RegionForecastResult,
} from './RegionForecastEngine';

// Supporting Engines
export {
  ScenarioGenerator,
  createScenarioGenerator,
  type ScenarioGeneratorConfig,
  type ScenarioContext,
} from './ScenarioGenerator';

export {
  ConfidenceForecastEngine,
  createConfidenceForecastEngine,
  type ConfidenceEngineConfig,
  type HistoricalDataPoint,
  type TrendAnalysis,
  type ConfidenceContext,
} from './ConfidenceForecastEngine';

export {
  ForecastValidationEngine,
  createForecastValidationEngine,
  type ValidationConfig,
  type ValidationResult,
  type CalibrationMetrics,
  type ForecastDrift,
} from './ForecastValidationEngine';

// Models
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
} from './models/Forecast';

export type {
  Forecast,
  ForecastInput,
  ForecastSignal,
} from './models/Forecast';

export {
  createForecastScenario,
  createScenarioSet,
  compareScenarios,
  generateScenarioSummary,
  validateScenario,
  type ScenarioType,
  type ScenarioProbability,
} from './models/ForecastScenario';

export type {
  ForecastScenario,
} from './models/ForecastScenario';

export {
  createForecastRange,
  createAsymmetricRange,
  calculateVariance,
  adjustRangeForHorizon,
  mergeRanges,
  isWithinRange,
  getRangeWidth,
  assessUncertainty,
} from './models/ForecastRange';

export type {
  ForecastRange,
} from './models/ForecastRange';

export {
  calculateConfidence,
  assessConfidenceLevel,
  adjustConfidenceForHorizon,
  compareConfidence,
  mergeConfidence,
} from './models/ForecastConfidence';

export type {
  ForecastConfidence,
  ConfidenceFactors,
} from './models/ForecastConfidence';

export {
  createForecastEvidence,
  buildEvidenceCollection,
  scoreEvidenceQuality,
  filterEvidence,
  mergeEvidence,
  generateEvidenceSummary,
  type EvidenceType,
  type EvidenceQuality,
} from './models/ForecastEvidence';

export type {
  ForecastEvidence,
  EvidenceCollection,
} from './models/ForecastEvidence';
