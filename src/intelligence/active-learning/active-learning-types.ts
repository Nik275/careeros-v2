/**
 * CareerOS Active Learning Engine - Type Definitions
 *
 * Compatibility contract for the active-learning engines. These types describe
 * the runtime shapes already produced and consumed by the active-learning
 * implementation; they do not introduce new routing or behavior.
 */

import type { StudentId, RecommendationId } from '../outcome-tracking/outcome-types.js';

export type { StudentId, RecommendationId };
export type CareerId = string & { readonly __brand: 'CareerId' };

export type LearningQueryId = string & { readonly __brand: 'LearningQueryId' };
export type UncertaintyProfileId = string & { readonly __brand: 'UncertaintyProfileId' };
export type LearningValueId = string & { readonly __brand: 'LearningValueId' };
export type DecisionBoundaryId = string & { readonly __brand: 'DecisionBoundaryId' };
export type EvidenceGapId = string & { readonly __brand: 'EvidenceGapId' };

export interface StudentProfile {
  id: string;
  studentId?: string;
  skills?: string[];
  interests?: string[];
  values?: string[];
  traits?: string[];
  workPreferences?: string[];
  careerPathways?: string[];
  careerExpectations?: Record<string, unknown>;
  education?: unknown;
  experience?: Array<{
    sector?: string;
    [key: string]: unknown;
  }>;
  demographics?: Record<string, unknown>;
  challenges?: unknown[];
  constraints?: unknown[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Recommendation {
  id?: string;
  recommendationId?: string;
  careerId?: string;
  score?: number;
  confidence?: number;
  rank?: number;
  explanation?: {
    factors?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OutcomeMetrics {
  outcome: string;
  timestamp: Date;
  success: boolean;
  score?: number;
}

export enum UncertaintyLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical',
}

export type UncertaintyDimension =
  | 'model'
  | 'decision'
  | 'outcome'
  | 'recommendation'
  | 'career'
  | 'education'
  | 'skills'
  | 'geography'
  | 'timing';

export interface UncertaintyScore {
  value: number;
  level: UncertaintyLevel;
  confidence: number;
  factors?: string[];
}

export interface ModelUncertainty {
  predictionVariance: UncertaintyScore;
  totalUncertainty: UncertaintyScore;
  epistemicUncertainty: UncertaintyScore;
  aleatoricUncertainty: UncertaintyScore;
  confidence?: number;
  factors?: string[];
}

export interface DecisionUncertainty {
  optionAmbiguity: UncertaintyScore;
  outcomeUncertainty: UncertaintyScore;
  preferenceUncertainty: UncertaintyScore;
  temporalUncertainty: UncertaintyScore;
  preferenceInstability?: UncertaintyScore;
  tradeoffClarity?: UncertaintyScore;
  confidence?: number;
  factors?: string[];
}

export interface OutcomeUncertainty {
  probabilityUncertainty: UncertaintyScore;
  timingUncertainty: UncertaintyScore;
  magnitudeUncertainty: UncertaintyScore;
  causalUncertainty: UncertaintyScore;
  timelineUncertainty?: UncertaintyScore;
  varianceEstimate?: UncertaintyScore;
  confidence?: number;
  factors?: string[];
}

export interface RecommendationUncertainty {
  rankUncertainty: UncertaintyScore;
  scoreUncertainty: UncertaintyScore;
  stabilityUncertainty: UncertaintyScore;
  explanationUncertainty: UncertaintyScore;
  rankingInstability?: UncertaintyScore;
  evidenceStrength?: UncertaintyScore;
  confidence?: number;
  factors?: string[];
}

export interface UncertaintyProfile {
  profileId?: UncertaintyProfileId;
  studentId: string;
  timestamp: Date;
  modelUncertainty: ModelUncertainty;
  decisionUncertainty: DecisionUncertainty;
  outcomeUncertainty: OutcomeUncertainty;
  recommendationUncertainty: RecommendationUncertainty;
  compositeUncertainty: UncertaintyScore;
  dominantUncertaintySource?: string;
  uncertaintyTrend?: 'increasing' | 'decreasing' | 'stable';
  dimensions?: Partial<Record<UncertaintyDimension, UncertaintyScore>>;
  trend?: UncertaintyScore[];
}

export enum LearningValueTier {
  TRIVIAL = 'trivial',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  EXCEPTIONAL = 'exceptional',
  CRITICAL = 'critical',
}

export enum LearningActionType {
  DEEP_INTERVIEW = 'deep_interview',
  A_B_TEST = 'a_b_test',
  SKILL_ASSESSMENT = 'skill_assessment',
  EXPERT_REVIEW = 'expert_review',
  CAREER_EXPLORATION = 'career_exploration',
  OUTCOME_TRACKING = 'outcome_tracking',
}

export interface LearningValueComponent {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

export type LearningValueFactor = LearningValueComponent;

export interface LearningValueComponents {
  uncertainty?: LearningValueComponent | number;
  volatility?: LearningValueComponent | number;
  rarity?: LearningValueComponent | number;
  contradiction?: LearningValueComponent | number;
  novelty?: LearningValueComponent | number;
  diversity?: LearningValueComponent | number;
  uncertaintyComponent?: LearningValueComponent | number;
  volatilityComponent?: LearningValueComponent | number;
  rarityComponent?: LearningValueComponent | number;
  contradictionComponent?: LearningValueComponent | number;
  noveltyComponent?: LearningValueComponent | number;
  diversityComponent?: LearningValueComponent | number;
}

export interface LearningAction {
  type: LearningActionType;
  description: string;
  expectedGain?: number;
  expectedValue: number;
  cost: number;
  effort?: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: PriorityLevel | number;
}

export interface LearningValueScore {
  scoreId?: LearningValueId;
  studentId: string;
  timestamp?: Date;
  totalScore: number;
  tier: LearningValueTier;
  components: LearningValueComponents | LearningValueComponent[];
  componentScores?: LearningValueComponents;
  expectedLearningGain?: number;
  expectedInformationGain?: number;
  estimatedInformationGain: number;
  estimatedModelImprovement: number;
  priority?: PriorityLevel;
  priorityRank?: number;
  recommendedActions: Array<LearningAction | string>;
  confidence: number;
  globalRank?: number;
  percentile?: number;
}

export type CareerCategory =
  | 'design'
  | 'engineering'
  | 'medicine'
  | 'biotech'
  | 'government'
  | 'startup'
  | 'research'
  | 'industry'
  | string;

export interface BoundaryCharacteristics {
  overlapScore: number;
  distinctionClarity: number;
  transitionDifficulty: number;
  commonConfusionPatterns: string[];
}

export interface BoundaryHistoricalData {
  totalStudentsAtBoundary: number;
  misclassificationRate: number;
  satisfactionDifferential: number;
  outcomeVariance: number;
}

export interface BoundaryApproachStrategy {
  strategyType: 'clarification' | 'exploration' | 'experimentation' | 'mentorship' | string;
  steps: string[];
  expectedResolution: number;
  timeline: string;
}

export interface DecisionBoundary {
  id: DecisionBoundaryId | string;
  type?: BoundaryType;
  name: string;
  description: string;
  categoryA: BoundaryCategory;
  categoryB: BoundaryCategory;
  sideA?: BoundarySide;
  sideB?: BoundarySide;
  boundaryCharacteristics: BoundaryCharacteristics;
  historicalData: BoundaryHistoricalData;
  importance?: number;
  studentCount?: number;
  learningMultiplier?: number;
}

export interface BoundaryCategory {
  id: CareerCategory;
  name: string;
  traits: string[];
  skills: string[];
  values: string[];
  workStyles: string[];
}

export interface BoundarySide {
  name: string;
  characteristics: string[];
  examples: string[];
}

export type BoundaryType =
  | 'CAREER_DOMAIN'
  | 'EDUCATION_PATH'
  | 'WORK_ENVIRONMENT'
  | 'RISK_TOLERANCE'
  | 'GEOGRAPHY'
  | 'INDUSTRY'
  | 'ROLE_TYPE'
  | 'COMPANY_STAGE'
  | 'SPECIALIZATION'
  | string;

export interface BoundaryProximity {
  boundaryId: DecisionBoundaryId | string;
  boundaryName?: string;
  studentId: string;
  proximityScore: number;
  learningValue?: number;
  distance?: number;
  distanceToCategoryA?: number;
  distanceToCategoryB?: number;
  ambiguityFactors?: string[];
  recommendedClarification?: string | string[];
  proximity?: 'distant' | 'approaching' | 'near' | 'at_boundary' | 'crossing';
  leaning?: 'side_a' | 'side_b' | 'neutral';
  leaningConfidence?: number;
  factorsA?: string[];
  factorsB?: string[];
}

export interface BoundaryStudent {
  studentId: string;
  profile: StudentProfile;
  boundaries: BoundaryProximity[];
  primaryBoundary: DecisionBoundary;
  learningValue: LearningValueScore;
  recommendedApproach: BoundaryApproachStrategy;
}

export interface DecisionBoundaryZone {
  zoneId: string;
  boundaries: string[];
  students: string[];
  learningIntensity: number;
}

export interface DecisionBoundaryProfile {
  studentId: string;
  timestamp: Date;
  boundaries: BoundaryProximity[];
  primaryBoundary?: BoundaryProximity;
  nearBoundaryCount: number;
  boundaryScore: number;
  atDecisionPoint: boolean;
}

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DEFERRED';
export type OutcomeUrgency =
  | 'IMMEDIATE'
  | 'SOON'
  | 'NORMAL'
  | 'LOW'
  | 'SHORT_TERM'
  | 'MEDIUM_TERM'
  | 'LONG_TERM'
  | 'FUTURE';

export type OutcomeCategory =
  | 'career_transition'
  | 'salary_progression'
  | 'skill_acquisition'
  | 'network_growth'
  | 'job_satisfaction'
  | 'work_life_balance'
  | 'entrepreneurial_success'
  | 'further_education'
  | 'geographic_mobility'
  | 'industry_impact';

export interface PriorityAdjustment {
  timestamp?: number;
  studentId?: StudentId;
  oldPriority?: PriorityLevel;
  previousPriority?: PriorityLevel;
  newPriority: PriorityLevel;
  reason: string;
  confidence?: number;
}

export interface OutcomePriority {
  priorityId: string;
  studentId: StudentId;
  recommendationId?: RecommendationId;
  careerId?: CareerId;
  category?: OutcomeCategory;
  level: PriorityLevel;
  priority?: PriorityLevel;
  score?: number;
  urgency?: OutcomeUrgency;
  reasons: string[];
  rationale?: string;
  evidenceStrength?: number;
  sampleSize?: number;
  outcomeUncertainty?: number;
  businessImpact?: number;
  trackingFrequency: number;
  trackingIntensity?: 'continuous' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextScheduled?: number;
  lastTracked?: number;
  autoFollowUp?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface OutcomePriorityProfile {
  studentId: string;
  timestamp: Date;
  priorities: OutcomePriority[];
  overallPriority: PriorityLevel;
  criticalCategories: OutcomeCategory[];
  highCategories: OutcomeCategory[];
  recommendedCheckInDays: number;
}

export type EvidenceGapType =
  | 'RARE_CAREER'
  | 'EMERGING_CAREER'
  | 'CREATOR_ECONOMY'
  | 'AI_CAREER'
  | 'NEW_INDUSTRY'
  | 'GEOGRAPHIC_REGION'
  | 'DEMOGRAPHIC_SEGMENT'
  | 'EDUCATION_PATHWAY'
  | 'TRANSITION_TYPE'
  | 'DECISION_PATTERN';

export interface EvidenceGap {
  gapId: EvidenceGapId;
  id?: string;
  type: EvidenceGapType;
  name: string;
  description: string;
  targetSamples: number;
  currentSamples: number;
  coverage: number;
  priority: PriorityLevel;
  relatedCareers: CareerId[] | string[];
  relatedBoundaries: DecisionBoundaryId[] | string[];
  learningStrategy: string;
}

export interface EvidenceGapProfile {
  studentId: string;
  timestamp: Date;
  relevantGaps: EvidenceGap[];
  fillableGaps: EvidenceGap[];
  contributionScore: number;
}

export interface EvidenceGapAnalysis {
  analysisId?: string;
  timestamp?: number;
  totalGaps?: number;
  gaps?: EvidenceGap[];
  criticalGaps: EvidenceGapId[];
  gapProgress: Array<{
    gapId: EvidenceGapId;
    name?: string;
    coverage?: number;
    samplesNeeded?: number;
    previousCoverage?: number;
    currentCoverage?: number;
  }>;
  recommendations?: string[];
  recommendedFocus?: EvidenceGapId[];
  estimatedImpact?: number;
}

export type QueryType =
  | 'UNCERTAINTY_PROBE'
  | 'OUTCOME_FOLLOWUP'
  | 'DECISION_EXPLORATION'
  | 'CONTRADICTION_INVESTIGATION'
  | 'BOUNDARY_CLARIFICATION'
  | 'NOVELTY_DISCOVERY'
  | 'VALIDATION_REQUEST';

export type QueryStatus = 'PENDING' | 'SENT' | 'RESPONDED' | 'EXPIRED' | 'CANCELLED';

export interface LearningQuery {
  queryId: LearningQueryId;
  studentId: StudentId;
  type: QueryType;
  status: QueryStatus;
  priority: PriorityLevel;
  createdAt: number;
  expiresAt: number;
  sentAt?: number;
  question: string;
  context: {
    reason: string;
    expectedValue: number;
  };
  response?: {
    receivedAt: number;
    data: unknown;
    quality: number;
  };
}

export interface LearningRecommendation {
  type: string;
  target: string;
  expectedImpact: number;
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ActiveLearningReport {
  reportId: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
  highValueStudents: Array<{
    studentId: string;
    learningValue: number;
    primaryReason: string;
    recommendedAction: string;
  }>;
  activeBoundaries: Array<{
    boundaryId: string;
    studentCount: number;
    learningIntensity: number;
  }>;
  priorityDistribution: Record<PriorityLevel, number>;
  urgentFollowUps: OutcomePriority[];
  criticalGaps: number;
  gapProgress: EvidenceGapAnalysis['gapProgress'];
  queryStats: {
    total: number;
    responded: number;
    responseRate: number;
    averageResponseQuality: number;
  };
  recommendations: LearningRecommendation[];
}

export interface ActiveLearningMetrics {
  totalStudentsAnalyzed?: number;
  highValueStudents?: number;
  activeQueries?: number;
  responseRate?: number;
  averageLearningGain?: number;
  evidenceGapCoverage?: Record<EvidenceGapType, number>;
  totalStudents?: number;
  totalStudentsProcessed: number;
  averageLearningValue: number;
  highValueStudentPercentage: number;
  boundaryDetectionRate: number;
  evidenceGapClosureRate: number;
  modelImprovementRate: number;
  informationGainPerStudent: number;
  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
  deferredCount?: number;
}

export interface UncertaintyEngineConfig {
  modelUncertaintyWeight: number;
  decisionUncertaintyWeight: number;
  outcomeUncertaintyWeight: number;
  recommendationUncertaintyWeight: number;
  temporalDecayFactor: number;
  minimumSampleSize: number;
}

export interface LearningValueEngineConfig {
  uncertaintyWeight: number;
  volatilityWeight: number;
  rarityWeight: number;
  contradictionWeight: number;
  noveltyWeight: number;
  diversityWeight: number;
  minimumInformationGain: number;
}

export interface DecisionBoundaryEngineConfig {
  boundaryDetectionThreshold: number;
  minimumHistoricalData: number;
  ambiguityThreshold: number;
  maxBoundariesPerStudent: number;
}

export interface OutcomePriorityEngineConfig {
  defaultTrackingDays: number;
  highPriorityDays: number;
  autoEscalateThreshold: number;
}

export interface EvidenceGapEngineConfig {
  criticalCoverageThreshold: number;
  targetCoverage: number;
}

export interface ActiveLearningConfig extends
  UncertaintyEngineConfig,
  LearningValueEngineConfig,
  DecisionBoundaryEngineConfig {
  uncertainty: UncertaintyEngineConfig;
  learningValue: LearningValueEngineConfig;
  decisionBoundary: DecisionBoundaryEngineConfig;
  outcomePriority: OutcomePriorityEngineConfig;
  evidenceGap: EvidenceGapEngineConfig;
  queries: {
    maxPendingPerStudent: number;
    defaultExpiryDays: number;
    batchSize: number;
  };
  maxStudentsPerBatch: number;
  minLearningValueThreshold: number;
  reportGenerationInterval: number;
}

export type ActiveLearningEngineConfig = ActiveLearningConfig;

export const DEFAULT_ACTIVE_LEARNING_CONFIG: ActiveLearningConfig = {
  modelUncertaintyWeight: 0.3,
  decisionUncertaintyWeight: 0.25,
  outcomeUncertaintyWeight: 0.25,
  recommendationUncertaintyWeight: 0.2,
  temporalDecayFactor: 0.95,
  minimumSampleSize: 10,
  uncertaintyWeight: 0.25,
  volatilityWeight: 0.2,
  rarityWeight: 0.15,
  contradictionWeight: 0.2,
  noveltyWeight: 0.15,
  diversityWeight: 0.05,
  minimumInformationGain: 0.1,
  boundaryDetectionThreshold: 0.4,
  minimumHistoricalData: 20,
  ambiguityThreshold: 0.35,
  maxBoundariesPerStudent: 3,
  uncertainty: {
    modelUncertaintyWeight: 0.3,
    decisionUncertaintyWeight: 0.25,
    outcomeUncertaintyWeight: 0.25,
    recommendationUncertaintyWeight: 0.2,
    temporalDecayFactor: 0.95,
    minimumSampleSize: 10,
  },
  learningValue: {
    uncertaintyWeight: 0.25,
    volatilityWeight: 0.2,
    rarityWeight: 0.15,
    contradictionWeight: 0.2,
    noveltyWeight: 0.15,
    diversityWeight: 0.05,
    minimumInformationGain: 0.1,
  },
  decisionBoundary: {
    boundaryDetectionThreshold: 0.4,
    minimumHistoricalData: 20,
    ambiguityThreshold: 0.35,
    maxBoundariesPerStudent: 3,
  },
  outcomePriority: {
    defaultTrackingDays: 30,
    highPriorityDays: 7,
    autoEscalateThreshold: 45,
  },
  evidenceGap: {
    criticalCoverageThreshold: 30,
    targetCoverage: 80,
  },
  queries: {
    maxPendingPerStudent: 3,
    defaultExpiryDays: 14,
    batchSize: 25,
  },
  maxStudentsPerBatch: 100,
  minLearningValueThreshold: 0.4,
  reportGenerationInterval: 30,
};

export interface StudentLearningProfile {
  studentId: StudentId;
  lastAnalyzed?: number;
  lastUpdated?: Date;
  uncertaintyProfile: UncertaintyProfile;
  learningValue: LearningValueScore;
  boundaryProximities: BoundaryProximity[];
  outcomePriority: OutcomePriority;
  evidenceGaps: string[];
  queryHistory: LearningQueryId[];
  learningPriority?: number;
  priorityRank?: number;
  recommendedActions?: string[];
  learningValueHistory?: Array<{
    timestamp: Date;
    score: number;
  }>;
}

export type LearningStrategy = 'targeted_query' | 'outcome_followup' | 'boundary_probe' | 'evidence_gap_fill';

export interface IUncertaintyEngine {
  calculateUncertainty(input: unknown): UncertaintyProfile;
}

export interface ILearningValueEngine {
  calculateLearningValue(input: unknown): LearningValueScore;
}

export interface IDecisionBoundaryEngine {
  detectBoundaries(studentId: StudentId, profile?: unknown): BoundaryProximity[];
}

export interface IOutcomePriorityEngine {
  calculatePriority(studentId: StudentId, context?: unknown): OutcomePriority;
}

export interface IEvidenceGapEngine {
  getStudentGaps(studentId: StudentId): EvidenceGap[];
}

export interface IActiveLearningEngine {
  analyzeStudent(studentId: StudentId): {
    uncertainty: UncertaintyProfile;
    learningValue: LearningValueScore;
    boundaries: BoundaryProximity[];
    priority: OutcomePriority;
  };
  generateLearningQuery(studentId: StudentId, type: QueryType): LearningQuery | null;
  generateReport(): ActiveLearningReport;
}
