/**
 * CareerOS Career Graph Intelligence System
 *
 * Models career decisions as interconnected graphs showing how choices
 * create future opportunities, restrictions, and trajectories.
 *
 * @module intelligence/career-graph
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
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
  DEFAULT_CAREER_GRAPH_CONFIG,

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
  GraphBuilderOptions,
  NodeDefinition,
  EdgeDefinition,
} from './graph-builder';

export {
  PathSimulator,
  PathSimulatorOptions,
  SimulationContext,
  DEFAULT_SIMULATOR_OPTIONS,
} from './path-simulator';

export {
  OpportunityEngine,
  OpportunityEngineOptions,
  OpportunityContext,
  DEFAULT_OPPORTUNITY_OPTIONS,
} from './opportunity-engine';

export {
  OptionalityEngine,
  OptionalityEngineOptions,
  OptionalityBreakdown,
  DEFAULT_OPTIONALITY_OPTIONS,
} from './optionality-engine';

export {
  IrreversibilityEngine,
  IrreversibilityEngineOptions,
  ReversibilityFactors,
  DEFAULT_IRREVERSIBILITY_OPTIONS,
} from './irreversibility-engine';

export {
  CareerCascadeEngine,
  CascadeEngineOptions,
  DEFAULT_CASCADE_OPTIONS,
} from './career-cascade-engine';

export {
  CareerGraphEngine,
  CareerGraphEngineOptions,
} from './career-graph-engine';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export { CareerGraphEngine as default } from './career-graph-engine';
