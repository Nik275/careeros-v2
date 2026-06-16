import { describe, expect, it } from 'vitest';
import { createObserveModeConfig } from '../ObserveModeConfig';
import { ObserveModeAuditService } from '../ObserveModeAuditService';
import type { ObserveModeAuditRecord } from '../ObserveModeTypes';

describe('ObserveModeAuditService', () => {
  it('stores observe-mode audit records in memory and summarizes them', () => {
    const service = new ObserveModeAuditService();

    service.record(createRecord('record-1', 'MATCHED', 'assessment'));
    service.record(createRecord('record-2', 'FAILED', 'recommendation'));
    service.record({
      ...createRecord('record-3', 'DRIFT_DETECTED', 'recommendation'),
      comparison: {
        status: 'DRIFT_DETECTED',
        comparable: true,
        productionOutputCaptured: true,
        orchestratorOutputCaptured: true,
        notes: [],
        drifts: [
          {
            driftId: 'drift-1',
            driftType: 'OUTPUT_MISMATCH',
            status: 'DRIFT_DETECTED',
            severity: 'high',
            description: 'output mismatch',
            evidence: ['unit test'],
          },
        ],
      },
    });

    expect(service.listRecords()).toHaveLength(3);
    expect(service.getAuditSummary()).toMatchObject({
      totalRecords: 3,
      driftCount: 1,
      failureCount: 1,
      comparableCount: 2,
    });
    expect(service.getCoverageSummary().flows).toEqual(['assessment', 'recommendation']);
    expect(service.getFailureSummary().totalFailures).toBe(1);
  });
});

function createRecord(
  id: string,
  status: ObserveModeAuditRecord['status'],
  flowName: string
): ObserveModeAuditRecord {
  return {
    auditId: id,
    observeRequestId: id,
    status,
    createdAt: '2026-06-06T00:00:00.000Z',
    configSnapshot: createObserveModeConfig({ enabled: true }),
    notes: [],
    productionCall: {
      callId: id,
      flowName,
      sourceModule: 'src/test.ts',
      operationName: 'test',
      studentId: 'student-1',
      requestType: flowName === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
      capability: flowName === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
      timestamp: '2026-06-06T00:00:00.000Z',
      outputSnapshot: { ok: true },
      metadata: {},
    },
    comparison: {
      status,
      comparable: status === 'MATCHED',
      productionOutputCaptured: true,
      orchestratorOutputCaptured: status === 'MATCHED',
      drifts: [],
      notes: [],
    },
  };
}
