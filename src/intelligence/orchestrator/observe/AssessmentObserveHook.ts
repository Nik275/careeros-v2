/**
 * @fileoverview Observe-only hook for the assessment processing boundary.
 *
 * This hook is intentionally fire-and-forget. It must never alter the
 * production assessment result or throw into the production assessment path.
 */

import type { ObserveModeConfig } from './ObserveModeConfig';
import { createObserveModeConfig } from './ObserveModeConfig';
import { ObserveExecutionGuard } from './ObserveExecutionGuard';
import { ObserveHookExecutor } from './ObserveHookExecutor';
import { ObserveModeRouter } from './ObserveModeRouter';
import type { CanaryShadowExecutionService } from '../rollout/CanaryShadowExecutionService';
import type { ObserveTelemetryService } from './ObserveTelemetryService';
import { ProductionFlowObserver } from './ProductionFlowObserver';

export interface AssessmentObserveHookInput {
  questions: readonly unknown[];
  responses: readonly unknown[];
  productionOutput: unknown;
  independentDryRunOperation?: () => unknown;
  studentId?: string;
  requestId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface AssessmentObserveHookOptions {
  config?: ObserveModeConfig;
  router?: Pick<ObserveModeRouter, 'observe'>;
  canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
  telemetryService?: ObserveTelemetryService;
  observer?: ProductionFlowObserver;
  now?: () => string;
  onError?: (error: unknown) => void;
}

export class AssessmentObserveHook {
  private readonly config: ObserveModeConfig;
  private readonly observer: ProductionFlowObserver;
  private readonly executor: ObserveHookExecutor;
  private readonly attachCanaryShadowPayload: boolean;

  constructor(options: AssessmentObserveHookOptions = {}) {
    this.config = options.config ?? createObserveModeConfig();
    const router =
      options.router ??
      new ObserveModeRouter({
        config: this.config,
        now: options.now,
        telemetryService: options.telemetryService,
        canaryShadowExecutionService: options.canaryShadowExecutionService,
      });
    this.attachCanaryShadowPayload = options.canaryShadowExecutionService !== undefined;
    this.observer =
      options.observer ??
      new ProductionFlowObserver({
        now: options.now,
      });
    this.executor = new ObserveHookExecutor({
      config: this.config,
      router,
      telemetryService: options.telemetryService,
      onError: options.onError,
    });
  }

  observeProcessResponses(input: AssessmentObserveHookInput): void {
    if (ObserveExecutionGuard.shouldSkipObserve('AssessmentEngine.processResponses dry-run recursion guard')) {
      return;
    }

    this.executor.run(() => {
      const request = this.observer.createObserveModeRequest(
        {
          flowKind: 'assessment',
          sourceModule: 'src/assessment/assessment-engine.ts',
          operationName: 'processResponses',
          studentId: input.studentId ?? 'unknown-student',
          callId: input.requestId,
          input: normalizeAssessmentInput(input.questions, input.responses),
          output: normalizeAssessmentOutput(input.productionOutput),
          metadata: {
            authority: 'StudentUnderstandingAuthority',
            capability: 'UNDERSTAND',
            hook: 'AssessmentEngine.processResponses',
            ...(input.metadata ?? {}),
          },
        },
        this.config
      );

      if (shouldAttachAssessmentPilotPayload(this.config) || this.attachCanaryShadowPayload) {
        return {
          ...request,
          executionPayload: {
            independentDryRunOperation: input.independentDryRunOperation,
          },
        };
      }

      return request;
    });
  }

  async waitForIdle(): Promise<void> {
    await this.executor.waitForIdle();
  }
}

export function createAssessmentObserveHook(
  options: AssessmentObserveHookOptions = {}
): AssessmentObserveHook {
  return new AssessmentObserveHook(options);
}

function normalizeAssessmentInput(
  questions: readonly unknown[],
  responses: readonly unknown[]
): Readonly<Record<string, unknown>> {
  return {
    questionCount: questions.length,
    responseCount: responses.length,
    questionTypes: uniqueStrings(questions.map((question) => readString(question, 'type'))),
    responseTypes: uniqueStrings(responses.map((response) => readString(response, 'type'))),
    categories: uniqueStrings(questions.map((question) => readString(question, 'category'))),
    dimensions: uniqueStrings(questions.map((question) => readString(question, 'dimension'))),
  };
}

function normalizeAssessmentOutput(output: unknown): Readonly<Record<string, unknown>> {
  const profile = isRecord(output) ? output : {};
  const confidence = isRecord(profile.confidence) ? profile.confidence : {};
  const strengths = isRecord(profile.strengths) ? profile.strengths : {};
  const weaknesses = isRecord(profile.weaknesses) ? profile.weaknesses : {};

  return {
    hasCognitiveProfile: isRecord(profile.cognitive),
    hasMotivationProfile: isRecord(profile.motivation),
    hasLifestyleProfile: isRecord(profile.lifestyle),
    hasRiskProfile: isRecord(profile.risk),
    hasWorkEnvironmentProfile: isRecord(profile.workEnvironment),
    hasValuesProfile: isRecord(profile.values),
    profileConfidence: confidence.profileConfidence,
    assessmentCompleteness: confidence.assessmentCompleteness,
    topStrengthCount: Array.isArray(strengths.topStrengths) ? strengths.topStrengths.length : 0,
    developmentAreaCount: Array.isArray(weaknesses.developmentAreas)
      ? weaknesses.developmentAreas.length
      : 0,
  };
}

function readString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined;
  const entry = value[key];
  return typeof entry === 'string' ? entry : undefined;
}

function uniqueStrings(values: readonly (string | undefined)[]): readonly string[] {
  return Array.from(new Set(values.filter((value): value is string => value !== undefined))).sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function shouldAttachAssessmentPilotPayload(config: ObserveModeConfig): boolean {
  return (
    config.enableAssessmentIndependentDryRun &&
    config.assessmentDryRunMode === 'INDEPENDENT_DRY_RUN' &&
    config.assessmentParityComparisonEnabled
  );
}
