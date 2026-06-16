/**
 * @fileoverview Audit bundle creation for Phase 6.1 HTTP route-shadow execution.
 */

import type {
  RouteShadowHttpAuditBundle,
  RouteShadowHttpConfig,
  RouteShadowHttpRequest,
  RouteShadowHttpResponseValidation,
  RouteShadowHttpVerdict,
} from './RouteShadowHttpTypes';

export function createRouteShadowHttpAuditBundle(input: {
  runId: string;
  request: RouteShadowHttpRequest;
  config: RouteShadowHttpConfig;
  validation: RouteShadowHttpResponseValidation;
  latencyMs: number;
  finalVerdict: RouteShadowHttpVerdict;
  generatedAt: string;
  payloadBytes: number;
  blockedReason?: string;
}): RouteShadowHttpAuditBundle {
  const approval = readApproval(input.request.body);
  return JSON.parse(
    JSON.stringify({
      bundleId: `route-shadow-http-audit-bundle-${hashString(`${input.runId}|${input.request.routePath}|${input.generatedAt}`)}`,
      runId: input.runId,
      requestId: input.request.requestId,
      executionMode: input.config.executionMode,
      routePath: input.request.routePath,
      flow: input.request.flow,
      generatedAt: input.generatedAt,
      environmentDecision: {
        environment: input.config.environment,
        allowed: isAllowedEnvironment(input.config),
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
        internalErrorLeakDetected: input.validation.internalErrorLeakDetected,
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
  ) as RouteShadowHttpAuditBundle;
}

function readApproval(body: unknown): { approvalId?: string; approvedBy?: string; expiresAt?: string } | undefined {
  if (!isRecord(body) || !isRecord(body.approval)) return undefined;
  return {
    approvalId: typeof body.approval.approvalId === 'string' ? body.approval.approvalId : undefined,
    approvedBy: typeof body.approval.approvedBy === 'string' ? body.approval.approvedBy : undefined,
    expiresAt: typeof body.approval.expiresAt === 'string' ? body.approval.expiresAt : undefined,
  };
}

function isAllowedEnvironment(config: RouteShadowHttpConfig): boolean {
  return config.environment !== 'unknown' && config.environment !== 'production' && config.environment !== 'prod' && config.allowedEnvironments.includes(config.environment);
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

