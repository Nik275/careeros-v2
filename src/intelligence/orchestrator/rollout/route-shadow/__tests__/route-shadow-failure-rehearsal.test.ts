import { describe, expect, it } from 'vitest';
import { RouteShadowFailureRehearsal } from '../RouteShadowFailureRehearsal';

describe('RouteShadowFailureRehearsal', () => {
  it('covers all required failure cases safely', async () => {
    const results = await new RouteShadowFailureRehearsal().runAll();

    expect(new Set(results.map((result) => result.caseName))).toEqual(
      new Set([
        'production-environment',
        'unknown-environment',
        'config-disabled',
        'missing-approval',
        'expired-approval',
        'missing-synthetic-marker',
        'raw-payload-attempt',
        'unsupported-flow',
        'kill-switch-active',
        'privacy-gate-failure',
        'telemetry-failure',
        'parity-gate-failure',
        'hook-not-reached',
        'drift-detected',
        'binding-failure',
        'route-execution-failure',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('records hook, drift, binding, and route execution failures', async () => {
    const rehearsal = new RouteShadowFailureRehearsal();

    expect((await rehearsal.runCase('hook-not-reached')).result.status).toBe('ROLLED_BACK');
    expect((await rehearsal.runCase('drift-detected')).result.driftDetected).toBe(true);
    expect((await rehearsal.runCase('binding-failure')).result.failure).toBe(true);
    expect((await rehearsal.runCase('route-execution-failure')).result.failure).toBe(true);
  });
});
