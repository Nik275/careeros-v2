/**
 * @fileoverview In-memory audit storage for observe-mode routing.
 */

import type {
  ObserveModeAuditRecord,
  ObserveModeDrift,
  ObserveModeStatus,
} from './ObserveModeTypes';

export interface ObserveModeAuditSummary {
  totalRecords: number;
  byStatus: Readonly<Record<ObserveModeStatus, number>>;
  driftCount: number;
  failureCount: number;
  comparableCount: number;
  coveredFlows: readonly string[];
}

const OBSERVE_STATUSES: readonly ObserveModeStatus[] = [
  'OBSERVED',
  'SKIPPED',
  'FAILED',
  'DRIFT_DETECTED',
  'MATCHED',
  'NOT_COMPARABLE',
  'SELF_MIRRORED',
  'BINDING_FAILED',
  'BINDING_DISABLED',
  'BINDING_NOT_FOUND',
  'INDEPENDENT_COMPARISON',
] as const;

export class ObserveModeAuditService {
  private readonly records: ObserveModeAuditRecord[] = [];

  record(record: ObserveModeAuditRecord): ObserveModeAuditRecord {
    this.records.push(Object.freeze(record));
    return record;
  }

  listRecords(): readonly ObserveModeAuditRecord[] {
    return [...this.records];
  }

  getAuditSummary(): ObserveModeAuditSummary {
    const byStatus = Object.fromEntries(
      OBSERVE_STATUSES.map((status) => [status, 0])
    ) as Record<ObserveModeStatus, number>;

    for (const record of this.records) {
      byStatus[record.status] += 1;
    }

    return {
      totalRecords: this.records.length,
      byStatus,
      driftCount: this.getDriftSummary().totalDrifts,
      failureCount: this.records.filter((record) => record.status === 'FAILED').length,
      comparableCount: this.records.filter((record) => record.comparison.comparable).length,
      coveredFlows: Array.from(
        new Set(this.records.map((record) => record.productionCall.flowName))
      ).sort(),
    };
  }

  getDriftSummary(): { totalDrifts: number; drifts: readonly ObserveModeDrift[] } {
    const drifts = this.records.flatMap((record) => record.comparison.drifts);
    return {
      totalDrifts: drifts.length,
      drifts,
    };
  }

  getFailureSummary(): { totalFailures: number; failures: readonly ObserveModeAuditRecord[] } {
    const failures = this.records.filter((record) => record.status === 'FAILED');
    return {
      totalFailures: failures.length,
      failures,
    };
  }

  getCoverageSummary(): { totalFlows: number; flows: readonly string[] } {
    const flows = Array.from(new Set(this.records.map((record) => record.productionCall.flowName))).sort();
    return {
      totalFlows: flows.length,
      flows,
    };
  }

  clear(): void {
    this.records.length = 0;
  }
}
