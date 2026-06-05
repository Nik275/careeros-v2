/**
 * CareerOS Assessment Question Intelligence System - Question Categories
 *
 * Phase B.2: Assessment Framework Foundation
 *
 * Defines question categories, their dimensions, and metadata for
 * high-quality psychological and career-relevant assessment.
 *
 * @module question-categories
 * @version 1.0.0
 */

/**
 * Question category identifiers.
 */
export const QUESTION_CATEGORIES = {
  COGNITIVE: 'cognitive',
  MOTIVATION: 'motivation',
  VALUES: 'values',
  LIFESTYLE: 'lifestyle',
  RISK: 'risk',
  WORK_ENVIRONMENT: 'workEnvironment',
  LEADERSHIP: 'leadership',
  SOCIAL: 'social',
  CAREER_EXPLORATION: 'careerExploration',
} as const;

/**
 * Type for question category values.
 */
export type QuestionCategory =
  (typeof QUESTION_CATEGORIES)[keyof typeof QUESTION_CATEGORIES];

/**
 * Assessment dimensions within each category.
 */
export const CATEGORY_DIMENSIONS: Record<QuestionCategory, string[]> = {
  [QUESTION_CATEGORIES.COGNITIVE]: [
    'analyticalThinking',
    'abstractReasoning',
    'creativeProblemSolving',
    'systematicProcessing',
    'patternRecognition',
    'criticalEvaluation',
  ],
  [QUESTION_CATEGORIES.MOTIVATION]: [
    'achievementDrive',
    'masteryOrientation',
    'autonomyNeed',
    'purposeAlignment',
    'recognitionDrive',
    'securityNeed',
  ],
  [QUESTION_CATEGORIES.VALUES]: [
    'intrinsicValues',
    'extrinsicValues',
    'socialValues',
    'growthValues',
    'stabilityValues',
    'impactValues',
  ],
  [QUESTION_CATEGORIES.LIFESTYLE]: [
    'workLifeIntegration',
    'flexibilityNeed',
    'locationPreference',
    'pacePreference',
    'stabilityPreference',
  ],
  [QUESTION_CATEGORIES.RISK]: [
    'careerRiskTolerance',
    'financialRiskTolerance',
    'ambiguityTolerance',
    'failureRecovery',
    'uncertaintyComfort',
  ],
  [QUESTION_CATEGORIES.WORK_ENVIRONMENT]: [
    'independencePreference',
    'collaborationPreference',
    'structureNeed',
    'varietyNeed',
    'environmentSensitivity',
  ],
  [QUESTION_CATEGORIES.LEADERSHIP]: [
    'influenceOrientation',
    'decisionComfort',
    'responsibilityCapacity',
    'visionCapability',
    'teamOrientation',
  ],
  [QUESTION_CATEGORIES.SOCIAL]: [
    'socialEnergy',
    'empathyLevel',
    'communicationStyle',
    'relationshipImportance',
    'conflictApproach',
  ],
  [QUESTION_CATEGORIES.CAREER_EXPLORATION]: [
    'industryInterest',
    'roleCuriosity',
    'explorationOpenness',
    'careerAwareness',
  ],
};

/**
 * Category metadata for assessment design.
 */
export interface CategoryMetadata {
  /** Category identifier */
  id: QuestionCategory;

  /** Human-readable name */
  name: string;

  /** Description of what this category assesses */
  description: string;

  /** Target number of questions for standard assessment */
  targetQuestionCount: number;

  /** Weight in overall assessment (0-100) */
  assessmentWeight: number;

  /** Minimum questions needed for reliable signal */
  minQuestionsForSignal: number;

  /** Dimensions measured by this category */
  dimensions: string[];

  /** Priority order in assessment flow */
  priority: number;
}

/**
 * Metadata for all question categories.
 */
export const CATEGORY_METADATA: Record<QuestionCategory, CategoryMetadata> = {
  [QUESTION_CATEGORIES.COGNITIVE]: {
    id: QUESTION_CATEGORIES.COGNITIVE,
    name: 'Cognitive Patterns',
    description: 'How you process information, solve problems, and think',
    targetQuestionCount: 20,
    assessmentWeight: 20,
    minQuestionsForSignal: 5,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.COGNITIVE],
    priority: 1,
  },
  [QUESTION_CATEGORIES.MOTIVATION]: {
    id: QUESTION_CATEGORIES.MOTIVATION,
    name: 'Motivational Drivers',
    description: 'What energizes and drives you in your work',
    targetQuestionCount: 20,
    assessmentWeight: 18,
    minQuestionsForSignal: 5,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.MOTIVATION],
    priority: 2,
  },
  [QUESTION_CATEGORIES.VALUES]: {
    id: QUESTION_CATEGORIES.VALUES,
    name: 'Core Values',
    description: 'What fundamentally matters to you in life and career',
    targetQuestionCount: 20,
    assessmentWeight: 15,
    minQuestionsForSignal: 4,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.VALUES],
    priority: 3,
  },
  [QUESTION_CATEGORIES.LIFESTYLE]: {
    id: QUESTION_CATEGORIES.LIFESTYLE,
    name: 'Lifestyle Preferences',
    description: 'How you want work to fit into your life',
    targetQuestionCount: 20,
    assessmentWeight: 12,
    minQuestionsForSignal: 4,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.LIFESTYLE],
    priority: 4,
  },
  [QUESTION_CATEGORIES.RISK]: {
    id: QUESTION_CATEGORIES.RISK,
    name: 'Risk Profile',
    description: 'Your comfort with uncertainty and potential downsides',
    targetQuestionCount: 20,
    assessmentWeight: 10,
    minQuestionsForSignal: 4,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.RISK],
    priority: 5,
  },
  [QUESTION_CATEGORIES.WORK_ENVIRONMENT]: {
    id: QUESTION_CATEGORIES.WORK_ENVIRONMENT,
    name: 'Work Environment',
    description: 'The context and setting where you do your best work',
    targetQuestionCount: 20,
    assessmentWeight: 12,
    minQuestionsForSignal: 4,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.WORK_ENVIRONMENT],
    priority: 6,
  },
  [QUESTION_CATEGORIES.LEADERSHIP]: {
    id: QUESTION_CATEGORIES.LEADERSHIP,
    name: 'Leadership Orientation',
    description: 'Your natural tendency toward leadership and influence',
    targetQuestionCount: 10,
    assessmentWeight: 8,
    minQuestionsForSignal: 3,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.LEADERSHIP],
    priority: 7,
  },
  [QUESTION_CATEGORIES.SOCIAL]: {
    id: QUESTION_CATEGORIES.SOCIAL,
    name: 'Social Dynamics',
    description: 'How you interact with and relate to others',
    targetQuestionCount: 10,
    assessmentWeight: 5,
    minQuestionsForSignal: 3,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.SOCIAL],
    priority: 8,
  },
  [QUESTION_CATEGORIES.CAREER_EXPLORATION]: {
    id: QUESTION_CATEGORIES.CAREER_EXPLORATION,
    name: 'Career Exploration',
    description: 'Your openness to and awareness of career possibilities',
    targetQuestionCount: 10,
    assessmentWeight: 0,
    minQuestionsForSignal: 2,
    dimensions: CATEGORY_DIMENSIONS[QUESTION_CATEGORIES.CAREER_EXPLORATION],
    priority: 9,
  },
};

/**
 * Get all categories in priority order.
 */
export function getCategoriesByPriority(): CategoryMetadata[] {
  return Object.values(CATEGORY_METADATA).sort((a, b) => a.priority - b.priority);
}

/**
 * Get dimensions for a specific category.
 */
export function getCategoryDimensions(category: QuestionCategory): string[] {
  return CATEGORY_DIMENSIONS[category] ?? [];
}

/**
 * Validate that a dimension belongs to a category.
 */
export function isValidDimension(
  category: QuestionCategory,
  dimension: string
): boolean {
  return CATEGORY_DIMENSIONS[category]?.includes(dimension) ?? false;
}

/**
 * Get total target question count across all categories.
 */
export function getTotalTargetQuestionCount(): number {
  return Object.values(CATEGORY_METADATA).reduce(
    (sum, meta) => sum + meta.targetQuestionCount,
    0
  );
}
