import { describe, expect, it } from 'vitest';
import {
  createObserveModeConfig,
  createPayloadSnapshot,
  shouldSampleObserveMode,
} from '../ObserveModeConfig';

describe('observe-mode config', () => {
  it('is disabled by default', () => {
    const config = createObserveModeConfig();

    expect(config.enabled).toBe(false);
    expect(shouldSampleObserveMode(config, 0)).toBe(false);
  });

  it('applies sample rate behavior deterministically', () => {
    const config = createObserveModeConfig({
      enabled: true,
      sampleRate: 0.25,
    });

    expect(shouldSampleObserveMode(config, 0.1)).toBe(true);
    expect(shouldSampleObserveMode(config, 0.5)).toBe(false);
  });

  it('protects payload size by replacing oversized snapshots', () => {
    const snapshot = createPayloadSnapshot(
      {
        value: 'x'.repeat(100),
      },
      {
        capture: true,
        maxPayloadSize: 10,
      }
    );

    expect(snapshot).toMatchObject({
      omitted: true,
      reason: 'Payload exceeded observe-mode maxPayloadSize.',
    });
  });
});
