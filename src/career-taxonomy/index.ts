/**
 * CareerOS Career Taxonomy & Relationship System
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Graph-based career taxonomy with relationships, transitions,
 * similarity calculations, and optionality analysis.
 *
 * @module career-taxonomy
 * @version 1.0.0
 */

// Main Engine
export {
  CareerTaxonomyEngine,
  createCareerTaxonomyEngine,
} from './career-taxonomy-engine';

// Component Engines
export {
  CareerGraphEngine,
  createCareerGraphEngine,
} from './career-graph-engine';

export {
  CareerRelationshipEngine,
  createCareerRelationshipEngine,
} from './career-relationship-engine';

export {
  CareerSimilarityEngine,
  createCareerSimilarityEngine,
} from './career-similarity-engine';

export {
  CareerTransitionEngine,
  createCareerTransitionEngine,
} from './career-transition-engine';

// Types
export type {
  CareerNodeId,
  CareerNode,
  CareerCategory,
  TaxonomyPath,
  CareerRelationship,
  RelationshipType,
  RelationshipEvidence,
  RelationshipMetadata,
  CareerSimilarity,
  SimilarityDimensions,
  CareerTransition,
  TransitionType,
  TransitionStep,
  CareerGraph,
  GraphMetadata,
  CareerPath,
  CareerOptionality,
  AlternativeCareer,
  FutureOption,
  TaxonomyQuery,
  RelationshipQuery,
  TransitionQuery,
  GraphQuery,
  GraphTraversalResult,
  TaxonomyConfig,
  SimilarityWeights,
} from './career-taxonomy-types';

// Constants
export {
  DEFAULT_TAXONOMY_CONFIG,
  DEFAULT_SIMILARITY_WEIGHTS,
} from './career-taxonomy-types';
