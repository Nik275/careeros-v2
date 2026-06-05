/**
 * CareerOS Confidence-Aware Recommendation Layer V1
 *
 * Attaches confidence and uncertainty to all recommendations.
 * Every recommendation includes: expected utility, confidence, bounds, risk, and explanations.
 *
 * Features:
 * - Confidence-aware recommendation scoring
 * - Scenario-based bounds (best/expected/worst case)
 * - Recommendation strength classification
 * - Decision risk assessment
 * - Human-readable explanations
 *
 * @module intelligence/confidence-aware-recommendation
 * @version 1.0.0
 */

import type { ConfidenceLevel } from '../uncertainty-engine/UncertaintyEngineV1.js';
import type { FinalDecisionConfidence } from '../confidence-propagation-engine/ConfidencePropagationEngineV1.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Recommendation identifier
 */
export type RecommendationId = string;

/**
 * Recommendation strength classification
 */
export type RecommendationStrength =
  | 'strong-recommend'
  | 'recommend'
  | 'conditional-recommend'
  | 'explore-further'
  | 'not-recommended';

/**
 * Decision risk level
 */
export type DecisionRiskLevel =
  | 'very-low'
  | 'low'
  | 'moderate'
  | 'high'
  | 'very-high';

/**
 * Scenario-based utility bounds
 */
export interface UtilityBounds {
  /** Best case scenario (95th percentile) */
  bestCase: number;

  /** Expected case (mean) */
  expectedCase: number;

  /** Worst case scenario (5th percentile) */
  worstCase: number;

  /** Confidence interval width */
  range: number;

  /** Asymmetry (positive = more upside, negative = more downside) */
  asymmetry: number;
}

/**
 * Confidence-aware recommendation
 */
export interface ConfidenceAwareRecommendation {
  /** Recommendation identifier */
  id: RecommendationId;

  /** Student identifier */
  studentId: string;

  /** Recommended path */
  path: {
    id: string;
    name: string;
    description: string;
    careerId: string;
  };

  /** Scoring */
  score: {
    /** Expected utility (0-100) */
    expectedUtility: number;

    /** Confidence in this utility (0-100) */
    confidence: number;

    /** Confidence level */
    confidenceLevel: ConfidenceLevel;

    /** Scenario bounds */
    bounds: UtilityBounds;
  };

  /** Recommendation classification */
  classification: {
    /** Strength of recommendation */
    strength: RecommendationStrength;

    /** Decision risk level */
    riskLevel: DecisionRiskLevel;

    /** Risk score (0-100, higher = more risky) */
    riskScore: number;

    /** Certainty score (0-100, inverse of risk) */
    certaintyScore: number;
  };

  /** Comparison to alternatives */
  comparison: {
    /** Rank among all options */
    rank: number;

    /** Total options considered */
    totalOptions: number;

    /** Margin over next best option */
    margin: number;

    /** Is this a clear winner */
    isClearWinner: boolean;

    /** Comparable alternatives */
    alternatives: Array<{
      id: string;
      name: string;
      expectedUtility: number;
      confidence: number;
      tradeoff: string;
    }>;
  };

  /** Supporting evidence */
  evidence: {
    /** Number of supporting factors */
    supportingFactors: number;

    /** Number of concerning factors */
    concerningFactors: number;

    /** Key supporting factors */
    keyStrengths: string[];

    /** Key concerns */
    keyConcerns: string[];

    /** Deal breakers (if any) */
    dealBreakers: string[];
  };

  /** Human-readable explanation */
  explanation: {
    /** Summary statement */
    summary: string;

    /** Why this recommendation */
    reasoning: string[];

    /** Confidence explanation */
    confidenceExplanation: string;

    /** Risk explanation */
    riskExplanation: string;

    /** What could go wrong */
    downsideScenario: string;

    /** What could go right */
    upsideScenario: string;

    /** Next steps */
    nextSteps: string[];
  };

  /** Metadata */
  metadata: {
    /** When generated */
    timestamp: number;

    /** Engine version */
    version: string;

    /** Confidence propagation data */
    confidenceData?: FinalDecisionConfidence;
  };
}

/**
 * Recommendation set with full confidence information
 */
export interface ConfidenceAwareRecommendationSet {
  /** Set identifier */
  id: string;

  /** Student identifier */
  studentId: string;

  /** Primary recommendation */
  primary: ConfidenceAwareRecommendation;

  /** Alternative recommendations (if primary not suitable) */
  alternatives: ConfidenceAwareRecommendation[];

  /** All ranked recommendations */
  allRecommendations: ConfidenceAwareRecommendation[];

  /** Portfolio recommendation (if multiple viable paths) */
  portfolio?: {
    /** Paths that form a good portfolio */
    paths: string[];

    /** Why these work together */
    rationale: string;
  };

  /** Overall assessment */
  overall: {
    /** Number of viable options */
    viableOptions: number;

    /** Decision complexity */
    complexity: 'simple' | 'moderate' | 'complex';

    /** Confidence in overall recommendation set */
    overallConfidence: number;

    /** Whether student has sufficient information */
    sufficientInformation: boolean;
  };
}

/**
 * Recommendation engine configuration
 */
export interface ConfidenceAwareRecommendationConfig {
  /** Minimum confidence for "recommend" */
  minRecommendConfidence: number;

  /** Minimum confidence for "strong recommend" */
  minStrongRecommendConfidence: number;

  /** Maximum risk for "recommend" */
  maxRecommendRisk: number;

  /** Clear winner threshold (margin) */
  clearWinnerThreshold: number;

  /** Risk aversion factor (0-1) */
  riskAversion: number;

  /** Confidence decay for scenarios */
  scenarioDecay: number;

  /** Maximum alternatives to show */
  maxAlternatives: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CONFIDENCE_AWARE_CONFIG: ConfidenceAwareRecommendationConfig = {
  minRecommendConfidence: 60,
  minStrongRecommendConfidence: 75,
  maxRecommendRisk: 60,
  clearWinnerThreshold: 10,
  riskAversion: 0.3,
  scenarioDecay: 0.15,
  maxAlternatives: 3,
};

// ============================================================================
// UTILITY BOUNDS CALCULATION
// ============================================================================

/**
 * Calculate utility bounds based on confidence
 */
export function calculateUtilityBounds(
  expectedUtility: number,
  confidence: number,
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): UtilityBounds {
  const uncertainty = 100 - confidence;

  // Calculate range based on uncertainty
  const baseRange = uncertainty * (1 + config.riskAversion);

  // Best case (95th percentile) - skewed by risk aversion
  const bestCase = Math.min(100, expectedUtility + baseRange * (1 - config.riskAversion));

  // Worst case (5th percentile)
  const worstCase = Math.max(0, expectedUtility - baseRange * (1 + config.riskAversion));

  // Range width
  const range = bestCase - worstCase;

  // Asymmetry (positive = more upside potential)
  const asymmetry = (bestCase - expectedUtility) - (expectedUtility - worstCase);

  return {
    bestCase: Math.round(bestCase),
    expectedCase: Math.round(expectedUtility),
    worstCase: Math.round(worstCase),
    range: Math.round(range),
    asymmetry: Math.round(asymmetry * 10) / 10,
  };
}

// ============================================================================
// RECOMMENDATION STRENGTH CLASSIFICATION
// ============================================================================

/**
 * Classify recommendation strength
 */
export function classifyRecommendationStrength(
  expectedUtility: number,
  confidence: number,
  riskScore: number,
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): RecommendationStrength {
  // Not recommended cases
  if (expectedUtility < 40 || riskScore > 80) {
    return 'not-recommended';
  }

  // Strong recommend
  if (
    expectedUtility >= 75 &&
    confidence >= config.minStrongRecommendConfidence &&
    riskScore <= config.maxRecommendRisk
  ) {
    return 'strong-recommend';
  }

  // Recommend
  if (
    expectedUtility >= 60 &&
    confidence >= config.minRecommendConfidence &&
    riskScore <= config.maxRecommendRisk
  ) {
    return 'recommend';
  }

  // Conditional recommend
  if (
    expectedUtility >= 50 &&
    confidence >= 50 &&
    riskScore <= 70
  ) {
    return 'conditional-recommend';
  }

  // Explore further
  return 'explore-further';
}

// ============================================================================
// DECISION RISK ASSESSMENT
// ============================================================================

/**
 * Calculate decision risk score
 */
export function calculateDecisionRisk(
  expectedUtility: number,
  confidence: number,
  worstCase: number,
  dealBreakerCount: number,
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): { score: number; level: DecisionRiskLevel } {
  // Base risk from uncertainty
  let riskScore = 100 - confidence;

  // Downside risk (how bad can worst case be)
  const downsideRisk = Math.max(0, 50 - worstCase);
  riskScore += downsideRisk * 0.5;

  // Deal breaker penalty
  riskScore += dealBreakerCount * 15;

  // Low expected utility increases risk
  if (expectedUtility < 50) {
    riskScore += (50 - expectedUtility) * 0.5;
  }

  // Normalize
  riskScore = Math.min(100, riskScore);

  // Determine level
  let level: DecisionRiskLevel;
  if (riskScore < 20) level = 'very-low';
  else if (riskScore < 35) level = 'low';
  else if (riskScore < 55) level = 'moderate';
  else if (riskScore < 75) level = 'high';
  else level = 'very-high';

  return {
    score: Math.round(riskScore),
    level,
  };
}

// ============================================================================
// EXPLANATION GENERATION
// ============================================================================

/**
 * Generate human-readable explanation for recommendation
 */
export function generateRecommendationExplanation(
  recommendation: ConfidenceAwareRecommendation,
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): ConfidenceAwareRecommendation['explanation'] {
  const summary = generateSummary(recommendation);
  const reasoning = generateReasoning(recommendation);
  const confidenceExplanation = generateConfidenceExplanation(recommendation);
  const riskExplanation = generateRiskExplanation(recommendation);
  const downsideScenario = generateDownsideScenario(recommendation);
  const upsideScenario = generateUpsideScenario(recommendation);
  const nextSteps = generateNextSteps(recommendation, config);

  return {
    summary,
    reasoning,
    confidenceExplanation,
    riskExplanation,
    downsideScenario,
    upsideScenario,
    nextSteps,
  };
}

function generateSummary(rec: ConfidenceAwareRecommendation): string {
  const { path, score, classification } = rec;

  let summary = '';

  // Base recommendation
  switch (classification.strength) {
    case 'strong-recommend':
      summary = `CareerOS strongly recommends ${path.name}. `;
      break;
    case 'recommend':
      summary = `CareerOS recommends ${path.name}. `;
      break;
    case 'conditional-recommend':
      summary = `CareerOS conditionally recommends ${path.name} with some reservations. `;
      break;
    case 'explore-further':
      summary = `CareerOS suggests exploring ${path.name} further before committing. `;
      break;
    case 'not-recommended':
      summary = `CareerOS does not recommend ${path.name} at this time. `;
      break;
  }

  // Add utility and confidence
  summary += `This path has an expected utility of ${Math.round(score.expectedUtility)}% `;
  summary += `with ${Math.round(score.confidence)}% confidence. `;

  // Add bounds
  summary += `Best case: ${score.bounds.bestCase}%, worst case: ${score.bounds.worstCase}%.`;

  return summary;
}

function generateReasoning(rec: ConfidenceAwareRecommendation): string[] {
  const reasoning: string[] = [];

  // Key strengths
  for (const strength of rec.evidence.keyStrengths.slice(0, 3)) {
    reasoning.push(`Strong alignment: ${strength}`);
  }

  // Comparison
  if (rec.comparison.isClearWinner) {
    reasoning.push(`Clear winner by ${Math.round(rec.comparison.margin)} points over alternatives`);
  } else if (rec.comparison.margin > 0) {
    reasoning.push(`Modest lead of ${Math.round(rec.comparison.margin)} points - close decision`);
  }

  // Confidence level
  if (rec.score.confidence >= 75) {
    reasoning.push('High confidence in this recommendation based on comprehensive data');
  } else if (rec.score.confidence >= 60) {
    reasoning.push('Moderate confidence - some uncertainty remains');
  } else {
    reasoning.push('Lower confidence - more exploration recommended');
  }

  return reasoning;
}

function generateConfidenceExplanation(rec: ConfidenceAwareRecommendation): string {
  const { confidence, confidenceLevel } = rec.score;

  let explanation = `Confidence is ${Math.round(confidence)}% (${confidenceLevel.toLowerCase().replace('_', ' ')}). `;

  if (confidence >= 80) {
    explanation += 'This is based on comprehensive student assessment, high-quality career data, and validated prediction models.';
  } else if (confidence >= 60) {
    explanation += 'This reflects good but incomplete data. Some aspects of the prediction carry uncertainty.';
  } else {
    explanation += 'Limited data reduces confidence. Consider completing additional assessments before making this decision.';
  }

  return explanation;
}

function generateRiskExplanation(rec: ConfidenceAwareRecommendation): string {
  const { riskLevel, riskScore } = rec.classification;

  let explanation = `Decision risk is ${riskLevel.replace('-', ' ')} (${Math.round(riskScore)}%). `;

  if (rec.classification.riskLevel === 'very-low' || rec.classification.riskLevel === 'low') {
    explanation += 'Downside scenarios are manageable and the path offers good protection against regret.';
  } else if (rec.classification.riskLevel === 'moderate') {
    explanation += 'Some uncertainty exists, but the expected outcome justifies this level of risk.';
  } else {
    explanation += 'Higher risk due to uncertainty in predictions or potential deal-breakers. Consider mitigation strategies.';
  }

  return explanation;
}

function generateDownsideScenario(rec: ConfidenceAwareRecommendation): string {
  const { worstCase } = rec.score.bounds;

  let scenario = `In a downside scenario, this path could result in a utility score of ${worstCase}%. `;

  if (rec.evidence.keyConcerns.length > 0) {
    scenario += `Main concerns: ${rec.evidence.keyConcerns.slice(0, 2).join(', ')}. `;
  }

  if (worstCase < 40) {
    scenario += 'This represents a significant departure from expectations. Consider backup plans.';
  } else if (worstCase < 60) {
    scenario += 'While disappointing, this outcome is still viable.';
  } else {
    scenario += 'Even the worst case remains reasonably positive.';
  }

  return scenario;
}

function generateUpsideScenario(rec: ConfidenceAwareRecommendation): string {
  const { bestCase } = rec.score.bounds;

  let scenario = `In an upside scenario, this path could achieve a utility score of ${bestCase}%. `;

  if (rec.evidence.keyStrengths.length > 0) {
    scenario += `Key opportunities: ${rec.evidence.keyStrengths.slice(0, 2).join(', ')}. `;
  }

  if (bestCase > 90) {
    scenario += 'This represents an exceptional outcome if things go well.';
  } else if (bestCase > 80) {
    scenario += 'Strong upside potential if circumstances align.';
  } else {
    scenario += 'Modest upside - expectations are fairly calibrated.';
  }

  return scenario;
}

function generateNextSteps(
  rec: ConfidenceAwareRecommendation,
  config: ConfidenceAwareRecommendationConfig
): string[] {
  const steps: string[] = [];

  // Based on strength
  if (rec.classification.strength === 'strong-recommend') {
    steps.push('Proceed with confidence - begin planning your transition to this path');
  } else if (rec.classification.strength === 'recommend') {
    steps.push('This is a solid choice - begin exploring specific opportunities');
  } else if (rec.classification.strength === 'conditional-recommend') {
    steps.push('Gather more information about key concerns before committing');
  } else if (rec.classification.strength === 'explore-further') {
    steps.push('Explore this path further through informational interviews and shadowing');
  }

  // Based on confidence
  if (rec.score.confidence < 70) {
    steps.push('Complete additional assessments to increase confidence');
  }

  // Based on risk
  if (rec.classification.riskLevel === 'high' || rec.classification.riskLevel === 'very-high') {
    steps.push('Develop contingency plans for downside scenarios');
  }

  // Always
  steps.push('Discuss this recommendation with trusted advisors');
  steps.push('Identify 2-3 concrete next actions to explore this path');

  return steps;
}

// ============================================================================
// MAIN RECOMMENDATION BUILDER
// ============================================================================

/**
 * Build confidence-aware recommendation
 */
export function buildConfidenceAwareRecommendation(
  recommendationId: string,
  studentId: string,
  pathId: string,
  pathName: string,
  pathDescription: string,
  careerId: string,
  expectedUtility: number,
  confidence: number,
  finalConfidenceData: FinalDecisionConfidence,
  rank: number,
  totalOptions: number,
  margin: number,
  keyStrengths: string[],
  keyConcerns: string[],
  dealBreakers: string[],
  alternatives: ConfidenceAwareRecommendation['comparison']['alternatives'],
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): ConfidenceAwareRecommendation {
  // Calculate bounds
  const bounds = calculateUtilityBounds(expectedUtility, confidence, config);

  // Calculate risk
  const risk = calculateDecisionRisk(
    expectedUtility,
    confidence,
    bounds.worstCase,
    dealBreakers.length,
    config
  );

  // Calculate certainty (inverse of risk)
  const certaintyScore = 100 - risk.score;

  // Classify strength
  const strength = classifyRecommendationStrength(expectedUtility, confidence, risk.score, config);

  // Determine confidence level
  let confidenceLevel: ConfidenceLevel;
  if (confidence >= 85) confidenceLevel = 'VERY_HIGH';
  else if (confidence >= 70) confidenceLevel = 'HIGH';
  else if (confidence >= 50) confidenceLevel = 'MEDIUM';
  else confidenceLevel = 'LOW';

  // Build base recommendation
  const recommendation: ConfidenceAwareRecommendation = {
    id: recommendationId,
    studentId,
    path: {
      id: pathId,
      name: pathName,
      description: pathDescription,
      careerId,
    },
    score: {
      expectedUtility: Math.round(expectedUtility),
      confidence: Math.round(confidence),
      confidenceLevel,
      bounds,
    },
    classification: {
      strength,
      riskLevel: risk.level,
      riskScore: risk.score,
      certaintyScore,
    },
    comparison: {
      rank,
      totalOptions,
      margin: Math.round(margin),
      isClearWinner: margin >= config.clearWinnerThreshold,
      alternatives: alternatives.slice(0, config.maxAlternatives),
    },
    evidence: {
      supportingFactors: keyStrengths.length,
      concerningFactors: keyConcerns.length,
      keyStrengths: keyStrengths.slice(0, 5),
      keyConcerns: keyConcerns.slice(0, 5),
      dealBreakers,
    },
    explanation: {
      summary: '',
      reasoning: [],
      confidenceExplanation: '',
      riskExplanation: '',
      downsideScenario: '',
      upsideScenario: '',
      nextSteps: [],
    },
    metadata: {
      timestamp: Date.now(),
      version: '1.0.0',
      confidenceData: finalConfidenceData,
    },
  };

  // Generate explanation
  recommendation.explanation = generateRecommendationExplanation(recommendation, config);

  return recommendation;
}

// ============================================================================
// RECOMMENDATION SET BUILDER
// ============================================================================

/**
 * Build complete recommendation set
 */
export function buildRecommendationSet(
  studentId: string,
  recommendations: ConfidenceAwareRecommendation[],
  config: ConfidenceAwareRecommendationConfig = DEFAULT_CONFIDENCE_AWARE_CONFIG
): ConfidenceAwareRecommendationSet {
  if (recommendations.length === 0) {
    throw new Error('Cannot build recommendation set with no recommendations');
  }

  // Sort by expected utility
  const sorted = [...recommendations].sort(
    (a, b) => b.score.expectedUtility - a.score.expectedUtility
  );

  const primary = sorted[0];
  const alternatives = sorted.slice(1).filter(
    r => r.classification.strength !== 'not-recommended'
  );

  // Calculate overall metrics
  const viableOptions = sorted.filter(
    r => r.classification.strength !== 'not-recommended'
  ).length;

  let complexity: ConfidenceAwareRecommendationSet['overall']['complexity'];
  if (viableOptions <= 2) complexity = 'simple';
  else if (viableOptions <= 5) complexity = 'moderate';
  else complexity = 'complex';

  const overallConfidence = Math.round(
    sorted.reduce((sum, r) => sum + r.score.confidence, 0) / sorted.length
  );

  const sufficientInformation = overallConfidence >= 60 && primary.score.confidence >= 60;

  return {
    id: `recommendation-set-${studentId}-${Date.now()}`,
    studentId,
    primary,
    alternatives: alternatives.slice(0, config.maxAlternatives),
    allRecommendations: sorted,
    overall: {
      viableOptions,
      complexity,
      overallConfidence,
      sufficientInformation,
    },
  };
}

// ============================================================================
// CONFIDENCE-AWARE RECOMMENDATION ENGINE CLASS
// ============================================================================

export class ConfidenceAwareRecommendationEngineV1 {
  private config: ConfidenceAwareRecommendationConfig;

  constructor(config?: Partial<ConfidenceAwareRecommendationConfig>) {
    this.config = { ...DEFAULT_CONFIDENCE_AWARE_CONFIG, ...config };
  }

  /**
   * Calculate utility bounds
   */
  calculateBounds(expectedUtility: number, confidence: number): UtilityBounds {
    return calculateUtilityBounds(expectedUtility, confidence, this.config);
  }

  /**
   * Classify recommendation strength
   */
  classifyStrength(
    expectedUtility: number,
    confidence: number,
    riskScore: number
  ): RecommendationStrength {
    return classifyRecommendationStrength(expectedUtility, confidence, riskScore, this.config);
  }

  /**
   * Calculate decision risk
   */
  calculateRisk(
    expectedUtility: number,
    confidence: number,
    worstCase: number,
    dealBreakerCount: number
  ): { score: number; level: DecisionRiskLevel } {
    return calculateDecisionRisk(expectedUtility, confidence, worstCase, dealBreakerCount, this.config);
  }

  /**
   * Build recommendation
   */
  buildRecommendation(
    recommendationId: string,
    studentId: string,
    pathId: string,
    pathName: string,
    pathDescription: string,
    careerId: string,
    expectedUtility: number,
    confidence: number,
    finalConfidenceData: FinalDecisionConfidence,
    rank: number,
    totalOptions: number,
    margin: number,
    keyStrengths: string[],
    keyConcerns: string[],
    dealBreakers: string[],
    alternatives: ConfidenceAwareRecommendation['comparison']['alternatives']
  ): ConfidenceAwareRecommendation {
    return buildConfidenceAwareRecommendation(
      recommendationId,
      studentId,
      pathId,
      pathName,
      pathDescription,
      careerId,
      expectedUtility,
      confidence,
      finalConfidenceData,
      rank,
      totalOptions,
      margin,
      keyStrengths,
      keyConcerns,
      dealBreakers,
      alternatives,
      this.config
    );
  }

  /**
   * Build recommendation set
   */
  buildSet(
    studentId: string,
    recommendations: ConfidenceAwareRecommendation[]
  ): ConfidenceAwareRecommendationSet {
    return buildRecommendationSet(studentId, recommendations, this.config);
  }

  /**
   * Generate explanation
   */
  explain(recommendation: ConfidenceAwareRecommendation): ConfidenceAwareRecommendation['explanation'] {
    return generateRecommendationExplanation(recommendation, this.config);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConfidenceAwareRecommendationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ConfidenceAwareRecommendationConfig {
    return { ...this.config };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createConfidenceAwareRecommendationEngine(
  config?: Partial<ConfidenceAwareRecommendationConfig>
): ConfidenceAwareRecommendationEngineV1 {
  return new ConfidenceAwareRecommendationEngineV1(config);
}


