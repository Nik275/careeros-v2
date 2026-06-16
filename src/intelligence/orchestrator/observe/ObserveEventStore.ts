/**
 * @fileoverview Storage abstraction for observe telemetry events.
 */

import type {
  AnyObserveTelemetryEvent,
  ObserveStorageResult,
  ObserveStoreHealth,
} from './ObserveTelemetryTypes';

export interface ObserveEventStore {
  append(event: AnyObserveTelemetryEvent): ObserveStorageResult;
  appendBatch(events: readonly AnyObserveTelemetryEvent[]): ObserveStorageResult;
  getByTraceId(traceId: string): readonly AnyObserveTelemetryEvent[];
  getByRequestId(requestId: string): readonly AnyObserveTelemetryEvent[];
  getRecent(limit: number): readonly AnyObserveTelemetryEvent[];
  getFailures(limit: number): readonly AnyObserveTelemetryEvent[];
  getDriftEvents(limit: number): readonly AnyObserveTelemetryEvent[];
  deleteExpired(now: string): ObserveStorageResult;
  healthCheck(): ObserveStoreHealth;
}

export function createStorageResult(input: Partial<ObserveStorageResult> = {}): ObserveStorageResult {
  return {
    accepted: input.accepted ?? true,
    stored: input.stored ?? false,
    status: input.status ?? 'skipped',
    eventCount: input.eventCount ?? 0,
    storedCount: input.storedCount ?? 0,
    errorMessage: input.errorMessage,
  };
}
