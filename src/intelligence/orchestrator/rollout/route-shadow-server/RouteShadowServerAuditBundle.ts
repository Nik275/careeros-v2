/**
 * @fileoverview Audit bundle generation for Phase 6.2 real HTTP server smoke tests.
 */

import type {
  RouteShadowServerAuditBundle,
  RouteShadowServerConfig,
  RouteShadowServerRequest,
  RouteShadowServerResponseValidation,
  RouteShadowServerStatus,
  RouteShadowServerVerdict,
} from './RouteShadowServerTypes';

export function createRouteShadowServerAuditBundle(input: {
  runId: string;
  request: RouteShadowServerRequest;
  config: RouteShadowServerConfig;
  validation: RouteShadowServerResponseValidation;
  latencyMs: number;
  finalVerdict: RouteShadowServerVerdict;
  generatedAt: string;
  payloadBytes: number;
  serverStartStatus: RouteShadowServerStatus;
  serverReadinessStatus: RouteShadowServerStatus;
  blockedReason?: string;
}): RouteShadowServerAuditBundle {
  const approval = readApproval(input.request.body);
  return JSON.parse(
    JSON.stringify({
      bundleId: `route-shadow-server-audit-bundle-${hashString(`${input.runId}|${input.request.routePath}|${input.generatedAt}`)}`,
      runId: input.runId,
      requestId: input.request.requestId,
      executionMode: 'REAL_HTTP_SERVER',
      serverStartStatus: input.serverStartStatus,
      serverReadinessStatus: input.serverReadinessStatus,
      routePath: input.request.routePath,
      flow: input.request.flow,
      generatedAt: input.generatedAt,
      environmentDecision: {
        environment: input.config.environment,
        allowed: input.config.allowedEnvironments.includes(input.config.environment),
        productionBlocked: true,
        unknownBlocked: input.config.environment === 'unknown',
      },
      approvalDecision: {
        approvalPresent: Boolean(approval),
        approvalId: approval?.approvalId,
        approvedBy: approval?.approvedBy,
        expiresAt: approval?.expiresAt,
        liveModesApproved: false,
      },
      payloadSafetyDecision: {
        syntheticRequired: input.config.requireSyntheticMarker,
        payloadBytes: input.payloadBytes,
        maxPayloadBytes: input.config.maxPayloadBytes,
        rawPayloadCaptured: false,
        rawPayloadStored: false,
      },
      responseValidationResult: input.validation,
      hookReachabilityResult: {
        hookReached: input.validation.hookReached,
        matched: input.validation.matched,
      },
      driftResult: {
        driftDetected: input.validation.driftDetected,
        outputReplacementEnabled: false,
      },
      failureResult: {
        failure: input.validation.failure,
        blockedReason: input.blockedReason,
        stackTraceLeakDetected: input.validation.stackTraceLeakDetected,
      },
      rollbackResult: {
        rollback: input.validation.rollback,
        productionOutputPreserved: true,
      },
      latencySummary: {
        latencyMs: input.latencyMs,
      },
      privacySummary: {
        capturePayloadSummaries: input.config.capturePayloadSummaries,
        captureRawPayloads: false,
        rawPayloadLeakDetected: input.validation.rawPayloadLeakDetected,
      },
      finalVerdict: input.finalVerdict,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    })
  ) as RouteShadowServerAuditBundle;
}

function readApproval(body: unknown): { approvalId?: string; approvedBy?: string; expiresAt?: string } | undefined {
  if (!isRecord(body) || !isRecord(body.approval)) return undefined;
  return {
    approvalId: typeof body.approval.approvalId === 'string' ? body.approval.approvalId : undefined,
    approvedBy: typeof body.approval.approvedBy === 'string' ? body.approval.approvedBy : undefined,
    expiresAt: typeof body.approval.expiresAt === 'string' ? body.approval.expiresAt : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

