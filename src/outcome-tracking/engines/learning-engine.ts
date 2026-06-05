/**
 * CareerOS - Learning Engine
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Discovers patterns from outcome data.
 *
 * @module learning-engine
 * @version 1.0.0
 */

import type {
  OutcomeRecord,
} from '../types/outcome-tracking-types';
import type {
  LearningEngine,
  PatternLearningRequest,
  PatternLearningResult,
  LearnedPattern,
  PatternType,
  PatternCondition,
  PatternStatistics,
  PatternConfidence,
  PatternMetadata,
  InsightGenerationRequest,
  InsightGenerationResult,
  LearningInsight,
  InsightType,
  PersonalizedRecommendation,
  RiskWarning,
  OpportunityAlert,
  PatternValidationResult,
  PatternApplicationResult,
} from '../types/learning-engine-types';
import type { CohortInsight } from '../types/cohort-engine-types';

/**
 * Learning Engine Implementation - Discovers patterns from outcome data.
 *
 * Analyzes outcome records to discover statistical patterns about what
 * leads to successful career outcomes.
 */
export class LearningEngineImpl implements LearningEngine {
  private patterns: Map<string, LearnedPattern> = new Map();
  private outcomeRecords: OutcomeRecord[] = [];

  /**
   * Learn patterns from outcome data.
   */
  async learnPatterns(request: PatternLearningRequest & { outcomeRecords?: OutcomeRecord[] }): Promise<PatternLearningResult> {
    const startTime = Date.now();

    // Use provided records or stored records
    const records = request.outcomeRecords || this.outcomeRecords;

    // Filter records based on request criteria
    const filteredRecords = this.filterRecords(records, request);

    if (filteredRecords.length < request.minSampleSize) {
      return {
        patterns: [],
        statistics: {
          recordsAnalyzed: filteredRecords.length,
          patternsDiscovered: 0,
          patternsRetained: 0,
          processingTimeMs: Date.now() - startTime,
          memoryUsedBytes: 0,
        },
        quality: {
          coveragePercentage: 0,
          averageConfidence: 0,
          diversityScore: 0,
          noveltyScore: 0,
        },
        recommendations: [],
      };
    }

    // Discover patterns
    const discoveredPatterns = this.discoverPatterns(filteredRecords, request);

    // Filter by confidence threshold
    const retainedPatterns = discoveredPatterns.filter(
      p => p.confidence.overallConfidence >= request.minConfidenceThreshold
    );

    // Store patterns
    for (const pattern of retainedPatterns) {
      this.patterns.set(pattern.patternId, pattern);
    }

    const processingTime = Date.now() - startTime;

    return {
      patterns: retainedPatterns,
      statistics: {
        recordsAnalyzed: filteredRecords.length,
        patternsDiscovered: discoveredPatterns.length,
        patternsRetained: retainedPatterns.length,
        processingTimeMs: processingTime,
        memoryUsedBytes: this.estimateMemoryUsage(retainedPatterns),
      },
      quality: this.calculateQualityMetrics(retainedPatterns, filteredRecords),
      recommendations: this.generateUsageRecommendations(retainedPatterns),
    };
  }

  /**
   * Generate insights for a student context.
   */
  async generateInsights(request: InsightGenerationRequest): Promise<InsightGenerationResult> {
    const insights: CohortInsight[] = [];
    const personalizedRecommendations: PersonalizedRecommendation[] = [];
    const riskWarnings: RiskWarning[] = [];
    const opportunityAlerts: OpportunityAlert[] = [];

    // Match student to relevant patterns
    const matchedPatterns = this.matchPatternsToStudent(request);

    // Generate insights from matched patterns
    for (const { pattern, matchScore } of matchedPatterns) {
      if (matchScore > 0.7) {
        const insight = this.patternToInsight(pattern, request, matchScore);
        insights.push(insight);

        // Generate personalized recommendations
        const recs = this.generatePersonalizedRecommendations(pattern, request);
        personalizedRecommendations.push(...recs);

        // Generate risk warnings
        const risks = this.generateRiskWarnings(pattern, request);
        riskWarnings.push(...risks);

        // Generate opportunity alerts
        const opportunities = this.generateOpportunityAlerts(pattern, request);
        opportunityAlerts.push(...opportunities);
      }
    }

    // Sort by confidence and limit
    insights.sort((a, b) => {
      const getConfidenceValue = (c: number | string): number => {
        if (typeof c === 'number') return c;
        return c === 'HIGH' ? 90 : c === 'MEDIUM' ? 60 : 30;
      };
      return getConfidenceValue(b.confidence) - getConfidenceValue(a.confidence);
    });
    const limitedInsights = insights.slice(0, request.maxInsights);

    return {
      insights: limitedInsights,
      personalizedRecommendations: personalizedRecommendations.slice(0, 10),
      riskWarnings: riskWarnings.slice(0, 5),
      opportunityAlerts: opportunityAlerts.slice(0, 5),
    };
  }

  /**
   * Validate existing patterns against new data.
   */
  async validatePatterns(patternIds: string[]): Promise<PatternValidationResult> {
    const results = [];

    for (const patternId of patternIds) {
      const pattern = this.patterns.get(patternId);
      if (!pattern) {
        results.push({
          patternId,
          isStillValid: false,
          validationConfidence: 0,
          recommendedAction: 'DEPRECATE',
        });
        continue;
      }

      // Validate against recent outcome records
      const recentRecords = this.getRecentRecords(90); // Last 90 days
      const validationResult = this.validatePattern(pattern, recentRecords);

      results.push(validationResult);
    }

    return {
      results,
      statistics: {
        totalValidated: results.length,
        stillValid: results.filter(r => r.isStillValid).length,
        needsUpdate: results.filter(r => r.recommendedAction === 'UPDATE').length,
        deprecated: results.filter(r => r.recommendedAction === 'DEPRECATE').length,
      },
    };
  }

  /**
   * Get all active patterns.
   */
  async getActivePatterns(): Promise<LearnedPattern[]> {
    return Array.from(this.patterns.values()).filter(p => p.metadata.isActive);
  }

  /**
   * Apply learned patterns to a recommendation.
   */
  async applyPatterns(
    recommendationId: string,
    studentProfile: Record<string, unknown>
  ): Promise<PatternApplicationResult> {
    const matchedPatterns: LearnedPattern[] = [];
    const adjustments: PatternApplicationResult['adjustments'] = [];
    let confidenceBoost = 0;
    const additionalInsights: string[] = [];

    // Match student profile to patterns
    for (const pattern of Array.from(this.patterns.values())) {
      const matchScore = this.calculatePatternMatch(pattern, studentProfile);
      if (matchScore > 0.6) {
        matchedPatterns.push(pattern);

        // Calculate confidence boost
        confidenceBoost += (pattern.confidence.overallConfidence / 100) * (matchScore - 0.6) * 10;

        // Generate adjustments
        const patternAdjustments = this.generateAdjustments(pattern, studentProfile);
        adjustments.push(...patternAdjustments);

        // Add insights
        additionalInsights.push(pattern.description);
      }
    }

    // Cap confidence boost
    confidenceBoost = Math.min(confidenceBoost, 15);

    return {
      matchedPatterns,
      adjustments,
      confidenceBoost,
      additionalInsights,
    };
  }

  /**
   * Update with a new outcome record.
   */
  async updateWithNewRecord(record: OutcomeRecord): Promise<void> {
    this.outcomeRecords.push(record);

    // Trigger incremental pattern learning if we have enough new records
    if (this.outcomeRecords.length % 100 === 0) {
      await this.learnPatterns({
        minSampleSize: 50,
        minConfidenceThreshold: 70,
      });
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private filterRecords(
    records: OutcomeRecord[],
    request: PatternLearningRequest
  ): OutcomeRecord[] {
    return records.filter(record => {
      // Filter by time range
      if (request.timeRange) {
        const recordDate = record.events.recommendation.timestamp;
        if (recordDate < request.timeRange.startDate || recordDate > request.timeRange.endDate) {
          return false;
        }
      }

      // Filter by cohorts
      if (request.cohortIds && request.cohortIds.length > 0) {
        const hasMatchingCohort = record.learningData.cohortIds.some(
          cohortId => request.cohortIds!.includes(cohortId)
        );
        if (!hasMatchingCohort) {
          return false;
        }
      }

      return true;
    });
  }

  private discoverPatterns(
    records: OutcomeRecord[],
    request: PatternLearningRequest
  ): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];
    const patternTypes = request.patternTypes || [
      'ARCHETYPE_OUTCOME',
      'DECISION_OUTCOME',
      'ACTION_OUTCOME',
      'COHORT_OUTCOME',
    ];

    for (const patternType of patternTypes) {
      const typePatterns = this.discoverPatternsOfType(records, patternType, request);
      patterns.push(...typePatterns);
    }

    return patterns;
  }

  private discoverPatternsOfType(
    records: OutcomeRecord[],
    patternType: PatternType,
    request: PatternLearningRequest
  ): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];

    switch (patternType) {
      case 'ARCHETYPE_OUTCOME':
        patterns.push(...this.discoverArchetypePatterns(records));
        break;
      case 'DECISION_OUTCOME':
        patterns.push(...this.discoverDecisionPatterns(records));
        break;
      case 'ACTION_OUTCOME':
        patterns.push(...this.discoverActionPatterns(records));
        break;
      case 'COHORT_OUTCOME':
        patterns.push(...this.discoverCohortPatterns(records));
        break;
      case 'PATHWAY_SUCCESS':
        patterns.push(...this.discoverPathwaySuccessPatterns(records));
        break;
      case 'PATHWAY_FAILURE':
        patterns.push(...this.discoverPathwayFailurePatterns(records));
        break;
    }

    return patterns;
  }

  private discoverArchetypePatterns(records: OutcomeRecord[]): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];

    // Group records by archetype patterns
    const archetypeGroups = this.groupByArchetype(records);

    for (const [archetypeKey, groupRecords] of Array.from(archetypeGroups.entries())) {
      if (groupRecords.length < 10) continue;

      const successRate = groupRecords.filter(r => r.insights.recommendationSuccess).length / groupRecords.length;
      const avgSatisfaction = groupRecords.reduce((sum, r) =>
        sum + r.events.outcome.satisfaction.overallSatisfaction, 0) / groupRecords.length;

      // Only create pattern if there's a clear signal
      if (successRate > 0.6 || successRate < 0.4) {
        const pattern: LearnedPattern = {
          patternId: `archetype_${archetypeKey}_${Date.now()}`,
          patternType: 'ARCHETYPE_OUTCOME',
          name: `${archetypeKey} Archetype Pattern`,
          description: `Students with ${archetypeKey} archetype have ${(successRate * 100).toFixed(1)}% success rate`,
          conditions: this.extractArchetypeConditions(archetypeKey),
          predictedOutcome: {
            outcomeType: successRate > 0.6 ? 'HIGH_SUCCESS' : 'HIGH_RISK',
            successProbability: successRate * 100,
            predictedSatisfaction: avgSatisfaction,
            predictedTimelineDays: this.calculateAverageTimeline(groupRecords),
            keyFactors: this.extractKeyFactors(groupRecords),
            riskFactors: successRate < 0.6 ? ['Low historical success rate'] : [],
          },
          statistics: this.calculatePatternStatistics(groupRecords),
          confidence: this.calculatePatternConfidence(groupRecords),
          metadata: {
            discoveredAt: new Date(),
            lastValidatedAt: new Date(),
            timesApplied: 0,
            successfulApplications: 0,
            version: 1,
            isActive: true,
            discoverySource: 'AUTOMATED',
          },
        };

        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private discoverDecisionPatterns(records: OutcomeRecord[]): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];

    // Analyze decision confidence vs outcomes
    const highConfidenceRecords = records.filter(r => r.events.decision.confidence >= 70);
    const lowConfidenceRecords = records.filter(r => r.events.decision.confidence < 40);

    if (highConfidenceRecords.length >= 10) {
      const successRate = highConfidenceRecords.filter(r => r.insights.recommendationSuccess).length / highConfidenceRecords.length;

      patterns.push({
        patternId: `decision_high_conf_${Date.now()}`,
        patternType: 'DECISION_OUTCOME',
        name: 'High Confidence Decision Pattern',
        description: `Students with high decision confidence (${highConfidenceRecords.length} cases) have ${(successRate * 100).toFixed(1)}% success rate`,
        conditions: [
          {
            conditionType: 'DECISION',
            attribute: 'confidence',
            operator: 'GREATER_THAN',
            value: 70,
            weight: 1.0,
          },
        ],
        predictedOutcome: {
          outcomeType: successRate > 0.6 ? 'HIGH_SUCCESS' : 'MIXED_RESULTS',
          successProbability: successRate * 100,
          predictedSatisfaction: this.calculateAverageSatisfaction(highConfidenceRecords),
          predictedTimelineDays: this.calculateAverageTimeline(highConfidenceRecords),
          keyFactors: ['High decision confidence'],
          riskFactors: successRate < 0.5 ? ['Confidence may not correlate with success'] : [],
        },
        statistics: this.calculatePatternStatistics(highConfidenceRecords),
        confidence: this.calculatePatternConfidence(highConfidenceRecords),
        metadata: {
          discoveredAt: new Date(),
          lastValidatedAt: new Date(),
          timesApplied: 0,
          successfulApplications: 0,
          version: 1,
          isActive: true,
          discoverySource: 'AUTOMATED',
        },
      });
    }

    return patterns;
  }

  private discoverActionPatterns(records: OutcomeRecord[]): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];

    // Analyze action completion vs outcomes
    const highCompletionRecords = records.filter(r => r.events.action.progressStatus.overallProgress >= 80);

    if (highCompletionRecords.length >= 10) {
      const successRate = highCompletionRecords.filter(r => r.insights.recommendationSuccess).length / highCompletionRecords.length;

      patterns.push({
        patternId: `action_high_completion_${Date.now()}`,
        patternType: 'ACTION_OUTCOME',
        name: 'High Action Completion Pattern',
        description: `Students with high action completion (${highCompletionRecords.length} cases) have ${(successRate * 100).toFixed(1)}% success rate`,
        conditions: [
          {
            conditionType: 'ACTION',
            attribute: 'progressStatus.overallProgress',
            operator: 'GREATER_THAN',
            value: 80,
            weight: 1.0,
          },
        ],
        predictedOutcome: {
          outcomeType: successRate > 0.7 ? 'HIGH_SUCCESS' : 'MODERATE_SUCCESS',
          successProbability: successRate * 100,
          predictedSatisfaction: this.calculateAverageSatisfaction(highCompletionRecords),
          predictedTimelineDays: this.calculateAverageTimeline(highCompletionRecords),
          keyFactors: ['Strong action execution', 'High milestone completion'],
          riskFactors: [],
        },
        statistics: this.calculatePatternStatistics(highCompletionRecords),
        confidence: this.calculatePatternConfidence(highCompletionRecords),
        metadata: {
          discoveredAt: new Date(),
          lastValidatedAt: new Date(),
          timesApplied: 0,
          successfulApplications: 0,
          version: 1,
          isActive: true,
          discoverySource: 'AUTOMATED',
        },
      });
    }

    return patterns;
  }

  private discoverCohortPatterns(records: OutcomeRecord[]): LearnedPattern[] {
    // Cohort patterns would be discovered by analyzing cohort-specific outcomes
    // This would integrate with the CohortEngine
    return [];
  }

  private discoverPathwaySuccessPatterns(records: OutcomeRecord[]): LearnedPattern[] {
    // Analyze successful pathways
    const successRecords = records.filter(r => r.insights.recommendationSuccess);
    return this.extractPathwayPatterns(successRecords, 'PATHWAY_SUCCESS');
  }

  private discoverPathwayFailurePatterns(records: OutcomeRecord[]): LearnedPattern[] {
    // Analyze failure pathways
    const failureRecords = records.filter(r => !r.insights.recommendationSuccess);
    return this.extractPathwayPatterns(failureRecords, 'PATHWAY_FAILURE');
  }

  private extractPathwayPatterns(records: OutcomeRecord[], patternType: PatternType): LearnedPattern[] {
    const patterns: LearnedPattern[] = [];

    // Group by path deviation type
    const deviationGroups = this.groupByPathDeviation(records);

    for (const [deviationType, groupRecords] of Array.from(deviationGroups.entries())) {
      if (groupRecords.length < 10) continue;

      const successRate = groupRecords.filter(r => r.insights.recommendationSuccess).length / groupRecords.length;

      patterns.push({
        patternId: `pathway_${deviationType}_${Date.now()}`,
        patternType,
        name: `${deviationType} Pathway Pattern`,
        description: `Pathway with ${deviationType} deviation has ${(successRate * 100).toFixed(1)}% success rate`,
        conditions: [
          {
            conditionType: 'DECISION',
            attribute: 'pathDeviation',
            operator: 'EQUALS',
            value: deviationType,
            weight: 1.0,
          },
        ],
        predictedOutcome: {
          outcomeType: successRate > 0.6 ? 'HIGH_SUCCESS' : 'HIGH_RISK',
          successProbability: successRate * 100,
          predictedSatisfaction: this.calculateAverageSatisfaction(groupRecords),
          predictedTimelineDays: this.calculateAverageTimeline(groupRecords),
          keyFactors: this.extractKeyFactors(groupRecords),
          riskFactors: successRate < 0.5 ? ['Historical low success rate'] : [],
        },
        statistics: this.calculatePatternStatistics(groupRecords),
        confidence: this.calculatePatternConfidence(groupRecords),
        metadata: {
          discoveredAt: new Date(),
          lastValidatedAt: new Date(),
          timesApplied: 0,
          successfulApplications: 0,
          version: 1,
          isActive: true,
          discoverySource: 'AUTOMATED',
        },
      });
    }

    return patterns;
  }

  private groupByArchetype(records: OutcomeRecord[]): Map<string, OutcomeRecord[]> {
    const groups = new Map<string, OutcomeRecord[]>();

    for (const record of records) {
      for (const pattern of record.learningData.archetypePatterns) {
        const group = groups.get(pattern) || [];
        group.push(record);
        groups.set(pattern, group);
      }
    }

    return groups;
  }

  private groupByPathDeviation(records: OutcomeRecord[]): Map<string, OutcomeRecord[]> {
    const groups = new Map<string, OutcomeRecord[]>();

    for (const record of records) {
      const deviation = record.insights.pathDeviation;
      const group = groups.get(deviation) || [];
      group.push(record);
      groups.set(deviation, group);
    }

    return groups;
  }

  private extractArchetypeConditions(archetypeKey: string): PatternCondition[] {
    // Parse archetype key to extract conditions
    // This is simplified - in production would be more sophisticated
    return [
      {
        conditionType: 'ARCHETYPE',
        attribute: 'archetypePattern',
        operator: 'MATCHES',
        value: archetypeKey,
        weight: 1.0,
      },
    ];
  }

  private calculateAverageSatisfaction(records: OutcomeRecord[]): number {
    return records.reduce((sum, r) => sum + r.events.outcome.satisfaction.overallSatisfaction, 0) / records.length;
  }

  private calculateAverageTimeline(records: OutcomeRecord[]): number {
    return records.reduce((sum, r) => sum + r.events.outcome.timeline.daysToOutcome, 0) / records.length;
  }

  private extractKeyFactors(records: OutcomeRecord[]): string[] {
    const factorCounts = new Map<string, number>();

    for (const record of records) {
      for (const factor of record.insights.successFactors) {
        factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
      }
    }

    return Array.from(factorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor]) => factor);
  }

  private calculatePatternStatistics(records: OutcomeRecord[]): PatternStatistics {
    const supportingCases = records.filter(r => r.insights.recommendationSuccess).length;
    const contradictingCases = records.length - supportingCases;
    const successRate = supportingCases / records.length;

    return {
      supportingCases,
      contradictingCases,
      successRate: successRate * 100,
      averageSatisfaction: this.calculateAverageSatisfaction(records),
      averageTimelineDays: this.calculateAverageTimeline(records),
      statisticalSignificance: this.calculateSignificance(records),
      effectSize: this.calculateEffectSize(records),
    };
  }

  private calculatePatternConfidence(records: OutcomeRecord[]): PatternConfidence {
    const sampleSize = records.length;
    const sampleSizeConfidence = Math.min(100, sampleSize * 2); // 50+ samples = 100 confidence

    // Calculate consistency
    const outcomes = records.map(r => r.insights.recommendationSuccess);
    const successRate = outcomes.filter(o => o).length / outcomes.length;
    const consistencyConfidence = 100 - Math.abs(successRate - 0.5) * 200; // Higher confidence when not 50/50

    // Statistical confidence
    const statisticalConfidence = this.calculateSignificance(records) > 0.05 ? 60 : 90;

    const overallConfidence = (sampleSizeConfidence * 0.3 + consistencyConfidence * 0.4 + statisticalConfidence * 0.3);

    return {
      overallConfidence,
      sampleSizeConfidence,
      consistencyConfidence,
      statisticalConfidence,
      level: overallConfidence >= 80 ? 'HIGH' : overallConfidence >= 50 ? 'MEDIUM' : 'LOW',
    };
  }

  private calculateSignificance(records: OutcomeRecord[]): number {
    // Simplified significance calculation
    // In production, use proper statistical tests
    const n = records.length;
    if (n < 10) return 1.0;

    const successes = records.filter(r => r.insights.recommendationSuccess).length;
    const p = successes / n;

    // Simple binomial test approximation
    const se = Math.sqrt(p * (1 - p) / n);
    const z = Math.abs(p - 0.5) / se;

    // Approximate p-value
    return Math.max(0.001, Math.min(1, 2 * (1 - this.normalCDF(z))));
  }

  private calculateEffectSize(records: OutcomeRecord[]): number {
    // Cohen's d approximation
    const successes = records.filter(r => r.insights.recommendationSuccess);
    const failures = records.filter(r => !r.insights.recommendationSuccess);

    if (successes.length === 0 || failures.length === 0) return 0;

    const successSatisfaction = this.calculateAverageSatisfaction(successes);
    const failureSatisfaction = this.calculateAverageSatisfaction(failures);

    const pooledSD = Math.sqrt(
      (this.variance(successes.map(r => r.events.outcome.satisfaction.overallSatisfaction)) +
       this.variance(failures.map(r => r.events.outcome.satisfaction.overallSatisfaction))) / 2
    );

    return pooledSD === 0 ? 0 : Math.abs(successSatisfaction - failureSatisfaction) / pooledSD;
  }

  private variance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private normalCDF(x: number): number {
    // Approximation of standard normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  private calculateQualityMetrics(patterns: LearnedPattern[], records: OutcomeRecord[]): {
    coveragePercentage: number;
    averageConfidence: number;
    diversityScore: number;
    noveltyScore: number;
  } {
    if (patterns.length === 0) {
      return {
        coveragePercentage: 0,
        averageConfidence: 0,
        diversityScore: 0,
        noveltyScore: 0,
      };
    }

    // Coverage: what percentage of records are covered by at least one pattern
    const coveredRecords = new Set<string>();
    for (const pattern of patterns) {
      // In production, would actually match records to patterns
      // For now, approximate based on pattern statistics
      for (let i = 0; i < pattern.statistics.supportingCases; i++) {
        coveredRecords.add(`record_${i}`);
      }
    }
    const coveragePercentage = Math.min(100, (coveredRecords.size / records.length) * 100);

    // Average confidence
    const averageConfidence = patterns.reduce((sum, p) => sum + p.confidence.overallConfidence, 0) / patterns.length;

    // Diversity: variety of pattern types
    const patternTypes = new Set(patterns.map(p => p.patternType));
    const diversityScore = (patternTypes.size / 7) * 100; // 7 pattern types

    // Novelty: how many patterns are new (version 1)
    const newPatterns = patterns.filter(p => p.metadata.version === 1).length;
    const noveltyScore = (newPatterns / patterns.length) * 100;

    return {
      coveragePercentage,
      averageConfidence,
      diversityScore,
      noveltyScore,
    };
  }

  private generateUsageRecommendations(patterns: LearnedPattern[]): {
    patternId: string;
    useCase: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    expectedImpact: string;
    implementationNotes: string;
  }[] {
    return patterns.map(pattern => ({
      patternId: pattern.patternId,
      useCase: `Apply to students matching: ${pattern.description}`,
      priority: pattern.confidence.level === 'HIGH' ? 'HIGH' : 'MEDIUM',
      expectedImpact: `Improve recommendation accuracy by ${(pattern.statistics.successRate - 50).toFixed(1)}%`,
      implementationNotes: `Pattern has ${pattern.statistics.supportingCases} supporting cases`,
    }));
  }

  private matchPatternsToStudent(
    request: InsightGenerationRequest
  ): Array<{ pattern: LearnedPattern; matchScore: number }> {
    const matches: Array<{ pattern: LearnedPattern; matchScore: number }> = [];

    for (const pattern of Array.from(this.patterns.values())) {
      const matchScore = this.calculatePatternMatchForRequest(pattern, request);
      if (matchScore > 0.5) {
        matches.push({ pattern, matchScore });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculatePatternMatch(
    pattern: LearnedPattern,
    profile: Record<string, unknown>
  ): number {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of pattern.conditions) {
      totalWeight += condition.weight;

      const value = this.getNestedValue(profile, condition.attribute);
      if (value === undefined) continue;

      if (this.matchesCondition(value, condition)) {
        matchedWeight += condition.weight;
      }
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  private calculatePatternMatchForRequest(
    pattern: LearnedPattern,
    request: InsightGenerationRequest
  ): number {
    // Simplified matching based on archetype profile
    const profile = request.archetypeProfile;
    return this.calculatePatternMatch(pattern, profile);
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }

  private matchesCondition(value: unknown, condition: PatternCondition): boolean {
    switch (condition.operator) {
      case 'EQUALS':
        return value === condition.value;
      case 'CONTAINS':
        return Array.isArray(value) && value.includes(condition.value);
      case 'GREATER_THAN':
        return typeof value === 'number' && value > (condition.value as number);
      case 'LESS_THAN':
        return typeof value === 'number' && value < (condition.value as number);
      case 'IN':
        return Array.isArray(condition.value) && (condition.value as unknown[]).includes(value);
      case 'MATCHES':
        return typeof value === 'string' && value.includes(condition.value as string);
      default:
        return false;
    }
  }

  private patternToInsight(
    pattern: LearnedPattern,
    request: InsightGenerationRequest,
    matchScore: number
  ): CohortInsight {
    const insightTypes: Array<'SUCCESS_PATTERN' | 'PATHWAY_INSIGHT'> = ['SUCCESS_PATTERN', 'PATHWAY_INSIGHT'];

    return {
      insightId: `insight_${pattern.patternId}_${Date.now()}`,
      cohortId: request.cohortIds[0] || 'general',
      type: insightTypes[0],
      title: pattern.name,
      description: pattern.description,
      supportingData: {
        sampleSize: pattern.statistics.supportingCases,
        applicabilityPercentage: matchScore * 100,
        successRate: pattern.statistics.successRate,
        averageOutcomeScore: pattern.predictedOutcome.predictedSatisfaction,
        vsOverallPopulation: {
          successRateDelta: pattern.statistics.successRate - 50,
          satisfactionDelta: pattern.predictedOutcome.predictedSatisfaction - 50,
          timelineDelta: 0,
          isSignificant: pattern.confidence.statisticalConfidence > 80,
        },
        keyStatistics: {
          confidence: pattern.confidence.overallConfidence,
          effectSize: pattern.statistics.effectSize,
          pValue: pattern.statistics.statisticalSignificance,
        },
      },
      recommendations: [
        `Consider ${pattern.predictedOutcome.outcomeType === 'HIGH_SUCCESS' ? 'prioritizing' : 'reviewing'} this path`,
        `Key factors: ${pattern.predictedOutcome.keyFactors.join(', ')}`,
      ],
      confidence: pattern.confidence.overallConfidence,
      generatedAt: new Date(),
    };
  }

  private generatePersonalizedRecommendations(
    pattern: LearnedPattern,
    request: InsightGenerationRequest
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    if (pattern.predictedOutcome.outcomeType === 'HIGH_SUCCESS') {
      recommendations.push({
        recommendation: `This path aligns well with your profile based on ${pattern.statistics.supportingCases} similar students`,
        basis: pattern.description,
        confidence: pattern.confidence.level,
        expectedOutcome: `${(pattern.statistics.successRate).toFixed(0)}% success rate with average satisfaction of ${pattern.predictedOutcome.predictedSatisfaction.toFixed(0)}/100`,
        supportingEvidence: `Pattern confidence: ${pattern.confidence.overallConfidence.toFixed(0)}%`,
      });
    }

    if (pattern.predictedOutcome.riskFactors.length > 0) {
      recommendations.push({
        recommendation: `Be aware of potential risks: ${pattern.predictedOutcome.riskFactors.join(', ')}`,
        basis: 'Historical pattern analysis',
        confidence: pattern.confidence.level,
        expectedOutcome: 'Risk mitigation through awareness',
        supportingEvidence: `${pattern.statistics.contradictingCases} students faced challenges`,
      });
    }

    return recommendations;
  }

  private generateRiskWarnings(
    pattern: LearnedPattern,
    request: InsightGenerationRequest
  ): RiskWarning[] {
    const warnings: RiskWarning[] = [];

    if (pattern.predictedOutcome.outcomeType === 'HIGH_RISK' || pattern.predictedOutcome.outcomeType === 'LIKELY_FAILURE') {
      warnings.push({
        riskType: 'Historical Low Success Rate',
        description: `Students similar to you have ${(100 - pattern.statistics.successRate).toFixed(0)}% failure rate with this approach`,
        likelihood: 100 - pattern.statistics.successRate,
        impact: 'HIGH',
        mitigationStrategies: [
          'Consider alternative paths with higher success rates',
          'Increase preparation and skill building before pursuing',
          'Seek mentorship from those who succeeded',
        ],
      });
    }

    for (const riskFactor of pattern.predictedOutcome.riskFactors) {
      warnings.push({
        riskType: riskFactor,
        description: `Identified risk factor from pattern analysis`,
        likelihood: 60,
        impact: 'MEDIUM',
        mitigationStrategies: ['Monitor closely', 'Develop contingency plans'],
      });
    }

    return warnings;
  }

  private generateOpportunityAlerts(
    pattern: LearnedPattern,
    request: InsightGenerationRequest
  ): OpportunityAlert[] {
    const alerts: OpportunityAlert[] = [];

    if (pattern.predictedOutcome.outcomeType === 'HIGH_SUCCESS') {
      alerts.push({
        opportunityType: 'High Success Pathway',
        description: `Strong alignment with your profile - ${pattern.statistics.successRate.toFixed(0)}% of similar students succeed`,
        potentialBenefit: `Above-average satisfaction (${pattern.predictedOutcome.predictedSatisfaction.toFixed(0)}/100)`,
        recommendedAction: 'Prioritize this path and commit to the recommended actions',
        timeSensitivity: 'TIMELY',
      });
    }

    return alerts;
  }

  private validatePattern(pattern: LearnedPattern, recentRecords: OutcomeRecord[]): {
    patternId: string;
    isStillValid: boolean;
    validationConfidence: number;
    recommendedAction: 'KEEP' | 'UPDATE' | 'DEPRECATE';
  } {
    if (recentRecords.length < 5) {
      return {
        patternId: pattern.patternId,
        isStillValid: true,
        validationConfidence: 50,
        recommendedAction: 'KEEP',
      };
    }

    // Check if recent records support the pattern
    let supportingCount = 0;
    for (const record of recentRecords) {
      const matchScore = this.calculatePatternMatch(pattern, record.learningData as unknown as Record<string, unknown>);
      if (matchScore > 0.6) {
        if (pattern.predictedOutcome.outcomeType === 'HIGH_SUCCESS' && record.insights.recommendationSuccess) {
          supportingCount++;
        } else if (pattern.predictedOutcome.outcomeType === 'HIGH_RISK' && !record.insights.recommendationSuccess) {
          supportingCount++;
        }
      }
    }

    const recentSuccessRate = supportingCount / recentRecords.length;
    const originalSuccessRate = pattern.statistics.successRate / 100;

    const isStillValid = Math.abs(recentSuccessRate - originalSuccessRate) < 0.2;
    const validationConfidence = isStillValid ? 80 : 40;

    let recommendedAction: 'KEEP' | 'UPDATE' | 'DEPRECATE';
    if (isStillValid) {
      recommendedAction = 'KEEP';
    } else if (recentSuccessRate > 0.3) {
      recommendedAction = 'UPDATE';
    } else {
      recommendedAction = 'DEPRECATE';
    }

    return {
      patternId: pattern.patternId,
      isStillValid,
      validationConfidence,
      recommendedAction,
    };
  }

  private getRecentRecords(days: number): OutcomeRecord[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.outcomeRecords.filter(r => r.events.outcome.timestamp >= cutoffDate);
  }

  private generateAdjustments(
    pattern: LearnedPattern,
    profile: Record<string, unknown>
  ): PatternApplicationResult['adjustments'] {
    const adjustments: PatternApplicationResult['adjustments'] = [];

    // Generate adjustments based on pattern predictions
    if (pattern.predictedOutcome.predictedSatisfaction > 70) {
      adjustments.push({
        attribute: 'confidence',
        originalValue: profile['confidence'],
        adjustedValue: Math.min(100, (profile['confidence'] as number || 50) + 10),
        reason: `Pattern indicates high satisfaction potential (${pattern.predictedOutcome.predictedSatisfaction.toFixed(0)}/100)`,
      });
    }

    return adjustments;
  }

  private estimateMemoryUsage(patterns: LearnedPattern[]): number {
    // Rough estimate
    return patterns.length * 1024; // ~1KB per pattern
  }
}
