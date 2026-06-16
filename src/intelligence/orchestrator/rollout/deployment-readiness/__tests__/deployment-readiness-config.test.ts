import { describe, expect, it } from 'vitest';
import { createDeploymentReadinessConfig } from '../DeploymentReadinessConfig';

describe('DeploymentReadinessConfig', () => {
  it('is disabled by default and keeps production/unknown host permissions false', () => {
    const config = createDeploymentReadinessConfig();

    expect(config.enabled).toBe(false);
    expect(config.environment).toBe('unknown');
    expect(config.requireStagingUrl).toBe(true);
    expect(config.requireManualApproval).toBe(true);
    expect(config.allowProductionEnvironment).toBe(false);
    expect(config.allowProductionHost).toBe(false);
    expect(config.allowUnknownHost).toBe(false);
  });

  it('normalizes environment and preserves required routes/env vars', () => {
    const config = createDeploymentReadinessConfig({ enabled: true, environment: ' STAGING ' });

    expect(config.environment).toBe('staging');
    expect(config.requiredEnvVars).toContain('CAREEROS_STAGING_SHADOW_BASE_URL');
    expect(config.requiredRoutes).toContain('src/app/api/internal/constitutional-shadow/assessment/route.ts');
  });
});
