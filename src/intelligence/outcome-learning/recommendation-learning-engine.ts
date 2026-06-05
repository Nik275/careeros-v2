/**
 * CareerOS Outcome Learning Engine - Recommendation Learning Engine
 *
 * Phase 9.0: Outcome Learning Engine
 *
 * Learns from recommendation outcomes to improve recommendation quality.
 *
 * @module intelligence/outcome-learning
 * @version 1.0.0
 */

import {
  type RecommendationLearningEntry,
  type RecommendationLearningReport,
  type LearningInsight,
  type IRecommendationLearningEngine,
  type OutcomeLearningConfig,
  DEFAULT_OUTCOME_LEARNING_CONFIG,
} from './learning-types.js';

import {
  type RecommendationId,
  type StudentId,
} from '../outcome-tracking/outcome-types.js';

// ============================================================================
// ACCURACY CALCULATOR
// ============================================================================

/**
 * Calculates accuracy metrics for recommendations
 */
class AccuracyCalculator {
  /**
   * Calculate overall accuracy for a set of entries
   */
  calculateOverall(entries: RecommendationLearningEntry[]): number {
    if (entries.length === 0) return 0;

    const totalAccuracy = entries.reduce((sum, entry) => sum + entry.accuracy, 0);
    return totalAccuracy / entries.length;
  }

  /**
   * Calculate accuracy by career
   */
  calculateByCareer(entries: RecommendationLearningEntry[]): Map<string, number> {
    const byCareer = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      const current = byCareer.get(entry.careerId) || { sum: 0, count: 0 };
      current.sum += entry.accuracy;
      current.count++;
      byCareer.set(entry.careerId, current);
    }

    const result = new Map<string, number>();
    for (const [careerId, data] of byCareer) {
      result.set(careerId, data.sum / data.count);
    }

    return result;
  }

  /**
   * Calculate accuracy by student segment
   */
  calculateBySegment(entries: RecommendationLearningEntry[]): Map<string, number> {
    // Simple segmentation by accuracy level
    const segments = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      let segment = 'MID';
      if (entry.predicted.matchScore >= 85) segment = 'HIGH_MATCH';
      else if (entry.predicted.matchScore <= 60) segment = 'LOW_MATCH';

      const current = segments.get(segment) || { sum: 0, count: 0 };
      current.sum += entry.accuracy;
      current.count++;
      segments.set(segment, current);
    }

    const result = new Map<string, number>();
    for (const [segment, data] of segments) {
      result.set(segment, data.sum / data.count);
    }

    return result;
  }

  /**
   * Calculate accuracy trend
   */
  calculateTrend(entries: RecommendationLearningEntry[]): 'IMPROVING' | 'STABLE' | 'DECLINING' {
    if (entries.length < 10) return 'STABLE';

    // Sort by timestamp
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    
    // Split into two halves
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const firstAccuracy = this.calculateOverall(firstHalf);
    const secondAccuracy = this.calculateOverall(secondHalf);

    const change = secondAccuracy - firstAccuracy;
    const threshold = 5; // 5% change threshold

    if (change > threshold) return 'IMPROVING';
    if (change < -threshold) return 'DECLINING';
    return 'STABLE';
  }
}

// ============================================================================
// UTILITY CALCULATOR
// ============================================================================

/**
 * Calculates utility metrics for recommendations
 */
class UtilityCalculator {
  /**
   * Calculate chosen rate
   */
  calculateChosenRate(entries: RecommendationLearningEntry[]): number {
    if (entries.length === 0) return 0;

    const chosen = entries.filter(e => e.actual.studentChose).length;
    return (chosen / entries.length) * 100;
  }

  /**
   * Calculate satisfaction rate
   */
  calculateSatisfactionRate(entries: RecommendationLearningEntry[]): number {
    if (entries.length === 0) return 0;

    const satisfied = entries.filter(e => e.actual.satisfaction >= 70).length;
    return (satisfied / entries.length) * 100;
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate(entries: RecommendationLearningEntry[]): number {
    if (entries.length === 0) return 0;

    const successful = entries.filter(e => e.actual.success).length;
    return (successful / entries.length) * 100;
  }
}

// ============================================================================
// STABILITY CALCULATOR
// ============================================================================

/**
 * Calculates stability metrics for recommendations
 */
class StabilityCalculator {
  /**
   * Calculate stability score
   */
  calculateStability(entries: RecommendationLearningEntry[]): number {
    if (entries.length < 2) return 100;

    // Calculate variance in accuracy
    const accuracies = entries.map(e => e.accuracy);
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    
    const squaredDiffs = accuracies.map(a => Math.pow(a - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / accuracies.length;
    
    // Convert variance to stability score (inverse relationship)
    const stability = Math.max(0, 100 - variance);
    return stability;
  }

  /**
   * Calculate volatility index
   */
  calculateVolatility(entries: RecommendationLearningEntry[]): number {
    if (entries.length < 2) return 0;

    // Calculate average absolute change between consecutive entries
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    let totalChange = 0;

    for (let i = 1; i < sorted.length; i++) {
      totalChange += Math.abs(sorted[i].accuracy - sorted[i - 1].accuracy);
    }

    return totalChange / (sorted.length - 1);
  }
}

// ============================================================================
// IMPACT CALCULATOR
// ============================================================================

/**
 * Calculates impact metrics for recommendations
 */
class ImpactCalculator {
  /**
   * Calculate positive impact
   */
  calculatePositiveImpact(entries: RecommendationLearningEntry[]): number {
    const positive = entries.filter(e => e.actual.success && e.actual.satisfaction >= 70);
    if (positive.length === 0) return 0;

    return positive.reduce((sum, e) => sum + e.actual.satisfaction, 0) / positive.length;
  }

  /**
   * Calculate negative impact
   */
  calculateNegativeImpact(entries: RecommendationLearningEntry[]): number {
    const negative = entries.filter(e => !e.actual.success || e.actual.satisfaction < 50);
    if (negative.length === 0) return 0;

    return negative.reduce((sum, e) => sum + (100 - e.actual.satisfaction), 0) / negative.length;
  }

  /**
   * Calculate net impact
   */
  calculateNetImpact(entries: RecommendationLearningEntry[]): number {
    const positive = this.calculatePositiveImpact(entries);
    const negative = this.calculateNegativeImpact(entries);
    return positive - negative;
  }
}

// ============================================================================
// INSIGHT GENERATOR
// ============================================================================

/**
 * Generates insights from recommendation learning data
 */
class InsightGenerator {
  /**
   * Identify strongest predictors
   */
  identifyStrongPredictors(entries: RecommendationLearningEntry[]): string[] {
    const factorAccuracy = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      for (const factor of entry.factors.accurate) {
        const current = factorAccuracy.get(factor) || { sum: 0, count: 0 };
        current.sum += entry.accuracy;
        current.count++;
        factorAccuracy.set(factor, current);
      }
    }

    // Sort by accuracy
    const sorted = [...factorAccuracy.entries()]
      .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count));

    return sorted.slice(0, 5).map(([factor]) => factor);
  }

  /**
   * Identify weakest predictors
   */
  identifyWeakPredictors(entries: RecommendationLearningEntry[]): string[] {
    const factorError = new Map<string, { sum: number; count: number }>();

    for (const entry of entries) {
      for (const factor of entry.factors.inaccurate) {
        const current = factorError.get(factor) || { sum: 0, count: 0 };
        current.sum += entry.predictionError;
        current.count++;
        factorError.set(factor, current);
      }
    }

    // Sort by error (descending)
    const sorted = [...factorError.entries()]
      .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count));

    return sorted.slice(0, 5).map(([factor]) => factor);
  }

  /**
   * Identify improving careers
   */
  identifyImprovingCareers(entries: RecommendationLearningEntry[]): string[] {
    const careerAccuracies = new Map<string, number[]>();

    for (const entry of entries) {
      const accuracies = careerAccuracies.get(entry.careerId) || [];
      accuracies.push(entry.accuracy);
      careerAccuracies.set(entry.careerId, accuracies);
    }

    const improving: string[] = [];

    for (const [careerId, accuracies] of careerAccuracies) {
      if (accuracies.length < 4) continue;

      const mid = Math.floor(accuracies.length / 2);
      const firstHalf = accuracies.slice(0, mid);
      const secondHalf = accuracies.slice(mid);

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 5) {
        improving.push(careerId);
      }
    }

    return improving;
  }

  /**
   * Identify failing careers
   */
  identifyFailingCareers(entries: RecommendationLearningEntry[]): string[] {
    const careerAccuracies = new Map<string, number[]>();

    for (const entry of entries) {
      const accuracies = careerAccuracies.get(entry.careerId) || [];
      accuracies.push(entry.accuracy);
      careerAccuracies.set(entry.careerId, accuracies);
    }

    const failing: string[] = [];

    for (const [careerId, accuracies] of careerAccuracies) {
      if (accuracies.length < 3) continue;

      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      if (avg < 50) {
        failing.push(careerId);
      }
    }

    return failing;
  }

  /**
   * Generate learning insights
   */
  generateInsights(entries: RecommendationLearningEntry[]): LearningInsight[] {
    const insights: LearningInsight[] = [];

    // Strong predictors insight
    const strongPredictors = this.identifyStrongPredictors(entries);
    if (strongPredictors.length > 0) {
      insights.push({
        insightId: `ins-${Date.now()}-strong`,
        category: 'PATTERN',
        title: 'Strong Predictors Identified',
        description: `The following factors are strong predictors of recommendation success: ${strongPredictors.join(', ')}`,
        evidence: strongPredictors,
        confidence: 0.8,
        actionRecommended: false,
      });
    }

    // Weak predictors insight
    const weakPredictors = this.identifyWeakPredictors(entries);
    if (weakPredictors.length > 0) {
      insights.push({
        insightId: `ins-${Date.now()}-weak`,
        category: 'RISK',
        title: 'Weak Predictors Identified',
        description: `The following factors need improvement: ${weakPredictors.join(', ')}`,
        evidence: weakPredictors,
        confidence: 0.75,
        actionRecommended: true,
        suggestedAction: 'Review and improve prediction models for these factors',
      });
    }

    // Improving careers insight
    const improving = this.identifyImprovingCareers(entries);
    if (improving.length > 0) {
      insights.push({
        insightId: `ins-${Date.now()}-improving`,
        category: 'OPPORTUNITY',
        title: 'Improving Recommendations',
        description: `Recommendations for these careers are showing improvement: ${improving.join(', ')}`,
        evidence: improving,
        confidence: 0.7,
        actionRecommended: false,
      });
    }

    // Failing careers insight
    const failing = this.identifyFailingCareers(entries);
    if (failing.length > 0) {
      insights.push({
        insightId: `ins-${Date.now()}-failing`,
        category: 'RISK',
        title: 'Failing Recommendations',
        description: `Recommendations for these careers need attention: ${failing.join(', ')}`,
        evidence: failing,
        confidence: 0.75,
        actionRecommended: true,
        suggestedAction: 'Investigate and improve recommendation models for these careers',
      });
    }

    return insights;
  }
}

// ============================================================================
// RECOMMENDATION LEARNING ENGINE
// ============================================================================

/**
 * Recommendation Learning Engine
 *
 * Tracks and learns from recommendation outcomes.
 */
class RecommendationLearningEngine implements IRecommendationLearningEngine {
  private config: OutcomeLearningConfig;
  private accuracyCalc: AccuracyCalculator;
  private utilityCalc: UtilityCalculator;
  private stabilityCalc: StabilityCalculator;
  private impactCalc: ImpactCalculator;
  private insightGen: InsightGenerator;
  
  private entries: RecommendationLearningEntry[] = [];
  private entriesByRecommendation: Map<string, RecommendationLearningEntry[]> = new Map();
  private entriesByCareer: Map<string, RecommendationLearningEntry[]> = new Map();

  constructor(config?: Partial<OutcomeLearningConfig>) {
    this.config = { ...DEFAULT_OUTCOME_LEARNING_CONFIG, ...config };
    this.accuracyCalc = new AccuracyCalculator();
    this.utilityCalc = new UtilityCalculator();
    this.stabilityCalc = new StabilityCalculator();
    this.impactCalc = new ImpactCalculator();
    this.insightGen = new InsightGenerator();
  }

  /**
   * Record a learning entry
   */
  recordEntry(entry: RecommendationLearningEntry): void {
    this.entries.push(entry);

    // Index by recommendation
    const byRec = this.entriesByRecommendation.get(entry.recommendationId) || [];
    byRec.push(entry);
    this.entriesByRecommendation.set(entry.recommendationId, byRec);

    // Index by career
    const byCareer = this.entriesByCareer.get(entry.careerId) || [];
    byCareer.push(entry);
    this.entriesByCareer.set(entry.careerId, byCareer);
  }

  /**
   * Generate learning report
   */
  generateReport(period: { start: number; end: number }): RecommendationLearningReport {
    // Filter entries by period
    const periodEntries = this.entries.filter(
      e => e.timestamp >= period.start && e.timestamp <= period.end
    );

    // Calculate metrics
    const accuracyOverall = this.accuracyCalc.calculateOverall(periodEntries);
    const accuracyByCareer = this.accuracyCalc.calculateByCareer(periodEntries);
    const accuracyBySegment = this.accuracyCalc.calculateBySegment(periodEntries);
    const accuracyTrend = this.accuracyCalc.calculateTrend(periodEntries);

    const utility = {
      chosenRate: this.utilityCalc.calculateChosenRate(periodEntries),
      satisfactionRate: this.utilityCalc.calculateSatisfactionRate(periodEntries),
      successRate: this.utilityCalc.calculateSuccessRate(periodEntries),
    };

    const stability = {
      score: this.stabilityCalc.calculateStability(periodEntries),
      volatilityIndex: this.stabilityCalc.calculateVolatility(periodEntries),
    };

    const impact = {
      positiveImpact: this.impactCalc.calculatePositiveImpact(periodEntries),
      negativeImpact: this.impactCalc.calculateNegativeImpact(periodEntries),
      netImpact: this.impactCalc.calculateNetImpact(periodEntries),
    };

    const insights = this.insightGen.generateInsights(periodEntries);

    return {
      reportId: `rep-${Date.now()}`,
      generatedAt: Date.now(),
      period,
      totalRecommendations: this.entries.length,
      trackedOutcomes: periodEntries.length,
      accuracy: {
        overall: accuracyOverall,
        byCareer: accuracyByCareer,
        byStudentSegment: accuracyBySegment,
        trend: accuracyTrend,
      },
      utility,
      stability,
      impact,
      insights: {
        strongestPredictors: this.insightGen.identifyStrongPredictors(periodEntries),
        weakestPredictors: this.insightGen.identifyWeakPredictors(periodEntries),
        improvingCareers: this.insightGen.identifyImprovingCareers(periodEntries),
        failingCareers: this.insightGen.identifyFailingCareers(periodEntries),
      },
    };
  }

  /**
   * Get accuracy for specific recommendation or overall
   */
  getAccuracy(recommendationId?: RecommendationId): number {
    if (recommendationId) {
      const entries = this.entriesByRecommendation.get(recommendationId) || [];
      return this.accuracyCalc.calculateOverall(entries);
    }
    return this.accuracyCalc.calculateOverall(this.entries);
  }

  /**
   * Get all learning insights
   */
  getInsights(): LearningInsight[] {
    return this.insightGen.generateInsights(this.entries);
  }

  /**
   * Get entries by career
   */
  getEntriesByCareer(careerId: string): RecommendationLearningEntry[] {
    return this.entriesByCareer.get(careerId) || [];
  }

  /**
   * Get entries by recommendation
   */
  getEntriesByRecommendation(recommendationId: RecommendationId): RecommendationLearningEntry[] {
    return this.entriesByRecommendation.get(recommendationId) || [];
  }

  /**
   * Get all entries
   */
  getAllEntries(): RecommendationLearningEntry[] {
    return [...this.entries];
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
    this.entriesByRecommendation.clear();
    this.entriesByCareer.clear();
  }

  /**
   * Get learning statistics
   */
  getStats(): {
    totalEntries: number;
    uniqueRecommendations: number;
    uniqueCareers: number;
    averageAccuracy: number;
  } {
    return {
      totalEntries: this.entries.length,
      uniqueRecommendations: this.entriesByRecommendation.size,
      uniqueCareers: this.entriesByCareer.size,
      averageAccuracy: this.getAccuracy(),
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create recommendation learning engine
 */
export function createRecommendationLearningEngine(
  config?: Partial<OutcomeLearningConfig>
): RecommendationLearningEngine {
  return new RecommendationLearningEngine(config);
}

/**
 * Create recommendation learning entry
 */
export function createRecommendationLearningEntry(
  recommendationId: RecommendationId,
  studentId: StudentId,
  careerId: string,
  predicted: RecommendationLearningEntry['predicted'],
  actual: RecommendationLearningEntry['actual'],
  overrides: Partial<RecommendationLearningEntry> = {}
): RecommendationLearningEntry {
  // Calculate accuracy
  const predictionError = Math.abs(predicted.successProbability - (actual.success ? 100 : 0));
  const accuracy = Math.max(0, 100 - predictionError);

  // Determine bias
  let bias: RecommendationLearningEntry['bias'] = 'CALIBRATED';
  if (predicted.successProbability > (actual.success ? 80 : 20)) {
    bias = 'OPTIMISTIC';
  } else if (predicted.successProbability < (actual.success ? 80 : 20)) {
    bias = 'PESSIMISTIC';
  }

  return {
    entryId: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    recommendationId,
    studentId,
    careerId,
    predicted,
    actual,
    accuracy,
    predictionError,
    bias,
    factors: {
      accurate: [],
      inaccurate: [],
      missing: [],
    },
    ...overrides,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  RecommendationLearningEngine,
  AccuracyCalculator,
  UtilityCalculator,
  StabilityCalculator,
  ImpactCalculator,
  InsightGenerator,
};
