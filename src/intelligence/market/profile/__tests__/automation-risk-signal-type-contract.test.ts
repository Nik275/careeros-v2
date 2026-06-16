import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  AutomationRiskEngine,
  createAutomationRiskEngine,
} from '@/intelligence/market/profile';
import type {
  AggregateMarketSignal,
  MarketSignalSource,
  MarketSignalType,
  NormalizedMarketSignal,
} from '@/intelligence/market';

function createAutomationSignal(
  normalizedStrength: number,
  confidence = 90,
  source: MarketSignalSource = 'wef',
): NormalizedMarketSignal {
  return {
    id: `automation-${normalizedStrength}`,
    careerId: 'data-entry-clerk',
    careerIdentifier: 'data-entry-clerk',
    source,
    signalType: 'automation_risk',
    strength: normalizedStrength,
    confidence,
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    rawData: {},
    unit: 'index',
    geography: 'global',
    metadata: {
      sourceReliability: 90,
      geography: 'global',
      timePeriod: {
        start: new Date('2025-01-01T00:00:00.000Z'),
        end: new Date('2025-12-31T00:00:00.000Z'),
      },
    },
    normalizedStrength,
    direction: 'negative',
    weight: 0.9,
    processedAt: new Date('2026-01-02T00:00:00.000Z'),
    validation: {
      isValid: true,
      issues: [],
    },
  };
}

function createAggregateSignal(aggregatedStrength: number): AggregateMarketSignal {
  return {
    careerId: 'data-entry-clerk',
    signalType: 'automation_risk',
    aggregatedStrength,
    confidence: 90,
    signalCount: 3,
    sources: ['wef'],
    timeRange: {
      start: new Date('2025-01-01T00:00:00.000Z'),
      end: new Date('2025-12-31T00:00:00.000Z'),
    },
    lastUpdated: new Date('2026-01-02T00:00:00.000Z'),
  };
}

describe('automation risk signal type contract', () => {
  it('imports AutomationRiskEngine successfully', () => {
    expect(typeof AutomationRiskEngine).toBe('function');
    expect(typeof createAutomationRiskEngine).toBe('function');
  });

  it('treats automation_risk as an explicit MarketSignalType', () => {
    const signalType: MarketSignalType = 'automation_risk';

    expect(signalType).toBe('automation_risk');
  });

  it('keeps AutomationRiskEngine comparisons compatible with MarketSignalType', () => {
    const source = readFileSync(
      join(process.cwd(), 'src', 'intelligence', 'market', 'models', 'MarketSignal.ts'),
      'utf8',
    );

    expect(source).toContain("| 'automation_risk'");
    expect(source).not.toContain('export type MarketSignalType = string');
  });

  it('detects high automation exposure for a fixed low-human-requirement fixture', () => {
    const engine = createAutomationRiskEngine();
    const result = engine.calculateScore(
      'data-entry-clerk',
      [
        createAutomationSignal(10, 90, 'wef'),
        createAutomationSignal(15, 80, 'research_report'),
      ],
      [createAggregateSignal(12)],
    );

    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.breakdown.scoreType).toBe('automationRisk');
    expect(result.breakdown.confidence).toBeGreaterThan(0);
  });

  it('detects low automation exposure for a fixed high-human-requirement fixture', () => {
    const engine = createAutomationRiskEngine();
    const result = engine.calculateScore(
      'therapist',
      [
        createAutomationSignal(95, 90, 'wef'),
        createAutomationSignal(90, 80, 'research_report'),
      ],
      [createAggregateSignal(92)],
    );

    expect(result.score).toBeLessThan(40);
    expect(result.breakdown.taskAutomation.socialTasks).toBeGreaterThan(70);
  });

  it('keeps live routing, raw capture, and output replacement controls out of market profile exports', async () => {
    const profileModule = await import('@/intelligence/market/profile');
    const exportedNames = Object.keys(profileModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });
});
