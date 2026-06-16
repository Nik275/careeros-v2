import { describe, expect, it } from 'vitest';
import {
  DecisionIntelligenceEngineV1,
  generateDecision,
  type DecisionIntelligenceOptions,
  type DecisionRecommendationOutput,
} from '../index';

describe('DecisionIntelligenceEngineV1 public API contract', () => {
  it('exports the V1 constructor from the public decision-intelligence barrel', () => {
    expect(DecisionIntelligenceEngineV1).toBeTypeOf('function');
    expect(DecisionIntelligenceEngineV1.prototype.generate).toBeTypeOf('function');
  });

  it('exports the V1 generateDecision factory from the public decision-intelligence barrel', () => {
    expect(generateDecision).toBeTypeOf('function');
  });

  it('keeps V1 public types importable from the public barrel', () => {
    const options: DecisionIntelligenceOptions = {
      minConfidenceThreshold: 0.5,
      maxAlternatives: 2,
    };
    const outputKeys: Array<keyof DecisionRecommendationOutput> = [
      'id',
      'recommendation',
      'alternatives',
      'confidence',
      'reasoning',
      'tradeoffs',
      'pathScores',
      'rankedPathIds',
      'generatedAt',
    ];

    expect(options.maxAlternatives).toBe(2);
    expect(outputKeys).toContain('recommendation');
  });
});
