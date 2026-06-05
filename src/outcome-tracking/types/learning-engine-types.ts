/**
 * CareerOS - Learning Engine Types
 *
 * Phase: Outcome Tracking Engine - Learning Engine
 *
 * Pattern learning from outcome data.
 *
 * @module learning-engine-types
 * @version 1.0.0
 */

import type { StudentId, OutcomeRecordId } from './outcome-tracking-types';
import type { CohortId, CohortInsight } from './cohort-engine-types';

// ============================================================================
// LEARNING PATTERNS
// ============================================================================

/**
 * Discovered pattern from outcome analysis.
 *
 * Represents a learned insight about what leads to successful outcomes.
 *
 * Example:
 *   Students with Founder Archetype + High Autonomy + High Risk Tolerance
 *   who chose Startup Path → Above-average satisfaction
 */
export interface LearnedPattern {
  /** Unique pattern identifier */
  patternId: string;

  /** Pattern type */
  patternType: PatternType;

  /** Pattern name/description */
  name: string;

  /** Pattern description in natural language */
  description: string;

  /** Conditions that trigger this pattern */
  conditions: PatternCondition[];

  /** Outcome predicted by this pattern */
  predictedOutcome: PatternOutcome;

  /** Pattern statistics */
  statistics: PatternStatistics;

  /** Confidence in this pattern */
  confidence: PatternConfidence;

  /** Pattern metadata */
  metadata: PatternMetadata;
}

/** Types of patterns that can be learned */
export type PatternType =
  | 'ARCHETYPE_OUTCOME'
  | 'DECISION_OUTCOME'
  | 'ACTION_OUTCOME'
  | 'COHORT_OUTCOME'
  | 'PATHWAY_SUCCESS'
  | 'PATHWAY_FAILURE'
  | 'TIMING_PATTERN'
  | 'SEQUENCE_PATTERN';

/** Condition for pattern matching */
export interface PatternCondition {
  /** Condition type */
  conditionType: ConditionType;

  /** Attribute being checked */
  attribute: string;

  /** Operator for comparison */
  operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'MATCHES';

  /** Expected value */
  value: unknown;

  /** Weight of this condition in pattern matching */
  weight: number;
}

/** Types of conditions */
export type ConditionType =
  | 'ARCHETYPE'
  | 'TRAIT'
  | 'DECISION'
  | 'ACTION'
  | 'COHORT'
  | 'CONTEXT'
  | 'TIMING'
  | 'OUTCOME';

/** Predicted outcome from pattern */
export interface PatternOutcome {
  /** Outcome type */
  outcomeType: OutcomePredictionType;

  /** Predicted success probability (0-100) */
  successProbability: number;

  /** Predicted satisfaction score (0-100) */
  predictedSatisfaction: number;

  /** Predicted timeline (days) */
  predictedTimelineDays: number;

  /** Key factors that will influence outcome */
  keyFactors: string[];

  /** Risk factors to monitor */
  riskFactors: string[];
}

/** Types of outcome predictions */
export type OutcomePredictionType =
  | 'HIGH_SUCCESS'
  | 'MODERATE_SUCCESS'
  | 'MIXED_RESULTS'
  | 'HIGH_RISK'
  | 'LIKELY_FAILURE';

/** Pattern statistics */
export interface PatternStatistics {
  /** Number of cases supporting this pattern */
  supportingCases: number;

  /** Number of cases contradicting this pattern */
  contradictingCases: number;

  /** Success rate for cases matching this pattern (0-100) */
  successRate: number;

  /** Average satisfaction for matching cases */
  averageSatisfaction: number;

  /** Average timeline for matching cases (days) */
  averageTimelineDays: number;

  /** Statistical significance (p-value) */
  statisticalSignificance: number;

  /** Effect size (Cohen's d or similar) */
  effectSize: number;
}

/** Pattern confidence metrics */
export interface PatternConfidence {
  /** Overall confidence score (0-100) */
  overallConfidence: number;

  /** Confidence based on sample size */
  sampleSizeConfidence: number;

  /** Confidence based on consistency */
  consistencyConfidence: number;

  /** Confidence based on statistical significance */
  statisticalConfidence: number;

  /** Confidence level classification */
  level: 'HIGH' | 'MEDIUM' | 'LOW';
}

/** Pattern metadata */
export interface PatternMetadata {
  /** When pattern was first discovered */
  discoveredAt: Date;

  /** When pattern was last validated */
  lastValidatedAt: Date;

  /** Number of times pattern has been applied */
  timesApplied: number;

  /** Number of successful applications */
  successfulApplications: number;

  /** Pattern version (incremented on refinement) */
  version: number;

  /** Whether pattern is currently active */
  isActive: boolean;

  /** Source of pattern discovery */
  discoverySource: 'AUTOMATED' | 'MANUAL' | 'HYBRID';
}

// ============================================================================
// LEARNING REQUESTS & RESULTS
// ============================================================================

/** Request to learn patterns from outcome data */
export interface PatternLearningRequest {
  /** Cohorts to analyze */
  cohortIds?: CohortId[];

  /** Pattern types to discover */
  patternTypes?: PatternType[];

  /** Minimum sample size for pattern discovery */
  minSampleSize: number;

  /** Minimum confidence threshold */
  minConfidenceThreshold: number;

  /** Specific attributes to focus on */
  focusAttributes?: string[];

  /** Time range for analysis */
  timeRange?: {
    startDate: Date;
    endDate: Date;
  };

  /** Learning algorithm configuration */
  algorithmConfig?: LearningAlgorithmConfig;
}

/** Learning algorithm configuration */
export interface LearningAlgorithmConfig {
  /** Algorithm type */
  algorithmType: 'ASSOCIATION' | 'SEQUENCE' | 'CLUSTERING' | 'CLASSIFICATION' | 'ENSEMBLE';

  /** Minimum support for pattern mining */
  minSupport: number;

  /** Minimum confidence for pattern mining */
  minConfidence: number;

  /** Maximum pattern complexity (number of conditions) */
  maxComplexity: number;

  /** Whether to use cross-validation */
  useCrossValidation: boolean;

  /** Number of folds for cross-validation */
  crossValidationFolds?: number;
}

/** Result of pattern learning */
export interface PatternLearningResult {
  /** Discovered patterns */
  patterns: LearnedPattern[];

  /** Learning statistics */
  statistics: LearningStatistics;

  /** Quality metrics */
  quality: LearningQualityMetrics;

  /** Recommendations for pattern usage */
  recommendations: PatternUsageRecommendation[];
}

/** Learning statistics */
export interface LearningStatistics {
  /** Total records analyzed */
  recordsAnalyzed: number;

  /** Total patterns discovered */
  patternsDiscovered: number;

  /** Patterns retained after filtering */
  patternsRetained: number;

  /** Processing time (milliseconds) */
  processingTimeMs: number;

  /** Memory used (bytes) */
  memoryUsedBytes: number;
}

/** Learning quality metrics */
export interface LearningQualityMetrics {
  /** Coverage percentage of outcome space */
  coveragePercentage: number;

  /** Average pattern confidence */
  averageConfidence: number;

  /** Pattern diversity score */
  diversityScore: number;

  /** Novelty score (new patterns discovered) */
  noveltyScore: number;
}

/** Recommendation for pattern usage */
export interface PatternUsageRecommendation {
  /** Pattern identifier */
  patternId: string;

  /** Recommended use case */
  useCase: string;

  /** Priority for implementation */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Expected impact */
  expectedImpact: string;

  /** Implementation notes */
  implementationNotes: string;
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generated insight for a student cohort.
 *
 * Provides actionable intelligence about what similar students
 * typically experience.
 */
export interface LearningInsight {
  /** Unique insight identifier */
  insightId: string;

  /** Cohort this insight applies to */
  cohortId: CohortId;

  /** Insight type */
  insightType: InsightType;

  /** Insight title */
  title: string;

  /** Insight description */
  description: string;

  /** Supporting data */
  supportingData: InsightData;

  /** Recommendations derived from insight */
  recommendations: string[];

  /** Confidence in this insight */
  confidence: number;

  /** Timestamp */
  generatedAt: Date;
}

/** Types of insights */
export type InsightType =
  | 'CHOICE_PATTERN'
  | 'REGRET_PATTERN'
  | 'SUCCESS_PATTERN'
  | 'FAILURE_PATTERN'
  | 'TIMING_INSIGHT'
  | 'PATHWAY_INSIGHT'
  | 'RISK_INSIGHT'
  | 'OPPORTUNITY_INSIGHT';

/** Data supporting an insight */
export interface InsightData {
  /** Sample size */
  sampleSize: number;

  /** Percentage of cohort this applies to */
  applicabilityPercentage: number;

  /** Success rate for this pattern */
  successRate?: number;

  /** Average outcome score */
  averageOutcomeScore?: number;

  /** Comparison to overall population */
  vsOverallPopulation: ComparisonMetrics;

  /** Key statistics */
  keyStatistics: Record<string, number>;
}

/** Comparison metrics */
export interface ComparisonMetrics {
  /** Difference in success rate */
  successRateDelta: number;

  /** Difference in satisfaction */
  satisfactionDelta: number;

  /** Difference in timeline */
  timelineDelta: number;

  /** Statistical significance */
  isSignificant: boolean;
}

/** Request to generate insights for a student */
export interface InsightGenerationRequest {
  /** Student identifier */
  studentId: StudentId;

  /** Student's cohorts */
  cohortIds: CohortId[];

  /** Student's archetype profile */
  archetypeProfile: Record<string, unknown>;

  /** Current decision context */
  decisionContext?: {
    options: string[];
    constraints: string[];
    preferences: Record<string, number>;
  };

  /** Types of insights to generate */
  insightTypes?: InsightType[];

  /** Maximum number of insights */
  maxInsights: number;
}

/** Result of insight generation */
export interface InsightGenerationResult {
  /** Generated insights */
  insights: CohortInsight[];

  /** Personalized recommendations */
  personalizedRecommendations: PersonalizedRecommendation[];

  /** Risk warnings */
  riskWarnings: RiskWarning[];

  /** Opportunity alerts */
  opportunityAlerts: OpportunityAlert[];
}

/** Personalized recommendation */
export interface PersonalizedRecommendation {
  /** Recommendation text */
  recommendation: string;

  /** Basis for recommendation */
  basis: string;

  /** Confidence level */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Expected outcome if followed */
  expectedOutcome: string;

  /** Supporting evidence */
  supportingEvidence: string;
}

/** Risk warning */
export interface RiskWarning {
  /** Risk type */
  riskType: string;

  /** Risk description */
  description: string;

  /** Likelihood (0-100) */
  likelihood: number;

  /** Impact severity */
  impact: 'HIGH' | 'MEDIUM' | 'LOW';

  /** Mitigation strategies */
  mitigationStrategies: string[];
}

/** Opportunity alert */
export interface OpportunityAlert {
  /** Opportunity type */
  opportunityType: string;

  /** Opportunity description */
  description: string;

  /** Potential benefit */
  potentialBenefit: string;

  /** Recommended action */
  recommendedAction: string;

  /** Time sensitivity */
  timeSensitivity: 'URGENT' | 'TIMELY' | 'FLEXIBLE';
}

// ============================================================================
// LEARNING ENGINE INTERFACE
// ============================================================================

/**
 * Learning Engine - Discovers patterns from outcome data.
 *
 * The Learning Engine analyzes outcome records to discover patterns
 * about what leads to successful career outcomes.
 */
export interface LearningEngine {
  /**
   * Learn patterns from outcome data.
   *
   * Analyzes outcome records to discover statistical patterns
   * linking student characteristics, decisions, and outcomes.
   */
  learnPatterns(request: PatternLearningRequest): Promise<PatternLearningResult>;

  /**
   * Generate insights for a specific student context.
   *
   * Uses learned patterns to generate personalized insights
   * about what similar students typically experience.
   */
  generateInsights(
    request: InsightGenerationRequest
  ): Promise<InsightGenerationResult>;

  /**
   * Validate existing patterns against new data.
   *
   * Checks if previously learned patterns still hold true
   * with new outcome data.
   */
  validatePatterns(patternIds: string[]): Promise<PatternValidationResult>;

  /**
   * Get all active patterns.
   *
   * Returns patterns currently being used for recommendations.
   */
  getActivePatterns(): Promise<LearnedPattern[]>;

  /**
   * Apply learned patterns to a recommendation.
   *
   * Uses patterns to enhance recommendation quality.
   */
  applyPatterns(
    recommendationId: string,
    studentProfile: Record<string, unknown>
  ): Promise<PatternApplicationResult>;
}

/** Pattern validation result */
export interface PatternValidationResult {
  /** Validation results for each pattern */
  results: Array<{
    patternId: string;
    isStillValid: boolean;
    validationConfidence: number;
    recommendedAction: 'KEEP' | 'UPDATE' | 'DEPRECATE';
  }>;

  /** Overall validation statistics */
  statistics: {
    totalValidated: number;
    stillValid: number;
    needsUpdate: number;
    deprecated: number;
  };
}

/** Pattern application result */
export interface PatternApplicationResult {
  /** Patterns that matched */
  matchedPatterns: LearnedPattern[];

  /** Pattern-based adjustments to recommendation */
  adjustments: Array<{
    attribute: string;
    originalValue: unknown;
    adjustedValue: unknown;
    reason: string;
  }>;

  /** Confidence boost from patterns */
  confidenceBoost: number;

  /** Additional insights to include */
  additionalInsights: string[];
}
