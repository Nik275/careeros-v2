import { describe, expect, it } from 'vitest';
import { createOrchestratorRequest } from '../OrchestratorRequest';
import { IntelligenceOrchestrator } from '../IntelligenceOrchestrator';

describe('orchestrator lifecycle', () => {
  it('coordinates UNDERSTAND -> GENERATE -> LEARN without adding business logic', async () => {
    const now = createClock();
    const orchestrator = new IntelligenceOrchestrator({
      now,
    });
    const request = createOrchestratorRequest({
      requestId: 'lifecycle-1',
      studentId: 'student-1',
      requestType: 'FULL_LIFECYCLE',
      context: {
        source: 'test',
        stageBindings: {
          UNDERSTANDING: {
            operation: () => ({ studentModelId: 'student-model-1' }),
            operationName: 'buildStudentModel',
            modulePath: 'src/assessment/assessment-engine.ts',
          },
          GENERATING: {
            operation: () => ({ recommendationSetId: 'recommendation-set-1' }),
            operationName: 'generateOptions',
            modulePath: 'src/recommendation/career-recommendation-engine.ts',
          },
          TRACKING: {
            operation: () => ({ trackingId: 'tracking-1' }),
            operationName: 'registerOutcomeTracking',
            modulePath: 'src/outcome-tracking/engines/outcome-tracking-engine.ts',
          },
          LEARNING: {
            operation: () => ({ learningSignalId: 'learning-1' }),
            operationName: 'propagateLearningSignals',
            modulePath: 'src/intelligence/outcome-tracking/outcome-event-engine.ts',
          },
        },
      },
    });

    const response = await orchestrator.execute(request);

    expect(response.status).toBe('completed');
    expect(response.currentState).toBe('COMPLETED');
    expect(response.lifecycle.stateHistory.map((transition) => transition.toState)).toEqual([
      'RECEIVED',
      'VALIDATING',
      'UNDERSTANDING',
      'GENERATING',
      'TRACKING',
      'LEARNING',
      'COMPLETED',
    ]);
    expect(response.lifecycle.capabilityUsageHistory.map((entry) => entry.capability)).toEqual([
      'UNDERSTAND',
      'GENERATE',
      'LEARN',
      'LEARN',
    ]);
    expect(Object.keys(response.stageResults)).toEqual([
      'lifecycle-1-understanding',
      'lifecycle-1-generating',
      'lifecycle-1-tracking',
      'lifecycle-1-learning',
    ]);
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
