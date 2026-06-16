import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  CareerTransitionGraphV1,
  createCareerTransitionGraph,
  findCareerTransitionPath,
  getReachableCareersFrom,
  type AdjacentCareer,
  type CareerEdge,
  type CareerNode,
  type CareerTransitionPath,
  type EdgeId,
  type GraphStatistics,
  type GraphTraversalOptions,
  type NodeId,
  type ReachableCareer,
  type ShortestPathOptions,
  type SkillCategory,
  type TransitionPrerequisite,
  type TransitionType,
} from '../index';

describe('Phase 6.6.R career-transition export surface', () => {
  it('keeps runtime graph exports importable', () => {
    expect(CareerTransitionGraphV1).toBeTypeOf('function');
    expect(createCareerTransitionGraph).toBeTypeOf('function');
    expect(findCareerTransitionPath).toBeTypeOf('function');
    expect(getReachableCareersFrom).toBeTypeOf('function');
  });

  it('keeps graph types available through the barrel', () => {
    expectTypeOf<NodeId>().toEqualTypeOf<string>();
    expectTypeOf<EdgeId>().toEqualTypeOf<string>();
    expectTypeOf<CareerNode>().toHaveProperty('keySkills');
    expectTypeOf<CareerEdge>().toHaveProperty('transitionDifficulty');
    expectTypeOf<CareerTransitionPath>().toHaveProperty('nodeIds');
    expectTypeOf<AdjacentCareer>().toHaveProperty('node');
    expectTypeOf<ReachableCareer>().toHaveProperty('shortestPath');
    expectTypeOf<GraphStatistics>().toHaveProperty('totalNodes');
    expectTypeOf<GraphTraversalOptions>().toBeObject();
    expectTypeOf<ShortestPathOptions>().toBeObject();
    expectTypeOf<TransitionType>().toMatchTypeOf<string>();
    expectTypeOf<TransitionPrerequisite>().toHaveProperty('description');
    expectTypeOf<SkillCategory>().toMatchTypeOf<string>();
  });

  it('constructs the graph after duplicate type re-export cleanup', () => {
    const graph = new CareerTransitionGraphV1();

    expect(graph.size()).toEqual({ nodes: 0, edges: 0 });
  });
});
