import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';

describe('security headers', () => {
  it('defines staging-safe browser security headers', async () => {
    expect(nextConfig.headers).toBeDefined();
    const headerRules = await nextConfig.headers!();
    const headers = new Map(headerRules[0]?.headers.map((header) => [header.key, header.value]));

    expect(headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toContain('camera=()');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
  });
});
