import { describe, expect, it } from 'vitest';
import {
  CONSTITUTIONAL_OWNERSHIP_RECORDS,
  ConstitutionalOwnershipRegistry,
} from '../../constitutional';
import type { AuthorityRegistryStatus } from '../../authorities/AuthorityRegistrationService';
import type { AuthorityRouter } from '../AuthorityRouter';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';
import { createOrchestratorRequest } from '../OrchestratorRequest';

describe('IntelligenceOrchestrator negative paths', () => {
  it('returns a rejected response when requested capabilities violate request routing', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'negative-rejected',
      studentId: 'student-1',
      requestType: 'GENERATE',
      requestedCapabilities: ['UNDERSTAND'],
      context: {
        source: 'test',
        stageBindings: {
          GENERATING: {
            bindingMode: 'TEST_MODE',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('rejected');
    expect(response.currentState).toBe('FAILED');
    expect(response.auditTrail.routingDecision.allowed).toBe(false);
    expect(response.auditTrail.constitutionalComplianceReport.policyViolations).toContain(
      'Routing policy denied the request because constitutional prerequisites were not met.'
    );
  });

  it('rejects execution when required authority registration is missing', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
      authorityRouter: createRouterWithStatus({
        missingRequiredAuthorities: ['OutcomeTrackerAuthority'],
      }),
    });
    const request = createOrchestratorRequest({
      requestId: 'negative-missing-authority',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            operation: () => ({ studentModelId: 'student-model-1' }),
            bindingMode: 'REAL_EXECUTION',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('rejected');
    expect(response.auditTrail.routingDecision.allowed).toBe(false);
    expect(response.auditTrail.constitutionalComplianceReport.violationCount).toBe(1);
    expect(response.auditTrail.constitutionalComplianceReport.violations[0]?.type).toBe(
      'AUTHORITY_VIOLATION'
    );
  });

  it('rejects execution when the ownership registry is unhealthy', async () => {
    const firstRecord = CONSTITUTIONAL_OWNERSHIP_RECORDS[0];
    if (!firstRecord) {
      throw new Error('Expected generated ownership records for unhealthy registry test.');
    }

    const registry = new ConstitutionalOwnershipRegistry([
      ...CONSTITUTIONAL_OWNERSHIP_RECORDS,
      firstRecord,
    ]);
    const orchestrator = new IntelligenceOrchestrator({
      registry,
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'negative-unhealthy-registry',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            operation: () => ({ studentModelId: 'student-model-1' }),
            bindingMode: 'REAL_EXECUTION',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('rejected');
    expect(response.auditTrail.routingDecision.allowed).toBe(false);
    expect(response.auditTrail.constitutionalComplianceReport.violations[0]?.type).toBe(
      'REGISTRY_VIOLATION'
    );
  });

  it('captures failed stage execution in final state and audit history', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'negative-stage-failure',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            operation: () => {
              throw new Error('wrapped stage failed');
            },
            bindingMode: 'REAL_EXECUTION',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('failed');
    expect(response.currentState).toBe('FAILED');
    expect(response.errorMessage).toBe('wrapped stage failed');
    expect(response.auditTrail.finalState).toBe('FAILED');
    expect(response.auditTrail.authorityInvolvementHistory[0]?.status).toBe('failed');
    expect(response.lifecycle.failures[0]?.message).toBe('wrapped stage failed');
  });

  it('supports explicit cancellation before authority execution', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'negative-cancelled',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        lifecycleControl: {
          cancelBeforeExecution: true,
          cancellationReason: 'unit-test cancellation',
        },
        stageBindings: {
          UNDERSTANDING: {
            operation: () => ({ studentModelId: 'student-model-1' }),
            bindingMode: 'REAL_EXECUTION',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('cancelled');
    expect(response.currentState).toBe('CANCELLED');
    expect(response.auditTrail.finalState).toBe('CANCELLED');
    expect(response.auditTrail.authorityInvolvementHistory).toHaveLength(0);
  });
});

function createRouterWithStatus(
  override: Partial<AuthorityRegistryStatus>
): AuthorityRouter {
  const status: AuthorityRegistryStatus = {
    activeAuthorityCount: 2,
    requiredAuthorityCount: 3,
    registeredAuthorities: ['StudentUnderstandingAuthority', 'OptionGeneratorAuthority'],
    missingRequiredAuthorities: [],
    coverage: [],
    registryHealthy: true,
    registryRecordCount: 444,
    sourceDocument: 'unit-test',
    sourceWave: 'Phase 4.3.8',
    ...override,
  };

  return {
    getIntegrationStatus: () => status,
  } as unknown as AuthorityRouter;
}

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
