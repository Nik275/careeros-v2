/**
 * CareerOS Decision Coalition Engine V3 Tests
 *
 * Comprehensive test suite for multi-stakeholder decision modeling.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DecisionCoalitionEngineV3,
  analyzeDecisionCoalition,
  type DecisionCoalitionAnalysis,
  type PathCoalitionAnalysis,
  type CoalitionMember,
  type CoalitionAnalysisOptions,
} from '../index';
import type { StudentBeliefV3 } from '../../student-model';
import type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathMetrics,
  PathScores,
  PathExplanation,
  RiskAssessment,
  PathType,
} from '../../path-explorer';
import type { CareerNode, CareerEdge } from '../../career-transition-graph';
import type { OptionalityAnalysis } from '../../optionality-engine';
import type { CriticalityAnalysis } from '../../criticality-engine';

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

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

const createMockPathMetrics = (overrides: Partial<PathMetrics> = {}): PathMetrics => ({
  totalYears: 5,
  transitionCount: 2,
  incomeRange: {
    entry: 600000,
    mid: 1200000,
    senior: 2500000,
    growthRate: 150,
  },
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

const createMockRiskAssessment = (overrides: Partial<RiskAssessment> = {}): RiskAssessment => ({
  level: 'medium',
  score: 40,
  factors: [],
  mitigations: ['Maintain transferable skills'],
  ...overrides,
});

const createMockPathExplanation = (overrides: Partial<PathExplanation> = {}): PathExplanation => ({
  summary: 'Test path summary',
  details: 'Test path details',
  selectionReason: 'Selected for testing',
  strengths: ['Good growth', 'Stable path'],
  tradeoffs: ['Time investment required'],
  preservedOptions: ['Management', 'Consulting'],
  closedOptions: ['Research'],
  ...overrides,
});

const createMockExploredCareerPath = (
  overrides: Partial<ExploredCareerPath> & { id?: string; type?: PathType; name?: string } = {}
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
  risk: createMockRiskAssessment(overrides.risk),
  explanation: createMockPathExplanation(overrides.explanation),
  recommendations: ['Build skills', 'Network actively'],
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

const createMockStudentBeliefV3 = (overrides: Partial<StudentBeliefV3> = {}): StudentBeliefV3 => ({
  studentId: 'student-1',
  interests: {
    coreInterests: ['technology', 'design'],
    interestStrengths: new Map([['technology', 0.8], ['design', 0.7]]),
    topInterestCategories: ['technology', 'creative'],
  },
  values: {
    coreValues: ['impact', 'growth', 'flexibility'],
    valuePriorities: new Map([['impact', 0.9], ['growth', 0.8], ['flexibility', 0.7]]),
    topValueCategories: ['purpose', 'development'],
  },
  constraints: {
    geographic: {
      willingToRelocate: true,
      preferredLocation: 'urban',
      openToRemote: true,
    },
    academicFeasibility: 'high',
  },
  confidence: 0.8,
  lastUpdated: Date.now(),
  ...overrides,
} as StudentBeliefV3);

// ============================================================================
// DECISION COALITION ENGINE V3 TESTS
// ============================================================================

describe('DecisionCoalitionEngineV3', () => {
  let studentBelief: StudentBeliefV3;
  let pathExplorerResult: CareerPathExplorerResult;
  let engine: DecisionCoalitionEngineV3;

  beforeEach(() => {
    studentBelief = createMockStudentBeliefV3();
    pathExplorerResult = createMockCareerPathExplorerResult();
    engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
  });

  describe('analyze', () => {
    it('should analyze coalition for all paths', () => {
      const result = engine.analyze();

      expect(result).toBeDefined();
      expect(result.id).toContain('coalition');
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

    it('should rank paths by coalition stability', () => {
      const result = engine.analyze();

      expect(result.rankedPaths.length).toBeGreaterThan(0);

      // Check ranking is sorted by stability
      for (let i = 1; i < result.rankedPaths.length; i++) {
        expect(result.rankedPaths[i - 1].aggregate.stabilityScore).toBeGreaterThanOrEqual(
          result.rankedPaths[i].aggregate.stabilityScore
        );
      }
    });

    it('should include coalition health metrics', () => {
      const result = engine.analyze();

      expect(result.coalitionHealth).toBeDefined();
      expect(result.coalitionHealth.cohesion).toBeGreaterThanOrEqual(0);
      expect(result.coalitionHealth.cohesion).toBeLessThanOrEqual(100);
      expect(result.coalitionHealth.confidence).toBeGreaterThanOrEqual(0);
      expect(result.coalitionHealth.confidence).toBeLessThanOrEqual(1);
    });

    it('should include recommendation', () => {
      const result = engine.analyze();

      expect(result.recommendation).toBeDefined();
      expect(result.recommendation.recommendedPathId).toBeDefined();
      expect(result.recommendation.reasoning).toBeTruthy();
      expect(result.recommendation.supportingMembers).toBeInstanceOf(Array);
      expect(result.recommendation.opposingMembers).toBeInstanceOf(Array);
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

  describe('Coalition Members', () => {
    it('should evaluate all 7 coalition members', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const expectedMembers: CoalitionMember[] = [
        'student-interests',
        'student-values',
        'family-expectations',
        'economic-reality',
        'educational-reality',
        'geographic-reality',
        'future-opportunity-preservation',
      ];

      expectedMembers.forEach(member => {
        expect(firstPath.memberEvaluations.has(member)).toBe(true);
      });
    });

    it('should calculate support scores for each member', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.memberEvaluations.forEach((evaluation, member) => {
        expect(evaluation.supportScore).toBeGreaterThanOrEqual(0);
        expect(evaluation.supportScore).toBeLessThanOrEqual(100);
        expect(evaluation.member).toBe(member);
      });
    });

    it('should calculate conflict scores for each member', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.memberEvaluations.forEach(evaluation => {
        expect(evaluation.conflictScore).toBeGreaterThanOrEqual(-100);
        expect(evaluation.conflictScore).toBeLessThanOrEqual(100);
      });
    });

    it('should include member concerns and endorsements', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      firstPath.memberEvaluations.forEach(evaluation => {
        expect(evaluation.concerns).toBeInstanceOf(Array);
        expect(evaluation.endorsements).toBeInstanceOf(Array);
      });
    });
  });

  describe('Aggregate Scores', () => {
    it('should calculate coalition support score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.coalitionSupport).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.coalitionSupport).toBeLessThanOrEqual(100);
    });

    it('should calculate coalition conflict score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.coalitionConflict).toBeGreaterThanOrEqual(-100);
      expect(firstPath.aggregate.coalitionConflict).toBeLessThanOrEqual(100);
    });

    it('should calculate alignment score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.alignmentScore).toBeLessThanOrEqual(100);
    });

    it('should calculate tension score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.tensionScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.tensionScore).toBeLessThanOrEqual(100);
    });

    it('should calculate stability score', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.aggregate.stabilityScore).toBeGreaterThanOrEqual(0);
      expect(firstPath.aggregate.stabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Coalition Dynamics', () => {
    it('should categorize members by support level', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.dynamics.strongSupport).toBeInstanceOf(Array);
      expect(firstPath.dynamics.reservations).toBeInstanceOf(Array);
      expect(firstPath.dynamics.opposition).toBeInstanceOf(Array);
    });

    it('should determine consensus level', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(['unanimous', 'strong', 'moderate', 'weak', 'fractured']).toContain(
        firstPath.dynamics.consensusLevel
      );
    });

    it('should identify member conflicts', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.dynamics.memberConflicts).toBeInstanceOf(Array);

      firstPath.dynamics.memberConflicts.forEach(conflict => {
        expect(conflict.memberA).toBeDefined();
        expect(conflict.memberB).toBeDefined();
        expect(conflict.severity).toBeGreaterThanOrEqual(0);
        expect(conflict.severity).toBeLessThanOrEqual(100);
        expect(conflict.resolutionStrategies).toBeInstanceOf(Array);
      });
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

    it('should identify coalition strengths', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.coalitionStrengths).toBeInstanceOf(Array);
    });

    it('should identify coalition conflicts', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.coalitionConflicts).toBeInstanceOf(Array);
    });

    it('should provide negotiation recommendations', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.recommendedNegotiations).toBeInstanceOf(Array);
    });

    it('should suggest alternative considerations', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      expect(firstPath.explanation.alternativeConsiderations).toBeInstanceOf(Array);
    });
  });

  describe('Member Evaluations', () => {
    it('should evaluate student interests', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('student-interests');
      expect(evaluation).toBeDefined();
      expect(evaluation?.supportScore).toBeGreaterThanOrEqual(0);
    });

    it('should evaluate student values', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('student-values');
      expect(evaluation).toBeDefined();
    });

    it('should evaluate family expectations', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('family-expectations');
      expect(evaluation).toBeDefined();
    });

    it('should evaluate economic reality', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('economic-reality');
      expect(evaluation).toBeDefined();
    });

    it('should evaluate educational reality', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('educational-reality');
      expect(evaluation).toBeDefined();
    });

    it('should evaluate geographic reality', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('geographic-reality');
      expect(evaluation).toBeDefined();
    });

    it('should evaluate future opportunity preservation', () => {
      const result = engine.analyze();
      const firstPath = result.rankedPaths[0];

      const evaluation = firstPath.memberEvaluations.get('future-opportunity-preservation');
      expect(evaluation).toBeDefined();
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  it('should analyze coalition using factory function', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();

    const result = analyzeDecisionCoalition(studentBelief, pathExplorerResult);

    expect(result).toBeDefined();
    expect(result.pathAnalyses.size).toBeGreaterThan(0);
  });

  it('should accept optional results maps', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const optionalityResults = new Map<string, OptionalityAnalysis>();
    const criticalityResults = new Map<string, CriticalityAnalysis>();

    const result = analyzeDecisionCoalition(
      studentBelief,
      pathExplorerResult,
      optionalityResults,
      criticalityResults
    );

    expect(result).toBeDefined();
  });
});

// ============================================================================
// REALISTIC SCENARIOS
// ============================================================================

describe('Realistic Scenarios', () => {
  it('should model design vs engineering conflict', () => {
    // Student prefers design, family prefers engineering
    const studentBelief = createMockStudentBeliefV3({
      interests: {
        coreInterests: ['design', 'creative'],
        interestStrengths: new Map([['design', 0.9]]),
        topInterestCategories: ['creative'],
      },
      values: {
        coreValues: ['creativity', 'impact'],
        valuePriorities: new Map([['creativity', 0.9]]),
        topValueCategories: ['creative'],
      },
    });

    const paths = [
      createMockExploredCareerPath({
        id: 'design-path',
        type: 'high-optionality',
        name: 'Design Path',
        nodes: [
          createMockCareerNode({ id: 'designer', name: 'Designer', category: 'creative', incomeLevel: 0.4 }),
          createMockCareerNode({ id: 'senior-designer', name: 'Senior Designer', category: 'creative', incomeLevel: 0.5 }),
        ],
        scores: createMockPathScores({ optionalityScore: 80, growthScore: 60 }),
      }),
      createMockExploredCareerPath({
        id: 'engineering-path',
        type: 'primary',
        name: 'Engineering Path',
        nodes: [
          createMockCareerNode({ id: 'eng', name: 'Engineer', category: 'engineering', incomeLevel: 0.6 }),
          createMockCareerNode({ id: 'senior-eng', name: 'Senior Engineer', category: 'engineering', incomeLevel: 0.8 }),
        ],
        scores: createMockPathScores({ optionalityScore: 60, growthScore: 80, stabilityScore: 80 }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });
    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
    const result = engine.analyze();

    expect(result.pathAnalyses.size).toBe(2);

    // Check that conflicts are identified
    const comparison = result.pathComparison;
    expect(comparison).toBeDefined();
  });

  it('should handle strong coalition alignment', () => {
    // All members aligned
    const studentBelief = createMockStudentBeliefV3({
      interests: {
        coreInterests: ['engineering', 'technology'],
        interestStrengths: new Map([['engineering', 0.9]]),
        topInterestCategories: ['technical'],
      },
      values: {
        coreValues: ['stability', 'growth'],
        valuePriorities: new Map([['stability', 0.9]]),
        topValueCategories: ['security'],
      },
    });

    const paths = [
      createMockExploredCareerPath({
        id: 'stable-eng',
        type: 'primary',
        name: 'Stable Engineering Path',
        scores: createMockPathScores({ stabilityScore: 90, optionalityScore: 70 }),
        risk: createMockRiskAssessment({ level: 'low', score: 20 }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });
    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
    const result = engine.analyze();

    const firstPath = result.rankedPaths[0];
    expect(firstPath.dynamics.consensusLevel).toMatch(/unanimous|strong/);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty paths', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult({ paths: [] });

    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
    const result = engine.analyze();

    expect(result.pathAnalyses.size).toBe(0);
    expect(result.rankedPaths.length).toBe(0);
  });

  it('should handle single path', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult({
      paths: [createMockExploredCareerPath()],
    });

    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
    const result = engine.analyze();

    expect(result.pathComparison).toBeNull();
    expect(result.rankedPaths.length).toBe(1);
  });

  it('should be deterministic', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();

    const engine1 = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);
    const engine2 = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);

    const result1 = engine1.analyze();
    const result2 = engine2.analyze();

    expect(result1.rankedPaths.length).toBe(result2.rankedPaths.length);
    expect(result1.coalitionHealth.cohesion).toBe(result2.coalitionHealth.cohesion);
  });

  it('should handle paths with no nodes', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult({
      paths: [
        createMockExploredCareerPath({ nodes: [], edges: [], nodeIds: [] }),
      ],
    });

    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);

    expect(() => engine.analyze()).not.toThrow();
  });
});

// ============================================================================
// OPTIONS TESTS
// ============================================================================

describe('Coalition Analysis Options', () => {
  it('should accept custom member weights', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);

    const options: CoalitionAnalysisOptions = {
      memberWeights: {
        'student-interests': 0.5,
        'family-expectations': 0.1,
      },
    };

    const result = engine.analyze(options);

    expect(result).toBeDefined();
    expect(result.pathAnalyses.size).toBeGreaterThan(0);
  });

  it('should handle different analysis depths', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const engine = new DecisionCoalitionEngineV3(studentBelief, pathExplorerResult);

    const depths: Array<'surface' | 'moderate' | 'deep'> = ['surface', 'moderate', 'deep'];

    depths.forEach(depth => {
      const result = engine.analyze({ depth });
      expect(result).toBeDefined();
    });
  });
});
