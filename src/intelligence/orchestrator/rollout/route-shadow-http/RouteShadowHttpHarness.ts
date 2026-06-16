/**
 * @fileoverview HTTP-style execution harness for Phase 6.1 route shadow.
 */

import { POST as assessmentPost } from '../../../../app/api/internal/constitutional-shadow/assessment/route';
import { POST as careerFitPost } from '../../../../app/api/internal/constitutional-shadow/career-fit/route';
import { validateRouteShadowApproval } from '../route-shadow/RouteShadowApprovalFactory';
import type { RouteShadowApproval, RouteShadowFlow } from '../route-shadow/RouteShadowTypes';
import { createRouteShadowHttpAuditBundle } from './RouteShadowHttpAuditBundle';
import {
  createRouteShadowHttpConfig,
  ROUTE_SHADOW_HTTP_EXECUTION_FEASIBILITY,
} from './RouteShadowHttpConfig';
import {
  ASSESSMENT_ROUTE_SHADOW_HTTP_PATH,
  CAREER_FIT_ROUTE_SHADOW_HTTP_PATH,
  createSyntheticAssessmentHttpRequest,
  createSyntheticCareerFitHttpRequest,
} from './RouteShadowHttpPayloadFactory';
import { validateRouteShadowHttpResponse } from './RouteShadowHttpResponseValidator';
import type {
  RouteShadowHttpConfig,
  RouteShadowHttpExecutionFeasibility,
  RouteShadowHttpExecutionMode,
  RouteShadowHttpFailure,
  RouteShadowHttpMetrics,
  RouteShadowHttpRequest,
  RouteShadowHttpResponse,
  RouteShadowHttpResult,
  RouteShadowHttpRun,
  RouteShadowHttpVerdict,
} from './RouteShadowHttpTypes';

type RouteHandler = (request: Request) => Promise<Response>;

export function getRouteShadowHttpExecutionFeasibility(): RouteShadowHttpExecutionFeasibility {
  return ROUTE_SHADOW_HTTP_EXECUTION_FEASIBILITY;
}

export class RouteShadowHttpHarness {
  private readonly now: () => string;
  private readonly routeHandlers: Readonly<Record<string, RouteHandler>>;

  constructor(options: {
    now?: () => string;
    routeHandlers?: Partial<Record<string, RouteHandler>>;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.routeHandlers = Object.freeze({
      [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH]: assessmentPost,
      [CAREER_FIT_ROUTE_SHADOW_HTTP_PATH]: careerFitPost,
      ...(options.routeHandlers ?? {}),
    });
  }

  async executePilotRoutes(configInput: Partial<RouteShadowHttpConfig> = {}): Promise<RouteShadowHttpRun> {
    const startedAt = this.now();
    const config = createRouteShadowHttpConfig({
      enabled: true,
      environment: 'staging',
      allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH, CAREER_FIT_ROUTE_SHADOW_HTTP_PATH],
      allowedFlows: ['assessment', 'career-fit'],
      ...configInput,
    });
    const runId = `route-shadow-http-run-${hashString(`${startedAt}|${config.executionMode}`)}`;
    const results = [
      await this.execute(createSyntheticAssessmentHttpRequest(), config),
      await this.execute(createSyntheticCareerFitHttpRequest(), config),
    ];
    const completedAt = this.now();

    return Object.freeze({
      runId,
      executionMode: config.executionMode,
      environment: config.environment,
      routes: Object.freeze(results.map((result) => result.routePath)),
      results: Object.freeze(results),
      metrics: createMetrics(results),
      verdict: aggregateVerdict(results),
      startedAt,
      completedAt,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }

  async execute(
    request: RouteShadowHttpRequest,
    configInput: Partial<RouteShadowHttpConfig> = {}
  ): Promise<RouteShadowHttpResult> {
    const startedAt = this.now();
    const config = createRouteShadowHttpConfig({
      ...request.config,
      ...configInput,
      environment: configInput.environment ?? request.config?.environment ?? request.environment,
    });
    const payloadBytes = Buffer.byteLength(request.rawBody ?? safeStringify(request.body), 'utf8');
    const preflight = evaluatePreflight(request, config, this.now(), payloadBytes);
    if (!preflight.allowed) {
      const response = blockedHttpResponse(request, preflight.reason, preflight.status);
      return this.resultFromResponse({
        request,
        config,
        startedAt,
        response,
        payloadBytes,
        blockedReason: preflight.reason,
        failureRecord: createFailure(preflight.reason, 'critical', this.now(), {
          source: 'http-harness-preflight',
          status: preflight.status,
        }),
      });
    }

    try {
      const response =
        config.executionMode === 'REAL_HTTP_SERVER'
          ? await this.executeRealHttpServer(request, config)
          : await this.executeRouteHandlerSimulation(request, config.executionMode);
      return this.resultFromResponse({ request, config, startedAt, response, payloadBytes });
    } catch (error) {
      const failureRecord = createFailure('HTTP route-shadow execution failed safely.', 'critical', this.now(), {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.resultFromResponse({
        request,
        config,
        startedAt,
        response: failedHttpResponse(request, 'HTTP route-shadow execution failed safely.'),
        payloadBytes,
        failureRecord,
      });
    }
  }

  private async executeRouteHandlerSimulation(
    request: RouteShadowHttpRequest,
    executionMode: RouteShadowHttpExecutionMode
  ): Promise<RouteShadowHttpResponse> {
    const routeHandler = this.routeHandlers[request.routePath];
    if (!routeHandler) return blockedHttpResponse(request, 'Unsupported route shadow HTTP route.', 'BLOCKED');

    const httpRequest = new Request(`http://localhost${request.routePath}`, {
      method: request.method,
      headers: request.headers,
      body: request.rawBody ?? safeStringify(request.body),
    });
    const response = await routeHandler(httpRequest);
    return responseToHttpResponse(response, executionMode);
  }

  private async executeRealHttpServer(
    request: RouteShadowHttpRequest,
    config: RouteShadowHttpConfig
  ): Promise<RouteShadowHttpResponse> {
    if (!config.baseUrl) return blockedHttpResponse(request, 'REAL_HTTP_SERVER execution requires baseUrl.', 'BLOCKED');
    const response = await fetch(`${config.baseUrl}${request.routePath}`, {
      method: request.method,
      headers: request.headers,
      body: request.rawBody ?? safeStringify(request.body),
    });
    return responseToHttpResponse(response, 'REAL_HTTP_SERVER');
  }

  private resultFromResponse(input: {
    request: RouteShadowHttpRequest;
    config: RouteShadowHttpConfig;
    startedAt: string;
    response: RouteShadowHttpResponse;
    payloadBytes: number;
    blockedReason?: string;
    failureRecord?: RouteShadowHttpFailure;
  }): RouteShadowHttpResult {
    const completedAt = this.now();
    const latencyMs = Math.max(0, new Date(completedAt).getTime() - new Date(input.startedAt).getTime());
    const validation = validateRouteShadowHttpResponse(input.response);
    const finalVerdict = input.blockedReason ? 'BLOCKED' : validation.verdict;
    const auditBundle = createRouteShadowHttpAuditBundle({
      runId: `route-shadow-http-result-${input.request.requestId}`,
      request: input.request,
      config: input.config,
      validation,
      latencyMs,
      finalVerdict,
      generatedAt: completedAt,
      payloadBytes: input.payloadBytes,
      blockedReason: input.blockedReason,
    });

    return Object.freeze({
      resultId: `route-shadow-http-result-${hashString(`${input.request.requestId}|${input.request.routePath}|${completedAt}`)}`,
      requestId: input.request.requestId,
      routePath: input.request.routePath,
      flow: input.request.flow,
      executionMode: input.config.executionMode,
      httpStatus: input.response.httpStatus,
      verdict: finalVerdict,
      response: input.response,
      validation,
      hookReached: validation.hookReached,
      matched: validation.matched,
      driftDetected: validation.driftDetected,
      failure: validation.failure || finalVerdict === 'FAIL',
      rollback: validation.rollback,
      notComparable: readBoolean(input.response.body, 'notComparable'),
      selfMirrored: readBoolean(input.response.body, 'selfMirrored'),
      latencyMs,
      auditBundle,
      failureRecord: input.failureRecord,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }
}

function evaluatePreflight(
  request: RouteShadowHttpRequest,
  config: RouteShadowHttpConfig,
  now: string,
  payloadBytes: number
): { allowed: boolean; reason: string; status: 'DISABLED' | 'BLOCKED' } {
  const body = isRecord(request.body) ? request.body : {};
  const bodyPayload = isRecord(body.payload) ? body.payload : {};
  const routeConfig = isRecord(body.config) ? body.config : {};
  const gateInputs = isRecord(body.gateInputs) ? body.gateInputs : {};
  const approval = readApproval(body) ?? request.approval;
  const rawFlagAttempt =
    request.config?.allowLiveRouting === true ||
    request.config?.allowOutputReplacement === true ||
    request.config?.captureRawPayloads === true ||
    routeConfig.allowLiveRouting === true ||
    routeConfig.allowOutputReplacement === true ||
    routeConfig.captureRawPayloads === true;

  if (!config.enabled) return blocked('Route shadow HTTP harness is disabled.', 'DISABLED');
  if (config.environment === 'production' || config.environment === 'prod') return blocked('Production environment is blocked in Phase 6.1.', 'BLOCKED');
  if (config.environment === 'unknown') return blocked('Unknown environment is blocked in Phase 6.1.', 'BLOCKED');
  if (!config.allowedEnvironments.includes(config.environment)) return blocked('HTTP route shadow environment is not allowed.', 'BLOCKED');
  if (!config.allowedRoutes.includes(request.routePath)) return blocked('HTTP route shadow route is not allowed.', 'BLOCKED');
  if (!config.allowedFlows.includes(request.flow)) return blocked('HTTP route shadow flow is not allowed.', 'BLOCKED');
  if (config.maxRequestsPerRoute < 1) return blocked('HTTP route shadow maxRequestsPerRoute must be at least 1.', 'BLOCKED');
  if (payloadBytes > config.maxPayloadBytes) return blocked('HTTP route shadow payload exceeds maxPayloadBytes.', 'BLOCKED');
  if (rawFlagAttempt) return blocked('Live routing, output replacement, and raw payload capture flags are blocked in Phase 6.1.', 'BLOCKED');
  if (config.allowProductionEnvironment || config.allowLiveRouting || config.allowOutputReplacement || config.captureRawPayloads) {
    return blocked('Forbidden Phase 6.1 config flag was enabled.', 'BLOCKED');
  }
  if (containsRealDataMarker(request.rawBody ?? safeStringify(request.body))) return blocked('Raw or real student payload marker is blocked.', 'BLOCKED');

  if (request.rawBody === undefined && config.requireSyntheticMarker) {
    if (body.synthetic !== true || bodyPayload.synthetic !== true || bodyPayload.dataClassification !== 'SYNTHETIC') {
      return blocked('Synthetic marker is required for HTTP route shadow.', 'BLOCKED');
    }
  }

  if (request.rawBody === undefined && config.requireManualApproval) {
    if (!approval) return blocked('Manual approval is required for HTTP route shadow.', 'BLOCKED');
    const approvalValidation = validateRouteShadowApproval(approval, {
      environment: config.environment,
      flow: request.flow,
      routePath: request.routePath,
      now,
    });
    if (!approvalValidation.valid) return blocked(approvalValidation.reason, 'BLOCKED');
  }

  if (config.requireParityGate && gateInputs.expandedParityCIGatePassed !== true) return blocked('Parity gate did not pass.', 'BLOCKED');
  if (config.requirePrivacyGate && gateInputs.privacySafe !== true) return blocked('Privacy gate did not pass.', 'BLOCKED');
  if (config.requireTelemetryHealth && gateInputs.telemetryHealthy !== true) return blocked('Telemetry health gate did not pass.', 'BLOCKED');
  if (config.requireKillSwitchInactive && gateInputs.killSwitchActive !== false) return blocked('Kill switch is active or unknown.', 'BLOCKED');
  if (config.requireKillSwitchInactive && gateInputs.flowKillSwitchActive === true) return blocked('Flow kill switch is active.', 'BLOCKED');

  return { allowed: true, reason: 'HTTP route shadow request approved for shadow-only route execution.', status: 'BLOCKED' };
}

function blocked(reason: string, status: 'DISABLED' | 'BLOCKED') {
  return { allowed: false, reason, status };
}

function blockedHttpResponse(
  request: RouteShadowHttpRequest,
  reason: string,
  status: 'DISABLED' | 'BLOCKED'
): RouteShadowHttpResponse {
  return jsonHttpResponse(403, {
    status,
    verdict: 'BLOCKED',
    flow: request.flow,
    hookReached: false,
    matched: false,
    driftDetected: false,
    failure: true,
    rollback: false,
    auditSummary: {
      reason,
      routePath: request.routePath,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

function failedHttpResponse(request: RouteShadowHttpRequest, reason: string): RouteShadowHttpResponse {
  return jsonHttpResponse(500, {
    status: 'FAILED',
    verdict: 'FAIL',
    flow: request.flow,
    hookReached: false,
    matched: false,
    driftDetected: false,
    failure: true,
    rollback: false,
    auditSummary: {
      reason,
      routePath: request.routePath,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

export function routeShadowHttpJsonResponse(httpStatus: number, body: Readonly<Record<string, unknown>>): RouteShadowHttpResponse {
  return jsonHttpResponse(httpStatus, body);
}

function jsonHttpResponse(httpStatus: number, body: Readonly<Record<string, unknown>>): RouteShadowHttpResponse {
  return Object.freeze({
    httpStatus,
    body: JSON.parse(JSON.stringify(body)),
    headers: Object.freeze({ 'content-type': 'application/json' }),
    jsonSafe: true,
  });
}

async function responseToHttpResponse(response: Response, executionMode: RouteShadowHttpExecutionMode): Promise<RouteShadowHttpResponse> {
  const headers = Object.freeze(Object.fromEntries(response.headers.entries()));
  let body: unknown;
  let jsonSafe = true;
  try {
    body = await response.json();
    JSON.parse(JSON.stringify(body));
  } catch {
    jsonSafe = false;
    body = {
      status: 'FAILED',
      verdict: 'FAIL',
      flow: 'unknown',
      hookReached: false,
      matched: false,
      driftDetected: false,
      failure: true,
      rollback: false,
      auditSummary: {
        reason: `${executionMode} response was not JSON-safe.`,
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      },
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    };
  }
  return Object.freeze({
    httpStatus: response.status,
    body,
    headers,
    jsonSafe,
  });
}

function createMetrics(results: readonly RouteShadowHttpResult[]): RouteShadowHttpMetrics {
  return Object.freeze({
    totalRoutes: results.length,
    completedRoutes: results.filter((result) => result.httpStatus === 200).length,
    hookReachedCount: results.filter((result) => result.hookReached).length,
    matchedCount: results.filter((result) => result.matched).length,
    driftCount: results.filter((result) => result.driftDetected).length,
    failedCount: results.filter((result) => result.failure).length,
    rollbackCount: results.filter((result) => result.rollback).length,
    notComparableCount: results.filter((result) => result.notComparable).length,
    selfMirroredCount: results.filter((result) => result.selfMirrored).length,
    jsonSafeResponseCount: results.filter((result) => result.validation.jsonSafe).length,
    liveRoutingEnabledCount: results.filter((result) => result.liveRoutingEnabled).length,
  });
}

function aggregateVerdict(results: readonly RouteShadowHttpResult[]): RouteShadowHttpVerdict {
  if (results.some((result) => result.verdict === 'FAIL')) return 'FAIL';
  if (results.some((result) => result.verdict === 'BLOCKED')) return 'BLOCKED';
  if (results.some((result) => result.verdict === 'PASS_WITH_WARNINGS')) return 'PASS_WITH_WARNINGS';
  return 'PASS';
}

function readApproval(body: Record<string, unknown>): RouteShadowApproval | undefined {
  return isRecord(body.approval) ? (body.approval as unknown as RouteShadowApproval) : undefined;
}

function readBoolean(body: unknown, key: string): boolean {
  return isRecord(body) && body[key] === true;
}

function containsRealDataMarker(serialized: string): boolean {
  return (
    /"(rawStudentData|realStudentData)"\s*:\s*true/i.test(serialized) ||
    /"(studentEmail|studentPhone|studentAddress|ssn)"\s*:/i.test(serialized) ||
    /blocked@example\.com|@example\.com/i.test(serialized)
  );
}

function createFailure(
  reason: string,
  severity: RouteShadowHttpFailure['severity'],
  occurredAt: string,
  metadata: Readonly<Record<string, unknown>>
): RouteShadowHttpFailure {
  return Object.freeze({
    failureId: `route-shadow-http-failure-${hashString(`${reason}|${occurredAt}`)}`,
    reason,
    severity,
    occurredAt,
    metadata,
  });
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '[unserializable]';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
