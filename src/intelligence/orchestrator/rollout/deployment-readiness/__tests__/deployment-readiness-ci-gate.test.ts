import { describe, expect, it } from 'vitest';
import { DeploymentReadinessChecker } from '../DeploymentReadinessChecker';
import { evaluateDeploymentReadinessCIGate } from '../DeploymentReadinessCIGate';

describe('DeploymentReadinessCIGate', () => {
  it('returns PASS_WITH_WARNINGS when URL is missing but safely blocked', () => {
    const result = evaluateDeploymentReadinessCIGate({ env: {} });

    expect(result.status).toBe('PASS_WITH_WARNINGS');
  });

  it('fails unsafe host, live routing, and raw payload capture configs', () => {
    expect(evaluateDeploymentReadinessCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_BASE_URL: 'https://app.careeros.com', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'app.careeros.com' } }).status).toBe('FAIL');
    expect(evaluateDeploymentReadinessCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true' } }).status).toBe('FAIL');
    expect(evaluateDeploymentReadinessCIGate({ env: { ...validEnv(), CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true' } }).status).toBe('FAIL');
  });

  it('blocks safe configured staging URL until smoke passes', () => {
    const readiness = new DeploymentReadinessChecker({ now: () => '2026-06-06T00:00:00.000Z' }).check({ env: validEnv(), config: { enabled: true } });

    expect(evaluateDeploymentReadinessCIGate({ readiness }).status).toBe('BLOCKED');
    expect(evaluateDeploymentReadinessCIGate({ readiness, smokePassed: true }).status).toBe('PASS');
  });
});

function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-5-test',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
  };
}
