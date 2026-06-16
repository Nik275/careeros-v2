/**
 * @fileoverview Discovered entrypoints and safe service-level rehearsal adapters.
 */

import type {
  StagingRehearsalEntrypoint,
  StagingRehearsalEntrypointExecutionInput,
  StagingRehearsalEntrypointExecutionResult,
  StagingRehearsalEntrypointExecutor,
} from './StagingRehearsalTypes';

export const ASSESSMENT_SERVICE_ENTRYPOINT_ID = 'assessment-engine.processResponses.service-fallback';
export const CAREER_FIT_SERVICE_ENTRYPOINT_ID = 'career-fit-engine.calculateFit.service-fallback';

const ASSESSMENT_ENGINE_MODULE = '../../../../assessment/assessment-engine';
const CAREER_FIT_ENGINE_MODULE = '../../../../career-fit/career-fit-engine';

export const STAGING_REHEARSAL_ENTRYPOINTS: readonly StagingRehearsalEntrypoint[] = Object.freeze([
  Object.freeze({
    entrypointId: 'assessment-page.client-flow',
    filePath: 'src/app/assessment/page.tsx',
    exportName: 'AssessmentPage',
    flow: 'assessment',
    level: 'app',
    reachesObserveHook: false,
    safeForRehearsal: false,
    selected: false,
    riskLevel: 'MEDIUM',
    selectionReason:
      'Client page transitions through UI state and mock results; it does not call AssessmentEngine.processResponses.',
  }),
  Object.freeze({
    entrypointId: ASSESSMENT_SERVICE_ENTRYPOINT_ID,
    filePath: 'src/assessment/assessment-engine.ts',
    exportName: 'createAssessmentEngine().processResponses',
    flow: 'assessment',
    level: 'service-fallback',
    reachesObserveHook: true,
    safeForRehearsal: true,
    selected: true,
    riskLevel: 'LOW',
    selectionReason:
      'Nearest safe callable boundary for realistic assessment input; the engine method owns the existing observe hook.',
  }),
  Object.freeze({
    entrypointId: 'career-fit-index.module-export',
    filePath: 'src/career-fit/index.ts',
    exportName: 'createCareerFitEngine',
    flow: 'career-fit',
    level: 'service',
    reachesObserveHook: true,
    safeForRehearsal: true,
    selected: false,
    riskLevel: 'LOW',
    selectionReason:
      'Module re-export is safe but less direct than the engine factory file selected for rehearsal.',
  }),
  Object.freeze({
    entrypointId: CAREER_FIT_SERVICE_ENTRYPOINT_ID,
    filePath: 'src/career-fit/career-fit-engine.ts',
    exportName: 'createCareerFitEngine().calculateFit',
    flow: 'career-fit',
    level: 'service-fallback',
    reachesObserveHook: true,
    safeForRehearsal: true,
    selected: true,
    riskLevel: 'LOW',
    selectionReason:
      'Nearest safe callable boundary for realistic career-fit input; the engine method owns the existing observe hook.',
  }),
]);

export function getStagingRehearsalEntrypoints(): readonly StagingRehearsalEntrypoint[] {
  return STAGING_REHEARSAL_ENTRYPOINTS;
}

export function getSelectedStagingRehearsalEntrypoints(): readonly StagingRehearsalEntrypoint[] {
  return STAGING_REHEARSAL_ENTRYPOINTS.filter((entrypoint) => entrypoint.selected);
}

export function getDefaultStagingRehearsalExecutors(): Readonly<
  Record<string, StagingRehearsalEntrypointExecutor>
> {
  return Object.freeze({
    [ASSESSMENT_SERVICE_ENTRYPOINT_ID]: executeAssessmentServiceEntrypoint,
    [CAREER_FIT_SERVICE_ENTRYPOINT_ID]: executeCareerFitServiceEntrypoint,
  });
}

async function executeAssessmentServiceEntrypoint(
  input: StagingRehearsalEntrypointExecutionInput
): Promise<StagingRehearsalEntrypointExecutionResult> {
  const payload = readAssessmentInput(input.scenario.input);
  const module = await import(ASSESSMENT_ENGINE_MODULE);
  const createAssessmentEngine = module.createAssessmentEngine as (
    config?: unknown,
    observeOptions?: unknown
  ) => { processResponses: (questions: readonly unknown[], responses: readonly unknown[]) => unknown };
  const engine = createAssessmentEngine(undefined, input.assessmentObserveOptions);
  const productionOutput = engine.processResponses(payload.questions, payload.responses);
  return {
    productionOutput,
    entrypointId: ASSESSMENT_SERVICE_ENTRYPOINT_ID,
    entrypointLevel: 'service-fallback',
    notes: ['Executed createAssessmentEngine().processResponses through service-level fallback.'],
  };
}

async function executeCareerFitServiceEntrypoint(
  input: StagingRehearsalEntrypointExecutionInput
): Promise<StagingRehearsalEntrypointExecutionResult> {
  const payload = readCareerFitInput(input.scenario.input, input.scenario.scenarioId);
  const module = await import(CAREER_FIT_ENGINE_MODULE);
  const createCareerFitEngine = module.createCareerFitEngine as (
    config?: unknown,
    observeOptions?: unknown
  ) => { calculateFit: (profile: unknown, career: unknown, profileId: string) => unknown };
  const engine = createCareerFitEngine(undefined, input.careerFitObserveOptions);
  const productionOutput = engine.calculateFit(payload.profile, payload.career, payload.profileId);
  return {
    productionOutput,
    entrypointId: CAREER_FIT_SERVICE_ENTRYPOINT_ID,
    entrypointLevel: 'service-fallback',
    notes: ['Executed createCareerFitEngine().calculateFit through service-level fallback.'],
  };
}

function readAssessmentInput(value: unknown): {
  questions: readonly unknown[];
  responses: readonly unknown[];
} {
  const record = isRecord(value) ? value : {};
  return {
    questions: Array.isArray(record.questions) ? record.questions : [],
    responses: Array.isArray(record.responses) ? record.responses : [],
  };
}

function readCareerFitInput(
  value: unknown,
  scenarioId: string
): {
  profile: unknown;
  career: unknown;
  profileId: string;
} {
  const record = isRecord(value) ? value : {};
  return {
    profile: record.profile,
    career: record.career,
    profileId: typeof record.profileId === 'string' ? record.profileId : `${scenarioId}-profile`,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
