import { describe, expect, it } from 'vitest';
import { careerFitGoldenScenarios } from '../careerFitGoldenScenarios';

describe('careerFitGoldenScenarios', () => {
  it('defines 20 career-fit golden scenarios with unique identifiers', () => {
    const scenarioIds = careerFitGoldenScenarios.map((scenario) => scenario.scenarioId);

    expect(careerFitGoldenScenarios).toHaveLength(20);
    expect(new Set(scenarioIds).size).toBe(20);
  });

  it('uses career-fit-compatible input and comparable output fields', () => {
    for (const scenario of careerFitGoldenScenarios) {
      expect(scenario.flowType).toBe('career-fit');
      expect(scenario.input.flowType).toBe('career-fit');
      expect(scenario.expectedBehavior.comparableFields).toContain('overallFitScore');
      expect(scenario.expectedBehavior.comparableFields).toContain('fitLevel');

      const payload = scenario.input.payload as {
        profileId?: string;
        profile?: unknown;
        career?: {
          cognitiveDemands?: unknown;
          motivationalDemands?: unknown;
          lifestyleCharacteristics?: unknown;
          careerRisks?: unknown;
          workEnvironment?: unknown;
          evidence?: unknown;
        };
      };

      expect(payload.profileId).toBeTypeOf('string');
      expect(payload.profile).toBeDefined();
      expect(payload.career).toBeDefined();
      expect(payload.career?.cognitiveDemands).toBeDefined();
      expect(payload.career?.motivationalDemands).toBeDefined();
      expect(payload.career?.lifestyleCharacteristics).toBeDefined();
      expect(payload.career?.careerRisks).toBeDefined();
      expect(payload.career?.workEnvironment).toBeDefined();
      expect(payload.career?.evidence).toBeDefined();
    }
  });
});
