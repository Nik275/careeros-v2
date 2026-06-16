/**
 * @fileoverview JSON-safe audit bundle for Phase 5.9 app-route rehearsals.
 */

import type { StagingShadowEnvironmentDecision } from '../staging/StagingShadowRunTypes';
import type {
  AppEntrypointAlignment,
  AppEntrypointCandidate,
  AppRehearsalApprovalEvidence,
  AppRehearsalAuditBundle,
  AppRehearsalFlowResult,
  AppRehearsalGateInputs,
  AppRehearsalHookProof,
  AppRehearsalMetrics,
  AppRehearsalVerdict,
} from './AppRehearsalTypes';

export function createAppRehearsalAuditBundle(input: {
  runId: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: AppRehearsalApprovalEvidence;
  entrypoints: readonly AppEntrypointCandidate[];
  alignments: readonly AppEntrypointAlignment[];
  gateInputs: AppRehearsalGateInputs;
  hookReachabilityProof: AppRehearsalHookProof;
  flowResults: readonly AppRehearsalFlowResult[];
  metrics: AppRehearsalMetrics;
  finalVerdict: AppRehearsalVerdict;
  generatedAt?: string;
}): AppRehearsalAuditBundle {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const bundle: AppRehearsalAuditBundle = {
    bundleId: `app-rehearsal-audit-bundle-${hashString(`${input.runId}|${generatedAt}`)}`,
    runId: input.runId,
    generatedAt,
    environmentDecision: input.environmentDecision,
    approval: input.approval
      ? {
          approvalId: input.approval.approvalId,
          approvedBy: input.approval.approvedBy,
          approvedAt: input.approval.approvedAt,
          expiresAt: input.approval.expiresAt,
          environment: input.approval.environment,
          allowedFlows: input.approval.allowedFlows,
          allowedEntrypoints: input.approval.allowedEntrypoints,
          allowServiceFallback: input.approval.allowServiceFallback,
          maxSampleRate: input.approval.maxSampleRate,
          maxExecutions: input.approval.maxExecutions,
          reason: input.approval.reason,
          parityEvidenceReference: input.approval.parityEvidenceReference,
          stagingShadowEvidenceReference: input.approval.stagingShadowEvidenceReference,
          stagingRehearsalEvidenceReference: input.approval.stagingRehearsalEvidenceReference,
          productionSafetyAcknowledgement: input.approval.productionSafetyAcknowledgement,
          status: input.approval.status,
        }
      : undefined,
    entrypointDiscoverySummary: input.entrypoints.map((entrypoint) => ({
      entrypointId: entrypoint.entrypointId,
      filePath: entrypoint.filePath,
      flow: entrypoint.flow,
      level: entrypoint.level,
      selected: entrypoint.selected,
      callsAssessmentProcessResponses: entrypoint.callsAssessmentProcessResponses,
      callsCareerFitCalculateFit: entrypoint.callsCareerFitCalculateFit,
      reachesObserveHook: entrypoint.reachesObserveHook,
      safeForStagingShadowAlignment: entrypoint.safeForStagingShadowAlignment,
      riskLevel: entrypoint.riskLevel,
      selectionReason: entrypoint.selectionReason,
    })),
    selectedAlignmentStrategy: input.alignments[0]?.decision ?? 'DOCUMENT_ONLY_BLOCKER',
    entrypointsExecuted: input.flowResults.map((result) => ({
      scenarioId: result.scenarioId,
      entrypointId: result.entrypointId,
      level: result.entrypointLevel,
      appLevel: result.appLevel,
      serviceLevelFallback: result.serviceLevelFallback,
      hookReached: result.hookReached,
    })),
    serviceFallbacksUsed: input.flowResults
      .filter((result) => result.serviceLevelFallback)
      .map((result) => ({ scenarioId: result.scenarioId, flow: result.flow, entrypointId: result.entrypointId })),
    gateResults: {
      rolloutGateApproved: input.gateInputs.rolloutGateApproved === true,
      expandedParityCIGatePassed: input.gateInputs.expandedParityCIGatePassed === true,
      privacySafe: input.gateInputs.privacySafe === true,
      telemetryHealthy: input.gateInputs.telemetryHealthy === true,
      killSwitchInactive: input.gateInputs.killSwitchActive === false,
      liveRoutingEnabled: false,
    },
    samplingDecisions: input.flowResults.map((result) => ({
      scenarioId: result.scenarioId,
      flow: result.flow,
      sampled: result.sampled,
      executed: result.executed,
      sampleDecision: result.auditRecord?.decision.sampleDecision,
    })),
    hookReachabilityProof: input.hookReachabilityProof,
    flowResults: input.flowResults.map((result) => ({
      scenarioId: result.scenarioId,
      flow: result.flow,
      entrypointId: result.entrypointId,
      status: result.status,
      comparisonStatus: result.comparisonStatus,
      matched: result.matched,
      drifted: result.drifted,
      failed: result.failed,
      hookReached: result.hookReached,
      dryRunBindingReached: result.dryRunBindingReached,
      productionOutputPreserved: result.productionOutputPreserved,
    })),
    driftResults: input.flowResults
      .filter((result) => result.drifted)
      .map((result) => ({ scenarioId: result.scenarioId, flow: result.flow, differences: result.auditRecord?.comparison.differences ?? [] })),
    failureResults: input.flowResults
      .filter((result) => result.failed || result.failure)
      .map((result) => ({ scenarioId: result.scenarioId, flow: result.flow, reason: result.failure?.reason ?? 'unknown', status: result.status })),
    rollbackResults: input.flowResults
      .filter((result) => result.rollbackTriggered)
      .map((result) => ({ scenarioId: result.scenarioId, flow: result.flow, reason: result.auditRecord?.rollbackReason ?? 'policy_block', status: result.status })),
    latencyMetrics: {
      averageLatencyMs: input.metrics.averageLatencyMs,
      p95LatencyMs: input.metrics.p95LatencyMs,
      maxLatencyMs: Math.max(0, ...input.flowResults.map((result) => result.latencyMs)),
    },
    privacySummary: {
      captureRawPayloads: false,
      privacyViolationCount: input.metrics.privacyViolationCount,
      datasetClassification: 'SYNTHETIC',
    },
    telemetrySummary: {
      telemetryFailureCount: input.metrics.telemetryFailureCount,
      telemetryHealthy: input.gateInputs.telemetryHealthy === true,
    },
    finalVerdict: input.finalVerdict,
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
  return JSON.parse(JSON.stringify(bundle)) as AppRehearsalAuditBundle;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
