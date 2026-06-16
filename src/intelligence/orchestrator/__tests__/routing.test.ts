import { describe, expect, it } from 'vitest';
import { ConstitutionalOwnershipRegistry } from '../../constitutional';
import { AuthorityRegistrationService } from '../../authorities/AuthorityRegistrationService';
import { AuthorityRouter } from '../AuthorityRouter';
import { ConstitutionalRoutingPolicy } from '../ConstitutionalRoutingPolicy';
import { createOrchestratorRequest } from '../OrchestratorRequest';

describe('orchestrator routing', () => {
  it('routes capabilities to registered authority facades only', async () => {
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
    const route = router.resolveCapability('UNDERSTAND');
    const result = await route.invoke({
      operationName: 'understand',
      operation: () => ({ ok: true }),
    });

    expect(route.authority).toBe('StudentUnderstandingAuthority');
    expect(route.registration.registrationId).toBe(
      'authority-registration-StudentUnderstandingAuthority'
    );
    expect(result.result).toEqual({ ok: true });
    expect(result.auditRecord?.validationSummary.totalViolations).toBe(0);
  });

  it('denies requests whose requested capabilities violate request type routing', () => {
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
      requestId: 'routing-2',
      studentId: 'student-2',
      requestType: 'GENERATE',
      requestedCapabilities: ['UNDERSTAND'],
    });
    const decision = policy.evaluateRequest(request, router.getIntegrationStatus());

    expect(decision.allowed).toBe(false);
    expect(decision.violations).toHaveLength(1);
    expect(decision.violations[0]?.type).toBe('AUTHORITY_VIOLATION');
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
