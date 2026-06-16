import { describe, expect, it } from 'vitest';
import { calculateStagingRehearsalMetrics } from '../StagingRehearsalMetrics';
import type { StagingRehearsalFlowResult } from '../StagingRehearsalTypes';

describe('StagingRehearsalMetrics', () => {
  it('excludes SELF_MIRRORED, NOT_COMPARABLE, and skipped results from match claims', () => {
    const metrics = calculateStagingRehearsalMetrics([
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

function result(overrides: Partial<StagingRehearsalFlowResult>): StagingRehearsalFlowResult {
  return {
    scenarioId: 'scenario',
    flow: 'assessment',
    entrypointId: 'assessment-engine.processResponses.service-fallback',
    entrypointLevel: 'service-fallback',
    status: overrides.executed === false ? 'PLANNED' : 'COMPLETED',
    sampled: overrides.executed ?? true,
    executed: true,
    appLevel: false,
    serviceLevelFallback: true,
    hookReached: true,
    observeRouterReached: true,
    canaryShadowReached: true,
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
