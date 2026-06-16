import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DECISION_TREE_CONFIG,
  DecisionPathEvaluator,
  createDecisionPathEvaluator,
  type DecisionTree,
  type DecisionTreeNodeMetrics,
} from '../index';
import type { PathMetrics } from '../../path-explorer';
import type { ScenarioMetrics } from '../../future-scenario';
import type { OptimalDecision } from '../../decision-optimization-engine';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

function createPathMetrics(overrides: Partial<PathMetrics> = {}): PathMetrics {
  return {
    totalYears: 4,
    transitionCount: 1,
    incomeRange: {
      entry: 600000,
      mid: 1200000,
      senior: 2500000,
      growthRate: 150,
    },
    totalDifficulty: 20,
    avgTransitionTime: 6,
    cumulativeSuccessProbability: 0.8,
    minReversibility: 0.6,
    avgSkillOverlap: 0.7,
    ...overrides,
  };
}

function createScenarioMetrics(overrides: Partial<ScenarioMetrics> = {}): ScenarioMetrics {
  return {
    totalIncome: 5000000,
    peakIncome: 1200000,
    averageIncome: 1000000,
    finalOptionality: 0.8,
    averageFlexibility: 75,
    transitionCount: 1,
    educationCompletionRate: 1,
    probability: 60,
    ...overrides,
  };
}

function createTree(outcomeMetrics?: DecisionTreeNodeMetrics): DecisionTree {
  return {
    id: 'tree-total-income-contract',
    rootId: 'root',
    nodes: new Map([
      [
        'root',
        {
          id: 'root',
          nodeType: 'decision',
          label: 'Start',
          description: 'Start node',
          data: {
            careerPathId: 'career-1',
            metrics: createPathMetrics(),
            scores: {
              optionalityScore: 70,
              criticalityScore: 50,
              flexibilityScore: 60,
              growthScore: 65,
              stabilityScore: 70,
              compositeScore: 60,
            },
          },
          depth: 0,
          parentId: null,
          isTerminal: false,
        },
      ],
      [
        'outcome',
        {
          id: 'outcome',
          nodeType: 'outcome',
          label: 'Expected Outcome',
          description: 'Expected scenario outcome',
          data: {
            careerPathId: 'career-1',
            scenarioId: 'scenario-1',
            outcomeState: 'expected',
            metrics: outcomeMetrics,
          },
          depth: 1,
          parentId: 'root',
          isTerminal: true,
        },
      ],
    ]),
    edges: [
      {
        sourceId: 'root',
        targetId: 'outcome',
        probability: 1,
        explanation: 'Proceed to expected outcome',
        edgeType: 'probability',
      },
    ],
    startingState: {
      careerId: 'career-1',
      careerName: 'Career One',
      studentContext: 'Contract test',
    },
    metadata: {
      createdAt: 1,
      maxDepth: 1,
      nodeCount: 2,
      branchCount: 1,
      terminalNodeCount: 1,
    },
  };
}

function createOptimalDecision(): OptimalDecision {
  return {
    path: { id: 'career-1' },
  } as OptimalDecision;
}

describe('DecisionPathEvaluator PathMetrics totalIncome contract', () => {
  it('imports DecisionPathEvaluator successfully', () => {
    expect(DecisionPathEvaluator).toBeDefined();
    expect(createDecisionPathEvaluator).toBeTypeOf('function');
  });

  it('keeps PathMetrics resolved from the canonical path-explorer type surface', () => {
    const metrics = createPathMetrics();

    expect(metrics.incomeRange.senior).toBe(2500000);
    expect(Object.prototype.hasOwnProperty.call(metrics, 'totalIncome')).toBe(false);
  });

  it('keeps totalIncome resolved from canonical ScenarioMetrics on decision-tree node metrics', () => {
    const scenarioMetrics = createScenarioMetrics();
    const nodeMetrics: DecisionTreeNodeMetrics = {
      totalIncome: scenarioMetrics.totalIncome,
      finalOptionality: scenarioMetrics.finalOptionality,
    };

    expect(nodeMetrics.totalIncome).toBe(5000000);
    expect(nodeMetrics.finalOptionality).toBe(0.8);
  });

  it('does not add totalIncome to the canonical PathMetrics source', () => {
    const pathExplorerSource = readFileSync(
      'src/intelligence/path-explorer/CareerPathExplorerV1.ts',
      'utf8'
    );

    expect(pathExplorerSource).toContain('export interface PathMetrics');
    expect(pathExplorerSource).not.toContain('totalIncome: number;');
  });

  it('keeps path evaluation working with scenario totalIncome metrics', () => {
    const evaluator = createDecisionPathEvaluator(DEFAULT_DECISION_TREE_CONFIG);
    const evaluations = evaluator.evaluate(
      createTree({
        totalIncome: 5000000,
        finalOptionality: 0.8,
        cumulativeSuccessProbability: 0.8,
      }),
      createOptimalDecision()
    );

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].utility.byStage.length).toBe(2);
    expect(evaluations[0].utility.total).toBeGreaterThan(0);
    expect(evaluations[0].pathType).toBe('optimal');
  });

  it('handles missing optional metrics safely under the Partial node metrics contract', () => {
    const evaluator = createDecisionPathEvaluator(DEFAULT_DECISION_TREE_CONFIG);
    const evaluations = evaluator.evaluate(createTree({}), createOptimalDecision());

    expect(evaluations).toHaveLength(1);
    expect(evaluations[0].utility.byStage).toEqual(expect.arrayContaining([expect.any(Number)]));
    expect(evaluations[0].optionality.final).toBeGreaterThanOrEqual(0);
  });

  it('keeps live routing disabled by default', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
  });

  it('keeps raw payload capture disabled by default', () => {
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
    expect(process.env.CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.RAW_PAYLOAD_CAPTURE).not.toBe('true');
  });
});
