/**
 * CareerOS Assessment Question Intelligence System - Question Selection Engine
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * Generates adaptive assessments optimized for target length,
 * desired confidence, and profile coverage.
 *
 * @module question-selection-engine
 * @version 1.0.0
 */

import type { BankQuestion } from './question-bank';
import type { QuestionCategory, CategoryMetadata } from './question-categories';
import { CATEGORY_METADATA, getCategoriesByPriority } from './question-categories';

/**
 * Assessment configuration presets.
 */
export type AssessmentLength = 'quick' | 'standard' | 'deep';

/**
 * Configuration for question selection.
 */
export interface SelectionConfig {
  /** Target number of questions */
  targetLength: number;

  /** Desired confidence level */
  desiredConfidence: 'LOW' | 'MEDIUM' | 'HIGH';

  /** Required category coverage */
  categoryCoverage: {
    /** Minimum questions per category */
    minPerCategory: number;

    /** Maximum questions per category */
    maxPerCategory: number;
  };

  /** Dimension coverage requirements */
  dimensionCoverage: {
    /** Whether all dimensions must be covered */
    coverAllDimensions: boolean;

    /** Minimum questions per dimension */
    minPerDimension: number;
  };

  /** Difficulty distribution */
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };

  /** Question type distribution */
  typeDistribution?: {
    likert: number;
    multipleChoice: number;
    ranking: number;
    forcedChoice: number;
    scale: number;
  };
}

/**
 * Default configurations for assessment lengths.
 */
export const ASSESSMENT_CONFIGS: Record<AssessmentLength, SelectionConfig> = {
  quick: {
    targetLength: 15,
    desiredConfidence: 'MEDIUM',
    categoryCoverage: {
      minPerCategory: 1,
      maxPerCategory: 3,
    },
    dimensionCoverage: {
      coverAllDimensions: false,
      minPerDimension: 0,
    },
    difficultyDistribution: {
      easy: 40,
      medium: 50,
      hard: 10,
    },
  },
  standard: {
    targetLength: 40,
    desiredConfidence: 'HIGH',
    categoryCoverage: {
      minPerCategory: 3,
      maxPerCategory: 7,
    },
    dimensionCoverage: {
      coverAllDimensions: true,
      minPerDimension: 1,
    },
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20,
    },
  },
  deep: {
    targetLength: 80,
    desiredConfidence: 'HIGH',
    categoryCoverage: {
      minPerCategory: 6,
      maxPerCategory: 12,
    },
    dimensionCoverage: {
      coverAllDimensions: true,
      minPerDimension: 2,
    },
    difficultyDistribution: {
      easy: 20,
      medium: 50,
      hard: 30,
    },
  },
};

/**
 * Selected question set with metadata.
 */
export interface SelectedQuestionSet {
  /** Selected questions in order */
  questions: BankQuestion[];

  /** Metadata about the selection */
  metadata: {
    /** Total questions selected */
    totalSelected: number;

    /** Category distribution */
    categoryDistribution: Record<string, number>;

    /** Dimension coverage */
    dimensionCoverage: Record<string, number>;

    /** Expected confidence level */
    expectedConfidence: 'LOW' | 'MEDIUM' | 'HIGH';

    /** Average question weight */
    averageWeight: number;

    /** Difficulty distribution */
    difficultyDistribution: Record<string, number>;
  };

  /** Coverage analysis */
  coverage: {
    /** Categories covered */
    categoriesCovered: string[];

    /** Categories missing */
    categoriesMissing: string[];

    /** Dimensions covered */
    dimensionsCovered: string[];

    /** Dimensions missing */
    dimensionsMissing: string[];

    /** Coverage percentage */
    coveragePercentage: number;
  };
}

/**
 * Adaptive question selection engine.
 *
 * Optimizes question selection for assessment quality, coverage,
 * and user experience based on configurable parameters.
 */
export class QuestionSelectionEngine {
  /**
   * Generate optimized question set for assessment length.
   *
   * @param allQuestions - Complete question bank
   * @param length - Desired assessment length
   * @returns Optimized question set
   */
  selectQuestions(
    allQuestions: BankQuestion[],
    length: AssessmentLength
  ): SelectedQuestionSet {
    const config = ASSESSMENT_CONFIGS[length];
    return this.selectQuestionsWithConfig(allQuestions, config);
  }

  /**
   * Generate optimized question set with custom configuration.
   *
   * @param allQuestions - Complete question bank
   * @param config - Selection configuration
   * @returns Optimized question set
   */
  selectQuestionsWithConfig(
    allQuestions: BankQuestion[],
    config: SelectionConfig
  ): SelectedQuestionSet {
    const selected: BankQuestion[] = [];
    const usedQuestionIds = new Set<string>();

    // Phase 1: Ensure minimum category coverage
    const categorySelections = this.selectByCategoryMinimum(
      allQuestions,
      config,
      usedQuestionIds
    );
    selected.push(...categorySelections);

    // Phase 2: Ensure dimension coverage if required
    if (config.dimensionCoverage.coverAllDimensions) {
      const dimensionSelections = this.selectByDimensionCoverage(
        allQuestions,
        config,
        usedQuestionIds
      );
      selected.push(...dimensionSelections);
    }

    // Phase 3: Fill remaining slots with high-quality questions
    const remainingSlots = config.targetLength - selected.length;
    if (remainingSlots > 0) {
      const fillSelections = this.selectFillQuestions(
        allQuestions,
        config,
        usedQuestionIds,
        remainingSlots
      );
      selected.push(...fillSelections);
    }

    // Phase 4: Optimize ordering
    const ordered = this.optimizeOrdering(selected);

    // Generate metadata and coverage analysis
    return this.buildResult(ordered, config);
  }

  /**
   * Select questions to meet minimum per-category requirements.
   */
  private selectByCategoryMinimum(
    allQuestions: BankQuestion[],
    config: SelectionConfig,
    usedIds: Set<string>
  ): BankQuestion[] {
    const selected: BankQuestion[] = [];
    const categories = getCategoriesByPriority();

    for (const categoryMeta of categories) {
      const categoryQuestions = allQuestions.filter(
        (q) => q.category === categoryMeta.id && !usedIds.has(q.id)
      );

      const toSelect = Math.min(
        config.categoryCoverage.minPerCategory,
        categoryQuestions.length
      );

      const bestQuestions = this.selectBestQuestions(categoryQuestions, toSelect);

      for (const q of bestQuestions) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }

    return selected;
  }

  /**
   * Select questions to ensure dimension coverage.
   */
  private selectByDimensionCoverage(
    allQuestions: BankQuestion[],
    config: SelectionConfig,
    usedIds: Set<string>
  ): BankQuestion[] {
    const selected: BankQuestion[] = [];

    // Get all dimensions across all categories
    const allDimensions = new Set<string>();
    for (const categoryMeta of Object.values(CATEGORY_METADATA)) {
      for (const dimension of categoryMeta.dimensions) {
        allDimensions.add(dimension);
      }
    }

    for (const dimension of allDimensions) {
      const dimensionQuestions = allQuestions.filter(
        (q) => q.dimension === dimension && !usedIds.has(q.id)
      );

      if (dimensionQuestions.length === 0) continue;

      const toSelect = Math.min(config.dimensionCoverage.minPerDimension, 1);
      const bestQuestions = this.selectBestQuestions(dimensionQuestions, toSelect);

      for (const q of bestQuestions) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }

    return selected;
  }

  /**
   * Select fill questions to reach target length.
   */
  private selectFillQuestions(
    allQuestions: BankQuestion[],
    config: SelectionConfig,
    usedIds: Set<string>,
    count: number
  ): BankQuestion[] {
    const available = allQuestions.filter((q) => !usedIds.has(q.id));

    // Sort by quality score (weight * expected signal)
    const scored = available.map((q) => ({
      question: q,
      score: q.weight * (this.getDifficultyMultiplier(q)),
    }));

    scored.sort((a, b) => b.score - a.score);

    const selected = scored.slice(0, count).map((s) => s.question);

    for (const q of selected) {
      usedIds.add(q.id);
    }

    return selected;
  }

  /**
   * Select best questions from a set.
   */
  private selectBestQuestions(questions: BankQuestion[], count: number): BankQuestion[] {
    // Sort by weight (higher is better)
    const sorted = [...questions].sort((a, b) => b.weight - a.weight);
    return sorted.slice(0, count);
  }

  /**
   * Get difficulty multiplier for scoring.
   */
  private getDifficultyMultiplier(question: BankQuestion): number {
    // Balance difficulty based on config
    return 1.0;
  }

  /**
   * Optimize question ordering for flow and engagement.
   */
  private optimizeOrdering(questions: BankQuestion[]): BankQuestion[] {
    // Group by category
    const byCategory = new Map<string, BankQuestion[]>();

    for (const q of questions) {
      const existing = byCategory.get(q.category) ?? [];
      existing.push(q);
      byCategory.set(q.category, existing);
    }

    // Interleave categories for variety
    const ordered: BankQuestion[] = [];
    const categoryQueues = new Map(
      Array.from(byCategory.entries()).map(([k, v]) => [k, [...v]])
    );

    const categories = getCategoriesByPriority().map((c) => c.id);

    while (ordered.length < questions.length) {
      for (const category of categories) {
        const queue = categoryQueues.get(category);
        if (queue && queue.length > 0) {
          ordered.push(queue.shift()!);
        }
      }
    }

    return ordered;
  }

  /**
   * Build final result with metadata and coverage analysis.
   */
  private buildResult(
    questions: BankQuestion[],
    config: SelectionConfig
  ): SelectedQuestionSet {
    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    for (const q of questions) {
      categoryDistribution[q.category] = (categoryDistribution[q.category] ?? 0) + 1;
    }

    // Calculate dimension coverage
    const dimensionCoverage: Record<string, number> = {};
    for (const q of questions) {
      dimensionCoverage[q.dimension] = (dimensionCoverage[q.dimension] ?? 0) + 1;
    }

    // Calculate difficulty distribution
    const difficultyDistribution: Record<string, number> = {};
    for (const q of questions) {
      const difficulty = this.estimateDifficulty(q);
      difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] ?? 0) + 1;
    }

    // Calculate average weight
    const averageWeight =
      questions.reduce((sum, q) => sum + q.weight, 0) / questions.length;

    // Build coverage analysis
    const categoriesCovered = Object.keys(categoryDistribution);
    const allCategories = Object.values(CATEGORY_METADATA).map((c) => c.id);
    const categoriesMissing = allCategories.filter(
      (c) => !categoriesCovered.includes(c)
    );

    const dimensionsCovered = Object.keys(dimensionCoverage);
    const allDimensions = new Set<string>();
    for (const meta of Object.values(CATEGORY_METADATA)) {
      for (const dim of meta.dimensions) {
        allDimensions.add(dim);
      }
    }
    const dimensionsMissing = Array.from(allDimensions).filter(
      (d) => !dimensionsCovered.includes(d)
    );

    const coveragePercentage =
      (categoriesCovered.length / allCategories.length) * 100;

    return {
      questions,
      metadata: {
        totalSelected: questions.length,
        categoryDistribution,
        dimensionCoverage,
        expectedConfidence: config.desiredConfidence,
        averageWeight: Math.round(averageWeight),
        difficultyDistribution,
      },
      coverage: {
        categoriesCovered,
        categoriesMissing,
        dimensionsCovered,
        dimensionsMissing,
        coveragePercentage: Math.round(coveragePercentage),
      },
    };
  }

  /**
   * Estimate question difficulty.
   */
  private estimateDifficulty(question: BankQuestion): string {
    // Simple heuristic based on question type and complexity
    if (question.type === 'ranking') return 'medium';
    if (question.type === 'forcedChoice') return 'medium';
    if (question.weight > 80) return 'hard';
    if (question.weight < 50) return 'easy';
    return 'medium';
  }

  /**
   * Generate 15-question quick assessment.
   */
  generateQuickAssessment(allQuestions: BankQuestion[]): SelectedQuestionSet {
    return this.selectQuestions(allQuestions, 'quick');
  }

  /**
   * Generate 40-question standard assessment.
   */
  generateStandardAssessment(allQuestions: BankQuestion[]): SelectedQuestionSet {
    return this.selectQuestions(allQuestions, 'standard');
  }

  /**
   * Generate 80-question deep assessment.
   */
  generateDeepAssessment(allQuestions: BankQuestion[]): SelectedQuestionSet {
    return this.selectQuestions(allQuestions, 'deep');
  }
}

/**
 * Factory function for QuestionSelectionEngine.
 */
export function createQuestionSelectionEngine(): QuestionSelectionEngine {
  return new QuestionSelectionEngine();
}
