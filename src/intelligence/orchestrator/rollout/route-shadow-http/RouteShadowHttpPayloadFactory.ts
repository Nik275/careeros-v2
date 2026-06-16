/**
 * @fileoverview Synthetic payload builders for Phase 6.1 HTTP route-shadow harness.
 */

import type { RouteShadowApproval, RouteShadowFlow } from '../route-shadow/RouteShadowTypes';
import {
  ROUTE_SHADOW_INTERNAL_ACCESS_HEADER,
  ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
} from '../../../../app/api/internal/constitutional-shadow/route-shadow-security';
import {
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
  createRouteShadowTestApproval,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../route-shadow/RouteShadowSyntheticPayloads';
import type { RouteShadowHttpRequest } from './RouteShadowHttpTypes';

export const ASSESSMENT_ROUTE_SHADOW_HTTP_PATH = ASSESSMENT_ROUTE_SHADOW_PATH;
export const CAREER_FIT_ROUTE_SHADOW_HTTP_PATH = CAREER_FIT_ROUTE_SHADOW_PATH;

export function createSyntheticAssessmentHttpRequest(overrides: Partial<RouteShadowHttpRequest> = {}): RouteShadowHttpRequest {
  return createSyntheticHttpRequest('assessment', ASSESSMENT_ROUTE_SHADOW_HTTP_PATH, overrides);
}

export function createSyntheticCareerFitHttpRequest(overrides: Partial<RouteShadowHttpRequest> = {}): RouteShadowHttpRequest {
  return createSyntheticHttpRequest('career-fit', CAREER_FIT_ROUTE_SHADOW_HTTP_PATH, overrides);
}

export function createRouteShadowHttpTestApproval(input: {
  environment?: string;
  flows?: readonly RouteShadowFlow[];
  routes?: readonly string[];
  maxExecutions?: number;
  approvedAt?: string;
  expiresAt?: string;
} = {}): RouteShadowApproval {
  return createRouteShadowTestApproval({
    environment: input.environment ?? 'staging',
    flows: input.flows ?? ['assessment', 'career-fit'],
    routes: input.routes ?? [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH, CAREER_FIT_ROUTE_SHADOW_HTTP_PATH],
    maxExecutions: input.maxExecutions ?? 2,
    approvedAt: input.approvedAt,
    expiresAt: input.expiresAt ?? '2099-01-01T00:00:00.000Z',
  });
}

function createSyntheticHttpRequest(
  flow: RouteShadowFlow,
  routePath: string,
  overrides: Partial<RouteShadowHttpRequest>
): RouteShadowHttpRequest {
  const approval = createRouteShadowHttpTestApproval({ flows: [flow], routes: [routePath], maxExecutions: 1 });
  const body =
    flow === 'assessment'
      ? createSyntheticAssessmentRoutePayload({ approval })
      : createSyntheticCareerFitRoutePayload({ approval });
  const base: RouteShadowHttpRequest = {
    requestId: `route-shadow-http-${flow}-synthetic-001`,
    routePath,
    flow,
    method: 'POST',
    environment: 'staging',
    body,
    approval,
    headers: {
      'content-type': 'application/json',
      'x-careeros-synthetic': 'true',
      'x-careeros-route-shadow-http': 'phase-6-1',
      [ROUTE_SHADOW_INTERNAL_ACCESS_HEADER]: ROUTE_SHADOW_LOCAL_INTERNAL_ACCESS_VALUE,
    },
    config: {
      enabled: true,
      environment: 'staging',
      allowedRoutes: [routePath],
      allowedFlows: [flow],
    },
    metadata: {
      synthetic: true,
      dataClassification: 'SYNTHETIC',
      routeShadowHttpPilot: true,
      payloadSummary: {
        flow,
        routePath,
        containsRawStudentData: false,
      },
    },
  };

  return Object.freeze({
    ...base,
    ...overrides,
    body: overrides.body ?? base.body,
    headers: {
      ...base.headers,
      ...(overrides.headers ?? {}),
    },
    config: {
      ...base.config,
      ...(overrides.config ?? {}),
    },
    metadata: {
      ...base.metadata,
      ...(overrides.metadata ?? {}),
    },
  });
}
