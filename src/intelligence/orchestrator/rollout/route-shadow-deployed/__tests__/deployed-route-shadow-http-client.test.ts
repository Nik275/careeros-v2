import { describe, expect, it } from 'vitest';
import { createDeployedRouteShadowConfig } from '../DeployedRouteShadowConfig';
import { DeployedRouteShadowHttpClient } from '../DeployedRouteShadowHttpClient';
import { createSyntheticAssessmentDeployedRequest } from '../DeployedRouteShadowPayloadFactory';

describe('DeployedRouteShadowHttpClient', () => {
  it('blocks production, unknown, and non-allowlisted hosts before fetch', async () => {
    const client = new DeployedRouteShadowHttpClient();
    const request = createSyntheticAssessmentDeployedRequest();

    await expect(client.post(request, createDeployedRouteShadowConfig({ enabled: true, environment: 'staging', baseUrl: 'https://app.careeros.com', allowedHosts: ['app.careeros.com'], allowedRoutes: [request.routePath] }))).rejects.toThrow(/blocked/);
    await expect(client.post(request, createDeployedRouteShadowConfig({ enabled: true, environment: 'staging', baseUrl: 'https://preview-careeros-staging.vercel.app', allowedHosts: [], allowedRoutes: [request.routePath] }))).rejects.toThrow(/blocked/);
    await expect(client.post(request, createDeployedRouteShadowConfig({ enabled: true, environment: 'staging', baseUrl: 'ftp://staging.example.com', allowedHosts: ['staging.example.com'], allowedProtocols: ['ftp:'], allowedRoutes: [request.routePath] }))).rejects.toThrow(/blocked/);
  });
});

