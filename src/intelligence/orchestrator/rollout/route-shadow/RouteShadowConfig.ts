/**
 * @fileoverview Safe defaults for Phase 6.0 route-shadow endpoint pilot.
 */

import type { RouteShadowConfig } from './RouteShadowTypes';

export const DEFAULT_ROUTE_SHADOW_CONFIG: RouteShadowConfig = Object.freeze({
  enabled: false,
  environment: 'unknown',
  allowedEnvironments: Object.freeze(['local', 'development', 'test', 'staging']),
  allowedFlows: Object.freeze([]),
  requireManualApproval: true,
  requireEnvironmentGuard: true,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireKillSwitchInactive: true,
  maxPayloadBytes: 64 * 1024,
  capturePayloadSummaries: false,
  captureRawPayloads: false,
  allowProductionEnvironment: false,
  allowLiveRouting: false,
  allowOutputReplacement: false,
});

export function createRouteShadowConfig(overrides: Partial<RouteShadowConfig> = {}): RouteShadowConfig {
  const config = {
    ...DEFAULT_ROUTE_SHADOW_CONFIG,
    ...overrides,
    allowedEnvironments: overrides.allowedEnvironments ?? DEFAULT_ROUTE_SHADOW_CONFIG.allowedEnvironments,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_ROUTE_SHADOW_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    environment: normalizeEnvironment(config.environment),
    allowedEnvironments: Object.freeze([...new Set(config.allowedEnvironments.map(normalizeEnvironment))]),
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    maxPayloadBytes: Math.max(0, Math.floor(config.maxPayloadBytes)),
    captureRawPayloads: false,
    allowProductionEnvironment: false,
    allowLiveRouting: false,
    allowOutputReplacement: false,
  });
}

export function normalizeRouteShadowEnvironment(environment: string | undefined): string {
  return normalizeEnvironment(environment);
}

function normalizeEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}
