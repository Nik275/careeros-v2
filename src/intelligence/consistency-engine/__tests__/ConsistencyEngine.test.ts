/**
 * CareerOS Intelligence Consistency Engine Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ConsistencyEngine,
  createConsistencyEngine,
  validateConsistency,
  isConsistent,
  DEFAULT_CONSISTENCY_CONFIG,
} from '../';
import type { IntelligenceResults, ConsistencyReport } from '../types';

// ============================================================================
// MOCK DATA
// ============================================================================

const createMockMatchingResult = (careerId: string, score: number) => ({
  studentId: 'student-1',
  matches: [
    {
      careerId,
      careerName: 'Test Career',
      overallScore: score,
      confidence: 0.85,
      dimensionScores: {
        psychologicalFit: score,
        workStyleFit: score,
        motivationFit: score,
        constraintFit: score,
      },
      explanations: [],
    },
  ],
  timestamp: Date.now(),
});

const createMockCoalitionResult = (pathId: string, alignment: number) => ({
  id: 'coalition-1',
  studentId: 'student-1',
  pathAnalyses: [
    {
      pathId,
      pathName: 'Test Path',
      overallAlignment: alignment,
      confidence: 0.8,
      memberEvaluations: [],
      dynamics: {
        stability: 0.7,
        conflictLevel: 0.2,
        dominantMembers: [],
      },
    },
  ],
  overallMetrics: {
    overallAlignment: alignment,
    memberConsensus: 0.75,
    feasibility: 0.8,
    flexibility: 0.6,
    confidence: 0.8,
  },
  timestamp: Date.now(),
});

const createMockRegretResult = (pathId: string, regretRisk: number) => ({
  id: 'regret-1',
  studentId: 'student-1',
  pathAnalyses: [
    {
      pathId,
      regretRisk,
      confidence: 0.75,
      primaryFactors: [],
      timeHorizon: 5,
    },
  ],
  overallMetrics: {
    averageRegretRisk: regretRisk,
    maxRegretRisk: regretRisk,
    minRegretRisk: regretRisk,
    confidence: 0.75,
  },
  timestamp: Date.now(),
});

const createMockOptionalityResult = (careerId: string, score: number) => ({
  id: 'optionality-1',
  careerId,
  careerName: 'Test Career',
  overallScore: score,
  category: score > 70 ? 'high' : score > 40 ? 'moderate' : 'low',
  dimensionScores: {
    skillTransferability: score,
    adjacentCareerCount: score,
    pivotFlexibility: score,
    futureOptionPreservation: score,
  },
  adjacentCareers: [],
  summary: 'Test summary',
  timestamp: Date.now(),
});

const createMockCriticalityResult = (careerId: string, score: number) => ({
  id: 'criticality-1',
  careerId,
  careerName: 'Test Career',
  criticalityScore: score,
  category: score > 70 ? 'extreme' : score > 50 ? 'high' : score > 30 ? 'moderate' : 'low',
  metrics: {
    reachableCareerCount: { value: 10, explanation: '', impact: 'medium', isPositive: true },
    branchingFactor: { value: 3, explanation: '', impact: 'medium', isPositive: true },
    reversibility: { value: 1 - score / 100, explanation: '', impact: 'high', isPositive: true },
    transferability: { value: 0.7, explanation: '', impact: 'high', isPositive: true },
    timeToFlexibility: { value: 2, explanation: '', impact: 'medium', isPositive: false },
    optionalityPreservation: { value: 1 - score / 100, explanation: '', impact: 'high', isPositive: true },
    futureConstraint: { value: score / 100, explanation: '', impact: 'high', isPositive: false },
  },
  reachableCareers: { total: 10, byCategory: new Map(), topPaths: [] },
  constraints: { inaccessibleCareers: [], minimumCommitmentYears: 0, financialCommitment: 0, educationRequirements: [] },
  comparison: { percentile: 50, vsCategoryAverage: 0, categorySize: 10 },
  timestamp: Date.now(),
});

const createMockRecommendation = (pathId: string, confidence: number) => ({
  id: 'rec-1',
  studentId: 'student-1',
  studentBeliefId: 'belief-1',
  path: {
    id: pathId,
    name: 'Test Path',
    nodes: [{ id: pathId, name: 'Test Career', description: '', industry: '', category: 'technical', requiredStrengths: [], alignedValues: [], lifestyleProfile: { workEnvironment: 'office', scheduleFlexibility: 0.5, travelRequirement: 0.3, typicalTeamSize: { min: 5, max: 10 }, remotePossibility: 0.5, workPace: 3 }, entryRequirements: [], trajectory: { yearsToSenior: 3, yearsToLeadership: 7, hasClearAdvancement: true, pivotOptions: [], specializationOptions: [] }, marketData: { demandLevel: 3, growthProjection: 0.05, salaryRange: { entry: 50000, mid: 80000, senior: 120000 }, geographicAvailability: { isGlobal: true, inDemandRegions: [], remoteCommon: true }, entryBarrier: 3 }, metadata: { lastUpdated: Date.now(), dataSource: 'test', dataConfidence: 0.8 } }],
    edges: [],
    totalYears: 5,
    studentBeliefId: 'belief-1',
    scores: { motivationAlignment: 0.8, strengthUtilization: 0.75, valueSatisfaction: 0.7, feasibility: 0.8, predictedRegret: 0.2, overall: 0.75 },
    isValidated: false,
    generatedAt: Date.now(),
  },
  rank: 1,
  confidence,
  reasoning: {
    motivationAlignment: 'Good alignment',
    strengthAlignment: 'Strong fit',
    valueAlignment: 'Aligned values',
    feasibilityReasoning: 'Feasible path',
    regretReasoning: 'Low regret risk',
    summary: 'Good overall match',
  },
  concerns: [],
  nextSteps: [],
  generatedAt: Date.now(),
  contributingEngines: ['matching', 'coalition'],
});

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ConsistencyEngine', () => {
  describe('Basic Functionality', () => {
    it('should create an engine with default config', () => {
      const engine = new ConsistencyEngine();
      expect(engine).toBeDefined();
    });

    it('should create an engine with custom config', () => {
      const engine = createConsistencyEngine({
        enableContradictionDetection: false,
        minConfidenceThreshold: 0.5,
      });
      expect(engine).toBeDefined();
    });

    it('should validate empty results as invalid', () => {
      const engine = new ConsistencyEngine();
      const report = engine.validate({});
      expect(report.consistencyScore).toBe(0);
      expect(report.interpretation.category).toBe('critical');
    });

    it('should validate results with at least one engine', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
      };
      const report = engine.validate(results);
      expect(report.consistencyScore).toBeGreaterThan(0);
    });
  });

  describe('Contradiction Detection', () => {
    it('should detect matching-coalition contradiction', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.3),
      };
      const report = engine.validate(results);
      const contradiction = report.violations.find(v => v.type === 'contradiction');
      expect(contradiction).toBeDefined();
      expect(contradiction?.involvedEngines).toContain('matching');
      expect(contradiction?.involvedEngines).toContain('coalition');
    });

    it('should detect optionality-criticality contradiction', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        optionality: createMockOptionalityResult('career-1', 80),
        criticality: createMockCriticalityResult('career-1', 80),
      };
      const report = engine.validate(results);
      const contradiction = report.violations.find(
        v => v.type === 'contradiction' && v.involvedEngines.includes('optionality')
      );
      expect(contradiction).toBeDefined();
    });

    it('should not flag consistent results', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.7),
        coalition: createMockCoalitionResult('career-1', 0.75),
      };
      const report = engine.validate(results);
      expect(report.consistencyScore).toBeGreaterThan(70);
    });
  });

  describe('Agreement Detection', () => {
    it('should detect cross-engine agreement', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.85),
        coalition: createMockCoalitionResult('career-1', 0.82),
        regret: createMockRegretResult('career-1', 0.2),
      };
      const report = engine.validate(results);
      expect(report.agreements.length).toBeGreaterThan(0);
    });

    it('should boost score for strong agreements', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.88),
        regret: createMockRegretResult('career-1', 0.15),
        recommendations: [createMockRecommendation('career-1', 0.9)],
      };
      const report = engine.validate(results);
      expect(report.consistencyScore).toBeGreaterThan(80);
    });
  });

  describe('Weak Chain Detection', () => {
    it('should detect weak recommendation chains', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        recommendations: [createMockRecommendation('career-1', 0.4)],
      };
      const report = engine.validate(results);
      const weakChain = report.weakChains.find(w => w.id.includes('recommendation'));
      expect(weakChain).toBeDefined();
    });
  });

  describe('Override Detection', () => {
    it('should detect coalition override of matching', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-2', 0.85),
      };
      const report = engine.validate(results);
      const override = report.overrides.find(o => o.overriddenEngine === 'matching');
      expect(override).toBeDefined();
    });
  });

  describe('Conflict Detection', () => {
    it('should detect regret-optionality conflict', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        optionality: createMockOptionalityResult('career-1', 30),
        regret: createMockRegretResult('career-1', 0.8),
      };
      const report = engine.validate(results);
      const conflict = report.conflicts.find(c => c.engines.includes('regret'));
      expect(conflict).toBeDefined();
    });
  });

  describe('Reasoning Graph', () => {
    it('should build a reasoning graph', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
        coalition: createMockCoalitionResult('career-1', 0.75),
      };
      const report = engine.validate(results);
      expect(report.reasoningGraph.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('Top Recommendation', () => {
    it('should generate top recommendation with cross-engine support', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.85),
        coalition: createMockCoalitionResult('career-1', 0.82),
        regret: createMockRegretResult('career-1', 0.2),
        recommendations: [createMockRecommendation('career-1', 0.85)],
      };
      const report = engine.validate(results);
      expect(report.topRecommendation).not.toBeNull();
      expect(report.topRecommendation?.supportingEngines.length).toBeGreaterThan(0);
    });
  });

  describe('Consistency Score Calculation', () => {
    it('should calculate perfect score for fully consistent results', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.85),
        coalition: createMockCoalitionResult('career-1', 0.82),
        regret: createMockRegretResult('career-1', 0.2),
        optionality: createMockOptionalityResult('career-1', 70),
        criticality: createMockCriticalityResult('career-1', 30),
        recommendations: [createMockRecommendation('career-1', 0.85)],
      };
      const report = engine.validate(results);
      expect(report.consistencyScore).toBeGreaterThanOrEqual(70);
    });

    it('should calculate low score for highly inconsistent results', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.2),
        regret: createMockRegretResult('career-1', 0.9),
        optionality: createMockOptionalityResult('career-1', 80),
        criticality: createMockCriticalityResult('career-1', 80),
      };
      const report = engine.validate(results);
      expect(report.consistencyScore).toBeLessThan(50);
    });
  });

  describe('Score Interpretation', () => {
    it('should interpret excellent score correctly', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.88),
        regret: createMockRegretResult('career-1', 0.15),
        recommendations: [createMockRecommendation('career-1', 0.9)],
      };
      const report = engine.validate(results);
      expect(report.interpretation.category).toBe('excellent');
    });

    it('should interpret critical score correctly', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.1),
      };
      const report = engine.validate(results);
      expect(['poor', 'critical']).toContain(report.interpretation.category);
    });
  });

  describe('Statistics', () => {
    it('should calculate correct statistics', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
        coalition: createMockCoalitionResult('career-1', 0.75),
        regret: createMockRegretResult('career-1', 0.2),
      };
      const report = engine.validate(results);
      expect(report.statistics.totalEngines).toBe(3);
      expect(report.statistics.averageEngineConfidence).toBeGreaterThan(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should use validateConsistency function', () => {
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
      };
      const report = validateConsistency(results);
      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
    });

    it('should use isConsistent function', () => {
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
        coalition: createMockCoalitionResult('career-1', 0.75),
      };
      const consistent = isConsistent(results, 70);
      expect(typeof consistent).toBe('boolean');
    });
  });

  describe('Configuration', () => {
    it('should respect enableContradictionDetection config', () => {
      const engine = createConsistencyEngine({
        enableContradictionDetection: false,
      });
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.2),
      };
      const report = engine.validate(results);
      const contradiction = report.violations.find(v => v.type === 'contradiction');
      expect(contradiction).toBeUndefined();
    });

    it('should respect minConfidenceThreshold config', () => {
      const engine = createConsistencyEngine({
        minConfidenceThreshold: 0.9,
      });
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.5),
      };
      const report = engine.validate(results);
      expect(report.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Options Filtering', () => {
    it('should respect excludeEngines option', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.2),
      };
      const report = engine.validate(results, { excludeEngines: ['coalition'] });
      const coalitionViolation = report.violations.find(v => v.involvedEngines.includes('coalition'));
      expect(coalitionViolation).toBeUndefined();
    });

    it('should respect minSeverity option', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.2),
      };
      const report = engine.validate(results, { minSeverity: 'critical' });
      expect(report.violations.every(v => v.severity === 'critical')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
        coalition: undefined,
        regret: null as unknown as undefined,
      };
      expect(() => engine.validate(results)).not.toThrow();
    });

    it('should handle empty arrays', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        recommendations: [],
      };
      const report = engine.validate(results);
      expect(report).toBeDefined();
    });

    it('should generate unique IDs', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.8),
      };
      const report1 = engine.validate(results);
      const report2 = engine.validate(results);
      expect(report1.id).not.toBe(report2.id);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ConsistencyEngine Integration', () => {
  it('should handle full intelligence pipeline results', () => {
    const engine = new ConsistencyEngine();
    const results: IntelligenceResults = {
      matching: createMockMatchingResult('career-1', 0.82),
      coalition: createMockCoalitionResult('career-1', 0.78),
      regret: createMockRegretResult('career-1', 0.22),
      optionality: createMockOptionalityResult('career-1', 65),
      criticality: createMockCriticalityResult('career-1', 35),
      recommendations: [createMockRecommendation('career-1', 0.80)],
    };
    const report = engine.validate(results);

    expect(report.consistencyScore).toBeGreaterThan(60);
    expect(report.violations).toBeDefined();
    expect(report.agreements).toBeDefined();
    expect(report.reasoningGraph.nodes.length).toBeGreaterThan(0);
    expect(report.topRecommendation).not.toBeNull();
    expect(report.statistics.totalEngines).toBe(6);
  });

  it('should provide actionable recommendations', () => {
    const engine = new ConsistencyEngine();
    const results: IntelligenceResults = {
      matching: createMockMatchingResult('career-1', 0.9),
      coalition: createMockCoalitionResult('career-1', 0.3),
    };
    const report = engine.validate(results);

    expect(report.interpretation.recommendations.length).toBeGreaterThan(0);
    if (report.violations.length > 0) {
      expect(report.violations[0].resolution).toBeDefined();
    }
  });
});
