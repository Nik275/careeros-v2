/**
 * Recommendation Feedback Loop - Types
 * 
 * Infrastructure for comparing recommendations against actual outcomes.
 * 
 * Purpose:
 *   Track recommendation accuracy, measure prediction quality,
 *   and generate learning signals for recommendation improvement.
 * 
 * Design Principles:
 *   - No machine learning - only transparent measurement
 *   - All calculations are explainable
 *   - Conservative confidence estimates
 *   - Clear audit trail from recommendation to outcome
 */

import type { 
  EntityId, 
  ConfidenceScore, 
  BeliefTimestamp,
  CareerRecommendation,
} from '../types/index.js';

import type { OutcomeRecord } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Unique identifier for a feedback analysis.
 */
export type FeedbackAnalysisId = string;

/**
 * Types of accuracy being measured.
 */
export enum AccuracyType {
  /** Did the student choose the recommended path? */
  PATH_CHOICE = 'path_choice',
  
  /** Was the predicted outcome satisfaction accurate? */
  SATISFACTION_PREDICTION = 'satisfaction_prediction',
  
  /** Was the predicted utility accurate? */
  UTILITY_PREDICTION = 'utility_prediction',
  
  /** Was the regret prediction accurate? */
  REGRET_PREDICTION = 'regret_prediction',
  
  /** Was the confidence score well-calibrated? */
  CONFIDENCE_CALIBRATION = 'confidence_calibration',
}

/**
 * Result of a recommendation-outcome comparison.
 */
export enum ComparisonResult {
  /** Recommendation matched outcome perfectly */
  CORRECT = 'correct',
  
  /** Recommendation was partially correct */
  PARTIAL = 'partial',
  
  /** Recommendation did not match outcome */
  INCORRECT = 'incorrect',
  
  /** Cannot determine (insufficient data) */
  UNKNOWN = 'unknown',
}

// ============================================================================
// RECOMMENDATION OUTCOME PAIR
// ============================================================================

/**
 * Links a recommendation to its actual outcome.
 */
export interface RecommendationOutcomePair {
  /** Unique identifier for this pairing */
  id: FeedbackAnalysisId;
  
  /** The original recommendation */
  recommendation: CareerRecommendation;
  
  /** The actual outcome record */
  outcome: OutcomeRecord;
  
  /** Whether student followed the recommendation */
  followedRecommendation: boolean;
  
  /** Path that was recommended */
  recommendedPathId: string;
  
  /** Path that was actually chosen */
  chosenPathId: string;
  
  /** Comparison timestamp */
  analyzedAt: BeliefTimestamp;
}

// ============================================================================
// ACCURACY MEASUREMENTS
// ============================================================================

/**
 * Accuracy measurement for a specific dimension.
 */
export interface AccuracyMeasurement {
  /** Type of accuracy measured */
  type: AccuracyType;
  
  /** Result of comparison */
  result: ComparisonResult;
  
  /** Numeric accuracy score (0.0 - 1.0) */
  score: number;
  
  /** Predicted value */
  predicted: number | boolean | string;
  
  /** Actual value */
  actual: number | boolean | string;
  
  /** Difference between predicted and actual */
  error: number;
  
  /** Absolute error */
  absoluteError: number;
  
  /** Whether the prediction was within acceptable bounds */
  withinTolerance: boolean;
  
  /** Explanation of the measurement */
  explanation: string;
}

/**
 * Complete accuracy analysis for a recommendation-outcome pair.
 */
export interface RecommendationAccuracyAnalysis {
  /** Analysis identifier */
  id: FeedbackAnalysisId;
  
  /** The pair being analyzed */
  pair: RecommendationOutcomePair;
  
  /** Individual accuracy measurements */
  measurements: Map<AccuracyType, AccuracyMeasurement>;
  
  /** Overall accuracy score (weighted average) */
  overallAccuracy: number;
  
  /** Accuracy breakdown by category */
  byCategory: {
    pathChoice: AccuracyMeasurement;
    satisfactionPrediction: AccuracyMeasurement;
    utilityPrediction: AccuracyMeasurement;
    regretPrediction: AccuracyMeasurement;
    confidenceCalibration: AccuracyMeasurement;
  };
  
  /** Confidence calibration assessment */
  calibration: ConfidenceCalibration;
  
  /** Analysis timestamp */
  analyzedAt: BeliefTimestamp;
}

/**
 * Confidence calibration assessment.
 */
export interface ConfidenceCalibration {
  /** Whether confidence was well-calibrated */
  isWellCalibrated: boolean;
  
  /** Predicted confidence */
  predictedConfidence: number;
  
  /** Actual accuracy achieved */
  actualAccuracy: number;
  
  /** Calibration error (difference) */
  calibrationError: number;
  
  /** Assessment of calibration quality */
  assessment: 'overconfident' | 'underconfident' | 'well_calibrated';
}

// ============================================================================
// AGGREGATE METRICS
// ============================================================================

/**
 * Aggregate accuracy metrics across multiple recommendations.
 */
export interface AggregateAccuracyMetrics {
  /** Time period for these metrics */
  period: { start: BeliefTimestamp; end: BeliefTimestamp };
  
  /** Number of recommendations analyzed */
  totalRecommendations: number;
  
  /** Number with outcome data */
  recommendationsWithOutcomes: number;
  
  /** Number where student followed recommendation */
  followedRecommendations: number;
  
  /** Follow rate */
  followRate: number;
  
  /** Accuracy by type */
  accuracyByType: Map<AccuracyType, TypeAccuracyMetrics>;
  
  /** Overall accuracy */
  overallAccuracy: number;
  
  /** Confidence calibration across all recommendations */
  confidenceCalibration: CalibrationMetrics;
  
  /** Metrics by path */
  metricsByPath: Map<string, PathAccuracyMetrics>;
  
  /** Metrics by student profile segment */
  metricsBySegment: Map<string, SegmentAccuracyMetrics>;
}

/**
 * Accuracy metrics for a specific type.
 */
export interface TypeAccuracyMetrics {
  /** Type of accuracy */
  type: AccuracyType;
  
  /** Number of measurements */
  count: number;
  
  /** Mean accuracy */
  meanAccuracy: number;
  
  /** Median accuracy */
  medianAccuracy: number;
  
  /** Standard deviation */
  stdDev: number;
  
  /** Distribution of results */
  resultDistribution: Map<ComparisonResult, number>;
}

/**
 * Accuracy metrics for a specific career path.
 */
export interface PathAccuracyMetrics {
  /** Path identifier */
  pathId: string;
  
  /** Number of recommendations for this path */
  recommendationCount: number;
  
  /** Number with outcomes */
  outcomeCount: number;
  
  /** Follow rate */
  followRate: number;
  
  /** Satisfaction prediction accuracy */
  satisfactionAccuracy: number;
  
  /** Average satisfaction of students who followed */
  averageSatisfaction: number;
  
  /** Regret rate */
  regretRate: number;
}

/**
 * Accuracy metrics for a student segment.
 */
export interface SegmentAccuracyMetrics {
  /** Segment identifier */
  segmentId: string;
  
  /** Segment description */
  description: string;
  
  /** Number of students in segment */
  studentCount: number;
  
  /** Overall accuracy for this segment */
  accuracy: number;
  
  /** Best performing paths for this segment */
  bestPaths: string[];
  
  /** Worst performing paths for this segment */
  worstPaths: string[];
}

/**
 * Confidence calibration metrics.
 */
export interface CalibrationMetrics {
  /** Number of predictions analyzed */
  predictionCount: number;
  
  /** Mean calibration error */
  meanCalibrationError: number;
  
  /** Percentage of predictions that were overconfident */
  overconfidentRate: number;
  
  /** Percentage of predictions that were underconfident */
  underconfidentRate: number;
  
  /** Percentage well-calibrated */
  wellCalibratedRate: number;
  
  /** Expected Calibration Error (ECE) */
  expectedCalibrationError: number;
}

// ============================================================================
// LEARNING SIGNALS
// ============================================================================

/**
 * Signal for improving recommendations.
 */
export interface LearningSignal {
  /** Signal identifier */
  id: string;
  
  /** Type of signal */
  type: LearningSignalType;
  
  /** Signal priority */
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  /** Human-readable description */
  description: string;
  
  /** Detailed explanation */
  explanation: string;
  
  /** Supporting evidence */
  evidence: {
    affectedRecommendations: FeedbackAnalysisId[];
    sampleSize: number;
    confidence: number;
  };
  
  /** Suggested action */
  suggestedAction: string;
  
  /** Expected impact of action */
  expectedImpact: string;
  
  /** When signal was generated */
  generatedAt: BeliefTimestamp;
}

/**
 * Types of learning signals.
 */
export enum LearningSignalType {
  /** Systematic bias detected */
  SYSTEMATIC_BIAS = 'systematic_bias',
  
  /** Underconfidence in certain paths */
  UNDERCONFIDENCE = 'underconfidence',
  
  /** Overconfidence in certain paths */
  OVERCONFIDENCE = 'overconfidence',
  
  /** Poor performance for specific segment */
  SEGMENT_PERFORMANCE = 'segment_performance',
  
  /** Path popularity vs outcome mismatch */
  PATH_MISALIGNMENT = 'path_misalignment',
  
  /** Utility prediction error pattern */
  UTILITY_ERROR_PATTERN = 'utility_error_pattern',
  
  /** Regret prediction error pattern */
  REGRET_ERROR_PATTERN = 'regret_error_pattern',
}

/**
 * Recommendation improvement signal.
 */
export interface RecommendationImprovementSignal {
  /** Signal identifier */
  id: string;
  
  /** Area for improvement */
  area: ImprovementArea;
  
  /** Current performance */
  currentPerformance: number;
  
  /** Target performance */
  targetPerformance: number;
  
  /** Gap to close */
  performanceGap: number;
  
  /** Specific recommendation types affected */
  affectedRecommendationTypes: string[];
  
  /** Recommended adjustment */
  recommendedAdjustment: string;
  
  /** Expected improvement */
  expectedImprovement: number;
}

/**
 * Areas for improvement.
 */
export enum ImprovementArea {
  PATH_RANKING = 'path_ranking',
  CONFIDENCE_SCORING = 'confidence_scoring',
  UTILITY_PREDICTION = 'utility_prediction',
  REGRET_PREDICTION = 'regret_prediction',
  STUDENT_SEGMENTATION = 'student_segmentation',
  FEASIBILITY_ASSESSMENT = 'feasibility_assessment',
}

// ============================================================================
// INPUT / OUTPUT
// ============================================================================

/**
 * Input for feedback loop analysis.
 */
export interface FeedbackLoopInput {
  /** Recommendations to analyze */
  recommendations: CareerRecommendation[];
  
  /** Outcome records to compare against */
  outcomes: OutcomeRecord[];
  
  /** Analysis options */
  options?: {
    /** Minimum confidence threshold */
    minConfidence?: number;
    
    /** Time window for analysis */
    timeWindow?: { start: BeliefTimestamp; end: BeliefTimestamp };
    
    /** Paths to focus on */
    pathFilter?: string[];
    
    /** Generate learning signals */
    generateSignals?: boolean;
  };
}

/**
 * Output from feedback loop analysis.
 */
export interface FeedbackLoopOutput {
  /** Individual analyses */
  analyses: RecommendationAccuracyAnalysis[];
  
  /** Aggregate metrics */
  aggregateMetrics: AggregateAccuracyMetrics;
  
  /** Learning signals generated */
  learningSignals: LearningSignal[];
  
  /** Improvement signals */
  improvementSignals: RecommendationImprovementSignal[];
  
  /** Analysis metadata */
  metadata: {
    startedAt: BeliefTimestamp;
    completedAt: BeliefTimestamp;
    durationMs: number;
    parameters: FeedbackLoopInput;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration for the recommendation feedback loop.
 */
export interface RecommendationFeedbackConfig {
  /** Tolerance for considering prediction correct (e.g., 0.1 = 10%) */
  predictionTolerance: number;
  
  /** Minimum sample size for aggregate metrics */
  minSampleSize: number;
  
  /** Confidence calibration thresholds */
  calibrationThresholds: {
    wellCalibrated: number;  // Max acceptable calibration error
    overconfident: number;   // Threshold for flagging overconfidence
    underconfident: number;  // Threshold for flagging underconfidence
  };
  
  /** Signal generation thresholds */
  signalThresholds: {
    systematicBias: number;
    confidenceDrift: number;
    performanceGap: number;
  };
  
  /** Whether to include incomplete outcomes */
  includeIncompleteOutcomes: boolean;
  
  /** Maximum age of outcomes to consider (ms) */
  maxOutcomeAge: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_FEEDBACK_CONFIG: RecommendationFeedbackConfig = {
  predictionTolerance: 0.15,
  minSampleSize: 10,
  calibrationThresholds: {
    wellCalibrated: 0.1,
    overconfident: 0.2,
    underconfident: -0.2,
  },
  signalThresholds: {
    systematicBias: 0.15,
    confidenceDrift: 0.1,
    performanceGap: 0.2,
  },
  includeIncompleteOutcomes: false,
  maxOutcomeAge: 365 * 24 * 60 * 60 * 1000, // 1 year
};
