/**
 * CareerOS Outcome Tracking Engine V1
 *
 * Tracks the complete lifecycle of a student's decision from assessment through outcome.
 * Privacy-aware, scalable to millions of records, with comprehensive analytics.
 *
 * Features:
 * - Complete decision lifecycle tracking
 * - Multi-timepoint outcome snapshots (3/6/12/24/36 months)
 * - Privacy-preserving data storage
 * - Outcome aggregation and analytics
 * - Feedback loop for system improvement
 *
 * @module intelligence/outcome-tracking-engine
 * @version 1.0.0
 */

import type { StudentBeliefV3 } from '../types/index.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unique identifiers
 */
export type OutcomeRecordId = string;
export type StudentId = string;
export type RecommendationId = string;
export type PathId = string;
export type SnapshotId = string;

/**
 * Timepoints for outcome tracking
 */
export type OutcomeTimepoint =
  | 'BASELINE'      // At decision time
  | '3_MONTHS'
  | '6_MONTHS'
  | '12_MONTHS'
  | '24_MONTHS'
  | '36_MONTHS'
  | '60_MONTHS';

/**
 * Education progress tracking
 */
export interface EducationProgress {
  /** Current education stage */
  stage: 'HIGH_SCHOOL' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORAL' | 'PROFESSIONAL' | 'WORKING';

  /** Institution name (anonymized) */
  institutionType: 'IIT' | 'NIT' | 'IIIT' | 'TOP_PRIVATE' | 'TIER_2' | 'TIER_3' | 'INTERNATIONAL' | 'OTHER' | 'NA';

  /** Field of study */
  fieldOfStudy: string;

  /** Performance level */
  performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE' | 'NA';

  /** Whether on track with original plan */
  onTrack: boolean;

  /** Deviations from plan */
  deviations?: string[];

  /** New skills acquired */
  skillsAcquired: string[];

  /** Certifications earned */
  certifications: string[];
}

/**
 * Skill growth tracking
 */
export interface SkillGrowth {
  /** Technical skills developed */
  technicalSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyGain: number; // 0-100
    source: 'COURSE' | 'PROJECT' | 'WORK' | 'SELF_STUDY' | 'MENTORSHIP';
  }>;

  /** Soft skills developed */
  softSkills: Array<{
    skillId: string;
    skillName: string;
    proficiencyGain: number;
    source: 'COURSE' | 'PROJECT' | 'WORK' | 'SELF_STUDY' | 'MENTORSHIP';
  }>;

  /** Overall skill growth score */
  overallGrowth: number; // 0-100

  /** Skills gaps remaining */
  remainingGaps: string[];
}

/**
 * Income growth tracking
 */
export interface IncomeGrowth {
  /** Current income (normalized bands for privacy) */
  incomeBand: 'BELOW_5L' | '5L_TO_10L' | '10L_TO_20L' | '20L_TO_50L' | 'ABOVE_50L' | 'NA';

  /** Income growth from baseline */
  growthRate: number; // Percentage

  /** Income satisfaction */
  satisfaction: 'VERY_DISSATISFIED' | 'DISSATISFIED' | 'NEUTRAL' | 'SATISFIED' | 'VERY_SATISFIED';

  /** Income vs expectations */
  vsExpectations: 'BELOW' | 'MET' | 'EXCEEDED';

  /** Income trajectory confidence */
  trajectoryConfidence: 'DECLINING' | 'STABLE' | 'GROWING' | 'UNCERTAIN';
}

/**
 * Satisfaction tracking
 */
export interface SatisfactionMetrics {
  /** Overall career satisfaction */
  overall: number; // 0-100

  /** Work content satisfaction */
  workContent: number;

  /** Work environment satisfaction */
  workEnvironment: number;

  /** Growth opportunities satisfaction */
  growthOpportunities: number;

  /** Work-life balance satisfaction */
  workLifeBalance: number;

  /** Meaning/purpose satisfaction */
  meaning: number;

  /** Would choose same path again */
  wouldChooseAgain: boolean;

  /** Recommendation to others */
  wouldRecommend: 'STRONGLY_NO' | 'NO' | 'NEUTRAL' | 'YES' | 'STRONGLY_YES';
}

/**
 * Stress and wellbeing tracking
 */
export interface StressMetrics {
  /** Overall stress level */
  overallStress: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

  /** Work-related stress */
  workStress: number; // 0-100

  /** Financial stress */
  financialStress: number;

  /** Career uncertainty stress */
  uncertaintyStress: number;

  /** Support system adequacy */
  supportSystem: 'INADEQUATE' | 'ADEQUATE' | 'STRONG';

  /** Mental health impact */
  mentalHealthImpact: 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE';
}

/**
 * Regret tracking
 */
export interface RegretMetrics {
  /** Overall regret level */
  overallRegret: 'NONE' | 'MINIMAL' | 'MODERATE' | 'SIGNIFICANT' | 'SEVERE';

  /** Regret about path choice */
  pathChoiceRegret: number; // 0-100

  /** Regret about timing */
  timingRegret: number;

  /** Regret about preparation */
  preparationRegret: number;

  /** Specific regrets */
  specificRegrets: string[];

  /** Alternative paths considered */
  alternativesConsidered: string[];

  /** Would switch if could */
  wouldSwitch: boolean;
}

/**
 * Confidence tracking
 */
export interface ConfidenceMetrics {
  /** Confidence in decision */
  decisionConfidence: number; // 0-100

  /** Confidence in career outlook */
  outlookConfidence: number;

  /** Confidence in skills */
  skillsConfidence: number;

  /** Confidence in financial stability */
  financialConfidence: number;

  /** Trend from previous snapshot */
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

/**
 * Outcome snapshot at a specific timepoint
 */
export interface OutcomeSnapshot {
  /** Snapshot identifier */
  id: SnapshotId;

  /** Timepoint */
  timepoint: OutcomeTimepoint;

  /** When snapshot was recorded */
  recordedAt: number; // timestamp

  /** Days since decision */
  daysSinceDecision: number;

  /** Response source */
  source: 'SELF_REPORTED' | 'SYSTEM_INFERRED' | 'THIRD_PARTY' | 'AUTOMATED';

  /** Education progress */
  education?: EducationProgress;

  /** Skill growth */
  skills?: SkillGrowth;

  /** Income growth */
  income?: IncomeGrowth;

  /** Satisfaction metrics */
  satisfaction?: SatisfactionMetrics;

  /** Stress metrics */
  stress?: StressMetrics;

  /** Regret metrics */
  regret?: RegretMetrics;

  /** Confidence metrics */
  confidence?: ConfidenceMetrics;

  /** Narrative feedback (anonymized) */
  narrativeFeedback?: string;

  /** Snapshot completeness */
  completeness: number; // 0-100

  /** Data quality score */
  dataQuality: number;
}

/**
 * Actions taken by student
 */
export interface ActionTaken {
  /** Action identifier */
  id: string;

  /** Action type */
  type:
    | 'ASSESSMENT_COMPLETED'
    | 'CAREER_EXPLORED'
    | 'PATH_SELECTED'
    | 'EDUCATION_STARTED'
    | 'EDUCATION_COMPLETED'
    | 'SKILL_DEVELOPED'
    | 'INTERNSHIP_COMPLETED'
    | 'JOB_STARTED'
    | 'JOB_CHANGED'
    | 'MENTOR_ENGAGED'
    | 'NETWORK_EXPANDED'
    | 'PIVOT_CONSIDERED'
    | 'PIVOT_EXECUTED';

  /** Description */
  description: string;

  /** When action was taken */
  timestamp: number;

  /** Outcome of action */
  outcome: 'SUCCESSFUL' | 'PARTIAL' | 'UNSUCCESSFUL' | 'PENDING';

  /** Impact on career trajectory */
  impact: 'MAJOR' | 'MODERATE' | 'MINOR' | 'NEUTRAL';
}

/**
 * Complete outcome record
 */
export interface OutcomeRecord {
  /** Record identifier */
  id: OutcomeRecordId;

  /** Student identifier (hashed for privacy) */
  studentIdHash: string;

  /** Recommendation that was made */
  recommendationId: RecommendationId;

  /** Path that was recommended */
  recommendedPathId: PathId;

  /** Path that was chosen (may differ from recommendation) */
  chosenPathId: PathId;

  /** Whether student followed recommendation */
  followedRecommendation: boolean;

  /** When decision was made */
  decisionTimestamp: number;

  /** Initial student belief state */
  baselineBelief: StudentBeliefV3;

  /** Actions taken throughout journey */
  actionsTaken: ActionTaken[];

  /** Outcome snapshots over time */
  snapshots: OutcomeSnapshot[];

  /** Current status */
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED_OUT' | 'LOST_TO_FOLLOWUP';

  /** Final outcome (if completed) */
  finalOutcome?: {
    success: boolean;
    satisfaction: number;
    wouldRecommend: boolean;
    keyLearnings: string[];
  };

  /** Privacy and retention */
  privacy: {
    /** Data retention expiration */
    retentionExpiry: number;

    /** Anonymization level */
    anonymizationLevel: 'NONE' | 'PARTIAL' | 'FULL';

    /** Consent status */
    consentStatus: 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';

    /** Last consent update */
    consentUpdatedAt: number;
  };

  /** Metadata */
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
    dataQuality: number;
  };
}

/**
 * Outcome query filters
 */
export interface OutcomeQuery {
  /** Time range */
  decisionDateRange?: { start: number; end: number };

  /** Career paths */
  pathIds?: PathId[];

  /** Timepoints with data */
  hasSnapshotAt?: OutcomeTimepoint[];

  /** Minimum data quality */
  minDataQuality?: number;

  /** Followed recommendation */
  followedRecommendation?: boolean;

  /** Current status */
  status?: OutcomeRecord['status'];

  /** Minimum satisfaction */
  minSatisfaction?: number;

  /** Has regret data */
  hasRegretData?: boolean;
}

/**
 * Aggregated outcome metrics
 */
export interface OutcomeAggregation {
  /** Query that produced this aggregation */
  query: OutcomeQuery;

  /** Total records matching query */
  totalRecords: number;

  /** Records with complete data */
  completeRecords: number;

  /** Timepoint coverage */
  timepointCoverage: Record<OutcomeTimepoint, number>;

  /** Path distribution */
  pathDistribution: Record<PathId, number>;

  /** Recommendation adherence */
  recommendationAdherence: {
    followed: number;
    diverged: number;
    adherenceRate: number;
  };

  /** Satisfaction metrics */
  satisfaction: {
    average: number;
    median: number;
    distribution: Record<number, number>; // score -> count
    byPath: Record<PathId, number>;
  };

  /** Regret metrics */
  regret: {
    noRegretRate: number;
    averageRegretLevel: number;
    wouldSwitchRate: number;
  };

  /** Income outcomes */
  income: {
    averageGrowthRate: number;
    vsExpectations: { below: number; met: number; exceeded: number };
    byPath: Record<PathId, { band: IncomeGrowth['incomeBand']; count: number }[]>;
  };

  /** Education outcomes */
  education: {
    onTrackRate: number;
    averageSkillsAcquired: number;
    performanceDistribution: Record<EducationProgress['performance'], number>;
  };

  /** Confidence trends */
  confidence: {
    initialAverage: number;
    currentAverage: number;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };

  /** Predictive accuracy */
  predictiveAccuracy?: {
    predictedSatisfaction: number;
    actualSatisfaction: number;
    accuracy: number;
    bias: 'OPTIMISTIC' | 'PESSIMISTIC' | 'CALIBRATED';
  };
}

/**
 * Outcome repository interface
 */
export interface OutcomeRepository {
  /** Store outcome record */
  store(record: OutcomeRecord): Promise<void>;

  /** Retrieve outcome record */
  retrieve(id: OutcomeRecordId): Promise<OutcomeRecord | null>;

  /** Query outcome records */
  query(filters: OutcomeQuery): Promise<OutcomeRecord[]>;

  /** Update outcome record */
  update(id: OutcomeRecordId, updates: Partial<OutcomeRecord>): Promise<void>;

  /** Add snapshot to record */
  addSnapshot(recordId: OutcomeRecordId, snapshot: OutcomeSnapshot): Promise<void>;

  /** Aggregate outcomes */
  aggregate(query: OutcomeQuery): Promise<OutcomeAggregation>;

  /** Delete record (privacy compliance) */
  delete(id: OutcomeRecordId): Promise<void>;

  /** Anonymize record */
  anonymize(id: OutcomeRecordId, level: OutcomeRecord['privacy']['anonymizationLevel']): Promise<void>;
}

/**
 * Outcome tracking configuration
 */
export interface OutcomeTrackingConfig {
  /** Default retention period (days) */
  defaultRetentionDays: number;

  /** Snapshot schedule (days from decision) */
  snapshotSchedule: number[];

  /** Minimum data quality threshold */
  minDataQualityThreshold: number;

  /** Anonymization schedule */
  anonymizationSchedule: {
    partialAfterDays: number;
    fullAfterDays: number;
  };

  /** Privacy settings */
  privacy: {
    hashStudentIds: boolean;
    anonymizeNarratives: boolean;
    allowDataExport: boolean;
    allowDataDeletion: boolean;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_OUTCOME_TRACKING_CONFIG: OutcomeTrackingConfig = {
  defaultRetentionDays: 365 * 5, // 5 years
  snapshotSchedule: [0, 90, 180, 365, 730, 1095], // 0, 3, 6, 12, 24, 36 months
  minDataQualityThreshold: 60,
  anonymizationSchedule: {
    partialAfterDays: 365 * 2,    // 2 years
    fullAfterDays: 365 * 5,       // 5 years
  },
  privacy: {
    hashStudentIds: true,
    anonymizeNarratives: true,
    allowDataExport: true,
    allowDataDeletion: true,
  },
};

// ============================================================================
// OUTCOME RECORD FACTORY
// ============================================================================

/**
 * Create new outcome record
 */
export function createOutcomeRecord(
  studentId: string,
  recommendationId: string,
  recommendedPathId: string,
  chosenPathId: string,
  baselineBelief: StudentBeliefV3,
  config: OutcomeTrackingConfig = DEFAULT_OUTCOME_TRACKING_CONFIG
): OutcomeRecord {
  const now = Date.now();
  const studentIdHash = config.privacy.hashStudentIds
    ? hashStudentId(studentId)
    : studentId;

  return {
    id: generateOutcomeRecordId(),
    studentIdHash,
    recommendationId,
    recommendedPathId,
    chosenPathId,
    followedRecommendation: recommendedPathId === chosenPathId,
    decisionTimestamp: now,
    baselineBelief,
    actionsTaken: [],
    snapshots: [],
    status: 'ACTIVE',
    privacy: {
      retentionExpiry: now + config.defaultRetentionDays * 24 * 60 * 60 * 1000,
      anonymizationLevel: 'NONE',
      consentStatus: 'GRANTED',
      consentUpdatedAt: now,
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
      dataQuality: 0,
    },
  };
}

function generateOutcomeRecordId(): OutcomeRecordId {
  return `outcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function hashStudentId(studentId: string): string {
  // Simple hash for demonstration - use proper crypto in production
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    const char = studentId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash-${Math.abs(hash).toString(16)}`;
}

// ============================================================================
// SNAPSHOT FACTORY
// ============================================================================

/**
 * Create outcome snapshot
 */
export function createOutcomeSnapshot(
  timepoint: OutcomeTimepoint,
  daysSinceDecision: number,
  data: Partial<Omit<OutcomeSnapshot, 'id' | 'timepoint' | 'daysSinceDecision' | 'recordedAt' | 'completeness' | 'dataQuality'>>
): OutcomeSnapshot {
  const snapshot: OutcomeSnapshot = {
    id: generateSnapshotId(),
    timepoint,
    recordedAt: Date.now(),
    daysSinceDecision,
    source: data.source || 'SELF_REPORTED',
    completeness: 0,
    dataQuality: 0,
    ...data,
  };

  // Calculate completeness
  snapshot.completeness = calculateCompleteness(snapshot);
  snapshot.dataQuality = calculateDataQuality(snapshot);

  return snapshot;
}

function generateSnapshotId(): SnapshotId {
  return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateCompleteness(snapshot: OutcomeSnapshot): number {
  const components = [
    snapshot.education !== undefined,
    snapshot.skills !== undefined,
    snapshot.income !== undefined,
    snapshot.satisfaction !== undefined,
    snapshot.stress !== undefined,
    snapshot.regret !== undefined,
    snapshot.confidence !== undefined,
  ];

  const presentCount = components.filter(Boolean).length;
  return Math.round((presentCount / components.length) * 100);
}

function calculateDataQuality(snapshot: OutcomeSnapshot): number {
  // Base quality from completeness
  let quality = snapshot.completeness;

  // Adjust for source reliability
  const sourceMultiplier: Record<OutcomeSnapshot['source'], number> = {
    SELF_REPORTED: 0.9,
    SYSTEM_INFERRED: 0.7,
    THIRD_PARTY: 0.95,
    AUTOMATED: 0.85,
  };

  quality *= sourceMultiplier[snapshot.source];

  // Penalize for very short narratives (if present)
  if (snapshot.narrativeFeedback && snapshot.narrativeFeedback.length < 20) {
    quality *= 0.9;
  }

  return Math.round(quality);
}

// ============================================================================
// ACTION TRACKING
// ============================================================================

/**
 * Record action taken
 */
export function recordAction(
  record: OutcomeRecord,
  type: ActionTaken['type'],
  description: string,
  outcome: ActionTaken['outcome'],
  impact: ActionTaken['impact']
): OutcomeRecord {
  const action: ActionTaken = {
    id: generateActionId(),
    type,
    description,
    timestamp: Date.now(),
    outcome,
    impact,
  };

  return {
    ...record,
    actionsTaken: [...record.actionsTaken, action],
    metadata: {
      ...record.metadata,
      updatedAt: Date.now(),
      version: record.metadata.version + 1,
    },
  };
}

function generateActionId(): string {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// AGGREGATION ENGINE
// ============================================================================

/**
 * Aggregate outcomes from records
 */
export function aggregateOutcomes(
  records: OutcomeRecord[],
  query: OutcomeQuery
): OutcomeAggregation {
  const totalRecords = records.length;
  const completeRecords = records.filter(r =>
    r.snapshots.some(s => s.completeness >= 80)
  ).length;

  // Timepoint coverage
  const timepointCoverage: Record<OutcomeTimepoint, number> = {
    BASELINE: 0,
    '3_MONTHS': 0,
    '6_MONTHS': 0,
    '12_MONTHS': 0,
    '24_MONTHS': 0,
    '36_MONTHS': 0,
    '60_MONTHS': 0,
  };

  for (const record of records) {
    for (const snapshot of record.snapshots) {
      timepointCoverage[snapshot.timepoint]++;
    }
  }

  // Path distribution
  const pathDistribution: Record<PathId, number> = {};
  for (const record of records) {
    pathDistribution[record.chosenPathId] = (pathDistribution[record.chosenPathId] || 0) + 1;
  }

  // Recommendation adherence
  const followedCount = records.filter(r => r.followedRecommendation).length;
  const adherenceRate = totalRecords > 0 ? followedCount / totalRecords : 0;

  // Satisfaction metrics
  const satisfactionScores = records
    .map(r => r.snapshots[r.snapshots.length - 1]?.satisfaction?.overall)
    .filter((s): s is number => s !== undefined);

  const avgSatisfaction = satisfactionScores.length > 0
    ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
    : 0;

  const satisfactionByPath: Record<PathId, number[]> = {};
  for (const record of records) {
    const lastSnapshot = record.snapshots[record.snapshots.length - 1];
    if (lastSnapshot?.satisfaction?.overall) {
      const pathId = record.chosenPathId;
      if (!satisfactionByPath[pathId]) {
        satisfactionByPath[pathId] = [];
      }
      satisfactionByPath[pathId].push(lastSnapshot.satisfaction.overall);
    }
  }

  const avgSatisfactionByPath: Record<PathId, number> = {};
  for (const pathId of Object.keys(satisfactionByPath)) {
    const scores = satisfactionByPath[pathId];
    avgSatisfactionByPath[pathId] = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  }

  // Use avgSatisfactionByPath instead of satisfactionByPath in the aggregation result

  // Regret metrics
  const regretRecords = records.filter(r =>
    r.snapshots.some(s => s.regret !== undefined)
  );

  const noRegretCount = regretRecords.filter(r =>
    r.snapshots.some(s => s.regret?.overallRegret === 'NONE' || s.regret?.overallRegret === 'MINIMAL')
  ).length;

  const wouldSwitchCount = regretRecords.filter(r =>
    r.snapshots.some(s => s.regret?.wouldSwitch)
  ).length;

  // Income outcomes
  const incomeRecords = records.filter(r =>
    r.snapshots.some(s => s.income !== undefined)
  );

  const vsExpectations = { below: 0, met: 0, exceeded: 0 };
  for (const record of incomeRecords) {
    const income = record.snapshots.find(s => s.income)?.income;
    if (income) {
      vsExpectations[income.vsExpectations.toLowerCase() as keyof typeof vsExpectations]++;
    }
  }

  // Confidence trends
  const initialConfidenceScores = records
    .map(r => r.snapshots.find(s => s.timepoint === 'BASELINE')?.confidence?.decisionConfidence)
    .filter((c): c is number => c !== undefined);

  const currentConfidenceScores = records
    .map(r => r.snapshots[r.snapshots.length - 1]?.confidence?.decisionConfidence)
    .filter((c): c is number => c !== undefined);

  const initialAvg = initialConfidenceScores.length > 0
    ? initialConfidenceScores.reduce((a, b) => a + b, 0) / initialConfidenceScores.length
    : 0;

  const currentAvg = currentConfidenceScores.length > 0
    ? currentConfidenceScores.reduce((a, b) => a + b, 0) / currentConfidenceScores.length
    : 0;

  let trend: OutcomeAggregation['confidence']['trend'] = 'STABLE';
  if (currentAvg > initialAvg + 5) trend = 'IMPROVING';
  else if (currentAvg < initialAvg - 5) trend = 'DECLINING';

  return {
    query,
    totalRecords,
    completeRecords,
    timepointCoverage,
    pathDistribution,
    recommendationAdherence: {
      followed: followedCount,
      diverged: totalRecords - followedCount,
      adherenceRate,
    },
    satisfaction: {
      average: Math.round(avgSatisfaction),
      median: calculateMedian(satisfactionScores),
      distribution: {}, // Would need histogram calculation
      byPath: avgSatisfactionByPath,
    },
    regret: {
      noRegretRate: regretRecords.length > 0 ? noRegretCount / regretRecords.length : 0,
      averageRegretLevel: 0, // Would need numeric conversion
      wouldSwitchRate: regretRecords.length > 0 ? wouldSwitchCount / regretRecords.length : 0,
    },
    income: {
      averageGrowthRate: 0, // Would need calculation
      vsExpectations,
      byPath: {},
    },
    education: {
      onTrackRate: 0, // Would need calculation
      averageSkillsAcquired: 0,
      performanceDistribution: { EXCELLENT: 0, GOOD: 0, AVERAGE: 0, BELOW_AVERAGE: 0, NA: 0 },
    },
    confidence: {
      initialAverage: Math.round(initialAvg),
      currentAverage: Math.round(currentAvg),
      trend,
    },
  };
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ============================================================================
// OUTCOME TRACKING ENGINE CLASS
// ============================================================================

export class OutcomeTrackingEngineV1 {
  private config: OutcomeTrackingConfig;
  private repository?: OutcomeRepository;

  constructor(
    config?: Partial<OutcomeTrackingConfig>,
    repository?: OutcomeRepository
  ) {
    this.config = { ...DEFAULT_OUTCOME_TRACKING_CONFIG, ...config };
    this.repository = repository;
  }

  /**
   * Create new outcome record
   */
  createRecord(
    studentId: string,
    recommendationId: string,
    recommendedPathId: string,
    chosenPathId: string,
    baselineBelief: StudentBeliefV3
  ): OutcomeRecord {
    return createOutcomeRecord(
      studentId,
      recommendationId,
      recommendedPathId,
      chosenPathId,
      baselineBelief,
      this.config
    );
  }

  /**
   * Add snapshot to record
   */
  addSnapshot(
    record: OutcomeRecord,
    timepoint: OutcomeTimepoint,
    daysSinceDecision: number,
    data: Partial<Omit<OutcomeSnapshot, 'id' | 'timepoint' | 'daysSinceDecision' | 'recordedAt' | 'completeness' | 'dataQuality'>>
  ): OutcomeRecord {
    const snapshot = createOutcomeSnapshot(timepoint, daysSinceDecision, data);

    return {
      ...record,
      snapshots: [...record.snapshots, snapshot],
      metadata: {
        ...record.metadata,
        updatedAt: Date.now(),
        version: record.metadata.version + 1,
        dataQuality: Math.max(record.metadata.dataQuality, snapshot.dataQuality),
      },
    };
  }

  /**
   * Record action taken
   */
  recordAction(
    record: OutcomeRecord,
    type: ActionTaken['type'],
    description: string,
    outcome: ActionTaken['outcome'],
    impact: ActionTaken['impact']
  ): OutcomeRecord {
    return recordAction(record, type, description, outcome, impact);
  }

  /**
   * Get next scheduled snapshot timepoint
   */
  getNextSnapshotTimepoint(record: OutcomeRecord): OutcomeTimepoint | null {
    const timepoints: OutcomeTimepoint[] = [
      'BASELINE',
      '3_MONTHS',
      '6_MONTHS',
      '12_MONTHS',
      '24_MONTHS',
      '36_MONTHS',
      '60_MONTHS',
    ];

    const existingTimepoints = new Set(record.snapshots.map(s => s.timepoint));

    for (const timepoint of timepoints) {
      if (!existingTimepoints.has(timepoint)) {
        return timepoint;
      }
    }

    return null;
  }

  /**
   * Check if snapshot is due
   */
  isSnapshotDue(record: OutcomeRecord): boolean {
    const nextTimepoint = this.getNextSnapshotTimepoint(record);
    if (!nextTimepoint) return false;

    const daysSinceDecision = Math.floor(
      (Date.now() - record.decisionTimestamp) / (1000 * 60 * 60 * 24)
    );

    const timepointDays: Record<OutcomeTimepoint, number> = {
      BASELINE: 0,
      '3_MONTHS': 90,
      '6_MONTHS': 180,
      '12_MONTHS': 365,
      '24_MONTHS': 730,
      '36_MONTHS': 1095,
      '60_MONTHS': 1825,
    };

    return daysSinceDecision >= timepointDays[nextTimepoint];
  }

  /**
   * Aggregate outcomes
   */
  aggregate(records: OutcomeRecord[], query: OutcomeQuery): OutcomeAggregation {
    return aggregateOutcomes(records, query);
  }

  /**
   * Calculate predictive accuracy
   */
  calculatePredictiveAccuracy(
    records: OutcomeRecord[],
    predictedSatisfactionField: string
  ): OutcomeAggregation['predictiveAccuracy'] {
    // This would compare predicted vs actual satisfaction
    // Implementation depends on how predictions are stored
    return undefined;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OutcomeTrackingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): OutcomeTrackingConfig {
    return { ...this.config };
  }

  /**
   * Set repository
   */
  setRepository(repository: OutcomeRepository): void {
    this.repository = repository;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createOutcomeTrackingEngine(
  config?: Partial<OutcomeTrackingConfig>,
  repository?: OutcomeRepository
): OutcomeTrackingEngineV1 {
  return new OutcomeTrackingEngineV1(config, repository);
}


