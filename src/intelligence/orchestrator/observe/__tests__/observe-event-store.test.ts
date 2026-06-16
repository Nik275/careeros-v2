import { describe, expect, it } from 'vitest';
import { InMemoryObserveEventStore } from '../InMemoryObserveEventStore';
import { NoopObserveEventStore } from '../NoopObserveEventStore';
import type { AnyObserveTelemetryEvent } from '../ObserveTelemetryTypes';

describe('observe event stores', () => {
  it('keeps the noop store non-throwing and side-effect free', () => {
    const store = new NoopObserveEventStore();

    expect(() => store.append(createEvent('event-1'))).not.toThrow();
    expect(store.append(createEvent('event-1'))).toMatchObject({
      accepted: true,
      stored: false,
      status: 'discarded',
    });
    expect(store.getRecent(10)).toEqual([]);
    expect(store.healthCheck()).toMatchObject({
      healthy: true,
      storageMode: 'noop',
      eventCount: 0,
    });
  });

  it('enforces max size in the in-memory store', () => {
    const store = new InMemoryObserveEventStore({
      maxStoredEvents: 2,
    });

    store.append(createEvent('event-1'));
    store.append(createEvent('event-2'));
    store.append(createEvent('event-3'));

    expect(store.getRecent(10).map((event) => event.eventId)).toEqual(['event-3', 'event-2']);
    expect(store.healthCheck().eventCount).toBe(2);
  });

  it('supports trace lookup', () => {
    const store = new InMemoryObserveEventStore();

    store.append(createEvent('event-1', { traceId: 'trace-a' }));
    store.append(createEvent('event-2', { traceId: 'trace-b' }));
    store.append(createEvent('event-3', { traceId: 'trace-a' }));

    expect(store.getByTraceId('trace-a').map((event) => event.eventId)).toEqual(['event-1', 'event-3']);
  });

  it('cleans up expired events by retention policy', () => {
    const store = new InMemoryObserveEventStore();

    store.append(createEvent('event-1', { expiresAt: '2099-01-01T00:00:00.000Z' }));
    store.append(createEvent('event-2', { expiresAt: '2099-01-02T00:00:00.000Z' }));

    const result = store.deleteExpired('2099-01-02T00:00:00.000Z');

    expect(result).toMatchObject({
      status: 'expired',
      eventCount: 2,
    });
    expect(store.getRecent(10)).toEqual([]);
  });
});

function createEvent(
  eventId: string,
  overrides: Partial<AnyObserveTelemetryEvent> & { expiresAt?: string } = {}
): AnyObserveTelemetryEvent {
  const expiresAt = overrides.expiresAt ?? '2099-01-01T00:00:00.000Z';
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
      expiresAt,
      deleteAfter: expiresAt,
      legalHold: false,
    },
    auditId: 'audit-1',
  } as AnyObserveTelemetryEvent;
}
