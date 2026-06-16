import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  hasRouteShadowInternalAccessClaim,
  ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH,
} from '../../../../security/internal-access-claims';
import { isStagingSmokeHarnessHost } from '../../../../security/staging-smoke-harness';
import {
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
  createRouteShadowTestApproval,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowSyntheticPayloads';
import { ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS } from '../../../api/internal/constitutional-shadow/route-shadow-security';
import type {
  RouteShadowFlow,
  RouteShadowRequest,
} from '../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowTypes';

export const dynamic = 'force-dynamic';

type SmokeCheckStatus = 'PASS' | 'FAIL';

interface SmokeCheckResult {
  readonly id: string;
  readonly label: string;
  readonly expected: string;
  readonly actualStatus: number | null;
  readonly status: SmokeCheckStatus;
  readonly rawPayloadEchoed: boolean;
  readonly summary: Readonly<Record<string, unknown>>;
}

interface SmokeHarnessResult {
  readonly generatedAt: string;
  readonly stagingOnly: true;
  readonly authenticated: true;
  readonly internalAccessClaimPath: typeof ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH;
  readonly internalAccessClaimResolved: true;
  readonly syntheticOnly: true;
  readonly liveRoutingEnabled: false;
  readonly allowOutputReplacement: false;
  readonly captureRawPayloads: false;
  readonly realAiCallsEnabled: false;
  readonly rawPayloadEchoDetected: boolean;
  readonly overallStatus: SmokeCheckStatus;
  readonly checks: readonly SmokeCheckResult[];
}

interface RouteProbeInput {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly expected: string;
  readonly expectedStatuses: readonly number[];
  readonly body: string;
  readonly contentType?: string;
  readonly origin?: string;
  readonly markers: readonly string[];
  readonly validate?: (summary: Readonly<Record<string, unknown>>, status: number) => boolean;
}

export async function POST(request: Request): Promise<Response> {
  if (!isStagingSmokeHarnessHost(new URL(request.url).host)) {
    return new NextResponse(null, { status: 404 });
  }

  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  }
  if (!hasRouteShadowInternalAccessClaim(authResult.sessionClaims)) {
    return NextResponse.json({ error: 'Internal access is required.' }, { status: 403 });
  }

  const result = await runAuthenticatedSmokeChecks(request);
  return NextResponse.json(result, {
    status: result.overallStatus === 'PASS' ? 200 : 500,
    headers: {
      'cache-control': 'no-store',
    },
  });
}

async function runAuthenticatedSmokeChecks(request: Request): Promise<SmokeHarnessResult> {
  const origin = new URL(request.url).origin;
  const cookieHeader = request.headers.get('cookie') ?? '';
  const assessmentPayload = validSyntheticPayload('assessment', `staging-2e-assessment-${crypto.randomUUID()}`);
  const careerFitPayload = validSyntheticPayload('career-fit', `staging-2e-career-fit-${crypto.randomUUID()}`);
  const oversizedMarker = `staging-2e-oversized-${crypto.randomUUID()}`;
  const malformedMarker = `staging-2e-malformed-${crypto.randomUUID()}`;
  const invalidTypeMarker = `staging-2e-invalid-type-${crypto.randomUUID()}`;
  const crossOriginMarker = `staging-2e-cross-origin-${crypto.randomUUID()}`;

  const checks: SmokeCheckResult[] = [];

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'assessment-valid-shadow',
      label: 'Internal operator assessment shadow request',
      path: ASSESSMENT_ROUTE_SHADOW_PATH,
      expected: '200 completed synthetic shadow response',
      expectedStatuses: [200],
      body: JSON.stringify(assessmentPayload),
      contentType: 'application/json',
      markers: [assessmentPayload.requestId],
      validate: (summary) =>
        summary.status === 'COMPLETED' &&
        summary.flow === 'assessment' &&
        summary.productionOutputPreserved === true &&
        summary.liveRoutingEnabled === false,
    })
  );

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'career-fit-valid-shadow',
      label: 'Internal operator career-fit shadow request',
      path: CAREER_FIT_ROUTE_SHADOW_PATH,
      expected: '200 completed synthetic shadow response',
      expectedStatuses: [200],
      body: JSON.stringify(careerFitPayload),
      contentType: 'application/json',
      markers: [careerFitPayload.requestId],
      validate: (summary) =>
        summary.status === 'COMPLETED' &&
        summary.flow === 'career-fit' &&
        summary.productionOutputPreserved === true &&
        summary.liveRoutingEnabled === false,
    })
  );

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'invalid-content-type',
      label: 'Invalid content type',
      path: ASSESSMENT_ROUTE_SHADOW_PATH,
      expected: '415 unsupported content type',
      expectedStatuses: [415],
      body: JSON.stringify({ marker: invalidTypeMarker, synthetic: true, dataClassification: 'SYNTHETIC' }),
      contentType: 'text/plain',
      markers: [invalidTypeMarker],
      validate: (summary) => summary.auditReason === 'Unsupported content type.',
    })
  );

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'malformed-json',
      label: 'Malformed JSON',
      path: ASSESSMENT_ROUTE_SHADOW_PATH,
      expected: '400 safe parse failure',
      expectedStatuses: [400],
      body: `{"synthetic":true,"marker":"${malformedMarker}"`,
      contentType: 'application/json',
      markers: [malformedMarker],
      validate: (summary) => summary.auditReason === 'Route shadow request parsing failed safely.',
    })
  );

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'oversized-body',
      label: 'Oversized body',
      path: ASSESSMENT_ROUTE_SHADOW_PATH,
      expected: '413 or safe block for oversized body',
      expectedStatuses: [413],
      body: JSON.stringify({
        synthetic: true,
        dataClassification: 'SYNTHETIC',
        marker: oversizedMarker,
        filler: 'x'.repeat(70_000),
      }),
      contentType: 'application/json',
      markers: [oversizedMarker],
      validate: (summary) => summary.auditReason === 'Route shadow request body is too large.',
    })
  );

  checks.push(
    await executeRouteProbe(origin, cookieHeader, {
      id: 'cross-origin-block',
      label: 'Cross-origin POST boundary',
      path: ASSESSMENT_ROUTE_SHADOW_PATH,
      expected: '403 blocked unsafe origin',
      expectedStatuses: [403],
      body: JSON.stringify(validSyntheticPayload('assessment', crossOriginMarker)),
      contentType: 'application/json',
      origin: 'https://attacker.example',
      markers: [crossOriginMarker],
      validate: (summary) => summary.auditReason === 'Origin is not allowed for internal route shadow access.',
    })
  );

  checks.push(await executeRateLimitProbe(origin, cookieHeader));

  const rawPayloadEchoDetected = checks.some((check) => check.rawPayloadEchoed);
  const overallStatus = checks.every((check) => check.status === 'PASS') && !rawPayloadEchoDetected ? 'PASS' : 'FAIL';

  return {
    generatedAt: new Date().toISOString(),
    stagingOnly: true,
    authenticated: true,
    internalAccessClaimPath: ROUTE_SHADOW_INTERNAL_ACCESS_CLAIM_PATH,
    internalAccessClaimResolved: true,
    syntheticOnly: true,
    liveRoutingEnabled: false,
    allowOutputReplacement: false,
    captureRawPayloads: false,
    realAiCallsEnabled: false,
    rawPayloadEchoDetected,
    overallStatus,
    checks,
  };
}

async function executeRateLimitProbe(origin: string, cookieHeader: string): Promise<SmokeCheckResult> {
  const marker = `staging-2e-rate-limit-${crypto.randomUUID()}`;
  let finalCheck: SmokeCheckResult | undefined;

  for (let index = 0; index <= ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS + 1; index += 1) {
    finalCheck = await executeRouteProbe(origin, cookieHeader, {
      id: 'rate-limit',
      label: 'Repeated abuse rate limit',
      path: CAREER_FIT_ROUTE_SHADOW_PATH,
      expected: '429 rate limited after repeated requests',
      expectedStatuses: [429],
      body: `{"synthetic":true,"marker":"${marker}-${index}"`,
      contentType: 'application/json',
      markers: [marker],
      validate: (summary) => summary.auditReason === 'Route shadow rate limit exceeded.',
    });
    if (finalCheck.actualStatus === 429) break;
  }

  return finalCheck ?? {
    id: 'rate-limit',
    label: 'Repeated abuse rate limit',
    expected: '429 rate limited after repeated requests',
    actualStatus: null,
    status: 'FAIL',
    rawPayloadEchoed: false,
    summary: { error: 'Rate limit probe did not execute.' },
  };
}

async function executeRouteProbe(origin: string, cookieHeader: string, input: RouteProbeInput): Promise<SmokeCheckResult> {
  const headers = new Headers();
  if (input.contentType) headers.set('content-type', input.contentType);
  if (input.origin) headers.set('origin', input.origin);
  if (cookieHeader) headers.set('cookie', cookieHeader);

  try {
    const response = await fetch(new URL(input.path, origin), {
      method: 'POST',
      headers,
      body: input.body,
      cache: 'no-store',
      redirect: 'manual',
    });
    const text = await response.text();
    const summary = routeResponseSummary(parseJsonRecord(text));
    const statusMatches = input.expectedStatuses.includes(response.status);
    const rawPayloadEchoed = input.markers.some((marker) => text.includes(marker));
    const domainMatches = input.validate ? input.validate(summary, response.status) : true;

    return {
      id: input.id,
      label: input.label,
      expected: input.expected,
      actualStatus: response.status,
      status: statusMatches && domainMatches && !rawPayloadEchoed ? 'PASS' : 'FAIL',
      rawPayloadEchoed,
      summary,
    };
  } catch (error) {
    return {
      id: input.id,
      label: input.label,
      expected: input.expected,
      actualStatus: null,
      status: 'FAIL',
      rawPayloadEchoed: false,
      summary: { error: error instanceof Error ? error.message : 'Unknown smoke probe failure.' },
    };
  }
}

function validSyntheticPayload(flow: RouteShadowFlow, requestId: string): RouteShadowRequest {
  const routePath = flow === 'assessment' ? ASSESSMENT_ROUTE_SHADOW_PATH : CAREER_FIT_ROUTE_SHADOW_PATH;
  const base =
    flow === 'assessment'
      ? createSyntheticAssessmentRoutePayload({
          requestId,
          approval: createRouteShadowTestApproval({
            flows: [flow],
            routes: [routePath],
            expiresAt: '2099-01-01T00:00:00.000Z',
          }),
        })
      : createSyntheticCareerFitRoutePayload({
          requestId,
          approval: createRouteShadowTestApproval({
            flows: [flow],
            routes: [routePath],
            expiresAt: '2099-01-01T00:00:00.000Z',
          }),
        });

  return {
    ...base,
    requestId,
    config: {
      ...base.config,
      enabled: true,
      environment: 'staging',
      allowedFlows: [flow],
      allowLiveRouting: false,
      allowOutputReplacement: false,
      captureRawPayloads: false,
    },
    metadata: {
      ...base.metadata,
      synthetic: true,
      dataClassification: 'SYNTHETIC',
      stagingSmokeHarness: true,
    },
  };
}

function routeResponseSummary(value: Readonly<Record<string, unknown>> | undefined): Readonly<Record<string, unknown>> {
  if (!value) return { jsonSafe: false };
  const auditSummary = isRecord(value.auditSummary) ? value.auditSummary : undefined;
  return {
    jsonSafe: true,
    status: value.status,
    verdict: value.verdict,
    flow: value.flow,
    hookReached: value.hookReached,
    matched: value.matched,
    driftDetected: value.driftDetected,
    failure: value.failure,
    rollback: value.rollback,
    productionOutputPreserved: value.productionOutputPreserved,
    liveRoutingEnabled: value.liveRoutingEnabled,
    auditReason: auditSummary?.reason,
  };
}

function parseJsonRecord(text: string): Readonly<Record<string, unknown>> | undefined {
  try {
    const value = JSON.parse(text) as unknown;
    return isRecord(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
