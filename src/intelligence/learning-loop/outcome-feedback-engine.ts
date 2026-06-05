/**
 * Outcome Feedback Engine
 *
 * Tracks the complete outcome lifecycle from recommendation through
 * short, medium, and long-term outcomes. Extracts lessons and impacts.
 */

import {
  OutcomeFeedback,
  OutcomeTimeline,
  OutcomeMetrics,
  SuccessLevel,
  ConfidenceImpact,
  RecommendationImpact,
  ContextualFactors,
  Timestamp,
  SatisfactionScore,
  RegretScore,
} from './learning-loop-types';

export interface OutcomeRecord {
  id: string;
  recommendationId: string;
  studentId: string;
  timeline: OutcomeTimeline;
  metrics: Partial<OutcomeMetrics>;
  contextualFactors: Partial<ContextualFactors>;
  status: 'pending' | 'partial' | 'complete';
}

export interface OutcomeFeedbackEngineOptions {
  shortTermWindow?: number; // milliseconds
  mediumTermWindow?: number;
  longTermWindow?: number;
  autoCloseIncomplete?: boolean;
}

export const DEFAULT_OUTCOME_OPTIONS: OutcomeFeedbackEngineOptions = {
  shortTermWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
  mediumTermWindow: 30 * 24 * 60 * 60 * 1000, // 30 days
  longTermWindow: 90 * 24 * 60 * 60 * 1000, // 90 days
  autoCloseIncomplete: true,
};

export class OutcomeFeedbackEngine {
  private outcomes: Map<string, OutcomeRecord> = new Map();
  private feedbacks: Map<string, OutcomeFeedback> = new Map();
  private pendingTimers: Map<string, NodeJS.Timeout> = new Map();
  private options: OutcomeFeedbackEngineOptions;

  constructor(options: OutcomeFeedbackEngineOptions = {}) {
    this.options = { ...DEFAULT_OUTCOME_OPTIONS, ...options };
  }

  /**
   * Initialize tracking for a new recommendation outcome
   */
  trackOutcome(
    recommendationId: string,
    studentId: string,
    originalConfidence: number,
    contextualFactors?: Partial<ContextualFactors>
  ): string {
    const id = `outcome-${recommendationId}-${Date.now()}`;
    const now = Date.now();

    const outcome: OutcomeRecord = {
      id,
      recommendationId,
      studentId,
      timeline: {
        recommendationGiven: now,
        studentDecision: now,
      },
      metrics: {
        satisfactionScore: 0,
        regretScore: 0,
        confidenceChange: 0,
        goalAchievementRate: 0,
        skillGrowthRate: 0,
        careerProgressionRate: 0,
      },
      contextualFactors: contextualFactors || {},
      status: 'pending',
    };

    this.outcomes.set(id, outcome);

    // Set up automatic check-ins
    this.scheduleCheckIns(id);

    return id;
  }

  /**
   * Record when student makes a decision on the recommendation
   */
  recordDecision(outcomeId: string, decisionTimestamp?: Timestamp): void {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return;

    outcome.timeline.studentDecision = decisionTimestamp || Date.now();
  }

  /**
   * Record short-term outcome (7 days)
   */
  recordShortTermOutcome(
    outcomeId: string,
    metrics: Partial<OutcomeMetrics>,
    timestamp?: Timestamp
  ): void {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return;

    outcome.timeline.shortTermOutcome = timestamp || Date.now();
    outcome.metrics = { ...outcome.metrics, ...metrics };
    outcome.status = 'partial';

    // Generate preliminary feedback
    this.generateFeedback(outcomeId);
  }

  /**
   * Record medium-term outcome (30 days)
   */
  recordMediumTermOutcome(
    outcomeId: string,
    metrics: Partial<OutcomeMetrics>,
    timestamp?: Timestamp
  ): void {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return;

    outcome.timeline.mediumTermOutcome = timestamp || Date.now();
    outcome.metrics = { ...outcome.metrics, ...metrics };

    // Update feedback with new data
    this.generateFeedback(outcomeId);
  }

  /**
   * Record long-term outcome (90 days)
   */
  recordLongTermOutcome(
    outcomeId: string,
    metrics: Partial<OutcomeMetrics>,
    timestamp?: Timestamp
  ): OutcomeFeedback | null {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return null;

    outcome.timeline.longTermOutcome = timestamp || Date.now();
    outcome.metrics = { ...outcome.metrics, ...metrics };
    outcome.status = 'complete';

    // Clear timers
    this.clearTimers(outcomeId);

    // Generate final feedback
    return this.generateFeedback(outcomeId);
  }

  /**
   * Record a quick outcome with all metrics at once
   */
  recordCompleteOutcome(
    outcomeId: string,
    metrics: OutcomeMetrics,
    contextualFactors?: Partial<ContextualFactors>
  ): OutcomeFeedback | null {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return null;

    const now = Date.now();
    outcome.timeline.shortTermOutcome = now;
    outcome.timeline.mediumTermOutcome = now;
    outcome.timeline.longTermOutcome = now;
    outcome.metrics = metrics;
    outcome.contextualFactors = { ...outcome.contextualFactors, ...contextualFactors };
    outcome.status = 'complete';

    this.clearTimers(outcomeId);
    return this.generateFeedback(outcomeId);
  }

  /**
   * Schedule automatic check-in reminders
   */
  private scheduleCheckIns(outcomeId: string): void {
    if (!this.options.autoCloseIncomplete) return;

    // Short-term check-in
    const shortTermTimer = setTimeout(() => {
      this.handleCheckIn(outcomeId, 'short-term');
    }, this.options.shortTermWindow!);

    // Medium-term check-in
    const mediumTermTimer = setTimeout(() => {
      this.handleCheckIn(outcomeId, 'medium-term');
    }, this.options.mediumTermWindow!);

    // Long-term check-in
    const longTermTimer = setTimeout(() => {
      this.handleCheckIn(outcomeId, 'long-term');
    }, this.options.longTermWindow!);

    this.pendingTimers.set(outcomeId, shortTermTimer);
  }

  /**
   * Handle automatic check-in
   */
  private handleCheckIn(outcomeId: string, phase: string): void {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return;

    // If outcome not recorded for this phase, mark as missing
    if (phase === 'short-term' && !outcome.timeline.shortTermOutcome) {
      // Auto-close with estimated metrics
      this.estimateMissingMetrics(outcome, phase);
    } else if (phase === 'long-term' && outcome.status !== 'complete') {
      // Auto-complete with available data
      outcome.status = 'complete';
      this.generateFeedback(outcomeId);
    }
  }

  /**
   * Estimate metrics for missing check-ins
   */
  private estimateMissingMetrics(outcome: OutcomeRecord, phase: string): void {
    // Conservative estimates based on available data
    if (phase === 'short-term') {
      outcome.timeline.shortTermOutcome = Date.now();
      // Assume neutral if no data
      outcome.metrics.satisfactionScore = outcome.metrics.satisfactionScore || 0.5;
      outcome.metrics.regretScore = outcome.metrics.regretScore || 0.5;
    }
  }

  /**
   * Clear all timers for an outcome
   */
  private clearTimers(outcomeId: string): void {
    const timer = this.pendingTimers.get(outcomeId);
    if (timer) {
      clearTimeout(timer);
      this.pendingTimers.delete(outcomeId);
    }
  }

  /**
   * Generate feedback from outcome data
   */
  private generateFeedback(outcomeId: string): OutcomeFeedback | null {
    const outcome = this.outcomes.get(outcomeId);
    if (!outcome) return null;

    const successLevel = this.calculateSuccessLevel(outcome.metrics as OutcomeMetrics);
    const lessonExtracted = this.extractLesson(outcome, successLevel);
    const confidenceImpact = this.calculateConfidenceImpact(outcome);
    const recommendationImpact = this.calculateRecommendationImpact(outcome, successLevel);

    const feedback: OutcomeFeedback = {
      id: `feedback-${outcomeId}`,
      recommendationId: outcome.recommendationId,
      studentId: outcome.studentId,
      timeline: outcome.timeline,
      metrics: outcome.metrics as OutcomeMetrics,
      successLevel,
      lessonExtracted,
      confidenceImpact,
      recommendationImpact,
      contextualFactors: outcome.contextualFactors as ContextualFactors,
      metadata: {
        generationTimestamp: Date.now(),
        outcomeStatus: outcome.status,
        dataCompleteness: this.calculateDataCompleteness(outcome),
      },
    };

    this.feedbacks.set(feedback.id, feedback);
    return feedback;
  }

  /**
   * Calculate success level from metrics
   */
  private calculateSuccessLevel(metrics: OutcomeMetrics): SuccessLevel {
    const composite =
      metrics.satisfactionScore * 0.3 +
      (1 - metrics.regretScore) * 0.25 +
      metrics.goalAchievementRate * 0.25 +
      metrics.skillGrowthRate * 0.1 +
      metrics.careerProgressionRate * 0.1;

    if (composite >= 0.85) return 'excellent';
    if (composite >= 0.7) return 'good';
    if (composite >= 0.5) return 'fair';
    if (composite >= 0.3) return 'poor';
    return 'failed';
  }

  /**
   * Extract a lesson from the outcome
   */
  private extractLesson(outcome: OutcomeRecord, successLevel: SuccessLevel): string {
    const metrics = outcome.metrics as OutcomeMetrics;
    const factors: string[] = [];

    if (metrics.satisfactionScore > 0.8) {
      factors.push('high satisfaction');
    } else if (metrics.satisfactionScore < 0.3) {
      factors.push('low satisfaction');
    }

    if (metrics.regretScore > 0.6) {
      factors.push('significant regret');
    }

    if (metrics.confidenceChange > 0.2) {
      factors.push('confidence growth');
    } else if (metrics.confidenceChange < -0.2) {
      factors.push('confidence decline');
    }

    const factorStr = factors.length > 0 ? ` with ${factors.join(', ')}` : '';

    switch (successLevel) {
      case 'excellent':
        return `This recommendation type shows strong alignment with student profile${factorStr}. Consider promoting similar recommendations.`;
      case 'good':
        return `Positive outcome achieved${factorStr}. Minor adjustments may improve future results.`;
      case 'fair':
        return `Mixed results${factorStr}. Review contextual factors and timing.`;
      case 'poor':
        return `Suboptimal outcome${factorStr}. Investigate mismatch between recommendation and student readiness.`;
      case 'failed':
        return `Recommendation did not meet expectations${factorStr}. Significant review needed.`;
    }
  }

  /**
   * Calculate confidence impact from outcome
   */
  private calculateConfidenceImpact(outcome: OutcomeRecord): ConfidenceImpact {
    const metrics = outcome.metrics as OutcomeMetrics;
    const originalConfidence = 0.75; // Would be passed from recommendation

    // Calculate adjustment based on outcome quality
    let adjustment = 0;
    let reason = '';

    if (metrics.satisfactionScore > 0.8 && metrics.regretScore < 0.2) {
      adjustment = 0.05;
      reason = 'High satisfaction and low regret support higher confidence';
    } else if (metrics.satisfactionScore < 0.4 || metrics.regretScore > 0.6) {
      adjustment = -0.1;
      reason = 'Low satisfaction or high regret suggests lower confidence warranted';
    } else if (metrics.confidenceChange > 0.3) {
      adjustment = 0.03;
      reason = 'Student confidence growth validates recommendation';
    } else if (metrics.confidenceChange < -0.3) {
      adjustment = -0.05;
      reason = 'Student confidence decline signals misalignment';
    }

    const adjustedConfidence = Math.max(0.1, Math.min(0.99, originalConfidence + adjustment));

    return {
      originalConfidence,
      adjustedConfidence,
      adjustmentReason: reason,
      adjustmentMagnitude: Math.abs(adjustment),
      isSignificant: Math.abs(adjustment) > 0.03,
    };
  }

  /**
   * Calculate recommendation impact
   */
  private calculateRecommendationImpact(
    outcome: OutcomeRecord,
    successLevel: SuccessLevel
  ): RecommendationImpact {
    // This would typically look up historical data
    const previousSuccessRate = 0.7; // Placeholder
    let newSuccessRate = previousSuccessRate;
    let trendDirection: 'improving' | 'stable' | 'declining' = 'stable';
    let status: 'promote' | 'maintain' | 'review' | 'deprecate' = 'maintain';

    switch (successLevel) {
      case 'excellent':
        newSuccessRate = Math.min(0.99, previousSuccessRate + 0.02);
        trendDirection = 'improving';
        status = 'promote';
        break;
      case 'good':
        newSuccessRate = Math.min(0.99, previousSuccessRate + 0.01);
        trendDirection = 'improving';
        status = 'maintain';
        break;
      case 'fair':
        trendDirection = 'stable';
        status = 'review';
        break;
      case 'poor':
        newSuccessRate = Math.max(0.1, previousSuccessRate - 0.03);
        trendDirection = 'declining';
        status = 'review';
        break;
      case 'failed':
        newSuccessRate = Math.max(0.1, previousSuccessRate - 0.05);
        trendDirection = 'declining';
        status = 'deprecate';
        break;
    }

    return {
      recommendationType: 'general', // Would be populated from actual data
      category: 'general',
      previousSuccessRate,
      newSuccessRate,
      trendDirection,
      recommendationStatus: status,
    };
  }

  /**
   * Calculate data completeness percentage
   */
  private calculateDataCompleteness(outcome: OutcomeRecord): number {
    let complete = 1; // recommendationGiven and studentDecision always present
    let total = 2;

    if (outcome.timeline.shortTermOutcome) complete++;
    total++;

    if (outcome.timeline.mediumTermOutcome) complete++;
    total++;

    if (outcome.timeline.longTermOutcome) complete++;
    total++;

    return complete / total;
  }

  /**
   * Get outcome by ID
   */
  getOutcome(outcomeId: string): OutcomeRecord | undefined {
    return this.outcomes.get(outcomeId);
  }

  /**
   * Get feedback by ID
   */
  getFeedback(feedbackId: string): OutcomeFeedback | undefined {
    return this.feedbacks.get(feedbackId);
  }

  /**
   * Get all feedbacks for a recommendation
   */
  getFeedbacksForRecommendation(recommendationId: string): OutcomeFeedback[] {
    return Array.from(this.feedbacks.values()).filter(
      f => f.recommendationId === recommendationId
    );
  }

  /**
   * Get all feedbacks for a student
   */
  getFeedbacksForStudent(studentId: string): OutcomeFeedback[] {
    return Array.from(this.feedbacks.values()).filter(
      f => f.studentId === studentId
    );
  }

  /**
   * Get outcomes by success level
   */
  getOutcomesBySuccessLevel(level: SuccessLevel): OutcomeFeedback[] {
    return Array.from(this.feedbacks.values()).filter(
      f => f.successLevel === level
    );
  }

  /**
   * Get pending outcomes count
   */
  getPendingCount(): number {
    return Array.from(this.outcomes.values()).filter(
      o => o.status === 'pending' || o.status === 'partial'
    ).length;
  }

  /**
   * Get completion statistics
   */
  getCompletionStats(): {
    total: number;
    pending: number;
    partial: number;
    complete: number;
    averageCompleteness: number;
  } {
    const outcomes = Array.from(this.outcomes.values());
    const total = outcomes.length;
    const pending = outcomes.filter(o => o.status === 'pending').length;
    const partial = outcomes.filter(o => o.status === 'partial').length;
    const complete = outcomes.filter(o => o.status === 'complete').length;

    const averageCompleteness =
      outcomes.reduce((sum, o) => sum + this.calculateDataCompleteness(o), 0) /
      Math.max(1, total);

    return { total, pending, partial, complete, averageCompleteness };
  }

  /**
   * Export all data
   */
  exportData(): {
    outcomes: OutcomeRecord[];
    feedbacks: OutcomeFeedback[];
  } {
    return {
      outcomes: Array.from(this.outcomes.values()),
      feedbacks: Array.from(this.feedbacks.values()),
    };
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.outcomes.clear();
    this.feedbacks.clear();
    this.pendingTimers.forEach(timer => clearTimeout(timer));
    this.pendingTimers.clear();
  }
}
