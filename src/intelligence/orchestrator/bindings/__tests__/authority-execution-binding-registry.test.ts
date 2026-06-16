import { describe, expect, it } from 'vitest';
import { AuthorityExecutionBindingRegistry } from '../AuthorityExecutionBindingRegistry';
import type { AuthorityExecutionBinding } from '../AuthorityExecutionBindingTypes';

describe('AuthorityExecutionBindingRegistry', () => {
  it('starts with no enabled bindings by default', () => {
    const registry = new AuthorityExecutionBindingRegistry();

    expect(registry.getBindingHealth()).toMatchObject({
      totalBindings: 0,
      enabledBindings: 0,
      disabledBindings: 0,
    });
  });

  it('registers and resolves a binding by flow type', () => {
    const registry = new AuthorityExecutionBindingRegistry();
    const binding = createBinding();

    registry.register(binding);

    expect(registry.resolveByFlowType('assessment')).toBe(binding);
  });

  it('resolves a binding by authority and capability', () => {
    const registry = new AuthorityExecutionBindingRegistry();
    const binding = createBinding();

    registry.register(binding);

    expect(
      registry.resolveByAuthorityAndCapability('StudentUnderstandingAuthority', 'UNDERSTAND')
    ).toBe(binding);
  });

  it('prevents duplicate binding registration', () => {
    const registry = new AuthorityExecutionBindingRegistry();
    const binding = createBinding();

    registry.register(binding);

    expect(() => registry.register(binding)).toThrow('already registered');
  });

  it('exposes binding health and safety metadata', () => {
    const registry = new AuthorityExecutionBindingRegistry();
    registry.register(createBinding({ enabled: true }));
    registry.register(createBinding({ bindingId: 'disabled-binding', enabled: false }));

    expect(registry.getBindingHealth()).toMatchObject({
      totalBindings: 2,
      enabledBindings: 1,
      disabledBindings: 1,
    });
    expect(registry.getBindingHealth().bindings[0]).toMatchObject({
      flowType: 'assessment',
      safetyLevel: 'low',
    });
  });
});

function createBinding(
  overrides: Partial<AuthorityExecutionBinding> = {}
): AuthorityExecutionBinding {
  return {
    bindingId: overrides.bindingId ?? 'assessment.processResponses',
    flowType: overrides.flowType ?? 'assessment',
    hookName: overrides.hookName ?? 'AssessmentEngine.processResponses',
    authority: overrides.authority ?? 'StudentUnderstandingAuthority',
    capability: overrides.capability ?? 'UNDERSTAND',
    executionMode: overrides.executionMode ?? 'SUPPLIED_RESULT_ONLY',
    safetyLevel: overrides.safetyLevel ?? 'low',
    enabled: overrides.enabled ?? true,
    description: 'test binding',
    execute: async () => {
      throw new Error('not used');
    },
  };
}
