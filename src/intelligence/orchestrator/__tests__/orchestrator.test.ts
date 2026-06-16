import { describe, expect, it } from 'vitest';
import { createOrchestratorRequest } from '../OrchestratorRequest';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';

describe('IntelligenceOrchestrator', () => {
  it('executes the orchestration skeleton and keeps authority integration active', async () => {
    const now = createClock();
    const orchestrator = new IntelligenceOrchestrator({
      now,
    });
    const request = createOrchestratorRequest({
      requestId: 'orchestrator-1',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            operation: () => ({ studentModelId: 'student-model-1' }),
            operationName: 'buildStudentUnderstanding',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('completed');
    expect(response.authorityIntegrationStatus.activeAuthorityCount).toBe(3);
    expect(response.authorityIntegrationStatus.missingRequiredAuthorities).toEqual([]);
    expect(response.stageResults['orchestrator-1-understanding']).toEqual({
      studentModelId: 'student-model-1',
    });
    expect(response.knownLimitations.some((item) => item.includes('skeleton-only'))).toBe(true);
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
