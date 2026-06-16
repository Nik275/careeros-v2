import { describe, expect, it } from 'vitest';
import { createRouteShadowHttpConfig } from '../RouteShadowHttpConfig';
import { createRouteShadowHttpAuditBundle } from '../RouteShadowHttpAuditBundle';
import { createSyntheticAssessmentHttpRequest } from '../RouteShadowHttpPayloadFactory';
import { routeShadowHttpJsonResponse } from '../RouteShadowHttpHarness';
import { validateRouteShadowHttpResponse } from '../RouteShadowHttpResponseValidator';

describe('RouteShadowHttpAuditBundle', () => {
  it('creates a JSON-safe bundle without raw payload storage', () => {
    const request = createSyntheticAssessmentHttpRequest();
    const config = createRouteShadowHttpConfig({
      enabled: true,
      environment: 'staging',
      allowedRoutes: [request.routePath],
      allowedFlows: [request.flow],
    });
    const validation = validateRouteShadowHttpResponse(
      routeShadowHttpJsonResponse(200, {
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

    const bundle = createRouteShadowHttpAuditBundle({
      runId: 'test-run',
      request,
      config,
      validation,
      latencyMs: 0,
      finalVerdict: 'PASS_WITH_WARNINGS',
      generatedAt: '2026-06-06T00:00:00.000Z',
      payloadBytes: 10,
    });

    expect(JSON.parse(JSON.stringify(bundle))).toEqual(bundle);
    expect(bundle.executionMode).toBe('ROUTE_HANDLER_REQUEST_SIMULATION');
    expect(bundle.privacySummary.captureRawPayloads).toBe(false);
    expect(JSON.stringify(bundle)).not.toMatch(/rawStudentData|studentEmail|ssn/i);
  });
});

