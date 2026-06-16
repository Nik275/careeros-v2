import { describe, expect, it } from 'vitest';
import {
  calculateCombinedBaselineMetrics,
  calculateFlowBaselineMetrics,
  type BaselineMetricInput,
} from '../GoldenParityBaselineMetrics';

describe('GoldenParityBaselineMetrics', () => {
  it('excludes SELF_MIRRORED, NOT_COMPARABLE, and SKIPPED from parity', () => {
    const metrics = calculateFlowBaselineMetrics([
      input('MATCHED'),
      input('DRIFT_DETECTED'),
      input('SELF_MIRRORED'),
      input('NOT_COMPARABLE'),
      input('SKIPPED', false),
    ]);

    expect(metrics.independentComparableCount).toBe(2);
    expect(metrics.parityPercentage).toBe(50);
    expect(metrics.selfMirroredCount).toBe(1);
    expect(metrics.notComparableCount).toBe(1);
    expect(metrics.skippedCount).toBe(1);
  });

  it('calculates comparable coverage and drift percentage from independent comparable scenarios', () => {
    const metrics = calculateFlowBaselineMetrics([
      input('MATCHED'),
      input('MATCHED'),
      input('MATCHED'),
      input('DRIFT_DETECTED'),
      input('NOT_COMPARABLE'),
    ]);

    expect(metrics.comparableCoveragePercentage).toBe(80);
    expect(metrics.driftPercentage).toBe(25);
  });

  it('calculates combined baseline risk score', () => {
    const metrics = calculateCombinedBaselineMetrics(
      [input('MATCHED'), input('FAILED')],
      [input('MATCHED'), input('DRIFT_DETECTED', true, true)]
    );

    expect(metrics.assessment.failedCount).toBe(1);
    expect(metrics.careerFit.criticalDriftCount).toBe(1);
    expect(metrics.combined.totalScenarios).toBe(4);
    expect(metrics.combined.combinedRiskScore).toBeGreaterThan(0);
  });
});

function input(
  status: BaselineMetricInput['status'],
  executable = true,
  criticalDrift = false
): BaselineMetricInput {
  return {
    status,
    executable,
    criticalDrift,
    riskLevel: criticalDrift ? 'CRITICAL' : 'LOW',
  };
}
