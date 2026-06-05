/**
 * CareerOS Assessment Question Intelligence System - Question Validator
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * Validates question quality, detects issues, and ensures
 * assessment integrity across the question bank.
 *
 * @module question-validator
 * @version 1.0.0
 */

import type { BankQuestion } from './question-bank';
import { QUESTION_CATEGORIES, CATEGORY_METADATA, type QuestionCategory } from './question-categories';

/**
 * Validation result for a single question.
 */
export interface QuestionValidationResult {
  /** Whether the question passed validation */
  valid: boolean;

  /** List of issues found */
  issues: ValidationIssue[];

  /** Severity of the worst issue */
  severity: 'info' | 'warning' | 'error';
}

/**
 * Validation issue details.
 */
export interface ValidationIssue {
  /** Issue type */
  type: ValidationIssueType;

  /** Severity level */
  severity: 'info' | 'warning' | 'error';

  /** Human-readable description */
  message: string;

  /** Suggested fix */
  suggestion?: string;
}

/**
 * Types of validation issues.
 */
export type ValidationIssueType =
  | 'duplicate_id'
  | 'duplicate_text'
  | 'weak_wording'
  | 'leading_wording'
  | 'low_signal_value'
  | 'invalid_category'
  | 'invalid_dimension'
  | 'missing_prompt'
  | 'invalid_weight'
  | 'category_imbalance'
  | 'dimension_uncovered';

/**
 * Bank-wide validation result.
 */
export interface BankValidationResult {
  /** Overall validity */
  valid: boolean;

  /** Results for individual questions */
  questionResults: Map<string, QuestionValidationResult>;

  /** Bank-wide issues */
  bankIssues: ValidationIssue[];

  /** Summary statistics */
  summary: {
    totalQuestions: number;
    validQuestions: number;
    questionsWithErrors: number;
    questionsWithWarnings: number;
  };

  /** Category distribution */
  categoryDistribution: Record<string, number>;
}

/**
 * Validates questions for quality and integrity.
 */
export class QuestionValidator {
  private weakPhrases = [
    'are you',
    'do you like',
    'do you enjoy',
    'would you say',
    'in your opinion',
    'do you think',
  ];

  private leadingPhrases = [
    'obviously',
    'clearly',
    'naturally',
    'of course',
    'everyone knows',
    'as we all know',
  ];

  private lowSignalPhrases = [
    'sometimes',
    'occasionally',
    'maybe',
    'perhaps',
    'it depends',
    'not sure',
  ];

  /**
   * Validate the entire question bank.
   */
  validateBank(questions: BankQuestion[]): BankValidationResult {
    const questionResults = new Map<string, QuestionValidationResult>();
    const bankIssues: ValidationIssue[] = [];

    for (const question of questions) {
      const result = this.validateQuestion(question, questions);
      questionResults.set(question.id, result);
    }

    // Check for duplicates across the bank
    const duplicateIssues = this.findDuplicates(questions);
    bankIssues.push(...duplicateIssues);

    // Check category balance
    const balanceIssues = this.checkCategoryBalance(questions);
    bankIssues.push(...balanceIssues);

    // Check dimension coverage
    const coverageIssues = this.checkDimensionCoverage(questions);
    bankIssues.push(...coverageIssues);

    const summary = this.calculateSummary(questionResults);
    const categoryDistribution = this.calculateCategoryDistribution(questions);

    return {
      valid: summary.questionsWithErrors === 0 && bankIssues.every((i) => i.severity !== 'error'),
      questionResults,
      bankIssues,
      summary,
      categoryDistribution,
    };
  }

  /**
   * Validate a single question.
   */
  validateQuestion(question: BankQuestion, allQuestions: BankQuestion[]): QuestionValidationResult {
    const issues: ValidationIssue[] = [];

    // Check ID uniqueness
    const duplicateIds = allQuestions.filter((q) => q.id === question.id).length;
    if (duplicateIds > 1) {
      issues.push({
        type: 'duplicate_id',
        severity: 'error',
        message: `Duplicate question ID: ${question.id}`,
        suggestion: 'Assign a unique ID to this question',
      });
    }

    // Check for valid category
    if (!Object.values(QUESTION_CATEGORIES).includes(question.category as QuestionCategory)) {
      issues.push({
        type: 'invalid_category',
        severity: 'error',
        message: `Invalid category: ${question.category}`,
        suggestion: `Use one of: ${Object.values(QUESTION_CATEGORIES).join(', ')}`,
      });
    }

    // Check for valid dimension within category
    const categoryMeta = CATEGORY_METADATA[question.category as QuestionCategory];
    if (categoryMeta && !categoryMeta.dimensions.includes(question.dimension)) {
      issues.push({
        type: 'invalid_dimension',
        severity: 'warning',
        message: `Dimension "${question.dimension}" not in category "${question.category}"`,
        suggestion: `Use one of: ${categoryMeta.dimensions.join(', ')}`,
      });
    }

    // Check for missing prompt
    if (!question.prompt || question.prompt.trim().length === 0) {
      issues.push({
        type: 'missing_prompt',
        severity: 'error',
        message: 'Question prompt is missing or empty',
        suggestion: 'Add a clear, behavioral question prompt',
      });
    }

    // Check for weak wording
    const weakWordingIssues = this.checkWeakWording(question.prompt);
    issues.push(...weakWordingIssues);

    // Check for leading wording
    const leadingIssues = this.checkLeadingWording(question.prompt);
    issues.push(...leadingIssues);

    // Check for low signal value
    const signalIssues = this.checkSignalValue(question);
    issues.push(...signalIssues);

    // Check weight validity
    if (question.weight < 0 || question.weight > 100) {
      issues.push({
        type: 'invalid_weight',
        severity: 'error',
        message: `Invalid weight: ${question.weight}. Must be 0-100.`,
        suggestion: 'Set weight between 0 and 100',
      });
    }

    const severity = this.determineSeverity(issues);

    return {
      valid: issues.every((i) => i.severity !== 'error'),
      issues,
      severity,
    };
  }

  /**
   * Check for weak wording patterns.
   */
  private checkWeakWording(prompt: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const phrase of this.weakPhrases) {
      if (lowerPrompt.includes(phrase)) {
        issues.push({
          type: 'weak_wording',
          severity: 'warning',
          message: `Weak phrasing detected: "${phrase}"`,
          suggestion: 'Use behavioral questions instead (e.g., "When faced with X, what do you do?")',
        });
      }
    }

    return issues;
  }

  /**
   * Check for leading wording patterns.
   */
  private checkLeadingWording(prompt: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const phrase of this.leadingPhrases) {
      if (lowerPrompt.includes(phrase)) {
        issues.push({
          type: 'leading_wording',
          severity: 'warning',
          message: `Leading phrasing detected: "${phrase}"`,
          suggestion: 'Remove loaded language that suggests a "correct" answer',
        });
      }
    }

    return issues;
  }

  /**
   * Check for low signal value indicators.
   */
  private checkSignalValue(question: BankQuestion): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lowerPrompt = question.prompt.toLowerCase();

    // Check for vague qualifiers
    for (const phrase of this.lowSignalPhrases) {
      if (lowerPrompt.includes(phrase)) {
        issues.push({
          type: 'low_signal_value',
          severity: 'info',
          message: `Low signal indicator: "${phrase}"`,
          suggestion: 'Consider making the question more specific for clearer signal',
        });
      }
    }

    // Check weight - very low weight questions may not add value
    if (question.weight < 30) {
      issues.push({
        type: 'low_signal_value',
        severity: 'info',
        message: `Low weight (${question.weight}) may indicate limited signal value`,
        suggestion: 'Consider increasing weight or removing if not essential',
      });
    }

    return issues;
  }

  /**
   * Find duplicate questions across the bank.
   */
  private findDuplicates(questions: BankQuestion[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const seenPrompts = new Map<string, string[]>();

    for (const question of questions) {
      const normalized = question.prompt.toLowerCase().trim();
      const existing = seenPrompts.get(normalized) ?? [];
      existing.push(question.id);
      seenPrompts.set(normalized, existing);
    }

    for (const [prompt, ids] of seenPrompts) {
      if (ids.length > 1) {
        issues.push({
          type: 'duplicate_text',
          severity: 'error',
          message: `Duplicate question text found in: ${ids.join(', ')}`,
          suggestion: 'Merge or differentiate these questions',
        });
      }
    }

    return issues;
  }

  /**
   * Check category balance.
   */
  private checkCategoryBalance(questions: BankQuestion[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const counts: Record<string, number> = {};

    for (const question of questions) {
      counts[question.category] = (counts[question.category] ?? 0) + 1;
    }

    const countsArray = Object.values(counts);
    const avg = countsArray.reduce((a, b) => a + b, 0) / countsArray.length;
    const max = Math.max(...countsArray);
    const min = Math.min(...countsArray);

    // Check if any category is significantly over/under represented
    if (max > avg * 2) {
      issues.push({
        type: 'category_imbalance',
        severity: 'warning',
        message: `Category imbalance detected. Max: ${max}, Min: ${min}, Avg: ${avg.toFixed(1)}`,
        suggestion: 'Redistribute questions more evenly across categories',
      });
    }

    return issues;
  }

  /**
   * Check dimension coverage within categories.
   */
  private checkDimensionCoverage(questions: BankQuestion[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const category of Object.values(QUESTION_CATEGORIES)) {
      const meta = CATEGORY_METADATA[category];
      const categoryQuestions = questions.filter((q) => q.category === category);
      const coveredDimensions = new Set(categoryQuestions.map((q) => q.dimension));

      const uncovered = meta.dimensions.filter((d) => !coveredDimensions.has(d));

      if (uncovered.length > 0) {
        issues.push({
          type: 'dimension_uncovered',
          severity: 'warning',
          message: `Category "${category}" has uncovered dimensions: ${uncovered.join(', ')}`,
          suggestion: 'Add questions to cover these dimensions',
        });
      }
    }

    return issues;
  }

  /**
   * Determine overall severity from issues.
   */
  private determineSeverity(issues: ValidationIssue[]): 'info' | 'warning' | 'error' {
    if (issues.some((i) => i.severity === 'error')) return 'error';
    if (issues.some((i) => i.severity === 'warning')) return 'warning';
    return 'info';
  }

  /**
   * Calculate summary statistics.
   */
  private calculateSummary(
    results: Map<string, QuestionValidationResult>
  ): BankValidationResult['summary'] {
    const resultsArray = Array.from(results.values());

    return {
      totalQuestions: resultsArray.length,
      validQuestions: resultsArray.filter((r) => r.valid).length,
      questionsWithErrors: resultsArray.filter((r) => r.severity === 'error').length,
      questionsWithWarnings: resultsArray.filter((r) => r.severity === 'warning').length,
    };
  }

  /**
   * Calculate category distribution.
   */
  private calculateCategoryDistribution(questions: BankQuestion[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const question of questions) {
      distribution[question.category] = (distribution[question.category] ?? 0) + 1;
    }

    return distribution;
  }
}

/**
 * Factory function for QuestionValidator.
 */
export function createQuestionValidator(): QuestionValidator {
  return new QuestionValidator();
}
