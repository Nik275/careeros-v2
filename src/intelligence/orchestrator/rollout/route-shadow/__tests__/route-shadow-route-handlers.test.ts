import { beforeEach, describe, expect, it } from 'vitest';
import { POST as assessmentPost } from '../../../../../app/api/internal/constitutional-shadow/assessment/route';
import { POST as careerFitPost } from '../../../../../app/api/internal/constitutional-shadow/career-fit/route';
import {
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
  createRouteShadowTestApproval,
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
} from '../RouteShadowSyntheticPayloads';
import {
  resetRouteShadowSecurityState,
  ROUTE_SHADOW_INTERNAL_ACCESS_HEADER,
  ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
} from '../../../../../app/api/internal/constitutional-shadow/route-shadow-security';

describe('Phase 6.0 route handlers', () => {
  beforeEach(() => {
    resetRouteShadowSecurityState();
  });

  it('assessment route reaches the assessment observe hook when explicitly approved', async () => {
    const payload = createSyntheticAssessmentRoutePayload({
      approval: createRouteShadowTestApproval({
        flows: ['assessment'],
        routes: [ASSESSMENT_ROUTE_SHADOW_PATH],
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    });
    const response = await assessmentPost(jsonRequest(payload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('COMPLETED');
    expect(body.flow).toBe('assessment');
    expect(body.hookReached).toBe(true);
    expect(body.liveRoutingEnabled).toBe(false);
  });

  it('career-fit route reaches the career-fit observe hook when explicitly approved', async () => {
    const payload = createSyntheticCareerFitRoutePayload({
      approval: createRouteShadowTestApproval({
        flows: ['career-fit'],
        routes: [CAREER_FIT_ROUTE_SHADOW_PATH],
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    });
    const response = await careerFitPost(jsonRequest(payload));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('COMPLETED');
    expect(body.flow).toBe('career-fit');
    expect(body.hookReached).toBe(true);
    expect(body.liveRoutingEnabled).toBe(false);
  });

  it('blocks missing synthetic marker at route level', async () => {
    const payload = createSyntheticAssessmentRoutePayload({
      synthetic: false,
      payload: { synthetic: false, dataClassification: 'SYNTHETIC' },
    });
    const response = await assessmentPost(jsonRequest(payload));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.status).toBe('BLOCKED');
    expect(body.productionOutputPreserved).toBe(true);
  });
});

function jsonRequest(payload: unknown): Request {
  return new Request('http://localhost/api/internal/constitutional-shadow', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      [ROUTE_SHADOW_INTERNAL_ACCESS_HEADER]: ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
    },
    body: JSON.stringify(payload),
  });
}
