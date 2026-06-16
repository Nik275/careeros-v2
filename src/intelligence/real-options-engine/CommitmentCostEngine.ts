/**
 * CareerOS Real Options Theory Engine - Commitment Cost Engine
 *
 * Measures:
 * - Years invested
 * - Money invested
 * - Specialization intensity
 * - Switching difficulty
 */

import type {
  CareerId,
  CommitmentCostCalculation,
  RealOptionsEngineConfig,
  CommitmentLevel,
  LockInType,
} from './types';

import type {
  CriticalityAnalysis,
} from '../criticality-engine';

import type {
  OptionalityAnalysis,
} from '../optionality-engine';

/**
 * Calculates commitment costs of a career.
 */
export class CommitmentCostEngine {
  private config: RealOptionsEngineConfig;

  constructor(config: RealOptionsEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate commitment cost.
   */
  calculate(
    careerId: CareerId,
    criticalityAnalysis: CriticalityAnalysis,
    optionalityAnalysis: OptionalityAnalysis
  ): CommitmentCostCalculation {
    // Calculate years invested
    const yearsInvested = this.calculateYearsInvested(
      criticalityAnalysis
    );

    // Calculate money invested
    const moneyInvested = this.calculateMoneyInvested(
      criticalityAnalysis,
      yearsInvested
    );

    // Calculate specialization intensity
    const specializationIntensity = this.calculateSpecializationIntensity(
      criticalityAnalysis,
      optionalityAnalysis
    );

    // Calculate switching difficulty
    const switchingDifficulty = this.calculateSwitchingDifficulty(
      criticalityAnalysis,
      yearsInvested,
      moneyInvested,
      specializationIntensity
    );

    // Calculate lock-in effects
    const lockInEffects = this.calculateLockInEffects(
      criticalityAnalysis,
      specializationIntensity
    );

    // Calculate total cost
    const totalCost = this.calculateTotalCost(
      yearsInvested,
      moneyInvested,
      specializationIntensity,
      switchingDifficulty
    );

    // Determine commitment level
    const commitmentLevel = this.determineCommitmentLevel(totalCost);

    // Generate explanation
    const explanation = this.generateExplanation(
      yearsInvested,
      moneyInvested,
      specializationIntensity,
      switchingDifficulty,
      lockInEffects
    );

    return {
      careerId,
      totalCost,
      commitmentLevel,
      yearsInvested,
      moneyInvested,
      specializationIntensity,
      switchingDifficulty,
      lockInEffects,
      explanation,
    };
  }

  /**
   * Calculate years invested.
   */
  private calculateYearsInvested(
    criticalityAnalysis: CriticalityAnalysis
  ): CommitmentCostCalculation['yearsInvested'] {
    // Education years based on criticality
    let education = 4; // Default bachelor's
    
    switch (criticalityAnalysis.category) {
      case 'low':
        education = 2;
        break;
      case 'moderate':
        education = 4;
        break;
      case 'high':
        education = 6; // Master's or equivalent
        break;
      case 'extreme':
        education = 8; // PhD, MD, etc.
        break;
    }

    // Training years
    const training = Math.max(1, Math.round(education * 0.25));

    // Experience years to achieve flexibility
    const experience = Math.round(
      criticalityAnalysis.metrics.timeToFlexibility?.value || 4
    );

    return {
      education,
      training,
      experience,
      total: education + training + experience,
    };
  }

  /**
   * Calculate money invested.
   */
  private calculateMoneyInvested(
    criticalityAnalysis: CriticalityAnalysis,
    yearsInvested: CommitmentCostCalculation['yearsInvested']
  ): CommitmentCostCalculation['moneyInvested'] {
    // Education costs (in thousands)
    const education = yearsInvested.education * 15; // $15k per year average

    // Training costs
    const training = yearsInvested.training * 5;

    // Credential costs (licenses, certifications)
    let credentials = 5; // Base
    if (criticalityAnalysis.category === 'high') {
      credentials = 15;
    } else if (criticalityAnalysis.category === 'extreme') {
      credentials = 30;
    }

    return {
      education,
      training,
      credentials,
      total: education + training + credentials,
    };
  }

  /**
   * Calculate specialization intensity.
   */
  private calculateSpecializationIntensity(
    criticalityAnalysis: CriticalityAnalysis,
    optionalityAnalysis: OptionalityAnalysis
  ): CommitmentCostCalculation['specializationIntensity'] {
    // Score based on criticality
    let score = 50;
    switch (criticalityAnalysis.category) {
      case 'low':
        score = 25;
        break;
      case 'moderate':
        score = 50;
        break;
      case 'high':
        score = 75;
        break;
      case 'extreme':
        score = 95;
        break;
    }

    // Determine depth
    let depth: CommitmentCostCalculation['specializationIntensity']['depth'] = 'focused';
    if (score < 20) depth = 'generalist';
    else if (score < 40) depth = 'broad';
    else if (score < 60) depth = 'focused';
    else if (score < 80) depth = 'deep';
    else depth = 'expert';

    // Breadth (inverse of specialization)
    const breadth = 100 - score;

    // Transferability from optionality
    const transferableSkillsDim = optionalityAnalysis.dimensions?.transferableSkills;
    const transferability = transferableSkillsDim
      ? transferableSkillsDim.score * 100
      : 50;

    return {
      score,
      depth,
      breadth,
      transferability,
    };
  }

  /**
   * Calculate switching difficulty.
   */
  private calculateSwitchingDifficulty(
    criticalityAnalysis: CriticalityAnalysis,
    yearsInvested: CommitmentCostCalculation['yearsInvested'],
    moneyInvested: CommitmentCostCalculation['moneyInvested'],
    specializationIntensity: CommitmentCostCalculation['specializationIntensity']
  ): CommitmentCostCalculation['switchingDifficulty'] {
    // Financial barrier
    const financial = Math.min(
      moneyInvested.total / 3, // Normalize
      100
    );

    // Temporal barrier
    const temporal = Math.min(yearsInvested.total * 8, 100);

    // Psychological barrier (based on specialization)
    const psychological = specializationIntensity.score;

    // Social barrier (based on network investment)
    const social = Math.min(yearsInvested.experience * 5, 100);

    // Overall difficulty
    const overall = Math.round(
      financial * this.config.switchingDifficultyWeight +
        temporal * this.config.yearsWeight +
        psychological * this.config.specializationWeight +
        social * 0.25
    );

    return {
      overall,
      financial: Math.round(financial),
      temporal: Math.round(temporal),
      psychological: Math.round(psychological),
      social: Math.round(social),
    };
  }

  /**
   * Calculate lock-in effects.
   */
  private calculateLockInEffects(
    criticalityAnalysis: CriticalityAnalysis,
    specializationIntensity: CommitmentCostCalculation['specializationIntensity']
  ): CommitmentCostCalculation['lockInEffects'] {
    const effects: CommitmentCostCalculation['lockInEffects'] = [];

    // Education lock-in
    if (criticalityAnalysis.metrics.reversibility?.value || 50 < 50) {
      effects.push({
        type: 'education',
        severity: 'high',
        description: 'Significant education investment required',
      });
    }

    // Credential lock-in
    if (criticalityAnalysis.category === 'high' || criticalityAnalysis.category === 'extreme') {
      effects.push({
        type: 'credential',
        severity: 'high',
        description: 'Professional credentials are non-transferable',
      });
    }

    // Specialization lock-in
    if (specializationIntensity.depth === 'deep' || specializationIntensity.depth === 'expert') {
      effects.push({
        type: 'specialization',
        severity: 'severe',
        description: 'Deep specialization limits alternative paths',
      });
    }

    // Financial lock-in
    if (criticalityAnalysis.metrics.reachableCareerCount.value < 10) {
      effects.push({
        type: 'financial',
        severity: 'moderate',
        description: 'Limited reachable careers reduce financial flexibility',
      });
    }

    // Time lock-in
    const timeToFlex = criticalityAnalysis.metrics.timeToFlexibility?.value || 4;
    if (timeToFlex > 5) {
      effects.push({
        type: 'time',
        severity: 'high',
        description: `${timeToFlex} years to achieve career flexibility`,
      });
    }

    // Geographic lock-in (if extreme criticality)
    if (criticalityAnalysis.category === 'extreme') {
      effects.push({
        type: 'geographic',
        severity: 'moderate',
        description: 'Limited geographic mobility due to specialized markets',
      });
    }

    return effects;
  }

  /**
   * Calculate total commitment cost.
   */
  private calculateTotalCost(
    yearsInvested: CommitmentCostCalculation['yearsInvested'],
    moneyInvested: CommitmentCostCalculation['moneyInvested'],
    specializationIntensity: CommitmentCostCalculation['specializationIntensity'],
    switchingDifficulty: CommitmentCostCalculation['switchingDifficulty']
  ): number {
    // Normalize components
    const yearsScore = Math.min(yearsInvested.total * 8, 100);
    const moneyScore = Math.min(moneyInvested.total / 2, 100);
    const specializationScore = specializationIntensity.score;
    const switchingScore = switchingDifficulty.overall;

    // Weighted total
    return Math.round(
      yearsScore * this.config.yearsWeight +
        moneyScore * this.config.moneyWeight +
        specializationScore * this.config.specializationWeight +
        switchingScore * this.config.switchingDifficultyWeight
    );
  }

  /**
   * Determine commitment level.
   */
  private determineCommitmentLevel(
    totalCost: number
  ): CommitmentLevel {
    if (totalCost < 30) return 'low';
    if (totalCost < 55) return 'moderate';
    if (totalCost < 80) return 'high';
    return 'extreme';
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    yearsInvested: CommitmentCostCalculation['yearsInvested'],
    moneyInvested: CommitmentCostCalculation['moneyInvested'],
    specializationIntensity: CommitmentCostCalculation['specializationIntensity'],
    switchingDifficulty: CommitmentCostCalculation['switchingDifficulty'],
    lockInEffects: CommitmentCostCalculation['lockInEffects']
  ): string[] {
    const explanation: string[] = [];

    explanation.push(
      `Total time investment: ${yearsInvested.total} years (${yearsInvested.education} education, ${yearsInvested.training} training, ${yearsInvested.experience} to flexibility)`
    );

    explanation.push(
      `Estimated financial investment: $${moneyInvested.total}k ($${moneyInvested.education}k education, $${moneyInvested.training}k training, $${moneyInvested.credentials}k credentials)`
    );

    explanation.push(
      `Specialization depth: ${specializationIntensity.depth} (${Math.round(specializationIntensity.score)}% intensity)`
    );

    explanation.push(
      `Skill transferability: ${Math.round(specializationIntensity.transferability)}%`
    );

    explanation.push(
      `Overall switching difficulty: ${switchingDifficulty.overall}%`
    );

    if (lockInEffects.length > 0) {
      explanation.push(
        `Lock-in effects: ${lockInEffects.map((e) => e.type).join(', ')}`
      );
    }

    return explanation;
  }
}

/**
 * Factory function for CommitmentCostEngine.
 */
export function createCommitmentCostEngine(
  config: RealOptionsEngineConfig
): CommitmentCostEngine {
  return new CommitmentCostEngine(config);
}
