/**
 * @fileoverview No-op observe telemetry store.
 *
 * This is the default storage implementation. It accepts events and discards
 * them so telemetry can remain disabled and side-effect free by default.
 */

import type { ObserveEventStore } from './ObserveEventStore';
import { createStorageResult } from './ObserveEventStore';
import type {
  AnyObserveTelemetryEvent,
  ObserveStorageResult,
  ObserveStoreHealth,
} from './ObserveTelemetryTypes';

export class NoopObserveEventStore implements ObserveEventStore {
  append(_event: AnyObserveTelemetryEvent): ObserveStorageResult {
    return createStorageResult({
      accepted: true,
      stored: false,
      status: 'discarded',
      eventCount: 1,
      storedCount: 0,
    });
  }

  appendBatch(events: readonly AnyObserveTelemetryEvent[]): ObserveStorageResult {
    return createStorageResult({
      accepted: true,
      stored: false,
      status: 'discarded',
      eventCount: events.length,
      storedCount: 0,
    });
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
    return createStorageResult({
      accepted: true,
      stored: false,
      status: 'discarded',
    });
  }

  healthCheck(): ObserveStoreHealth {
    return {
      healthy: true,
      storageMode: 'noop',
      eventCount: 0,
    };
  }
}
