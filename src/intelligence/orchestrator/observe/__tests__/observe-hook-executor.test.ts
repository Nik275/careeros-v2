import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../ObserveModeConfig';
import { ObserveHookExecutor } from '../ObserveHookExecutor';
import type { ObserveModeRequest } from '../ObserveModeTypes';

describe('ObserveHookExecutor', () => {
  it('does not create or route requests when observe mode is disabled', async () => {
    let created = false;
    let routed = false;
    const executor = new ObserveHookExecutor({
      config: createObserveModeConfig(),
      router: {
        observe: async () => {
          routed = true;
          return {} as never;
        },
      },
    });

    executor.run(() => {
      created = true;
      return createRequest();
    });
    await executor.waitForIdle();

    expect(created).toBe(false);
    expect(routed).toBe(false);
  });

  it('routes observe requests when enabled without returning production data', async () => {
    const calls: ObserveModeRequest[] = [];
    const executor = new ObserveHookExecutor({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });

    const result = executor.run(() => createRequest());
    await executor.waitForIdle();

    expect(result).toBeUndefined();
    expect(calls).toHaveLength(1);
  });

  it('catches synchronous request creation errors', async () => {
    const errors: unknown[] = [];
    const executor = new ObserveHookExecutor({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async () => ({} as never),
      },
      onError: (error) => errors.push(error),
    });

    executor.run(() => {
      throw new Error('request creation failed');
    });
    await executor.waitForIdle();

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
  });

  it('catches asynchronous router errors without throwing into callers', async () => {
    const errors: unknown[] = [];
    const executor = new ObserveHookExecutor({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async () => {
          throw new Error('router failed');
        },
      },
      onError: (error) => errors.push(error),
    });

    expect(() => executor.run(() => createRequest())).not.toThrow();
    await executor.waitForIdle();

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
  });

  it('tracks pending observe work until idle', async () => {
    let resolveObserve: (() => void) | undefined;
    let completed = false;
    const executor = new ObserveHookExecutor({
      config: createObserveModeConfig({
        enabled: true,
      }),
      router: {
        observe: async () => {
          await new Promise<void>((resolve) => {
            resolveObserve = resolve;
          });
          completed = true;
          return {} as never;
        },
      },
    });

    executor.run(() => createRequest());
    const idle = executor.waitForIdle();

    expect(completed).toBe(false);
    resolveObserve?.();
    await idle;

    expect(completed).toBe(true);
  });
});

function createRequest(): ObserveModeRequest {
  return {
    observeRequestId: 'observe-test-request',
    productionCall: {
      callId: 'production-call-test',
      flowName: 'assessment',
      sourceModule: 'src/assessment/assessment-engine.ts',
      operationName: 'processResponses',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      capability: 'UNDERSTAND',
      timestamp: '2026-06-06T00:00:00.000Z',
      metadata: {},
    },
    config: createObserveModeConfig({
      enabled: true,
    }),
    metadata: {},
  };
}
