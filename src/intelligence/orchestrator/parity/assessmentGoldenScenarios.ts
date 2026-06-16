/**
 * @fileoverview Golden assessment parity scenarios.
 */

import type { GoldenScenario } from './GoldenScenarioTypes';

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

const scenarioBlueprints = [
  ['assessment-balanced', 'balanced student profile', [3, 3, 3, 3, 3, 3, 3, 3]],
  ['assessment-analytical', 'analytical profile', [5, 3, 2, 3, 3, 2, 4, 4]],
  ['assessment-creative', 'creative profile', [3, 5, 3, 4, 3, 3, 4, 2]],
  ['assessment-social', 'social profile', [2, 3, 5, 3, 4, 2, 3, 4]],
  ['assessment-entrepreneurial', 'entrepreneurial profile', [4, 4, 3, 5, 5, 5, 5, 1]],
  ['assessment-high-confidence', 'high-confidence profile', [5, 5, 5, 5, 5, 5, 5, 5]],
  ['assessment-low-confidence', 'low-confidence profile', [2, 2, 2, 2, 2, 2, 2, 2]],
  ['assessment-conflicting', 'conflicting answers', [5, 1, 5, 1, 5, 1, 5, 1]],
  ['assessment-sparse', 'sparse answers', [4, 3]],
  ['assessment-dense', 'dense answers', [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 3, 3, 2, 2, 1, 1]],
  ['assessment-extreme', 'extreme preference answers', [1, 5, 1, 5, 1, 5, 1, 5]],
  ['assessment-neutral', 'neutral preference answers', [3, 3, 3, 3, 3, 3, 3, 3]],
  ['assessment-inconsistent-motivation', 'inconsistent motivation signals', [3, 4, 3, 2, 5, 1, 5, 1]],
  ['assessment-technical', 'strong technical orientation', [5, 2, 1, 4, 2, 3, 5, 4]],
  ['assessment-humanities', 'strong humanities orientation', [2, 4, 5, 3, 3, 2, 3, 4]],
  ['assessment-generalist', 'broad generalist orientation', [4, 4, 4, 4, 4, 4, 4, 4]],
  ['assessment-risk-averse', 'risk-averse student', [4, 3, 3, 2, 2, 1, 3, 5]],
  ['assessment-risk-seeking', 'risk-seeking student', [4, 4, 3, 4, 4, 5, 5, 1]],
  ['assessment-unclear', 'unclear archetype', [3, 2, 3, 2, 3, 2, 3, 2]],
  ['assessment-minimal-valid', 'edge/minimal valid input', [3]],
] as const;

export const assessmentGoldenScenarios: readonly GoldenScenario[] = scenarioBlueprints.map(
  ([scenarioId, purpose, values]) => ({
    scenarioId,
    flowType: 'assessment',
    purpose,
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
      riskLevel: values.length < 3 ? 'MEDIUM' : 'LOW',
      riskNotes: [
        'Uses AssessmentEngine-compatible likert question and response shapes.',
        values.length < 3 ? 'Sparse scenario may produce lower confidence.' : 'Stable deterministic scenario.',
      ],
    },
  })
);

function createAssessmentPayload(scenarioId: string, values: readonly number[]) {
  const questions = values.map((value, index) => {
    const dimension = dimensions[index % dimensions.length];
    return {
      id: `${scenarioId}-q${index + 1}`,
      type: 'likert' as const,
      category: dimension,
      dimension,
      weight: 100,
      prompt: `Assess ${dimension}`,
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
