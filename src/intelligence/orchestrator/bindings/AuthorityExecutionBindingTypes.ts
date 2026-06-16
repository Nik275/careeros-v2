/**
 * @fileoverview Dry-run authority execution binding contracts.
 */

import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../../authorities/AuthorityFacadeBase';
import type { ObserveModeConfig } from '../observe/ObserveModeConfig';
import type { ObserveModeRequest } from '../observe/ObserveModeTypes';

export type DryRunExecutionMode =
  | 'DRY_RUN'
  | 'PRODUCTION_MIRROR'
  | 'SUPPLIED_RESULT_ONLY'
  | 'DISABLED';

export type BindingSafetyLevel = 'low' | 'medium' | 'high';

export type BindingComparisonStatus =
  | 'MATCHED'
  | 'DRIFT_DETECTED'
  | 'FAILED'
  | 'NOT_COMPARABLE'
  | 'SELF_MIRRORED'
  | 'BINDING_FAILED'
  | 'BINDING_DISABLED'
  | 'BINDING_NOT_FOUND'
  | 'INDEPENDENT_COMPARISON';

export interface DryRunExecutionContext {
  observeRequest: ObserveModeRequest;
  config: ObserveModeConfig;
  startedAt: string;
  productionOutput: unknown;
  productionInput: unknown;
  metadata: Readonly<Record<string, unknown>>;
}

export interface BindingFailureRecord {
  failureId: string;
  bindingId: string;
  status: 'BINDING_FAILED';
  message: string;
  occurredAt: string;
}

export interface AuthorityExecutionBindingResult {
  bindingId: string;
  flowType: string;
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  executionMode: DryRunExecutionMode;
  comparisonStatus: BindingComparisonStatus;
  comparable: boolean;
  independent: boolean;
  outputSnapshot?: unknown;
  failure?: BindingFailureRecord;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  notes: readonly string[];
  metadata: Readonly<Record<string, unknown>>;
}

export interface AuthorityExecutionBinding {
  bindingId: string;
  flowType: string;
  hookName: string;
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  executionMode: DryRunExecutionMode;
  safetyLevel: BindingSafetyLevel;
  enabled: boolean;
  description: string;
  execute(context: DryRunExecutionContext): Promise<AuthorityExecutionBindingResult>;
}

export interface AuthorityExecutionBindingHealth {
  totalBindings: number;
  enabledBindings: number;
  disabledBindings: number;
  bindings: readonly {
    bindingId: string;
    flowType: string;
    hookName: string;
    authority: DomainAuthorityType;
    capability: DomainAuthorityCapability;
    executionMode: DryRunExecutionMode;
    safetyLevel: BindingSafetyLevel;
    enabled: boolean;
  }[];
}

export function createBindingFailure(input: {
  bindingId: string;
  message: string;
  occurredAt: string;
}): BindingFailureRecord {
  return {
    failureId: `binding-failure-${hashString(`${input.bindingId}|${input.message}|${input.occurredAt}`)}`,
    bindingId: input.bindingId,
    status: 'BINDING_FAILED',
    message: input.message,
    occurredAt: input.occurredAt,
  };
}

export function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
