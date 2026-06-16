/**
 * @fileoverview Observe-mode telemetry service.
 *
 * The service converts observe audit records into privacy-safe telemetry events
 * and writes them through an abstract store. It catches storage and sanitizer
 * failures so observe telemetry cannot break production callers.
 */

import type { ObserveModeConfig } from './ObserveModeConfig';
import { createObserveModeConfig } from './ObserveModeConfig';
import type { ObserveEventStore } from './ObserveEventStore';
import { createStorageResult } from './ObserveEventStore';
import { InMemoryObserveEventStore } from './InMemoryObserveEventStore';
import { NoopObserveEventStore } from './NoopObserveEventStore';
import { ObservePayloadSanitizer } from './ObservePayloadSanitizer';
import type { ObserveModeAuditRecord } from './ObserveModeTypes';
import type {
  AnyObserveTelemetryEvent,
  ObserveAuditEvent,
  ObserveFailureEvent,
  ObserveLifecycleEvent,
  ObservePayloadSummary,
  ObserveRetentionPolicy,
  ObserveStorageResult,
  ObserveStoreHealth,
} from './ObserveTelemetryTypes';

export interface ObserveTelemetryServiceOptions {
  config?: ObserveModeConfig;
  store?: ObserveEventStore;
  sanitizer?: ObservePayloadSanitizer;
  now?: () => string;
}

export interface ObserveTelemetrySummary {
  enabled: boolean;
  storageMode: string;
  health: ObserveStoreHealth;
}

export class ObserveTelemetryService {
  private readonly config: ObserveModeConfig;
  private readonly store: ObserveEventStore;
  private readonly sanitizer: ObservePayloadSanitizer;
  private readonly now: () => string;
  private lastResult: ObserveStorageResult = createStorageResult();

  constructor(options: ObserveTelemetryServiceOptions = {}) {
    this.config = options.config ?? createObserveModeConfig();
    this.store = options.store ?? createStore(this.config);
    this.sanitizer =
      options.sanitizer ??
      new ObservePayloadSanitizer({
        maxPayloadBytes: this.config.maxPayloadBytes,
        captureRawPayloads: this.config.captureRawPayloads,
        hashStudentIdentifiers: this.config.hashStudentIdentifiers,
        privacyMode: this.config.privacyMode,
      });
    this.now = options.now ?? (() => new Date().toISOString());
  }

  recordAuditRecord(record: ObserveModeAuditRecord): ObserveStorageResult {
    if (!this.config.telemetryEnabled) {
      return this.remember(
        createStorageResult({
          accepted: true,
          stored: false,
          status: 'skipped',
        })
      );
    }

    try {
      const events = this.createEventsFromAuditRecord(record);
      return this.remember(this.store.appendBatch(events));
    } catch (error) {
      return this.remember(
        createStorageResult({
          accepted: false,
          stored: false,
          status: 'failed',
          errorMessage: describeError(error),
        })
      );
    }
  }

  recordHookFailure(input: {
    hookName: string;
    error: unknown;
    traceId?: string;
    requestId?: string;
    flowType?: string;
      authority?: string;
      capability?: ObserveFailureEvent['capability'];
    metadata?: Readonly<Record<string, unknown>>;
  }): ObserveStorageResult {
    if (!this.config.telemetryEnabled) {
      return this.remember(createStorageResult({ accepted: true, status: 'skipped' }));
    }

    try {
      const timestamp = this.now();
      const payloadSummary = this.sanitizer.sanitize(
        {
          errorMessage: describeError(input.error),
          metadata: input.metadata ?? {},
        },
        {
          privacyClassification: 'INTERNAL',
        }
      );
      return this.remember(
        this.store.append({
          ...this.createBaseEvent({
            eventType: 'failure',
            traceId: input.traceId ?? `hook-failure-${hashString(`${input.hookName}|${timestamp}`)}`,
            requestId: input.requestId ?? 'unknown-request',
            flowType: input.flowType ?? 'unknown',
            authority: input.authority ?? 'IntelligenceOrchestrator',
            capability: input.capability ?? 'LEARN',
            hookName: input.hookName,
            timestamp,
            status: 'FAILED',
            payloadSummary,
            metadata: input.metadata ?? {},
          }),
          eventType: 'failure',
          failureMessage: describeError(input.error),
        })
      );
    } catch (error) {
      return this.remember(
        createStorageResult({
          accepted: false,
          stored: false,
          status: 'failed',
          errorMessage: describeError(error),
        })
      );
    }
  }

  getSummary(): ObserveTelemetrySummary {
    return {
      enabled: this.config.telemetryEnabled,
      storageMode: this.config.storageMode,
      health: this.store.healthCheck(),
    };
  }

  getLastResult(): ObserveStorageResult {
    return this.lastResult;
  }

  getStore(): ObserveEventStore {
    return this.store;
  }

  private createEventsFromAuditRecord(record: ObserveModeAuditRecord): readonly AnyObserveTelemetryEvent[] {
    const basePayload = {
      auditId: record.auditId,
      productionCall: record.productionCall,
      orchestratorCall: record.orchestratorCall,
      canaryShadowRecord: record.canaryShadowRecord,
      comparison: record.comparison,
      notes: record.notes,
    };
    const payloadSummary = this.sanitizer.sanitize(basePayload, {
      privacyClassification: 'SENSITIVE',
    });
    const base = this.createBaseEvent({
      eventType: 'audit',
      traceId: record.traceId ?? record.observeRequestId,
      requestId: record.observeRequestId,
      flowType: record.productionCall.flowName,
      authority: readMetadataString(record.productionCall.metadata, 'authority') ?? 'IntelligenceOrchestrator',
      capability: record.productionCall.capability,
      hookName: readMetadataString(record.productionCall.metadata, 'hook') ?? record.productionCall.operationName,
      timestamp: record.createdAt,
      status: record.status,
      payloadSummary,
      metadata: {
        sourceModule: record.productionCall.sourceModule,
        operationName: record.productionCall.operationName,
      },
    });

    const events: AnyObserveTelemetryEvent[] = [
      {
        ...base,
        eventType: 'audit',
        auditId: record.auditId,
      } satisfies ObserveAuditEvent,
      {
        ...base,
        eventId: `${base.eventId}-lifecycle`,
        eventType: 'lifecycle',
        lifecyclePhase: lifecyclePhaseForStatus(record.status),
      } satisfies ObserveLifecycleEvent,
    ];

    for (const drift of record.comparison.drifts) {
      events.push({
        ...base,
        eventId: `observe-telemetry-drift-${hashString(`${record.auditId}|${drift.driftId}`)}`,
        eventType: 'drift',
        status: 'DRIFT_DETECTED',
        driftId: drift.driftId,
        driftType: drift.driftType,
        severity: drift.severity,
        payloadSummary: this.sanitizer.sanitize(
          {
            description: drift.description,
            evidence: drift.evidence,
          },
          {
            privacyClassification: 'INTERNAL',
          }
        ),
      });
    }

    if (record.status === 'FAILED') {
      events.push({
        ...base,
        eventId: `${base.eventId}-failure`,
        eventType: 'failure',
        failureMessage: record.orchestratorCall?.errorMessage ?? 'Observe-mode record failed.',
      });
    }

    return events;
  }

  private createBaseEvent(input: {
    eventType: AnyObserveTelemetryEvent['eventType'];
    traceId: string;
    requestId: string;
    flowType: string;
    authority: string;
    capability: AnyObserveTelemetryEvent['capability'];
    hookName: string;
    timestamp: string;
    status: AnyObserveTelemetryEvent['status'];
    payloadSummary: ObservePayloadSummary;
    metadata: Readonly<Record<string, unknown>>;
  }): Omit<AnyObserveTelemetryEvent, 'eventType'> & { eventType: AnyObserveTelemetryEvent['eventType'] } {
    return {
      eventId: `observe-telemetry-${input.eventType}-${hashString(
        `${input.traceId}|${input.requestId}|${input.hookName}|${input.timestamp}|${input.status}`
      )}`,
      eventType: input.eventType,
      schemaVersion: '1.0',
      traceId: input.traceId,
      requestId: input.requestId,
      flowType: input.flowType,
      authority: input.authority,
      capability: input.capability,
      hookName: input.hookName,
      timestamp: input.timestamp,
      status: input.status,
      privacyClassification: input.payloadSummary.privacyClassification,
      payloadSummary: input.payloadSummary,
      metadata: input.metadata,
      retentionPolicy: createRetentionPolicy(input.timestamp, this.config.retentionDays),
    };
  }

  private remember(result: ObserveStorageResult): ObserveStorageResult {
    this.lastResult = result;
    return result;
  }
}

export function createObserveTelemetryService(
  options: ObserveTelemetryServiceOptions = {}
): ObserveTelemetryService {
  return new ObserveTelemetryService(options);
}

function createStore(config: ObserveModeConfig): ObserveEventStore {
  if (config.telemetryEnabled && config.storageMode === 'memory') {
    return new InMemoryObserveEventStore({
      maxStoredEvents: config.maxStoredEvents,
    });
  }

  return new NoopObserveEventStore();
}

function createRetentionPolicy(timestamp: string, retentionDays: number): ObserveRetentionPolicy {
  const expiresAt = new Date(new Date(timestamp).getTime() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
  return {
    retentionDays,
    expiresAt,
    deleteAfter: expiresAt,
    legalHold: false,
  };
}

function lifecyclePhaseForStatus(status: ObserveModeAuditRecord['status']): ObserveLifecycleEvent['lifecyclePhase'] {
  switch (status) {
    case 'SKIPPED':
      return 'skipped';
    case 'FAILED':
      return 'failed';
    case 'MATCHED':
    case 'DRIFT_DETECTED':
    case 'NOT_COMPARABLE':
      return 'compared';
    default:
      return 'observed';
  }
}

function readMetadataString(metadata: Readonly<Record<string, unknown>>, key: string): string | undefined {
  const value = metadata[key];
  return typeof value === 'string' ? value : undefined;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
