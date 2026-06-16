/**
 * CareerOS Utility Intelligence Engine - Utility Explanation Engine
 *
 * Phase D.2: Utility Intelligence Engine
 *
 * Generates human-readable explanations of utility analysis
 * including why utility is high/low, top contributors, and recommendations.
 *
 * @module utility-explanation-engine
 * @version 1.0.0
 */

import type {
  UtilityBreakdown,
  UtilityExplanation,
  UtilityAdvantage,
  UtilityRisk,
  UtilityDimension,
  UtilityIntelligenceConfig,
  SubDimensionScore,
} from './utility-types';
import { DEFAULT_UTILITY_INTELLIGENCE_CONFIG } from './utility-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating utility explanations.
 */
export class UtilityExplanationEngine {
  /** Configuration */
  private config: UtilityIntelligenceConfig;

  /**
   * Creates a new UtilityExplanationEngine.
   *
   * @param config - Configuration
   */
  constructor(config: UtilityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates complete utility explanation.
   *
   * @param overallUtility - Overall utility score
   * @param breakdown - Utility breakdown
   * @param advantages - Utility advantages
   * @param risks - Utility risks
   * @param career - Career intelligence
   * @returns Utility explanation
   */
  generateExplanation(
    overallUtility: number,
    breakdown: UtilityBreakdown,
    advantages: UtilityAdvantage[],
    risks: UtilityRisk[],
    career: CareerIntelligence
  ): UtilityExplanation {
    const whyHigh = this.explainWhyHigh(overallUtility, breakdown, advantages);
    const whyLow = this.explainWhyLow(overallUtility, breakdown, risks);
    const topContributors = this.identifyTopContributors(breakdown, advantages);
    const topReductions = this.identifyTopReductions(breakdown, risks);
    const summary = this.generateSummary(overallUtility, breakdown, career);
    const recommendations = this.generateRecommendations(breakdown, risks);

    return {
      whyHigh,
      whyLow,
      topContributors,
      topReductions,
      summary,
      recommendations,
    };
  }

  /**
   * Explains why utility is high.
   *
   * @param overallUtility - Overall utility score
   * @param breakdown - Utility breakdown
   * @param advantages - Advantages
   * @returns Explanation string
   */
  private explainWhyHigh(
    overallUtility: number,
    breakdown: UtilityBreakdown,
    advantages: UtilityAdvantage[]
  ): string {
    if (overallUtility < 60) {
      return 'Utility is not high. See whyLow for explanation of limitations.';
    }

    const parts: string[] = [];

    // Opening based on score level
    if (overallUtility >= 80) {
      parts.push('This career offers exceptional life utility');
    } else if (overallUtility >= 70) {
      parts.push('This career offers strong life utility');
    } else {
      parts.push('This career offers moderate life utility');
    }

    // Identify top dimensions
    const strongDimensions = this.getStrongDimensions(breakdown);
    if (strongDimensions.length > 0) {
      parts.push(`with particular strength in ${this.formatDimensionList(strongDimensions)}.`);
    } else {
      parts.push('through balanced performance across dimensions.');
    }

    // Add top advantage
    if (advantages.length > 0) {
      const topAdvantage = advantages[0];
      parts.push(`The primary advantage is: ${this.lowerCaseFirst(topAdvantage.description)}.`);
    }

    // Add specific highlights
    const highlights: string[] = [];

    if (breakdown.fulfillment.score >= 75) {
      highlights.push('you can leverage your strengths and motivations effectively');
    }

    if (breakdown.financial.score >= 75) {
      highlights.push('strong financial prospects support security and goals');
    }

    if (breakdown.meaning.score >= 75) {
      highlights.push('meaningful work aligned with your values');
    }

    if (breakdown.growth.score >= 75) {
      highlights.push('continuous development and learning opportunities');
    }

    if (breakdown.freedom.score >= 75) {
      highlights.push('autonomy and flexibility in your work');
    }

    if (breakdown.lifestyle.score >= 75) {
      highlights.push('lifestyle compatibility and work-life balance');
    }

    if (highlights.length > 0) {
      parts.push(`You will benefit from ${this.joinWithAnd(highlights)}.`);
    }

    return parts.join(' ');
  }

  /**
   * Explains why utility is low.
   *
   * @param overallUtility - Overall utility score
   * @param breakdown - Utility breakdown
   * @param risks - Risks
   * @returns Explanation string
   */
  private explainWhyLow(
    overallUtility: number,
    breakdown: UtilityBreakdown,
    risks: UtilityRisk[]
  ): string {
    if (overallUtility >= 70) {
      return 'Utility is not low. Overall assessment is positive with manageable tradeoffs.';
    }

    const parts: string[] = [];

    // Opening based on score level
    if (overallUtility < 40) {
      parts.push('This career presents significant utility concerns');
    } else if (overallUtility < 50) {
      parts.push('This career has notable utility limitations');
    } else {
      parts.push('This career has some utility constraints');
    }

    // Identify weak dimensions
    const weakDimensions = this.getWeakDimensions(breakdown);
    if (weakDimensions.length > 0) {
      parts.push(`particularly in ${this.formatDimensionList(weakDimensions)}.`);
    } else {
      parts.push('that require careful consideration.');
    }

    // Add top risk
    const dealBreakers = risks.filter((r) => r.isDealBreaker);
    if (dealBreakers.length > 0) {
      parts.push(`Critical concern: ${this.lowerCaseFirst(dealBreakers[0].description)}.`);
    } else if (risks.length > 0) {
      const topRisk = risks[0];
      parts.push(`Primary risk: ${this.lowerCaseFirst(topRisk.description)}.`);
    }

    // Add specific concerns
    const concerns: string[] = [];

    if (breakdown.fulfillment.score < 45) {
      concerns.push('limited alignment with your strengths may cause frustration');
    }

    if (breakdown.financial.score < 45) {
      concerns.push('financial constraints may limit life options');
    }

    if (breakdown.meaning.score < 45) {
      concerns.push('lack of purpose may lead to existential dissatisfaction');
    }

    if (breakdown.growth.score < 45) {
      concerns.push('limited development may cause stagnation');
    }

    if (breakdown.freedom.score < 45) {
      concerns.push('constraints on autonomy may cause resentment');
    }

    if (breakdown.lifestyle.score < 45) {
      concerns.push('lifestyle conflicts threaten wellbeing');
    }

    if (concerns.length > 0) {
      parts.push(`Specific concerns: ${this.joinWithAnd(concerns)}.`);
    }

    return parts.join(' ');
  }

  /**
   * Identifies top contributors to utility.
   *
   * @param breakdown - Utility breakdown
   * @param advantages - Advantages
   * @returns Top contributor descriptions
   */
  private identifyTopContributors(
    breakdown: UtilityBreakdown,
    advantages: UtilityAdvantage[]
  ): string[] {
    const contributors: string[] = [];

    // Add top dimensions
    const dimensionScores = [
      { name: 'FULFILLMENT', score: breakdown.fulfillment.score },
      { name: 'LIFESTYLE', score: breakdown.lifestyle.score },
      { name: 'FINANCIAL', score: breakdown.financial.score },
      { name: 'GROWTH', score: breakdown.growth.score },
      { name: 'FREEDOM', score: breakdown.freedom.score },
      { name: 'MEANING', score: breakdown.meaning.score },
    ];

    const sortedDimensions = dimensionScores
      .filter((d) => d.score >= 65)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const dim of sortedDimensions) {
      contributors.push(`${this.formatDimensionName(dim.name)} (${dim.score}/100)`);
    }

    // Add specific sub-dimension contributors
    if (breakdown.fulfillment.strengthAlignment.score >= 75) {
      contributors.push('Strength alignment - career leverages your capabilities');
    }

    if (breakdown.fulfillment.motivationAlignment.score >= 75) {
      contributors.push('Motivation fit - work satisfies your drivers');
    }

    if (breakdown.financial.incomePotential.score >= 75) {
      contributors.push('Income potential - strong earning opportunity');
    }

    if (breakdown.financial.resilience.score >= 75) {
      contributors.push('Economic resilience - protected from market shifts');
    }

    if (breakdown.growth.learning.score >= 75) {
      contributors.push('Learning opportunities - continuous development');
    }

    if (breakdown.growth.careerDevelopment.score >= 75) {
      contributors.push('Advancement path - clear growth trajectory');
    }

    if (breakdown.freedom.autonomy.score >= 75) {
      contributors.push('Autonomy - self-directed work environment');
    }

    if (breakdown.freedom.choicePreservation.score >= 75) {
      contributors.push('Optionality - future choices preserved');
    }

    if (breakdown.meaning.purpose.score >= 75) {
      contributors.push('Purpose - meaningful work contribution');
    }

    if (breakdown.meaning.valuesAlignment.score >= 75) {
      contributors.push('Values alignment - work matches your principles');
    }

    if (breakdown.lifestyle.workLifeBalance.score >= 75) {
      contributors.push('Work-life balance - sustainable lifestyle');
    }

    // Add top advantages
    advantages
      .slice(0, 3)
      .forEach((adv) => {
        if (!contributors.some((c) => c.includes(adv.description.substring(0, 20)))) {
          contributors.push(adv.description);
        }
      });

    return contributors.slice(0, 5);
  }

  /**
   * Identifies top reductions to utility.
   *
   * @param breakdown - Utility breakdown
   * @param risks - Risks
   * @returns Top reduction descriptions
   */
  private identifyTopReductions(
    breakdown: UtilityBreakdown,
    risks: UtilityRisk[]
  ): string[] {
    const reductions: string[] = [];

    // Add weak dimensions
    const dimensionScores = [
      { name: 'FULFILLMENT', score: breakdown.fulfillment.score },
      { name: 'LIFESTYLE', score: breakdown.lifestyle.score },
      { name: 'FINANCIAL', score: breakdown.financial.score },
      { name: 'GROWTH', score: breakdown.growth.score },
      { name: 'FREEDOM', score: breakdown.freedom.score },
      { name: 'MEANING', score: breakdown.meaning.score },
    ];

    const sortedDimensions = dimensionScores
      .filter((d) => d.score < 50)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    for (const dim of sortedDimensions) {
      reductions.push(`${this.formatDimensionName(dim.name)} limitation (${dim.score}/100)`);
    }

    // Add specific sub-dimension reductions
    if (breakdown.fulfillment.strengthAlignment.score < 45) {
      reductions.push('Strength misalignment - cannot leverage your capabilities');
    }

    if (breakdown.fulfillment.motivationAlignment.score < 45) {
      reductions.push('Motivation mismatch - work does not satisfy your drivers');
    }

    if (breakdown.financial.incomePotential.score < 45) {
      reductions.push('Income constraints - limited earning potential');
    }

    if (breakdown.financial.resilience.score < 45) {
      reductions.push('Economic vulnerability - exposed to market shifts');
    }

    if (breakdown.growth.learning.score < 45) {
      reductions.push('Limited learning - skill stagnation risk');
    }

    if (breakdown.growth.careerDevelopment.score < 45) {
      reductions.push('Advancement barriers - limited growth trajectory');
    }

    if (breakdown.freedom.autonomy.score < 45) {
      reductions.push('Low autonomy - constrained decision-making');
    }

    if (breakdown.freedom.choicePreservation.score < 45) {
      reductions.push('Limited optionality - future paths restricted');
    }

    if (breakdown.meaning.purpose.score < 45) {
      reductions.push('Purpose gap - limited meaningful contribution');
    }

    if (breakdown.meaning.valuesAlignment.score < 45) {
      reductions.push('Values conflict - work contradicts your principles');
    }

    if (breakdown.lifestyle.workLifeBalance.score < 45) {
      reductions.push('Work-life imbalance - unsustainable demands');
    }

    // Add top risks
    risks
      .filter((r) => r.riskScore >= 40)
      .slice(0, 3)
      .forEach((risk) => {
        if (!reductions.some((r) => r.includes(risk.description.substring(0, 20)))) {
          reductions.push(risk.description);
        }
      });

    return reductions.slice(0, 5);
  }

  /**
   * Generates summary statement.
   *
   * @param overallUtility - Overall utility score
   * @param breakdown - Utility breakdown
   * @param career - Career intelligence
   * @returns Summary string
   */
  private generateSummary(
    overallUtility: number,
    breakdown: UtilityBreakdown,
    career: CareerIntelligence
  ): string {
    const parts: string[] = [];

    // Overall assessment
    if (overallUtility >= 80) {
      parts.push(`${career.careerTitle} offers exceptional life utility`);
    } else if (overallUtility >= 65) {
      parts.push(`${career.careerTitle} offers strong life utility`);
    } else if (overallUtility >= 50) {
      parts.push(`${career.careerTitle} offers moderate life utility`);
    } else if (overallUtility >= 35) {
      parts.push(`${career.careerTitle} has limited life utility`);
    } else {
      parts.push(`${career.careerTitle} has poor life utility`);
    }

    parts.push(`(${overallUtility}/100).`);

    // Pattern description
    const pattern = this.describePattern(breakdown);
    if (pattern) {
      parts.push(pattern);
    }

    // Key insight
    const strongDims = this.getStrongDimensions(breakdown);
    const weakDims = this.getWeakDimensions(breakdown);

    if (strongDims.length >= 3 && weakDims.length === 0) {
      parts.push('Strong across all dimensions with no significant weaknesses.');
    } else if (strongDims.length > 0 && weakDims.length > 0) {
      parts.push(`Strengths in ${this.formatDimensionList(strongDims)} balance concerns in ${this.formatDimensionList(weakDims)}.`);
    } else if (weakDims.length >= 3) {
      parts.push('Multiple significant concerns require careful evaluation.');
    }

    return parts.join(' ');
  }

  /**
   * Generates recommendations.
   *
   * @param breakdown - Utility breakdown
   * @param risks - Risks
   * @returns Recommendations
   */
  private generateRecommendations(
    breakdown: UtilityBreakdown,
    risks: UtilityRisk[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations based on weak dimensions
    if (breakdown.fulfillment.score < 60) {
      recommendations.push('Evaluate whether you can develop new strengths in this area or if the misalignment is fundamental.');
    }

    if (breakdown.financial.score < 60) {
      recommendations.push('Create a financial plan that accounts for income limitations and build emergency reserves.');
    }

    if (breakdown.meaning.score < 60) {
      recommendations.push('Identify ways to connect this work to meaningful outcomes or consider how to find meaning outside work.');
    }

    if (breakdown.growth.score < 60) {
      recommendations.push('Pursue external learning opportunities and proactively seek skill development.');
    }

    if (breakdown.freedom.score < 60) {
      recommendations.push('Negotiate for increased autonomy where possible or establish boundaries that preserve choice.');
    }

    if (breakdown.lifestyle.score < 60) {
      recommendations.push('Implement strict work-life boundaries and prioritize self-care practices.');
    }

    // Recommendations based on risks
    const dealBreakers = risks.filter((r) => r.isDealBreaker);
    if (dealBreakers.length > 0) {
      recommendations.push(`Address critical risk: ${dealBreakers[0].description}`);
    }

    const automationRisk = risks.find((r) => r.description.includes('automation'));
    if (automationRisk) {
      recommendations.push('Develop skills that complement rather than compete with automation.');
    }

    const balanceRisk = risks.find((r) => r.description.includes('work-life'));
    if (balanceRisk) {
      recommendations.push('Establish non-negotiable boundaries for personal time and wellbeing.');
    }

    // Generic recommendations if few specific ones
    if (recommendations.length < 2) {
      if (breakdown.fulfillment.score >= 70) {
        recommendations.push('Leverage your strong fit by taking on challenging assignments that use your strengths.');
      }

      if (breakdown.growth.score >= 70) {
        recommendations.push('Maximize growth opportunities through continuous learning and skill expansion.');
      }

      recommendations.push('Regularly reassess your utility satisfaction and adjust course as needed.');
    }

    return recommendations.slice(0, 4);
  }

  /**
   * Describes the pattern of utility scores.
   *
   * @param breakdown - Utility breakdown
   * @returns Pattern description or null
   */
  private describePattern(breakdown: UtilityBreakdown): string | null {
    const scores = [
      breakdown.fulfillment.score,
      breakdown.lifestyle.score,
      breakdown.financial.score,
      breakdown.growth.score,
      breakdown.freedom.score,
      breakdown.meaning.score,
    ];

    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;

    // Balanced pattern
    if (range < 20) {
      return 'Utility is balanced across dimensions.';
    }

    // Polarized pattern
    if (range > 40) {
      return 'Significant variation across dimensions creates tradeoffs.';
    }

    // Fulfilment-focused
    if (breakdown.fulfillment.score > avg + 15) {
      return 'Fulfillment-driven with other dimensions secondary.';
    }

    // Financial-focused
    if (breakdown.financial.score > avg + 15) {
      return 'Financially-oriented with tradeoffs in other areas.';
    }

    // Growth-focused
    if (breakdown.growth.score > avg + 15) {
      return 'Development-focused with emphasis on learning.';
    }

    return null;
  }

  /**
   * Gets strong dimensions (score >= 70).
   *
   * @param breakdown - Utility breakdown
   * @returns Array of dimension names
   */
  private getStrongDimensions(breakdown: UtilityBreakdown): string[] {
    const strong: string[] = [];

    if (breakdown.fulfillment.score >= 70) strong.push('fulfillment');
    if (breakdown.lifestyle.score >= 70) strong.push('lifestyle');
    if (breakdown.financial.score >= 70) strong.push('financial');
    if (breakdown.growth.score >= 70) strong.push('growth');
    if (breakdown.freedom.score >= 70) strong.push('freedom');
    if (breakdown.meaning.score >= 70) strong.push('meaning');

    return strong;
  }

  /**
   * Gets weak dimensions (score < 50).
   *
   * @param breakdown - Utility breakdown
   * @returns Array of dimension names
   */
  private getWeakDimensions(breakdown: UtilityBreakdown): string[] {
    const weak: string[] = [];

    if (breakdown.fulfillment.score < 50) weak.push('fulfillment');
    if (breakdown.lifestyle.score < 50) weak.push('lifestyle');
    if (breakdown.financial.score < 50) weak.push('financial');
    if (breakdown.growth.score < 50) weak.push('growth');
    if (breakdown.freedom.score < 50) weak.push('freedom');
    if (breakdown.meaning.score < 50) weak.push('meaning');

    return weak;
  }

  /**
   * Formats dimension list for display.
   *
   * @param dimensions - Array of dimension names
   * @returns Formatted string
   */
  private formatDimensionList(dimensions: string[]): string {
    if (dimensions.length === 1) return dimensions[0];
    if (dimensions.length === 2) return `${dimensions[0]} and ${dimensions[1]}`;
    return `${dimensions.slice(0, -1).join(', ')}, and ${dimensions[dimensions.length - 1]}`;
  }

  /**
   * Formats dimension name for display.
   *
   * @param dimension - Dimension identifier
   * @returns Formatted name
   */
  private formatDimensionName(dimension: string): string {
    const names: Record<string, string> = {
      FULFILLMENT: 'fulfillment',
      LIFESTYLE: 'lifestyle',
      FINANCIAL: 'financial',
      GROWTH: 'growth',
      FREEDOM: 'freedom',
      MEANING: 'meaning',
    };

    return names[dimension] ?? dimension.toLowerCase();
  }

  /**
   * Lower cases first character of string.
   *
   * @param str - Input string
   * @returns Modified string
   */
  private lowerCaseFirst(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Joins array with commas and 'and'.
   *
   * @param items - Array of strings
   * @returns Joined string
   */
  private joinWithAnd(items: string[]): string {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }
}

/**
 * Creates a default utility explanation engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured UtilityExplanationEngine
 */
export function createUtilityExplanationEngine(
  config?: Partial<UtilityIntelligenceConfig>
): UtilityExplanationEngine {
  const fullConfig: UtilityIntelligenceConfig = {
    ...DEFAULT_UTILITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new UtilityExplanationEngine(fullConfig);
}
