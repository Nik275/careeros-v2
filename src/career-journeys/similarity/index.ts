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
  DEFAULT_SIMILARITY_WEIGHTS,
  
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
  DiversityOptions,
  
  // Configuration Types
  SimilarityEngineConfig,
  DEFAULT_SIMILARITY_CONFIG,
  CalculateSimilarityInput,
  CalculateSimilarityOutput,
  BatchSimilarityInput,
  BatchSimilarityOutput,
} from './journey-similarity-types';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export {
  JourneySimilarityEngine,
  JourneySimilarityEngineConfig,
  DEFAULT_ENGINE_CONFIG,
  ValidationResult,
  createJourneySimilarityEngine,
} from './journey-similarity-engine';

export {
  SimilarityCalculator,
  DimensionCalculator,
  DistanceResult,
  FeatureVector,
} from './similarity-calculator';

export {
  JourneyMatcher,
  JourneyRepository,
} from './journey-matcher';

export {
  SimilarityExplanationEngine,
} from './similarity-explanation-engine';

// ============================================================================
// MODULE VERSION
// ============================================================================

export const JOURNEY_SIMILARITY_VERSION = '8.2.0';
