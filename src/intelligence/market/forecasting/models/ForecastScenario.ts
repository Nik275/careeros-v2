/**
 * CareerOS Market Intelligence - Forecast Scenario Model
 *
 * Represents a single scenario in a forecast.
 *
 * Scenarios:
 * - Optimistic: Favorable conditions materialize
 * - Baseline: Most likely conditions
 * - Pessimistic: Unfavorable conditions materialize
 *
 * Purpose:
 * - Avoid false certainty
 * - Enable scenario planning
 * - Express multiple possible futures
 */

import type { ForecastRange } from './ForecastRange';

/**
 * Scenario type.
 */
export type ScenarioType = 'optimistic' | 'baseline' | 'pessimistic';

/**
 * Scenario probability assessment.
 */
export type ScenarioProbability = 'highly_likely' | 'likely' | 'possible' | 'unlikely';

/**
 * A forecast scenario with projections.
 */
export interface ForecastScenario {
  /** Scenario identifier */
  id: string;

  /** Scenario type */
  type: ScenarioType;

  /** Human-readable name */
  name: string;

  /** Probability assessment */
  probability: ScenarioProbability;

  /** Numerical probability if quantified (0-1) */
  probabilityScore?: number;

  /** Demand projection (0-100) */
  demandProjection: number | ForecastRange;

  /** Salary projection (relative index) */
  salaryProjection: number | ForecastRange;

  /** Growth projection (0-100) */
  growthProjection: number | ForecastRange;

  /** Opportunity projection (0-100) */
  opportunityProjection: number | ForecastRange;

  /** Scenario narrative - human-readable explanation */
  narrative: string[];

  /** Key assumptions */
  assumptions: string[];

  /** Critical factors for this scenario */
  criticalFactors: string[];

  /** Evidence supporting this scenario */
  evidence: string[];

  /** Risk factors that could prevent this scenario */
  riskFactors: string[];

  /** Timestamp of creation */
  createdAt: Date;
}

/**
 * Create a forecast scenario.
 */
export function createForecastScenario(
  type: ScenarioType,
  params: Omit<ForecastScenario, 'id' | 'type' | 'name' | 'createdAt'>
): ForecastScenario {
  const { probability, ...scenarioParams } = params;

  const names: Record<ScenarioType, string> = {
    optimistic: 'Optimistic Scenario',
    baseline: 'Baseline Scenario',
    pessimistic: 'Pessimistic Scenario',
  };

  const probabilities: Record<ScenarioType, ScenarioProbability> = {
    optimistic: 'possible',
    baseline: 'likely',
    pessimistic: 'possible',
  };

  return {
    id: `scenario-${type}-${Date.now()}`,
    type,
    name: names[type],
    ...scenarioParams,
    probability: probability ?? probabilities[type],
    createdAt: new Date(),
  };
}

/**
 * Create default scenarios set.
 */
export function createScenarioSet(
  baselineParams: Omit<
    ForecastScenario,
    'id' | 'type' | 'name' | 'probability' | 'createdAt'
  >,
  variance: number = 10
): {
  optimistic: ForecastScenario;
  baseline: ForecastScenario;
  pessimistic: ForecastScenario;
} {
  // Create baseline
  const baseline = createForecastScenario('baseline', {
    ...baselineParams,
    probability: 'likely',
    probabilityScore: 0.5,
  });

  // Create optimistic
  const optimistic = createForecastScenario('optimistic', {
    demandProjection: shiftValue(baselineParams.demandProjection, variance),
    salaryProjection: shiftValue(baselineParams.salaryProjection, variance),
    growthProjection: shiftValue(baselineParams.growthProjection, variance),
    opportunityProjection: shiftValue(baselineParams.opportunityProjection, variance),
    probability: 'possible',
    probabilityScore: 0.25,
    narrative: [...baselineParams.narrative, 'Favorable market conditions materialize'],
    assumptions: [...baselineParams.assumptions, 'Economic growth exceeds expectations'],
    criticalFactors: baselineParams.criticalFactors,
    evidence: baselineParams.evidence,
    riskFactors: ['Market conditions may not improve as projected'],
  });

  // Create pessimistic
  const pessimistic = createForecastScenario('pessimistic', {
    demandProjection: shiftValue(baselineParams.demandProjection, -variance),
    salaryProjection: shiftValue(baselineParams.salaryProjection, -variance),
    growthProjection: shiftValue(baselineParams.growthProjection, -variance),
    opportunityProjection: shiftValue(baselineParams.opportunityProjection, -variance),
    probability: 'possible',
    probabilityScore: 0.25,
    narrative: [...baselineParams.narrative, 'Challenging market conditions emerge'],
    assumptions: [...baselineParams.assumptions, 'Economic headwinds persist'],
    criticalFactors: baselineParams.criticalFactors,
    evidence: baselineParams.evidence,
    riskFactors: ['Market conditions may improve unexpectedly'],
  });

  return { optimistic, baseline, pessimistic };
}

/**
 * Shift a projection value by variance.
 */
function shiftValue(
  value: number | ForecastRange,
  shift: number
): number | ForecastRange {
  if (typeof value === 'number') {
    return Math.min(100, Math.max(0, value + shift));
  }

  return {
    minimum: Math.max(0, value.minimum + shift * 0.5),
    expected: Math.min(100, Math.max(0, value.expected + shift)),
    maximum: Math.min(100, value.maximum + shift * 1.5),
    confidenceInterval: value.confidenceInterval,
  };
}

/**
 * Compare two scenarios.
 */
export function compareScenarios(
  a: ForecastScenario,
  b: ForecastScenario
): {
  higherDemand: 'a' | 'b' | 'tie';
  higherGrowth: 'a' | 'b' | 'tie';
  difference: number;
} {
  const getValue = (v: number | ForecastRange) =>
    typeof v === 'number' ? v : v.expected;

  const demandA = getValue(a.demandProjection);
  const demandB = getValue(b.demandProjection);

  const growthA = getValue(a.growthProjection);
  const growthB = getValue(b.growthProjection);

  const higherDemand =
    demandA > demandB + 5 ? 'a' : demandB > demandA + 5 ? 'b' : 'tie';

  const higherGrowth =
    growthA > growthB + 5 ? 'a' : growthB > growthA + 5 ? 'b' : 'tie';

  const avgDiff = (Math.abs(demandA - demandB) + Math.abs(growthA - growthB)) / 2;

  return {
    higherDemand,
    higherGrowth,
    difference: Math.round(avgDiff),
  };
}

/**
 * Generate scenario summary.
 */
export function generateScenarioSummary(scenario: ForecastScenario): string {
  const getValue = (v: number | ForecastRange) =>
    typeof v === 'number' ? v : v.expected;

  const parts: string[] = [];

  parts.push(`${scenario.name}:`);
  parts.push(`Demand ${getValue(scenario.demandProjection)}`);
  parts.push(`Growth ${getValue(scenario.growthProjection)}`);

  if (scenario.probabilityScore) {
    parts.push(`(${Math.round(scenario.probabilityScore * 100)}% probability)`);
  }

  return parts.join(' | ');
}

/**
 * Validate scenario consistency.
 */
export function validateScenario(scenario: ForecastScenario): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const getValue = (v: number | ForecastRange) =>
    typeof v === 'number' ? v : v.expected;

  // Check ranges
  const checks = [
    { name: 'Demand', value: getValue(scenario.demandProjection) },
    { name: 'Salary', value: getValue(scenario.salaryProjection) },
    { name: 'Growth', value: getValue(scenario.growthProjection) },
    { name: 'Opportunity', value: getValue(scenario.opportunityProjection) },
  ];

  for (const check of checks) {
    if (check.value < 0 || check.value > 100) {
      issues.push(`${check.name} projection out of range: ${check.value}`);
    }
  }

  // Check narrative exists
  if (scenario.narrative.length === 0) {
    issues.push('Scenario lacks narrative explanation');
  }

  // Check assumptions exist
  if (scenario.assumptions.length === 0) {
    issues.push('Scenario lacks documented assumptions');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
