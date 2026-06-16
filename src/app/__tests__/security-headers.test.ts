import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';

describe('security headers', () => {
  it('defines staging-safe browser security headers', async () => {
    expect(nextConfig.headers).toBeDefined();
    const headerRules = await nextConfig.headers!();
    const headers = new Map(headerRules[0]?.headers.map((header) => [header.key, header.value]));
    const csp = headers.get('Content-Security-Policy') ?? '';
    const directives = parseCsp(csp);
    const clerkStagingFrontendApi = 'https://teaching-swine-10.clerk.accounts.dev';
    const cloudflareChallengesHost = 'https://challenges.cloudflare.com';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('*');
    expect(directives.get('script-src')).toEqual([
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      clerkStagingFrontendApi,
      cloudflareChallengesHost,
    ]);
    expect(directives.get('script-src')).not.toContain('https:');
    expect(directives.get('script-src-elem')).toEqual([
      "'self'",
      "'unsafe-inline'",
      clerkStagingFrontendApi,
      cloudflareChallengesHost,
    ]);
    expect(directives.get('connect-src')).toEqual(["'self'", clerkStagingFrontendApi]);
    expect(directives.get('img-src')).toEqual(["'self'", 'data:', 'blob:', 'https://img.clerk.com']);
    expect(directives.get('worker-src')).toEqual(["'self'", 'blob:']);
    expect(directives.get('frame-src')).toEqual(["'self'", cloudflareChallengesHost]);
    expect(directives.get('style-src')).toEqual(["'self'", "'unsafe-inline'"]);
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toContain('camera=()');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
  });
});

function parseCsp(csp: string): Map<string, string[]> {
  return new Map(
    csp
      .split(';')
      .map((directive) => directive.trim())
      .filter(Boolean)
      .map((directive) => {
        const [name, ...values] = directive.split(/\s+/);
        return [name, values] as const;
      })
  );
}
