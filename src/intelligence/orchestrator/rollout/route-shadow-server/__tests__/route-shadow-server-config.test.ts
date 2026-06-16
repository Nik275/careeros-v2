import { describe, expect, it } from 'vitest';
import { DEFAULT_ROUTE_SHADOW_SERVER_CONFIG, createRouteShadowServerConfig, isAllowedRouteShadowServerHost } from '../RouteShadowServerConfig';

describe('RouteShadowServerConfig', () => {
  it('keeps the real server harness disabled by default', () => {
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.enabled).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.environment).toBe('unknown');
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.captureRawPayloads).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowProductionEnvironment).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowOutputReplacement).toBe(false);
  });

  it('normalizes config and forcibly blocks forbidden flags', () => {
    const config = createRouteShadowServerConfig({
      enabled: true,
      environment: ' STAGING ',
      port: 31630,
      allowedEnvironments: ['STAGING', 'staging'],
      allowedRoutes: ['/a', '/a'],
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      captureRawPayloads: true,
      allowProductionEnvironment: true,
      allowLiveRouting: true,
      allowOutputReplacement: true,
    });

    expect(config.environment).toBe('staging');
    expect(config.baseUrl).toBe('http://127.0.0.1:31630');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedRoutes).toEqual(['/a']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.captureRawPayloads).toBe(false);
    expect(config.allowProductionEnvironment).toBe(false);
    expect(config.allowLiveRouting).toBe(false);
    expect(config.allowOutputReplacement).toBe(false);
  });

  it('allows only local or explicitly staging-safe hosts', () => {
    expect(isAllowedRouteShadowServerHost('http://127.0.0.1:3000')).toBe(true);
    expect(isAllowedRouteShadowServerHost('http://localhost:3000')).toBe(true);
    expect(isAllowedRouteShadowServerHost('https://qa.staging.careeros.local')).toBe(true);
    expect(isAllowedRouteShadowServerHost('https://careeros.com')).toBe(false);
    expect(isAllowedRouteShadowServerHost('not-a-url')).toBe(false);
  });
});

