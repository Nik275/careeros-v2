/**
 * @fileoverview Real HTTP server harness for Phase 6.2 route shadow.
 */

import { validateRouteShadowApproval } from '../route-shadow/RouteShadowApprovalFactory';
import type { RouteShadowApproval } from '../route-shadow/RouteShadowTypes';
import { createRouteShadowServerAuditBundle } from './RouteShadowServerAuditBundle';
import {
  createRouteShadowServerConfig,
  isAllowedRouteShadowServerHost,
  isProductionRouteShadowServerHost,
  ROUTE_SHADOW_SERVER_FEASIBILITY,
} from './RouteShadowServerConfig';
import { RouteShadowServerHttpClient } from './RouteShadowServerHttpClient';
import {
  ASSESSMENT_ROUTE_SHADOW_SERVER_PATH,
  CAREER_FIT_ROUTE_SHADOW_SERVER_PATH,
  createSyntheticAssessmentServerRequest,
  createSyntheticCareerFitServerRequest,
} from './RouteShadowServerPayloadFactory';
import { RouteShadowServerProcessManager, type RouteShadowServerProcessStatus } from './RouteShadowServerProcessManager';
import { validateRouteShadowServerResponse } from './RouteShadowServerResponseValidator';
import type {
  RouteShadowServerConfig,
  RouteShadowServerExecutionMode,
  RouteShadowServerFailure,
  RouteShadowServerFeasibility,
  RouteShadowServerMetrics,
  RouteShadowServerRequest,
  RouteShadowServerResponse,
  RouteShadowServerResult,
  RouteShadowServerRun,
  RouteShadowServerStatus,
  RouteShadowServerVerdict,
} from './RouteShadowServerTypes';

export function getRouteShadowServerFeasibility(): RouteShadowServerFeasibility {
  return ROUTE_SHADOW_SERVER_FEASIBILITY;
}

export class RouteShadowServerHarness {
  private readonly now: () => string;
  private readonly processManager: RouteShadowServerProcessManager;
  private readonly httpClient: RouteShadowServerHttpClient;

  constructor(options: {
    now?: () => string;
    processManager?: RouteShadowServerProcessManager;
    httpClient?: RouteShadowServerHttpClient;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.processManager = options.processManager ?? new RouteShadowServerProcessManager();
    this.httpClient = options.httpClient ?? new RouteShadowServerHttpClient();
  }

  async executeSmokeTest(configInput: Partial<RouteShadowServerConfig> = {}): Promise<RouteShadowServerRun> {
    const startedAt = this.now();
    const config = createRouteShadowServerConfig({
      enabled: true,
      environment: 'staging',
      port: configInput.port ?? 31621,
      allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH, CAREER_FIT_ROUTE_SHADOW_SERVER_PATH],
      allowedFlows: ['assessment', 'career-fit'],
      ...configInput,
    });
    const runId = `route-shadow-server-run-${hashString(`${startedAt}|${config.baseUrl}`)}`;
    const preflight = evaluateServerPreflight(config);
    if (!preflight.allowed) {
      return blockedRun(runId, config, startedAt, this.now(), preflight.reason, preflight.status);
    }

    let startStatus: RouteShadowServerProcessStatus = {
      status: 'READY',
      started: false,
      ready: true,
      stopped: false,
      logs: '',
      reason: 'Existing server expected.',
    };
    let stopped = false;
    try {
      startStatus = await this.processManager.start(config);
      if (!startStatus.ready) {
        return blockedRun(runId, config, startedAt, this.now(), startStatus.reason ?? 'Server was not ready.', 'FAILED', startStatus, false);
      }

      const results = [
        await this.execute(createSyntheticAssessmentServerRequest(), config, runId, startStatus),
        await this.execute(createSyntheticCareerFitServerRequest(), config, runId, startStatus),
      ];
      const stopStatus = await this.processManager.stop();
      stopped = stopStatus.stopped;
      return Object.freeze({
        runId,
        executionMode: 'REAL_HTTP_SERVER',
        status: results.every((result) => result.status === 'COMPLETED') ? 'COMPLETED' : 'FAILED',
        verdict: aggregateVerdict(results),
        environment: config.environment,
        baseUrl: config.baseUrl,
        serverStartCommand: config.serverStartCommand ?? [],
        serverStarted: startStatus.started,
        serverReady: startStatus.ready,
        serverStopped: stopped,
        routes: Object.freeze(results.map((result) => result.routePath)),
        results: Object.freeze(results),
        metrics: createMetrics(results),
        startedAt,
        completedAt: this.now(),
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      });
    } finally {
      if (!stopped) await this.processManager.stop();
    }
  }

  async execute(
    request: RouteShadowServerRequest,
    configInput: Partial<RouteShadowServerConfig> = {},
    runId = `route-shadow-server-result-${request.requestId}`,
    processStatus?: RouteShadowServerProcessStatus
  ): Promise<RouteShadowServerResult> {
    const startedAt = this.now();
    const config = createRouteShadowServerConfig({
      ...request.config,
      ...configInput,
      environment: configInput.environment ?? request.config?.environment ?? request.environment,
    });
    const payloadBytes = Buffer.byteLength(request.rawBody ?? safeStringify(request.body), 'utf8');
    const preflight = evaluateRequestPreflight(request, config, this.now(), payloadBytes);
    if (!preflight.allowed) {
      return this.resultFromResponse({
        runId,
        request,
        config,
        response: blockedResponse(request, preflight.reason, preflight.status),
        startedAt,
        payloadBytes,
        serverStartStatus: processStatus?.status ?? 'BLOCKED',
        serverReadinessStatus: processStatus?.ready ? 'READY' : 'BLOCKED',
        executionMode: 'SERVER_BLOCKED',
        status: preflight.status,
        blockedReason: preflight.reason,
        failureRecord: createFailure(preflight.reason, 'critical', this.now(), { source: 'server-request-preflight' }),
      });
    }

    const response = await this.httpClient.post(request, config);
    return this.resultFromResponse({
      runId,
      request,
      config,
      response,
      startedAt,
      payloadBytes,
      serverStartStatus: processStatus?.status ?? 'READY',
      serverReadinessStatus: processStatus?.ready === false ? 'FAILED' : 'READY',
      executionMode: 'REAL_HTTP_SERVER',
      status: response.httpStatus === 200 ? 'COMPLETED' : 'FAILED',
    });
  }

  private resultFromResponse(input: {
    runId: string;
    request: RouteShadowServerRequest;
    config: RouteShadowServerConfig;
    response: RouteShadowServerResponse;
    startedAt: string;
    payloadBytes: number;
    serverStartStatus: RouteShadowServerStatus;
    serverReadinessStatus: RouteShadowServerStatus;
    executionMode: RouteShadowServerExecutionMode;
    status: RouteShadowServerStatus;
    blockedReason?: string;
    failureRecord?: RouteShadowServerFailure;
  }): RouteShadowServerResult {
    const completedAt = this.now();
    const validation = validateRouteShadowServerResponse(input.response);
    const finalVerdict = input.blockedReason ? 'BLOCKED' : validation.verdict;
    const auditBundle = createRouteShadowServerAuditBundle({
      runId: input.runId,
      request: input.request,
      config: input.config,
      validation,
      latencyMs: input.response.latencyMs,
      finalVerdict,
      generatedAt: completedAt,
      payloadBytes: input.payloadBytes,
      serverStartStatus: input.serverStartStatus,
      serverReadinessStatus: input.serverReadinessStatus,
      blockedReason: input.blockedReason,
    });

    return Object.freeze({
      resultId: `route-shadow-server-result-${hashString(`${input.request.requestId}|${input.request.routePath}|${completedAt}`)}`,
      requestId: input.request.requestId,
      routePath: input.request.routePath,
      flow: input.request.flow,
      executionMode: input.executionMode,
      status: input.status,
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
      latencyMs: input.response.latencyMs,
      auditBundle,
      failureRecord: input.failureRecord,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }
}

function evaluateServerPreflight(config: RouteShadowServerConfig): { allowed: boolean; reason: string; status: RouteShadowServerStatus } {
  if (!config.enabled) return blocked('Real HTTP server harness is disabled.', 'DISABLED');
  if (config.environment === 'production' || config.environment === 'prod') return blocked('Production environment is blocked in Phase 6.2.', 'BLOCKED');
  if (config.environment === 'unknown') return blocked('Unknown environment is blocked in Phase 6.2.', 'BLOCKED');
  if (!config.allowedEnvironments.includes(config.environment)) return blocked('Server environment is not allowed.', 'BLOCKED');
  if (!isAllowedRouteShadowServerHost(config.baseUrl)) return blocked('Server baseUrl host is not allowed.', 'BLOCKED');
  if (isProductionRouteShadowServerHost(config.baseUrl)) return blocked('Production host is blocked.', 'BLOCKED');
  if (config.allowProductionEnvironment || config.allowLiveRouting || config.allowOutputReplacement || config.captureRawPayloads) {
    return blocked('Forbidden Phase 6.2 config flag was enabled.', 'BLOCKED');
  }
  return { allowed: true, reason: 'Server preflight passed.', status: 'READY' };
}

function evaluateRequestPreflight(
  request: RouteShadowServerRequest,
  config: RouteShadowServerConfig,
  now: string,
  payloadBytes: number
): { allowed: boolean; reason: string; status: RouteShadowServerStatus } {
  const body = isRecord(request.body) ? request.body : {};
  const bodyPayload = isRecord(body.payload) ? body.payload : {};
  const routeConfig = isRecord(body.config) ? body.config : {};
  const gateInputs = isRecord(body.gateInputs) ? body.gateInputs : {};
  const approval = readApproval(body) ?? request.approval;

  if (!config.enabled) return blocked('Real HTTP server harness is disabled.', 'DISABLED');
  if (config.environment === 'production' || config.environment === 'prod') return blocked('Production environment is blocked in Phase 6.2.', 'BLOCKED');
  if (config.environment === 'unknown') return blocked('Unknown environment is blocked in Phase 6.2.', 'BLOCKED');
  if (!config.allowedEnvironments.includes(config.environment)) return blocked('Server environment is not allowed.', 'BLOCKED');
  if (!isAllowedRouteShadowServerHost(config.baseUrl)) return blocked('Server baseUrl host is not allowed.', 'BLOCKED');
  if (isProductionRouteShadowServerHost(config.baseUrl)) return blocked('Production host is blocked.', 'BLOCKED');
  if (!config.allowedRoutes.includes(request.routePath)) return blocked('Real HTTP server route is not allowed.', 'BLOCKED');
  if (!config.allowedFlows.includes(request.flow)) return blocked('Real HTTP server flow is not allowed.', 'BLOCKED');
  if (config.maxRequestsPerRoute < 1) return blocked('maxRequestsPerRoute must be at least 1.', 'BLOCKED');
  if (payloadBytes > config.maxPayloadBytes) return blocked('Real HTTP server payload exceeds maxPayloadBytes.', 'BLOCKED');
  if (containsRealDataMarker(request.rawBody ?? safeStringify(request.body))) return blocked('Raw or real student payload marker is blocked.', 'BLOCKED');
  if (routeConfig.allowLiveRouting === true || routeConfig.allowOutputReplacement === true || routeConfig.captureRawPayloads === true) {
    return blocked('Live routing, output replacement, and raw payload capture flags are blocked in Phase 6.2.', 'BLOCKED');
  }
  if (request.rawBody === undefined && config.requireSyntheticMarker) {
    if (body.synthetic !== true || bodyPayload.synthetic !== true || bodyPayload.dataClassification !== 'SYNTHETIC') {
      return blocked('Synthetic marker is required for real HTTP server route shadow.', 'BLOCKED');
    }
  }
  if (request.rawBody === undefined && config.requireManualApproval) {
    if (!approval) return blocked('Manual approval is required for real HTTP server route shadow.', 'BLOCKED');
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

  return { allowed: true, reason: 'Request preflight passed.', status: 'READY' };
}

function blocked(reason: string, status: RouteShadowServerStatus) {
  return { allowed: false, reason, status };
}

export function routeShadowServerJsonResponse(httpStatus: number, body: Readonly<Record<string, unknown>>, latencyMs = 0) {
  return Object.freeze({
    httpStatus,
    body: JSON.parse(JSON.stringify(body)),
    headers: Object.freeze({ 'content-type': 'application/json' }),
    jsonSafe: true,
    latencyMs,
  });
}

function blockedResponse(request: RouteShadowServerRequest, reason: string, status: RouteShadowServerStatus) {
  return routeShadowServerJsonResponse(403, {
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

function blockedRun(
  runId: string,
  config: RouteShadowServerConfig,
  startedAt: string,
  completedAt: string,
  reason: string,
  status: RouteShadowServerStatus,
  startStatus?: RouteShadowServerProcessStatus,
  stopped = true
): RouteShadowServerRun {
  return Object.freeze({
    runId,
    executionMode: status === 'FAILED' ? 'SERVER_START_FAILED' : 'SERVER_BLOCKED',
    status,
    verdict: 'BLOCKED',
    environment: config.environment,
    baseUrl: config.baseUrl,
    serverStartCommand: config.serverStartCommand ?? [],
    serverStarted: startStatus?.started ?? false,
    serverReady: startStatus?.ready ?? false,
    serverStopped: stopped,
    routes: Object.freeze([]),
    results: Object.freeze([]),
    metrics: createMetrics([]),
    startedAt,
    completedAt,
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

function createMetrics(results: readonly RouteShadowServerResult[]): RouteShadowServerMetrics {
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

function aggregateVerdict(results: readonly RouteShadowServerResult[]): RouteShadowServerVerdict {
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
  severity: RouteShadowServerFailure['severity'],
  occurredAt: string,
  metadata: Readonly<Record<string, unknown>>
): RouteShadowServerFailure {
  return Object.freeze({
    failureId: `route-shadow-server-failure-${hashString(`${reason}|${occurredAt}`)}`,
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
