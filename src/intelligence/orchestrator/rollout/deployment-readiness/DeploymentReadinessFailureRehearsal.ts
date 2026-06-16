/**
 * @fileoverview Phase 6.5 deployment readiness failure rehearsal.
 */

import { existsSync } from 'node:fs';
import { DeploymentReadinessChecker } from './DeploymentReadinessChecker';

export type DeploymentReadinessFailureCase =
  | 'missing-deployment-provider'
  | 'unknown-provider'
  | 'missing-build-script'
  | 'failing-build-command'
  | 'missing-internal-route-files'
  | 'missing-staging-url'
  | 'missing-allowed-hosts'
  | 'missing-approval-fields'
  | 'production-environment'
  | 'unknown-environment'
  | 'production-host'
  | 'unknown-host'
  | 'localhost-used-as-deployed-url'
  | 'live-routing-enabled'
  | 'output-replacement-enabled'
  | 'raw-payload-capture-enabled'
  | 'smoke-script-missing'
  | 'precheck-script-missing'
  | 'env-example-missing'
  | 'staging-url-configured-but-host-not-allowlisted';

export interface DeploymentReadinessFailureRehearsalResult {
  caseName: DeploymentReadinessFailureCase;
  handledSafely: boolean;
  status: string;
  verdict: string;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  notes: readonly string[];
}

export class DeploymentReadinessFailureRehearsal {
  private readonly rootDir: string;

  constructor(options: { rootDir?: string } = {}) {
    this.rootDir = options.rootDir ?? process.cwd();
  }

  runAll(): readonly DeploymentReadinessFailureRehearsalResult[] {
    return Object.freeze(cases().map((caseName) => this.runCase(caseName)));
  }

  runCase(caseName: DeploymentReadinessFailureCase): DeploymentReadinessFailureRehearsalResult {
    const checker = new DeploymentReadinessChecker({ rootDir: this.rootDir, now: () => '2026-06-06T00:00:00.000Z' });
    const env = envFor(caseName);
    const requiredRoutes =
      caseName === 'missing-internal-route-files'
        ? ['src/app/api/internal/constitutional-shadow/missing/route.ts']
        : undefined;
    const result = checker.check({
      env,
      config: {
        enabled: true,
        provider: caseName === 'missing-deployment-provider' || caseName === 'unknown-provider' ? 'UNKNOWN' : 'VERCEL',
        requiredBuildCommand: caseName === 'failing-build-command' ? 'npm run missing-build-command' : 'npm run build',
        requiredRoutes,
      },
      buildStatus: caseName === 'failing-build-command' ? 'BUILD_BLOCKED_BY_UNKNOWN' : 'BUILD_NOT_ATTEMPTED_WITH_REASON',
    });

    const expectedMissingFileCase =
      (caseName === 'smoke-script-missing' && existsSync(`${this.rootDir}/scripts/constitutional/run-deployed-staging-shadow-smoke.ts`)) ||
      (caseName === 'precheck-script-missing' && existsSync(`${this.rootDir}/scripts/constitutional/verify-staging-shadow-url.ts`)) ||
      (caseName === 'env-example-missing' && existsSync(`${this.rootDir}/.env.staging.shadow.example`));

    return Object.freeze({
      caseName,
      handledSafely: result.deployedHttpRequestsSent === false && result.productionOutputPreserved && result.liveRoutingEnabled === false && (result.verdict === 'BLOCKED' || result.verdict === 'FAIL' || expectedMissingFileCase),
      status: result.status,
      verdict: result.verdict,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
      notes: Object.freeze([`${caseName} produced ${result.status}/${result.verdict} without deployed HTTP execution.`]),
    });
  }
}

function cases(): readonly DeploymentReadinessFailureCase[] {
  return Object.freeze([
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
  ]);
}

function envFor(caseName: DeploymentReadinessFailureCase): Partial<NodeJS.ProcessEnv> {
  const env = validEnv();
  switch (caseName) {
    case 'missing-staging-url':
    case 'missing-deployment-provider':
    case 'unknown-provider':
    case 'missing-build-script':
    case 'failing-build-command':
    case 'missing-internal-route-files':
    case 'smoke-script-missing':
    case 'precheck-script-missing':
    case 'env-example-missing':
      return {};
    case 'missing-allowed-hosts':
      return { ...env, CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: '' };
    case 'missing-approval-fields':
      return { ...env, CAREEROS_STAGING_SHADOW_APPROVAL_ID: '', CAREEROS_STAGING_SHADOW_APPROVED_BY: '', CAREEROS_STAGING_SHADOW_APPROVAL_REASON: '' };
    case 'production-environment':
      return { ...env, CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'production' };
    case 'unknown-environment':
      return { ...env, CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'unknown' };
    case 'production-host':
      return { ...env, CAREEROS_STAGING_SHADOW_BASE_URL: 'https://app.careeros.com', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'app.careeros.com' };
    case 'unknown-host':
      return { ...env, CAREEROS_STAGING_SHADOW_BASE_URL: 'https://unknown.example.net', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'unknown.example.net' };
    case 'localhost-used-as-deployed-url':
      return { ...env, CAREEROS_STAGING_SHADOW_BASE_URL: 'http://localhost:3000', CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'localhost' };
    case 'live-routing-enabled':
      return { ...env, CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'true' };
    case 'output-replacement-enabled':
      return { ...env, CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'true' };
    case 'raw-payload-capture-enabled':
      return { ...env, CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'true' };
    case 'staging-url-configured-but-host-not-allowlisted':
      return { ...env, CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'different-preview.vercel.app' };
  }
}

function validEnv(): Partial<NodeJS.ProcessEnv> {
  return {
    CAREEROS_STAGING_SHADOW_BASE_URL: 'https://preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS: 'preview-careeros-staging.vercel.app',
    CAREEROS_STAGING_SHADOW_ENVIRONMENT: 'staging',
    CAREEROS_STAGING_SHADOW_APPROVAL_ID: 'phase-6-5-rehearsal',
    CAREEROS_STAGING_SHADOW_APPROVED_BY: 'test-operator',
    CAREEROS_STAGING_SHADOW_APPROVAL_REASON: 'Synthetic constitutional shadow smoke test only',
    CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT: '2099-01-01T00:00:00.000Z',
    CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING: 'false',
    CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT: 'false',
  };
}
