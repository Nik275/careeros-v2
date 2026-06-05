/**
 * CareerOS Outcome Learning Engine - Learning Report Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Generates comprehensive learning reports.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type LearningReport,
  type PredictorPerformance,
  type LearningInsight,
  type ILearningReportEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
  type OutcomeLearningSignal,
  type SignalType,
} from './learning-types.js';

// ============================================================================
// LEARNING VELOCITY CALCULATOR
// ============================================================================

/**
 * Calculates learning velocity
 */
class LearningVelocityCalculator {
  /**
   * Calculate learning velocity
   */
  calculate(signals: OutcomeLearningSignal[], period: number): number {
    if (period === 0) return 0;

    const appliedSignals = signals.filter(s => s.learningApplied).length;
    const velocity = (appliedSignals / period) * 24 * 60 * 60 * 1000; // Per day

    return Math.min(100, velocity * 10); // Scale to 0-100
  }
}

// ============================================================================
// KNOWLEDGE GROWTH CALCULATOR
// ============================================================================

/**
 * Calculates knowledge growth
 */
class KnowledgeGrowthCalculator {
  /**
   * Calculate knowledge growth
   */
  calculate(signals: OutcomeLearningSignal[]): number {
    if (signals.length === 0) return 0;

    // Calculate based on unique factors learned
    const uniqueFactors = new Set(signals.flatMap(s => s.payload.factors || []));
    const totalPossibleFactors = 10; // Assuming 10 outcome factors

    return Math.min(100, (uniqueFactors.size / totalPossibleFactors) * 100);
  }
}

// ============================================================================
// ACCURACY IMPROVEMENT CALCULATOR
// ============================================================================

/**
 * Calculates accuracy improvement
 */
class AccuracyImprovementCalculator {
  /**
   * Calculate accuracy improvement
   */
  calculate(signals: OutcomeLearningSignal[]): number {
    if (signals.length < 10) return 0;

    // Sort by timestamp
    const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);
    
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAccuracy = this.calculateAccuracy(firstHalf);
    const secondAccuracy = this.calculateAccuracy(secondHalf);

    return secondAccuracy - firstAccuracy;
  }

  private calculateAccuracy(signals: OutcomeLearningSignal[]): number {
    if (signals.length === 0) return 0;

    const lowError = signals.filter(s => s.payload.errorMagnitude < 20).length;
    return (lowError / signals.length) * 100;
  }
}

// ============================================================================
// PREDICTOR PERFORMANCE TRACKER
// ============================================================================

/**
 * Tracks predictor performance
 */
class PredictorPerformanceTracker {
  private performances: Map<string, PredictorPerformance> = new Map();

  /**
   * Record predictor performance
   */
  record(predictor: string, accuracy: number): void {
    const existing = this.performances.get(predictor);

    if (existing) {
      existing.previousAccuracy = existing.currentAccuracy;
      existing.currentAccuracy = accuracy;
      existing.change = accuracy - existing.previousAccuracy;
      existing.sampleSize++;
      existing.confidence = Math.min(0.95, existing.sampleSize / 100);
    } else {
      this.performances.set(predictor, {
        predictor,
        currentAccuracy: accuracy,
        previousAccuracy: accuracy,
        change: 0,
        sampleSize: 1,
        confidence: 0.01,
      });
    }
  }

  /**
   * Get strongest predictors
   */
  getStrongest(count: number = 5): PredictorPerformance[] {
    return Array.from(this.performances.values())
      .sort((a, b) => b.currentAccuracy - a.currentAccuracy)
      .slice(0, count);
  }

  /**
   * Get weakest predictors
   */
  getWeakest(count: number = 5): PredictorPerformance[] {
    return Array.from(this.performances.values())
      .sort((a, b) => a.currentAccuracy - b.currentAccuracy)
      .slice(0, count);
  }

  /**
   * Get improving predictors
   */
  getImproving(count: number = 5): PredictorPerformance[] {
    return Array.from(this.performances.values())
      .filter(p => p.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, count);
  }

  /**
   * Get declining predictors
   */
  getDeclining(count: number = 5): PredictorPerformance[] {
    return Array.from(this.performances.values())
      .filter(p => p.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, count);
  }

  /**
   * Get all performances
   */
  getAll(): Map<string, PredictorPerformance> {
    return new Map(this.performances);
  }

  /**
   * Clear all performances
   */
  clear(): void {
    this.performances.clear();
  }
}

// ============================================================================
// INSIGHT GENERATOR
// ============================================================================

/**
 * Generates learning insights
 */
class InsightGenerator {
  /**
   * Generate insights from signals
   */
  generate(signals: OutcomeLearningSignal[]): LearningInsight[] {
    const insights: LearningInsight[] = [];

    // Pattern insights
    const patternInsight = this.generatePatternInsight(signals);
    if (patternInsight) insights.push(patternInsight);

    // Anomaly insights
    const anomalyInsight = this.generateAnomalyInsight(signals);
    if (anomalyInsight) insights.push(anomalyInsight);

    // Opportunity insights
    const opportunityInsight = this.generateOpportunityInsight(signals);
    if (opportunityInsight) insights.push(opportunityInsight);

    // Risk insights
    const riskInsight = this.generateRiskInsight(signals);
    if (riskInsight) insights.push(riskInsight);

    return insights;
  }

  private generatePatternInsight(signals: OutcomeLearningSignal[]): LearningInsight | null {
    const positiveRate = signals.filter(s => 
      s.signalType === 'POSITIVE' || s.signalType === 'GROWTH'
    ).length / Math.max(1, signals.length);

    if (positiveRate > 0.7) {
      return {
        insightId: `ins-${Date.now()}-pattern`,
        category: 'PATTERN',
        title: 'Strong Positive Learning Pattern',
        description: 'System is showing consistent positive learning patterns with high success rates.',
        evidence: [`${(positiveRate * 100).toFixed(1)}% positive signals`],
        confidence: positiveRate,
        actionRecommended: false,
      };
    }

    return null;
  }

  private generateAnomalyInsight(signals: OutcomeLearningSignal[]): LearningInsight | null {
    const unexpectedCount = signals.filter(s => s.signalType === 'UNEXPECTED').length;
    
    if (unexpectedCount > signals.length * 0.2) {
      return {
        insightId: `ins-${Date.now()}-anomaly`,
        category: 'ANOMALY',
        title: 'High Rate of Unexpected Outcomes',
        description: 'System is experiencing more unexpected outcomes than normal. Model may need adjustment.',
        evidence: [`${unexpectedCount} unexpected outcomes detected`],
        confidence: 0.75,
        actionRecommended: true,
        suggestedAction: 'Review prediction models for potential biases or gaps',
      };
    }

    return null;
  }

  private generateOpportunityInsight(signals: OutcomeLearningSignal[]): LearningInsight | null {
    const regressionSignals = signals.filter(s => s.signalType === 'REGRESSION');
    
    if (regressionSignals.length > 0) {
      const factors = [...new Set(regressionSignals.flatMap(s => s.payload.factors || []))];
      
      return {
        insightId: `ins-${Date.now()}-opportunity`,
        category: 'OPPORTUNITY',
        title: 'Growth Opportunity Identified',
        description: 'Addressing regression patterns could significantly improve outcomes.',
        evidence: factors,
        confidence: 0.7,
        actionRecommended: true,
        suggestedAction: 'Focus on improving predictions for identified factors',
      };
    }

    return null;
  }

  private generateRiskInsight(signals: OutcomeLearningSignal[]): LearningInsight | null {
    const highErrorSignals = signals.filter(s => s.payload.errorMagnitude > 50);
    
    if (highErrorSignals.length > signals.length * 0.1) {
      return {
        insightId: `ins-${Date.now()}-risk`,
        category: 'RISK',
        title: 'High Prediction Error Rate',
        description: 'Significant portion of predictions have high error rates.',
        evidence: [`${highErrorSignals.length} high-error predictions`],
        confidence: 0.8,
        actionRecommended: true,
        suggestedAction: 'Investigate prediction accuracy and consider model retraining',
      };
    }

    return null;
  }
}

// ============================================================================
// LEARNING REPORT ENGINE
// ============================================================================

/**
 * Learning Report Engine
 *
 * Generates comprehensive learning reports.
 */
class LearningReportEngine implements ILearningReportEngine {
  private config: OutcomeLearningConfig;
  private velocityCalc: LearningVelocityCalculator;
  private growthCalc: KnowledgeGrowthCalculator;
  private accuracyCalc: AccuracyImprovementCalculator;
  private performanceTracker: PredictorPerformanceTracker;
  private insightGen: InsightGenerator;

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.velocityCalc = new LearningVelocityCalculator();
    this.growthCalc = new KnowledgeGrowthCalculator();
    this.accuracyCalc = new AccuracyImprovementCalculator();
    this.performanceTracker = new PredictorPerformanceTracker();
    this.insightGen = new InsightGenerator();
  }

  /**
   * Generate comprehensive learning report
   */
  generateReport(period: { start: number; end: number }): LearningReport {
    const duration = period.end - period.start;

    // Get signals in period
    const signals: OutcomeLearningSignal[] = []; // Would be populated from actual data

    // Calculate metrics
    const learningVelocity = this.velocityCalc.calculate(signals, duration);
    const knowledgeGrowth = this.growthCalc.calculate(signals);
    const accuracyImprovement = this.accuracyCalc.calculate(signals);
    const confidenceImprovement = accuracyImprovement * 0.8; // Approximation

    // Get predictor performances
    const strongest = this.performanceTracker.getStrongest();
    const weakest = this.performanceTracker.getWeakest();
    const improving = this.performanceTracker.getImproving();
    const declining = this.performanceTracker.getDeclining();

    // Generate insights
    const insights = this.insightGen.generate(signals);

    // Determine outcome trend
    const recentAccuracy = this.calculateRecentAccuracy(signals);
    const previousAccuracy = this.calculatePreviousAccuracy(signals);
    const trend: LearningReport['outcomes']['trend'] = 
      recentAccuracy > previousAccuracy + 5 ? 'IMPROVING' :
      recentAccuracy < previousAccuracy - 5 ? 'DECLINING' : 'STABLE';

    // Determine recommendations
    const recommendations = this.generateRecommendations(insights, weakest);

    return {
      reportId: `rep-${Date.now()}`,
      generatedAt: Date.now(),
      period,
      system: {
        learningVelocity,
        knowledgeGrowth,
        accuracyImprovement,
        confidenceImprovement,
      },
      predictors: {
        strongest,
        weakest,
        improving,
        declining,
      },
      recommendations: {
        improving: improving.map(p => p.predictor),
        failing: declining.map(p => p.predictor),
        newSuccessPatterns: this.identifySuccessPatterns(signals),
        newFailurePatterns: this.identifyFailurePatterns(signals),
      },
      calibration: {
        reliability: 85, // Placeholder
        bias: 'OVERCONFIDENT', // Placeholder
        adjustmentNeeded: false, // Placeholder
      },
      outcomes: {
        accuracy: recentAccuracy,
        quality: 'GOOD', // Placeholder
        trend,
      },
      insights,
      recommendations,
    };
  }

  /**
   * Get predictor performance
   */
  getPredictorPerformance(predictor: string): PredictorPerformance {
    const all = this.performanceTracker.getAll();
    return all.get(predictor) || {
      predictor,
      currentAccuracy: 0,
      previousAccuracy: 0,
      change: 0,
      sampleSize: 0,
      confidence: 0,
    };
  }

  /**
   * Get insights by category
   */
  getInsights(category?: string): LearningInsight[] {
    const allInsights = this.insightGen.generate([]);
    
    if (category) {
      return allInsights.filter(i => i.category === category);
    }

    return allInsights;
  }

  /**
   * Export report
   */
  exportReport(reportId: string): string {
    // In a real implementation, this would serialize the report
    return JSON.stringify({ reportId, exportedAt: Date.now() });
  }

  /**
   * Record predictor performance
   */
  recordPerformance(predictor: string, accuracy: number): void {
    this.performanceTracker.record(predictor, accuracy);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private calculateRecentAccuracy(signals: OutcomeLearningSignal[]): number {
    const recent = signals.slice(-Math.min(50, signals.length));
    if (recent.length === 0) return 0;

    const lowError = recent.filter(s => s.payload.errorMagnitude < 20).length;
    return (lowError / recent.length) * 100;
  }

  private calculatePreviousAccuracy(signals: OutcomeLearningSignal[]): number {
    if (signals.length <= 50) return 0;

    const previous = signals.slice(-100, -50);
    const lowError = previous.filter(s => s.payload.errorMagnitude < 20).length;
    return (lowError / previous.length) * 100;
  }

  private identifySuccessPatterns(signals: OutcomeLearningSignal[]): string[] {
    const successSignals = signals.filter(s => 
      s.signalType === 'POSITIVE' || s.signalType === 'GROWTH'
    );

    const factorCounts = new Map<string, number>();
    for (const signal of successSignals) {
      for (const factor of signal.payload.factors || []) {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      }
    }

    return [...factorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor]) => factor);
  }

  private identifyFailurePatterns(signals: OutcomeLearningSignal[]): string[] {
    const failureSignals = signals.filter(s => 
      s.signalType === 'NEGATIVE' || s.signalType === 'REGRESSION'
    );

    const factorCounts = new Map<string, number>();
    for (const signal of failureSignals) {
      for (const factor of signal.payload.factors || []) {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      }
    }

    return [...factorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor]) => factor);
  }

  private generateRecommendations(insights: LearningInsight[], weakest: PredictorPerformance[]): string[] {
    const recommendations: string[] = [];

    // Add recommendations based on insights
    for (const insight of insights) {
      if (insight.actionRecommended && insight.suggestedAction) {
        recommendations.push(insight.suggestedAction);
      }
    }

    // Add recommendations for weak predictors
    if (weakest.length > 0) {
      recommendations.push(
        `Focus on improving: ${weakest.slice(0, 3).map(p => p.predictor).join(', ')}`
      );
    }

    return recommendations;
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create learning report engine
 */
export function createLearningReportEngine(
  config?: Partial<OutcomeLearningConfig>
): LearningReportEngine {
  return new LearningReportEngine(config);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  LearningReportEngine,
  LearningVelocityCalculator,
  KnowledgeGrowthCalculator,
  AccuracyImprovementCalculator,
  PredictorPerformanceTracker,
  InsightGenerator,
};
