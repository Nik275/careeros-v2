import { describe, expect, it } from 'vitest';
import { GoldenParityGate } from '../GoldenParityGate';
import { evaluateGoldenParityThresholds } from '../GoldenParityThresholds';
import type { FlowBaselineMetrics } from '../GoldenParityBaselineMetrics';

describe('GoldenParityThresholds', () => {
  it('blocks insufficient coverage', () => {
    const result = evaluateGoldenParityThresholds('DRY_RUN_COMPARE', {
      ...passingMetrics(),
      executableCoveragePercentage: 69,
    });

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('blocks high drift', () => {
    const result = evaluateGoldenParityThresholds('CANARY_SHADOW', {
      ...passingMetrics(),
      driftPercentage: 4,
    });

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('blocks critical drift', () => {
    const result = evaluateGoldenParityThresholds('CANARY_SHADOW', {
      ...passingMetrics(),
      criticalDriftCount: 1,
    });

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('keeps CANARY_LIVE and FULL_LIVE blocked', () => {
    expect(evaluateGoldenParityThresholds('CANARY_LIVE', passingMetrics())).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
    expect(evaluateGoldenParityThresholds('FULL_LIVE', passingMetrics())).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('allows GoldenParityGate to consume baseline metrics', () => {
    const gateResult = new GoldenParityGate().evaluateBaselineMetrics(passingMetrics(), 'CANARY_SHADOW');

    expect(gateResult).toMatchObject({
      status: 'PASS',
      blocking: false,
    });
    expect(gateResult.recommendedAction).toContain('does not enable live routing');
  });
});

function passingMetrics(): FlowBaselineMetrics {
  return {
    totalScenarios: 40,
    executableScenarios: 40,
    matchedCount: 40,
    driftCount: 0,
    failedCount: 0,
    notComparableCount: 0,
    selfMirroredCount: 0,
    skippedCount: 0,
    independentComparableCount: 40,
    criticalDriftCount: 0,
    parityPercentage: 100,
    comparableCoveragePercentage: 100,
    executableCoveragePercentage: 100,
    driftPercentage: 0,
    failurePercentage: 0,
    notComparablePercentage: 0,
  };
}
