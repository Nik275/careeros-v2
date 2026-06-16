/**
 * @fileoverview Execution plan contract and builder for the orchestrator.
 */

import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../authorities/AuthorityFacadeBase';
import type {
  ExecutionBindingMode,
  ExecutionBindingState,
  StageExecutionMode,
} from './OrchestratorContext';
import type { OrchestratorRequest } from './OrchestratorRequest';
import { resolveExecutionBinding } from './OrchestratorContext';
import type {
  LifecycleStageDescriptor,
  RequestLifecycleState,
} from './RequestLifecycle';

export interface ExecutionStageDependency {
  fromStageId: string;
  toStageId: string;
  reason: string;
}

export interface OrchestratorExecutionStage {
  stageId: string;
  lifecycleState: RequestLifecycleState;
  authority?: DomainAuthorityType;
  capability?: DomainAuthorityCapability;
  operationName: string;
  executionMode: 'synchronous' | 'asynchronous' | 'observe';
  dependsOn: readonly string[];
  description: string;
  executionBinding?: ExecutionBindingSummary;
}

export interface EstimatedExecutionPath {
  orderedStates: readonly RequestLifecycleState[];
  authorityHops: number;
  supportsAsyncLearning: boolean;
  statelessSafe: boolean;
  summary: string;
}

export interface ExecutionPlanAuditMetadata {
  createdAt: string;
  policyVersion: string;
  registrySourceDocument: string;
  registrySourceWave: string;
  requestType: string;
  notes: readonly string[];
}

export interface ExecutionBindingSummary {
  bindingState: ExecutionBindingState;
  bindingMode: ExecutionBindingMode | 'UNBOUND';
  executionMode: StageExecutionMode;
  executable: boolean;
  usesNoop: boolean;
  operationName: string;
  boundModulePath?: string;
  reasons: readonly string[];
}

export interface PlanExecutabilitySummary {
  status: 'EXECUTABLE' | 'NON_EXECUTABLE';
  blockingStages: readonly string[];
  reasons: readonly string[];
}

export interface OrchestratorExecutionPlan {
  planId: string;
  requestId: string;
  requiredAuthorities: readonly DomainAuthorityType[];
  requiredCapabilities: readonly DomainAuthorityCapability[];
  executionStages: readonly OrchestratorExecutionStage[];
  dependencies: readonly ExecutionStageDependency[];
  estimatedExecutionPath: EstimatedExecutionPath;
  auditMetadata: ExecutionPlanAuditMetadata;
  executability: PlanExecutabilitySummary;
}

export interface CreateExecutionPlanInput {
  request: OrchestratorRequest;
  requiredAuthorities: readonly DomainAuthorityType[];
  requiredCapabilities: readonly DomainAuthorityCapability[];
  lifecycleStages: readonly LifecycleStageDescriptor[];
  policyVersion: string;
  registrySourceDocument: string;
  registrySourceWave: string;
  notes?: readonly string[];
  now?: () => string;
}

export function createExecutionPlan(input: CreateExecutionPlanInput): OrchestratorExecutionPlan {
  const now = input.now ?? (() => new Date().toISOString());
  const createdAt = now();
  const stages: OrchestratorExecutionStage[] = [
    {
      stageId: `${input.request.requestId}-validate`,
      lifecycleState: 'VALIDATING',
      operationName: 'validateRequest',
      executionMode: 'observe',
      dependsOn: [],
      description: 'Validate routing policy, capabilities, and authority availability.',
    },
  ];

  for (const descriptor of input.lifecycleStages) {
    const dependsOnStage = stages.at(-1);
    const resolvedBinding = resolveExecutionBinding(
      input.request.context,
      descriptor.lifecycleState,
      {
        operationName: descriptor.defaultOperationName,
      }
    );
    stages.push({
      stageId: `${input.request.requestId}-${descriptor.lifecycleState.toLowerCase()}`,
      lifecycleState: descriptor.lifecycleState,
      authority: descriptor.authority,
      capability: descriptor.capability,
      operationName: descriptor.defaultOperationName,
      executionMode: descriptor.lifecycleState === 'LEARNING' ? 'asynchronous' : 'synchronous',
      dependsOn: dependsOnStage ? [dependsOnStage.stageId] : [],
      description: descriptor.description,
      executionBinding: {
        bindingState: resolvedBinding.bindingState,
        bindingMode: resolvedBinding.bindingMode,
        executionMode: resolvedBinding.executionMode,
        executable: resolvedBinding.executable,
        usesNoop: resolvedBinding.usesNoop,
        operationName: resolvedBinding.operationName,
        boundModulePath: resolvedBinding.modulePath,
        reasons: resolvedBinding.reasons,
      },
    });
  }

  const dependencies = stages
    .slice(1)
    .map((stage) => ({
      fromStageId: stage.dependsOn[0] ?? `${input.request.requestId}-validate`,
      toStageId: stage.stageId,
      reason: `Lifecycle dependency for ${stage.lifecycleState}.`,
    }))
    .filter((dependency, index, items) =>
      items.findIndex(
        (candidate) =>
          candidate.fromStageId === dependency.fromStageId &&
          candidate.toStageId === dependency.toStageId
      ) === index
    );

  const orderedStates: RequestLifecycleState[] = [
    'RECEIVED',
    ...stages.map((stage) => stage.lifecycleState),
    'COMPLETED',
  ];
  const nonExecutableStages = stages.filter(
    (stage) =>
      stage.lifecycleState !== 'VALIDATING' &&
      stage.executionBinding !== undefined &&
      !stage.executionBinding.executable
  );
  const executability: PlanExecutabilitySummary =
    nonExecutableStages.length === 0
      ? {
          status: 'EXECUTABLE',
          blockingStages: [],
          reasons: [],
        }
      : {
          status: 'NON_EXECUTABLE',
          blockingStages: nonExecutableStages.map((stage) => stage.stageId),
          reasons: nonExecutableStages.flatMap(
            (stage) =>
              stage.executionBinding?.reasons.map(
                (reason) => `${stage.stageId}: ${reason}`
              ) ?? []
          ),
        };

  return {
    planId: `orchestrator-plan-${input.request.requestId}`,
    requestId: input.request.requestId,
    requiredAuthorities: input.requiredAuthorities,
    requiredCapabilities: input.requiredCapabilities,
    executionStages: stages,
    dependencies,
    estimatedExecutionPath: {
      orderedStates,
      authorityHops: input.requiredAuthorities.length,
      supportsAsyncLearning: orderedStates.includes('LEARNING'),
      statelessSafe: true,
      summary: orderedStates.join(' -> '),
    },
    auditMetadata: {
      createdAt,
      policyVersion: input.policyVersion,
      registrySourceDocument: input.registrySourceDocument,
      registrySourceWave: input.registrySourceWave,
      requestType: input.request.requestType,
      notes: [
        ...(input.notes ?? []),
        `Plan executability: ${executability.status}.`,
      ],
    },
    executability,
  };
}
