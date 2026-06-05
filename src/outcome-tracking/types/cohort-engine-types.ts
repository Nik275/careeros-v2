/**
 * CareerOS - Cohort Engine Types
 *
 * Phase: Outcome Tracking Engine - Cohort Engine
 *
 * Creates and manages student cohorts for outcome analysis.
 *
 * @module cohort-engine-types
 * @version 1.0.0
 */

import type { StudentId, OutcomeRecordId } from './outcome-tracking-types';

// ============================================================================
// COHORT DEFINITIONS
// ============================================================================

/** Unique identifier for a cohort */
export type CohortId = string;

/**
 * Student cohort for outcome analysis.
 *
 * A cohort is a group of students who share similar characteristics,
 * enabling aggregate outcome analysis while preserving privacy.
 */
export interface Cohort {
  /** Unique cohort identifier */
  id: CohortId;

  /** Cohort name */
  name: string;

  /** Cohort description */
  description: string;

  /** Cohort type */
  type: CohortType;

  /** Criteria defining this cohort */
  criteria: CohortCriteria;

  /** Cohort statistics */
  statistics: CohortStatistics;

  /** Cohort membership (hashed/privacy-safe) */
  membership: CohortMembership;

  /** Cohort metadata */
  metadata: CohortMetadata;
}

/** Types of cohorts */
export type CohortType =
  | 'ARCHETYPE'      // Based on student archetype
  | 'DEMOGRAPHIC'    // Based on demographic factors
  | 'BEHAVIORAL'     // Based on behavior patterns
  | 'OUTCOME'        // Based on outcome patterns
  | 'DECISION'       // Based on decision patterns
  | 'ACTION'         // Based on action patterns
  | 'COMPOSITE'      // Combination of multiple factors
  | 'DYNAMIC';       // Automatically updated based on rules

/** Criteria for cohort membership */
export interface CohortCriteria {
  /** Archetype criteria */
  archetype?: ArchetypeCriteria;

  /** Demographic criteria */
  demographic?: DemographicCriteria;

  /** Behavioral criteria */
  behavioral?: BehavioralCriteria;

  /** Decision criteria */
  decision?: DecisionCriteria;

  /** Action criteria */
  action?: ActionCriteria;

  /** Outcome criteria */
  outcome?: OutcomeCriteria;

  /** Composite criteria (combines multiple types) */
  composite?: CompositeCriteria;
}

/** Archetype-based criteria */
export interface ArchetypeCriteria {
  /** Primary archetype */
  primaryArchetype?: string;

  /** Secondary archetypes */
  secondaryArchetypes?: string[];

  /** Required archetype traits */
  requiredTraits?: Array<{
    trait: string;
    minScore: number;
    maxScore: number;
  }>;

  /** Risk tolerance range */
  riskToleranceRange?: { min: number; max: number };

  /** Autonomy preference range */
  autonomyPreferenceRange?: { min: number; max: number };
}

/** Demographic-based criteria */
export interface DemographicCriteria {
  /** Education level */
  educationLevel?: string[];

  /** Field of study */
  fieldOfStudy?: string[];

  /** Career stage */
  careerStage?: string[];

  /** Geographic region (broad) */
  geographicRegion?: string[];

  /** City tier */
  cityTier?: ('TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4')[];

  /** Years of experience range */
  experienceYearsRange?: { min: number; max: number };
}

/** Behavioral-based criteria */
export interface BehavioralCriteria {
  /** Engagement level */
  engagementLevel?: ('HIGH' | 'MEDIUM' | 'LOW')[];

  /** Decision speed */
  decisionSpeed?: ('FAST' | 'MODERATE' | 'DELIBERATE')[];

  /** Action patterns */
  actionPatterns?: string[];

  /** Interaction patterns */
  interactionPatterns?: string[];

  /** Career exploration breadth */
  explorationBreadth?: ('NARROW' | 'MODERATE' | 'BROAD')[];
}

/** Decision-based criteria */
export interface DecisionCriteria {
  /** Decision types made */
  decisionTypes?: string[];

  /** Career paths chosen */
  careerPathsChosen?: string[];

  /** Decision confidence range */
  confidenceRange?: { min: number; max: number };

  /** Time to decision range */
  timeToDecisionRange?: { min: number; max: number };
}

/** Action-based criteria */
export interface ActionCriteria {
  /** Action types taken */
  actionTypes?: string[];

  /** Progress level achieved */
  progressLevel?: string[];

  /** Completion rate range */
  completionRateRange?: { min: number; max: number };

  /** Time to milestone range */
  timeToMilestoneRange?: { min: number; max: number };
}

/** Outcome-based criteria */
export interface OutcomeCriteria {
  /** Outcome types achieved */
  outcomeTypes?: string[];

  /** Satisfaction range */
  satisfactionRange?: { min: number; max: number };

  /** Success status */
  successStatus?: ('SUCCESS' | 'PARTIAL' | 'FAILURE')[];

  /** Timeline range */
  timelineRange?: { min: number; max: number };
}

/** Composite criteria combining multiple factors */
export interface CompositeCriteria {
  /** Criteria to combine */
  criteria: Array<{
    type: 'ARCHETYPE' | 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'DECISION' | 'ACTION' | 'OUTCOME';
    criteria: Record<string, unknown>;
    weight: number;
  }>;

  /** Combination operator */
  operator: 'AND' | 'OR' | 'WEIGHTED';

  /** Minimum match threshold */
  minMatchThreshold: number;
}

/** Cohort statistics */
export interface CohortStatistics {
  /** Current member count */
  memberCount: number;

  /** Historical member count (including those who left) */
  historicalMemberCount: number;

  /** Average time in cohort (days) */
  averageTimeInCohortDays: number;

  /** Member churn rate */
  churnRate: number;

  /** Outcome statistics for cohort */
  outcomes: CohortOutcomeStatistics;

  /** Last updated timestamp */
  lastUpdatedAt: Date;
}

/** Cohort outcome statistics */
export interface CohortOutcomeStatistics {
  /** Average satisfaction */
  averageSatisfaction: number;

  /** Success rate */
  successRate: number;

  /** Average timeline to outcome (days) */
  averageTimelineDays: number;

  /** Average regret level */
  averageRegret: number;

  /** Most common career paths */
  topCareerPaths: Array<{ path: string; percentage: number }>;

  /** Most common decisions */
  topDecisions: Array<{ decision: string; percentage: number }>;

  /** Outcome distribution */
  outcomeDistribution: Record<string, number>;
}

/** Cohort membership (privacy-safe) */
export interface CohortMembership {
  /** Member count (actual count, not identifiable) */
  count: number;

  /** Hashed member identifiers (for internal use only) */
  hashedMemberIds?: string[];

  /** Membership rules (for dynamic cohorts) */
  membershipRules?: MembershipRule[];

  /** Whether membership is dynamic */
  isDynamic: boolean;
}

/** Membership rule for dynamic cohorts */
export interface MembershipRule {
  /** Rule identifier */
  ruleId: string;

  /** Rule description */
  description: string;

  /** Condition for membership */
  condition: {
    attribute: string;
    operator: 'EQUALS' | 'IN' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
    value: unknown;
  };

  /** Whether rule is required or optional */
  required: boolean;
}

/** Cohort metadata */
export interface CohortMetadata {
  /** Cohort creation timestamp */
  createdAt: Date;

  /** Cohort creator */
  createdBy: string;

  /** Last modification timestamp */
  modifiedAt: Date;

  /** Cohort version */
  version: number;

  /** Whether cohort is active */
  isActive: boolean;

  /** Cohort purpose */
  purpose: string;

  /** Privacy classification */
  privacyClassification: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';
}

// ============================================================================
// COHORT OPERATIONS
// ============================================================================

/** Request to create a new cohort */
export interface CreateCohortRequest {
  /** Cohort name */
  name: string;

  /** Cohort description */
  description: string;

  /** Cohort type */
  type: CohortType;

  /** Cohort criteria */
  criteria: CohortCriteria;

  /** Whether cohort is dynamic */
  isDynamic: boolean;

  /** Cohort purpose */
  purpose: string;

  /** Privacy classification */
  privacyClassification?: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';
}

/** Result of cohort creation */
export interface CreateCohortResult {
  /** Created cohort */
  cohort: Cohort;

  /** Initial member count */
  initialMemberCount: number;

  /** Matching statistics */
  matchingStats: {
    totalStudentsChecked: number;
    studentsMatched: number;
    matchRate: number;
  };
}

/** Request to find cohorts for a student */
export interface FindCohortsRequest {
  /** Student identifier */
  studentId: StudentId;

  /** Student profile data */
  studentProfile: Record<string, unknown>;

  /** Cohort types to search */
  cohortTypes?: CohortType[];

  /** Minimum match score threshold */
  minMatchScore?: number;

  /** Maximum number of cohorts to return */
  maxCohorts?: number;
}

/** Result of finding cohorts */
export interface FindCohortsResult {
  /** Matching cohorts with scores */
  matchingCohorts: Array<{
    cohort: Cohort;
    matchScore: number;
    matchReasons: string[];
  }>;

  /** Primary cohort (highest match) */
  primaryCohort?: Cohort;

  /** Total cohorts checked */
  totalChecked: number;
}

/** Request to analyze cohort outcomes */
export interface AnalyzeCohortRequest {
  /** Cohort identifier */
  cohortId: CohortId;

  /** Analysis dimensions */
  dimensions?: string[];

  /** Comparison cohorts */
  compareWithCohortIds?: CohortId[];

  /** Time range for analysis */
  timeRange?: {
    startDate: Date;
    endDate: Date;
  };

  /** Minimum sample size */
  minSampleSize?: number;
}

/** Result of cohort analysis */
export interface AnalyzeCohortResult {
  /** Analyzed cohort */
  cohort: Cohort;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Outcome analysis */
  outcomes: CohortOutcomeAnalysis;

  /** Comparison results */
  comparisons?: CohortComparison[];

  /** Key insights */
  insights: CohortInsight[];

  /** Recommendations */
  recommendations: CohortRecommendation[];
}

/** Cohort outcome analysis */
export interface CohortOutcomeAnalysis {
  /** Sample size */
  sampleSize: number;

  /** Success metrics */
  successMetrics: {
    successRate: number;
    averageSatisfaction: number;
    averageRegret: number;
    averageTimelineDays: number;
  };

  /** Dimension breakdowns */
  dimensionBreakdowns: Record<string, DimensionBreakdown>;

  /** Trend analysis */
  trends: TrendAnalysis;

  /** Predictive factors */
  predictiveFactors: PredictiveFactor[];
}

/** Dimension breakdown */
export interface DimensionBreakdown {
  /** Dimension name */
  dimension: string;

  /** Average score */
  averageScore: number;

  /** Score distribution */
  distribution: Array<{ range: string; count: number; percentage: number }>;

  /** Correlation with success */
  correlationWithSuccess: number;
}

/** Trend analysis */
export interface TrendAnalysis {
  /** Overall trend direction */
  direction: 'IMPROVING' | 'STABLE' | 'DECLINING';

  /** Trend magnitude */
  magnitude: number;

  /** Period-over-period changes */
  periodChanges: Array<{
    period: string;
    change: number;
    significance: number;
  }>;
}

/** Predictive factor */
export interface PredictiveFactor {
  /** Factor name */
  factor: string;

  /** Factor type */
  type: 'ARCHETYPE' | 'DECISION' | 'ACTION' | 'CONTEXT';

  /** Predictive strength (0-100) */
  predictiveStrength: number;

  /** Impact on success */
  impactOnSuccess: number;

  /** Statistical significance */
  significance: number;
}

/** Cohort comparison */
export interface CohortComparison {
  /** Comparison cohort */
  comparedCohort: Cohort;

  /** Comparison cohort ID (for aggregate comparisons) */
  comparedCohortId?: string;

  /** Comparison cohort name (for aggregate comparisons) */
  comparedCohortName?: string;

  /** Outcome comparisons by dimension */
  outcomeComparisons: Array<{
    dimension: string;
    thisCohortValue: number;
    otherCohortValue: number;
    difference: number;
    percentageDifference: number;
    isSignificant: boolean;
  }>;

  /** Comparison metrics */
  metrics: {
    successRateDelta: number;
    satisfactionDelta: number;
    timelineDelta: number;
    regretDelta: number;
  };

  /** Statistical significance */
  isSignificant: boolean;

  /** Key differences */
  keyDifferences: string[];

  /** Significance summary */
  significanceSummary: {
    significantlyBetter: string[];
    significantlyWorse: string[];
    notSignificant: string[];
  };
}

/** Cohort insight */
export interface CohortInsight {
  /** Insight identifier */
  insightId: string;

  /** Cohort this insight applies to */
  cohortId?: string;

  /** Insight type */
  type: 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | 'RISK' | 'PATTERN' | 'CHOICE_PATTERN' | 'REGRET_PATTERN' | 'SUCCESS_PATTERN' | 'FAILURE_PATTERN' | 'TIMING_INSIGHT' | 'PATHWAY_INSIGHT';

  /** Insight title */
  title: string;

  /** Insight description */
  description: string;

  /** Supporting data */
  supportingData: {
    sampleSize: number;
    applicabilityPercentage?: number;
    successRate?: number;
    averageOutcomeScore?: number;
    metric?: string;
    value?: number;
    benchmark?: number;
    difference?: number;
    vsOverallPopulation?: {
      successRateDelta: number;
      satisfactionDelta: number;
      timelineDelta: number;
      isSignificant: boolean;
    };
    keyStatistics?: Record<string, number>;
  };

  /** Recommendations derived from insight */
  recommendations?: string[];

  /** Confidence level (0-100 or categorical) */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | number;

  /** Timestamp */
  generatedAt?: Date;
}

/** Cohort recommendation */
export interface CohortRecommendation {
  /** Recommendation identifier */
  recommendationId: string;

  /** Recommendation type */
  type: 'FOCUS' | 'IMPROVE' | 'LEVERAGE' | 'MITIGATE';

  /** Recommendation text */
  recommendation: string;

  /** Expected impact */
  expectedImpact: string;

  /** Implementation approach */
  implementationApproach: string;

  /** Priority */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ============================================================================
// COHORT EXAMPLES
// ============================================================================

/**
 * Predefined cohort examples for common use cases.
 */
export const COHORT_EXAMPLES = {
  /** Founder + Tier 2 City + Engineering Student */
  FOUNDER_TIER2_ENGINEER: {
    name: 'Founder Archetype + Tier 2 City + Engineering',
    description: 'Students with founder mindset in tier 2 cities with engineering backgrounds',
    criteria: {
      archetype: {
        primaryArchetype: 'FOUNDER',
        requiredTraits: [
          { trait: 'riskTolerance', minScore: 70, maxScore: 100 },
          { trait: 'autonomyPreference', minScore: 75, maxScore: 100 },
        ],
      },
      demographic: {
        cityTier: ['TIER_2'],
        fieldOfStudy: ['ENGINEERING', 'COMPUTER_SCIENCE', 'TECHNOLOGY'],
      },
    },
  },

  /** Researcher + NEET Aspirant */
  RESEARCHER_NEET: {
    name: 'Researcher Archetype + NEET Aspirant',
    description: 'Students with researcher mindset preparing for NEET',
    criteria: {
      archetype: {
        primaryArchetype: 'RESEARCHER',
        requiredTraits: [
          { trait: 'analyticalDepth', minScore: 75, maxScore: 100 },
          { trait: 'patience', minScore: 70, maxScore: 100 },
        ],
      },
      decision: {
        decisionTypes: ['NEET_PREPARATION', 'MEDICAL_CAREER_PATH'],
      },
    },
  },

  /** Builder + Career Switcher */
  BUILDER_CAREER_SWITCHER: {
    name: 'Builder Archetype + Career Switcher',
    description: 'Builder-minded students switching careers',
    criteria: {
      archetype: {
        primaryArchetype: 'BUILDER',
        requiredTraits: [
          { trait: 'practicalOrientation', minScore: 70, maxScore: 100 },
          { trait: 'executionFocus', minScore: 75, maxScore: 100 },
        ],
      },
      demographic: {
        careerStage: ['MID_CAREER', 'CAREER_TRANSITION'],
      },
      behavioral: {
        actionPatterns: ['SKILL_BUILDING', 'PROJECT_EXECUTION'],
      },
    },
  },
} as const;

// ============================================================================
// COHORT ENGINE INTERFACE
// ============================================================================

/**
 * Cohort Engine - Creates and manages student cohorts.
 *
 * The Cohort Engine groups students by similar characteristics
 * to enable aggregate outcome analysis while preserving privacy.
 */
export interface CohortEngine {
  /**
   * Create a new cohort.
   *
   * Defines a cohort based on specified criteria and populates
   * it with matching students.
   */
  createCohort(request: CreateCohortRequest): Promise<CreateCohortResult>;

  /**
   * Find cohorts for a student.
   *
   * Identifies all cohorts that a student belongs to based on
   * their profile characteristics.
   */
  findCohortsForStudent(request: FindCohortsRequest): Promise<FindCohortsResult>;

  /**
   * Analyze cohort outcomes.
   *
   * Performs comprehensive outcome analysis for a cohort,
   * including comparisons with other cohorts.
   */
  analyzeCohort(request: AnalyzeCohortRequest): Promise<AnalyzeCohortResult>;

  /**
   * Get cohort by identifier.
   *
   * Retrieves cohort details and statistics.
   */
  getCohort(cohortId: CohortId): Promise<Cohort | null>;

  /**
   * Update cohort membership.
   *
   * Refreshes cohort membership for dynamic cohorts based on
   * current student data.
   */
  updateCohortMembership(cohortId: CohortId): Promise<Cohort>;

  /**
   * List all cohorts.
   *
   * Returns all defined cohorts with optional filtering.
   */
  listCohorts(options?: {
    types?: CohortType[];
    activeOnly?: boolean;
    limit?: number;
  }): Promise<Cohort[]>;

  /**
   * Compare multiple cohorts.
   *
   * Performs comparative analysis across multiple cohorts.
   */
  compareCohorts(
    cohortIds: CohortId[],
    dimensions?: string[]
  ): Promise<CohortComparison[]>;

  /**
   * Get cohort insights for a student.
   *
   * Generates personalized insights based on student's cohorts.
   */
  getStudentCohortInsights(
    studentId: StudentId,
    cohortIds: CohortId[]
  ): Promise<CohortInsight[]>;
}
