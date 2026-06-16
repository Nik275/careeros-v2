import { describe, expect, it } from 'vitest';
import { ConstitutionalOwnershipRegistry } from '../../constitutional';
import { AuthorityRegistrationService } from '../../authorities/AuthorityRegistrationService';
import { AuthorityRouter } from '../AuthorityRouter';
import { ConstitutionalRoutingPolicy } from '../ConstitutionalRoutingPolicy';
import { createOrchestratorRequest } from '../OrchestratorRequest';
import { createExecutionPlan } from '../OrchestratorExecutionPlan';

describe('orchestrator execution plan', () => {
  it('builds a full lifecycle execution plan with explicit stages and dependencies', () => {
    const now = createClock();
    const registry = ConstitutionalOwnershipRegistry.createDefault();
    const router = new AuthorityRouter({
      registry,
      registrationService: new AuthorityRegistrationService({
        registry,
        now,
      }),
      now,
    });
    const policy = new ConstitutionalRoutingPolicy({
      registry,
      now,
    });
    const request = createOrchestratorRequest({
      requestId: 'plan-1',
      studentId: 'student-1',
      requestType: 'FULL_LIFECYCLE',
    });
    const decision = policy.evaluateRequest(request, router.getIntegrationStatus());
    const source = policy.getRegistrySourceMetadata();
    const plan = createExecutionPlan({
      request,
      requiredAuthorities: decision.requiredAuthorities,
      requiredCapabilities: decision.requiredCapabilities,
      lifecycleStages: decision.lifecycleStages,
      policyVersion: decision.policyVersion,
      registrySourceDocument: source.sourceDocument,
      registrySourceWave: source.sourceWave,
      now,
    });

    expect(plan.planId).toBe('orchestrator-plan-plan-1');
    expect(plan.requiredAuthorities).toEqual([
      'StudentUnderstandingAuthority',
      'OptionGeneratorAuthority',
      'OutcomeTrackerAuthority',
    ]);
    expect(plan.requiredCapabilities).toEqual(['UNDERSTAND', 'GENERATE', 'LEARN']);
    expect(plan.executionStages.map((stage) => stage.lifecycleState)).toEqual([
      'VALIDATING',
      'UNDERSTANDING',
      'GENERATING',
      'TRACKING',
      'LEARNING',
    ]);
    expect(plan.dependencies).toHaveLength(4);
    expect(plan.estimatedExecutionPath.summary).toBe(
      'RECEIVED -> VALIDATING -> UNDERSTANDING -> GENERATING -> TRACKING -> LEARNING -> COMPLETED'
    );
    expect(plan.auditMetadata.registrySourceDocument).toContain(
      'docs/constitutional/Wave3_3_IntelligenceOwnershipMap.md'
    );
  });
});

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
