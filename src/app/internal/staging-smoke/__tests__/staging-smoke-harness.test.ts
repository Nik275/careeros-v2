import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  INTERNAL_STAGING_SMOKE_MIDDLEWARE_MATCHER,
  INTERNAL_STAGING_SMOKE_ROUTE_PREFIX,
  isInternalStagingSmokeRoutePath,
} from '../../../../security/internal-route-protection';
import {
  STAGING_SMOKE_HARNESS_PRIMARY_HOST,
  isStagingSmokeHarnessHost,
  stagingSmokeHarnessAllowedHosts,
} from '../../../../security/staging-smoke-harness';

describe('internal staging smoke harness contract', () => {
  it('is scoped to the hidden internal staging route', () => {
    expect(INTERNAL_STAGING_SMOKE_ROUTE_PREFIX).toBe('/internal/staging-smoke');
    expect(INTERNAL_STAGING_SMOKE_MIDDLEWARE_MATCHER).toBe('/internal/staging-smoke/:path*');
    expect(isInternalStagingSmokeRoutePath('/internal/staging-smoke')).toBe(true);
    expect(isInternalStagingSmokeRoutePath('/internal/staging-smoke/run')).toBe(true);
    expect(isInternalStagingSmokeRoutePath('/assessment')).toBe(false);
  });

  it('allows only the approved staging host and configured staging URL host', () => {
    expect(STAGING_SMOKE_HARNESS_PRIMARY_HOST).toBe('careeros-v2-inky.vercel.app');
    expect(isStagingSmokeHarnessHost('careeros-v2-inky.vercel.app')).toBe(true);
    expect(isStagingSmokeHarnessHost('careeros-v2-inky.vercel.app:443')).toBe(false);
    expect(isStagingSmokeHarnessHost('app.careeros.com')).toBe(false);
    expect(isStagingSmokeHarnessHost('localhost:3000')).toBe(false);
    expect(
      isStagingSmokeHarnessHost('preview-careeros-staging.vercel.app', stagingEnv('https://preview-careeros-staging.vercel.app'))
    ).toBe(true);
    expect(stagingSmokeHarnessAllowedHosts(stagingEnv('not-a-url'))).toEqual([STAGING_SMOKE_HARNESS_PRIMARY_HOST]);
  });

  it('is protected by the Clerk proxy and not linked from landing navigation', () => {
    const proxySource = readFileSync(join(process.cwd(), 'src', 'proxy.ts'), 'utf8');
    const landingSource = readFileSync(join(process.cwd(), 'src', 'app', 'page.tsx'), 'utf8');

    expect(proxySource).toContain("'/internal/staging-smoke'");
    expect(proxySource).toContain("'/internal/staging-smoke/:path*'");
    expect(proxySource).toContain('hasRouteShadowInternalAccessClaim');
    expect(proxySource).toContain('isStagingSmokeHarnessHost');
    expect(landingSource).not.toContain('/internal/staging-smoke');
  });

  it('does not expose raw payload fields in the client result table', () => {
    const clientSource = readFileSync(
      join(process.cwd(), 'src', 'app', 'internal', 'staging-smoke', 'StagingSmokeHarnessClient.tsx'),
      'utf8'
    );

    expect(clientSource).not.toContain('document.cookie');
    expect(clientSource).not.toContain('getToken');
    expect(clientSource).not.toContain('Authorization');
    expect(clientSource).not.toContain('rawBody');
  });
});

function stagingEnv(stagingUrl: string): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'test',
    NEXT_PUBLIC_STAGING_URL: stagingUrl,
  };
}
