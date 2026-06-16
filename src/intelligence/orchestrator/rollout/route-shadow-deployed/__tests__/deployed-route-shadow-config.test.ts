import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowConfig, DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG, readConfiguredBaseUrl } from '../DeployedRouteShadowConfig';

describe('DeployedRouteShadowConfig', () => {
  it('is disabled by default with no unknown host allowance', () => {
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.enabled).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.environment).toBe('unknown');
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.baseUrl).toBe('');
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowUnknownHost).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowProductionHost).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
  });

  it('normalizes and forcibly blocks forbidden flags', () => {
    const config = createDeployedRouteShadowConfig({
      enabled: true,
      environment: ' STAGING ',
      baseUrl: 'https://preview-careeros-staging.vercel.app',
      allowedHosts: ['PREVIEW-CAREEROS-STAGING.VERCEL.APP'],
      allowedRoutes: ['/a', '/a'],
      allowedFlows: ['assessment', 'assessment'],
      allowProductionHost: true,
      allowUnknownHost: true,
      allowLiveRouting: true,
      allowOutputReplacement: true,
      captureRawPayloads: true,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedHosts).toEqual(['preview-careeros-staging.vercel.app']);
    expect(config.allowedRoutes).toEqual(['/a']);
    expect(config.allowedFlows).toEqual(['assessment']);
    expect(config.allowProductionHost).toBe(false);
    expect(config.allowUnknownHost).toBe(false);
    expect(config.allowLiveRouting).toBe(false);
    expect(config.allowOutputReplacement).toBe(false);
    expect(config.captureRawPayloads).toBe(false);
  });

  it('reads only approved staging URL environment names', () => {
    expect(readConfiguredBaseUrl({ CAREEROS_STAGING_URL: 'https://preview-careeros-staging.vercel.app' })).toBe('https://preview-careeros-staging.vercel.app');
    expect(readConfiguredBaseUrl({ RANDOM_URL: 'https://preview-careeros-staging.vercel.app' })).toBeUndefined();
  });
});
