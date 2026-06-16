/**
 * @fileoverview Failure rehearsal harness for Phase 6.0 route shadow.
 */

import type { AuthorityExecutionBindingResult } from '../../bindings/AuthorityExecutionBindingTypes';
import { createBindingFailure } from '../../bindings/AuthorityExecutionBindingTypes';
import { RouteShadowExecutionService } from './RouteShadowExecutionService';
import {
  createRouteShadowTestApproval,
  createSyntheticAssessmentRoutePayload,
} from './RouteShadowSyntheticPayloads';
import type { RouteShadowExecutionResult, RouteShadowRequest } from './RouteShadowTypes';

export type RouteShadowFailureCase =
  | 'production-environment'
  | 'unknown-environment'
  | 'config-disabled'
  | 'missing-approval'
  | 'expired-approval'
  | 'missing-synthetic-marker'
  | 'raw-payload-attempt'
  | 'unsupported-flow'
  | 'kill-switch-active'
  | 'privacy-gate-failure'
  | 'telemetry-failure'
  | 'parity-gate-failure'
  | 'hook-not-reached'
  | 'drift-detected'
  | 'binding-failure'
  | 'route-execution-failure';

export interface RouteShadowFailureRehearsalResult {
  caseName: RouteShadowFailureCase;
  handledSafely: boolean;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  result: RouteShadowExecutionResult;
  notes: readonly string[];
}

export class RouteShadowFailureRehearsal {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => '2026-06-06T00:00:00.000Z');
  }

  async runAll(): Promise<readonly RouteShadowFailureRehearsalResult[]> {
    const cases: RouteShadowFailureCase[] = [
      'production-environment',
      'unknown-environment',
      'config-disabled',
      'missing-approval',
      'expired-approval',
      'missing-synthetic-marker',
      'raw-payload-attempt',
      'unsupported-flow',
      'kill-switch-active',
      'privacy-gate-failure',
      'telemetry-failure',
      'parity-gate-failure',
      'hook-not-reached',
      'drift-detected',
      'binding-failure',
      'route-execution-failure',
    ];
    const results: RouteShadowFailureRehearsalResult[] = [];
    for (const caseName of cases) results.push(await this.runCase(caseName));
    return results;
  }

  async runCase(caseName: RouteShadowFailureCase): Promise<RouteShadowFailureRehearsalResult> {
    let request = healthyRequest();
    let service = new RouteShadowExecutionService({ now: this.now });

    switch (caseName) {
      case 'production-environment':
        request = withConfig(request, { environment: 'production', allowedEnvironments: ['production'] }, 'production');
        break;
      case 'unknown-environment':
        request = withConfig(request, { environment: 'unknown', allowedEnvironments: ['unknown'] }, 'unknown');
        break;
      case 'config-disabled':
        request = withConfig(request, { enabled: false });
        break;
      case 'missing-approval':
        request = { ...request, approval: undefined };
        break;
      case 'expired-approval':
        request = {
          ...request,
          approval: createRouteShadowTestApproval({
            flows: ['assessment'],
            routes: [request.routePath],
            expiresAt: '2026-06-05T00:00:00.000Z',
          }),
        };
        break;
      case 'missing-synthetic-marker':
        request = {
          ...request,
          synthetic: false,
          payload: { ...(request.payload as Record<string, unknown>), synthetic: false },
        };
        break;
      case 'raw-payload-attempt':
        request = {
          ...request,
          payload: {
            ...(request.payload as Record<string, unknown>),
            rawStudentData: true,
            studentEmail: 'blocked@example.com',
          },
        };
        break;
      case 'unsupported-flow':
        request = { ...request, flow: 'unsupported' as never };
        break;
      case 'kill-switch-active':
        request = { ...request, gateInputs: { ...request.gateInputs, killSwitchActive: true } };
        break;
      case 'privacy-gate-failure':
        request = { ...request, gateInputs: { ...request.gateInputs, privacySafe: false } };
        break;
      case 'telemetry-failure':
        request = { ...request, gateInputs: { ...request.gateInputs, telemetryHealthy: false } };
        break;
      case 'parity-gate-failure':
        request = { ...request, gateInputs: { ...request.gateInputs, expandedParityCIGatePassed: false } };
        break;
      case 'hook-not-reached':
        request = { ...request, metadata: { ...request.metadata, forcedMode: 'hook-not-reached' } };
        break;
      case 'drift-detected':
        service = new RouteShadowExecutionService({ now: this.now, bindingCoordinator: driftCoordinator(this.now) });
        break;
      case 'binding-failure':
        service = new RouteShadowExecutionService({ now: this.now, bindingCoordinator: failureCoordinator(this.now) });
        break;
      case 'route-execution-failure':
        request = { ...request, metadata: { ...request.metadata, forcedMode: 'entrypoint-failure' } };
        break;
    }

    const result = await service.execute(request);
    return Object.freeze({
      caseName,
      handledSafely: isHandledSafely(result),
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
      result,
      notes: [`${caseName} produced ${result.status}/${result.verdict} without live routing.`],
    });
  }
}

function healthyRequest(): RouteShadowRequest {
  return createSyntheticAssessmentRoutePayload({
    requestId: 'route-shadow-failure-rehearsal',
    approval: createRouteShadowTestApproval({
      flows: ['assessment'],
      routes: ['/api/internal/constitutional-shadow/assessment'],
      maxExecutions: 1,
    }),
  });
}

function withConfig(
  request: RouteShadowRequest,
  config: NonNullable<RouteShadowRequest['config']>,
  environment?: string
): RouteShadowRequest {
  return {
    ...request,
    environment: environment ?? request.environment,
    config: {
      ...request.config,
      ...config,
    },
  };
}

function driftCoordinator(now: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = now();
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
        notes: ['Forced drift for Phase 6.0 route shadow failure rehearsal.'],
        metadata: {},
      };
    },
  };
}

function failureCoordinator(now: () => string) {
  return {
    execute: async (): Promise<AuthorityExecutionBindingResult> => {
      const timestamp = now();
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
          message: 'Forced binding failure for Phase 6.0 route shadow rehearsal.',
          occurredAt: timestamp,
        }),
        startedAt: timestamp,
        completedAt: timestamp,
        latencyMs: 0,
        notes: ['Forced binding failure for Phase 6.0 route shadow failure rehearsal.'],
        metadata: {},
      };
    },
  };
}

function isHandledSafely(result: RouteShadowExecutionResult): boolean {
  return (
    result.productionOutputPreserved &&
    !result.liveRoutingEnabled &&
    (result.status === 'DISABLED' ||
      result.status === 'BLOCKED' ||
      result.status === 'FAILED' ||
      result.status === 'ROLLED_BACK')
  );
}
