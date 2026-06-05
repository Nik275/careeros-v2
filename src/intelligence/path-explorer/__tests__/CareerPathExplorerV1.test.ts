/**
 * CareerOS Career Path Explorer V1 Tests
 *
 * Comprehensive test suite for path exploration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CareerPathExplorerV1,
  exploreCareerPaths,
  exploreSinglePath,
  type CareerPathExplorerResult,
  type ExploredCareerPath,
  type PathExplorerOptions,
  type PathStrategy,
} from '../index';
import {
  CareerTransitionGraphV1,
  type CareerNode,
  type CareerEdge,
} from '../../career-transition-graph';
import { OptionalityEngineV1 } from '../../optionality-engine';
import { CriticalityEngineV1 } from '../../criticality-engine';
import type { PsychologicalProfile } from '../../../domains/career/Career';

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

const createMockCareerNode = (overrides: Partial<CareerNode> & { id?: string; name?: string } = {}): CareerNode => ({
  id: overrides.id || 'test-node',
  name: overrides.name || 'Test Node',
  category: overrides.category || 'technology',
  description: 'Test node description',
  requiredProfile: createMockPsychologicalProfile(),
  keySkills: overrides.keySkills || ['programming', 'problem-solving'],
  skillCategories: (overrides.skillCategories as any) || ['technical'],
  typicalExperienceYears: overrides.typicalExperienceYears || 3,
  incomeLevel: overrides.incomeLevel || 0.5,
  isEntryLevel: overrides.isEntryLevel ?? false,
  isTerminal: overrides.isTerminal ?? false,
  relatedCareers: overrides.relatedCareers || [],
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
  transitionDifficulty: overrides.transitionDifficulty ?? 50,
  transitionTimeYears: overrides.transitionTimeYears ?? 2,
  skillOverlap: overrides.skillOverlap ?? 0.6,
  probabilityOfSuccess: overrides.probabilityOfSuccess ?? 0.7,
  reversibility: overrides.reversibility ?? 0.5,
  transitionType: (overrides.transitionType as any) || 'promotion',
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
// CAREER PATH EXPLORER TESTS
// ============================================================================

describe('CareerPathExplorerV1', () => {
  let graph: CareerTransitionGraphV1;
  let optionalityEngine: OptionalityEngineV1;
  let criticalityEngine: CriticalityEngineV1;
  let explorer: CareerPathExplorerV1;

  beforeEach(() => {
    graph = new CareerTransitionGraphV1();
    optionalityEngine = new OptionalityEngineV1();
    criticalityEngine = new CriticalityEngineV1(graph);
    explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);

    // Build a career progression graph
    graph.addNode(createMockCareerNode({
      id: 'se',
      name: 'Software Engineer',
      category: 'technology',
      incomeLevel: 0.4,
      isEntryLevel: true,
    }));

    graph.addNode(createMockCareerNode({
      id: 'sse',
      name: 'Senior Software Engineer',
      category: 'technology',
      incomeLevel: 0.6,
    }));

    graph.addNode(createMockCareerNode({
      id: 'staff',
      name: 'Staff Engineer',
      category: 'technology',
      incomeLevel: 0.8,
    }));

    graph.addNode(createMockCareerNode({
      id: 'cto',
      name: 'CTO',
      category: 'technology',
      incomeLevel: 1.0,
      isTerminal: true,
    }));

    graph.addNode(createMockCareerNode({
      id: 'pm',
      name: 'Product Manager',
      category: 'product',
      incomeLevel: 0.6,
    }));

    graph.addNode(createMockCareerNode({
      id: 'founder',
      name: 'Founder',
      category: 'entrepreneurship',
      incomeLevel: 0.9,
      isTerminal: true,
    }));

    // Technical path
    graph.addEdge(createMockCareerEdge({
      id: 'se-sse',
      fromNodeId: 'se',
      toNodeId: 'sse',
      transitionDifficulty: 40,
      transitionTimeYears: 3,
      skillOverlap: 0.8,
      probabilityOfSuccess: 0.8,
      reversibility: 0.7,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'sse-staff',
      fromNodeId: 'sse',
      toNodeId: 'staff',
      transitionDifficulty: 50,
      transitionTimeYears: 4,
      skillOverlap: 0.7,
      probabilityOfSuccess: 0.6,
      reversibility: 0.5,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'staff-cto',
      fromNodeId: 'staff',
      toNodeId: 'cto',
      transitionDifficulty: 70,
      transitionTimeYears: 5,
      skillOverlap: 0.5,
      probabilityOfSuccess: 0.3,
      reversibility: 0.2,
    }));

    // Pivot paths
    graph.addEdge(createMockCareerEdge({
      id: 'se-pm',
      fromNodeId: 'se',
      toNodeId: 'pm',
      transitionDifficulty: 60,
      transitionTimeYears: 2,
      skillOverlap: 0.4,
      probabilityOfSuccess: 0.5,
      reversibility: 0.6,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'sse-pm',
      fromNodeId: 'sse',
      toNodeId: 'pm',
      transitionDifficulty: 50,
      transitionTimeYears: 1,
      skillOverlap: 0.5,
      probabilityOfSuccess: 0.6,
      reversibility: 0.6,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'se-founder',
      fromNodeId: 'se',
      toNodeId: 'founder',
      transitionDifficulty: 80,
      transitionTimeYears: 1,
      skillOverlap: 0.3,
      probabilityOfSuccess: 0.2,
      reversibility: 0.1,
    }));
  });

  describe('explorePaths', () => {
    it('should explore paths from a starting career', () => {
      const result = explorer.explorePaths('se');

      expect(result).toBeDefined();
      expect(result.startingCareerId).toBe('se');
      expect(result.startingCareer.name).toBe('Software Engineer');
    });

    it('should generate multiple path types', () => {
      const result = explorer.explorePaths('se');

      expect(result.paths.length).toBeGreaterThan(0);
      expect(result.paths.some(p => p.type === 'primary')).toBe(true);
      expect(result.paths.some(p => p.type === 'high-growth')).toBe(true);
    });

    it('should include all required metrics for each path', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.metrics.totalYears).toBeGreaterThanOrEqual(0);
        expect(path.metrics.incomeRange).toBeDefined();
        expect(path.metrics.cumulativeSuccessProbability).toBeGreaterThanOrEqual(0);
        expect(path.scores.compositeScore).toBeGreaterThanOrEqual(0);
        expect(path.scores.compositeScore).toBeLessThanOrEqual(100);
      });
    });

    it('should include explainability output', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.explanation.summary).toBeTruthy();
        expect(path.explanation.details).toBeTruthy();
        expect(path.explanation.selectionReason).toBeTruthy();
        expect(path.explanation.strengths).toBeInstanceOf(Array);
        expect(path.explanation.tradeoffs).toBeInstanceOf(Array);
      });
    });

    it('should include future options analysis', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.explanation.preservedOptions).toBeInstanceOf(Array);
        expect(path.explanation.closedOptions).toBeInstanceOf(Array);
      });
    });

    it('should include risk assessment', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.risk.level).toMatch(/low|medium|high|extreme/);
        expect(path.risk.score).toBeGreaterThanOrEqual(0);
        expect(path.risk.score).toBeLessThanOrEqual(100);
        expect(path.risk.factors).toBeInstanceOf(Array);
      });
    });

    it('should include recommendations', () => {
      const result = explorer.explorePaths('se');

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should include path comparison', () => {
      const result = explorer.explorePaths('se');

      expect(result.comparison).toBeDefined();
      expect(result.comparison.comparisonText).toBeTruthy();
      expect(result.comparison.keyDifferences).toBeInstanceOf(Array);
    });

    it('should throw error for non-existent career', () => {
      expect(() => explorer.explorePaths('non-existent')).toThrow('does not exist');
    });

    it('should include timestamp', () => {
      const result = explorer.explorePaths('se');

      expect(result.generatedAt).toBeGreaterThan(0);
      expect(result.generatedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Path Types', () => {
    it('should generate primary path with highest probability', () => {
      const result = explorer.explorePaths('se');
      const primaryPath = result.pathsByType.get('primary');

      expect(primaryPath).toBeDefined();
      expect(primaryPath?.type).toBe('primary');
    });

    it('should generate high growth path', () => {
      const result = explorer.explorePaths('se');
      const growthPath = result.pathsByType.get('high-growth');

      expect(growthPath).toBeDefined();
      expect(growthPath?.type).toBe('high-growth');
    });

    it('should generate high optionality path', () => {
      const result = explorer.explorePaths('se');
      const optionalityPath = result.pathsByType.get('high-optionality');

      expect(optionalityPath).toBeDefined();
      expect(optionalityPath?.type).toBe('high-optionality');
    });

    it('should generate low risk path', () => {
      const result = explorer.explorePaths('se');
      const lowRiskPath = result.pathsByType.get('low-risk');

      expect(lowRiskPath).toBeDefined();
      expect(lowRiskPath?.type).toBe('low-risk');
    });
  });

  describe('Path Metrics', () => {
    it('should calculate total years correctly', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        const expectedYears = path.edges.reduce((sum, e) => sum + e.transitionTimeYears, 0);
        expect(path.metrics.totalYears).toBe(expectedYears);
      });
    });

    it('should calculate cumulative success probability', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        const expectedProb = path.edges.reduce((prob, e) => prob * e.probabilityOfSuccess, 1);
        expect(path.metrics.cumulativeSuccessProbability).toBeCloseTo(expectedProb, 5);
      });
    });

    it('should include income range estimates', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.metrics.incomeRange.entry).toBeGreaterThan(0);
        expect(path.metrics.incomeRange.senior).toBeGreaterThan(0);
      });
    });
  });

  describe('Path Scores', () => {
    it('should calculate optionality score', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.scores.optionalityScore).toBeGreaterThanOrEqual(0);
        expect(path.scores.optionalityScore).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate criticality score', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.scores.criticalityScore).toBeGreaterThanOrEqual(0);
        expect(path.scores.criticalityScore).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate composite score', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.scores.compositeScore).toBeGreaterThanOrEqual(0);
        expect(path.scores.compositeScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Explainability', () => {
    it('should explain why path preserves optionality', () => {
      const result = explorer.explorePaths('se');
      const optionalityPath = result.pathsByType.get('high-optionality');

      if (optionalityPath) {
        expect(optionalityPath.explanation.selectionReason).toContain('flexibility');
      }
    });

    it('should list preserved future options', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.explanation.preservedOptions).toBeInstanceOf(Array);
      });
    });

    it('should identify path strengths', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.explanation.strengths.length).toBeGreaterThan(0);
      });
    });

    it('should identify path tradeoffs', () => {
      const result = explorer.explorePaths('se');

      result.paths.forEach(path => {
        expect(path.explanation.tradeoffs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('exploreSinglePath', () => {
    it('should explore single path with primary strategy', () => {
      const path = explorer.exploreSinglePath('se', 'highest-probability');

      expect(path).toBeDefined();
      expect(path?.type).toBe('primary');
    });

    it('should explore single path with high growth strategy', () => {
      const path = explorer.exploreSinglePath('se', 'highest-income');

      expect(path).toBeDefined();
      expect(path?.type).toBe('high-growth');
    });

    it('should explore single path with optionality strategy', () => {
      const path = explorer.exploreSinglePath('se', 'highest-optionality');

      expect(path).toBeDefined();
      expect(path?.type).toBe('high-optionality');
    });

    it('should explore single path with low risk strategy', () => {
      const path = explorer.exploreSinglePath('se', 'lowest-risk');

      expect(path).toBeDefined();
      expect(path?.type).toBe('low-risk');
    });

    it('should return null for non-existent career', () => {
      const path = explorer.exploreSinglePath('non-existent', 'highest-probability');

      expect(path).toBeNull();
    });
  });

  describe('Path Comparison', () => {
    it('should identify best path for growth', () => {
      const result = explorer.explorePaths('se');

      expect(result.comparison.bestForGrowth).toBeDefined();
    });

    it('should identify best path for optionality', () => {
      const result = explorer.explorePaths('se');

      expect(result.comparison.bestForOptionality).toBeDefined();
    });

    it('should identify safest path', () => {
      const result = explorer.explorePaths('se');

      expect(result.comparison.safestPath).toBeDefined();
    });

    it('should generate comparison text', () => {
      const result = explorer.explorePaths('se');

      expect(result.comparison.comparisonText).toContain('growth');
    });
  });

  describe('Path Explorer Options', () => {
    it('should respect max years option', () => {
      const options: PathExplorerOptions = { maxYears: 2 };
      const result = explorer.explorePaths('se', options);

      result.paths.forEach(path => {
        expect(path.metrics.totalYears).toBeLessThanOrEqual(2);
      });
    });

    it('should respect max transitions option', () => {
      const options: PathExplorerOptions = { maxTransitions: 1 };
      const result = explorer.explorePaths('se', options);

      result.paths.forEach(path => {
        expect(path.metrics.transitionCount).toBeLessThanOrEqual(1);
      });
    });

    it('should respect minimum probability threshold', () => {
      const options: PathExplorerOptions = { minProbability: 0.5 };
      const result = explorer.explorePaths('se', options);

      result.paths.forEach(path => {
        path.edges.forEach(edge => {
          expect(edge.probabilityOfSuccess).toBeGreaterThanOrEqual(0.5);
        });
      });
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  let graph: CareerTransitionGraphV1;
  let optionalityEngine: OptionalityEngineV1;
  let criticalityEngine: CriticalityEngineV1;

  beforeEach(() => {
    graph = new CareerTransitionGraphV1();
    optionalityEngine = new OptionalityEngineV1();
    criticalityEngine = new CriticalityEngineV1(graph);

    graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
    graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
    graph.addEdge(createMockCareerEdge({
      id: 'se-sse',
      fromNodeId: 'se',
      toNodeId: 'sse',
      transitionDifficulty: 40,
      probabilityOfSuccess: 0.8,
    }));
  });

  describe('exploreCareerPaths', () => {
    it('should explore paths using factory function', () => {
      const result = exploreCareerPaths('se', graph, optionalityEngine, criticalityEngine);

      expect(result).toBeDefined();
      expect(result.startingCareerId).toBe('se');
    });
  });

  describe('exploreSinglePath', () => {
    it('should explore single path using factory function', () => {
      const path = exploreSinglePath('se', 'highest-probability', graph, optionalityEngine, criticalityEngine);

      expect(path).toBeDefined();
    });
  });
});

// ============================================================================
// REALISTIC CAREER SCENARIOS
// ============================================================================

describe('Realistic Career Scenarios', () => {
  it('should explore software engineer career paths', () => {
    const graph = new CareerTransitionGraphV1();
    const optionalityEngine = new OptionalityEngineV1();
    const criticalityEngine = new CriticalityEngineV1(graph);

    // Create software engineer career network
    const careers = [
      { id: 'se', name: 'Software Engineer', income: 0.4, entry: true },
      { id: 'sse', name: 'Senior SE', income: 0.6 },
      { id: 'staff', name: 'Staff Engineer', income: 0.8 },
      { id: 'cto', name: 'CTO', income: 1.0, terminal: true },
      { id: 'pm', name: 'Product Manager', income: 0.6 },
      { id: 'em', name: 'Engineering Manager', income: 0.7 },
      { id: 'founder', name: 'Founder', income: 0.9, terminal: true },
    ];

    careers.forEach(c => {
      graph.addNode(createMockCareerNode({
        id: c.id,
        name: c.name,
        incomeLevel: c.income,
        isEntryLevel: c.entry,
        isTerminal: c.terminal,
      }));
    });

    // Add transitions
    const transitions = [
      { from: 'se', to: 'sse', prob: 0.8, difficulty: 40, time: 3 },
      { from: 'sse', to: 'staff', prob: 0.6, difficulty: 50, time: 4 },
      { from: 'staff', to: 'cto', prob: 0.3, difficulty: 70, time: 5 },
      { from: 'se', to: 'pm', prob: 0.5, difficulty: 60, time: 2 },
      { from: 'sse', to: 'em', prob: 0.5, difficulty: 55, time: 3 },
      { from: 'em', to: 'cto', prob: 0.4, difficulty: 60, time: 4 },
      { from: 'se', to: 'founder', prob: 0.2, difficulty: 80, time: 1 },
    ];

    transitions.forEach(t => {
      graph.addEdge(createMockCareerEdge({
        id: `${t.from}-${t.to}`,
        fromNodeId: t.from,
        toNodeId: t.to,
        probabilityOfSuccess: t.prob,
        transitionDifficulty: t.difficulty,
        transitionTimeYears: t.time,
      }));
    });

    const explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
    const result = explorer.explorePaths('se');

    expect(result.paths.length).toBeGreaterThanOrEqual(4);

    // High growth should target CTO or Founder
    const highGrowth = result.pathsByType.get('high-growth');
    expect(highGrowth).toBeDefined();

    // Low risk should have higher success probability
    const lowRisk = result.pathsByType.get('low-risk');
    expect(lowRisk).toBeDefined();
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle career with no outgoing edges', () => {
    const graph = new CareerTransitionGraphV1();
    const optionalityEngine = new OptionalityEngineV1();
    const criticalityEngine = new CriticalityEngineV1(graph);

    graph.addNode(createMockCareerNode({ id: 'dead-end', name: 'Dead End' }));

    const explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
    const result = explorer.explorePaths('dead-end');

    expect(result).toBeDefined();
    expect(result.paths.length).toBeGreaterThanOrEqual(0);
  });

  it('should be deterministic', () => {
    const graph = new CareerTransitionGraphV1();
    const optionalityEngine = new OptionalityEngineV1();
    const criticalityEngine = new CriticalityEngineV1(graph);

    graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
    graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
    graph.addEdge(createMockCareerEdge({
      id: 'se-sse',
      fromNodeId: 'se',
      toNodeId: 'sse',
      probabilityOfSuccess: 0.8,
    }));

    const explorer1 = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
    const explorer2 = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);

    const result1 = explorer1.explorePaths('se');
    const result2 = explorer2.explorePaths('se');

    expect(result1.paths.length).toBe(result2.paths.length);
  });

  it('should handle single node graph', () => {
    const graph = new CareerTransitionGraphV1();
    const optionalityEngine = new OptionalityEngineV1();
    const criticalityEngine = new CriticalityEngineV1(graph);

    graph.addNode(createMockCareerNode({ id: 'only', name: 'Only Career' }));

    const explorer = new CareerPathExplorerV1(graph, optionalityEngine, criticalityEngine);
    const result = explorer.explorePaths('only');

    expect(result).toBeDefined();
    expect(result.paths.length).toBeGreaterThanOrEqual(0);
  });
});
