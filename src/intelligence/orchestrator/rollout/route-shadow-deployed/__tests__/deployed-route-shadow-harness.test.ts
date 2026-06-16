import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowApproval } from '../DeployedRouteShadowApprovalFactory';
import { DeployedRouteShadowHttpClient } from '../DeployedRouteShadowHttpClient';
import { DeployedRouteShadowHarness, deployedRouteShadowJsonResponse } from '../DeployedRouteShadowHarness';
import { createSyntheticAssessmentDeployedRequest } from '../DeployedRouteShadowPayloadFactory';
import type { DeployedRouteShadowResponse } from '../DeployedRouteShadowTypes';

describe('DeployedRouteShadowHarness', () => {
  it('reports missing deployed staging URL without sending HTTP requests', async () => {
    const run = await new DeployedRouteShadowHarness({ now }).executeSmokeTest({ baseUrl: '' });

    expect(run.feasibilityStatus).toBe('DEPLOYED_STAGING_URL_MISSING');
    expect(run.deployedHttpRequestsSent).toBe(false);
    expect(run.executionMode).toBe('DEPLOYED_STAGING_UNAVAILABLE');
  });

  it('blocks production environment, unknown environment, missing approval, unsupported route, and oversized payloads', async () => {
    const harness = new DeployedRouteShadowHarness({ now, httpClient: new FakeClient(okResponse()) });
    const approval = validApproval();
    const request = createSyntheticAssessmentDeployedRequest({ approval });
    const base = validConfig();

    const production = await harness.execute(request, { ...base, environment: 'production' });
    const unknown = await harness.execute(request, { ...base, environment: 'unknown' });
    const missingApproval = await harness.execute(createSyntheticAssessmentDeployedRequest({ overrides: { approval: undefined, body: { ...(request.body as Record<string, unknown>), approval: undefined } } }), base);
    const unsupportedRoute = await harness.execute({ ...request, routePath: '/api/internal/constitutional-shadow/unsupported' }, base);
    const oversized = await harness.execute({ ...request, body: { ...(request.body as Record<string, unknown>), payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } } }, { ...base, maxPayloadBytes: 16 });

    for (const result of [production, unknown, missingApproval, unsupportedRoute, oversized]) {
      expect(result.verdict).toBe('BLOCKED');
      expect(result.liveRoutingEnabled).toBe(false);
    }
  });

  it('executes deployed route when safe host and approval are configured', async () => {
    const run = await new DeployedRouteShadowHarness({ now, httpClient: new FakeClient(okResponse()) }).executeSmokeTest(validConfig());

    expect(run.executionMode).toBe('DEPLOYED_STAGING_HTTP');
    expect(run.deployedHttpRequestsSent).toBe(true);
    expect(run.metrics.totalRoutes).toBe(2);
    expect(run.metrics.hookReachedCount).toBe(2);
    expect(run.metrics.matchedCount).toBe(2);
  });
});

class FakeClient extends DeployedRouteShadowHttpClient {
  constructor(private readonly response: DeployedRouteShadowResponse) { super(); }
  override async post(): Promise<DeployedRouteShadowResponse> { return this.response; }
}
function validConfig() {
  return { enabled: true, environment: 'staging', baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: ['preview-careeros-staging.vercel.app'], allowedRoutes: ['/api/internal/constitutional-shadow/assessment', '/api/internal/constitutional-shadow/career-fit'], allowedFlows: ['assessment', 'career-fit'] as const };
}
function validApproval() {
  return createDeployedRouteShadowApproval({ approvedBy: 'test', environment: 'staging', baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: ['preview-careeros-staging.vercel.app'], allowedRoutes: ['/api/internal/constitutional-shadow/assessment'], allowedFlows: ['assessment'], maxRequests: 1, reason: 'test', productionSafetyAcknowledgement: 'Production output remains authoritative.', expiresAt: '2099-01-01T00:00:00.000Z' });
}
function okResponse() {
  return deployedRouteShadowJsonResponse(200, { status: 'COMPLETED', verdict: 'PASS_WITH_WARNINGS', flow: 'assessment', hookReached: true, matched: true, driftDetected: false, failure: false, rollback: false, auditSummary: {}, productionOutputPreserved: true, liveRoutingEnabled: false });
}
function now(): string { return '2026-06-06T00:00:00.000Z'; }

