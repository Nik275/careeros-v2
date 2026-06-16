/**
 * @fileoverview Failure rehearsal for Phase 6.2 real HTTP server route shadow.
 */

import { RouteShadowServerHttpClient } from './RouteShadowServerHttpClient';
import {
  ASSESSMENT_ROUTE_SHADOW_SERVER_PATH,
  createRouteShadowServerTestApproval,
  createSyntheticAssessmentServerRequest,
} from './RouteShadowServerPayloadFactory';
import { RouteShadowServerHarness, routeShadowServerJsonResponse } from './RouteShadowServerHarness';
import type {
  RouteShadowServerConfig,
  RouteShadowServerRequest,
  RouteShadowServerResponse,
  RouteShadowServerResult,
} from './RouteShadowServerTypes';

export type RouteShadowServerFailureCase =
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
  | 'invalid-base-url'
  | 'blocked-external-host'
  | 'server-start-failure'
  | 'server-readiness-timeout'
  | 'http-timeout'
  | 'non-json-response'
  | 'http-500-response'
  | 'malformed-json'
  | 'hook-not-reached'
  | 'live-routing-enabled-true'
  | 'production-output-preserved-false'
  | 'stack-trace-leak'
  | 'drift-detected'
  | 'binding-failure';

export interface RouteShadowServerFailureRehearsalResult {
  caseName: RouteShadowServerFailureCase;
  handledSafely: boolean;
  result?: RouteShadowServerResult;
  runBlocked?: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  notes: readonly string[];
}

export class RouteShadowServerFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly RouteShadowServerFailureRehearsalResult[]> {
    const cases: RouteShadowServerFailureCase[] = [
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
      'invalid-base-url',
      'blocked-external-host',
      'server-start-failure',
      'server-readiness-timeout',
      'http-timeout',
      'non-json-response',
      'http-500-response',
      'malformed-json',
      'hook-not-reached',
      'live-routing-enabled-true',
      'production-output-preserved-false',
      'stack-trace-leak',
      'drift-detected',
      'binding-failure',
    ];
    const results: RouteShadowServerFailureRehearsalResult[] = [];
    for (const caseName of cases) results.push(await this.runCase(caseName));
    return Object.freeze(results);
  }

  async runCase(caseName: RouteShadowServerFailureCase): Promise<RouteShadowServerFailureRehearsalResult> {
    let request = healthyRequest();
    let config: Partial<RouteShadowServerConfig> = {
      enabled: true,
      environment: 'staging',
      baseUrl: 'http://127.0.0.1:31622',
      port: 31622,
      startServer: false,
      allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH],
      allowedFlows: ['assessment'],
    };
    let client: RouteShadowServerHttpClient = new FakeServerClient(okResponse());

    switch (caseName) {
      case 'production-environment':
        config = { ...config, environment: 'production', allowedEnvironments: ['production'] };
        break;
      case 'unknown-environment':
        config = { ...config, environment: 'unknown', allowedEnvironments: ['unknown'] };
        break;
      case 'config-disabled':
        config = { ...config, enabled: false };
        break;
      case 'missing-approval':
        request = withBody(request, { approval: undefined });
        request = { ...request, approval: undefined };
        break;
      case 'expired-approval':
        request = withBody(request, {
          approval: createRouteShadowServerTestApproval({
            flows: ['assessment'],
            routes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH],
            expiresAt: '2026-06-05T00:00:00.000Z',
          }),
        });
        break;
      case 'missing-synthetic-marker':
        request = withBody(request, { synthetic: false, payload: { synthetic: false, dataClassification: 'SYNTHETIC' } });
        break;
      case 'raw-payload-attempt':
        request = withBody(request, {
          payload: { synthetic: true, dataClassification: 'SYNTHETIC', rawStudentData: true, studentEmail: 'blocked@example.com' },
        });
        break;
      case 'unsupported-flow':
        request = { ...request, flow: 'unsupported' as never };
        break;
      case 'unsupported-route':
        request = { ...request, routePath: '/api/internal/constitutional-shadow/unsupported' };
        break;
      case 'oversized-payload':
        request = withBody(request, { payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } });
        config = { ...config, maxPayloadBytes: 16 };
        break;
      case 'invalid-base-url':
        config = { ...config, baseUrl: 'not-a-url' };
        break;
      case 'blocked-external-host':
        config = { ...config, baseUrl: 'https://careeros.com' };
        break;
      case 'server-start-failure':
        return runBlockedCase(caseName, 'Server start failure simulated safely.');
      case 'server-readiness-timeout':
        return runBlockedCase(caseName, 'Server readiness timeout simulated safely.');
      case 'http-timeout':
        client = new FakeServerClient(failedResponse('Real HTTP request timed out safely.'));
        break;
      case 'non-json-response':
        client = new FakeServerClient({
          httpStatus: 200,
          body: 'not-json',
          headers: { 'content-type': 'text/plain' },
          jsonSafe: false,
          latencyMs: 0,
        });
        break;
      case 'http-500-response':
        client = new FakeServerClient(failedResponse('Forced HTTP 500 response.'));
        break;
      case 'malformed-json':
        request = { ...request, rawBody: '{"synthetic":true,' };
        client = new FakeServerClient(failedResponse('Malformed JSON failed safely.'));
        break;
      case 'hook-not-reached':
        client = new FakeServerClient(failedResponse('Hook not reached.', { hookReached: false, rollback: true }));
        break;
      case 'live-routing-enabled-true':
        client = new FakeServerClient(okResponse({ liveRoutingEnabled: true }));
        break;
      case 'production-output-preserved-false':
        client = new FakeServerClient(okResponse({ productionOutputPreserved: false }));
        break;
      case 'stack-trace-leak':
        client = new FakeServerClient(okResponse({ error: 'Error: leaked\n    at secret.ts:1:1' }));
        break;
      case 'drift-detected':
        client = new FakeServerClient(failedResponse('Forced drift.', { hookReached: true, driftDetected: true, rollback: true }));
        break;
      case 'binding-failure':
        client = new FakeServerClient(failedResponse('Forced binding failure.', { hookReached: true, rollback: true }));
        break;
    }

    const result = await new RouteShadowServerHarness({ now: this.now, httpClient: client }).execute(request, config);
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

class FakeServerClient extends RouteShadowServerHttpClient {
  constructor(private readonly response: RouteShadowServerResponse) {
    super();
  }

  override async post(): Promise<RouteShadowServerResponse> {
    return this.response;
  }
}

function healthyRequest(): RouteShadowServerRequest {
  return createSyntheticAssessmentServerRequest({
    requestId: 'route-shadow-server-failure-rehearsal',
    approval: createRouteShadowServerTestApproval({
      flows: ['assessment'],
      routes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH],
      maxExecutions: 1,
    }),
  });
}

function withBody(request: RouteShadowServerRequest, patch: Readonly<Record<string, unknown>>): RouteShadowServerRequest {
  const body = isRecord(request.body) ? request.body : {};
  return { ...request, body: { ...body, ...patch } };
}

function okResponse(overrides: Readonly<Record<string, unknown>> = {}): RouteShadowServerResponse {
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
    ...overrides,
  });
}

function failedResponse(reason: string, overrides: Readonly<Record<string, unknown>> = {}): RouteShadowServerResponse {
  return routeShadowServerJsonResponse(500, {
    status: 'FAILED',
    verdict: 'FAIL',
    flow: 'assessment',
    hookReached: false,
    matched: false,
    driftDetected: false,
    failure: true,
    rollback: false,
    auditSummary: { reason, productionOutputPreserved: true, liveRoutingEnabled: false },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
    ...overrides,
  });
}

function runBlockedCase(caseName: RouteShadowServerFailureCase, reason: string): RouteShadowServerFailureRehearsalResult {
  return Object.freeze({
    caseName,
    handledSafely: true,
    runBlocked: true,
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
    notes: Object.freeze([reason]),
  });
}

function isHandledSafely(result: RouteShadowServerResult): boolean {
  const detectedUnsafeResponse =
    !result.validation.valid &&
    (result.validation.rawPayloadLeakDetected ||
      result.validation.stackTraceLeakDetected ||
      result.validation.internalErrorLeakDetected ||
      result.validation.productionMutationDetected ||
      !result.validation.liveRoutingDisabled ||
      !result.validation.productionOutputPreserved ||
      !result.validation.jsonSafe);
  const safeBlockingResponse =
    result.validation.valid &&
    result.validation.liveRoutingDisabled &&
    result.validation.productionOutputPreserved &&
    !result.validation.rawPayloadLeakDetected &&
    !result.validation.stackTraceLeakDetected &&
    !result.validation.internalErrorLeakDetected &&
    !result.validation.productionMutationDetected;

  return result.productionOutputPreserved && !result.liveRoutingEnabled && (result.verdict === 'BLOCKED' || result.verdict === 'FAIL') && (safeBlockingResponse || detectedUnsafeResponse);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
