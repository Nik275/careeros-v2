/**
 * CareerOS Pareto Frontier Engine V1
 *
 * Identifies non-dominated career futures - all efficient tradeoff paths.
 * CareerOS does not assume a single best path; instead it identifies efficient alternatives.
 *
 * @module intelligence/pareto-frontier-engine
 * @version 1.0.0
 */

export {
  ParetoFrontierEngineV1,
  createParetoFrontierEngine,
  isDominated,
  computeParetoFrontier,
  analyzeTradeoffs,
  classifyLifeStrategy,
  generateFrontierExplanations,
  generateFrontierGuidance,
  analyzeParetoFrontier,
  DEFAULT_PARETO_CONFIG,
} from './ParetoFrontierEngineV1.js';

export type {
  ParetoFrontierId,
  LifeStrategyType,
  ParetoCandidate,
  ParetoFrontierResult,
  LifeStrategyClassification,
  PathTradeoff,
  TradeoffDimension,
  TradeoffAnalysis,
  FrontierExplanations,
  FrontierGuidance,
  ParetoFrontierConfig,
} from './ParetoFrontierEngineV1.js';
