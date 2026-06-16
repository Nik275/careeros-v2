/**
 * @fileoverview Dry-run binding for AssessmentEngine.processResponses.
 */

import { StudentUnderstandingAuthorityFacade } from '../../authorities/StudentUnderstandingAuthorityFacade';
import { ObserveExecutionGuard } from '../observe/ObserveExecutionGuard';
import { AssessmentDryRunAdapter } from './AssessmentDryRunAdapter';
import { normalizeAssessmentBindingOutput } from './BindingOutputNormalizer';
import type { AuthorityExecutionBinding, DryRunExecutionContext } from './AuthorityExecutionBindingTypes';
import { hashString, type AuthorityExecutionBindingResult } from './AuthorityExecutionBindingTypes';

export interface AssessmentAuthorityBindingOptions {
  enabled?: boolean;
  facade?: StudentUnderstandingAuthorityFacade;
  adapter?: AssessmentDryRunAdapter;
  independentOperation?: (context: DryRunExecutionContext) => unknown | Promise<unknown>;
  now?: () => string;
}

export class AssessmentAuthorityBinding implements AuthorityExecutionBinding {
  readonly bindingId = 'assessment.processResponses';
  readonly flowType = 'assessment';
  readonly hookName = 'AssessmentEngine.processResponses';
  readonly authority = 'StudentUnderstandingAuthority';
  readonly capability = 'UNDERSTAND';
  readonly executionMode = 'SUPPLIED_RESULT_ONLY';
  readonly safetyLevel = 'low';
  readonly enabled: boolean;
  readonly description = 'Dry-run assessment binding through StudentUnderstandingAuthorityFacade.';

  private readonly facade: StudentUnderstandingAuthorityFacade;
  private readonly adapter: AssessmentDryRunAdapter;
  private readonly independentOperation?: (context: DryRunExecutionContext) => unknown | Promise<unknown>;
  private readonly now: () => string;

  constructor(options: AssessmentAuthorityBindingOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.facade = options.facade ?? new StudentUnderstandingAuthorityFacade();
    this.adapter = options.adapter ?? new AssessmentDryRunAdapter();
    this.independentOperation = options.independentOperation;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  async execute(context: DryRunExecutionContext): Promise<AuthorityExecutionBindingResult> {
    const startedAt = this.now();
    const canRunAssessmentPilot = shouldRunAssessmentPilot(context);
    const canRunIndependent = context.config.allowIndependentDryRun && this.independentOperation;

    if (canRunAssessmentPilot) {
      const payload = readAssessmentExecutionPayload(context.observeRequest.executionPayload);
      if (!payload) {
        return this.createResult(context, startedAt, {
          executionMode: 'DRY_RUN',
          comparisonStatus: 'NOT_COMPARABLE',
          comparable: false,
          independent: false,
          notes: ['Assessment dry-run execution payload was unavailable or invalid.'],
        });
      }

      const result = await this.facade.processAssessment(
        () =>
          ObserveExecutionGuard.runWithoutObserve(() =>
            this.adapter.processResponses({
              execute: payload.independentDryRunOperation,
            })
          ),
        {
          modulePath: 'src/assessment/assessment-engine.ts',
          auditNotes: ['Phase 5.1 independent assessment dry-run.'],
        }
      );
      const normalized = normalizeAssessmentBindingOutput(result);

      return this.createResult(context, startedAt, {
        executionMode: 'DRY_RUN',
        comparisonStatus: normalized ? 'INDEPENDENT_COMPARISON' : 'NOT_COMPARABLE',
        comparable: normalized !== undefined,
        independent: true,
        outputSnapshot: normalized,
        notes: normalized
          ? ['Independent assessment dry-run completed and produced normalized comparable output.']
          : ['Independent assessment dry-run completed but output was not comparable.'],
      });
    }

    if (canRunIndependent) {
      const result = await this.facade.processAssessment(
        () => this.independentOperation?.(context),
        {
          modulePath: 'src/assessment/assessment-engine.ts',
          auditNotes: ['Phase 4.8 independent dry-run assessment binding.'],
        }
      );
      return this.createResult(context, startedAt, {
        executionMode: 'DRY_RUN',
        comparisonStatus: 'INDEPENDENT_COMPARISON',
        comparable: true,
        independent: true,
        outputSnapshot: result,
        notes: ['Independent assessment dry-run completed through StudentUnderstandingAuthorityFacade.'],
      });
    }

    if (!context.config.allowSuppliedResultFallback || context.productionOutput === undefined) {
      return this.createResult(context, startedAt, {
        executionMode: 'DISABLED',
        comparisonStatus: 'NOT_COMPARABLE',
        comparable: false,
        independent: false,
        notes: ['Assessment binding could not run independently and supplied result fallback was unavailable.'],
      });
    }

    const result = await this.facade.processAssessment(
      () => context.productionOutput,
      {
        modulePath: 'src/assessment/assessment-engine.ts',
        auditNotes: ['Phase 4.8 supplied-result-only assessment binding.'],
      }
    );
    return this.createResult(context, startedAt, {
      executionMode: 'SUPPLIED_RESULT_ONLY',
      comparisonStatus: 'SELF_MIRRORED',
      comparable: false,
      independent: false,
      outputSnapshot: result,
      notes: ['Assessment binding used supplied production output; this cannot prove independent parity.'],
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

function shouldRunAssessmentPilot(context: DryRunExecutionContext): boolean {
  return (
    context.config.enableAssessmentIndependentDryRun &&
    context.config.assessmentDryRunMode === 'INDEPENDENT_DRY_RUN' &&
    context.config.assessmentParityComparisonEnabled
  );
}

function readAssessmentExecutionPayload(value: unknown):
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
