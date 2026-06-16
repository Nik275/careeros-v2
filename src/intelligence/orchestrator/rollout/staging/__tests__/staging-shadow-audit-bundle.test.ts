import { describe, expect, it } from 'vitest';
import { createStagingShadowApproval } from '../StagingShadowApprovalFactory';
import { createStagingShadowAuditBundle } from '../StagingShadowAuditBundle';
import { calculateStagingShadowMetrics } from '../StagingShadowMetrics';

describe('StagingShadowAuditBundle', () => {
  it('is JSON-safe and excludes live routing', () => {
    const flowResults = [
      {
        scenarioId: 'scenario-1',
        flow: 'assessment' as const,
        sourceSuite: 'golden' as const,
        status: 'COMPLETED' as const,
        sampled: true,
        executed: true,
        hookPathObserved: true,
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
    const bundle = createStagingShadowAuditBundle({
      runId: 'phase-5-7-audit-test',
      environmentDecision: {
        environment: 'staging',
        normalizedEnvironment: 'staging',
        allowed: true,
        reason: 'allowed',
        evidence: ['environment=staging'],
        decidedAt: now(),
      },
      approval: createStagingShadowApproval({
        runId: 'phase-5-7-audit-test',
        approvedBy: 'phase-5-7-test',
        environment: 'staging',
        allowedFlows: ['assessment'],
        maxSampleRate: 1,
        maxExecutions: 1,
        reason: 'Audit bundle test.',
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
      flowResults,
      metrics: calculateStagingShadowMetrics(flowResults),
      finalVerdict: 'PASS',
      generatedAt: now(),
    });

    expect(() => JSON.stringify(bundle)).not.toThrow();
    expect(JSON.parse(JSON.stringify(bundle)).liveRoutingEnabled).toBe(false);
    expect(JSON.stringify(bundle)).not.toContain('manualApproval');
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
