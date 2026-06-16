/**
 * CareerOS Market Intelligence - Region Trend Engine
 *
 * Analyzes trends for specific regions.
 *
 * Tracks:
 * - City demand
 * - Regional growth
 * - Remote opportunity growth
 * - Startup ecosystem growth
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { TrendAnalysis } from './models/TrendAnalysis';
import { TrendClassification } from './models/TrendClassification';

/**
 * Region trend configuration.
 */
export interface RegionTrendConfig {
  /** Analysis period (days) */
  analysisPeriod: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Metrics to track */
  trackedMetrics: ('demand' | 'growth' | 'remote_opportunity' | 'startup_activity')[];
}

/**
 * Default configuration.
 */
export const DEFAULT_REGION_TREND_CONFIG: RegionTrendConfig = {
  analysisPeriod: 180,
  minDataPoints: 10,
  trackedMetrics: ['demand', 'growth', 'remote_opportunity', 'startup_activity'],
};

/**
 * Region trend analysis result.
 */
export interface RegionTrendAnalysis {
  /** Region identifier */
  regionId: string;

  /** Region name */
  regionName: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Overall trend classification */
  overallTrend: TrendClassification;

  /** Individual metric analyses */
  metrics: {
    demand?: {
      classification: TrendClassification;
      level: number;
      growth: number;
    };
    growth?: {
      classification: TrendClassification;
      rate: number;
      momentum: number;
    };
    remote_opportunity?: {
      classification: TrendClassification;
      level: number;
      growth: number;
    };
    startup_activity?: {
      classification: TrendClassification;
      level: number;
      growth: number;
    };
  };

  /** Composite scores */
  scores: {
    overall: number;
    attractiveness: number;
    momentum: number;
    confidence: number;
  };

  /** Market attractiveness */
  attractiveness: 'highly_attractive' | 'attractive' | 'neutral' | 'challenging' | 'avoid';

  /** Top growing careers in region */
  topCareers: string[];

  /** Key industries in region */
  keyIndustries: string[];

  /** Key insights */
  insights: string[];

  /** Risk flags */
  riskFlags: string[];
}

/**
 * Region comparison result.
 */
export interface RegionComparison {
  /** Base region ID */
  baseRegionId: string;

  /** Comparison region ID */
  comparisonRegionId: string;

  /** Metric comparisons */
  comparisons: {
    metric: string;
    baseScore: number;
    comparisonScore: number;
    winner: 'base' | 'comparison' | 'tie';
  }[];

  /** Overall assessment */
  overall: {
    winner: 'base' | 'comparison' | 'tie';
    reasoning: string;
  };

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Analyzes region-specific trends.
 */
export class RegionTrendEngine {
  private config: RegionTrendConfig;

  constructor(config?: Partial<RegionTrendConfig>) {
    this.config = { ...DEFAULT_REGION_TREND_CONFIG, ...config };
  }

  /**
   * Analyze trends for a specific region.
   */
  analyzeRegion(
    snapshots: TrendSnapshot[],
    regionId: string,
    regionName: string
  ): RegionTrendAnalysis | null {
    const regionSnapshots = snapshots.filter((s) => s.entityId === regionId);

    if (regionSnapshots.length < this.config.minDataPoints) {
      return null;
    }

    // Analyze each metric
    const metrics: RegionTrendAnalysis['metrics'] = {};

    for (const metricType of this.config.trackedMetrics) {
      const metricSnapshots = regionSnapshots.filter((s) => s.metricType === metricType);
      if (metricSnapshots.length >= 3) {
        const metric = this.analyzeMetric(metricSnapshots);

        switch (metricType) {
          case 'demand':
            metrics.demand = {
              classification: metric.classification,
              level: metric.level,
              growth: metric.growth,
            };
            break;
          case 'growth':
            metrics.growth = {
              classification: metric.classification,
              rate: metric.growth,
              momentum: metric.momentum,
            };
            break;
          case 'remote_opportunity':
            metrics.remote_opportunity = {
              classification: metric.classification,
              level: metric.level,
              growth: metric.growth,
            };
            break;
          case 'startup_activity':
            metrics.startup_activity = {
              classification: metric.classification,
              level: metric.level,
              growth: metric.growth,
            };
            break;
        }
      }
    }

    // Calculate composite scores
    const scores = this.calculateScores(metrics);

    // Determine overall trend
    const overallTrend = this.determineOverallTrend(metrics);

    // Determine attractiveness
    const attractiveness = this.assessAttractiveness(metrics, scores);

    // Generate insights
    const insights = this.generateInsights(regionId, metrics, attractiveness);

    // Identify risk flags
    const riskFlags = this.identifyRiskFlags(metrics);

    return {
      regionId,
      regionName,
      analyzedAt: new Date(),
      overallTrend,
      metrics,
      scores,
      attractiveness,
      topCareers: [],
      keyIndustries: [],
      insights,
      riskFlags,
    };
  }

  /**
   * Analyze trends for multiple regions.
   */
  analyzeRegions(
    snapshots: TrendSnapshot[],
    regions: Array<{ id: string; name: string }>
  ): Map<string, RegionTrendAnalysis | null> {
    const results = new Map<string, RegionTrendAnalysis | null>();

    for (const region of regions) {
      const analysis = this.analyzeRegion(snapshots, region.id, region.name);
      results.set(region.id, analysis);
    }

    return results;
  }

  /**
   * Compare trends between two regions.
   */
  compareRegions(
    snapshots: TrendSnapshot[],
    baseRegion: { id: string; name: string },
    comparisonRegion: { id: string; name: string }
  ): RegionComparison | null {
    const baseAnalysis = this.analyzeRegion(snapshots, baseRegion.id, baseRegion.name);
    const comparisonAnalysis = this.analyzeRegion(
      snapshots,
      comparisonRegion.id,
      comparisonRegion.name
    );

    if (!baseAnalysis || !comparisonAnalysis) return null;

    const comparisons: RegionComparison['comparisons'] = [];

    for (const metric of this.config.trackedMetrics) {
      const baseMetric = baseAnalysis.metrics[metric];
      const comparisonMetric = comparisonAnalysis.metrics[metric];

      if (baseMetric && comparisonMetric) {
        const baseScore = 'momentum' in baseMetric ? baseMetric.momentum : baseMetric.level;
        const comparisonScore = 'momentum' in comparisonMetric ? comparisonMetric.momentum : comparisonMetric.level;
        const diff = comparisonScore - baseScore;

        let winner: 'base' | 'comparison' | 'tie';
        if (Math.abs(diff) < 10) winner = 'tie';
        else winner = diff > 0 ? 'comparison' : 'base';

        comparisons.push({
          metric,
          baseScore,
          comparisonScore,
          winner,
        });
      }
    }

    // Overall winner
    const baseWins = comparisons.filter((c) => c.winner === 'base').length;
    const comparisonWins = comparisons.filter((c) => c.winner === 'comparison').length;

    let overallWinner: 'base' | 'comparison' | 'tie';
    if (baseWins > comparisonWins) overallWinner = 'base';
    else if (comparisonWins > baseWins) overallWinner = 'comparison';
    else overallWinner = 'tie';

    return {
      baseRegionId: baseRegion.id,
      comparisonRegionId: comparisonRegion.id,
      comparisons,
      overall: {
        winner: overallWinner,
        reasoning: this.generateComparisonReasoning(
          baseAnalysis,
          comparisonAnalysis,
          overallWinner
        ),
      },
      analyzedAt: new Date(),
    };
  }

  /**
   * Rank regions by attractiveness.
   */
  rankRegions(
    snapshots: TrendSnapshot[],
    regionIds: string[]
  ): Array<{
    regionId: string;
    attractivenessScore: number;
    classification: TrendClassification;
    rank: number;
  }> {
    const results: Array<{
      regionId: string;
      attractivenessScore: number;
      classification: TrendClassification;
    }> = [];

    for (const regionId of regionIds) {
      const analysis = this.analyzeRegion(snapshots, regionId, regionId);
      if (analysis) {
        results.push({
          regionId,
          attractivenessScore: analysis.scores.attractiveness,
          classification: analysis.overallTrend,
        });
      }
    }

    results.sort((a, b) => b.attractivenessScore - a.attractivenessScore);

    return results.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * Identify attractive regions.
   */
  identifyAttractiveRegions(
    snapshots: TrendSnapshot[],
    regionIds: string[]
  ): string[] {
    const attractive: string[] = [];

    for (const regionId of regionIds) {
      const analysis = this.analyzeRegion(snapshots, regionId, regionId);
      if (analysis && (analysis.attractiveness === 'highly_attractive' || analysis.attractiveness === 'attractive')) {
        attractive.push(regionId);
      }
    }

    return attractive;
  }

  /**
   * Identify emerging regions.
   */
  identifyEmergingRegions(
    snapshots: TrendSnapshot[],
    regionIds: string[],
    growthThreshold: number = 50
  ): string[] {
    const emerging: string[] = [];

    for (const regionId of regionIds) {
      const analysis = this.analyzeRegion(snapshots, regionId, regionId);
      if (analysis && analysis.metrics.growth && analysis.metrics.growth.momentum >= growthThreshold) {
        emerging.push(regionId);
      }
    }

    return emerging;
  }

  /**
   * Analyze a single metric.
   */
  private analyzeMetric(snapshots: TrendSnapshot[]): {
    classification: TrendClassification;
    level: number;
    growth: number;
    momentum: number;
  } {
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const start = sorted[0].value;
    const end = sorted[sorted.length - 1].value;
    const growth = ((end - start) / Math.max(1, start)) * 100;

    // Calculate momentum
    const momentum = Math.min(100, Math.abs(growth) * 2);

    // Classification
    let classification: TrendClassification;
    if (growth >= 30) classification = TrendClassification.RAPID_GROWTH;
    else if (growth >= 10) classification = TrendClassification.GROWTH;
    else if (growth <= -30) classification = TrendClassification.RAPID_DECLINE;
    else if (growth <= -10) classification = TrendClassification.DECLINING;
    else classification = TrendClassification.STABLE;

    return {
      classification,
      level: Math.round(end),
      growth: Math.round(growth * 10) / 10,
      momentum: Math.round(momentum),
    };
  }

  /**
   * Calculate composite scores.
   */
  private calculateScores(metrics: RegionTrendAnalysis['metrics']): RegionTrendAnalysis['scores'] {
    // Demand is primary attractiveness factor
    const demand = metrics.demand?.level ?? 50;
    const demandGrowth = metrics.demand?.growth ?? 0;

    // Growth rate contributes
    const growth = metrics.growth?.rate ?? 0;

    // Remote opportunities add flexibility
    const remote = metrics.remote_opportunity?.level ?? 50;

    // Startup activity indicates innovation
    const startup = metrics.startup_activity?.level ?? 50;

    // Calculate attractiveness (weighted)
    const attractiveness = Math.round(
      demand * 0.35 +
      Math.max(0, demandGrowth * 2) * 0.15 +
      Math.max(0, growth * 2) * 0.2 +
      remote * 0.15 +
      startup * 0.15
    );

    // Overall score
    const overall = Math.round(
      (demand + Math.max(0, demandGrowth) + Math.max(0, growth) + remote + startup) / 5
    );

    // Momentum based on growth
    const momentum = Math.round(
      Math.abs(demandGrowth) * 0.5 + Math.abs(growth) * 0.5
    );

    return {
      overall,
      attractiveness,
      momentum,
      confidence: 70,
    };
  }

  /**
   * Determine overall trend.
   */
  private determineOverallTrend(
    metrics: RegionTrendAnalysis['metrics']
  ): TrendClassification {
    const growthMetrics = [metrics.demand?.growth, metrics.growth?.rate].filter(
      (g): g is number => g !== undefined
    );

    if (growthMetrics.length === 0) return TrendClassification.EMERGING;

    const avgGrowth = growthMetrics.reduce((a, b) => a + b, 0) / growthMetrics.length;

    if (avgGrowth >= 20) return TrendClassification.RAPID_GROWTH;
    if (avgGrowth >= 10) return TrendClassification.GROWTH;
    if (avgGrowth <= -20) return TrendClassification.RAPID_DECLINE;
    if (avgGrowth <= -10) return TrendClassification.DECLINING;
    return TrendClassification.STABLE;
  }

  /**
   * Assess region attractiveness.
   */
  private assessAttractiveness(
    metrics: RegionTrendAnalysis['metrics'],
    scores: RegionTrendAnalysis['scores']
  ): RegionTrendAnalysis['attractiveness'] {
    const { attractiveness, momentum } = scores;

    if (attractiveness >= 75 && momentum >= 60) return 'highly_attractive';
    if (attractiveness >= 60) return 'attractive';
    if (attractiveness >= 40) return 'neutral';
    if (attractiveness >= 25) return 'challenging';
    return 'avoid';
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    regionId: string,
    metrics: RegionTrendAnalysis['metrics'],
    attractiveness: RegionTrendAnalysis['attractiveness']
  ): string[] {
    const insights: string[] = [];

    insights.push(`${regionId} is ${attractiveness.replace(/_/g, ' ')}`);

    if (metrics.demand?.classification === 'RAPID_GROWTH') {
      insights.push('Rapid demand growth in region');
    }

    if (metrics.remote_opportunity && metrics.remote_opportunity.level >= 60) {
      insights.push('Strong remote work opportunities');
    }

    if (metrics.startup_activity && metrics.startup_activity.level >= 60) {
      insights.push('Active startup ecosystem');
    }

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(metrics: RegionTrendAnalysis['metrics']): string[] {
    const flags: string[] = [];

    if (metrics.demand?.classification === 'RAPID_DECLINE') {
      flags.push('demand-collapse');
    }

    if (metrics.growth?.classification === 'DECLINING') {
      flags.push('economic-contraction');
    }

    return flags;
  }

  /**
   * Generate comparison reasoning.
   */
  private generateComparisonReasoning(
    base: RegionTrendAnalysis,
    comparison: RegionTrendAnalysis,
    winner: 'base' | 'comparison' | 'tie'
  ): string {
    if (winner === 'tie') {
      return 'Both regions offer similar opportunities';
    }

    const winnerAnalysis = winner === 'base' ? base : comparison;

    const reasons: string[] = [];

    if (winnerAnalysis.attractiveness === 'highly_attractive') {
      reasons.push('highly attractive market');
    }

    if (winnerAnalysis.metrics.demand && winnerAnalysis.metrics.demand.level > 70) {
      reasons.push('stronger demand');
    }

    if (winnerAnalysis.metrics.remote_opportunity && winnerAnalysis.metrics.remote_opportunity.level > 60) {
      reasons.push('better remote opportunities');
    }

    if (reasons.length === 0) {
      return 'Better overall market conditions';
    }

    return reasons.join(', ');
  }
}

/**
 * Factory function for RegionTrendEngine.
 */
export function createRegionTrendEngine(
  config?: Partial<RegionTrendConfig>
): RegionTrendEngine {
  return new RegionTrendEngine(config);
}
