import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { AssessmentAuthorityBinding } from '../AssessmentAuthorityBinding';
import type { DryRunExecutionContext } from '../AuthorityExecutionBindingTypes';

describe('AssessmentAuthorityBinding', () => {
  it('uses supplied result fallback as SELF_MIRRORED without mutating output', async () => {
    const output = Object.freeze({ profileConfidence: 80 });
    const binding = new AssessmentAuthorityBinding({
      now: createClock(),
    });

    const result = await binding.execute(createContext({ productionOutput: output }));

    expect(result.comparisonStatus).toBe('SELF_MIRRORED');
    expect(result.comparable).toBe(false);
    expect(result.independent).toBe(false);
    expect(result.outputSnapshot).toBe(output);
    expect(output).toEqual({ profileConfidence: 80 });
  });

  it('runs independent dry-run only when explicitly allowed', async () => {
    const binding = new AssessmentAuthorityBinding({
      independentOperation: () => ({ profileConfidence: 81 }),
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
    expect(result.outputSnapshot).toEqual({ profileConfidence: 81 });
  });

  it('returns NOT_COMPARABLE when independent execution and fallback are unavailable', async () => {
    const binding = new AssessmentAuthorityBinding({
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
      observeRequestId: 'observe-assessment',
      productionCall: {
        callId: 'production-assessment',
        flowName: 'assessment',
        sourceModule: 'src/assessment/assessment-engine.ts',
        operationName: 'processResponses',
        studentId: 'student-1',
        requestType: 'UNDERSTAND',
        capability: 'UNDERSTAND',
        timestamp: '2026-06-06T00:00:00.000Z',
        inputSnapshot: { questionCount: 1 },
        outputSnapshot: overrides.productionOutput ?? { profileConfidence: 80 },
        metadata: {
          hook: 'AssessmentEngine.processResponses',
          authority: 'StudentUnderstandingAuthority',
        },
      },
      config,
      metadata: {},
    },
    config,
    startedAt: '2026-06-06T00:00:00.000Z',
    productionInput: { questionCount: 1 },
    productionOutput: overrides.productionOutput ?? { profileConfidence: 80 },
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
