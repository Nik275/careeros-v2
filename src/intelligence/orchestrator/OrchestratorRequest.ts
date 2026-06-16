/**
 * @fileoverview Request contract for the IntelligenceOrchestrator skeleton.
 */

import type { DomainAuthorityCapability } from '../authorities/AuthorityFacadeBase';
import type { OrchestratorContext } from './OrchestratorContext';
import type { OrchestratorRequestType } from './RequestLifecycle';

export type OrchestratorRequestPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface OrchestratorRequest {
  requestId: string;
  studentId: string;
  requestType: OrchestratorRequestType;
  context: OrchestratorContext;
  priority: OrchestratorRequestPriority;
  requestedCapabilities: readonly DomainAuthorityCapability[];
  timestamp: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface CreateOrchestratorRequestInput {
  requestId: string;
  studentId: string;
  requestType: OrchestratorRequestType;
  context?: OrchestratorContext;
  priority?: OrchestratorRequestPriority;
  requestedCapabilities?: readonly DomainAuthorityCapability[];
  timestamp?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export function createOrchestratorRequest(
  input: CreateOrchestratorRequestInput
): OrchestratorRequest {
  return {
    requestId: input.requestId,
    studentId: input.studentId,
    requestType: input.requestType,
    context: input.context ?? {},
    priority: input.priority ?? 'NORMAL',
    requestedCapabilities: input.requestedCapabilities ?? [],
    timestamp: input.timestamp ?? new Date().toISOString(),
    metadata: input.metadata ?? {},
  };
}
