/**
 * @fileoverview Observe-only hook for career-fit calculation.
 */

import type { ObserveModeConfig } from './ObserveModeConfig';
import { createObserveModeConfig } from './ObserveModeConfig';
import { ObserveHookExecutor } from './ObserveHookExecutor';
import { ObserveExecutionGuard } from './ObserveExecutionGuard';
import { ObserveModeRouter } from './ObserveModeRouter';
import type { CanaryShadowExecutionService } from '../rollout/CanaryShadowExecutionService';
import type { ObserveTelemetryService } from './ObserveTelemetryService';
import { ProductionFlowObserver } from './ProductionFlowObserver';

export interface CareerFitObserveHookInput {
  profile: unknown;
  career: unknown;
  profileId: string;
  productionOutput: unknown;
  independentDryRunOperation?: () => unknown;
  requestId?: string;
  studentId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface CareerFitObserveHookOptions {
  config?: ObserveModeConfig;
  router?: Pick<ObserveModeRouter, 'observe'>;
  canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
  telemetryService?: ObserveTelemetryService;
  observer?: ProductionFlowObserver;
  now?: () => string;
  onError?: (error: unknown) => void;
}

export class CareerFitObserveHook {
  private readonly config: ObserveModeConfig;
  private readonly observer: ProductionFlowObserver;
  private readonly executor: ObserveHookExecutor;
  private readonly attachCanaryShadowPayload: boolean;

  constructor(options: CareerFitObserveHookOptions = {}) {
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

  observeCalculateFit(input: CareerFitObserveHookInput): void {
    if (ObserveExecutionGuard.shouldSkipObserve('CareerFitEngine.calculateFit dry-run recursion guard')) {
      return;
    }

    this.executor.run(() => {
      const request = this.observer.createObserveModeRequest(
        {
          flowKind: 'career-fit',
          sourceModule: 'src/career-fit/career-fit-engine.ts',
          operationName: 'calculateFit',
          studentId: input.studentId ?? input.profileId,
          callId: input.requestId,
          input: normalizeCareerFitInput(input.profile, input.career, input.profileId),
          output: normalizeCareerFitOutput(input.productionOutput),
          metadata: {
            authority: 'OptionGeneratorAuthority',
            capability: 'GENERATE',
            hook: 'CareerFitEngine.calculateFit',
            ...(input.metadata ?? {}),
          },
        },
        this.config
      );

      if (shouldAttachCareerFitPilotPayload(this.config) || this.attachCanaryShadowPayload) {
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

export function createCareerFitObserveHook(
  options: CareerFitObserveHookOptions = {}
): CareerFitObserveHook {
  return new CareerFitObserveHook(options);
}

function normalizeCareerFitInput(
  profile: unknown,
  career: unknown,
  profileId: string
): Readonly<Record<string, unknown>> {
  const profileRecord = isRecord(profile) ? profile : {};
  const careerRecord = isRecord(career) ? career : {};

  return {
    profileId,
    careerId: readString(careerRecord, 'careerId') ?? 'unknown-career',
    hasProfileConfidence: isRecord(profileRecord.confidence),
    profileSections: countPresentSections(profileRecord, [
      'cognitive',
      'motivation',
      'lifestyle',
      'risk',
      'workEnvironment',
      'values',
    ]),
  };
}

function normalizeCareerFitOutput(output: unknown): Readonly<Record<string, unknown>> {
  const fit = isRecord(output) ? output : {};
  const confidence = isRecord(fit.confidence) ? fit.confidence : {};
  const strengths = Array.isArray(fit.strengths) ? fit.strengths : [];
  const concerns = Array.isArray(fit.concerns) ? fit.concerns : [];

  return {
    careerId: readString(fit, 'careerId') ?? 'unknown-career',
    studentProfileId: readString(fit, 'studentProfileId') ?? 'unknown-profile',
    overallFitScore: readNumber(fit, 'overallFitScore'),
    fitLevel: readString(fit, 'fitLevel') ?? 'UNKNOWN',
    confidenceOverall: readNumber(confidence, 'overall'),
    confidenceLevel: readString(confidence, 'level') ?? 'UNKNOWN',
    strengthCount: strengths.length,
    concernCount: concerns.length,
  };
}

function countPresentSections(
  record: Record<string, unknown>,
  sections: readonly string[]
): number {
  return sections.filter((section) => isRecord(record[section])).length;
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

function shouldAttachCareerFitPilotPayload(config: ObserveModeConfig): boolean {
  return (
    config.enableIndependentPilotBinding &&
    config.allowPilotDryRunExecution &&
    config.pilotBindingName === 'career-fit.calculateFit'
  );
}
