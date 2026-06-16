import { describe, expect, it } from 'vitest';
import { GoldenParityGate } from '../GoldenParityGate';
import type { GoldenScenarioResult } from '../GoldenScenarioTypes';

describe('GoldenParityGate', () => {
  it('blocks insufficient scenario coverage', () => {
    const gate = new GoldenParityGate();
    const result = gate.evaluate(createResults(39, 'MATCHED'));

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
    expect(result.reason).toContain('Insufficient');
  });

  it('blocks high drift', () => {
    const gate = new GoldenParityGate();
    const result = gate.evaluate([
      ...createResults(37, 'MATCHED'),
      ...createResults(3, 'DRIFT_DETECTED'),
    ]);

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
    expect(result.reason).toContain('drift');
  });

  it('blocks failures and critical gaps', () => {
    const gate = new GoldenParityGate();
    const result = gate.evaluate([
      ...createResults(39, 'MATCHED'),
      scenarioResult('critical-failure', 'FAILED', 'CRITICAL'),
    ]);

    expect(result).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
    expect(result.recommendedAction).not.toContain('enable');
  });

  it('passes only as validation readiness and never enables live routing', () => {
    const gate = new GoldenParityGate();
    const result = gate.evaluate(createResults(40, 'MATCHED'));

    expect(result).toMatchObject({
      status: 'PASS',
      blocking: false,
    });
    expect(result.recommendedAction).toContain('does not enable live routing');
  });
});

function createResults(count: number, status: GoldenScenarioResult['status']): GoldenScenarioResult[] {
  return Array.from({ length: count }, (_, index) =>
    scenarioResult(`${status}-${index + 1}`, status, 'LOW')
  );
}

function scenarioResult(
  scenarioId: string,
  status: GoldenScenarioResult['status'],
  riskLevel: GoldenScenarioResult['riskLevel']
): GoldenScenarioResult {
  return {
    scenarioId,
    flowType: 'career-fit',
    status,
    riskLevel,
    driftDetails: status === 'DRIFT_DETECTED' ? ['overallFitScore'] : [],
    failureDetails: status === 'FAILED' ? ['runner failed'] : [],
    payloadSummary: {},
    notes: [],
  };
}
