/**
 * @fileoverview Phase 5.7 staging shadow operational runner.
 *
 * The runner drives existing observe hooks only. It does not import or execute
 * production intelligence engines and it never replaces production output.
 */

import { createAssessmentObserveHook } from '../../observe/AssessmentObserveHook';
import { createCareerFitObserveHook } from '../../observe/CareerFitObserveHook';
import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveModeRouter } from '../../observe/ObserveModeRouter';
import type { ObserveModeRequest, ObserveModeResult } from '../../observe/ObserveModeTypes';
import { ObserveTelemetryService } from '../../observe/ObserveTelemetryService';
import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowController } from '../CanaryShadowController';
import { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import { CanaryShadowRollbackPolicy } from '../CanaryShadowRollbackPolicy';
import { CanaryShadowSampler } from '../CanaryShadowSampler';
import type { CanaryShadowExecutionRecord } from '../CanaryShadowTypes';
import { validateManualApproval } from '../ManualApprovalRecord';
import { getStagingShadowRunDataset } from './StagingShadowRunDataset';
import { StagingShadowEnvironmentGuard } from './StagingShadowEnvironmentGuard';
import { createStagingShadowAuditBundle } from './StagingShadowAuditBundle';
import { createStagingShadowRunConfig } from './StagingShadowRunConfig';
import { calculateStagingShadowMetrics } from './StagingShadowMetrics';
import { validateStagingShadowApproval } from './StagingShadowApprovalFactory';
import type {
  StagingShadowApprovalEvidence,
  StagingShadowEnvironmentDecision,
  StagingShadowFailure,
  StagingShadowFlowResult,
  StagingShadowGateInputs,
  StagingShadowOperationalVerdict,
  StagingShadowRun,
  StagingShadowRunConfig,
  StagingShadowRunResult,
  StagingShadowRunStatus,
  StagingShadowScenario,
} from './StagingShadowRunTypes';

export interface StagingShadowRunRunnerOptions {
  scenarios?: readonly StagingShadowScenario[];
  environmentGuard?: StagingShadowEnvironmentGuard;
  auditService?: CanaryShadowAuditService;
  rollbackPolicy?: CanaryShadowRollbackPolicy;
  now?: () => string;
}

export interface StagingShadowRunInput {
  config?: Partial<StagingShadowRunConfig>;
  approval?: StagingShadowApprovalEvidence;
  scenarios?: readonly StagingShadowScenario[];
  gateInputs?: StagingShadowGateInputs;
}

export class StagingShadowRunRunner {
  private readonly scenarios: readonly StagingShadowScenario[];
  private readonly environmentGuard: StagingShadowEnvironmentGuard;
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly now: () => string;

  constructor(options: StagingShadowRunRunnerOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.scenarios = options.scenarios ?? getStagingShadowRunDataset();
    this.environmentGuard = options.environmentGuard ?? new StagingShadowEnvironmentGuard({ now: this.now });
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: this.now });
  }

  async run(input: StagingShadowRunInput = {}): Promise<StagingShadowRunResult> {
    const config = createStagingShadowRunConfig(input.config);
    const gateInputs = input.gateInputs ?? {};
    const approval = input.approval;
    const startedAt = this.now();
    const environmentDecision = this.environmentGuard.evaluate({
      environment: config.environment,
      allowedEnvironments: config.allowedEnvironments,
      now: startedAt,
    });
    const selectedScenarios = this.selectScenarios(input.scenarios ?? this.scenarios, config);
    const run: StagingShadowRun = {
      runId: config.runId,
      status: 'RUNNING',
      startedAt,
      environmentDecision,
      approval,
      scenarioCount: selectedScenarios.length,
      notes: ['Phase 5.7 staging CANARY_SHADOW run started through observe hooks only.'],
    };

    const blocked = this.validateRunStart(config, approval, gateInputs, environmentDecision);
    if (blocked.length > 0) {
      return this.createRunResult({
        run: {
          ...run,
          status: 'BLOCKED',
          completedAt: this.now(),
          notes: blocked.map((failure) => failure.reason),
        },
        environmentDecision,
        approval,
        gateInputs,
        flowResults: [],
        failures: blocked,
        warnings: [],
        status: 'BLOCKED',
        verdict: 'BLOCKED',
      });
    }

    const service = this.createExecutionService(config, approval, gateInputs);
    const flowResults: StagingShadowFlowResult[] = [];
    for (const scenario of selectedScenarios) {
      flowResults.push(await this.executeScenarioThroughExistingHook(scenario, config, service));
    }

    const metrics = calculateStagingShadowMetrics(flowResults);
    const failures = flowResults.flatMap((result) => (result.failure ? [result.failure] : []));
    const warnings = collectWarnings(flowResults);
    const status = resolveRunStatus(metrics, failures);
    const verdict = resolveVerdict(metrics, failures, warnings);

    return this.createRunResult({
      run: {
        ...run,
        status,
        completedAt: this.now(),
        notes: ['Phase 5.7 staging CANARY_SHADOW run completed through existing observe hooks.'],
      },
      environmentDecision,
      approval,
      gateInputs,
      flowResults,
      failures,
      warnings,
      status,
      verdict,
    });
  }

  private selectScenarios(
    scenarios: readonly StagingShadowScenario[],
    config: StagingShadowRunConfig
  ): readonly StagingShadowScenario[] {
    const byFlow = new Map<string, number>();
    const selected: StagingShadowScenario[] = [];
    for (const scenario of scenarios) {
      if (!config.allowedFlows.includes(scenario.flow)) continue;
      const countForFlow = byFlow.get(scenario.flow) ?? 0;
      if (config.maxExecutionsPerFlow > 0 && countForFlow >= config.maxExecutionsPerFlow) continue;
      if (config.maxTotalExecutions > 0 && selected.length >= config.maxTotalExecutions) break;
      selected.push(scenario);
      byFlow.set(scenario.flow, countForFlow + 1);
    }
    return selected;
  }

  private validateRunStart(
    config: StagingShadowRunConfig,
    approval: StagingShadowApprovalEvidence | undefined,
    gateInputs: StagingShadowGateInputs,
    environmentDecision: StagingShadowEnvironmentDecision
  ): readonly StagingShadowFailure[] {
    const failures: StagingShadowFailure[] = [];

    if (!config.enabled) failures.push(this.createFailure('staging-config', 'Staging shadow run is disabled.', 'critical'));
    if (config.sampleRate <= 0) failures.push(this.createFailure('staging-config', 'Staging shadow sampleRate is 0.', 'critical'));
    if (config.maxTotalExecutions <= 0) failures.push(this.createFailure('staging-config', 'Staging shadow maxTotalExecutions is 0.', 'critical'));
    if (config.maxExecutionsPerFlow <= 0) failures.push(this.createFailure('staging-config', 'Staging shadow maxExecutionsPerFlow is 0.', 'critical'));
    if (config.allowedFlows.length === 0) failures.push(this.createFailure('staging-config', 'No staging shadow flows are allowed.', 'critical'));
    if (config.captureRawPayloads) failures.push(this.createFailure('privacy', 'Raw payload capture is forbidden in Phase 5.7.', 'critical'));

    if (!environmentDecision.allowed) {
      failures.push(this.createFailure('environment', environmentDecision.reason, 'critical', environmentDecision.evidence));
    }
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
      failures.push(this.createFailure('rollout-gate', 'Explicit rollout gate approval is required.', 'critical'));
    }

    if (config.requireManualApproval) {
      const stagingValidation = validateStagingShadowApproval(approval, {
        environment: config.environment,
        flows: config.allowedFlows,
        sampleRate: config.sampleRate,
        maxExecutions: config.maxTotalExecutions,
        requestedScope: 'CANARY_SHADOW',
        now: this.now(),
      });
      if (!stagingValidation.valid) {
        failures.push(this.createFailure('manual-approval', stagingValidation.reason, 'critical', stagingValidation.evidence));
      }

      for (const flow of config.allowedFlows) {
        const validation = validateManualApproval(approval?.manualApproval, {
          flow,
          sampleRate: config.sampleRate,
          requestedScope: 'CANARY_SHADOW',
          now: this.now(),
        });
        if (!validation.valid) {
          failures.push(this.createFailure('manual-approval', validation.reason, 'critical', validation.evidence));
          break;
        }
      }
    }

    return failures;
  }

  private createExecutionService(
    config: StagingShadowRunConfig,
    approval: StagingShadowApprovalEvidence | undefined,
    gateInputs: StagingShadowGateInputs
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
    const telemetryService = new ObserveTelemetryService({
      config: createObserveModeConfig({
        enabled: true,
        telemetryEnabled: false,
        captureRawPayloads: false,
      }),
      now: this.now,
    });

    return new CanaryShadowExecutionService({
      config: canaryConfig,
      controller,
      auditService: this.auditService,
      rollbackPolicy: this.rollbackPolicy,
      telemetryService,
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

  private async executeScenarioThroughExistingHook(
    scenario: StagingShadowScenario,
    config: StagingShadowRunConfig,
    service: CanaryShadowExecutionService
  ): Promise<StagingShadowFlowResult> {
    if (scenario.productionFailure) {
      return this.createSyntheticFailureResult(
        scenario,
        scenario.productionFailure,
        config.rollbackOnAnyFailure ? 'ROLLED_BACK' : 'FAILED',
        'Existing flow function failed before observe hook invocation; production output remains authoritative.'
      );
    }

    const captured: ObserveModeResult[] = [];
    const observeConfig = createObserveModeConfig({
      enabled: true,
      sampleRate: 1,
      captureInputs: false,
      captureOutputs: true,
      compareOutputs: true,
      captureRawPayloads: false,
      telemetryEnabled: false,
      dryRunBindingsEnabled: false,
      allowIndependentDryRun: false,
      allowSuppliedResultFallback: false,
    });
    const realRouter = new ObserveModeRouter({
      config: observeConfig,
      canaryShadowExecutionService: service,
      now: this.now,
    });
    const capturingRouter = {
      observe: async (request: ObserveModeRequest): Promise<ObserveModeResult> => {
        const result = await realRouter.observe(request);
        captured.push(result);
        return result;
      },
    };
    const productionOutputForHook = createHookProductionOutput(scenario);
    const beforeProduction = stableStringify(productionOutputForHook);
    const hookErrors: unknown[] = [];

    if (scenario.flow === 'assessment') {
      const hookInput = readAssessmentHookInput(scenario.hookInput);
      const hook = createAssessmentObserveHook({
        config: observeConfig,
        router: capturingRouter,
        canaryShadowExecutionService: service,
        now: this.now,
        onError: (error) => hookErrors.push(error),
      });
      hook.observeProcessResponses({
        questions: hookInput.questions,
        responses: hookInput.responses,
        productionOutput: productionOutputForHook,
        independentDryRunOperation: () => {
          if (scenario.forcedFailure) throw new Error(scenario.forcedFailure.reason);
          return scenario.shadowOutput;
        },
        studentId: `synthetic-${scenario.scenarioId}`,
        requestId: `staging-${scenario.scenarioId}`,
        metadata: {
          stagingShadowRunId: config.runId,
          scenarioId: scenario.scenarioId,
          sourceSuite: scenario.sourceSuite,
          synthetic: true,
        },
      });
      await hook.waitForIdle();
    } else {
      const hookInput = readCareerFitHookInput(scenario.hookInput, scenario.scenarioId);
      const hook = createCareerFitObserveHook({
        config: observeConfig,
        router: capturingRouter,
        canaryShadowExecutionService: service,
        now: this.now,
        onError: (error) => hookErrors.push(error),
      });
      hook.observeCalculateFit({
        profile: hookInput.profile,
        career: hookInput.career,
        profileId: hookInput.profileId,
        productionOutput: productionOutputForHook,
        independentDryRunOperation: () => {
          if (scenario.forcedFailure) throw new Error(scenario.forcedFailure.reason);
          return scenario.shadowOutput;
        },
        studentId: `synthetic-${scenario.scenarioId}`,
        requestId: `staging-${scenario.scenarioId}`,
        metadata: {
          stagingShadowRunId: config.runId,
          scenarioId: scenario.scenarioId,
          sourceSuite: scenario.sourceSuite,
          synthetic: true,
        },
      });
      await hook.waitForIdle();
    }

    const afterProduction = stableStringify(productionOutputForHook);
    const observeResult = captured[captured.length - 1];
    const record = observeResult?.canaryShadowRecord;
    if (hookErrors.length > 0) {
      return this.createSyntheticFailureResult(
        scenario,
        this.createFailure(scenario.scenarioId, describeError(hookErrors[0]), 'high'),
        'FAILED',
        'Observe hook reported an isolated failure; production output remains authoritative.'
      );
    }
    if (beforeProduction !== afterProduction) {
      return this.createSyntheticFailureResult(
        scenario,
        this.createFailure(scenario.scenarioId, 'Production output snapshot was mutated.', 'critical'),
        'FAILED',
        'Production output mutation was detected.'
      );
    }

    return this.toFlowResult(scenario, observeResult, record);
  }

  private toFlowResult(
    scenario: StagingShadowScenario,
    observeResult: ObserveModeResult | undefined,
    record: CanaryShadowExecutionRecord | undefined
  ): StagingShadowFlowResult {
    if (!record) {
      return {
        scenarioId: scenario.scenarioId,
        flow: scenario.flow,
        sourceSuite: scenario.sourceSuite,
        status: 'FAILED',
        sampled: false,
        executed: false,
        hookPathObserved: observeResult !== undefined,
        observeResultStatus: observeResult?.status,
        comparisonStatus: 'FAILED',
        matched: false,
        drifted: false,
        failed: true,
        notComparable: false,
        selfMirrored: false,
        rollbackTriggered: false,
        privacyViolation: false,
        telemetryFailure: false,
        latencyMs: 0,
        gateResultsPassed: 0,
        gateResultsTotal: 0,
        productionOutputPreserved: true,
        observeResult,
        failure: this.createFailure(scenario.scenarioId, 'Canary shadow record was not produced through observe hook path.', 'critical'),
        notes: ['Existing observe hook ran but no CANARY_SHADOW record was returned.'],
      };
    }

    const comparisonStatus = record.comparison.status;
    const gateResults = record.decision.gateResults;
    const executed = record.bindingResult !== undefined && record.status !== 'SKIPPED' && record.status !== 'BLOCKED' && record.status !== 'DISABLED';
    const drifted = comparisonStatus === 'DRIFT_DETECTED';
    const failed = comparisonStatus === 'FAILED' || record.status === 'FAILED';
    const rollbackTriggered = record.rollbackTriggered || record.status === 'ROLLED_BACK';
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      sourceSuite: scenario.sourceSuite,
      status: resolveFlowStatus(record.status, failed, executed),
      sampled: record.decision.sampleDecision?.selected ?? false,
      executed,
      hookPathObserved: isExpectedHookPath(scenario, observeResult, record),
      observeResultStatus: observeResult?.status,
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
      bindingResult: record.bindingResult,
      observeResult,
      auditRecord: record,
      payloadSummary: record.payloadSummary,
      failure:
        scenario.forcedFailure ??
        (failed ? this.createFailure(scenario.scenarioId, record.comparison.notes.join(' '), 'high') : undefined),
      notes: record.notes,
    };
  }

  private createSyntheticFailureResult(
    scenario: StagingShadowScenario,
    failure: StagingShadowFailure,
    status: StagingShadowRunStatus,
    note: string
  ): StagingShadowFlowResult {
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      sourceSuite: scenario.sourceSuite,
      status,
      sampled: false,
      executed: false,
      hookPathObserved: false,
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
      failure,
      notes: [note],
    };
  }

  private createRunResult(input: {
    run: StagingShadowRun;
    environmentDecision: StagingShadowEnvironmentDecision;
    approval?: StagingShadowApprovalEvidence;
    gateInputs: StagingShadowGateInputs;
    flowResults: readonly StagingShadowFlowResult[];
    failures: readonly StagingShadowFailure[];
    warnings: readonly string[];
    status: StagingShadowRunStatus;
    verdict: StagingShadowOperationalVerdict;
  }): StagingShadowRunResult {
    const metrics = calculateStagingShadowMetrics(input.flowResults);
    const auditBundle = createStagingShadowAuditBundle({
      runId: input.run.runId,
      environmentDecision: input.environmentDecision,
      approval: input.approval,
      gateInputs: input.gateInputs,
      flowResults: input.flowResults,
      metrics,
      finalVerdict: input.verdict,
      generatedAt: this.now(),
    });

    return Object.freeze({
      run: input.run,
      status: input.status,
      verdict: input.verdict,
      environmentDecision: input.environmentDecision,
      approval: input.approval,
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
    severity: StagingShadowFailure['severity'],
    evidence: readonly string[] = []
  ): StagingShadowFailure {
    const occurredAt = this.now();
    return {
      failureId: `staging-shadow-failure-${hashString(`${reasonKey}|${reason}|${occurredAt}`)}`,
      reason,
      severity,
      occurredAt,
      metadata: {
        reasonKey,
        evidence,
      },
    };
  }
}

function readAssessmentHookInput(value: unknown): { questions: readonly unknown[]; responses: readonly unknown[] } {
  const record = isRecord(value) ? value : {};
  return {
    questions: Array.isArray(record.questions) ? record.questions : [],
    responses: Array.isArray(record.responses) ? record.responses : [],
  };
}

function readCareerFitHookInput(
  value: unknown,
  scenarioId: string
): { profile: unknown; career: unknown; profileId: string } {
  const record = isRecord(value) ? value : {};
  return {
    profile: record.profile,
    career: record.career,
    profileId: typeof record.profileId === 'string' ? record.profileId : `${scenarioId}-profile`,
  };
}

function createHookProductionOutput(scenario: StagingShadowScenario): unknown {
  const snapshot = isRecord(scenario.productionOutputSnapshot) ? scenario.productionOutputSnapshot : {};
  if (scenario.flow === 'assessment') {
    return {
      cognitive: {},
      motivation: {},
      lifestyle: {},
      risk: {},
      workEnvironment: {},
      values: {},
      confidence: {
        profileConfidence: snapshot.profileConfidence,
        assessmentCompleteness: snapshot.assessmentCompleteness,
      },
      strengths: {
        topStrengths: Array.from({ length: readNumber(snapshot, 'topStrengthCount') ?? 0 }, (_entry, index) => `strength-${index}`),
      },
      weaknesses: {
        developmentAreas: Array.from({ length: readNumber(snapshot, 'developmentAreaCount') ?? 0 }, (_entry, index) => `area-${index}`),
      },
    };
  }

  return {
    careerId: readString(snapshot, 'careerId'),
    studentProfileId: readString(snapshot, 'studentProfileId'),
    overallFitScore: readNumber(snapshot, 'overallFitScore'),
    fitLevel: readString(snapshot, 'fitLevel'),
    confidence: {
      overall: readNumber(snapshot, 'confidenceOverall'),
      level: readString(snapshot, 'confidenceLevel'),
    },
    strengths: Array.from({ length: readNumber(snapshot, 'strengthCount') ?? 0 }, (_entry, index) => `strength-${index}`),
    concerns: Array.from({ length: readNumber(snapshot, 'concernCount') ?? 0 }, (_entry, index) => `concern-${index}`),
  };
}

function isExpectedHookPath(
  scenario: StagingShadowScenario,
  observeResult: ObserveModeResult | undefined,
  record: CanaryShadowExecutionRecord
): boolean {
  if (!observeResult) return false;
  const hook = observeResult.auditRecord.productionCall.metadata.hook;
  const binding = record.bindingResult?.bindingId;
  if (scenario.flow === 'assessment') {
    return hook === 'AssessmentEngine.processResponses' && binding === 'assessment.processResponses';
  }
  return hook === 'CareerFitEngine.calculateFit' && binding === 'career-fit.calculateFit';
}

function collectWarnings(results: readonly StagingShadowFlowResult[]): readonly string[] {
  const warnings: string[] = [];
  if (results.some((result) => !result.hookPathObserved)) {
    warnings.push('At least one scenario did not prove the expected observe-hook path.');
  }
  if (results.some((result) => result.notComparable || result.selfMirrored)) {
    warnings.push('At least one scenario did not produce an independent comparable result.');
  }
  return warnings;
}

function resolveRunStatus(
  metrics: ReturnType<typeof calculateStagingShadowMetrics>,
  failures: readonly StagingShadowFailure[]
): StagingShadowRunStatus {
  if (metrics.rollbackCount > 0) return 'ROLLED_BACK';
  if (failures.length > 0 || metrics.failedCount > 0 || metrics.driftCount > 0) return 'FAILED';
  return 'COMPLETED';
}

function resolveVerdict(
  metrics: ReturnType<typeof calculateStagingShadowMetrics>,
  failures: readonly StagingShadowFailure[],
  warnings: readonly string[]
): StagingShadowOperationalVerdict {
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
): StagingShadowRunStatus {
  if (status === 'ROLLED_BACK') return 'ROLLED_BACK';
  if (failed) return 'FAILED';
  if (executed) return 'COMPLETED';
  if (status === 'BLOCKED' || status === 'DISABLED' || status === 'SKIPPED') return 'BLOCKED';
  return 'PLANNED';
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
