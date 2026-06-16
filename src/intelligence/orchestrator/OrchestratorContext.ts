/**
 * @fileoverview Request-scoped orchestration context.
 *
 * The context carries execution bindings and metadata for the orchestrator
 * skeleton. It does not contain business intelligence logic.
 */

import type { AuthorityExecutionOptions, AuthorityOperation } from '../authorities/AuthorityFacadeBase';
import type { AuthorityLifecycleState } from './RequestLifecycle';

export type ExecutionBindingMode =
  | 'REAL_EXECUTION'
  | 'SKELETON_MODE'
  | 'TEST_MODE'
  | 'DRY_RUN_MODE';

export type ResolvedExecutionBindingMode = ExecutionBindingMode | 'UNBOUND';

export type ExecutionBindingState = 'BINDING_PRESENT' | 'BINDING_MISSING';

export type StageExecutionMode = 'REAL_EXECUTION' | 'EXPLICIT_NOOP' | 'UNBOUND';

export interface OrchestratorStageBinding
  extends Omit<AuthorityExecutionOptions, 'capability'> {
  operationName?: string;
  operation?: AuthorityOperation<unknown>;
  bindingMode?: ExecutionBindingMode;
}

export interface OrchestratorLifecycleControl {
  cancelBeforeExecution?: boolean;
  cancelAfterStage?: AuthorityLifecycleState;
  cancellationReason?: string;
}

export interface OrchestratorContext {
  flowId?: string;
  sessionId?: string;
  traceId?: string;
  correlationId?: string;
  source?: 'api' | 'ui' | 'worker' | 'scheduler' | 'test' | 'orchestrator';
  notes?: readonly string[];
  stageBindings?: Partial<Record<AuthorityLifecycleState, OrchestratorStageBinding>>;
  lifecycleControl?: OrchestratorLifecycleControl;
  metadata?: Readonly<Record<string, unknown>>;
}

export function getStageBinding(
  context: OrchestratorContext,
  lifecycleState: AuthorityLifecycleState
): OrchestratorStageBinding | undefined {
  return context.stageBindings?.[lifecycleState];
}

export interface ResolveExecutionBindingInput {
  operationName: string;
}

export interface ResolvedExecutionBinding {
  bindingState: ExecutionBindingState;
  bindingMode: ResolvedExecutionBindingMode;
  executionMode: StageExecutionMode;
  operationName: string;
  operation?: AuthorityOperation<unknown>;
  modulePath?: string;
  modulePaths?: readonly string[];
  dependencies?: OrchestratorStageBinding['dependencies'];
  authorityUsages?: OrchestratorStageBinding['authorityUsages'];
  publicSurfaces?: OrchestratorStageBinding['publicSurfaces'];
  auditNotes: readonly string[];
  eventPayload: Readonly<Record<string, unknown>>;
  executable: boolean;
  usesNoop: boolean;
  reasons: readonly string[];
}

const NOOP_BINDING_MODES: readonly ExecutionBindingMode[] = [
  'SKELETON_MODE',
  'TEST_MODE',
  'DRY_RUN_MODE',
] as const;

export function resolveExecutionBinding(
  context: OrchestratorContext,
  lifecycleState: AuthorityLifecycleState,
  defaults: ResolveExecutionBindingInput
): ResolvedExecutionBinding {
  const binding = getStageBinding(context, lifecycleState);
  if (!binding) {
    return {
      bindingState: 'BINDING_MISSING',
      bindingMode: 'UNBOUND',
      executionMode: 'UNBOUND',
      operationName: defaults.operationName,
      executable: false,
      usesNoop: false,
      auditNotes: [],
      eventPayload: {},
      reasons: [
        `${lifecycleState} requires an explicit execution binding before the orchestrator can run.`,
      ],
    };
  }

  const operationName = binding.operationName ?? defaults.operationName;
  const bindingMode = binding.bindingMode ?? (binding.operation ? 'REAL_EXECUTION' : 'UNBOUND');

  if (bindingMode === 'REAL_EXECUTION') {
    if (!binding.operation) {
      return {
        bindingState: 'BINDING_PRESENT',
        bindingMode: 'UNBOUND',
        executionMode: 'UNBOUND',
        operationName,
        modulePath: binding.modulePath,
        modulePaths: binding.modulePaths,
        dependencies: binding.dependencies,
        authorityUsages: binding.authorityUsages,
        publicSurfaces: binding.publicSurfaces,
        auditNotes: binding.auditNotes ?? [],
        eventPayload: binding.eventPayload ?? {},
        executable: false,
        usesNoop: false,
        reasons: [
          `${lifecycleState} declared REAL_EXECUTION but did not provide an operation binding.`,
        ],
      };
    }

    return {
      bindingState: 'BINDING_PRESENT',
      bindingMode,
      executionMode: 'REAL_EXECUTION',
      operationName,
      operation: binding.operation,
      modulePath: binding.modulePath,
      modulePaths: binding.modulePaths,
      dependencies: binding.dependencies,
      authorityUsages: binding.authorityUsages,
      publicSurfaces: binding.publicSurfaces,
      auditNotes: binding.auditNotes ?? [],
      eventPayload: binding.eventPayload ?? {},
      executable: true,
      usesNoop: false,
      reasons: [],
    };
  }

  if (bindingMode !== 'UNBOUND' && NOOP_BINDING_MODES.includes(bindingMode)) {
    return {
      bindingState: 'BINDING_PRESENT',
      bindingMode,
      executionMode: 'EXPLICIT_NOOP',
      operationName,
      modulePath: binding.modulePath,
      modulePaths: binding.modulePaths,
      dependencies: binding.dependencies,
      authorityUsages: binding.authorityUsages,
      publicSurfaces: binding.publicSurfaces,
      auditNotes: binding.auditNotes ?? [],
      eventPayload: binding.eventPayload ?? {},
      executable: true,
      usesNoop: true,
      reasons: [`${lifecycleState} is allowed to use an explicit no-op in ${bindingMode}.`],
    };
  }

  return {
    bindingState: 'BINDING_PRESENT',
    bindingMode: 'UNBOUND',
    executionMode: 'UNBOUND',
    operationName,
    modulePath: binding.modulePath,
    modulePaths: binding.modulePaths,
    dependencies: binding.dependencies,
    authorityUsages: binding.authorityUsages,
    publicSurfaces: binding.publicSurfaces,
    auditNotes: binding.auditNotes ?? [],
    eventPayload: binding.eventPayload ?? {},
    executable: false,
    usesNoop: false,
    reasons: [
      `${lifecycleState} binding must declare REAL_EXECUTION, SKELETON_MODE, TEST_MODE, or DRY_RUN_MODE.`,
    ],
  };
}

export function shouldCancelBeforeExecution(context: OrchestratorContext): boolean {
  return context.lifecycleControl?.cancelBeforeExecution === true;
}

export function shouldCancelAfterStage(
  context: OrchestratorContext,
  lifecycleState: AuthorityLifecycleState
): boolean {
  return context.lifecycleControl?.cancelAfterStage === lifecycleState;
}

export function getCancellationReason(context: OrchestratorContext): string {
  return context.lifecycleControl?.cancellationReason ?? 'Execution cancelled by lifecycle control.';
}
