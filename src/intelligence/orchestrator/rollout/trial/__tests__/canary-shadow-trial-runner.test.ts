import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../../RolloutConfig';
import { RolloutPolicyEngine } from '../../RolloutPolicyEngine';
import { createCanaryShadowTrialApproval } from '../CanaryShadowTrialApprovalFactory';
import { getCanaryShadowTrialDataset } from '../CanaryShadowTrialDataset';
import { createCanaryShadowTrialConfig } from '../CanaryShadowTrialConfig';
import { CanaryShadowTrialRunner } from '../CanaryShadowTrialRunner';

describe('CanaryShadowTrialRunner', () => {
  it('cannot run without manual approval', async () => {
    const result = await new CanaryShadowTrialRunner({ now }).run({
      config: healthyConfig(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.verdict).toBe('BLOCKED');
    expect(result.failures.map((failure) => failure.reason).join(' ')).toContain('No manual approval');
  });

  it('cannot run with expired approval', async () => {
    const approval = approvalRecord({
      expiresAt: '2026-06-05T00:00:00.000Z',
    });
    const result = await new CanaryShadowTrialRunner({ now }).run({
      config: healthyConfig(),
      approval,
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.failures.map((failure) => failure.reason).join(' ')).toContain('expired');
  });

  it('cannot run when kill switch, parity, privacy, or telemetry gates fail', async () => {
    const runner = new CanaryShadowTrialRunner({ now });
    const base = {
      config: healthyConfig(),
      approval: approvalRecord(),
    };

    expect((await runner.run({ ...base, gateInputs: { ...healthyGates(), killSwitchActive: true } })).status).toBe('BLOCKED');
    expect((await runner.run({ ...base, gateInputs: { ...healthyGates(), expandedParityCIGatePassed: false } })).status).toBe('BLOCKED');
    expect((await runner.run({ ...base, gateInputs: { ...healthyGates(), privacySafe: false } })).status).toBe('BLOCKED');
    expect((await runner.run({ ...base, gateInputs: { ...healthyGates(), telemetryHealthy: false } })).status).toBe('BLOCKED');
  });

  it('executes approved assessment and career-fit scenarios and records matches', async () => {
    const result = await new CanaryShadowTrialRunner({ now }).run({
      config: healthyConfig(),
      approval: approvalRecord(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.verdict).toBe('PASS');
    expect(result.metrics.executedScenarios).toBeGreaterThanOrEqual(50);
    expect(result.flowResults.some((entry) => entry.flow === 'assessment' && entry.executed)).toBe(true);
    expect(result.flowResults.some((entry) => entry.flow === 'career-fit' && entry.executed)).toBe(true);
    expect(result.metrics.matchedCount).toBe(result.metrics.executedScenarios);
    expect(result.productionOutputPreserved).toBe(true);
  });

  it('never mutates production output snapshots', async () => {
    const scenario = {
      ...getCanaryShadowTrialDataset()[0],
      productionOutputSnapshot: Object.freeze({ ...(getCanaryShadowTrialDataset()[0].productionOutputSnapshot as Record<string, unknown>) }),
    };
    const before = JSON.stringify(scenario.productionOutputSnapshot);

    const result = await new CanaryShadowTrialRunner({ now, scenarios: [scenario] }).run({
      config: createCanaryShadowTrialConfig({
        ...healthyConfig(),
        maxScenarios: 1,
      }),
      approval: approvalRecord({ flows: [scenario.flow] }),
      gateInputs: healthyGates(),
    });

    expect(JSON.stringify(scenario.productionOutputSnapshot)).toBe(before);
    expect(result.productionOutputPreserved).toBe(true);
  });

  it('records drift and failed results honestly', async () => {
    const [driftSource, failureSource] = getCanaryShadowTrialDataset().filter((scenario) => scenario.flow === 'assessment');
    const driftScenario = {
      ...driftSource,
      shadowOutput: {
        ...(driftSource.shadowOutput as Record<string, unknown>),
        confidence: {
          profileConfidence: 1,
          assessmentCompleteness: 1,
        },
      },
    };
    const failureScenario = {
      ...failureSource,
      forcedFailure: {
        failureId: 'forced-failure',
        scenarioId: failureSource.scenarioId,
        flow: failureSource.flow,
        reason: 'forced binding failure',
        severity: 'high' as const,
        occurredAt: now(),
        metadata: {},
      },
    };

    const result = await new CanaryShadowTrialRunner({ now, scenarios: [driftScenario, failureScenario] }).run({
      config: createCanaryShadowTrialConfig({
        enabled: true,
        trialId: 'trial-drift-failure',
        allowedFlows: ['assessment'],
        sampleRate: 1,
        maxScenarios: 2,
        maxExecutionsPerFlow: 10,
        maxLatencyMs: 1000,
        rollbackOnAnyCriticalDrift: false,
        rollbackOnAnyFailure: false,
      }),
      approval: approvalRecord({ flows: ['assessment'] }),
      gateInputs: healthyGates(),
    });

    expect(result.metrics.driftCount).toBe(1);
    expect(result.metrics.failedCount).toBe(1);
  });

  it('keeps CANARY_LIVE and FULL_LIVE blocked', () => {
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
          flow: 'assessment',
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

function healthyConfig() {
  return createCanaryShadowTrialConfig({
    enabled: true,
    trialId: 'phase-5-6-controlled-trial',
    allowedFlows: ['assessment', 'career-fit'],
    sampleRate: 1,
    maxScenarios: 60,
    maxExecutionsPerFlow: 40,
    maxLatencyMs: 1000,
  });
}

function healthyGates() {
  return {
    rolloutGateApproved: true,
    expandedParityCIGatePassed: true,
    privacySafe: true,
    telemetryHealthy: true,
    killSwitchActive: false,
    flowKillSwitchActive: false,
  };
}

function approvalRecord(overrides: Partial<Parameters<typeof createCanaryShadowTrialApproval>[0]> = {}) {
  return createCanaryShadowTrialApproval({
    trialId: 'phase-5-6-controlled-trial',
    approvedBy: 'phase-5-6-test',
    flows: ['assessment', 'career-fit'],
    maxSampleRate: 1,
    reason: 'Controlled Phase 5.6 synthetic shadow trial.',
    approvedAt: now(),
    ...overrides,
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
