import { describe, expect, it } from 'vitest';
import {
  DECISION_READINESS_STATUSES,
  DecisionInputValidationError,
  TRADEOFF_FRAMEWORKS,
  createDecisionIntelligenceEngine,
  type DecisionAnalysis,
  type DecisionInput,
  type DecisionOption,
  type ExperimentSuggestion,
  type TradeoffFramework,
} from '../index';
import type { PsychologyProfile } from '../../../domains/student/StudentProfile';
import type { LongitudinalPattern, SuccessPattern } from '../../../mentor-intelligence/mentor-intelligence-types';

type DecisionOptionOverrides = Partial<
  Omit<DecisionOption, 'timeCommitment' | 'financialImplications' | 'reversibility'>
> & {
  timeCommitment?: Partial<DecisionOption['timeCommitment']>;
  financialImplications?: Partial<DecisionOption['financialImplications']>;
  reversibility?: Partial<DecisionOption['reversibility']>;
};

const VALID_EFFORTS: ReadonlyArray<ExperimentSuggestion['effort']> = ['LOW', 'MEDIUM', 'HIGH'];

function createPsychologyProfile(): PsychologyProfile {
  return {
    analyticalThinking: 0.78,
    creativity: 0.68,
    socialOrientation: 0.62,
    leadership: 0.55,
    detailOrientation: 0.74,
    curiosity: 0.81,
    competitiveness: 0.59,
    riskTolerance: 0.52,
  };
}

function createLongitudinalPattern(): LongitudinalPattern {
  const pattern: SuccessPattern = {
    id: 'pattern-longitudinal-contract' as SuccessPattern['id'],
    pattern: 'Students who run small validation experiments before committing improve decision quality.',
    category: 'LEARNING',
    frequency: {
      count: 4,
      total: 10,
      percentage: 0.4,
      classification: 'COMMON',
    },
    confidence: 0.72 as SuccessPattern['confidence'],
    outcomeImpact: {
      magnitude: 'MODERATE',
      direction: 'POSITIVE',
      timeframe: 'MEDIUM_TERM',
      confidence: 0.7 as SuccessPattern['outcomeImpact']['confidence'],
    },
    behaviors: ['runs short experiments', 'talks to mentors', 'compares evidence'],
    enablingConditions: ['access to mentors', 'time to explore'],
    blockingConditions: ['hard deadline', 'no exploration budget'],
    sourceJourneys: ['journey-longitudinal-contract' as SuccessPattern['sourceJourneys'][number]],
    counterExamples: [],
    relatedPatterns: [],
  };

  return pattern;
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
  const psychologyProfile: PsychologyProfile = createPsychologyProfile();
  const decisionPsychologyProfile: DecisionInput['psychologyProfile'] = psychologyProfile;
  const longitudinalMemory: NonNullable<DecisionInput['longitudinalMemory']> = [
    createLongitudinalPattern(),
  ];

  return {
    id: 'decision-longitudinal-pattern-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-longitudinal-pattern-contract-test',
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
    psychologyProfile: decisionPsychologyProfile,
    dimensionScores: new Map([
      ['analyticalThinking', { dimension: 'analyticalThinking', score: 78, confidence: 85, signalCount: 6 }],
      ['adaptability', { dimension: 'adaptability', score: 74, confidence: 80, signalCount: 5 }],
      ['riskTolerance', { dimension: 'riskTolerance', score: 52, confidence: 75, signalCount: 4 }],
      ['stabilityPreference', { dimension: 'stabilityPreference', score: 61, confidence: 76, signalCount: 4 }],
      ['resilience', { dimension: 'resilience', score: 70, confidence: 78, signalCount: 5 }],
    ]),
    careerRecommendations: {
      studentProfileId: 'student-longitudinal-pattern-contract-test',
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
    longitudinalMemory,
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

describe('Decision LongitudinalPattern mentor type-surface contract', () => {
  it('decision-types.ts imports successfully through the public decision module', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
  });

  it('LongitudinalPattern resolves from the canonical mentor-intelligence type surface', () => {
    const pattern: LongitudinalPattern = createLongitudinalPattern();

    expect(pattern.pattern).toContain('validation experiments');
    expect(pattern.sourceJourneys.length).toBe(1);
  });

  it('LongitudinalPattern remains type-only in the decision-intelligence runtime surface', async () => {
    const decisionIntelligenceModule = await import('../index');

    expect(Object.prototype.hasOwnProperty.call(decisionIntelligenceModule, 'LongitudinalPattern')).toBe(false);
  });

  it('keeps DecisionInput longitudinal memory type-safe for valid analysis', () => {
    const engine = createDecisionIntelligenceEngine();
    const input = createDecisionInput([createOption()]);

    expect(input.longitudinalMemory?.[0]?.pattern).toContain('validation experiments');

    const analysis = engine.analyze(input);
    expectValidAnalysisShape(analysis);
  });

  it('preserves Phase 6.6.S empty-options validation', () => {
    const engine = createDecisionIntelligenceEngine();

    expect(() => engine.analyze(createDecisionInput([]))).toThrow(DecisionInputValidationError);
  });

  it('preserves Phase 6.6.T readiness-status contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(DECISION_READINESS_STATUSES).toContain(analysis.decisionReadiness);
    expect(analysis.decisionReadiness).toBe('NEEDS_MORE_INFO');
    expect(analysis.decisionReadiness).not.toBe('NEEDS_INFO');
  });

  it('preserves Phase 6.6.U experiment-effort contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    analysis.experiments.forEach((experiment) => {
      expect(VALID_EFFORTS).toContain(experiment.effort);
    });
  });

  it('preserves Phase 6.6.V mentor-guidance contract', () => {
    const engine = createDecisionIntelligenceEngine();
    const analysis = engine.analyze(createDecisionInput([createOption()]));

    expect(analysis.mentorGuidance.length).toBeGreaterThan(0);
  });

  it('preserves Phase 6.6.W option-analysis helper contract', () => {
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
  });

  it('preserves Phase 6.6.X TradeoffFramework contract', () => {
    const framework: TradeoffFramework = TRADEOFF_FRAMEWORKS[0];

    expect(framework.type).toBe('MONEY_VS_MEANING');
    expect(framework.resolutionStrategies.length).toBeGreaterThan(0);
  });

  it('preserves Phase 6.6.Y PsychologyProfile contract', () => {
    const profile: PsychologyProfile = createPsychologyProfile();
    const decisionProfile: DecisionInput['psychologyProfile'] = profile;

    expect(decisionProfile.analyticalThinking).toBe(0.78);
    expect(decisionProfile.riskTolerance).toBe(0.52);
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
