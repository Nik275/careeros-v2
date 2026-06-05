/**
 * CareerOS Decision Optimization Engine V1
 *
 * Selects the highest-utility future path by integrating all intelligence layers.
 * Calculates expected utility, generates optimal decisions, finds Pareto frontiers.
 *
 * @module intelligence/decision-optimization-engine
 * @version 1.0.0
 */

export {
  DecisionOptimizationEngineV1,
  createDecisionOptimizationEngine,
  calculateExpectedUtility,
  calculateParetoFrontier,
  analyzeTradeoffs,
  generateDecisionExplanation,
  findBestByAttribute,
  findBestByCoalition,
  findBestByRegret,
  findBestByOptionality,
  generateOptimalDecisionSet,
  DEFAULT_OPTIMIZATION_CONFIG,
} from './DecisionOptimizationEngineV1.js';

export type {
  PathId,
  DecisionOption,
  ExpectedUtility,
  OptimalDecision,
  OptimalDecisionSet,
  PathTradeoff,
  TradeoffAnalysis,
  DecisionExplanation,
  ParetoPoint,
  OptimizationConfig,
} from './DecisionOptimizationEngineV1.js';
