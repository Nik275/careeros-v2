import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { MarketOutlook, MarketTrendDirection } from '@/intelligence/market';

describe('market intelligence engine key-union contract', () => {
  it('uses canonical market outlook enum values for summary buckets', () => {
    const byOutlook: Record<MarketOutlook, number> = {
      [MarketOutlook.EXCELLENT]: 0,
      [MarketOutlook.GOOD]: 0,
      [MarketOutlook.NEUTRAL]: 0,
      [MarketOutlook.CAUTION]: 0,
      [MarketOutlook.POOR]: 0,
    };

    expect(Object.keys(byOutlook)).toEqual([
      'EXCELLENT',
      'GOOD',
      'NEUTRAL',
      'CAUTION',
      'POOR',
    ]);
  });

  it('uses canonical market trend direction enum values for top performer summaries', () => {
    const trend: MarketTrendDirection = MarketTrendDirection.GROWTH;

    expect(trend).toBe('GROWTH');
  });

  it('guards string trend type indexing before reading trend records', () => {
    const source = readFileSync(
      join(process.cwd(), 'src', 'intelligence', 'market', 'MarketIntelligenceEngine.ts'),
      'utf8',
    );

    expect(source).toContain('isMarketTrendType');
    expect(source).toContain('MARKET_OUTLOOK_ORDER');
    expect(source).not.toContain("profile.outlook === 'poor'");
    expect(source).not.toContain("profile.outlook === 'caution'");
  });
});
