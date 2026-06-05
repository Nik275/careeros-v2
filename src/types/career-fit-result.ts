/**
 * CareerOS - Career Fit Result Foundation
 *
 * Phase A.3: Core Output Model for Career Matching and Recommendations
 *
 * This module defines the universal output contract used by all fit engines,
 * recommendation systems, and intelligence modules. CareerFitResult represents
 * the comprehensive assessment of how well a specific career matches a student's
 * profile across multiple dimensions.
 *
 * All numeric scores are normalized to a 0-100 scale unless otherwise specified.
 *
 * @module career-fit-result
 * @version 1.0.0
 */

/**
 * Universal output model for career fit assessment.
 *
 * CareerFitResult is the canonical representation of how well a specific career
 * matches a student's profile. It serves as the output contract for all fit
 * engines, recommendation systems, and intelligence modules within CareerOS.
 *
 * This structure enables:
 * - Career comparison and ranking
 * - Explainable recommendations
 * - Confidence-based filtering
 * - Multi-dimensional fit analysis
 *
 * @example
 * const result: CareerFitResult = {
 *   careerId: 'software-engineer-001',
 *   careerTitle: 'Software Engineer',
 *   overallFitScore: 87,
 *   fitBreakdown: {
 *     psychologicalFit: 90,
 *     strengthsFit: 85,
 *     valuesFit: 88,
 *     lifestyleFit: 82,
 *     aptitudeFit: 91,
 *     riskFit: 78
 *   },
 *   strengths: [...],
 *   concerns: [...],
 *   confidence: { score: 85, evidenceCount: 12, reliabilityLevel: 'HIGH' }
 * };
 */
export interface CareerFitResult {
  /** Reference to the CareerProfile being assessed */
  careerId: string;

  /** Human-readable career title for display purposes */
  careerTitle: string;

  /**
   * Overall composite fit score (0-100).
   *
   * Represents the weighted aggregation of all fit dimensions.
   * Higher scores indicate stronger overall match.
   *
   * Score ranges:
   * - 0-40: Poor fit - significant mismatches
   * - 41-60: Moderate fit - viable but requires trade-offs
   * - 61-75: Good fit - solid alignment with profile
   * - 76-90: Strong fit - excellent career match
   * - 91-100: Exceptional fit - ideal career alignment
   */
  overallFitScore: number;

  /** Detailed breakdown of fit across individual dimensions */
  fitBreakdown: FitBreakdown;

  /** Identified areas of strong alignment between student and career */
  strengths: FitStrength[];

  /** Identified areas of concern or potential mismatch */
  concerns: FitConcern[];

  /** Confidence metrics for the reliability of this fit assessment */
  confidence: FitConfidence;
}

/**
 * Multi-dimensional breakdown of career fit.
 *
 * Provides granular insight into which specific dimensions contribute
 * to or detract from the overall fit score. Enables targeted analysis
 * of compatibility factors.
 *
 * All scores normalized to 0-100 scale.
 */
export interface FitBreakdown {
  /** Alignment between student psychology and career demands (0-100) */
  psychologicalFit: number;

  /** Match between student strengths and career requirements (0-100) */
  strengthsFit: number;

  /** Compatibility between student values and career rewards (0-100) */
  valuesFit: number;

  /** Alignment between student lifestyle preferences and career reality (0-100) */
  lifestyleFit: number;

  /** Match between student cognitive aptitudes and career demands (0-100) */
  aptitudeFit: number;

  /** Compatibility between student risk tolerance and career stability (0-100) */
  riskFit: number;
}

/**
 * Identified strength in the career-student fit.
 *
 * Represents a specific dimension where the student's profile strongly
 * aligns with the career's requirements or characteristics. Provides
 * evidence for why this career is a good match.
 */
export interface FitStrength {
  /** The dimension or category of this strength (e.g., "Problem Solving", "Analytical Thinking") */
  dimension: string;

  /** Numerical score for this strength alignment (0-100) */
  score: number;

  /** Human-readable explanation of why this is a strength */
  explanation: string;
}

/**
 * Identified concern or potential mismatch in the career-student fit.
 *
 * Represents a specific dimension where alignment is weak or where
 * trade-offs may be required. Provides transparency about potential
 * challenges in pursuing this career.
 */
export interface FitConcern {
  /** The dimension or category of this concern (e.g., "Work-Life Balance", "Geographic Constraints") */
  dimension: string;

  /** Numerical score for this concern area (0-100, lower indicates concern) */
  score: number;

  /** Human-readable explanation of the concern and potential implications */
  explanation: string;
}

/**
 * Confidence and reliability metrics for a fit assessment.
 *
 * Quantifies the trustworthiness of the fit result based on available
 * evidence, data quality, and assessment completeness.
 */
export interface FitConfidence {
  /**
   * Overall confidence score (0-100).
   *
   * Represents the statistical confidence in the accuracy of this fit assessment.
   * Higher scores indicate more reliable predictions.
   *
   * Confidence ranges:
   * - 0-40: Low confidence - limited or poor quality data
   * - 41-60: Medium confidence - moderate evidence available
   * - 61-80: High confidence - substantial reliable evidence
   * - 81-100: Very high confidence - extensive validated evidence
   */
  score: number;

  /** Number of distinct evidence points contributing to this assessment */
  evidenceCount: number;

  /** Constitutional confidence (0.0-1.0) - use Confidence Authority for evaluation */
  reliabilityLevel: number; // Confidence value, not enum
}

// BANNED: ConfidenceLevel enum removed - use Confidence type from @/intelligence/confidence
