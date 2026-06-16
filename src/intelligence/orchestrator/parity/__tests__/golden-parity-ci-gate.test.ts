import { describe, expect, it } from 'vitest';
import type { CombinedBaselineMetrics } from '../GoldenParityBaselineMetrics';
import { GoldenParityCIGate } from '../GoldenParityCIGate';
import { GoldenParityGate } from '../GoldenParityGate';

describe('GoldenParityCIGate', () => {
  it('fails when scenario count is too low', () => {
    const result = new GoldenParityCIGate().evaluateMetrics({ ...passingMetrics(), totalScenarios: 199 });
    expect(result.status).toBe('FAIL');
  });

  it('fails when parity is below threshold', () => {
    const result = new GoldenParityCIGate().evaluateMetrics({ ...passingMetrics(), parityPercentage: 97.9 });
    expect(result.status).toBe('FAIL');
  });

  it('fails when drift is above threshold', () => {
    const result = new GoldenParityCIGate().evaluateMetrics({ ...passingMetrics(), driftPercentage: 1.1 });
    expect(result.status).toBe('FAIL');
  });

  it('fails when failure rate is above threshold', () => {
    const result = new GoldenParityCIGate().evaluateMetrics({ ...passingMetrics(), failurePercentage: 1.1 });
    expect(result.status).toBe('FAIL');
  });

  it('passes when thresholds are satisfied and rollout gate consumes result', () => {
    const result = new GoldenParityCIGate().evaluateMetrics(passingMetrics());
    const gate = new GoldenParityGate().evaluateCIGateResult(result);

    expect(result.status).toBe('PASS');
    expect(gate.status).toBe('PASS');
  });
});

function passingMetrics(): CombinedBaselineMetrics {
  return {
    totalScenarios: 300,
    executableScenarios: 300,
    matchedCount: 300,
    driftCount: 0,
    failedCount: 0,
    notComparableCount: 0,
    selfMirroredCount: 0,
    skippedCount: 0,
    independentComparableCount: 300,
    criticalDriftCount: 0,
    parityPercentage: 100,
    comparableCoveragePercentage: 100,
    executableCoveragePercentage: 100,
    driftPercentage: 0,
    failurePercentage: 0,
    notComparablePercentage: 0,
    combinedRiskScore: 0,
  };
}
