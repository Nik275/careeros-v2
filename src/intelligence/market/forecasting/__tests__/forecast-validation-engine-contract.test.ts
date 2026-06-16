import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ForecastValidationEngine,
  createForecast,
  createForecastScenario,
  calculateConfidence,
  calculateExpectedValues,
  type Forecast,
} from '@/intelligence/market/forecasting';
import type {
  CareerMarketProfileComponents,
  MarketSignalDirection,
  MarketSignalMetadata,
} from '@/intelligence/market';

function createScenario(type: 'optimistic' | 'baseline' | 'pessimistic', demand: number) {
  return createForecastScenario(type, {
    probability: type === 'baseline' ? 'likely' : 'possible',
    probabilityScore: type === 'baseline' ? 0.5 : 0.25,
    demandProjection: demand,
    salaryProjection: demand,
    growthProjection: demand,
    opportunityProjection: demand,
    narrative: [`${type} validation scenario`],
    assumptions: ['stable market evidence'],
    criticalFactors: ['demand stability'],
    evidence: ['contract fixture'],
    riskFactors: ['forecast uncertainty'],
  });
}

function createValidationForecast(): Forecast {
  const optimistic = createScenario('optimistic', 80);
  const baseline = createScenario('baseline', 60);
  const pessimistic = createScenario('pessimistic', 40);

  return createForecast({
    entityId: 'software-engineer',
    entityType: 'career',
    entityName: 'Software Engineer',
    horizon: '3_year',
    optimisticScenario: optimistic,
    baselineScenario: baseline,
    pessimisticScenario: pessimistic,
    confidence: calculateConfidence({
      dataQuality: 80,
      historicalConsistency: 75,
      trendPersistence: 70,
      signalStrength: 65,
      modelFit: 80,
    }),
    scenarioProbabilities: {
      optimistic: 0.25,
      baseline: 0.5,
      pessimistic: 0.25,
    },
    expectedValue: calculateExpectedValues(
      { optimistic, baseline, pessimistic },
      { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 },
    ),
    status: 'ready',
    inputs: {
      dataPoints: 12,
      timeRange: {
        start: new Date('2025-01-01T00:00:00.000Z'),
        end: new Date('2025-12-31T00:00:00.000Z'),
      },
      sources: ['contract-fixture'],
    },
    insights: ['validation contract fixture'],
    riskFactors: ['forecast uncertainty'],
    methodology: ['deterministic test fixture'],
  });
}

describe('forecast validation engine contract', () => {
  it('imports ForecastValidationEngine successfully', () => {
    expect(typeof ForecastValidationEngine).toBe('function');
  });

  it('has a single canonical calculateCalibration implementation', () => {
    const source = readFileSync(
      join(process.cwd(), 'src', 'intelligence', 'market', 'forecasting', 'ForecastValidationEngine.ts'),
      'utf8',
    );

    expect(source.match(/calculateCalibration\s*\(/g)).toHaveLength(1);
    expect(source).toContain('calculateConfidenceCalibration');
  });

  it('passes validation for actual values close to the baseline forecast', () => {
    const engine = new ForecastValidationEngine();
    const result = engine.validateForecast(createValidationForecast(), {
      demand: 61,
      salary: 59,
      growth: 60,
      opportunity: 62,
    });

    expect(result.accurate).toBe(true);
    expect(result.withinRange).toBe(true);
    expect(result.confidenceCalibration.predicted).toBeGreaterThan(0);
    expect(result.confidenceCalibration.actual).toBeGreaterThanOrEqual(0);
  });

  it('fails validation for actual values far from the baseline forecast', () => {
    const engine = new ForecastValidationEngine();
    const result = engine.validateForecast(createValidationForecast(), {
      demand: 5,
      salary: 5,
      growth: 5,
      opportunity: 5,
    });

    expect(result.accurate).toBe(false);
    expect(result.withinRange).toBe(false);
    expect(result.confidenceCalibration.calibrationError).toBeGreaterThan(0);
  });

  it('keeps forecast scenario probability handling deterministic', () => {
    const scenario = createForecastScenario('baseline', {
      probability: 'possible',
      probabilityScore: 0.25,
      demandProjection: 50,
      salaryProjection: 50,
      growthProjection: 50,
      opportunityProjection: 50,
      narrative: ['explicit probability fixture'],
      assumptions: ['explicit probability wins'],
      criticalFactors: ['probability assignment'],
      evidence: ['contract fixture'],
      riskFactors: ['none'],
    });

    expect(scenario.probability).toBe('possible');
    expect(scenario.probabilityScore).toBe(0.25);
  });

  it('keeps the mechanical market public type surface resolvable', () => {
    const direction: MarketSignalDirection = 'positive';
    const metadata: MarketSignalMetadata = {
      sourceReliability: 90,
      geography: 'india',
      timePeriod: {
        start: new Date('2025-01-01T00:00:00.000Z'),
        end: new Date('2025-12-31T00:00:00.000Z'),
      },
    };
    const components: Partial<CareerMarketProfileComponents> = {
      demand: {
        jobPostingsTrend: 80,
        hiringRate: 70,
        competitionRatio: 40,
      },
    };

    const marketIndexSource = readFileSync(
      join(process.cwd(), 'src', 'intelligence', 'market', 'index.ts'),
      'utf8',
    );

    expect(direction).toBe('positive');
    expect(metadata.sourceReliability).toBe(90);
    expect(components.demand?.jobPostingsTrend).toBe(80);
    expect(marketIndexSource).toContain('MarketSignalDirection');
    expect(marketIndexSource).toContain('MarketSignalMetadata');
    expect(marketIndexSource).toContain('CareerMarketProfileComponents');
  });

  it('keeps live routing, raw capture, and output replacement controls disabled from forecasting exports', async () => {
    const forecastingModule = await import('@/intelligence/market/forecasting');
    const exportedNames = Object.keys(forecastingModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });
});
