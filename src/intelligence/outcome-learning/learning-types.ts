/**
 * CareerOS Outcome Learning Engine - Type Definitions
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Core philosophy: "Recommendations are hypotheses. Outcomes are feedback."
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import type {
  StudentId,
  RecommendationId,
  PathId,
  OutcomeRecordId,
  PredictionComparison,
  OutcomeQuality,
} from '../outcome-tracking/outcome-types.js';

import type {
  CareerRecommendation,
} from '../../recommendation/recommendation-types.js';

import type {
  DecisionContext,
} from '../decision-intelligence/decision-types.js';

import type {
  DecisionOutcome,
} from '../../mentor-intelligence/mentor-intelligence-types.js';

// ============================================================================
// CORE IDENTIFIERS
// ============================================================================

export type LearningSignalId = string & { readonly __brand: 'LearningSignalId' };
export type FeedbackBatchId = string & { readonly __brand: 'FeedbackBatchId' };
export type LearningSessionId = string & { readonly __brand: 'LearningSessionId' };
export type CalibrationModelId = string & { readonly __brand: 'CalibrationModelId' };

// ============================================================================
// LEARNING SIGNAL TYPES
// ============================================================================

export type SignalType =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'UNEXPECTED'
  | 'GROWTH'
  | 'REGRESSION'
  | 'LONG_TERM';

export type SignalPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SignalSource =
  | 'OUTCOME_TRACKING'
  | 'RECOMMENDATION_ENGINE'
  | 'DECISION_INTELLIGENCE'
  | 'MENTOR_INTELLIGENCE'
  | 'GROWTH_ENGINE'
  | 'REGRET_PREDICTION'
  | 'CRITICALITY_ENGINE'
  | 'AGGREGATE'
  | 'MANUAL_FEEDBACK';

/**
 * Enhanced learning signal with outcome-specific metadata
 */
export interface OutcomeLearningSignal {
  signalId: LearningSignalId;
  signalType: SignalType;
  source: SignalSource;
  targetEngine: string;
  priority: SignalPriority;
  timestamp: number;
  studentId?: StudentId;
  recommendationId?: RecommendationId;
  payload: {
    outcomeType: string;
    predictedOutcome: number | string | boolean;
    actualOutcome: number | string | boolean;
    errorMagnitude: number;
    factors?: string[];
    context?: Record<string, unknown>;
    learningPotential?: number;
  };
  processed: boolean;
  processedAt?: number;
  learningApplied: boolean;
  learningAppliedAt?: number;
}

// ============================================================================
// FEEDBACK TYPES
// ============================================================================

export type FeedbackType =
  | 'RECOMMENDATION_FEEDBACK'
  | 'DECISION_FEEDBACK'
  | 'GROWTH_FEEDBACK'
  | 'EXPLORATION_FEEDBACK'
  | 'MENTOR_FEEDBACK'
  | 'OUTCOME_FEEDBACK'
  | 'CONFIDENCE_FEEDBACK';

export type FeedbackSentiment = 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';

/**
 * Raw feedback from any source
 */
export interface RawFeedback {
  id: string;
  type: FeedbackType;
  timestamp: number;
  studentId: StudentId;
  source: SignalSource;
  payload: Record<string, unknown>;
  metadata: {
    dataQuality: number;
    verified: boolean;
    sourceVersion: string;
  };
}

/**
 * Processed feedback ready for learning
 */
export interface ProcessedFeedback {
  id: string;
  originalFeedbackId: string;
  timestamp: number;
  studentId: StudentId;
  signals: OutcomeLearningSignal[];
  insights: FeedbackInsight[];
  processed: boolean;
  processedAt?: number;
}

/**
 * Insight extracted from feedback
 */
export interface FeedbackInsight {
  insightId: string;
  type: 'PATTERN' | 'ANOMALY' | 'TREND' | 'CORRELATION';
  description: string;
  confidence: number;
  evidence: string[];
  actionable: boolean;
}

// ============================================================================
// RECOMMENDATION LEARNING TYPES
// ============================================================================

export interface RecommendationLearningEntry {
  entryId: string;
  timestamp: number;
  recommendationId: RecommendationId;
  studentId: StudentId;
  careerId: string;
  
  // What we predicted
  predicted: {
    matchScore: number;
    confidence: number;
    successProbability: number;
    expectedSatisfaction: number;
  };
  
  // What actually happened
  actual: {
    outcome: OutcomeQuality;
    satisfaction: number;
    success: boolean;
    studentChose: boolean;
    wouldRecommend: boolean;
  };
  
  // Learning
  accuracy: number;
  predictionError: number;
  bias: 'OPTIMISTIC' | 'PESSIMISTIC' | 'CALIBRATED';
  factors: {
    accurate: string[];
    inaccurate: string[];
    missing: string[];
  };
}

export interface RecommendationLearningReport {
  reportId: string;
  generatedAt: number;
  period: { start: number; end: number };
  
  // Overall metrics
  totalRecommendations: number;
  trackedOutcomes: number;
  
  // Accuracy metrics
  accuracy: {
    overall: number;
    byCareer: Map<string, number>;
    byStudentSegment: Map<string, number>;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  
  // Utility metrics
  utility: {
    chosenRate: number;
    satisfactionRate: number;
    successRate: number;
  };
  
  // Stability
  stability: {
    score: number;
    volatilityIndex: number;
  };
  
  // Impact
  impact: {
    positiveImpact: number;
    negativeImpact: number;
    netImpact: number;
  };
  
  // Learning insights
  insights: {
    strongestPredictors: string[];
    weakestPredictors: string[];
    improvingCareers: string[];
    failingCareers: string[];
  };
}

// ============================================================================
// DECISION LEARNING TYPES
// ============================================================================

export interface DecisionLearningEntry {
  entryId: string;
  timestamp: number;
  decisionId: string;
  studentId: StudentId;
  context: DecisionContext;
  
  // What we recommended
  recommendation: {
    option: string;
    confidence: number;
    rationale: string[];
  };
  
  // What student chose
  studentChoice: {
    option: string;
    alignedWithRecommendation: boolean;
    confidenceAtDecision: number;
  };
  
  // Outcome
  outcome: {
    success: boolean;
    satisfaction: number;
    regret: number;
    wouldChooseAgain: boolean;
  };
  
  // Learning
  quality: DecisionQuality;
  regretSignal: RegretSignal;
  opportunitySignal: OpportunitySignal;
}

export type DecisionQuality = 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'POOR' | 'BAD';

export interface RegretSignal {
  present: boolean;
  intensity: number;
  causes: string[];
  preventable: boolean;
}

export interface OpportunitySignal {
  present: boolean;
  missedOpportunities: string[];
  potentialValue: number;
}

export interface DecisionLearningReport {
  reportId: string;
  generatedAt: number;
  period: { start: number; end: number };
  
  // Metrics
  totalDecisions: number;
  recommendationFollowRate: number;
  
  // Quality
  quality: {
    excellentRate: number;
    goodRate: number;
    poorRate: number;
    averageQuality: number;
  };
  
  // Regret analysis
  regret: {
    regretRate: number;
    averageIntensity: number;
    preventableRate: number;
    topCauses: string[];
  };
  
  // Opportunity analysis
  opportunities: {
    missedRate: number;
    averageMissedValue: number;
    topMissed: string[];
  };
  
  // Decision patterns
  patterns: {
    bestDecisionTypes: string[];
    worstDecisionTypes: string[];
    highConfidenceSuccessRate: number;
    lowConfidenceSuccessRate: number;
  };
}

// ============================================================================
// CONFIDENCE CALIBRATION TYPES
// ============================================================================

export interface ConfidenceCalibrationEntry {
  entryId: string;
  timestamp: number;
  predictionId: string;
  
  // Confidence stated
  statedConfidence: number;
  confidenceBin: string;
  
  // Outcome
  outcome: boolean;
  actualProbability: number;
  
  // Calibration
  expectedSuccesses: number;
  actualSuccesses: number;
  calibrationError: number;
}

export interface CalibrationMetrics {
  // Reliability diagram data
  reliability: {
    bins: string[];
    expectedRates: number[];
    actualRates: number[];
    gaps: number[];
  };
  
  // Overall metrics
  expectedCalibrationError: number;
  maximumCalibrationError: number;
  brierScore: number;
  
  // Bias
  bias: {
    direction: 'OVERCONFIDENT' | 'UNDERCONFIDENT' | 'CALIBRATED';
    magnitude: number;
  };
  
  // Trends
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  calibrationHistory: { timestamp: number; ece: number }[];
}

export interface ConfidenceReliability {
  confidenceLevel: number;
  predictedSuccessRate: number;
  actualSuccessRate: number;
  sampleSize: number;
  reliable: boolean;
  adjustment: number;
}

// ============================================================================
// OUTCOME WEIGHT TYPES
// ============================================================================

export type OutcomeFactor =
  | 'CAREER_FIT'
  | 'IDENTITY_FIT'
  | 'OPTIONALITY'
  | 'FINANCIAL_OUTCOME'
  | 'WELLBEING_OUTCOME'
  | 'GROWTH_OUTCOME'
  | 'SKILL_ALIGNMENT'
  | 'MARKET_DEMAND'
  | 'LOCATION_FIT'
  | 'TIMING_FIT';

export interface FactorWeight {
  factor: OutcomeFactor;
  weight: number;
  confidence: number;
  sampleSize: number;
  lastUpdated: number;
  
  // Historical weights
  history: { timestamp: number; weight: number }[];
}

export interface FactorImportance {
  factor: OutcomeFactor;
  correlationWithSuccess: number;
  correlationWithSatisfaction: number;
  predictivePower: number;
  stability: number;
}

export interface OutcomeWeightModel {
  modelId: string;
  timestamp: number;
  
  // Current weights
  weights: Map<OutcomeFactor, FactorWeight>;
  
  // Importance analysis
  importance: Map<OutcomeFactor, FactorImportance>;
  
  // Changes over time
  trends: Map<OutcomeFactor, 'INCREASING' | 'STABLE' | 'DECREASING'>;
  
  // Validation
  validationScore: number;
  predictionAccuracy: number;
}

// ============================================================================
// LEARNING REPORT TYPES
// ============================================================================

export interface LearningReport {
  reportId: string;
  generatedAt: number;
  period: { start: number; end: number };
  
  // System learning
  system: {
    learningVelocity: number;
    knowledgeGrowth: number;
    accuracyImprovement: number;
    confidenceImprovement: number;
  };
  
  // Predictors
  predictors: {
    strongest: PredictorPerformance[];
    weakest: PredictorPerformance[];
    improving: PredictorPerformance[];
    declining: PredictorPerformance[];
  };
  
  // Recommendations
  recommendations: {
    improving: string[];
    failing: string[];
    newSuccessPatterns: string[];
    newFailurePatterns: string[];
  };
  
  // Calibration
  calibration: {
    reliability: number;
    bias: string;
    adjustmentNeeded: boolean;
  };
  
  // Outcomes
  outcomes: {
    accuracy: number;
    quality: OutcomeQuality;
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  
  // Actionable insights
  insights: LearningInsight[];
  
  // Next steps
  actions: string[];
}

export interface PredictorPerformance {
  predictor: string;
  currentAccuracy: number;
  previousAccuracy: number;
  change: number;
  sampleSize: number;
  confidence: number;
}

export interface LearningInsight {
  insightId: string;
  category: 'PATTERN' | 'ANOMALY' | 'OPPORTUNITY' | 'RISK';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  actionRecommended: boolean;
  suggestedAction?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface LearningAnalytics {
  // Recommendation metrics
  recommendations: {
    total: number;
    accuracy: number;
    utility: number;
    stability: number;
  };
  
  // Decision metrics
  decisions: {
    total: number;
    quality: number;
    regretRate: number;
    opportunityCapture: number;
  };
  
  // Prediction metrics
  predictions: {
    total: number;
    accuracy: number;
    calibration: number;
    bias: string;
  };
  
  // Calibration metrics
  calibration: {
    quality: number;
    reliability: number;
    adjustmentsMade: number;
  };
  
  // Learning progress
  learning: {
    velocity: number;
    progress: number;
    coverage: number;
    depth: number;
  };
  
  // Outcomes
  outcomes: {
    quality: number;
    satisfaction: number;
    success: number;
  };
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface OutcomeLearningConfig {
  // Learning settings
  learning: {
    enabled: boolean;
    signalProcessingEnabled: boolean;
    autoCalibrationEnabled: boolean;
    weightAdjustmentEnabled: boolean;
    minSampleSize: number;
    learningRate: number;
  };
  
  // Feedback settings
  feedback: {
    retentionPeriod: number;
    minDataQuality: number;
    requireVerification: boolean;
    batchProcessingSize: number;
  };
  
  // Calibration settings
  calibration: {
    binCount: number;
    minSamplesPerBin: number;
    recalibrationThreshold: number;
    autoAdjustConfidence: boolean;
  };
  
  // Report settings
  reports: {
    generationInterval: number;
    minPeriodDays: number;
    includeRawData: boolean;
  };
  
  // Integration settings
  integration: {
    outcomeTrackingEnabled: boolean;
    decisionIntelligenceEnabled: boolean;
    regretPredictionEnabled: boolean;
    criticalityEngineEnabled: boolean;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_OUTCOME_LEARNING_CONFIG: OutcomeLearningConfig = {
  learning: {
    enabled: true,
    signalProcessingEnabled: true,
    autoCalibrationEnabled: true,
    weightAdjustmentEnabled: true,
    minSampleSize: 10,
    learningRate: 0.1,
  },
  feedback: {
    retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
    minDataQuality: 70,
    requireVerification: false,
    batchProcessingSize: 100,
  },
  calibration: {
    binCount: 10,
    minSamplesPerBin: 5,
    recalibrationThreshold: 0.1,
    autoAdjustConfidence: true,
  },
  reports: {
    generationInterval: 7 * 24 * 60 * 60 * 1000, // 1 week
    minPeriodDays: 30,
    includeRawData: false,
  },
  integration: {
    outcomeTrackingEnabled: true,
    decisionIntelligenceEnabled: true,
    regretPredictionEnabled: true,
    criticalityEngineEnabled: true,
  },
};

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface IFeedbackIngestionEngine {
  ingest(feedback: RawFeedback): Promise<ProcessedFeedback>;
  ingestBatch(feedbacks: RawFeedback[]): Promise<ProcessedFeedback[]>;
  getPendingFeedback(): RawFeedback[];
  processPending(): Promise<void>;
}

export interface IRecommendationLearningEngine {
  recordEntry(entry: RecommendationLearningEntry): void;
  generateReport(period: { start: number; end: number }): RecommendationLearningReport;
  getAccuracy(recommendationId?: RecommendationId): number;
  getInsights(): LearningInsight[];
}

export interface IDecisionLearningEngine {
  recordEntry(entry: DecisionLearningEntry): void;
  generateReport(period: { start: number; end: number }): DecisionLearningReport;
  getDecisionQuality(decisionId: string): DecisionQuality;
  getRegretPatterns(): RegretSignal[];
}

export interface IConfidenceCalibrationEngine {
  recordEntry(entry: ConfidenceCalibrationEntry): void;
  calculateMetrics(): CalibrationMetrics;
  getReliability(confidenceLevel: number): ConfidenceReliability;
  calibrateConfidence(rawConfidence: number): number;
  isWellCalibrated(): boolean;
}

export interface IOutcomeWeightEngine {
  updateWeights(outcomes: OutcomeLearningSignal[]): void;
  getCurrentModel(): OutcomeWeightModel;
  getFactorWeight(factor: OutcomeFactor): FactorWeight;
  getFactorImportance(factor: OutcomeFactor): FactorImportance;
  predictSuccess(factors: Map<OutcomeFactor, number>): number;
}

export interface ILearningSignalEngine {
  generateSignals(feedback: ProcessedFeedback): OutcomeLearningSignal[];
  getSignalsByType(type: SignalType): OutcomeLearningSignal[];
  getSignalsByTarget(targetEngine: string): OutcomeLearningSignal[];
  processSignals(): void;
  applyLearning(): void;
}

export interface ILearningReportEngine {
  generateReport(period?: { start: number; end: number }): LearningReport;
  getPredictorPerformance(predictor: string): PredictorPerformance;
  getInsights(category?: string): LearningInsight[];
  exportReport(reportId: string): string;
}

export interface IOutcomeLearningEngine {
  // Configuration
  getConfig(): OutcomeLearningConfig;
  updateConfig(config: Partial<OutcomeLearningConfig>): void;
  
  // Feedback ingestion
  ingestFeedback(feedback: RawFeedback): Promise<void>;
  ingestFeedbackBatch(feedbacks: RawFeedback[]): Promise<void>;
  
  // Learning
  learnFromOutcomes(): Promise<void>;
  calibrateConfidence(): Promise<CalibrationMetrics>;
  updateWeights(): Promise<void>;
  
  // Reports
  generateLearningReport(): Promise<LearningReport>;
  generateRecommendationReport(): Promise<RecommendationLearningReport>;
  generateDecisionReport(): Promise<DecisionLearningReport>;
  
  // Analytics
  getAnalytics(): Promise<LearningAnalytics>;
  getCalibrationMetrics(): Promise<CalibrationMetrics>;
  
  // Signals
  getPendingSignals(): OutcomeLearningSignal[];
  processSignals(): Promise<void>;
}
