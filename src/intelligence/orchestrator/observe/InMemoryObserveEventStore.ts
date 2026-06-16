/**
 * @fileoverview Bounded in-memory observe telemetry store.
 */

import type { ObserveEventStore } from './ObserveEventStore';
import { createStorageResult } from './ObserveEventStore';
import type {
  AnyObserveTelemetryEvent,
  ObserveStorageResult,
  ObserveStoreHealth,
} from './ObserveTelemetryTypes';

export interface InMemoryObserveEventStoreOptions {
  maxStoredEvents?: number;
}

export class InMemoryObserveEventStore implements ObserveEventStore {
  private readonly maxStoredEvents: number;
  private readonly events: AnyObserveTelemetryEvent[] = [];
  private lastErrorMessage: string | undefined;

  constructor(options: InMemoryObserveEventStoreOptions = {}) {
    this.maxStoredEvents = Math.max(0, Math.floor(options.maxStoredEvents ?? 10_000));
  }

  append(event: AnyObserveTelemetryEvent): ObserveStorageResult {
    if (isExpired(event, new Date().toISOString())) {
      return createStorageResult({
        accepted: false,
        stored: false,
        status: 'expired',
        eventCount: 1,
      });
    }

    this.events.push(Object.freeze(event));
    this.enforceMaxSize();
    return createStorageResult({
      accepted: true,
      stored: true,
      status: 'stored',
      eventCount: 1,
      storedCount: 1,
    });
  }

  appendBatch(events: readonly AnyObserveTelemetryEvent[]): ObserveStorageResult {
    let storedCount = 0;
    for (const event of events) {
      const result = this.append(event);
      if (result.stored) {
        storedCount += 1;
      }
    }

    return createStorageResult({
      accepted: true,
      stored: storedCount > 0,
      status: storedCount > 0 ? 'stored' : 'skipped',
      eventCount: events.length,
      storedCount,
    });
  }

  getByTraceId(traceId: string): readonly AnyObserveTelemetryEvent[] {
    return this.events.filter((event) => event.traceId === traceId);
  }

  getByRequestId(requestId: string): readonly AnyObserveTelemetryEvent[] {
    return this.events.filter((event) => event.requestId === requestId);
  }

  getRecent(limit: number): readonly AnyObserveTelemetryEvent[] {
    return this.events.slice(-normalizeLimit(limit)).reverse();
  }

  getFailures(limit: number): readonly AnyObserveTelemetryEvent[] {
    return this.events
      .filter((event) => event.eventType === 'failure' || event.status === 'FAILED')
      .slice(-normalizeLimit(limit))
      .reverse();
  }

  getDriftEvents(limit: number): readonly AnyObserveTelemetryEvent[] {
    return this.events
      .filter((event) => event.eventType === 'drift' || event.status === 'DRIFT_DETECTED')
      .slice(-normalizeLimit(limit))
      .reverse();
  }

  deleteExpired(now: string): ObserveStorageResult {
    const before = this.events.length;
    const retained = this.events.filter((event) => !isExpired(event, now));
    this.events.length = 0;
    this.events.push(...retained);
    const removed = before - retained.length;

    return createStorageResult({
      accepted: true,
      stored: false,
      status: removed > 0 ? 'expired' : 'skipped',
      eventCount: removed,
      storedCount: 0,
    });
  }

  healthCheck(): ObserveStoreHealth {
    return {
      healthy: true,
      storageMode: 'memory',
      eventCount: this.events.length,
      lastErrorMessage: this.lastErrorMessage,
    };
  }

  private enforceMaxSize(): void {
    if (this.maxStoredEvents <= 0) {
      this.events.length = 0;
      return;
    }

    while (this.events.length > this.maxStoredEvents) {
      this.events.shift();
    }
  }
}

function isExpired(event: AnyObserveTelemetryEvent, now: string): boolean {
  if (event.retentionPolicy.legalHold) {
    return false;
  }
  const expiresAt = event.retentionPolicy.expiresAt ?? event.retentionPolicy.deleteAfter;
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt).getTime() <= new Date(now).getTime();
}

function normalizeLimit(limit: number): number {
  return Math.max(0, Math.floor(limit));
}
