/**
 * @fileoverview Coordinates plan execution through authority facades.
 */

import type { ConstitutionalEventEnvelope } from '../constitutional';
import type {
  AuthorityRouteExecutionInput,
  AuthorityRouter,
  RoutedAuthorityExecutionResult,
} from './AuthorityRouter';
import type { ExecutionTracker } from './ExecutionTracker';
import type { OrchestratorContext } from './OrchestratorContext';
import {
  getCancellationReason,
  resolveExecutionBinding,
  shouldCancelAfterStage,
  shouldCancelBeforeExecution,
} from './OrchestratorContext';
import type { OrchestratorExecutionPlan, OrchestratorExecutionStage } from './OrchestratorExecutionPlan';
import type { OrchestratorRequest } from './OrchestratorRequest';
import type { OrchestratorStateMachine } from './OrchestratorStateMachine';
import type { AuthorityLifecycleState } from './RequestLifecycle';

export interface AuthorityExecutionCoordinatorOptions {
  now?: () => string;
}

export interface CoordinatedExecutionResult {
  stageResults: Readonly<Record<string, unknown>>;
  authorityExecutions: readonly RoutedAuthorityExecutionResult[];
  emittedEvents: readonly ConstitutionalEventEnvelope<Record<string, unknown>>[];
  cancelled: boolean;
}

export class AuthorityExecutionCoordinator {
  private readonly now: () => string;

  constructor(options: AuthorityExecutionCoordinatorOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async executePlan(
    request: OrchestratorRequest,
    plan: OrchestratorExecutionPlan,
    router: AuthorityRouter,
    stateMachine: OrchestratorStateMachine,
    tracker: ExecutionTracker
  ): Promise<CoordinatedExecutionResult> {
    const stageResults: Record<string, unknown> = {};
    const authorityExecutions: RoutedAuthorityExecutionResult[] = [];
    const emittedEvents: ConstitutionalEventEnvelope<Record<string, unknown>>[] = [];

    if (shouldCancelBeforeExecution(request.context)) {
      const transition = stateMachine.cancel(getCancellationReason(request.context), {
        requestId: request.requestId,
        planId: plan.planId,
      });
      tracker.recordStateTransition(transition);
      return {
        stageResults,
        authorityExecutions,
        emittedEvents,
        cancelled: true,
      };
    }

    for (const stage of plan.executionStages) {
      if (stage.lifecycleState === 'VALIDATING') {
        continue;
      }

      const authorityState = stage.lifecycleState as AuthorityLifecycleState;
      const transition = stateMachine.transitionTo(
        authorityState,
        `Entered ${authorityState} through execution plan ${plan.planId}.`,
        {
          planId: plan.planId,
          requestId: request.requestId,
        }
      );
      tracker.recordStateTransition(transition);

      const route = router.resolveStage(stage);
      const binding = resolveExecutionBinding(request.context, authorityState, {
        operationName: stage.operationName,
      });
      const executionId = tracker.startAuthorityExecution({
        authority: route.authority,
        capability: route.capability,
        lifecycleState: authorityState,
        operationName: binding.operationName,
        startedAt: this.now(),
        modulePath: binding.modulePath,
        registryModulePath: route.registryModulePath,
        registration: route.registration,
        bindingState: binding.bindingState,
        bindingMode: binding.bindingMode,
        executionMode: binding.executionMode,
        usesNoop: binding.usesNoop,
        bindingReasons: binding.reasons,
      });

      if (!binding.executable) {
        const errorMessage = binding.reasons.join(' ');
        tracker.failAuthorityExecution(executionId, {
          completedAt: this.now(),
          errorMessage,
        });
        throw new Error(errorMessage);
      }

      try {
        const execution = await route.invoke(createExecutionInput(stage, binding));
        tracker.completeAuthorityExecution(executionId, {
          completedAt: this.now(),
          auditRecord: execution.auditRecord,
          validationSnapshot: execution.validationSnapshot,
          resultSummary: summarizeResult(execution.result),
        });
        tracker.recordEvents(execution.emittedEvents);

        stageResults[stage.stageId] = execution.result;
        authorityExecutions.push(execution);
        emittedEvents.push(...execution.emittedEvents);

        if (shouldCancelAfterStage(request.context, authorityState)) {
          const cancelledTransition = stateMachine.cancel(getCancellationReason(request.context), {
            requestId: request.requestId,
            planId: plan.planId,
            cancelledAfterStage: authorityState,
          });
          tracker.recordStateTransition(cancelledTransition);
          return {
            stageResults,
            authorityExecutions,
            emittedEvents,
            cancelled: true,
          };
        }
      } catch (error) {
        tracker.failAuthorityExecution(executionId, {
          completedAt: this.now(),
          errorMessage: describeError(error),
        });
        throw error;
      }
    }

    return {
      stageResults,
      authorityExecutions,
      emittedEvents,
      cancelled: false,
    };
  }
}

function createExecutionInput(
  stage: OrchestratorExecutionStage,
  binding: ReturnType<typeof resolveExecutionBinding>
): AuthorityRouteExecutionInput {
  return {
    operationName: binding.operationName,
    operation:
      binding.executionMode === 'EXPLICIT_NOOP'
        ? () => undefined
        : binding.operation ?? (() => undefined),
    modulePath: binding.modulePath,
    modulePaths: binding.modulePaths,
    dependencies: binding.dependencies,
    authorityUsages: binding.authorityUsages,
    publicSurfaces: binding.publicSurfaces,
    auditNotes: [
      ...binding.auditNotes,
      `Orchestrator stage ${stage.lifecycleState} coordinated through ${stage.authority}.`,
      `Binding state: ${binding.bindingState}.`,
      `Binding mode: ${binding.bindingMode}.`,
      `Execution mode: ${binding.executionMode}.`,
    ],
    eventPayload: {
      stageId: stage.stageId,
      requestSource: 'orchestrator',
      bindingState: binding.bindingState,
      bindingMode: binding.bindingMode,
      executionMode: binding.executionMode,
      ...(binding.eventPayload ?? {}),
    },
  };
}

function summarizeResult(result: unknown): string {
  if (result === undefined) return 'undefined result';
  if (result === null) return 'null result';
  if (Array.isArray(result)) return `array(${result.length})`;
  if (typeof result === 'object') {
    return `object(${Object.keys(result as Record<string, unknown>).length} keys)`;
  }
  return String(result);
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
