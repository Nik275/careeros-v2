import { afterEach, describe, expect, it, vi } from 'vitest';
import { assessmentGoldenScenarios } from '../assessmentGoldenScenarios';
import { careerFitGoldenScenarios } from '../careerFitGoldenScenarios';
import { GoldenParityRunner } from '../GoldenParityRunner';
import type { GoldenScenario } from '../GoldenScenarioTypes';

describe('GoldenParityRunner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes assessment scenario batch against real production and authority dry-run paths', async () => {
    const runner = new GoldenParityRunner({
      assessmentScenarios: assessmentGoldenScenarios.slice(0, 2),
      careerFitScenarios: [],
      now: fixedClock,
    });

    const result = await runner.runAssessmentBaseline();

    expect(result.totalScenarios).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((scenario) => scenario.executionTimeMs >= 0)).toBe(true);
    expect(result.results.every((scenario) => scenario.comparisonStatus === scenario.status)).toBe(true);
    expect(result.metrics.totalScenarios).toBe(2);
  });

  it('executes career-fit scenario batch against real production and authority dry-run paths', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const runner = new GoldenParityRunner({
      assessmentScenarios: [],
      careerFitScenarios: careerFitGoldenScenarios.slice(0, 2),
      now: fixedClock,
    });

    const result = await runner.runCareerFitBaseline();

    expect(result.totalScenarios).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.results.every((scenario) => scenario.executionTimeMs >= 0)).toBe(true);
    expect(result.results.every((scenario) => scenario.comparisonStatus === scenario.status)).toBe(true);
    expect(result.metrics.totalScenarios).toBe(2);
  });

  it('preserves production output references when authority dry-run fails', async () => {
    const productionOutput = Object.freeze({ cognitive: {}, confidence: { profileConfidence: 80 } });
    const runner = new GoldenParityRunner({
      assessmentScenarios: [assessmentGoldenScenarios[0]],
      careerFitScenarios: [],
      assessmentRunner: {
        production: () => productionOutput,
        dryRun: () => {
          throw new Error('authority failed');
        },
      },
      now: fixedClock,
    });

    const result = await runner.runAssessmentBaseline();

    expect(result.results[0].status).toBe('FAILED');
    expect(result.results[0].productionOutput).toBe(productionOutput);
    expect(result.results[0].authorityDryRunExecutionStatus).toBe('FAILED');
    expect(productionOutput).toEqual({ cognitive: {}, confidence: { profileConfidence: 80 } });
  });

  it('captures production failure safely', async () => {
    const runner = new GoldenParityRunner({
      assessmentScenarios: [assessmentGoldenScenarios[0]],
      careerFitScenarios: [],
      assessmentRunner: {
        production: () => {
          throw new Error('production failed');
        },
        dryRun: () => ({}),
      },
      now: fixedClock,
    });

    const result = await runner.runAssessmentBaseline();

    expect(result.results[0]).toMatchObject({
      status: 'FAILED',
      productionExecutionStatus: 'FAILED',
      authorityDryRunExecutionStatus: 'NOT_RUN',
    });
  });

  it('exports JSON-safe full baseline results', async () => {
    const runner = new GoldenParityRunner({
      assessmentScenarios: [assessmentGoldenScenarios[0]],
      careerFitScenarios: [careerFitGoldenScenarios[0]],
      assessmentRunner: matchingAssessmentRunner(),
      careerFitRunner: matchingCareerFitRunner(),
      now: fixedClock,
    });

    const baseline = await runner.runFullBaseline();
    const exported = runner.exportBaselineResult(baseline);

    expect(baseline.metrics.combined.totalScenarios).toBe(2);
    expect(() => JSON.stringify(exported)).not.toThrow();
  });
});

function fixedClock(): string {
  return '2026-06-06T00:00:00.000Z';
}

function matchingAssessmentRunner() {
  return {
    production: () => assessmentOutput(),
    dryRun: () => ({ ...assessmentOutput() }),
  };
}

function matchingCareerFitRunner() {
  return {
    production: (scenario: GoldenScenario) => careerFitOutput(scenario),
    dryRun: (scenario: GoldenScenario) => ({ ...careerFitOutput(scenario) }),
  };
}

function assessmentOutput() {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: {
      profileConfidence: 80,
      assessmentCompleteness: 80,
    },
    strengths: {
      topStrengths: ['Analytical Thinking'],
    },
    weaknesses: {
      developmentAreas: ['Risk Calibration'],
    },
  };
}

function careerFitOutput(scenario: GoldenScenario) {
  const payload = scenario.input.payload as { profileId?: string };
  return {
    careerId: scenario.scenarioId,
    studentProfileId: payload.profileId ?? `${scenario.scenarioId}-profile`,
    overallFitScore: 80,
    fitLevel: 'GOOD',
    confidence: {
      overall: 80,
      level: 'HIGH',
    },
    strengths: [],
    concerns: [],
  };
}
