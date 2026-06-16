import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  OptionClosureEngine,
  analyzeOptionClosure,
  createOptionClosureEngine,
} from '../option-closure-engine';
import type {
  CriticalityDecisionType,
  CriticalityOption,
  OptionClosureAnalysis,
} from '../criticality-types';

describe('Option closure medical practice build regression', () => {
  it('imports option-closure-engine successfully', async () => {
    const module = await import('../option-closure-engine');

    expect(module.OptionClosureEngine).toBeTypeOf('function');
    expect(module.createOptionClosureEngine).toBeTypeOf('function');
    expect(module.analyzeOptionClosure).toBeTypeOf('function');
  });

  it('resolves CriticalityDecisionType from the canonical type surface', () => {
    const decisionType: CriticalityDecisionType = 'CAREER_SELECTION';

    expectTypeOf<CriticalityDecisionType>().toMatchTypeOf<string>();
    expect(decisionType).toBe('CAREER_SELECTION');
  });

  it('keeps MEDICAL_PRACTICE out of CriticalityDecisionType assignments', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/intelligence/career-criticality/option-closure-engine.ts'),
      'utf8'
    );

    expect(source).not.toContain("'MEDICAL_PRACTICE'");
    expect(source).not.toContain('"MEDICAL_PRACTICE"');
    expect(source).toContain('isMedicalPracticeOption');
  });

  it('handles medical practice through option-level classification', () => {
    const engine = createOptionClosureEngine();
    const option = medicalPracticeOption();

    const analysis = engine.analyzeOptionClosure(option, 'CAREER_SELECTION', context());

    expect(analysis.opportunitiesLost.length).toBeGreaterThan(0);
    expect(analysis.opportunitiesLost.every(opportunity =>
      opportunity.reversibility === 'IRREVERSIBLE'
    )).toBe(true);
  });

  it('keeps non-medical career selection partially reversible', () => {
    const engine = new OptionClosureEngine();

    const analysis = engine.analyzeOptionClosure({
      id: 'software-engineering',
      name: 'Software Engineering',
      description: 'Software engineering career option',
      type: 'CAREER',
      duration: 24,
      specializationLevel: 'SPECIALIZED',
    }, 'CAREER_SELECTION', context());

    expect(analysis.opportunitiesLost.length).toBeGreaterThan(0);
    expect(analysis.opportunitiesLost.every(opportunity =>
      opportunity.reversibility === 'PARTIALLY_REVERSIBLE'
    )).toBe(true);
  });

  it('keeps option closure output shape stable', () => {
    const analysis: OptionClosureAnalysis = analyzeOptionClosure(
      medicalPracticeOption(),
      'CAREER_SELECTION'
    );

    expect(analysis).toHaveProperty('doorsOpened');
    expect(analysis).toHaveProperty('doorsClosed');
    expect(analysis).toHaveProperty('pivotDifficulty');
    expect(analysis).toHaveProperty('futureRestriction');
    expect(analysis).toHaveProperty('opportunitiesLost');
    expect(analysis).toHaveProperty('opportunitiesGained');
    expect(analysis).toHaveProperty('recoveryTimeEstimate');
    expect(Array.isArray(analysis.opportunitiesLost)).toBe(true);
    expect(Array.isArray(analysis.opportunitiesGained)).toBe(true);
  });

  it('keeps medical/practice fixture type-safe', () => {
    const option: CriticalityOption = medicalPracticeOption();
    const decisionType: CriticalityDecisionType = 'CAREER_SELECTION';

    expect(option.type).toBe('CAREER');
    expect(decisionType).toBe('CAREER_SELECTION');
  });

  it('does not enable live routing, shadow behavior, or raw payload capture', () => {
    expect(process.env.CANARY_LIVE).not.toBe('true');
    expect(process.env.FULL_LIVE).not.toBe('true');
    expect(process.env.CANARY_SHADOW).not.toBe('true');
    expect(process.env.CAREEROS_STAGING_SHADOW_CAPTURE_RAW_PAYLOADS).not.toBe('true');
  });
});

function medicalPracticeOption(): CriticalityOption {
  return {
    id: 'medical-practice',
    name: 'Medical Practice',
    description: 'Clinical doctor pathway after MBBS and licensing.',
    type: 'CAREER',
    duration: 66,
    specializationLevel: 'HIGHLY_SPECIALIZED',
  };
}

function context() {
  return {
    urgency: 'MEDIUM' as const,
    resources: 'MODERATE' as const,
    constraints: [],
    priorDecisions: [],
    riskTolerance: 'MODERATE' as const,
  };
}
