/**
 * @fileoverview Aggregates lifecycle audit data for orchestrated requests.
 */

import {
  ConstitutionalAuditService,
  ConstitutionalOwnershipRegistry,
  type AuditRecord,
  type ValidationResult,
} from '../constitutional';
import type { DomainAuthorityCapability, DomainAuthorityType } from '../authorities/AuthorityFacadeBase';
import type { ExecutionTrackerSnapshot } from './ExecutionTracker';
import type {
  ExecutionBindingState,
  ResolvedExecutionBindingMode,
  StageExecutionMode,
} from './OrchestratorContext';
import type { OrchestratorExecutionPlan } from './OrchestratorExecutionPlan';
import type { OrchestratorRequest } from './OrchestratorRequest';
import type { RoutingPolicyDecision } from './ConstitutionalRoutingPolicy';
import type { RequestLifecycleState } from './RequestLifecycle';
import type { StateTransitionRecord } from './OrchestratorStateMachine';

export interface LifecycleAuditTrail {
  auditTrailId: string;
  requestId: string;
  studentId: string;
  planId: string;
  createdAt: string;
  finalState: RequestLifecycleState;
  stateHistory: readonly StateTransitionRecord[];
  authorityInvolvementHistory: readonly {
    authority: DomainAuthorityType;
    capability: DomainAuthorityCapability;
    executionId: string;
    operationName: string;
    lifecycleState: RequestLifecycleState;
    status: 'started' | 'completed' | 'failed';
    auditId?: string;
    latencyMs?: number;
    modulePath?: string;
    registryModulePath?: string;
    bindingState: ExecutionBindingState;
    bindingMode: ResolvedExecutionBindingMode;
    executionMode: StageExecutionMode;
    usesNoop: boolean;
    bindingReasons: readonly string[];
  }[];
  capabilityUsageHistory: ExecutionTrackerSnapshot['capabilityUsageHistory'];
  constitutionalComplianceReport: ExecutionTrackerSnapshot['complianceReport'];
  auditRecordIds: readonly string[];
  eventIds: readonly string[];
  planExecutability: OrchestratorExecutionPlan['executability'];
  routingDecision: {
    allowed: boolean;
    reason: string;
    requiredAuthorities: readonly DomainAuthorityType[];
    requiredCapabilities: readonly DomainAuthorityCapability[];
    policyVersion: string;
  };
  constitutionalAudit: AuditRecord;
  notes: readonly string[];
}

export interface LifecycleAuditServiceOptions {
  registry?: ConstitutionalOwnershipRegistry;
  now?: () => string;
}

export class LifecycleAuditService {
  private readonly registry: ConstitutionalOwnershipRegistry;
  private readonly auditService: ConstitutionalAuditService;
  private readonly now: () => string;

  constructor(options: LifecycleAuditServiceOptions = {}) {
    this.registry = options.registry ?? ConstitutionalOwnershipRegistry.createDefault();
    this.now = options.now ?? (() => new Date().toISOString());
    this.auditService = new ConstitutionalAuditService({
      registry: this.registry,
      now: this.now,
    });
  }

  createLifecycleAudit(
    request: OrchestratorRequest,
    plan: OrchestratorExecutionPlan,
    trackerSnapshot: ExecutionTrackerSnapshot,
    routingDecision: RoutingPolicyDecision
  ): LifecycleAuditTrail {
    const validationResult = toValidationResult(trackerSnapshot);
    const constitutionalAudit = this.auditService.generateAuditReport({
      validationResult,
      notes: [
        `Lifecycle audit for orchestrator request ${request.requestId}.`,
        `Plan ${plan.planId} finalized in state ${trackerSnapshot.currentState}.`,
        ...routingDecision.notes,
      ],
    }).audit;

    return {
      auditTrailId: `lifecycle-audit-${request.requestId}`,
      requestId: request.requestId,
      studentId: request.studentId,
      planId: plan.planId,
      createdAt: this.now(),
      finalState: trackerSnapshot.currentState,
      stateHistory: trackerSnapshot.stateHistory,
      authorityInvolvementHistory: trackerSnapshot.authorityExecutions.map((execution) => ({
        authority: execution.authority,
        capability: execution.capability,
        executionId: execution.executionId,
        operationName: execution.operationName,
        lifecycleState: execution.lifecycleState,
        status: execution.status,
        auditId: execution.auditId,
        latencyMs: execution.latencyMs,
        modulePath: execution.modulePath,
        registryModulePath: execution.registryModulePath,
        bindingState: execution.bindingState,
        bindingMode: execution.bindingMode,
        executionMode: execution.executionMode,
        usesNoop: execution.usesNoop,
        bindingReasons: execution.bindingReasons,
      })),
      capabilityUsageHistory: trackerSnapshot.capabilityUsageHistory,
      constitutionalComplianceReport: trackerSnapshot.complianceReport,
      auditRecordIds: trackerSnapshot.auditIds,
      eventIds: trackerSnapshot.eventIds,
      planExecutability: plan.executability,
      routingDecision: {
        allowed: routingDecision.allowed,
        reason: routingDecision.reason,
        requiredAuthorities: routingDecision.requiredAuthorities,
        requiredCapabilities: routingDecision.requiredCapabilities,
        policyVersion: routingDecision.policyVersion,
      },
      constitutionalAudit,
      notes: [
        `Lifecycle audit created from ${trackerSnapshot.stateHistory.length} state transitions.`,
        `Authority executions observed: ${trackerSnapshot.authorityExecutions.length}.`,
        `Plan executability was ${plan.executability.status}.`,
      ],
    };
  }
}

function toValidationResult(snapshot: ExecutionTrackerSnapshot): ValidationResult {
  return {
    mode: 'observe',
    observedAt: snapshot.stateHistory.at(-1)?.timestamp ?? new Date().toISOString(),
    checkedModules: 0,
    checkedDependencies: 0,
    checkedAuthorityUsages: snapshot.capabilityUsageHistory.length,
    checkedPublicSurfaces: 0,
    violations: snapshot.complianceReport.violations,
    summary: {
      totalViolations: snapshot.complianceReport.violationCount,
      byType: {
        OWNERSHIP_VIOLATION: snapshot.complianceReport.violations.filter(
          (violation) => violation.type === 'OWNERSHIP_VIOLATION'
        ).length,
        AUTHORITY_VIOLATION: snapshot.complianceReport.violations.filter(
          (violation) => violation.type === 'AUTHORITY_VIOLATION'
        ).length,
        DEPENDENCY_VIOLATION: snapshot.complianceReport.violations.filter(
          (violation) => violation.type === 'DEPENDENCY_VIOLATION'
        ).length,
        PUBLIC_SURFACE_VIOLATION: snapshot.complianceReport.violations.filter(
          (violation) => violation.type === 'PUBLIC_SURFACE_VIOLATION'
        ).length,
        REGISTRY_VIOLATION: snapshot.complianceReport.violations.filter(
          (violation) => violation.type === 'REGISTRY_VIOLATION'
        ).length,
      },
      bySeverity: {
        critical: snapshot.complianceReport.violations.filter(
          (violation) => violation.severity === 'critical'
        ).length,
        high: snapshot.complianceReport.violations.filter(
          (violation) => violation.severity === 'high'
        ).length,
        medium: snapshot.complianceReport.violations.filter(
          (violation) => violation.severity === 'medium'
        ).length,
        low: snapshot.complianceReport.violations.filter(
          (violation) => violation.severity === 'low'
        ).length,
        info: snapshot.complianceReport.violations.filter(
          (violation) => violation.severity === 'info'
        ).length,
      },
    },
  };
}
