import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ForecastEngine,
  createForecastEngine,
  type CareerForecastInputs,
  type CareerForecastResult,
  type ForecastSignalDirection,
} from '@/intelligence/market/forecasting';

function createCareerInputs(): CareerForecastInputs {
  const historicalDemand = [
    50, 54, 58, 62, 66, 70,
  ].map((value, index) => ({
    timestamp: new Date(Date.UTC(2025, index, 1)),
    value,
  }));

  const growthTrend = [
    45, 48, 52, 55, 58, 62,
  ].map((value, index) => ({
    timestamp: new Date(Date.UTC(2025, index, 1)),
    value,
  }));

  return {
    careerId: 'software-engineer',
    title: 'Software Engineer',
    historicalDemand,
    historicalSalary: historicalDemand,
    growthTrend,
    signals: [
      {
        timestamp: new Date('2026-01-01T00:00:00.000Z'),
        type: 'hiring_growth',
        strength: 80,
        direction: 'positive',
      },
      {
        timestamp: new Date('2026-01-02T00:00:00.000Z'),
        type: 'automation_offset',
        strength: 40,
        direction: 'neutral',
      },
    ],
    evidence: [],
    relatedSkills: ['TypeScript', 'Systems Design'],
    industryAlignment: ['Technology'],
    automationRisk: 25,
    resilienceIndicators: {
      skillTransferability: 85,
      educationBarrier: 45,
      geographicFlexibility: 80,
    },
  };
}

function expectCareerForecastResultShape(result: CareerForecastResult) {
  expect(result.forecast).toBeDefined();
  expect(Array.isArray(result.insights)).toBe(true);
  expect(result.riskAssessment).toEqual({
    automationRisk: 25,
    marketSaturationRisk: 40,
    geographicConstraint: 20,
  });
}

describe('cached career forecast result contract', () => {
  it('imports ForecastEngine successfully', () => {
    expect(typeof ForecastEngine).toBe('function');
    expect(typeof createForecastEngine).toBe('function');
  });

  it('requires riskAssessment on the CareerForecastResult contract', () => {
    const result: CareerForecastResult = createForecastEngine().forecastCareer(
      createCareerInputs(),
      '3_year',
    );

    expectCareerForecastResultShape(result);
  });

  it('returns riskAssessment on fresh and cached career forecast results', () => {
    const engine = createForecastEngine({ cacheForecasts: true });
    const inputs = createCareerInputs();

    const fresh = engine.forecastCareer(inputs, '3_year');
    const cached = engine.forecastCareer(inputs, '3_year');

    expectCareerForecastResultShape(fresh);
    expectCareerForecastResultShape(cached);
    expect(cached.riskAssessment).toEqual(fresh.riskAssessment);
    expect(cached.forecast.id).toBe(fresh.forecast.id);
  });

  it('keeps cached and fresh career forecast result shapes compatible', () => {
    const engine = createForecastEngine({ cacheForecasts: true });
    const inputs = createCareerInputs();

    const freshKeys = Object.keys(engine.forecastCareer(inputs, '5_year')).sort();
    const cachedKeys = Object.keys(engine.forecastCareer(inputs, '5_year')).sort();

    expect(cachedKeys).toEqual(freshKeys);
    expect(cachedKeys).toEqual(['forecast', 'insights', 'riskAssessment']);
  });

  it('does not return unsafe partial cached objects as CareerForecastResult', () => {
    const source = readFileSync(
      join(process.cwd(), 'src', 'intelligence', 'market', 'forecasting', 'ForecastEngine.ts'),
      'utf8',
    );

    expect(source).not.toContain('as CareerForecastResult');
    expect(source).not.toContain('as SkillForecastResult');
    expect(source).toContain('careerResultCache');
  });

  it('preserves pinned forecast confidence and growth behavior for a cached fixture', () => {
    const engine = createForecastEngine({ cacheForecasts: true });
    const inputs = createCareerInputs();

    engine.forecastCareer(inputs, '3_year');
    const cached = engine.forecastCareer(inputs, '3_year');

    expect(cached.forecast.confidence.overall).toBeGreaterThan(0);
    expect(cached.forecast.expectedValue.growth.expected).toBeGreaterThan(0);
  });

  it('keeps AV lifecycle and AU signal-direction contracts intact', () => {
    const result = createForecastEngine().forecastCareer(createCareerInputs(), '3_year');
    const directions: ForecastSignalDirection[] = ['positive', 'negative', 'neutral'];

    expect(result.forecast.generatedAt).toBeInstanceOf(Date);
    expect(result.forecast.expiresAt.getTime()).toBeGreaterThan(result.forecast.generatedAt.getTime());
    expect(result.forecast.version).toBe(1);
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
