/**
 * Action Intelligence Engine
 *
 * Transforms CareerOS intelligence into executable action plans.
 *
 * @example
 * ```typescript
 * import {
 *   createActionIntelligenceEngine,
 *   ActionIntelligenceInput,
 *   TimeHorizon,
 * } from './intelligence/action-intelligence';
 *
 * const engine = createActionIntelligenceEngine();
 *
 * const input: ActionIntelligenceInput = {
 *   studentBelief: studentData,
 *   targetCareer: 'Software Engineer',
 *   careerRecommendations: recommendations,
 *   careerPaths: paths,
 *   decisionAnalysis: decisions,
 * };
 *
 * const output = engine.generate(input);
 *
 * console.log(output.topActions);
 * console.log(output.weeklyPlan);
 * console.log(output.summary);
 * ```
 *
 * @module intelligence/action-intelligence
 */

// Main Engine
export {
  ActionIntelligenceEngine,
  createActionIntelligenceEngine,
  DEFAULT_ACTION_INTELLIGENCE_CONFIG,
} from './ActionIntelligenceEngine';

// Types
export type {
  // Core types
  ActionIntelligenceInput,
  ActionIntelligenceConfig,
  ActionOutput,
  Action,
  PrioritizedAction,
  ActionPriority,
  ActionStatus,
  ActionType,
  TimeHorizon,
  PriorityScore,
  PriorityRoadmap,

  // Skill gap types
  SkillGap,
  SkillGapAnalysis,
  SkillAssessment,
  SkillRequirement,
  LearningStep,
  SkillDevelopmentPlan,

  // Opportunity types
  Opportunity,
  OpportunityBundle,
  OpportunityType,
  OpportunityLocation,

  // Execution types
  ExecutionPlan,
  WeeklyPlan,
  MonthlyPlan,
  Milestone,
  PlannedMilestone,
  ReviewPoint,
  ContingencyPlan,
  ProgressTracker,

  // Explanation types
  ActionExplanation,
  ActionImpact,

  // Resource types
  ResourceRequirement,
  ResourceAvailability,
  ConstraintAnalysis,
} from './types';

// Enums
export {
  ActionPriority,
  ActionStatus,
  ActionType,
  TimeHorizon,
  OpportunityType,
} from './types';

// Sub-engines
export {
  ActionGenerator,
  createActionGenerator,
  type ActionGeneratorConfig,
} from './engines/ActionGenerator';

export {
  PriorityEngine,
  createPriorityEngine,
  type PriorityEngineConfig,
  DEFAULT_PRIORITY_ENGINE_CONFIG,
} from './engines/PriorityEngine';

export {
  SkillGapEngine,
  createSkillGapEngine,
  type SkillGapEngineConfig,
  DEFAULT_SKILL_GAP_CONFIG,
} from './engines/SkillGapEngine';

export {
  OpportunityEngine,
  createOpportunityEngine,
  type OpportunityEngineConfig,
  DEFAULT_OPPORTUNITY_CONFIG,
} from './engines/OpportunityEngine';

export {
  ExecutionPlanner,
  createExecutionPlanner,
  type ExecutionPlannerConfig,
  DEFAULT_EXECUTION_CONFIG,
} from './engines/ExecutionPlanner';

export {
  ActionExplanationEngine,
  createExplanationEngine,
  type ExplanationEngineConfig,
  DEFAULT_EXPLANATION_CONFIG,
} from './engines/ActionExplanationEngine';

// Utility functions
export {
  isValidAction,
  isCompleteAction,
  calculateOverallPriorityScore,
  getPriorityWeight,
  getHorizonWeight,
} from './types';
