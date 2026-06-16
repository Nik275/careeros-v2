import { describe, expect, it } from 'vitest';
import { getRouteShadowServerFeasibility } from '../RouteShadowServerHarness';

describe('Phase 6.2 server execution feasibility', () => {
  it('reports real HTTP server support from the measured local smoke probe', () => {
    const feasibility = getRouteShadowServerFeasibility();

    expect(feasibility.status).toBe('REAL_HTTP_SERVER_SUPPORTED');
    expect(feasibility.executionMode).toBe('REAL_HTTP_SERVER');
    expect(feasibility.canStartServer).toBe(true);
    expect(feasibility.canPostSyntheticPayloads).toBe(true);
    expect(feasibility.canShutdownCleanly).toBe(true);
  });
});

