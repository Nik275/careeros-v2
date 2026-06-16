/**
 * CareerOS Uncertainty Engine
 * 
 * Measures model uncertainty, decision uncertainty, outcome uncertainty,
 * and recommendation uncertainty to identify where CareerOS lacks confidence.
 * 
 * Core Philosophy: Not all uncertainty is equal. We must distinguish between
 * epistemic uncertainty (lack of knowledge) and aleatoric uncertainty 
 * (inherent randomness in career outcomes).
 */

import {
  UncertaintyLevel,
  UncertaintyScore,
  ModelUncertainty,
  DecisionUncertainty,
  OutcomeUncertainty,
  RecommendationUncertainty,
  UncertaintyProfile,
  UncertaintyEngineConfig,
  StudentProfile,
  Recommendation,
  OutcomeMetrics,
  ActiveLearningMetrics,
} from './active-learning-types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_UNCERTAINTY_CONFIG: UncertaintyEngineConfig = {
  modelUncertaintyWeight: 0.3,
  decisionUncertaintyWeight: 0.25,
  outcomeUncertaintyWeight: 0.25,
  recommendationUncertaintyWeight: 0.2,
  temporalDecayFactor: 0.95,
  minimumSampleSize: 10,
};

// ============================================================================
// UNCERTAINTY CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate entropy-based uncertainty from probability distribution
 */
export function calculateEntropy(probabilities: number[]): number {
  if (probabilities.length === 0) return 1;
  
  return probabilities.reduce((entropy, p) => {
    if (p <= 0 || p >= 1) return entropy;
    return entropy - p * Math.log2(p);
  }, 0) / Math.log2(probabilities.length || 2);
}

/**
 * Calculate variance-based uncertainty
 */
export function calculateVariance(values: number[]): number {
  if (values.length < 2) return 1;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  // Normalize to 0-1 range (assuming max variance is 0.25 for binary outcomes)
  return Math.min(variance * 4, 1);
}

/**
 * Calculate confidence interval width as uncertainty measure
 */
export function calculateConfidenceIntervalUncertainty(
  values: number[],
  confidenceLevel: number = 0.95
): number {
  if (values.length < 2) return 1;
  
  const sorted = [...values].sort((a, b) => a - b);
  const lowerIndex = Math.floor((1 - confidenceLevel) / 2 * values.length);
  const upperIndex = Math.ceil((1 + confidenceLevel) / 2 * values.length);
  
  const ciWidth = sorted[upperIndex] - sorted[lowerIndex];
  const range = sorted[sorted.length - 1] - sorted[0] || 1;
  
  return Math.min(ciWidth / range, 1);
}

/**
 * Calculate prediction variance from ensemble predictions
 */
export function calculatePredictionVariance(predictions: number[][]): UncertaintyScore {
  if (predictions.length === 0 || predictions[0].length === 0) {
    return { value: 1, level: UncertaintyLevel.CRITICAL, confidence: 0 };
  }
  
  const numPredictions = predictions.length;
  const numClasses = predictions[0].length;
  
  // Calculate variance for each class across ensemble
  const classVariances: number[] = [];
  
  for (let classIdx = 0; classIdx < numClasses; classIdx++) {
    const classPredictions = predictions.map(p => p[classIdx]);
    const variance = calculateVariance(classPredictions);
    classVariances.push(variance);
  }
  
  // Average variance across all classes
  const avgVariance = classVariances.reduce((a, b) => a + b, 0) / classVariances.length;
  
  return {
    value: avgVariance,
    level: valueToUncertaintyLevel(avgVariance),
    confidence: Math.min(numPredictions / 100, 1),
  };
}

/**
 * Convert numeric uncertainty value to level
 */
export function valueToUncertaintyLevel(value: number): UncertaintyLevel {
  if (value < 0.1) return UncertaintyLevel.VERY_LOW;
  if (value < 0.25) return UncertaintyLevel.LOW;
  if (value < 0.45) return UncertaintyLevel.MEDIUM;
  if (value < 0.65) return UncertaintyLevel.HIGH;
  if (value < 0.85) return UncertaintyLevel.VERY_HIGH;
  return UncertaintyLevel.CRITICAL;
}

/**
 * Combine multiple uncertainty scores with weights
 */
export function combineUncertaintyScores(
  scores: { score: UncertaintyScore; weight: number }[]
): UncertaintyScore {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  
  if (totalWeight === 0) {
    return { value: 0, level: UncertaintyLevel.VERY_LOW, confidence: 1 };
  }
  
  const weightedValue = scores.reduce(
    (sum, s) => sum + s.score.value * s.weight,
    0
  ) / totalWeight;
  
  const weightedConfidence = scores.reduce(
    (sum, s) => sum + s.score.confidence * s.weight,
    0
  ) / totalWeight;
  
  return {
    value: weightedValue,
    level: valueToUncertaintyLevel(weightedValue),
    confidence: weightedConfidence,
  };
}

// ============================================================================
// MODEL UNCERTAINTY CALCULATION
// ============================================================================

interface ModelPredictionData {
  ensemblePredictions: number[][];
  trainingDataSize: number;
  featureCoverage: number;
  modelAge: number; // Days since last training
  validationAccuracy: number;
}

/**
 * Calculate epistemic uncertainty (due to lack of knowledge)
 */
export function calculateEpistemicUncertainty(
  data: ModelPredictionData
): UncertaintyScore {
  const factors = [];
  
  // Uncertainty from limited training data
  const dataUncertainty = Math.max(0, 1 - data.trainingDataSize / 1000);
  factors.push({ value: dataUncertainty, weight: 0.3 });
  
  // Uncertainty from feature coverage gaps
  const coverageUncertainty = 1 - data.featureCoverage;
  factors.push({ value: coverageUncertainty, weight: 0.25 });
  
  // Uncertainty from model staleness
  const stalenessUncertainty = Math.min(data.modelAge / 365, 1) * 0.5;
  factors.push({ value: stalenessUncertainty, weight: 0.2 });
  
  // Uncertainty from validation performance
  const performanceUncertainty = 1 - data.validationAccuracy;
  factors.push({ value: performanceUncertainty, weight: 0.25 });
  
  const combinedValue = factors.reduce(
    (sum, f) => sum + f.value * f.weight,
    0
  );
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(data.trainingDataSize / 500, 1),
  };
}

/**
 * Calculate aleatoric uncertainty (inherent randomness)
 */
export function calculateAleatoricUncertainty(
  outcomeVariability: number,
  domainInherentRandomness: number
): UncertaintyScore {
  // Career outcomes have inherent uncertainty due to:
  // - Market fluctuations
  // - Personal circumstances
  // - Luck and timing
  // - Unpredictable events
  
  const combinedValue = (outcomeVariability * 0.6 + domainInherentRandomness * 0.4);
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: 0.8, // Aleatoric uncertainty is more predictable
  };
}

/**
 * Calculate complete model uncertainty
 */
export function calculateModelUncertainty(
  predictionData: ModelPredictionData,
  outcomeVariability: number = 0.3,
  domainInherentRandomness: number = 0.25
): ModelUncertainty {
  const predictionVariance = calculatePredictionVariance(
    predictionData.ensemblePredictions
  );
  
  const epistemicUncertainty = calculateEpistemicUncertainty(predictionData);
  
  const aleatoricUncertainty = calculateAleatoricUncertainty(
    outcomeVariability,
    domainInherentRandomness
  );
  
  // Total uncertainty combines both types
  // Using the formula: Total² = Epistemic² + Aleatoric²
  const totalValue = Math.sqrt(
    Math.pow(epistemicUncertainty.value, 2) + 
    Math.pow(aleatoricUncertainty.value, 2)
  ) / Math.sqrt(2); // Normalize to 0-1
  
  const totalUncertainty: UncertaintyScore = {
    value: Math.min(totalValue, 1),
    level: valueToUncertaintyLevel(totalValue),
    confidence: (epistemicUncertainty.confidence + aleatoricUncertainty.confidence) / 2,
  };
  
  return {
    predictionVariance,
    epistemicUncertainty,
    aleatoricUncertainty,
    totalUncertainty,
  };
}

// ============================================================================
// DECISION UNCERTAINTY CALCULATION
// ============================================================================

interface DecisionContext {
  availableOptions: string[];
  optionScores: number[];
  preferenceData: Record<string, number>;
  temporalStability: number; // How stable preferences are over time
  informationCompleteness: number;
}

/**
 * Calculate option ambiguity uncertainty
 */
export function calculateOptionAmbiguity(
  context: DecisionContext
): UncertaintyScore {
  const { availableOptions, optionScores, informationCompleteness } = context;
  
  if (availableOptions.length === 0) {
    return { value: 1, level: UncertaintyLevel.CRITICAL, confidence: 0 };
  }
  
  // Entropy of option distribution
  const scoreSum = optionScores.reduce((a, b) => a + b, 0) || 1;
  const normalizedScores = optionScores.map(s => s / scoreSum);
  const entropyUncertainty = calculateEntropy(normalizedScores);
  
  // Uncertainty from incomplete information about options
  const informationUncertainty = 1 - informationCompleteness;
  
  // Combine factors
  const combinedValue = entropyUncertainty * 0.6 + informationUncertainty * 0.4;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: informationCompleteness,
  };
}

/**
 * Calculate outcome uncertainty for decisions
 */
export function calculateDecisionOutcomeUncertainty(
  historicalOutcomes: number[],
  outcomePredictions: number[]
): UncertaintyScore {
  if (historicalOutcomes.length === 0) {
    return { value: 0.8, level: UncertaintyLevel.HIGH, confidence: 0.3 };
  }
  
  // Variance in historical outcomes
  const historicalVariance = calculateVariance(historicalOutcomes);
  
  // Uncertainty from prediction-historical mismatch
  const predictionUncertainty = outcomePredictions.length > 0
    ? calculateVariance(outcomePredictions)
    : 0.5;
  
  const combinedValue = historicalVariance * 0.5 + predictionUncertainty * 0.5;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(historicalOutcomes.length / 100, 1),
  };
}

/**
 * Calculate preference uncertainty
 */
export function calculatePreferenceUncertainty(
  preferenceData: Record<string, number>,
  temporalStability: number
): UncertaintyScore {
  const preferenceValues = Object.values(preferenceData);
  
  if (preferenceValues.length === 0) {
    return { value: 1, level: UncertaintyLevel.CRITICAL, confidence: 0 };
  }
  
  // Uncertainty from preference inconsistency
  const preferenceVariance = calculateVariance(preferenceValues);
  
  // Uncertainty from temporal instability
  const temporalUncertainty = 1 - temporalStability;
  
  const combinedValue = preferenceVariance * 0.4 + temporalUncertainty * 0.6;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: temporalStability,
  };
}

/**
 * Calculate temporal uncertainty
 */
export function calculateTemporalUncertainty(
  decisionHistory: { timestamp: Date; decision: string }[],
  currentTimestamp: Date
): UncertaintyScore {
  if (decisionHistory.length < 2) {
    return { value: 0.7, level: UncertaintyLevel.HIGH, confidence: 0.2 };
  }
  
  // Calculate decision change frequency
  let changes = 0;
  for (let i = 1; i < decisionHistory.length; i++) {
    if (decisionHistory[i].decision !== decisionHistory[i - 1].decision) {
      changes++;
    }
  }
  
  const changeRate = changes / (decisionHistory.length - 1);
  
  // Recency-weighted change rate
  const recentChanges = decisionHistory
    .slice(-5)
    .filter((d, i, arr) => i > 0 && d.decision !== arr[i - 1].decision).length;
  const recentChangeRate = Math.min(recentChanges / 4, 1);
  
  const combinedValue = changeRate * 0.4 + recentChangeRate * 0.6;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(decisionHistory.length / 20, 1),
  };
}

/**
 * Calculate complete decision uncertainty
 */
export function calculateDecisionUncertainty(
  context: DecisionContext,
  historicalOutcomes: number[] = [],
  outcomePredictions: number[] = [],
  decisionHistory: { timestamp: Date; decision: string }[] = [],
  currentTimestamp: Date = new Date()
): DecisionUncertainty {
  const optionAmbiguity = calculateOptionAmbiguity(context);
  
  const outcomeUncertainty = calculateDecisionOutcomeUncertainty(
    historicalOutcomes,
    outcomePredictions
  );
  
  const preferenceUncertainty = calculatePreferenceUncertainty(
    context.preferenceData,
    context.temporalStability
  );
  
  const temporalUncertainty = calculateTemporalUncertainty(
    decisionHistory,
    currentTimestamp
  );
  
  return {
    optionAmbiguity,
    outcomeUncertainty,
    preferenceUncertainty,
    temporalUncertainty,
  };
}

// ============================================================================
// OUTCOME UNCERTAINTY CALCULATION
// ============================================================================

interface OutcomeContext {
  predictedProbability: number;
  probabilityDistribution: number[];
  historicalAccuracy: number;
  sampleSize: number;
  timeHorizon: number; // Months
  externalFactors: string[];
}

/**
 * Calculate probability uncertainty
 */
export function calculateProbabilityUncertainty(
  context: OutcomeContext
): UncertaintyScore {
  const { predictedProbability, probabilityDistribution, sampleSize, historicalAccuracy } = context;
  
  // Uncertainty from probability being near 0.5 (maximum uncertainty)
  const proximityToFifty = 1 - Math.abs(predictedProbability - 0.5) * 2;
  
  // Uncertainty from distribution spread
  const distributionUncertainty = calculateVariance(probabilityDistribution);
  
  // Uncertainty from limited sample size
  const sampleUncertainty = Math.max(0, 1 - sampleSize / 200);
  
  // Uncertainty from poor historical accuracy
  const accuracyUncertainty = 1 - historicalAccuracy;
  
  const combinedValue = 
    proximityToFifty * 0.3 +
    distributionUncertainty * 0.25 +
    sampleUncertainty * 0.25 +
    accuracyUncertainty * 0.2;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(sampleSize / 100, historicalAccuracy),
  };
}

/**
 * Calculate timing uncertainty
 */
export function calculateTimingUncertainty(
  timeHorizon: number,
  historicalTimingVariance: number,
  externalFactors: string[]
): UncertaintyScore {
  // Longer time horizons have more uncertainty
  const horizonUncertainty = Math.min(timeHorizon / 60, 1);
  
  // Historical variance in timing
  const varianceUncertainty = historicalTimingVariance;
  
  // External factors add uncertainty
  const externalUncertainty = Math.min(externalFactors.length / 10, 1);
  
  const combinedValue = 
    horizonUncertainty * 0.4 +
    varianceUncertainty * 0.35 +
    externalUncertainty * 0.25;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: 0.7,
  };
}

/**
 * Calculate magnitude uncertainty
 */
export function calculateMagnitudeUncertainty(
  predictedMagnitude: number,
  historicalMagnitudes: number[],
  economicVolatility: number
): UncertaintyScore {
  if (historicalMagnitudes.length === 0) {
    return { value: 0.9, level: UncertaintyLevel.CRITICAL, confidence: 0.1 };
  }
  
  // Variance in historical magnitudes
  const historicalVariance = calculateVariance(historicalMagnitudes);
  
  // Uncertainty from prediction being outside historical range
  const min = Math.min(...historicalMagnitudes);
  const max = Math.max(...historicalMagnitudes);
  const outOfRangeUncertainty = predictedMagnitude < min || predictedMagnitude > max
    ? 0.3
    : 0;
  
  // Economic volatility uncertainty
  const economicUncertainty = economicVolatility;
  
  const combinedValue = Math.min(
    historicalVariance * 0.5 + outOfRangeUncertainty + economicUncertainty * 0.3,
    1
  );
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(historicalMagnitudes.length / 50, 1),
  };
}

/**
 * Calculate causal uncertainty
 */
export function calculateCausalUncertainty(
  knownCausalFactors: string[],
  potentialConfounders: string[],
  causalModelConfidence: number
): UncertaintyScore {
  // More confounders = more causal uncertainty
  const confounderUncertainty = Math.min(potentialConfounders.length / 20, 1);
  
  // Inverse of causal model confidence
  const modelUncertainty = 1 - causalModelConfidence;
  
  // Uncertainty from incomplete causal knowledge
  const knowledgeUncertainty = Math.max(0, 1 - knownCausalFactors.length / 10);
  
  const combinedValue = 
    confounderUncertainty * 0.4 +
    modelUncertainty * 0.35 +
    knowledgeUncertainty * 0.25;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: causalModelConfidence,
  };
}

/**
 * Calculate complete outcome uncertainty
 */
export function calculateOutcomeUncertainty(
  context: OutcomeContext,
  historicalMagnitudes: number[] = [],
  predictedMagnitude: number = 0.5,
  historicalTimingVariance: number = 0.3,
  economicVolatility: number = 0.2,
  knownCausalFactors: string[] = [],
  potentialConfounders: string[] = [],
  causalModelConfidence: number = 0.5
): OutcomeUncertainty {
  const probabilityUncertainty = calculateProbabilityUncertainty(context);
  
  const timingUncertainty = calculateTimingUncertainty(
    context.timeHorizon,
    historicalTimingVariance,
    context.externalFactors
  );
  
  const magnitudeUncertainty = calculateMagnitudeUncertainty(
    predictedMagnitude,
    historicalMagnitudes,
    economicVolatility
  );
  
  const causalUncertainty = calculateCausalUncertainty(
    knownCausalFactors,
    potentialConfounders,
    causalModelConfidence
  );
  
  return {
    probabilityUncertainty,
    timingUncertainty,
    magnitudeUncertainty,
    causalUncertainty,
  };
}

// ============================================================================
// RECOMMENDATION UNCERTAINTY CALCULATION
// ============================================================================

interface RecommendationContext {
  recommendation: Recommendation;
  historicalRecommendations: Recommendation[];
  studentFeedback: { recommendationId: string; rating: number }[];
  modelVersions: string[];
  featureImportance: Record<string, number>;
}

/**
 * Calculate rank uncertainty
 */
export function calculateRankUncertainty(
  context: RecommendationContext
): UncertaintyScore {
  const { recommendation, historicalRecommendations } = context;
  
  // Check if this recommendation's rank has been stable
  const sameRankCount = historicalRecommendations.filter(
    r => r.id === recommendation.id && r.rank === recommendation.rank
  ).length;
  
  const rankStability = historicalRecommendations.length > 0
    ? sameRankCount / historicalRecommendations.length
    : 0;
  const recommendationRank = recommendation.rank ?? 0;
  
  // Uncertainty from rank instability
  const instabilityUncertainty = 1 - rankStability;
  
  // Uncertainty from being in middle ranks (more competition)
  const middleRankUncertainty = recommendationRank > 2 && recommendationRank < 8
    ? 0.2
    : 0;
  
  const combinedValue = Math.min(instabilityUncertainty + middleRankUncertainty, 1);
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(historicalRecommendations.length / 50, 1),
  };
}

/**
 * Calculate score uncertainty
 */
export function calculateScoreUncertainty(
  context: RecommendationContext
): UncertaintyScore {
  const { recommendation, historicalRecommendations, studentFeedback } = context;
  
  // Variance in historical scores for this recommendation
  const historicalScores = historicalRecommendations
    .filter(r => r.id === recommendation.id)
    .map(r => r.confidence || 0.5);
  
  const scoreVariance = historicalScores.length > 0
    ? calculateVariance(historicalScores)
    : 0.5;
  
  // Uncertainty from feedback mismatch
  const relevantFeedback = studentFeedback.filter(
    f => f.recommendationId === recommendation.id
  );
  
  let feedbackUncertainty = 0;
  if (relevantFeedback.length > 0) {
    const avgFeedback = relevantFeedback.reduce((sum, f) => sum + f.rating, 0) / relevantFeedback.length;
    const scoreFeedbackDiff = Math.abs((recommendation.confidence || 0.5) - avgFeedback / 5);
    feedbackUncertainty = scoreFeedbackDiff;
  }
  
  const combinedValue = scoreVariance * 0.6 + feedbackUncertainty * 0.4;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(historicalRecommendations.length / 30, 1),
  };
}

/**
 * Calculate stability uncertainty
 */
export function calculateStabilityUncertainty(
  context: RecommendationContext
): UncertaintyScore {
  const { recommendation, historicalRecommendations, modelVersions } = context;
  
  // Check if recommendation appears across model versions
  const versionConsistency = modelVersions.length > 0
    ? historicalRecommendations.filter(r => r.id === recommendation.id).length / modelVersions.length
    : 0;
  
  // Uncertainty from model version inconsistency
  const versionUncertainty = 1 - versionConsistency;
  
  // Uncertainty from feature importance changes
  const featureStability = Object.values(context.featureImportance).reduce(
    (sum, imp) => sum + (imp > 0.1 ? 1 : 0),
    0
  ) / Object.keys(context.featureImportance).length || 1;
  
  const featureUncertainty = 1 - featureStability;
  
  const combinedValue = versionUncertainty * 0.6 + featureUncertainty * 0.4;
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: Math.min(modelVersions.length / 10, 1),
  };
}

/**
 * Calculate explanation uncertainty
 */
export function calculateExplanationUncertainty(
  context: RecommendationContext
): UncertaintyScore {
  const { recommendation, featureImportance } = context;
  
  // Uncertainty from low explanation coverage
  const explanationCoverage = recommendation.explanation
    ? recommendation.explanation.factors?.length || 0
    : 0;
  const coverageUncertainty = Math.max(0, 1 - explanationCoverage / 5);
  
  // Uncertainty from unclear feature importance
  const importanceClarity = Object.values(featureImportance).filter(imp => imp > 0.15).length;
  const clarityUncertainty = Math.max(0, 1 - importanceClarity / 3);
  
  // Uncertainty from missing explanation
  const missingExplanationUncertainty = !recommendation.explanation ? 0.5 : 0;
  
  const combinedValue = Math.min(
    coverageUncertainty * 0.4 +
    clarityUncertainty * 0.35 +
    missingExplanationUncertainty,
    1
  );
  
  return {
    value: combinedValue,
    level: valueToUncertaintyLevel(combinedValue),
    confidence: recommendation.explanation ? 0.8 : 0.3,
  };
}

/**
 * Calculate complete recommendation uncertainty
 */
export function calculateRecommendationUncertainty(
  context: RecommendationContext
): RecommendationUncertainty {
  const rankUncertainty = calculateRankUncertainty(context);
  const scoreUncertainty = calculateScoreUncertainty(context);
  const stabilityUncertainty = calculateStabilityUncertainty(context);
  const explanationUncertainty = calculateExplanationUncertainty(context);
  
  return {
    rankUncertainty,
    scoreUncertainty,
    stabilityUncertainty,
    explanationUncertainty,
  };
}

// ============================================================================
// COMPOSITE UNCERTAINTY PROFILE
// ============================================================================

interface UncertaintyCalculationInput {
  studentId: string;
  studentProfile: StudentProfile;
  modelPredictionData: ModelPredictionData;
  decisionContext: DecisionContext;
  outcomeContext: OutcomeContext;
  recommendationContext: RecommendationContext;
  historicalUncertainty?: UncertaintyProfile[];
}

/**
 * Calculate complete uncertainty profile for a student
 */
export function calculateUncertaintyProfile(
  input: UncertaintyCalculationInput,
  config: UncertaintyEngineConfig = DEFAULT_UNCERTAINTY_CONFIG
): UncertaintyProfile {
  const {
    studentId,
    modelPredictionData,
    decisionContext,
    outcomeContext,
    recommendationContext,
    historicalUncertainty = [],
  } = input;
  
  // Calculate all uncertainty types
  const modelUncertainty = calculateModelUncertainty(modelPredictionData);
  
  const decisionUncertainty = calculateDecisionUncertainty(
    decisionContext,
    [], // historicalOutcomes
    [], // outcomePredictions
    [], // decisionHistory
    new Date()
  );
  
  const outcomeUncertainty = calculateOutcomeUncertainty(
    outcomeContext,
    [], // historicalMagnitudes
    0.5, // predictedMagnitude
    0.3, // historicalTimingVariance
    0.2, // economicVolatility
    [], // knownCausalFactors
    [], // potentialConfounders
    0.5 // causalModelConfidence
  );
  
  const recommendationUncertainty = calculateRecommendationUncertainty(
    recommendationContext
  );
  
  // Calculate composite uncertainty
  const compositeUncertainty = combineUncertaintyScores([
    { score: modelUncertainty.totalUncertainty, weight: config.modelUncertaintyWeight },
    { score: decisionUncertainty.optionAmbiguity, weight: config.decisionUncertaintyWeight },
    { score: outcomeUncertainty.probabilityUncertainty, weight: config.outcomeUncertaintyWeight },
    { score: recommendationUncertainty.scoreUncertainty, weight: config.recommendationUncertaintyWeight },
  ]);
  
  // Determine dominant uncertainty source
  const uncertainties = [
    { source: 'model', value: modelUncertainty.totalUncertainty.value },
    { source: 'decision', value: decisionUncertainty.optionAmbiguity.value },
    { source: 'outcome', value: outcomeUncertainty.probabilityUncertainty.value },
    { source: 'recommendation', value: recommendationUncertainty.scoreUncertainty.value },
  ];
  
  const dominantSource = uncertainties.reduce((max, curr) => 
    curr.value > max.value ? curr : max
  );
  
  // Calculate uncertainty trend
  const uncertaintyTrend = calculateUncertaintyTrend(
    compositeUncertainty.value,
    historicalUncertainty
  );
  
  return {
    studentId,
    timestamp: new Date(),
    modelUncertainty,
    decisionUncertainty,
    outcomeUncertainty,
    recommendationUncertainty,
    compositeUncertainty,
    dominantUncertaintySource: dominantSource.source,
    uncertaintyTrend,
  };
}

/**
 * Calculate uncertainty trend from historical data
 */
function calculateUncertaintyTrend(
  currentUncertainty: number,
  historicalUncertainty: UncertaintyProfile[]
): 'increasing' | 'decreasing' | 'stable' {
  if (historicalUncertainty.length < 2) {
    return 'stable';
  }
  
  const recentValues = historicalUncertainty
    .slice(-5)
    .map(h => h.compositeUncertainty.value);
  
  const avgHistorical = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  
  const difference = currentUncertainty - avgHistorical;
  const threshold = 0.1;
  
  if (difference > threshold) return 'increasing';
  if (difference < -threshold) return 'decreasing';
  return 'stable';
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export interface BatchUncertaintyResult {
  profiles: UncertaintyProfile[];
  highUncertaintyStudents: string[];
  averageUncertainty: number;
  uncertaintyDistribution: Record<UncertaintyLevel, number>;
  processingTime: number;
}

/**
 * Process uncertainty calculations for multiple students
 */
export async function calculateUncertaintyBatch(
  inputs: UncertaintyCalculationInput[],
  config: UncertaintyEngineConfig = DEFAULT_UNCERTAINTY_CONFIG
): Promise<BatchUncertaintyResult> {
  const startTime = Date.now();
  
  const profiles: UncertaintyProfile[] = [];
  const highUncertaintyStudents: string[] = [];
  const uncertaintyDistribution: Record<UncertaintyLevel, number> = {
    [UncertaintyLevel.VERY_LOW]: 0,
    [UncertaintyLevel.LOW]: 0,
    [UncertaintyLevel.MEDIUM]: 0,
    [UncertaintyLevel.HIGH]: 0,
    [UncertaintyLevel.VERY_HIGH]: 0,
    [UncertaintyLevel.CRITICAL]: 0,
  };
  
  for (const input of inputs) {
    const profile = calculateUncertaintyProfile(input, config);
    profiles.push(profile);
    
    // Track high uncertainty students
    if (profile.compositeUncertainty.level === UncertaintyLevel.HIGH ||
        profile.compositeUncertainty.level === UncertaintyLevel.VERY_HIGH ||
        profile.compositeUncertainty.level === UncertaintyLevel.CRITICAL) {
      highUncertaintyStudents.push(input.studentId);
    }
    
    // Update distribution
    uncertaintyDistribution[profile.compositeUncertainty.level]++;
  }
  
  const totalUncertainty = profiles.reduce(
    (sum, p) => sum + p.compositeUncertainty.value,
    0
  );
  
  return {
    profiles,
    highUncertaintyStudents,
    averageUncertainty: profiles.length > 0 ? totalUncertainty / profiles.length : 0,
    uncertaintyDistribution,
    processingTime: Date.now() - startTime,
  };
}

// ============================================================================
// UNCERTAINTY ENGINE CLASS
// ============================================================================

export class UncertaintyEngine {
  private config: UncertaintyEngineConfig;
  private metrics: ActiveLearningMetrics;
  private uncertaintyHistory: Map<string, UncertaintyProfile[]>;
  
  constructor(config: Partial<UncertaintyEngineConfig> = {}) {
    this.config = { ...DEFAULT_UNCERTAINTY_CONFIG, ...config };
    this.metrics = {
      totalStudentsProcessed: 0,
      averageLearningValue: 0,
      highValueStudentPercentage: 0,
      boundaryDetectionRate: 0,
      evidenceGapClosureRate: 0,
      modelImprovementRate: 0,
      informationGainPerStudent: 0,
    };
    this.uncertaintyHistory = new Map();
  }
  
  /**
   * Calculate uncertainty profile for a single student
   */
  calculateUncertainty(input: UncertaintyCalculationInput): UncertaintyProfile {
    const historicalUncertainty = this.uncertaintyHistory.get(input.studentId) || [];
    
    const profile = calculateUncertaintyProfile(input, this.config);
    
    // Store in history
    if (!this.uncertaintyHistory.has(input.studentId)) {
      this.uncertaintyHistory.set(input.studentId, []);
    }
    this.uncertaintyHistory.get(input.studentId)!.push(profile);
    
    // Keep only last 20 entries
    const history = this.uncertaintyHistory.get(input.studentId)!;
    if (history.length > 20) {
      this.uncertaintyHistory.set(input.studentId, history.slice(-20));
    }
    
    this.metrics.totalStudentsProcessed++;
    
    return profile;
  }
  
  /**
   * Calculate uncertainty for multiple students
   */
  async calculateBatch(inputs: UncertaintyCalculationInput[]): Promise<BatchUncertaintyResult> {
    return calculateUncertaintyBatch(inputs, this.config);
  }
  
  /**
   * Get students with highest uncertainty
   */
  getHighUncertaintyStudents(threshold: UncertaintyLevel = UncertaintyLevel.HIGH): string[] {
    const highUncertaintyStudents: string[] = [];
    
    for (const [studentId, history] of this.uncertaintyHistory.entries()) {
      const latest = history[history.length - 1];
      if (latest && this.uncertaintyLevelMeetsThreshold(latest.compositeUncertainty.level, threshold)) {
        highUncertaintyStudents.push(studentId);
      }
    }
    
    return highUncertaintyStudents;
  }
  
  /**
   * Check if uncertainty level meets threshold
   */
  private uncertaintyLevelMeetsThreshold(
    level: UncertaintyLevel,
    threshold: UncertaintyLevel
  ): boolean {
    const levels = [
      UncertaintyLevel.VERY_LOW,
      UncertaintyLevel.LOW,
      UncertaintyLevel.MEDIUM,
      UncertaintyLevel.HIGH,
      UncertaintyLevel.VERY_HIGH,
      UncertaintyLevel.CRITICAL,
    ];
    
    return levels.indexOf(level) >= levels.indexOf(threshold);
  }
  
  /**
   * Get uncertainty trend for a student
   */
  getUncertaintyTrend(studentId: string): 'increasing' | 'decreasing' | 'stable' | null {
    const history = this.uncertaintyHistory.get(studentId);
    if (!history || history.length < 2) return null;
    
    return history[history.length - 1].uncertaintyTrend ?? null;
  }
  
  /**
   * Get historical uncertainty data for a student
   */
  getUncertaintyHistory(studentId: string): UncertaintyProfile[] {
    return this.uncertaintyHistory.get(studentId) || [];
  }

  updateUncertainty(
    studentId: string,
    update: { predicted: number; actual: number; confidence: number }
  ): void {
    const value = Math.min(Math.abs(update.actual - update.predicted) / 100, 1);
    const profile = this.uncertaintyHistory.get(studentId)?.at(-1);
    if (!profile) {
      return;
    }

    profile.compositeUncertainty = {
      value,
      level: valueToUncertaintyLevel(value),
      confidence: update.confidence,
    };
  }
  
  /**
   * Get engine metrics
   */
  getMetrics(): ActiveLearningMetrics {
    return { ...this.metrics };
  }

  getStats(): ActiveLearningMetrics {
    return this.getMetrics();
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<UncertaintyEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Get current configuration
   */
  getConfig(): UncertaintyEngineConfig {
    return { ...this.config };
  }
  
  /**
   * Clear all history
   */
  clearHistory(): void {
    this.uncertaintyHistory.clear();
  }

  clear(): void {
    this.clearHistory();
  }
  
  /**
   * Get uncertainty statistics across all students
   */
  getStatistics(): {
    averageUncertainty: number;
    medianUncertainty: number;
    stdDeviation: number;
    levelDistribution: Record<UncertaintyLevel, number>;
  } {
    const latestUncertainties: number[] = [];
    const levelDistribution: Record<UncertaintyLevel, number> = {
      [UncertaintyLevel.VERY_LOW]: 0,
      [UncertaintyLevel.LOW]: 0,
      [UncertaintyLevel.MEDIUM]: 0,
      [UncertaintyLevel.HIGH]: 0,
      [UncertaintyLevel.VERY_HIGH]: 0,
      [UncertaintyLevel.CRITICAL]: 0,
    };
    
    for (const history of this.uncertaintyHistory.values()) {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        latestUncertainties.push(latest.compositeUncertainty.value);
        levelDistribution[latest.compositeUncertainty.level]++;
      }
    }
    
    if (latestUncertainties.length === 0) {
      return {
        averageUncertainty: 0,
        medianUncertainty: 0,
        stdDeviation: 0,
        levelDistribution,
      };
    }
    
    const average = latestUncertainties.reduce((a, b) => a + b, 0) / latestUncertainties.length;
    
    const sorted = [...latestUncertainties].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    const variance = latestUncertainties.reduce(
      (sum, val) => sum + Math.pow(val - average, 2),
      0
    ) / latestUncertainties.length;
    const stdDeviation = Math.sqrt(variance);
    
    return {
      averageUncertainty: average,
      medianUncertainty: median,
      stdDeviation,
      levelDistribution,
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const uncertaintyEngine = new UncertaintyEngine();
