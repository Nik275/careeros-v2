/**
 * @fileoverview Hook reachability proof for Phase 5.8 staging rehearsals.
 */

import { createObserveModeConfig } from '../../observe/ObserveModeConfig';
import { ObserveModeRouter } from '../../observe/ObserveModeRouter';
import type { ObserveModeConfig } from '../../observe/ObserveModeConfig';
import type { ObserveModeRequest, ObserveModeResult } from '../../observe/ObserveModeTypes';
import type { CanaryShadowExecutionService } from '../CanaryShadowExecutionService';
import type { HookReachabilityProof } from './StagingRehearsalTypes';

export interface HookReachabilityProbeOptions {
  config?: ObserveModeConfig;
  canaryShadowExecutionService?: Pick<CanaryShadowExecutionService, 'execute'>;
  now?: () => string;
}

export class HookReachabilityProbe {
  private readonly router: ObserveModeRouter;
  private readonly now: () => string;
  private readonly observedResults: ObserveModeResult[] = [];
  private observeRouterInvocationCount = 0;
  private canaryShadowExecutionCount = 0;
  private hookInvocationCount = 0;
  private byHook = new Map<string, number>();
  private byFlow = new Map<string, number>();

  constructor(options: HookReachabilityProbeOptions = {}) {
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
        this.observedResults.push(result);
        return result;
      },
    };
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

  createProof(generatedAt: string = this.now()): HookReachabilityProof {
    const proof: HookReachabilityProof = {
      proofId: `hook-reachability-proof-${hashString(`${generatedAt}|${this.hookInvocationCount}`)}`,
      generatedAt,
      assessmentHookReached: (this.byHook.get('AssessmentEngine.processResponses') ?? 0) > 0,
      careerFitHookReached: (this.byHook.get('CareerFitEngine.calculateFit') ?? 0) > 0,
      hookInvocationCount: this.hookInvocationCount,
      observeRouterInvocationCount: this.observeRouterInvocationCount,
      canaryShadowExecutionCount: this.canaryShadowExecutionCount,
      byHook: Object.fromEntries(this.byHook.entries()),
      byFlow: Object.fromEntries(this.byFlow.entries()),
      statuses: this.observedResults.map((result) => result.status),
      observeRequestIds: this.observedResults.map((result) => result.observeRequestId),
    };
    return JSON.parse(JSON.stringify(proof)) as HookReachabilityProof;
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
