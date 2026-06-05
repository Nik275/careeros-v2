/**
 * CareerOS - Outcome Tracking Engine Types
 *
 * Phase: Outcome Tracking Engine
 *
 * Intelligence feedback system for learning whether CareerOS
 * recommendations actually work.
 *
 * Track: Recommendation → Decision → Action → Outcome
 *
 * @module outcome-tracking-types
 * @version 1.0.0
 */

import type { RecommendationId } from '../../recommendation/recommendation-types';
import type { CohortId } from './cohort-engine-types';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

/** Unique identifier for a tracking event */
export type TrackingEventId = string;

/** Unique identifier for an outcome record */
export type OutcomeRecordId = string;

// CohortId is defined in cohort-engine-types.ts

/** Student identifier (privacy-preserved) */
export type StudentId = string;

// ============================================================================
// RECOMMENDATION EVENT
// ============================================================================

/**
 * Event fired when a recommendation is presented to a student.
 *
 * Captures the initial recommendation context for outcome tracking.
 */
export interface RecommendationEvent {
  /** Unique event identifier */
  eventId: TrackingEventId;

  /** Recommendation being tracked */
  recommendationId: RecommendationId;

  /** Student who received the recommendation (hashed for privacy) */
  studentId: StudentId;

  /** Type of recommendation presented */
  recommendationType: string;

  /** Timestamp of recommendation presentation */
  timestamp: Date;

  /** Context in which recommendation was made */
  context: RecommendationContext;
}

/** Context for recommendation presentation */
export interface RecommendationContext {
  /** Session identifier */
  sessionId: string;

  /** UI component that presented the recommendation */
  presentationChannel: 'DASHBOARD' | 'ADVISOR' | 'REPORT' | 'API' | 'MOBILE';

  /** Position in recommendation list (1 = top) */
  rankPosition: number;

  /** Whether student interacted with this recommendation */
  wasInteracted: boolean;

  /** Time spent viewing recommendation (seconds) */
  viewDurationSeconds?: number;
}

// ============================================================================
// DECISION EVENT
// ============================================================================

/**
 * Event fired when a student makes a decision about a recommendation.
 *
 * Captures the choice, rejected alternatives, and decision rationale.
 */
export interface DecisionEvent {
  /** Unique event identifier */
  eventId: TrackingEventId;

  /** Original recommendation event */
  recommendationEventId: TrackingEventId;

  /** Student who made the decision */
  studentId: StudentId;

  /** Timestamp of decision */
  timestamp: Date;

  /** Selected option */
  selectedOption: SelectedOption;

  /** Options that were rejected */
  rejectedOptions: RejectedOption[];

  /** Decision confidence (0-100) */
  confidence: number;

  /** Student's rationale for the decision */
  rationale: DecisionRationale;
}

/** Selected career option */
export interface SelectedOption {
  /** Career identifier chosen */
  careerId: string;

  /** Career title */
  careerTitle: string;

  /** How this relates to the recommendation */
  relationshipToRecommendation: 'ACCEPTED' | 'MODIFIED' | 'ADJACENT' | 'CUSTOM';

  /** Whether this matches the original recommendation */
  matchesRecommendation: boolean;
}

/** Rejected career option */
export interface RejectedOption {
  /** Career identifier rejected */
  careerId: string;

  /** Career title */
  careerTitle: string;

  /** Reason for rejection (if provided) */
  rejectionReason?: string;

  /** Rejection category */
  rejectionCategory?:
    | 'NOT_INTERESTED'
    | 'TOO_DIFFICULT'
    | 'POOR_FIT'
    | 'LOW_INCOME'
    | 'BAD_OUTLOOK'
    | 'LIFESTYLE_MISMATCH'
    | 'OTHER';
}

/** Student's decision rationale */
export interface DecisionRationale {
  /** Primary factors in the decision */
  primaryFactors: string[];

  /** Influencing factors */
  influencingFactors: string[];

  /** Deal breakers (if any) */
  dealBreakers: string[];

  /** Decision timeframe */
  decisionTimeframe: 'IMMEDIATE' | 'DAYS' | 'WEEKS' | 'MONTHS';

  /** External influences */
  externalInfluences: string[];
}

// ============================================================================
// ACTION EVENT
// ============================================================================

/**
 * Event fired when a student takes action on their decision.
 *
 * Tracks progress, milestones, and action completion.
 */
export interface ActionEvent {
  /** Unique event identifier */
  eventId: TrackingEventId;

  /** Decision event this action follows */
  decisionEventId: TrackingEventId;

  /** Student taking action */
  studentId: StudentId;

  /** Timestamp of action */
  timestamp: Date;

  /** Actions taken toward the career goal */
  actionsTaken: ActionItem[];

  /** Milestones completed */
  milestonesCompleted: Milestone[];

  /** Current progress status */
  progressStatus: ProgressStatus;
}

/** Individual action item */
export interface ActionItem {
  /** Action identifier */
  actionId: string;

  /** Action type */
  actionType: ActionType;

  /** Action description */
  description: string;

  /** Whether action was completed */
  completed: boolean;

  /** Completion timestamp */
  completedAt?: Date;

  /** Effort invested (hours) */
  effortHours?: number;
}

/** Types of career actions */
export type ActionType =
  | 'RESEARCH'
  | 'SKILL_BUILDING'
  | 'NETWORKING'
  | 'APPLICATION'
  | 'INTERVIEW_PREP'
  | 'EDUCATION'
  | 'CERTIFICATION'
  | 'PROJECT_WORK'
  | 'JOB_SEARCH'
  | 'CAREER_CHANGE'
  | 'SIDE_PROJECT'
  | 'MENTORSHIP';

/** Milestone achievement */
export interface Milestone {
  /** Milestone identifier */
  milestoneId: string;

  /** Milestone name */
  name: string;

  /** Milestone category */
  category: MilestoneCategory;

  /** Achievement timestamp */
  achievedAt: Date;

  /** Time to achieve (days from decision) */
  timeToAchieveDays: number;
}

/** Milestone categories */
export type MilestoneCategory =
  | 'EXPLORATION'
  | 'SKILL_ACQUISITION'
  | 'EXPERIENCE'
  | 'NETWORK'
  | 'APPLICATION'
  | 'OFFER'
  | 'TRANSITION'
  | 'GROWTH';

/** Progress status for career pursuit */
export interface ProgressStatus {
  /** Overall progress percentage (0-100) */
  overallProgress: number;

  /** Current stage in career pursuit */
  currentStage: CareerPursuitStage;

  /** Days since decision */
  daysSinceDecision: number;

  /** Whether still active in pursuit */
  isActive: boolean;

  /** Last activity timestamp */
  lastActivityAt: Date;

  /** Estimated completion date */
  estimatedCompletionAt?: Date;
}

/** Stages of career pursuit */
export type CareerPursuitStage =
  | 'EXPLORING'
  | 'PREPARING'
  | 'APPLYING'
  | 'INTERVIEWING'
  | 'NEGOTIATING'
  | 'TRANSITIONING'
  | 'ESTABLISHED'
  | 'PAUSED'
  | 'ABANDONED';

// ============================================================================
// OUTCOME EVENT
// ============================================================================

/**
 * Event fired when outcomes are measured for a career pursuit.
 *
 * Captures achieved results across multiple outcome dimensions.
 */
export interface OutcomeEvent {
  /** Unique event identifier */
  eventId: TrackingEventId;

  /** Action event this outcome follows */
  actionEventId: TrackingEventId;

  /** Student who achieved the outcome */
  studentId: StudentId;

  /** Outcome measurement timestamp */
  timestamp: Date;

  /** Whether the desired outcome was achieved */
  achievedOutcome: boolean;

  /** Outcome timeline */
  timeline: OutcomeTimeline;

  /** Satisfaction metrics */
  satisfaction: SatisfactionMetrics;

  /** Utility metrics */
  utility: UtilityMetrics;

  /** Regret metrics */
  regret: RegretMetrics;

  /** Optionality metrics */
  optionality: OptionalityMetrics;

  /** Detailed outcome dimensions */
  dimensions: OutcomeDimensions;
}

/** Timeline for outcome achievement */
export interface OutcomeTimeline {
  /** Days from decision to first milestone */
  daysToFirstMilestone: number;

  /** Days from decision to outcome */
  daysToOutcome: number;

  /** Days from expected timeline (negative = early, positive = late) */
  varianceFromExpectedDays: number;

  /** Whether achieved within expected timeframe */
  onTime: boolean;

  /** Estimated completion date (if still in progress) */
  estimatedCompletionAt?: Date;
}

/** Satisfaction measurements */
export interface SatisfactionMetrics {
  /** Overall satisfaction (0-100) */
  overallSatisfaction: number;

  /** Career satisfaction (0-100) */
  careerSatisfaction: number;

  /** Work-life balance satisfaction (0-100) */
  workLifeBalance: number;

  /** Compensation satisfaction (0-100) */
  compensationSatisfaction: number;

  /** Growth satisfaction (0-100) */
  growthSatisfaction: number;
}

/** Utility measurements */
export interface UtilityMetrics {
  /** Realized utility score (0-100) */
  realizedUtility: number;

  /** Comparison to expected utility (0-100) */
  utilityAccuracy: number;

  /** Utility delta from expected (positive = better) */
  utilityDelta: number;
}

/** Regret measurements */
export interface RegretMetrics {
  /** Regret level (0-100, higher = more regret) */
  regretLevel: number;

  /** Whether student would make same decision again */
  wouldChooseAgain: boolean;

  /** Regret categories */
  regretCategories: RegretCategory[];

  /** Alternative considered after outcome */
  alternativesConsidered: string[];
}

/** Regret category */
export interface RegretCategory {
  /** Category type */
  category:
    | 'CAREER_CHOICE'
    | 'TIMING'
    | 'PREPARATION'
    | 'ALTERNATIVE_MISSED'
    | 'EXPECTATION_GAP';

  /** Regret intensity (0-100) */
  intensity: number;

  /** Description */
  description: string;
}

/** Optionality measurements */
export interface OptionalityMetrics {
  /** Optionality score achieved (0-100) */
  achievedOptionality: number;

  /** Expected vs achieved optionality */
  optionalityDelta: number;

  /** New options opened by this career */
  newOptionsOpened: string[];

  /** Options foreclosed by this career */
  optionsForeclosed: string[];

  /** Career mobility score (0-100) */
  careerMobility: number;
}

/** Outcome dimensions - comprehensive tracking */
export interface OutcomeDimensions {
  /** Career progress dimension */
  careerProgress: CareerProgressDimension;

  /** Income growth dimension */
  incomeGrowth: IncomeGrowthDimension;

  /** Skill growth dimension */
  skillGrowth: SkillGrowthDimension;

  /** Life satisfaction dimension */
  lifeSatisfaction: LifeSatisfactionDimension;

  /** Stress levels dimension */
  stressLevels: StressLevelsDimension;

  /** Learning growth dimension */
  learningGrowth: LearningGrowthDimension;

  /** Career mobility dimension */
  careerMobility: CareerMobilityDimension;

  /** Goal achievement dimension */
  goalAchievement: GoalAchievementDimension;
}

/** Career progress outcome */
export interface CareerProgressDimension {
  /** Score (0-100) */
  score: number;

  /** Job level achieved */
  jobLevel?: string;

  /** Role achieved */
  roleAchieved?: string;

  /** Industry entered */
  industry?: string;

  /** Time to career entry (days) */
  timeToEntryDays?: number;
}

/** Income growth outcome */
export interface IncomeGrowthDimension {
  /** Score (0-100) */
  score: number;

  /** Starting income */
  startingIncome?: number;

  /** Current income */
  currentIncome?: number;

  /** Income growth percentage */
  growthPercentage?: number;

  /** Comparison to expected income */
  vsExpectedPercentage?: number;
}

/** Skill growth outcome */
export interface SkillGrowthDimension {
  /** Score (0-100) */
  score: number;

  /** Skills acquired */
  skillsAcquired: string[];

  /** Skill proficiency levels */
  proficiencyLevels: Record<string, number>;

  /** Certifications earned */
  certifications: string[];
}

/** Life satisfaction outcome */
export interface LifeSatisfactionDimension {
  /** Score (0-100) */
  score: number;

  /** Work-life balance rating */
  workLifeBalance: number;

  /** Location satisfaction */
  locationSatisfaction: number;

  /** Relationship impact */
  relationshipImpact: number;

  /** Health impact */
  healthImpact: number;
}

/** Stress levels outcome */
export interface StressLevelsDimension {
  /** Score (0-100, higher = less stress) */
  score: number;

  /** Work stress level (0-100) */
  workStress: number;

  /** Financial stress level (0-100) */
  financialStress: number;

  /** Career uncertainty stress (0-100) */
  uncertaintyStress: number;
}

/** Learning growth outcome */
export interface LearningGrowthDimension {
  /** Score (0-100) */
  score: number;

  /** Learning opportunities rating */
  learningOpportunities: number;

  /** Mentorship quality rating */
  mentorshipQuality: number;

  /** Growth velocity */
  growthVelocity: number;
}

/** Career mobility outcome */
export interface CareerMobilityDimension {
  /** Score (0-100) */
  score: number;

  /** Internal mobility options */
  internalMobility: number;

  /** External mobility options */
  externalMobility: number;

  /** Promotion velocity */
  promotionVelocity: number;
}

/** Goal achievement outcome */
export interface GoalAchievementDimension {
  /** Score (0-100) */
  score: number;

  /** Goals achieved */
  goalsAchieved: string[];

  /** Goals in progress */
  goalsInProgress: string[];

  /** Goals abandoned */
  goalsAbandoned: string[];

  /** New goals set */
  newGoalsSet: string[];
}

// ============================================================================
// TRACKING EVENT UNION
// ============================================================================

/** All tracking event types */
export type TrackingEvent =
  | RecommendationEvent
  | DecisionEvent
  | ActionEvent
  | OutcomeEvent;

/** Event type discriminator */
export type TrackingEventType =
  | 'RECOMMENDATION'
  | 'DECISION'
  | 'ACTION'
  | 'OUTCOME';

// ============================================================================
// OUTCOME RECORD
// ============================================================================

/**
 * Complete outcome record linking recommendation to final outcome.
 *
 * This is the primary data structure for outcome learning.
 */
export interface OutcomeRecord {
  /** Unique record identifier */
  recordId: OutcomeRecordId;

  /** Complete event chain */
  events: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  };

  /** Derived insights */
  insights: OutcomeInsights;

  /** Learning data (privacy-safe) */
  learningData: LearningData;

  /** Record metadata */
  metadata: OutcomeRecordMetadata;
}

/** Insights derived from an outcome record */
export interface OutcomeInsights {
  /** Whether recommendation led to positive outcome */
  recommendationSuccess: boolean;

  /** Path taken vs recommended */
  pathDeviation: 'NONE' | 'MINOR' | 'MAJOR' | 'COMPLETE';

  /** Key success factors identified */
  successFactors: string[];

  /** Key failure factors identified */
  failureFactors: string[];

  /** Unexpected outcomes */
  unexpectedOutcomes: string[];
}

/** Learning data extracted from outcome (privacy-preserved) */
export interface LearningData {
  /** Archetype patterns */
  archetypePatterns: string[];

  /** Decision patterns */
  decisionPatterns: string[];

  /** Action patterns */
  actionPatterns: string[];

  /** Outcome patterns */
  outcomePatterns: string[];

  /** Cohort assignments */
  cohortIds: CohortId[];
}

/** Outcome record metadata */
export interface OutcomeRecordMetadata {
  /** Record creation timestamp */
  createdAt: Date;

  /** Last updated timestamp */
  updatedAt: Date;

  /** Data quality score (0-100) */
  dataQualityScore: number;

  /** Completeness percentage */
  completenessPercentage: number;

  /** Whether record is eligible for learning */
  eligibleForLearning: boolean;
}
