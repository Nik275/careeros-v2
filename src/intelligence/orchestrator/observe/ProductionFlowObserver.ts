/**
 * @fileoverview Normalizes production intelligence calls for observe-mode routing.
 *
 * This file defines observation helpers only. It does not wire app routes,
 * mutate production outputs, or change existing intelligence behavior.
 */

import { createObserveModeConfig, createPayloadSnapshot, type ObserveModeConfig } from './ObserveModeConfig';
import type { ObservedProductionCall, ObserveModeRequest } from './ObserveModeTypes';
import type { DomainAuthorityCapability } from '../../authorities/AuthorityFacadeBase';
import type { OrchestratorRequestType } from '../RequestLifecycle';

export type ProductionFlowKind =
  | 'assessment'
  | 'recommendation'
  | 'career-fit'
  | 'future-simulation'
  | 'outcome-tracking';

export interface ProductionFlowObservationInput {
  flowKind: ProductionFlowKind;
  sourceModule: string;
  operationName: string;
  studentId: string;
  input?: unknown;
  output?: unknown;
  metadata?: Readonly<Record<string, unknown>>;
  timestamp?: string;
  callId?: string;
  traceId?: string;
}

export class ProductionFlowObserver {
  private readonly now: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  createObservation(
    input: ProductionFlowObservationInput,
    config: ObserveModeConfig = createObserveModeConfig()
  ): ObservedProductionCall {
    const mapping = mapProductionFlow(input.flowKind);
    const timestamp = input.timestamp ?? this.now();
    const callId = input.callId ?? `production-call-${hashString(
      `${input.flowKind}|${input.sourceModule}|${input.operationName}|${input.studentId}|${timestamp}`
    )}`;

    return {
      callId,
      flowName: input.flowKind,
      sourceModule: input.sourceModule,
      operationName: input.operationName,
      studentId: input.studentId,
      requestType: mapping.requestType,
      capability: mapping.capability,
      timestamp,
      inputSnapshot: createPayloadSnapshot(input.input, {
        capture: config.captureInputs,
        maxPayloadSize: config.maxPayloadSize,
      }),
      outputSnapshot: createPayloadSnapshot(input.output, {
        capture: config.captureOutputs,
        maxPayloadSize: config.maxPayloadSize,
      }),
      metadata: input.metadata ?? {},
    };
  }

  createObserveModeRequest(
    input: ProductionFlowObservationInput,
    config: ObserveModeConfig = createObserveModeConfig()
  ): ObserveModeRequest {
    const productionCall = this.createObservation(input, config);
    return {
      observeRequestId: `observe-${productionCall.callId}`,
      productionCall,
      config,
      traceId: input.traceId,
      metadata: {
        source: 'ProductionFlowObserver',
        productionFlowKind: input.flowKind,
      },
    };
  }
}

export function mapProductionFlow(flowKind: ProductionFlowKind): {
  requestType: OrchestratorRequestType;
  capability: DomainAuthorityCapability;
} {
  switch (flowKind) {
    case 'assessment':
      return {
        requestType: 'UNDERSTAND',
        capability: 'UNDERSTAND',
      };
    case 'recommendation':
    case 'career-fit':
    case 'future-simulation':
      return {
        requestType: 'GENERATE',
        capability: 'GENERATE',
      };
    case 'outcome-tracking':
      return {
        requestType: 'TRACK',
        capability: 'LEARN',
      };
    default:
      return assertNever(flowKind);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported production flow kind ${value}.`);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
