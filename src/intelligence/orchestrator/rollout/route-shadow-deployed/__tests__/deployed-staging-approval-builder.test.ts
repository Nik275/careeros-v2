import { describe, expect, it } from 'vitest';
import { buildDeployedStagingApproval } from '../DeployedStagingApprovalBuilder';
import { loadDeployedStagingEnvConfig } from '../DeployedStagingEnvConfig';

describe('DeployedStagingApprovalBuilder', () => {
  it('builds approval bound to exact host, URL, routes, and flows', () => {
    const result = buildDeployedStagingApproval(loadDeployedStagingEnvConfig(validEnv()), { now: '2026-06-06T00:00:00.000Z' });

    expect(result.valid).toBe(true);
    expect(result.status).toBe('APPROVAL_READY');
    expect(result.approval?.baseUrl).toBe('https://preview-careeros-staging.vercel.app');
    expect(result.approval?.allowedHosts).toEqual(['preview-careeros-staging.vercel.app']);
    expect(result.approval?.allowedFlows).toEqual(['assessment', 'career-fit']);
  });

  it('blocks missing, host-mismatched, expired, and unsafe approval configs', () => {
    expect(buildDeployedStagingApproval(loadDeployedStagingEnvConfig({ ...validEnv(), CAREEROS_STAGING_SHADOW_APPROVAL_ID: '' })).status).toBe('APPROVAL_MISSING');
    expect(buildDeployedStagingApproval(loadDeployedStagingEnvConfig({ ...validEnv(), CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'different-preview.vercel.app' })).status).toBe('APPROVAL_CONFIG_UNSAFE');
    expect(buildDeployedStagingApproval(loadDeployedStagingEnvConfig({ ...validEnv(), CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2026-06-05T00:00:00.000Z' }), { now: '2026-06-06T00:00:00.000Z' }).status).toBe('APPROVAL_EXPIRED');
    expect(buildDeployedStagingApproval(loadDeployedStagingEnvConfig({ ...validEnv(), CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'production' })).status).toBe('APPROVAL_ENVIRONMENT_BLOCKED');
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
  };
}
