import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createDecisionMatrix,
  createTradeoffEngine,
  TradeoffEngine,
} from '../index';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

describe('Decision Intelligence createDecisionMatrix export contract', () => {
  it('imports the public decision-intelligence index successfully', () => {
    expect(createDecisionMatrix).toBeTypeOf('function');
    expect(TradeoffEngine).toBeDefined();
    expect(createTradeoffEngine).toBeTypeOf('function');
  });

  it('keeps createDecisionMatrix as the canonical decision-model public export', () => {
    const matrix = createDecisionMatrix(
      ['option-a', 'option-b'],
      ['fit', 'risk'],
      [
        [80, 20],
        [40, 60],
      ],
      [0.7, 0.3]
    );

    expect(matrix.options).toEqual(['option-a', 'option-b']);
    expect(matrix.criteria).toEqual(['fit', 'risk']);
    expect(matrix.scores).toEqual([
      [100, 0],
      [0, 100],
    ]);
    expect(matrix.weights).toEqual([0.7, 0.3]);
    expect(matrix.normalized).toBe(true);
  });

  it('does not re-export createDecisionMatrix from tradeoff-engine', () => {
    const source = readFileSync(
      'src/intelligence/decision-intelligence/index.ts',
      'utf8'
    );

    expect(source).not.toContain(`createDecisionMatrix,\n  analyzeQuickTradeoff`);
  });

  it('keeps TradeoffEngine import surface stable', () => {
    const engine = createTradeoffEngine();

    expect(engine).toBeInstanceOf(TradeoffEngine);
    expect(engine.createDecisionMatrix).toBeTypeOf('function');
  });

  it('keeps live routing and raw payload capture disabled by default', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
  });
});
