/**
 * Outcome Evidence Engine - Types
 * 
 * Type definitions for converting outcome records into evidence.
 * 
 * Design Principles:
 * - Evidence must be traceable to source outcomes
 * - Confidence reflects data quality and sample size
 * - All logic is explainable and auditable
 */

import type { 
  EntityId, 
  ConfidenceScore, 
  BeliefTimestamp,
  Evidence,
  StudentBeliefV3,
} from '../types/index.js';

import type { OutcomeRecord } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for outcome evidence.
 */
export type OutcomeEvidenceId = string;

/**
 * Types of evidence that can be generated from outcomes.
 */
export enum OutcomeEvidenceType {
  /** Path comparison: Path A outperforms Path B for trait profile */
  PATH_COMPARISON = 'path_comparison',
  
  /** Trait predictor: Students with trait X tend to have outcome Y */
  TRAIT_PREDICTOR = 'trait_predictor',
  
  /** Satisfaction driver: Factor X correlates with satisfaction */
  SATISFACTION_DRIVER = 'satisfaction_driver',
  
  /** Regret pattern: Students with profile X regret choice Y */
  REGRET_PATTERN = 'regret_pattern',
  
  /** Success factor: Factor X present in successful outcomes */
  SUCCESS_FACTOR = 'success_factor',
  
  /** Outcome prediction: Predicted outcome for profile + path */
  OUTCOME_PREDICTION = 'outcome_prediction',
}

/**
 * Quality level of evidence based on methodology.
 */
export enum EvidenceQuality {
  /** Gold standard: Large sample, controlled comparison, validated */
  HIGH = 'high',
  
  /** Good: Moderate sample, clear comparison, some controls */
  MEDIUM = 'medium',
  
  /** Limited: Small sample, observational, preliminary */
  LOW = 'low',
  
  /** Insufficient: Very small sample, anecdotal, uncertain */
  INSUFFICIENT = 'insufficient',
}

/**
 * Direction of the observed effect.
 */
export enum EffectDirection {
  POSITIVE = 'positive',    // Factor increases outcome
  NEGATIVE = 'negative',    // Factor decreases outcome
  NEUTRAL = 'neutral',      // No significant effect
  MIXED = 'mixed',          // Effect varies by context
}

/**
 * Statistical significance of the observed effect.
 */
export enum StatisticalSignificance {
  HIGHLY_SIGNIFICANT = 'highly_significant',  // p < 0.01
  SIGNIFICANT = 'significant',                 // p < 0.05
  MARGINALLY = 'marginally_significant',       // p < 0.10
  NOT_SIGNIFICANT = 'not_significant',         // p >= 0.10
}

// ============================================================================
// OUTCOME EVIDENCE
// ============================================================================

/**
 * Evidence generated from outcome record analysis.
 * 
 * This is the primary output of the Outcome Evidence Engine.
 * It represents a discoverable pattern from historical outcomes.
 */
export interface OutcomeEvidence {
  /** Unique identifier for this evidence */
  id: OutcomeEvidenceId;
  
  /** Type of evidence */
  type: OutcomeEvidenceType;
  
  /** Human-readable description of the finding */
  description: string;
  
  /** Detailed explanation of how this evidence was derived */
  explanation: string;
  
  /** Career paths involved in this evidence */
  paths: {
    primary: string;       // The path being evaluated
    comparison?: string;   // The path being compared against (if applicable)
  };
  
  /** Student profile characteristics relevant to this evidence */
  profile: {
    /** Traits that correlate with this outcome */
    traits: TraitFilter[];
    
    /** Minimum/maximum trait values for this evidence to apply */
    traitRanges?: Map<string, { min: number; max: number }>;
  };
  
  /** The outcome observed */
  outcome: {
    /** Type of outcome measured */
    metric: string;
    
    /** Direction of effect */
    direction: EffectDirection;
    
    /** Magnitude of effect (0.0 - 1.0) */
    magnitude: number;
    
    /** Actual measured difference (e.g., satisfaction points) */
    measuredDifference?: number;
    
    /** Unit of measurement */
    unit?: string;
  };
  
  /** Statistical validity */
  statistics: {
    /** Sample size for primary path */
    sampleSize: number;
    
    /** Sample size for comparison (if applicable) */
    comparisonSampleSize?: number;
    
    /** Confidence score (0.0 - 1.0) */
    confidence: ConfidenceScore;
    
    /** Statistical significance level */
    significance: StatisticalSignificance;
    
    /** Effect size (Cohen's d or similar) */
    effectSize?: number;
    
    /** Confidence interval for the effect */
    confidenceInterval?: { lower: number; upper: number };
  };
  
  /** Evidence quality assessment */
  quality: EvidenceQuality;
  
  /** Quality breakdown by factor */
  qualityFactors: {
    sampleSize: number;        // 0-1 based on sample size thresholds
    methodology: number;       // 0-1 based on comparison quality
    dataQuality: number;       // 0-1 based on outcome data completeness
    consistency: number;       // 0-1 based on variance across records
  };
  
  /** Source outcome records that support this evidence */
  sources: {
    recordIds: string[];
    timeRange: { start: BeliefTimestamp; end: BeliefTimestamp };
  };
  
  /** When this evidence was generated */
  generatedAt: BeliefTimestamp;
  
  /** Version for tracking evidence updates */
  version: number;
  
  /** Whether this evidence has been validated */
  isValidated: boolean;
}

/**
 * Filter criteria for matching student traits.
 */
export interface TraitFilter {
  /** Category of trait (e.g., 'motivation', 'personality', 'value') */
  category: string;
  
  /** Specific trait name (e.g., 'curiosity', 'autonomy') */
  trait: string;
  
  /** Required level or range */
  level: 'low' | 'medium' | 'high' | { min: number; max: number };
}

// ============================================================================
// EVIDENCE GENERATION INPUTS
// ============================================================================

/**
 * Input for generating evidence from outcome records.
 */
export interface GenerateEvidenceInput {
  /** Outcome records to analyze */
  records: OutcomeRecord[];
  
  /** Specific paths to compare (optional) */
  pathComparison?: {
    pathA: string;
    pathB: string;
  };
  
  /** Student profile to focus on (optional) */
  profileFilter?: {
    traits?: TraitFilter[];
    minSimilarity?: number;
  };
  
  /** Types of evidence to generate */
  evidenceTypes?: OutcomeEvidenceType[];
  
  /** Minimum quality threshold */
  minQuality?: EvidenceQuality;
  
  /** Minimum sample size required */
  minSampleSize?: number;
  
  /** Outcome metrics to analyze */
  outcomeMetrics?: string[];
}

/**
 * Output from evidence generation.
 */
export interface GenerateEvidenceOutput {
  /** Generated evidence items */
  evidence: OutcomeEvidence[];
  
  /** Evidence grouped by type */
  evidenceByType: Map<OutcomeEvidenceType, OutcomeEvidence[]>;
  
  /** Summary statistics */
  statistics: {
    totalRecordsAnalyzed: number;
    totalEvidenceGenerated: number;
    averageConfidence: number;
    qualityDistribution: Map<EvidenceQuality, number>;
  };
  
  /** Generation metadata */
  metadata: {
    startedAt: BeliefTimestamp;
    completedAt: BeliefTimestamp;
    durationMs: number;
    parameters: GenerateEvidenceInput;
  };
}

// ============================================================================
// COMPARISON ANALYSIS
// ============================================================================

/**
 * Comparison between two outcome groups.
 */
export interface OutcomeGroupComparison {
  /** Group A characteristics */
  groupA: {
    name: string;
    filters: TraitFilter[];
    records: OutcomeRecord[];
    size: number;
  };
  
  /** Group B characteristics */
  groupB: {
    name: string;
    filters: TraitFilter[];
    records: OutcomeRecord[];
    size: number;
  };
  
  /** Path being compared */
  pathId: string;
  
  /** Comparison results by metric */
  metrics: Map<string, MetricComparison>;
  
  /** Overall comparison summary */
  summary: {
    superiorGroup: 'A' | 'B' | 'NEITHER';
    confidence: ConfidenceScore;
    effectMagnitude: number;
  };
}

/**
 * Comparison for a specific metric.
 */
export interface MetricComparison {
  /** Metric name */
  metric: string;
  
  /** Group A statistics */
  groupA: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  
  /** Group B statistics */
  groupB: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  
  /** Difference metrics */
  difference: {
    absolute: number;
    relative: number;  // Percentage difference
    effectSize: number;
  };
  
  /** Statistical test results */
  statisticalTest: {
    testName: string;
    pValue: number;
    significance: StatisticalSignificance;
    confidence: ConfidenceScore;
  };
}

// ============================================================================
// EVIDENCE QUERY
// ============================================================================

/**
 * Query for finding relevant evidence.
 */
export interface EvidenceQuery {
  /** Student profile to match */
  studentProfile?: StudentBeliefV3;
  
  /** Path being considered */
  pathId?: string;
  
  /** Comparison path (optional) */
  comparisonPathId?: string;
  
  /** Evidence types to include */
  evidenceTypes?: OutcomeEvidenceType[];
  
  /** Minimum quality threshold */
  minQuality?: EvidenceQuality;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
  
  /** Minimum sample size */
  minSampleSize?: number;
  
  /** Maximum number of results */
  limit?: number;
}

/**
 * Result of evidence query with relevance scoring.
 */
export interface EvidenceQueryResult {
  /** Matching evidence */
  evidence: OutcomeEvidence;
  
  /** Relevance score for this student's profile */
  relevanceScore: number;
  
  /** Which traits matched */
  matchedTraits: string[];
  
  /** Applicability to this specific case */
  applicability: {
    score: number;
    explanation: string;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for the Outcome Evidence Engine.
 */
export interface OutcomeEvidenceEngineConfig {
  /** Minimum sample size for generating evidence */
  minSampleSize: number;
  
  /** Minimum confidence threshold for evidence */
  minConfidenceThreshold: number;
  
  /** Significance level for statistical tests */
  significanceThreshold: number;
  
  /** Weights for quality calculation */
  qualityWeights: {
    sampleSize: number;
    methodology: number;
    dataQuality: number;
    consistency: number;
  };
  
  /** Sample size thresholds for quality levels */
  sampleSizeThresholds: {
    high: number;   // e.g., 50+
    medium: number; // e.g., 20+
    low: number;    // e.g., 5+
  };
  
  /** Whether to require validated records only */
  requireValidated: boolean;
  
  /** Maximum age of outcome records (in milliseconds) */
  maxRecordAge: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_CONFIG: OutcomeEvidenceEngineConfig = {
  minSampleSize: 5,
  minConfidenceThreshold: 0.3,
  significanceThreshold: 0.05,
  qualityWeights: {
    sampleSize: 0.35,
    methodology: 0.25,
    dataQuality: 0.25,
    consistency: 0.15,
  },
  sampleSizeThresholds: {
    high: 50,
    medium: 20,
    low: 5,
  },
  requireValidated: false,
  maxRecordAge: 365 * 24 * 60 * 60 * 1000, // 1 year
};

// ============================================================================
// EXPLANATION
// ============================================================================

/**
 * Detailed explanation of evidence derivation.
 */
export interface EvidenceDerivationExplanation {
  /** Step-by-step derivation */
  steps: DerivationStep[];
  
  /** Raw data summary */
  dataSummary: {
    totalRecords: number;
    matchingRecords: number;
    averageOutcome: number;
    variance: number;
  };
  
  /** Statistical methodology used */
  methodology: {
    comparisonType: string;
    statisticalTest: string;
    assumptions: string[];
    limitations: string[];
  };
  
  /** Human-readable narrative */
  narrative: string;
}

/**
 * Single step in evidence derivation.
 */
export interface DerivationStep {
  step: number;
  description: string;
  input: string;
  operation: string;
  output: string;
  reasoning: string;
}
