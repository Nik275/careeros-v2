import { describe, expect, it } from 'vitest';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';
import { createOrchestratorRequest } from '../OrchestratorRequest';

describe('orchestrator execution binding policy', () => {
  it('marks unbound executable stages as NON_EXECUTABLE and does not run authority facades', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'binding-missing',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('failed');
    expect(response.currentState).toBe('FAILED');
    expect(response.plan.executability.status).toBe('NON_EXECUTABLE');
    expect(response.plan.executability.blockingStages).toEqual(['binding-missing-understanding']);
    expect(response.auditTrail.authorityInvolvementHistory).toHaveLength(0);
    expect(response.warnings.join(' ')).toContain('requires an explicit execution binding');
  });

  it('allows explicit no-op only in SKELETON_MODE, TEST_MODE, or DRY_RUN_MODE', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'binding-noop',
      studentId: 'student-1',
      requestType: 'UNDERSTAND',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            bindingMode: 'SKELETON_MODE',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);
    const execution = response.auditTrail.authorityInvolvementHistory[0];

    expect(response.status).toBe('completed');
    expect(response.plan.executability.status).toBe('EXECUTABLE');
    expect(response.stageResults['binding-noop-understanding']).toBeUndefined();
    expect(execution?.bindingState).toBe('BINDING_PRESENT');
    expect(execution?.bindingMode).toBe('SKELETON_MODE');
    expect(execution?.executionMode).toBe('EXPLICIT_NOOP');
    expect(execution?.usesNoop).toBe(true);
  });

  it('does not use registry module fallback as the executed module path', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'binding-module-integrity',
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
    const execution = response.auditTrail.authorityInvolvementHistory[0];

    expect(response.status).toBe('completed');
    expect(execution?.modulePath).toBe('src/assessment/assessment-engine.ts');
    expect(execution?.registryModulePath).toBeDefined();
    expect(execution?.registryModulePath).not.toBe(execution?.modulePath);
    expect(execution?.executionMode).toBe('REAL_EXECUTION');
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
