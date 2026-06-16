/**
 * @fileoverview Golden parity baseline runner.
 *
 * Validation-only runner for measured production-vs-authority dry-run parity.
 * It does not route production traffic, persist data, or enable rollout modes.
 */

import { OptionGeneratorAuthorityFacade } from '../../authorities/OptionGeneratorAuthorityFacade';
import { StudentUnderstandingAuthorityFacade } from '../../authorities/StudentUnderstandingAuthorityFacade';
import { ObserveExecutionGuard } from '../observe/ObserveExecutionGuard';
import { assessmentGoldenScenarios } from './assessmentGoldenScenarios';
import { assessmentStressScenarios } from './assessmentStressScenarios';
import { careerFitGoldenScenarios } from './careerFitGoldenScenarios';
import { careerFitStressScenarios } from './careerFitStressScenarios';
import {
  calculateCombinedBaselineMetrics,
  calculateFlowBaselineMetrics,
  type FlowBaselineMetrics,
  type GoldenParityBaselineMetrics,
} from './GoldenParityBaselineMetrics';
import { GoldenParityHarness, type GoldenParityRunner as HarnessRunner } from './GoldenParityHarness';
import { GoldenParityFuzzer } from './GoldenParityFuzzer';
import type { GoldenScenario, GoldenScenarioResult } from './GoldenScenarioTypes';

export type BaselineExecutionStatus = 'SUCCEEDED' | 'FAILED' | 'NOT_RUN' | 'SKIPPED';

export interface GoldenParityBaselineScenarioResult extends GoldenScenarioResult {
  scenarioPurpose: string;
  productionExecutionStatus: BaselineExecutionStatus;
  authorityDryRunExecutionStatus: BaselineExecutionStatus;
  comparisonStatus: GoldenScenarioResult['status'];
  matchedFields: readonly string[];
  driftedFields: readonly string[];
  failedFields: readonly string[];
  notComparableReason?: string;
  selfMirrored: boolean;
  executable: boolean;
  executionTimeMs: number;
}

export interface GoldenParityBaselineRunResult {
  flowType: 'assessment' | 'career-fit';
  generatedAt: string;
  totalScenarios: number;
  results: readonly GoldenParityBaselineScenarioResult[];
  metrics: FlowBaselineMetrics;
}

export interface GoldenParityFullBaselineResult {
  generatedAt: string;
  assessment: GoldenParityBaselineRunResult;
  careerFit: GoldenParityBaselineRunResult;
  metrics: GoldenParityBaselineMetrics;
}

export interface GoldenParityDeterministicFuzzResult {
  generatedAt: string;
  assessment: GoldenParityBaselineRunResult;
  careerFit: GoldenParityBaselineRunResult;
  metrics: GoldenParityBaselineMetrics;
}

export interface GoldenParityFullExpandedSuiteResult {
  generatedAt: string;
  baseline: GoldenParityFullBaselineResult;
  assessmentStress: GoldenParityBaselineRunResult;
  careerFitStress: GoldenParityBaselineRunResult;
  deterministicFuzz: GoldenParityDeterministicFuzzResult;
  metrics: GoldenParityBaselineMetrics;
}

export interface GoldenParityRunnerOptions {
  assessmentScenarios?: readonly GoldenScenario[];
  careerFitScenarios?: readonly GoldenScenario[];
  assessmentStressScenarios?: readonly GoldenScenario[];
  careerFitStressScenarios?: readonly GoldenScenario[];
  fuzzAssessmentScenarios?: readonly GoldenScenario[];
  fuzzCareerFitScenarios?: readonly GoldenScenario[];
  assessmentRunner?: HarnessRunner;
  careerFitRunner?: HarnessRunner;
  harness?: GoldenParityHarness;
  now?: () => string;
}

type RuntimeImport = (specifier: string) => Promise<Record<string, unknown>>;

export class GoldenParityRunner {
  private readonly assessmentScenarios: readonly GoldenScenario[];
  private readonly careerFitScenarios: readonly GoldenScenario[];
  private readonly assessmentStressScenarios: readonly GoldenScenario[];
  private readonly careerFitStressScenarios: readonly GoldenScenario[];
  private readonly fuzzAssessmentScenarios: readonly GoldenScenario[];
  private readonly fuzzCareerFitScenarios: readonly GoldenScenario[];
  private readonly harness: GoldenParityHarness;
  private readonly now: () => string;

  constructor(options: GoldenParityRunnerOptions = {}) {
    const fuzzer = new GoldenParityFuzzer();
    this.assessmentScenarios = options.assessmentScenarios ?? assessmentGoldenScenarios;
    this.careerFitScenarios = options.careerFitScenarios ?? careerFitGoldenScenarios;
    this.assessmentStressScenarios = options.assessmentStressScenarios ?? assessmentStressScenarios;
    this.careerFitStressScenarios = options.careerFitStressScenarios ?? careerFitStressScenarios;
    this.fuzzAssessmentScenarios =
      options.fuzzAssessmentScenarios ??
      fuzzer.generateAssessmentScenarios({ seed: 5401, count: 50 });
    this.fuzzCareerFitScenarios =
      options.fuzzCareerFitScenarios ??
      fuzzer.generateCareerFitScenarios({ seed: 5402, count: 50 });
    this.now = options.now ?? (() => new Date().toISOString());
    this.harness =
      options.harness ??
      new GoldenParityHarness({
        assessmentRunner: options.assessmentRunner ?? createAssessmentBaselineRunner(),
        careerFitRunner: options.careerFitRunner ?? createCareerFitBaselineRunner(),
        now: this.now,
      });
  }

  async runAssessmentBaseline(): Promise<GoldenParityBaselineRunResult> {
    return this.runBaseline('assessment', this.assessmentScenarios);
  }

  async runCareerFitBaseline(): Promise<GoldenParityBaselineRunResult> {
    return this.runBaseline('career-fit', this.careerFitScenarios);
  }

  async runFullBaseline(): Promise<GoldenParityFullBaselineResult> {
    const assessment = await this.runAssessmentBaseline();
    const careerFit = await this.runCareerFitBaseline();
    return {
      generatedAt: this.now(),
      assessment,
      careerFit,
      metrics: calculateCombinedBaselineMetrics(assessment.results, careerFit.results),
    };
  }

  async runAssessmentStressSuite(): Promise<GoldenParityBaselineRunResult> {
    return this.runBaseline('assessment', this.assessmentStressScenarios);
  }

  async runCareerFitStressSuite(): Promise<GoldenParityBaselineRunResult> {
    return this.runBaseline('career-fit', this.careerFitStressScenarios);
  }

  async runDeterministicFuzzSuite(): Promise<GoldenParityDeterministicFuzzResult> {
    const assessment = await this.runBaseline('assessment', this.fuzzAssessmentScenarios);
    const careerFit = await this.runBaseline('career-fit', this.fuzzCareerFitScenarios);
    return {
      generatedAt: this.now(),
      assessment,
      careerFit,
      metrics: calculateCombinedBaselineMetrics(assessment.results, careerFit.results),
    };
  }

  async runFullExpandedSuite(): Promise<GoldenParityFullExpandedSuiteResult> {
    const baseline = await this.runFullBaseline();
    const assessmentStress = await this.runAssessmentStressSuite();
    const careerFitStress = await this.runCareerFitStressSuite();
    const deterministicFuzz = await this.runDeterministicFuzzSuite();
    const assessmentResults = [
      ...baseline.assessment.results,
      ...assessmentStress.results,
      ...deterministicFuzz.assessment.results,
    ];
    const careerFitResults = [
      ...baseline.careerFit.results,
      ...careerFitStress.results,
      ...deterministicFuzz.careerFit.results,
    ];

    return {
      generatedAt: this.now(),
      baseline,
      assessmentStress,
      careerFitStress,
      deterministicFuzz,
      metrics: calculateCombinedBaselineMetrics(assessmentResults, careerFitResults),
    };
  }

  summarizeBaseline(result: GoldenParityFullBaselineResult): Readonly<Record<string, unknown>> {
    return Object.freeze({
      generatedAt: result.generatedAt,
      assessment: result.assessment.metrics,
      careerFit: result.careerFit.metrics,
      combined: result.metrics.combined,
    });
  }

  exportBaselineResult(result: GoldenParityFullBaselineResult): Readonly<Record<string, unknown>> {
    return toJsonSafe(result) as Readonly<Record<string, unknown>>;
  }

  private async runBaseline(
    flowType: 'assessment' | 'career-fit',
    scenarios: readonly GoldenScenario[]
  ): Promise<GoldenParityBaselineRunResult> {
    const results: GoldenParityBaselineScenarioResult[] = [];

    for (const scenario of scenarios) {
      const startedAt = Date.now();
      const scenarioResult =
        flowType === 'assessment'
          ? await this.harness.runAssessmentScenario(scenario)
          : await this.harness.runCareerFitScenario(scenario);
      results.push(this.toBaselineScenarioResult(scenario, scenarioResult, Date.now() - startedAt));
    }

    return {
      flowType,
      generatedAt: this.now(),
      totalScenarios: scenarios.length,
      results,
      metrics: calculateFlowBaselineMetrics(results),
    };
  }

  private toBaselineScenarioResult(
    scenario: GoldenScenario,
    result: GoldenScenarioResult,
    executionTimeMs: number
  ): GoldenParityBaselineScenarioResult {
    const statuses = inferExecutionStatuses(result);
    const comparableFields = scenario.expectedBehavior.comparableFields;
    const driftedFields = result.status === 'DRIFT_DETECTED' ? result.driftDetails : [];
    const failedFields = result.status === 'FAILED' ? result.failureDetails : [];
    const matchedFields =
      result.status === 'MATCHED'
        ? comparableFields
        : comparableFields.filter((field) => !driftedFields.includes(field));

    return {
      ...result,
      scenarioPurpose: scenario.purpose,
      productionExecutionStatus: statuses.productionExecutionStatus,
      authorityDryRunExecutionStatus: statuses.authorityDryRunExecutionStatus,
      comparisonStatus: result.status,
      matchedFields,
      driftedFields,
      failedFields,
      notComparableReason: result.status === 'NOT_COMPARABLE' ? result.driftDetails[0] ?? result.notes[0] : undefined,
      selfMirrored: result.status === 'SELF_MIRRORED',
      executable: result.status !== 'SKIPPED',
      executionTimeMs,
    };
  }
}

function createAssessmentBaselineRunner(): HarnessRunner {
  return {
    production: async (scenario) => runAssessmentEngine(scenario),
    dryRun: async (scenario) =>
      new StudentUnderstandingAuthorityFacade().processAssessment(
        () => ObserveExecutionGuard.runWithoutObserveAsync(() => runAssessmentEngine(scenario)),
        {
          modulePath: 'src/assessment/assessment-engine.ts',
          auditNotes: ['Phase 5.3 measured assessment golden parity baseline.'],
        }
      ),
  };
}

function createCareerFitBaselineRunner(): HarnessRunner {
  return {
    production: async (scenario) => runCareerFitEngine(scenario),
    dryRun: async (scenario) =>
      new OptionGeneratorAuthorityFacade().generate(
        'calculateCareerFitGoldenParityBaseline',
        () => ObserveExecutionGuard.runWithoutObserveAsync(() => runCareerFitEngine(scenario)),
        {
          modulePath: 'src/career-fit/career-fit-engine.ts',
          auditNotes: ['Phase 5.3 measured career-fit golden parity baseline.'],
        }
      ),
  };
}

async function runAssessmentEngine(scenario: GoldenScenario): Promise<unknown> {
  const payload = scenario.input.payload as {
    questions?: unknown[];
    responses?: unknown[];
  };
  if (!Array.isArray(payload.questions) || !Array.isArray(payload.responses)) {
    throw new Error('Assessment scenario payload must contain questions and responses arrays.');
  }

  const module = await importRuntimeModule('../../../assessment/assessment-engine.ts');
  const AssessmentEngine = module.AssessmentEngine as new () => {
    processResponses: (questions: unknown[], responses: unknown[]) => unknown;
  };
  return new AssessmentEngine().processResponses(payload.questions, payload.responses);
}

async function runCareerFitEngine(scenario: GoldenScenario): Promise<unknown> {
  const payload = scenario.input.payload as {
    profile?: unknown;
    career?: unknown;
    profileId?: unknown;
  };
  if (!payload.profile || !payload.career || typeof payload.profileId !== 'string') {
    throw new Error('Career-fit scenario payload must contain profile, career, and profileId.');
  }

  const module = await importRuntimeModule('../../../career-fit/career-fit-engine.ts');
  const CareerFitEngine = module.CareerFitEngine as new () => {
    calculateFit: (profile: unknown, career: unknown, profileId: string) => unknown;
  };
  return new CareerFitEngine().calculateFit(payload.profile, payload.career, payload.profileId);
}

async function importRuntimeModule(specifier: string): Promise<Record<string, unknown>> {
  const runtimeImport: RuntimeImport = (path) => import(path);
  return runtimeImport(new URL(specifier, import.meta.url).href);
}

function inferExecutionStatuses(result: GoldenScenarioResult): {
  productionExecutionStatus: BaselineExecutionStatus;
  authorityDryRunExecutionStatus: BaselineExecutionStatus;
} {
  if (result.status === 'SKIPPED') {
    return {
      productionExecutionStatus: 'SKIPPED',
      authorityDryRunExecutionStatus: 'SKIPPED',
    };
  }

  if (result.status === 'FAILED') {
    const productionFailed = result.failureDetails.some((detail) => /production/i.test(detail));
    return {
      productionExecutionStatus: productionFailed ? 'FAILED' : 'SUCCEEDED',
      authorityDryRunExecutionStatus: productionFailed ? 'NOT_RUN' : 'FAILED',
    };
  }

  return {
    productionExecutionStatus: 'SUCCEEDED',
    authorityDryRunExecutionStatus: 'SUCCEEDED',
  };
}

function toJsonSafe(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, entry) => {
      if (entry instanceof Date) {
        return entry.toISOString();
      }
      if (typeof entry === 'function') {
        return '[FUNCTION]';
      }
      return entry;
    })
  );
}
