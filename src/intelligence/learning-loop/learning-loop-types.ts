/**
 * CareerOS Learning Loop System - Type Definitions
 *
 * Transforms CareerOS into a continuously learning intelligence system
 * that learns from outcomes and feeds lessons back into future recommendations.
 */

// ============================================================================
// CORE LEARNING TYPES
// ============================================================================

export type RecommendationId = string;
export type StudentId = string;
export type OutcomeId = string;
export type Timestamp = number;
export type ConfidenceScore = number; // 0-1
export type SatisfactionScore = number; // 0-1
export type RegretScore = number; // 0-1
export type SuccessLevel = 'failed' | 'poor' | 'fair' | 'good' | 'excellent';

// ============================================================================
// OUTCOME TRACKING
// ============================================================================

export interface OutcomeTimeline {
  recommendationGiven: Timestamp;
  studentDecision: Timestamp;
  shortTermOutcome?: Timestamp;
  mediumTermOutcome?: Timestamp;
  longTermOutcome?: Timestamp;
}

export interface OutcomeMetrics {
  satisfactionScore: SatisfactionScore;
  regretScore: RegretScore;
  confidenceChange: number; // -1 to 1
  goalAchievementRate: number; // 0-1
  skillGrowthRate: number; // 0-1
  careerProgressionRate: number; // 0-1
}

export interface OutcomeFeedback {
  id: OutcomeId;
  recommendationId: RecommendationId;
  studentId: StudentId;
  timeline: OutcomeTimeline;
  metrics: OutcomeMetrics;
  successLevel: SuccessLevel;
  lessonExtracted: string;
  confidenceImpact: ConfidenceImpact;
  recommendationImpact: RecommendationImpact;
  contextualFactors: ContextualFactors;
  metadata: Record<string, unknown>;
}

export interface ConfidenceImpact {
  originalConfidence: ConfidenceScore;
  adjustedConfidence: ConfidenceScore;
  adjustmentReason: string;
  adjustmentMagnitude: number;
  isSignificant: boolean;
}

export interface RecommendationImpact {
  recommendationType: string;
  category: string;
  previousSuccessRate: number;
  newSuccessRate: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  recommendationStatus: 'promote' | 'maintain' | 'review' | 'deprecate';
}

export interface ContextualFactors {
  marketConditions: string;
  studentProfileMatch: number; // 0-1
  timingQuality: number; // 0-1
  externalSupportLevel: number; // 0-1
  unexpectedEvents: string[];
}

// ============================================================================
// RECOMMENDATION LEARNING
// ============================================================================

export interface RecommendationLearningProfile {
  recommendationType: string;
  category: string;
  performanceMetrics: RecommendationPerformanceMetrics;
  profileEffectiveness: Map<string, ProfileEffectiveness>; // Profile signature -> effectiveness
  regretPatterns: RegretPattern[];
  confidenceGrowthPattern: ConfidenceGrowthPattern;
  learningHistory: LearningHistoryEntry[];
  lastUpdated: Timestamp;
}

export interface RecommendationPerformanceMetrics {
  totalRecommendations: number;
  successRate: number;
  failureRate: number;
  averageSatisfaction: number;
  averageRegret: number;
  consistencyScore: number; // How consistent are outcomes
  trendDirection: 'improving' | 'stable' | 'declining';
}

export interface ProfileEffectiveness {
  profileSignature: string;
  recommendationCount: number;
  successCount: number;
  averageSatisfaction: number;
  effectivenessScore: number; // 0-1
  confidenceInterval: [number, number];
}

export interface RegretPattern {
  trigger: string;
  frequency: number;
  averageSeverity: number;
  commonContexts: string[];
  mitigationStrategies: string[];
}

export interface ConfidenceGrowthPattern {
  initialConfidence: number;
  currentConfidence: number;
  growthRate: number;
  confidenceStability: number;
  evidenceStrength: number;
}

export interface LearningHistoryEntry {
  timestamp: Timestamp;
  event: 'success' | 'failure' | 'regret' | 'adjustment';
  description: string;
  impact: number;
  confidenceDelta: number;
}

// ============================================================================
// CONFIDENCE ADJUSTMENT
// ============================================================================

export interface ConfidenceAdjustmentRule {
  id: string;
  name: string;
  condition: AdjustmentCondition;
  action: AdjustmentAction;
  priority: number;
  isActive: boolean;
  applicationCount: number;
  effectivenessScore: number;
}

export interface AdjustmentCondition {
  type: 'outcome_based' | 'pattern_based' | 'population_based' | 'temporal';
  threshold: number;
  lookbackPeriod: number; // milliseconds
  requiredSampleSize: number;
}

export interface AdjustmentAction {
  type: 'increase' | 'decrease' | 'reset' | 'cap';
  magnitude: number; // percentage adjustment
  minimumConfidence: number;
  maximumConfidence: number;
  reasoning: string;
}

export interface ConfidenceAdjustmentResult {
  originalConfidence: ConfidenceScore;
  adjustedConfidence: ConfidenceScore;
  adjustmentAmount: number;
  rulesApplied: string[];
  reasoning: string[];
  evidence: AdjustmentEvidence[];
  confidence: number; // 0-1 confidence in the adjustment
}

export interface AdjustmentEvidence {
  source: string;
  metric: string;
  value: number;
  weight: number;
}

// ============================================================================
// POPULATION LEARNING
// ============================================================================

export interface PopulationInsights {
  id: string;
  generatedAt: Timestamp;
  period: [Timestamp, Timestamp];
  commonSuccessPaths: SuccessPath[];
  commonFailurePaths: FailurePath[];
  unexpectedOutcomes: UnexpectedOutcome[];
  hiddenOpportunities: HiddenOpportunity[];
  profileSpecificPatterns: ProfileSpecificPattern[];
  aggregateMetrics: AggregateMetrics;
}

export interface SuccessPath {
  pathId: string;
  sequence: string[]; // Recommendation types in sequence
  frequency: number;
  successRate: number;
  averageTimeToSuccess: number; // milliseconds
  commonProfileTraits: string[];
  confidence: number;
}

export interface FailurePath {
  pathId: string;
  sequence: string[];
  frequency: number;
  failureRate: number;
  commonRegretTypes: string[];
  earlyWarningSigns: string[];
  avoidabilityScore: number; // How avoidable were these failures
}

export interface UnexpectedOutcome {
  pattern: string;
  expectedOutcome: string;
  actualOutcome: string;
  frequency: number;
  potentialCauses: string[];
  investigationPriority: 'low' | 'medium' | 'high' | 'critical';
}

export interface HiddenOpportunity {
  opportunityType: string;
  detectionSignal: string;
  affectedProfiles: string[];
  potentialValue: number;
  evidenceStrength: number;
  recommendedAction: string;
}

export interface ProfileSpecificPattern {
  profileSignature: string;
  patternType: 'success' | 'failure' | 'regret' | 'surprise';
  description: string;
  frequency: number;
  confidence: number;
  recommendations: string[];
}

export interface AggregateMetrics {
  totalStudents: number;
  totalRecommendations: number;
  overallSuccessRate: number;
  overallSatisfaction: number;
  overallRegretRate: number;
  averageConfidenceAccuracy: number;
  learningVelocity: number; // Rate of improvement
}

// ============================================================================
// LEARNING LOOP ENGINE
// ============================================================================

export interface LearningLoopConfig {
  minOutcomesForLearning: number;
  learningRate: number;
  confidenceAdjustmentRate: number;
  populationAggregationThreshold: number;
  feedbackWindow: number; // milliseconds
  maxConfidenceChange: number;
  minEvidenceStrength: number;
}

export const DEFAULT_LEARNING_CONFIG: LearningLoopConfig = {
  minOutcomesForLearning: 10,
  learningRate: 0.1,
  confidenceAdjustmentRate: 0.05,
  populationAggregationThreshold: 50,
  feedbackWindow: 90 * 24 * 60 * 60 * 1000, // 90 days
  maxConfidenceChange: 0.2,
  minEvidenceStrength: 0.6,
};

export interface LearningLoopReport {
  id: string;
  generatedAt: Timestamp;
  period: [Timestamp, Timestamp];
  studentId?: StudentId;
  recommendationAdjustments: RecommendationAdjustment[];
  confidenceShifts: ConfidenceShift[];
  extractedLessons: ExtractedLesson[];
  futureRecommendationImpact: FutureImpact[];
  systemLearningMetrics: SystemLearningMetrics;
}

export interface RecommendationAdjustment {
  recommendationType: string;
  category: string;
  previousPriority: number;
  newPriority: number;
  adjustmentReason: string;
  evidenceCount: number;
  confidence: number;
}

export interface ConfidenceShift {
  recommendationType: string;
  previousConfidence: ConfidenceScore;
  newConfidence: ConfidenceScore;
  shiftDirection: 'increased' | 'decreased' | 'stable';
  shiftMagnitude: number;
  primaryDriver: string;
  evidenceStrength: number;
}

export interface ExtractedLesson {
  lessonId: string;
  description: string;
  source: 'individual' | 'population' | 'pattern';
  applicability: string[];
  confidence: number;
  impactScore: number;
  relatedRecommendations: string[];
}

export interface FutureImpact {
  recommendationType: string;
  projectedSuccessRate: number;
  projectedConfidence: number;
  projectedSatisfaction: number;
  projectionConfidence: number;
  timeframe: string;
}

export interface SystemLearningMetrics {
  totalOutcomesProcessed: number;
  totalLessonsExtracted: number;
  averageConfidenceAccuracy: number;
  recommendationQualityTrend: 'improving' | 'stable' | 'declining';
  learningEffectiveness: number;
  knowledgeGaps: string[];
}

// ============================================================================
// STUDENT PROFILE MATCHING
// ============================================================================

export interface StudentProfile {
  id: StudentId;
  characteristics: ProfileCharacteristic[];
  history: StudentHistory;
  currentState: StudentState;
}

export interface ProfileCharacteristic {
  name: string;
  value: string | number;
  weight: number;
  category: 'demographic' | 'skill' | 'preference' | 'behavior' | 'goal';
}

export interface StudentHistory {
  recommendationsReceived: number;
  recommendationsAccepted: number;
  recommendationsActedUpon: number;
  outcomes: OutcomeSummary;
  averageSatisfaction: number;
  commonRegretTypes: string[];
}

export interface OutcomeSummary {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
  failed: number;
}

export interface StudentState {
  currentGoals: string[];
  currentSkills: string[];
  recentDecisions: string[];
  currentConfidenceLevel: number;
  currentSatisfactionLevel: number;
}

// ============================================================================
// EVENTS AND NOTIFICATIONS
// ============================================================================

export interface LearningEvent {
  type: LearningEventType;
  timestamp: Timestamp;
  data: unknown;
}

export enum LearningEventType {
  OUTCOME_RECORDED = 'outcome_recorded',
  LESSON_EXTRACTED = 'lesson_extracted',
  CONFIDENCE_ADJUSTED = 'confidence_adjusted',
  POPULATION_INSIGHT_GENERATED = 'population_insight_generated',
  RECOMMENDATION_PROFILE_UPDATED = 'recommendation_profile_updated',
  LEARNING_LOOP_COMPLETED = 'learning_loop_completed',
}

// ============================================================================
// UTILITIES
// ============================================================================

export interface TimeWindow {
  start: Timestamp;
  end: Timestamp;
  label: string;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  rSquared: number;
  pValue: number;
  significance: 'none' | 'weak' | 'moderate' | 'strong';
}

export interface ComparisonResult {
  baseline: number;
  current: number;
  change: number;
  percentChange: number;
  isSignificant: boolean;
  confidence: number;
}
