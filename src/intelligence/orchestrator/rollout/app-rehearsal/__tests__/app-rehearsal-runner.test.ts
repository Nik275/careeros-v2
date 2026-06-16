import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../../RolloutConfig';
import { RolloutPolicyEngine } from '../../RolloutPolicyEngine';
import { createAppRehearsalApproval } from '../AppRehearsalApprovalFactory';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
} from '../AppRehearsalEntrypointAdapter';
import { createAppRehearsalConfig } from '../AppRehearsalConfig';
import { AppRehearsalRunner } from '../AppRehearsalRunner';

describe('AppRehearsalRunner', () => {
  it('blocks missing approval before execution', async () => {
    const result = await new AppRehearsalRunner({ now }).run({
      config: healthyConfig(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.verdict).toBe('BLOCKED');
    expect(result.failures.map((failure) => failure.reason).join(' ')).toContain('No app rehearsal approval');
  });

  it('blocks production and unknown environments', async () => {
    for (const environment of ['production', 'unknown']) {
      const result = await new AppRehearsalRunner({ now }).run({
        config: createAppRehearsalConfig({
          ...healthyConfig(),
          environment,
          allowedEnvironments: [environment],
        }),
        approval: approvalRecord(),
        gateInputs: healthyGates(),
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.verdict).toBe('BLOCKED');
    }
  });

  it('executes assessment and career-fit through selected app rehearsal alignment path', async () => {
    const result = await new AppRehearsalRunner({ now }).run({
      config: healthyConfig(),
      approval: approvalRecord(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.verdict).toBe('PASS_WITH_WARNINGS');
    expect(result.metrics.executedScenarios).toBe(80);
    expect(result.metrics.appLevelScenarios).toBe(80);
    expect(result.metrics.serviceLevelFallbackScenarios).toBe(0);
    expect(result.metrics.matchedCount).toBe(80);
    expect(result.metrics.appLevelCoverageRate).toBe(100);
    expect(result.metrics.serviceFallbackRate).toBe(0);
    expect(result.flowResults.some((entry) => entry.flow === 'assessment' && entry.hookReached)).toBe(true);
    expect(result.flowResults.some((entry) => entry.flow === 'career-fit' && entry.hookReached)).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
    expect(result.liveRoutingEnabled).toBe(false);
  });

  it('preserves production output for executed scenarios', async () => {
    const result = await new AppRehearsalRunner({ now }).run({
      config: createAppRehearsalConfig({ ...healthyConfig(), maxExecutionsPerFlow: 1, maxTotalExecutions: 2 }),
      approval: approvalRecord({ maxExecutions: 2 }),
      gateInputs: healthyGates(),
    });

    expect(result.flowResults.every((entry) => entry.productionOutputPreserved)).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
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
  return createAppRehearsalConfig({
    runId: 'phase-5-9-runner-test',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
    allowServiceFallback: false,
    requireAppLevelCoverage: true,
    sampleRate: 1,
    maxExecutionsPerFlow: 40,
    maxTotalExecutions: 80,
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

function approvalRecord(overrides: Partial<Parameters<typeof createAppRehearsalApproval>[0]> = {}) {
  return createAppRehearsalApproval({
    runId: 'phase-5-9-runner-test',
    approvedBy: 'phase-5-9-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
    allowServiceFallback: false,
    maxSampleRate: 1,
    maxExecutions: 80,
    reason: 'Phase 5.9 app rehearsal runner test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
