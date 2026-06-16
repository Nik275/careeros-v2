import { describe, expect, it } from 'vitest';
import { CanaryShadowTrialRollbackSimulator } from '../CanaryShadowTrialRollbackSimulator';

describe('CanaryShadowTrialRollbackSimulator', () => {
  it('handles all required rollback simulations', () => {
    const simulator = new CanaryShadowTrialRollbackSimulator({ now });
    const results = simulator.simulateAll();

    expect(results.map((result) => result.simulationType)).toEqual([
      'critical_drift',
      'binding_failure',
      'telemetry_failure',
      'privacy_gate_failure',
      'kill_switch_activation',
      'expired_approval',
      'latency_breach',
    ]);
    expect(results.every((result) => result.rollbackTriggered)).toBe(true);
    expect(results.every((result) => result.shadowExecutionStopped)).toBe(true);
    expect(results.every((result) => result.productionOutputPreserved)).toBe(true);
    expect(results.every((result) => result.auditRecordCreated)).toBe(true);
  });

  it('records expected rollback reasons', () => {
    const simulator = new CanaryShadowTrialRollbackSimulator({ now });

    expect(simulator.simulate('critical_drift').rollbackReason).toBe('critical_drift');
    expect(simulator.simulate('binding_failure').rollbackReason).toBe('failure_rate_breach');
    expect(simulator.simulate('telemetry_failure').rollbackReason).toBe('telemetry_failure');
    expect(simulator.simulate('privacy_gate_failure').rollbackReason).toBe('privacy_violation');
    expect(simulator.simulate('kill_switch_activation').rollbackReason).toBe('manual_kill_switch');
    expect(simulator.simulate('expired_approval').rollbackReason).toBe('expired_approval');
    expect(simulator.simulate('latency_breach').rollbackReason).toBe('latency_breach');
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
