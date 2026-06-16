import { describe, expect, it } from 'vitest';
import { createRouteShadowServerAuditBundle } from '../RouteShadowServerAuditBundle';
import { createRouteShadowServerConfig } from '../RouteShadowServerConfig';
import { createSyntheticAssessmentServerRequest } from '../RouteShadowServerPayloadFactory';
import { routeShadowServerJsonResponse } from '../RouteShadowServerHarness';
import { validateRouteShadowServerResponse } from '../RouteShadowServerResponseValidator';

describe('RouteShadowServerAuditBundle', () => {
  it('creates a JSON-safe audit bundle without raw payload storage', () => {
    const request = createSyntheticAssessmentServerRequest();
    const config = createRouteShadowServerConfig({ enabled: true, environment: 'staging', allowedRoutes: [request.routePath], allowedFlows: [request.flow] });
    const validation = validateRouteShadowServerResponse(
      routeShadowServerJsonResponse(200, {
        status: 'COMPLETED',
        verdict: 'PASS_WITH_WARNINGS',
        flow: 'assessment',
        hookReached: true,
        matched: true,
        driftDetected: false,
        failure: false,
        rollback: false,
        auditSummary: {},
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      })
    );

    const bundle = createRouteShadowServerAuditBundle({
      runId: 'server-run',
      request,
      config,
      validation,
      latencyMs: 0,
      finalVerdict: 'PASS_WITH_WARNINGS',
      generatedAt: '2026-06-06T00:00:00.000Z',
      payloadBytes: 10,
      serverStartStatus: 'READY',
      serverReadinessStatus: 'READY',
    });

    expect(JSON.parse(JSON.stringify(bundle))).toEqual(bundle);
    expect(bundle.executionMode).toBe('REAL_HTTP_SERVER');
    expect(bundle.privacySummary.captureRawPayloads).toBe(false);
  });
});

