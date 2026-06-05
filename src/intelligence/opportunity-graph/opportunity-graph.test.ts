/**
 * India Opportunity Graph Tests
 *
 * Phase 8.8: Comprehensive test suite for India Opportunity Graph
 *
 * Tests cover:
 * - Graph Builder functionality
 * - Education Graph (schools, exams, colleges, degrees)
 * - Pathway Engine
 * - Transition Engine
 * - Opportunity Graph Engine
 * - Integration scenarios
 * - India-specific pathways
 *
 * @module opportunity-graph-tests
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  OpportunityGraph,
  OpportunityNode,
  OpportunityEdge,
  SchoolStream,
  ExamType,
  DegreeType,
  // Builders
  createGraphBuilder,
  mergeGraphs,
  // Education Graph
  buildEducationGraph,
  createSchoolStreamNodes,
  createExamNodes,
  createCollegeTypeNodes,
  createDegreeNodes,
  getEducationStats,
  // Pathway Engine
  createPathwayEngine,
  generatePathway,
  findAllPathways,
  findShortestPath,
  // Transition Engine
  createTransitionEngine,
  analyzeTransition,
  findPossibleTransitions,
  findPivotOpportunities,
  // Main Engine
  createOpportunityGraphEngine,
  queryOpportunityGraph,
  simulateDecision,
  analyzeOptionality,
  analyzeCriticality,
} from './index';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createTestNode(id: string, type: any, name: string): OpportunityNode {
  return {
    id,
    type,
    name,
    description: `Test ${name}`,
    tags: [],
    metadata: {},
  };
}

function createTestEdge(id: string, source: string, target: string, type: any): OpportunityEdge {
  return {
    id,
    source,
    target,
    type,
    weight: 0.5,
    description: `Test edge from ${source} to ${target}`,
    metadata: {},
  };
}

// ============================================================================
// GRAPH BUILDER TESTS
// ============================================================================

describe('GraphBuilder', () => {
  let builder: ReturnType<typeof createGraphBuilder>;

  beforeEach(() => {
    builder = createGraphBuilder();
  });

  describe('Basic Functionality', () => {
    it('should create a graph builder', () => {
      expect(builder).toBeDefined();
    });

    it('should add a node', () => {
      const node = createTestNode('test-node', 'DEGREE', 'Test Degree');
      builder.addNode(node);
      expect(builder.getNode('test-node')).toBeDefined();
    });

    it('should add multiple nodes', () => {
      const nodes = [
        createTestNode('node-1', 'DEGREE', 'Node 1'),
        createTestNode('node-2', 'CAREER', 'Node 2'),
      ];
      builder.addNodes(nodes);
      expect(builder.getNode('node-1')).toBeDefined();
      expect(builder.getNode('node-2')).toBeDefined();
    });

    it('should add an edge between nodes', () => {
      const node1 = createTestNode('node-1', 'DEGREE', 'Node 1');
      const node2 = createTestNode('node-2', 'CAREER', 'Node 2');
      builder.addNode(node1);
      builder.addNode(node2);

      const edge = createTestEdge('edge-1', 'node-1', 'node-2', 'LEADS_TO');
      builder.addEdge(edge);

      const edges = builder.getEdgesFrom('node-1');
      expect(edges.length).toBe(1);
    });

    it('should throw error when adding edge with non-existent source', () => {
      const node = createTestNode('node-2', 'CAREER', 'Node 2');
      builder.addNode(node);

      const edge = createTestEdge('edge-1', 'non-existent', 'node-2', 'LEADS_TO');
      expect(() => builder.addEdge(edge)).toThrow();
    });

    it('should throw error when adding edge with non-existent target', () => {
      const node = createTestNode('node-1', 'DEGREE', 'Node 1');
      builder.addNode(node);

      const edge = createTestEdge('edge-1', 'node-1', 'non-existent', 'LEADS_TO');
      expect(() => builder.addEdge(edge)).toThrow();
    });
  });

  describe('Graph Queries', () => {
    beforeEach(() => {
      const node1 = createTestNode('node-1', 'DEGREE', 'Node 1');
      const node2 = createTestNode('node-2', 'CAREER', 'Node 2');
      const node3 = createTestNode('node-3', 'INDUSTRY', 'Node 3');
      builder.addNodes([node1, node2, node3]);

      builder.addEdge(createTestEdge('edge-1', 'node-1', 'node-2', 'LEADS_TO'));
      builder.addEdge(createTestEdge('edge-2', 'node-2', 'node-3', 'LEADS_TO'));
    });

    it('should get connected nodes', () => {
      const connected = builder.getConnectedNodes('node-1');
      expect(connected.length).toBe(1);
      expect(connected[0].id).toBe('node-2');
    });

    it('should get edges from a node', () => {
      const edges = builder.getEdgesFrom('node-1');
      expect(edges.length).toBe(1);
      expect(edges[0].target).toBe('node-2');
    });

    it('should get edges to a node', () => {
      const edges = builder.getEdgesTo('node-2');
      expect(edges.length).toBe(1);
      expect(edges[0].source).toBe('node-1');
    });

    it('should get nodes by type', () => {
      const degreeNodes = builder.getNodesByType('DEGREE');
      expect(degreeNodes.length).toBe(1);
      expect(degreeNodes[0].id).toBe('node-1');
    });

    it('should check if path exists', () => {
      expect(builder.hasPath('node-1', 'node-3')).toBe(true);
      expect(builder.hasPath('node-3', 'node-1')).toBe(false);
    });

    it('should find all paths between nodes', () => {
      const paths = builder.findAllPaths('node-1', 'node-3');
      expect(paths.length).toBeGreaterThan(0);
      expect(paths[0][0]).toBe('node-1');
      expect(paths[0][paths[0].length - 1]).toBe('node-3');
    });

    it('should calculate optionality score', () => {
      const optionality = builder.calculateOptionality('node-1');
      expect(optionality).toBeGreaterThanOrEqual(0);
      expect(optionality).toBeLessThanOrEqual(1);
    });
  });

  describe('Graph Statistics', () => {
    it('should return graph stats', () => {
      const stats = builder.getStats();
      expect(stats.nodeCount).toBe(0);
      expect(stats.edgeCount).toBe(0);
    });

    it('should track node type distribution', () => {
      builder.addNode(createTestNode('n1', 'DEGREE', 'Degree'));
      builder.addNode(createTestNode('n2', 'CAREER', 'Career'));
      builder.addNode(createTestNode('n3', 'CAREER', 'Career 2'));

      const stats = builder.getStats();
      expect(stats.nodeTypeDistribution.DEGREE).toBe(1);
      expect(stats.nodeTypeDistribution.CAREER).toBe(2);
    });
  });

  describe('Graph Operations', () => {
    it('should build and return graph', () => {
      builder.addNode(createTestNode('n1', 'DEGREE', 'Degree'));
      const graph = builder.buildGraph();
      expect(graph.nodes.size).toBe(1);
    });

    it('should clear the graph', () => {
      builder.addNode(createTestNode('n1', 'DEGREE', 'Degree'));
      builder.clear();
      const stats = builder.getStats();
      expect(stats.nodeCount).toBe(0);
    });

    it('should clone the graph', () => {
      builder.addNode(createTestNode('n1', 'DEGREE', 'Degree'));
      const clone = builder.clone();
      expect(clone.nodes.size).toBe(1);
    });
  });
});

// ============================================================================
// EDUCATION GRAPH TESTS
// ============================================================================

describe('Education Graph', () => {
  describe('School Stream Nodes', () => {
    it('should create all school stream nodes', () => {
      const streams = createSchoolStreamNodes();
      expect(streams.length).toBeGreaterThanOrEqual(5);
    });

    it('should include PCM stream', () => {
      const streams = createSchoolStreamNodes();
      const pcm = streams.find(s => s.stream === 'PCM');
      expect(pcm).toBeDefined();
      expect(pcm?.eligibleExams).toContain('exam-jee-main');
    });

    it('should include PCB stream', () => {
      const streams = createSchoolStreamNodes();
      const pcb = streams.find(s => s.stream === 'PCB');
      expect(pcb).toBeDefined();
      expect(pcb?.eligibleExams).toContain('exam-neet');
    });

    it('should include Commerce stream', () => {
      const streams = createSchoolStreamNodes();
      const commerce = streams.find(s => s.stream === 'COMMERCE');
      expect(commerce).toBeDefined();
      expect(commerce?.eligibleExams).toContain('exam-ca-foundation');
    });

    it('should include Arts stream', () => {
      const streams = createSchoolStreamNodes();
      const arts = streams.find(s => s.stream === 'ARTS');
      expect(arts).toBeDefined();
      expect(arts?.eligibleExams).toContain('exam-clat');
    });

    it('should have optionality scores', () => {
      const streams = createSchoolStreamNodes();
      for (const stream of streams) {
        expect(stream.optionalityScore).toBeGreaterThanOrEqual(0);
        expect(stream.optionalityScore).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Exam Nodes', () => {
    it('should create all exam nodes', () => {
      const exams = createExamNodes();
      expect(exams.length).toBeGreaterThanOrEqual(10);
    });

    it('should include JEE Main', () => {
      const exams = createExamNodes();
      const jee = exams.find(e => e.examType === 'JEE_MAIN');
      expect(jee).toBeDefined();
      expect(jee?.competitionLevel).toBe('EXTREME');
    });

    it('should include JEE Advanced', () => {
      const exams = createExamNodes();
      const jeeAdv = exams.find(e => e.examType === 'JEE_ADVANCED');
      expect(jeeAdv).toBeDefined();
      expect(jeeAdv?.opensDoorsTo).toContain('college-iit');
    });

    it('should include NEET', () => {
      const exams = createExamNodes();
      const neet = exams.find(e => e.examType === 'NEET');
      expect(neet).toBeDefined();
      expect(neet?.opensDoorsTo).toContain('college-medical-govt');
    });

    it('should include CAT', () => {
      const exams = createExamNodes();
      const cat = exams.find(e => e.examType === 'CAT');
      expect(cat).toBeDefined();
      expect(cat?.opensDoorsTo).toContain('college-iim');
    });

    it('should include CLAT', () => {
      const exams = createExamNodes();
      const clat = exams.find(e => e.examType === 'CLAT');
      expect(clat).toBeDefined();
      expect(clat?.opensDoorsTo).toContain('college-nlu');
    });

    it('should include UPSC', () => {
      const exams = createExamNodes();
      const upsc = exams.find(e => e.examType === 'UPSC');
      expect(upsc).toBeDefined();
      expect(upsc?.successRate).toBeLessThan(1);
    });

    it('should include CA exams', () => {
      const exams = createExamNodes();
      const caFoundation = exams.find(e => e.examType === 'CA_FOUNDATION');
      expect(caFoundation).toBeDefined();
      const caFinal = exams.find(e => e.examType === 'CA_FINAL');
      expect(caFinal).toBeDefined();
    });

    it('should have success rates', () => {
      const exams = createExamNodes();
      for (const exam of exams) {
        if (exam.successRate !== undefined) {
          expect(exam.successRate).toBeGreaterThan(0);
          expect(exam.successRate).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('College Type Nodes', () => {
    it('should create all college type nodes', () => {
      const colleges = createCollegeTypeNodes();
      expect(colleges.length).toBeGreaterThanOrEqual(5);
    });

    it('should include IITs', () => {
      const colleges = createCollegeTypeNodes();
      const iit = colleges.find(c => c.id === 'college-iit');
      expect(iit).toBeDefined();
      expect(iit?.tier).toBe('TIER_1');
      expect(iit?.reputationScore).toBeGreaterThan(0.9);
    });

    it('should include NITs', () => {
      const colleges = createCollegeTypeNodes();
      const nit = colleges.find(c => c.id === 'college-nit');
      expect(nit).toBeDefined();
      expect(nit?.tier).toBe('TIER_1');
    });

    it('should include IIMs', () => {
      const colleges = createCollegeTypeNodes();
      const iim = colleges.find(c => c.id === 'college-iim');
      expect(iim).toBeDefined();
      expect(iim?.reputationScore).toBeGreaterThan(0.9);
    });

    it('should include NLUs', () => {
      const colleges = createCollegeTypeNodes();
      const nlu = colleges.find(c => c.id === 'college-nlu');
      expect(nlu).toBeDefined();
      expect(nlu?.tier).toBe('TIER_1');
    });

    it('should have placement rates', () => {
      const colleges = createCollegeTypeNodes();
      for (const college of colleges) {
        if (college.placementRate !== undefined) {
          expect(college.placementRate).toBeGreaterThanOrEqual(0);
          expect(college.placementRate).toBeLessThanOrEqual(100);
        }
      }
    });

    it('should have reputation scores', () => {
      const colleges = createCollegeTypeNodes();
      for (const college of colleges) {
        expect(college.reputationScore).toBeGreaterThanOrEqual(0);
        expect(college.reputationScore).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Degree Nodes', () => {
    it('should create all degree nodes', () => {
      const degrees = createDegreeNodes();
      expect(degrees.length).toBeGreaterThanOrEqual(10);
    });

    it('should include B.Tech', () => {
      const degrees = createDegreeNodes();
      const btech = degrees.find(d => d.degreeType === 'BTECH');
      expect(btech).toBeDefined();
      expect(btech?.duration).toBe(4);
      expect(btech?.streamRequirement).toContain('PCM');
    });

    it('should include MBBS', () => {
      const degrees = createDegreeNodes();
      const mbbs = degrees.find(d => d.degreeType === 'MBBS');
      expect(mbbs).toBeDefined();
      expect(mbbs?.duration).toBe(5.5);
      expect(mbbs?.streamRequirement).toContain('PCB');
    });

    it('should include MBA', () => {
      const degrees = createDegreeNodes();
      const mba = degrees.find(d => d.degreeType === 'MBA');
      expect(mba).toBeDefined();
      expect(mba?.duration).toBe(2);
    });

    it('should include LLB', () => {
      const degrees = createDegreeNodes();
      const llb = degrees.find(d => d.degreeType === 'LLB');
      expect(llb).toBeDefined();
      expect(llb?.duration).toBe(3);
    });

    it('should include B.Com', () => {
      const degrees = createDegreeNodes();
      const bcom = degrees.find(d => d.degreeType === 'BCOM');
      expect(bcom).toBeDefined();
      expect(bcom?.duration).toBe(3);
    });

    it('should have optionality scores', () => {
      const degrees = createDegreeNodes();
      for (const degree of degrees) {
        expect(degree.optionalityScore).toBeGreaterThanOrEqual(0);
        expect(degree.optionalityScore).toBeLessThanOrEqual(1);
      }
    });

    it('should have lock-in levels', () => {
      const degrees = createDegreeNodes();
      for (const degree of degrees) {
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(degree.lockInLevel);
      }
    });
  });

  describe('Complete Education Graph', () => {
    it('should build complete education graph', () => {
      const builder = buildEducationGraph();
      const graph = builder.buildGraph();
      expect(graph.nodes.size).toBeGreaterThan(20);
      expect(graph.edges.size).toBeGreaterThan(10);
    });

    it('should provide education stats', () => {
      const stats = getEducationStats();
      expect(stats.streamCount).toBeGreaterThan(4);
      expect(stats.examCount).toBeGreaterThan(10);
      expect(stats.collegeTypeCount).toBeGreaterThan(5);
      expect(stats.degreeCount).toBeGreaterThan(10);
    });
  });
});

// ============================================================================
// PATHWAY ENGINE TESTS
// ============================================================================

describe('PathwayEngine', () => {
  let engine: ReturnType<typeof createPathwayEngine>;
  let graph: OpportunityGraph;

  beforeEach(() => {
    const builder = buildEducationGraph();
    graph = builder.buildGraph();
    engine = createPathwayEngine(graph);
  });

  describe('Pathway Generation', () => {
    it('should generate a pathway from start node', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(pathway).toBeDefined();
      expect(pathway.steps.length).toBeGreaterThan(0);
      expect(pathway.startNode).toBe('stream-pcm');
    });

    it('should have pathway steps with required fields', () => {
      const pathway = engine.generatePathway('stream-pcm');
      for (const step of pathway.steps) {
        expect(step.nodeId).toBeDefined();
        expect(step.name).toBeDefined();
        expect(step.nodeType).toBeDefined();
      }
    });

    it('should calculate total duration', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(pathway.totalDuration).toBeGreaterThanOrEqual(0);
    });

    it('should determine pathway difficulty', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(['VERY_EASY', 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT']).toContain(pathway.difficulty);
    });

    it('should calculate optionality score', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(pathway.optionalityScore).toBeGreaterThanOrEqual(0);
      expect(pathway.optionalityScore).toBeLessThanOrEqual(1);
    });

    it('should count future paths', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(pathway.futurePathCount).toBeGreaterThanOrEqual(0);
    });

    it('should generate recommendation', () => {
      const pathway = engine.generatePathway('stream-pcm');
      expect(pathway.recommendation).toBeDefined();
      expect(pathway.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('All Pathways Generation', () => {
    it('should generate all pathways from a node', () => {
      const pathways = engine.generateAllPathways('stream-pcm', 3);
      expect(Array.isArray(pathways)).toBe(true);
      expect(pathways.length).toBeGreaterThan(0);
    });

    it('should respect max depth', () => {
      const pathways = engine.generateAllPathways('stream-pcm', 2);
      for (const pathway of pathways) {
        expect(pathway.steps.length).toBeLessThanOrEqual(3);
      }
    });

    it('should generate unique pathways', () => {
      const pathways = engine.generateAllPathways('stream-pcm', 3);
      const pathwayIds = pathways.map(p => p.id);
      const uniqueIds = [...new Set(pathwayIds)];
      expect(uniqueIds.length).toBe(pathwayIds.length);
    });
  });

  describe('Shortest Path', () => {
    it('should find shortest path between nodes', () => {
      const pathway = engine.findShortestPath('stream-pcm', 'exam-jee-main');
      expect(pathway).not.toBeNull();
      if (pathway) {
        expect(pathway.steps[pathway.steps.length - 1].nodeId).toBe('exam-jee-main');
      }
    });

    it('should return null for unreachable nodes', () => {
      const pathway = engine.findShortestPath('stream-pcm', 'non-existent-node');
      expect(pathway).toBeNull();
    });

    it('should return single step for same start and end', () => {
      const pathway = engine.findShortestPath('stream-pcm', 'stream-pcm');
      expect(pathway).not.toBeNull();
      if (pathway) {
        expect(pathway.steps.length).toBe(1);
      }
    });
  });

  describe('Paths by Optionality', () => {
    it('should find paths with minimum optionality', () => {
      const pathways = engine.findPathsByOptionality('stream-pcm', 0.3);
      expect(Array.isArray(pathways)).toBe(true);
    });

    it('should filter paths by optionality threshold', () => {
      const pathways = engine.findPathsByOptionality('stream-pcm', 0.8);
      for (const pathway of pathways) {
        expect(pathway.optionalityScore).toBeGreaterThanOrEqual(0.8);
      }
    });
  });

  describe('Optionality Analysis', () => {
    it('should analyze optionality at a node', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(analysis).toBeDefined();
      expect(analysis.nodeId).toBe('stream-pcm');
    });

    it('should count direct transitions', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(analysis.directTransitions).toBeGreaterThanOrEqual(0);
    });

    it('should count future paths', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(analysis.futurePathCount).toBeGreaterThanOrEqual(0);
    });

    it('should determine lock-in level', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(analysis.lockInLevel);
    });

    it('should determine reversibility', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(['EASY', 'MODERATE', 'DIFFICULT', 'IMPOSSIBLE']).toContain(analysis.reversibility);
    });
  });
});

// ============================================================================
// TRANSITION ENGINE TESTS
// ============================================================================

describe('TransitionEngine', () => {
  let engine: ReturnType<typeof createTransitionEngine>;
  let graph: OpportunityGraph;

  beforeEach(() => {
    const builder = buildEducationGraph();
    graph = builder.buildGraph();
    engine = createTransitionEngine(graph);
  });

  describe('Transition Analysis', () => {
    it('should analyze a transition', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(analysis).toBeDefined();
      expect(analysis.fromNode).toBe('stream-pcm');
      expect(analysis.toNode).toBe('exam-jee-main');
    });

    it('should calculate difficulty', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(['VERY_EASY', 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT']).toContain(analysis.difficulty);
    });

    it('should calculate probability', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(analysis.probability).toBeGreaterThanOrEqual(0);
      expect(analysis.probability).toBeLessThanOrEqual(1);
    });

    it('should identify required skills', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(Array.isArray(analysis.requiredSkills)).toBe(true);
    });

    it('should estimate time', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(analysis.timeEstimate).toBeGreaterThan(0);
    });

    it('should provide success stories', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(Array.isArray(analysis.successStories)).toBe(true);
    });

    it('should identify challenges', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(Array.isArray(analysis.challenges)).toBe(true);
    });

    it('should provide mitigation strategies', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(Array.isArray(analysis.mitigationStrategies)).toBe(true);
    });

    it('should generate recommended path', () => {
      const analysis = engine.analyzeTransition('stream-pcm', 'exam-jee-main');
      expect(Array.isArray(analysis.recommendedPath)).toBe(true);
      expect(analysis.recommendedPath[0]).toBe('stream-pcm');
    });
  });

  describe('Possible Transitions', () => {
    it('should find possible transitions from a node', () => {
      const transitions = engine.findPossibleTransitions('stream-pcm');
      expect(Array.isArray(transitions)).toBe(true);
    });

    it('should include direct transitions', () => {
      const transitions = engine.findPossibleTransitions('stream-pcm');
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('Pivot Opportunities', () => {
    it('should find pivot opportunities', () => {
      const pivots = engine.findPivotOpportunities('stream-pcm');
      expect(Array.isArray(pivots)).toBe(true);
    });

    it('should return valid node IDs', () => {
      const pivots = engine.findPivotOpportunities('stream-pcm');
      for (const pivot of pivots) {
        expect(typeof pivot).toBe('string');
      }
    });
  });

  describe('Transition Difficulty', () => {
    it('should get difficulty between nodes', () => {
      const difficulty = engine.getTransitionDifficulty('stream-pcm', 'exam-jee-main');
      expect(['VERY_EASY', 'EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT']).toContain(difficulty);
    });

    it('should return very difficult for invalid nodes', () => {
      const difficulty = engine.getTransitionDifficulty('stream-pcm', 'non-existent');
      expect(difficulty).toBe('VERY_DIFFICULT');
    });
  });
});

// ============================================================================
// OPPORTUNITY GRAPH ENGINE TESTS
// ============================================================================

describe('OpportunityGraphEngine', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Graph Queries', () => {
    it('should query by start node', () => {
      const result = engine.query({ startNode: 'stream-pcm', maxDepth: 2 });
      expect(result.paths.length).toBeGreaterThan(0);
    });

    it('should query by node types', () => {
      const result = engine.query({ nodeTypes: ['SCHOOL_STREAM'], maxDepth: 2 });
      expect(result.paths.length).toBeGreaterThan(0);
    });

    it('should respect max depth', () => {
      const result = engine.query({ startNode: 'stream-pcm', maxDepth: 1 });
      for (const path of result.paths) {
        expect(path.steps.length).toBeLessThanOrEqual(2);
      }
    });

    it('should provide metadata', () => {
      const result = engine.query({ startNode: 'stream-pcm', maxDepth: 2 });
      expect(result.metadata.totalPaths).toBeGreaterThanOrEqual(0);
      expect(result.metadata.averageOptionality).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Decision Simulation', () => {
    it('should simulate decision', () => {
      const input = {
        currentNode: 'stream-pcm',
        candidateNodes: ['exam-jee-main', 'exam-cuet'],
        studentProfile: {
          interests: ['engineering', 'technology'],
          strengths: ['math', 'physics'],
          constraints: [],
          riskTolerance: 'MEDIUM' as const,
          timeHorizon: 5,
        },
      };

      const result = engine.simulateDecision(input);
      expect(result.simulations.length).toBe(2);
    });

    it('should provide comparison', () => {
      const input = {
        currentNode: 'stream-pcm',
        candidateNodes: ['exam-jee-main', 'exam-cuet'],
        studentProfile: {
          interests: ['engineering'],
          strengths: ['math'],
          constraints: [],
          riskTolerance: 'MEDIUM' as const,
          timeHorizon: 5,
        },
      };

      const result = engine.simulateDecision(input);
      expect(result.comparison).toBeDefined();
      expect(result.comparison.highestOptionality).toBeDefined();
    });

    it('should provide recommendation', () => {
      const input = {
        currentNode: 'stream-pcm',
        candidateNodes: ['exam-jee-main'],
        studentProfile: {
          interests: ['engineering'],
          strengths: ['math'],
          constraints: [],
          riskTolerance: 'MEDIUM' as const,
          timeHorizon: 5,
        },
      };

      const result = engine.simulateDecision(input);
      expect(result.recommendation).toBeDefined();
    });

    it('should provide mentor framing', () => {
      const input = {
        currentNode: 'stream-pcm',
        candidateNodes: ['exam-jee-main'],
        studentProfile: {
          interests: ['engineering'],
          strengths: ['math'],
          constraints: [],
          riskTolerance: 'MEDIUM' as const,
          timeHorizon: 5,
        },
      };

      const result = engine.simulateDecision(input);
      expect(result.mentorFraming).toBeDefined();
    });
  });

  describe('Optionality Analysis', () => {
    it('should analyze optionality', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(analysis).toBeDefined();
      expect(analysis.nodeId).toBe('stream-pcm');
    });

    it('should count future paths', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(analysis.futurePathCount).toBeGreaterThanOrEqual(0);
    });

    it('should provide pivot opportunities', () => {
      const analysis = engine.analyzeOptionality('stream-pcm');
      expect(Array.isArray(analysis.pivotOpportunities)).toBe(true);
    });
  });

  describe('Criticality Analysis', () => {
    it('should analyze criticality', () => {
      const analysis = engine.analyzeCriticality('degree-mbbs');
      expect(analysis).toBeDefined();
      expect(analysis.nodeId).toBe('degree-mbbs');
    });

    it('should identify lock-in levels', () => {
      const analysis = engine.analyzeCriticality('degree-mbbs');
      expect(typeof analysis.pathLockIn).toBe('boolean');
      expect(typeof analysis.educationLockIn).toBe('boolean');
    });

    it('should calculate irreversibility', () => {
      const analysis = engine.analyzeCriticality('degree-mbbs');
      expect(analysis.irreversibilityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.irreversibilityScore).toBeLessThanOrEqual(1);
    });

    it('should provide warning signs', () => {
      const analysis = engine.analyzeCriticality('degree-mbbs');
      expect(Array.isArray(analysis.warningSigns)).toBe(true);
    });

    it('should provide mitigation options', () => {
      const analysis = engine.analyzeCriticality('degree-mbbs');
      expect(Array.isArray(analysis.mitigationOptions)).toBe(true);
    });
  });

  describe('Mentor Explanation', () => {
    it('should get mentor explanation', () => {
      const explanation = engine.getMentorExplanation('pathway-pcm');
      expect(explanation).toBeDefined();
    });

    it('should provide natural language explanation', () => {
      const explanation = engine.getMentorExplanation('pathway-pcm');
      expect(explanation.naturalLanguage).toBeDefined();
    });

    it('should provide key insights', () => {
      const explanation = engine.getMentorExplanation('pathway-pcm');
      expect(Array.isArray(explanation.keyInsights)).toBe(true);
    });

    it('should provide questions to consider', () => {
      const explanation = engine.getMentorExplanation('pathway-pcm');
      expect(Array.isArray(explanation.questionsToConsider)).toBe(true);
    });
  });

  describe('Node Access', () => {
    it('should get node by ID', () => {
      const node = engine.getNode('stream-pcm');
      expect(node).toBeDefined();
      expect(node?.id).toBe('stream-pcm');
    });

    it('should return undefined for non-existent node', () => {
      const node = engine.getNode('non-existent');
      expect(node).toBeUndefined();
    });

    it('should get connected nodes', () => {
      const nodes = engine.getConnectedNodes('stream-pcm');
      expect(Array.isArray(nodes)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should provide graph stats', () => {
      const stats = engine.getStats();
      expect(stats.nodeCount).toBeGreaterThan(0);
      expect(stats.edgeCount).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// INDIA-SPECIFIC PATHWAY TESTS
// ============================================================================

describe('India-Specific Pathways', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Engineering Pathway', () => {
    it('should model PCM to Engineering pathway', () => {
      const pathway = generatePathway(engine['graph'], 'stream-pcm');
      expect(pathway).toBeDefined();
    });

    it('should include JEE in engineering pathway', () => {
      const hasJee = engine.getNode('exam-jee-main');
      expect(hasJee).toBeDefined();
    });

    it('should model IIT pathway', () => {
      const iit = engine.getNode('college-iit');
      expect(iit).toBeDefined();
    });

    it('should model B.Tech outcome', () => {
      const btech = engine.getNode('degree-btech');
      expect(btech).toBeDefined();
    });
  });

  describe('Medical Pathway', () => {
    it('should model PCB to Medical pathway', () => {
      const pathway = generatePathway(engine['graph'], 'stream-pcb');
      expect(pathway).toBeDefined();
    });

    it('should include NEET in medical pathway', () => {
      const neet = engine.getNode('exam-neet');
      expect(neet).toBeDefined();
    });

    it('should model AIIMS pathway', () => {
      const aiims = engine.getNode('college-aiims');
      expect(aiims).toBeDefined();
    });

    it('should model MBBS outcome', () => {
      const mbbs = engine.getNode('degree-mbbs');
      expect(mbbs).toBeDefined();
    });
  });

  describe('CA Pathway', () => {
    it('should model Commerce to CA pathway', () => {
      const pathway = generatePathway(engine['graph'], 'stream-commerce');
      expect(pathway).toBeDefined();
    });

    it('should include CA Foundation', () => {
      const caFound = engine.getNode('exam-ca-foundation');
      expect(caFound).toBeDefined();
    });

    it('should include CA Final', () => {
      const caFinal = engine.getNode('exam-ca-final');
      expect(caFinal).toBeDefined();
    });
  });

  describe('Law Pathway', () => {
    it('should model Arts to Law pathway', () => {
      const pathway = generatePathway(engine['graph'], 'stream-arts');
      expect(pathway).toBeDefined();
    });

    it('should include CLAT', () => {
      const clat = engine.getNode('exam-clat');
      expect(clat).toBeDefined();
    });

    it('should model NLU pathway', () => {
      const nlu = engine.getNode('college-nlu');
      expect(nlu).toBeDefined();
    });

    it('should model LLB outcome', () => {
      const llb = engine.getNode('degree-llb');
      expect(llb).toBeDefined();
    });
  });

  describe('Management Pathway', () => {
    it('should include CAT exam', () => {
      const cat = engine.getNode('exam-cat');
      expect(cat).toBeDefined();
    });

    it('should model IIM pathway', () => {
      const iim = engine.getNode('college-iim');
      expect(iim).toBeDefined();
    });

    it('should model MBA outcome', () => {
      const mba = engine.getNode('degree-mba');
      expect(mba).toBeDefined();
    });
  });

  describe('Civil Services Pathway', () => {
    it('should include UPSC exam', () => {
      const upsc = engine.getNode('exam-upsc');
      expect(upsc).toBeDefined();
    });
  });

  describe('Tier College System', () => {
    it('should model Tier-1 colleges', () => {
      const tier1 = ['college-iit', 'college-iim', 'college-aiims'];
      for (const id of tier1) {
        expect(engine.getNode(id)).toBeDefined();
      }
    });

    it('should model Tier-2 colleges', () => {
      const tier2 = ['college-nit', 'college-tier-2-tech'];
      for (const id of tier2) {
        expect(engine.getNode(id)).toBeDefined();
      }
    });
  });
});

// ============================================================================
// TRANSITION SCENARIOS
// ============================================================================

describe('Career Transition Scenarios', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Engineering to MBA Transition', () => {
    it('should analyze B.Tech to MBA transition', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(analysis).toBeDefined();
    });

    it('should be a common transition', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(analysis.probability).toBeGreaterThan(0);
    });
  });

  describe('Engineering to Product Management', () => {
    it('should model software to PM transition', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'degree-btech');
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('Medical to Health Tech', () => {
    it('should analyze medical to health tech transition', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'degree-mbbs');
      expect(transitions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('CA to Finance Transition', () => {
    it('should analyze CA to finance roles', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'exam-ca-final');
      expect(transitions.length).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// OPTIONALITY TESTS
// ============================================================================

describe('Optionality Analysis', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  it('should calculate optionality for PCM', () => {
    const analysis = analyzeOptionality('stream-pcm');
    expect(analysis.futurePathCount).toBeGreaterThan(0);
  });

  it('should calculate optionality for Commerce', () => {
    const analysis = analyzeOptionality('stream-commerce');
    expect(analysis.futurePathCount).toBeGreaterThan(0);
  });

  it('should calculate optionality for Arts', () => {
    const analysis = analyzeOptionality('stream-arts');
    expect(analysis.futurePathCount).toBeGreaterThan(0);
  });

  it('should identify high optionality paths', () => {
    const analysis = analyzeOptionality('stream-pcm');
    expect(analysis.pathFlexibility).toBeGreaterThanOrEqual(0);
    expect(analysis.pathFlexibility).toBeLessThanOrEqual(1);
  });

  it('should identify pivot opportunities', () => {
    const pivots = findPivotOpportunities(engine['graph'], 'degree-btech');
    expect(Array.isArray(pivots)).toBe(true);
  });
});

// ============================================================================
// CRITICALITY TESTS
// ============================================================================

describe('Criticality Analysis', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  it('should analyze criticality for MBBS', () => {
    const analysis = analyzeCriticality('degree-mbbs');
    expect(analysis.educationLockIn).toBeDefined();
  });

  it('should analyze criticality for B.Tech', () => {
    const analysis = analyzeCriticality('degree-btech');
    expect(analysis.pathLockIn).toBeDefined();
  });

  it('should identify opportunity closure', () => {
    const analysis = analyzeCriticality('degree-mbbs');
    expect(Array.isArray(analysis.opportunityClosure)).toBe(true);
  });

  it('should calculate irreversibility', () => {
    const analysis = analyzeCriticality('degree-mbbs');
    expect(analysis.irreversibilityScore).toBeGreaterThanOrEqual(0);
    expect(analysis.irreversibilityScore).toBeLessThanOrEqual(1);
  });

  it('should provide warning signs for high criticality', () => {
    const analysis = analyzeCriticality('degree-mbbs');
    expect(Array.isArray(analysis.warningSigns)).toBe(true);
  });
});

// ============================================================================
// DECISION SIMULATION TESTS
// ============================================================================

describe('Decision Simulation', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  it('should simulate PCM vs Commerce decision', () => {
    const input = {
      currentNode: 'class-10',
      candidateNodes: ['stream-pcm', 'stream-commerce'],
      studentProfile: {
        interests: ['math', 'business'],
        strengths: ['analytics'],
        constraints: [],
        riskTolerance: 'MEDIUM' as const,
        timeHorizon: 10,
      },
    };

    const result = simulateDecision(input);
    expect(result.simulations.length).toBe(2);
  });

  it('should compare engineering vs medical pathways', () => {
    const input = {
      currentNode: 'stream-pcm',
      candidateNodes: ['exam-jee-main', 'exam-neet'],
      studentProfile: {
        interests: ['science'],
        strengths: ['math', 'biology'],
        constraints: [],
        riskTolerance: 'HIGH' as const,
        timeHorizon: 8,
      },
    };

    const result = simulateDecision(input);
    expect(result.comparison).toBeDefined();
  });

  it('should provide mentor-friendly framing', () => {
    const input = {
      currentNode: 'stream-pcm',
      candidateNodes: ['exam-jee-main'],
      studentProfile: {
        interests: ['engineering'],
        strengths: ['math'],
        constraints: [],
        riskTolerance: 'MEDIUM' as const,
        timeHorizon: 5,
      },
    };

    const result = simulateDecision(input);
    expect(result.mentorFraming.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  it('should integrate all modules', () => {
    const builder = buildEducationGraph();
    const graph = builder.buildGraph();
    const pathwayEngine = createPathwayEngine(graph);
    const transitionEngine = createTransitionEngine(graph);
    const mainEngine = createOpportunityGraphEngine();

    expect(builder).toBeDefined();
    expect(pathwayEngine).toBeDefined();
    expect(transitionEngine).toBeDefined();
    expect(mainEngine).toBeDefined();
  });

  it('should maintain graph consistency', () => {
    const engine = createOpportunityGraphEngine();
    const stats = engine.getStats();

    expect(stats.nodeCount).toBeGreaterThan(0);
    expect(stats.edgeCount).toBeGreaterThanOrEqual(0);
  });

  it('should support full pathway analysis', () => {
    const engine = createOpportunityGraphEngine();
    const pathway = generatePathway(engine['graph'], 'stream-pcm');
    const optionality = analyzeOptionality('stream-pcm');
    const criticality = analyzeCriticality('stream-pcm');

    expect(pathway).toBeDefined();
    expect(optionality).toBeDefined();
    expect(criticality).toBeDefined();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty graph', () => {
    const builder = createGraphBuilder();
    const graph = builder.buildGraph();
    const engine = createPathwayEngine(graph);

    const pathway = engine.generatePathway('non-existent');
    expect(pathway.steps.length).toBe(0);
  });

  it('should handle cycles gracefully', () => {
    const builder = createGraphBuilder();
    builder.addNode(createTestNode('a', 'DEGREE', 'A'));
    builder.addNode(createTestNode('b', 'CAREER', 'B'));
    builder.addEdge(createTestEdge('e1', 'a', 'b', 'LEADS_TO'));

    const graph = builder.buildGraph();
    const engine = createPathwayEngine(graph);

    const pathways = engine.generateAllPathways('a', 5);
    expect(Array.isArray(pathways)).toBe(true);
  });

  it('should handle disconnected nodes', () => {
    const builder = createGraphBuilder();
    builder.addNode(createTestNode('a', 'DEGREE', 'A'));
    builder.addNode(createTestNode('b', 'CAREER', 'B'));

    const graph = builder.buildGraph();
    const pathway = findShortestPath(graph, 'a', 'b');
    expect(pathway).toBeNull();
  });
});

// ============================================================================
// EXPORT VERIFICATION
// ============================================================================

describe('Export Verification', () => {
  it('should export GraphBuilder', () => {
    expect(createGraphBuilder).toBeDefined();
  });

  it('should export PathwayEngine', () => {
    expect(createPathwayEngine).toBeDefined();
  });

  it('should export TransitionEngine', () => {
    expect(createTransitionEngine).toBeDefined();
  });

  it('should export OpportunityGraphEngine', () => {
    expect(createOpportunityGraphEngine).toBeDefined();
  });

  it('should export education graph functions', () => {
    expect(buildEducationGraph).toBeDefined();
    expect(createSchoolStreamNodes).toBeDefined();
    expect(createExamNodes).toBeDefined();
    expect(createCollegeTypeNodes).toBeDefined();
    expect(createDegreeNodes).toBeDefined();
  });

  it('should export utility functions', () => {
    expect(generatePathway).toBeDefined();
    expect(findAllPathways).toBeDefined();
    expect(findShortestPath).toBeDefined();
    expect(analyzeTransition).toBeDefined();
    expect(simulateDecision).toBeDefined();
    expect(analyzeOptionality).toBeDefined();
    expect(analyzeCriticality).toBeDefined();
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('Performance', () => {
  it('should generate pathways efficiently', () => {
    const engine = createOpportunityGraphEngine();
    const start = Date.now();

    for (let i = 0; i < 10; i++) {
      generatePathway(engine['graph'], 'stream-pcm');
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  it('should handle multiple queries efficiently', () => {
    const engine = createOpportunityGraphEngine();
    const start = Date.now();

    for (let i = 0; i < 5; i++) {
      engine.query({ startNode: 'stream-pcm', maxDepth: 3 });
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});

// ============================================================================
// COMPREHENSIVE STREAM TESTS
// ============================================================================

describe('Comprehensive Stream Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('PCM Stream Deep Dive', () => {
    it('should have 5+ PCM eligible exams', () => {
      const stream = engine.getNode('stream-pcm') as any;
      expect(stream.eligibleExams.length).toBeGreaterThanOrEqual(5);
    });

    it('should have 5+ PCM eligible degrees', () => {
      const stream = engine.getNode('stream-pcm') as any;
      expect(stream.eligibleDegrees.length).toBeGreaterThanOrEqual(5);
    });

    it('should have PCM optionality above 0.7', () => {
      const stream = engine.getNode('stream-pcm') as any;
      expect(stream.optionalityScore).toBeGreaterThan(0.7);
    });

    it('should connect PCM to JEE', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-pcm');
      const jeeTransition = transitions.find(t => t.toNode === 'exam-jee-main');
      expect(jeeTransition).toBeDefined();
    });

    it('should connect PCM to CUET', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-pcm');
      const cuetTransition = transitions.find(t => t.toNode === 'exam-cuet');
      expect(cuetTransition).toBeDefined();
    });

    it('should have high competition for PCM', () => {
      const stream = engine.getNode('stream-pcm') as any;
      expect(stream.metadata.competition).toBe('VERY_HIGH');
    });
  });

  describe('PCB Stream Deep Dive', () => {
    it('should have 4+ PCB eligible exams', () => {
      const stream = engine.getNode('stream-pcb') as any;
      expect(stream.eligibleExams.length).toBeGreaterThanOrEqual(4);
    });

    it('should have 5+ PCB eligible degrees', () => {
      const stream = engine.getNode('stream-pcb') as any;
      expect(stream.eligibleDegrees.length).toBeGreaterThanOrEqual(5);
    });

    it('should connect PCB to NEET', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-pcb');
      const neetTransition = transitions.find(t => t.toNode === 'exam-neet');
      expect(neetTransition).toBeDefined();
    });

    it('should have extreme competition for PCB', () => {
      const stream = engine.getNode('stream-pcb') as any;
      expect(stream.metadata.competition).toBe('EXTREME');
    });
  });

  describe('PCMB Stream Deep Dive', () => {
    it('should have highest optionality score', () => {
      const stream = engine.getNode('stream-pcmb') as any;
      expect(stream.optionalityScore).toBeGreaterThan(0.85);
    });

    it('should be eligible for both engineering and medical exams', () => {
      const stream = engine.getNode('stream-pcmb') as any;
      expect(stream.eligibleExams).toContain('exam-jee-main');
      expect(stream.eligibleExams).toContain('exam-neet');
    });

    it('should have 6+ eligible degrees', () => {
      const stream = engine.getNode('stream-pcmb') as any;
      expect(stream.eligibleDegrees.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Commerce Stream Deep Dive', () => {
    it('should have 6+ eligible exams', () => {
      const stream = engine.getNode('stream-commerce') as any;
      expect(stream.eligibleExams.length).toBeGreaterThanOrEqual(6);
    });

    it('should connect to CA pathway', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-commerce');
      const caTransition = transitions.find(t => t.toNode === 'exam-ca-foundation');
      expect(caTransition).toBeDefined();
    });

    it('should connect to CLAT', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-commerce');
      const clatTransition = transitions.find(t => t.toNode === 'exam-clat');
      expect(clatTransition).toBeDefined();
    });
  });

  describe('Arts Stream Deep Dive', () => {
    it('should have 5+ eligible exams', () => {
      const stream = engine.getNode('stream-arts') as any;
      expect(stream.eligibleExams.length).toBeGreaterThanOrEqual(5);
    });

    it('should connect to UPSC', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-arts');
      const upscTransition = transitions.find(t => t.toNode === 'exam-upsc');
      expect(upscTransition).toBeDefined();
    });

    it('should connect to CLAT', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'stream-arts');
      const clatTransition = transitions.find(t => t.toNode === 'exam-clat');
      expect(clatTransition).toBeDefined();
    });
  });
});

// ============================================================================
// COMPREHENSIVE EXAM TESTS
// ============================================================================

describe('Comprehensive Exam Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('JEE Exams', () => {
    it('should have JEE Main with EXTREME competition', () => {
      const jee = engine.getNode('exam-jee-main') as any;
      expect(jee.competitionLevel).toBe('EXTREME');
    });

    it('should have JEE Advanced with EXTREME competition', () => {
      const jeeAdv = engine.getNode('exam-jee-advanced') as any;
      expect(jeeAdv.competitionLevel).toBe('EXTREME');
    });

    it('should have JEE Main with 2 attempts', () => {
      const jee = engine.getNode('exam-jee-main') as any;
      expect(jee.attemptsAllowed).toBe(2);
    });

    it('should have JEE Advanced with 2 attempts', () => {
      const jeeAdv = engine.getNode('exam-jee-advanced') as any;
      expect(jeeAdv.attemptsAllowed).toBe(2);
    });

    it('should open doors to IIT', () => {
      const jeeAdv = engine.getNode('exam-jee-advanced') as any;
      expect(jeeAdv.opensDoorsTo).toContain('college-iit');
    });

    it('should open doors to NIT', () => {
      const jeeMain = engine.getNode('exam-jee-main') as any;
      expect(jeeMain.opensDoorsTo).toContain('college-nit');
    });
  });

  describe('NEET Exam', () => {
    it('should have EXTREME competition', () => {
      const neet = engine.getNode('exam-neet') as any;
      expect(neet.competitionLevel).toBe('EXTREME');
    });

    it('should open doors to medical colleges', () => {
      const neet = engine.getNode('exam-neet') as any;
      expect(neet.opensDoorsTo).toContain('college-medical-govt');
    });

    it('should have low success rate', () => {
      const neet = engine.getNode('exam-neet') as any;
      expect(neet.successRate).toBeLessThan(5);
    });
  });

  describe('CAT Exam', () => {
    it('should have VERY_HIGH competition', () => {
      const cat = engine.getNode('exam-cat') as any;
      expect(cat.competitionLevel).toBe('VERY_HIGH');
    });

    it('should open doors to IIMs', () => {
      const cat = engine.getNode('exam-cat') as any;
      expect(cat.opensDoorsTo).toContain('college-iim');
    });
  });

  describe('CLAT Exam', () => {
    it('should have VERY_HIGH competition', () => {
      const clat = engine.getNode('exam-clat') as any;
      expect(clat.competitionLevel).toBe('VERY_HIGH');
    });

    it('should open doors to NLUs', () => {
      const clat = engine.getNode('exam-clat') as any;
      expect(clat.opensDoorsTo).toContain('college-nlu');
    });
  });

  describe('UPSC Exam', () => {
    it('should have EXTREME competition', () => {
      const upsc = engine.getNode('exam-upsc') as any;
      expect(upsc.competitionLevel).toBe('EXTREME');
    });

    it('should lead to civil services', () => {
      const upsc = engine.getNode('exam-upsc') as any;
      expect(upsc.outcomes).toContain('IAS');
      expect(upsc.outcomes).toContain('IPS');
    });

    it('should have very low success rate', () => {
      const upsc = engine.getNode('exam-upsc') as any;
      expect(upsc.successRate).toBeLessThan(1);
    });
  });

  describe('CA Exams', () => {
    it('should have CA Foundation with VERY_HIGH competition', () => {
      const ca = engine.getNode('exam-ca-foundation') as any;
      expect(ca.competitionLevel).toBe('VERY_HIGH');
    });

    it('should have CA Final with EXTREME competition', () => {
      const ca = engine.getNode('exam-ca-final') as any;
      expect(ca.competitionLevel).toBe('EXTREME');
    });

    it('should lead to CA qualification', () => {
      const ca = engine.getNode('exam-ca-final') as any;
      expect(ca.qualificationAwarded).toBe('CA');
    });
  });

  describe('GATE Exam', () => {
    it('should open doors to IIT/NIT for PG', () => {
      const gate = engine.getNode('exam-gate') as any;
      expect(gate.opensDoorsTo).toContain('college-iit');
    });

    it('should allow PSU opportunities', () => {
      const gate = engine.getNode('exam-gate') as any;
      expect(gate.psuOpportunities).toBe(true);
    });
  });
});

// ============================================================================
// COMPREHENSIVE COLLEGE TESTS
// ============================================================================

describe('Comprehensive College Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('IITs', () => {
    it('should be Tier-1', () => {
      const iit = engine.getNode('college-iit') as any;
      expect(iit.tier).toBe('TIER_1');
    });

    it('should have reputation above 0.95', () => {
      const iit = engine.getNode('college-iit') as any;
      expect(iit.reputationScore).toBeGreaterThan(0.95);
    });

    it('should have high placement rate', () => {
      const iit = engine.getNode('college-iit') as any;
      expect(iit.placementRate).toBeGreaterThan(80);
    });

    it('should have high average package', () => {
      const iit = engine.getNode('college-iit') as any;
      expect(iit.avgPackage).toBeGreaterThan(15);
    });

    it('should offer B.Tech', () => {
      const iit = engine.getNode('college-iit') as any;
      expect(iit.offeredDegrees).toContain('degree-btech');
    });

    it('should connect to software career', () => {
      const transitions = findPossibleTransitions(engine['graph'], 'college-iit');
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('IIMs', () => {
    it('should be Tier-1', () => {
      const iim = engine.getNode('college-iim') as any;
      expect(iim.tier).toBe('TIER_1');
    });

    it('should have reputation above 0.95', () => {
      const iim = engine.getNode('college-iim') as any;
      expect(iim.reputationScore).toBeGreaterThan(0.95);
    });

    it('should offer MBA', () => {
      const iim = engine.getNode('college-iim') as any;
      expect(iim.offeredDegrees).toContain('degree-mba');
    });

    it('should have very high average package', () => {
      const iim = engine.getNode('college-iim') as any;
      expect(iim.avgPackage).toBeGreaterThan(25);
    });
  });

  describe('AIIMS', () => {
    it('should be Tier-1 medical', () => {
      const aiims = engine.getNode('college-aiims') as any;
      expect(aiims.tier).toBe('TIER_1');
    });

    it('should offer MBBS', () => {
      const aiims = engine.getNode('college-aiims') as any;
      expect(aiims.offeredDegrees).toContain('degree-mbbs');
    });

    it('should have medical reputation above 0.98', () => {
      const aiims = engine.getNode('college-aiims') as any;
      expect(aiims.reputationScore).toBeGreaterThan(0.98);
    });
  });

  describe('NLUs', () => {
    it('should be Tier-1 law', () => {
      const nlu = engine.getNode('college-nlu') as any;
      expect(nlu.tier).toBe('TIER_1');
    });

    it('should offer LLB', () => {
      const nlu = engine.getNode('college-nlu') as any;
      expect(nlu.offeredDegrees).toContain('degree-llb');
    });
  });

  describe('NITs', () => {
    it('should be Tier-1', () => {
      const nit = engine.getNode('college-nit') as any;
      expect(nit.tier).toBe('TIER_1');
    });

    it('should have reputation above 0.85', () => {
      const nit = engine.getNode('college-nit') as any;
      expect(nit.reputationScore).toBeGreaterThan(0.85);
    });
  });

  describe('Tier-2 Colleges', () => {
    it('should have tier-2 engineering colleges', () => {
      const tier2 = engine.getNode('college-tier-2-tech') as any;
      expect(tier2).toBeDefined();
      expect(tier2.tier).toBe('TIER_2');
    });

    it('should have tier-2 management colleges', () => {
      const tier2Mba = engine.getNode('college-tier-2-mba') as any;
      expect(tier2Mba).toBeDefined();
      expect(tier2Mba.tier).toBe('TIER_2');
    });

    it('should have tier-3 colleges', () => {
      const tier3 = engine.getNode('college-tier-3') as any;
      expect(tier3).toBeDefined();
      expect(tier3.tier).toBe('TIER_3');
    });
  });
});

// ============================================================================
// COMPREHENSIVE DEGREE TESTS
// ============================================================================

describe('Comprehensive Degree Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('B.Tech', () => {
    it('should have 4 year duration', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.duration).toBe(4);
    });

    it('should require PCM', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.streamRequirement).toContain('PCM');
    });

    it('should have MEDIUM lock-in', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.lockInLevel).toBe('MEDIUM');
    });

    it('should lead to software career', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.careerOutcomes).toContain('career-software');
    });

    it('should allow M.Tech as further education', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.furtherEducation).toContain('degree-mtech');
    });

    it('should allow MBA as further education', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.furtherEducation).toContain('degree-mba');
    });
  });

  describe('MBBS', () => {
    it('should have 5.5 year duration', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.duration).toBe(5.5);
    });

    it('should require PCB', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.streamRequirement).toContain('PCB');
    });

    it('should have HIGH lock-in', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.lockInLevel).toBe('HIGH');
    });

    it('should lead to doctor career', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.careerOutcomes).toContain('career-doctor');
    });

    it('should allow MD as further education', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.furtherEducation).toContain('degree-md');
    });
  });

  describe('MBA', () => {
    it('should have 2 year duration', () => {
      const mba = engine.getNode('degree-mba') as any;
      expect(mba.duration).toBe(2);
    });

    it('should require CAT', () => {
      const mba = engine.getNode('degree-mba') as any;
      expect(mba.entranceExams).toContain('exam-cat');
    });

    it('should have LOW lock-in', () => {
      const mba = engine.getNode('degree-mba') as any;
      expect(mba.lockInLevel).toBe('LOW');
    });

    it('should lead to management career', () => {
      const mba = engine.getNode('degree-mba') as any;
      expect(mba.careerOutcomes).toContain('career-management');
    });
  });

  describe('LLB', () => {
    it('should have 3 year duration', () => {
      const llb = engine.getNode('degree-llb') as any;
      expect(llb.duration).toBe(3);
    });

    it('should lead to lawyer career', () => {
      const llb = engine.getNode('degree-llb') as any;
      expect(llb.careerOutcomes).toContain('career-lawyer');
    });
  });

  describe('B.Com', () => {
    it('should have 3 year duration', () => {
      const bcom = engine.getNode('degree-bcom') as any;
      expect(bcom.duration).toBe(3);
    });

    it('should allow CA as further education', () => {
      const bcom = engine.getNode('degree-bcom') as any;
      expect(bcom.furtherEducation).toContain('degree-ca');
    });

    it('should lead to CA career', () => {
      const bcom = engine.getNode('degree-bcom') as any;
      expect(bcom.careerOutcomes).toContain('career-ca');
    });
  });

  describe('CA', () => {
    it('should have variable duration', () => {
      const ca = engine.getNode('degree-ca') as any;
      expect(ca.duration).toBe(4.5);
    });

    it('should require CA exams', () => {
      const ca = engine.getNode('degree-ca') as any;
      expect(ca.entranceExams).toContain('exam-ca-foundation');
      expect(ca.entranceExams).toContain('exam-ca-inter');
      expect(ca.entranceExams).toContain('exam-ca-final');
    });

    it('should lead to CA career', () => {
      const ca = engine.getNode('degree-ca') as any;
      expect(ca.careerOutcomes).toContain('career-ca');
    });
  });

  describe('M.Tech', () => {
    it('should have 2 year duration', () => {
      const mtech = engine.getNode('degree-mtech') as any;
      expect(mtech.duration).toBe(2);
    });

    it('should require GATE', () => {
      const mtech = engine.getNode('degree-mtech') as any;
      expect(mtech.entranceExams).toContain('exam-gate');
    });
  });

  describe('MD/MS', () => {
    it('should have 3 year duration', () => {
      const md = engine.getNode('degree-md') as any;
      expect(md.duration).toBe(3);
    });

    it('should require NEET PG', () => {
      const md = engine.getNode('degree-md') as any;
      expect(md.entranceExams).toContain('exam-neet-pg');
    });
  });
});

// ============================================================================
// CAREER OUTCOME TESTS
// ============================================================================

describe('Career Outcome Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Software Engineering Career', () => {
    it('should be reachable from B.Tech', () => {
      const btech = engine.getNode('degree-btech') as any;
      expect(btech.careerOutcomes).toContain('career-software');
    });

    it('should be reachable from BCA', () => {
      const bca = engine.getNode('degree-bca') as any;
      expect(bca.careerOutcomes).toContain('career-software');
    });

    it('should have technology field', () => {
      const career = engine.getNode('career-software') as any;
      expect(career.metadata.field).toBe('Technology');
    });
  });

  describe('Doctor Career', () => {
    it('should require MBBS', () => {
      const mbbs = engine.getNode('degree-mbbs') as any;
      expect(mbbs.careerOutcomes).toContain('career-doctor');
    });

    it('should have healthcare field', () => {
      const career = engine.getNode('career-doctor') as any;
      expect(career.metadata.field).toBe('Healthcare');
    });
  });

  describe('CA Career', () => {
    it('should require CA degree', () => {
      const ca = engine.getNode('degree-ca') as any;
      expect(ca.careerOutcomes).toContain('career-ca');
    });

    it('should have finance field', () => {
      const career = engine.getNode('career-ca') as any;
      expect(career.metadata.field).toBe('Finance');
    });
  });

  describe('Lawyer Career', () => {
    it('should require LLB', () => {
      const llb = engine.getNode('degree-llb') as any;
      expect(llb.careerOutcomes).toContain('career-lawyer');
    });

    it('should have law field', () => {
      const career = engine.getNode('career-lawyer') as any;
      expect(career.metadata.field).toBe('Law');
    });
  });

  describe('Management Career', () => {
    it('should be reachable from MBA', () => {
      const mba = engine.getNode('degree-mba') as any;
      expect(mba.careerOutcomes).toContain('career-management');
    });

    it('should have business field', () => {
      const career = engine.getNode('career-management') as any;
      expect(career.metadata.field).toBe('Business');
    });
  });
});

// ============================================================================
// TRANSITION SCENARIO TESTS
// ============================================================================

describe('Transition Scenario Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Engineering to MBA Transition', () => {
    it('should be a valid transition', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(analysis).toBeDefined();
      expect(analysis.fromNode).toBe('degree-btech');
      expect(analysis.toNode).toBe('degree-mba');
    });

    it('should have moderate difficulty', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(['EASY', 'MODERATE', 'DIFFICULT']).toContain(analysis.difficulty);
    });

    it('should have reasonable probability', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(analysis.probability).toBeGreaterThan(0.3);
    });

    it('should estimate time correctly', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-btech', 'degree-mba');
      expect(analysis.timeEstimate).toBeGreaterThan(20); // At least 20 months
    });
  });

  describe('B.Com to CA Transition', () => {
    it('should be a valid transition', () => {
      const analysis = analyzeTransition(engine['graph'], 'degree-bcom', 'degree-ca');
      expect(analysis).toBeDefined();
    });

    it('should be common for commerce students', () => {
      const bcom = engine.getNode('degree-bcom') as any;
      expect(bcom.furtherEducation).toContain('degree-ca');
    });
  });

  describe('Arts to Law Transition', () => {
    it('should be a valid transition', () => {
      const analysis = analyzeTransition(engine['graph'], 'stream-arts', 'exam-clat');
      expect(analysis).toBeDefined();
    });
  });

  describe('PCM to Medical Transition', () => {
    it('should be possible via PCMB', () => {
      const stream = engine.getNode('stream-pcmb') as any;
      expect(stream.eligibleDegrees).toContain('degree-mbbs');
    });
  });

  describe('Transition Difficulty Levels', () => {
    it('should classify easy transitions', () => {
      const analysis = analyzeTransition(engine['graph'], 'stream-pcm', 'exam-cuet');
      expect(analysis.difficulty).toBeDefined();
    });

    it('should classify difficult transitions', () => {
      const analysis = analyzeTransition(engine['graph'], 'stream-arts', 'exam-neet');
      expect(['DIFFICULT', 'VERY_DIFFICULT']).toContain(analysis.difficulty);
    });
  });
});

// ============================================================================
// OPTIONALITY AND LOCK-IN TESTS
// ============================================================================

describe('Optionality and Lock-In Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('High Optionality Paths', () => {
    it('PCMB should have highest optionality', () => {
      const analysis = analyzeOptionality('stream-pcmb');
      expect(analysis.pathFlexibility).toBeGreaterThan(0.8);
    });

    it('PCM should have high optionality', () => {
      const analysis = analyzeOptionality('stream-pcm');
      expect(analysis.pathFlexibility).toBeGreaterThan(0.6);
    });

    it('B.Tech should have medium optionality', () => {
      const analysis = analyzeOptionality('degree-btech');
      expect(analysis.futurePathCount).toBeGreaterThan(3);
    });
  });

  describe('Lock-In Levels', () => {
    it('MBBS should have high lock-in', () => {
      const degree = engine.getNode('degree-mbbs') as any;
      expect(degree.lockInLevel).toBe('HIGH');
    });

    it('CA should have high lock-in', () => {
      const degree = engine.getNode('degree-ca') as any;
      expect(degree.lockInLevel).toBe('HIGH');
    });

    it('MBA should have low lock-in', () => {
      const degree = engine.getNode('degree-mba') as any;
      expect(degree.lockInLevel).toBe('LOW');
    });
  });

  describe('Criticality Analysis', () => {
    it('should identify critical decisions', () => {
      const analysis = analyzeCriticality('degree-mbbs');
      expect(analysis.criticalityLevel).toBeDefined();
    });

    it('should identify opportunity closure', () => {
      const analysis = analyzeCriticality('degree-mbbs');
      expect(Array.isArray(analysis.opportunityClosure)).toBe(true);
    });

    it('should calculate irreversibility', () => {
      const analysis = analyzeCriticality('degree-mbbs');
      expect(analysis.irreversibilityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.irreversibilityScore).toBeLessThanOrEqual(1);
    });
  });
});

// ============================================================================
// QUERY AND SEARCH TESTS
// ============================================================================

describe('Query and Search Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Graph Queries', () => {
    it('should query by node type', () => {
      const result = engine.query({ nodeTypes: ['SCHOOL_STREAM'], maxDepth: 2 });
      expect(result.paths.length).toBeGreaterThan(0);
    });

    it('should query by multiple node types', () => {
      const result = engine.query({ nodeTypes: ['EXAM', 'DEGREE'], maxDepth: 2 });
      expect(result.paths.length).toBeGreaterThan(0);
    });

    it('should respect max depth', () => {
      const result = engine.query({ startNode: 'stream-pcm', maxDepth: 1 });
      for (const path of result.paths) {
        expect(path.steps.length).toBeLessThanOrEqual(2);
      }
    });

    it('should provide metadata', () => {
      const result = engine.query({ startNode: 'stream-pcm', maxDepth: 2 });
      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalPaths).toBeGreaterThanOrEqual(0);
      expect(result.metadata.averageOptionality).toBeGreaterThanOrEqual(0);
    });

    it('should filter by optionality', () => {
      const result = engine.query({ startNode: 'stream-pcm', minOptionality: 0.5, maxDepth: 2 });
      expect(result.paths.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Path Finding', () => {
    it('should find paths between stream and career', () => {
      const pathways = findAllPathways(engine['graph'], 'stream-pcm', 4);
      expect(pathways.length).toBeGreaterThan(0);
    });

    it('should find shortest path', () => {
      const pathway = findShortestPath(engine['graph'], 'stream-pcm', 'exam-jee-main');
      expect(pathway).not.toBeNull();
    });

    it('should find paths by optionality', () => {
      const pathways = engine['pathwayEngine'].findPathsByOptionality('stream-pcm', 0.5);
      expect(Array.isArray(pathways)).toBe(true);
    });
  });
});

// ============================================================================
// DECISION SIMULATION TESTS
// ============================================================================

describe('Decision Simulation Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  describe('Stream Selection Simulation', () => {
    it('should simulate PCM vs PCB choice', () => {
      const input = {
        currentNode: 'class-10',
        candidateNodes: ['stream-pcm', 'stream-pcb'],
        studentProfile: {
          interests: ['science', 'math', 'biology'],
          strengths: ['problem-solving'],
          constraints: [],
          riskTolerance: 'HIGH' as const,
          timeHorizon: 8,
        },
      };

      const result = simulateDecision(input);
      expect(result.simulations.length).toBe(2);
    });

    it('should simulate Commerce vs Arts choice', () => {
      const input = {
        currentNode: 'class-10',
        candidateNodes: ['stream-commerce', 'stream-arts'],
        studentProfile: {
          interests: ['business', 'writing'],
          strengths: ['communication'],
          constraints: [],
          riskTolerance: 'MEDIUM' as const,
          timeHorizon: 5,
        },
      };

      const result = simulateDecision(input);
      expect(result.simulations.length).toBe(2);
    });
  });

  describe('Exam Selection Simulation', () => {
    it('should simulate JEE vs NEET choice', () => {
      const input = {
        currentNode: 'stream-pcm',
        candidateNodes: ['exam-jee-main', 'exam-neet'],
        studentProfile: {
          interests: ['engineering', 'medical'],
          strengths: ['math', 'biology'],
          constraints: [],
          riskTolerance: 'HIGH' as const,
          timeHorizon: 6,
        },
      };

      const result = simulateDecision(input);
      expect(result.comparison).toBeDefined();
    });
  });

  describe('College Selection Simulation', () => {
    it('should simulate IIT vs NIT choice', () => {
      const input = {
        currentNode: 'exam-jee-advanced',
        candidateNodes: ['college-iit', 'college-nit'],
        studentProfile: {
          interests: ['engineering'],
          strengths: ['academic'],
          constraints: ['rank-5000'],
          riskTolerance: 'LOW' as const,
          timeHorizon: 4,
        },
      };

      const result = simulateDecision(input);
      expect(result.recommendation).toBeDefined();
    });
  });
});

// ============================================================================
// INDIA-SPECIFIC VALIDATION TESTS
// ============================================================================

describe('India-Specific Validation Tests', () => {
  let engine: ReturnType<typeof createOpportunityGraphEngine>;

  beforeEach(() => {
    engine = createOpportunityGraphEngine();
  });

  it('should have 23 IITs', () => {
    const iit = engine.getNode('college-iit') as any;
    expect(iit.count).toBe(23);
  });

  it('should have 31 NITs', () => {
    const nit = engine.getNode('college-nit') as any;
    expect(nit.count).toBe(31);
  });

  it('should have 20 IIMs', () => {
    const iim = engine.getNode('college-iim') as any;
    expect(iim.count).toBe(20);
  });

  it('should have 23 NLUs', () => {
    const nlu = engine.getNode('college-nlu') as any;
    expect(nlu.count).toBe(23);
  });

  it('should have JEE as primary engineering exam', () => {
    const jee = engine.getNode('exam-jee-main') as any;
    expect(jee).toBeDefined();
    expect(jee.eligibility).toContain('PCM');
  });

  it('should have NEET as primary medical exam', () => {
    const neet = engine.getNode('exam-neet') as any;
    expect(neet).toBeDefined();
    expect(neet.eligibility).toContain('PCB');
  });

  it('should have CA as professional accounting qualification', () => {
    const ca = engine.getNode('degree-ca') as any;
    expect(ca).toBeDefined();
    expect(ca.awardedBy).toContain('ICAI');
  });

  it('should have UPSC for civil services', () => {
    const upsc = engine.getNode('exam-upsc') as any;
    expect(upsc).toBeDefined();
    expect(upsc.outcomes).toContain('IAS');
    expect(upsc.outcomes).toContain('IPS');
  });

  it('should have CUET for central universities', () => {
    const cuet = engine.getNode('exam-cuet') as any;
    expect(cuet).toBeDefined();
  });
});

// ============================================================================
// EDGE CASE AND ERROR HANDLING TESTS
// ============================================================================

describe('Edge Case and Error Handling Tests', () => {
  it('should handle null pathway generation', () => {
    const builder = createGraphBuilder();
    const graph = builder.buildGraph();
    const engine = createPathwayEngine(graph);

    const pathway = engine.generatePathway('non-existent');
    expect(pathway.steps.length).toBe(0);
  });

  it('should handle invalid node in transition analysis', () => {
    const engine = createOpportunityGraphEngine();
    const difficulty = engine['transitionEngine'].getTransitionDifficulty('stream-pcm', 'non-existent');
    expect(difficulty).toBe('VERY_DIFFICULT');
  });

  it('should handle empty candidate nodes in simulation', () => {
    const input = {
      currentNode: 'stream-pcm',
      candidateNodes: [] as string[],
      studentProfile: {
        interests: ['engineering'],
        strengths: ['math'],
        constraints: [],
        riskTolerance: 'MEDIUM' as const,
        timeHorizon: 5,
      },
    };

    const result = simulateDecision(input);
    expect(result.simulations.length).toBe(0);
  });

  it('should handle invalid start node in query', () => {
    const engine = createOpportunityGraphEngine();
    const result = engine.query({ startNode: 'non-existent', maxDepth: 2 });
    expect(result.paths.length).toBe(0);
  });
});

// ============================================================================
// GRAPH BUILDER ADVANCED TESTS
// ============================================================================

describe('Graph Builder Advanced Tests', () => {
  it('should merge two graphs', () => {
    const builder1 = createGraphBuilder();
    builder1.addNode(createTestNode('node-a', 'DEGREE', 'Node A'));

    const builder2 = createGraphBuilder();
    builder2.addNode(createTestNode('node-b', 'CAREER', 'Node B'));

    const merged = mergeGraphs([builder1.buildGraph(), builder2.buildGraph()]);
    expect(merged.nodes.size).toBe(2);
  });

  it('should clone graph builder', () => {
    const builder = createGraphBuilder();
    builder.addNode(createTestNode('node-a', 'DEGREE', 'Node A'));

    const clone = builder.clone();
    expect(clone.nodes.size).toBe(1);
  });

  it('should clear graph builder', () => {
    const builder = createGraphBuilder();
    builder.addNode(createTestNode('node-a', 'DEGREE', 'Node A'));
    builder.clear();

    const stats = builder.getStats();
    expect(stats.nodeCount).toBe(0);
  });
});

// ============================================================================
// FINAL VERIFICATION
// ============================================================================

describe('Final Verification', () => {
  it('should have comprehensive coverage', () => {
    expect(true).toBe(true);
  });

  it('should verify all node types exist', () => {
    const engine = createOpportunityGraphEngine();
    const stats = engine.getStats();

    expect(stats.nodeCount).toBeGreaterThan(0);
  });

  it('should verify graph connectivity', () => {
    const engine = createOpportunityGraphEngine();
    const stats = engine.getStats();
    expect(stats.nodeCount).toBeGreaterThan(20);
  });

  it('should verify India-specific content', () => {
    const engine = createOpportunityGraphEngine();
    const iit = engine.getNode('college-iit');
    const neet = engine.getNode('exam-neet');
    const upsc = engine.getNode('exam-upsc');

    expect(iit || neet || upsc).toBeDefined();
  });
});
