/**
 * @fileoverview Decision Authority - Module Exports
 * @module @/intelligence/decision
 * 
 * The Constitutional Decision Authority for CareerOS.
 * 
 * This module provides the SOLE sanctioned interface for decision-making
 * in CareerOS. All decisions MUST flow through the Decision Authority.
 * 
 * @example
 * ```typescript
 * import { createDecisionAuthority, DecisionTypes } from '@/intelligence/decision';
 * 
 * const authority = createDecisionAuthority();
 * 
 * const result = await authority.decide({
 *   type: 'career-selection',
 *   context: { studentId: 'stu-123', sessionId: 'sess-456', timestamp: new Date() },
 *   options: [
 *     { id: 'career-1', type: 'career', data: { name: 'Software Engineer' }, source: 'knowledge-graph', createdAt: new Date() },
 *     { id: 'career-2', type: 'career', data: { name: 'Product Manager' }, source: 'knowledge-graph', createdAt: new Date() },
 *   ],
 * });
 * 
 * console.log(`Winner: ${result.winner?.data.name}`);
 * console.log(`Explanation: ${result.explanation.summary}`);
 * ```
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

// ============================================================================
// CORE AUTHORITY
// ============================================================================

export {
  DecisionAuthority,
  createDecisionAuthority,
  defaultDecisionAuthority,
} from './DecisionAuthority';

export type { IDecisionAuthority } from './IDecisionAuthority';

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Core Types
  DecisionId,
  DecisionType,
  DecisionStatus,
  DecisionPriority,
  DecisionConfidence,
  
  // Input/Output Types
  DecisionOption,
  DecisionOptionMetadata,
  DecisionInput,
  DecisionOutput,
  RankedDecisionOption,
  ScoreBreakdown,
  
  // Context & Constraints
  DecisionContext,
  DecisionConstraints,
  DecisionConstraint,
  
  // Ranking Types
  RankingAlgorithm,
  RankingConfig,
  CustomRanker,
  RankingResult,
  
  // Comparison Types
  ComparisonMethod,
  ComparisonConfig,
  CustomComparator,
  ComparisonOutcome,
  DecisionComparisonResult,
  
  // Arbitration Types
  ArbitrationStrategy,
  ArbitrationConfig,
  CustomArbitrator,
  Conflict,
  ArbitrationResult,
  
  // Selection Types
  SelectionStrategy,
  SelectionConfig,
  CustomSelector,
  SelectionResult,
  
  // Explanation Types
  ExplanationLevel,
  ExplanationConfig,
  DecisionExplanation,
  
  // Audit Types
  DecisionAudit,
  AuditStep,
  
  // Configuration
  DecisionConfig,
  
  // Event Types
  DecisionEvent,
  DecisionEventType,
  
  // Error Types
  DecisionError,
  DecisionErrorType,
  
  // Metric Types
  DecisionMetrics,
} from './DecisionTypes';

export {
  DEFAULT_DECISION_CONFIG,
  DECISION_AUTHORITY_VERSION,
  DECISION_AUTHORITY_NAME,
  isValidDecisionOption,
  isValidDecisionConfidence,
  isValidDecisionInput,
} from './DecisionTypes';

// ============================================================================
// MODULES
// ============================================================================

// Ranker
export {
  DecisionRanker,
  createDecisionRanker,
  defaultDecisionRanker,
  DEFAULT_RANKER_CONFIG,
} from './DecisionRanker';

export type { IDecisionRanker, DecisionRankerConfig } from './DecisionRanker';

// Comparator
export {
  DecisionComparator,
  createDecisionComparator,
  defaultDecisionComparator,
  DEFAULT_COMPARATOR_CONFIG,
} from './DecisionComparator';

export type { IDecisionComparator, DecisionComparatorConfig } from './DecisionComparator';

// Arbitrator
export {
  DecisionArbitrator,
  createDecisionArbitrator,
  defaultDecisionArbitrator,
  DEFAULT_ARBITRATOR_CONFIG,
} from './DecisionArbitrator';

export type { IDecisionArbitrator, DecisionArbitratorConfig } from './DecisionArbitrator';

// Selector
export {
  DecisionSelector,
  createDecisionSelector,
  defaultDecisionSelector,
  DEFAULT_SELECTOR_CONFIG,
} from './DecisionSelector';

export type { IDecisionSelector, DecisionSelectorConfig } from './DecisionSelector';

// Explainer
export {
  DecisionExplainer,
  createDecisionExplainer,
  defaultDecisionExplainer,
  DEFAULT_EXPLAINER_CONFIG,
} from './DecisionExplainer';

export type { IDecisionExplainer, DecisionExplainerConfig } from './DecisionExplainer';

// History
export {
  InMemoryDecisionHistory,
  createDecisionHistory,
  defaultDecisionHistory,
} from './DecisionHistory';

export type { IDecisionHistory } from './DecisionHistory';

// Events
export {
  DecisionEvents,
  createDecisionEvents,
  defaultDecisionEvents,
  emitDecisionLifecycleEvents,
} from './DecisionEvents';

export type { IDecisionEvents, DecisionEventHandler } from './DecisionEvents';

// Audit
export {
  DecisionAuditor,
  createDecisionAuditor,
  defaultDecisionAuditor,
} from './DecisionAudit';

export type { IDecisionAudit } from './DecisionAudit';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum options per decision.
 */
export const MAX_OPTIONS_PER_DECISION = 1000;

/**
 * Default timeout for decisions (ms).
 */
export const DEFAULT_DECISION_TIMEOUT = 30000;

/**
 * Maximum explanation length.
 */
export const MAX_EXPLANATION_LENGTH = 5000;

// ============================================================================
// VERSION
// ============================================================================

/**
 * Decision Authority version.
 */
export const VERSION = '1.0.0';

/**
 * Decision Authority name.
 */
export const AUTHORITY_NAME = 'CareerOS Decision Authority';

// ============================================================================
// CONSTITUTIONAL NOTICE
// ============================================================================

/**
 * ⚠️ CONSTITUTIONAL NOTICE ⚠️
 * 
 * The Decision Authority is the SOLE owner of decision-making in CareerOS.
 * 
 * NO other system may:
 * - Rank options
 * - Compare options
 * - Arbitrate conflicts
 * - Select winners
 * - Generate explanations
 * 
 * All decision-making MUST flow through the Decision Authority.
 * 
 * Violations of this principle constitute constitutional violations.
 */
