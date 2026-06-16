import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../ObserveModeConfig';
import { ObserveModeRouter } from '../ObserveModeRouter';
import { AssessmentObserveHook } from '../AssessmentObserveHook';
import type { ObserveModeRequest } from '../ObserveModeTypes';

describe('Phase 4.5 single assessment observe hook', () => {
  it('keeps observe mode disabled by default', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new AssessmentObserveHook({
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });
    const output = createProductionOutput();

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(output).toEqual(createProductionOutput());
  });

  it('preserves production output unchanged when observe mode is enabled', async () => {
    const output = createProductionOutput();
    const hook = new AssessmentObserveHook({
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

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(output).toEqual(createProductionOutput());
  });

  it('preserves production output unchanged when observe-mode router throws', async () => {
    const errors: unknown[] = [];
    const output = createProductionOutput();
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async () => {
          throw new Error('observe router failed');
        },
      },
      onError: (error) => errors.push(error),
    });

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(errors).toHaveLength(1);
    expect(output).toEqual(createProductionOutput());
  });

  it('creates an audit record when observe mode is enabled', async () => {
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureOutputs: true,
        sampleRate: 1,
      }),
      router,
      now: createClock(),
    });

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: createProductionOutput(),
      requestId: 'assessment-hook-audit',
    });
    await hook.waitForIdle();

    expect(router.getAuditService().getAuditSummary().totalRecords).toBe(1);
    expect(router.getAuditService().listRecords()[0]?.status).toBe('NOT_COMPARABLE');
  });

  it('passes normalized production output into drift comparison', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureInputs: true,
        captureOutputs: true,
      }),
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: createProductionOutput(),
    });
    await hook.waitForIdle();

    expect(calls[0]?.productionCall.outputSnapshot).toMatchObject({
      hasCognitiveProfile: true,
      profileConfidence: 80,
      topStrengthCount: 1,
    });
    expect(calls[0]?.productionCall.inputSnapshot).toMatchObject({
      questionCount: 1,
      responseCount: 1,
      questionTypes: ['likert'],
    });
  });

  it('handles NOT_COMPARABLE honestly for skeleton observe output', async () => {
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureOutputs: true,
      }),
      router,
      now: createClock(),
    });

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: createProductionOutput(),
    });
    await hook.waitForIdle();

    expect(router.getAuditService().listRecords()[0]?.comparison.status).toBe('NOT_COMPARABLE');
  });

  it('applies payload size protection to normalized snapshots', async () => {
    const calls: ObserveModeRequest[] = [];
    const hook = new AssessmentObserveHook({
      config: createObserveModeConfig({
        enabled: true,
        captureInputs: true,
        captureOutputs: true,
        maxPayloadSize: 5,
      }),
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: createProductionOutput(),
    });
    await hook.waitForIdle();

    expect(calls[0]?.productionCall.inputSnapshot).toMatchObject({
      omitted: true,
    });
    expect(calls[0]?.productionCall.outputSnapshot).toMatchObject({
      omitted: true,
    });
  });

  it('does not mutate production output objects', async () => {
    const output = Object.freeze(createProductionOutput());
    const hook = new AssessmentObserveHook({
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

    hook.observeProcessResponses({
      questions: createQuestions(),
      responses: createResponses(),
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(output).toEqual(createProductionOutput());
  });

  it('does not add direct legacy engine calls to orchestrator observe routing', () => {
    expect(ObserveModeRouter.toString()).not.toContain('AssessmentEngine');
    expect(ObserveModeRouter.toString()).not.toContain('createAssessmentEngine');
  });
});

function createQuestions(): readonly Record<string, unknown>[] {
  return [
    {
      id: 'q1',
      type: 'likert',
      category: 'cognitive',
      dimension: 'analyticalThinking',
      weight: 100,
    },
  ];
}

function createResponses(): readonly Record<string, unknown>[] {
  return [
    {
      questionId: 'q1',
      type: 'likert',
      value: 5,
    },
  ];
}

function createProductionOutput(): Record<string, unknown> {
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

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
