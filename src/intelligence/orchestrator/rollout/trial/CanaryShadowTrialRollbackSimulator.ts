/**
 * @fileoverview Controlled rollback simulations for CANARY_SHADOW trials.
 */

import { CanaryShadowAuditService } from '../CanaryShadowAuditService';
import { createCanaryShadowConfig } from '../CanaryShadowConfig';
import { CanaryShadowRollbackPolicy } from '../CanaryShadowRollbackPolicy';
import type { CanaryShadowExecutionRecord, CanaryShadowRollbackReason } from '../CanaryShadowTypes';
import type { CanaryShadowTrialFailure } from './CanaryShadowTrialTypes';

export type CanaryShadowTrialRollbackSimulationType =
  | 'critical_drift'
  | 'binding_failure'
  | 'telemetry_failure'
  | 'privacy_gate_failure'
  | 'kill_switch_activation'
  | 'expired_approval'
  | 'latency_breach';

export interface CanaryShadowTrialRollbackSimulationResult {
  simulationType: CanaryShadowTrialRollbackSimulationType;
  rollbackTriggered: boolean;
  rollbackReason: CanaryShadowRollbackReason;
  shadowExecutionStopped: boolean;
  productionOutputPreserved: true;
  auditRecordCreated: boolean;
  failure: CanaryShadowTrialFailure;
}

export interface CanaryShadowTrialRollbackSimulatorOptions {
  auditService?: CanaryShadowAuditService;
  rollbackPolicy?: CanaryShadowRollbackPolicy;
  now?: () => string;
}

export class CanaryShadowTrialRollbackSimulator {
  private readonly auditService: CanaryShadowAuditService;
  private readonly rollbackPolicy: CanaryShadowRollbackPolicy;
  private readonly now: () => string;

  constructor(options: CanaryShadowTrialRollbackSimulatorOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.auditService = options.auditService ?? new CanaryShadowAuditService();
    this.rollbackPolicy = options.rollbackPolicy ?? new CanaryShadowRollbackPolicy({ now: this.now });
  }

  simulateAll(): readonly CanaryShadowTrialRollbackSimulationResult[] {
    return [
      this.simulate('critical_drift'),
      this.simulate('binding_failure'),
      this.simulate('telemetry_failure'),
      this.simulate('privacy_gate_failure'),
      this.simulate('kill_switch_activation'),
      this.simulate('expired_approval'),
      this.simulate('latency_breach'),
    ];
  }

  simulate(type: CanaryShadowTrialRollbackSimulationType): CanaryShadowTrialRollbackSimulationResult {
    const reason = rollbackReasonFor(type);
    const failure = this.createFailure(type);
    const record = this.createRecord(type, reason, failure);

    const rollback =
      type === 'critical_drift' || type === 'binding_failure' || type === 'latency_breach'
        ? this.rollbackPolicy.evaluate(record, createCanaryShadowConfig({
            globalShadowEnabled: true,
            allowedFlows: ['assessment'],
            rollbackOnDrift: true,
            rollbackOnFailure: true,
            rollbackOnLatencyRegression: true,
            maxLatencyMs: 250,
          }))
        : this.rollbackPolicy.rollbackFlow('assessment', reason, record.recordId, [
            `Controlled rollback simulation: ${type}.`,
          ]);

    const finalRecord = Object.freeze({
      ...record,
      status: 'ROLLED_BACK' as const,
      rollbackTriggered: rollback.rollbackTriggered,
      rollbackReason: rollback.reason ?? reason,
      notes: [...record.notes, ...rollback.notes],
    });
    this.auditService.record(finalRecord);

    return Object.freeze({
      simulationType: type,
      rollbackTriggered: rollback.rollbackTriggered,
      rollbackReason: rollback.reason ?? reason,
      shadowExecutionStopped: this.rollbackPolicy.isFlowDisabled('assessment'),
      productionOutputPreserved: true,
      auditRecordCreated: this.auditService.listRecords().some((entry) => entry.recordId === finalRecord.recordId),
      failure,
    });
  }

  getAuditService(): CanaryShadowAuditService {
    return this.auditService;
  }

  private createRecord(
    type: CanaryShadowTrialRollbackSimulationType,
    reason: CanaryShadowRollbackReason,
    failure: CanaryShadowTrialFailure
  ): CanaryShadowExecutionRecord {
    const now = this.now();
    const comparisonStatus =
      type === 'critical_drift'
        ? 'DRIFT_DETECTED'
        : type === 'latency_breach'
          ? 'MATCHED'
        : type === 'binding_failure'
          ? 'FAILED'
          : 'NOT_COMPARABLE';

    return {
      recordId: `canary-shadow-sim-${type}`,
      requestId: `canary-shadow-sim-request-${type}`,
      productionCallId: `canary-shadow-sim-production-${type}`,
      flow: 'assessment',
      status: comparisonStatus === 'FAILED' ? 'FAILED' : 'COMPLETED',
      decision: {
        decisionId: `canary-shadow-sim-decision-${type}`,
        requestId: `canary-shadow-sim-request-${type}`,
        flow: 'assessment',
        mode: 'CANARY_SHADOW',
        status: 'ELIGIBLE',
        approved: true,
        gateResults: [],
        riskLevel: reason === 'critical_drift' ? 'critical' : 'high',
        reasons: [failure.reason],
        decidedAt: now,
        metadata: {
          simulationType: type,
        },
      },
      comparison: {
        status: comparisonStatus,
        comparable: comparisonStatus === 'DRIFT_DETECTED',
        productionOutputCaptured: true,
        shadowOutputCaptured: comparisonStatus !== 'NOT_COMPARABLE',
        differences: comparisonStatus === 'DRIFT_DETECTED' ? ['simulated-difference'] : [],
        notes: [failure.reason],
      },
      startedAt: now,
      completedAt: now,
      latencyMs: type === 'latency_breach' ? 1_000 : 10,
      rollbackTriggered: false,
      rollbackReason: reason,
      privacySafe: type !== 'privacy_gate_failure',
      telemetryHealthy: type !== 'telemetry_failure',
      productionOutputPreserved: true,
      notes: [`Controlled rollback simulation: ${type}.`],
    };
  }

  private createFailure(type: CanaryShadowTrialRollbackSimulationType): CanaryShadowTrialFailure {
    const occurredAt = this.now();
    return {
      failureId: `canary-shadow-trial-sim-failure-${type}`,
      scenarioId: `canary-shadow-trial-sim-${type}`,
      flow: 'assessment',
      reason: `Simulated ${type.replace(/_/g, ' ')}.`,
      severity: type === 'critical_drift' ? 'critical' : 'high',
      occurredAt,
      metadata: {
        simulationType: type,
      },
    };
  }
}

function rollbackReasonFor(type: CanaryShadowTrialRollbackSimulationType): CanaryShadowRollbackReason {
  switch (type) {
    case 'critical_drift':
      return 'critical_drift';
    case 'binding_failure':
      return 'failure_rate_breach';
    case 'telemetry_failure':
      return 'telemetry_failure';
    case 'privacy_gate_failure':
      return 'privacy_violation';
    case 'kill_switch_activation':
      return 'manual_kill_switch';
    case 'expired_approval':
      return 'expired_approval';
    case 'latency_breach':
      return 'latency_breach';
  }
}
