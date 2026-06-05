/**
 * CareerOS Career Taxonomy & Relationship System - Type Definitions
 *
 * Phase C.2: Career Taxonomy & Relationship Engine
 *
 * Defines the graph structure and relationship models for careers.
 *
 * @module career-taxonomy-types
 * @version 1.0.0
 */

import type { CareerId } from '../career-intelligence/career-types';

/**
 * Unique identifier for a career node in the taxonomy graph.
 */
export type CareerNodeId = CareerId;

/**
 * Career node in the taxonomy graph.
 */
export interface CareerNode {
  /** Unique node identifier */
  id: CareerNodeId;

  /** Career title */
  title: string;

  /** Primary category */
  category: CareerCategory;

  /** Sub-category classification */
  subCategory: string;

  /** Detailed taxonomy path */
  taxonomyPath: TaxonomyPath;

  /** Node metadata */
  metadata: CareerNodeMetadata;

  /** Reference to full career intelligence */
  careerIntelligenceRef?: CareerId;
}

/**
 * Career category classification.
 */
export type CareerCategory =
  | 'TECHNOLOGY'
  | 'HEALTHCARE'
  | 'BUSINESS'
  | 'CREATIVE'
  | 'SCIENCE'
  | 'ENGINEERING'
  | 'EDUCATION'
  | 'LEGAL'
  | 'FINANCE'
  | 'GOVERNMENT'
  | 'TRADE'
  | 'SERVICE'
  | 'OTHER';

/**
 * Hierarchical taxonomy path.
 */
export interface TaxonomyPath {
  /** Level 1: Domain */
  domain: string;

  /** Level 2: Category */
  category: string;

  /** Level 3: Sub-category */
  subCategory: string;

  /** Level 4: Specialization (optional) */
  specialization?: string;

  /** Full path as string */
  fullPath: string;
}

/**
 * Career node metadata.
 */
export interface CareerNodeMetadata {
  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Version of taxonomy data */
  version: string;

  /** Data source */
  source: string;

  /** Verification status */
  isVerified: boolean;
}

/**
 * Relationship between two careers.
 */
export interface CareerRelationship {
  /** Source career */
  sourceCareerId: CareerNodeId;

  /** Target career */
  targetCareerId: CareerNodeId;

  /** Type of relationship */
  relationshipType: RelationshipType;

  /** Relationship strength (0-100) */
  strength: number;

  /** Confidence in relationship (0-100) */
  confidence: number;

  /** Evidence for relationship */
  evidence: RelationshipEvidence[];

  /** Directionality of relationship */
  directionality: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL';

  /** Metadata */
  metadata: RelationshipMetadata;
}

/**
 * Types of career relationships.
 */
export type RelationshipType =
  | 'SIMILAR'
  | 'ADJACENT'
  | 'TRANSITION'
  | 'SPECIALIZATION'
  | 'GENERALIZATION'
  | 'FOUNDATION_FOR'
  | 'ALTERNATIVE_TO';

/**
 * Evidence for a relationship.
 */
export interface RelationshipEvidence {
  /** Evidence type */
  type: 'SKILL_OVERLAP' | 'COGNITIVE_SIMILARITY' | 'TRANSITION_DATA' | 'EXPERT_ASSESSMENT';

  /** Evidence description */
  description: string;

  /** Supporting score (0-100) */
  score: number;

  /** Evidence weight (0-1) */
  weight: number;
}

/**
 * Relationship metadata.
 */
export interface RelationshipMetadata {
  /** Creation timestamp */
  createdAt: Date;

  /** Last calculation timestamp */
  calculatedAt: Date;

  /** Calculation method used */
  calculationMethod: string;

  /** Data quality score */
  dataQuality: number;
}

/**
 * Career similarity analysis result.
 */
export interface CareerSimilarity {
  /** Careers being compared */
  careerA: CareerNodeId;
  careerB: CareerNodeId;

  /** Overall similarity score (0-100) */
  overallScore: number;

  /** Dimension-specific similarities */
  dimensions: SimilarityDimensions;

  /** Matching factors */
  matchingFactors: string[];

  /** Differentiating factors */
  differentiatingFactors: string[];

  /** Confidence in similarity assessment */
  confidence: number;
}

/**
 * Similarity across different dimensions.
 */
export interface SimilarityDimensions {
  /** Skill similarity (0-100) */
  skillSimilarity: number;

  /** Cognitive demand similarity (0-100) */
  cognitiveSimilarity: number;

  /** Lifestyle similarity (0-100) */
  lifestyleSimilarity: number;

  /** Motivational demand similarity (0-100) */
  motivationSimilarity: number;

  /** Work environment similarity (0-100) */
  workEnvironmentSimilarity: number;
}

/**
 * Career transition path.
 */
export interface CareerTransition {
  /** Unique transition identifier */
  id: string;

  /** Source career */
  fromCareerId: CareerNodeId;

  /** Target career */
  toCareerId: CareerNodeId;

  /** Transition type */
  transitionType: TransitionType;

  /** Difficulty score (0-100) */
  difficulty: number;

  /** Estimated time to complete (months) */
  estimatedTimeMonths: number;

  /** Required steps */
  requiredSteps: TransitionStep[];

  /** Prerequisites */
  prerequisites: string[];

  /** Success rate estimate (0-100) */
  successRate: number;

  /** Confidence in transition assessment */
  confidence: number;
}

/**
 * Types of career transitions.
 */
export type TransitionType =
  | 'PIVOT'
  | 'UPSKILL'
  | 'SPECIALIZATION'
  | 'GENERALIZATION'
  | 'LATERAL'
  | 'ADVANCEMENT'
  | 'ALTERNATIVE';

/**
 * Step in a career transition.
 */
export interface TransitionStep {
  /** Step order */
  order: number;

  /** Step description */
  description: string;

  /** Step type */
  type: 'EDUCATION' | 'CERTIFICATION' | 'EXPERIENCE' | 'SKILL' | 'NETWORK';

  /** Estimated time (months) */
  estimatedTimeMonths: number;

  /** Difficulty (0-100) */
  difficulty: number;
}

/**
 * Career graph structure.
 */
export interface CareerGraph {
  /** All career nodes */
  nodes: Map<CareerNodeId, CareerNode>;

  /** All relationships (adjacency list) */
  edges: Map<CareerNodeId, CareerRelationship[]>;

  /** Graph metadata */
  metadata: GraphMetadata;
}

/**
 * Graph metadata.
 */
export interface GraphMetadata {
  /** Total node count */
  nodeCount: number;

  /** Total edge count */
  edgeCount: number;

  /** Last updated timestamp */
  lastUpdated: Date;

  /** Graph version */
  version: string;
}

/**
 * Career path discovery result.
 */
export interface CareerPath {
  /** Path identifier */
  id: string;

  /** Starting career */
  startCareerId: CareerNodeId;

  /** Target career */
  endCareerId: CareerNodeId;

  /** Path as sequence of career IDs */
  path: CareerNodeId[];

  /** Path relationships */
  relationships: CareerRelationship[];

  /** Total path difficulty (0-100) */
  totalDifficulty: number;

  /** Estimated total time (months) */
  estimatedTimeMonths: number;

  /** Path confidence (0-100) */
  confidence: number;
}

/**
 * Optionality analysis for a career.
 */
export interface CareerOptionality {
  /** Career being analyzed */
  careerId: CareerNodeId;

  /** Alternative careers (if this doesn't work out) */
  alternatives: AlternativeCareer[];

  /** Future options (remaining after choosing this path) */
  futureOptions: FutureOption[];

  /** Optionality score (0-100) */
  optionalityScore: number;

  /** Lock-in risk score (0-100) */
  lockInRisk: number;

  /** Flexibility rating */
  flexibility: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Alternative career option.
 */
export interface AlternativeCareer {
  /** Alternative career */
  careerId: CareerNodeId;

  /** Reason this is an alternative */
  reason: string;

  /** Similarity to original career */
  similarityScore: number;

  /** Transition difficulty */
  transitionDifficulty: number;
}

/**
 * Future career option.
 */
export interface FutureOption {
  /** Future career option */
  careerId: CareerNodeId;

  /** Path from current career */
  path: CareerPath;

  /** Estimated time to reach */
  timeToReach: number;

  /** Difficulty of reaching */
  difficulty: number;
}

/**
 * Taxonomy query parameters.
 */
export interface TaxonomyQuery {
  /** Filter by category */
  category?: CareerCategory;

  /** Filter by sub-category */
  subCategory?: string;

  /** Filter by domain */
  domain?: string;

  /** Search term */
  searchTerm?: string;

  /** Include only verified careers */
  verifiedOnly?: boolean;
}

/**
 * Relationship query parameters.
 */
export interface RelationshipQuery {
  /** Source career */
  sourceCareerId?: CareerNodeId;

  /** Target career */
  targetCareerId?: CareerNodeId;

  /** Relationship types to include */
  relationshipTypes?: RelationshipType[];

  /** Minimum strength threshold */
  minStrength?: number;

  /** Minimum confidence threshold */
  minConfidence?: number;
}

/**
 * Transition query parameters.
 */
export interface TransitionQuery {
  /** From career */
  fromCareerId?: CareerNodeId;

  /** To career */
  toCareerId?: CareerNodeId;

  /** Maximum difficulty */
  maxDifficulty?: number;

  /** Maximum time (months) */
  maxTimeMonths?: number;

  /** Transition types to include */
  transitionTypes?: TransitionType[];
}

/**
 * Graph query parameters.
 */
export interface GraphQuery {
  /** Starting node */
  startNodeId: CareerNodeId;

  /** Maximum depth for traversal */
  maxDepth?: number;

  /** Relationship types to follow */
  relationshipTypes?: RelationshipType[];

  /** Minimum relationship strength */
  minStrength?: number;
}

/**
 * Graph traversal result.
 */
export interface GraphTraversalResult {
  /** Starting node */
  startNode: CareerNodeId;

  /** Discovered nodes */
  discoveredNodes: CareerNodeId[];

  /** Discovered edges */
  discoveredEdges: CareerRelationship[];

  /** Depth of each node */
  nodeDepths: Map<CareerNodeId, number>;

  /** Paths to each node */
  paths: Map<CareerNodeId, CareerPath>;
}

/**
 * Taxonomy configuration.
 */
export interface TaxonomyConfig {
  /** Default similarity threshold */
  defaultSimilarityThreshold: number;

  /** Default relationship strength threshold */
  defaultRelationshipThreshold: number;

  /** Maximum path length */
  maxPathLength: number;

  /** Enable automatic relationship detection */
  enableAutoDetection: boolean;

  /** Minimum confidence for relationships */
  minConfidenceThreshold: number;
}

/**
 * Default taxonomy configuration.
 */
export const DEFAULT_TAXONOMY_CONFIG: TaxonomyConfig = {
  defaultSimilarityThreshold: 60,
  defaultRelationshipThreshold: 50,
  maxPathLength: 5,
  enableAutoDetection: true,
  minConfidenceThreshold: 60,
};

/**
 * Similarity weights for different dimensions.
 */
export interface SimilarityWeights {
  skill: number;
  cognitive: number;
  lifestyle: number;
  motivation: number;
  workEnvironment: number;
}

/**
 * Default similarity weights.
 */
export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  skill: 0.25,
  cognitive: 0.25,
  lifestyle: 0.2,
  motivation: 0.15,
  workEnvironment: 0.15,
};
