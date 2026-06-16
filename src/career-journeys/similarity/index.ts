/**
 * Journey Similarity Engine - Module 8.2
 * 
 * Determines which career journeys are most relevant to a student.
 * 
 * Core Question: "Who started in a situation similar to mine?"
 * 
 * @module JourneySimilarity
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export {
  DEFAULT_SIMILARITY_WEIGHTS,
  DEFAULT_SIMILARITY_CONFIG,
} from './journey-similarity-types';

export type {
  // Core Types
  SimilarityResultId,
  SimilarityScore,
  // ConfidenceLevel REMOVED - Use Confidence from @/intelligence/confidence
  DimensionWeight,
  SimilarityLevel,
  RelevanceLevel,
  SimilarityDimension,
  DimensionSimilarity,
  SimilarityWeights,
  
  // Factor Types
  SimilarityFactor,
  Difference,
  OutcomeImplication,
  
  // Result Types
  JourneySimilarityResult,
  ConfidenceFactor,
  
  // Analysis Types
  SimilarityAnalysis,
  ScoreDistribution,
  SimilaritySummary,
  
  // Query Types
  SimilarityQuery,
  StudentProfileSnapshot,
  ArchetypeProfileSnapshot,
  MotivationProfileSnapshot,
  ConstraintProfileSnapshot,
  DecisionContextSnapshot,
  SimilarityFilters,
  
  // Explanation Types
  SimilarityExplanation,
  ExplanationTemplate,
  
  // Matching Types
  MatchCandidate,
  MatchRanking,
  MatchQuality,
  
  // Configuration Types
  SimilarityEngineConfig,
  CalculateSimilarityInput,
  CalculateSimilarityOutput,
  BatchSimilarityInput,
  BatchSimilarityOutput,
  DistanceResult,
  FeatureVector,
} from './journey-similarity-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  JourneySimilarityEngine,
  DEFAULT_ENGINE_CONFIG,
  createJourneySimilarityEngine,
} from './journey-similarity-engine';

export type {
  JourneySimilarityEngineConfig,
  ValidationResult,
} from './journey-similarity-engine';

export {
  SimilarityCalculator,
} from './similarity-calculator';

export type {
  DimensionCalculator,
} from './similarity-calculator';

export {
  JourneyMatcher,
} from './journey-matcher';

export type {
  JourneyRepository,
  DiversityOptions,
} from './journey-matcher';

export {
  SimilarityExplanationEngine,
} from './similarity-explanation-engine';

// ============================================================================
// MODULE VERSION
// ============================================================================

export const JOURNEY_SIMILARITY_VERSION = '8.2.0';
