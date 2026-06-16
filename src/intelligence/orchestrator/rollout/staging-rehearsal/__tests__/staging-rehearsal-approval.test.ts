import { describe, expect, it } from 'vitest';
import {
  createStagingRehearsalApproval,
  validateStagingRehearsalApproval,
} from '../StagingRehearsalApprovalFactory';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  CAREER_FIT_SERVICE_ENTRYPOINT_ID,
} from '../StagingRehearsalEntrypoints';

describe('StagingRehearsalApprovalFactory', () => {
  it('blocks missing and expired approval', () => {
    expect(
      validateStagingRehearsalApproval(undefined, {
        environment: 'staging',
        flows: ['assessment'],
        entrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID],
        sampleRate: 1,
        maxExecutions: 1,
        now: now(),
      }).valid
    ).toBe(false);

    const expired = approval({ expiresAt: '2026-06-05T00:00:00.000Z' });
    expect(
      validateStagingRehearsalApproval(expired, {
        environment: 'staging',
        flows: ['assessment'],
        entrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID],
        sampleRate: 1,
        maxExecutions: 1,
        now: now(),
      }).reason
    ).toContain('expired');
  });

  it('cannot authorize production, live modes, output replacement, or raw payload capture', () => {
    expect(() => approval({ environment: 'production' })).toThrow(/production/i);
    expect(() => approval({ requestedScope: 'CANARY_LIVE' })).toThrow(/CANARY_LIVE|FULL_LIVE/);
    expect(() => approval({ requestedScope: 'FULL_LIVE' })).toThrow(/CANARY_LIVE|FULL_LIVE/);
    expect(() => approval({ allowOutputReplacement: true })).toThrow(/output replacement/i);
    expect(() => approval({ allowRawPayloadCapture: true })).toThrow(/raw payload/i);
  });

  it('must cover requested flows and entrypoints', () => {
    const record = approval({ allowedFlows: ['assessment'], allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID] });
    const validation = validateStagingRehearsalApproval(record, {
      environment: 'staging',
      flows: ['assessment', 'career-fit'],
      entrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
      sampleRate: 1,
      maxExecutions: 1,
      now: now(),
    });

    expect(validation.valid).toBe(false);
  });
});

function approval(overrides: Partial<Parameters<typeof createStagingRehearsalApproval>[0]> = {}) {
  return createStagingRehearsalApproval({
    runId: 'phase-5-8-approval-test',
    approvedBy: 'phase-5-8-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
    maxSampleRate: 1,
    maxExecutions: 60,
    reason: 'Phase 5.8 staging rehearsal approval test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
