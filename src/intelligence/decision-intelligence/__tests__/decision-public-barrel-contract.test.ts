import { describe, expect, it } from 'vitest';
import {
  DecisionIntelligenceEngine,
  DecisionIntelligenceEngineV1,
  createDecisionIntelligenceEngine,
  generateDecision,
  generateDecisionReport,
  quickDecisionCheck,
  type DecisionInput,
  type DecisionIntelligenceOptions,
} from '../index';

describe('decision-intelligence public barrel contract', () => {
  it('keeps current decision intelligence engine exports available', () => {
    expect(DecisionIntelligenceEngine).toBeDefined();
    expect(createDecisionIntelligenceEngine).toBeTypeOf('function');
    expect(generateDecisionReport).toBeTypeOf('function');
    expect(quickDecisionCheck).toBeTypeOf('function');
  });

  it('keeps V1 compatibility exports available through the same barrel', () => {
    expect(DecisionIntelligenceEngineV1).toBeTypeOf('function');
    expect(generateDecision).toBeTypeOf('function');
  });

  it('keeps mixed current and V1 types importable without runtime leakage', () => {
    const currentInputKeys: Array<keyof DecisionInput> = [
      'id',
      'studentId',
      'options',
      'context',
      'timeline',
    ];
    const v1Options: DecisionIntelligenceOptions = {
      requireCoalitionStability: false,
    };

    expect(currentInputKeys).toContain('options');
    expect(v1Options.requireCoalitionStability).toBe(false);
  });
});
