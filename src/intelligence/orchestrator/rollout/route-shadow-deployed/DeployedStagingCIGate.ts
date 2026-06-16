/**
 * @fileoverview Phase 6.4 CI safety gate for deployed staging shadow config.
 */

import { loadDeployedStagingEnvConfig } from './DeployedStagingEnvConfig';
import type { DeployedStagingEnvConfigSummary } from './DeployedStagingEnvConfig';
import type { DeployedRouteShadowRun } from './DeployedRouteShadowTypes';

export type DeployedStagingCIGateStatus = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';

export interface DeployedStagingCIGateResult {
  status: DeployedStagingCIGateStatus;
  reason: string;
  stagingUrlConfigured: boolean;
  smokeRequired: boolean;
  smokePassed: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  summary: DeployedStagingEnvConfigSummary;
}

export function evaluateDeployedStagingCIGate(input: {
  env?: Partial<NodeJS.ProcessEnv>;
  smokeRun?: DeployedRouteShadowRun;
} = {}): DeployedStagingCIGateResult {
  const envConfig = loadDeployedStagingEnvConfig(input.env ?? process.env);
  const env = input.env ?? process.env;
  const stagingUrlConfigured = Boolean(envConfig.config.baseUrl);
  const errors = [...envConfig.errors];
  const warnings = [...envConfig.warnings];

  if (!stagingUrlConfigured) {
    const configuredEnvironment = (env.CAREEROS_STAGING_SHADOW_ENVIRONMENT ?? '').trim().toLowerCase();
    const unsafeWithoutUrl = errors.filter((error) => error.includes('Live routing') || error.includes('Raw payload') || error.includes('Output replacement'));
    if (configuredEnvironment === 'production' || configuredEnvironment === 'prod' || configuredEnvironment === 'live') {
      unsafeWithoutUrl.push('Production-like staging shadow environment is configured.');
    }
    if (unsafeWithoutUrl.length > 0) {
      return result('FAIL', 'Unsafe staging shadow config is present even though no staging URL is configured.', stagingUrlConfigured, false, false, unsafeWithoutUrl, warnings, envConfig.summary);
    }
    return result('PASS_WITH_WARNINGS', 'Staging shadow URL is missing; CI passes with warnings because no unsafe host can be called.', stagingUrlConfigured, false, false, [], ['CAREEROS_STAGING_SHADOW_BASE_URL is missing.', ...warnings], envConfig.summary);
  }

  if (errors.length > 0) {
    return result('FAIL', 'Staging shadow config is unsafe.', stagingUrlConfigured, true, false, errors, warnings, envConfig.summary);
  }

  const smokeRun = input.smokeRun;
  if (!smokeRun) {
    return result('BLOCKED', 'Safe staging URL is configured, but deployed smoke execution has not run.', stagingUrlConfigured, true, false, [], warnings, envConfig.summary);
  }
  if (
    smokeRun.executionMode !== 'DEPLOYED_STAGING_HTTP' ||
    smokeRun.verdict === 'FAIL' ||
    smokeRun.verdict === 'BLOCKED' ||
    smokeRun.metrics.driftCount > 0 ||
    smokeRun.metrics.failedCount > 0 ||
    smokeRun.metrics.rollbackCount > 0 ||
    smokeRun.metrics.liveRoutingEnabledCount > 0 ||
    !smokeRun.deployedHttpRequestsSent
  ) {
    return result('FAIL', 'Deployed staging smoke execution did not pass safety requirements.', stagingUrlConfigured, true, false, [], warnings, envConfig.summary);
  }

  return result('PASS', 'Safe staging URL is configured and deployed smoke execution passed.', stagingUrlConfigured, true, true, [], warnings, envConfig.summary);
}

function result(
  status: DeployedStagingCIGateStatus,
  reason: string,
  stagingUrlConfigured: boolean,
  smokeRequired: boolean,
  smokePassed: boolean,
  errors: readonly string[],
  warnings: readonly string[],
  summary: DeployedStagingEnvConfigSummary
): DeployedStagingCIGateResult {
  return Object.freeze({
    status,
    reason,
    stagingUrlConfigured,
    smokeRequired,
    smokePassed,
    errors: Object.freeze([...errors]),
    warnings: Object.freeze([...warnings]),
    summary,
  });
}
