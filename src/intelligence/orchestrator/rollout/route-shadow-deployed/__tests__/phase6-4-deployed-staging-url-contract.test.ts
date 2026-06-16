import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Phase 6.4 deployed staging URL contract', () => {
  it('ships the staging shadow env template without secret values', () => {
    const templatePath = join(process.cwd(), '.env.staging.shadow.example');
    const content = readFileSync(templatePath, 'utf8');

    expect(existsSync(templatePath)).toBe(true);
    expect(content).toContain('CAREEROS_STAGING_SHADOW_BASE_URL=');
    expect(content).toContain('CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS=');
    expect(content).toContain('CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING=false');
    expect(content).toContain('Never use a production URL');
  });

  it('precheck exits nonzero when URL is missing and exits zero for valid approved config', () => {
    const missing = runScript('scripts/constitutional/verify-staging-shadow-url.ts', {});
    expect(missing.status).toBe(1);
    expect(missing.stdout + missing.stderr).toContain('MISSING_URL');

    const valid = runScript('scripts/constitutional/verify-staging-shadow-url.ts', validEnv());
    expect(valid.status).toBe(0);
    expect(valid.stdout).toContain('SAFE_STAGING_URL_READY');
  }, 20000);

  it('smoke script refuses to send requests when URL is missing or host is unsafe', () => {
    const missing = runScript('scripts/constitutional/run-deployed-staging-shadow-smoke.ts', {});
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('DEPLOYED_STAGING_URL_MISSING');

    const unsafe = runScript('scripts/constitutional/run-deployed-staging-shadow-smoke.ts', {
      ...validEnv(),
      CAREEROS_STAGING_SHADOW_BASE_URL: 'https://app.careeros.com',
      CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'app.careeros.com',
    });
    expect(unsafe.status).toBe(2);
    expect(unsafe.stderr).toContain('UNSAFE_PRODUCTION_HOST');
  }, 20000);
});

function runScript(scriptPath: string, env: Partial<NodeJS.ProcessEnv>) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npx';
  const args = process.platform === 'win32' ? ['/c', 'npx', 'tsx', scriptPath] : ['tsx', scriptPath];
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
