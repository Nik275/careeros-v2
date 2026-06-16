/**
 * CareerOS Regret Intelligence Engine - Regret Factor Engine
 *
 * Phase D.4: Regret Intelligence Engine
 *
 * Identifies primary and secondary regret drivers.
 *
 * @module regret-factor-engine
 * @version 1.0.0
 */

import type {
  RegretFactor,
  RegretBreakdown,
  RegretIntelligenceConfig,
  RegretDimensionType,
} from './regret-types';
import { DEFAULT_REGRET_INTELLIGENCE_CONFIG } from './regret-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';

/**
 * Engine for identifying regret factors.
 */
export class RegretFactorEngine {
  /** Configuration */
  private config: RegretIntelligenceConfig;

  /**
   * Creates a new RegretFactorEngine.
   *
   * @param config - Configuration
   */
  constructor(config: RegretIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Identifies major regret factors.
   *
   * @param breakdown - Regret breakdown
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Identified regret factors
   */
  identifyRegretFactors(
    breakdown: RegretBreakdown,
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): RegretFactor[] {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    // Extract factors from each dimension
    factors.push(...this.extractIdentityFactors(breakdown.identity, career));
    factors.push(...this.extractLifestyleFactors(breakdown.lifestyle, career));
    factors.push(...this.extractFinancialFactors(breakdown.financial, career));
    factors.push(...this.extractOpportunityFactors(breakdown.opportunity, career));
    factors.push(...this.extractGrowthFactors(breakdown.growth, career));
    factors.push(...this.extractValuesFactors(breakdown.values, career));

    // Add fit-based factors
    factors.push(...this.extractFitFactors(fitResult, career));

    // Sort by importance and classify as primary/secondary
    const sortedFactors = factors
      .sort((a, b) => b.importance - a.importance)
      .slice(0, this.config.maxRegretFactors);

    // Classify top factors as primary
    const threshold = this.calculatePrimaryThreshold(sortedFactors);

    return sortedFactors.map((factor, index) => ({
      ...factor,
      priority: factor.importance >= threshold ? 'PRIMARY' : 'SECONDARY',
      id: `regret-factor-${index}`,
    }));
  }

  /**
   * Extracts factors from identity regret.
   *
   * @param identity - Identity regret
   * @param career - Career intelligence
   * @returns Identity factors
   */
  private extractIdentityFactors(
    identity: RegretBreakdown['identity'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    if (identity.score >= 60) {
      factors.push({
        name: 'Identity Misalignment',
        description: 'Career characteristics conflict with your authentic self',
        category: 'IDENTITY',
        importance: identity.score,
        evidence: identity.mismatches.map(
          (m) => `${m.studentTrait} vs ${m.careerCharacteristic}`
        ),
      });
    }

    // Add specific identity factors
    identity.factors
      .filter((f) => f.direction === 'INCREASES')
      .forEach((f) => {
        factors.push({
          name: f.name,
          description: f.description,
          category: 'IDENTITY',
          importance: f.impact,
          evidence: [f.description],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from lifestyle regret.
   *
   * @param lifestyle - Lifestyle regret
   * @param career - Career intelligence
   * @returns Lifestyle factors
   */
  private extractLifestyleFactors(
    lifestyle: RegretBreakdown['lifestyle'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    // Find high-gap lifestyle factors
    const highGapFactors = lifestyle.factors
      .filter((f) => f.gap >= 40)
      .sort((a, b) => b.gap - a.gap);

    if (highGapFactors.length > 0) {
      factors.push({
        name: 'Lifestyle Mismatch',
        description: `Significant gap between desired and actual ${highGapFactors[0].name.toLowerCase().replace(/_/g, ' ')}`,
        category: 'LIFESTYLE',
        importance: Math.round(highGapFactors[0].regretRisk),
        evidence: highGapFactors.slice(0, 2).map(
          (f) => `Desired: ${f.desiredLevel}/100, Actual: ${f.actualLevel}/100`
        ),
      });
    }

    // Add individual significant factors
    lifestyle.factors
      .filter((f) => f.regretRisk >= 60)
      .forEach((f) => {
        factors.push({
          name: `${f.name.replace(/_/g, ' ')} Gap`,
          description: f.description,
          category: 'LIFESTYLE',
          importance: f.regretRisk,
          evidence: [`Gap of ${f.gap} points between desired and actual`],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from financial regret.
   *
   * @param financial - Financial regret
   * @param career - Career intelligence
   * @returns Financial factors
   */
  private extractFinancialFactors(
    financial: RegretBreakdown['financial'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    if (financial.incomeAdequacy.shortfallRisk > 40) {
      factors.push({
        name: 'Income Shortfall Risk',
        description: 'Career income may not meet minimum requirements',
        category: 'FINANCIAL',
        importance: financial.incomeAdequacy.shortfallRisk,
        evidence: [
          `Minimum acceptable: $${financial.incomeAdequacy.minimumAcceptable.toLocaleString()}`,
          `Expected income: $${financial.incomeAdequacy.expectedIncome.toLocaleString()}`,
          `Buffer: ${financial.incomeAdequacy.buffer}%`,
        ],
      });
    }

    if (financial.growthPotential.ceilingRisk > 50) {
      factors.push({
        name: 'Income Ceiling',
        description: 'Limited potential for salary growth over career',
        category: 'FINANCIAL',
        importance: financial.growthPotential.ceilingRisk,
        evidence: [
          `Current potential: ${financial.growthPotential.currentPotential}/100`,
          `Ceiling risk: ${financial.growthPotential.ceilingRisk}/100`,
        ],
      });
    }

    // Add individual factors
    financial.factors
      .filter((f) => f.impact >= 50)
      .forEach((f) => {
        factors.push({
          name: f.name,
          description: f.description,
          category: 'FINANCIAL',
          importance: f.impact,
          evidence: [f.description],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from opportunity regret.
   *
   * @param opportunity - Opportunity regret
   * @param career - Career intelligence
   * @returns Opportunity factors
   */
  private extractOpportunityFactors(
    opportunity: RegretBreakdown['opportunity'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    if (opportunity.lostOptionality >= 50) {
      factors.push({
        name: 'Limited Future Options',
        description: 'This career path closes off many alternative paths',
        category: 'OPPORTUNITY',
        importance: opportunity.lostOptionality,
        evidence: [
          `Optionality score: ${opportunity.optionalityReference.overallOptionality}/100`,
          `Paths potentially closed: ${opportunity.optionalityReference.pathsClosed}`,
        ],
      });
    }

    // Add specific opportunities at risk
    opportunity.opportunitiesAtRisk
      .filter((o) => o.regretIfLost >= 60)
      .slice(0, 2)
      .forEach((o) => {
        factors.push({
          name: `Lost Opportunity: ${o.name}`,
          description: `${o.type} becomes inaccessible`,
          category: 'OPPORTUNITY',
          importance: o.regretIfLost,
          evidence: [
            `Attractiveness: ${o.attractiveness}/100`,
            `Likelihood of interest: ${o.likelihoodOfInterest}/100`,
          ],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from growth regret.
   *
   * @param growth - Growth regret
   * @param career - Career intelligence
   * @returns Growth factors
   */
  private extractGrowthFactors(
    growth: RegretBreakdown['growth'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    if (growth.learningOpportunity.skillAcquisitionRate === 'LOW') {
      factors.push({
        name: 'Limited Learning',
        description: 'Career offers few opportunities for new skill development',
        category: 'GROWTH',
        importance: 65,
        evidence: [
          `Learning score: ${growth.learningOpportunity.score}/100`,
          `Skill acquisition rate: ${growth.learningOpportunity.skillAcquisitionRate}`,
        ],
      });
    }

    if (growth.challengeLevel.underChallengeRisk >= 50) {
      factors.push({
        name: 'Under-Challenge Risk',
        description: 'Career may not provide sufficient intellectual challenge',
        category: 'GROWTH',
        importance: growth.challengeLevel.underChallengeRisk,
        evidence: [
          `Challenge level: ${growth.challengeLevel.score}/100`,
          `Under-challenge risk: ${growth.challengeLevel.underChallengeRisk}/100`,
        ],
      });
    }

    if (growth.masteryPotential.expertiseCeiling === 'LOW') {
      factors.push({
        name: 'Low Mastery Ceiling',
        description: 'Limited potential for becoming an expert in the field',
        category: 'GROWTH',
        importance: 60,
        evidence: [
          `Mastery potential: ${growth.masteryPotential.score}/100`,
          `Expertise ceiling: ${growth.masteryPotential.expertiseCeiling}`,
        ],
      });
    }

    // Add individual factors
    growth.factors
      .filter((f) => f.impact >= 50)
      .forEach((f) => {
        factors.push({
          name: f.name,
          description: f.description,
          category: 'GROWTH',
          importance: f.impact,
          evidence: [f.description],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from values regret.
   *
   * @param values - Values regret
   * @param career - Career intelligence
   * @returns Values factors
   */
  private extractValuesFactors(
    values: RegretBreakdown['values'],
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    if (values.valuesAlignment.conflictingCount > 0) {
      factors.push({
        name: 'Values Conflict',
        description: 'Career conflicts with one or more deeply held values',
        category: 'VALUES',
        importance: values.score,
        evidence: [
          `Aligned values: ${values.valuesAlignment.alignedCount}`,
          `Conflicting values: ${values.valuesAlignment.conflictingCount}`,
          `Overall alignment: ${values.valuesAlignment.score}/100`,
        ],
      });
    }

    // Add specific conflicts
    values.conflicts
      .filter((c) => c.severity >= 50)
      .slice(0, 2)
      .forEach((c) => {
        factors.push({
          name: `Values Conflict: ${c.studentValue}`,
          description: c.careerConflict,
          category: 'VALUES',
          importance: c.severity,
          evidence: [`Severity: ${c.severity}/100`],
        });
      });

    // Add individual factors
    values.factors
      .filter((f) => f.impact >= 50)
      .forEach((f) => {
        factors.push({
          name: f.name,
          description: f.description,
          category: 'VALUES',
          importance: f.impact,
          evidence: [f.description],
        });
      });

    return factors;
  }

  /**
   * Extracts factors from fit result.
   *
   * @param fitResult - Career fit result
   * @param career - Career intelligence
   * @returns Fit-based factors
   */
  private extractFitFactors(
    fitResult: CareerFitResult,
    career: CareerIntelligence
  ): Array<Omit<RegretFactor, 'id' | 'priority'>> {
    const factors: Array<Omit<RegretFactor, 'id' | 'priority'>> = [];

    const overallFit = fitResult.overallFitScore ?? 50;

    if (overallFit < 40) {
      factors.push({
        name: 'Poor Career Fit',
        description: 'Low overall compatibility between profile and career',
        category: 'IDENTITY',
        importance: Math.round(100 - overallFit),
        evidence: [`Overall fit: ${overallFit}/100`],
      });
    }

    // Check specific fit dimensions
    const cognitiveFit = fitResult.breakdown.cognitive.score ?? 50;

    if (cognitiveFit < 45) {
      factors.push({
        name: 'Cognitive Mismatch',
        description: 'Your cognitive preferences do not align with career demands',
        category: 'IDENTITY',
        importance: Math.round(100 - cognitiveFit),
        evidence: ['Cognitive fit below threshold'],
      });
    }

    return factors;
  }

  /**
   * Calculates threshold for primary factor classification.
   *
   * @param factors - Sorted factors
   * @returns Primary factor threshold
   */
  private calculatePrimaryThreshold(factors: Array<{ importance: number }>): number {
    if (factors.length === 0) return 70;

    // Top 40% or score >= 65, whichever is higher
    const topCount = Math.max(1, Math.ceil(factors.length * 0.4));
    const topFactorThreshold = factors[topCount - 1]?.importance ?? 65;

    return Math.max(65, topFactorThreshold);
  }

  /**
   * Gets top primary factors.
   *
   * @param factors - All regret factors
   * @returns Primary factors only
   */
  getPrimaryFactors(factors: RegretFactor[]): RegretFactor[] {
    return factors.filter((f) => f.priority === 'PRIMARY');
  }

  /**
   * Gets secondary factors.
   *
   * @param factors - All regret factors
   * @returns Secondary factors only
   */
  getSecondaryFactors(factors: RegretFactor[]): RegretFactor[] {
    return factors.filter((f) => f.priority === 'SECONDARY');
  }
}

/**
 * Creates a default regret factor engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured RegretFactorEngine
 */
export function createRegretFactorEngine(
  config?: Partial<RegretIntelligenceConfig>
): RegretFactorEngine {
  const fullConfig: RegretIntelligenceConfig = {
    ...DEFAULT_REGRET_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new RegretFactorEngine(fullConfig);
}
