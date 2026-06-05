/**
 * Market Intelligence Engine
 *
 * Main orchestrator that transforms raw market signals into
 * actionable market intelligence.
 *
 * ## Inputs
 *   - Market Signals (from ingestion pipeline)
 *   - Career Market Profiles
 *   - Skill Market Profiles
 *   - Industry Market Profiles
 *   - Region Market Profiles
 *
 * ## Outputs
 *   - MarketTrend
 *   - MarketOpportunity
 *   - MarketRisk[]
 *   - MarketMomentum
 *   - EmergingCareer (optional)
 *   - MarketNarrative
 *   - MarketIntelligenceReport (comprehensive)
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                 MarketIntelligenceEngine                     │
 * │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐  │
 * │  │  Trend    │ │ Opportunity│ │   Risk    │ │  Momentum   │  │
 * │  │ Detection │ │  Scoring  │ │  Engine   │ │   Engine    │  │
 * │  └───────────┘ └───────────┘ └───────────┘ └─────────────┘  │
 * │  ┌───────────┐ ┌───────────┐                                 │
 * │  │ Emerging  │ │ Narrative │                                 │
 * │  │  Career   │ │  Engine   │                                 │
 * │  │ Detector  │ │           │                                 │
 * │  └───────────┘ └───────────┘                                 │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Design Principles
 *   - Deterministic calculations
 *   - Explainable outputs
 *   - Compatible with Knowledge Graph
 *   - Compatible with Decision Intelligence Engine
 *   - Compatible with Future Simulation Engine
 *   - Compatible with Outcome Learning Architecture
 */

import type {
  MarketIntelligenceReport,
  MarketTrend,
  MarketOpportunity,
  MarketRisk,
  MarketMomentum,
  EmergingCareer,
  MarketNarrative,
  CareerMarketProfile,
  SkillMarketProfile,
  IndustryMarketProfile,
  RegionMarketProfile,
  IntelligenceEngineConfig,
  TimeSeriesPoint,
  EntityId,
  NormalizedEntityType,
  AggregatedMarketSignal,
} from './types.js';

import { DEFAULT_INTELLIGENCE_ENGINE_CONFIG } from './types.js';

import { TrendDetectionEngine } from './TrendDetectionEngine.js';
import { OpportunityScoringEngine } from './OpportunityScoringEngine.js';
import { MarketRiskEngine } from './MarketRiskEngine.js';
import { MarketMomentumEngine } from './MarketMomentumEngine.js';
import { EmergingCareerDetector } from './EmergingCareerDetector.js';
import { MarketNarrativeEngine } from './MarketNarrativeEngine.js';

// ============================================================================
// MARKET INTELLIGENCE ENGINE
// ============================================================================

export class MarketIntelligenceEngine {
  private config: IntelligenceEngineConfig;

  // Sub-engines
  private trendEngine: TrendDetectionEngine;
  private opportunityEngine: OpportunityScoringEngine;
  private riskEngine: MarketRiskEngine;
  private momentumEngine: MarketMomentumEngine;
  private emergingDetector: EmergingCareerDetector;
  private narrativeEngine: MarketNarrativeEngine;

  // Cache
  private reportCache: Map<string, MarketIntelligenceReport> = new Map();

  constructor(config: Partial<IntelligenceEngineConfig> = {}) {
    this.config = { ...DEFAULT_INTELLIGENCE_ENGINE_CONFIG, ...config };

    // Initialize sub-engines
    this.trendEngine = new TrendDetectionEngine(this.config.trendDetection);
    this.opportunityEngine = new OpportunityScoringEngine(this.config.opportunityScoring);
    this.riskEngine = new MarketRiskEngine(this.config.riskEngine);
    this.momentumEngine = new MarketMomentumEngine(this.config.momentum);
    this.emergingDetector = new EmergingCareerDetector(this.config.emergingCareer);
    this.narrativeEngine = new MarketNarrativeEngine(this.config.narrative);
  }

  // ========================================================================
  // MAIN API
  // ========================================================================

  /**
   * Generate comprehensive intelligence report for a career.
   */
  analyzeCareer(profile: CareerMarketProfile): MarketIntelligenceReport {
    return this.generateReport(
      profile.id,
      'career',
      profile.name,
      {
        demand: profile.history.demand,
        competition: profile.history.competition,
        salary: profile.history.salary,
        growth: profile.history.growth,
        automationRisk: profile.history.automationRisk,
      }
    );
  }

  /**
   * Generate comprehensive intelligence report for a skill.
   */
  analyzeSkill(profile: SkillMarketProfile): MarketIntelligenceReport {
    return this.generateReport(
      profile.id,
      'skill',
      profile.name,
      {
        demand: profile.history.demand,
        growth: profile.history.growth,
        scarcity: profile.history.scarcity,
      }
    );
  }

  /**
   * Generate comprehensive intelligence report for an industry.
   */
  analyzeIndustry(profile: IndustryMarketProfile): MarketIntelligenceReport {
    return this.generateReport(
      profile.id,
      'industry',
      profile.name,
      {
        growth: profile.history.growth,
        investment: profile.history.investment,
        hiringRate: profile.history.hiringRate,
      }
    );
  }

  /**
   * Generate comprehensive intelligence report for a region.
   */
  analyzeRegion(profile: RegionMarketProfile): MarketIntelligenceReport {
    return this.generateReport(
      profile.id,
      'region',
      profile.name,
      {
        opportunity: profile.history.opportunity,
        jobAvailability: profile.history.jobAvailability,
        salary: profile.history.salary,
      }
    );
  }

  /**
   * Generate report from raw time series data.
   */
  analyze(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    data: Record<string, TimeSeriesPoint[]>
  ): MarketIntelligenceReport {
    return this.generateReport(entityId, entityType, entityName, data);
  }

  // ========================================================================
  // COMPONENT ANALYSIS
  // ========================================================================

  /**
   * Detect trends only.
   */
  detectTrends(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    metrics: Record<string, TimeSeriesPoint[]>
  ): MarketTrend[] {
    return this.trendEngine.detectTrends(entityId, entityType, metrics);
  }

  /**
   * Calculate opportunity score only.
   */
  calculateOpportunity(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    inputs: {
      demand: TimeSeriesPoint[];
      competition: TimeSeriesPoint[];
      salaryGrowth: TimeSeriesPoint[];
      futureOutlook: TimeSeriesPoint[];
      automationRisk: TimeSeriesPoint[];
    }
  ): MarketOpportunity {
    return this.opportunityEngine.calculateOpportunity(
      entityId,
      entityType,
      entityName,
      inputs
    );
  }

  /**
   * Detect risks only.
   */
  detectRisks(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    inputs: {
      demand?: TimeSeriesPoint[];
      competition?: TimeSeriesPoint[];
      automationRisk?: TimeSeriesPoint[];
      industryGrowth?: TimeSeriesPoint[];
      salaryGrowth?: TimeSeriesPoint[];
      skillDemand?: TimeSeriesPoint[];
      regionalOpportunity?: TimeSeriesPoint[];
    }
  ): MarketRisk[] {
    return this.riskEngine.detectRisks(entityId, entityType, entityName, inputs);
  }

  /**
   * Calculate momentum only.
   */
  calculateMomentum(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    dataPoints: TimeSeriesPoint[]
  ): MarketMomentum | null {
    return this.momentumEngine.calculateMomentum(entityId, entityType, dataPoints);
  }

  /**
   * Detect emerging status only.
   */
  detectEmerging(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    dataPoints: TimeSeriesPoint[]
  ): EmergingCareer | null {
    return this.emergingDetector.detectEmerging(
      entityId,
      entityType,
      entityName,
      dataPoints
    );
  }

  /**
   * Generate narrative only.
   */
  generateNarrative(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    intelligence: {
      trend: MarketTrend;
      opportunity: MarketOpportunity;
      risks: MarketRisk[];
      momentum?: MarketMomentum;
      emergingStatus?: EmergingCareer;
    }
  ): MarketNarrative {
    return this.narrativeEngine.generateNarrative(
      entityId,
      entityType,
      entityName,
      intelligence
    );
  }

  // ========================================================================
  // BATCH OPERATIONS
  // ========================================================================

  /**
   * Analyze multiple careers.
   */
  analyzeCareers(profiles: CareerMarketProfile[]): MarketIntelligenceReport[] {
    return profiles.map(p => this.analyzeCareer(p));
  }

  /**
   * Analyze multiple skills.
   */
  analyzeSkills(profiles: SkillMarketProfile[]): MarketIntelligenceReport[] {
    return profiles.map(p => this.analyzeSkill(p));
  }

  /**
   * Compare multiple entities.
   */
  compareEntities(
    reports: MarketIntelligenceReport[]
  ): Array<{
    report: MarketIntelligenceReport;
    rank: number;
    opportunityRank: number;
    riskRank: number;
  }> {
    // Sort by overall score
    const sorted = [...reports].sort((a, b) => b.overallScore - a.overallScore);

    // Calculate ranks
    const opportunitySorted = [...reports].sort(
      (a, b) => b.opportunity.opportunityScore - a.opportunity.opportunityScore
    );
    const riskSorted = [...reports].sort(
      (a, b) => a.risks.reduce((sum, r) => sum + r.riskScore, 0) -
        b.risks.reduce((sum, r) => sum + r.riskScore, 0)
    );

    return sorted.map((report, index) => ({
      report,
      rank: index + 1,
      opportunityRank: opportunitySorted.findIndex(r => r.id === report.id) + 1,
      riskRank: riskSorted.findIndex(r => r.id === report.id) + 1,
    }));
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Generate comprehensive intelligence report.
   */
  private generateReport(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    entityName: string,
    data: Record<string, TimeSeriesPoint[]>
  ): MarketIntelligenceReport {
    // Check cache
    const cacheKey = `${entityType}:${entityId}`;
    const cached = this.reportCache.get(cacheKey);
    if (cached) {
      // Check if cache is still valid (within 1 hour)
      if (Date.now() - cached.generatedAt < 60 * 60 * 1000) {
        return cached;
      }
    }

    // Detect trends
    const trends = this.trendEngine.detectTrends(entityId, entityType, data);
    const primaryTrend = trends[0] || this.createNeutralTrend(entityId, entityType);

    // Calculate opportunity
    const opportunityInputs = this.extractOpportunityInputs(data);
    const opportunity = this.opportunityEngine.calculateOpportunity(
      entityId,
      entityType,
      entityName,
      opportunityInputs
    );

    // Detect risks
    const riskInputs = this.extractRiskInputs(data);
    const risks = this.riskEngine.detectRisks(entityId, entityType, entityName, riskInputs);

    // Calculate momentum (using primary metric)
    const primaryMetric = data.demand || data.growth || Object.values(data)[0];
    const momentum = primaryMetric
      ? this.momentumEngine.calculateMomentum(entityId, entityType, primaryMetric)
      : undefined;

    // Detect emerging status
    const emergingStatus = primaryMetric
      ? this.emergingDetector.detectEmerging(entityId, entityType, entityName, primaryMetric)
      : undefined;

    // Generate narrative
    const narrative = this.narrativeEngine.generateNarrative(entityId, entityType, entityName, {
      trend: primaryTrend,
      opportunity,
      risks,
      momentum: momentum || undefined,
      emergingStatus: emergingStatus || undefined,
    });

    // Calculate overall score
    const overallScore = this.calculateOverallScore(opportunity, risks, primaryTrend);
    const overallAssessment = this.determineOverallAssessment(overallScore, risks);

    // Calculate confidence
    const confidence = this.calculateOverallConfidence(primaryTrend, opportunity, risks);

    // Count data sources
    const dataQuality = this.calculateDataQuality(data);

    const report: MarketIntelligenceReport = {
      id: `report_${entityType}_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      entityName,
      generatedAt: Date.now(),
      trend: primaryTrend,
      opportunity,
      risks,
      momentum: momentum || undefined,
      emergingStatus: emergingStatus || undefined,
      narrative,
      overallScore,
      overallAssessment,
      confidence,
      dataQuality,
    };

    // Cache report
    this.reportCache.set(cacheKey, report);

    return report;
  }

  /**
   * Extract opportunity inputs from data.
   */
  private extractOpportunityInputs(data: Record<string, TimeSeriesPoint[]>): {
    demand: TimeSeriesPoint[];
    competition: TimeSeriesPoint[];
    salaryGrowth: TimeSeriesPoint[];
    futureOutlook: TimeSeriesPoint[];
    automationRisk: TimeSeriesPoint[];
  } {
    return {
      demand: data.demand || [],
      competition: data.competition || data.scarcity || [],
      salaryGrowth: data.salary || data.salaryGrowth || [],
      futureOutlook: data.growth || data.opportunity || data.hiringRate || [],
      automationRisk: data.automationRisk || [],
    };
  }

  /**
   * Extract risk inputs from data.
   */
  private extractRiskInputs(data: Record<string, TimeSeriesPoint[]>): {
    demand?: TimeSeriesPoint[];
    competition?: TimeSeriesPoint[];
    automationRisk?: TimeSeriesPoint[];
    industryGrowth?: TimeSeriesPoint[];
    salaryGrowth?: TimeSeriesPoint[];
    skillDemand?: TimeSeriesPoint[];
    regionalOpportunity?: TimeSeriesPoint[];
  } {
    return {
      demand: data.demand,
      competition: data.competition,
      automationRisk: data.automationRisk,
      industryGrowth: data.growth,
      salaryGrowth: data.salary || data.salaryGrowth,
      skillDemand: data.skillDemand || data.demand,
      regionalOpportunity: data.opportunity || data.regionalOpportunity,
    };
  }

  /**
   * Create neutral trend when no data available.
   */
  private createNeutralTrend(entityId: EntityId, entityType: NormalizedEntityType): MarketTrend {
    return {
      id: `trend_${entityId}_neutral`,
      entityId,
      entityType,
      trendType: 'stable',
      strength: 0.5,
      confidence: 0.3,
      explanation: ['Insufficient data for trend detection'],
      detectedAt: Date.now(),
      detectionMethod: 'linear-regression',
      timeWindow: { start: Date.now(), end: Date.now() },
      supportingData: { dataPoints: 0, slope: 0, r2Score: 0 },
    };
  }

  /**
   * Calculate overall intelligence score.
   */
  private calculateOverallScore(
    opportunity: MarketOpportunity,
    risks: MarketRisk[],
    trend: MarketTrend
  ): number {
    // Base score from opportunity (scaled to -100 to +100)
    let score = (opportunity.opportunityScore - 50) * 2;

    // Adjust for risks
    const avgRisk = risks.length > 0
      ? risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length
      : 0;
    score -= avgRisk;

    // Adjust for trend
    if (trend.trendType === 'growing' || trend.trendType === 'emerging') {
      score += trend.strength * 20;
    } else if (trend.trendType === 'declining') {
      score -= trend.strength * 20;
    }

    return Math.max(-100, Math.min(100, score));
  }

  /**
   * Determine overall assessment.
   */
  private determineOverallAssessment(
    overallScore: number,
    risks: MarketRisk[]
  ): MarketIntelligenceReport['overallAssessment'] {
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical').length;

    if (criticalRisks > 0) return 'highly-unfavorable';
    if (overallScore >= 60) return 'highly-favorable';
    if (overallScore >= 30) return 'favorable';
    if (overallScore >= -30) return 'neutral';
    if (overallScore >= -60) return 'unfavorable';
    return 'highly-unfavorable';
  }

  /**
   * Calculate overall confidence.
   */
  private calculateOverallConfidence(
    trend: MarketTrend,
    opportunity: MarketOpportunity,
    risks: MarketRisk[]
  ): number {
    const confidences: number[] = [trend.confidence, opportunity.confidence];

    if (risks.length > 0) {
      const avgRiskConfidence = risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length;
      confidences.push(avgRiskConfidence);
    }

    return confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  }

  /**
   * Calculate data quality metrics.
   */
  private calculateDataQuality(data: Record<string, TimeSeriesPoint[]>): {
    dataPoints: number;
    timeSpan: number;
    sources: number;
  } {
    let totalPoints = 0;
    let minTimestamp = Infinity;
    let maxTimestamp = 0;

    for (const points of Object.values(data)) {
      totalPoints += points.length;
      for (const point of points) {
        minTimestamp = Math.min(minTimestamp, point.timestamp);
        maxTimestamp = Math.max(maxTimestamp, point.timestamp);
      }
    }

    const timeSpanDays = maxTimestamp > minTimestamp
      ? (maxTimestamp - minTimestamp) / (24 * 60 * 60 * 1000)
      : 0;

    return {
      dataPoints: totalPoints,
      timeSpan: Math.round(timeSpanDays),
      sources: Object.keys(data).length,
    };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get cached report.
   */
  getCachedReport(entityType: NormalizedEntityType, entityId: EntityId): MarketIntelligenceReport | undefined {
    return this.reportCache.get(`${entityType}:${entityId}`);
  }

  /**
   * Clear cache.
   */
  clearCache(): void {
    this.reportCache.clear();
  }

  /**
   * Get cache size.
   */
  getCacheSize(): number {
    return this.reportCache.size;
  }

  /**
   * Get sub-engines.
   */
  getEngines(): {
    trend: TrendDetectionEngine;
    opportunity: OpportunityScoringEngine;
    risk: MarketRiskEngine;
    momentum: MarketMomentumEngine;
    emerging: EmergingCareerDetector;
    narrative: MarketNarrativeEngine;
  } {
    return {
      trend: this.trendEngine,
      opportunity: this.opportunityEngine,
      risk: this.riskEngine,
      momentum: this.momentumEngine,
      emerging: this.emergingDetector,
      narrative: this.narrativeEngine,
    };
  }

  /**
   * Get configuration.
   */
  getConfig(): IntelligenceEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration.
   */
  updateConfig(config: Partial<IntelligenceEngineConfig>): void {
    this.config = { ...this.config, ...config };

    // Reinitialize engines with new config
    this.trendEngine = new TrendDetectionEngine(this.config.trendDetection);
    this.opportunityEngine = new OpportunityScoringEngine(this.config.opportunityScoring);
    this.riskEngine = new MarketRiskEngine(this.config.riskEngine);
    this.momentumEngine = new MarketMomentumEngine(this.config.momentum);
    this.emergingDetector = new EmergingCareerDetector(this.config.emergingCareer);
    this.narrativeEngine = new MarketNarrativeEngine(this.config.narrative);
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new MarketIntelligenceEngine.
 */
export function createMarketIntelligenceEngine(
  config?: Partial<IntelligenceEngineConfig>
): MarketIntelligenceEngine {
  return new MarketIntelligenceEngine(config);
}

/**
 * Quick analyze an entity.
 */
export function quickAnalyze(
  entityId: EntityId,
  entityType: NormalizedEntityType,
  entityName: string,
  data: Record<string, TimeSeriesPoint[]>,
  config?: Partial<IntelligenceEngineConfig>
): MarketIntelligenceReport {
  const engine = new MarketIntelligenceEngine(config);
  return engine.analyze(entityId, entityType, entityName, data);
}

/**
 * Quick compare multiple entities.
 */
export function quickCompare(
  reports: MarketIntelligenceReport[]
): Array<{
  report: MarketIntelligenceReport;
  rank: number;
  opportunityRank: number;
  riskRank: number;
}> {
  const engine = new MarketIntelligenceEngine();
  return engine.compareEntities(reports);
}
