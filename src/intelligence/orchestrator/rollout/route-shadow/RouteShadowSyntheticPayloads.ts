/**
 * @fileoverview Synthetic payload builders for Phase 6.0 route-shadow routes.
 */

import { createRouteShadowApproval } from './RouteShadowApprovalFactory';
import type { RouteShadowApproval, RouteShadowFlow, RouteShadowRequest } from './RouteShadowTypes';
import { getAppRehearsalScenariosByFlow } from '../app-rehearsal/AppRehearsalDataset';

export const ASSESSMENT_ROUTE_SHADOW_PATH = '/api/internal/constitutional-shadow/assessment';
export const CAREER_FIT_ROUTE_SHADOW_PATH = '/api/internal/constitutional-shadow/career-fit';

export function createSyntheticAssessmentRoutePayload(overrides: Partial<RouteShadowRequest> = {}): RouteShadowRequest {
  return createSyntheticRoutePayload('assessment', ASSESSMENT_ROUTE_SHADOW_PATH, overrides);
}

export function createSyntheticCareerFitRoutePayload(overrides: Partial<RouteShadowRequest> = {}): RouteShadowRequest {
  return createSyntheticRoutePayload('career-fit', CAREER_FIT_ROUTE_SHADOW_PATH, overrides);
}

export function createRouteShadowTestApproval(input: {
  environment?: string;
  flows?: readonly RouteShadowFlow[];
  routes?: readonly string[];
  maxExecutions?: number;
  approvedAt?: string;
  expiresAt?: string;
} = {}): RouteShadowApproval {
  return createRouteShadowApproval({
    approvedBy: 'phase-6-0-route-shadow-test',
    environment: input.environment ?? 'staging',
    allowedFlows: input.flows ?? ['assessment', 'career-fit'],
    allowedRoutes: input.routes ?? [ASSESSMENT_ROUTE_SHADOW_PATH, CAREER_FIT_ROUTE_SHADOW_PATH],
    maxExecutions: input.maxExecutions ?? 2,
    reason: 'Synthetic Phase 6.0 route shadow test approval.',
    productionSafetyAcknowledgement: 'Production output remains authoritative; live modes and output replacement are not approved.',
    approvedAt: input.approvedAt ?? '2026-06-06T00:00:00.000Z',
    expiresAt: input.expiresAt ?? '2026-06-07T00:00:00.000Z',
  });
}

function createSyntheticRoutePayload(
  flow: RouteShadowFlow,
  routePath: string,
  overrides: Partial<RouteShadowRequest>
): RouteShadowRequest {
  const scenario = getAppRehearsalScenariosByFlow(flow)[0];
  const base: RouteShadowRequest = {
    requestId: `route-shadow-${flow}-synthetic-001`,
    routePath,
    flow,
    environment: 'staging',
    synthetic: true,
    payload: Object.freeze({
      synthetic: true,
      dataClassification: 'SYNTHETIC',
      flow,
      routePath,
      requestId: `route-shadow-${flow}-synthetic-001`,
      scenarioInput: scenario.input,
      expectedHookName: scenario.expectedHookName,
      metadata: {
        source: 'Phase6_0_RouteShadowSyntheticPayloads',
        stagingSafe: true,
      },
    }),
    config: {
      enabled: true,
      environment: 'staging',
      allowedFlows: [flow],
    },
    approval: createRouteShadowTestApproval({ flows: [flow], routes: [routePath], maxExecutions: 1 }),
    gateInputs: {
      rolloutGateApproved: true,
      expandedParityCIGatePassed: true,
      privacySafe: true,
      telemetryHealthy: true,
      killSwitchActive: false,
      flowKillSwitchActive: false,
    },
    metadata: {
      synthetic: true,
      dataClassification: 'SYNTHETIC',
      routeShadowPilot: true,
    },
  };
  return Object.freeze({
    ...base,
    ...overrides,
    payload: overrides.payload ?? base.payload,
    config: {
      ...base.config,
      ...(overrides.config ?? {}),
    },
    gateInputs: {
      ...base.gateInputs,
      ...(overrides.gateInputs ?? {}),
    },
    metadata: {
      ...base.metadata,
      ...(overrides.metadata ?? {}),
    },
  });
}
