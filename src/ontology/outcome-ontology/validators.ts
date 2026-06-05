/**
 * Outcome Ontology - Validators & Type Guards
 * 
 * Runtime validation and type checking for outcome entities.
 */

import {
  OutcomeScore,
  OutcomeWeight,
  OutcomeId,
  MetricValue,
  TimeHorizon,
  ConfidenceLevel,
  OutcomeCategory,
  MetricType,
  OptimizationDirection,
  AggregationMethod,
  ScoreBand,
} from './types';

import { OutcomeMetric, MetricMeasurement, MetricValidationRules } from './OutcomeMetric';
import { OutcomeDimension, DimensionScore } from './OutcomeDimension';
import { OutcomeAssessment, ScoringConfiguration } from './OutcomeScoringFramework';

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if value is a valid OutcomeScore (0-1)
 */
export function isValidOutcomeScore(score: unknown): score is OutcomeScore {
  return typeof score === 'number' && score >= 0 && score <= 1 && !isNaN(score);
}

/**
 * Check if value is a valid OutcomeWeight (0-1)
 */
export function isValidOutcomeWeight(weight: unknown): weight is OutcomeWeight {
  return typeof weight === 'number' && weight >= 0 && weight <= 1 && !isNaN(weight);
}

/**
 * Check if value is a valid OutcomeId (non-empty string)
 */
export function isValidOutcomeId(id: unknown): id is OutcomeId {
  return typeof id === 'string' && id.length > 0 && /^[a-z0-9_-]+$/.test(id);
}

/**
 * Check if value is a valid TimeHorizon
 */
export function isValidTimeHorizon(horizon: unknown): horizon is TimeHorizon {
  return typeof horizon === 'string' && 
    ['immediate', 'short_term', 'medium_term', 'long_term', 'lifetime'].includes(horizon);
}

/**
 * Check if value is a valid ConfidenceLevel
 */
export function isValidConfidenceLevel(level: unknown): level is ConfidenceLevel {
  return typeof level === 'string' && 
    ['established', 'probable', 'projected', 'speculative'].includes(level);
}

/**
 * Check if value is a valid OutcomeCategory
 */
export function isValidOutcomeCategory(category: unknown): category is OutcomeCategory {
  return typeof category === 'string' && 
    ['financial', 'educational', 'psychological', 'lifestyle', 'career'].includes(category);
}

/**
 * Check if value is a valid MetricType
 */
export function isValidMetricType(type: unknown): type is MetricType {
  const validTypes = ['currency', 'percentage', 'normalized', 'count', 'boolean', 'ordinal', 'nominal', 'duration', 'rating'];
  return typeof type === 'string' && validTypes.includes(type);
}

/**
 * Check if value is a valid OptimizationDirection
 */
export function isValidOptimizationDirection(direction: unknown): direction is OptimizationDirection {
  return typeof direction === 'string' && 
    ['maximize', 'minimize', 'target'].includes(direction);
}

/**
 * Check if value is a valid AggregationMethod
 */
export function isValidAggregationMethod(method: unknown): method is AggregationMethod {
  return typeof method === 'string' && 
    ['weighted_average', 'arithmetic_mean', 'geometric_mean', 'minimum', 'maximum', 'median'].includes(method);
}

/**
 * Check if value is a valid ScoreBand
 */
export function isValidScoreBand(band: unknown): band is ScoreBand {
  return typeof band === 'string' && 
    ['critical', 'poor', 'moderate', 'good', 'excellent'].includes(band);
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Validate an OutcomeMetric
 */
export function validateOutcomeMetric(metric: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!metric || typeof metric !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Metric must be an object' }] };
  }

  const m = metric as Record<string, unknown>;

  // Required fields
  if (!isValidOutcomeId(m.id)) {
    errors.push({ field: 'id', message: 'Invalid metric ID', value: m.id });
  }

  if (typeof m.slug !== 'string' || m.slug.length === 0) {
    errors.push({ field: 'slug', message: 'Slug must be a non-empty string', value: m.slug });
  }

  if (typeof m.name !== 'string' || m.name.length === 0) {
    errors.push({ field: 'name', message: 'Name must be a non-empty string', value: m.name });
  }

  if (typeof m.description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string', value: m.description });
  }

  if (!isValidOutcomeCategory(m.category)) {
    errors.push({ field: 'category', message: 'Invalid category', value: m.category });
  }

  if (!isValidMetricType(m.metricType)) {
    errors.push({ field: 'metricType', message: 'Invalid metric type', value: m.metricType });
  }

  if (typeof m.unit !== 'string') {
    errors.push({ field: 'unit', message: 'Unit must be a string', value: m.unit });
  }

  if (!isValidOptimizationDirection(m.direction)) {
    errors.push({ field: 'direction', message: 'Invalid optimization direction', value: m.direction });
  }

  // Range validation
  if (typeof m.minValue !== 'number') {
    errors.push({ field: 'minValue', message: 'minValue must be a number', value: m.minValue });
  }

  if (typeof m.maxValue !== 'number') {
    errors.push({ field: 'maxValue', message: 'maxValue must be a number', value: m.maxValue });
  }

  if (typeof m.minValue === 'number' && typeof m.maxValue === 'number' && m.minValue >= m.maxValue) {
    errors.push({ field: 'range', message: 'minValue must be less than maxValue' });
  }

  // Array validations
  if (!Array.isArray(m.applicableHorizons) || m.applicableHorizons.some(h => !isValidTimeHorizon(h))) {
    errors.push({ field: 'applicableHorizons', message: 'Invalid time horizons', value: m.applicableHorizons });
  }

  if (!Array.isArray(m.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array', value: m.tags });
  }

  if (!Array.isArray(m.relatedMetrics)) {
    errors.push({ field: 'relatedMetrics', message: 'relatedMetrics must be an array', value: m.relatedMetrics });
  }

  // Weight validation
  if (!isValidOutcomeWeight(m.defaultWeight)) {
    errors.push({ field: 'defaultWeight', message: 'defaultWeight must be between 0 and 1', value: m.defaultWeight });
  }

  if (!isValidOutcomeWeight(m.categoryWeight)) {
    errors.push({ field: 'categoryWeight', message: 'categoryWeight must be between 0 and 1', value: m.categoryWeight });
  }

  // Confidence validation
  if (!isValidConfidenceLevel(m.confidence)) {
    errors.push({ field: 'confidence', message: 'Invalid confidence level', value: m.confidence });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate an OutcomeDimension
 */
export function validateOutcomeDimension(dimension: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!dimension || typeof dimension !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Dimension must be an object' }] };
  }

  const d = dimension as Record<string, unknown>;

  if (!isValidOutcomeId(d.id)) {
    errors.push({ field: 'id', message: 'Invalid dimension ID', value: d.id });
  }

  if (!isValidOutcomeCategory(d.category)) {
    errors.push({ field: 'category', message: 'Invalid category', value: d.category });
  }

  if (typeof d.name !== 'string' || d.name.length === 0) {
    errors.push({ field: 'name', message: 'Name must be a non-empty string', value: d.name });
  }

  if (!Array.isArray(d.metrics)) {
    errors.push({ field: 'metrics', message: 'Metrics must be an array', value: d.metrics });
  }

  if (!isValidOutcomeWeight(d.defaultWeight)) {
    errors.push({ field: 'defaultWeight', message: 'defaultWeight must be between 0 and 1', value: d.defaultWeight });
  }

  if (!isValidAggregationMethod(d.aggregationMethod)) {
    errors.push({ field: 'aggregationMethod', message: 'Invalid aggregation method', value: d.aggregationMethod });
  }

  if (typeof d.requiresAllMetrics !== 'boolean') {
    errors.push({ field: 'requiresAllMetrics', message: 'requiresAllMetrics must be boolean', value: d.requiresAllMetrics });
  }

  if (typeof d.minMetricsForScore !== 'number' || d.minMetricsForScore < 1) {
    errors.push({ field: 'minMetricsForScore', message: 'minMetricsForScore must be at least 1', value: d.minMetricsForScore });
  }

  if (!Array.isArray(d.applicableHorizons) || d.applicableHorizons.some(h => !isValidTimeHorizon(h))) {
    errors.push({ field: 'applicableHorizons', message: 'Invalid time horizons', value: d.applicableHorizons });
  }

  if (!isValidConfidenceLevel(d.confidence)) {
    errors.push({ field: 'confidence', message: 'Invalid confidence level', value: d.confidence });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a MetricMeasurement
 */
export function validateMetricMeasurement(measurement: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!measurement || typeof measurement !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Measurement must be an object' }] };
  }

  const m = measurement as Record<string, unknown>;

  if (!isValidOutcomeId(m.metricId)) {
    errors.push({ field: 'metricId', message: 'Invalid metric ID', value: m.metricId });
  }

  if (!isValidOutcomeScore(m.rawScore)) {
    errors.push({ field: 'rawScore', message: 'rawScore must be between 0 and 1', value: m.rawScore });
  }

  if (!isValidOutcomeScore(m.weightedScore)) {
    errors.push({ field: 'weightedScore', message: 'weightedScore must be between 0 and 1', value: m.weightedScore });
  }

  if (!isValidTimeHorizon(m.horizon)) {
    errors.push({ field: 'horizon', message: 'Invalid time horizon', value: m.horizon });
  }

  if (!(m.measuredAt instanceof Date)) {
    errors.push({ field: 'measuredAt', message: 'measuredAt must be a Date', value: m.measuredAt });
  }

  if (!isValidConfidenceLevel(m.confidence)) {
    errors.push({ field: 'confidence', message: 'Invalid confidence level', value: m.confidence });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a DimensionScore
 */
export function validateDimensionScore(score: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!score || typeof score !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Score must be an object' }] };
  }

  const s = score as Record<string, unknown>;

  if (!isValidOutcomeId(s.dimensionId)) {
    errors.push({ field: 'dimensionId', message: 'Invalid dimension ID', value: s.dimensionId });
  }

  if (!isValidOutcomeCategory(s.category)) {
    errors.push({ field: 'category', message: 'Invalid category', value: s.category });
  }

  if (!isValidOutcomeScore(s.overallScore)) {
    errors.push({ field: 'overallScore', message: 'overallScore must be between 0 and 1', value: s.overallScore });
  }

  if (!isValidOutcomeScore(s.weightedScore)) {
    errors.push({ field: 'weightedScore', message: 'weightedScore must be between 0 and 1', value: s.weightedScore });
  }

  if (!isValidScoreBand(s.band)) {
    errors.push({ field: 'band', message: 'Invalid score band', value: s.band });
  }

  if (!Array.isArray(s.metricScores)) {
    errors.push({ field: 'metricScores', message: 'metricScores must be an array', value: s.metricScores });
  }

  if (!isValidTimeHorizon(s.horizon)) {
    errors.push({ field: 'horizon', message: 'Invalid time horizon', value: s.horizon });
  }

  if (!(s.calculatedAt instanceof Date)) {
    errors.push({ field: 'calculatedAt', message: 'calculatedAt must be a Date', value: s.calculatedAt });
  }

  if (!Array.isArray(s.missingMetrics)) {
    errors.push({ field: 'missingMetrics', message: 'missingMetrics must be an array', value: s.missingMetrics });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a ScoringConfiguration
 */
export function validateScoringConfiguration(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: [{ field: 'root', message: 'Config must be an object' }] };
  }

  const c = config as Record<string, unknown>;

  if (c.defaultHorizon !== undefined && !isValidTimeHorizon(c.defaultHorizon)) {
    errors.push({ field: 'defaultHorizon', message: 'Invalid default horizon', value: c.defaultHorizon });
  }

  if (c.dimensionWeights !== undefined) {
    if (typeof c.dimensionWeights !== 'object') {
      errors.push({ field: 'dimensionWeights', message: 'dimensionWeights must be an object', value: c.dimensionWeights });
    } else {
      const weights = c.dimensionWeights as Record<string, unknown>;
      for (const category of Object.values(OutcomeCategory)) {
        if (!isValidOutcomeWeight(weights[category])) {
          errors.push({ field: `dimensionWeights.${category}`, message: 'Invalid weight', value: weights[category] });
        }
      }
    }
  }

  if (c.aggregationMethod !== undefined && !isValidAggregationMethod(c.aggregationMethod)) {
    errors.push({ field: 'aggregationMethod', message: 'Invalid aggregation method', value: c.aggregationMethod });
  }

  if (c.minDimensionsForScore !== undefined && (typeof c.minDimensionsForScore !== 'number' || c.minDimensionsForScore < 1)) {
    errors.push({ field: 'minDimensionsForScore', message: 'minDimensionsForScore must be at least 1', value: c.minDimensionsForScore });
  }

  if (c.confidenceThreshold !== undefined && !isValidOutcomeScore(c.confidenceThreshold)) {
    errors.push({ field: 'confidenceThreshold', message: 'confidenceThreshold must be between 0 and 1', value: c.confidenceThreshold });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate a metric value against rules
 */
export function validateMetricValue(
  value: MetricValue,
  rules?: MetricValidationRules
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!rules) {
    return { isValid: true, errors };
  }

  if (rules.required && (value === null || value === undefined)) {
    errors.push({ field: 'value', message: 'Value is required', value });
    return { isValid: false, errors };
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push({ field: 'value', message: `Value must be at least ${rules.min}`, value });
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push({ field: 'value', message: `Value must be at most ${rules.max}`, value });
    }

    if (rules.precision !== undefined) {
      const multiplier = Math.pow(10, rules.precision);
      const rounded = Math.round(value * multiplier) / multiplier;
      if (value !== rounded) {
        errors.push({ field: 'value', message: `Value must have at most ${rules.precision} decimal places`, value });
      }
    }
  }

  if (typeof value === 'string' && rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push({ field: 'value', message: `Value must be one of: ${rules.allowedValues.join(', ')}`, value });
  }

  return { isValid: errors.length === 0, errors };
}

// ============================================
// ASSERTION FUNCTIONS
// ============================================

/**
 * Assert that value is a valid OutcomeScore
 */
export function assertValidOutcomeScore(score: unknown): asserts score is OutcomeScore {
  if (!isValidOutcomeScore(score)) {
    throw new Error(`Invalid outcome score: ${score}. Must be a number between 0 and 1.`);
  }
}

/**
 * Assert that value is a valid OutcomeMetric
 */
export function assertValidOutcomeMetric(metric: unknown): asserts metric is OutcomeMetric {
  const result = validateOutcomeMetric(metric);
  if (!result.isValid) {
    throw new Error(`Invalid OutcomeMetric: ${result.errors.map(e => e.message).join(', ')}`);
  }
}

/**
 * Assert that value is a valid OutcomeDimension
 */
export function assertValidOutcomeDimension(dimension: unknown): asserts dimension is OutcomeDimension {
  const result = validateOutcomeDimension(dimension);
  if (!result.isValid) {
    throw new Error(`Invalid OutcomeDimension: ${result.errors.map(e => e.message).join(', ')}`);
  }
}
