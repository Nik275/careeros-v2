import { describe, expect, it } from 'vitest';
import { DeploymentReadinessFailureRehearsal } from '../DeploymentReadinessFailureRehearsal';

describe('DeploymentReadinessFailureRehearsal', () => {
  it('covers all required Phase 6.5 deployment readiness failure cases safely', () => {
    const results = new DeploymentReadinessFailureRehearsal().runAll();

    expect(results).toHaveLength(20);
    expect(new Set(results.map((result) => result.caseName))).toEqual(new Set([
      'missing-deployment-provider',
      'unknown-provider',
      'missing-build-script',
      'failing-build-command',
      'missing-internal-route-files',
      'missing-staging-url',
      'missing-allowed-hosts',
      'missing-approval-fields',
      'production-environment',
      'unknown-environment',
      'production-host',
      'unknown-host',
      'localhost-used-as-deployed-url',
      'live-routing-enabled',
      'output-replacement-enabled',
      'raw-payload-capture-enabled',
      'smoke-script-missing',
      'precheck-script-missing',
      'env-example-missing',
      'staging-url-configured-but-host-not-allowlisted',
    ]));
    expect(results.every((result) => result.handledSafely)).toBe(true);
    expect(results.every((result) => result.liveRoutingEnabled === false)).toBe(true);
  });
});
