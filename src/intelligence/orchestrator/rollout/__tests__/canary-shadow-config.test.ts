import { describe, expect, it } from 'vitest';
import { createCanaryShadowConfig, DEFAULT_CANARY_SHADOW_CONFIG } from '../CanaryShadowConfig';

describe('CanaryShadowConfig', () => {
  it('keeps CANARY_SHADOW disabled by default', () => {
    const config = createCanaryShadowConfig();

    expect(config.globalShadowEnabled).toBe(false);
    expect(config.allowedFlows).toEqual([]);
    expect(config.sampleRate).toBe(0);
    expect(config.maxExecutionsPerMinute).toBe(0);
    expect(config.requireManualApproval).toBe(true);
    expect(config.killSwitchRequired).toBe(true);
    expect(config.capturePayloadSummaries).toBe(false);
  });

  it('clamps sampling values and freezes allowed flows', () => {
    const config = createCanaryShadowConfig({
      globalShadowEnabled: true,
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      sampleRate: 2,
      maxExecutionsPerMinute: 1.8,
      maxLatencyMs: -1,
    });

    expect(config.sampleRate).toBe(1);
    expect(config.maxExecutionsPerMinute).toBe(1);
    expect(config.maxLatencyMs).toBe(0);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(Object.isFrozen(config.allowedFlows)).toBe(true);
  });

  it('keeps the exported defaults cold', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.allowedFlows).toEqual([]);
  });
});
