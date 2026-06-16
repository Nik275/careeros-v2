import { describe, expect, it } from 'vitest';
import { RolloutKillSwitch } from '../RolloutKillSwitch';

describe('RolloutKillSwitch', () => {
  it('defaults to disabled for safety', () => {
    const killSwitch = new RolloutKillSwitch();

    expect(killSwitch.isGlobalActive()).toBe(true);
    expect(killSwitch.getGlobalState().reason).toBe('safe default disabled');
  });

  it('can block all rollout modes globally', () => {
    const killSwitch = new RolloutKillSwitch({ activeByDefault: false });

    killSwitch.activateGlobal('emergency rollback');

    expect(killSwitch.isGlobalActive()).toBe(true);
    expect(killSwitch.getGlobalState().reason).toBe('emergency rollback');
  });

  it('can block only a single flow', () => {
    const killSwitch = new RolloutKillSwitch({ activeByDefault: false });

    killSwitch.activateFlow('career-fit', 'career-fit drift');

    expect(killSwitch.isGlobalActive()).toBe(false);
    expect(killSwitch.isFlowActive('career-fit')).toBe(true);
    expect(killSwitch.isFlowActive('assessment')).toBe(false);
  });
});
