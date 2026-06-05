/**
 * CareerOS Outcome Tracking System - Main Engine
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Central orchestration engine that coordinates all outcome tracking
 * components and provides a unified API for the CareerOS system.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentOutcomeRecord,
  type OutcomeRecordId,
  type StudentId,
  type RecommendationId,
  type PathId,
  type Prediction,
  type PredictionComparison,
  type OutcomeQualityAssessment,
  type OutcomeEvent,
  type OutcomeEventType,
  type OutcomeEventHandler,
  type OutcomeAggregationQuery,
  type OutcomeAggregation,
  type OutcomeAnalytics,
  type LearningSignal,
  type CareerDecisionOutcome,
  type EducationOutcome,
  type SkillOutcome,
  type InternshipOutcome,
  type JobOutcome,
  type ExplorationOutcome,
  type GrowthSnapshot,
  type TimelineEntry,
  type IOutcomeStore,
  type IOutcomeEventEngine,
  type IOutcomeTracker,
  type OutcomeTrackingConfig,
  DEFAULT_OUTCOME_TRACKING_CONFIG,
} from './outcome-types.js';

import {
  type StudentBeliefV3,
} from '../types/index.js';

import {
  type DimensionScoreMap,
} from '../../assessment/assessment-types.js';

import {
  type CareerRecommendation,
} from '../../recommendation/recommendation-types.js';

import {
  OutcomeEventEngine,
  createOutcomeEventEngine,
} from './outcome-event-engine.js';

import {
  InMemoryOutcomeStore,
  createInMemoryStore,
  createCachedStore,
  createValidatedStore,
} from './outcome-store.js';

import {
  OutcomeTracker,
  createOutcomeTracker,
} from './outcome-tracker.js';

import {
  TimelineEngine,
  createTimelineEngine,
  type TimelineSummary,
  type TimelineViewConfig,
} from './outcome-timeline-engine.js';

import {
  ComparisonEngine,
  createComparisonEngine,
  type AccuracyMetrics,
  type BiasAnalysis,
  type CalibrationAnalysis,
} from './outcome-comparison-engine.js';

import {
  QualityEngine,
  createQualityEngine,
  type QualityFactors,
  type OutcomePattern,
  type LongTermProjection,
  type HolisticAssessment,
} from './outcome-quality-engine.js';

import {
  StudentGrowthEngine,
  createStudentGrowthEngine,
  createInitialGrowthProfile,
  type GrowthReport,
  type GrowthTrajectory,
  type GrowthRecommendation,
} from './student-growth-engine.js';

// ============================================================================
// LEARNING SIGNAL ENGINE
// ============================================================================

/**
 * Learning Signal Engine
 *
 * Generates learning signals from outcome events for system improvement.
 */
class LearningSignalEngine {
  private signals: LearningSignal[] = [];
  private handlers: Map<string, (signal: LearningSignal) => void> = new Map();

  /**
   * Generate learning signal from event
   */
  generateSignal(event: OutcomeEvent): LearningSignal | null {
    switch (event.type) {
      case 'PREDICTION_VALIDATED':
        return this.generatePredictionSignal(event);
      case 'OUTCOME_RECORDED':
        return this.generateOutcomeSignal(event);
      case 'GROWTH_MEASURED':
        return this.generateGrowthSignal(event);
      default:
        return null;
    }
  }

  /**
   * Process a signal
   */
  processSignal(signal: LearningSignal): void {
    signal.processed = true;
    signal.processedAt = Date.now();

    const handler = this.handlers.get(signal.targetEngine);
    if (handler) {
      handler(signal);
    }
  }

  /**
   * Register handler for target engine
   */
  registerHandler(targetEngine: string, handler: (signal: LearningSignal) => void): void {
    this.handlers.set(targetEngine, handler);
  }

  /**
   * Get pending signals
   */
  getPendingSignals(): LearningSignal[] {
    return this.signals.filter(s => !s.processed);
  }

  /**
   * Get signals by engine
   */
  getSignalsByEngine(engine: string): LearningSignal[] {
    return this.signals.filter(s => s.targetEngine === engine);
  }

  /**
   * Store signal
   */
  storeSignal(signal: LearningSignal): void {
    this.signals.push(signal);
  }

  private generatePredictionSignal(event: OutcomeEvent): LearningSignal | null {
    const payload = event.payload as {
      predictionId: string;
      predictedValue: number;
      actualValue: number;
      accuracy: number;
      bias: string;
    };

    if (payload.accuracy >= 80) return null; // Good prediction, no signal needed

    return {
      signalId: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      source: 'OUTCOME_TRACKING',
      signalType: 'PREDICTION_ERROR',
      targetEngine: 'RECOMMENDATION',
      payload: {
        studentId: event.studentId,
        predictionId: payload.predictionId,
        expectedOutcome: payload.predictedValue,
        actualOutcome: payload.actualValue,
        errorMagnitude: Math.abs(payload.predictedValue - payload.actualValue),
      },
      priority: payload.accuracy < 60 ? 'HIGH' : 'MEDIUM',
      processed: false,
    };
  }

  private generateOutcomeSignal(event: OutcomeEvent): LearningSignal | null {
    const payload = event.payload as { outcomeType: string; outcomeData: unknown };

    return {
      signalId: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      source: 'OUTCOME_TRACKING',
      signalType: 'RECOMMENDATION_FEEDBACK',
      targetEngine: 'DECISION_INTELLIGENCE',
      payload: {
        studentId: event.studentId,
        outcomeType: payload.outcomeType,
        actualOutcome: payload.outcomeData,
        errorMagnitude: 0,
      },
      priority: 'MEDIUM',
      processed: false,
    };
  }

  private generateGrowthSignal(event: OutcomeEvent): LearningSignal | null {
    const payload = event.payload as { dimension: string; change: number };

    if (Math.abs(payload.change) < 10) return null;

    return {
      signalId: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      source: 'OUTCOME_TRACKING',
      signalType: 'GROWTH_PATTERN',
      targetEngine: 'REGRET',
      payload: {
        studentId: event.studentId,
        patternDetected: `significant_${payload.change > 0 ? 'improvement' : 'decline'}_${payload.dimension}`,
        actualOutcome: payload.change,
        errorMagnitude: 0,
      },
      priority: payload.change < -15 ? 'HIGH' : 'MEDIUM',
      processed: false,
    };
  }
}

// ============================================================================
// ANALYTICS ENGINE
// ============================================================================

/**
 * Analytics Engine
 *
 * Aggregates outcomes and calculates system-wide analytics.
 */
class AnalyticsEngine {
  /**
   * Aggregate outcomes based on query
   */
  async aggregateOutcomes(
    store: IOutcomeStore,
    query: OutcomeAggregationQuery
  ): Promise<OutcomeAggregation> {
    const records = await store.query(query);

    // Calculate quality distribution
    const qualityDistribution: Record<string, number> = {
      'EXCEPTIONAL': 0, 'EXCELLENT': 0, 'GOOD': 0, 'SATISFACTORY': 0,
      'MIXED': 0, 'BELOW_EXPECTATIONS': 0, 'POOR': 0, 'NEGATIVE': 0,
    };

    let totalSatisfaction = 0;
    let totalGrowth = 0;

    for (const record of records) {
      // Get latest quality assessment
      const latestQuality = record.qualityAssessments[record.qualityAssessments.length - 1];
      if (latestQuality) {
        qualityDistribution[latestQuality.overallQuality]++;
        totalSatisfaction += latestQuality.holisticScore;
      }

      totalGrowth += record.growth.profile.overallGrowth;
    }

    // Calculate adherence
    const followedCount = records.filter(r =>
      r.outcomes.careerDecisions.every(d => d.wasRecommended)
    ).length;

    // Calculate growth by dimension
    const growthByDimension: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};

    for (const record of records) {
      for (const [dim, measurement] of record.growth.profile.measurements) {
        growthByDimension[dim] = (growthByDimension[dim] || 0) + measurement.changePercent;
        dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
      }
    }

    for (const dim of Object.keys(growthByDimension)) {
      growthByDimension[dim] /= dimensionCounts[dim];
    }

    return {
      query,
      totalRecords: records.length,
      qualityDistribution,
      averageSatisfaction: records.length > 0 ? totalSatisfaction / records.length : 0,
      averageGrowth: records.length > 0 ? totalGrowth / records.length : 0,
      recommendationAdherence: {
        followed: followedCount,
        diverged: records.length - followedCount,
        rate: records.length > 0 ? followedCount / records.length : 0,
      },
      accuracyMetrics: [], // Would need to aggregate from record comparisons
      growthByDimension,
      trends: {
        satisfaction: 'STABLE',
        growth: 'STABLE',
        accuracy: 'STABLE',
      },
    };
  }

  /**
   * Calculate system-wide analytics
   */
  async calculateAnalytics(store: IOutcomeStore): Promise<OutcomeAnalytics> {
    const records = await store.query({ includeInactive: true });

    // Calculate rates
    const recommendationSuccesses = records.filter(r =>
      r.recommendationAccuracy.some(a => (a.accuracy || 0) > 70)
    ).length;

    const decisionSuccesses = records.filter(r =>
      r.outcomes.careerDecisions.some(d => d.actualOutcome.success)
    ).length;

    const growthSum = records.reduce((sum, r) => sum + r.growth.profile.overallGrowth, 0);

    const confidenceGrowthSum = records.reduce((sum, r) => {
      const conf = r.psychological.confidence;
      const latest = conf.measurements[conf.measurements.length - 1]?.value ?? conf.baseline;
      return sum + (latest - conf.baseline);
    }, 0);

    const clarityGrowthSum = records.reduce((sum, r) => {
      const clar = r.psychological.clarity;
      const latest = clar.measurements[clar.measurements.length - 1]?.value ?? clar.baseline;
      return sum + (latest - clar.baseline);
    }, 0);

    const explorationSuccesses = records.filter(r =>
      r.outcomes.explorations.some(e => e.decisionImpact === 'CONFIRMED')
    ).length;

    const predictionAccuracies = records.flatMap(r =>
      r.comparisons.map(c => c.accuracy)
    );

    const studentSatisfactions = records.map(r => {
      const latest = r.qualityAssessments[r.qualityAssessments.length - 1];
      return latest?.holisticScore ?? 50;
    });

    return {
      recommendationSuccessRate: records.length > 0 ? recommendationSuccesses / records.length : 0,
      decisionSuccessRate: records.length > 0 ? decisionSuccesses / records.length : 0,
      growthRate: records.length > 0 ? growthSum / records.length : 0,
      confidenceGrowthRate: records.length > 0 ? confidenceGrowthSum / records.length : 0,
      clarityGrowthRate: records.length > 0 ? clarityGrowthSum / records.length : 0,
      explorationSuccessRate: records.length > 0 ? explorationSuccesses / records.length : 0,
      predictionAccuracy: predictionAccuracies.length > 0
        ? predictionAccuracies.reduce((a, b) => a + b, 0) / predictionAccuracies.length
        : 0,
      recommendationAccuracy: records.length > 0 ? recommendationSuccesses / records.length : 0,
      studentSatisfaction: studentSatisfactions.length > 0
        ? studentSatisfactions.reduce((a, b) => a + b, 0) / studentSatisfactions.length
        : 0,
      systemImprovementRate: 0, // Would need historical data
    };
  }
}

// ============================================================================
// MAIN OUTCOME TRACKING ENGINE
// ============================================================================

/**
 * Outcome Tracking Engine
 *
 * Central orchestration engine for the CareerOS Outcome Tracking System.
 */
export class OutcomeTrackingEngine {
  private config: OutcomeTrackingConfig;
  private store: IOutcomeStore;
  private eventEngine: IOutcomeEventEngine;
  private tracker: IOutcomeTracker;
  private timelineEngine: TimelineEngine;
  private comparisonEngine: ComparisonEngine;
  private qualityEngine: QualityEngine;
  private growthEngine: StudentGrowthEngine;
  private learningSignalEngine: LearningSignalEngine;
  private analyticsEngine: AnalyticsEngine;

  constructor(config?: Partial<OutcomeTrackingConfig>) {
    this.config = { ...DEFAULT_OUTCOME_TRACKING_CONFIG, ...config };

    // Initialize components
    const memoryStore = createInMemoryStore();
    const cachedStore = createCachedStore(memoryStore);
    this.store = createValidatedStore(cachedStore);

    this.eventEngine = createOutcomeEventEngine();
    this.tracker = createOutcomeTracker(this.store, this.eventEngine);
    this.timelineEngine = createTimelineEngine();
    this.comparisonEngine = createComparisonEngine();
    this.qualityEngine = createQualityEngine();
    this.growthEngine = createStudentGrowthEngine();
    this.learningSignalEngine = new LearningSignalEngine();
    this.analyticsEngine = new AnalyticsEngine();

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Initialize tracking for a new student
   */
  async initializeTracking(
    studentId: StudentId,
    baseline: {
      belief: StudentBeliefV3;
      dimensions: DimensionScoreMap;
      recommendations: CareerRecommendation[];
      confidence: number;
      clarity: number;
      wellbeing: number;
    }
  ): Promise<StudentOutcomeRecord> {
    const record = await this.tracker.startTracking(studentId, {
      timestamp: Date.now(),
      ...baseline,
    });

    // Generate initial quality assessment
    const qualityAssessment = this.qualityEngine.assessOutcomeQuality(record);
    record.qualityAssessments.push(qualityAssessment);
    await this.store.save(record);

    return record;
  }

  /**
   * Record career decision outcome
   */
  async recordCareerDecision(
    recordId: OutcomeRecordId,
    outcome: CareerDecisionOutcome
  ): Promise<void> {
    await (this.tracker as OutcomeTracker).recordCareerDecisionOutcome(recordId, outcome);
  }

  /**
   * Record education outcome
   */
  async recordEducation(recordId: OutcomeRecordId, outcome: EducationOutcome): Promise<void> {
    await (this.tracker as OutcomeTracker).recordEducationOutcome(recordId, outcome);
  }

  /**
   * Record skill outcome
   */
  async recordSkill(recordId: OutcomeRecordId, outcome: SkillOutcome): Promise<void> {
    await (this.tracker as OutcomeTracker).recordSkillOutcome(recordId, outcome);
  }

  /**
   * Record internship outcome
   */
  async recordInternship(recordId: OutcomeRecordId, outcome: InternshipOutcome): Promise<void> {
    await (this.tracker as OutcomeTracker).recordInternshipOutcome(recordId, outcome);
  }

  /**
   * Record job outcome
   */
  async recordJob(recordId: OutcomeRecordId, outcome: JobOutcome): Promise<void> {
    await (this.tracker as OutcomeTracker).recordJobOutcome(recordId, outcome);
  }

  /**
   * Record exploration outcome
   */
  async recordExploration(recordId: OutcomeRecordId, outcome: ExplorationOutcome): Promise<void> {
    await (this.tracker as OutcomeTracker).recordExplorationOutcome(recordId, outcome);
  }

  /**
   * Record prediction for later comparison
   */
  async recordPrediction(recordId: OutcomeRecordId, prediction: Prediction): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    record.predictions.push(prediction);
    await this.store.save(record);
  }

  /**
   * Validate prediction against actual outcome
   */
  async validatePrediction(
    recordId: OutcomeRecordId,
    predictionId: string,
    actualValue: number
  ): Promise<PredictionComparison> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    const prediction = record.predictions.find(p => p.id === predictionId);
    if (!prediction) throw new Error(`Prediction not found: ${predictionId}`);

    const comparison = this.comparisonEngine.comparePredictionToReality(prediction, actualValue);
    record.comparisons.push(comparison);
    await this.store.save(record);

    // Emit prediction validated event for learning signal generation
    this.eventEngine.emit({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'PREDICTION_VALIDATED',
      timestamp: Date.now(),
      studentId: record.studentId,
      payload: {
        predictionId,
        predictedValue: prediction.predictedValue,
        actualValue,
        accuracy: comparison.accuracy,
        bias: comparison.bias,
      },
      metadata: { source: 'outcome-tracking-engine', version: '1.0.0', traceId: `trace-${Date.now()}` },
    });

    return comparison;
  }

  /**
   * Measure and record growth
   */
  async measureGrowth(recordId: OutcomeRecordId, scores: Record<string, number>): Promise<void> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    const snapshot = this.growthEngine.createSnapshot(record.studentId, scores);
    await (this.tracker as OutcomeTracker).measureGrowth(recordId, snapshot);
  }

  /**
   * Assess outcome quality
   */
  async assessQuality(recordId: OutcomeRecordId): Promise<OutcomeQualityAssessment> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    return this.qualityEngine.assessOutcomeQuality(record);
  }

  /**
   * Generate timeline summary
   */
  async generateTimelineSummary(recordId: OutcomeRecordId): Promise<TimelineSummary> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    return this.timelineEngine.generateSummary(record);
  }

  /**
   * Generate mentor narrative
   */
  async generateMentorNarrative(recordId: OutcomeRecordId, monthsAgo = 6): Promise<string> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    return this.timelineEngine.generateMentorNarrative(record, monthsAgo);
  }

  /**
   * Generate growth report
   */
  async generateGrowthReport(recordId: OutcomeRecordId): Promise<GrowthReport> {
    const record = await this.store.load(recordId);
    if (!record) throw new Error(`Record not found: ${recordId}`);

    return this.growthEngine.generateReport(record.studentId, record.growth.profile);
  }

  /**
   * Get learning signals for a target engine
   */
  getLearningSignals(targetEngine: string): LearningSignal[] {
    return this.learningSignalEngine.getSignalsByEngine(targetEngine);
  }

  /**
   * Get system analytics
   */
  async getAnalytics(): Promise<OutcomeAnalytics> {
    return this.analyticsEngine.calculateAnalytics(this.store);
  }

  /**
   * Aggregate outcomes
   */
  async aggregateOutcomes(query: OutcomeAggregationQuery): Promise<OutcomeAggregation> {
    return this.analyticsEngine.aggregateOutcomes(this.store, query);
  }

  /**
   * Get outcome record
   */
  async getRecord(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    return this.store.load(recordId);
  }

  /**
   * Get record by student
   */
  async getRecordByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    return this.store.loadByStudent(studentId);
  }

  /**
   * Subscribe to events
   */
  subscribeToEvents(eventType: OutcomeEventType, handler: OutcomeEventHandler): void {
    this.eventEngine.subscribe(eventType, handler);
  }

  /**
   * Get engine configuration
   */
  getConfig(): OutcomeTrackingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OutcomeTrackingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    // Generate learning signals from events
    this.eventEngine.subscribe('*' as OutcomeEventType, async (event) => {
      const signal = this.learningSignalEngine.generateSignal(event);
      if (signal) {
        this.learningSignalEngine.storeSignal(signal);

        if (this.config.learning.signalGenerationEnabled) {
          this.learningSignalEngine.processSignal(signal);
        }
      }
    });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create outcome tracking engine
 */
export function createOutcomeTrackingEngine(
  config?: Partial<OutcomeTrackingConfig>
): OutcomeTrackingEngine {
  return new OutcomeTrackingEngine(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Internal engines (already exported as classes above)
  LearningSignalEngine,
  AnalyticsEngine,

  // Sub-engines
  OutcomeEventEngine,
  InMemoryOutcomeStore,
  OutcomeTracker,
  TimelineEngine,
  ComparisonEngine,
  QualityEngine,
  StudentGrowthEngine,

  // Factory functions from sub-modules
  createOutcomeEventEngine,
  createInMemoryStore,
  createCachedStore,
  createValidatedStore,
  createOutcomeTracker,
  createTimelineEngine,
  createComparisonEngine,
  createQualityEngine,
  createStudentGrowthEngine,
  createInitialGrowthProfile,
};

export type {
  // Types from sub-modules
  TimelineSummary,
  TimelineViewConfig,
  AccuracyMetrics,
  BiasAnalysis,
  CalibrationAnalysis,
  QualityFactors,
  OutcomePattern,
  LongTermProjection,
  HolisticAssessment,
  GrowthReport,
  GrowthTrajectory,
  GrowthRecommendation,
};
