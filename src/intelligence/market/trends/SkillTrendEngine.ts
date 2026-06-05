/**
 * CareerOS Market Intelligence - Skill Trend Engine
 *
 * Analyzes trends for specific skills.
 *
 * Tracks:
 * - Skill demand
 * - Skill growth
 * - Skill scarcity
 * - Future relevance
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { TrendAnalysis } from './models/TrendAnalysis';
import { TrendClassification } from './models/TrendClassification';

/**
 * Skill trend configuration.
 */
export interface SkillTrendConfig {
  /** Analysis period (days) */
  analysisPeriod: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Emerging skill threshold (days since first appearance) */
  emergingThreshold: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_SKILL_TREND_CONFIG: SkillTrendConfig = {
  analysisPeriod: 180,
  minDataPoints: 8,
  emergingThreshold: 90,
};

/**
 * Skill trend analysis result.
 */
export interface SkillTrendAnalysis {
  /** Skill identifier */
  skillId: string;

  /** Skill name */
  skillName: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Demand trend */
  demand: {
    classification: TrendClassification;
    momentum: number;
    growth: number;
  };

  /** Scarcity trend */
  scarcity: {
    level: 'abundant' | 'balanced' | 'scarce' | 'critical';
    trend: TrendClassification;
  };

  /** Future relevance assessment */
  futureRelevance: {
    score: number;
    classification: TrendClassification;
    reasoning: string[];
  };

  /** Composite scores */
  scores: {
    overall: number;
    momentum: number;
    persistence: number;
    confidence: number;
  };

  /** Skill lifecycle stage */
  lifecycleStage: 'emerging' | 'growing' | 'mature' | 'declining' | 'legacy';

  /** Related skills with similar trends */
  relatedSkills: string[];

  /** Key insights */
  insights: string[];

  /** Risk flags */
  riskFlags: string[];
}

/**
 * Skill trend comparison.
 */
export interface SkillTrendComparison {
  /** Base skill ID */
  baseSkillId: string;

  /** Comparison skill ID */
  comparisonSkillId: string;

  /** Demand comparison */
  demand: {
    base: number;
    comparison: number;
    winner: 'base' | 'comparison' | 'tie';
  };

  /** Future relevance comparison */
  futureRelevance: {
    base: number;
    comparison: number;
    winner: 'base' | 'comparison' | 'tie';
  };

  /** Overall comparison */
  overall: {
    winner: 'base' | 'comparison' | 'tie';
    reasoning: string;
  };

  /** Analysis timestamp */
  analyzedAt: Date;
}

/**
 * Analyzes skill-specific trends.
 */
export class SkillTrendEngine {
  private config: SkillTrendConfig;

  constructor(config?: Partial<SkillTrendConfig>) {
    this.config = { ...DEFAULT_SKILL_TREND_CONFIG, ...config };
  }

  /**
   * Analyze trends for a specific skill.
   */
  analyzeSkill(
    snapshots: TrendSnapshot[],
    skillId: string,
    skillName: string
  ): SkillTrendAnalysis | null {
    const skillSnapshots = snapshots.filter((s) => s.entityId === skillId);

    if (skillSnapshots.length < this.config.minDataPoints) {
      return this.createEmergingAnalysis(skillId, skillName, skillSnapshots);
    }

    // Sort by timestamp
    const sorted = [...skillSnapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate metrics
    const demandSnapshots = sorted.filter((s) => s.metricType === 'skill_demand');
    const scarcitySnapshots = sorted.filter((s) => s.metricType === 'scarcity');

    const demand = this.analyzeDemand(demandSnapshots);
    const scarcity = this.analyzeScarcity(scarcitySnapshots);

    // Calculate future relevance
    const futureRelevance = this.assessFutureRelevance(sorted, demand);

    // Calculate composite scores
    const scores = this.calculateScores(demand, futureRelevance, sorted);

    // Determine lifecycle stage
    const lifecycleStage = this.determineLifecycleStage(demand, sorted);

    // Generate insights
    const insights = this.generateInsights(skillId, demand, scarcity, futureRelevance);

    // Identify risk flags
    const riskFlags = this.identifyRiskFlags(demand, lifecycleStage);

    return {
      skillId,
      skillName,
      analyzedAt: new Date(),
      demand,
      scarcity,
      futureRelevance,
      scores,
      lifecycleStage,
      relatedSkills: [], // Would need cross-skill analysis
      insights,
      riskFlags,
    };
  }

  /**
   * Analyze trends for multiple skills.
   */
  analyzeSkills(
    snapshots: TrendSnapshot[],
    skills: Array<{ id: string; name: string }>
  ): Map<string, SkillTrendAnalysis | null> {
    const results = new Map<string, SkillTrendAnalysis | null>();

    for (const skill of skills) {
      const analysis = this.analyzeSkill(snapshots, skill.id, skill.name);
      results.set(skill.id, analysis);
    }

    return results;
  }

  /**
   * Compare trends between two skills.
   */
  compareSkills(
    snapshots: TrendSnapshot[],
    baseSkill: { id: string; name: string },
    comparisonSkill: { id: string; name: string }
  ): SkillTrendComparison | null {
    const baseAnalysis = this.analyzeSkill(snapshots, baseSkill.id, baseSkill.name);
    const comparisonAnalysis = this.analyzeSkill(
      snapshots,
      comparisonSkill.id,
      comparisonSkill.name
    );

    if (!baseAnalysis || !comparisonAnalysis) return null;

    const demandDiff = comparisonAnalysis.demand.momentum - baseAnalysis.demand.momentum;
    const relevanceDiff =
      comparisonAnalysis.futureRelevance.score - baseAnalysis.futureRelevance.score;

    const demandWinner = Math.abs(demandDiff) < 10 ? 'tie' : demandDiff > 0 ? 'comparison' : 'base';
    const relevanceWinner =
      Math.abs(relevanceDiff) < 10 ? 'tie' : relevanceDiff > 0 ? 'comparison' : 'base';

    // Overall winner
    const basePoints = (demandWinner === 'base' ? 1 : 0) + (relevanceWinner === 'base' ? 1 : 0);
    const comparisonPoints =
      (demandWinner === 'comparison' ? 1 : 0) + (relevanceWinner === 'comparison' ? 1 : 0);

    let overallWinner: 'base' | 'comparison' | 'tie';
    if (basePoints > comparisonPoints) overallWinner = 'base';
    else if (comparisonPoints > basePoints) overallWinner = 'comparison';
    else overallWinner = 'tie';

    return {
      baseSkillId: baseSkill.id,
      comparisonSkillId: comparisonSkill.id,
      demand: {
        base: baseAnalysis.demand.momentum,
        comparison: comparisonAnalysis.demand.momentum,
        winner: demandWinner,
      },
      futureRelevance: {
        base: baseAnalysis.futureRelevance.score,
        comparison: comparisonAnalysis.futureRelevance.score,
        winner: relevanceWinner,
      },
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
   * Identify emerging skills.
   */
  identifyEmergingSkills(
    snapshots: TrendSnapshot[],
    skillIds: string[],
    threshold: number = 70
  ): string[] {
    const emerging: string[] = [];

    for (const skillId of skillIds) {
      const skillSnapshots = snapshots.filter((s) => s.entityId === skillId);

      if (skillSnapshots.length >= 3) {
        const sorted = [...skillSnapshots].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const firstAppearance = sorted[0].timestamp;
        const daysSinceAppearance =
          (Date.now() - firstAppearance.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceAppearance <= this.config.emergingThreshold) {
          const recentGrowth = this.calculateRecentGrowth(sorted);
          if (recentGrowth >= threshold) {
            emerging.push(skillId);
          }
        }
      }
    }

    return emerging;
  }

  /**
   * Identify declining skills.
   */
  identifyDecliningSkills(
    snapshots: TrendSnapshot[],
    skillIds: string[],
    threshold: number = -30
  ): string[] {
    const declining: string[] = [];

    for (const skillId of skillIds) {
      const skillSnapshots = snapshots.filter((s) => s.entityId === skillId);

      if (skillSnapshots.length >= this.config.minDataPoints) {
        const sorted = [...skillSnapshots].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const overallChange =
          ((sorted[sorted.length - 1].value - sorted[0].value) / sorted[0].value) * 100;

        if (overallChange <= threshold) {
          declining.push(skillId);
        }
      }
    }

    return declining;
  }

  /**
   * Rank skills by demand trend.
   */
  rankByDemand(
    snapshots: TrendSnapshot[],
    skillIds: string[]
  ): Array<{
    skillId: string;
    demandMomentum: number;
    classification: TrendClassification;
    rank: number;
  }> {
    const results: Array<{
      skillId: string;
      demandMomentum: number;
      classification: TrendClassification;
    }> = [];

    for (const skillId of skillIds) {
      const skillSnapshots = snapshots.filter(
        (s) => s.entityId === skillId && s.metricType === 'skill_demand'
      );

      if (skillSnapshots.length >= 3) {
        const analysis = this.analyzeDemand(skillSnapshots);
        results.push({
          skillId,
          demandMomentum: analysis.momentum,
          classification: analysis.classification,
        });
      }
    }

    results.sort((a, b) => b.demandMomentum - a.demandMomentum);

    return results.map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * Create analysis for emerging skill.
   */
  private createEmergingAnalysis(
    skillId: string,
    skillName: string,
    snapshots: TrendSnapshot[]
  ): SkillTrendAnalysis {
    return {
      skillId,
      skillName,
      analyzedAt: new Date(),
      demand: {
        classification: TrendClassification.EMERGING,
        momentum: 50,
        growth: 0,
      },
      scarcity: {
        level: 'balanced',
        trend: TrendClassification.EMERGING,
      },
      futureRelevance: {
        score: 50,
        classification: TrendClassification.EMERGING,
        reasoning: ['Insufficient data to assess future relevance'],
      },
      scores: {
        overall: 50,
        momentum: 50,
        persistence: 30,
        confidence: 40,
      },
      lifecycleStage: 'emerging',
      relatedSkills: [],
      insights: ['New skill - monitor closely for trend development'],
      riskFlags: ['insufficient-data'],
    };
  }

  /**
   * Analyze demand trend.
   */
  private analyzeDemand(snapshots: TrendSnapshot[]): SkillTrendAnalysis['demand'] {
    if (snapshots.length < 2) {
      return {
        classification: TrendClassification.EMERGING,
        momentum: 0,
        growth: 0,
      };
    }

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const start = sorted[0].value;
    const end = sorted[sorted.length - 1].value;
    const growth = ((end - start) / start) * 100;

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
      momentum: Math.round(momentum),
      growth: Math.round(growth * 10) / 10,
    };
  }

  /**
   * Analyze scarcity trend.
   */
  private analyzeScarcity(snapshots: TrendSnapshot[]): SkillTrendAnalysis['scarcity'] {
    if (snapshots.length === 0) {
      return {
        level: 'balanced',
        trend: TrendClassification.EMERGING,
      };
    }

    const avgValue =
      snapshots.reduce((sum, s) => sum + s.value, 0) / snapshots.length;

    let level: SkillTrendAnalysis['scarcity']['level'];
    if (avgValue >= 80) level = 'critical';
    else if (avgValue >= 60) level = 'scarce';
    else if (avgValue >= 40) level = 'balanced';
    else level = 'abundant';

    // Trend analysis
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const start = sorted[0].value;
    const end = sorted[sorted.length - 1].value;
    const change = end - start;

    let trend: TrendClassification;
    if (change > 10) trend = TrendClassification.GROWTH;
    else if (change < -10) trend = TrendClassification.DECLINING;
    else trend = TrendClassification.STABLE;

    return { level, trend };
  }

  /**
   * Assess future relevance.
   */
  private assessFutureRelevance(
    snapshots: TrendSnapshot[],
    demand: SkillTrendAnalysis['demand']
  ): SkillTrendAnalysis['futureRelevance'] {
    const score = this.calculateFutureRelevanceScore(snapshots, demand);

    let classification: TrendClassification;
    if (score >= 70) classification = TrendClassification.GROWTH;
    else if (score >= 40) classification = TrendClassification.STABLE;
    else classification = TrendClassification.DECLINING;

    const reasoning: string[] = [];

    if (demand.classification === 'RAPID_GROWTH') {
      reasoning.push('Rapid demand growth indicates high relevance');
    }

    if (score >= 70) {
      reasoning.push('Strong indicators for future demand');
    } else if (score <= 30) {
      reasoning.push('Weak indicators for future demand');
    }

    return {
      score: Math.round(score),
      classification,
      reasoning,
    };
  }

  /**
   * Calculate future relevance score.
   */
  private calculateFutureRelevanceScore(
    snapshots: TrendSnapshot[],
    demand: SkillTrendAnalysis['demand']
  ): number {
    let score = 50; // Base score

    // Adjust based on demand trend
    if (demand.classification === 'RAPID_GROWTH') score += 25;
    else if (demand.classification === 'GROWTH') score += 15;
    else if (demand.classification === 'DECLINING') score -= 15;
    else if (demand.classification === 'RAPID_DECLINE') score -= 25;

    // Adjust based on data quality
    const sources = new Set(snapshots.flatMap((s) => s.sources)).size;
    score += Math.min(15, sources * 5);

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate composite scores.
   */
  private calculateScores(
    demand: SkillTrendAnalysis['demand'],
    futureRelevance: SkillTrendAnalysis['futureRelevance'],
    snapshots: TrendSnapshot[]
  ): SkillTrendAnalysis['scores'] {
    const overall = Math.round((demand.momentum + futureRelevance.score) / 2);
    const momentum = demand.momentum;

    // Persistence based on duration and consistency
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const duration =
      (sorted[sorted.length - 1].timestamp.getTime() - sorted[0].timestamp.getTime()) /
      (1000 * 60 * 60 * 24);
    const persistence = Math.min(100, (duration / 90) * 50 + 25);

    // Confidence
    const confidence = Math.min(
      100,
      snapshots.length * 10 +
        new Set(snapshots.flatMap((s) => s.sources)).size * 10
    );

    return {
      overall,
      momentum,
      persistence: Math.round(persistence),
      confidence: Math.round(confidence),
    };
  }

  /**
   * Determine lifecycle stage.
   */
  private determineLifecycleStage(
    demand: SkillTrendAnalysis['demand'],
    snapshots: TrendSnapshot[]
  ): SkillTrendAnalysis['lifecycleStage'] {
    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const firstAppearance = sorted[0].timestamp;
    const daysSinceAppearance =
      (Date.now() - firstAppearance.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceAppearance <= this.config.emergingThreshold) {
      return 'emerging';
    }

    if (demand.classification === 'RAPID_GROWTH' || demand.classification === 'GROWTH') {
      return 'growing';
    }

    if (demand.classification === 'STABLE') {
      return 'mature';
    }

    if (demand.classification === 'DECLINING') {
      return 'declining';
    }

    return 'legacy';
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    skillId: string,
    demand: SkillTrendAnalysis['demand'],
    scarcity: SkillTrendAnalysis['scarcity'],
    futureRelevance: SkillTrendAnalysis['futureRelevance']
  ): string[] {
    const insights: string[] = [];

    if (demand.classification === 'RAPID_GROWTH') {
      insights.push(`${skillId} showing rapid demand growth`);
    }

    if (scarcity.level === 'critical' || scarcity.level === 'scarce') {
      insights.push('Skill shortage creating opportunity');
    }

    if (futureRelevance.score >= 70) {
      insights.push('Strong future relevance expected');
    }

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(
    demand: SkillTrendAnalysis['demand'],
    lifecycleStage: SkillTrendAnalysis['lifecycleStage']
  ): string[] {
    const flags: string[] = [];

    if (demand.classification === 'RAPID_DECLINE') {
      flags.push('rapid-demand-decline');
    }

    if (lifecycleStage === 'declining' || lifecycleStage === 'legacy') {
      flags.push('skill-obsolescence-risk');
    }

    return flags;
  }

  /**
   * Generate comparison reasoning.
   */
  private generateComparisonReasoning(
    base: SkillTrendAnalysis,
    comparison: SkillTrendAnalysis,
    winner: 'base' | 'comparison' | 'tie'
  ): string {
    if (winner === 'tie') {
      return 'Both skills show similar trend patterns';
    }

    const winnerAnalysis = winner === 'base' ? base : comparison;
    const loserAnalysis = winner === 'base' ? comparison : base;

    const parts: string[] = [];

    if (winnerAnalysis.demand.momentum > loserAnalysis.demand.momentum + 10) {
      parts.push('stronger demand momentum');
    }

    if (winnerAnalysis.futureRelevance.score > loserAnalysis.futureRelevance.score + 10) {
      parts.push('better future relevance');
    }

    if (parts.length === 0) {
      return 'Marginally better overall performance';
    }

    return parts.join(', ');
  }

  /**
   * Calculate recent growth.
   */
  private calculateRecentGrowth(snapshots: TrendSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    const sorted = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const recent = sorted.slice(-3);
    if (recent.length < 2) return 0;

    const start = recent[0].value;
    const end = recent[recent.length - 1].value;

    return ((end - start) / start) * 100;
  }
}

/**
 * Factory function for SkillTrendEngine.
 */
export function createSkillTrendEngine(
  config?: Partial<SkillTrendConfig>
): SkillTrendEngine {
  return new SkillTrendEngine(config);
}
