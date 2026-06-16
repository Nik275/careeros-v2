/**
 * @fileoverview Controlled CANARY_SHADOW trial runner.
 */

import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveModeRouter } from '../../observe/ObserveModeRouter';
import type { ObserveModeRequest } from '../../observe/ObserveModeTypes';
import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowController } from '../CanaryShadowController';
import { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import { CanaryShadowRollbackPolicy } from '../CanaryShadowRollbackPolicy';
import { CanaryShadowSampler } from '../CanaryShadowSampler';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';
import { validateManualApproval } from '../ManualApprovalRecord';
import type { RolloutManager } from '../RolloutManager';
import { getCanaryShadowTrialDataset } from './CanaryShadowTrialDataset';
import { createCanaryShadowTrialConfig } from './CanaryShadowTrialConfig';
import { CanaryShadowTrialGate } from './CanaryShadowTrialGate';
import { calculateCanaryShadowTrialMetrics } from './CanaryShadowTrialMetrics';
import type {
  CanaryShadowTrial,
  CanaryShadowTrialConfig,
  CanaryShadowTrialFailure,
  CanaryShadowTrialFlowResult,
  CanaryShadowTrialResult,
  CanaryShadowTrialRun,
  CanaryShadowTrialScenario,
  CanaryShadowTrialStatus,
  CanaryShadowTrialVerdict,
} from './CanaryShadowTrialTypes';

export interface CanaryShadowTrialGateInputs {
  rolloutGateApproved?: boolean;
  expandedParityCIGatePassed?: boolean;
  privacySafe?: boolean;
  telemetryHealthy?: boolean;
  killSwitchActive?: boolean;
  flowKillSwitchActive?: boolean;
}

export interface CanaryShadowTrialRunnerOptions {
  scenarios?: readonly CanaryShadowTrialScenario[];
  trialGate?: CanaryShadowTrialGate;
  auditService?: CanaryShadowAuditService;
  rollbackPolicy?: CanaryShadowRollbackPolicy;
  rolloutManager?: RolloutManager;
  now?: () => string;
}

export interface CanaryShadowTrialRunInput {
  config?: CanaryShadowTrialConfig;
  approval?: ManualApprovalRecord;
  scenarios?: readonly CanaryShadowTrialScenario[];
  gateInputs?: CanaryShadowTrialGateInputs;
}

export class CanaryShadowTrialRunner {
  private readonly scenarios: readonly CanaryShadowTrialScenario[];
  private readonly trialGate: CanaryShadowTrialGate;
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly rolloutManager?: RolloutManager;
  private readonly now: () => string;

  constructor(options: CanaryShadowTrialRunnerOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.scenarios = options.scenarios ?? getCanaryShadowTrialDataset();
    this.trialGate = options.trialGate ?? new CanaryShadowTrialGate({}, { now: this.now });
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: this.now });
    this.rolloutManager = options.rolloutManager;
  }

  async run(input: CanaryShadowTrialRunInput = {}): Promise<CanaryShadowTrialResult> {
    const config = createCanaryShadowTrialConfig(input.config);
    const approval = input.approval;
    const gateInputs = input.gateInputs ?? {};
    const selectedScenarios = this.selectScenarios(input.scenarios ?? this.scenarios, config);
    const startedAt = this.now();
    const trial = this.createTrial(config, approval, selectedScenarios.length, startedAt);
    const run: CanaryShadowTrialRun = {
      runId: `canary-shadow-trial-run-${hashString(`${config.trialId}|${startedAt}`)}`,
      trialId: config.trialId,
      status: 'RUNNING',
      startedAt,
      scenarioCount: selectedScenarios.length,
      approval,
      notes: ['Controlled CANARY_SHADOW trial started.'],
    };

    const blocked = this.validateTrialStart(config, approval, gateInputs);
    if (blocked.length > 0) {
      return this.createResult({
        trial: { ...trial, status: 'BLOCKED' },
        run: { ...run, status: 'BLOCKED', completedAt: this.now(), notes: blocked.map((failure) => failure.reason) },
        flowResults: [],
        failures: blocked,
        warnings: [],
        verdict: 'BLOCKED',
        status: 'BLOCKED',
      });
    }

    const flowResults: CanaryShadowTrialFlowResult[] = [];
    const service = this.createExecutionService(config, approval, gateInputs);
    const router = new ObserveModeRouter({
      config: createObserveModeConfig({ enabled: true, sampleRate: 1, captureRawPayloads: false }),
      canaryShadowExecutionService: service,
      now: this.now,
    });

    for (const scenario of selectedScenarios) {
      const request = this.createObserveRequest(scenario, config);
      const result = await router.observe(request);
      const record = result.canaryShadowRecord;
      flowResults.push(this.toFlowResult(scenario, record));
    }

    const metrics = calculateCanaryShadowTrialMetrics(flowResults);
    const gate = this.trialGate.evaluate(metrics);
    const failures = [
      ...flowResults.flatMap((result) => (result.failure ? [result.failure] : [])),
      ...gate.failures.map((failure) => this.createFailure('trial-gate', failure, 'high')),
    ];
    const status = resolveTrialStatus(gate.verdict, metrics.rollbackCount);

    return this.createResult({
      trial: { ...trial, status },
      run: {
        ...run,
        status,
        completedAt: this.now(),
        notes: ['Controlled CANARY_SHADOW trial completed.'],
      },
      flowResults,
      failures,
      warnings: gate.warnings,
      verdict: gate.verdict,
      status,
    });
  }

  private selectScenarios(
    scenarios: readonly CanaryShadowTrialScenario[],
    config: CanaryShadowTrialConfig
  ): readonly CanaryShadowTrialScenario[] {
    const allowed = scenarios.filter((scenario) => config.allowedFlows.includes(scenario.flow));
    return config.maxScenarios > 0 ? allowed.slice(0, config.maxScenarios) : [];
  }

  private validateTrialStart(
    config: CanaryShadowTrialConfig,
    approval: ManualApprovalRecord | undefined,
    gateInputs: CanaryShadowTrialGateInputs
  ): readonly CanaryShadowTrialFailure[] {
    const failures: CanaryShadowTrialFailure[] = [];

    if (!config.enabled) failures.push(this.createFailure('trial-config', 'Trial is disabled.', 'critical'));
    if (config.sampleRate <= 0) failures.push(this.createFailure('trial-config', 'Trial sampleRate is 0.', 'critical'));
    if (config.maxScenarios <= 0) failures.push(this.createFailure('trial-config', 'Trial maxScenarios is 0.', 'critical'));
    if (config.captureRawPayloads) failures.push(this.createFailure('privacy', 'Raw payload capture is forbidden.', 'critical'));
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

    if (config.requireManualApproval) {
      const approvalValidation = validateManualApproval(approval, {
        flow: config.allowedFlows[0] ?? 'assessment',
        sampleRate: config.sampleRate,
        now: this.now(),
      });
      if (!approvalValidation.valid) {
        failures.push(this.createFailure('manual-approval', approvalValidation.reason, 'critical'));
      }
      for (const flow of config.allowedFlows) {
        const flowValidation = validateManualApproval(approval, {
          flow,
          sampleRate: config.sampleRate,
          now: this.now(),
        });
        if (!flowValidation.valid) {
          failures.push(this.createFailure('manual-approval', flowValidation.reason, 'critical'));
          break;
        }
      }
    }

    return failures;
  }

  private createExecutionService(
    config: CanaryShadowTrialConfig,
    approval: ManualApprovalRecord | undefined,
    gateInputs: CanaryShadowTrialGateInputs
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
      rollbackOnDrift: config.rollbackOnAnyCriticalDrift,
      rollbackOnFailure: config.rollbackOnAnyFailure,
      rollbackOnLatencyRegression: config.rollbackOnLatencyRegression,
      capturePayloadSummaries: config.capturePayloadSummaries,
      captureComparisonDetails: true,
    });
    const controller = new CanaryShadowController({
      config: canaryConfig,
      sampler: new CanaryShadowSampler({ now: this.now }),
      rolloutManager: this.rolloutManager,
      rollbackPolicy: this.rollbackPolicy,
      now: this.now,
    });

    return new CanaryShadowExecutionService({
      config: canaryConfig,
      controller,
      auditService: this.auditService,
      rollbackPolicy: this.rollbackPolicy,
      manualApproval: approval,
      defaultGateInputs: {
        rolloutGateApproved: gateInputs.rolloutGateApproved ?? this.rolloutManager === undefined,
        expandedParityCIGatePassed: gateInputs.expandedParityCIGatePassed,
        privacySafe: gateInputs.privacySafe,
        telemetryHealthy: gateInputs.telemetryHealthy,
        killSwitchActive: gateInputs.killSwitchActive,
        flowKillSwitchActive: gateInputs.flowKillSwitchActive ?? false,
      },
      now: this.now,
    });
  }

  private createObserveRequest(
    scenario: CanaryShadowTrialScenario,
    config: CanaryShadowTrialConfig
  ): ObserveModeRequest {
    const observeConfig = createObserveModeConfig({
      enabled: true,
      sampleRate: 1,
      captureInputs: false,
      captureOutputs: false,
      compareOutputs: true,
      captureRawPayloads: false,
      telemetryEnabled: false,
      dryRunBindingsEnabled: false,
    });

    return {
      observeRequestId: `trial-observe-${scenario.scenarioId}`,
      traceId: `trial-trace-${scenario.scenarioId}`,
      productionCall: {
        callId: `trial-production-${scenario.scenarioId}`,
        flowName: scenario.flow,
        sourceModule:
          scenario.flow === 'assessment'
            ? 'src/assessment/assessment-engine.ts'
            : 'src/career-fit/career-fit-engine.ts',
        operationName: scenario.flow === 'assessment' ? 'processResponses' : 'calculateFit',
        studentId: `synthetic-${scenario.scenarioId}`,
        requestType: scenario.flow === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
        capability: scenario.expectedCapability,
        timestamp: this.now(),
        inputSnapshot: scenario.input,
        outputSnapshot: scenario.productionOutputSnapshot,
        metadata: {
          trialId: config.trialId,
          scenarioId: scenario.scenarioId,
          sourceSuite: scenario.sourceSuite,
          authority: scenario.expectedAuthority,
          capability: scenario.expectedCapability,
          hook: scenario.flow === 'assessment' ? 'AssessmentEngine.processResponses' : 'CareerFitEngine.calculateFit',
        },
      },
      config: observeConfig,
      executionPayload: {
        independentDryRunOperation: () => {
          if (scenario.forcedFailure) {
            throw new Error(scenario.forcedFailure.reason);
          }
          return scenario.shadowOutput;
        },
      },
      metadata: {
        trialId: config.trialId,
        synthetic: true,
      },
    };
  }

  private toFlowResult(
    scenario: CanaryShadowTrialScenario,
    record: Awaited<ReturnType<CanaryShadowExecutionService['execute']>> | undefined
  ): CanaryShadowTrialFlowResult {
    if (!record) {
      return {
        scenarioId: scenario.scenarioId,
        flow: scenario.flow,
        sourceSuite: scenario.sourceSuite,
        status: 'FAILED',
        sampled: false,
        executed: false,
        comparisonStatus: 'FAILED',
        matched: false,
        drifted: false,
        failed: true,
        notComparable: false,
        selfMirrored: false,
        rollbackTriggered: false,
        criticalDrift: false,
        privacyViolation: false,
        telemetryFailure: false,
        latencyMs: 0,
        gateResultsPassed: 0,
        gateResultsTotal: 0,
        productionOutputPreserved: true,
        failure: this.createFailure(scenario.scenarioId, 'Canary shadow record was not produced.', 'critical'),
        notes: ['Router did not return a canary shadow record.'],
      };
    }

    const comparisonStatus = record.comparison.status;
    const gateResults = record.decision.gateResults;
    const executed = record.bindingResult !== undefined && record.status !== 'SKIPPED' && record.status !== 'BLOCKED';
    const drifted = comparisonStatus === 'DRIFT_DETECTED';
    const failed = comparisonStatus === 'FAILED' || record.status === 'FAILED';
    return {
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      sourceSuite: scenario.sourceSuite,
      status: resolveFlowResultStatus(record.status, failed, executed),
      sampled: record.decision.sampleDecision?.selected ?? false,
      executed,
      comparisonStatus,
      matched: comparisonStatus === 'MATCHED',
      drifted,
      failed,
      notComparable: comparisonStatus === 'NOT_COMPARABLE',
      selfMirrored: comparisonStatus === 'SELF_MIRRORED',
      rollbackTriggered: record.rollbackTriggered,
      criticalDrift: drifted && scenario.riskLevel === 'CRITICAL',
      privacyViolation: !record.privacySafe,
      telemetryFailure: false,
      latencyMs: record.latencyMs,
      gateResultsPassed: gateResults.filter((gate) => gate.passed).length,
      gateResultsTotal: gateResults.length,
      productionOutputPreserved: true,
      bindingResult: record.bindingResult,
      auditRecord: record,
      payloadSummary: record.payloadSummary,
      failure: scenario.forcedFailure ?? (failed ? this.createFailure(scenario.scenarioId, record.comparison.notes.join(' '), 'high') : undefined),
      notes: record.notes,
    };
  }

  private createTrial(
    config: CanaryShadowTrialConfig,
    approval: ManualApprovalRecord | undefined,
    scenarioCount: number,
    createdAt: string
  ): CanaryShadowTrial {
    return {
      trialId: config.trialId,
      status: approval ? 'APPROVED' : 'PLANNED',
      config,
      approval,
      scenarioCount,
      createdAt,
      approvalEvidence:
        approval?.evidence.map((entry) => ({
          evidenceId: entry.evidenceId,
          description: entry.description,
          parityEvidenceReference: String(entry.metadata.parityEvidenceReference ?? 'unknown'),
          createdAt: entry.createdAt,
          metadata: entry.metadata,
        })) ?? [],
    };
  }

  private createResult(input: {
    trial: CanaryShadowTrial;
    run: CanaryShadowTrialRun;
    flowResults: readonly CanaryShadowTrialFlowResult[];
    failures: readonly CanaryShadowTrialFailure[];
    warnings: readonly string[];
    verdict: CanaryShadowTrialVerdict;
    status: CanaryShadowTrialStatus;
  }): CanaryShadowTrialResult {
    return Object.freeze({
      trial: input.trial,
      run: input.run,
      status: input.status,
      verdict: input.verdict,
      flowResults: input.flowResults,
      metrics: calculateCanaryShadowTrialMetrics(input.flowResults),
      failures: input.failures,
      warnings: input.warnings,
      productionOutputPreserved: true,
    });
  }

  private createFailure(
    reasonKey: string,
    reason: string,
    severity: CanaryShadowTrialFailure['severity']
  ): CanaryShadowTrialFailure {
    const occurredAt = this.now();
    return {
      failureId: `canary-shadow-trial-failure-${hashString(`${reasonKey}|${reason}|${occurredAt}`)}`,
      reason,
      severity,
      occurredAt,
      metadata: {
        reasonKey,
      },
    };
  }
}

function resolveTrialStatus(
  verdict: CanaryShadowTrialVerdict,
  rollbackCount: number
): CanaryShadowTrialStatus {
  if (rollbackCount > 0) return 'ROLLED_BACK';
  if (verdict === 'PASS' || verdict === 'PASS_WITH_WARNINGS') return 'COMPLETED';
  if (verdict === 'BLOCKED') return 'BLOCKED';
  return 'FAILED';
}

function resolveFlowResultStatus(
  status: Awaited<ReturnType<CanaryShadowExecutionService['execute']>>['status'],
  failed: boolean,
  executed: boolean
): CanaryShadowTrialStatus {
  if (status === 'ROLLED_BACK') return 'ROLLED_BACK';
  if (failed) return 'FAILED';
  if (executed) return 'COMPLETED';
  if (status === 'BLOCKED' || status === 'DISABLED' || status === 'SKIPPED') return 'BLOCKED';
  return 'PLANNED';
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
