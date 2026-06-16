import { describe, expect, it } from 'vitest';
import {
  DecisionInputValidationError,
  createDecisionIntelligenceEngine,
  type DecisionInput,
  type DecisionOption,
  type ExperimentSuggestion,
} from '../index';

type ExperimentEffort = ExperimentSuggestion['effort'];

type DecisionOptionOverrides = Partial<
  Omit<DecisionOption, 'timeCommitment' | 'financialImplications' | 'reversibility'>
> & {
  timeCommitment?: Partial<DecisionOption['timeCommitment']>;
  financialImplications?: Partial<DecisionOption['financialImplications']>;
  reversibility?: Partial<DecisionOption['reversibility']>;
};

const VALID_EFFORTS: ReadonlyArray<ExperimentEffort> = ['LOW', 'MEDIUM', 'HIGH'];

function createExperimentSuggestion(effort: ExperimentEffort): ExperimentSuggestion {
  return {
    name: `${effort} experiment`,
    description: 'Contract test experiment.',
    duration: 1,
    effort,
    potentialInsight: 'Valid effort typing.',
    howItReducesUncertainty: 'Confirms the public experiment contract.',
  };
}

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
    id: 'decision-experiment-effort-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-experiment-contract-test',
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
      studentProfileId: 'student-experiment-contract-test',
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

describe('Decision experiment effort contract', () => {
  it('imports successfully', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
  });

  it('ExperimentSuggestion.effort accepts LOW', () => {
    expect(createExperimentSuggestion('LOW').effort).toBe('LOW');
  });

  it('ExperimentSuggestion.effort accepts MEDIUM', () => {
    expect(createExperimentSuggestion('MEDIUM').effort).toBe('MEDIUM');
  });

  it('ExperimentSuggestion.effort accepts HIGH', () => {
    expect(createExperimentSuggestion('HIGH').effort).toBe('HIGH');
  });

  it('experiment suggestions returned by analyze() use only LOW, MEDIUM, or HIGH', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.experiments.length).toBeGreaterThan(0);
    analysis.experiments.forEach((experiment) => {
      expect(VALID_EFFORTS).toContain(experiment.effort);
    });
  });

  it('does not let a generic string effort leak into ExperimentSuggestion', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    const efforts: ExperimentEffort[] = analysis.experiments.map((experiment) => experiment.effort);

    expect(efforts).toEqual(['LOW', 'MEDIUM', 'LOW']);
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

  it('valid non-empty option analysis still works', () => {
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

    expect(analysis.primaryRecommendation).toBeDefined();
    expect(analysis.pathRecommendations.length).toBeGreaterThanOrEqual(1);
    expect(analysis.experiments.length).toBeGreaterThan(0);
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
