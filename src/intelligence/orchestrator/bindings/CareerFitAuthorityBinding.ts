/**
 * @fileoverview Dry-run binding for CareerFitEngine.calculateFit.
 */

import { OptionGeneratorAuthorityFacade } from '../../authorities/OptionGeneratorAuthorityFacade';
import { CareerFitDryRunAdapter } from '../../authorities/CareerFitDryRunAdapter';
import { ObserveExecutionGuard } from '../observe/ObserveExecutionGuard';
import { normalizeCareerFitBindingOutput } from './BindingOutputNormalizer';
import type { AuthorityExecutionBinding, DryRunExecutionContext } from './AuthorityExecutionBindingTypes';
import { hashString, type AuthorityExecutionBindingResult } from './AuthorityExecutionBindingTypes';

export interface CareerFitAuthorityBindingOptions {
  enabled?: boolean;
  facade?: OptionGeneratorAuthorityFacade;
  adapter?: CareerFitDryRunAdapter;
  independentOperation?: (context: DryRunExecutionContext) => unknown | Promise<unknown>;
  now?: () => string;
}

export class CareerFitAuthorityBinding implements AuthorityExecutionBinding {
  readonly bindingId = 'career-fit.calculateFit';
  readonly flowType = 'career-fit';
  readonly hookName = 'CareerFitEngine.calculateFit';
  readonly authority = 'OptionGeneratorAuthority';
  readonly capability = 'GENERATE';
  readonly executionMode = 'SUPPLIED_RESULT_ONLY';
  readonly safetyLevel = 'low';
  readonly enabled: boolean;
  readonly description = 'Dry-run career-fit binding through OptionGeneratorAuthorityFacade.';

  private readonly facade: OptionGeneratorAuthorityFacade;
  private readonly adapter: CareerFitDryRunAdapter;
  private readonly independentOperation?: (context: DryRunExecutionContext) => unknown | Promise<unknown>;
  private readonly now: () => string;

  constructor(options: CareerFitAuthorityBindingOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.facade = options.facade ?? new OptionGeneratorAuthorityFacade();
    this.adapter = options.adapter ?? new CareerFitDryRunAdapter();
    this.independentOperation = options.independentOperation;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute(context: DryRunExecutionContext): Promise<AuthorityExecutionBindingResult> {
    const startedAt = this.now();
    const canRunPilot = shouldRunCareerFitPilot(context);
    const canRunIndependent = context.config.allowIndependentDryRun && this.independentOperation;

    if (canRunPilot) {
      const payload = readCareerFitExecutionPayload(context.observeRequest.executionPayload);
      if (!payload) {
        return this.createResult(context, startedAt, {
          executionMode: 'DRY_RUN',
          comparisonStatus: 'NOT_COMPARABLE',
          comparable: false,
          independent: false,
          notes: ['Career-fit pilot execution payload was unavailable or invalid.'],
        });
      }

      const result = await this.facade.generate(
        'calculateCareerFitIndependentPilot',
        () =>
          ObserveExecutionGuard.runWithoutObserve(() =>
            this.adapter.calculateFit({
              execute: payload.independentDryRunOperation,
            })
          ),
        {
          modulePath: 'src/career-fit/career-fit-engine.ts',
          auditNotes: ['Phase 4.9 independent career-fit dry-run pilot.'],
        }
      );
      const normalized = normalizeCareerFitBindingOutput(result);

      return this.createResult(context, startedAt, {
        executionMode: 'DRY_RUN',
        comparisonStatus: normalized ? 'INDEPENDENT_COMPARISON' : 'NOT_COMPARABLE',
        comparable: normalized !== undefined,
        independent: true,
        outputSnapshot: normalized,
        notes: normalized
          ? ['Independent career-fit pilot completed and produced normalized comparable output.']
          : ['Independent career-fit pilot completed but output was not comparable.'],
      });
    }

    if (canRunIndependent) {
      const result = await this.facade.generate(
        'calculateCareerFit',
        () => this.independentOperation?.(context),
        {
          modulePath: 'src/career-fit/career-fit-engine.ts',
          auditNotes: ['Phase 4.8 independent dry-run career-fit binding.'],
        }
      );
      return this.createResult(context, startedAt, {
        executionMode: 'DRY_RUN',
        comparisonStatus: 'INDEPENDENT_COMPARISON',
        comparable: true,
        independent: true,
        outputSnapshot: result,
        notes: ['Independent career-fit dry-run completed through OptionGeneratorAuthorityFacade.'],
      });
    }

    if (!context.config.allowSuppliedResultFallback || context.productionOutput === undefined) {
      return this.createResult(context, startedAt, {
        executionMode: 'DISABLED',
        comparisonStatus: 'NOT_COMPARABLE',
        comparable: false,
        independent: false,
        notes: ['Career-fit binding could not run independently and supplied result fallback was unavailable.'],
      });
    }

    const result = await this.facade.generate(
      'calculateCareerFit',
      () => context.productionOutput,
      {
        modulePath: 'src/career-fit/career-fit-engine.ts',
        auditNotes: ['Phase 4.8 supplied-result-only career-fit binding.'],
      }
    );
    return this.createResult(context, startedAt, {
      executionMode: 'SUPPLIED_RESULT_ONLY',
      comparisonStatus: 'SELF_MIRRORED',
      comparable: false,
      independent: false,
      outputSnapshot: result,
      notes: ['Career-fit binding used supplied production output; this cannot prove independent parity.'],
    });
  }

  private createResult(
    context: DryRunExecutionContext,
    startedAt: string,
    result: Pick<
      AuthorityExecutionBindingResult,
      'executionMode' | 'comparisonStatus' | 'comparable' | 'independent' | 'outputSnapshot' | 'notes'
    >
  ): AuthorityExecutionBindingResult {
    const completedAt = this.now();
    return {
      bindingId: this.bindingId,
      flowType: this.flowType,
      authority: this.authority,
      capability: this.capability,
      startedAt,
      completedAt,
      latencyMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
      metadata: {
        observeRequestId: context.observeRequest.observeRequestId,
        bindingHash: hashString(this.bindingId),
      },
      ...result,
    };
  }
}

function shouldRunCareerFitPilot(context: DryRunExecutionContext): boolean {
  return (
    context.config.enableIndependentPilotBinding &&
    context.config.allowPilotDryRunExecution &&
    context.config.pilotBindingName === 'career-fit.calculateFit'
  );
}

function readCareerFitExecutionPayload(value: unknown):
  | {
      independentDryRunOperation: () => unknown;
    }
  | undefined {
  if (!isRecord(value) || typeof value.independentDryRunOperation !== 'function') {
    return undefined;
  }

  return {
    independentDryRunOperation: value.independentDryRunOperation as () => unknown,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
