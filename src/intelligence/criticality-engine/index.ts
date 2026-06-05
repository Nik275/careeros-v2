/**
 * CareerOS Criticality Engine
 *
 * Measure how much a career decision constrains future opportunities.
 */

export {
  CriticalityEngineV1,
  calculateCriticality,
  compareCriticality,
  calculateBatchCriticality,
} from './CriticalityEngineV1';

export type {
  CriticalityAnalysis,
  CriticalityMetric,
  CriticalityCalculationOptions,
  CriticalityWeights,
  CriticalityComparison,
  BatchCriticalityResult,
  CriticalityId,
} from './CriticalityEngineV1';
