/**
 * CareerOS Explainability Engine
 *
 * Generates world-class career counselor explanations for career recommendations.
 */

// Main engine
export { ExplainabilityEngine, explainCareerMatch, explainMultipleMatches } from './ExplainabilityEngine';

// Types
export type {
  CareerExplanation,
  PsychologicalExplanation,
  TraitExplanation,
  MotivationExplanation,
  MotivationSatisfaction,
  MotivationGap,
  WorkStyleExplanation,
  ConstraintsExplanation,
  SpecificConstraint,
  StrengthsExplanation,
  RisksExplanation,
  RiskDetail,
  TradeoffsExplanation,
  RecommendationExplanation,
} from './ExplainabilityEngine';
