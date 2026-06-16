import { describe, expect, it } from 'vitest';
import { RouteShadowHttpHarness } from '../RouteShadowHttpHarness';
import {
  ASSESSMENT_ROUTE_SHADOW_HTTP_PATH,
  createSyntheticAssessmentHttpRequest,
} from '../RouteShadowHttpPayloadFactory';

describe('RouteShadowHttpHarness', () => {
  it('executes assessment and career-fit routes in the strongest feasible mode', async () => {
    const run = await new RouteShadowHttpHarness({ now }).executePilotRoutes();

    expect(run.executionMode).toBe('ROUTE_HANDLER_REQUEST_SIMULATION');
    expect(run.metrics.totalRoutes).toBe(2);
    expect(run.metrics.completedRoutes).toBe(2);
    expect(run.metrics.hookReachedCount).toBe(2);
    expect(run.metrics.matchedCount).toBe(2);
    expect(run.metrics.driftCount).toBe(0);
    expect(run.metrics.failedCount).toBe(0);
    expect(run.metrics.rollbackCount).toBe(0);
    expect(run.metrics.liveRoutingEnabledCount).toBe(0);
    expect(run.productionOutputPreserved).toBe(true);
    expect(run.liveRoutingEnabled).toBe(false);
  });

  it('blocks production, unknown environment, missing approval, unsupported route, and oversized payloads', async () => {
    const harness = new RouteShadowHttpHarness({ now });

    const production = await harness.execute(
      createSyntheticAssessmentHttpRequest({
        environment: 'production',
        config: { enabled: true, environment: 'production', allowedEnvironments: ['production'], allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH], allowedFlows: ['assessment'] },
      })
    );
    const unknown = await harness.execute(
      createSyntheticAssessmentHttpRequest({
        environment: 'unknown',
        config: { enabled: true, environment: 'unknown', allowedEnvironments: ['unknown'], allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH], allowedFlows: ['assessment'] },
      })
    );
    const missingApproval = await harness.execute(
      createSyntheticAssessmentHttpRequest({
        approval: undefined,
        body: { ...bodyOf(createSyntheticAssessmentHttpRequest()), approval: undefined },
      })
    );
    const unsupportedRoute = await harness.execute(createSyntheticAssessmentHttpRequest({ routePath: '/api/internal/constitutional-shadow/unsupported' }));
    const oversized = await harness.execute(
      createSyntheticAssessmentHttpRequest({
        body: { ...bodyOf(createSyntheticAssessmentHttpRequest()), payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } },
        config: { maxPayloadBytes: 16 },
      })
    );

    for (const result of [production, unknown, missingApproval, unsupportedRoute, oversized]) {
      expect(result.verdict).toBe('BLOCKED');
      expect(result.httpStatus).toBe(403);
      expect(result.liveRoutingEnabled).toBe(false);
      expect(result.productionOutputPreserved).toBe(true);
    }
  });

  it('reports route-handler failures without output replacement', async () => {
    const request = createSyntheticAssessmentHttpRequest({
      body: {
        ...bodyOf(createSyntheticAssessmentHttpRequest()),
        metadata: { forcedMode: 'entrypoint-failure' },
      },
    });
    const result = await new RouteShadowHttpHarness({ now }).execute(request);

    expect(result.verdict).toBe('FAIL');
    expect(result.rollback).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
    expect(result.liveRoutingEnabled).toBe(false);
  });
});

function bodyOf(request: ReturnType<typeof createSyntheticAssessmentHttpRequest>): Record<string, unknown> {
  return request.body as Record<string, unknown>;
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}

