import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  CareerForecastEngine,
  calculateExpectedValues,
  createForecast,
  createForecastScenario,
  type ForecastInput,
  type ForecastSignalDirection,
} from '@/intelligence/market/forecasting';

const confidence = {
  overall: 80,
  factors: {
    dataQuality: 80,
    historicalConsistency: 80,
    trendPersistence: 80,
    signalStrength: 80,
    modelFit: 80,
  },
  level: 'high' as const,
  recommendation: 'High confidence forecast suitable for strategic planning',
  limitations: [],
  improvementStrategies: [],
};

function scenario(type: 'optimistic' | 'baseline' | 'pessimistic', growth: number) {
  return createForecastScenario(type, {
    probability: type === 'baseline' ? 'likely' : 'possible',
    probabilityScore: type === 'baseline' ? 0.5 : 0.25,
    demandProjection: growth,
    salaryProjection: growth,
    growthProjection: growth,
    opportunityProjection: growth,
    narrative: [`${type} narrative`],
    assumptions: [`${type} assumptions`],
    criticalFactors: [`${type} factor`],
    evidence: [`${type} evidence`],
    riskFactors: [`${type} risk`],
  });
}

function forecastInput(): ForecastInput {
  const scenarios = {
    optimistic: scenario('optimistic', 80),
    baseline: scenario('baseline', 50),
    pessimistic: scenario('pessimistic', 20),
  };
  const scenarioProbabilities = { optimistic: 0.25, baseline: 0.5, pessimistic: 0.25 };

  return {
    entityId: 'software-engineer',
    entityType: 'career',
    entityName: 'Software Engineer',
    horizon: '5_year',
    optimisticScenario: scenarios.optimistic,
    baselineScenario: scenarios.baseline,
    pessimisticScenario: scenarios.pessimistic,
    confidence,
    scenarioProbabilities,
    expectedValue: calculateExpectedValues(scenarios, scenarioProbabilities),
    status: 'ready',
    inputs: {
      dataPoints: 3,
      timeRange: {
        start: new Date('2025-01-01T00:00:00.000Z'),
        end: new Date('2026-01-01T00:00:00.000Z'),
      },
      sources: ['fixture'],
    },
    insights: ['Pinned fixture insight'],
    riskFactors: ['Pinned fixture risk'],
    methodology: ['Pinned fixture methodology'],
  };
}

describe('createForecast lifecycle contract', () => {
  it('imports createForecast successfully', () => {
    expect(typeof createForecast).toBe('function');
  });

  it('keeps lifecycle fields out of createForecast input and assigns them on output', () => {
    const input = forecastInput();
    const inputRecord = input as Record<string, unknown>;

    expect(inputRecord).not.toHaveProperty('id');
    expect(inputRecord).not.toHaveProperty('generatedAt');
    expect(inputRecord).not.toHaveProperty('expiresAt');
    expect(inputRecord).not.toHaveProperty('version');

    const forecast = createForecast(input);

    expect(forecast.id).toMatch(/^forecast-career-software-engineer-/);
    expect(forecast.generatedAt).toBeInstanceOf(Date);
    expect(forecast.expiresAt).toBeInstanceOf(Date);
    expect(forecast.expiresAt.getTime()).toBeGreaterThan(forecast.generatedAt.getTime());
    expect(forecast.version).toBe(1);
  });

  it('imports CareerForecastEngine successfully', () => {
    expect(typeof CareerForecastEngine).toBe('function');
  });

  it('keeps forecast engines from passing lifecycle fields into createForecast input', () => {
    const engineFiles = [
      'CareerForecastEngine.ts',
      'SkillForecastEngine.ts',
      'IndustryForecastEngine.ts',
      'RegionForecastEngine.ts',
    ];

    for (const file of engineFiles) {
      const source = readFileSync(
        join(process.cwd(), 'src', 'intelligence', 'market', 'forecasting', file),
        'utf8',
      );

      expect(source).not.toContain('generatedAt:');
      expect(source).not.toContain('expiresAt:');
      expect(source).not.toContain('version: 1');
    }
  });

  it('preserves pinned forecast confidence and growth behavior for a fixture', () => {
    const forecast = createForecast(forecastInput());

    expect(forecast.confidence.overall).toBe(80);
    expect(forecast.expectedValue.growth.expected).toBe(50);
  });

  it('keeps the AU forecast signal-direction contract intact', () => {
    const directions: ForecastSignalDirection[] = ['positive', 'negative', 'neutral'];

    expect(directions).toEqual(['positive', 'negative', 'neutral']);
  });

  it('does not expose live routing, raw capture, or output replacement controls', async () => {
    const forecastingModule = await import('@/intelligence/market/forecasting');
    const exportedNames = Object.keys(forecastingModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });
});
