/**
 * @fileoverview Phase 6.4 staging shadow environment contract loader.
 */

import { createDeployedRouteShadowConfig } from './DeployedRouteShadowConfig';
import {
  ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH,
  CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH,
} from './DeployedRouteShadowPayloadFactory';
import { normalizeHosts, validateStagingUrl } from './StagingUrlValidator';
import type { DeployedRouteShadowConfig } from './DeployedRouteShadowTypes';
import type { StagingUrlValidationDecision } from './StagingUrlValidator';

export const STAGING_SHADOW_ENV_KEYS = Object.freeze({
  baseUrl: 'CAREEROS_STAGING_SHADOW_BASE_URL',
  allowedHosts: 'CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS',
  environment: 'CAREEROS_STAGING_SHADOW_ENVIRONMENT',
  approvalId: 'CAREEROS_STAGING_SHADOW_APPROVAL_ID',
  approvedBy: 'CAREEROS_STAGING_SHADOW_APPROVED_BY',
  approvalReason: 'CAREEROS_STAGING_SHADOW_APPROVAL_REASON',
  approvalExpiresAt: 'CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT',
  maxRequests: 'CAREEROS_STAGING_SHADOW_MAX_REQUESTS',
  captureRawPayloads: 'CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS',
  allowLiveRouting: 'CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING',
  allowOutputReplacement: 'CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT',
});

export type StagingShadowEnvironment = 'staging' | 'preview' | 'development' | 'test';

export interface DeployedStagingEnvApprovalInput {
  approvalId: string;
  approvedBy: string;
  reason: string;
  expiresAt?: string;
}

export interface DeployedStagingEnvConfigSummary {
  baseUrlSummary: string;
  host?: string;
  environment: string;
  allowedHostsCount: number;
  allowedHostsSummary: readonly string[];
  approvalPresent: boolean;
  approvalIdPresent: boolean;
  approvedByPresent: boolean;
  approvalReasonPresent: boolean;
  maxRequests: number;
  captureRawPayloads: boolean;
  allowLiveRouting: boolean;
  allowOutputReplacement: boolean;
  configuredRoutes: readonly string[];
  configuredFlows: readonly string[];
}

export interface DeployedStagingEnvConfigResult {
  valid: boolean;
  config: DeployedRouteShadowConfig;
  validation: StagingUrlValidationDecision;
  approval: DeployedStagingEnvApprovalInput | undefined;
  summary: DeployedStagingEnvConfigSummary;
  errors: readonly string[];
  warnings: readonly string[];
}

export function loadDeployedStagingEnvConfig(env: Partial<NodeJS.ProcessEnv> = process.env): DeployedStagingEnvConfigResult {
  const baseUrl = readEnv(env, STAGING_SHADOW_ENV_KEYS.baseUrl);
  const allowedHosts = normalizeHosts(parseList(readEnv(env, STAGING_SHADOW_ENV_KEYS.allowedHosts)));
  const environment = normalizeEnvironment(readEnv(env, STAGING_SHADOW_ENV_KEYS.environment));
  const maxRequests = readPositiveInteger(readEnv(env, STAGING_SHADOW_ENV_KEYS.maxRequests), 2);
  const captureRawPayloads = readBoolean(readEnv(env, STAGING_SHADOW_ENV_KEYS.captureRawPayloads), false);
  const allowLiveRouting = readBoolean(readEnv(env, STAGING_SHADOW_ENV_KEYS.allowLiveRouting), false);
  const allowOutputReplacement = readBoolean(readEnv(env, STAGING_SHADOW_ENV_KEYS.allowOutputReplacement), false);

  const config = createDeployedRouteShadowConfig({
    enabled: true,
    environment,
    baseUrl,
    allowedHosts,
    allowedRoutes: [ASSESSMENT_DEPLOYED_ROUTE_SHADOW_PATH, CAREER_FIT_DEPLOYED_ROUTE_SHADOW_PATH],
    allowedFlows: ['assessment', 'career-fit'],
    maxRequestsPerRoute: maxRequests,
    captureRawPayloads,
    allowLiveRouting,
    allowOutputReplacement,
  });
  const validation = validateStagingUrl({
    baseUrl: config.baseUrl,
    allowedHosts: config.allowedHosts,
    allowedProtocols: config.allowedProtocols,
    requireHttpsForRemote: config.requireHttpsForRemote,
  });
  const approvalId = readEnv(env, STAGING_SHADOW_ENV_KEYS.approvalId);
  const approvedBy = readEnv(env, STAGING_SHADOW_ENV_KEYS.approvedBy);
  const reason = readEnv(env, STAGING_SHADOW_ENV_KEYS.approvalReason);
  const expiresAt = readEnv(env, STAGING_SHADOW_ENV_KEYS.approvalExpiresAt);
  const approval =
    approvalId && approvedBy && reason
      ? Object.freeze({ approvalId, approvedBy, reason, expiresAt: expiresAt || undefined })
      : undefined;

  const errors: string[] = [];
  const warnings: string[] = [];
  if (!baseUrl) errors.push('CAREEROS_STAGING_SHADOW_BASE_URL is missing.');
  if (!validation.valid) errors.push(validation.reason);
  if (!isAllowedEnvironment(environment)) errors.push(`CAREEROS_STAGING_SHADOW_ENVIRONMENT is not allowed: ${environment || '<empty>'}.`);
  if (environment === 'production' || environment === 'prod' || environment === 'live' || environment === 'unknown') errors.push('Production, live, prod, and unknown environments are blocked.');
  if (allowedHosts.length === 0 && baseUrl) errors.push('CAREEROS_STAGING_SHADOW_ALLOWED_HOSTS is missing.');
  if (captureRawPayloads) errors.push('Raw payload capture is forbidden for deployed staging shadow.');
  if (allowLiveRouting) errors.push('Live routing is forbidden for deployed staging shadow.');
  if (allowOutputReplacement) errors.push('Output replacement is forbidden for deployed staging shadow.');
  if (!approvalId) errors.push('CAREEROS_STAGING_SHADOW_APPROVAL_ID is missing.');
  if (!approvedBy) errors.push('CAREEROS_STAGING_SHADOW_APPROVED_BY is missing.');
  if (!reason) errors.push('CAREEROS_STAGING_SHADOW_APPROVAL_REASON is missing.');
  if (!expiresAt) warnings.push('CAREEROS_STAGING_SHADOW_APPROVAL_EXPIRES_AT is missing; approval builder will use a short default expiry.');

  return Object.freeze({
    valid: errors.length === 0,
    config,
    validation,
    approval,
    summary: Object.freeze({
      baseUrlSummary: validation.baseUrlSummary,
      host: validation.host,
      environment,
      allowedHostsCount: allowedHosts.length,
      allowedHostsSummary: Object.freeze(allowedHosts.map(redactHost)),
      approvalPresent: approval !== undefined,
      approvalIdPresent: Boolean(approvalId),
      approvedByPresent: Boolean(approvedBy),
      approvalReasonPresent: Boolean(reason),
      maxRequests,
      captureRawPayloads,
      allowLiveRouting,
      allowOutputReplacement,
      configuredRoutes: config.allowedRoutes,
      configuredFlows: config.allowedFlows,
    }),
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}

export function isAllowedEnvironment(environment: string): environment is StagingShadowEnvironment {
  return environment === 'staging' || environment === 'preview' || environment === 'development' || environment === 'test';
}

function normalizeEnvironment(value: string): string {
  return value.trim().toLowerCase() || 'unknown';
}

function readEnv(env: Partial<NodeJS.ProcessEnv>, key: string): string {
  return (env[key] ?? '').trim();
}

function parseList(value: string): readonly string[] {
  return value.split(/[,\s;]+/).map((entry) => entry.trim()).filter(Boolean);
}

function readBoolean(value: string, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function readPositiveInteger(value: string, defaultValue: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

function redactHost(host: string): string {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  return `${parts[0]}.${parts.slice(1).join('.')}`;
}
