/**
 * CareerOS Optionality Intelligence Engine - Optionality Explanation Engine
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Generates human-readable explanations of optionality analysis.
 *
 * @module optionality-explanation-engine
 * @version 1.0.0
 */

import type {
  OptionalityExplanation,
  OptionalityBreakdown,
  FutureOptions,
  CareerFlexibility,
  PivotPotential,
  OptionalityIntelligenceConfig,
  FuturePath,
  DimensionScore,
} from './optionality-types';
import { DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG } from './optionality-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating optionality explanations.
 */
export class OptionalityExplanationEngine {
  /** Configuration */
  private config: OptionalityIntelligenceConfig;

  /**
   * Creates a new OptionalityExplanationEngine.
   *
   * @param config - Configuration
   */
  constructor(config: OptionalityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates complete optionality explanation.
   *
   * @param overallOptionality - Overall optionality score
   * @param breakdown - Optionality breakdown
   * @param futureOptions - Future options
   * @param careerFlexibility - Career flexibility
   * @param pivotPotential - Pivot potential
   * @param career - Career intelligence
   * @returns Optionality explanation
   */
  generateExplanation(
    overallOptionality: number,
    breakdown: OptionalityBreakdown,
    futureOptions: FutureOptions,
    careerFlexibility: CareerFlexibility,
    pivotPotential: PivotPotential,
    career: CareerIntelligence
  ): OptionalityExplanation {
    const summary = this.generateSummary(
      overallOptionality,
      futureOptions,
      career
    );

    const optionsOpen = this.identifyOptionsOpen(
      futureOptions,
      careerFlexibility,
      breakdown
    );

    const optionsHarder = this.identifyOptionsHarder(
      breakdown,
      pivotPotential
    );

    const optionsEasier = this.identifyOptionsEasier(
      breakdown,
      pivotPotential
    );

    const insights = this.generateInsights(
      overallOptionality,
      breakdown,
      futureOptions
    );

    const recommendations = this.generateRecommendations(
      overallOptionality,
      breakdown,
      pivotPotential
    );

    return {
      summary,
      optionsOpen,
      optionsHarder,
      optionsEasier,
      insights,
      recommendations,
    };
  }

  /**
   * Generates summary statement.
   *
   * @param overallOptionality - Overall score
   * @param futureOptions - Future options
   * @param career - Career intelligence
   * @returns Summary
   */
  private generateSummary(
    overallOptionality: number,
    futureOptions: FutureOptions,
    career: CareerIntelligence
  ): string {
    const parts: string[] = [];

    // Overall assessment
    if (overallOptionality >= 75) {
      parts.push(`${career.careerTitle} offers excellent future optionality`);
    } else if (overallOptionality >= 60) {
      parts.push(`${career.careerTitle} offers good future optionality`);
    } else if (overallOptionality >= 45) {
      parts.push(`${career.careerTitle} offers moderate future optionality`);
    } else {
      parts.push(`${career.careerTitle} offers limited future optionality`);
    }

    parts.push(`(${overallOptionality}/100).`);

    // Path count
    parts.push(`This path opens ${futureOptions.totalPathCount} viable future directions`);

    // Diversity
    if (futureOptions.pathDiversity.overall >= 70) {
      parts.push('across diverse industries and functions.');
    } else if (futureOptions.pathDiversity.overall >= 50) {
      parts.push('with reasonable variety.');
    } else {
      parts.push('with somewhat limited variety.');
    }

    return parts.join(' ');
  }

  /**
   * Identifies options that remain open.
   *
   * @param futureOptions - Future options
   * @param careerFlexibility - Career flexibility
   * @param breakdown - Optionality breakdown
   * @returns Options open descriptions
   */
  private identifyOptionsOpen(
    futureOptions: FutureOptions,
    careerFlexibility: CareerFlexibility,
    breakdown: OptionalityBreakdown
  ): string[] {
    const options: string[] = [];

    // Primary paths
    if (futureOptions.primaryPaths.length > 0) {
      const topPaths = futureOptions.primaryPaths.slice(0, 2);
      options.push(`Natural advancement to ${topPaths.map((p) => p.title).join(' or ')}`);
    }

    // Alternative paths
    if (futureOptions.alternativePaths.length > 0) {
      const altPaths = futureOptions.alternativePaths.slice(0, 2);
      options.push(`Lateral moves to ${altPaths.map((p) => p.title).join(' or ')}`);
    }

    // Entrepreneurial
    if (breakdown.entrepreneurialPotential.score >= 60) {
      options.push('Entrepreneurial and consulting opportunities');
    }

    // Industry mobility
    if (breakdown.industryMobility.score >= 60) {
      options.push('Cross-industry transitions');
    }

    // Geographic
    if (breakdown.geographicMobility.score >= 60) {
      options.push('Geographic flexibility and relocation options');
    }

    // Backup options
    if (futureOptions.backupPaths.length > 0) {
      options.push('Backup and fallback career options');
    }

    return options;
  }

  /**
   * Identifies options that become harder.
   *
   * @param breakdown - Optionality breakdown
   * @param pivotPotential - Pivot potential
   * @returns Options harder descriptions
   */
  private identifyOptionsHarder(
    breakdown: OptionalityBreakdown,
    pivotPotential: PivotPotential
  ): string[] {
    const harder: string[] = [];

    // Based on weak dimensions
    if (breakdown.industryMobility.score < 50) {
      harder.push('Moving to entirely different industries');
    }

    if (breakdown.geographicMobility.score < 50) {
      harder.push('Geographic relocation and remote work');
    }

    if (breakdown.entrepreneurialPotential.score < 50) {
      harder.push('Entrepreneurial and self-employment paths');
    }

    if (pivotPotential.pivotEase < 50) {
      harder.push('Pivoting to unrelated career tracks');
    }

    // Specific barriers
    const significantBarriers = pivotPotential.barriers.filter((b) => b.severity >= 60);
    significantBarriers.forEach((barrier) => {
      if (barrier.type === 'CERTIFICATION') {
        harder.push('Careers requiring additional credentials');
      } else if (barrier.type === 'EXPERIENCE') {
        harder.push('Highly competitive positions');
      }
    });

    return harder;
  }

  /**
   * Identifies options that become easier.
   *
   * @param breakdown - Optionality breakdown
   * @param pivotPotential - Pivot potential
   * @returns Options easier descriptions
   */
  private identifyOptionsEasier(
    breakdown: OptionalityBreakdown,
    pivotPotential: PivotPotential
  ): string[] {
    const easier: string[] = [];

    // Based on strong dimensions
    if (breakdown.transferableSkills.score >= 70) {
      easier.push('Leveraging transferable skills in new contexts');
    }

    if (breakdown.careerFlexibility.score >= 70) {
      easier.push('Natural career advancement and progression');
    }

    if (pivotPotential.pivotEase >= 60) {
      easier.push('Pivoting to adjacent career tracks');
    }

    if (breakdown.industryMobility.score >= 70) {
      easier.push('Moving within related industries');
    }

    // Specific pivot targets
    const likelyPivots = pivotPotential.commonPivots.filter((p) => p.likelihood >= 60);
    if (likelyPivots.length > 0) {
      const pivotNames = likelyPivots.slice(0, 2).map((p) => p.title);
      easier.push(`Transition to ${pivotNames.join(' or ')}`);
    }

    if (breakdown.geographicMobility.score >= 70) {
      easier.push('Remote and distributed work arrangements');
    }

    return easier;
  }

  /**
   * Generates key insights.
   *
   * @param overallOptionality - Overall score
   * @param breakdown - Optionality breakdown
   * @param futureOptions - Future options
   * @returns Insights
   */
  private generateInsights(
    overallOptionality: number,
    breakdown: OptionalityBreakdown,
    futureOptions: FutureOptions
  ): string[] {
    const insights: string[] = [];

    // Strength-based insights
    const sortedDimensions = this.getSortedDimensions(breakdown);
    const topDimension = sortedDimensions[0];

    if (topDimension.score >= 75) {
      insights.push(`Strong ${this.formatDimensionName(topDimension.name)} creates multiple pathways`);
    }

    // Path count insight
    if (futureOptions.totalPathCount >= 15) {
      insights.push(`Rich set of ${futureOptions.totalPathCount} future options provides significant choice`);
    } else if (futureOptions.totalPathCount <= 8) {
      insights.push('Limited number of future paths requires careful planning');
    }

    // Diversity insight
    if (futureOptions.pathDiversity.overall >= 70) {
      insights.push('High diversity of options reduces risk of path dependency');
    }

    // Weakness-based insights
    const weakDimensions = sortedDimensions.filter((d) => d.score < 50);
    if (weakDimensions.length > 0) {
      const weakNames = weakDimensions.map((d) => this.formatDimensionName(d.name));
      insights.push(`Limited ${weakNames.join(', ')} may constrain future choices`);
    }

    // Overall assessment
    if (overallOptionality >= 75) {
      insights.push('This career preserves maximum future optionality');
    } else if (overallOptionality <= 40) {
      insights.push('This career commits you to a more defined trajectory');
    }

    return insights.slice(0, 4);
  }

  /**
   * Generates recommendations.
   *
   * @param overallOptionality - Overall score
   * @param breakdown - Optionality breakdown
   * @param pivotPotential - Pivot potential
   * @returns Recommendations
   */
  private generateRecommendations(
    overallOptionality: number,
    breakdown: OptionalityBreakdown,
    pivotPotential: PivotPotential
  ): string[] {
    const recommendations: string[] = [];

    // High optionality recommendations
    if (overallOptionality >= 70) {
      recommendations.push('Maintain skill breadth to preserve optionality');
      recommendations.push('Build network across multiple industries and functions');
    }

    // Medium optionality recommendations
    if (overallOptionality >= 45 && overallOptionality < 70) {
      recommendations.push('Develop transferable skills to expand future options');
      recommendations.push('Identify and prepare for 2-3 viable pivot targets');
    }

    // Low optionality recommendations
    if (overallOptionality < 45) {
      recommendations.push('Develop explicit plan for maintaining career flexibility');
      recommendations.push('Invest in highly transferable skills outside core domain');
      recommendations.push('Build relationships outside your immediate industry');
    }

    // Dimension-specific recommendations
    if (breakdown.transferableSkills.score < 60) {
      recommendations.push('Focus on building communication, leadership, and analytical skills');
    }

    if (breakdown.industryMobility.score < 60) {
      recommendations.push('Gain exposure to adjacent industries through projects or networking');
    }

    if (breakdown.entrepreneurialPotential.score < 60) {
      recommendations.push('Develop business and commercial skills to enable future independence');
    }

    // Pivot recommendations
    if (pivotPotential.barriers.length > 0) {
      const topBarrier = pivotPotential.barriers[0];
      recommendations.push(`Address ${topBarrier.type.toLowerCase()} barriers to improve pivot options`);
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Gets sorted dimensions by score.
   *
   * @param breakdown - Optionality breakdown
   * @returns Sorted dimensions
   */
  private getSortedDimensions(
    breakdown: OptionalityBreakdown
  ): Array<{ name: string; score: number }> {
    return [
      { name: 'careerFlexibility', score: breakdown.careerFlexibility.score },
      { name: 'pivotPotential', score: breakdown.pivotPotential.score },
      { name: 'transferableSkills', score: breakdown.transferableSkills.score },
      { name: 'industryMobility', score: breakdown.industryMobility.score },
      { name: 'geographicMobility', score: breakdown.geographicMobility.score },
      { name: 'entrepreneurialPotential', score: breakdown.entrepreneurialPotential.score },
    ].sort((a, b) => b.score - a.score);
  }

  /**
   * Formats dimension name for display.
   *
   * @param name - Dimension name
   * @returns Formatted name
   */
  private formatDimensionName(name: string): string {
    const names: Record<string, string> = {
      careerFlexibility: 'career flexibility',
      pivotPotential: 'pivot potential',
      transferableSkills: 'transferable skills',
      industryMobility: 'industry mobility',
      geographicMobility: 'geographic mobility',
      entrepreneurialPotential: 'entrepreneurial potential',
    };

    return names[name] ?? name;
  }
}

/**
 * Creates a default optionality explanation engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured OptionalityExplanationEngine
 */
export function createOptionalityExplanationEngine(
  config?: Partial<OptionalityIntelligenceConfig>
): OptionalityExplanationEngine {
  const fullConfig: OptionalityIntelligenceConfig = {
    ...DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new OptionalityExplanationEngine(fullConfig);
}
