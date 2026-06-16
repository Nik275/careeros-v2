import { describe, expect, it } from 'vitest';

import {
  TrendHistoryRepository,
  createTrendHistoryRepository,
} from '../TrendHistoryRepository';
import { DEFAULT_TREND_HISTORY_CONFIG } from '../types';
import type {
  EntityId,
  MarketSnapshot,
  NormalizedEntityType,
  Timestamp,
} from '../types';

describe('market-learning EntityId type surface contract', () => {
  it('imports TrendHistoryRepository successfully', () => {
    expect(TrendHistoryRepository).toBeTypeOf('function');
    expect(createTrendHistoryRepository).toBeTypeOf('function');
    expect(DEFAULT_TREND_HISTORY_CONFIG).toBeDefined();
  });

  it('resolves EntityId from the canonical market-learning type surface', () => {
    const entityId = 'career:software-engineer' as EntityId;
    const entityType = 'career' as NormalizedEntityType;
    const timestamp = Date.now() as Timestamp;
    const snapshot: MarketSnapshot = {
      id: 'snapshot-1',
      entityId,
      entityType,
      timestamp,
      metrics: {
        demand: 0.8,
        salary: 0.7,
        competition: 0.4,
        growth: 0.75,
        automationRisk: 0.2,
        opportunity: 82,
      },
      confidence: 0.9,
      sourceCount: 3,
      timeRange: {
        start: timestamp,
        end: timestamp,
      },
    };

    const repository = new TrendHistoryRepository();
    repository.storeSnapshot(snapshot);

    expect(repository.getLatestSnapshot(entityType, entityId)).toEqual(snapshot);
  });

  it('keeps EntityId and related identifiers type-only without runtime leakage', async () => {
    const typesModule = await import('../types');

    expect('EntityId' in typesModule).toBe(false);
    expect('NormalizedEntityType' in typesModule).toBe(false);
    expect('Timestamp' in typesModule).toBe(false);
    expect(typesModule.DEFAULT_TREND_HISTORY_CONFIG).toBeDefined();
  });

  it('does not enable live routing, shadow routing, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('CANARY_LIVE');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('FULL_LIVE');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});
