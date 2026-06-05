/**
 * Recommendation Stability Engine
 *
 * Phase 8.4: Recommendation Stability Engine
 *
 * Complete module for measuring recommendation stability, confidence,
 * volatility, uncertainty, and consensus.
 *
 * @module recommendation-stability
 * @version 1.0.0
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core Identifiers
  StabilityAnalysisId,
  PerturbationId,
  ConsensusId,

  // Perturbation Engine Types
  PerturbationIntensity,
  SimulationCount,
  PerturbationStrategy,
  PerturbationConfig,
  PerturbedProfile,
  PerturbationResult,
  PerturbationStatistics,

  // Consensus Engine Types
  ConsensusMethod,
  ConsensusConfig,
  ConsensusResult,
  ConsensusStrength,
  RecommendationFrequency,
  RankDistribution,

  // Confidence Engine Types
  ConfidenceBand,
  ConfidenceComponents,
  ConfidenceWeights,
  ConfidenceResult,

  // Stability Engine Types
  StabilityBand,
  StabilityMetrics,
  StabilityResult,
  StabilityForecast,

  // Volatility Engine Types
  VolatilityType,
  VolatilityMetrics,
  VolatilityResult,
  UnstableCluster,

  // Sensitivity Analysis Types
  FeatureImportance,
  SensitivityWeight,
  DimensionImpact,
  SensitivityResult,

  // Uncertainty Engine Types
  UncertaintySource,
  UncertaintyBand,
  UncertaintyType,
  UncertaintyContribution,
  UncertaintyResult,

  // Student Explanation Types
  StudentExplanation,
  ExplanationConfig,

  // Main Analysis Types
  StabilityAnalysisInput,
  StabilityAnalysisConfig,
  StabilityAnalysis,
  StabilityTelemetry,

  // Integration Types
  MentorStabilityContext,
  RecommendationStabilityContext,

  // Engine Interfaces
  IPerturbationEngine,
  IConsensusEngine,
  IConfidenceEngine,
  IStabilityEngine,
  IVolatilityEngine,
  ISensitivityAnalysisEngine,
  IUncertaintyEngine,
  IStudentExplanationEngine,
} from './recommendation-stability-types';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  DEFAULT_PERTURBATION_CONFIG,
  PERTURBATION_PARAMS,
  DEFAULT_CONSENSUS_CONFIG,
  DEFAULT_CONFIDENCE_WEIGHTS,
  DEFAULT_EXPLANATION_CONFIG,
  DEFAULT_STABILITY_ANALYSIS_CONFIG,
} from './recommendation-stability-types';

// ============================================================================
// PERTURBATION ENGINE
// ============================================================================

export {
  PerturbationEngine,
  createPerturbationEngine,
  perturbDimensionScore,
  SeededRandom,
} from './perturbation-engine';

// ============================================================================
// CONSENSUS ENGINE
// ============================================================================

export {
  RecommendationConsensusEngine,
  createConsensusEngine,
  calculateQuickConsensus,
  analyzeConsensusStability,
} from './recommendation-consensus-engine';

// ============================================================================
// CONFIDENCE ENGINE
// ============================================================================

export {
  ConfidenceEngine,
  createConfidenceEngine,
  calculateQuickConfidence,
  analyzeConfidenceComponents,
  isConfidenceActionable,
} from './confidence-engine';

// ============================================================================
// STABILITY ENGINE
// ============================================================================

export {
  StabilityEngine,
  createStabilityEngine,
  measureQuickStability,
  calculateStabilityMetrics,
} from './stability-engine';

// ============================================================================
// VOLATILITY ENGINE
// ============================================================================

export {
  VolatilityEngine,
  createVolatilityEngine,
  measureQuickVolatility,
  isVolatilityAcceptable,
} from './volatility-engine';

// ============================================================================
// SENSITIVITY ANALYSIS ENGINE
// ============================================================================

export {
  SensitivityAnalysisEngine,
  createSensitivityAnalysisEngine,
  analyzeQuickSensitivity,
  isProfileHighlySensitive,
} from './sensitivity-analysis-engine';

// ============================================================================
// UNCERTAINTY ENGINE
// ============================================================================

export {
  UncertaintyEngine,
  createUncertaintyEngine,
  calculateQuickUncertainty,
  getTopUncertaintySources,
} from './uncertainty-engine';

// ============================================================================
// STUDENT EXPLANATION ENGINE
// ============================================================================

export {
  StudentExplanationEngine,
  createStudentExplanationEngine,
  generateQuickExplanation,
  generateStabilitySummary,
} from './student-explanation-engine';

// ============================================================================
// MAIN STABILITY ENGINE
// ============================================================================

export {
  RecommendationStabilityEngine,
  createRecommendationStabilityEngine,
  analyzeStability,
  isRecommendationStable,
} from './recommendation-stability-engine';

export type {
  RecommendationGenerator,
} from './recommendation-stability-engine';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get stability band description
 */
export function getStabilityBandDescription(band: string): string {
  const descriptions: Record<string, string> = {
    ROCK_SOLID: 'Exceptionally stable - unlikely to change',
    HIGHLY_STABLE: 'Very stable - small variations expected',
    STABLE: 'Stable - consistent recommendation',
    MODERATELY_STABLE: 'Moderately stable - may evolve with exploration',
    UNSTABLE: 'Unstable - multiple options competing',
    HIGHLY_UNSTABLE: 'Highly unstable - early exploration phase',
  };
  return descriptions[band] ?? 'Unknown stability level';
}

/**
 * Get confidence band description
 */
export function getConfidenceBandDescription(band: string): string {
  const descriptions: Record<string, string> = {
    VERY_HIGH: 'Very high confidence - strong evidence',
    HIGH: 'High confidence - solid support',
    MODERATE: 'Moderate confidence - reasonable support',
    LOW: 'Low confidence - preliminary recommendation',
    VERY_LOW: 'Very low confidence - exploration needed',
  };
  return descriptions[band] ?? 'Unknown confidence level';
}

/**
 * Get uncertainty band description
 */
export function getUncertaintyBandDescription(band: string): string {
  const descriptions: Record<string, string> = {
    MINIMAL: 'Minimal uncertainty - very clear',
    LOW: 'Low uncertainty - clear direction',
    MODERATE: 'Moderate uncertainty - some ambiguity',
    HIGH: 'High uncertainty - significant ambiguity',
    VERY_HIGH: 'Very high uncertainty - needs exploration',
  };
  return descriptions[band] ?? 'Unknown uncertainty level';
}

/**
 * Check if analysis indicates a trustworthy recommendation
 */
export function isTrustworthyRecommendation(
  stabilityScore: number,
  confidenceScore: number,
  uncertaintyScore: number,
  thresholds: {
    minStability?: number;
    minConfidence?: number;
    maxUncertainty?: number;
  } = {}
): {
  trustworthy: boolean;
  reasons: string[];
} {
  const {
    minStability = 70,
    minConfidence = 60,
    maxUncertainty = 50,
  } = thresholds;

  const reasons: string[] = [];
  let trustworthy = true;

  if (stabilityScore < minStability) {
    trustworthy = false;
    reasons.push(`Stability (${stabilityScore}) below threshold (${minStability})`);
  }

  if (confidenceScore < minConfidence) {
    trustworthy = false;
    reasons.push(`Confidence (${confidenceScore}) below threshold (${minConfidence})`);
  }

  if (uncertaintyScore > maxUncertainty) {
    trustworthy = false;
    reasons.push(`Uncertainty (${uncertaintyScore}) above threshold (${maxUncertainty})`);
  }

  if (trustworthy) {
    reasons.push('All metrics within acceptable ranges');
  }

  return { trustworthy, reasons };
}

/**
 * Calculate overall recommendation quality score
 */
export function calculateRecommendationQuality(
  stabilityScore: number,
  confidenceScore: number,
  consensusScore: number,
  uncertaintyScore: number
): {
  qualityScore: number;
  qualityBand: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
} {
  // Weights for different factors
  const weights = {
    stability: 0.30,
    confidence: 0.30,
    consensus: 0.25,
    uncertainty: 0.15, // Inverted - lower is better
  };

  // Calculate weighted score
  const weightedScore =
    stabilityScore * weights.stability +
    confidenceScore * weights.confidence +
    consensusScore * weights.consensus +
    (100 - uncertaintyScore) * weights.uncertainty;

  const qualityScore = Math.round(weightedScore);

  // Determine quality band
  let qualityBand: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  if (qualityScore >= 85) {
    qualityBand = 'EXCELLENT';
  } else if (qualityScore >= 70) {
    qualityBand = 'GOOD';
  } else if (qualityScore >= 50) {
    qualityBand = 'FAIR';
  } else {
    qualityBand = 'POOR';
  }

  return { qualityScore, qualityBand };
}

/**
 * Format stability metrics for display
 */
export function formatStabilityMetrics(metrics: {
  stabilityScore: number;
  confidenceScore: number;
  consensusScore: number;
  uncertaintyScore: number;
}): string {
  return `
Recommendation Stability Metrics:
- Stability: ${metrics.stabilityScore}/100
- Confidence: ${metrics.confidenceScore}/100
- Consensus: ${metrics.consensusScore}%
- Uncertainty: ${metrics.uncertaintyScore}/100
  `.trim();
}

// ============================================================================
// MODULE VERSION
// ============================================================================

export const RECOMMENDATION_STABILITY_VERSION = '1.0.0';
export const RECOMMENDATION_STABILITY_PHASE = '8.4';
