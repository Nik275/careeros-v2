import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DECISION_TREE_CONFIG,
  DecisionTreeEngine,
  createDecisionTreeEngine,
  type DecisionTreeInput,
  type DecisionTreeNodeMetrics,
} from '../index';
import type { ExploredCareerPath } from '../../path-explorer';
import type { FutureScenario } from '../../future-scenario';
import type { OptimalDecision } from '../../decision-optimization-engine';

function createPath(overrides: Partial<ExploredCareerPath> = {}): ExploredCareerPath {
  return {
    id: 'path-1',
    type: 'primary',
    name: 'Primary Path',
    nodes: [],
    edges: [],
    nodeIds: [],
    metrics: {
      totalYears: 4,
      transitionCount: 1,
      incomeRange: {
        entry: 600000,
        mid: 1200000,
        senior: 2400000,
        growthRate: 150,
      },
      totalDifficulty: 25,
      avgTransitionTime: 2,
      cumulativeSuccessProbability: 0.8,
      minReversibility: 0.7,
      avgSkillOverlap: 0.75,
    },
    scores: {
      optionalityScore: 70,
      criticalityScore: 45,
      flexibilityScore: 65,
      growthScore: 75,
      stabilityScore: 60,
      compositeScore: 72,
    },
    risk: {
      level: 'low',
      score: 20,
      factors: [],
      mitigations: [],
    },
    explanation: {
      summary: 'Primary path',
      details: 'Primary path details',
      selectionReason: 'Strong fit',
      strengths: ['Good growth'],
      tradeoffs: [],
      preservedOptions: ['Product'],
      closedOptions: [],
    },
    recommendations: ['Explore this path'],
    ...overrides,
  };
}

function createScenario(overrides: Partial<FutureScenario> = {}): FutureScenario {
  return {
    id: 'scenario-1',
    type: 'expected',
    name: 'Expected Scenario',
    description: 'Expected scenario outcome',
    basePathId: 'path-1',
    timelineYears: 4,
    careerStates: [],
    educationStates: [],
    milestones: [],
    incomeTrajectory: [],
    flexibilityTrajectory: [],
    metrics: {
      totalIncome: 4800000,
      peakIncome: 1400000,
      averageIncome: 1200000,
      finalOptionality: 0.8,
      averageFlexibility: 70,
      transitionCount: 1,
      educationCompletionRate: 1,
      probability: 60,
    },
    assumptions: {
      performanceLevel: 'average',
      marketConditions: 'stable',
      familySupport: 'moderate',
      financialConstraint: 'minimal',
      riskTolerance: 'moderate',
      externalOpportunities: 'moderate',
    },
    riskFactors: [],
    generatedAt: Date.now(),
    ...overrides,
  };
}

function createOptimalDecision(): OptimalDecision {
  return {
    id: 'optimal-1',
    path: {
      id: 'path-1',
      name: 'Primary Path',
      careerId: 'career-1',
      segments: [],
      utilityAttributes: {},
      coalitionScore: 80,
      regretRisk: 20,
      optionalityScore: 70,
      criticalityScore: 45,
      decisionScore: 72,
      confidence: 80,
    },
    expectedUtility: {
      pathId: 'path-1',
      score: 72,
      confidence: 80,
      breakdown: {
        financial: 70,
        lifestyle: 70,
        psychological: 70,
        social: 70,
        future: 70,
      },
      byAttribute: [],
      intelligenceContributions: {
        utility: 70,
        coalition: 80,
        regret: 80,
        optionality: 70,
        criticality: 45,
        decision: 72,
      },
      riskAdjustedScore: 70,
      bestCase: 85,
      worstCase: 55,
    },
    rank: 1,
    margin: 10,
    isClearWinner: true,
    advantages: ['Good utility'],
    risks: [],
  };
}

function createInput(overrides: Partial<DecisionTreeInput> = {}): DecisionTreeInput {
  return {
    studentId: 'student-1',
    startingCareerId: 'career-1',
    startingCareerName: 'Software Engineering',
    careerPaths: [createPath()],
    futureScenarios: [createScenario()],
    optimalDecision: createOptimalDecision(),
    utilityProfile: { weights: {} },
    ...overrides,
  };
}

describe('DecisionTreeInput contract', () => {
  it('imports DecisionTreeEngine successfully', () => {
    expect(DecisionTreeEngine).toBeDefined();
    expect(createDecisionTreeEngine).toBeTypeOf('function');
  });

  it('keeps the canonical input shape explicit', () => {
    const input = createInput();

    expect(Object.keys(input).sort()).toEqual([
      'careerPaths',
      'futureScenarios',
      'optimalDecision',
      'startingCareerId',
      'startingCareerName',
      'studentId',
      'utilityProfile',
    ]);
  });

  it('documents startingCareerName as an optional display field', () => {
    const input: DecisionTreeInput = createInput({
      startingCareerName: 'Career Display Name',
    });

    expect(input.startingCareerName).toBe('Career Display Name');
  });

  it('runs with the canonical startingCareerId', () => {
    const analysis = createDecisionTreeEngine().analyze(createInput());

    expect(analysis.tree.startingState.careerId).toBe('career-1');
    expect(analysis.bestPath.pathType).toBe('optimal');
  });

  it('uses the fallback display name when startingCareerName is absent', () => {
    const { startingCareerName: _displayName, ...inputWithoutDisplayName } = createInput();
    const analysis = createDecisionTreeEngine().analyze(inputWithoutDisplayName);

    expect(analysis.tree.startingState.careerId).toBe('career-1');
    expect(analysis.tree.startingState.careerName).toBe('Starting Career');
  });

  it('keeps DEFAULT_DECISION_TREE_CONFIG runtime-importable', () => {
    const engine = new DecisionTreeEngine();

    expect(engine.getConfig()).toEqual(DEFAULT_DECISION_TREE_CONFIG);
  });

  it('keeps totalIncome on decision-tree node metrics, not PathMetrics', () => {
    const metrics: DecisionTreeNodeMetrics = {
      totalIncome: 4800000,
      finalOptionality: 0.8,
    };

    expect(metrics.totalIncome).toBe(4800000);
  });

  it('keeps the source contract free of a required startingCareerName field', () => {
    const source = readFileSync(
      'src/intelligence/decision-tree-engine/types.ts',
      'utf8'
    );

    expect(source).toContain('startingCareerName?: string;');
    expect(source).not.toContain('startingCareerName: string;');
  });
});
