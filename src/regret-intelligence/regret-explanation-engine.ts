/**
 * CareerOS Regret Intelligence Engine - Regret Explanation Engine
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Generates human-readable explanations of regret analysis.
 *
 * @module regret-explanation-engine
 * @version 1.0.0
 */

import type {
  RegretExplanation,
  RegretBreakdown,
  RegretFactor,
  RegretSeverity,
  RegretIntelligenceConfig,
  RegretScenarios,
} from './regret-types';
import { DEFAULT_REGRET_INTELLIGENCE_CONFIG } from './regret-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';

/**
 * Engine for generating regret explanations.
 */
export class RegretExplanationEngine {
  /** Configuration */
  private config: RegretIntelligenceConfig;

  /**
   * Creates a new RegretExplanationEngine.
   *
   * @param config - Configuration
   */
  constructor(config: RegretIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates complete regret explanation.
   *
   * @param overallRegretRisk - Overall regret risk score
   * @param severity - Regret severity
   * @param breakdown - Regret breakdown
   * @param factors - Major regret factors
   * @param scenarios - Regret scenarios
   * @param career - Career intelligence
   * @returns Regret explanation
   */
  generateExplanation(
    overallRegretRisk: number,
    severity: RegretSeverity,
    breakdown: RegretBreakdown,
    factors: RegretFactor[],
    scenarios: RegretScenarios,
    career: CareerIntelligence
  ): RegretExplanation {
    const summary = this.generateSummary(
      overallRegretRisk,
      severity,
      career
    );

    const whyRiskExists = this.identifyWhyRiskExists(
      breakdown,
      factors
    );

    const whyRiskIsLow = this.identifyWhyRiskIsLow(
      breakdown,
      factors
    );

    const keyFactors = this.identifyKeyFactors(factors);

    const warningSigns = this.identifyWarningSigns(
      breakdown,
      factors
    );

    return {
      summary,
      whyRiskExists,
      whyRiskIsLow,
      keyFactors,
      warningSigns,
    };
  }

  /**
   * Generates summary statement.
   *
   * @param overallRegretRisk - Overall score
   * @param severity - Severity classification
   * @param career - Career intelligence
   * @returns Summary
   */
  private generateSummary(
    overallRegretRisk: number,
    severity: RegretSeverity,
    career: CareerIntelligence
  ): string {
    const parts: string[] = [];

    // Overall assessment based on severity
    switch (severity) {
      case 'LOW':
        parts.push(`Choosing ${career.careerTitle} carries low regret risk`);
        parts.push(`(${overallRegretRisk}/100).`);
        parts.push('The path aligns well with your profile across key dimensions.');
        break;

      case 'MODERATE':
        parts.push(`Choosing ${career.careerTitle} carries moderate regret risk`);
        parts.push(`(${overallRegretRisk}/100).`);
        parts.push('While the path has merit, some areas warrant careful consideration.');
        break;

      case 'HIGH':
        parts.push(`Choosing ${career.careerTitle} carries significant regret risk`);
        parts.push(`(${overallRegretRisk}/100).`);
        parts.push('Several factors suggest this path may not serve you well long-term.');
        break;

      case 'CRITICAL':
        parts.push(`Choosing ${career.careerTitle} carries critical regret risk`);
        parts.push(`(${overallRegretRisk}/100).`);
        parts.push('Fundamental misalignments suggest high likelihood of future dissatisfaction.');
        break;
    }

    return parts.join(' ');
  }

  /**
   * Identifies why regret risk exists.
   *
   * @param breakdown - Regret breakdown
   * @param factors - Regret factors
   * @returns Reasons risk exists
   */
  private identifyWhyRiskExists(
    breakdown: RegretBreakdown,
    factors: RegretFactor[]
  ): string[] {
    const reasons: string[] = [];

    // Primary factors explain risk
    const primaryFactors = factors.filter((f) => f.priority === 'PRIMARY');

    primaryFactors.forEach((factor) => {
      reasons.push(`${factor.name}: ${factor.description}`);
    });

    // Add dimension-level insights for high-risk dimensions
    if (breakdown.identity.score >= 60) {
      reasons.push('Identity: Career characteristics may conflict with who you are');
    }

    if (breakdown.lifestyle.score >= 60) {
      const highGaps = breakdown.lifestyle.factors
        .filter((f) => f.gap >= 40)
        .map((f) => f.name.replace(/_/g, ' ').toLowerCase());
      if (highGaps.length > 0) {
        reasons.push(`Lifestyle: Significant gaps in ${highGaps.join(', ')}`);
      }
    }

    if (breakdown.financial.score >= 60) {
      reasons.push('Financial: Potential for income inadequacy or limited growth');
    }

    if (breakdown.opportunity.score >= 60) {
      reasons.push('Opportunity: This path may close off other desirable options');
    }

    if (breakdown.growth.score >= 60) {
      reasons.push('Growth: Risk of stagnation and limited skill development');
    }

    if (breakdown.values.score >= 60) {
      reasons.push('Values: Potential conflicts with your core values and principles');
    }

    return reasons.slice(0, 5);
  }

  /**
   * Identifies why regret risk is low.
   *
   * @param breakdown - Regret breakdown
   * @param factors - Regret factors
   * @returns Reasons risk is low
   */
  private identifyWhyRiskIsLow(
    breakdown: RegretBreakdown,
    factors: RegretFactor[]
  ): string[] {
    const reasons: string[] = [];

    // Identify low-risk dimensions
    if (breakdown.identity.score <= 40) {
      reasons.push('Identity: Strong alignment between your identity and the career');
    }

    if (breakdown.lifestyle.score <= 40) {
      reasons.push('Lifestyle: Career accommodates your lifestyle preferences');
    }

    if (breakdown.financial.score <= 40) {
      reasons.push('Financial: Income adequacy and growth potential look favorable');
    }

    if (breakdown.opportunity.score <= 40) {
      reasons.push('Opportunity: Good optionality preserved for future choices');
    }

    if (breakdown.growth.score <= 40) {
      reasons.push('Growth: Strong learning and mastery opportunities available');
    }

    if (breakdown.values.score <= 40) {
      reasons.push('Values: Career aligns well with your core values');
    }

    // If all dimensions moderate, add general reason
    if (reasons.length === 0) {
      reasons.push('No single dimension shows severe misalignment');
      reasons.push('Risk is distributed across multiple manageable areas');
    }

    return reasons.slice(0, 4);
  }

  /**
   * Identifies key factors that matter most.
   *
   * @param factors - All regret factors
   * @returns Key factors
   */
  private identifyKeyFactors(factors: RegretFactor[]): string[] {
    const keyFactors: string[] = [];

    // Sort by importance and take top factors
    const sortedFactors = [...factors].sort((a, b) => b.importance - a.importance);

    sortedFactors.slice(0, 3).forEach((factor) => {
      keyFactors.push(`${factor.name} (${factor.category}): Importance ${factor.importance}/100`);
    });

    // Add category summary
    const categories = new Set(factors.map((f) => f.category));
    if (categories.size > 1) {
      keyFactors.push(`Multiple regret dimensions affected: ${Array.from(categories).join(', ')}`);
    }

    return keyFactors;
  }

  /**
   * Identifies warning signs to watch for.
   *
   * @param breakdown - Regret breakdown
   * @param factors - Regret factors
   * @returns Warning signs
   */
  private identifyWarningSigns(
    breakdown: RegretBreakdown,
    factors: RegretFactor[]
  ): string[] {
    const warnings: string[] = [];

    // Warning signs from dimensions
    if (breakdown.identity.score >= 60) {
      warnings.push('Feeling that work does not reflect who you really are');
    }

    if (breakdown.lifestyle.score >= 60) {
      warnings.push('Persistent dissatisfaction with work-life balance');
    }

    if (breakdown.financial.score >= 60) {
      warnings.push('Financial stress despite meeting basic needs');
    }

    if (breakdown.opportunity.score >= 60) {
      warnings.push('Feeling trapped or unable to explore other paths');
    }

    if (breakdown.growth.score >= 60) {
      warnings.push('Boredom and lack of challenge in daily work');
    }

    if (breakdown.values.score >= 60) {
      warnings.push('Moral discomfort with work outputs or practices');
    }

    // General warning signs
    if (warnings.length > 0) {
      warnings.push('Persistent Sunday night dread');
      warnings.push('Fantasizing about different careers regularly');
    }

    return warnings.slice(0, 5);
  }

  /**
   * Generates mitigation explanation.
   *
   * @param factor - Regret factor
   * @returns Mitigation description
   */
  generateMitigationExplanation(factor: RegretFactor): string {
    const mitigationStrategies: Record<string, string> = {
      'Identity Misalignment': 'Explore ways to bring more of your authentic self to the role, or consider roles that better match your identity',
      'Lifestyle Mismatch': 'Negotiate for accommodations, set boundaries, or explore similar roles with better lifestyle fit',
      'Income Shortfall Risk': 'Develop additional income streams, negotiate compensation, or plan for career transitions',
      'Limited Future Options': 'Build transferable skills, maintain network connections, and keep options open',
      'Under-Challenge Risk': 'Seek stretch assignments, side projects, or continuous learning opportunities',
      'Values Conflict': 'Find meaning in specific aspects of work, or transition to organizations with better values alignment',
      'Poor Career Fit': 'Re-evaluate career choice, seek coaching, or plan strategic pivot',
    };

    return mitigationStrategies[factor.name] ??
      `Address ${factor.name.toLowerCase()} through targeted action and planning`;
  }
}

/**
 * Creates a default regret explanation engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured RegretExplanationEngine
 */
export function createRegretExplanationEngine(
  config?: Partial<RegretIntelligenceConfig>
): RegretExplanationEngine {
  const fullConfig: RegretIntelligenceConfig = {
    ...DEFAULT_REGRET_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new RegretExplanationEngine(fullConfig);
}
