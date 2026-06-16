import { describe, expect, it } from 'vitest';
import { createRouteShadowServerConfig } from '../RouteShadowServerConfig';
import { RouteShadowServerProcessManager } from '../RouteShadowServerProcessManager';

describe('RouteShadowServerProcessManager', () => {
  it('blocks production, unknown, and disabled server starts', async () => {
    const manager = new RouteShadowServerProcessManager();

    const disabled = await manager.start(createRouteShadowServerConfig({ enabled: false }));
    const production = await manager.start(createRouteShadowServerConfig({ enabled: true, environment: 'production', allowedEnvironments: ['production'] }));
    const unknown = await manager.start(createRouteShadowServerConfig({ enabled: true, environment: 'unknown', allowedEnvironments: ['unknown'] }));

    expect(disabled.status).toBe('DISABLED');
    expect(production.status).toBe('BLOCKED');
    expect(unknown.status).toBe('BLOCKED');
  });

  it('can report existing-server mode without spawning a process', async () => {
    const status = await new RouteShadowServerProcessManager().start(
      createRouteShadowServerConfig({
        enabled: true,
        environment: 'staging',
        startServer: false,
      })
    );

    expect(status.status).toBe('READY');
    expect(status.started).toBe(false);
    expect(status.ready).toBe(true);
  });
});

