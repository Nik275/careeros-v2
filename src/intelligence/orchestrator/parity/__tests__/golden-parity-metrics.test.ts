import { describe, expect, it } from 'vitest';
import { calculateGoldenParityMetrics } from '../GoldenParityMetrics';
import type { GoldenScenarioResult } from '../GoldenScenarioTypes';

describe('calculateGoldenParityMetrics', () => {
  it('excludes self-mirrored, skipped, and not-comparable scenarios from parity percentage', () => {
    const metrics = calculateGoldenParityMetrics([
      result('MATCHED'),
      result('MATCHED'),
      result('DRIFT_DETECTED'),
      result('SELF_MIRRORED'),
      result('NOT_COMPARABLE'),
      result('SKIPPED'),
      result('FAILED'),
    ]);

    expect(metrics.totalScenarios).toBe(7);
    expect(metrics.matchedCount).toBe(2);
    expect(metrics.driftCount).toBe(1);
    expect(metrics.selfMirroredCount).toBe(1);
    expect(metrics.notComparableCount).toBe(1);
    expect(metrics.skippedCount).toBe(1);
    expect(metrics.parityPercentage).toBe(66.67);
    expect(metrics.driftPercentage).toBe(33.33);
    expect(metrics.comparableCoveragePercentage).toBe(42.86);
    expect(metrics.failurePercentage).toBe(14.29);
  });

  it('returns zero percentages when no independent comparable scenarios exist', () => {
    const metrics = calculateGoldenParityMetrics([
      result('SELF_MIRRORED'),
      result('NOT_COMPARABLE'),
      result('SKIPPED'),
    ]);

    expect(metrics.parityPercentage).toBe(0);
    expect(metrics.driftPercentage).toBe(0);
    expect(metrics.comparableCoveragePercentage).toBe(0);
  });
});

function result(status: GoldenScenarioResult['status']): GoldenScenarioResult {
  return {
    scenarioId: `scenario-${status}`,
    flowType: 'assessment',
    status,
    riskLevel: 'LOW',
    driftDetails: [],
    failureDetails: [],
    payloadSummary: {},
    notes: [],
  };
}
