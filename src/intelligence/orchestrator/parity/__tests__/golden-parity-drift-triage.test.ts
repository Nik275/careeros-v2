import { describe, expect, it } from 'vitest';
import { GoldenParityDriftTriage } from '../GoldenParityDriftTriage';
import type { GoldenScenarioResult } from '../GoldenScenarioTypes';

describe('GoldenParityDriftTriage', () => {
  it('classifies normalizer mismatch', () => {
    const summary = new GoldenParityDriftTriage().triage([
      result({
        driftDetails: ['confidenceLevel'],
        normalizedProduction: { confidenceLevel: 'UNKNOWN' },
        normalizedDryRun: { confidenceLevel: 'HIGH' },
      }),
    ]);

    expect(summary.items[0].category).toBe('NORMALIZER_MISMATCH');
  });

  it('classifies real semantic drift', () => {
    const summary = new GoldenParityDriftTriage().triage([
      result({
        driftDetails: ['overallFitScore'],
        normalizedProduction: { overallFitScore: 90 },
        normalizedDryRun: { overallFitScore: 70 },
      }),
    ]);

    expect(summary.items[0]).toMatchObject({
      category: 'REAL_SEMANTIC_DRIFT',
      severity: 'HIGH',
    });
  });

  it('classifies schema mismatch', () => {
    const summary = new GoldenParityDriftTriage().triage([
      result({
        driftDetails: ['fitLevel'],
        normalizedProduction: { fitLevel: 'GOOD' },
        normalizedDryRun: {},
      }),
    ]);

    expect(summary.items[0].category).toBe('SCHEMA_MISMATCH');
  });
});

function result(overrides: Partial<GoldenScenarioResult>): GoldenScenarioResult {
  return {
    scenarioId: 'scenario-1',
    flowType: 'career-fit',
    status: 'DRIFT_DETECTED',
    riskLevel: 'LOW',
    driftDetails: [],
    failureDetails: [],
    payloadSummary: {},
    notes: [],
    ...overrides,
  };
}
