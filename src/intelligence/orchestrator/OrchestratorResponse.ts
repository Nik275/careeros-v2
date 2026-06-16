/**
 * @fileoverview Response contract for the orchestrator skeleton.
 */

import type { AuthorityRegistryStatus } from '../authorities/AuthorityRegistrationService';
import type { LifecycleAuditTrail } from './LifecycleAuditService';
import type { OrchestratorExecutionPlan } from './OrchestratorExecutionPlan';
import type { RequestLifecycleState } from './RequestLifecycle';
import type { ExecutionTrackerSnapshot } from './ExecutionTracker';

export type OrchestratorResponseStatus = 'completed' | 'failed' | 'cancelled' | 'rejected';

export interface OrchestratorResponse {
  requestId: string;
  studentId: string;
  flowId: string;
  status: OrchestratorResponseStatus;
  currentState: RequestLifecycleState;
  plan: OrchestratorExecutionPlan;
  stageResults: Readonly<Record<string, unknown>>;
  lifecycle: ExecutionTrackerSnapshot;
  auditTrail: LifecycleAuditTrail;
  authorityIntegrationStatus: AuthorityRegistryStatus;
  warnings: readonly string[];
  knownLimitations: readonly string[];
  errorMessage?: string;
}
