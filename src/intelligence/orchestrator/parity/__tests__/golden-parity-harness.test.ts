import { describe, expect, it } from 'vitest';
import { assessmentGoldenScenarios } from '../assessmentGoldenScenarios';
import { careerFitGoldenScenarios } from '../careerFitGoldenScenarios';
import { GoldenParityHarness } from '../GoldenParityHarness';
import type { GoldenScenario } from '../GoldenScenarioTypes';

describe('GoldenParityHarness', () => {
  it('records MATCHED when independent dry-run output normalizes to production output', async () => {
    const harness = new GoldenParityHarness({
      assessmentRunner: {
        production: () => createAssessmentOutput(),
        dryRun: () => ({ ...createAssessmentOutput() }),
      },
      now: fixedClock,
    });

    const result = await harness.runAssessmentScenario(assessmentGoldenScenarios[0]);

    expect(result.status).toBe('MATCHED');
    expect(result.normalizedProduction).toEqual(result.normalizedDryRun);
    expect(result.payloadSummary).toBeDefined();
  });

  it('records DRIFT_DETECTED when normalized outputs differ', async () => {
    const harness = new GoldenParityHarness({
      careerFitRunner: {
        production: () => createCareerFitOutput({ overallFitScore: 80 }),
        dryRun: () => createCareerFitOutput({ overallFitScore: 70 }),
      },
      now: fixedClock,
    });

    const result = await harness.runCareerFitScenario(careerFitGoldenScenarios[0]);

    expect(result.status).toBe('DRIFT_DETECTED');
    expect(result.driftDetails).toContain('overallFitScore');
  });

  it('records NOT_COMPARABLE when outputs cannot be normalized', async () => {
    const harness = new GoldenParityHarness({
      assessmentRunner: {
        production: () => 'not-an-object',
        dryRun: () => createAssessmentOutput(),
      },
      now: fixedClock,
    });

    const result = await harness.runAssessmentScenario(assessmentGoldenScenarios[1]);

    expect(result.status).toBe('NOT_COMPARABLE');
    expect(result.driftDetails).toEqual(['One or both outputs could not be normalized.']);
  });

  it('records SELF_MIRRORED honestly when dry-run returns the exact production object reference', async () => {
    const sharedOutput = createCareerFitOutput();
    const harness = new GoldenParityHarness({
      careerFitRunner: {
        production: () => sharedOutput,
        dryRun: () => sharedOutput,
      },
      now: fixedClock,
    });

    const result = await harness.runCareerFitScenario(careerFitGoldenScenarios[1]);

    expect(result.status).toBe('SELF_MIRRORED');
    expect(result.productionOutput).toBe(sharedOutput);
    expect(result.dryRunOutput).toBe(sharedOutput);
  });

  it('captures dry-run failures without mutating production output', async () => {
    const productionOutput = Object.freeze(createCareerFitOutput({ overallFitScore: 86 }));
    const harness = new GoldenParityHarness({
      careerFitRunner: {
        production: () => productionOutput,
        dryRun: () => {
          throw new Error('dry-run unavailable');
        },
      },
      now: fixedClock,
    });

    const result = await harness.runCareerFitScenario(careerFitGoldenScenarios[2]);

    expect(result.status).toBe('FAILED');
    expect(result.productionOutput).toBe(productionOutput);
    expect(productionOutput).toEqual(createCareerFitOutput({ overallFitScore: 86 }));
    expect(result.failureDetails[0]).toContain('dry-run unavailable');
  });

  it('skips scenarios when no runner is configured', async () => {
    const harness = new GoldenParityHarness({ now: fixedClock });

    const result = await harness.runAssessmentScenario(assessmentGoldenScenarios[2]);

    expect(result.status).toBe('SKIPPED');
    expect(result.failureDetails).toContain('No runner configured for scenario flow.');
  });

  it('runs all 40 golden scenarios through injected independent runners and generates a report', async () => {
    const harness = new GoldenParityHarness({
      assessmentRunner: {
        production: () => createAssessmentOutput(),
        dryRun: () => ({ ...createAssessmentOutput() }),
      },
      careerFitRunner: {
        production: productionCareerFitFromScenario,
        dryRun: productionCareerFitFromScenario,
      },
      now: fixedClock,
    });

    const results = await harness.runScenarioBatch([
      ...assessmentGoldenScenarios,
      ...careerFitGoldenScenarios,
    ]);
    const report = harness.generateParityReport(results);

    expect(results).toHaveLength(40);
    expect(report.totalScenarios).toBe(40);
    expect(report.metrics.matchedCount).toBe(40);
    expect(report.metrics.parityPercentage).toBe(100);
    expect(report.criticalGaps).toEqual([]);
  });
});

function fixedClock(): string {
  return '2026-06-06T00:00:00.000Z';
}

function createAssessmentOutput() {
  return {
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: {
      profileConfidence: 82,
      assessmentCompleteness: 90,
    },
    strengths: {
      topStrengths: ['analyticalThinking'],
    },
    weaknesses: {
      developmentAreas: ['riskCalibration'],
    },
  };
}

function createCareerFitOutput(overrides: Partial<ReturnType<typeof baseCareerFitOutput>> = {}) {
  return {
    ...baseCareerFitOutput(),
    ...overrides,
  };
}

function baseCareerFitOutput() {
  return {
    careerId: 'career-fit-high-obvious',
    studentProfileId: 'career-fit-high-obvious-profile',
    overallFitScore: 92,
    fitLevel: 'STRONG',
    confidence: {
      overall: 82,
      level: 'HIGH',
    },
    strengths: ['Stable comparable signal'],
    concerns: [],
  };
}

function productionCareerFitFromScenario(scenario: GoldenScenario) {
  const payload = scenario.input.payload as { profileId?: string };
  return createCareerFitOutput({
    careerId: scenario.scenarioId,
    studentProfileId: payload.profileId ?? `${scenario.scenarioId}-profile`,
  });
}
