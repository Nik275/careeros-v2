/**
 * @fileoverview Synthetic payload builders for Phase 6.3 deployed staging shadow.
 */

import type { RouteShadowFlow } from '../route-shadow/RouteShadowTypes';
import {
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../route-shadow/RouteShadowSyntheticPayloads';
import type { DeployedRouteShadowApproval, DeployedRouteShadowRequest } from './DeployedRouteShadowTypes';

export const ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH = ASSESSMENT_ROUTE_SHADOW_PATH;
export const CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH = CAREER_FIT_ROUTE_SHADOW_PATH;

export function createSyntheticAssessmentDeployedRequest(input: {
  approval?: DeployedRouteShadowApproval;
  overrides?: Partial<DeployedRouteShadowRequest>;
} = {}): DeployedRouteShadowRequest {
  return createSyntheticDeployedRequest('assessment', ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH, input.approval, input.overrides ?? {});
}

export function createSyntheticCareerFitDeployedRequest(input: {
  approval?: DeployedRouteShadowApproval;
  overrides?: Partial<DeployedRouteShadowRequest>;
} = {}): DeployedRouteShadowRequest {
  return createSyntheticDeployedRequest('career-fit', CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH, input.approval, input.overrides ?? {});
}

function createSyntheticDeployedRequest(
  flow: RouteShadowFlow,
  routePath: string,
  approval: DeployedRouteShadowApproval | undefined,
  overrides: Partial<DeployedRouteShadowRequest>
): DeployedRouteShadowRequest {
  const routeBody =
    flow === 'assessment'
      ? createSyntheticAssessmentRoutePayload({ approval })
      : createSyntheticCareerFitRoutePayload({ approval });
  const body = {
    ...routeBody,
    approval,
    metadata: {
      ...routeBody.metadata,
      routeShadowDeployedPilot: true,
      deployedShadowMarker: true,
    },
  };
  return Object.freeze({
    requestId: `deployed-route-shadow-${flow}-synthetic-001`,
    routePath,
    flow,
    method: 'POST',
    environment: 'staging',
    body,
    approval,
    headers: {
      'content-type': 'application/json',
      'x-careeros-synthetic': 'true',
      'x-careeros-route-shadow-deployed': 'phase-6-3',
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
      routeShadowDeployedPilot: true,
      payloadSummary: {
        flow,
        routePath,
        containsRawStudentData: false,
      },
    },
    ...overrides,
  });
}

