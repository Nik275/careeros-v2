import { describe, expect, it } from 'vitest';
import { createAppRehearsalApproval } from '../AppRehearsalApprovalFactory';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
} from '../AppRehearsalEntrypointAdapter';
import { createAppRehearsalConfig } from '../AppRehearsalConfig';
import { AppRehearsalRunner } from '../AppRehearsalRunner';

describe('AppHookReachabilityProof', () => {
  it('detects hooks, observe router, canary service, dry-run binding, and path counts', async () => {
    const result = await new AppRehearsalRunner({ now }).run({
      config: createAppRehearsalConfig({
        runId: 'phase-5-9-hook-proof-test',
        enabled: true,
        environment: 'staging',
        allowedEnvironments: ['staging'],
        allowedFlows: ['assessment', 'career-fit'],
        allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
        allowServiceFallback: false,
        requireAppLevelCoverage: true,
        sampleRate: 1,
        maxExecutionsPerFlow: 1,
        maxTotalExecutions: 2,
        maxLatencyMs: 1000,
      }),
      approval: createAppRehearsalApproval({
        runId: 'phase-5-9-hook-proof-test',
        approvedBy: 'phase-5-9-test',
        environment: 'staging',
        allowedFlows: ['assessment', 'career-fit'],
        allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
        allowServiceFallback: false,
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
    expect(result.hookReachabilityProof.observeRouterReached).toBe(true);
    expect(result.hookReachabilityProof.canaryShadowReached).toBe(true);
    expect(result.hookReachabilityProof.dryRunBindingReached).toBe(true);
    expect(result.hookReachabilityProof.appLevelPathCount).toBe(2);
    expect(result.hookReachabilityProof.serviceFallbackPathCount).toBe(0);
    expect(result.hookReachabilityProof.hookReachabilityRate).toBe(100);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
