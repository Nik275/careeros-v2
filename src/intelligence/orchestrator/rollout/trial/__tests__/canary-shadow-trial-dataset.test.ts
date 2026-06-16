import { describe, expect, it } from 'vitest';
import {
  getCanaryShadowTrialDataset,
  getTrialScenariosByFlow,
  validateTrialDatasetSafety,
} from '../CanaryShadowTrialDataset';

describe('CanaryShadowTrialDataset', () => {
  it('contains at least 25 assessment scenarios and 25 career-fit scenarios', () => {
    expect(getTrialScenariosByFlow('assessment').length).toBeGreaterThanOrEqual(25);
    expect(getTrialScenariosByFlow('career-fit').length).toBeGreaterThanOrEqual(25);
    expect(getCanaryShadowTrialDataset().length).toBeGreaterThanOrEqual(50);
  });

  it('includes golden, stress, and fuzz sources for both flows', () => {
    for (const flow of ['assessment', 'career-fit'] as const) {
      const suites = new Set(getTrialScenariosByFlow(flow).map((scenario) => scenario.sourceSuite));
      expect(suites).toEqual(new Set(['golden', 'stress', 'fuzz']));
    }
  });

  it('uses no real student data markers', () => {
    const safety = validateTrialDatasetSafety();

    expect(safety.safe).toBe(true);
    expect(safety.reasons).toEqual([]);
    expect(JSON.stringify(getCanaryShadowTrialDataset())).not.toMatch(/email|phone|ssn|real student|@/i);
  });
});
