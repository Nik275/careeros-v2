import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../ObserveModeConfig';
import { ObserveModeRouter } from '../ObserveModeRouter';
import { ProductionFlowObserver } from '../ProductionFlowObserver';
import type { IntelligenceOrchestrator } from '../../IntelligenceOrchestrator';

describe('ObserveModeRouter', () => {
  it('skips observation by default and preserves production output', async () => {
    const observer = new ProductionFlowObserver({
      now: () => '2026-06-06T00:00:00.000Z',
    });
    const request = observer.createObserveModeRequest({
      flowKind: 'assessment',
      sourceModule: 'src/assessment/assessment-engine.ts',
      operationName: 'processAssessment',
      studentId: 'student-1',
      output: { production: true },
    });
    const router = new ObserveModeRouter({
      now: createClock(),
    });

    const result = await router.observe(request);

    expect(result.status).toBe('SKIPPED');
    expect(result.productionOutput).toBeUndefined();
    expect(result.auditRecord.status).toBe('SKIPPED');
  });

  it('observes safely when enabled and reports skeleton output as NOT_COMPARABLE', async () => {
    const config = createObserveModeConfig({
      enabled: true,
      captureOutputs: true,
      sampleRate: 1,
    });
    const observer = new ProductionFlowObserver({
      now: () => '2026-06-06T00:00:00.000Z',
    });
    const request = observer.createObserveModeRequest(
      {
        flowKind: 'assessment',
        sourceModule: 'src/assessment/assessment-engine.ts',
        operationName: 'processAssessment',
        studentId: 'student-1',
        output: { production: true },
      },
      config
    );
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });

    const result = await router.observe(request);

    expect(result.status).toBe('NOT_COMPARABLE');
    expect(result.productionOutput).toEqual({ production: true });
    expect(result.orchestratorCall?.status).toBe('OBSERVED');
    expect(result.comparison.notes.join(' ')).toContain('Skeleton orchestrator');
  });

  it('captures orchestrator failures without throwing into production path', async () => {
    const config = createObserveModeConfig({
      enabled: true,
      captureOutputs: true,
      sampleRate: 1,
    });
    const observer = new ProductionFlowObserver();
    const request = observer.createObserveModeRequest(
      {
        flowKind: 'recommendation',
        sourceModule: 'src/recommendation/career-recommendation-engine.ts',
        operationName: 'generateRecommendations',
        studentId: 'student-1',
        output: [{ careerId: 'software-engineering' }],
      },
      config
    );
    const failingOrchestrator = {
      execute: async () => {
        throw new Error('orchestrator unavailable');
      },
    } as unknown as IntelligenceOrchestrator;
    const router = new ObserveModeRouter({
      orchestrator: failingOrchestrator,
      now: createClock(),
      random: () => 0,
    });

    const result = await router.observe(request);

    expect(result.status).toBe('FAILED');
    expect(result.orchestratorCall?.errorMessage).toBe('orchestrator unavailable');
    expect(result.productionOutput).toEqual([{ careerId: 'software-engineering' }]);
    expect(router.getAuditService().getFailureSummary().totalFailures).toBe(1);
  });

  it('does not mutate production output objects', async () => {
    const productionOutput = { recommendationSetId: 'set-1' };
    const config = createObserveModeConfig({
      enabled: true,
      captureOutputs: true,
    });
    const observer = new ProductionFlowObserver();
    const request = observer.createObserveModeRequest(
      {
        flowKind: 'recommendation',
        sourceModule: 'src/recommendation/career-recommendation-engine.ts',
        operationName: 'generateRecommendations',
        studentId: 'student-1',
        output: productionOutput,
      },
      config
    );
    const router = new ObserveModeRouter({
      now: createClock(),
      random: () => 0,
    });

    await router.observe(request);

    expect(productionOutput).toEqual({ recommendationSetId: 'set-1' });
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
