import { describe, expect, it } from 'vitest';
import { RouteShadowExecutionService } from '../RouteShadowExecutionService';
import { createSyntheticAssessmentRoutePayload } from '../RouteShadowSyntheticPayloads';

describe('RouteShadowAuditBundle', () => {
  it('creates a JSON-safe bundle without raw payload storage', async () => {
    const result = await new RouteShadowExecutionService({ now }).execute(createSyntheticAssessmentRoutePayload());

    expect(JSON.parse(JSON.stringify(result.auditBundle))).toEqual(result.auditBundle);
    expect(result.auditBundle.privacySummary.captureRawPayloads).toBe(false);
    expect(result.auditBundle.privacySummary.rawPayloadStored).toBe(false);
    expect(result.auditBundle.productionOutputPreserved).toBe(true);
    expect(result.auditBundle.liveRoutingEnabled).toBe(false);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
