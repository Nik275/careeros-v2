import { describe, expect, it } from 'vitest';
import { createStagingRehearsalApproval } from '../StagingRehearsalApprovalFactory';
import { createStagingRehearsalAuditBundle } from '../StagingRehearsalAuditBundle';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  getStagingRehearsalEntrypoints,
} from '../StagingRehearsalEntrypoints';
import { calculateStagingRehearsalMetrics } from '../StagingRehearsalMetrics';

describe('StagingRehearsalAuditBundle', () => {
  it('is JSON-safe and includes hook reachability proof without live routing', () => {
    const flowResults = [
      {
        scenarioId: 'scenario-1',
        flow: 'assessment' as const,
        entrypointId: ASSESSMENT_SERVICE_ENTRYPOINT_ID,
        entrypointLevel: 'service-fallback' as const,
        status: 'COMPLETED' as const,
        sampled: true,
        executed: true,
        appLevel: false,
        serviceLevelFallback: true,
        hookReached: true,
        observeRouterReached: true,
        canaryShadowReached: true,
        comparisonStatus: 'MATCHED' as const,
        matched: true,
        drifted: false,
        failed: false,
        notComparable: false,
        selfMirrored: false,
        rollbackTriggered: false,
        privacyViolation: false,
        telemetryFailure: false,
        latencyMs: 5,
        gateResultsPassed: 10,
        gateResultsTotal: 10,
        productionOutputPreserved: true as const,
        notes: [],
      },
    ];
    const bundle = createStagingRehearsalAuditBundle({
      runId: 'phase-5-8-audit-test',
      environmentDecision: {
        environment: 'staging',
        normalizedEnvironment: 'staging',
        allowed: true,
        reason: 'allowed',
        evidence: ['environment=staging'],
        decidedAt: now(),
      },
      approval: createStagingRehearsalApproval({
        runId: 'phase-5-8-audit-test',
        approvedBy: 'phase-5-8-test',
        environment: 'staging',
        allowedFlows: ['assessment'],
        allowedEntrypoints: [ASSESSMENT_SERVICE_ENTRYPOINT_ID],
        maxSampleRate: 1,
        maxExecutions: 1,
        reason: 'Audit test.',
        productionSafetyAcknowledgement: 'Production output remains authoritative; live modes are not approved.',
        approvedAt: now(),
        expiresAt: '2026-06-07T00:00:00.000Z',
      }),
      entrypoints: getStagingRehearsalEntrypoints(),
      gateInputs: {
        rolloutGateApproved: true,
        expandedParityCIGatePassed: true,
        privacySafe: true,
        telemetryHealthy: true,
        killSwitchActive: false,
      },
      hookReachabilityProof: {
        proofId: 'proof',
        generatedAt: now(),
        assessmentHookReached: true,
        careerFitHookReached: false,
        hookInvocationCount: 1,
        observeRouterInvocationCount: 1,
        canaryShadowExecutionCount: 1,
        byHook: { 'AssessmentEngine.processResponses': 1 },
        byFlow: { assessment: 1 },
        statuses: ['MATCHED'],
        observeRequestIds: ['observe-1'],
      },
      flowResults,
      metrics: calculateStagingRehearsalMetrics(flowResults),
      finalVerdict: 'PASS_WITH_WARNINGS',
      generatedAt: now(),
    });

    expect(() => JSON.stringify(bundle)).not.toThrow();
    expect(JSON.parse(JSON.stringify(bundle)).liveRoutingEnabled).toBe(false);
    expect(bundle.hookReachabilityProof.assessmentHookReached).toBe(true);
    expect(JSON.stringify(bundle)).not.toContain('manualApproval');
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
