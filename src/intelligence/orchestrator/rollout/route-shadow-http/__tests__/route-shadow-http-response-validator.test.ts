import { describe, expect, it } from 'vitest';
import { routeShadowHttpJsonResponse } from '../RouteShadowHttpHarness';
import { validateRouteShadowHttpResponse } from '../RouteShadowHttpResponseValidator';

describe('RouteShadowHttpResponseValidator', () => {
  it('accepts a valid JSON-safe route shadow HTTP response', () => {
    const validation = validateRouteShadowHttpResponse(validResponse());

    expect(validation.valid).toBe(true);
    expect(validation.liveRoutingDisabled).toBe(true);
    expect(validation.productionOutputPreserved).toBe(true);
    expect(validation.rawPayloadLeakDetected).toBe(false);
    expect(validation.stackTraceLeakDetected).toBe(false);
  });

  it('rejects live routing, raw payload leaks, stack traces, and production mutation flags', () => {
    const live = validateRouteShadowHttpResponse(routeShadowHttpJsonResponse(200, { ...validBody(), liveRoutingEnabled: true }));
    const raw = validateRouteShadowHttpResponse(routeShadowHttpJsonResponse(200, { ...validBody(), studentEmail: 'blocked@example.com' }));
    const stack = validateRouteShadowHttpResponse(routeShadowHttpJsonResponse(500, { ...validBody(), error: 'Error: leaked\\n    at secret.ts:1:1' }));
    const mutation = validateRouteShadowHttpResponse(routeShadowHttpJsonResponse(200, { ...validBody(), productionOutputReplaced: true }));

    expect(live.valid).toBe(false);
    expect(raw.rawPayloadLeakDetected).toBe(true);
    expect(stack.stackTraceLeakDetected).toBe(true);
    expect(mutation.productionMutationDetected).toBe(true);
  });
});

function validResponse() {
  return routeShadowHttpJsonResponse(200, validBody());
}

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
    auditSummary: {
      routePath: '/api/internal/constitutional-shadow/assessment',
      productionOutputPreserved: true,
      liveRoutingEnabled: false,
    },
    productionOutputPreserved: true,
    liveRoutingEnabled: false,
  };
}

