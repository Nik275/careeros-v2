/**
 * CareerOS Market Intelligence - Career Trend Engine
 *
 * Analyzes trends for specific careers.
 *
 * Tracks:
 * - Career demand trends
 * - Career salary trends
 * - Career growth trends
 * - Career opportunity trends
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { TrendAnalysis } from './models/TrendAnalysis';
import type { CareerMarketProfile } from '../profile/models/CareerMarketProfile';
import { TrendClassification } from './models/TrendClassification';

/**
 * Career trend configuration.
 */
export interface CareerTrendConfig {
  /** Analysis period (days) */
  analysisPeriod: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Metrics to track */
  trackedMetrics: ('demand' | 'salary' | 'growth' | 'opportunity')[];
}

/**
 * Default configuration.
 */
export const DEFAULT_CAREER_TREND_CONFIG: CareerTrendConfig = {
  analysisPeriod: 180,
  minDataPoints: 10,
  trackedMetrics: ['demand', 'salary', 'growth', 'opportunity'],
};

/**
 * Career trend analysis result.
 */
export interface CareerTrendAnalysis {
  /** Career identifier */
  careerId: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Overall trend classification */
  overallTrend: TrendClassification;

  /** Individual metric analyses */
  metrics: {
    demand?: TrendAnalysis;
    salary?: TrendAnalysis;
    growth?: TrendAnalysis;
    opportunity?: TrendAnalysis;
  };

  /** Composite scores */
  scores: {
    momentum: number;
    acceleration: number;
    persistence: number;
    confidence: number;
  };

  /** Key insights */
  insights: string[];

  /** Risk flags */
  riskFlags: string[];

  /** Recommendations */
  recommendations: string[];
}

/**
 * Career trend comparison.
 */
export interface CareerTrendComparison {
  /** Base career ID */
  baseCareerId: string;

  /** Comparison career ID */
  comparisonCareerId: string;

  /** Metric comparisons */
  comparisons: {
    metric: string;
    baseScore: number;
    comparisonScore: number;
    winner: 'base' | 'comparison' | 'tie';
    difference: number;
  }[];

  /** Overall trend comparison */
  overall: {
    baseTrend: TrendClassification;
    comparisonTrend: TrendClassification;
    winner: 'base' | 'comparison' | 'tie';
  };

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Analyzes career-specific trends.
 */
export class CareerTrendEngine {
  private config: CareerTrendConfig;

  constructor(config?: Partial<CareerTrendConfig>) {
    this.config = { ...DEFAULT_CAREER_TREND_CONFIG, ...config };
  }

  /**
   * Analyze trends for a specific career.
   */
  analyzeCareer(
    snapshots: TrendSnapshot[],
    careerId: string
  ): CareerTrendAnalysis | null {
    // Filter to career
    const careerSnapshots = snapshots.filter((s) => s.entityId === careerId);

    if (careerSnapshots.length < this.config.minDataPoints) {
      return null;
    }

    const metrics: CareerTrendAnalysis['metrics'] = {};

    // Analyze each metric
    for (const metricType of this.config.trackedMetrics) {
      const metricSnapshots = careerSnapshots.filter((s) => s.metricType === metricType);
      if (metricSnapshots.length >= this.config.minDataPoints) {
        metrics[metricType] = this.analyzeMetric(metricSnapshots, careerId, metricType);
      }
    }

    // Calculate composite scores
    const scores = this.calculateCompositeScores(metrics);

    // Determine overall trend
    const overallTrend = this.determineOverallTrend(metrics);

    // Generate insights
    const insights = this.generateInsights(metrics, overallTrend);

    // Identify risk flags
    const riskFlags = this.identifyRiskFlags(metrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, riskFlags);

    return {
      careerId,
      analyzedAt: new Date(),
      overallTrend,
      metrics,
      scores,
      insights,
      riskFlags,
      recommendations,
    };
  }

  /**
   * Analyze trends for multiple careers.
   */
  analyzeCareers(
    snapshots: TrendSnapshot[],
    careerIds: string[]
  ): Map<string, CareerTrendAnalysis | null> {
    const results = new Map<string, CareerTrendAnalysis | null>();

    for (const careerId of careerIds) {
      const analysis = this.analyzeCareer(snapshots, careerId);
      results.set(careerId, analysis);
    }

    return results;
  }

  /**
   * Compare trends between two careers.
   */
  compareCareers(
    snapshots: TrendSnapshot[],
    baseCareerId: string,
    comparisonCareerId: string
  ): CareerTrendComparison | null {
    const baseAnalysis = this.analyzeCareer(snapshots, baseCareerId);
    const comparisonAnalysis = this.analyzeCareer(snapshots, comparisonCareerId);

    if (!baseAnalysis || !comparisonAnalysis) return null;

    const comparisons: CareerTrendComparison['comparisons'] = [];

    for (const metric of this.config.trackedMetrics) {
      const baseMetric = baseAnalysis.metrics[metric];
      const comparisonMetric = comparisonAnalysis.metrics[metric];

      if (baseMetric && comparisonMetric) {
        const baseScore = baseMetric.strength;
        const comparisonScore = comparisonMetric.strength;
        const difference = comparisonScore - baseScore;

        let winner: 'base' | 'comparison' | 'tie';
        if (Math.abs(difference) < 10) {
          winner = 'tie';
        } else {
          winner = difference > 0 ? 'comparison' : 'base';
        }

        comparisons.push({
          metric,
          baseScore,
          comparisonScore,
          winner,
          difference: Math.round(difference),
        });
      }
    }

    // Determine overall winner
    const baseWins = comparisons.filter((c) => c.winner === 'base').length;
    const comparisonWins = comparisons.filter((c) => c.winner === 'comparison').length;

    let overallWinner: 'base' | 'comparison' | 'tie';
    if (baseWins > comparisonWins) overallWinner = 'base';
    else if (comparisonWins > baseWins) overallWinner = 'comparison';
    else overallWinner = 'tie';

    return {
      baseCareerId,
      comparisonCareerId,
      comparisons,
      overall: {
        baseTrend: baseAnalysis.overallTrend,
        comparisonTrend: comparisonAnalysis.overallTrend,
        winner: overallWinner,
      },
      analyzedAt: new Date(),
    };
  }

  /**
   * Rank careers by trend strength.
   */
  rankCareers(
    snapshots: TrendSnapshot[],
    careerIds: string[],
    metric: 'demand' | 'salary' | 'growth' | 'opportunity' = 'opportunity'
  ): Array<{
    careerId: string;
    trendStrength: number;
    classification: TrendClassification;
    rank: number;
  }> {
    const results: Array<{
      careerId: string;
      trendStrength: number;
      classification: TrendClassification;
    }> = [];

    for (const careerId of careerIds) {
      const analysis = this.analyzeCareer(snapshots, careerId);
      if (analysis && analysis.metrics[metric]) {
        results.push({
          careerId,
          trendStrength: analysis.metrics[metric]!.strength,
          classification: analysis.metrics[metric]!.classification,
        });
      }
    }

    // Sort by trend strength descending
    results.sort((a, b) => b.trendStrength - a.trendStrength);

    return results.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * Identify rising careers.
   */
  identifyRisingCareers(
    snapshots: TrendSnapshot[],
    careerIds: string[],
    threshold: number = 60
  ): string[] {
    const rising: string[] = [];

    for (const careerId of careerIds) {
      const analysis = this.analyzeCareer(snapshots, careerId);
      if (analysis && analysis.overallTrend === 'RAPID_GROWTH' || analysis?.overallTrend === 'GROWTH') {
        if (analysis.scores.momentum >= threshold) {
          rising.push(careerId);
        }
      }
    }

    return rising;
  }

  /**
   * Identify declining careers.
   */
  identifyDecliningCareers(
    snapshots: TrendSnapshot[],
    careerIds: string[],
    threshold: number = 60
  ): string[] {
    const declining: string[] = [];

    for (const careerId of careerIds) {
      const analysis = this.analyzeCareer(snapshots, careerId);
      if (analysis && (analysis.overallTrend === 'RAPID_DECLINE' || analysis.overallTrend === 'DECLINING')) {
        if (analysis.scores.momentum <= 100 - threshold) {
          declining.push(careerId);
        }
      }
    }

    return declining;
  }

  /**
   * Track career from profile history.
   */
  trackCareerFromProfiles(
    profiles: CareerMarketProfile[]
  ): CareerTrendAnalysis | null {
    if (profiles.length < this.config.minDataPoints) return null;

    // Sort by date
    const sorted = [...profiles].sort(
      (a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime()
    );

    // Create snapshots from profiles
    const snapshots: TrendSnapshot[] = [];

    for (const profile of sorted) {
      snapshots.push({
        id: `snapshot-${profile.careerId}-demand-${profile.lastUpdated.getTime()}`,
        entityId: profile.careerId,
        entityType: 'career',
        metricType: 'demand',
        timestamp: profile.lastUpdated,
        value: profile.demandScore,
        dataPoints: profile.signalCount,
        sources: [],
        confidence: profile.confidence,
        frequency: 'daily',
      });

      snapshots.push({
        id: `snapshot-${profile.careerId}-opportunity-${profile.lastUpdated.getTime()}`,
        entityId: profile.careerId,
        entityType: 'career',
        metricType: 'opportunity',
        timestamp: profile.lastUpdated,
        value: profile.opportunityScore,
        dataPoints: profile.signalCount,
        sources: [],
        confidence: profile.confidence,
        frequency: 'daily',
      });
    }

    return this.analyzeCareer(snapshots, sorted[0].careerId);
  }

  /**
   * Analyze a single metric.
   */
  private analyzeMetric(
    snapshots: TrendSnapshot[],
    careerId: string,
    metricType: string
  ): TrendAnalysis {
    // Sort by timestamp
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const start = sorted[0];
    const end = sorted[sorted.length - 1];

    // Calculate change
    const change = ((end.value - start.value) / start.value) * 100;

    // Calculate volatility
    const values = sorted.map((s) => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    // Classification
    const classification = this.classifyTrend(change, volatility);

    // Calculate momentum (simplified)
    const momentum = Math.min(100, Math.abs(change) * 2);

    // Calculate acceleration (simplified)
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    const firstAvg = firstHalf.reduce((sum, s) => sum + s.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.value, 0) / secondHalf.length;
    const acceleration = (secondAvg - firstAvg) * 2;

    // Calculate persistence
    const duration =
      (end.timestamp.getTime() - start.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const consistency = 100 - (volatility / mean) * 100;
    const persistence = Math.min(100, (duration / 90) * 50 + (consistency / 100) * 50);

    return {
      entityId: careerId,
      entityType: 'career',
      metricType,
      classification,
      momentum: Math.round(momentum),
      acceleration: Math.round(acceleration),
      persistence: Math.round(persistence),
      confidence: Math.round(
        sorted.reduce((sum, s) => sum + s.confidence, 0) / sorted.length
      ),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      strength: Math.round(Math.abs(change)),
      rateOfChange: Math.round(change * 10) / 10,
      volatility: Math.round(volatility),
      dataPoints: sorted.length,
      periodDays: Math.round(duration),
      startValue: start.value,
      currentValue: end.value,
      peakValue: Math.max(...values),
      troughValue: Math.min(...values),
      analyzedAt: new Date(),
      explanation: [`${metricType} ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%`],
      insights: this.generateMetricInsights(classification, momentum, persistence),
      riskFlags: this.identifyMetricRiskFlags(classification, volatility),
      evidence: sorted.slice(-3).map((s) => ({
        type: 'snapshot',
        value: s.value.toString(),
        confidence: s.confidence,
      })),
    };
  }

  /**
   * Classify trend.
   */
  private classifyTrend(change: number, volatility: number): TrendClassification {
    if (volatility > 25) return TrendClassification.VOLATILE;
    if (change >= 30) return TrendClassification.RAPID_GROWTH;
    if (change >= 10) return TrendClassification.GROWTH;
    if (change <= -30) return TrendClassification.RAPID_DECLINE;
    if (change <= -10) return TrendClassification.DECLINING;
    return TrendClassification.STABLE;
  }

  /**
   * Calculate composite scores.
   */
  private calculateCompositeScores(
    metrics: CareerTrendAnalysis['metrics']
  ): CareerTrendAnalysis['scores'] {
    const analyses = Object.values(metrics).filter(Boolean) as TrendAnalysis[];

    if (analyses.length === 0) {
      return {
        momentum: 0,
        acceleration: 0,
        persistence: 0,
        confidence: 0,
      };
    }

    return {
      momentum: Math.round(
        analyses.reduce((sum, a) => sum + a.momentum, 0) / analyses.length
      ),
      acceleration: Math.round(
        analyses.reduce((sum, a) => sum + a.acceleration, 0) / analyses.length
      ),
      persistence: Math.round(
        analyses.reduce((sum, a) => sum + a.persistence, 0) / analyses.length
      ),
      confidence: Math.round(
        analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
      ),
    };
  }

  /**
   * Determine overall trend.
   */
  private determineOverallTrend(
    metrics: CareerTrendAnalysis['metrics']
  ): TrendClassification {
    const analyses = Object.values(metrics).filter(Boolean) as TrendAnalysis[];

    if (analyses.length === 0) return TrendClassification.EMERGING;

    // Count classifications
    const counts: Record<string, number> = {};
    for (const a of analyses) {
      counts[a.classification] = (counts[a.classification] ?? 0) + 1;
    }

    // Find most common
    let maxCount = 0;
    let mostCommon = TrendClassification.STABLE;

    for (const [classification, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = classification as TrendClassification;
      }
    }

    return mostCommon;
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    metrics: CareerTrendAnalysis['metrics'],
    overallTrend: TrendClassification
  ): string[] {
    const insights: string[] = [];

    // Overall trend insight
    insights.push(`Career showing ${overallTrend.toLowerCase().replace(/_/g, ' ')}`);

    // Metric-specific insights
    if (metrics.demand?.classification === 'RAPID_GROWTH') {
      insights.push('Exceptional demand growth');
    }

    if (metrics.salary?.classification === 'GROWTH') {
      insights.push('Salary growth outpacing market');
    }

    if (metrics.growth?.momentum && metrics.growth.momentum >= 70) {
      insights.push('High growth momentum');
    }

    if (metrics.opportunity?.persistence && metrics.opportunity.persistence >= 70) {
      insights.push('Opportunity appears durable');
    }

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(metrics: CareerTrendAnalysis['metrics']): string[] {
    const flags: string[] = [];

    if (metrics.demand?.classification === 'RAPID_DECLINE') {
      flags.push('demand-decline');
    }

    if (metrics.growth?.classification === 'DECLINING') {
      flags.push('growth-deceleration');
    }

    return flags;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(
    metrics: CareerTrendAnalysis['metrics'],
    riskFlags: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.demand?.classification === 'RAPID_GROWTH') {
      recommendations.push('Enter market quickly');
    }

    if (riskFlags.includes('demand-decline')) {
      recommendations.push('Consider adjacent career paths');
    }

    if (metrics.opportunity?.persistence && metrics.opportunity.persistence < 40) {
      recommendations.push('Monitor for trend sustainability');
    }

    return recommendations;
  }

  /**
   * Generate metric insights.
   */
  private generateMetricInsights(
    classification: TrendClassification,
    momentum: number,
    persistence: number
  ): string[] {
    const insights: string[] = [];

    if (classification === 'RAPID_GROWTH') {
      insights.push('Rapid expansion observed');
    }

    if (momentum >= 80) {
      insights.push('Very high momentum');
    }

    if (persistence >= 70) {
      insights.push('Trend appears durable');
    }

    return insights;
  }

  /**
   * Identify metric risk flags.
   */
  private identifyMetricRiskFlags(
    classification: TrendClassification,
    volatility: number
  ): string[] {
    const flags: string[] = [];

    if (classification === 'RAPID_DECLINE') {
      flags.push('rapid-decline');
    }

    if (volatility > 25) {
      flags.push('high-volatility');
    }

    return flags;
  }
}

/**
 * Factory function for CareerTrendEngine.
 */
export function createCareerTrendEngine(
  config?: Partial<CareerTrendConfig>
): CareerTrendEngine {
  return new CareerTrendEngine(config);
}
