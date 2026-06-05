/**
 * Signal Normalization Engine
 *
 * Converts different scales, formats, and source types into unified market signals.
 *
 * Capabilities:
 *   - Scale normalization (to 0-1 range)
 *   - Format conversion
 *   - Unit conversion
 *   - Outlier detection and handling
 *   - Confidence calculation
 *
 * Design Principles:
 *   - Deterministic transformations
 *   - Reversible when possible
 *   - Preserves original values
 *   - Explainable normalization
 */

import type {
  RawMarketSignal,
  NormalizedMarketSignal,
  NormalizedEntityType,
  NormalizedSignalType,
  SignalQualityMetrics,
  ValidationResult,
} from './types.js';

// ============================================================================
// NORMALIZATION RULES
// ============================================================================

/**
 * Scale definition for normalization.
 */
interface ValueScale {
  min: number;
  max: number;
  inverted?: boolean; // If true, higher raw = lower normalized
}

/**
 * Normalization rules by signal type.
 */
const NORMALIZATION_RULES: Record<NormalizedSignalType, ValueScale> = {
  'demand': { min: 0, max: 10000 }, // Job postings count
  'salary': { min: 300000, max: 5000000 }, // INR annual (3L to 50L)
  'salary-growth': { min: -0.2, max: 0.5 }, // -20% to +50%
  'competition': { min: 0, max: 1000 }, // Applicants per position
  'growth': { min: -0.3, max: 1.0 }, // -30% to +100%
  'automation-risk': { min: 0, max: 1 }, // 0-1 probability
  'skill-demand': { min: 0, max: 10000 }, // Job mentions
  'skill-growth': { min: -0.5, max: 2.0 }, // -50% to +200%
  'skill-scarcity': { min: 0, max: 1 }, // 0-1 scarcity score
  'exam-difficulty': { min: 0, max: 100 }, // Percentile difficulty
  'exam-competition': { min: 0, max: 1000000 }, // Total applicants
  'regional-opportunity': { min: 0, max: 10000 }, // Job count
  'job-availability': { min: 0, max: 50000 }, // Open positions
  'hiring-rate': { min: 0, max: 1 }, // 0-1 ratio
  'investment': { min: 0, max: 100000000000 }, // INR funding (0 to 100B)
};

/**
 * Entity type mapping from raw to normalized.
 */
const ENTITY_TYPE_MAP: Record<string, NormalizedEntityType> = {
  'career': 'career',
  'job': 'career',
  'profession': 'career',
  'occupation': 'career',
  'skill': 'skill',
  'competency': 'skill',
  'capability': 'skill',
  'industry': 'industry',
  'sector': 'industry',
  'domain': 'industry',
  'region': 'region',
  'city': 'region',
  'location': 'region',
  'state': 'region',
  'exam': 'exam',
  'test': 'exam',
  'examination': 'exam',
  'education': 'education-path',
  'degree': 'education-path',
  'course': 'education-path',
  'company': 'company',
  'organization': 'company',
  'employer': 'company',
  'role': 'role',
  'position': 'role',
  'title': 'role',
};

/**
 * Metric type mapping from raw to normalized.
 */
const METRIC_TYPE_MAP: Record<string, NormalizedSignalType> = {
  'demand': 'demand',
  'job-demand': 'demand',
  'market-demand': 'demand',
  'openings': 'demand',
  'vacancies': 'demand',
  'salary': 'salary',
  'compensation': 'salary',
  'pay': 'salary',
  'ctc': 'salary',
  'salary-growth': 'salary-growth',
  'compensation-growth': 'salary-growth',
  'competition': 'competition',
  'competitive': 'competition',
  'applicants': 'competition',
  'growth': 'growth',
  'growth-rate': 'growth',
  'expansion': 'growth',
  'automation': 'automation-risk',
  'automation-risk': 'automation-risk',
  'ai-risk': 'automation-risk',
  'skill': 'skill-demand',
  'skill-demand': 'skill-demand',
  'skill-popularity': 'skill-demand',
  'skill-growth': 'skill-growth',
  'skill-scarcity': 'skill-scarcity',
  'scarcity': 'skill-scarcity',
  'exam': 'exam-difficulty',
  'exam-difficulty': 'exam-difficulty',
  'exam-competition': 'exam-competition',
  'regional': 'regional-opportunity',
  'regional-opportunity': 'regional-opportunity',
  'location': 'regional-opportunity',
  'job-availability': 'job-availability',
  'availability': 'job-availability',
  'hiring': 'hiring-rate',
  'hiring-rate': 'hiring-rate',
  'investment': 'investment',
  'funding': 'investment',
};

// ============================================================================
// SIGNAL NORMALIZATION ENGINE
// ============================================================================

/**
 * Engine for normalizing raw market signals.
 */
export class SignalNormalizationEngine {
  private outlierThreshold: number;
  private outlierDetectionEnabled: boolean;

  constructor(options: {
    outlierThreshold?: number;
    outlierDetectionEnabled?: boolean;
  } = {}) {
    this.outlierThreshold = options.outlierThreshold ?? 3;
    this.outlierDetectionEnabled = options.outlierDetectionEnabled ?? true;
  }

  /**
   * Normalize a raw market signal.
   */
  normalize(
    signal: RawMarketSignal,
    validationResult: ValidationResult
  ): NormalizedMarketSignal {
    const startTime = Date.now();

    // Determine normalized types
    const entityType = this.normalizeEntityType(signal.entity.type);
    const signalType = this.normalizeSignalType(signal.metric.type);

    // Convert raw value to number
    const rawNumericValue = this.convertToNumber(signal.metric.rawValue);

    // Normalize value to 0-1 scale
    const normalizedValue = this.normalizeValue(rawNumericValue, signalType);

    // Calculate confidence
    const confidence = this.calculateConfidence(signal, validationResult);

    // Calculate quality metrics
    const quality = this.calculateQualityMetrics(signal, validationResult);

    // Detect outliers
    const transformations: string[] = [];
    if (this.outlierDetectionEnabled && this.isOutlier(normalizedValue)) {
      transformations.push('outlier-detected');
    }

    // Record transformation
    transformations.push(`entity-type:${signal.entity.type}->${entityType}`);
    transformations.push(`metric-type:${signal.metric.type}->${signalType}`);
    transformations.push(`value-normalization:${rawNumericValue.toFixed(2)}->${normalizedValue.toFixed(4)}`);

    const processingDuration = Date.now() - startTime;

    return {
      id: `normalized_${signal.id}`,
      rawSignalId: signal.id,
      entityType,
      entityId: this.normalizeEntityId(signal.entity.id, entityType),
      signalType,
      normalizedValue,
      originalValue: rawNumericValue,
      originalUnit: signal.metric.unit,
      confidence,
      timestamp: signal.timestamp,
      source: {
        id: signal.source.id,
        name: signal.source.name,
        type: signal.source.sourceType,
        reliabilityScore: signal.source.reliabilityScore,
      },
      quality,
      processing: {
        normalizedAt: Date.now(),
        normalizationMethod: 'scale-mapping',
        validationResult,
        transformations,
        processingDurationMs: processingDuration,
      },
    };
  }

  /**
   * Normalize multiple signals.
   */
  normalizeBatch(
    signals: RawMarketSignal[],
    validationResults: Map<string, ValidationResult>
  ): NormalizedMarketSignal[] {
    return signals
      .map(signal => {
        const validation = validationResults.get(signal.id);
        if (!validation) {
          throw new Error(`No validation result for signal ${signal.id}`);
        }
        return this.normalize(signal, validation);
      })
      .filter(Boolean);
  }

  /**
   * Normalize entity type.
   */
  private normalizeEntityType(rawType: string): NormalizedEntityType {
    const normalized = ENTITY_TYPE_MAP[rawType.toLowerCase()];
    return normalized || 'career'; // Default fallback
  }

  /**
   * Normalize signal type.
   */
  private normalizeSignalType(rawType: string): NormalizedSignalType {
    const key = rawType.toLowerCase().replace(/\s+/g, '-');
    const normalized = METRIC_TYPE_MAP[key];
    return normalized || 'demand'; // Default fallback
  }

  /**
   * Normalize entity ID.
   */
  private normalizeEntityId(rawId: string, entityType: NormalizedEntityType): string {
    // Create standardized ID format: {type}:{normalized-id}
    const normalized = rawId
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${entityType}:${normalized}`;
  }

  /**
   * Convert raw value to number.
   */
  private convertToNumber(rawValue: number | string): number {
    if (typeof rawValue === 'number') {
      return rawValue;
    }

    // Remove common formatting
    const cleaned = rawValue
      .replace(/,/g, '')
      .replace(/\s+/g, '')
      .replace(/[^0-9.-]/g, '');

    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
      throw new Error(`Cannot convert value to number: ${rawValue}`);
    }

    return parsed;
  }

  /**
   * Normalize value to 0-1 scale.
   */
  private normalizeValue(value: number, signalType: NormalizedSignalType): number {
    const scale = NORMALIZATION_RULES[signalType];

    if (!scale) {
      // Fallback: assume 0-100 scale
      return Math.max(0, Math.min(1, value / 100));
    }

    // Apply scale
    let normalized = (value - scale.min) / (scale.max - scale.min);

    // Handle inverted scales
    if (scale.inverted) {
      normalized = 1 - normalized;
    }

    // Clamp to 0-1
    return Math.max(0, Math.min(1, normalized));
  }

  /**
   * Calculate confidence score.
   */
  private calculateConfidence(
    signal: RawMarketSignal,
    validation: ValidationResult
  ): number {
    // Base confidence from source reliability
    let confidence = signal.source.reliabilityScore;

    // Adjust by validation score
    confidence *= validation.score;

    // Adjust by source freshness
    const ageDays = (Date.now() - signal.timestamp) / (24 * 60 * 60 * 1000);
    const freshnessFactor = Math.exp(-ageDays / 30); // Decay over 30 days
    confidence *= freshnessFactor;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate quality metrics.
   */
  private calculateQualityMetrics(
    signal: RawMarketSignal,
    validation: ValidationResult
  ): SignalQualityMetrics {
    // Completeness
    const requiredFields = ['source', 'timestamp', 'entity', 'metric'];
    const hasAllFields = requiredFields.every(field => {
      if (field === 'entity') return signal.entity && signal.entity.id && signal.entity.type;
      if (field === 'metric') return signal.metric && signal.metric.rawValue !== undefined;
      return !!signal[field as keyof RawMarketSignal];
    });
    const completeness = hasAllFields ? 1.0 : 0.7;

    // Accuracy (based on validation)
    const accuracy = validation.score;

    // Timeliness
    const ageDays = (Date.now() - signal.timestamp) / (24 * 60 * 60 * 1000);
    const timeliness = Math.exp(-ageDays / 30);

    // Consistency (placeholder - would compare with existing signals)
    const consistency = 0.8;

    // Overall score
    const overallScore = (completeness + accuracy + timeliness + consistency) / 4;

    return {
      completeness,
      accuracy,
      timeliness,
      consistency,
      overallScore,
    };
  }

  /**
   * Check if value is an outlier.
   */
  private isOutlier(normalizedValue: number): boolean {
    // Simple outlier detection: values very close to 0 or 1 may be outliers
    return normalizedValue < 0.01 || normalizedValue > 0.99;
  }

  /**
   * Get normalization statistics.
   */
  getNormalizationStats(): {
    outlierThreshold: number;
    outlierDetectionEnabled: boolean;
    supportedTypes: NormalizedSignalType[];
  } {
    return {
      outlierThreshold: this.outlierThreshold,
      outlierDetectionEnabled: this.outlierDetectionEnabled,
      supportedTypes: Object.keys(NORMALIZATION_RULES) as NormalizedSignalType[],
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new SignalNormalizationEngine.
 */
export function createSignalNormalizationEngine(
  options?: {
    outlierThreshold?: number;
    outlierDetectionEnabled?: boolean;
  }
): SignalNormalizationEngine {
  return new SignalNormalizationEngine(options);
}

/**
 * Quick normalize a signal.
 */
export function quickNormalize(
  signal: RawMarketSignal,
  validationResult: ValidationResult
): NormalizedMarketSignal {
  const engine = new SignalNormalizationEngine();
  return engine.normalize(signal, validationResult);
}

/**
 * Get supported signal types.
 */
export function getSupportedSignalTypes(): NormalizedSignalType[] {
  return Object.keys(NORMALIZATION_RULES) as NormalizedSignalType[];
}

/**
 * Add custom normalization rule.
 */
export function addNormalizationRule(
  signalType: NormalizedSignalType,
  scale: { min: number; max: number; inverted?: boolean }
): void {
  NORMALIZATION_RULES[signalType] = scale;
}
