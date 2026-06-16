import { describe, expect, it } from 'vitest';
import { DEFAULT_APP_REHEARSAL_CONFIG, createAppRehearsalConfig } from '../AppRehearsalConfig';

describe('AppRehearsalConfig', () => {
  it('keeps rehearsal disabled and impossible by default', () => {
    expect(DEFAULT_APP_REHEARSAL_CONFIG.enabled).toBe(false);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.maxExecutionsPerFlow).toBe(0);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.maxTotalExecutions).toBe(0);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.allowServiceFallback).toBe(false);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.requireAppLevelCoverage).toBe(true);
    expect(DEFAULT_APP_REHEARSAL_CONFIG.captureRawPayloads).toBe(false);
  });

  it('normalizes safety fields and never enables raw payload capture', () => {
    const config = createAppRehearsalConfig({
      environment: ' STAGING ',
      allowedEnvironments: ['STAGING', 'staging'],
      allowedFlows: ['assessment', 'assessment', 'career-fit'],
      sampleRate: 5,
      maxExecutionsPerFlow: 3.8,
      maxTotalExecutions: 99.2,
      captureRawPayloads: true,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.sampleRate).toBe(1);
    expect(config.maxExecutionsPerFlow).toBe(3);
    expect(config.maxTotalExecutions).toBe(99);
    expect(config.captureRawPayloads).toBe(false);
  });
});
