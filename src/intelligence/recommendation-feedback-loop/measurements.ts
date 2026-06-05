/**
 * Recommendation Feedback Loop - Measurements
 * 
 * Transparent algorithms for measuring recommendation accuracy.
 * 
 * Design Principles:
 * - All calculations are explainable
 * - No machine learning or complex statistics
 * - Conservative estimates
 * - Clear formulas
 */

import type { 
  CareerRecommendation,
  ConfidenceScore,
} from '../types/index.js';

import type { OutcomeRecord } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';

import type {
  AccuracyType,
  AccuracyMeasurement,
  ComparisonResult,
  ConfidenceCalibration,
  CalibrationMetrics,
  TypeAccuracyMetrics,
  PathAccuracyMetrics,
  RecommendationAccuracyAnalysis,
  RecommendationOutcomePair,
} from './types.js';

import {
  ComparisonResult as ComparisonResultEnum,
  AccuracyType as AccuracyTypeEnum,
} from './types.js';

import { DEFAULT_FEEDBACK_CONFIG } from './types.js';

// ============================================================================
// PATH CHOICE ACCURACY
// ============================================================================

/**
 * Measure path choice accuracy.
 * Did the student choose the recommended path?
 */
export function measurePathChoiceAccuracy(
  recommendation: CareerRecommendation,
  outcome: OutcomeRecord
): AccuracyMeasurement {
  const recommendedPath = recommendation.path.id;
  const chosenPath = outcome.chosenPathId;
  const followed = recommendedPath === chosenPath;
  
  let result: ComparisonResult;
  let score: number;
  
  if (followed) {
    result = ComparisonResultEnum.CORRECT;
    score = 1.0;
  } else {
    result = ComparisonResultEnum.INCORRECT;
    score = 0.0;
  }
  
  return {
    type: AccuracyTypeEnum.PATH_CHOICE,
    result,
    score,
    predicted: recommendedPath,
    actual: chosenPath,
    error: followed ? 0 : 1,
    absoluteError: followed ? 0 : 1,
    withinTolerance: followed,
    explanation: followed 
      ? `Student followed recommendation: ${recommendedPath}`
      : `Student chose ${chosenPath} instead of recommended ${recommendedPath}`,
  };
}

// ============================================================================
// SATISFACTION PREDICTION ACCURACY
// ============================================================================

/**
 * Measure satisfaction prediction accuracy.
 * How close was the predicted satisfaction to actual?
 */
export function measureSatisfactionAccuracy(
  recommendation: CareerRecommendation,
  outcome: OutcomeRecord,
  tolerance: number = DEFAULT_FEEDBACK_CONFIG.predictionTolerance
): AccuracyMeasurement {
  // Extract predicted satisfaction from recommendation
  // This is typically embedded in the reasoning or confidence
  const predictedSatisfaction = extractPredictedSatisfaction(recommendation);
  
  // Extract actual satisfaction from outcome
  const actualSatisfaction = extractActualSatisfaction(outcome);
  
  if (predictedSatisfaction === undefined || actualSatisfaction === undefined) {
    return {
      type: AccuracyTypeEnum.SATISFACTION_PREDICTION,
      result: ComparisonResultEnum.UNKNOWN,
      score: 0,
      predicted: predictedSatisfaction ?? 'unknown',
      actual: actualSatisfaction ?? 'unknown',
      error: 0,
      absoluteError: 0,
      withinTolerance: false,
      explanation: 'Insufficient data to measure satisfaction accuracy',
    };
  }
  
  const error = predictedSatisfaction - actualSatisfaction;
  const absoluteError = Math.abs(error);
  const maxPossibleError = 1.0; // Satisfaction is 0-1
  const normalizedError = absoluteError / maxPossibleError;
  const score = Math.max(0, 1 - normalizedError);
  const withinTolerance = normalizedError <= tolerance;
  
  let result: ComparisonResult;
  if (normalizedError < tolerance / 2) {
    result = ComparisonResultEnum.CORRECT;
  } else if (normalizedError <= tolerance) {
    result = ComparisonResultEnum.PARTIAL;
  } else {
    result = ComparisonResultEnum.INCORRECT;
  }
  
  return {
    type: AccuracyTypeEnum.SATISFACTION_PREDICTION,
    result,
    score,
    predicted: predictedSatisfaction,
    actual: actualSatisfaction,
    error,
    absoluteError,
    withinTolerance,
    explanation: `Predicted satisfaction ${predictedSatisfaction.toFixed(2)}, ` +
                 `actual ${actualSatisfaction.toFixed(2)}, ` +
                 `error ${error.toFixed(2)} (${(normalizedError * 100).toFixed(1)}%)`,
  };
}

/**
 * Extract predicted satisfaction from recommendation.
 * Uses confidence as proxy if explicit prediction not available.
 */
function extractPredictedSatisfaction(recommendation: CareerRecommendation): number | undefined {
  // Use confidence as proxy for expected satisfaction
  // Higher confidence = higher predicted satisfaction
  // This is a conservative estimate
  return recommendation.confidence * 0.8 + 0.1; // Scale to 0.1-0.9 range
}

/**
 * Extract actual satisfaction from outcome.
 */
function extractActualSatisfaction(outcome: OutcomeRecord): number | undefined {
  if (outcome.finalOutcome?.satisfaction !== undefined) {
    // Normalize 0-100 to 0-1
    return outcome.finalOutcome.satisfaction / 100;
  }
  
  // Try latest snapshot
  const latest = outcome.snapshots[outcome.snapshots.length - 1];
  if (latest?.satisfaction?.overall !== undefined) {
    return latest.satisfaction.overall / 100;
  }
  
  return undefined;
}

// ============================================================================
// UTILITY PREDICTION ACCURACY
// ============================================================================

/**
 * Measure utility prediction accuracy.
 * How well did we predict the utility of the chosen path?
 */
export function measureUtilityAccuracy(
  recommendation: CareerRecommendation,
  outcome: OutcomeRecord,
  tolerance: number = DEFAULT_FEEDBACK_CONFIG.predictionTolerance
): AccuracyMeasurement {
  // For now, use a composite of satisfaction and success
  const predictedUtility = recommendation.confidence;
  const actualUtility = calculateActualUtility(outcome);
  
  if (actualUtility === undefined) {
    return {
      type: AccuracyTypeEnum.UTILITY_PREDICTION,
      result: ComparisonResultEnum.UNKNOWN,
      score: 0,
      predicted: predictedUtility,
      actual: 'unknown',
      error: 0,
      absoluteError: 0,
      withinTolerance: false,
      explanation: 'Insufficient outcome data for utility measurement',
    };
  }
  
  const error = predictedUtility - actualUtility;
  const absoluteError = Math.abs(error);
  const score = Math.max(0, 1 - absoluteError);
  const withinTolerance = absoluteError <= tolerance;
  
  let result: ComparisonResult;
  if (absoluteError < tolerance / 2) {
    result = ComparisonResultEnum.CORRECT;
  } else if (absoluteError <= tolerance) {
    result = ComparisonResultEnum.PARTIAL;
  } else {
    result = ComparisonResultEnum.INCORRECT;
  }
  
  return {
    type: AccuracyTypeEnum.UTILITY_PREDICTION,
    result,
    score,
    predicted: predictedUtility,
    actual: actualUtility,
    error,
    absoluteError,
    withinTolerance,
    explanation: `Predicted utility ${predictedUtility.toFixed(2)}, ` +
                 `actual ${actualUtility.toFixed(2)}, ` +
                 `error ${error.toFixed(2)}`,
  };
}

/**
 * Calculate actual utility from outcome.
 */
function calculateActualUtility(outcome: OutcomeRecord): number | undefined {
  const factors: number[] = [];
  
  // Satisfaction component
  const satisfaction = extractActualSatisfaction(outcome);
  if (satisfaction !== undefined) {
    factors.push(satisfaction);
  }
  
  // Success component
  if (outcome.finalOutcome?.success !== undefined) {
    factors.push(outcome.finalOutcome.success ? 1 : 0);
  }
  
  // Status component
  if (outcome.status === 'COMPLETED') {
    factors.push(1);
  } else if (outcome.status === 'ACTIVE') {
    factors.push(0.7);
  } else if (outcome.status === 'DROPPED_OUT') {
    factors.push(0);
  }
  
  if (factors.length === 0) return undefined;
  
  return factors.reduce((sum, f) => sum + f, 0) / factors.length;
}

// ============================================================================
// REGRET PREDICTION ACCURACY
// ============================================================================

/**
 * Measure regret prediction accuracy.
 * Did we correctly predict whether student would regret their choice?
 */
export function measureRegretAccuracy(
  recommendation: CareerRecommendation,
  outcome: OutcomeRecord
): AccuracyMeasurement {
  // Extract predicted regret from recommendation
  const predictedRegret = extractPredictedRegret(recommendation);
  
  // Extract actual regret from outcome
  const actualRegret = extractActualRegret(outcome);
  
  if (actualRegret === undefined) {
    return {
      type: AccuracyTypeEnum.REGRET_PREDICTION,
      result: ComparisonResultEnum.UNKNOWN,
      score: 0,
      predicted: predictedRegret,
      actual: 'unknown',
      error: 0,
      absoluteError: 0,
      withinTolerance: false,
      explanation: 'No regret data available in outcome record',
    };
  }
  
  const error = predictedRegret - actualRegret;
  const absoluteError = Math.abs(error);
  const score = 1 - absoluteError; // Binary: 1 if match, 0 if mismatch
  const withinTolerance = absoluteError < 0.5; // Tolerant for binary
  
  let result: ComparisonResult;
  if (absoluteError < 0.3) {
    result = ComparisonResultEnum.CORRECT;
  } else if (absoluteError < 0.7) {
    result = ComparisonResultEnum.PARTIAL;
  } else {
    result = ComparisonResultEnum.INCORRECT;
  }
  
  return {
    type: AccuracyTypeEnum.REGRET_PREDICTION,
    result,
    score,
    predicted: predictedRegret,
    actual: actualRegret,
    error,
    absoluteError,
    withinTolerance,
    explanation: `Predicted regret ${predictedRegret.toFixed(2)}, ` +
                 `actual ${actualRegret.toFixed(2)}`,
  };
}

/**
 * Extract predicted regret from recommendation.
 */
function extractPredictedRegret(recommendation: CareerRecommendation): number {
  // Use concerns as proxy for predicted regret
  // More concerns = higher predicted regret likelihood
  const concernSeverity = recommendation.concerns.reduce(
    (sum, c) => sum + c.severity, 
    0
  ) / Math.max(1, recommendation.concerns.length);
  
  // Invert: high concerns = high predicted regret likelihood
  return concernSeverity;
}

/**
 * Extract actual regret from outcome.
 */
function extractActualRegret(outcome: OutcomeRecord): number | undefined {
  // Check final outcome
  if (outcome.finalOutcome?.wouldRecommend === false) {
    return 0.8; // High regret
  }
  
  // Check for pivot actions (indicator of regret)
  const pivotActions = outcome.actionsTaken.filter(
    a => a.type === 'PIVOT_CONSIDERED' || a.type === 'PIVOT_EXECUTED'
  );
  if (pivotActions.length > 0) {
    return 0.6; // Moderate regret
  }
  
  // Check satisfaction
  const satisfaction = extractActualSatisfaction(outcome);
  if (satisfaction !== undefined && satisfaction < 0.4) {
    return 0.7; // Low satisfaction = regret
  }
  
  // Check if would choose again
  const latest = outcome.snapshots[outcome.snapshots.length - 1];
  if (latest?.satisfaction?.wouldChooseAgain === false) {
    return 0.9; // Strong regret
  }
  
  // No clear regret signals
  if (satisfaction !== undefined && satisfaction > 0.7) {
    return 0.1; // Low regret
  }
  
  return undefined;
}

// ============================================================================
// CONFIDENCE CALIBRATION
// ============================================================================

/**
 * Measure confidence calibration.
 * Was the confidence score well-calibrated to actual accuracy?
 */
export function measureConfidenceCalibration(
  recommendation: CareerRecommendation,
  actualAccuracy: number,
  thresholds: { wellCalibrated: number; overconfident: number; underconfident: number } = DEFAULT_FEEDBACK_CONFIG.calibrationThresholds
): ConfidenceCalibration {
  const predictedConfidence = recommendation.confidence;
  const calibrationError = predictedConfidence - actualAccuracy;
  
  let assessment: 'overconfident' | 'underconfident' | 'well_calibrated';
  if (calibrationError > thresholds.overconfident) {
    assessment = 'overconfident';
  } else if (calibrationError < thresholds.underconfident) {
    assessment = 'underconfident';
  } else {
    assessment = 'well_calibrated';
  }
  
  return {
    isWellCalibrated: assessment === 'well_calibrated',
    predictedConfidence,
    actualAccuracy,
    calibrationError,
    assessment,
  };
}

/**
 * Calculate aggregate calibration metrics.
 */
export function calculateCalibrationMetrics(
  calibrations: ConfidenceCalibration[]
): CalibrationMetrics {
  const n = calibrations.length;
  if (n === 0) {
    return {
      predictionCount: 0,
      meanCalibrationError: 0,
      overconfidentRate: 0,
      underconfidentRate: 0,
      wellCalibratedRate: 0,
      expectedCalibrationError: 0,
    };
  }
  
  const meanError = calibrations.reduce((sum, c) => sum + Math.abs(c.calibrationError), 0) / n;
  const overconfident = calibrations.filter(c => c.assessment === 'overconfident').length;
  const underconfident = calibrations.filter(c => c.assessment === 'underconfident').length;
  const wellCalibrated = calibrations.filter(c => c.assessment === 'well_calibrated').length;
  
  // Expected Calibration Error (ECE) - simple approximation
  const ece = calibrations.reduce((sum, c) => sum + Math.abs(c.calibrationError), 0) / n;
  
  return {
    predictionCount: n,
    meanCalibrationError: meanError,
    overconfidentRate: overconfident / n,
    underconfidentRate: underconfident / n,
    wellCalibratedRate: wellCalibrated / n,
    expectedCalibrationError: ece,
  };
}

// ============================================================================
// AGGREGATE METRICS
// ============================================================================

/**
 * Calculate type accuracy metrics.
 */
export function calculateTypeAccuracyMetrics(
  type: AccuracyType,
  measurements: AccuracyMeasurement[]
): TypeAccuracyMetrics {
  const typeMeasurements = measurements.filter(m => m.type === type);
  const n = typeMeasurements.length;
  
  if (n === 0) {
    return {
      type,
      count: 0,
      meanAccuracy: 0,
      medianAccuracy: 0,
      stdDev: 0,
      resultDistribution: new Map(),
    };
  }
  
  const scores = typeMeasurements.map(m => m.score);
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const sorted = [...scores].sort((a, b) => a - b);
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)];
  
  // Standard deviation
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Result distribution
  const distribution = new Map<ComparisonResult, number>();
  for (const result of Object.values(ComparisonResultEnum)) {
    const count = typeMeasurements.filter(m => m.result === result).length;
    distribution.set(result, count);
  }
  
  return {
    type,
    count: n,
    meanAccuracy: mean,
    medianAccuracy: median,
    stdDev,
    resultDistribution: distribution,
  };
}

/**
 * Calculate path accuracy metrics.
 */
export function calculatePathAccuracyMetrics(
  pathId: string,
  pairs: RecommendationOutcomePair[]
): PathAccuracyMetrics {
  const pathPairs = pairs.filter(p => p.recommendedPathId === pathId);
  const n = pathPairs.length;
  
  if (n === 0) {
    return {
      pathId,
      recommendationCount: 0,
      outcomeCount: 0,
      followRate: 0,
      satisfactionAccuracy: 0,
      averageSatisfaction: 0,
      regretRate: 0,
    };
  }
  
  const followed = pathPairs.filter(p => p.followedRecommendation).length;
  const satisfactions = pathPairs
    .map(p => extractActualSatisfaction(p.outcome))
    .filter((s): s is number => s !== undefined);
  
  const regrets = pathPairs
    .map(p => extractActualRegret(p.outcome))
    .filter((r): r is number => r !== undefined);
  
  const avgSatisfaction = satisfactions.length > 0
    ? satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length
    : 0;
  
  const regretRate = regrets.length > 0
    ? regrets.filter(r => r > 0.5).length / regrets.length
    : 0;
  
  return {
    pathId,
    recommendationCount: n,
    outcomeCount: pathPairs.filter(p => p.outcome.status === 'COMPLETED').length,
    followRate: followed / n,
    satisfactionAccuracy: avgSatisfaction, // Simplified
    averageSatisfaction: avgSatisfaction,
    regretRate,
  };
}

// ============================================================================
// OVERALL ACCURACY
// ============================================================================

/**
 * Calculate overall accuracy from measurements.
 */
export function calculateOverallAccuracy(measurements: AccuracyMeasurement[]): number {
  if (measurements.length === 0) return 0;
  
  // Weight different accuracy types
  const weights = new Map<AccuracyType, number>([
    [AccuracyTypeEnum.PATH_CHOICE, 0.25],
    [AccuracyTypeEnum.SATISFACTION_PREDICTION, 0.25],
    [AccuracyTypeEnum.UTILITY_PREDICTION, 0.25],
    [AccuracyTypeEnum.REGRET_PREDICTION, 0.15],
    [AccuracyTypeEnum.CONFIDENCE_CALIBRATION, 0.10],
  ]);
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const measurement of measurements) {
    const weight = weights.get(measurement.type) || 0.2;
    weightedSum += measurement.score * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
