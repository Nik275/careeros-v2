/**
 * India Opportunity Graph
 *
 * Phase 8.8: CareerOS India Opportunity Graph
 *
 * A comprehensive graph-based intelligence layer for understanding
 * education and career pathways in India.
 *
 * Core Philosophy:
 * Students do not choose careers directly. Students choose pathways.
 * CareerOS must understand pathways, transitions, pivots, dead ends,
 * optionality, opportunity expansion, and opportunity collapse.
 *
 * @module opportunity-graph
 * @version 1.0.0
 */

// Export all types
export * from './opportunity-node-types';

// Export Graph Builder
export {
  GraphBuilder,
  createGraphBuilder,
  mergeGraphs,
} from './graph-builder';

// Export Education Graph
export {
  buildEducationGraph,
  createSchoolStreamNodes,
  createExamNodes,
  createCollegeTypeNodes,
  createDegreeNodes,
  createEducationEdges,
  getEducationStats,
} from './education-graph';

// Export Pathway Engine
export {
  PathwayEngine,
  createPathwayEngine,
  generatePathway,
  findAllPathways,
  findShortestPath,
} from './pathway-engine';

// Export Transition Engine
export {
  TransitionEngine,
  createTransitionEngine,
  analyzeTransition,
  findPossibleTransitions,
  findPivotOpportunities,
} from './transition-engine';

// Export Opportunity Graph Engine
export {
  OpportunityGraphEngine,
  createOpportunityGraphEngine,
  queryOpportunityGraph,
  simulateDecision,
  analyzeOptionality,
  analyzeCriticality,
} from './opportunity-graph-engine';

// Default export
export { createOpportunityGraphEngine as default } from './opportunity-graph-engine';
