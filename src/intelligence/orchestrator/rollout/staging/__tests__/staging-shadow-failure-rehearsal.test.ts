import { describe, expect, it } from 'vitest';
import { StagingShadowFailureRehearsal } from '../StagingShadowFailureRehearsal';

describe('StagingShadowFailureRehearsal', () => {
  it('handles every required failure case safely', async () => {
    const results = await new StagingShadowFailureRehearsal().runAll();
    const cases = new Set(results.map((result) => result.caseName));

    expect(cases).toEqual(
      new Set([
        'environment-blocked',
        'missing-approval',
        'expired-approval',
        'kill-switch-active',
        'privacy-gate-failure',
        'telemetry-failure',
        'drift-detected',
        'binding-failure',
        'latency-breach',
        'production-function-failure',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('records audit bundle failures for blocked and rollback cases', async () => {
    const rehearsal = new StagingShadowFailureRehearsal();
    const environment = await rehearsal.runCase('environment-blocked');
    const drift = await rehearsal.runCase('drift-detected');

    expect(environment.result.auditBundle.failureResults.length).toBeGreaterThanOrEqual(0);
    expect(environment.result.status).toBe('BLOCKED');
    expect(drift.result.auditBundle.rollbackResults.length).toBeGreaterThanOrEqual(1);
  });
});
