import { describe, expect, it } from 'vitest';
import { discoverDeploymentProvider } from '../DeploymentProviderDiscovery';

describe('DeploymentProviderDiscovery', () => {
  it('detects likely Vercel target from repository evidence', () => {
    const discovery = discoverDeploymentProvider(process.cwd());

    expect(discovery.provider).toBe('VERCEL');
    expect(discovery.evidence.join('\n')).toContain('README.md');
    expect(discovery.buildScripts).toContain('build: next build');
    expect(discovery.startScripts).toContain('start: next start');
  });
});
