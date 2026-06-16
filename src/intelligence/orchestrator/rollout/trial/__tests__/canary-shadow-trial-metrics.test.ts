import { describe, expect, it } from 'vitest';
import { calculateCanaryShadowTrialMetrics } from '../CanaryShadowTrialMetrics';
import type { CanaryShadowTrialFlowResult } from '../CanaryShadowTrialTypes';

describe('CanaryShadowTrialMetrics', () => {
  it('excludes SELF_MIRRORED and NOT_COMPARABLE from match rate', () => {
    const metrics = calculateCanaryShadowTrialMetrics([
      result('MATCHED'),
      result('SELF_MIRRORED'),
      result('NOT_COMPARABLE'),
      result('SKIPPED', false),
    ]);

    expect(metrics.totalScenarios).toBe(4);
    expect(metrics.executedScenarios).toBe(3);
    expect(metrics.matchedCount).toBe(1);
    expect(metrics.selfMirroredCount).toBe(1);
    expect(metrics.notComparableCount).toBe(1);
    expect(metrics.matchRate).toBe(33.33);
  });

  it('calculates drift, failure, rollback, and latency metrics honestly', () => {
    const metrics = calculateCanaryShadowTrialMetrics([
      result('MATCHED', true, 10),
      result('DRIFT_DETECTED', true, 20),
      result('FAILED', true, 30),
      result('MATCHED', true, 40, true),
    ]);

    expect(metrics.driftCount).toBe(1);
    expect(metrics.failedCount).toBe(1);
    expect(metrics.rollbackCount).toBe(1);
    expect(metrics.averageLatencyMs).toBe(25);
    expect(metrics.p95LatencyMs).toBe(40);
  });
});

function result(
  status: CanaryShadowTrialFlowResult['comparisonStatus'],
  executed = true,
  latencyMs = 1,
  rollbackTriggered = false
): CanaryShadowTrialFlowResult {
  return {
    scenarioId: `scenario-${status}`,
    flow: 'assessment',
    sourceSuite: 'golden',
    status: executed ? 'COMPLETED' : 'BLOCKED',
    sampled: executed,
    executed,
    comparisonStatus: status,
    matched: status === 'MATCHED',
    drifted: status === 'DRIFT_DETECTED',
    failed: status === 'FAILED',
    notComparable: status === 'NOT_COMPARABLE',
    selfMirrored: status === 'SELF_MIRRORED',
    rollbackTriggered,
    criticalDrift: false,
    privacyViolation: false,
    telemetryFailure: false,
    latencyMs,
    gateResultsPassed: executed ? 10 : 0,
    gateResultsTotal: executed ? 10 : 10,
    productionOutputPreserved: true,
    notes: [],
  };
}
