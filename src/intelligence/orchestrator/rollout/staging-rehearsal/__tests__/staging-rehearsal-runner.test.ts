import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../../RolloutConfig';
import { RolloutPolicyEngine } from '../../RolloutPolicyEngine';
import { createStagingRehearsalApproval } from '../StagingRehearsalApprovalFactory';
import { getStagingRehearsalDataset } from '../StagingRehearsalDataset';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  CAREER_FIT_SERVICE_ENTRYPOINT_ID,
} from '../StagingRehearsalEntrypoints';
import { createStagingRehearsalConfig } from '../StagingRehearsalConfig';
import { StagingRehearsalRunner } from '../StagingRehearsalRunner';

describe('StagingRehearsalRunner', () => {
  it('blocks missing approval before execution', async () => {
    const result = await new StagingRehearsalRunner({ now }).run({
      config: healthyConfig(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.verdict).toBe('BLOCKED');
    expect(result.failures.map((failure) => failure.reason).join(' ')).toContain('No staging rehearsal approval');
  });

  it('executes assessment and career-fit through selected service-level fallback entrypoints', async () => {
    const result = await new StagingRehearsalRunner({ now }).run({
      config: healthyConfig(),
      approval: approvalRecord(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.verdict).toBe('PASS_WITH_WARNINGS');
    expect(result.metrics.executedScenarios).toBe(60);
    expect(result.metrics.serviceLevelFallbackScenarios).toBe(60);
    expect(result.metrics.appLevelScenarios).toBe(0);
    expect(result.metrics.matchedCount).toBe(60);
    expect(result.metrics.hookReachabilityRate).toBe(100);
    expect(result.flowResults.some((entry) => entry.flow === 'assessment' && entry.hookReached)).toBe(true);
    expect(result.flowResults.some((entry) => entry.flow === 'career-fit' && entry.hookReached)).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
    expect(result.liveRoutingEnabled).toBe(false);
  });

  it('preserves production output and records rollback on unsafe rehearsal failures', async () => {
    const scenario = { ...getStagingRehearsalDataset()[0], forcedMode: 'hook-not-reached' as const };
    const result = await new StagingRehearsalRunner({ now }).run({
      config: createStagingRehearsalConfig({
        ...healthyConfig(),
        allowedFlows: [scenario.flow],
        allowedEntrypoints: [scenario.entrypoint.entrypointId],
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
      }),
      approval: approvalRecord({
        allowedFlows: [scenario.flow],
        allowedEntrypoints: [scenario.entrypoint.entrypointId],
        maxExecutions: 1,
      }),
      gateInputs: healthyGates(),
      scenarios: [scenario],
    });

    expect(result.productionOutputPreserved).toBe(true);
    expect(result.metrics.failedCount).toBe(1);
    expect(result.metrics.rollbackCount).toBe(1);
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
  return createStagingRehearsalConfig({
    runId: 'phase-5-8-runner-test',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
    sampleRate: 1,
    maxExecutionsPerFlow: 30,
    maxTotalExecutions: 60,
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

function approvalRecord(overrides: Partial<Parameters<typeof createStagingRehearsalApproval>[0]> = {}) {
  return createStagingRehearsalApproval({
    runId: 'phase-5-8-runner-test',
    approvedBy: 'phase-5-8-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'],
    allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
    maxSampleRate: 1,
    maxExecutions: 60,
    reason: 'Phase 5.8 staging rehearsal runner test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  });
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
