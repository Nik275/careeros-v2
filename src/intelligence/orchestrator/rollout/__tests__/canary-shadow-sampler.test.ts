import { describe, expect, it } from 'vitest';
import { CanaryShadowSampler, deterministicSampleValue } from '../CanaryShadowSampler';

describe('CanaryShadowSampler', () => {
  it('is deterministic by request id', () => {
    const sampler = new CanaryShadowSampler({
      now: () => '2026-06-06T00:00:00.000Z',
    });

    const first = sampler.shouldSample({
      requestId: 'request-1',
      flow: 'assessment',
      sampleRate: 0.5,
      maxExecutionsPerMinute: 10,
    });
    const secondHash = deterministicSampleValue('assessment|request-1');

    expect(first.hashValue).toBe(secondHash);
  });

  it('uses random fallback when request id is unavailable', () => {
    const sampler = new CanaryShadowSampler({
      random: () => 0.1,
      now: () => '2026-06-06T00:00:00.000Z',
    });

    expect(
      sampler.shouldSample({
        flow: 'assessment',
        sampleRate: 0.5,
        maxExecutionsPerMinute: 10,
      }).selected
    ).toBe(true);
  });

  it('enforces max executions per minute by flow', () => {
    const sampler = new CanaryShadowSampler({
      now: () => '2026-06-06T00:00:00.000Z',
    });

    const first = sampler.shouldSample({
      requestId: 'request-a',
      flow: 'assessment',
      sampleRate: 1,
      maxExecutionsPerMinute: 1,
    });
    const second = sampler.shouldSample({
      requestId: 'request-b',
      flow: 'assessment',
      sampleRate: 1,
      maxExecutionsPerMinute: 1,
    });

    expect(first.selected).toBe(true);
    expect(second.selected).toBe(false);
    expect(second.reason).toContain('max executions');
  });

  it('stays disabled when sample rate or rate limit is zero', () => {
    const sampler = new CanaryShadowSampler();

    expect(
      sampler.shouldSample({
        requestId: 'request-1',
        flow: 'assessment',
        sampleRate: 0,
        maxExecutionsPerMinute: 10,
      }).selected
    ).toBe(false);
    expect(
      sampler.shouldSample({
        requestId: 'request-1',
        flow: 'assessment',
        sampleRate: 1,
        maxExecutionsPerMinute: 0,
      }).selected
    ).toBe(false);
  });
});
