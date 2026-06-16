import { describe, expect, it } from 'vitest';
import {
  createCanaryShadowTrialConfig,
  DEFAULT_CANARY_SHADOW_TRIAL_CONFIG,
} from '../CanaryShadowTrialConfig';

describe('CanaryShadowTrialConfig', () => {
  it('keeps trial mode disabled by default', () => {
    const config = createCanaryShadowTrialConfig();

    expect(config.enabled).toBe(false);
    expect(config.sampleRate).toBe(0);
    expect(config.maxScenarios).toBe(0);
    expect(config.requireManualApproval).toBe(true);
    expect(config.requireParityGate).toBe(true);
    expect(config.requirePrivacyGate).toBe(true);
    expect(config.requireTelemetryHealth).toBe(true);
    expect(config.requireKillSwitchInactive).toBe(true);
    expect(config.capturePayloadSummaries).toBe(false);
    expect(config.captureRawPayloads).toBe(false);
  });

  it('clamps sample rate and prevents raw payload capture', () => {
    const config = createCanaryShadowTrialConfig({
      enabled: true,
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      sampleRate: 2,
      maxScenarios: 50.8,
      maxExecutionsPerFlow: 30.2,
      captureRawPayloads: true,
    });

    expect(config.sampleRate).toBe(1);
    expect(config.maxScenarios).toBe(50);
    expect(config.maxExecutionsPerFlow).toBe(30);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.captureRawPayloads).toBe(false);
  });

  it('keeps exported defaults cold', () => {
    expect(DEFAULT_CANARY_SHADOW_TRIAL_CONFIG.enabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_TRIAL_CONFIG.sampleRate).toBe(0);
  });
});
