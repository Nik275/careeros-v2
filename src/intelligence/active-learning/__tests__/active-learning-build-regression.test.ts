import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ActiveLearningEngine,
  DEFAULT_ACTIVE_LEARNING_CONFIG,
  type ActiveLearningConfig,
  type ActiveLearningEngineConfig,
} from '../index';

describe('Phase 6.6.1 active-learning build regression', () => {
  it('imports the active-learning engine and config contracts successfully', () => {
    expect(ActiveLearningEngine).toBeTypeOf('function');
    expect(DEFAULT_ACTIVE_LEARNING_CONFIG.queries.maxPendingPerStudent).toBeGreaterThan(0);
    expect(DEFAULT_ACTIVE_LEARNING_CONFIG.queries.defaultExpiryDays).toBeGreaterThan(0);
    expect(DEFAULT_ACTIVE_LEARNING_CONFIG.queries.batchSize).toBeGreaterThan(0);
  });

  it('keeps ActiveLearningConfig and ActiveLearningEngineConfig type-compatible', () => {
    expectTypeOf<ActiveLearningConfig>().toEqualTypeOf<ActiveLearningEngineConfig>();

    const config: ActiveLearningConfig = {
      ...DEFAULT_ACTIVE_LEARNING_CONFIG,
      queries: {
        ...DEFAULT_ACTIVE_LEARNING_CONFIG.queries,
        maxPendingPerStudent: 2,
      },
    };

    expect(config.queries.maxPendingPerStudent).toBe(2);
  });

  it('constructs the engine with minimal valid config overrides', () => {
    const engine = new ActiveLearningEngine({
      queries: {
        ...DEFAULT_ACTIVE_LEARNING_CONFIG.queries,
        maxPendingPerStudent: 1,
      },
    });

    expect(engine.getConfig().queries.maxPendingPerStudent).toBe(1);
  });

  it('preserves minimal queue output shape without live routing', () => {
    const engine = new ActiveLearningEngine();

    expect(engine.getAllPendingQueries()).toEqual([]);
    expect(engine.getSentQueries()).toEqual([]);
    expect(engine.getNextQueryBatch()).toEqual([]);
  });

  it('does not enable live routing, shadow routing, or raw payload capture', () => {
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_LIVE_ROUTING).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('CANARY_LIVE');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('FULL_LIVE');
  });
});
