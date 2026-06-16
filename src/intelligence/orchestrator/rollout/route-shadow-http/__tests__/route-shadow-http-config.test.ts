import { describe, expect, it } from 'vitest';
import { DEFAULT_ROUTE_SHADOW_HTTP_CONFIG, createRouteShadowHttpConfig } from '../RouteShadowHttpConfig';

describe('RouteShadowHttpConfig', () => {
  it('keeps HTTP route shadow disabled by default', () => {
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.enabled).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.environment).toBe('unknown');
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.executionMode).toBe('ROUTE_HANDLER_REQUEST_SIMULATION');
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowedRoutes).toEqual([]);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowedFlows).toEqual([]);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.requireManualApproval).toBe(true);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.requireSyntheticMarker).toBe(true);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.captureRawPayloads).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowProductionEnvironment).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowOutputReplacement).toBe(false);
  });

  it('normalizes config and forcibly blocks forbidden flags', () => {
    const config = createRouteShadowHttpConfig({
      enabled: true,
      environment: ' STAGING ',
      allowedEnvironments: ['STAGING', 'staging'],
      allowedRoutes: ['/a', '/a'],
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      captureRawPayloads: true,
      allowProductionEnvironment: true,
      allowLiveRouting: true,
      allowOutputReplacement: true,
      maxPayloadBytes: 9.9,
      maxRequestsPerRoute: 2.8,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedRoutes).toEqual(['/a']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.captureRawPayloads).toBe(false);
    expect(config.allowProductionEnvironment).toBe(false);
    expect(config.allowLiveRouting).toBe(false);
    expect(config.allowOutputReplacement).toBe(false);
    expect(config.maxPayloadBytes).toBe(9);
    expect(config.maxRequestsPerRoute).toBe(2);
  });
});

