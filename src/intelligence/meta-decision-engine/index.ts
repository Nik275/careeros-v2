/**
 * CareerOS Meta-Decision Intelligence Engine
 *
 * Evaluates the quality of decisions themselves.
 * Determines whether a student should:
 * - Decide now
 * - Delay decision
 * - Gather information
 * - Explore alternatives
 * - Commit to a path
 *
 * @example
 * ```typescript
 * import { MetaDecisionEngine } from './meta-decision-engine';
 *
 * const engine = new MetaDecisionEngine();
 * const analysis = engine.analyze({
 *   studentId: 'student-123',
 *   decisionId: 'career-choice-1',
 *   studentBeliefs: { identityStability: 65, valueStability: 70, understandingLevel: 60 },
 *   utilityConfidence: { overall: 72, byCareer: { 'medicine': 85, 'engineering': 65 } },
 *   uncertainty: { overall: 45, informationGaps: [...], unknownFactors: [...] },
 *   biasProfile: { overallBias: 40, dominantBiases: ['authorityInfluence'] },
 *   informationCompleteness: { careerData: 70, personalFit: 55, marketData: 60, outcomeData: 50 },
 *   decisionIntelligence: { recommendation: 'medicine', confidence: 75, alternatives: ['engineering', 'law'] },
 * });
 *
 * console.log(analysis.narrative.summary);
 * // "Decision is partially ready with moderate quality. CareerOS recommends: gather_evidence."
 * ```
 */

// Main Engine
export {
  MetaDecisionEngine,
  createMetaDecisionEngine,
  analyzeDecisionQuality,
} from './MetaDecisionEngine';

// Sub-engines
export {
  DecisionReadinessEngine,
  createDecisionReadinessEngine,
} from './DecisionReadinessEngine';

export {
  DecisionQualityEngine,
  createDecisionQualityEngine,
} from './DecisionQualityEngine';

export {
  DecisionTimingEngine,
  createDecisionTimingEngine,
} from './DecisionTimingEngine';

export {
  CommitmentReadinessEngine,
  createCommitmentReadinessEngine,
} from './CommitmentReadinessEngine';

export {
  DecisionFragilityEngine,
  createDecisionFragilityEngine,
} from './DecisionFragilityEngine';

export {
  DecisionRobustnessEngine,
  createDecisionRobustnessEngine,
} from './DecisionRobustnessEngine';

export {
  MetaDecisionNarrativeEngine,
  createMetaDecisionNarrativeEngine,
} from './MetaDecisionNarrativeEngine';

// Constants
export {
  DEFAULT_META_DECISION_CONFIG,
} from './types';

// Types
export type {
  // Core types
  MetaDecisionId,
  DecisionState,
  DecisionTiming,
  DecisionQualityLevel,
  UncertaintyLevel,

  // Main interfaces
  DecisionReadinessAnalysis,
  DecisionQualityAnalysis,
  DecisionTimingAnalysis,
  CommitmentReadinessAnalysis,
  DecisionFragilityAnalysis,
  DecisionRobustnessAnalysis,
  MetaDecisionAnalysis,

  // Input/Output
  MetaDecisionInput,

  // Configuration
  MetaDecisionConfig,
} from './types';
