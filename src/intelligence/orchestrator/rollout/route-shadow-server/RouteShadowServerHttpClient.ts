/**
 * @fileoverview Real HTTP client for Phase 6.2 route-shadow smoke tests.
 */

import {
  isAllowedRouteShadowServerHost,
  isProductionRouteShadowServerHost,
} from './RouteShadowServerConfig';
import type {
  RouteShadowServerConfig,
  RouteShadowServerRequest,
  RouteShadowServerResponse,
} from './RouteShadowServerTypes';

export class RouteShadowServerHttpClient {
  async post(request: RouteShadowServerRequest, config: RouteShadowServerConfig): Promise<RouteShadowServerResponse> {
    validateBaseUrl(config.baseUrl);
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
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.toLowerCase().includes('application/json')) {
        return {
          httpStatus: response.status,
          body: {
            status: 'FAILED',
            verdict: 'FAIL',
            flow: request.flow,
            hookReached: false,
            matched: false,
            driftDetected: false,
            failure: true,
            rollback: false,
            auditSummary: {
              reason: 'Real HTTP server response was not JSON.',
              productionOutputPreserved: true,
              liveRoutingEnabled: false,
            },
            productionOutputPreserved: true,
            liveRoutingEnabled: false,
          },
          headers: Object.freeze(Object.fromEntries(response.headers.entries())),
          jsonSafe: false,
          latencyMs,
        };
      }
      const body = await response.json();
      return Object.freeze({
        httpStatus: response.status,
        body,
        headers: Object.freeze(Object.fromEntries(response.headers.entries())),
        jsonSafe: canRoundTripJson(body),
        latencyMs,
      });
    } catch (error) {
      const latencyMs = Math.max(0, Date.now() - startedAt);
      return Object.freeze({
        httpStatus: 500,
        body: {
          status: 'FAILED',
          verdict: 'FAIL',
          flow: request.flow,
          hookReached: false,
          matched: false,
          driftDetected: false,
          failure: true,
          rollback: false,
          auditSummary: {
            reason: error instanceof Error && error.name === 'AbortError' ? 'Real HTTP request timed out safely.' : 'Real HTTP request failed safely.',
            productionOutputPreserved: true,
            liveRoutingEnabled: false,
          },
          productionOutputPreserved: true,
          liveRoutingEnabled: false,
        },
        headers: Object.freeze({ 'content-type': 'application/json' }),
        jsonSafe: true,
        latencyMs,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function validateBaseUrl(baseUrl: string): void {
  if (!isAllowedRouteShadowServerHost(baseUrl)) throw new Error('Route shadow server baseUrl host is not allowed.');
  if (isProductionRouteShadowServerHost(baseUrl)) throw new Error('Route shadow server production host is blocked.');
}

function canRoundTripJson(value: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '[unserializable]';
  }
}

