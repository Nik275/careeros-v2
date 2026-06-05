/**
 * CareerOS - Career Recommendation Model
 *
 * Phase A.4: Canonical Recommendation Output Contract
 *
 * This module defines the universal recommendation object used throughout
 * CareerOS. CareerRecommendation represents a structured career suggestion
 * with comprehensive fit analysis, rationale, and outlook information.
 *
 * All numeric scores are normalized to a 0-100 scale unless otherwise specified.
 *
 * @module career-recommendation
 * @version 1.0.0
 */

/**
 * Canonical recommendation object for CareerOS.
 *
 * CareerRecommendation is the single output contract used by all recommendation
 * systems, AI advisors, APIs, and user-facing features. It combines fit analysis,
 * explanatory rationale, and future outlook into a comprehensive recommendation.
 *
 * This structure enables:
 * - Consistent recommendation presentation across all touchpoints
 * - Explainable career guidance with clear reasoning
 * - Confidence-based filtering and prioritization
 * - Multi-dimensional career assessment
 *
 * @example
 * const recommendation: CareerRecommendation = {
 *   careerId: 'software-engineer-001',
 *   careerTitle: 'Software Engineer',
 *   recommendationType: 'STRONG_MATCH',
 *   fitResult: { overallScore: 87, psychologicalFit: 90, ... },
 *   rationale: {
 *     primaryReasons: ['Strong analytical alignment', 'Values technology innovation'],
 *     supportingReasons: ['Good problem-solving skills', 'Comfortable with ambiguity'],
 *     strengthsAligned: ['Logical reasoning', 'Systematic thinking'],
 *     valuesAligned: ['Autonomy', 'Intellectual challenge'],
 *     concerns: ['High initial learning curve']
 *   },
 *   outlook: { marketDemand: 85, futureRelevance: 90, salaryPotential: 82, resilienceScore: 88 },
 *   confidence: { confidenceScore: 86, evidenceCount: 15, reliabilityLevel: 'HIGH' }
 * };
 */
export interface CareerRecommendation {
  /** Reference to the CareerProfile being recommended */
  careerId: string;

  /** Human-readable career title for display purposes */
  careerTitle: string;

  /**
   * Classification of recommendation strength.
   *
   * Provides a categorical summary of how strongly this career
   * matches the student's profile.
   */
  recommendationType: RecommendationType;

  /** Detailed fit analysis results */
  fitResult: RecommendationFitResult;

  /** Explanatory rationale for why this career is recommended */
  rationale: RecommendationRationale;

  /** Future outlook and opportunity assessment */
  outlook: RecommendationOutlook;

  /** Confidence and reliability metrics */
  confidence: RecommendationConfidence;
}

/**
 * Categorical classification of recommendation strength.
 *
 * Provides quick filtering and prioritization capabilities
 * based on match quality.
 *
 * - STRONG_MATCH: Excellent alignment across multiple dimensions
 * - GOOD_MATCH: Solid alignment with minor trade-offs
 * - POTENTIAL_MATCH: Viable option requiring development or compromise
 * - STRETCH_MATCH: Possible with significant effort or growth
 */
export type RecommendationType =
  /** Excellent alignment across multiple dimensions - ideal career match */
  | 'STRONG_MATCH'
  /** Solid alignment with minor trade-offs - strong viable option */
  | 'GOOD_MATCH'
  /** Viable option requiring development or compromise - worth considering */
  | 'POTENTIAL_MATCH'
  /** Possible with significant effort or growth - aspirational option */
  | 'STRETCH_MATCH';

/**
 * Multi-dimensional fit analysis for a recommendation.
 *
 * Captures the core fit dimensions that contribute to the
 * overall recommendation strength. Focuses on the most
 * critical matching factors for presentation clarity.
 *
 * All scores normalized to 0-100 scale.
 */
export interface RecommendationFitResult {
  /**
   * Composite fit score (0-100).
   *
   * Weighted aggregation of all fit dimensions representing
   * the overall strength of the career match.
   */
  overallScore: number;

  /** Alignment between student psychology and career demands (0-100) */
  psychologicalFit: number;

  /** Match between student strengths and career requirements (0-100) */
  strengthsFit: number;

  /** Compatibility between student values and career rewards (0-100) */
  valuesFit: number;

  /** Alignment between student lifestyle preferences and career reality (0-100) */
  lifestyleFit: number;
}

/**
 * Explanatory rationale for a career recommendation.
 *
 * Provides human-readable reasoning for why this career was
 * recommended, including aligned factors and potential concerns.
 * Essential for building trust and enabling informed decisions.
 */
export interface RecommendationRationale {
  /** Primary reasons for recommendation - strongest alignment factors */
  primaryReasons: string[];

  /** Supporting reasons - additional positive alignment factors */
  supportingReasons: string[];

  /** Specific student strengths that align with career requirements */
  strengthsAligned: string[];

  /** Student values that are satisfied by this career path */
  valuesAligned: string[];

  /** Potential concerns or areas requiring attention */
  concerns: string[];
}

/**
 * Future outlook and opportunity assessment.
 *
 * Captures market and future-oriented dimensions that inform
 * the long-term viability and attractiveness of this career
 * recommendation.
 *
 * All scores normalized to 0-100 scale.
 */
export interface RecommendationOutlook {
  /** Current and projected market demand for this career (0-100) */
  marketDemand: number;

  /** Expected relevance and importance in future economy (0-100) */
  futureRelevance: number;

  /** Earning potential and compensation outlook (0-100) */
  salaryPotential: number;

  /** Resilience against economic and technological disruption (0-100) */
  resilienceScore: number;
}

/**
 * Confidence and reliability metrics for a recommendation.
 *
 * Quantifies the trustworthiness of the recommendation based on
 * evidence quality, data completeness, and assessment reliability.
 */
export interface RecommendationConfidence {
  /**
   * Overall confidence score (0-100).
   *
   * Represents the statistical confidence in the accuracy
   * and reliability of this recommendation.
   *
   * Confidence ranges:
   * - 0-40: Low confidence - limited or poor quality evidence
   * - 41-60: Medium confidence - adequate evidence available
   * - 61-80: High confidence - substantial reliable evidence
   * - 81-100: Very high confidence - extensive validated evidence
   */
  confidenceScore: number;

  /** Number of distinct evidence points supporting this recommendation */
  evidenceCount: number;

  /** Constitutional confidence (0.0-1.0) - use Confidence Authority for evaluation */
  reliabilityLevel: number; // Confidence value, not enum
}

// BANNED: RecommendationConfidenceLevel enum removed - use Confidence type from @/intelligence/confidence
