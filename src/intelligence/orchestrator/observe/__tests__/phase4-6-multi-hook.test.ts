import { describe, expect, it } from 'vitest';
import { AssessmentObserveHook } from '../AssessmentObserveHook';
import { CareerFitObserveHook } from '../CareerFitObserveHook';
import { createObserveModeConfig } from '../ObserveModeConfig';
import { ObserveModeRouter } from '../ObserveModeRouter';
import type { ObserveModeRequest } from '../ObserveModeTypes';

describe('Phase 4.6 controlled observe-mode expansion', () => {
  it('keeps the existing assessment hook disabled by default', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new AssessmentObserveHook({
      router: createRecordingRouter(calls),
    });
    const output = createAssessmentOutput();

    hook.observeProcessResponses({
      questions: createAssessmentQuestions(),
      responses: createAssessmentResponses(),
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(output).toEqual(createAssessmentOutput());
  });

  it('keeps the new career-fit hook disabled by default', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new CareerFitObserveHook({
      router: createRecordingRouter(calls),
    });
    const output = createCareerFitOutput();

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(output).toEqual(createCareerFitOutput());
  });

  it('preserves career-fit production output unchanged when observe mode is enabled', async () => {
    const output = createCareerFitOutput();
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureInputs: true,
        captureOutputs: true,
      }),
      router: {
        observe: async () => ({
          status: 'NOT_COMPARABLE',
        } as never),
      },
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(output).toEqual(createCareerFitOutput());
  });

  it('preserves career-fit production output unchanged when observe routing throws', async () => {
    const errors: unknown[] = [];
    const output = createCareerFitOutput();
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async () => {
          throw new Error('observe failed');
        },
      },
      onError: (error) => errors.push(error),
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(errors).toHaveLength(1);
    expect(output).toEqual(createCareerFitOutput());
  });

  it('captures normalized career-fit snapshots without raw profile or career payloads', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureInputs: true,
        captureOutputs: true,
      }),
      router: createRecordingRouter(calls),
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: createCareerFitOutput(),
      studentId: 'student-1',
    });
    await hook.waitForIdle();

    expect(calls[0]?.productionCall).toMatchObject({
      flowName: 'career-fit',
      sourceModule: 'src/career-fit/career-fit-engine.ts',
      operationName: 'calculateFit',
      studentId: 'student-1',
      requestType: 'GENERATE',
      capability: 'GENERATE',
    });
    expect(calls[0]?.productionCall.inputSnapshot).toEqual({
      profileId: 'profile-1',
      careerId: 'career-1',
      hasProfileConfidence: true,
      profileSections: 6,
    });
    expect(calls[0]?.productionCall.outputSnapshot).toMatchObject({
      careerId: 'career-1',
      studentProfileId: 'profile-1',
      overallFitScore: 86,
      fitLevel: 'STRONG',
      confidenceOverall: 82,
      confidenceLevel: 'HIGH',
      strengthCount: 1,
      concernCount: 1,
    });
    expect(JSON.stringify(calls[0]?.productionCall.inputSnapshot)).not.toContain('raw-secret');
    expect(JSON.stringify(calls[0]?.productionCall.outputSnapshot)).not.toContain('raw-secret');
  });

  it('applies payload size protection to career-fit normalized snapshots', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureInputs: true,
        captureOutputs: true,
        maxPayloadSize: 5,
      }),
      router: createRecordingRouter(calls),
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: createCareerFitOutput(),
    });
    await hook.waitForIdle();

    expect(calls[0]?.productionCall.inputSnapshot).toMatchObject({
      omitted: true,
    });
    expect(calls[0]?.productionCall.outputSnapshot).toMatchObject({
      omitted: true,
    });
  });

  it('does not mutate frozen career-fit output objects', async () => {
    const output = Object.freeze(createCareerFitOutput());
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureOutputs: true,
      }),
      router: {
        observe: async () => ({
          status: 'NOT_COMPARABLE',
        } as never),
      },
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(output).toEqual(createCareerFitOutput());
  });

  it('generates an audit record for the career-fit hook when enabled', async () => {
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureOutputs: true,
        sampleRate: 1,
      }),
      router,
      now: createClock(),
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: createCareerFitOutput(),
      requestId: 'career-fit-hook-audit',
    });
    await hook.waitForIdle();

    expect(router.getAuditService().getAuditSummary().totalRecords).toBe(1);
    expect(router.getAuditService().listRecords()[0]?.productionCall.flowName).toBe('career-fit');
  });

  it('reports career-fit drift as NOT_COMPARABLE for skeleton observe output', async () => {
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });
    const hook = new CareerFitObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureOutputs: true,
      }),
      router,
      now: createClock(),
    });

    hook.observeCalculateFit({
      profile: createProfile(),
      career: createCareer(),
      profileId: 'profile-1',
      productionOutput: createCareerFitOutput(),
    });
    await hook.waitForIdle();

    expect(router.getAuditService().listRecords()[0]?.comparison.status).toBe('NOT_COMPARABLE');
  });

  it('keeps observe routing free of direct legacy engine calls', () => {
    expect(ObserveModeRouter.toString()).not.toContain('AssessmentEngine');
    expect(ObserveModeRouter.toString()).not.toContain('CareerFitEngine');
    expect(ObserveModeRouter.toString()).not.toContain('createCareerFitEngine');
  });
});

function createRecordingRouter(calls: ObserveModeRequest[]): Pick<ObserveModeRouter, 'observe'> {
  return {
    observe: async (request) => {
      calls.push(request);
      return {} as never;
    },
  };
}

function createAssessmentQuestions(): readonly Record<string, unknown>[] {
  return [
    {
      id: 'q1',
      type: 'likert',
      category: 'cognitive',
      dimension: 'analyticalThinking',
    },
  ];
}

function createAssessmentResponses(): readonly Record<string, unknown>[] {
  return [
    {
      questionId: 'q1',
      type: 'likert',
      value: 5,
    },
  ];
}

function createAssessmentOutput(): Record<string, unknown> {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    strengths: {
      topStrengths: ['Analytical Thinking'],
    },
    weaknesses: {
      developmentAreas: ['Creative Thinking'],
    },
    confidence: {
      profileConfidence: 80,
      assessmentCompleteness: 70,
    },
  };
}

function createProfile(): Record<string, unknown> {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: {
      overall: 90,
    },
    rawNotes: 'raw-secret-profile-data',
  };
}

function createCareer(): Record<string, unknown> {
  return {
    careerId: 'career-1',
    title: 'Systems Designer',
    rawMarketData: 'raw-secret-career-data',
  };
}

function createCareerFitOutput(): Record<string, unknown> {
  return {
    careerId: 'career-1',
    studentProfileId: 'profile-1',
    overallFitScore: 86,
    fitLevel: 'STRONG',
    confidence: {
      overall: 82,
      level: 'HIGH',
    },
    strengths: ['Systems thinking'],
    concerns: [
      {
        severity: 'LOW',
      },
    ],
    rawExplanation: 'raw-secret-explanation-data',
  };
}

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
