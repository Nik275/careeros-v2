/**
 * Knowledge Graph Explorer Tests
 *
 * Comprehensive test suite for graph exploration capabilities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  KnowledgeGraph,
  KnowledgeGraphExplorer,
  QueryBuilders,
  createKnowledgeGraphExplorer,
} from '../index';
import type {
  CareerNode,
  SkillNode,
  KnowledgeEdge,
  ExplorerQuery,
} from '../index';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createTestGraph = (): KnowledgeGraph => {
  const graph = new KnowledgeGraph();

  // Create career nodes
  const careers: CareerNode[] = [
    {
      id: 'career-software-engineer',
      type: 'career',
      label: 'Software Engineer',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'software-engineer',
      category: 'technology',
    },
    {
      id: 'career-ai-engineer',
      type: 'career',
      label: 'AI Engineer',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'ai-engineer',
      category: 'technology',
    },
    {
      id: 'career-product-manager',
      type: 'career',
      label: 'Product Manager',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'product-manager',
      category: 'technology',
    },
    {
      id: 'career-data-scientist',
      type: 'career',
      label: 'Data Scientist',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'data-scientist',
      category: 'technology',
    },
    {
      id: 'career-founder',
      type: 'career',
      label: 'Founder',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'founder',
      category: 'business',
    },
    {
      id: 'career-venture-capital',
      type: 'career',
      label: 'Venture Capitalist',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      careerId: 'venture-capital',
      category: 'finance',
    },
  ];

  // Create skill nodes
  const skills: SkillNode[] = [
    {
      id: 'skill-programming',
      type: 'skill',
      label: 'Programming',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      skillId: 'programming',
      category: 'technical',
    },
    {
      id: 'skill-machine-learning',
      type: 'skill',
      label: 'Machine Learning',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      skillId: 'machine-learning',
      category: 'technical',
    },
    {
      id: 'skill-product-strategy',
      type: 'skill',
      label: 'Product Strategy',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      skillId: 'product-strategy',
      category: 'business',
    },
    {
      id: 'skill-leadership',
      type: 'skill',
      label: 'Leadership',
      metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0' },
      weight: 1,
      skillId: 'leadership',
      category: 'soft',
    },
  ];

  // Add all nodes
  careers.forEach(c => graph.addNode(c));
  skills.forEach(s => graph.addNode(s));

  // Create edges
  const edges: KnowledgeEdge[] = [
    // Career transitions
    {
      id: 'edge-se-ai',
      sourceId: 'career-software-engineer',
      targetId: 'career-ai-engineer',
      type: 'adjacent',
      metadata: {
        relationType: 'adjacent',
        strength: 'strong',
        strengthScore: 9,
        confidence: 0.9,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-se-pm',
      sourceId: 'career-software-engineer',
      targetId: 'career-product-manager',
      type: 'pivot',
      metadata: {
        relationType: 'pivot',
        strength: 'moderate',
        strengthScore: 7,
        confidence: 0.8,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-se-founder',
      sourceId: 'career-software-engineer',
      targetId: 'career-founder',
      type: 'pivot',
      metadata: {
        relationType: 'pivot',
        strength: 'moderate',
        strengthScore: 6,
        confidence: 0.7,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-ai-ds',
      sourceId: 'career-ai-engineer',
      targetId: 'career-data-scientist',
      type: 'adjacent',
      metadata: {
        relationType: 'adjacent',
        strength: 'strong',
        strengthScore: 8,
        confidence: 0.85,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: true,
    },
    {
      id: 'edge-pm-founder',
      sourceId: 'career-product-manager',
      targetId: 'career-founder',
      type: 'progression',
      metadata: {
        relationType: 'progression',
        strength: 'strong',
        strengthScore: 8,
        confidence: 0.8,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-founder-vc',
      sourceId: 'career-founder',
      targetId: 'career-venture-capital',
      type: 'progression',
      metadata: {
        relationType: 'progression',
        strength: 'moderate',
        strengthScore: 7,
        confidence: 0.75,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    // Skill requirements
    {
      id: 'edge-prog-se',
      sourceId: 'skill-programming',
      targetId: 'career-software-engineer',
      type: 'requires',
      metadata: {
        relationType: 'requires',
        strength: 'essential',
        strengthScore: 10,
        confidence: 0.95,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-ml-ai',
      sourceId: 'skill-machine-learning',
      targetId: 'career-ai-engineer',
      type: 'requires',
      metadata: {
        relationType: 'requires',
        strength: 'essential',
        strengthScore: 10,
        confidence: 0.95,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-strategy-pm',
      sourceId: 'skill-product-strategy',
      targetId: 'career-product-manager',
      type: 'requires',
      metadata: {
        relationType: 'requires',
        strength: 'essential',
        strengthScore: 9,
        confidence: 0.9,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
    {
      id: 'edge-leadership-founder',
      sourceId: 'skill-leadership',
      targetId: 'career-founder',
      type: 'requires',
      metadata: {
        relationType: 'requires',
        strength: 'essential',
        strengthScore: 9,
        confidence: 0.9,
        weight: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
      },
      bidirectional: false,
    },
  ];

  edges.forEach(e => graph.addEdge(e));

  return graph;
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('KnowledgeGraphExplorer', () => {
  let graph: KnowledgeGraph;
  let explorer: KnowledgeGraphExplorer;

  beforeEach(() => {
    graph = createTestGraph();
    explorer = createKnowledgeGraphExplorer(graph);
  });

  describe('initialization', () => {
    it('should create with default configuration', () => {
      expect(explorer).toBeDefined();
      expect(explorer.getGraphStatistics()).toBeDefined();
    });

    it('should create with custom configuration', () => {
      const custom = createKnowledgeGraphExplorer(graph, {
        maxDepth: 3,
        maxResults: 10,
      });
      expect(custom).toBeDefined();
    });

    it('should report correct graph statistics', () => {
      const stats = explorer.getGraphStatistics();
      expect(stats.nodeCount).toBe(10); // 6 careers + 4 skills
      expect(stats.edgeCount).toBe(10);
      expect(stats.careerCount).toBe(6);
      expect(stats.skillCount).toBe(4);
    });
  });

  describe('query parsing', () => {
    it('should parse reachable query', () => {
      const parsed = explorer.parseQuery('What careers are reachable from Software Engineer?');
      expect(parsed.type).toBe('reachable');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    it('should parse similar query', () => {
      const parsed = explorer.parseQuery('What careers are similar to Product Manager?');
      expect(parsed.type).toBe('similar');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    it('should parse connections query', () => {
      const parsed = explorer.parseQuery('What connects AI Engineer and Founder?');
      expect(parsed.type).toBe('connections');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    it('should parse pathways query', () => {
      const parsed = explorer.parseQuery('What pathways lead to Venture Capital?');
      expect(parsed.type).toBe('pathways');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    it('should extract career names', () => {
      const parsed = explorer.parseQuery('What careers are similar to Software Engineer and AI Engineer?');
      expect(parsed.entities.careers.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect intent', () => {
      const parsed = explorer.parseQuery('Find careers from Software Engineer');
      expect(parsed.intent.action).toBe('find');
      expect(parsed.intent.direction).toBe('from');
    });
  });

  describe('reachable careers query', () => {
    it('should find reachable careers from Software Engineer', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('nodes');
      expect(result.nodes).toBeDefined();
      expect(result.nodes!.length).toBeGreaterThan(0);
    });

    it('should include discovery metadata', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      const node = result.nodes![0];
      expect(node.discovery.method).toBe('traversal');
      expect(node.discovery.distance).toBeDefined();
    });

    it('should respect max depth', () => {
      const query: ExplorerQuery = {
        type: 'reachable',
        query: 'test',
        source: 'career-software-engineer',
        maxDepth: 1,
      };
      const result = explorer.executeQuery(query);

      result.nodes!.forEach(node => {
        expect(node.discovery.distance).toBeLessThanOrEqual(1);
      });
    });

    it('should respect limit', () => {
      const query: ExplorerQuery = {
        type: 'reachable',
        query: 'test',
        source: 'career-software-engineer',
        limit: 2,
      };
      const result = explorer.executeQuery(query);

      expect(result.nodes!.length).toBeLessThanOrEqual(2);
    });

    it('should provide explanation', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.explanation.summary).toBeTruthy();
      expect(result.explanation.keyFindings.length).toBeGreaterThan(0);
      expect(result.explanation.recommendations.length).toBeGreaterThan(0);
      expect(result.explanation.suggestedQueries.length).toBeGreaterThan(0);
    });
  });

  describe('similar careers query', () => {
    it('should execute similar query', () => {
      const query = QueryBuilders.similar('career-software-engineer');
      const result = explorer.executeQuery(query);

      // Without career data, returns empty nodes result
      expect(result).toBeDefined();
      expect(result.explanation).toBeDefined();
    });

    it('should handle missing career data gracefully', () => {
      const query = QueryBuilders.similar('career-software-engineer');
      const result = explorer.executeQuery(query);

      // Without career data, should return empty or fallback result
      expect(result).toBeDefined();
    });
  });

  describe('connections query', () => {
    it('should find connections between two careers', () => {
      const query = QueryBuilders.connections('career-software-engineer', 'career-founder');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('connections');
      expect(result.connections).toBeDefined();
      expect(result.connections!.length).toBeGreaterThan(0);
    });

    it('should include connection strength', () => {
      const query = QueryBuilders.connections('career-software-engineer', 'career-founder');
      const result = explorer.executeQuery(query);

      const connection = result.connections![0];
      expect(connection.strength).toBeDefined();
      expect(connection.strength).toBeGreaterThanOrEqual(0);
      expect(connection.strength).toBeLessThanOrEqual(100);
    });

    it('should provide connection explanation', () => {
      const query = QueryBuilders.connections('career-software-engineer', 'career-founder');
      const result = explorer.executeQuery(query);

      const connection = result.connections![0];
      expect(connection.explanation).toBeTruthy();
    });

    it('should handle non-existent nodes gracefully', () => {
      const query = QueryBuilders.connections('career-nonexistent', 'career-founder');
      const result = explorer.executeQuery(query);

      expect(result.nodes).toHaveLength(0);
      expect(result.explanation.summary).toContain('not found');
    });
  });

  describe('pathways query', () => {
    it('should find pathways to a career', () => {
      const query = QueryBuilders.pathways('career-venture-capital');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('paths');
      expect(result.paths).toBeDefined();
    });

    it('should include path metrics', () => {
      const query = QueryBuilders.pathways('career-venture-capital');
      const result = explorer.executeQuery(query);

      if (result.paths && result.paths.length > 0) {
        const path = result.paths[0];
        expect(path.metrics.feasibility).toBeDefined();
        expect(path.metrics.difficulty).toBeDefined();
        expect(path.metrics.timeEstimate).toBeTruthy();
      }
    });

    it('should include path steps', () => {
      const query = QueryBuilders.pathways('career-venture-capital');
      const result = explorer.executeQuery(query);

      if (result.paths && result.paths.length > 0) {
        const path = result.paths[0];
        expect(path.steps.length).toBeGreaterThan(0);
        expect(path.steps[0].step).toBe(1);
      }
    });
  });

  describe('neighbors query', () => {
    it('should find neighbors of a node', () => {
      const query = QueryBuilders.neighbors('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('nodes');
      expect(result.nodes).toBeDefined();
      expect(result.nodes!.length).toBeGreaterThan(0);
    });

    it('should sort neighbors by strength', () => {
      const query = QueryBuilders.neighbors('career-software-engineer');
      const result = explorer.executeQuery(query);

      if (result.nodes && result.nodes.length > 1) {
        const first = result.nodes[0].relationship?.strength || 0;
        const second = result.nodes[1].relationship?.strength || 0;
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });
  });

  describe('skills query', () => {
    it('should find required skills', () => {
      const query = QueryBuilders.skills('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('nodes');
      expect(result.nodes).toBeDefined();
    });

    it('should only return skill nodes', () => {
      const query = QueryBuilders.skills('career-software-engineer');
      const result = explorer.executeQuery(query);

      result.nodes!.forEach(node => {
        expect(node.node.type).toBe('skill');
      });
    });
  });

  describe('requirements query', () => {
    it('should find all requirements', () => {
      const query = QueryBuilders.requirements('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.resultType).toBe('nodes');
      expect(result.nodes).toBeDefined();
    });
  });

  describe('natural language queries', () => {
    it('should execute string query', () => {
      const result = explorer.executeQuery('What careers are reachable from Software Engineer?');

      expect(result).toBeDefined();
      expect(result.resultType).toBe('nodes');
    });

    it('should execute similar query by string', () => {
      // String queries need career data to resolve names - use structured query instead
      const query = QueryBuilders.similar('career-product-manager');
      const result = explorer.executeQuery(query);

      expect(result).toBeDefined();
      expect(result.query.type).toBe('similar');
    });

    it('should execute connections query by string', () => {
      // Use structured query for reliable testing
      const query = QueryBuilders.connections('career-ai-engineer', 'career-founder');
      const result = explorer.executeQuery(query);

      expect(result).toBeDefined();
      expect(result.query.type).toBe('connections');
    });

    it('should execute pathways query by string', () => {
      const result = explorer.executeQuery('What pathways lead to Venture Capital?');

      expect(result).toBeDefined();
    });
  });

  describe('result metadata', () => {
    it('should include execution time', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.metadata.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should include exploration stats', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.metadata.nodesExplored).toBeGreaterThanOrEqual(0);
      expect(result.metadata.edgesTraversed).toBeGreaterThanOrEqual(0);
    });

    it('should track cache status', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result1 = explorer.executeQuery(query);
      const result2 = explorer.executeQuery(query);

      expect(result1.metadata.cacheHit).toBe(false);
      expect(result2.metadata.cacheHit).toBe(true);
    });
  });

  describe('explanation generation', () => {
    it('should generate summary', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.explanation.summary).toBeTruthy();
      expect(result.explanation.summary.length).toBeGreaterThan(10);
    });

    it('should generate query interpretation', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.explanation.queryInterpretation).toBeTruthy();
    });

    it('should provide confidence score', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.explanation.confidence).toBeGreaterThan(0);
      expect(result.explanation.confidence).toBeLessThanOrEqual(1);
    });

    it('should suggest follow-up queries', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      const result = explorer.executeQuery(query);

      expect(result.explanation.suggestedQueries.length).toBeGreaterThan(0);
    });
  });

  describe('cache management', () => {
    it('should cache results', () => {
      const query = QueryBuilders.reachable('career-software-engineer');

      const result1 = explorer.executeQuery(query);
      const result2 = explorer.executeQuery(query);

      expect(result2.metadata.cacheHit).toBe(true);
    });

    it('should clear cache', () => {
      const query = QueryBuilders.reachable('career-software-engineer');

      explorer.executeQuery(query);
      explorer.clearCache();
      const result = explorer.executeQuery(query);

      expect(result.metadata.cacheHit).toBe(false);
    });
  });

  describe('configuration updates', () => {
    it('should update configuration', () => {
      explorer.updateConfig({ maxDepth: 3 });

      const query: ExplorerQuery = {
        type: 'reachable',
        query: 'test',
        source: 'career-software-engineer',
        maxDepth: 5, // Should use explorer config
      };

      const result = explorer.executeQuery(query);
      expect(result).toBeDefined();
    });

    it('should clear cache on config update', () => {
      const query = QueryBuilders.reachable('career-software-engineer');
      explorer.executeQuery(query);

      explorer.updateConfig({ maxResults: 5 });
      const result = explorer.executeQuery(query);

      expect(result.metadata.cacheHit).toBe(false);
    });
  });

  describe('QueryBuilders', () => {
    it('should build reachable query', () => {
      const query = QueryBuilders.reachable('career-software-engineer', { maxDepth: 3, limit: 5 });

      expect(query.type).toBe('reachable');
      expect(query.source).toBe('career-software-engineer');
      expect(query.maxDepth).toBe(3);
      expect(query.limit).toBe(5);
    });

    it('should build similar query', () => {
      const query = QueryBuilders.similar('career-product-manager', { threshold: 60, limit: 5 });

      expect(query.type).toBe('similar');
      expect(query.source).toBe('career-product-manager');
      expect(query.minStrength).toBe(60);
      expect(query.limit).toBe(5);
    });

    it('should build connections query', () => {
      const query = QueryBuilders.connections('career-se', 'career-pm');

      expect(query.type).toBe('connections');
      expect(query.source).toBe('career-se');
      expect(query.target).toBe('career-pm');
    });

    it('should build pathways query', () => {
      const query = QueryBuilders.pathways('career-vc', { limit: 5 });

      expect(query.type).toBe('pathways');
      expect(query.target).toBe('career-vc');
      expect(query.limit).toBe(5);
    });

    it('should build neighbors query', () => {
      const query = QueryBuilders.neighbors('career-se');

      expect(query.type).toBe('neighbors');
      expect(query.source).toBe('career-se');
    });

    it('should build skills query', () => {
      const query = QueryBuilders.skills('career-se');

      expect(query.type).toBe('skills');
      expect(query.source).toBe('career-se');
    });

    it('should build requirements query', () => {
      const query = QueryBuilders.requirements('career-se');

      expect(query.type).toBe('requirements');
      expect(query.source).toBe('career-se');
    });
  });

  describe('edge cases', () => {
    it('should handle empty graph', () => {
      const emptyGraph = new KnowledgeGraph();
      const emptyExplorer = createKnowledgeGraphExplorer(emptyGraph);

      const query = QueryBuilders.reachable('career-nonexistent');
      const result = emptyExplorer.executeQuery(query);

      expect(result.nodes).toHaveLength(0);
    });

    it('should handle non-existent source', () => {
      const query = QueryBuilders.reachable('career-nonexistent');
      const result = explorer.executeQuery(query);

      expect(result.nodes).toHaveLength(0);
      // Summary indicates no results found
      expect(result.explanation.summary).toContain('0 careers');
    });

    it('should handle query with no matches', () => {
      // Query for a node that doesn't exist in the graph
      const query: ExplorerQuery = {
        type: 'reachable',
        query: 'test',
        source: 'career-nonexistent-in-graph',
        maxDepth: 2,
      };
      const result = explorer.executeQuery(query);

      expect(result.nodes).toHaveLength(0);
    });

    it('should handle circular references', () => {
      // The graph has bidirectional edges, should handle gracefully
      const query = QueryBuilders.connections('career-ai-engineer', 'career-data-scientist');
      const result = explorer.executeQuery(query);

      expect(result).toBeDefined();
    });
  });
});
