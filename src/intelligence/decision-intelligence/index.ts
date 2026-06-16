/**
 * Decision Intelligence Engine
 *
 * Phase 8.5: CareerOS Decision Intelligence System
 *
 * This module transforms CareerOS from a recommendation engine into a
 * career decision-making intelligence system. It helps students make
 * difficult life decisions under uncertainty.
 *
 * @module decision-intelligence
 * @version 1.0.0
 */

// Export all types
export * from './decision-types';

// Export model and utilities
export * from './decision-model';

// Export individual engines
export {
  TradeoffEngine,
  createTradeoffEngine,
  analyzeQuickTradeoff,
  resolveTradeoff,
} from './tradeoff-engine';

export {
  RegretEngine,
  createRegretEngine,
  analyzeQuickRegret,
  calculateCategoryRegretRisk,
} from './regret-engine';

export {
  OptionalityEngine,
  createOptionalityEngine,
  analyzeQuickOptionality,
  calculateOptionalityFromComponents,
} from './optionality-engine';

export {
  ReversibilityEngine,
  createReversibilityEngine,
  analyzeQuickReversibility,
  estimateSwitchingCost,
} from './reversibility-engine';

export {
  RiskEngine,
  createRiskEngine,
  analyzeQuickRisk,
} from './risk-engine';

export {
  ScenarioEngine,
  createScenarioEngine,
  generateQuickScenario,
} from './scenario-engine';

// Export legacy V1 synthesizer compatibility surface
export {
  DecisionIntelligenceEngineV1,
  generateDecision,
} from './DecisionIntelligenceEngineV1';

export type {
  DecisionIntelligenceId,
  DecisionTier,
  DecisionUrgency,
  RecommendationStrength,
  RecommendationCaveat,
  DecisionRecommendation,
  DecisionAlternative,
  DecisionConfidence,
  DecisionReasoning,
  DecisionTradeoffs,
  DecisionFactors,
  PathDecisionScore,
  DecisionIntelligenceOptions,
  DecisionRecommendationOutput,
} from './DecisionIntelligenceEngineV1';

// Export master orchestrator
export {
  DecisionIntelligenceEngine,
  DecisionInputValidationError,
  createDecisionIntelligenceEngine,
  analyzeDecision,
  generateDecisionReport,
  quickDecisionCheck,
  isDecisionReady,
} from './decision-intelligence-engine';

export type {
  DecisionInputValidationCode,
  DecisionInputValidationDetails,
} from './decision-intelligence-engine';

// Default export
export { createDecisionIntelligenceEngine as default } from './decision-intelligence-engine';
