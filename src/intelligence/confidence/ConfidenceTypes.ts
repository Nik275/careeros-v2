/**
 * CareerOS Unified Confidence Model
 * 
 * Single source of truth for all uncertainty quantification.
 * All confidence values MUST use this model.
 * 
 * @module confidence/types
 * @version 1.0.0
 */

// ============================================================================
// CORE CONFIDENCE TYPE
// ============================================================================

/**
 * Confidence value as 0.0-1.0 float.
 * 
 * - 0.0 = No confidence (complete uncertainty)
 * - 0.5 = Neutral (coin flip)
 * - 1.0 = Complete confidence (certainty)
 * 
 * Calibration requirement: A confidence of 0.8 should mean
 * the prediction is correct 80% of the time.
 */
export type Confidence = number;

/**
 * Confidence value with brand for type safety.
 */
export type ValidatedConfidence = Confidence & { __brand: 'ValidatedConfidence' };

/**
 * Uncertainty is the inverse of confidence.
 * uncertainty = 1 - confidence
 */
export type Uncertainty = number;

/**
 * Reliability score (0.0-1.0).
 */
export type Reliability = number;

// ============================================================================
// CONFIDENCE VALUE WITH METADATA
// ============================================================================

/**
 * Confidence with full metadata for auditability.
 */
export interface ConfidenceValue {
  /** The confidence value (0.0-1.0) */
  readonly value: Confidence;
  
  /** Unique lineage ID for tracing */
  readonly lineageId: string;
  
  /** Authority that calculated this confidence */
  readonly authority: 'ConfidenceAuthority';
  
  /** Component/module within Confidence Authority */
  readonly component: string;
  
  /** Timestamp of calculation */
  readonly calculatedAt: number;
  
  /** Factors contributing to this confidence */
  readonly factors: ConfidenceFactor[];
  
  /** Evidence sources used */
  readonly evidence: ConfidenceEvidence[];
  
  /** Calibration status */
  readonly calibration: CalibrationStatus;
  
  /** Uncertainty bounds */
  readonly bounds: ConfidenceBounds;
}

/**
 * Individual confidence factor.
 */
export interface ConfidenceFactor {
  /** Factor name */
  readonly name: string;
  
  /** Factor weight (0.0-1.0) */
  readonly weight: Confidence;
  
  /** Factor score (0.0-1.0) */
  readonly score: Confidence;
  
  /** Contribution to overall confidence */
  readonly contribution: number;
  
  /** Explanation of factor */
  readonly explanation: string;
}

/**
 * Evidence source for confidence.
 */
export interface ConfidenceEvidence {
  /** Evidence type */
  readonly type: string;
  
  /** Source identifier */
  readonly source: string;
  
  /** Evidence quality (0.0-1.0) */
  readonly quality: Confidence;
  
  /** Evidence timestamp */
  readonly timestamp: number;
}

/**
 * Confidence bounds (uncertainty interval).
 */
export interface ConfidenceBounds {
  /** Lower bound (0.0-1.0) */
  readonly lower: Confidence;
  
  /** Upper bound (0.0-1.0) */
  readonly upper: Confidence;
  
  /** Confidence level for bounds (e.g., 0.95 for 95%) */
  readonly confidenceLevel: Confidence;
}

/**
 * Calibration status.
 */
export interface CalibrationStatus {
  /** Whether confidence is calibrated */
  readonly isCalibrated: boolean;
  
  /** Calibration error (0.0-1.0, lower is better) */
  readonly error: number;
  
  /** Sample size for calibration */
  readonly sampleSize: number;
  
  /** Reliability band */
  readonly reliability: ReliabilityBand;
}

/**
 * Reliability bands.
 */
export type ReliabilityBand = 
  | 'excellent'    // 0.90-1.00
  | 'good'         // 0.75-0.89
  | 'moderate'     // 0.60-0.74
  | 'poor'         // 0.40-0.59
  | 'unreliable';  // 0.00-0.39

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface ConfidenceRequest {
  /** Request ID for tracing */
  readonly requestId: string;
  
  /** System requesting confidence */
  readonly requestingSystem: string;
  
  /** Type of prediction */
  readonly predictionType: PredictionType;
  
  /** Prediction data */
  readonly prediction: unknown;
  
  /** Evidence supporting prediction */
  readonly evidence: Evidence[];
  
  /** Context for calculation */
  readonly context: ConfidenceContext;
  
  /** Required confidence components */
  readonly requiredComponents?: ConfidenceComponentType[];
}

export type PredictionType =
  | 'career-fit'
  | 'career-recommendation'
  | 'decision'
  | 'archetype'
  | 'market-trend'
  | 'skill-match'
  | 'outcome-prediction'
  | 'similarity'
  | 'transition';

export interface Evidence {
  readonly type: string;
  readonly source: string;
  readonly quality: Confidence;
  readonly timestamp: number;
  readonly data?: unknown;
}

export interface ConfidenceContext {
  readonly studentId?: string;
  readonly careerId?: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

export type ConfidenceComponentType = 
  | 'evidence-quality'
  | 'data-completeness'
  | 'source-reliability'
  | 'model-confidence'
  | 'historical-accuracy';

// ============================================================================
// UNCERTAINTY PROFILE
// ============================================================================

/**
 * Uncertainty profile for complex predictions.
 */
export interface UncertaintyProfile {
  /** Overall uncertainty (0.0-1.0) */
  readonly overall: Uncertainty;
  
  /** Aleatoric uncertainty (irreducible randomness) */
  readonly aleatoric: Uncertainty;
  
  /** Epistemic uncertainty (knowledge gaps) */
  readonly epistemic: Uncertainty;
  
  /** Model uncertainty */
  readonly model: Uncertainty;
  
  /** Data uncertainty */
  readonly data: Uncertainty;
  
  /** Components of uncertainty */
  readonly components: UncertaintyComponent[];
}

export interface UncertaintyComponent {
  /** Component name */
  readonly name: string;
  
  /** Component uncertainty (0.0-1.0) */
  readonly uncertainty: Uncertainty;
  
  /** Whether this uncertainty can be reduced */
  readonly reducible: boolean;
  
  /** Recommended actions to reduce uncertainty */
  readonly reductionActions: string[];
}

// ============================================================================
// RELIABILITY ASSESSMENT
// ============================================================================

export interface ReliabilityAssessment {
  /** Overall reliability */
  readonly overall: Reliability;
  
  /** Factors contributing to reliability */
  readonly factors: ReliabilityFactor[];
  
  /** Historical trend */
  readonly trend: ReliabilityTrend;
  
  /** Recommendations for improvement */
  readonly recommendations: string[];
}

export interface ReliabilityFactor {
  /** Factor name */
  readonly name: string;
  
  /** Factor score (0.0-1.0) */
  readonly score: Reliability;
  
  /** Factor weight */
  readonly weight: number;
  
  /** Impact on overall reliability */
  readonly impact: 'positive' | 'negative' | 'neutral';
}

export interface ReliabilityTrend {
  /** Trend direction */
  readonly direction: 'improving' | 'stable' | 'degrading';
  
  /** Rate of change */
  readonly rate: number;
  
  /** Periods analyzed */
  readonly periods: number;

  /** Average reliability/confidence over the analyzed periods */
  readonly average?: number;
}

// ============================================================================
// CALIBRATION
// ============================================================================

export interface CalibrationObservation {
  readonly id: string;
  readonly systemId: string;
  readonly predictedConfidence: Confidence;
  readonly actualOutcome: boolean;
  readonly outcomeQuality: number;
  readonly timestamp: number;
  readonly context: CalibrationContext;
}

export interface CalibrationContext {
  readonly domain: string;
  readonly decisionType: string;
  readonly userSegment: string;
  readonly timeHorizon: TimeHorizon;
}

export type TimeHorizon =
  | 'immediate'
  | 'short'
  | 'medium'
  | 'long'
  | 'extended';

export interface CalibrationProfile {
  readonly id: string;
  readonly name: string;
  readonly status: CalibrationStatusType;
  readonly reliabilityBand: ReliabilityBand;
  readonly reliabilityScore: Reliability;
  readonly calibrationError: number;
  readonly sampleSize: number;
  readonly lastUpdated: number;
}

export type CalibrationStatusType =
  | 'well_calibrated'
  | 'overconfident'
  | 'underconfident'
  | 'insufficient_data'
  | 'drifting';

// ============================================================================
// AGGREGATION
// ============================================================================

export type AggregationMethod =
  | 'weighted-average'
  | 'minimum'
  | 'maximum'
  | 'bayesian'
  | 'consensus';

// ============================================================================
// EXPLANATION
// ============================================================================

export interface ConfidenceExplanation {
  readonly summary: string;
  readonly factors: string[];
  readonly recommendations: string[];
  readonly confidence: Confidence;
}

// ============================================================================
// HISTORY
// ============================================================================

export interface ConfidenceHistory {
  readonly systemId: string;
  readonly entries: ConfidenceHistoryEntry[];
}

export interface HistoryQueryOptions {
  readonly timeWindowMs?: number;
  readonly limit?: number;
}

export interface ConfidenceHistoryEntry {
  readonly timestamp: number;
  readonly confidence: Confidence;
  readonly predictionType: PredictionType;
  readonly lineageId: string;
}

// ============================================================================
// ERRORS
// ============================================================================

export class ConfidenceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly lineageId?: string
  ) {
    super(message);
    this.name = 'ConfidenceError';
  }
}

export class ConfidenceValidationError extends ConfidenceError {
  constructor(message: string) {
    super(message, 'CONFIDENCE_VALIDATION_ERROR');
  }
}

export class ConfidenceCalculationError extends ConfidenceError {
  constructor(message: string, lineageId?: string) {
    super(message, 'CONFIDENCE_CALCULATION_ERROR', lineageId);
  }
}

export class CalibrationError extends ConfidenceError {
  constructor(message: string, public readonly systemId: string) {
    super(message, 'CALIBRATION_ERROR');
    this.systemId = systemId;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates and normalizes confidence value.
 */
export function validateConfidence(value: unknown): ValidatedConfidence {
  if (typeof value !== 'number') {
    throw new ConfidenceValidationError('Confidence must be a number');
  }
  if (isNaN(value) || !isFinite(value)) {
    throw new ConfidenceValidationError('Confidence must be a valid number');
  }
  const clamped = Math.max(0, Math.min(1, value));
  return clamped as ValidatedConfidence;
}

/**
 * Converts legacy confidence to standard confidence.
 */
export function migrateLegacyConfidence(legacy: unknown): Confidence {
  // Handle string enums
  if (typeof legacy === 'string') {
    const mappings: Record<string, Confidence> = {
      'VERY_LOW': 0.15,
      'LOW': 0.30,
      'MEDIUM': 0.55,
      'HIGH': 0.80,
      'VERY_HIGH': 0.95,
      'very-low': 0.15,
      'low': 0.30,
      'moderate': 0.55,
      'high': 0.80,
      'very-high': 0.95,
      'strong': 0.85,
      'weak': 0.35,
      'uncertain': 0.20,
    };
    const mapped = mappings[legacy];
    if (mapped !== undefined) {
      return mapped;
    }
    console.warn('Unknown confidence enum value received safely.');
    return 0.50;
  }
  
  // Handle 0-100 integers
  if (typeof legacy === 'number' && legacy > 1) {
    return legacy / 100;
  }
  
  // Handle 0-1 floats (already correct)
  if (typeof legacy === 'number') {
    return Math.max(0, Math.min(1, legacy));
  }
  
  console.warn('Unknown confidence value type received safely.');
  return 0.50;
}

/**
 * Determines reliability band from score.
 */
export function getReliabilityBand(score: Reliability): ReliabilityBand {
  if (score >= 0.90) return 'excellent';
  if (score >= 0.75) return 'good';
  if (score >= 0.60) return 'moderate';
  if (score >= 0.40) return 'poor';
  return 'unreliable';
}

/**
 * Creates default confidence bounds.
 */
export function createDefaultBounds(confidence: Confidence): ConfidenceBounds {
  const margin = (1 - confidence) * 0.2;
  return {
    lower: Math.max(0, confidence - margin),
    upper: Math.min(1, confidence + margin),
    confidenceLevel: 0.95,
  };
}
