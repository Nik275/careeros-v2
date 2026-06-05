/**
 * CareerOS Outcome Learning Engine - Main Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Central orchestration engine that coordinates all outcome learning
 * components and provides a unified API for the CareerOS system.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type OutcomeLearningConfig,
  type OutcomeLearningSignal,
  type RawFeedback,
  type ProcessedFeedback,
  type LearningReport,
  type RecommendationLearningReport,
  type DecisionLearningReport,
  type CalibrationMetrics,
  type LearningAnalytics,
  type IOutcomeLearningEngine,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

import {
  type StudentId,
  type RecommendationId,
  type OutcomeEvent,
} from '../outcome-tracking/outcome-types.js';

import {
  FeedbackIngestionEngine,
  createFeedbackIngestionEngine,
  outcomeEventToFeedback,
} from './feedback-ingestion-engine.js';

import {
  RecommendationLearningEngine,
  createRecommendationLearningEngine,
} from './recommendation-learning-engine.js';

import {
  DecisionLearningEngine,
  createDecisionLearningEngine,
} from './decision-learning-engine.js';

import {
  ConfidenceCalibrationEngine,
  createConfidenceCalibrationEngine,
} from './confidence-calibration-engine.js';

import {
  OutcomeWeightEngine,
  createOutcomeWeightEngine,
} from './outcome-weight-engine.js';

import {
  LearningSignalEngine,
  createLearningSignalEngine,
} from './learning-signal-engine.js';

import {
  LearningReportEngine,
  createLearningReportEngine,
} from './learning-report-engine.js';

// ============================================================================
// OUTCOME LEARNING ENGINE
// ============================================================================

/**
 * Outcome Learning Engine
 *
 * Central orchestration engine for the CareerOS Outcome Learning System.
 */
class OutcomeLearningEngine implements IOutcomeLearningEngine {
  private config: OutcomeLearningConfig;
  
  // Sub-engines
  private feedbackEngine: FeedbackIngestionEngine;
  private recommendationEngine: RecommendationLearningEngine;
  private decisionEngine: DecisionLearningEngine;
  private calibrationEngine: ConfidenceCalibrationEngine;
  private weightEngine: OutcomeWeightEngine;
  private signalEngine: LearningSignalEngine;
  private reportEngine: LearningReportEngine;

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };

    // Initialize sub-engines
    this.feedbackEngine = createFeedbackIngestionEngine(this.config);
    this.recommendationEngine = createRecommendationLearningEngine(this.config);
    this.decisionEngine = createDecisionLearningEngine(this.config);
    this.calibrationEngine = createConfidenceCalibrationEngine(this.config);
    this.weightEngine = createOutcomeWeightEngine(this.config);
    this.signalEngine = createLearningSignalEngine(this.config);
    this.reportEngine = createLearningReportEngine(this.config);

    // Set up signal handlers
    this.setupSignalHandlers();
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Get current configuration
   */
  getConfig(): OutcomeLearningConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OutcomeLearningConfig>): void {
    this.config = { ...this.config, ...updates };
    // Note: Sub-engines would need to be updated or recreated in a full implementation
  }

  // ============================================================================
  // FEEDBACK INGESTION
  // ============================================================================

  /**
   * Ingest single feedback item
   */
  async ingestFeedback(feedback: RawFeedback): Promise<void> {
    const processed = await this.feedbackEngine.ingest(feedback);
    
    // Generate and process signals
    if (this.config.learning.signalProcessingEnabled) {
      this.signalEngine.generateSignals(processed);
    }
  }

  /**
   * Ingest batch of feedback
   */
  async ingestFeedbackBatch(feedbacks: RawFeedback[]): Promise<void> {
    const processed = await this.feedbackEngine.ingestBatch(feedbacks);
    
    if (this.config.learning.signalProcessingEnabled) {
      for (const p of processed) {
        this.signalEngine.generateSignals(p);
      }
    }
  }

  /**
   * Ingest outcome event directly
   */
  async ingestOutcomeEvent(event: OutcomeEvent): Promise<void> {
    const feedback = outcomeEventToFeedback(event);
    await this.ingestFeedback(feedback);
  }

  // ============================================================================
  // LEARNING
  // ============================================================================

  /**
   * Learn from all accumulated outcomes
   */
  async learnFromOutcomes(): Promise<void> {
    // Process all pending feedback
    await this.feedbackEngine.processPending();

    // Process all signals
    if (this.config.learning.signalProcessingEnabled) {
      this.signalEngine.processSignals();
    }

    // Apply learning
    if (this.config.learning.weightAdjustmentEnabled) {
      this.signalEngine.applyLearning();
    }

    // Update weights
    const signals = this.signalEngine.getAllSignals();
    this.weightEngine.updateWeights(signals);

    // Calibrate if enabled
    if (this.config.learning.autoCalibrationEnabled) {
      await this.calibrateConfidence();
    }
  }

  /**
   * Calibrate confidence predictions
   */
  async calibrateConfidence(): Promise<CalibrationMetrics> {
    return this.calibrationEngine.calculateMetrics();
  }

  /**
   * Update factor weights
   */
  async updateWeights(): Promise<void> {
    const signals = this.signalEngine.getAllSignals();
    this.weightEngine.updateWeights(signals);
  }

  // ============================================================================
  // REPORTS
  // ============================================================================

  /**
   * Generate comprehensive learning report
   */
  async generateLearningReport(): Promise<LearningReport> {
    const now = Date.now();
    const period = {
      start: now - this.config.reports.minPeriodDays * 24 * 60 * 60 * 1000,
      end: now,
    };

    return this.reportEngine.generateReport(period);
  }

  /**
   * Generate recommendation learning report
   */
  async generateRecommendationReport(): Promise<RecommendationLearningReport> {
    const now = Date.now();
    const period = {
      start: now - 30 * 24 * 60 * 60 * 1000, // Last 30 days
      end: now,
    };

    return this.recommendationEngine.generateReport(period);
  }

  /**
   * Generate decision learning report
   */
  async generateDecisionReport(): Promise<DecisionLearningReport> {
    const now = Date.now();
    const period = {
      start: now - 30 * 24 * 60 * 60 * 1000,
      end: now,
    };

    return this.decisionEngine.generateReport(period);
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get comprehensive analytics
   */
  async getAnalytics(): Promise<LearningAnalytics> {
    const calibrationMetrics = this.calibrationEngine.calculateMetrics();
    const recStats = this.recommendationEngine.getStats();
    const decStats = this.decisionEngine.getStats();
    const signalStats = this.signalEngine.getStats();
    const weightStats = this.weightEngine.getStats();

    return {
      recommendations: {
        total: recStats.totalEntries,
        accuracy: recStats.averageAccuracy,
        utility: recStats.averageAccuracy * 0.8, // Approximation
        stability: 85, // Placeholder
      },
      decisions: {
        total: decStats.totalEntries,
        quality: decStats.averageQuality,
        regretRate: decStats.regretRate,
        opportunityCapture: 100 - decStats.regretRate,
      },
      predictions: {
        total: signalStats.totalSignals,
        accuracy: recStats.averageAccuracy,
        calibration: 100 - calibrationMetrics.expectedCalibrationError * 100,
        bias: calibrationMetrics.bias.direction,
      },
      calibration: {
        quality: 100 - calibrationMetrics.expectedCalibrationError * 100,
        reliability: calibrationMetrics.brierScore > 0 ? 100 - calibrationMetrics.brierScore * 100 : 100,
        adjustmentsMade: this.calibrationEngine.getStats().totalEntries,
      },
      learning: {
        velocity: weightStats.modelConfidence,
        progress: signalStats.appliedLearnings / Math.max(1, signalStats.totalSignals),
        coverage: recStats.uniqueCareers / 100, // Approximation
        depth: weightStats.modelConfidence,
      },
      outcomes: {
        quality: decStats.averageQuality,
        satisfaction: 100 - decStats.regretRate,
        success: recStats.averageAccuracy,
      },
    };
  }

  /**
   * Get calibration metrics
   */
  async getCalibrationMetrics(): Promise<CalibrationMetrics> {
    return this.calibrationEngine.calculateMetrics();
  }

  // ============================================================================
  // SIGNALS
  // ============================================================================

  /**
   * Get pending signals
   */
  getPendingSignals(): OutcomeLearningSignal[] {
    return this.signalEngine.getPendingSignals();
  }

  /**
   * Process pending signals
   */
  async processSignals(): Promise<void> {
    this.signalEngine.processSignals();
  }

  /**
   * Get signals by type
   */
  getSignalsByType(type: OutcomeLearningSignal['signalType']): OutcomeLearningSignal[] {
    return this.signalEngine.getSignalsByType(type);
  }

  // ============================================================================
  // ACCESSORS
  // ============================================================================

  /**
   * Get feedback ingestion engine
   */
  getFeedbackEngine(): FeedbackIngestionEngine {
    return this.feedbackEngine;
  }

  /**
   * Get recommendation learning engine
   */
  getRecommendationEngine(): RecommendationLearningEngine {
    return this.recommendationEngine;
  }

  /**
   * Get decision learning engine
   */
  getDecisionEngine(): DecisionLearningEngine {
    return this.decisionEngine;
  }

  /**
   * Get calibration engine
   */
  getCalibrationEngine(): ConfidenceCalibrationEngine {
    return this.calibrationEngine;
  }

  /**
   * Get weight engine
   */
  getWeightEngine(): OutcomeWeightEngine {
    return this.weightEngine;
  }

  /**
   * Get signal engine
   */
  getSignalEngine(): LearningSignalEngine {
    return this.signalEngine;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupSignalHandlers(): void {
    // Register handlers for different target engines
    this.signalEngine.registerHandler('RECOMMENDATION', (signal) => {
      // Handle recommendation signals
      console.debug(`Recommendation signal received: ${signal.signalId}`);
    });

    this.signalEngine.registerHandler('DECISION', (signal) => {
      // Handle decision signals
      console.debug(`Decision signal received: ${signal.signalId}`);
    });

    this.signalEngine.registerHandler('CALIBRATION', (signal) => {
      // Handle calibration signals
      if (typeof signal.payload.predictedOutcome === 'number') {
        this.calibrationEngine.recordEntry({
          entryId: `cal-${Date.now()}`,
          timestamp: Date.now(),
          predictionId: signal.signalId,
          statedConfidence: signal.payload.predictedOutcome,
          confidenceBin: `${Math.floor(signal.payload.predictedOutcome / 10) * 10}-${Math.ceil(signal.payload.predictedOutcome / 10) * 10}`,
          outcome: signal.payload.actualOutcome === 100,
          actualProbability: signal.payload.actualOutcome as number,
          expectedSuccesses: signal.payload.predictedOutcome / 100,
          actualSuccesses: signal.payload.actualOutcome === 100 ? 1 : 0,
          calibrationError: signal.payload.errorMagnitude,
        });
      }
    });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create outcome learning engine
 */
export function createOutcomeLearningEngine(
  config?: Partial<OutcomeLearningConfig>
): OutcomeLearningEngine {
  return new OutcomeLearningEngine(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  OutcomeLearningEngine,
};
