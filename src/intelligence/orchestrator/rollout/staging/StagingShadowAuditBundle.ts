/**
 * @fileoverview JSON-safe audit bundle builder for staging shadow runs.
 */

import type {
  StagingShadowApprovalEvidence,
  StagingShadowAuditBundle,
  StagingShadowEnvironmentDecision,
  StagingShadowFlowResult,
  StagingShadowGateInputs,
  StagingShadowMetrics,
  StagingShadowOperationalVerdict,
} from './StagingShadowRunTypes';

export interface StagingShadowAuditBundleInput {
  runId: string;
  environmentDecision: StagingShadowEnvironmentDecision;
  approval?: StagingShadowApprovalEvidence;
  gateInputs: StagingShadowGateInputs;
  flowResults: readonly StagingShadowFlowResult[];
  metrics: StagingShadowMetrics;
  finalVerdict: StagingShadowOperationalVerdict;
  generatedAt?: string;
}

export function createStagingShadowAuditBundle(
  input: StagingShadowAuditBundleInput
): StagingShadowAuditBundle {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const bundle: StagingShadowAuditBundle = {
    bundleId: `staging-shadow-audit-bundle-${hashString(`${input.runId}|${generatedAt}`)}`,
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
          maxSampleRate: input.approval.maxSampleRate,
          maxExecutions: input.approval.maxExecutions,
          reason: input.approval.reason,
          evidence: input.approval.evidence,
          parityEvidenceReference: input.approval.parityEvidenceReference,
          productionSafetyAcknowledgement: input.approval.productionSafetyAcknowledgement,
          status: input.approval.status,
        }
      : undefined,
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
      hookPathObserved: result.hookPathObserved,
      sampleDecision: result.auditRecord?.decision.sampleDecision,
    })),
    flowResults: input.flowResults.map((result) => ({
      scenarioId: result.scenarioId,
      flow: result.flow,
      status: result.status,
      comparisonStatus: result.comparisonStatus,
      matched: result.matched,
      drifted: result.drifted,
      failed: result.failed,
      productionOutputPreserved: result.productionOutputPreserved,
      hookPathObserved: result.hookPathObserved,
    })),
    driftResults: input.flowResults
      .filter((result) => result.drifted)
      .map((result) => ({
        scenarioId: result.scenarioId,
        flow: result.flow,
        differences: result.auditRecord?.comparison.differences ?? [],
        notes: result.auditRecord?.comparison.notes ?? result.notes,
      })),
    failureResults: input.flowResults
      .filter((result) => result.failed || result.failure)
      .map((result) => ({
        scenarioId: result.scenarioId,
        flow: result.flow,
        reason: result.failure?.reason ?? result.auditRecord?.comparison.notes.join(' ') ?? 'unknown',
        status: result.status,
      })),
    rollbackResults: input.flowResults
      .filter((result) => result.rollbackTriggered)
      .map((result) => ({
        scenarioId: result.scenarioId,
        flow: result.flow,
        reason: result.auditRecord?.rollbackReason ?? 'policy_block',
        status: result.status,
      })),
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

  return JSON.parse(JSON.stringify(bundle)) as StagingShadowAuditBundle;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
