/**
 * @fileoverview Expanded career-fit parity stress scenarios.
 */

import type { GoldenParityRiskLevel, GoldenScenario } from './GoldenScenarioTypes';

const categories = [
  ['perfect-fit', 90, 90],
  ['obvious-poor-fit', 20, 85],
  ['medium-fit', 55, 60],
  ['skill-high-interest-low', 88, 35],
  ['interest-high-skill-low', 35, 88],
  ['market-high-personal-low', 45, 80],
  ['personal-high-market-low', 82, 45],
  ['salary-preference-conflict', 90, 50],
  ['low-risk-tolerance-conflict', 25, 75],
  ['geographic-constraint', 60, 60],
  ['education-constraint', 55, 80],
  ['technical-career', 82, 70],
  ['creative-career', 78, 68],
  ['business-career', 74, 66],
  ['healthcare-career', 72, 70],
  ['education-career', 68, 64],
  ['research-career', 84, 76],
  ['entrepreneurship-career', 86, 58],
  ['emerging-career', 76, 72],
  ['declining-career', 60, 40],
  ['ambiguous-profile', 50, 50],
  ['missing-optional-fields', 58, 58],
  ['minimal-valid-input', 52, 52],
  ['extreme-low-boundary', 1, 99],
  ['extreme-high-boundary', 99, 1],
] as const;

export const careerFitStressScenarios: readonly GoldenScenario[] = Object.freeze(
  categories.flatMap(([category, profileScore, careerScore]) =>
    Array.from({ length: 4 }, (_, variant) =>
      createCareerFitStressScenario(category, profileScore, careerScore, variant + 1)
    )
  )
);

function createCareerFitStressScenario(
  category: string,
  profileScore: number,
  careerScore: number,
  variant: number
): GoldenScenario {
  const scenarioId = `career-fit-stress-${category}-${variant}`;
  const adjustedProfileScore = clampScore(profileScore + (variant - 2) * 3);
  const adjustedCareerScore = clampScore(careerScore - (variant - 2) * 2);

  return {
    scenarioId,
    flowType: 'career-fit',
    purpose: `Career-fit stress scenario for ${category} variant ${variant}.`,
    input: {
      flowType: 'career-fit',
      payload: {
        profileId: `${scenarioId}-profile`,
        profile: createProfile(adjustedProfileScore, category),
        career: createCareer(scenarioId, category, adjustedCareerScore),
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
      riskLevel: riskLevelFor(category),
      riskNotes: [
        'Uses CareerFitEngine.calculateFit profile/career/profileId input structure.',
        'Geographic and education constraints are represented only through supported profile constraint scores.',
      ],
    },
  };
}

function createProfile(score: number, category: string) {
  const lowMotivation = category.includes('interest-low') || category.includes('low-risk');
  const highStructure = category.includes('education') || category.includes('stable');
  const constraintScore = category.includes('constraint') ? 90 : 30;

  return {
    cognitive: {
      analytical: score,
      creative: category.includes('creative') ? clampScore(score + 12) : score,
      systematic: highStructure ? clampScore(score + 10) : score,
      abstractThinking: score,
      verbalReasoning: category.includes('education') || category.includes('healthcare') ? clampScore(score + 8) : score,
      spatialReasoning: category.includes('technical') ? clampScore(score + 8) : score,
      quantitativeReasoning: category.includes('business') || category.includes('technical') ? clampScore(score + 10) : score,
    },
    motivation: {
      achievement: lowMotivation ? 25 : score,
      mastery: score,
      autonomy: category.includes('entrepreneurship') ? clampScore(score + 12) : score,
      impact: category.includes('healthcare') || category.includes('education') ? clampScore(score + 10) : score,
      recognition: score,
      security: category.includes('stable') || category.includes('low-risk') ? clampScore(score + 15) : score,
    },
    lifestyle: {
      workLifeBalance: category.includes('salary') ? 35 : score,
      incomePriority: category.includes('salary') ? 95 : score,
      locationFreedom: category.includes('geographic') ? 95 : score,
      travelPreference: category.includes('geographic') ? 10 : score,
      stabilityPreference: category.includes('declining') || category.includes('low-risk') ? 95 : score,
    },
    risk: {
      careerRiskTolerance: category.includes('low-risk') ? 10 : score,
      financialRiskTolerance: category.includes('low-risk') ? 10 : score,
      uncertaintyComfort: category.includes('entrepreneurship') ? clampScore(score + 15) : score,
    },
    workEnvironment: {
      peopleOriented: category.includes('healthcare') || category.includes('education') ? clampScore(score + 10) : score,
      independentWork: category.includes('research') || category.includes('technical') ? clampScore(score + 10) : score,
      leadershipPreference: category.includes('business') || category.includes('entrepreneurship') ? clampScore(score + 10) : score,
      researchPreference: category.includes('research') ? clampScore(score + 15) : score,
      executionPreference: score,
    },
    values: {
      money: category.includes('salary') ? 95 : score,
      prestige: category.includes('business') ? clampScore(score + 8) : score,
      familyTime: category.includes('low-risk') ? 90 : score,
      freedom: category.includes('entrepreneurship') ? clampScore(score + 12) : score,
      impact: category.includes('healthcare') || category.includes('education') ? clampScore(score + 12) : score,
      learning: category.includes('research') || category.includes('emerging') ? clampScore(score + 12) : score,
    },
    strengths: { topStrengths: [], supportingStrengths: [] },
    weaknesses: { developmentAreas: [], riskFactors: [] },
    constraints: {
      financialConstraint: category.includes('salary') ? 80 : constraintScore,
      geographicConstraint: category.includes('geographic') ? 95 : constraintScore,
      educationConstraint: category.includes('education') ? 95 : constraintScore,
      familyResponsibilityConstraint: constraintScore,
    },
    confidence: { profileConfidence: 82, assessmentCompleteness: 84 },
  };
}

function createCareer(scenarioId: string, category: string, score: number) {
  return {
    careerId: scenarioId,
    careerTitle: category,
    careerSummary: category,
    cognitiveDemands: {
      analyticalDemand: scored(category.includes('technical') ? clampScore(score + 12) : score),
      creativeDemand: scored(category.includes('creative') ? clampScore(score + 15) : score),
      systematicDemand: scored(score),
      verbalDemand: scored(category.includes('education') || category.includes('healthcare') ? clampScore(score + 10) : score),
      spatialDemand: scored(category.includes('technical') ? clampScore(score + 8) : score),
      quantitativeDemand: scored(category.includes('business') || category.includes('technical') ? clampScore(score + 10) : score),
    },
    motivationalDemands: {
      achievementDemand: scored(score),
      masteryDemand: scored(category.includes('research') ? clampScore(score + 12) : score),
      autonomyDemand: scored(category.includes('entrepreneurship') ? clampScore(score + 18) : score),
      impactDemand: scored(category.includes('healthcare') || category.includes('education') ? clampScore(score + 10) : score),
      recognitionDemand: scored(score),
      securityDemand: scored(category.includes('declining') || category.includes('entrepreneurship') ? 35 : score),
    },
    lifestyleCharacteristics: {
      incomePotential: scored(category.includes('salary') || category.includes('business') ? 92 : score),
      workLifeBalance: scored(category.includes('entrepreneurship') ? 35 : score),
      locationFlexibility: scored(category.includes('geographic') ? 20 : score),
      travelRequirement: scored(category.includes('geographic') ? 80 : 35),
      stabilityLevel: scored(category.includes('declining') ? 25 : score),
    },
    workEnvironment: {
      peopleIntensity: scored(category.includes('healthcare') || category.includes('education') ? clampScore(score + 15) : score),
      independenceLevel: scored(category.includes('research') || category.includes('technical') ? clampScore(score + 10) : score),
      leadershipOpportunity: scored(category.includes('business') ? clampScore(score + 10) : score),
      researchIntensity: scored(category.includes('research') ? clampScore(score + 18) : score),
      executionIntensity: scored(score),
    },
    careerRisks: {
      automationRisk: scored(category.includes('declining') ? 80 : 35),
      competitionRisk: scored(category.includes('entrepreneurship') ? 80 : 45),
      burnoutRisk: scored(category.includes('healthcare') || category.includes('entrepreneurship') ? 75 : 40),
      educationBarrier: scored(category.includes('education') || category.includes('healthcare') ? 75 : 45),
    },
    careerAdvantages: {
      futureRelevance: scored(category.includes('emerging') ? 95 : category.includes('declining') ? 25 : 72),
      optionality: scored(category.includes('emerging') ? 90 : 70),
      careerMobility: scored(70),
      transferability: scored(72),
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
      version: 'stress-v1',
      dataSource: 'Phase5.4 stress fixture',
    },
  };
}

function scored(score: number) {
  return {
    score: clampScore(score),
    confidence: 80,
    evidence: [],
    lastUpdated: new Date('2026-06-06T00:00:00.000Z'),
  };
}

function riskLevelFor(category: string): GoldenParityRiskLevel {
  if (category.includes('minimal') || category.includes('malformed') || category.includes('extreme')) return 'HIGH';
  if (category.includes('conflict') || category.includes('constraint') || category.includes('declining')) return 'MEDIUM';
  return 'LOW';
}

function clampScore(value: number): number {
  return Math.min(99, Math.max(1, Math.round(value)));
}
