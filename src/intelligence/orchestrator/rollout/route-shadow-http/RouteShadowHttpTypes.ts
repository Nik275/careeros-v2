/**
 * @fileoverview Phase 6.1 HTTP-style route-shadow contracts.
 *
 * HTTP route shadow remains staging-only. It never authorizes live routing,
 * production output replacement, raw payload capture, or real student data.
 */

import type {
  RouteShadowApproval,
  RouteShadowFlow,
  RouteShadowResponse,
} from '../route-shadow/RouteShadowTypes';

export type RouteShadowHttpExecutionMode =
  | 'REAL_HTTP_SERVER'
  | 'ROUTE_HANDLER_REQUEST_SIMULATION'
  | 'DIRECT_HANDLER_FALLBACK';

export type RouteShadowHttpVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export interface RouteShadowHttpConfig {
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  executionMode: RouteShadowHttpExecutionMode;
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
  baseUrl?: string;
}

export interface RouteShadowHttpRequest {
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  method: 'POST';
  environment: string;
  body: unknown;
  rawBody?: string;
  approval?: RouteShadowApproval;
  headers?: Readonly<Record<string, string>>;
  config?: Partial<RouteShadowHttpConfig>;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface RouteShadowHttpResponse {
  httpStatus: number;
  body: unknown;
  headers: Readonly<Record<string, string>>;
  jsonSafe: boolean;
}

export interface RouteShadowHttpResponseValidation {
  valid: boolean;
  verdict: RouteShadowHttpVerdict;
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

export interface RouteShadowHttpResult {
  resultId: string;
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  executionMode: RouteShadowHttpExecutionMode;
  httpStatus: number;
  verdict: RouteShadowHttpVerdict;
  response: RouteShadowHttpResponse;
  validation: RouteShadowHttpResponseValidation;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  latencyMs: number;
  auditBundle: RouteShadowHttpAuditBundle;
  failureRecord?: RouteShadowHttpFailure;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowHttpMetrics {
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

export interface RouteShadowHttpRun {
  runId: string;
  executionMode: RouteShadowHttpExecutionMode;
  environment: string;
  routes: readonly string[];
  results: readonly RouteShadowHttpResult[];
  metrics: RouteShadowHttpMetrics;
  verdict: RouteShadowHttpVerdict;
  startedAt: string;
  completedAt: string;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowHttpAuditBundle {
  bundleId: string;
  runId: string;
  requestId: string;
  executionMode: RouteShadowHttpExecutionMode;
  routePath: string;
  flow: RouteShadowFlow | string;
  generatedAt: string;
  environmentDecision: Readonly<Record<string, unknown>>;
  approvalDecision: Readonly<Record<string, unknown>>;
  payloadSafetyDecision: Readonly<Record<string, unknown>>;
  responseValidationResult: RouteShadowHttpResponseValidation;
  hookReachabilityResult: Readonly<Record<string, unknown>>;
  driftResult: Readonly<Record<string, unknown>>;
  failureResult: Readonly<Record<string, unknown>>;
  rollbackResult: Readonly<Record<string, unknown>>;
  latencySummary: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  finalVerdict: RouteShadowHttpVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowHttpFailure {
  failureId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RouteShadowHttpExecutionFeasibility {
  executionMode: RouteShadowHttpExecutionMode;
  realHttpServerSupported: boolean;
  routeHandlerRequestSimulationSupported: boolean;
  directHandlerOnly: boolean;
  evidence: readonly string[];
  limitations: readonly string[];
}

export type RouteShadowHttpRouteBody = RouteShadowResponse & Readonly<Record<string, unknown>>;
