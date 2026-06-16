/**
 * @fileoverview Golden career-fit parity scenarios.
 */

import type { GoldenScenario } from './GoldenScenarioTypes';

const scenarioBlueprints = [
  ['career-fit-high-obvious', 'high obvious fit', 92],
  ['career-fit-low-obvious', 'low obvious fit', 24],
  ['career-fit-medium', 'medium fit', 62],
  ['career-fit-skill-high-interest-low', 'high skill match / low interest match', 68],
  ['career-fit-skill-low-interest-high', 'low skill match / high interest match', 58],
  ['career-fit-market-high-personal-low', 'high market fit / low personal fit', 55],
  ['career-fit-personal-high-market-low', 'high personal fit / low market fit', 70],
  ['career-fit-technical', 'technical career', 84],
  ['career-fit-creative', 'creative career', 79],
  ['career-fit-business', 'business career', 75],
  ['career-fit-healthcare', 'healthcare career', 73],
  ['career-fit-education', 'education career', 69],
  ['career-fit-research', 'research career', 81],
  ['career-fit-entrepreneurship', 'entrepreneurship path', 76],
  ['career-fit-stable-preference', 'stable career preference', 83],
  ['career-fit-high-risk-preference', 'high-risk career preference', 72],
  ['career-fit-ambiguous-profile', 'ambiguous profile', 50],
  ['career-fit-missing-optional', 'missing optional data', 60],
  ['career-fit-strong-constraints', 'strong constraints', 45],
  ['career-fit-minimal-valid', 'edge/minimal valid input', 52],
] as const;

export const careerFitGoldenScenarios: readonly GoldenScenario[] = scenarioBlueprints.map(
  ([scenarioId, purpose, score]) => ({
    scenarioId,
    flowType: 'career-fit',
    purpose,
    input: {
      flowType: 'career-fit',
      payload: {
        profileId: `${scenarioId}-profile`,
        profile: createProfile(score),
        career: createCareer(scenarioId, purpose),
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
      riskLevel: scenarioId.includes('missing') || scenarioId.includes('minimal') ? 'MEDIUM' : 'LOW',
      riskNotes: [
        'Uses CareerFitEngine-compatible profile/career container shape.',
        'Comparison is based on normalized career-fit output fields.',
      ],
    },
  })
);

function createProfile(score: number) {
  return {
    cognitive: { analytical: score, creative: score, systematic: score },
    motivation: { achievement: score, autonomy: score, impact: score },
    lifestyle: { workLifeBalance: score, stabilityPreference: score },
    risk: { careerRiskTolerance: score, financialRiskTolerance: score },
    workEnvironment: { independentWork: score, peopleOriented: score },
    values: { money: score, freedom: score, impact: score },
    confidence: { profileConfidence: 80, assessmentCompleteness: 80 },
  };
}

function createCareer(scenarioId: string, purpose: string) {
  return {
    careerId: scenarioId,
    careerTitle: purpose,
    careerSummary: purpose,
    cognitiveDemands: {
      analyticalDemand: scored(72),
      creativeDemand: scored(64),
      systematicDemand: scored(70),
      verbalDemand: scored(58),
      spatialDemand: scored(54),
      quantitativeDemand: scored(68),
    },
    motivationalDemands: {
      achievementDemand: scored(72),
      masteryDemand: scored(70),
      autonomyDemand: scored(64),
      impactDemand: scored(62),
      recognitionDemand: scored(58),
      securityDemand: scored(60),
    },
    lifestyleCharacteristics: {
      incomePotential: scored(70),
      workLifeBalance: scored(62),
      locationFlexibility: scored(60),
      travelRequirement: scored(42),
      stabilityLevel: scored(66),
    },
    workEnvironment: {
      peopleIntensity: scored(58),
      independenceLevel: scored(64),
      leadershipOpportunity: scored(60),
      researchIntensity: scored(56),
      executionIntensity: scored(68),
    },
    careerRisks: {
      automationRisk: scored(35),
      competitionRisk: scored(48),
      burnoutRisk: scored(44),
      educationBarrier: scored(46),
    },
    careerAdvantages: {
      futureRelevance: scored(76),
      optionality: scored(72),
      careerMobility: scored(70),
      transferability: scored(74),
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
      version: 'golden-parity-v1',
      dataSource: 'Phase5.3 golden parity fixture',
    },
  };
}

function scored(score: number) {
  return {
    score,
    confidence: 80,
    evidence: [],
    lastUpdated: new Date('2026-06-06T00:00:00.000Z'),
  };
}
