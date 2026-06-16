import { describe, expect, it } from 'vitest';
import { getRouteShadowHttpExecutionFeasibility } from '../RouteShadowHttpHarness';

describe('Phase 6.1 HTTP execution feasibility', () => {
  it('reports the strongest stable repository-supported execution mode honestly', () => {
    const feasibility = getRouteShadowHttpExecutionFeasibility();

    expect(feasibility.executionMode).toBe('ROUTE_HANDLER_REQUEST_SIMULATION');
    expect(feasibility.realHttpServerSupported).toBe(false);
    expect(feasibility.routeHandlerRequestSimulationSupported).toBe(true);
    expect(feasibility.directHandlerOnly).toBe(false);
    expect(feasibility.evidence.length).toBeGreaterThan(0);
  });
});

