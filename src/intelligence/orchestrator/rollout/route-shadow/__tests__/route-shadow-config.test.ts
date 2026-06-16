import { describe, expect, it } from 'vitest';
import { DEFAULT_ROUTE_SHADOW_CONFIG, createRouteShadowConfig } from '../RouteShadowConfig';

describe('RouteShadowConfig', () => {
  it('keeps route shadow disabled by default', () => {
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.enabled).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.allowedFlows).toEqual([]);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.requireManualApproval).toBe(true);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.allowProductionEnvironment).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
  });

  it('normalizes config and forcibly blocks forbidden safety flags', () => {
    const config = createRouteShadowConfig({
      enabled: true,
      environment: ' STAGING ',
      allowedEnvironments: ['STAGING', 'staging'],
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      captureRawPayloads: true,
      allowProductionEnvironment: true,
      allowLiveRouting: true,
      allowOutputReplacement: true,
      maxPayloadBytes: 12.8,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.captureRawPayloads).toBe(false);
    expect(config.allowProductionEnvironment).toBe(false);
    expect(config.allowLiveRouting).toBe(false);
    expect(config.allowOutputReplacement).toBe(false);
    expect(config.maxPayloadBytes).toBe(12);
  });
});
