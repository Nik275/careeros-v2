import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DECISION_TREE_CONFIG,
  DecisionBranchAnalyzer,
  DecisionExplanationEngine,
  DecisionPathEvaluator,
  DecisionTreeEngine,
  DecisionTreeGenerator,
  analyzeDecisionTree,
  createDecisionBranchAnalyzer,
  createDecisionExplanationEngine,
  createDecisionPathEvaluator,
  createDecisionTreeEngine,
  createDecisionTreeGenerator,
  type DecisionTreeEngineConfig,
  type DecisionTreeInput,
} from '../index';

describe('decision-tree public barrel contract', () => {
  it('exports decision-tree runtime classes and factories', () => {
    expect(DecisionTreeEngine).toBeDefined();
    expect(DecisionTreeGenerator).toBeDefined();
    expect(DecisionPathEvaluator).toBeDefined();
    expect(DecisionBranchAnalyzer).toBeDefined();
    expect(DecisionExplanationEngine).toBeDefined();
    expect(createDecisionTreeEngine).toBeTypeOf('function');
    expect(createDecisionTreeGenerator).toBeTypeOf('function');
    expect(createDecisionPathEvaluator).toBeTypeOf('function');
    expect(createDecisionBranchAnalyzer).toBeTypeOf('function');
    expect(createDecisionExplanationEngine).toBeTypeOf('function');
    expect(analyzeDecisionTree).toBeTypeOf('function');
  });

  it('exports the default config as a runtime value', () => {
    expect(DEFAULT_DECISION_TREE_CONFIG.maxDepth).toBe(5);
    expect(DEFAULT_DECISION_TREE_CONFIG.enableExplanations).toBe(true);
  });

  it('keeps decision-tree types importable from the public barrel', () => {
    const config: DecisionTreeEngineConfig = DEFAULT_DECISION_TREE_CONFIG;
    const inputKeys: Array<keyof DecisionTreeInput> = [
      'studentId',
      'startingCareerId',
      'startingCareerName',
      'careerPaths',
      'futureScenarios',
      'optimalDecision',
      'utilityProfile',
      'config',
    ];

    expect(config.alternativePathCount).toBe(3);
    expect(inputKeys).toContain('startingCareerName');
  });
});
