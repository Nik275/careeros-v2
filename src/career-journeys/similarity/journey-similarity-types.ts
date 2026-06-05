/**
 * Journey Similarity Types
 * 
 * Type definitions for the Journey Similarity Engine (Phase 8.2).
 * Defines similarity dimensions, scoring, confidence, and explanation structures.
 * 
 * @module JourneySimilarityTypes
 */

import {
  CareerJourney,
  JourneyId,
  CityTier,
  EducationMilestone,
  CareerPosition,
  CareerDecision,
  TurningPoint,
  Constraint,
  ConstraintType,
} from '../career-journey-types';

// ============================================================================
// CORE SIMILARITY TYPES
// ============================================================================

/**
 * Unique identifier for a similarity result
 */
export type SimilarityResultId = string & { readonly __brand: 'SimilarityResultId' };

/**
 * Similarity score ranging from 0 (completely different) to 1 (identical)
 */
export type SimilarityScore = number;

/**
 * Confidence level in a similarity calculation
 */
// CONFIDENCE PURIFICATION: Use Confidence type from constitutional authority
import type { Confidence } from '../../intelligence/confidence';

/**
 * Weight assigned to a similarity dimension
 */
export type DimensionWeight = number;

/**
 * Similarity level classification
 */
export type SimilarityLevel = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

/**
 * Relevance classification for a journey match
 */
export type RelevanceLevel = 'HIGHLY_RELEVANT' | 'RELEVANT' | 'SOMEWHAT_RELEVANT' | 'MINIMALLY_RELEVANT' | 'NOT_RELEVANT';

// ============================================================================
// SIMILARITY DIMENSIONS
// ============================================================================

/**
 * Dimensions along which similarity is calculated
 */
export type SimilarityDimension =
  | 'ARCHETYPE'
  | 'MOTIVATION'
  | 'CONSTRAINT'
  | 'EDUCATION'
  | 'LOCATION'
  | 'CAREER_GOAL'
  | 'DECISION_CONTEXT'
  | 'STARTING_POINT'
  | 'PERSONALITY_TRAITS'
  | 'BACKGROUND';

/**
 * Score for a single similarity dimension
 */
export interface DimensionSimilarity {
  dimension: SimilarityDimension;
  score: SimilarityScore;
  weight: DimensionWeight;
  weightedScore: SimilarityScore;
  confidence: Confidence;
  details: string;
  contributingFactors: string[];
}

/**
 * Configuration for similarity dimension weights
 */
export interface SimilarityWeights {
  archetype: DimensionWeight;
  motivation: DimensionWeight;
  constraint: DimensionWeight;
  education: DimensionWeight;
  location: DimensionWeight;
  careerGoal: DimensionWeight;
  decisionContext: DimensionWeight;
  startingPoint: DimensionWeight;
  personalityTraits: DimensionWeight;
  background: DimensionWeight;
}

/**
 * Default similarity weights
 */
export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  archetype: 0.20,
  motivation: 0.15,
  constraint: 0.15,
  education: 0.15,
  location: 0.10,
  careerGoal: 0.15,
  decisionContext: 0.05,
  startingPoint: 0.03,
  personalityTraits: 0.01,
  background: 0.01,
};

// ============================================================================
// SIMILARITY FACTORS
// ============================================================================

/**
 * Factor contributing to similarity
 */
export interface SimilarityFactor {
  factor: string;
  dimension: SimilarityDimension;
  impact: 'STRONGLY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'STRONGLY_NEGATIVE';
  description: string;
}

/**
 * Difference between student and journey
 */
export interface Difference {
  aspect: string;
  dimension: SimilarityDimension;
  studentValue: string;
  journeyValue: string;
  impact: 'MAJOR' | 'MODERATE' | 'MINOR' | 'NEGLIGIBLE';
  outcomeImplication: string;
}

/**
 * Outcome implication of a difference
 */
export interface OutcomeImplication {
  difference: string;
  likelyImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNCERTAIN';
  explanation: string;
  mitigation?: string;
}

// ============================================================================
// SIMILARITY RESULT
// ============================================================================

/**
 * Complete similarity result for a journey match
 */
export interface JourneySimilarityResult {
  id: SimilarityResultId;
  journeyId: JourneyId;
  journey: CareerJourney;
  
  // Scoring
  similarityScore: SimilarityScore;
  similarityLevel: SimilarityLevel;
  relevanceLevel: RelevanceLevel;
  
  // Dimension breakdown
  dimensionScores: DimensionSimilarity[];
  
  // Analysis
  similarityFactors: SimilarityFactor[];
  differences: Difference[];
  outcomeImplications: OutcomeImplication[];
  
  // Confidence
  confidence: Confidence;
  confidenceFactors: ConfidenceFactor[];
  
  // Metadata
  calculatedAt: Date;
  calculationVersion: string;
}

/**
 * Factor affecting confidence
 */
export interface ConfidenceFactor {
  factor: string;
  impact: 'INCREASES' | 'DECREASES';
  magnitude: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

// ============================================================================
// SIMILARITY ANALYSIS
// ============================================================================

/**
 * Comprehensive similarity analysis
 */
export interface SimilarityAnalysis {
  queryId: string;
  query: SimilarityQuery;
  
  // Results
  results: JourneySimilarityResult[];
  totalJourneysAnalyzed: number;
  
  // Distribution
  scoreDistribution: ScoreDistribution;
  dimensionAverages: Record<SimilarityDimension, SimilarityScore>;
  
  // Top matches
  topMatches: JourneySimilarityResult[];
  highlyRelevantCount: number;
  relevantCount: number;
  
  // Patterns
  commonFactors: string[];
  commonDifferences: string[];
  
  // Summary
  summary: SimilaritySummary;
}

/**
 * Distribution of similarity scores
 */
export interface ScoreDistribution {
  veryHigh: number;
  high: number;
  moderate: number;
  low: number;
  veryLow: number;
}

/**
 * Summary of similarity analysis
 */
export interface SimilaritySummary {
  overallAssessment: string;
  strongestDimension: SimilarityDimension;
  weakestDimension: SimilarityDimension;
  keyInsight: string;
  recommendation: string;
}

// ============================================================================
// SIMILARITY QUERY
// ============================================================================

/**
 * Query for finding similar journeys
 */
export interface SimilarityQuery {
  studentProfile: StudentProfileSnapshot;
  archetypeProfile?: ArchetypeProfileSnapshot;
  motivationProfile?: MotivationProfileSnapshot;
  constraintProfile?: ConstraintProfileSnapshot;
  decisionContext?: DecisionContextSnapshot;
  
  // Filters
  filters?: SimilarityFilters;
  
  // Configuration
  weights?: Partial<SimilarityWeights>;
  minScore?: SimilarityScore;
  maxResults?: number;
  includeExplanations?: boolean;
}

/**
 * Student profile snapshot for similarity
 */
export interface StudentProfileSnapshot {
  location: {
    cityTier: CityTier;
    region?: string;
  };
  education: {
    currentLevel: string;
    fieldOfStudy: string;
    institutionTier?: string;
    expectedGraduation?: Date;
  };
  careerGoals: string[];
  interests: string[];
  skills: string[];
  constraints?: string[];
}

/**
 * Archetype profile snapshot
 */
export interface ArchetypeProfileSnapshot {
  primaryArchetype: string;
  secondaryArchetypes: string[];
  archetypeScores: Record<string, number>;
}

/**
 * Motivation profile snapshot
 */
export interface MotivationProfileSnapshot {
  primaryMotivators: string[];
  motivationScores: Record<string, number>;
  driveType: 'INTRINSIC' | 'EXTRINSIC' | 'MIXED';
}

/**
 * Constraint profile snapshot
 */
export interface ConstraintProfileSnapshot {
  constraints: Array<{
    type: ConstraintType;
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  }>;
  flexibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Decision context snapshot
 */
export interface DecisionContextSnapshot {
  currentDecision: string;
  alternatives: string[];
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  stakes: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Filters for similarity search
 */
export interface SimilarityFilters {
  minJourneyCompleteness?: number;
  requireSuccessfulOutcome?: boolean;
  maxAgeInYears?: number;
  industries?: string[];
  excludeIndustries?: string[];
  requiredStartingPointSimilarity?: number;
}

// ============================================================================
// SIMILARITY EXPLANATION
// ============================================================================

/**
 * Generated explanation for similarity
 */
export interface SimilarityExplanation {
  resultId: SimilarityResultId;
  journeyId: JourneyId;
  
  // Explanations
  relevanceExplanation: string;
  similarityExplanation: string;
  differenceExplanation: string;
  recommendationExplanation: string;
  
  // Highlights
  keySimilarities: string[];
  keyDifferences: string[];
  keyTakeaways: string[];
  
  // Narrative
  narrative: string;
  
  // Metadata
  generatedAt: Date;
  explanationQuality: 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'LIMITED';
}

/**
 * Explanation template
 */
export interface ExplanationTemplate {
  id: string;
  template: string;
  variables: string[];
  condition: (result: JourneySimilarityResult) => boolean;
  priority: number;
}

// ============================================================================
// MATCHING TYPES
// ============================================================================

/**
 * Match candidate
 */
export interface MatchCandidate {
  journey: CareerJourney;
  preliminaryScore: SimilarityScore;
  disqualifyingFactors: string[];
  qualifyingFactors: string[];
}

/**
 * Match ranking
 */
export interface MatchRanking {
  rankedResults: JourneySimilarityResult[];
  rankingMethod: 'SIMILARITY_SCORE' | 'RELEVANCE' | 'CONFIDENCE' | 'HYBRID';
  tieBreakers: string[];
}

/**
 * Match quality assessment
 */
export interface MatchQuality {
  overallQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  coverageScore: number;
  diversityScore: number;
  confidenceScore: number;
  improvementSuggestions: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for similarity engine
 */
export interface SimilarityEngineConfig {
  weights: SimilarityWeights;
  thresholds: {
    veryHigh: number;
    high: number;
    moderate: number;
    low: number;
  };
  confidence: {
    minDataQuality: number;
    minProfileCompleteness: number;
    minJourneyCompleteness: number;
  };
  calculation: {
    includeExplanations: boolean;
    includeDifferences: boolean;
    includeOutcomeImplications: boolean;
    maxResults: number;
    parallelProcessing: boolean;
  };
}

/**
 * Default similarity engine configuration
 */
export const DEFAULT_SIMILARITY_CONFIG: SimilarityEngineConfig = {
  weights: DEFAULT_SIMILARITY_WEIGHTS,
  thresholds: {
    veryHigh: 0.85,
    high: 0.70,
    moderate: 0.50,
    low: 0.30,
  },
  confidence: {
    minDataQuality: 0.6,
    minProfileCompleteness: 0.5,
    minJourneyCompleteness: 0.4,
  },
  calculation: {
    includeExplanations: true,
    includeDifferences: true,
    includeOutcomeImplications: true,
    maxResults: 10,
    parallelProcessing: true,
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Similarity comparison result
 */
export interface SimilarityComparison {
  aspect: string;
  studentValue: unknown;
  journeyValue: unknown;
  similarity: SimilarityScore;
  method: string;
}

/**
 * Feature vector for similarity calculation
 */
export interface FeatureVector {
  dimensions: Record<SimilarityDimension, number[]>;
  metadata: {
    normalized: boolean;
    version: string;
    generatedAt: Date;
  };
}

/**
 * Distance metric result
 */
export interface DistanceResult {
  metric: 'COSINE' | 'EUCLIDEAN' | 'MANHATTAN' | 'JACCARD' | 'CUSTOM';
  distance: number;
  normalized: number;
  similarity: SimilarityScore;
}

// ============================================================================
// INPUT/OUTPUT TYPES
// ============================================================================

/**
 * Input for similarity calculation
 */
export interface CalculateSimilarityInput {
  studentProfile: StudentProfileSnapshot;
  journey: CareerJourney;
  weights?: Partial<SimilarityWeights>;
  config?: Partial<SimilarityEngineConfig>;
}

/**
 * Output from similarity calculation
 */
export interface CalculateSimilarityOutput {
  result: JourneySimilarityResult;
  calculationTime: number;
  method: string;
  debug?: {
    featureVectors: FeatureVector;
    distanceCalculations: DistanceResult[];
  };
}

/**
 * Batch similarity input
 */
export interface BatchSimilarityInput {
  studentProfile: StudentProfileSnapshot;
  journeys: CareerJourney[];
  config?: Partial<SimilarityEngineConfig>;
}

/**
 * Batch similarity output
 */
export interface BatchSimilarityOutput {
  results: JourneySimilarityResult[];
  analysis: SimilarityAnalysis;
  totalTime: number;
  journeysProcessed: number;
}
