import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowAuditBundle } from '../DeployedRouteShadowAuditBundle';
import { createDeployedRouteShadowConfig } from '../DeployedRouteShadowConfig';
import { DeployedStagingHostGuard } from '../DeployedStagingHostGuard';
import { createDeployedRouteShadowApproval } from '../DeployedRouteShadowApprovalFactory';
import { createSyntheticAssessmentDeployedRequest } from '../DeployedRouteShadowPayloadFactory';
import { deployedRouteShadowJsonResponse } from '../DeployedRouteShadowHarness';
import { validateDeployedRouteShadowResponse } from '../DeployedRouteShadowResponseValidator';

describe('DeployedRouteShadowAuditBundle', () => {
  it('creates a JSON-safe audit bundle without raw payload storage', () => {
    const approval = createDeployedRouteShadowApproval({
      approvedBy: 'test',
      environment: 'staging',
      baseUrl: 'https://preview-careeros-staging.vercel.app',
      allowedHosts: ['preview-careeros-staging.vercel.app'],
      allowedRoutes: ['/api/internal/constitutional-shadow/assessment'],
      allowedFlows: ['assessment'],
      maxRequests: 1,
      reason: 'test',
      productionSafetyAcknowledgement: 'Production output remains authoritative.',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
    const request = createSyntheticAssessmentDeployedRequest({ approval });
    const config = createDeployedRouteShadowConfig({ enabled: true, environment: 'staging', baseUrl: approval.baseUrl, allowedHosts: approval.allowedHosts, allowedRoutes: approval.allowedRoutes, allowedFlows: approval.allowedFlows });
    const hostDecision = new DeployedStagingHostGuard().evaluate(config);
    const validation = validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(200, { status: 'COMPLETED', verdict: 'PASS_WITH_WARNINGS', flow: 'assessment', hookReached: true, matched: true, driftDetected: false, failure: false, rollback: false, auditSummary: {}, productionOutputPreserved: true, liveRoutingEnabled: false }));
    const bundle = createDeployedRouteShadowAuditBundle({ runId: 'run', request, config, hostDecision, validation, latencyMs: 0, finalVerdict: 'PASS_WITH_WARNINGS', generatedAt: '2026-06-06T00:00:00.000Z', payloadBytes: 10 });

    expect(JSON.parse(JSON.stringify(bundle))).toEqual(bundle);
    expect(bundle.executionMode).toBe('DEPLOYED_STAGING_HTTP');
    expect(bundle.privacySummary.captureRawPayloads).toBe(false);
    expect(JSON.stringify(bundle)).not.toMatch(/"rawStudentData"\s*:\s*true|"studentEmail"\s*:|"SECRET_KEY"\s*:/i);
  });
});
