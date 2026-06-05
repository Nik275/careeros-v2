/**
 * Longitudinal Intelligence Engine - Types
 *
 * Type definitions for maintaining evolving student models over time.
 *
 * Design Principles:
 * - Production-ready architecture
 * - Strong typing
 * - Explainable outputs
 * - Compatible with Value Evolution, Identity, and Outcome engines
 */

import type { EntityId, ConfidenceScore, Evidence } from '../types/index.js';

// ============================================================================
// TIMELINE EVENT TYPES
// ============================================================================

/**
 * Types of events that can appear on a student timeline.
 */
export const TIMELINE_EVENT_TYPES = [
  'assessment',
  'decision',
  'value_shift',
  'identity_transition',
  'outcome',
  'milestone',
  'intervention',
  'goal_set',
  'goal_achieved',
  'setback',
  'breakthrough',
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

/**
 * Human-readable labels for event types.
 */
export const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  assessment: 'Assessment',
  decision: 'Decision',
  value_shift: 'Value Shift',
  identity_transition: 'Identity Transition',
  outcome: 'Outcome Recorded',
  milestone: 'Milestone',
  intervention: 'Intervention',
  goal_set: 'Goal Set',
  goal_achieved: 'Goal Achieved',
  setback: 'Setback',
  breakthrough: 'Breakthrough',
};

// ============================================================================
// TIMELINE EVENTS
// ============================================================================

/**
 * Base interface for timeline events.
 */
export interface TimelineEvent {
  /** Event identifier */
  id: string;

  /** Event type */
  type: TimelineEventType;

  /** When event occurred */
  timestamp: number;

  /** Event description */
  description: string;

  /** Detailed data for this event */
  data: Record<string, unknown>;

  /** Evidence supporting this event */
  evidence: Evidence[];

  /** Related event IDs */
  relatedEvents: string[];

  /** Significance (0-1) */
  significance: number;
}

/**
 * Assessment event.
 */
export interface AssessmentEvent extends TimelineEvent {
  type: 'assessment';
  data: {
    assessmentType: string;
    scores: Record<string, number>;
    insights: string[];
  };
}

/**
 * Decision event.
 */
export interface DecisionEvent extends TimelineEvent {
  type: 'decision';
  data: {
    decisionId: string;
    decisionType: string;
    options: string[];
    chosenOption: string;
    confidence: number;
    rationale: string;
  };
}

/**
 * Value shift event.
 */
export interface ValueShiftEvent extends TimelineEvent {
  type: 'value_shift';
  data: {
    valueId: string;
    valueName: string;
    previousPriority: number;
    newPriority: number;
    shiftType: 'increase' | 'decrease' | 'emergence' | 'decline';
  };
}

/**
 * Identity transition event.
 */
export interface IdentityTransitionEvent extends TimelineEvent {
  type: 'identity_transition';
  data: {
    fromIdentity?: string;
    toIdentity?: string;
    fromArchetype?: string;
    toArchetype?: string;
    transitionType: 'emerging' | 'strengthening' | 'weakening' | 'conflicted' | 'resolved';
  };
}

/**
 * Outcome event.
 */
export interface OutcomeEvent extends TimelineEvent {
  type: 'outcome';
  data: {
    outcomeType: string;
    outcomeValue: number;
    expectedValue: number;
    satisfaction: number;
  };
}

/**
 * Milestone event.
 */
export interface MilestoneEvent extends TimelineEvent {
  type: 'milestone';
  data: {
    milestoneType: string;
    dimension: string;
    level: number;
    previousLevel: number;
  };
}

// ============================================================================
// STUDENT TIMELINE
// ============================================================================

/**
 * Complete timeline of student events.
 */
export interface StudentTimeline {
  /** Timeline identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When timeline started */
  startedAt: number;

  /** Last update */
  lastUpdatedAt: number;

  /** Chronological events */
  events: TimelineEvent[];

  /** Time range covered */
  timeRange: {
    start: number;
    end: number;
    durationMs: number;
  };

  /** Summary statistics */
  summary: TimelineSummary;
}

/**
 * Summary statistics for timeline.
 */
export interface TimelineSummary {
  /** Total event count */
  totalEvents: number;

  /** Count by event type */
  eventsByType: Record<TimelineEventType, number>;

  /** Average events per month */
  eventsPerMonth: number;

  /** Most active period */
  mostActivePeriod: {
    start: number;
    end: number;
    eventCount: number;
  };

  /** Quietest period (minimum 30 days) */
  quietestPeriod: {
    start: number;
    end: number;
    durationMs: number;
  } | null;
}

// ============================================================================
// MAJOR TRANSITIONS
// ============================================================================

/**
 * Types of major transitions.
 */
export const TRANSITION_TYPES = [
  'career_direction',
  'value_realignment',
  'identity_shift',
  'skill_breakthrough',
  'confidence_growth',
  'decision_style_change',
  'external_circumstance',
  'goal_pivot',
] as const;

export type TransitionType = (typeof TRANSITION_TYPES)[number];

/**
 * Major transition in student development.
 */
export interface MajorTransition {
  /** Transition identifier */
  id: string;

  /** Transition type */
  type: TransitionType;

  /** When transition started */
  startedAt: number;

  /** When transition completed (if completed) */
  completedAt?: number;

  /** Duration of transition */
  durationMs: number;

  /** Description of transition */
  description: string;

  /** Trigger event ID */
  triggerEvent: string;

  /** Contributing factors */
  factors: string[];

  /** State before transition */
  beforeState: {
    primaryIdentity?: string;
    dominantValue?: string;
    topStrengths: string[];
    overallConfidence: number;
  };

  /** State after transition */
  afterState: {
    primaryIdentity?: string;
    dominantValue?: string;
    topStrengths: string[];
    overallConfidence: number;
  };

  /** Whether transition was positive */
  wasPositive: boolean;

  /** Confidence in transition detection */
  confidence: ConfidenceScore;
}

// ============================================================================
// GROWTH MILESTONES
// ============================================================================

/**
 * Types of growth milestones.
 */
export const MILESTONE_TYPES = [
  'skill_mastery',
  'confidence_breakthrough',
  'leadership_emergence',
  'decision_maturity',
  'value_clarity',
  'identity_consolidation',
  'career_commitment',
  'outcome_achievement',
  'goal_completion',
  'insight_moment',
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];

/**
 * Growth milestone.
 */
export interface GrowthMilestone {
  /** Milestone identifier */
  id: string;

  /** Milestone type */
  type: MilestoneType;

  /** When milestone was achieved */
  achievedAt: number;

  /** Milestone title */
  title: string;

  /** Detailed description */
  description: string;

  /** Dimension this milestone relates to */
  dimension: string;

  /** Level achieved (0-1) */
  level: number;

  /** Evidence of achievement */
  evidence: Evidence[];

  /** Related events */
  relatedEventIds: string[];

  /** Next milestone to aim for */
  nextMilestone?: {
    type: MilestoneType;
    title: string;
    estimatedTimeToAchieve: number; // days
  };
}

// ============================================================================
// DECISION PATTERNS
// ============================================================================

/**
 * Decision pattern types.
 */
export const DECISION_PATTERN_TYPES = [
  'analytical',
  'intuitive',
  'avoidant',
  'impulsive',
  'collaborative',
  'dependent',
  'balanced',
  'values_aligned',
  'externally_influenced',
] as const;

export type DecisionPatternType = (typeof DECISION_PATTERN_TYPES)[number];

/**
 * Decision pattern analysis.
 */
export interface DecisionPattern {
  /** Pattern identifier */
  id: string;

  /** Pattern type */
  type: DecisionPatternType;

  /** Pattern confidence (0-1) */
  confidence: number;

  /** Pattern description */
  description: string;

  /** Evidence for this pattern */
  evidence: string[];

  /** Decision statistics */
  statistics: {
    totalDecisions: number;
    avgDecisionTime: number; // days
    avgConfidence: number;
    reversalRate: number;
    satisfactionRate: number;
  };

  /** Pattern evolution over time */
  evolution: {
    period: string;
    dominantPattern: DecisionPatternType;
    strength: number;
  }[];

  /** Recommendations for improvement */
  recommendations: string[];
}

// ============================================================================
// LONGITUDINAL ANALYSIS OUTPUT
// ============================================================================

/**
 * Complete longitudinal analysis.
 */
export interface LongitudinalAnalysis {
  /** Analysis identifier */
  id: string;

  /** Student identifier */
  studentId: EntityId;

  /** When analysis was generated */
  generatedAt: number;

  /** Analysis time range */
  timeRange: {
    start: number;
    end: number;
    durationMs: number;
  };

  /** Complete timeline */
  timeline: StudentTimeline;

  /** Major transitions detected */
  transitions: MajorTransition[];

  /** Growth milestones achieved */
  milestones: GrowthMilestone[];

  /** Decision patterns identified */
  decisionPatterns: DecisionPattern[];

  /** Key insights */
  insights: LongitudinalInsight[];

  /** Predictive indicators */
  predictions: LongitudinalPrediction[];
}

/**
 * Longitudinal insight.
 */
export interface LongitudinalInsight {
  /** Insight identifier */
  id: string;

  /** Insight type */
  type: LongitudinalInsightType;

  /** When this insight applies */
  timeframe: 'past' | 'present' | 'future';

  /** Insight description */
  description: string;

  /** Supporting evidence */
  evidence: string[];

  /** Related events */
  relatedEventIds: string[];

  /** Confidence in insight */
  confidence: ConfidenceScore;

  /** Urgency */
  urgency: 'immediate' | 'near-term' | 'long-term';
}

/** Types of longitudinal insights */
export type LongitudinalInsightType =
  | 'consistent_growth'
  | 'stagnation_detected'
  | 'acceleration_phase'
  | 'pattern_break'
  | 'positive_trajectory'
  | 'intervention_needed'
  | 'milestone_approaching'
  | 'transition_risk'
  | 'decision_style_shift';

/**
 * Longitudinal prediction.
 */
export interface LongitudinalPrediction {
  /** Prediction identifier */
  id: string;

  /** What is predicted */
  prediction: string;

  /** Likelihood (0-1) */
  likelihood: number;

  /** Expected timeframe */
  timeframe: {
    earliest: number;
    latest: number;
    mostLikely: number;
  };

  /** Basis for prediction */
  basis: string[];

  /** Confidence in prediction */
  confidence: ConfidenceScore;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

/**
 * Input for longitudinal analysis.
 */
export interface LongitudinalAnalysisInput {
  /** Student identifier */
  studentId: EntityId;

  /** Assessment snapshots */
  assessments?: AssessmentSnapshot[];

  /** Decision records */
  decisions?: DecisionRecord[];

  /** Value evolution history */
  valueHistory?: import('../value-evolution-engine/types.js').ValueHistory;

  /** Identity evolution */
  identityEvolution?: import('../identity-development-engine/types.js').IdentityEvolution;

  /** Personal growth analyses */
  growthAnalyses?: import('../personal-growth-engine/types.js').PersonalGrowthAnalysis[];

  /** Outcome records */
  outcomes?: OutcomeRecord[];

  /** Analysis options */
  options?: LongitudinalOptions;
}

/**
 * Assessment snapshot for longitudinal tracking.
 */
export interface AssessmentSnapshot {
  /** Snapshot ID */
  id: string;

  /** When assessed */
  timestamp: number;

  /** Assessment type */
  type: string;

  /** Student belief at this point */
  belief: import('../types/index.js').StudentBeliefV3;

  /** Key metrics */
  metrics: {
    overallConfidence: number;
    topStrengths: string[];
    dominantMotivation?: string;
    primaryIdentity?: string;
    dominantValue?: string;
  };
}

/**
 * Decision record.
 */
export interface DecisionRecord {
  /** Decision ID */
  id: string;

  /** When decision was made */
  timestamp: number;

  /** Decision type */
  type: string;

  /** Options considered */
  options: string[];

  /** Option chosen */
  chosen: string;

  /** Confidence in decision */
  confidence: number;

  /** Time taken to decide (days) */
  decisionTimeDays: number;

  /** Whether decision was reversed */
  wasReversed?: boolean;

  /** Satisfaction with outcome (if known) */
  satisfaction?: number;
}

/**
 * Outcome record.
 */
export interface OutcomeRecord {
  /** Outcome ID */
  id: string;

  /** When outcome occurred */
  timestamp: number;

  /** Outcome type */
  type: string;

  /** Outcome value (normalized) */
  value: number;

  /** Expected value */
  expectedValue: number;

  /** Satisfaction (0-1) */
  satisfaction: number;

  /** Related decision */
  relatedDecisionId?: string;
}

/**
 * Options for longitudinal analysis.
 */
export interface LongitudinalOptions {
  /** Minimum time between events (ms) */
  minEventGap?: number;

  /** Significance threshold for transitions */
  transitionThreshold?: number;

  /** Lookback period (ms) */
  lookbackPeriod?: number;

  /** Whether to include predictions */
  includePredictions?: boolean;

  /** Maximum predictions to generate */
  maxPredictions?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for LongitudinalIntelligenceEngine.
 */
export interface LongitudinalConfig {
  /** Minimum events to detect patterns */
  minEventsForPatterns: number;

  /** Minimum decisions to detect decision patterns */
  minDecisionsForPattern: number;

  /** Transition detection sensitivity (0-1) */
  transitionSensitivity: number;

  /** Milestone significance threshold */
  milestoneThreshold: number;

  /** Default lookback period (ms) */
  defaultLookbackMs: number;
}

/** Default configuration */
export const DEFAULT_LONGITUDINAL_CONFIG: LongitudinalConfig = {
  minEventsForPatterns: 5,
  minDecisionsForPattern: 3,
  transitionSensitivity: 0.3,
  milestoneThreshold: 0.6,
  defaultLookbackMs: 365 * 24 * 60 * 60 * 1000, // 1 year
};
