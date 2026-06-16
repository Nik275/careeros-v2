/**
 * @fileoverview Phase 5.7 staging shadow dataset from validated synthetic parity scenarios.
 */

import { assessmentGoldenScenarios } from '../../parity/assessmentGoldenScenarios';
import { assessmentStressScenarios } from '../../parity/assessmentStressScenarios';
import { careerFitGoldenScenarios } from '../../parity/careerFitGoldenScenarios';
import { careerFitStressScenarios } from '../../parity/careerFitStressScenarios';
import { GoldenParityFuzzer } from '../../parity/GoldenParityFuzzer';
import type { GoldenScenario } from '../../parity/GoldenScenarioTypes';
import type {
  StagingShadowRiskLevel,
  StagingShadowScenario,
  StagingShadowSourceSuite,
} from './StagingShadowRunTypes';

const fuzzer = new GoldenParityFuzzer();

export const stagingShadowRunDataset: readonly StagingShadowScenario[] = Object.freeze([
  ...wrapScenarioBatch('golden', assessmentGoldenScenarios.slice(0, 15)),
  ...wrapScenarioBatch('stress', assessmentStressScenarios.slice(0, 15)),
  ...wrapScenarioBatch('fuzz', fuzzer.generateAssessmentScenarios({ seed: 5701, count: 10 })),
  ...wrapScenarioBatch('golden', careerFitGoldenScenarios.slice(0, 15)),
  ...wrapScenarioBatch('stress', careerFitStressScenarios.slice(0, 15)),
  ...wrapScenarioBatch('fuzz', fuzzer.generateCareerFitScenarios({ seed: 5702, count: 10 })),
]);

export function getStagingShadowRunDataset(): readonly StagingShadowScenario[] {
  return stagingShadowRunDataset;
}

export function getStagingShadowScenariosByFlow(
  flow: StagingShadowScenario['flow']
): readonly StagingShadowScenario[] {
  return stagingShadowRunDataset.filter((scenario) => scenario.flow === flow);
}

export function validateStagingShadowDatasetSafety(
  scenarios: readonly StagingShadowScenario[] = stagingShadowRunDataset
): { safe: boolean; reasons: readonly string[] } {
  const reasons: string[] = [];
  for (const scenario of scenarios) {
    const serialized = JSON.stringify(scenario);
    if (!scenario.synthetic) {
      reasons.push(`${scenario.scenarioId}: synthetic flag missing`);
    }
    if (scenario.privacyClassification !== 'SYNTHETIC') {
      reasons.push(`${scenario.scenarioId}: expected synthetic privacy classification`);
    }
    if (/email|phone|address|ssn|real[-_\s]?student|@/i.test(serialized)) {
      reasons.push(`${scenario.scenarioId}: potential real student data marker`);
    }
  }

  return {
    safe: reasons.length === 0,
    reasons,
  };
}

function wrapScenarioBatch(
  sourceSuite: StagingShadowSourceSuite,
  scenarios: readonly GoldenScenario[]
): readonly StagingShadowScenario[] {
  return scenarios.map((scenario) => wrapGoldenScenario(sourceSuite, scenario));
}

function wrapGoldenScenario(
  sourceSuite: StagingShadowSourceSuite,
  scenario: GoldenScenario
): StagingShadowScenario {
  const flow = scenario.flowType;
  const productionOutputSnapshot =
    flow === 'assessment'
      ? createAssessmentProductionSnapshot(scenario)
      : createCareerFitProductionSnapshot(scenario);

  return Object.freeze({
    scenarioId: `staging-${scenario.scenarioId}`,
    flow,
    sourceSuite,
    riskLevel: scenario.expectedBehavior.riskLevel as StagingShadowRiskLevel,
    purpose: scenario.purpose,
    input: createSafeInputSummary(scenario),
    hookInput: createHookInput(scenario),
    expectedAuthority: flow === 'assessment' ? 'StudentUnderstandingAuthority' : 'OptionGeneratorAuthority',
    expectedCapability: flow === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
    privacyClassification: 'SYNTHETIC',
    productionOutputSnapshot,
    shadowOutput:
      flow === 'assessment'
        ? createAssessmentShadowOutput(productionOutputSnapshot)
        : createCareerFitShadowOutput(productionOutputSnapshot),
    synthetic: true,
  });
}

function createSafeInputSummary(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const payload = isRecord(scenario.input.payload) ? scenario.input.payload : {};
  return Object.freeze({
    sourceScenarioId: scenario.scenarioId,
    flowType: scenario.flowType,
    questionCount: Array.isArray(payload.questions) ? payload.questions.length : undefined,
    responseCount: Array.isArray(payload.responses) ? payload.responses.length : undefined,
    profileId: typeof payload.profileId === 'string' ? payload.profileId : undefined,
    careerId: readNestedString(payload.career, 'careerId'),
    synthetic: true,
  });
}

function createHookInput(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const payload = isRecord(scenario.input.payload) ? scenario.input.payload : {};
  if (scenario.flowType === 'assessment') {
    return Object.freeze({
      questions: Array.isArray(payload.questions) ? payload.questions : [],
      responses: Array.isArray(payload.responses) ? payload.responses : [],
    });
  }

  return Object.freeze({
    profileId: typeof payload.profileId === 'string' ? payload.profileId : `${scenario.scenarioId}-profile`,
    profile: payload.profile,
    career: payload.career,
  });
}

function createAssessmentProductionSnapshot(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const confidence = 70 + (hashNumber(scenario.scenarioId) % 25);
  const completeness = 75 + (hashNumber(`${scenario.scenarioId}|coverage`) % 20);
  return Object.freeze({
    hasCognitiveProfile: true,
    hasMotivationProfile: true,
    hasLifestyleProfile: true,
    hasRiskProfile: true,
    hasWorkEnvironmentProfile: true,
    hasValuesProfile: true,
    profileConfidence: confidence,
    assessmentCompleteness: completeness,
    topStrengthCount: 3,
    developmentAreaCount: scenario.expectedBehavior.riskLevel === 'HIGH' ? 2 : 1,
  });
}

function createAssessmentShadowOutput(snapshot: unknown): Readonly<Record<string, unknown>> {
  const record = isRecord(snapshot) ? snapshot : {};
  return Object.freeze({
    cognitive: {},
    motivation: {},
    lifestyle: {},
    risk: {},
    workEnvironment: {},
    values: {},
    confidence: {
      profileConfidence: record.profileConfidence,
      assessmentCompleteness: record.assessmentCompleteness,
    },
    strengths: {
      topStrengths: Array.from({ length: readNumber(record, 'topStrengthCount') ?? 0 }, (_entry, index) => `strength-${index}`),
    },
    weaknesses: {
      developmentAreas: Array.from({ length: readNumber(record, 'developmentAreaCount') ?? 0 }, (_entry, index) => `area-${index}`),
    },
  });
}

function createCareerFitProductionSnapshot(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const payload = isRecord(scenario.input.payload) ? scenario.input.payload : {};
  const profileId = typeof payload.profileId === 'string' ? payload.profileId : `${scenario.scenarioId}-profile`;
  const careerId = readNestedString(payload.career, 'careerId') ?? scenario.scenarioId;
  const score = 55 + (hashNumber(scenario.scenarioId) % 40);
  return Object.freeze({
    careerId,
    studentProfileId: profileId,
    overallFitScore: score,
    fitLevel: score >= 80 ? 'EXCELLENT' : score >= 65 ? 'GOOD' : 'MODERATE',
    confidenceOverall: 80 + (hashNumber(`${scenario.scenarioId}|confidence`) % 15),
    confidenceLevel: 'HIGH',
    strengthCount: score >= 75 ? 3 : 2,
    concernCount: score < 65 ? 2 : 1,
  });
}

function createCareerFitShadowOutput(snapshot: unknown): Readonly<Record<string, unknown>> {
  const record = isRecord(snapshot) ? snapshot : {};
  return Object.freeze({
    careerId: readString(record, 'careerId'),
    studentProfileId: readString(record, 'studentProfileId'),
    overallFitScore: readNumber(record, 'overallFitScore'),
    fitLevel: readString(record, 'fitLevel'),
    confidence: {
      overall: readNumber(record, 'confidenceOverall'),
      level: readString(record, 'confidenceLevel'),
    },
    strengths: Array.from({ length: readNumber(record, 'strengthCount') ?? 0 }, (_entry, index) => `strength-${index}`),
    concerns: Array.from({ length: readNumber(record, 'concernCount') ?? 0 }, (_entry, index) => `concern-${index}`),
  });
}

function readNestedString(value: unknown, key: string): string | undefined {
  return isRecord(value) ? readString(value, key) : undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hashNumber(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
