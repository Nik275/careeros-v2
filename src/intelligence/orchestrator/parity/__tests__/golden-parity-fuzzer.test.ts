import { describe, expect, it } from 'vitest';
import { GoldenParityFuzzer } from '../GoldenParityFuzzer';

describe('GoldenParityFuzzer', () => {
  it('is deterministic by seed', () => {
    const fuzzer = new GoldenParityFuzzer();

    expect(fuzzer.generateAssessmentScenarios({ seed: 7, count: 3 })).toEqual(
      fuzzer.generateAssessmentScenarios({ seed: 7, count: 3 })
    );
    expect(fuzzer.generateCareerFitScenarios({ seed: 8, count: 3 })).toEqual(
      fuzzer.generateCareerFitScenarios({ seed: 8, count: 3 })
    );
  });

  it('creates valid assessment inputs', () => {
    const scenarios = new GoldenParityFuzzer().generateAssessmentScenarios({ seed: 10, count: 50 });

    expect(scenarios).toHaveLength(50);
    for (const scenario of scenarios) {
      const payload = scenario.input.payload as { questions?: unknown[]; responses?: unknown[] };
      expect(payload.questions?.length).toBeGreaterThan(0);
      expect(payload.responses?.length).toBe(payload.questions?.length);
    }
  });

  it('creates valid career-fit inputs', () => {
    const scenarios = new GoldenParityFuzzer().generateCareerFitScenarios({ seed: 11, count: 50 });

    expect(scenarios).toHaveLength(50);
    for (const scenario of scenarios) {
      const payload = scenario.input.payload as { profileId?: unknown; profile?: unknown; career?: unknown };
      expect(payload.profileId).toBeTypeOf('string');
      expect(payload.profile).toBeDefined();
      expect(payload.career).toBeDefined();
    }
  });
});
