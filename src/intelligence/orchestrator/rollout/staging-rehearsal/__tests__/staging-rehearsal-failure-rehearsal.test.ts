import { describe, expect, it } from 'vitest';
import { StagingRehearsalFailureRehearsal } from '../StagingRehearsalFailureRehearsal';

describe('StagingRehearsalFailureRehearsal', () => {
  it('handles all required blocked and rollback cases safely', async () => {
    const results = await new StagingRehearsalFailureRehearsal().runAll();

    expect(new Set(results.map((result) => result.caseName))).toEqual(
      new Set([
        'production-environment',
        'unknown-environment',
        'missing-approval',
        'expired-approval',
        'kill-switch-active',
        'privacy-gate-failure',
        'telemetry-failure',
        'parity-gate-failure',
        'hook-not-reached',
        'drift-detected',
        'binding-failure',
        'latency-breach',
        'entrypoint-execution-failure',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('records hook, drift, binding, latency, and entrypoint failures', async () => {
    const rehearsal = new StagingRehearsalFailureRehearsal();

    expect((await rehearsal.runCase('hook-not-reached')).result.metrics.failedCount).toBe(1);
    expect((await rehearsal.runCase('drift-detected')).result.metrics.rollbackCount).toBe(1);
    expect((await rehearsal.runCase('binding-failure')).result.metrics.failedCount).toBe(1);
    expect((await rehearsal.runCase('latency-breach')).result.metrics.rollbackCount).toBe(1);
    expect((await rehearsal.runCase('entrypoint-execution-failure')).result.metrics.failedCount).toBe(1);
  });
});
