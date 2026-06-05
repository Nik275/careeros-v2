/**
 * CareerOS - Privacy-Safe Aggregation Types
 *
 * Phase: Outcome Tracking Engine - Privacy Layer
 *
 * Ensures no personal data leakage, no individual exposure.
 * Only aggregate intelligence.
 *
 * @module privacy-aggregation-types
 * @version 1.0.0
 */

import type { CohortId } from './cohort-engine-types';

// ============================================================================
// PRIVACY PRINCIPLES
// ============================================================================

/**
 * Privacy levels for data aggregation.
 */
export type PrivacyLevel =
  | 'PUBLIC'      // Fully anonymized, can be shared externally
  | 'INTERNAL'    // Anonymized, internal use only
  | 'RESTRICTED'; // Highly aggregated, minimal detail

/**
 * Minimum cohort size for privacy compliance.
 */
export const MIN_COHORT_SIZE = 10;

/**
 * Minimum sample size for statistical reporting.
 */
export const MIN_SAMPLE_SIZE = 30;

// ============================================================================
// AGGREGATE DATA STRUCTURES
// ============================================================================

/**
 * Privacy-safe aggregate metrics.
 *
 * Contains only statistical aggregates, no individual data.
 */
export interface AggregateMetrics {
  /** Sample size (always >= MIN_SAMPLE_SIZE) */
  sampleSize: number;

  /** Privacy level of this aggregation */
  privacyLevel: PrivacyLevel;

  /** Statistical measures */
  statistics: StatisticalMeasures;

  /** Distribution data (binned) */
  distribution: BinnedDistribution;

  /** Metadata about aggregation */
  metadata: AggregationMetadata;
}

/** Statistical measures (privacy-safe) */
export interface StatisticalMeasures {
  /** Mean value */
  mean: number;

  /** Median value */
  median: number;

  /** Standard deviation */
  standardDeviation: number;

  /** Minimum value (only if sample size > MIN_COHORT_SIZE * 2) */
  minimum?: number;

  /** Maximum value (only if sample size > MIN_COHORT_SIZE * 2) */
  maximum?: number;

  /** 25th percentile */
  percentile25: number;

  /** 75th percentile */
  percentile75: number;

  /** Interquartile range */
  interquartileRange: number;
}

/** Binned distribution for privacy */
export interface BinnedDistribution {
  /** Number of bins */
  binCount: number;

  /** Bin edges */
  binEdges: number[];

  /** Bin counts (frequencies) */
  binCounts: number[];

  /** Bin labels */
  binLabels?: string[];
}

/** Metadata about aggregation */
export interface AggregationMetadata {
  /** Aggregation timestamp */
  aggregatedAt: Date;

  /** Aggregation method used */
  method: 'RAW' | 'DIFFERENTIAL_PRIVACY' | 'K_ANONYMITY' | 'L_DIVERSITY';

  /** Epsilon value for differential privacy (if applicable) */
  differentialPrivacyEpsilon?: number;

  /** K-anonymity value (if applicable) */
  kAnonymity?: number;

  /** Data freshness */
  dataFreshness: {
    oldestDataPoint: Date;
    newestDataPoint: Date;
    averageAge: number; // days
  };

  /** Aggregation scope */
  scope: {
    cohortIds: CohortId[];
    timeRange: { start: Date; end: Date };
    filtersApplied: string[];
  };
}

// ============================================================================
// AGGREGATE OUTCOME DATA
// ============================================================================

/**
 * Privacy-safe aggregate outcome data.
 */
export interface AggregateOutcomeData {
  /** Outcome dimension */
  dimension: string;

  /** Aggregate metrics for this dimension */
  metrics: AggregateMetrics;

  /** Success rate (if applicable) */
  successRate?: AggregateSuccessRate;

  /** Trend data */
  trends: AggregateTrend;

  /** Comparison to benchmarks */
  benchmarks: AggregateBenchmarkComparison;
}

/** Aggregate success rate */
export interface AggregateSuccessRate {
  /** Success percentage */
  percentage: number;

  /** Confidence interval */
  confidenceInterval: {
    lower: number;
    upper: number;
    confidenceLevel: number;
  };

  /** Sample size for success calculation */
  sampleSize: number;

  /** Success definition used */
  successDefinition: string;
}

/** Aggregate trend data */
export interface AggregateTrend {
  /** Trend direction */
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING';

  /** Trend magnitude (percentage change) */
  magnitude: number;

  /** Period-over-period data (aggregated) */
  periodData: Array<{
    period: string;
    mean: number;
    sampleSize: number;
    changeFromPrevious: number;
  }>;

  /** Statistical significance */
  isSignificant: boolean;
  significanceLevel: number;
}

/** Aggregate benchmark comparison */
export interface AggregateBenchmarkComparison {
  /** Benchmark name */
  benchmarkName: string;

  /** Our aggregate value */
  ourValue: number;

  /** Benchmark value */
  benchmarkValue: number;

  /** Difference */
  difference: number;

  /** Percentage difference */
  percentageDifference: number;

  /** Statistical significance */
  isSignificant: boolean;

  /** Interpretation */
  interpretation: string;
}

// ============================================================================
// AGGREGATE INSIGHTS
// ============================================================================

/**
 * Privacy-safe aggregate insight.
 *
 * Contains only patterns and trends, no individual data.
 */
export interface AggregateInsight {
  /** Insight identifier */
  insightId: string;

  /** Insight type */
  type: 'PATTERN' | 'TREND' | 'CORRELATION' | 'ANOMALY' | 'PREDICTION';

  /** Insight title */
  title: string;

  /** Insight description */
  description: string;

  /** Supporting aggregate data */
  supportingData: AggregateSupportingData;

  /** Confidence level */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Privacy classification */
  privacyLevel: PrivacyLevel;

  /** Timestamp */
  generatedAt: Date;
}

/** Supporting data for aggregate insights */
export interface AggregateSupportingData {
  /** Sample size */
  sampleSize: number;

  /** Statistical measures */
  statistics: Record<string, number>;

  /** Key metrics */
  keyMetrics: Array<{
    name: string;
    value: number;
    context: string;
  }>;

  /** Comparison data (if applicable) */
  comparisons?: Array<{
    group: string;
    value: number;
    difference: number;
  }>;
}

// ============================================================================
// AGGREGATE COHORT ANALYSIS
// ============================================================================

/**
 * Privacy-safe cohort analysis results.
 */
export interface AggregateCohortAnalysis {
  /** Cohort identifier */
  cohortId: CohortId;

  /** Cohort name (privacy-safe) */
  cohortName: string;

  /** Aggregate member count (rounded for privacy) */
  memberCount: AggregateCount;

  /** Outcome aggregates */
  outcomes: Record<string, AggregateOutcomeData>;

  /** Decision pattern aggregates */
  decisionPatterns: AggregateDecisionPatterns;

  /** Action pattern aggregates */
  actionPatterns: AggregateActionPatterns;

  /** Comparative aggregates */
  comparisons: AggregateCohortComparison[];

  /** Generated insights */
  insights: AggregateInsight[];

  /** Privacy metadata */
  privacy: PrivacyMetadata;
}

/** Aggregate count with privacy protection */
export interface AggregateCount {
  /** Approximate count (rounded to nearest 5 or 10) */
  approximate: number;

  /** Exact count (only if > MIN_SAMPLE_SIZE * 2) */
  exact?: number;

  /** Range representation */
  range: {
    min: number;
    max: number;
    representative: number;
  };

  /** Privacy level */
  privacyLevel: PrivacyLevel;
}

/** Aggregate decision patterns */
export interface AggregateDecisionPatterns {
  /** Most common decisions (top N, percentages only) */
  topDecisions: Array<{
    decision: string;
    percentage: number;
    rank: number;
  }>;

  /** Decision distribution */
  distribution: BinnedDistribution;

  /** Decision confidence aggregates */
  confidenceMetrics: AggregateMetrics;

  /** Time to decision aggregates */
  timeToDecisionMetrics: AggregateMetrics;
}

/** Aggregate action patterns */
export interface AggregateActionPatterns {
  /** Most common action types */
  topActionTypes: Array<{
    actionType: string;
    percentage: number;
    rank: number;
  }>;

  /** Completion rate aggregates */
  completionRates: Record<string, AggregateSuccessRate>;

  /** Progress metrics aggregates */
  progressMetrics: AggregateMetrics;

  /** Time to milestone aggregates */
  timeToMilestoneMetrics: Record<string, AggregateMetrics>;
}

/** Aggregate cohort comparison */
export interface AggregateCohortComparison {
  /** Comparison cohort identifier */
  comparedCohortId: CohortId;

  /** Comparison cohort name */
  comparedCohortName: string;

  /** Outcome comparisons */
  outcomeComparisons: Array<{
    dimension: string;
    thisCohortValue: number;
    otherCohortValue: number;
    difference: number;
    percentageDifference: number;
    isSignificant: boolean;
  }>;

  /** Key differences */
  keyDifferences: string[];

  /** Statistical significance summary */
  significanceSummary: {
    significantlyBetter: string[];
    significantlyWorse: string[];
    notSignificant: string[];
  };
}

/** Privacy metadata */
export interface PrivacyMetadata {
  /** Privacy level */
  privacyLevel: PrivacyLevel;

  /** Aggregation methods used */
  aggregationMethods: string[];

  /** Minimum group sizes enforced */
  minGroupSizes: Record<string, number>;

  /** Data suppression applied */
  dataSuppression: {
    suppressedFields: string[];
    suppressionReason: string;
  };

  /** Privacy compliance certification */
  compliance: {
    kAnonymitySatisfied: boolean;
    lDiversitySatisfied: boolean;
    differentialPrivacyApplied: boolean;
  };
}

// ============================================================================
// AGGREGATION REQUESTS & RESULTS
// ============================================================================

/** Request for aggregate data */
export interface AggregateDataRequest {
  /** Cohorts to include */
  cohortIds?: CohortId[];

  /** Dimensions to aggregate */
  dimensions: string[];

  /** Time range */
  timeRange?: {
    start: Date;
    end: Date;
  };

  /** Privacy level required */
  privacyLevel: PrivacyLevel;

  /** Minimum sample size */
  minSampleSize?: number;

  /** Aggregation method preference */
  methodPreference?: 'DIFFERENTIAL_PRIVACY' | 'K_ANONYMITY' | 'RAW';

  /** Filters to apply */
  filters?: AggregateFilter[];
}

/** Filter for aggregation */
export interface AggregateFilter {
  /** Filter field */
  field: string;

  /** Filter operator */
  operator: 'EQUALS' | 'IN' | 'RANGE' | 'EXISTS';

  /** Filter value */
  value?: unknown;

  /** Filter values (for IN operator) */
  values?: unknown[];

  /** Range (for RANGE operator) */
  range?: { min: number; max: number };
}

/** Result of aggregate data request */
export interface AggregateDataResult {
  /** Requested aggregates */
  aggregates: Record<string, AggregateOutcomeData>;

  /** Cross-dimension aggregates */
  crossDimensionAggregates?: Record<string, AggregateMetrics>;

  /** Metadata */
  metadata: {
    totalSampleSize: number;
    cohortsIncluded: number;
    privacyLevel: PrivacyLevel;
    aggregationMethod: string;
    generatedAt: Date;
  };

  /** Privacy compliance info */
  privacyCompliance: {
    kAnonymity: boolean;
    lDiversity: boolean;
    differentialPrivacy: boolean;
    suppressedDataPoints: number;
  };
}

// ============================================================================
// PRIVACY-SAFE QUERY INTERFACE
// ============================================================================

/**
 * Privacy-safe query for outcome data.
 *
 * Ensures queries cannot expose individual data.
 */
export interface PrivacySafeQuery {
  /** Query identifier */
  queryId: string;

  /** Query type */
  type: 'AGGREGATE' | 'STATISTICAL' | 'PATTERN' | 'COMPARISON';

  /** Query parameters */
  parameters: Record<string, unknown>;

  /** Privacy constraints */
  privacyConstraints: {
    minSampleSize: number;
    privacyLevel: PrivacyLevel;
    allowIndividualData: false; // Always false
    maxResolution: 'COHORT' | 'AGGREGATE' | 'STATISTICAL';
  };

  /** Query result constraints */
  resultConstraints: {
    maxResults: number;
    includeRawData: false; // Always false
    includeDistributions: boolean;
    includeTrends: boolean;
  };
}

/**
 * Privacy-safe query result.
 */
export interface PrivacySafeQueryResult {
  /** Query identifier */
  queryId: string;

  /** Result type */
  type: 'AGGREGATE' | 'STATISTICAL' | 'PATTERN' | 'COMPARISON';

  /** Result data (always aggregated) */
  data: AggregateMetrics | AggregateOutcomeData | AggregateInsight | AggregateCohortAnalysis;

  /** Result metadata */
  metadata: {
    sampleSize: number;
    privacyLevel: PrivacyLevel;
    generatedAt: Date;
    queryExecutionTimeMs: number;
  };

  /** Privacy compliance info */
  privacyCompliance: {
    kAnonymitySatisfied: boolean;
    lDiversitySatisfied: boolean;
    differentialPrivacyApplied: boolean;
    dataSuppressionApplied: boolean;
  };
}

// ============================================================================
// PRIVACY AGGREGATION ENGINE INTERFACE
// ============================================================================

/**
 * Privacy Aggregation Engine - Ensures privacy-safe data access.
 *
 * All data access goes through this engine to guarantee:
 * - No personal data leakage
 * - No individual exposure
 * - Only aggregate intelligence
 */
export interface PrivacyAggregationEngine {
  /**
   * Aggregate outcome data.
   *
   * Returns privacy-safe aggregate metrics for specified dimensions.
   */
  aggregateData(request: AggregateDataRequest): Promise<AggregateDataResult>;

  /**
   * Execute privacy-safe query.
   *
   * Processes query with privacy constraints enforced.
   */
  executeQuery(query: PrivacySafeQuery): Promise<PrivacySafeQueryResult>;

  /**
   * Generate aggregate cohort analysis.
   *
   * Creates comprehensive privacy-safe analysis for a cohort.
   */
  analyzeCohort(cohortId: CohortId): Promise<AggregateCohortAnalysis>;

  /**
   * Compare cohorts (privacy-safe).
   *
   * Returns aggregate comparisons between cohorts.
   */
  compareCohorts(
    cohortIds: CohortId[],
    dimensions: string[]
  ): Promise<AggregateCohortComparison[]>;

  /**
   * Generate aggregate insights.
   *
   * Discovers patterns from aggregate data only.
   */
  generateInsights(
    cohortIds: CohortId[],
    insightTypes: string[]
  ): Promise<AggregateInsight[]>;

  /**
   * Validate privacy compliance.
   *
   * Checks if data meets privacy requirements.
   */
  validatePrivacyCompliance(
    data: unknown,
    privacyLevel: PrivacyLevel
  ): Promise<PrivacyValidationResult>;

  /**
   * Apply differential privacy.
   *
   * Adds noise to aggregates for differential privacy.
   */
  applyDifferentialPrivacy(
    aggregates: AggregateMetrics,
    epsilon: number
  ): Promise<AggregateMetrics>;
}

/** Privacy validation result */
export interface PrivacyValidationResult {
  /** Whether data passes validation */
  isValid: boolean;

  /** Violations found */
  violations: PrivacyViolation[];

  /** Suggested corrections */
  suggestedCorrections: string[];

  /** Privacy score (0-100) */
  privacyScore: number;
}

/** Privacy violation */
export interface PrivacyViolation {
  /** Violation type */
  type: 'INDIVIDUAL_EXPOSURE' | 'SMALL_GROUP' | 'LINKABILITY' | 'INFERENCE';

  /** Violation description */
  description: string;

  /** Severity */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Affected data */
  affectedData: string;

  /** Recommended fix */
  recommendedFix: string;
}
