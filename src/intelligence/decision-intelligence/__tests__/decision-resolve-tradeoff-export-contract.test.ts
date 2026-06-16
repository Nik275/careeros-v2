import { describe, expect, it } from 'vitest';
import {
  createDecisionMatrix,
  createTradeoffEngine,
  resolveTradeoff,
  TradeoffEngine,
  TRADEOFF_FRAMEWORKS,
} from '../index';
import type { DecisionInput, DecisionOption } from '../decision-types';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

function createOption(id: string, riskLevel: DecisionOption['riskLevel']): DecisionOption {
  return {
    id,
    label: id,
    description: `${id} option`,
    riskLevel,
    timeCommitment: {
      duration: 12,
      intensity: 'FULL_TIME',
      flexibility: 'SOME_FLEXIBILITY',
    },
    financialImplications: {
      initialCost: 1000,
      ongoingCost: 100,
      opportunityCost: 500,
      expectedIncome: 5000,
      breakEvenTime: 12,
      roiEstimate: 20,
    },
    reversibility: {
      score: riskLevel === 'LOW' ? 80 : 50,
      type: riskLevel === 'LOW' ? 'TYPE_3' : 'TYPE_2',
      switchingCost: riskLevel === 'LOW' ? 100 : 500,
      timeToReverse: riskLevel === 'LOW' ? 1 : 6,
      explanation: 'Test reversibility',
    },
    tags: [],
  };
}

function createDecisionInput(): DecisionInput {
  return {
    id: 'decision-1' as DecisionInput['id'],
    type: 'LIFE_DIRECTION',
    studentId: 'student-1',
    description: 'Choose between two options',
    options: [
      createOption('low-risk-option', 'LOW'),
      createOption('moderate-risk-option', 'MODERATE'),
    ],
    context: {
      familyExpectations: [],
      peerInfluence: [],
      culturalFactors: [],
      economicClimate: 'stable',
      personalCircumstances: [],
      values: ['financial security', 'stability'],
      nonNegotiables: [],
      aspirationalGoals: ['stable growth'],
    },
    constraints: [],
    timeline: {
      decisionBy: new Date('2026-01-01T00:00:00.000Z'),
      implementationStart: new Date('2026-02-01T00:00:00.000Z'),
      keyMilestones: [],
      flexibility: 30,
    },
    psychologyProfile: {} as DecisionInput['psychologyProfile'],
    dimensionScores: new Map(),
    careerRecommendations: {} as DecisionInput['careerRecommendations'],
  };
}

const tradeoff = {
  type: 'MONEY_VS_MEANING',
  dimensionA: 'Financial Rewards',
  dimensionB: 'Security',
  intensity: 70,
  explanation: 'Tradeoff between rewards and security.',
  studentAwareness: 'PARTIALLY_AWARE',
  framework: TRADEOFF_FRAMEWORKS[0],
  resolutionStrategies: ['Integrate where possible'],
} satisfies Parameters<TradeoffEngine['resolveTradeoff']>[1];

describe('Decision Intelligence resolveTradeoff export contract', () => {
  it('imports the public decision-intelligence index successfully', () => {
    expect(resolveTradeoff).toBeTypeOf('function');
    expect(TradeoffEngine).toBeDefined();
    expect(createTradeoffEngine).toBeTypeOf('function');
  });

  it('keeps resolveTradeoff as a public helper backed by the canonical TradeoffEngine method', () => {
    const input = createDecisionInput();
    const publicResult = resolveTradeoff(input, tradeoff);
    const engineResult = createTradeoffEngine().resolveTradeoff(input, tradeoff);

    expect(publicResult).toEqual(engineResult);
    expect(publicResult.recommendedOption?.id).toBe('low-risk-option');
    expect(publicResult.rationale).toContain('Financial Rewards');
    expect(publicResult.confidence).toBe(76);
  });

  it('keeps tradeoff-related output shape stable', () => {
    const result = resolveTradeoff(createDecisionInput(), tradeoff);

    expect(result).toEqual({
      recommendedOption: expect.objectContaining({ id: 'low-risk-option' }),
      rationale: expect.any(String),
      confidence: expect.any(Number),
    });
  });

  it('preserves the Phase 6.6.AF createDecisionMatrix public export contract', () => {
    const matrix = createDecisionMatrix(
      ['option-a', 'option-b'],
      ['fit', 'risk'],
      [
        [80, 20],
        [40, 60],
      ],
      [0.7, 0.3]
    );

    expect(matrix.normalized).toBe(true);
    expect(matrix.options).toEqual(['option-a', 'option-b']);
  });

  it('keeps live routing and raw payload capture disabled by default', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
  });
});
