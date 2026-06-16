import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('Phase 6.5 staging activation script', () => {
  it('exits nonzero without calling deployed smoke when staging URL is missing', () => {
    const result = runReadinessScript({});

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('STAGING_URL_MISSING');
    expect(result.stdout).toContain('"deployedHttpRequestsSent": false');
  }, 20000);

  it('exits zero only when the staging URL contract is complete and safe', () => {
    const result = runReadinessScript(validEnv());

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('READY_FOR_DEPLOYED_SMOKE');
  }, 20000);
});

function runReadinessScript(env: Partial<NodeJS.ProcessEnv>) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const args = process.platform === 'win32' ? ['/c', 'npx', 'tsx', 'scripts/constitutional/check-staging-deployment-readiness.ts'] : ['tsx', 'scripts/constitutional/check-staging-deployment-readiness.ts'];
  return spawnSync(command, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CAREEROS_STAGING_SHADOW_BASE_URL: '',
      CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: '',
      CAREEROS_STAGING_SHADOW_ENVIRONMENT: '',
      CAREEROS_STAGING_SHADOW_APPROVAL_ID: '',
      CAREEROS_STAGING_SHADOW_APPROVED_BY: '',
      CAREEROS_STAGING_SHADOW_APPROVAL_REASON: '',
      CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '',
      CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: '',
      CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: '',
      CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: '',
      ...env,
    },
    encoding: 'utf8',
  });
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
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
  };
}
