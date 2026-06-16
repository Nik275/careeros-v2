/**
 * @fileoverview Synthetic app/service-level scenarios for Phase 5.8 rehearsal.
 */

import { assessmentGoldenScenarios } from '../../parity/assessmentGoldenScenarios';
import { assessmentStressScenarios } from '../../parity/assessmentStressScenarios';
import { careerFitGoldenScenarios } from '../../parity/careerFitGoldenScenarios';
import { careerFitStressScenarios } from '../../parity/careerFitStressScenarios';
import { GoldenParityFuzzer } from '../../parity/GoldenParityFuzzer';
import type { GoldenScenario } from '../../parity/GoldenScenarioTypes';
import {
  ASSESSMENT_SERVICE_ENTRYPOINT_ID,
  CAREER_FIT_SERVICE_ENTRYPOINT_ID,
  getSelectedStagingRehearsalEntrypoints,
} from './StagingRehearsalEntrypoints';
import type {
  StagingRehearsalRiskLevel,
  StagingRehearsalScenario,
} from './StagingRehearsalTypes';

const fuzzer = new GoldenParityFuzzer();

export const stagingRehearsalDataset: readonly StagingRehearsalScenario[] = Object.freeze([
  ...wrapScenarioBatch(assessmentGoldenScenarios.slice(0, 10)),
  ...wrapScenarioBatch(assessmentStressScenarios.slice(0, 10)),
  ...wrapScenarioBatch(fuzzer.generateAssessmentScenarios({ seed: 5801, count: 10 })),
  ...wrapScenarioBatch(careerFitGoldenScenarios.slice(0, 10)),
  ...wrapScenarioBatch(careerFitStressScenarios.slice(0, 10)),
  ...wrapScenarioBatch(fuzzer.generateCareerFitScenarios({ seed: 5802, count: 10 })),
]);

export function getStagingRehearsalDataset(): readonly StagingRehearsalScenario[] {
  return stagingRehearsalDataset;
}

export function getStagingRehearsalScenariosByFlow(
  flow: StagingRehearsalScenario['flow']
): readonly StagingRehearsalScenario[] {
  return stagingRehearsalDataset.filter((scenario) => scenario.flow === flow);
}

export function validateStagingRehearsalDatasetSafety(
  scenarios: readonly StagingRehearsalScenario[] = stagingRehearsalDataset
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
  return {
    safe: reasons.length === 0,
    reasons,
  };
}

function wrapScenarioBatch(scenarios: readonly GoldenScenario[]): readonly StagingRehearsalScenario[] {
  return scenarios.map(wrapGoldenScenario);
}

function wrapGoldenScenario(scenario: GoldenScenario): StagingRehearsalScenario {
  const flow = scenario.flowType;
  const selectedEntrypoint = getSelectedStagingRehearsalEntrypoints().find(
    (entrypoint) => entrypoint.flow === flow
  );
  if (!selectedEntrypoint) {
    throw new Error(`No selected staging rehearsal entrypoint for ${flow}.`);
  }

  return Object.freeze({
    scenarioId: `rehearsal-${scenario.scenarioId}`,
    flow,
    entrypoint: selectedEntrypoint,
    input: createEntrypointInput(scenario),
    expectedAuthority: flow === 'assessment' ? 'StudentUnderstandingAuthority' : 'OptionGeneratorAuthority',
    expectedCapability: flow === 'assessment' ? 'UNDERSTAND' : 'GENERATE',
    riskLevel: scenario.expectedBehavior.riskLevel as StagingRehearsalRiskLevel,
    privacyClassification: 'SYNTHETIC',
    expectedProductionShape:
      flow === 'assessment'
        ? [
            'cognitive',
            'motivation',
            'lifestyle',
            'risk',
            'workEnvironment',
            'values',
            'strengths',
            'weaknesses',
            'confidence',
          ]
        : [
            'careerId',
            'studentProfileId',
            'overallFitScore',
            'fitLevel',
            'breakdown',
            'strengths',
            'concerns',
            'confidence',
          ],
    synthetic: true,
  });
}

function createEntrypointInput(scenario: GoldenScenario): Readonly<Record<string, unknown>> {
  const payload = isRecord(scenario.input.payload) ? scenario.input.payload : {};
  if (scenario.flowType === 'assessment') {
    return Object.freeze({
      entrypointId: ASSESSMENT_SERVICE_ENTRYPOINT_ID,
      questions: Array.isArray(payload.questions) ? payload.questions : [],
      responses: Array.isArray(payload.responses) ? payload.responses : [],
    });
  }

  return Object.freeze({
    entrypointId: CAREER_FIT_SERVICE_ENTRYPOINT_ID,
    profileId: typeof payload.profileId === 'string' ? payload.profileId : `${scenario.scenarioId}-profile`,
    profile: payload.profile,
    career: payload.career,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
