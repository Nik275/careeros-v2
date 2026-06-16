/**
 * @fileoverview In-memory audit service for controlled CANARY_SHADOW records.
 */

import { ObservePayloadSanitizer } from '../observe/ObservePayloadSanitizer';
import type { ObservePayloadSummary } from '../observe/ObserveTelemetryTypes';
import type { CanaryShadowConfig } from './CanaryShadowConfig';
import type {
  CanaryShadowExecutionRecord,
  CanaryShadowHealthSnapshot,
  CanaryShadowStatus,
} from './CanaryShadowTypes';

const CANARY_SHADOW_STATUSES: readonly CanaryShadowStatus[] = [
  'DISABLED',
  'ELIGIBLE',
  'RUNNING',
  'SKIPPED',
  'BLOCKED',
  'FAILED',
  'COMPLETED',
  'ROLLED_BACK',
];

export class CanaryShadowAuditService {
  private readonly sanitizer: ObservePayloadSanitizer;
  private readonly records: CanaryShadowExecutionRecord[] = [];

  constructor(options: { sanitizer?: ObservePayloadSanitizer } = {}) {
    this.sanitizer = options.sanitizer ?? new ObservePayloadSanitizer();
  }

  record(record: CanaryShadowExecutionRecord): CanaryShadowExecutionRecord {
    this.records.push(Object.freeze(record));
    return record;
  }

  listRecords(): readonly CanaryShadowExecutionRecord[] {
    return [...this.records];
  }

  createPayloadSummary(
    payload: unknown,
    config: CanaryShadowConfig
  ): ObservePayloadSummary | undefined {
    if (!config.capturePayloadSummaries) {
      return undefined;
    }

    return this.sanitizer.sanitize(payload, {
      privacyClassification: 'SENSITIVE',
      allowRawPayload: false,
    });
  }

  getHealthSnapshot(config: CanaryShadowConfig): CanaryShadowHealthSnapshot {
    const byStatus = Object.fromEntries(
      CANARY_SHADOW_STATUSES.map((status) => [status, 0])
    ) as Record<CanaryShadowStatus, number>;

    for (const record of this.records) {
      byStatus[record.status] += 1;
    }

    const lastRecord = this.records[this.records.length - 1];
    return {
      enabled: config.globalShadowEnabled,
      activeFlows: config.allowedFlows,
      totalRecords: this.records.length,
      byStatus,
      driftCount: this.records.filter((record) => record.comparison.status === 'DRIFT_DETECTED').length,
      failureCount: this.records.filter((record) => record.status === 'FAILED').length,
      rollbackCount: this.records.filter((record) => record.rollbackTriggered).length,
      lastStatus: lastRecord?.status,
    };
  }

  clear(): void {
    this.records.length = 0;
  }
}
