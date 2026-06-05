/**
 * CareerOS Knowledge Graph Core Tests
 *
 * Comprehensive tests for the high-performance graph system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  KnowledgeGraph,
  createKnowledgeGraph,
  createNode,
  createEdge,
  DEFAULT_GRAPH_CONFIG,
  type KnowledgeNode,
  type KnowledgeEdge,
  type NodeType,
} from '../index';

// ============================================================================
// TEST DATA
// ============================================================================

const createTestGraph = (): KnowledgeGraph => {
  const graph = createKnowledgeGraph();

  // Create nodes
  const nodes: KnowledgeNode[] = [
    createNode('career', 'career-sw', 'Software Engineer', {
      weight: 10,
      metadata: { category: 'technology' },
    }),
    createNode('career', 'career-ai', 'AI Engineer', {
      weight: 9,
      metadata: { category: 'technology' },
    }),
    createNode('career', 'career-pm', 'Product Manager', {
      weight: 8,
      metadata: { category: 'business' },
    }),
    createNode('skill', 'skill-python', 'Python', {
      weight: 10,
      metadata: { category: 'programming' },
    }),
    createNode('skill', 'skill-ml', 'Machine Learning', {
      weight: 8,
      metadata: { category: 'ai' },
    }),
    createNode('degree', 'degree-btech', 'B.Tech', {
      weight: 7,
      metadata: { level: 'undergraduate' },
    }),
    createNode('industry', 'industry-tech', 'Technology', {
      weight: 10,
      metadata: { growthRate: 0.15 },
    }),
  ];

  // Add nodes
  graph.addNodes(nodes);

  // Create edges
  const edges: KnowledgeEdge[] = [
    // Career to Career
    createEdge('career-sw', 'career-ai', 'progression', {
      id: 'edge-sw-ai',
      strength: 'strong',
      strengthScore: 8,
      confidence: 0.9,
      weight: 2,
    }),
    createEdge('career-sw', 'career-pm', 'pivot', {
      id: 'edge-sw-pm',
      strength: 'moderate',
      strengthScore: 6,
      confidence: 0.7,
      weight: 3,
    }),

    // Career to Skill
    createEdge('career-sw', 'skill-python', 'required', {
      id: 'edge-sw-python',
      strength: 'very-strong',
      strengthScore: 10,
      confidence: 0.95,
      weight: 1,
    }),
    createEdge('career-ai', 'skill-ml', 'required', {
      id: 'edge-ai-ml',
      strength: 'very-strong',
      strengthScore: 10,
      confidence: 0.95,
      weight: 1,
    }),

    // Career to Degree
    createEdge('career-sw', 'degree-btech', 'common', {
      id: 'edge-sw-degree',
      strength: 'strong',
      strengthScore: 8,
      confidence: 0.85,
      weight: 2,
    }),

    // Career to Industry
    createEdge('career-sw', 'industry-tech', 'primary', {
      id: 'edge-sw-industry',
      strength: 'very-strong',
      strengthScore: 10,
      confidence: 0.95,
      weight: 1,
    }),
  ];

  // Add edges
  graph.addEdges(edges);

  return graph;
};

// ============================================================================
// NODE OPERATIONS
// ============================================================================

describe('Node Operations', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createKnowledgeGraph();
  });

  describe('addNode', () => {
    it('should add a node successfully', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      const result = graph.addNode(node);

      expect(result).toBe(true);
      expect(graph.hasNode('career-1')).toBe(true);
    });

    it('should not add duplicate node', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      graph.addNode(node);
      const result = graph.addNode(node);

      expect(result).toBe(false);
    });

    it('should add different node types', () => {
      const types: NodeType[] = [
        'career',
        'skill',
        'degree',
        'exam',
        'certification',
        'industry',
        'role',
      ];

      for (const type of types) {
        const node = createNode(type, `node-${type}`, `Test ${type}`);
        const result = graph.addNode(node);
        expect(result).toBe(true);
        expect(graph.hasNode(`node-${type}`)).toBe(true);
      }
    });
  });

  describe('addNodes', () => {
    it('should add multiple nodes efficiently', () => {
      const nodes = [
        createNode('career', 'c1', 'Career 1'),
        createNode('career', 'c2', 'Career 2'),
        createNode('career', 'c3', 'Career 3'),
      ];

      const result = graph.addNodes(nodes);

      expect(result.added).toBe(3);
      expect(result.failed).toBe(0);
      expect(graph.getAllNodes()).toHaveLength(3);
    });

    it('should handle duplicates in batch', () => {
      const node = createNode('career', 'c1', 'Career 1');
      graph.addNode(node);

      const nodes = [
        node, // Duplicate
        createNode('career', 'c2', 'Career 2'),
      ];

      const result = graph.addNodes(nodes);

      expect(result.added).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('getNode', () => {
    it('should retrieve existing node', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      graph.addNode(node);

      const retrieved = graph.getNode('career-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('career-1');
      expect(retrieved?.label).toBe('Test Career');
    });

    it('should return undefined for non-existent node', () => {
      const retrieved = graph.getNode('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('hasNode', () => {
    it('should return true for existing node', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      graph.addNode(node);

      expect(graph.hasNode('career-1')).toBe(true);
    });

    it('should return false for non-existent node', () => {
      expect(graph.hasNode('non-existent')).toBe(false);
    });
  });

  describe('removeNode', () => {
    it('should remove node successfully', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      graph.addNode(node);

      const result = graph.removeNode('career-1');

      expect(result).toBe(true);
      expect(graph.hasNode('career-1')).toBe(false);
    });

    it('should return false for non-existent node', () => {
      const result = graph.removeNode('non-existent');
      expect(result).toBe(false);
    });

    it('should remove connected edges', () => {
      const n1 = createNode('career', 'c1', 'Career 1');
      const n2 = createNode('career', 'c2', 'Career 2');
      graph.addNode(n1);
      graph.addNode(n2);

      const edge = createEdge('c1', 'c2', 'adjacent');
      graph.addEdge(edge);

      graph.removeNode('c1');

      expect(graph.getAllEdges()).toHaveLength(0);
    });
  });

  describe('updateNode', () => {
    it('should update node properties', () => {
      const node = createNode('career', 'career-1', 'Test Career', {
        weight: 5,
      });
      graph.addNode(node);

      const result = graph.updateNode('career-1', {
        label: 'Updated Career',
        weight: 10,
      });

      expect(result).toBe(true);

      const updated = graph.getNode('career-1');
      expect(updated?.label).toBe('Updated Career');
      expect(updated?.weight).toBe(10);
    });

    it('should return false for non-existent node', () => {
      const result = graph.updateNode('non-existent', { label: 'Updated' });
      expect(result).toBe(false);
    });

    it('should update metadata', () => {
      const node = createNode('career', 'career-1', 'Test Career');
      graph.addNode(node);

      graph.updateNode('career-1', {
        metadata: { customField: 'customValue' },
      });

      const updated = graph.getNode('career-1');
      expect(updated?.metadata.customField).toBe('customValue');
    });
  });

  describe('queryNodes', () => {
    beforeEach(() => {
      graph.addNodes([
        createNode('career', 'c1', 'Software Engineer', { weight: 10 }),
        createNode('career', 'c2', 'Data Scientist', { weight: 9 }),
        createNode('skill', 's1', 'Python', { weight: 8 }),
        createNode('skill', 's2', 'JavaScript', { weight: 7 }),
      ]);
    });

    it('should filter by type', () => {
      const careers = graph.queryNodes({ types: ['career'] });

      expect(careers).toHaveLength(2);
      expect(careers.every(n => n.type === 'career')).toBe(true);
    });

    it('should filter by multiple types', () => {
      const nodes = graph.queryNodes({ types: ['career', 'skill'] });

      expect(nodes).toHaveLength(4);
    });

    it('should filter by IDs', () => {
      const nodes = graph.queryNodes({ ids: ['c1', 's1'] });

      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.id)).toContain('c1');
      expect(nodes.map(n => n.id)).toContain('s1');
    });

    it('should filter by label pattern', () => {
      const nodes = graph.queryNodes({
        labelPattern: /Engineer/,
      });

      expect(nodes).toHaveLength(1);
      expect(nodes[0].label).toBe('Software Engineer');
    });

    it('should filter by weight range', () => {
      const nodes = graph.queryNodes({
        minWeight: 8,
        maxWeight: 10,
      });

      expect(nodes).toHaveLength(3);
    });

    it('should apply custom filter', () => {
      const nodes = graph.queryNodes({
        filter: (node) => node.label.includes('Engineer'),
      });

      expect(nodes).toHaveLength(1);
    });

    it('should respect limit', () => {
      const nodes = graph.queryNodes({ limit: 2 });

      expect(nodes).toHaveLength(2);
    });

    it('should return all nodes when no filters', () => {
      const nodes = graph.queryNodes();

      expect(nodes).toHaveLength(4);
    });
  });

  describe('getAllNodes', () => {
    it('should return all nodes', () => {
      graph.addNodes([
        createNode('career', 'c1', 'Career 1'),
        createNode('career', 'c2', 'Career 2'),
      ]);

      const nodes = graph.getAllNodes();

      expect(nodes).toHaveLength(2);
    });

    it('should return empty array for empty graph', () => {
      const nodes = graph.getAllNodes();
      expect(nodes).toHaveLength(0);
    });
  });

  describe('getNodesByType', () => {
    it('should return nodes by type', () => {
      graph.addNodes([
        createNode('career', 'c1', 'Career 1'),
        createNode('career', 'c2', 'Career 2'),
        createNode('skill', 's1', 'Skill 1'),
      ]);

      const careers = graph.getNodesByType('career');

      expect(careers).toHaveLength(2);
      expect(careers.every(n => n.type === 'career')).toBe(true);
    });

    it('should return empty array for unknown type', () => {
      const nodes = graph.getNodesByType('career');
      expect(nodes).toHaveLength(0);
    });
  });
});

// ============================================================================
// EDGE OPERATIONS
// ============================================================================

describe('Edge Operations', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createTestGraph();
  });

  describe('addEdge', () => {
    it('should add edge between existing nodes', () => {
      const edge = createEdge('career-sw', 'career-ai', 'adjacent', {
        id: 'edge-test',
      });

      // Remove existing edge first
      graph.removeEdge('edge-sw-ai');

      const result = graph.addEdge(edge);

      expect(result).toBe(true);
      expect(graph.hasEdge('edge-test')).toBe(true);
    });

    it('should not add edge for non-existent source', () => {
      const edge = createEdge('non-existent', 'career-ai', 'adjacent');
      const result = graph.addEdge(edge);

      expect(result).toBe(false);
    });

    it('should not add edge for non-existent target', () => {
      const edge = createEdge('career-sw', 'non-existent', 'adjacent');
      const result = graph.addEdge(edge);

      expect(result).toBe(false);
    });

    it('should not add duplicate edge', () => {
      const edge = createEdge('career-sw', 'career-ai', 'adjacent', {
        id: 'edge-sw-ai', // Existing ID
      });

      const result = graph.addEdge(edge);
      expect(result).toBe(false);
    });
  });

  describe('addEdges', () => {
    it('should add multiple edges', () => {
      // Clear existing edges first
      graph.getAllEdges().forEach(e => graph.removeEdge(e.id));

      const edges = [
        createEdge('career-sw', 'career-ai', 'adjacent', { id: 'e1' }),
        createEdge('career-sw', 'career-pm', 'pivot', { id: 'e2' }),
      ];

      const result = graph.addEdges(edges);

      expect(result.added).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('getEdge', () => {
    it('should retrieve existing edge', () => {
      const edge = graph.getEdge('edge-sw-ai');

      expect(edge).toBeDefined();
      expect(edge?.sourceId).toBe('career-sw');
      expect(edge?.targetId).toBe('career-ai');
    });

    it('should return undefined for non-existent edge', () => {
      const edge = graph.getEdge('non-existent');
      expect(edge).toBeUndefined();
    });
  });

  describe('hasEdge', () => {
    it('should return true for existing edge', () => {
      expect(graph.hasEdge('edge-sw-ai')).toBe(true);
    });

    it('should return false for non-existent edge', () => {
      expect(graph.hasEdge('non-existent')).toBe(false);
    });
  });

  describe('removeEdge', () => {
    it('should remove edge successfully', () => {
      const result = graph.removeEdge('edge-sw-ai');

      expect(result).toBe(true);
      expect(graph.hasEdge('edge-sw-ai')).toBe(false);
    });

    it('should return false for non-existent edge', () => {
      const result = graph.removeEdge('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('updateEdge', () => {
    it('should update edge properties', () => {
      const result = graph.updateEdge('edge-sw-ai', {
        metadata: { confidence: 0.99 },
      });

      expect(result).toBe(true);

      const updated = graph.getEdge('edge-sw-ai');
      expect(updated?.metadata.confidence).toBe(0.99);
    });

    it('should return false for non-existent edge', () => {
      const result = graph.updateEdge('non-existent', {});
      expect(result).toBe(false);
    });
  });

  describe('queryEdges', () => {
    it('should filter by source IDs', () => {
      const edges = graph.queryEdges({ sourceIds: ['career-sw'] });

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.sourceId === 'career-sw')).toBe(true);
    });

    it('should filter by target IDs', () => {
      const edges = graph.queryEdges({ targetIds: ['career-ai'] });

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.targetId === 'career-ai')).toBe(true);
    });

    it('should filter by edge types', () => {
      const edges = graph.queryEdges({ types: ['progression'] });

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.type === 'progression')).toBe(true);
    });

    it('should filter by strength', () => {
      const edges = graph.queryEdges({
        strengths: ['very-strong', 'strong'],
      });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('should filter by confidence range', () => {
      const edges = graph.queryEdges({
        minConfidence: 0.9,
        maxConfidence: 1.0,
      });

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.metadata.confidence >= 0.9)).toBe(true);
    });

    it('should filter by weight', () => {
      const edges = graph.queryEdges({ minWeight: 1 });

      expect(edges.length).toBeGreaterThan(0);
    });

    it('should apply custom filter', () => {
      const edges = graph.queryEdges({
        filter: (edge) => edge.metadata.confidence > 0.8,
      });

      expect(edges.every(e => e.metadata.confidence > 0.8)).toBe(true);
    });

    it('should respect limit', () => {
      const edges = graph.queryEdges({ limit: 2 });

      expect(edges).toHaveLength(2);
    });
  });

  describe('getAllEdges', () => {
    it('should return all edges', () => {
      const edges = graph.getAllEdges();

      expect(edges.length).toBeGreaterThan(0);
    });
  });

  describe('getEdgesFrom', () => {
    it('should return outgoing edges', () => {
      const edges = graph.getEdgesFrom('career-sw');

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.sourceId === 'career-sw')).toBe(true);
    });

    it('should return empty for node with no outgoing edges', () => {
      const edges = graph.getEdgesFrom('skill-python');
      expect(edges).toHaveLength(0);
    });
  });

  describe('getEdgesTo', () => {
    it('should return incoming edges', () => {
      const edges = graph.getEdgesTo('career-ai');

      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every(e => e.targetId === 'career-ai')).toBe(true);
    });

    it('should return empty for node with no incoming edges', () => {
      const edges = graph.getEdgesTo('career-sw');
      expect(edges).toHaveLength(0);
    });
  });
});

// ============================================================================
// CONNECTIVITY OPERATIONS
// ============================================================================

describe('Connectivity Operations', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createTestGraph();
  });

  describe('getConnectedNodes', () => {
    it('should return outgoing connections by default', () => {
      const connected = graph.getConnectedNodes('career-sw');

      expect(connected.length).toBeGreaterThan(0);
      expect(connected.some(c => c.node.id === 'career-ai')).toBe(true);
    });

    it('should filter by direction', () => {
      const outgoing = graph.getConnectedNodes('career-sw', {
        direction: 'outgoing',
      });
      expect(outgoing.every(c =>
        graph.getEdgesFrom('career-sw').some(e => e.targetId === c.node.id)
      )).toBe(true);

      const incoming = graph.getConnectedNodes('career-ai', {
        direction: 'incoming',
      });
      expect(incoming.length).toBeGreaterThan(0);
    });

    it('should filter by edge types', () => {
      const connected = graph.getConnectedNodes('career-sw', {
        edgeTypes: ['progression'],
      });

      expect(connected.every(c =>
        c.edge.type === 'progression'
      )).toBe(true);
    });

    it('should filter by confidence', () => {
      const connected = graph.getConnectedNodes('career-sw', {
        minConfidence: 0.9,
      });

      expect(connected.every(c =>
        c.edge.metadata.confidence >= 0.9
      )).toBe(true);
    });
  });

  describe('findRelationships', () => {
    it('should find direct relationship', () => {
      const paths = graph.findRelationships('career-sw', 'career-ai');

      expect(paths.length).toBeGreaterThan(0);
      expect(paths[0].nodes).toContain('career-sw');
      expect(paths[0].nodes).toContain('career-ai');
    });

    it('should find indirect relationships', () => {
      // career-sw -> skill-python (no outgoing from skill-python)
      // So let's create a path: career-sw -> career-ai -> skill-ml
      const paths = graph.findRelationships('career-sw', 'skill-ml');

      // Should find path through career-ai
      expect(paths.length).toBeGreaterThan(0);
    });

    it('should respect max length', () => {
      const paths = graph.findRelationships('career-sw', 'career-ai', {
        maxLength: 1,
      });

      expect(paths.every(p => p.length <= 1)).toBe(true);
    });

    it('should return empty for no relationship', () => {
      const paths = graph.findRelationships('career-sw', 'non-existent');
      expect(paths).toHaveLength(0);
    });
  });

  describe('getShortestPath', () => {
    it('should find shortest path', () => {
      const path = graph.getShortestPath({
        sourceId: 'career-sw',
        targetId: 'career-ai',
      });

      expect(path).not.toBeNull();
      expect(path!.nodes).toContain('career-sw');
      expect(path!.nodes).toContain('career-ai');
    });

    it('should return null for unreachable target', () => {
      const path = graph.getShortestPath({
        sourceId: 'career-sw',
        targetId: 'non-existent',
      });

      expect(path).toBeNull();
    });

    it('should filter by edge types', () => {
      const path = graph.getShortestPath({
        sourceId: 'career-sw',
        targetId: 'career-ai',
        allowedEdgeTypes: ['progression'],
      });

      expect(path).not.toBeNull();
      expect(path!.edges.every(e => e.type === 'progression')).toBe(true);
    });

    it('should filter by confidence', () => {
      const path = graph.getShortestPath({
        sourceId: 'career-sw',
        targetId: 'career-ai',
        minConfidence: 0.8,
      });

      expect(path).not.toBeNull();
      expect(path!.edges.every(e => e.metadata.confidence >= 0.8)).toBe(true);
    });
  });

  describe('getNeighborhood', () => {
    it('should get neighborhood at depth 1', () => {
      const neighborhood = graph.getNeighborhood({
        nodeId: 'career-sw',
        depth: 1,
      });

      expect(neighborhood.center.id).toBe('career-sw');
      expect(neighborhood.depth).toBe(1);
      expect(neighborhood.totalNodes).toBeGreaterThan(0);
    });

    it('should get neighborhood at depth 2', () => {
      const neighborhood = graph.getNeighborhood({
        nodeId: 'career-sw',
        depth: 2,
      });

      expect(neighborhood.depth).toBe(2);
      expect(neighborhood.layers.has(1)).toBe(true);
      expect(neighborhood.layers.has(2)).toBe(true);
    });

    it('should filter by node types', () => {
      const neighborhood = graph.getNeighborhood({
        nodeId: 'career-sw',
        depth: 1,
        nodeTypes: ['career'],
      });

      const allNodes = Array.from(neighborhood.layers.values()).flat();
      expect(allNodes.every(n => n.type === 'career')).toBe(true);
    });

    it('should filter by edge types', () => {
      const neighborhood = graph.getNeighborhood({
        nodeId: 'career-sw',
        depth: 1,
        allowedEdgeTypes: ['progression'],
      });

      expect(neighborhood.edges.every(e => e.type === 'progression')).toBe(true);
    });

    it('should filter by confidence', () => {
      const neighborhood = graph.getNeighborhood({
        nodeId: 'career-sw',
        depth: 1,
        minConfidence: 0.9,
      });

      expect(neighborhood.edges.every(e => e.metadata.confidence >= 0.9)).toBe(true);
    });

    it('should throw for non-existent node', () => {
      expect(() => {
        graph.getNeighborhood({
          nodeId: 'non-existent',
          depth: 1,
        });
      }).toThrow();
    });
  });
});

// ============================================================================
// STATISTICS
// ============================================================================

describe('Statistics', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createTestGraph();
  });

  describe('getStatistics', () => {
    it('should return node count', () => {
      const stats = graph.getStatistics();
      expect(stats.nodeCount).toBe(7);
    });

    it('should return edge count', () => {
      const stats = graph.getStatistics();
      expect(stats.edgeCount).toBe(6);
    });

    it('should return nodes by type', () => {
      const stats = graph.getStatistics();

      expect(stats.nodesByType.get('career')).toBe(3);
      expect(stats.nodesByType.get('skill')).toBe(2);
      expect(stats.nodesByType.get('degree')).toBe(1);
      expect(stats.nodesByType.get('industry')).toBe(1);
    });

    it('should return edges by type', () => {
      const stats = graph.getStatistics();

      expect(stats.edgesByType.get('progression')).toBe(1);
      expect(stats.edgesByType.get('pivot')).toBe(1);
      expect(stats.edgesByType.get('required')).toBe(2);
      expect(stats.edgesByType.get('common')).toBe(1);
      expect(stats.edgesByType.get('primary')).toBe(1);
    });

    it('should calculate average weights', () => {
      const stats = graph.getStatistics();

      expect(stats.averageNodeWeight).toBeGreaterThan(0);
      expect(stats.averageEdgeWeight).toBeGreaterThan(0);
    });

    it('should calculate average confidence', () => {
      const stats = graph.getStatistics();

      expect(stats.averageEdgeConfidence).toBeGreaterThan(0);
      expect(stats.averageEdgeConfidence).toBeLessThanOrEqual(1);
    });

    it('should calculate density', () => {
      const stats = graph.getStatistics();

      expect(stats.density).toBeGreaterThanOrEqual(0);
      expect(stats.density).toBeLessThanOrEqual(1);
    });

    it('should calculate average degree', () => {
      const stats = graph.getStatistics();

      expect(stats.averageDegree).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

describe('Cache Management', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createKnowledgeGraph({ enableCache: true, cacheSize: 100 });
    graph.addNodes([
      createNode('career', 'c1', 'Career 1'),
      createNode('career', 'c2', 'Career 2'),
    ]);
    graph.addEdge(createEdge('c1', 'c2', 'adjacent', { id: 'e1' }));
  });

  describe('caching', () => {
    it('should cache query results', () => {
      // First query
      const result1 = graph.queryNodes({ types: ['career'] });

      // Second query (should be cached)
      const result2 = graph.queryNodes({ types: ['career'] });

      expect(result1).toEqual(result2);
    });

    it('should invalidate cache on node add', () => {
      // Query to populate cache
      graph.queryNodes({ types: ['career'] });

      // Add new node
      graph.addNode(createNode('career', 'c3', 'Career 3'));

      // Query again
      const result = graph.queryNodes({ types: ['career'] });

      expect(result).toHaveLength(3);
    });

    it('should invalidate cache on edge add', () => {
      // Query to populate cache
      graph.queryEdges({});

      // Add new edge
      graph.addNode(createNode('career', 'c3', 'Career 3'));
      graph.addEdge(createEdge('c2', 'c3', 'adjacent', { id: 'e2' }));

      // Query again
      const result = graph.queryEdges({});

      expect(result).toHaveLength(2);
    });
  });

  describe('clearCache', () => {
    it('should clear cache', () => {
      // Populate cache
      graph.queryNodes({});

      // Clear cache
      graph.clearCache();

      // Query should still work
      const result = graph.queryNodes({});
      expect(result).toHaveLength(2);
    });
  });
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

describe('Bulk Operations', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createTestGraph();
  });

  describe('clear', () => {
    it('should remove all nodes and edges', () => {
      graph.clear();

      expect(graph.getAllNodes()).toHaveLength(0);
      expect(graph.getAllEdges()).toHaveLength(0);
    });
  });

  describe('export', () => {
    it('should export all data', () => {
      const data = graph.export();

      expect(data.nodes).toHaveLength(7);
      expect(data.edges).toHaveLength(6);
      expect(data.config).toBeDefined();
    });
  });

  describe('import', () => {
    it('should import data', () => {
      const data = graph.export();

      const newGraph = createKnowledgeGraph();
      const result = newGraph.import(data);

      expect(result.nodesAdded).toBe(7);
      expect(result.edgesAdded).toBe(6);
      expect(newGraph.getAllNodes()).toHaveLength(7);
      expect(newGraph.getAllEdges()).toHaveLength(6);
    });

    it('should replace existing data', () => {
      const data = graph.export();

      // Add extra node
      graph.addNode(createNode('career', 'extra', 'Extra'));
      expect(graph.getAllNodes()).toHaveLength(8);

      // Re-import
      graph.import(data);

      expect(graph.getAllNodes()).toHaveLength(7);
    });
  });
});

// ============================================================================
// SIMULATION SUPPORT
// ============================================================================

describe('Simulation Support', () => {
  let graph: KnowledgeGraph;

  beforeEach(() => {
    graph = createTestGraph();
  });

  describe('createSimulationSubgraph', () => {
    it('should create subgraph with specified nodes', () => {
      const subgraph = graph.createSimulationSubgraph([
        'career-sw',
        'career-ai',
      ]);

      expect(subgraph.hasNode('career-sw')).toBe(true);
      expect(subgraph.hasNode('career-ai')).toBe(true);
      expect(subgraph.hasNode('career-pm')).toBe(false);
    });

    it('should include edges between subgraph nodes', () => {
      const subgraph = graph.createSimulationSubgraph([
        'career-sw',
        'career-ai',
      ]);

      expect(subgraph.getAllEdges().length).toBeGreaterThan(0);
    });

    it('should include neighbors when requested', () => {
      const subgraph = graph.createSimulationSubgraph(
        ['career-sw'],
        { includeNeighbors: true, neighborDepth: 1 }
      );

      // Should include career-sw and its neighbors
      expect(subgraph.getAllNodes().length).toBeGreaterThan(1);
    });
  });

  describe('clone', () => {
    it('should create independent copy', () => {
      const cloned = graph.clone();

      expect(cloned.getAllNodes()).toHaveLength(graph.getAllNodes().length);
      expect(cloned.getAllEdges()).toHaveLength(graph.getAllEdges().length);

      // Modify clone
      cloned.addNode(createNode('career', 'new', 'New Career'));

      // Original should be unchanged
      expect(graph.hasNode('new')).toBe(false);
      expect(cloned.hasNode('new')).toBe(true);
    });
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should handle 1000 nodes efficiently', () => {
    const graph = createKnowledgeGraph();
    const nodes: KnowledgeNode[] = [];

    for (let i = 0; i < 1000; i++) {
      nodes.push(createNode('career', `career-${i}`, `Career ${i}`));
    }

    const start = performance.now();
    graph.addNodes(nodes);
    const end = performance.now();

    expect(graph.getAllNodes()).toHaveLength(1000);
    expect(end - start).toBeLessThan(100); // Should complete in < 100ms
  });

  it('should handle 1000 edges efficiently', () => {
    const graph = createKnowledgeGraph();

    // Add nodes first
    for (let i = 0; i < 100; i++) {
      graph.addNode(createNode('career', `career-${i}`, `Career ${i}`));
    }

    // Add edges
    const edges: KnowledgeEdge[] = [];
    for (let i = 0; i < 99; i++) {
      edges.push(
        createEdge(`career-${i}`, `career-${i + 1}`, 'adjacent', {
          id: `edge-${i}`,
        })
      );
    }

    const start = performance.now();
    graph.addEdges(edges);
    const end = performance.now();

    expect(graph.getAllEdges()).toHaveLength(99);
    expect(end - start).toBeLessThan(100);
  });

  it('should query efficiently', () => {
    const graph = createKnowledgeGraph();

    // Add 1000 nodes
    for (let i = 0; i < 1000; i++) {
      graph.addNode(
        createNode(i % 2 === 0 ? 'career' : 'skill', `node-${i}`, `Node ${i}`)
      );
    }

    const start = performance.now();
    const careers = graph.queryNodes({ types: ['career'] });
    const end = performance.now();

    expect(careers).toHaveLength(500);
    expect(end - start).toBeLessThan(50);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration', () => {
  it('should support complete workflow', () => {
    const graph = createKnowledgeGraph();

    // 1. Add nodes
    graph.addNodes([
      createNode('career', 'c1', 'Career 1', { weight: 10 }),
      createNode('career', 'c2', 'Career 2', { weight: 8 }),
      createNode('skill', 's1', 'Skill 1', { weight: 9 }),
    ]);

    // 2. Add edges
    graph.addEdges([
      createEdge('c1', 'c2', 'progression', {
        id: 'e1',
        strength: 'strong',
        confidence: 0.9,
      }),
      createEdge('c1', 's1', 'required', {
        id: 'e2',
        strength: 'very-strong',
        confidence: 0.95,
      }),
    ]);

    // 3. Query nodes
    const careers = graph.queryNodes({ types: ['career'] });
    expect(careers).toHaveLength(2);

    // 4. Query edges
    const edges = graph.queryEdges({ sourceIds: ['c1'] });
    expect(edges).toHaveLength(2);

    // 5. Find path
    const path = graph.getShortestPath({
      sourceId: 'c1',
      targetId: 'c2',
    });
    expect(path).toBeDefined();

    // 6. Get neighborhood
    const neighborhood = graph.getNeighborhood({
      nodeId: 'c1',
      depth: 1,
    });
    expect(neighborhood.totalNodes).toBe(2);

    // 7. Get statistics
    const stats = graph.getStatistics();
    expect(stats.nodeCount).toBe(3);
    expect(stats.edgeCount).toBe(2);

    // 8. Export and import
    const data = graph.export();
    const newGraph = createKnowledgeGraph();
    newGraph.import(data);
    expect(newGraph.getAllNodes()).toHaveLength(3);
  });
});
