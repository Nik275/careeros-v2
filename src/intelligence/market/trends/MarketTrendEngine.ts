/**
 * CareerOS Market Intelligence - Market Trend Engine
 *
 * Main orchestrator for market trend analysis.
 * Coordinates all trend engines and provides unified trend intelligence.
 *
 * Questions:
 * - What is the current trend for career X?
 * - Is demand accelerating or decelerating?
 * - How persistent is the trend?
 * - Which careers are rising fastest?
 * - Which skills are declining?
 * - Which regions are growing?
 *
 * Output: Comprehensive trend analysis
 */

import type { TrendSnapshot } from './models/TrendSnapshot';
import type { TrendAnalysis } from './models/TrendAnalysis';
import type { TrendHistory } from './models/TrendHistory';
import { TrendClassification } from './models/TrendClassification';
import { TrendDetectionEngine } from './TrendDetectionEngine';
import { MomentumEngine } from './MomentumEngine';
import { AccelerationEngine } from './AccelerationEngine';
import { TrendPersistenceEngine } from './TrendPersistenceEngine';
import { CareerTrendEngine } from './CareerTrendEngine';
import { SkillTrendEngine } from './SkillTrendEngine';
import { IndustryTrendEngine } from './IndustryTrendEngine';
import { RegionTrendEngine } from './RegionTrendEngine';

/**
 * Market trend engine configuration.
 */
export interface MarketTrendEngineConfig {
  /** Analysis period (days) */
  analysisPeriodDays: number;

  /** Minimum data points required */
  minDataPoints: number;

  /** Enable career trend analysis */
  enableCareerTrends: boolean;

  /** Enable skill trend analysis */
  enableSkillTrends: boolean;

  /** Enable industry trend analysis */
  enableIndustryTrends: boolean;

  /** Enable region trend analysis */
  enableRegionTrends: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_MARKET_TREND_CONFIG: MarketTrendEngineConfig = {
  analysisPeriodDays: 180,
  minDataPoints: 10,
  enableCareerTrends: true,
  enableSkillTrends: true,
  enableIndustryTrends: true,
  enableRegionTrends: true,
};

/**
 * Unified trend analysis result.
 */
export interface UnifiedTrendAnalysis {
  /** Entity identifier */
  entityId: string;

  /** Entity type */
  entityType: 'career' | 'skill' | 'industry' | 'region';

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Overall trend classification */
  classification: TrendClassification;

  /** Trend direction */
  direction: 'up' | 'down' | 'flat';

  /** Trend strength (0-100) */
  strength: number;

  /** Momentum score (0-100) */
  momentum: number;

  /** Acceleration score (-100 to +100) */
  acceleration: number;

  /** Persistence score (0-100) */
  persistence: number;

  /** Confidence in analysis (0-100) */
  confidence: number;

  /** Human-readable summary */
  summary: string;

  /** Key insights */
  insights: string[];

  /** Risk flags */
  riskFlags: string[];

  /** Recommendations */
  recommendations: string[];

  /** Detailed metric analyses */
  metrics: Record<string, TrendAnalysis>;

  /** Supporting evidence */
  evidence: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

/**
 * Market trend summary.
 */
export interface MarketTrendSummary {
  /** Analysis timestamp */
  analyzedAt: Date;

  /** Total entities analyzed */
  totalEntities: number;

  /** Trend distribution */
  distribution: {
    rapidGrowth: number;
    growth: number;
    stable: number;
    declining: number;
    rapidDecline: number;
    volatile: number;
    emerging: number;
  };

  /** Top rising entities */
  topRising: Array<{
    entityId: string;
    entityType: string;
    strength: number;
    momentum: number;
  }>;

  /** Top declining entities */
  topDeclining: Array<{
    entityId: string;
    entityType: string;
    strength: number;
    momentum: number;
  }>;

  /** Market momentum */
  marketMomentum: {
    overall: number;
    careers: number;
    skills: number;
    industries: number;
    regions: number;
  };

  /** Key insights */
  insights: string[];
}

/**
 * Main orchestrator for market trend analysis.
 */
export class MarketTrendEngine {
  private config: MarketTrendEngineConfig;

  // Core engines
  private detectionEngine: TrendDetectionEngine;
  private momentumEngine: MomentumEngine;
  private accelerationEngine: AccelerationEngine;
  private persistenceEngine: TrendPersistenceEngine;

  // Domain engines
  private careerEngine: CareerTrendEngine;
  private skillEngine: SkillTrendEngine;
  private industryEngine: IndustryTrendEngine;
  private regionEngine: RegionTrendEngine;

  // In-memory storage
  private snapshots: Map<string, TrendSnapshot[]> = new Map();
  private history: Map<string, TrendHistory> = new Map();

  constructor(config?: Partial<MarketTrendEngineConfig>) {
    this.config = { ...DEFAULT_MARKET_TREND_CONFIG, ...config };

    // Initialize core engines
    this.detectionEngine = new TrendDetectionEngine();
    this.momentumEngine = new MomentumEngine();
    this.accelerationEngine = new AccelerationEngine();
    this.persistenceEngine = new TrendPersistenceEngine();

    // Initialize domain engines
    this.careerEngine = new CareerTrendEngine();
    this.skillEngine = new SkillTrendEngine();
    this.industryEngine = new IndustryTrendEngine();
    this.regionEngine = new RegionTrendEngine();
  }

  /**
   * Add trend snapshot.
   */
  addSnapshot(snapshot: TrendSnapshot): void {
    const key = `${snapshot.entityType}:${snapshot.entityId}:${snapshot.metricType}`;

    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }

    const existing = this.snapshots.get(key)!;
    existing.push(snapshot);

    // Sort by timestamp
    existing.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Trim to analysis period
    const cutoff = Date.now() - this.config.analysisPeriodDays * 24 * 60 * 60 * 1000;
    const trimmed = existing.filter((s) => s.timestamp.getTime() >= cutoff);

    this.snapshots.set(key, trimmed);
  }

  /**
   * Add multiple snapshots.
   */
  addSnapshots(snapshots: TrendSnapshot[]): void {
    for (const snapshot of snapshots) {
      this.addSnapshot(snapshot);
    }
  }

  /**
   * Get snapshots for entity.
   */
  getSnapshots(
    entityType: string,
    entityId: string,
    metricType?: string
  ): TrendSnapshot[] {
    if (metricType) {
      const key = `${entityType}:${entityId}:${metricType}`;
      return this.snapshots.get(key) ?? [];
    }

    // Get all metrics for entity
    const allSnapshots: TrendSnapshot[] = [];
    for (const [key, snapshots] of this.snapshots) {
      if (key.startsWith(`${entityType}:${entityId}:`)) {
        allSnapshots.push(...snapshots);
      }
    }

    return allSnapshots.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Analyze trend for specific entity.
   */
  analyzeTrend(
    entityType: 'career' | 'skill' | 'industry' | 'region',
    entityId: string,
    entityName?: string
  ): UnifiedTrendAnalysis | null {
    const snapshots = this.getSnapshots(entityType, entityId);

    if (snapshots.length < this.config.minDataPoints) {
      return null;
    }

    // Run core analyses
    const detection = this.detectionEngine.detectTrend(snapshots);
    const momentum = this.momentumEngine.calculateMomentum(snapshots);
    const acceleration = this.accelerationEngine.calculateAcceleration(snapshots);
    const persistence = this.persistenceEngine.calculatePersistence(snapshots);

    if (!detection || !momentum) {
      return null;
    }

    // Run domain-specific analysis
    const metrics: Record<string, TrendAnalysis> = {};

    if (entityType === 'career' && this.config.enableCareerTrends) {
      const careerAnalysis = this.careerEngine.analyzeCareer(snapshots, entityId);
      if (careerAnalysis) {
        Object.assign(metrics, careerAnalysis.metrics);
      }
    }

    // Calculate confidence
    const confidence = Math.round(
      (detection.confidence + momentum.confidence + (acceleration?.confidence ?? 50) + (persistence?.confidence ?? 50)) / 4
    );

    // Generate summary
    const summary = this.generateSummary(
      entityType,
      entityId,
      detection,
      momentum,
      acceleration,
      persistence
    );

    // Generate insights
    const insights = this.generateInsights(detection, momentum, acceleration, persistence);

    // Identify risk flags
    const riskFlags = this.identifyRiskFlags(detection, momentum, persistence);

    // Generate recommendations
    const recommendations = this.generateRecommendations(detection, momentum, persistence);

    return {
      entityId,
      entityType,
      analyzedAt: new Date(),
      classification: detection.classification,
      direction: detection.direction,
      strength: detection.strength,
      momentum: momentum.score,
      acceleration: acceleration?.score ?? 0,
      persistence: persistence?.score ?? 50,
      confidence,
      summary,
      insights,
      riskFlags,
      recommendations,
      metrics,
      evidence: snapshots.slice(-3).map((s) => ({
        type: 'snapshot',
        value: s.value.toString(),
        confidence: s.confidence,
      })),
    };
  }

  /**
   * Analyze trends for multiple entities.
   */
  analyzeTrends(
    entityType: 'career' | 'skill' | 'industry' | 'region',
    entityIds: string[]
  ): Map<string, UnifiedTrendAnalysis | null> {
    const results = new Map<string, UnifiedTrendAnalysis | null>();

    for (const entityId of entityIds) {
      const analysis = this.analyzeTrend(entityType, entityId);
      results.set(entityId, analysis);
    }

    return results;
  }

  /**
   * Get market trend summary.
   */
  getMarketSummary(
    entityTypes: Array<'career' | 'skill' | 'industry' | 'region'> = ['career', 'skill', 'industry', 'region']
  ): MarketTrendSummary {
    const allAnalyses: UnifiedTrendAnalysis[] = [];

    // Collect all analyses
    for (const entityType of entityTypes) {
      const entityIds = this.getEntityIds(entityType);
      const analyses = this.analyzeTrends(entityType, entityIds);

      for (const analysis of analyses.values()) {
        if (analysis) {
          allAnalyses.push(analysis);
        }
      }
    }

    // Calculate distribution
    const distribution = {
      rapidGrowth: 0,
      growth: 0,
      stable: 0,
      declining: 0,
      rapidDecline: 0,
      volatile: 0,
      emerging: 0,
    };

    for (const analysis of allAnalyses) {
      switch (analysis.classification) {
        case TrendClassification.RAPID_GROWTH:
          distribution.rapidGrowth++;
          break;
        case TrendClassification.GROWTH:
          distribution.growth++;
          break;
        case TrendClassification.STABLE:
          distribution.stable++;
          break;
        case TrendClassification.DECLINING:
          distribution.declining++;
          break;
        case TrendClassification.RAPID_DECLINE:
          distribution.rapidDecline++;
          break;
        case TrendClassification.VOLATILE:
          distribution.volatile++;
          break;
        case TrendClassification.EMERGING:
          distribution.emerging++;
          break;
      }
    }

    // Find top rising
    const rising = allAnalyses
      .filter((a) => a.direction === 'up' && a.strength >= 50)
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 10)
      .map((a) => ({
        entityId: a.entityId,
        entityType: a.entityType,
        strength: a.strength,
        momentum: a.momentum,
      }));

    // Find top declining
    const declining = allAnalyses
      .filter((a) => a.direction === 'down' && a.strength >= 30)
      .sort((a, b) => a.momentum - b.momentum)
      .slice(0, 10)
      .map((a) => ({
        entityId: a.entityId,
        entityType: a.entityType,
        strength: a.strength,
        momentum: a.momentum,
      }));

    // Calculate market momentum
    const marketMomentum = this.calculateMarketMomentum(allAnalyses);

    // Generate insights
    const insights = this.generateMarketInsights(distribution, rising, declining);

    return {
      analyzedAt: new Date(),
      totalEntities: allAnalyses.length,
      distribution,
      topRising: rising,
      topDeclining: declining,
      marketMomentum,
      insights,
    };
  }

  /**
   * Compare trends between two entities.
   */
  compareTrends(
    entityA: { type: 'career' | 'skill' | 'industry' | 'region'; id: string },
    entityB: { type: 'career' | 'skill' | 'industry' | 'region'; id: string }
  ): {
    entityA: UnifiedTrendAnalysis | null;
    entityB: UnifiedTrendAnalysis | null;
    comparison: {
      winner: 'a' | 'b' | 'tie';
      difference: number;
      reasoning: string;
    };
  } | null {
    const analysisA = this.analyzeTrend(entityA.type, entityA.id);
    const analysisB = this.analyzeTrend(entityB.type, entityB.id);

    if (!analysisA || !analysisB) return null;

    // Compare momentum
    const momentumDiff = analysisB.momentum - analysisA.momentum;
    const strengthDiff = analysisB.strength - analysisA.strength;
    const persistenceDiff = analysisB.persistence - analysisA.persistence;

    // Weighted comparison
    const overallDiff = momentumDiff * 0.4 + strengthDiff * 0.3 + persistenceDiff * 0.3;

    let winner: 'a' | 'b' | 'tie';
    if (Math.abs(overallDiff) < 15) winner = 'tie';
    else winner = overallDiff > 0 ? 'b' : 'a';

    const reasoning = this.generateComparisonReasoning(analysisA, analysisB, winner);

    return {
      entityA: analysisA,
      entityB: analysisB,
      comparison: {
        winner,
        difference: Math.round(overallDiff),
        reasoning,
      },
    };
  }

  /**
   * Get trend history for entity.
   */
  getTrendHistory(
    entityType: string,
    entityId: string,
    metricType: string
  ): TrendHistory | null {
    const key = `${entityType}:${entityId}:${metricType}`;
    return this.history.get(key) ?? null;
  }

  /**
   * Store trend history.
   */
  storeTrendHistory(history: TrendHistory): void {
    const key = `${history.entityType}:${history.entityId}:${history.metricType}`;
    this.history.set(key, history);
  }

  /**
   * Get entity IDs from storage.
   */
  private getEntityIds(entityType: string): string[] {
    const ids = new Set<string>();

    for (const key of this.snapshots.keys()) {
      if (key.startsWith(`${entityType}:`)) {
        const parts = key.split(':');
        if (parts.length >= 2) {
          ids.add(parts[1]!);
        }
      }
    }

    return Array.from(ids);
  }

  /**
   * Generate summary.
   */
  private generateSummary(
    entityType: string,
    entityId: string,
    detection: { classification: TrendClassification; direction: string; strength: number; percentageChange: number },
    momentum: { score: number; level: string },
    acceleration: { score: number; level: string } | null,
    persistence: { score: number; level: string } | null
  ): string {
    const parts: string[] = [];

    parts.push(`${entityType} ${entityId}:`);
    parts.push(`${detection.classification.replace(/_/g, ' ').toLowerCase()}`);
    parts.push(`(${detection.strength}/100 strength)`);

    if (detection.percentageChange !== 0) {
      parts.push(`${detection.percentageChange > 0 ? '+' : ''}${detection.percentageChange}% change`);
    }

    parts.push(`${momentum.level} momentum (${momentum.score}/100)`);

    if (acceleration) {
      const accelText = acceleration.score > 0 ? 'accelerating' : acceleration.score < 0 ? 'decelerating' : 'stable';
      parts.push(`${accelText} (${acceleration.score > 0 ? '+' : ''}${acceleration.score})`);
    }

    if (persistence) {
      parts.push(`${persistence.level.replace(/_/g, ' ')} persistence (${persistence.score}/100)`);
    }

    return parts.join(' | ');
  }

  /**
   * Generate insights.
   */
  private generateInsights(
    detection: { classification: TrendClassification; direction: string },
    momentum: { score: number; level: string },
    acceleration: { score: number } | null,
    persistence: { score: number } | null
  ): string[] {
    const insights: string[] = [];

    if (detection.classification === TrendClassification.RAPID_GROWTH) {
      insights.push('Exceptional growth trend detected');
    } else if (detection.classification === TrendClassification.GROWTH) {
      insights.push('Positive growth trend');
    } else if (detection.classification === TrendClassification.DECLINING) {
      insights.push('Declining trend observed');
    }

    if (momentum.score >= 70) {
      insights.push('High momentum indicates strong trend');
    }

    if (acceleration && acceleration.score > 20) {
      insights.push('Trend is accelerating');
    } else if (acceleration && acceleration.score < -20) {
      insights.push('Trend is decelerating');
    }

    if (persistence && persistence.score >= 70) {
      insights.push('Trend appears durable');
    }

    return insights;
  }

  /**
   * Identify risk flags.
   */
  private identifyRiskFlags(
    detection: { classification: TrendClassification },
    momentum: { score: number },
    persistence: { score: number } | null
  ): string[] {
    const flags: string[] = [];

    if (detection.classification === TrendClassification.RAPID_DECLINE) {
      flags.push('rapid-decline');
    }

    if (detection.classification === TrendClassification.VOLATILE) {
      flags.push('high-volatility');
    }

    if (momentum.score >= 80 && persistence && persistence.score < 40) {
      flags.push('high-momentum-low-persistence');
    }

    return flags;
  }

  /**
   * Generate recommendations.
   */
  private generateRecommendations(
    detection: { classification: TrendClassification; direction: string },
    momentum: { score: number },
    persistence: { score: number } | null
  ): string[] {
    const recommendations: string[] = [];

    if (detection.classification === TrendClassification.RAPID_GROWTH && momentum.score >= 70) {
      recommendations.push('Consider entering market quickly');
    }

    if (detection.classification === TrendClassification.DECLINING) {
      recommendations.push('Monitor for further deterioration');
    }

    if (persistence && persistence.score < 40) {
      recommendations.push('Wait for trend to stabilize');
    }

    return recommendations;
  }

  /**
   * Calculate market momentum.
   */
  private calculateMarketMomentum(
    analyses: UnifiedTrendAnalysis[]
  ): MarketTrendSummary['marketMomentum'] {
    const byType: Record<string, number[]> = {
      career: [],
      skill: [],
      industry: [],
      region: [],
    };

    for (const analysis of analyses) {
      byType[analysis.entityType]?.push(analysis.momentum);
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;

    const careerMomentum = avg(byType.career);
    const skillMomentum = avg(byType.skill);
    const industryMomentum = avg(byType.industry);
    const regionMomentum = avg(byType.region);

    return {
      overall: Math.round((careerMomentum + skillMomentum + industryMomentum + regionMomentum) / 4),
      careers: careerMomentum,
      skills: skillMomentum,
      industries: industryMomentum,
      regions: regionMomentum,
    };
  }

  /**
   * Generate market insights.
   */
  private generateMarketInsights(
    distribution: MarketTrendSummary['distribution'],
    rising: MarketTrendSummary['topRising'],
    declining: MarketTrendSummary['topDeclining']
  ): string[] {
    const insights: string[] = [];

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);

    if (total > 0) {
      const growthRate = ((distribution.rapidGrowth + distribution.growth) / total) * 100;
      const declineRate = ((distribution.rapidDecline + distribution.declining) / total) * 100;

      insights.push(`${growthRate.toFixed(1)}% of entities showing growth`);
      insights.push(`${declineRate.toFixed(1)}% of entities showing decline`);
    }

    if (rising.length > 0) {
      insights.push(`${rising.length} entities with strong upward momentum`);
    }

    if (declining.length > 0) {
      insights.push(`${declining.length} entities showing decline`);
    }

    return insights;
  }

  /**
   * Generate comparison reasoning.
   */
  private generateComparisonReasoning(
    analysisA: UnifiedTrendAnalysis,
    analysisB: UnifiedTrendAnalysis,
    winner: 'a' | 'b' | 'tie'
  ): string {
    if (winner === 'tie') {
      return 'Both entities show similar trend patterns';
    }

    const winnerAnalysis = winner === 'a' ? analysisA : analysisB;
    const loserAnalysis = winner === 'a' ? analysisB : analysisA;

    const reasons: string[] = [];

    if (winnerAnalysis.momentum > loserAnalysis.momentum + 10) {
      reasons.push('higher momentum');
    }

    if (winnerAnalysis.strength > loserAnalysis.strength + 10) {
      reasons.push('stronger trend');
    }

    if (winnerAnalysis.persistence > loserAnalysis.persistence + 10) {
      reasons.push('more durable trend');
    }

    if (reasons.length === 0) {
      return 'Better overall trend metrics';
    }

    return reasons.join(', ');
  }

  /**
   * Get rising careers.
   */
  getRisingCareers(threshold: number = 60): string[] {
    const careerIds = this.getEntityIds('career');
    const rising: string[] = [];

    for (const careerId of careerIds) {
      const analysis = this.analyzeTrend('career', careerId);
      if (analysis && analysis.direction === 'up' && analysis.momentum >= threshold) {
        rising.push(careerId);
      }
    }

    return rising;
  }

  /**
   * Get declining careers.
   */
  getDecliningCareers(threshold: number = 40): string[] {
    const careerIds = this.getEntityIds('career');
    const declining: string[] = [];

    for (const careerId of careerIds) {
      const analysis = this.analyzeTrend('career', careerId);
      if (analysis && analysis.direction === 'down' && analysis.strength >= threshold) {
        declining.push(careerId);
      }
    }

    return declining;
  }

  /**
   * Get emerging skills.
   */
  getEmergingSkills(threshold: number = 70): string[] {
    const skillIds = this.getEntityIds('skill');
    const emerging: string[] = [];

    for (const skillId of skillIds) {
      const analysis = this.analyzeTrend('skill', skillId);
      if (analysis && analysis.classification === TrendClassification.EMERGING) {
        emerging.push(skillId);
      }
    }

    return emerging;
  }

  /**
   * Get attractive regions.
   */
  getAttractiveRegions(threshold: number = 60): string[] {
    const regionIds = this.getEntityIds('region');
    const attractive: string[] = [];

    for (const regionId of regionIds) {
      const analysis = this.analyzeTrend('region', regionId);
      if (analysis && analysis.direction === 'up' && analysis.momentum >= threshold) {
        attractive.push(regionId);
      }
    }

    return attractive;
  }
}

/**
 * Factory function for MarketTrendEngine.
 */
export function createMarketTrendEngine(
  config?: Partial<MarketTrendEngineConfig>
): MarketTrendEngine {
  return new MarketTrendEngine(config);
}
