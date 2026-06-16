import { describe, expect, it } from 'vitest';
import { InMemoryObserveEventStore } from '../../observe/InMemoryObserveEventStore';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { OrchestratorDriftDetector } from '../../observe/OrchestratorDriftDetector';
import { ObserveTelemetryService } from '../../observe/ObserveTelemetryService';
import type { ObserveModeRequest } from '../../observe/ObserveModeTypes';
import { AssessmentAuthorityBinding } from '../AssessmentAuthorityBinding';
import { AuthorityExecutionBindingRegistry } from '../AuthorityExecutionBindingRegistry';
import { DryRunAuthorityExecutionCoordinator } from '../DryRunAuthorityExecutionCoordinator';

describe('DryRunAuthorityExecutionCoordinator', () => {
  it('does not execute bindings when observe mode is disabled', async () => {
    let executed = false;
    const registry = new AuthorityExecutionBindingRegistry();
    registry.register(
      new AssessmentAuthorityBinding({
        independentOperation: () => {
          executed = true;
          return { profileConfidence: 80 };
        },
      })
    );
    const coordinator = new DryRunAuthorityExecutionCoordinator({ registry });

    const result = await coordinator.execute(
      createRequest(),
      createObserveModeConfig({
        enabled: false,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_DISABLED');
    expect(executed).toBe(false);
  });

  it('returns BINDING_NOT_FOUND for missing bindings', async () => {
    const coordinator = new DryRunAuthorityExecutionCoordinator({
      registry: new AuthorityExecutionBindingRegistry(),
    });

    const result = await coordinator.execute(
      createRequest(),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_NOT_FOUND');
  });

  it('returns SELF_MIRRORED for supplied result fallback', async () => {
    const registry = new AuthorityExecutionBindingRegistry();
    registry.register(new AssessmentAuthorityBinding({ now: createClock() }));
    const coordinator = new DryRunAuthorityExecutionCoordinator({
      registry,
      now: createClock(),
    });

    const result = await coordinator.execute(
      createRequest(),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
        allowSuppliedResultFallback: true,
      })
    );

    expect(result.comparisonStatus).toBe('SELF_MIRRORED');
    expect(result.comparable).toBe(false);
  });

  it('does not count SELF_MIRRORED as MATCHED', async () => {
    const bindingResult = await createSelfMirroredResult();
    const detector = new OrchestratorDriftDetector();

    const comparison = detector.compare({
      productionCall: createRequest().productionCall,
      orchestratorCall: {
        requestId: 'orchestrator-1',
        status: 'SELF_MIRRORED',
        outputSnapshot: bindingResult.outputSnapshot,
        bindingResult,
        startedAt: '2026-06-06T00:00:00.000Z',
        completedAt: '2026-06-06T00:00:01.000Z',
        latencyMs: 1000,
      },
      compareOutputs: true,
    });

    expect(comparison.status).toBe('SELF_MIRRORED');
    expect(comparison.comparable).toBe(false);
  });

  it('allows independent comparison to return MATCHED when outputs match', async () => {
    const bindingResult = await createIndependentResult({ profileConfidence: 80 });
    const detector = new OrchestratorDriftDetector();

    const comparison = detector.compare({
      productionCall: createRequest().productionCall,
      orchestratorCall: {
        requestId: 'orchestrator-1',
        status: 'INDEPENDENT_COMPARISON',
        outputSnapshot: bindingResult.outputSnapshot,
        bindingResult,
        startedAt: '2026-06-06T00:00:00.000Z',
        completedAt: '2026-06-06T00:00:01.000Z',
        latencyMs: 1000,
      },
      compareOutputs: true,
    });

    expect(comparison.status).toBe('MATCHED');
    expect(comparison.comparable).toBe(true);
  });

  it('allows independent comparison to return DRIFT_DETECTED when outputs differ', async () => {
    const bindingResult = await createIndependentResult({ profileConfidence: 60 });
    const detector = new OrchestratorDriftDetector();

    const comparison = detector.compare({
      productionCall: createRequest().productionCall,
      orchestratorCall: {
        requestId: 'orchestrator-1',
        status: 'INDEPENDENT_COMPARISON',
        outputSnapshot: bindingResult.outputSnapshot,
        bindingResult,
        startedAt: '2026-06-06T00:00:00.000Z',
        completedAt: '2026-06-06T00:00:01.000Z',
        latencyMs: 1000,
      },
      compareOutputs: true,
    });

    expect(comparison.status).toBe('DRIFT_DETECTED');
    expect(comparison.drifts[0]?.driftType).toBe('OUTPUT_MISMATCH');
  });

  it('captures binding failures as telemetry without throwing', async () => {
    const store = new InMemoryObserveEventStore();
    const telemetryService = new ObserveTelemetryService({
      config: createObserveModeConfig({
        telemetryEnabled: true,
        storageMode: 'memory',
      }),
      store,
    });
    const registry = new AuthorityExecutionBindingRegistry();
    registry.register(
      new AssessmentAuthorityBinding({
        independentOperation: () => {
          throw new Error('binding failed');
        },
      })
    );
    const coordinator = new DryRunAuthorityExecutionCoordinator({
      registry,
      telemetryService,
    });

    const result = await coordinator.execute(
      createRequest(),
      createObserveModeConfig({
        enabled: true,
        dryRunBindingsEnabled: true,
        enabledBindings: ['assessment.processResponses'],
        allowIndependentDryRun: true,
      })
    );

    expect(result.comparisonStatus).toBe('BINDING_FAILED');
    expect(store.getFailures(10).length).toBeGreaterThan(0);
    expect(JSON.stringify(store.getRecent(10))).not.toContain('raw-answer');
  });
});

async function createSelfMirroredResult() {
  const registry = new AuthorityExecutionBindingRegistry();
  registry.register(new AssessmentAuthorityBinding({ now: createClock() }));
  const coordinator = new DryRunAuthorityExecutionCoordinator({
    registry,
    now: createClock(),
  });
  return coordinator.execute(
    createRequest(),
    createObserveModeConfig({
      enabled: true,
      dryRunBindingsEnabled: true,
      enabledBindings: ['assessment.processResponses'],
    })
  );
}

async function createIndependentResult(output: unknown) {
  const registry = new AuthorityExecutionBindingRegistry();
  registry.register(
    new AssessmentAuthorityBinding({
      independentOperation: () => output,
      now: createClock(),
    })
  );
  const coordinator = new DryRunAuthorityExecutionCoordinator({
    registry,
    now: createClock(),
  });
  return coordinator.execute(
    createRequest(),
    createObserveModeConfig({
      enabled: true,
      dryRunBindingsEnabled: true,
      enabledBindings: ['assessment.processResponses'],
      allowIndependentDryRun: true,
    })
  );
}

function createRequest(): ObserveModeRequest {
  const config = createObserveModeConfig({
    enabled: true,
    dryRunBindingsEnabled: true,
    captureInputs: true,
    captureOutputs: true,
  });
  return {
    observeRequestId: 'observe-assessment',
    traceId: 'trace-assessment',
    productionCall: {
      callId: 'production-assessment',
      flowName: 'assessment',
      sourceModule: 'src/assessment/assessment-engine.ts',
      operationName: 'processResponses',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      capability: 'UNDERSTAND',
      timestamp: '2026-06-06T00:00:00.000Z',
      inputSnapshot: {
        responses: ['raw-answer'],
      },
      outputSnapshot: {
        profileConfidence: 80,
      },
      metadata: {
        hook: 'AssessmentEngine.processResponses',
        authority: 'StudentUnderstandingAuthority',
      },
    },
    config,
    metadata: {},
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
