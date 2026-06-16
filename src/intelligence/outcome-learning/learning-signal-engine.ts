/**
 * CareerOS Outcome Learning Engine - Learning Signal Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Generates and processes learning signals.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type OutcomeLearningSignal,
  type ProcessedFeedback,
  type SignalType,
  type SignalPriority,
  type LearningInsight,
  type ILearningSignalEngine,
  type OutcomeLearningConfig,
  type LearningSignalId,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

import {
  type StudentId,
} from '../outcome-tracking/outcome-types.js';

// ============================================================================
// SIGNAL PROCESSOR
// ============================================================================

/**
 * Processes learning signals
 */
class SignalProcessor {
  /**
   * Process a signal
   */
  process(signal: OutcomeLearningSignal): void {
    signal.processed = true;
    signal.processedAt = Date.now();
  }

  /**
   * Batch process signals
   */
  processBatch(signals: OutcomeLearningSignal[]): void {
    for (const signal of signals) {
      this.process(signal);
    }
  }

  /**
   * Prioritize signals
   */
  prioritize(signals: OutcomeLearningSignal[]): OutcomeLearningSignal[] {
    const priorityOrder: Record<SignalPriority, number> = {
      'CRITICAL': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3,
    };

    return [...signals].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Higher error magnitude = higher priority
      return b.payload.errorMagnitude - a.payload.errorMagnitude;
    });
  }
}

// ============================================================================
// SIGNAL GENERATOR
// ============================================================================

/**
 * Generates learning signals from feedback
 */
class SignalGenerator {
  /**
   * Generate signals from processed feedback
   */
  generate(feedback: ProcessedFeedback): OutcomeLearningSignal[] {
    const signals: OutcomeLearningSignal[] = [];

    for (const signal of feedback.signals) {
      // Enhance signal with additional metadata
      signals.push(this.enhanceSignal(signal));
    }

    return signals;
  }

  private enhanceSignal(signal: OutcomeLearningSignal): OutcomeLearningSignal {
    // Calculate learning potential
    const learningPotential = this.calculateLearningPotential(signal);

    // Enhance payload
    return {
      ...signal,
      payload: {
        ...signal.payload,
        learningPotential,
      },
    };
  }

  private calculateLearningPotential(signal: OutcomeLearningSignal): number {
    // Higher error + high priority = high learning potential
    const errorComponent = Math.min(1, signal.payload.errorMagnitude / 100);
    
    const priorityMultiplier: Record<SignalPriority, number> = {
      'CRITICAL': 1.5,
      'HIGH': 1.2,
      'MEDIUM': 1.0,
      'LOW': 0.8,
    };

    return errorComponent * priorityMultiplier[signal.priority];
  }

  /**
   * Generate aggregate signals
   */
  generateAggregate(signals: OutcomeLearningSignal[]): OutcomeLearningSignal[] {
    const aggregates: OutcomeLearningSignal[] = [];

    // Group by target engine
    const byEngine = this.groupByEngine(signals);

    for (const [engine, engineSignals] of byEngine) {
      if (engineSignals.length >= 5) {
        aggregates.push(this.createAggregateSignal(engine, engineSignals));
      }
    }

    return aggregates;
  }

  private groupByEngine(signals: OutcomeLearningSignal[]): Map<string, OutcomeLearningSignal[]> {
    const groups = new Map<string, OutcomeLearningSignal[]>();

    for (const signal of signals) {
      const existing = groups.get(signal.targetEngine) || [];
      existing.push(signal);
      groups.set(signal.targetEngine, existing);
    }

    return groups;
  }

  private createAggregateSignal(
    engine: string,
    signals: OutcomeLearningSignal[]
  ): OutcomeLearningSignal {
    const avgError = signals.reduce((sum, s) => sum + s.payload.errorMagnitude, 0) / signals.length;
    const positiveCount = signals.filter(s => s.signalType === 'POSITIVE' || s.signalType === 'GROWTH').length;
    const negativeCount = signals.filter(s => s.signalType === 'NEGATIVE' || s.signalType === 'REGRESSION').length;

    const dominantType = positiveCount > negativeCount ? 'POSITIVE' : 'NEGATIVE';

    return {
      signalId: `agg-${Date.now()}-${engine}` as LearningSignalId,
      signalType: dominantType as SignalType,
      source: 'AGGREGATE',
      targetEngine: engine,
      priority: avgError > 30 ? 'HIGH' : 'MEDIUM',
      timestamp: Date.now(),
      payload: {
        outcomeType: 'AGGREGATE',
        predictedOutcome: 50,
        actualOutcome: positiveCount / signals.length * 100,
        errorMagnitude: avgError,
        factors: [...new Set(signals.flatMap(s => s.payload.factors || []))],
        context: {
          sampleSize: signals.length,
          positiveCount,
          negativeCount,
        },
      },
      processed: false,
      learningApplied: false,
    };
  }
}

// ============================================================================
// LEARNING APPLIER
// ============================================================================

/**
 * Applies learning from signals
 */
class LearningApplier {
  private appliedLearnings: Map<string, { timestamp: number; adjustment: number }> = new Map();

  /**
   * Apply learning from signal
   */
  apply(signal: OutcomeLearningSignal): { applied: boolean; adjustment: number } {
    if (signal.learningApplied) {
      return { applied: false, adjustment: 0 };
    }

    // Calculate adjustment based on signal
    let adjustment = 0;

    switch (signal.signalType) {
      case 'POSITIVE':
      case 'GROWTH':
        adjustment = this.calculatePositiveAdjustment(signal);
        break;
      case 'NEGATIVE':
      case 'REGRESSION':
        adjustment = this.calculateNegativeAdjustment(signal);
        break;
      case 'UNEXPECTED':
        adjustment = this.calculateUnexpectedAdjustment(signal);
        break;
      case 'LONG_TERM':
        adjustment = this.calculateLongTermAdjustment(signal);
        break;
    }

    signal.learningApplied = true;
    signal.learningAppliedAt = Date.now();

    this.appliedLearnings.set(signal.signalId, {
      timestamp: Date.now(),
      adjustment,
    });

    return { applied: true, adjustment };
  }

  private calculatePositiveAdjustment(signal: OutcomeLearningSignal): number {
    // Small positive reinforcement
    return 0.02;
  }

  private calculateNegativeAdjustment(signal: OutcomeLearningSignal): number {
    // Larger negative adjustment based on error
    return -0.05 * (signal.payload.errorMagnitude / 100);
  }

  private calculateUnexpectedAdjustment(signal: OutcomeLearningSignal): number {
    // Moderate adjustment for unexpected outcomes
    return signal.payload.errorMagnitude > 50 ? -0.03 : 0.01;
  }

  private calculateLongTermAdjustment(signal: OutcomeLearningSignal): number {
    // Small persistent adjustment for long-term signals
    return 0.01;
  }

  /**
   * Apply learning from multiple signals
   */
  applyBatch(signals: OutcomeLearningSignal[]): { applied: number; totalAdjustment: number } {
    let applied = 0;
    let totalAdjustment = 0;

    for (const signal of signals) {
      const result = this.apply(signal);
      if (result.applied) {
        applied++;
        totalAdjustment += result.adjustment;
      }
    }

    return { applied, totalAdjustment };
  }

  /**
   * Get applied learnings
   */
  getAppliedLearnings(): Map<string, { timestamp: number; adjustment: number }> {
    return new Map(this.appliedLearnings);
  }
}

// ============================================================================
// LEARNING SIGNAL ENGINE
// ============================================================================

/**
 * Learning Signal Engine
 *
 * Generates, processes, and applies learning signals.
 */
class LearningSignalEngine implements ILearningSignalEngine {
  private config: OutcomeLearningConfig;
  private signalProcessor: SignalProcessor;
  private signalGenerator: SignalGenerator;
  private learningApplier: LearningApplier;

  private signals: OutcomeLearningSignal[] = [];
  private handlers: Map<string, (signal: OutcomeLearningSignal) => void> = new Map();

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.signalProcessor = new SignalProcessor();
    this.signalGenerator = new SignalGenerator();
    this.learningApplier = new LearningApplier();
  }

  /**
   * Generate signals from processed feedback
   */
  generateSignals(feedback: ProcessedFeedback): OutcomeLearningSignal[] {
    const signals = this.signalGenerator.generate(feedback);
    this.signals.push(...signals);
    return signals;
  }

  /**
   * Get signals by type
   */
  getSignalsByType(type: SignalType): OutcomeLearningSignal[] {
    return this.signals.filter(s => s.signalType === type);
  }

  /**
   * Get signals by target engine
   */
  getSignalsByTarget(targetEngine: string): OutcomeLearningSignal[] {
    return this.signals.filter(s => s.targetEngine === targetEngine);
  }

  /**
   * Get pending signals (not processed)
   */
  getPendingSignals(): OutcomeLearningSignal[] {
    return this.signals.filter(s => !s.processed);
  }

  /**
   * Process all pending signals
   */
  processSignals(): void {
    const pending = this.getPendingSignals();
    const prioritized = this.signalProcessor.prioritize(pending);
    this.signalProcessor.processBatch(prioritized);

    // Notify handlers
    for (const signal of prioritized) {
      const handler = this.handlers.get(signal.targetEngine);
      if (handler) {
        handler(signal);
      }
    }
  }

  /**
   * Apply learning from signals
   */
  applyLearning(): void {
    const unapplied = this.signals.filter(s => !s.learningApplied);
    this.learningApplier.applyBatch(unapplied);
  }

  /**
   * Register handler for target engine
   */
  registerHandler(targetEngine: string, handler: (signal: OutcomeLearningSignal) => void): void {
    this.handlers.set(targetEngine, handler);
  }

  /**
   * Unregister handler
   */
  unregisterHandler(targetEngine: string): void {
    this.handlers.delete(targetEngine);
  }

  /**
   * Get aggregate signals
   */
  getAggregateSignals(): OutcomeLearningSignal[] {
    return this.signalGenerator.generateAggregate(this.signals);
  }

  /**
   * Get signals by student
   */
  getSignalsByStudent(studentId: StudentId): OutcomeLearningSignal[] {
    return this.signals.filter(s => s.studentId === studentId);
  }

  /**
   * Get signal statistics
   */
  getStats(): {
    totalSignals: number;
    processedSignals: number;
    unprocessedSignals: number;
    appliedLearnings: number;
    byType: Record<SignalType, number>;
  } {
    const byType: Record<SignalType, number> = {
      'POSITIVE': 0,
      'NEGATIVE': 0,
      'UNEXPECTED': 0,
      'GROWTH': 0,
      'REGRESSION': 0,
      'LONG_TERM': 0,
    };

    for (const signal of this.signals) {
      byType[signal.signalType]++;
    }

    return {
      totalSignals: this.signals.length,
      processedSignals: this.signals.filter(s => s.processed).length,
      unprocessedSignals: this.signals.filter(s => !s.processed).length,
      appliedLearnings: this.signals.filter(s => s.learningApplied).length,
      byType,
    };
  }

  /**
   * Clear all signals
   */
  clear(): void {
    this.signals = [];
    this.handlers.clear();
  }

  /**
   * Get all signals
   */
  getAllSignals(): OutcomeLearningSignal[] {
    return [...this.signals];
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create learning signal engine
 */
export function createLearningSignalEngine(
  config?: Partial<OutcomeLearningConfig>
): LearningSignalEngine {
  return new LearningSignalEngine(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  LearningSignalEngine,
  SignalProcessor,
  SignalGenerator,
  LearningApplier,
};
