/**
 * @fileoverview Deterministic randomized parity scenario generator.
 */

import type { GoldenParityRiskLevel, GoldenScenario } from './GoldenScenarioTypes';

export interface GoldenParityFuzzerOptions {
  seed: number;
  count: number;
  category?: string;
  riskLevel?: GoldenParityRiskLevel;
}

const assessmentDimensions = [
  'analyticalThinking',
  'creativity',
  'socialOrientation',
  'independence',
  'leadership',
  'riskTolerance',
  'achievementDrive',
  'stabilityPreference',
] as const;

export class GoldenParityFuzzer {
  generateAssessmentScenarios(options: GoldenParityFuzzerOptions): readonly GoldenScenario[] {
    const random = createSeededRandom(options.seed);
    return Object.freeze(
      Array.from({ length: options.count }, (_, index) => {
        const category = options.category ?? pickCategory(random, ['balanced', 'sparse', 'dense', 'extreme', 'conflict']);
        const questionCount = category === 'sparse' ? 2 + Math.floor(random() * 3) : category === 'dense' ? 20 + Math.floor(random() * 13) : 8 + Math.floor(random() * 8);
        const values = Array.from({ length: questionCount }, (_entry, valueIndex) =>
          valueForCategory(category, random, valueIndex)
        );
        const scenarioId = `assessment-fuzz-${options.seed}-${category}-${index + 1}`;
        return createAssessmentScenario(scenarioId, category, values, options.riskLevel ?? riskForCategory(category));
      })
    );
  }

  generateCareerFitScenarios(options: GoldenParityFuzzerOptions): readonly GoldenScenario[] {
    const random = createSeededRandom(options.seed);
    return Object.freeze(
      Array.from({ length: options.count }, (_, index) => {
        const category = options.category ?? pickCategory(random, ['technical', 'creative', 'business', 'risk', 'ambiguous']);
        const profileScore = 10 + Math.floor(random() * 90);
        const careerScore = 10 + Math.floor(random() * 90);
        const scenarioId = `career-fit-fuzz-${options.seed}-${category}-${index + 1}`;
        return createCareerFitScenario(
          scenarioId,
          category,
          profileScore,
          careerScore,
          options.riskLevel ?? riskForCategory(category)
        );
      })
    );
  }
}

function createAssessmentScenario(
  scenarioId: string,
  category: string,
  values: readonly number[],
  riskLevel: GoldenParityRiskLevel
): GoldenScenario {
  const questions = values.map((value, index) => {
    const dimension = assessmentDimensions[index % assessmentDimensions.length];
    return {
      id: `${scenarioId}-q${index + 1}`,
      type: 'likert' as const,
      category: dimension,
      dimension,
      weight: 100,
      prompt: `Fuzz ${dimension}`,
      minScale: 1,
      maxScale: 5,
      labels: { min: 'Low', max: 'High' },
      expectedValue: value,
    };
  });

  return {
    scenarioId,
    flowType: 'assessment',
    purpose: `Deterministic fuzz assessment scenario for ${category}.`,
    input: {
      flowType: 'assessment',
      payload: {
        questions: questions.map(({ expectedValue: _expectedValue, ...question }) => question),
        responses: questions.map((question) => ({
          questionId: question.id,
          type: 'likert' as const,
          value: question.expectedValue,
        })),
      },
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
      riskLevel,
      riskNotes: ['Deterministically generated schema-valid assessment input.'],
    },
  };
}

function createCareerFitScenario(
  scenarioId: string,
  category: string,
  profileScore: number,
  careerScore: number,
  riskLevel: GoldenParityRiskLevel
): GoldenScenario {
  return {
    scenarioId,
    flowType: 'career-fit',
    purpose: `Deterministic fuzz career-fit scenario for ${category}.`,
    input: {
      flowType: 'career-fit',
      payload: {
        profileId: `${scenarioId}-profile`,
        profile: createProfile(profileScore, category),
        career: createCareer(scenarioId, category, careerScore),
      },
    },
    expectedBehavior: {
      comparableFields: [
        'careerId',
        'studentProfileId',
        'overallFitScore',
        'fitLevel',
        'confidenceOverall',
        'confidenceLevel',
        'strengthCount',
        'concernCount',
      ],
      riskLevel,
      riskNotes: ['Deterministically generated schema-valid career-fit input.'],
    },
  };
}

function createProfile(score: number, category: string) {
  const bounded = clampScore(score);
  return {
    cognitive: {
      analytical: category === 'technical' ? clampScore(bounded + 10) : bounded,
      creative: category === 'creative' ? clampScore(bounded + 10) : bounded,
      systematic: bounded,
      abstractThinking: bounded,
      verbalReasoning: bounded,
      spatialReasoning: bounded,
      quantitativeReasoning: bounded,
    },
    motivation: {
      achievement: bounded,
      mastery: bounded,
      autonomy: bounded,
      impact: bounded,
      recognition: bounded,
      security: category === 'risk' ? clampScore(bounded + 20) : bounded,
    },
    lifestyle: {
      workLifeBalance: bounded,
      incomePriority: category === 'business' ? clampScore(bounded + 15) : bounded,
      locationFreedom: bounded,
      travelPreference: bounded,
      stabilityPreference: category === 'risk' ? clampScore(bounded + 20) : bounded,
    },
    risk: {
      careerRiskTolerance: category === 'risk' ? clampScore(bounded - 20) : bounded,
      financialRiskTolerance: category === 'risk' ? clampScore(bounded - 20) : bounded,
      uncertaintyComfort: bounded,
    },
    workEnvironment: {
      peopleOriented: bounded,
      independentWork: bounded,
      leadershipPreference: category === 'business' ? clampScore(bounded + 10) : bounded,
      researchPreference: bounded,
      executionPreference: bounded,
    },
    values: {
      money: category === 'business' ? clampScore(bounded + 20) : bounded,
      prestige: bounded,
      familyTime: bounded,
      freedom: bounded,
      impact: bounded,
      learning: category === 'technical' ? clampScore(bounded + 10) : bounded,
    },
    strengths: { topStrengths: [], supportingStrengths: [] },
    weaknesses: { developmentAreas: [], riskFactors: [] },
    constraints: {
      financialConstraint: 30,
      geographicConstraint: 30,
      educationConstraint: 30,
      familyResponsibilityConstraint: 30,
    },
    confidence: { profileConfidence: 80, assessmentCompleteness: 80 },
  };
}

function createCareer(scenarioId: string, category: string, score: number) {
  const bounded = clampScore(score);
  return {
    careerId: scenarioId,
    careerTitle: category,
    careerSummary: category,
    cognitiveDemands: {
      analyticalDemand: scored(category === 'technical' ? bounded + 12 : bounded),
      creativeDemand: scored(category === 'creative' ? bounded + 12 : bounded),
      systematicDemand: scored(bounded),
      verbalDemand: scored(bounded),
      spatialDemand: scored(bounded),
      quantitativeDemand: scored(category === 'business' || category === 'technical' ? bounded + 10 : bounded),
    },
    motivationalDemands: {
      achievementDemand: scored(bounded),
      masteryDemand: scored(bounded),
      autonomyDemand: scored(bounded),
      impactDemand: scored(bounded),
      recognitionDemand: scored(bounded),
      securityDemand: scored(category === 'risk' ? bounded - 20 : bounded),
    },
    lifestyleCharacteristics: {
      incomePotential: scored(category === 'business' ? bounded + 15 : bounded),
      workLifeBalance: scored(bounded),
      locationFlexibility: scored(bounded),
      travelRequirement: scored(35),
      stabilityLevel: scored(category === 'risk' ? bounded - 20 : bounded),
    },
    workEnvironment: {
      peopleIntensity: scored(bounded),
      independenceLevel: scored(bounded),
      leadershipOpportunity: scored(category === 'business' ? bounded + 10 : bounded),
      researchIntensity: scored(category === 'technical' ? bounded + 10 : bounded),
      executionIntensity: scored(bounded),
    },
    careerRisks: {
      automationRisk: scored(category === 'risk' ? 80 : 35),
      competitionRisk: scored(category === 'business' ? 70 : 45),
      burnoutRisk: scored(category === 'risk' ? 75 : 40),
      educationBarrier: scored(45),
    },
    careerAdvantages: {
      futureRelevance: scored(75),
      optionality: scored(70),
      careerMobility: scored(70),
      transferability: scored(70),
    },
    evidence: {
      sources: [],
      overallConfidence: 78,
      sourceCount: 3,
      dataFreshness: 80,
      evidenceQuality: 75,
    },
    metadata: {
      createdAt: new Date('2026-06-06T00:00:00.000Z'),
      updatedAt: new Date('2026-06-06T00:00:00.000Z'),
      version: 'fuzz-v1',
      dataSource: 'Phase5.4 deterministic fuzzer',
    },
  };
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function valueForCategory(category: string, random: () => number, index: number): number {
  if (category === 'extreme') return index % 2 === 0 ? 1 : 5;
  if (category === 'conflict') return index % 2 === 0 ? 5 : 1;
  return clampLikert(1 + Math.floor(random() * 5));
}

function pickCategory(random: () => number, categories: readonly string[]): string {
  return categories[Math.floor(random() * categories.length)] ?? categories[0];
}

function riskForCategory(category: string): GoldenParityRiskLevel {
  if (category === 'sparse' || category === 'extreme' || category === 'risk') return 'HIGH';
  if (category === 'conflict' || category === 'ambiguous') return 'MEDIUM';
  return 'LOW';
}

function scored(score: number) {
  return {
    score: clampScore(score),
    confidence: 80,
    evidence: [],
    lastUpdated: new Date('2026-06-06T00:00:00.000Z'),
  };
}

function clampScore(value: number): number {
  return Math.min(99, Math.max(1, Math.round(value)));
}

function clampLikert(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}
