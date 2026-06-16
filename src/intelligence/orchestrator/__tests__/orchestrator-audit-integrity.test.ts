import { describe, expect, it } from 'vitest';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';
import { createOrchestratorRequest } from '../OrchestratorRequest';

describe('orchestrator audit integrity', () => {
  it('records event completeness for a successful request lifecycle', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'audit-events',
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
    const eventTypes = orchestrator.getEmittedEvents().map((event) => event.eventType);

    expect(response.status).toBe('completed');
    expect(eventTypes).toContain('validation.started');
    expect(eventTypes).toContain('authority.usage.observed');
    expect(eventTypes).toContain('audit.report.created');
    expect(eventTypes).toContain('validation.completed');
    expect(response.auditTrail.eventIds.length).toBeGreaterThan(0);
  });

  it('keeps request-scoped event ordering auditable', async () => {
    const orchestrator = new IntelligenceOrchestrator({
      now: createClock(),
    });
    const request = createOrchestratorRequest({
      requestId: 'audit-ordering',
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

    await orchestrator.execute(request);

    const requestEvents = orchestrator
      .getEmittedEvents()
      .filter((event) => event.payload.requestId === 'audit-ordering');
    const validationStarted = requestEvents.findIndex(
      (event) => event.eventType === 'validation.started'
    );
    const auditCreated = requestEvents.findIndex(
      (event) => event.eventType === 'audit.report.created'
    );
    const validationCompleted = requestEvents.findIndex(
      (event) => event.eventType === 'validation.completed' && 'status' in event.payload
    );

    expect(validationStarted).toBeGreaterThanOrEqual(0);
    expect(auditCreated).toBeGreaterThan(validationStarted);
    expect(validationCompleted).toBeGreaterThan(auditCreated);
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
