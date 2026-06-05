/**
 * CareerOS Career Graph V2
 *
 * Weighted transition network for career relationships.
 * Upgrades from binary relationships to probabilistic, cost-aware transitions.
 *
 * @module intelligence/career-graph-v2
 * @version 2.0.0
 */

export {
  CareerGraphV2,
  createCareerGraphV2,
  calculateTransitionQuality,
  calculateTransitionDifficulty,
  calculateSkillTransferability,
  calculateOptionalityGain,
  calculateFutureStrength,
  calculateTransitionProbability,
  calculateTransitionCost,
  calculateTransitionTime,
  createTransitionEdge,
  createTransitionEdgeWithQuality,
  createAdjacentTransition,
  createProgressionTransition,
  createSpecializationTransition,
  createPivotTransition,
  createCrossDomainTransition,
  createFoundationalTransition,
  calculatePathMetrics,
  calculatePathQuality,
  filterTransitions,
  findBestTransitions,
  findViablePaths,
  compareTransitions,
  calculateTransitionMetrics,
  DEFAULT_CAREER_GRAPH_V2_CONFIG,
} from './CareerGraphV2.js';

export type {
  TransitionEdgeId,
  RelationshipType,
  EvidenceConfidence,
  CareerTransitionEdge,
  TransitionOpportunityScore,
  TransitionMetrics,
  CareerTransitionPath,
  TransitionFilter,
  CareerGraphV2Config,
} from './CareerGraphV2.js';
