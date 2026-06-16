import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DecisionInputValidationError,
  OptionalityEngine,
  TRADEOFF_FRAMEWORKS,
  createDecisionIntelligenceEngine,
  createDecisionMatrix,
  createOptionalityEngine,
  resolveTradeoff,
  type DecisionInput,
  type DecisionOption,
} from '../index';
import type { DimensionScore } from '../../../assessment/assessment-types';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

function createDimensionScore(dimension: string, score: number): DimensionScore {
  return {
    dimension,
    score,
    confidence: 80,
    signalCount: 5,
  };
}

function createOption(id = 'option-1'): DecisionOption {
  return {
    id,
    label: 'Flexible Technology Path',
    description: 'A flexible analytical technology path with strong pivot potential.',
    careerId: 'software-engineering',
    educationPath: {
      degree: 'Computer Science',
      duration: 18,
      cost: 100000,
      location: 'India',
      specialization: 'Software systems',
    },
    riskLevel: 'LOW',
    timeCommitment: {
      duration: 18,
      intensity: 'FULL_TIME',
      flexibility: 'HIGHLY_FLEXIBLE',
    },
    financialImplications: {
      initialCost: 100000,
      ongoingCost: 10000,
      opportunityCost: 50000,
      expectedIncome: 900000,
      breakEvenTime: 12,
      roiEstimate: 65,
    },
    reversibility: {
      score: 80,
      type: 'TYPE_3',
      switchingCost: 20000,
      timeToReverse: 3,
      explanation: 'Strongly reversible because skills transfer to adjacent paths.',
    },
    tags: ['technology', 'flexible'],
  };
}

function createDecisionInput(options: DecisionOption[] = [createOption()]): DecisionInput {
  return {
    id: 'decision-optionality-dimensionscore-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-optionality-dimensionscore-contract',
    description: 'Choose a flexible career path.',
    options,
    context: {
      familyExpectations: ['financial stability'],
      peerInfluence: ['technology careers'],
      culturalFactors: ['education-focused environment'],
      economicClimate: 'competitive but opportunity-rich',
      personalCircumstances: ['final year student'],
      values: ['growth', 'meaning', 'stability'],
      nonNegotiables: ['ethical work'],
      aspirationalGoals: ['build useful products'],
    },
    constraints: [],
    timeline: {
      decisionBy: new Date('2026-09-01T00:00:00.000Z'),
      implementationStart: new Date('2026-10-01T00:00:00.000Z'),
      keyMilestones: [],
      flexibility: 45,
    },
    psychologyProfile: {} as DecisionInput['psychologyProfile'],
    dimensionScores: new Map([
      ['analyticalThinking', createDimensionScore('analyticalThinking', 78)],
      ['adaptability', createDimensionScore('adaptability', 74)],
      ['riskTolerance', createDimensionScore('riskTolerance', 52)],
      ['stabilityPreference', createDimensionScore('stabilityPreference', 61)],
      ['resilience', createDimensionScore('resilience', 70)],
    ]),
    careerRecommendations: {
      studentProfileId: 'student-optionality-dimensionscore-contract',
      topRecommendations: [],
      alternativeRecommendations: [],
      stretchRecommendations: [],
      allRecommendations: [],
      metadata: {
        totalEvaluated: 0,
        totalRecommended: 0,
        generatedAt: new Date('2026-06-01T00:00:00.000Z'),
        averageScore: 0,
        averageConfidence: 0,
      },
    },
  };
}

describe('Decision Optionality DimensionScore contract', () => {
  it('imports OptionalityEngine successfully', () => {
    expect(OptionalityEngine).toBeDefined();
    expect(createOptionalityEngine).toBeTypeOf('function');
  });

  it('resolves DimensionScore from the canonical assessment type surface', () => {
    const score = createDimensionScore('analyticalThinking', 78);

    expect(score).toEqual({
      dimension: 'analyticalThinking',
      score: 78,
      confidence: 80,
      signalCount: 5,
    });
    expect(Object.prototype.hasOwnProperty.call(score, 'percentileScore')).toBe(false);
  });

  it('does not read nonexistent percentileScore from Decision Intelligence production sources', () => {
    const productionSources = [
      'src/intelligence/decision-intelligence/optionality-engine.ts',
      'src/intelligence/decision-intelligence/risk-engine.ts',
      'src/intelligence/decision-intelligence/scenario-engine.ts',
    ];

    for (const sourcePath of productionSources) {
      const source = readFileSync(sourcePath, 'utf8');
      expect(source).not.toContain('percentileScore');
    }
  });

  it('keeps optionality scoring working with a minimal canonical DimensionScore fixture', () => {
    const engine = createOptionalityEngine();
    const input = createDecisionInput();
    const analysis = engine.analyzeOptionality(input, input.options[0]);

    expect(analysis.score).toBe(88);
    expect(analysis.level).toBe('VERY_HIGH');
    expect(analysis.pivotDifficulty.enablers).toContain(
      'Strong analytical skills transfer across fields'
    );
    expect(analysis.pivotDifficulty.enablers).toContain('High adaptability enables pivots');
  });

  it('keeps optionality output shape stable', () => {
    const engine = createOptionalityEngine();
    const input = createDecisionInput();
    const analysis = engine.analyzeOptionality(input, input.options[0]);

    expect(analysis).toEqual({
      score: expect.any(Number),
      level: expect.stringMatching(/VERY_HIGH|HIGH|MODERATE|LOW|VERY_LOW/),
      explanation: expect.any(String),
      futureOptions: expect.any(Array),
      pivotDifficulty: expect.objectContaining({
        score: expect.any(Number),
        category: expect.any(String),
        barriers: expect.any(Array),
        enablers: expect.any(Array),
        typicalPivotPaths: expect.any(Array),
      }),
      explorationCapacity: expect.objectContaining({
        score: expect.any(Number),
        canExploreWhilePursuing: expect.any(Boolean),
        explorationMechanisms: expect.any(Array),
        constraints: expect.any(Array),
      }),
      adaptabilityScore: expect.any(Number),
    });
  });

  it('preserves the Phase 6.6.AG resolveTradeoff export contract', () => {
    const result = resolveTradeoff(createDecisionInput([createOption('option-a')]), {
      type: 'MONEY_VS_MEANING',
      dimensionA: 'Financial Rewards',
      dimensionB: 'Meaning',
      intensity: 70,
      explanation: 'Tradeoff between rewards and meaning.',
      studentAwareness: 'PARTIALLY_AWARE',
      framework: TRADEOFF_FRAMEWORKS[0],
      resolutionStrategies: ['Integrate where possible'],
    });

    expect(result.recommendedOption?.id).toBe('option-a');
    expect(result.rationale).toContain('Financial Rewards');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });

  it('preserves the Phase 6.6.AF createDecisionMatrix export contract', () => {
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
    expect(matrix.scores).toEqual([
      [100, 0],
      [0, 100],
    ]);
  });

  it('preserves the Phase 6.6.AE coalition aggregate contract', () => {
    const source = readFileSync(
      'src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts',
      'utf8'
    );

    expect(source).not.toContain('aggregate.weightedAgreement');
    expect(source).not.toContain('aggregate.overallStability');
    expect(source).not.toContain('aggregate.criticalConflictCount');
  });

  it('preserves the Phase 6.6.AD valuePriorities contract', () => {
    const source = readFileSync(
      'src/intelligence/decision-intelligence/DecisionIntelligenceEngineV1.ts',
      'utf8'
    );

    expect(source).not.toContain('this.studentBelief.values?.valuePriorities');
    expect(source).not.toContain('this.studentBelief.values.valuePriorities');
  });

  it('preserves the Phase 6.6.AC Mistake, Phase 6.6.AB Lesson, and Phase 6.6.AA Contradiction contracts', () => {
    const source = readFileSync('src/intelligence/decision-intelligence/decision-types.ts', 'utf8');

    expect(source).toContain('MistakeAnalysis as Mistake');
    expect(source).toContain('ExtractedLesson as Lesson');
    expect(source).toContain("type { Contradiction }");
  });

  it('preserves the Phase 6.6.S empty-options contract', () => {
    const engine = createDecisionIntelligenceEngine();

    expect(() => engine.analyze(createDecisionInput([]))).toThrow(DecisionInputValidationError);
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
