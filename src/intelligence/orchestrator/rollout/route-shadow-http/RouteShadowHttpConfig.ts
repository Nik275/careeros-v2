/**
 * @fileoverview Safe defaults for Phase 6.1 HTTP-style route-shadow harness.
 */

import type {
  RouteShadowHttpConfig,
  RouteShadowHttpExecutionFeasibility,
  RouteShadowHttpExecutionMode,
} from './RouteShadowHttpTypes';

export const DEFAULT_ROUTE_SHADOW_HTTP_CONFIG: RouteShadowHttpConfig = Object.freeze({
  enabled: false,
  environment: 'unknown',
  allowedEnvironments: Object.freeze(['local', 'development', 'test', 'staging']),
  executionMode: 'ROUTE_HANDLER_REQUEST_SIMULATION',
  allowedRoutes: Object.freeze([]),
  allowedFlows: Object.freeze([]),
  requireManualApproval: true,
  requireSyntheticMarker: true,
  requireEnvironmentGuard: true,
  requireParityGate: true,
  requirePrivacyGate: true,
  requireTelemetryHealth: true,
  requireKillSwitchInactive: true,
  maxPayloadBytes: 64 * 1024,
  maxRequestsPerRoute: 1,
  capturePayloadSummaries: false,
  captureRawPayloads: false,
  allowProductionEnvironment: false,
  allowLiveRouting: false,
  allowOutputReplacement: false,
});

export const ROUTE_SHADOW_HTTP_EXECUTION_FEASIBILITY: RouteShadowHttpExecutionFeasibility = Object.freeze({
  executionMode: 'ROUTE_HANDLER_REQUEST_SIMULATION',
  realHttpServerSupported: false,
  routeHandlerRequestSimulationSupported: true,
  directHandlerOnly: false,
  evidence: Object.freeze([
    'package.json exposes next dev/start scripts, but the repository has no dedicated Next HTTP server test fixture.',
    'vitest.config.ts includes src/intelligence/** tests and does not include src/app/** route tests.',
    'Phase 6.0 route handlers can be imported and exercised with standard Request/Response objects from the rollout test tree.',
    'A local next dev probe was attempted for Phase 6.1 and did not produce a stable HTTP result within the validation window.',
  ]),
  limitations: Object.freeze([
    'Real local/staging HTTP server execution is not claimed by Phase 6.1.',
    'The strongest stable repository-supported execution mode is route-handler Request/Response simulation.',
  ]),
});

export function createRouteShadowHttpConfig(overrides: Partial<RouteShadowHttpConfig> = {}): RouteShadowHttpConfig {
  const config = {
    ...DEFAULT_ROUTE_SHADOW_HTTP_CONFIG,
    ...overrides,
    allowedEnvironments: overrides.allowedEnvironments ?? DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowedEnvironments,
    allowedRoutes: overrides.allowedRoutes ?? DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowedRoutes,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    environment: normalizeRouteShadowHttpEnvironment(config.environment),
    allowedEnvironments: Object.freeze([...new Set(config.allowedEnvironments.map(normalizeRouteShadowHttpEnvironment))]),
    executionMode: normalizeExecutionMode(config.executionMode),
    allowedRoutes: Object.freeze([...new Set(config.allowedRoutes)]),
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    maxPayloadBytes: Math.max(0, Math.floor(config.maxPayloadBytes)),
    maxRequestsPerRoute: Math.max(0, Math.floor(config.maxRequestsPerRoute)),
    captureRawPayloads: false,
    allowProductionEnvironment: false,
    allowLiveRouting: false,
    allowOutputReplacement: false,
    baseUrl: config.baseUrl,
  });
}

export function normalizeRouteShadowHttpEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

function normalizeExecutionMode(mode: RouteShadowHttpExecutionMode | undefined): RouteShadowHttpExecutionMode {
  if (mode === 'REAL_HTTP_SERVER' || mode === 'ROUTE_HANDLER_REQUEST_SIMULATION' || mode === 'DIRECT_HANDLER_FALLBACK') {
    return mode;
  }
  return DEFAULT_ROUTE_SHADOW_HTTP_CONFIG.executionMode;
}

