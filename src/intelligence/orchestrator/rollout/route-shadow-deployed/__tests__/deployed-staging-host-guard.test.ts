import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowConfig } from '../DeployedRouteShadowConfig';
import { DeployedStagingHostGuard } from '../DeployedStagingHostGuard';

describe('DeployedStagingHostGuard', () => {
  it('blocks empty, invalid, local, production, unknown, and non-http hosts', () => {
    const guard = new DeployedStagingHostGuard();
    const cases = [
      '',
      'not-a-url',
      'http://127.0.0.1:3000',
      'https://app.careeros.com',
      'https://unknown.example.net',
      'ftp://staging.example.net',
    ];

    for (const baseUrl of cases) {
      const decision = guard.evaluate(createDeployedRouteShadowConfig({ enabled: true, environment: 'staging', baseUrl, allowedHosts: ['preview-careeros-staging.vercel.app'] }));
      expect(decision.allowed).toBe(false);
    }
  });

  it('allows explicitly allowlisted staging or preview hosts', () => {
    const decision = new DeployedStagingHostGuard().evaluate(
      createDeployedRouteShadowConfig({
        enabled: true,
        environment: 'staging',
        baseUrl: 'https://preview-careeros-staging.vercel.app',
        allowedHosts: ['preview-careeros-staging.vercel.app'],
      })
    );

    expect(decision.allowed).toBe(true);
    expect(decision.status).toBe('DEPLOYED_STAGING_SUPPORTED');
  });
});

