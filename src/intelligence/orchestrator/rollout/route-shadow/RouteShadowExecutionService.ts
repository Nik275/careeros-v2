/**
 * @fileoverview Route-shadow execution service for Phase 6.0.
 */

import type { DryRunAuthorityExecutionCoordinator } from '../../bindings/DryRunAuthorityExecutionCoordinator';
import { createAppRehearsalApproval } from '../app-rehearsal/AppRehearsalApprovalFactory';
import { createAppRehearsalConfig } from '../app-rehearsal/AppRehearsalConfig';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
  getAppEntrypointAlignments,
  getAppEntrypointCandidates,
} from '../app-rehearsal/AppRehearsalEntrypointAdapter';
import { AppRehearsalRunner } from '../app-rehearsal/AppRehearsalRunner';
import type { AppRehearsalScenario, AppRehearsalStatus } from '../app-rehearsal/AppRehearsalTypes';
import { createRouteShadowAuditBundle } from './RouteShadowAuditBundle';
import { createRouteShadowConfig } from './RouteShadowConfig';
import { RouteShadowController } from './RouteShadowController';
import type {
  RouteShadowConfig,
  RouteShadowDecision,
  RouteShadowExecutionResult,
  RouteShadowFailure,
  RouteShadowFlow,
  RouteShadowRequest,
  RouteShadowResponse,
  RouteShadowStatus,
  RouteShadowVerdict,
} from './RouteShadowTypes';

export class RouteShadowExecutionService {
  private readonly controller: RouteShadowController;
  private readonly bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  private readonly now: () => string;

  constructor(options: {
    controller?: RouteShadowController;
    bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
    now?: () => string;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.controller = options.controller ?? new RouteShadowController({ now: this.now });
    this.bindingCoordinator = options.bindingCoordinator;
  }

  async execute(request: RouteShadowRequest, configInput: Partial<RouteShadowConfig> = {}): Promise<RouteShadowExecutionResult> {
    const config = createRouteShadowConfig({
      ...request.config,
      ...configInput,
      environment: configInput.environment ?? request.config?.environment ?? request.environment,
    });
    const decision = this.controller.evaluate(request, config);
    if (!decision.allowed) return this.blockedResult(request, decision);

    const startedAt = this.now();
    try {
      const scenario = createRouteShadowScenario(request);
      const appApproval = createAppRehearsalApproval({
        runId: request.requestId,
        approvedBy: request.approval?.approvedBy ?? 'route-shadow',
        environment: config.environment,
        allowedFlows: [request.flow],
        allowedEntrypoints: [scenario.entrypoint.entrypointId],
        allowServiceFallback: false,
        maxSampleRate: 1,
        maxExecutions: 1,
        reason: request.approval?.reason ?? 'Phase 6.0 route-shadow app rehearsal execution.',
        parityEvidenceReference: request.approval?.parityEvidenceReference,
        stagingShadowEvidenceReference: 'docs/constitutional/Phase5_7_FinalVerdict.md',
        stagingRehearsalEvidenceReference: request.approval?.appRehearsalEvidenceReference,
        productionSafetyAcknowledgement:
          request.approval?.productionSafetyAcknowledgement ??
          'Production output remains authoritative; live modes are not approved.',
        approvedAt: request.approval?.approvedAt,
        expiresAt: request.approval?.expiresAt,
      });
      const appConfig = createAppRehearsalConfig({
        runId: request.requestId,
        enabled: true,
        environment: config.environment,
        allowedEnvironments: config.allowedEnvironments,
        allowedFlows: [request.flow],
        allowedEntrypoints: [scenario.entrypoint.entrypointId],
        allowServiceFallback: false,
        requireAppLevelCoverage: true,
        sampleRate: 1,
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
        maxLatencyMs: 1000,
      });
      const appResult = await new AppRehearsalRunner({
        now: this.now,
        bindingCoordinator: this.bindingCoordinator,
        scenarios: [scenario],
      }).run({
        config: appConfig,
        approval: appApproval,
        scenarios: [scenario],
        gateInputs: request.gateInputs,
      });
      const flowResult = appResult.flowResults[0];
      const latencyMs = Math.max(0, new Date(this.now()).getTime() - new Date(startedAt).getTime());
      const status = routeShadowStatusFromAppRehearsalStatus(flowResult?.status ?? appResult.status);
      const verdict = appResult.verdict;
      const failureRecord =
        flowResult?.failure ??
        (appResult.failures[0]
          ? routeFailure(appResult.failures[0].reason, appResult.failures[0].severity, this.now(), {
              source: 'app-rehearsal',
            })
          : undefined);
      return this.resultFromExecution({
        request,
        decision,
        status,
        verdict,
        hookReached: flowResult?.hookReached ?? false,
        matched: flowResult?.matched ?? false,
        driftDetected: flowResult?.drifted ?? false,
        failure: (flowResult?.failed ?? false) || appResult.status === 'FAILED',
        rollback: flowResult?.rollbackTriggered ?? appResult.status === 'ROLLED_BACK',
        notComparable: flowResult?.notComparable ?? false,
        selfMirrored: flowResult?.selfMirrored ?? false,
        latencyMs,
        failureRecord,
      });
    } catch (error) {
      const failureRecord = routeFailure('Route shadow execution failed safely.', 'critical', this.now(), {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.resultFromExecution({
        request,
        decision,
        status: 'FAILED',
        verdict: 'FAIL',
        hookReached: false,
        matched: false,
        driftDetected: false,
        failure: true,
        rollback: false,
        notComparable: false,
        selfMirrored: false,
        latencyMs: 0,
        failureRecord,
      });
    }
  }

  toResponse(result: RouteShadowExecutionResult): RouteShadowResponse {
    return JSON.parse(
      JSON.stringify({
        status: result.status,
        verdict: result.verdict,
        flow: result.flow,
        hookReached: result.hookReached,
        matched: result.matched,
        driftDetected: result.driftDetected,
        failure: result.failure,
        rollback: result.rollback,
        auditSummary: {
          bundleId: result.auditBundle.bundleId,
          routePath: result.routePath,
          approvalValid: result.decision.approvalValid,
          payloadSafe: result.decision.payloadSafe,
          productionOutputPreserved: true,
          liveRoutingEnabled: false,
        },
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      })
    ) as RouteShadowResponse;
  }

  private blockedResult(request: RouteShadowRequest, decision: RouteShadowDecision): RouteShadowExecutionResult {
    const failureRecord = decision.failures[0];
    return this.resultFromExecution({
      request,
      decision,
      status: decision.status,
      verdict: decision.verdict,
      hookReached: false,
      matched: false,
      driftDetected: false,
      failure: decision.failures.length > 0,
      rollback: false,
      notComparable: false,
      selfMirrored: false,
      latencyMs: 0,
      failureRecord,
    });
  }

  private resultFromExecution(input: {
    request: RouteShadowRequest;
    decision: RouteShadowDecision;
    status: RouteShadowStatus;
    verdict: RouteShadowVerdict;
    hookReached: boolean;
    matched: boolean;
    driftDetected: boolean;
    failure: boolean;
    rollback: boolean;
    notComparable: boolean;
    selfMirrored: boolean;
    latencyMs: number;
    failureRecord?: RouteShadowFailure;
  }): RouteShadowExecutionResult {
    const partial = {
      status: input.status,
      verdict: input.verdict,
      hookReached: input.hookReached,
      matched: input.matched,
      driftDetected: input.driftDetected,
      failure: input.failure,
      rollback: input.rollback,
      notComparable: input.notComparable,
      selfMirrored: input.selfMirrored,
      latencyMs: input.latencyMs,
    };
    const auditBundle = createRouteShadowAuditBundle({
      request: input.request,
      decision: input.decision,
      execution: partial,
      finalVerdict: input.verdict,
      generatedAt: this.now(),
    });
    return Object.freeze({
      ...partial,
      flow: input.request.flow,
      routePath: input.request.routePath,
      decision: input.decision,
      failureRecord: input.failureRecord,
      auditBundle,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }
}

function createRouteShadowScenario(request: RouteShadowRequest): AppRehearsalScenario {
  const payload = isRecord(request.payload) ? request.payload : {};
  const scenarioInput = payload.scenarioInput;
  const flow = request.flow;
  const entrypointId = flow === 'assessment' ? ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID : CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID;
  const entrypoint = getAppEntrypointCandidates().find((candidate) => candidate.entrypointId === entrypointId);
  const alignment = getAppEntrypointAlignments().find((candidate) => candidate.flow === flow);
  if (!entrypoint || !alignment) throw new Error(`Route shadow app rehearsal alignment missing for ${flow}.`);

  return Object.freeze({
    scenarioId: `route-shadow-${request.requestId}`,
    flow,
    entrypoint,
    alignment,
    input: scenarioInput,
    expectedAuthority: flow === 'assessment' ? 'StudentUnderstandingAuthority' : 'OptionGeneratorAuthority',
    expectedCapability: flow === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
    riskLevel: 'LOW',
    privacyClassification: 'SYNTHETIC',
    expectedProductionShape:
      flow === 'assessment'
        ? ['cognitive', 'motivation', 'lifestyle', 'risk', 'workEnvironment', 'values', 'strengths', 'weaknesses', 'confidence']
        : ['careerId', 'studentProfileId', 'overallFitScore', 'fitLevel', 'breakdown', 'strengths', 'concerns', 'confidence'],
    expectedHookName: flow === 'assessment' ? 'AssessmentEngine.processResponses' : 'CareerFitEngine.calculateFit',
    synthetic: true,
    forcedMode: readForcedMode(request.metadata),
  });
}

function readForcedMode(metadata: Readonly<Record<string, unknown>> | undefined): AppRehearsalScenario['forcedMode'] {
  const forcedMode = metadata?.forcedMode;
  return forcedMode === 'hook-not-reached' || forcedMode === 'entrypoint-failure' || forcedMode === 'missing-app-entrypoint'
    ? forcedMode
    : undefined;
}

function routeFailure(reason: string, severity: RouteShadowFailure['severity'], occurredAt: string, metadata: Readonly<Record<string, unknown>>): RouteShadowFailure {
  return Object.freeze({
    failureId: `route-shadow-failure-${hashString(`${reason}|${occurredAt}`)}`,
    reason,
    severity,
    occurredAt,
    metadata,
  });
}

function routeShadowStatusFromAppRehearsalStatus(status: AppRehearsalStatus): RouteShadowStatus {
  switch (status) {
    case 'PLANNED':
      return 'BLOCKED';
    case 'CANCELLED':
      return 'FAILED';
    default:
      return status;
  }
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
