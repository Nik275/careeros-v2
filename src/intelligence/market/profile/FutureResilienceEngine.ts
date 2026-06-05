/**
 * CareerOS Market Intelligence - Future Resilience Engine
 *
 * Measures long-term survivability (0-100).
 *
 * Inputs:
 * - skill adaptability
 * - industry resilience
 * - human dependency
 * - AI resistance
 *
 * Output: Future Resilience Score (0-100)
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { ResilienceScoreBreakdown } from './models/MarketScoreBreakdown';

/**
 * Configuration for future resilience scoring.
 */
export interface FutureResilienceConfig {
  /** Weight for skill adaptability */
  adaptabilityWeight: number;

  /** Weight for industry resilience */
  industryResilienceWeight: number;

  /** Weight for human dependency */
  humanDependencyWeight: number;

  /** Weight for AI resistance */
  aiResistanceWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_FUTURE_RESILIENCE_CONFIG: FutureResilienceConfig = {
  adaptabilityWeight: 0.3,
  industryResilienceWeight: 0.25,
  humanDependencyWeight: 0.25,
  aiResistanceWeight: 0.2,
};

/**
 * Resilience metrics.
 */
export interface FutureResilienceMetrics {
  /** Transferable skills score (0-100) */
  transferableSkills: number;

  /** Upskilling potential (0-100) */
  upskillingPotential: number;

  /** Cross-industry mobility (0-100) */
  crossIndustryMobility: number;

  /** Industry stability (0-100) */
  industryStability: number;

  /** Economic cycle resistance (0-100) */
  economicCycleResistance: number;

  /** Global competition resistance (0-100) */
  globalCompetitionResistance: number;

  /** Empathy requirement (0-100) */
  empathyRequired: number;

  /** Creativity requirement (0-100) */
  creativityRequired: number;

  /** Complex decision making (0-100) */
  complexDecisionMaking: number;

  /** AI resistance score (0-100) */
  aiResistance: number;
}

/**
 * Calculates future resilience score for careers.
 */
export class FutureResilienceEngine {
  private config: FutureResilienceConfig;

  constructor(config?: Partial<FutureResilienceConfig>) {
    this.config = { ...DEFAULT_FUTURE_RESILIENCE_CONFIG, ...config };
  }

  /**
   * Calculate future resilience score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: ResilienceScoreBreakdown;
  } {
    // Filter to resilience-relevant signals
    const resilienceSignals = signals.filter(
      (s) =>
        s.signalType === 'skill_growth' ||
        s.signalType === 'automation_risk' ||
        s.signalType === 'job_postings'
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(resilienceSignals, aggregateSignals);

    // Calculate component scores
    const adaptabilityScore = this.scoreAdaptability(metrics);
    const industryScore = this.scoreIndustryResilience(metrics);
    const humanDependencyScore = this.scoreHumanDependency(metrics);
    const aiResistanceScore = this.scoreAIResistance(metrics);

    // Weighted combination
    const baseScore =
      adaptabilityScore * this.config.adaptabilityWeight +
      industryScore * this.config.industryResilienceWeight +
      humanDependencyScore * this.config.humanDependencyWeight +
      aiResistanceScore * this.config.aiResistanceWeight;

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build breakdown
    const breakdown: ResilienceScoreBreakdown = {
      scoreType: 'resilience',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'skillAdaptability',
          weight: this.config.adaptabilityWeight,
          value: adaptabilityScore,
          contribution: adaptabilityScore * this.config.adaptabilityWeight,
          explanation: `Transferable skills: ${metrics.transferableSkills.toFixed(0)}%`,
        },
        {
          factor: 'industryResilience',
          weight: this.config.industryResilienceWeight,
          value: industryScore,
          contribution: industryScore * this.config.industryResilienceWeight,
          explanation: `Industry stability: ${metrics.industryStability.toFixed(0)}%`,
        },
        {
          factor: 'humanDependency',
          weight: this.config.humanDependencyWeight,
          value: humanDependencyScore,
          contribution: humanDependencyScore * this.config.humanDependencyWeight,
          explanation: `Human-essential tasks: ${metrics.empathyRequired.toFixed(0)}%`,
        },
        {
          factor: 'aiResistance',
          weight: this.config.aiResistanceWeight,
          value: aiResistanceScore,
          contribution: aiResistanceScore * this.config.aiResistanceWeight,
          explanation: `AI resistance: ${metrics.aiResistance.toFixed(0)}%`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of adaptability, industry, human factors, and AI resistance',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(resilienceSignals),
      evidence: resilienceSignals.slice(0, 5).map((s) => ({
        source: s.source,
        value: s.normalizedStrength,
        timestamp: s.timestamp,
        impact: s.confidence / 100,
      })),
      skillAdaptability: {
        transferableSkills: metrics.transferableSkills,
        upskillingPotential: metrics.upskillingPotential,
        crossIndustryMobility: metrics.crossIndustryMobility,
      },
      industryResilience: {
        industryStability: metrics.industryStability,
        economicCycleResistance: metrics.economicCycleResistance,
        globalCompetitionResistance: metrics.globalCompetitionResistance,
      },
      humanDependency: {
        empathyRequired: metrics.empathyRequired,
        creativityRequired: metrics.creativityRequired,
        complexDecisionMaking: metrics.complexDecisionMaking,
      },
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate resilience metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): FutureResilienceMetrics {
    // Skill signals for adaptability
    const skillSignals = signals.filter((s) => s.signalType === 'skill_growth');
    const avgSkillStrength =
      skillSignals.length > 0
        ? skillSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / skillSignals.length
        : 50;

    // Automation signals for human dependency and AI resistance
    const automationSignals = signals.filter((s) => s.signalType === 'automation_risk');
    const avgAutomationRisk =
      automationSignals.length > 0
        ? automationSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / automationSignals.length
        : 50;

    // Job signals for industry trends
    const jobSignals = signals.filter((s) => s.signalType === 'job_postings');
    const avgJobTrend =
      jobSignals.length > 0
        ? jobSignals.reduce((sum, s) => sum + s.normalizedStrength, 0) / jobSignals.length
        : 50;

    // Skill adaptability (higher skill strength = more adaptable)
    const transferableSkills = avgSkillStrength * 0.8 + 10;
    const upskillingPotential = avgSkillStrength * 0.9;
    const crossIndustryMobility = avgSkillStrength * 0.7 + 15;

    // Industry resilience from job trends
    const industryStability = Math.max(30, Math.min(95, avgJobTrend));
    const economicCycleResistance = 100 - Math.abs(avgJobTrend - 50) * 0.8;
    const globalCompetitionResistance = avgSkillStrength * 0.8;

    // Human dependency (inverse of automation risk)
    const empathyRequired = 100 - avgAutomationRisk * 0.3;
    const creativityRequired = 100 - avgAutomationRisk * 0.4;
    const complexDecisionMaking = 100 - avgAutomationRisk * 0.5;

    // AI resistance
    const aiResistance = 100 - avgAutomationRisk;

    return {
      transferableSkills,
      upskillingPotential,
      crossIndustryMobility,
      industryStability,
      economicCycleResistance,
      globalCompetitionResistance,
      empathyRequired,
      creativityRequired,
      complexDecisionMaking,
      aiResistance,
    };
  }

  /**
   * Score skill adaptability component.
   */
  private scoreAdaptability(metrics: FutureResilienceMetrics): number {
    return (
      metrics.transferableSkills * 0.4 +
      metrics.upskillingPotential * 0.35 +
      metrics.crossIndustryMobility * 0.25
    );
  }

  /**
   * Score industry resilience component.
   */
  private scoreIndustryResilience(metrics: FutureResilienceMetrics): number {
    return (
      metrics.industryStability * 0.4 +
      metrics.economicCycleResistance * 0.35 +
      metrics.globalCompetitionResistance * 0.25
    );
  }

  /**
   * Score human dependency component.
   */
  private scoreHumanDependency(metrics: FutureResilienceMetrics): number {
    return (
      metrics.empathyRequired * 0.4 +
      metrics.creativityRequired * 0.35 +
      metrics.complexDecisionMaking * 0.25
    );
  }

  /**
   * Score AI resistance component.
   */
  private scoreAIResistance(metrics: FutureResilienceMetrics): number {
    return metrics.aiResistance;
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: FutureResilienceMetrics
  ): { score: number; adjustments: ResilienceScoreBreakdown['adjustments'] } {
    const adjustments: ResilienceScoreBreakdown['adjustments'] = [];
    let score = baseScore;

    // Bonus for high skill adaptability
    if (metrics.transferableSkills >= 80 && metrics.crossIndustryMobility >= 70) {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Strong skill adaptability and mobility',
      });
    }

    // Bonus for human-essential requirements
    if (metrics.empathyRequired >= 70 && metrics.creativityRequired >= 70) {
      const bonus = 5;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Strong human-essential requirements',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in resilience score.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) {
      // Lower default confidence without signals
      return 50;
    }

    const signalConfidence = Math.min(100, signals.length * 15);
    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const sources = new Set(signals.map((s) => s.source)).size;
    const sourceConfidence = Math.min(100, sources * 25);

    return Math.round((signalConfidence + avgSignalConfidence + sourceConfidence) / 3);
  }

  /**
   * Get resilience assessment.
   */
  getResilienceLevel(score: number): 'fragile' | 'vulnerable' | 'stable' | 'resilient' | 'antifragile' {
    if (score < 30) return 'fragile';
    if (score < 50) return 'vulnerable';
    if (score < 70) return 'stable';
    if (score < 85) return 'resilient';
    return 'antifragile';
  }

  /**
   * Get career longevity projection.
   */
  getLongevityProjection(score: number): {
    estimatedYears: number;
    confidence: 'low' | 'medium' | 'high';
  } {
    if (score >= 80) return { estimatedYears: 15, confidence: 'high' };
    if (score >= 65) return { estimatedYears: 10, confidence: 'medium' };
    if (score >= 45) return { estimatedYears: 7, confidence: 'medium' };
    return { estimatedYears: 5, confidence: 'low' };
  }
}

/**
 * Factory function for FutureResilienceEngine.
 */
export function createFutureResilienceEngine(
  config?: Partial<FutureResilienceConfig>
): FutureResilienceEngine {
  return new FutureResilienceEngine(config);
}
