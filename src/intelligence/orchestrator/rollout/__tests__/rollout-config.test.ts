import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../RolloutConfig';

describe('RolloutConfig', () => {
  it('keeps rollout disabled by default', () => {
    const config = createRolloutConfig();

    expect(config.globalEnabled).toBe(false);
    expect(config.allowedModes).toEqual(['DISABLED', 'OBSERVE_ONLY', 'DRY_RUN_COMPARE']);
    expect(config.requireParityBeforeLive).toBe(true);
    expect(config.requireManualApproval).toBe(true);
    expect(config.killSwitchEnabled).toBe(true);
    expect(config.maxCanaryPercent).toBe(0);
    expect(config.rollbackOnDrift).toBe(true);
  });

  it('clamps canary percent to a safe range', () => {
    expect(createRolloutConfig({ maxCanaryPercent: 200 }).maxCanaryPercent).toBe(100);
    expect(createRolloutConfig({ maxCanaryPercent: -1 }).maxCanaryPercent).toBe(0);
  });
});
