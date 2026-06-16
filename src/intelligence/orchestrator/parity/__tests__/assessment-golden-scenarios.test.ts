import { describe, expect, it } from 'vitest';
import { assessmentGoldenScenarios } from '../assessmentGoldenScenarios';

describe('assessmentGoldenScenarios', () => {
  it('defines 20 assessment golden scenarios with unique identifiers', () => {
    const scenarioIds = assessmentGoldenScenarios.map((scenario) => scenario.scenarioId);

    expect(assessmentGoldenScenarios).toHaveLength(20);
    expect(new Set(scenarioIds).size).toBe(20);
  });

  it('uses assessment-compatible input and comparable output fields', () => {
    for (const scenario of assessmentGoldenScenarios) {
      expect(scenario.flowType).toBe('assessment');
      expect(scenario.input.flowType).toBe('assessment');
      expect(scenario.expectedBehavior.comparableFields).toContain('profileConfidence');
      expect(scenario.expectedBehavior.comparableFields).toContain('assessmentCompleteness');

      const payload = scenario.input.payload as {
        questions?: readonly unknown[];
        responses?: readonly unknown[];
      };

      expect(Array.isArray(payload.questions)).toBe(true);
      expect(Array.isArray(payload.responses)).toBe(true);
      expect(payload.questions?.length).toBeGreaterThan(0);
      expect(payload.responses?.length).toBe(payload.questions?.length);
    }
  });
});
