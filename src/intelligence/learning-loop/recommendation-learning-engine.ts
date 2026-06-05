/**
 * Recommendation Learning Engine
 *
 * Learns which recommendations consistently succeed, fail, or work only
 * for specific profiles. Tracks regret patterns and confidence growth.
 */

import {
  RecommendationLearningProfile,
  RecommendationPerformanceMetrics,
  ProfileEffectiveness,
  RegretPattern,
  ConfidenceGrowthPattern,
  LearningHistoryEntry,
  OutcomeFeedback,
  SuccessLevel,
  Timestamp,
} from './learning-loop-types';

export interface RecommendationInstance {
  id: string;
  recommendationType: string;
  category: string;
  studentProfileSignature: string;
  timestamp: Timestamp;
  outcome?: OutcomeFeedback;
}

export interface LearningEngineOptions {
  minInstancesForPattern: number;
  patternSignificanceThreshold: number;
  profileMatchThreshold: number;
  trendWindow: number; // milliseconds
}

export const DEFAULT_LEARNING_OPTIONS: LearningEngineOptions = {
  minInstancesForPattern: 5,
  patternSignificanceThreshold: 0.7,
  profileMatchThreshold: 0.8,
  trendWindow: 90 * 24 * 60 * 60 * 1000, // 90 days
};

export class RecommendationLearningEngine {
  private profiles: Map<string, RecommendationLearningProfile> = new Map();
  private instances: Map<string, RecommendationInstance[]> = new Map();
  private options: LearningEngineOptions;

  constructor(options: Partial<LearningEngineOptions> = {}) {
    this.options = { ...DEFAULT_LEARNING_OPTIONS, ...options };
  }

  /**
   * Record a new recommendation instance
   */
  recordRecommendation(
    id: string,
    recommendationType: string,
    category: string,
    studentProfileSignature: string,
    timestamp?: Timestamp
  ): void {
    const instance: RecommendationInstance = {
      id,
      recommendationType,
      category,
      studentProfileSignature,
      timestamp: timestamp || Date.now(),
    };

    const key = this.getProfileKey(recommendationType, category);
    const instances = this.instances.get(key) || [];
    instances.push(instance);
    this.instances.set(key, instances);

    // Initialize profile if needed
    if (!this.profiles.has(key)) {
      this.initializeProfile(recommendationType, category);
    }
  }

  /**
   * Record an outcome for a recommendation
   */
  recordOutcome(recommendationId: string, outcome: OutcomeFeedback): void {
    // Find the instance
    for (const [key, instances] of Array.from(this.instances.entries())) {
      const instance = instances.find(i => i.id === recommendationId);
      if (instance) {
        instance.outcome = outcome;
        this.updateProfileFromOutcome(key, instance, outcome);
        break;
      }
    }
  }

  /**
   * Initialize a new learning profile
   */
  private initializeProfile(recommendationType: string, category: string): void {
    const key = this.getProfileKey(recommendationType, category);
    
    const profile: RecommendationLearningProfile = {
      recommendationType,
      category,
      performanceMetrics: {
        totalRecommendations: 0,
        successRate: 0,
        failureRate: 0,
        averageSatisfaction: 0,
        averageRegret: 0,
        consistencyScore: 0,
        trendDirection: 'stable',
      },
      profileEffectiveness: new Map(),
      regretPatterns: [],
      confidenceGrowthPattern: {
        initialConfidence: 0.75,
        currentConfidence: 0.75,
        growthRate: 0,
        confidenceStability: 1,
        evidenceStrength: 0,
      },
      learningHistory: [],
      lastUpdated: Date.now(),
    };

    this.profiles.set(key, profile);
  }

  /**
   * Update profile from outcome data
   */
  private updateProfileFromOutcome(
    key: string,
    instance: RecommendationInstance,
    outcome: OutcomeFeedback
  ): void {
    const profile = this.profiles.get(key);
    if (!profile) return;

    // Update performance metrics
    this.updatePerformanceMetrics(profile, outcome);

    // Update profile effectiveness
    this.updateProfileEffectiveness(profile, instance, outcome);

    // Update regret patterns
    this.updateRegretPatterns(profile, outcome);

    // Update confidence growth
    this.updateConfidenceGrowth(profile, outcome);

    // Add to learning history
    this.addLearningHistoryEntry(profile, instance, outcome);

    profile.lastUpdated = Date.now();
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    profile: RecommendationLearningProfile,
    outcome: OutcomeFeedback
  ): void {
    const metrics = profile.performanceMetrics;
    const total = metrics.totalRecommendations + 1;

    metrics.totalRecommendations = total;

    // Update success/failure rates
    const isSuccess = ['excellent', 'good'].includes(outcome.successLevel);
    const isFailure = ['poor', 'failed'].includes(outcome.successLevel);

    const currentSuccesses = metrics.successRate * (total - 1);
    const currentFailures = metrics.failureRate * (total - 1);

    metrics.successRate = (currentSuccesses + (isSuccess ? 1 : 0)) / total;
    metrics.failureRate = (currentFailures + (isFailure ? 1 : 0)) / total;

    // Update averages
    metrics.averageSatisfaction =
      (metrics.averageSatisfaction * (total - 1) + outcome.metrics.satisfactionScore) / total;
    metrics.averageRegret =
      (metrics.averageRegret * (total - 1) + outcome.metrics.regretScore) / total;

    // Update consistency (inverse of variance)
    const recentOutcomes = this.getRecentOutcomes(profile, 20);
    metrics.consistencyScore = this.calculateConsistency(recentOutcomes);

    // Update trend
    metrics.trendDirection = this.calculateTrend(profile);
  }

  /**
   * Get recent outcomes for a profile
   */
  private getRecentOutcomes(
    profile: RecommendationLearningProfile,
    limit: number
  ): OutcomeFeedback[] {
    const key = this.getProfileKey(profile.recommendationType, profile.category);
    const instances = this.instances.get(key) || [];
    
    return instances
      .filter(i => i.outcome)
      .map(i => i.outcome!)
      .slice(-limit);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistency(outcomes: OutcomeFeedback[]): number {
    if (outcomes.length < 2) return 1;

    const satisfactionScores = outcomes.map(o => o.metrics.satisfactionScore);
    const mean = satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length;
    const variance =
      satisfactionScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      satisfactionScores.length;

    // Higher consistency = lower variance
    return Math.max(0, 1 - variance);
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(profile: RecommendationLearningProfile): 'improving' | 'stable' | 'declining' {
    const recent = this.getRecentOutcomes(profile, 10);
    if (recent.length < 5) return 'stable';

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg = firstHalf.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Update profile effectiveness for specific student profiles
   */
  private updateProfileEffectiveness(
    profile: RecommendationLearningProfile,
    instance: RecommendationInstance,
    outcome: OutcomeFeedback
  ): void {
    const signature = instance.studentProfileSignature;
    const existing = profile.profileEffectiveness.get(signature);

    if (existing) {
      existing.recommendationCount++;
      if (['excellent', 'good'].includes(outcome.successLevel)) {
        existing.successCount++;
      }
      existing.averageSatisfaction =
        (existing.averageSatisfaction * (existing.recommendationCount - 1) +
          outcome.metrics.satisfactionScore) /
        existing.recommendationCount;
      existing.effectivenessScore = existing.successCount / existing.recommendationCount;
    } else {
      const isSuccess = ['excellent', 'good'].includes(outcome.successLevel);
      profile.profileEffectiveness.set(signature, {
        profileSignature: signature,
        recommendationCount: 1,
        successCount: isSuccess ? 1 : 0,
        averageSatisfaction: outcome.metrics.satisfactionScore,
        effectivenessScore: isSuccess ? 1 : 0,
        confidenceInterval: [0, 1], // Will be calculated with more data
      });
    }
  }

  /**
   * Update regret patterns
   */
  private updateRegretPatterns(
    profile: RecommendationLearningProfile,
    outcome: OutcomeFeedback
  ): void {
    if (outcome.metrics.regretScore < 0.4) return;

    // Determine trigger
    let trigger = 'general';
    if (outcome.metrics.satisfactionScore < 0.4) {
      trigger = 'low-satisfaction';
    } else if (outcome.metrics.goalAchievementRate < 0.4) {
      trigger = 'goal-mismatch';
    } else if (outcome.metrics.confidenceChange < -0.3) {
      trigger = 'confidence-decline';
    }

    // Find or create pattern
    let pattern = profile.regretPatterns.find(p => p.trigger === trigger);
    if (!pattern) {
      pattern = {
        trigger,
        frequency: 0,
        averageSeverity: 0,
        commonContexts: [],
        mitigationStrategies: [],
      };
      profile.regretPatterns.push(pattern);
    }

    // Update pattern
    pattern.frequency++;
    pattern.averageSeverity =
      (pattern.averageSeverity * (pattern.frequency - 1) + outcome.metrics.regretScore) /
      pattern.frequency;

    // Add context if new
    const context = outcome.contextualFactors.marketConditions || 'unknown';
    if (!pattern.commonContexts.includes(context)) {
      pattern.commonContexts.push(context);
    }
  }

  /**
   * Update confidence growth pattern
   */
  private updateConfidenceGrowth(
    profile: RecommendationLearningProfile,
    outcome: OutcomeFeedback
  ): void {
    const growth = profile.confidenceGrowthPattern;
    
    // Update current confidence based on outcome
    const targetConfidence = outcome.confidenceImpact.adjustedConfidence;
    const oldConfidence = growth.currentConfidence;
    
    // Gradual adjustment
    growth.currentConfidence =
      oldConfidence * 0.9 + targetConfidence * 0.1;

    // Calculate growth rate
    if (growth.initialConfidence !== growth.currentConfidence) {
      growth.growthRate =
        (growth.currentConfidence - growth.initialConfidence) /
        profile.performanceMetrics.totalRecommendations;
    }

    // Update stability (lower variance = higher stability)
    const recentOutcomes = this.getRecentOutcomes(profile, 10);
    const confidenceChanges = recentOutcomes.map(
      o => o.confidenceImpact.adjustedConfidence
    );
    
    if (confidenceChanges.length > 1) {
      const mean = confidenceChanges.reduce((a, b) => a + b, 0) / confidenceChanges.length;
      const variance =
        confidenceChanges.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) /
        confidenceChanges.length;
      growth.confidenceStability = Math.max(0, 1 - variance * 4);
    }

    // Update evidence strength
    growth.evidenceStrength = Math.min(
      1,
      profile.performanceMetrics.totalRecommendations / 50
    );
  }

  /**
   * Add learning history entry
   */
  private addLearningHistoryEntry(
    profile: RecommendationLearningProfile,
    instance: RecommendationInstance,
    outcome: OutcomeFeedback
  ): void {
    let event: LearningHistoryEntry['event'];
    
    if (['excellent', 'good'].includes(outcome.successLevel)) {
      event = 'success';
    } else if (['poor', 'failed'].includes(outcome.successLevel)) {
      event = 'failure';
    } else if (outcome.metrics.regretScore > 0.5) {
      event = 'regret';
    } else {
      event = 'adjustment';
    }

    const entry: LearningHistoryEntry = {
      timestamp: Date.now(),
      event,
      description: outcome.lessonExtracted,
      impact: this.calculateImpact(outcome),
      confidenceDelta: outcome.confidenceImpact.adjustedConfidence - outcome.confidenceImpact.originalConfidence,
    };

    profile.learningHistory.push(entry);

    // Keep history manageable
    if (profile.learningHistory.length > 100) {
      profile.learningHistory.shift();
    }
  }

  /**
   * Calculate impact score from outcome
   */
  private calculateImpact(outcome: OutcomeFeedback): number {
    const satisfactionWeight = 0.3;
    const regretWeight = 0.3;
    const goalWeight = 0.2;
    const confidenceWeight = 0.2;

    return (
      outcome.metrics.satisfactionScore * satisfactionWeight +
      (1 - outcome.metrics.regretScore) * regretWeight +
      outcome.metrics.goalAchievementRate * goalWeight +
      (outcome.metrics.confidenceChange + 1) / 2 * confidenceWeight
    );
  }

  /**
   * Get learning profile
   */
  getProfile(recommendationType: string, category: string): RecommendationLearningProfile | undefined {
    return this.profiles.get(this.getProfileKey(recommendationType, category));
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): RecommendationLearningProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get consistently successful recommendations
   */
  getConsistentlySuccessful(minSuccessRate: number = 0.8): RecommendationLearningProfile[] {
    return this.getAllProfiles().filter(
      p => p.performanceMetrics.successRate >= minSuccessRate &&
           p.performanceMetrics.totalRecommendations >= this.options.minInstancesForPattern
    );
  }

  /**
   * Get consistently failing recommendations
   */
  getConsistentlyFailing(maxSuccessRate: number = 0.3): RecommendationLearningProfile[] {
    return this.getAllProfiles().filter(
      p => p.performanceMetrics.successRate <= maxSuccessRate &&
           p.performanceMetrics.totalRecommendations >= this.options.minInstancesForPattern
    );
  }

  /**
   * Get profile-specific effective recommendations
   */
  getProfileSpecificRecommendations(
    profileSignature: string,
    minEffectiveness: number = 0.7
  ): Array<{ recommendationType: string; category: string; effectiveness: number }> {
    const results: Array<{ recommendationType: string; category: string; effectiveness: number }> = [];

    for (const profile of Array.from(this.profiles.values())) {
      const effectiveness = profile.profileEffectiveness.get(profileSignature);
      if (effectiveness && effectiveness.effectivenessScore >= minEffectiveness) {
        results.push({
          recommendationType: profile.recommendationType,
          category: profile.category,
          effectiveness: effectiveness.effectivenessScore,
        });
      }
    }

    return results.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Get recommendations with high regret
   */
  getHighRegretRecommendations(minRegretScore: number = 0.5): RecommendationLearningProfile[] {
    return this.getAllProfiles().filter(
      p => p.performanceMetrics.averageRegret >= minRegretScore
    );
  }

  /**
   * Get recommendations with confidence growth
   */
  getConfidenceGrowthRecommendations(): RecommendationLearningProfile[] {
    return this.getAllProfiles().filter(
      p => p.confidenceGrowthPattern.growthRate > 0.01
    );
  }

  /**
   * Compare profile performance across different student types
   */
  compareProfilePerformance(
    recommendationType: string,
    category: string
  ): Map<string, ProfileEffectiveness> {
    const profile = this.getProfile(recommendationType, category);
    if (!profile) return new Map();
    return profile.profileEffectiveness;
  }

  /**
   * Get trend analysis for a recommendation type
   */
  getTrendAnalysis(
    recommendationType: string,
    category: string
  ): {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
    recentOutcomes: number;
  } | null {
    const profile = this.getProfile(recommendationType, category);
    if (!profile) return null;

    return {
      direction: profile.performanceMetrics.trendDirection,
      confidence: profile.confidenceGrowthPattern.confidenceStability,
      recentOutcomes: Math.min(20, profile.performanceMetrics.totalRecommendations),
    };
  }

  /**
   * Generate profile key
   */
  private getProfileKey(recommendationType: string, category: string): string {
    return `${recommendationType}:${category}`;
  }

  /**
   * Export all data
   */
  exportData(): {
    profiles: RecommendationLearningProfile[];
    instances: RecommendationInstance[];
  } {
    const allInstances: RecommendationInstance[] = [];
    for (const instances of Array.from(this.instances.values())) {
      allInstances.push(...instances);
    }

    return {
      profiles: this.getAllProfiles(),
      instances: allInstances,
    };
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.profiles.clear();
    this.instances.clear();
  }
}
