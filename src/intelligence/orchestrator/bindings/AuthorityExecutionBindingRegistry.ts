/**
 * @fileoverview Registry for observe-mode dry-run authority bindings.
 */

import type {
  AuthorityExecutionBinding,
  AuthorityExecutionBindingHealth,
} from './AuthorityExecutionBindingTypes';
import type {
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../../authorities/AuthorityFacadeBase';

export class AuthorityExecutionBindingRegistry {
  private readonly bindingsById = new Map<string, AuthorityExecutionBinding>();

  register(binding: AuthorityExecutionBinding): void {
    if (this.bindingsById.has(binding.bindingId)) {
      throw new Error(`Authority execution binding ${binding.bindingId} is already registered.`);
    }
    this.bindingsById.set(binding.bindingId, binding);
  }

  resolveByFlowType(flowType: string): AuthorityExecutionBinding | undefined {
    return Array.from(this.bindingsById.values()).find((binding) => binding.flowType === flowType);
  }

  resolveByAuthorityAndCapability(
    authority: DomainAuthorityType,
    capability: DomainAuthorityCapability
  ): AuthorityExecutionBinding | undefined {
    return Array.from(this.bindingsById.values()).find(
      (binding) => binding.authority === authority && binding.capability === capability
    );
  }

  listBindings(): readonly AuthorityExecutionBinding[] {
    return Array.from(this.bindingsById.values());
  }

  getBindingHealth(): AuthorityExecutionBindingHealth {
    const bindings = this.listBindings();
    return {
      totalBindings: bindings.length,
      enabledBindings: bindings.filter((binding) => binding.enabled).length,
      disabledBindings: bindings.filter((binding) => !binding.enabled).length,
      bindings: bindings.map((binding) => ({
        bindingId: binding.bindingId,
        flowType: binding.flowType,
        hookName: binding.hookName,
        authority: binding.authority,
        capability: binding.capability,
        executionMode: binding.executionMode,
        safetyLevel: binding.safetyLevel,
        enabled: binding.enabled,
      })),
    };
  }
}
