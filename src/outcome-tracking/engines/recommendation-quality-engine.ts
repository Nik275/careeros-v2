/**
 * CareerOS - Recommendation Quality Engine
 *
 * Phase: Outcome Tracking Engine - Sub-Engine
 *
 * Calculates recommendation accuracy metrics.
 *
 * @module recommendation-quality-engine
 * @version 1.0.0
 */

import type {
  RecommendationId,
} from '../../recommendation/recommendation-types';
import type {
  OutcomeRecord,
  OutcomeRecordId,
} from '../types/outcome-tracking-types';
import type {
  RecommendationQualityEngine,
  RecommendationAccuracy,
  RecommendationQualityAnalysis,
  RecommendationQualityReport,
  TypeQualityMetrics,
  QualityTrend,
  QualityIssue,
  QualityOpportunity,
  QualityAnalysisOptions,
  QualityIssueCategory,
} from '../types/recommendation-quality-types';

/**
 * Recommendation Quality Engine Implementation.
 *
 * Analyzes the accuracy of recommendations by comparing predicted
 * outcomes with actual outcomes across multiple dimensions.
 */
export class RecommendationQualityEngineImpl implements RecommendationQualityEngine {
  private accuracyRecords: Map<string, RecommendationAccuracy> = new Map();
  private outcomeRecords: OutcomeRecord[] = [];

  /**
   * Calculate accuracy for a single recommendation.
   */
  async calculateAccuracy(
    recommendationId: RecommendationId,
    outcomeRecordId: OutcomeRecordId
  ): Promise<RecommendationAccuracy> {
    // Find the outcome record
    const outcomeRecord = this.outcomeRecords.find(r => r.recordId === outcomeRecordId);

    if (!outcomeRecord) {
      throw new Error(`Outcome record not found: ${outcomeRecordId}`);
    }

    // In production, would fetch original recommendation with predicted values
    // For now, use outcome data as proxy for predictions
    const predicted = {
      fit: 75,
      utility: 70,
      regret: 30,
      optionality: 65,
      simulation: 72,
    };

    const actual = {
      fit: outcomeRecord.events.outcome.satisfaction.careerSatisfaction,
      utility: outcomeRecord.events.outcome.utility.realizedUtility,
      regret: outcomeRecord.events.outcome.regret.regretLevel,
      optionality: outcomeRecord.events.outcome.optionality.achievedOptionality,
      simulation: this.calculateSimulationAccuracy(outcomeRecord),
    };

    const accuracy: RecommendationAccuracy = {
      recommendationId,
      outcomeRecordId,
      overallAccuracy: this.calculateOverallAccuracy(predicted, actual),
      dimensions: {
        fitAccuracy: {
          dimension: 'fit',
          predictedValue: predicted.fit,
          actualValue: actual.fit,
          absoluteError: Math.abs(predicted.fit - actual.fit),
          percentageError: Math.abs(predicted.fit - actual.fit) / predicted.fit * 100,
          accuracyScore: Math.max(0, 100 - Math.abs(predicted.fit - actual.fit)),
          isAccurate: Math.abs(predicted.fit - actual.fit) < 20,
        },
        utilityAccuracy: {
          dimension: 'utility',
          predictedValue: predicted.utility,
          actualValue: actual.utility,
          absoluteError: Math.abs(predicted.utility - actual.utility),
          percentageError: Math.abs(predicted.utility - actual.utility) / predicted.utility * 100,
          accuracyScore: Math.max(0, 100 - Math.abs(predicted.utility - actual.utility)),
          isAccurate: Math.abs(predicted.utility - actual.utility) < 20,
        },
        regretAccuracy: {
          dimension: 'regret',
          predictedValue: predicted.regret,
          actualValue: actual.regret,
          absoluteError: Math.abs(predicted.regret - actual.regret),
          percentageError: Math.abs(predicted.regret - actual.regret) / (predicted.regret || 1) * 100,
          accuracyScore: Math.max(0, 100 - Math.abs(predicted.regret - actual.regret)),
          isAccurate: Math.abs(predicted.regret - actual.regret) < 20,
        },
        optionalityAccuracy: {
          dimension: 'optionality',
          predictedValue: predicted.optionality,
          actualValue: actual.optionality,
          absoluteError: Math.abs(predicted.optionality - actual.optionality),
          percentageError: Math.abs(predicted.optionality - actual.optionality) / predicted.optionality * 100,
          accuracyScore: Math.max(0, 100 - Math.abs(predicted.optionality - actual.optionality)),
          isAccurate: Math.abs(predicted.optionality - actual.optionality) < 20,
        },
        simulationAccuracy: {
          dimension: 'simulation',
          predictedValue: predicted.simulation,
          actualValue: actual.simulation,
          absoluteError: Math.abs(predicted.simulation - actual.simulation),
          percentageError: Math.abs(predicted.simulation - actual.simulation) / predicted.simulation * 100,
          accuracyScore: Math.max(0, 100 - Math.abs(predicted.simulation - actual.simulation)),
          isAccurate: Math.abs(predicted.simulation - actual.simulation) < 20,
        },
      },
      classification: this.classifyAccuracy(this.calculateOverallAccuracy(predicted, actual)),
      calculatedAt: new Date(),
    };

    // Store accuracy record
    const accuracyKey = `${recommendationId}_${outcomeRecordId}`;
    this.accuracyRecords.set(accuracyKey, accuracy);

    return accuracy;
  }

  /**
   * Analyze quality for a set of recommendations.
   */
  async analyzeQuality(
    recommendationIds: RecommendationId[],
    options: QualityAnalysisOptions = {}
  ): Promise<RecommendationQualityAnalysis> {
    const analysisId = `quality_analysis_${Date.now()}`;

    // Get relevant accuracy records
    const relevantRecords = Array.from(this.accuracyRecords.values()).filter(
      r => recommendationIds.includes(r.recommendationId)
    );

    // Filter by options
    const filteredRecords = this.filterAccuracyRecords(relevantRecords, options);

    // Calculate overall metrics
    const overall = this.calculateOverallQualityMetrics(filteredRecords);

    // Calculate accuracy metrics
    const accuracy = this.calculateQualityAccuracyMetrics(filteredRecords);

    // Calculate utility metrics
    const utility = this.calculateQualityUtilityMetrics(filteredRecords);

    // Calculate regret metrics
    const regret = this.calculateQualityRegretMetrics(filteredRecords);

    // Calculate optionality metrics
    const optionality = this.calculateQualityOptionalityMetrics(filteredRecords);

    // Calculate simulation metrics
    const simulation = this.calculateQualitySimulationMetrics(filteredRecords);

    // Calculate per-type metrics
    const byType = await this.calculateTypeQualityMetrics(recommendationIds, options);

    // Calculate trends
    const trends = await this.calculateQualityTrends(recommendationIds);

    // Determine time range
    const timestamps = filteredRecords.map(r => r.calculatedAt);
    const timeRange = timestamps.length > 0
      ? {
          startDate: new Date(Math.min(...timestamps.map(t => t.getTime()))),
          endDate: new Date(Math.max(...timestamps.map(t => t.getTime()))),
        }
      : { startDate: new Date(), endDate: new Date() };

    return {
      analysisId,
      period: timeRange,
      recommendationCount: recommendationIds.length,
      outcomeCount: filteredRecords.length,
      overall,
      accuracy,
      utility,
      regret,
      optionality,
      simulation,
      byType,
      trends,
    };
  }

  /**
   * Generate a comprehensive quality report.
   */
  async generateReport(
    period: { startDate: Date; endDate: Date }
  ): Promise<RecommendationQualityReport> {
    const reportId = `quality_report_${Date.now()}`;

    // Get recommendations in period
    const recommendationIds = this.getRecommendationsInPeriod(period);

    // Perform analysis
    const analysis = await this.analyzeQuality(recommendationIds, {
      includeDetails: true,
    });

    // Get per-recommendation details
    const recommendationDetails = Array.from(this.accuracyRecords.values()).filter(
      r => r.calculatedAt >= period.startDate && r.calculatedAt <= period.endDate
    );

    // Identify issues
    const issues = await this.identifyIssues(analysis);

    // Find opportunities
    const opportunities = await this.findOpportunities(analysis);

    // Generate action items
    const actionItems = this.generateActionItems(issues, opportunities);

    // Create executive summary
    const executiveSummary = this.createExecutiveSummary(analysis);

    return {
      reportId,
      generatedAt: new Date(),
      period,
      executiveSummary,
      analysis,
      recommendationDetails,
      issues,
      opportunities,
      actionItems,
    };
  }

  /**
   * Get quality metrics for a specific recommendation type.
   */
  async getQualityByType(
    recommendationType: string,
    period?: { startDate: Date; endDate: Date }
  ): Promise<TypeQualityMetrics> {
    // Filter records by type
    // In production, would filter by actual recommendation type
    const relevantRecords = Array.from(this.accuracyRecords.values()).filter(r => {
      if (!period) return true;
      return r.calculatedAt >= period.startDate && r.calculatedAt <= period.endDate;
    });

    const accuracies = relevantRecords.map(r => r.overallAccuracy);
    const avgAccuracy = accuracies.length > 0
      ? accuracies.reduce((a, b) => a + b) / accuracies.length
      : 0;

    // Calculate success rate (accuracy > 75)
    const successRate = accuracies.filter(a => a >= 75).length / (accuracies.length || 1) * 100;

    // Calculate average satisfaction (from outcome records)
    const satisfactionScores = this.outcomeRecords
      .filter(r => {
        const recId = r.events.recommendation.recommendationId;
        return relevantRecords.some(acc => acc.recommendationId === recId);
      })
      .map(r => r.events.outcome.satisfaction.overallSatisfaction);

    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((a, b) => a + b) / satisfactionScores.length
      : 0;

    // Calculate average regret
    const regretScores = this.outcomeRecords
      .filter(r => {
        const recId = r.events.recommendation.recommendationId;
        return relevantRecords.some(acc => acc.recommendationId === recId);
      })
      .map(r => r.events.outcome.regret.regretLevel);

    const avgRegret = regretScores.length > 0
      ? regretScores.reduce((a, b) => a + b) / regretScores.length
      : 0;

    return {
      type: recommendationType,
      count: relevantRecords.length,
      averageAccuracy: avgAccuracy,
      successRate,
      averageSatisfaction: avgSatisfaction,
      averageRegret: avgRegret,
      qualityScore: (avgAccuracy + successRate + avgSatisfaction / 100 * 100 - avgRegret / 100 * 20) / 3,
    };
  }

  /**
   * Track quality trends over time.
   */
  async trackTrends(
    periods: Array<{ startDate: Date; endDate: Date }>
  ): Promise<QualityTrend[]> {
    const trends: QualityTrend[] = [];

    for (const period of periods) {
      const records = Array.from(this.accuracyRecords.values()).filter(
        r => r.calculatedAt >= period.startDate && r.calculatedAt <= period.endDate
      );

      const accuracies = records.map(r => r.overallAccuracy);
      const avgAccuracy = accuracies.length > 0
        ? accuracies.reduce((a, b) => a + b) / accuracies.length
        : 0;

      const successRate = accuracies.filter(a => a >= 75).length / (accuracies.length || 1) * 100;

      const satisfactionScores = this.outcomeRecords
        .filter(r => {
          const recId = r.events.recommendation.recommendationId;
          return records.some(acc => acc.recommendationId === recId);
        })
        .map(r => r.events.outcome.satisfaction.overallSatisfaction);

      const avgSatisfaction = satisfactionScores.length > 0
        ? satisfactionScores.reduce((a, b) => a + b) / satisfactionScores.length
        : 0;

      trends.push({
        period: `${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`,
        startDate: period.startDate,
        averageAccuracy: avgAccuracy,
        successRate,
        averageSatisfaction: avgSatisfaction,
        changes: [], // Would be calculated by comparing to previous period
        significantEvents: [],
      });
    }

    return trends;
  }

  /**
   * Identify quality issues.
   */
  async identifyIssues(analysis: RecommendationQualityAnalysis): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];

    // Check overall accuracy
    if (analysis.overall.averageAccuracy < 70) {
      issues.push({
        issueId: `issue_accuracy_${Date.now()}`,
        severity: 'HIGH',
        category: 'FIT_PREDICTION',
        title: 'Low Overall Accuracy',
        description: `Overall accuracy of ${analysis.overall.averageAccuracy.toFixed(1)}% is below target of 75%`,
        affectedRecommendations: analysis.recommendationCount,
        impactOnQuality: 75 - analysis.overall.averageAccuracy,
        rootCause: 'Prediction models may be misaligned with actual outcomes',
        recommendedFix: 'Review and retrain prediction models with recent outcome data',
        estimatedEffort: 'LARGE',
      });
    }

    // Check utility prediction
    if (analysis.utility.utilityPredictionAccuracy < 60) {
      issues.push({
        issueId: `issue_utility_${Date.now()}`,
        severity: 'HIGH',
        category: 'UTILITY_PREDICTION',
        title: 'Poor Utility Prediction Accuracy',
        description: `Utility prediction accuracy of ${analysis.utility.utilityPredictionAccuracy.toFixed(1)}% indicates systematic misalignment`,
        affectedRecommendations: Math.floor(analysis.recommendationCount * 0.7),
        impactOnQuality: 20,
        rootCause: 'Utility model may not capture all relevant factors',
        recommendedFix: 'Expand utility model features and retrain',
        estimatedEffort: 'MEDIUM',
      });
    }

    // Check regret prediction
    if (analysis.regret.regretPredictionAccuracy < 50) {
      issues.push({
        issueId: `issue_regret_${Date.now()}`,
        severity: 'MEDIUM',
        category: 'REGRET_PREDICTION',
        title: 'Low Regret Prediction Accuracy',
        description: `Regret prediction accuracy of ${analysis.regret.regretPredictionAccuracy.toFixed(1)}% suggests model needs improvement`,
        affectedRecommendations: Math.floor(analysis.recommendationCount * 0.5),
        impactOnQuality: 15,
        rootCause: 'Regret factors may not be fully captured',
        recommendedFix: 'Collect more detailed regret feedback and update model',
        estimatedEffort: 'MEDIUM',
      });
    }

    // Check simulation accuracy
    if (analysis.simulation.simulationAccuracyScore < 65) {
      issues.push({
        issueId: `issue_simulation_${Date.now()}`,
        severity: 'MEDIUM',
        category: 'MODEL_PERFORMANCE',
        title: 'Simulation Accuracy Below Target',
        description: `Simulation accuracy of ${analysis.simulation.simulationAccuracyScore.toFixed(1)}% is below target of 70%`,
        affectedRecommendations: Math.floor(analysis.recommendationCount * 0.6),
        impactOnQuality: 10,
        rootCause: 'Career path simulations may not reflect real-world outcomes',
        recommendedFix: 'Calibrate simulation parameters with outcome data',
        estimatedEffort: 'MEDIUM',
      });
    }

    // Check for declining trend
    if (analysis.overall.trend === 'DECLINING') {
      issues.push({
        issueId: `issue_trend_${Date.now()}`,
        severity: 'CRITICAL',
        category: 'MODEL_PERFORMANCE',
        title: 'Declining Quality Trend',
        description: 'Recommendation quality is declining over time',
        affectedRecommendations: analysis.recommendationCount,
        impactOnQuality: 25,
        rootCause: 'Models may be becoming outdated or data drift occurring',
        recommendedFix: 'Urgent model review and retraining required',
        estimatedEffort: 'LARGE',
      });
    }

    return issues;
  }

  /**
   * Find improvement opportunities.
   */
  async findOpportunities(analysis: RecommendationQualityAnalysis): Promise<QualityOpportunity[]> {
    const opportunities: QualityOpportunity[] = [];

    // Identify dimensions with improvement potential
    const dimensions = [
      { name: 'Utility', score: analysis.utility.utilityPredictionAccuracy, threshold: 80 },
      { name: 'Regret', score: analysis.regret.regretPredictionAccuracy, threshold: 75 },
      { name: 'Optionality', score: analysis.optionality.optionalityPredictionAccuracy, threshold: 75 },
      { name: 'Simulation', score: analysis.simulation.simulationAccuracyScore, threshold: 80 },
    ];

    for (const dim of dimensions) {
      if (dim.score < dim.threshold) {
        const potentialImpact = dim.threshold - dim.score;

        opportunities.push({
          opportunityId: `opp_${dim.name.toLowerCase()}_${Date.now()}`,
          title: `Improve ${dim.name} Prediction Accuracy`,
          description: `Current ${dim.name.toLowerCase()} prediction accuracy is ${dim.score.toFixed(1)}%, target is ${dim.threshold}%`,
          potentialImpact,
          effort: potentialImpact > 20 ? 'LARGE' : 'MEDIUM',
          priority: potentialImpact > 20 ? 'HIGH' : 'MEDIUM',
          implementationApproach: `Collect additional ${dim.name.toLowerCase()}-related features and retrain model`,
          successCriteria: [
            `${dim.name} accuracy reaches ${dim.threshold}%`,
            'Statistical significance confirmed',
            'No degradation in other dimensions',
          ],
        });
      }
    }

    // Opportunity for high-performing types
    const highPerformingTypes = Object.entries(analysis.byType)
      .filter(([, metrics]) => metrics.qualityScore > 80)
      .map(([type]) => type);

    if (highPerformingTypes.length > 0) {
      opportunities.push({
        opportunityId: `opp_leverage_${Date.now()}`,
        title: 'Leverage High-Performing Recommendation Types',
        description: `Types ${highPerformingTypes.join(', ')} show quality scores above 80`,
        potentialImpact: 10,
        effort: 'SMALL',
        priority: 'HIGH',
        implementationApproach: 'Increase weight of high-performing types in recommendation ranking',
        successCriteria: [
          'Overall quality score increases by 5+ points',
          'No significant negative impact on diversity',
        ],
      });
    }

    return opportunities;
  }

  /**
   * Update with a new outcome record.
   */
  async updateWithOutcome(record: OutcomeRecord): Promise<void> {
    this.outcomeRecords.push(record);

    // Trigger accuracy calculation if we have the original recommendation
    // In production, would fetch recommendation and calculate accuracy
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private calculateOverallAccuracy(
    predicted: Record<string, number>,
    actual: Record<string, number>
  ): number {
    const errors = Object.keys(predicted).map(key =>
      Math.abs(predicted[key] - actual[key])
    );
    const avgError = errors.reduce((a, b) => a + b) / errors.length;
    return Math.max(0, 100 - avgError);
  }

  private classifyAccuracy(accuracy: number): RecommendationAccuracy['classification'] {
    if (accuracy >= 90) return 'EXCELLENT';
    if (accuracy >= 75) return 'GOOD';
    if (accuracy >= 60) return 'ACCEPTABLE';
    if (accuracy >= 40) return 'POOR';
    return 'UNRELIABLE';
  }

  private calculateSimulationAccuracy(outcomeRecord: OutcomeRecord): number {
    // Calculate simulation accuracy based on timeline and milestone predictions
    const timelineAccuracy = outcomeRecord.events.outcome.timeline.onTime ? 80 : 50;
    const milestoneAccuracy = Math.min(100,
      outcomeRecord.events.action.milestonesCompleted.length * 20
    );

    return (timelineAccuracy + milestoneAccuracy) / 2;
  }

  private filterAccuracyRecords(
    records: RecommendationAccuracy[],
    options: QualityAnalysisOptions
  ): RecommendationAccuracy[] {
    return records.filter(r => {
      if (options.minConfidence && r.overallAccuracy < options.minConfidence) {
        return false;
      }
      return true;
    });
  }

  private calculateOverallQualityMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['overall'] {
    if (records.length === 0) {
      return {
        averageAccuracy: 0,
        medianAccuracy: 0,
        accuracyStdDev: 0,
        accuracyRate: 0,
        qualityScore: 0,
        trend: 'STABLE',
        yearOverYearImprovement: 0,
      };
    }

    const accuracies = records.map(r => r.overallAccuracy);
    const avgAccuracy = accuracies.reduce((a, b) => a + b) / accuracies.length;

    // Calculate median
    const sorted = [...accuracies].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    // Calculate standard deviation
    const variance = accuracies.reduce((sum, a) => sum + Math.pow(a - avgAccuracy, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);

    // Accuracy rate (>75%)
    const accuracyRate = accuracies.filter(a => a >= 75).length / accuracies.length * 100;

    // Quality score (composite)
    const qualityScore = (avgAccuracy + accuracyRate) / 2;

    return {
      averageAccuracy: avgAccuracy,
      medianAccuracy: median,
      accuracyStdDev: stdDev,
      accuracyRate,
      qualityScore,
      trend: 'STABLE', // Would be calculated from historical data
      yearOverYearImprovement: 0, // Would be calculated from year-over-year comparison
    };
  }

  private calculateQualityAccuracyMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['accuracy'] {
    if (records.length === 0) {
      return {
        recommendationAccuracyRate: 0,
        meanAbsoluteError: 0,
        rootMeanSquaredError: 0,
        predictionBias: 0,
        accuracyByRank: [],
        accuracyByType: {},
      };
    }

    const errors = records.map(r =>
      Object.values(r.dimensions).reduce((sum, d) => sum + d.absoluteError, 0) / 5
    );

    const meanAbsoluteError = errors.reduce((a, b) => a + b) / errors.length;
    const rootMeanSquaredError = Math.sqrt(
      errors.reduce((sum, e) => sum + e * e, 0) / errors.length
    );

    // Calculate bias (positive = overestimate)
    const bias = records.map(r =>
      Object.values(r.dimensions).reduce((sum, d) => sum + (d.predictedValue - d.actualValue), 0) / 5
    ).reduce((a, b) => a + b) / records.length;

    return {
      recommendationAccuracyRate: records.filter(r => r.overallAccuracy >= 75).length / records.length * 100,
      meanAbsoluteError,
      rootMeanSquaredError,
      predictionBias: bias,
      accuracyByRank: [], // Would be calculated with rank data
      accuracyByType: {}, // Would be calculated with type data
    };
  }

  private calculateQualityUtilityMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['utility'] {
    const utilityAccuracies = records.map(r => r.dimensions.utilityAccuracy.accuracyScore);
    const avgUtilityAccuracy = utilityAccuracies.length > 0
      ? utilityAccuracies.reduce((a, b) => a + b) / utilityAccuracies.length
      : 0;

    // Calculate correlation (simplified)
    const correlation = avgUtilityAccuracy / 100;

    // Calculate achievement rate
    const achievementRate = records.filter(r => r.dimensions.utilityAccuracy.isAccurate).length / records.length * 100;

    // Calculate average delta
    const avgDelta = records.reduce((sum, r) =>
      sum + (r.dimensions.utilityAccuracy.predictedValue - r.dimensions.utilityAccuracy.actualValue),
      0
    ) / records.length;

    return {
      utilityPredictionAccuracy: avgUtilityAccuracy,
      predictedActualCorrelation: correlation,
      utilityAchievementRate: achievementRate,
      averageUtilityDelta: avgDelta,
      utilityBias: avgDelta > 5 ? 'OVERESTIMATE' : avgDelta < -5 ? 'UNDERESTIMATE' : 'UNBIASED',
    };
  }

  private calculateQualityRegretMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['regret'] {
    const regretAccuracies = records.map(r => r.dimensions.regretAccuracy.accuracyScore);
    const avgRegretAccuracy = regretAccuracies.length > 0
      ? regretAccuracies.reduce((a, b) => a + b) / regretAccuracies.length
      : 0;

    const predictionRate = records.filter(r => r.dimensions.regretAccuracy.isAccurate).length / records.length * 100;

    const avgError = records.reduce((sum, r) =>
      sum + r.dimensions.regretAccuracy.absoluteError,
      0
    ) / records.length;

    const bias = records.reduce((sum, r) =>
      sum + (r.dimensions.regretAccuracy.predictedValue - r.dimensions.regretAccuracy.actualValue),
      0
    ) / records.length;

    // High unexpected regret (predicted low, actual high)
    const highUnexpectedRegret = records.filter(r =>
      r.dimensions.regretAccuracy.predictedValue < 30 &&
      r.dimensions.regretAccuracy.actualValue > 60
    ).length / records.length * 100;

    return {
      regretPredictionAccuracy: avgRegretAccuracy,
      regretPredictionRate: predictionRate,
      averageRegretError: avgError,
      regretBias: bias,
      highUnexpectedRegretRate: highUnexpectedRegret,
    };
  }

  private calculateQualityOptionalityMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['optionality'] {
    const optionalityAccuracies = records.map(r => r.dimensions.optionalityAccuracy.accuracyScore);
    const avgOptionalityAccuracy = optionalityAccuracies.length > 0
      ? optionalityAccuracies.reduce((a, b) => a + b) / optionalityAccuracies.length
      : 0;

    // Preservation rate (simplified)
    const preservationRate = records.filter(r => r.dimensions.optionalityAccuracy.isAccurate).length / records.length * 100;

    const avgDelta = records.reduce((sum, r) =>
      sum + (r.dimensions.optionalityAccuracy.predictedValue - r.dimensions.optionalityAccuracy.actualValue),
      0
    ) / records.length;

    return {
      optionalityPredictionAccuracy: avgOptionalityAccuracy,
      optionalityPreservationRate: preservationRate,
      newOptionsAccuracy: avgOptionalityAccuracy, // Simplified
      mobilityPredictionAccuracy: avgOptionalityAccuracy, // Simplified
      averageOptionalityDelta: avgDelta,
    };
  }

  private calculateQualitySimulationMetrics(
    records: RecommendationAccuracy[]
  ): RecommendationQualityAnalysis['simulation'] {
    const simulationAccuracies = records.map(r => r.dimensions.simulationAccuracy.accuracyScore);
    const avgSimulationAccuracy = simulationAccuracies.length > 0
      ? simulationAccuracies.reduce((a, b) => a + b) / simulationAccuracies.length
      : 0;

    return {
      simulationAccuracyScore: avgSimulationAccuracy,
      timelineAccuracy: avgSimulationAccuracy, // Simplified
      pathPredictionAccuracy: avgSimulationAccuracy * 0.9, // Slightly lower
      milestonePredictionAccuracy: avgSimulationAccuracy * 0.95,
      realismScore: avgSimulationAccuracy,
    };
  }

  private async calculateTypeQualityMetrics(
    recommendationIds: RecommendationId[],
    options: QualityAnalysisOptions
  ): Promise<Record<string, TypeQualityMetrics>> {
    // In production, would group by actual recommendation types
    // For now, return empty or default
    return {};
  }

  private async calculateQualityTrends(
    recommendationIds: RecommendationId[]
  ): Promise<QualityTrend[]> {
    // In production, would calculate from historical data
    return [];
  }

  private getRecommendationsInPeriod(
    period: { startDate: Date; endDate: Date }
  ): RecommendationId[] {
    const ids = new Set<RecommendationId>();

    for (const [, record] of Array.from(this.accuracyRecords.entries())) {
      if (record.calculatedAt >= period.startDate && record.calculatedAt <= period.endDate) {
        ids.add(record.recommendationId);
      }
    }

    return Array.from(ids);
  }

  private generateActionItems(
    issues: QualityIssue[],
    opportunities: QualityOpportunity[]
  ): RecommendationQualityReport['actionItems'] {
    const actionItems: RecommendationQualityReport['actionItems'] = [];

    // Create action items from critical and high issues
    for (const issue of issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) {
      actionItems.push({
        actionId: `action_${issue.issueId}`,
        description: issue.recommendedFix,
        relatedTo: issue.title,
        priority: issue.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: 'PENDING',
        expectedImpact: `Resolve ${issue.title.toLowerCase()} and improve quality score by ${issue.impactOnQuality.toFixed(0)} points`,
      });
    }

    // Create action items from high-priority opportunities
    for (const opp of opportunities.filter(o => o.priority === 'HIGH')) {
      actionItems.push({
        actionId: `action_${opp.opportunityId}`,
        description: opp.implementationApproach,
        relatedTo: opp.title,
        priority: 'HIGH',
        status: 'PENDING',
        expectedImpact: `Improve ${opp.title.toLowerCase()} by ${opp.potentialImpact.toFixed(0)} points`,
      });
    }

    return actionItems;
  }

  private createExecutiveSummary(
    analysis: RecommendationQualityAnalysis
  ): RecommendationQualityReport['executiveSummary'] {
    const overallGrade: RecommendationQualityReport['executiveSummary']['overallGrade'] =
      analysis.overall.qualityScore >= 90 ? 'A' :
      analysis.overall.qualityScore >= 80 ? 'B' :
      analysis.overall.qualityScore >= 70 ? 'C' :
      analysis.overall.qualityScore >= 60 ? 'D' : 'F';

    const keyFindings: string[] = [
      `Overall quality score: ${analysis.overall.qualityScore.toFixed(1)}/100 (Grade: ${overallGrade})`,
      `Average accuracy: ${analysis.overall.averageAccuracy.toFixed(1)}%`,
      `Accuracy rate (≥75%): ${analysis.overall.accuracyRate.toFixed(1)}%`,
      `Trend: ${analysis.overall.trend}`,
    ];

    const criticalIssues: string[] = [];
    const positiveHighlights: string[] = [];

    if (analysis.overall.averageAccuracy < 70) {
      criticalIssues.push('Average accuracy below 70% target');
    }
    if (analysis.utility.utilityPredictionAccuracy < 60) {
      criticalIssues.push('Utility prediction accuracy below 60%');
    }

    if (analysis.overall.averageAccuracy >= 80) {
      positiveHighlights.push('Strong overall accuracy performance');
    }
    if (analysis.overall.trend === 'IMPROVING') {
      positiveHighlights.push('Quality trend is improving');
    }

    const improvementRecommendations = [
      'Focus on improving utility prediction accuracy',
      'Review and retrain models with recent outcome data',
      'Collect more detailed feedback on prediction accuracy',
    ];

    return {
      overallGrade,
      trend: analysis.overall.trend,
      keyFindings,
      criticalIssues,
      positiveHighlights,
      yearOverYear: {
        previousPeriodAccuracy: analysis.overall.averageAccuracy - analysis.overall.yearOverYearImprovement,
        currentPeriodAccuracy: analysis.overall.averageAccuracy,
        change: analysis.overall.yearOverYearImprovement,
        changePercentage: analysis.overall.yearOverYearImprovement / (analysis.overall.averageAccuracy - analysis.overall.yearOverYearImprovement || 1) * 100,
      },
      improvementRecommendations,
    };
  }
}
