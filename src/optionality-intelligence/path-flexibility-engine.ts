/**
 * CareerOS Optionality Intelligence Engine - Path Flexibility Engine
 *
 * Phase D.3: Optionality Intelligence Engine
 *
 * Evaluates career path flexibility and pivot potential.
 *
 * @module path-flexibility-engine
 * @version 1.0.0
 */

import type {
  CareerFlexibility,
  PivotPotential,
  LevelFlexibility,
  FlexibilityFactor,
  PivotTarget,
  PivotBarrier,
  OptionalityIntelligenceConfig,
} from './optionality-types';
import type { CareerIntelligence } from '@/career-intelligence/career-types';
import type { CareerFitResult } from '@/career-fit/career-fit-types';

/**
 * Engine for evaluating career path flexibility.
 */
export class PathFlexibilityEngine {
  /** Configuration */
  private config: OptionalityIntelligenceConfig;

  /**
   * Creates a new PathFlexibilityEngine.
   *
   * @param config - Configuration
   */
  constructor(config: OptionalityIntelligenceConfig) {
    this.config = config;
  }

  /**
   * Calculates career flexibility.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Career flexibility assessment
   */
  calculateCareerFlexibility(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): CareerFlexibility {
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;

    // Base flexibility components
    const mobilityScore = advantages.careerMobility?.score ?? 50;
    const optionalityScore = advantages.optionality?.score ?? 50;
    const transferabilityScore = advantages.transferability?.score ?? 50;

    // Calculate accessible career count estimate
    const accessibleCareerCount = this.estimateAccessibleCareers(
      mobilityScore,
      optionalityScore,
      transferabilityScore
    );

    // Calculate flexibility by level
    const byLevel = this.calculateLevelFlexibility(career, mobilityScore);

    // Identify key factors
    const factors = this.identifyFlexibilityFactors(
      career,
      mobilityScore,
      optionalityScore,
      transferabilityScore,
      risks
    );

    // Calculate overall score
    const score = Math.round(
      mobilityScore * 0.35 +
      optionalityScore * 0.35 +
      transferabilityScore * 0.3
    );

    const confidence = career.evidence.overallConfidence;

    return {
      score,
      confidence,
      accessibleCareerCount,
      byLevel,
      factors,
    };
  }

  /**
   * Calculates pivot potential.
   *
   * @param career - Career intelligence
   * @param fitResult - Career fit result
   * @returns Pivot potential assessment
   */
  calculatePivotPotential(
    career: CareerIntelligence,
    fitResult: CareerFitResult
  ): PivotPotential {
    const advantages = career.careerAdvantages;
    const risks = career.careerRisks;
    const metadata = career.metadata;

    // Base components
    const transferability = advantages.transferability?.score ?? 50;
    const optionality = advantages.optionality?.score ?? 50;

    // Education barrier reduces pivot ease
    const educationBarrier = risks.educationBarrier?.score ?? 0;
    const pivotEaseBase = Math.round(
      transferability * 0.5 +
      optionality * 0.3 +
      (100 - educationBarrier) * 0.2
    );

    // Generate common pivot targets
    const commonPivots = this.generatePivotTargets(
      metadata,
      transferability,
      pivotEaseBase
    );

    // Identify barriers
    const barriers = this.identifyPivotBarriers(career, educationBarrier);

    // Calculate overall score
    const score = Math.round(
      transferability * 0.4 +
      optionality * 0.3 +
      pivotEaseBase * 0.3
    );

    const confidence = Math.round(
      (career.evidence.overallConfidence + fitResult.confidence.overall) / 2
    );

    return {
      score,
      confidence,
      pivotEase: pivotEaseBase,
      commonPivots,
      barriers,
    };
  }

  /**
   * Estimates number of accessible careers.
   *
   * @param mobility - Mobility score
   * @param optionality - Optionality score
   * @param transferability - Transferability score
   * @returns Estimated count
   */
  private estimateAccessibleCareers(
    mobility: number,
    optionality: number,
    transferability: number
  ): number {
    // Base estimate
    const baseCount = 5;

    // Scale by scores
    const mobilityMultiplier = mobility / 20; // 0-5 additional
    const optionalityMultiplier = optionality / 25; // 0-4 additional
    const transferabilityMultiplier = transferability / 33; // 0-3 additional

    const total = Math.round(
      baseCount + mobilityMultiplier + optionalityMultiplier + transferabilityMultiplier
    );

    return Math.min(Math.max(total, 3), 25); // Cap between 3 and 25
  }

  /**
   * Calculates flexibility by career level.
   *
   * @param career - Career intelligence
   * @param mobilityScore - Mobility score
   * @returns Flexibility by level
   */
  private calculateLevelFlexibility(
    career: CareerIntelligence,
    mobilityScore: number
  ): LevelFlexibility[] {
    const levels: LevelFlexibility[] = [];

    // Entry level - high flexibility
    levels.push({
      level: 'ENTRY',
      score: Math.min(mobilityScore + 15, 100),
      transitionCount: Math.round(mobilityScore / 10) + 3,
      commonTransitions: ['Lateral moves', 'Specialization', 'Industry switching'],
    });

    // Mid level - moderate flexibility
    levels.push({
      level: 'MID',
      score: mobilityScore,
      transitionCount: Math.round(mobilityScore / 12) + 2,
      commonTransitions: ['Management track', 'Specialist track', 'Pivot to adjacent'],
    });

    // Senior level - depends on specialization
    const specializationFactor = career.careerAdvantages.optionality?.score ?? 50;
    levels.push({
      level: 'SENIOR',
      score: Math.round((mobilityScore + specializationFactor) / 2),
      transitionCount: Math.round(mobilityScore / 15) + 1,
      commonTransitions: ['Executive roles', 'Consulting', 'Advisory'],
    });

    // Executive level - limited but high-impact options
    levels.push({
      level: 'EXECUTIVE',
      score: Math.round(specializationFactor * 0.8),
      transitionCount: Math.max(Math.round(specializationFactor / 20), 2),
      commonTransitions: ['Board roles', 'C-suite', 'Entrepreneurship'],
    });

    return levels;
  }

  /**
   * Identifies flexibility factors.
   *
   * @param career - Career intelligence
   * @param mobility - Mobility score
   * @param optionality - Optionality score
   * @param transferability - Transferability score
   * @param risks - Career risks
   * @returns Flexibility factors
   */
  private identifyFlexibilityFactors(
    career: CareerIntelligence,
    mobility: number,
    optionality: number,
    transferability: number,
    risks: CareerIntelligence['careerRisks']
  ): FlexibilityFactor[] {
    const factors: FlexibilityFactor[] = [];

    // Positive factors
    if (mobility >= 70) {
      factors.push({
        name: 'Career Mobility',
        description: 'Multiple advancement paths available',
        impact: 20,
        direction: 'POSITIVE',
      });
    }

    if (optionality >= 70) {
      factors.push({
        name: 'High Optionality',
        description: 'Many career paths remain open',
        impact: 18,
        direction: 'POSITIVE',
      });
    }

    if (transferability >= 70) {
      factors.push({
        name: 'Transferable Skills',
        description: 'Skills applicable across many roles',
        impact: 15,
        direction: 'POSITIVE',
      });
    }

    // Negative factors
    if (risks.educationBarrier?.score ?? 0 > 60) {
      factors.push({
        name: 'Education Barrier',
        description: 'Advanced credentials required for transitions',
        impact: -15,
        direction: 'NEGATIVE',
      });
    }

    if (risks.automationRisk?.score ?? 0 > 60) {
      factors.push({
        name: 'Automation Risk',
        description: 'Role vulnerability may force unwanted transitions',
        impact: -12,
        direction: 'NEGATIVE',
      });
    }

    if (risks.competitionRisk?.score ?? 0 > 70) {
      factors.push({
        name: 'High Competition',
        description: 'Difficult to secure alternative positions',
        impact: -10,
        direction: 'NEGATIVE',
      });
    }

    return factors;
  }

  /**
   * Generates pivot targets.
   *
   * @param metadata - Career metadata
   * @param transferability - Transferability score
   * @param pivotEase - Pivot ease score
   * @returns Common pivot targets
   */
  private generatePivotTargets(
    metadata: CareerIntelligence['metadata'],
    transferability: number,
    pivotEase: number
  ): PivotTarget[] {
    const targets: PivotTarget[] = [];

    // Common pivot patterns by category
    const pivotPatterns: Record<string, string[]> = {
      ENGINEERING: ['Product Manager', 'Engineering Manager', 'Solutions Architect', 'Technical Consultant'],
      PRODUCT: ['Product Manager', 'Product Marketing', 'Strategy', 'Operations'],
      MARKETING: ['Brand Manager', 'Product Marketing', 'Growth', 'Consulting'],
      SALES: ['Business Development', 'Account Management', 'Customer Success', 'Entrepreneurship'],
      FINANCE: ['Consulting', 'Strategy', 'Operations', 'Fintech'],
      CONSULTING: ['Strategy', 'Operations', 'Product', 'Entrepreneurship'],
      OPERATIONS: ['Program Management', 'Strategy', 'Consulting', 'General Management'],
      RESEARCH: ['Product', 'Strategy', 'Consulting', 'Specialized Expert'],
    };

    const patterns = pivotPatterns[metadata.category.toUpperCase()] ?? [
      'Consulting',
      'Management',
      'Specialized Expert',
    ];

    patterns.forEach((title, index) => {
      const difficulty = Math.round(40 + index * 15 - transferability * 0.2);
      const likelihood = Math.round(pivotEase * 0.8 - index * 10);

      targets.push({
        careerId: `pivot-${index}`,
        title,
        difficulty: Math.max(20, Math.min(difficulty, 90)),
        likelihood: Math.max(20, Math.min(likelihood, 90)),
        transitionPath: `Leverage ${metadata.category} experience in ${title} role`,
      });
    });

    return targets;
  }

  /**
   * Identifies pivot barriers.
   *
   * @param career - Career intelligence
   * @param educationBarrier - Education barrier score
   * @returns Pivot barriers
   */
  private identifyPivotBarriers(
    career: CareerIntelligence,
    educationBarrier: number
  ): PivotBarrier[] {
    const barriers: PivotBarrier[] = [];

    if (educationBarrier > 50) {
      barriers.push({
        type: 'CERTIFICATION',
        description: 'Additional credentials may be required',
        severity: educationBarrier,
        isSurmountable: educationBarrier < 80,
      });
    }

    const competitionRisk = career.careerRisks.competitionRisk?.score ?? 0;
    if (competitionRisk > 60) {
      barriers.push({
        type: 'EXPERIENCE',
        description: 'High competition requires exceptional experience',
        severity: competitionRisk,
        isSurmountable: true,
      });
    }

    const technicalRole = this.isTechnicalRole(career.metadata.category);
    if (technicalRole) {
      barriers.push({
        type: 'SKILL_GAP',
        description: 'Technical specialization may limit non-technical pivots',
        severity: 50,
        isSurmountable: true,
      });
    }

    return barriers;
  }

  /**
   * Determines if role is technical.
   *
   * @param category - Career category
   * @returns Whether technical
   */
  private isTechnicalRole(category: string): boolean {
    const technicalCategories = ['ENGINEERING', 'TECHNOLOGY', 'RESEARCH', 'SCIENCE', 'DEVELOPMENT'];
    return technicalCategories.some((tc) => category.toUpperCase().includes(tc));
  }
}

/**
 * Creates a default path flexibility engine.
 *
 * @param config - Optional partial configuration
 * @returns Configured PathFlexibilityEngine
 */
export function createPathFlexibilityEngine(
  config?: Partial<OptionalityIntelligenceConfig>
): PathFlexibilityEngine {
  const fullConfig: OptionalityIntelligenceConfig = {
    ...import('./optionality-types').DEFAULT_OPTIONALITY_INTELLIGENCE_CONFIG,
    ...config,
  };

  return new PathFlexibilityEngine(fullConfig);
}
