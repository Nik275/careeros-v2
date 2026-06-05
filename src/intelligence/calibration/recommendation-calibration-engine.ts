/**
 * Recommendation Calibration Engine
 * 
 * Specialized calibration for recommendation confidence scores.
 * Evaluates predicted recommendation confidence vs observed success rates.
 */

import {
  CalibrationObservation,
  CalibrationProfile,
  RecommendationCalibrationProfile,
  RecommendationSuccessMetrics,
  CalibrationStatus,
  CalibrationContext,
  TimeHorizon,
  ReliabilityBand,
} from './calibration-types';
import { ConfidenceCalibrationEngine } from './confidence-calibration-engine';

export interface RecommendationOutcome {
  recommendationId: string;
  recommendationType: string;
  category: string;
  predictedConfidence: number;
  wasAccepted: boolean;
  wasActedUpon: boolean;
  outcomeQuality: number; // 0-1
  userSatisfaction: number; // 0-1
  timestamp: number;
  context: CalibrationContext;
}

export interface RecommendationCalibrationConfig {
  trackAcceptance: boolean;
  trackAction: boolean;
  trackOutcomes: boolean;
  trackSatisfaction: boolean;
  outcomeWindow: number; // milliseconds to wait for outcome
}

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationCalibrationConfig = {
  trackAcceptance: true,
  trackAction: true,
  trackOutcomes: true,
  trackSatisfaction: true,
  outcomeWindow: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class RecommendationCalibrationEngine {
  private baseEngine: ConfidenceCalibrationEngine;
  private typeEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private categoryEngines: Map<string, ConfidenceCalibrationEngine> = new Map();
  private outcomes: RecommendationOutcome[] = [];
  private config: RecommendationCalibrationConfig;
  private pendingOutcomes: Map<string, { outcome: RecommendationOutcome; timeout: NodeJS.Timeout }> = new Map();

  constructor(
    private config2: Partial<RecommendationCalibrationConfig> = {}
  ) {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config2 };
    this.baseEngine = new ConfidenceCalibrationEngine('recommendation-base', 'Recommendation System');
  }

  /**
   * Record a recommendation being made
   */
  recordRecommendation(
    recommendationId: string,
    recommendationType: string,
    category: string,
    predictedConfidence: number,
    context: CalibrationContext
  ): void {
    // Initialize type engine if needed
    if (!this.typeEngines.has(recommendationType)) {
      this.typeEngines.set(
        recommendationType,
        new ConfidenceCalibrationEngine(
          `rec-type-${recommendationType}`,
          `Recommendation Type: ${recommendationType}`
        )
      );
    }

    // Initialize category engine if needed
    if (!this.categoryEngines.has(category)) {
      this.categoryEngines.set(
        category,
        new ConfidenceCalibrationEngine(
          `rec-cat-${category}`,
          `Category: ${category}`
        )
      );
    }

    // Set up outcome tracking
    const outcome: RecommendationOutcome = {
      recommendationId,
      recommendationType,
      category,
      predictedConfidence,
      wasAccepted: false,
      wasActedUpon: false,
      outcomeQuality: 0,
      userSatisfaction: 0,
      timestamp: Date.now(),
      context,
    };

    // Set timeout for outcome window
    if (this.config.outcomeWindow > 0) {
      const timeout = setTimeout(() => {
        this.finalizeOutcome(recommendationId);
      }, this.config.outcomeWindow);

      this.pendingOutcomes.set(recommendationId, { outcome, timeout });
    }
  }

  /**
   * Record recommendation acceptance
   */
  recordAcceptance(recommendationId: string): void {
    const pending = this.pendingOutcomes.get(recommendationId);
    if (pending) {
      pending.outcome.wasAccepted = true;
    }
  }

  /**
   * Record recommendation being acted upon
   */
  recordAction(recommendationId: string): void {
    const pending = this.pendingOutcomes.get(recommendationId);
    if (pending) {
      pending.outcome.wasActedUpon = true;
    }
  }

  /**
   * Record outcome quality
   */
  recordOutcome(
    recommendationId: string,
    outcomeQuality: number,
    userSatisfaction: number
  ): void {
    const pending = this.pendingOutcomes.get(recommendationId);
    if (pending) {
      pending.outcome.outcomeQuality = outcomeQuality;
      pending.outcome.userSatisfaction = userSatisfaction;
      this.finalizeOutcome(recommendationId);
    }
  }

  /**
   * Finalize outcome and add to calibration
   */
  private finalizeOutcome(recommendationId: string): void {
    const pending = this.pendingOutcomes.get(recommendationId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingOutcomes.delete(recommendationId);

    const outcome = pending.outcome;
    this.outcomes.push(outcome);

    // Create observation for base engine
    const observation = this.createObservation(outcome);
    this.baseEngine.addObservation(observation);

    // Add to type-specific engine
    const typeEngine = this.typeEngines.get(outcome.recommendationType);
    if (typeEngine) {
      typeEngine.addObservation(observation);
    }

    // Add to category-specific engine
    const categoryEngine = this.categoryEngines.get(outcome.category);
    if (categoryEngine) {
      categoryEngine.addObservation(observation);
    }
  }

  /**
   * Create calibration observation from outcome
   */
  private createObservation(outcome: RecommendationOutcome): CalibrationObservation {
    // Determine if recommendation was successful
    let success = false;
    let quality = 0;

    if (this.config.trackSatisfaction && outcome.userSatisfaction > 0.5) {
      success = true;
      quality = outcome.userSatisfaction;
    } else if (this.config.trackOutcomes && outcome.outcomeQuality > 0.5) {
      success = true;
      quality = outcome.outcomeQuality;
    } else if (this.config.trackAction && outcome.wasActedUpon) {
      success = true;
      quality = 0.6;
    } else if (this.config.trackAcceptance && outcome.wasAccepted) {
      success = true;
      quality = 0.5;
    }

    return {
      id: `rec-${outcome.recommendationId}`,
      predictedConfidence: outcome.predictedConfidence,
      actualOutcome: success,
      outcomeQuality: quality,
      timestamp: outcome.timestamp,
      context: outcome.context,
      metadata: {
        recommendationType: outcome.recommendationType,
        category: outcome.category,
        wasAccepted: outcome.wasAccepted,
        wasActedUpon: outcome.wasActedUpon,
      },
    };
  }

  /**
   * Get calibration profile for recommendations
   */
  getProfile(): RecommendationCalibrationProfile {
    const baseProfile = this.baseEngine.getProfile();
    if (!baseProfile) {
      throw new Error('No calibration profile available. Record outcomes first.');
    }

    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        typeProfiles.set(type, profile);
      }
    });

    const categoryProfiles = new Map<string, CalibrationProfile>();
    this.categoryEngines.forEach((engine, category) => {
      const profile = engine.getProfile();
      if (profile) {
        categoryProfiles.set(category, profile);
      }
    });

    return {
      ...baseProfile,
      recommendationTypes: typeProfiles,
      categoryCalibrations: categoryProfiles,
      successMetrics: this.calculateSuccessMetrics(),
    };
  }

  /**
   * Calculate success metrics
   */
  private calculateSuccessMetrics(): RecommendationSuccessMetrics {
    if (this.outcomes.length === 0) {
      return {
        acceptedRate: 0,
        actedUponRate: 0,
        positiveOutcomeRate: 0,
        userSatisfactionRate: 0,
      };
    }

    const total = this.outcomes.length;

    return {
      acceptedRate: this.outcomes.filter(o => o.wasAccepted).length / total,
      actedUponRate: this.outcomes.filter(o => o.wasActedUpon).length / total,
      positiveOutcomeRate: this.outcomes.filter(o => o.outcomeQuality > 0.5).length / total,
      userSatisfactionRate: this.outcomes.reduce((sum, o) => sum + o.userSatisfaction, 0) / total,
    };
  }

  /**
   * Get calibration for specific recommendation type
   */
  getTypeCalibration(recommendationType: string): CalibrationProfile | null {
    const engine = this.typeEngines.get(recommendationType);
    return engine?.getProfile() || null;
  }

  /**
   * Get calibration for specific category
   */
  getCategoryCalibration(category: string): CalibrationProfile | null {
    const engine = this.categoryEngines.get(category);
    return engine?.getProfile() || null;
  }

  /**
   * Adjust confidence for a recommendation
   */
  adjustConfidence(
    confidence: number,
    recommendationType?: string,
    category?: string
  ): { adjusted: number; factor: number; reason: string } {
    let adjustedConfidence = confidence;
    let factors: string[] = [];

    // Apply base calibration
    const baseAdjustment = this.baseEngine.adjustConfidence(confidence);
    adjustedConfidence = baseAdjustment.adjustedConfidence;
    factors.push(`Base: ${baseAdjustment.adjustmentFactor.toFixed(2)}`);

    // Apply type-specific calibration
    if (recommendationType && this.typeEngines.has(recommendationType)) {
      const typeEngine = this.typeEngines.get(recommendationType)!;
      const typeAdjustment = typeEngine.adjustConfidence(confidence);
      adjustedConfidence = (adjustedConfidence + typeAdjustment.adjustedConfidence) / 2;
      factors.push(`Type: ${typeAdjustment.adjustmentFactor.toFixed(2)}`);
    }

    // Apply category-specific calibration
    if (category && this.categoryEngines.has(category)) {
      const catEngine = this.categoryEngines.get(category)!;
      const catAdjustment = catEngine.adjustConfidence(confidence);
      adjustedConfidence = (adjustedConfidence + catAdjustment.adjustedConfidence) / 2;
      factors.push(`Category: ${catAdjustment.adjustmentFactor.toFixed(2)}`);
    }

    const factor = confidence > 0 ? adjustedConfidence / confidence : 1;

    return {
      adjusted: adjustedConfidence,
      factor,
      reason: `Calibration factors: ${factors.join(', ')}`,
    };
  }

  /**
   * Check if system is well calibrated
   */
  isWellCalibrated(): boolean {
    return this.baseEngine.isWellCalibrated();
  }

  /**
   * Get overall reliability score
   */
  getReliabilityScore(): number {
    return this.baseEngine.getReliabilityScore();
  }

  /**
   * Get outcomes by recommendation type
   */
  getOutcomesByType(recommendationType: string): RecommendationOutcome[] {
    return this.outcomes.filter(o => o.recommendationType === recommendationType);
  }

  /**
   * Get outcomes by category
   */
  getOutcomesByCategory(category: string): RecommendationOutcome[] {
    return this.outcomes.filter(o => o.category === category);
  }

  /**
   * Get outcomes within time range
   */
  getOutcomesInRange(startTime: number, endTime: number): RecommendationOutcome[] {
    return this.outcomes.filter(o => o.timestamp >= startTime && o.timestamp <= endTime);
  }

  /**
   * Get calibration drift over time
   */
  getDriftAnalysis(): {
    hasDrift: boolean;
    magnitude: number;
    direction: 'overconfidence' | 'underconfidence' | 'stable';
  } {
    const history = this.baseEngine.getHistory();
    
    if (history.calibrationErrors.length < 5) {
      return { hasDrift: false, magnitude: 0, direction: 'stable' };
    }

    const recent = history.calibrationErrors.slice(-5);
    const older = history.calibrationErrors.slice(-10, -5);

    if (older.length === 0) {
      return { hasDrift: false, magnitude: 0, direction: 'stable' };
    }

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const magnitude = Math.abs(recentAvg - olderAvg);
    const hasDrift = magnitude > 0.05;

    // Check direction by looking at over/under confidence
    const profile = this.baseEngine.getProfile();
    let direction: 'overconfidence' | 'underconfidence' | 'stable' = 'stable';

    if (profile) {
      if (profile.status === CalibrationStatus.OVERCONFIDENT) {
        direction = 'overconfidence';
      } else if (profile.status === CalibrationStatus.UNDERCONFIDENT) {
        direction = 'underconfidence';
      }
    }

    return { hasDrift, magnitude, direction };
  }

  /**
   * Get best performing recommendation types
   */
  getBestPerformingTypes(limit: number = 5): Array<{ type: string; reliability: number }> {
    const results: Array<{ type: string; reliability: number }> = [];

    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        results.push({ type, reliability: profile.reliabilityScore });
      }
    });

    return results
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, limit);
  }

  /**
   * Get worst performing recommendation types
   */
  getWorstPerformingTypes(limit: number = 5): Array<{ type: string; reliability: number }> {
    const results: Array<{ type: string; reliability: number }> = [];

    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) {
        results.push({ type, reliability: profile.reliabilityScore });
      }
    });

    return results
      .sort((a, b) => a.reliability - b.reliability)
      .slice(0, limit);
  }

  /**
   * Export all data for external analysis
   */
  exportData(): {
    outcomes: RecommendationOutcome[];
    baseProfile: CalibrationProfile | null;
    typeProfiles: Map<string, CalibrationProfile>;
    categoryProfiles: Map<string, CalibrationProfile>;
  } {
    const typeProfiles = new Map<string, CalibrationProfile>();
    this.typeEngines.forEach((engine, type) => {
      const profile = engine.getProfile();
      if (profile) typeProfiles.set(type, profile);
    });

    const categoryProfiles = new Map<string, CalibrationProfile>();
    this.categoryEngines.forEach((engine, category) => {
      const profile = engine.getProfile();
      if (profile) categoryProfiles.set(category, profile);
    });

    return {
      outcomes: [...this.outcomes],
      baseProfile: this.baseEngine.getProfile(),
      typeProfiles,
      categoryProfiles,
    };
  }

  /**
   * Reset all calibration data
   */
  reset(): void {
    this.baseEngine.reset();
    this.typeEngines.clear();
    this.categoryEngines.clear();
    this.outcomes = [];
    
    // Clear pending outcomes
    this.pendingOutcomes.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingOutcomes.clear();
  }

  /**
   * Get pending outcome count
   */
  getPendingCount(): number {
    return this.pendingOutcomes.size;
  }
}
