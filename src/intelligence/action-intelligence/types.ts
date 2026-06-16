/**
 * Action Intelligence - Types
 *
 * Comprehensive type system for transforming CareerOS intelligence into
 * executable action plans. Bridges the gap between understanding and doing.
 *
 * Core Principle: Every recommendation must answer "What do I do next?"
 *
 * @module intelligence/action-intelligence
 */

import type {
  EntityId,
  ConfidenceScore,
  BeliefTimestamp,
  StudentBelief,
  StudentBeliefV3,
  CareerPath,
  CareerRecommendation,
  CareerNode,
  Strength,
} from '../types';

import type {
  CareerPathIntelligenceInput,
  CareerPathIntelligenceAnalysis,
  CareerPath as PathIntelligenceCareerPath,
  Milestone,
} from '../career-path-intelligence/types';

export type { Milestone };

// =============================================================================
// CORE ENUMS
// =============================================================================

/**
 * Time horizons for action planning
 */
export enum TimeHorizon {
  NEXT_7_DAYS = 'NEXT_7_DAYS',
  NEXT_30_DAYS = 'NEXT_30_DAYS',
  NEXT_90_DAYS = 'NEXT_90_DAYS',
  NEXT_1_YEAR = 'NEXT_1_YEAR',
  NEXT_3_YEARS = 'NEXT_3_YEARS',
}

/**
 * Action types categorizing what needs to be done
 */
export enum ActionType {
  RESEARCH = 'RESEARCH',           // Gather information
  LEARN = 'LEARN',                 // Acquire knowledge/skills
  PRACTICE = 'PRACTICE',           // Build skills through doing
  NETWORK = 'NETWORK',             // Build professional relationships
  APPLY = 'APPLY',                 // Submit applications
  PREPARE = 'PREPARE',             // Get ready for exams/interviews
  DECIDE = 'DECIDE',               // Make a choice
  EXECUTE = 'EXECUTE',             // Complete a task
  REFLECT = 'REFLECT',             // Review and assess progress
}

/**
 * Action priority levels
 */
export enum ActionPriority {
  CRITICAL = 'CRITICAL',           // Must do immediately
  HIGH = 'HIGH',                   // Important, do soon
  MEDIUM = 'MEDIUM',               // Should do when possible
  LOW = 'LOW',                     // Nice to have
  OPTIONAL = 'OPTIONAL',           // Only if time permits
}

/**
 * Action status tracking
 */
export enum ActionStatus {
  NOT_STARTED = 'NOT_STARTED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DEFERRED = 'DEFERRED',
}

/**
 * Resource types required for actions
 */
export enum ResourceType {
  TIME = 'TIME',                   // Hours needed
  MONEY = 'MONEY',                 // Financial cost
  EQUIPMENT = 'EQUIPMENT',         // Physical resources
  SUPPORT = 'SUPPORT',             // Help from others
  ACCESS = 'ACCESS',               // Access to platforms/institutions
}

/**
 * Opportunity types that can be recommended
 */
export enum OpportunityType {
  COURSE = 'COURSE',               // Educational course
  PROJECT = 'PROJECT',             // Hands-on project
  COMPETITION = 'COMPETITION',     // Competitive event
  INTERNSHIP = 'INTERNSHIP',       // Work experience
  MENTORSHIP = 'MENTORSHIP',       // Guidance from expert
  COMMUNITY = 'COMMUNITY',         // Join a group/community
  EVENT = 'EVENT',                 // Attend an event
  CERTIFICATION = 'CERTIFICATION', // Get certified
  NETWORKING = 'NETWORKING',       // Networking opportunity
  VOLUNTEERING = 'VOLUNTEERING',   // Volunteer work
}

/**
 * Constraint types that affect action feasibility
 */
export enum ConstraintType {
  FINANCIAL = 'FINANCIAL',
  TEMPORAL = 'TEMPORAL',
  GEOGRAPHIC = 'GEOGRAPHIC',
  FAMILY = 'FAMILY',
  EDUCATIONAL = 'EDUCATIONAL',
  LEGAL = 'LEGAL',
  HEALTH = 'HEALTH',
}

// =============================================================================
// CORE ACTION TYPES
// =============================================================================

/**
 * A single actionable item
 */
export interface Action {
  /** Unique action identifier */
  id: EntityId;

  /** Human-readable action title */
  title: string;

  /** Detailed description of what to do */
  description: string;

  /** Type of action */
  type: ActionType | keyof typeof ActionType;

  /** Priority level */
  priority: ActionPriority | keyof typeof ActionPriority;

  /** Current status */
  status: ActionStatus | keyof typeof ActionStatus;

  /** Time horizon this action belongs to */
  timeHorizon: TimeHorizon | keyof typeof TimeHorizon;

  /** Estimated duration to complete (hours) */
  estimatedDuration: number;

  /** Deadline if applicable */
  deadline?: BeliefTimestamp;

  /** Resources required */
  resourcesRequired: ResourceRequirement[];

  /** Skills this action will develop */
  skillsDeveloped: string[];

  /** Prerequisites that must be completed first */
  prerequisites: string[]; // Action IDs

  /** Tags for categorization */
  tags: string[];

  /** Source of this action (which engine generated it) */
  source: string;

  /** Related career path or recommendation */
  relatedPathId?: EntityId;

  /** Related milestone if applicable */
  relatedMilestoneId?: string;

  /** Expected outcome of completing this action */
  expectedOutcome: string;

  /** Success criteria */
  successCriteria: string[];

  /** How this action contributes to larger goals */
  strategicContribution: string;

  /** Confidence in this action's effectiveness */
  confidence: ConfidenceScore;

  /** When this action was generated */
  generatedAt: BeliefTimestamp;
}

/**
 * Resource requirement for an action
 */
export interface ResourceRequirement {
  type: ResourceType | keyof typeof ResourceType;
  amount: number;
  unit: string;
  description?: string;
  isNegotiable: boolean;
}

/**
 * Action group - related actions clustered together
 */
export interface ActionGroup {
  /** Group identifier */
  id: EntityId;

  /** Group name */
  name: string;

  /** Group description */
  description: string;

  /** Actions in this group */
  actions: Action[];

  /** Common theme or goal */
  theme: string;

  /** Estimated total duration for all actions */
  totalDuration: number;

  /** Cumulative priority (highest action priority) */
  priority: ActionPriority;
}

// =============================================================================
// SKILL GAP TYPES
// =============================================================================

/**
 * A skill gap between current state and target requirements
 */
export interface SkillGap {
  /** Skill identifier */
  skillId: EntityId;

  /** Skill name */
  skillName: string;

  /** Current skill level (0-1) */
  currentLevel: ConfidenceScore;

  /** Required skill level (0-1) */
  requiredLevel: ConfidenceScore;

  /** Gap size (required - current) */
  gapSize: number;

  /** Whether this skill is critical or optional */
  isCritical: boolean;

  /** Time to acquire this skill (hours) */
  timeToAcquire: number;

  /** Resources needed to acquire */
  resourcesNeeded: ResourceRequirement[];

  /** Suggested learning path */
  learningPath: LearningStep[];

  /** How this skill contributes to target career */
  strategicImportance: string;
}

/**
 * A step in learning a skill
 */
export interface LearningStep {
  order: number;
  title: string;
  description: string;
  resources: string[];
  estimatedTime: number;
  validationMethod: string;
}

/**
 * Complete skill gap analysis
 */
export interface SkillGapAnalysis {
  /** Target career or path */
  targetId: EntityId;

  /** Current skills profile */
  currentSkills: SkillAssessment[];

  /** Required skills profile */
  requiredSkills: SkillRequirement[];

  /** Identified gaps */
  gaps: SkillGap[];

  /** Critical gaps that block progress */
  criticalGaps: SkillGap[];

  /** Optional gaps that enhance success */
  optionalGaps: SkillGap[];

  /** Total time to close all gaps */
  totalTimeToClose: number;

  /** Recommended priority order for closing gaps */
  priorityOrder: string[]; // Skill IDs
}

/**
 * Assessment of a current skill
 */
export interface SkillAssessment {
  skillId: EntityId;
  skillName: string;
  level: ConfidenceScore;
  evidence: string[];
  lastAssessed: BeliefTimestamp;
}

/**
 * Requirement for a target skill
 */
export interface SkillRequirement {
  skillId: EntityId;
  skillName: string;
  minimumLevel: ConfidenceScore;
  preferredLevel: ConfidenceScore;
  isRequired: boolean;
  rationale: string;
}

// =============================================================================
// OPPORTUNITY TYPES
// =============================================================================

/**
 * An opportunity that can help achieve career goals
 */
export interface Opportunity {
  /** Opportunity identifier */
  id: EntityId;

  /** Opportunity name */
  name: string;

  /** Type of opportunity */
  type: OpportunityType;

  /** Detailed description */
  description: string;

  /** Provider or organizer */
  provider: string;

  /** Cost if any */
  cost?: {
    amount: number;
    currency: string;
    breakdown?: string;
  };

  /** Time commitment */
  timeCommitment: {
    duration: string;
    hoursPerWeek?: number;
    startDate?: BeliefTimestamp;
    endDate?: BeliefTimestamp;
  };

  /** Location (physical or virtual) */
  location: {
    type: 'ONLINE' | 'ONSITE' | 'HYBRID';
    city?: string;
    country?: string;
    url?: string;
  };

  /** Skills this opportunity develops */
  skillsDeveloped: string[];

  /** Prerequisites to participate */
  prerequisites: string[];

  /** Application deadline if applicable */
  applicationDeadline?: BeliefTimestamp;

  /** How to apply or register */
  applicationProcess: string;

  /** Benefits/outcomes */
  benefits: string[];

  /** Fit score for this student (0-1) */
  fitScore: ConfidenceScore;

  /** Why this is recommended */
  recommendationRationale: string;

  /** Related career paths */
  relatedCareerPaths: EntityId[];

  /** Priority level */
  priority: ActionPriority;

  /** Source of this opportunity */
  source: string;
}

/**
 * Location metadata for an opportunity.
 */
export interface OpportunityLocation {
  type: 'ONLINE' | 'ONSITE' | 'HYBRID';
  city?: string;
  country?: string;
  url?: string;
}

/**
 * Availability of resources for action execution.
 */
export interface ResourceAvailability {
  resource: ResourceType | keyof typeof ResourceType;
  available: boolean;
  amount?: number;
  notes?: string;
}

/**
 * Constraint analysis summary for action feasibility.
 */
export interface ConstraintAnalysis {
  feasible: boolean;
  blockingConstraints: string[];
  mitigations: string[];
  confidence: ConfidenceScore;
}

/**
 * Collection of opportunities by category
 */
export interface OpportunityBundle {
  category: string;
  description: string;
  opportunities: Opportunity[];
  recommendedOpportunityIds: EntityId[];
}

// =============================================================================
// PLANNING TYPES
// =============================================================================

/**
 * Weekly execution plan
 */
export interface WeeklyPlan {
  weekNumber: number;
  startDate: BeliefTimestamp;
  endDate: BeliefTimestamp;
  focus: string;
  goals: string[];
  actions: Action[];
  milestones: PlannedMilestone[];
  timeBudget: {
    totalHours: number;
    studyHours: number;
    practiceHours: number;
    networkingHours: number;
    otherHours: number;
  };
  reviewPoints: {
    midWeek: string;
    endOfWeek: string;
  };
}

/**
 * Monthly execution plan
 */
export interface MonthlyPlan {
  month: number;
  name: string;
  theme: string;
  description: string;
  weeklyPlans: WeeklyPlan[];
  monthlyGoals: string[];
  keyMilestones: PlannedMilestone[];
  skillTargets: SkillTarget[];
  reviewCriteria: string[];
}

/**
 * Milestone with execution details
 */
export interface PlannedMilestone {
  id?: EntityId;
  milestoneId?: string;
  name: string;
  description: string;
  targetDate: BeliefTimestamp;
  successCriteria: string[];
  requiredActions?: string[]; // Action IDs
  associatedActions?: EntityId[]; // Action IDs
  dependencies?: string[]; // Milestone IDs
  riskFactors?: string[];
  contingencyPlan?: string;
  estimatedEffort?: number;
  priority?: ActionPriority;
  timeHorizon?: TimeHorizon;
  status: ActionStatus;
}

/**
 * Skill development target
 */
export interface SkillTarget {
  skillId: EntityId;
  skillName: string;
  targetLevel: ConfidenceScore;
  currentLevel: ConfidenceScore;
  deadline: BeliefTimestamp;
  practiceHoursRequired: number;
  validationMethod: string;
}

// =============================================================================
// PRIORITY FRAMEWORK
// =============================================================================

/**
 * Priority scoring dimensions
 */
export interface PriorityScore {
  /** Overall priority score (0-1) */
  overall: number;

  /** Impact on achieving goals (0-1) */
  impact: number;

  /** Urgency/time sensitivity (0-1) */
  urgency: number;

  /** Difficulty to complete (0-1, higher = harder) */
  difficulty: number;

  /** Expected return on investment (0-1) */
  expectedReturn: number;

  /** Risk if not done (0-1) */
  risk: number;

  /** Alignment with constraints (0-1) */
  constraintAlignment: number;

  /** Strategic importance (0-1) */
  strategicImportance: number;
}

/**
 * Prioritized action with full scoring
 */
export interface PrioritizedAction extends Action {
  priorityScore: PriorityScore;
  rank: number;
  reasonForPriority: string;
  suggestedOrder: number;
  dependenciesOn: string[]; // Action IDs that must come before
}

/**
 * Priority roadmap - actions organized by priority
 */
export interface PriorityRoadmap {
  /** Critical actions (do first) */
  critical: PrioritizedAction[];

  /** High priority actions */
  high: PrioritizedAction[];

  /** Medium priority actions */
  medium: PrioritizedAction[];

  /** Low priority actions */
  low: PrioritizedAction[];

  /** Optional actions */
  optional: PrioritizedAction[];

  /** Sequenced order considering dependencies */
  sequencedOrder: PrioritizedAction[];

  /** Estimated timeline for completion */
  estimatedTimeline: {
    critical: string;
    high: string;
    medium: string;
    all: string;
  };
}

// =============================================================================
// EXPLANATION TYPES
// =============================================================================

/**
 * Explanation for why an action matters
 */
export interface ActionExplanation {
  /** Action being explained */
  actionId: EntityId;

  /** Why this action matters */
  whyItMatters?: string;

  /** Why this action matters in generated action plans */
  whyThisMatters?: string;

  /** How it contributes to goals */
  goalContribution?: string;

  /** How this action fits into the plan */
  howItFits?: string;

  /** Why it has this priority */
  priorityRationale?: string;

  /** Expected outcomes */
  expectedOutcomes?: string[];

  /** Expected outcome summary */
  expectedOutcome?: string;

  /** What success looks like */
  successDescription?: string;

  /** Consequences of not doing it */
  consequencesOfInaction?: string;

  /** Consequences if the action is skipped */
  ifNotDone?: string;

  /** How it relates to other actions */
  relationshipToOtherActions?: string;

  /** Tips for execution */
  executionTips?: string[];

  /** Common pitfalls to avoid */
  commonPitfalls?: string[];

  /** Resources to help */
  helpfulResources?: string[];

  /** Expected return on action */
  roi?: ActionImpact;

  /** Personalized context for the action */
  personalContext?: string;

  /** Alternative approaches */
  alternativeApproaches?: string[];
}

/**
 * Expected impact of an action across time horizons.
 */
export interface ActionImpact {
  shortTerm: ActionImpactWindow;
  mediumTerm: ActionImpactWindow;
  longTerm: ActionImpactWindow;
  careerTrajectory: string;
  confidence: ConfidenceScore;
  supportingEvidence: string[];
}

export interface ActionImpactWindow {
  description: string;
  timeframe: string;
  value: number;
}

/**
 * Strategic narrative explaining the overall action plan
 */
export interface StrategicNarrative {
  /** Overall strategy summary */
  summary: string;

  /** Key phases of execution */
  phases: PhaseDescription[];

  /** Critical path explanation */
  criticalPath: string;

  /** How constraints shaped the plan */
  constraintConsiderations: string;

  /** Success metrics */
  successMetrics: string[];

  /** Timeline overview */
  timelineOverview: string;

  /** Next immediate step */
  immediateNextStep: string;
}

/**
 * Phase in the strategic narrative
 */
export interface PhaseDescription {
  phaseNumber: number;
  name: string;
  description: string;
  duration: string;
  keyActions: string[];
  milestones: string[];
  successCriteria: string[];
}

// =============================================================================
// MAIN OUTPUT TYPES
// =============================================================================

/**
 * Complete action plan output
 */
export interface ActionPlan {
  /** Plan identifier */
  id: EntityId;

  /** Student this plan is for */
  studentId: EntityId;

  /** When this plan was generated */
  generatedAt: BeliefTimestamp;

  /** Target career or path */
  targetCareer: string;

  /** Version of this plan */
  version: number;

  /** All actions organized by time horizon */
  actionsByHorizon: Record<TimeHorizon, Action[]>;

  /** Actions organized by type */
  actionsByType: Record<ActionType, Action[]>;

  /** Complete priority roadmap */
  priorityRoadmap: PriorityRoadmap;

  /** Skill gap analysis */
  skillGapAnalysis: SkillGapAnalysis;

  /** Recommended opportunities */
  opportunities: OpportunityBundle[];

  /** Monthly execution plans */
  monthlyPlans: MonthlyPlan[];

  /** Weekly plans for immediate execution */
  weeklyPlans: WeeklyPlan[];

  /** Explanations for key actions */
  explanations: Record<EntityId, ActionExplanation>;

  /** Strategic narrative */
  strategicNarrative: StrategicNarrative;

  /** Key metrics and targets */
  metrics: {
    totalActions: number;
    criticalActions: number;
    estimatedCompletionTime: string;
    totalCost: number;
    skillGapsToClose: number;
    milestonesToAchieve: number;
  };

  /** Constraint considerations */
  constraintConsiderations: {
    financial: string;
    temporal: string;
    family: string;
    geographic: string;
  };

  /** Contributing engines */
  contributingEngines: string[];

  /** Confidence in this plan */
  overallConfidence: ConfidenceScore;
}

/**
 * Skill development plan
 */
export interface SkillDevelopmentPlan {
  targetCareer: string;
  currentSkillProfile: SkillAssessment[];
  targetSkillProfile: SkillRequirement[];
  gaps: SkillGap[];
  learningPathway: LearningStep[];
  practiceProjects: string[];
  validationMethods: string[];
  timeline: string;
  resources: ResourceRequirement[];
}

/**
 * Execution plan with detailed scheduling
 */
export interface ExecutionPlan {
  planId: EntityId;
  studentId: EntityId;
  targetDate: BeliefTimestamp;
  weeklyPlans: WeeklyPlan[];
  monthlyPlans: MonthlyPlan[];
  milestoneSchedule: PlannedMilestone[];
  reviewSchedule: ReviewPoint[];
  contingencyPlans: ContingencyPlan[];
  progressTracking: ProgressTracker;
}

/**
 * Review point in execution
 */
export interface ReviewPoint {
  date: BeliefTimestamp;
  type: 'WEEKLY' | 'MONTHLY' | 'MILESTONE' | 'PHASE';
  focus: string;
  questions: string[];
  successIndicators: string[];
}

/**
 * Contingency plan for when things go wrong
 */
export interface ContingencyPlan {
  trigger: string;
  condition: string;
  alternativeActions: Action[];
  adjustmentStrategy: string;
}

/**
 * Progress tracking configuration
 */
export interface ProgressTracker {
  metrics: string[];
  trackingFrequency: string;
  checkInPoints: BeliefTimestamp[];
  successIndicators: string[];
  warningIndicators: string[];
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Configuration for Action Intelligence generation.
 */
export interface ActionIntelligenceConfig {
  generateExplanations: boolean;
  includeContingencyPlans: boolean;
  includeResourceAnalysis: boolean;
  autoAdjustForConstraints: boolean;
  maxActionsPerHorizon: number;
  minActionPriority: ActionPriority | keyof typeof ActionPriority;
  explanationDetailLevel: 'brief' | 'standard' | 'detailed';
  defaultTimeHorizon: TimeHorizon;
  includeWeeklyPlans: boolean;
  includeMonthlyPlans: boolean;
}

/**
 * Input to the Action Intelligence Engine
 */
export interface ActionIntelligenceInput {
  /** Student belief (V2 or V3) */
  studentBelief: StudentBelief | StudentBeliefV3;

  /** Career recommendations from Recommendation Engine */
  careerRecommendations?: CareerRecommendation[];

  /** Career path intelligence analysis */
  careerPathAnalysis?: CareerPathIntelligenceAnalysis;

  /** Target career (if specified) */
  targetCareer?: string;

  /** Decision context */
  decisionContext?: {
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    deadline?: BeliefTimestamp;
    pressureFactors: string[];
  };

  /** Constraints to consider */
  constraints?: {
    financial?: {
      budget: number;
      canTakeLoan: boolean;
      monthlyLimit: number;
    };
    temporal?: {
      maxHoursPerWeek: number;
      deadline?: BeliefTimestamp;
    };
    location?: {
      canRelocate: boolean;
      preferredCities: string[];
    };
    family?: {
      requiresApproval: boolean;
      considerations: string[];
    };
  };

  /** Preferences for action generation */
  preferences?: {
    prioritizeSpeed: boolean;
    prioritizeCost: boolean;
    prioritizeSafety: boolean;
    maxActionsPerHorizon: number;
  };

  /** Current context */
  currentContext?: {
    currentEducationLevel: string;
    currentRole?: string;
    currentSkills: string[];
    currentCommitments: string[];
    availableHoursPerWeek: number;
  };

  /** When this input was created */
  timestamp: BeliefTimestamp;
}

/**
 * Complete output from the Action Intelligence Engine.
 */
export interface ActionOutput {
  immediateActions: PrioritizedAction[];
  weeklyPlan?: Partial<WeeklyPlan> & { weeklyPlans?: WeeklyPlan[] };
  monthlyPlan?: Partial<MonthlyPlan>;
  prioritizedActions: {
    critical: PrioritizedAction[];
    high: PrioritizedAction[];
    medium: PrioritizedAction[];
    low: PrioritizedAction[];
    optional?: PrioritizedAction[];
  };
  allActions: PrioritizedAction[];
  topActions: PrioritizedAction[];
  milestones: PlannedMilestone[];
  milestonesByTimeHorizon: Partial<Record<TimeHorizon, PlannedMilestone[]>>;
  skillGapAnalysis?: SkillGapAnalysis;
  skillDevelopmentPlan?: SkillDevelopmentPlan;
  opportunities: OpportunityBundle[];
  executionPlan?: ExecutionPlan;
  explanations?: ActionExplanation[];
  summary?: string;
  generatedAt: BeliefTimestamp;
  targetCareer: string;
  estimatedCompletionTime: string;
  nextReviewDate: BeliefTimestamp;
}

/**
 * Analysis output from Action Intelligence Engine
 */
export interface ActionIntelligenceAnalysis {
  id: EntityId;
  studentId: EntityId;
  timestamp: BeliefTimestamp;
  actionPlan: ActionPlan;
  skillDevelopmentPlan: SkillDevelopmentPlan;
  executionPlan: ExecutionPlan;
  immediateNextSteps: Action[];
  strategicSummary: string;
  confidence: ConfidenceScore;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get human-readable time horizon label
 */
export function getTimeHorizonLabel(horizon: TimeHorizon): string {
  const labels: Record<TimeHorizon, string> = {
    [TimeHorizon.NEXT_7_DAYS]: 'Next 7 Days',
    [TimeHorizon.NEXT_30_DAYS]: 'Next 30 Days',
    [TimeHorizon.NEXT_90_DAYS]: 'Next 90 Days',
    [TimeHorizon.NEXT_1_YEAR]: 'Next 1 Year',
    [TimeHorizon.NEXT_3_YEARS]: 'Next 3 Years',
  };
  return labels[horizon];
}

/**
 * Get priority score weight
 */
export function getPriorityWeight(priority: ActionPriority | keyof typeof ActionPriority): number {
  const weights: Record<ActionPriority | keyof typeof ActionPriority, number> = {
    [ActionPriority.CRITICAL]: 5,
    [ActionPriority.HIGH]: 4,
    [ActionPriority.MEDIUM]: 3,
    [ActionPriority.LOW]: 2,
    [ActionPriority.OPTIONAL]: 1,
  };
  return weights[priority];
}

/**
 * Get time horizon ordering weight.
 */
export function getHorizonWeight(horizon: TimeHorizon | keyof typeof TimeHorizon): number {
  const weights: Record<TimeHorizon | keyof typeof TimeHorizon, number> = {
    [TimeHorizon.NEXT_7_DAYS]: 5,
    [TimeHorizon.NEXT_30_DAYS]: 4,
    [TimeHorizon.NEXT_90_DAYS]: 3,
    [TimeHorizon.NEXT_1_YEAR]: 2,
    [TimeHorizon.NEXT_3_YEARS]: 1,
  };
  return weights[horizon];
}

/**
 * Validate that an object has the required action fields.
 */
export function isValidAction(action: Partial<Action> | undefined): action is Action {
  return Boolean(
    action?.id &&
    action.title &&
    action.description &&
    action.type &&
    action.priority &&
    action.status &&
    action.timeHorizon
  );
}

/**
 * Validate that an action includes execution-ready details.
 */
export function isCompleteAction(action: Partial<Action> | undefined): action is Action {
  return Boolean(
    isValidAction(action) &&
    action.estimatedDuration !== undefined &&
    action.expectedOutcome &&
    action.successCriteria?.length
  );
}

/**
 * Calculate overall priority score
 */
export function calculateOverallPriorityScore(score: PriorityScore): number {
  return (
    score.impact * 0.25 +
    score.urgency * 0.25 +
    (1 - score.difficulty) * 0.15 + // Lower difficulty = higher score
    score.expectedReturn * 0.15 +
    score.risk * 0.1 +
    score.constraintAlignment * 0.1
  );
}

/**
 * Format duration for display
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hours`;
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${days} days`;
  }
  const months = Math.round(days / 30);
  if (months < 12) {
    return `${months} months`;
  }
  const years = Math.round(months / 12);
  return `${years} years`;
}

/**
 * Format cost for display
 */
export function formatCost(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }
  return `${currency} ${amount}`;
}
