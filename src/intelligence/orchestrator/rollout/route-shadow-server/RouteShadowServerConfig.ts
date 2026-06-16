/**
 * @fileoverview Safe defaults for Phase 6.2 real HTTP server route shadow.
 */

import type {
  RouteShadowServerConfig,
  RouteShadowServerFeasibility,
} from './RouteShadowServerTypes';

export const DEFAULT_ROUTE_SHADOW_SERVER_CONFIG: RouteShadowServerConfig = Object.freeze({
  enabled: false,
  environment: 'unknown',
  allowedEnvironments: Object.freeze(['local', 'development', 'test', 'staging']),
  baseUrl: 'http://127.0.0.1:3000',
  port: 3000,
  serverStartCommand: Object.freeze(['cmd.exe', '/c', 'npx', 'next', 'dev', '--hostname', '127.0.0.1', '--port', '3000']),
  serverReadyTimeoutMs: 30000,
  requestTimeoutMs: 10000,
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
  startServer: true,
});

export const ROUTE_SHADOW_SERVER_FEASIBILITY: RouteShadowServerFeasibility = Object.freeze({
  status: 'REAL_HTTP_SERVER_SUPPORTED',
  executionMode: 'REAL_HTTP_SERVER',
  commandAvailable: true,
  canStartServer: true,
  canDetectReadiness: true,
  canPostSyntheticPayloads: true,
  canShutdownCleanly: true,
  evidence: Object.freeze([
    'package.json exposes next dev/start commands.',
    'Controlled Phase 6.2 smoke probe started next dev on 127.0.0.1:31620.',
    'GET readiness probe reached the internal assessment route.',
    'Real HTTP POST to /api/internal/constitutional-shadow/assessment returned 200 with hookReached=true.',
    'Real HTTP POST to /api/internal/constitutional-shadow/career-fit returned 200 with hookReached=true.',
    'Server probe processes were cleaned up after the smoke test.',
  ]),
  limitations: Object.freeze([
    'Real HTTP proof is local dev server proof, not deployed staging proof.',
    'User-facing UI remains unwired.',
    'Live routing remains forbidden.',
  ]),
});

export function createRouteShadowServerConfig(overrides: Partial<RouteShadowServerConfig> = {}): RouteShadowServerConfig {
  const port = Math.max(0, Math.floor(overrides.port ?? DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.port));
  const baseUrl = overrides.baseUrl ?? `http://127.0.0.1:${port}`;
  const serverStartCommand =
    overrides.serverStartCommand ??
    Object.freeze(['cmd.exe', '/c', 'npx', 'next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)]);
  const config = {
    ...DEFAULT_ROUTE_SHADOW_SERVER_CONFIG,
    ...overrides,
    port,
    baseUrl,
    serverStartCommand,
    allowedEnvironments: overrides.allowedEnvironments ?? DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowedEnvironments,
    allowedRoutes: overrides.allowedRoutes ?? DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowedRoutes,
    allowedFlows: overrides.allowedFlows ?? DEFAULT_ROUTE_SHADOW_SERVER_CONFIG.allowedFlows,
  };

  return Object.freeze({
    ...config,
    environment: normalizeRouteShadowServerEnvironment(config.environment),
    allowedEnvironments: Object.freeze([...new Set(config.allowedEnvironments.map(normalizeRouteShadowServerEnvironment))]),
    allowedRoutes: Object.freeze([...new Set(config.allowedRoutes)]),
    allowedFlows: Object.freeze([...new Set(config.allowedFlows)]),
    serverReadyTimeoutMs: Math.max(0, Math.floor(config.serverReadyTimeoutMs)),
    requestTimeoutMs: Math.max(0, Math.floor(config.requestTimeoutMs)),
    maxPayloadBytes: Math.max(0, Math.floor(config.maxPayloadBytes)),
    maxRequestsPerRoute: Math.max(0, Math.floor(config.maxRequestsPerRoute)),
    captureRawPayloads: false,
    allowProductionEnvironment: false,
    allowLiveRouting: false,
    allowOutputReplacement: false,
  });
}

export function normalizeRouteShadowServerEnvironment(environment: string | undefined): string {
  const normalized = (environment ?? 'unknown').trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

export function isAllowedRouteShadowServerHost(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl);
    const host = url.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.staging.careeros.local');
  } catch {
    return false;
  }
}

export function isProductionRouteShadowServerHost(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host.includes('production') || host.includes('prod') || host === 'careeros.com' || host.endsWith('.careeros.com');
  } catch {
    return false;
  }
}

