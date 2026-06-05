/**
 * CareerOS Regret Intelligence Engine - Regret Scenario Engine
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Generates best, expected, and worst case regret scenarios.
 *
 * @module regret-scenario-engine
 * @version 1.0.0
 */

import type {
  RegretScenarios,
  RegretScenario,
  RegretBreakdown,
  RegretIntelligenceConfig,
  RegretDimensionType,
} from './regret-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';

/**
 * Engine for generating regret scenarios.
 */
export class RegretScenarioEngine {
  /** Configuration */
  private config: RegretIntelligenceConfig;

  /**
   * Creates a new RegretScenarioEngine.
   *
   * @param config - Configuration
   */
  constructor(config: RegretIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Generates all regret scenarios.
   *
   * @param overallRegretRisk - Overall regret risk score
   * @param breakdown - Regret breakdown
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Complete scenarios
   */
  generateScenarios(
    overallRegretRisk: number,
    breakdown: RegretBreakdown,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): RegretScenarios {
    return {
      bestCase: this.generateBestCase(overallRegretRisk, breakdown, career, fitResult),
      expectedCase: this.generateExpectedCase(overallRegretRisk, breakdown, career),
      worstCase: this.generateWorstCase(overallRegretRisk, breakdown, career, fitResult),
    };
  }

  /**
   * Generates best case scenario.
   *
   * @param overallRegretRisk - Overall regret risk
   * @param breakdown - Regret breakdown
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Best case scenario
   */
  private generateBestCase(
    overallRegretRisk: number,
    breakdown: RegretBreakdown,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): RegretScenario {
    // Best case: regret risk reduced by 50-70%
    const reductionFactor = 0.6;
    const regretLevel = Math.round(overallRegretRisk * (1 - reductionFactor));

    const conditions: string[] = [];
    const factors: string[] = [];

    // Build conditions based on mitigating factors
    if (breakdown.identity.score < 50) {
      conditions.push('Strong alignment between personal identity and career develops over time');
      factors.push('Identity fit strengthens');
    }

    if (breakdown.lifestyle.score < 50) {
      conditions.push('Lifestyle preferences are well accommodated');
      factors.push('Lifestyle satisfaction remains high');
    }

    if (breakdown.financial.score < 50) {
      conditions.push('Financial outcomes meet or exceed expectations');
      factors.push('Financial satisfaction achieved');
    }

    if (breakdown.growth.score < 50) {
      conditions.push('Continuous learning and development opportunities emerge');
      factors.push('Growth needs are met');
    }

    if (breakdown.values.score < 50) {
      conditions.push('Values alignment deepens through meaningful work');
      factors.push('Values conflicts are resolved');
    }

    if (breakdown.opportunity.score < 50) {
      conditions.push('New opportunities arise that were not initially apparent');
      factors.push('Optionality preserved or enhanced');
    }

    // Add general positive conditions
    conditions.push('Career progresses favorably with unexpected opportunities');
    conditions.push('Personal circumstances align well with career demands');

    // Build description
    let description: string;
    if (regretLevel <= 15) {
      description = `In the best case, choosing ${career.careerTitle} proves to be an excellent decision with minimal regret. The career aligns well with your evolving identity, provides the lifestyle you desire, meets financial expectations, offers continuous growth, and remains consistent with your core values.`;
    } else if (regretLevel <= 30) {
      description = `In the best case, ${career.careerTitle} becomes a satisfying path. While some minor adjustments may be needed, overall the career provides what you need and want, resulting in low regret.`;
    } else {
      description = `In the best case, ${career.careerTitle} exceeds initial expectations. Challenges that were anticipated either do not materialize or are successfully navigated, resulting in lower-than-expected regret.`;
    }

    return {
      type: 'BEST',
      description,
      regretLevel,
      conditions: conditions.slice(0, 4),
      factors: factors.slice(0, 3),
    };
  }

  /**
   * Generates expected case scenario.
   *
   * @param overallRegretRisk - Overall regret risk
   * @param breakdown - Regret breakdown
   * @param career - Career intelligence
   * @returns Expected case scenario
   */
  private generateExpectedCase(
    overallRegretRisk: number,
    breakdown: RegretBreakdown,
    career: CareerIntelligence
  ): RegretScenario {
    // Expected case: close to current assessment
    const regretLevel = overallRegretRisk;

    const conditions: string[] = [];
    const factors: string[] = [];

    // Identify expected conditions based on dimensions
    const highRiskDimensions: RegretDimensionType[] = [];
    const lowRiskDimensions: RegretDimensionType[] = [];

    if (breakdown.identity.score >= 60) highRiskDimensions.push('IDENTITY');
    else lowRiskDimensions.push('IDENTITY');

    if (breakdown.lifestyle.score >= 60) highRiskDimensions.push('LIFESTYLE');
    else lowRiskDimensions.push('LIFESTYLE');

    if (breakdown.financial.score >= 60) highRiskDimensions.push('FINANCIAL');
    else lowRiskDimensions.push('FINANCIAL');

    if (breakdown.opportunity.score >= 60) highRiskDimensions.push('OPPORTUNITY');
    else lowRiskDimensions.push('OPPORTUNITY');

    if (breakdown.growth.score >= 60) highRiskDimensions.push('GROWTH');
    else lowRiskDimensions.push('GROWTH');

    if (breakdown.values.score >= 60) highRiskDimensions.push('VALUES');
    else lowRiskDimensions.push('VALUES');

    // Build conditions from risk assessment
    if (highRiskDimensions.length > 0) {
      conditions.push(`${highRiskDimensions.join(', ')} concerns materialize as expected`);
    }

    if (lowRiskDimensions.length > 0) {
      conditions.push(`${lowRiskDimensions.join(', ')} areas remain manageable`);
    }

    conditions.push('Career follows typical trajectory without major surprises');

    // Build factors
    if (breakdown.identity.score >= 50) {
      factors.push('Some identity misalignment persists');
    }

    if (breakdown.lifestyle.score >= 50) {
      factors.push('Lifestyle trade-offs occur as anticipated');
    }

    if (breakdown.financial.score >= 50) {
      factors.push('Financial expectations are partially met');
    }

    if (breakdown.growth.score >= 50) {
      factors.push('Growth plateaus in some areas');
    }

    // Build description
    let description: string;
    if (regretLevel <= 25) {
      description = `In the expected case, ${career.careerTitle} is a reasonably good fit. Some minor sources of regret exist, but they are manageable and do not significantly impact overall satisfaction.`;
    } else if (regretLevel <= 50) {
      description = `In the expected case, ${career.careerTitle} presents noticeable trade-offs. While some aspects of the career satisfy you, other areas create ongoing tension and moderate regret.`;
    } else if (regretLevel <= 75) {
      description = `In the expected case, ${career.careerTitle} leads to significant regret. Multiple areas of misalignment create ongoing dissatisfaction, though some positive aspects remain.`;
    } else {
      description = `In the expected case, ${career.careerTitle} results in substantial regret. The career proves to be a poor fit across several important dimensions.`;
    }

    return {
      type: 'EXPECTED',
      description,
      regretLevel,
      conditions: conditions.slice(0, 4),
      factors: factors.slice(0, 3),
    };
  }

  /**
   * Generates worst case scenario.
   *
   * @param overallRegretRisk - Overall regret risk
   * @param breakdown - Regret breakdown
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Worst case scenario
   */
  private generateWorstCase(
    overallRegretRisk: number,
    breakdown: RegretBreakdown,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): RegretScenario {
    // Worst case: regret risk amplified by 30-50%
    const amplificationFactor = 0.4;
    const regretLevel = Math.min(100, Math.round(overallRegretRisk * (1 + amplificationFactor)));

    const conditions: string[] = [];
    const factors: string[] = [];

    // Build conditions based on risk factors materializing
    if (breakdown.identity.score >= 50) {
      conditions.push('Identity conflicts intensify as career progresses');
      factors.push('Identity misalignment becomes acute');
    }

    if (breakdown.lifestyle.score >= 50) {
      conditions.push('Lifestyle constraints become more restrictive than anticipated');
      factors.push('Lifestyle dissatisfaction grows');
    }

    if (breakdown.financial.score >= 50) {
      conditions.push('Financial outcomes fall short of expectations');
      factors.push('Financial stress compounds other issues');
    }

    if (breakdown.opportunity.score >= 50) {
      conditions.push('Alternative paths become unavailable');
      factors.push('Trapped feeling intensifies');
    }

    if (breakdown.growth.score >= 50) {
      conditions.push('Growth stagnates and skills become outdated');
      factors.push('Stagnation creates frustration');
    }

    if (breakdown.values.score >= 50) {
      conditions.push('Values conflicts deepen as awareness increases');
      factors.push('Values misalignment causes moral distress');
    }

    // Add general negative conditions
    conditions.push('Personal circumstances change in ways that increase conflict');
    conditions.push('External factors (market, industry) reduce available options');

    // Build description
    let description: string;
    if (regretLevel <= 40) {
      description = `In the worst case, ${career.careerTitle} presents more challenges than expected, but regret remains manageable. Adjustments are required, and some dissatisfaction persists.`;
    } else if (regretLevel <= 60) {
      description = `In the worst case, ${career.careerTitle} leads to meaningful regret. Multiple areas of the career prove disappointing, though some aspects remain salvageable.`;
    } else if (regretLevel <= 80) {
      description = `In the worst case, ${career.careerTitle} results in significant regret. The career proves to be a poor fit for your identity, lifestyle needs, or values, creating substantial dissatisfaction.`;
    } else {
      description = `In the worst case, ${career.careerTitle} leads to severe regret. Fundamental misalignments across multiple dimensions make this a deeply unsatisfying choice that may require major career changes to resolve.`;
    }

    return {
      type: 'WORST',
      description,
      regretLevel,
      conditions: conditions.slice(0, 4),
      factors: factors.slice(0, 3),
    };
  }

  /**
   * Gets scenario implications for a specific dimension.
   *
   * @param dimension - Regret dimension
   * @param score - Dimension score
   * @returns Implications for scenarios
   */
  getDimensionImplications(
    dimension: RegretDimensionType,
    score: number
  ): { bestCase: string; worstCase: string } {
    const implications: Record<RegretDimensionType, { bestCase: string; worstCase: string }> = {
      IDENTITY: {
        bestCase: 'Career aligns well with your true self',
        worstCase: 'Daily work feels inauthentic and draining',
      },
      LIFESTYLE: {
        bestCase: 'Lifestyle needs are fully accommodated',
        worstCase: 'Work demands conflict with life priorities',
      },
      FINANCIAL: {
        bestCase: 'Financial security and satisfaction achieved',
        worstCase: 'Financial stress undermines other satisfaction',
      },
      OPPORTUNITY: {
        bestCase: 'New opportunities continue to emerge',
        worstCase: 'Feeling trapped with no escape routes',
      },
      GROWTH: {
        bestCase: 'Continuous development and mastery',
        worstCase: 'Stagnation and skill obsolescence',
      },
      VALUES: {
        bestCase: 'Work aligns with core values',
        worstCase: 'Values conflicts create moral distress',
      },
    };

    return implications[dimension];
  }
}

/**
 * Creates a default regret scenario engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured RegretScenarioEngine
 */
export function createRegretScenarioEngine(
  config?: Partial<RegretIntelligenceConfig>
): RegretScenarioEngine {
  const fullConfig: RegretIntelligenceConfig = {
    ...import('./regret-types').DEFAULT_REGRET_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new RegretScenarioEngine(fullConfig);
}
