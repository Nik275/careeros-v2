import { describe, expect, it } from 'vitest';
import { createOrchestratorRequest } from '../OrchestratorRequest';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';

describe('orchestrator audit trail', () => {
  it('produces lifecycle audit and constitutional compliance data for observed violations', async () => {
    const now = createClock();
    const orchestrator = new IntelligenceOrchestrator({
      now,
    });
    const request = createOrchestratorRequest({
      requestId: 'audit-1',
      studentId: 'student-1',
      requestType: 'GENERATE',
      context: {
        source: 'test',
        stageBindings: {
          GENERATING: {
            operation: () => ({ recommendationSetId: 'recommendation-set-1' }),
            operationName: 'generateOptions',
            modulePath: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
            dependencies: [
              {
                sourceModule: 'src/intelligence/recommendation-engine/RecommendationEngine.ts',
                targetModule: 'src/intelligence/student-model/StudentBelief.ts',
                relationshipType: 'import',
                evidence: 'unit-test Option -> Student dependency',
              },
            ],
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('completed');
    expect(response.auditTrail.finalState).toBe('COMPLETED');
    expect(response.auditTrail.constitutionalComplianceReport.violationCount).toBe(1);
    expect(
      response.auditTrail.constitutionalComplianceReport.violations[0]?.type
    ).toBe('DEPENDENCY_VIOLATION');
    expect(response.auditTrail.authorityInvolvementHistory).toHaveLength(1);
    expect(response.auditTrail.auditRecordIds.length).toBeGreaterThan(0);
    expect(response.auditTrail.constitutionalAudit.validationSummary.totalViolations).toBe(1);
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
