import { describe, expect, it } from 'vitest';
import { createRouteShadowApproval } from '../../route-shadow/RouteShadowApprovalFactory';
import {
  ASSESSMENT_ROUTE_SHADOW_SERVER_PATH,
  CAREER_FIT_ROUTE_SHADOW_SERVER_PATH,
  createSyntheticAssessmentServerRequest,
  createSyntheticCareerFitServerRequest,
} from '../RouteShadowServerPayloadFactory';

describe('RouteShadowServerPayloadFactory', () => {
  it('creates synthetic server requests for both routes', () => {
    const assessment = createSyntheticAssessmentServerRequest();
    const careerFit = createSyntheticCareerFitServerRequest();

    expect(assessment.routePath).toBe(ASSESSMENT_ROUTE_SHADOW_SERVER_PATH);
    expect(careerFit.routePath).toBe(CAREER_FIT_ROUTE_SHADOW_SERVER_PATH);
    expect(JSON.stringify(assessment)).toContain('"synthetic":true');
    expect(JSON.stringify(careerFit)).toContain('"dataClassification":"SYNTHETIC"');
    expect(JSON.stringify(assessment)).not.toMatch(/"(rawStudentData|realStudentData)"\s*:\s*true|studentEmail|ssn/i);
  });

  it('keeps live approval scopes blocked', () => {
    expect(() =>
      createRouteShadowApproval({
        approvedBy: 'phase-6-2-test',
        environment: 'staging',
        allowedFlows: ['assessment'],
        allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_SERVER_PATH],
        maxExecutions: 1,
        reason: 'Invalid live approval test.',
        productionSafetyAcknowledgement: 'Production output remains authoritative.',
        requestedScope: 'CANARY_LIVE',
      })
    ).toThrow(/cannot authorize CANARY_LIVE or FULL_LIVE/);
  });
});

