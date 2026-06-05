/**
 * CareerOS Assessment Question Intelligence System
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * @module assessment-questions
 * @version 1.0.0
 */

// Question Categories
export {
  QUESTION_CATEGORIES,
  CATEGORY_DIMENSIONS,
  CATEGORY_METADATA,
  getCategoriesByPriority,
  getCategoryDimensions,
  isValidDimension,
  getTotalTargetQuestionCount,
  type QuestionCategory,
  type CategoryMetadata,
} from './question-categories';

// Question Bank
export {
  QUESTION_BANK,
  TOTAL_QUESTION_COUNT,
  type BankQuestion,
  getQuestionsByCategory,
  getQuestionById,
  getAllQuestionIds,
  countQuestionsByCategory,
} from './question-bank';

// Question Validator
export {
  QuestionValidator,
  createQuestionValidator,
  type QuestionValidationResult,
  type ValidationIssue,
  type ValidationIssueType,
  type BankValidationResult,
} from './question-validator';

// Question Generator
export {
  QuestionGenerator,
  createQuestionGenerator,
  GENERATION_TEMPLATES,
  DEFAULT_QUALITY_CRITERIA,
  type GeneratedQuestion,
  type QuestionGenerationRequest,
  type GenerationPrompt,
  type QualityCriteria,
  type GenerationResult,
} from './question-generator';

// Question Selection Engine
export {
  QuestionSelectionEngine,
  createQuestionSelectionEngine,
  ASSESSMENT_CONFIGS,
  type AssessmentLength,
  type SelectionConfig,
  type SelectedQuestionSet,
} from './question-selection-engine';
