/**
 * Longitudinal Intelligence Engine
 *
 * Maintain evolving student models over time.
 *
 * ## Purpose
 *
 * - Track assessment history
 * - Track decision history
 * - Track value evolution
 * - Track identity evolution
 * - Track outcome history
 *
 * ## Generates
 *
 * - **StudentTimeline** - Chronological record of all student events
 * - **Major Transitions** - Significant changes in student development
 * - **Growth Milestones** - Key achievements in growth dimensions
 * - **Decision Patterns** - Recurring decision-making behaviors
 *
 * ## Timeline Event Types
 *
 * | Type | Description |
 * |------|-------------|
 * | `assessment` | Assessment completed |
 * | `decision` | Decision made |
 * | `value_shift` | Priority value changed |
 * | `identity_transition` | Identity archetype shift |
 * | `outcome` | Outcome recorded |
 * | `milestone` | Growth milestone achieved |
 * | `intervention` | Intervention applied |
 * | `goal_set` | Goal established |
 * | `goal_achieved` | Goal completed |
 * | `setback` | Setback experienced |
 * | `breakthrough` | Breakthrough achieved |
 *
 * ## Transition Types
 *
 * - `career_direction` - Change in career path
 * - `value_realignment` - Values priority shift
 * - `identity_shift` - Identity archetype change
 * - `skill_breakthrough` - Major skill advancement
 * - `confidence_growth` - Significant confidence increase
 * - `decision_style_change` - Decision pattern shift
 * - `external_circumstance` - External factor impact
 * - `goal_pivot` - Goal redirection
 *
 * ## Example Usage
 *
 * ```typescript
 * import {
 *   LongitudinalIntelligenceEngine,
 *   createLongitudinalIntelligenceEngine,
 * } from '@/intelligence/longitudinal-intelligence-engine';
 *
 * // Create engine
 * const engine = createLongitudinalIntelligenceEngine();
 *
 * // Analyze longitudinal data
 * const result = engine.analyze({
 *   studentId: 'student-123',
 *   assessments: assessmentHistory,
 *   decisions: decisionHistory,
 *   valueHistory: valueEvolutionHistory,
 *   identityEvolution: identityEvolution,
 *   growthAnalyses: growthAnalyses,
 *   outcomes: outcomeHistory,
 * });
 *
 * console.log(result.timeline.events.length);       // 25
 * console.log(result.transitions.length);           // 3
 * console.log(result.milestones.length);            // 5
 * console.log(result.decisionPatterns[0].type);     // 'analytical'
 *
 * // View insights
 * for (const insight of result.insights) {
 *   console.log(`${insight.type}: ${insight.description}`);
 * }
 *
 * // Generate report
 * console.log(engine.generateReport(result));
 * ```
 *
 * ## Compatibility
 *
 * - **Value Evolution Engine** - Tracks value shifts over time
 * - **Identity Development Engine** - Tracks identity transitions
 * - **Personal Growth Engine** - Tracks growth milestones
 * - **Outcome Learning** - Tracks outcome history
 * - **Utility Engine** - Informs utility preferences
 *
 * ## Design Principles
 *
 * - **Deterministic**: Same inputs always produce same outputs
 * - **Explainable**: All patterns have clear evidence
 * - **Strong Typing**: Full TypeScript type safety
 * - **Compatible**: Works with all other intelligence engines
 *
 * @module longitudinal-intelligence-engine
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Timeline
  TimelineEvent,
  TimelineEventType,
  AssessmentEvent,
  DecisionEvent,
  ValueShiftEvent,
  IdentityTransitionEvent,
  OutcomeEvent,
  MilestoneEvent,
  StudentTimeline,
  TimelineSummary,

  // Transitions
  MajorTransition,
  TransitionType,

  // Milestones
  GrowthMilestone,
  MilestoneType,

  // Decision Patterns
  DecisionPattern,
  DecisionPatternType,

  // Analysis
  LongitudinalAnalysis,
  LongitudinalInsight,
  LongitudinalInsightType,
  LongitudinalPrediction,

  // Input
  AssessmentSnapshot,
  DecisionRecord,
  OutcomeRecord,
  LongitudinalAnalysisInput,
  LongitudinalOptions,
  LongitudinalConfig,
} from './types.js';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  TIMELINE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  TRANSITION_TYPES,
  MILESTONE_TYPES,
  DECISION_PATTERN_TYPES,
  DEFAULT_LONGITUDINAL_CONFIG,
} from './types.js';

// ============================================================================
// MAIN ENGINE
// ============================================================================

export {
  LongitudinalIntelligenceEngine,
  createLongitudinalIntelligenceEngine,
  quickLongitudinalAnalysis,
  getEventTypeLabel,
  getEventTypes,
} from './LongitudinalIntelligenceEngine.js';

// ============================================================================
// ANALYSIS ALGORITHMS
// ============================================================================

export {
  generateTimeline,
  detectTransitions,
  identifyMilestones,
  analyzeDecisionPatterns,
  generateInsights,
  generatePredictions,
} from './analysis.js';
