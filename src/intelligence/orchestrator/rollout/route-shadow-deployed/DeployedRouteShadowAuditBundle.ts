/**
 * @fileoverview Audit bundle generation for Phase 6.3 deployed staging shadow.
 */

import type {
  DeployedRouteShadowAuditBundle,
  DeployedRouteShadowConfig,
  DeployedRouteShadowRequest,
  DeployedRouteShadowResponseValidation,
  DeployedRouteShadowVerdict,
  DeployedStagingHostDecision,
} from './DeployedRouteShadowTypes';

export function createDeployedRouteShadowAuditBundle(input: {
  runId: string;
  request: DeployedRouteShadowRequest;
  config: DeployedRouteShadowConfig;
  hostDecision: DeployedStagingHostDecision;
  validation: DeployedRouteShadowResponseValidation;
  latencyMs: number;
  finalVerdict: DeployedRouteShadowVerdict;
  generatedAt: string;
  payloadBytes: number;
  blockedReason?: string;
}): DeployedRouteShadowAuditBundle {
  const approval = input.request.approval;
  return JSON.parse(JSON.stringify({
    bundleId: `deployed-route-shadow-audit-bundle-${hashString(`${input.runId}|${input.request.routePath}|${input.generatedAt}`)}`,
    runId: input.runId,
    requestId: input.request.requestId,
    executionMode: input.hostDecision.allowed ? 'DEPLOYED_STAGING_HTTP' : 'DEPLOYED_STAGING_BLOCKED',
    baseUrlSummary: input.hostDecision.baseUrlSummary,
    hostSafetyDecision: input.hostDecision,
    routePath: input.request.routePath,
    flow: input.request.flow,
    generatedAt: input.generatedAt,
    environmentDecision: {
      environment: input.config.environment,
      productionBlocked: true,
      unknownBlocked: input.config.environment === 'unknown',
      allowed: input.config.environment === 'staging',
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
  })) as DeployedRouteShadowAuditBundle;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

