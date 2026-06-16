import { describe, expect, it } from 'vitest';
import { CanaryShadowTrialGate } from '../CanaryShadowTrialGate';
import type { CanaryShadowTrialMetrics } from '../CanaryShadowTrialTypes';

describe('CanaryShadowTrialGate', () => {
  it('passes a healthy trial', () => {
    const gate = new CanaryShadowTrialGate({}, { now });
    const result = gate.evaluate(metrics());

    expect(result.verdict).toBe('PASS');
    expect(result.passed).toBe(true);
  });

  it('fails insufficient execution count', () => {
    const result = new CanaryShadowTrialGate({}, { now }).evaluate(metrics({
      executedScenarios: 49,
    }));

    expect(result.verdict).toBe('FAIL');
    expect(result.failures.join(' ')).toContain('executedScenarios');
  });

  it('fails high drift and high failure rate', () => {
    const gate = new CanaryShadowTrialGate({}, { now });

    expect(gate.evaluate(metrics({ driftRate: 2 })).failures.join(' ')).toContain('driftRate');
    expect(gate.evaluate(metrics({ failureRate: 2 })).failures.join(' ')).toContain('failureRate');
  });
});

function metrics(overrides: Partial<CanaryShadowTrialMetrics> = {}): CanaryShadowTrialMetrics {
  return {
    totalScenarios: 60,
    sampledScenarios: 60,
    executedScenarios: 60,
    skippedScenarios: 0,
    matchedCount: 60,
    driftCount: 0,
    failedCount: 0,
    notComparableCount: 0,
    selfMirroredCount: 0,
    rollbackCount: 0,
    criticalDriftCount: 0,
    privacyViolationCount: 0,
    telemetryFailureCount: 0,
    averageLatencyMs: 1,
    p95LatencyMs: 1,
    failureRate: 0,
    driftRate: 0,
    matchRate: 100,
    comparableCoverage: 100,
    gatePassRate: 100,
    ...overrides,
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
