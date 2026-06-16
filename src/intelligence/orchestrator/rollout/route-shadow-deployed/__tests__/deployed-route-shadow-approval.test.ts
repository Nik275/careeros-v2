import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowApproval, validateDeployedRouteShadowApproval } from '../DeployedRouteShadowApprovalFactory';

describe('DeployedRouteShadowApprovalFactory', () => {
  it('creates and validates a staging-only approval', () => {
    const approval = validApproval();
    const validation = validateDeployedRouteShadowApproval(approval, {
      environment: 'staging',
      baseUrl: approval.baseUrl,
      host: approval.allowedHosts[0],
      flow: 'assessment',
      routePath: '/api/internal/constitutional-shadow/assessment',
      now: '2026-06-06T00:00:00.000Z',
    });

    expect(validation.valid).toBe(true);
    expect(approval.manualApproval.scope).toBe('CANARY_SHADOW');
  });

  it('blocks production hosts and live scopes', () => {
    expect(() => validApproval({ baseUrl: 'https://app.careeros.com', allowedHosts: ['app.careeros.com'] })).toThrow(/unsafe deployed host/);
    expect(() => validApproval({ requestedScope: 'CANARY_LIVE' })).toThrow(/cannot authorize CANARY_LIVE or FULL_LIVE/);
    expect(validateDeployedRouteShadowApproval(undefined, {
      environment: 'staging',
      baseUrl: 'https://preview-careeros-staging.vercel.app',
      host: 'preview-careeros-staging.vercel.app',
      flow: 'assessment',
      routePath: '/api/internal/constitutional-shadow/assessment',
    }).valid).toBe(false);
  });
});

function validApproval(overrides: Partial<Parameters<typeof createDeployedRouteShadowApproval>[0]> = {}) {
  return createDeployedRouteShadowApproval({
    approvedBy: 'phase-6-3-test',
    environment: 'staging',
    baseUrl: 'https://preview-careeros-staging.vercel.app',
    allowedHosts: ['preview-careeros-staging.vercel.app'],
    allowedRoutes: ['/api/internal/constitutional-shadow/assessment'],
    allowedFlows: ['assessment'],
    maxRequests: 1,
    reason: 'Phase 6.3 approval test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    expiresAt: '2099-01-01T00:00:00.000Z',
    ...overrides,
  });
}

