/**
 * CareerOS Personal Utility Discovery Engine V1
 *
 * Infers a student's true utility function from choices, tradeoffs, and behavioral signals.
 * Students often cannot directly state what they value - this engine discovers it.
 *
 * @module intelligence/utility-discovery-engine
 * @version 1.0.0
 */

export {
  UtilityDiscoveryEngineV1,
  createUtilityDiscoveryEngine,
  analyzeTradeoffChoices,
  generateTradeoffScenarios,
  detectValueConflicts,
  calculateWeightConfidences,
  trackUtilityEvolution,
  generateWeightExplanations,
  discoverUtilityProfile,
  DEFAULT_UTILITY_DISCOVERY_CONFIG,
} from './UtilityDiscoveryEngineV1.js';

export type {
  DiscoveryAnalysisId,
  BehavioralSignalType,
  BehavioralSignal,
  TradeoffScenario,
  TradeoffResponse,
  ValueConflict,
  WeightConfidence,
  UtilityEvolutionSnapshot,
  WeightExplanation,
  UtilityDiscoveryResult,
  UtilityDiscoveryConfig,
} from './UtilityDiscoveryEngineV1.js';
