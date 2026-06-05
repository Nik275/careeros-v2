/**
 * CareerOS Confidence Propagation Engine V1
 *
 * Propagates uncertainty through the entire CareerOS intelligence stack.
 * Every engine outputs score + confidence with full traceability.
 *
 * @module intelligence/confidence-propagation-engine
 * @version 1.0.0
 */

export {
  ConfidencePropagationEngineV1,
  createConfidencePropagationEngine,
  aggregateConfidence,
  propagateConfidence,
  buildPropagationGraph,
  explainConfidence,
  calculateFinalDecisionConfidence,
  extractMatchingConfidence,
  extractOptionalityConfidence,
  extractCriticalityConfidence,
  extractPathExplorerConfidence,
  extractCoalitionConfidence,
  extractRegretConfidence,
  extractDecisionOptimizationConfidence,
  extractParetoFrontierConfidence,
  DEFAULT_CONFIDENCE_PROPAGATION_CONFIG,
} from './ConfidencePropagationEngineV1.js';

export type {
  EngineId,
  ConfidenceSource,
  ConfidenceNode,
  AggregatedConfidence,
  FinalDecisionConfidence,
  ComponentConfidenceResult,
  ConfidencePropagationConfig,
} from './ConfidencePropagationEngineV1.js';
