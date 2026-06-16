import { describe, expect, it } from 'vitest';
import { AppRehearsalFailureRehearsal } from '../AppRehearsalFailureRehearsal';

describe('AppRehearsalFailureRehearsal', () => {
  it('handles all required blocked and rollback cases safely', async () => {
    const results = await new AppRehearsalFailureRehearsal().runAll();

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
        'app-entrypoint-missing',
        'hook-not-reached',
        'service-fallback-disallowed',
        'drift-detected',
        'binding-failure',
        'latency-breach',
        'app-entrypoint-execution-failure',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('records app entrypoint, hook, service fallback, drift, binding, latency, and execution failures', async () => {
    const rehearsal = new AppRehearsalFailureRehearsal();

    expect((await rehearsal.runCase('app-entrypoint-missing')).result.status).toBe('FAILED');
    expect((await rehearsal.runCase('hook-not-reached')).result.metrics.failedCount).toBe(1);
    expect((await rehearsal.runCase('service-fallback-disallowed')).result.status).toBe('BLOCKED');
    expect((await rehearsal.runCase('drift-detected')).result.metrics.rollbackCount).toBe(1);
    expect((await rehearsal.runCase('binding-failure')).result.metrics.failedCount).toBe(1);
    expect((await rehearsal.runCase('latency-breach')).result.metrics.rollbackCount).toBe(1);
    expect((await rehearsal.runCase('app-entrypoint-execution-failure')).result.metrics.failedCount).toBe(1);
  });
});
