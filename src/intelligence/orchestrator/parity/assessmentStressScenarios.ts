/**
 * @fileoverview Expanded assessment parity stress scenarios.
 */

import type { GoldenParityRiskLevel, GoldenScenario } from './GoldenScenarioTypes';

const dimensions = [
  'analyticalThinking',
  'creativity',
  'socialOrientation',
  'independence',
  'leadership',
  'riskTolerance',
  'achievementDrive',
  'stabilityPreference',
] as const;

const categories = [
  ['sparse-input', 2, [3, 4, 2, 5, 1]],
  ['dense-input', 32, [4, 5, 3, 2, 4, 5, 3, 2]],
  ['contradictory-input', 16, [5, 1, 5, 1, 5, 1, 5, 1]],
  ['high-confidence', 24, [5, 5, 4, 4, 5, 4, 5, 4]],
  ['low-confidence', 4, [2, 2, 3, 2, 3]],
  ['no-dominant-archetype', 12, [3, 3, 3, 3, 3, 3, 3, 3]],
  ['competing-archetypes', 16, [5, 5, 1, 1, 5, 5, 1, 1]],
  ['extreme-analytical', 12, [5, 1, 1, 3, 2, 2, 4, 4]],
  ['extreme-creative', 12, [2, 5, 2, 4, 3, 3, 4, 2]],
  ['extreme-social', 12, [1, 3, 5, 2, 4, 1, 3, 5]],
  ['extreme-entrepreneurial', 12, [4, 4, 3, 5, 5, 5, 5, 1]],
  ['technical-low-motivation', 12, [5, 2, 1, 4, 2, 3, 1, 4]],
  ['humanities-high-structure', 12, [2, 4, 5, 1, 2, 1, 3, 5]],
  ['risk-aversion', 12, [4, 3, 3, 2, 2, 1, 3, 5]],
  ['risk-seeking', 12, [4, 4, 3, 4, 4, 5, 5, 1]],
  ['stable-career-preference', 12, [3, 3, 3, 2, 2, 1, 3, 5]],
  ['exploratory-career-preference', 12, [4, 5, 3, 5, 4, 4, 5, 1]],
  ['boundary-low-values', 8, [1, 1, 1, 1, 1, 1, 1, 1]],
  ['boundary-high-values', 8, [5, 5, 5, 5, 5, 5, 5, 5]],
  ['minimal-valid-boundary', 1, [1]],
] as const;

export const assessmentStressScenarios: readonly GoldenScenario[] = Object.freeze(
  categories.flatMap(([category, questionCount, pattern]) =>
    Array.from({ length: 4 }, (_, variant) =>
      createAssessmentStressScenario(category, questionCount, pattern, variant + 1)
    )
  )
);

function createAssessmentStressScenario(
  category: string,
  questionCount: number,
  pattern: readonly number[],
  variant: number
): GoldenScenario {
  const scenarioId = `assessment-stress-${category}-${variant}`;
  const values = Array.from({ length: questionCount }, (_, index) =>
    clampLikert(pattern[(index + variant - 1) % pattern.length])
  );

  return {
    scenarioId,
    flowType: 'assessment',
    purpose: `Assessment stress scenario for ${category} variant ${variant}.`,
    input: {
      flowType: 'assessment',
      payload: createAssessmentPayload(scenarioId, values),
    },
    expectedBehavior: {
      comparableFields: [
        'hasCognitiveProfile',
        'hasMotivationProfile',
        'hasLifestyleProfile',
        'hasRiskProfile',
        'hasWorkEnvironmentProfile',
        'hasValuesProfile',
        'profileConfidence',
        'assessmentCompleteness',
        'topStrengthCount',
        'developmentAreaCount',
      ],
      riskLevel: riskLevelFor(category),
      riskNotes: [
        'Uses AssessmentEngine.processResponses question/response input structure.',
        'Invalid-but-recoverable arbitrary fields are not added because the real schema has no recovery contract.',
      ],
    },
  };
}

function createAssessmentPayload(scenarioId: string, values: readonly number[]) {
  const questions = values.map((value, index) => {
    const dimension = dimensions[index % dimensions.length];
    return {
      id: `${scenarioId}-q${index + 1}`,
      type: 'likert' as const,
      category: dimension,
      dimension,
      weight: 100,
      prompt: `Stress ${dimension}`,
      minScale: 1,
      maxScale: 5,
      labels: {
        min: 'Low',
        max: 'High',
      },
      expectedValue: value,
    };
  });

  return {
    questions: questions.map(({ expectedValue: _expectedValue, ...question }) => question),
    responses: questions.map((question) => ({
      questionId: question.id,
      type: 'likert' as const,
      value: question.expectedValue,
    })),
  };
}

function riskLevelFor(category: string): GoldenParityRiskLevel {
  if (category.includes('minimal') || category.includes('sparse')) return 'HIGH';
  if (category.includes('contradictory') || category.includes('boundary')) return 'MEDIUM';
  return 'LOW';
}

function clampLikert(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}
