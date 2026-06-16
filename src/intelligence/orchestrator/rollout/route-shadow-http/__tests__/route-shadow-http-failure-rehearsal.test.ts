import { describe, expect, it } from 'vitest';
import { RouteShadowHttpFailureRehearsal } from '../RouteShadowHttpFailureRehearsal';

describe('RouteShadowHttpFailureRehearsal', () => {
  it('covers all required HTTP failure cases safely', async () => {
    const results = await new RouteShadowHttpFailureRehearsal().runAll();

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
        'unsupported-route',
        'oversized-payload',
        'kill-switch-active',
        'privacy-gate-failure',
        'telemetry-failure',
        'parity-gate-failure',
        'malformed-json',
        'route-handler-failure',
        'hook-not-reached',
        'drift-detected',
        'binding-failure',
        'attempted-live-routing-flag',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('reports malformed JSON, drift, binding failure, and attempted live routing safely', async () => {
    const rehearsal = new RouteShadowHttpFailureRehearsal();
    const malformed = await rehearsal.runCase('malformed-json');
    const drift = await rehearsal.runCase('drift-detected');
    const binding = await rehearsal.runCase('binding-failure');
    const live = await rehearsal.runCase('attempted-live-routing-flag');

    expect(malformed.result.httpStatus).toBe(400);
    expect(drift.result.driftDetected).toBe(true);
    expect(binding.result.failure).toBe(true);
    expect(live.result.verdict).toBe('BLOCKED');
    expect(live.result.liveRoutingEnabled).toBe(false);
  });
});

