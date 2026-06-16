import { describe, expect, it } from 'vitest';
import { validateStagingUrl } from '../StagingUrlValidator';

describe('StagingUrlValidator', () => {
  it('blocks missing, empty, invalid, production, unknown, non-allowlisted, local, and unsupported URLs', () => {
    expect(validateStagingUrl({ baseUrl: '', allowedHosts: [] }).status).toBe('MISSING_URL');
    expect(validateStagingUrl({ baseUrl: 'not-a-url', allowedHosts: [] }).status).toBe('INVALID_URL');
    expect(validateStagingUrl({ baseUrl: 'https://app.careeros.com', allowedHosts: ['app.careeros.com'] }).status).toBe('UNSAFE_PRODUCTION_HOST');
    expect(validateStagingUrl({ baseUrl: 'https://random.example.net', allowedHosts: ['random.example.net'] }).status).toBe('UNSAFE_UNKNOWN_HOST');
    expect(validateStagingUrl({ baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: [] }).status).toBe('HOST_NOT_ALLOWLISTED');
    expect(validateStagingUrl({ baseUrl: 'http://localhost:3000', allowedHosts: ['localhost'] }).status).toBe('LOCAL_URL_NOT_DEPLOYED');
    expect(validateStagingUrl({ baseUrl: 'http://127.0.0.1:3000', allowedHosts: ['127.0.0.1'] }).status).toBe('LOCAL_URL_NOT_DEPLOYED');
    expect(validateStagingUrl({ baseUrl: 'ftp://staging.example.net', allowedHosts: ['staging.example.net'], allowedProtocols: ['ftp:'] }).status).toBe('UNSUPPORTED_PROTOCOL');
    expect(validateStagingUrl({ baseUrl: 'https://prod-careeros-staging.vercel.app', allowedHosts: ['prod-careeros-staging.vercel.app'] }).status).toBe('UNSAFE_PRODUCTION_HOST');
  });

  it('allows preview or staging hosts only when explicitly allowlisted', () => {
    const decision = validateStagingUrl({
      baseUrl: 'https://preview-careeros-staging.vercel.app',
      allowedHosts: ['preview-careeros-staging.vercel.app'],
    });

    expect(decision.valid).toBe(true);
    expect(decision.status).toBe('VALID_STAGING_URL');
  });
});
