/**
 * CareerOS Market Intelligence - Forecast Range Model
 *
 * Represents a probabilistic range for forecast values.
 *
 * Purpose:
 * - Express uncertainty explicitly
 * - Provide bounds for scenario planning
 * - Enable risk-aware decision making
 */

/**
 * A probabilistic forecast range.
 */
export interface ForecastRange {
  /** Minimum expected value (pessimistic bound) */
  minimum: number;

  /** Most likely expected value */
  expected: number;

  /** Maximum expected value (optimistic bound) */
  maximum: number;

  /** Confidence interval (e.g., 80% confidence) */
  confidenceInterval?: number;
}

/**
 * Create a forecast range.
 */
export function createForecastRange(
  expected: number,
  variance: number,
  confidenceInterval: number = 0.8
): ForecastRange {
  // Calculate bounds based on variance
  const halfRange = variance * 1.28; // Approximate for 80% confidence

  return {
    minimum: Math.max(0, expected - halfRange),
    expected: Math.round(expected),
    maximum: Math.min(100, expected + halfRange),
    confidenceInterval,
  };
}

/**
 * Create asymmetric forecast range.
 */
export function createAsymmetricRange(
  expected: number,
  downsideVariance: number,
  upsideVariance: number,
  confidenceInterval: number = 0.8
): ForecastRange {
  const downsideFactor = 1.28;
  const upsideFactor = 1.28;

  return {
    minimum: Math.max(0, expected - downsideVariance * downsideFactor),
    expected: Math.round(expected),
    maximum: Math.min(100, expected + upsideVariance * upsideFactor),
    confidenceInterval,
  };
}

/**
 * Calculate variance from historical data.
 */
export function calculateVariance(values: number[]): number {
  if (values.length < 2) return 10; // Default moderate variance

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Widen range for longer horizons.
 */
export function adjustRangeForHorizon(
  baseRange: ForecastRange,
  horizonYears: number
): ForecastRange {
  // Uncertainty increases with square root of time
  const uncertaintyMultiplier = Math.sqrt(horizonYears);

  const expectedDiff = baseRange.expected - baseRange.minimum;
  const maxDiff = baseRange.maximum - baseRange.expected;

  return {
    minimum: Math.max(0, baseRange.expected - expectedDiff * uncertaintyMultiplier),
    expected: baseRange.expected,
    maximum: Math.min(100, baseRange.expected + maxDiff * uncertaintyMultiplier),
    confidenceInterval: baseRange.confidenceInterval,
  };
}

/**
 * Merge multiple ranges.
 */
export function mergeRanges(ranges: ForecastRange[]): ForecastRange {
  if (ranges.length === 0) {
    return { minimum: 0, expected: 50, maximum: 100 };
  }

  if (ranges.length === 1) {
    return ranges[0]!;
  }

  // Weighted average by confidence
  const totalWeight = ranges.length;

  const avgExpected =
    ranges.reduce((sum, r) => sum + r.expected, 0) / totalWeight;

  const avgMinimum =
    ranges.reduce((sum, r) => sum + r.minimum, 0) / totalWeight;

  const avgMaximum =
    ranges.reduce((sum, r) => sum + r.maximum, 0) / totalWeight;

  return {
    minimum: Math.round(avgMinimum),
    expected: Math.round(avgExpected),
    maximum: Math.round(avgMaximum),
    confidenceInterval: 0.8,
  };
}

/**
 * Check if value falls within range.
 */
export function isWithinRange(range: ForecastRange, value: number): boolean {
  return value >= range.minimum && value <= range.maximum;
}

/**
 * Calculate range width.
 */
export function getRangeWidth(range: ForecastRange): number {
  return range.maximum - range.minimum;
}

/**
 * Assess range uncertainty.
 */
export function assessUncertainty(range: ForecastRange): {
  level: 'low' | 'moderate' | 'high' | 'extreme';
  width: number;
} {
  const width = getRangeWidth(range);

  let level: 'low' | 'moderate' | 'high' | 'extreme';
  if (width <= 15) level = 'low';
  else if (width <= 30) level = 'moderate';
  else if (width <= 50) level = 'high';
  else level = 'extreme';

  return { level, width };
}
