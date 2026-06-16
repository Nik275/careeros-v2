import { describe, expect, it } from 'vitest';
import {
  getAppRehearsalDataset,
  getAppRehearsalScenariosByFlow,
  validateAppRehearsalDatasetSafety,
} from '../AppRehearsalDataset';

describe('AppRehearsalDataset', () => {
  it('contains at least 40 assessment and 40 career-fit scenarios', () => {
    expect(getAppRehearsalScenariosByFlow('assessment').length).toBeGreaterThanOrEqual(40);
    expect(getAppRehearsalScenariosByFlow('career-fit').length).toBeGreaterThanOrEqual(40);
    expect(getAppRehearsalDataset().length).toBeGreaterThanOrEqual(80);
  });

  it('uses discovered app and service input shapes honestly', () => {
    const assessment = getAppRehearsalScenariosByFlow('assessment')[0];
    const careerFit = getAppRehearsalScenariosByFlow('career-fit')[0];

    expect(assessment.input).toHaveProperty('psychology');
    expect(assessment.input).toHaveProperty('questions');
    expect(assessment.input).toHaveProperty('responses');
    expect(careerFit.input).toHaveProperty('profile');
    expect(careerFit.input).toHaveProperty('career');
    expect(careerFit.input).toHaveProperty('profileId');
    expect(assessment.expectedHookName).toBe('AssessmentEngine.processResponses');
    expect(careerFit.expectedHookName).toBe('CareerFitEngine.calculateFit');
  });

  it('uses no real student data markers', () => {
    const safety = validateAppRehearsalDatasetSafety();

    expect(safety.safe).toBe(true);
    expect(safety.reasons).toEqual([]);
    expect(JSON.stringify(getAppRehearsalDataset())).not.toMatch(/email|phone|ssn|real student|@/i);
  });
});
