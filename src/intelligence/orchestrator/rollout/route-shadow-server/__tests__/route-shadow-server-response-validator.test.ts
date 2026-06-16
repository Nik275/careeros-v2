import { describe, expect, it } from 'vitest';
import { routeShadowServerJsonResponse } from '../RouteShadowServerHarness';
import { validateRouteShadowServerResponse } from '../RouteShadowServerResponseValidator';

describe('RouteShadowServerResponseValidator', () => {
  it('accepts a valid JSON-safe server response', () => {
    const validation = validateRouteShadowServerResponse(routeShadowServerJsonResponse(200, validBody()));

    expect(validation.valid).toBe(true);
    expect(validation.hookReached).toBe(true);
    expect(validation.liveRoutingDisabled).toBe(true);
    expect(validation.productionOutputPreserved).toBe(true);
  });

  it('rejects non-json, stack traces, live routing, and production mutation flags', () => {
    const nonJson = validateRouteShadowServerResponse({ httpStatus: 200, body: 'text', headers: {}, jsonSafe: false, latencyMs: 0 });
    const stack = validateRouteShadowServerResponse(routeShadowServerJsonResponse(500, { ...validBody(), error: 'Error: leaked\\n    at secret.ts:1:1' }));
    const live = validateRouteShadowServerResponse(routeShadowServerJsonResponse(200, { ...validBody(), liveRoutingEnabled: true }));
    const mutation = validateRouteShadowServerResponse(routeShadowServerJsonResponse(200, { ...validBody(), productionOutputPreserved: false }));

    expect(nonJson.valid).toBe(false);
    expect(stack.stackTraceLeakDetected).toBe(true);
    expect(live.liveRoutingDisabled).toBe(false);
    expect(mutation.productionOutputPreserved).toBe(false);
  });
});

function validBody() {
  return {
    status: 'COMPLETED',
    verdict: 'PASS_WITH_WARNINGS',
    flow: 'assessment',
    hookReached: true,
    matched: true,
    driftDetected: false,
    failure: false,
    rollback: false,
    auditSummary: { productionOutputPreserved: true, liveRoutingEnabled: false },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
}

