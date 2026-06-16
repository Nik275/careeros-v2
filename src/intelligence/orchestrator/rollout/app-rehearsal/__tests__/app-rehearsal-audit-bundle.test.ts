import { describe, expect, it } from 'vitest';
import { createAppRehearsalApproval } from '../AppRehearsalApprovalFactory';
import {
  ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
  CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
} from '../AppRehearsalEntrypointAdapter';
import { createAppRehearsalConfig } from '../AppRehearsalConfig';
import { AppRehearsalRunner } from '../AppRehearsalRunner';

describe('AppRehearsalAuditBundle', () => {
  it('creates a JSON-safe audit bundle with selected alignment and safety status', async () => {
    const result = await new AppRehearsalRunner({ now }).run({
      config: createAppRehearsalConfig({
        runId: 'phase-5-9-audit-test',
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
        runId: 'phase-5-9-audit-test',
        approvedBy: 'phase-5-9-test',
        environment: 'staging',
        allowedFlows: ['assessment', 'career-fit'],
        allowedEntrypoints: [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID],
        allowServiceFallback: false,
        maxSampleRate: 1,
        maxExecutions: 2,
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
    });

    expect(JSON.parse(JSON.stringify(result.auditBundle))).toEqual(result.auditBundle);
    expect(result.auditBundle.selectedAlignmentStrategy).toBe('IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER');
    expect(result.auditBundle.productionOutputPreserved).toBe(true);
    expect(result.auditBundle.liveRoutingEnabled).toBe(false);
    expect(result.auditBundle.serviceFallbacksUsed).toEqual([]);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
