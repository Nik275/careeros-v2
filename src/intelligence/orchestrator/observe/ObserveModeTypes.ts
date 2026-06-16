/**
 * @fileoverview Observe-mode routing contracts.
 *
 * These types model sidecar observation only. Production output remains the
 * source of truth and must never be replaced by observe-mode results.
 */

import type { DomainAuthorityCapability } from '../../authorities/AuthorityFacadeBase';
import type { OrchestratorResponse } from '../OrchestratorResponse';
import type { OrchestratorRequestType } from '../RequestLifecycle';
import type { CanaryShadowExecutionRecord } from '../rollout/CanaryShadowTypes';
import type { ObserveModeConfig } from './ObserveModeConfig';

export type ObserveModeStatus =
  | 'OBSERVED'
  | 'SKIPPED'
  | 'FAILED'
  | 'DRIFT_DETECTED'
  | 'MATCHED'
  | 'NOT_COMPARABLE'
  | 'SELF_MIRRORED'
  | 'BINDING_FAILED'
  | 'BINDING_DISABLED'
  | 'BINDING_NOT_FOUND'
  | 'INDEPENDENT_COMPARISON';

export type ObserveModeDriftType =
  | 'OUTPUT_MISMATCH'
  | 'MISSING_AUTHORITY'
  | 'MISSING_CAPABILITY'
  | 'ROUTING_FAILURE'
  | 'LIFECYCLE_FAILURE'
  | 'EXPLANATION_MISMATCH'
  | 'CONFIDENCE_MISMATCH'
  | 'STRUCTURAL_MISMATCH'
  | 'BINDING_FAILED'
  | 'BINDING_DISABLED'
  | 'BINDING_NOT_FOUND'
  | 'SELF_MIRRORED';

export interface ObservedProductionCall {
  callId: string;
  flowName: string;
  sourceModule: string;
  operationName: string;
  studentId: string;
  requestType: OrchestratorRequestType;
  capability: DomainAuthorityCapability;
  timestamp: string;
  inputSnapshot?: unknown;
  outputSnapshot?: unknown;
  metadata: Readonly<Record<string, unknown>>;
}

export interface ObservedOrchestratorCall {
  requestId: string;
  status: ObserveModeStatus;
  response?: OrchestratorResponse;
  outputSnapshot?: unknown;
  errorMessage?: string;
  bindingResult?: import('../bindings/AuthorityExecutionBindingTypes').AuthorityExecutionBindingResult;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
}

export interface ObserveModeRequest {
  observeRequestId: string;
  productionCall: ObservedProductionCall;
  config: ObserveModeConfig;
  traceId?: string;
  executionPayload?: unknown;
  metadata: Readonly<Record<string, unknown>>;
}

export interface ObserveModeDrift {
  driftId: string;
  driftType: ObserveModeDriftType;
  status: ObserveModeStatus;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: readonly string[];
}

export interface ObserveModeComparison {
  status: ObserveModeStatus;
  comparable: boolean;
  productionOutputCaptured: boolean;
  orchestratorOutputCaptured: boolean;
  drifts: readonly ObserveModeDrift[];
  notes: readonly string[];
}

export interface ObserveModeAuditRecord {
  auditId: string;
  observeRequestId: string;
  traceId?: string;
  productionCall: ObservedProductionCall;
  orchestratorCall?: ObservedOrchestratorCall;
  canaryShadowRecord?: CanaryShadowExecutionRecord;
  comparison: ObserveModeComparison;
  status: ObserveModeStatus;
  createdAt: string;
  configSnapshot: ObserveModeConfig;
  notes: readonly string[];
}

export interface ObserveModeResult {
  observeRequestId: string;
  status: ObserveModeStatus;
  productionCall: ObservedProductionCall;
  orchestratorCall?: ObservedOrchestratorCall;
  canaryShadowRecord?: CanaryShadowExecutionRecord;
  comparison: ObserveModeComparison;
  auditRecord: ObserveModeAuditRecord;
  productionOutput: unknown;
  notes: readonly string[];
}
