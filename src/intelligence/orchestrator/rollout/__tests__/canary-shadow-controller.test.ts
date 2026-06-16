import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../RolloutConfig';
import { RolloutPolicyEngine } from '../RolloutPolicyEngine';
import { CanaryShadowController } from '../CanaryShadowController';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import type { ManualApprovalRecord } from '../ManualApprovalRecord';

describe('CanaryShadowController', () => {
  it('blocks CANARY_SHADOW by default', () => {
    const decision = new CanaryShadowController({ now }).evaluate({
      requestId: 'request-1',
      flow: 'assessment',
    });

    expect(decision.status).toBe('DISABLED');
    expect(decision.approved).toBe(false);
  });

  it('blocks without manual approval', () => {
    const decision = controller('assessment').evaluate({
      ...readyInput('assessment'),
      manualApproval: undefined,
    });

    expect(decision.status).toBe('BLOCKED');
    expect(decision.reasons.join(' ')).toContain('ManualApprovalGate');
  });

  it('blocks when kill switch is active', () => {
    const decision = controller('assessment').evaluate({
      ...readyInput('assessment'),
      killSwitchActive: true,
    });

    expect(decision.status).toBe('BLOCKED');
    expect(decision.reasons.join(' ')).toContain('KillSwitchGate');
  });

  it('blocks when parity, privacy, or telemetry gates fail', () => {
    expect(controller('assessment').evaluate({
      ...readyInput('assessment'),
      expandedParityCIGatePassed: false,
    }).reasons.join(' ')).toContain('ParityGate');

    expect(controller('assessment').evaluate({
      ...readyInput('assessment'),
      privacySafe: false,
    }).reasons.join(' ')).toContain('PrivacyGate');

    expect(controller('assessment').evaluate({
      ...readyInput('assessment'),
      telemetryHealthy: false,
    }).reasons.join(' ')).toContain('TelemetryHealthGate');
  });

  it('blocks unapproved and unvalidated flows', () => {
    const decision = controller('assessment').evaluate({
      ...readyInput('assessment'),
      flow: 'future-simulation',
    });

    expect(decision.status).toBe('BLOCKED');
    expect(decision.reasons.join(' ')).toContain('ValidatedFlowGate');
    expect(decision.reasons.join(' ')).toContain('AllowedFlowGate');
  });

  it('approves assessment only when all CANARY_SHADOW gates pass', () => {
    const decision = controller('assessment').evaluate(readyInput('assessment'));

    expect(decision.status).toBe('ELIGIBLE');
    expect(decision.approved).toBe(true);
    expect(decision.sampleDecision?.selected).toBe(true);
  });

  it('approves career fit only when all CANARY_SHADOW gates pass', () => {
    const decision = controller('career-fit').evaluate(readyInput('career-fit'));

    expect(decision.status).toBe('ELIGIBLE');
    expect(decision.approved).toBe(true);
    expect(decision.sampleDecision?.selected).toBe(true);
  });

  it('keeps CANARY_LIVE and FULL_LIVE blocked by rollout policy', () => {
    const engine = new RolloutPolicyEngine({ now });
    const policy = createRolloutConfig({
      globalEnabled: true,
      allowedModes: ['DISABLED', 'CANARY_LIVE', 'FULL_LIVE'],
      explicitlyAllowCanaryLive: true,
    });

    for (const requestedMode of ['CANARY_LIVE', 'FULL_LIVE'] as const) {
      const decision = engine.evaluate({
        policy,
        evaluation: {
          flow: 'career-fit',
          requestedMode,
          flowPolicy: {
            observeModeEnabled: true,
            bindingAvailable: true,
            parityPassed: true,
            expandedParityCIGatePassed: true,
            telemetryHealthy: true,
            privacySafe: true,
            manualApprovalGranted: true,
            scopedTypeCheckPassed: true,
            testCoveragePassed: true,
            canaryPercent: 1,
          },
        },
        killSwitchActive: false,
        flowKillSwitchActive: false,
      });

      expect(decision.allowed).toBe(false);
    }
  });
});

function controller(flow: 'assessment' | 'career-fit'): CanaryShadowController {
  return new CanaryShadowController({
    config: createCanaryShadowConfig({
      globalShadowEnabled: true,
      allowedFlows: [flow],
      sampleRate: 1,
      maxExecutionsPerMinute: 10,
    }),
    now,
  });
}

function readyInput(flow: 'assessment' | 'career-fit') {
  return {
    requestId: `request-${flow}`,
    flow,
    manualApproval: approval(flow),
    rolloutGateApproved: true,
    expandedParityCIGatePassed: true,
    privacySafe: true,
    telemetryHealthy: true,
    killSwitchActive: false,
    flowKillSwitchActive: false,
  };
}

function approval(flow: 'assessment' | 'career-fit'): ManualApprovalRecord {
  return {
    approvalId: `approval-${flow}`,
    approvedBy: 'phase-5-5-test',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    scope: 'CANARY_SHADOW',
    flows: [flow],
    maxSampleRate: 1,
    reason: 'Controlled shadow test approval.',
    evidence: [],
    status: 'APPROVED',
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
