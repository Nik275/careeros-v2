import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  DEFAULT_ACTIVE_LEARNING_CONFIG,
  type ActiveLearningConfig,
  type ActiveLearningEngineConfig,
} from '../../../../active-learning';
import { createRouteShadowApproval } from '../../route-shadow/RouteShadowApprovalFactory';
import { DeploymentReadinessChecker } from '../DeploymentReadinessChecker';
import { evaluateDeploymentReadinessCIGate } from '../DeploymentReadinessCIGate';

describe('Phase 6.6.1 active-learning build unblock readiness', () => {
  it('keeps active-learning config aliases non-divergent for build readiness', () => {
    expectTypeOf<ActiveLearningConfig>().toEqualTypeOf<ActiveLearningEngineConfig>();
    expect(DEFAULT_ACTIVE_LEARNING_CONFIG.queries.batchSize).toBeGreaterThan(0);
  });

  it('reports build blockers honestly when build still fails', () => {
    const readiness = checker().check({
      env: validEnv(),
      config: { enabled: true },
      buildStatus: 'BUILD_BLOCKED_BY_TYPESCRIPT',
    });

    expect(readiness.activationDecision).toBe('BLOCKED_BY_BUILD');
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('build-not-ready');
  });

  it('keeps missing staging URL blocked without fake deployed smoke proof', () => {
    const readiness = checker().check({
      env: {},
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });
    const gate = evaluateDeploymentReadinessCIGate({ readiness });

    expect(readiness.stagingUrlConfigured).toBe(false);
    expect(readiness.deployedHttpRequestsSent).toBe(false);
    expect(gate.status).toBe('PASS_WITH_WARNINGS');
  });

  it('keeps CANARY_LIVE and FULL_LIVE blocked', () => {
    expect(() => approval('CANARY_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);
    expect(() => approval('FULL_LIVE')).toThrow(/CANARY_LIVE or FULL_LIVE/);
  });

  it('does not enable live routing or raw payload capture', () => {
    const readiness = checker().check({
      env: {
        ...validEnv(),
        CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true',
        CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true',
      },
      config: { enabled: true },
      buildStatus: 'BUILD_READY',
    });

    expect(readiness.liveRoutingEnabled).toBe(false);
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('live-routing-enabled');
    expect(readiness.failures.map((failure) => failure.failureId)).toContain('raw-payload-capture-enabled');
  });
});

function checker() {
  return new DeploymentReadinessChecker({ now: () => '2026-06-06T00:00:00.000Z' });
}

function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-6-1-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
  };
}

function approval(scope: 'CANARY_LIVE' | 'FULL_LIVE') {
  return createRouteShadowApproval({
    approvedBy: 'test',
    environment: 'staging',
    allowedFlows: ['assessment'],
    allowedRoutes: ['/api/internal/constitutional-shadow/assessment'],
    maxExecutions: 1,
    reason: 'Phase 6.6.1 live-mode block regression.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    requestedScope: scope,
  });
}
