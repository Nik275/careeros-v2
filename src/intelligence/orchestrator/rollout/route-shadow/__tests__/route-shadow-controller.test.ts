import { describe, expect, it } from 'vitest';
import { RouteShadowController } from '../RouteShadowController';
import { createSyntheticAssessmentRoutePayload } from '../RouteShadowSyntheticPayloads';

describe('RouteShadowController', () => {
  it('blocks production and unknown environments', () => {
    const controller = new RouteShadowController({ now });
    for (const environment of ['production', 'unknown']) {
      const request = createSyntheticAssessmentRoutePayload({
        environment,
        config: {
          enabled: true,
          environment,
          allowedEnvironments: [environment],
          allowedFlows: ['assessment'],
        },
      });
      const decision = controller.evaluate(request);

      expect(decision.allowed).toBe(false);
      expect(decision.status).toBe('BLOCKED');
    }
  });

  it('blocks missing synthetic marker, raw payload attempts, unsupported flow, and failed gates', () => {
    const controller = new RouteShadowController({ now });
    const missingMarker = controller.evaluate(
      createSyntheticAssessmentRoutePayload({
        synthetic: false,
        payload: { synthetic: false, dataClassification: 'SYNTHETIC' },
      })
    );
    const rawPayload = controller.evaluate(
      createSyntheticAssessmentRoutePayload({
        payload: { synthetic: true, dataClassification: 'SYNTHETIC', rawStudentData: true },
      })
    );
    const unsupported = controller.evaluate(
      createSyntheticAssessmentRoutePayload({
        flow: 'unsupported' as never,
      })
    );
    const killSwitch = controller.evaluate(
      createSyntheticAssessmentRoutePayload({
        gateInputs: { rolloutGateApproved: true, expandedParityCIGatePassed: true, privacySafe: true, telemetryHealthy: true, killSwitchActive: true },
      })
    );

    expect(missingMarker.allowed).toBe(false);
    expect(rawPayload.allowed).toBe(false);
    expect(unsupported.allowed).toBe(false);
    expect(killSwitch.allowed).toBe(false);
  });

  it('approves a fully gated synthetic request', () => {
    const decision = new RouteShadowController({ now }).evaluate(createSyntheticAssessmentRoutePayload());

    expect(decision.allowed).toBe(true);
    expect(decision.status).toBe('APPROVED');
    expect(decision.liveRoutingEnabled).toBe(false);
    expect(decision.outputReplacementEnabled).toBe(false);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
