import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createMarketAwareAnalysis,
  type MarketAwareCareerAnalysis,
  type MarketAwareCareerAnalysisInput,
} from '@/intelligence/market/integration';

function createAnalysisInput(): MarketAwareCareerAnalysisInput {
  return {
    careerId: 'software-engineer',
    careerTitle: 'Software Engineer',
    fitScore: 82,
    valuesScore: 76,
    utilityScore: 74,
    optionalityScore: 70,
    resilienceScore: 78,
    marketScore: 84,
    primaryReasons: [
      'Strong psychological fit',
      'Good long-term resilience',
    ],
  };
}

describe('market-aware career analysis confidence contract', () => {
  it('imports the model factory successfully', () => {
    expect(typeof createMarketAwareAnalysis).toBe('function');
  });

  it('creates final analysis output with computed confidence', () => {
    const analysis: MarketAwareCareerAnalysis = createMarketAwareAnalysis(createAnalysisInput());

    expect(analysis.confidence).toBe(86);
    expect(analysis.confidenceAdjustment).toBe(0.1);
    expect(analysis.explanation).toContain(
      'High confidence (86%) due to alignment of fit and market conditions.',
    );
  });

  it('keeps raw input free of computed confidence fields', () => {
    const input = createAnalysisInput();

    expect(Object.keys(input)).not.toContain('confidence');
    expect(Object.keys(input)).not.toContain('finalScore');
    expect(Object.keys(input)).not.toContain('marketAdjustment');
  });

  it('does not access confidence from the omitted input object', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src',
        'intelligence',
        'market',
        'integration',
        'models',
        'MarketAwareCareerAnalysis.ts',
      ),
      'utf8',
    );

    expect(source).not.toContain('params.confidence');
    expect(source).toContain('MarketAwareCareerAnalysisInput');
  });

  it('keeps confidence deterministic for the fixed fixture', () => {
    const first = createMarketAwareAnalysis(createAnalysisInput());
    const second = createMarketAwareAnalysis(createAnalysisInput());

    expect(first.confidence).toBe(second.confidence);
    expect(first.finalScore).toBe(second.finalScore);
    expect(first.riskFlags).toEqual(second.riskFlags);
  });

  it('keeps downstream compatibility fields present', () => {
    const analysis = createMarketAwareAnalysis(createAnalysisInput());

    expect(analysis).toHaveProperty('confidence');
    expect(analysis).toHaveProperty('marketImpact');
    expect(analysis).toHaveProperty('explanation');
    expect(analysis).toHaveProperty('riskFlags');
  });

  it('keeps live routing, raw capture, and output replacement controls out of market integration exports', async () => {
    const integrationModule = await import('@/intelligence/market/integration');
    const exportedNames = Object.keys(integrationModule);

    expect(exportedNames).not.toContain('CANARY_LIVE');
    expect(exportedNames).not.toContain('FULL_LIVE');
    expect(exportedNames).not.toContain('CANARY_SHADOW');
    expect(exportedNames).not.toContain('captureRawPayloads');
    expect(exportedNames).not.toContain('replaceProductionOutput');
  });
});
