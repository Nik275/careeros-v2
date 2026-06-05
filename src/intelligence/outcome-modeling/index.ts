/**
 * CareerOS Outcome Modeling Engine
 *
 * Estimates outcome ranges with confidence intervals for career scenarios.
 * Does NOT predict exact outcomes - only models plausible ranges.
 *
 * @module intelligence/outcome-modeling
 * @version 1.0.0
 */

export {
  OutcomeModelingEngine,
  createOutcomeModelingEngine,
  modelOutcomes,
  DEFAULT_OUTCOME_MODELING_CONFIG,
} from './OutcomeModelingEngine.js';

export type {
  // ConfidenceLevel renamed to StatisticalConfidence
  StatisticalConfidence,
  OutcomeRange,
  ConfidenceInterval,
  IncomeRangeModel,
  IncomeFactor,
  OptionalityRangeModel,
  OptionalityFactor,
  RegretExposureRangeModel,
  RegretCategory,
  RegretTimePoint,
  RegretFactor,
  RegretComparison,
  CoalitionStabilityRangeModel,
  CoalitionStabilityTimePoint,
  CoalitionStabilityFactor,
  SatisfactionLikelihoodRangeModel,
  SatisfactionDimension,
  SatisfactionTimePoint,
  SatisfactionFactor,
  ScenarioOutcomeModel,
  MetricCorrelation,
  OutcomeMetric,
  OverallConfidenceAssessment,
  OutcomeModelingInput,
  OutcomeModelingResult,
  OutcomeModelingConfig,
} from './OutcomeModelingEngine.js';
