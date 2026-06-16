import { describe, expect, it } from 'vitest';

import {
  CareerForecastEngine,
  ConfidenceForecastEngine,
  ScenarioGenerator,
  type ForecastSignal,
  type ForecastSignalDirection,
} from '@/intelligence/market/forecasting';

describe('Market forecasting signal direction contract', () => {
  it('imports CareerForecastEngine successfully', () => {
    expect(typeof CareerForecastEngine).toBe('function');
  });

  it('defines neutral as part of the canonical forecast signal direction contract', () => {
    const directions: ForecastSignalDirection[] = ['positive', 'negative', 'neutral'];

    expect(directions).toEqual(['positive', 'negative', 'neutral']);
  });

  it('accepts and preserves neutral timestamped forecast signals in scenario context creation', () => {
    const signal: ForecastSignal = {
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
      type: 'regulatory_pause',
      strength: 50,
      direction: 'neutral',
    };

    const context = new ScenarioGenerator().createContext({
      historicalDemand: [40, 42, 44],
      historicalGrowth: [45, 45, 46],
      signals: [signal],
      volatility: 12,
    });

    expect(signal.timestamp).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    expect(context.trendDirection).toBe('neutral');
    expect(context.evidence).toEqual(['regulatory_pause (neutral, 50)']);
  });

  it('keeps neutral signals as no-op evidence for scenario probability adjustment', () => {
    const generator = new ScenarioGenerator();
    const scenarios = generator.generateScenarios(
      generator.createContext({
        historicalDemand: [50, 51, 52],
        historicalGrowth: [50, 51, 52],
        signals: [],
        volatility: 10,
      }),
    );

    const neutralEvidence: Pick<ForecastSignal, 'direction' | 'strength'>[] = [
      {
        strength: 80,
        direction: 'neutral',
      },
    ];

    const probabilities = generator.adjustProbabilities(scenarios, neutralEvidence);

    expect(probabilities.optimistic).toBeCloseTo(1 / 3, 5);
    expect(probabilities.baseline).toBeCloseTo(1 / 3, 5);
    expect(probabilities.pessimistic).toBeCloseTo(1 / 3, 5);
  });

  it('uses timestamped neutral signals in confidence without narrowing the contract', () => {
    const confidence = new ConfidenceForecastEngine().calculateConfidence({
      historicalData: [
        { timestamp: new Date('2025-01-01T00:00:00.000Z'), value: 40, quality: 80 },
        { timestamp: new Date('2025-06-01T00:00:00.000Z'), value: 42, quality: 80 },
        { timestamp: new Date('2026-01-01T00:00:00.000Z'), value: 43, quality: 80 },
      ],
      evidence: [],
      signals: [
        {
          timestamp: new Date(),
          type: 'steady_hiring',
          strength: 60,
          direction: 'neutral',
        },
        {
          timestamp: new Date(),
          type: 'steady_salary',
          strength: 60,
          direction: 'neutral',
        },
        {
          timestamp: new Date(),
          type: 'steady_growth',
          strength: 60,
          direction: 'neutral',
        },
      ],
      modelFit: 75,
      horizonYears: 3,
    });

    expect(confidence.factors.trendPersistence).toBe(100);
    expect(confidence.factors.signalStrength).toBeGreaterThanOrEqual(50);
    expect(confidence.overall).toBeGreaterThan(0);
  });

  it('imports the Market Forecasting public barrel successfully', async () => {
    const forecastingModule = await import('@/intelligence/market/forecasting');

    expect(typeof forecastingModule.CareerForecastEngine).toBe('function');
    expect(typeof forecastingModule.ScenarioGenerator).toBe('function');
    expect(typeof forecastingModule.ConfidenceForecastEngine).toBe('function');
  });

  it('does not expose live routing or production output replacement controls', async () => {
    const forecastingModule = await import('@/intelligence/market/forecasting');
    const exportedNames = Object.keys(forecastingModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('replaceProductionOutput');
    expect(exportedNames).not.toContain('enableLiveRouting');
  });
});
