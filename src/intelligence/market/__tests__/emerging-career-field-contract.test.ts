import { describe, expect, it } from 'vitest';

import {
  EmergingCareerEngine,
  MarketConfidenceEngine,
} from '@/intelligence/market';
import type { MarketRepository } from '@/intelligence/market';
import type { MarketSignal } from '@/intelligence/market/models/MarketSignal';

function makeSignal(
  id: string,
  timestamp: Date,
  source: MarketSignal['source'],
  geography: MarketSignal['metadata']['geography'],
): MarketSignal {
  return {
    id,
    careerId: 'ai-agent-engineer',
    source,
    signalType: 'job_postings',
    strength: 30,
    confidence: 80,
    timestamp,
    rawData: {
      careerTitle: 'AI Agent Engineer',
    },
    metadata: {
      sourceReliability: 80,
      geography,
      sector: 'artificial-intelligence',
      timePeriod: {
        start: timestamp,
        end: timestamp,
      },
    },
  };
}

function createRepository(signals: MarketSignal[]): MarketRepository {
  return {
    getSignalsByType: async () => signals,
  } as Partial<MarketRepository> as MarketRepository;
}

describe('EmergingCareer field contract', () => {
  it('imports EmergingCareerEngine successfully', () => {
    expect(typeof EmergingCareerEngine).toBe('function');
  });

  it('emits the canonical title field without stale careerTitle output', async () => {
    const signals = [
      makeSignal('signal-1', new Date('2026-01-01T00:00:00.000Z'), 'linkedin', 'india'),
      makeSignal('signal-2', new Date('2026-01-10T00:00:00.000Z'), 'naukri', 'india'),
      makeSignal('signal-3', new Date('2026-01-20T00:00:00.000Z'), 'indeed', 'global'),
      makeSignal('signal-4', new Date('2026-01-30T00:00:00.000Z'), 'linkedin', 'global'),
      makeSignal('signal-5', new Date('2026-02-10T00:00:00.000Z'), 'naukri', 'india'),
    ];
    const engine = new EmergingCareerEngine(
      createRepository(signals),
      new MarketConfidenceEngine(),
      {
        minSignalStrength: 10,
        minEvidenceSources: 1,
        minEmergenceConfidence: 0,
        minGrowthRate: 1,
      },
    );

    const [career] = await engine.detectEmergingCareers({ timeWindowDays: 180, minGrowthRate: 1 });
    const careerRecord = career as unknown as Record<string, unknown>;

    expect(career.title).toBe('AI Agent Engineer');
    expect(careerRecord).not.toHaveProperty('careerTitle');
    expect(careerRecord).not.toHaveProperty('careerIdentifier');
    expect(careerRecord).not.toHaveProperty('firstDetected');
    expect(careerRecord).not.toHaveProperty('stage');
    expect(careerRecord).not.toHaveProperty('velocity');
    expect(careerRecord).not.toHaveProperty('evidence');
  });

  it('keeps required market intelligence fields and scoring outputs intact', async () => {
    const signals = [
      makeSignal('signal-1', new Date('2026-01-01T00:00:00.000Z'), 'linkedin', 'india'),
      makeSignal('signal-2', new Date('2026-01-10T00:00:00.000Z'), 'naukri', 'india'),
      makeSignal('signal-3', new Date('2026-01-20T00:00:00.000Z'), 'indeed', 'global'),
      makeSignal('signal-4', new Date('2026-01-30T00:00:00.000Z'), 'linkedin', 'global'),
      makeSignal('signal-5', new Date('2026-02-10T00:00:00.000Z'), 'naukri', 'india'),
    ];
    const engine = new EmergingCareerEngine(
      createRepository(signals),
      new MarketConfidenceEngine(),
      {
        minSignalStrength: 10,
        minEvidenceSources: 1,
        minEmergenceConfidence: 0,
        minGrowthRate: 1,
      },
    );

    const [career] = await engine.detectEmergingCareers({ timeWindowDays: 180, minGrowthRate: 1 });

    expect(career.confidence).toBe(77);
    expect(career.growthSignal).toBe(68);
    expect(career.evidenceSources).toHaveLength(1);
    expect(career.evidenceSources[0]).toMatchObject({
      sourceType: 'job_postings',
      strength: 80,
      rawData: {
        count: 5,
        geography: 'india',
      },
    });
    expect(career.discoveredAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    expect(career.industrySectors).toEqual(['artificial-intelligence']);
    expect(career.geography).toEqual({ primary: 'india', secondary: ['global'] });
    expect(career.keySkills).toEqual([]);
    expect(career.similarityToModeled).toEqual([]);
  });

  it('imports the Market Intelligence public barrel successfully', async () => {
    const marketModule = await import('@/intelligence/market');

    expect(typeof marketModule.EmergingCareerEngine).toBe('function');
    expect(typeof marketModule.MarketConfidenceEngine).toBe('function');
  });

  it('does not expose live routing, raw capture, or output replacement controls', async () => {
    const marketModule = await import('@/intelligence/market');
    const exportedNames = Object.keys(marketModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });
});
