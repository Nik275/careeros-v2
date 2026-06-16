/**
 * @fileoverview Phase 6.5 staging deployment readiness contracts.
 */

export type DeploymentProvider =
  | 'VERCEL'
  | 'NETLIFY'
  | 'RAILWAY'
  | 'RENDER'
  | 'DOCKER'
  | 'CUSTOM_NODE'
  | 'UNKNOWN';

export type DeploymentReadinessStatus = 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED' | 'FAILED' | 'UNKNOWN';
export type DeploymentEnvStatus = DeploymentReadinessStatus;
export type DeploymentRouteStatus = DeploymentReadinessStatus;
export type DeploymentSafetyStatus = DeploymentReadinessStatus;
export type DeploymentReadinessVerdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'BLOCKED';
export type DeploymentActivationDecision = 'READY_FOR_DEPLOYED_SMOKE' | 'BLOCKED_BY_CONFIG' | 'BLOCKED_BY_BUILD' | 'BLOCKED_BY_ROUTES' | 'BLOCKED_BY_SAFETY';

export type DeploymentBuildStatus =
  | 'BUILD_READY'
  | 'BUILD_BLOCKED_BY_TYPESCRIPT'
  | 'BUILD_BLOCKED_BY_ENV'
  | 'BUILD_BLOCKED_BY_ROUTE_ERROR'
  | 'BUILD_BLOCKED_BY_DEPENDENCY'
  | 'BUILD_BLOCKED_BY_UNKNOWN'
  | 'BUILD_NOT_ATTEMPTED_WITH_REASON';

export interface DeploymentProviderDiscovery {
  provider: DeploymentProvider;
  evidence: readonly string[];
  buildScripts: readonly string[];
  startScripts: readonly string[];
  deploymentFiles: readonly string[];
  blockers: readonly string[];
}

export interface DeploymentReadinessFailure {
  failureId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  evidence: readonly string[];
}

export interface DeploymentReadinessResult {
  resultId: string;
  status: DeploymentReadinessStatus;
  verdict: DeploymentReadinessVerdict;
  activationDecision: DeploymentActivationDecision;
  provider: DeploymentProvider;
  buildStatus: DeploymentBuildStatus;
  envStatus: DeploymentEnvStatus;
  routeStatus: DeploymentRouteStatus;
  safetyStatus: DeploymentSafetyStatus;
  stagingUrlConfigured: boolean;
  allowedHostsConfigured: boolean;
  approvalConfigured: boolean;
  precheckScriptExists: boolean;
  smokeScriptExists: boolean;
  envExampleExists: boolean;
  requiredRoutes: readonly string[];
  missingRoutes: readonly string[];
  failures: readonly DeploymentReadinessFailure[];
  warnings: readonly string[];
  deployedHttpRequestsSent: false;
  productionOutputPreserved: true;
  liveRoutingEnabled: false;
  generatedAt: string;
}
