/**
 * CareerOS - Confidence Calibration Engine Types
 *
 * Phase: Outcome Tracking Engine - Confidence Calibration
 *
 * Compares predicted outcomes vs actual outcomes and adjusts confidence.
 *
 * @module confidence-calibration-types
 * @version 1.0.0
 */

import type { OutcomeRecordId, OutcomeDimensions } from './outcome-tracking-types';

// ============================================================================
// CALIBRATION METRICS
// ============================================================================

/**
 * Calibration metrics for a specific prediction dimension.
 *
 * Measures how well predictions match actual outcomes.
 */
export interface CalibrationMetrics {
  /** Dimension being calibrated */
  dimension: CalibrationDimension;

  /** Predicted value (at time of recommendation) */
  predictedValue: number;

  /** Actual value (from outcome) */
  actualValue: number;

  /** Prediction error (predicted - actual) */
  error: number;

  /** Absolute error */
  absoluteError: number;

  /** Squared error */
  squaredError: number;

  /** Percentage error */
  percentageError: number;

  /** Whether prediction was within acceptable bounds */
  withinTolerance: boolean;

  /** Calibration quality score (0-100) */
  calibrationScore: number;
}

/** Dimensions that can be calibrated */
export type CalibrationDimension =
  | 'OVERALL_SUCCESS'
  | 'SATISFACTION'
  | 'TIMELINE'
  | 'UTILITY'
  | 'CAREER_PROGRESS'
  | 'INCOME_GROWTH'
  | 'SKILL_GROWTH'
  | 'LIFE_SATISFACTION'
  | 'STRESS_LEVELS'
  | 'LEARNING_GROWTH'
  | 'CAREER_MOBILITY'
  | 'GOAL_ACHIEVEMENT'
  | 'REGRET_LEVEL'
  | 'OPTIONALITY';

// ============================================================================
// CALIBRATION ANALYSIS
// ============================================================================

/**
 * Complete calibration analysis for a set of predictions.
 */
export interface CalibrationAnalysis {
  /** Unique analysis identifier */
  analysisId: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Number of predictions analyzed */
  predictionCount: number;

  /** Time range of predictions */
  timeRange: {
    startDate: Date;
    endDate: Date;
  };

  /** Overall calibration metrics */
  overall: OverallCalibrationMetrics;

  /** Per-dimension calibration metrics */
  dimensions: Record<CalibrationDimension, DimensionCalibrationMetrics>;

  /** Bias analysis */
  bias: BiasAnalysis;

  /** Reliability analysis */
  reliability: ReliabilityAnalysis;

  /** Confidence calibration curve */
  confidenceCurve: ConfidenceCalibrationCurve;

  /** Recommended adjustments */
  recommendedAdjustments: CalibrationAdjustment[];
}

/** Overall calibration metrics */
export interface OverallCalibrationMetrics {
  /** Mean absolute error across all dimensions */
  meanAbsoluteError: number;

  /** Root mean squared error */
  rootMeanSquaredError: number;

  /** Mean percentage error */
  meanPercentageError: number;

  /** Overall calibration score (0-100) */
  calibrationScore: number;

  /** Calibration quality classification */
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

  /** Trend direction */
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

/** Per-dimension calibration metrics */
export interface DimensionCalibrationMetrics {
  /** Dimension name */
  dimension: CalibrationDimension;

  /** Number of samples */
  sampleCount: number;

  /** Mean predicted value */
  meanPredicted: number;

  /** Mean actual value */
  meanActual: number;

  /** Mean error */
  meanError: number;

  /** Mean absolute error */
  meanAbsoluteError: number;

  /** Standard deviation of errors */
  errorStdDev: number;

  /** Calibration score (0-100) */
  calibrationScore: number;

  /** Bias direction */
  biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';

  /** Bias magnitude (0-100) */
  biasMagnitude: number;
}

/** Bias analysis */
export interface BiasAnalysis {
  /** Overall bias direction */
  overallBias: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';

  /** Bias magnitude (0-100) */
  biasMagnitude: number;

  /** Bias by prediction confidence level */
  biasByConfidence: Array<{
    confidenceRange: string;
    biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';
    biasMagnitude: number;
    sampleCount: number;
  }>;

  /** Bias by recommendation type */
  biasByRecommendationType: Record<string, {
    biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';
    biasMagnitude: number;
  }>;

  /** Systematic bias patterns detected */
  systematicPatterns: SystematicBiasPattern[];
}

/** Systematic bias pattern */
export interface SystematicBiasPattern {
  /** Pattern description */
  description: string;

  /** Conditions where bias occurs */
  conditions: string[];

  /** Bias direction */
  biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT';

  /** Bias magnitude */
  biasMagnitude: number;

  /** Affected dimensions */
  affectedDimensions: CalibrationDimension[];

  /** Recommended correction */
  recommendedCorrection: string;
}

/** Reliability analysis */
export interface ReliabilityAnalysis {
  /** Overall reliability score (0-100) */
  reliabilityScore: number;

  /** Consistency of predictions */
  consistencyScore: number;

  /** Prediction interval coverage */
  intervalCoverage: number;

  /** Reliability by outcome type */
  reliabilityByOutcomeType: Record<string, number>;

  /** Reliability degradation over time */
  temporalStability: TemporalStabilityMetrics;
}

/** Temporal stability metrics */
export interface TemporalStabilityMetrics {
  /** Whether reliability is stable over time */
  isStable: boolean;

  /** Trend direction */
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';

  /** Stability score (0-100) */
  stabilityScore: number;

  /** Reliability by time period */
  reliabilityByPeriod: Array<{
    period: string;
    reliabilityScore: number;
    sampleCount: number;
  }>;
}

/** Confidence calibration curve */
export interface ConfidenceCalibrationCurve {
  /** Curve data points */
  dataPoints: Array<{
    /** Predicted confidence level */
    predictedConfidence: number;

    /** Actual accuracy at this confidence level */
    actualAccuracy: number;

    /** Number of predictions at this level */
    sampleCount: number;

    /** Expected vs actual gap */
    calibrationGap: number;
  }>;

  /** Expected calibration error */
  expectedCalibrationError: number;

  /** Maximum calibration error */
  maximumCalibrationError: number;

  /** Brier score */
  brierScore: number;

  /** Area under calibration curve */
  areaUnderCurve: number;
}

// ============================================================================
// CALIBRATION ADJUSTMENTS
// ============================================================================

/**
 * Recommended calibration adjustment.
 */
export interface CalibrationAdjustment {
  /** Adjustment identifier */
  adjustmentId: string;

  /** Dimension to adjust */
  dimension: CalibrationDimension;

  /** Type of adjustment */
  adjustmentType: 'SCALE' | 'OFFSET' | 'TRANSFORM' | 'MODEL_UPDATE';

  /** Adjustment parameters */
  parameters: Record<string, number>;

  /** Expected improvement from adjustment */
  expectedImprovement: number;

  /** Confidence in this adjustment */
  confidence: number;

  /** Implementation complexity */
  implementationComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';

  /** Whether adjustment has been applied */
  applied: boolean;

  /** When adjustment was applied (if applicable) */
  appliedAt?: Date;
}

/**
 * Applied calibration adjustment.
 */
export interface AppliedCalibration {
  /** Adjustment that was applied */
  adjustment: CalibrationAdjustment;

  /** When adjustment was applied */
  appliedAt: Date;

  /** Who/what applied the adjustment */
  appliedBy: string;

  /** Results after application */
  results: AdjustmentResults;
}

/** Results of applying a calibration adjustment */
export interface AdjustmentResults {
  /** Whether adjustment improved calibration */
  improvedCalibration: boolean;

  /** Improvement amount */
  improvementAmount: number;

  /** New calibration score */
  newCalibrationScore: number;

  /** Side effects observed */
  sideEffects: string[];

  /** Whether to keep the adjustment */
  keepAdjustment: boolean;
}

// ============================================================================
// CALIBRATION REPORT
// ============================================================================

/**
 * Complete calibration report.
 */
export interface CalibrationReport {
  /** Report identifier */
  reportId: string;

  /** Report generation timestamp */
  generatedAt: Date;

  /** Report period */
  period: {
    startDate: Date;
    endDate: Date;
  };

  /** Executive summary */
  executiveSummary: CalibrationSummary;

  /** Detailed analysis */
  analysis: CalibrationAnalysis;

  /** Historical trends */
  historicalTrends: CalibrationTrend[];

  /** Benchmark comparisons */
  benchmarks: CalibrationBenchmark[];

  /** Action items */
  actionItems: CalibrationActionItem[];
}

/** Executive summary of calibration status */
export interface CalibrationSummary {
  /** Overall calibration health */
  overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

  /** Key findings */
  keyFindings: string[];

  /** Critical issues requiring attention */
  criticalIssues: string[];

  /** Positive highlights */
  positiveHighlights: string[];

  /** Overall trend */
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';

  /** Recommendations */
  topRecommendations: string[];
}

/** Calibration trend over time */
export interface CalibrationTrend {
  /** Period identifier */
  period: string;

  /** Period start date */
  startDate: Date;

  /** Overall calibration score for period */
  calibrationScore: number;

  /** Mean absolute error for period */
  meanAbsoluteError: number;

  /** Bias direction for period */
  biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';

  /** Notable changes from previous period */
  changes: string[];
}

/** Benchmark comparison */
export interface CalibrationBenchmark {
  /** Benchmark name */
  benchmarkName: string;

  /** Our score */
  ourScore: number;

  /** Benchmark score */
  benchmarkScore: number;

  /** Comparison result */
  comparison: 'ABOVE' | 'AT' | 'BELOW';

  /** Gap from benchmark */
  gap: number;

  /** Interpretation */
  interpretation: string;
}

/** Calibration action item */
export interface CalibrationActionItem {
  /** Action identifier */
  actionId: string;

  /** Action description */
  description: string;

  /** Priority */
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Affected dimensions */
  affectedDimensions: CalibrationDimension[];

  /** Expected impact */
  expectedImpact: string;

  /** Implementation effort */
  effort: 'SMALL' | 'MEDIUM' | 'LARGE';

  /** Assigned to */
  assignedTo?: string;

  /** Due date */
  dueDate?: Date;

  /** Status */
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

// ============================================================================
// CONFIDENCE CALIBRATION ENGINE INTERFACE
// ============================================================================

/**
 * Confidence Calibration Engine - Adjusts prediction confidence based on outcomes.
 *
 * Compares predicted outcomes with actual outcomes to identify and correct
 * systematic biases in the recommendation system's confidence estimates.
 */
export interface ConfidenceCalibrationEngine {
  /**
   * Analyze calibration for a set of outcome records.
   *
   * Compares predictions with actual outcomes to measure
   * calibration quality across all dimensions.
   */
  analyzeCalibration(
    outcomeRecordIds: OutcomeRecordId[],
    options?: CalibrationAnalysisOptions
  ): Promise<CalibrationAnalysis>;

  /**
   * Generate a comprehensive calibration report.
   *
   * Creates a detailed report on prediction accuracy and calibration.
   */
  generateReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<CalibrationReport>;

  /**
   * Apply calibration adjustments.
   *
   * Implements recommended adjustments to improve calibration.
   */
  applyAdjustments(
    adjustments: CalibrationAdjustment[]
  ): Promise<AppliedCalibration[]>;

  /**
   * Get current calibration status.
   *
   * Returns quick summary of current calibration health.
   */
  getCalibrationStatus(): Promise<CalibrationStatus>;

  /**
   * Predict confidence for a new recommendation.
   *
   * Uses calibration data to provide well-calibrated confidence estimates.
   */
  predictConfidence(
    recommendation: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<CalibratedConfidence>;
}

/** Options for calibration analysis */
export interface CalibrationAnalysisOptions {
  /** Dimensions to analyze */
  dimensions?: CalibrationDimension[];

  /** Minimum sample size per dimension */
  minSampleSize?: number;

  /** Confidence level for intervals */
  confidenceLevel?: number;

  /** Whether to include detailed breakdowns */
  includeBreakdowns?: boolean;

  /** Grouping criteria for analysis */
  groupBy?: ('RECOMMENDATION_TYPE' | 'ARCHETYPE' | 'COHORT' | 'TIME_PERIOD')[];
}

/** Current calibration status */
export interface CalibrationStatus {
  /** Overall calibration health */
  overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

  /** Last analysis timestamp */
  lastAnalyzedAt: Date;

  /** Number of predictions in calibration dataset */
  predictionCount: number;

  /** Quick metrics */
  quickMetrics: {
    meanAbsoluteError: number;
    biasDirection: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'UNBIASED';
    calibrationScore: number;
  };

  /** Top issues */
  topIssues: string[];

  /** Whether calibration is within acceptable bounds */
  isAcceptable: boolean;
}

/** Calibrated confidence prediction */
export interface CalibratedConfidence {
  /** Original confidence estimate */
  originalConfidence: number;

  /** Calibrated confidence estimate */
  calibratedConfidence: number;

  /** Adjustment applied */
  adjustment: {
    type: 'SCALE' | 'OFFSET' | 'TRANSFORM';
    factor: number;
    reason: string;
  };

  /** Confidence interval */
  confidenceInterval: {
    lower: number;
    upper: number;
    confidenceLevel: number;
  };

  /** Calibration quality for this prediction type */
  calibrationQuality: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Warning if confidence may be unreliable */
  warning?: string;
}
