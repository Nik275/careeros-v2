/**
 * @fileoverview Privacy-safe observe-mode telemetry contracts.
 *
 * These contracts intentionally model telemetry as append-only event data.
 * Payloads are summaries by default; raw production payloads are not stored
 * unless an explicit future configuration allows it.
 */

import type { DomainAuthorityCapability } from '../../authorities/AuthorityFacadeBase';
import type { ObserveModeStatus } from './ObserveModeTypes';

export type ObserveTelemetryEventType = 'audit' | 'drift' | 'failure' | 'lifecycle';

export type ObservePrivacyClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'SENSITIVE'
  | 'RESTRICTED';

export interface ObserveTraceContext {
  traceId: string;
  requestId: string;
  studentIdentifierHash?: string;
  sourceModule?: string;
  operationName?: string;
}

export interface ObserveRetentionPolicy {
  retentionDays: number;
  expiresAt?: string;
  deleteAfter?: string;
  legalHold: boolean;
}

export interface ObservePayloadSummary {
  privacyClassification: ObservePrivacyClassification;
  rawPayloadStored: boolean;
  estimatedSizeBytes: number;
  storedSizeBytes: number;
  truncated: boolean;
  omitted: boolean;
  redactedFields: readonly string[];
  hashedFields: readonly string[];
  fieldCount?: number;
  arrayLength?: number;
  summary: unknown;
}

export interface ObserveStorageResult {
  accepted: boolean;
  stored: boolean;
  status: 'stored' | 'skipped' | 'discarded' | 'failed' | 'expired';
  eventCount: number;
  storedCount: number;
  errorMessage?: string;
}

export interface ObserveTelemetryEvent {
  eventId: string;
  eventType: ObserveTelemetryEventType;
  schemaVersion: '1.0';
  traceId: string;
  requestId: string;
  flowType: string;
  authority: string;
  capability: DomainAuthorityCapability;
  hookName: string;
  timestamp: string;
  status: ObserveModeStatus;
  privacyClassification: ObservePrivacyClassification;
  payloadSummary: ObservePayloadSummary;
  metadata: Readonly<Record<string, unknown>>;
  retentionPolicy: ObserveRetentionPolicy;
}

export interface ObserveAuditEvent extends ObserveTelemetryEvent {
  eventType: 'audit';
  auditId: string;
}

export interface ObserveDriftEvent extends ObserveTelemetryEvent {
  eventType: 'drift';
  driftId: string;
  driftType: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ObserveFailureEvent extends ObserveTelemetryEvent {
  eventType: 'failure';
  failureMessage: string;
}

export interface ObserveLifecycleEvent extends ObserveTelemetryEvent {
  eventType: 'lifecycle';
  lifecyclePhase: 'observed' | 'skipped' | 'failed' | 'compared';
}

export type AnyObserveTelemetryEvent =
  | ObserveAuditEvent
  | ObserveDriftEvent
  | ObserveFailureEvent
  | ObserveLifecycleEvent;

export interface ObserveStoreHealth {
  healthy: boolean;
  storageMode: string;
  eventCount: number;
  lastErrorMessage?: string;
}
