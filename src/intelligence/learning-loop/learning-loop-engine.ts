/**
 * CareerOS Learning Loop Engine
 *
 * Main orchestration engine that transforms CareerOS into a continuously
 * learning intelligence system. Integrates all learning components and
 * generates comprehensive learning reports.
 */

import {
  LearningLoopConfig,
  DEFAULT_LEARNING_CONFIG,
  LearningLoopReport,
  RecommendationAdjustment,
  ConfidenceShift,
  ExtractedLesson,
  FutureImpact,
  SystemLearningMetrics,
  StudentProfile,
  OutcomeFeedback,
  LearningEvent,
  LearningEventType,
  Timestamp,
  SuccessLevel,
  ConfidenceScore,
} from './learning-loop-types';

import {
  OutcomeFeedbackEngine,
  OutcomeRecord,
} from './outcome-feedback-engine';

import {
  RecommendationLearningEngine,
  RecommendationInstance,
} from './recommendation-learning-engine';

import {
  ConfidenceAdjustmentEngine,
  AdjustmentContext,
} from './confidence-adjustment-engine';

import {
  PopulationLearningEngine,
  PopulationDataPoint,
} from './population-learning-engine';

export interface LearningLoopEngineOptions {
  config?: Partial<LearningLoopConfig>;
  enablePopulationLearning?: boolean;
  autoRunInterval?: number; // milliseconds, 0 to disable
}

export interface RecommendationSet {
  id: string;
  recommendations: Array<{
    id: string;
    type: string;
    category: string;
    confidence: ConfidenceScore;
    priority: number;
  }>;
  timestamp: Timestamp;
}

export class LearningLoopEngine {
  private config: LearningLoopConfig;
  private outcomeEngine: OutcomeFeedbackEngine;
  private recommendationEngine: RecommendationLearningEngine;
  private confidenceEngine: ConfidenceAdjustmentEngine;
  private populationEngine: PopulationLearningEngine;
  private eventListeners: Array<(event: LearningEvent) => void> = [];
  private autoRunTimer: NodeJS.Timeout | null = null;

  constructor(options: LearningLoopEngineOptions = {}) {
    this.config = { ...DEFAULT_LEARNING_CONFIG, ...options.config };
    this.outcomeEngine = new OutcomeFeedbackEngine();
    this.recommendationEngine = new RecommendationLearningEngine();
    this.confidenceEngine = new ConfidenceAdjustmentEngine();
    this.populationEngine = new PopulationLearningEngine();

    if (options.autoRunInterval && options.autoRunInterval > 0) {
      this.autoRunTimer = setInterval(() => {
        this.runLearningCycle();
      }, options.autoRunInterval);
    }
  }

  // ============================================================================
  // OUTCOME TRACKING API
  // ============================================================================

  /**
   * Start tracking an outcome for a recommendation
   */
  trackOutcome(
    recommendationId: string,
    studentId: string,
    originalConfidence: number,
    contextualFactors?: Record<string, unknown>
  ): string {
    const outcomeId = this.outcomeEngine.trackOutcome(
      recommendationId,
      studentId,
      originalConfidence,
      contextualFactors as any
    );

    this.emitEvent(LearningEventType.OUTCOME_RECORDED, {
      outcomeId,
      recommendationId,
      studentId,
    });

    return outcomeId;
  }

  /**
   * Record a decision on a recommendation
   */
  recordDecision(outcomeId: string, decisionTimestamp?: Timestamp): void {
    this.outcomeEngine.recordDecision(outcomeId, decisionTimestamp);
  }

  /**
   * Record short-term outcome
   */
  recordShortTermOutcome(
    outcomeId: string,
    satisfactionScore: number,
    regretScore: number,
    confidenceChange: number,
    timestamp?: Timestamp
  ): void {
    this.outcomeEngine.recordShortTermOutcome(
      outcomeId,
      {
        satisfactionScore,
        regretScore,
        confidenceChange,
        goalAchievementRate: 0,
        skillGrowthRate: 0,
        careerProgressionRate: 0,
      },
      timestamp
    );
  }

  /**
   * Record complete outcome
   */
  recordCompleteOutcome(
    outcomeId: string,
    metrics: {
      satisfactionScore: number;
      regretScore: number;
      confidenceChange: number;
      goalAchievementRate: number;
      skillGrowthRate: number;
      careerProgressionRate: number;
    }
  ): OutcomeFeedback | null {
    const feedback = this.outcomeEngine.recordCompleteOutcome(outcomeId, metrics as any);

    if (feedback) {
      // Propagate to other engines
      this.processOutcomeFeedback(feedback);
    }

    return feedback;
  }

  // ============================================================================
  // RECOMMENDATION LEARNING API
  // ============================================================================

  /**
   * Record a recommendation being made
   */
  recordRecommendation(
    recommendationId: string,
    recommendationType: string,
    category: string,
    studentProfileSignature: string,
    timestamp?: Timestamp
  ): void {
    this.recommendationEngine.recordRecommendation(
      recommendationId,
      recommendationType,
      category,
      studentProfileSignature,
      timestamp
    );
  }

  /**
   * Get learning profile for a recommendation type
   */
  getRecommendationProfile(recommendationType: string, category: string) {
    return this.recommendationEngine.getProfile(recommendationType, category);
  }

  /**
   * Get consistently successful recommendations
   */
  getSuccessfulRecommendations(minSuccessRate: number = 0.8) {
    return this.recommendationEngine.getConsistentlySuccessful(minSuccessRate);
  }

  /**
   * Get consistently failing recommendations
   */
  getFailingRecommendations(maxSuccessRate: number = 0.3) {
    return this.recommendationEngine.getConsistentlyFailing(maxSuccessRate);
  }

  // ============================================================================
  // CONFIDENCE ADJUSTMENT API
  // ============================================================================

  /**
   * Calculate adjusted confidence for a recommendation
   */
  calculateAdjustedConfidence(
    recommendationType: string,
    category: string,
    currentConfidence: ConfidenceScore,
    studentProfileSignature: string,
    historicalOutcomes: OutcomeFeedback[]
  ): {
    adjustedConfidence: ConfidenceScore;
    adjustmentAmount: number;
    reasoning: string[];
  } {
    const populationSuccessRate = this.getPopulationSuccessRate(
      recommendationType,
      category
    );

    const recentTrend = this.getRecentTrend(recommendationType, category);

    const context: AdjustmentContext = {
      recommendationType,
      category,
      studentProfileSignature,
      historicalOutcomes,
      populationSuccessRate,
      recentTrend,
      currentConfidence,
    };

    const result = this.confidenceEngine.calculateAdjustment(
      currentConfidence,
      context
    );

    if (result.rulesApplied.length > 0) {
      this.emitEvent(LearningEventType.CONFIDENCE_ADJUSTED, {
        recommendationType,
        originalConfidence: result.originalConfidence,
        adjustedConfidence: result.adjustedConfidence,
        rulesApplied: result.rulesApplied,
      });
    }

    return {
      adjustedConfidence: result.adjustedConfidence,
      adjustmentAmount: result.adjustmentAmount,
      reasoning: result.reasoning,
    };
  }

  /**
   * Batch adjust multiple recommendations
   */
  batchAdjustConfidence(
    recommendations: Array<{
      recommendationType: string;
      category: string;
      currentConfidence: ConfidenceScore;
      studentProfileSignature: string;
    }>
  ): Array<{
    recommendationType: string;
    category: string;
    adjustedConfidence: ConfidenceScore;
    adjustmentAmount: number;
  }> {
    return recommendations.map(rec => {
      const historicalOutcomes = this.getHistoricalOutcomes(
        rec.recommendationType,
        rec.category
      );

      const result = this.calculateAdjustedConfidence(
        rec.recommendationType,
        rec.category,
        rec.currentConfidence,
        rec.studentProfileSignature,
        historicalOutcomes
      );

      return {
        recommendationType: rec.recommendationType,
        category: rec.category,
        adjustedConfidence: result.adjustedConfidence,
        adjustmentAmount: result.adjustmentAmount,
      };
    });
  }

  // ============================================================================
  // POPULATION LEARNING API
  // ============================================================================

  /**
   * Add population data point
   */
  addPopulationData(dataPoint: PopulationDataPoint): void {
    this.populationEngine.addDataPoint(dataPoint);
  }

  /**
   * Get population insights
   */
  getPopulationInsights() {
    return this.populationEngine.generateInsights();
  }

  /**
   * Get common success paths
   */
  getSuccessPaths() {
    const insights = this.populationEngine.generateInsights();
    return insights.commonSuccessPaths;
  }

  /**
   * Get hidden opportunities
   */
  getHiddenOpportunities() {
    const insights = this.populationEngine.generateInsights();
    return insights.hiddenOpportunities;
  }

  // ============================================================================
  // MAIN LEARNING LOOP
  // ============================================================================

  /**
   * Run a complete learning cycle
   */
  runLearningCycle(studentId?: string): LearningLoopReport {
    const now = Date.now();
    const period: [Timestamp, Timestamp] = [
      now - this.config.feedbackWindow,
      now,
    ];

    // Process pending outcomes
    this.processPendingOutcomes();

    // Generate recommendation adjustments
    const recommendationAdjustments = this.generateRecommendationAdjustments();

    // Generate confidence shifts
    const confidenceShifts = this.generateConfidenceShifts();

    // Extract lessons
    const extractedLessons = this.extractLessons();

    // Generate future impact projections
    const futureRecommendationImpact = this.generateFutureImpact();

    // Calculate system metrics
    const systemLearningMetrics = this.calculateSystemMetrics();

    const report: LearningLoopReport = {
      id: `report-${now}`,
      generatedAt: now,
      period,
      studentId,
      recommendationAdjustments,
      confidenceShifts,
      extractedLessons,
      futureRecommendationImpact,
      systemLearningMetrics,
    };

    this.emitEvent(LearningEventType.LEARNING_LOOP_COMPLETED, {
      reportId: report.id,
      adjustments: recommendationAdjustments.length,
      lessons: extractedLessons.length,
    });

    return report;
  }

  /**
   * Process a recommendation set through the learning loop
   */
  processRecommendationSet(
    recommendationSet: RecommendationSet,
    studentProfile: StudentProfile
  ): {
    adjustedRecommendations: Array<{
      id: string;
      originalConfidence: number;
      adjustedConfidence: number;
      priority: number;
    }>;
    lessons: ExtractedLesson[];
    report: LearningLoopReport;
  } {
    // Record recommendations
    recommendationSet.recommendations.forEach(rec => {
      this.recordRecommendation(
        rec.id,
        rec.type,
        rec.category,
        this.generateProfileSignature(studentProfile)
      );
    });

    // Adjust confidences
    const adjustedRecommendations = recommendationSet.recommendations.map(rec => {
      const historicalOutcomes = this.getHistoricalOutcomes(rec.type, rec.category);

      const result = this.calculateAdjustedConfidence(
        rec.type,
        rec.category,
        rec.confidence,
        this.generateProfileSignature(studentProfile),
        historicalOutcomes
      );

      return {
        id: rec.id,
        originalConfidence: rec.confidence,
        adjustedConfidence: result.adjustedConfidence,
        priority: this.calculatePriority(rec, result.adjustedConfidence),
      };
    });

    // Run learning cycle
    const report = this.runLearningCycle(studentProfile.id);

    return {
      adjustedRecommendations,
      lessons: report.extractedLessons,
      report,
    };
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  /**
   * Process outcome feedback across all engines
   */
  private processOutcomeFeedback(feedback: OutcomeFeedback): void {
    // Update recommendation engine
    this.recommendationEngine.recordOutcome(
      feedback.recommendationId,
      feedback
    );

    // Add to population engine
    const dataPoint: PopulationDataPoint = {
      studentId: feedback.studentId,
      profileSignature: 'unknown', // Would be populated from context
      recommendationSequence: [feedback.recommendationId],
      outcomes: [feedback],
      timestamp: Date.now(),
    };
    this.populationEngine.addDataPoint(dataPoint);

    this.emitEvent(LearningEventType.LESSON_EXTRACTED, {
      lesson: feedback.lessonExtracted,
      successLevel: feedback.successLevel,
      recommendationId: feedback.recommendationId,
    });
  }

  /**
   * Process any pending outcomes
   */
  private processPendingOutcomes(): void {
    // Outcome engine handles pending outcomes internally
  }

  /**
   * Generate recommendation adjustments
   */
  private generateRecommendationAdjustments(): RecommendationAdjustment[] {
    const adjustments: RecommendationAdjustment[] = [];

    const profiles = this.recommendationEngine.getAllProfiles();

    for (const profile of profiles) {
      if (profile.performanceMetrics.totalRecommendations < this.config.minOutcomesForLearning) {
        continue;
      }

      let newPriority = 5; // Default priority
      let adjustmentReason = '';
      let evidenceCount = profile.performanceMetrics.totalRecommendations;

      if (profile.performanceMetrics.successRate > 0.8) {
        newPriority = 3;
        adjustmentReason = 'High success rate warrants higher priority';
      } else if (profile.performanceMetrics.successRate < 0.3) {
        newPriority = 8;
        adjustmentReason = 'Low success rate requires review';
      }

      if (profile.performanceMetrics.trendDirection === 'improving') {
        newPriority = Math.max(1, newPriority - 1);
        adjustmentReason += '; Improving trend';
      } else if (profile.performanceMetrics.trendDirection === 'declining') {
        newPriority = Math.min(10, newPriority + 1);
        adjustmentReason += '; Declining trend';
      }

      adjustments.push({
        recommendationType: profile.recommendationType,
        category: profile.category,
        previousPriority: 5,
        newPriority,
        adjustmentReason,
        evidenceCount,
        confidence: profile.confidenceGrowthPattern.evidenceStrength,
      });
    }

    return adjustments;
  }

  /**
   * Generate confidence shifts
   */
  private generateConfidenceShifts(): ConfidenceShift[] {
    const shifts: ConfidenceShift[] = [];

    const profiles = this.recommendationEngine.getAllProfiles();

    for (const profile of profiles) {
      const originalConfidence = profile.confidenceGrowthPattern.initialConfidence;
      const newConfidence = profile.confidenceGrowthPattern.currentConfidence;

      if (Math.abs(newConfidence - originalConfidence) > 0.05) {
        shifts.push({
          recommendationType: profile.recommendationType,
          previousConfidence: originalConfidence,
          newConfidence,
          shiftDirection: newConfidence > originalConfidence ? 'increased' : 'decreased',
          shiftMagnitude: Math.abs(newConfidence - originalConfidence),
          primaryDriver: profile.performanceMetrics.trendDirection,
          evidenceStrength: profile.confidenceGrowthPattern.evidenceStrength,
        });
      }
    }

    return shifts;
  }

  /**
   * Extract lessons from all sources
   */
  private extractLessons(): ExtractedLesson[] {
    const lessons: ExtractedLesson[] = [];

    // Extract from recommendation profiles
    const profiles = this.recommendationEngine.getAllProfiles();
    for (const profile of profiles) {
      if (profile.learningHistory.length > 0) {
        const recentEntries = profile.learningHistory.slice(-5);
        
        for (const entry of recentEntries) {
          if (entry.impact > 0.7) {
            lessons.push({
              lessonId: `lesson-${profile.recommendationType}-${entry.timestamp}`,
              description: entry.description,
              source: entry.event === 'success' || entry.event === 'failure' ? 'individual' : 'pattern',
              applicability: [profile.recommendationType, profile.category],
              confidence: profile.confidenceGrowthPattern.evidenceStrength,
              impactScore: entry.impact,
              relatedRecommendations: [profile.recommendationType],
            });
          }
        }
      }
    }

    // Extract from population insights
    const insights = this.populationEngine.generateInsights();
    for (const pattern of insights.profileSpecificPatterns) {
      lessons.push({
        lessonId: `lesson-pop-${pattern.profileSignature}`,
        description: pattern.description,
        source: 'population',
        applicability: [pattern.profileSignature],
        confidence: pattern.confidence,
        impactScore: pattern.frequency / 100,
        relatedRecommendations: pattern.recommendations,
      });
    }

    return lessons.sort((a, b) => b.impactScore - a.impactScore).slice(0, 20);
  }

  /**
   * Generate future impact projections
   */
  private generateFutureImpact(): FutureImpact[] {
    const impacts: FutureImpact[] = [];

    const profiles = this.recommendationEngine.getAllProfiles();

    for (const profile of profiles) {
      const trend = profile.performanceMetrics.trendDirection;
      const currentSuccessRate = profile.performanceMetrics.successRate;
      const currentConfidence = profile.confidenceGrowthPattern.currentConfidence;

      let projectedSuccessRate = currentSuccessRate;
      let projectedConfidence = currentConfidence;

      if (trend === 'improving') {
        projectedSuccessRate = Math.min(0.95, currentSuccessRate * 1.1);
        projectedConfidence = Math.min(0.99, currentConfidence * 1.05);
      } else if (trend === 'declining') {
        projectedSuccessRate = Math.max(0.1, currentSuccessRate * 0.9);
        projectedConfidence = Math.max(0.1, currentConfidence * 0.95);
      }

      impacts.push({
        recommendationType: profile.recommendationType,
        projectedSuccessRate,
        projectedConfidence,
        projectedSatisfaction: profile.performanceMetrics.averageSatisfaction,
        projectionConfidence: profile.confidenceGrowthPattern.evidenceStrength,
        timeframe: '30 days',
      });
    }

    return impacts;
  }

  /**
   * Calculate system learning metrics
   */
  private calculateSystemMetrics(): SystemLearningMetrics {
    const outcomeStats = this.outcomeEngine.getCompletionStats();
    const lessons = this.extractLessons();

    const profiles = this.recommendationEngine.getAllProfiles();
    const totalRecommendations = profiles.reduce(
      (sum, p) => sum + p.performanceMetrics.totalRecommendations,
      0
    );

    const improvingCount = profiles.filter(
      p => p.performanceMetrics.trendDirection === 'improving'
    ).length;
    const decliningCount = profiles.filter(
      p => p.performanceMetrics.trendDirection === 'declining'
    ).length;

    let qualityTrend: 'improving' | 'stable' | 'declining';
    if (improvingCount > decliningCount * 2) {
      qualityTrend = 'improving';
    } else if (decliningCount > improvingCount * 2) {
      qualityTrend = 'declining';
    } else {
      qualityTrend = 'stable';
    }

    const avgSuccessRate =
      profiles.reduce((sum, p) => sum + p.performanceMetrics.successRate, 0) /
      Math.max(1, profiles.length);

    return {
      totalOutcomesProcessed: outcomeStats.total,
      totalLessonsExtracted: lessons.length,
      averageConfidenceAccuracy: avgSuccessRate,
      recommendationQualityTrend: qualityTrend,
      learningEffectiveness: improvingCount / Math.max(1, profiles.length),
      knowledgeGaps: this.identifyKnowledgeGaps(profiles),
    };
  }

  /**
   * Identify knowledge gaps
   */
  private identifyKnowledgeGaps(profiles: any[]): string[] {
    const gaps: string[] = [];

    const insufficientDataProfiles = profiles.filter(
      p => p.performanceMetrics.totalRecommendations < this.config.minOutcomesForLearning
    );

    if (insufficientDataProfiles.length > 0) {
      gaps.push(`${insufficientDataProfiles.length} recommendation types need more outcome data`);
    }

    const highRegretProfiles = profiles.filter(
      p => p.performanceMetrics.averageRegret > 0.5
    );

    if (highRegretProfiles.length > 0) {
      gaps.push(`${highRegretProfiles.length} recommendation types show high regret patterns`);
    }

    return gaps;
  }

  /**
   * Get historical outcomes for a recommendation type
   */
  private getHistoricalOutcomes(
    recommendationType: string,
    category: string
  ): OutcomeFeedback[] {
    // This would query the outcome engine for specific outcomes
    return [];
  }

  /**
   * Get population success rate
   */
  private getPopulationSuccessRate(
    recommendationType: string,
    category: string
  ): number {
    const profile = this.recommendationEngine.getProfile(recommendationType, category);
    return profile?.performanceMetrics.successRate || 0.5;
  }

  /**
   * Get recent trend
   */
  private getRecentTrend(
    recommendationType: string,
    category: string
  ): 'improving' | 'stable' | 'declining' {
    const profile = this.recommendationEngine.getProfile(recommendationType, category);
    return profile?.performanceMetrics.trendDirection || 'stable';
  }

  /**
   * Generate profile signature
   */
  private generateProfileSignature(studentProfile: StudentProfile): string {
    return studentProfile.characteristics
      .map(c => `${c.name}:${c.value}`)
      .join(',');
  }

  /**
   * Calculate priority based on confidence
   */
  private calculatePriority(
    recommendation: { priority: number },
    adjustedConfidence: number
  ): number {
    // Higher confidence = lower priority number (higher priority)
    const confidenceAdjustment = Math.round((1 - adjustedConfidence) * 5);
    return Math.max(1, Math.min(10, recommendation.priority + confidenceAdjustment));
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Subscribe to learning events
   */
  onEvent(listener: (event: LearningEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit learning event
   */
  private emitEvent(type: LearningEventType, data: unknown): void {
    const event: LearningEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch {
        // Ignore listener errors
      }
    });
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  /**
   * Dispose the engine
   */
  dispose(): void {
    if (this.autoRunTimer) {
      clearInterval(this.autoRunTimer);
      this.autoRunTimer = null;
    }
    this.eventListeners = [];
  }

  /**
   * Reset all learning data
   */
  reset(): void {
    this.outcomeEngine.reset();
    this.recommendationEngine.reset();
    this.confidenceEngine.reset();
    this.populationEngine.reset();
  }

  /**
   * Export all learning data
   */
  exportData(): {
    outcomes: ReturnType<OutcomeFeedbackEngine['exportData']>;
    recommendations: ReturnType<RecommendationLearningEngine['exportData']>;
    confidenceStats: ReturnType<ConfidenceAdjustmentEngine['getStatistics']>;
    population: ReturnType<PopulationLearningEngine['exportData']>;
  } {
    return {
      outcomes: this.outcomeEngine.exportData(),
      recommendations: this.recommendationEngine.exportData(),
      confidenceStats: this.confidenceEngine.getStatistics(),
      population: this.populationEngine.exportData(),
    };
  }
}
