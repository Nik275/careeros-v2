/**
 * @fileoverview In-memory JSON-safe parity result snapshots.
 */

export interface GoldenParitySnapshot {
  snapshotId: string;
  createdAt: string;
  summary: unknown;
  redacted: boolean;
}

export interface GoldenParitySnapshotComparison {
  status: 'MATCHED' | 'DRIFT_DETECTED';
  differences: readonly string[];
}

const SENSITIVE_KEYS = [/response/i, /prompt/i, /studentId/i, /profileId/i, /email/i, /phone/i, /raw/i];

export function createSnapshot(input: {
  snapshotId: string;
  result: unknown;
  createdAt?: string;
}): GoldenParitySnapshot {
  return Object.freeze({
    snapshotId: input.snapshotId,
    createdAt: input.createdAt ?? new Date().toISOString(),
    summary: redactSensitiveFields(toJsonSafe(input.result)),
    redacted: true,
  });
}

export function compareSnapshot(
  left: GoldenParitySnapshot,
  right: GoldenParitySnapshot
): GoldenParitySnapshotComparison {
  const leftSummary = stableStringify(left.summary);
  const rightSummary = stableStringify(right.summary);
  if (leftSummary === rightSummary) {
    return {
      status: 'MATCHED',
      differences: [],
    };
  }

  return {
    status: 'DRIFT_DETECTED',
    differences: ['snapshot.summary'],
  };
}

export function summarizeSnapshot(snapshot: GoldenParitySnapshot): Readonly<Record<string, unknown>> {
  const summary = isRecord(snapshot.summary) ? snapshot.summary : {};
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    createdAt: snapshot.createdAt,
    redacted: snapshot.redacted,
    topLevelKeys: Object.keys(summary).sort(),
  });
}

export function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveFields);
  }
  if (!isRecord(value)) {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEYS.some((pattern) => pattern.test(key))) {
      output[key] = '[REDACTED]';
      continue;
    }
    output[key] = redactSensitiveFields(entry);
  }
  return output;
}

function toJsonSafe(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, entry) => {
      if (entry instanceof Date) return entry.toISOString();
      if (typeof entry === 'function') return '[FUNCTION]';
      return entry;
    })
  );
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, sortKeys);
}

function sortKeys(_key: string, value: unknown): unknown {
  if (!isRecord(value) || Array.isArray(value)) return value;
  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = value[key];
      return accumulator;
    }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
