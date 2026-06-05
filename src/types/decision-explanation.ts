/**
 * CareerOS - Decision Explanation Foundation
 *
 * Phase A.5: Canonical Explanation Model for Transparency and Trust
 *
 * This module defines the universal explanation structure used throughout
 * CareerOS to provide transparency, build trust, and enable informed
 * decision-making. DecisionExplanation powers explainable AI, career
 * reports, and advisory interactions.
 *
 * All numeric scores are normalized to a 0-100 scale unless otherwise specified.
 *
 * @module decision-explanation
 * @version 1.0.0
 */

/**
 * Universal explanation object for CareerOS decisions.
 *
 * DecisionExplanation provides comprehensive, human-readable explanations
 * for why a particular career was recommended or how a decision was reached.
 * It combines quantitative analysis with narrative explanation to ensure
 * users understand the reasoning behind recommendations.
 *
 * This structure enables:
 * - Transparent career guidance
 * - Trust-building through explainability
 * - Informed decision-making with full context
 * - Audit trail for recommendation logic
 *
 * @example
 * const explanation: DecisionExplanation = {
 *   summary: 'Software Engineering is strongly recommended based on your analytical strengths and values alignment.',
 *   fitExplanation: { overallFitScore: 87, strongestMatches: [...], weakestMatches: [...], narrative: '...' },
 *   strengthsAnalysis: { strengths: ['Logical reasoning', 'Systematic thinking'], supportingEvidence: [...], narrative: '...' },
 *   concernsAnalysis: { concerns: ['High learning curve'], riskFactors: [...], narrative: '...' },
 *   marketPerspective: { demandScore: 85, salaryPotential: 82, futureRelevance: 90, narrative: '...' },
 *   confidenceExplanation: { confidenceScore: 86, evidenceCount: 15, reliabilityLevel: 'HIGH', narrative: '...' }
 * };
 */
export interface DecisionExplanation {
  /** High-level summary of the decision or recommendation */
  summary: string;

  /** Detailed explanation of fit analysis */
  fitExplanation: FitExplanation;

  /** Analysis of aligned strengths */
  strengthsAnalysis: StrengthsAnalysis;

  /** Analysis of potential concerns */
  concernsAnalysis: ConcernsAnalysis;

  /** Market context and outlook perspective */
  marketPerspective: MarketPerspective;

  /** Confidence and reliability explanation */
  confidenceExplanation: ConfidenceExplanation;
}

/**
 * Detailed fit explanation with dimensional breakdown.
 *
 * Provides granular insight into which dimensions contribute most
 * positively and negatively to the overall fit assessment.
 */
export interface FitExplanation {
  /**
   * Overall fit score (0-100).
   *
   * Composite score representing the strength of alignment between
   * student profile and career characteristics.
   */
  overallFitScore: number;

  /** Dimensions where alignment is strongest */
  strongestMatches: ExplanationItem[];

  /** Dimensions where alignment is weakest */
  weakestMatches: ExplanationItem[];

  /** Human-readable narrative explaining the fit analysis */
  narrative: string;
}

/**
 * Single explanation item for a specific dimension.
 *
 * Captures the score and reasoning for a particular fit dimension,
 * used in both strengths and concerns sections.
 */
export interface ExplanationItem {
  /** The dimension or category being explained (e.g., "Problem Solving", "Work-Life Balance") */
  dimension: string;

  /**
   * Numerical score for this dimension (0-100).
   *
   * Higher scores indicate stronger alignment.
   */
  score: number;

  /** Detailed explanation of why this dimension scored as it did */
  explanation: string;
}

/**
 * Analysis of strengths alignment.
 *
 * Explains which student strengths align well with career requirements
 * and provides evidence supporting the recommendation.
 */
export interface StrengthsAnalysis {
  /** Specific strengths that align with this career */
  strengths: string[];

  /** Evidence or examples supporting the strengths alignment */
  supportingEvidence: string[];

  /** Human-readable narrative summarizing strengths analysis */
  narrative: string;
}

/**
 * Analysis of potential concerns.
 *
 * Identifies areas of potential mismatch or challenges that should
 * be considered when evaluating this career recommendation.
 */
export interface ConcernsAnalysis {
  /** Specific concerns or potential challenges */
  concerns: string[];

  /** Risk factors that could impact success in this career */
  riskFactors: string[];

  /** Human-readable narrative summarizing concerns analysis */
  narrative: string;
}

/**
 * Market context and future outlook perspective.
 *
 * Provides the market intelligence context that informs the recommendation,
 * helping users understand external factors affecting career viability.
 *
 * All scores normalized to 0-100 scale.
 */
export interface MarketPerspective {
  /** Current and projected market demand (0-100) */
  demandScore: number;

  /** Earning potential and salary outlook (0-100) */
  salaryPotential: number;

  /** Long-term relevance and future viability (0-100) */
  futureRelevance: number;

  /** Human-readable narrative explaining market perspective */
  narrative: string;
}

/**
 * Confidence and reliability explanation.
 *
 * Explains the trustworthiness of the recommendation by detailing
 * the evidence base, data quality, and assessment reliability.
 */
export interface ConfidenceExplanation {
  /**
   * Overall confidence score (0-100).
   *
   * Represents the statistical confidence in the accuracy
   * and reliability of this assessment.
   */
  confidenceScore: number;

  /** Number of distinct evidence points supporting this assessment */
  evidenceCount: number;

  /** Constitutional confidence (0.0-1.0) - replaces categorical level */
  confidence: Confidence;

  /** Human-readable narrative explaining confidence factors */
  narrative: string;
}

// BANNED: ConfidenceLevel enum removed - use Confidence type from @/intelligence/confidence
import type { Confidence } from '../intelligence/confidence';
