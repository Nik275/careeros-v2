/**
 * @fileoverview Tracks lifecycle, authority execution, and compliance details
 * for orchestrator requests.
 */

import type {
  AuditRecord,
  ConstitutionalEventEnvelope,
  ViolationRecord,
} from '../constitutional';
import type {
  AuthorityRegistrationRecord,
  AuthorityExecutionValidationSnapshot,
  DomainAuthorityCapability,
  DomainAuthorityType,
} from '../authorities/AuthorityFacadeBase';
import type {
  ExecutionBindingState,
  ResolvedExecutionBindingMode,
  StageExecutionMode,
} from './OrchestratorContext';
import type { RequestLifecycleState } from './RequestLifecycle';
import type { StateTransitionRecord } from './OrchestratorStateMachine';

export interface AuthorityExecutionRecord {
  executionId: string;
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  lifecycleState: RequestLifecycleState;
  operationName: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  latencyMs?: number;
  modulePath?: string;
  registryModulePath?: string;
  registrationId?: string;
  facadeName?: string;
  auditId?: string;
  bindingState: ExecutionBindingState;
  bindingMode: ResolvedExecutionBindingMode;
  executionMode: StageExecutionMode;
  usesNoop: boolean;
  bindingReasons: readonly string[];
  validationSnapshot?: AuthorityExecutionValidationSnapshot;
  violations: readonly ViolationRecord[];
  resultSummary?: string;
  errorMessage?: string;
}

export interface CapabilityUsageRecord {
  capability: DomainAuthorityCapability;
  authority: DomainAuthorityType;
  lifecycleState: RequestLifecycleState;
  executionId: string;
  timestamp: string;
}

export interface LifecycleFailureRecord {
  failureId: string;
  lifecycleState: RequestLifecycleState;
  message: string;
  timestamp: string;
  authority?: DomainAuthorityType;
  executionId?: string;
}

export interface ConstitutionalComplianceReport {
  compliant: boolean;
  violationCount: number;
  violations: readonly ViolationRecord[];
  ownershipObservationCount: number;
  capabilityObservationCount: number;
  dependencyViolationCount: number;
  authorityViolationCount: number;
  policyViolations: readonly string[];
}

export interface ExecutionTrackerSnapshot {
  requestId: string;
  planId: string;
  currentState: RequestLifecycleState;
  stateHistory: readonly StateTransitionRecord[];
  authorityExecutions: readonly AuthorityExecutionRecord[];
  failures: readonly LifecycleFailureRecord[];
  capabilityUsageHistory: readonly CapabilityUsageRecord[];
  auditIds: readonly string[];
  eventIds: readonly string[];
  totalLatencyMs: number;
  complianceReport: ConstitutionalComplianceReport;
}

export interface AuthorityExecutionStartInput {
  authority: DomainAuthorityType;
  capability: DomainAuthorityCapability;
  lifecycleState: RequestLifecycleState;
  operationName: string;
  startedAt: string;
  modulePath?: string;
  registryModulePath?: string;
  registration?: AuthorityRegistrationRecord;
  bindingState: ExecutionBindingState;
  bindingMode: ResolvedExecutionBindingMode;
  executionMode: StageExecutionMode;
  usesNoop: boolean;
  bindingReasons: readonly string[];
}

export interface AuthorityExecutionCompletionInput {
  completedAt: string;
  auditRecord?: AuditRecord;
  validationSnapshot?: AuthorityExecutionValidationSnapshot;
  resultSummary?: string;
}

export interface AuthorityExecutionFailureInput
  extends Omit<AuthorityExecutionCompletionInput, 'resultSummary'> {
  errorMessage: string;
}

export interface ExecutionTrackerOptions {
  now?: () => string;
}

export class ExecutionTracker {
  private readonly requestId: string;
  private readonly planId: string;
  private readonly now: () => string;
  private readonly stateHistory: StateTransitionRecord[] = [];
  private readonly authorityExecutions = new Map<string, AuthorityExecutionRecord>();
  private readonly capabilityUsageHistory: CapabilityUsageRecord[] = [];
  private readonly failures: LifecycleFailureRecord[] = [];
  private readonly auditIds = new Set<string>();
  private readonly eventIds = new Set<string>();
  private readonly policyViolations: string[] = [];
  private readonly policyViolationRecords: ViolationRecord[] = [];

  constructor(requestId: string, planId: string, options: ExecutionTrackerOptions = {}) {
    this.requestId = requestId;
    this.planId = planId;
    this.now = options.now ?? (() => new Date().toISOString());
  }

  recordStateTransition(transition: StateTransitionRecord): void {
    this.stateHistory.push(transition);
  }

  startAuthorityExecution(input: AuthorityExecutionStartInput): string {
    const executionId = `orchestrator-execution-${this.requestId}-${this.authorityExecutions.size + 1}`;
    this.authorityExecutions.set(executionId, {
      executionId,
      authority: input.authority,
      capability: input.capability,
      lifecycleState: input.lifecycleState,
      operationName: input.operationName,
      status: 'started',
      startedAt: input.startedAt,
      modulePath: input.modulePath,
      registryModulePath: input.registryModulePath,
      registrationId: input.registration?.registrationId,
      facadeName: input.registration?.facadeName,
      bindingState: input.bindingState,
      bindingMode: input.bindingMode,
      executionMode: input.executionMode,
      usesNoop: input.usesNoop,
      bindingReasons: input.bindingReasons,
      violations: [],
    });
    this.capabilityUsageHistory.push({
      capability: input.capability,
      authority: input.authority,
      lifecycleState: input.lifecycleState,
      executionId,
      timestamp: input.startedAt,
    });
    return executionId;
  }

  completeAuthorityExecution(
    executionId: string,
    input: AuthorityExecutionCompletionInput
  ): void {
    const record = this.requireExecution(executionId);
    const violations = input.validationSnapshot?.access.violations ?? [];

    this.authorityExecutions.set(executionId, {
      ...record,
      status: 'completed',
      completedAt: input.completedAt,
      latencyMs: differenceInMilliseconds(record.startedAt, input.completedAt),
      auditId: input.auditRecord?.auditId,
      validationSnapshot: input.validationSnapshot,
      violations,
      resultSummary: input.resultSummary,
    });

    if (input.auditRecord) {
      this.auditIds.add(input.auditRecord.auditId);
    }
  }

  failAuthorityExecution(executionId: string, input: AuthorityExecutionFailureInput): void {
    const record = this.requireExecution(executionId);
    const violations = input.validationSnapshot?.access.violations ?? [];

    this.authorityExecutions.set(executionId, {
      ...record,
      status: 'failed',
      completedAt: input.completedAt,
      latencyMs: differenceInMilliseconds(record.startedAt, input.completedAt),
      auditId: input.auditRecord?.auditId,
      validationSnapshot: input.validationSnapshot,
      violations,
      errorMessage: input.errorMessage,
    });

    this.failures.push({
      failureId: `orchestrator-failure-${this.requestId}-${this.failures.length + 1}`,
      lifecycleState: record.lifecycleState,
      message: input.errorMessage,
      timestamp: input.completedAt,
      authority: record.authority,
      executionId,
    });

    if (input.auditRecord) {
      this.auditIds.add(input.auditRecord.auditId);
    }
  }

  recordPolicyViolation(message: string, violations: readonly ViolationRecord[] = []): void {
    this.policyViolations.push(message);
    this.policyViolationRecords.push(...violations);
  }

  recordEvents(events: readonly ConstitutionalEventEnvelope<Record<string, unknown>>[]): void {
    for (const event of events) {
      this.eventIds.add(event.eventId);
    }
  }

  getSnapshot(currentState: RequestLifecycleState): ExecutionTrackerSnapshot {
    const executions = Array.from(this.authorityExecutions.values()).sort((left, right) =>
      left.executionId.localeCompare(right.executionId)
    );
    const allViolations = [
      ...this.policyViolationRecords,
      ...executions.flatMap((execution) => execution.violations),
    ];
    const ownershipObservationCount = executions.reduce(
      (count, execution) =>
        count + (execution.validationSnapshot?.ownership.observations.length ?? 0),
      0
    );
    const capabilityObservationCount = executions.reduce(
      (count, execution) =>
        count + (execution.validationSnapshot?.capability.observations.length ?? 0),
      0
    );

    return {
      requestId: this.requestId,
      planId: this.planId,
      currentState,
      stateHistory: [...this.stateHistory],
      authorityExecutions: executions,
      failures: [...this.failures],
      capabilityUsageHistory: [...this.capabilityUsageHistory],
      auditIds: Array.from(this.auditIds).sort(),
      eventIds: Array.from(this.eventIds).sort(),
      totalLatencyMs: calculateTotalLatency(this.stateHistory),
      complianceReport: {
        compliant: allViolations.length === 0 && this.policyViolations.length === 0,
        violationCount: allViolations.length,
        violations: allViolations,
        ownershipObservationCount,
        capabilityObservationCount,
        dependencyViolationCount: allViolations.filter(
          (violation) => violation.type === 'DEPENDENCY_VIOLATION'
        ).length,
        authorityViolationCount: allViolations.filter(
          (violation) => violation.type === 'AUTHORITY_VIOLATION'
        ).length,
        policyViolations: [...this.policyViolations],
      },
    };
  }

  private requireExecution(executionId: string): AuthorityExecutionRecord {
    const record = this.authorityExecutions.get(executionId);
    if (!record) {
      throw new Error(`Unknown authority execution ${executionId}.`);
    }
    return record;
  }
}

function differenceInMilliseconds(startedAt: string, completedAt: string): number {
  return new Date(completedAt).getTime() - new Date(startedAt).getTime();
}

function calculateTotalLatency(stateHistory: readonly StateTransitionRecord[]): number {
  const startedAt = stateHistory[0]?.timestamp;
  const completedAt = stateHistory.at(-1)?.timestamp ?? startedAt;

  if (!startedAt || !completedAt) {
    return 0;
  }

  return differenceInMilliseconds(startedAt, completedAt);
}
