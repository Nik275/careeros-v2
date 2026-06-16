import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../RolloutConfig';
import { RolloutPolicyEngine } from '../RolloutPolicyEngine';

describe('RolloutPolicyEngine', () => {
  it('blocks FULL_LIVE in this phase', () => {
    const decision = new RolloutPolicyEngine().evaluate({
      policy: createRolloutConfig({
        globalEnabled: true,
        allowedModes: ['DISABLED', 'FULL_LIVE'],
      }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'FULL_LIVE',
        flowPolicy: readyForLive(),
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasons.join(' ')).toContain('FULL_LIVE is blocked');
  });

  it('blocks CANARY_LIVE unless explicitly allowed', () => {
    const decision = new RolloutPolicyEngine().evaluate({
      policy: createRolloutConfig({
        globalEnabled: true,
        allowedModes: ['DISABLED', 'CANARY_LIVE'],
      }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'CANARY_LIVE',
        flowPolicy: readyForLive(),
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasons.join(' ')).toContain('CANARY_LIVE is blocked');
  });

  it('blocks live rollout when parity is missing', () => {
    const decision = new RolloutPolicyEngine().evaluate({
      policy: createRolloutConfig({
        globalEnabled: true,
        allowedModes: ['DISABLED', 'CANARY_LIVE'],
        explicitlyAllowCanaryLive: true,
      }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'CANARY_LIVE',
        flowPolicy: {
          ...readyForLive(),
          parityPassed: false,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasons.join(' ')).toContain('ParityGate');
  });

  it('blocks rollout when drift is unresolved', () => {
    const decision = new RolloutPolicyEngine().evaluate({
      policy: createRolloutConfig({ globalEnabled: true }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: true,
          unresolvedCriticalDrift: true,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasons.join(' ')).toContain('DriftGate');
  });

  it('blocks rollout when telemetry health is missing', () => {
    const decision = new RolloutPolicyEngine().evaluate({
      policy: createRolloutConfig({ globalEnabled: true }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: false,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasons.join(' ')).toContain('TelemetryHealthGate');
  });

  it('allows DRY_RUN_COMPARE only when observe mode and binding are available', () => {
    const engine = new RolloutPolicyEngine();
    const policy = createRolloutConfig({ globalEnabled: true });

    expect(
      engine.evaluate({
        policy,
        evaluation: {
          flow: 'career-fit',
          requestedMode: 'DRY_RUN_COMPARE',
          flowPolicy: {
            observeModeEnabled: true,
            bindingAvailable: true,
            telemetryHealthy: true,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      }).allowed
    ).toBe(true);

    expect(
      engine.evaluate({
        policy,
        evaluation: {
          flow: 'career-fit',
          requestedMode: 'DRY_RUN_COMPARE',
          flowPolicy: {
            observeModeEnabled: true,
            bindingAvailable: false,
            telemetryHealthy: true,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      }).allowed
    ).toBe(false);
  });

  it('allows OBSERVE_ONLY only when observe mode is enabled', () => {
    const engine = new RolloutPolicyEngine();
    const policy = createRolloutConfig({ globalEnabled: true });

    expect(
      engine.evaluate({
        policy,
        evaluation: {
          flow: 'assessment',
          requestedMode: 'OBSERVE_ONLY',
          flowPolicy: {
            observeModeEnabled: true,
            telemetryHealthy: true,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      }).allowed
    ).toBe(true);

    expect(
      engine.evaluate({
        policy,
        evaluation: {
          flow: 'assessment',
          requestedMode: 'OBSERVE_ONLY',
          flowPolicy: {
            observeModeEnabled: false,
            telemetryHealthy: true,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      }).allowed
    ).toBe(false);
  });
});

function readyForLive() {
  return {
    observeModeEnabled: true,
    bindingAvailable: true,
    parityPassed: true,
    telemetryHealthy: true,
    privacySafe: true,
    manualApprovalGranted: true,
    scopedTypeCheckPassed: true,
    testCoveragePassed: true,
  };
}
