import { describe, expect, it } from 'vitest';
import { InMemoryObserveEventStore } from '../InMemoryObserveEventStore';
import { ObserveTelemetryExporter } from '../ObserveTelemetryExporter';
import type { AnyObserveTelemetryEvent } from '../ObserveTelemetryTypes';

describe('ObserveTelemetryExporter', () => {
  it('exports trace events as JSON-safe summaries', () => {
    const store = new InMemoryObserveEventStore();
    store.append(createEvent('event-1', { traceId: 'trace-1' }));
    const exporter = new ObserveTelemetryExporter({
      store,
      now: () => '2026-06-06T00:00:00.000Z',
    });

    const exported = exporter.exportByTraceId('trace-1');

    expect(exported).toMatchObject({
      exportedAt: '2026-06-06T00:00:00.000Z',
      eventCount: 1,
    });
    expect(() => JSON.stringify(exported)).not.toThrow();
  });

  it('exports failure and drift event subsets', () => {
    const store = new InMemoryObserveEventStore();
    store.append(createEvent('event-1', { eventType: 'failure', status: 'FAILED' }));
    store.append(createEvent('event-2', { eventType: 'drift', status: 'DRIFT_DETECTED' }));
    const exporter = new ObserveTelemetryExporter({
      store,
      now: () => '2026-06-06T00:00:00.000Z',
    });

    expect(exporter.exportFailures(10).eventCount).toBe(1);
    expect(exporter.exportDriftEvents(10).eventCount).toBe(1);
  });

  it('exports a JSON-safe health summary without creating files', () => {
    const store = new InMemoryObserveEventStore();
    const exporter = new ObserveTelemetryExporter({
      store,
      now: () => '2026-06-06T00:00:00.000Z',
    });

    const summary = exporter.exportSummary();

    expect(summary).toMatchObject({
      exportedAt: '2026-06-06T00:00:00.000Z',
      recentEventCount: 0,
      failureCount: 0,
      driftEventCount: 0,
    });
    expect(() => JSON.stringify(summary)).not.toThrow();
  });
});

function createEvent(
  eventId: string,
  overrides: Partial<AnyObserveTelemetryEvent> = {}
): AnyObserveTelemetryEvent {
  return {
    eventId,
    eventType: overrides.eventType ?? 'audit',
    schemaVersion: '1.0',
    traceId: overrides.traceId ?? 'trace-1',
    requestId: overrides.requestId ?? 'request-1',
    flowType: overrides.flowType ?? 'assessment',
    authority: overrides.authority ?? 'StudentUnderstandingAuthority',
    capability: overrides.capability ?? 'UNDERSTAND',
    hookName: overrides.hookName ?? 'AssessmentEngine.processResponses',
    timestamp: overrides.timestamp ?? '2026-06-06T00:00:00.000Z',
    status: overrides.status ?? 'NOT_COMPARABLE',
    privacyClassification: overrides.privacyClassification ?? 'SENSITIVE',
    payloadSummary: overrides.payloadSummary ?? {
      privacyClassification: 'SENSITIVE',
      rawPayloadStored: false,
      estimatedSizeBytes: 2,
      storedSizeBytes: 2,
      truncated: false,
      omitted: false,
      redactedFields: [],
      hashedFields: [],
      summary: {},
    },
    metadata: overrides.metadata ?? {},
    retentionPolicy: overrides.retentionPolicy ?? {
      retentionDays: 30,
      expiresAt: '2099-01-01T00:00:00.000Z',
      deleteAfter: '2099-01-01T00:00:00.000Z',
      legalHold: false,
    },
    auditId: 'audit-1',
  } as AnyObserveTelemetryEvent;
}
