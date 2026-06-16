import { describe, expect, it } from 'vitest';
import { OrchestratorDriftDetector } from '../OrchestratorDriftDetector';
import type { ObservedOrchestratorCall, ObservedProductionCall } from '../ObserveModeTypes';

describe('OrchestratorDriftDetector', () => {
  it('reports MATCHED when comparable snapshots are equal', () => {
    const detector = new OrchestratorDriftDetector();
    const comparison = detector.compare({
      productionCall: createProductionCall({ outputSnapshot: { score: 1 } }),
      orchestratorCall: createOrchestratorCall({ outputSnapshot: { score: 1 } }),
      compareOutputs: true,
    });

    expect(comparison.status).toBe('MATCHED');
    expect(comparison.comparable).toBe(true);
    expect(comparison.drifts).toHaveLength(0);
  });

  it('detects output drift when comparable snapshots differ', () => {
    const detector = new OrchestratorDriftDetector();
    const comparison = detector.compare({
      productionCall: createProductionCall({ outputSnapshot: { score: 1 } }),
      orchestratorCall: createOrchestratorCall({ outputSnapshot: { score: 2 } }),
      compareOutputs: true,
    });

    expect(comparison.status).toBe('DRIFT_DETECTED');
    expect(comparison.drifts[0]?.driftType).toBe('OUTPUT_MISMATCH');
  });

  it('reports NOT_COMPARABLE honestly for skeleton output', () => {
    const detector = new OrchestratorDriftDetector();
    const comparison = detector.compare({
      productionCall: createProductionCall({ outputSnapshot: { score: 1 } }),
      orchestratorCall: createOrchestratorCall({ outputSnapshot: undefined }),
      compareOutputs: true,
    });

    expect(comparison.status).toBe('NOT_COMPARABLE');
    expect(comparison.comparable).toBe(false);
    expect(comparison.notes.join(' ')).toContain('Skeleton orchestrator');
  });

  it('captures failed orchestrator calls without pretending they are drift parity', () => {
    const detector = new OrchestratorDriftDetector();
    const comparison = detector.compare({
      productionCall: createProductionCall({ outputSnapshot: { score: 1 } }),
      orchestratorCall: createOrchestratorCall({
        status: 'FAILED',
        outputSnapshot: undefined,
        errorMessage: 'observe failed',
      }),
      compareOutputs: true,
    });

    expect(comparison.status).toBe('FAILED');
    expect(comparison.drifts[0]?.driftType).toBe('ROUTING_FAILURE');
  });
});

function createProductionCall(
  overrides: Partial<ObservedProductionCall> = {}
): ObservedProductionCall {
  return {
    callId: 'production-1',
    flowName: 'recommendation',
    sourceModule: 'src/recommendation/career-recommendation-engine.ts',
    operationName: 'generateRecommendations',
    studentId: 'student-1',
    requestType: 'GENERATE',
    capability: 'GENERATE',
    timestamp: '2026-06-06T00:00:00.000Z',
    metadata: {},
    ...overrides,
  };
}

function createOrchestratorCall(
  overrides: Partial<ObservedOrchestratorCall> = {}
): ObservedOrchestratorCall {
  return {
    requestId: 'orchestrator-1',
    status: 'OBSERVED',
    startedAt: '2026-06-06T00:00:01.000Z',
    completedAt: '2026-06-06T00:00:02.000Z',
    latencyMs: 1000,
    ...overrides,
  };
}
