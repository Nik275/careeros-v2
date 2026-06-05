/**
 * Optionality Engine
 *
 * Phase 8.5: Decision Intelligence Engine - Part 5
 *
 * Measures future flexibility and option preservation.
 * Answers: How many future doors remain open? How adaptable is this path?
 *
 * @module optionality-engine
 * @version 1.0.0
 */

import {
  OptionalityAnalysis,
  OptionalityLevel,
  FutureOption,
  PivotDifficulty,
  ExplorationCapacity,
  DecisionInput,
  DecisionOption,
  OptionalityEngineConfig,
} from './decision-types';

/**
 * Optionality Engine implementation
 */
export class OptionalityEngine {
  private config: OptionalityEngineConfig;

  constructor(config?: Partial<OptionalityEngineConfig>) {
    this.config = {
      futureTimeframe: 10,
      minAccessibilityThreshold: 30,
      pivotBarrierWeight: 0.6,
      explorationMechanismBonus: 0.15,
      ...config,
    };
  }

  /**
   * Analyze optionality for a decision option
   */
  analyzeOptionality(
    input: DecisionInput,
    option: DecisionOption
  ): OptionalityAnalysis {
    // Identify future options this path enables
    const futureOptions = this.identifyFutureOptions(option, input);

    // Calculate pivot difficulty
    const pivotDifficulty = this.assessPivotDifficulty(option, input);

    // Calculate exploration capacity
    const explorationCapacity = this.assessExplorationCapacity(option, input);

    // Calculate adaptability score
    const adaptabilityScore = this.calculateAdaptabilityScore(
      futureOptions,
      pivotDifficulty,
      explorationCapacity
    );

    // Calculate overall optionality score
    const score = this.calculateOptionalityScore(
      futureOptions,
      pivotDifficulty,
      explorationCapacity,
      adaptabilityScore
    );

    const level = this.classifyOptionalityLevel(score);

    return {
      score: Math.round(score),
      level,
      explanation: this.generateExplanation(score, level, futureOptions, pivotDifficulty),
      futureOptions,
      pivotDifficulty,
      explorationCapacity,
      adaptabilityScore: Math.round(adaptabilityScore),
    };
  }

  /**
   * Identify future options available from this path
   */
  private identifyFutureOptions(
    option: DecisionOption,
    input: DecisionInput
  ): FutureOption[] {
    const options: FutureOption[] = [];

    // Get base future options from education/career path
    const baseOptions = this.getBaseFutureOptions(option);
    options.push(...baseOptions);

    // Add pivot options
    const pivotOptions = this.getPivotOptions(option, input);
    options.push(...pivotOptions);

    // Add advancement options
    const advancementOptions = this.getAdvancementOptions(option);
    options.push(...advancementOptions);

    // Filter by accessibility threshold
    return options.filter(
      (o) => o.accessibility >= this.config.minAccessibilityThreshold
    );
  }

  /**
   * Get base future options for an option
   */
  private getBaseFutureOptions(option: DecisionOption): FutureOption[] {
    const options: FutureOption[] = [];

    if (option.educationPath) {
      // Options enabled by education
      options.push({
        id: 'advanced-degree',
        description: 'Pursue advanced degree (Master\'s/PhD)',
        accessibility: 70,
        timeToAchieve: 24,
        requirements: ['Good academic standing', 'Research interest'],
        value: 75,
      });

      options.push({
        id: 'related-field',
        description: 'Switch to related field',
        accessibility: 60,
        timeToAchieve: 12,
        requirements: ['Transferable skills', 'Some retraining'],
        value: 65,
      });
    }

    if (option.careerId) {
      // Options within career
      options.push({
        id: 'specialization',
        description: 'Specialize within field',
        accessibility: 80,
        timeToAchieve: 24,
        requirements: ['Experience', 'Deep expertise'],
        value: 70,
      });

      options.push({
        id: 'management-track',
        description: 'Move to management',
        accessibility: 65,
        timeToAchieve: 36,
        requirements: ['Leadership skills', 'Proven results'],
        value: 72,
      });

      options.push({
        id: 'consulting',
        description: 'Become independent consultant',
        accessibility: 50,
        timeToAchieve: 48,
        requirements: ['Network', 'Expertise reputation'],
        value: 68,
      });
    }

    return options;
  }

  /**
   * Get pivot options from a path
   */
  private getPivotOptions(
    option: DecisionOption,
    input: DecisionInput
  ): FutureOption[] {
    const options: FutureOption[] = [];

    // Common pivot paths
    options.push({
      id: 'career-change',
      description: 'Pivot to different career',
      accessibility: option.reversibility.score * 0.7,
      timeToAchieve: 12 + (100 - option.reversibility.score) * 0.24,
      requirements: ['Retraining', 'Network building'],
      value: 60,
    });

    options.push({
      id: 'entrepreneurship',
      description: 'Start own venture',
      accessibility: 40,
      timeToAchieve: 12,
      requirements: ['Business idea', 'Capital', 'Risk tolerance'],
      value: 65,
    });

    options.push({
      id: 'freelance',
      description: 'Work as freelancer',
      accessibility: 55,
      timeToAchieve: 6,
      requirements: ['Marketable skills', 'Client network'],
      value: 58,
    });

    // Education-based pivots
    if (option.educationPath) {
      options.push({
        id: 'adjacent-field',
        description: 'Move to adjacent academic field',
        accessibility: 50,
        timeToAchieve: 18,
        requirements: ['Overlapping coursework', 'New specialization'],
        value: 55,
      });
    }

    return options;
  }

  /**
   * Get advancement options
   */
  private getAdvancementOptions(option: DecisionOption): FutureOption[] {
    return [
      {
        id: 'geographic-move',
        description: 'Relocate for opportunities',
        accessibility: 70,
        timeToAchieve: 6,
        requirements: ['Flexibility', 'Language skills if abroad'],
        value: 60,
      },
      {
        id: 'industry-switch',
        description: 'Same role, different industry',
        accessibility: 65,
        timeToAchieve: 6,
        requirements: ['Transferable expertise', 'Industry knowledge'],
        value: 62,
      },
    ];
  }

  /**
   * Assess pivot difficulty
   */
  private assessPivotDifficulty(
    option: DecisionOption,
    input: DecisionInput
  ): PivotDifficulty {
    const barriers: string[] = [];
    const enablers: string[] = [];

    // Barriers
    if (option.timeCommitment.duration > 48) {
      barriers.push('Long time investment makes switching costly');
    }
    if (option.financialImplications.initialCost > 500000) {
      barriers.push('High financial investment creates lock-in');
    }
    if (option.riskLevel === 'HIGH' || option.riskLevel === 'VERY_HIGH') {
      barriers.push('High-risk path may limit options if it fails');
    }
    if (option.educationPath?.specialization) {
      barriers.push('Specialized training may not transfer easily');
    }

    // Enablers
    if (option.reversibility.score > 70) {
      enablers.push('Path is reversible if needed');
    }
    if (input.dimensionScores.get('analyticalThinking')?.percentileScore ?? 0 > 70) {
      enablers.push('Strong analytical skills transfer across fields');
    }
    if (input.dimensionScores.get('adaptability')?.percentileScore ?? 0 > 70) {
      enablers.push('High adaptability enables pivots');
    }

    // Calculate score
    const barrierScore = barriers.length * 15;
    const enablerBonus = enablers.length * 10;
    const reversibilityFactor = 100 - option.reversibility.score;

    const score = Math.min(100, Math.max(0, barrierScore - enablerBonus + reversibilityFactor * 0.5));

    // Classify
    let category: PivotDifficulty['category'];
    if (score < 30) category = 'EASY';
    else if (score < 50) category = 'MODERATE';
    else if (score < 75) category = 'DIFFICULT';
    else category = 'VERY_DIFFICULT';

    return {
      score: Math.round(score),
      category,
      barriers,
      enablers,
      typicalPivotPaths: this.getTypicalPivotPaths(option),
    };
  }

  /**
   * Get typical pivot paths
   */
  private getTypicalPivotPaths(option: DecisionOption): string[] {
    const paths: string[] = [];

    if (option.educationPath) {
      paths.push('Related industry roles');
      paths.push('Academic research');
      paths.push('Teaching');
    }

    if (option.careerId) {
      paths.push('Adjacent career functions');
      paths.push('Consulting in same domain');
      paths.push('Startups in related space');
    }

    paths.push('Entrepreneurship');
    paths.push('Freelancing/contracting');

    return paths;
  }

  /**
   * Assess exploration capacity
   */
  private assessExplorationCapacity(
    option: DecisionOption,
    input: DecisionInput
  ): ExplorationCapacity {
    const mechanisms: string[] = [];
    const constraints: string[] = [];

    // Check time flexibility
    if (option.timeCommitment.flexibility === 'HIGHLY_FLEXIBLE') {
      mechanisms.push('Flexible schedule allows side exploration');
    } else if (option.timeCommitment.flexibility === 'RIGID') {
      constraints.push('Rigid schedule limits exploration time');
    }

    // Check intensity
    if (option.timeCommitment.intensity === 'PART_TIME') {
      mechanisms.push('Part-time commitment leaves room for experiments');
    } else if (option.timeCommitment.intensity === 'INTENSIVE') {
      constraints.push('Intensive commitment limits bandwidth');
    }

    // Check for built-in exploration
    if (option.educationPath?.duration && option.educationPath.duration < 24) {
      mechanisms.push('Short program allows quick pivot');
    }

    // Calculate score
    const mechanismScore = mechanisms.length * 20;
    const constraintPenalty = constraints.length * 15;
    const baseScore = 50;

    const score = Math.min(100, Math.max(0, baseScore + mechanismScore - constraintPenalty));

    return {
      score: Math.round(score),
      canExploreWhilePursuing: score > 40,
      explorationMechanisms: mechanisms,
      constraints,
    };
  }

  /**
   * Calculate adaptability score
   */
  private calculateAdaptabilityScore(
    futureOptions: FutureOption[],
    pivotDifficulty: PivotDifficulty,
    explorationCapacity: ExplorationCapacity
  ): number {
    const optionScore = Math.min(100, futureOptions.length * 10);
    const pivotScore = 100 - pivotDifficulty.score;
    const explorationScore = explorationCapacity.score;

    return (optionScore * 0.4 + pivotScore * 0.35 + explorationScore * 0.25);
  }

  /**
   * Calculate overall optionality score
   */
  private calculateOptionalityScore(
    futureOptions: FutureOption[],
    pivotDifficulty: PivotDifficulty,
    explorationCapacity: ExplorationCapacity,
    adaptabilityScore: number
  ): number {
    const optionCountScore = Math.min(100, futureOptions.length * 8);
    const optionQualityScore =
      futureOptions.length > 0
        ? futureOptions.reduce((sum, o) => sum + o.value, 0) / futureOptions.length
        : 0;

    const pivotScore = 100 - pivotDifficulty.score;
    const explorationScore = explorationCapacity.score;

    return (
      optionCountScore * 0.25 +
      optionQualityScore * 0.2 +
      pivotScore * 0.3 +
      explorationScore * 0.15 +
      adaptabilityScore * 0.1
    );
  }

  /**
   * Classify optionality level
   */
  private classifyOptionalityLevel(score: number): OptionalityLevel {
    if (score >= 80) return 'VERY_HIGH';
    if (score >= 65) return 'HIGH';
    if (score >= 45) return 'MODERATE';
    if (score >= 30) return 'LOW';
    return 'VERY_LOW';
  }

  /**
   * Generate explanation
   */
  private generateExplanation(
    score: number,
    level: OptionalityLevel,
    futureOptions: FutureOption[],
    pivotDifficulty: PivotDifficulty
  ): string {
    const levelExplanations: Record<OptionalityLevel, string> = {
      VERY_HIGH: `This path preserves exceptional flexibility. You'll have numerous options and the ability to pivot relatively easily.`,
      HIGH: `This path maintains good optionality. While not unlimited, you'll have meaningful choices and can adapt as circumstances change.`,
      MODERATE: `This path offers reasonable flexibility. Some doors will remain open, but others may close. Plan for potential pivots.`,
      LOW: `This path significantly reduces future options. Make sure you're confident before committing, as changing course will be challenging.`,
      VERY_LOW: `This path is highly specialized with limited pivot options. Only choose this if you're certain about your direction.`,
    };

    let explanation = levelExplanations[level];

    if (futureOptions.length > 0) {
      explanation += ` I identified ${futureOptions.length} viable future paths from this option.`;
    }

    if (pivotDifficulty.barriers.length > 0) {
      explanation += ` Main barrier: ${pivotDifficulty.barriers[0]}`;
    }

    return explanation;
  }

  /**
   * Compare optionality across options
   */
  compareOptionality(
    input: DecisionInput,
    options: DecisionOption[]
  ): Array<{ option: DecisionOption; analysis: OptionalityAnalysis }> {
    return options.map((option) => ({
      option,
      analysis: this.analyzeOptionality(input, option),
    }));
  }

  /**
   * Get highest optionality option
   */
  getHighestOptionalityOption(
    input: DecisionInput,
    options: DecisionOption[]
  ): { option: DecisionOption; analysis: OptionalityAnalysis } | null {
    if (options.length === 0) return null;

    const comparisons = this.compareOptionality(input, options);

    return comparisons.reduce((best, current) =>
      current.analysis.score > best.analysis.score ? current : best
    );
  }

  /**
   * Quick optionality check
   */
  quickOptionalityCheck(
    reversibilityScore: number,
    timeCommitment: number
  ): { score: number; level: OptionalityLevel } {
    const score = reversibilityScore * 0.6 + (100 - timeCommitment / 2) * 0.4;
    const level = this.classifyOptionalityLevel(score);

    return { score: Math.round(score), level };
  }

  /**
   * Get current configuration
   */
  getConfig(): OptionalityEngineConfig {
    return { ...this.config };
  }
}

/**
 * Factory function for creating optionality engine
 */
export function createOptionalityEngine(
  config?: Partial<OptionalityEngineConfig>
): OptionalityEngine {
  return new OptionalityEngine(config);
}

/**
 * Quick optionality analysis
 */
export function analyzeQuickOptionality(
  reversibilityScore: number,
  timeCommitment: number
): { score: number; level: OptionalityLevel; explanation: string } {
  const engine = createOptionalityEngine();
  const result = engine.quickOptionalityCheck(reversibilityScore, timeCommitment);

  const explanations: Record<OptionalityLevel, string> = {
    VERY_HIGH: 'Exceptional future flexibility. Many doors remain open.',
    HIGH: 'Good optionality maintained. Multiple future paths available.',
    MODERATE: 'Reasonable flexibility. Some options preserved.',
    LOW: 'Limited optionality. Future pivots will be challenging.',
    VERY_LOW: 'Highly specialized path. Commit carefully.',
  };

  return {
    ...result,
    explanation: explanations[result.level],
  };
}

/**
 * Calculate optionality score from components
 */
export function calculateOptionalityFromComponents(
  futureOptionCount: number,
  pivotDifficultyScore: number,
  explorationCapacityScore: number
): number {
  const optionScore = Math.min(100, futureOptionCount * 10);
  const pivotScore = 100 - pivotDifficultyScore;

  return optionScore * 0.4 + pivotScore * 0.35 + explorationCapacityScore * 0.25;
}
