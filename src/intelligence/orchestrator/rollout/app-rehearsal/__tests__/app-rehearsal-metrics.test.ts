import { describe, expect, it } from 'vitest';
import { calculateAppRehearsalMetrics } from '../AppRehearsalMetrics';
import type { AppRehearsalFlowResult } from '../AppRehearsalTypes';

describe('AppRehearsalMetrics', () => {
  it('does not count service fallback as app-level coverage', () => {
    const metrics = calculateAppRehearsalMetrics([
      flowResult({ appLevel: true, serviceLevelFallback: false, matched: true }),
      flowResult({ appLevel: false, serviceLevelFallback: true, matched: true }),
    ]);

    expect(metrics.appLevelScenarios).toBe(1);
    expect(metrics.serviceLevelFallbackScenarios).toBe(1);
    expect(metrics.appLevelCoverageRate).toBe(50);
    expect(metrics.serviceFallbackRate).toBe(50);
  });

  it('excludes SELF_MIRRORED, NOT_COMPARABLE, and skipped results from match rate', () => {
    const metrics = calculateAppRehearsalMetrics([
      flowResult({ matched: true, comparisonStatus: 'MATCHED' }),
      flowResult({ matched: false, selfMirrored: true, comparisonStatus: 'SELF_MIRRORED' }),
      flowResult({ matched: false, notComparable: true, comparisonStatus: 'NOT_COMPARABLE' }),
      flowResult({ matched: false, executed: false, status: 'PLANNED', comparisonStatus: 'SKIPPED' }),
    ]);

    expect(metrics.matchedCount).toBe(1);
    expect(metrics.selfMirroredCount).toBe(1);
    expect(metrics.notComparableCount).toBe(1);
    expect(metrics.matchRate).toBe(33.33);
  });
});

function flowResult(overrides: Partial<AppRehearsalFlowResult> = {}): AppRehearsalFlowResult {
  return {
    scenarioId: 'scenario',
    flow: 'assessment',
    entrypointId: 'entrypoint',
    entrypointLevel: 'test-only-adapter',
    alignmentDecision: 'IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER',
    status: 'COMPLETED',
    sampled: true,
    executed: true,
    appLevel: true,
    serviceLevelFallback: false,
    hookReached: true,
    observeRouterReached: true,
    canaryShadowReached: true,
    dryRunBindingReached: true,
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
    gateResultsPassed: 3,
    gateResultsTotal: 3,
    productionOutputPreserved: true,
    notes: [],
    ...overrides,
  };
}
