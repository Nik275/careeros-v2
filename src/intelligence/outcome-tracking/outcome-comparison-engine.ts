/**
 * CareerOS Outcome Tracking System - Comparison Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Compares predicted outcomes to actual outcomes, calculates accuracy metrics,
 * and generates learning signals for system improvement.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type Prediction,
  type PredictionComparison,
  type AccuracyMetrics,
  type RecommendationAccuracy,
  type IComparisonEngine,
  type StudentOutcomeRecord,
  type OutcomeTimepoint,
  type PathId,
  type RecommendationId,
  type StudentId,
} from './outcome-types.js';

// ============================================================================
// COMPARISON TYPES
// ============================================================================

/** Detailed prediction error analysis */
export interface PredictionErrorAnalysis {
  prediction: Prediction;
  actual: number;
  error: number;
  absoluteError: number;
  squaredError: number;
  percentageError: number;
  withinBounds: boolean;
  confidenceCalibration: number;
}

/** Bias analysis result */
export interface BiasAnalysis {
  direction: 'OPTIMISTIC' | 'PESSIMISTIC' | 'NEUTRAL';
  magnitude: number;
  consistency: number;
  pattern: string;
  recommendations: string[];
}

/** Calibration analysis */
export interface CalibrationAnalysis {
  expectedCalibration: number;
  actualCalibration: number;
  calibrationError: number;
  reliability: number;
  confidenceIntervals: Array<{
    confidence: number;
    actualCoverage: number;
  }>;
}

/** Recommendation outcome comparison */
export interface RecommendationOutcomeComparison {
  recommendation: {
    id: RecommendationId;
    pathId: PathId;
    predicted: {
      satisfaction: number;
      success: number;
      growth: number;
    };
  };
  actual?: {
    satisfaction: number;
    success: number;
    growth: number;
  };
  comparison?: {
    satisfactionAccuracy: number;
    successAccuracy: number;
    growthAccuracy: number;
    overallAccuracy: number;
  };
  status: 'PENDING' | 'VALIDATED' | 'MISMATCHED';
}

/** Time-series comparison */
export interface TimeSeriesComparison {
  timepoint: OutcomeTimepoint;
  predictions: Prediction[];
  actuals: number[];
  accuracy: number;
  error: number;
  bias: number;
}

// ============================================================================
// COMPARISON ENGINE IMPLEMENTATION
// ============================================================================

/**
 * Comparison Engine
 *
 * Compares predictions to actual outcomes and calculates accuracy metrics.
 */
export class ComparisonEngine implements IComparisonEngine {
  /**
   * Compare a single prediction to actual outcome
   */
  comparePredictionToReality(prediction: Prediction, actual: unknown): PredictionComparison {
    const actualValue = typeof actual === 'number' ? actual : this.extractNumericValue(actual);

    const absoluteError = Math.abs(actualValue - prediction.predictedValue);
    const relativeError = prediction.predictedValue !== 0
      ? Math.abs((actualValue - prediction.predictedValue) / prediction.predictedValue)
      : absoluteError;

    const withinConfidenceInterval =
      actualValue >= prediction.confidenceInterval.lower &&
      actualValue <= prediction.confidenceInterval.upper;

    const accuracy = Math.max(0, 100 - relativeError * 100);

    let bias: PredictionComparison['bias'] = 'CALIBRATED';
    if (actualValue > prediction.predictedValue + prediction.confidence * 0.1) {
      bias = 'PESSIMISTIC';
    } else if (actualValue < prediction.predictedValue - prediction.confidence * 0.1) {
      bias = 'OPTIMISTIC';
    }

    const calibrationScore = withinConfidenceInterval
      ? prediction.confidence
      : prediction.confidence * (1 - relativeError);

    return {
      prediction,
      actualValue,
      absoluteError,
      relativeError,
      withinConfidenceInterval,
      accuracy,
      bias,
      calibrationScore: Math.max(0, Math.min(100, calibrationScore)),
    };
  }

  /**
   * Calculate accuracy metrics across multiple predictions
   */
  calculateAccuracyMetrics(predictions: Prediction[], actuals: unknown[]): AccuracyMetrics {
    if (predictions.length === 0 || actuals.length === 0) {
      return {
        predictionType: 'unknown',
        totalPredictions: 0,
        averageAccuracy: 0,
        averageError: 0,
        calibrationScore: 0,
        biasDirection: 'NEUTRAL',
        confidenceCalibration: 0,
        trend: 'STABLE',
      };
    }

    const comparisons: PredictionComparison[] = [];
    const minLength = Math.min(predictions.length, actuals.length);

    for (let i = 0; i < minLength; i++) {
      try {
        const comparison = this.comparePredictionToReality(predictions[i], actuals[i]);
        comparisons.push(comparison);
      } catch {
        // Skip invalid comparisons
      }
    }

    if (comparisons.length === 0) {
      return {
        predictionType: predictions[0]?.predictionType || 'unknown',
        totalPredictions: 0,
        averageAccuracy: 0,
        averageError: 0,
        calibrationScore: 0,
        biasDirection: 'NEUTRAL',
        confidenceCalibration: 0,
        trend: 'STABLE',
      };
    }

    const accuracies = comparisons.map(c => c.accuracy);
    const errors = comparisons.map(c => c.absoluteError);

    const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;

    // Calculate bias direction
    const optimisticCount = comparisons.filter(c => c.bias === 'OPTIMISTIC').length;
    const pessimisticCount = comparisons.filter(c => c.bias === 'PESSIMISTIC').length;

    let biasDirection: AccuracyMetrics['biasDirection'] = 'NEUTRAL';
    if (optimisticCount > pessimisticCount * 1.5) {
      biasDirection = 'OPTIMISTIC';
    } else if (pessimisticCount > optimisticCount * 1.5) {
      biasDirection = 'PESSIMISTIC';
    }

    // Calculate calibration score
    const withinIntervalCount = comparisons.filter(c => c.withinConfidenceInterval).length;
    const calibrationScore = (withinIntervalCount / comparisons.length) * 100;

    // Calculate confidence calibration
    const confidenceCalibration = comparisons.reduce((sum, c) => sum + c.calibrationScore, 0) / comparisons.length;

    // Determine trend (would need historical data in real implementation)
    const trend: AccuracyMetrics['trend'] = 'STABLE';

    return {
      predictionType: predictions[0].predictionType,
      totalPredictions: comparisons.length,
      averageAccuracy,
      averageError,
      calibrationScore,
      biasDirection,
      confidenceCalibration,
      trend,
    };
  }

  /**
   * Assess recommendation accuracy
   */
  assessRecommendationAccuracy(recommendation: RecommendationAccuracy): RecommendationAccuracy {
    if (!recommendation.actualOutcome) {
      return {
        ...recommendation,
        recommendationQuality: 'ADEQUATE',
      };
    }

    const pred = recommendation.predictedOutcome;
    const actual = recommendation.actualOutcome;

    // Calculate accuracy for each dimension
    const satisfactionAccuracy = this.calculateDimensionAccuracy(pred.satisfaction, actual.satisfaction);
    const successAccuracy = this.calculateDimensionAccuracy(pred.success, actual.success);
    const growthAccuracy = this.calculateDimensionAccuracy(pred.growth, actual.growth);

    const overallAccuracy = (satisfactionAccuracy + successAccuracy + growthAccuracy) / 3;

    // Calculate outcome gap
    const outcomeGap = Math.abs(pred.satisfaction - actual.satisfaction) +
      Math.abs(pred.success - actual.success) +
      Math.abs(pred.growth - actual.growth);

    // Determine quality
    let recommendationQuality: RecommendationAccuracy['recommendationQuality'];
    if (overallAccuracy >= 90) {
      recommendationQuality = 'EXCELLENT';
    } else if (overallAccuracy >= 75) {
      recommendationQuality = 'GOOD';
    } else if (overallAccuracy >= 60) {
      recommendationQuality = 'ADEQUATE';
    } else {
      recommendationQuality = 'POOR';
    }

    return {
      ...recommendation,
      accuracy: overallAccuracy,
      outcomeGap,
      recommendationQuality,
    };
  }

  /**
   * Analyze prediction errors in detail
   */
  analyzePredictionErrors(predictions: Prediction[], actuals: unknown[]): PredictionErrorAnalysis[] {
    const analyses: PredictionErrorAnalysis[] = [];
    const minLength = Math.min(predictions.length, actuals.length);

    for (let i = 0; i < minLength; i++) {
      const prediction = predictions[i];
      const actual = typeof actuals[i] === 'number' ? actuals[i] as number : this.extractNumericValue(actuals[i]);

      const error = (actual as number) - prediction.predictedValue;
      const absoluteError = Math.abs(error);
      const squaredError = error * error;
      const percentageError = prediction.predictedValue !== 0
        ? (absoluteError / prediction.predictedValue) * 100
        : absoluteError;

      const withinBounds =
        (actual as number) >= prediction.confidenceInterval.lower &&
        (actual as number) <= prediction.confidenceInterval.upper;

      // Calculate confidence calibration
      const expectedWidth = prediction.confidenceInterval.upper - prediction.confidenceInterval.lower;
      const actualDeviation = absoluteError;
      const confidenceCalibration = expectedWidth > 0
        ? Math.max(0, 1 - (actualDeviation / expectedWidth))
        : 0;

      analyses.push({
        prediction,
        actual: actual as number,
        error,
        absoluteError,
        squaredError,
        percentageError,
        withinBounds,
        confidenceCalibration,
      });
    }

    return analyses;
  }

  /**
   * Analyze bias patterns
   */
  analyzeBias(predictions: Prediction[], actuals: unknown[]): BiasAnalysis {
    const errors: number[] = [];
    const minLength = Math.min(predictions.length, actuals.length);

    for (let i = 0; i < minLength; i++) {
      const actual = typeof actuals[i] === 'number' ? actuals[i] as number : this.extractNumericValue(actuals[i]);
      const error = (actual as number) - predictions[i].predictedValue;
      errors.push(error);
    }

    if (errors.length === 0) {
      return {
        direction: 'NEUTRAL',
        magnitude: 0,
        consistency: 0,
        pattern: 'No data available',
        recommendations: [],
      };
    }

    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const variance = errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / errors.length;
    const stdDev = Math.sqrt(variance);

    let direction: BiasAnalysis['direction'] = 'NEUTRAL';
    if (meanError < -5) {
      direction = 'OPTIMISTIC';
    } else if (meanError > 5) {
      direction = 'PESSIMISTIC';
    }

    const magnitude = Math.abs(meanError);
    const consistency = stdDev > 0 ? Math.max(0, 100 - stdDev) : 100;

    let pattern = 'Random variation';
    if (consistency > 80) {
      pattern = magnitude > 10 ? 'Consistently biased' : 'Slightly biased but consistent';
    } else if (consistency > 50) {
      pattern = 'Moderately variable';
    } else {
      pattern = 'Highly variable predictions';
    }

    const recommendations: string[] = [];
    if (direction === 'OPTIMISTIC') {
      recommendations.push('Reduce predicted satisfaction scores by 10-15%');
      recommendations.push('Increase confidence intervals for positive outcomes');
    } else if (direction === 'PESSIMISTIC') {
      recommendations.push('Increase predicted satisfaction scores by 10-15%');
      recommendations.push('Narrow confidence intervals for positive outcomes');
    }

    if (consistency < 50) {
      recommendations.push('Improve model stability across similar inputs');
    }

    return {
      direction,
      magnitude,
      consistency,
      pattern,
      recommendations,
    };
  }

  /**
   * Analyze calibration
   */
  analyzeCalibration(predictions: Prediction[], actuals: unknown[]): CalibrationAnalysis {
    const confidenceLevels = [50, 60, 70, 80, 90, 95];
    const intervals: CalibrationAnalysis['confidenceIntervals'] = [];

    for (const confidence of confidenceLevels) {
      const alpha = 1 - confidence / 100;
      const zScore = this.getZScore(1 - alpha / 2);

      let withinInterval = 0;
      const minLength = Math.min(predictions.length, actuals.length);

      for (let i = 0; i < minLength; i++) {
        const prediction = predictions[i];
        const actual = typeof actuals[i] === 'number' ? actuals[i] as number : this.extractNumericValue(actuals[i]);

        const intervalWidth = (prediction.confidenceInterval.upper - prediction.confidenceInterval.lower) / 2;
        const margin = intervalWidth * (zScore / this.getZScore(0.975)); // Scale to requested confidence

        if (Math.abs((actual as number) - prediction.predictedValue) <= margin) {
          withinInterval++;
        }
      }

      const actualCoverage = minLength > 0 ? (withinInterval / minLength) * 100 : 0;
      intervals.push({ confidence, actualCoverage });
    }

    const expectedCalibration = 80; // Target calibration
    const actualCalibration = intervals.reduce((sum, i) => sum + i.actualCoverage, 0) / intervals.length;
    const calibrationError = Math.abs(expectedCalibration - actualCalibration);

    // Calculate reliability (how close actual coverage is to expected)
    const reliability = intervals.reduce((sum, i) => {
      return sum + (100 - Math.abs(i.confidence - i.actualCoverage));
    }, 0) / intervals.length;

    return {
      expectedCalibration,
      actualCalibration,
      calibrationError,
      reliability,
      confidenceIntervals: intervals,
    };
  }

  /**
   * Compare recommendation to outcomes for a student
   */
  compareRecommendationsToOutcomes(record: StudentOutcomeRecord): RecommendationOutcomeComparison[] {
    const comparisons: RecommendationOutcomeComparison[] = [];

    for (const accuracy of record.recommendationAccuracy) {
      const comparison: RecommendationOutcomeComparison = {
        recommendation: {
          id: accuracy.recommendationId,
          pathId: accuracy.pathId,
          predicted: accuracy.predictedOutcome,
        },
        status: accuracy.actualOutcome ? 'VALIDATED' : 'PENDING',
      };

      if (accuracy.actualOutcome) {
        comparison.actual = accuracy.actualOutcome;
        comparison.comparison = {
          satisfactionAccuracy: this.calculateDimensionAccuracy(
            accuracy.predictedOutcome.satisfaction,
            accuracy.actualOutcome.satisfaction
          ),
          successAccuracy: this.calculateDimensionAccuracy(
            accuracy.predictedOutcome.success,
            accuracy.actualOutcome.success
          ),
          growthAccuracy: this.calculateDimensionAccuracy(
            accuracy.predictedOutcome.growth,
            accuracy.actualOutcome.growth
          ),
          overallAccuracy: accuracy.accuracy || 0,
        };

        if (comparison.comparison.overallAccuracy < 60) {
          comparison.status = 'MISMATCHED';
        }
      }

      comparisons.push(comparison);
    }

    return comparisons;
  }

  /**
   * Compare across timepoints
   */
  compareAcrossTimepoints(
    record: StudentOutcomeRecord,
    timepoints: OutcomeTimepoint[]
  ): TimeSeriesComparison[] {
    const comparisons: TimeSeriesComparison[] = [];

    for (const timepoint of timepoints) {
      const predictions = record.predictions.filter(p => p.timeframe === timepoint);
      const comparisons_at_timepoint = record.comparisons.filter(c => c.prediction.timeframe === timepoint);

      if (predictions.length === 0) continue;

      const actuals = comparisons_at_timepoint.map(c => c.actualValue);

      comparisons.push({
        timepoint,
        predictions,
        actuals,
        accuracy: comparisons_at_timepoint.length > 0
          ? comparisons_at_timepoint.reduce((sum, c) => sum + c.accuracy, 0) / comparisons_at_timepoint.length
          : 0,
        error: comparisons_at_timepoint.length > 0
          ? comparisons_at_timepoint.reduce((sum, c) => sum + c.absoluteError, 0) / comparisons_at_timepoint.length
          : 0,
        bias: comparisons_at_timepoint.length > 0
          ? comparisons_at_timepoint.reduce((sum, c) => {
            const biasValue = c.bias === 'OPTIMISTIC' ? -1 : c.bias === 'PESSIMISTIC' ? 1 : 0;
            return sum + biasValue;
          }, 0) / comparisons_at_timepoint.length
          : 0,
      });
    }

    return comparisons;
  }

  /**
   * Generate accuracy report
   */
  generateAccuracyReport(studentId: StudentId, comparisons: PredictionComparison[]): {
    summary: string;
    details: string[];
    recommendations: string[];
  } {
    if (comparisons.length === 0) {
      return {
        summary: `No predictions available for student ${studentId}.`,
        details: [],
        recommendations: ['Collect more outcome data to assess accuracy.'],
      };
    }

    const avgAccuracy = comparisons.reduce((sum, c) => sum + c.accuracy, 0) / comparisons.length;
    const withinInterval = comparisons.filter(c => c.withinConfidenceInterval).length;
    const withinIntervalRate = (withinInterval / comparisons.length) * 100;

    const optimisticCount = comparisons.filter(c => c.bias === 'OPTIMISTIC').length;
    const pessimisticCount = comparisons.filter(c => c.bias === 'PESSIMISTIC').length;

    let summary = `For student ${studentId}, predictions achieved ${avgAccuracy.toFixed(1)}% accuracy `;
    summary += `with ${withinIntervalRate.toFixed(0)}% of outcomes within confidence intervals. `;

    if (optimisticCount > pessimisticCount) {
      summary += 'Predictions tended to be optimistic.';
    } else if (pessimisticCount > optimisticCount) {
      summary += 'Predictions tended to be pessimistic.';
    } else {
      summary += 'Predictions were well-calibrated.';
    }

    const details = comparisons.map((c, i) =>
      `Prediction ${i + 1}: Predicted ${c.prediction.predictedValue.toFixed(1)}, ` +
      `Actual ${c.actualValue.toFixed(1)}, ` +
      `Accuracy ${c.accuracy.toFixed(1)}% (${c.bias})`
    );

    const recommendations: string[] = [];
    if (avgAccuracy < 70) {
      recommendations.push('Review prediction models for this student profile.');
    }
    if (withinIntervalRate < 70) {
      recommendations.push('Widen confidence intervals to improve coverage.');
    }
    if (Math.abs(optimisticCount - pessimisticCount) > comparisons.length * 0.3) {
      recommendations.push('Adjust prediction bias in model training.');
    }

    return { summary, details, recommendations };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private extractNumericValue(actual: unknown): number {
    if (typeof actual === 'number') return actual;
    if (typeof actual === 'string') return parseFloat(actual) || 0;
    if (typeof actual === 'boolean') return actual ? 100 : 0;
    if (actual && typeof actual === 'object') {
      const obj = actual as Record<string, unknown>;
      if (typeof obj.value === 'number') return obj.value;
      if (typeof obj.score === 'number') return obj.score;
      if (typeof obj.rating === 'number') return obj.rating;
    }
    return 0;
  }

  private calculateDimensionAccuracy(predicted: number, actual: number): number {
    const error = Math.abs(predicted - actual);
    return Math.max(0, 100 - error);
  }

  private getZScore(confidence: number): number {
    // Approximate z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.5: 0,
      0.6: 0.25,
      0.7: 0.52,
      0.75: 0.67,
      0.8: 0.84,
      0.9: 1.28,
      0.95: 1.96,
      0.99: 2.58,
    };

    return zScores[confidence] || 1.96;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create comparison engine
 */
export function createComparisonEngine(): ComparisonEngine {
  return new ComparisonEngine();
}

/**
 * Compare prediction to reality (convenience function)
 */
export function comparePrediction(
  prediction: Prediction,
  actual: unknown
): PredictionComparison {
  const engine = createComparisonEngine();
  return engine.comparePredictionToReality(prediction, actual);
}

/**
 * Calculate accuracy metrics (convenience function)
 */
export function calculateAccuracy(
  predictions: Prediction[],
  actuals: unknown[]
): AccuracyMetrics {
  const engine = createComparisonEngine();
  return engine.calculateAccuracyMetrics(predictions, actuals);
}

/**
 * Assess recommendation accuracy (convenience function)
 */
export function assessRecommendation(
  recommendation: RecommendationAccuracy
): RecommendationAccuracy {
  const engine = createComparisonEngine();
  return engine.assessRecommendationAccuracy(recommendation);
}
