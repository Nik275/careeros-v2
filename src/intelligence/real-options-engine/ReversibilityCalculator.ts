/**
 * CareerOS Real Options Theory Engine - Reversibility Calculator
 *
 * Evaluates:
 * - Time cost
 * - Education lock-in
 * - Credential lock-in
 * - Sunk cost
 */

import type {
  CareerId,
  ReversibilityCalculation,
  RealOptionsEngineConfig,
} from './types';

import type {
  CriticalityAnalysis,
} from '../criticality-engine';

import type {
  CareerTransitionEdge,
} from '../career-graph-v2';

/**
 * Calculates reversibility of a career.
 */
export class ReversibilityCalculator {
  private config: RealOptionsEngineConfig;

  constructor(config: RealOptionsEngineConfig) {
    this.config = config;
  }

  /**
   * Main entry point: calculate reversibility.
   */
  calculate(
    careerId: CareerId,
    criticalityAnalysis: CriticalityAnalysis,
    transitionEdges: CareerTransitionEdge[]
  ): ReversibilityCalculation {
    // Calculate time cost
    const timeCost = this.calculateTimeCost(
      criticalityAnalysis,
      transitionEdges
    );

    // Calculate education lock-in
    const educationLockIn = this.calculateEducationLockIn(
      criticalityAnalysis
    );

    // Calculate credential lock-in
    const credentialLockIn = this.calculateCredentialLockIn(
      criticalityAnalysis
    );

    // Calculate sunk cost
    const sunkCost = this.calculateSunkCost(
      criticalityAnalysis,
      timeCost
    );

    // Calculate switching difficulty
    const switchingDifficulty = this.calculateSwitchingDifficulty(
      timeCost,
      educationLockIn,
      credentialLockIn,
      sunkCost
    );

    // Calculate total reversibility score
    const reversibilityScore = this.calculateTotalReversibility(
      timeCost,
      educationLockIn,
      credentialLockIn,
      sunkCost
    );

    // Generate explanation
    const explanation = this.generateExplanation(
      timeCost,
      educationLockIn,
      credentialLockIn,
      sunkCost,
      switchingDifficulty
    );

    return {
      careerId,
      reversibilityScore,
      timeCost,
      educationLockIn,
      credentialLockIn,
      sunkCost,
      switchingDifficulty,
      explanation,
    };
  }

  /**
   * Calculate time cost.
   */
  private calculateTimeCost(
    criticalityAnalysis: CriticalityAnalysis,
    transitionEdges: CareerTransitionEdge[]
  ): ReversibilityCalculation['timeCost'] {
    // Years invested based on criticality
    const yearsInvested = criticalityAnalysis.metrics.timeToFlexibility?.value || 4;

    // Recovery time (time to transition back)
    const avgTransitionTime = transitionEdges.length > 0
      ? transitionEdges.reduce((sum, e) => sum + (e.transitionTimeMonths || 12), 0) /
        transitionEdges.length / 12
      : 2;
    
    const recoveryTime = avgTransitionTime * 1.5; // Include search time

    // Opportunity cost (time spent not earning at full potential)
    const opportunityCost = yearsInvested * 0.5 + recoveryTime * 0.3;

    return {
      yearsInvested,
      recoveryTime: Math.round(recoveryTime * 10) / 10,
      opportunityCost: Math.round(opportunityCost * 10) / 10,
    };
  }

  /**
   * Calculate education lock-in.
   */
  private calculateEducationLockIn(
    criticalityAnalysis: CriticalityAnalysis
  ): ReversibilityCalculation['educationLockIn'] {
    // Get reversibility metric from criticality
    const reversibilityMetric = criticalityAnalysis.metrics.reversibility;
    const score = reversibilityMetric?.value || 50;

    // Years required (inverse of reversibility)
    const yearsRequired = Math.round((100 - score) / 10);

    // Determine specialization level
    let specializationLevel: ReversibilityCalculation['educationLockIn']['specializationLevel'] =
      'moderate';
    
    if (score > 80) {
      specializationLevel = 'none';
    } else if (score > 60) {
      specializationLevel = 'minor';
    } else if (score > 40) {
      specializationLevel = 'moderate';
    } else if (score > 20) {
      specializationLevel = 'high';
    } else {
      specializationLevel = 'extreme';
    }

    // Alternative paths
    const alternativePaths: string[] = [];
    if (score > 60) {
      alternativePaths.push('Related fields without additional education');
    }
    if (score > 40) {
      alternativePaths.push('Adjacent careers with minimal retraining');
    }
    if (score <= 40) {
      alternativePaths.push('Complete career change possible');
    }

    return {
      score,
      yearsRequired,
      specializationLevel,
      alternativePaths,
    };
  }

  /**
   * Calculate credential lock-in.
   */
  private calculateCredentialLockIn(
    criticalityAnalysis: CriticalityAnalysis
  ): ReversibilityCalculation['credentialLockIn'] {
    // Estimate based on criticality category
    const category = criticalityAnalysis.category;
    let score = 50;
    const requiredCredentials: string[] = [];

    switch (category) {
      case 'low':
        score = 80;
        break;
      case 'moderate':
        score = 60;
        requiredCredentials.push('Professional certification');
        break;
      case 'high':
        score = 40;
        requiredCredentials.push('Advanced degree', 'Professional license');
        break;
      case 'extreme':
        score = 20;
        requiredCredentials.push('Terminal degree', 'Specialized license', 'Board certification');
        break;
    }

    // Transferability (how useful credentials are elsewhere)
    const transferability = score;

    // Maintenance requirements
    const maintenanceRequirements: string[] = [];
    if (score < 60) {
      maintenanceRequirements.push('Continuing education credits');
      maintenanceRequirements.push('License renewal');
    }

    return {
      score,
      requiredCredentials,
      transferability,
      maintenanceRequirements,
    };
  }

  /**
   * Calculate sunk cost.
   */
  private calculateSunkCost(
    criticalityAnalysis: CriticalityAnalysis,
    timeCost: ReversibilityCalculation['timeCost']
  ): ReversibilityCalculation['sunkCost'] {
    // Financial sunk cost (estimated based on years invested)
    const yearsInvested = timeCost.yearsInvested;
    const financial = Math.min(yearsInvested * 15, 100); // Thousands per year

    // Time sunk cost
    const time = Math.min(yearsInvested * 10, 100);

    // Effort sunk cost
    const effort = Math.min(yearsInvested * 8, 100);

    // Recoverable portion (some education/training may transfer)
    const recoverable = Math.max(20, 100 - yearsInvested * 10);

    return {
      financial,
      time,
      effort,
      recoverable,
    };
  }

  /**
   * Calculate switching difficulty.
   */
  private calculateSwitchingDifficulty(
    timeCost: ReversibilityCalculation['timeCost'],
    educationLockIn: ReversibilityCalculation['educationLockIn'],
    credentialLockIn: ReversibilityCalculation['credentialLockIn'],
    sunkCost: ReversibilityCalculation['sunkCost']
  ): ReversibilityCalculation['switchingDifficulty'] {
    // Financial barrier
    const financialBarrier = Math.min(
      (100 - credentialLockIn.score) * 0.5 + sunkCost.financial * 0.5,
      100
    );

    // Time barrier
    const timeBarrier = Math.min(
      timeCost.yearsInvested * 15 + timeCost.recoveryTime * 5,
      100
    );

    // Skill barrier
    const skillBarrier = 100 - educationLockIn.score;

    // Network barrier (estimated based on specialization)
    const networkBarrier =
      educationLockIn.specializationLevel === 'extreme'
        ? 80
        : educationLockIn.specializationLevel === 'high'
        ? 60
        : 40;

    // Overall difficulty
    const overall = Math.round(
      (financialBarrier + timeBarrier + skillBarrier + networkBarrier) / 4
    );

    return {
      overall,
      financial: Math.round(financialBarrier),
      temporal: Math.round(timeBarrier),
      skill: Math.round(skillBarrier),
      network: networkBarrier,
    };
  }

  /**
   * Calculate total reversibility score.
   */
  private calculateTotalReversibility(
    timeCost: ReversibilityCalculation['timeCost'],
    educationLockIn: ReversibilityCalculation['educationLockIn'],
    credentialLockIn: ReversibilityCalculation['credentialLockIn'],
    sunkCost: ReversibilityCalculation['sunkCost']
  ): number {
    // Normalize components
    const timeScore = Math.max(0, 100 - timeCost.yearsInvested * 15);
    const educationScore = educationLockIn.score;
    const credentialScore = credentialLockIn.score;
    const sunkCostScore = sunkCost.recoverable;

    // Weighted total
    return Math.round(
      timeScore * this.config.timeCostWeight +
        educationScore * this.config.educationLockInWeight +
        credentialScore * this.config.credentialLockInWeight +
        sunkCostScore * this.config.sunkCostWeight
    );
  }

  /**
   * Generate explanation.
   */
  private generateExplanation(
    timeCost: ReversibilityCalculation['timeCost'],
    educationLockIn: ReversibilityCalculation['educationLockIn'],
    credentialLockIn: ReversibilityCalculation['credentialLockIn'],
    sunkCost: ReversibilityCalculation['sunkCost'],
    switchingDifficulty: ReversibilityCalculation['switchingDifficulty']
  ): string[] {
    const explanation: string[] = [];

    explanation.push(
      `${timeCost.yearsInvested} years typically invested before flexibility is achieved`
    );

    explanation.push(
      `Education specialization level: ${educationLockIn.specializationLevel}`
    );

    if (credentialLockIn.requiredCredentials.length > 0) {
      explanation.push(
        `Requires: ${credentialLockIn.requiredCredentials.join(', ')}`
      );
    }

    explanation.push(
      `Approximately ${Math.round(sunkCost.recoverable)}% of investment is recoverable in alternative paths`
    );

    explanation.push(
      `Overall switching difficulty: ${switchingDifficulty.overall}%`
    );

    return explanation;
  }
}

/**
 * Factory function for ReversibilityCalculator.
 */
export function createReversibilityCalculator(
  config: RealOptionsEngineConfig
): ReversibilityCalculator {
  return new ReversibilityCalculator(config);
}
