/**
 * @fileoverview JSON-safe route shadow audit bundle.
 */

import { validatePayloadSafety } from './RouteShadowController';
import { createRouteShadowConfig } from './RouteShadowConfig';
import type {
  RouteShadowAuditBundle,
  RouteShadowDecision,
  RouteShadowExecutionResult,
  RouteShadowRequest,
  RouteShadowVerdict,
} from './RouteShadowTypes';

export function createRouteShadowAuditBundle(input: {
  request: RouteShadowRequest;
  decision: RouteShadowDecision;
  execution?: Partial<RouteShadowExecutionResult>;
  finalVerdict: RouteShadowVerdict;
  generatedAt?: string;
}): RouteShadowAuditBundle {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const config = createRouteShadowConfig(input.request.config);
  const payloadSafety = validatePayloadSafety(input.request, config);
  const bundle: RouteShadowAuditBundle = {
    bundleId: `route-shadow-audit-bundle-${hashString(`${input.request.requestId}|${generatedAt}`)}`,
    requestId: input.request.requestId,
    routePath: input.request.routePath,
    flow: input.request.flow,
    generatedAt,
    environmentDecision: input.decision.environmentDecision,
    approvalDecision: {
      approvalValid: input.decision.approvalValid,
      approvalId: input.request.approval?.approvalId,
      liveModesApproved: false,
      outputReplacementApproved: false,
    },
    gateResults: input.decision.gateResults,
    payloadSafetyResult: {
      safe: payloadSafety.safe,
      payloadBytes: payloadSafety.payloadBytes,
      captureRawPayloads: false,
      failures: payloadSafety.failures,
    },
    hookReachabilityResult: {
      hookReached: input.execution?.hookReached ?? false,
    },
    shadowExecutionResult: {
      status: input.execution?.status ?? input.decision.status,
      flow: input.request.flow,
      routePath: input.request.routePath,
    },
    comparisonResult: {
      matched: input.execution?.matched ?? false,
      notComparable: input.execution?.notComparable ?? false,
      selfMirrored: input.execution?.selfMirrored ?? false,
    },
    driftResult: {
      driftDetected: input.execution?.driftDetected ?? false,
    },
    failureResult: {
      failure: input.execution?.failure ?? input.decision.failures.length > 0,
      reasons: input.decision.reasons,
    },
    rollbackResult: {
      rollback: input.execution?.rollback ?? false,
    },
    latencySummary: {
      latencyMs: input.execution?.latencyMs ?? 0,
    },
    privacySummary: {
      dataClassification: 'SYNTHETIC',
      captureRawPayloads: false,
      rawPayloadStored: false,
    },
    finalVerdict: input.finalVerdict,
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
  return JSON.parse(JSON.stringify(bundle)) as RouteShadowAuditBundle;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
