/**
 * CareerOS Market Intelligence - Market Aware Career Analysis Model
 *
 * Represents a career analysis that incorporates market intelligence
 * as a modifier, not a primary driver.
 *
 * Priority Order:
 * 1. Psychological Fit
 * 2. Values Alignment
 * 3. Utility
 * 4. Optionality
 * 5. Future Resilience
 * 6. Market Intelligence (modifier)
 */

/**
 * Market-aware career analysis result.
 */
export interface MarketAwareCareerAnalysis {
  /** Career identifier */
  careerId: string;

  /** Career title */
  careerTitle: string;

  // Base scores (primary decision factors)
  /** Psychological fit score (0-100) */
  fitScore: number;

  /** Values alignment score (0-100) */
  valuesScore: number;

  /** Utility score (0-100) */
  utilityScore: number;

  /** Optionality score (0-100) */
  optionalityScore: number;

  /** Future resilience score (0-100) */
  resilienceScore: number;

  // Market score (modifier)
  /** Market conditions score (0-100) */
  marketScore: number;

  /** Market adjustment applied (can be positive or negative) */
  marketAdjustment: number;

  // Final calculation
  /** Final weighted score */
  finalScore: number;

  /** Overall confidence in recommendation */
  confidence: number;

  // Explanations
  /** Why this career is recommended */
  primaryReasons: string[];

  /** How market conditions affect the recommendation */
  marketImpact: string;

  /** Full explanation */
  explanation: string[];

  // Audit trail
  /** Whether market is the primary driver */
  marketDriven: boolean;

  /** Confidence adjustment from market conditions */
  confidenceAdjustment: number;

  /** Risk flags */
  riskFlags: string[];
}

/**
 * Input required before computed market-aware analysis fields are assigned.
 */
export type MarketAwareCareerAnalysisInput = Omit<
  MarketAwareCareerAnalysis,
  | 'marketAdjustment'
  | 'finalScore'
  | 'confidence'
  | 'marketImpact'
  | 'explanation'
  | 'marketDriven'
  | 'confidenceAdjustment'
  | 'riskFlags'
>;

/**
 * Weights for final score calculation.
 */
export interface ScoreWeights {
  fit: number;
  values: number;
  utility: number;
  optionality: number;
  resilience: number;
  market: number;
}

/**
 * Default weights - market has lowest weight.
 */
export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  fit: 0.3,        // Primary - psychological fit
  values: 0.2,     // Secondary - values alignment
  utility: 0.2,    // Tertiary - practical utility
  optionality: 0.1, // Fourth - career optionality
  resilience: 0.1,  // Fifth - future resilience
  market: 0.1,      // Last - market modifier
};

/**
 * Analysis configuration.
 */
export interface AnalysisConfig {
  /** Score weights */
  weights: ScoreWeights;

  /** Minimum fit threshold for recommendation */
  minFitThreshold: number;

  /** Market adjustment cap */
  maxMarketAdjustment: number;

  /** Confidence boost from strong market */
  confidenceBoostFactor: number;

  /** Confidence penalty from weak market */
  confidencePenaltyFactor: number;
}

/**
 * Default analysis configuration.
 */
export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  weights: DEFAULT_SCORE_WEIGHTS,
  minFitThreshold: 60,
  maxMarketAdjustment: 15,
  confidenceBoostFactor: 0.1,
  confidencePenaltyFactor: 0.15,
};

/**
 * Create market-aware career analysis.
 */
export function createMarketAwareAnalysis(
  params: MarketAwareCareerAnalysisInput,
  config: Partial<AnalysisConfig> = {}
): MarketAwareCareerAnalysis {
  const fullConfig = { ...DEFAULT_ANALYSIS_CONFIG, ...config };

  // Calculate market adjustment
  const marketAdjustment = calculateMarketAdjustment(
    params.marketScore,
    params.fitScore,
    fullConfig
  );

  // Calculate confidence adjustment
  const confidenceAdjustment = calculateConfidenceAdjustment(
    params.marketScore,
    params.fitScore,
    fullConfig
  );

  // Calculate final score
  const finalScore = calculateFinalScore(
    {
      fit: params.fitScore,
      values: params.valuesScore,
      utility: params.utilityScore,
      optionality: params.optionalityScore,
      resilience: params.resilienceScore,
      market: params.marketScore,
    },
    fullConfig.weights,
    marketAdjustment
  );

  // Calculate overall confidence
  const confidence = Math.min(
    100,
    Math.round(
      (params.fitScore * 0.3 +
        params.valuesScore * 0.2 +
        params.utilityScore * 0.2 +
        params.optionalityScore * 0.1 +
        params.resilienceScore * 0.1 +
        params.marketScore * 0.1) *
        (1 + confidenceAdjustment)
    )
  );

  // Determine if market-driven
  const marketDriven = isMarketDriven(
    params.fitScore,
    params.utilityScore,
    params.marketScore,
    fullConfig.weights
  );

  // Generate explanations
  const marketImpact = generateMarketImpactExplanation(
    params.marketScore,
    params.fitScore,
    marketAdjustment,
    confidenceAdjustment
  );

  const explanation = generateFullExplanation(
    params,
    marketAdjustment,
    confidenceAdjustment,
    finalScore,
    marketDriven,
    confidence
  );

  // Identify risk flags
  const riskFlags = identifyRiskFlags(params, marketAdjustment, confidence);

  return {
    ...params,
    marketAdjustment,
    finalScore,
    confidence,
    marketImpact,
    explanation,
    marketDriven,
    confidenceAdjustment,
    riskFlags,
  };
}

/**
 * Calculate market adjustment.
 */
function calculateMarketAdjustment(
  marketScore: number,
  fitScore: number,
  config: AnalysisConfig
): number {
  // Market adjustment is dampened when fit is strong
  // Strong fit careers get less market adjustment (both positive and negative)
  const fitDampening = fitScore > 75 ? 0.5 : fitScore > 60 ? 0.7 : 1.0;

  // Calculate adjustment
  // Market score > 70 = positive adjustment
  // Market score < 50 = negative adjustment
  let adjustment = 0;

  if (marketScore > 70) {
    adjustment = ((marketScore - 70) / 30) * config.maxMarketAdjustment;
  } else if (marketScore < 50) {
    adjustment = -((50 - marketScore) / 50) * config.maxMarketAdjustment;
  }

  return Math.round(adjustment * fitDampening);
}

/**
 * Calculate confidence adjustment.
 */
function calculateConfidenceAdjustment(
  marketScore: number,
  fitScore: number,
  config: AnalysisConfig
): number {
  // Strong market + strong fit = confidence boost
  if (marketScore > 75 && fitScore > 75) {
    return config.confidenceBoostFactor;
  }

  // Weak market + strong fit = confidence penalty (explained in narrative)
  if (marketScore < 50 && fitScore > 75) {
    return -config.confidencePenaltyFactor;
  }

  return 0;
}

/**
 * Calculate final weighted score.
 */
function calculateFinalScore(
  scores: {
    fit: number;
    values: number;
    utility: number;
    optionality: number;
    resilience: number;
    market: number;
  },
  weights: ScoreWeights,
  marketAdjustment: number
): number {
  const weightedSum =
    scores.fit * weights.fit +
    scores.values * weights.values +
    scores.utility * weights.utility +
    scores.optionality * weights.optionality +
    scores.resilience * weights.resilience +
    scores.market * weights.market;

  // Apply market adjustment as percentage
  const adjusted = weightedSum + marketAdjustment;

  return Math.max(0, Math.min(100, Math.round(adjusted)));
}

/**
 * Determine if recommendation is market-driven.
 */
function isMarketDriven(
  fitScore: number,
  utilityScore: number,
  marketScore: number,
  weights: ScoreWeights
): boolean {
  // Calculate weighted contribution of each factor
  const fitContribution = fitScore * weights.fit;
  const utilityContribution = utilityScore * weights.utility;
  const marketContribution = marketScore * weights.market;

  // Market-driven if market contribution exceeds fit + utility
  return marketContribution > fitContribution * 0.5 && marketContribution > utilityContribution * 0.5;
}

/**
 * Generate market impact explanation.
 */
function generateMarketImpactExplanation(
  marketScore: number,
  fitScore: number,
  marketAdjustment: number,
  confidenceAdjustment: number
): string {
  if (marketScore > 75) {
    if (fitScore > 75) {
      return `Strong market conditions complement excellent fit, boosting recommendation confidence by ${Math.round(
        confidenceAdjustment * 100
      )}%.`;
    }
    return `Favorable market conditions provide support, but fit remains primary consideration.`;
  }

  if (marketScore < 50) {
    if (fitScore > 75) {
      return `Despite challenging market conditions, strong fit justifies recommendation. Confidence reduced by ${Math.abs(
        Math.round(confidenceAdjustment * 100)
      )}% due to market headwinds.`;
    }
    return `Weak market conditions add risk to recommendation with modest fit.`;
  }

  return `Neutral market conditions neither strengthen nor weaken recommendation.`;
}

/**
 * Generate full explanation.
 */
function generateFullExplanation(
  params: MarketAwareCareerAnalysisInput,
  marketAdjustment: number,
  confidenceAdjustment: number,
  finalScore: number,
  marketDriven: boolean,
  confidence: number
): string[] {
  const explanation: string[] = [];

  // Primary driver
  if (params.fitScore >= params.utilityScore && params.fitScore >= params.marketScore) {
    explanation.push(`Recommendation driven primarily by strong psychological fit (${params.fitScore}/100).`);
  } else if (params.utilityScore >= params.marketScore) {
    explanation.push(`Recommendation driven primarily by practical utility (${params.utilityScore}/100).`);
  } else {
    explanation.push(`CAUTION: Recommendation appears market-driven rather than fit-driven.`);
  }

  // Values alignment
  if (params.valuesScore > 75) {
    explanation.push(`Strong values alignment (${params.valuesScore}/100) supports recommendation.`);
  }

  // Market impact
  if (marketAdjustment > 5) {
    explanation.push(`Favorable market conditions provide ${marketAdjustment}-point boost to final score.`);
  } else if (marketAdjustment < -5) {
    explanation.push(`Market headwinds reduce score by ${Math.abs(marketAdjustment)} points, but fit justifies recommendation.`);
  }

  // Confidence
  if (confidenceAdjustment > 0) {
    explanation.push(`High confidence (${confidence}%) due to alignment of fit and market conditions.`);
  } else if (confidenceAdjustment < 0) {
    explanation.push(`Moderate confidence (${confidence}%) due to fit-market divergence.`);
  }

  // Audit warning
  if (marketDriven) {
    explanation.push(`AUDIT: Verify this recommendation is not primarily market-driven.`);
  }

  return explanation;
}

/**
 * Identify risk flags.
 */
function identifyRiskFlags(
  params: MarketAwareCareerAnalysisInput,
  marketAdjustment: number,
  confidence: number
): string[] {
  const flags: string[] = [];

  if (params.fitScore < 60 && params.marketScore > 75) {
    flags.push('market-driven-low-fit');
  }

  if (params.marketScore < 40 && params.fitScore > 80) {
    flags.push('strong-fit-weak-market');
  }

  if (Math.abs(marketAdjustment) > 10) {
    flags.push('large-market-adjustment');
  }

  if (confidence < 60) {
    flags.push('low-overall-confidence');
  }

  return flags;
}

/**
 * Compare two analyses.
 */
export function compareAnalyses(
  a: MarketAwareCareerAnalysis,
  b: MarketAwareCareerAnalysis
): {
  betterFit: 'a' | 'b' | 'tie';
  betterMarket: 'a' | 'b' | 'tie';
  higherFinal: 'a' | 'b' | 'tie';
  recommendation: string;
} {
  const betterFit = a.fitScore > b.fitScore + 5 ? 'a' : b.fitScore > a.fitScore + 5 ? 'b' : 'tie';
  const betterMarket = a.marketScore > b.marketScore + 5 ? 'a' : b.marketScore > a.marketScore + 5 ? 'b' : 'tie';
  const higherFinal = a.finalScore > b.finalScore ? 'a' : b.finalScore > a.finalScore ? 'b' : 'tie';

  let recommendation: string;
  if (betterFit === 'a' && higherFinal === 'a') {
    recommendation = `Prefer ${a.careerTitle} based on superior fit.`;
  } else if (betterFit === 'b' && higherFinal === 'b') {
    recommendation = `Prefer ${b.careerTitle} based on superior fit.`;
  } else if (betterFit !== higherFinal) {
    recommendation = `Market conditions favor ${higherFinal === 'a' ? a.careerTitle : b.careerTitle}, but fit favors ${betterFit === 'a' ? a.careerTitle : b.careerTitle}.`;
  } else {
    recommendation = 'Both options have comparable fit; minor market factors may decide.';
  }

  return { betterFit, betterMarket, higherFinal, recommendation };
}

/**
 * Validate analysis configuration.
 */
export function validateConfig(config: AnalysisConfig): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check weights sum to 1.0
  const weightSum =
    config.weights.fit +
    config.weights.values +
    config.weights.utility +
    config.weights.optionality +
    config.weights.resilience +
    config.weights.market;

  if (Math.abs(weightSum - 1.0) > 0.01) {
    issues.push(`Weights sum to ${weightSum.toFixed(2)}, expected 1.0`);
  }

  // Check market weight is appropriate (should be <= 0.15)
  if (config.weights.market > 0.15) {
    issues.push(`Market weight ${config.weights.market} exceeds recommended maximum of 0.15`);
  }

  // Check fit has highest weight
  const maxWeight = Math.max(
    config.weights.fit,
    config.weights.values,
    config.weights.utility,
    config.weights.optionality,
    config.weights.resilience,
    config.weights.market
  );

  if (config.weights.fit !== maxWeight) {
    issues.push('Fit should have the highest weight for proper prioritization');
  }

  return { valid: issues.length === 0, issues };
}
