import { describe, expect, it } from 'vitest';
import {
  ASSESSMENT_ROUTE_SHADOW_PATH,
  CAREER_FIT_ROUTE_SHADOW_PATH,
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../RouteShadowSyntheticPayloads';

describe('RouteShadowSyntheticPayloads', () => {
  it('creates schema-compatible synthetic assessment and career-fit route payloads', () => {
    const assessment = createSyntheticAssessmentRoutePayload();
    const careerFit = createSyntheticCareerFitRoutePayload();

    expect(assessment.routePath).toBe(ASSESSMENT_ROUTE_SHADOW_PATH);
    expect(careerFit.routePath).toBe(CAREER_FIT_ROUTE_SHADOW_PATH);
    expect(assessment.synthetic).toBe(true);
    expect(careerFit.synthetic).toBe(true);
    expect(assessment.payload).toHaveProperty('scenarioInput');
    expect(careerFit.payload).toHaveProperty('scenarioInput');
  });

  it('uses no real student data markers', () => {
    const serialized = JSON.stringify([
      createSyntheticAssessmentRoutePayload(),
      createSyntheticCareerFitRoutePayload(),
    ]);

    expect(serialized).not.toMatch(/email|phone|ssn|real student|@/i);
  });
});
