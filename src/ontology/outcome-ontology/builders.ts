/**
 * Outcome Ontology - Builders
 * 
 * Builder patterns for constructing outcome measurements and assessments.
 * Provides fluent API for creating valid outcome entities.
 */

import {
  OutcomeId,
  OutcomeScore,
  OutcomeWeight,
  TimeHorizon,
  ConfidenceLevel,
  OutcomeCategory,
  MetricType,
  OptimizationDirection,
  AggregationMethod,
  MetricValue,
} from './types';

import {
  OutcomeMetric,
  MetricMeasurement,
  MetricValidationRules,
  getMetricById,
} from './OutcomeMetric';

import {
  OutcomeDimension,
  DimensionScore,
} from './OutcomeDimension';

import {
  ScoringConfiguration,
  OutcomeAssessment,
  createScoringFramework,
} from './OutcomeScoringFramework';

import { validateMetricValue, assertValidOutcomeScore } from './validators';

// ============================================
// METRIC MEASUREMENT BUILDER
// ============================================

/**
 * Mutable measurement for building
 */
type MutableMetricMeasurement = {
  -readonly [K in keyof MetricMeasurement]: MetricMeasurement[K];
};

/**
 * Builder for creating MetricMeasurement instances
 */
export class MetricMeasurementBuilder {
  private measurement: Partial<MutableMetricMeasurement> = {
    measuredAt: new Date(),
    confidence: 'established',
  };
  private metric?: OutcomeMetric;

  /**
   * Set the metric definition
   */
  forMetric(metric: OutcomeMetric): this {
    this.metric = metric;
    this.measurement.metricId = metric.id;
    this.measurement.confidence = metric.confidence;
    return this;
  }

  /**
   * Set metric by ID (looks up metric definition)
   */
  forMetricId(metricId: OutcomeId): this {
    const metric = getMetricById(metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${metricId}`);
    }
    return this.forMetric(metric);
  }

  /**
   * Set raw value (will be normalized)
   */
  withRawValue(value: number): this {
    if (!this.metric) {
      throw new Error('Must call forMetric() before setting value');
    }

    this.measurement.value = value;
    this.measurement.rawScore = this.normalizeValue(value);
    this.measurement.weightedScore = this.measurement.rawScore * this.metric.categoryWeight;
    return this;
  }

  /**
   * Set pre-normalized score (0-1)
   */
  withNormalizedScore(score: OutcomeScore): this {
    assertValidOutcomeScore(score);
    
    this.measurement.value = score;
    this.measurement.rawScore = score;
    this.measurement.weightedScore = this.metric 
      ? score * this.metric.categoryWeight 
      : score;
    return this;
  }

  /**
   * Set time horizon
   */
  atHorizon(horizon: TimeHorizon): this {
    this.measurement.horizon = horizon;
    return this;
  }

  /**
   * Set confidence level
   */
  withConfidence(confidence: ConfidenceLevel): this {
    this.measurement.confidence = confidence;
    return this;
  }

  /**
   * Set data source
   */
  fromSource(source: string): this {
    this.measurement.source = source;
    return this;
  }

  /**
   * Add notes
   */
  withNotes(notes: string): this {
    this.measurement.notes = notes;
    return this;
  }

  /**
   * Set measurement date
   */
  measuredAt(date: Date): this {
    this.measurement.measuredAt = date;
    return this;
  }

  /**
   * Build the measurement
   */
  build(): MetricMeasurement {
    if (!this.metric) {
      throw new Error('Must specify a metric before building');
    }

    if (this.measurement.rawScore === undefined) {
      throw new Error('Must specify a value before building');
    }

    if (!this.measurement.horizon) {
      throw new Error('Must specify a time horizon before building');
    }

    return this.measurement as MetricMeasurement;
  }

  /**
   * Normalize value based on metric definition
   */
  private normalizeValue(value: number): OutcomeScore {
    if (!this.metric) return 0;

    const { minValue, maxValue, direction, targetValue } = this.metric;
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    let normalized = (clampedValue - minValue) / (maxValue - minValue);

    switch (direction) {
      case OptimizationDirection.MAXIMIZE:
        return normalized;
      case OptimizationDirection.MINIMIZE:
        return 1 - normalized;
      case OptimizationDirection.TARGET:
        if (targetValue === undefined) return normalized;
        const targetNormalized = (targetValue - minValue) / (maxValue - minValue);
        const distance = Math.abs(normalized - targetNormalized);
        return Math.max(0, 1 - distance * 2);
      default:
        return normalized;
    }
  }
}

// ============================================
// OUTCOME ASSESSMENT BUILDER
// ============================================

/**
 * Mutable configuration for building
 */
type MutableScoringConfiguration = {
  -readonly [K in keyof ScoringConfiguration]?: ScoringConfiguration[K];
};

/**
 * Builder for creating comprehensive OutcomeAssessment instances
 */
export class OutcomeAssessmentBuilder {
  private subjectId: string = '';
  private measurements: MetricMeasurement[] = [];
  private horizon: TimeHorizon = 'medium_term';
  private config: MutableScoringConfiguration = {};

  /**
   * Set subject ID (career, student, or scenario)
   */
  forSubject(subjectId: string): this {
    this.subjectId = subjectId;
    return this;
  }

  /**
   * Set time horizon
   */
  atHorizon(horizon: TimeHorizon): this {
    this.horizon = horizon;
    return this;
  }

  /**
   * Add a measurement
   */
  addMeasurement(measurement: MetricMeasurement): this {
    this.measurements.push(measurement);
    return this;
  }

  /**
   * Add multiple measurements
   */
  addMeasurements(measurements: MetricMeasurement[]): this {
    this.measurements.push(...measurements);
    return this;
  }

  /**
   * Add measurement using builder
   */
  withMetric(builderFn: (builder: MetricMeasurementBuilder) => MetricMeasurementBuilder): this {
    const builder = new MetricMeasurementBuilder();
    const measurement = builderFn(builder).build();
    this.measurements.push(measurement);
    return this;
  }

  /**
   * Set scoring configuration
   */
  withConfiguration(config: Partial<ScoringConfiguration>): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Set dimension weights
   */
  withDimensionWeights(weights: Partial<Record<OutcomeCategory, OutcomeWeight>>): this {
    this.config.dimensionWeights = {
      ...this.config.dimensionWeights,
      ...weights,
    } as Record<OutcomeCategory, OutcomeWeight>;
    return this;
  }

  /**
   * Set aggregation method
   */
  usingAggregation(method: AggregationMethod): this {
    this.config.aggregationMethod = method;
    return this;
  }

  /**
   * Build the assessment
   */
  build(): OutcomeAssessment {
    if (!this.subjectId) {
      throw new Error('Must specify a subject ID before building');
    }

    if (this.measurements.length === 0) {
      throw new Error('Must add at least one measurement before building');
    }

    const framework = createScoringFramework(this.config);
    return framework.calculateAssessment(this.subjectId, this.measurements, this.horizon);
  }
}

// ============================================
// BATCH MEASUREMENT BUILDER
// ============================================

/**
 * Builder for creating multiple measurements efficiently
 */
export class BatchMeasurementBuilder {
  private measurements: MetricMeasurement[] = [];
  private defaultHorizon: TimeHorizon = 'medium_term';
  private defaultSource?: string;

  /**
   * Set default horizon for all measurements
   */
  withDefaultHorizon(horizon: TimeHorizon): this {
    this.defaultHorizon = horizon;
    return this;
  }

  /**
   * Set default source for all measurements
   */
  withDefaultSource(source: string): this {
    this.defaultSource = source;
    return this;
  }

  /**
   * Add a measurement from raw value
   */
  add(
    metric: OutcomeMetric,
    rawValue: number,
    overrides?: Partial<Omit<MetricMeasurement, 'metricId' | 'value' | 'rawScore' | 'weightedScore'>>
  ): this {
    const builder = new MetricMeasurementBuilder()
      .forMetric(metric)
      .withRawValue(rawValue)
      .atHorizon(overrides?.horizon ?? this.defaultHorizon);

    if (this.defaultSource) {
      builder.fromSource(this.defaultSource);
    }

    if (overrides?.source) {
      builder.fromSource(overrides.source);
    }

    if (overrides?.confidence) {
      builder.withConfidence(overrides.confidence);
    }

    if (overrides?.notes) {
      builder.withNotes(overrides.notes);
    }

    if (overrides?.measuredAt) {
      builder.measuredAt(overrides.measuredAt);
    }

    this.measurements.push(builder.build());
    return this;
  }

  /**
   * Add a measurement by metric ID
   */
  addById(
    metricId: OutcomeId,
    rawValue: number,
    overrides?: Partial<Omit<MetricMeasurement, 'metricId' | 'value' | 'rawScore' | 'weightedScore'>>
  ): this {
    const metric = getMetricById(metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${metricId}`);
    }
    return this.add(metric, rawValue, overrides);
  }

  /**
   * Add multiple measurements at once
   */
  addMany(
    entries: Array<{
      metric: OutcomeMetric;
      value: number;
      overrides?: Partial<Omit<MetricMeasurement, 'metricId' | 'value' | 'rawScore' | 'weightedScore'>>;
    }>
  ): this {
    for (const entry of entries) {
      this.add(entry.metric, entry.value, entry.overrides);
    }
    return this;
  }

  /**
   * Build all measurements
   */
  build(): MetricMeasurement[] {
    return [...this.measurements];
  }

  /**
   * Build and clear
   */
  buildAndClear(): MetricMeasurement[] {
    const result = this.measurements;
    this.measurements = [];
    return result;
  }
}

// ============================================
// QUICK BUILDER FUNCTIONS
// ============================================

/**
 * Quick function to create a single measurement
 */
export function createMeasurement(
  metric: OutcomeMetric | OutcomeId,
  rawValue: number,
  horizon: TimeHorizon = 'medium_term',
  options?: {
    source?: string;
    confidence?: ConfidenceLevel;
    notes?: string;
  }
): MetricMeasurement {
  const builder = new MetricMeasurementBuilder();
  
  if (typeof metric === 'string') {
    builder.forMetricId(metric);
  } else {
    builder.forMetric(metric);
  }
  
  builder.withRawValue(rawValue).atHorizon(horizon);
  
  if (options?.source) builder.fromSource(options.source);
  if (options?.confidence) builder.withConfidence(options.confidence);
  if (options?.notes) builder.withNotes(options.notes);
  
  return builder.build();
}

/**
 * Quick function to create an assessment
 */
export function createAssessment(
  subjectId: string,
  measurements: MetricMeasurement[],
  horizon: TimeHorizon = 'medium_term',
  config?: Partial<ScoringConfiguration>
): OutcomeAssessment {
  return new OutcomeAssessmentBuilder()
    .forSubject(subjectId)
    .addMeasurements(measurements)
    .atHorizon(horizon)
    .withConfiguration(config ?? {})
    .build();
}

/**
 * Quick function to create measurements from a record
 */
export function createMeasurementsFromRecord(
  values: Record<OutcomeId, number>,
  horizon: TimeHorizon = 'medium_term',
  source?: string
): MetricMeasurement[] {
  const builder = new BatchMeasurementBuilder()
    .withDefaultHorizon(horizon);
  
  if (source) {
    builder.withDefaultSource(source);
  }

  for (const [metricId, value] of Object.entries(values)) {
    builder.addById(metricId, value);
  }

  return builder.build();
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

/**
 * Preset configurations for common use cases
 */
export const ScoringPresets = {
  /**
   * Balanced scoring - equal weight to all dimensions
   */
  balanced: (): Partial<ScoringConfiguration> => ({
    dimensionWeights: {
      [OutcomeCategory.FINANCIAL]: 0.20,
      [OutcomeCategory.EDUCATIONAL]: 0.20,
      [OutcomeCategory.PSYCHOLOGICAL]: 0.20,
      [OutcomeCategory.LIFESTYLE]: 0.20,
      [OutcomeCategory.CAREER]: 0.20,
    },
  }),

  /**
   * Income-focused scoring
   */
  incomeFocused: (): Partial<ScoringConfiguration> => ({
    dimensionWeights: {
      [OutcomeCategory.FINANCIAL]: 0.40,
      [OutcomeCategory.EDUCATIONAL]: 0.10,
      [OutcomeCategory.PSYCHOLOGICAL]: 0.15,
      [OutcomeCategory.LIFESTYLE]: 0.15,
      [OutcomeCategory.CAREER]: 0.20,
    },
  }),

  /**
   * Wellbeing-focused scoring
   */
  wellbeingFocused: (): Partial<ScoringConfiguration> => ({
    dimensionWeights: {
      [OutcomeCategory.FINANCIAL]: 0.15,
      [OutcomeCategory.EDUCATIONAL]: 0.10,
      [OutcomeCategory.PSYCHOLOGICAL]: 0.35,
      [OutcomeCategory.LIFESTYLE]: 0.30,
      [OutcomeCategory.CAREER]: 0.10,
    },
  }),

  /**
   * Growth-focused scoring
   */
  growthFocused: (): Partial<ScoringConfiguration> => ({
    dimensionWeights: {
      [OutcomeCategory.FINANCIAL]: 0.15,
      [OutcomeCategory.EDUCATIONAL]: 0.25,
      [OutcomeCategory.PSYCHOLOGICAL]: 0.15,
      [OutcomeCategory.LIFESTYLE]: 0.10,
      [OutcomeCategory.CAREER]: 0.35,
    },
  }),

  /**
   * Conservative scoring - emphasizes stability
   */
  conservative: (): Partial<ScoringConfiguration> => ({
    dimensionWeights: {
      [OutcomeCategory.FINANCIAL]: 0.30,
      [OutcomeCategory.EDUCATIONAL]: 0.15,
      [OutcomeCategory.PSYCHOLOGICAL]: 0.20,
      [OutcomeCategory.LIFESTYLE]: 0.25,
      [OutcomeCategory.CAREER]: 0.10,
    },
    aggregationMethod: AggregationMethod.MINIMUM,
  }),
};
