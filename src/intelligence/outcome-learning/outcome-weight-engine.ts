/**
 * CareerOS Outcome Learning Engine - Outcome Weight Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Learns which factors matter most for outcomes.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type OutcomeWeightModel,
  type FactorWeight,
  type FactorImportance,
  type OutcomeFactor,
  type OutcomeLearningSignal,
  type IOutcomeWeightEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

// ============================================================================
// CORRELATION CALCULATOR
// ============================================================================

/**
 * Calculates correlations between factors and outcomes
 */
class CorrelationCalculator {
  /**
   * Calculate Pearson correlation coefficient
   */
  calculatePearson(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * Calculate correlation between factor and success
   */
  calculateSuccessCorrelation(
    signals: OutcomeLearningSignal[],
    factor: OutcomeFactor
  ): number {
    const factorOutcomes: { factorValue: number; success: number }[] = [];

    for (const signal of signals) {
      if (signal.payload.factors?.includes(factor)) {
        const success = signal.signalType === 'POSITIVE' || signal.signalType === 'GROWTH' ? 1 : 0;
        factorOutcomes.push({ factorValue: 1, success });
      }
    }

    if (factorOutcomes.length === 0) return 0;

    const x = factorOutcomes.map(f => f.factorValue);
    const y = factorOutcomes.map(f => f.success);

    return this.calculatePearson(x, y);
  }

  /**
   * Calculate correlation between factor and satisfaction
   */
  calculateSatisfactionCorrelation(
    signals: OutcomeLearningSignal[],
    factor: OutcomeFactor
  ): number {
    const relevantSignals = signals.filter(s => 
      s.payload.factors?.includes(factor) && 
      typeof s.payload.actualOutcome === 'number'
    );

    if (relevantSignals.length === 0) return 0;

    const x = relevantSignals.map(() => 1); // Factor present
    const y = relevantSignals.map(s => s.payload.actualOutcome as number);

    return this.calculatePearson(x, y);
  }
}

// ============================================================================
// WEIGHT UPDATER
// ============================================================================

/**
 * Updates factor weights based on outcomes
 */
class WeightUpdater {
  private learningRate: number;

  constructor(learningRate: number) {
    this.learningRate = learningRate;
  }

  /**
   * Update weight based on outcome
   */
  updateWeight(
    currentWeight: FactorWeight,
    outcome: OutcomeLearningSignal
  ): FactorWeight {
    const error = outcome.payload.errorMagnitude;
    const success = outcome.signalType === 'POSITIVE' || outcome.signalType === 'GROWTH';

    // Calculate weight adjustment
    let adjustment = 0;

    if (success) {
      // Increase weight if factor contributed to success
      adjustment = this.learningRate * (1 - error / 100);
    } else {
      // Decrease weight if factor contributed to failure
      adjustment = -this.learningRate * (error / 100);
    }

    // Apply bounds
    const newWeight = Math.max(0, Math.min(1, currentWeight.weight + adjustment));

    // Update history
    const history = [...currentWeight.history, {
      timestamp: Date.now(),
      weight: newWeight,
    }];

    return {
      ...currentWeight,
      weight: newWeight,
      sampleSize: currentWeight.sampleSize + 1,
      lastUpdated: Date.now(),
      history,
    };
  }

  /**
   * Calculate weight confidence
   */
  calculateConfidence(sampleSize: number): number {
    // Confidence increases with sample size, asymptotically approaching 1
    return Math.min(0.95, 1 - Math.exp(-sampleSize / 30));
  }
}

// ============================================================================
// PREDICTIVE POWER CALCULATOR
// ============================================================================

/**
 * Calculates predictive power of factors
 */
class PredictivePowerCalculator {
  /**
   * Calculate predictive power
   */
  calculate(
    signals: OutcomeLearningSignal[],
    factor: OutcomeFactor
  ): number {
    const relevantSignals = signals.filter(s => 
      s.payload.factors?.includes(factor)
    );

    if (relevantSignals.length === 0) return 0;

    // Calculate how well this factor predicts outcomes
    const correctPredictions = relevantSignals.filter(s => 
      (s.signalType === 'POSITIVE' || s.signalType === 'GROWTH') &&
      s.payload.errorMagnitude < 20
    ).length;

    return (correctPredictions / relevantSignals.length) * 100;
  }
}

// ============================================================================
// STABILITY CALCULATOR
// ============================================================================

/**
 * Calculates stability of factor weights over time
 */
class StabilityCalculator {
  /**
   * Calculate weight stability
   */
  calculate(weight: FactorWeight): number {
    if (weight.history.length < 2) return 100;

    // Calculate variance in weight history
    const weights = weight.history.map(h => h.weight);
    const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
    
    const squaredDiffs = weights.map(w => Math.pow(w - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / weights.length;

    // Convert variance to stability (lower variance = higher stability)
    return Math.max(0, 100 - variance * 1000);
  }

  /**
   * Determine trend
   */
  determineTrend(weight: FactorWeight): 'INCREASING' | 'STABLE' | 'DECREASING' {
    if (weight.history.length < 5) return 'STABLE';

    const recent = weight.history.slice(-5);
    const firstHalf = recent.slice(0, 2);
    const secondHalf = recent.slice(-2);

    const firstAvg = firstHalf.reduce((sum, h) => sum + h.weight, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, h) => sum + h.weight, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const threshold = 0.05;

    if (change > threshold) return 'INCREASING';
    if (change < -threshold) return 'DECREASING';
    return 'STABLE';
  }
}

// ============================================================================
// OUTCOME WEIGHT ENGINE
// ============================================================================

/**
 * Outcome Weight Engine
 *
 * Learns which factors matter most for outcomes.
 */
class OutcomeWeightEngine implements IOutcomeWeightEngine {
  private config: OutcomeLearningConfig;
  private correlationCalc: CorrelationCalculator;
  private weightUpdater: WeightUpdater;
  private predictivePowerCalc: PredictivePowerCalculator;
  private stabilityCalc: StabilityCalculator;

  private weights: Map<OutcomeFactor, FactorWeight> = new Map();
  private importance: Map<OutcomeFactor, FactorImportance> = new Map();
  private signals: OutcomeLearningSignal[] = [];

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.correlationCalc = new CorrelationCalculator();
    this.weightUpdater = new WeightUpdater(this.config.learning.learningRate);
    this.predictivePowerCalc = new PredictivePowerCalculator();
    this.stabilityCalc = new StabilityCalculator();

    this.initializeWeights();
  }

  private initializeWeights(): void {
    const factors: OutcomeFactor[] = [
      'CAREER_FIT',
      'IDENTITY_FIT',
      'OPTIONALITY',
      'FINANCIAL_OUTCOME',
      'WELLBEING_OUTCOME',
      'GROWTH_OUTCOME',
      'SKILL_ALIGNMENT',
      'MARKET_DEMAND',
      'LOCATION_FIT',
      'TIMING_FIT',
    ];

    for (const factor of factors) {
      this.weights.set(factor, {
        factor,
        weight: 0.5, // Start with equal weights
        confidence: 0,
        sampleSize: 0,
        lastUpdated: Date.now(),
        history: [{ timestamp: Date.now(), weight: 0.5 }],
      });
    }
  }

  /**
   * Update weights based on outcomes
   */
  updateWeights(outcomes: OutcomeLearningSignal[]): void {
    this.signals.push(...outcomes);

    for (const outcome of outcomes) {
      const factors = outcome.payload.factors || [];

      for (const factor of factors) {
        const outcomeFactor = factor as OutcomeFactor;
        const currentWeight = this.weights.get(outcomeFactor);

        if (currentWeight) {
          const updatedWeight = this.weightUpdater.updateWeight(currentWeight, outcome);
          updatedWeight.confidence = this.weightUpdater.calculateConfidence(updatedWeight.sampleSize);
          this.weights.set(outcomeFactor, updatedWeight);
        }
      }
    }

    // Recalculate importance
    this.recalculateImportance();
  }

  /**
   * Recalculate factor importance
   */
  private recalculateImportance(): void {
    for (const [factor, weight] of this.weights) {
      const correlationWithSuccess = this.correlationCalc.calculateSuccessCorrelation(
        this.signals,
        factor
      );

      const correlationWithSatisfaction = this.correlationCalc.calculateSatisfactionCorrelation(
        this.signals,
        factor
      );

      const predictivePower = this.predictivePowerCalc.calculate(this.signals, factor);
      const stability = this.stabilityCalc.calculate(weight);

      this.importance.set(factor, {
        factor,
        correlationWithSuccess,
        correlationWithSatisfaction,
        predictivePower,
        stability,
      });
    }
  }

  /**
   * Get current weight model
   */
  getCurrentModel(): OutcomeWeightModel {
    // Calculate trends
    const trends = new Map<OutcomeFactor, 'INCREASING' | 'STABLE' | 'DECREASING'>();
    for (const [factor, weight] of this.weights) {
      trends.set(factor, this.stabilityCalc.determineTrend(weight));
    }

    // Calculate validation score
    const validationScore = this.calculateValidationScore();

    // Calculate prediction accuracy
    const predictionAccuracy = this.calculatePredictionAccuracy();

    return {
      modelId: `model-${Date.now()}`,
      timestamp: Date.now(),
      weights: new Map(this.weights),
      importance: new Map(this.importance),
      trends,
      validationScore,
      predictionAccuracy,
    };
  }

  /**
   * Get factor weight
   */
  getFactorWeight(factor: OutcomeFactor): FactorWeight {
    return this.weights.get(factor) || {
      factor,
      weight: 0.5,
      confidence: 0,
      sampleSize: 0,
      lastUpdated: Date.now(),
      history: [],
    };
  }

  /**
   * Get factor importance
   */
  getFactorImportance(factor: OutcomeFactor): FactorImportance {
    return this.importance.get(factor) || {
      factor,
      correlationWithSuccess: 0,
      correlationWithSatisfaction: 0,
      predictivePower: 0,
      stability: 100,
    };
  }

  /**
   * Predict success based on factors
   */
  predictSuccess(factors: Map<OutcomeFactor, number>): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [factor, value] of factors) {
      const weight = this.weights.get(factor);
      if (weight) {
        weightedSum += value * weight.weight;
        totalWeight += weight.weight;
      }
    }

    if (totalWeight === 0) return 50;
    return weightedSum / totalWeight;
  }

  /**
   * Calculate validation score
   */
  private calculateValidationScore(): number {
    const importanceArray = Array.from(this.importance.values());
    if (importanceArray.length === 0) return 0;

    const avgPredictivePower = importanceArray.reduce(
      (sum, imp) => sum + imp.predictivePower, 0
    ) / importanceArray.length;

    const avgStability = importanceArray.reduce(
      (sum, imp) => sum + imp.stability, 0
    ) / importanceArray.length;

    return (avgPredictivePower + avgStability) / 2;
  }

  /**
   * Calculate prediction accuracy
   */
  private calculatePredictionAccuracy(): number {
    if (this.signals.length === 0) return 0;

    const correctPredictions = this.signals.filter(s => {
      const factors = new Map<OutcomeFactor, number>();
      for (const f of s.payload.factors || []) {
        factors.set(f as OutcomeFactor, s.payload.actualOutcome as number);
      }

      const predicted = this.predictSuccess(factors);
      const actual = s.payload.actualOutcome as number;

      return Math.abs(predicted - actual) < 15;
    }).length;

    return (correctPredictions / this.signals.length) * 100;
  }

  /**
   * Get top factors by weight
   */
  getTopFactors(count: number = 5): OutcomeFactor[] {
    const sorted = Array.from(this.weights.entries())
      .sort((a, b) => b[1].weight - a[1].weight);
    return sorted.slice(0, count).map(([factor]) => factor);
  }

  /**
   * Get factors needing improvement
   */
  getFactorsNeedingImprovement(): OutcomeFactor[] {
    return Array.from(this.importance.entries())
      .filter(([, importance]) => importance.predictivePower < 50)
      .map(([factor]) => factor);
  }

  /**
   * Get all signals
   */
  getAllSignals(): OutcomeLearningSignal[] {
    return [...this.signals];
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.signals = [];
    this.initializeWeights();
    this.importance.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalSignals: number;
    averageWeight: number;
    topFactor: OutcomeFactor | null;
    modelConfidence: number;
  } {
    const weightValues = Array.from(this.weights.values());
    const averageWeight = weightValues.length > 0
      ? weightValues.reduce((sum, w) => sum + w.weight, 0) / weightValues.length
      : 0;

    const sorted = Array.from(this.weights.entries())
      .sort((a, b) => b[1].weight - a[1].weight);

    const model = this.getCurrentModel();

    return {
      totalSignals: this.signals.length,
      averageWeight,
      topFactor: sorted.length > 0 ? sorted[0][0] : null,
      modelConfidence: model.validationScore,
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create outcome weight engine
 */
export function createOutcomeWeightEngine(
  config?: Partial<OutcomeLearningConfig>
): OutcomeWeightEngine {
  return new OutcomeWeightEngine(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  OutcomeWeightEngine,
  CorrelationCalculator,
  WeightUpdater,
  PredictivePowerCalculator,
  StabilityCalculator,
};
