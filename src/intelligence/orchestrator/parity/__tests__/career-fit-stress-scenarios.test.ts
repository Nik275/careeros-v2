import { describe, expect, it } from 'vitest';
import { careerFitGoldenScenarios } from '../careerFitGoldenScenarios';
import { careerFitStressScenarios } from '../careerFitStressScenarios';

describe('careerFitStressScenarios', () => {
  it('brings career-fit total scenarios to at least 100 with unique ids', () => {
    const scenarios = [...careerFitGoldenScenarios, ...careerFitStressScenarios];
    const ids = scenarios.map((scenario) => scenario.scenarioId);

    expect(careerFitStressScenarios.length).toBeGreaterThanOrEqual(80);
    expect(scenarios.length).toBeGreaterThanOrEqual(100);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches the real CareerFitEngine.calculateFit input schema', () => {
    for (const scenario of careerFitStressScenarios) {
      const payload = scenario.input.payload as {
        profileId?: unknown;
        profile?: unknown;
        career?: Record<string, unknown>;
      };
      expect(scenario.flowType).toBe('career-fit');
      expect(payload.profileId).toBeTypeOf('string');
      expect(payload.profile).toBeDefined();
      expect(payload.career?.cognitiveDemands).toBeDefined();
      expect(payload.career?.motivationalDemands).toBeDefined();
      expect(payload.career?.lifestyleCharacteristics).toBeDefined();
      expect(payload.career?.careerRisks).toBeDefined();
      expect(payload.career?.workEnvironment).toBeDefined();
    }
  });
});
