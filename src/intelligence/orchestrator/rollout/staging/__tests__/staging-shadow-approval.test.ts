import { describe, expect, it } from 'vitest';
import {
  createStagingShadowApproval,
  validateStagingShadowApproval,
} from '../StagingShadowApprovalFactory';

describe('StagingShadowApprovalFactory', () => {
  it('blocks missing and expired approvals', () => {
    expect(
      validateStagingShadowApproval(undefined, {
        environment: 'staging',
        flows: ['assessment'],
        sampleRate: 1,
        maxExecutions: 1,
        now: now(),
      }).valid
    ).toBe(false);

    const expired = approval({ expiresAt: '2026-06-05T00:00:00.000Z' });
    expect(
      validateStagingShadowApproval(expired, {
        environment: 'staging',
        flows: ['assessment'],
        sampleRate: 1,
        maxExecutions: 1,
        now: now(),
      }).reason
    ).toContain('expired');
  });

  it('cannot authorize production', () => {
    expect(() => approval({ environment: 'production' })).toThrow(/production/i);
  });

  it('cannot authorize CANARY_LIVE or FULL_LIVE', () => {
    expect(() => approval({ requestedScope: 'CANARY_LIVE' })).toThrow(/CANARY_LIVE|FULL_LIVE/);
    expect(() => approval({ requestedScope: 'FULL_LIVE' })).toThrow(/CANARY_LIVE|FULL_LIVE/);
  });

  it('requires explicit assessment or career-fit flow coverage', () => {
    const record = approval({ allowedFlows: ['assessment'], maxExecutions: 10 });
    const validation = validateStagingShadowApproval(record, {
      environment: 'staging',
      flows: ['assessment', 'career-fit'],
      sampleRate: 1,
      maxExecutions: 10,
      now: now(),
    });

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('flow');
  });
});

function approval(overrides: Partial<Parameters<typeof createStagingShadowApproval>[0]> = {}) {
  return createStagingShadowApproval({
    runId: 'phase-5-7-approval-test',
    approvedBy: 'phase-5-7-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'],
    maxSampleRate: 1,
    maxExecutions: 80,
    reason: 'Phase 5.7 staging approval test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
