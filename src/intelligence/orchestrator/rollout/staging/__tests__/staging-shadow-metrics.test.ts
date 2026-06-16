import { describe, expect, it } from 'vitest';
import { calculateStagingShadowMetrics } from '../StagingShadowMetrics';
import type { StagingShadowFlowResult } from '../StagingShadowRunTypes';

describe('StagingShadowMetrics', () => {
  it('excludes SELF_MIRRORED, NOT_COMPARABLE, and skipped results from match claims', () => {
    const metrics = calculateStagingShadowMetrics([
      result({ scenarioId: 'matched', executed: true, comparisonStatus: 'MATCHED', matched: true }),
      result({ scenarioId: 'self', executed: true, comparisonStatus: 'SELF_MIRRORED', selfMirrored: true }),
      result({ scenarioId: 'not-comparable', executed: true, comparisonStatus: 'NOT_COMPARABLE', notComparable: true }),
      result({ scenarioId: 'skipped', executed: false, comparisonStatus: 'SKIPPED' }),
    ]);

    expect(metrics.matchedCount).toBe(1);
    expect(metrics.selfMirroredCount).toBe(1);
    expect(metrics.notComparableCount).toBe(1);
    expect(metrics.skippedScenarios).toBe(1);
    expect(metrics.matchRate).toBe(33.33);
    expect(metrics.comparableCoverage).toBe(33.33);
  });
});

function result(overrides: Partial<StagingShadowFlowResult>): StagingShadowFlowResult {
  return {
    scenarioId: 'scenario',
    flow: 'assessment',
    sourceSuite: 'golden',
    status: overrides.executed === false ? 'PLANNED' : 'COMPLETED',
    sampled: overrides.executed ?? true,
    executed: true,
    hookPathObserved: true,
    comparisonStatus: 'MATCHED',
    matched: false,
    drifted: false,
    failed: false,
    notComparable: false,
    selfMirrored: false,
    rollbackTriggered: false,
    privacyViolation: false,
    telemetryFailure: false,
    latencyMs: 10,
    gateResultsPassed: 2,
    gateResultsTotal: 2,
    productionOutputPreserved: true,
    notes: [],
    ...overrides,
  };
}
