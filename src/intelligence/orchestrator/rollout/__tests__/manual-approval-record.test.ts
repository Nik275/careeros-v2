import { describe, expect, it } from 'vitest';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';
import { isManualApprovalValid, validateManualApproval } from '../ManualApprovalRecord';

describe('ManualApprovalRecord', () => {
  it('blocks CANARY_SHADOW when no manual approval exists', () => {
    const result = validateManualApproval(undefined, {
      flow: 'assessment',
      sampleRate: 0.1,
      now: now(),
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('No manual approval');
  });

  it('accepts explicit CANARY_SHADOW approval scoped to the flow and sample rate', () => {
    expect(
      isManualApprovalValid(approval(), {
        flow: 'assessment',
        sampleRate: 0.1,
        now: now(),
      })
    ).toBe(true);
  });

  it('blocks expired manual approval', () => {
    const record = approval({
      expiresAt: '2026-06-05T00:00:00.000Z',
    });

    const result = validateManualApproval(record, {
      flow: 'assessment',
      sampleRate: 0.1,
      now: now(),
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expired');
  });

  it('does not approve live modes in Phase 5.5', () => {
    const result = validateManualApproval(approval(), {
      flow: 'assessment',
      sampleRate: 0.1,
      requestedScope: 'CANARY_LIVE',
      now: now(),
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Live rollout approvals');
  });
});

function approval(overrides: Partial<ManualApprovalRecord> = {}): ManualApprovalRecord {
  return {
    approvalId: 'approval-1',
    approvedBy: 'phase-5-5-test',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    scope: 'CANARY_SHADOW',
    flows: ['assessment', 'career-fit'],
    maxSampleRate: 0.5,
    reason: 'Phase 5.5 controlled shadow validation.',
    evidence: [
      {
        evidenceId: 'evidence-1',
        description: 'Expanded parity CI passed.',
        createdAt: now(),
        metadata: {},
      },
    ],
    status: 'APPROVED',
    ...overrides,
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
