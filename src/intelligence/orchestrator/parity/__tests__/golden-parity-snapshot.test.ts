import { describe, expect, it } from 'vitest';
import { compareSnapshot, createSnapshot, redactSensitiveFields, summarizeSnapshot } from '../GoldenParitySnapshot';

describe('GoldenParitySnapshot', () => {
  it('redacts sensitive fields', () => {
    const redacted = redactSensitiveFields({
      studentId: 'student-1',
      prompt: 'private prompt',
      nested: { response: 'private response', safe: 'ok' },
    });

    expect(redacted).toEqual({
      studentId: '[REDACTED]',
      prompt: '[REDACTED]',
      nested: { response: '[REDACTED]', safe: 'ok' },
    });
  });

  it('compares snapshots and detects drift', () => {
    const first = createSnapshot({
      snapshotId: 'first',
      createdAt: '2026-06-06T00:00:00.000Z',
      result: { metrics: { matched: 10 }, studentId: 'student-1' },
    });
    const second = createSnapshot({
      snapshotId: 'second',
      createdAt: '2026-06-06T00:00:00.000Z',
      result: { metrics: { matched: 9 }, studentId: 'student-1' },
    });

    expect(compareSnapshot(first, first).status).toBe('MATCHED');
    expect(compareSnapshot(first, second).status).toBe('DRIFT_DETECTED');
    expect(summarizeSnapshot(first).topLevelKeys).toContain('metrics');
  });
});
