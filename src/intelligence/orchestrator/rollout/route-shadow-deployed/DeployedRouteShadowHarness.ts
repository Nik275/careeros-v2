/**
 * @fileoverview Deployed staging route-shadow harness for Phase 6.3.
 */

import { DeployedStagingHostGuard } from './DeployedStagingHostGuard';
import { createDeployedRouteShadowAuditBundle } from './DeployedRouteShadowAuditBundle';
import { createDeployedRouteShadowApproval } from './DeployedRouteShadowApprovalFactory';
import { validateDeployedRouteShadowApproval } from './DeployedRouteShadowApprovalFactory';
import { createDeployedRouteShadowConfig, DEPLOYED_STAGING_FEASIBILITY } from './DeployedRouteShadowConfig';
import { DeployedRouteShadowHttpClient, deployedJsonResponse } from './DeployedRouteShadowHttpClient';
import {
  ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH,
  CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH,
  createSyntheticAssessmentDeployedRequest,
  createSyntheticCareerFitDeployedRequest,
} from './DeployedRouteShadowPayloadFactory';
import { validateDeployedRouteShadowResponse } from './DeployedRouteShadowResponseValidator';
import type {
  DeployedRouteShadowConfig,
  DeployedRouteShadowExecutionMode,
  DeployedRouteShadowFailure,
  DeployedRouteShadowMetrics,
  DeployedRouteShadowRequest,
  DeployedRouteShadowResponse,
  DeployedRouteShadowResult,
  DeployedRouteShadowRun,
  DeployedRouteShadowStatus,
  DeployedRouteShadowVerdict,
  DeployedStagingFeasibility,
  DeployedStagingFeasibilityStatus,
  DeployedStagingHostDecision,
} from './DeployedRouteShadowTypes';

export function getDeployedStagingFeasibility(): DeployedStagingFeasibility {
  return DEPLOYED_STAGING_FEASIBILITY;
}

export class DeployedRouteShadowHarness {
  private readonly now: () => string;
  private readonly hostGuard: DeployedStagingHostGuard;
  private readonly httpClient: DeployedRouteShadowHttpClient;

  constructor(options: {
    now?: () => string;
    hostGuard?: DeployedStagingHostGuard;
    httpClient?: DeployedRouteShadowHttpClient;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.hostGuard = options.hostGuard ?? new DeployedStagingHostGuard();
    this.httpClient = options.httpClient ?? new DeployedRouteShadowHttpClient();
  }

  async executeSmokeTest(configInput: Partial<DeployedRouteShadowConfig> = {}): Promise<DeployedRouteShadowRun> {
    const startedAt = this.now();
    const config = createDeployedRouteShadowConfig({
      enabled: true,
      environment: 'staging',
      allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH, CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH],
      allowedFlows: ['assessment', 'career-fit'],
      ...configInput,
    });
    const runId = `deployed-route-shadow-run-${hashString(`${startedAt}|${config.baseUrl}`)}`;
    const hostDecision = this.hostGuard.evaluate(config);
    const preflight = evaluateRunPreflight(config, hostDecision);
    if (!preflight.allowed) {
      return blockedRun(runId, config, startedAt, this.now(), hostDecision, preflight.feasibilityStatus, preflight.reason);
    }

    const assessmentApproval = createDeployedRouteShadowApproval({
      approvedBy: 'phase-6-3-harness',
      environment: config.environment,
      baseUrl: config.baseUrl,
      allowedHosts: config.allowedHosts,
      allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH],
      allowedFlows: ['assessment'],
      maxRequests: 1,
      reason: 'Phase 6.3 deployed staging smoke test approval.',
      productionSafetyAcknowledgement: 'Production output remains authoritative.',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
    const careerFitApproval = createDeployedRouteShadowApproval({
      approvedBy: 'phase-6-3-harness',
      environment: config.environment,
      baseUrl: config.baseUrl,
      allowedHosts: config.allowedHosts,
      allowedRoutes: [CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH],
      allowedFlows: ['career-fit'],
      maxRequests: 1,
      reason: 'Phase 6.3 deployed staging smoke test approval.',
      productionSafetyAcknowledgement: 'Production output remains authoritative.',
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
    const results = [
      await this.execute(createSyntheticAssessmentDeployedRequest({ approval: assessmentApproval }), config, runId, hostDecision),
      await this.execute(createSyntheticCareerFitDeployedRequest({ approval: careerFitApproval }), config, runId, hostDecision),
    ];
    return Object.freeze({
      runId,
      executionMode: 'DEPLOYED_STAGING_HTTP',
      status: results.every((result) => result.status === 'COMPLETED') ? 'COMPLETED' : 'FAILED',
      verdict: aggregateVerdict(results),
      feasibilityStatus: 'DEPLOYED_STAGING_SUPPORTED',
      baseUrlSummary: hostDecision.baseUrlSummary,
      hostDecision,
      deployedHttpRequestsSent: true,
      routes: Object.freeze(results.map((result) => result.routePath)),
      results: Object.freeze(results),
      metrics: createMetrics(results),
      startedAt,
      completedAt: this.now(),
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    });
  }

  async execute(
    request: DeployedRouteShadowRequest,
    configInput: Partial<DeployedRouteShadowConfig> = {},
    runId = `deployed-route-shadow-result-${request.requestId}`,
    hostDecisionInput?: DeployedStagingHostDecision
  ): Promise<DeployedRouteShadowResult> {
    const startedAt = this.now();
    const config = createDeployedRouteShadowConfig({
      ...request.config,
      ...configInput,
      environment: configInput.environment ?? request.config?.environment ?? request.environment,
    });
    const hostDecision = hostDecisionInput ?? this.hostGuard.evaluate(config);
    const payloadBytes = Buffer.byteLength(request.rawBody ?? safeStringify(request.body), 'utf8');
    const preflight = evaluateRequestPreflight(request, config, hostDecision, this.now(), payloadBytes);
    if (!preflight.allowed) {
      return this.resultFromResponse({
        runId,
        request,
        config,
        hostDecision,
        response: blockedResponse(request, preflight.reason, preflight.status),
        status: preflight.status,
        executionMode: executionModeForHostDecision(hostDecision),
        blockedReason: preflight.reason,
        payloadBytes,
        failureRecord: failure(preflight.reason, 'critical', this.now(), { source: 'deployed-request-preflight' }),
      });
    }

    const response = await this.httpClient.post(request, config);
    return this.resultFromResponse({
      runId,
      request,
      config,
      hostDecision,
      response,
      status: response.httpStatus === 200 ? 'COMPLETED' : 'FAILED',
      executionMode: 'DEPLOYED_STAGING_HTTP',
      payloadBytes,
    });
  }

  private resultFromResponse(input: {
    runId: string;
    request: DeployedRouteShadowRequest;
    config: DeployedRouteShadowConfig;
    hostDecision: DeployedStagingHostDecision;
    response: DeployedRouteShadowResponse;
    status: DeployedRouteShadowStatus;
    executionMode: DeployedRouteShadowExecutionMode;
    payloadBytes: number;
    blockedReason?: string;
    failureRecord?: DeployedRouteShadowFailure;
  }): DeployedRouteShadowResult {
    const validation = validateDeployedRouteShadowResponse(input.response);
    const finalVerdict = input.blockedReason ? 'BLOCKED' : validation.verdict;
    const auditBundle = createDeployedRouteShadowAuditBundle({
      runId: input.runId,
      request: input.request,
      config: input.config,
      hostDecision: input.hostDecision,
      validation,
      latencyMs: input.response.latencyMs,
      finalVerdict,
      generatedAt: this.now(),
      payloadBytes: input.payloadBytes,
      blockedReason: input.blockedReason,
    });
    return Object.freeze({
      resultId: `deployed-route-shadow-result-${hashString(`${input.request.requestId}|${input.request.routePath}|${this.now()}`)}`,
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

function evaluateRunPreflight(config: DeployedRouteShadowConfig, hostDecision: DeployedStagingHostDecision): { allowed: boolean; feasibilityStatus: DeployedStagingFeasibilityStatus; reason: string } {
  if (!config.enabled) return { allowed: false, feasibilityStatus: 'DEPLOYED_STAGING_BLOCKED_BY_CONFIG', reason: 'Deployed staging harness is disabled.' };
  if (config.environment === 'production' || config.environment === 'prod') return { allowed: false, feasibilityStatus: 'DEPLOYED_STAGING_BLOCKED_BY_ENVIRONMENT_GUARD', reason: 'Production environment is blocked in Phase 6.3.' };
  if (config.environment === 'unknown') return { allowed: false, feasibilityStatus: 'DEPLOYED_STAGING_BLOCKED_BY_ENVIRONMENT_GUARD', reason: 'Unknown environment is blocked in Phase 6.3.' };
  if (!hostDecision.allowed) return { allowed: false, feasibilityStatus: hostDecision.status, reason: hostDecision.reason };
  return { allowed: true, feasibilityStatus: 'DEPLOYED_STAGING_SUPPORTED', reason: 'Run preflight passed.' };
}

function evaluateRequestPreflight(
  request: DeployedRouteShadowRequest,
  config: DeployedRouteShadowConfig,
  hostDecision: DeployedStagingHostDecision,
  now: string,
  payloadBytes: number
): { allowed: boolean; status: DeployedRouteShadowStatus; reason: string } {
  const body = isRecord(request.body) ? request.body : {};
  const bodyPayload = isRecord(body.payload) ? body.payload : {};
  const routeConfig = isRecord(body.config) ? body.config : {};
  const gateInputs = isRecord(body.gateInputs) ? body.gateInputs : {};

  if (!config.enabled) return block('DISABLED', 'Deployed staging harness is disabled.');
  if (config.environment === 'production' || config.environment === 'prod') return block('BLOCKED', 'Production environment is blocked in Phase 6.3.');
  if (config.environment === 'unknown') return block('BLOCKED', 'Unknown environment is blocked in Phase 6.3.');
  if (!hostDecision.allowed) return block('BLOCKED', hostDecision.reason);
  if (!config.allowedRoutes.includes(request.routePath)) return block('BLOCKED', 'Deployed staging route is not allowed.');
  if (!config.allowedFlows.includes(request.flow)) return block('BLOCKED', 'Deployed staging flow is not allowed.');
  if (payloadBytes > config.maxPayloadBytes) return block('BLOCKED', 'Deployed staging payload exceeds maxPayloadBytes.');
  if (containsRealDataMarker(request.rawBody ?? safeStringify(request.body))) return block('BLOCKED', 'Raw or real student payload marker is blocked.');
  if (routeConfig.allowLiveRouting === true || routeConfig.allowOutputReplacement === true || routeConfig.captureRawPayloads === true) return block('BLOCKED', 'Live routing, output replacement, and raw payload capture flags are blocked.');
  if (config.requireSyntheticMarker && request.rawBody === undefined && (body.synthetic !== true || bodyPayload.synthetic !== true || bodyPayload.dataClassification !== 'SYNTHETIC')) return block('BLOCKED', 'Synthetic marker is required.');
  if (config.requireManualApproval) {
    const approvalValidation = validateDeployedRouteShadowApproval(request.approval, {
      environment: config.environment,
      baseUrl: config.baseUrl,
      host: hostDecision.host,
      flow: request.flow,
      routePath: request.routePath,
      now,
    });
    if (!approvalValidation.valid) return block('BLOCKED', approvalValidation.reason);
  }
  if (config.requireParityGate && gateInputs.expandedParityCIGatePassed !== true) return block('BLOCKED', 'Parity gate did not pass.');
  if (config.requirePrivacyGate && gateInputs.privacySafe !== true) return block('BLOCKED', 'Privacy gate did not pass.');
  if (config.requireTelemetryHealth && gateInputs.telemetryHealthy !== true) return block('BLOCKED', 'Telemetry health gate did not pass.');
  if (config.requireKillSwitchInactive && gateInputs.killSwitchActive !== false) return block('BLOCKED', 'Kill switch is active or unknown.');
  if (config.requireKillSwitchInactive && gateInputs.flowKillSwitchActive === true) return block('BLOCKED', 'Flow kill switch is active.');
  return { allowed: true, status: 'READY', reason: 'Request preflight passed.' };
}

function block(status: DeployedRouteShadowStatus, reason: string) {
  return { allowed: false, status, reason };
}

function blockedRun(runId: string, config: DeployedRouteShadowConfig, startedAt: string, completedAt: string, hostDecision: DeployedStagingHostDecision, status: DeployedStagingFeasibilityStatus, reason: string): DeployedRouteShadowRun {
  return Object.freeze({
    runId,
    executionMode: executionModeForHostDecision(hostDecision),
    status: config.enabled ? 'BLOCKED' : 'DISABLED',
    verdict: 'BLOCKED',
    feasibilityStatus: status,
    baseUrlSummary: hostDecision.baseUrlSummary,
    hostDecision,
    deployedHttpRequestsSent: false,
    routes: Object.freeze([]),
    results: Object.freeze([]),
    metrics: createMetrics([]),
    startedAt,
    completedAt,
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

export function deployedRouteShadowJsonResponse(httpStatus: number, body: Readonly<Record<string, unknown>>, latencyMs = 0): DeployedRouteShadowResponse {
  return Object.freeze({ httpStatus, body: JSON.parse(JSON.stringify(body)), headers: Object.freeze({ 'content-type': 'application/json' }), jsonSafe: true, latencyMs });
}

function blockedResponse(request: DeployedRouteShadowRequest, reason: string, status: DeployedRouteShadowStatus): DeployedRouteShadowResponse {
  return deployedRouteShadowJsonResponse(403, {
    status,
    verdict: 'BLOCKED',
    flow: request.flow,
    hookReached: false,
    matched: false,
    driftDetected: false,
    failure: true,
    rollback: false,
    auditSummary: { reason, productionOutputPreserved: true, liveRoutingEnabled: false },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  });
}

function executionModeForHostDecision(hostDecision: DeployedStagingHostDecision): DeployedRouteShadowExecutionMode {
  if (hostDecision.allowed) return 'DEPLOYED_STAGING_HTTP';
  if (hostDecision.status === 'DEPLOYED_STAGING_URL_MISSING') return 'DEPLOYED_STAGING_UNAVAILABLE';
  if (hostDecision.status === 'DEPLOYED_STAGING_UNSAFE_HOST') return 'DEPLOYED_STAGING_UNSAFE';
  return 'DEPLOYED_STAGING_BLOCKED';
}

function createMetrics(results: readonly DeployedRouteShadowResult[]): DeployedRouteShadowMetrics {
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

function aggregateVerdict(results: readonly DeployedRouteShadowResult[]): DeployedRouteShadowVerdict {
  if (results.some((result) => result.verdict === 'FAIL')) return 'FAIL';
  if (results.some((result) => result.verdict === 'BLOCKED')) return 'BLOCKED';
  if (results.some((result) => result.verdict === 'PASS_WITH_WARNINGS')) return 'PASS_WITH_WARNINGS';
  return 'PASS';
}

function containsRealDataMarker(serialized: string): boolean {
  return /"(rawStudentData|realStudentData)"\s*:\s*true/i.test(serialized) || /"(studentEmail|studentPhone|studentAddress|ssn)"\s*:/i.test(serialized) || /blocked@example\.com|@example\.com/i.test(serialized);
}
function failure(reason: string, severity: DeployedRouteShadowFailure['severity'], occurredAt: string, metadata: Readonly<Record<string, unknown>>): DeployedRouteShadowFailure {
  return Object.freeze({ failureId: `deployed-route-shadow-failure-${hashString(`${reason}|${occurredAt}`)}`, reason, severity, occurredAt, metadata });
}
function readBoolean(body: unknown, key: string): boolean { return isRecord(body) && body[key] === true; }
function safeStringify(value: unknown): string { try { return JSON.stringify(value) ?? ''; } catch { return '[unserializable]'; } }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function hashString(value: string): string { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
