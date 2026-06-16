/**
 * @fileoverview Phase 6.0 route-shadow contracts.
 *
 * Route shadow is staging-only and never authorizes live routing or output
 * replacement.
 */

import type { ManualApprovalRecord, ManualApprovalStatus } from '../ManualApprovalRecord';
import type { StagingShadowEnvironmentDecision } from '../staging/StagingShadowRunTypes';

export type RouteShadowStatus =
  | 'DISABLED'
  | 'BLOCKED'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK';

export type RouteShadowVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';
export type RouteShadowFlow = 'assessment' | 'career-fit';

export interface RouteShadowConfig {
  enabled: boolean;
  environment: string;
  allowedEnvironments: readonly string[];
  allowedFlows: readonly RouteShadowFlow[];
  requireManualApproval: boolean;
  requireEnvironmentGuard: boolean;
  requireParityGate: boolean;
  requirePrivacyGate: boolean;
  requireTelemetryHealth: boolean;
  requireKillSwitchInactive: boolean;
  maxPayloadBytes: number;
  capturePayloadSummaries: boolean;
  captureRawPayloads: boolean;
  allowProductionEnvironment: boolean;
  allowLiveRouting: boolean;
  allowOutputReplacement: boolean;
}

export interface RouteShadowApproval {
  approvalId: string;
  approvedBy: string;
  approvedAt: string;
  expiresAt: string;
  environment: string;
  allowedFlows: readonly RouteShadowFlow[];
  allowedRoutes: readonly string[];
  maxExecutions: number;
  reason: string;
  parityEvidenceReference: string;
  appRehearsalEvidenceReference: string;
  productionSafetyAcknowledgement: string;
  status: ManualApprovalStatus;
  manualApproval: ManualApprovalRecord;
}

export interface RouteShadowGateInputs {
  rolloutGateApproved?: boolean;
  expandedParityCIGatePassed?: boolean;
  privacySafe?: boolean;
  telemetryHealthy?: boolean;
  killSwitchActive?: boolean;
  flowKillSwitchActive?: boolean;
  unresolvedCriticalDrift?: boolean;
  failureRate?: number;
  latencyRegressionMs?: number;
}

export interface RouteShadowRequest {
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow;
  environment: string;
  synthetic: true | false;
  payload: unknown;
  config?: Partial<RouteShadowConfig>;
  approval?: RouteShadowApproval;
  gateInputs?: RouteShadowGateInputs;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface RouteShadowFailure {
  failureId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface RouteShadowDecision {
  decisionId: string;
  status: RouteShadowStatus;
  verdict: RouteShadowVerdict;
  allowed: boolean;
  flow: RouteShadowFlow | string;
  routePath: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approvalValid: boolean;
  payloadSafe: boolean;
  gateResults: readonly Readonly<Record<string, unknown>>[];
  failures: readonly RouteShadowFailure[];
  reasons: readonly string[];
  decidedAt: string;
  liveRoutingEnabled: false;
  outputReplacementEnabled: false;
}

export interface RouteShadowExecutionResult {
  status: RouteShadowStatus;
  verdict: RouteShadowVerdict;
  flow: RouteShadowFlow;
  routePath: string;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  notComparable: boolean;
  selfMirrored: boolean;
  latencyMs: number;
  decision: RouteShadowDecision;
  failureRecord?: RouteShadowFailure;
  auditBundle: RouteShadowAuditBundle;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowResponse {
  status: RouteShadowStatus;
  verdict: RouteShadowVerdict;
  flow: RouteShadowFlow | string;
  hookReached: boolean;
  matched: boolean;
  driftDetected: boolean;
  failure: boolean;
  rollback: boolean;
  auditSummary: Readonly<Record<string, unknown>>;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}

export interface RouteShadowAuditBundle {
  bundleId: string;
  requestId: string;
  routePath: string;
  flow: RouteShadowFlow | string;
  generatedAt: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approvalDecision: Readonly<Record<string, unknown>>;
  gateResults: readonly Readonly<Record<string, unknown>>[];
  payloadSafetyResult: Readonly<Record<string, unknown>>;
  hookReachabilityResult: Readonly<Record<string, unknown>>;
  shadowExecutionResult: Readonly<Record<string, unknown>>;
  comparisonResult: Readonly<Record<string, unknown>>;
  driftResult: Readonly<Record<string, unknown>>;
  failureResult: Readonly<Record<string, unknown>>;
  rollbackResult: Readonly<Record<string, unknown>>;
  latencySummary: Readonly<Record<string, unknown>>;
  privacySummary: Readonly<Record<string, unknown>>;
  finalVerdict: RouteShadowVerdict;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
}
