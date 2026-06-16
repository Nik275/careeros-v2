import { describe, expect, it } from 'vitest';
import { createRolloutConfig } from '../../RolloutConfig';
import { RolloutPolicyEngine } from '../../RolloutPolicyEngine';
import { createStagingShadowApproval } from '../StagingShadowApprovalFactory';
import { getStagingShadowRunDataset } from '../StagingShadowRunDataset';
import { createStagingShadowRunConfig } from '../StagingShadowRunConfig';
import { StagingShadowRunRunner } from '../StagingShadowRunRunner';
import type { StagingShadowScenario } from '../StagingShadowRunTypes';

describe('StagingShadowRunRunner', () => {
  it('blocks missing approval before execution', async () => {
    const result = await new StagingShadowRunRunner({ now }).run({
      config: healthyConfig(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.verdict).toBe('BLOCKED');
    expect(result.failures.map((failure) => failure.reason).join(' ')).toContain('No staging shadow approval');
    expect(result.liveRoutingEnabled).toBe(false);
  });

  it('executes approved assessment and career-fit scenarios through existing hook paths', async () => {
    const result = await new StagingShadowRunRunner({ now }).run({
      config: healthyConfig(),
      approval: approvalRecord(),
      gateInputs: healthyGates(),
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.verdict).toBe('PASS');
    expect(result.metrics.executedScenarios).toBe(80);
    expect(result.metrics.matchedCount).toBe(80);
    expect(result.flowResults.some((entry) => entry.flow === 'assessment' && entry.hookPathObserved)).toBe(true);
    expect(result.flowResults.some((entry) => entry.flow === 'career-fit' && entry.hookPathObserved)).toBe(true);
    expect(result.flowResults.every((entry) => entry.hookPathObserved)).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
    expect(result.liveRoutingEnabled).toBe(false);
  });

  it('preserves production output snapshots', async () => {
    const scenario = {
      ...getStagingShadowRunDataset()[0],
      productionOutputSnapshot: Object.freeze({
        ...(getStagingShadowRunDataset()[0].productionOutputSnapshot as Record<string, unknown>),
      }),
    };
    const before = JSON.stringify(scenario.productionOutputSnapshot);

    const result = await new StagingShadowRunRunner({ now, scenarios: [scenario] }).run({
      config: createStagingShadowRunConfig({
        ...healthyConfig(),
        allowedFlows: [scenario.flow],
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
      }),
      approval: approvalRecord({ allowedFlows: [scenario.flow], maxExecutions: 1 }),
      gateInputs: healthyGates(),
    });

    expect(JSON.stringify(scenario.productionOutputSnapshot)).toBe(before);
    expect(result.productionOutputPreserved).toBe(true);
  });

  it('records drift, failure, and rollback results honestly', async () => {
    const [driftSource, failureSource, rollbackSource] = getStagingShadowRunDataset().filter(
      (scenario) => scenario.flow === 'assessment'
    );
    const driftResult = await new StagingShadowRunRunner({ now, scenarios: [createDriftScenario(driftSource)] }).run({
      config: createStagingShadowRunConfig({
        ...healthyConfig(),
        allowedFlows: ['assessment'],
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
        rollbackOnAnyDrift: false,
      }),
      approval: approvalRecord({ allowedFlows: ['assessment'], maxExecutions: 1 }),
      gateInputs: healthyGates(),
    });
    const failureResult = await new StagingShadowRunRunner({ now, scenarios: [createFailureScenario(failureSource)] }).run({
      config: createStagingShadowRunConfig({
        ...healthyConfig(),
        allowedFlows: ['assessment'],
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
        rollbackOnAnyFailure: false,
      }),
      approval: approvalRecord({ allowedFlows: ['assessment'], maxExecutions: 1 }),
      gateInputs: healthyGates(),
    });
    const rollbackResult = await new StagingShadowRunRunner({ now, scenarios: [createDriftScenario(rollbackSource)] }).run({
      config: createStagingShadowRunConfig({
        ...healthyConfig(),
        allowedFlows: ['assessment'],
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 1,
        rollbackOnAnyDrift: true,
      }),
      approval: approvalRecord({ allowedFlows: ['assessment'], maxExecutions: 1 }),
      gateInputs: healthyGates(),
    });

    expect(driftResult.metrics.driftCount).toBe(1);
    expect(failureResult.metrics.failedCount).toBe(1);
    expect(rollbackResult.metrics.rollbackCount).toBe(1);
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
  return createStagingShadowRunConfig({
    runId: 'phase-5-7-staging-runner-test',
    enabled: true,
    environment: 'staging',
    allowedEnvironments: ['staging'],
    allowedFlows: ['assessment', 'career-fit'],
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

function approvalRecord(overrides: Partial<Parameters<typeof createStagingShadowApproval>[0]> = {}) {
  return createStagingShadowApproval({
    runId: 'phase-5-7-staging-runner-test',
    approvedBy: 'phase-5-7-test',
    environment: 'staging',
    allowedFlows: ['assessment', 'career-fit'],
    maxSampleRate: 1,
    maxExecutions: 80,
    reason: 'Phase 5.7 staging shadow run test.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
    approvedAt: now(),
    expiresAt: '2026-06-07T00:00:00.000Z',
    ...overrides,
  });
}

function createDriftScenario(scenario: StagingShadowScenario): StagingShadowScenario {
  return {
    ...scenario,
    shadowOutput: {
      ...(scenario.shadowOutput as Record<string, unknown>),
      confidence: {
        profileConfidence: 1,
        assessmentCompleteness: 1,
      },
    },
  };
}

function createFailureScenario(scenario: StagingShadowScenario): StagingShadowScenario {
  return {
    ...scenario,
    forcedFailure: {
      failureId: 'forced-staging-failure',
      scenarioId: scenario.scenarioId,
      flow: scenario.flow,
      reason: 'forced staging binding failure',
      severity: 'high',
      occurredAt: now(),
      metadata: {},
    },
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
