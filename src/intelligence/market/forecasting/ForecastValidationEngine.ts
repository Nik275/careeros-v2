/**
 * CareerOS Market Intelligence - Forecast Validation Engine
 *
 * Compares forecasts against future reality.
 *
 * Purpose:
 * - Track forecast accuracy
 * - Calibrate confidence estimates
 * - Identify forecast drift
 * - Improve forecasting over time
 */

import type { Forecast } from './models/Forecast';
import type { ForecastRange } from './models/ForecastRange';
import { isWithinRange, getRangeWidth } from './models/ForecastRange';

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Forecast ID */
  forecastId: string;

  /** Entity ID */
  entityId: string;

  /** Entity type */
  entityType: string;

  /** Forecast horizon */
  horizon: string;

  /** Whether forecast was accurate */
  accurate: boolean;

  /** Accuracy score (0-100) */
  accuracyScore: number;

  /** Which scenario was closest */
  closestScenario: 'optimistic' | 'baseline' | 'pessimistic';

  /** Distance from each scenario */
  scenarioDistances: {
    optimistic: number;
    baseline: number;
    pessimistic: number;
  };

  /** Whether actual value fell within forecast range */
  withinRange: boolean;

  /** Confidence calibration */
  confidenceCalibration: {
    predicted: number;
    actual: number;
    calibrationError: number;
  };

  /** Validation timestamp */
  validatedAt: Date;

  /** Actual values observed */
  actualValues: {
    demand?: number;
    salary?: number;
    growth?: number;
    opportunity?: number;
  };

  /** Forecast values */
  forecastValues: {
    demand: number | ForecastRange;
    salary: number | ForecastRange;
    growth: number | ForecastRange;
    opportunity: number | ForecastRange;
  };

  /** Analysis notes */
  notes: string[];
}

/**
 * Calibration metrics.
 */
export interface CalibrationMetrics {
  /** Overall calibration score (0-100) */
  overallCalibration: number;

  /** Bias (positive = overconfident, negative = underconfident) */
  bias: number;

  /** Calibration by confidence level */
  byConfidenceLevel: Record<
    'very_high' | 'high' | 'moderate' | 'low' | 'very_low',
    {
      count: number;
      expectedAccuracy: number;
      actualAccuracy: number;
      calibrationError: number;
    }
  >;

  /** Calibration by horizon */
  byHorizon: Record<
    '1_year' | '3_year' | '5_year' | '10_year',
    {
      count: number;
      averageAccuracy: number;
      averageCalibration: number;
    }
  >;

  /** Trend over time */
  trend: 'improving' | 'stable' | 'degrading';

  /** Recommendations */
  recommendations: string[];
}

/**
 * Forecast drift detection.
 */
export interface ForecastDrift {
  /** Entity ID */
  entityId: string;

  /** Type of drift detected */
  driftType: 'acceleration' | 'deceleration' | 'reversal' | 'volatility_shift';

  /** Drift severity (0-100) */
  severity: number;

  /** When drift was detected */
  detectedAt: Date;

  /** Description */
  description: string;

  /** Recommended action */
  recommendedAction: string;
}

/**
 * Validation engine configuration.
 */
export interface ValidationConfig {
  /** Accuracy threshold for "accurate" */
  accuracyThreshold: number;

  /** Range tolerance (percentage) */
  rangeTolerance: number;

  /** Minimum validations for calibration */
  minValidationsForCalibration: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  accuracyThreshold: 70,
  rangeTolerance: 0.15,
  minValidationsForCalibration: 10,
};

/**
 * Forecast Validation Engine.
 */
export class ForecastValidationEngine {
  private config: ValidationConfig;

  // Validation history
  private validations: Map<string, ValidationResult> = new Map();

  constructor(config?: Partial<ValidationConfig>) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  }

  /**
   * Validate a forecast against actual outcomes.
   */
  validateForecast(
    forecast: Forecast,
    actualValues: {
      demand?: number;
      salary?: number;
      growth?: number;
      opportunity?: number;
    }
  ): ValidationResult {
    const getValue = (v: number | ForecastRange) =>
      typeof v === 'number' ? v : v.expected;

    const forecastValues = {
      demand: getValue(forecast.baselineScenario.demandProjection),
      salary: getValue(forecast.baselineScenario.salaryProjection),
      growth: getValue(forecast.baselineScenario.growthProjection),
      opportunity: getValue(forecast.baselineScenario.opportunityProjection),
    };

    // Calculate distances from each scenario
    const distances = {
      optimistic: this.calculateDistance(
        actualValues,
        {
          demand: getValue(forecast.optimisticScenario.demandProjection),
          salary: getValue(forecast.optimisticScenario.salaryProjection),
          growth: getValue(forecast.optimisticScenario.growthProjection),
          opportunity: getValue(forecast.optimisticScenario.opportunityProjection),
        }
      ),
      baseline: this.calculateDistance(actualValues, forecastValues),
      pessimistic: this.calculateDistance(
        actualValues,
        {
          demand: getValue(forecast.pessimisticScenario.demandProjection),
          salary: getValue(forecast.pessimisticScenario.salaryProjection),
          growth: getValue(forecast.pessimisticScenario.growthProjection),
          opportunity: getValue(forecast.pessimisticScenario.opportunityProjection),
        }
      ),
    };

    // Find closest scenario
    const closestScenario = (Object.entries(distances).reduce((a, b) =>
      a[1] < b[1] ? a : b
    )[0] as 'optimistic' | 'baseline' | 'pessimistic');

    // Calculate accuracy score
    const accuracyScore = Math.max(0, 100 - distances.baseline);

    // Check if within range
    const withinRange = this.checkWithinRange(
      actualValues,
      forecast.baselineScenario
    );

    // Calculate confidence calibration
    const calibration = this.calculateCalibration(
      forecast.confidence.overall,
      accuracyScore
    );

    const result: ValidationResult = {
      forecastId: forecast.id,
      entityId: forecast.entityId,
      entityType: forecast.entityType,
      horizon: forecast.horizon,
      accurate: accuracyScore >= this.config.accuracyThreshold,
      accuracyScore: Math.round(accuracyScore),
      closestScenario,
      scenarioDistances: distances,
      withinRange,
      confidenceCalibration: calibration,
      validatedAt: new Date(),
      actualValues,
      forecastValues: {
        demand: forecast.baselineScenario.demandProjection,
        salary: forecast.baselineScenario.salaryProjection,
        growth: forecast.baselineScenario.growthProjection,
        opportunity: forecast.baselineScenario.opportunityProjection,
      },
      notes: this.generateValidationNotes(accuracyScore, withinRange, closestScenario),
    };

    // Store validation
    this.validations.set(forecast.id, result);

    return result;
  }

  /**
   * Calculate calibration metrics.
   */
  calculateCalibration(): CalibrationMetrics | null {
    const validations = Array.from(this.validations.values());

    if (validations.length < this.config.minValidationsForCalibration) {
      return null;
    }

    // Overall calibration
    const totalExpectedConfidence = validations.reduce(
      (sum, v) => sum + v.confidenceCalibration.predicted,
      0
    );
    const totalActualAccuracy = validations.reduce(
      (sum, v) => sum + v.confidenceCalibration.actual,
      0
    );

    const overallCalibration =
      100 - Math.abs(totalExpectedConfidence - totalActualAccuracy) / validations.length;

    const bias = (totalExpectedConfidence - totalActualAccuracy) / validations.length;

    // By confidence level
    const byConfidenceLevel: CalibrationMetrics['byConfidenceLevel'] = {
      very_high: { count: 0, expectedAccuracy: 90, actualAccuracy: 0, calibrationError: 0 },
      high: { count: 0, expectedAccuracy: 75, actualAccuracy: 0, calibrationError: 0 },
      moderate: { count: 0, expectedAccuracy: 50, actualAccuracy: 0, calibrationError: 0 },
      low: { count: 0, expectedAccuracy: 35, actualAccuracy: 0, calibrationError: 0 },
      very_low: { count: 0, expectedAccuracy: 20, actualAccuracy: 0, calibrationError: 0 },
    };

    // By horizon
    const byHorizon: CalibrationMetrics['byHorizon'] = {
      '1_year': { count: 0, averageAccuracy: 0, averageCalibration: 0 },
      '3_year': { count: 0, averageAccuracy: 0, averageCalibration: 0 },
      '5_year': { count: 0, averageAccuracy: 0, averageCalibration: 0 },
      '10_year': { count: 0, averageAccuracy: 0, averageCalibration: 0 },
    };

    // Populate metrics
    for (const v of validations) {
      // Find confidence level bucket
      const level = this.getConfidenceLevel(v.confidenceCalibration.predicted);
      byConfidenceLevel[level].count++;
      byConfidenceLevel[level].actualAccuracy += v.accuracyScore;

      // Horizon bucket
      const horizon = v.horizon as keyof CalibrationMetrics['byHorizon'];
      if (byHorizon[horizon]) {
        byHorizon[horizon].count++;
        byHorizon[horizon].averageAccuracy += v.accuracyScore;
        byHorizon[horizon].averageCalibration +=
          100 - Math.abs(v.confidenceCalibration.calibrationError);
      }
    }

    // Calculate averages
    for (const level of Object.keys(byConfidenceLevel) as Array<
      keyof CalibrationMetrics['byConfidenceLevel']
    >) {
      const data = byConfidenceLevel[level];
      if (data.count > 0) {
        data.actualAccuracy = Math.round(data.actualAccuracy / data.count);
        data.calibrationError = Math.abs(data.expectedAccuracy - data.actualAccuracy);
      }
    }

    for (const horizon of Object.keys(byHorizon) as Array<
      keyof CalibrationMetrics['byHorizon']
    >) {
      const data = byHorizon[horizon];
      if (data.count > 0) {
        data.averageAccuracy = Math.round(data.averageAccuracy / data.count);
        data.averageCalibration = Math.round(data.averageCalibration / data.count);
      }
    }

    // Determine trend
    const recent = validations.slice(-20);
    const older = validations.slice(0, Math.max(20, validations.length - 20));

    const recentAvg =
      recent.reduce((sum, v) => sum + v.accuracyScore, 0) / recent.length;
    const olderAvg =
      older.reduce((sum, v) => sum + v.accuracyScore, 0) / older.length;

    let trend: CalibrationMetrics['trend'];
    if (recentAvg > olderAvg + 5) trend = 'improving';
    else if (recentAvg < olderAvg - 5) trend = 'degrading';
    else trend = 'stable';

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      overallCalibration,
      bias,
      byConfidenceLevel
    );

    return {
      overallCalibration: Math.round(overallCalibration),
      bias: Math.round(bias * 10) / 10,
      byConfidenceLevel,
      byHorizon,
      trend,
      recommendations,
    };
  }

  /**
   * Detect forecast drift.
   */
  detectDrift(
    forecast: Forecast,
    recentValues: number[]
  ): ForecastDrift | null {
    if (recentValues.length < 3) return null;

    const baselineValue =
      typeof forecast.baselineScenario.growthProjection === 'number'
        ? forecast.baselineScenario.growthProjection
        : forecast.baselineScenario.growthProjection.expected;

    // Calculate recent trend
    const recentAvg =
      recentValues.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
    const olderAvg =
      recentValues.slice(0, Math.max(3, recentValues.length - 3)).reduce((sum, v) => sum + v, 0) /
      Math.max(1, recentValues.length - 3);

    const recentChange = recentAvg - olderAvg;
    const expectedChange = baselineValue - olderAvg;

    // Detect drift types
    let driftType: ForecastDrift['driftType'] | null = null;
    let severity = 0;

    // Acceleration
    if (recentChange > expectedChange * 1.5 && expectedChange > 0) {
      driftType = 'acceleration';
      severity = Math.min(100, (recentChange / expectedChange) * 50);
    }
    // Deceleration
    else if (recentChange < expectedChange * 0.5 && expectedChange > 0) {
      driftType = 'deceleration';
      severity = Math.min(100, (1 - recentChange / expectedChange) * 100);
    }
    // Reversal
    else if (recentChange * expectedChange < 0) {
      driftType = 'reversal';
      severity = Math.min(100, Math.abs(recentChange) * 2);
    }
    // Volatility shift
    else {
      const recentVol = this.calculateVolatility(recentValues.slice(-5));
      const olderVol = this.calculateVolatility(recentValues.slice(0, -5));

      if (Math.abs(recentVol - olderVol) > 20) {
        driftType = 'volatility_shift';
        severity = Math.min(100, Math.abs(recentVol - olderVol));
      }
    }

    if (!driftType || severity < 30) return null;

    return {
      entityId: forecast.entityId,
      driftType,
      severity: Math.round(severity),
      detectedAt: new Date(),
      description: this.describeDrift(driftType, severity, recentChange, expectedChange),
      recommendedAction: this.recommendAction(driftType),
    };
  }

  /**
   * Get validation history.
   */
  getValidationHistory(entityId?: string): ValidationResult[] {
    const validations = Array.from(this.validations.values());

    if (entityId) {
      return validations.filter((v) => v.entityId === entityId);
    }

    return validations.sort((a, b) => b.validatedAt.getTime() - a.validatedAt.getTime());
  }

  /**
   * Get accuracy statistics.
   */
  getAccuracyStats(): {
    totalValidations: number;
    accurateCount: number;
    withinRangeCount: number;
    averageAccuracy: number;
    byHorizon: Record<string, { count: number; averageAccuracy: number }>;
  } {
    const validations = Array.from(this.validations.values());

    const byHorizon: Record<string, { count: number; averageAccuracy: number }> = {};

    for (const v of validations) {
      if (!byHorizon[v.horizon]) {
        byHorizon[v.horizon] = { count: 0, averageAccuracy: 0 };
      }
      byHorizon[v.horizon]!.count++;
      byHorizon[v.horizon]!.averageAccuracy += v.accuracyScore;
    }

    for (const horizon of Object.keys(byHorizon)) {
      const data = byHorizon[horizon]!;
      data.averageAccuracy = Math.round(data.averageAccuracy / data.count);
    }

    return {
      totalValidations: validations.length,
      accurateCount: validations.filter((v) => v.accurate).length,
      withinRangeCount: validations.filter((v) => v.withinRange).length,
      averageAccuracy: Math.round(
        validations.reduce((sum, v) => sum + v.accuracyScore, 0) /
          Math.max(1, validations.length)
      ),
      byHorizon,
    };
  }

  // Private methods

  private calculateDistance(
    actual: Record<string, number | undefined>,
    forecast: Record<string, number>
  ): number {
    let totalDiff = 0;
    let count = 0;

    for (const key of Object.keys(forecast)) {
      const actualVal = actual[key];
      const forecastVal = forecast[key];

      if (actualVal !== undefined && forecastVal !== undefined) {
        totalDiff += Math.abs(actualVal - forecastVal);
        count++;
      }
    }

    return count > 0 ? totalDiff / count : 100;
  }

  private checkWithinRange(
    actual: Record<string, number | undefined>,
    scenario: { demandProjection: number | ForecastRange }
  ): boolean {
    const demand = actual.demand;
    if (demand === undefined) return false;

    const projection = scenario.demandProjection;
    if (typeof projection === 'number') {
      return Math.abs(demand - projection) <= projection * this.config.rangeTolerance;
    }

    return isWithinRange(projection, demand);
  }

  private calculateCalibration(
    predictedConfidence: number,
    actualAccuracy: number
  ): ValidationResult['confidenceCalibration'] {
    return {
      predicted: predictedConfidence,
      actual: actualAccuracy,
      calibrationError: Math.abs(predictedConfidence - actualAccuracy),
    };
  }

  private getConfidenceLevel(score: number): keyof CalibrationMetrics['byConfidenceLevel'] {
    if (score >= 90) return 'very_high';
    if (score >= 75) return 'high';
    if (score >= 50) return 'moderate';
    if (score >= 30) return 'low';
    return 'very_low';
  }

  private generateValidationNotes(
    accuracy: number,
    withinRange: boolean,
    closestScenario: string
  ): string[] {
    const notes: string[] = [];

    if (accuracy >= 90) {
      notes.push('Excellent forecast accuracy');
    } else if (accuracy >= 70) {
      notes.push('Good forecast accuracy');
    } else if (accuracy >= 50) {
      notes.push('Moderate forecast accuracy');
    } else {
      notes.push('Poor forecast accuracy');
    }

    if (withinRange) {
      notes.push('Actual value within forecast range');
    } else {
      notes.push('Actual value outside forecast range');
    }

    notes.push(`Closest scenario: ${closestScenario}`);

    return notes;
  }

  private generateRecommendations(
    calibration: number,
    bias: number,
    byLevel: CalibrationMetrics['byConfidenceLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (calibration < 70) {
      recommendations.push('Review and adjust confidence calculation methodology');
    }

    if (bias > 10) {
      recommendations.push('Forecasts are overconfident - reduce confidence scores');
    } else if (bias < -10) {
      recommendations.push('Forecasts are underconfident - increase confidence scores');
    }

    // Check for poorly calibrated levels
    for (const [level, data] of Object.entries(byLevel)) {
      if (data.count > 5 && data.calibrationError > 20) {
        recommendations.push(
          `${level} confidence level needs recalibration (${data.calibrationError}% error)`
        );
      }
    }

    return recommendations;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return Math.sqrt(variance);
  }

  private describeDrift(
    type: ForecastDrift['driftType'],
    severity: number,
    recentChange: number,
    expectedChange: number
  ): string {
    const severityDesc = severity > 70 ? 'severe' : severity > 50 ? 'significant' : 'moderate';

    switch (type) {
      case 'acceleration':
        return `${severityDesc} acceleration detected: growth ${recentChange > 0 ? 'increasing' : 'decreasing'} faster than forecast`;
      case 'deceleration':
        return `${severityDesc} deceleration detected: growth slowing relative to forecast`;
      case 'reversal':
        return `${severityDesc} trend reversal detected: direction changed from forecast`;
      case 'volatility_shift':
        return `${severityDesc} volatility shift detected: market instability ${recentChange > expectedChange ? 'increasing' : 'decreasing'}`;
    }
  }

  private recommendAction(type: ForecastDrift['driftType']): string {
    switch (type) {
      case 'acceleration':
        return 'Update forecast with higher growth projections';
      case 'deceleration':
        return 'Update forecast with conservative projections';
      case 'reversal':
        return 'Regenerate forecast with new trend direction';
      case 'volatility_shift':
        return 'Widen forecast ranges to account for uncertainty';
    }
  }
}

/**
 * Factory function for ForecastValidationEngine.
 */
export function createForecastValidationEngine(
  config?: Partial<ValidationConfig>
): ForecastValidationEngine {
  return new ForecastValidationEngine(config);
}
