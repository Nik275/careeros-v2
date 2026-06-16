/**
 * @fileoverview Phase 6.2 real HTTP server route-shadow contracts.
 */

import type { RouteShadowApproval, RouteShadowFlow } from '../route-shadow/RouteShadowTypes';

export type RouteShadowServerExecutionMode =
  | 'REAL_HTTP_SERVER'
  | 'SERVER_START_FAILED'
  | 'SERVER_UNSUPPORTED'
  | 'SERVER_BLOCKED';

export type RouteShadowServerStatus =
  | 'DISABLED'
  | 'BLOCKED'
  | 'STARTING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RouteShadowServerVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export type RouteShadowServerFeasibilityStatus =
  | 'REAL_HTTP_SERVER_SUPPORTED'
  | 'REAL_HTTP_SERVER_BLOCKED_BY_BUILD'
  | 'REAL_HTTP_SERVER_BLOCKED_BY_CONFIG'
  | 'REAL_HTTP_SERVER_BLOCKED_BY_RUNTIME'
  | 'REAL_HTTP_SERVER_UNSUPPORTED_IN_TEST_ENVIRONMENT';

export interface RouteShadowServerConfig {
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  baseUrl: string;
  port: number;
  serverStartCommand?: readonly string[];
  serverReadyTimeoutMs: number;
  requestTimeoutMs: number;
  allowedRoutes: readonly string[];
  allowedFlows: readonly RouteShadowFlow[];
  requireManualApproval: boolean;
  requireSyntheticMarker: boolean;
  requireEnvironmentGuard: boolean;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireKillSwitchInactive: boolean;
  maxPayloadBytes: number;
  maxRequestsPerRoute: number;
  capturePayloadSummaries: boolean;
  captureRawPayloads: boolean;
  allowProductionEnvironment: boolean;
  allowLiveRouting: boolean;
  allowOutputReplacement: boolean;
  startServer: boolean;
}

export interface RouteShadowServerRequest {
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  method: 'POST';
  environment: string;
  body: unknown;
  rawBody?: string;
  approval?: RouteShadowApproval;
  headers?: Readonly<Record<string, string>>;
  config?: Partial<RouteShadowServerConfig>;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface RouteShadowServerResponse {
  httpStatus: number;
  body: unknown;
  headers: Readonly<Record<string, string>>;
  jsonSafe: boolean;
  latencyMs: number;
}

export interface RouteShadowServerResponseValidation {
  valid: boolean;
  verdict: RouteShadowServerVerdict;
  httpStatusValid: boolean;
  jsonSafe: boolean;
  responseShapeValid: boolean;
  liveRoutingDisabled: boolean;
  productionOutputPreserved: boolean;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  rawPayloadLeakDetected: boolean;
  stackTraceLeakDetected: boolean;
  internalErrorLeakDetected: boolean;
  productionMutationDetected: boolean;
  reasons: readonly string[];
}

export interface RouteShadowServerResult {
  resultId: string;
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  executionMode: RouteShadowServerExecutionMode;
  status: RouteShadowServerStatus;
  httpStatus: number;
  verdict: RouteShadowServerVerdict;
  response: RouteShadowServerResponse;
  validation: RouteShadowServerResponseValidation;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  latencyMs: number;
  auditBundle: RouteShadowServerAuditBundle;
  failureRecord?: RouteShadowServerFailure;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowServerMetrics {
  totalRoutes: number;
  completedRoutes: number;
  hookReachedCount: number;
  matchedCount: number;
  driftCount: number;
  failedCount: number;
  rollbackCount: number;
  notComparableCount: number;
  selfMirroredCount: number;
  jsonSafeResponseCount: number;
  liveRoutingEnabledCount: number;
}

export interface RouteShadowServerRun {
  runId: string;
  executionMode: RouteShadowServerExecutionMode;
  status: RouteShadowServerStatus;
  verdict: RouteShadowServerVerdict;
  environment: string;
  baseUrl: string;
  serverStartCommand: readonly string[];
  serverStarted: boolean;
  serverReady: boolean;
  serverStopped: boolean;
  routes: readonly string[];
  results: readonly RouteShadowServerResult[];
  metrics: RouteShadowServerMetrics;
  startedAt: string;
  completedAt: string;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowServerAuditBundle {
  bundleId: string;
  runId: string;
  requestId: string;
  executionMode: RouteShadowServerExecutionMode;
  serverStartStatus: RouteShadowServerStatus;
  serverReadinessStatus: RouteShadowServerStatus;
  routePath: string;
  flow: RouteShadowFlow | string;
  generatedAt: string;
  environmentDecision: Readonly<Record<string, unknown>>;
  approvalDecision: Readonly<Record<string, unknown>>;
  payloadSafetyDecision: Readonly<Record<string, unknown>>;
  responseValidationResult: RouteShadowServerResponseValidation;
  hookReachabilityResult: Readonly<Record<string, unknown>>;
  driftResult: Readonly<Record<string, unknown>>;
  failureResult: Readonly<Record<string, unknown>>;
  rollbackResult: Readonly<Record<string, unknown>>;
  latencySummary: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  finalVerdict: RouteShadowServerVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowServerFailure {
  failureId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RouteShadowServerFeasibility {
  status: RouteShadowServerFeasibilityStatus;
  executionMode: RouteShadowServerExecutionMode;
  commandAvailable: boolean;
  canStartServer: boolean;
  canDetectReadiness: boolean;
  canPostSyntheticPayloads: boolean;
  canShutdownCleanly: boolean;
  evidence: readonly string[];
  limitations: readonly string[];
}

