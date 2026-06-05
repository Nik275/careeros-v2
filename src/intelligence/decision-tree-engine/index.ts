/**
 * CareerOS Decision Tree Engine
 *
 * Models career decisions as sequential decision trees.
 *
 * @example
 * ```typescript
 * import { DecisionTreeEngine } from '@/intelligence';
 *
 * const engine = new DecisionTreeEngine();
 * const analysis = engine.analyze({
 *   studentId: 'student-123',
 *   startingCareerId: 'software-engineer',
 *   careerPaths,
 *   futureScenarios,
 *   optimalDecision
 * });
 *
 * console.log(analysis.bestPath.pathType);
 * console.log(analysis.criticalPoints);
 * console.log(analysis.explanation.summary);
 * ```
 */

// Main engine
export {
  DecisionTreeEngine,
  createDecisionTreeEngine,
  analyzeDecisionTree,
} from './DecisionTreeEngine';

// Components
export {
  DecisionTreeGenerator,
  createDecisionTreeGenerator,
} from './DecisionTreeGenerator';

export {
  DecisionPathEvaluator,
  createDecisionPathEvaluator,
} from './DecisionPathEvaluator';

export {
  DecisionBranchAnalyzer,
  createDecisionBranchAnalyzer,
} from './DecisionBranchAnalyzer';

export {
  DecisionExplanationEngine,
  createDecisionExplanationEngine,
} from './DecisionExplanationEngine';

// Types
export type {
  // Core types
  DecisionTreeId,
  DecisionTreeNodeType,
  DecisionType,
  RiskLevel,
  UpsideLevel,
  OptionalityLevel,

  // Main interfaces
  DecisionTreeNode,
  DecisionTreeEdge,
  DecisionTree,
  DecisionPathEvaluation,
  DecisionBranchAnalysis,
  CriticalDecisionPoint,
  BranchingOpportunity,
  DecisionTreeAnalysis,

  // Input/Output
  DecisionTreeInput,
  DecisionTreeEngineConfig,
  DecisionTreeExplanation,

  // Results
  TreeGenerationResult,
} from './types';

// Constants
export {
  DEFAULT_DECISION_TREE_CONFIG,
} from './types';
