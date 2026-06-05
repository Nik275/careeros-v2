/**
 * Similar Student Engine - Types
 * 
 * Type definitions for student similarity analysis.
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type { EntityId } from '../types/index.js';

// ============================================================================
// SIMILARITY SCORES
// ============================================================================

/** Similarity score range (0.0 - 1.0) */
export type SimilarityScore = number;

/** Individual dimension similarity score */
export interface DimensionSimilarity {
  /** Normalized similarity score (0.0 - 1.0) */
  score: SimilarityScore;
  
  /** Weight of this dimension in overall calculation */
  weight: number;
  
  /** Detailed breakdown of similarities/differences */
  details: SimilarityDetail[];
  
  /** Confidence in this similarity measurement */
  confidence: number;
}

/** Detailed similarity breakdown */
export interface SimilarityDetail {
  /** Aspect being compared (e.g., "analytical_thinking", "income_bracket") */
  aspect: string;
  
  /** Student A value */
  valueA: unknown;
  
  /** Student B value */
  valueB: unknown;
  
  /** Similarity for this specific aspect (0.0 - 1.0) */
  similarity: SimilarityScore;
  
  /** Human-readable description */
  description: string;
}

// ============================================================================
// SIMILARITY ANALYSIS
// ============================================================================

/** Complete similarity analysis between two students */
export interface SimilarityAnalysis {
  /** Reference student ID */
  referenceStudentId: EntityId;
  
  /** Comparison student ID */
  comparisonStudentId: EntityId;
  
  /** Overall similarity score (0.0 - 1.0) */
  overallScore: SimilarityScore;
  
  /** Dimension-specific similarities */
  dimensions: {
    psychological: DimensionSimilarity;
    economic: DimensionSimilarity;
    educational: DimensionSimilarity;
    utility: DimensionSimilarity;
    lifestyle: DimensionSimilarity;
  };
  
  /** Human-readable explanation */
  explanation: SimilarityExplanation;
  
  /** Confidence in overall analysis */
  confidence: number;
  
  /** Timestamp of analysis */
  computedAt: number;
}

/** Human-readable explanation of similarity */
export interface SimilarityExplanation {
  /** Brief summary (1-2 sentences) */
  summary: string;
  
  /** Key areas of similarity */
  keySimilarities: string[];
  
  /** Key areas of difference */
  keyDifferences: string[];
  
  /** Why these students might benefit from comparison */
  comparisonValue: string;
  
  /** Suggested insights to share */
  suggestedInsights: string[];
}

// ============================================================================
// SIMILAR STUDENT RESULTS
// ============================================================================

/** Result for a single similar student match */
export interface SimilarStudentMatch {
  /** Student ID */
  studentId: EntityId;
  
  /** Student belief data */
  studentBelief: StudentBeliefV3;
  
  /** Overall similarity score */
  similarityScore: SimilarityScore;
  
  /** Dimension scores */
  dimensionScores: {
    psychological: number;
    economic: number;
    educational: number;
    utility: number;
    lifestyle: number;
  };
  
  /** What makes them similar */
  similarityFactors: SimilarityFactor[];
  
  /** What makes them different */
  differenceFactors: DifferenceFactor[];
  
  /** Rank in results (1 = most similar) */
  rank: number;
}

/** Factor contributing to similarity */
export interface SimilarityFactor {
  /** Dimension (psychological, economic, etc.) */
  dimension: string;
  
  /** Specific attribute */
  attribute: string;
  
  /** Similarity score for this factor */
  score: SimilarityScore;
  
  /** Description of similarity */
  description: string;
  
  /** Importance weight */
  weight: number;
}

/** Factor contributing to difference */
export interface DifferenceFactor {
  /** Dimension */
  dimension: string;
  
  /** Specific attribute */
  attribute: string;
  
  /** Difference magnitude (0.0 - 1.0) */
  difference: number;
  
  /** Description of difference */
  description: string;
  
  /** Impact on overall similarity */
  impact: 'low' | 'medium' | 'high';
}

// ============================================================================
// ENGINE INPUTS/OUTPUTS
// ============================================================================

/** Input for finding similar students */
export interface FindSimilarStudentsInput {
  /** Reference student to compare against */
  referenceStudent: StudentBeliefV3;
  
  /** Pool of students to search within */
  candidatePool: StudentBeliefV3[];
  
  /** Number of similar students to return */
  topK?: number;
  
  /** Minimum similarity threshold (0.0 - 1.0) */
  minThreshold?: number;
  
  /** Dimensions to prioritize */
  priorityDimensions?: SimilarityDimension[];
  
  /** Custom weights for dimensions */
  dimensionWeights?: Partial<DimensionWeights>;
  
  /** Whether to include explanations */
  includeExplanations?: boolean;
}

/** Output from similar students search */
export interface FindSimilarStudentsOutput {
  /** Reference student ID */
  referenceStudentId: EntityId;
  
  /** Most similar students found */
  similarStudents: SimilarStudentMatch[];
  
  /** Pool statistics */
  statistics: SimilarityStatistics;
  
  /** Analysis metadata */
  metadata: {
    poolSize: number;
    candidatesConsidered: number;
    threshold: number;
    computationTimeMs: number;
  };
}

/** Available similarity dimensions */
export type SimilarityDimension = 
  | 'psychological'
  | 'economic' 
  | 'educational'
  | 'utility'
  | 'lifestyle';

/** Weight configuration for dimensions */
export interface DimensionWeights {
  psychological: number;
  economic: number;
  educational: number;
  utility: number;
  lifestyle: number;
}

/** Statistical summary of similarity scores */
export interface SimilarityStatistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  quartiles: [number, number, number];
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/** Configuration for SimilarStudentEngine */
export interface SimilarStudentEngineConfig {
  /** Default dimension weights */
  defaultWeights: DimensionWeights;
  
  /** Default similarity threshold */
  defaultThreshold: number;
  
  /** Default number of results */
  defaultTopK: number;
  
  /** Whether to normalize scores */
  normalizeScores: boolean;
  
  /** Algorithm variant to use */
  algorithm: 'weighted_euclidean' | 'cosine' | 'manhattan';
  
  /** Minimum confidence required for a match */
  minConfidenceThreshold: number;
}

/** Default configuration */
export const DEFAULT_CONFIG: SimilarStudentEngineConfig = {
  defaultWeights: {
    psychological: 0.30,
    economic: 0.20,
    educational: 0.20,
    utility: 0.20,
    lifestyle: 0.10,
  },
  defaultThreshold: 0.5,
  defaultTopK: 10,
  normalizeScores: true,
  algorithm: 'weighted_euclidean',
  minConfidenceThreshold: 0.6,
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/** Preset configurations for common use cases */
export const SimilarityPresets = {
  /** Balanced consideration of all dimensions */
  balanced: (): Partial<DimensionWeights> => ({
    psychological: 0.25,
    economic: 0.20,
    educational: 0.20,
    utility: 0.20,
    lifestyle: 0.15,
  }),
  
  /** Prioritize psychological profile similarity */
  psychologicallySimilar: (): Partial<DimensionWeights> => ({
    psychological: 0.50,
    economic: 0.10,
    educational: 0.15,
    utility: 0.15,
    lifestyle: 0.10,
  }),
  
  /** Prioritize economic/reality similarity */
  economicallySimilar: (): Partial<DimensionWeights> => ({
    psychological: 0.15,
    economic: 0.45,
    educational: 0.15,
    utility: 0.15,
    lifestyle: 0.10,
  }),
  
  /** Prioritize educational background similarity */
  educationallySimilar: (): Partial<DimensionWeights> => ({
    psychological: 0.15,
    economic: 0.15,
    educational: 0.45,
    utility: 0.15,
    lifestyle: 0.10,
  }),
  
  /** Prioritize utility/career preference similarity */
  utilitySimilar: (): Partial<DimensionWeights> => ({
    psychological: 0.20,
    economic: 0.10,
    educational: 0.15,
    utility: 0.45,
    lifestyle: 0.10,
  }),
  
  /** For outcome learning - emphasize psychological and utility */
  forOutcomeLearning: (): Partial<DimensionWeights> => ({
    psychological: 0.35,
    economic: 0.15,
    educational: 0.15,
    utility: 0.30,
    lifestyle: 0.05,
  }),
};
