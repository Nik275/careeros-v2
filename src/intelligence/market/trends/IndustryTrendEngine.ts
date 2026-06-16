/**
 * CareerOS Market Intelligence - Industry Trend Engine
 *
 * Analyzes trends for specific industries.
 *
 * Tracks:
 * - Industry expansion
 * - Hiring growth
 * - Investment activity
 * - Market confidence
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { TrendAnalysis } from './models/TrendAnalysis';
import { TrendClassification } from './models/TrendClassification';

/**
 * Industry trend configuration.
 */
export interface IndustryTrendConfig {
  /** Analysis period (days) */
  analysisPeriod: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Metrics to track */
  trackedMetrics: ('expansion' | 'hiring' | 'investment' | 'confidence')[];
}

/**
 * Default configuration.
 */
export const DEFAULT_INDUSTRY_TREND_CONFIG: IndustryTrendConfig = {
  analysisPeriod: 180,
  minDataPoints: 10,
  trackedMetrics: ['expansion', 'hiring', 'investment', 'confidence'],
};

/**
 * Industry trend analysis result.
 */
export interface IndustryTrendAnalysis {
  /** Industry identifier */
  industryId: string;

  /** Industry name */
  industryName: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Overall trend classification */
  overallTrend: TrendClassification;

  /** Individual metric analyses */
  metrics: {
    expansion?: {
      classification: TrendClassification;
      growth: number;
      momentum: number;
    };
    hiring?: {
      classification: TrendClassification;
      growth: number;
      momentum: number;
    };
    investment?: {
      classification: TrendClassification;
      growth: number;
      momentum: number;
    };
    confidence?: {
      classification: TrendClassification;
      level: number;
      trend: TrendClassification;
    };
  };

  /** Composite scores */
  scores: {
    overall: number;
    momentum: number;
    stability: number;
    confidence: number;
  };

  /** Industry health assessment */
  health: 'thriving' | 'growing' | 'stable' | 'contracting' | 'distressed';

  /** Key insights */
  insights: string[];

  /** Risk flags */
  riskFlags: string[];

  /** Top growing sectors within industry */
  topSectors: string[];

  /** Geographic distribution */
  geography: {
    topRegions: string[];
    growthDistribution: Record<string, number>;
  };
}

/**
 * Industry comparison result.
 */
export interface IndustryComparison {
  /** Base industry ID */
  baseIndustryId: string;

  /** Comparison industry ID */
  comparisonIndustryId: string;

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
 * Analyzes industry-specific trends.
 */
export class IndustryTrendEngine {
  private config: IndustryTrendConfig;

  constructor(config?: Partial<IndustryTrendConfig>) {
    this.config = { ...DEFAULT_INDUSTRY_TREND_CONFIG, ...config };
  }

  /**
   * Analyze trends for a specific industry.
   */
  analyzeIndustry(
    snapshots: TrendSnapshot[],
    industryId: string,
    industryName: string
  ): IndustryTrendAnalysis | null {
    const industrySnapshots = snapshots.filter((s) => s.entityId === industryId);

    if (industrySnapshots.length < this.config.minDataPoints) {
      return null;
    }

    // Analyze each metric
    const metrics: IndustryTrendAnalysis['metrics'] = {};

    for (const metricType of this.config.trackedMetrics) {
      const metricSnapshots = industrySnapshots.filter((s) => s.metricType === metricType);
      if (metricSnapshots.length >= 3) {
        switch (metricType) {
          case 'expansion':
            metrics.expansion = this.analyzeMetric(metricSnapshots);
            break;
          case 'hiring':
            metrics.hiring = this.analyzeMetric(metricSnapshots);
            break;
          case 'investment':
            metrics.investment = this.analyzeMetric(metricSnapshots);
            break;
          case 'confidence':
            metrics.confidence = this.analyzeConfidenceMetric(metricSnapshots);
            break;
        }
      }
    }

    // Calculate composite scores
    const scores = this.calculateScores(metrics);

    // Determine overall trend
    const overallTrend = this.determineOverallTrend(metrics);

    // Determine health
    const health = this.assessHealth(metrics, scores);

    // Generate insights
    const insights = this.generateInsights(industryId, metrics, health);

    // Identify risk flags
    const riskFlags = this.identifyRiskFlags(metrics, health);

    return {
      industryId,
      industryName,
      analyzedAt: new Date(),
      overallTrend,
      metrics,
      scores,
      health,
      insights,
      riskFlags,
      topSectors: [], // Would need sector-level data
      geography: {
        topRegions: [],
        growthDistribution: {},
      },
    };
  }

  /**
   * Analyze trends for multiple industries.
   */
  analyzeIndustries(
    snapshots: TrendSnapshot[],
    industries: Array<{ id: string; name: string }>
  ): Map<string, IndustryTrendAnalysis | null> {
    const results = new Map<string, IndustryTrendAnalysis | null>();

    for (const industry of industries) {
      const analysis = this.analyzeIndustry(snapshots, industry.id, industry.name);
      results.set(industry.id, analysis);
    }

    return results;
  }

  /**
   * Compare trends between two industries.
   */
  compareIndustries(
    snapshots: TrendSnapshot[],
    baseIndustry: { id: string; name: string },
    comparisonIndustry: { id: string; name: string }
  ): IndustryComparison | null {
    const baseAnalysis = this.analyzeIndustry(snapshots, baseIndustry.id, baseIndustry.name);
    const comparisonAnalysis = this.analyzeIndustry(
      snapshots,
      comparisonIndustry.id,
      comparisonIndustry.name
    );

    if (!baseAnalysis || !comparisonAnalysis) return null;

    const comparisons: IndustryComparison['comparisons'] = [];

    for (const metric of this.config.trackedMetrics) {
      const baseMetric = baseAnalysis.metrics[metric];
      const comparisonMetric = comparisonAnalysis.metrics[metric];

      if (baseMetric && comparisonMetric) {
        const baseScore = 'momentum' in baseMetric ? baseMetric.momentum : baseMetric.level;
        const comparisonScore =
          'momentum' in comparisonMetric ? comparisonMetric.momentum : comparisonMetric.level;
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
      baseIndustryId: baseIndustry.id,
      comparisonIndustryId: comparisonIndustry.id,
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
   * Rank industries by growth.
   */
  rankIndustries(
    snapshots: TrendSnapshot[],
    industryIds: string[]
  ): Array<{
    industryId: string;
    growthScore: number;
    classification: TrendClassification;
    health: IndustryTrendAnalysis['health'];
    rank: number;
  }> {
    const results: Array<{
      industryId: string;
      growthScore: number;
      classification: TrendClassification;
      health: IndustryTrendAnalysis['health'];
    }> = [];

    for (const industryId of industryIds) {
      const analysis = this.analyzeIndustry(snapshots, industryId, industryId);
      if (analysis) {
        results.push({
          industryId,
          growthScore: analysis.scores.overall,
          classification: analysis.overallTrend,
          health: analysis.health,
        });
      }
    }

    results.sort((a, b) => b.growthScore - a.growthScore);

    return results.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * Identify thriving industries.
   */
  identifyThrivingIndustries(
    snapshots: TrendSnapshot[],
    industryIds: string[]
  ): string[] {
    const thriving: string[] = [];

    for (const industryId of industryIds) {
      const analysis = this.analyzeIndustry(snapshots, industryId, industryId);
      if (analysis && analysis.health === 'thriving') {
        thriving.push(industryId);
      }
    }

    return thriving;
  }

  /**
   * Identify distressed industries.
   */
  identifyDistressedIndustries(
    snapshots: TrendSnapshot[],
    industryIds: string[]
  ): string[] {
    const distressed: string[] = [];

    for (const industryId of industryIds) {
      const analysis = this.analyzeIndustry(snapshots, industryId, industryId);
      if (analysis && analysis.health === 'distressed') {
        distressed.push(industryId);
      }
    }

    return distressed;
  }

  /**
   * Analyze a single metric.
   */
  private analyzeMetric(snapshots: TrendSnapshot[]): {
    classification: TrendClassification;
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
      growth: Math.round(growth * 10) / 10,
      momentum: Math.round(momentum),
    };
  }

  /**
   * Analyze a confidence metric.
   */
  private analyzeConfidenceMetric(snapshots: TrendSnapshot[]): {
    classification: TrendClassification;
    level: number;
    trend: TrendClassification;
  } {
    const metric = this.analyzeMetric(snapshots);
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      classification: metric.classification,
      level: Math.round(sorted[sorted.length - 1].value),
      trend: metric.classification,
    };
  }

  /**
   * Calculate composite scores.
   */
  private calculateScores(metrics: IndustryTrendAnalysis['metrics']): IndustryTrendAnalysis['scores'] {
    const momentumValues = Object.values(metrics)
      .filter((metric): metric is NonNullable<typeof metric> => metric !== undefined)
      .map((metric) => ('momentum' in metric ? metric.momentum : metric.level));

    if (momentumValues.length === 0) {
      return {
        overall: 50,
        momentum: 50,
        stability: 50,
        confidence: 50,
      };
    }

    const momentum = Math.round(
      momentumValues.reduce((sum, value) => sum + value, 0) / momentumValues.length
    );

    // Overall score weighted toward expansion and hiring
    const expansion = metrics.expansion?.momentum ?? 50;
    const hiring = metrics.hiring?.momentum ?? 50;
    const investment = metrics.investment?.momentum ?? 50;

    const overall = Math.round(expansion * 0.3 + hiring * 0.4 + investment * 0.3);

    // Stability based on consistency across metrics
    const values = [expansion, hiring, investment];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stability = Math.round(100 - Math.sqrt(variance));

    return {
      overall,
      momentum,
      stability,
      confidence: 70, // Would calculate from data quality
    };
  }

  /**
   * Determine overall trend.
   */
  private determineOverallTrend(
    metrics: IndustryTrendAnalysis['metrics']
  ): TrendClassification {
    const classifications: TrendClassification[] = [];

    for (const metric of Object.values(metrics)) {
      if (metric && 'classification' in metric) {
        classifications.push(metric.classification);
      }
    }

    if (classifications.length === 0) return TrendClassification.EMERGING;

    // Count occurrences
    const counts: Record<string, number> = {};
    for (const c of classifications) {
      counts[c] = (counts[c] ?? 0) + 1;
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
   * Assess industry health.
   */
  private assessHealth(
    metrics: IndustryTrendAnalysis['metrics'],
    scores: IndustryTrendAnalysis['scores']
  ): IndustryTrendAnalysis['health'] {
    const { overall, momentum } = scores;

    if (overall >= 75 && momentum >= 70) return 'thriving';
    if (overall >= 60) return 'growing';
    if (overall >= 40) return 'stable';
    if (overall >= 25) return 'contracting';
    return 'distressed';
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    industryId: string,
    metrics: IndustryTrendAnalysis['metrics'],
    health: IndustryTrendAnalysis['health']
  ): string[] {
    const insights: string[] = [];

    insights.push(`${industryId} is ${health}`);

    if (metrics.expansion?.classification === 'RAPID_GROWTH') {
      insights.push('Rapid industry expansion');
    }

    if (metrics.hiring?.classification === 'RAPID_GROWTH') {
      insights.push('Strong hiring growth');
    }

    if (metrics.investment?.momentum && metrics.investment.momentum >= 70) {
      insights.push('High investment activity');
    }

    if (metrics.confidence?.level && metrics.confidence.level >= 70) {
      insights.push('High market confidence');
    }

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(
    metrics: IndustryTrendAnalysis['metrics'],
    health: IndustryTrendAnalysis['health']
  ): string[] {
    const flags: string[] = [];

    if (health === 'distressed' || health === 'contracting') {
      flags.push('industry-contraction');
    }

    if (metrics.hiring?.classification === 'RAPID_DECLINE') {
      flags.push('hiring-freeze');
    }

    if (metrics.investment?.classification === 'DECLINING') {
      flags.push('investment-decline');
    }

    return flags;
  }

  /**
   * Generate comparison reasoning.
   */
  private generateComparisonReasoning(
    base: IndustryTrendAnalysis,
    comparison: IndustryTrendAnalysis,
    winner: 'base' | 'comparison' | 'tie'
  ): string {
    if (winner === 'tie') {
      return 'Both industries show similar performance patterns';
    }

    const winnerAnalysis = winner === 'base' ? base : comparison;

    const reasons: string[] = [];

    if (winnerAnalysis.health === 'thriving') {
      reasons.push('thriving health assessment');
    }

    if (winnerAnalysis.metrics.hiring?.momentum && winnerAnalysis.metrics.hiring.momentum > 70) {
      reasons.push('stronger hiring growth');
    }

    if (reasons.length === 0) {
      return 'Better overall performance metrics';
    }

    return reasons.join(', ');
  }
}

/**
 * Factory function for IndustryTrendEngine.
 */
export function createIndustryTrendEngine(
  config?: Partial<IndustryTrendConfig>
): IndustryTrendEngine {
  return new IndustryTrendEngine(config);
}
