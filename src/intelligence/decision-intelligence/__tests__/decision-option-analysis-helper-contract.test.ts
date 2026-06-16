import { describe, expect, it } from 'vitest';
import {
  DecisionInputValidationError,
  createDecisionIntelligenceEngine,
  type DecisionAnalysis,
  type DecisionInput,
  type DecisionOption,
  type ExperimentSuggestion,
} from '../index';

type DecisionOptionOverrides = Partial<
  Omit<DecisionOption, 'timeCommitment' | 'financialImplications' | 'reversibility'>
> & {
  timeCommitment?: Partial<DecisionOption['timeCommitment']>;
  financialImplications?: Partial<DecisionOption['financialImplications']>;
  reversibility?: Partial<DecisionOption['reversibility']>;
};

const VALID_EFFORTS: ReadonlyArray<ExperimentSuggestion['effort']> = ['LOW', 'MEDIUM', 'HIGH'];

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
    id: 'decision-option-analysis-helper-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-option-analysis-helper-contract-test',
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
      studentProfileId: 'student-option-analysis-helper-contract-test',
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

function expectValidAnalysisShape(analysis: DecisionAnalysis): void {
  expect(analysis.optionality).toBeDefined();
  expect(analysis.reversibility).toBeDefined();
  expect(analysis.risks).toBeDefined();
  expect(analysis.scenarios).toBeDefined();
  expect(analysis.pathRecommendations.length).toBeGreaterThanOrEqual(1);
  analysis.pathRecommendations.forEach((recommendation) => {
    expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
    expect(recommendation.confidence).toBeLessThanOrEqual(100);
    expect(recommendation.fitScore).toBeGreaterThanOrEqual(0);
    expect(recommendation.fitScore).toBeLessThanOrEqual(100);
  });
}

describe('Decision option-analysis helper contract', () => {
  it('imports successfully', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
  });

  it('covers findHighestOptionality() behavior indirectly through analyze()', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(
      createDecisionInput([
        createOption({ id: 'option-1', label: 'Software Engineering' }),
        createOption({
          id: 'option-2',
          label: 'Flexible Product Design',
          careerId: 'product-design',
          riskLevel: 'LOW',
          financialImplications: { initialCost: 50000, expectedIncome: 850000 },
          timeCommitment: { duration: 18, flexibility: 'HIGHLY_FLEXIBLE' },
          tags: ['design', 'creativity', 'flexible'],
        }),
      ])
    );

    expectValidAnalysisShape(analysis);
    expect(analysis.optionality.score).toBeGreaterThanOrEqual(0);
  });

  it('returns valid DecisionAnalysis for one valid option', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expectValidAnalysisShape(analysis);
  });

  it('returns valid DecisionAnalysis for multiple valid options', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(
      createDecisionInput([
        createOption({ id: 'option-1', label: 'Software Engineering' }),
        createOption({ id: 'option-2', label: 'Product Design', careerId: 'product-design' }),
      ])
    );

    expectValidAnalysisShape(analysis);
  });

  it('selected best optionality helper can run with full analysis data available', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(
      createDecisionInput([
        createOption({ id: 'option-1', label: 'Software Engineering' }),
        createOption({
          id: 'option-2',
          label: 'Flexible Product Design',
          careerId: 'product-design',
          riskLevel: 'LOW',
          financialImplications: { initialCost: 50000, expectedIncome: 850000 },
          timeCommitment: { duration: 18, flexibility: 'HIGHLY_FLEXIBLE' },
        }),
      ])
    );

    expect(analysis.optionality.futureOptions).toBeDefined();
    expectValidAnalysisShape(analysis);
  });

  it('calculatePathConfidence can operate with full option analysis selections', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(
      createDecisionInput([
        createOption({ id: 'option-1', label: 'Software Engineering' }),
        createOption({ id: 'option-2', label: 'Product Design', careerId: 'product-design' }),
      ])
    );

    analysis.pathRecommendations.forEach((recommendation) => {
      expect(Number.isFinite(recommendation.confidence)).toBe(true);
    });
  });

  it('preserves Phase 6.6.S empty-options validation', () => {
    const engine = createDecisionIntelligenceEngine();

    expect(() => engine.analyze(createDecisionInput([]))).toThrow(DecisionInputValidationError);
  });

  it('preserves Phase 6.6.T readiness status contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.decisionReadiness).toBe('NEEDS_MORE_INFO');
    expect(analysis.decisionReadiness).not.toBe('NEEDS_INFO');
  });

  it('preserves Phase 6.6.U experiment effort contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    analysis.experiments.forEach((experiment) => {
      expect(VALID_EFFORTS).toContain(experiment.effort);
    });
  });

  it('preserves Phase 6.6.V mentor guidance contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.mentorGuidance).toBeDefined();
    expect(analysis.mentorGuidance.length).toBeGreaterThan(0);
  });

  it('does not enable live routing', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
  });

  it('does not enable raw payload capture', () => {
    expect(process.env.CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.RAW_PAYLOAD_CAPTURE).not.toBe('true');
  });
});
