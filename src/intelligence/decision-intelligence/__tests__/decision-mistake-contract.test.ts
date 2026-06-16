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
  type Lesson,
  type Mistake,
  type TradeoffFramework,
} from '../index';
import type { PsychologyProfile } from '../../../domains/student/StudentProfile';
import type {
  ExtractedLesson,
  LongitudinalPattern,
  MistakeAnalysis,
  SuccessPattern,
} from '../../../mentor-intelligence/mentor-intelligence-types';

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
    id: 'pattern-mistake-contract' as SuccessPattern['id'],
    pattern: 'Students who study prior mistakes avoid premature commitments.',
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
    behaviors: ['reviews prior mistakes', 'runs small validations', 'checks warning signs'],
    enablingConditions: ['mentor examples', 'time to explore'],
    blockingConditions: ['hard deadline', 'pressure to commit'],
    sourceJourneys: ['journey-mistake-contract' as SuccessPattern['sourceJourneys'][number]],
    counterExamples: [],
    relatedPatterns: [],
  };

  return pattern;
}

function createContradiction(): Contradiction {
  return {
    dimensionA: 'money',
    dimensionB: 'meaning',
    severity: 'MEDIUM',
    description: 'Financial security is competing with meaningful work.',
    timestamp: new Date('2026-06-01T00:00:00.000Z'),
  };
}

function createLesson(): Lesson {
  const lesson: ExtractedLesson = {
    id: 'lesson-mistake-contract' as ExtractedLesson['id'],
    lesson: 'Validate assumptions with a small reversible experiment before committing.',
    category: 'DECISION_MAKING',
    type: 'VALIDATION_INSIGHT',
    frequency: {
      count: 5,
      total: 12,
      percentage: 5 / 12,
      classification: 'COMMON',
    },
    confidence: 0.76 as ExtractedLesson['confidence'],
    importance: 'HIGH',
    evidence: [
      {
        journeyId: 'journey-mistake-contract' as ExtractedLesson['evidence'][number]['journeyId'],
        situation: 'Choosing between stable and meaningful work.',
        action: 'Ran a short project before committing.',
        outcome: 'Improved clarity without closing options.',
        relevance: 0.82,
      },
    ],
    applicability: {
      careerStages: ['STUDENT'],
      situations: ['career choice under uncertainty'],
      prerequisites: ['access to a small test opportunity'],
      minSimilarityScore: 0.65 as ExtractedLesson['applicability']['minSimilarityScore'],
    },
    relatedLessons: [],
    sourceJourneys: ['journey-mistake-contract' as ExtractedLesson['sourceJourneys'][number]],
    extractedAt: new Date('2026-06-01T00:00:00.000Z'),
  };

  return lesson;
}

function createMistake(): MistakeAnalysis {
  return {
    id: 'mistake-decision-contract' as MistakeAnalysis['id'],
    mistake: 'Committing to a path before validating day-to-day fit.',
    category: 'INADEQUATE_VALIDATION',
    frequency: {
      count: 3,
      total: 10,
      percentage: 0.3,
      classification: 'COMMON',
    },
    cost: {
      timeCost: '6 months',
      financialCost: 'MODERATE',
      careerCost: 'MODERATE',
      opportunityCost: 'Missed lower-risk exploration windows.',
      emotionalCost: 'SIGNIFICANT',
    },
    confidence: 0.74 as MistakeAnalysis['confidence'],
    warningSigns: ['choosing without evidence', 'ignoring mentor warnings'],
    avoidanceStrategies: ['run a reversible experiment', 'interview practitioners'],
    recoveryStrategies: ['pause and reassess', 'convert sunk cost into learning'],
    sourceJourneys: ['journey-mistake-contract' as MistakeAnalysis['sourceJourneys'][number]],
    avoidanceExamples: [],
    relatedMistakes: [],
    extractedAt: new Date('2026-06-01T00:00:00.000Z'),
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
  const lessons: NonNullable<DecisionInput['lessons']> = [createLesson()];
  const mistakes: NonNullable<DecisionInput['mistakes']> = [createMistake()];

  return {
    id: 'decision-mistake-contract' as DecisionInput['id'],
    type: 'CAREER_CHOICE',
    studentId: 'student-mistake-contract-test',
    description: 'Choose a career path while avoiding known mistakes.',
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
      studentProfileId: 'student-mistake-contract-test',
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
    lessons,
    mistakes,
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

describe('Decision Mistake type-surface contract', () => {
  it('decision-types.ts imports successfully through the public decision module', () => {
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
  });

  it('Mistake resolves from the canonical mentor-intelligence type surface', () => {
    const mentorMistake: MistakeAnalysis = createMistake();
    const decisionMistake: Mistake = mentorMistake;

    expect(decisionMistake.mistake).toContain('Committing to a path');
    expect(decisionMistake.category).toBe('INADEQUATE_VALIDATION');
    expect(decisionMistake.warningSigns.length).toBeGreaterThan(0);
  });

  it('Mistake remains type-only in runtime module surfaces', async () => {
    const decisionIntelligenceModule = await import('../index');
    const mentorTypesModule = await import('../../../mentor-intelligence/mentor-intelligence-types');

    expect(Object.prototype.hasOwnProperty.call(decisionIntelligenceModule, 'Mistake')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(mentorTypesModule, 'MistakeAnalysis')).toBe(false);
  });

  it('keeps DecisionInput mistake fields type-safe for valid analysis', () => {
    const engine = createDecisionIntelligenceEngine();
    const input = createDecisionInput([createOption()]);
    const mistake = input.mistakes?.[0];

    expect(mistake?.avoidanceStrategies).toContain('run a reversible experiment');
    expect(mistake?.cost.careerCost).toBe('MODERATE');

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

    expect(memory[0]?.pattern).toContain('prior mistakes');
    expect(memory[0]?.sourceJourneys.length).toBe(1);
  });

  it('preserves Phase 6.6.AA Contradiction contract', () => {
    const contradiction: Contradiction = createContradiction();
    const contradictions: NonNullable<DecisionInput['contradictions']> = [contradiction];

    expect(contradictions[0]?.dimensionA).toBe('money');
    expect(contradictions[0]?.severity).toBe('MEDIUM');
  });

  it('preserves Phase 6.6.AB Lesson contract', () => {
    const lesson: Lesson = createLesson();
    const lessons: NonNullable<DecisionInput['lessons']> = [lesson];

    expect(lessons[0]?.lesson).toContain('Validate assumptions');
    expect(lessons[0]?.category).toBe('DECISION_MAKING');
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
