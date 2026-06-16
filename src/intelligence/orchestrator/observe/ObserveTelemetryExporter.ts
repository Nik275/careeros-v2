/**
 * @fileoverview JSON-safe export helpers for observe telemetry.
 */

import type { ObserveEventStore } from './ObserveEventStore';
import type { AnyObserveTelemetryEvent } from './ObserveTelemetryTypes';

export interface ObserveTelemetryExport {
  exportedAt: string;
  eventCount: number;
  events: readonly Record<string, unknown>[];
}

export class ObserveTelemetryExporter {
  private readonly store: ObserveEventStore;
  private readonly now: () => string;

  constructor(options: { store: ObserveEventStore; now?: () => string }) {
    this.store = options.store;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  exportByTraceId(traceId: string): ObserveTelemetryExport {
    return this.createExport(this.store.getByTraceId(traceId));
  }

  exportFailures(limit: number): ObserveTelemetryExport {
    return this.createExport(this.store.getFailures(limit));
  }

  exportDriftEvents(limit: number): ObserveTelemetryExport {
    return this.createExport(this.store.getDriftEvents(limit));
  }

  exportSummary(): Record<string, unknown> {
    const health = this.store.healthCheck();
    return makeJsonSafe({
      exportedAt: this.now(),
      health,
      recentEventCount: this.store.getRecent(100).length,
      failureCount: this.store.getFailures(100).length,
      driftEventCount: this.store.getDriftEvents(100).length,
    }) as Record<string, unknown>;
  }

  private createExport(events: readonly AnyObserveTelemetryEvent[]): ObserveTelemetryExport {
    return {
      exportedAt: this.now(),
      eventCount: events.length,
      events: events.map((event) => makeJsonSafe(event) as Record<string, unknown>),
    };
  }
}

export function makeJsonSafe(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(makeJsonSafe);
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, makeJsonSafe(entry)])
    );
  }
  return String(value);
}
