import { describe, expect, it } from 'vitest';
import type { AuthorityExecutionBindingResult } from '../../../bindings/AuthorityExecutionBindingTypes';
import { createBindingFailure } from '../../../bindings/AuthorityExecutionBindingTypes';
import { RouteShadowExecutionService } from '../RouteShadowExecutionService';
import {
  createSyntheticAssessmentRoutePayload,
  createSyntheticCareerFitRoutePayload,
} from '../RouteShadowSyntheticPayloads';

describe('RouteShadowExecutionService', () => {
  it('executes assessment route shadow only when explicitly approved', async () => {
    const service = new RouteShadowExecutionService({ now });
    const blocked = await service.execute(createSyntheticAssessmentRoutePayload({ approval: undefined }));
    const approved = await service.execute(createSyntheticAssessmentRoutePayload());

    expect(blocked.status).toBe('BLOCKED');
    expect(approved.status).toBe('COMPLETED');
    expect(approved.hookReached).toBe(true);
    expect(approved.matched).toBe(true);
    expect(approved.liveRoutingEnabled).toBe(false);
    expect(approved.productionOutputPreserved).toBe(true);
  });

  it('executes career-fit route shadow only when explicitly approved', async () => {
    const result = await new RouteShadowExecutionService({ now }).execute(createSyntheticCareerFitRoutePayload());

    expect(result.status).toBe('COMPLETED');
    expect(result.flow).toBe('career-fit');
    expect(result.hookReached).toBe(true);
    expect(result.matched).toBe(true);
  });

  it('reports drift without output replacement', async () => {
    const result = await new RouteShadowExecutionService({
      now,
      bindingCoordinator: driftCoordinator(now),
    }).execute(createSyntheticAssessmentRoutePayload());

    expect(result.status).toBe('ROLLED_BACK');
    expect(result.driftDetected).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
    expect(result.liveRoutingEnabled).toBe(false);
  });

  it('reports binding failure safely', async () => {
    const result = await new RouteShadowExecutionService({
      now,
      bindingCoordinator: failureCoordinator(now),
    }).execute(createSyntheticAssessmentRoutePayload());

    expect(result.status).toBe('ROLLED_BACK');
    expect(result.failure).toBe(true);
    expect(result.productionOutputPreserved).toBe(true);
  });

  it('returns a JSON-safe route response with liveRoutingEnabled false', async () => {
    const service = new RouteShadowExecutionService({ now });
    const result = await service.execute(createSyntheticAssessmentRoutePayload());
    const response = service.toResponse(result);

    expect(JSON.parse(JSON.stringify(response))).toEqual(response);
    expect(response.liveRoutingEnabled).toBe(false);
    expect(response.productionOutputPreserved).toBe(true);
  });
});

function driftCoordinator(clock: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = clock();
      return {
        bindingId: 'assessment.processResponses',
        flowType: 'assessment',
        authority: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        executionMode: 'DRY_RUN',
        comparisonStatus: 'INDEPENDENT_COMPARISON',
        comparable: true,
        independent: true,
        outputSnapshot: { forcedDrift: true },
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced drift.'],
        metadata: {},
      };
    },
  };
}

function failureCoordinator(clock: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = clock();
      return {
        bindingId: 'assessment.processResponses',
        flowType: 'assessment',
        authority: 'StudentUnderstandingAuthority',
        capability: 'UNDERSTAND',
        executionMode: 'DRY_RUN',
        comparisonStatus: 'BINDING_FAILED',
        comparable: false,
        independent: false,
        failure: createBindingFailure({
          bindingId: 'assessment.processResponses',
          message: 'Forced binding failure.',
          occurredAt: timestamp,
        }),
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced binding failure.'],
        metadata: {},
      };
    },
  };
}

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
