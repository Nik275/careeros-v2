import { describe, expect, it } from 'vitest';
import { DeploymentReadinessChecker } from '../DeploymentReadinessChecker';

describe('DeploymentReadinessChecker', () => {
  it('reports missing staging URL, hosts, and approval honestly without HTTP', () => {
    const result = checker().check({ env: {}, config: { enabled: true } });

    expect(result.stagingUrlConfigured).toBe(false);
    expect(result.allowedHostsConfigured).toBe(false);
    expect(result.approvalConfigured).toBe(false);
    expect(result.deployedHttpRequestsSent).toBe(false);
    expect(result.failures.map((failure) => failure.failureId)).toContain('missing-staging-url');
  });

  it('blocks production, unknown, production hosts, unknown hosts, localhost, and unsafe flags', () => {
    const cases = [
      { ...validEnv(), CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'production' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'unknown' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_BASE_URL: 'https://app.careeros.com', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'app.careeros.com' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_BASE_URL: 'https://unknown.example.net', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'unknown.example.net' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_BASE_URL: 'http://localhost:3000', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'localhost' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'true' },
      { ...validEnv(), CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true' },
    ];

    for (const env of cases) {
      const result = checker().check({ env, config: { enabled: true } });
      expect(['BLOCKED', 'FAILED']).toContain(result.status);
      expect(result.deployedHttpRequestsSent).toBe(false);
      expect(result.liveRoutingEnabled).toBe(false);
    }
  });

  it('validates required route and script files exist for safe config', () => {
    const result = checker().check({ env: validEnv(), config: { enabled: true } });

    expect(result.missingRoutes).toEqual([]);
    expect(result.precheckScriptExists).toBe(true);
    expect(result.smokeScriptExists).toBe(true);
    expect(result.envExampleExists).toBe(true);
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
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-5-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
  };
}
