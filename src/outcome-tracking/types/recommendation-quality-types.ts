/**
 * CareerOS - Recommendation Quality Engine Types
 *
 * Phase: Outcome Tracking Engine - Recommendation Quality
 *
 * Calculates recommendation accuracy metrics.
 *
 * @module recommendation-quality-types
 * @version 1.0.0
 */

import type { RecommendationId } from '../../recommendation/recommendation-types';
import type { OutcomeRecordId } from './outcome-tracking-types';

// ============================================================================
// ACCURACY METRICS
// ============================================================================

/**
 * Complete accuracy metrics for a recommendation.
 *
 * Measures how well the recommendation predicted actual outcomes.
 */
export interface RecommendationAccuracy {
  /** Recommendation identifier */
  recommendationId: RecommendationId;

  /** Outcome record identifier */
  outcomeRecordId: OutcomeRecordId;

  /** Overall accuracy score (0-100) */
  overallAccuracy: number;

  /** Per-dimension accuracy metrics */
  dimensions: RecommendationDimensionAccuracy;

  /** Accuracy classification */
  classification: AccuracyClassification;

  /** Accuracy timestamp */
  calculatedAt: Date;
}

/** Per-dimension recommendation accuracy */
export interface RecommendationDimensionAccuracy {
  /** Career fit accuracy */
  fitAccuracy: DimensionAccuracy;

  /** Utility prediction accuracy */
  utilityAccuracy: DimensionAccuracy;

  /** Regret prediction accuracy */
  regretAccuracy: DimensionAccuracy;

  /** Optionality prediction accuracy */
  optionalityAccuracy: DimensionAccuracy;

  /** Simulation accuracy */
  simulationAccuracy: DimensionAccuracy;
}

/** Accuracy for a single dimension */
export interface DimensionAccuracy {
  /** Dimension name */
  dimension: string;

  /** Predicted value */
  predictedValue: number;

  /** Actual value */
  actualValue: number;

  /** Absolute error */
  absoluteError: number;

  /** Percentage error */
  percentageError: number;

  /** Accuracy score (0-100) */
  accuracyScore: number;

  /** Whether prediction was accurate */
  isAccurate: boolean;
}

/** Accuracy classification */
export type AccuracyClassification =
  | 'EXCELLENT'    // 90-100
  | 'GOOD'         // 75-89
  | 'ACCEPTABLE'   // 60-74
  | 'POOR'         // 40-59
  | 'UNRELIABLE';  // 0-39

// ============================================================================
// QUALITY ANALYSIS
// ============================================================================

/**
 * Comprehensive quality analysis for recommendations.
 */
export interface RecommendationQualityAnalysis {
  /** Analysis identifier */
  analysisId: string;

  /** Analysis period */
  period: {
    startDate: Date;
    endDate: Date;
  };

  /** Number of recommendations analyzed */
  recommendationCount: number;

  /** Number of outcomes available */
  outcomeCount: number;

  /** Overall quality metrics */
  overall: OverallQualityMetrics;

  /** Accuracy metrics */
  accuracy: QualityAccuracyMetrics;

  /** Utility metrics */
  utility: QualityUtilityMetrics;

  /** Regret metrics */
  regret: QualityRegretMetrics;

  /** Optionality metrics */
  optionality: QualityOptionalityMetrics;

  /** Simulation metrics */
  simulation: QualitySimulationMetrics;

  /** Per-type quality breakdown */
  byType: Record<string, TypeQualityMetrics>;

  /** Trends over time */
  trends: QualityTrend[];
}

/** Overall quality metrics */
export interface OverallQualityMetrics {
  /** Average overall accuracy */
  averageAccuracy: number;

  /** Median overall accuracy */
  medianAccuracy: number;

  /** Standard deviation of accuracy */
  accuracyStdDev: number;

  /** Percentage of accurate recommendations (>75% accuracy) */
  accuracyRate: number;

  /** Quality score (0-100) */
  qualityScore: number;

  /** Quality trend */
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';

  /** Year-over-year improvement */
  yearOverYearImprovement: number;
}

/** Quality accuracy metrics */
export interface QualityAccuracyMetrics {
  /** Recommendation accuracy rate */
  recommendationAccuracyRate: number;

  /** Mean absolute error for predictions */
  meanAbsoluteError: number;

  /** Root mean squared error */
  rootMeanSquaredError: number;

  /** Prediction bias (positive = overestimate) */
  predictionBias: number;

  /** Accuracy by recommendation rank */
  accuracyByRank: Array<{
    rank: number;
    accuracy: number;
    count: number;
  }>;

  /** Accuracy by recommendation type */
  accuracyByType: Record<string, number>;
}

/** Quality utility metrics */
export interface QualityUtilityMetrics {
  /** Utility prediction accuracy */
  utilityPredictionAccuracy: number;

  /** Correlation between predicted and actual utility */
  predictedActualCorrelation: number;

  /** Percentage of students achieving predicted utility */
  utilityAchievementRate: number;

  /** Average utility delta (actual - predicted) */
  averageUtilityDelta: number;

  /** Utility prediction bias */
  utilityBias: 'OVERESTIMATE' | 'UNDERESTIMATE' | 'UNBIASED';
}

/** Quality regret metrics */
export interface QualityRegretMetrics {
  /** Regret prediction accuracy */
  regretPredictionAccuracy: number;

  /** Percentage of students with predicted regret levels */
  regretPredictionRate: number;

  /** Average regret prediction error */
  averageRegretError: number;

  /** Regret bias (positive = underestimate regret) */
  regretBias: number;

  /** Students with high unexpected regret */
  highUnexpectedRegretRate: number;
}

/** Quality optionality metrics */
export interface QualityOptionalityMetrics {
  /** Optionality prediction accuracy */
  optionalityPredictionAccuracy: number;

  /** Optionality preservation rate */
  optionalityPreservationRate: number;

  /** New options opened prediction accuracy */
  newOptionsAccuracy: number;

  /** Career mobility prediction accuracy */
  mobilityPredictionAccuracy: number;

  /** Average optionality delta */
  averageOptionalityDelta: number;
}

/** Quality simulation metrics */
export interface QualitySimulationMetrics {
  /** Simulation accuracy score */
  simulationAccuracyScore: number;

  /** Timeline prediction accuracy */
  timelineAccuracy: number;

  /** Outcome path prediction accuracy */
  pathPredictionAccuracy: number;

  /** Milestone prediction accuracy */
  milestonePredictionAccuracy: number;

  /** Simulation realism score */
  realismScore: number;
}

/** Quality metrics by recommendation type */
export interface TypeQualityMetrics {
  /** Recommendation type */
  type: string;

  /** Number of recommendations */
  count: number;

  /** Average accuracy */
  averageAccuracy: number;

  /** Success rate */
  successRate: number;

  /** Average satisfaction */
  averageSatisfaction: number;

  /** Average regret */
  averageRegret: number;

  /** Quality score */
  qualityScore: number;
}

/** Quality trend over time */
export interface QualityTrend {
  /** Period identifier */
  period: string;

  /** Period start date */
  startDate: Date;

  /** Average accuracy for period */
  averageAccuracy: number;

  /** Success rate for period */
  successRate: number;

  /** Average satisfaction for period */
  averageSatisfaction: number;

  /** Notable changes from previous period */
  changes: string[];

  /** Significant events affecting quality */
  significantEvents: string[];
}

// ============================================================================
// QUALITY REPORT
// ============================================================================

/**
 * Complete recommendation quality report.
 */
export interface RecommendationQualityReport {
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
  executiveSummary: QualityExecutiveSummary;

  /** Detailed analysis */
  analysis: RecommendationQualityAnalysis;

  /** Per-recommendation accuracy data */
  recommendationDetails: RecommendationAccuracy[];

  /** Identified issues */
  issues: QualityIssue[];

  /** Improvement opportunities */
  opportunities: QualityOpportunity[];

  /** Action items */
  actionItems: QualityActionItem[];
}

/** Executive summary of recommendation quality */
export interface QualityExecutiveSummary {
  /** Overall quality grade */
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** Quality trend */
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';

  /** Key findings */
  keyFindings: string[];

  /** Critical issues requiring attention */
  criticalIssues: string[];

  /** Positive highlights */
  positiveHighlights: string[];

  /** Year-over-year comparison */
  yearOverYear: {
    previousPeriodAccuracy: number;
    currentPeriodAccuracy: number;
    change: number;
    changePercentage: number;
  };

  /** Top recommendations for improvement */
  improvementRecommendations: string[];
}

/** Quality issue identified */
export interface QualityIssue {
  /** Issue identifier */
  issueId: string;

  /** Issue severity */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Issue category */
  category: QualityIssueCategory;

  /** Issue title */
  title: string;

  /** Issue description */
  description: string;

  /** Affected recommendations count */
  affectedRecommendations: number;

  /** Impact on quality score */
  impactOnQuality: number;

  /** Root cause analysis */
  rootCause: string;

  /** Recommended fix */
  recommendedFix: string;

  /** Estimated effort to fix */
  estimatedEffort: 'SMALL' | 'MEDIUM' | 'LARGE';
}

/** Quality issue categories */
export type QualityIssueCategory =
  | 'FIT_PREDICTION'
  | 'UTILITY_PREDICTION'
  | 'REGRET_PREDICTION'
  | 'OPTIONALITY_PREDICTION'
  | 'SIMULATION_ACCURACY'
  | 'CONFIDENCE_CALIBRATION'
  | 'BIAS'
  | 'DATA_QUALITY'
  | 'MODEL_PERFORMANCE';

/** Quality improvement opportunity */
export interface QualityOpportunity {
  /** Opportunity identifier */
  opportunityId: string;

  /** Opportunity title */
  title: string;

  /** Opportunity description */
  description: string;

  /** Potential impact on quality score */
  potentialImpact: number;

  /** Implementation effort */
  effort: 'SMALL' | 'MEDIUM' | 'LARGE';

  /** Priority */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Implementation approach */
  implementationApproach: string;

  /** Success criteria */
  successCriteria: string[];
}

/** Quality action item */
export interface QualityActionItem {
  /** Action identifier */
  actionId: string;

  /** Action description */
  description: string;

  /** Related issue or opportunity */
  relatedTo: string;

  /** Priority */
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Assigned to */
  assignedTo?: string;

  /** Due date */
  dueDate?: Date;

  /** Status */
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

  /** Expected impact */
  expectedImpact: string;
}

// ============================================================================
// RECOMMENDATION QUALITY ENGINE INTERFACE
// ============================================================================

/**
 * Recommendation Quality Engine - Calculates recommendation accuracy.
 *
 * Analyzes the accuracy of recommendations by comparing predicted
 * outcomes with actual outcomes across multiple dimensions.
 */
export interface RecommendationQualityEngine {
  /**
   * Calculate accuracy for a single recommendation.
   *
   * Compares predicted outcomes with actual outcomes to measure
   * recommendation accuracy.
   */
  calculateAccuracy(
    recommendationId: RecommendationId,
    outcomeRecordId: OutcomeRecordId
  ): Promise<RecommendationAccuracy>;

  /**
   * Analyze quality for a set of recommendations.
   *
   * Performs comprehensive quality analysis across all accuracy dimensions.
   */
  analyzeQuality(
    recommendationIds: RecommendationId[],
    options?: QualityAnalysisOptions
  ): Promise<RecommendationQualityAnalysis>;

  /**
   * Generate a comprehensive quality report.
   *
   * Creates a detailed report on recommendation quality metrics.
   */
  generateReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<RecommendationQualityReport>;

  /**
   * Get quality metrics for a specific recommendation type.
   *
   * Returns quality breakdown by recommendation type.
   */
  getQualityByType(
    recommendationType: string,
    period?: { startDate: Date; endDate: Date }
  ): Promise<TypeQualityMetrics>;

  /**
   * Track quality trends over time.
   *
   * Returns quality metrics trended over specified time periods.
   */
  trackTrends(
    periods: Array<{ startDate: Date; endDate: Date }>
  ): Promise<QualityTrend[]>;

  /**
   * Identify quality issues.
   *
   * Analyzes quality data to identify systematic issues.
   */
  identifyIssues(
    analysis: RecommendationQualityAnalysis
  ): Promise<QualityIssue[]>;

  /**
   * Find improvement opportunities.
   *
   * Identifies opportunities to improve recommendation quality.
   */
  findOpportunities(
    analysis: RecommendationQualityAnalysis
  ): Promise<QualityOpportunity[]>;
}

/** Options for quality analysis */
export interface QualityAnalysisOptions {
  /** Recommendation types to include */
  recommendationTypes?: string[];

  /** Minimum confidence threshold */
  minConfidence?: number;

  /** Include only completed outcomes */
  completedOutcomesOnly?: boolean;

  /** Group by criteria */
  groupBy?: ('TYPE' | 'RANK' | 'ARCHETYPE' | 'COHORT')[];

  /** Include detailed per-recommendation data */
  includeDetails?: boolean;
}
