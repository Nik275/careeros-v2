/**
 * @fileoverview Decision Authority - Core Type Definitions
 * @module @/intelligence/decision/DecisionTypes
 * 
 * Constitutional Decision Architecture for CareerOS.
 * 
 * This module defines the unified type system for all decision operations
 * in CareerOS. Following constitutional principles, all decisions must
 * flow through the Decision Authority.
 * 
 * @version 1.0.0
 * @author CareerOS Constitutional Architecture Team
 * @since Wave 2.1 - Decision Authority Infrastructure
 */

import type { Confidence } from '../confidence';

// ============================================================================
// CORE DECISION TYPES
// ============================================================================

/**
 * Unique identifier for a decision.
 * Format: decision-<timestamp>-<random>
 */
export type DecisionId = string;

/**
 * Decision type categorization.
 */
export type DecisionType =
  | 'career-selection'
  | 'path-selection'
  | 'recommendation-ranking'
  | 'stakeholder-arbitration'
  | 'option-comparison'
  | 'conflict-resolution'
  | 'tradeoff-resolution'
  | 'reversibility-assessment'
  | 'timing-optimization'
  | 'quality-validation';

/**
 * Decision status lifecycle.
 */
export type DecisionStatus =
  | 'pending'      // Awaiting processing
  | 'ranking'      // Being ranked
  | 'comparing'    // Being compared
  | 'arbitrating'  // Conflict resolution in progress
  | 'selecting'    // Final selection in progress
  | 'completed'    // Decision finalized
  | 'rejected'     // Decision rejected/invalid
  | 'appealed';    // Under appeal/review

/**
 * Priority levels for decisions.
 * Higher numbers = higher priority.
 */
export type DecisionPriority = 1 | 2 | 3 | 4 | 5;

/**
 * Decision confidence level.
 * Uses constitutional Confidence type (0.0-1.0).
 */
export type DecisionConfidence = Confidence;

// ============================================================================
// DECISION INPUT/OUTPUT TYPES
// ============================================================================

/**
 * A candidate option for decision-making.
 * Generic to support any decision domain.
 */
export interface DecisionOption<T = unknown> {
  /** Unique identifier */
  readonly id: string;
  
  /** Option type */
  readonly type: string;
  
  /** Option payload/data */
  readonly data: T;
  
  /** Option metadata */
  readonly metadata?: DecisionOptionMetadata;
  
  /** Source system that created this option */
  readonly source: string;
  
  /** Timestamp when option was created */
  readonly createdAt: Date;
}

/**
 * Metadata for decision options.
 */
export interface DecisionOptionMetadata {
  /** Human-readable label */
  readonly label?: string;
  
  /** Description */
  readonly description?: string;
  
  /** Tags for categorization */
  readonly tags?: string[];
  
  /** Original confidence from source */
  readonly sourceConfidence?: DecisionConfidence;
  
  /** Stakeholder weights (if applicable) */
  readonly stakeholderWeights?: Record<string, number>;
  
  /** Arbitrary additional properties */
  readonly [key: string]: unknown;
}

/**
 * Input to the Decision Authority.
 */
export interface DecisionInput<T = unknown> {
  /** Decision type */
  readonly type: DecisionType;
  
  /** Decision context */
  readonly context: DecisionContext;
  
  /** Options to decide between */
  readonly options: ReadonlyArray<DecisionOption<T>>;
  
  /** Constraints to apply */
  readonly constraints?: DecisionConstraints;
  
  /** Configuration overrides */
  readonly config?: Partial<DecisionConfig>;
}

/**
 * Output from the Decision Authority.
 */
export interface DecisionOutput<T = unknown> {
  /** Unique decision ID */
  readonly decisionId: DecisionId;
  
  /** Decision type */
  readonly type: DecisionType;
  
  /** Final status */
  readonly status: DecisionStatus;
  
  /** Selected winning option */
  readonly winner?: DecisionOption<T>;
  
  /** All options with rankings */
  readonly rankedOptions: ReadonlyArray<RankedDecisionOption<T>>;
  
  /** Comparison results */
  readonly comparisons?: ReadonlyArray<DecisionComparisonResult>;
  
  /** Arbitration results (if applicable) */
  readonly arbitration?: ArbitrationResult;
  
  /** Decision confidence */
  readonly confidence: DecisionConfidence;
  
  /** Decision explanation */
  readonly explanation: DecisionExplanation;
  
  /** Audit trail */
  readonly audit: DecisionAudit;
  
  /** Timestamp */
  readonly timestamp: Date;
}

/**
 * Ranked decision option with score.
 */
export interface RankedDecisionOption<T = unknown> extends DecisionOption<T> {
  /** Rank (1 = best) */
  readonly rank: number;
  
  /** Raw score */
  readonly score: number;
  
  /** Normalized score (0-1) */
  readonly normalizedScore: number;
  
  /** Score breakdown */
  readonly scoreBreakdown?: ScoreBreakdown;
  
  /** Why this ranking */
  readonly rankingRationale?: string;
}

/**
 * Score breakdown components.
 */
export interface ScoreBreakdown {
  /** Base score from evaluation */
  readonly baseScore: number;
  
  /** Confidence adjustment */
  readonly confidenceAdjustment: number;
  
  /** Constraint penalties */
  readonly constraintPenalty: number;
  
  /** Stakeholder weighting */
  readonly stakeholderWeighting: number;
  
  /** Final score */
  readonly finalScore: number;
}

// ============================================================================
// CONTEXT & CONSTRAINTS
// ============================================================================

/**
 * Decision context information.
 */
export interface DecisionContext {
  /** Student/user ID */
  readonly studentId: string;
  
  /** Session ID */
  readonly sessionId: string;
  
  /** Decision timestamp */
  readonly timestamp: Date;
  
  /** Student profile at decision time */
  readonly profileSnapshot?: unknown;
  
  /** Assessment results */
  readonly assessmentResults?: unknown;
  
  /** Knowledge graph state */
  readonly knowledgeGraphState?: unknown;
  
  /** Previous decisions in this session */
  readonly sessionHistory?: ReadonlyArray<DecisionId>;
  
  /** Arbitrary context data */
  readonly [key: string]: unknown;
}

/**
 * Decision constraints.
 */
export interface DecisionConstraints {
  /** Minimum confidence threshold */
  readonly minConfidence?: DecisionConfidence;
  
  /** Maximum number of options to consider */
  readonly maxOptions?: number;
  
  /** Required option types */
  readonly requiredTypes?: string[];
  
  /** Excluded option IDs */
  readonly excludedIds?: string[];
  
  /** Time limit for decision (ms) */
  readonly timeLimit?: number;
  
  /** Custom constraint functions */
  readonly customConstraints?: ReadonlyArray<DecisionConstraint>;
}

/**
 * Custom constraint function.
 */
export type DecisionConstraint = (option: DecisionOption) => boolean | Promise<boolean>;

// ============================================================================
// RANKING TYPES
// ============================================================================

/**
 * Ranking algorithm type.
 */
export type RankingAlgorithm =
  | 'score-based'
  | 'confidence-weighted'
  | 'stakeholder-weighted'
  | 'multi-criteria'
  | 'utility-maximization'
  | 'pareto-optimal'
  | 'custom';

/**
 * Ranking configuration.
 */
export interface RankingConfig {
  /** Algorithm to use */
  readonly algorithm: RankingAlgorithm;
  
  /** Weights for multi-criteria */
  readonly criteriaWeights?: Record<string, number>;
  
  /** Tie-breaking strategy */
  readonly tieBreaker: 'first' | 'last' | 'random' | 'confidence' | 'timestamp';
  
  /** Whether to allow ties */
  readonly allowTies: boolean;
  
  /** Custom ranking function (if algorithm = 'custom') */
  readonly customRanker?: CustomRanker;
}

/**
 * Custom ranker function type.
 */
export type CustomRanker = <T>(
  options: ReadonlyArray<DecisionOption<T>>,
  context: DecisionContext
) => Promise<ReadonlyArray<RankedDecisionOption<T>>>;

/**
 * Ranking result.
 */
export interface RankingResult<T = unknown> {
  /** Ranked options */
  readonly rankedOptions: ReadonlyArray<RankedDecisionOption<T>>;
  
  /** Algorithm used */
  readonly algorithm: RankingAlgorithm;
  
  /** Time taken */
  readonly duration: number;
  
  /** Number of ties (if any) */
  readonly tieCount: number;
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

/**
 * Comparison method.
 */
export type ComparisonMethod =
  | 'pairwise'
  | 'tournament'
  | 'elo'
  | 'bradley-terry'
  | 'dominance'
  | 'custom';

/**
 * Comparison configuration.
 */
export interface ComparisonConfig {
  /** Method to use */
  readonly method: ComparisonMethod;
  
  /** Whether comparisons are transitive */
  readonly transitive: boolean;
  
  /** Custom comparison function (if method = 'custom') */
  readonly customComparator?: CustomComparator;
}

/**
 * Custom comparator function type.
 */
export type CustomComparator = <T>(
  a: DecisionOption<T>,
  b: DecisionOption<T>,
  context: DecisionContext
) => Promise<ComparisonOutcome>;

/**
 * Comparison outcome.
 */
export type ComparisonOutcome =
  | 'a-better'
  | 'b-better'
  | 'equivalent'
  | 'incomparable';

/**
 * Decision comparison result.
 */
export interface DecisionComparisonResult {
  /** Option A */
  readonly optionA: { id: string; score: number };
  
  /** Option B */
  readonly optionB: { id: string; score: number };
  
  /** Outcome */
  readonly outcome: ComparisonOutcome;
  
  /** Confidence in comparison */
  readonly confidence: DecisionConfidence;
  
  /** Rationale */
  readonly rationale: string;
}

// ============================================================================
// ARBITRATION TYPES
// ============================================================================

/**
 * Arbitration strategy.
 */
export type ArbitrationStrategy =
  | 'stakeholder-vote'
  | 'weighted-average'
  | 'pareto-optimality'
  | 'nash-bargaining'
  | 'fair-division'
  | 'authority-decides'
  | 'custom';

/**
 * Arbitration configuration.
 */
export interface ArbitrationConfig {
  /** Strategy to use */
  readonly strategy: ArbitrationStrategy;
  
  /** Stakeholder weights (if applicable) */
  readonly stakeholderWeights?: Record<string, number>;
  
  /** Whether to require consensus */
  readonly requireConsensus: boolean;
  
  /** Consensus threshold (0-1) */
  readonly consensusThreshold?: DecisionConfidence;
  
  /** Custom arbitration function (if strategy = 'custom') */
  readonly customArbitrator?: CustomArbitrator;
}

/**
 * Custom arbitrator function type.
 */
export type CustomArbitrator = <T>(
  options: ReadonlyArray<DecisionOption<T>>,
  conflicts: ReadonlyArray<Conflict>,
  context: DecisionContext
) => Promise<ArbitrationResult<T>>;

/**
 * Conflict definition.
 */
export interface Conflict {
  /** Conflict type */
  readonly type: string;
  
  /** Conflicting options */
  readonly optionIds: string[];
  
  /** Stakeholders involved */
  readonly stakeholderIds?: string[];
  
  /** Conflict severity (0-1) */
  readonly severity: number;
  
  /** Description */
  readonly description: string;
}

/**
 * Arbitration result.
 */
export interface ArbitrationResult<T = unknown> {
  /** Resolved winning option */
  readonly winner?: DecisionOption<T>;
  
  /** Resolution strategy used */
  readonly strategy: ArbitrationStrategy;
  
  /** Conflicts resolved */
  readonly resolvedConflicts: ReadonlyArray<Conflict>;
  
  /** Conflicts remaining (if any) */
  readonly remainingConflicts: ReadonlyArray<Conflict>;
  
  /** Stakeholder satisfaction scores */
  readonly stakeholderSatisfaction?: Record<string, number>;
  
  /** Rationale */
  readonly rationale: string;
}

// ============================================================================
// SELECTION TYPES
// ============================================================================

/**
 * Selection strategy.
 */
export type SelectionStrategy =
  | 'top-ranked'
  | 'threshold'
  | 'confidence-gated'
  | 'multi-select'
  | 'custom';

/**
 * Selection configuration.
 */
export interface SelectionConfig {
  /** Strategy to use */
  readonly strategy: SelectionStrategy;
  
  /** Number of winners to select (if multi-select) */
  readonly winnerCount?: number;
  
  /** Minimum score threshold */
  readonly minScore?: number;
  
  /** Minimum confidence threshold */
  readonly minConfidence?: DecisionConfidence;
  
  /** Custom selector (if strategy = 'custom') */
  readonly customSelector?: CustomSelector;
}

/**
 * Custom selector function type.
 */
export type CustomSelector = <T>(
  rankedOptions: ReadonlyArray<RankedDecisionOption<T>>,
  context: DecisionContext
) => Promise<ReadonlyArray<DecisionOption<T>>>;

/**
 * Selection result.
 */
export interface SelectionResult<T = unknown> {
  /** Selected winner(s) */
  readonly winners: ReadonlyArray<DecisionOption<T>>;
  
  /** Strategy used */
  readonly strategy: SelectionStrategy;
  
  /** Whether selection was successful */
  readonly success: boolean;
  
  /** Reason if unsuccessful */
  readonly failureReason?: string;
}

// ============================================================================
// EXPLANATION TYPES
// ============================================================================

/**
 * Explanation detail level.
 */
export type ExplanationLevel = 'minimal' | 'standard' | 'detailed' | 'technical';

/**
 * Explanation configuration.
 */
export interface ExplanationConfig {
  /** Detail level */
  readonly level: ExplanationLevel;
  
  /** Include score breakdowns */
  readonly includeScores: boolean;
  
  /** Include comparison details */
  readonly includeComparisons: boolean;
  
  /** Include arbitration details */
  readonly includeArbitration: boolean;
  
  /** Include alternative options */
  readonly includeAlternatives: boolean;
  
  /** Maximum length */
  readonly maxLength?: number;
}

/**
 * Decision explanation.
 */
export interface DecisionExplanation {
  /** Summary */
  readonly summary: string;
  
  /** Detailed explanation */
  readonly details: string;
  
  /** Key factors */
  readonly keyFactors: ReadonlyArray<string>;
  
  /** Why winner was selected */
  readonly winnerRationale: string;
  
  /** Why other options were rejected */
  readonly rejectionRationale?: Record<string, string>;
  
  /** Alternative options considered */
  readonly alternatives?: ReadonlyArray<{ id: string; reason: string }>;
  
  /** Confidence explanation */
  readonly confidenceExplanation: string;
  
  /** Explanation level used */
  readonly level: ExplanationLevel;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

/**
 * Decision audit record.
 */
export interface DecisionAudit {
  /** Decision ID */
  readonly decisionId: DecisionId;
  
  /** Timestamp */
  readonly timestamp: Date;
  
  /** Authority version */
  readonly authorityVersion: string;
  
  /** Processing steps */
  readonly steps: ReadonlyArray<AuditStep>;
  
  /** Inputs hash */
  readonly inputHash: string;
  
  /** Configuration used */
  readonly config: DecisionConfig;
  
  /** Trace ID for distributed tracing */
  readonly traceId: string;
}

/**
 * Audit step record.
 */
export interface AuditStep {
  /** Step name */
  readonly step: 'ranking' | 'comparison' | 'arbitration' | 'selection' | 'explanation';
  
  /** Timestamp */
  readonly timestamp: Date;
  
  /** Duration */
  readonly duration: number;
  
  /** Inputs */
  readonly inputs: unknown;
  
  /** Outputs */
  readonly outputs: unknown;
  
  /** Module version */
  readonly moduleVersion: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Decision Authority configuration.
 */
export interface DecisionConfig {
  /** Ranking configuration */
  readonly ranking: RankingConfig;
  
  /** Comparison configuration */
  readonly comparison: ComparisonConfig;
  
  /** Arbitration configuration */
  readonly arbitration: ArbitrationConfig;
  
  /** Selection configuration */
  readonly selection: SelectionConfig;
  
  /** Explanation configuration */
  readonly explanation: ExplanationConfig;
  
  /** Whether to enable monitoring */
  readonly enableMonitoring: boolean;
  
  /** Whether to enable audit logging */
  readonly enableAudit: boolean;
  
  /** Debug mode */
  readonly debug: boolean;
}

/**
 * Default configuration.
 */
export const DEFAULT_DECISION_CONFIG: DecisionConfig = {
  ranking: {
    algorithm: 'score-based',
    tieBreaker: 'confidence',
    allowTies: false,
  },
  comparison: {
    method: 'pairwise',
    transitive: true,
  },
  arbitration: {
    strategy: 'authority-decides',
    requireConsensus: false,
  },
  selection: {
    strategy: 'top-ranked',
  },
  explanation: {
    level: 'standard',
    includeScores: true,
    includeComparisons: false,
    includeArbitration: false,
    includeAlternatives: true,
  },
  enableMonitoring: true,
  enableAudit: true,
  debug: false,
};

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Decision event types.
 */
export type DecisionEventType =
  | 'decision-created'
  | 'decision-ranking-started'
  | 'decision-ranking-completed'
  | 'decision-comparison-started'
  | 'decision-comparison-completed'
  | 'decision-arbitration-started'
  | 'decision-arbitration-completed'
  | 'decision-selection-started'
  | 'decision-selection-completed'
  | 'decision-explanation-generated'
  | 'decision-completed'
  | 'decision-rejected'
  | 'decision-appealed'
  | 'decision-error';

/**
 * Decision event.
 */
export interface DecisionEvent {
  /** Event type */
  readonly type: DecisionEventType;
  
  /** Decision ID */
  readonly decisionId: DecisionId;
  
  /** Timestamp */
  readonly timestamp: Date;
  
  /** Event payload */
  readonly payload: unknown;
  
  /** Trace ID */
  readonly traceId: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Decision error types.
 */
export type DecisionErrorType =
  | 'invalid-input'
  | 'empty-options'
  | 'constraint-violation'
  | 'ranking-error'
  | 'comparison-error'
  | 'arbitration-error'
  | 'selection-error'
  | 'explanation-error'
  | 'timeout'
  | 'internal-error';

/**
 * Decision error.
 */
export class DecisionError extends Error {
  constructor(
    public readonly type: DecisionErrorType,
    message: string,
    public readonly decisionId?: DecisionId,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DecisionError';
  }
}

// ============================================================================
// METRIC TYPES
// ============================================================================

/**
 * Decision metrics.
 */
export interface DecisionMetrics {
  /** Total decisions processed */
  readonly totalDecisions: number;
  
  /** Decisions by type */
  readonly decisionsByType: Record<DecisionType, number>;
  
  /** Decisions by status */
  readonly decisionsByStatus: Record<DecisionStatus, number>;
  
  /** Average processing time */
  readonly avgProcessingTime: number;
  
  /** Average confidence */
  readonly avgConfidence: DecisionConfidence;
  
  /** Error rate */
  readonly errorRate: number;
  
  /** Appeals rate */
  readonly appealsRate: number;
}

// ============================================================================
// VALIDATION GUARDS
// ============================================================================

/**
 * Validates a decision option.
 */
export function isValidDecisionOption(option: unknown): option is DecisionOption {
  if (typeof option !== 'object' || option === null) return false;
  const opt = option as DecisionOption;
  return (
    typeof opt.id === 'string' &&
    typeof opt.type === 'string' &&
    opt.data !== undefined &&
    typeof opt.source === 'string' &&
    opt.createdAt instanceof Date
  );
}

/**
 * Validates decision confidence.
 */
export function isValidDecisionConfidence(confidence: unknown): confidence is DecisionConfidence {
  return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
}

/**
 * Validates decision input.
 */
export function isValidDecisionInput(input: unknown): input is DecisionInput {
  if (typeof input !== 'object' || input === null) return false;
  const inp = input as DecisionInput;
  return (
    typeof inp.type === 'string' &&
    typeof inp.context === 'object' &&
    Array.isArray(inp.options) &&
    inp.options.every(isValidDecisionOption)
  );
}

// ============================================================================
// VERSION
// ============================================================================

/**
 * Decision Authority version.
 */
export const DECISION_AUTHORITY_VERSION = '1.0.0';

/**
 * Decision Authority name.
 */
export const DECISION_AUTHORITY_NAME = 'CareerOS Decision Authority';
