import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  BeliefConfidenceEngine,
  DEFAULT_BAYESIAN_CONFIG,
  createBeliefConfidenceEngine,
} from '../index';
import type {
  BayesianBeliefConfig,
  BeliefConfidence,
  BeliefConfidenceLevel,
  BeliefHistory,
  BeliefNode,
  ConfidenceLevel,
} from '../types';

describe('Belief confidence build regression', () => {
  it('imports the BeliefConfidenceEngine successfully', () => {
    expect(BeliefConfidenceEngine).toBeTypeOf('function');
    expect(createBeliefConfidenceEngine(DEFAULT_BAYESIAN_CONFIG)).toBeInstanceOf(
      BeliefConfidenceEngine
    );
  });

  it('keeps ConfidenceLevel resolved from the canonical Bayesian type surface', () => {
    expectTypeOf<ConfidenceLevel>().toEqualTypeOf<BeliefConfidenceLevel>();
    expectTypeOf<BeliefConfidence>().toHaveProperty('confidenceLevel');
    expectTypeOf<BeliefConfidence['confidenceLevel']>().toEqualTypeOf<ConfidenceLevel>();
  });

  it('keeps the Bayesian barrel type export stable', () => {
    expectTypeOf<BayesianBeliefConfig>().toMatchTypeOf<typeof DEFAULT_BAYESIAN_CONFIG>();
    expect(DEFAULT_BAYESIAN_CONFIG.defaultConfidence).toBe(0.3);
  });

  it('calculates confidence without changing the existing output shape', () => {
    const engine = createBeliefConfidenceEngine(DEFAULT_BAYESIAN_CONFIG);
    const confidence = engine.calculateConfidence(belief(0.72), history(0.48, 0.72));

    expect(confidence.beliefId).toBe('analytical-interest');
    expect(confidence.currentConfidence).toBe(0.72);
    expect(confidence.confidenceLevel).toBe('high');
    expect(confidence.history).toHaveLength(2);
    expect(confidence.stability.level).toMatch(/stable|entrenched|evolving|volatile/);
    expect(confidence.timeSinceLastUpdate).toBeGreaterThanOrEqual(0);
  });

  it('keeps confidence category thresholds stable', () => {
    const engine = createBeliefConfidenceEngine(DEFAULT_BAYESIAN_CONFIG);

    expect(engine.calculateConfidence(belief(0.2), history(0.2)).confidenceLevel).toBe('low');
    expect(engine.calculateConfidence(belief(0.4), history(0.4)).confidenceLevel).toBe('moderate');
    expect(engine.calculateConfidence(belief(0.6), history(0.6)).confidenceLevel).toBe('high');
    expect(engine.calculateConfidence(belief(0.8), history(0.8)).confidenceLevel).toBe('veryHigh');
  });

  it('does not create a runtime ConfidenceLevel enum or duplicate category logic', () => {
    const root = process.cwd();
    const typesSource = readFileSync(
      join(root, 'src/intelligence/bayesian-belief-engine/types.ts'),
      'utf8'
    );
    const engineSource = readFileSync(
      join(root, 'src/intelligence/bayesian-belief-engine/BeliefConfidenceEngine.ts'),
      'utf8'
    );

    expect(typesSource).toContain('export type BeliefConfidenceLevel');
    expect(typesSource).toContain('export type ConfidenceLevel = BeliefConfidenceLevel;');
    expect(typesSource).not.toMatch(/export\s+(enum|const)\s+ConfidenceLevel/);
    expect(engineSource.match(/return '(veryHigh|high|moderate|low)'/g)).toHaveLength(4);
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});

function belief(confidence: number): BeliefNode {
  const now = Date.now();

  return {
    id: 'belief-analytical-interest',
    beliefType: 'interest',
    beliefId: 'analytical-interest',
    name: 'Analytical Interest',
    currentProbability: 0.68,
    confidence,
    evidenceCount: 2,
    lastUpdated: now,
    createdAt: now - 86_400_000,
  };
}

function history(...confidences: number[]): BeliefHistory {
  const now = Date.now();
  const updates = confidences.map((confidence, index) => ({
    id: `update-${index}`,
    timestamp: now - (confidences.length - index) * 1_000,
    studentId: 'phase-6-6-3-student',
    beliefId: 'analytical-interest',
    priorBelief: {
      probability: Math.max(0.01, confidence - 0.1),
      confidence: Math.max(0.01, confidence - 0.1),
    },
    evidence: {
      id: `evidence-${index}`,
      type: 'assessment' as const,
      timestamp: now - (confidences.length - index) * 1_000,
      studentId: 'phase-6-6-3-student',
      targetBeliefId: 'analytical-interest',
      targetBeliefType: 'interest' as const,
      supportsBelief: true,
      strength: confidence,
      source: {
        type: 'observed' as const,
        description: 'Synthetic build-regression evidence.',
      },
      data: {
        description: 'Synthetic confidence evidence.',
        metadata: { phase: '6.6.3' },
      },
    },
    posteriorBelief: {
      probability: confidence,
      confidence,
    },
    change: {
      probabilityDelta: 0.1,
      confidenceDelta: 0.1,
    },
    explanation: 'Synthetic build-regression update.',
    calculation: {
      prior: 0.5,
      likelihood: 0.7,
      posterior: confidence,
      bayesFactor: 1.2,
    },
  }));

  return {
    beliefId: 'analytical-interest',
    metadata: {
      type: 'interest',
      name: 'Analytical Interest',
      createdAt: now - 86_400_000,
    },
    updates,
    confidenceTrajectory: updates.map((update) => ({
      timestamp: update.timestamp,
      confidence: update.posteriorBelief.confidence,
    })),
    probabilityTrajectory: updates.map((update) => ({
      timestamp: update.timestamp,
      probability: update.posteriorBelief.probability,
    })),
    evidence: updates.map((update) => update.evidence),
    contradictions: [],
    statistics: {
      totalUpdates: updates.length,
      totalEvidence: updates.length,
      averageChange: 0.1,
      maxProbability: Math.max(...confidences),
      minProbability: Math.min(...confidences),
    },
  };
}
