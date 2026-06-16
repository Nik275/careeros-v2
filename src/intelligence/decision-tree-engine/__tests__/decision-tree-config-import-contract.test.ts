import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DECISION_TREE_CONFIG,
  DecisionTreeEngine,
  DecisionPathEvaluator,
  createDecisionPathEvaluator,
  createDecisionTreeEngine,
  type DecisionTreeNodeMetrics,
} from '../index';
import type { DecisionTreeEngineConfig } from '../index';
import { DEFAULT_CANARY_SHADOW_CONFIG } from '../../orchestrator/rollout/CanaryShadowConfig';
import { DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG } from '../../orchestrator/rollout/route-shadow-deployed/DeployedRouteShadowConfig';

describe('DecisionTreeEngine config import contract', () => {
  it('imports DecisionTreeEngine successfully', () => {
    expect(DecisionTreeEngine).toBeDefined();
    expect(createDecisionTreeEngine).toBeTypeOf('function');
  });

  it('keeps DEFAULT_DECISION_TREE_CONFIG runtime-importable', () => {
    expect(DEFAULT_DECISION_TREE_CONFIG).toEqual({
      maxDepth: 5,
      maxBranches: 4,
      minProbability: 0.1,
      utilityWeight: 0.35,
      regretWeight: 0.20,
      optionalityWeight: 0.25,
      riskWeight: -0.20,
      discountRate: 0.05,
      enableExplanations: true,
      criticalPointThreshold: 0.7,
      alternativePathCount: 3,
    });
  });

  it('keeps DecisionTreeEngineConfig type-importable', () => {
    const config: DecisionTreeEngineConfig = DEFAULT_DECISION_TREE_CONFIG;

    expect(config.maxDepth).toBe(5);
    expect(config.utilityWeight).toBe(0.35);
  });

  it('keeps DecisionTreeEngine constructor using default config', () => {
    const engine = new DecisionTreeEngine();

    expect(engine.getConfig()).toEqual(DEFAULT_DECISION_TREE_CONFIG);
  });

  it('keeps constructor config overrides working', () => {
    const engine = createDecisionTreeEngine({
      maxDepth: 3,
      alternativePathCount: 1,
    });

    expect(engine.getConfig()).toMatchObject({
      ...DEFAULT_DECISION_TREE_CONFIG,
      maxDepth: 3,
      alternativePathCount: 1,
    });
  });

  it('does not import DEFAULT_DECISION_TREE_CONFIG through import type in DecisionTreeEngine', () => {
    const source = readFileSync(
      'src/intelligence/decision-tree-engine/DecisionTreeEngine.ts',
      'utf8'
    );

    expect(source).toContain("import { DEFAULT_DECISION_TREE_CONFIG } from './types';");
    expect(source).not.toContain('DEFAULT_DECISION_TREE_CONFIG,\n} from');
  });

  it('preserves the Phase 6.6.AI decision-tree focused contract', () => {
    const nodeMetrics: DecisionTreeNodeMetrics = {
      totalIncome: 5000000,
      finalOptionality: 0.8,
    };
    const evaluator = createDecisionPathEvaluator(DEFAULT_DECISION_TREE_CONFIG);

    expect(nodeMetrics.totalIncome).toBe(5000000);
    expect(DecisionPathEvaluator).toBeDefined();
    expect(evaluator).toBeInstanceOf(DecisionPathEvaluator);
  });

  it('keeps live routing disabled by default', () => {
    expect(DEFAULT_CANARY_SHADOW_CONFIG.globalShadowEnabled).toBe(false);
    expect(DEFAULT_CANARY_SHADOW_CONFIG.sampleRate).toBe(0);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowLiveRouting).toBe(false);
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.allowOutputReplacement).toBe(false);
  });

  it('keeps raw payload capture disabled by default', () => {
    expect(DEFAULT_DEPLOYED_ROUTE_SHADOW_CONFIG.captureRawPayloads).toBe(false);
    expect(process.env.CAPTURE_RAW_PAYLOADS).not.toBe('true');
    expect(process.env.RAW_PAYLOAD_CAPTURE).not.toBe('true');
  });
});
