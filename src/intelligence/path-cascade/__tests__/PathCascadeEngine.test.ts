/**
 * Path Cascade Engine Unit Tests
 *
 * Comprehensive test suite for the path dependency cascade engine.
 *
 * Test Coverage:
 *   - CareerGraph node and edge management
 *   - Path finding from start nodes
 *   - Criticality calculations
 *   - Optionality calculations
 *   - Explainability functions
 *   - Example graph (JEE/IIT, NEET/MBBS)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerGraph,
  CareerNode,
  CareerEdge,
  createIndiaCareerGraph,
} from '../CareerGraph';
import {
  PathCascadeEngine,
  createPathCascadeEngine,
  analyzeCareerPaths,
  DEFAULT_PATH_CONFIG,
  type PathCascadeResult,
  type PathExplanations,
} from '../PathCascadeEngine';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createTestNode(id: string, type: string, isTerminal: boolean = false): CareerNode {
  return {
    id,
    name: id.replace(/_/g, ' ').toUpperCase(),
    type: type as any,
    description: `Test node ${id}`,
    category: 'Test',
    typicalDuration: 1,
    financialCost: { min: 10000, max: 100000, typical: 50000 },
    prerequisites: [],
    skillsGained: [],
    outcomes: {},
    isTerminal,
    popularity: 0.5,
  };
}

function createTestEdge(
  id: string,
  from: string,
  to: string,
  probability: number = 0.5,
  reversibility: number = 0.5
): CareerEdge {
  return {
    id,
    fromNodeId: from,
    toNodeId: to,
    transitionType: 'DEGREE_TO_JOB',
    probability,
    reversibility,
    timeCost: 1,
    financialCost: { min: 0, max: 50000, typical: 25000 },
    difficulty: 0.5,
    prerequisites: [],
    transferableSkills: [],
    newSkillsRequired: [],
    description: `Edge from ${from} to ${to}`,
  };
}

/**
 * Create a simple test graph:
 *   A → B → C (terminal)
 *   A → D → E (terminal)
 */
function createSimpleTestGraph(): CareerGraph {
  const graph = new CareerGraph();

  const nodeA = createTestNode('node_a', 'EXAM');
  const nodeB = createTestNode('node_b', 'DEGREE');
  const nodeC = createTestNode('node_c', 'JOB', true);
  const nodeD = createTestNode('node_d', 'DEGREE');
  const nodeE = createTestNode('node_e', 'JOB', true);

  const edgeAB = createTestEdge('edge_ab', 'node_a', 'node_b', 0.8, 0.3);
  const edgeBC = createTestEdge('edge_bc', 'node_b', 'node_c', 0.9, 0.4);
  const edgeAD = createTestEdge('edge_ad', 'node_a', 'node_d', 0.6, 0.5);
  const edgeDE = createTestEdge('edge_de', 'node_d', 'node_e', 0.7, 0.6);

  graph.addNode(nodeA);
  graph.addNode(nodeB);
  graph.addNode(nodeC);
  graph.addNode(nodeD);
  graph.addNode(nodeE);

  graph.addEdge(edgeAB);
  graph.addEdge(edgeBC);
  graph.addEdge(edgeAD);
  graph.addEdge(edgeDE);

  return graph;
}

// ============================================================================
// CAREER GRAPH TESTS
// ============================================================================

describe('CareerGraph', () => {
  let graph: CareerGraph;

  beforeEach(() => {
    graph = createSimpleTestGraph();
  });

  describe('Node Management', () => {
    it('should add and retrieve nodes', () => {
      const node = graph.getNode('node_a');
      expect(node).toBeDefined();
      expect(node?.id).toBe('node_a');
    });

    it('should return undefined for non-existent node', () => {
      const node = graph.getNode('nonexistent');
      expect(node).toBeUndefined();
    });

    it('should get all nodes', () => {
      const nodes = graph.getAllNodes();
      expect(nodes).toHaveLength(5);
    });
  });

  describe('Edge Management', () => {
    it('should add and retrieve edges', () => {
      const edge = graph.getEdge('edge_ab');
      expect(edge).toBeDefined();
      expect(edge?.fromNodeId).toBe('node_a');
      expect(edge?.toNodeId).toBe('node_b');
    });

    it('should get outgoing edges', () => {
      const edges = graph.getOutgoingEdges('node_a');
      expect(edges).toHaveLength(2);
      expect(edges.map(e => e.toNodeId).sort()).toEqual(['node_b', 'node_d']);
    });

    it('should return empty array for node with no outgoing edges', () => {
      const edges = graph.getOutgoingEdges('node_c');
      expect(edges).toHaveLength(0);
    });

    it('should get all edges', () => {
      const edges = graph.getAllEdges();
      expect(edges).toHaveLength(4);
    });
  });

  describe('Path Finding', () => {
    it('should find all paths from start node', () => {
      const paths = graph.findAllPaths('node_a', 5);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should find paths to terminal nodes', () => {
      const paths = graph.findAllPaths('node_a', 5);
      const terminalPaths = paths.filter(p =>
        p.nodes[p.nodes.length - 1].isTerminal
      );
      expect(terminalPaths.length).toBeGreaterThan(0);
    });

    it('should respect max depth', () => {
      const paths = graph.findAllPaths('node_a', 2);
      for (const path of paths) {
        expect(path.nodes.length).toBeLessThanOrEqual(3); // start + 2 edges
      }
    });

    it('should build valid paths', () => {
      const paths = graph.findAllPaths('node_a', 5);
      for (const path of paths) {
        expect(path.id).toBeDefined();
        expect(path.name).toBeDefined();
        expect(path.nodes.length).toBeGreaterThan(0);
        expect(path.metrics).toBeDefined();
      }
    });
  });
});

// ============================================================================
// CRITICALITY CALCULATIONS
// ============================================================================

describe('Criticality Calculations', () => {
  let graph: CareerGraph;

  beforeEach(() => {
    graph = createSimpleTestGraph();
  });

  it('should calculate criticality for a node', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(analysis).toBeDefined();
    expect(analysis.nodeId).toBe('node_a');
    expect(typeof analysis.score).toBe('number');
  });

  it('should have criticality score between 0 and 1', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(1);
  });

  it('should track options before and after', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(typeof analysis.optionsBefore).toBe('number');
    expect(typeof analysis.optionsAfter).toBe('number');
  });

  it('should identify closed options', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(Array.isArray(analysis.closedOptions)).toBe(true);
  });

  it('should determine if point of no return', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(typeof analysis.isPointOfNoReturn).toBe('boolean');
  });

  it('should provide human-readable explanation', () => {
    const analysis = graph.calculateCriticality('node_a');
    expect(typeof analysis.explanation).toBe('string');
    expect(analysis.explanation.length).toBeGreaterThan(10);
  });

  it('should throw error for non-existent node', () => {
    expect(() => graph.calculateCriticality('nonexistent')).toThrow();
  });
});

// ============================================================================
// OPTIONALITY CALCULATIONS
// ============================================================================

describe('Optionality Calculations', () => {
  let graph: CareerGraph;

  beforeEach(() => {
    graph = createSimpleTestGraph();
  });

  it('should calculate optionality for a node', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(analysis).toBeDefined();
    expect(analysis.nodeId).toBe('node_a');
    expect(typeof analysis.score).toBe('number');
  });

  it('should have optionality score between 0 and 1', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(1);
  });

  it('should count reachable nodes', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(typeof analysis.reachableNodeCount).toBe('number');
    expect(analysis.reachableNodeCount).toBeGreaterThanOrEqual(0);
  });

  it('should list reachable careers', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(Array.isArray(analysis.reachableCareers)).toBe(true);
  });

  it('should provide diversity metrics', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(analysis.diversity).toBeDefined();
    expect(Array.isArray(analysis.diversity.categories)).toBe(true);
    expect(analysis.diversity.salaryRange).toBeDefined();
  });

  it('should provide human-readable explanation', () => {
    const analysis = graph.calculateOptionality('node_a');
    expect(typeof analysis.explanation).toBe('string');
    expect(analysis.explanation.length).toBeGreaterThan(10);
  });

  it('should throw error for non-existent node', () => {
    expect(() => graph.calculateOptionality('nonexistent')).toThrow();
  });
});

// ============================================================================
// PATH CASCADE ENGINE
// ============================================================================

describe('PathCascadeEngine', () => {
  let engine: PathCascadeEngine;

  beforeEach(() => {
    const graph = createSimpleTestGraph();
    engine = createPathCascadeEngine(graph);
  });

  describe('Path Analysis', () => {
    it('should analyze paths from start node', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return paths', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.paths).toBeInstanceOf(Array);
    });

    it('should return criticality analysis', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.criticalityAnalysis).toBeInstanceOf(Map);
    });

    it('should return optionality analysis', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.optionalityAnalysis).toBeInstanceOf(Map);
    });

    it('should return explanations', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.explanations).toBeDefined();
      expect(result.explanations.summary).toBeDefined();
    });

    it('should return statistics', () => {
      const result = engine.analyzePaths('node_a');
      expect(result.statistics).toBeDefined();
      expect(typeof result.statistics.pathsFound).toBe('number');
    });

    it('should fail for non-existent start node', () => {
      const result = engine.analyzePaths('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Explainability', () => {
    it('should explain criticality', () => {
      const explanation = engine.explainCriticality('node_a');
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should explain optionality', () => {
      const explanation = engine.explainOptionality('node_a');
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should handle non-existent node in criticality explanation', () => {
      const explanation = engine.explainCriticality('nonexistent');
      expect(explanation).toContain('not found');
    });

    it('should handle non-existent node in optionality explanation', () => {
      const explanation = engine.explainOptionality('nonexistent');
      expect(explanation).toContain('not found');
    });
  });

  describe('Path Comparison', () => {
    it('should compare two paths', () => {
      const result = engine.analyzePaths('node_a');
      if (result.paths.length >= 2) {
        const comparison = engine.comparePaths(
          result.paths[0].id,
          result.paths[1].id,
          result.paths
        );
        expect(typeof comparison).toBe('string');
      }
    });

    it('should handle non-existent path comparison', () => {
      const result = engine.analyzePaths('node_a');
      const comparison = engine.comparePaths('fake1', 'fake2', result.paths);
      expect(comparison).toContain('not found');
    });
  });

  describe('Debug Mode', () => {
    it('should not log when debug mode is disabled', () => {
      const graph = createSimpleTestGraph();
      const engine = createPathCascadeEngine(graph, { debugMode: false });
      engine.analyzePaths('node_a');
      expect(engine.getDebugLog()).toHaveLength(0);
    });

    it('should log when debug mode is enabled', () => {
      const graph = createSimpleTestGraph();
      const engine = createPathCascadeEngine(graph, { debugMode: true });
      engine.analyzePaths('node_a');
      expect(engine.getDebugLog().length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// INDIA CAREER GRAPH
// ============================================================================

describe('India Career Graph', () => {
  let graph: CareerGraph;

  beforeEach(() => {
    graph = createIndiaCareerGraph();
  });

  it('should create India career graph', () => {
    expect(graph).toBeDefined();
    expect(graph.getAllNodes().length).toBeGreaterThan(0);
  });

  it('should have JEE exam node', () => {
    const jee = graph.getNode('exam_jee');
    expect(jee).toBeDefined();
    expect(jee?.name).toContain('JEE');
    expect(jee?.type).toBe('EXAM');
  });

  it('should have NEET exam node', () => {
    const neet = graph.getNode('exam_neet');
    expect(neet).toBeDefined();
    expect(neet?.name).toContain('NEET');
    expect(neet?.type).toBe('EXAM');
  });

  it('should have IIT degree node', () => {
    const iit = graph.getNode('degree_iit_btech');
    expect(iit).toBeDefined();
    expect(iit?.name).toContain('IIT');
    expect(iit?.type).toBe('DEGREE');
  });

  it('should have MBBS degree node', () => {
    const mbbs = graph.getNode('degree_mbbs');
    expect(mbbs).toBeDefined();
    expect(mbbs?.name).toBe('MBBS');
    expect(mbbs?.type).toBe('DEGREE');
  });

  it('should have Software Engineer job', () => {
    const swe = graph.getNode('job_software_engineer');
    expect(swe).toBeDefined();
    expect(swe?.type).toBe('JOB');
    expect(swe?.isTerminal).toBe(true);
  });

  it('should have Doctor job', () => {
    const doctor = graph.getNode('job_doctor');
    expect(doctor).toBeDefined();
    expect(doctor?.type).toBe('JOB');
    expect(doctor?.isTerminal).toBe(true);
  });

  it('should have edges connecting nodes', () => {
    const edges = graph.getAllEdges();
    expect(edges.length).toBeGreaterThan(0);
  });

  it('should have JEE to IIT edge', () => {
    const edge = graph.getEdge('edge_jee_iit');
    expect(edge).toBeDefined();
    expect(edge?.fromNodeId).toBe('exam_jee');
    expect(edge?.toNodeId).toBe('degree_iit_btech');
  });

  it('should find paths from JEE', () => {
    const paths = graph.findAllPaths('exam_jee', 5);
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should calculate criticality for JEE', () => {
    const analysis = graph.calculateCriticality('exam_jee');
    expect(analysis).toBeDefined();
    expect(analysis.score).toBeGreaterThan(0);
  });

  it('should calculate optionality for IIT degree', () => {
    const analysis = graph.calculateOptionality('degree_iit_btech');
    expect(analysis).toBeDefined();
    expect(analysis.reachableCareers.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

describe('Convenience Functions', () => {
  it('analyzeCareerPaths should work with default graph', () => {
    const result = analyzeCareerPaths('exam_jee');
    expect(result.success).toBe(true);
    expect(result.paths.length).toBeGreaterThan(0);
  });

  it('analyzeCareerPaths should analyze NEET path', () => {
    const result = analyzeCareerPaths('exam_neet');
    expect(result.success).toBe(true);
  });

  it('should provide explanations for JEE paths', () => {
    const result = analyzeCareerPaths('exam_jee');
    expect(result.explanations.summary).toBeDefined();
    expect(result.explanations.summary.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// PATH METRICS
// ============================================================================

describe('Path Metrics', () => {
  let graph: CareerGraph;

  beforeEach(() => {
    graph = createIndiaCareerGraph();
  });

  it('should calculate path metrics', () => {
    const paths = graph.findAllPaths('exam_jee', 5);
    for (const path of paths) {
      expect(path.metrics).toBeDefined();
      expect(typeof path.metrics.criticality).toBe('number');
      expect(typeof path.metrics.optionality).toBe('number');
      expect(typeof path.metrics.pathProbability).toBe('number');
      expect(typeof path.metrics.reversibility).toBe('number');
      expect(typeof path.metrics.riskScore).toBe('number');
    }
  });

  it('should have metrics between 0 and 1', () => {
    const paths = graph.findAllPaths('exam_jee', 5);
    for (const path of paths) {
      expect(path.metrics.criticality).toBeGreaterThanOrEqual(0);
      expect(path.metrics.criticality).toBeLessThanOrEqual(1);
      expect(path.metrics.optionality).toBeGreaterThanOrEqual(0);
      expect(path.metrics.optionality).toBeLessThanOrEqual(1);
    }
  });

  it('should calculate total time', () => {
    const paths = graph.findAllPaths('exam_jee', 5);
    for (const path of paths) {
      expect(typeof path.totalTime).toBe('number');
      expect(path.totalTime).toBeGreaterThan(0);
    }
  });

  it('should calculate total cost', () => {
    const paths = graph.findAllPaths('exam_jee', 5);
    for (const path of paths) {
      expect(typeof path.totalCost).toBe('number');
      expect(path.totalCost).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// EXAMPLE OUTPUT VALIDATION
// ============================================================================

describe('Example Output Validation', () => {
  it('should produce valid criticality explanation', () => {
    const result = analyzeCareerPaths('exam_jee');
    const explanation = result.explanations.pathCriticality.get('exam_jee');
    expect(explanation).toBeDefined();
    expect(explanation?.toLowerCase()).toContain('criticality');
  });

  it('should produce valid optionality explanation', () => {
    const result = analyzeCareerPaths('exam_jee');
    const explanation = result.explanations.pathOptionality.get('exam_jee');
    expect(explanation).toBeDefined();
    expect(explanation?.length).toBeGreaterThan(10);
  });

  it('should produce summary with key information', () => {
    const result = analyzeCareerPaths('exam_jee');
    const summary = result.explanations.summary;
    expect(summary).toContain('path');
    expect(summary.length).toBeGreaterThan(20);
  });

  it('should match example format from requirements', () => {
    const result = analyzeCareerPaths('exam_jee');
    // Example: "This path has high criticality because it significantly reduces future alternatives."
    const explanation = result.explanations.pathCriticality.get('exam_jee') || '';
    expect(explanation.toLowerCase()).toContain('criticality');
    expect(explanation.length).toBeGreaterThan(20);
  });
});
