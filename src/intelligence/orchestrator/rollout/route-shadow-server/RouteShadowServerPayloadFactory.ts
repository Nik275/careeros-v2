/**
 * @fileoverview Synthetic payload builders for Phase 6.2 real HTTP server smoke tests.
 */

import type { RouteShadowApproval, RouteShadowFlow } from '../route-shadow/RouteShadowTypes';
import {
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
  createRouteShadowTestApproval,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../route-shadow/RouteShadowSyntheticPayloads';
import type { RouteShadowServerRequest } from './RouteShadowServerTypes';

export const ASSESSMENT_ROUTE_SHADOW_SERVER_PATH = ASSESSMENT_ROUTE_SHADOW_PATH;
export const CAREER_FIT_ROUTE_SHADOW_SERVER_PATH = CAREER_FIT_ROUTE_SHADOW_PATH;

export function createSyntheticAssessmentServerRequest(overrides: Partial<RouteShadowServerRequest> = {}): RouteShadowServerRequest {
  return createSyntheticServerRequest('assessment', ASSESSMENT_ROUTE_SHADOW_SERVER_PATH, overrides);
}

export function createSyntheticCareerFitServerRequest(overrides: Partial<RouteShadowServerRequest> = {}): RouteShadowServerRequest {
  return createSyntheticServerRequest('career-fit', CAREER_FIT_ROUTE_SHADOW_SERVER_PATH, overrides);
}

export function createRouteShadowServerTestApproval(input: {
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
    routes: input.routes ?? [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH, CAREER_FIT_ROUTE_SHADOW_SERVER_PATH],
    maxExecutions: input.maxExecutions ?? 2,
    approvedAt: input.approvedAt,
    expiresAt: input.expiresAt ?? '2099-01-01T00:00:00.000Z',
  });
}

function createSyntheticServerRequest(
  flow: RouteShadowFlow,
  routePath: string,
  overrides: Partial<RouteShadowServerRequest>
): RouteShadowServerRequest {
  const approval = createRouteShadowServerTestApproval({ flows: [flow], routes: [routePath], maxExecutions: 1 });
  const body =
    flow === 'assessment'
      ? createSyntheticAssessmentRoutePayload({ approval })
      : createSyntheticCareerFitRoutePayload({ approval });
  const base: RouteShadowServerRequest = {
    requestId: `route-shadow-server-${flow}-synthetic-001`,
    routePath,
    flow,
    method: 'POST',
    environment: 'staging',
    body,
    approval,
    headers: {
      'content-type': 'application/json',
      'x-careeros-synthetic': 'true',
      'x-careeros-route-shadow-server': 'phase-6-2',
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
      routeShadowServerPilot: true,
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

