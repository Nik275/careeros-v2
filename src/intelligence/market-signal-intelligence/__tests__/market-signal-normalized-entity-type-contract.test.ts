import { describe, expect, it } from 'vitest';

import {
  EmergingCareerDetector,
  createEmergingCareerDetector,
} from '../EmergingCareerDetector';
import * as marketSignal from '../index';
import { DEFAULT_EMERGING_CAREER_CONFIG } from '../types';
import type {
  EntityId,
  NormalizedEntityType,
  TimeSeriesPoint,
} from '../types';
import type { NormalizedEntityType as CanonicalNormalizedEntityType } from '@/market-data-ingestion/types';

describe('market-signal NormalizedEntityType type surface contract', () => {
  it('imports EmergingCareerDetector and the public barrel successfully', () => {
    expect(EmergingCareerDetector).toBeTypeOf('function');
    expect(createEmergingCareerDetector).toBeTypeOf('function');
    expect(marketSignal.EmergingCareerDetector).toBe(EmergingCareerDetector);
    expect(marketSignal.DEFAULT_EMERGING_CAREER_CONFIG).toBe(DEFAULT_EMERGING_CAREER_CONFIG);
  });

  it('resolves NormalizedEntityType from the market-signal type surface', () => {
    const entityId = 'career:ai-engineer' as EntityId;
    const entityType = 'career' as NormalizedEntityType;
    const dataPoints: TimeSeriesPoint[] = [
      { timestamp: Date.now() - 365 * 24 * 60 * 60 * 1000, value: 0.2, confidence: 0.9 },
      { timestamp: Date.now() - 240 * 24 * 60 * 60 * 1000, value: 0.35, confidence: 0.9 },
      { timestamp: Date.now() - 120 * 24 * 60 * 60 * 1000, value: 0.55, confidence: 0.9 },
      { timestamp: Date.now(), value: 0.82, confidence: 0.9 },
    ];

    const detector = new EmergingCareerDetector();
    const result = detector.detectEmerging(entityId, entityType, 'AI Engineer', dataPoints);

    expect(result?.entityId).toBe(entityId);
    expect(result?.entityType).toBe(entityType);
  });

  it('keeps NormalizedEntityType aligned with the canonical market-data-ingestion type', () => {
    const fromMarketSignal = 'skill' as NormalizedEntityType;
    const fromCanonical: CanonicalNormalizedEntityType = fromMarketSignal;
    const roundTrip: NormalizedEntityType = fromCanonical;

    expect(roundTrip).toBe('skill');
  });

  it('keeps normalized ingestion aliases type-only without runtime leakage', async () => {
    const typesModule = await import('../types');

    expect('NormalizedEntityType' in typesModule).toBe(false);
    expect('NormalizedSignalType' in typesModule).toBe(false);
    expect('AggregatedMarketSignal' in typesModule).toBe(false);
    expect(typesModule.DEFAULT_EMERGING_CAREER_CONFIG).toBeDefined();
  });

  it('does not enable live routing, raw payload capture, or output replacement', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('CANARY_LIVE');
    expect(process.env.CAREEROS_ROUTE_SHADOW_MODE).not.toBe('FULL_LIVE');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_ALLOW_OUTPUT_REPLACEMENT).not.toBe('true');
  });
});
