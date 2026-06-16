import { describe, expect, it } from 'vitest';
import { assessmentGoldenScenarios } from '../assessmentGoldenScenarios';
import { assessmentStressScenarios } from '../assessmentStressScenarios';

describe('assessmentStressScenarios', () => {
  it('brings assessment total scenarios to at least 100 with unique ids', () => {
    const scenarios = [...assessmentGoldenScenarios, ...assessmentStressScenarios];
    const ids = scenarios.map((scenario) => scenario.scenarioId);

    expect(assessmentStressScenarios.length).toBeGreaterThanOrEqual(80);
    expect(scenarios.length).toBeGreaterThanOrEqual(100);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches the real AssessmentEngine.processResponses input schema', () => {
    for (const scenario of assessmentStressScenarios) {
      const payload = scenario.input.payload as { questions?: unknown[]; responses?: unknown[] };
      expect(scenario.flowType).toBe('assessment');
      expect(Array.isArray(payload.questions)).toBe(true);
      expect(Array.isArray(payload.responses)).toBe(true);
      expect(payload.questions?.length).toBeGreaterThan(0);
      expect(payload.responses?.length).toBe(payload.questions?.length);
    }
  });
});
