/**
 * Recommendation Feedback Loop Engine
 *
 * Compares recommendations against actual outcomes.
 *
 * Purpose:
 *   - Track recommendation accuracy
 *   - Measure prediction quality
 *   - Generate learning signals for improvement
 *
 * Design Principles:
 *   - No machine learning - only transparent measurement
 *   - All calculations are explainable
 *   - Conservative confidence estimates
 *   - Clear audit trail
 *
 * Example Usage:
 *   const engine = new RecommendationFeedbackEngine();
 *   const result = engine.analyze({
 *     recommendations: recommendationHistory,
 *     outcomes: outcomeRecords,
 *   });
 *   console.log(result.aggregateMetrics.overallAccuracy);
 *   console.log(result.learningSignals);
 */

import type {
  CareerRecommendation,
  BeliefTimestamp,
} from '../types/index.js';

import type { OutcomeRecord } from '../outcome-tracking-engine/OutcomeTrackingEngineV1.js';

import type {
  FeedbackLoopInput,
  FeedbackLoopOutput,
  RecommendationOutcomePair,
  RecommendationAccuracyAnalysis,
  AggregateAccuracyMetrics,
  LearningSignal,
  RecommendationImprovementSignal,
  AccuracyMeasurement,
  ConfidenceCalibration,
  TypeAccuracyMetrics,
  PathAccuracyMetrics,
  SegmentAccuracyMetrics,
  CalibrationMetrics,
  RecommendationFeedbackConfig,
} from './types.js';

import { DEFAULT_FEEDBACK_CONFIG, AccuracyType, ComparisonResult } from './types.js';

import {
  measurePathChoiceAccuracy,
  measureSatisfactionAccuracy,
  measureUtilityAccuracy,
  measureRegretAccuracy,
  measureConfidenceCalibration,
  calculateCalibrationMetrics,
  calculateTypeAccuracyMetrics,
  calculatePathAccuracyMetrics,
  calculateOverallAccuracy,
} from './measurements.js';

import {
  generateLearningSignals,
  generateImprovementSignals,
} from './signals.js';

// ============================================================================
// RECOMMENDATION FEEDBACK ENGINE
// ============================================================================

/**
 * Engine for analyzing recommendation accuracy and generating learning signals.
 */
export class RecommendationFeedbackEngine {
  private config: RecommendationFeedbackConfig;

  constructor(config: Partial<RecommendationFeedbackConfig> = {}) {
    this.config = { ...DEFAULT_FEEDBACK_CONFIG, ...config };
  }

  /**
   * Get current configuration.
   */
  getConfig(): RecommendationFeedbackConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<RecommendationFeedbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ========================================================================
  // MAIN API: ANALYZE
  // ========================================================================

  /**
   * Analyze recommendations against outcomes.
   *
   * This is the primary API for the feedback loop.
   */
  analyze(input: FeedbackLoopInput): FeedbackLoopOutput {
    const startedAt = Date.now();

    // Filter records by age and options
    const filteredRecommendations = this.filterRecommendations(
      input.recommendations,
      input.options
    );
    const filteredOutcomes = this.filterOutcomes(input.outcomes, input.options);

    // Match recommendations to outcomes
    const pairs = this.matchRecommendationsToOutcomes(
      filteredRecommendations,
      filteredOutcomes
    );

    // Analyze each pair
    const analyses = this.analyzePairs(pairs);

    // Calculate aggregate metrics
    const aggregateMetrics = this.calculateAggregateMetrics(analyses, pairs);

    // Generate signals
    const learningSignals = input.options?.generateSignals !== false
      ? generateLearningSignals(aggregateMetrics, analyses, this.config.signalThresholds)
      : [];

    const improvementSignals = input.options?.generateSignals !== false
      ? generateImprovementSignals(aggregateMetrics)
      : [];

    const completedAt = Date.now();

    return {
      analyses,
      aggregateMetrics,
      learningSignals,
      improvementSignals,
      metadata: {
        startedAt,
        completedAt,
        durationMs: completedAt - startedAt,
        parameters: input,
      },
    };
  }

  /**
   * Quick accuracy check for a single recommendation-outcome pair.
   */
  analyzeSingle(
    recommendation: CareerRecommendation,
    outcome: OutcomeRecord
  ): RecommendationAccuracyAnalysis {
    const pair = this.createPair(recommendation, outcome);
    return this.analyzePair(pair);
  }

  /**
   * Get aggregate metrics for a set of analyses.
   */
  getAggregateMetrics(
    analyses: RecommendationAccuracyAnalysis[]
  ): AggregateAccuracyMetrics {
    const pairs = analyses.map(a => a.pair);
    return this.calculateAggregateMetrics(analyses, pairs);
  }

  // ========================================================================
  // PAIRING & MATCHING
  // ========================================================================

  /**
   * Match recommendations to their corresponding outcomes.
   */
  private matchRecommendationsToOutcomes(
    recommendations: CareerRecommendation[],
    outcomes: OutcomeRecord[]
  ): RecommendationOutcomePair[] {
    const pairs: RecommendationOutcomePair[] = [];

    for (const recommendation of recommendations) {
      // Find matching outcome by recommendation ID or student ID
      const outcome = outcomes.find(
        o =>
          o.recommendationId === recommendation.id ||
          o.studentIdHash === recommendation.studentId
      );

      if (outcome) {
        pairs.push(this.createPair(recommendation, outcome));
      }
    }

    return pairs;
  }

  /**
   * Create a recommendation-outcome pair.
   */
  private createPair(
    recommendation: CareerRecommendation,
    outcome: OutcomeRecord
  ): RecommendationOutcomePair {
    return {
      id: `pair_${recommendation.id}_${outcome.id}`,
      recommendation,
      outcome,
      followedRecommendation: recommendation.path.id === outcome.chosenPathId,
      recommendedPathId: recommendation.path.id,
      chosenPathId: outcome.chosenPathId,
      analyzedAt: Date.now(),
    };
  }

  // ========================================================================
  // ANALYSIS
  // ========================================================================

  /**
   * Analyze all pairs.
   */
  private analyzePairs(pairs: RecommendationOutcomePair[]): RecommendationAccuracyAnalysis[] {
    return pairs.map(pair => this.analyzePair(pair));
  }

  /**
   * Analyze a single pair.
   */
  private analyzePair(pair: RecommendationOutcomePair): RecommendationAccuracyAnalysis {
    const measurements = new Map<AccuracyType, AccuracyMeasurement>();

    // Path choice accuracy
    const pathChoiceMeasurement = measurePathChoiceAccuracy(
      pair.recommendation,
      pair.outcome
    );
    measurements.set(AccuracyType.PATH_CHOICE, pathChoiceMeasurement);

    // Satisfaction prediction accuracy
    const satisfactionMeasurement = measureSatisfactionAccuracy(
      pair.recommendation,
      pair.outcome,
      this.config.predictionTolerance
    );
    measurements.set(AccuracyType.SATISFACTION_PREDICTION, satisfactionMeasurement);

    // Utility prediction accuracy
    const utilityMeasurement = measureUtilityAccuracy(
      pair.recommendation,
      pair.outcome,
      this.config.predictionTolerance
    );
    measurements.set(AccuracyType.UTILITY_PREDICTION, utilityMeasurement);

    // Regret prediction accuracy
    const regretMeasurement = measureRegretAccuracy(
      pair.recommendation,
      pair.outcome
    );
    measurements.set(AccuracyType.REGRET_PREDICTION, regretMeasurement);

    // Overall accuracy
    const overallAccuracy = calculateOverallAccuracy(Array.from(measurements.values()));

    // Confidence calibration
    const calibration = measureConfidenceCalibration(
      pair.recommendation,
      overallAccuracy,
      this.config.calibrationThresholds
    );

    return {
      id: `analysis_${pair.id}`,
      pair,
      measurements,
      overallAccuracy,
      byCategory: {
        pathChoice: pathChoiceMeasurement,
        satisfactionPrediction: satisfactionMeasurement,
        utilityPrediction: utilityMeasurement,
        regretPrediction: regretMeasurement,
        confidenceCalibration: {
          type: AccuracyType.CONFIDENCE_CALIBRATION,
          result: calibration.isWellCalibrated ? ComparisonResult.CORRECT : ComparisonResult.PARTIAL,
          score: 1 - Math.abs(calibration.calibrationError),
          predicted: calibration.predictedConfidence,
          actual: calibration.actualAccuracy,
          error: calibration.calibrationError,
          absoluteError: Math.abs(calibration.calibrationError),
          withinTolerance: calibration.isWellCalibrated,
          explanation: `Confidence ${calibration.predictedConfidence.toFixed(2)}, ` +
            `actual accuracy ${calibration.actualAccuracy.toFixed(2)}, ` +
            `calibration ${calibration.assessment}`,
        },
      },
      calibration,
      analyzedAt: Date.now(),
    };
  }

  // ========================================================================
  // AGGREGATE METRICS
  // ========================================================================

  /**
   * Calculate aggregate metrics from analyses.
   */
  private calculateAggregateMetrics(
    analyses: RecommendationAccuracyAnalysis[],
    pairs: RecommendationOutcomePair[]
  ): AggregateAccuracyMetrics {
    const now = Date.now();
    const allMeasurements = analyses.flatMap(a => Array.from(a.measurements.values()));

    // Basic counts
    const totalRecommendations = pairs.length;
    const recommendationsWithOutcomes = pairs.length;
    const followedRecommendations = pairs.filter(p => p.followedRecommendation).length;
    const followRate = totalRecommendations > 0 ? followedRecommendations / totalRecommendations : 0;

    // Accuracy by type
    const accuracyByType = new Map<AccuracyType, TypeAccuracyMetrics>();
    for (const type of Object.values(AccuracyType)) {
      const metrics = calculateTypeAccuracyMetrics(
        type,
        allMeasurements.filter(m => m.type === type)
      );
      accuracyByType.set(type, metrics);
    }

    // Overall accuracy
    const overallAccuracy = calculateOverallAccuracy(allMeasurements);

    // Confidence calibration
    const calibrations = analyses.map(a => a.calibration);
    const confidenceCalibration = calculateCalibrationMetrics(calibrations);

    // Metrics by path
    const metricsByPath = new Map<string, PathAccuracyMetrics>();
    const uniquePaths = [...new Set(pairs.map(p => p.recommendedPathId))];
    for (const pathId of uniquePaths) {
      const pathMetrics = calculatePathAccuracyMetrics(
        pathId,
        pairs.filter(p => p.recommendedPathId === pathId)
      );
      metricsByPath.set(pathId, pathMetrics);
    }

    // Metrics by segment (placeholder - would need actual segmentation logic)
    const metricsBySegment = new Map<string, SegmentAccuracyMetrics>();

    return {
      period: { start: now - this.config.maxOutcomeAge, end: now },
      totalRecommendations,
      recommendationsWithOutcomes,
      followedRecommendations,
      followRate,
      accuracyByType,
      overallAccuracy,
      confidenceCalibration,
      metricsByPath,
      metricsBySegment,
    };
  }

  // ========================================================================
  // FILTERING
  // ========================================================================

  /**
   * Filter recommendations based on options.
   */
  private filterRecommendations(
    recommendations: CareerRecommendation[],
    options?: FeedbackLoopInput['options']
  ): CareerRecommendation[] {
    return recommendations.filter(r => {
      // Filter by confidence
      if (options?.minConfidence && r.confidence < options.minConfidence) {
        return false;
      }

      // Filter by time window
      if (options?.timeWindow) {
        if (
          r.generatedAt < options.timeWindow.start ||
          r.generatedAt > options.timeWindow.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Filter outcomes based on options.
   */
  private filterOutcomes(
    outcomes: OutcomeRecord[],
    options?: FeedbackLoopInput['options']
  ): OutcomeRecord[] {
    const cutoff = Date.now() - this.config.maxOutcomeAge;

    return outcomes.filter(o => {
      // Filter by age
      if (o.metadata.createdAt < cutoff) {
        return false;
      }

      // Filter by path
      if (options?.pathFilter && !options.pathFilter.includes(o.chosenPathId)) {
        return false;
      }

      // Filter by completeness
      if (!this.config.includeIncompleteOutcomes && o.status !== 'COMPLETED') {
        return false;
      }

      // Filter by time window
      if (options?.timeWindow) {
        if (
          o.decisionTimestamp < options.timeWindow.start ||
          o.decisionTimestamp > options.timeWindow.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  // ========================================================================
  // REPORTING
  // ========================================================================

  /**
   * Generate a summary report.
   */
  generateReport(output: FeedbackLoopOutput): string {
    const metrics = output.aggregateMetrics;

    const lines: string[] = [];
    lines.push('=== Recommendation Feedback Loop Report ===');
    lines.push('');

    lines.push(`Analysis Period: ${new Date(metrics.period.start).toISOString()} to ${new Date(metrics.period.end).toISOString()}`);
    lines.push(`Total Recommendations: ${metrics.totalRecommendations}`);
    lines.push(`Recommendations with Outcomes: ${metrics.recommendationsWithOutcomes}`);
    lines.push(`Follow Rate: ${(metrics.followRate * 100).toFixed(1)}%`);
    lines.push(`Overall Accuracy: ${(metrics.overallAccuracy * 100).toFixed(1)}%`);
    lines.push('');

    lines.push('Accuracy by Type:');
    for (const [type, typeMetrics] of metrics.accuracyByType) {
      lines.push(`  ${type}: ${(typeMetrics.meanAccuracy * 100).toFixed(1)}% (${typeMetrics.count} samples)`);
    }
    lines.push('');

    lines.push('Confidence Calibration:');
    lines.push(`  Well Calibrated: ${(metrics.confidenceCalibration.wellCalibratedRate * 100).toFixed(1)}%`);
    lines.push(`  Overconfident: ${(metrics.confidenceCalibration.overconfidentRate * 100).toFixed(1)}%`);
    lines.push(`  Underconfident: ${(metrics.confidenceCalibration.underconfidentRate * 100).toFixed(1)}%`);
    lines.push(`  ECE: ${metrics.confidenceCalibration.expectedCalibrationError.toFixed(3)}`);
    lines.push('');

    if (output.learningSignals.length > 0) {
      lines.push(`Learning Signals (${output.learningSignals.length}):`);
      for (const signal of output.learningSignals.slice(0, 5)) {
        lines.push(`  [${signal.priority.toUpperCase()}] ${signal.description}`);
      }
      lines.push('');
    }

    if (output.improvementSignals.length > 0) {
      lines.push(`Improvement Opportunities (${output.improvementSignals.length}):`);
      for (const signal of output.improvementSignals.slice(0, 5)) {
        lines.push(`  ${signal.area}: ${(signal.currentPerformance * 100).toFixed(1)}% -> ${(signal.targetPerformance * 100).toFixed(1)}%`);
      }
    }

    return lines.join('\n');
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new RecommendationFeedbackEngine instance.
 */
export function createRecommendationFeedbackEngine(
  config?: Partial<RecommendationFeedbackConfig>
): RecommendationFeedbackEngine {
  return new RecommendationFeedbackEngine(config);
}

/**
 * Quick analysis with default settings.
 */
export function quickAnalyze(
  recommendations: CareerRecommendation[],
  outcomes: OutcomeRecord[]
): FeedbackLoopOutput {
  const engine = new RecommendationFeedbackEngine();
  return engine.analyze({ recommendations, outcomes });
}

/**
 * Calculate simple accuracy metric.
 */
export function calculateSimpleAccuracy(
  recommendations: CareerRecommendation[],
  outcomes: OutcomeRecord[]
): number {
  let matches = 0;
  let total = 0;

  for (const rec of recommendations) {
    const outcome = outcomes.find(
      o => o.recommendationId === rec.id || o.studentIdHash === rec.studentId
    );

    if (outcome) {
      total++;
      if (rec.path.id === outcome.chosenPathId) {
        matches++;
      }
    }
  }

  return total > 0 ? matches / total : 0;
}
