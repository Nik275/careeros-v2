import { describe, expect, it } from 'vitest';
import { DeployedRouteShadowFailureRehearsal } from '../DeployedRouteShadowFailureRehearsal';

describe('DeployedRouteShadowFailureRehearsal', () => {
  it('covers all required deployed staging failure cases safely', async () => {
    const results = await new DeployedRouteShadowFailureRehearsal().runAll();

    expect(new Set(results.map((result) => result.caseName))).toEqual(
      new Set([
        'production-environment',
        'unknown-environment',
        'config-disabled',
        'missing-approval',
        'expired-approval',
        'empty-base-url',
        'invalid-base-url',
        'production-host',
        'unknown-host',
        'non-allowlisted-host',
        'non-http-protocol',
        'missing-synthetic-marker',
        'raw-payload-attempt',
        'unsupported-flow',
        'unsupported-route',
        'oversized-payload',
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
        'missing-env-config',
        'staging-url-set-allowed-hosts-missing',
        'staging-url-host-not-in-allowed-hosts',
        'localhost-used-as-deployed-staging',
        'production-like-vercel-url-blocked',
        'approval-host-mismatch',
        'approval-expired-during-run',
        'live-routing-env-flag-attempted',
        'output-replacement-env-flag-attempted',
        'raw-payload-capture-env-flag-attempted',
      ])
    );
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });

  it('detects drift, binding failure, live routing, and stack trace leaks', async () => {
    const rehearsal = new DeployedRouteShadowFailureRehearsal();
    expect((await rehearsal.runCase('drift-detected')).result?.driftDetected).toBe(true);
    expect((await rehearsal.runCase('binding-failure')).result?.failure).toBe(true);
    expect((await rehearsal.runCase('live-routing-enabled-true')).result?.validation.liveRoutingDisabled).toBe(false);
    expect((await rehearsal.runCase('stack-trace-leak')).result?.validation.stackTraceLeakDetected).toBe(true);
    expect((await rehearsal.runCase('production-like-vercel-url-blocked')).result?.verdict).toBe('BLOCKED');
    expect((await rehearsal.runCase('localhost-used-as-deployed-staging')).result?.verdict).toBe('BLOCKED');
  });
});
