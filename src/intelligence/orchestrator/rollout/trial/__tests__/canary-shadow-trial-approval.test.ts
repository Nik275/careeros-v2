import { describe, expect, it } from 'vitest';
import { validateManualApproval } from '../../ManualApprovalRecord';
import { createCanaryShadowTrialApproval } from '../CanaryShadowTrialApprovalFactory';

describe('CanaryShadowTrialApprovalFactory', () => {
  it('creates explicit expiring CANARY_SHADOW approvals with parity evidence', () => {
    const approval = createCanaryShadowTrialApproval({
      trialId: 'trial-1',
      approvedBy: 'phase-5-6-test',
      flows: ['assessment', 'career-fit'],
      maxSampleRate: 0.25,
      reason: 'Controlled synthetic trial.',
      approvedAt: now(),
    });

    expect(approval.scope).toBe('CANARY_SHADOW');
    expect(approval.flows).toEqual(['assessment', 'career-fit']);
    expect(approval.expiresAt).not.toBe(approval.approvedAt);
    expect(approval.evidence[0].metadata.parityEvidenceReference).toBeDefined();
    expect(validateManualApproval(approval, {
      flow: 'assessment',
      sampleRate: 0.25,
      now: now(),
    }).valid).toBe(true);
  });

  it('does not approve live modes', () => {
    const approval = createCanaryShadowTrialApproval({
      trialId: 'trial-1',
      approvedBy: 'phase-5-6-test',
      flows: ['assessment'],
      maxSampleRate: 1,
      reason: 'Controlled synthetic trial.',
      approvedAt: now(),
    });

    expect(validateManualApproval(approval, {
      flow: 'assessment',
      sampleRate: 0.1,
      requestedScope: 'CANARY_LIVE',
      now: now(),
    }).valid).toBe(false);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
