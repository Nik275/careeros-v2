/**
 * Market Risk Engine
 *
 * Detects risks:
 *   - Oversaturation
 *   - Declining Demand
 *   - High Competition
 *   - Automation Exposure
 *   - Industry Weakness
 *   - Salary Stagnation
 *   - Skill Obsolescence
 *   - Regional Decline
 *
 * ## Risk Levels
 *   - critical: Immediate concern
 *   - high: Significant concern
 *   - medium: Moderate concern
 *   - low: Minor concern
 *   - minimal: Negligible concern
 */

import type {
  MarketRisk,
  RiskType,
  RiskLevel,
  RiskEngineConfig,
  TimeSeriesPoint,
  NormalizedEntityType,
  EntityId,
} from './types.js';

import {
  DEFAULT_RISK_ENGINE_CONFIG,
  RISK_TYPE_LABELS,
  RISK_LEVEL_LABELS,
} from './types.js';

// ============================================================================
// MARKET RISK ENGINE
// ============================================================================

export class MarketRiskEngine {
  private config: RiskEngineConfig;

  constructor(config: Partial<RiskEngineConfig> = {}) {
    this.config = { ...DEFAULT_RISK_ENGINE_CONFIG, ...config };
  }

  /**
   * Detect all risks for an entity.
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
    const risks: MarketRisk[] = [];

    // Check each risk type
    if (inputs.demand) {
      const demandRisk = this.checkDecliningDemand(entityId, entityType, inputs.demand);
      if (demandRisk) risks.push(demandRisk);
    }

    if (inputs.competition) {
      const competitionRisk = this.checkHighCompetition(entityId, entityType, inputs.competition);
      if (competitionRisk) risks.push(competitionRisk);
    }

    if (inputs.automationRisk) {
      const automationRisk = this.checkAutomationExposure(entityId, entityType, inputs.automationRisk);
      if (automationRisk) risks.push(automationRisk);
    }

    if (inputs.industryGrowth) {
      const industryRisk = this.checkIndustryWeakness(entityId, entityType, inputs.industryGrowth);
      if (industryRisk) risks.push(industryRisk);
    }

    if (inputs.salaryGrowth) {
      const salaryRisk = this.checkSalaryStagnation(entityId, entityType, inputs.salaryGrowth);
      if (salaryRisk) risks.push(salaryRisk);
    }

    if (inputs.skillDemand) {
      const skillRisk = this.checkSkillObsolescence(entityId, entityType, inputs.skillDemand);
      if (skillRisk) risks.push(skillRisk);
    }

    if (inputs.regionalOpportunity) {
      const regionalRisk = this.checkRegionalDecline(entityId, entityType, inputs.regionalOpportunity);
      if (regionalRisk) risks.push(regionalRisk);
    }

    // Check for oversaturation
    if (inputs.demand && inputs.competition) {
      const oversaturationRisk = this.checkOversaturation(
        entityId,
        entityType,
        inputs.demand,
        inputs.competition
      );
      if (oversaturationRisk) risks.push(oversaturationRisk);
    }

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Check for oversaturation (low demand + high competition).
   */
  private checkOversaturation(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    demand: TimeSeriesPoint[],
    competition: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (demand.length === 0 || competition.length === 0) return null;

    const latestDemand = demand[demand.length - 1].value;
    const latestCompetition = competition[competition.length - 1].value;

    // Oversaturation ratio: low demand + high competition
    const saturationScore = latestCompetition / (latestDemand + 0.1);

    if (saturationScore < this.config.thresholds.oversaturation) {
      return null;
    }

    const riskScore = Math.min(100, saturationScore * 50);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_oversaturation_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'oversaturation',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: Math.min(demand[demand.length - 1].confidence, competition[competition.length - 1].confidence),
      indicators: [
        `Demand level: ${(latestDemand * 100).toFixed(1)}%`,
        `Competition level: ${(latestCompetition * 100).toFixed(1)}%`,
        `Saturation ratio: ${saturationScore.toFixed(2)}`,
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Low market demand', impact: (1 - latestDemand) * 100 },
        { factor: 'High competition', impact: latestCompetition * 100 },
      ],
    };
  }

  /**
   * Check for declining demand.
   */
  private checkDecliningDemand(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    demand: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (demand.length < 2) return null;

    const first = demand[0].value;
    const latest = demand[demand.length - 1].value;
    const change = (latest - first) / first;

    if (change > this.config.thresholds.decliningDemand) {
      return null;
    }

    const riskScore = Math.min(100, Math.abs(change) * 100);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_declining-demand_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'declining-demand',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: demand[demand.length - 1].confidence,
      indicators: [
        `Demand decreased ${(Math.abs(change) * 100).toFixed(1)}%`,
        `From ${(first * 100).toFixed(1)}% to ${(latest * 100).toFixed(1)}%`,
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Market demand reduction', impact: riskScore },
      ],
    };
  }

  /**
   * Check for high competition.
   */
  private checkHighCompetition(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    competition: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (competition.length === 0) return null;

    const latest = competition[competition.length - 1].value;

    if (latest < this.config.thresholds.highCompetition) {
      return null;
    }

    const riskScore = latest * 100;
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_high-competition_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'high-competition',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: competition[competition.length - 1].confidence,
      indicators: [
        `Competition level: ${(latest * 100).toFixed(1)}%`,
        'Above safe threshold',
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'High applicant-to-position ratio', impact: riskScore },
      ],
    };
  }

  /**
   * Check for automation exposure.
   */
  private checkAutomationExposure(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    automationRisk: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (automationRisk.length === 0) return null;

    const latest = automationRisk[automationRisk.length - 1].value;

    if (latest < this.config.thresholds.automationRisk) {
      return null;
    }

    const riskScore = latest * 100;
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_automation-exposure_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'automation-exposure',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: automationRisk[automationRisk.length - 1].confidence,
      indicators: [
        `Automation risk: ${(latest * 100).toFixed(1)}%`,
        'Above acceptable threshold',
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'AI/Automation vulnerability', impact: riskScore },
      ],
    };
  }

  /**
   * Check for industry weakness.
   */
  private checkIndustryWeakness(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    industryGrowth: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (industryGrowth.length < 2) return null;

    const first = industryGrowth[0].value;
    const latest = industryGrowth[industryGrowth.length - 1].value;
    const change = latest - first;

    if (change > -0.1) return null; // Not significantly declining

    const riskScore = Math.min(100, Math.abs(change) * 100);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_industry-weakness_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'industry-weakness',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: industryGrowth[industryGrowth.length - 1].confidence,
      indicators: [
        `Industry growth declined ${(Math.abs(change) * 100).toFixed(1)}%`,
        `Current growth rate: ${(latest * 100).toFixed(1)}%`,
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Industry sector weakness', impact: riskScore },
      ],
    };
  }

  /**
   * Check for salary stagnation.
   */
  private checkSalaryStagnation(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    salaryGrowth: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (salaryGrowth.length < 2) return null;

    const first = salaryGrowth[0].value;
    const latest = salaryGrowth[salaryGrowth.length - 1].value;
    const growth = (latest - first) / first;

    if (growth > 0.02) return null; // Some growth is okay

    const riskScore = Math.min(100, (0.02 - growth) * 2000);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_salary-stagnation_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'salary-stagnation',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: salaryGrowth[salaryGrowth.length - 1].confidence,
      indicators: [
        `Salary growth: ${(growth * 100).toFixed(1)}%`,
        'Below inflation rate',
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Stagnant compensation growth', impact: riskScore },
      ],
    };
  }

  /**
   * Check for skill obsolescence.
   */
  private checkSkillObsolescence(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    skillDemand: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (skillDemand.length < 2) return null;

    const first = skillDemand[0].value;
    const latest = skillDemand[skillDemand.length - 1].value;
    const change = (latest - first) / first;

    if (change > -0.15) return null;

    const riskScore = Math.min(100, Math.abs(change) * 100);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_skill-obsolescence_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'skill-obsolescence',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: skillDemand[skillDemand.length - 1].confidence,
      indicators: [
        `Skill demand declined ${(Math.abs(change) * 100).toFixed(1)}%`,
        'May be becoming obsolete',
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Declining skill relevance', impact: riskScore },
      ],
    };
  }

  /**
   * Check for regional decline.
   */
  private checkRegionalDecline(
    entityId: EntityId,
    entityType: NormalizedEntityType,
    regionalOpportunity: TimeSeriesPoint[]
  ): MarketRisk | null {
    if (regionalOpportunity.length < 2) return null;

    const first = regionalOpportunity[0].value;
    const latest = regionalOpportunity[regionalOpportunity.length - 1].value;
    const change = (latest - first) / first;

    if (change > -0.1) return null;

    const riskScore = Math.min(100, Math.abs(change) * 100);
    const riskLevel = this.scoreToLevel(riskScore);

    return {
      id: `risk_regional-decline_${entityId}_${Date.now()}`,
      entityId,
      entityType,
      riskType: 'regional-decline',
      riskLevel,
      riskScore: Math.round(riskScore),
      confidence: regionalOpportunity[regionalOpportunity.length - 1].confidence,
      indicators: [
        `Regional opportunity declined ${(Math.abs(change) * 100).toFixed(1)}%`,
        'Geographic market weakening',
      ],
      detectedAt: Date.now(),
      contributingFactors: [
        { factor: 'Regional economic decline', impact: riskScore },
      ],
    };
  }

  /**
   * Convert risk score to level.
   */
  private scoreToLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  /**
   * Get overall risk level for entity.
   */
  getOverallRiskLevel(risks: MarketRisk[]): RiskLevel {
    if (risks.length === 0) return 'minimal';

    const criticalCount = risks.filter(r => r.riskLevel === 'critical').length;
    const highCount = risks.filter(r => r.riskLevel === 'high').length;
    const avgScore = risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length;

    if (criticalCount > 0 || avgScore >= 70) return 'high';
    if (highCount > 1 || avgScore >= 50) return 'medium';
    if (avgScore >= 30) return 'low';
    return 'minimal';
  }

  /**
   * Get risk summary.
   */
  getRiskSummary(risks: MarketRisk[]): {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    averageScore: number;
    overallLevel: RiskLevel;
    topRisks: MarketRisk[];
  } {
    const sorted = [...risks].sort((a, b) => b.riskScore - a.riskScore);

    return {
      totalRisks: risks.length,
      criticalRisks: risks.filter(r => r.riskLevel === 'critical').length,
      highRisks: risks.filter(r => r.riskLevel === 'high').length,
      averageScore: risks.length > 0
        ? risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length
        : 0,
      overallLevel: this.getOverallRiskLevel(risks),
      topRisks: sorted.slice(0, 3),
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createMarketRiskEngine(
  config?: Partial<RiskEngineConfig>
): MarketRiskEngine {
  return new MarketRiskEngine(config);
}

export function quickAssessRisk(
  inputs: {
    demand?: number;
    competition?: number;
    automationRisk?: number;
  }
): { hasRisk: boolean; riskLevel: RiskLevel; riskScore: number } {
  const engine = new MarketRiskEngine();

  // Simplified risk assessment
  let riskScore = 0;

  if (inputs.demand !== undefined && inputs.demand < 0.3) {
    riskScore += 30;
  }
  if (inputs.competition !== undefined && inputs.competition > 0.7) {
    riskScore += 30;
  }
  if (inputs.automationRisk !== undefined && inputs.automationRisk > 0.6) {
    riskScore += 40;
  }

  const riskLevel = riskScore >= 60 ? 'high' :
    riskScore >= 40 ? 'medium' :
    riskScore >= 20 ? 'low' : 'minimal';

  return {
    hasRisk: riskScore > 20,
    riskLevel,
    riskScore: Math.min(100, riskScore),
  };
}
