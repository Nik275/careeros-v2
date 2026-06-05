/**
 * OutcomeDimension
 * 
 * Groups related outcome metrics into coherent dimensions.
 * Each dimension represents a category of career outcomes with
 * aggregated scoring and analysis capabilities.
 */

import {
  OutcomeId,
  OutcomeScore,
  OutcomeWeight,
  TimeHorizon,
  ConfidenceLevel,
  OutcomeCategory,
  ScoreBand,
  AggregationMethod,
} from './types';
import { OutcomeMetric, MetricMeasurement, MetricScoreDetail } from './OutcomeMetric';

/**
 * Outcome dimension definition
 * Represents a category of related outcome metrics
 */
export interface OutcomeDimension {
  readonly id: OutcomeId;
  readonly category: OutcomeCategory;
  readonly name: string;
  readonly description: string;
  readonly metrics: OutcomeMetric[];
  
  // Dimension weights
  readonly defaultWeight: OutcomeWeight;
  readonly importanceByHorizon: Record<TimeHorizon, OutcomeWeight>;
  
  // Scoring configuration
  readonly aggregationMethod: AggregationMethod;
  readonly requiresAllMetrics: boolean;
  readonly minMetricsForScore: number;
  
  // Metadata
  readonly applicableHorizons: TimeHorizon[];
  readonly confidence: ConfidenceLevel;
  readonly tags: string[];
}



/**
 * Computed dimension score with breakdown
 */
export interface DimensionScore {
  readonly dimensionId: OutcomeId;
  readonly category: OutcomeCategory;
  readonly overallScore: OutcomeScore;
  readonly weightedScore: OutcomeScore;
  readonly band: ScoreBand;
  readonly metricScores: MetricScoreDetail[];
  readonly confidence: ConfidenceLevel;
  readonly horizon: TimeHorizon;
  readonly calculatedAt: Date;
  readonly missingMetrics: OutcomeId[];
}

// ============================================
// STANDARD OUTCOME DIMENSIONS
// ============================================

import {
  FinancialMetrics,
  EducationalMetrics,
  PsychologicalMetrics,
  LifestyleMetrics,
  CareerMetrics,
} from './OutcomeMetric';

/**
 * Financial Outcomes Dimension
 * Monetary and wealth-related outcomes
 */
export const FinancialDimension: OutcomeDimension = {
  id: 'dimension_financial',
  category: OutcomeCategory.FINANCIAL,
  name: 'Financial Outcomes',
  description: 'Monetary compensation, savings, wealth accumulation, and financial security',
  metrics: Object.values(FinancialMetrics),
  defaultWeight: 0.25,
  importanceByHorizon: {
    immediate: 0.30,
    short_term: 0.25,
    medium_term: 0.25,
    long_term: 0.20,
    lifetime: 0.15,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requiresAllMetrics: false,
  minMetricsForScore: 2,
  applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term', 'lifetime'],
  confidence: 'established',
  tags: ['money', 'wealth', 'compensation', 'security'],
};

/**
 * Educational Outcomes Dimension
 * Learning, credentials, and skill development outcomes
 */
export const EducationalDimension: OutcomeDimension = {
  id: 'dimension_educational',
  category: OutcomeCategory.EDUCATIONAL,
  name: 'Educational Outcomes',
  description: 'Educational attainment, credential value, and learning effectiveness',
  metrics: Object.values(EducationalMetrics),
  defaultWeight: 0.15,
  importanceByHorizon: {
    immediate: 0.20,
    short_term: 0.15,
    medium_term: 0.10,
    long_term: 0.05,
    lifetime: 0.05,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requiresAllMetrics: false,
  minMetricsForScore: 2,
  applicableHorizons: ['immediate', 'short_term', 'medium_term'],
  confidence: 'established',
  tags: ['education', 'credentials', 'learning', 'degrees'],
};

/**
 * Psychological Outcomes Dimension
 * Mental wellbeing and job satisfaction outcomes
 */
export const PsychologicalDimension: OutcomeDimension = {
  id: 'dimension_psychological',
  category: OutcomeCategory.PSYCHOLOGICAL,
  name: 'Psychological Outcomes',
  description: 'Job satisfaction, meaning, engagement, and mental wellbeing',
  metrics: Object.values(PsychologicalMetrics),
  defaultWeight: 0.25,
  importanceByHorizon: {
    immediate: 0.25,
    short_term: 0.25,
    medium_term: 0.25,
    long_term: 0.25,
    lifetime: 0.25,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requiresAllMetrics: false,
  minMetricsForScore: 3,
  applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term', 'lifetime'],
  confidence: 'established',
  tags: ['happiness', 'satisfaction', 'meaning', 'mental-health'],
};

/**
 * Lifestyle Outcomes Dimension
 * Quality of life and work-life balance outcomes
 */
export const LifestyleDimension: OutcomeDimension = {
  id: 'dimension_lifestyle',
  category: OutcomeCategory.LIFESTYLE,
  name: 'Lifestyle Outcomes',
  description: 'Work-life balance, flexibility, and quality of life factors',
  metrics: Object.values(LifestyleMetrics),
  defaultWeight: 0.20,
  importanceByHorizon: {
    immediate: 0.15,
    short_term: 0.20,
    medium_term: 0.20,
    long_term: 0.20,
    lifetime: 0.25,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requiresAllMetrics: false,
  minMetricsForScore: 2,
  applicableHorizons: ['immediate', 'short_term', 'medium_term', 'long_term', 'lifetime'],
  confidence: 'established',
  tags: ['balance', 'flexibility', 'quality-of-life', 'time'],
};

/**
 * Career Outcomes Dimension
 * Professional growth and advancement outcomes
 */
export const CareerDimension: OutcomeDimension = {
  id: 'dimension_career',
  category: OutcomeCategory.CAREER,
  name: 'Career Outcomes',
  description: 'Professional growth, promotions, skill development, and career trajectory',
  metrics: Object.values(CareerMetrics),
  defaultWeight: 0.15,
  importanceByHorizon: {
    immediate: 0.10,
    short_term: 0.15,
    medium_term: 0.25,
    long_term: 0.30,
    lifetime: 0.30,
  },
  aggregationMethod: AggregationMethod.WEIGHTED_AVERAGE,
  requiresAllMetrics: false,
  minMetricsForScore: 2,
  applicableHorizons: ['short_term', 'medium_term', 'long_term', 'lifetime'],
  confidence: 'probable',
  tags: ['growth', 'promotion', 'advancement', 'skills'],
};

/**
 * All standard dimensions
 */
export const AllOutcomeDimensions = [
  FinancialDimension,
  EducationalDimension,
  PsychologicalDimension,
  LifestyleDimension,
  CareerDimension,
] as const;

/**
 * Dimension lookup by category
 */
export const DimensionByCategory: Record<OutcomeCategory, OutcomeDimension> = {
  [OutcomeCategory.FINANCIAL]: FinancialDimension,
  [OutcomeCategory.EDUCATIONAL]: EducationalDimension,
  [OutcomeCategory.PSYCHOLOGICAL]: PsychologicalDimension,
  [OutcomeCategory.LIFESTYLE]: LifestyleDimension,
  [OutcomeCategory.CAREER]: CareerDimension,
};

// ============================================
// DIMENSION SCORING FUNCTIONS
// ============================================

/**
 * Calculate dimension score from metric measurements
 */
export function calculateDimensionScore(
  dimension: OutcomeDimension,
  measurements: MetricMeasurement[],
  horizon: TimeHorizon,
  customWeight?: OutcomeWeight
): DimensionScore {
  const weight = customWeight ?? dimension.importanceByHorizon[horizon] ?? dimension.defaultWeight;
  
  // Map measurements by metric ID
  const measurementMap = new Map(measurements.map(m => [m.metricId, m]));
  
  // Calculate scores for each metric in dimension
  const metricScores: MetricScoreDetail[] = [];
  const missingMetrics: OutcomeId[] = [];
  
  let totalWeight = 0;
  
  for (const metric of dimension.metrics) {
    const measurement = measurementMap.get(metric.id);
    
    if (!measurement) {
      missingMetrics.push(metric.id);
      continue;
    }
    
    const metricWeight = metric.categoryWeight;
    totalWeight += metricWeight;
    
    metricScores.push({
      metricId: metric.id,
      metricName: metric.name,
      rawScore: measurement.rawScore,
      normalizedScore: measurement.rawScore,
      weightedScore: measurement.rawScore * metricWeight,
      weight: metricWeight,
      contribution: 0, // Calculated below
    });
  }
  
  // Check minimum metrics requirement
  if (metricScores.length < dimension.minMetricsForScore) {
    return createEmptyDimensionScore(dimension, horizon, missingMetrics);
  }
  
  // Calculate overall dimension score
  let overallScore: OutcomeScore;
  
  switch (dimension.aggregationMethod) {
    case AggregationMethod.WEIGHTED_AVERAGE:
      overallScore = metricScores.reduce((sum, ms) => sum + ms.weightedScore, 0) / totalWeight;
      break;
    case AggregationMethod.ARITHMETIC_MEAN:
      overallScore = metricScores.reduce((sum, ms) => sum + ms.rawScore, 0) / metricScores.length;
      break;
    case AggregationMethod.GEOMETRIC_MEAN:
      overallScore = Math.pow(
        metricScores.reduce((product, ms) => product * ms.rawScore, 1),
        1 / metricScores.length
      );
      break;
    case AggregationMethod.MINIMUM:
      overallScore = Math.min(...metricScores.map(ms => ms.rawScore));
      break;
    case AggregationMethod.MAXIMUM:
      overallScore = Math.max(...metricScores.map(ms => ms.rawScore));
      break;
    case AggregationMethod.MEDIAN:
      overallScore = calculateMedian(metricScores.map(ms => ms.rawScore));
      break;
    default:
      overallScore = metricScores.reduce((sum, ms) => sum + ms.weightedScore, 0) / totalWeight;
  }
  
  // Calculate contribution percentages
  const totalWeightedScore = metricScores.reduce((sum, ms) => sum + ms.weightedScore, 0);
  const scoresWithContribution = metricScores.map(ms => ({
    ...ms,
    contribution: totalWeightedScore > 0 ? ms.weightedScore / totalWeightedScore : 0,
  }));
  
  return {
    dimensionId: dimension.id,
    category: dimension.category,
    overallScore: clampScore(overallScore),
    weightedScore: clampScore(overallScore * weight),
    band: scoreToBand(overallScore),
    metricScores: scoresWithContribution,
    confidence: dimension.confidence,
    horizon,
    calculatedAt: new Date(),
    missingMetrics,
  };
}

/**
 * Create empty dimension score when insufficient data
 */
function createEmptyDimensionScore(
  dimension: OutcomeDimension,
  horizon: TimeHorizon,
  missingMetrics: OutcomeId[]
): DimensionScore {
  return {
    dimensionId: dimension.id,
    category: dimension.category,
    overallScore: 0,
    weightedScore: 0,
    band: ScoreBand.CRITICAL,
    metricScores: [],
    confidence: 'speculative',
    horizon,
    calculatedAt: new Date(),
    missingMetrics,
  };
}

/**
 * Calculate median of an array
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Clamp score to 0-1 range
 */
function clampScore(score: number): OutcomeScore {
  return Math.max(0, Math.min(1, score));
}

/**
 * Convert score to band
 */
function scoreToBand(score: OutcomeScore): ScoreBand {
  if (score < 0.2) return ScoreBand.CRITICAL;
  if (score < 0.4) return ScoreBand.POOR;
  if (score < 0.6) return ScoreBand.MODERATE;
  if (score < 0.8) return ScoreBand.GOOD;
  return ScoreBand.EXCELLENT;
}

/**
 * Get dimension by category
 */
export function getDimensionByCategory(category: OutcomeCategory): OutcomeDimension {
  return DimensionByCategory[category];
}

/**
 * Get all dimensions
 */
export function getAllDimensions(): OutcomeDimension[] {
  return AllOutcomeDimensions as unknown as OutcomeDimension[];
}
