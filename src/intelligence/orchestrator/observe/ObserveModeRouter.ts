/**
 * @fileoverview Safe observe-mode router.
 *
 * This sidecar router mirrors production call metadata into the
 * IntelligenceOrchestrator. It catches all failures and never mutates the
 * production output.
 */

import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';
import { DryRunAuthorityExecutionCoordinator } from '../bindings/DryRunAuthorityExecutionCoordinator';
import type { AuthorityExecutionBindingResult } from '../bindings/AuthorityExecutionBindingTypes';
import { createOrchestratorRequest } from '../OrchestratorRequest';
import { getLifecycleStagesForRequestType } from '../RequestLifecycle';
import type { CanaryShadowExecutionService } from '../rollout/CanaryShadowExecutionService';
import type { CanaryShadowExecutionRecord } from '../rollout/CanaryShadowTypes';
import type { RolloutManager } from '../rollout/RolloutManager';
import type { AuthorityLifecycleState } from '../RequestLifecycle';
import { createObserveModeConfig, shouldSampleObserveMode, type ObserveModeConfig } from './ObserveModeConfig';
import { ObserveModeAuditService } from './ObserveModeAuditService';
import { ObserveTelemetryService } from './ObserveTelemetryService';
import { OrchestratorDriftDetector } from './OrchestratorDriftDetector';
import type {
  ObserveModeAuditRecord,
  ObserveModeComparison,
  ObserveModeRequest,
  ObserveModeResult,
  ObserveModeStatus,
  ObservedOrchestratorCall,
} from './ObserveModeTypes';

export interface ObserveModeRouterOptions {
  orchestrator?: IntelligenceOrchestrator;
  driftDetector?: OrchestratorDriftDetector;
  auditService?: ObserveModeAuditService;
  telemetryService?: ObserveTelemetryService;
  bindingCoordinator?: DryRunAuthorityExecutionCoordinator;
  rolloutManager?: RolloutManager;
  canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
  config?: ObserveModeConfig;
  now?: () => string;
  random?: () => number;
}

export class ObserveModeRouter {
  private readonly orchestrator: IntelligenceOrchestrator;
  private readonly driftDetector: OrchestratorDriftDetector;
  private readonly auditService: ObserveModeAuditService;
  private readonly telemetryService: ObserveTelemetryService;
  private readonly bindingCoordinator: DryRunAuthorityExecutionCoordinator;
  private readonly rolloutManager?: RolloutManager;
  private readonly canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
  private readonly defaultConfig: ObserveModeConfig;
  private readonly now: () => string;
  private readonly random: () => number;

  constructor(options: ObserveModeRouterOptions = {}) {
    this.orchestrator = options.orchestrator ?? new IntelligenceOrchestrator();
    this.driftDetector = options.driftDetector ?? new OrchestratorDriftDetector();
    this.auditService = options.auditService ?? new ObserveModeAuditService();
    this.defaultConfig = options.config ?? createObserveModeConfig();
    this.telemetryService =
      options.telemetryService ?? new ObserveTelemetryService({ config: this.defaultConfig });
    this.bindingCoordinator =
      options.bindingCoordinator ??
      new DryRunAuthorityExecutionCoordinator({
        telemetryService: this.telemetryService,
        rolloutManager: options.rolloutManager,
        now: options.now,
      });
    this.rolloutManager = options.rolloutManager;
    this.canaryShadowExecutionService = options.canaryShadowExecutionService;
    this.now = options.now ?? (() => new Date().toISOString());
    this.random = options.random ?? Math.random;
  }

  async observe(request: ObserveModeRequest): Promise<ObserveModeResult> {
    const config = request.config ?? this.defaultConfig;
    const productionOutput = request.productionCall.outputSnapshot;

    if (!shouldSampleObserveMode(config, this.random())) {
      return this.createResult({
        request,
        status: 'SKIPPED',
        productionOutput,
        comparison: {
          status: 'SKIPPED',
          comparable: false,
          productionOutputCaptured: request.productionCall.outputSnapshot !== undefined,
          orchestratorOutputCaptured: false,
          drifts: [],
          notes: ['Observe mode disabled or request not selected by sample rate.'],
        },
        notes: ['Production path was not observed because observe mode did not sample this call.'],
      });
    }

    if (this.rolloutManager) {
      const requestedMode = config.dryRunBindingsEnabled ? 'DRY_RUN_COMPARE' : 'OBSERVE_ONLY';
      const decision = this.rolloutManager.evaluate({
        flow: request.productionCall.flowName,
        requestedMode,
        flowPolicy: {
          observeModeEnabled: config.enabled,
          bindingAvailable: config.dryRunBindingsEnabled,
          telemetryHealthy: !config.telemetryEnabled || this.telemetryService.getSummary().health.healthy,
          privacySafe: !config.captureRawPayloads,
        },
        metadata: {
          observeRequestId: request.observeRequestId,
          source: 'ObserveModeRouter',
        },
      });

      if (!decision.allowed) {
        return this.createResult({
          request,
          status: 'SKIPPED',
          productionOutput,
          comparison: {
            status: 'SKIPPED',
            comparable: false,
            productionOutputCaptured: request.productionCall.outputSnapshot !== undefined,
            orchestratorOutputCaptured: false,
            drifts: [],
            notes: [`Rollout policy blocked observe routing: ${decision.reasons.join(' ')}`],
          },
          notes: ['Observe-mode routing skipped by rollout control plane.'],
        });
      }
    }

    const startedAt = this.now();
    let orchestratorCall: ObservedOrchestratorCall | undefined;
    const canaryShadowRecord = await this.executeCanaryShadow(request, productionOutput);
    const bindingResult = config.dryRunBindingsEnabled
      ? await this.bindingCoordinator.execute(request, config)
      : undefined;

    try {
      const orchestratorRequest = createOrchestratorRequest({
        requestId: `observe-orchestrator-${request.productionCall.callId}`,
        studentId: request.productionCall.studentId,
        requestType: request.productionCall.requestType,
        requestedCapabilities: [request.productionCall.capability],
        timestamp: request.productionCall.timestamp,
        context: {
          flowId: request.observeRequestId,
          traceId: request.traceId,
          source: 'orchestrator',
          stageBindings: createObserveStageBindings(request),
          metadata: {
            observeMode: true,
            productionCallId: request.productionCall.callId,
            sourceModule: request.productionCall.sourceModule,
          },
        },
        metadata: {
          observeMode: true,
          productionCall: request.productionCall.metadata,
        },
      });
      const response = await this.orchestrator.execute(orchestratorRequest);
      const completedAt = this.now();
      orchestratorCall = {
        requestId: orchestratorRequest.requestId,
        status: resolveObservedStatus(response.status === 'completed' ? 'OBSERVED' : 'FAILED', bindingResult),
        response,
        outputSnapshot: bindingResult?.outputSnapshot ?? extractComparableOutput(response.stageResults),
        bindingResult,
        startedAt,
        completedAt,
        latencyMs: differenceInMilliseconds(startedAt, completedAt),
        errorMessage: response.errorMessage,
      };
    } catch (error) {
      const completedAt = this.now();
      orchestratorCall = {
        requestId: `observe-orchestrator-${request.productionCall.callId}`,
        status: 'FAILED',
        errorMessage: describeError(error),
        bindingResult,
        startedAt,
        completedAt,
        latencyMs: differenceInMilliseconds(startedAt, completedAt),
      };
    }

    const comparison = this.driftDetector.compare({
      productionCall: request.productionCall,
      orchestratorCall,
      compareOutputs: config.compareOutputs,
    });

    return this.createResult({
      request,
      status: comparison.status === 'MATCHED' ? 'MATCHED' : comparison.status,
      productionOutput,
      orchestratorCall,
      canaryShadowRecord,
      comparison,
      notes: ['Observe-mode routing completed without affecting production output.'],
    });
  }

  getAuditService(): ObserveModeAuditService {
    return this.auditService;
  }

  getTelemetryService(): ObserveTelemetryService {
    return this.telemetryService;
  }

  private createResult(input: {
    request: ObserveModeRequest;
    status: ObserveModeStatus;
    productionOutput: unknown;
    orchestratorCall?: ObservedOrchestratorCall;
    canaryShadowRecord?: CanaryShadowExecutionRecord;
    comparison: ObserveModeComparison;
    notes: readonly string[];
  }): ObserveModeResult {
    const auditRecord: ObserveModeAuditRecord = {
      auditId: `observe-audit-${input.request.observeRequestId}`,
      observeRequestId: input.request.observeRequestId,
      traceId: input.request.traceId,
      productionCall: input.request.productionCall,
      orchestratorCall: input.orchestratorCall,
      canaryShadowRecord: input.canaryShadowRecord,
      comparison: input.comparison,
      status: input.status,
      createdAt: this.now(),
      configSnapshot: input.request.config,
      notes: input.notes,
    };

    this.auditService.record(auditRecord);
    this.telemetryService.recordAuditRecord(auditRecord);

    return {
      observeRequestId: input.request.observeRequestId,
      status: input.status,
      productionCall: input.request.productionCall,
      orchestratorCall: input.orchestratorCall,
      canaryShadowRecord: input.canaryShadowRecord,
      comparison: input.comparison,
      auditRecord,
      productionOutput: input.productionOutput,
      notes: input.notes,
    };
  }

  private async executeCanaryShadow(
    request: ObserveModeRequest,
    productionOutput: unknown
  ): Promise<CanaryShadowExecutionRecord | undefined> {
    if (!this.canaryShadowExecutionService) {
      return undefined;
    }

    try {
      return await this.canaryShadowExecutionService.execute({
        request,
        productionOutput,
      });
    } catch {
      return undefined;
    }
  }
}

function createObserveStageBindings(
  request: ObserveModeRequest
): Partial<Record<AuthorityLifecycleState, { bindingMode: 'DRY_RUN_MODE'; operationName: string; modulePath: string; eventPayload: Record<string, unknown> }>> {
  const stages = getLifecycleStagesForRequestType(request.productionCall.requestType);
  return Object.fromEntries(
    stages.map((stage) => [
      stage.lifecycleState,
      {
        bindingMode: 'DRY_RUN_MODE',
        operationName: `observe.${request.productionCall.operationName}`,
        modulePath: request.productionCall.sourceModule,
        eventPayload: {
          observeMode: true,
          productionCallId: request.productionCall.callId,
          flowName: request.productionCall.flowName,
        },
      },
    ])
  );
}

function extractComparableOutput(stageResults: Readonly<Record<string, unknown>>): unknown {
  const values = Object.values(stageResults).filter((value) => value !== undefined);
  if (values.length === 0) {
    return undefined;
  }
  if (values.length === 1) {
    return values[0];
  }
  return values;
}

function resolveObservedStatus(
  fallback: ObserveModeStatus,
  bindingResult: AuthorityExecutionBindingResult | undefined
): ObserveModeStatus {
  if (!bindingResult) {
    return fallback;
  }
  switch (bindingResult.comparisonStatus) {
    case 'SELF_MIRRORED':
    case 'BINDING_FAILED':
    case 'BINDING_DISABLED':
    case 'BINDING_NOT_FOUND':
    case 'INDEPENDENT_COMPARISON':
      return bindingResult.comparisonStatus;
    default:
      return fallback;
  }
}

function differenceInMilliseconds(startedAt: string, completedAt: string): number {
  return new Date(completedAt).getTime() - new Date(startedAt).getTime();
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
