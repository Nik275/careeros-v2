/**
 * @fileoverview Phase 5.8 end-to-end staging rehearsal runner.
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
import { HookReachabilityProbe } from './HookReachabilityProbe';
import { validateStagingRehearsalApproval } from './StagingRehearsalApprovalFactory';
import { createStagingRehearsalAuditBundle } from './StagingRehearsalAuditBundle';
import { createStagingRehearsalConfig } from './StagingRehearsalConfig';
import { getStagingRehearsalDataset } from './StagingRehearsalDataset';
import {
  getDefaultStagingRehearsalExecutors,
  getStagingRehearsalEntrypoints,
} from './StagingRehearsalEntrypoints';
import { calculateStagingRehearsalMetrics } from './StagingRehearsalMetrics';
import type {
  HookReachabilityProof,
  StagingRehearsal,
  StagingRehearsalApprovalEvidence,
  StagingRehearsalEntrypoint,
  StagingRehearsalEntrypointExecutor,
  StagingRehearsalFailure,
  StagingRehearsalFlowResult,
  StagingRehearsalGateInputs,
  StagingRehearsalResult,
  StagingRehearsalStatus,
  StagingRehearsalVerdict,
  StagingRehearsalConfig,
  StagingRehearsalScenario,
} from './StagingRehearsalTypes';

export interface StagingRehearsalRunnerOptions {
  scenarios?: readonly StagingRehearsalScenario[];
  entrypoints?: readonly StagingRehearsalEntrypoint[];
  entrypointExecutors?: Readonly<Record<string, StagingRehearsalEntrypointExecutor>>;
  environmentGuard?: StagingShadowEnvironmentGuard;
  auditService?: CanaryShadowAuditService;
  rollbackPolicy?: CanaryShadowRollbackPolicy;
  bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  now?: () => string;
}

export interface StagingRehearsalRunInput {
  config?: Partial<StagingRehearsalConfig>;
  approval?: StagingRehearsalApprovalEvidence;
  scenarios?: readonly StagingRehearsalScenario[];
  gateInputs?: StagingRehearsalGateInputs;
}

export class StagingRehearsalRunner {
  private readonly scenarios: readonly StagingRehearsalScenario[];
  private readonly entrypoints: readonly StagingRehearsalEntrypoint[];
  private readonly entrypointExecutors: Readonly<Record<string, StagingRehearsalEntrypointExecutor>>;
  private readonly environmentGuard: StagingShadowEnvironmentGuard;
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  private readonly now: () => string;

  constructor(options: StagingRehearsalRunnerOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.scenarios = options.scenarios ?? getStagingRehearsalDataset();
    this.entrypoints = options.entrypoints ?? getStagingRehearsalEntrypoints();
    this.entrypointExecutors = {
      ...getDefaultStagingRehearsalExecutors(),
      ...(options.entrypointExecutors ?? {}),
    };
    this.environmentGuard =
      options.environmentGuard ?? new StagingShadowEnvironmentGuard({ now: this.now });
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: this.now });
    this.bindingCoordinator = options.bindingCoordinator;
  }

  async run(input: StagingRehearsalRunInput = {}): Promise<StagingRehearsalResult> {
    const config = createStagingRehearsalConfig(input.config);
    const approval = input.approval;
    const gateInputs = input.gateInputs ?? {};
    const startedAt = this.now();
    const environmentDecision = this.environmentGuard.evaluate({
      environment: config.environment,
      allowedEnvironments: config.allowedEnvironments,
      now: startedAt,
    });
    const selectedScenarios = this.selectScenarios(input.scenarios ?? this.scenarios, config);
    const rehearsal: StagingRehearsal = {
      runId: config.runId,
      status: 'RUNNING',
      startedAt,
      environmentDecision,
      approval,
      scenarioCount: selectedScenarios.length,
      notes: ['Phase 5.8 staging rehearsal started through selected entrypoints.'],
    };
    const blocked = this.validateRunStart(config, approval, gateInputs, environmentDecision);
    if (blocked.length > 0) {
      const emptyProof = createEmptyProof(this.now());
      return this.createRunResult({
        rehearsal: {
          ...rehearsal,
          status: 'BLOCKED',
          completedAt: this.now(),
          notes: blocked.map((failure) => failure.reason),
        },
        environmentDecision,
        approval,
        gateInputs,
        hookReachabilityProof: emptyProof,
        flowResults: [],
        failures: blocked,
        warnings: [],
        status: 'BLOCKED',
        verdict: 'BLOCKED',
      });
    }

    const service = this.createExecutionService(config, approval, gateInputs);
    const observeConfig = createObserveModeConfig({
      enabled: true,
      sampleRate: 1,
      captureInputs: false,
      captureOutputs: true,
      compareOutputs: true,
      captureRawPayloads: false,
      telemetryEnabled: false,
      dryRunBindingsEnabled: false,
    });
    const probe = new HookReachabilityProbe({
      config: observeConfig,
      canaryShadowExecutionService: service,
      now: this.now,
    });
    const flowResults: StagingRehearsalFlowResult[] = [];

    for (const scenario of selectedScenarios) {
      flowResults.push(await this.executeScenario(scenario, probe, config));
    }

    const hookReachabilityProof = probe.createProof(this.now());
    const metrics = calculateStagingRehearsalMetrics(flowResults);
    const failures = flowResults.flatMap((result) => (result.failure ? [result.failure] : []));
    const warnings = collectWarnings(flowResults, hookReachabilityProof);
    const status = resolveRunStatus(metrics, failures);
    const verdict = resolveVerdict(metrics, failures, warnings);

    return this.createRunResult({
      rehearsal: {
        ...rehearsal,
        status,
        completedAt: this.now(),
        notes: ['Phase 5.8 staging rehearsal completed.'],
      },
      environmentDecision,
      approval,
      gateInputs,
      hookReachabilityProof,
      flowResults,
      failures,
      warnings,
      status,
      verdict,
    });
  }

  private selectScenarios(
    scenarios: readonly StagingRehearsalScenario[],
    config: StagingRehearsalConfig
  ): readonly StagingRehearsalScenario[] {
    const byFlow = new Map<string, number>();
    const selected: StagingRehearsalScenario[] = [];
    for (const scenario of scenarios) {
      if (!config.allowedFlows.includes(scenario.flow)) continue;
      if (!config.allowedEntrypoints.includes(scenario.entrypoint.entrypointId)) continue;
      const countForFlow = byFlow.get(scenario.flow) ?? 0;
      if (config.maxExecutionsPerFlow > 0 && countForFlow >= config.maxExecutionsPerFlow) continue;
      if (config.maxTotalExecutions > 0 && selected.length >= config.maxTotalExecutions) break;
      selected.push(scenario);
      byFlow.set(scenario.flow, countForFlow + 1);
    }
    return selected;
  }

  private validateRunStart(
    config: StagingRehearsalConfig,
    approval: StagingRehearsalApprovalEvidence | undefined,
    gateInputs: StagingRehearsalGateInputs,
    environmentDecision: StagingShadowEnvironmentDecision
  ): readonly StagingRehearsalFailure[] {
    const failures: StagingRehearsalFailure[] = [];
    if (!config.enabled) failures.push(this.createFailure('config', 'Staging rehearsal is disabled.', 'critical'));
    if (config.sampleRate <= 0) failures.push(this.createFailure('config', 'Staging rehearsal sampleRate is 0.', 'critical'));
    if (config.maxTotalExecutions <= 0) failures.push(this.createFailure('config', 'Staging rehearsal maxTotalExecutions is 0.', 'critical'));
    if (config.maxExecutionsPerFlow <= 0) failures.push(this.createFailure('config', 'Staging rehearsal maxExecutionsPerFlow is 0.', 'critical'));
    if (config.allowedFlows.length === 0) failures.push(this.createFailure('config', 'No flows are allowed.', 'critical'));
    if (config.allowedEntrypoints.length === 0) failures.push(this.createFailure('config', 'No entrypoints are allowed.', 'critical'));
    if (config.captureRawPayloads) failures.push(this.createFailure('privacy', 'Raw payload capture is forbidden.', 'critical'));
    if (!environmentDecision.allowed) failures.push(this.createFailure('environment', environmentDecision.reason, 'critical'));
    if (config.requireKillSwitchInactive && gateInputs.killSwitchActive !== false) {
      failures.push(this.createFailure('kill-switch', 'Kill switch is active or unknown.', 'critical'));
    }
    if (config.requireParityGate && gateInputs.expandedParityCIGatePassed !== true) {
      failures.push(this.createFailure('parity', 'Expanded parity gate did not pass.', 'critical'));
    }
    if (config.requirePrivacyGate && gateInputs.privacySafe !== true) {
      failures.push(this.createFailure('privacy', 'Privacy gate did not pass.', 'critical'));
    }
    if (config.requireTelemetryHealth && gateInputs.telemetryHealthy !== true) {
      failures.push(this.createFailure('telemetry', 'Telemetry health gate did not pass.', 'critical'));
    }
    if (gateInputs.rolloutGateApproved !== true) {
      failures.push(this.createFailure('rollout', 'Explicit rollout gate approval is required.', 'critical'));
    }

    if (config.requireManualApproval) {
      const approvalValidation = validateStagingRehearsalApproval(approval, {
        environment: config.environment,
        flows: config.allowedFlows,
        entrypoints: config.allowedEntrypoints,
        sampleRate: config.sampleRate,
        maxExecutions: config.maxTotalExecutions,
        requestedScope: 'CANARY_SHADOW',
        captureRawPayloads: config.captureRawPayloads,
        now: this.now(),
      });
      if (!approvalValidation.valid) {
        failures.push(this.createFailure('manual-approval', approvalValidation.reason, 'critical'));
      }
      for (const flow of config.allowedFlows) {
        const validation = validateManualApproval(approval?.manualApproval, {
          flow,
          sampleRate: config.sampleRate,
          requestedScope: 'CANARY_SHADOW',
          now: this.now(),
        });
        if (!validation.valid) {
          failures.push(this.createFailure('manual-approval', validation.reason, 'critical'));
          break;
        }
      }
    }

    return failures;
  }

  private createExecutionService(
    config: StagingRehearsalConfig,
    approval: StagingRehearsalApprovalEvidence | undefined,
    gateInputs: StagingRehearsalGateInputs
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

  private async executeScenario(
    scenario: StagingRehearsalScenario,
    probe: HookReachabilityProbe,
    config: StagingRehearsalConfig
  ): Promise<StagingRehearsalFlowResult> {
    if (scenario.forcedMode === 'entrypoint-failure') {
      return this.syntheticFailureResult(
        scenario,
        this.createFailure(scenario.scenarioId, 'Forced entrypoint execution failure.', 'critical'),
        config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED'
      );
    }

    const executor = this.entrypointExecutors[scenario.entrypoint.entrypointId];
    if (!executor) {
      return this.syntheticFailureResult(
        scenario,
        this.createFailure(scenario.scenarioId, 'No executor registered for selected entrypoint.', 'critical'),
        'FAILED'
      );
    }

    const beforeCount = probe.getObservedResults().length;
    try {
      const observeOptions =
        scenario.forcedMode === 'hook-not-reached'
          ? {}
          : {
              config: createObserveModeConfig({
                enabled: true,
                sampleRate: 1,
                captureInputs: false,
                captureOutputs: true,
                compareOutputs: true,
                captureRawPayloads: false,
                telemetryEnabled: false,
              }),
              router: probe.createRouter(),
              canaryShadowExecutionService: { execute: async () => undefined as never },
              now: this.now,
            };
      const execution = await executor({
        scenario,
        assessmentObserveOptions: scenario.flow === 'assessment' ? observeOptions : undefined,
        careerFitObserveOptions: scenario.flow === 'career-fit' ? observeOptions : undefined,
      });
      await probe.waitForInvocations(beforeCount + 1);
      const observeResult = probe.getObservedResults()[beforeCount];
      if (!observeResult) {
        return this.syntheticFailureResult(
          scenario,
          this.createFailure(scenario.scenarioId, 'Existing observe hook was not reached.', 'critical'),
          config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED',
          execution.productionOutput
        );
      }
      return this.toFlowResult(scenario, execution.productionOutput, observeResult, observeResult.canaryShadowRecord);
    } catch (error) {
      return this.syntheticFailureResult(
        scenario,
        scenario.forcedFailure ?? this.createFailure(scenario.scenarioId, describeError(error), 'critical'),
        config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED'
      );
    }
  }

  private toFlowResult(
    scenario: StagingRehearsalScenario,
    productionOutput: unknown,
    observeResult: ObserveModeResult,
    record: CanaryShadowExecutionRecord | undefined
  ): StagingRehearsalFlowResult {
    if (!record) {
      return this.syntheticFailureResult(
        scenario,
        this.createFailure(scenario.scenarioId, 'Canary shadow record was not produced.', 'critical'),
        'FAILED',
        productionOutput,
        observeResult
      );
    }

    const comparisonStatus = record.comparison.status;
    const gateResults = record.decision.gateResults;
    const executed = record.bindingResult !== undefined && record.status !== 'SKIPPED' && record.status !== 'BLOCKED' && record.status !== 'DISABLED';
    const drifted = comparisonStatus === 'DRIFT_DETECTED';
    const failed = comparisonStatus === 'FAILED' || record.status === 'FAILED';
    const rollbackTriggered = record.rollbackTriggered || record.status === 'ROLLED_BACK';
    const hookReached = isExpectedHook(scenario, observeResult);

    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      entrypointId: scenario.entrypoint.entrypointId,
      entrypointLevel: scenario.entrypoint.level,
      status: resolveFlowStatus(record.status, failed, executed),
      sampled: record.decision.sampleDecision?.selected ?? false,
      executed,
      appLevel: scenario.entrypoint.level === 'app',
      serviceLevelFallback: scenario.entrypoint.level === 'service-fallback',
      hookReached,
      observeRouterReached: true,
      canaryShadowReached: true,
      observeResultStatus: observeResult.status,
      comparisonStatus,
      matched: comparisonStatus === 'MATCHED',
      drifted,
      failed,
      notComparable: comparisonStatus === 'NOT_COMPARABLE',
      selfMirrored: comparisonStatus === 'SELF_MIRRORED',
      rollbackTriggered,
      privacyViolation: !record.privacySafe,
      telemetryFailure: false,
      latencyMs: record.latencyMs,
      gateResultsPassed: gateResults.filter((gate) => gate.passed).length,
      gateResultsTotal: gateResults.length,
      productionOutputPreserved: true,
      productionOutput,
      observeResult,
      auditRecord: record,
      failure:
        scenario.forcedFailure ??
        (!hookReached
          ? this.createFailure(scenario.scenarioId, 'Expected observe hook was not reached.', 'critical')
          : failed
            ? this.createFailure(scenario.scenarioId, record.comparison.notes.join(' '), 'high')
            : undefined),
      notes: record.notes,
    };
  }

  private syntheticFailureResult(
    scenario: StagingRehearsalScenario,
    failure: StagingRehearsalFailure,
    status: StagingRehearsalStatus,
    productionOutput?: unknown,
    observeResult?: ObserveModeResult
  ): StagingRehearsalFlowResult {
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      entrypointId: scenario.entrypoint.entrypointId,
      entrypointLevel: scenario.entrypoint.level,
      status,
      sampled: false,
      executed: false,
      appLevel: scenario.entrypoint.level === 'app',
      serviceLevelFallback: scenario.entrypoint.level === 'service-fallback',
      hookReached: false,
      observeRouterReached: observeResult !== undefined,
      canaryShadowReached: false,
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
      notes: ['Staging rehearsal failure was isolated; production output remains authoritative.'],
    };
  }

  private createRunResult(input: {
    rehearsal: StagingRehearsal;
    environmentDecision: StagingShadowEnvironmentDecision;
    approval?: StagingRehearsalApprovalEvidence;
    gateInputs: StagingRehearsalGateInputs;
    hookReachabilityProof: HookReachabilityProof;
    flowResults: readonly StagingRehearsalFlowResult[];
    failures: readonly StagingRehearsalFailure[];
    warnings: readonly string[];
    status: StagingRehearsalStatus;
    verdict: StagingRehearsalVerdict;
  }): StagingRehearsalResult {
    const metrics = calculateStagingRehearsalMetrics(input.flowResults);
    const auditBundle = createStagingRehearsalAuditBundle({
      runId: input.rehearsal.runId,
      environmentDecision: input.environmentDecision,
      approval: input.approval,
      entrypoints: this.entrypoints,
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

  private createFailure(
    reasonKey: string,
    reason: string,
    severity: StagingRehearsalFailure['severity']
  ): StagingRehearsalFailure {
    const occurredAt = this.now();
    return {
      failureId: `staging-rehearsal-failure-${hashString(`${reasonKey}|${reason}|${occurredAt}`)}`,
      reason,
      severity,
      occurredAt,
      metadata: { reasonKey },
    };
  }
}

function isExpectedHook(
  scenario: StagingRehearsalScenario,
  observeResult: ObserveModeResult
): boolean {
  const hook = observeResult.auditRecord.productionCall.metadata.hook;
  if (scenario.flow === 'assessment') return hook === 'AssessmentEngine.processResponses';
  return hook === 'CareerFitEngine.calculateFit';
}

function collectWarnings(
  results: readonly StagingRehearsalFlowResult[],
  proof: HookReachabilityProof
): readonly string[] {
  const warnings: string[] = [];
  if (results.some((result) => result.serviceLevelFallback)) {
    warnings.push('App-level routes do not currently call the validated engines; service-level fallback was used.');
  }
  if (!proof.assessmentHookReached || !proof.careerFitHookReached) {
    warnings.push('One or more validated hooks were not reached.');
  }
  if (results.some((result) => result.notComparable || result.selfMirrored)) {
    warnings.push('At least one scenario did not produce an independent comparable result.');
  }
  return warnings;
}

function resolveRunStatus(
  metrics: ReturnType<typeof calculateStagingRehearsalMetrics>,
  failures: readonly StagingRehearsalFailure[]
): StagingRehearsalStatus {
  if (metrics.rollbackCount > 0) return 'ROLLED_BACK';
  if (failures.length > 0 || metrics.failedCount > 0 || metrics.driftCount > 0) return 'FAILED';
  return 'COMPLETED';
}

function resolveVerdict(
  metrics: ReturnType<typeof calculateStagingRehearsalMetrics>,
  failures: readonly StagingRehearsalFailure[],
  warnings: readonly string[]
): StagingRehearsalVerdict {
  if (metrics.rollbackCount > 0 || failures.length > 0 || metrics.failedCount > 0 || metrics.driftCount > 0) {
    return 'FAIL';
  }
  if (warnings.length > 0 || metrics.notComparableCount > 0 || metrics.selfMirroredCount > 0) {
    return 'PASS_WITH_WARNINGS';
  }
  return 'PASS';
}

function resolveFlowStatus(
  status: CanaryShadowExecutionRecord['status'],
  failed: boolean,
  executed: boolean
): StagingRehearsalStatus {
  if (status === 'ROLLED_BACK') return 'ROLLED_BACK';
  if (failed) return 'FAILED';
  if (executed) return 'COMPLETED';
  if (status === 'BLOCKED' || status === 'DISABLED' || status === 'SKIPPED') return 'BLOCKED';
  return 'PLANNED';
}

function createEmptyProof(generatedAt: string): HookReachabilityProof {
  return {
    proofId: `hook-reachability-proof-empty-${hashString(generatedAt)}`,
    generatedAt,
    assessmentHookReached: false,
    careerFitHookReached: false,
    hookInvocationCount: 0,
    observeRouterInvocationCount: 0,
    canaryShadowExecutionCount: 0,
    byHook: {},
    byFlow: {},
    statuses: [],
    observeRequestIds: [],
  };
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
