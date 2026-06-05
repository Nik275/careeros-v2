/**
 * CareerOS - Outcome Tracking Engine
 *
 * Phase: Outcome Tracking Engine
 *
 * Main engine that orchestrates all outcome tracking sub-engines.
 *
 * Track: Recommendation → Decision → Action → Outcome
 *
 * @module outcome-tracking-engine
 * @version 1.0.0
 */

import type {
  RecommendationEvent,
  DecisionEvent,
  ActionEvent,
  OutcomeEvent,
  OutcomeRecord,
  OutcomeRecordId,
  TrackingEventId,
  StudentId,
} from '../types/outcome-tracking-types';
import type { RecommendationId } from '../../recommendation/recommendation-types';
import type {
  PatternLearningRequest,
  PatternLearningResult,
  InsightGenerationRequest,
  InsightGenerationResult,
} from '../types/learning-engine-types';
import type { CalibrationReport } from '../types/confidence-calibration-types';
import type { RecommendationQualityReport } from '../types/recommendation-quality-types';
import type { CohortId, Cohort, CreateCohortRequest, CreateCohortResult } from '../types/cohort-engine-types';
import type { AggregateCohortAnalysis, AggregateInsight } from '../types/privacy-aggregation-types';

import { RecommendationTracker } from './recommendation-tracker';
import { DecisionTracker } from './decision-tracker';
import { ActionTracker } from './action-tracker';
import { OutcomeTracker } from './outcome-tracker';
import { FeedbackEngine } from './feedback-engine';
import { LearningEngineImpl } from './learning-engine';
import { ConfidenceCalibrationEngineImpl } from './confidence-calibration-engine';
import { RecommendationQualityEngineImpl } from './recommendation-quality-engine';
import { CohortEngineImpl } from './cohort-engine';
import { PrivacyAggregationEngineImpl } from './privacy-aggregation-engine';

/**
 * Configuration for the Outcome Tracking Engine.
 */
export interface OutcomeTrackingEngineConfig {
  /** Enable learning from outcomes */
  enableLearning: boolean;

  /** Enable confidence calibration */
  enableCalibration: boolean;

  /** Enable quality tracking */
  enableQualityTracking: boolean;

  /** Enable cohort analysis */
  enableCohorts: boolean;

  /** Minimum sample size for learning */
  minSampleSizeForLearning: number;

  /** Calibration check interval (days) */
  calibrationIntervalDays: number;

  /** Privacy level for aggregations */
  privacyLevel: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

  /** Data retention period (days) */
  dataRetentionDays: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_OUTCOME_TRACKING_CONFIG: OutcomeTrackingEngineConfig = {
  enableLearning: true,
  enableCalibration: true,
  enableQualityTracking: true,
  enableCohorts: true,
  minSampleSizeForLearning: 100,
  calibrationIntervalDays: 30,
  privacyLevel: 'INTERNAL',
  dataRetentionDays: 365 * 5, // 5 years
};

/**
 * Outcome Tracking Engine - Main orchestrator.
 *
 * Coordinates all sub-engines to track recommendations through to outcomes,
 * learn from results, and continuously improve recommendation quality.
 */
export class OutcomeTrackingEngine {
  private config: OutcomeTrackingEngineConfig;

  // Sub-engines
  private recommendationTracker: RecommendationTracker;
  private decisionTracker: DecisionTracker;
  private actionTracker: ActionTracker;
  private outcomeTracker: OutcomeTracker;
  private feedbackEngine: FeedbackEngine;
  private learningEngine: LearningEngineImpl;
  private calibrationEngine: ConfidenceCalibrationEngineImpl;
  private qualityEngine: RecommendationQualityEngineImpl;
  private cohortEngine: CohortEngineImpl;
  private privacyEngine: PrivacyAggregationEngineImpl;

  // Event chains (in-memory, would be database in production)
  private eventChains: Map<TrackingEventId, {
    recommendation?: RecommendationEvent;
    decision?: DecisionEvent;
    action?: ActionEvent;
    outcome?: OutcomeEvent;
  }> = new Map();

  constructor(config: Partial<OutcomeTrackingEngineConfig> = {}) {
    this.config = { ...DEFAULT_OUTCOME_TRACKING_CONFIG, ...config };

    // Initialize sub-engines
    this.recommendationTracker = new RecommendationTracker();
    this.decisionTracker = new DecisionTracker();
    this.actionTracker = new ActionTracker();
    this.outcomeTracker = new OutcomeTracker();
    this.feedbackEngine = new FeedbackEngine();
    this.learningEngine = new LearningEngineImpl();
    this.calibrationEngine = new ConfidenceCalibrationEngineImpl();
    this.qualityEngine = new RecommendationQualityEngineImpl();
    this.cohortEngine = new CohortEngineImpl();
    this.privacyEngine = new PrivacyAggregationEngineImpl();
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track a recommendation event.
   *
   * Records when a recommendation is presented to a student.
   */
  async trackRecommendation(event: RecommendationEvent): Promise<TrackingEventId> {
    const eventId = await this.recommendationTracker.track(event);

    // Initialize event chain
    this.eventChains.set(eventId, { recommendation: event });

    return eventId;
  }

  /**
   * Track a decision event.
   *
   * Records when a student makes a decision about a recommendation.
   */
  async trackDecision(event: DecisionEvent): Promise<TrackingEventId> {
    const eventId = await this.decisionTracker.track(event);

    // Update event chain
    const chain = this.eventChains.get(event.recommendationEventId) || {};
    chain.decision = event;
    this.eventChains.set(event.recommendationEventId, chain);

    // Trigger feedback analysis
    await this.feedbackEngine.analyzeDecision(event);

    return eventId;
  }

  /**
   * Track an action event.
   *
   * Records actions taken by a student toward their career goal.
   */
  async trackAction(event: ActionEvent): Promise<TrackingEventId> {
    const eventId = await this.actionTracker.track(event);

    // Update event chain
    const chain = this.getChainByDecisionId(event.decisionEventId);
    if (chain) {
      chain.action = event;
    }

    return eventId;
  }

  /**
   * Track an outcome event.
   *
   * Records the final outcome achieved by a student.
   */
  async trackOutcome(event: OutcomeEvent): Promise<TrackingEventId> {
    const eventId = await this.outcomeTracker.track(event);

    // Update event chain
    const chain = this.getChainByActionId(event.actionEventId);
    if (chain) {
      chain.outcome = event;

      // Create complete outcome record if all events are present
      if (chain.recommendation && chain.decision && chain.action && chain.outcome) {
        await this.createOutcomeRecord(chain as {
          recommendation: RecommendationEvent;
          decision: DecisionEvent;
          action: ActionEvent;
          outcome: OutcomeEvent;
        });
      }
    }

    return eventId;
  }

  // ============================================================================
  // OUTCOME RECORDS
  // ============================================================================

  /**
   * Get an outcome record by ID.
   */
  async getOutcomeRecord(recordId: OutcomeRecordId): Promise<OutcomeRecord | null> {
    // In production, this would query a database
    // For now, we reconstruct from event chains
    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.recommendation && chain.decision && chain.action && chain.outcome) {
        const record = this.buildOutcomeRecord(chain as {
          recommendation: RecommendationEvent;
          decision: DecisionEvent;
          action: ActionEvent;
          outcome: OutcomeEvent;
        });
        if (record.recordId === recordId) {
          return record;
        }
      }
    }
    return null;
  }

  /**
   * Get outcome records for a student.
   */
  async getStudentOutcomes(studentId: StudentId): Promise<OutcomeRecord[]> {
    const records: OutcomeRecord[] = [];

    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.recommendation?.studentId === studentId &&
          chain.recommendation && chain.decision && chain.action && chain.outcome) {
        records.push(this.buildOutcomeRecord(chain as {
          recommendation: RecommendationEvent;
          decision: DecisionEvent;
          action: ActionEvent;
          outcome: OutcomeEvent;
        }));
      }
    }

    return records;
  }

  /**
   * Get outcome records for a recommendation.
   */
  async getRecommendationOutcomes(recommendationId: RecommendationId): Promise<OutcomeRecord[]> {
    const records: OutcomeRecord[] = [];

    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.recommendation?.recommendationId === recommendationId &&
          chain.recommendation && chain.decision && chain.action && chain.outcome) {
        records.push(this.buildOutcomeRecord(chain as {
          recommendation: RecommendationEvent;
          decision: DecisionEvent;
          action: ActionEvent;
          outcome: OutcomeEvent;
        }));
      }
    }

    return records;
  }

  // ============================================================================
  // LEARNING & INTELLIGENCE
  // ============================================================================

  /**
   * Learn patterns from outcome data.
   */
  async learnPatterns(request: PatternLearningRequest): Promise<PatternLearningResult> {
    if (!this.config.enableLearning) {
      return {
        patterns: [],
        statistics: {
          recordsAnalyzed: 0,
          patternsDiscovered: 0,
          patternsRetained: 0,
          processingTimeMs: 0,
          memoryUsedBytes: 0,
        },
        quality: {
          coveragePercentage: 0,
          averageConfidence: 0,
          diversityScore: 0,
          noveltyScore: 0,
        },
        recommendations: [],
      };
    }

    // Get outcome records for learning
    const records = await this.getOutcomeRecordsForLearning(request);

    return this.learningEngine.learnPatterns({
      ...request,
      outcomeRecords: records,
    });
  }

  /**
   * Generate insights for a student context.
   */
  async generateInsights(request: InsightGenerationRequest): Promise<InsightGenerationResult> {
    return this.learningEngine.generateInsights(request);
  }

  // ============================================================================
  // CALIBRATION
  // ============================================================================

  /**
   * Generate calibration report.
   */
  async generateCalibrationReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<CalibrationReport> {
    if (!this.config.enableCalibration) {
      throw new Error('Calibration is disabled');
    }

    return this.calibrationEngine.generateReport(period);
  }

  /**
   * Get current calibration status.
   */
  async getCalibrationStatus() {
    return this.calibrationEngine.getCalibrationStatus();
  }

  // ============================================================================
  // QUALITY TRACKING
  // ============================================================================

  /**
   * Generate quality report.
   */
  async generateQualityReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<RecommendationQualityReport> {
    if (!this.config.enableQualityTracking) {
      throw new Error('Quality tracking is disabled');
    }

    return this.qualityEngine.generateReport(period);
  }

  // ============================================================================
  // COHORT MANAGEMENT
  // ============================================================================

  /**
   * Create a new cohort.
   */
  async createCohort(request: CreateCohortRequest): Promise<CreateCohortResult> {
    if (!this.config.enableCohorts) {
      throw new Error('Cohort analysis is disabled');
    }

    return this.cohortEngine.createCohort(request);
  }

  /**
   * Get cohort by ID.
   */
  async getCohort(cohortId: CohortId): Promise<Cohort | null> {
    return this.cohortEngine.getCohort(cohortId);
  }

  /**
   * Get privacy-safe cohort analysis.
   */
  async analyzeCohort(cohortId: CohortId): Promise<AggregateCohortAnalysis> {
    return this.privacyEngine.analyzeCohort(cohortId);
  }

  /**
   * Generate privacy-safe insights for cohorts.
   */
  async generateCohortInsights(
    cohortIds: CohortId[],
    insightTypes: string[]
  ): Promise<AggregateInsight[]> {
    return this.privacyEngine.generateInsights(cohortIds, insightTypes);
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get engine health metrics.
   */
  async getHealthMetrics() {
    const totalChains = this.eventChains.size;
    const completeChains = Array.from(this.eventChains.values()).filter(
      chain => chain.recommendation && chain.decision && chain.action && chain.outcome
    ).length;

    return {
      totalEventsTracked: totalChains,
      completeOutcomeChains: completeChains,
      completionRate: totalChains > 0 ? (completeChains / totalChains) * 100 : 0,
      subEngines: {
        learning: this.config.enableLearning,
        calibration: this.config.enableCalibration,
        quality: this.config.enableQualityTracking,
        cohorts: this.config.enableCohorts,
      },
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private getChainByDecisionId(decisionEventId: TrackingEventId) {
    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.decision?.eventId === decisionEventId) {
        return chain;
      }
    }
    return undefined;
  }

  private getChainByActionId(actionEventId: TrackingEventId) {
    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.action?.eventId === actionEventId) {
        return chain;
      }
    }
    return undefined;
  }

  private async createOutcomeRecord(chain: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): Promise<OutcomeRecord> {
    const record = this.buildOutcomeRecord(chain);

    // Store record (in production, save to database)
    // For now, we just have it in memory via the event chain

    // Trigger learning update
    if (this.config.enableLearning) {
      await this.learningEngine.updateWithNewRecord(record);
    }

    // Update calibration
    if (this.config.enableCalibration) {
      await this.calibrationEngine.updateWithOutcome(record);
    }

    // Update quality metrics
    if (this.config.enableQualityTracking) {
      await this.qualityEngine.updateWithOutcome(record);
    }

    return record;
  }

  private buildOutcomeRecord(chain: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): OutcomeRecord {
    const recordId = `rec_${chain.recommendation.recommendationId}_${chain.recommendation.studentId}_${Date.now()}`;

    // Derive insights
    const insights = this.deriveInsights(chain);

    // Extract learning data
    const learningData = this.extractLearningData(chain);

    return {
      recordId,
      events: chain,
      insights,
      learningData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        dataQualityScore: this.calculateDataQualityScore(chain),
        completenessPercentage: 100,
        eligibleForLearning: true,
      },
    };
  }

  private deriveInsights(chain: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }) {
    const recommendationSuccess = chain.outcome.achievedOutcome &&
      chain.outcome.satisfaction.overallSatisfaction >= 60;

    const pathDeviation: 'NONE' | 'MINOR' | 'MAJOR' | 'COMPLETE' =
      chain.decision.selectedOption.matchesRecommendation ? 'NONE' :
      chain.decision.selectedOption.relationshipToRecommendation === 'ADJACENT' ? 'MINOR' :
      chain.decision.selectedOption.relationshipToRecommendation === 'MODIFIED' ? 'MAJOR' : 'COMPLETE';

    return {
      recommendationSuccess,
      pathDeviation,
      successFactors: this.identifySuccessFactors(chain),
      failureFactors: this.identifyFailureFactors(chain),
      unexpectedOutcomes: this.identifyUnexpectedOutcomes(chain),
    };
  }

  private identifySuccessFactors(chain: {
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): string[] {
    const factors: string[] = [];

    if (chain.decision.confidence >= 70) {
      factors.push('High decision confidence');
    }

    if (chain.action.progressStatus.overallProgress >= 80) {
      factors.push('Strong action completion');
    }

    if (chain.outcome.dimensions.careerProgress.score >= 70) {
      factors.push('Good career progress');
    }

    if (chain.outcome.dimensions.skillGrowth.score >= 70) {
      factors.push('Strong skill development');
    }

    return factors;
  }

  private identifyFailureFactors(chain: {
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): string[] {
    const factors: string[] = [];

    if (chain.decision.confidence < 40) {
      factors.push('Low decision confidence');
    }

    if (chain.action.progressStatus.overallProgress < 40) {
      factors.push('Poor action completion');
    }

    if (chain.outcome.regret.regretLevel > 60) {
      factors.push('High regret');
    }

    if (chain.outcome.dimensions.stressLevels.score < 40) {
      factors.push('High stress levels');
    }

    return factors;
  }

  private identifyUnexpectedOutcomes(chain: {
    outcome: OutcomeEvent;
  }): string[] {
    const unexpected: string[] = [];

    if (chain.outcome.achievedOutcome && chain.outcome.regret.regretLevel > 50) {
      unexpected.push('Achieved outcome but high regret');
    }

    if (!chain.outcome.achievedOutcome && chain.outcome.satisfaction.overallSatisfaction > 60) {
      unexpected.push('Did not achieve outcome but high satisfaction');
    }

    if (chain.outcome.timeline.varianceFromExpectedDays > 180) {
      unexpected.push('Significantly delayed outcome');
    }

    return unexpected;
  }

  private extractLearningData(chain: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }) {
    return {
      archetypePatterns: this.extractArchetypePatterns(chain),
      decisionPatterns: this.extractDecisionPatterns(chain),
      actionPatterns: this.extractActionPatterns(chain),
      outcomePatterns: this.extractOutcomePatterns(chain),
      cohortIds: [], // Will be populated by cohort engine
    };
  }

  private extractArchetypePatterns(chain: {
    decision: DecisionEvent;
    outcome: OutcomeEvent;
  }): string[] {
    const patterns: string[] = [];

    if (chain.decision.confidence >= 80 && chain.outcome.achievedOutcome) {
      patterns.push('High confidence → Success');
    }

    if (chain.decision.selectedOption.relationshipToRecommendation === 'ACCEPTED' &&
        chain.outcome.achievedOutcome) {
      patterns.push('Accepted recommendation → Success');
    }

    return patterns;
  }

  private extractDecisionPatterns(chain: {
    decision: DecisionEvent;
    outcome: OutcomeEvent;
  }): string[] {
    const patterns: string[] = [];

    if (chain.decision.rationale.primaryFactors.length > 2) {
      patterns.push('Multi-factor decision making');
    }

    if (chain.decision.rationale.decisionTimeframe === 'MONTHS') {
      patterns.push('Deliberate decision timeframe');
    }

    return patterns;
  }

  private extractActionPatterns(chain: {
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): string[] {
    const patterns: string[] = [];

    if (chain.action.milestonesCompleted.length >= 3) {
      patterns.push('High milestone completion');
    }

    if (chain.action.progressStatus.overallProgress >= 80) {
      patterns.push('Strong progress execution');
    }

    return patterns;
  }

  private extractOutcomePatterns(chain: {
    outcome: OutcomeEvent;
  }): string[] {
    const patterns: string[] = [];

    if (chain.outcome.achievedOutcome && chain.outcome.satisfaction.overallSatisfaction >= 70) {
      patterns.push('High achievement + satisfaction');
    }

    if (chain.outcome.timeline.onTime) {
      patterns.push('On-time outcome achievement');
    }

    return patterns;
  }

  private calculateDataQualityScore(chain: {
    recommendation: RecommendationEvent;
    decision: DecisionEvent;
    action: ActionEvent;
    outcome: OutcomeEvent;
  }): number {
    let score = 100;

    // Check for missing optional data
    if (!chain.recommendation.context.viewDurationSeconds) score -= 5;
    if (chain.decision.rejectedOptions.length === 0) score -= 5;
    if (chain.action.actionsTaken.length === 0) score -= 10;
    if (!chain.outcome.timeline.estimatedCompletionAt) score -= 5;

    return Math.max(0, score);
  }

  private async getOutcomeRecordsForLearning(
    request: PatternLearningRequest
  ): Promise<OutcomeRecord[]> {
    const records: OutcomeRecord[] = [];

    for (const [, chain] of Array.from(this.eventChains.entries())) {
      if (chain.recommendation && chain.decision && chain.action && chain.outcome) {
        // Filter by cohort if specified
        if (request.cohortIds && request.cohortIds.length > 0) {
          // Check if record belongs to any of the specified cohorts
          // This would require cohort membership lookup in production
        }

        // Filter by time range if specified
        if (request.timeRange) {
          const eventDate = chain.recommendation.timestamp;
          if (eventDate < request.timeRange.startDate || eventDate > request.timeRange.endDate) {
            continue;
          }
        }

        records.push(this.buildOutcomeRecord(chain as {
          recommendation: RecommendationEvent;
          decision: DecisionEvent;
          action: ActionEvent;
          outcome: OutcomeEvent;
        }));
      }
    }

    return records;
  }
}
