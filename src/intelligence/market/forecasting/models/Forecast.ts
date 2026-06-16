/**
 * CareerOS Market Intelligence - Forecast Model
 *
 * Core forecast entity representing probabilistic future projections.
 *
 * Principle: Never output deterministic predictions.
 * Always output scenarios with confidence and uncertainty.
 */

import type { ForecastScenario } from './ForecastScenario';
import type { ForecastConfidence } from './ForecastConfidence';
import type { ForecastRange } from './ForecastRange';

/**
 * Entity type for forecast.
 */
export type ForecastEntityType = 'career' | 'skill' | 'industry' | 'region';

/**
 * Forecast horizon.
 */
export type ForecastHorizon = '1_year' | '3_year' | '5_year' | '10_year';

/**
 * Forecast status.
 */
export type ForecastStatus =
  | 'generating'
  | 'ready'
  | 'stale'
  | 'validated'
  | 'superseded';

/**
 * Direction of a market signal used by forecast engines.
 */
export type ForecastSignalDirection = 'positive' | 'negative' | 'neutral';

/**
 * Market signal evidence used to shape forecast scenarios and confidence.
 */
export interface ForecastSignal {
  /** When the signal was observed */
  timestamp: Date;

  /** Signal category or source-specific type */
  type: string;

  /** Signal strength (0-100) */
  strength: number;

  /** Signal impact direction */
  direction: ForecastSignalDirection;
}

/**
 * Core forecast entity.
 */
export interface Forecast {
  /** Unique identifier */
  id: string;

  /** Entity identifier */
  entityId: string;

  /** Entity type */
  entityType: ForecastEntityType;

  /** Entity name */
  entityName: string;

  /** Forecast horizon */
  horizon: ForecastHorizon;

  /** Optimistic scenario */
  optimisticScenario: ForecastScenario;

  /** Baseline scenario */
  baselineScenario: ForecastScenario;

  /** Pessimistic scenario */
  pessimisticScenario: ForecastScenario;

  /** Overall confidence */
  confidence: ForecastConfidence;

  /** Scenario probabilities (should sum to 1.0) */
  scenarioProbabilities: {
    optimistic: number;
    baseline: number;
    pessimistic: number;
  };

  /** Expected value (probability-weighted average) */
  expectedValue: {
    demand: ForecastRange;
    salary: ForecastRange;
    growth: ForecastRange;
    opportunity: ForecastRange;
  };

  /** Forecast status */
  status: ForecastStatus;

  /** When forecast was generated */
  generatedAt: Date;

  /** When forecast expires (becomes stale) */
  expiresAt: Date;

  /** Forecast version */
  version: number;

  /** Inputs used to generate forecast */
  inputs: {
    dataPoints: number;
    timeRange: { start: Date; end: Date };
    sources: string[];
  };

  /** Key insights */
  insights: string[];

  /** Risk factors */
  riskFactors: string[];

  /** Methodology notes */
  methodology: string[];
}

/**
 * Input required to create a forecast before lifecycle metadata is assigned.
 */
export type ForecastInput = Omit<Forecast, 'id' | 'generatedAt' | 'expiresAt' | 'version'>;

/**
 * Create a forecast.
 */
export function createForecast(
  params: ForecastInput
): Forecast {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

  return {
    id: `forecast-${params.entityType}-${params.entityId}-${now.getTime()}`,
    generatedAt: now,
    expiresAt,
    version: 1,
    ...params,
  };
}

/**
 * Calculate expected values from scenarios.
 */
export function calculateExpectedValues(
  scenarios: {
    optimistic: ForecastScenario;
    baseline: ForecastScenario;
    pessimistic: ForecastScenario;
  },
  probabilities: { optimistic: number; baseline: number; pessimistic: number }
): Forecast['expectedValue'] {
  const getValue = (v: number | ForecastRange) =>
    typeof v === 'number' ? v : v.expected;

  const weightedAverage = (
    optimistic: number | ForecastRange,
    baseline: number | ForecastRange,
    pessimistic: number | ForecastRange
  ): ForecastRange => {
    const opt = getValue(optimistic);
    const base = getValue(baseline);
    const pes = getValue(pessimistic);

    const expected =
      opt * probabilities.optimistic +
      base * probabilities.baseline +
      pes * probabilities.pessimistic;

    const variance = Math.sqrt(
      Math.pow(opt - expected, 2) * probabilities.optimistic +
        Math.pow(base - expected, 2) * probabilities.baseline +
        Math.pow(pes - expected, 2) * probabilities.pessimistic
    );

    return {
      minimum: Math.max(0, expected - variance * 1.28),
      expected: Math.round(expected),
      maximum: Math.min(100, expected + variance * 1.28),
      confidenceInterval: 0.8,
    };
  };

  return {
    demand: weightedAverage(
      scenarios.optimistic.demandProjection,
      scenarios.baseline.demandProjection,
      scenarios.pessimistic.demandProjection
    ),
    salary: weightedAverage(
      scenarios.optimistic.salaryProjection,
      scenarios.baseline.salaryProjection,
      scenarios.pessimistic.salaryProjection
    ),
    growth: weightedAverage(
      scenarios.optimistic.growthProjection,
      scenarios.baseline.growthProjection,
      scenarios.pessimistic.growthProjection
    ),
    opportunity: weightedAverage(
      scenarios.optimistic.opportunityProjection,
      scenarios.baseline.opportunityProjection,
      scenarios.pessimistic.opportunityProjection
    ),
  };
}

/**
 * Generate forecast summary.
 */
export function generateForecastSummary(forecast: Forecast): string {
  const parts: string[] = [];

  parts.push(`${forecast.entityName}:`);
  parts.push(`${forecast.horizon.replace('_', ' ')} forecast`);
  parts.push(`Baseline demand ${typeof forecast.baselineScenario.demandProjection === 'number'
      ? forecast.baselineScenario.demandProjection
      : forecast.baselineScenario.demandProjection.expected
    }`);
  parts.push(`(${forecast.confidence.level.replace('_', ' ')} confidence)`);

  return parts.join(' | ');
}

/**
 * Validate forecast completeness.
 */
export function validateForecast(forecast: Forecast): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check scenarios exist
  if (!forecast.optimisticScenario) issues.push('Missing optimistic scenario');
  if (!forecast.baselineScenario) issues.push('Missing baseline scenario');
  if (!forecast.pessimisticScenario) issues.push('Missing pessimistic scenario');

  // Check probabilities sum to ~1.0
  const probSum =
    forecast.scenarioProbabilities.optimistic +
    forecast.scenarioProbabilities.baseline +
    forecast.scenarioProbabilities.pessimistic;

  if (Math.abs(probSum - 1.0) > 0.05) {
    issues.push(`Scenario probabilities sum to ${probSum.toFixed(2)}, expected 1.0`);
  }

  // Check confidence
  if (forecast.confidence.overall < 0 || forecast.confidence.overall > 100) {
    issues.push('Confidence score out of range');
  }

  // Check dates
  if (forecast.expiresAt <= forecast.generatedAt) {
    issues.push('Expiration date must be after generation date');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Check if forecast is stale.
 */
export function isForecastStale(forecast: Forecast): boolean {
  return new Date() > forecast.expiresAt || forecast.status === 'stale';
}

/**
 * Get most likely scenario.
 */
export function getMostLikelyScenario(
  forecast: Forecast
): ForecastScenario {
  const probs = forecast.scenarioProbabilities;

  if (probs.optimistic >= probs.baseline && probs.optimistic >= probs.pessimistic) {
    return forecast.optimisticScenario;
  }

  if (probs.pessimistic >= probs.baseline && probs.pessimistic >= probs.optimistic) {
    return forecast.pessimisticScenario;
  }

  return forecast.baselineScenario;
}

/**
 * Compare two forecasts.
 */
export function compareForecasts(
  a: Forecast,
  b: Forecast
): {
  betterOutlook: 'a' | 'b' | 'similar';
  demandDifference: number;
  confidenceDifference: number;
} {
  const getDemand = (f: Forecast) =>
    typeof f.baselineScenario.demandProjection === 'number'
      ? f.baselineScenario.demandProjection
      : f.baselineScenario.demandProjection.expected;

  const demandA = getDemand(a);
  const demandB = getDemand(b);

  const demandDiff = demandA - demandB;

  let betterOutlook: 'a' | 'b' | 'similar';
  if (demandDiff > 10) betterOutlook = 'a';
  else if (demandDiff < -10) betterOutlook = 'b';
  else betterOutlook = 'similar';

  return {
    betterOutlook,
    demandDifference: Math.abs(Math.round(demandDiff)),
    confidenceDifference: Math.abs(a.confidence.overall - b.confidence.overall),
  };
}
