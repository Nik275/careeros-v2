import { describe, expect, it } from 'vitest';
import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import type { CanaryShadowExecutionRecord } from '../CanaryShadowTypes';

describe('CanaryShadowAuditService', () => {
  it('records audit records and health summaries', () => {
    const service = new CanaryShadowAuditService();
    const config = createCanaryShadowConfig({
      globalShadowEnabled: true,
      allowedFlows: ['assessment'],
    });

    service.record(record('COMPLETED'));
    service.record(record('FAILED'));

    const health = service.getHealthSnapshot(config);
    expect(health.totalRecords).toBe(2);
    expect(health.byStatus.COMPLETED).toBe(1);
    expect(health.byStatus.FAILED).toBe(1);
    expect(health.failureCount).toBe(1);
  });

  it('does not create payload summaries by default', () => {
    const service = new CanaryShadowAuditService();

    expect(
      service.createPayloadSummary(
        { studentId: 'student-1', responses: ['raw student payload'] },
        createCanaryShadowConfig()
      )
    ).toBeUndefined();
  });

  it('creates privacy-safe payload summaries only when explicitly enabled', () => {
    const service = new CanaryShadowAuditService();
    const summary = service.createPayloadSummary(
      { studentId: 'student-1', responses: ['raw student payload'] },
      createCanaryShadowConfig({ capturePayloadSummaries: true })
    );

    expect(summary?.rawPayloadStored).toBe(false);
    expect(JSON.stringify(summary?.summary)).not.toContain('raw student payload');
    expect(JSON.stringify(summary?.summary)).toContain('[REDACTED]');
  });
});

function record(status: CanaryShadowExecutionRecord['status']): CanaryShadowExecutionRecord {
  return {
    recordId: `record-${status}`,
    requestId: 'request-1',
    productionCallId: 'production-1',
    flow: 'assessment',
    status,
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
      decidedAt: '2026-06-06T00:00:00.000Z',
      metadata: {},
    },
    comparison: {
      status: status === 'FAILED' ? 'FAILED' : 'MATCHED',
      comparable: status !== 'FAILED',
      productionOutputCaptured: true,
      shadowOutputCaptured: status !== 'FAILED',
      differences: [],
      notes: [],
    },
    startedAt: '2026-06-06T00:00:00.000Z',
    completedAt: '2026-06-06T00:00:00.000Z',
    latencyMs: 1,
    rollbackTriggered: false,
    privacySafe: true,
    telemetryHealthy: true,
    productionOutputPreserved: true,
    notes: [],
  };
}
