import { describe, expect, it } from 'vitest';
import { RouteShadowServerHttpClient } from '../RouteShadowServerHttpClient';
import { RouteShadowServerHarness, routeShadowServerJsonResponse } from '../RouteShadowServerHarness';
import { RouteShadowServerProcessManager, type RouteShadowServerProcessStatus } from '../RouteShadowServerProcessManager';
import {
  ASSESSMENT_ROUTE_SHADOW_SERVER_PATH,
  createSyntheticAssessmentServerRequest,
} from '../RouteShadowServerPayloadFactory';
import type { RouteShadowServerConfig, RouteShadowServerRequest, RouteShadowServerResponse } from '../RouteShadowServerTypes';

describe('RouteShadowServerHarness', () => {
  it('executes both routes over REAL_HTTP_SERVER mode when the server is ready', async () => {
    const run = await new RouteShadowServerHarness({
      now,
      processManager: new FakeProcessManager(),
      httpClient: new FakeClient(okResponse()),
    }).executeSmokeTest({
      port: 31640,
      startServer: false,
    });

    expect(run.executionMode).toBe('REAL_HTTP_SERVER');
    expect(run.status).toBe('COMPLETED');
    expect(run.serverReady).toBe(true);
    expect(run.metrics.totalRoutes).toBe(2);
    expect(run.metrics.completedRoutes).toBe(2);
    expect(run.metrics.hookReachedCount).toBe(2);
    expect(run.metrics.matchedCount).toBe(2);
    expect(run.metrics.liveRoutingEnabledCount).toBe(0);
  });

  it('blocks production, unknown, missing approval, unsupported route, and oversized payloads', async () => {
    const harness = new RouteShadowServerHarness({ now, httpClient: new FakeClient(okResponse()) });
    const baseConfig: Partial<RouteShadowServerConfig> = {
      enabled: true,
      environment: 'staging',
      baseUrl: 'http://127.0.0.1:31640',
      startServer: false,
      allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH],
      allowedFlows: ['assessment'],
    };

    const production = await harness.execute(createSyntheticAssessmentServerRequest(), { ...baseConfig, environment: 'production', allowedEnvironments: ['production'] });
    const unknown = await harness.execute(createSyntheticAssessmentServerRequest(), { ...baseConfig, environment: 'unknown', allowedEnvironments: ['unknown'] });
    const missingApproval = await harness.execute(createSyntheticAssessmentServerRequest({ approval: undefined, body: { ...bodyOf(createSyntheticAssessmentServerRequest()), approval: undefined } }), baseConfig);
    const unsupportedRoute = await harness.execute(createSyntheticAssessmentServerRequest({ routePath: '/api/internal/constitutional-shadow/unsupported' }), baseConfig);
    const oversized = await harness.execute(
      createSyntheticAssessmentServerRequest({ body: { ...bodyOf(createSyntheticAssessmentServerRequest()), payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } } }),
      { ...baseConfig, maxPayloadBytes: 16 }
    );

    for (const result of [production, unknown, missingApproval, unsupportedRoute, oversized]) {
      expect(result.verdict).toBe('BLOCKED');
      expect(result.executionMode).toBe('SERVER_BLOCKED');
      expect(result.liveRoutingEnabled).toBe(false);
      expect(result.productionOutputPreserved).toBe(true);
    }
  });

  it('reports server start failure without claiming REAL_HTTP_SERVER', async () => {
    const run = await new RouteShadowServerHarness({
      now,
      processManager: new FakeProcessManager(false),
      httpClient: new FakeClient(okResponse()),
    }).executeSmokeTest({
      port: 31640,
    });

    expect(run.executionMode).toBe('SERVER_START_FAILED');
    expect(run.status).toBe('FAILED');
    expect(run.serverReady).toBe(false);
  });
});

class FakeProcessManager extends RouteShadowServerProcessManager {
  constructor(private readonly ready = true) {
    super();
  }

  override async start(): Promise<RouteShadowServerProcessStatus> {
    return {
      status: this.ready ? 'READY' : 'FAILED',
      started: true,
      ready: this.ready,
      stopped: false,
      pid: 1,
      logs: '',
      reason: this.ready ? 'Fake server ready.' : 'Fake readiness timeout.',
    };
  }

  override async stop(): Promise<RouteShadowServerProcessStatus> {
    return { status: 'CANCELLED', started: true, ready: false, stopped: true, pid: 1, logs: '' };
  }
}

class FakeClient extends RouteShadowServerHttpClient {
  constructor(private readonly response: RouteShadowServerResponse) {
    super();
  }

  override async post(): Promise<RouteShadowServerResponse> {
    return this.response;
  }
}

function okResponse(): RouteShadowServerResponse {
  return routeShadowServerJsonResponse(200, {
    status: 'COMPLETED',
    verdict: 'PASS_WITH_WARNINGS',
    flow: 'assessment',
    hookReached: true,
    matched: true,
    driftDetected: false,
    failure: false,
    rollback: false,
    auditSummary: { productionOutputPreserved: true, liveRoutingEnabled: false },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

function bodyOf(request: RouteShadowServerRequest): Record<string, unknown> {
  return request.body as Record<string, unknown>;
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}

