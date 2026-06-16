import { describe, expect, it } from 'vitest';
import { RouteShadowServerFailureRehearsal } from '../RouteShadowServerFailureRehearsal';

describe('RouteShadowServerFailureRehearsal', () => {
  it('covers all required server failure cases', async () => {
    const results = await new RouteShadowServerFailureRehearsal().runAll();

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
        'invalid-base-url',
        'blocked-external-host',
        'server-start-failure',
        'server-readiness-timeout',
        'http-timeout',
        'non-json-response',
        'http-500-response',
        'malformed-json',
        'hook-not-reached',
        'live-routing-enabled-true',
        'production-output-preserved-false',
        'stack-trace-leak',
        'drift-detected',
        'binding-failure',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('reports drift, binding failure, and unsafe response flags through validation', async () => {
    const rehearsal = new RouteShadowServerFailureRehearsal();
    const drift = await rehearsal.runCase('drift-detected');
    const binding = await rehearsal.runCase('binding-failure');
    const live = await rehearsal.runCase('live-routing-enabled-true');
    const preserved = await rehearsal.runCase('production-output-preserved-false');

    expect(drift.result?.driftDetected).toBe(true);
    expect(binding.result?.failure).toBe(true);
    expect(live.result?.validation.liveRoutingDisabled).toBe(false);
    expect(preserved.result?.validation.productionOutputPreserved).toBe(false);
  });
});

