import { describe, expect, it } from 'vitest';
import { AuthorityExecutionBindingRegistry } from '../AuthorityExecutionBindingRegistry';
import { CareerFitAuthorityBinding } from '../CareerFitAuthorityBinding';
import { DryRunAuthorityExecutionCoordinator } from '../DryRunAuthorityExecutionCoordinator';
import {
  compareNormalizedBindingOutputs,
  normalizeCareerFitBindingOutput,
} from '../BindingOutputNormalizer';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveExecutionGuard } from '../../observe/ObserveExecutionGuard';
import { CareerFitObserveHook } from '../../observe/CareerFitObserveHook';
import { IntelligenceOrchestrator } from '../../IntelligenceOrchestrator';
import { OrchestratorDriftDetector } from '../../observe/OrchestratorDriftDetector';
import type { ObserveModeRequest } from '../../observe/ObserveModeTypes';

describe('Phase 4.9 independent dry-run pilot', () => {
  it('keeps the independent pilot binding disabled by default', () => {
    const config = createObserveModeConfig();

    expect(config.enableIndependentPilotBinding).toBe(false);
    expect(config.allowPilotDryRunExecution).toBe(false);
    expect(config.dryRunBindingsEnabled).toBe(false);
  });

  it('does not execute dry-run when observe mode is disabled', async () => {
    let executed = false;
    const coordinator = createCoordinator();

    const result = await coordinator.execute(
      createCareerFitRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawCareerFitOutput();
        },
      }),
      createObserveModeConfig({
        enabled: false,
        dryRunBindingsEnabled: true,
        enabledBindings: ['career-fit.calculateFit'],
        enableIndependentPilotBinding: true,
        pilotBindingName: 'career-fit.calculateFit',
        allowPilotDryRunExecution: true,
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('does not enable independent dry-run when only observe mode is enabled', async () => {
    let executed = false;
    const coordinator = createCoordinator();

    const result = await coordinator.execute(
      createCareerFitRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawCareerFitOutput();
        },
      }),
      createObserveModeConfig({
        enabled: true,
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('runs the independent pilot only when pilot config is enabled', async () => {
    let executed = false;
    const coordinator = createCoordinator();

    const withoutPilot = await coordinator.execute(
      createCareerFitRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawCareerFitOutput();
        },
      }),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['career-fit.calculateFit'],
      })
    );

    expect(withoutPilot.comparisonStatus).toBe('SELF_MIRRORED');
    expect(executed).toBe(false);

    const withPilot = await coordinator.execute(
      createCareerFitRequest({
        independentDryRunOperation: () => {
          executed = true;
          return createRawCareerFitOutput();
        },
      }),
      createPilotConfig()
    );

    expect(withPilot.comparisonStatus).toBe('INDEPENDENT_COMPARISON');
    expect(withPilot.independent).toBe(true);
    expect(executed).toBe(true);
  });

  it('keeps production output unchanged during independent pilot execution', async () => {
    const productionOutput = Object.freeze(createNormalizedCareerFitOutput());
    const coordinator = createCoordinator();

    await coordinator.execute(
      createCareerFitRequest({
        productionOutput,
        independentDryRunOperation: () => createRawCareerFitOutput(),
      }),
      createPilotConfig()
    );

    expect(productionOutput).toEqual(createNormalizedCareerFitOutput());
  });

  it('returns FAILED safely when dry-run execution throws', async () => {
    const productionOutput = Object.freeze(createNormalizedCareerFitOutput());
    const coordinator = createCoordinator();

    const result = await coordinator.execute(
      createCareerFitRequest({
        productionOutput,
        independentDryRunOperation: () => {
          throw new Error('pilot failed');
        },
      }),
      createPilotConfig()
    );

    expect(result.comparisonStatus).toBe('BINDING_FAILED');
    expect(result.failure?.message).toBe('pilot failed');
    expect(productionOutput).toEqual(createNormalizedCareerFitOutput());
  });

  it('prevents nested observe invocation through the recursion guard', async () => {
    ObserveExecutionGuard.resetForTests();
    const calls: ObserveModeRequest[] = [];
    const hook = new CareerFitObserveHook({
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

    ObserveExecutionGuard.runWithoutObserve(() => {
      hook.observeCalculateFit({
        profile: {},
        career: { careerId: 'career-1' },
        profileId: 'profile-1',
        productionOutput: createRawCareerFitOutput(),
      });
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(ObserveExecutionGuard.getSnapshot().skippedRecursiveObserveCount).toBe(1);
  });

  it('returns MATCHED for equivalent normalized dry-run output', async () => {
    const result = await createPilotBindingResult(createRawCareerFitOutput());
    const comparison = compareWithDetector(result);

    expect(comparison.status).toBe('MATCHED');
    expect(comparison.comparable).toBe(true);
  });

  it('returns DRIFT_DETECTED for different normalized dry-run output', async () => {
    const result = await createPilotBindingResult({
      ...createRawCareerFitOutput(),
      overallFitScore: 70,
    });
    const comparison = compareWithDetector(result);

    expect(comparison.status).toBe('DRIFT_DETECTED');
    expect(comparison.drifts[0]?.driftType).toBe('OUTPUT_MISMATCH');
  });

  it('does not count SELF_MIRRORED as MATCHED', async () => {
    const coordinator = createCoordinator();
    const result = await coordinator.execute(
      createCareerFitRequest(),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['career-fit.calculateFit'],
      })
    );
    const comparison = compareWithDetector(result);

    expect(result.comparisonStatus).toBe('SELF_MIRRORED');
    expect(comparison.status).toBe('SELF_MIRRORED');
    expect(comparison.status).not.toBe('MATCHED');
  });

  it('does not count NOT_COMPARABLE as MATCHED', async () => {
    const coordinator = createCoordinator();
    const result = await coordinator.execute(
      createCareerFitRequest({
        productionOutput: undefined,
      }),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['career-fit.calculateFit'],
        allowSuppliedResultFallback: false,
      })
    );
    const comparison = compareWithDetector(result);

    expect(result.comparisonStatus).toBe('NOT_COMPARABLE');
    expect(comparison.status).toBe('NOT_COMPARABLE');
    expect(comparison.status).not.toBe('MATCHED');
  });

  it('ignores volatile fields during normalization', () => {
    const comparison = compareNormalizedBindingOutputs({
      productionOutput: {
        ...createRawCareerFitOutput(),
        generatedAt: '2026-01-01T00:00:00.000Z',
        id: 'fit-1',
      },
      dryRunOutput: {
        ...createRawCareerFitOutput(),
        generatedAt: '2026-01-02T00:00:00.000Z',
        id: 'fit-2',
      },
    });

    expect(comparison.status).toBe('MATCHED');
    expect(comparison.differences).toEqual([]);
  });

  it('detects stable semantic differences during normalization', () => {
    const comparison = compareNormalizedBindingOutputs({
      productionOutput: createRawCareerFitOutput(),
      dryRunOutput: {
        ...createRawCareerFitOutput(),
        fitLevel: 'MODERATE',
      },
    });

    expect(comparison.status).toBe('DRIFT_DETECTED');
    expect(comparison.differences).toContain('fitLevel');
  });

  it('keeps IntelligenceOrchestrator free of direct legacy engine imports', () => {
    const orchestratorSource = IntelligenceOrchestrator.toString();
    const bindingSource = CareerFitAuthorityBinding.toString();

    expect(orchestratorSource).not.toContain('career-fit-engine');
    expect(orchestratorSource).not.toContain('assessment-engine');
    expect(bindingSource).not.toContain("from '../../../career-fit");
    expect(bindingSource).not.toContain("from '../../career-fit");
  });

  it('normalizes raw career-fit outputs into stable comparable summaries', () => {
    expect(normalizeCareerFitBindingOutput(createRawCareerFitOutput())).toEqual(
      createNormalizedCareerFitOutput()
    );
  });
});

function createCoordinator(): DryRunAuthorityExecutionCoordinator {
  const registry = new AuthorityExecutionBindingRegistry();
  registry.register(new CareerFitAuthorityBinding({ now: createClock() }));
  return new DryRunAuthorityExecutionCoordinator({
    registry,
    now: createClock(),
  });
}

async function createPilotBindingResult(dryRunOutput: unknown) {
  const coordinator = createCoordinator();
  return coordinator.execute(
    createCareerFitRequest({
      independentDryRunOperation: () => dryRunOutput,
    }),
    createPilotConfig()
  );
}

function compareWithDetector(bindingResult: Awaited<ReturnType<typeof createPilotBindingResult>>) {
  const detector = new OrchestratorDriftDetector();
  return detector.compare({
    productionCall: createCareerFitRequest().productionCall,
    orchestratorCall: {
      requestId: 'orchestrator-1',
      status:
        bindingResult.comparisonStatus === 'INDEPENDENT_COMPARISON'
          ? 'INDEPENDENT_COMPARISON'
          : bindingResult.comparisonStatus,
      outputSnapshot: bindingResult.outputSnapshot,
      bindingResult,
      startedAt: '2026-06-06T00:00:00.000Z',
      completedAt: '2026-06-06T00:00:01.000Z',
      latencyMs: 1000,
    },
    compareOutputs: true,
  });
}

function createPilotConfig() {
  return createObserveModeConfig({
    enabled: true,
    dryRunBindingsEnabled: true,
    enabledBindings: ['career-fit.calculateFit'],
    enableIndependentPilotBinding: true,
    pilotBindingName: 'career-fit.calculateFit',
    allowPilotDryRunExecution: true,
  });
}

function createCareerFitRequest(
  overrides: {
    productionOutput?: unknown;
    independentDryRunOperation?: () => unknown;
  } = {}
): ObserveModeRequest {
  const config = createPilotConfig();
  return {
    observeRequestId: 'observe-career-fit',
    traceId: 'trace-career-fit',
    productionCall: {
      callId: 'production-career-fit',
      flowName: 'career-fit',
      sourceModule: 'src/career-fit/career-fit-engine.ts',
      operationName: 'calculateFit',
      studentId: 'student-1',
      requestType: 'GENERATE',
      capability: 'GENERATE',
      timestamp: '2026-06-06T00:00:00.000Z',
      inputSnapshot: {
        profileId: 'profile-1',
        careerId: 'career-1',
      },
      outputSnapshot:
        'productionOutput' in overrides
          ? overrides.productionOutput
          : createNormalizedCareerFitOutput(),
      metadata: {
        hook: 'CareerFitEngine.calculateFit',
        authority: 'OptionGeneratorAuthority',
      },
    },
    config,
    executionPayload: {
      independentDryRunOperation: overrides.independentDryRunOperation,
    },
    metadata: {},
  };
}

function createRawCareerFitOutput(): Record<string, unknown> {
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
    concerns: [{ severity: 'LOW' }],
    generatedAt: '2026-06-06T00:00:00.000Z',
    id: 'volatile-fit-id',
  };
}

function createNormalizedCareerFitOutput(): Record<string, unknown> {
  return {
    careerId: 'career-1',
    studentProfileId: 'profile-1',
    overallFitScore: 86,
    fitLevel: 'STRONG',
    confidenceOverall: 82,
    confidenceLevel: 'HIGH',
    strengthCount: 1,
    concernCount: 1,
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
