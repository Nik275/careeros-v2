import { describe, expect, it } from 'vitest';
import { getDeployedStagingFeasibility } from '../DeployedRouteShadowHarness';

describe('Phase 6.3 deployed staging feasibility', () => {
  it('reports missing deployed staging URL honestly', () => {
    const feasibility = getDeployedStagingFeasibility();

    expect(feasibility.status).toBe('DEPLOYED_STAGING_URL_MISSING');
    expect(feasibility.executionMode).toBe('DEPLOYED_STAGING_BLOCKED');
    expect(feasibility.deployedHttpRequestsSent).toBe(false);
  });
});

