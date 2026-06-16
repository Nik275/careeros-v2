import { describe, expect, it } from 'vitest';
import {
  getStagingRehearsalDataset,
  getStagingRehearsalScenariosByFlow,
  validateStagingRehearsalDatasetSafety,
} from '../StagingRehearsalDataset';

describe('StagingRehearsalDataset', () => {
  it('contains at least 30 assessment and 30 career-fit scenarios', () => {
    expect(getStagingRehearsalScenariosByFlow('assessment').length).toBeGreaterThanOrEqual(30);
    expect(getStagingRehearsalScenariosByFlow('career-fit').length).toBeGreaterThanOrEqual(30);
    expect(getStagingRehearsalDataset().length).toBeGreaterThanOrEqual(60);
  });

  it('uses actual selected service-level entrypoint input shapes', () => {
    const assessment = getStagingRehearsalScenariosByFlow('assessment')[0];
    const careerFit = getStagingRehearsalScenariosByFlow('career-fit')[0];

    expect(assessment.input).toHaveProperty('questions');
    expect(assessment.input).toHaveProperty('responses');
    expect(careerFit.input).toHaveProperty('profile');
    expect(careerFit.input).toHaveProperty('career');
    expect(careerFit.input).toHaveProperty('profileId');
  });

  it('uses no real student data markers', () => {
    const safety = validateStagingRehearsalDatasetSafety();

    expect(safety.safe).toBe(true);
    expect(safety.reasons).toEqual([]);
    expect(JSON.stringify(getStagingRehearsalDataset())).not.toMatch(/email|phone|ssn|real student|@/i);
  });
});
