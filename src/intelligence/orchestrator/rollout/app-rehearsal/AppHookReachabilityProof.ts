/**
 * @fileoverview Hook reachability proof for Phase 5.9 app rehearsals.
 */

import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveModeRouter } from '../../observe/ObserveModeRouter';
import type { ObserveModeConfig } from '../../observe/ObserveModeConfig';
import type { ObserveModeRequest, ObserveModeResult } from '../../observe/ObserveModeTypes';
import type { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import type { AppEntrypointLevel, AppRehearsalHookProof } from './AppRehearsalTypes';

export class AppHookReachabilityProofCollector {
  private readonly router: ObserveModeRouter;
  private readonly now: () => string;
  private readonly observedResults: ObserveModeResult[] = [];
  private observeRouterInvocationCount = 0;
  private canaryShadowExecutionCount = 0;
  private dryRunBindingInvocationCount = 0;
  private hookInvocationCount = 0;
  private appLevelPathCount = 0;
  private serviceFallbackPathCount = 0;
  private byHook = new Map<string, number>();
  private byFlow = new Map<string, number>();
  private byEntrypointLevel = new Map<string, number>();

  constructor(options: {
    config?: ObserveModeConfig;
    canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
    now?: () => string;
  } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    const config =
      options.config ??
      createObserveModeConfig({
        enabled: true,
        sampleRate: 1,
        captureInputs: false,
        captureOutputs: true,
        compareOutputs: true,
        captureRawPayloads: false,
        telemetryEnabled: false,
      });
    this.router = new ObserveModeRouter({
      config,
      canaryShadowExecutionService: options.canaryShadowExecutionService,
      now: this.now,
    });
  }

  createRouter(): Pick<ObserveModeRouter, 'observe'> {
    return {
      observe: async (request: ObserveModeRequest): Promise<ObserveModeResult> => {
        this.observeRouterInvocationCount += 1;
        this.hookInvocationCount += 1;
        const hookName = readString(request.productionCall.metadata.hook) ?? request.productionCall.operationName;
        this.byHook.set(hookName, (this.byHook.get(hookName) ?? 0) + 1);
        this.byFlow.set(request.productionCall.flowName, (this.byFlow.get(request.productionCall.flowName) ?? 0) + 1);
        const result = await this.router.observe(request);
        if (result.canaryShadowRecord) this.canaryShadowExecutionCount += 1;
        if (result.canaryShadowRecord?.bindingResult) this.dryRunBindingInvocationCount += 1;
        this.observedResults.push(result);
        return result;
      },
    };
  }

  recordEntrypointLevel(level: AppEntrypointLevel): void {
    this.byEntrypointLevel.set(level, (this.byEntrypointLevel.get(level) ?? 0) + 1);
    if (level === 'app-route' || level === 'test-only-adapter') this.appLevelPathCount += 1;
    if (level === 'service-fallback') this.serviceFallbackPathCount += 1;
  }

  async waitForInvocations(expectedCount: number, timeoutMs = 500): Promise<void> {
    const started = Date.now();
    while (this.observedResults.length < expectedCount && Date.now() - started < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  getObservedResults(): readonly ObserveModeResult[] {
    return this.observedResults;
  }

  createProof(generatedAt: string = this.now()): AppRehearsalHookProof {
    const proof: AppRehearsalHookProof = {
      proofId: `app-hook-reachability-proof-${hashString(`${generatedAt}|${this.hookInvocationCount}`)}`,
      generatedAt,
      assessmentHookReached: (this.byHook.get('AssessmentEngine.processResponses') ?? 0) > 0,
      careerFitHookReached: (this.byHook.get('CareerFitEngine.calculateFit') ?? 0) > 0,
      observeRouterReached: this.observeRouterInvocationCount > 0,
      canaryShadowReached: this.canaryShadowExecutionCount > 0,
      dryRunBindingReached: this.dryRunBindingInvocationCount > 0,
      hookInvocationCount: this.hookInvocationCount,
      observeRouterInvocationCount: this.observeRouterInvocationCount,
      canaryShadowExecutionCount: this.canaryShadowExecutionCount,
      dryRunBindingInvocationCount: this.dryRunBindingInvocationCount,
      appLevelPathCount: this.appLevelPathCount,
      serviceFallbackPathCount: this.serviceFallbackPathCount,
      hookReachabilityRate: percentage(this.observedResults.filter((result) => result.canaryShadowRecord).length, this.observedResults.length),
      byHook: Object.fromEntries(this.byHook.entries()),
      byFlow: Object.fromEntries(this.byFlow.entries()),
      byEntrypointLevel: Object.fromEntries(this.byEntrypointLevel.entries()),
      statuses: this.observedResults.map((result) => result.status),
      observeRequestIds: this.observedResults.map((result) => result.observeRequestId),
    };
    return JSON.parse(JSON.stringify(proof)) as AppRehearsalHookProof;
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
