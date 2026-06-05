/**
 * CareerOS Criticality Engine V1 Tests
 *
 * Comprehensive test suite for criticality analysis.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CriticalityEngineV1,
  calculateCriticality,
  compareCriticality,
  calculateBatchCriticality,
  type CriticalityAnalysis,
  type CriticalityCalculationOptions,
} from '../index';
import {
  CareerTransitionGraphV1,
  type CareerNode,
  type CareerEdge,
} from '../../career-transition-graph';
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
// CRITICALITY ENGINE TESTS
// ============================================================================

describe('CriticalityEngineV1', () => {
  let graph: CareerTransitionGraphV1;
  let engine: CriticalityEngineV1;

  beforeEach(() => {
    graph = new CareerTransitionGraphV1();
    engine = new CriticalityEngineV1(graph);
  });

  describe('calculateCriticality', () => {
    it('should calculate criticality for a career', () => {
      graph.addNode(createMockCareerNode({ id: 'software-engineer', name: 'Software Engineer' }));

      const analysis = engine.calculateCriticality('software-engineer');

      expect(analysis).toBeDefined();
      expect(analysis.careerId).toBe('software-engineer');
      expect(analysis.careerName).toBe('Software Engineer');
      expect(analysis.criticalityScore).toBeGreaterThanOrEqual(0);
      expect(analysis.criticalityScore).toBeLessThanOrEqual(100);
    });

    it('should return all required metrics', () => {
      graph.addNode(createMockCareerNode({ id: 'career', name: 'Test Career' }));

      const analysis = engine.calculateCriticality('career');

      expect(analysis.metrics.reachableCareerCount).toBeDefined();
      expect(analysis.metrics.branchingFactor).toBeDefined();
      expect(analysis.metrics.reversibility).toBeDefined();
      expect(analysis.metrics.transferability).toBeDefined();
      expect(analysis.metrics.timeToFlexibility).toBeDefined();
      expect(analysis.metrics.optionalityPreservation).toBeDefined();
      expect(analysis.metrics.futureConstraint).toBeDefined();
    });

    it('should categorize criticality', () => {
      graph.addNode(createMockCareerNode({ id: 'career' }));

      const analysis = engine.calculateCriticality('career');

      expect(['minimal', 'low', 'moderate', 'high', 'extreme']).toContain(analysis.category);
    });

    it('should include summary and explanation', () => {
      graph.addNode(createMockCareerNode({ id: 'career', name: 'Test Career' }));

      const analysis = engine.calculateCriticality('career');

      expect(analysis.summary).toContain('Test Career');
      expect(analysis.explanation).toBeTruthy();
      expect(analysis.explanation.length).toBeGreaterThan(20);
    });

    it('should include reachable career details', () => {
      graph.addNode(createMockCareerNode({ id: 'career' }));

      const analysis = engine.calculateCriticality('career');

      expect(analysis.reachableCareers).toBeDefined();
      expect(typeof analysis.reachableCareers.total).toBe('number');
    });

    it('should include constraint details', () => {
      graph.addNode(createMockCareerNode({ id: 'career' }));

      const analysis = engine.calculateCriticality('career');

      expect(analysis.constraints).toBeDefined();
      expect(typeof analysis.constraints.minimumCommitmentYears).toBe('number');
    });

    it('should throw error for non-existent career', () => {
      expect(() => engine.calculateCriticality('non-existent')).toThrow('does not exist');
    });

    it('should include timestamp', () => {
      graph.addNode(createMockCareerNode({ id: 'career' }));

      const analysis = engine.calculateCriticality('career');

      expect(analysis.calculatedAt).toBeGreaterThan(0);
      expect(analysis.calculatedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Metric Calculations', () => {
    beforeEach(() => {
      // Create a connected graph
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer', category: 'technology' }));
      graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE', category: 'technology' }));
      graph.addNode(createMockCareerNode({ id: 'pm', name: 'Product Manager', category: 'product' }));
      graph.addNode(createMockCareerNode({ id: 'cto', name: 'CTO', category: 'technology', isTerminal: true }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-sse',
        fromNodeId: 'se',
        toNodeId: 'sse',
        transitionDifficulty: 30,
        skillOverlap: 0.8,
        probabilityOfSuccess: 0.8,
        reversibility: 0.7,
        transitionTimeYears: 2,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'se-pm',
        fromNodeId: 'se',
        toNodeId: 'pm',
        transitionDifficulty: 60,
        skillOverlap: 0.4,
        probabilityOfSuccess: 0.5,
        reversibility: 0.6,
        transitionTimeYears: 1,
      }));

      graph.addEdge(createMockCareerEdge({
        id: 'sse-cto',
        fromNodeId: 'sse',
        toNodeId: 'cto',
        transitionDifficulty: 70,
        skillOverlap: 0.5,
        probabilityOfSuccess: 0.3,
        reversibility: 0.3,
        transitionTimeYears: 5,
      }));
    });

    it('should calculate reachable career count', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.reachableCareerCount.value).toBeGreaterThan(0);
      expect(analysis.metrics.reachableCareerCount.explanation).toContain('career');
    });

    it('should calculate branching factor', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.branchingFactor.value).toBeGreaterThan(0);
      expect(analysis.metrics.branchingFactor.explanation).toContain('option');
    });

    it('should calculate reversibility', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.reversibility.value).toBeGreaterThanOrEqual(0);
      expect(analysis.metrics.reversibility.value).toBeLessThanOrEqual(1);
    });

    it('should calculate transferability', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.transferability.value).toBeGreaterThanOrEqual(0);
      expect(analysis.metrics.transferability.value).toBeLessThanOrEqual(1);
    });

    it('should calculate time to flexibility', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.timeToFlexibility.value).toBeGreaterThanOrEqual(0);
      expect(analysis.metrics.timeToFlexibility.value).toBeLessThanOrEqual(1);
    });

    it('should calculate optionality preservation', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.optionalityPreservation.value).toBeGreaterThanOrEqual(0);
      expect(analysis.metrics.optionalityPreservation.value).toBeLessThanOrEqual(1);
    });

    it('should calculate future constraint', () => {
      const analysis = engine.calculateCriticality('se');

      expect(analysis.metrics.futureConstraint.value).toBeGreaterThanOrEqual(0);
      expect(analysis.metrics.futureConstraint.value).toBeLessThanOrEqual(1);
      expect(analysis.metrics.futureConstraint.isPositive).toBe(false);
    });
  });

  describe('High vs Low Criticality Careers', () => {
    it('should identify flexible career as low criticality', () => {
      // Software Engineer with many paths
      graph.addNode(createMockCareerNode({
        id: 'se',
        name: 'Software Engineer',
        category: 'technology',
        keySkills: ['programming', 'system-design', 'communication', 'leadership'],
        skillCategories: ['technical', 'business'],
        isEntryLevel: true,
      }));

      // Add many adjacent careers
      const careers = ['pm', 'data-scientist', 'founder', 'consultant', 'manager'];
      careers.forEach((id, i) => {
        graph.addNode(createMockCareerNode({ id, name: id, category: i % 2 === 0 ? 'technology' : 'business' }));
        graph.addEdge(createMockCareerEdge({
          id: `se-${id}`,
          fromNodeId: 'se',
          toNodeId: id,
          transitionDifficulty: 30 + i * 5,
          skillOverlap: 0.6,
          probabilityOfSuccess: 0.7,
          reversibility: 0.7,
        }));
      });

      const analysis = engine.calculateCriticality('se');

      // Should be low criticality (high flexibility)
      expect(analysis.criticalityScore).toBeLessThan(60);
    });

    it('should identify specialized career as high criticality', () => {
      // Neurosurgeon - highly specialized
      graph.addNode(createMockCareerNode({
        id: 'neurosurgeon',
        name: 'Neurosurgeon',
        category: 'healthcare',
        keySkills: ['surgery', 'neuroscience'],
        skillCategories: ['healthcare'],
        isTerminal: true,
        typicalExperienceYears: 15,
      }));

      // Add only one exit path
      graph.addNode(createMockCareerNode({ id: 'hospital-admin', name: 'Hospital Admin', category: 'healthcare' }));
      graph.addEdge(createMockCareerEdge({
        id: 'neuro-admin',
        fromNodeId: 'neurosurgeon',
        toNodeId: 'hospital-admin',
        transitionDifficulty: 80,
        skillOverlap: 0.2,
        probabilityOfSuccess: 0.3,
        reversibility: 0.2,
        transitionTimeYears: 3,
      }));

      const analysis = engine.calculateCriticality('neurosurgeon');

      // Should be high criticality (low flexibility)
      expect(analysis.criticalityScore).toBeGreaterThan(40);
    });
  });

  describe('Career Comparisons', () => {
    beforeEach(() => {
      graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer', category: 'technology', isEntryLevel: true }));
      graph.addNode(createMockCareerNode({ id: 'doctor', name: 'Doctor', category: 'healthcare', isTerminal: true }));

      // SE has multiple paths
      ['pm', 'founder', 'consultant'].forEach((id, i) => {
        graph.addNode(createMockCareerNode({ id, name: id }));
        graph.addEdge(createMockCareerEdge({
          id: `se-${id}`,
          fromNodeId: 'se',
          toNodeId: id,
          transitionDifficulty: 40,
          skillOverlap: 0.6,
          probabilityOfSuccess: 0.6,
          reversibility: 0.7,
        }));
      });

      // Doctor has limited paths
      graph.addNode(createMockCareerNode({ id: 'specialist', name: 'Specialist' }));
      graph.addEdge(createMockCareerEdge({
        id: 'doctor-specialist',
        fromNodeId: 'doctor',
        toNodeId: 'specialist',
        transitionDifficulty: 80,
        skillOverlap: 0.5,
        probabilityOfSuccess: 0.4,
        reversibility: 0.2,
      }));
    });

    it('should compare two careers', () => {
      const comparison = engine.compareCriticality('se', 'doctor');

      expect(comparison.career1.careerId).toBe('se');
      expect(comparison.career2.careerId).toBe('doctor');
      expect(comparison.moreCritical).toBeDefined();
      expect(comparison.moreFlexible).toBeDefined();
    });

    it('should identify more flexible career', () => {
      const comparison = engine.compareCriticality('se', 'doctor');

      expect(comparison.moreFlexible).toBe('career1');
    });

    it('should provide key differences', () => {
      const comparison = engine.compareCriticality('se', 'doctor');

      expect(comparison.keyDifferences).toBeInstanceOf(Array);
      expect(comparison.keyDifferences.length).toBeGreaterThan(0);
    });

    it('should generate comparison text', () => {
      const comparison = engine.compareCriticality('se', 'doctor');

      expect(comparison.comparison).toContain('Software Engineer');
      expect(comparison.comparison).toContain('Doctor');
    });
  });

  describe('Batch Calculations', () => {
    beforeEach(() => {
      ['se', 'doctor', 'lawyer', 'designer'].forEach(id => {
        graph.addNode(createMockCareerNode({ id, name: id }));
      });
    });

    it('should calculate batch criticality', () => {
      const result = engine.calculateBatch(['se', 'doctor', 'lawyer']);

      expect(result.analyses.size).toBe(3);
      expect(result.rankings).toHaveLength(3);
    });

    it('should sort rankings by criticality', () => {
      const result = engine.calculateBatch(['se', 'doctor', 'lawyer']);

      for (let i = 0; i < result.rankings.length - 1; i++) {
        expect(result.rankings[i].criticalityScore).toBeLessThanOrEqual(
          result.rankings[i + 1].criticalityScore
        );
      }
    });

    it('should calculate statistics', () => {
      const result = engine.calculateBatch(['se', 'doctor', 'lawyer']);

      expect(result.statistics.averageScore).toBeDefined();
      expect(result.statistics.medianScore).toBeDefined();
      expect(result.statistics.minScore).toBeDefined();
      expect(result.statistics.maxScore).toBeDefined();
    });
  });

  describe('Flexibility Ranking', () => {
    beforeEach(() => {
      ['se', 'doctor', 'lawyer', 'designer', 'manager'].forEach(id => {
        graph.addNode(createMockCareerNode({ id, name: id }));
      });
    });

    it('should rank careers by flexibility', () => {
      const rankings = engine.getFlexibilityRanking();

      expect(rankings.length).toBeGreaterThan(0);
    });

    it('should limit results', () => {
      const rankings = engine.getFlexibilityRanking(3);

      expect(rankings.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Similar Criticality', () => {
    beforeEach(() => {
      ['se', 'pm', 'founder', 'doctor', 'surgeon'].forEach(id => {
        graph.addNode(createMockCareerNode({ id, name: id }));
      });
    });

    it('should find careers with similar criticality', () => {
      const similar = engine.findSimilarCriticality('se', 15);

      expect(similar).toBeInstanceOf(Array);
    });
  });

  describe('Calculation Options', () => {
    beforeEach(() => {
      graph.addNode(createMockCareerNode({ id: 'se' }));
    });

    it('should accept custom max depth', () => {
      const options: CriticalityCalculationOptions = { maxDepth: 2 };
      const analysis = engine.calculateCriticality('se', options);

      expect(analysis).toBeDefined();
    });

    it('should accept custom weights', () => {
      const options: CriticalityCalculationOptions = {
        weights: {
          reversibility: 0.5,
          transferability: 0.3,
        },
      };
      const analysis = engine.calculateCriticality('se', options);

      expect(analysis).toBeDefined();
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  let graph: CareerTransitionGraphV1;

  beforeEach(() => {
    graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
    graph.addNode(createMockCareerNode({ id: 'doctor', name: 'Doctor' }));
  });

  describe('calculateCriticality', () => {
    it('should calculate criticality using factory function', () => {
      const analysis = calculateCriticality('se', graph);

      expect(analysis).toBeDefined();
      expect(analysis.careerId).toBe('se');
    });
  });

  describe('compareCriticality', () => {
    it('should compare careers using factory function', () => {
      const comparison = compareCriticality('se', 'doctor', graph);

      expect(comparison.career1.careerId).toBe('se');
      expect(comparison.career2.careerId).toBe('doctor');
    });
  });

  describe('calculateBatchCriticality', () => {
    it('should calculate batch using factory function', () => {
      const result = calculateBatchCriticality(['se', 'doctor'], graph);

      expect(result.analyses.size).toBe(2);
    });
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle isolated career', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'isolated', name: 'Isolated Career' }));

    const engine = new CriticalityEngineV1(graph);
    const analysis = engine.calculateCriticality('isolated');

    expect(analysis).toBeDefined();
    expect(analysis.criticalityScore).toBeGreaterThanOrEqual(0);
  });

  it('should be deterministic', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'career' }));

    const engine1 = new CriticalityEngineV1(graph);
    const engine2 = new CriticalityEngineV1(graph);

    const analysis1 = engine1.calculateCriticality('career');
    const analysis2 = engine2.calculateCriticality('career');

    expect(analysis1.criticalityScore).toBe(analysis2.criticalityScore);
  });

  it('should handle career with no outgoing edges', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'dead-end', name: 'Dead End' }));

    const engine = new CriticalityEngineV1(graph);
    const analysis = engine.calculateCriticality('dead-end');

    expect(analysis).toBeDefined();
    expect(analysis.metrics.reachableCareerCount.value).toBe(0);
  });

  it('should handle fully connected career', () => {
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'hub', name: 'Hub Career' }));

    // Connect to many careers
    for (let i = 0; i < 10; i++) {
      graph.addNode(createMockCareerNode({ id: `career-${i}`, name: `Career ${i}` }));
      graph.addEdge(createMockCareerEdge({
        id: `hub-${i}`,
        fromNodeId: 'hub',
        toNodeId: `career-${i}`,
        transitionDifficulty: 40,
        skillOverlap: 0.6,
      }));
    }

    const engine = new CriticalityEngineV1(graph);
    const analysis = engine.calculateCriticality('hub');

    expect(analysis).toBeDefined();
    expect(analysis.metrics.reachableCareerCount.value).toBeGreaterThan(0.5);
  });
});

// ============================================================================
// REALISTIC CAREER SCENARIOS
// ============================================================================

describe('Realistic Career Scenarios', () => {
  it('should analyze software engineer as flexible', () => {
    const graph = new CareerTransitionGraphV1();

    // Software Engineer with many paths
    graph.addNode(createMockCareerNode({
      id: 'se',
      name: 'Software Engineer',
      category: 'technology',
      keySkills: ['programming', 'system-design', 'communication', 'leadership', 'problem-solving'],
      skillCategories: ['technical', 'business'],
      isEntryLevel: true,
    }));

    // Multiple career paths
    const paths = [
      { id: 'sse', name: 'Senior SE', difficulty: 30, overlap: 0.8 },
      { id: 'pm', name: 'Product Manager', difficulty: 50, overlap: 0.5 },
      { id: 'founder', name: 'Founder', difficulty: 70, overlap: 0.4 },
      { id: 'consultant', name: 'Consultant', difficulty: 45, overlap: 0.6 },
      { id: 'data-scientist', name: 'Data Scientist', difficulty: 55, overlap: 0.5 },
    ];

    paths.forEach(p => {
      graph.addNode(createMockCareerNode({ id: p.id, name: p.name }));
      graph.addEdge(createMockCareerEdge({
        id: `se-${p.id}`,
        fromNodeId: 'se',
        toNodeId: p.id,
        transitionDifficulty: p.difficulty,
        skillOverlap: p.overlap,
        probabilityOfSuccess: 0.6,
        reversibility: 0.6,
        transitionTimeYears: 2,
      }));
    });

    const engine = new CriticalityEngineV1(graph);
    const analysis = engine.calculateCriticality('se');

    expect(analysis.criticalityScore).toBeLessThan(60);
    expect(analysis.category).toMatch(/minimal|low|moderate/);
  });

  it('should analyze doctor as constraining', () => {
    const graph = new CareerTransitionGraphV1();

    graph.addNode(createMockCareerNode({
      id: 'doctor',
      name: 'Doctor',
      category: 'healthcare',
      keySkills: ['medicine', 'diagnosis'],
      skillCategories: ['healthcare'],
      isTerminal: true,
      typicalExperienceYears: 10,
    }));

    // Limited paths from doctor
    graph.addNode(createMockCareerNode({ id: 'specialist', name: 'Specialist' }));
    graph.addNode(createMockCareerNode({ id: 'admin', name: 'Hospital Admin' }));

    graph.addEdge(createMockCareerEdge({
      id: 'doc-spec',
      fromNodeId: 'doctor',
      toNodeId: 'specialist',
      transitionDifficulty: 80,
      skillOverlap: 0.6,
      probabilityOfSuccess: 0.4,
      reversibility: 0.2,
      transitionTimeYears: 5,
    }));

    graph.addEdge(createMockCareerEdge({
      id: 'doc-admin',
      fromNodeId: 'doctor',
      toNodeId: 'admin',
      transitionDifficulty: 75,
      skillOverlap: 0.3,
      probabilityOfSuccess: 0.3,
      reversibility: 0.3,
      transitionTimeYears: 3,
    }));

    const engine = new CriticalityEngineV1(graph);
    const analysis = engine.calculateCriticality('doctor');

    expect(analysis.criticalityScore).toBeGreaterThan(30);
    expect(analysis.metrics.futureConstraint.value).toBeGreaterThan(0.3);
  });
});
