/**
 * CareerOS Utility Intelligence Engine - Utility Breakdown Engine
 *
 * Phase D.2: Utility Intelligence Engine
 *
 * Generates detailed breakdowns of utility analysis including
 * advantages, risks, and component analysis.
 *
 * @module utility-breakdown-engine
 * @version 1.0.0
 */

import type {
  UtilityBreakdown,
  UtilityAdvantage,
  UtilityRisk,
  UtilityDimension,
  UtilityIntelligenceConfig,
} from './utility-types';
import { DEFAULT_UTILITY_INTELLIGENCE_CONFIG } from './utility-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { GeneratedProfile } from '@/profile/profile-types';

/**
 * Engine for generating utility breakdowns.
 */
export class UtilityBreakdownEngine {
  /** Configuration */
  private config: UtilityIntelligenceConfig;

  /**
   * Creates a new UtilityBreakdownEngine.
   *
   * @param config - Configuration
   */
  constructor(config: UtilityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates advantages from utility breakdown.
   *
   * @param breakdown - Utility breakdown
   * @param career - Career intelligence
   * @returns List of utility advantages
   */
  generateAdvantages(
    breakdown: UtilityBreakdown,
    career: CareerIntelligence
  ): UtilityAdvantage[] {
    const advantages: UtilityAdvantage[] = [];
    let id = 0;

    // Fulfillment advantages
    if (breakdown.fulfillment.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Strong alignment with personal strengths enables peak performance',
        dimension: 'FULFILLMENT',
        magnitude: breakdown.fulfillment.score,
        certainty: breakdown.fulfillment.confidence,
      });
    }

    if (breakdown.fulfillment.strengthAlignment.score >= 75) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Career leverages your core strengths effectively',
        dimension: 'FULFILLMENT',
        magnitude: breakdown.fulfillment.strengthAlignment.score,
        certainty: breakdown.fulfillment.strengthAlignment.confidence,
      });
    }

    if (breakdown.fulfillment.motivationAlignment.score >= 75) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Career satisfies key motivational drivers',
        dimension: 'FULFILLMENT',
        magnitude: breakdown.fulfillment.motivationAlignment.score,
        certainty: breakdown.fulfillment.motivationAlignment.confidence,
      });
    }

    // Lifestyle advantages
    if (breakdown.lifestyle.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Career supports desired lifestyle quality',
        dimension: 'LIFESTYLE',
        magnitude: breakdown.lifestyle.score,
        certainty: breakdown.lifestyle.confidence,
      });
    }

    if (breakdown.lifestyle.workLifeBalance.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Good work-life balance protects wellbeing',
        dimension: 'LIFESTYLE',
        magnitude: breakdown.lifestyle.workLifeBalance.score,
        certainty: breakdown.lifestyle.workLifeBalance.confidence,
      });
    }

    if (breakdown.lifestyle.flexibility.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Flexible arrangements support life integration',
        dimension: 'LIFESTYLE',
        magnitude: breakdown.lifestyle.flexibility.score,
        certainty: breakdown.lifestyle.flexibility.confidence,
      });
    }

    // Financial advantages
    if (breakdown.financial.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Strong financial prospects support security and goals',
        dimension: 'FINANCIAL',
        magnitude: breakdown.financial.score,
        certainty: breakdown.financial.confidence,
      });
    }

    if (breakdown.financial.incomePotential.score >= 75) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'High income potential enables wealth building',
        dimension: 'FINANCIAL',
        magnitude: breakdown.financial.incomePotential.score,
        certainty: breakdown.financial.incomePotential.confidence,
      });
    }

    if (breakdown.financial.resilience.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Economic resilience protects against market changes',
        dimension: 'FINANCIAL',
        magnitude: breakdown.financial.resilience.score,
        certainty: breakdown.financial.resilience.confidence,
      });
    }

    // Growth advantages
    if (breakdown.growth.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Rich development opportunities enable continuous growth',
        dimension: 'GROWTH',
        magnitude: breakdown.growth.score,
        certainty: breakdown.growth.confidence,
      });
    }

    if (breakdown.growth.learning.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Continuous learning keeps work engaging',
        dimension: 'GROWTH',
        magnitude: breakdown.growth.learning.score,
        certainty: breakdown.growth.learning.confidence,
      });
    }

    if (breakdown.growth.careerDevelopment.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Clear advancement path provides direction',
        dimension: 'GROWTH',
        magnitude: breakdown.growth.careerDevelopment.score,
        certainty: breakdown.growth.careerDevelopment.confidence,
      });
    }

    // Freedom advantages
    if (breakdown.freedom.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'High autonomy supports self-directed work',
        dimension: 'FREEDOM',
        magnitude: breakdown.freedom.score,
        certainty: breakdown.freedom.confidence,
      });
    }

    if (breakdown.freedom.autonomy.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Independence in work methods and decisions',
        dimension: 'FREEDOM',
        magnitude: breakdown.freedom.autonomy.score,
        certainty: breakdown.freedom.autonomy.confidence,
      });
    }

    if (breakdown.freedom.choicePreservation.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Career preserves future options and flexibility',
        dimension: 'FREEDOM',
        magnitude: breakdown.freedom.choicePreservation.score,
        certainty: breakdown.freedom.choicePreservation.confidence,
      });
    }

    // Meaning advantages
    if (breakdown.meaning.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Strong purpose and meaning potential',
        dimension: 'MEANING',
        magnitude: breakdown.meaning.score,
        certainty: breakdown.meaning.confidence,
      });
    }

    if (breakdown.meaning.purpose.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Career provides sense of purpose',
        dimension: 'MEANING',
        magnitude: breakdown.meaning.purpose.score,
        certainty: breakdown.meaning.purpose.confidence,
      });
    }

    if (breakdown.meaning.impact.score >= 70) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Opportunity to make meaningful impact',
        dimension: 'MEANING',
        magnitude: breakdown.meaning.impact.score,
        certainty: breakdown.meaning.impact.confidence,
      });
    }

    if (breakdown.meaning.valuesAlignment.score >= 75) {
      advantages.push({
        id: `adv-${++id}`,
        description: 'Strong values alignment creates authenticity',
        dimension: 'MEANING',
        magnitude: breakdown.meaning.valuesAlignment.score,
        certainty: breakdown.meaning.valuesAlignment.confidence,
      });
    }

    return advantages.sort((a, b) => b.magnitude - a.magnitude);
  }

  /**
   * Generates risks from utility breakdown and career data.
   *
   * @param breakdown - Utility breakdown
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns List of utility risks
   */
  generateRisks(
    breakdown: UtilityBreakdown,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): UtilityRisk[] {
    const risks: UtilityRisk[] = [];
    let id = 0;

    // Fulfillment risks
    if (breakdown.fulfillment.score < 50) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Low fulfillment may lead to chronic dissatisfaction',
        dimension: 'FULFILLMENT',
        probability: 70,
        severity: 75,
        riskScore: 0,
        isDealBreaker: breakdown.fulfillment.score < 35,
      });
    }

    if (breakdown.fulfillment.motivationAlignment.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Motivation mismatch may cause burnout or disengagement',
        dimension: 'FULFILLMENT',
        probability: 65,
        severity: 70,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    // Lifestyle risks
    if (breakdown.lifestyle.score < 50) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Lifestyle conflicts may affect overall wellbeing',
        dimension: 'LIFESTYLE',
        probability: 60,
        severity: 65,
        riskScore: 0,
        isDealBreaker: breakdown.lifestyle.score < 35,
      });
    }

    if (breakdown.lifestyle.workLifeBalance.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Poor work-life balance threatens health and relationships',
        dimension: 'LIFESTYLE',
        probability: 75,
        severity: 80,
        riskScore: 0,
        isDealBreaker: breakdown.lifestyle.workLifeBalance.score < 25,
      });
    }

    // Financial risks
    if (breakdown.financial.score < 50) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Financial constraints may limit life options',
        dimension: 'FINANCIAL',
        probability: 70,
        severity: 70,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    const automationRisk = career.careerRisks.automationRisk?.score ?? 0;
    if (automationRisk > 60) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Automation risk threatens long-term financial stability',
        dimension: 'FINANCIAL',
        probability: automationRisk,
        severity: 75,
        riskScore: 0,
        isDealBreaker: automationRisk > 80,
      });
    }

    if (breakdown.financial.resilience.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Low economic resilience vulnerable to market disruptions',
        dimension: 'FINANCIAL',
        probability: 55,
        severity: 70,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    // Growth risks
    if (breakdown.growth.score < 50) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Limited growth may lead to stagnation and boredom',
        dimension: 'GROWTH',
        probability: 65,
        severity: 60,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    if (breakdown.growth.learning.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Limited learning opportunities cause skill obsolescence',
        dimension: 'GROWTH',
        probability: 60,
        severity: 65,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    // Freedom risks
    if (breakdown.freedom.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Low autonomy may cause frustration and resentment',
        dimension: 'FREEDOM',
        probability: 60,
        severity: 55,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    if (breakdown.freedom.choicePreservation.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Limited optionality may trap you in unsatisfying path',
        dimension: 'FREEDOM',
        probability: 50,
        severity: 70,
        riskScore: 0,
        isDealBreaker: false,
      });
    }

    // Meaning risks
    if (breakdown.meaning.score < 40) {
      risks.push({
        id: `risk-${++id}`,
        description: 'Lack of meaning may lead to existential dissatisfaction',
        dimension: 'MEANING',
        probability: 55,
        severity: 65,
        riskScore: 0,
        isDealBreaker: breakdown.meaning.score < 25,
      });
    }

    // Calculate risk scores
    risks.forEach((risk) => {
      risk.riskScore = Math.round((risk.probability * risk.severity) / 100);
    });

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Analyzes component contributions to overall utility.
   *
   * @param breakdown - Utility breakdown
   * @returns Component analysis
   */
  analyzeComponents(breakdown: UtilityBreakdown): ComponentAnalysis {
    const components = [
      { dimension: 'FULFILLMENT' as UtilityDimension, score: breakdown.fulfillment.score, weight: breakdown.fulfillment.weight },
      { dimension: 'LIFESTYLE' as UtilityDimension, score: breakdown.lifestyle.score, weight: breakdown.lifestyle.weight },
      { dimension: 'FINANCIAL' as UtilityDimension, score: breakdown.financial.score, weight: breakdown.financial.weight },
      { dimension: 'GROWTH' as UtilityDimension, score: breakdown.growth.score, weight: breakdown.growth.weight },
      { dimension: 'FREEDOM' as UtilityDimension, score: breakdown.freedom.score, weight: breakdown.freedom.weight },
      { dimension: 'MEANING' as UtilityDimension, score: breakdown.meaning.score, weight: breakdown.meaning.weight },
    ];

    // Sort by weighted contribution
    const sortedByContribution = [...components].sort((a, b) => {
      const contribA = a.score * a.weight;
      const contribB = b.score * b.weight;
      return contribB - contribA;
    });

    // Identify top contributors
    const topContributors = sortedByContribution
      .filter((c) => c.score >= 70)
      .slice(0, 3)
      .map((c) => c.dimension);

    // Identify top reductions
    const topReductions = sortedByContribution
      .filter((c) => c.score < 50)
      .slice(0, 3)
      .map((c) => c.dimension);

    // Calculate variance
    const scores = components.map((c) => c.score);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;

    return {
      components,
      topContributors,
      topReductions,
      variance: Math.round(variance),
      averageScore: Math.round(avg),
      range: Math.max(...scores) - Math.min(...scores),
    };
  }

  /**
   * Identifies the strongest dimension.
   *
   * @param breakdown - Utility breakdown
   * @returns Strongest dimension info
   */
  identifyStrongestDimension(breakdown: UtilityBreakdown): DimensionInfo {
    const dimensions = [
      { name: 'FULFILLMENT' as UtilityDimension, score: breakdown.fulfillment.score, confidence: breakdown.fulfillment.confidence },
      { name: 'LIFESTYLE' as UtilityDimension, score: breakdown.lifestyle.score, confidence: breakdown.lifestyle.confidence },
      { name: 'FINANCIAL' as UtilityDimension, score: breakdown.financial.score, confidence: breakdown.financial.confidence },
      { name: 'GROWTH' as UtilityDimension, score: breakdown.growth.score, confidence: breakdown.growth.confidence },
      { name: 'FREEDOM' as UtilityDimension, score: breakdown.freedom.score, confidence: breakdown.freedom.confidence },
      { name: 'MEANING' as UtilityDimension, score: breakdown.meaning.score, confidence: breakdown.meaning.confidence },
    ];

    return dimensions.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }

  /**
   * Identifies the weakest dimension.
   *
   * @param breakdown - Utility breakdown
   * @returns Weakest dimension info
   */
  identifyWeakestDimension(breakdown: UtilityBreakdown): DimensionInfo {
    const dimensions = [
      { name: 'FULFILLMENT' as UtilityDimension, score: breakdown.fulfillment.score, confidence: breakdown.fulfillment.confidence },
      { name: 'LIFESTYLE' as UtilityDimension, score: breakdown.lifestyle.score, confidence: breakdown.lifestyle.confidence },
      { name: 'FINANCIAL' as UtilityDimension, score: breakdown.financial.score, confidence: breakdown.financial.confidence },
      { name: 'GROWTH' as UtilityDimension, score: breakdown.growth.score, confidence: breakdown.growth.confidence },
      { name: 'FREEDOM' as UtilityDimension, score: breakdown.freedom.score, confidence: breakdown.freedom.confidence },
      { name: 'MEANING' as UtilityDimension, score: breakdown.meaning.score, confidence: breakdown.meaning.confidence },
    ];

    return dimensions.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    );
  }

  /**
   * Calculates confidence in the utility analysis.
   *
   * @param breakdown - Utility breakdown
   * @param fitResult - Career fit result
   * @returns Overall confidence score
   */
  calculateConfidence(
    breakdown: UtilityBreakdown,
    fitResult: CareerFitResult
  ): number {
    // Average dimension confidences weighted by dimension weights
    const weightedConfidence =
      breakdown.fulfillment.confidence * breakdown.fulfillment.weight +
      breakdown.lifestyle.confidence * breakdown.lifestyle.weight +
      breakdown.financial.confidence * breakdown.financial.weight +
      breakdown.growth.confidence * breakdown.growth.weight +
      breakdown.freedom.confidence * breakdown.freedom.weight +
      breakdown.meaning.confidence * breakdown.meaning.weight;

    // Blend with fit confidence
    return Math.round((weightedConfidence * 0.7) + (fitResult.confidence.overall * 0.3));
  }
}

/**
 * Component analysis result.
 */
interface ComponentAnalysis {
  /** All components with scores and weights */
  components: Array<{ dimension: UtilityDimension; score: number; weight: number }>;

  /** Top contributing dimensions */
  topContributors: UtilityDimension[];

  /** Top reducing dimensions */
  topReductions: UtilityDimension[];

  /** Variance across dimensions */
  variance: number;

  /** Average score */
  averageScore: number;

  /** Range (max - min) */
  range: number;
}

/**
 * Dimension information.
 */
interface DimensionInfo {
  /** Dimension name */
  name: UtilityDimension;

  /** Score */
  score: number;

  /** Confidence */
  confidence: number;
}

/**
 * Creates a default utility breakdown engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured UtilityBreakdownEngine
 */
export function createUtilityBreakdownEngine(
  config?: Partial<UtilityIntelligenceConfig>
): UtilityBreakdownEngine {
  const fullConfig: UtilityIntelligenceConfig = {
    ...DEFAULT_UTILITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new UtilityBreakdownEngine(fullConfig);
}
