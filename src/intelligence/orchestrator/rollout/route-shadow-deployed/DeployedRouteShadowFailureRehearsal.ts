/**
 * @fileoverview Failure rehearsal for Phase 6.3 deployed staging route shadow.
 */

import { createDeployedRouteShadowApproval } from './DeployedRouteShadowApprovalFactory';
import { DeployedRouteShadowHttpClient } from './DeployedRouteShadowHttpClient';
import { DeployedRouteShadowHarness, deployedRouteShadowJsonResponse } from './DeployedRouteShadowHarness';
import {
  ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH,
  createSyntheticAssessmentDeployedRequest,
} from './DeployedRouteShadowPayloadFactory';
import type { DeployedRouteShadowConfig, DeployedRouteShadowRequest, DeployedRouteShadowResponse, DeployedRouteShadowResult } from './DeployedRouteShadowTypes';

export type DeployedRouteShadowFailureCase =
  | 'production-environment'
  | 'unknown-environment'
  | 'config-disabled'
  | 'missing-approval'
  | 'expired-approval'
  | 'empty-base-url'
  | 'invalid-base-url'
  | 'production-host'
  | 'unknown-host'
  | 'non-allowlisted-host'
  | 'non-http-protocol'
  | 'missing-synthetic-marker'
  | 'raw-payload-attempt'
  | 'unsupported-flow'
  | 'unsupported-route'
  | 'oversized-payload'
  | 'http-timeout'
  | 'non-json-response'
  | 'http-500-response'
  | 'malformed-json'
  | 'hook-not-reached'
  | 'live-routing-enabled-true'
  | 'production-output-preserved-false'
  | 'stack-trace-leak'
  | 'drift-detected'
  | 'binding-failure'
  | 'missing-env-config'
  | 'staging-url-set-allowed-hosts-missing'
  | 'staging-url-host-not-in-allowed-hosts'
  | 'localhost-used-as-deployed-staging'
  | 'production-like-vercel-url-blocked'
  | 'approval-host-mismatch'
  | 'approval-expired-during-run'
  | 'live-routing-env-flag-attempted'
  | 'output-replacement-env-flag-attempted'
  | 'raw-payload-capture-env-flag-attempted';

export interface DeployedRouteShadowFailureRehearsalResult {
  caseName: DeployedRouteShadowFailureCase;
  handledSafely: boolean;
  result?: DeployedRouteShadowResult;
  runBlocked?: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  notes: readonly string[];
}

export class DeployedRouteShadowFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly DeployedRouteShadowFailureRehearsalResult[]> {
    const cases: DeployedRouteShadowFailureCase[] = [
      'production-environment',
      'unknown-environment',
      'config-disabled',
      'missing-approval',
      'expired-approval',
      'empty-base-url',
      'invalid-base-url',
      'production-host',
      'unknown-host',
      'non-allowlisted-host',
      'non-http-protocol',
      'missing-synthetic-marker',
      'raw-payload-attempt',
      'unsupported-flow',
      'unsupported-route',
      'oversized-payload',
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
      'missing-env-config',
      'staging-url-set-allowed-hosts-missing',
      'staging-url-host-not-in-allowed-hosts',
      'localhost-used-as-deployed-staging',
      'production-like-vercel-url-blocked',
      'approval-host-mismatch',
      'approval-expired-during-run',
      'live-routing-env-flag-attempted',
      'output-replacement-env-flag-attempted',
      'raw-payload-capture-env-flag-attempted',
    ];
    const results: DeployedRouteShadowFailureRehearsalResult[] = [];
    for (const caseName of cases) results.push(await this.runCase(caseName));
    return Object.freeze(results);
  }

  async runCase(caseName: DeployedRouteShadowFailureCase): Promise<DeployedRouteShadowFailureRehearsalResult> {
    let config: Partial<DeployedRouteShadowConfig> = healthyConfig();
    let request = healthyRequest();
    let client: DeployedRouteShadowHttpClient = new FakeDeployedClient(okResponse());

    switch (caseName) {
      case 'production-environment':
        config = { ...config, environment: 'production' };
        break;
      case 'unknown-environment':
        config = { ...config, environment: 'unknown' };
        break;
      case 'config-disabled':
        config = { ...config, enabled: false };
        break;
      case 'missing-approval':
        request = { ...request, approval: undefined, body: { ...bodyOf(request), approval: undefined } };
        break;
      case 'expired-approval':
        request = withApproval(expiredApproval());
        break;
      case 'empty-base-url':
        config = { ...config, baseUrl: '' };
        break;
      case 'invalid-base-url':
        config = { ...config, baseUrl: 'not-a-url' };
        break;
      case 'production-host':
        config = { ...config, baseUrl: 'https://app.careeros.com', allowedHosts: ['app.careeros.com'] };
        break;
      case 'unknown-host':
        config = { ...config, baseUrl: 'https://unknown.example.net', allowedHosts: [] };
        break;
      case 'non-allowlisted-host':
        config = { ...config, baseUrl: 'https://preview-careeros.vercel.app', allowedHosts: ['other.vercel.app'] };
        break;
      case 'non-http-protocol':
        config = { ...config, baseUrl: 'ftp://staging.example.com', allowedProtocols: ['ftp:'] };
        break;
      case 'missing-synthetic-marker':
        request = { ...request, body: { ...bodyOf(request), synthetic: false, payload: { synthetic: false, dataClassification: 'SYNTHETIC' } } };
        break;
      case 'raw-payload-attempt':
        request = { ...request, body: { ...bodyOf(request), payload: { synthetic: true, dataClassification: 'SYNTHETIC', rawStudentData: true, studentEmail: 'blocked@example.com' } } };
        break;
      case 'unsupported-flow':
        request = { ...request, flow: 'unsupported' as never };
        break;
      case 'unsupported-route':
        request = { ...request, routePath: '/api/internal/constitutional-shadow/unsupported' };
        break;
      case 'oversized-payload':
        request = { ...request, body: { ...bodyOf(request), payload: { synthetic: true, dataClassification: 'SYNTHETIC', large: 'x'.repeat(256) } } };
        config = { ...config, maxPayloadBytes: 16 };
        break;
      case 'http-timeout':
        client = new FakeDeployedClient(failedResponse('Deployed staging HTTP request timed out safely.'));
        break;
      case 'non-json-response':
        client = new FakeDeployedClient({ httpStatus: 200, body: 'not-json', headers: { 'content-type': 'text/plain' }, jsonSafe: false, latencyMs: 0 });
        break;
      case 'http-500-response':
        client = new FakeDeployedClient(failedResponse('Forced deployed HTTP 500 response.'));
        break;
      case 'malformed-json':
        request = { ...request, rawBody: '{"synthetic":true,' };
        client = new FakeDeployedClient(failedResponse('Malformed JSON failed safely.'));
        break;
      case 'hook-not-reached':
        client = new FakeDeployedClient(failedResponse('Hook not reached.', { rollback: true }));
        break;
      case 'live-routing-enabled-true':
        client = new FakeDeployedClient(okResponse({ liveRoutingEnabled: true }));
        break;
      case 'production-output-preserved-false':
        client = new FakeDeployedClient(okResponse({ productionOutputPreserved: false }));
        break;
      case 'stack-trace-leak':
        client = new FakeDeployedClient(okResponse({ error: 'Error: leaked\n    at secret.ts:1:1' }));
        break;
      case 'drift-detected':
        client = new FakeDeployedClient(failedResponse('Forced drift.', { hookReached: true, driftDetected: true, rollback: true }));
        break;
      case 'binding-failure':
        client = new FakeDeployedClient(failedResponse('Forced binding failure.', { hookReached: true, rollback: true }));
        break;
      case 'missing-env-config':
        config = { enabled: true, environment: 'unknown', baseUrl: '', allowedHosts: [] };
        break;
      case 'staging-url-set-allowed-hosts-missing':
        config = { ...config, baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: [] };
        break;
      case 'staging-url-host-not-in-allowed-hosts':
        config = { ...config, baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: ['different-preview.vercel.app'] };
        break;
      case 'localhost-used-as-deployed-staging':
        config = { ...config, baseUrl: 'http://localhost:3000', allowedHosts: ['localhost'] };
        break;
      case 'production-like-vercel-url-blocked':
        config = { ...config, baseUrl: 'https://prod-careeros-staging.vercel.app', allowedHosts: ['prod-careeros-staging.vercel.app'] };
        break;
      case 'approval-host-mismatch':
        request = { ...request, approval: { ...validApproval(), allowedHosts: ['different-preview.vercel.app'] } };
        break;
      case 'approval-expired-during-run':
        request = withApproval(expiredApproval());
        break;
      case 'live-routing-env-flag-attempted':
        request = { ...request, body: { ...bodyOf(request), config: { allowLiveRouting: true } } };
        break;
      case 'output-replacement-env-flag-attempted':
        request = { ...request, body: { ...bodyOf(request), config: { allowOutputReplacement: true } } };
        break;
      case 'raw-payload-capture-env-flag-attempted':
        request = { ...request, body: { ...bodyOf(request), config: { captureRawPayloads: true } } };
        break;
    }

    const result = await new DeployedRouteShadowHarness({ now: this.now, httpClient: client }).execute(request, config);
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

class FakeDeployedClient extends DeployedRouteShadowHttpClient {
  constructor(private readonly response: DeployedRouteShadowResponse) {
    super();
  }

  override async post(): Promise<DeployedRouteShadowResponse> {
    return this.response;
  }
}

function healthyConfig(): Partial<DeployedRouteShadowConfig> {
  return {
    enabled: true,
    environment: 'staging',
    baseUrl: 'https://preview-careeros-staging.vercel.app',
    allowedHosts: ['preview-careeros-staging.vercel.app'],
    allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH],
    allowedFlows: ['assessment'],
  };
}

function healthyRequest(): DeployedRouteShadowRequest {
  return withApproval(validApproval());
}

function validApproval() {
  return createDeployedRouteShadowApproval({
    approvedBy: 'phase-6-3-test',
    environment: 'staging',
    baseUrl: 'https://preview-careeros-staging.vercel.app',
    allowedHosts: ['preview-careeros-staging.vercel.app'],
    allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH],
    allowedFlows: ['assessment'],
    maxRequests: 1,
    reason: 'Phase 6.3 test approval.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    expiresAt: '2099-01-01T00:00:00.000Z',
  });
}

function expiredApproval() {
  return createDeployedRouteShadowApproval({
    approvedBy: 'phase-6-3-test',
    environment: 'staging',
    baseUrl: 'https://preview-careeros-staging.vercel.app',
    allowedHosts: ['preview-careeros-staging.vercel.app'],
    allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH],
    allowedFlows: ['assessment'],
    maxRequests: 1,
    reason: 'Expired Phase 6.3 test approval.',
    productionSafetyAcknowledgement: 'Production output remains authoritative.',
    expiresAt: '2026-06-05T00:00:00.000Z',
  });
}

function withApproval(approval: ReturnType<typeof validApproval>): DeployedRouteShadowRequest {
  return createSyntheticAssessmentDeployedRequest({ approval });
}

function okResponse(overrides: Readonly<Record<string, unknown>> = {}): DeployedRouteShadowResponse {
  return deployedRouteShadowJsonResponse(200, {
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

function failedResponse(reason: string, overrides: Readonly<Record<string, unknown>> = {}): DeployedRouteShadowResponse {
  return deployedRouteShadowJsonResponse(500, {
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

function bodyOf(request: DeployedRouteShadowRequest): Record<string, unknown> {
  return request.body as Record<string, unknown>;
}

function isHandledSafely(result: DeployedRouteShadowResult): boolean {
  const detectedUnsafe =
    !result.validation.valid &&
    (!result.validation.liveRoutingDisabled ||
      !result.validation.productionOutputPreserved ||
      result.validation.rawPayloadLeakDetected ||
      result.validation.stackTraceLeakDetected ||
      result.validation.internalSecretLeakDetected ||
      result.validation.productionMutationDetected ||
      !result.validation.jsonSafe);
  const safeValid =
    result.validation.valid &&
    result.validation.liveRoutingDisabled &&
    result.validation.productionOutputPreserved &&
    !result.validation.rawPayloadLeakDetected &&
    !result.validation.stackTraceLeakDetected &&
    !result.validation.internalSecretLeakDetected &&
    !result.validation.productionMutationDetected;
  return result.productionOutputPreserved && !result.liveRoutingEnabled && (result.verdict === 'BLOCKED' || result.verdict === 'FAIL') && (safeValid || detectedUnsafe);
}
