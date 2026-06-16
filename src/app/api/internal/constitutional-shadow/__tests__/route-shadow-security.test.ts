import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ClerkAuthResult = { userId: string | null; sessionClaims: unknown };
const clerkAuthMock = vi.hoisted(() => vi.fn<() => Promise<ClerkAuthResult>>());

vi.mock('@clerk/nextjs/server', () => ({
  auth: clerkAuthMock,
}));

import { POST as assessmentPost } from '../assessment/route';
import { POST as careerFitPost } from '../career-fit/route';
import {
  createRouteShadowTestApproval,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
} from '../../../../../intelligence/orchestrator/rollout/route-shadow/RouteShadowSyntheticPayloads';
import {
  resetRouteShadowSecurityState,
  ROUTE_SHADOW_INTERNAL_ACCESS_HEADER,
  ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
  ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS,
} from '../route-shadow-security';

describe('constitutional shadow API security boundary', () => {
  beforeEach(() => {
    resetRouteShadowSecurityState();
    clerkAuthMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects unauthenticated internal API requests', async () => {
    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { includeInternalAccess: false }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.status).toBe('BLOCKED');
    expect(body.auditSummary.reason).toBe('Internal route shadow access requires local/test authorization.');
  });

  it('rejects unauthorized internal access', async () => {
    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { internalAccessValue: 'not-authorized' }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.status).toBe('BLOCKED');
    expect(body.auditSummary.reason).toBe('Internal route shadow access is not authorized.');
  });

  it('handles valid synthetic internal assessment requests when explicitly allowed', async () => {
    const response = await assessmentPost(jsonRequest(validAssessmentPayload()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('COMPLETED');
    expect(body.flow).toBe('assessment');
    expect(body.productionOutputPreserved).toBe(true);
    expect(body.liveRoutingEnabled).toBe(false);
  });

  it('handles valid synthetic internal career-fit requests when explicitly allowed', async () => {
    const response = await careerFitPost(jsonRequest(validCareerFitPayload()));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('COMPLETED');
    expect(body.flow).toBe('career-fit');
  });

  it('rejects invalid content types before parsing', async () => {
    const response = await assessmentPost(
      new Request('http://localhost/api/internal/constitutional-shadow/assessment', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
          [ROUTE_SHADOW_INTERNAL_ACCESS_HEADER]: ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
        },
        body: JSON.stringify(validAssessmentPayload()),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(415);
    expect(body.auditSummary.reason).toBe('Unsupported content type.');
  });

  it('rejects invalid payload shape', async () => {
    const response = await assessmentPost(jsonRequest({ synthetic: true, payload: null }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.auditSummary.reason).toBe('Route shadow payload must be an object.');
  });

  it('rejects oversized payloads safely', async () => {
    const oversizedPayload = validAssessmentPayload({
      payload: {
        synthetic: true,
        dataClassification: 'SYNTHETIC',
        filler: 'x'.repeat(70_000),
      },
    });
    const response = await assessmentPost(jsonRequest(oversizedPayload));
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.auditSummary.reason).toBe('Route shadow request body is too large.');
  });

  it('rate limits repeated route-shadow abuse', async () => {
    let response: Response | undefined;

    for (let index = 0; index <= ROUTE_SHADOW_RATE_LIMIT_MAX_REQUESTS; index += 1) {
      response = await assessmentPost(jsonRequest(validAssessmentPayload()));
    }

    expect(response?.status).toBe(429);
    const body = await response!.json();
    expect(body.auditSummary.reason).toBe('Route shadow rate limit exceeded.');
  });

  it('rejects cross-origin browser posts', async () => {
    const response = await assessmentPost(
      jsonRequest(validAssessmentPayload(), {
        origin: 'https://evil.example',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.auditSummary.reason).toBe('Origin is not allowed for internal route shadow access.');
  });

  it('rejects unauthenticated staging/prod-like requests through Clerk auth', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    clerkAuthMock.mockResolvedValue({ userId: null, sessionClaims: null });

    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { includeInternalAccess: false }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.auditSummary.reason).toBe('Authentication is required.');
    expect(clerkAuthMock).toHaveBeenCalledTimes(1);
  });

  it('rejects authenticated staging/prod-like users without the internal-access claim', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    clerkAuthMock.mockResolvedValue({ userId: 'user_without_internal_access', sessionClaims: { metadata: {} } });

    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { includeInternalAccess: false }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.auditSummary.reason).toBe('Internal route shadow authorization is required.');
  });

  it('allows authenticated staging/prod-like users with the canonical internal-access claim', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    clerkAuthMock.mockResolvedValue({
      userId: 'user_with_internal_access',
      sessionClaims: { metadata: { internalAccess: true } },
    });

    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { includeInternalAccess: false }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('COMPLETED');
    expect(body.productionOutputPreserved).toBe(true);
  });

  it('rejects local/test bypass headers in staging/prod-like mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    clerkAuthMock.mockResolvedValue({ userId: 'ordinary_authenticated_user', sessionClaims: { metadata: {} } });

    const response = await assessmentPost(jsonRequest(validAssessmentPayload()));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.auditSummary.reason).toBe('Internal route shadow authorization is required.');
    expect(clerkAuthMock).toHaveBeenCalledTimes(1);
  });

  it('rejects legacy broad internal-access claim shapes in staging/prod-like mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    clerkAuthMock.mockResolvedValue({
      userId: 'legacy_claim_user',
      sessionClaims: {
        careeros_internal_access: true,
        internalAccess: true,
        publicMetadata: { internalAccess: true },
        permissions: ['route_shadow:execute'],
        roles: ['careeros_internal'],
      },
    });

    const response = await assessmentPost(jsonRequest(validAssessmentPayload(), { includeInternalAccess: false }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.auditSummary.reason).toBe('Internal route shadow authorization is required.');
  });
});

function validAssessmentPayload(overrides: Partial<ReturnType<typeof createSyntheticAssessmentRoutePayload>> = {}) {
  return createSyntheticAssessmentRoutePayload({
    approval: createRouteShadowTestApproval({
      flows: ['assessment'],
      routes: [ASSESSMENT_ROUTE_SHADOW_PATH],
      expiresAt: '2099-01-01T00:00:00.000Z',
    }),
    ...overrides,
  });
}

function validCareerFitPayload(overrides: Partial<ReturnType<typeof createSyntheticCareerFitRoutePayload>> = {}) {
  return createSyntheticCareerFitRoutePayload({
    approval: createRouteShadowTestApproval({
      flows: ['career-fit'],
      routes: [CAREER_FIT_ROUTE_SHADOW_PATH],
      expiresAt: '2099-01-01T00:00:00.000Z',
    }),
    ...overrides,
  });
}

function jsonRequest(
  payload: unknown,
  options: { includeInternalAccess?: boolean; internalAccessValue?: string; origin?: string } = {}
): Request {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (options.includeInternalAccess !== false) {
    headers.set(ROUTE_SHADOW_INTERNAL_ACCESS_HEADER, options.internalAccessValue ?? ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE);
  }
  if (options.origin) headers.set('origin', options.origin);

  return new Request('http://localhost/api/internal/constitutional-shadow/assessment', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}
