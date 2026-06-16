import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  BayesianBeliefEngine,
  createBayesianBeliefEngine,
  DEFAULT_BAYESIAN_CONFIG,
} from '../index';
import { DEFAULT_BAYESIAN_CONFIG as TYPES_DEFAULT_BAYESIAN_CONFIG } from '../types';
import type {
  BayesianBeliefConfig,
  BeliefUpdate,
  EvidenceEvent,
  ProcessEvidenceInput,
} from '../types';

describe('Bayesian belief build regression', () => {
  it('imports the BayesianBeliefEngine and runtime default config successfully', () => {
    expect(BayesianBeliefEngine).toBeTypeOf('function');
    expect(DEFAULT_BAYESIAN_CONFIG).toBe(TYPES_DEFAULT_BAYESIAN_CONFIG);
    expect(DEFAULT_BAYESIAN_CONFIG.defaultPrior).toBe(0.5);
    expect(DEFAULT_BAYESIAN_CONFIG.evidenceWeights.assessment).toBeGreaterThan(0);
  });

  it('keeps Bayesian type symbols type-only while config remains a runtime value', () => {
    expectTypeOf<BayesianBeliefConfig>().toMatchTypeOf<typeof DEFAULT_BAYESIAN_CONFIG>();
    expectTypeOf<ProcessEvidenceInput>().toHaveProperty('evidence');
    expectTypeOf<BeliefUpdate>().toHaveProperty('posteriorBelief');
  });

  it('constructs with default config and processes a minimal evidence event', () => {
    const engine = createBayesianBeliefEngine();
    const update = engine.processEvidence({
      studentId: 'phase-6-6-2-student',
      evidence: evidenceEvent(),
    });

    expect(update.studentId).toBe('phase-6-6-2-student');
    expect(update.beliefId).toBe('analytical-interest');
    expect(update.posteriorBelief.probability).toBeGreaterThanOrEqual(0.01);
    expect(update.posteriorBelief.probability).toBeLessThanOrEqual(0.99);
    expect(update.calculation.prior).toBe(DEFAULT_BAYESIAN_CONFIG.defaultPrior);
  });

  it('updates beliefs without changing the expected result shape', () => {
    const engine = new BayesianBeliefEngine();
    const result = engine.updateBeliefs({
      studentId: 'phase-6-6-2-student',
      currentBeliefs: [],
      newEvidence: [evidenceEvent()],
    });

    expect(result.studentId).toBe('phase-6-6-2-student');
    expect(result.beliefs).toHaveLength(1);
    expect(result.updates).toHaveLength(1);
    expect(result.summary.totalBeliefs).toBe(1);
    expect(result.histories['analytical-interest']).toBeDefined();
  });

  it('does not duplicate DEFAULT_BAYESIAN_CONFIG values or import it through import type', () => {
    const root = process.cwd();
    const engineSource = readFileSync(
      join(root, 'src/intelligence/bayesian-belief-engine/BayesianBeliefEngine.ts'),
      'utf8'
    );
    const typesSource = readFileSync(
      join(root, 'src/intelligence/bayesian-belief-engine/types.ts'),
      'utf8'
    );

    expect(engineSource).toContain("import { DEFAULT_BAYESIAN_CONFIG } from './types';");
    expect(engineSource).not.toMatch(/import\s+type\s+\{[^}]*DEFAULT_BAYESIAN_CONFIG[^}]*\}/);
    expect(typesSource.match(/export const DEFAULT_BAYESIAN_CONFIG/g)).toHaveLength(1);
  });

  it('does not enable live routing or shadow behavior', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
  });
});

function evidenceEvent(): EvidenceEvent {
  return {
    id: 'phase-6-6-2-evidence',
    type: 'assessment',
    timestamp: Date.now(),
    studentId: 'phase-6-6-2-student',
    targetBeliefId: 'analytical-interest',
    targetBeliefType: 'interest',
    supportsBelief: true,
    strength: 0.7,
    source: {
      type: 'observed',
      description: 'Synthetic build-regression evidence.',
    },
    data: {
      description: 'Synthetic assessment signal for build regression.',
      metadata: {
        synthetic: true,
        phase: '6.6.2',
      },
    },
  };
}
