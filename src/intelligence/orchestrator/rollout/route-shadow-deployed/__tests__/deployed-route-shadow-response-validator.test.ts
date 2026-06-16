import { describe, expect, it } from 'vitest';
import { deployedRouteShadowJsonResponse } from '../DeployedRouteShadowHarness';
import { validateDeployedRouteShadowResponse } from '../DeployedRouteShadowResponseValidator';

describe('DeployedRouteShadowResponseValidator', () => {
  it('accepts a valid deployed route response', () => {
    const validation = validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(200, validBody()));

    expect(validation.valid).toBe(true);
    expect(validation.hookReached).toBe(true);
    expect(validation.liveRoutingDisabled).toBe(true);
    expect(validation.productionOutputPreserved).toBe(true);
  });

  it('rejects non-json, secrets, stack traces, live routing, and production mutation flags', () => {
    expect(validateDeployedRouteShadowResponse({ httpStatus: 200, body: 'text', headers: {}, jsonSafe: false, latencyMs: 0 }).valid).toBe(false);
    expect(validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(200, { ...validBody(), liveRoutingEnabled: true })).valid).toBe(false);
    expect(validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(200, { ...validBody(), productionOutputPreserved: false })).valid).toBe(false);
    expect(validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(500, { ...validBody(), error: 'Error: leaked\\n    at secret.ts:1:1' })).stackTraceLeakDetected).toBe(true);
    expect(validateDeployedRouteShadowResponse(deployedRouteShadowJsonResponse(500, { ...validBody(), token: 'SECRET_KEY' })).internalSecretLeakDetected).toBe(true);
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

