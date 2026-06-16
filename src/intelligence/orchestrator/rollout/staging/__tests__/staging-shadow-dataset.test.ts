import { describe, expect, it } from 'vitest';
import {
  getStagingShadowRunDataset,
  getStagingShadowScenariosByFlow,
  validateStagingShadowDatasetSafety,
} from '../StagingShadowRunDataset';

describe('StagingShadowRunDataset', () => {
  it('contains at least 40 assessment and 40 career-fit scenarios', () => {
    expect(getStagingShadowScenariosByFlow('assessment').length).toBeGreaterThanOrEqual(40);
    expect(getStagingShadowScenariosByFlow('career-fit').length).toBeGreaterThanOrEqual(40);
    expect(getStagingShadowRunDataset().length).toBeGreaterThanOrEqual(80);
  });

  it('uses validated golden, stress, and fuzz sources for each flow', () => {
    for (const flow of ['assessment', 'career-fit'] as const) {
      const suites = new Set(getStagingShadowScenariosByFlow(flow).map((scenario) => scenario.sourceSuite));
      expect(suites).toEqual(new Set(['golden', 'stress', 'fuzz']));
    }
  });

  it('uses no real student data markers', () => {
    const safety = validateStagingShadowDatasetSafety();

    expect(safety.safe).toBe(true);
    expect(safety.reasons).toEqual([]);
    expect(JSON.stringify(getStagingShadowRunDataset())).not.toMatch(/email|phone|ssn|real student|@/i);
  });
});
