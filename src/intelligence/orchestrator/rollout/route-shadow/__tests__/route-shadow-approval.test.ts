import { describe, expect, it } from 'vitest';
import { createRouteShadowApproval, validateRouteShadowApproval } from '../RouteShadowApprovalFactory';
import { ASSESSMENT_ROUTE_SHADOW_PATH } from '../RouteShadowSyntheticPayloads';

describe('RouteShadowApprovalFactory', () => {
  it('blocks missing and expired approval', () => {
    expect(
      validateRouteShadowApproval(undefined, {
        environment: 'staging',
        flow: 'assessment',
        routePath: ASSESSMENT_ROUTE_SHADOW_PATH,
      }).valid
    ).toBe(false);

    const expired = createRouteShadowApproval({
      ...approvalInput(),
      expiresAt: '2026-06-05T00:00:00.000Z',
    });
    expect(
      validateRouteShadowApproval(expired, {
        environment: 'staging',
        flow: 'assessment',
        routePath: ASSESSMENT_ROUTE_SHADOW_PATH,
        now: now(),
      }).valid
    ).toBe(false);
  });

  it('cannot authorize production, live modes, output replacement, raw payloads, or real student data', () => {
    expect(() => createRouteShadowApproval({ ...approvalInput(), environment: 'production' })).toThrow(/production/);
    expect(() => createRouteShadowApproval({ ...approvalInput(), requestedScope: 'CANARY_LIVE' })).toThrow(/CANARY_LIVE/);
    expect(() => createRouteShadowApproval({ ...approvalInput(), requestedScope: 'FULL_LIVE' })).toThrow(/FULL_LIVE/);
    expect(() => createRouteShadowApproval({ ...approvalInput(), allowOutputReplacement: true })).toThrow(/output replacement/);
    expect(() => createRouteShadowApproval({ ...approvalInput(), allowRawPayloadCapture: true })).toThrow(/raw payload/);
    expect(() => createRouteShadowApproval({ ...approvalInput(), allowRealStudentData: true })).toThrow(/real student data/);
  });

  it('validates staging CANARY_SHADOW approval', () => {
    const approval = createRouteShadowApproval(approvalInput());
    const validation = validateRouteShadowApproval(approval, {
      environment: 'staging',
      flow: 'assessment',
      routePath: ASSESSMENT_ROUTE_SHADOW_PATH,
      now: now(),
    });

    expect(validation.valid).toBe(true);
    expect(approval.manualApproval.scope).toBe('CANARY_SHADOW');
  });
});

function approvalInput() {
  return {
    approvedBy: 'phase-6-0-test',
    environment: 'staging',
    allowedFlows: ['assessment'] as const,
    allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_PATH],
    maxExecutions: 1,
    reason: 'Route shadow approval test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
