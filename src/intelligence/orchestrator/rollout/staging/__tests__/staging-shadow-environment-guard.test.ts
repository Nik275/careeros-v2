import { describe, expect, it } from 'vitest';
import { StagingShadowEnvironmentGuard } from '../StagingShadowEnvironmentGuard';

describe('StagingShadowEnvironmentGuard', () => {
  it('blocks production and prod environments even when overridden', () => {
    const guard = new StagingShadowEnvironmentGuard({ now });

    expect(guard.evaluate({ environment: 'production', allowedEnvironments: ['production'] }).allowed).toBe(false);
    expect(guard.evaluate({ environment: 'staging', overrideEnvironment: 'prod', allowedEnvironments: ['staging', 'prod'] }).allowed).toBe(false);
  });

  it('blocks unknown, empty, and undefined environments', () => {
    const guard = new StagingShadowEnvironmentGuard({ now });

    expect(guard.evaluate({ environment: 'unknown', allowedEnvironments: ['unknown'] }).allowed).toBe(false);
    expect(guard.evaluate({ environment: '', allowedEnvironments: ['staging'] }).allowed).toBe(false);
    expect(guard.evaluate({ allowedEnvironments: ['staging'] }).allowed).toBe(false);
  });

  it('allows staging only when explicitly configured', () => {
    const guard = new StagingShadowEnvironmentGuard({ now });

    expect(guard.evaluate({ environment: 'staging', allowedEnvironments: [] }).allowed).toBe(false);
    expect(guard.evaluate({ environment: 'staging', allowedEnvironments: ['staging'] }).allowed).toBe(true);
  });
});

function now(): string {
  return '2026-06-06T00:00:00.000Z';
}
