/**
 * CareerOS Decision Intelligence Engine V1 Tests
 *
 * Comprehensive test suite for synthesizing all intelligence layers into decisions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DecisionIntelligenceEngineV1,
  generateDecision,
  type DecisionIntelligenceOptions,
} from '../index';
import type { StudentBeliefV3 } from '../../student-model';
import type {
  CareerPathExplorerResult,
  ExploredCareerPath,
  PathMetrics,
  PathScores,
} from '../../path-explorer';
import type { RegretAnalysis, PathRegretAnalysis, RegretFactor, RegretType } from '../../regret-functional';
import type {
  CoalitionMember,
  CoalitionMemberEvaluation,
  DecisionCoalitionAnalysis,
  PathCoalitionAnalysis,
} from '../../decision-coalition-v3';
import { CareerTransitionGraphV1, type CareerNode } from '../../career-transition-graph';

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

const createMockPathMetrics = (overrides: Partial<PathMetrics> = {}): PathMetrics => ({
  totalYears: 5,
  transitionCount: 2,
  incomeRange: { entry: 600000, mid: 1200000, senior: 2500000, growthRate: 150 },
  totalDifficulty: 100,
  avgTransitionTime: 2.5,
  cumulativeSuccessProbability: 0.7,
  minReversibility: 0.5,
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
  ],
  edges: overrides.edges || [],
  nodeIds: overrides.nodeIds || ['se'],
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
    bestForOptionality: 'high-optionality',
    bestForStability: 'balanced',
    safestPath: 'low-risk',
    riskiestPath: 'high-growth',
    comparisonText: 'Comparison text',
    keyDifferences: [],
  },
  recommendations: [],
  generatedAt: Date.now(),
  ...overrides,
});

type StudentBeliefV3FixtureOverrides = Partial<StudentBeliefV3> & {
  interests?: {
    coreInterests: string[];
    interestStrengths: Map<string, number>;
    topInterestCategories: string[];
  };
};

const createMockStudentBeliefV3 = (
  overrides: StudentBeliefV3FixtureOverrides = {}
): StudentBeliefV3 => ({
  studentId: 'student-1',
  interests: {
    coreInterests: ['technology', 'engineering'],
    interestStrengths: new Map([['technology', 0.8], ['engineering', 0.7]]),
    topInterestCategories: ['technical'],
  },
  values: [
    {
      id: 'value_growth',
      name: 'Growth',
      description: 'Continuous learning and development',
      importance: 0.9,
      evidence: [],
      isNonNegotiable: false,
    },
    {
      id: 'value_impact',
      name: 'Impact',
      description: 'Meaningful contribution',
      importance: 0.7,
      evidence: [],
      isNonNegotiable: false,
    },
    {
      id: 'value_stability',
      name: 'Stability',
      description: 'Predictable and stable career foundation',
      importance: 0.8,
      evidence: [],
      isNonNegotiable: false,
    },
  ],
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
} as StudentBeliefV3);

// Helper to create mock factors
const createMockFactors = (
  regretScore = 35,
  strongestType: RegretType = 'economic'
): Map<RegretType, RegretFactor> => new Map<RegretType, RegretFactor>([
  ['action', { type: 'action' as const, score: 30, confidence: 0.8, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: false }],
  ['inaction', { type: 'inaction' as const, score: 40, confidence: 0.7, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: false }],
  ['optionality-loss', { type: 'optionality-loss' as const, score: 35, confidence: 0.75, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: false }],
  ['identity', { type: 'identity' as const, score: 25, confidence: 0.85, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: false }],
  ['economic', { type: 'economic' as const, score: regretScore, confidence: 0.7, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: strongestType === 'economic' }],
  ['coalition', { type: 'coalition' as const, score: 30, confidence: 0.75, riskLevel: 'low' as const, components: [], drivers: [], mitigations: [], isStrongest: false }],
]);

const createMockPathRegretAnalysis = (
  overrides: Partial<PathRegretAnalysis> & { pathId?: string } = {}
): PathRegretAnalysis => ({
  pathId: overrides.pathId || 'test-path',
  pathName: overrides.pathName || 'Test Path',
  factors: overrides.factors || createMockFactors(),
  aggregate: {
    overallRegretScore: 35,
    weightedRegretScore: 32,
    maxRegretScore: 45,
    overallConfidence: 0.75,
  },
  strongestRisk: { type: 'economic', score: 45, description: 'Economic concerns' },
  riskDistribution: { minimal: 0, low: 6, moderate: 0, high: 0, severe: 0 },
  explanation: {
    summary: 'Low regret path',
    details: 'Good alignment',
    reasoning: 'Strong fit',
    primaryConcerns: [],
    mitigationStrategies: ['Save more'],
    comparativeContext: 'Better than average',
    longTermOutlook: 'Positive',
  },
  ...overrides,
});

const createMockRegretAnalysis = (
  overrides: Partial<RegretAnalysis> = {}
): RegretAnalysis => {
  const path1Analysis = createMockPathRegretAnalysis({ pathId: 'path-1' });
  const path2Analysis = createMockPathRegretAnalysis({
    pathId: 'path-2',
    factors: createMockFactors(50, 'action'),
    aggregate: {
      overallRegretScore: 50,
      weightedRegretScore: 48,
      maxRegretScore: 60,
      overallConfidence: 0.7,
    },
    strongestRisk: { type: 'action', score: 60, description: 'High risk' },
  });

  return {
    id: 'regret-test',
    studentBelief: createMockStudentBeliefV3(),
    pathExplorerResult: createMockCareerPathExplorerResult(),
    pathAnalyses: new Map([
      ['path-1', path1Analysis],
      ['path-2', path2Analysis],
    ]),
    rankedPaths: [path1Analysis, path2Analysis],
    overallProfile: {
      averageRegret: 42,
      regretVariance: 56,
      dominantRegretType: 'economic',
      overallRisk: 'low',
    },
    pathComparison: {
      lowestRegretPath: path1Analysis,
      highestRegretPath: path2Analysis,
      regretDifference: 15,
      regretByType: new Map(),
      comparisonText: 'Path 1 has lower regret',
      tradeoffs: [],
    },
    generatedAt: Date.now(),
    ...overrides,
  };
};

const createMockPathCoalitionAnalysis = (
  overrides: Partial<PathCoalitionAnalysis> & { pathId?: string } = {}
): PathCoalitionAnalysis => ({
  pathId: overrides.pathId || 'test-path',
  pathType: overrides.pathType || 'primary',
  pathName: overrides.pathName || 'Test Path',
  memberEvaluations: new Map<CoalitionMember, CoalitionMemberEvaluation>([
    ['student-interests', {
      member: 'student-interests',
      supportScore: 85,
      conflictScore: 10,
      alignmentScore: 90,
      concerns: [],
      endorsements: ['Strong alignment'],
      weight: 1,
      confidence: 0.8,
    }],
  ]),
  aggregate: {
    coalitionSupport: 87,
    coalitionConflict: 10,
    alignmentScore: 85,
    tensionScore: 5,
    stabilityScore: 87,
  },
  dynamics: {
    strongSupport: ['student-interests'],
    reservations: [],
    opposition: [],
    memberConflicts: [],
    consensusLevel: 'strong',
  },
  explanation: {
    summary: 'Stable coalition',
    details: 'Good support',
    reasoning: 'Aligned interests',
    coalitionStrengths: ['student interests strongly supports this path'],
    coalitionConflicts: [],
    recommendedNegotiations: [],
    alternativeConsiderations: [],
  },
  ...overrides,
});

const createMockDecisionCoalitionAnalysis = (
  overrides: Partial<DecisionCoalitionAnalysis> = {}
): DecisionCoalitionAnalysis => {
  const path1Coalition = createMockPathCoalitionAnalysis({ pathId: 'path-1' });
  const path2Coalition = createMockPathCoalitionAnalysis({
    pathId: 'path-2',
    pathName: 'High Growth Path',
    aggregate: {
      coalitionSupport: 62,
      coalitionConflict: 35,
      alignmentScore: 60,
      tensionScore: 40,
      stabilityScore: 62,
    },
    dynamics: {
      strongSupport: [],
      reservations: ['student-interests'],
      opposition: [],
      memberConflicts: [],
      consensusLevel: 'moderate',
    },
  });

  return {
    id: 'coalition-test',
    studentBelief: createMockStudentBeliefV3(),
    pathExplorerResult: createMockCareerPathExplorerResult(),
    pathAnalyses: new Map([
      ['path-1', path1Coalition],
      ['path-2', path2Coalition],
    ]),
    rankedPaths: [path1Coalition, path2Coalition],
    coalitionHealth: {
      cohesion: 72,
      conflictLevel: 22,
      clarity: 75,
      confidence: 0.8,
    },
    pathComparison: null,
    recommendation: {
      recommendedPathId: 'path-1',
      recommendedPathType: 'primary',
      confidence: 0.8,
      reasoning: 'Path 1 has better coalition support',
      supportingMembers: ['student-interests'],
      opposingMembers: [],
      successConditions: [],
      riskMitigation: [],
    },
    generatedAt: Date.now(),
    ...overrides,
  };
};

// ============================================================================
// DECISION INTELLIGENCE ENGINE V1 TESTS
// ============================================================================

describe('DecisionIntelligenceEngineV1', () => {
  let studentBelief: StudentBeliefV3;
  let pathExplorerResult: CareerPathExplorerResult;
  let regretAnalysis: RegretAnalysis;
  let coalitionAnalysis: DecisionCoalitionAnalysis;
  let graph: CareerTransitionGraphV1;
  let engine: DecisionIntelligenceEngineV1;

  beforeEach(() => {
    studentBelief = createMockStudentBeliefV3();
    pathExplorerResult = createMockCareerPathExplorerResult();
    regretAnalysis = createMockRegretAnalysis();
    coalitionAnalysis = createMockDecisionCoalitionAnalysis();
    graph = new CareerTransitionGraphV1();

    // Set up graph
    graph.addNode(createMockCareerNode({ id: 'se', name: 'Software Engineer' }));

    engine = new DecisionIntelligenceEngineV1(
      studentBelief,
      pathExplorerResult,
      regretAnalysis,
      coalitionAnalysis,
      graph
    );
  });

  describe('generate', () => {
    it('should generate a decision recommendation', () => {
      const result = engine.generate();

      expect(result).toBeDefined();
      expect(result.id).toContain('decision');
      expect(result.recommendation).toBeDefined();
      expect(result.alternatives).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.reasoning).toBeDefined();
      expect(result.tradeoffs).toBeDefined();
    });

    it('should include a primary recommendation', () => {
      const result = engine.generate();

      expect(result.recommendation.pathId).toBeTruthy();
      expect(result.recommendation.path).toBeDefined();
      expect(result.recommendation.tier).toMatch(/primary|strong|conditional|exploratory/);
      expect(result.recommendation.urgency).toMatch(/immediate|soon|consider|monitor/);
    });

    it('should include alternative paths', () => {
      const result = engine.generate();

      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('should calculate confidence scores', () => {
      const result = engine.generate();

      expect(result.confidence.overall).toBeGreaterThanOrEqual(0);
      expect(result.confidence.overall).toBeLessThanOrEqual(1);
      expect(result.confidence.psychologicalFit).toBeGreaterThanOrEqual(0);
      expect(result.confidence.psychologicalFit).toBeLessThanOrEqual(1);
      expect(result.confidence.optionality).toBeGreaterThanOrEqual(0);
      expect(result.confidence.criticality).toBeGreaterThanOrEqual(0);
      expect(result.confidence.coalition).toBeGreaterThanOrEqual(0);
      expect(result.confidence.regret).toBeGreaterThanOrEqual(0);
      expect(result.confidence.flexibility).toBeGreaterThanOrEqual(0);
    });

    it('should generate reasoning', () => {
      const result = engine.generate();

      expect(result.reasoning.primary).toBeTruthy();
      expect(result.reasoning.supportingFactors).toBeInstanceOf(Array);
      expect(result.reasoning.addressingConcerns).toBeInstanceOf(Array);
      expect(result.reasoning.confidenceExplanation).toBeTruthy();
    });

    it('should generate tradeoffs', () => {
      const result = engine.generate();

      expect(result.tradeoffs.summary).toBeTruthy();
      expect(result.tradeoffs.keyTradeoffs).toBeInstanceOf(Array);
      expect(result.tradeoffs.acceptedRisks).toBeInstanceOf(Array);
      expect(result.tradeoffs.missedOpportunities).toBeInstanceOf(Array);
    });

    it('should include timestamp', () => {
      const result = engine.generate();

      expect(result.generatedAt).toBeGreaterThan(0);
      expect(result.generatedAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Path Scoring', () => {
    it('should score all paths', () => {
      const result = engine.generate();

      expect(result.pathScores).toBeDefined();
      expect(result.pathScores.size).toBe(pathExplorerResult.paths.length);
    });

    it('should include all six factor scores', () => {
      const result = engine.generate();
      const scores = result.pathScores.get('path-1');

      expect(scores?.psychologicalFit).toBeGreaterThanOrEqual(0);
      expect(scores?.optionality).toBeGreaterThanOrEqual(0);
      expect(scores?.criticality).toBeGreaterThanOrEqual(0);
      expect(scores?.coalition).toBeGreaterThanOrEqual(0);
      expect(scores?.regret).toBeGreaterThanOrEqual(0);
      expect(scores?.flexibility).toBeGreaterThanOrEqual(0);
    });

    it('should calculate composite scores', () => {
      const result = engine.generate();
      const scores = result.pathScores.get('path-1');

      expect(scores?.composite).toBeGreaterThanOrEqual(0);
      expect(scores?.composite).toBeLessThanOrEqual(100);
      expect(scores?.weightedComposite).toBeGreaterThanOrEqual(0);
      expect(scores?.weightedComposite).toBeLessThanOrEqual(100);
    });

    it('should rank paths by composite score', () => {
      const result = engine.generate();

      expect(result.rankedPathIds.length).toBeGreaterThan(0);
      expect(result.rankedPathIds[0]).toBe(result.recommendation.pathId);
    });
  });

  describe('Recommendation Tiers', () => {
    it('should assign appropriate tier based on scores', () => {
      const result = engine.generate();

      expect(['primary', 'strong', 'conditional', 'exploratory']).toContain(result.recommendation.tier);
    });

    it('should assign urgency based on criticality', () => {
      const result = engine.generate();

      expect(['immediate', 'soon', 'consider', 'monitor']).toContain(result.recommendation.urgency);
    });

    it('should include strengths for recommendation', () => {
      const result = engine.generate();

      expect(result.recommendation.strengths).toBeInstanceOf(Array);
      expect(result.recommendation.strengths.length).toBeGreaterThan(0);
    });

    it('should include caveats for recommendation', () => {
      const result = engine.generate();

      expect(result.recommendation.caveats).toBeInstanceOf(Array);
    });

    it('should include action items', () => {
      const result = engine.generate();

      expect(result.recommendation.actionItems).toBeInstanceOf(Array);
      expect(result.recommendation.actionItems.length).toBeGreaterThan(0);
    });
  });

  describe('Alternatives', () => {
    it('should include viable alternatives', () => {
      const result = engine.generate();

      if (pathExplorerResult.paths.length > 1) {
        expect(result.alternatives.length).toBeGreaterThan(0);
      }
    });

    it('should include rationale for each alternative', () => {
      const result = engine.generate();

      result.alternatives.forEach(alt => {
        expect(alt.rationale).toBeTruthy();
        expect(alt.whenToConsider).toBeTruthy();
      });
    });

    it('should rank alternatives by score', () => {
      const result = engine.generate();

      for (let i = 1; i < result.alternatives.length; i++) {
        expect(result.alternatives[i - 1].compositeScore).toBeGreaterThanOrEqual(
          result.alternatives[i].compositeScore
        );
      }
    });
  });

  describe('Determinism', () => {
    it('should produce consistent results', () => {
      const result1 = engine.generate();
      const result2 = engine.generate();

      expect(result1.recommendation.pathId).toBe(result2.recommendation.pathId);
      expect(result1.confidence.overall).toBe(result2.confidence.overall);
    });

    it('should produce consistent results with same inputs', () => {
      const engine2 = new DecisionIntelligenceEngineV1(
        studentBelief,
        pathExplorerResult,
        regretAnalysis,
        coalitionAnalysis,
        graph
      );

      const result1 = engine.generate();
      const result2 = engine2.generate();

      expect(result1.recommendation.pathId).toBe(result2.recommendation.pathId);
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  it('should generate decision using factory function', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const regretAnalysis = createMockRegretAnalysis();
    const coalitionAnalysis = createMockDecisionCoalitionAnalysis();
    const graph = new CareerTransitionGraphV1();

    const result = generateDecision(
      studentBelief,
      pathExplorerResult,
      regretAnalysis,
      coalitionAnalysis,
      graph
    );

    expect(result).toBeDefined();
    expect(result.recommendation).toBeDefined();
  });

  it('should accept custom weights', () => {
    const studentBelief = createMockStudentBeliefV3();
    const pathExplorerResult = createMockCareerPathExplorerResult();
    const regretAnalysis = createMockRegretAnalysis();
    const coalitionAnalysis = createMockDecisionCoalitionAnalysis();
    const graph = new CareerTransitionGraphV1();

    const options: DecisionIntelligenceOptions = {
      factorWeights: {
        psychologicalFit: 0.4,
        optionality: 0.2,
        criticality: 0.1,
        coalition: 0.1,
        regret: 0.1,
        flexibility: 0.1,
      },
    };

    const result = generateDecision(
      studentBelief,
      pathExplorerResult,
      regretAnalysis,
      coalitionAnalysis,
      graph,
      options
    );

    expect(result).toBeDefined();
  });
});

// ============================================================================
// REALISTIC SCENARIOS
// ============================================================================

describe('Realistic Scenarios', () => {
  it('should recommend high-fit path when values align', () => {
    const studentBelief = createMockStudentBeliefV3({
      interests: {
        coreInterests: ['technology', 'coding'],
        interestStrengths: new Map([['technology', 0.9], ['coding', 0.9]]),
        topInterestCategories: ['technical'],
      },
    });

    const paths = [
      createMockExploredCareerPath({
        id: 'tech-path',
        name: 'Software Engineering',
        nodes: [createMockCareerNode({ id: 'se', name: 'Software Engineer', category: 'technology' })],
        scores: createMockPathScores({ optionalityScore: 80, compositeScore: 85 }),
      }),
      createMockExploredCareerPath({
        id: 'art-path',
        name: 'Fine Arts',
        nodes: [createMockCareerNode({ id: 'artist', name: 'Artist', category: 'creative' })],
        scores: createMockPathScores({ optionalityScore: 40, compositeScore: 50 }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });

    const regretAnalysis = createMockRegretAnalysis({
      pathAnalyses: new Map([
        ['tech-path', createMockPathRegretAnalysis({ pathId: 'tech-path', aggregate: { overallRegretScore: 20, weightedRegretScore: 18, maxRegretScore: 30, overallConfidence: 0.9 }, strongestRisk: { type: 'economic', score: 30, description: 'Low' } })],
        ['art-path', createMockPathRegretAnalysis({ pathId: 'art-path', aggregate: { overallRegretScore: 60, weightedRegretScore: 58, maxRegretScore: 70, overallConfidence: 0.6 }, strongestRisk: { type: 'identity', score: 70, description: 'High' } })],
      ]),
    });

    const coalitionAnalysis = createMockDecisionCoalitionAnalysis();
    const graph = new CareerTransitionGraphV1();

    const engine = new DecisionIntelligenceEngineV1(
      studentBelief,
      pathExplorerResult,
      regretAnalysis,
      coalitionAnalysis,
      graph
    );

    const result = engine.generate();

    expect(result.recommendation.pathId).toBe('tech-path');
  });

  it('should downrank paths with high regret', () => {
    const paths = [
      createMockExploredCareerPath({
        id: 'safe-path',
        name: 'Safe Path',
        scores: createMockPathScores({ optionalityScore: 70 }),
      }),
      createMockExploredCareerPath({
        id: 'risky-path',
        name: 'Risky Path',
        scores: createMockPathScores({ optionalityScore: 80 }),
      }),
    ];

    const pathExplorerResult = createMockCareerPathExplorerResult({ paths });

    const regretAnalysis = createMockRegretAnalysis({
      pathAnalyses: new Map([
        ['safe-path', createMockPathRegretAnalysis({ pathId: 'safe-path', aggregate: { overallRegretScore: 20, weightedRegretScore: 18, maxRegretScore: 30, overallConfidence: 0.9 }, strongestRisk: { type: 'economic', score: 30, description: 'Low' } })],
        ['risky-path', createMockPathRegretAnalysis({ pathId: 'risky-path', aggregate: { overallRegretScore: 80, weightedRegretScore: 78, maxRegretScore: 90, overallConfidence: 0.5 }, strongestRisk: { type: 'action', score: 90, description: 'Very High' } })],
      ]),
    });

    const engine = new DecisionIntelligenceEngineV1(
      createMockStudentBeliefV3(),
      pathExplorerResult,
      regretAnalysis,
      createMockDecisionCoalitionAnalysis(),
      new CareerTransitionGraphV1()
    );

    const result = engine.generate();

    expect(result.recommendation.pathId).toBe('safe-path');
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle single path', () => {
    const pathExplorerResult = createMockCareerPathExplorerResult({
      paths: [createMockExploredCareerPath({ id: 'only-path' })],
    });

    const regretAnalysis = createMockRegretAnalysis({
      pathAnalyses: new Map([['only-path', createMockPathRegretAnalysis({ pathId: 'only-path' })]]),
      rankedPaths: [createMockPathRegretAnalysis({ pathId: 'only-path' })],
    });

    const engine = new DecisionIntelligenceEngineV1(
      createMockStudentBeliefV3(),
      pathExplorerResult,
      regretAnalysis,
      createMockDecisionCoalitionAnalysis(),
      new CareerTransitionGraphV1()
    );

    const result = engine.generate();

    expect(result.recommendation.pathId).toBe('only-path');
    expect(result.alternatives.length).toBe(0);
  });

  it('should handle empty paths gracefully', () => {
    const pathExplorerResult = createMockCareerPathExplorerResult({ paths: [] });
    const regretAnalysis = createMockRegretAnalysis({ pathAnalyses: new Map(), rankedPaths: [] });

    const engine = new DecisionIntelligenceEngineV1(
      createMockStudentBeliefV3(),
      pathExplorerResult,
      regretAnalysis,
      createMockDecisionCoalitionAnalysis(),
      new CareerTransitionGraphV1()
    );

    const result = engine.generate();

    expect(result.recommendation.tier).toBe('exploratory');
    expect(result.confidence.overall).toBeLessThan(0.5);
  });
});
