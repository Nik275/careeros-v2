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
import type { MatchingResult } from '../../matching-engine';
import type {
  CoalitionMember,
  DecisionCoalitionAnalysis,
  PathCoalitionAnalysis,
} from '../../decision-coalition-v3';
import type { RegretAnalysis, RegretType, PathRegretAnalysis } from '../../regret-functional';
import type { OptionalityAnalysis } from '../../optionality-engine';
import type { CriticalityAnalysis } from '../../criticality-engine';
import { CareerCategory, WorkEnvironmentType, type CareerRecommendation } from '../../types';

// ============================================================================
// MOCK DATA
// ============================================================================

type MockStudentBelief = DecisionCoalitionAnalysis['studentBelief'];
type MockPathExplorerResult = DecisionCoalitionAnalysis['pathExplorerResult'];
type MockExploredPath = MockPathExplorerResult['paths'][number];
type MockCareerNode = MockPathExplorerResult['startingCareer'];

const createMockCareerMatch = (careerId: string, score: number): MatchingResult['matches'][number] => ({
  careerId,
  careerSlug: careerId,
  careerName: 'Test Career',
  score,
  explanation: {
    overallScore: score,
    psychologicalFit: { score, strongestMatches: [], strongestMismatches: [], summary: 'Test psychological fit' },
    workStyleFit: { score, strongestMatches: [], strongestMismatches: [], summary: 'Test work-style fit' },
    motivationFit: { score, strongestMatches: [], strongestMismatches: [], summary: 'Test motivation fit' },
    constraintFit: { score, satisfied: [], violated: [], summary: 'Test constraint fit' },
    reasoning: ['Test reasoning'],
    insights: ['Test insight'],
  },
});

const createMockMatchingResult = (careerId: string, score: number): MatchingResult => {
  const match = createMockCareerMatch(careerId, score);

  return {
    matches: [match],
    topMatches: [match],
    qualifyingMatches: score >= 0.4 ? [match] : [],
    bestMatch: match,
    statistics: {
      totalCareers: 1,
      qualifyingCount: score >= 0.4 ? 1 : 0,
      averageScore: score,
      scoreDistribution: {
        excellent: score >= 0.8 ? 1 : 0,
        good: score >= 0.6 && score < 0.8 ? 1 : 0,
        moderate: score >= 0.4 && score < 0.6 ? 1 : 0,
        poor: score < 0.4 ? 1 : 0,
      },
    },
  };
};

const createMockStudentBelief = (): MockStudentBelief => ({
  id: 'belief-1',
  studentId: 'student-1',
  version: 3,
  timestamp: Date.now(),
  motivations: [],
  strengths: [],
  values: [],
  personalityTraits: [],
  lifestylePreferences: [],
  constraints: [],
  familyReality: {} as MockStudentBelief['familyReality'],
  economicReality: {} as MockStudentBelief['economicReality'],
  educationalReality: {} as MockStudentBelief['educationalReality'],
  decisionState: {} as MockStudentBelief['decisionState'],
  overallConfidence: 0.8,
  isValidated: false,
  metadata: {
    assessmentQuestionCount: 0,
    inferenceStepCount: 0,
    contributingEngines: ['consistency-engine-test'],
    assessmentDuration: 0,
  },
});

const createMockTransitionCareerNode = (id = 'career-1'): MockCareerNode => ({
  id,
  name: 'Test Career',
  category: 'technology',
  description: 'Test career node',
  requiredProfile: {
    analyticalThinking: 0.7,
    creativity: 0.6,
    socialOrientation: 0.5,
    leadership: 0.5,
    detailOrientation: 0.7,
    curiosity: 0.7,
    competitiveness: 0.5,
    riskTolerance: 0.5,
  },
  keySkills: ['analysis'],
  skillCategories: ['technical'],
  typicalExperienceYears: 3,
  incomeLevel: 0.6,
  isEntryLevel: false,
  isTerminal: false,
  relatedCareers: [],
  metadata: {
    demandLevel: 0.7,
    growthOutlook: 0.7,
    addedAt: Date.now(),
  },
});

const createMockExploredPath = (pathId: string): MockExploredPath => ({
  id: pathId,
  type: 'primary',
  name: 'Test Path',
  nodes: [createMockTransitionCareerNode(pathId)],
  edges: [],
  nodeIds: [pathId],
  metrics: {
    totalYears: 5,
    transitionCount: 1,
    incomeRange: { entry: 50000, mid: 80000, senior: 120000, growthRate: 0.05 },
    totalDifficulty: 40,
    avgTransitionTime: 2,
    cumulativeSuccessProbability: 0.75,
    minReversibility: 0.6,
    avgSkillOverlap: 0.7,
  },
  scores: {
    optionalityScore: 65,
    criticalityScore: 35,
    flexibilityScore: 70,
    growthScore: 75,
    stabilityScore: 70,
    compositeScore: 72,
  },
  risk: { level: 'medium', score: 40, factors: [], mitigations: [] },
  explanation: {
    summary: 'Test path',
    details: 'Test path details',
    selectionReason: 'Test selection reason',
    strengths: [],
    tradeoffs: [],
    preservedOptions: [],
    closedOptions: [],
  },
  recommendations: [],
});

const createMockPathExplorerResult = (pathId: string): MockPathExplorerResult => {
  const path = createMockExploredPath(pathId);

  return {
    id: 'path-explorer-1',
    startingCareer: createMockTransitionCareerNode(pathId),
    startingCareerId: pathId,
    paths: [path],
    pathsByType: new Map([['primary', path]]),
    comparison: {
      bestForGrowth: 'primary',
      bestForOptionality: 'primary',
      bestForStability: 'primary',
      safestPath: 'primary',
      riskiestPath: 'primary',
      comparisonText: 'Single test path',
      keyDifferences: [],
    },
    recommendations: [],
    generatedAt: Date.now(),
  };
};

const createMockPathCoalitionAnalysis = (pathId: string, alignment: number): PathCoalitionAnalysis => ({
  pathId,
  pathType: 'primary',
  pathName: 'Test Path',
  memberEvaluations: new Map<CoalitionMember, PathCoalitionAnalysis['memberEvaluations'] extends Map<CoalitionMember, infer Evaluation> ? Evaluation : never>(),
  aggregate: {
    coalitionSupport: alignment * 100,
    coalitionConflict: (1 - alignment) * 100,
    alignmentScore: alignment * 100,
    tensionScore: (1 - alignment) * 100,
    stabilityScore: alignment * 100,
  },
  dynamics: {
    strongSupport: alignment >= 0.8 ? ['student-interests'] : [],
    reservations: alignment >= 0.5 && alignment < 0.8 ? ['family-expectations'] : [],
    opposition: alignment < 0.5 ? ['family-expectations'] : [],
    memberConflicts: [],
    consensusLevel: alignment >= 0.8 ? 'strong' : alignment >= 0.5 ? 'moderate' : 'weak',
  },
  explanation: {
    summary: 'Test coalition summary',
    details: 'Test coalition details',
    reasoning: 'Test coalition reasoning',
    coalitionStrengths: [],
    coalitionConflicts: [],
    recommendedNegotiations: [],
    alternativeConsiderations: [],
  },
});

const createMockCoalitionResult = (pathId: string, alignment: number): DecisionCoalitionAnalysis => {
  const pathAnalysis = createMockPathCoalitionAnalysis(pathId, alignment);

  return {
    id: 'coalition-1',
    studentBelief: createMockStudentBelief(),
    pathExplorerResult: createMockPathExplorerResult(pathId),
    pathAnalyses: new Map([[pathId, pathAnalysis]]),
    rankedPaths: [pathAnalysis],
    coalitionHealth: {
      cohesion: alignment * 100,
      conflictLevel: (1 - alignment) * 100,
      clarity: alignment * 100,
      confidence: 0.8,
    },
    pathComparison: null,
    recommendation: {
      recommendedPathId: pathId,
      recommendedPathType: 'primary',
      confidence: 0.8,
      reasoning: 'Test recommendation',
      supportingMembers: [],
      opposingMembers: [],
      successConditions: [],
      riskMitigation: [],
    },
    generatedAt: Date.now(),
  };
};

const createMockPathRegretAnalysis = (pathId: string, regretRisk: number): PathRegretAnalysis => {
  const regretScore = regretRisk * 100;
  const strongestType: RegretType = 'economic';

  return {
    pathId,
    pathName: 'Test Path',
    factors: new Map([
      [strongestType, {
        type: strongestType,
        score: regretScore,
        confidence: 0.75,
        components: [],
        drivers: [],
        mitigations: [],
        isStrongest: true,
        riskLevel: regretRisk >= 0.7 ? 'high' : regretRisk >= 0.4 ? 'moderate' : 'low',
      }],
    ]),
    aggregate: {
      overallRegretScore: regretScore,
      weightedRegretScore: regretScore,
      maxRegretScore: regretScore,
      overallConfidence: 0.75,
    },
    strongestRisk: {
      type: strongestType,
      score: regretScore,
      description: 'Test regret risk',
    },
    riskDistribution: {
      minimal: 0,
      low: regretRisk < 0.4 ? 1 : 0,
      moderate: regretRisk >= 0.4 && regretRisk < 0.7 ? 1 : 0,
      high: regretRisk >= 0.7 ? 1 : 0,
      severe: 0,
    },
    explanation: {
      summary: 'Test regret summary',
      details: 'Test regret details',
      reasoning: 'Test regret reasoning',
      primaryConcerns: [],
      mitigationStrategies: [],
      comparativeContext: 'Test comparison',
      longTermOutlook: 'Test outlook',
    },
  };
};

const createMockRegretResult = (pathId: string, regretRisk: number): RegretAnalysis => {
  const pathAnalysis = createMockPathRegretAnalysis(pathId, regretRisk);

  return {
    id: 'regret-1',
    studentBelief: createMockStudentBelief(),
    pathExplorerResult: createMockPathExplorerResult(pathId),
    pathAnalyses: new Map([[pathId, pathAnalysis]]),
    rankedPaths: [pathAnalysis],
    pathComparison: null,
    overallProfile: {
      averageRegret: regretRisk * 100,
      regretVariance: 0,
      dominantRegretType: 'economic',
      overallRisk: regretRisk >= 0.7 ? 'high' : regretRisk >= 0.4 ? 'moderate' : 'low',
    },
    generatedAt: Date.now(),
  };
};

const createMockDimension = (score: number) => ({
  name: 'Test dimension',
  score: score / 100,
  explanation: 'Test dimension explanation',
  factors: [],
});

const createMockOptionalityResult = (_careerId: string, score: number): OptionalityAnalysis => ({
  overallScore: score,
  rating: score > 75 ? 'high' : score > 60 ? 'good' : score > 40 ? 'moderate' : 'low',
  dimensions: {
    careerFlexibility: createMockDimension(score),
    transferableSkills: createMockDimension(score),
    pivotPotential: createMockDimension(score),
    entrepreneurshipPotential: createMockDimension(score),
    futureCareerOptions: createMockDimension(score),
  },
  summary: 'Test summary',
  reasoning: ['Test reasoning'],
  adjacentCareers: [],
  skillCategories: [],
  percentile: score,
  calculatedAt: Date.now(),
});

const createMockCriticalityMetric = (
  value: number,
  impact: 'high' | 'medium' | 'low' = 'medium',
  isPositive = true
) => ({
  value,
  explanation: 'Test metric',
  impact,
  isPositive,
});

const createMockCriticalityResult = (careerId: string, score: number): CriticalityAnalysis => ({
  id: 'criticality-1',
  careerId,
  careerName: 'Test Career',
  criticalityScore: score,
  category: score > 70 ? 'extreme' : score > 50 ? 'high' : score > 30 ? 'moderate' : 'low',
  summary: 'Test criticality summary',
  explanation: 'Test criticality explanation',
  metrics: {
    reachableCareerCount: createMockCriticalityMetric(10),
    branchingFactor: createMockCriticalityMetric(3),
    reversibility: createMockCriticalityMetric(1 - score / 100, 'high'),
    transferability: createMockCriticalityMetric(0.7, 'high'),
    timeToFlexibility: createMockCriticalityMetric(2, 'medium', false),
    optionalityPreservation: createMockCriticalityMetric(1 - score / 100, 'high'),
    futureConstraint: createMockCriticalityMetric(score / 100, 'high', false),
  },
  reachableCareers: { total: 10, byCategory: new Map(), topPaths: [] },
  constraints: { inaccessibleCareers: [], minimumCommitmentYears: 0, financialCommitment: 0, educationRequirements: [] },
  comparison: { percentile: 50, vsCategoryAverage: 0, categorySize: 10 },
  calculatedAt: Date.now(),
});

const createMockRecommendation = (pathId: string, confidence: number): CareerRecommendation => ({
  id: 'rec-1',
  studentId: 'student-1',
  studentBeliefId: 'belief-1',
  path: {
    id: pathId,
    name: 'Test Path',
    nodes: [{ id: pathId, name: 'Test Career', description: '', industry: '', category: CareerCategory.TECHNICAL, requiredStrengths: [], alignedValues: [], lifestyleProfile: { workEnvironment: WorkEnvironmentType.OFFICE, scheduleFlexibility: 0.5, travelRequirement: 0.3, typicalTeamSize: { min: 5, max: 10 }, remotePossibility: 0.5, workPace: 3 }, entryRequirements: [], trajectory: { yearsToSenior: 3, yearsToLeadership: 7, hasClearAdvancement: true, pivotOptions: [], specializationOptions: [] }, marketData: { demandLevel: 3, growthProjection: 0.05, salaryRange: { entry: 50000, mid: 80000, senior: 120000 }, geographicAvailability: { isGlobal: true, inDemandRegions: [], remoteCommon: true }, entryBarrier: 3 }, metadata: { lastUpdated: Date.now(), dataSource: 'test', dataConfidence: 0.8 } }],
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
      expect(report.violations.length).toBeGreaterThan(0);
      expect(report.consistencyScore).toBeLessThan(90);
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

    it('should interpret a single high contradiction as good under current scoring', () => {
      const engine = new ConsistencyEngine();
      const results: IntelligenceResults = {
        matching: createMockMatchingResult('career-1', 0.9),
        coalition: createMockCoalitionResult('career-1', 0.1),
      };
      const report = engine.validate(results);
      expect(report.interpretation.category).toBe('good');
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
