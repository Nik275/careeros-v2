/**
 * CareerOS Market Intelligence - Forecast Confidence Model
 *
 * Represents confidence in a forecast.
 *
 * Purpose:
 * - Quantify uncertainty
 * - Enable risk-weighted decisions
 * - Track calibration over time
 */

/**
 * Confidence factors.
 */
export interface ConfidenceFactors {
  /** Data quality (0-100) */
  dataQuality: number;

  /** Historical consistency (0-100) */
  historicalConsistency: number;

  /** Trend persistence (0-100) */
  trendPersistence: number;

  /** Signal strength (0-100) */
  signalStrength: number;

  /** Model fit (0-100) */
  modelFit: number;
}

/**
 * Forecast confidence assessment.
 */
export interface ForecastConfidence {
  /** Overall confidence score (0-100) */
  overall: number;

  /** Confidence by factor */
  factors: ConfidenceFactors;

  /** Confidence level */
  level: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';

  /** Recommended action based on confidence */
  recommendation: string;

  /** Limitations affecting confidence */
  limitations: string[];

  /** Ways to improve confidence */
  improvementStrategies: string[];

  /** Calibration score (how accurate past forecasts were) */
  calibrationScore?: number;
}

/**
 * Confidence weights.
 */
const CONFIDENCE_WEIGHTS = {
  dataQuality: 0.25,
  historicalConsistency: 0.2,
  trendPersistence: 0.25,
  signalStrength: 0.2,
  modelFit: 0.1,
};

/**
 * Calculate overall confidence from factors.
 */
export function calculateConfidence(factors: ConfidenceFactors): ForecastConfidence {
  // Calculate weighted average
  let weightedSum = 0;
  for (const [key, weight] of Object.entries(CONFIDENCE_WEIGHTS)) {
    const factorKey = key as keyof ConfidenceFactors;
    weightedSum += (factors[factorKey] ?? 50) * weight;
  }

  const overall = Math.round(weightedSum);

  // Determine level
  const level = assessConfidenceLevel(overall);

  // Generate recommendation
  const recommendation = generateRecommendation(overall, factors);

  // Identify limitations
  const limitations = identifyLimitations(factors);

  // Suggest improvements
  const improvementStrategies = suggestImprovements(factors);

  return {
    overall,
    factors,
    level,
    recommendation,
    limitations,
    improvementStrategies,
  };
}

/**
 * Assess confidence level.
 */
export function assessConfidenceLevel(score: number): ForecastConfidence['level'] {
  if (score >= 90) return 'very_high';
  if (score >= 75) return 'high';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'low';
  return 'very_low';
}

/**
 * Generate recommendation based on confidence.
 */
function generateRecommendation(
  overall: number,
  factors: ConfidenceFactors
): string {
  if (overall >= 80) {
    return 'High confidence forecast suitable for strategic planning';
  }

  if (overall >= 60) {
    return 'Moderate confidence - use for planning with contingency options';
  }

  if (overall >= 40) {
    return 'Low confidence - treat as directional guidance only';
  }

  // Identify weakest factor
  const factorEntries = Object.entries(factors) as [keyof ConfidenceFactors, number][];
  const weakest = factorEntries.reduce((min, current) =>
    current[1] < min[1] ? current : min
  );

  return `Very low confidence due to weak ${weakest[0].replace(/([A-Z])/g, ' $1').toLowerCase()}. Gather more data before relying on forecast.`;
}

/**
 * Identify confidence limitations.
 */
function identifyLimitations(factors: ConfidenceFactors): string[] {
  const limitations: string[] = [];

  if (factors.dataQuality < 60) {
    limitations.push('Limited or low-quality historical data');
  }

  if (factors.historicalConsistency < 60) {
    limitations.push('High volatility in historical patterns');
  }

  if (factors.trendPersistence < 60) {
    limitations.push('Recent trends show instability');
  }

  if (factors.signalStrength < 60) {
    limitations.push('Weak signal strength from current indicators');
  }

  if (factors.modelFit < 60) {
    limitations.push('Model may not capture all relevant factors');
  }

  return limitations;
}

/**
 * Suggest improvement strategies.
 */
function suggestImprovements(factors: ConfidenceFactors): string[] {
  const strategies: string[] = [];

  if (factors.dataQuality < 70) {
    strategies.push('Collect additional historical data points');
  }

  if (factors.historicalConsistency < 70) {
    strategies.push('Analyze volatility drivers and segmentation');
  }

  if (factors.trendPersistence < 70) {
    strategies.push('Monitor for trend stabilization over longer period');
  }

  if (factors.signalStrength < 70) {
    strategies.push('Incorporate additional signal sources');
  }

  if (factors.modelFit < 70) {
    strategies.push('Refine model with additional variables');
  }

  return strategies;
}

/**
 * Adjust confidence for forecast horizon.
 */
export function adjustConfidenceForHorizon(
  baseConfidence: number,
  horizonYears: number
): number {
  // Confidence decreases with longer horizons
  // Use exponential decay
  const decayFactor = Math.pow(0.9, horizonYears);
  return Math.round(baseConfidence * decayFactor);
}

/**
 * Compare confidence levels.
 */
export function compareConfidence(
  a: ForecastConfidence,
  b: ForecastConfidence
): {
  higher: 'a' | 'b' | 'tie';
  difference: number;
  keyFactor: string;
} {
  const difference = a.overall - b.overall;

  let higher: 'a' | 'b' | 'tie';
  if (difference > 10) higher = 'a';
  else if (difference < -10) higher = 'b';
  else higher = 'tie';

  // Find key differentiating factor
  const factorDiffs = Object.entries(a.factors).map(([key, value]) => ({
    key,
    diff: value - (b.factors[key as keyof ConfidenceFactors] ?? 50),
  }));

  const keyFactor = factorDiffs.reduce((max, current) =>
    Math.abs(current.diff) > Math.abs(max.diff) ? current : max
  );

  return {
    higher,
    difference: Math.abs(Math.round(difference)),
    keyFactor: keyFactor.key,
  };
}

/**
 * Merge confidence assessments.
 */
export function mergeConfidence(
  confidences: ForecastConfidence[]
): ForecastConfidence {
  if (confidences.length === 0) {
    return calculateConfidence({
      dataQuality: 50,
      historicalConsistency: 50,
      trendPersistence: 50,
      signalStrength: 50,
      modelFit: 50,
    });
  }

  if (confidences.length === 1) {
    return confidences[0]!;
  }

  // Average factors
  const avgFactors: ConfidenceFactors = {
    dataQuality: Math.round(
      confidences.reduce((sum, c) => sum + c.factors.dataQuality, 0) /
        confidences.length
    ),
    historicalConsistency: Math.round(
      confidences.reduce((sum, c) => sum + c.factors.historicalConsistency, 0) /
        confidences.length
    ),
    trendPersistence: Math.round(
      confidences.reduce((sum, c) => sum + c.factors.trendPersistence, 0) /
        confidences.length
    ),
    signalStrength: Math.round(
      confidences.reduce((sum, c) => sum + c.factors.signalStrength, 0) /
        confidences.length
    ),
    modelFit: Math.round(
      confidences.reduce((sum, c) => sum + c.factors.modelFit, 0) /
        confidences.length
    ),
  };

  return calculateConfidence(avgFactors);
}
