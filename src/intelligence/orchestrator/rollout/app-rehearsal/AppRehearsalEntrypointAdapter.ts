/**
 * @fileoverview Phase 5.9 test-only app entrypoint adapter.
 *
 * This file is not imported by production app routes. It simulates realistic
 * app/service entrypoint invocation for synthetic tests, then calls the
 * validated service boundary that already owns observe hooks.
 */

import type {
  AppEntrypointAlignment,
  AppEntrypointCandidate,
  AppRehearsalEntrypointExecutionInput,
  AppRehearsalEntrypointExecutionResult,
  AppRehearsalEntrypointExecutor,
} from './AppRehearsalTypes';

export const ASSESSMENT_APP_ROUTE_ENTRYPOINT_ID = 'assessment-page.client-flow';
export const ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID = 'assessment-page.test-only-rehearsal-adapter';
export const ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID = 'assessment-engine.processResponses.service-fallback';
export const CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID = 'career-fit.test-only-rehearsal-adapter';
export const CAREER_FIT_SERVICE_FALLBACK_ENTRYPOINT_ID = 'career-fit-engine.calculateFit.service-fallback';

const ASSESSMENT_ENGINE_MODULE = '../../../../assessment/assessment-engine';
const CAREER_FIT_ENGINE_MODULE = '../../../../career-fit/career-fit-engine';

export const APP_ENTRYPOINT_CANDIDATES: readonly AppEntrypointCandidate[] = Object.freeze([
  candidate({
    entrypointId: 'root-page.marketing',
    filePath: 'src/app/page.tsx',
    functionName: 'Home',
    flow: 'marketing',
    flowType: 'career recommendation display',
    level: 'app-route',
    currentBehavior: 'Landing page renders product narrative and calls to action; it does not process assessment or career-fit requests.',
    inputShape: ['none'],
    outputShape: ['React page'],
    sideEffects: ['renders UI only'],
    selected: false,
    safeForStagingShadowAlignment: false,
    selectionReason: 'Not an intelligence execution entrypoint.',
  }),
  candidate({
    entrypointId: ASSESSMENT_APP_ROUTE_ENTRYPOINT_ID,
    filePath: 'src/app/assessment/page.tsx',
    functionName: 'AssessmentPage',
    flow: 'assessment',
    flowType: 'assessment intake and client screen orchestration',
    level: 'app-route',
    currentBehavior: 'Client component stores AssessmentData in useState and transitions through welcome, psychology, analysis, and results screens.',
    inputShape: [
      'psychology.motivations:string[]',
      'psychology.strengths:string[]',
      'psychology.personalityTraits:string[]',
      'psychology.values:string[]',
      'psychology.lifestylePreferences:string[]',
    ],
    outputShape: ['React screen state', 'ResultsDashboard props'],
    sideEffects: ['client state updates', 'screen transitions'],
    riskLevel: 'MEDIUM',
    selected: false,
    safeForStagingShadowAlignment: false,
    selectionReason: 'Actual client route does not call AssessmentEngine.processResponses and cannot prove hook reachability without UI changes.',
  }),
  candidate({
    entrypointId: 'psychology-questions.component',
    filePath: 'src/components/assessment/PsychologyQuestions.tsx',
    functionName: 'PsychologyQuestions',
    flow: 'assessment',
    flowType: 'assessment intake',
    level: 'app-component',
    currentBehavior: 'Renders five local psychology questions and passes selected option ids upward through callbacks.',
    inputShape: ['data:AssessmentData.psychology', 'onUpdate callback', 'onComplete callback'],
    outputShape: ['selected option ids via callback'],
    sideEffects: ['client state updates through parent callback'],
    selected: false,
    safeForStagingShadowAlignment: false,
    selectionReason: 'Component collects answers but does not call the validated assessment service boundary.',
  }),
  candidate({
    entrypointId: 'analysis-screen.component',
    filePath: 'src/components/assessment/AnalysisScreen.tsx',
    functionName: 'AnalysisScreen',
    flow: 'assessment',
    flowType: 'assessment result generation animation',
    level: 'app-component',
    currentBehavior: 'Runs timed animation stages and then calls onComplete.',
    inputShape: ['onComplete callback'],
    outputShape: ['completion callback after animation'],
    sideEffects: ['setTimeout-driven client state updates'],
    selected: false,
    safeForStagingShadowAlignment: false,
    selectionReason: 'Presentation-only analysis stage; no validated engine call.',
  }),
  candidate({
    entrypointId: 'results-dashboard.component',
    filePath: 'src/components/assessment/ResultsDashboard.tsx',
    functionName: 'ResultsDashboard',
    flow: 'career-fit',
    flowType: 'assessment result and career recommendation display',
    level: 'app-component',
    currentBehavior: 'Renders static mockResults for archetype, top careers, and insights.',
    inputShape: ['data:AssessmentData', 'onRestart callback'],
    outputShape: ['React dashboard with mock career matches'],
    sideEffects: ['local tab and hover state'],
    selected: false,
    safeForStagingShadowAlignment: false,
    selectionReason: 'Career-fit UI uses mock results and does not call CareerFitEngine.calculateFit.',
  }),
  candidate({
    entrypointId: ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID,
    filePath: 'src/assessment/assessment-engine.ts',
    functionName: 'createAssessmentEngine().processResponses',
    flow: 'assessment',
    flowType: 'assessment processing service boundary',
    level: 'service-fallback',
    currentBehavior: 'Processes AssessmentQuestion[] and AssessmentResponse[] into StudentLifeProfile and invokes the existing assessment observe hook.',
    callsAssessmentProcessResponses: true,
    reachesObserveHook: true,
    inputShape: ['questions:AssessmentQuestion[]', 'responses:AssessmentResponse[]'],
    outputShape: ['StudentLifeProfile'],
    sideEffects: ['observe hook when configured'],
    selected: false,
    safeForStagingShadowAlignment: true,
    selectionReason: 'Documented service-level fallback from Phase 5.8.',
  }),
  candidate({
    entrypointId: CAREER_FIT_SERVICE_FALLBACK_ENTRYPOINT_ID,
    filePath: 'src/career-fit/career-fit-engine.ts',
    functionName: 'createCareerFitEngine().calculateFit',
    flow: 'career-fit',
    flowType: 'career-fit processing service boundary',
    level: 'service-fallback',
    currentBehavior: 'Processes StudentLifeProfile, CareerIntelligence, and profileId into CareerFitResult and invokes the existing career-fit observe hook.',
    callsCareerFitCalculateFit: true,
    reachesObserveHook: true,
    inputShape: ['profile:StudentLifeProfile', 'career:CareerIntelligence', 'profileId:string'],
    outputShape: ['CareerFitResult'],
    sideEffects: ['in-memory fit cache', 'observe hook when configured'],
    selected: false,
    safeForStagingShadowAlignment: true,
    selectionReason: 'Documented service-level fallback from Phase 5.8.',
  }),
  candidate({
    entrypointId: ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
    filePath: 'src/intelligence/orchestrator/rollout/app-rehearsal/AppRehearsalEntrypointAdapter.ts',
    functionName: 'executeAssessmentAppRehearsalAdapter',
    flow: 'assessment',
    flowType: 'test-only app-level assessment alignment',
    level: 'test-only-adapter',
    currentBehavior: 'Simulates AssessmentPage-shaped synthetic input and calls the validated assessment service boundary.',
    callsAssessmentProcessResponses: true,
    reachesObserveHook: true,
    inputShape: ['AssessmentData.psychology', 'questions:AssessmentQuestion[]', 'responses:AssessmentResponse[]'],
    outputShape: ['StudentLifeProfile'],
    sideEffects: ['test-only observe hook when configured'],
    selected: true,
    safeForStagingShadowAlignment: true,
    selectionReason: 'Selected because it proves hook reachability without modifying app routes or changing UI output.',
  }),
  candidate({
    entrypointId: CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
    filePath: 'src/intelligence/orchestrator/rollout/app-rehearsal/AppRehearsalEntrypointAdapter.ts',
    functionName: 'executeCareerFitAppRehearsalAdapter',
    flow: 'career-fit',
    flowType: 'test-only app-level career-fit alignment',
    level: 'test-only-adapter',
    currentBehavior: 'Simulates a future app-level career-fit intent and calls the validated career-fit service boundary.',
    callsCareerFitCalculateFit: true,
    reachesObserveHook: true,
    inputShape: ['profile:StudentLifeProfile', 'career:CareerIntelligence', 'profileId:string'],
    outputShape: ['CareerFitResult'],
    sideEffects: ['test-only observe hook when configured'],
    selected: true,
    safeForStagingShadowAlignment: true,
    selectionReason: 'Selected because no current app route invokes CareerFitEngine.calculateFit.',
  }),
]);

export const APP_ENTRYPOINT_ALIGNMENTS: readonly AppEntrypointAlignment[] = Object.freeze([
  alignment('assessment', ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID, [
    'src/app/assessment/page.tsx is client-only and does not call AssessmentEngine.processResponses.',
    'src/assessment/assessment-engine.ts owns the existing AssessmentEngine.processResponses observe hook.',
    'The test-only adapter avoids any production UI output change.',
  ]),
  alignment('career-fit', CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID, [
    'No app-level career-fit route calls CareerFitEngine.calculateFit.',
    'src/components/assessment/ResultsDashboard.tsx renders static mock career matches.',
    'The test-only adapter avoids any production UI output change.',
  ]),
]);

export function getAppEntrypointCandidates(): readonly AppEntrypointCandidate[] {
  return APP_ENTRYPOINT_CANDIDATES;
}

export function getSelectedAppEntrypointCandidates(): readonly AppEntrypointCandidate[] {
  return APP_ENTRYPOINT_CANDIDATES.filter((entrypoint) => entrypoint.selected);
}

export function getAppEntrypointAlignments(): readonly AppEntrypointAlignment[] {
  return APP_ENTRYPOINT_ALIGNMENTS;
}

export function getDefaultAppRehearsalExecutors(): Readonly<Record<string, AppRehearsalEntrypointExecutor>> {
  return Object.freeze({
    [ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID]: executeAssessmentAppRehearsalAdapter,
    [CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID]: executeCareerFitAppRehearsalAdapter,
    [ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID]: executeAssessmentServiceFallback,
    [CAREER_FIT_SERVICE_FALLBACK_ENTRYPOINT_ID]: executeCareerFitServiceFallback,
  });
}

async function executeAssessmentAppRehearsalAdapter(
  input: AppRehearsalEntrypointExecutionInput
): Promise<AppRehearsalEntrypointExecutionResult> {
  const payload = readAssessmentInput(input.scenario.input);
  const module = await import(ASSESSMENT_ENGINE_MODULE);
  const createAssessmentEngine = module.createAssessmentEngine as (
    config?: unknown,
    observeOptions?: unknown
  ) => { processResponses: (questions: readonly unknown[], responses: readonly unknown[]) => unknown };
  const engine = createAssessmentEngine(undefined, input.assessmentObserveOptions);
  return {
    productionOutput: engine.processResponses(payload.questions, payload.responses),
    entrypointId: ASSESSMENT_APP_ADAPTER_ENTRYPOINT_ID,
    entrypointLevel: 'test-only-adapter',
    notes: ['Executed test-only assessment app adapter through the validated service boundary.'],
  };
}

async function executeCareerFitAppRehearsalAdapter(
  input: AppRehearsalEntrypointExecutionInput
): Promise<AppRehearsalEntrypointExecutionResult> {
  const payload = readCareerFitInput(input.scenario.input, input.scenario.scenarioId);
  const module = await import(CAREER_FIT_ENGINE_MODULE);
  const createCareerFitEngine = module.createCareerFitEngine as (
    config?: unknown,
    observeOptions?: unknown
  ) => { calculateFit: (profile: unknown, career: unknown, profileId: string) => unknown };
  const engine = createCareerFitEngine(undefined, input.careerFitObserveOptions);
  return {
    productionOutput: engine.calculateFit(payload.profile, payload.career, payload.profileId),
    entrypointId: CAREER_FIT_APP_ADAPTER_ENTRYPOINT_ID,
    entrypointLevel: 'test-only-adapter',
    notes: ['Executed test-only career-fit app adapter through the validated service boundary.'],
  };
}

async function executeAssessmentServiceFallback(
  input: AppRehearsalEntrypointExecutionInput
): Promise<AppRehearsalEntrypointExecutionResult> {
  const result = await executeAssessmentAppRehearsalAdapter(input);
  return { ...result, entrypointId: ASSESSMENT_SERVICE_FALLBACK_ENTRYPOINT_ID, entrypointLevel: 'service-fallback' };
}

async function executeCareerFitServiceFallback(
  input: AppRehearsalEntrypointExecutionInput
): Promise<AppRehearsalEntrypointExecutionResult> {
  const result = await executeCareerFitAppRehearsalAdapter(input);
  return { ...result, entrypointId: CAREER_FIT_SERVICE_FALLBACK_ENTRYPOINT_ID, entrypointLevel: 'service-fallback' };
}

function candidate(input: Partial<AppEntrypointCandidate> & Pick<AppEntrypointCandidate, 'entrypointId' | 'filePath' | 'functionName' | 'flow' | 'flowType' | 'level' | 'currentBehavior' | 'inputShape' | 'outputShape' | 'sideEffects' | 'selected' | 'safeForStagingShadowAlignment' | 'selectionReason'>): AppEntrypointCandidate {
  return Object.freeze({
    callsAssessmentProcessResponses: false,
    callsCareerFitCalculateFit: false,
    reachesObserveHook: false,
    riskLevel: 'LOW',
    ...input,
  } as AppEntrypointCandidate);
}

function alignment(flow: 'assessment' | 'career-fit', entrypointId: string, evidence: readonly string[]): AppEntrypointAlignment {
  return Object.freeze({
    alignmentId: `phase-5-9-${flow}-test-only-adapter`,
    decision: 'IMPLEMENT_TEST_ONLY_REHEARSAL_ADAPTER',
    flow,
    selectedEntrypointId: entrypointId,
    level: 'test-only-adapter',
    actualAppRouteCovered: false,
    testOnlyAdapter: true,
    serviceFallback: false,
    usesValidatedServiceBoundary: true,
    productionOutputAffected: false,
    liveRoutingEnabled: false,
    evidence: Object.freeze([...evidence]),
  });
}

function readAssessmentInput(value: unknown): { questions: readonly unknown[]; responses: readonly unknown[] } {
  const record = isRecord(value) ? value : {};
  return {
    questions: Array.isArray(record.questions) ? record.questions : [],
    responses: Array.isArray(record.responses) ? record.responses : [],
  };
}

function readCareerFitInput(value: unknown, scenarioId: string): { profile: unknown; career: unknown; profileId: string } {
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
