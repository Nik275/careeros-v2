import { describe, expect, it } from 'vitest';
import {
  DECISION_READINESS_STATUSES,
  DecisionInputValidationError,
  TRADEOFF_FRAMEWORKS,
  createDecisionIntelligenceEngine,
  type Contradiction,
  type DecisionAnalysis,
  type DecisionInput,
  type DecisionOption,
  type ExperimentSuggestion,
  type TradeoffFramework,
} from '../index';
import type { PsychologyProfile } from '../../../domains/student/StudentProfile';
import type { LongitudinalPattern, SuccessPattern } from '../../../mentor-intelligence/mentor-intelligence-types';
import type { Contradiction as StabilityContradiction } from '../../recommendation-stability/recommendation-stability-types';

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
    id: 'pattern-contradiction-contract' as SuccessPattern['id'],
    pattern: 'Students who test assumptions before committing improve decision quality.',
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
    sourceJourneys: ['journey-contradiction-contract' as SuccessPattern['sourceJourneys'][number]],
    counterExamples: [],
    relatedPatterns: [],
  };

  return pattern;
}

function createContradiction(): StabilityContradiction {
  return {
    dimensionA: 'money',
    dimensionB: 'meaning',
    severity: 'MEDIUM',
    description: 'Financial security is competing with meaningful work.',
    timestamp: new Date('2026-06-01T00:00:00.000Z'),
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
  const psychologyProfile: PsychologyProfile = createPsychologyProfile();
  const decisionPsychologyProfile: DecisionInput['psychologyProfile'] = psychologyProfile;
  const longitudinalMemory: NonNullable<DecisionInput['longitudinalMemory']> = [
    createLongitudinalPattern(),
  ];
  const contradictions: NonNullable<DecisionInput['contradictions']> = [createContradiction()];

  return {
    id: 'decision-contradiction-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-contradiction-contract-test',
    description: 'Choose a career path while balancing money and meaning.',
    options,
    context: {
      familyExpectations: ['financial stability'],
      peerInfluence: ['technology careers'],
      culturalFactors: ['education-focused environment'],
      economicClimate: 'competitive but opportunity-rich',
      personalCircumstances: ['final year student'],
      values: ['money', 'meaning', 'stability'],
      nonNegotiables: ['ethical work'],
      aspirationalGoals: ['build meaningful products'],
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
      studentProfileId: 'student-contradiction-contract-test',
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
    contradictions,
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

describe('Decision Contradiction type-surface contract', () => {
  it('decision-types.ts imports successfully through the public decision module', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
  });

  it('Contradiction resolves from the recommendation-stability type surface', () => {
    const stabilityContradiction: StabilityContradiction = createContradiction();
    const decisionContradiction: Contradiction = stabilityContradiction;

    expect(decisionContradiction.dimensionA).toBe('money');
    expect(decisionContradiction.dimensionB).toBe('meaning');
    expect(decisionContradiction.severity).toBe('MEDIUM');
  });

  it('Contradiction remains type-only in runtime module surfaces', async () => {
    const decisionIntelligenceModule = await import('../index');
    const stabilityTypesModule = await import('../../recommendation-stability/recommendation-stability-types');

    expect(Object.prototype.hasOwnProperty.call(decisionIntelligenceModule, 'Contradiction')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(stabilityTypesModule, 'Contradiction')).toBe(false);
  });

  it('keeps DecisionInput contradiction fields type-safe for valid analysis', () => {
    const engine = createDecisionIntelligenceEngine();
    const input = createDecisionInput([createOption()]);
    const contradiction = input.contradictions?.[0];

    expect(contradiction?.description).toContain('Financial security');
    expect(contradiction?.timestamp).toBeInstanceOf(Date);

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
    expect(analysis.optionality.score).toBeGreaterThanOrEqual(0);
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

  it('preserves Phase 6.6.Z LongitudinalPattern contract', () => {
    const pattern: LongitudinalPattern = createLongitudinalPattern();
    const memory: NonNullable<DecisionInput['longitudinalMemory']> = [pattern];

    expect(memory[0]?.pattern).toContain('test assumptions');
    expect(memory[0]?.sourceJourneys.length).toBe(1);
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
