/**
 * Population Learning Engine
 *
 * Aggregates anonymized patterns across all students to detect common
 * success paths, failure paths, unexpected outcomes, and hidden opportunities.
 */

import {
  PopulationInsights,
  SuccessPath,
  FailurePath,
  UnexpectedOutcome,
  HiddenOpportunity,
  ProfileSpecificPattern,
  AggregateMetrics,
  OutcomeFeedback,
  SuccessLevel,
  Timestamp,
} from './learning-loop-types';

export interface PopulationDataPoint {
  studentId: string;
  profileSignature: string;
  recommendationSequence: string[];
  outcomes: OutcomeFeedback[];
  timestamp: Timestamp;
}

export interface PopulationLearningEngineOptions {
  minDataPointsForPattern: number;
  minDataPointsForInsight: number;
  patternConfidenceThreshold: number;
  anomalyThreshold: number;
  lookbackPeriod: number; // milliseconds
}

export const DEFAULT_POPULATION_OPTIONS: PopulationLearningEngineOptions = {
  minDataPointsForPattern: 10,
  minDataPointsForInsight: 20,
  patternConfidenceThreshold: 0.7,
  anomalyThreshold: 0.95,
  lookbackPeriod: 180 * 24 * 60 * 60 * 1000, // 180 days
};

export class PopulationLearningEngine {
  private dataPoints: PopulationDataPoint[] = [];
  private insights: PopulationInsights | null = null;
  private options: PopulationLearningEngineOptions;

  constructor(options: Partial<PopulationLearningEngineOptions> = {}) {
    this.options = { ...DEFAULT_POPULATION_OPTIONS, ...options };
  }

  /**
   * Add a data point to the population dataset
   */
  addDataPoint(dataPoint: PopulationDataPoint): void {
    // Filter out old data
    const cutoff = Date.now() - this.options.lookbackPeriod;
    this.dataPoints = this.dataPoints.filter(dp => dp.timestamp >= cutoff);

    this.dataPoints.push(dataPoint);

    // Invalidate cached insights
    this.insights = null;
  }

  /**
   * Add multiple data points
   */
  addDataPoints(dataPoints: PopulationDataPoint[]): void {
    dataPoints.forEach(dp => this.addDataPoint(dp));
  }

  /**
   * Generate population insights
   */
  generateInsights(): PopulationInsights {
    if (this.insights) return this.insights;

    const now = Date.now();
    const period: [Timestamp, Timestamp] = [
      now - this.options.lookbackPeriod,
      now,
    ];

    this.insights = {
      id: `insights-${now}`,
      generatedAt: now,
      period,
      commonSuccessPaths: this.detectSuccessPaths(),
      commonFailurePaths: this.detectFailurePaths(),
      unexpectedOutcomes: this.detectUnexpectedOutcomes(),
      hiddenOpportunities: this.detectHiddenOpportunities(),
      profileSpecificPatterns: this.detectProfileSpecificPatterns(),
      aggregateMetrics: this.calculateAggregateMetrics(),
    };

    return this.insights;
  }

  /**
   * Detect common success paths
   */
  private detectSuccessPaths(): SuccessPath[] {
    const paths: Map<string, SuccessPath> = new Map();

    // Group by sequence
    this.dataPoints.forEach(dp => {
      const sequence = dp.recommendationSequence.join(' -> ');
      const existing = paths.get(sequence);

      if (existing) {
        existing.frequency++;
        // Update success rate
        const successCount = dp.outcomes.filter(o =>
          ['excellent', 'good'].includes(o.successLevel)
        ).length;
        existing.successRate =
          (existing.successRate * (existing.frequency - 1) + successCount / dp.outcomes.length) /
          existing.frequency;
      } else {
        const successCount = dp.outcomes.filter(o =>
          ['excellent', 'good'].includes(o.successLevel)
        ).length;

        paths.set(sequence, {
          pathId: `path-${sequence}`,
          sequence: dp.recommendationSequence,
          frequency: 1,
          successRate: successCount / dp.outcomes.length,
          averageTimeToSuccess: this.calculateTimeToSuccess(dp.outcomes),
          commonProfileTraits: this.extractProfileTraits(dp.profileSignature),
          confidence: 0, // Will be calculated
        });
      }
    });

    // Filter and calculate confidence
    const result = Array.from(paths.values())
      .filter(p => p.frequency >= this.options.minDataPointsForPattern)
      .map(p => ({
        ...p,
        confidence: Math.min(1, p.frequency / 20) * p.successRate,
      }))
      .sort((a, b) => b.confidence - a.confidence);

    return result.slice(0, 10); // Top 10 paths
  }

  /**
   * Detect common failure paths
   */
  private detectFailurePaths(): FailurePath[] {
    const paths: Map<string, FailurePath> = new Map();

    this.dataPoints.forEach(dp => {
      const sequence = dp.recommendationSequence.join(' -> ');
      const existing = paths.get(sequence);

      if (existing) {
        existing.frequency++;
        const failureCount = dp.outcomes.filter(o =>
          ['poor', 'failed'].includes(o.successLevel)
        ).length;
        existing.failureRate =
          (existing.failureRate * (existing.frequency - 1) + failureCount / dp.outcomes.length) /
          existing.frequency;
      } else {
        const failureCount = dp.outcomes.filter(o =>
          ['poor', 'failed'].includes(o.successLevel)
        ).length;

        paths.set(sequence, {
          pathId: `failure-${sequence}`,
          sequence: dp.recommendationSequence,
          frequency: 1,
          failureRate: failureCount / dp.outcomes.length,
          commonRegretTypes: this.extractRegretTypes(dp.outcomes),
          earlyWarningSigns: this.extractWarningSigns(dp.outcomes),
          avoidabilityScore: this.calculateAvoidability(dp.outcomes),
        });
      }
    });

    return Array.from(paths.values())
      .filter(p => p.frequency >= this.options.minDataPointsForPattern)
      .filter(p => p.failureRate > 0.5)
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 10);
  }

  /**
   * Detect unexpected outcomes
   */
  private detectUnexpectedOutcomes(): UnexpectedOutcome[] {
    const unexpected: UnexpectedOutcome[] = [];
    const patterns: Map<string, { expected: number; actual: number; count: number }> = new Map();

    this.dataPoints.forEach(dp => {
      dp.outcomes.forEach(outcome => {
        const key = `${outcome.recommendationId}:${outcome.successLevel}`;
        
        // Check if this outcome is anomalous based on similar profiles
        const similarProfiles = this.dataPoints.filter(
          p => p.profileSignature === dp.profileSignature && p.studentId !== dp.studentId
        );

        if (similarProfiles.length >= 5) {
          const expectedSuccessRate =
            similarProfiles.reduce(
              (sum, p) =>
                sum +
                p.outcomes.filter(o => ['excellent', 'good'].includes(o.successLevel)).length /
                  p.outcomes.length,
              0
            ) / similarProfiles.length;

          const isUnexpected =
            (expectedSuccessRate > 0.7 && ['poor', 'failed'].includes(outcome.successLevel)) ||
            (expectedSuccessRate < 0.3 && ['excellent', 'good'].includes(outcome.successLevel));

          if (isUnexpected) {
            const existing = patterns.get(key);
            if (existing) {
              existing.count++;
            } else {
              patterns.set(key, {
                expected: expectedSuccessRate,
                actual: ['excellent', 'good'].includes(outcome.successLevel) ? 1 : 0,
                count: 1,
              });
            }
          }
        }
      });
    });

    patterns.forEach((data, key) => {
      if (data.count >= 3) {
        unexpected.push({
          pattern: key,
          expectedOutcome: data.expected > 0.5 ? 'success' : 'failure',
          actualOutcome: data.actual > 0.5 ? 'success' : 'failure',
          frequency: data.count,
          potentialCauses: this.investigateCauses(key),
          investigationPriority: data.count > 10 ? 'critical' : data.count > 5 ? 'high' : 'medium',
        });
      }
    });

    return unexpected.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Detect hidden opportunities
   */
  private detectHiddenOpportunities(): HiddenOpportunity[] {
    const opportunities: HiddenOpportunity[] = [];

    // Find underutilized high-success recommendations
    const recommendationStats: Map<
      string,
      { successes: number; total: number; profiles: Set<string> }
    > = new Map();

    this.dataPoints.forEach(dp => {
      dp.outcomes.forEach(outcome => {
        const key = outcome.recommendationId;
        const existing = recommendationStats.get(key);

        if (existing) {
          existing.total++;
          if (['excellent', 'good'].includes(outcome.successLevel)) {
            existing.successes++;
          }
          existing.profiles.add(dp.profileSignature);
        } else {
          recommendationStats.set(key, {
            successes: ['excellent', 'good'].includes(outcome.successLevel) ? 1 : 0,
            total: 1,
            profiles: new Set([dp.profileSignature]),
          });
        }
      });
    });

    recommendationStats.forEach((stats, recommendationId) => {
      const successRate = stats.successes / stats.total;
      const penetrationRate = stats.profiles.size / this.getUniqueProfileCount();

      // Hidden opportunity: high success but low penetration
      if (successRate > 0.8 && penetrationRate < 0.3 && stats.total >= 10) {
        opportunities.push({
          opportunityType: recommendationId,
          detectionSignal: 'high-success-low-penetration',
          affectedProfiles: Array.from(stats.profiles),
          potentialValue: successRate * (1 - penetrationRate),
          evidenceStrength: Math.min(1, stats.total / 30),
          recommendedAction: `Expand ${recommendationId} to more student profiles`,
        });
      }
    });

    return opportunities.sort((a, b) => b.potentialValue - a.potentialValue);
  }

  /**
   * Detect profile-specific patterns
   */
  private detectProfileSpecificPatterns(): ProfileSpecificPattern[] {
    const patterns: ProfileSpecificPattern[] = [];
    const profileGroups = this.groupByProfile();

    profileGroups.forEach((dataPoints, profileSignature) => {
      if (dataPoints.length < this.options.minDataPointsForInsight) return;

      const outcomes = dataPoints.flatMap(dp => dp.outcomes);

      // Success pattern
      const successRate =
        outcomes.filter(o => ['excellent', 'good'].includes(o.successLevel)).length /
        outcomes.length;

      if (successRate > 0.8) {
        patterns.push({
          profileSignature,
          patternType: 'success',
          description: `High success rate (${(successRate * 100).toFixed(1)}%) for this profile type`,
          frequency: outcomes.length,
          confidence: Math.min(1, outcomes.length / 50),
          recommendations: this.getTopRecommendationsForProfile(profileSignature, 5),
        });
      }

      // Failure pattern
      if (successRate < 0.3) {
        patterns.push({
          profileSignature,
          patternType: 'failure',
          description: `Low success rate (${(successRate * 100).toFixed(1)}%) for this profile type`,
          frequency: outcomes.length,
          confidence: Math.min(1, outcomes.length / 50),
          recommendations: ['Review recommendation strategy for this profile'],
        });
      }

      // Regret pattern
      const avgRegret =
        outcomes.reduce((sum, o) => sum + o.metrics.regretScore, 0) / outcomes.length;
      if (avgRegret > 0.5) {
        patterns.push({
          profileSignature,
          patternType: 'regret',
          description: `High regret pattern (${(avgRegret * 100).toFixed(1)}%) for this profile type`,
          frequency: outcomes.length,
          confidence: Math.min(1, outcomes.length / 50),
          recommendations: ['Investigate regret triggers', 'Adjust confidence levels'],
        });
      }

      // Surprise pattern (high variance)
      const variance = this.calculateOutcomeVariance(outcomes);
      if (variance > 0.3) {
        patterns.push({
          profileSignature,
          patternType: 'surprise',
          description: `High outcome variance (${(variance * 100).toFixed(1)}%) - unpredictable results`,
          frequency: outcomes.length,
          confidence: Math.min(1, outcomes.length / 50),
          recommendations: ['Improve targeting', 'Add safeguards'],
        });
      }
    });

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate aggregate metrics
   */
  private calculateAggregateMetrics(): AggregateMetrics {
    const allOutcomes = this.dataPoints.flatMap(dp => dp.outcomes);

    if (allOutcomes.length === 0) {
      return {
        totalStudents: 0,
        totalRecommendations: 0,
        overallSuccessRate: 0,
        overallSatisfaction: 0,
        overallRegretRate: 0,
        averageConfidenceAccuracy: 0,
        learningVelocity: 0,
      };
    }

    const uniqueStudents = new Set(this.dataPoints.map(dp => dp.studentId)).size;
    const totalRecommendations = this.dataPoints.reduce(
      (sum, dp) => sum + dp.recommendationSequence.length,
      0
    );

    const successes = allOutcomes.filter(o =>
      ['excellent', 'good'].includes(o.successLevel)
    ).length;

    return {
      totalStudents: uniqueStudents,
      totalRecommendations,
      overallSuccessRate: successes / allOutcomes.length,
      overallSatisfaction:
        allOutcomes.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) /
        allOutcomes.length,
      overallRegretRate:
        allOutcomes.reduce((sum, o) => sum + o.metrics.regretScore, 0) /
        allOutcomes.length,
      averageConfidenceAccuracy: this.calculateConfidenceAccuracy(allOutcomes),
      learningVelocity: this.calculateLearningVelocity(),
    };
  }

  /**
   * Helper: Calculate time to success
   */
  private calculateTimeToSuccess(outcomes: OutcomeFeedback[]): number {
    const successfulOutcomes = outcomes.filter(o =>
      ['excellent', 'good'].includes(o.successLevel)
    );

    if (successfulOutcomes.length === 0) return 0;

    return (
      successfulOutcomes.reduce((sum, o) => {
        const timeToSuccess = o.timeline.longTermOutcome
          ? o.timeline.longTermOutcome - o.timeline.recommendationGiven
          : 0;
        return sum + timeToSuccess;
      }, 0) / successfulOutcomes.length
    );
  }

  /**
   * Helper: Extract profile traits
   */
  private extractProfileTraits(profileSignature: string): string[] {
    return profileSignature.split(',').map(t => t.trim());
  }

  /**
   * Helper: Extract regret types
   */
  private extractRegretTypes(outcomes: OutcomeFeedback[]): string[] {
    const highRegret = outcomes.filter(o => o.metrics.regretScore > 0.5);
    const types = new Set<string>();
    
    // Would extract from actual regret data
    if (highRegret.length > 0) {
      types.add('opportunity-missed');
      types.add('timing');
    }

    return Array.from(types);
  }

  /**
   * Helper: Extract warning signs
   */
  private extractWarningSigns(outcomes: OutcomeFeedback[]): string[] {
    const signs: string[] = [];
    
    const earlyOutcomes = outcomes.filter(o => o.timeline.shortTermOutcome);
    if (earlyOutcomes.length > 0) {
      const avgEarlySatisfaction =
        earlyOutcomes.reduce((sum, o) => sum + o.metrics.satisfactionScore, 0) /
        earlyOutcomes.length;
      if (avgEarlySatisfaction < 0.4) {
        signs.push('low-early-satisfaction');
      }
    }

    return signs;
  }

  /**
   * Helper: Calculate avoidability
   */
  private calculateAvoidability(outcomes: OutcomeFeedback[]): number {
    // Higher if early warning signs were present
    const warningSigns = this.extractWarningSigns(outcomes);
    return Math.min(1, warningSigns.length / 3);
  }

  /**
   * Helper: Investigate causes
   */
  private investigateCauses(pattern: string): string[] {
    const causes: string[] = [];
    
    // Analyze pattern for potential causes
    if (pattern.includes('failed')) {
      causes.push('profile-mismatch');
      causes.push('timing-issue');
    }
    if (pattern.includes('excellent')) {
      causes.push('strong-alignment');
    }

    return causes;
  }

  /**
   * Helper: Get unique profile count
   */
  private getUniqueProfileCount(): number {
    return new Set(this.dataPoints.map(dp => dp.profileSignature)).size;
  }

  /**
   * Helper: Group data points by profile
   */
  private groupByProfile(): Map<string, PopulationDataPoint[]> {
    const groups: Map<string, PopulationDataPoint[]> = new Map();

    this.dataPoints.forEach(dp => {
      const existing = groups.get(dp.profileSignature);
      if (existing) {
        existing.push(dp);
      } else {
        groups.set(dp.profileSignature, [dp]);
      }
    });

    return groups;
  }

  /**
   * Helper: Get top recommendations for profile
   */
  private getTopRecommendationsForProfile(profileSignature: string, limit: number): string[] {
    const profileData = this.dataPoints.filter(dp => dp.profileSignature === profileSignature);
    const recommendationCounts: Map<string, number> = new Map();

    profileData.forEach(dp => {
      dp.recommendationSequence.forEach(rec => {
        recommendationCounts.set(rec, (recommendationCounts.get(rec) || 0) + 1);
      });
    });

    return Array.from(recommendationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([rec]) => rec);
  }

  /**
   * Helper: Calculate outcome variance
   */
  private calculateOutcomeVariance(outcomes: OutcomeFeedback[]): number {
    if (outcomes.length < 2) return 0;

    const scores = outcomes.map(o =>
      ['excellent', 'good'].includes(o.successLevel) ? 1 : 0
    ) as number[];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;

    return variance;
  }

  /**
   * Helper: Calculate confidence accuracy
   */
  private calculateConfidenceAccuracy(outcomes: OutcomeFeedback[]): number {
    // Compare predicted confidence to actual outcomes
    return (
      outcomes.reduce((sum, o) => {
        const outcomeValue = ['excellent', 'good'].includes(o.successLevel) ? 1 : 0;
        return sum - Math.abs(o.metrics.confidenceChange - outcomeValue);
      }, 0) / outcomes.length +
      1
    ) / 2;
  }

  /**
   * Helper: Calculate learning velocity
   */
  private calculateLearningVelocity(): number {
    if (this.dataPoints.length < 10) return 0;

    const sorted = [...this.dataPoints].sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstSuccessRate =
      firstHalf.flatMap(dp => dp.outcomes).filter(o =>
        ['excellent', 'good'].includes(o.successLevel)
      ).length / Math.max(1, firstHalf.flatMap(dp => dp.outcomes).length);

    const secondSuccessRate =
      secondHalf.flatMap(dp => dp.outcomes).filter(o =>
        ['excellent', 'good'].includes(o.successLevel)
      ).length / Math.max(1, secondHalf.flatMap(dp => dp.outcomes).length);

    return secondSuccessRate - firstSuccessRate;
  }

  /**
   * Get current insights
   */
  getInsights(): PopulationInsights | null {
    return this.insights;
  }

  /**
   * Get data point count
   */
  getDataPointCount(): number {
    return this.dataPoints.length;
  }

  /**
   * Get unique student count
   */
  getUniqueStudentCount(): number {
    return new Set(this.dataPoints.map(dp => dp.studentId)).size;
  }

  /**
   * Export all data
   */
  exportData(): {
    dataPoints: PopulationDataPoint[];
    insights: PopulationInsights | null;
  } {
    return {
      dataPoints: [...this.dataPoints],
      insights: this.insights,
    };
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.dataPoints = [];
    this.insights = null;
  }
}
