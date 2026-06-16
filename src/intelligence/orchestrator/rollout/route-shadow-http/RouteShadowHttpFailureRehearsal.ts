/**
 * @fileoverview Failure rehearsal harness for Phase 6.1 HTTP route shadow.
 */

import {
  ASSESSMENT_ROUTE_SHADOW_HTTP_PATH,
  createRouteShadowHttpTestApproval,
  createSyntheticAssessmentHttpRequest,
} from './RouteShadowHttpPayloadFactory';
import {
  RouteShadowHttpHarness,
  routeShadowHttpJsonResponse,
} from './RouteShadowHttpHarness';
import type {
  RouteShadowHttpRequest,
  RouteShadowHttpResult,
} from './RouteShadowHttpTypes';

export type RouteShadowHttpFailureCase =
  | 'production-environment'
  | 'unknown-environment'
  | 'config-disabled'
  | 'missing-approval'
  | 'expired-approval'
  | 'missing-synthetic-marker'
  | 'raw-payload-attempt'
  | 'unsupported-flow'
  | 'unsupported-route'
  | 'oversized-payload'
  | 'kill-switch-active'
  | 'privacy-gate-failure'
  | 'telemetry-failure'
  | 'parity-gate-failure'
  | 'malformed-json'
  | 'route-handler-failure'
  | 'hook-not-reached'
  | 'drift-detected'
  | 'binding-failure'
  | 'attempted-live-routing-flag';

export interface RouteShadowHttpFailureRehearsalResult {
  caseName: RouteShadowHttpFailureCase;
  handledSafely: boolean;
  result: RouteShadowHttpResult;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  notes: readonly string[];
}

export class RouteShadowHttpFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly RouteShadowHttpFailureRehearsalResult[]> {
    const cases: RouteShadowHttpFailureCase[] = [
      'production-environment',
      'unknown-environment',
      'config-disabled',
      'missing-approval',
      'expired-approval',
      'missing-synthetic-marker',
      'raw-payload-attempt',
      'unsupported-flow',
      'unsupported-route',
      'oversized-payload',
      'kill-switch-active',
      'privacy-gate-failure',
      'telemetry-failure',
      'parity-gate-failure',
      'malformed-json',
      'route-handler-failure',
      'hook-not-reached',
      'drift-detected',
      'binding-failure',
      'attempted-live-routing-flag',
    ];
    const results: RouteShadowHttpFailureRehearsalResult[] = [];
    for (const caseName of cases) results.push(await this.runCase(caseName));
    return Object.freeze(results);
  }

  async runCase(caseName: RouteShadowHttpFailureCase): Promise<RouteShadowHttpFailureRehearsalResult> {
    let request = healthyRequest();
    let harness = new RouteShadowHttpHarness({ now: this.now });

    switch (caseName) {
      case 'production-environment':
        request = withHttpConfig(request, { environment: 'production', allowedEnvironments: ['production'] }, 'production');
        break;
      case 'unknown-environment':
        request = withHttpConfig(request, { environment: 'unknown', allowedEnvironments: ['unknown'] }, 'unknown');
        break;
      case 'config-disabled':
        request = withHttpConfig(request, { enabled: false });
        break;
      case 'missing-approval':
        request = withBody(request, { approval: undefined });
        request = { ...request, approval: undefined };
        break;
      case 'expired-approval':
        request = withBody(request, {
          approval: createRouteShadowHttpTestApproval({
            flows: ['assessment'],
            routes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH],
            expiresAt: '2026-06-05T00:00:00.000Z',
          }),
        });
        break;
      case 'missing-synthetic-marker':
        request = withBody(request, {
          synthetic: false,
          payload: { synthetic: false, dataClassification: 'SYNTHETIC' },
        });
        break;
      case 'raw-payload-attempt':
        request = withBody(request, {
          payload: {
            synthetic: true,
            dataClassification: 'SYNTHETIC',
            rawStudentData: true,
            studentEmail: 'blocked@example.com',
          },
        });
        break;
      case 'unsupported-flow':
        request = { ...request, flow: 'unsupported' as never };
        break;
      case 'unsupported-route':
        request = { ...request, routePath: '/api/internal/constitutional-shadow/unsupported' };
        break;
      case 'oversized-payload':
        request = withHttpConfig(withBody(request, { payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } }), {
          maxPayloadBytes: 16,
        });
        break;
      case 'kill-switch-active':
        request = withBody(request, { gateInputs: { ...readGateInputs(request), killSwitchActive: true } });
        break;
      case 'privacy-gate-failure':
        request = withBody(request, { gateInputs: { ...readGateInputs(request), privacySafe: false } });
        break;
      case 'telemetry-failure':
        request = withBody(request, { gateInputs: { ...readGateInputs(request), telemetryHealthy: false } });
        break;
      case 'parity-gate-failure':
        request = withBody(request, { gateInputs: { ...readGateInputs(request), expandedParityCIGatePassed: false } });
        break;
      case 'malformed-json':
        request = { ...request, rawBody: '{"synthetic":true,' };
        break;
      case 'route-handler-failure':
        request = withBody(request, { metadata: { ...readMetadata(request), forcedMode: 'entrypoint-failure' } });
        break;
      case 'hook-not-reached':
        request = withBody(request, { metadata: { ...readMetadata(request), forcedMode: 'hook-not-reached' } });
        break;
      case 'drift-detected':
        harness = new RouteShadowHttpHarness({ now: this.now, routeHandlers: { [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH]: simulatedDriftHandler } });
        break;
      case 'binding-failure':
        harness = new RouteShadowHttpHarness({ now: this.now, routeHandlers: { [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH]: simulatedBindingFailureHandler } });
        break;
      case 'attempted-live-routing-flag':
        request = withBody(request, { config: { ...readRouteConfig(request), allowLiveRouting: true } });
        break;
    }

    const result = await harness.execute(request);
    return Object.freeze({
      caseName,
      handledSafely: isHandledSafely(result),
      result,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
      notes: Object.freeze([`${caseName} produced ${result.httpStatus}/${result.verdict} without live routing.`]),
    });
  }
}

function healthyRequest(): RouteShadowHttpRequest {
  return createSyntheticAssessmentHttpRequest({
    requestId: 'route-shadow-http-failure-rehearsal',
    approval: createRouteShadowHttpTestApproval({
      flows: ['assessment'],
      routes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH],
      maxExecutions: 1,
    }),
  });
}

function withHttpConfig(
  request: RouteShadowHttpRequest,
  config: NonNullable<RouteShadowHttpRequest['config']>,
  environment?: string
): RouteShadowHttpRequest {
  const nextRequest = {
    ...request,
    environment: environment ?? request.environment,
    config: {
      ...request.config,
      ...config,
    },
  };
  return withBody(nextRequest, {
    environment: environment ?? request.environment,
    config: {
      ...(isRecord(request.body) && isRecord(request.body.config) ? request.body.config : {}),
      ...config,
    },
  });
}

function withBody(request: RouteShadowHttpRequest, patch: Readonly<Record<string, unknown>>): RouteShadowHttpRequest {
  const body = isRecord(request.body) ? request.body : {};
  return {
    ...request,
    body: {
      ...body,
      ...patch,
    },
  };
}

async function simulatedDriftHandler(): Promise<Response> {
  return responseFromHttpResponse(
    routeShadowHttpJsonResponse(500, {
      status: 'ROLLED_BACK',
      verdict: 'FAIL',
      flow: 'assessment',
      hookReached: true,
      matched: false,
      driftDetected: true,
      failure: false,
      rollback: true,
      auditSummary: {
        reason: 'Forced drift for Phase 6.1 HTTP failure rehearsal.',
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      },
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    })
  );
}

async function simulatedBindingFailureHandler(): Promise<Response> {
  return responseFromHttpResponse(
    routeShadowHttpJsonResponse(500, {
      status: 'ROLLED_BACK',
      verdict: 'FAIL',
      flow: 'assessment',
      hookReached: true,
      matched: false,
      driftDetected: false,
      failure: true,
      rollback: true,
      auditSummary: {
        reason: 'Forced binding failure for Phase 6.1 HTTP failure rehearsal.',
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      },
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    })
  );
}

function responseFromHttpResponse(response: ReturnType<typeof routeShadowHttpJsonResponse>): Response {
  return new Response(JSON.stringify(response.body), {
    status: response.httpStatus,
    headers: response.headers,
  });
}

function readGateInputs(request: RouteShadowHttpRequest): Record<string, unknown> {
  return isRecord(request.body) && isRecord(request.body.gateInputs) ? request.body.gateInputs : {};
}

function readMetadata(request: RouteShadowHttpRequest): Record<string, unknown> {
  return isRecord(request.body) && isRecord(request.body.metadata) ? request.body.metadata : {};
}

function readRouteConfig(request: RouteShadowHttpRequest): Record<string, unknown> {
  return isRecord(request.body) && isRecord(request.body.config) ? request.body.config : {};
}

function isHandledSafely(result: RouteShadowHttpResult): boolean {
  return (
    result.productionOutputPreserved &&
    !result.liveRoutingEnabled &&
    result.validation.liveRoutingDisabled &&
    result.validation.productionOutputPreserved &&
    !result.validation.rawPayloadLeakDetected &&
    !result.validation.stackTraceLeakDetected &&
    !result.validation.internalErrorLeakDetected &&
    !result.validation.productionMutationDetected &&
    (result.verdict === 'BLOCKED' || result.verdict === 'FAIL')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

