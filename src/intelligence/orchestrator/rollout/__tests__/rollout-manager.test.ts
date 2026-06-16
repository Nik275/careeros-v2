import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../RolloutConfig';
import { RolloutKillSwitch } from '../RolloutKillSwitch';
import { RolloutManager } from '../RolloutManager';

describe('RolloutManager', () => {
  it('records auditable rollout decisions', () => {
    const manager = createOpenManager();

    const decision = manager.evaluate({
      flow: 'career-fit',
      requestedMode: 'DRY_RUN_COMPARE',
      flowPolicy: {
        observeModeEnabled: true,
        bindingAvailable: true,
        telemetryHealthy: true,
        privacySafe: true,
      },
    });

    expect(decision.allowed).toBe(true);
    expect(manager.getRecentDecisions(1)[0]?.decisionId).toBe(decision.decisionId);
    expect(manager.getAuditRecords()).toHaveLength(1);
  });

  it('does not mutate production output', () => {
    const manager = createOpenManager();
    const output = Object.freeze({ overallFitScore: 86 });

    manager.evaluate({
      flow: 'career-fit',
      requestedMode: 'DRY_RUN_COMPARE',
      flowPolicy: {
        observeModeEnabled: true,
        bindingAvailable: true,
        telemetryHealthy: true,
        privacySafe: true,
      },
      metadata: {
        productionOutput: output,
      },
    });

    expect(output).toEqual({ overallFitScore: 86 });
  });

  it('does not call legacy engines', () => {
    const source = RolloutManager.toString();

    expect(source).not.toContain('CareerFitEngine');
    expect(source).not.toContain('AssessmentEngine');
    expect(source).not.toContain('career-fit-engine');
    expect(source).not.toContain('assessment-engine');
  });

  it('applies global and per-flow kill switches', () => {
    const killSwitch = new RolloutKillSwitch({ activeByDefault: false });
    const manager = new RolloutManager({
      config: createRolloutConfig({ globalEnabled: true }),
      killSwitch,
    });

    killSwitch.activateFlow('career-fit', 'flow rollback');

    expect(
      manager.evaluate({
        flow: 'career-fit',
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: true,
          privacySafe: true,
        },
      }).allowed
    ).toBe(false);

    expect(
      manager.evaluate({
        flow: 'assessment',
        requestedMode: 'OBSERVE_ONLY',
        flowPolicy: {
          observeModeEnabled: true,
          telemetryHealthy: true,
          privacySafe: true,
        },
      }).allowed
    ).toBe(true);
  });
});

function createOpenManager(): RolloutManager {
  return new RolloutManager({
    config: createRolloutConfig({ globalEnabled: true }),
    killSwitch: new RolloutKillSwitch({ activeByDefault: false }),
    now: createClock(),
  });
}

function createClock(): () => string {
  let tick = 0;
  return () => {
    const date = new Date(Date.UTC(2026, 5, 6, 0, 0, tick));
    tick += 1;
    return date.toISOString();
  };
}
