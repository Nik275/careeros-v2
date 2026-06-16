import { describe, expect, it } from 'vitest';
import { createRouteShadowApproval } from '../../route-shadow/RouteShadowApprovalFactory';
import {
  ASSESSMENT_ROUTE_SHADOW_HTTP_PATH,
  CAREER_FIT_ROUTE_SHADOW_HTTP_PATH,
  createSyntheticAssessmentHttpRequest,
  createSyntheticCareerFitHttpRequest,
} from '../RouteShadowHttpPayloadFactory';

describe('RouteShadowHttpPayloadFactory', () => {
  it('creates synthetic schema-compatible assessment and career-fit HTTP requests', () => {
    const assessment = createSyntheticAssessmentHttpRequest();
    const careerFit = createSyntheticCareerFitHttpRequest();

    expect(assessment.routePath).toBe(ASSESSMENT_ROUTE_SHADOW_HTTP_PATH);
    expect(careerFit.routePath).toBe(CAREER_FIT_ROUTE_SHADOW_HTTP_PATH);
    expect(assessment.method).toBe('POST');
    expect(careerFit.method).toBe('POST');
    expect(JSON.stringify(assessment)).toContain('"synthetic":true');
    expect(JSON.stringify(careerFit)).toContain('"dataClassification":"SYNTHETIC"');
    expect(JSON.stringify(assessment)).not.toMatch(/"(rawStudentData|realStudentData)"\s*:\s*true|studentEmail|ssn/i);
  });

  it('keeps CANARY_LIVE and FULL_LIVE approvals blocked by the Phase 6.0 approval boundary', () => {
    expect(() =>
      createRouteShadowApproval({
        approvedBy: 'phase-6-1-test',
        environment: 'staging',
        allowedFlows: ['assessment'],
        allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH],
        maxExecutions: 1,
        reason: 'Invalid live approval test.',
        productionSafetyAcknowledgement: 'Production output remains authoritative.',
        requestedScope: 'CANARY_LIVE',
      })
    ).toThrow(/cannot authorize CANARY_LIVE or FULL_LIVE/);

    expect(() =>
      createRouteShadowApproval({
        approvedBy: 'phase-6-1-test',
        environment: 'staging',
        allowedFlows: ['assessment'],
        allowedRoutes: [ASSESSMENT_ROUTE_SHADOW_HTTP_PATH],
        maxExecutions: 1,
        reason: 'Invalid full live approval test.',
        productionSafetyAcknowledgement: 'Production output remains authoritative.',
        requestedScope: 'FULL_LIVE',
      })
    ).toThrow(/cannot authorize CANARY_LIVE or FULL_LIVE/);
  });
});
