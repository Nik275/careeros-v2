import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGING_SHADOW_RUN_CONFIG,
  createStagingShadowRunConfig,
} from '../StagingShadowRunConfig';

describe('StagingShadowRunConfig', () => {
  it('is disabled and impossible by default', () => {
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.enabled).toBe(false);
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.maxExecutionsPerFlow).toBe(0);
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.maxTotalExecutions).toBe(0);
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.requireManualApproval).toBe(true);
    expect(DEFAULT_STAGING_SHADOW_RUN_CONFIG.captureRawPayloads).toBe(false);
  });

  it('normalizes explicit staging configuration and still forbids raw payload capture', () => {
    const config = createStagingShadowRunConfig({
      enabled: true,
      environment: ' STAGING ',
      allowedEnvironments: ['STAGING', 'staging'],
      allowedFlows: ['assessment', 'career-fit', 'assessment'],
      sampleRate: 2,
      maxExecutionsPerFlow: 40.9,
      maxTotalExecutions: 80.2,
      captureRawPayloads: true,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.sampleRate).toBe(1);
    expect(config.maxExecutionsPerFlow).toBe(40);
    expect(config.maxTotalExecutions).toBe(80);
    expect(config.captureRawPayloads).toBe(false);
  });
});
