/**
 * @fileoverview Synthetic app-level scenarios for Phase 5.9 rehearsal.
 */

import { assessmentGoldenScenarios } from '../../parity/assessmentGoldenScenarios';
import { assessmentStressScenarios } from '../../parity/assessmentStressScenarios';
import { careerFitGoldenScenarios } from '../../parity/careerFitGoldenScenarios';
import { careerFitStressScenarios } from '../../parity/careerFitStressScenarios';
import { GoldenParityFuzzer } from '../../parity/GoldenParityFuzzer';
import type { GoldenScenario } from '../../parity/GoldenScenarioTypes';
import {
  getAppEntrypointAlignments,
  getSelectedAppEntrypointCandidates,
} from './AppRehearsalEntrypointAdapter';
import type {
  AppRehearsalRiskLevel,
  AppRehearsalScenario,
} from './AppRehearsalTypes';

const fuzzer = new GoldenParityFuzzer();

export const appRehearsalDataset: readonly AppRehearsalScenario[] = Object.freeze([
  ...wrapScenarioBatch(assessmentGoldenScenarios.slice(0, 12)),
  ...wrapScenarioBatch(assessmentStressScenarios.slice(0, 12)),
  ...wrapScenarioBatch(fuzzer.generateAssessmentScenarios({ seed: 5901, count: 16 })),
  ...wrapScenarioBatch(careerFitGoldenScenarios.slice(0, 12)),
  ...wrapScenarioBatch(careerFitStressScenarios.slice(0, 12)),
  ...wrapScenarioBatch(fuzzer.generateCareerFitScenarios({ seed: 5902, count: 16 })),
]);

export function getAppRehearsalDataset(): readonly AppRehearsalScenario[] {
  return appRehearsalDataset;
}

export function getAppRehearsalScenariosByFlow(
  flow: AppRehearsalScenario['flow']
): readonly AppRehearsalScenario[] {
  return appRehearsalDataset.filter((scenario) => scenario.flow === flow);
}

export function validateAppRehearsalDatasetSafety(
  scenarios: readonly AppRehearsalScenario[] = appRehearsalDataset
): { safe: boolean; reasons: readonly string[] } {
  const reasons: string[] = [];
  for (const scenario of scenarios) {
    const serialized = JSON.stringify(scenario);
    if (!scenario.synthetic) reasons.push(`${scenario.scenarioId}: synthetic flag missing`);
    if (scenario.privacyClassification !== 'SYNTHETIC') {
      reasons.push(`${scenario.scenarioId}: expected synthetic privacy classification`);
    }
    if (/email|phone|address|ssn|real[-_\s]?student|@/i.test(serialized)) {
      reasons.push(`${scenario.scenarioId}: potential real student data marker`);
    }
  }
  return { safe: reasons.length === 0, reasons };
}

function wrapScenarioBatch(scenarios: readonly GoldenScenario[]): readonly AppRehearsalScenario[] {
  return scenarios.map(wrapGoldenScenario);
}

function wrapGoldenScenario(scenario: GoldenScenario): AppRehearsalScenario {
  const flow = scenario.flowType;
  const selectedEntrypoint = getSelectedAppEntrypointCandidates().find(
    (entrypoint) => entrypoint.flow === flow
  );
  const alignment = getAppEntrypointAlignments().find((entry) => entry.flow === flow);
  if (!selectedEntrypoint || !alignment) throw new Error(`No selected app rehearsal alignment for ${flow}.`);

  return Object.freeze({
    scenarioId: `app-rehearsal-${scenario.scenarioId}`,
    flow,
    entrypoint: selectedEntrypoint,
    alignment,
    input: createEntrypointInput(scenario),
    expectedAuthority: flow === 'assessment' ? 'StudentUnderstandingAuthority' : 'OptionGeneratorAuthority',
    expectedCapability: flow === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
    riskLevel: scenario.expectedBehavior.riskLevel as AppRehearsalRiskLevel,
    privacyClassification: 'SYNTHETIC',
    expectedProductionShape:
      flow === 'assessment'
        ? ['cognitive', 'motivation', 'lifestyle', 'risk', 'workEnvironment', 'values', 'strengths', 'weaknesses', 'confidence']
        : ['careerId', 'studentProfileId', 'overallFitScore', 'fitLevel', 'breakdown', 'strengths', 'concerns', 'confidence'],
    expectedHookName: flow === 'assessment' ? 'AssessmentEngine.processResponses' : 'CareerFitEngine.calculateFit',
    synthetic: true,
  });
}

function createEntrypointInput(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const payload = isRecord(scenario.input.payload) ? scenario.input.payload : {};
  if (scenario.flowType === 'assessment') {
    return Object.freeze({
      psychology: createSyntheticAssessmentData(scenario.scenarioId),
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

function createSyntheticAssessmentData(seed: string): Readonly<Record<string, readonly string[]>> {
  const suffix = hashString(seed).slice(0, 2);
  return Object.freeze({
    motivations: Object.freeze([`impact-${suffix}`, `mastery-${suffix}`]),
    strengths: Object.freeze([`analytical-${suffix}`, `creative-${suffix}`]),
    personalityTraits: Object.freeze([`structured-${suffix}`]),
    values: Object.freeze([`purpose-${suffix}`, `growth-${suffix}`]),
    lifestylePreferences: Object.freeze([`hybrid-${suffix}`]),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
