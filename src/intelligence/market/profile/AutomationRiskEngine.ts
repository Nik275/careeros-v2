/**
 * CareerOS Market Intelligence - Automation Risk Engine
 *
 * Estimates disruption risk from automation (0-100).
 *
 * Inputs:
 * - AI substitution exposure
 * - automation exposure
 * - task repeatability
 *
 * Output: Automation Risk Score (0-100)
 * Higher score = higher risk.
 */

import type { NormalizedMarketSignal, AggregateMarketSignal } from '../models/MarketSignal';
import type { AutomationRiskBreakdown } from './models/MarketScoreBreakdown';

/**
 * Configuration for automation risk scoring.
 */
export interface AutomationRiskConfig {
  /** Weight for routine task exposure */
  routineTaskWeight: number;

  /** Weight for AI substitution risk */
  aiSubstitutionWeight: number;

  /** Weight for cognitive task exposure */
  cognitiveTaskWeight: number;

  /** Weight for creative/social immunity */
  humanImmunityWeight: number;
}

/**
 * Default configuration.
 */
export const DEFAULT_AUTOMATION_RISK_CONFIG: AutomationRiskConfig = {
  routineTaskWeight: 0.35,
  aiSubstitutionWeight: 0.3,
  cognitiveTaskWeight: 0.2,
  humanImmunityWeight: 0.15,
};

/**
 * Automation risk metrics.
 */
export interface AutomationRiskMetrics {
  /** Routine task exposure (0-100) */
  routineTaskExposure: number;

  /** Cognitive task exposure (0-100) */
  cognitiveTaskExposure: number;

  /** Creative task requirement (0-100) */
  creativeTaskRequirement: number;

  /** Social task requirement (0-100) */
  socialTaskRequirement: number;

  /** Generative AI risk (0-100) */
  generativeAIRisk: number;

  /** Machine learning risk (0-100) */
  machineLearningRisk: number;

  /** Robotics risk (0-100) */
  roboticRisk: number;

  /** Short-term risk (0-2 years) */
  shortTermRisk: number;

  /** Medium-term risk (2-5 years) */
  mediumTermRisk: number;

  /** Long-term risk (5+ years) */
  longTermRisk: number;
}

/**
 * Calculates automation risk score for careers.
 */
export class AutomationRiskEngine {
  private config: AutomationRiskConfig;

  constructor(config?: Partial<AutomationRiskConfig>) {
    this.config = { ...DEFAULT_AUTOMATION_RISK_CONFIG, ...config };
  }

  /**
   * Calculate automation risk score from signals.
   */
  calculateScore(
    careerId: string,
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): {
    score: number;
    breakdown: AutomationRiskBreakdown;
  } {
    // Filter to automation-relevant signals
    const automationSignals = signals.filter(
      (s) => s.signalType === 'automation_risk'
    );

    // Calculate metrics
    const metrics = this.calculateMetrics(automationSignals, aggregateSignals);

    // Calculate component scores
    const routineTaskScore = this.scoreRoutineTasks(metrics);
    const aiSubstitutionScore = this.scoreAISubstitution(metrics);
    const cognitiveTaskScore = this.scoreCognitiveTasks(metrics);
    const humanImmunityScore = this.scoreHumanImmunity(metrics);

    // Weighted combination (higher = more risk)
    const baseScore =
      routineTaskScore * this.config.routineTaskWeight +
      aiSubstitutionScore * this.config.aiSubstitutionWeight +
      cognitiveTaskScore * this.config.cognitiveTaskWeight +
      (100 - humanImmunityScore) * this.config.humanImmunityWeight; // Invert immunity

    // Apply adjustments
    const { score: finalScore, adjustments } = this.applyAdjustments(baseScore, metrics);

    // Build breakdown
    const breakdown: AutomationRiskBreakdown = {
      scoreType: 'automationRisk',
      careerId,
      calculatedAt: new Date(),
      contributions: [
        {
          factor: 'routineTasks',
          weight: this.config.routineTaskWeight,
          value: routineTaskScore,
          contribution: routineTaskScore * this.config.routineTaskWeight,
          explanation: `Routine task exposure: ${metrics.routineTaskExposure.toFixed(0)}%`,
        },
        {
          factor: 'aiSubstitution',
          weight: this.config.aiSubstitutionWeight,
          value: aiSubstitutionScore,
          contribution: aiSubstitutionScore * this.config.aiSubstitutionWeight,
          explanation: `AI substitution risk: ${metrics.generativeAIRisk.toFixed(0)}%`,
        },
        {
          factor: 'cognitiveTasks',
          weight: this.config.cognitiveTaskWeight,
          value: cognitiveTaskScore,
          contribution: cognitiveTaskScore * this.config.cognitiveTaskWeight,
          explanation: `Cognitive task exposure: ${metrics.cognitiveTaskExposure.toFixed(0)}%`,
        },
        {
          factor: 'humanImmunity',
          weight: this.config.humanImmunityWeight,
          value: humanImmunityScore,
          contribution: (100 - humanImmunityScore) * this.config.humanImmunityWeight,
          explanation: `Human immunity: ${humanImmunityScore.toFixed(0)}%`,
        },
      ],
      adjustments,
      formula: 'Weighted sum of routine, AI, cognitive exposure minus human immunity',
      baseScore,
      finalScore,
      confidence: this.calculateConfidence(automationSignals),
      evidence: automationSignals.slice(0, 5).map((s) => ({
        source: s.source,
        value: s.normalizedStrength,
        timestamp: s.timestamp,
        impact: s.confidence / 100,
      })),
      taskAutomation: {
        routineTasks: metrics.routineTaskExposure,
        cognitiveTasks: metrics.cognitiveTaskExposure,
        creativeTasks: metrics.creativeTaskRequirement,
        socialTasks: metrics.socialTaskRequirement,
      },
      aiSubstitution: {
        generativeAIRisk: metrics.generativeAIRisk,
        machineLearningRisk: metrics.machineLearningRisk,
        roboticRisk: metrics.roboticRisk,
      },
      timeline: {
        shortTermRisk: metrics.shortTermRisk,
        mediumTermRisk: metrics.mediumTermRisk,
        longTermRisk: metrics.longTermRisk,
      },
    };

    return {
      score: Math.round(finalScore),
      breakdown,
    };
  }

  /**
   * Calculate automation risk metrics from signals.
   */
  private calculateMetrics(
    signals: NormalizedMarketSignal[],
    aggregateSignals: AggregateMarketSignal[]
  ): AutomationRiskMetrics {
    // Base metrics from signals
    const avgStrength =
      signals.length > 0
        ? signals.reduce((sum, s) => sum + s.normalizedStrength, 0) / signals.length
        : 50;

    // Use aggregate signals for career-specific task profiles
    const careerAggregate = aggregateSignals.filter(
      (s) => s.signalType === 'automation_risk'
    );

    // Task exposure (inverted from signal - high signal = high human requirement = low exposure)
    const routineTaskExposure = Math.max(0, 100 - avgStrength * 0.8);
    const cognitiveTaskExposure = Math.max(0, 100 - avgStrength * 0.6);

    // Creative and social requirements (immunity factors)
    const creativeTaskRequirement = avgStrength * 0.7;
    const socialTaskRequirement = avgStrength * 0.8;

    // AI risks
    const generativeAIRisk = Math.max(0, routineTaskExposure * 0.9 - creativeTaskRequirement * 0.3);
    const machineLearningRisk = Math.max(0, cognitiveTaskExposure * 0.7 - socialTaskRequirement * 0.2);
    const roboticRisk = routineTaskExposure * 0.6;

    // Timeline projections
    const shortTermRisk = generativeAIRisk * 0.6; // Generative AI immediate impact
    const mediumTermRisk = (generativeAIRisk + machineLearningRisk) / 2;
    const longTermRisk = Math.max(generativeAIRisk, machineLearningRisk, roboticRisk);

    return {
      routineTaskExposure,
      cognitiveTaskExposure,
      creativeTaskRequirement,
      socialTaskRequirement,
      generativeAIRisk,
      machineLearningRisk,
      roboticRisk,
      shortTermRisk,
      mediumTermRisk,
      longTermRisk,
    };
  }

  /**
   * Score routine task exposure.
   */
  private scoreRoutineTasks(metrics: AutomationRiskMetrics): number {
    return metrics.routineTaskExposure;
  }

  /**
   * Score AI substitution risk.
   */
  private scoreAISubstitution(metrics: AutomationRiskMetrics): number {
    return (metrics.generativeAIRisk + metrics.machineLearningRisk) / 2;
  }

  /**
   * Score cognitive task exposure.
   */
  private scoreCognitiveTasks(metrics: AutomationRiskMetrics): number {
    return metrics.cognitiveTaskExposure;
  }

  /**
   * Score human immunity (protective factors).
   */
  private scoreHumanImmunity(metrics: AutomationRiskMetrics): number {
    // Higher creativity and social requirements = more immune
    const immunity =
      metrics.creativeTaskRequirement * 0.5 +
      metrics.socialTaskRequirement * 0.5;
    return Math.min(100, immunity);
  }

  /**
   * Apply adjustments to base score.
   */
  private applyAdjustments(
    baseScore: number,
    metrics: AutomationRiskMetrics
  ): { score: number; adjustments: AutomationRiskBreakdown['adjustments'] } {
    const adjustments: AutomationRiskBreakdown['adjustments'] = [];
    let score = baseScore;

    // Increase risk for very high routine exposure
    if (metrics.routineTaskExposure >= 80) {
      const penalty = 5;
      score += penalty;
      adjustments.push({
        type: 'penalty',
        amount: penalty,
        reason: 'High routine task exposure',
      });
    }

    // Decrease risk for strong creative/social requirements
    if (metrics.creativeTaskRequirement >= 70 && metrics.socialTaskRequirement >= 70) {
      const bonus = -10;
      score += bonus;
      adjustments.push({
        type: 'bonus',
        amount: bonus,
        reason: 'Strong creative and social requirements',
      });
    }

    return { score: Math.max(0, Math.min(100, score)), adjustments };
  }

  /**
   * Calculate confidence in automation risk score.
   */
  private calculateConfidence(signals: NormalizedMarketSignal[]): number {
    if (signals.length === 0) {
      // Use default confidence for careers without direct automation signals
      return 60;
    }

    const signalConfidence = Math.min(100, signals.length * 20);
    const avgSignalConfidence =
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
    const sources = new Set(signals.map((s) => s.source)).size;
    const sourceConfidence = Math.min(100, sources * 25);

    return Math.round((signalConfidence + avgSignalConfidence + sourceConfidence) / 3);
  }

  /**
   * Assess risk level from score.
   */
  getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (score < 25) return 'low';
    if (score < 50) return 'moderate';
    if (score < 75) return 'high';
    return 'critical';
  }

  /**
   * Get risk timeline assessment.
   */
  getTimelineRisk(metrics: AutomationRiskMetrics): {
    shortTerm: 'low' | 'moderate' | 'high';
    mediumTerm: 'low' | 'moderate' | 'high';
    longTerm: 'low' | 'moderate' | 'high';
  } {
    return {
      shortTerm: metrics.shortTermRisk < 33 ? 'low' : metrics.shortTermRisk < 66 ? 'moderate' : 'high',
      mediumTerm: metrics.mediumTermRisk < 33 ? 'low' : metrics.mediumTermRisk < 66 ? 'moderate' : 'high',
      longTerm: metrics.longTermRisk < 33 ? 'low' : metrics.longTermRisk < 66 ? 'moderate' : 'high',
    };
  }
}

/**
 * Factory function for AutomationRiskEngine.
 */
export function createAutomationRiskEngine(
  config?: Partial<AutomationRiskConfig>
): AutomationRiskEngine {
  return new AutomationRiskEngine(config);
}
