/**
 * @fileoverview Phase 6.5 staging deployment readiness config.
 */

import type { DeploymentProvider } from './DeploymentReadinessTypes';

export interface DeploymentReadinessConfig {
  enabled: boolean;
  environment: string;
  provider: DeploymentProvider;
  requiredBuildCommand: string;
  requiredStartCommand: string;
  requiredEnvVars: readonly string[];
  requiredRoutes: readonly string[];
  requireStagingUrl: boolean;
  requireAllowedHosts: boolean;
  requireManualApproval: boolean;
  requireSyntheticMarker: boolean;
  requireLiveRoutingDisabled: boolean;
  requireOutputReplacementDisabled: boolean;
  requireRawPayloadCaptureDisabled: boolean;
  allowProductionEnvironment: boolean;
  allowProductionHost: boolean;
  allowUnknownHost: boolean;
}

export const DEFAULT_DEPLOYMENT_READINESS_CONFIG: DeploymentReadinessConfig = Object.freeze({
  enabled: false,
  environment: 'unknown',
  provider: 'UNKNOWN',
  requiredBuildCommand: 'npm run build',
  requiredStartCommand: 'npm run start',
  requiredEnvVars: Object.freeze([
    'CAREEROS_STAGING_SHADOW_BASE_URL',
    'CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS',
    'CAREEROS_STAGING_SHADOW_ENVIRONMENT',
    'CAREEROS_STAGING_SHADOW_APPROVAL_ID',
    'CAREEROS_STAGING_SHADOW_APPROVED_BY',
    'CAREEROS_STAGING_SHADOW_APPROVAL_REASON',
  ]),
  requiredRoutes: Object.freeze([
    'src/app/api/internal/constitutional-shadow/assessment/route.ts',
    'src/app/api/internal/constitutional-shadow/career-fit/route.ts',
  ]),
  requireStagingUrl: true,
  requireAllowedHosts: true,
  requireManualApproval: true,
  requireSyntheticMarker: true,
  requireLiveRoutingDisabled: true,
  requireOutputReplacementDisabled: true,
  requireRawPayloadCaptureDisabled: true,
  allowProductionEnvironment: false,
  allowProductionHost: false,
  allowUnknownHost: false,
});

export function createDeploymentReadinessConfig(overrides: Partial<DeploymentReadinessConfig> = {}): DeploymentReadinessConfig {
  const config = {
    ...DEFAULT_DEPLOYMENT_READINESS_CONFIG,
    ...overrides,
  };
  return Object.freeze({
    ...config,
    environment: normalizeEnvironment(config.environment),
    requiredEnvVars: Object.freeze([...new Set(config.requiredEnvVars)]),
    requiredRoutes: Object.freeze([...new Set(config.requiredRoutes)]),
    allowProductionEnvironment: false,
    allowProductionHost: false,
    allowUnknownHost: false,
  });
}

export function normalizeEnvironment(environment: string | undefined): string {
  return (environment ?? 'unknown').trim().toLowerCase() || 'unknown';
}
