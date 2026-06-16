import { describe, expect, it } from 'vitest';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowRollbackPolicy } from '../CanaryShadowRollbackPolicy';
import type { CanaryShadowExecutionRecord } from '../CanaryShadowTypes';

describe('CanaryShadowRollbackPolicy', () => {
  it('disables a shadow flow after drift', () => {
    const policy = new CanaryShadowRollbackPolicy({ now });
    const result = policy.evaluate(record({ comparisonStatus: 'DRIFT_DETECTED' }), createCanaryShadowConfig({
      rollbackOnDrift: true,
    }));

    expect(result.rollbackTriggered).toBe(true);
    expect(policy.isFlowDisabled('assessment')).toBe(true);
    expect(policy.getRollbackRecord('assessment')?.reason).toBe('critical_drift');
  });

  it('disables a shadow flow after execution failure', () => {
    const policy = new CanaryShadowRollbackPolicy({ now });
    const result = policy.evaluate(record({ status: 'FAILED', comparisonStatus: 'FAILED' }), createCanaryShadowConfig({
      rollbackOnFailure: true,
    }));

    expect(result.rollbackTriggered).toBe(true);
    expect(policy.getRollbackRecord('assessment')?.reason).toBe('failure_rate_breach');
  });

  it('does not roll back when no trigger matches', () => {
    const policy = new CanaryShadowRollbackPolicy({ now });
    const result = policy.evaluate(record({ comparisonStatus: 'MATCHED' }), createCanaryShadowConfig());

    expect(result.rollbackTriggered).toBe(false);
    expect(policy.isFlowDisabled('assessment')).toBe(false);
  });
});

function record(input: {
  status?: CanaryShadowExecutionRecord['status'];
  comparisonStatus: CanaryShadowExecutionRecord['comparison']['status'];
}): CanaryShadowExecutionRecord {
  return {
    recordId: 'record-1',
    requestId: 'request-1',
    productionCallId: 'production-1',
    flow: 'assessment',
    status: input.status ?? 'COMPLETED',
    decision: {
      decisionId: 'decision-1',
      requestId: 'request-1',
      flow: 'assessment',
      mode: 'CANARY_SHADOW',
      status: 'ELIGIBLE',
      approved: true,
      gateResults: [],
      riskLevel: 'medium',
      reasons: [],
      decidedAt: now(),
      metadata: {},
    },
    comparison: {
      status: input.comparisonStatus,
      comparable: input.comparisonStatus === 'MATCHED' || input.comparisonStatus === 'DRIFT_DETECTED',
      productionOutputCaptured: true,
      shadowOutputCaptured: true,
      differences: [],
      notes: [],
    },
    startedAt: now(),
    completedAt: now(),
    latencyMs: 1,
    rollbackTriggered: false,
    privacySafe: true,
    telemetryHealthy: true,
    productionOutputPreserved: true,
    notes: [],
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
