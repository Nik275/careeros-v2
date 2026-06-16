import { describe, expect, it } from 'vitest';
import { AssessmentObserveHook } from '../AssessmentObserveHook';
import { InMemoryObserveEventStore } from '../InMemoryObserveEventStore';
import { createObserveModeConfig } from '../ObserveModeConfig';
import type { ObserveEventStore } from '../ObserveEventStore';
import { createStorageResult } from '../ObserveEventStore';
import { ObserveTelemetryService } from '../ObserveTelemetryService';
import type { ObserveModeAuditRecord, ObserveModeRequest } from '../ObserveModeTypes';
import type {
  AnyObserveTelemetryEvent,
  ObserveStorageResult,
  ObserveStoreHealth,
} from '../ObserveTelemetryTypes';

describe('ObserveTelemetryService', () => {
  it('keeps telemetry disabled by default', () => {
    const service = new ObserveTelemetryService();

    const result = service.recordAuditRecord(createAuditRecord());

    expect(result).toMatchObject({
      stored: false,
      status: 'skipped',
    });
    expect(service.getSummary()).toMatchObject({
      enabled: false,
      storageMode: 'noop',
    });
  });

  it('sanitizes audit records before storing them', () => {
    const store = new InMemoryObserveEventStore();
    const service = new ObserveTelemetryService({
      config: createObserveModeConfig({
        telemetryEnabled: true,
        storageMode: 'memory',
        captureRawPayloads: false,
      }),
      store,
      now: () => '2026-06-06T00:00:00.000Z',
    });

    const result = service.recordAuditRecord(
      createAuditRecord({
        outputSnapshot: {
          studentId: 'student-123',
          responses: ['raw answer'],
          score: 90,
        },
      })
    );

    expect(result.stored).toBe(true);
    const stored = store.getRecent(10);
    expect(stored.length).toBeGreaterThan(0);
    expect(JSON.stringify(stored)).not.toContain('student-123');
    expect(JSON.stringify(stored)).not.toContain('raw answer');
  });

  it('keeps telemetry storage failures from breaking observe flow', () => {
    const service = new ObserveTelemetryService({
      config: createObserveModeConfig({
        telemetryEnabled: true,
        storageMode: 'memory',
      }),
      store: new ThrowingStore(),
    });

    expect(() => service.recordAuditRecord(createAuditRecord())).not.toThrow();
    expect(service.getLastResult()).toMatchObject({
      stored: false,
      status: 'failed',
      errorMessage: 'store unavailable',
    });
  });

  it('does not perform database writes through the default noop store', () => {
    const service = new ObserveTelemetryService();

    service.recordAuditRecord(createAuditRecord());

    expect(service.getStore().healthCheck()).toMatchObject({
      storageMode: 'noop',
      eventCount: 0,
    });
  });

  it('preserves existing observe hook production output while telemetry exists', async () => {
    const calls: ObserveModeRequest[] = [];
    const output = createAssessmentOutput();
    const telemetryService = new ObserveTelemetryService({
      config: createObserveModeConfig(),
    });
    const hook = new AssessmentObserveHook({
      telemetryService,
      router: {
        observe: async (request) => {
          calls.push(request);
          return {} as never;
        },
      },
    });

    hook.observeProcessResponses({
      questions: [],
      responses: [],
      productionOutput: output,
    });
    await hook.waitForIdle();

    expect(calls).toHaveLength(0);
    expect(output).toEqual(createAssessmentOutput());
  });
});

function createAuditRecord(
  overrides: {
    outputSnapshot?: unknown;
  } = {}
): ObserveModeAuditRecord {
  return {
    auditId: 'audit-1',
    observeRequestId: 'observe-1',
    traceId: 'trace-1',
    productionCall: {
      callId: 'production-call-1',
      flowName: 'assessment',
      sourceModule: 'src/assessment/assessment-engine.ts',
      operationName: 'processResponses',
      studentId: 'student-123',
      requestType: 'UNDERSTAND',
      capability: 'UNDERSTAND',
      timestamp: '2026-06-06T00:00:00.000Z',
      outputSnapshot: overrides.outputSnapshot ?? {
        profileConfidence: 80,
      },
      metadata: {
        authority: 'StudentUnderstandingAuthority',
        hook: 'AssessmentEngine.processResponses',
      },
    },
    comparison: {
      status: 'NOT_COMPARABLE',
      comparable: false,
      productionOutputCaptured: true,
      orchestratorOutputCaptured: false,
      drifts: [],
      notes: ['Skeleton orchestrator is not comparable.'],
    },
    status: 'NOT_COMPARABLE',
    createdAt: '2026-06-06T00:00:00.000Z',
    configSnapshot: createObserveModeConfig(),
    notes: [],
  };
}

function createAssessmentOutput(): Record<string, unknown> {
  return {
    cognitive: {},
    confidence: {
      profileConfidence: 80,
    },
  };
}

class ThrowingStore implements ObserveEventStore {
  append(_event: AnyObserveTelemetryEvent): ObserveStorageResult {
    throw new Error('store unavailable');
  }

  appendBatch(_events: readonly AnyObserveTelemetryEvent[]): ObserveStorageResult {
    throw new Error('store unavailable');
  }

  getByTraceId(_traceId: string): readonly AnyObserveTelemetryEvent[] {
    return [];
  }

  getByRequestId(_requestId: string): readonly AnyObserveTelemetryEvent[] {
    return [];
  }

  getRecent(_limit: number): readonly AnyObserveTelemetryEvent[] {
    return [];
  }

  getFailures(_limit: number): readonly AnyObserveTelemetryEvent[] {
    return [];
  }

  getDriftEvents(_limit: number): readonly AnyObserveTelemetryEvent[] {
    return [];
  }

  deleteExpired(_now: string): ObserveStorageResult {
    return createStorageResult();
  }

  healthCheck(): ObserveStoreHealth {
    return {
      healthy: false,
      storageMode: 'throwing-test',
      eventCount: 0,
      lastErrorMessage: 'store unavailable',
    };
  }
}
