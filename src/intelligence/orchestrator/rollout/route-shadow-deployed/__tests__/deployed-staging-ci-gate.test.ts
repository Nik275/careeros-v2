import { describe, expect, it } from 'vitest';
import { evaluateDeployedStagingCIGate } from '../DeployedStagingCIGate';
import type { DeployedRouteShadowRun } from '../DeployedRouteShadowTypes';

describe('DeployedStagingCIGate', () => {
  it('returns PASS_WITH_WARNINGS when URL is missing but no unsafe config exists', () => {
    const result = evaluateDeployedStagingCIGate({ env: {} });

    expect(result.status).toBe('PASS_WITH_WARNINGS');
    expect(result.stagingUrlConfigured).toBe(false);
  });

  it('fails unsafe hosts, live routing, and raw payload capture', () => {
    expect(evaluateDeployedStagingCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_BASE_URL: 'https://app.careeros.com', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'app.careeros.com' } }).status).toBe('FAIL');
    expect(evaluateDeployedStagingCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true' } }).status).toBe('FAIL');
    expect(evaluateDeployedStagingCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true' } }).status).toBe('FAIL');
  });

  it('blocks until smoke run is supplied, then passes when smoke run is safe', () => {
    expect(evaluateDeployedStagingCIGate({ env: validEnv() }).status).toBe('BLOCKED');
    expect(evaluateDeployedStagingCIGate({ env: validEnv(), smokeRun: safeSmokeRun() }).status).toBe('PASS');
  });
});

function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-4-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
  };
}

function safeSmokeRun(): DeployedRouteShadowRun {
  return {
    runId: 'run',
    executionMode: 'DEPLOYED_STAGING_HTTP',
    status: 'COMPLETED',
    verdict: 'PASS',
    feasibilityStatus: 'DEPLOYED_STAGING_SUPPORTED',
    baseUrlSummary: 'https://preview-careeros-staging.vercel.app',
    hostDecision: {
      allowed: true,
      status: 'DEPLOYED_STAGING_SUPPORTED',
      baseUrlSummary: 'https://preview-careeros-staging.vercel.app',
      host: 'preview-careeros-staging.vercel.app',
      protocol: 'https:',
      hostAllowlisted: true,
      productionLooking: false,
      localHost: false,
      reason: 'safe',
      evidence: [],
    },
    deployedHttpRequestsSent: true,
    routes: ['/api/internal/constitutional-shadow/assessment', '/api/internal/constitutional-shadow/career-fit'],
    results: [],
    metrics: {
      totalRoutes: 2,
      completedRoutes: 2,
      hookReachedCount: 2,
      matchedCount: 2,
      driftCount: 0,
      failedCount: 0,
      rollbackCount: 0,
      notComparableCount: 0,
      selfMirroredCount: 0,
      jsonSafeResponseCount: 2,
      liveRoutingEnabledCount: 0,
    },
    startedAt: '2026-06-06T00:00:00.000Z',
    completedAt: '2026-06-06T00:00:01.000Z',
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
}
