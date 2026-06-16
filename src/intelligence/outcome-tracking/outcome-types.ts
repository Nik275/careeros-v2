/**
 * CareerOS Outcome Tracking System - Core Types
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Comprehensive type system for tracking student outcomes, comparing predictions
 * to reality, and generating learning signals for continuous improvement.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import type { StudentBeliefV3 } from '../types/index.js';
import type { DimensionScoreMap } from '../../assessment/assessment-types.js';
import type { CareerRecommendation } from '../../recommendation/recommendation-types.js';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

/** Unique identifier for an outcome record */
export type OutcomeRecordId = string & { readonly __brand: 'OutcomeRecordId' };

/** Unique identifier for a student */
export type StudentId = string & { readonly __brand: 'StudentId' };

/** Unique identifier for a recommendation */
export type RecommendationId = string & { readonly __brand: 'RecommendationId' };

/** Unique identifier for a career path */
export type PathId = string & { readonly __brand: 'PathId' };

/** Unique identifier for an outcome event */
export type OutcomeEventId = string & { readonly __brand: 'OutcomeEventId' };

/** Unique identifier for a timeline entry */
export type TimelineEntryId = string & { readonly __brand: 'TimelineEntryId' };

/** Unique identifier for a growth snapshot */
export type GrowthSnapshotId = string & { readonly __brand: 'GrowthSnapshotId' };

/** Unique identifier for a prediction record */
export type PredictionId = string & { readonly __brand: 'PredictionId' };

// ============================================================================
// TIME AND TIMELINE TYPES
// ============================================================================

/** Time points for outcome measurement */
export type OutcomeTimepoint =
  | 'BASELINE'
  | 'IMMEDIATE'
  | '1_WEEK'
  | '1_MONTH'
  | '3_MONTHS'
  | '6_MONTHS'
  | '9_MONTHS'
  | '12_MONTHS'
  | '18_MONTHS'
  | '24_MONTHS'
  | '36_MONTHS'
  | '48_MONTHS'
  | '60_MONTHS';

/** Timeline event types */
export type TimelineEventType =
  | 'RECOMMENDATION_GIVEN'
  | 'DECISION_MADE'
  | 'EXPLORATION_STARTED'
  | 'EXPLORATION_COMPLETED'
  | 'SKILL_ACQUIRED'
  | 'PROJECT_COMPLETED'
  | 'INTERNSHIP_STARTED'
  | 'INTERNSHIP_COMPLETED'
  | 'JOB_STARTED'
  | 'JOB_CHANGED'
  | 'EDUCATION_STARTED'
  | 'EDUCATION_COMPLETED'
  | 'CERTIFICATION_EARNED'
  | 'MENTOR_SESSION'
  | 'PIVOT_CONSIDERED'
  | 'PIVOT_EXECUTED'
  | 'SETBACK_EXPERIENCED'
  | 'RECOVERY_ACHIEVED'
  | 'MILESTONE_REACHED'
  | 'CONFIDENCE_MEASURED'
  | 'CLARITY_MEASURED'
  | 'WELLBEING_MEASURED'
  | 'OUTCOME_RECORDED';

/** Timeline entry */
export interface TimelineEntry {
  id: TimelineEntryId;
  timestamp: number;
  timepoint: OutcomeTimepoint;
  eventType: TimelineEventType;
  title: string;
  description: string;
  data: Record<string, unknown>;
  metadata: {
    source: 'SYSTEM' | 'STUDENT' | 'MENTOR' | 'EXTERNAL';
    confidence: number;
    verified: boolean;
  };
}

// ============================================================================
// OUTCOME CATEGORIES
// ============================================================================

/** Career decision outcome */
export interface CareerDecisionOutcome {
  decisionId: string;
  decisionType: 'CAREER_SELECTION' | 'PATH_CHANGE' | 'SPECIALIZATION' | 'TIMING';
  optionsConsidered: string[];
  optionSelected: string;
  wasRecommended: boolean;
  confidenceAtDecision: number;
  clarityAtDecision: number;
  actualOutcome: {
    success: boolean;
    satisfaction: number;
    wouldChooseAgain: boolean;
    recommendationAccuracy: number;
  };
  timeline: {
    decisionDate: number;
    implementationDate?: number;
    firstOutcomeDate?: number;
    finalAssessmentDate?: number;
  };
}

/** Education outcome */
export interface EducationOutcome {
  educationId: string;
  institutionType: 'IIT' | 'NIT' | 'IIIT' | 'TOP_PRIVATE' | 'TIER_2' | 'TIER_3' | 'INTERNATIONAL' | 'OTHER';
  degreeType: string;
  fieldOfStudy: string;
  expectedDuration: number;
  actualDuration?: number;
  performance: {
    expected: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE';
    actual?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE';
    gpa?: number;
    percentile?: number;
  };
  completionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED_OUT' | 'TRANSFERRED' | 'DEFERRED';
  skillOutcomes: string[];
  networkOutcomes: string[];
  careerOutcomes: string[];
}

/** College outcome */
export interface CollegeOutcome {
  collegeId: string;
  collegeName: string;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'INTERNATIONAL';
  branch: string;
  admissionType: 'JEE' | 'NEET' | 'CUET' | 'STATE_ENTRANCE' | 'DIRECT' | 'OTHER';
  rankAchieved?: number;
  expectedOutcome: {
    placementRate: number;
    averagePackage: number;
    topRecruiters: string[];
  };
  actualOutcome?: {
    placementRate?: number;
    averagePackage?: number;
    companiesVisited?: string[];
    offersReceived?: number;
  };
}

/** Skill outcome */
export interface SkillOutcome {
  skillId: string;
  skillName: string;
  category: 'TECHNICAL' | 'SOFT' | 'DOMAIN' | 'TOOL' | 'LANGUAGE';
  baselineLevel: number;
  targetLevel: number;
  actualLevel?: number;
  learningMethod: 'COURSE' | 'PROJECT' | 'WORK' | 'SELF_STUDY' | 'MENTORSHIP' | 'MIXED';
  timeInvested: number;
  projectsApplied: string[];
  certificationEarned?: string;
  outcomeQuality: 'EXCEEDED' | 'MET' | 'PARTIAL' | 'BELOW';
}

/** Internship outcome */
export interface InternshipOutcome {
  internshipId: string;
  company: string;
  role: string;
  domain: string;
  duration: number;
  wasRecommended: boolean;
  applicationToOfferTimeline: number;
  learningOutcomes: string[];
  skillDevelopment: string[];
  networkExpansion: string[];
  conversionToFullTime: boolean;
  satisfaction: number;
  mentorRating?: number;
  wouldRecommend: boolean;
}

/** Job outcome */
export interface JobOutcome {
  jobId: string;
  company: string;
  role: string;
  domain: string;
  location: string;
  package: {
    ctc: number;
    fixed: number;
    variable: number;
    equity?: number;
  };
  expectedPackage?: number;
  wasRecommended: boolean;
  applicationToOfferTimeline: number;
  retention: {
    joined: boolean;
    currentStatus: 'ACTIVE' | 'RESIGNED' | 'TERMINATED' | 'PROMOTED';
    tenure?: number;
    reasonForLeaving?: string;
  };
  growth: {
    promotions: number;
    salaryGrowth: number;
    roleEvolution: string[];
  };
  satisfaction: {
    overall: number;
    workContent: number;
    growthOpportunities: number;
    workLifeBalance: number;
    compensation: number;
    culture: number;
  };
}

/** Exploration outcome */
export interface ExplorationOutcome {
  explorationId: string;
  explorationType: 'CAREER' | 'INDUSTRY' | 'ROLE' | 'COMPANY' | 'SKILL';
  target: string;
  method: 'RESEARCH' | 'CONVERSATION' | 'SHADOWING' | 'PROJECT' | 'COURSE' | 'INTERNSHIP';
  duration: number;
  depth: 'SURFACE' | 'MODERATE' | 'DEEP';
  insightsGained: string[];
  clarityChange: number;
  confidenceChange: number;
  decisionImpact: 'CONFIRMED' | 'CHANGED' | 'EXPANDED' | 'NARROWED' | 'NO_IMPACT';
  wouldRecommendMethod: boolean;
}

// ============================================================================
// PSYCHOLOGICAL OUTCOME TYPES
// ============================================================================

/** Confidence outcome measurement */
export interface ConfidenceOutcome {
  baseline: number;
  measurements: Array<{
    timestamp: number;
    timepoint: OutcomeTimepoint;
    value: number;
    source: 'SELF_REPORTED' | 'INFERRED' | 'EXTERNAL';
    dimensions: Record<string, number>;
  }>;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'FLUCTUATING';
  growthRate: number;
  keyDrivers: string[];
  inhibitors: string[];
}

/** Clarity outcome measurement */
export interface ClarityOutcome {
  baseline: number;
  measurements: Array<{
    timestamp: number;
    timepoint: OutcomeTimepoint;
    value: number;
    source: 'SELF_REPORTED' | 'INFERRED' | 'EXTERNAL';
    aspects: {
      careerDirection: number;
      nextSteps: number;
      valuesAlignment: number;
      skillsPath: number;
    };
  }>;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'FLUCTUATING';
  growthRate: number;
  decisionClarity: number;
  pathClarity: number;
}

/** Wellbeing outcome measurement */
export interface WellbeingOutcome {
  baseline: number;
  measurements: Array<{
    timestamp: number;
    timepoint: OutcomeTimepoint;
    value: number;
    source: 'SELF_REPORTED' | 'INFERRED' | 'EXTERNAL';
    dimensions: {
      stress: number;
      anxiety: number;
      sleep: number;
      energy: number;
      motivation: number;
      hopefulness: number;
    };
  }>;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'FLUCTUATING';
  stressEvents: Array<{
    timestamp: number;
    type: string;
    severity: number;
    recoveryTime: number;
  }>;
  supportSystemEffectiveness: number;
}

// ============================================================================
// STUDENT GROWTH TYPES
// ============================================================================

/** Student growth dimension */
export type GrowthDimension =
  | 'CONFIDENCE'
  | 'CLARITY'
  | 'DECISION_QUALITY'
  | 'SELF_AWARENESS'
  | 'CAREER_READINESS'
  | 'EMOTIONAL_STABILITY'
  | 'EXPLORATION_BREADTH'
  | 'RESILIENCE'
  | 'MOTIVATION'
  | 'SKILL_DEPTH'
  | 'NETWORK_STRENGTH'
  | 'EXECUTION_CAPABILITY';

/** Growth measurement */
export interface GrowthMeasurement {
  dimension: GrowthDimension;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'FLUCTUATING';
  trajectory: 'ACCELERATING' | 'STEADY' | 'DECELERATING';
  milestones: Array<{
    timestamp: number;
    value: number;
    trigger: string;
  }>;
}

/** Complete student growth profile */
export interface StudentGrowthProfile {
  studentId: StudentId;
  baselineDate: number;
  lastUpdated: number;
  measurements: Map<GrowthDimension, GrowthMeasurement>;
  overallGrowth: number;
  growthVelocity: number;
  strongestDimensions: GrowthDimension[];
  weakestDimensions: GrowthDimension[];
  improvementAreas: string[];
  successFactors: string[];
}

/** Growth snapshot at a point in time */
export interface GrowthSnapshot {
  id: GrowthSnapshotId;
  studentId: StudentId;
  timestamp: number;
  timepoint: OutcomeTimepoint;
  scores: Record<GrowthDimension, number>;
  overallScore: number;
  insights: string[];
  recommendations: string[];
}

// ============================================================================
// PREDICTION VS REALITY TYPES
// ============================================================================

/** Prediction record */
export interface Prediction {
  id: PredictionId;
  timestamp: number;
  predictionType: 'CAREER_SUCCESS' | 'EDUCATION_PERFORMANCE' | 'SKILL_ACQUISITION' | 'SATISFACTION' | 'GROWTH';
  target: string;
  timeframe: OutcomeTimepoint;
  predictedValue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number;
  factors: string[];
  modelVersion: string;
}

/** Prediction vs actual comparison */
export interface PredictionComparison {
  prediction: Prediction;
  actualValue: number;
  absoluteError: number;
  relativeError: number;
  withinConfidenceInterval: boolean;
  accuracy: number;
  bias: 'OPTIMISTIC' | 'PESSIMISTIC' | 'CALIBRATED';
  calibrationScore: number;
}

/** Accuracy metrics */
export interface AccuracyMetrics {
  predictionType: string;
  totalPredictions: number;
  averageAccuracy: number;
  averageError: number;
  calibrationScore: number;
  biasDirection: 'OPTIMISTIC' | 'PESSIMISTIC' | 'NEUTRAL';
  confidenceCalibration: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

/** Recommendation accuracy */
export interface RecommendationAccuracy {
  recommendationId: RecommendationId;
  studentId: StudentId;
  pathId: PathId;
  predictedOutcome: {
    satisfaction: number;
    success: number;
    growth: number;
  };
  actualOutcome?: {
    satisfaction: number;
    success: number;
    growth: number;
  };
  accuracy?: number;
  outcomeGap?: number;
  recommendationQuality: 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'POOR';
}

// ============================================================================
// OUTCOME QUALITY TYPES
// ============================================================================

/** Outcome quality classification */
export type OutcomeQuality =
  | 'EXCEPTIONAL'
  | 'EXCELLENT'
  | 'GOOD'
  | 'SATISFACTORY'
  | 'MIXED'
  | 'BELOW_EXPECTATIONS'
  | 'POOR'
  | 'NEGATIVE';

/** Outcome classification */
export interface OutcomeClassification {
  quality: OutcomeQuality;
  type: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'UNEXPECTED';
  timeframe: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  unexpectedness: number;
  factors: {
    contributing: string[];
    hindering: string[];
    unexpected: string[];
  };
  lessons: string[];
}

/** Outcome quality assessment */
export interface OutcomeQualityAssessment {
  overallQuality: OutcomeQuality;
  careerOutcome: number;
  educationOutcome: number;
  psychologicalOutcome: number;
  growthOutcome: number;
  holisticScore: number;
  sustainabilityScore: number;
  explanation: string;
}

// ============================================================================
// LEARNING SIGNAL TYPES
// ============================================================================

/** Learning signal for engine improvement */
export interface LearningSignal {
  signalId: string;
  timestamp: number;
  source: 'OUTCOME_TRACKING';
  signalType: 'RECOMMENDATION_FEEDBACK' | 'PREDICTION_ERROR' | 'GROWTH_PATTERN' | 'UNEXPECTED_OUTCOME';
  targetEngine: 'RECOMMENDATION' | 'DECISION_INTELLIGENCE' | 'REGRET' | 'CRITICALITY' | 'STABILITY';
  payload: {
    studentId: StudentId;
    recommendationId?: RecommendationId;
    predictionId?: PredictionId;
    outcomeType?: string;
    expectedOutcome: unknown;
    actualOutcome: unknown;
    errorMagnitude: number;
    patternDetected?: string;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  processed: boolean;
  processedAt?: number;
}

/** Weight adjustment signal */
export interface WeightAdjustmentSignal {
  dimension: string;
  currentWeight: number;
  suggestedAdjustment: number;
  reason: string;
  evidence: string[];
  confidence: number;
}

/** Calibration update */
export interface CalibrationUpdate {
  modelType: string;
  parameter: string;
  oldValue: number;
  newValue: number;
  adjustmentReason: string;
  sampleSize: number;
  confidence: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/** Outcome analytics metrics */
export interface OutcomeAnalytics {
  recommendationSuccessRate: number;
  decisionSuccessRate: number;
  growthRate: number;
  confidenceGrowthRate: number;
  clarityGrowthRate: number;
  explorationSuccessRate: number;
  predictionAccuracy: number;
  recommendationAccuracy: number;
  studentSatisfaction: number;
  systemImprovementRate: number;
}

/** Outcome aggregation query */
export interface OutcomeAggregationQuery {
  timeRange?: { start: number; end: number };
  pathIds?: PathId[];
  outcomeTypes?: string[];
  studentSegments?: string[];
  minDataQuality?: number;
  includeInactive?: boolean;
}

/** Outcome aggregation result */
export interface OutcomeAggregation {
  query: OutcomeAggregationQuery;
  totalRecords: number;
  qualityDistribution: Record<OutcomeQuality, number>;
  averageSatisfaction: number;
  averageGrowth: number;
  recommendationAdherence: {
    followed: number;
    diverged: number;
    rate: number;
  };
  accuracyMetrics: AccuracyMetrics[];
  growthByDimension: Record<GrowthDimension, number>;
  trends: {
    satisfaction: 'IMPROVING' | 'STABLE' | 'DECLINING';
    growth: 'IMPROVING' | 'STABLE' | 'DECLINING';
    accuracy: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/** Outcome event types */
export type OutcomeEventType =
  | 'OUTCOME_RECORDED'
  | 'GROWTH_MEASURED'
  | 'PREDICTION_MADE'
  | 'PREDICTION_VALIDATED'
  | 'COMPARISON_GENERATED'
  | 'QUALITY_ASSESSED'
  | 'SIGNAL_GENERATED'
  | 'TIMELINE_UPDATED';

/** Outcome event */
export interface OutcomeEvent {
  id: OutcomeEventId;
  type: OutcomeEventType;
  timestamp: number;
  studentId: StudentId;
  payload: Record<string, unknown>;
  metadata: {
    source: string;
    version: string;
    traceId: string;
  };
}

/** Event handler */
export type OutcomeEventHandler = (event: OutcomeEvent) => void | Promise<void>;

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/** Outcome tracking configuration */
export interface OutcomeTrackingConfig {
  measurementSchedule: OutcomeTimepoint[];
  minDataQuality: number;
  retentionPeriod: number;
  privacy: {
    anonymizeAfter: number;
    deleteAfter: number;
    consentRequired: boolean;
  };
  learning: {
    signalGenerationEnabled: boolean;
    autoCalibrationEnabled: boolean;
    minSampleSize: number;
    confidenceThreshold: number;
  };
  analytics: {
    aggregationEnabled: boolean;
    realtimeEnabled: boolean;
    exportEnabled: boolean;
  };
}

/** Default configuration */
export const DEFAULT_OUTCOME_TRACKING_CONFIG: OutcomeTrackingConfig = {
  measurementSchedule: ['BASELINE', '3_MONTHS', '6_MONTHS', '12_MONTHS', '24_MONTHS'],
  minDataQuality: 70,
  retentionPeriod: 365 * 5,
  privacy: {
    anonymizeAfter: 365 * 2,
    deleteAfter: 365 * 7,
    consentRequired: true,
  },
  learning: {
    signalGenerationEnabled: true,
    autoCalibrationEnabled: true,
    minSampleSize: 50,
    confidenceThreshold: 0.8,
  },
  analytics: {
    aggregationEnabled: true,
    realtimeEnabled: true,
    exportEnabled: true,
  },
};

// ============================================================================
// MAIN OUTCOME RECORD
// ============================================================================

/** Complete outcome record for a student */
export interface StudentOutcomeRecord {
  id: OutcomeRecordId;
  studentId: StudentId;
  createdAt: number;
  updatedAt: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  
  // Baseline data
  baseline: {
    timestamp: number;
    belief: StudentBeliefV3;
    dimensions: DimensionScoreMap;
    recommendations: CareerRecommendation[];
    confidence: number;
    clarity: number;
    wellbeing: number;
  };
  
  // Outcomes by category
  outcomes: {
    careerDecisions: CareerDecisionOutcome[];
    education: EducationOutcome[];
    colleges: CollegeOutcome[];
    skills: SkillOutcome[];
    internships: InternshipOutcome[];
    jobs: JobOutcome[];
    explorations: ExplorationOutcome[];
  };
  
  // Psychological outcomes
  psychological: {
    confidence: ConfidenceOutcome;
    clarity: ClarityOutcome;
    wellbeing: WellbeingOutcome;
  };
  
  // Growth tracking
  growth: {
    profile: StudentGrowthProfile;
    snapshots: GrowthSnapshot[];
  };
  
  // Timeline
  timeline: TimelineEntry[];
  
  // Predictions and comparisons
  predictions: Prediction[];
  comparisons: PredictionComparison[];
  recommendationAccuracy: RecommendationAccuracy[];
  
  // Quality assessments
  qualityAssessments: OutcomeQualityAssessment[];
  
  // Metadata
  metadata: {
    dataQuality: number;
    completeness: number;
    lastMeasurement: number;
    nextScheduledMeasurement?: number;
    version: number;
  };
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

/** Outcome event engine interface */
export interface IOutcomeEventEngine {
  emit(event: OutcomeEvent): void;
  subscribe(eventType: OutcomeEventType, handler: OutcomeEventHandler): void;
  unsubscribe(eventType: OutcomeEventType, handler: OutcomeEventHandler): void;
}

/** Outcome store interface */
export interface IOutcomeStore {
  save(record: StudentOutcomeRecord): Promise<void>;
  load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null>;
  loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null>;
  query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]>;
  delete(recordId: OutcomeRecordId): Promise<void>;
}

/** Outcome tracker interface */
export interface IOutcomeTracker {
  startTracking(studentId: StudentId, baseline: StudentOutcomeRecord['baseline']): Promise<StudentOutcomeRecord>;
  recordOutcome(recordId: OutcomeRecordId, outcome: unknown): Promise<void>;
  measureGrowth(recordId: OutcomeRecordId, snapshot: GrowthSnapshot): Promise<void>;
  addTimelineEntry(recordId: OutcomeRecordId, entry: TimelineEntry): Promise<void>;
  getRecord(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null>;
}

/** Timeline engine interface */
export interface ITimelineEngine {
  buildTimeline(record: StudentOutcomeRecord): TimelineEntry[];
  addEvent(record: StudentOutcomeRecord, event: TimelineEntry): StudentOutcomeRecord;
  getEventsByType(record: StudentOutcomeRecord, eventType: TimelineEventType): TimelineEntry[];
  getEventsByTimeRange(record: StudentOutcomeRecord, start: number, end: number): TimelineEntry[];
}

/** Comparison engine interface */
export interface IComparisonEngine {
  comparePredictionToReality(prediction: Prediction, actual: unknown): PredictionComparison;
  calculateAccuracyMetrics(predictions: Prediction[], actuals: unknown[]): AccuracyMetrics;
  assessRecommendationAccuracy(recommendation: RecommendationAccuracy): RecommendationAccuracy;
}

/** Quality engine interface */
export interface IQualityEngine {
  assessOutcomeQuality(record: StudentOutcomeRecord): OutcomeQualityAssessment;
  classifyOutcome(outcome: unknown): OutcomeClassification;
  calculateHolisticScore(record: StudentOutcomeRecord): number;
}

/** Growth engine interface */
export interface IGrowthEngine {
  calculateGrowth(profile: StudentGrowthProfile, dimension: GrowthDimension): GrowthMeasurement;
  createSnapshot(studentId: StudentId, scores: Record<GrowthDimension, number>): GrowthSnapshot;
  updateProfile(profile: StudentGrowthProfile, snapshot: GrowthSnapshot): StudentGrowthProfile;
  identifyGrowthPatterns(profile: StudentGrowthProfile): string[];
}

/** Learning signal engine interface */
export interface ILearningSignalEngine {
  generateSignal(event: OutcomeEvent): LearningSignal | null;
  processSignal(signal: LearningSignal): Promise<void>;
  getPendingSignals(): LearningSignal[];
  getSignalsByEngine(engine: string): LearningSignal[];
}

/** Analytics engine interface */
export interface IAnalyticsEngine {
  aggregateOutcomes(query: OutcomeAggregationQuery): Promise<OutcomeAggregation>;
  calculateAnalytics(): Promise<OutcomeAnalytics>;
  generateReport(timeRange: { start: number; end: number }): unknown;
}
