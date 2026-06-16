/**
 * @fileoverview Phase 6.5 staging deployment readiness checker.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDeployedStagingApproval } from '../route-shadow-deployed/DeployedStagingApprovalBuilder';
import { loadDeployedStagingEnvConfig } from '../route-shadow-deployed/DeployedStagingEnvConfig';
import { createDeploymentReadinessConfig } from './DeploymentReadinessConfig';
import { discoverDeploymentProvider } from './DeploymentProviderDiscovery';
import type { DeploymentReadinessConfig } from './DeploymentReadinessConfig';
import type {
  DeploymentActivationDecision,
  DeploymentBuildStatus,
  DeploymentReadinessFailure,
  DeploymentReadinessResult,
  DeploymentReadinessStatus,
  DeploymentReadinessVerdict,
  DeploymentRouteStatus,
  DeploymentSafetyStatus,
} from './DeploymentReadinessTypes';

export class DeploymentReadinessChecker {
  private readonly rootDir: string;
  private readonly now: () => string;

  constructor(options: { rootDir?: string; now?: () => string } = {}) {
    this.rootDir = options.rootDir ?? process.cwd();
    this.now = options.now ?? (() => new Date().toISOString());
  }

  check(input: {
    config?: Partial<DeploymentReadinessConfig>;
    env?: Partial<NodeJS.ProcessEnv>;
    buildStatus?: DeploymentBuildStatus;
  } = {}): DeploymentReadinessResult {
    const envConfig = loadDeployedStagingEnvConfig(input.env ?? process.env);
    const approval = buildDeployedStagingApproval(envConfig, { now: this.now() });
    const providerDiscovery = discoverDeploymentProvider(this.rootDir);
    const packageScripts = readPackageScripts(this.rootDir);
    const config = createDeploymentReadinessConfig({
      provider: providerDiscovery.provider,
      environment: envConfig.config.environment,
      ...input.config,
    });
    const failures: DeploymentReadinessFailure[] = [];
    const warnings: string[] = [];
    const missingRoutes = config.requiredRoutes.filter((route) => !existsSync(join(this.rootDir, route)));
    const precheckScriptExists = existsSync(join(this.rootDir, 'scripts/constitutional/verify-staging-shadow-url.ts'));
    const smokeScriptExists = existsSync(join(this.rootDir, 'scripts/constitutional/run-deployed-staging-shadow-smoke.ts'));
    const envExampleExists = existsSync(join(this.rootDir, '.env.staging.shadow.example'));

    if (!config.enabled) warnings.push('Deployment readiness checker is disabled by default; explicit activation is required.');
    if (providerDiscovery.provider === 'UNKNOWN') warnings.push('Deployment provider is unknown.');
    if (providerDiscovery.buildScripts.length === 0) failures.push(failure('missing-build-script', 'No build script is available.', 'high', 'package.json', providerDiscovery.blockers));
    if (!commandHasPackageScript(config.requiredBuildCommand, packageScripts)) failures.push(failure('missing-build-command', `Required build command is not available: ${config.requiredBuildCommand}`, 'high', 'package.json', [`requiredBuildCommand=${config.requiredBuildCommand}`]));
    if (input.buildStatus && input.buildStatus !== 'BUILD_READY' && input.buildStatus !== 'BUILD_NOT_ATTEMPTED_WITH_REASON') failures.push(failure('build-not-ready', `Build status is ${input.buildStatus}.`, 'high', 'build', [`buildStatus=${input.buildStatus}`]));
    if (config.environment === 'production' || config.environment === 'prod' || config.environment === 'live') failures.push(failure('production-environment', 'Production-like environment is blocked.', 'critical', 'environment', [`environment=${config.environment}`]));
    if (config.environment === 'unknown') failures.push(failure('unknown-environment', 'Unknown environment is blocked for deployed smoke activation.', 'high', 'environment', [`environment=${config.environment}`]));
    if (config.requireStagingUrl && !envConfig.config.baseUrl) failures.push(failure('missing-staging-url', 'Staging URL is missing.', 'high', 'env', ['CAREEROS_STAGING_SHADOW_BASE_URL=missing']));
    if (config.requireAllowedHosts && envConfig.summary.allowedHostsCount === 0) failures.push(failure('missing-allowed-hosts', 'Allowed hosts are missing.', 'high', 'env', ['CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS=missing']));
    if (config.requireManualApproval && !envConfig.summary.approvalPresent) failures.push(failure('missing-approval', 'Manual approval fields are missing.', 'high', 'env', ['approval=missing']));
    if (!envConfig.validation.valid && envConfig.config.baseUrl) failures.push(failure('unsafe-host', envConfig.validation.reason, 'critical', 'host-guard', envConfig.validation.evidence));
    if (envConfig.summary.allowLiveRouting) failures.push(failure('live-routing-enabled', 'Live routing flag is forbidden.', 'critical', 'env', ['CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING=true']));
    if (envConfig.summary.allowOutputReplacement) failures.push(failure('output-replacement-enabled', 'Output replacement flag is forbidden.', 'critical', 'env', ['CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT=true']));
    if (envConfig.summary.captureRawPayloads) failures.push(failure('raw-payload-capture-enabled', 'Raw payload capture flag is forbidden.', 'critical', 'env', ['CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS=true']));
    if (approval.status !== 'APPROVAL_READY' && envConfig.config.baseUrl) failures.push(failure('approval-not-ready', approval.reason, 'high', 'approval', approval.evidence));
    for (const route of missingRoutes) failures.push(failure('missing-route', `Required internal route is missing: ${route}`, 'critical', 'routes', [route]));
    if (!precheckScriptExists) failures.push(failure('precheck-script-missing', 'Staging URL precheck script is missing.', 'high', 'scripts', ['scripts/constitutional/verify-staging-shadow-url.ts']));
    if (!smokeScriptExists) failures.push(failure('smoke-script-missing', 'Deployed smoke script is missing.', 'high', 'scripts', ['scripts/constitutional/run-deployed-staging-shadow-smoke.ts']));
    if (!envExampleExists) failures.push(failure('env-example-missing', 'Staging shadow env example is missing.', 'medium', 'env', ['.env.staging.shadow.example']));

    const routeStatus: DeploymentRouteStatus = missingRoutes.length === 0 && precheckScriptExists && smokeScriptExists && envExampleExists ? 'READY' : 'BLOCKED';
    const safetyStatus: DeploymentSafetyStatus = failures.some((entry) => entry.severity === 'critical') ? 'FAILED' : failures.length > 0 ? 'BLOCKED' : 'READY';
    const envStatus = envConfig.valid && approval.valid ? 'READY' : envConfig.config.baseUrl ? 'BLOCKED' : 'BLOCKED';
    const activationDecision = activationFor(failures, routeStatus, safetyStatus);
    const verdict = verdictFor(failures, warnings, activationDecision);
    const status = statusFor(verdict);

    return Object.freeze({
      resultId: `deployment-readiness-${hashString(`${this.now()}|${providerDiscovery.provider}|${envConfig.summary.baseUrlSummary}`)}`,
      status,
      verdict,
      activationDecision,
      provider: providerDiscovery.provider,
      buildStatus: input.buildStatus ?? 'BUILD_NOT_ATTEMPTED_WITH_REASON',
      envStatus,
      routeStatus,
      safetyStatus,
      stagingUrlConfigured: Boolean(envConfig.config.baseUrl),
      allowedHostsConfigured: envConfig.summary.allowedHostsCount > 0,
      approvalConfigured: envConfig.summary.approvalPresent,
      precheckScriptExists,
      smokeScriptExists,
      envExampleExists,
      requiredRoutes: config.requiredRoutes,
      missingRoutes: Object.freeze(missingRoutes),
      failures: Object.freeze(failures),
      warnings: Object.freeze(warnings),
      deployedHttpRequestsSent: false,
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
      generatedAt: this.now(),
    });
  }
}

function activationFor(
  failures: readonly DeploymentReadinessFailure[],
  routeStatus: DeploymentRouteStatus,
  safetyStatus: DeploymentSafetyStatus
): DeploymentActivationDecision {
  if (routeStatus !== 'READY') return 'BLOCKED_BY_ROUTES';
  if (safetyStatus === 'FAILED') return 'BLOCKED_BY_SAFETY';
  if (failures.some((entry) => entry.failureId.includes('build'))) return 'BLOCKED_BY_BUILD';
  if (failures.length > 0) return 'BLOCKED_BY_CONFIG';
  return 'READY_FOR_DEPLOYED_SMOKE';
}

function verdictFor(
  failures: readonly DeploymentReadinessFailure[],
  warnings: readonly string[],
  activationDecision: DeploymentActivationDecision
): DeploymentReadinessVerdict {
  if (failures.some((entry) => entry.severity === 'critical')) return 'FAIL';
  if (activationDecision !== 'READY_FOR_DEPLOYED_SMOKE') return 'BLOCKED';
  return warnings.length > 0 ? 'PASS_WITH_WARNINGS' : 'PASS';
}

function statusFor(verdict: DeploymentReadinessVerdict): DeploymentReadinessStatus {
  if (verdict === 'PASS') return 'READY';
  if (verdict === 'PASS_WITH_WARNINGS') return 'READY_WITH_WARNINGS';
  if (verdict === 'FAIL') return 'FAILED';
  return 'BLOCKED';
}

function failure(failureId: string, reason: string, severity: DeploymentReadinessFailure['severity'], source: string, evidence: readonly string[]): DeploymentReadinessFailure {
  return Object.freeze({
    failureId,
    reason,
    severity,
    source,
    evidence: Object.freeze([...evidence]),
  });
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function readPackageScripts(rootDir: string): Record<string, string> {
  try {
    const parsed = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
}

function commandHasPackageScript(command: string, scripts: Record<string, string>): boolean {
  const match = command.trim().match(/^npm\s+run\s+([A-Za-z0-9:_-]+)$/);
  if (!match) return true;
  return Boolean(scripts[match[1]]);
}
