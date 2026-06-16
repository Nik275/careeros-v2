/**
 * CareerOS Career Graph Intelligence System
 *
 * Models career decisions as interconnected graphs showing how choices
 * create future opportunities, restrictions, and trajectories.
 *
 * @module intelligence/career-graph
 */

export {
  DEFAULT_CAREER_GRAPH_CONFIG,
} from './career-graph-types';

export type {
  // Core types
  NodeId,
  EdgeId,
  PathId,
  Timestamp,
  Probability,
  Score,
  CareerNodeType,
  EdgeType,

  // Node and edge types
  CareerNode,
  CareerEdge,
  CareerGraph,

  // Optionality types
  OptionalityScore,

  // Irreversibility types
  IrreversibilityScore,

  // Opportunity types
  Opportunity,
  OpportunityMap,
  OpportunityTimeframe,

  // Simulation types
  PathSimulation,
  SimulatedPath,
  Risk,
  PivotOption,
  SimulationHorizon,

  // Cascade types
  CareerCascade,
  CascadeStage,
  CascadeDecision,
  CascadeOutcome,

  // Report types
  CareerGraphReport,
  RankedNode,
  RecommendedPath,

  // Context types
  StudentCareerContext,

  // Config types
  CareerGraphConfig,

  // Event types
  CareerGraphEvent,
  CareerGraphEventType,
} from './career-graph-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  GraphBuilder,
  PREDEFINED_PATHWAYS,
} from './graph-builder';

export type {
  GraphBuilderOptions,
  NodeDefinition,
  EdgeDefinition,
} from './graph-builder';

export {
  PathSimulator,
  DEFAULT_SIMULATOR_OPTIONS,
} from './path-simulator';

export type {
  PathSimulatorOptions,
  SimulationContext,
} from './path-simulator';

export {
  OpportunityEngine,
  DEFAULT_OPPORTUNITY_OPTIONS,
} from './opportunity-engine';

export type {
  OpportunityEngineOptions,
  OpportunityContext,
} from './opportunity-engine';

export {
  OptionalityEngine,
  DEFAULT_OPTIONALITY_OPTIONS,
} from './optionality-engine';

export type {
  OptionalityEngineOptions,
  OptionalityBreakdown,
} from './optionality-engine';

export {
  IrreversibilityEngine,
  DEFAULT_IRREVERSIBILITY_OPTIONS,
} from './irreversibility-engine';

export type {
  IrreversibilityEngineOptions,
  ReversibilityFactors,
} from './irreversibility-engine';

export {
  CareerCascadeEngine,
  DEFAULT_CASCADE_OPTIONS,
} from './career-cascade-engine';

export type {
  CascadeEngineOptions,
} from './career-cascade-engine';

export {
  CareerGraphEngine,
} from './career-graph-engine';

export type {
  CareerGraphEngineOptions,
} from './career-graph-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { CareerGraphEngine as default } from './career-graph-engine';
