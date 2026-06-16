/**
 * @fileoverview Deployed staging HTTP client for Phase 6.3.
 */

import { DeployedStagingHostGuard } from './DeployedStagingHostGuard';
import type { DeployedRouteShadowConfig, DeployedRouteShadowRequest, DeployedRouteShadowResponse } from './DeployedRouteShadowTypes';

export class DeployedRouteShadowHttpClient {
  async post(request: DeployedRouteShadowRequest, config: DeployedRouteShadowConfig): Promise<DeployedRouteShadowResponse> {
    const hostDecision = new DeployedStagingHostGuard().evaluate(config);
    if (!hostDecision.allowed) throw new Error(`Deployed staging host blocked: ${hostDecision.reason}`);
    if (!config.allowedRoutes.includes(request.routePath)) throw new Error('Deployed staging route is not allowlisted.');

    const controller = new AbortController();
    const startedAt = Date.now();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
    try {
      const response = await fetch(`${config.baseUrl}${request.routePath}`, {
        method: request.method,
        headers: request.headers,
        body: request.rawBody ?? safeStringify(request.body),
        signal: controller.signal,
      });
      const latencyMs = Math.max(0, Date.now() - startedAt);
      const headers = Object.freeze(Object.fromEntries(response.headers.entries()));
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.toLowerCase().includes('application/json')) {
        return deployedJsonResponse(response.status, request.flow, 'Deployed staging response was not JSON.', latencyMs, headers, false);
      }
      const body = await response.json();
      return Object.freeze({
        httpStatus: response.status,
        body,
        headers,
        jsonSafe: canRoundTripJson(body),
        latencyMs,
      });
    } catch (error) {
      const reason = error instanceof Error && error.name === 'AbortError' ? 'Deployed staging HTTP request timed out safely.' : 'Deployed staging HTTP request failed safely.';
      return deployedJsonResponse(500, request.flow, reason, Math.max(0, Date.now() - startedAt));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function deployedJsonResponse(
  httpStatus: number,
  flow: string,
  reason: string,
  latencyMs = 0,
  headers: Readonly<Record<string, string>> = Object.freeze({ 'content-type': 'application/json' }),
  jsonSafe = true
): DeployedRouteShadowResponse {
  return Object.freeze({
    httpStatus,
    body: {
      status: 'FAILED',
      verdict: 'FAIL',
      flow,
      hookReached: false,
      matched: false,
      driftDetected: false,
      failure: true,
      rollback: false,
      auditSummary: {
        reason,
        productionOutputPreserved: true,
        liveRoutingEnabled: false,
      },
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    },
    headers,
    jsonSafe,
    latencyMs,
  });
}

function canRoundTripJson(value: unknown): boolean {
  try { JSON.parse(JSON.stringify(value)); return true; } catch { return false; }
}
function safeStringify(value: unknown): string {
  try { return JSON.stringify(value) ?? ''; } catch { return '[unserializable]'; }
}

