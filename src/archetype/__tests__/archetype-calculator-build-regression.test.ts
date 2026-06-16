import { describe, expect, it } from 'vitest';
import {
  ArchetypeCalculator,
  createArchetypeCalculator,
  createSignalCollection,
} from '../archetype-calculator';
import { createArchetypeConfidenceEngine } from '../archetype-confidence-engine';
import { createArchetypeDetectionEngine } from '../archetype-detection-engine';
import { createArchetypeExplanationEngine } from '../archetype-explanation-engine';
import { createArchetypeMapper } from '../archetype-mapper';
import type { ArchetypeDetectionInput } from '../archetype-types';
import { createConfidenceCalculator } from '../confidence-calculator';
import { DEFAULT_ARCHETYPE_SCORING_CONFIG } from '../archetype-types';
import { determineConfidenceLevel } from '../confidence-types';

describe('archetype calculator build regression', () => {
  it('imports the calculator and creates the default calculator successfully', () => {
    const calculator = createArchetypeCalculator();

    expect(calculator).toBeInstanceOf(ArchetypeCalculator);
  });

  it('imports the archetype detection engine with the shared archetype list resolved', () => {
    const engine = createArchetypeDetectionEngine();

    expect(engine.getConfig()).toEqual(DEFAULT_ARCHETYPE_SCORING_CONFIG);
  });

  it('maps local archetype assessment result shapes without external assessment-intelligence types', () => {
    const mapper = createArchetypeMapper();
    const collections = mapper.mapToSignals({
      profileId: 'profile-1',
      studentProfile: {
        workStyle: {
          preferenceForAutonomy: 80,
          preferenceForFlexibility: 65,
          preferenceForCreative: 50,
          preferenceForAnalytical: 78,
        },
        socialProfile: {
          socialPreference: 40,
        },
        personalPreferences: {
          financialStabilityPriority: 55,
          impactPriority: 82,
          growthPriority: 77,
        },
      },
      assessments: {
        cognitive: {
          analyticalReasoning: { score: 82 },
          problemSolving: { score: 78 },
        },
        interest: {
          interestInThings: { score: 84 },
          interestInTechnical: 76,
        },
      },
      profileInsights: {
        keyInsights: ['Build technical systems and create structured products'],
      },
    } as unknown as ArchetypeDetectionInput);

    expect(collections.some((collection) => collection.archetype === 'BUILDER')).toBe(true);
  });

  it('resolves DEFAULT_ARCHETYPE_SCORING_CONFIG before use and does not expose a promise config', () => {
    const calculator = createArchetypeCalculator();
    const config = calculator.getConfig();

    expect(config).toEqual(DEFAULT_ARCHETYPE_SCORING_CONFIG);
    expect(typeof (config as { then?: unknown }).then).toBe('undefined');
    expect(config.sourceWeights.COGNITIVE_ASSESSMENT).toBe(1);
  });

  it('keeps deprecated confidence level helper typed without restoring confidenceLevel field usage', () => {
    expect(determineConfidenceLevel(86)).toBe('VERY_HIGH');
    expect(determineConfidenceLevel(42)).toBe('LOW');
  });

  it('calculates a minimal valid archetype score with the existing output shape', () => {
    const calculator = createArchetypeCalculator();
    const collection = createSignalCollection('BUILDER', [
      signal(80, 'COGNITIVE_ASSESSMENT'),
      signal(70, 'INTEREST_ASSESSMENT'),
      signal(90, 'VALUE_ASSESSMENT'),
    ]);

    const [score] = calculator.calculateScores([collection]);

    expect(score).toEqual({
      archetype: 'BUILDER',
      score: 80,
      confidence: 48,
    });
    expect(Object.keys(score).sort()).toEqual(['archetype', 'confidence', 'score']);
  });

  it('calculates representative balanced input and preserves primary/secondary behavior', () => {
    const calculator = createArchetypeCalculator();
    const builder = createSignalCollection('BUILDER', [
      signal(82, 'COGNITIVE_ASSESSMENT'),
      signal(78, 'STRENGTH_ASSESSMENT'),
      signal(80, 'PROFILE_INSIGHT'),
    ]);
    const researcher = createSignalCollection('RESEARCHER', [
      signal(76, 'COGNITIVE_ASSESSMENT'),
      signal(72, 'INTEREST_ASSESSMENT'),
      signal(74, 'PROFILE_INSIGHT'),
    ]);

    const scores = calculator.calculateScores([builder, researcher]);
    const primarySecondary = calculator.determinePrimarySecondary(scores);
    const confidence = calculator.calculateOverallConfidence(scores);

    expect(scores).toHaveLength(2);
    expect(primarySecondary.primary).toBe('BUILDER');
    expect(primarySecondary.secondary).toBe('RESEARCHER');
    expect(confidence).toEqual({
      confidenceScore: 49,
      evidenceCount: 2,
      reliability: 'INSUFFICIENT_DATA',
    });
  });

  it('does not introduce live routing or raw payload behavior into archetype calculation', () => {
    const calculator = createArchetypeCalculator();
    const config = toInspectableConfig(calculator.getConfig());

    expect(config).not.toHaveProperty('liveRoutingEnabled');
    expect(config).not.toHaveProperty('allowLiveRouting');
    expect(config).not.toHaveProperty('captureRawPayloads');
  });

  it('imports the deprecated archetype confidence calculator and preserves confidence output shape', () => {
    const calculator = createConfidenceCalculator();
    const result = calculator.calculate({
      archetypeScores: [
        { archetype: 'BUILDER', score: 80, confidence: 70 },
        { archetype: 'RESEARCHER', score: 72, confidence: 65 },
      ],
      signals: [
        signal(80, 'COGNITIVE_ASSESSMENT'),
        signal(72, 'INTEREST_ASSESSMENT'),
        signal(74, 'PROFILE_INSIGHT'),
      ],
      profileReliability: 70,
      assessmentReliability: {
        cognitive: 0.9,
        interest: 0.8,
      },
      primaryArchetype: 'BUILDER',
      secondaryArchetype: 'RESEARCHER',
    });

    expect(result.success).toBe(true);
    expect(result.confidence).toMatchObject({
      confidenceScore: expect.any(Number),
      confidence: expect.any(Number),
      stabilityScore: expect.any(Number),
      evidenceScore: expect.any(Number),
      coverageScore: expect.any(Number),
      consistencyScore: expect.any(Number),
      separationScore: expect.any(Number),
      completenessScore: expect.any(Number),
    });
    expect(typeof (result.confidence as { then?: unknown } | undefined)?.then).toBe('undefined');
  });

  it('preserves deprecated archetype confidence engine fallback output shape', () => {
    const engine = createArchetypeConfidenceEngine();
    const confidence = engine.calculateConfidence(
      {
        profileId: 'profile-1',
        primaryArchetype: 'BUILDER',
        archetypeScores: [],
        confidence: {
          confidenceScore: 42,
          evidenceCount: 0,
          reliability: 'INSUFFICIENT_DATA',
        },
        assessedAt: new Date('2026-06-06T00:00:00.000Z'),
      },
      []
    );

    expect(confidence).toMatchObject({
      confidenceScore: expect.any(Number),
      confidence: expect.any(Number),
      stabilityScore: expect.any(Number),
      evidenceScore: expect.any(Number),
      coverageScore: expect.any(Number),
      consistencyScore: expect.any(Number),
      separationScore: expect.any(Number),
      completenessScore: expect.any(Number),
    });
  });

  it('generates explanations from current confidence shape without confidenceLevel', () => {
    const engine = createArchetypeExplanationEngine();
    const result = engine.generateExplanation(
      {
        profileId: 'profile-1',
        primaryArchetype: 'BUILDER',
        archetypeScores: [{ archetype: 'BUILDER', score: 82, confidence: 70 }],
        confidence: {
          confidenceScore: 70,
          evidenceCount: 3,
          reliability: 'MODERATE',
        },
        assessedAt: new Date('2026-06-06T00:00:00.000Z'),
      },
      {
        confidenceScore: 70,
        confidence: 0.7,
        stabilityScore: 70,
        evidenceScore: 70,
        coverageScore: 70,
        consistencyScore: 70,
        separationScore: 70,
        completenessScore: 70,
      },
      [signal(80, 'COGNITIVE_ASSESSMENT')]
    );

    expect(result.success).toBe(true);
    expect(result.explanation?.confidenceExplanation.summary).toContain('high confidence');
  });
});

function signal(strength: number, source: Parameters<typeof createSignalCollection>[1][number]['source']) {
  return {
    archetype: 'BUILDER' as const,
    strength,
    source,
    description: `${source} signal`,
    weight: 1,
  };
}

function toInspectableConfig(config: ReturnType<ArchetypeCalculator['getConfig']>) {
  return { ...config };
}
