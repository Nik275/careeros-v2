/**
 * @fileoverview Phase 6.3 deployed staging route-shadow contracts.
 */

import type { RouteShadowApproval, RouteShadowFlow } from '../route-shadow/RouteShadowTypes';

export type DeployedRouteShadowExecutionMode =
  | 'DEPLOYED_STAGING_HTTP'
  | 'DEPLOYED_STAGING_BLOCKED'
  | 'DEPLOYED_STAGING_UNAVAILABLE'
  | 'DEPLOYED_STAGING_UNSAFE';

export type DeployedRouteShadowStatus =
  | 'DISABLED'
  | 'BLOCKED'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type DeployedRouteShadowVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export type DeployedStagingFeasibilityStatus =
  | 'DEPLOYED_STAGING_SUPPORTED'
  | 'DEPLOYED_STAGING_URL_MISSING'
  | 'DEPLOYED_STAGING_BLOCKED_BY_AUTH'
  | 'DEPLOYED_STAGING_BLOCKED_BY_ENVIRONMENT_GUARD'
  | 'DEPLOYED_STAGING_BLOCKED_BY_ROUTE_NOT_DEPLOYED'
  | 'DEPLOYED_STAGING_BLOCKED_BY_NETWORK'
  | 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG'
  | 'DEPLOYED_STAGING_UNSAFE_HOST';

export interface DeployedRouteShadowConfig {
  enabled: boolean;
  environment: string;
  baseUrl: string;
  allowedHosts: readonly string[];
  allowedProtocols: readonly string[];
  allowedRoutes: readonly string[];
  allowedFlows: readonly RouteShadowFlow[];
  requireManualApproval: boolean;
  requireSyntheticMarker: boolean;
  requireEnvironmentGuard: boolean;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireKillSwitchInactive: boolean;
  requireHttpsForRemote: boolean;
  maxPayloadBytes: number;
  requestTimeoutMs: number;
  maxRequestsPerRoute: number;
  capturePayloadSummaries: boolean;
  captureRawPayloads: boolean;
  allowProductionEnvironment: boolean;
  allowLiveRouting: boolean;
  allowOutputReplacement: boolean;
  allowUnknownHost: boolean;
  allowProductionHost: boolean;
}

export interface DeployedStagingHostDecision {
  allowed: boolean;
  status: DeployedStagingFeasibilityStatus;
  baseUrlSummary: string;
  protocol?: string;
  host?: string;
  hostAllowlisted: boolean;
  productionLooking: boolean;
  localHost: boolean;
  reason: string;
  evidence: readonly string[];
}

export interface DeployedRouteShadowApproval extends RouteShadowApproval {
  baseUrl: string;
  allowedHosts: readonly string[];
  allowedRoutes: readonly string[];
  allowedFlows: readonly RouteShadowFlow[];
  maxRequests: number;
  localHttpEvidenceReference: string;
  routeSimulationEvidenceReference: string;
  parityEvidenceReference: string;
}

export interface DeployedRouteShadowRequest {
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  method: 'POST';
  environment: string;
  body: unknown;
  rawBody?: string;
  approval?: DeployedRouteShadowApproval;
  headers?: Readonly<Record<string, string>>;
  config?: Partial<DeployedRouteShadowConfig>;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface DeployedRouteShadowResponse {
  httpStatus: number;
  body: unknown;
  headers: Readonly<Record<string, string>>;
  jsonSafe: boolean;
  latencyMs: number;
}

export interface DeployedRouteShadowResponseValidation {
  valid: boolean;
  verdict: DeployedRouteShadowVerdict;
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
  internalSecretLeakDetected: boolean;
  productionMutationDetected: boolean;
  reasons: readonly string[];
}

export interface DeployedRouteShadowResult {
  resultId: string;
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  executionMode: DeployedRouteShadowExecutionMode;
  status: DeployedRouteShadowStatus;
  httpStatus: number;
  verdict: DeployedRouteShadowVerdict;
  response: DeployedRouteShadowResponse;
  validation: DeployedRouteShadowResponseValidation;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  latencyMs: number;
  auditBundle: DeployedRouteShadowAuditBundle;
  failureRecord?: DeployedRouteShadowFailure;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface DeployedRouteShadowMetrics {
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

export interface DeployedRouteShadowRun {
  runId: string;
  executionMode: DeployedRouteShadowExecutionMode;
  status: DeployedRouteShadowStatus;
  verdict: DeployedRouteShadowVerdict;
  feasibilityStatus: DeployedStagingFeasibilityStatus;
  baseUrlSummary: string;
  hostDecision: DeployedStagingHostDecision;
  deployedHttpRequestsSent: boolean;
  routes: readonly string[];
  results: readonly DeployedRouteShadowResult[];
  metrics: DeployedRouteShadowMetrics;
  startedAt: string;
  completedAt: string;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface DeployedRouteShadowAuditBundle {
  bundleId: string;
  runId: string;
  requestId: string;
  executionMode: DeployedRouteShadowExecutionMode;
  baseUrlSummary: string;
  hostSafetyDecision: DeployedStagingHostDecision;
  routePath: string;
  flow: RouteShadowFlow | string;
  generatedAt: string;
  environmentDecision: Readonly<Record<string, unknown>>;
  approvalDecision: Readonly<Record<string, unknown>>;
  payloadSafetyDecision: Readonly<Record<string, unknown>>;
  responseValidationResult: DeployedRouteShadowResponseValidation;
  hookReachabilityResult: Readonly<Record<string, unknown>>;
  driftResult: Readonly<Record<string, unknown>>;
  failureResult: Readonly<Record<string, unknown>>;
  rollbackResult: Readonly<Record<string, unknown>>;
  latencySummary: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  finalVerdict: DeployedRouteShadowVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface DeployedRouteShadowFailure {
  failureId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface DeployedStagingFeasibility {
  status: DeployedStagingFeasibilityStatus;
  executionMode: DeployedRouteShadowExecutionMode;
  stagingUrlPresent: boolean;
  safeHost: boolean;
  deployedHttpRequestsSent: boolean;
  evidence: readonly string[];
  limitations: readonly string[];
}

