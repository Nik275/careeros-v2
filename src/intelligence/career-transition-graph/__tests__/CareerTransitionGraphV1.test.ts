/**
 * CareerOS Career Transition Graph V1 Tests
 *
 * Comprehensive test suite for graph operations and traversal methods.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerTransitionGraphV1,
  createCareerTransitionGraph,
  findCareerTransitionPath,
  getReachableCareersFrom,
  type CareerNode,
  type CareerEdge,
  type CareerTransitionPath,
  type GraphTraversalOptions,
  type ShortestPathOptions,
} from '../index';
import type { Career, PsychologicalProfile } from '../../../domains/career/Career';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

const createMockPsychologicalProfile = (overrides: Partial<PsychologicalProfile> = {}): PsychologicalProfile => ({
  analyticalThinking: 0.7,
  creativity: 0.6,
  socialOrientation: 0.5,
  leadership: 0.5,
  detailOrientation: 0.7,
  curiosity: 0.7,
  competitiveness: 0.5,
  riskTolerance: 0.5,
  ...overrides,
});

const createMockCareer = (overrides: Partial<Career> & { id?: string; name?: string } = {}): Career => ({
  id: overrides.id || 'test-career',
  name: overrides.name || 'Test Career',
  slug: overrides.id || 'test-career',
  category: 'technology',
  description: 'A test career for unit tests.',
  tagline: 'Test your code',
  psychologicalProfile: createMockPsychologicalProfile(overrides.psychologicalProfile),
  workStyle: {
    remoteWork: 0.7,
    officeWork: 0.4,
    fieldWork: 0.1,
    travelRequirement: 0.2,
    teamOrientation: 0.6,
    soloOrientation: 0.4,
    structuredEnvironment: 0.5,
    unstructuredEnvironment: 0.5,
  },
  rewardProfile: {
    incomePotential: 0.7,
    statusPotential: 0.6,
    impactPotential: 0.6,
    freedomPotential: 0.6,
    stabilityPotential: 0.6,
  },
  riskProfile: {
    burnoutRisk: 0.5,
    automationRisk: 0.3,
    competitionLevel: 0.5,
    incomeVolatility: 0.4,
  },
  optionality: {
    careerFlexibility: 0.7,
    transferableSkills: 0.7,
    entrepreneurshipPotential: 0.5,
  },
  education: {
    minimumLevel: 'bachelors',
    typicalDegrees: ['B.Tech'],
    certifications: [],
  },
  indiaReality: {
    coachingDependency: 0.3,
    urbanAdvantage: 0.6,
    englishDependency: 0.5,
    migrationRequirement: 0.2,
    reservationApplicable: false,
  },
  evolution: {
    adjacentCareers: [],
    futureCareerPaths: [],
  },
  salary: {
    entrySalaryIndia: { min: 400000, max: 1000000, median: 700000 },
    midCareerSalaryIndia: { min: 1000000, max: 3000000, median: 2000000 },
    seniorSalaryIndia: { min: 2500000, max: 8000000, median: 5000000 },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  schemaVersion: 1,
  ...overrides,
} as Career);

const createMockCareerNode = (overrides: Partial<CareerNode> & { id?: string; name?: string } = {}): CareerNode => ({
  id: overrides.id || 'test-node',
  name: overrides.name || 'Test Node',
  category: 'technology',
  description: 'Test node description',
  requiredProfile: createMockPsychologicalProfile(),
  keySkills: ['programming', 'problem-solving'],
  skillCategories: ['technical'],
  typicalExperienceYears: 3,
  incomeLevel: 0.5,
  isEntryLevel: false,
  isTerminal: false,
  relatedCareers: [],
  metadata: {
    demandLevel: 0.6,
    growthOutlook: 0.7,
    addedAt: Date.now(),
  },
  ...overrides,
});

const createMockCareerEdge = (overrides: Partial<CareerEdge> & { fromNodeId?: string; toNodeId?: string } = {}): CareerEdge => ({
  id: overrides.id || 'test-edge',
  fromNodeId: overrides.fromNodeId || 'node-a',
  toNodeId: overrides.toNodeId || 'node-b',
  transitionDifficulty: 50,
  transitionTimeYears: 2,
  skillOverlap: 0.6,
  probabilityOfSuccess: 0.7,
  reversibility: 0.5,
  transitionType: 'promotion',
  description: 'Test transition',
  prerequisites: [],
  transferableSkills: ['skill1', 'skill2'],
  skillsToAcquire: ['skill3'],
  commonPaths: ['Internal promotion'],
  financialCost: {
    min: 0,
    max: 200000,
    typical: 50000,
  },
  metadata: {
    frequency: 'common',
    confidence: 0.8,
    addedAt: Date.now(),
  },
  ...overrides,
});

// ============================================================================
// CAREER TRANSITION GRAPH TESTS
// ============================================================================

describe('CareerTransitionGraphV1', () => {
  let graph: CareerTransitionGraphV1;

  beforeEach(() => {
    graph = new CareerTransitionGraphV1();
  });

  describe('Node Management', () => {
    it('should add a career node', () => {
      const node = createMockCareerNode({ id: 'software-engineer', name: 'Software Engineer' });
      graph.addNode(node);

      expect(graph.hasNode('software-engineer')).toBe(true);
      expect(graph.getNode('software-engineer')).toEqual(node);
    });

    it('should throw error when adding duplicate node', () => {
      const node = createMockCareerNode({ id: 'software-engineer' });
      graph.addNode(node);

      expect(() => graph.addNode(node)).toThrow('already exists');
    });

    it('should remove a career node', () => {
      const node = createMockCareerNode({ id: 'software-engineer' });
      graph.addNode(node);

      const removed = graph.removeNode('software-engineer');
      expect(removed).toBe(true);
      expect(graph.hasNode('software-engineer')).toBe(false);
    });

    it('should return false when removing non-existent node', () => {
      const removed = graph.removeNode('non-existent');
      expect(removed).toBe(false);
    });

    it('should remove all connected edges when removing node', () => {
      const nodeA = createMockCareerNode({ id: 'node-a' });
      const nodeB = createMockCareerNode({ id: 'node-b' });
      graph.addNode(nodeA);
      graph.addNode(nodeB);

      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      graph.removeNode('node-a');

      expect(graph.getEdgesFrom('node-a')).toHaveLength(0);
      expect(graph.getEdgesTo('node-b')).toHaveLength(0);
    });

    it('should get all nodes', () => {
      graph.addNode(createMockCareerNode({ id: 'node-a' }));
      graph.addNode(createMockCareerNode({ id: 'node-b' }));
      graph.addNode(createMockCareerNode({ id: 'node-c' }));

      const nodes = graph.getAllNodes();
      expect(nodes).toHaveLength(3);
      expect(nodes.map(n => n.id)).toContain('node-a');
      expect(nodes.map(n => n.id)).toContain('node-b');
      expect(nodes.map(n => n.id)).toContain('node-c');
    });

    it('should get nodes by category', () => {
      graph.addNode(createMockCareerNode({ id: 'se', category: 'technology' }));
      graph.addNode(createMockCareerNode({ id: 'doctor', category: 'healthcare' }));
      graph.addNode(createMockCareerNode({ id: 'pm', category: 'technology' }));

      const techNodes = graph.getNodesByCategory('technology');
      expect(techNodes).toHaveLength(2);
      expect(techNodes.map(n => n.id)).toContain('se');
      expect(techNodes.map(n => n.id)).toContain('pm');
    });
  });

  describe('Edge Management', () => {
    beforeEach(() => {
      graph.addNode(createMockCareerNode({ id: 'node-a' }));
      graph.addNode(createMockCareerNode({ id: 'node-b' }));
    });

    it('should add an edge between nodes', () => {
      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      const edgesFromA = graph.getEdgesFrom('node-a');
      expect(edgesFromA).toHaveLength(1);
      expect(edgesFromA[0].id).toBe('edge-ab');
    });

    it('should throw error when adding edge with non-existent source node', () => {
      const edge = createMockCareerEdge({ id: 'edge-x', fromNodeId: 'non-existent', toNodeId: 'node-b' });
      expect(() => graph.addEdge(edge)).toThrow('does not exist');
    });

    it('should throw error when adding edge with non-existent target node', () => {
      const edge = createMockCareerEdge({ id: 'edge-x', fromNodeId: 'node-a', toNodeId: 'non-existent' });
      expect(() => graph.addEdge(edge)).toThrow('does not exist');
    });

    it('should throw error when adding duplicate edge', () => {
      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      expect(() => graph.addEdge(edge)).toThrow('already exists');
    });

    it('should remove an edge', () => {
      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      const removed = graph.removeEdge('edge-ab');
      expect(removed).toBe(true);
      expect(graph.getEdgesFrom('node-a')).toHaveLength(0);
    });

    it('should return false when removing non-existent edge', () => {
      const removed = graph.removeEdge('non-existent');
      expect(removed).toBe(false);
    });

    it('should get edge by ID', () => {
      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      const retrieved = graph.getEdge('edge-ab');
      expect(retrieved).toEqual(edge);
    });

    it('should find edge between nodes', () => {
      const edge = createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' });
      graph.addEdge(edge);

      const found = graph.findEdge('node-a', 'node-b');
      expect(found).toBeDefined();
      expect(found?.id).toBe('edge-ab');
    });

    it('should return undefined when edge not found', () => {
      const found = graph.findEdge('node-a', 'node-b');
      expect(found).toBeUndefined();
    });

    it('should get all edges', () => {
      graph.addNode(createMockCareerNode({ id: 'node-c' }));

      graph.addEdge(createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' }));
      graph.addEdge(createMockCareerEdge({ id: 'edge-bc', fromNodeId: 'node-b', toNodeId: 'node-c' }));

      const edges = graph.getAllEdges();
      expect(edges).toHaveLength(2);
    });

    it('should get edges to a node', () => {
      graph.addEdge(createMockCareerEdge({ id: 'edge-ab', fromNodeId: 'node-a', toNodeId: 'node-b' }));

      const edgesToB = graph.getEdgesTo('node-b');
      expect(edgesToB).toHaveLength(1);
      expect(edgesToB[0].fromNodeId).toBe('node-a');
    });
  });

  describe('getAdjacentCareers', () => {
    beforeEach(() => {
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'pm', name: 'Product Manager' }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-to-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        transitionDifficulty: 30,
        probabilityOfSuccess: 0.8,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-to-pm',
        fromNodeId: 'se',
        toNodeId: 'pm',
        transitionDifficulty: 60,
        probabilityOfSuccess: 0.5,
      }));
    });

    it('should get adjacent careers', () => {
      const adjacent = graph.getAdjacentCareers('se');

      expect(adjacent).toHaveLength(2);
      expect(adjacent.map(a => a.node.id)).toContain('sse');
      expect(adjacent.map(a => a.node.id)).toContain('pm');
    });

    it('should sort by transition score (highest first)', () => {
      const adjacent = graph.getAdjacentCareers('se');

      // sse has lower difficulty and higher probability
      expect(adjacent[0].node.id).toBe('sse');
      expect(adjacent[1].node.id).toBe('pm');
    });

    it('should include direction information', () => {
      const adjacent = graph.getAdjacentCareers('se');

      expect(adjacent.every(a => a.direction === 'to')).toBe(true);
    });

    it('should filter by minimum probability', () => {
      const options: GraphTraversalOptions = { minProbability: 0.6 };
      const adjacent = graph.getAdjacentCareers('se', options);

      expect(adjacent).toHaveLength(1);
      expect(adjacent[0].node.id).toBe('sse');
    });

    it('should filter by maximum difficulty', () => {
      const options: GraphTraversalOptions = { maxDifficulty: 50 };
      const adjacent = graph.getAdjacentCareers('se', options);

      expect(adjacent).toHaveLength(1);
      expect(adjacent[0].node.id).toBe('sse');
    });

    it('should filter by transition type', () => {
      // Create a different edge with entrepreneurship type to a new node
      graph.addNode(createMockCareerNode({ id: 'founder', name: 'Founder' }));
      graph.addEdge(createMockCareerEdge({
        id: 'se-to-founder',
        fromNodeId: 'se',
        toNodeId: 'founder',
        transitionType: 'entrepreneurship',
        probabilityOfSuccess: 0.8,
      }));

      const options: GraphTraversalOptions = { transitionTypes: ['promotion'] };
      const adjacent = graph.getAdjacentCareers('se', options);

      expect(adjacent.every(a => a.edge.transitionType === 'promotion')).toBe(true);
    });

    it('should limit results', () => {
      const options: GraphTraversalOptions = { limit: 1 };
      const adjacent = graph.getAdjacentCareers('se', options);

      expect(adjacent).toHaveLength(1);
    });

    it('should throw error for non-existent node', () => {
      expect(() => graph.getAdjacentCareers('non-existent')).toThrow('does not exist');
    });
  });

  describe('getReachableCareers', () => {
    beforeEach(() => {
      // Create a chain: SE -> SSE -> Staff -> CTO
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
      graph.addNode(createMockCareerNode({ id: 'staff', name: 'Staff Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'cto', name: 'CTO' }));
      graph.addNode(createMockCareerNode({ id: 'pm', name: 'Product Manager' }));

      graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'se', toNodeId: 'sse', transitionDifficulty: 30 }));
      graph.addEdge(createMockCareerEdge({ id: 'e2', fromNodeId: 'sse', toNodeId: 'staff', transitionDifficulty: 40 }));
      graph.addEdge(createMockCareerEdge({ id: 'e3', fromNodeId: 'staff', toNodeId: 'cto', transitionDifficulty: 50 }));
      graph.addEdge(createMockCareerEdge({ id: 'e4', fromNodeId: 'se', toNodeId: 'pm', transitionDifficulty: 60 }));
    });

    it('should get all reachable careers within default depth', () => {
      const reachable = graph.getReachableCareers('se');

      expect(reachable.length).toBeGreaterThan(0);
      expect(reachable.map(r => r.node.id)).toContain('sse');
      expect(reachable.map(r => r.node.id)).toContain('staff');
      expect(reachable.map(r => r.node.id)).toContain('cto');
      expect(reachable.map(r => r.node.id)).toContain('pm');
    });

    it('should not include starting node', () => {
      const reachable = graph.getReachableCareers('se');

      expect(reachable.some(r => r.node.id === 'se')).toBe(false);
    });

    it('should track minimum transitions', () => {
      const reachable = graph.getReachableCareers('se');

      const sse = reachable.find(r => r.node.id === 'sse');
      expect(sse?.minTransitions).toBe(1);

      const staff = reachable.find(r => r.node.id === 'staff');
      expect(staff?.minTransitions).toBe(2);
    });

    it('should provide shortest paths', () => {
      const reachable = graph.getReachableCareers('se');

      const cto = reachable.find(r => r.node.id === 'cto');
      expect(cto?.shortestPath).toBeDefined();
      expect(cto?.shortestPath.nodeIds).toContain('se');
      expect(cto?.shortestPath.nodeIds).toContain('cto');
    });

    it('should limit by max depth', () => {
      const options: GraphTraversalOptions = { maxDepth: 2 };
      const reachable = graph.getReachableCareers('se', options);

      expect(reachable.some(r => r.node.id === 'cto')).toBe(false); // CTO is at depth 3
    });

    it('should filter by minimum probability', () => {
      graph.addEdge(createMockCareerEdge({
        id: 'low-prob',
        fromNodeId: 'se',
        toNodeId: 'cto',
        probabilityOfSuccess: 0.1,
      }));

      const options: GraphTraversalOptions = { minProbability: 0.3 };
      const reachable = graph.getReachableCareers('se', options);

      expect(reachable.some(r => r.node.id === 'cto' && r.minTransitions === 1)).toBe(false);
    });

    it('should throw error for non-existent node', () => {
      expect(() => graph.getReachableCareers('non-existent')).toThrow('does not exist');
    });
  });

  describe('getShortestTransitionPath', () => {
    beforeEach(() => {
      // Create paths: SE -> SSE -> Staff -> CTO
      // And: SE -> PM -> VP Product
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
      graph.addNode(createMockCareerNode({ id: 'staff', name: 'Staff Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'cto', name: 'CTO' }));
      graph.addNode(createMockCareerNode({ id: 'pm', name: 'Product Manager' }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        transitionTimeYears: 2,
        transitionDifficulty: 30,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'sse-staff',
        fromNodeId: 'sse',
        toNodeId: 'staff',
        transitionTimeYears: 3,
        transitionDifficulty: 40,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'staff-cto',
        fromNodeId: 'staff',
        toNodeId: 'cto',
        transitionTimeYears: 5,
        transitionDifficulty: 50,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-pm',
        fromNodeId: 'se',
        toNodeId: 'pm',
        transitionTimeYears: 1,
        transitionDifficulty: 60,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'pm-cto',
        fromNodeId: 'pm',
        toNodeId: 'cto',
        transitionTimeYears: 4,
        transitionDifficulty: 45,
      }));
    });

    it('should find shortest path between careers', () => {
      const path = graph.getShortestTransitionPath('se', 'cto');

      expect(path).toBeDefined();
      expect(path!.nodeIds).toContain('se');
      expect(path!.nodeIds).toContain('cto');
    });

    it('should calculate total metrics', () => {
      const path = graph.getShortestTransitionPath('se', 'staff');

      expect(path!.totalMetrics.totalYears).toBe(5); // 2 + 3
      expect(path!.totalMetrics.totalDifficulty).toBe(70); // 30 + 40
    });

    it('should return null when no path exists', () => {
      graph.addNode(createMockCareerNode({ id: 'isolated' }));

      const path = graph.getShortestTransitionPath('se', 'isolated');
      expect(path).toBeNull();
    });

    it('should weight by time', () => {
      const options: ShortestPathOptions = { weightBy: 'time' };
      const path = graph.getShortestTransitionPath('se', 'cto', options);

      // PM route: 1 + 4 = 5 years
      // SSE route: 2 + 3 + 5 = 10 years
      expect(path!.nodeIds).toContain('pm');
    });

    it('should weight by difficulty', () => {
      const options: ShortestPathOptions = { weightBy: 'difficulty' };
      const path = graph.getShortestTransitionPath('se', 'cto', options);

      // PM route: 60 + 45 = 105
      // SSE route: 30 + 40 + 50 = 120
      expect(path!.nodeIds).toContain('pm');
    });

    it('should avoid specified nodes', () => {
      const options: ShortestPathOptions = { avoidNodes: ['pm'] };
      const path = graph.getShortestTransitionPath('se', 'cto', options);

      expect(path!.nodeIds).not.toContain('pm');
      expect(path!.nodeIds).toContain('sse');
    });

    it('should throw error for non-existent source', () => {
      expect(() => graph.getShortestTransitionPath('non-existent', 'se')).toThrow('does not exist');
    });

    it('should throw error for non-existent target', () => {
      expect(() => graph.getShortestTransitionPath('se', 'non-existent')).toThrow('does not exist');
    });
  });

  describe('getCareerPaths', () => {
    beforeEach(() => {
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
      graph.addNode(createMockCareerNode({ id: 'pm', name: 'Product Manager' }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        probabilityOfSuccess: 0.8,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-pm',
        fromNodeId: 'se',
        toNodeId: 'pm',
        probabilityOfSuccess: 0.6,
      }));
    });

    it('should get all career paths', () => {
      const paths = graph.getCareerPaths('se');

      expect(paths.length).toBeGreaterThan(0);
      expect(paths.some(p => p.nodeIds.includes('sse'))).toBe(true);
      expect(paths.some(p => p.nodeIds.includes('pm'))).toBe(true);
    });

    it('should limit by max depth', () => {
      const options: GraphTraversalOptions = { maxDepth: 1 };
      const paths = graph.getCareerPaths('se', options);

      expect(paths.every(p => p.nodeIds.length <= 2)).toBe(true);
    });

    it('should limit number of paths', () => {
      const paths = graph.getCareerPaths('se', { maxPaths: 1 });
      expect(paths.length).toBeLessThanOrEqual(1);
    });

    it('should sort by probability', () => {
      const paths = graph.getCareerPaths('se');

      for (let i = 0; i < paths.length - 1; i++) {
        expect(paths[i].totalMetrics.averageProbability).toBeGreaterThanOrEqual(
          paths[i + 1].totalMetrics.averageProbability
        );
      }
    });

    it('should avoid cycles', () => {
      // Add a cycle
      graph.addEdge(createMockCareerEdge({
        id: 'sse-se',
        fromNodeId: 'sse',
        toNodeId: 'se',
        probabilityOfSuccess: 0.5,
      }));

      const paths = graph.getCareerPaths('se', { maxDepth: 3 });

      // No path should contain duplicates
      paths.forEach(path => {
        const uniqueIds = new Set(path.nodeIds);
        expect(uniqueIds.size).toBe(path.nodeIds.length);
      });
    });

    it('should throw error for non-existent node', () => {
      expect(() => graph.getCareerPaths('non-existent')).toThrow('does not exist');
    });
  });

  describe('Graph Statistics', () => {
    it('should calculate basic statistics', () => {
      graph.addNode(createMockCareerNode({ id: 'a' }));
      graph.addNode(createMockCareerNode({ id: 'b' }));
      graph.addNode(createMockCareerNode({ id: 'c' }));

      graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b' }));
      graph.addEdge(createMockCareerEdge({ id: 'e2', fromNodeId: 'b', toNodeId: 'c' }));

      const stats = graph.getStatistics();

      expect(stats.totalNodes).toBe(3);
      expect(stats.totalEdges).toBe(2);
      expect(stats.averageDegree).toBeGreaterThan(0);
    });

    it('should count nodes by category', () => {
      graph.addNode(createMockCareerNode({ id: 'se', category: 'technology' }));
      graph.addNode(createMockCareerNode({ id: 'doctor', category: 'healthcare' }));
      graph.addNode(createMockCareerNode({ id: 'pm', category: 'technology' }));

      const stats = graph.getStatistics();

      expect(stats.nodesByCategory.get('technology')).toBe(2);
      expect(stats.nodesByCategory.get('healthcare')).toBe(1);
    });

    it('should calculate density', () => {
      // 3 nodes, max possible edges = 3 * 2 = 6
      graph.addNode(createMockCareerNode({ id: 'a' }));
      graph.addNode(createMockCareerNode({ id: 'b' }));
      graph.addNode(createMockCareerNode({ id: 'c' }));

      graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b' }));
      graph.addEdge(createMockCareerEdge({ id: 'e2', fromNodeId: 'b', toNodeId: 'c' }));

      const stats = graph.getStatistics();
      expect(stats.density).toBeCloseTo(2 / 6, 2);
    });
  });

  describe('Import Careers', () => {
    it('should import careers from domain objects', () => {
      const careers = [
        createMockCareer({ id: 'se', name: 'Software Engineer', category: 'technology' }),
        createMockCareer({ id: 'doctor', name: 'Doctor', category: 'healthcare' }),
      ];

      graph.importCareers(careers);

      expect(graph.hasNode('se')).toBe(true);
      expect(graph.hasNode('doctor')).toBe(true);

      const seNode = graph.getNode('se');
      expect(seNode?.name).toBe('Software Engineer');
      expect(seNode?.category).toBe('technology');
    });

    it('should extract key skills from psychological profile', () => {
      const career = createMockCareer({
        id: 'analytical-role',
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.8,
          creativity: 0.8,
          leadership: 0.8,
        }),
      });

      graph.importCareers([career]);

      const node = graph.getNode('analytical-role');
      expect(node?.keySkills).toContain('analytical-thinking');
      expect(node?.keySkills).toContain('creativity');
      expect(node?.keySkills).toContain('leadership');
    });

    it('should classify skill categories', () => {
      const career = createMockCareer({
        id: 'tech-leader',
        psychologicalProfile: createMockPsychologicalProfile({
          analyticalThinking: 0.8,
          leadership: 0.8,
        }),
      });

      graph.importCareers([career]);

      const node = graph.getNode('tech-leader');
      expect(node?.skillCategories).toContain('technical');
      expect(node?.skillCategories).toContain('business');
    });
  });

  describe('Build Edges from Skill Overlap', () => {
    it('should create edges between careers with skill overlap', () => {
      const nodeA = createMockCareerNode({
        id: 'node-a',
        keySkills: ['programming', 'problem-solving', 'communication'],
      });
      const nodeB = createMockCareerNode({
        id: 'node-b',
        keySkills: ['programming', 'problem-solving', 'management'],
      });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      graph.buildEdgesFromSkillOverlap();

      const edge = graph.findEdge('node-a', 'node-b');
      expect(edge).toBeDefined();
      expect(edge!.skillOverlap).toBeGreaterThan(0);
    });

    it('should not create edges for low skill overlap', () => {
      const nodeA = createMockCareerNode({
        id: 'node-a',
        keySkills: ['programming', 'coding'],
      });
      const nodeB = createMockCareerNode({
        id: 'node-b',
        keySkills: ['surgery', 'medicine', 'diagnosis'],
      });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      graph.buildEdgesFromSkillOverlap();

      const edge = graph.findEdge('node-a', 'node-b');
      expect(edge).toBeUndefined();
    });

    it('should set appropriate transition properties', () => {
      const nodeA = createMockCareerNode({
        id: 'node-a',
        keySkills: ['skill1', 'skill2', 'skill3'],
        typicalExperienceYears: 2,
      });
      const nodeB = createMockCareerNode({
        id: 'node-b',
        keySkills: ['skill1', 'skill2', 'skill4'],
        typicalExperienceYears: 5,
      });

      graph.addNode(nodeA);
      graph.addNode(nodeB);

      graph.buildEdgesFromSkillOverlap();

      const edge = graph.findEdge('node-a', 'node-b');
      expect(edge!.transitionDifficulty).toBeGreaterThan(0);
      expect(edge!.transitionDifficulty).toBeLessThanOrEqual(100);
      expect(edge!.transitionTimeYears).toBeGreaterThan(0);
      expect(edge!.probabilityOfSuccess).toBeGreaterThan(0);
      expect(edge!.reversibility).toBeGreaterThan(0);
    });
  });

  describe('Utility Methods', () => {
    it('should clear all data', () => {
      graph.addNode(createMockCareerNode({ id: 'a' }));
      graph.addNode(createMockCareerNode({ id: 'b' }));
      graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b' }));

      graph.clear();

      expect(graph.size()).toEqual({ nodes: 0, edges: 0 });
    });

    it('should return correct size', () => {
      graph.addNode(createMockCareerNode({ id: 'a' }));
      graph.addNode(createMockCareerNode({ id: 'b' }));
      graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'a', toNodeId: 'b' }));

      expect(graph.size()).toEqual({ nodes: 2, edges: 1 });
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  describe('createCareerTransitionGraph', () => {
    it('should create graph from careers', () => {
      const careers = [
        createMockCareer({ id: 'se', name: 'Software Engineer' }),
        createMockCareer({ id: 'pm', name: 'Product Manager' }),
      ];

      const graph = createCareerTransitionGraph(careers);

      expect(graph.hasNode('se')).toBe(true);
      expect(graph.hasNode('pm')).toBe(true);
    });

    it('should auto-build edges', () => {
      const careers = [
        createMockCareer({
          id: 'se',
          psychologicalProfile: createMockPsychologicalProfile({
            analyticalThinking: 0.8,
            leadership: 0.7,
          }),
        }),
        createMockCareer({
          id: 'pm',
          psychologicalProfile: createMockPsychologicalProfile({
            analyticalThinking: 0.8,
            leadership: 0.8,
          }),
        }),
      ];

      const graph = createCareerTransitionGraph(careers);
      const edges = graph.getAllEdges();

      // Should have edges due to skill overlap
      expect(edges.length).toBeGreaterThan(0);
    });
  });

  describe('findCareerTransitionPath', () => {
    it('should find path using factory function', () => {
      const graph = new CareerTransitionGraphV1();
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
      graph.addEdge(createMockCareerEdge({
        id: 'se-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        transitionDifficulty: 30,
      }));

      const path = findCareerTransitionPath('se', 'sse', graph);

      expect(path).toBeDefined();
      expect(path!.nodeIds).toContain('se');
      expect(path!.nodeIds).toContain('sse');
    });

    it('should return null when no path exists', () => {
      const graph = new CareerTransitionGraphV1();
      graph.addNode(createMockCareerNode({ id: 'se' }));
      graph.addNode(createMockCareerNode({ id: 'doctor' }));
      // No edge between them

      const path = findCareerTransitionPath('se', 'doctor', graph);

      expect(path).toBeNull();
    });
  });

  describe('getReachableCareersFrom', () => {
    it('should get reachable careers using factory function', () => {
      const graph = new CareerTransitionGraphV1();
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
      graph.addEdge(createMockCareerEdge({
        id: 'se-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        transitionDifficulty: 30,
      }));

      const reachable = getReachableCareersFrom('se', graph);

      expect(reachable.some(r => r.node.id === 'sse')).toBe(true);
    });
  });
});

// ============================================================================
// REALISTIC CAREER SCENARIOS
// ============================================================================

describe('Realistic Career Scenarios', () => {
  it('should model software engineer career progression', () => {
    const graph = new CareerTransitionGraphV1();

    // Create tech career ladder
    const se = createMockCareerNode({
      id: 'software-engineer',
      name: 'Software Engineer',
      category: 'technology',
      keySkills: ['programming', 'problem-solving', 'system-design'],
      typicalExperienceYears: 0,
    });

    const sse = createMockCareerNode({
      id: 'senior-engineer',
      name: 'Senior Software Engineer',
      category: 'technology',
      keySkills: ['programming', 'system-design', 'mentoring', 'architecture'],
      typicalExperienceYears: 4,
    });

    const staff = createMockCareerNode({
      id: 'staff-engineer',
      name: 'Staff Engineer',
      category: 'technology',
      keySkills: ['system-design', 'architecture', 'leadership', 'strategy'],
      typicalExperienceYears: 8,
      isTerminal: true,
    });

    const cto = createMockCareerNode({
      id: 'cto',
      name: 'CTO',
      category: 'technology',
      keySkills: ['leadership', 'strategy', 'business', 'vision'],
      typicalExperienceYears: 15,
      isTerminal: true,
    });

    const pm = createMockCareerNode({
      id: 'product-manager',
      name: 'Product Manager',
      category: 'product',
      keySkills: ['communication', 'strategy', 'user-research', 'leadership'],
      typicalExperienceYears: 3,
    });

    const founder = createMockCareerNode({
      id: 'founder',
      name: 'Founder',
      category: 'entrepreneurship',
      keySkills: ['leadership', 'vision', 'risk-taking', 'hustle'],
      typicalExperienceYears: 5,
      isTerminal: true,
    });

    graph.addNode(se);
    graph.addNode(sse);
    graph.addNode(staff);
    graph.addNode(cto);
    graph.addNode(pm);
    graph.addNode(founder);

    // Add edges
    graph.addEdge(createMockCareerEdge({
      id: 'se-sse',
      fromNodeId: 'software-engineer',
      toNodeId: 'senior-engineer',
      transitionDifficulty: 40,
      transitionTimeYears: 3,
      skillOverlap: 0.7,
      probabilityOfSuccess: 0.7,
      reversibility: 0.8,
      transitionType: 'promotion',
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'sse-staff',
      fromNodeId: 'senior-engineer',
      toNodeId: 'staff-engineer',
      transitionDifficulty: 50,
      transitionTimeYears: 4,
      skillOverlap: 0.6,
      probabilityOfSuccess: 0.5,
      reversibility: 0.6,
      transitionType: 'promotion',
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'staff-cto',
      fromNodeId: 'staff-engineer',
      toNodeId: 'cto',
      transitionDifficulty: 70,
      transitionTimeYears: 5,
      skillOverlap: 0.4,
      probabilityOfSuccess: 0.3,
      reversibility: 0.2,
      transitionType: 'promotion',
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'se-pm',
      fromNodeId: 'software-engineer',
      toNodeId: 'product-manager',
      transitionDifficulty: 60,
      transitionTimeYears: 1,
      skillOverlap: 0.3,
      probabilityOfSuccess: 0.5,
      reversibility: 0.7,
      transitionType: 'pivot',
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'se-founder',
      fromNodeId: 'software-engineer',
      toNodeId: 'founder',
      transitionDifficulty: 80,
      transitionTimeYears: 0.5,
      skillOverlap: 0.2,
      probabilityOfSuccess: 0.2,
      reversibility: 0.3,
      transitionType: 'entrepreneurship',
    }));

    // Test career progression
    const paths = graph.getCareerPaths('software-engineer', { maxDepth: 3 });
    expect(paths.length).toBeGreaterThan(0);

    // Test reachable careers
    const reachable = graph.getReachableCareers('software-engineer');
    expect(reachable.map(r => r.node.id)).toContain('senior-engineer');
    expect(reachable.map(r => r.node.id)).toContain('product-manager');
    expect(reachable.map(r => r.node.id)).toContain('founder');

    // Test shortest path to CTO
    const pathToCTO = graph.getShortestTransitionPath('software-engineer', 'cto');
    expect(pathToCTO).toBeDefined();
    expect(pathToCTO!.nodeIds).toContain('software-engineer');
    expect(pathToCTO!.nodeIds).toContain('cto');
  });

  it('should model doctor specialization paths', () => {
    const graph = new CareerTransitionGraphV1();

    const doctor = createMockCareerNode({
      id: 'doctor',
      name: 'Doctor',
      category: 'healthcare',
      keySkills: ['medicine', 'diagnosis', 'patient-care'],
      typicalExperienceYears: 5,
    });

    const specialist = createMockCareerNode({
      id: 'specialist',
      name: 'Medical Specialist',
      category: 'healthcare',
      keySkills: ['medicine', 'specialization', 'surgery', 'research'],
      typicalExperienceYears: 10,
      isTerminal: true,
    });

    const hospitalAdmin = createMockCareerNode({
      id: 'hospital-admin',
      name: 'Hospital Administrator',
      category: 'healthcare',
      keySkills: ['management', 'healthcare', 'operations', 'leadership'],
      typicalExperienceYears: 8,
      isTerminal: true,
    });

    graph.addNode(doctor);
    graph.addNode(specialist);
    graph.addNode(hospitalAdmin);

    graph.addEdge(createMockCareerEdge({
      id: 'doctor-specialist',
      fromNodeId: 'doctor',
      toNodeId: 'specialist',
      transitionDifficulty: 70,
      transitionTimeYears: 5,
      skillOverlap: 0.6,
      probabilityOfSuccess: 0.6,
      reversibility: 0.2,
      transitionType: 'specialization',
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'doctor-admin',
      fromNodeId: 'doctor',
      toNodeId: 'hospital-admin',
      transitionDifficulty: 60,
      transitionTimeYears: 3,
      skillOverlap: 0.4,
      probabilityOfSuccess: 0.5,
      reversibility: 0.4,
      transitionType: 'pivot',
    }));

    const adjacent = graph.getAdjacentCareers('doctor');
    expect(adjacent).toHaveLength(2);

    const reachable = graph.getReachableCareers('doctor');
    expect(reachable.map(r => r.node.id)).toContain('specialist');
    expect(reachable.map(r => r.node.id)).toContain('hospital-admin');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty graph', () => {
    const graph = new CareerTransitionGraphV1();

    expect(graph.getAllNodes()).toHaveLength(0);
    expect(graph.getAllEdges()).toHaveLength(0);
    expect(graph.size()).toEqual({ nodes: 0, edges: 0 });
  });

  it('should handle single node graph', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'only-node' }));

    const reachable = graph.getReachableCareers('only-node');
    expect(reachable).toHaveLength(0);

    const paths = graph.getCareerPaths('only-node');
    expect(paths).toHaveLength(0);
  });

  it('should handle disconnected components', () => {
    const graph = new CareerTransitionGraphV1();

    // Component 1
    graph.addNode(createMockCareerNode({ id: 'a1' }));
    graph.addNode(createMockCareerNode({ id: 'a2' }));
    graph.addEdge(createMockCareerEdge({ id: 'e1', fromNodeId: 'a1', toNodeId: 'a2' }));

    // Component 2
    graph.addNode(createMockCareerNode({ id: 'b1' }));
    graph.addNode(createMockCareerNode({ id: 'b2' }));
    graph.addEdge(createMockCareerEdge({ id: 'e2', fromNodeId: 'b1', toNodeId: 'b2' }));

    const stats = graph.getStatistics();
    expect(stats.connectedComponents).toBe(2);

    const path = graph.getShortestTransitionPath('a1', 'b2');
    expect(path).toBeNull();
  });

  it('should be deterministic', () => {
    const careers = [
      createMockCareer({ id: 'se', name: 'Software Engineer' }),
      createMockCareer({ id: 'sse', name: 'Senior SE' }),
      createMockCareer({ id: 'pm', name: 'Product Manager' }),
    ];

    const graph1 = createCareerTransitionGraph(careers);
    const graph2 = createCareerTransitionGraph(careers);

    // Both graphs should have same structure
    expect(graph1.size()).toEqual(graph2.size());

    const edges1 = graph1.getAllEdges().sort((a, b) => a.id.localeCompare(b.id));
    const edges2 = graph2.getAllEdges().sort((a, b) => a.id.localeCompare(b.id));

    expect(edges1.length).toBe(edges2.length);

    for (let i = 0; i < edges1.length; i++) {
      expect(edges1[i].skillOverlap).toBe(edges2[i].skillOverlap);
      expect(edges1[i].transitionDifficulty).toBe(edges2[i].transitionDifficulty);
    }
  });

  it('should allow self-loops (if needed for specific use cases)', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'node' }));

    // Self-loops are allowed (e.g., for "stay in current role" transitions)
    graph.addEdge(createMockCareerEdge({
      id: 'self-loop',
      fromNodeId: 'node',
      toNodeId: 'node',
      transitionType: 'promotion',
    }));

    const edge = graph.findEdge('node', 'node');
    expect(edge).toBeDefined();
    expect(edge!.fromNodeId).toBe('node');
    expect(edge!.toNodeId).toBe('node');
  });

  it('should handle bidirectional edges', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'a' }));
    graph.addNode(createMockCareerNode({ id: 'b' }));

    graph.addEdge(createMockCareerEdge({
      id: 'a-to-b',
      fromNodeId: 'a',
      toNodeId: 'b',
      reversibility: 0.9,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'b-to-a',
      fromNodeId: 'b',
      toNodeId: 'a',
      reversibility: 0.9,
    }));

    expect(graph.findEdge('a', 'b')).toBeDefined();
    expect(graph.findEdge('b', 'a')).toBeDefined();

    const adjacentFromA = graph.getAdjacentCareers('a');
    expect(adjacentFromA.some(a => a.node.id === 'b' && a.direction === 'to')).toBe(true);
  });
});
