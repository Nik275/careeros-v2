import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STAGING_REHEARSAL_CONFIG,
  createStagingRehearsalConfig,
} from '../StagingRehearsalConfig';
import { StagingRehearsalRunner } from '../StagingRehearsalRunner';

describe('StagingRehearsalConfig', () => {
  it('is disabled and impossible by default', () => {
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.enabled).toBe(false);
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.maxExecutionsPerFlow).toBe(0);
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.maxTotalExecutions).toBe(0);
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.requireManualApproval).toBe(true);
    expect(DEFAULT_STAGING_REHEARSAL_CONFIG.captureRawPayloads).toBe(false);
  });

  it('normalizes explicit config and keeps raw payload capture disabled', () => {
    const config = createStagingRehearsalConfig({
      enabled: true,
      environment: ' STAGING ',
      allowedEnvironments: ['STAGING', 'staging'],
      allowedFlows: ['assessment', 'career-fit', 'assessment'],
      allowedEntrypoints: ['a', 'a', 'b'],
      sampleRate: 2,
      maxExecutionsPerFlow: 30.9,
      maxTotalExecutions: 60.9,
      captureRawPayloads: true,
    });

    expect(config.environment).toBe('staging');
    expect(config.allowedEnvironments).toEqual(['staging']);
    expect(config.allowedFlows).toEqual(['assessment', 'career-fit']);
    expect(config.allowedEntrypoints).toEqual(['a', 'b']);
    expect(config.sampleRate).toBe(1);
    expect(config.captureRawPayloads).toBe(false);
  });

  it('blocks production and unknown environments through the rehearsal guard', async () => {
    const runner = new StagingRehearsalRunner({ now });

    expect((await runner.run({ config: { ...minimalConfig(), environment: 'production', allowedEnvironments: ['production'] } })).status).toBe('BLOCKED');
    expect((await runner.run({ config: { ...minimalConfig(), environment: 'unknown', allowedEnvironments: ['unknown'] } })).status).toBe('BLOCKED');
  });
});

function minimalConfig() {
  return createStagingRehearsalConfig({
    enabled: true,
    sampleRate: 1,
    maxExecutionsPerFlow: 1,
    maxTotalExecutions: 1,
    allowedFlows: ['assessment'],
    allowedEntrypoints: ['assessment-engine.processResponses.service-fallback'],
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
