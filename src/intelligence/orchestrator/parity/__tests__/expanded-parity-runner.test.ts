import { describe, expect, it } from 'vitest';
import { GoldenParityRunner } from '../GoldenParityRunner';
import type { GoldenScenario } from '../GoldenScenarioTypes';

describe('GoldenParityRunner expanded suites', () => {
  it('executes assessment stress suite', async () => {
    const runner = createFastRunner();
    const result = await runner.runAssessmentStressSuite();

    expect(result.totalScenarios).toBeGreaterThanOrEqual(80);
    expect(result.metrics.matchedCount).toBe(result.totalScenarios);
  });

  it('executes career-fit stress suite', async () => {
    const runner = createFastRunner();
    const result = await runner.runCareerFitStressSuite();

    expect(result.totalScenarios).toBeGreaterThanOrEqual(80);
    expect(result.metrics.matchedCount).toBe(result.totalScenarios);
  });

  it('executes deterministic fuzz suite and full expanded suite', async () => {
    const runner = createFastRunner();
    const fuzz = await runner.runDeterministicFuzzSuite();
    const expanded = await runner.runFullExpandedSuite();

    expect(fuzz.assessment.totalScenarios).toBe(50);
    expect(fuzz.careerFit.totalScenarios).toBe(50);
    expect(expanded.metrics.combined.totalScenarios).toBeGreaterThanOrEqual(300);
    expect(expanded.metrics.combined.parityPercentage).toBe(100);
  });

  it('preserves production output', async () => {
    const productionOutput = Object.freeze(assessmentOutput());
    const runner = new GoldenParityRunner({
      assessmentStressScenarios: [
        {
          scenarioId: 'assessment-preserve-production',
          flowType: 'assessment',
          purpose: 'preserve production output',
          input: { flowType: 'assessment', payload: {} },
          expectedBehavior: { comparableFields: [], riskLevel: 'LOW', riskNotes: [] },
        },
      ],
      careerFitStressScenarios: [],
      assessmentRunner: {
        production: () => productionOutput,
        dryRun: () => ({ ...assessmentOutput() }),
      },
      careerFitRunner: {
        production: careerFitOutput,
        dryRun: careerFitOutput,
      },
      now: fixedClock,
    });

    const result = await runner.runAssessmentStressSuite();

    expect(result.results[0].productionOutput).toBe(productionOutput);
    expect(result.results[0].dryRunOutput).not.toBe(productionOutput);
  });
});

function createFastRunner(): GoldenParityRunner {
  return new GoldenParityRunner({
    assessmentRunner: {
      production: assessmentOutput,
      dryRun: assessmentOutput,
    },
    careerFitRunner: {
      production: careerFitOutput,
      dryRun: careerFitOutput,
    },
    now: fixedClock,
  });
}

function fixedClock(): string {
  return '2026-06-06T00:00:00.000Z';
}

function assessmentOutput() {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: { profileConfidence: 80, assessmentCompleteness: 80 },
    strengths: { topStrengths: ['Analytical Thinking'] },
    weaknesses: { developmentAreas: ['Risk Calibration'] },
  };
}

function careerFitOutput(scenario: GoldenScenario) {
  const payload = scenario.input.payload as { profileId?: string };
  return {
    careerId: scenario.scenarioId,
    studentProfileId: payload.profileId ?? `${scenario.scenarioId}-profile`,
    overallFitScore: 80,
    fitLevel: 'GOOD',
    confidence: { overall: 80, level: 'HIGH' },
    strengths: [],
    concerns: [],
  };
}
