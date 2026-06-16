/**
 * CareerOS Regret Functional V2 Tests
 *
 * Comprehensive test suite for regret risk estimation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  RegretFunctionalV2,
  analyzeRegret,
  type RegretAnalysis,
  type PathRegretAnalysis,
  type RegretType,
  type RegretAnalysisOptions,
} from '../index';
import type { StudentBeliefV3 } from '../../student-model';
import type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathMetrics,
  PathScores,
  PathExplanation,
  RiskAssessment,
} from '../../path-explorer';
import type { DecisionCoalitionAnalysis, PathCoalitionAnalysis } from '../../decision-coalition-v3';
import { CareerTransitionGraphV1, type CareerNode, type CareerEdge } from '../../career-transition-graph';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

type LegacyRegretStudentBeliefOverrides = {
  interests?: { coreInterests?: string[]; interestStrengths?: Map<string, number>; topInterestCategories?: string[] } | string[];
  values?: { coreValues?: string[]; valuePriorities?: Map<string, number>; topValueCategories?: string[] } | Array<{ name?: string } | string>;
  profile?: Partial<CareerNode['requiredProfile']> & { age?: number };
};

const createMockCareerNode = (overrides: Partial<CareerNode> & { id?: string; name?: string } = {}): CareerNode => ({
  id: overrides.id || 'test-node',
  name: overrides.name || 'Test Node',
  category: overrides.category || 'technology',
  description: 'Test node description',
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
  financialCost: { min: 0, max: 200000, typical: 50000 },
  metadata: { frequency: 'common', confidence: 0.8, addedAt: Date.now() },
  ...overrides,
});

const createMockPathMetrics = (overrides: Partial<PathMetrics> = {}): PathMetrics => ({
  totalYears: 5,
  transitionCount: 2,
  incomeRange: { entry: 600000, mid: 1200000, senior: 2500000, growthRate: 150 },
  totalDifficulty: 100,
  avgTransitionTime: 2.5,
  cumulativeSuccessProbability: 0.6,
  minReversibility: 0.4,
  avgSkillOverlap: 0.6,
  ...overrides,
});

const createMockPathScores = (overrides: Partial<PathScores> = {}): PathScores => ({
  optionalityScore: 65,
  criticalityScore: 45,
  flexibilityScore: 70,
  growthScore: 75,
  stabilityScore: 60,
  compositeScore: 67,
  ...overrides,
});

const createMockExploredCareerPath = (
  overrides: Partial<ExploredCareerPath> & { id?: string } = {}
): ExploredCareerPath => ({
  id: overrides.id || 'test-path-1',
  type: overrides.type || 'primary',
  name: overrides.name || 'Test Path',
  nodes: overrides.nodes || [
    createMockCareerNode({ id: 'se', name: 'Software Engineer', incomeLevel: 0.4 }),
    createMockCareerNode({ id: 'sse', name: 'Senior SE', incomeLevel: 0.6 }),
  ],
  edges: overrides.edges || [
    createMockCareerEdge({ id: 'se-sse', fromNodeId: 'se', toNodeId: 'sse' }),
  ],
  nodeIds: overrides.nodeIds || ['se', 'sse'],
  metrics: createMockPathMetrics(overrides.metrics),
  scores: createMockPathScores(overrides.scores),
  risk: { level: 'medium', score: 40, factors: [], mitigations: [] },
  explanation: {
    summary: 'Test path',
    details: 'Details',
    selectionReason: 'Reason',
    strengths: ['Strength'],
    tradeoffs: ['Tradeoff'],
    preservedOptions: ['Option'],
    closedOptions: [],
    ...overrides.explanation,
  },
  recommendations: ['Recommendation'],
  ...overrides,
});

const createMockCareerPathExplorerResult = (
  overrides: Partial<CareerPathExplorerResult> = {}
): CareerPathExplorerResult => ({
  id: 'explorer-test',
  startingCareer: createMockCareerNode({ id: 'se', name: 'Software Engineer' }),
  startingCareerId: 'se',
  paths: overrides.paths || [
    createMockExploredCareerPath({ id: 'path-1', type: 'primary', name: 'Primary Path' }),
    createMockExploredCareerPath({ id: 'path-2', type: 'high-growth', name: 'High Growth Path' }),
  ],
  pathsByType: new Map(),
  comparison: {
    bestForGrowth: 'high-growth',
    bestForOptionality: 'primary',
    bestForStability: 'primary',
    safestPath: 'primary',
    riskiestPath: 'high-growth',
    comparisonText: 'Comparison text',
    keyDifferences: [],
  },
  recommendations: [],
  generatedAt: Date.now(),
  ...overrides,
});

const createMockStudentBeliefV3 = (
  overrides: Omit<Partial<StudentBeliefV3>, 'interests' | 'values'> & LegacyRegretStudentBeliefOverrides = {}
): StudentBeliefV3 => ({
  studentId: 'student-1',
  interests: {
    coreInterests: ['technology', 'engineering'],
    interestStrengths: new Map([['technology', 0.8], ['engineering', 0.7]]),
    topInterestCategories: ['technical'],
  },
  values: {
    coreValues: ['growth', 'impact', 'stability'],
    valuePriorities: new Map([['growth', 0.9], ['impact', 0.7], ['stability', 0.8]]),
    topValueCategories: ['development'],
  },
  profile: {
    analyticalThinking: 0.8,
    creativity: 0.6,
    socialOrientation: 0.5,
    leadership: 0.6,
    detailOrientation: 0.7,
    curiosity: 0.8,
    riskTolerance: 0.5,
    age: 22,
  },
  constraints: {
    geographic: { willingToRelocate: true, preferredLocation: 'urban', openToRemote: true },
  },
  confidence: 0.8,
  lastUpdated: Date.now(),
  ...overrides,
} as unknown as StudentBeliefV3);

// ============================================================================
// REGRET FUNCTIONAL V2 TESTS
// ============================================================================

describe('RegretFunctionalV2', () => {
  let studentBelief: StudentBeliefV3;
  let pathExplorerResult: CareerPathExplorerResult;
  let graph: CareerTransitionGraphV1;
  let engine: RegretFunctionalV2;

  beforeEach(() => {
    studentBelief = createMockStudentBeliefV3();
    pathExplorerResult = createMockCareerPathExplorerResult();
    graph = new CareerTransitionGraphV1();

    // Set up graph with nodes
    graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));
    graph.addNode(createMockCareerNode({ id: 'sse', name: 'Senior SE' }));
    graph.addNode(createMockCareerNode({ id: 'designer', name: 'Designer', category: 'creative' }));

    engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
  });

  describe('analyze', () => {
    it('should analyze regret for all paths', () => {
      const result = engine.analyze();

      expect(result).toBeDefined();
      expect(result.id).toContain('regret');
      expect(result.studentBelief).toBe(studentBelief);
      expect(result.pathExplorerResult).toBe(pathExplorerResult);
    });

    it('should include analysis for each path', () => {
      const result = engine.analyze();

      expect(result.pathAnalyses.size).toBe(pathExplorerResult.paths.length);

      pathExplorerResult.paths.forEach(path => {
        expect(result.pathAnalyses.has(path.id)).toBe(true);
      });
    });

    it('should rank paths by regret (lowest first)', () => {
      const result = engine.analyze();

      expect(result.rankedPaths.length).toBeGreaterThan(0);

      // Check ranking is sorted by regret (ascending)
      for (let i = 1; i < result.rankedPaths.length; i++) {
        expect(result.rankedPaths[i - 1].aggregate.overallRegretScore).toBeLessThanOrEqual(
          result.rankedPaths[i].aggregate.overallRegretScore
        );
      }
    });

    it('should include overall profile', () => {
      const result = engine.analyze();

      expect(result.overallProfile).toBeDefined();
      expect(result.overallProfile.averageRegret).toBeGreaterThanOrEqual(0);
      expect(result.overallProfile.averageRegret).toBeLessThanOrEqual(100);
      expect(result.overallProfile.overallRisk).toMatch(/minimal|low|moderate|high|severe/);
    });

    it('should include path comparison when multiple paths exist', () => {
      const result = engine.analyze();

      if (pathExplorerResult.paths.length >= 2) {
        expect(result.pathComparison).toBeDefined();
        expect(result.pathComparison?.comparisonText).toBeTruthy();
      }
    });

    it('should include timestamp', () => {
      const result = engine.analyze();

      expect(result.generatedAt).toBeGreaterThan(0);
      expect(result.generatedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Regret Factors', () => {
    it('should calculate all 6 regret types', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const expectedTypes: RegretType[] = [
        'action', 'inaction', 'optionality-loss', 'identity', 'economic', 'coalition'
      ];

      expectedTypes.forEach(type => {
        expect(firstPath.factors.has(type)).toBe(true);
      });
    });

    it('should calculate action regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const actionRegret = firstPath.factors.get('action');
      expect(actionRegret).toBeDefined();
      expect(actionRegret?.score).toBeGreaterThanOrEqual(0);
      expect(actionRegret?.score).toBeLessThanOrEqual(100);
      expect(actionRegret?.type).toBe('action');
    });

    it('should calculate inaction regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const inactionRegret = firstPath.factors.get('inaction');
      expect(inactionRegret).toBeDefined();
      expect(inactionRegret?.score).toBeGreaterThanOrEqual(0);
      expect(inactionRegret?.score).toBeLessThanOrEqual(100);
    });

    it('should calculate optionality loss regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const optionalityRegret = firstPath.factors.get('optionality-loss');
      expect(optionalityRegret).toBeDefined();
      expect(optionalityRegret?.score).toBeGreaterThanOrEqual(0);
      expect(optionalityRegret?.score).toBeLessThanOrEqual(100);
    });

    it('should calculate identity regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const identityRegret = firstPath.factors.get('identity');
      expect(identityRegret).toBeDefined();
      expect(identityRegret?.score).toBeGreaterThanOrEqual(0);
      expect(identityRegret?.score).toBeLessThanOrEqual(100);
    });

    it('should calculate economic regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const economicRegret = firstPath.factors.get('economic');
      expect(economicRegret).toBeDefined();
      expect(economicRegret?.score).toBeGreaterThanOrEqual(0);
      expect(economicRegret?.score).toBeLessThanOrEqual(100);
    });

    it('should calculate coalition regret', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const coalitionRegret = firstPath.factors.get('coalition');
      expect(coalitionRegret).toBeDefined();
      expect(coalitionRegret?.score).toBeGreaterThanOrEqual(0);
      expect(coalitionRegret?.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Regret Components', () => {
    it('should include components for each regret factor', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.factors.forEach(factor => {
        expect(factor.components).toBeInstanceOf(Array);
        expect(factor.components.length).toBeGreaterThan(0);

        factor.components.forEach(component => {
          expect(component.name).toBeTruthy();
          expect(component.weight).toBeGreaterThan(0);
          expect(component.weight).toBeLessThanOrEqual(1);
          expect(component.source).toBeTruthy();
        });
      });
    });

    it('should include drivers for each factor', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.factors.forEach(factor => {
        expect(factor.drivers).toBeInstanceOf(Array);
      });
    });

    it('should include mitigations for each factor', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.factors.forEach(factor => {
        expect(factor.mitigations).toBeInstanceOf(Array);
      });
    });

    it('should assign risk levels', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.factors.forEach(factor => {
        expect(['minimal', 'low', 'moderate', 'high', 'severe']).toContain(factor.riskLevel);
      });
    });
  });

  describe('Aggregate Scores', () => {
    it('should calculate overall regret score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.overallRegretScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.overallRegretScore).toBeLessThanOrEqual(100);
    });

    it('should calculate weighted regret score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.weightedRegretScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.weightedRegretScore).toBeLessThanOrEqual(100);
    });

    it('should calculate max regret score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.maxRegretScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.maxRegretScore).toBeLessThanOrEqual(100);
    });

    it('should calculate overall confidence', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.overallConfidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Strongest Risk', () => {
    it('should identify strongest regret risk', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.strongestRisk).toBeDefined();
      expect(firstPath.strongestRisk.type).toBeDefined();
      expect(firstPath.strongestRisk.score).toBeGreaterThanOrEqual(0);
      expect(firstPath.strongestRisk.description).toBeTruthy();
    });

    it('should mark the strongest factor as isStrongest', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const strongestType = firstPath.strongestRisk.type;
      const strongestFactor = firstPath.factors.get(strongestType);

      expect(strongestFactor?.isStrongest).toBe(true);
    });
  });

  describe('Risk Distribution', () => {
    it('should calculate risk distribution', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.riskDistribution).toBeDefined();
      expect(firstPath.riskDistribution.minimal).toBeGreaterThanOrEqual(0);
      expect(firstPath.riskDistribution.low).toBeGreaterThanOrEqual(0);
      expect(firstPath.riskDistribution.moderate).toBeGreaterThanOrEqual(0);
      expect(firstPath.riskDistribution.high).toBeGreaterThanOrEqual(0);
      expect(firstPath.riskDistribution.severe).toBeGreaterThanOrEqual(0);
    });

    it('should have distribution sum to total factors', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const sum = firstPath.riskDistribution.minimal +
        firstPath.riskDistribution.low +
        firstPath.riskDistribution.moderate +
        firstPath.riskDistribution.high +
        firstPath.riskDistribution.severe;

      expect(sum).toBe(firstPath.factors.size);
    });
  });

  describe('Explainability', () => {
    it('should generate summary', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.summary).toBeTruthy();
      expect(firstPath.explanation.summary.length).toBeGreaterThan(0);
    });

    it('should generate details', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.details).toBeTruthy();
      expect(firstPath.explanation.details.length).toBeGreaterThan(0);
    });

    it('should generate reasoning', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.reasoning).toBeTruthy();
      expect(firstPath.explanation.reasoning.length).toBeGreaterThan(0);
    });

    it('should identify primary concerns', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.primaryConcerns).toBeInstanceOf(Array);
    });

    it('should provide mitigation strategies', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.mitigationStrategies).toBeInstanceOf(Array);
      expect(firstPath.explanation.mitigationStrategies.length).toBeGreaterThan(0);
    });

    it('should provide comparative context', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.comparativeContext).toBeTruthy();
    });

    it('should provide long-term outlook', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.longTermOutlook).toBeTruthy();
    });
  });

  describe('Overall Profile', () => {
    it('should calculate average regret', () => {
      const result = engine.analyze();

      expect(result.overallProfile.averageRegret).toBeGreaterThanOrEqual(0);
      expect(result.overallProfile.averageRegret).toBeLessThanOrEqual(100);
    });

    it('should calculate regret variance', () => {
      const result = engine.analyze();

      expect(result.overallProfile.regretVariance).toBeGreaterThanOrEqual(0);
    });

    it('should identify dominant regret type', () => {
      const result = engine.analyze();

      expect(result.overallProfile.dominantRegretType).toBeDefined();
    });

    it('should assess overall risk', () => {
      const result = engine.analyze();

      expect(['minimal', 'low', 'moderate', 'high', 'severe']).toContain(
        result.overallProfile.overallRisk
      );
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  it('should analyze regret using factory function', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const result = analyzeRegret(studentBelief, pathExplorerResult, graph);

    expect(result).toBeDefined();
    expect(result.pathAnalyses.size).toBeGreaterThan(0);
  });

  it('should accept coalition analysis', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const result = analyzeRegret(studentBelief, pathExplorerResult, graph, undefined);

    expect(result).toBeDefined();
  });
});

// ============================================================================
// REALISTIC SCENARIOS
// ============================================================================

describe('Realistic Scenarios', () => {
  it('should detect high identity regret when interests misaligned', () => {
    const studentBelief = createMockStudentBeliefV3({
      interests: {
        coreInterests: ['art', 'design', 'creative'],
        interestStrengths: new Map([['art', 0.9], ['design', 0.8]]),
        topInterestCategories: ['creative'],
      },
      values: {
        coreValues: ['creativity', 'expression'],
        valuePriorities: new Map([['creativity', 0.9]]),
        topValueCategories: ['creative'],
      },
    });

    const paths = [
      createMockExploredCareerPath({
        id: 'engineering-path',
        name: 'Engineering Path',
        nodes: [
          createMockCareerNode({ id: 'eng', name: 'Engineer', category: 'engineering' }),
        ],
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });
    const graph = new CareerTransitionGraphV1();
    graph.addNode(createMockCareerNode({ id: 'eng', name: 'Engineer', category: 'engineering' }));

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const result = engine.analyze();

    const pathAnalysis = result.pathAnalyses.get('engineering-path');
    const identityRegret = pathAnalysis?.factors.get('identity');

    expect(identityRegret?.score).toBeGreaterThan(30);
  });

  it('should detect high economic regret for low-income paths', () => {
    const studentBelief = createMockStudentBeliefV3();

    const paths = [
      createMockExploredCareerPath({
        id: 'low-income-path',
        name: 'Low Income Path',
        metrics: createMockPathMetrics({
          incomeRange: { entry: 200000, mid: 400000, senior: 600000, growthRate: 20 },
        }),
      }),
      createMockExploredCareerPath({
        id: 'high-income-path',
        name: 'High Income Path',
        metrics: createMockPathMetrics({
          incomeRange: { entry: 800000, mid: 1500000, senior: 3000000, growthRate: 200 },
        }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const result = engine.analyze();

    const lowIncomeAnalysis = result.pathAnalyses.get('low-income-path');
    const highIncomeAnalysis = result.pathAnalyses.get('high-income-path');

    expect(lowIncomeAnalysis?.factors.get('economic')?.score).toBeGreaterThan(
      highIncomeAnalysis?.factors.get('economic')?.score || 0
    );
  });

  it('should detect high action regret for low probability paths', () => {
    const studentBelief = createMockStudentBeliefV3();

    const paths = [
      createMockExploredCareerPath({
        id: 'high-risk-path',
        name: 'High Risk Path',
        metrics: createMockPathMetrics({
          cumulativeSuccessProbability: 0.3,
          minReversibility: 0.2,
        }),
      }),
      createMockExploredCareerPath({
        id: 'safe-path',
        name: 'Safe Path',
        metrics: createMockPathMetrics({
          cumulativeSuccessProbability: 0.9,
          minReversibility: 0.7,
        }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const result = engine.analyze();

    const highRiskAnalysis = result.pathAnalyses.get('high-risk-path');
    const safeAnalysis = result.pathAnalyses.get('safe-path');

    expect(highRiskAnalysis?.factors.get('action')?.score).toBeGreaterThan(
      safeAnalysis?.factors.get('action')?.score || 0
    );
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty paths', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult({ paths: [] });
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const result = engine.analyze();

    expect(result.pathAnalyses.size).toBe(0);
    expect(result.rankedPaths.length).toBe(0);
  });

  it('should handle single path', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult({
      paths: [createMockExploredCareerPath()],
    });
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const result = engine.analyze();

    expect(result.pathComparison).toBeNull();
    expect(result.rankedPaths.length).toBe(1);
  });

  it('should be deterministic', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const engine1 = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);
    const engine2 = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);

    const result1 = engine1.analyze();
    const result2 = engine2.analyze();

    expect(result1.rankedPaths.length).toBe(result2.rankedPaths.length);
    expect(result1.overallProfile.averageRegret).toBe(result2.overallProfile.averageRegret);
  });

  it('should handle missing student profile gracefully', () => {
    const studentBelief = createMockStudentBeliefV3({
      profile: undefined,
    });

    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);

    expect(() => engine.analyze()).not.toThrow();
  });

  it('should handle missing student interests gracefully', () => {
    const studentBelief = createMockStudentBeliefV3({
      interests: undefined,
    });

    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);

    expect(() => engine.analyze()).not.toThrow();
  });
});

// ============================================================================
// OPTIONS TESTS
// ============================================================================

describe('Regret Analysis Options', () => {
  it('should accept custom regret weights', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);

    const options: RegretAnalysisOptions = {
      regretWeights: {
        'identity': 0.5,
        'economic': 0.1,
      },
    };

    const result = engine.analyze(options);

    expect(result).toBeDefined();
    expect(result.pathAnalyses.size).toBeGreaterThan(0);
  });

  it('should respect time horizon', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const graph = new CareerTransitionGraphV1();

    const engine = new RegretFunctionalV2(studentBelief, pathExplorerResult, graph);

    const options: RegretAnalysisOptions = {
      timeHorizon: 5,
    };

    const result = engine.analyze(options);

    expect(result).toBeDefined();
  });
});
