/**
 * Value Evolution Engine - Detection Algorithms
 *
 * Deterministic algorithms for detecting value evolution patterns.
 *
 * Design Principles:
 * - No machine learning - only transparent calculations
 * - Explainable detection logic
 * - Conservative thresholds
 * - Clear formulas
 */

import type {
  ValueSnapshot,
  ValueHistory,
  TrackedValueId,
  ValueEvolution,
  EvolutionPattern,
  ValueShift,
  ValueDrift,
  ValueStability,
  DominantValueAnalysis,
  ValueTrajectoryForecast,
  ForecastMethod,
} from './types.js';

import { TRACKED_VALUES, DEFAULT_VALUE_EVOLUTION_CONFIG } from './types.js';

// ============================================================================
// EVOLUTION PATTERN DETECTION
// ============================================================================

/**
 * Detect evolution pattern for a single value.
 */
export function detectEvolutionPattern(
  snapshots: ValueSnapshot[],
  valueId: TrackedValueId,
  config = DEFAULT_VALUE_EVOLUTION_CONFIG
): ValueEvolution {
  if (snapshots.length < 2) {
    return createEmptyEvolution(valueId);
  }

  const values = snapshots.map(s => s.values[valueId]);
  const startValue = values[0];
  const currentValue = values[values.length - 1];
  const totalChange = currentValue - startValue;

  // Calculate change rate per month
  const timeSpanMs = snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp;
  const timeSpanMonths = timeSpanMs / (1000 * 60 * 60 * 24 * 30);
  const changeRatePerMonth = timeSpanMonths > 0 ? totalChange / timeSpanMonths : 0;

  // Detect pattern
  const pattern = determinePattern(values, totalChange, timeSpanMonths, config);

  // Calculate confidence
  const confidence = calculateEvolutionConfidence(snapshots, valueId);

  return {
    valueId,
    pattern,
    startValue,
    currentValue,
    totalChange,
    changeRatePerMonth,
    confidence,
    explanation: generateEvolutionExplanation(valueId, pattern, totalChange, changeRatePerMonth),
  };
}

/**
 * Determine evolution pattern from value sequence.
 */
function determinePattern(
  values: number[],
  totalChange: number,
  timeSpanMonths: number,
  config: typeof DEFAULT_VALUE_EVOLUTION_CONFIG
): EvolutionPattern {
  const n = values.length;

  if (n < 2) return 'stable';

  // Calculate change rate
  const changeRatePerMonth = timeSpanMonths > 0 ? totalChange / timeSpanMonths : 0;

  // Check for stability (minimal change)
  const variance = calculateVariance(values);
  const range = Math.max(...values) - Math.min(...values);
  if (range < 0.1 && variance < 0.01) {
    return 'stable';
  }

  // Check for major shift (single large jump)
  const maxJump = Math.max(...values.slice(1).map((v, i) => Math.abs(v - values[i])));
  if (maxJump > config.shiftThreshold && range > 0.2) {
    return totalChange > 0 ? 'emerge' : 'decline';
  }

  // Check for oscillation
  const directionChanges = countDirectionChanges(values);
  if (directionChanges >= 2 && range > 0.15) {
    return 'oscillate';
  }

  // Check for drift (gradual consistent change)
  if (timeSpanMonths > 3 && Math.abs(totalChange) > 0.15) {
    if (Math.abs(changeRatePerMonth) > 0.03) {
      return totalChange > 0 ? 'emerge' : 'decline';
    }
    return 'drift';
  }

  // Check for convergence (moving toward mean)
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const startDistFromMean = Math.abs(values[0] - mean);
  const endDistFromMean = Math.abs(values[n - 1] - mean);
  if (startDistFromMean > 0.15 && endDistFromMean < 0.1) {
    return 'converge';
  }

  // Check for volatility
  const coefficientOfVariation = Math.sqrt(variance) / (mean || 1);
  if (coefficientOfVariation > 0.3) {
    return 'volatile';
  }

  // Default to drift if there's any consistent movement
  if (Math.abs(totalChange) > 0.1) {
    return 'drift';
  }

  return 'stable';
}

/**
 * Count direction changes in value sequence.
 */
function countDirectionChanges(values: number[]): number {
  let changes = 0;
  let lastDirection = 0; // -1 = down, 1 = up, 0 = none

  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const direction = diff > 0.01 ? 1 : diff < -0.01 ? -1 : 0;

    if (direction !== 0 && lastDirection !== 0 && direction !== lastDirection) {
      changes++;
    }

    if (direction !== 0) {
      lastDirection = direction;
    }
  }

  return changes;
}

/**
 * Calculate variance of values.
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

/**
 * Calculate confidence in evolution detection.
 */
function calculateEvolutionConfidence(
  snapshots: ValueSnapshot[],
  valueId: TrackedValueId
): number {
  if (snapshots.length < 2) return 0.3;

  // More snapshots = higher confidence
  const sampleConfidence = Math.min(0.95, 0.4 + snapshots.length * 0.1);

  // Higher individual confidences = higher evolution confidence
  const avgConfidence = snapshots.reduce((sum, s) => sum + (s.confidences[valueId] || 0.5), 0) / snapshots.length;

  // Time span affects confidence (longer = more reliable)
  const timeSpanMs = snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp;
  const timeSpanMonths = timeSpanMs / (1000 * 60 * 60 * 24 * 30);
  const timeConfidence = Math.min(0.95, timeSpanMonths / 6); // Full confidence at 6+ months

  return (sampleConfidence + avgConfidence + timeConfidence) / 3;
}

/**
 * Create empty evolution for insufficient data.
 */
function createEmptyEvolution(valueId: TrackedValueId): ValueEvolution {
  return {
    valueId,
    pattern: 'stable',
    startValue: 0.5,
    currentValue: 0.5,
    totalChange: 0,
    changeRatePerMonth: 0,
    confidence: 0.3,
    explanation: `Insufficient data to determine evolution pattern for ${valueId}`,
  };
}

/**
 * Generate explanation for evolution.
 */
function generateEvolutionExplanation(
  valueId: TrackedValueId,
  pattern: EvolutionPattern,
  totalChange: number,
  changeRatePerMonth: number
): string {
  const direction = totalChange > 0 ? 'increased' : 'decreased';
  const magnitude = Math.abs(totalChange);

  switch (pattern) {
    case 'stable':
      return `${valueId} has remained stable with minimal change (${magnitude.toFixed(2)})`;
    case 'drift':
      return `${valueId} has ${direction} gradually by ${magnitude.toFixed(2)} (${changeRatePerMonth.toFixed(3)}/month)`;
    case 'shift':
      return `${valueId} underwent a significant shift, ${direction} by ${magnitude.toFixed(2)}`;
    case 'oscillate':
      return `${valueId} has oscillated, showing back-and-forth movement`;
    case 'emerge':
      return `${valueId} is emerging as more important, ${direction} by ${magnitude.toFixed(2)}`;
    case 'decline':
      return `${valueId} is declining in importance, ${direction} by ${magnitude.toFixed(2)}`;
    case 'volatile':
      return `${valueId} shows volatile, unpredictable changes`;
    case 'converge':
      return `${valueId} is converging toward average importance`;
    default:
      return `${valueId} shows ${pattern} pattern with ${magnitude.toFixed(2)} total change`;
  }
}

// ============================================================================
// SHIFT DETECTION
// ============================================================================

/**
 * Detect value shifts in history.
 */
export function detectValueShifts(
  snapshots: ValueSnapshot[],
  threshold: number = DEFAULT_VALUE_EVOLUTION_CONFIG.shiftThreshold
): ValueShift[] {
  if (snapshots.length < 2) return [];

  const shifts: ValueShift[] = [];

  for (const valueId of TRACKED_VALUES) {
    for (let i = 1; i < snapshots.length; i++) {
      const beforeValue = snapshots[i - 1].values[valueId];
      const afterValue = snapshots[i].values[valueId];
      const magnitude = Math.abs(afterValue - beforeValue);

      if (magnitude >= threshold) {
        const direction = afterValue > beforeValue ? 'increase' : 'decrease';
        const significance = determineShiftSignificance(magnitude);

        shifts.push({
          id: `shift_${valueId}_${snapshots[i].timestamp}`,
          valueId,
          timestamp: snapshots[i].timestamp,
          beforeValue,
          afterValue,
          magnitude,
          direction,
          significance,
          potentialCauses: inferShiftCauses(snapshots[i], valueId, direction),
          explanation: generateShiftExplanation(valueId, direction, magnitude, beforeValue, afterValue),
        });
      }
    }
  }

  return shifts.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Determine significance of a shift.
 */
function determineShiftSignificance(magnitude: number): ValueShift['significance'] {
  if (magnitude >= 0.5) return 'transformative';
  if (magnitude >= 0.3) return 'major';
  if (magnitude >= 0.2) return 'moderate';
  return 'minor';
}

/**
 * Infer potential causes of a shift.
 */
function inferShiftCauses(
  snapshot: ValueSnapshot,
  valueId: TrackedValueId,
  direction: 'increase' | 'decrease'
): string[] {
  const causes: string[] = [];
  const context = snapshot.context;

  if (context.recentExperiences) {
    causes.push(...context.recentExperiences.map(e => `Experience: ${e}`));
  }

  if (context.externalFactors) {
    causes.push(...context.externalFactors.map(f => `External factor: ${f}`));
  }

  if (context.lifeStage) {
    causes.push(`Life stage: ${context.lifeStage}`);
  }

  // Default causes based on value and direction
  if (causes.length === 0) {
    causes.push(`${direction === 'increase' ? 'Growing' : 'Declining'} importance of ${valueId}`);
  }

  return causes.slice(0, 3); // Limit to top 3
}

/**
 * Generate shift explanation.
 */
function generateShiftExplanation(
  valueId: TrackedValueId,
  direction: 'increase' | 'decrease',
  magnitude: number,
  beforeValue: number,
  afterValue: number
): string {
  return `${valueId} ${direction}d significantly from ${beforeValue.toFixed(2)} to ${afterValue.toFixed(2)} ` +
    `(magnitude: ${magnitude.toFixed(2)})`;
}

// ============================================================================
// DRIFT DETECTION
// ============================================================================

/**
 * Detect value drift.
 */
export function detectValueDrift(
  snapshots: ValueSnapshot[],
  sensitivity: number = DEFAULT_VALUE_EVOLUTION_CONFIG.driftSensitivity
): ValueDrift {
  if (snapshots.length < 3) {
    return {
      hasDrift: false,
      driftedValues: [],
      driftMagnitudes: {} as Record<TrackedValueId, number>,
      overallDriftScore: 0,
      explanation: 'Insufficient data for drift detection',
    };
  }

  const driftedValues: TrackedValueId[] = [];
  const driftMagnitudes = {} as Record<TrackedValueId, number>;
  let totalDrift = 0;

  for (const valueId of TRACKED_VALUES) {
    const values = snapshots.map(s => s.values[valueId]);
    const drift = calculateDriftScore(values);

    driftMagnitudes[valueId] = drift;
    totalDrift += drift;

    if (drift > sensitivity) {
      driftedValues.push(valueId);
    }
  }

  const overallDriftScore = totalDrift / TRACKED_VALUES.length;
  const hasDrift = driftedValues.length > 0;

  return {
    hasDrift,
    driftedValues,
    driftMagnitudes,
    overallDriftScore,
    explanation: generateDriftExplanation(driftedValues, overallDriftScore, sensitivity),
  };
}

/**
 * Calculate drift score for a value sequence.
 */
function calculateDriftScore(values: number[]): number {
  if (values.length < 3) return 0;

  // Calculate linear trend
  const n = values.length;
  const indices = values.map((_, i) => i);
  const meanX = indices.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  const numerator = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
  const denominator = indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0);

  const slope = denominator > 0 ? numerator / denominator : 0;

  // Normalize slope to 0-1 scale (assuming max reasonable drift is 0.5 over full period)
  const maxExpectedDrift = 0.5;
  const normalizedDrift = Math.min(1, Math.abs(slope * n) / maxExpectedDrift);

  return normalizedDrift;
}

/**
 * Generate drift explanation.
 */
function generateDriftExplanation(
  driftedValues: TrackedValueId[],
  overallDriftScore: number,
  sensitivity: number
): string {
  if (driftedValues.length === 0) {
    return `No significant drift detected (threshold: ${sensitivity})`;
  }

  return `${driftedValues.length} values show drift above threshold (${sensitivity}): ` +
    driftedValues.join(', ') +
    `. Overall drift score: ${overallDriftScore.toFixed(2)}`;
}

// ============================================================================
// STABILITY ANALYSIS
// ============================================================================

/**
 * Analyze value stability.
 */
export function analyzeValueStability(
  snapshots: ValueSnapshot[],
  threshold: number = DEFAULT_VALUE_EVOLUTION_CONFIG.stabilityThreshold
): ValueStability {
  if (snapshots.length < 2) {
    return {
      overallStability: 0.5,
      valueStability: {} as Record<TrackedValueId, number>,
      mostStableValue: TRACKED_VALUES[0],
      leastStableValue: TRACKED_VALUES[0],
      isGenerallyStable: false,
      explanation: 'Insufficient data for stability analysis',
    };
  }

  const valueStability = {} as Record<TrackedValueId, number>;

  for (const valueId of TRACKED_VALUES) {
    const values = snapshots.map(s => s.values[valueId]);
    valueStability[valueId] = calculateStabilityScore(values);
  }

  // Find most and least stable
  const entries = Object.entries(valueStability) as [TrackedValueId, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const mostStableValue = entries[0][0];
  const leastStableValue = entries[entries.length - 1][0];

  // Calculate overall stability
  const overallStability = entries.reduce((sum, [, score]) => sum + score, 0) / entries.length;

  return {
    overallStability,
    valueStability,
    mostStableValue,
    leastStableValue,
    isGenerallyStable: overallStability >= threshold,
    explanation: generateStabilityExplanation(overallStability, mostStableValue, leastStableValue, threshold),
  };
}

/**
 * Calculate stability score for a value sequence.
 */
function calculateStabilityScore(values: number[]): number {
  if (values.length < 2) return 0.5;

  // Calculate coefficient of variation (lower = more stable)
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;

  // Convert to stability score (inverse of CV, normalized)
  // CV of 0 = perfect stability (score 1)
  // CV of 0.5 = moderate stability (score 0.5)
  // CV of 1.0 = low stability (score 0)
  const stability = Math.max(0, 1 - cv * 2);

  return stability;
}

/**
 * Generate stability explanation.
 */
function generateStabilityExplanation(
  overallStability: number,
  mostStableValue: TrackedValueId,
  leastStableValue: TrackedValueId,
  threshold: number
): string {
  const stabilityLevel = overallStability >= threshold ? 'stable' : 'unstable';

  return `Values are generally ${stabilityLevel} (score: ${overallStability.toFixed(2)}, threshold: ${threshold}). ` +
    `Most stable: ${mostStableValue}. Least stable: ${leastStableValue}.`;
}

// ============================================================================
// DOMINANT VALUE ANALYSIS
// ============================================================================

/**
 * Analyze dominant values.
 */
export function analyzeDominantValues(
  snapshots: ValueSnapshot[]
): DominantValueAnalysis {
  if (snapshots.length === 0) {
    return {
      current: TRACKED_VALUES[0],
      ranking: [...TRACKED_VALUES],
      topScore: 0.5,
      dominanceGap: 0,
      isClearDominance: false,
      explanation: 'No data available for dominant value analysis',
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : undefined;

  // Rank values by current importance
  const ranked = Object.entries(latest.values)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id as TrackedValueId);

  const current = ranked[0];
  const topScore = latest.values[current];
  const secondScore = ranked[1] ? latest.values[ranked[1]] : 0;
  const dominanceGap = topScore - secondScore;
  const isClearDominance = dominanceGap > 0.15;

  // Check if dominant value changed
  let previousDominant: TrackedValueId | undefined;
  let changedAt: number | undefined;

  if (previous) {
    const prevRanked = Object.entries(previous.values)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id as TrackedValueId);
    previousDominant = prevRanked[0];

    if (previousDominant !== current) {
      changedAt = latest.timestamp;
    }
  }

  return {
    current,
    previous: previousDominant !== current ? previousDominant : undefined,
    changedAt,
    ranking: ranked,
    topScore,
    dominanceGap,
    isClearDominance,
    explanation: generateDominanceExplanation(current, previousDominant, dominanceGap, isClearDominance),
  };
}

/**
 * Generate dominance explanation.
 */
function generateDominanceExplanation(
  current: TrackedValueId,
  previous: TrackedValueId | undefined,
  dominanceGap: number,
  isClearDominance: boolean
): string {
  let explanation = `${current} is currently the dominant value`;

  if (previous && previous !== current) {
    explanation += ` (changed from ${previous})`;
  }

  explanation += ` with a ${dominanceGap.toFixed(2)} point gap over the next value.`;

  if (!isClearDominance) {
    explanation += ' Dominance is contested.';
  }

  return explanation;
}

// ============================================================================
// TRAJECTORY FORECASTING
// ============================================================================

/**
 * Forecast future value trajectory.
 */
export function forecastTrajectory(
  snapshots: ValueSnapshot[],
  horizonMonths: number = DEFAULT_VALUE_EVOLUTION_CONFIG.defaultForecastHorizon
): ValueTrajectoryForecast {
  const generatedAt = Date.now();

  if (snapshots.length < 2) {
    return createDefaultForecast(horizonMonths, generatedAt);
  }

  const predictedValues = {} as Record<TrackedValueId, number>;
  const confidenceIntervals = {} as Record<TrackedValueId, { lower: number; upper: number }>;
  let forecastMethod: ForecastMethod = 'stable-assumption';

  // Determine best forecast method based on data
  const timeSpanMs = snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp;
  const timeSpanMonths = timeSpanMs / (1000 * 60 * 60 * 24 * 30);

  if (timeSpanMonths >= 3 && snapshots.length >= 4) {
    forecastMethod = 'linear-trend';
  } else if (timeSpanMonths >= 1 && snapshots.length >= 3) {
    forecastMethod = 'momentum-based';
  }

  // Generate predictions for each value
  for (const valueId of TRACKED_VALUES) {
    const values = snapshots.map(s => s.values[valueId]);
    const latest = values[values.length - 1];

    let predicted: number;
    let interval: { lower: number; upper: number };

    switch (forecastMethod) {
      case 'linear-trend':
        ({ predicted, interval } = linearTrendForecast(values, horizonMonths, timeSpanMonths));
        break;
      case 'momentum-based':
        ({ predicted, interval } = momentumForecast(values, horizonMonths, timeSpanMonths));
        break;
      default:
        ({ predicted, interval } = stableForecast(latest));
        break;
    }

    predictedValues[valueId] = predicted;
    confidenceIntervals[valueId] = interval;
  }

  // Determine predicted dominant value
  const predictedDominant = Object.entries(predictedValues)
    .sort((a, b) => b[1] - a[1])[0][0] as TrackedValueId;

  // Calculate forecast confidence
  const forecastConfidence = calculateForecastConfidence(snapshots, forecastMethod);

  return {
    id: `forecast_${generatedAt}`,
    generatedAt,
    horizonMonths,
    predictedValues,
    confidenceIntervals,
    predictedDominantValue: predictedDominant,
    forecastConfidence,
    method: forecastMethod,
    assumptions: generateForecastAssumptions(forecastMethod, snapshots),
    explanation: generateForecastExplanation(forecastMethod, predictedDominant, horizonMonths),
  };
}

/**
 * Linear trend forecasting.
 */
function linearTrendForecast(
  values: number[],
  horizonMonths: number,
  timeSpanMonths: number
): { predicted: number; interval: { lower: number; upper: number } } {
  const n = values.length;
  const indices = values.map((_, i) => i);
  const meanX = indices.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  const numerator = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
  const denominator = indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0);

  const slope = denominator > 0 ? numerator / denominator : 0;

  // Project forward
  const futureIndex = n - 1 + (horizonMonths / (timeSpanMonths / n));
  const predicted = Math.max(0, Math.min(1, slope * (futureIndex - (n - 1)) + values[n - 1]));

  // Confidence interval widens with horizon
  const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - meanY, 2), 0) / n);
  const margin = stdDev * (1 + horizonMonths / 12);

  return {
    predicted,
    interval: {
      lower: Math.max(0, predicted - margin),
      upper: Math.min(1, predicted + margin),
    },
  };
}

/**
 * Momentum-based forecasting.
 */
function momentumForecast(
  values: number[],
  horizonMonths: number,
  timeSpanMonths: number
): { predicted: number; interval: { lower: number; upper: number } } {
  const n = values.length;
  const latest = values[n - 1];
  const previous = values[n - 2];
  const momentum = latest - previous;

  // Continue momentum, but dampen over time
  const dampening = Math.pow(0.7, horizonMonths / timeSpanMonths);
  const predicted = Math.max(0, Math.min(1, latest + momentum * dampening));

  // Confidence interval based on recent volatility
  const recentValues = values.slice(-Math.min(4, n));
  const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const variance = recentValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recentValues.length;
  const margin = Math.sqrt(variance) * 1.5;

  return {
    predicted,
    interval: {
      lower: Math.max(0, predicted - margin),
      upper: Math.min(1, predicted + margin),
    },
  };
}

/**
 * Stable forecast (assume no change).
 */
function stableForecast(latest: number): { predicted: number; interval: { lower: number; upper: number } } {
  return {
    predicted: latest,
    interval: {
      lower: Math.max(0, latest - 0.15),
      upper: Math.min(1, latest + 0.15),
    },
  };
}

/**
 * Create default forecast when insufficient data.
 */
function createDefaultForecast(horizonMonths: number, generatedAt: number): ValueTrajectoryForecast {
  const defaultValues = Object.fromEntries(
    TRACKED_VALUES.map(v => [v, 0.5])
  ) as Record<TrackedValueId, number>;

  return {
    id: `forecast_${generatedAt}`,
    generatedAt,
    horizonMonths,
    predictedValues: defaultValues,
    confidenceIntervals: Object.fromEntries(
      TRACKED_VALUES.map(v => [v, { lower: 0.3, upper: 0.7 }])
    ) as Record<TrackedValueId, { lower: number; upper: number }>,
    predictedDominantValue: TRACKED_VALUES[0],
    forecastConfidence: 0.3,
    method: 'stable-assumption',
    assumptions: ['Insufficient historical data', 'Assuming no significant change'],
    explanation: 'Forecast based on limited data. Assumes stable values over forecast horizon.',
  };
}

/**
 * Calculate forecast confidence.
 */
function calculateForecastConfidence(snapshots: ValueSnapshot[], method: ForecastMethod): number {
  // Base confidence on sample size
  const sampleConfidence = Math.min(0.9, 0.3 + snapshots.length * 0.1);

  // Time span affects confidence
  const timeSpanMs = snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp;
  const timeSpanMonths = timeSpanMs / (1000 * 60 * 60 * 24 * 30);
  const timeConfidence = Math.min(0.9, timeSpanMonths / 12);

  // Method affects confidence
  const methodConfidence: Record<ForecastMethod, number> = {
    'linear-trend': 0.8,
    'moving-average': 0.7,
    'momentum-based': 0.65,
    'reversion-mean': 0.6,
    'stable-assumption': 0.4,
  };

  return (sampleConfidence + timeConfidence + methodConfidence[method]) / 3;
}

/**
 * Generate forecast assumptions.
 */
function generateForecastAssumptions(method: ForecastMethod, snapshots: ValueSnapshot[]): string[] {
  const assumptions: string[] = [];

  switch (method) {
    case 'linear-trend':
      assumptions.push('Current trends will continue linearly');
      break;
    case 'momentum-based':
      assumptions.push('Recent momentum will continue with gradual dampening');
      break;
    case 'stable-assumption':
      assumptions.push('Values will remain relatively stable');
      break;
    default:
      assumptions.push('Historical patterns will persist');
  }

  assumptions.push('No major external disruptions or life events');
  assumptions.push('Student preferences evolve gradually');

  return assumptions;
}

/**
 * Generate forecast explanation.
 */
function generateForecastExplanation(
  method: ForecastMethod,
  predictedDominant: TrackedValueId,
  horizonMonths: number
): string {
  const methodDescription: Record<ForecastMethod, string> = {
    'linear-trend': 'linear trend projection',
    'moving-average': 'moving average extrapolation',
    'momentum-based': 'momentum continuation with dampening',
    'reversion-mean': 'mean reversion assumption',
    'stable-assumption': 'stability assumption',
  };

  return `Forecast using ${methodDescription[method]} predicts ${predictedDominant} will be dominant ` +
    `in ${horizonMonths} months based on historical patterns.`;
}
