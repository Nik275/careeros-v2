import { describe, expect, it } from 'vitest';
import { loadDeployedStagingEnvConfig } from '../DeployedStagingEnvConfig';

describe('DeployedStagingEnvConfig', () => {
  it('reports missing staging URL and missing approval fields honestly', () => {
    const result = loadDeployedStagingEnvConfig({});

    expect(result.valid).toBe(false);
    expect(result.validation.status).toBe('MISSING_URL');
    expect(result.summary.approvalPresent).toBe(false);
    expect(result.errors).toContain('CAREEROS_STAGING_SHADOW_BASE_URL is missing.');
  });

  it('loads a valid staging shadow env contract', () => {
    const result = loadDeployedStagingEnvConfig(validEnv());

    expect(result.valid).toBe(true);
    expect(result.validation.status).toBe('VALID_STAGING_URL');
    expect(result.summary.approvalPresent).toBe(true);
    expect(result.config.allowedRoutes).toEqual([
      '/api/internal/constitutional-shadow/assessment',
      '/api/internal/constitutional-shadow/career-fit',
    ]);
  });

  it('rejects live routing, output replacement, and raw payload env flags', () => {
    const result = loadDeployedStagingEnvConfig({
      ...validEnv(),
      CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true',
      CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'true',
      CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Live routing is forbidden for deployed staging shadow.');
    expect(result.errors).toContain('Output replacement is forbidden for deployed staging shadow.');
    expect(result.errors).toContain('Raw payload capture is forbidden for deployed staging shadow.');
    expect(result.config.allowLiveRouting).toBe(false);
    expect(result.config.allowOutputReplacement).toBe(false);
    expect(result.config.captureRawPayloads).toBe(false);
  });
});

export function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-4-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_MAX_REQUESTS: '2',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
  };
}
