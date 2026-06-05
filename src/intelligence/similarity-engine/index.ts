/**
 * CareerOS Career Similarity Engine
 *
 * Multi-dimensional career similarity measurement system.
 *
 * @module similarity-engine
 * @version 1.0.0
 */

export {
  // Main Engine
  CareerSimilarityEngine,
  createSimilarityEngine,
  quickSimilarity,
  SimilarityEngines,
  DEFAULT_WEIGHTS,
} from './CareerSimilarityEngine';

// Types
export type {
  DimensionSimilarity,
  CareerSimilarityResult,
  SimilarityExplanation,
  SimilarityOptions,
  DimensionWeights,
  BatchSimilarityResult,
  SimilarityStatistics,
} from './CareerSimilarityEngine';
