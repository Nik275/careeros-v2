/**
 * Recommendation Feedback Loop - Signal Generation
 *
 * Generates learning and improvement signals from accuracy analysis.
 *
 * Design Principles:
 * - No machine learning - only rule-based pattern detection
 * - Transparent signal generation logic
 * - Conservative signal thresholding
 * - Clear actionability
 */

import type {
  AggregateAccuracyMetrics,
  AccuracyMeasurement,
  CalibrationMetrics,
  TypeAccuracyMetrics,
  LearningSignal,
  RecommendationImprovementSignal,
  RecommendationAccuracyAnalysis,
} from './types.js';

import {
  LearningSignalType,
  ImprovementArea,
  ComparisonResult,
  AccuracyType,
} from './types.js';

import { DEFAULT_FEEDBACK_CONFIG } from './types.js';

// ============================================================================
// LEARNING SIGNAL GENERATION
// ============================================================================

/**
 * Generate learning signals from aggregate metrics.
 */
export function generateLearningSignals(
  metrics: AggregateAccuracyMetrics,
  analyses: RecommendationAccuracyAnalysis[],
  thresholds: { systematicBias: number; confidenceDrift: number; performanceGap: number } = DEFAULT_FEEDBACK_CONFIG.signalThresholds
): LearningSignal[] {
  const signals: LearningSignal[] = [];

  // Check for systematic bias
  const biasSignal = detectSystematicBias(metrics, analyses, thresholds.systematicBias);
  if (biasSignal) signals.push(biasSignal);

  // Check confidence calibration issues
  const confidenceSignal = detectConfidenceIssues(metrics.confidenceCalibration, thresholds.confidenceDrift);
  if (confidenceSignal) signals.push(confidenceSignal);

  // Check for segment performance issues
  const segmentSignals = detectSegmentIssues(metrics, thresholds.performanceGap);
  signals.push(...segmentSignals);

  // Check for path misalignment
  const pathSignals = detectPathMisalignment(metrics);
  signals.push(...pathSignals);

  // Check for utility prediction errors
  const utilitySignal = detectUtilityErrorPattern(metrics, analyses);
  if (utilitySignal) signals.push(utilitySignal);

  // Check for regret prediction errors
  const regretSignal = detectRegretErrorPattern(metrics, analyses);
  if (regretSignal) signals.push(regretSignal);

  return signals.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

/**
 * Detect systematic bias in recommendations.
 */
function detectSystematicBias(
  metrics: AggregateAccuracyMetrics,
  analyses: RecommendationAccuracyAnalysis[],
  threshold: number
): LearningSignal | null {
  const pathChoiceMetrics = metrics.accuracyByType.get(AccuracyType.PATH_CHOICE);
  if (!pathChoiceMetrics || pathChoiceMetrics.count < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
    return null;
  }

  const followRate = metrics.followRate;
  const overallAccuracy = metrics.overallAccuracy;

  // Low follow rate indicates systematic preference mismatch
  if (followRate < 0.5) {
    return {
      id: `bias_low_follow_rate_${Date.now()}`,
      type: LearningSignalType.SYSTEMATIC_BIAS,
      priority: 'critical',
      description: `Low recommendation follow rate: ${(followRate * 100).toFixed(1)}%`,
      explanation: `Students are only following recommendations ${(followRate * 100).toFixed(1)}% of the time. ` +
        `This suggests systematic misalignment between recommendations and student preferences. ` +
        `The system may be over-weighting certain factors or under-weighting student constraints.`,
      evidence: {
        affectedRecommendations: analyses.map(a => a.id),
        sampleSize: pathChoiceMetrics.count,
        confidence: 0.9,
      },
      suggestedAction: 'Review recommendation ranking algorithm. Check if student constraints and preferences are properly weighted.',
      expectedImpact: 'Increase follow rate by better aligning recommendations with student priorities.',
      generatedAt: Date.now(),
    };
  }

  // Low accuracy when followed indicates prediction issues
  if (overallAccuracy < threshold && followRate > 0.3) {
    return {
      id: `bias_low_accuracy_${Date.now()}`,
      type: LearningSignalType.SYSTEMATIC_BIAS,
      priority: 'high',
      description: `Low accuracy for followed recommendations: ${(overallAccuracy * 100).toFixed(1)}%`,
      explanation: `When students follow recommendations, outcomes match predictions only ${(overallAccuracy * 100).toFixed(1)}% of the time. ` +
        `This suggests the prediction models are systematically miscalibrated.`,
      evidence: {
        affectedRecommendations: analyses.filter(a => a.pair.followedRecommendation).map(a => a.id),
        sampleSize: analyses.filter(a => a.pair.followedRecommendation).length,
        confidence: 0.85,
      },
      suggestedAction: 'Review prediction models for systematic over/under-prediction of outcomes.',
      expectedImpact: 'Improve outcome prediction accuracy.',
      generatedAt: Date.now(),
    };
  }

  return null;
}

/**
 * Detect confidence calibration issues.
 */
function detectConfidenceIssues(
  calibration: CalibrationMetrics,
  threshold: number
): LearningSignal | null {
  if (calibration.predictionCount < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
    return null;
  }

  // Overconfidence issue
  if (calibration.overconfidentRate > 0.5) {
    return {
      id: `confidence_overconfident_${Date.now()}`,
      type: LearningSignalType.OVERCONFIDENCE,
      priority: 'high',
      description: `Systematic overconfidence: ${(calibration.overconfidentRate * 100).toFixed(1)}% of predictions`,
      explanation: `The system is overconfident in ${(calibration.overconfidentRate * 100).toFixed(1)}% of recommendations. ` +
        `Mean calibration error is ${calibration.meanCalibrationError.toFixed(3)}. ` +
        `Confidence scores are systematically higher than actual accuracy.`,
      evidence: {
        affectedRecommendations: [],
        sampleSize: calibration.predictionCount,
        confidence: 0.88,
      },
      suggestedAction: 'Apply confidence calibration adjustment or lower confidence scores globally.',
      expectedImpact: 'Better aligned confidence scores that accurately reflect prediction uncertainty.',
      generatedAt: Date.now(),
    };
  }

  // Underconfidence issue
  if (calibration.underconfidentRate > 0.5) {
    return {
      id: `confidence_underconfident_${Date.now()}`,
      type: LearningSignalType.UNDERCONFIDENCE,
      priority: 'medium',
      description: `Systematic underconfidence: ${(calibration.underconfidentRate * 100).toFixed(1)}% of predictions`,
      explanation: `The system is underconfident in ${(calibration.underconfidentRate * 100).toFixed(1)}% of recommendations. ` +
        `Confidence scores are systematically lower than actual accuracy.`,
      evidence: {
        affectedRecommendations: [],
        sampleSize: calibration.predictionCount,
        confidence: 0.85,
      },
      suggestedAction: 'Consider increasing confidence scores or review conservative bias in prediction models.',
      expectedImpact: 'More appropriate confidence levels that reflect actual performance.',
      generatedAt: Date.now(),
    };
  }

  return null;
}

/**
 * Detect segment-specific performance issues.
 */
function detectSegmentIssues(
  metrics: AggregateAccuracyMetrics,
  threshold: number
): LearningSignal[] {
  const signals: LearningSignal[] = [];

  for (const [segmentId, segmentMetrics] of metrics.metricsBySegment) {
    if (segmentMetrics.studentCount < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
      continue;
    }

    if (segmentMetrics.accuracy < threshold) {
      signals.push({
        id: `segment_poor_${segmentId}_${Date.now()}`,
        type: LearningSignalType.SEGMENT_PERFORMANCE,
        priority: 'high',
        description: `Poor recommendation accuracy for segment "${segmentId}"`,
        explanation: `Recommendations for students in the "${segmentMetrics.description}" segment ` +
          `have only ${(segmentMetrics.accuracy * 100).toFixed(1)}% accuracy. ` +
          `Best paths for this segment: ${segmentMetrics.bestPaths.join(', ')}. ` +
          `Worst paths: ${segmentMetrics.worstPaths.join(', ')}.`,
        evidence: {
          affectedRecommendations: [],
          sampleSize: segmentMetrics.studentCount,
          confidence: 0.8,
        },
        suggestedAction: `Review recommendation algorithm for ${segmentId} segment. ` +
          `Consider path-specific adjustments.`,
        expectedImpact: `Improve accuracy for ${segmentId} students.`,
        generatedAt: Date.now(),
      });
    }
  }

  return signals;
}

/**
 * Detect path popularity vs outcome misalignment.
 */
function detectPathMisalignment(
  metrics: AggregateAccuracyMetrics
): LearningSignal[] {
  const signals: LearningSignal[] = [];

  for (const [pathId, pathMetrics] of metrics.metricsByPath) {
    if (pathMetrics.recommendationCount < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
      continue;
    }

    // High recommendation rate but low satisfaction
    if (pathMetrics.followRate > 0.6 && pathMetrics.averageSatisfaction < 0.5) {
      signals.push({
        id: `path_misaligned_${pathId}_${Date.now()}`,
        type: LearningSignalType.PATH_MISALIGNMENT,
        priority: 'high',
        description: `Path "${pathId}" has high follow rate but low satisfaction`,
        explanation: `Path "${pathId}" is followed ${(pathMetrics.followRate * 100).toFixed(1)}% of the time ` +
          `but results in only ${(pathMetrics.averageSatisfaction * 100).toFixed(1)}% average satisfaction. ` +
          `This suggests the path is attractive but doesn't deliver expected outcomes.`,
        evidence: {
          affectedRecommendations: [],
          sampleSize: pathMetrics.recommendationCount,
          confidence: 0.82,
        },
        suggestedAction: `Review path "${pathId}" assessment. Check if attractiveness factors are over-weighted ` +
          `relative to outcome factors.`,
        expectedImpact: 'Better alignment between path attractiveness and actual outcomes.',
        generatedAt: Date.now(),
      });
    }
  }

  return signals;
}

/**
 * Detect utility prediction error patterns.
 */
function detectUtilityErrorPattern(
  metrics: AggregateAccuracyMetrics,
  analyses: RecommendationAccuracyAnalysis[]
): LearningSignal | null {
  const utilityMetrics = metrics.accuracyByType.get(AccuracyType.UTILITY_PREDICTION);
  if (!utilityMetrics || utilityMetrics.count < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
    return null;
  }

  const meanAccuracy = utilityMetrics.meanAccuracy;
  if (meanAccuracy > 0.7) return null; // Good enough

  // Check for systematic over/under prediction
  const utilityMeasurements = analyses
    .flatMap(a => Array.from(a.measurements.values()))
    .filter(m => m.type === AccuracyType.UTILITY_PREDICTION);

  const errors = utilityMeasurements.map(m => m.error as number);
  const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;

  if (Math.abs(meanError) > 0.15) {
    const direction = meanError > 0 ? 'over-predicting' : 'under-predicting';
    return {
      id: `utility_error_pattern_${Date.now()}`,
      type: LearningSignalType.UTILITY_ERROR_PATTERN,
      priority: 'medium',
      description: `Systematic utility prediction error: ${direction} by ${Math.abs(meanError).toFixed(2)}`,
      explanation: `The system is ${direction} utility by an average of ${Math.abs(meanError).toFixed(2)}. ` +
        `This indicates a systematic bias in the utility prediction model.`,
      evidence: {
        affectedRecommendations: analyses.map(a => a.id),
        sampleSize: utilityMetrics.count,
        confidence: 0.78,
      },
      suggestedAction: `Apply correction factor of ${(-meanError).toFixed(2)} to utility predictions.`,
      expectedImpact: 'Improved utility prediction accuracy.',
      generatedAt: Date.now(),
    };
  }

  return null;
}

/**
 * Detect regret prediction error patterns.
 */
function detectRegretErrorPattern(
  metrics: AggregateAccuracyMetrics,
  analyses: RecommendationAccuracyAnalysis[]
): LearningSignal | null {
  const regretMetrics = metrics.accuracyByType.get(AccuracyType.REGRET_PREDICTION);
  if (!regretMetrics || regretMetrics.count < DEFAULT_FEEDBACK_CONFIG.minSampleSize) {
    return null;
  }

  const meanAccuracy = regretMetrics.meanAccuracy;
  if (meanAccuracy > 0.6) return null; // Acceptable for regret

  const incorrectPredictions = analyses.filter(a => {
    const regretMeasurement = a.measurements.get(AccuracyType.REGRET_PREDICTION);
    return regretMeasurement?.result === ComparisonResult.INCORRECT;
  });

  if (incorrectPredictions.length > regretMetrics.count * 0.4) {
    return {
      id: `regret_error_pattern_${Date.now()}`,
      type: LearningSignalType.REGRET_ERROR_PATTERN,
      priority: 'medium',
      description: `Poor regret prediction accuracy: ${(meanAccuracy * 100).toFixed(1)}%`,
      explanation: `The system is incorrectly predicting regret ${((1 - meanAccuracy) * 100).toFixed(1)}% of the time. ` +
        `This suggests the regret prediction model needs refinement.`,
      evidence: {
        affectedRecommendations: incorrectPredictions.map(a => a.id),
        sampleSize: regretMetrics.count,
        confidence: 0.75,
      },
      suggestedAction: 'Review regret prediction indicators. Consider additional factors like path switching behavior.',
      expectedImpact: 'Better regret prediction to minimize poor recommendations.',
      generatedAt: Date.now(),
    };
  }

  return null;
}

// ============================================================================
// IMPROVEMENT SIGNAL GENERATION
// ============================================================================

/**
 * Generate improvement signals from metrics.
 */
export function generateImprovementSignals(
  metrics: AggregateAccuracyMetrics
): RecommendationImprovementSignal[] {
  const signals: RecommendationImprovementSignal[] = [];

  // Path ranking improvement
  const pathRankingSignal = generatePathRankingSignal(metrics);
  if (pathRankingSignal) signals.push(pathRankingSignal);

  // Confidence scoring improvement
  const confidenceSignal = generateConfidenceScoringSignal(metrics);
  if (confidenceSignal) signals.push(confidenceSignal);

  // Utility prediction improvement
  const utilitySignal = generateUtilityPredictionSignal(metrics);
  if (utilitySignal) signals.push(utilitySignal);

  // Regret prediction improvement
  const regretSignal = generateRegretPredictionSignal(metrics);
  if (regretSignal) signals.push(regretSignal);

  return signals;
}

/**
 * Generate path ranking improvement signal.
 */
function generatePathRankingSignal(
  metrics: AggregateAccuracyMetrics
): RecommendationImprovementSignal | null {
  const pathChoiceMetrics = metrics.accuracyByType.get(AccuracyType.PATH_CHOICE);
  if (!pathChoiceMetrics) return null;

  const currentPerformance = metrics.followRate;
  if (currentPerformance > 0.7) return null; // Already good

  return {
    id: `improve_path_ranking_${Date.now()}`,
    area: ImprovementArea.PATH_RANKING,
    currentPerformance,
    targetPerformance: 0.75,
    performanceGap: 0.75 - currentPerformance,
    affectedRecommendationTypes: ['path_ranking', 'career_recommendation'],
    recommendedAdjustment: 'Increase weight of student preference alignment in ranking algorithm',
    expectedImprovement: Math.min(0.75 - currentPerformance, 0.15),
  };
}

/**
 * Generate confidence scoring improvement signal.
 */
function generateConfidenceScoringSignal(
  metrics: AggregateAccuracyMetrics
): RecommendationImprovementSignal | null {
  const ece = metrics.confidenceCalibration.expectedCalibrationError;
  if (ece < 0.1) return null; // Well calibrated

  const currentPerformance = 1 - ece;

  return {
    id: `improve_confidence_${Date.now()}`,
    area: ImprovementArea.CONFIDENCE_SCORING,
    currentPerformance,
    targetPerformance: 0.9,
    performanceGap: 0.9 - currentPerformance,
    affectedRecommendationTypes: ['confidence_scoring'],
    recommendedAdjustment: 'Apply calibration curve adjustment to confidence scores',
    expectedImprovement: Math.min(ece * 0.7, 0.1),
  };
}

/**
 * Generate utility prediction improvement signal.
 */
function generateUtilityPredictionSignal(
  metrics: AggregateAccuracyMetrics
): RecommendationImprovementSignal | null {
  const utilityMetrics = metrics.accuracyByType.get(AccuracyType.UTILITY_PREDICTION);
  if (!utilityMetrics) return null;

  const currentPerformance = utilityMetrics.meanAccuracy;
  if (currentPerformance > 0.75) return null;

  return {
    id: `improve_utility_${Date.now()}`,
    area: ImprovementArea.UTILITY_PREDICTION,
    currentPerformance,
    targetPerformance: 0.8,
    performanceGap: 0.8 - currentPerformance,
    affectedRecommendationTypes: ['utility_prediction', 'career_recommendation'],
    recommendedAdjustment: 'Include more outcome factors in utility calculation',
    expectedImprovement: Math.min(0.8 - currentPerformance, 0.1),
  };
}

/**
 * Generate regret prediction improvement signal.
 */
function generateRegretPredictionSignal(
  metrics: AggregateAccuracyMetrics
): RecommendationImprovementSignal | null {
  const regretMetrics = metrics.accuracyByType.get(AccuracyType.REGRET_PREDICTION);
  if (!regretMetrics) return null;

  const currentPerformance = regretMetrics.meanAccuracy;
  if (currentPerformance > 0.65) return null;

  return {
    id: `improve_regret_${Date.now()}`,
    area: ImprovementArea.REGRET_PREDICTION,
    currentPerformance,
    targetPerformance: 0.7,
    performanceGap: 0.7 - currentPerformance,
    affectedRecommendationTypes: ['regret_prediction', 'career_recommendation'],
    recommendedAdjustment: 'Add path-switching behavior as regret indicator',
    expectedImprovement: Math.min(0.7 - currentPerformance, 0.08),
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert priority to numeric weight for sorting.
 */
function priorityWeight(priority: string): number {
  switch (priority) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}
