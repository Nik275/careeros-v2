/**
 * Outcome Ontology
 * 
 * Comprehensive system for defining, measuring, and evaluating career outcomes.
 * 
 * ## Overview
 * 
 * The Outcome Ontology provides a structured framework for assessing career outcomes
 * across five key dimensions: Financial, Educational, Psychological, Lifestyle, and Career.
 * 
 * ## Key Components
 * 
 * - OutcomeMetric: Individual measurable indicators (income, satisfaction, etc.)
 * - OutcomeDimension: Groups of related metrics by category
 * - OutcomeScoringFramework: Evaluation engine for comprehensive assessment
 * - Builders: Fluent API for constructing measurements and assessments
 * - Validators: Runtime validation and type guards
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { 
 *   createAssessment, 
 *   createMeasurement,
 *   FinancialMetrics,
 *   ScoringPresets 
 * } from '@/ontology/outcome-ontology';
 * 
 * // Create measurements
 * const income = createMeasurement(
 *   FinancialMetrics.INCOME,
 *   1200000,
 *   'medium_term'
 * );
 * 
 * // Create assessment
 * const assessment = createAssessment(
 *   'career-software-engineer',
 *   [income],
 *   'medium_term',
 *   ScoringPresets.balanced()
 * );
 * 
 * console.log(assessment.overallScore);
 * ```
 */

// ============================================
// TYPES & ENUMS
// ============================================

export type {
  OutcomeScore,
  OutcomeWeight,
  OutcomeId,
  OutcomeSlug,
  MetricUnit,
  TimeHorizon,
  ConfidenceLevel,
  MetricValue,
} from './types';

export {
  OutcomeCategory,
  MetricType,
  OptimizationDirection,
  ScoreBand,
  AggregationMethod,
} from './types';

// ============================================
// METRICS
// ============================================

export type {
  OutcomeMetric,
  MetricMeasurement,
  MetricValidationRules,
  MetricScoreDetail,
} from './OutcomeMetric';

export {
  FinancialMetrics,
  EducationalMetrics,
  PsychologicalMetrics,
  LifestyleMetrics,
  CareerMetrics,
  AllOutcomeMetrics,
  getMetricById,
  getMetricBySlug,
  getMetricsByCategory,
} from './OutcomeMetric';

// ============================================
// DIMENSIONS
// ============================================

export type {
  OutcomeDimension,
  DimensionScore,
} from './OutcomeDimension';

export {
  FinancialDimension,
  EducationalDimension,
  PsychologicalDimension,
  LifestyleDimension,
  CareerDimension,
  AllOutcomeDimensions,
  DimensionByCategory,
  calculateDimensionScore,
  getDimensionByCategory,
  getAllDimensions,
} from './OutcomeDimension';

// ============================================
// SCORING FRAMEWORK
// ============================================

export { OutcomeScoringFramework } from './OutcomeScoringFramework';

export type {
  OutcomeAssessment,
  ScoringConfiguration,
  OutcomeAnalysis,
  OpportunityAnalysis,
  RiskAnalysis,
  TradeoffAnalysis,
  Recommendation,
  ComparativeAnalysis,
  DimensionDelta,
  SensitivityAnalysis,
  MetricSensitivity,
  DimensionSensitivity,
} from './OutcomeScoringFramework';

export {
  DefaultScoringConfiguration,
  HorizonWeightConfigurations,
  createScoringFramework,
  normalizeValue,
  createMetricMeasurement,
} from './OutcomeScoringFramework';

// ============================================
// VALIDATORS
// ============================================

export {
  isValidOutcomeScore,
  isValidOutcomeWeight,
  isValidOutcomeId,
  isValidTimeHorizon,
  isValidConfidenceLevel,
  isValidOutcomeCategory,
  isValidMetricType,
  isValidOptimizationDirection,
  isValidAggregationMethod,
  isValidScoreBand,
  validateOutcomeMetric,
  validateOutcomeDimension,
  validateMetricMeasurement,
  validateDimensionScore,
  validateScoringConfiguration,
  validateMetricValue,
  assertValidOutcomeScore,
  assertValidOutcomeMetric,
  assertValidOutcomeDimension,
} from './validators';

export type {
  ValidationResult,
  ValidationError,
} from './validators';

// ============================================
// BUILDERS
// ============================================

export {
  MetricMeasurementBuilder,
  OutcomeAssessmentBuilder,
  BatchMeasurementBuilder,
  createMeasurement,
  createAssessment,
  createMeasurementsFromRecord,
  ScoringPresets,
} from './builders';
