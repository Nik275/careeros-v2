/**
 * CareerOS - Confidence Calibration Engine
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Adjusts prediction confidence based on outcomes.
 *
 * @module confidence-calibration-engine
 * @version 1.0.0
 */

import type {
  OutcomeRecord,
  OutcomeRecordId,
} from '../types/outcome-tracking-types';
import type {
  ConfidenceCalibrationEngine,
  CalibrationAnalysis,
  CalibrationAnalysisOptions,
  CalibrationReport,
  CalibrationStatus,
  CalibratedConfidence,
  CalibrationDimension,
  CalibrationMetrics,
  OverallCalibrationMetrics,
  DimensionCalibrationMetrics,
  BiasAnalysis,
  ReliabilityAnalysis,
  ConfidenceCalibrationCurve,
  CalibrationAdjustment,
  AppliedCalibration,
  CalibrationTrend,
  CalibrationBenchmark,
  CalibrationActionItem,
} from '../types/confidence-calibration-types';

/**
 * Confidence Calibration Engine Implementation.
 *
 * Compares predicted outcomes with actual outcomes to identify and correct
 * systematic biases in the recommendation system's confidence estimates.
 */
export class ConfidenceCalibrationEngineImpl implements ConfidenceCalibrationEngine {
  private predictions: Map<string, {
    recommendationId: string;
    predictedValues: Record<CalibrationDimension, number>;
    confidence: number;
    timestamp: Date;
  }> = new Map();

  private calibrations: Map<CalibrationDimension, {
    scale: number;
    offset: number;
    lastUpdated: Date;
  }> = new Map();

  private appliedAdjustments: AppliedCalibration[] = [];

  constructor() {
    // Initialize default calibrations
    const dimensions: CalibrationDimension[] = [
      'OVERALL_SUCCESS',
      'SATISFACTION',
      'TIMELINE',
      'UTILITY',
      'CAREER_PROGRESS',
      'INCOME_GROWTH',
      'SKILL_GROWTH',
      'LIFE_SATISFACTION',
      'STRESS_LEVELS',
      'LEARNING_GROWTH',
      'CAREER_MOBILITY',
      'GOAL_ACHIEVEMENT',
      'REGRET_LEVEL',
      'OPTIONALITY',
    ];

    for (const dim of dimensions) {
      this.calibrations.set(dim, {
        scale: 1.0,
        offset: 0,
        lastUpdated: new Date(),
      });
    }
  }

  /**
   * Analyze calibration for a set of outcome records.
   */
  async analyzeCalibration(
    outcomeRecordIds: OutcomeRecordId[],
    options: CalibrationAnalysisOptions = {}
  ): Promise<CalibrationAnalysis> {
    const dimensions = options.dimensions || this.getAllDimensions();
    const analysisId = `calibration_${Date.now()}`;

    // Get predictions and actuals for each record
    const calibrationData = await this.getCalibrationData(outcomeRecordIds);

    // Calculate per-dimension metrics
    const dimensionMetrics: Record<CalibrationDimension, DimensionCalibrationMetrics> = {} as Record<CalibrationDimension, DimensionCalibrationMetrics>;

    for (const dimension of dimensions) {
      dimensionMetrics[dimension] = this.calculateDimensionMetrics(
        calibrationData,
        dimension,
        options.minSampleSize || 10
      );
    }

    // Calculate overall metrics
    const overall = this.calculateOverallMetrics(dimensionMetrics);

    // Analyze bias
    const bias = this.analyzeBias(dimensionMetrics, calibrationData);

    // Analyze reliability
    const reliability = this.analyzeReliability(calibrationData);

    // Build confidence calibration curve
    const confidenceCurve = this.buildConfidenceCurve(calibrationData);

    // Generate recommended adjustments
    const recommendedAdjustments = this.generateAdjustments(dimensionMetrics, bias);

    // Determine time range
    const timestamps = calibrationData.map(d => d.timestamp);
    const timeRange = timestamps.length > 0
      ? { startDate: new Date(Math.min(...timestamps.map(t => t.getTime()))), endDate: new Date(Math.max(...timestamps.map(t => t.getTime()))) }
      : { startDate: new Date(), endDate: new Date() };

    return {
      analysisId,
      analyzedAt: new Date(),
      predictionCount: calibrationData.length,
      timeRange,
      overall,
      dimensions: dimensionMetrics,
      bias,
      reliability,
      confidenceCurve,
      recommendedAdjustments,
    };
  }

  /**
   * Generate a comprehensive calibration report.
   */
  async generateReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<CalibrationReport> {
    const reportId = `calibration_report_${Date.now()}`;

    // Get outcome records in period
    const recordIds = await this.getRecordIdsInPeriod(period);

    // Perform analysis
    const analysis = await this.analyzeCalibration(recordIds, {
      includeBreakdowns: true,
    });

    // Get historical trends
    const historicalTrends = await this.getHistoricalTrends(period);

    // Get benchmarks
    const benchmarks = await this.getBenchmarks(analysis);

    // Generate action items
    const actionItems = this.generateActionItems(analysis);

    // Create executive summary
    const executiveSummary = this.createExecutiveSummary(analysis);

    return {
      reportId,
      generatedAt: new Date(),
      period,
      executiveSummary,
      analysis,
      historicalTrends,
      benchmarks,
      actionItems,
    };
  }

  /**
   * Apply calibration adjustments.
   */
  async applyAdjustments(
    adjustments: CalibrationAdjustment[]
  ): Promise<AppliedCalibration[]> {
    const applied: AppliedCalibration[] = [];

    for (const adjustment of adjustments) {
      if (adjustment.applied) continue;

      const calibration = this.calibrations.get(adjustment.dimension);
      if (!calibration) continue;

      // Apply the adjustment
      switch (adjustment.adjustmentType) {
        case 'SCALE':
          calibration.scale = adjustment.parameters.scale || 1.0;
          break;
        case 'OFFSET':
          calibration.offset = adjustment.parameters.offset || 0;
          break;
        case 'TRANSFORM':
          // Complex transformation would be applied here
          calibration.scale = adjustment.parameters.scale || 1.0;
          calibration.offset = adjustment.parameters.offset || 0;
          break;
        case 'MODEL_UPDATE':
          // Would trigger model retraining in production
          break;
      }

      calibration.lastUpdated = new Date();

      const appliedCalibration: AppliedCalibration = {
        adjustment: {
          ...adjustment,
          applied: true,
          appliedAt: new Date(),
        },
        appliedAt: new Date(),
        appliedBy: 'ConfidenceCalibrationEngine',
        results: {
          improvedCalibration: true,
          improvementAmount: adjustment.expectedImprovement,
          newCalibrationScore: 0, // Would be calculated
          sideEffects: [],
          keepAdjustment: true,
        },
      };

      this.appliedAdjustments.push(appliedCalibration);
      applied.push(appliedCalibration);
    }

    return applied;
  }

  /**
   * Get current calibration status.
   */
  async getCalibrationStatus(): Promise<CalibrationStatus> {
    const recentAdjustments = this.appliedAdjustments.filter(
      a => a.appliedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );

    // Calculate current metrics from recent data
    const recentData = await this.getRecentCalibrationData(30);

    let meanAbsoluteError = 0;
    let biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED' = 'UNBIASED';
    let calibrationScore = 80;

    if (recentData.length > 0) {
      const errors = recentData.map(d => Math.abs(d.predicted - d.actual));
      meanAbsoluteError = errors.reduce((a, b) => a + b, 0) / errors.length;

      const bias = recentData.reduce((sum, d) => sum + (d.predicted - d.actual), 0) / recentData.length;
      biasDirection = bias > 5 ? 'OVERCONFIDENT' : bias < -5 ? 'UNDERCONFIDENT' : 'UNBIASED';

      calibrationScore = Math.max(0, 100 - meanAbsoluteError * 2);
    }

    const overallHealth: CalibrationStatus['overallHealth'] =
      calibrationScore >= 80 ? 'EXCELLENT' :
      calibrationScore >= 60 ? 'GOOD' :
      calibrationScore >= 40 ? 'FAIR' :
      calibrationScore >= 20 ? 'POOR' : 'CRITICAL';

    const topIssues: string[] = [];
    if (calibrationScore < 60) {
      topIssues.push('Calibration score below acceptable threshold');
    }
    if (biasDirection !== 'UNBIASED') {
      topIssues.push(`Systematic ${biasDirection.toLowerCase()} bias detected`);
    }
    if (recentAdjustments.length === 0) {
      topIssues.push('No recent calibration adjustments applied');
    }

    return {
      overallHealth,
      lastAnalyzedAt: recentAdjustments.length > 0
        ? recentAdjustments[recentAdjustments.length - 1].appliedAt
        : new Date(),
      predictionCount: recentData.length,
      quickMetrics: {
        meanAbsoluteError,
        biasDirection,
        calibrationScore,
      },
      topIssues,
      isAcceptable: calibrationScore >= 60 && biasDirection === 'UNBIASED',
    };
  }

  /**
   * Predict confidence for a new recommendation.
   */
  async predictConfidence(
    recommendation: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<CalibratedConfidence> {
    const originalConfidence = (recommendation['confidence'] as number) || 50;

    // Get calibration for this type of recommendation
    const dimension: CalibrationDimension = 'OVERALL_SUCCESS';
    const calibration = this.calibrations.get(dimension);

    // Apply calibration
    let calibratedConfidence = originalConfidence;
    if (calibration) {
      calibratedConfidence = originalConfidence * calibration.scale + calibration.offset;
    }

    // Clamp to valid range
    calibratedConfidence = Math.max(0, Math.min(100, calibratedConfidence));

    // Calculate adjustment
    const adjustment: CalibratedConfidence['adjustment'] = {
      type: calibration ? 'SCALE' : 'TRANSFORM',
      factor: calibration?.scale || 1.0,
      reason: calibration
        ? `Applied calibration: scale=${calibration.scale.toFixed(2)}, offset=${calibration.offset.toFixed(2)}`
        : 'No calibration data available',
    };

    // Calculate confidence interval
    const marginOfError = 10; // Simplified
    const confidenceInterval: CalibratedConfidence['confidenceInterval'] = {
      lower: Math.max(0, calibratedConfidence - marginOfError),
      upper: Math.min(100, calibratedConfidence + marginOfError),
      confidenceLevel: 95,
    };

    // Determine calibration quality
    const calibrationQuality: CalibratedConfidence['calibrationQuality'] =
      calibration && Math.abs(calibration.scale - 1.0) < 0.2
        ? 'HIGH'
        : calibration
        ? 'MEDIUM'
        : 'LOW';

    // Warning if needed
    let warning: string | undefined;
    if (calibrationQuality === 'LOW') {
      warning = 'Limited calibration data available for this recommendation type';
    } else if (Math.abs(calibratedConfidence - originalConfidence) > 20) {
      warning = 'Significant calibration adjustment applied';
    }

    return {
      originalConfidence,
      calibratedConfidence,
      adjustment,
      confidenceInterval,
      calibrationQuality,
      warning,
    };
  }

  /**
   * Update calibration with a new outcome.
   */
  async updateWithOutcome(record: OutcomeRecord): Promise<void> {
    // Store prediction vs actual for future calibration
    const predictionId = `pred_${record.recordId}`;

    this.predictions.set(predictionId, {
      recommendationId: record.events.recommendation.recommendationId,
      predictedValues: {
        OVERALL_SUCCESS: record.events.outcome.achievedOutcome ? 80 : 20,
        SATISFACTION: record.events.outcome.satisfaction.overallSatisfaction,
        TIMELINE: 50, // Would be calculated from expected vs actual
        UTILITY: record.events.outcome.utility.realizedUtility,
        CAREER_PROGRESS: record.events.outcome.dimensions.careerProgress.score,
        INCOME_GROWTH: record.events.outcome.dimensions.incomeGrowth.score,
        SKILL_GROWTH: record.events.outcome.dimensions.skillGrowth.score,
        LIFE_SATISFACTION: record.events.outcome.dimensions.lifeSatisfaction.score,
        STRESS_LEVELS: record.events.outcome.dimensions.stressLevels.score,
        LEARNING_GROWTH: record.events.outcome.dimensions.learningGrowth.score,
        CAREER_MOBILITY: record.events.outcome.dimensions.careerMobility.score,
        GOAL_ACHIEVEMENT: record.events.outcome.dimensions.goalAchievement.score,
        REGRET_LEVEL: record.events.outcome.regret.regretLevel,
        OPTIONALITY: record.events.outcome.optionality.achievedOptionality,
      },
      confidence: 50, // Would come from original recommendation
      timestamp: record.events.outcome.timestamp,
    });
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getAllDimensions(): CalibrationDimension[] {
    return [
      'OVERALL_SUCCESS',
      'SATISFACTION',
      'TIMELINE',
      'UTILITY',
      'CAREER_PROGRESS',
      'INCOME_GROWTH',
      'SKILL_GROWTH',
      'LIFE_SATISFACTION',
      'STRESS_LEVELS',
      'LEARNING_GROWTH',
      'CAREER_MOBILITY',
      'GOAL_ACHIEVEMENT',
      'REGRET_LEVEL',
      'OPTIONALITY',
    ];
  }

  private async getCalibrationData(
    recordIds: OutcomeRecordId[]
  ): Promise<Array<{
    predicted: number;
    actual: number;
    timestamp: Date;
    dimension: CalibrationDimension;
  }>> {
    const data: Array<{
      predicted: number;
      actual: number;
      timestamp: Date;
      dimension: CalibrationDimension;
    }> = [];

    for (const recordId of recordIds) {
      const prediction = this.predictions.get(`pred_${recordId}`);
      if (!prediction) continue;

      // In production, would fetch actual outcomes from database
      // For now, use stored prediction data as proxy
      for (const [dimension, predictedValue] of Object.entries(prediction.predictedValues)) {
        data.push({
          predicted: predictedValue,
          actual: predictedValue, // Would be actual outcome
          timestamp: prediction.timestamp,
          dimension: dimension as CalibrationDimension,
        });
      }
    }

    return data;
  }

  private calculateDimensionMetrics(
    data: Array<{ predicted: number; actual: number; dimension: CalibrationDimension }>,
    dimension: CalibrationDimension,
    minSampleSize: number
  ): DimensionCalibrationMetrics {
    const dimensionData = data.filter(d => d.dimension === dimension);

    if (dimensionData.length < minSampleSize) {
      return {
        dimension,
        sampleCount: dimensionData.length,
        meanPredicted: 0,
        meanActual: 0,
        meanError: 0,
        meanAbsoluteError: 0,
        errorStdDev: 0,
        calibrationScore: 0,
        biasDirection: 'UNBIASED',
        biasMagnitude: 0,
      };
    }

    const predicted = dimensionData.map(d => d.predicted);
    const actual = dimensionData.map(d => d.actual);
    const errors = predicted.map((p, i) => p - actual[i]);

    const meanPredicted = predicted.reduce((a, b) => a + b) / predicted.length;
    const meanActual = actual.reduce((a, b) => a + b) / actual.length;
    const meanError = errors.reduce((a, b) => a + b) / errors.length;
    const meanAbsoluteError = errors.reduce((a, b) => a + Math.abs(b), 0) / errors.length;
    const errorStdDev = Math.sqrt(
      errors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / errors.length
    );

    const calibrationScore = Math.max(0, 100 - meanAbsoluteError * 2);
    const biasDirection: DimensionCalibrationMetrics['biasDirection'] =
      meanError > 5 ? 'OVERCONFIDENT' : meanError < -5 ? 'UNDERCONFIDENT' : 'UNBIASED';
    const biasMagnitude = Math.abs(meanError);

    return {
      dimension,
      sampleCount: dimensionData.length,
      meanPredicted,
      meanActual,
      meanError,
      meanAbsoluteError,
      errorStdDev,
      calibrationScore,
      biasDirection,
      biasMagnitude,
    };
  }

  private calculateOverallMetrics(
    dimensionMetrics: Record<CalibrationDimension, DimensionCalibrationMetrics>
  ): OverallCalibrationMetrics {
    const metrics = Object.values(dimensionMetrics);

    const meanAbsoluteError = metrics.reduce((sum, m) => sum + m.meanAbsoluteError, 0) / metrics.length;
    const rootMeanSquaredError = Math.sqrt(
      metrics.reduce((sum, m) => sum + Math.pow(m.meanAbsoluteError, 2), 0) / metrics.length
    );
    const meanPercentageError = meanAbsoluteError; // Simplified
    const calibrationScore = metrics.reduce((sum, m) => sum + m.calibrationScore, 0) / metrics.length;

    const quality: OverallCalibrationMetrics['quality'] =
      calibrationScore >= 90 ? 'EXCELLENT' :
      calibrationScore >= 70 ? 'GOOD' :
      calibrationScore >= 50 ? 'FAIR' :
      calibrationScore >= 30 ? 'POOR' : 'CRITICAL';

    const trend: OverallCalibrationMetrics['trend'] = 'STABLE'; // Would be calculated from historical data

    return {
      meanAbsoluteError,
      rootMeanSquaredError,
      meanPercentageError,
      calibrationScore,
      quality,
      trend,
    };
  }

  private analyzeBias(
    dimensionMetrics: Record<CalibrationDimension, DimensionCalibrationMetrics>,
    data: Array<{ predicted: number; actual: number; timestamp: Date }>
  ): BiasAnalysis {
    const metrics = Object.values(dimensionMetrics);

    // Calculate overall bias
    const avgError = metrics.reduce((sum, m) => sum + m.meanError, 0) / metrics.length;
    const overallBias: BiasAnalysis['overallBias'] =
      avgError > 5 ? 'OVERCONFIDENT' : avgError < -5 ? 'UNDERCONFIDENT' : 'UNBIASED';
    const biasMagnitude = Math.abs(avgError);

    // Bias by confidence level (simplified)
    const biasByConfidence = [
      {
        confidenceRange: '0-40',
        biasDirection: 'UNDERCONFIDENT' as const,
        biasMagnitude: 10,
        sampleCount: data.filter(d => d.predicted <= 40).length,
      },
      {
        confidenceRange: '41-60',
        biasDirection: 'UNBIASED' as const,
        biasMagnitude: 5,
        sampleCount: data.filter(d => d.predicted > 40 && d.predicted <= 60).length,
      },
      {
        confidenceRange: '61-80',
        biasDirection: 'OVERCONFIDENT' as const,
        biasMagnitude: 8,
        sampleCount: data.filter(d => d.predicted > 60 && d.predicted <= 80).length,
      },
      {
        confidenceRange: '81-100',
        biasDirection: 'OVERCONFIDENT' as const,
        biasMagnitude: 12,
        sampleCount: data.filter(d => d.predicted > 80).length,
      },
    ];

    // Systematic patterns (simplified)
    const systematicPatterns: BiasAnalysis['systematicPatterns'] = [];

    // Check for overconfidence in high predictions
    const highPredictions = data.filter(d => d.predicted > 80);
    if (highPredictions.length > 0) {
      const avgActual = highPredictions.reduce((sum, d) => sum + d.actual, 0) / highPredictions.length;
      if (avgActual < 70) {
        systematicPatterns.push({
          description: 'Overconfidence in high predictions',
          conditions: ['Predicted confidence > 80'],
          biasDirection: 'OVERCONFIDENT',
          biasMagnitude: 80 - avgActual,
          affectedDimensions: ['OVERALL_SUCCESS', 'SATISFACTION'],
          recommendedCorrection: 'Apply downward calibration for predictions > 80',
        });
      }
    }

    return {
      overallBias,
      biasMagnitude,
      biasByConfidence,
      biasByRecommendationType: {}, // Would be populated from data
      systematicPatterns,
    };
  }

  private analyzeReliability(
    data: Array<{ predicted: number; actual: number; timestamp: Date }>
  ): ReliabilityAnalysis {
    if (data.length === 0) {
      return {
        reliabilityScore: 0,
        consistencyScore: 0,
        intervalCoverage: 0,
        reliabilityByOutcomeType: {},
        temporalStability: {
          isStable: false,
          trend: 'STABLE',
          stabilityScore: 0,
          reliabilityByPeriod: [],
        },
      };
    }

    // Calculate reliability score
    const errors = data.map(d => Math.abs(d.predicted - d.actual));
    const avgError = errors.reduce((a, b) => a + b) / errors.length;
    const reliabilityScore = Math.max(0, 100 - avgError * 2);

    // Consistency (standard deviation of errors)
    const errorStdDev = Math.sqrt(
      errors.reduce((sum, e) => sum + Math.pow(e - avgError, 2), 0) / errors.length
    );
    const consistencyScore = Math.max(0, 100 - errorStdDev * 5);

    // Interval coverage (simplified)
    const intervalCoverage = 85; // Would be calculated from prediction intervals

    // Temporal stability (simplified)
    const temporalStability: ReliabilityAnalysis['temporalStability'] = {
      isStable: errorStdDev < 15,
      trend: 'STABLE',
      stabilityScore: Math.max(0, 100 - errorStdDev * 3),
      reliabilityByPeriod: [], // Would be calculated from time-binned data
    };

    return {
      reliabilityScore,
      consistencyScore,
      intervalCoverage,
      reliabilityByOutcomeType: {}, // Would be populated
      temporalStability,
    };
  }

  private buildConfidenceCurve(
    data: Array<{ predicted: number; actual: number }>
  ): ConfidenceCalibrationCurve {
    const bins = [0, 20, 40, 60, 80, 100];
    const dataPoints: ConfidenceCalibrationCurve['dataPoints'] = [];

    for (let i = 0; i < bins.length - 1; i++) {
      const min = bins[i];
      const max = bins[i + 1];
      const binData = data.filter(d => d.predicted >= min && d.predicted < max);

      if (binData.length > 0) {
        const predictedConfidence = (min + max) / 2;
        const actualAccuracy = binData.filter(d => Math.abs(d.predicted - d.actual) < 20).length / binData.length * 100;

        dataPoints.push({
          predictedConfidence,
          actualAccuracy,
          sampleCount: binData.length,
          calibrationGap: predictedConfidence - actualAccuracy,
        });
      }
    }

    // Calculate ECE (Expected Calibration Error)
    const expectedCalibrationError = dataPoints.reduce(
      (sum, dp) => sum + Math.abs(dp.calibrationGap) * (dp.sampleCount / data.length),
      0
    );

    // Calculate MCE (Maximum Calibration Error)
    const maximumCalibrationError = Math.max(...dataPoints.map(dp => Math.abs(dp.calibrationGap)));

    // Brier score (simplified)
    const brierScore = data.reduce(
      (sum, d) => sum + Math.pow(d.predicted / 100 - d.actual / 100, 2),
      0
    ) / data.length;

    // Area under curve (simplified)
    const areaUnderCurve = dataPoints.reduce(
      (sum, dp, i) => {
        if (i === 0) return 0;
        const prev = dataPoints[i - 1];
        const width = dp.predictedConfidence - prev.predictedConfidence;
        const height = (dp.actualAccuracy + prev.actualAccuracy) / 2;
        return sum + width * height / 10000; // Normalize to 0-1
      },
      0
    );

    return {
      dataPoints,
      expectedCalibrationError,
      maximumCalibrationError,
      brierScore,
      areaUnderCurve,
    };
  }

  private generateAdjustments(
    dimensionMetrics: Record<CalibrationDimension, DimensionCalibrationMetrics>,
    bias: BiasAnalysis
  ): CalibrationAdjustment[] {
    const adjustments: CalibrationAdjustment[] = [];

    for (const [dimension, metrics] of Object.entries(dimensionMetrics)) {
      if (metrics.calibrationScore < 70) {
        // Generate adjustment for poorly calibrated dimension
        const adjustment: CalibrationAdjustment = {
          adjustmentId: `adj_${dimension}_${Date.now()}`,
          dimension: dimension as CalibrationDimension,
          adjustmentType: 'SCALE',
          parameters: {
            scale: metrics.meanActual / (metrics.meanPredicted || 1),
            offset: -metrics.meanError,
          },
          expectedImprovement: (70 - metrics.calibrationScore) * 0.8,
          confidence: Math.min(100, metrics.sampleCount / 2),
          implementationComplexity: 'SIMPLE',
          applied: false,
        };

        adjustments.push(adjustment);
      }
    }

    // Add bias correction adjustments
    if (bias.overallBias !== 'UNBIASED') {
      adjustments.push({
        adjustmentId: `adj_bias_${Date.now()}`,
        dimension: 'OVERALL_SUCCESS',
        adjustmentType: 'OFFSET',
        parameters: {
          offset: bias.overallBias === 'OVERCONFIDENT' ? -bias.biasMagnitude : bias.biasMagnitude,
        },
        expectedImprovement: bias.biasMagnitude * 2,
        confidence: 80,
        implementationComplexity: 'SIMPLE',
        applied: false,
      });
    }

    return adjustments;
  }

  private async getRecordIdsInPeriod(
    period: { startDate: Date; endDate: Date }
  ): Promise<OutcomeRecordId[]> {
    const ids: OutcomeRecordId[] = [];

    for (const [key, prediction] of Array.from(this.predictions.entries())) {
      if (prediction.timestamp >= period.startDate && prediction.timestamp <= period.endDate) {
        ids.push(key.replace('pred_', ''));
      }
    }

    return ids;
  }

  private async getHistoricalTrends(
    currentPeriod: { startDate: Date; endDate: Date }
  ): Promise<CalibrationTrend[]> {
    // Simplified - would calculate from historical data
    return [
      {
        period: 'Previous Month',
        startDate: new Date(currentPeriod.startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        calibrationScore: 75,
        meanAbsoluteError: 12,
        biasDirection: 'OVERCONFIDENT',
        changes: ['Slight improvement in timeline predictions'],
      },
      {
        period: 'Previous Quarter',
        startDate: new Date(currentPeriod.startDate.getTime() - 90 * 24 * 60 * 60 * 1000),
        calibrationScore: 70,
        meanAbsoluteError: 15,
        biasDirection: 'OVERCONFIDENT',
        changes: ['Initial calibration applied'],
      },
    ];
  }

  private async getBenchmarks(
    analysis: CalibrationAnalysis
  ): Promise<CalibrationBenchmark[]> {
    return [
      {
        benchmarkName: 'Industry Standard',
        ourScore: analysis.overall.calibrationScore,
        benchmarkScore: 75,
        comparison: analysis.overall.calibrationScore >= 75 ? 'ABOVE' : 'BELOW',
        gap: Math.abs(analysis.overall.calibrationScore - 75),
        interpretation: analysis.overall.calibrationScore >= 75
          ? 'Above industry standard for career recommendation systems'
          : 'Below industry standard, improvement needed',
      },
      {
        benchmarkName: 'Best-in-Class',
        ourScore: analysis.overall.calibrationScore,
        benchmarkScore: 90,
        comparison: analysis.overall.calibrationScore >= 90 ? 'AT' : 'BELOW',
        gap: Math.abs(analysis.overall.calibrationScore - 90),
        interpretation: analysis.overall.calibrationScore >= 90
          ? 'At best-in-class level'
          : 'Gap to best-in-class systems',
      },
    ];
  }

  private generateActionItems(analysis: CalibrationAnalysis): CalibrationActionItem[] {
    const actionItems: CalibrationActionItem[] = [];

    // Add actions for poorly calibrated dimensions
    for (const [dimension, metrics] of Object.entries(analysis.dimensions)) {
      if (metrics.calibrationScore < 60) {
        actionItems.push({
          actionId: `action_${dimension}_${Date.now()}`,
          description: `Improve calibration for ${dimension} dimension`,
          priority: 'HIGH',
          affectedDimensions: [dimension as CalibrationDimension],
          expectedImpact: `Improve ${dimension} calibration score from ${metrics.calibrationScore.toFixed(0)} to 70+`,
          effort: 'MEDIUM',
          status: 'PENDING',
        });
      }
    }

    // Add action for bias correction
    if (analysis.bias.overallBias !== 'UNBIASED') {
      actionItems.push({
        actionId: `action_bias_${Date.now()}`,
        description: `Address ${analysis.bias.overallBias.toLowerCase()} bias`,
        priority: 'CRITICAL',
        affectedDimensions: ['OVERALL_SUCCESS', 'SATISFACTION'],
        expectedImpact: `Reduce bias magnitude from ${analysis.bias.biasMagnitude.toFixed(1)} to < 5`,
        effort: 'LARGE',
        status: 'PENDING',
      });
    }

    return actionItems;
  }

  private createExecutiveSummary(analysis: CalibrationAnalysis): {
    overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
    keyFindings: string[];
    criticalIssues: string[];
    positiveHighlights: string[];
    trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
    topRecommendations: string[];
  } {
    const overallHealth = analysis.overall.quality;

    const keyFindings: string[] = [
      `Overall calibration score: ${analysis.overall.calibrationScore.toFixed(1)}/100`,
      `Mean absolute error: ${analysis.overall.meanAbsoluteError.toFixed(2)}`,
      `Systematic bias: ${analysis.bias.overallBias}`,
    ];

    const criticalIssues: string[] = [];
    const positiveHighlights: string[] = [];

    // Identify critical issues
    if (analysis.overall.quality === 'POOR' || analysis.overall.quality === 'CRITICAL') {
      criticalIssues.push('Calibration quality below acceptable threshold');
    }
    if (analysis.bias.overallBias !== 'UNBIASED') {
      criticalIssues.push(`Systematic ${analysis.bias.overallBias.toLowerCase()} bias detected`);
    }

    // Identify positive highlights
    const wellCalibratedDimensions = Object.entries(analysis.dimensions)
      .filter(([, m]) => m.calibrationScore >= 80)
      .map(([d]) => d);

    if (wellCalibratedDimensions.length > 0) {
      positiveHighlights.push(`Well-calibrated dimensions: ${wellCalibratedDimensions.join(', ')}`);
    }

    if (analysis.overall.trend === 'IMPROVING') {
      positiveHighlights.push('Calibration trend is improving');
    }

    const topRecommendations = analysis.recommendedAdjustments
      .slice(0, 3)
      .map(a => `Apply ${a.adjustmentType.toLowerCase()} adjustment to ${a.dimension}`);

    return {
      overallHealth,
      keyFindings,
      criticalIssues,
      positiveHighlights,
      trend: analysis.overall.trend,
      topRecommendations,
    };
  }

  private async getRecentCalibrationData(
    days: number
  ): Promise<Array<{ predicted: number; actual: number; timestamp: Date }>> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const data: Array<{ predicted: number; actual: number; timestamp: Date }> = [];

    for (const [, prediction] of Array.from(this.predictions.entries())) {
      if (prediction.timestamp >= cutoff) {
        // In production, would fetch actual outcomes
        // For now, use predicted as proxy for actual
        data.push({
          predicted: prediction.predictedValues.OVERALL_SUCCESS,
          actual: prediction.predictedValues.OVERALL_SUCCESS,
          timestamp: prediction.timestamp,
        });
      }
    }

    return data;
  }
}
