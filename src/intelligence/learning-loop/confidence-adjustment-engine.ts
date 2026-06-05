/**
 * Confidence Adjustment Engine
 *
 * Dynamically adjusts recommendation confidence based on outcome data,
 * population patterns, and learning history.
 */

import {
  ConfidenceScore,
  ConfidenceAdjustmentRule,
  ConfidenceAdjustmentResult,
  AdjustmentEvidence,
  OutcomeFeedback,
  SuccessLevel,
  Timestamp,
} from './learning-loop-types';

export interface AdjustmentContext {
  recommendationType: string;
  category: string;
  studentProfileSignature: string;
  historicalOutcomes: OutcomeFeedback[];
  populationSuccessRate: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  currentConfidence: ConfidenceScore;
}

export interface ConfidenceAdjustmentEngineOptions {
  maxAdjustmentPerCycle: number;
  minConfidence: number;
  maxConfidence: number;
  learningRate: number;
  momentumFactor: number;
}

export const DEFAULT_ADJUSTMENT_OPTIONS: ConfidenceAdjustmentEngineOptions = {
  maxAdjustmentPerCycle: 0.15,
  minConfidence: 0.1,
  maxConfidence: 0.99,
  learningRate: 0.05,
  momentumFactor: 0.3,
};

export class ConfidenceAdjustmentEngine {
  private rules: Map<string, ConfidenceAdjustmentRule> = new Map();
  private adjustmentHistory: Array<{
    timestamp: Timestamp;
    recommendationType: string;
    originalConfidence: number;
    adjustedConfidence: number;
    rulesApplied: string[];
  }> = [];
  private options: ConfidenceAdjustmentEngineOptions;
  private momentumMap: Map<string, number> = new Map();

  constructor(options: Partial<ConfidenceAdjustmentEngineOptions> = {}) {
    this.options = { ...DEFAULT_ADJUSTMENT_OPTIONS, ...options };
    this.initializeDefaultRules();
  }

  /**
   * Initialize default adjustment rules
   */
  private initializeDefaultRules(): void {
    // Rule 1: High satisfaction boost
    this.addRule({
      id: 'high-satisfaction-boost',
      name: 'High Satisfaction Confidence Boost',
      condition: {
        type: 'outcome_based',
        threshold: 0.8,
        lookbackPeriod: 30 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 5,
      },
      action: {
        type: 'increase',
        magnitude: 0.05,
        minimumConfidence: 0.5,
        maximumConfidence: 0.99,
        reasoning: 'High satisfaction scores indicate recommendation quality',
      },
      priority: 1,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.8,
    });

    // Rule 2: High regret reduction
    this.addRule({
      id: 'high-regret-reduction',
      name: 'High Regret Confidence Reduction',
      condition: {
        type: 'outcome_based',
        threshold: 0.6,
        lookbackPeriod: 30 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 3,
      },
      action: {
        type: 'decrease',
        magnitude: 0.1,
        minimumConfidence: 0.1,
        maximumConfidence: 0.95,
        reasoning: 'High regret indicates misalignment with student needs',
      },
      priority: 2,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.85,
    });

    // Rule 3: Declining trend reduction
    this.addRule({
      id: 'declining-trend-reduction',
      name: 'Declining Trend Confidence Reduction',
      condition: {
        type: 'pattern_based',
        threshold: 0.1,
        lookbackPeriod: 60 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 10,
      },
      action: {
        type: 'decrease',
        magnitude: 0.08,
        minimumConfidence: 0.2,
        maximumConfidence: 0.95,
        reasoning: 'Declining trend in outcomes suggests recommendation quality is decreasing',
      },
      priority: 3,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.75,
    });

    // Rule 4: Population underperformance reduction
    this.addRule({
      id: 'population-underperformance',
      name: 'Population Underperformance Reduction',
      condition: {
        type: 'population_based',
        threshold: 0.5,
        lookbackPeriod: 90 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 20,
      },
      action: {
        type: 'decrease',
        magnitude: 0.12,
        minimumConfidence: 0.2,
        maximumConfidence: 0.9,
        reasoning: 'Population-level underperformance indicates systematic issues',
      },
      priority: 1,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.9,
    });

    // Rule 5: Excellence boost
    this.addRule({
      id: 'excellence-boost',
      name: 'Excellence Performance Boost',
      condition: {
        type: 'outcome_based',
        threshold: 0.9,
        lookbackPeriod: 60 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 3,
      },
      action: {
        type: 'increase',
        magnitude: 0.08,
        minimumConfidence: 0.6,
        maximumConfidence: 0.99,
        reasoning: 'Excellent outcomes warrant higher confidence',
      },
      priority: 1,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.8,
    });

    // Rule 6: Success streak boost
    this.addRule({
      id: 'success-streak-boost',
      name: 'Success Streak Confidence Boost',
      condition: {
        type: 'pattern_based',
        threshold: 0.8,
        lookbackPeriod: 30 * 24 * 60 * 60 * 1000,
        requiredSampleSize: 5,
      },
      action: {
        type: 'increase',
        magnitude: 0.06,
        minimumConfidence: 0.5,
        maximumConfidence: 0.99,
        reasoning: 'Consistent success pattern validates recommendation approach',
      },
      priority: 2,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.75,
    });

    // Rule 7: New recommendation cap
    this.addRule({
      id: 'new-recommendation-cap',
      name: 'New Recommendation Confidence Cap',
      condition: {
        type: 'temporal',
        threshold: 0,
        lookbackPeriod: 0,
        requiredSampleSize: 0,
      },
      action: {
        type: 'cap',
        magnitude: 0,
        minimumConfidence: 0.1,
        maximumConfidence: 0.85,
        reasoning: 'New recommendations without historical data should start with moderate confidence',
      },
      priority: 0,
      isActive: true,
      applicationCount: 0,
      effectivenessScore: 0.9,
    });
  }

  /**
   * Add a new adjustment rule
   */
  addRule(rule: ConfidenceAdjustmentRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an adjustment rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Enable/disable a rule
   */
  setRuleActive(ruleId: string, isActive: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = isActive;
    }
  }

  /**
   * Calculate confidence adjustment
   */
  calculateAdjustment(
    currentConfidence: ConfidenceScore,
    context: AdjustmentContext
  ): ConfidenceAdjustmentResult {
    const applicableRules = this.findApplicableRules(context);
    const evidence: AdjustmentEvidence[] = [];
    let totalAdjustment = 0;
    const rulesApplied: string[] = [];
    const reasoning: string[] = [];

    // Apply each applicable rule
    for (const rule of applicableRules) {
      const ruleAdjustment = this.applyRule(rule, context, evidence);
      
      if (ruleAdjustment !== 0) {
        totalAdjustment += ruleAdjustment;
        rulesApplied.push(rule.id);
        reasoning.push(rule.action.reasoning);
        rule.applicationCount++;
      }
    }

    // Apply momentum
    const momentumKey = `${context.recommendationType}:${context.category}`;
    const previousMomentum = this.momentumMap.get(momentumKey) || 0;
    const momentum = previousMomentum * this.options.momentumFactor;
    totalAdjustment += momentum;

    // Update momentum
    if (Math.abs(totalAdjustment) > 0.01) {
      this.momentumMap.set(momentumKey, totalAdjustment);
    }

    // Limit adjustment magnitude
    totalAdjustment = Math.max(
      -this.options.maxAdjustmentPerCycle,
      Math.min(this.options.maxAdjustmentPerCycle, totalAdjustment)
    );

    // Calculate new confidence
    let adjustedConfidence = currentConfidence + totalAdjustment;
    
    // Apply bounds
    adjustedConfidence = Math.max(
      this.options.minConfidence,
      Math.min(this.options.maxConfidence, adjustedConfidence)
    );

    // Record adjustment
    this.recordAdjustment(
      context.recommendationType,
      currentConfidence,
      adjustedConfidence,
      rulesApplied
    );

    // Calculate confidence in this adjustment
    const adjustmentConfidence = this.calculateAdjustmentConfidence(
      applicableRules.length,
      context.historicalOutcomes.length
    );

    return {
      originalConfidence: currentConfidence,
      adjustedConfidence,
      adjustmentAmount: adjustedConfidence - currentConfidence,
      rulesApplied,
      reasoning,
      evidence,
      confidence: adjustmentConfidence,
    };
  }

  /**
   * Find applicable rules for context
   */
  private findApplicableRules(context: AdjustmentContext): ConfidenceAdjustmentRule[] {
    const applicable: ConfidenceAdjustmentRule[] = [];

    for (const rule of Array.from(this.rules.values())) {
      if (!rule.isActive) continue;

      if (this.isRuleApplicable(rule, context)) {
        applicable.push(rule);
      }
    }

    // Sort by priority
    return applicable.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if a rule is applicable
   */
  private isRuleApplicable(
    rule: ConfidenceAdjustmentRule,
    context: AdjustmentContext
  ): boolean {
    const recentOutcomes = this.getRecentOutcomes(
      context.historicalOutcomes,
      rule.condition.lookbackPeriod
    );

    if (recentOutcomes.length < rule.condition.requiredSampleSize) {
      return false;
    }

    switch (rule.condition.type) {
      case 'outcome_based':
        return this.checkOutcomeCondition(rule, recentOutcomes);
      
      case 'pattern_based':
        return this.checkPatternCondition(rule, recentOutcomes, context);
      
      case 'population_based':
        return this.checkPopulationCondition(rule, context);
      
      case 'temporal':
        return recentOutcomes.length === 0; // Only apply to new recommendations
      
      default:
        return false;
    }
  }

  /**
   * Check outcome-based condition
   */
  private checkOutcomeCondition(
    rule: ConfidenceAdjustmentRule,
    outcomes: OutcomeFeedback[]
  ): boolean {
    if (rule.id === 'high-satisfaction-boost' || rule.id === 'excellence-boost') {
      const avgSatisfaction =
        outcomes.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) /
        outcomes.length;
      return avgSatisfaction >= rule.condition.threshold;
    }

    if (rule.id === 'high-regret-reduction') {
      const avgRegret =
        outcomes.reduce((sum, o) => sum + o.metrics.regretScore, 0) /
        outcomes.length;
      return avgRegret >= rule.condition.threshold;
    }

    return false;
  }

  /**
   * Check pattern-based condition
   */
  private checkPatternCondition(
    rule: ConfidenceAdjustmentRule,
    outcomes: OutcomeFeedback[],
    context: AdjustmentContext
  ): boolean {
    if (rule.id === 'declining-trend-reduction') {
      return context.recentTrend === 'declining';
    }

    if (rule.id === 'success-streak-boost') {
      const successCount = outcomes.filter(o =>
        ['excellent', 'good'].includes(o.successLevel)
      ).length;
      const successRate = successCount / outcomes.length;
      return successRate >= rule.condition.threshold;
    }

    return false;
  }

  /**
   * Check population-based condition
   */
  private checkPopulationCondition(
    rule: ConfidenceAdjustmentRule,
    context: AdjustmentContext
  ): boolean {
    if (rule.id === 'population-underperformance') {
      return context.populationSuccessRate < rule.condition.threshold;
    }
    return false;
  }

  /**
   * Apply a rule and return adjustment
   */
  private applyRule(
    rule: ConfidenceAdjustmentRule,
    context: AdjustmentContext,
    evidence: AdjustmentEvidence[]
  ): number {
    const recentOutcomes = this.getRecentOutcomes(
      context.historicalOutcomes,
      rule.condition.lookbackPeriod
    );

    let adjustment = 0;

    switch (rule.action.type) {
      case 'increase':
        adjustment = rule.action.magnitude;
        break;
      case 'decrease':
        adjustment = -rule.action.magnitude;
        break;
      case 'cap':
        if (context.currentConfidence > rule.action.maximumConfidence) {
          adjustment = rule.action.maximumConfidence - context.currentConfidence;
        }
        break;
      case 'reset':
        adjustment = rule.action.minimumConfidence - context.currentConfidence;
        break;
    }

    // Add evidence
    evidence.push({
      source: rule.id,
      metric: rule.condition.type,
      value: this.calculateEvidenceValue(rule, recentOutcomes, context),
      weight: rule.effectivenessScore,
    });

    return adjustment;
  }

  /**
   * Calculate evidence value
   */
  private calculateEvidenceValue(
    rule: ConfidenceAdjustmentRule,
    outcomes: OutcomeFeedback[],
    context: AdjustmentContext
  ): number {
    switch (rule.condition.type) {
      case 'outcome_based':
        if (outcomes.length === 0) return 0;
        return (
          outcomes.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) /
          outcomes.length
        );
      case 'pattern_based':
        return context.recentTrend === 'improving' ? 0.8 : 0.2;
      case 'population_based':
        return context.populationSuccessRate;
      default:
        return 0.5;
    }
  }

  /**
   * Get recent outcomes within time window
   */
  private getRecentOutcomes(
    outcomes: OutcomeFeedback[],
    lookbackPeriod: number
  ): OutcomeFeedback[] {
    const cutoff = Date.now() - lookbackPeriod;
    return outcomes.filter(o => o.timeline.recommendationGiven >= cutoff);
  }

  /**
   * Calculate confidence in the adjustment
   */
  private calculateAdjustmentConfidence(
    rulesApplied: number,
    sampleSize: number
  ): number {
    const ruleConfidence = Math.min(1, rulesApplied / 3);
    const sampleConfidence = Math.min(1, sampleSize / 20);
    return (ruleConfidence + sampleConfidence) / 2;
  }

  /**
   * Record adjustment in history
   */
  private recordAdjustment(
    recommendationType: string,
    originalConfidence: number,
    adjustedConfidence: number,
    rulesApplied: string[]
  ): void {
    this.adjustmentHistory.push({
      timestamp: Date.now(),
      recommendationType,
      originalConfidence,
      adjustedConfidence,
      rulesApplied,
    });

    // Keep history manageable
    if (this.adjustmentHistory.length > 1000) {
      this.adjustmentHistory.shift();
    }
  }

  /**
   * Batch adjust multiple recommendations
   */
  batchAdjust(
    recommendations: Array<{
      recommendationType: string;
      category: string;
      currentConfidence: ConfidenceScore;
      context: AdjustmentContext;
    }>
  ): Array<{
    recommendationType: string;
    category: string;
    result: ConfidenceAdjustmentResult;
  }> {
    return recommendations.map(rec => ({
      recommendationType: rec.recommendationType,
      category: rec.category,
      result: this.calculateAdjustment(rec.currentConfidence, rec.context),
    }));
  }

  /**
   * Get adjustment history for a recommendation type
   */
  getAdjustmentHistory(
    recommendationType: string,
    limit: number = 50
  ): Array<{
    timestamp: Timestamp;
    originalConfidence: number;
    adjustedConfidence: number;
    rulesApplied: string[];
  }> {
    return this.adjustmentHistory
      .filter(h => h.recommendationType === recommendationType)
      .slice(-limit);
  }

  /**
   * Get rule statistics
   */
  getRuleStats(): Array<{
    ruleId: string;
    ruleName: string;
    applicationCount: number;
    isActive: boolean;
    effectivenessScore: number;
  }> {
    return Array.from(this.rules.values()).map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      applicationCount: rule.applicationCount,
      isActive: rule.isActive,
      effectivenessScore: rule.effectivenessScore,
    }));
  }

  /**
   * Update rule effectiveness
   */
  updateRuleEffectiveness(ruleId: string, newEffectiveness: number): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.effectivenessScore = Math.max(0, Math.min(1, newEffectiveness));
    }
  }

  /**
   * Reset momentum for a recommendation
   */
  resetMomentum(recommendationType: string, category: string): void {
    const key = `${recommendationType}:${category}`;
    this.momentumMap.delete(key);
  }

  /**
   * Get all active rules
   */
  getActiveRules(): ConfidenceAdjustmentRule[] {
    return Array.from(this.rules.values()).filter(r => r.isActive);
  }

  /**
   * Export all rules
   */
  exportRules(): ConfidenceAdjustmentRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Import rules
   */
  importRules(rules: ConfidenceAdjustmentRule[]): void {
    this.rules.clear();
    rules.forEach(rule => this.rules.set(rule.id, rule));
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.rules.clear();
    this.adjustmentHistory = [];
    this.momentumMap.clear();
    this.initializeDefaultRules();
  }

  /**
   * Get adjustment statistics
   */
  getStatistics(): {
    totalAdjustments: number;
    averageAdjustment: number;
    rulesUsed: number;
    mostAppliedRule: string | null;
  } {
    if (this.adjustmentHistory.length === 0) {
      return {
        totalAdjustments: 0,
        averageAdjustment: 0,
        rulesUsed: 0,
        mostAppliedRule: null,
      };
    }

    const totalAdjustments = this.adjustmentHistory.length;
    const adjustments = this.adjustmentHistory.map(
      h => h.adjustedConfidence - h.originalConfidence
    );
    const averageAdjustment =
      adjustments.reduce((a, b) => a + b, 0) / totalAdjustments;

    // Count rule applications
    const ruleCounts: Map<string, number> = new Map();
    this.adjustmentHistory.forEach(h => {
      h.rulesApplied.forEach(ruleId => {
        ruleCounts.set(ruleId, (ruleCounts.get(ruleId) || 0) + 1);
      });
    });

    let mostAppliedRule: string | null = null;
    let maxCount = 0;
    for (const [ruleId, count] of Array.from(ruleCounts.entries())) {
      if (count > maxCount) {
        maxCount = count;
        mostAppliedRule = ruleId;
      }
    }

    return {
      totalAdjustments,
      averageAdjustment,
      rulesUsed: ruleCounts.size,
      mostAppliedRule,
    };
  }
}
