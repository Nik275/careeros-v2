import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { CareerFitAuthorityBinding } from '../CareerFitAuthorityBinding';
import type { DryRunExecutionContext } from '../AuthorityExecutionBindingTypes';

describe('CareerFitAuthorityBinding', () => {
  it('uses supplied result fallback as SELF_MIRRORED without mutating output', async () => {
    const output = Object.freeze({ careerId: 'career-1', overallFitScore: 86 });
    const binding = new CareerFitAuthorityBinding({
      now: createClock(),
    });

    const result = await binding.execute(createContext({ productionOutput: output }));

    expect(result.comparisonStatus).toBe('SELF_MIRRORED');
    expect(result.comparable).toBe(false);
    expect(result.independent).toBe(false);
    expect(result.outputSnapshot).toBe(output);
    expect(output).toEqual({ careerId: 'career-1', overallFitScore: 86 });
  });

  it('runs independent dry-run only when explicitly allowed', async () => {
    const binding = new CareerFitAuthorityBinding({
      independentOperation: () => ({ careerId: 'career-1', overallFitScore: 87 }),
      now: createClock(),
    });

    const result = await binding.execute(
      createContext({
        config: createObserveModeConfig({
          enabled: true,
          dryRunBindingsEnabled: true,
          allowIndependentDryRun: true,
        }),
      })
    );

    expect(result.comparisonStatus).toBe('INDEPENDENT_COMPARISON');
    expect(result.comparable).toBe(true);
    expect(result.independent).toBe(true);
    expect(result.outputSnapshot).toEqual({ careerId: 'career-1', overallFitScore: 87 });
  });

  it('returns NOT_COMPARABLE when independent execution and fallback are unavailable', async () => {
    const binding = new CareerFitAuthorityBinding({
      now: createClock(),
    });

    const result = await binding.execute(
      createContext({
        productionOutput: undefined,
        config: createObserveModeConfig({
          enabled: true,
          dryRunBindingsEnabled: true,
          allowSuppliedResultFallback: false,
        }),
      })
    );

    expect(result.comparisonStatus).toBe('NOT_COMPARABLE');
    expect(result.outputSnapshot).toBeUndefined();
  });
});

function createContext(
  overrides: Partial<DryRunExecutionContext> = {}
): DryRunExecutionContext {
  const config =
    overrides.config ??
    createObserveModeConfig({
      enabled: true,
      dryRunBindingsEnabled: true,
      allowSuppliedResultFallback: true,
    });
  return {
    observeRequest: {
      observeRequestId: 'observe-career-fit',
      productionCall: {
        callId: 'production-career-fit',
        flowName: 'career-fit',
        sourceModule: 'src/career-fit/career-fit-engine.ts',
        operationName: 'calculateFit',
        studentId: 'student-1',
        requestType: 'GENERATE',
        capability: 'GENERATE',
        timestamp: '2026-06-06T00:00:00.000Z',
        inputSnapshot: { careerId: 'career-1' },
        outputSnapshot: overrides.productionOutput ?? { careerId: 'career-1', overallFitScore: 86 },
        metadata: {
          hook: 'CareerFitEngine.calculateFit',
          authority: 'OptionGeneratorAuthority',
        },
      },
      config,
      metadata: {},
    },
    config,
    startedAt: '2026-06-06T00:00:00.000Z',
    productionInput: { careerId: 'career-1' },
    productionOutput: overrides.productionOutput ?? { careerId: 'career-1', overallFitScore: 86 },
    metadata: {},
    ...overrides,
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
