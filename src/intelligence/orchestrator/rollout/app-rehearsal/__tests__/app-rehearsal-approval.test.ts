import { describe, expect, it } from 'vitest';
import { createAppRehearsalApproval, validateAppRehearsalApproval } from '../AppRehearsalApprovalFactory';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
} from '../AppRehearsalEntrypointAdapter';

describe('AppRehearsalApprovalFactory', () => {
  it('requires approval and rejects expired approval', () => {
    expect(
      validateAppRehearsalApproval(undefined, {
        environment: 'staging',
        flows: ['assessment'],
        entrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID],
        allowServiceFallback: false,
        sampleRate: 1,
        maxExecutions: 1,
      }).valid
    ).toBe(false);

    const expired = createAppRehearsalApproval({ ...approvalInput(), expiresAt: '2026-06-05T00:00:00.000Z' });
    expect(
      validateAppRehearsalApproval(expired, {
        environment: 'staging',
        flows: ['assessment', 'career-fit'],
        entrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
        allowServiceFallback: false,
        sampleRate: 1,
        maxExecutions: 2,
        now: now(),
      }).valid
    ).toBe(false);
  });

  it('cannot authorize production, CANARY_LIVE, FULL_LIVE, output replacement, or raw payload capture', () => {
    expect(() => createAppRehearsalApproval({ ...approvalInput(), environment: 'production' })).toThrow(/production/);
    expect(() => createAppRehearsalApproval({ ...approvalInput(), requestedScope: 'CANARY_LIVE' })).toThrow(/CANARY_LIVE/);
    expect(() => createAppRehearsalApproval({ ...approvalInput(), requestedScope: 'FULL_LIVE' })).toThrow(/FULL_LIVE/);
    expect(() => createAppRehearsalApproval({ ...approvalInput(), allowOutputReplacement: true })).toThrow(/output replacement/);
    expect(() => createAppRehearsalApproval({ ...approvalInput(), allowRawPayloadCapture: true })).toThrow(/raw payload/);
  });

  it('validates a staging CANARY_SHADOW approval', () => {
    const approval = createAppRehearsalApproval(approvalInput());
    const validation = validateAppRehearsalApproval(approval, {
      environment: 'staging',
      flows: ['assessment', 'career-fit'],
      entrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
      allowServiceFallback: false,
      sampleRate: 1,
      maxExecutions: 2,
      now: now(),
    });

    expect(validation.valid).toBe(true);
    expect(approval.allowServiceFallback).toBe(false);
  });
});

function approvalInput() {
  return {
    runId: 'phase-5-9-approval-test',
    approvedBy: 'phase-5-9-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'] as const,
    allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
    allowServiceFallback: false,
    maxSampleRate: 1,
    maxExecutions: 2,
    reason: 'Phase 5.9 approval test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
