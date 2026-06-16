/**
 * @fileoverview Safe dry-run binding coordinator for observe-mode requests.
 */

import type { ObserveModeConfig } from '../observe/ObserveModeConfig';
import type { ObserveModeRequest } from '../observe/ObserveModeTypes';
import type { ObserveTelemetryService } from '../observe/ObserveTelemetryService';
import type { RolloutManager } from '../rollout/RolloutManager';
import { AuthorityExecutionBindingRegistry } from './AuthorityExecutionBindingRegistry';
import {
  createBindingFailure,
  type AuthorityExecutionBindingResult,
} from './AuthorityExecutionBindingTypes';

export interface DryRunAuthorityExecutionCoordinatorOptions {
  registry?: AuthorityExecutionBindingRegistry;
  telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure'>;
  rolloutManager?: RolloutManager;
  now?: () => string;
}

export class DryRunAuthorityExecutionCoordinator {
  private readonly registry: AuthorityExecutionBindingRegistry;
  private readonly telemetryService?: Pick<ObserveTelemetryService, 'recordHookFailure'>;
  private readonly rolloutManager?: RolloutManager;
  private readonly now: () => string;

  constructor(options: DryRunAuthorityExecutionCoordinatorOptions = {}) {
    this.registry = options.registry ?? new AuthorityExecutionBindingRegistry();
    this.telemetryService = options.telemetryService;
    this.rolloutManager = options.rolloutManager;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute(
    request: ObserveModeRequest,
    config: ObserveModeConfig
  ): Promise<AuthorityExecutionBindingResult> {
    const startedAt = this.now();

    if (!config.enabled || !config.dryRunBindingsEnabled) {
      return this.createCoordinatorResult(request, startedAt, {
        comparisonStatus: 'BINDING_DISABLED',
        executionMode: 'DISABLED',
        comparable: false,
        independent: false,
        notes: ['Dry-run bindings are disabled or observe mode is disabled.'],
      });
    }

    if (this.rolloutManager) {
      const decision = this.rolloutManager.evaluate({
        flow: request.productionCall.flowName,
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: config.enabled,
          bindingAvailable: config.dryRunBindingsEnabled,
          telemetryHealthy: true,
          privacySafe: !config.captureRawPayloads,
        },
        metadata: {
          observeRequestId: request.observeRequestId,
          source: 'DryRunAuthorityExecutionCoordinator',
        },
      });

      if (!decision.allowed) {
        return this.createCoordinatorResult(request, startedAt, {
          comparisonStatus: 'BINDING_DISABLED',
          executionMode: 'DISABLED',
          comparable: false,
          independent: false,
          notes: ['Dry-run binding execution blocked by rollout control plane.'],
        });
      }
    }

    const binding = this.registry.resolveByFlowType(request.productionCall.flowName);
    if (!binding) {
      return this.createCoordinatorResult(request, startedAt, {
        comparisonStatus: 'BINDING_NOT_FOUND',
        executionMode: 'DISABLED',
        comparable: false,
        independent: false,
        notes: ['No dry-run authority binding is registered for this observe flow.'],
      });
    }

    if (!binding.enabled || !isBindingEnabled(config.enabledBindings, binding.bindingId)) {
      return this.createCoordinatorResult(request, startedAt, {
        bindingId: binding.bindingId,
        flowType: binding.flowType,
        authority: binding.authority,
        capability: binding.capability,
        comparisonStatus: 'BINDING_DISABLED',
        executionMode: 'DISABLED',
        comparable: false,
        independent: false,
        notes: ['Resolved dry-run binding is not enabled for this observe-mode config.'],
      });
    }

    try {
      return await withTimeout(
        binding.execute({
          observeRequest: request,
          config,
          startedAt,
          productionOutput: request.productionCall.outputSnapshot,
          productionInput: request.productionCall.inputSnapshot,
          metadata: request.metadata,
        }),
        config.maxBindingExecutionMs
      );
    } catch (error) {
      this.telemetryService?.recordHookFailure({
        hookName: binding.hookName,
        error,
        traceId: request.traceId,
        requestId: request.observeRequestId,
        flowType: request.productionCall.flowName,
        authority: binding.authority,
        capability: binding.capability,
      });
      const completedAt = this.now();
      return {
        bindingId: binding.bindingId,
        flowType: binding.flowType,
        authority: binding.authority,
        capability: binding.capability,
        executionMode: binding.executionMode,
        comparisonStatus: 'BINDING_FAILED',
        comparable: false,
        independent: false,
        failure: createBindingFailure({
          bindingId: binding.bindingId,
          message: describeError(error),
          occurredAt: completedAt,
        }),
        startedAt,
        completedAt,
        latencyMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
        notes: ['Dry-run authority binding failed; production output remains authoritative.'],
        metadata: {},
      };
    }
  }

  getRegistry(): AuthorityExecutionBindingRegistry {
    return this.registry;
  }

  private createCoordinatorResult(
    request: ObserveModeRequest,
    startedAt: string,
    input: {
      bindingId?: string;
      flowType?: string;
      authority?: AuthorityExecutionBindingResult['authority'];
      capability?: AuthorityExecutionBindingResult['capability'];
      comparisonStatus: AuthorityExecutionBindingResult['comparisonStatus'];
      executionMode: AuthorityExecutionBindingResult['executionMode'];
      comparable: boolean;
      independent: boolean;
      notes: readonly string[];
    }
  ): AuthorityExecutionBindingResult {
    const completedAt = this.now();
    return {
      bindingId: input.bindingId ?? 'unbound',
      flowType: input.flowType ?? request.productionCall.flowName,
      authority: input.authority ?? 'StudentUnderstandingAuthority',
      capability: input.capability ?? request.productionCall.capability,
      executionMode: input.executionMode,
      comparisonStatus: input.comparisonStatus,
      comparable: input.comparable,
      independent: input.independent,
      startedAt,
      completedAt,
      latencyMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      notes: input.notes,
      metadata: {},
    };
  }
}

function isBindingEnabled(enabledBindings: readonly string[], bindingId: string): boolean {
  return enabledBindings.includes('*') || enabledBindings.includes(bindingId);
}

async function withTimeout<TResult>(promise: Promise<TResult>, timeoutMs: number): Promise<TResult> {
  if (timeoutMs <= 0) {
    return promise;
  }

  return Promise.race([
    promise,
    new Promise<TResult>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`Dry-run binding exceeded ${timeoutMs}ms.`)), timeoutMs);
    }),
  ]);
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
