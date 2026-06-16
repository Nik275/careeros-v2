import { describe, expect, it } from 'vitest';
import { createStagingRehearsalApproval } from '../StagingRehearsalApprovalFactory';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  CAREER_FIT_SERVICE_ENTRYPOINT_ID,
} from '../StagingRehearsalEntrypoints';
import { createStagingRehearsalConfig } from '../StagingRehearsalConfig';
import { StagingRehearsalRunner } from '../StagingRehearsalRunner';

describe('HookReachabilityProbe', () => {
  it('detects assessment and career-fit observe hooks plus router and canary service invocation', async () => {
    const result = await new StagingRehearsalRunner({ now }).run({
      config: createStagingRehearsalConfig({
        runId: 'phase-5-8-hook-proof-test',
        enabled: true,
        environment: 'staging',
        allowedEnvironments: ['staging'],
        allowedFlows: ['assessment', 'career-fit'],
        allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
        sampleRate: 1,
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 2,
        maxLatencyMs: 1000,
      }),
      approval: createStagingRehearsalApproval({
        runId: 'phase-5-8-hook-proof-test',
        approvedBy: 'phase-5-8-test',
        environment: 'staging',
        allowedFlows: ['assessment', 'career-fit'],
        allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID, CAREER_FIT_SERVICE_ENTRYPOINT_ID],
        maxSampleRate: 1,
        maxExecutions: 2,
        reason: 'Hook proof test.',
        productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
        approvedAt: now(),
        expiresAt: '2026-06-07T00:00:00.000Z',
      }),
      gateInputs: {
        rolloutGateApproved: true,
        expandedParityCIGatePassed: true,
        privacySafe: true,
        telemetryHealthy: true,
        killSwitchActive: false,
      },
    });

    expect(result.hookReachabilityProof.assessmentHookReached).toBe(true);
    expect(result.hookReachabilityProof.careerFitHookReached).toBe(true);
    expect(result.hookReachabilityProof.observeRouterInvocationCount).toBe(2);
    expect(result.hookReachabilityProof.canaryShadowExecutionCount).toBe(2);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
