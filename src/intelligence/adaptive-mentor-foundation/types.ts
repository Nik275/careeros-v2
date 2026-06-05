/**
 * Adaptive Mentor Foundation - Types
 *
 * Type definitions for mentor guidance using longitudinal intelligence.
 *
 * Design Principles:
 * - Foundation layer (no LLM integration)
 * - Uses longitudinal patterns for guidance
 * - Explainable observations
 * - Compatible with all intelligence engines
 */

import type { EntityId, ConfidenceScore, Evidence } from '../types/index.js';

// ============================================================================
// MENTOR CONTEXT
// ============================================================================

/**
 * Complete context for mentor guidance.
 */
export interface MentorContext {
  /** Context identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When context was generated */
  generatedAt: number;

  /** Current student state snapshot */
  currentState: StudentStateSnapshot;

  /** Historical patterns */
  historicalPatterns: HistoricalPatterns;

  /** Current vs historical contrasts */
  contrasts: StateContrast[];

  /** Active considerations */
  considerations: ActiveConsideration[];

  /** Guidance priorities */
  priorities: GuidancePriority[];
}

/**
 * Snapshot of current student state.
 */
export interface StudentStateSnapshot {
  /** Snapshot timestamp */
  timestamp: number;

  /** Primary identity */
  primaryIdentity?: string;

  /** Identity confidence */
  identityConfidence: number;

  /** Top values (ordered by priority) */
  topValues: Array<{
    valueId: string;
    valueName: string;
    priority: number;
  }>;

  /** Growth levels by dimension */
  growthLevels: Record<string, number>;

  /** Recent decisions */
  recentDecisions: Array<{
    decisionId: string;
    timestamp: number;
    type: string;
    confidence: number;
  }>;

  /** Current constraints */
  activeConstraints: string[];

  /** Current goals */
  activeGoals: string[];
}

/**
 * Historical patterns from longitudinal data.
 */
export interface HistoricalPatterns {
  /** Most consistent values over time */
  consistentValues: Array<{
    valueId: string;
    valueName: string;
    averagePriority: number;
    stability: number;
  }>;

  /** Values with highest satisfaction correlation */
  highSatisfactionValues: Array<{
    valueId: string;
    valueName: string;
    correlationScore: number;
  }>;

  /** Identity evolution path */
  identityPath: Array<{
    timestamp: number;
    identity: string;
    duration: number;
  }>;

  /** Decision pattern summary */
  decisionPattern: {
    dominantPattern: string;
    confidence: number;
    avgDecisionTime: number;
    reversalRate: number;
  };

  /** Growth trajectory */
  growthTrajectory: 'accelerating' | 'steady' | 'decelerating' | 'plateauing';

  /** Time span of history */
  historySpanMs: number;
}

// ============================================================================
// STATE CONTRASTS
// ============================================================================

/**
 * Contrast between current and historical state.
 */
export interface StateContrast {
  /** Contrast identifier */
  id: string;

  /** Type of contrast */
  type: ContrastType;

  /** Aspect being compared */
  aspect: string;

  /** Current state */
  current: {
    value: string | number;
    timestamp: number;
  };

  /** Historical state (peak or typical) */
  historical: {
    value: string | number;
    timestamp: number;
    context: string;
  };

  /** Magnitude of contrast */
  magnitude: number;

  /** Whether this is a concern */
  isConcerning: boolean;

  /** Suggested reflection */
  reflectionPrompt: string;
}

/** Types of state contrasts */
export type ContrastType =
  | 'value_shift'
  | 'identity_drift'
  | 'confidence_change'
  | 'satisfaction_gap'
  | 'goal_misalignment'
  | 'pattern_break';

// ============================================================================
// ACTIVE CONSIDERATIONS
// ============================================================================

/**
 * Active consideration for mentor guidance.
 */
export interface ActiveConsideration {
  /** Consideration identifier */
  id: string;

  /** Category */
  category: ConsiderationCategory;

  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low';

  /** Description */
  description: string;

  /** Supporting evidence */
  evidence: string[];

  /** Suggested action */
  suggestedAction?: string;

  /** Confidence in consideration */
  confidence: ConfidenceScore;
}

/** Consideration categories */
export type ConsiderationCategory =
  | 'value_clarity'
  | 'identity_alignment'
  | 'decision_quality'
  | 'growth_opportunity'
  | 'risk_warning'
  | 'pattern_recognition';

// ============================================================================
// GUIDANCE PRIORITIES
// ============================================================================

/**
 * Priority area for mentor guidance.
 */
export interface GuidancePriority {
  /** Priority identifier */
  id: string;

  /** Priority area */
  area: string;

  /** Rank (1 = highest) */
  rank: number;

  /** Why this is a priority */
  rationale: string;

  /** Suggested guidance focus */
  suggestedFocus: string;

  /** Expected outcome */
  expectedOutcome: string;
}

// ============================================================================
// MENTOR INSIGHTS
// ============================================================================

/**
 * Insight generated for mentor guidance.
 */
export interface MentorInsight {
  /** Insight identifier */
  id: string;

  /** Insight type */
  type: MentorInsightType;

  /** Insight title */
  title: string;

  /** Insight description */
  description: string;

  /** Longitudinal basis */
  longitudinalBasis: {
    pattern: string;
    evidence: string[];
    confidence: ConfidenceScore;
  };

  /** Relevance to current state */
  relevance: {
    score: number;
    reason: string;
  };

  /** Suggested response */
  suggestedResponse: string;

  /** Priority */
  priority: 'immediate' | 'opportunistic' | 'background';
}

/** Types of mentor insights */
export type MentorInsightType =
  | 'historical_contrast'
  | 'pattern_recognition'
  | 'growth_moment'
  | 'risk_alert'
  | 'opportunity_spotting'
  | 'reflection_prompt';

// ============================================================================
// GROWTH OBSERVATIONS
// ============================================================================

/**
 * Observation about student growth.
 */
export interface GrowthObservation {
  /** Observation identifier */
  id: string;

  /** Growth dimension */
  dimension: string;

  /** Observation type */
  type: GrowthObservationType;

  /** Observation text */
  observation: string;

  /** Evidence from history */
  evidence: {
    startingLevel: number;
    currentLevel: number;
    milestones: string[];
    trend: 'accelerating' | 'steady' | 'decelerating';
  };

  /** Comparison to typical */
  comparisonToTypical: {
    percentile: number;
    description: string;
  };

  /** Next milestone projection */
  nextMilestone?: {
    description: string;
    estimatedTime: number; // days
    requiredActions: string[];
  };
}

/** Growth observation types */
export type GrowthObservationType =
  | 'breakthrough_detected'
  | 'plateau_warning'
  | 'consistent_progress'
  | 'acceleration_phase'
  | 'potential_unrealized';

// ============================================================================
// DECISION WARNINGS
// ============================================================================

/**
 * Warning about potential decision issues.
 */
export interface DecisionWarning {
  /** Warning identifier */
  id: string;

  /** Warning type */
  type: DecisionWarningType;

  /** Severity */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /** Warning title */
  title: string;

  /** Warning description */
  description: string;

  /** Historical basis */
  historicalBasis: {
    similarDecisions: number;
    outcomes: string;
    pattern: string;
  };

  /** Specific concern */
  concern: string;

  /** Suggested mitigation */
  suggestedMitigation: string;

  /** Confidence in warning */
  confidence: ConfidenceScore;
}

/** Types of decision warnings */
export type DecisionWarningType =
  | 'value_misalignment'
  | 'identity_conflict'
  | 'historical_regret_pattern'
  | 'confidence_mismatch'
  | 'external_pressure'
  | 'impulsive_pattern'
  | 'avoidance_pattern';

// ============================================================================
// MENTOR FOUNDATION OUTPUT
// ============================================================================

/**
 * Complete mentor foundation output.
 */
export interface MentorFoundationOutput {
  /** Output identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When output was generated */
  generatedAt: number;

  /** Mentor context */
  context: MentorContext;

  /** Generated insights */
  insights: MentorInsight[];

  /** Growth observations */
  growthObservations: GrowthObservation[];

  /** Decision warnings */
  decisionWarnings: DecisionWarning[];

  /** Summary for LLM layer (when added) */
  llmSummary: {
    keyPoints: string[];
    historicalContrasts: string[];
    activeWarnings: string[];
    guidanceThemes: string[];
  };
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input for adaptive mentor foundation.
 */
export interface MentorFoundationInput {
  /** Student identifier */
  studentId: EntityId;

  /** Current belief snapshot */
  belief: import('../types/index.js').StudentBeliefV3;

  /** Longitudinal analysis */
  longitudinalAnalysis?: import('../longitudinal-intelligence-engine/types.js').LongitudinalAnalysis;

  /** Value evolution */
  valueEvolution?: import('../value-evolution-engine/types.js').ValueEvolutionAnalysis;

  /** Identity profile */
  identityProfile?: import('../identity-development-engine/types.js').IdentityProfile;

  /** Personal growth analysis */
  growthAnalysis?: import('../personal-growth-engine/types.js').PersonalGrowthAnalysis;

  /** Recent outcomes */
  recentOutcomes?: Array<{
    timestamp: number;
    type: string;
    satisfaction: number;
    valueAlignment: number;
  }>;

  /** Analysis options */
  options?: MentorFoundationOptions;
}

/**
 * Options for mentor foundation analysis.
 */
export interface MentorFoundationOptions {
  /** Contrast sensitivity (0-1) */
  contrastSensitivity?: number;

  /** History lookback (days) */
  historyLookbackDays?: number;

  /** Minimum confidence for insights */
  minInsightConfidence?: number;

  /** Maximum insights to generate */
  maxInsights?: number;

  /** Maximum warnings to generate */
  maxWarnings?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for AdaptiveMentorFoundation.
 */
export interface MentorFoundationConfig {
  /** Default contrast sensitivity */
  defaultContrastSensitivity: number;

  /** Default history lookback (days) */
  defaultHistoryLookbackDays: number;

  /** Minimum confidence threshold */
  minConfidenceThreshold: number;

  /** Maximum insights */
  maxInsights: number;

  /** Maximum warnings */
  maxWarnings: number;

  /** Contrast threshold for flagging */
  contrastThreshold: number;
}

/** Default configuration */
export const DEFAULT_MENTOR_FOUNDATION_CONFIG: MentorFoundationConfig = {
  defaultContrastSensitivity: 0.3,
  defaultHistoryLookbackDays: 365,
  minConfidenceThreshold: 0.6,
  maxInsights: 5,
  maxWarnings: 3,
  contrastThreshold: 0.25,
};
