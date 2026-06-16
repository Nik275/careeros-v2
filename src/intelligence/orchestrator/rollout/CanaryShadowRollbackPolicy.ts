/**
 * @fileoverview Instant in-process rollback policy for CANARY_SHADOW.
 */

import type { CanaryShadowConfig } from './CanaryShadowConfig';
import type {
  CanaryShadowExecutionRecord,
  CanaryShadowFlowName,
  CanaryShadowRollbackReason,
} from './CanaryShadowTypes';

export interface CanaryShadowRollbackRecord {
  rollbackId: string;
  flow: CanaryShadowFlowName | string;
  reason: CanaryShadowRollbackReason;
  triggeredAt: string;
  sourceRecordId?: string;
  notes: readonly string[];
}

export interface CanaryShadowRollbackEvaluation {
  rollbackTriggered: boolean;
  reason?: CanaryShadowRollbackReason;
  record?: CanaryShadowRollbackRecord;
  notes: readonly string[];
}

export class CanaryShadowRollbackPolicy {
  private readonly now: () => string;
  private readonly disabledFlows = new Map<string, CanaryShadowRollbackRecord>();

  constructor(options: { now?: () => string } = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
  }

  evaluate(
    record: CanaryShadowExecutionRecord,
    config: CanaryShadowConfig
  ): CanaryShadowRollbackEvaluation {
    if (record.comparison.status === 'DRIFT_DETECTED' && config.rollbackOnDrift) {
      return this.rollbackFlow(record.flow, 'critical_drift', record.recordId, [
        'CANARY_SHADOW drift detected; shadow disabled for flow.',
      ]);
    }

    if ((record.status === 'FAILED' || record.comparison.status === 'FAILED') && config.rollbackOnFailure) {
      return this.rollbackFlow(record.flow, 'failure_rate_breach', record.recordId, [
        'CANARY_SHADOW execution failed; shadow disabled for flow.',
      ]);
    }

    if (record.latencyMs > config.maxLatencyMs && config.rollbackOnLatencyRegression) {
      return this.rollbackFlow(record.flow, 'latency_breach', record.recordId, [
        `CANARY_SHADOW latency ${record.latencyMs}ms exceeded ${config.maxLatencyMs}ms.`,
      ]);
    }

    return {
      rollbackTriggered: false,
      notes: ['No rollback trigger matched.'],
    };
  }

  rollbackFlow(
    flow: CanaryShadowFlowName | string,
    reason: CanaryShadowRollbackReason,
    sourceRecordId?: string,
    notes: readonly string[] = []
  ): CanaryShadowRollbackEvaluation {
    const triggeredAt = this.now();
    const record: CanaryShadowRollbackRecord = Object.freeze({
      rollbackId: `canary-shadow-rollback-${hashString(`${flow}|${reason}|${triggeredAt}`)}`,
      flow,
      reason,
      triggeredAt,
      sourceRecordId,
      notes,
    });
    this.disabledFlows.set(flow, record);
    return {
      rollbackTriggered: true,
      reason,
      record,
      notes,
    };
  }

  isFlowDisabled(flow: CanaryShadowFlowName | string): boolean {
    return this.disabledFlows.has(flow);
  }

  getRollbackRecord(flow: CanaryShadowFlowName | string): CanaryShadowRollbackRecord | undefined {
    return this.disabledFlows.get(flow);
  }

  listRollbackRecords(): readonly CanaryShadowRollbackRecord[] {
    return Array.from(this.disabledFlows.values());
  }
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
