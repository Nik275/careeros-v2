/**
 * CareerOS Outcome Learning Engine - Feedback Ingestion Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Ingests feedback from multiple sources and converts into learning signals.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type RawFeedback,
  type ProcessedFeedback,
  type OutcomeLearningSignal,
  type FeedbackInsight,
  type SignalType,
  type SignalPriority,
  type LearningSignalId,
  type IFeedbackIngestionEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

import {
  type StudentId,
  type OutcomeEvent,
  type OutcomeEventType,
} from '../outcome-tracking/outcome-types.js';

// ============================================================================
// FEEDBACK VALIDATOR
// ============================================================================

/**
 * Validates raw feedback before processing
 */
class FeedbackValidator {
  private minDataQuality: number;

  constructor(config: OutcomeLearningConfig) {
    this.minDataQuality = config.feedback.minDataQuality;
  }

  /**
   * Validate feedback data quality
   */
  validate(feedback: RawFeedback): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!feedback.id) errors.push('Missing feedback ID');
    if (!feedback.type) errors.push('Missing feedback type');
    if (!feedback.timestamp) errors.push('Missing timestamp');
    if (!feedback.studentId) errors.push('Missing student ID');
    if (!feedback.source) errors.push('Missing source');

    // Check data quality
    if (feedback.metadata.dataQuality < this.minDataQuality) {
      errors.push(`Data quality ${feedback.metadata.dataQuality} below minimum ${this.minDataQuality}`);
    }

    // Check payload
    if (!feedback.payload || Object.keys(feedback.payload).length === 0) {
      errors.push('Empty payload');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Calculate data quality score
   */
  calculateQuality(feedback: RawFeedback): number {
    let score = 100;

    // Penalize for missing fields
    if (!feedback.payload.context) score -= 10;
    if (!feedback.payload.factors) score -= 10;
    if (!feedback.metadata.verified) score -= 15;

    // Penalize for old data
    const age = Date.now() - feedback.timestamp;
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
    if (age > maxAge) score -= 20;

    return Math.max(0, score);
  }
}

// ============================================================================
// SIGNAL EXTRACTOR
// ============================================================================

/**
 * Extracts learning signals from feedback
 */
class SignalExtractor {
  /**
   * Extract signals from processed feedback
   */
  extract(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];

    switch (feedback.type) {
      case 'RECOMMENDATION_FEEDBACK':
        signals.push(...this.extractRecommendationSignals(feedback));
        break;
      case 'DECISION_FEEDBACK':
        signals.push(...this.extractDecisionSignals(feedback));
        break;
      case 'GROWTH_FEEDBACK':
        signals.push(...this.extractGrowthSignals(feedback));
        break;
      case 'OUTCOME_FEEDBACK':
        signals.push(...this.extractOutcomeSignals(feedback));
        break;
      case 'CONFIDENCE_FEEDBACK':
        signals.push(...this.extractConfidenceSignals(feedback));
        break;
      default:
        signals.push(...this.extractGenericSignals(feedback));
    }

    return signals;
  }

  private extractRecommendationSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];
    const payload = feedback.payload as {
      recommendationId?: string;
      careerId?: string;
      predictedScore?: number;
      actualOutcome?: string;
      satisfaction?: number;
      success?: boolean;
      studentChose?: boolean;
    };

    // Determine signal type
    let signalType: SignalType = 'POSITIVE';
    let priority: SignalPriority = 'MEDIUM';

    if (payload.success === false) {
      signalType = 'NEGATIVE';
      priority = 'HIGH';
    } else if (payload.studentChose === false && payload.success === true) {
      signalType = 'UNEXPECTED';
      priority = 'HIGH';
    } else if (payload.satisfaction && payload.satisfaction > 80) {
      signalType = 'POSITIVE';
      priority = 'MEDIUM';
    }

    // Calculate error magnitude
    const predictedSatisfaction = payload.predictedScore || 70;
    const actualSatisfaction = payload.satisfaction || 50;
    const errorMagnitude = Math.abs(predictedSatisfaction - actualSatisfaction);

    signals.push({
      signalId: this.generateSignalId(),
      signalType,
      source: feedback.source,
      targetEngine: 'RECOMMENDATION',
      priority,
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      recommendationId: payload.recommendationId as any,
      payload: {
        outcomeType: 'RECOMMENDATION',
        predictedOutcome: predictedSatisfaction,
        actualOutcome: actualSatisfaction,
        errorMagnitude,
        factors: payload.careerId ? [payload.careerId] : [],
        context: payload,
      },
      processed: false,
      learningApplied: false,
    });

    return signals;
  }

  private extractDecisionSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];
    const payload = feedback.payload as {
      decisionId?: string;
      recommendedOption?: string;
      chosenOption?: string;
      outcome?: string;
      regret?: number;
      satisfaction?: number;
    };

    const aligned = payload.recommendedOption === payload.chosenOption;
    const regret = payload.regret || 0;
    const satisfaction = payload.satisfaction || 50;

    let signalType: SignalType = 'POSITIVE';
    let priority: SignalPriority = 'MEDIUM';

    if (regret > 50) {
      signalType = 'NEGATIVE';
      priority = 'HIGH';
    } else if (!aligned && satisfaction > 70) {
      signalType = 'UNEXPECTED';
      priority = 'HIGH';
    } else if (aligned && satisfaction < 50) {
      signalType = 'NEGATIVE';
      priority = 'CRITICAL';
    }

    signals.push({
      signalId: this.generateSignalId(),
      signalType,
      source: feedback.source,
      targetEngine: 'DECISION',
      priority,
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      payload: {
        outcomeType: 'DECISION',
        predictedOutcome: aligned ? 80 : 50,
        actualOutcome: satisfaction,
        errorMagnitude: Math.abs(80 - satisfaction),
        factors: [payload.recommendedOption || '', payload.chosenOption || ''],
        context: payload,
      },
      processed: false,
      learningApplied: false,
    });

    return signals;
  }

  private extractGrowthSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];
    const payload = feedback.payload as {
      dimension?: string;
      baseline?: number;
      current?: number;
      change?: number;
    };

    const change = payload.change || 0;
    const dimension = payload.dimension || 'UNKNOWN';

    let signalType: SignalType = 'GROWTH';
    let priority: SignalPriority = 'MEDIUM';

    if (change < -15) {
      signalType = 'REGRESSION';
      priority = 'HIGH';
    } else if (change > 20) {
      signalType = 'GROWTH';
      priority = 'MEDIUM';
    }

    signals.push({
      signalId: this.generateSignalId(),
      signalType,
      source: feedback.source,
      targetEngine: 'GROWTH',
      priority,
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      payload: {
        outcomeType: 'GROWTH',
        predictedOutcome: payload.baseline || 50,
        actualOutcome: payload.current || 50,
        errorMagnitude: Math.abs(change),
        factors: [dimension],
        context: payload,
      },
      processed: false,
      learningApplied: false,
    });

    return signals;
  }

  private extractOutcomeSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];
    const payload = feedback.payload as {
      outcomeType?: string;
      quality?: string;
      expected?: string;
      actual?: string;
      satisfaction?: number;
    };

    const quality = payload.quality || 'MIXED';
    const satisfaction = payload.satisfaction || 50;

    let signalType: SignalType = 'POSITIVE';
    let priority: SignalPriority = 'MEDIUM';

    if (quality === 'EXCELLENT' || quality === 'EXCEPTIONAL') {
      signalType = 'POSITIVE';
      priority = 'MEDIUM';
    } else if (quality === 'POOR' || quality === 'NEGATIVE') {
      signalType = 'NEGATIVE';
      priority = 'HIGH';
    } else if (quality === 'MIXED') {
      signalType = 'UNEXPECTED';
      priority = 'MEDIUM';
    }

    signals.push({
      signalId: this.generateSignalId(),
      signalType,
      source: feedback.source,
      targetEngine: 'OUTCOME',
      priority,
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      payload: {
        outcomeType: payload.outcomeType || 'UNKNOWN',
        predictedOutcome: payload.expected || 'UNKNOWN',
        actualOutcome: payload.actual || 'UNKNOWN',
        errorMagnitude: Math.abs(80 - satisfaction),
        factors: [],
        context: payload,
      },
      processed: false,
      learningApplied: false,
    });

    return signals;
  }

  private extractConfidenceSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];
    const payload = feedback.payload as {
      statedConfidence?: number;
      outcome?: boolean;
    };

    const confidence = payload.statedConfidence || 50;
    const outcome = payload.outcome || false;

    // Calibration signal
    signals.push({
      signalId: this.generateSignalId(),
      signalType: outcome ? 'POSITIVE' : 'NEGATIVE',
      source: feedback.source,
      targetEngine: 'CALIBRATION',
      priority: 'HIGH',
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      payload: {
        outcomeType: 'CONFIDENCE',
        predictedOutcome: confidence,
        actualOutcome: outcome ? 100 : 0,
        errorMagnitude: outcome ? Math.abs(confidence - 100) : confidence,
        factors: ['confidence_calibration'],
        context: payload,
      },
      processed: false,
      learningApplied: false,
    });

    return signals;
  }

  private extractGenericSignals(feedback: RawFeedback): OutcomeLearningSignal[] {
    return [{
      signalId: this.generateSignalId(),
      signalType: 'POSITIVE',
      source: feedback.source,
      targetEngine: 'GENERAL',
      priority: 'LOW',
      timestamp: feedback.timestamp,
      studentId: feedback.studentId,
      payload: {
        outcomeType: feedback.type,
        predictedOutcome: 50,
        actualOutcome: 50,
        errorMagnitude: 0,
        factors: [],
        context: feedback.payload,
      },
      processed: false,
      learningApplied: false,
    }];
  }

  private generateSignalId(): LearningSignalId {
    return `sig-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as LearningSignalId;
  }
}

// ============================================================================
// INSIGHT EXTRACTOR
// ============================================================================

/**
 * Extracts insights from feedback and signals
 */
class InsightExtractor {
  /**
   * Extract insights from processed feedback
   */
  extract(feedback: RawFeedback, signals: OutcomeLearningSignal[]): FeedbackInsight[] {
    const insights: FeedbackInsight[] = [];

    // Pattern detection
    const patternInsight = this.detectPattern(feedback, signals);
    if (patternInsight) insights.push(patternInsight);

    // Anomaly detection
    const anomalyInsight = this.detectAnomaly(feedback, signals);
    if (anomalyInsight) insights.push(anomalyInsight);

    // Trend detection
    const trendInsight = this.detectTrend(feedback, signals);
    if (trendInsight) insights.push(trendInsight);

    // Correlation detection
    const correlationInsight = this.detectCorrelation(feedback, signals);
    if (correlationInsight) insights.push(correlationInsight);

    return insights;
  }

  private detectPattern(feedback: RawFeedback, signals: OutcomeLearningSignal[]): FeedbackInsight | null {
    // Look for repeating patterns in the feedback
    const successPattern = signals.every(s => 
      s.signalType === 'POSITIVE' || s.signalType === 'GROWTH'
    );

    if (successPattern && signals.length > 0) {
      return {
        insightId: `ins-${Date.now()}-pattern`,
        type: 'PATTERN',
        description: 'Consistent positive pattern detected',
        confidence: 0.8,
        evidence: signals.map(s => s.signalId),
        actionable: true,
      };
    }

    return null;
  }

  private detectAnomaly(feedback: RawFeedback, signals: OutcomeLearningSignal[]): FeedbackInsight | null {
    // Look for unexpected outcomes
    const unexpectedSignals = signals.filter(s => s.signalType === 'UNEXPECTED');

    if (unexpectedSignals.length > 0) {
      return {
        insightId: `ins-${Date.now()}-anomaly`,
        type: 'ANOMALY',
        description: 'Unexpected outcome detected - model may need adjustment',
        confidence: 0.75,
        evidence: unexpectedSignals.map(s => s.signalId),
        actionable: true,
      };
    }

    return null;
  }

  private detectTrend(feedback: RawFeedback, signals: OutcomeLearningSignal[]): FeedbackInsight | null {
    // Look for growth or decline trends
    const growthSignals = signals.filter(s => s.signalType === 'GROWTH').length;
    const regressionSignals = signals.filter(s => s.signalType === 'REGRESSION').length;

    if (growthSignals > regressionSignals && growthSignals > 0) {
      return {
        insightId: `ins-${Date.now()}-trend`,
        type: 'TREND',
        description: 'Positive growth trend detected',
        confidence: 0.7,
        evidence: signals.filter(s => s.signalType === 'GROWTH').map(s => s.signalId),
        actionable: false,
      };
    }

    if (regressionSignals > growthSignals && regressionSignals > 0) {
      return {
        insightId: `ins-${Date.now()}-trend`,
        type: 'TREND',
        description: 'Regression trend detected - intervention may be needed',
        confidence: 0.75,
        evidence: signals.filter(s => s.signalType === 'REGRESSION').map(s => s.signalId),
        actionable: true,
      };
    }

    return null;
  }

  private detectCorrelation(feedback: RawFeedback, signals: OutcomeLearningSignal[]): FeedbackInsight | null {
    // Look for correlations between factors and outcomes
    const highErrorSignals = signals.filter(s => s.payload.errorMagnitude > 30);

    if (highErrorSignals.length > 0) {
      const factors = highErrorSignals.flatMap(s => s.payload.factors || []);
      const uniqueFactors = [...new Set(factors)];

      if (uniqueFactors.length > 0) {
        return {
          insightId: `ins-${Date.now()}-correlation`,
          type: 'CORRELATION',
          description: `Factors showing high prediction error: ${uniqueFactors.join(', ')}`,
          confidence: 0.6,
          evidence: highErrorSignals.map(s => s.signalId),
          actionable: true,
        };
      }
    }

    return null;
  }
}

// ============================================================================
// FEEDBACK INGESTION ENGINE
// ============================================================================

/**
 * Feedback Ingestion Engine
 *
 * Ingests feedback from multiple sources and converts into learning signals.
 */
class FeedbackIngestionEngine implements IFeedbackIngestionEngine {
  private config: OutcomeLearningConfig;
  private validator: FeedbackValidator;
  private signalExtractor: SignalExtractor;
  private insightExtractor: InsightExtractor;
  
  private pendingFeedback: RawFeedback[] = [];
  private processedFeedback: ProcessedFeedback[] = [];
  private feedbackHistory: Map<string, RawFeedback> = new Map();

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.validator = new FeedbackValidator(this.config);
    this.signalExtractor = new SignalExtractor();
    this.insightExtractor = new InsightExtractor();
  }

  /**
   * Ingest single feedback item
   */
  async ingest(feedback: RawFeedback): Promise<ProcessedFeedback> {
    // Validate
    const validation = this.validator.validate(feedback);
    if (!validation.valid) {
      throw new Error(`Invalid feedback: ${validation.errors.join(', ')}`);
    }

    // Calculate quality
    const quality = this.validator.calculateQuality(feedback);
    feedback.metadata.dataQuality = quality;

    // Extract signals
    const signals = this.signalExtractor.extract(feedback);

    // Extract insights
    const insights = this.insightExtractor.extract(feedback, signals);

    // Create processed feedback
    const processed: ProcessedFeedback = {
      id: `proc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      originalFeedbackId: feedback.id,
      timestamp: Date.now(),
      studentId: feedback.studentId,
      signals,
      insights,
      processed: true,
      processedAt: Date.now(),
    };

    // Store
    this.processedFeedback.push(processed);
    this.feedbackHistory.set(feedback.id, feedback);

    return processed;
  }

  /**
   * Ingest batch of feedback
   */
  async ingestBatch(feedbacks: RawFeedback[]): Promise<ProcessedFeedback[]> {
    const results: ProcessedFeedback[] = [];
    const batchSize = this.config.feedback.batchProcessingSize;

    // Process in batches
    for (let i = 0; i < feedbacks.length; i += batchSize) {
      const batch = feedbacks.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(fb => this.ingest(fb).catch(() => {
          console.warn('Failed to ingest feedback safely.');
          return null;
        }))
      );

      results.push(...batchResults.filter((r): r is ProcessedFeedback => r !== null));
    }

    return results;
  }

  /**
   * Add feedback to pending queue
   */
  addPending(feedback: RawFeedback): void {
    this.pendingFeedback.push(feedback);
  }

  /**
   * Get pending feedback
   */
  getPendingFeedback(): RawFeedback[] {
    return [...this.pendingFeedback];
  }

  /**
   * Process all pending feedback
   */
  async processPending(): Promise<void> {
    const pending = [...this.pendingFeedback];
    this.pendingFeedback = [];

    await this.ingestBatch(pending);
  }

  /**
   * Get processed feedback by ID
   */
  getProcessedFeedback(id: string): ProcessedFeedback | undefined {
    return this.processedFeedback.find(pf => pf.id === id);
  }

  /**
   * Get all signals from processed feedback
   */
  getAllSignals(): OutcomeLearningSignal[] {
    return this.processedFeedback.flatMap(pf => pf.signals);
  }

  /**
   * Get all insights from processed feedback
   */
  getAllInsights(): FeedbackInsight[] {
    return this.processedFeedback.flatMap(pf => pf.insights);
  }

  /**
   * Get feedback history for a student
   */
  getStudentFeedback(studentId: StudentId): RawFeedback[] {
    return Array.from(this.feedbackHistory.values())
      .filter(fb => fb.studentId === studentId);
  }

  /**
   * Clear all processed feedback
   */
  clear(): void {
    this.pendingFeedback = [];
    this.processedFeedback = [];
    this.feedbackHistory.clear();
  }

  /**
   * Get ingestion statistics
   */
  getStats(): {
    pending: number;
    processed: number;
    totalSignals: number;
    totalInsights: number;
  } {
    return {
      pending: this.pendingFeedback.length,
      processed: this.processedFeedback.length,
      totalSignals: this.getAllSignals().length,
      totalInsights: this.getAllInsights().length,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create feedback ingestion engine
 */
export function createFeedbackIngestionEngine(
  config?: Partial<OutcomeLearningConfig>
): FeedbackIngestionEngine {
  return new FeedbackIngestionEngine(config);
}

/**
 * Create raw feedback object
 */
export function createRawFeedback(
  type: RawFeedback['type'],
  studentId: StudentId,
  source: RawFeedback['source'],
  payload: Record<string, unknown>,
  overrides: Partial<RawFeedback> = {}
): RawFeedback {
  return {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    timestamp: Date.now(),
    studentId,
    source,
    payload,
    metadata: {
      dataQuality: 80,
      verified: false,
      sourceVersion: '1.0.0',
    },
    ...overrides,
  };
}

/**
 * Convert outcome event to raw feedback
 */
export function outcomeEventToFeedback(event: OutcomeEvent): RawFeedback {
  const typeMap: Record<OutcomeEventType, RawFeedback['type']> = {
    'OUTCOME_RECORDED': 'OUTCOME_FEEDBACK',
    'GROWTH_MEASURED': 'GROWTH_FEEDBACK',
    'PREDICTION_MADE': 'CONFIDENCE_FEEDBACK',
    'PREDICTION_VALIDATED': 'CONFIDENCE_FEEDBACK',
    'COMPARISON_GENERATED': 'OUTCOME_FEEDBACK',
    'QUALITY_ASSESSED': 'OUTCOME_FEEDBACK',
    'SIGNAL_GENERATED': 'OUTCOME_FEEDBACK',
    'TIMELINE_UPDATED': 'OUTCOME_FEEDBACK',
  };

  return {
    id: `fb-${event.id}`,
    type: typeMap[event.type] || 'OUTCOME_FEEDBACK',
    timestamp: event.timestamp,
    studentId: event.studentId,
    source: 'OUTCOME_TRACKING',
    payload: event.payload as Record<string, unknown>,
    metadata: {
      dataQuality: 90,
      verified: true,
      sourceVersion: '1.0.0',
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  FeedbackIngestionEngine,
  FeedbackValidator,
  SignalExtractor,
  InsightExtractor,
};
