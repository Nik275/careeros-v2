/**
 * @fileoverview Controlled CANARY_SHADOW execution service.
 *
 * This service executes dry-run authority bindings beside production only. It
 * catches all failures and never mutates or replaces production output.
 */

import { AssessmentAuthorityBinding } from '../bindings/AssessmentAuthorityBinding';
import { AuthorityExecutionBindingRegistry } from '../bindings/AuthorityExecutionBindingRegistry';
import type { AuthorityExecutionBindingResult } from '../bindings/AuthorityExecutionBindingTypes';
import { CareerFitAuthorityBinding } from '../bindings/CareerFitAuthorityBinding';
import { DryRunAuthorityExecutionCoordinator } from '../bindings/DryRunAuthorityExecutionCoordinator';
import { createObserveModeConfig } from '../observe/ObserveModeConfig';
import type { ObserveModeConfig } from '../observe/ObserveModeConfig';
import type { ObserveModeRequest } from '../observe/ObserveModeTypes';
import type { ObserveTelemetryService } from '../observe/ObserveTelemetryService';
import { CanaryShadowAuditService } from './CanaryShadowAuditService';
import { createCanaryShadowConfig, type CanaryShadowConfig } from './CanaryShadowConfig';
import { CanaryShadowController, type CanaryShadowEvaluationInput } from './CanaryShadowController';
import { CanaryShadowRollbackPolicy } from './CanaryShadowRollbackPolicy';
import type { ManualApprovalRecord } from './ManualApprovalRecord';
import type {
  CanaryShadowComparisonResult,
  CanaryShadowDecision,
  CanaryShadowExecutionRecord,
  CanaryShadowStatus,
} from './CanaryShadowTypes';
import { resolveCanaryShadowFlowConfig } from './CanaryShadowTypes';

export interface CanaryShadowExecutionServiceOptions {
  config?: CanaryShadowConfig;
  controller?: CanaryShadowController;
  bindingCoordinator?: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  auditService?: CanaryShadowAuditService;
  rollbackPolicy?: CanaryShadowRollbackPolicy;
  telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure' | 'getSummary'>;
  manualApproval?: ManualApprovalRecord;
  defaultGateInputs?: Omit<
    Partial<CanaryShadowEvaluationInput>,
    'requestId' | 'flow' | 'config' | 'manualApproval'
  >;
  now?: () => string;
}

export interface CanaryShadowExecutionInput {
  request: ObserveModeRequest;
  productionOutput?: unknown;
  manualApproval?: ManualApprovalRecord;
  config?: CanaryShadowConfig;
  gateInputs?: Omit<
    Partial<CanaryShadowEvaluationInput>,
    'requestId' | 'flow' | 'config' | 'manualApproval'
  >;
}

export class CanaryShadowExecutionService {
  private readonly config: CanaryShadowConfig;
  private readonly controller: CanaryShadowController;
  private readonly bindingCoordinator: Pick<DryRunAuthorityExecutionCoordinator, 'execute'>;
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure' | 'getSummary'>;
  private readonly manualApproval?: ManualApprovalRecord;
  private readonly defaultGateInputs: Omit<
    Partial<CanaryShadowEvaluationInput>,
    'requestId' | 'flow' | 'config' | 'manualApproval'
  >;
  private readonly now: () => string;

  constructor(options: CanaryShadowExecutionServiceOptions = {}) {
    this.config = options.config ?? createCanaryShadowConfig();
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: options.now });
    this.controller =
      options.controller ??
      new CanaryShadowController({
        config: this.config,
        rollbackPolicy: this.rollbackPolicy,
        now: options.now,
      });
    this.bindingCoordinator =
      options.bindingCoordinator ?? createDefaultCanaryShadowBindingCoordinator(options.now);
    this.telemetryService = options.telemetryService;
    this.manualApproval = options.manualApproval;
    this.defaultGateInputs = options.defaultGateInputs ?? {};
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute(input: CanaryShadowExecutionInput): Promise<CanaryShadowExecutionRecord> {
    const request = input.request;
    const config = input.config ?? this.config;
    const startedAt = this.now();
    const productionOutput = input.productionOutput ?? request.productionCall.outputSnapshot;

    try {
      const decision = this.controller.evaluate({
        requestId: request.observeRequestId,
        flow: request.productionCall.flowName,
        manualApproval: input.manualApproval ?? this.manualApproval,
        telemetryHealthy: this.resolveTelemetryHealth(input),
        privacySafe: this.resolvePrivacySafety(input),
        ...this.defaultGateInputs,
        ...(input.gateInputs ?? {}),
        config,
      });

      if (!decision.approved) {
        return this.recordFinal({
          decision,
          request,
          startedAt,
          status: decision.status,
          comparison: {
            status: decision.status === 'SKIPPED' ? 'SKIPPED' : 'NOT_COMPARABLE',
            comparable: false,
            productionOutputCaptured: productionOutput !== undefined,
            shadowOutputCaptured: false,
            differences: [],
            notes: decision.reasons,
          },
          config,
          productionOutput,
          notes: ['CANARY_SHADOW did not execute because control gates did not approve it.'],
        });
      }

      const shadowConfig = createShadowObserveConfig(request.config, config, request.productionCall.flowName);
      const bindingResult = await this.bindingCoordinator.execute(request, shadowConfig);
      const comparison = compareShadowResult({
        productionOutput,
        bindingResult,
        captureComparisonDetails: config.captureComparisonDetails,
      });
      const status = comparison.status === 'FAILED' ? 'FAILED' : 'COMPLETED';

      const provisional = this.createRecord({
        decision,
        request,
        startedAt,
        status,
        bindingResult,
        comparison,
        config,
        productionOutput,
        notes: ['CANARY_SHADOW executed through dry-run authority binding only.'],
      });
      const rollback = this.rollbackPolicy.evaluate(provisional, config);
      const finalRecord =
        rollback.rollbackTriggered
          ? Object.freeze({
              ...provisional,
              status: 'ROLLED_BACK' as const,
              rollbackTriggered: true,
              rollbackReason: rollback.reason,
              notes: [...provisional.notes, ...rollback.notes],
            })
          : provisional;

      this.auditService.record(finalRecord);
      if (comparison.status === 'FAILED') {
        this.telemetryService?.recordHookFailure({
          hookName: request.productionCall.operationName,
          error: bindingResult.failure?.message ?? 'CANARY_SHADOW binding failed.',
          traceId: request.traceId,
          requestId: request.observeRequestId,
          flowType: request.productionCall.flowName,
          authority: String(request.productionCall.metadata.authority ?? 'IntelligenceOrchestrator'),
          capability: request.productionCall.capability,
          metadata: {
            canaryShadow: true,
            comparisonStatus: comparison.status,
          },
        });
      }
      return finalRecord;
    } catch (error) {
      const decision = createFailureDecision({
        requestId: request.observeRequestId,
        flow: request.productionCall.flowName,
        decidedAt: startedAt,
        error,
      });
      const record = this.createRecord({
        decision,
        request,
        startedAt,
        status: 'FAILED',
        comparison: {
          status: 'FAILED',
          comparable: false,
          productionOutputCaptured: productionOutput !== undefined,
          shadowOutputCaptured: false,
          differences: [],
          notes: [describeError(error)],
        },
        config,
        productionOutput,
        notes: ['CANARY_SHADOW failure was caught and isolated from production output.'],
      });
      this.auditService.record(record);
      this.telemetryService?.recordHookFailure({
        hookName: request.productionCall.operationName,
        error,
        traceId: request.traceId,
        requestId: request.observeRequestId,
        flowType: request.productionCall.flowName,
        authority: String(request.productionCall.metadata.authority ?? 'IntelligenceOrchestrator'),
        capability: request.productionCall.capability,
        metadata: { canaryShadow: true },
      });
      return record;
    }
  }

  getAuditService(): CanaryShadowAuditService {
    return this.auditService;
  }

  getRollbackPolicy(): CanaryShadowRollbackPolicy {
    return this.rollbackPolicy;
  }

  private recordFinal(input: {
    decision: CanaryShadowDecision;
    request: ObserveModeRequest;
    startedAt: string;
    status: CanaryShadowStatus;
    comparison: CanaryShadowComparisonResult;
    config: CanaryShadowConfig;
    productionOutput: unknown;
    notes: readonly string[];
  }): CanaryShadowExecutionRecord {
    const record = this.createRecord(input);
    this.auditService.record(record);
    return record;
  }

  private createRecord(input: {
    decision: CanaryShadowDecision;
    request: ObserveModeRequest;
    startedAt: string;
    status: CanaryShadowStatus;
    bindingResult?: AuthorityExecutionBindingResult;
    comparison: CanaryShadowComparisonResult;
    config: CanaryShadowConfig;
    productionOutput: unknown;
    notes: readonly string[];
  }): CanaryShadowExecutionRecord {
    const completedAt = this.now();
    return Object.freeze({
      recordId: `canary-shadow-record-${hashString(
        `${input.request.observeRequestId}|${input.status}|${completedAt}`
      )}`,
      decision: input.decision,
      requestId: input.request.observeRequestId,
      productionCallId: input.request.productionCall.callId,
      flow: input.request.productionCall.flowName,
      status: input.status,
      bindingResult: input.bindingResult,
      comparison: input.comparison,
      startedAt: input.startedAt,
      completedAt,
      latencyMs: new Date(completedAt).getTime() - new Date(input.startedAt).getTime(),
      rollbackTriggered: false,
      payloadSummary: this.auditService.createPayloadSummary(
        {
          productionCall: input.request.productionCall,
          comparison: input.comparison,
        },
        input.config
      ),
      privacySafe: !input.request.config.captureRawPayloads,
      telemetryHealthy: this.telemetryService?.getSummary().health.healthy ?? false,
      productionOutputPreserved: true,
      notes: input.notes,
    });
  }

  private resolveTelemetryHealth(input: CanaryShadowExecutionInput): boolean {
    return (
      input.gateInputs?.telemetryHealthy ??
      this.defaultGateInputs.telemetryHealthy ??
      this.telemetryService?.getSummary().health.healthy ??
      false
    );
  }

  private resolvePrivacySafety(input: CanaryShadowExecutionInput): boolean {
    return input.gateInputs?.privacySafe ?? this.defaultGateInputs.privacySafe ?? !input.request.config.captureRawPayloads;
  }
}

function createDefaultCanaryShadowBindingCoordinator(
  now?: () => string
): DryRunAuthorityExecutionCoordinator {
  const registry = new AuthorityExecutionBindingRegistry();
  registry.register(new AssessmentAuthorityBinding({ now }));
  registry.register(new CareerFitAuthorityBinding({ now }));
  return new DryRunAuthorityExecutionCoordinator({ registry, now });
}

function createShadowObserveConfig(
  baseConfig: ObserveModeConfig,
  canaryConfig: CanaryShadowConfig,
  flow: string
): ObserveModeConfig {
  const flowConfig = resolveCanaryShadowFlowConfig(flow);
  return createObserveModeConfig({
    ...baseConfig,
    enabled: true,
    sampleRate: 1,
    captureInputs: false,
    captureOutputs: false,
    compareOutputs: true,
    captureRawPayloads: false,
    dryRunBindingsEnabled: true,
    enabledBindings: flowConfig ? [flowConfig.bindingId] : [],
    allowIndependentDryRun: true,
    allowSuppliedResultFallback: false,
    maxBindingExecutionMs: canaryConfig.maxLatencyMs,
    failClosedForBindingErrors: false,
    enableAssessmentIndependentDryRun: flow === 'assessment',
    assessmentDryRunMode: flow === 'assessment' ? 'INDEPENDENT_DRY_RUN' : 'DISABLED',
    assessmentParityComparisonEnabled: flow === 'assessment',
    enableIndependentPilotBinding: flow === 'career-fit',
    pilotBindingName: flow === 'career-fit' ? 'career-fit.calculateFit' : undefined,
    allowPilotDryRunExecution: flow === 'career-fit',
  });
}

function compareShadowResult(input: {
  productionOutput: unknown;
  bindingResult: AuthorityExecutionBindingResult;
  captureComparisonDetails: boolean;
}): CanaryShadowComparisonResult {
  const bindingStatus = input.bindingResult.comparisonStatus;
  if (bindingStatus === 'BINDING_FAILED' || input.bindingResult.failure) {
    return {
      status: 'FAILED',
      comparable: false,
      productionOutputCaptured: input.productionOutput !== undefined,
      shadowOutputCaptured: input.bindingResult.outputSnapshot !== undefined,
      differences: [],
      notes: input.bindingResult.notes,
    };
  }

  if (bindingStatus === 'SELF_MIRRORED') {
    return {
      status: 'SELF_MIRRORED',
      comparable: false,
      productionOutputCaptured: input.productionOutput !== undefined,
      shadowOutputCaptured: input.bindingResult.outputSnapshot !== undefined,
      differences: [],
      notes: ['Shadow binding self-mirrored production output; no independent parity claim made.'],
    };
  }

  if (bindingStatus === 'BINDING_DISABLED' || bindingStatus === 'BINDING_NOT_FOUND') {
    return {
      status: 'SKIPPED',
      comparable: false,
      productionOutputCaptured: input.productionOutput !== undefined,
      shadowOutputCaptured: false,
      differences: [],
      notes: input.bindingResult.notes,
    };
  }

  if (!input.bindingResult.comparable || input.bindingResult.outputSnapshot === undefined) {
    return {
      status: 'NOT_COMPARABLE',
      comparable: false,
      productionOutputCaptured: input.productionOutput !== undefined,
      shadowOutputCaptured: input.bindingResult.outputSnapshot !== undefined,
      differences: [],
      notes: input.bindingResult.notes,
    };
  }

  const differences = findDifferences(input.productionOutput, input.bindingResult.outputSnapshot);
  return {
    status: differences.length === 0 ? 'MATCHED' : 'DRIFT_DETECTED',
    comparable: true,
    productionOutputCaptured: input.productionOutput !== undefined,
    shadowOutputCaptured: true,
    differences: input.captureComparisonDetails ? differences : differences.map((difference) => `field:${difference}`),
    notes:
      differences.length === 0
        ? ['CANARY_SHADOW output matched production snapshot.']
        : ['CANARY_SHADOW drift detected; production output remains authoritative.'],
  };
}

function findDifferences(left: unknown, right: unknown): readonly string[] {
  if (!isRecord(left) || !isRecord(right)) {
    return stableStringify(left) === stableStringify(right) ? [] : ['root'];
  }

  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  return keys.filter((key) => stableStringify(left[key]) !== stableStringify(right[key]));
}

function createFailureDecision(input: {
  requestId: string;
  flow: string;
  decidedAt: string;
  error: unknown;
}): CanaryShadowDecision {
  return Object.freeze({
    decisionId: `canary-shadow-decision-${hashString(`${input.requestId}|failure|${input.decidedAt}`)}`,
    requestId: input.requestId,
    flow: input.flow,
    mode: 'CANARY_SHADOW',
    status: 'FAILED',
    approved: false,
    gateResults: [],
    riskLevel: 'critical',
    reasons: [describeError(input.error)],
    decidedAt: input.decidedAt,
    metadata: {},
  });
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
