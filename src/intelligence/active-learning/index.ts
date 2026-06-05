/**
 * CareerOS Active Learning Engine
 *
 * Phase 9.1: Active Learning Engine
 *
 * Intelligently determines where CareerOS should focus its learning efforts:
 * - High uncertainty students
 * - Decision boundaries
 * - Evidence gaps
 * - Contradictory profiles
 *
 * @module intelligence/active-learning
 * @version 1.0.0
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core identifiers
  LearningQueryId,
  UncertaintyProfileId,
  LearningValueId,
  DecisionBoundaryId,
  EvidenceGapId,

  // Uncertainty types
  UncertaintyDimension,
  UncertaintyLevel,
  UncertaintyScore,
  UncertaintyProfile,

  // Learning value types
  LearningValueFactor,
  LearningValueComponent,
  LearningValueScore,

  // Decision boundary types
  BoundaryType,
  DecisionBoundary,
  BoundaryProximity,
  DecisionBoundaryZone,

  // Outcome priority types
  PriorityLevel,
  OutcomeUrgency,
  OutcomePriority,
  PriorityAdjustment,

  // Evidence gap types
  EvidenceGapType,
  EvidenceGap,
  EvidenceGapAnalysis,

  // Query types
  QueryType,
  QueryStatus,
  LearningQuery,

  // Report types
  ActiveLearningReport,

  // Configuration
  ActiveLearningConfig,

  // Utility types
  StudentLearningProfile,
  LearningStrategy,
  ActiveLearningMetrics,

  // Engine interfaces
  IUncertaintyEngine,
  ILearningValueEngine,
  IDecisionBoundaryEngine,
  IOutcomePriorityEngine,
  IEvidenceGapEngine,
  IActiveLearningEngine,
} from './active-learning-types.js';

// ============================================================================
// CONSTANTS EXPORTS
// ============================================================================

export { DEFAULT_ACTIVE_LEARNING_CONFIG } from './active-learning-types.js';

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { UncertaintyEngine } from './uncertainty-engine.js';
export { LearningValueEngine } from './learning-value-engine.js';
export { DecisionBoundaryEngine } from './decision-boundary-engine.js';
export { OutcomePriorityEngine } from './outcome-priority-engine.js';
export { EvidenceGapEngine } from './evidence-gap-engine.js';
export { ActiveLearningEngine } from './active-learning-engine.js';

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export { default } from './active-learning-engine.js';
