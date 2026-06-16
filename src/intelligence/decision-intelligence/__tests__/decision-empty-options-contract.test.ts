import { describe, expect, it } from 'vitest';
import {
  DecisionInputValidationError,
  createDecisionIntelligenceEngine,
  type DecisionInput,
  type DecisionOption,
} from '../index';

type DecisionOptionOverrides = Partial<
  Omit<DecisionOption, 'timeCommitment' | 'financialImplications' | 'reversibility'>
> & {
  timeCommitment?: Partial<DecisionOption['timeCommitment']>;
  financialImplications?: Partial<DecisionOption['financialImplications']>;
  reversibility?: Partial<DecisionOption['reversibility']>;
};

function createOption(overrides: DecisionOptionOverrides = {}): DecisionOption {
  return {
    id: overrides.id ?? 'option-1',
    label: overrides.label ?? 'Software Engineering',
    description: overrides.description ?? 'Build software products in a scalable technology role.',
    careerId: overrides.careerId ?? 'software-engineering',
    riskLevel: overrides.riskLevel ?? 'MODERATE',
    timeCommitment: {
      duration: 48,
      intensity: 'FULL_TIME',
      flexibility: 'SOME_FLEXIBILITY',
      ...overrides.timeCommitment,
    },
    financialImplications: {
      initialCost: 250000,
      ongoingCost: 20000,
      opportunityCost: 150000,
      expectedIncome: 900000,
      breakEvenTime: 24,
      roiEstimate: 65,
      ...overrides.financialImplications,
    },
    reversibility: {
      score: 55,
      type: 'TYPE_2',
      switchingCost: 120000,
      timeToReverse: 12,
      explanation: 'Moderate reversibility with transferable skills.',
      ...overrides.reversibility,
    },
    tags: overrides.tags ?? ['technology', 'growth'],
    educationPath: overrides.educationPath ?? {
      degree: 'BTech Computer Science',
      duration: 48,
      cost: 600000,
      location: 'India',
      specialization: 'Software systems',
    },
    location: overrides.location ?? {
      city: 'Bengaluru',
      country: 'India',
      region: 'Karnataka',
      costOfLiving: 'HIGH',
      opportunities: 'EXCELLENT',
      lifestyle: ['urban', 'technology ecosystem'],
    },
  };
}

function createDecisionInput(options: DecisionOption[] = [createOption()]): DecisionInput {
  return {
    id: 'decision-empty-options-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-contract-test',
    description: 'Choose a career path after assessment.',
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
    constraints: [
      {
        type: 'FINANCIAL',
        description: 'Needs a path with manageable education cost.',
        severity: 'SOFT',
        flexibility: 60,
      },
    ],
    timeline: {
      decisionBy: new Date('2026-09-01T00:00:00.000Z'),
      implementationStart: new Date('2026-10-01T00:00:00.000Z'),
      keyMilestones: [
        {
          name: 'Applications shortlist',
          date: new Date('2026-08-01T00:00:00.000Z'),
          requiredAction: 'Shortlist programs and roles.',
          consequencesOfMissing: 'Reduced option quality.',
        },
      ],
      flexibility: 45,
    },
    psychologyProfile: {} as DecisionInput['psychologyProfile'],
    dimensionScores: new Map([
      ['analyticalThinking', { dimension: 'analyticalThinking', score: 78, confidence: 85, signalCount: 6 }],
      ['adaptability', { dimension: 'adaptability', score: 74, confidence: 80, signalCount: 5 }],
      ['riskTolerance', { dimension: 'riskTolerance', score: 52, confidence: 75, signalCount: 4 }],
      ['stabilityPreference', { dimension: 'stabilityPreference', score: 61, confidence: 76, signalCount: 4 }],
      ['resilience', { dimension: 'resilience', score: 70, confidence: 78, signalCount: 5 }],
    ]),
    careerRecommendations: {
      studentProfileId: 'student-contract-test',
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

describe('DecisionIntelligenceEngine empty options contract', () => {
  it('imports successfully', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
    expect(DecisionInputValidationError).toBeTypeOf('function');
  });

  it('analyze() rejects empty options with a structured validation failure', () => {
    const engine = createDecisionIntelligenceEngine();

    expect(() => engine.analyze(createDecisionInput([]))).toThrow(DecisionInputValidationError);

    try {
      engine.analyze(createDecisionInput([]));
    } catch (error) {
      expect(error).toBeInstanceOf(DecisionInputValidationError);
      expect((error as DecisionInputValidationError).code).toBe('EMPTY_DECISION_OPTIONS');
      expect((error as DecisionInputValidationError).details).toMatchObject({
        field: 'options',
        decisionId: 'decision-empty-options-contract',
        studentId: 'student-contract-test',
        optionCount: 0,
      });
    }
  });

  it('analyze() rejects missing options under runtime input', () => {
    const engine = createDecisionIntelligenceEngine();
    const { options: _options, ...inputWithoutOptions } = createDecisionInput();

    expect(() => engine.analyze(inputWithoutOptions as DecisionInput)).toThrow(
      DecisionInputValidationError
    );
  });

  it('preserves behavior for one valid option', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.primaryRecommendation.optionId).toBe('option-1');
    expect(analysis.pathRecommendations.length).toBeGreaterThanOrEqual(1);
    expect(analysis.optionality).toBeDefined();
    expect(analysis.reversibility).toBeDefined();
    expect(analysis.risks).toBeDefined();
    expect(analysis.scenarios).toBeDefined();
  });

  it('preserves behavior for multiple valid options', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(
      createDecisionInput([
        createOption({ id: 'option-1', label: 'Software Engineering' }),
        createOption({
          id: 'option-2',
          label: 'Product Design',
          careerId: 'product-design',
          riskLevel: 'LOW',
          financialImplications: { expectedIncome: 750000 },
          timeCommitment: { duration: 36, flexibility: 'HIGHLY_FLEXIBLE' },
          tags: ['design', 'creativity'],
        }),
      ])
    );

    expect(analysis.pathRecommendations.length).toBeGreaterThanOrEqual(1);
    expect(['option-1', 'option-2']).toContain(analysis.primaryRecommendation.optionId);
  });

  it('keeps the DecisionAnalysis output shape non-null for valid inputs', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.optionality).not.toBeNull();
    expect(analysis.reversibility).not.toBeNull();
    expect(analysis.risks).not.toBeNull();
    expect(analysis.scenarios).not.toBeNull();
    expect(analysis.primaryRecommendation).not.toBeNull();
  });

  it('does not allow selector null paths to leak into DecisionAnalysis', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption({ id: 'only-option' })]));

    expect(analysis.optionality.score).toBeGreaterThanOrEqual(0);
    expect(analysis.reversibility.score).toBeGreaterThanOrEqual(0);
    expect(analysis.risks.overallRisk).toBeGreaterThanOrEqual(0);
    expect(analysis.scenarios.mostLikely).toBeDefined();
    expect(analysis.primaryRecommendation.optionId).toBe('only-option');
  });

  it('does not enable live routing', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
  });

  it('does not change shadow route default behavior', () => {
    expect(process.env.CANARY_SHADOW).not.toBe('true');
  });

  it('does not enable raw payload capture', () => {
    expect(process.env.CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.RAW_PAYLOAD_CAPTURE).not.toBe('true');
  });
});
