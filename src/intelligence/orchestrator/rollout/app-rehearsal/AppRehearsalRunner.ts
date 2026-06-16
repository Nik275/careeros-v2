/**
 * @fileoverview Phase 5.9 app-route rehearsal runner.
 */

import type { DryRunAuthorityExecutionCoordinator } from '../../bindings/DryRunAuthorityExecutionCoordinator';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import type { ObserveModeResult } from '../../observe/ObserveModeTypes';
import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowController } from '../CanaryShadowController';
import { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import { CanaryShadowRollbackPolicy } from '../CanaryShadowRollbackPolicy';
import { CanaryShadowSampler } from '../CanaryShadowSampler';
import type { CanaryShadowExecutionRecord } from '../CanaryShadowTypes';
import { validateManualApproval } from '../ManualApprovalRecord';
import { StagingShadowEnvironmentGuard } from '../staging/StagingShadowEnvironmentGuard';
import type { StagingShadowEnvironmentDecision } from '../staging/StagingShadowRunTypes';
import { validateAppRehearsalApproval } from './AppRehearsalApprovalFactory';
import { createAppRehearsalAuditBundle } from './AppRehearsalAuditBundle';
import { createAppRehearsalConfig } from './AppRehearsalConfig';
import { getAppRehearsalDataset } from './AppRehearsalDataset';
import {
  getAppEntrypointAlignments,
  getAppEntrypointCandidates,
  getDefaultAppRehearsalExecutors,
} from './AppRehearsalEntrypointAdapter';
import { calculateAppRehearsalMetrics } from './AppRehearsalMetrics';
import { AppHookReachabilityProofCollector } from './AppHookReachabilityProof';
import type {
  AppEntrypointAlignment,
  AppEntrypointCandidate,
  AppEntrypointLevel,
  AppRehearsalApprovalEvidence,
  AppRehearsalConfig,
  AppRehearsalEntrypointExecutor,
  AppRehearsalFailure,
  AppRehearsalFlowResult,
  AppRehearsalGateInputs,
  AppRehearsalHookProof,
  AppRehearsalResult,
  AppRehearsalRun,
  AppRehearsalScenario,
  AppRehearsalStatus,
  AppRehearsalVerdict,
} from './AppRehearsalTypes';

export class AppRehearsalRunner {
  private readonly scenarios: readonly AppRehearsalScenario[];
  private readonly entrypoints: readonly AppEntrypointCandidate[];
  private readonly alignments: readonly AppEntrypointAlignment[];
  private readonly entrypointExecutors: Readonly<Record<string, AppRehearsalEntrypointExecutor>>;
  private readonly environmentGuard: StagingShadowEnvironmentGuard;
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  private readonly now: () => string;

  constructor(options: {
    scenarios?: readonly AppRehearsalScenario[];
    entrypoints?: readonly AppEntrypointCandidate[];
    alignments?: readonly AppEntrypointAlignment[];
    entrypointExecutors?: Readonly<Record<string, AppRehearsalEntrypointExecutor>>;
    environmentGuard?: StagingShadowEnvironmentGuard;
    auditService?: CanaryShadowAuditService;
    rollbackPolicy?: CanaryShadowRollbackPolicy;
    bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
    now?: () => string;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.scenarios = options.scenarios ?? getAppRehearsalDataset();
    this.entrypoints = options.entrypoints ?? getAppEntrypointCandidates();
    this.alignments = options.alignments ?? getAppEntrypointAlignments();
    this.entrypointExecutors = { ...getDefaultAppRehearsalExecutors(), ...(options.entrypointExecutors ?? {}) };
    this.environmentGuard = options.environmentGuard ?? new StagingShadowEnvironmentGuard({ now: this.now });
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: this.now });
    this.bindingCoordinator = options.bindingCoordinator;
  }

  async run(input: {
    config?: Partial<AppRehearsalConfig>;
    approval?: AppRehearsalApprovalEvidence;
    scenarios?: readonly AppRehearsalScenario[];
    gateInputs?: AppRehearsalGateInputs;
  } = {}): Promise<AppRehearsalResult> {
    const config = createAppRehearsalConfig(input.config);
    const gateInputs = input.gateInputs ?? {};
    const startedAt = this.now();
    const environmentDecision = this.environmentGuard.evaluate({
      environment: config.environment,
      allowedEnvironments: config.allowedEnvironments,
      now: startedAt,
    });
    const selectedScenarios = this.selectScenarios(input.scenarios ?? this.scenarios, config);
    const rehearsal: AppRehearsalRun = {
      runId: config.runId,
      status: 'RUNNING',
      startedAt,
      environmentDecision,
      approval: input.approval,
      scenarioCount: selectedScenarios.length,
      notes: ['Phase 5.9 app-route rehearsal started through selected alignment.'],
    };
    const blocked = this.validateRunStart(config, input.approval, gateInputs, environmentDecision, selectedScenarios);
    if (blocked.length > 0) {
      return this.createRunResult({
        rehearsal: { ...rehearsal, status: 'BLOCKED', completedAt: this.now(), notes: blocked.map((failure) => failure.reason) },
        environmentDecision,
        approval: input.approval,
        gateInputs,
        hookReachabilityProof: createEmptyProof(this.now()),
        flowResults: [],
        failures: blocked,
        warnings: [],
        status: 'BLOCKED',
        verdict: 'BLOCKED',
      });
    }

    const service = this.createExecutionService(config, input.approval, gateInputs);
    const proofCollector = new AppHookReachabilityProofCollector({
      config: createObserveModeConfig({
        enabled: true,
        sampleRate: 1,
        captureInputs: false,
        captureOutputs: true,
        compareOutputs: true,
        captureRawPayloads: false,
        telemetryEnabled: false,
        dryRunBindingsEnabled: false,
      }),
      canaryShadowExecutionService: service,
      now: this.now,
    });
    const flowResults: AppRehearsalFlowResult[] = [];
    for (const scenario of selectedScenarios) flowResults.push(await this.executeScenario(scenario, proofCollector, config));
    const proof = proofCollector.createProof(this.now());
    const metrics = calculateAppRehearsalMetrics(flowResults);
    const failures = flowResults.flatMap((result) => (result.failure ? [result.failure] : []));
    const warnings = collectWarnings(flowResults, proof);
    const status = metrics.rollbackCount > 0 ? 'ROLLED_BACK' : failures.length > 0 || metrics.failedCount > 0 || metrics.driftCount > 0 ? 'FAILED' : 'COMPLETED';
    const verdict = status === 'FAILED' || status === 'ROLLED_BACK' ? 'FAIL' : warnings.length > 0 ? 'PASS_WITH_WARNINGS' : 'PASS';
    return this.createRunResult({
      rehearsal: { ...rehearsal, status, completedAt: this.now(), notes: ['Phase 5.9 app-route rehearsal completed.'] },
      environmentDecision,
      approval: input.approval,
      gateInputs,
      hookReachabilityProof: proof,
      flowResults,
      failures,
      warnings,
      status,
      verdict,
    });
  }

  private selectScenarios(scenarios: readonly AppRehearsalScenario[], config: AppRehearsalConfig): readonly AppRehearsalScenario[] {
    const byFlow = new Map<string, number>();
    const selected: AppRehearsalScenario[] = [];
    for (const scenario of scenarios) {
      if (!config.allowedFlows.includes(scenario.flow)) continue;
      if (!config.allowedEntrypoints.includes(scenario.entrypoint.entrypointId)) continue;
      if (!config.allowServiceFallback && scenario.entrypoint.level === 'service-fallback') continue;
      const countForFlow = byFlow.get(scenario.flow) ?? 0;
      if (config.maxExecutionsPerFlow > 0 && countForFlow >= config.maxExecutionsPerFlow) continue;
      if (config.maxTotalExecutions > 0 && selected.length >= config.maxTotalExecutions) break;
      selected.push(scenario);
      byFlow.set(scenario.flow, countForFlow + 1);
    }
    return selected;
  }

  private validateRunStart(
    config: AppRehearsalConfig,
    approval: AppRehearsalApprovalEvidence | undefined,
    gateInputs: AppRehearsalGateInputs,
    environmentDecision: StagingShadowEnvironmentDecision,
    selectedScenarios: readonly AppRehearsalScenario[]
  ): readonly AppRehearsalFailure[] {
    const failures: AppRehearsalFailure[] = [];
    if (!config.enabled) failures.push(this.createFailure('config', 'App rehearsal is disabled.', 'critical'));
    if (config.sampleRate <= 0) failures.push(this.createFailure('config', 'App rehearsal sampleRate is 0.', 'critical'));
    if (config.maxTotalExecutions <= 0) failures.push(this.createFailure('config', 'App rehearsal maxTotalExecutions is 0.', 'critical'));
    if (config.maxExecutionsPerFlow <= 0) failures.push(this.createFailure('config', 'App rehearsal maxExecutionsPerFlow is 0.', 'critical'));
    if (config.allowedFlows.length === 0) failures.push(this.createFailure('config', 'No flows are allowed.', 'critical'));
    if (config.allowedEntrypoints.length === 0) failures.push(this.createFailure('config', 'No entrypoints are allowed.', 'critical'));
    if (selectedScenarios.length === 0) failures.push(this.createFailure('config', 'No scenarios were selected for app rehearsal.', 'critical'));
    if (config.captureRawPayloads) failures.push(this.createFailure('privacy', 'Raw payload capture is forbidden.', 'critical'));
    if (!environmentDecision.allowed) failures.push(this.createFailure('environment', environmentDecision.reason, 'critical'));
    if (!config.allowServiceFallback && config.allowedEntrypoints.some((id) => this.entrypoints.some((entrypoint) => entrypoint.entrypointId === id && entrypoint.level === 'service-fallback'))) {
      failures.push(this.createFailure('entrypoint', 'Service-level fallback is not allowed by app rehearsal config.', 'critical'));
    }
    if (config.requireAppLevelCoverage && !selectedScenarios.some((scenario) => isAppLevelEntrypoint(scenario.entrypoint.level))) {
      failures.push(this.createFailure('coverage', 'App-level coverage is required but no app-level alignment scenario was selected.', 'critical'));
    }
    if (config.requireKillSwitchInactive && gateInputs.killSwitchActive !== false) failures.push(this.createFailure('kill-switch', 'Kill switch is active or unknown.', 'critical'));
    if (config.requireParityGate && gateInputs.expandedParityCIGatePassed !== true) failures.push(this.createFailure('parity', 'Expanded parity gate did not pass.', 'critical'));
    if (config.requirePrivacyGate && gateInputs.privacySafe !== true) failures.push(this.createFailure('privacy', 'Privacy gate did not pass.', 'critical'));
    if (config.requireTelemetryHealth && gateInputs.telemetryHealthy !== true) failures.push(this.createFailure('telemetry', 'Telemetry health gate did not pass.', 'critical'));
    if (gateInputs.rolloutGateApproved !== true) failures.push(this.createFailure('rollout', 'Explicit rollout gate approval is required.', 'critical'));
    if (config.requireManualApproval) {
      const validation = validateAppRehearsalApproval(approval, {
        environment: config.environment,
        flows: config.allowedFlows,
        entrypoints: config.allowedEntrypoints,
        allowServiceFallback: config.allowServiceFallback,
        sampleRate: config.sampleRate,
        maxExecutions: config.maxTotalExecutions,
        requestedScope: 'CANARY_SHADOW',
        captureRawPayloads: config.captureRawPayloads,
        now: this.now(),
      });
      if (!validation.valid) failures.push(this.createFailure('manual-approval', validation.reason, 'critical'));
      for (const flow of config.allowedFlows) {
        const manual = validateManualApproval(approval?.manualApproval, { flow, sampleRate: config.sampleRate, requestedScope: 'CANARY_SHADOW', now: this.now() });
        if (!manual.valid) {
          failures.push(this.createFailure('manual-approval', manual.reason, 'critical'));
          break;
        }
      }
    }
    return failures;
  }

  private createExecutionService(
    config: AppRehearsalConfig,
    approval: AppRehearsalApprovalEvidence | undefined,
    gateInputs: AppRehearsalGateInputs
  ): CanaryShadowExecutionService {
    const canaryConfig = createCanaryShadowConfig({
      globalShadowEnabled: true,
      allowedFlows: config.allowedFlows,
      sampleRate: config.sampleRate,
      maxExecutionsPerMinute: config.maxExecutionsPerFlow,
      maxLatencyMs: config.maxLatencyMs,
      requireManualApproval: config.requireManualApproval,
      requireParityGate: config.requireParityGate,
      requirePrivacyGate: config.requirePrivacyGate,
      requireTelemetryHealth: config.requireTelemetryHealth,
      killSwitchRequired: config.requireKillSwitchInactive,
      rollbackOnDrift: config.rollbackOnAnyDrift,
      rollbackOnFailure: config.rollbackOnAnyFailure,
      rollbackOnLatencyRegression: config.rollbackOnLatencyRegression,
      capturePayloadSummaries: config.capturePayloadSummaries,
      captureComparisonDetails: true,
    });
    const controller = new CanaryShadowController({
      config: canaryConfig,
      sampler: new CanaryShadowSampler({ now: this.now }),
      rollbackPolicy: this.rollbackPolicy,
      now: this.now,
    });
    return new CanaryShadowExecutionService({
      config: canaryConfig,
      controller,
      bindingCoordinator: this.bindingCoordinator,
      auditService: this.auditService,
      rollbackPolicy: this.rollbackPolicy,
      manualApproval: approval?.manualApproval,
      defaultGateInputs: {
        rolloutGateApproved: gateInputs.rolloutGateApproved,
        expandedParityCIGatePassed: gateInputs.expandedParityCIGatePassed,
        privacySafe: gateInputs.privacySafe,
        telemetryHealthy: gateInputs.telemetryHealthy,
        killSwitchActive: gateInputs.killSwitchActive,
        flowKillSwitchActive: gateInputs.flowKillSwitchActive ?? false,
        unresolvedCriticalDrift: gateInputs.unresolvedCriticalDrift,
        failureRate: gateInputs.failureRate,
        latencyRegressionMs: gateInputs.latencyRegressionMs,
      },
      now: this.now,
    });
  }

  private async executeScenario(scenario: AppRehearsalScenario, proof: AppHookReachabilityProofCollector, config: AppRehearsalConfig): Promise<AppRehearsalFlowResult> {
    if (scenario.forcedMode === 'entrypoint-failure') return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, 'Forced app entrypoint execution failure.', 'critical'), config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED');
    if (scenario.forcedMode === 'missing-app-entrypoint') return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, 'Selected app entrypoint is missing.', 'critical'), 'BLOCKED');
    const executor = this.entrypointExecutors[scenario.entrypoint.entrypointId];
    if (!executor) return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, 'No executor registered for selected app entrypoint.', 'critical'), 'BLOCKED');
    const beforeCount = proof.getObservedResults().length;
    try {
      const observeOptions = scenario.forcedMode === 'hook-not-reached' ? {} : {
        config: createObserveModeConfig({ enabled: true, sampleRate: 1, captureInputs: false, captureOutputs: true, compareOutputs: true, captureRawPayloads: false, telemetryEnabled: false }),
        router: proof.createRouter(),
        canaryShadowExecutionService: { execute: async () => undefined as never },
        now: this.now,
      };
      const execution = await executor({
        scenario,
        assessmentObserveOptions: scenario.flow === 'assessment' ? observeOptions : undefined,
        careerFitObserveOptions: scenario.flow === 'career-fit' ? observeOptions : undefined,
      });
      proof.recordEntrypointLevel(execution.entrypointLevel);
      await proof.waitForInvocations(beforeCount + 1);
      const observeResult = proof.getObservedResults()[beforeCount];
      if (!observeResult) return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, 'Existing observe hook was not reached.', 'critical'), config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED', execution.productionOutput);
      return this.toFlowResult(scenario, execution.entrypointLevel, execution.productionOutput, observeResult, observeResult.canaryShadowRecord, execution.notes);
    } catch (error) {
      return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, error instanceof Error ? error.message : String(error), 'critical'), config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED');
    }
  }

  private toFlowResult(
    scenario: AppRehearsalScenario,
    entrypointLevel: AppEntrypointLevel,
    productionOutput: unknown,
    observeResult: ObserveModeResult,
    record: CanaryShadowExecutionRecord | undefined,
    notes: readonly string[]
  ): AppRehearsalFlowResult {
    if (!record) return this.syntheticFailureResult(scenario, this.createFailure(scenario.scenarioId, 'Canary shadow record was not produced.', 'critical'), 'FAILED', productionOutput, observeResult);
    const comparisonStatus = record.comparison.status;
    const executed = record.bindingResult !== undefined && record.status !== 'SKIPPED' && record.status !== 'BLOCKED' && record.status !== 'DISABLED';
    const failed = comparisonStatus === 'FAILED' || record.status === 'FAILED';
    const hookReached = observeResult.auditRecord.productionCall.metadata.hook === scenario.expectedHookName;
    const gateResults = record.decision.gateResults;
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      entrypointId: scenario.entrypoint.entrypointId,
      entrypointLevel,
      alignmentDecision: scenario.alignment.decision,
      status: record.status === 'ROLLED_BACK' ? 'ROLLED_BACK' : failed ? 'FAILED' : executed ? 'COMPLETED' : 'BLOCKED',
      sampled: record.decision.sampleDecision?.selected ?? false,
      executed,
      appLevel: isAppLevelEntrypoint(entrypointLevel),
      serviceLevelFallback: entrypointLevel === 'service-fallback',
      hookReached,
      observeRouterReached: true,
      canaryShadowReached: true,
      dryRunBindingReached: record.bindingResult !== undefined,
      observeResultStatus: observeResult.status,
      comparisonStatus,
      matched: comparisonStatus === 'MATCHED',
      drifted: comparisonStatus === 'DRIFT_DETECTED',
      failed,
      notComparable: comparisonStatus === 'NOT_COMPARABLE',
      selfMirrored: comparisonStatus === 'SELF_MIRRORED',
      rollbackTriggered: record.rollbackTriggered || record.status === 'ROLLED_BACK',
      privacyViolation: !record.privacySafe,
      telemetryFailure: false,
      latencyMs: record.latencyMs,
      gateResultsPassed: gateResults.filter((gate) => gate.passed).length,
      gateResultsTotal: gateResults.length,
      productionOutputPreserved: true,
      productionOutput,
      observeResult,
      auditRecord: record,
      failure: !hookReached ? this.createFailure(scenario.scenarioId, 'Expected observe hook was not reached.', 'critical') : failed ? this.createFailure(scenario.scenarioId, record.comparison.notes.join(' '), 'high') : undefined,
      notes: [...notes, ...record.notes],
    };
  }

  private syntheticFailureResult(scenario: AppRehearsalScenario, failure: AppRehearsalFailure, status: AppRehearsalStatus, productionOutput?: unknown, observeResult?: ObserveModeResult): AppRehearsalFlowResult {
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      entrypointId: scenario.entrypoint.entrypointId,
      entrypointLevel: scenario.entrypoint.level,
      alignmentDecision: scenario.alignment.decision,
      status,
      sampled: false,
      executed: false,
      appLevel: isAppLevelEntrypoint(scenario.entrypoint.level),
      serviceLevelFallback: scenario.entrypoint.level === 'service-fallback',
      hookReached: false,
      observeRouterReached: observeResult !== undefined,
      canaryShadowReached: false,
      dryRunBindingReached: false,
      observeResultStatus: observeResult?.status,
      comparisonStatus: 'FAILED',
      matched: false,
      drifted: false,
      failed: true,
      notComparable: false,
      selfMirrored: false,
      rollbackTriggered: status === 'ROLLED_BACK',
      privacyViolation: false,
      telemetryFailure: false,
      latencyMs: 0,
      gateResultsPassed: 0,
      gateResultsTotal: 0,
      productionOutputPreserved: true,
      productionOutput,
      observeResult,
      failure,
      notes: ['App rehearsal failure was isolated; production output remains authoritative.'],
    };
  }

  private createRunResult(input: {
    rehearsal: AppRehearsalRun;
    environmentDecision: StagingShadowEnvironmentDecision;
    approval?: AppRehearsalApprovalEvidence;
    gateInputs: AppRehearsalGateInputs;
    hookReachabilityProof: AppRehearsalHookProof;
    flowResults: readonly AppRehearsalFlowResult[];
    failures: readonly AppRehearsalFailure[];
    warnings: readonly string[];
    status: AppRehearsalStatus;
    verdict: AppRehearsalVerdict;
  }): AppRehearsalResult {
    const metrics = calculateAppRehearsalMetrics(input.flowResults);
    const auditBundle = createAppRehearsalAuditBundle({
      runId: input.rehearsal.runId,
      environmentDecision: input.environmentDecision,
      approval: input.approval,
      entrypoints: this.entrypoints,
      alignments: this.alignments,
      gateInputs: input.gateInputs,
      hookReachabilityProof: input.hookReachabilityProof,
      flowResults: input.flowResults,
      metrics,
      finalVerdict: input.verdict,
      generatedAt: this.now(),
    });
    return Object.freeze({
      rehearsal: input.rehearsal,
      status: input.status,
      verdict: input.verdict,
      environmentDecision: input.environmentDecision,
      approval: input.approval,
      entrypoints: this.entrypoints,
      alignments: this.alignments,
      hookReachabilityProof: input.hookReachabilityProof,
      flowResults: input.flowResults,
      metrics,
      failures: input.failures,
      warnings: input.warnings,
      auditBundle,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }

  private createFailure(reasonKey: string, reason: string, severity: AppRehearsalFailure['severity']): AppRehearsalFailure {
    const occurredAt = this.now();
    return {
      failureId: `app-rehearsal-failure-${hashString(`${reasonKey}|${reason}|${occurredAt}`)}`,
      reason,
      severity,
      occurredAt,
      metadata: { reasonKey },
    };
  }
}

function collectWarnings(results: readonly AppRehearsalFlowResult[], proof: AppRehearsalHookProof): readonly string[] {
  const warnings: string[] = [];
  if (results.some((result) => result.serviceLevelFallback)) warnings.push('Service-level fallback was used and is not counted as app-level coverage.');
  if (results.some((result) => result.entrypointLevel === 'test-only-adapter')) warnings.push('Phase 5.9 proves test-only app-entrypoint alignment, not actual Next.js route execution.');
  if (!proof.assessmentHookReached || !proof.careerFitHookReached || !proof.dryRunBindingReached) warnings.push('One or more validated hooks or dry-run bindings were not reached.');
  if (results.some((result) => result.notComparable || result.selfMirrored)) warnings.push('At least one scenario did not produce an independent comparable result.');
  return warnings;
}

function isAppLevelEntrypoint(level: AppEntrypointLevel): boolean {
  return level === 'app-route' || level === 'test-only-adapter';
}

function createEmptyProof(generatedAt: string): AppRehearsalHookProof {
  return {
    proofId: `app-hook-reachability-proof-empty-${hashString(generatedAt)}`,
    generatedAt,
    assessmentHookReached: false,
    careerFitHookReached: false,
    observeRouterReached: false,
    canaryShadowReached: false,
    dryRunBindingReached: false,
    hookInvocationCount: 0,
    observeRouterInvocationCount: 0,
    canaryShadowExecutionCount: 0,
    dryRunBindingInvocationCount: 0,
    appLevelPathCount: 0,
    serviceFallbackPathCount: 0,
    hookReachabilityRate: 0,
    byHook: {},
    byFlow: {},
    byEntrypointLevel: {},
    statuses: [],
    observeRequestIds: [],
  };
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
