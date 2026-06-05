/**
 * Signal Validation Engine
 *
 * Detects issues in raw market signals:
 *   - Missing values
 *   - Invalid values
 *   - Duplicate signals
 *   - Outdated signals
 *
 * Design Principles:
 *   - Deterministic validation rules
 *   - Configurable strictness
 *   - Detailed issue reporting
 *   - Non-blocking warnings
 */

import type {
  RawMarketSignal,
  ValidationResult,
  ValidationIssue,
  ValidationWarning,
  NormalizedEntityType,
  NormalizedSignalType,
} from './types.js';

import {
  VALIDATION_ISSUE_TYPES,
  DEFAULT_INGESTION_CONFIG,
} from './types.js';

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Validation rule interface.
 */
interface ValidationRule {
  name: string;
  validate: (signal: RawMarketSignal) => ValidationIssue | null;
}

/**
 * Required fields for a valid signal.
 */
const REQUIRED_FIELDS = [
  'source',
  'timestamp',
  'entity.type',
  'entity.id',
  'entity.name',
  'metric.type',
  'metric.rawValue',
];

/**
 * Valid entity types.
 */
const VALID_ENTITY_TYPES: NormalizedEntityType[] = [
  'career',
  'skill',
  'industry',
  'region',
  'exam',
  'education-path',
  'company',
  'role',
];

/**
 * Valid signal types.
 */
const VALID_SIGNAL_TYPES: NormalizedSignalType[] = [
  'demand',
  'salary',
  'salary-growth',
  'competition',
  'growth',
  'automation-risk',
  'skill-demand',
  'skill-growth',
  'skill-scarcity',
  'exam-difficulty',
  'exam-competition',
  'regional-opportunity',
  'job-availability',
  'hiring-rate',
  'investment',
];

// ============================================================================
// SIGNAL VALIDATION ENGINE
// ============================================================================

/**
 * Engine for validating raw market signals.
 */
export class SignalValidationEngine {
  private processedSignalIds: Set<string> = new Set();
  private recentSignals: Map<string, number> = new Map(); // entity+metric -> timestamp
  private config: typeof DEFAULT_INGESTION_CONFIG.validationConfig;

  constructor(
    config: Partial<typeof DEFAULT_INGESTION_CONFIG.validationConfig> = {}
  ) {
    this.config = { ...DEFAULT_INGESTION_CONFIG.validationConfig, ...config };
  }

  /**
   * Validate a raw market signal.
   */
  validate(signal: RawMarketSignal): ValidationResult {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for missing values
    const missingValueIssue = this.checkMissingValues(signal);
    if (missingValueIssue) {
      issues.push(missingValueIssue);
    }

    // Check for invalid values
    const invalidValueIssue = this.checkInvalidValues(signal);
    if (invalidValueIssue) {
      issues.push(invalidValueIssue);
    }

    // Check for duplicate signals
    const duplicateIssue = this.checkDuplicate(signal);
    if (duplicateIssue) {
      issues.push(duplicateIssue);
    }

    // Check for outdated signals
    const outdatedIssue = this.checkOutdated(signal);
    if (outdatedIssue) {
      issues.push(outdatedIssue);
    }

    // Check entity type validity
    const entityTypeIssue = this.checkEntityType(signal);
    if (entityTypeIssue) {
      issues.push(entityTypeIssue);
    }

    // Check metric type validity
    const metricTypeIssue = this.checkMetricType(signal);
    if (metricTypeIssue) {
      issues.push(metricTypeIssue);
    }

    // Check source reliability
    const sourceIssue = this.checkSourceReliability(signal);
    if (sourceIssue) {
      warnings.push({
        type: 'low-reliability-source',
        description: `Source reliability score is ${signal.source.reliabilityScore}`,
        field: 'source.reliabilityScore',
      });
    }

    // Calculate validation score
    const score = this.calculateValidationScore(issues, warnings);

    // Determine if valid
    const isValid = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0;

    return {
      isValid: this.config.strictMode ? issues.length === 0 : isValid,
      score,
      issues,
      warnings,
    };
  }

  /**
   * Validate multiple signals in batch.
   */
  validateBatch(signals: RawMarketSignal[]): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();

    for (const signal of signals) {
      results.set(signal.id, this.validate(signal));
    }

    return results;
  }

  /**
   * Check for missing required values.
   */
  private checkMissingValues(signal: RawMarketSignal): ValidationIssue | null {
    const missingFields: string[] = [];

    if (!signal.source) missingFields.push('source');
    if (!signal.timestamp) missingFields.push('timestamp');
    if (!signal.entity) missingFields.push('entity');
    else {
      if (!signal.entity.type) missingFields.push('entity.type');
      if (!signal.entity.id) missingFields.push('entity.id');
      if (!signal.entity.name) missingFields.push('entity.name');
    }
    if (!signal.metric) missingFields.push('metric');
    else {
      if (!signal.metric.type) missingFields.push('metric.type');
      if (signal.metric.rawValue === undefined || signal.metric.rawValue === null) {
        missingFields.push('metric.rawValue');
      }
    }

    if (missingFields.length > 0) {
      return {
        type: 'missing-value',
        severity: 'critical',
        description: `Missing required fields: ${missingFields.join(', ')}`,
        field: missingFields[0],
        suggestedFix: 'Provide all required fields for the signal',
      };
    }

    return null;
  }

  /**
   * Check for invalid values.
   */
  private checkInvalidValues(signal: RawMarketSignal): ValidationIssue | null {
    // Check timestamp is valid
    if (signal.timestamp <= 0 || signal.timestamp > Date.now() + 86400000) {
      return {
        type: 'invalid-value',
        severity: 'high',
        description: `Invalid timestamp: ${signal.timestamp}`,
        field: 'timestamp',
        suggestedFix: 'Ensure timestamp is a valid Unix timestamp in milliseconds',
      };
    }

    // Check source reliability score is valid
    if (signal.source.reliabilityScore < 0 || signal.source.reliabilityScore > 1) {
      return {
        type: 'invalid-value',
        severity: 'medium',
        description: `Invalid reliability score: ${signal.source.reliabilityScore}`,
        field: 'source.reliabilityScore',
        suggestedFix: 'Reliability score must be between 0 and 1',
      };
    }

    // Check raw value is numeric if it should be
    const rawValue = signal.metric.rawValue;
    if (typeof rawValue === 'string') {
      const numericValue = parseFloat(rawValue);
      if (isNaN(numericValue)) {
        return {
          type: 'invalid-value',
          severity: 'high',
          description: `Non-numeric value: ${rawValue}`,
          field: 'metric.rawValue',
          suggestedFix: 'Provide a numeric value or numeric string',
        };
      }
    }

    return null;
  }

  /**
   * Check for duplicate signals.
   */
  private checkDuplicate(signal: RawMarketSignal): ValidationIssue | null {
    // Create duplicate key from entity + metric + approximate timestamp
    const dupKey = `${signal.entity.type}:${signal.entity.id}:${signal.metric.type}`;
    const existingTimestamp = this.recentSignals.get(dupKey);

    if (existingTimestamp) {
      const timeDiff = Math.abs(signal.timestamp - existingTimestamp);
      // Consider duplicate if within 1 hour and same entity/metric
      if (timeDiff < 3600000) {
        return {
          type: 'duplicate-signal',
          severity: 'medium',
          description: `Duplicate signal detected for ${dupKey} within 1 hour`,
          field: 'entity.id + metric.type',
          suggestedFix: 'Wait at least 1 hour before sending updates for same entity/metric',
        };
      }
    }

    // Track this signal
    this.recentSignals.set(dupKey, signal.timestamp);
    this.processedSignalIds.add(signal.id);

    return null;
  }

  /**
   * Check for outdated signals.
   */
  private checkOutdated(signal: RawMarketSignal): ValidationIssue | null {
    const now = Date.now();
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000;
    const ageMs = now - signal.timestamp;

    if (ageMs > maxAgeMs) {
      return {
        type: 'outdated-signal',
        severity: 'high',
        description: `Signal is ${Math.floor(ageMs / (24 * 60 * 60 * 1000))} days old (max: ${this.config.maxAgeDays})`,
        field: 'timestamp',
        suggestedFix: 'Provide more recent data or increase max age threshold',
      };
    }

    // Future timestamp (more than 1 day ahead)
    if (signal.timestamp > now + 86400000) {
      return {
        type: 'invalid-value',
        severity: 'medium',
        description: 'Signal timestamp is in the future',
        field: 'timestamp',
        suggestedFix: 'Ensure timestamp is not in the future',
      };
    }

    return null;
  }

  /**
   * Check entity type validity.
   */
  private checkEntityType(signal: RawMarketSignal): ValidationIssue | null {
    const entityType = signal.entity.type.toLowerCase();

    if (!VALID_ENTITY_TYPES.includes(entityType as NormalizedEntityType)) {
      return {
        type: 'invalid-entity',
        severity: 'medium',
        description: `Unknown entity type: ${entityType}`,
        field: 'entity.type',
        suggestedFix: `Use one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      };
    }

    return null;
  }

  /**
   * Check metric type validity.
   */
  private checkMetricType(signal: RawMarketSignal): ValidationIssue | null {
    const metricType = signal.metric.type.toLowerCase().replace(/\s+/g, '-');

    // Map common metric types to normalized types
    const metricTypeMap: Record<string, NormalizedSignalType> = {
      'demand': 'demand',
      'job-demand': 'demand',
      'market-demand': 'demand',
      'salary': 'salary',
      'compensation': 'salary',
      'pay': 'salary',
      'competition': 'competition',
      'competitive': 'competition',
      'growth': 'growth',
      'growth-rate': 'growth',
      'automation': 'automation-risk',
      'automation-risk': 'automation-risk',
      'skill': 'skill-demand',
      'skill-demand': 'skill-demand',
    };

    const normalizedType = metricTypeMap[metricType];

    if (!normalizedType || !VALID_SIGNAL_TYPES.includes(normalizedType)) {
      return {
        type: 'invalid-metric',
        severity: 'medium',
        description: `Unknown metric type: ${signal.metric.type}`,
        field: 'metric.type',
        suggestedFix: `Use one of: ${VALID_SIGNAL_TYPES.join(', ')}`,
      };
    }

    return null;
  }

  /**
   * Check source reliability.
   */
  private checkSourceReliability(signal: RawMarketSignal): boolean {
    return signal.source.reliabilityScore < this.config.minConfidenceThreshold;
  }

  /**
   * Calculate validation score.
   */
  private calculateValidationScore(
    issues: ValidationIssue[],
    warnings: ValidationWarning[]
  ): number {
    let score = 1.0;

    // Deduct for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 0.5;
          break;
        case 'high':
          score -= 0.3;
          break;
        case 'medium':
          score -= 0.15;
          break;
        case 'low':
          score -= 0.05;
          break;
      }
    }

    // Deduct for warnings
    score -= warnings.length * 0.02;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Clear processed signal cache.
   */
  clearCache(): void {
    this.processedSignalIds.clear();
    this.recentSignals.clear();
  }

  /**
   * Get cache statistics.
   */
  getCacheStats(): { processedCount: number; recentCount: number } {
    return {
      processedCount: this.processedSignalIds.size,
      recentCount: this.recentSignals.size,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new SignalValidationEngine.
 */
export function createSignalValidationEngine(
  config?: Partial<typeof DEFAULT_INGESTION_CONFIG.validationConfig>
): SignalValidationEngine {
  return new SignalValidationEngine(config);
}

/**
 * Quick validate a single signal.
 */
export function quickValidate(signal: RawMarketSignal): ValidationResult {
  const engine = new SignalValidationEngine();
  return engine.validate(signal);
}

/**
 * Get valid entity types.
 */
export function getValidEntityTypes(): NormalizedEntityType[] {
  return [...VALID_ENTITY_TYPES];
}

/**
 * Get valid signal types.
 */
export function getValidSignalTypes(): NormalizedSignalType[] {
  return [...VALID_SIGNAL_TYPES];
}
