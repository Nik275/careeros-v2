import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { RouteShadowExecutionService } from '../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowExecutionService';
import { hasRouteShadowInternalAccessClaim } from '../../../../security/internal-access-claims';
import type {
  RouteShadowConfig,
  RouteShadowFlow,
  RouteShadowGateInputs,
  RouteShadowRequest,
  RouteShadowResponse,
  RouteShadowStatus,
  RouteShadowVerdict,
} from '../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowTypes';

export const ROUTE_SHADOW_INTERNAL_ACCESS_HEADER = 'x-careeros-internal-access';
export const ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE = 'route-shadow-local-test';
export const ROUTE_SHADOW_MAX_BODY_BYTES = 64 * 1024;
export const ROUTE_SHADOW_RATE_LIMIT_WINDOW_MS = 60_000;
export const ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS = 20;

type JsonRecord = Record<string, unknown>;
type GuardResult =
  | { allowed: true }
  | { allowed: false; statusCode: number; status: RouteShadowStatus; verdict: RouteShadowVerdict; reason: string };

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function handleSecuredRouteShadowPost(
  request: Request,
  flow: RouteShadowFlow,
  routePath: string
): Promise<Response> {
  const authResult = await authorizeInternalRouteShadowRequest(request);
  if (!authResult.allowed) return errorResponse(flow, authResult);

  const originResult = validateSameOriginPosture(request);
  if (!originResult.allowed) return errorResponse(flow, originResult);

  const rateLimitResult = consumeRateLimit(request, flow);
  if (!rateLimitResult.allowed) return errorResponse(flow, rateLimitResult);

  const parseResult = await parseRouteShadowRequestBody(request);
  if (!parseResult.valid) return errorResponse(flow, parseResult.error);

  const schemaResult = buildRouteShadowRequest(parseResult.body, flow, routePath);
  if (!schemaResult.valid) return errorResponse(flow, schemaResult.error);

  const service = new RouteShadowExecutionService();
  const result = await service.execute(schemaResult.request);
  return NextResponse.json(service.toResponse(result), { status: statusCodeFor(result.status) });
}

export function resetRouteShadowSecurityState(): void {
  rateLimitBuckets.clear();
}

async function authorizeInternalRouteShadowRequest(request: Request): Promise<GuardResult> {
  const localHeader = request.headers.get(ROUTE_SHADOW_INTERNAL_ACCESS_HEADER);
  if (isLocalOrTestMode()) {
    if (!localHeader) {
      return blocked(401, 'BLOCKED', 'BLOCKED', 'Internal route shadow access requires local/test authorization.');
    }
    if (localHeader !== ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE) {
      return blocked(403, 'BLOCKED', 'BLOCKED', 'Internal route shadow access is not authorized.');
    }
    return { allowed: true };
  }

  try {
    const authResult = await auth();
    if (!authResult.userId) {
      return blocked(401, 'BLOCKED', 'BLOCKED', 'Authentication is required.');
    }
    if (!hasRouteShadowInternalAccessClaim(authResult.sessionClaims)) {
      return blocked(403, 'BLOCKED', 'BLOCKED', 'Internal route shadow authorization is required.');
    }
    return { allowed: true };
  } catch {
    return blocked(401, 'BLOCKED', 'BLOCKED', 'Authentication is required.');
  }
}

function validateSameOriginPosture(request: Request): GuardResult {
  const origin = request.headers.get('origin');
  if (!origin) return { allowed: true };

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.protocol !== requestUrl.protocol || originUrl.host !== requestUrl.host) {
      return blocked(403, 'BLOCKED', 'BLOCKED', 'Origin is not allowed for internal route shadow access.');
    }
    return { allowed: true };
  } catch {
    return blocked(403, 'BLOCKED', 'BLOCKED', 'Origin is not allowed for internal route shadow access.');
  }
}

function consumeRateLimit(request: Request, flow: RouteShadowFlow): GuardResult {
  const now = Date.now();
  const key = `${clientIdentifierFor(request)}:${flow}`;
  const existing = rateLimitBuckets.get(key);
  const bucket = existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + ROUTE_SHADOW_RATE_LIMIT_WINDOW_MS };
  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);

  if (bucket.count > ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS) {
    return blocked(429, 'BLOCKED', 'BLOCKED', 'Route shadow rate limit exceeded.');
  }
  return { allowed: true };
}

async function parseRouteShadowRequestBody(
  request: Request
): Promise<{ valid: true; body: JsonRecord } | { valid: false; error: GuardResult & { allowed: false } }> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return { valid: false, error: blocked(415, 'BLOCKED', 'BLOCKED', 'Unsupported content type.') };
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > ROUTE_SHADOW_MAX_BODY_BYTES) {
    return { valid: false, error: blocked(413, 'BLOCKED', 'BLOCKED', 'Route shadow request body is too large.') };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return { valid: false, error: blocked(400, 'FAILED', 'FAIL', 'Route shadow request parsing failed safely.') };
  }

  if (new TextEncoder().encode(rawBody).byteLength > ROUTE_SHADOW_MAX_BODY_BYTES) {
    return { valid: false, error: blocked(413, 'BLOCKED', 'BLOCKED', 'Route shadow request body is too large.') };
  }

  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!isRecord(parsed)) {
      return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow request body must be an object.') };
    }
    return { valid: true, body: parsed };
  } catch {
    return { valid: false, error: blocked(400, 'FAILED', 'FAIL', 'Route shadow request parsing failed safely.') };
  }
}

function buildRouteShadowRequest(
  body: JsonRecord,
  flow: RouteShadowFlow,
  routePath: string
): { valid: true; request: RouteShadowRequest } | { valid: false; error: GuardResult & { allowed: false } } {
  if (body.flow !== undefined && body.flow !== flow) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow flow does not match endpoint.') };
  }
  if (body.routePath !== undefined && body.routePath !== routePath) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow path does not match endpoint.') };
  }
  if (body.synthetic !== true) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow request must be synthetic.') };
  }
  if (!isRecord(body.payload)) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow payload must be an object.') };
  }
  if (body.payload.synthetic !== true || body.payload.dataClassification !== 'SYNTHETIC') {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow payload must be synthetic.') };
  }

  const requestId = optionalBoundedString(body.requestId, 128);
  const explicitEnvironment = optionalBoundedString(body.environment, 64);
  const environment = explicitEnvironment ?? environmentFromConfig(body.config) ?? 'unknown';
  const config = optionalRecord(body.config);
  const approval = optionalRecord(body.approval);
  const gateInputs = optionalRecord(body.gateInputs);
  const metadata = optionalRecord(body.metadata);

  if (body.requestId !== undefined && requestId === undefined) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow requestId is invalid.') };
  }
  if (body.environment !== undefined && environment === undefined) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow environment is invalid.') };
  }
  if (body.config !== undefined && !config) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow config must be an object.') };
  }
  if (body.approval !== undefined && !approval) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow approval must be an object.') };
  }
  if (body.gateInputs !== undefined && !gateInputs) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow gateInputs must be an object.') };
  }
  if (body.metadata !== undefined && !metadata) {
    return { valid: false, error: blocked(422, 'BLOCKED', 'BLOCKED', 'Route shadow metadata must be an object.') };
  }

  return {
    valid: true,
    request: {
      requestId: requestId ?? `route-shadow-${flow}`,
      routePath,
      flow,
      environment,
      synthetic: true,
      payload: body.payload,
      config: config as Partial<RouteShadowConfig> | undefined,
      approval: approval as RouteShadowRequest['approval'] | undefined,
      gateInputs: gateInputs as RouteShadowGateInputs | undefined,
      metadata: metadata as Readonly<Record<string, unknown>> | undefined,
    },
  };
}

function errorResponse(flow: RouteShadowFlow, error: GuardResult & { allowed: false }): Response {
  const body: RouteShadowResponse = {
    status: error.status,
    verdict: error.verdict,
    flow,
    hookReached: false,
    matched: false,
    driftDetected: false,
    failure: error.status === 'FAILED',
    rollback: false,
    auditSummary: {
      reason: error.reason,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
  return NextResponse.json(body, { status: error.statusCode });
}

function statusCodeFor(status: string): number {
  if (status === 'COMPLETED') return 200;
  if (status === 'BLOCKED' || status === 'DISABLED') return 403;
  return 500;
}

function optionalBoundedString(value: unknown, maxLength: number): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return undefined;
  return trimmed;
}

function environmentFromConfig(value: unknown): string | undefined {
  const config = optionalRecord(value);
  return config ? optionalBoundedString(config.environment, 64) : undefined;
}

function optionalRecord(value: unknown): JsonRecord | undefined {
  if (value === undefined) return undefined;
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalOrTestMode(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
}

function clientIdentifierFor(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function blocked(
  statusCode: number,
  status: RouteShadowStatus,
  verdict: RouteShadowVerdict,
  reason: string
): GuardResult & { allowed: false } {
  return { allowed: false, statusCode, status, verdict, reason };
}
