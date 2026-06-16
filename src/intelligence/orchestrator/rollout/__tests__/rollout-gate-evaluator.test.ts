import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../RolloutConfig';
import { RolloutGateEvaluator } from '../RolloutGateEvaluator';

describe('RolloutGateEvaluator', () => {
  it('implements all required rollout gates', () => {
    const gates = new RolloutGateEvaluator().evaluate({
      policy: createRolloutConfig({ globalEnabled: true }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: true,
          privacySafe: true,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(gates.map((gate) => gate.gateName)).toEqual([
      'KillSwitchGate',
      'ParityGate',
      'DriftGate',
      'FailureRateGate',
      'LatencyGate',
      'TelemetryHealthGate',
      'PrivacyGate',
      'ManualApprovalGate',
      'ScopedTypeCheckGate',
      'TestCoverageGate',
    ]);
  });

  it('blocks unsafe payload capture through the privacy gate', () => {
    const gates = new RolloutGateEvaluator().evaluate({
      policy: createRolloutConfig({ globalEnabled: true }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'DRY_RUN_COMPARE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: true,
          privacySafe: false,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(gates.find((gate) => gate.gateName === 'PrivacyGate')).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('blocks live rollout at the manual approval gate', () => {
    const gates = new RolloutGateEvaluator().evaluate({
      policy: createRolloutConfig({ globalEnabled: true, requireManualApproval: true }),
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'CANARY_LIVE',
        flowPolicy: {
          observeModeEnabled: true,
          bindingAvailable: true,
          telemetryHealthy: true,
          parityPassed: true,
          privacySafe: true,
          manualApprovalGranted: false,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(gates.find((gate) => gate.gateName === 'ManualApprovalGate')).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });
  });

  it('requires expanded parity for canary shadow and keeps live modes blocked', () => {
    const evaluator = new RolloutGateEvaluator();
    const policy = createRolloutConfig({ globalEnabled: true });

    const shadowGates = evaluator.evaluate({
      policy,
      evaluation: {
        flow: 'career-fit',
        requestedMode: 'CANARY_SHADOW',
        flowPolicy: {
          expandedParityCIGatePassed: false,
          telemetryHealthy: true,
          privacySafe: true,
        },
      },
      killSwitchActive: false,
      flowKillSwitchActive: false,
    });

    expect(shadowGates.find((gate) => gate.gateName === 'ParityGate')).toMatchObject({
      status: 'BLOCKED',
      blocking: true,
    });

    for (const requestedMode of ['CANARY_LIVE', 'FULL_LIVE'] as const) {
      const liveGates = evaluator.evaluate({
        policy,
        evaluation: {
          flow: 'career-fit',
          requestedMode,
          flowPolicy: {
            expandedParityCIGatePassed: true,
            parityPassed: true,
            telemetryHealthy: true,
            privacySafe: true,
            manualApprovalGranted: true,
            scopedTypeCheckPassed: true,
            testCoveragePassed: true,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      });

      expect(liveGates.find((gate) => gate.gateName === 'ParityGate')).toMatchObject({
        status: 'BLOCKED',
        blocking: true,
      });
    }
  });
});
