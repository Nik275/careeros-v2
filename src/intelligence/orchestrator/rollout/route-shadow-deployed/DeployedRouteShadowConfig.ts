/**
 * @fileoverview Safe defaults for Phase 6.3 deployed staging route shadow.
 */

import type { DeployedRouteShadowConfig, DeployedStagingFeasibility } from './DeployedRouteShadowTypes';

export const DEPLOYED_STAGING_ENV_NAMES = Object.freeze([
  'CAREEROS_STAGING_URL',
  'CAREEROS_STAGING_SHADOW_BASE_URL',
  'NEXT_PUBLIC_STAGING_URL',
  'STAGING_BASE_URL',
  'VERCEL_URL',
  'DEPLOYMENT_URL',
]);

export const DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG: DeployedRouteShadowConfig = Object.freeze({
  enabled: false,
  environment: 'unknown',
  baseUrl: '',
  allowedHosts: Object.freeze([]),
  allowedProtocols: Object.freeze(['https:', 'http:']),
  allowedRoutes: Object.freeze([]),
  allowedFlows: Object.freeze([]),
  requireManualApproval: true,
  requireSyntheticMarker: true,
  requireEnvironmentGuard: true,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireKillSwitchInactive: true,
  requireHttpsForRemote: true,
  maxPayloadBytes: 64 * 1024,
  requestTimeoutMs: 10000,
  maxRequestsPerRoute: 1,
  capturePayloadSummaries: false,
  captureRawPayloads: false,
  allowProductionEnvironment: false,
  allowLiveRouting: false,
  allowOutputReplacement: false,
  allowUnknownHost: false,
  allowProductionHost: false,
});

export const DEPLOYED_STAGING_FEASIBILITY: DeployedStagingFeasibility = Object.freeze({
  status: 'DEPLOYED_STAGING_URL_MISSING',
  executionMode: 'DEPLOYED_STAGING_BLOCKED',
  stagingUrlPresent: false,
  safeHost: false,
  deployedHttpRequestsSent: false,
  evidence: Object.freeze([
    'No approved deployed staging URL was present in CAREEROS_STAGING_URL.',
    'No approved deployed staging URL was present in CAREEROS_STAGING_SHADOW_BASE_URL.',
    'No approved deployed staging URL was present in NEXT_PUBLIC_STAGING_URL.',
    'No approved deployed staging URL was present in STAGING_BASE_URL.',
    'No approved deployed staging URL was present in VERCEL_URL.',
    'No approved deployed staging URL was present in DEPLOYMENT_URL.',
    '.env contains no matching deployed staging URL key.',
  ]),
  limitations: Object.freeze([
    'No deployed HTTP request was sent.',
    'Phase 6.3 cannot claim deployed staging route execution.',
  ]),
});

export function createDeployedRouteShadowConfig(overrides: Partial<DeployedRouteShadowConfig> = {}): DeployedRouteShadowConfig {
  const baseUrl = overrides.baseUrl ?? readConfiguredBaseUrl() ?? DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.baseUrl;
  const config = {
    ...DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG,
    ...overrides,
    baseUrl,
    allowedHosts: overrides.allowedHosts ?? DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowedHosts,
    allowedProtocols: overrides.allowedProtocols ?? DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowedProtocols,
    allowedRoutes: overrides.allowedRoutes ?? DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowedRoutes,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    environment: normalizeDeployedRouteShadowEnvironment(config.environment),
    allowedHosts: Object.freeze([...new Set(config.allowedHosts.map((host) => host.trim().toLowerCase()).filter(Boolean))]),
    allowedProtocols: Object.freeze([...new Set(config.allowedProtocols)]),
    allowedRoutes: Object.freeze([...new Set(config.allowedRoutes)]),
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    maxPayloadBytes: Math.max(0, Math.floor(config.maxPayloadBytes)),
    requestTimeoutMs: Math.max(0, Math.floor(config.requestTimeoutMs)),
    maxRequestsPerRoute: Math.max(0, Math.floor(config.maxRequestsPerRoute)),
    captureRawPayloads: false,
    allowProductionEnvironment: false,
    allowLiveRouting: false,
    allowOutputReplacement: false,
    allowUnknownHost: false,
    allowProductionHost: false,
  });
}

export function normalizeDeployedRouteShadowEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

export function readConfiguredBaseUrl(env: Partial<NodeJS.ProcessEnv> = process.env): string | undefined {
  for (const name of DEPLOYED_STAGING_ENV_NAMES) {
    const value = env[name]?.trim();
    if (value) return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
  }
  return undefined;
}
