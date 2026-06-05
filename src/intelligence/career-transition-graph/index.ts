/**
 * CareerOS Career Transition Graph
 *
 * Represents careers as a connected graph rather than isolated profiles.
 */

export {
  CareerTransitionGraphV1,
  createCareerTransitionGraph,
  findCareerTransitionPath,
  getReachableCareersFrom,
} from './CareerTransitionGraphV1';

export type {
  CareerNode,
  CareerEdge,
  CareerTransitionPath,
  AdjacentCareer,
  ReachableCareer,
  GraphStatistics,
  GraphTraversalOptions,
  ShortestPathOptions,
  TransitionType,
  TransitionPrerequisite,
  SkillCategory,
  NodeId,
  EdgeId,
} from './CareerTransitionGraphV1';
